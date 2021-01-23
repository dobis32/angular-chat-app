module.exports = class Room {
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

	getName() {
		return this.name;
	}

	isFull() {
		return this.users.length == this.capacity ? true : false;
	}

	isPrivate() {
		return this.password.length ? true : false;
	}

	removeUser(idToRemove) {
		this.users = this.users.filter((id) => id !== idToRemove);
	}

	joinUser(userID) {
		if (this.users.length < this.capacity) {
			this.users.push(userID);
			return true;
		} else {
			return false;
		}
	}

	updateCredentials(name, capacity, password) {
		this.name = name;
		this.capacity = capacity;
		this.password = password;
	}

	getUsers() {
		return this.users;
	}

	toJSON(userUtility) {
		let userJSONData = [];
		this.users.forEach((userID) => {
			let user = userUtility.getUserByID(userID);
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
};
