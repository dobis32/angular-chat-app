export class ChatMessage {
	private user: string;
	private userID: string;
	private date: Date;
	private text: string;

	constructor(user: string, id: string, date: Date, text: string) {
		this.user = user;
		this.userID = id;
		this.date = date;
		this.text = text;
	}

	getUser(): string {
		return this.user;
	}

	setUser(name: string) {
		this.user = name;
	}

	getUserID(): string {
		return this.userID;
	}

	getDate(): string {
		return this.date.toDateString();
	}

	setDate(date: Date) {
		this.date = date;
	}

	getText(): string {
		return this.text;
	}

	setText(text: string) {
		this.text = text;
	}

	toJSON(): any {
		return { user: this.user, id: this.userID, date: this.date.toDateString(), text: this.text };
	}
}
