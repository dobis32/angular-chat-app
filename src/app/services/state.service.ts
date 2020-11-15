import { Injectable, isDevMode } from '@angular/core';
import { SocketService } from './socket.service';
import { Observer, Observable, Subscription, Subscriber } from 'rxjs';
import { ChatMessage } from '../util/chatMessage';
import { Socket } from '../util/socket.interface';
import { ChatRoom } from '../util/chatRoom';
import { User } from '../util/user';

let mockUser = new User('Denny Dingus', 'some_nonce');

@Injectable({
	providedIn: 'root'
})
export class StateService {
	private _socketSubscriptions: Array<Subscription>;
	private _chatLogSubscribers: Array<Observer<Array<ChatMessage>>>;
	private _currentUserSubscribers: Array<Observer<User>>;
	private _loggedInStatusSubscribers: Array<Observer<boolean>>;
	private _chatLog: Array<ChatMessage>;
	private _currentUser: User; // TO DO create and implement User class
	private _roomsList: Array<ChatRoom>;
	private _roomsListSubscribers: Array<Observer<Array<any>>>;
	private _currentRoom: ChatRoom;
	private _currentRoomSubscribers: Array<Observer<ChatRoom>>;

	constructor(private socketService: SocketService) {
		// Init values
		this._currentRoom = undefined;
		this._chatLog = new Array();
		this._currentUser = undefined;
		this._socketSubscriptions = new Array();
		this._chatLogSubscribers = new Array();
		this._currentUserSubscribers = new Array();
		this._loggedInStatusSubscribers = new Array();
		this._roomsList = new Array();
		this._roomsListSubscribers = new Array();
		this._currentRoomSubscribers = new Array();

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

	// Socket
	resetSocketSubs(): void {
		this.unsubscribeAllSocketSubs();
		let initSub = this.socketService.listen('init').subscribe(({ rooms, devUserJSON }) => {
			let { name, id } = devUserJSON;
			this._currentUser = new User(name, id);
			let parsedRoomsList = this.parseRoomsList(rooms);
			this.updateRoomsList(parsedRoomsList);
		});
		this._socketSubscriptions.push(initSub);

		let roomSub = this.socketService.listen('join').subscribe(({ room, leave }) => {
			console.log(`JOIN SUB roomID: ${room}`);
			if (leave) {
				// leave room
				this.leaveCurrentRoom();
			} else if (room) {
				// join SUCCESS
				let roomInstance: ChatRoom = this._roomsList.find((rm: ChatRoom) => {
					rm.getID() == room;
				});
				if (roomInstance) this.updateCurrentRoom(roomInstance);
				else console.log('whoops, that room does not seem to exist...');
			} else {
				// join FAIL
			}
		});
		this._socketSubscriptions.push(roomSub);

		let messageSub = this.socketService.listen('message').subscribe(({ username, timeStamp, message }) => {
			if (this._chatLog) this._chatLog.push(new ChatMessage(username, new Date(timeStamp), message));
		});
		this._socketSubscriptions.push(messageSub);

		// let incomingMessageSub = this.socketService.listen('incomingMessage').subscribe(({ user, date, text }) => {
		// 	let parsedMessage = new ChatMessage(user, date, text);
		// 	this._chatLog.push(parsedMessage);
		// });
		// this._socketSubscriptions.push(incomingMessageSub);

		// let messageReceivedSub = this.socketService.listen(messageReceived').subscribe(({ user, date, text }) => {
		// 	let parsedMessage = new ChatMessage(user, date, text);
		// 	this._chatLog.push(parsedMessage);
		// });
		// this._socketSubscriptions.push(messageReceivedSub);
	}

	unsubscribeAllSocketSubs() {
		while (this._socketSubscriptions.length) {
			this._socketSubscriptions.shift().unsubscribe();
		}
	}

	_getSocketService(): Socket {
		if (isDevMode()) return this.socketService;
		else {
			console.log(new Error('ERROR StateService._getSocketService() is only availabe in dev mode.'));
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

	// Rooms
	currentRoom(): Observable<ChatRoom> {
		return new Observable((sub: Subscriber<ChatRoom>) => {
			sub.next(this._currentRoom);
			this._currentRoomSubscribers.push(sub);
		});
	}

	roomsList(): Observable<Array<any>> {
		return new Observable((sub: Subscriber<Array<any>>) => {
			sub.next(this._roomsList);
			this._roomsListSubscribers.push(sub);
		});
	}

	updateRoomsList(rooms: Array<any>): void {
		this._roomsList = rooms;
		this.updateRoomsListSubscribers();
	}

	updateRoomsListSubscribers(): void {
		this._roomsListSubscribers.forEach((sub: Observer<Array<ChatRoom>>) => {
			sub.next(this._roomsList);
		});
	}

	updateCurrentRoom(room: ChatRoom) {
		this._currentRoom = room;
		this.updateCurrentRoomSubscribers();
	}

	leaveCurrentRoom(): void {
		this._currentRoom = undefined;
		this.updateCurrentRoomSubscribers();
		this.socketService.emit('leave', { user: this._currentUser.getId() });
	}

	updateCurrentRoomSubscribers(): void {
		this._currentRoomSubscribers.forEach((obs: Observer<ChatRoom>) => {
			obs.next(this._currentRoom);
		});
	}

	async createRoom(roomName: string): Promise<boolean> {
		try {
			await this.socketService.emit('createRoom', roomName);
			return true;
		} catch (error) {
			console.log(error);
			return false;
		}
	}

	async joinRoom(roomID: string): Promise<boolean> {
		try {
			if (!roomID) throw new Error();
			await this.socketService.emit('join', { user: this._currentUser.getId(), room: roomID });
			return true;
		} catch (error) {
			return false;
		}
	}

	parseRoomsList(unparsedList: Array<any>): Array<ChatRoom> {
		let parsedList = new Array();
		unparsedList.forEach(({ id, name, capacity, users, password }) => {
			try {
				parsedList.push(new ChatRoom(id, name, capacity, users, password));
			} catch (error) {
				console.log(error);
			}
		});

		return parsedList;
	}

	_getRoomsList(): Array<ChatRoom> {
		if (isDevMode()) return this._roomsList;
		else {
			console.log('Sorry _getRoomsList() is only available in dev mode');
			return undefined;
		}
	}

	_getRoomsListSubscribers(): Array<Observer<Array<ChatRoom>>> {
		if (isDevMode()) return this._roomsListSubscribers;
		else {
			console.log('Sorry _getRoomsListSubscribers() is only available in dev mode');
			return undefined;
		}
	}

	_setCurrentRoom(room: ChatRoom) {
		if (isDevMode()) this._currentRoom = room;
		else {
			console.log('Sorry _setCurrentRoom() is only available in dev mode');
			return undefined;
		}
	}

	_getCurrentRoom(): ChatRoom {
		if (isDevMode()) return this._currentRoom;
		else {
			console.log('Sorry _getCurrentRoom() is only available in dev mode');
			return undefined;
		}
	}

	_getCurrentRoomSubscribers(): Array<Observer<ChatRoom>> {
		if (isDevMode()) return this._currentRoomSubscribers;
		else {
			console.log('Sorry _getCurrentRoomSubscribers() is only available in dev mode');
			return undefined;
		}
	}

	// Chat log
	parseChatLog(messages: Array<any>): Array<ChatMessage> {
		let parsedMessages: Array<ChatMessage> = new Array();
		if (Array.isArray(messages))
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

	_getChatLog(): Array<ChatMessage> {
		if (isDevMode()) return this._chatLog;
		else {
			console.log(new Error('ERROR StateService._getChatLog() is only availabe in dev mode.'));
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

	// Messages
	async sendMessage(message: ChatMessage): Promise<boolean> {
		try {
			await this.socketService.emit('message', message.toJSON());
			return true;
		} catch (error) {
			console.log('ERROR SENDING MESSAGE -- ', error.message);
			return false;
		}
	}

	// User
	currentUser() {
		return new Observable((subscriber: Observer<User>) => {
			this._currentUserSubscribers.push(subscriber);
			subscriber.next(this._currentUser);
		});
	}

	currentRoomIndex(): Observable<number> {
		return new Observable((subscriber: Observer<number>) => {});
	}

	logout() {
		this._currentUser = undefined;
		this.updateCurrentUserSubscribers();
		this.updateLoggedInSubscribers();
	}

	loggedInStatus(): Observable<boolean> {
		return new Observable((subscriber: Observer<boolean>) => {
			let bool = this._currentUser ? true : false;

			this._loggedInStatusSubscribers.push(subscriber);
			subscriber.next(bool);
		});
	}

	updateCurrentUserSubscribers(): void {
		this._currentUserSubscribers.forEach((sub) => {
			sub.next(this._currentUser);
		});
	}

	updateLoggedInSubscribers(): void {
		this._loggedInStatusSubscribers.forEach((sub) => {
			sub.next(this._currentUser ? true : false);
		});
	}

	login(username: string, password: string): boolean {
		try {
			// this._currentUser = mockUser;
			this.updateCurrentUserSubscribers();
			this.updateLoggedInSubscribers();
			return true;
		} catch (error) {
			return false;
		}
	}

	_setUser(user: User) {
		if (isDevMode()) this._currentUser = user;
		else {
			console.log(new Error('ERROR StateService._getCurrentUser() is only availabe in dev mode.'));
		}
	}

	_getCurrentUser(): User {
		if (isDevMode()) return this._currentUser;
		else {
			console.log(new Error('ERROR StateService._getCurrentUser() is only availabe in dev mode.'));
			return undefined;
		}
	}

	_getCurrentUserSubscribers(): Array<Observer<User>> {
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
