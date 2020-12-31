import { isDevMode } from '@angular/core';
import { ChatMessage } from '../../../util/chatMessage';
import { Observer, Observable } from 'rxjs';

export class ChatLogStateModule {
	private _chatLog: Array<ChatMessage>;

	private _chatLogSubscribers: Array<Observer<Array<ChatMessage>>>;

	constructor() {
		this._chatLog = new Array();

		this._chatLogSubscribers = new Array();
	}

	parseChatLog(messages: Array<any>): Array<ChatMessage> {
		let parsedMessages: Array<ChatMessage> = new Array();
		if (Array.isArray(messages))
			messages.forEach((notParsed) => {
				let { user, id, dateString, text } = notParsed;
				let date = new Date(dateString);
				parsedMessages.push(new ChatMessage(user, id, date, text));
			});
		return parsedMessages;
	}

	state(): Observable<Array<ChatMessage>> {
		return new Observable((subscriber: Observer<any>) => {
			this._chatLogSubscribers.push(subscriber);
			subscriber.next(this._chatLog);
		});
	}

	chatLogIsDefined(): boolean {
		// TODO unit test
		return Array.isArray(this._chatLog);
	}

	addMessageToChatLog(message: ChatMessage) {
		this._chatLog.push(message);
	}

	updateChatLogSubscribers(): void {
		this._chatLogSubscribers.forEach((sub: Observer<Array<ChatMessage>>) => {
			sub.next(this._chatLog);
		});
	}

	resetChatLog(): void {
		console.log('RESETTING CHAT LOG');
		this._chatLog = new Array();
	}

	_getChatLog(): Array<ChatMessage> {
		if (isDevMode()) return this._chatLog;
		else {
			console.log(new Error('ERROR StateService._getChatLog() is only availabe in dev mode.'));
			return undefined;
		}
	}

	_setChatLog(log: Array<ChatMessage>): Array<ChatMessage> {
		if (isDevMode()) return this._chatLog;
		else {
			console.log(new Error('ERROR StateService._setChatLog() is only availabe in dev mode.'));
			return undefined;
		}
	}

	_getChatLogSubscribers(): Array<Observer<Array<ChatMessage>>> {
		if (isDevMode()) return this._chatLogSubscribers;
		else {
			console.log(new Error('ERROR StateService._getChatLogSubscribers() is only availabe in dev mode.'));
			return undefined;
		}
	}
}
