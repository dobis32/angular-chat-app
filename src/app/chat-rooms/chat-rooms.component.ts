import { Component, OnInit, Input, isDevMode, OnDestroy, ElementRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { StateService } from '../services/state.service';
import { ChatRoom } from '../util/chatRoom';
import { User } from '../util/user';

@Component({
	selector: 'app-chat-rooms',
	templateUrl: './chat-rooms.component.html',
	styleUrls: [ './chat-rooms.component.scss' ]
})
export class ChatRoomsComponent implements OnInit, OnDestroy {
	@Input() state: StateService;
	private _roomsList: Array<any>;
	private _currentRoom: ChatRoom;
	private _subscriptions: Array<Subscription>;

	constructor() {
		this._roomsList = new Array();
		this._subscriptions = new Array();
	}

	ngOnInit(): void {
		let roomListSub = this.state.roomsList().subscribe((roomsList: Array<any>) => {
			this._roomsList = roomsList;
		});
		this._subscriptions.push(roomListSub);

		let currentRoomSub = this.state.currentRoom().subscribe((currentRoom: ChatRoom) => {
			this._currentRoom = currentRoom;
		});
		this._subscriptions.push(currentRoomSub);
	}

	ngOnDestroy(): void {
		while (this._subscriptions.length) this._subscriptions.shift().unsubscribe();
	}

	getRoomsList(): Array<any> {
		return this._roomsList;
	}

	joinRoom(room: ChatRoom) {
		this.state
			.joinRoom(room)
			.then((result) => {
				if (!result) alert('Failed to join room');
			})
			.catch((error) => {
				console.log(error);
			});
	}

	leaveRoom(): void {
		// unit test
		this.state.leaveCurrentRoom();
	}

	getCurrentRoom(): ChatRoom {
		return this._currentRoom;
	}

	getUsersInCurrentRoom(): Array<User> {
		return this._currentRoom.getUsers();
	}

	_getRoomsList(): Array<any> {
		if (isDevMode()) return this._roomsList;
		else {
			console.log('Sorry _getRoomsList() is only available in dev mode');
			return undefined;
		}
	}

	_getSubscriptions(): Array<Subscription> {
		if (isDevMode()) return this._subscriptions;
		else {
			console.log('Sorry _getRoomslistSubscription() is only available in dev mode');
			return undefined;
		}
	}

	_setSubscriptions(subs: Array<Subscription>) {
		if (isDevMode()) this._subscriptions = subs;
		else {
			console.log('Sorry _setSubscriptions() is only available in dev mode');
		}
	}
}
