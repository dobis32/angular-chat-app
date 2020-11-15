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
	usersMap;
	constructor(usersListData) {
		this.usersMap = {};
		usersListData.forEach((name) => {
			let user = new User(name);
			this.usersMap[user.id] = user;
		});
	}

	getUserByID(id) {
		return this.usersMap[id];
	}
}

class User {
	id;
	name;
	constructor(name) {
		this.id = name == denny ? dennyID : getNonce();
		this.name = name;
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

	isFull = function() {
		return this.users.length == this.capacity ? true : false;
	};

	isPrivate = function() {
		return this.password.length ? true : false;
	};

	joinUser = function(userID) {
		this.users.push(userID);
	};

	removeUser = function(userID) {
		let temp = [];
		this.users.forEach((user) => {
			if (user.getID() != userID) temp.push(user);
		});
		this.users = temp;
	};

	toJSON = function() {
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
	};
}

// const botName = 'ChatCord Bot';
// let userData1 = { name: 'Denny Dingus', id: getNonce() };
// let userData2 = { name: 'Hugh Jass', id: getNonce() };
// let mockChatHistory = [
// 	{
// 		user: user1.name,
// 		dateString: new Date().toDateString(),
// 		text: 'Hi there'
// 	},
// 	{
// 		user: user2.name,
// 		dateString: new Date().toDateString(),
// 		text: 'Hello, Denny'
// 	}
// ];

let usersList = [ denny, 'Hugh Jass' ];

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
		console.log(`JOIN ROOM: userID ${user} & roomID ${room}`);
		let roomInstance = roomsUtility.getRoomByID(room);
		let userInstance = usersUtility.getUserByID(user);
		console.log('ROOM INSTANCE', roomInstance, 'USER INSTANCE', userInstance);
		if (!roomInstance || roomInstance.isFull()) {
			// room exists and isn't full and user exists
			roomInstance.joinUser(user);
			socket.emit('join', { room });
		} else {
			socket.join(room);
			socket.to(room).emit('user', { user: userInstance.toJSON() });
			socket.emit('join', { room: room });
		}
	});

	socket.on('leave', ({ user, room }) => {
		let roomInstance = roomsUtility.getRoomByID(room);
		roomInstance.removeUser(user);
		console.log('user', user, 'has left:', roomInstance.users);
		socket.emit('join', { leave: true });
	});

	// Listen for message
	socket.on('message', ({ user, message }) => {
		// console.log(message);
		socket.to(user.room).emit('incomingMessage', message);
		socket.emit('messageReceived', message);
	});

	// Runs when client disconnects
	socket.on('disconnect', () => {
		console.log('user disconnected');
	});
	let devUser = usersUtility.getUserByID(dennyID);
	socket.emit('init', {
		msg: 'hello from the server',
		// messages: mockChatHistory,
		rooms: roomsUtility.roomsListJSON(),
		devUserJSON: devUser.toJSON()
	});
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
