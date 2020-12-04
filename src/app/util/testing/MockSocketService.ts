import { Observable, Observer, Subscriber } from 'rxjs';
import { ChatMessage } from '../chatMessage';
import { isDevMode } from '@angular/core';
import { Socket } from '../socket.interface';

export class MockSocketService implements Socket {
	// private socket: any;
	private chatLog: Array<ChatMessage>;
	private subscribers: any;
	constructor() {
		this.subscribers = {};
		this.chatLog = [
			new ChatMessage('Alice', 'AliceID', new Date(), 'Hi Bob!'),
			new ChatMessage('Bob', 'BobID', new Date(), 'Hello Alice!!')
		];
	}

	_setChatLog(chatLog: Array<ChatMessage>) {
		if (isDevMode()) this.chatLog = chatLog;
		else console.log(new Error('[ERROR] MockSocketService._setChatLog() is only available in dev mode.'));
	}

	listen(eventName: string) {
		let obs = new Observable((subscriber: Subscriber<any>) => {
			if (!Array.isArray(this.subscribers[eventName])) {
				this.subscribers[eventName] = new Array();
			}
			this.subscribers[eventName].push(subscriber);
		});
		return obs;
	}

	trigger(eventName: string, data: any): boolean {
		if (Array.isArray(this.subscribers[eventName])) {
			this.subscribers[eventName].forEach((sub: Subscriber<any>) => {
				sub.next(data);
			});
			return true;
		} else return false;
	}

	emit(eventName: string, data: any) {
		return Promise.resolve();
	}
}
