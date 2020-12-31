import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { StateService } from 'src/app/services/state.service';
import { Subscription, Observable, Observer } from 'rxjs';
import { map } from 'rxjs/operators';
import { User } from 'src/app/util/user';
import { ChatRoom } from 'src/app/util/chatRoom';

@Component({
	selector: 'app-state-display',
	templateUrl: './state-display.component.html',
	styleUrls: [ './state-display.component.scss' ]
})
export class StateDisplayComponent implements OnInit, OnDestroy {
	@Input() state: StateService;
	private _subscriptions: Array<Subscription>;
	private _currentUser: User;
	private _currentRoom: Observable<ChatRoom>;
	public roomDOMData: Observable<any>;
	public roomID: Observable<string>;
	public roomName: Observable<string>;
	public roomCapacity: Observable<number>;
	public roomOwner: Observable<string>;
	public roomPassword: Observable<string>;

	public roomUsers: Observable<Array<string>>;
	public roomAdmins: Observable<Array<string>>;
	public roomBans: Observable<Array<string>>;

	constructor() {
		this._subscriptions = new Array();
	}

	ngOnInit(): void {
		let userSub = this.state.currentUser().subscribe((user) => {
			this._currentUser = user;
		});
		this._subscriptions.push(userSub);

		this._currentRoom = this.state.currentRoom();
		this.roomID = this._currentRoom.pipe(map((rm: ChatRoom) => (rm ? rm.getRoomID() : 'no room')));
		this.roomName = this._currentRoom.pipe(map((rm: ChatRoom) => (rm ? rm.getName() : 'no room')));
		this.roomCapacity = this._currentRoom.pipe(map((rm: ChatRoom) => (rm ? rm.getCapacity() : 0)));
		this.roomOwner = this._currentRoom.pipe(map((rm: ChatRoom) => (rm ? rm.getOwner() : 'no room')));
		this.roomPassword = this._currentRoom.pipe(map((rm: ChatRoom) => (rm ? rm.getPassword() : 'no room')));

		this.roomUsers = this._currentRoom.pipe(
			map((rm: ChatRoom) => (rm ? rm.getUsers().map((user: User) => user.getId()) : []))
		);

		this.roomAdmins = this._currentRoom.pipe(map((rm: ChatRoom) => (rm ? rm.getAdmins() : [])));

		this.roomBans = this._currentRoom.pipe(map((rm: ChatRoom) => (rm ? rm.getBans() : [])));
	}

	ngOnDestroy(): void {
		this._subscriptions.forEach((sub: Subscription) => {
			sub.unsubscribe();
		});
	}

	getCurrentUser(): any {
		return this._currentUser
			? { name: this._currentUser.getName(), id: this._currentUser.getId() }
			: { name: 'no user', id: 'no user' };
	}

	getCurrentRoom(): any {
		return;

		// 	return this.currentRoom
	}
}
