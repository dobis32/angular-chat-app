const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const crypto = require('crypto');
const app = express();
const server = http.createServer(app);
const io = socketio(server);
const getNonce = function() {
	return crypto.randomBytes(16).toString('base64')
}
// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

const botName = 'ChatCord Bot';
let user1 = { name: 'Denny Dingus', id: getNonce() }
let user2 = { name: 'Hugh Jass', id: getNonce() }
let mockChatHistory = [
	{
		user: user1.name,
		dateString: new Date().toDateString(),
		text: 'Hi there'
	},
	{
		user: user2.name,
		dateString: new Date().toDateString(),
		text: 'Hello, Denny'
	}
];

let mockRoomsList = [
	{
		id: getNonce(),
		name: 'room 1',
		capacity: 6,
		password: 'pw',
		users: [ user1, user2 ]
	}, 
	{
		id: getNonce(),
		name: 'room 2',
		capacity: 4,
		password: '',
		users: []
	}
];

// Run when client connects
io.on('connection', (socket) => {
	console.log('new user connected');
	socket.on('joinRoom', ({ username, room }) => {
		socket.join(room);
	});

	// Listen for message
	socket.on('message', (message) => {
		console.log(message);
		socket.emit('messageReceived', message);
		socket.broadcast.emit('incomingMessage', message);
	});

	// Runs when client disconnects
	socket.on('disconnect', () => {
		console.log('user disconnected');
	});

	socket.emit('init', {
		msg: 'hello from the server',
		// messages: mockChatHistory,
		rooms: mockRoomsList
	});
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
