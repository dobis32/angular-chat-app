import { User } from '../util/user';

export class ChatRoom {
	private _id: string;
	private _name: string;
	private _capacity: number;
	private _owner: string;
	private _password: string;
	private _users: Array<User>;
	private _admins: Array<string>;
	private _bans: Array<string>;

	constructor(
		id: string,
		name: string,
		capacity: number,
		owner: string,
		users?: Array<User>,
		password?: string,
		admins?: Array<string>,
		banned?: Array<string>
	) {
		this._id = id;
		this._name = name;
		this._capacity = capacity;
		this._owner = owner;
		this._users = users ? users : new Array();
		this._password = password ? password : '';
		this._admins = admins ? admins : new Array();
		this._bans = banned ? banned : new Array();
	}

	joinable(pw?: string) {
		if (this._capacity == this._users.length) return false;
		if (this._password != pw && this._password.length) return false;
		else return true;
	}

	userJoin(user: User) {
		this._users.push(user);
	}

	isPrivate(): boolean {
		return this._password.length ? true : false;
	}

	getRoomID(): string {
		return this._id;
	}

	// setID(newID: string) {
	// 	this._id = newID;
	// }

	getName(): string {
		return this._name.length > 6 ? this._name.substring(0, 2) + '...' : this._name;
	}

	getOwner(): string {
		return this._owner;
	}

	getCapacity(): number {
		return this._capacity;
	}

	getPassword(): string {
		return this._password;
	}

	getUsers(): Array<User> {
		return this._users;
	}

	getAdmins(): Array<string> {
		return this._admins;
	}

	getBans(): Array<string> {
		return this._bans;
	}
}
