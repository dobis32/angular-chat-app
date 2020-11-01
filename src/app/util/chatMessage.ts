export class ChatMessage {
	private user: string;
	private date: Date;
	private text: string;

	constructor(user: string, date: Date, text: string) {
		this.user = user;
		this.date = date;
		this.text = text;
	}

	getUser(): string {
		return this.user;
	}

	setUser(name: string) {
		this.user = name;
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
		return { user: this.user, date: this.date.toDateString(), text: this.text };
	}
}
