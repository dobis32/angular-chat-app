import { Injectable, isDevMode } from '@angular/core';
import { SocketService } from './socket.service';
import { Observer, Observable, Subscription, Subscriber } from 'rxjs';
import { ChatMessage } from '../util/chatMessage';
import { ChatRoom } from '../util/chatRoom';
import { User } from '../util/user';

@Injectable({
	providedIn: 'root'
})
export class StateService {
	// Data
	private _activeModalName: string;
	private _chatLog: Array<ChatMessage>;
	private _currentRoom: ChatRoom;
	private _currentUser: User;
	private _modalActiveStatus: boolean;
	private _modalCB: Function;
	private _roomsList: Array<ChatRoom>;

	// Subcriber/Observer Arrays
	private _chatLogSubscribers: Array<Observer<Array<ChatMessage>>>;
	private _currentRoomSubscribers: Array<Observer<ChatRoom>>;
	private _currentUserSubscribers: Array<Observer<User>>;
	private _loggedInStatusSubscribers: Array<Observer<boolean>>;
	private _modalSubscriber: Observer<any>;
	private _modalActiveStatusSubscriber: Observer<boolean>;
	private _roomsListSubscribers: Array<Observer<Array<any>>>;

	// Subscriptions
	private _socketSubscriptions: Array<Subscription>;

