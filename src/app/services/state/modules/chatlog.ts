import { isDevMode } from '@angular/core';
import { ChatMessage } from '../../../util/chatMessage';
import { Observer, Observable } from 'rxjs';
import { SocketService } from '../../socket.service';
import { ChatRoom } from 'src/app/util/chatRoom';

export class ChatLogStateModule {
	private _chatLog: Array<ChatMessage>;
	private _socket: SocketService;
	private _chatLogSubscribers: Array<Observer<Array<ChatMessage>>>;

	constructor(socket: SocketService) {
		this._chatLog = new Array();
		this._socket = socket;
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
		this._chatLog = new Array();
	}

	sendMessage(message: ChatMessage, room: ChatRoom): boolean {
		try {
			this._socket.emit('message', { ...message.toJSON(), room: room.getRoomID() });
			return true;
		} catch (error) {
			console.log('ERROR SENDING MESSAGE -- ', error.message);
			return false;
		}
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

	_getSocketService(): SocketService {
		if (isDevMode()) return this._socket;
		else {
			console.log(new Error('ERROR StateService._getSocketService() is only availabe in dev mode.'));
			return undefined;
		}
	}
}
