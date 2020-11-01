const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');

let Mockmessages;

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

const botName = 'ChatCord Bot';

let mockChatHistory = [
	{
		user: 'Denny Dingus',
		dateString: new Date().toDateString(),
		text: 'Hi there'
	},
	{
		user: 'Hugh Jass',
		dateString: new Date().toDateString(),
		text: 'Hello, Denny'
	}
];

// Run when client connects
io.on('connection', (socket) => {
	console.log('new user connected');
	socket.on('joinRoom', ({ username, room }) => {});

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
		messages: mockChatHistory
	});
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
