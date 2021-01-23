import { Component, OnInit, Input, OnDestroy, isDevMode } from '@angular/core';
import { StateService } from 'src/app/services/state/state.service';
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
	private _modalCBSub: Subscription;
	private _activeNameSub: Subscription;

	constructor() {
		this.activeModalName = '';
		this.modalCB = () => {};
	}

	ngOnInit(): void {
		this._currRoomSub = this.state.room.currentRoom().subscribe((rm: ChatRoom) => {
			if (rm) this.currentRoom = rm;
		});

		this._modalCBSub = this.state.modal.modalCB().subscribe((cb: Function) => {
			this.modalCB = cb;
		});

		this._activeNameSub = this.state.modal.activeModalName().subscribe((modal: string) => {
			this.activeModalName = modal;
		});
	}

	ngOnDestroy(): void {
		if (this._currRoomSub) this._currRoomSub.unsubscribe();
		if (this._modalCBSub) this._modalCBSub.unsubscribe();
		if (this._activeNameSub) this._activeNameSub.unsubscribe();
	}

	closeModal() {
		this.state.modal.closeModal();
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

	_getModalCBSub(): Subscription {
		if (isDevMode()) return this._modalCBSub;
		else {
			console.log(new Error('ERROR _getModalCBSub() is only available in dev mode.'));
			return undefined;
		}
	}

	_getActiveNameSub(): Subscription {
		if (isDevMode()) return this._activeNameSub;
		else {
			console.log(new Error('ERROR _getActiveNameSub() is only available in dev mode.'));
			return undefined;
		}
	}

	_getCurrentRoomSub(): Subscription {
		if (isDevMode()) return this._currRoomSub;
		else {
			console.log(new Error('ERROR _getCurrentRoomSub() is only available in dev mode.'));
			return undefined;
		}
	}
}
