import { isDevMode } from '@angular/core';
import { User } from '../../../util/user';
import { Observer, Observable } from 'rxjs';
import { SocketService } from '../../socket.service';
export class UserStateModule {

    private _currentUser: User;
    private _socket: SocketService
    private _currentUserSubscribers: Array<Observer<User>>;
	private _loggedInStatusSubscribers: Array<Observer<boolean>>;


    constructor(socket: SocketService) {
		this._currentUser = undefined;
        this._currentUserSubscribers = new Array();
        this._loggedInStatusSubscribers = new Array();
        this._socket = socket;
    }

    state() {
		return new Observable((subscriber: Observer<User>) => {
			this._currentUserSubscribers.push(subscriber);
			subscriber.next(this._currentUser);
		});
    }
    
    getCurrentUser(): User { // TODO unit test
        return this._currentUser;
    }

	currentRoomIndex(): Observable<number> {
		return new Observable((subscriber: Observer<number>) => {});
	}

	login(name, id) {
		this._currentUser = new User(name, id);
		this.updateCurrentUserSubscribers();
		this.updateLoggedInSubscribers();
	}

	logout() {

		this._currentUser = undefined;
		this.updateCurrentUserSubscribers();
		this.updateLoggedInSubscribers();
	}

	loggedInStatus(): Observable<boolean> {
		return new Observable((subscriber: Observer<boolean>) => {
			let bool = this._currentUser ? true : false;

			this._loggedInStatusSubscribers.push(subscriber);
			subscriber.next(bool);
		});
	}

	updateCurrentUserSubscribers(): void {
		this._currentUserSubscribers.forEach((sub) => {
			sub.next(this._currentUser);
		});
	}

	updateLoggedInSubscribers(): void {
		this._loggedInStatusSubscribers.forEach((sub) => {
			sub.next(this._currentUser ? true : false);
		});
	}

	attemptLogin(username: string, password: string): boolean {
		try {
			this._socket.emit('login', { username, password });
			return true;
		} catch (error) {
			return false;
		}
	}

	_setUser(user: User) {
		if (isDevMode()) this._currentUser = user;
		else {
			console.log(new Error('ERROR StateService._getCurrentUser() is only availabe in dev mode.'));
		}
	}

	_getCurrentUser(): User {
		if (isDevMode()) return this._currentUser;
		else {
			console.log(new Error('ERROR StateService._getCurrentUser() is only availabe in dev mode.'));
			return undefined;
		}
	}

	_getCurrentUserSubscribers(): Array<Observer<User>> {
		if (isDevMode()) return this._currentUserSubscribers;
		else {
			console.log(new Error('ERROR StateService._getCurrentUserSubscribers() is only availabe in dev mode.'));
			return undefined;
		}
	}

	_getLoggedInStatusSubscribers(): Array<Observer<boolean>> {
		if (isDevMode()) return this._loggedInStatusSubscribers;
		else {
			console.log(new Error('ERROR StateService._getLoggedInStatusSubscribers() is only availabe in dev mode.'));
			return undefined;
		}
	}
}