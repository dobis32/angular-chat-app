import { User } from '../util/user';

export class ChatRoom {
	private _id: string;
	private _name: string;
	private _users: Array<User>;
	private _capacity: number;
	private _password: string;

	constructor(id: string, name: string, capacity: number, users?: Array<User>, password?: string) {
		this._id = id;
		this._name = name;
		this._capacity = capacity;
		this._users = users ? users : new Array();
		this._password = password ? password : '';
	}

	isPrivate(): boolean {
		return this._password.length ? true : false;
	}

	getID(): string {
		return this._id;
	}

	setID(newID: string) {
		this._id = newID;
	}

	getName(): string {
		return this._name.length > 6 ? this._name.substring(0, 2) + '...' : this._name;
	}

	getUsers(): Array<User> {
		return this._users;
	}

	getCapacity(): number {
		return this._capacity;
	}

	getPassword(): string {
		return this._password;
	}
}
