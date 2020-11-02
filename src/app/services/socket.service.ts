import { Injectable, isDevMode } from '@angular/core';
import * as io from 'socket.io-client';
import { Observable, Subscriber } from 'rxjs';
import { first } from 'rxjs/operators';
import { Socket } from '../util/socket.interface';

@Injectable({
	providedIn: 'root'
})
export class SocketService implements Socket {
	private socket: any;
	private uri: string = 'ws://localhost:3000';
	constructor() {
		this.socket = io(this.uri);
	}

	_getSocket() {
		if (isDevMode()) return this.socket;
		else console.log('This function can only be used in Dev mode');
	}

	_setSocket(socket: any) {
		if (isDevMode()) this.socket = socket;
		else console.log('This function can only be used in Dev mode');
	}

	listen(eventName: string) {
		let obs = new Observable((subscriber: Subscriber<any>) => {
			this.socket.on(eventName, (data: any) => {
				subscriber.next(data);
			});
		});
		return obs.pipe(first());
	}

	emit(eventName: string, data: any) {
		return new Promise((resolve, reject) => {
			try {
				this.socket.emit(eventName, data);
				resolve(true);
			} catch (error) {
				reject(error);
			}
		});
	}

	trigger(): boolean {
		console.log(new Error('ERROR SocketService.trigger() is only available in MockSocketService'));
		return false;
	}
}