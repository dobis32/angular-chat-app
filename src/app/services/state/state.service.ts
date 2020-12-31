import { Injectable, isDevMode } from '@angular/core';
import { SocketService } from './../socket.service';
import { Observer, Observable, Subscription, Subscriber } from 'rxjs';
import { ChatMessage } from '../../util/chatMessage';
import { ChatRoom } from '../../util/chatRoom';
import { User } from '../../util/user';
import { ModalStateModule } from './modules/modal';
import { RoomStateModule } from './modules/room';
import { ChatLogStateModule } from './modules/chatlog';

@Injectable({
	providedIn: 'root'
})
export class StateService {
	// Modules
	public modal: ModalStateModule;
	public room: RoomStateModule;
	public chatLog: ChatLogStateModule;

	// Data
	// private _chatLog: Array<ChatMessage>;
	private _currentUser: User;

	// Subcriber/Observer Arrays
	private _currentUserSubscribers: Array<Observer<User>>;
	private _loggedInStatusSubscribers: Array<Observer<boolean>>;

	// Subscriptions
	private _socketSubscriptions: Array<Subscription>;

	constructor(private socket: SocketService) {
		// Init values
		// Modules
		this.modal = new ModalStateModule();
		this.room = new RoomStateModule(this.socket);
		this.chatLog = new ChatLogStateModule();

		// Data
		this._currentUser = undefined;

		// Subcriber/Observer Arrays
		this._currentUserSubscribers = new Array();
		this._loggedInStatusSubscribers = new Array();

		this._socketSubscriptions = new Array();

		// Init subs
		this.resetSocketSubs();
	}

	// Socket
	resetSocketSubs(): void {
		this.unsubscribeAllSocketSubs();
		let initSub = this.socket.listen('init').subscribe((data) => this.handleInit(data));
		this._socketSubscriptions.push(initSub);

		let roomSub = this.socket.listen('join').subscribe((data) => this.handleJoin(data));
		this._socketSubscriptions.push(roomSub);

		let createRoomSub = this.socket.listen('createRoom').subscribe((data) => this.handleRoomCreation(data));
		this._socketSubscriptions.push(createRoomSub);

		let messageSub = this.socket.listen('message').subscribe((data) => this.handleMessage(data));
		this._socketSubscriptions.push(messageSub);

		let notificationSub = this.socket.listen('notify').subscribe((data) => this.handleNotification(data));
		this._socketSubscriptions.push(notificationSub);

		let loginSub = this.socket.listen('login').subscribe((data) => this.handleLogin(data));
		this._socketSubscriptions.push(loginSub);

		let roomsUpdateSub = this.socket.listen('roomsUpdate').subscribe((data) => this.handleRoomsUpdate(data));
		this._socketSubscriptions.push(roomsUpdateSub);
	}

	// Observer callbacks
	handleInit(data: any) {
		let { rooms } = data;
		this.room.parseAndUpdateRooms(rooms);
	}

	handleJoin(data: any) {
		let { id } = data;
		if (id) {
			this.room.updateCurrentRoom(id);
		} else {
			this.room.leaveCurrentRoom(this._currentUser);
		}
	}

	handleRoomCreation(data: any) {
		console.log('INCOMING ROOM CREATE EVENT', data);
		let { rooms, roomToJoin } = data;
		if (rooms) {
			this.room.parseAndUpdateRooms(rooms);
			this.room.updateCurrentRoom(roomToJoin);
		} else alert('Failed to create room');
	}

	handleMessage(data: any) {
		console.log('INCOMING MESSAGE', data);
		let { user, id, date, text } = data;
		if (this.chatLog.chatLogIsDefined() && this.room.currentRoomIsDefined())
			this.chatLog.addMessageToChatLog(new ChatMessage(user, id, new Date(date), text));
	}

	handleNotification(data: any) {
		const { notification, user, message } = data;
		switch (notification) {
			case 'error':
				this.errorNotify(message);
				break;
			case 'leave':
				this.roomNotifyUserLeft(user);
				break;
			case 'join':
				this.roomNotifyUserJoin(user);
				break;
			default:
				console.log('FAILED TO CATEGORIZE NOTIFICATION');
				break;
		}
	}

	handleLogin(data: any) {
		let { id, name, failed } = data;
		if (failed) this.logout();
		else this.login(name, id);
	}

	handleRoomsUpdate(roomsData: any) {
		this.room.parseAndUpdateRooms(roomsData);
		this.room.updateCurrentRoom();
	}

	// Notifications
	roomNotifyUserLeft(username: string) {
		console.log('USER LEFT ROOM', username);
		this.chatLog.addMessageToChatLog(
			new ChatMessage(
				'Room notification',
				'RoomBot',
				new Date(),
				`${username ? username : 'Unknown User'} has left the room.`
			)
		);
	}

	roomNotifyUserJoin(username: string) {
		this.chatLog.addMessageToChatLog(
			new ChatMessage(
				'Room notification',
				'RoomBot',
				new Date(),
				`${username ? username : 'Unknown User'} has joined the room.`
			)
		);
	}

	errorNotify(errorMessage: string) {
		alert(errorMessage);
	}

	// Socket
	unsubscribeAllSocketSubs() {
		while (this._socketSubscriptions.length) {
			this._socketSubscriptions.shift().unsubscribe();
		}
	}

	_getSocketService(): SocketService {
		if (isDevMode()) return this.socket;
		else {
			console.log(new Error('ERROR StateService._getsocket() is only availabe in dev mode.'));
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

	// Rooms TODO: change logic so that the component, that would be calling these functions, gets modal input first, then attempts to create/join room
	createRoom(): Promise<any> {
		return new Promise((resolve, reject) => {
			this.modal.openModal('createRoom', (name: string, capacity: number, password: string) => {
				if (this.room.findRoomByName(name)) {
					console.log('A room with that name already exists!');
					resolve(false);
				} else {
					this.room.createRoom(name, capacity, password, this._currentUser.getId());
					resolve(true);
				}
			});
		});
	}

	joinPrivateRoom(room: ChatRoom): Promise<any> {
		return new Promise((resolve, reject) => {
			this.modal.openModal('promptRoomPassword', (userInput: string) => {
				if (!userInput.length) resolve(true);
				else if (room.joinable(userInput)) {
					resolve(true);
				} else resolve(false);
			});
		});
	}

	// Messages
	sendMessage(message: ChatMessage): boolean {
		try {
			this.socket.emit('message', { ...message.toJSON(), room: this.room.getCurrentRoom().getRoomID() });
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

	login(name, id) {
		this._currentUser = new User(name, id);
		this.updateCurrentUserSubscribers();
		this.updateLoggedInSubscribers();
	}

	logout() {
		this.room.leaveCurrentRoom(this._currentUser);

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

	attemptLogin(username: string, password: string): boolean {
		try {
			this.socket.emit('login', { username, password });
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
