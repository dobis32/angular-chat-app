import { Component, OnInit, Input } from '@angular/core';
import { ChatMessage } from '../util/chatMessage';

@Component({
	selector: 'app-chat-message',
	templateUrl: './chat-message.component.html',
	styleUrls: [ './chat-message.component.scss' ]
})
export class ChatMessageComponent implements OnInit {
	@Input() messageBuffer: ChatMessage;
	private _message: ChatMessage;
	constructor() {
		this.messageBuffer = new ChatMessage('', new Date(), '');
	}

	ngOnInit(): void {
		this._message = this.messageBuffer;
	}

	userName() {
		return this._message.getUser();
	}

	text() {
		return this._message.getText();
	}
}
