import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { StateService } from './services/state.service';
import { ChatMessage } from './util/chatMessage';
import { Subscription } from 'rxjs';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: [ './app.component.scss' ]
})
export class AppComponent implements OnInit {
	chatMessages: Array<ChatMessage>;
	chatForm: FormGroup;
	chatError: boolean;
	userName: string;
	localSubscriptions: Array<Subscription>;

	constructor(private formBuilder: FormBuilder, private state: StateService) {
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
		this.state.unsubscribeAllSocketSubs();
		this.localSubscriptions.forEach((sub) => {
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
