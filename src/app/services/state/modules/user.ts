import { isDevMode } from '@angular/core';
import { User } from '../../../util/user';
import { Observable } from 'rxjs';
import { SocketService } from '../../socket.service';
import { Freshy } from 'src/app/util/freshy';
export class UserStateModule {
	private _currentUser: Freshy<User>;
	private _loggedIntStatus: Freshy<boolean>;
	private _socket: SocketService;

	constructor(socket: SocketService) {
		this._currentUser = new Freshy<User>();
		this._loggedIntStatus = new Freshy<boolean>(false);
		this._socket = socket;
	}

	state() {
		return this._currentUser.observableData;
	}

	getCurrentUser(): User {
		return this._currentUser.getData();
	}

	login(name: string, id: string) {
		this._currentUser.refresh(new User(name, id));
		this._loggedIntStatus.refresh(true);
	}

	logout() {
		this._currentUser.refresh(undefined);
		this._loggedIntStatus.refresh(false);
	}

	loggedInStatus(): Observable<boolean> {
		return this._loggedIntStatus.observableData;
	}

	attemptLogin(username: string, password: string): boolean {
		try {
			this._socket.emit('login', { username, password });
			return true;
		} catch (error) {
			return false;
		}
	}

	_getCurrentUserFreshy(): Freshy<User> {
		if (isDevMode()) return this._currentUser;
		else {
			console.log(new Error('ERROR StateService._getCurrentUserFreshy() is only availabe in dev mode.'));
			return undefined;
		}
	}

	_getLoggedInStatusFreshy(): Freshy<boolean> {
		if (isDevMode()) return this._loggedIntStatus;
		else {
			console.log(new Error('ERROR StateService._getLoggedInStatusFreshy() is only availabe in dev mode.'));
			return undefined;
		}
	}

	_setCurrentUser(user: User) {
		if (isDevMode()) this._currentUser.refresh(user);
		else {
			console.log(new Error('ERROR StateService._setCurrentUser() is only availabe in dev mode.'));
		}
	}

	_getCurrentUser(): User {
		if (isDevMode()) return this._currentUser.getData();
		else {
			console.log(new Error('ERROR StateService._getCurrentUser() is only availabe in dev mode.'));
			return undefined;
		}
	}

	_getSocketService(): SocketService {
		if (isDevMode()) return this._socket;
		else {
			console.log('Sorry _getSocketService() is only available in dev mode');
			return undefined;
		}
	}
}