	constructor(private socket: SocketService) {
		// Init values
		// Data
		this._chatLog = new Array();
		this._currentRoom = undefined;
		this._currentUser = undefined;
		this._modalActiveStatus = false;
		this._modalCB = () => {};
		this._roomsList = new Array();

		// Subcriber/Observer Arrays
		this._chatLogSubscribers = new Array();
		this._currentRoomSubscribers = new Array();
		this._currentUserSubscribers = new Array();
		this._loggedInStatusSubscribers = new Array();
		this._modalSubscriber = undefined;
		this._modalActiveStatusSubscriber = undefined;
		this._roomsListSubscribers = new Array();
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

		let createRoomSub = this.socket.listen('createRoom').subscribe((data) => this.handleRoomCreation(data)); // TODO: Unit test

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
	handleInit(data: any) { // TODO: update unit test
		let { rooms } = data;
		this.parseAndUpdateRooms(rooms);
	}

	handleJoin(data: any) { // TODO: update unit test
		let { id } = data;
		if (id) {
			this.updateCurrentRoom(id);
		} else {
			this.leaveCurrentRoom();
		}
	}

	handleRoomCreation(data: any) { // TODO: unit test
		let { rooms, roomToJoin } = data;
		if(rooms) {
			this.parseAndUpdateRooms(rooms);
			this.updateCurrentRoom(roomToJoin);
		} else alert('Failed to create room');
	}

	handleMessage(data: any) {
		console.log('INCOMING MESSAGE', data);
		// This has WEAK testing
		let { user, id, date, text } = data;
		if (this._chatLog && this._currentRoom) this._chatLog.push(new ChatMessage(user, id, new Date(date), text));
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

	handleRoomsUpdate(roomsData: any) { // TODO: update unit test
		this.parseAndUpdateRooms(roomsData);
	}

	// Notifications
	roomNotifyUserLeft(username: string) {
		console.log('USER LEFT ROOM', username);
		this._chatLog.push(
			new ChatMessage(
				'Room notification',
				'RoomBot',
				new Date(),
				`${username ? username : 'Unknown User'} has left the room.`
			)
		);
	}

	roomNotifyUserJoin(username: string) {
		this._chatLog.push(
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

	// Modal
	modal(): Observable<any> {
		return new Observable((sub: Observer<any>) => {
			sub.next({ modal: this._activeModalName, cb: this._modalCB });
			this._modalSubscriber = sub;
		});
	}

	modalActiveStatus() {
		return new Observable((sub: Observer<boolean>) => {
			sub.next(this._modalActiveStatus);
			this._modalActiveStatusSubscriber = sub;
		});
	}

	openModal(modal: string, cb: Function) {
		this._modalActiveStatus = true;
		this._activeModalName = modal;
		this._modalCB = cb;
		this.refreshModalSubscriber();
		this.refreshModalActiveStatusSubscriber();
	}

	closeModal() {
		this._modalActiveStatus = false;
		this._activeModalName = '';
		this._modalCB = new Function();
		this.refreshModalSubscriber();
		this.refreshModalActiveStatusSubscriber();
	}

	refreshModalSubscriber() {
		if (this._modalSubscriber)
			this._modalSubscriber.next({
				modal: this._activeModalName,
				cb: this._modalCB
			});
	}

	refreshModalActiveStatusSubscriber() {
		if (this._modalActiveStatusSubscriber) this._modalActiveStatusSubscriber.next(this._modalActiveStatus);
	}

	_getActiveModalName(): string {
		if (isDevMode()) return this._activeModalName;
		else {
			console.log(new Error('ERROR StateService._getActiveModalName() is only availabe in dev mode.'));
			return undefined;
		}
	}

	_setActiveModalName(modalName: string) {
		if (isDevMode()) this._activeModalName = modalName;
		else {
			console.log(new Error('ERROR StateService._setActiveModalName() is only availabe in dev mode.'));
		}
	}

	_getModalCB(): Function {
		if (isDevMode()) return this._modalCB;
		else {
			console.log(new Error('ERROR StateService._getModalCB() is only availabe in dev mode.'));
			return undefined;
		}
	}

	_setModalCB(cb: Function) {
		if (isDevMode()) this._modalCB = cb;
		else {
			console.log(new Error('ERROR StateService._setModalCB() is only availabe in dev mode.'));
		}
	}

	_getModalActiveStatus(): boolean {
		if (isDevMode()) return this._modalActiveStatus;
		else {
			console.log(new Error('ERROR StateService._getModalActiveStatus() is only availabe in dev mode.'));
			return undefined;
		}
	}

	_setModalActiveStatus(status: boolean) {
		if (isDevMode()) this._modalActiveStatus = status;
		else {
			console.log(new Error('ERROR StateService._setModalActiveStatus() is only availabe in dev mode.'));
		}
	}

	_getModalActiveStatusSubscriber(): Observer<boolean> {
		if (isDevMode()) return this._modalActiveStatusSubscriber;
		else {
			console.log(
				new Error('ERROR StateService._getModalActiveStatusSubscriber() is only availabe in dev mode.')
			);
			return undefined;
		}
	}

	_getModalSubscriber(): Observer<any> {
		if (isDevMode()) return this._modalSubscriber;
		else {
			console.log(new Error('ERROR StateService._getModalSubscriber() is only availabe in dev mode.'));
			return undefined;
		}
	}

	// Rooms
	parseAndUpdateRooms(roomsData: Array<any>) { // TODO: Unit test
		let parsedRoomsList = this.parseRoomsList(roomsData);
		this.updateRoomsList(parsedRoomsList);
	}

	createRoom(): Promise<any> { // TODO: unit test
		return new Promise((resolve, reject) => {
			this.openModal('createRoom', (name: string, capacity: number, password: string) => {
				if (this._roomsList.find((rm: ChatRoom) => rm.getName() == name)) 
				{
					console.log('A room with that name already exists!');
					resolve(false);
				} else {
					this.socket.emit('createRoom', { name, capacity, password, userID: this._currentUser.getId() });
					resolve(true);
				}
			});
		});
	}

	joinRoom(room: ChatRoom): Promise<any> {
		if (room.getPassword().length) return this.joinPrivateRoom(room);
		else return this.joinPublicRoom(room);
	}

	joinPublicRoom(room: ChatRoom): Promise<any> {
		return new Promise((resolve, reject) => {
			if (room.joinable()) {
				this.socket.emit('join', { user: this._currentUser.getId(), room: room.getRoomID() });
				resolve(true);
			} else resolve(false);
		});
	}

	joinPrivateRoom(room: ChatRoom): Promise<any> {
		return new Promise((resolve, reject) => {
			this.openModal('promptRoomPassword', (userInput: string) => {
				if (!userInput.length) resolve(true);
				else if (room.joinable(userInput)) {
					this.socket.emit('join', { user: this._currentUser.getId(), room: room.getRoomID() });
					resolve(true);
				} else resolve(false);
			});
		});
	}

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

	updateCurrentRoom(roomID: string) { // TODO: update unit test
		let roomInstance = this._roomsList.find((rm: ChatRoom) => {
			return rm.getRoomID() == roomID;
		});
		if (roomInstance) {
			this._currentRoom = roomInstance;
			this.resetChatLog();
			this.updateChatLogSubscribers();
			this.updateCurrentRoomSubscribers();		
		} else console.log('whoops, that room does not seem to exist...');
		
	}

	leaveCurrentRoom(): void {
		if (this._currentRoom) {
			console.log('LEAVE ROOM', this._currentRoom);
			this.socket.emit('leave', { user: this._currentUser.getId(), room: this._currentRoom.getRoomID() });
			this._currentRoom = undefined;
			this.updateCurrentRoomSubscribers();
		}
	}

	updateCurrentRoomSubscribers(): void {
		this._currentRoomSubscribers.forEach((obs: Observer<ChatRoom>) => {
			obs.next(this._currentRoom);
		});
	}

	parseRoomsList(unparsedList: Array<any>): Array<ChatRoom> {
		let parsedList = new Array();
		unparsedList.forEach(({ id, name, capacity, users, password }) => {
			try {
				if (!id || !name || !capacity)
					throw new Error('Failed to parse room; one or more required parameters is invalid');
				let parsedUsers: Array<User> = [];
				if (users)
					users.forEach(({ id, name }) => {
						parsedUsers.push(new User(name, id));
					});
				let rm = new ChatRoom(id, name, capacity, parsedUsers, password);
				parsedList.push(rm);
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

	_setRoomsList(rooms: Array<ChatRoom>) {
		if (isDevMode()) this._roomsList = rooms;
		else {
			console.log('Sorry _setRoomsList() is only available in dev mode');
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
				let { user, id, dateString, text } = notParsed;
				let date = new Date(dateString);
				parsedMessages.push(new ChatMessage(user, id, date, text));
			});
		return parsedMessages;
	}

	chatLog() {
		return new Observable((subscriber: Observer<any>) => {
			this._chatLogSubscribers.push(subscriber);
			subscriber.next(this._chatLog);
		});
	}

	updateChatLogSubscribers(): void {
		this._chatLogSubscribers.forEach((sub: Observer<Array<ChatMessage>>) => {
			sub.next(this._chatLog);
		});
	}

	resetChatLog(): void {
		this._chatLog = new Array();
	}

	_getChatLog(): Array<ChatMessage> {
		if (isDevMode()) return this._chatLog;
		else {
			console.log(new Error('ERROR StateService._getChatLog() is only availabe in dev mode.'));
			return undefined;
		}
	}

	_setChatLog(log: Array<ChatMessage>) {
		if (isDevMode()) return this._chatLog;
		else {
			console.log(new Error('ERROR StateService._setChatLog() is only availabe in dev mode.'));
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
	sendMessage(message: ChatMessage): boolean {
		try {
			this.socket.emit('message', { ...message.toJSON(), room: this._currentRoom.getRoomID() });
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
		this.leaveCurrentRoom();

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
