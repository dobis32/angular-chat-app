import { Component, OnInit, Input, OnDestroy, Output, EventEmitter } from '@angular/core';
import { User } from 'src/app/util/user';

@Component({
	selector: 'app-user-action-modal',
	templateUrl: './user-action-modal.component.html',
	styleUrls: [ './user-action-modal.component.scss' ]
})
export class UserActionModalComponent implements OnInit {
	@Input() user: User;
	@Input() cb: Function;
	@Output() close: EventEmitter<void> = new EventEmitter<void>();

	constructor() {
		this.user = new User('', '');
	}

	ngOnInit(): void {}

	submit(action: string): void {
		this.cb(action);
		this.close.emit();
	}

	stopPropagation(event: Event) {
		event.stopPropagation();
	}
}
