import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { StateService } from 'src/app/services/state.service';
import { Subscription } from 'rxjs';
import { User } from 'src/app/util/user';
import { ChatRoom } from 'src/app/util/chatRoom';

@Component({
	selector: 'app-state-display',
	templateUrl: './state-display.component.html',
	styleUrls: [ './state-display.component.scss' ]
})
export class StateDisplayComponent implements OnInit, OnDestroy {
	@Input() state: StateService;
	private subscriptions: Array<Subscription>;
	private currentUser: User;
	private currentRoom: ChatRoom;

	constructor() {
		this.subscriptions = new Array();
	}

	ngOnInit(): void {
		let userSub = this.state.currentUser().subscribe((user) => {
			this.currentUser = user;
		});
		this.subscriptions.push(userSub);

		let roomSub = this.state.currentRoom().subscribe((room) => {
			this.currentRoom = room;
		});
		this.subscriptions.push(roomSub);
	}

	ngOnDestroy(): void {
		this.subscriptions.forEach((sub: Subscription) => {
			sub.unsubscribe();
		});
	}

	getCurrentUser(): any {
		return this.currentUser
			? { name: this.currentUser.getName(), id: this.currentUser.getId() }
			: { name: 'no user', id: 'no user' };
	}

	getCurrentRoom(): any {
		return this.currentRoom
			? {
					id: this.currentRoom.getRoomID(),
					name: this.currentRoom.getName(),
					capacity: this.currentRoom.getCapacity(),
					users: this.currentRoom.getUsers().length,
					password: this.currentRoom.getPassword()
				}
			: {
					id: 'no room',
					name: 'no room',
					capacity: 'no room',
					users: 'no room',
					password: 'no room'
				};
	}
}
