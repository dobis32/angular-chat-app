import { Component, OnInit, Input, isDevMode, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { StateService } from '../services/state/state.service';
import { ChatRoom } from '../util/chatRoom';
import { User } from '../util/user';
import { Observable } from 'rxjs';

@Component({
	selector: 'app-chat-rooms',
	templateUrl: './chat-rooms.component.html',
	styleUrls: [ './chat-rooms.component.scss' ]
})
export class ChatRoomsComponent implements OnInit, OnDestroy {
	@Input() state: StateService;

	public usersInCurrentRoom: Observable<Array<User>>;

	private _roomsList: Array<any>;
	private _currentRoom: ChatRoom;
	private _currentUser: User;
	private _subscriptions: Array<Subscription>;

	public createRoomCallback = (name: string, capacity: number, password: string) => {
		if (name.length > 0 && this.state.room.findRoomByName(name)) {
			alert('Failed to create room: a room with that name already exists!');
		} else {
			this.state.room.createRoom(name, capacity, password, this._currentUser.getId());
		}
	};

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

		this.usersInCurrentRoom = this.state.room.usersInCurrentRoom();
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
		if (room.getPassword().length) {
			try {
				inputPassword = await this.state.modal.promptRoomPassword();
			} catch (error) {
				console.log(error);
			}
		}
		this.state.room.joinRoom(this._currentUser, room, inputPassword);
	}

	leaveRoom(): void {
		if (this._currentUser && this._currentRoom) this.state.room.userLeaveCurrentRoom(this._currentUser);
	}

	async createRoom(): Promise<void> {
		let { name, capacity, password } = await this.state.modal.createRoom();
		this.state.room.createRoom(name, capacity, password, this._currentUser.getId());
	}

	getCurrentRoom(): ChatRoom {
		return this._currentRoom;
	}

	getUsersInCurrentRoom(): Array<User> {
		return this._currentRoom.getUsers();
	}

	currentUserHasRoomPowers(): boolean {
		return this.state.room.userHasRoomPowers(this._currentUser, this._currentRoom);
	}

	async editCurrentRoom(): Promise<void> {
		let room = await this.state.modal.editRoom(this._currentRoom);
		this.state.room.emitCurrentRoomUpdate(room, this._currentUser);
	}

	async performUserAction(user: User) {
		// TODO unit test

		if (
			this._currentUser &&
			this._currentRoom &&
			this.state.room.userHasRoomPowers(this._currentUser, this._currentRoom)
		) {
			const action = await this.state.modal.performUserAction(user);
			console.log('PERFORM ACTION', action);
			this.handleUserAction(action, user);
		}
	}

	handleUserAction(action: string, user: User) {
		// TODO unit test
		switch (action) {
			case 'promote':
				break;
			case 'demote':
				break;
			case 'kick':
				this.state.room.kickUserFromCurrentRoom(user);
				break;
			case 'ban':
				break;
		}
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
