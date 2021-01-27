const RoomsUtility = require('./src/room.util');
const UsersUtility = require('./src/user.util');
const ComsUtility = require('./src/coms.util');

const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketio(server);
const getNonce = require('./src/nonce');

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

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
let comsUtility = new ComsUtility();

// Run when client connects
io.on('connection', (socket) => {
	console.log('new user connected');

	socket.on('join', ({ user, room }) => {
		try {
			let roomInstance = roomsUtility.getRoomByID(room);
			let userInstance = usersUtility.getUserByID(user);

			if (!roomInstance || roomInstance.isFull() || !userInstance)
				throw new Error('Room is full or does not exist');

			if (!roomInstance.joinUser(user)) throw new Error('Room is full');

			let roomsListData = roomsUtility.roomsListJSON(usersUtility);

			socket.join(room);
			comsUtility.userJoinedRoom(io, socket, userInstance.getName(), roomInstance.getID(), roomsListData);
		} catch (error) {
			comsUtility.emitError(socket, error);
		}
	});

	socket.on('leave', ({ user, room }) => {
		try {
			let roomInstance = roomsUtility.getRoomByID(room);
			let userInstance = usersUtility.getUserByID(user);

			if (!roomInstance || !userInstance) throw new Error('Room or User does not exist');

			roomInstance.removeUser(user);
			socket.leave(room);
			let roomsListData = roomsUtility.roomsListJSON(usersUtility);

			comsUtility.userLeftRoom(io, socket, userInstance, roomInstance.getID(), roomsListData);
		} catch (error) {
			console.log(error);
			comsUtility.emitError(socket, error);
		}
	});

	socket.on('kick', ({ user, room }) => {
		try {
			let roomInstance = roomsUtility.getRoomByID(room);
			let userToKick = usersUtility.getUserByID(user);

			if (!roomInstance || !userToKick) throw new Error('Room or User does not exist');

			roomInstance.removeUser(user);

			let roomsListData = roomsUtility.roomsListJSON(usersUtility);
			comsUtility.userWasKicked(io, userToKick, roomInstance, roomsListData);
		} catch (error) {
			console.log(error);
			comsUtility.emitError(socket, error);
		}
	});

	socket.on('createRoom', ({ name, capacity, password, userID }) => {
		try {
			if (!password) password = '';

			let userInstance = usersUtility.getUserByID(user);
			if (!userInstance) throw new Error('Failed to verify user creating room.');

			let roomInstance = roomsUtility.createRoom(name, capacity, userID, password);
			if (!roomInstance) throw new Error('Failed to create instance of room.');

			roomInstance.joinUser(userID);
			socket.join(roomInstance.getID());

			let roomsListData = roomsUtility.roomsListJSON(usersUtility);

			comsUtility.userJoinedRoom(io, socket, userInstance.getName(), roomInstance.getID(), roomsListData);
		} catch (error) {
			console.log(error);
			comsUtility.emitError(socket, error);
		}
	});

	socket.on('currentRoomUpdate', ({ name, capacity, password, roomID, userID }) => {
		try {
			let roomInstance = roomsUtility.getRoomByID(roomID);
			let userInstance = usersUtility.getUserByID(userID);

			if (!roomInstance || !userInstance) throw new Error('Failed to find instance of room.');

			roomInstance.updateCredentials(name, capacity, password);

			let roomsListData = roomsUtility.roomsListJSON(usersUtility);
			comsUtility.roomsUpdateToAllUsers(io, roomsListData);
		} catch (error) {
			console.log(error);
			comsUtility.emitError(socket, error);
		}
	});

	socket.on('login', (data) => {
		let { username, password } = data;
		let user = usersUtility.loginUser(username, password);
		if (user) {
			user.setSocket(socket.id);
			comsUtility.successfulLogin(socket, user.toJSON());
		} else comsUtility.failedLogin(socket);
	});

	socket.on('logout', (userID) => {
		let user = usersUtility.getUserByID(userID);
		if (user) user.disconnect();
	});

	// Listen for message
	socket.on('message', (data) => {
		comsUtility.handleMessageEvent(socket, data);
	});

	// Runs when client disconnects
	socket.on('disconnect', () => {
		let user = usersUtility.getUserBySocket(socket.id);
		if (user) user.setSocket(undefined);
		console.log('user disconnected');
	});

	socket.emit('init', {
		msg: 'hello from the server',
		rooms: roomsUtility.roomsListJSON(usersUtility)
	});
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
