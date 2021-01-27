module.exports = class ComsUtility {
	constructor() {}

	emitError(socket, error) {
		socket.emit('notify', { notification: 'error', message: `Something failed: ${error.message}` });
	}

	emitJoinNotificationToRoom(socket, roomID, userName) {
		socket.to(roomID).emit('notify', { notification: 'join', user: userName });
	}

	emitKickNotificationToRoom(io, roomID, userName) {
		io.to(roomID).emit('notify', { notification: 'kick', user: userName });
	}

	roomsUpdateToAllUsers(io, roomsListJSON) {
		io.emit('roomsUpdate', roomsListJSON);
	}

	handleMessageEvent(socket, data) {
		let { user, id, date, text, room } = data;
		socket.to(room).emit('message', { user, id, date, text });
		socket.emit('message', { user, id, date, text });
	}

	userJoinedRoom(io, socket, userName, roomID, roomsListJSON) {
		this.emitJoinNotificationToRoom(socket, roomID, userName);
		this.grantJoinToUser(socket, roomID);
		this.roomsUpdateToAllUsers(io, roomsListJSON);
	}

	grantJoinToUser(socket, roomID) {
		socket.emit('join', { room: roomID });
	}

	kickUser(io, user, room, ban) {
		io.to(user.getSocket()).emit('kick', { roomName: room.getName(), ban });
	}

	resetCurrentRoomOfUser(io, user) {
		io.to(user.getSocket()).emit('join', {});
	}

	emitLeaveNotification(socket, roomID, userName) {
		socket.to(roomID).emit('notify', { notification: 'leave', user: userName });
	}

	userLeftRoom(io, socket, user, roomID, roomsListJSON) {
		this.resetCurrentRoomOfUser(io, user);
		this.emitLeaveNotification(socket, roomID, user.getName());
		this.roomsUpdateToAllUsers(io, roomsListJSON);
	}

	notifyError(socket, message) {
		socket.emit('notify', {
			notification: 'error',
			message
		});
	}

	successfulLogin(socket, userJSON) {
		socket.emit('login', { ...userJSON });
	}

	failedLogin(socket) {
		socket.emit('login', {});
	}

	userWasKicked(io, user, roomInstance, roomsListJSON) {
		this.kickUser(io, user, roomInstance);
		this.emitKickNotificationToRoom(io, roomInstance.getID(), user.getName());
		this.roomsUpdateToAllUsers(io, roomsListJSON);
	}
};
