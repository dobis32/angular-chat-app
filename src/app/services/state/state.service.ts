import { Injectable, isDevMode } from '@angular/core';
import { SocketService } from './../socket.service';
import { Subscription } from 'rxjs';
import { ChatMessage } from '../../util/chatMessage';
import { ModalStateModule } from './modules/modal';
import { RoomStateModule } from './modules/room';
import { ChatLogStateModule } from './modules/chatlog';
import { UserStateModule } from './modules/user';

@Injectable({
	providedIn: 'root'
})
export class StateService {
	// Modules
	public modal: ModalStateModule;
	public room: RoomStateModule;
	public chatLog: ChatLogStateModule;
	public user: UserStateModule;

	// Subscriptions
	private _socketSubscriptions: Array<Subscription>;

	constructor(private socket: SocketService) {
		// Init values
		// Modules
		this.modal = new ModalStateModule();
		this.room = new RoomStateModule(this.socket);
		this.user = new UserStateModule(this.socket);
		this.chatLog = new ChatLogStateModule(this.socket);

		this._socketSubscriptions = new Array();

		// Init subs
		this.resetSocketSubs();
	}

	// Socket
	resetSocketSubs(): void {
		this.unsubscribeAllSocketSubs();
		let initSub = this.socket.listen('init').subscribe((data) => this.handleInit(data));
		this._socketSubscriptions.push(initSub);

		let messageSub = this.socket.listen('message').subscribe((data) => this.handleMessage(data));
		this._socketSubscriptions.push(messageSub);

		let notificationSub = this.socket.listen('notify').subscribe((data) => this.handleNotification(data));
		this._socketSubscriptions.push(notificationSub);

		let loginSub = this.socket.listen('login').subscribe((data) => this.handleLogin(data));
		this._socketSubscriptions.push(loginSub);

		let roomsUpdateSub = this.socket.listen('roomsUpdate').subscribe((data) => this.handleRoomsUpdate(data));
		this._socketSubscriptions.push(roomsUpdateSub);

		let currentRoomUpdateSub = this.socket
			.listen('currentRoomUpdate')
			.subscribe((data) => this.handleCurrentRoomUpdate(data));
		this._socketSubscriptions.push(currentRoomUpdateSub);
	}

	// Observer callbacks
	handleInit(data: any) {
		let { rooms } = data;
		this.room.parseAndUpdateRooms(rooms);
	}

	handleMessage(data: any) {
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
		if (failed) this.user.logout();
		else this.user.login(name, id);
	}

	handleRoomsUpdate(data: any) {
		this.room.parseAndUpdateRooms(data);
	}

	handleCurrentRoomUpdate(data: any) {
		let { rooms, roomToJoin } = data;
		if (rooms) {
			this.room.parseAndUpdateRooms(rooms);
			this.room.updateCurrentRoom(roomToJoin);
		} else alert('Failed to create room');
	}

	// Notifications
	roomNotifyUserLeft(username: string) {
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
}
