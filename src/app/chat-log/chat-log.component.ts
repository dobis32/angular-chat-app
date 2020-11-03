import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ChatMessage } from '../util/chatMessage';
import { StateService } from '../services/state.service';

@Component({
	selector: 'app-chat-log',
	templateUrl: './chat-log.component.html',
	styleUrls: [ './chat-log.component.scss' ]
})
export class ChatLogComponent implements OnInit, OnDestroy {
	@Input() state: StateService;
	chatMessages: Array<ChatMessage>;
	chatForm: FormGroup;
	chatError: boolean;
	userName: string;
	localSubscriptions: Array<Subscription>;

	constructor(private formBuilder: FormBuilder) {
		this.chatError = false;
		this.chatForm = this.formBuilder.group({
			message: new FormControl('', [ Validators.required, Validators.minLength(1) ])
		});

		this.chatMessages = new Array();
		this.localSubscriptions = new Array();
	}

	ngOnInit() {
		let chatSub = this.state.chatLog().subscribe((chatLog) => {
			this.chatMessages = chatLog;
		});
		this.localSubscriptions.push(chatSub);
		let usernameSub = this.state.currentUser().subscribe((username) => {
			this.userName = username;
		});
		this.localSubscriptions.push(usernameSub);
	}

	ngOnDestroy() {
		this.localSubscriptions.forEach((sub: Subscription) => {
			sub.unsubscribe();
		});
	}

	sendMessage(fg: FormGroup) {
		let message = new ChatMessage(this.userName, new Date(), fg.value.message);
		this.state
			.sendMessage(message)
			.then(() => {
				this.chatError = false;
			})
			.catch((error) => {
				console.log(error);
				this.chatError = true;
			});
	}

	messageFromUser() {
		return false;
	}
}
