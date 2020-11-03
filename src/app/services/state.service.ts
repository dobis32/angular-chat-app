import { Injectable, isDevMode } from '@angular/core';
import { SocketService } from './socket.service';
import { Observer, Observable, Subscription } from 'rxjs';
import { ChatMessage } from '../util/chatMessage';
import { Socket } from '../util/socket.interface';

@Injectable({
	providedIn: 'root'
})
export class StateService {
	private _socketSubscriptions: Array<Subscription>;
	private _chatLogSubscribers: Array<Observer<Array<ChatMessage>>>;
	private _currentUserSubscribers: Array<Observer<string>>;
	private _loggedInStatusSubscribers: Array<Observer<boolean>>;
	private _chatLog: Array<ChatMessage>;
	private _currentUser: string;

	constructor(private socketService: SocketService) {
		// Init values
		this._chatLog = new Array();
		this._currentUser = '';
		this._socketSubscriptions = new Array();
		this._chatLogSubscribers = new Array();
		this._currentUserSubscribers = new Array();
		this._loggedInStatusSubscribers = new Array();

		// Init subs
		this.resetSocketSubs();
	}

	private _setChatLog(messages: Array<ChatMessage>) {
		messages.forEach((msg) => {
			this._chatLog.push(msg);
		});

		this._chatLogSubscribers.forEach((sub: Observer<Array<ChatMessage>>) => {
			sub.next(this._chatLog);
		});
	}

	resetSocketSubs(): void {
		this.unsubscribeAllSocketSubs();
		let initSub = this.socketService.listen('init').subscribe(({ messages }) => {
			let parsedMessages = this.parseChatLog(messages);
			this._setChatLog(parsedMessages);
		});
		this._socketSubscriptions.push(initSub);

		let incomingMessageSub = this.socketService.listen('incomingMessage').subscribe(({ user, date, text }) => {
			let parsedMessage = new ChatMessage(user, date, text);
			this._chatLog.push(parsedMessage);
		});
		this._socketSubscriptions.push(incomingMessageSub);

		let messageReceivedSub = this.socketService.listen('messageReceived').subscribe(({ user, date, text }) => {
			let parsedMessage = new ChatMessage(user, date, text);
			this._chatLog.push(parsedMessage);
		});
		this._socketSubscriptions.push(messageReceivedSub);
	}

	unsubscribeAllSocketSubs() {
		while (this._socketSubscriptions.length) {
			this._socketSubscriptions.shift().unsubscribe();
		}
	}

	parseChatLog(messages: Array<any>): Array<ChatMessage> {
		let parsedMessages: Array<ChatMessage> = new Array();
		messages.forEach((notParsed) => {
			let { user, dateString, text } = notParsed;
			let date = new Date(dateString);
			parsedMessages.push(new ChatMessage(user, date, text));
		});
		return parsedMessages;
	}

	chatLog() {
		return new Observable((subscriber: Observer<any>) => {
			this._chatLogSubscribers.push(subscriber);
			subscriber.next(this._chatLog);
		});
	}

	currentUser() {
		return new Observable((subscriber: Observer<any>) => {
			this._currentUserSubscribers.push(subscriber);
			subscriber.next(this._currentUser);
		});
	}

	logout() {
		this._currentUser = '';
		this.updateCurrentUserSubscribers();
		this.updateLoggedInSubscribers();
	}

	loggedInStatus(): Observable<boolean> {
		return new Observable((subscriber: Observer<boolean>) => {
			let bool = this._currentUser.length ? true : false;

			this._loggedInStatusSubscribers.push(subscriber);
			subscriber.next(bool);
		});
	}

	sendMessage(message: ChatMessage): Promise<any> {
		return this.socketService.emit('message', message.toJSON());
	}

	updateCurrentUserSubscribers(): void {
		this._currentUserSubscribers.forEach((sub) => {
			sub.next(this._currentUser);
		});
	}

	updateLoggedInSubscribers(): void {
		this._loggedInStatusSubscribers.forEach((sub) => {
			sub.next(this._currentUser.length ? true : false);
		});
	}

	login(username: string, password: string): boolean {
		try {
			this._currentUser = username;
			this.updateCurrentUserSubscribers();
			this.updateLoggedInSubscribers();
			return true;
		} catch(error) {
			return false;
		}
	}

	_getSocketService(): Socket {
		if (isDevMode()) return this.socketService;
		else {
			console.log(new Error('ERROR StateService._getSocketService() is only availabe in dev mode.'));
			return undefined;
		}
	}

	_getChatLog(): Array<ChatMessage> {
		if (isDevMode()) return this._chatLog;
		else {
			console.log(new Error('ERROR StateService._getChatLog() is only availabe in dev mode.'));
			return undefined;
		}
	}

	_getCurrentUser(): string {
		if (isDevMode()) return this._currentUser;
		else {
			console.log(new Error('ERROR StateService._getCurrentUser() is only availabe in dev mode.'));
			return undefined;
		}
	}

	_getSocketSubscriptions(): Array<Subscription> {
		if (isDevMode()) return this._socketSubscriptions;
		else {
			console.log(new Error('ERROR StateService._getSocketSubscriptions() is only availabe in dev mode.'));
			return undefined;
		}
	}

	_getChatLogSubscribers(): Array<Observer<Array<ChatMessage>>> {
		if (isDevMode()) return this._chatLogSubscribers;
		else {
			console.log(new Error('ERROR StateService._getChatLogSubscribers() is only availabe in dev mode.'));
			return undefined;
		}
	}

	_getCurrentUserSubscribers(): Array<Observer<string>> {
		if (isDevMode()) return this._currentUserSubscribers;
		else {
			console.log(new Error('ERROR StateService._getCurrentUserSubscribers() is only availabe in dev mode.'));
			return undefined;
		}
	}

	_getLoggedInStatusSubscribers(): Array<Observer<boolean>> {
		if (isDevMode()) return this._loggedInStatusSubscribers;
		else {
			console.log(new Error('ERROR StateService._getLoggedInStatusSubscribers() is only availabe in dev mode.'));
			return undefined;
		}
	}
}
