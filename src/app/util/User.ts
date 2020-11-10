export class User {
	private id: string;
	private username: string;
	private status: string;

	constructor(id, username, status) {
		this.id = id;
		this.username = username;
		this.status = status;
	}

	confirmStatus(status: string): boolean {
		return this.status.toUpperCase() == status.toUpperCase() ? true : false;
	}
}
