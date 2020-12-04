import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChatLogComponent } from './chat-log.component';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Component, DebugElement } from '@angular/core';
import { StateService } from '../services/state.service';
import { By } from '@angular/platform-browser';
import { ChatMessage } from '../util/chatMessage';
import { Observable, Subscriber, Subscription } from 'rxjs';
import { User } from '../util/user';

@Component({
	selector: `host-component`,
	template: `<app-chat-log [state]="getState()"></app-chat-log>`
})
class TestHostComponent {
	constructor(private state: StateService) {}

	getState() {
		return this.state;
	}
}

describe('ChatLogComponent', () => {
	let hostComponent: TestHostComponent;
	let hostFixture: ComponentFixture<TestHostComponent>;
	let chatLogDebugElement: DebugElement;
	let chatLogComponent: ChatLogComponent;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [ ReactiveFormsModule ],
			declarations: [ TestHostComponent, ChatLogComponent ],
			providers: [ FormBuilder ]
		}).compileComponents();
	});

	beforeEach(() => {
		hostFixture = TestBed.createComponent(TestHostComponent);
		hostComponent = hostFixture.componentInstance;
		hostFixture.detectChanges();
		chatLogDebugElement = hostFixture.debugElement.query(By.directive(ChatLogComponent));
		chatLogComponent = chatLogDebugElement.componentInstance;
	});

	it('should create', () => {
		expect(chatLogComponent).toBeTruthy();
		expect(hostComponent).toBeTruthy();
	});

	// Functions for the DOM
	it('should have a public function/method that returns the array of ChatMessages', () => {
		expect(typeof chatLogComponent.getChatMessages).toEqual('function');
		expect(Array.isArray(chatLogComponent.getChatMessages())).toBeTrue();
	});

	it('should have a public function/method that returns the chat form', () => {
		expect(typeof chatLogComponent.getChatMessages).toEqual('function');
		expect(chatLogComponent.getChatForm()).toBeTruthy();
	});

	// Injections

	it('should have the StateService injected into it from the parent/host component', () => {
		expect(hostComponent.getState()).toEqual(chatLogComponent.state);
	});

	it('should have a FormBuilder', () => {
		expect(chatLogComponent._getFormBuilder()).toBeTruthy();
	});

	// Subscriptions
	it('should, on init, subscribe to the chat log from the StateService and push that subscription to the local subscriptions array', () => {
		chatLogComponent.unsubLocalSubscriptions();

		let chatLog = [ new ChatMessage('Denny', 'DennyID', new Date(), 'hello') ];
		let initSubCount = chatLogComponent._getLocalSubscriberArray().length;
		let localSubscribersArraySpy = spyOn(chatLogComponent._getLocalSubscriberArray(), 'push').and.callThrough();
		let chatLogSubSpy = spyOn(chatLogComponent.state, 'chatLog').and.callFake(() => {
			return new Observable((sub: Subscriber<Array<ChatMessage>>) => {
				sub.next(chatLog);
			});
		});

		chatLogComponent.ngOnInit();

		expect(chatLogSubSpy).toHaveBeenCalled();
		expect(chatLogComponent.getChatMessages()).toEqual(chatLog);
		expect(localSubscribersArraySpy).toHaveBeenCalled();
		expect(chatLogComponent._getLocalSubscriberArray().length).toBeGreaterThan(initSubCount);
	});

	it('should, on init, subscribe to the current user data from the StateService and push that subscription to the local subscriptions array', () => {
		// user class not implemented; this test will change at some point

		chatLogComponent.unsubLocalSubscriptions();

		let user = new User('Denny Dingus', 'some_nonce');
		let initSubCount = chatLogComponent._getLocalSubscriberArray().length;
		let localSubscribersArraySpy = spyOn(chatLogComponent._getLocalSubscriberArray(), 'push').and.callThrough();
		let currentUserSubSpy = spyOn(chatLogComponent.state, 'currentUser').and.callFake(() => {
			return new Observable((sub: Subscriber<User>) => {
				sub.next(user);
			});
		});

		chatLogComponent.ngOnInit();

		expect(currentUserSubSpy).toHaveBeenCalled();
		expect(chatLogComponent.getCurrentUser()).toEqual(user);
		expect(localSubscribersArraySpy).toHaveBeenCalled();
		expect(chatLogComponent._getLocalSubscriberArray().length).toBeGreaterThan(initSubCount);
	});

	it('should have a function for unsubscribing from all local subscriptions', () => {
		let testSubs = [ new Subscription(), new Subscription() ];
		let subSpy1 = spyOn(testSubs[0], 'unsubscribe').and.callThrough();
		let subSpy2 = spyOn(testSubs[1], 'unsubscribe').and.callThrough();
		chatLogComponent._setLocalSubscriberArray(testSubs);
		let initSubCount = chatLogComponent._getLocalSubscriberArray().length;

		chatLogComponent.unsubLocalSubscriptions();

		expect(typeof chatLogComponent.unsubLocalSubscriptions).toEqual('function');
		expect(chatLogComponent._getLocalSubscriberArray().length).toBeLessThan(initSubCount);
		expect(subSpy1).toHaveBeenCalled();
		expect(subSpy2).toHaveBeenCalled();
	});

	it('should unsubsribe from all local subscriptions when it is destroyed', () => {
		let unsubLocalSubsSpy = spyOn(chatLogComponent, 'unsubLocalSubscriptions').and.callThrough();

		chatLogComponent.ngOnDestroy();

		expect(unsubLocalSubsSpy).toHaveBeenCalled();
	});

	it('should have a function that returns true if the ChatMessage argument has a userID that matches the current user and false otherwise', () => {
		let d = new Date();
		let username = 'denny';
		let userID = 'dennyID';
		let user = new User(username, userID);
		let userMsg = new ChatMessage(username, userID, d, 'hello world!');
		let otherMsg = new ChatMessage('other', 'otherID', d, 'goodbye!!!!');
		chatLogComponent._setCurrentUser(user);

		let result1 = chatLogComponent.isClientMessage(userMsg);
		let result2 = chatLogComponent.isClientMessage(otherMsg);

		expect(typeof chatLogComponent.isClientMessage).toEqual('function');
		expect(result1).toBeTrue();
		expect(result2).toBeFalse();
	});
});
