const Room = require('./room');
const getNonce = require('./nonce');

module.exports = class RoomsUtility {
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

	roomsListJSON(userUtil) {
		let retJSON = [];
		this.rooms.forEach((room) => {
			retJSON.push(room.toJSON(userUtil));
		});
		return retJSON;
	}

	createRoom(name, capacity, owner, pw) {
		let newRoom = new Room(getNonce(), name, capacity, owner, pw);
		this.rooms.push(newRoom);
		return newRoom;
	}
};
