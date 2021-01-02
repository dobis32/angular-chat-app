import { Component, OnInit, Input, isDevMode, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { StateService } from '../services/state/state.service';
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
	private _currentUser: User;
	private _subscriptions: Array<Subscription>;

	public createRoomCallback = (name: string, capacity: number, password: string) => {
		if (this.state.room.findRoomByName(name)) {
			console.log('A room with that name already exists!');
			alert('failed to creat room');
		} else {
			this.state.room.createRoom(name, capacity, password, this._currentUser.getId());
		}
	}

	constructor() {
		this._roomsList = new Array();
		this._subscriptions = new Array();
	}

	ngOnInit(): void {
		let roomListSub = this.state.room.roomsList().subscribe((roomsList: Array<any>) => {
			this._roomsList = roomsList;
		});
		this._subscriptions.push(roomListSub);

		let currentRoomSub = this.state.room.currentRoom().subscribe((currentRoom: ChatRoom) => {
			this._currentRoom = currentRoom;
		});
		this._subscriptions.push(currentRoomSub);

		let currentUserSub = this.state.user.state().subscribe((currentUser: User) => {
			this._currentUser = currentUser;
		});
		this._subscriptions.push(currentUserSub);
	}

	ngOnDestroy(): void {
		this.unsubLocalSubscriptions();
	}

	unsubLocalSubscriptions(): void {
		while (this._subscriptions.length) this._subscriptions.shift().unsubscribe();
	}

	getRoomsList(): Array<any> {
		return this._roomsList;
	}

	async joinRoom(room: ChatRoom) {
		let inputPassword = '';
		if(room.getPassword().length) {
			try{
				inputPassword = await this.state.modal.promptRoomPassword();

			} catch(error) {
				console.log(error);
			}
		}
		this.state.room.joinRoom(this._currentUser, room, inputPassword);
	}

	leaveRoom(): void {
		this.state.room.leaveCurrentRoom(this._currentUser);
	}

	createRoom(): void {
		this.state.modal.openModal('createRoom', this.createRoomCallback);		
	}


	getCurrentRoom(): ChatRoom {
		return this._currentRoom;
	}

	getUsersInCurrentRoom(): Array<User> {
		return this._currentRoom.getUsers();
	}

	_setCurrentUser(user: User) {
		if (isDevMode()) this._currentUser = user;
		else {
			console.log('Sorry _setCurrentUser() is only available in dev mode');
		}
	}

	_setCurrentRoom(rm: ChatRoom) {
		if (isDevMode()) this._currentRoom = rm;
		else {
			console.log('Sorry _setCurrentRoom() is only available in dev mode');
		}
	}

	_getCurrentUser(): User {
		if (isDevMode()) return this._currentUser;
		else {
			console.log('Sorry _getCurrentUser() is only available in dev mode');
			return undefined;
		}
	}

	_getRoomsList(): Array<any> {
		if (isDevMode()) return this._roomsList;
		else {
			console.log('Sorry _getRoomsList() is only available in dev mode');
			return undefined;
		}
	}

	_setRoomsList(roomsList: Array<ChatRoom>) {
		if (isDevMode()) this._roomsList = roomsList;
		else {
			console.log('Sorry _setRoomsList() is only available in dev mode');
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
