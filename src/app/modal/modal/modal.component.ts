import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { StateService } from 'src/app/services/state.service';
import { ChatRoom } from 'src/app/util/chatRoom';
import { Subscription } from 'rxjs';

@Component({
	selector: 'app-modal',
	templateUrl: './modal.component.html',
	styleUrls: [ './modal.component.scss' ]
})
export class ModalComponent implements OnInit, OnDestroy {
	@Input() state: StateService;
	public roomName: string;
	private currRoomSub: Subscription;

	constructor() {
		this.roomName = '';
	}

	ngOnInit(): void {
		this.currRoomSub = this.state.currentRoom().subscribe((rm: ChatRoom) => {
			if (rm) this.roomName = rm.getName();
		});
	}

	ngOnDestroy(): void {
		this.currRoomSub.unsubscribe();
	}

	submitRoomPassword(e: Event) {
		console.log(e);
	}
}
