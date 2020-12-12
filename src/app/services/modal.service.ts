import { Injectable } from '@angular/core';
import { StateService } from './state.service';
import { Subscription, Observable, Observer } from 'rxjs';

@Injectable({
	providedIn: 'root'
})
export class ModalService {
	public roomPasswordPrompt: boolean;
	private stateModalObserver: Observer<boolean>;

	constructor() {
		this.roomPasswordPrompt = false;
	}

	state(): Observable<boolean> {
		return new Observable((obs: Observer<boolean>) => {
			obs.next(false); // init open-state of modal
			this.stateModalObserver = obs;
		});
	}

	promptRoomPassword(roomName: string) {
		this.openModal();
		this.roomPasswordPrompt = true;
	}

	openModal() {
		this.stateModalObserver.next(true);
	}

	closeModal() {
		this.stateModalObserver.next(false);
		this.resetModalComponent();
	}

	resetModalComponent() {
		this.roomPasswordPrompt = false;
	}
}
