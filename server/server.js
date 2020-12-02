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

const denny = 'Denny Dingus';
const dennyID = 'dennyID';
class RoomsUtility {
	rooms;
	constructor(roomsListData) {
		this.rooms = [];
		roomsListData.forEach((data) => {
			let { id, name, capacity, password, users } = data;

			this.rooms.push(new Room(id, name, capacity, password, users));
		});
	}

	getRoomByIndex(index) {
		if (index > this.rooms.length - 1) return undefined;
		else {
			return this.rooms[index];
		}
	}

	getRoomByID(id) {
		return this.rooms.find((rm) => rm.id == id);
	}

	roomsListJSON() {
		let retJSON = [];
		this.rooms.forEach((room) => {
			retJSON.push(room.toJSON());
		});
		return retJSON;
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
		this.id = name == denny ? dennyID : getNonce();
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

	constructor(id, name, capacity, password = '', users = []) {
		this.id = id;
		this.name = name;
		this.capacity = capacity;
		this.password = password;
		this.users = users;
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
		this.users.push(userID);
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
			capacity: this.capacity,
			password: this.password,
			users: userJSONData
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
		users: []
	},
	{
		id: getNonce(),
		name: 'room 2',
		capacity: 4,
		password: '',
		users: []
	}
];

let usersUtility = new UsersUtility(usersList);

let roomsUtility = new RoomsUtility(roomsList);

// Run when client connects
io.on('connection', (socket) => {
	console.log('new user connected');

	socket.on('join', ({ user, room }) => {
		if (user && room) {
			console.log(`USER [${user}] JOINING ROOM [${room}]`);
			let roomInstance = roomsUtility.getRoomByID(room);
			let userInstance = usersUtility.getUserByID(user);
			if (!roomInstance || roomInstance.isFull() || !userInstance) {
				// room is full/doesn't exist or user doesn't exist
				socket.emit('notify', { notification: 'error', message: 'Failed to join room' });
			} else {
				roomInstance.joinUser(user);
				socket.join(room);
				socket.to(room).emit('notify', { notification: 'join', user: userInstance.getName() });
				io.emit('roomsUpdate', roomsUtility.roomsListJSON());
				socket.emit('join', { id: roomInstance.getID() });
			}
		}
	});

	socket.on('leave', ({ user, room }) => {
		if ((user, room)) {
			console.log(`USER [${user}] LEAVING ROOM [${room}]`);
			let roomInstance = roomsUtility.getRoomByID(room);
			let userInstance = usersUtility.getUserByID(user);
			roomInstance.removeUser(user);
			socket.leave(room);
			socket.emit('join', { id: undefined });
			socket.to(room).emit('notify', { notification: 'leave', user: userInstance.getName() });
			io.emit('roomsUpdate', roomsUtility.roomsListJSON());
		}
	});

	socket.on('login', (data) => {
		console.log('login event', data);
		let { username, password } = data;
		let user = usersUtility.loginUser(username, password);
		if (user) socket.emit('login', { ...user.toJSON() });
		else socket.emit('login', { failed: true });
	});

	// Listen for message
	socket.on('message', (data) => {
		console.log('Incoming message', data);
		let { user, date, text, room } = data;
		// let userInstance
		socket.to(room).emit('message', { user, date, text });
		socket.emit('message', { user, date, text });
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
