import { isDevMode } from '@angular/core';
import { Observer, Observable, Subscription, Subscriber } from 'rxjs';

export class ModalStateModule {
	private _modalCB: Function;
	private _activeModalName: string;
	private _modalSubscriber: Observer<any>;
	private _modalActiveStatus: boolean;
	private _modalActiveStatusSubscriber: Observer<boolean>;
	constructor() {
		this._activeModalName = '';
		this._modalActiveStatus = false;
		this._modalCB = () => {};

		this._modalSubscriber = undefined;
		this._modalActiveStatusSubscriber = undefined;
	}

	state(): Observable<any> {
		return new Observable((sub: Observer<any>) => {
			sub.next({ modal: this._activeModalName, cb: this._modalCB });
			this._modalSubscriber = sub;
		});
	}

	modalActiveStatus() {
		return new Observable((sub: Observer<boolean>) => {
			sub.next(this._modalActiveStatus);
			this._modalActiveStatusSubscriber = sub;
		});
	}

	openModal(modal: string, cb: Function) {
		this._modalActiveStatus = true;
		this._activeModalName = modal;
		this._modalCB = cb;
		this.refreshModalSubscriber();
		this.refreshModalActiveStatusSubscriber();
	}

	closeModal() {
		this._modalActiveStatus = false;
		this._activeModalName = '';
		this._modalCB = new Function();
		this.refreshModalSubscriber();
		this.refreshModalActiveStatusSubscriber();
	}

	refreshModalSubscriber() {
		if (this._modalSubscriber)
			this._modalSubscriber.next({
				modal: this._activeModalName,
				cb: this._modalCB
			});
	}

	refreshModalActiveStatusSubscriber() {
		if (this._modalActiveStatusSubscriber) this._modalActiveStatusSubscriber.next(this._modalActiveStatus);
	}

	_getActiveModalName(): string {
		if (isDevMode()) return this._activeModalName;
		else {
			console.log(new Error('ERROR StateService._getActiveModalName() is only availabe in dev mode.'));
			return undefined;
		}
	}

	_setActiveModalName(modalName: string) {
		if (isDevMode()) this._activeModalName = modalName;
		else {
			console.log(new Error('ERROR StateService._setActiveModalName() is only availabe in dev mode.'));
		}
	}

	_getModalCB(): Function {
		if (isDevMode()) return this._modalCB;
		else {
			console.log(new Error('ERROR StateService._getModalCB() is only availabe in dev mode.'));
			return undefined;
		}
	}

	_setModalCB(cb: Function) {
		if (isDevMode()) this._modalCB = cb;
		else {
			console.log(new Error('ERROR StateService._setModalCB() is only availabe in dev mode.'));
		}
	}

	_getModalActiveStatus(): boolean {
		if (isDevMode()) return this._modalActiveStatus;
		else {
			console.log(new Error('ERROR StateService._getModalActiveStatus() is only availabe in dev mode.'));
			return undefined;
		}
	}

	_setModalActiveStatus(status: boolean) {
		if (isDevMode()) this._modalActiveStatus = status;
		else {
			console.log(new Error('ERROR StateService._setModalActiveStatus() is only availabe in dev mode.'));
		}
	}

	_getModalActiveStatusSubscriber(): Observer<boolean> {
		if (isDevMode()) return this._modalActiveStatusSubscriber;
		else {
			console.log(
				new Error('ERROR StateService._getModalActiveStatusSubscriber() is only availabe in dev mode.')
			);
			return undefined;
		}
	}

	_getModalSubscriber(): Observer<any> {
		if (isDevMode()) return this._modalSubscriber;
		else {
			console.log(new Error('ERROR StateService._getModalSubscriber() is only availabe in dev mode.'));
			return undefined;
		}
	}
}
