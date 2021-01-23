import { isDevMode } from '@angular/core';
import { ChatMessage } from '../../../util/chatMessage';
import { Observable } from 'rxjs';
import { SocketService } from '../../socket.service';
import { ChatRoom } from 'src/app/util/chatRoom';
import { Freshy } from '../../../util/freshy';

export class ChatLogStateModule {
	private _chatLog: Freshy<Array<ChatMessage>>;

	private _socket: SocketService;

	constructor(socket: SocketService) {
		this._chatLog = new Freshy<Array<ChatMessage>>([]);
		this._socket = socket;
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
		return this._chatLog.observableData;
	}

	chatLogIsDefined(): boolean {
		return Array.isArray(this._chatLog.getData());
	}

	addMessageToChatLog(message: ChatMessage) {
		let messages = this._chatLog.getData();
		messages.push(message);
		this._chatLog.refresh(messages);
	}

	resetChatLog(): void {
		this._chatLog.refresh([]);
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
		if (isDevMode()) return this._chatLog.getData();
		else {
			console.log(new Error('ERROR _getChatLog() is only availabe in dev mode.'));
			return undefined;
		}
	}

	_setChatLog(log: Array<ChatMessage>) {
		if (isDevMode()) this._chatLog.refresh(log);
		else {
			console.log(new Error('ERROR _setChatLog() is only availabe in dev mode.'));
		}
	}

	_getSocketService(): SocketService {
		if (isDevMode()) return this._socket;
		else {
			console.log(new Error('ERROR _getSocketService() is only availabe in dev mode.'));
			return undefined;
		}
	}
}
