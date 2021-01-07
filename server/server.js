const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const crypto = require('crypto');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const getNonce = function() {
	return crypto.randomBytes(16).toString('base64');
};

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

const denny = 'denny';
const dennyID = 'dennyID';
class RoomsUtility {
	rooms;
	constructor(roomsListData) {
		this.rooms = [];
		roomsListData.forEach((data) => {
			let { id, name, capacity, owner, password, users, admins, bans } = data;

			this.rooms.push(new Room(id, name, capacity, owner, password, users, admins, bans));
		});
	}

	getRoomByIndex(index) {
		if (index > this.rooms.length - 1) return undefined;
		else {
			return this.rooms[index];
		}
	}

	getRoomByID(id) {
		return this.rooms.find((rm) => rm.getID() == id);
	}

	roomsListJSON() {
		let retJSON = [];
		this.rooms.forEach((room) => {
			retJSON.push(room.toJSON());
		});
		return retJSON;
	}

	createRoom(name, capacity, owner, pw) {
		let newRoom = new Room(getNonce(), name, capacity, owner, pw);
		this.rooms.push(newRoom);
		return newRoom;
	}
}

class UsersUtility {
	users;
	constructor(usersListData) {
		this.users = [];
		usersListData.forEach(({ name, password }) => {
			let user = new User(name, password);
			this.users.push(user);
		});
	}

	getUserByID(id) {
		return this.users.find((user) => user.getID() == id);
	}

	loginUser(username, password) {
		let user = this.users.find((user) => user.getName() == username && user.getPassword() == password);
		if (user) return user;
		else return false;
	}
}

class User {
	id;
	name;
	password;
	constructor(name, password) {
		this.id = name == 'denny' ? 'dennyID' : getNonce();
		this.name = name;
		this.password = password;
	}

	getName() {
		return this.name;
	}

	getPassword() {
		return this.password;
	}

	getID() {
		return this.id;
	}

	toJSON() {
		return { id: this.id, name: this.name };
	}
}

class Room {
	id;
	name;
	capacity;
	password;
	users;
	admins;
	bans;
	owner;

	constructor(id, name, capacity, owner, password = '', users = [], admins = [], bans = []) {
		this.id = id;
		this.name = name;
		this.capacity = capacity;
		this.owner = owner;
		this.password = password;
		this.users = users;
		this.admins = admins;
		this.bans = bans;
	}

	getID() {
		return this.id;
	}

	isFull() {
		return this.users.length == this.capacity ? true : false;
	}

	isPrivate() {
		return this.password.length ? true : false;
	}

	removeUser(idToRemove) {
		let temp = [];

		this.users.forEach((userID) => {
			if (userID != idToRemove) temp.push(userID);
		});
		this.users = temp;
	}

	joinUser(userID) {
		if (this.users.length < this.capacity) {
			this.users.push(userID);
			return true;
		} else {
			return false;
		}
	}

	toJSON() {
		let userJSONData = [];
		this.users.forEach((userID) => {
			let user = usersUtility.getUserByID(userID);
			if (user) userJSONData.push(user.toJSON());
			else console.log('ERROR user', userID, 'not found...');
		});
		let json = {
			id: this.id,
			name: this.name,
			owner: this.owner,
			capacity: this.capacity,
			password: this.password,
			users: userJSONData,
			admins: this.admins,
			bans: this.bans
		};
		return json;
	}
}

let usersList = [ { name: 'denny', password: 'red123' }, { name: 'hugh', password: 'blue456' } ];

let roomsList = [
	{
		id: getNonce(),
		name: 'room 1',
		capacity: 6,
		password: 'pw',
		users: [],
		admins: [],
		bans: [],
		owner: 'dennyID'
	},
	{
		id: getNonce(),
		name: 'room 2',
		capacity: 4,
		password: '',
		users: [],
		admins: [],
		bans: [],
		owner: 'dennyID'
	}
];

let usersUtility = new UsersUtility(usersList);

let roomsUtility = new RoomsUtility(roomsList);

// Run when client connects
io.on('connection', (socket) => {
	console.log('new user connected');

	socket.on('join', ({ user, room }) => {
		try {
			if (user && room) {
				let roomInstance = roomsUtility.getRoomByID(room);
				let userInstance = usersUtility.getUserByID(user);
				if (!roomInstance || roomInstance.isFull() || !userInstance)
					throw new Error('Room is full or does not exist');
				else {
					let result = roomInstance.joinUser(user);
					if (result) {
						let roomsListJSON = roomsUtility.roomsListJSON();
						socket.join(room);
						socket.to(room).emit('notify', { notification: 'join', user: userInstance.getName() });
						io.emit('roomsUpdate', roomsListJSON);
						socket.emit('currentRoomUpdate', { rooms: roomsListJSON, roomToJoin: roomInstance.getID() });
					} else throw new Error('Room is full');
				}
			}
		} catch (error) {
			socket.emit('notify', { notification: 'error', message: `Failed to join room: ${error.message}` });
		}
	});

	socket.on('leave', ({ user, room }) => {
		try {
			let roomInstance = roomsUtility.getRoomByID(room);
			let userInstance = usersUtility.getUserByID(user);
			if (!roomInstance || !userInstance) throw new Error('Room or User does not exist');

			roomInstance.removeUser(user);
			socket.leave(room);
			socket.emit('join', { id: undefined });
			socket.to(room).emit('notify', { notification: 'leave', user: userInstance.getName() });
			io.emit('roomsUpdate', roomsUtility.roomsListJSON());
		} catch (error) {
			socket.emit('notify', { notification: 'error', message: `Failed to leave room: ${error.message}` });
		}
	});

	socket.on('updateRoom', ({ name, capacity, password, userID }) => {
		try {
			console.log('update room', name, capacity, password, userID);
			if (!password) password = '';
			let roomInstance = roomsUtility.createRoom(name, capacity, userID, password);
			if (!roomInstance) throw new Error('Failed to create instance of room.');
			let result = roomInstance.joinUser(userID);
			let roomsListJSON = roomsUtility.roomsListJSON();

			if (result) {
				socket.join(roomInstance.getID());
				socket.emit('updateCurrentRoom', { rooms: roomsListJSON, roomToJoin: roomInstance.getID() });
			} else
				socket.emit('notify', {
					notification: 'error',
					message: 'Room was created, but could not be joined at this time. Try to join again...'
				});
			io.emit('roomsUpdate', roomsListJSON);
		} catch (error) {
			console.log(error);
			socket.emit('notify', { notification: 'error', message: `Failed to create room: ${error.message}` });
		}
	});

	socket.on('login', (data) => {
		let { username, password } = data;
		let user = usersUtility.loginUser(username, password);
		if (user) socket.emit('login', { ...user.toJSON() });
		else socket.emit('login', { failed: true });
	});

	socket.on('logout', (userID) => {});

	// Listen for message
	socket.on('message', (data) => {
		let { user, id, date, text, room } = data;
		// let userInstance
		socket.to(room).emit('message', { user, id, date, text });
		socket.emit('message', { user, id, date, text });
	});

	// Runs when client disconnects
	socket.on('disconnect', () => {
		console.log('user disconnected');
	});

	socket.emit('init', {
		msg: 'hello from the server',
		// messages: mockChatHistory,
		rooms: roomsUtility.roomsListJSON()
		// devUserJSON: usersUtility.getUserByID(dennyID).toJSON()
	});
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
