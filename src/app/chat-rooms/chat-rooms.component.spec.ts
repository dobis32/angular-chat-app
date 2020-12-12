import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, DebugElement } from '@angular/core';
import { ChatRoomsComponent } from './chat-rooms.component';
import { StateService } from '../services/state.service';
import { By } from '@angular/platform-browser';
import { Subscriber, Observable, Subscription } from 'rxjs';
import { ChatRoom } from '../util/chatRoom';

@Component({
	selector: `host-component`,
	template: `<app-chat-rooms [state]="getState()"></app-chat-rooms>`
})
class TestHostComponent {
	constructor(private state: StateService) {}

	getState() {
		return this.state;
	}
}

describe('ChatRoomsComponent', () => {
	let hostComponent: TestHostComponent;
	let hostFixture: ComponentFixture<TestHostComponent>;
	let ChatRoomsDebugElement: DebugElement;
	let chatRoomsComponent: ChatRoomsComponent;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ TestHostComponent, ChatRoomsComponent ]
		}).compileComponents();
	});

	beforeEach(() => {
		hostFixture = TestBed.createComponent(TestHostComponent);
		hostComponent = hostFixture.componentInstance;
		hostFixture.detectChanges();
		ChatRoomsDebugElement = hostFixture.debugElement.query(By.directive(ChatRoomsComponent));
		chatRoomsComponent = ChatRoomsDebugElement.componentInstance;
	});

	it('should create', () => {
		expect(chatRoomsComponent).toBeTruthy();
		expect(hostComponent).toBeTruthy();
	});

	it('should have the state service injected into it from the parent/host component', () => {
		expect(chatRoomsComponent.state).toEqual(hostComponent.getState());
	});

	it('should have an array containing chat room data', () => {
		expect(Array.isArray(chatRoomsComponent._getRoomsList())).toBeTrue();
	});

	it('should subscribe to the rooms list of the state service on init', () => {
		chatRoomsComponent._setSubscriptions([ new Subscription(), new Subscription() ]);

		let roomsListSubSpy = spyOn(chatRoomsComponent.state, 'roomsList').and.callFake(() => {
			return new Observable((sub: Subscriber<Array<any>>) => {
				sub.next([ new ChatRoom('id1', 'roomA', 6), new ChatRoom('id2', 'roomB', 6) ]);
			});
		});
		while (chatRoomsComponent._getSubscriptions.length)
			chatRoomsComponent._getSubscriptions().shift().unsubscribe();
		chatRoomsComponent.ngOnInit();

		expect(roomsListSubSpy).toHaveBeenCalled();
		expect(chatRoomsComponent._getSubscriptions().length).toBeGreaterThan(0);
	});

	it('should shift all subscriptions from the subscriptions array and call unsubscribe each of them on destroy', () => {
		chatRoomsComponent._setSubscriptions([ new Subscription(), new Subscription() ]);

		chatRoomsComponent.ngOnDestroy();

		expect(chatRoomsComponent._getSubscriptions().length == 0).toBeTrue();
	});

	it('should have a function for joining chat rooms', () => {
		expect(typeof chatRoomsComponent.joinRoom).toEqual('function');
	});

	it('should have a function that calls the "joinRoom" function of the StateService', () => {
		let joinSpy = spyOn(chatRoomsComponent.state, 'joinRoom').and.callFake((rm: ChatRoom) => {
			return true;
		});
		let room = new ChatRoom('id1', 'test', 6);

		chatRoomsComponent.joinRoom(room);

		expect(typeof chatRoomsComponent.joinRoom).toEqual('function');
		expect(joinSpy).toHaveBeenCalled();
	});
});
