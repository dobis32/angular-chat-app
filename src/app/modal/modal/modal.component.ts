import { Component, OnInit, Input, OnDestroy, isDevMode } from '@angular/core';
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
	public activeModalName: string;
	public currentRoom: ChatRoom;
	public modalCB: Function;
	private _currRoomSub: Subscription;
	private _modalSub: Subscription;

	constructor() {
		this.activeModalName = '';
		this.modalCB = () => {};
	}

	ngOnInit(): void {
		this._currRoomSub = this.state.currentRoom().subscribe((rm: ChatRoom) => {
			if (rm) this.currentRoom = rm;
		});

		this._modalSub = this.state.modal().subscribe((data: any) => {
			let { modal, cb } = data;
			this.activeModalName = modal;
			this.modalCB = cb;
		});
	}

	ngOnDestroy(): void {
		if (this._currRoomSub) this._currRoomSub.unsubscribe();
		if (this._modalSub) this._modalSub.unsubscribe();
	}

	closeModal() {
		this.state.closeModal();
	}

	_getCurrRoomSub(): Subscription {
		if (isDevMode()) return this._currRoomSub;
		else {
			console.log(new Error('ERROR _getCurrRoomSub() is only available in dev mode.'));
			return undefined;
		}
	}

	_setCurrentRoom(rm: ChatRoom) {
		if (isDevMode()) {
			this.currentRoom = rm;
		} else {
			console.log(new Error('ERROR _setCurrentRoom() is only available in dev mode.'));
		}
	}

	_getModalSub(): Subscription {
		if (isDevMode()) return this._modalSub;
		else {
			console.log(new Error('ERROR _getModalSub() is only available in dev mode.'));
			return undefined;
		}
	}
}
