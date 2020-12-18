import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { StateService } from 'src/app/services/state.service';
import { ChatRoom } from 'src/app/util/chatRoom';
import { Subscription } from 'rxjs';
import { FormGroup } from '@angular/forms';

@Component({
	selector: 'app-modal',
	templateUrl: './modal.component.html',
	styleUrls: [ './modal.component.scss' ]
})
export class ModalComponent implements OnInit, OnDestroy {
	@Input() state: StateService;
	public activeModalName: string;
	public roomName: string;
	public modalCB: Function;
	private currRoomSub: Subscription;
	private modalSub: Subscription;
	private userInput: string;

	constructor() {
		this.roomName = '';
		this.userInput = '';
	}

	ngOnInit(): void {
		this.currRoomSub = this.state.currentRoom().subscribe((rm: ChatRoom) => {
			if (rm) this.roomName = rm.getName();
		});

		this.modalSub = this.state.modal().subscribe((data: any) => {
			let { modal, cb } = data;
			this.activeModalName = modal;
			this.modalCB = cb;
		});
	}

	ngOnDestroy(): void {
		if (this.currRoomSub) this.currRoomSub.unsubscribe();
		if (this.modalSub) this.modalSub.unsubscribe();
	}

	handleInput(fg: FormGroup) {
		this.closeModal();
	}

	closeModal() {
		this.state.closeModal();
	}
}
