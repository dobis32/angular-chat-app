import { Component, OnInit, Input, OnDestroy, isDevMode } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { Subscription, Subscriber } from 'rxjs';
import { ChatMessage } from '../util/chatMessage';
import { StateService } from '../services/state.service';
import { User } from '../util/User';
import { ChatRoom } from '../util/chatRoom';

@Component({
	selector: 'app-chat-log',
	templateUrl: './chat-log.component.html',
	styleUrls: [ './chat-log.component.scss' ]
})
export class ChatLogComponent implements OnInit, OnDestroy {
	@Input() state: StateService;
	private chatMessages: Array<ChatMessage>;
	private chatForm: FormGroup;
	chatError: boolean;
	private currentUser: User;
	private localSubscriptions: Array<Subscription>;
	private currentRoom: ChatRoom;

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

		let userSub = this.state.currentUser().subscribe((user: User) => {
			this.currentUser = user; // Gotta change this when I implement User class
		});
		this.localSubscriptions.push(userSub);

		let chatRoomSub = this.state.currentRoom().subscribe((room: ChatRoom) => {
			this.currentRoom = room;
		});
		this.localSubscriptions.push(chatRoomSub);
	}

	ngOnDestroy() {
		this.unsubLocalSubscriptions();
	}

	// Functions for the DOM
	getChatMessages(): Array<ChatMessage> {
		return this.chatMessages;
	}

	getChatForm(): FormGroup {
		return this.chatForm;
	}

	getCurrentUser(): User {
		// this will return a user class later
		return this.currentUser;
	}

	getCurrentRoom(): ChatRoom {
		return this.currentRoom;
	}

	async sendChatMessage(fg: FormGroup) {
		try {
			if (!fg.valid) throw new Error('ERROR message was invalid!');
			let message = new ChatMessage(this.currentUser.getName(), new Date(), fg.value.message);
			let result = await this.state.sendMessage(message);
			if (result) {
				this.chatError = false;
				fg.reset();
			} else {
				throw new Error();
			}
		} catch (error) {
			console.log(error);
			this.chatError = true;
		}
	}

	messageFromUser() {
		return false;
	}

	unsubLocalSubscriptions(): void {
		while (this.localSubscriptions.length) {
			this.localSubscriptions.shift().unsubscribe();
		}
	}

	_getFormBuilder(): FormBuilder {
		if (isDevMode()) return this.formBuilder;
		else {
			console.log(new Error('ERROR _getFormBuilder() is only available in dev mode'));
			return undefined;
		}
	}

	_getLocalSubscriberArray(): Array<Subscription> {
		if (isDevMode()) return this.localSubscriptions;
		else {
			console.log(new Error('ERROR _getLocalSubscriberArray() is only available in dev mode'));
			return undefined;
		}
	}

	_setLocalSubscriberArray(localSubs: Array<Subscription>) {
		if (isDevMode()) this.localSubscriptions = localSubs;
		else console.log(new Error('ERROR _getLocalSubscriberArray() is only available in dev mode'));
	}
}
