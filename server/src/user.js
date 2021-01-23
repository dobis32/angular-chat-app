const getNonce = require('./nonce');

module.exports = class User {
	id;
	name;
	password;
	socket;
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

	setSocket(socketID) {
		this.socket = socketID;
	}

	getSocket() {
		return this.socket;
	}

	disconnect() {
		this.socket = undefined;
	}
};
