import { Injectable } from '@angular/core';
import { StateService } from './state.service';
import { Subscription, Observable, Observer } from 'rxjs';

@Injectable({
	providedIn: 'root'
})
export class ModalService {
	public roomPasswordPrompt: boolean;
	private promptResolve: Function;

	constructor(private state: StateService) {
		this.roomPasswordPrompt = false;
	}

	promptRoomPassword(roomName: string): Promise<any> {
		return new Promise((resolve, reject) => {
			if(this.activatePrompt('roomPassword')) {
				this.promptResolve = resolve;
				this.openModal();
			}
			else reject(new Error('Prompt does not exist'));
			
		})
	}

	resolvePrompt(input: string) {
		if(this.promptResolve) this.promptResolve(input)
		this.promptResolve = undefined;
	}
	
	activatePrompt(promptName: string): boolean {
		let res = false;
		switch(promptName) {
			case 'roomPassword':
				this.state.activateModal(promptName);
				res = true;
				break;
			default:
				res = false;
				break;
		}

		return res;
	}

	openModal() {
		this.state.openModal();
	}

	closeModal() {
		this.state.closeModal();
	}
}
