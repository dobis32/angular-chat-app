import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChatLogComponent } from './chat-log.component';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Component, DebugElement } from '@angular/core';
import { StateService } from '../services/state/state.service';
import { By } from '@angular/platform-browser';
import { ChatMessage } from '../util/chatMessage';
import { Observable, Subscriber, Subscription, Observer } from 'rxjs';
import { User } from '../util/user';
import { ChatRoom } from '../util/chatRoom';

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

	// DOM-Related
	it('should have a public function/method that returns the array of ChatMessages', () => {
		expect(typeof chatLogComponent.getChatMessages).toEqual('function');
		expect(Array.isArray(chatLogComponent.getChatMessages())).toBeTrue();
	});

	it('should have a public function/method that returns the chat form', () => {
		expect(typeof chatLogComponent.getChatMessages).toEqual('function');
		expect(chatLogComponent.getChatForm()).toBeDefined();
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

	it('should have a boolean for indicating a chat error', () => {
		expect(typeof chatLogComponent.chatError).toEqual('boolean');
	});

	it('should have a boolean that determines if there is a current room or not', () => {
		expect(typeof chatLogComponent.currentRoomBool).toEqual('boolean');
	});

	// Init
	it('should create', () => {
		expect(chatLogComponent).toBeTruthy();
		expect(hostComponent).toBeTruthy();
	});

	it('should have the StateService injected into it from the parent/host component', () => {
		expect(hostComponent.getState()).toEqual(chatLogComponent.state);
	});

	it('should have a FormBuilder', () => {
		expect(chatLogComponent._getFormBuilder()).toBeTruthy();
	});

	it('should have a chat-error boolean that inits to false', () => {
		expect(chatLogComponent.chatError).toBeFalse();
	});

	it('should have a form for chat message input', () => {
		expect(chatLogComponent.getChatForm()).toBeDefined();
	});

	it('should have an array for ChatMessages', () => {
		expect(Array.isArray(chatLogComponent.getChatMessages())).toBeTrue();
	});

	it('should have an array for local subscriptions', () => {
		expect(Array.isArray(chatLogComponent._getLocalSubscriberArray())).toBeTrue();
	});

	it('should have a current-room boolean that initializes to false', () => {
		expect(chatLogComponent.currentRoomBool).toBeFalse();
	});

	// Lifecycle
	it('should subscribe to the chat log from the StateService on init', () => {
		chatLogComponent.unsubLocalSubscriptions();

		let chatLog = [ new ChatMessage('Denny', 'DennyID', new Date(), 'hello') ];
		let testObservable = new Observable((sub: Observer<Array<ChatMessage>>) => {
			sub.next(chatLog);
		});
		spyOn(chatLogComponent.state.chatLog, 'state').and.callFake(() => {
			return testObservable;
		});
		let subSpy = spyOn(testObservable, 'subscribe').and.callThrough();

		chatLogComponent.ngOnInit();

		expect(subSpy).toHaveBeenCalled();
		expect(chatLogComponent.getChatMessages()).toEqual(chatLog);
	});

	it('should subscribe to the current user data from the StateService on init', () => {
		chatLogComponent.unsubLocalSubscriptions();

		let user = new User('Denny Dingus', 'some_nonce');
		let testObservable = new Observable((sub: Observer<User>) => {
			sub.next(user);
		});
		spyOn(chatLogComponent.state, 'currentUser').and.callFake(() => {
			return testObservable;
		});
		let subSpy = spyOn(testObservable, 'subscribe').and.callThrough();

		chatLogComponent.ngOnInit();

		expect(subSpy).toHaveBeenCalled();
		expect(chatLogComponent.getCurrentUser()).toEqual(user);
	});

	it('should subscribe to the current ChatRoom from the StateService on init', () => {
		chatLogComponent.unsubLocalSubscriptions();

		let rm = new ChatRoom('id', 'name', 6, 'ownerID');
		let testObservable = new Observable((sub: Observer<ChatRoom>) => {
			sub.next(rm);
		});
		spyOn(chatLogComponent.state.room, 'currentRoom').and.callFake(() => {
			return testObservable;
		});
		let subSpy = spyOn(testObservable, 'subscribe').and.callThrough();

		chatLogComponent.ngOnInit();

		expect(subSpy).toHaveBeenCalled();
		expect(chatLogComponent.getCurrentRoom()).toEqual(rm);
	});

	it('should push all subsriptions to the localSubscriptions component/class array on init', () => {
		let expectedSubs = 3; // CHANGE THIS IF MORE SUBS ARE IMPLEMENTED!!!

		let pushSpy = spyOn(chatLogComponent._getLocalSubscriberArray(), 'push').and.callThrough();

		chatLogComponent.unsubLocalSubscriptions();
		chatLogComponent.ngOnInit();

		expect(pushSpy).toHaveBeenCalledTimes(expectedSubs);
	});

	it('should unsub from all local subscriptions on destroy', () => {
		let unsubSpy = spyOn(chatLogComponent, 'unsubLocalSubscriptions').and.callThrough();

		chatLogComponent.ngOnDestroy();

		expect(unsubSpy).toHaveBeenCalled();
	});

	// State
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

	it('should unsubscribe from all local subscriptions when it is destroyed', () => {
		let unsubLocalSubsSpy = spyOn(chatLogComponent, 'unsubLocalSubscriptions').and.callThrough();

		chatLogComponent.ngOnDestroy();

		expect(unsubLocalSubsSpy).toHaveBeenCalled();
	});
});
