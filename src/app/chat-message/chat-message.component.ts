import { Component, OnInit, Input } from '@angular/core';
import { ChatMessage } from '../util/chatMessage';

@Component({
	selector: 'app-chat-message',
	templateUrl: './chat-message.component.html',
	styleUrls: [ './chat-message.component.scss' ]
})
export class ChatMessageComponent implements OnInit {
	@Input() messageBuffer: ChatMessage;
	@Input() clientMessage: boolean;
	private _message: ChatMessage;
	private _messageType: string;
	constructor() {
		this.messageBuffer = new ChatMessage('', '', new Date(), '');
	}

	ngOnInit(): void {
		this._message = this.messageBuffer;
		this._messageType = this.clientMessage ? 'client-message' : 'user-message';
		console.log('MESSAGE TYPE', this._messageType);
	}

	getMessageType(): string {
		return this._messageType;
	}

	userName() {
		return this._message.getUser();
	}

	text() {
		return this._message.getText();
	}
}
