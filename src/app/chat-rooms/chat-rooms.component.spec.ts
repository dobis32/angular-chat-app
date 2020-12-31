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

	afterEach(() => {
		chatRoomsComponent.unsubLocalSubscriptions();
	});

	// DOM-Related
	it('should have a function for joining ChatRooms', () => {
		let roomToJoin = new ChatRoom('id', 'name', 6, 'ownerID');
		let joinSpy = spyOn(chatRoomsComponent.state, 'joinRoom').and.callFake((room: ChatRoom) => {
			return Promise.resolve(true);
		});

		chatRoomsComponent.joinRoom(roomToJoin);

		expect(typeof chatRoomsComponent.joinRoom).toEqual('function');
		expect(joinSpy).toHaveBeenCalledWith(roomToJoin);
	});

	it('should have a function for leaving the current ChatRoom', () => {
		let leaveRoomSpy = spyOn(chatRoomsComponent.state, 'leaveCurrentRoom').and.callThrough();

		chatRoomsComponent.leaveRoom();

		expect(typeof chatRoomsComponent.leaveRoom).toEqual('function');
		expect(leaveRoomSpy).toHaveBeenCalled();
	});

	it('should have a function that returns the current ChatRoom', () => {
		let rm = new ChatRoom('id', 'name', 6, 'ownerID');
		chatRoomsComponent._setCurrentRoom(rm);
		expect(typeof chatRoomsComponent.getCurrentRoom).toEqual('function');
		expect(chatRoomsComponent.getCurrentRoom()).toBeDefined();
		expect(chatRoomsComponent.getCurrentRoom()).toEqual(rm);
	});

	it('should have a function that returns an array of Users in the current ChatRoom corresponding with the StateService', () => {
		let rm = new ChatRoom('id', 'name', 6, 'ownerID');
		chatRoomsComponent._setCurrentRoom(rm);
		expect(typeof chatRoomsComponent.getUsersInCurrentRoom).toEqual('function');
		expect(chatRoomsComponent.getUsersInCurrentRoom()).toBeDefined();
		expect(chatRoomsComponent.getUsersInCurrentRoom()).toEqual(rm.getUsers());
	});

	it('should have a function that returns the ChatRoom list', () => {
		chatRoomsComponent._setRoomsList([ new ChatRoom('id', 'name', 6, 'ownerID') ]);
		expect(typeof chatRoomsComponent.getRoomsList).toEqual('function');
		expect(chatRoomsComponent.getRoomsList()).toEqual(chatRoomsComponent._getRoomsList());
	});

	it('should have a function for creating a new room that should call the corresponding function of the state', () => {
		let createSpy = spyOn(chatRoomsComponent.state, 'createRoom').and.callThrough();

		chatRoomsComponent.createRoom();

		expect(typeof chatRoomsComponent.createRoom).toEqual('function');
		expect(createSpy).toHaveBeenCalled();
	});

	// Init
	it('should create', () => {
		expect(chatRoomsComponent).toBeTruthy();
		expect(hostComponent).toBeTruthy();
	});

	it('should have the state service injected into it from the parent/host component', () => {
		expect(chatRoomsComponent.state).toEqual(hostComponent.getState());
	});

	it('should have an array containing ChatRoom list data', () => {
		expect(Array.isArray(chatRoomsComponent._getRoomsList())).toBeTrue();
	});

	it('should have an array containing subscriptions', () => {
		expect(Array.isArray(chatRoomsComponent._getSubscriptions())).toBeTrue();
	});

	// Lifecycle
	it('should subscribe to the ChatRooms list of the state service on init and the subscription to the corresponding component/class array', () => {
		let roomsListSubSpy = spyOn(chatRoomsComponent.state, 'roomsList').and.callFake(() => {
			return new Observable((sub: Subscriber<Array<any>>) => {
				sub.next([ new ChatRoom('id1', 'roomA', 6, 'ownerID1'), new ChatRoom('id2', 'roomB', 6, 'ownerID2') ]);
			});
		});

		chatRoomsComponent.unsubLocalSubscriptions();
		chatRoomsComponent.ngOnInit();

		expect(roomsListSubSpy).toHaveBeenCalled();
		expect(chatRoomsComponent._getSubscriptions().length).toBeGreaterThan(0);
	});

	it('should subscribe to the current ChatRoom via the state service on init and the subscription to the corresponding component/class array', () => {
		let roomsListSubSpy = spyOn(chatRoomsComponent.state, 'currentRoom').and.callFake(() => {
			return new Observable((sub: Subscriber<ChatRoom>) => {
				let rm = new ChatRoom('id', 'name', 6, 'ownerID');
				sub.next(rm);
			});
		});

		chatRoomsComponent.unsubLocalSubscriptions();
		chatRoomsComponent.ngOnInit();

		expect(roomsListSubSpy).toHaveBeenCalled();
		expect(chatRoomsComponent._getSubscriptions().length).toBeGreaterThan(0);
	});

	it('should unsubscribe local subscriptions on destroy', () => {
		let unsubSpy = spyOn(chatRoomsComponent, 'unsubLocalSubscriptions').and.callThrough();
		chatRoomsComponent.ngOnDestroy();

		expect(unsubSpy).toHaveBeenCalled();
	});

	// State
	it('should have a function for unsubscribing from all local subscriptions', () => {
		let sub1 = new Subscription();
		let sub2 = new Subscription();
		let sub3 = new Subscription();

		let sub1Spy = spyOn(sub1, 'unsubscribe').and.callThrough();
		let sub2Spy = spyOn(sub2, 'unsubscribe').and.callThrough();
		let sub3Spy = spyOn(sub3, 'unsubscribe').and.callThrough();

		chatRoomsComponent._setSubscriptions([ sub1, sub2, sub3 ]);

		let initCount = chatRoomsComponent._getSubscriptions().length;

		chatRoomsComponent.unsubLocalSubscriptions();

		expect(typeof chatRoomsComponent.unsubLocalSubscriptions).toEqual('function');
		expect(initCount).toEqual(3);
		expect(chatRoomsComponent._getSubscriptions().length).toEqual(0);
		expect(sub1Spy).toHaveBeenCalled();
		expect(sub2Spy).toHaveBeenCalled();
		expect(sub3Spy).toHaveBeenCalled();
	});
});
