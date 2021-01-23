const User = require('./user');

module.exports = class UsersUtility {
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

	getUserBySocket(socketID) {
		return this.users.find((user) => user.getSocket() == socketID);
	}

	getUsersListJSON(userIDs) {
		let usersList = [];
		userIDs.forEach((id) => {
			let user = this.getUserByID(id);
			if (user) usersList.push(user.toJSON());
		});
		return usersList;
	}

	loginUser(username, password) {
		let user = this.users.find((user) => user.getName() == username && user.getPassword() == password);
		return user;
	}
};
