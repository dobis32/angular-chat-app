import { isDevMode } from '@angular/core';
import { Observable } from 'rxjs';
import { ChatRoom } from '../../../util/chatRoom';
import { Freshy } from '../../../util/freshy';
import { User } from '../../../util/user';

export class ModalStateModule {
	private _modalActiveStatus: Freshy<boolean>;
	private _modalCB: Freshy<Function>;
	private _activeModalName: Freshy<string>;
	constructor() {
		this._modalActiveStatus = new Freshy<boolean>(false);
		this._modalCB = new Freshy<Function>(() => {});
		this._activeModalName = new Freshy<string>('');
	}

	promptRoomPassword(): Promise<string> {
		return new Promise((resolve, reject) => {
			try {
				this.openModal('promptRoomPassword', (userInput: string) => {
					resolve(userInput);
				});
			} catch (error) {
				reject(error);
			}
		});
	}

	editRoom(room: ChatRoom): Promise<ChatRoom> {
		return new Promise((resolve, reject) => {
			try {
				this.openModal('editRoom', (name: string, capacity: number, password: string) => {
					resolve(
						new ChatRoom(
							room.getRoomID(),
							name,
							capacity,
							room.getOwner(),
							room.getUsers(),
							password,
							room.getAdmins(),
							room.getBans()
						)
					);
				});
			} catch (error) {
				reject(error);
			}
		});
	}

	createRoom(): Promise<any> {
		return new Promise((resolve, reject) => {
			try {
				this.openModal('createRoom', (name: string, capacity: number, password: string) => {
					resolve({ name, capacity, password });
				});
			} catch (error) {
				reject(error);
			}
		});
	}

	modalCB(): Observable<Function> {
		return this._modalCB.observableData;
	}

	activeModalName(): Observable<string> {
		return this._activeModalName.observableData;
	}

	modalActiveStatus() {
		return this._modalActiveStatus.observableData;
	}

	openModal(modal: string, cb: Function) {
		this._modalActiveStatus.refresh(true);
		this._activeModalName.refresh(modal);
		this._modalCB.refresh(cb);
	}

	closeModal() {
		this._modalActiveStatus.refresh(false);
		this._activeModalName.refresh('');
		this._modalCB.refresh(() => {});
	}

	performUserAction(user: User) {
		this.openModal('userAction', () => {
			return user;
		});
	}

	_getActiveModalName(): string {
		if (isDevMode()) return this._activeModalName.getData();
		else {
			console.log(new Error('ERROR StateService._getActiveModalName() is only availabe in dev mode.'));
			return undefined;
		}
	}

	_setActiveModalName(modalName: string) {
		if (isDevMode()) this._activeModalName.refresh(modalName);
		else {
			console.log(new Error('ERROR StateService._setActiveModalName() is only availabe in dev mode.'));
		}
	}

	_getModalCB(): Function {
		if (isDevMode()) return this._modalCB.getData();
		else {
			console.log(new Error('ERROR StateService._getModalCB() is only availabe in dev mode.'));
			return undefined;
		}
	}

	_setModalCB(cb: Function) {
		if (isDevMode()) this._modalCB.refresh(cb);
		else {
			console.log(new Error('ERROR StateService._setModalCB() is only availabe in dev mode.'));
		}
	}

	_getModalActiveStatus(): boolean {
		if (isDevMode()) return this._modalActiveStatus.getData();
		else {
			console.log(new Error('ERROR StateService._getModalActiveStatus() is only availabe in dev mode.'));
			return undefined;
		}
	}

	_setModalActiveStatus(status: boolean) {
		if (isDevMode()) this._modalActiveStatus.refresh(status);
		else {
			console.log(new Error('ERROR StateService._setModalActiveStatus() is only availabe in dev mode.'));
		}
	}

	_getModalActiveStatusFreshy(): Freshy<boolean> {
		if (isDevMode()) return this._modalActiveStatus;
		else {
			console.log(new Error('ERROR StateService._getModalActiveStatusFreshy() is only availabe in dev mode.'));
		}
	}

	_getActiveModalNameFreshy(): Freshy<string> {
		if (isDevMode()) return this._activeModalName;
		else {
			console.log(new Error('ERROR StateService._getActiveModalNameFreshy() is only availabe in dev mode.'));
		}
	}

	_getModalCBFreshy(): Freshy<Function> {
		if (isDevMode()) return this._modalCB;
		else {
			console.log(new Error('ERROR StateService._getModalCBFreshy() is only availabe in dev mode.'));
		}
	}
}
