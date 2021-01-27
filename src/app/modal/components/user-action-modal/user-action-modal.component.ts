import { Component, OnInit, Input, OnDestroy, Output, EventEmitter } from '@angular/core';
import { User } from 'src/app/util/user';

@Component({
	selector: 'app-user-action-modal',
	templateUrl: './user-action-modal.component.html',
	styleUrls: [ './user-action-modal.component.scss' ]
})
export class UserActionModalComponent implements OnInit, OnDestroy {
	@Input() user: User;
	@Input() cb: Function;
	@Output() close: EventEmitter<void> = new EventEmitter<void>(); // TODO unit test

	constructor() {
		this.user = new User('', '');
	}

	ngOnInit(): void {}

	ngOnDestroy(): void {}

	submit(action: string): void {
		// TODO unit test
		this.cb(action);
		this.close.emit();
	}

	stopPropagation(event: Event) {
		event.stopPropagation();
	}
}
