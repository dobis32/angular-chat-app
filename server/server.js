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

class RoomUtility {
	rooms;
	constructor(roomsListData) {
		this.rooms = [];
		roomsListData.forEach((data) => {
			this.rooms.push(new Room(data));
		});
	}

	getRoomByIndex(index) {
		if (index > this.rooms.length - 1) return undefined;
		else {
			return this.rooms[index];
		}
	}

	roomsListJSON() {
		let retJSON = [];
		this.rooms.forEach((room) => {
			retJSON.push(room.toJSON());
		});
		return retJSON;
	}
}

class User {
	id;
	name;
	constructor(name) {
		this.id = getNonce();
		this.name;
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

	joinUser = function({ id, name }) {
		let u = new User(name, id);
		this.users.push(user);
	};

	toJSON = function() {
		let userJSONData = [];
		this.users.forEach((user) => {
			userJSONData.push(user.toJSON());
		});
		return {
			id: this.id,
			name: this.name,
			capacity: this.capacity,
			password: this.password,
			users: userJSONData
		};
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

let roomsList = [
	{
		id: getNonce(),
		name: 'room 1',
		capacity: 6,
		password: 'pw',
		users: [ 'Denny Dingus', 'Hugh Jass' ]
	},
	{
		id: getNonce(),
		name: 'room 2',
		capacity: 4,
		password: '',
		users: []
	}
];

let roomUtility = new RoomUtility(roomsList);

// Run when client connects
io.on('connection', (socket) => {
	console.log('new user connected');
	socket.on('joinRoom', ({ username, room }) => {
		if (room.isFull(room)) socket.join(room);
	});
	console.log('ROOMS JSON', roomUtility.roomsListJSON());
	// Listen for message
	socket.on('message', ({ user, message }) => {
		console.log(message);
		socket.to(user.room).emit('incomingMessage', message);
		socket.emit('messageReceived', message);
	});

	// Runs when client disconnects
	socket.on('disconnect', () => {
		console.log('user disconnected');
	});

	socket.emit('init', {
		msg: 'hello from the server',
		// messages: mockChatHistory,
		rooms: roomUtility.roomsListJSON()
	});
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
