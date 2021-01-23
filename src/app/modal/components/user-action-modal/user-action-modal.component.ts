import { Component, OnInit, Input } from '@angular/core';
import { StateService } from 'src/app/services/state/state.service';
import { User } from 'src/app/util/user';

@Component({
	selector: 'app-user-action-modal',
	templateUrl: './user-action-modal.component.html',
	styleUrls: [ './user-action-modal.component.scss' ]
})
export class UserActionModalComponent implements OnInit {
	@Input() cb: Function;
	@Input() state: StateService;

	public user: User;

	constructor() {
		this.user = new User('', '');
	}

	ngOnInit(): void {
		this.user = this.cb();
	}

	closeModal(): void {
		this.state.modal.closeModal();
	}

	stopPropagation(event: Event) {
		event.stopPropagation();
	}

	promoteUser() {
		// TODO unit test
		this.state.room.promoteUser(this.user);
	}

	demoteUser() {
		// TODO unit test
		this.state.room.demoteUser(this.user);
	}

	kickUser() {
		// TODO unit test
		this.state.room.kickUser(this.user);
	}

	banUser() {
		// TODO unit test
		this.state.room.banUser(this.user);
	}
}
