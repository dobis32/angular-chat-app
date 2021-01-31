import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, DebugElement } from '@angular/core';
import { ChatRoomsComponent } from './chat-rooms.component';
import { StateService } from '../services/state/state.service';
import { By } from '@angular/platform-browser';
import { Subscriber, Observable, Subscription } from 'rxjs';
import { ChatRoom } from '../util/chatRoom';
import { User } from '../util/user';

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
		let joinSpy = spyOn(chatRoomsComponent.state.room, 'joinRoom').and.callFake((user: User, room: ChatRoom) => {
			return true;
		});

		chatRoomsComponent.joinRoom(roomToJoin);

		expect(typeof chatRoomsComponent.joinRoom).toEqual('function');
		expect(joinSpy).toHaveBeenCalled();
	});

	it('should use the app modal for prompting a user to enter a password when joining a private room', async () => {
		chatRoomsComponent._setCurrentUser(new User('name', 'id'));
		let modalSpy = spyOn(chatRoomsComponent.state.modal, 'promptRoomPassword').and.callFake(() => {
			return Promise.resolve('input');
		});
		let roomToJoin = new ChatRoom('id', 'name', 6, 'ownerID', [], 'password');

		await chatRoomsComponent.joinRoom(roomToJoin);

		expect(typeof chatRoomsComponent.joinRoom).toEqual('function');
		expect(modalSpy).toHaveBeenCalled();
	});

	it('should have a function for leaving the current ChatRoom', () => {
		let leaveRoomSpy = spyOn(chatRoomsComponent.state.room, 'userLeaveCurrentRoom').and.callThrough();
		const currentRoom = new ChatRoom('id', 'name', 6, 'owner');
		const currentUser = new User('user', 'uid');
		chatRoomsComponent.state.room._setCurrentRoom(currentRoom);
		chatRoomsComponent._setCurrentUser(currentUser);

		chatRoomsComponent.leaveRoom();

		expect(typeof chatRoomsComponent.leaveRoom).toEqual('function');
		expect(leaveRoomSpy).toHaveBeenCalled();
	});

	it('should have a function that returns the current ChatRoom', () => {
		let rm = new ChatRoom('id', 'name', 6, 'ownerID', [ new User('name', 'id') ]);
		chatRoomsComponent._setCurrentRoom(rm);
		expect(typeof chatRoomsComponent.getCurrentRoom).toEqual('function');
		expect(chatRoomsComponent.getCurrentRoom()).toBeDefined();
		expect(chatRoomsComponent.getCurrentRoom()).toEqual(rm);
	});

	it('should have a function that returns an array of Users in the current ChatRoom corresponding with the StateService', () => {
		let rm = new ChatRoom('id', 'name', 6, 'ownerID', [ new User('name', 'id') ]);
		chatRoomsComponent._setCurrentRoom(rm);
		expect(typeof chatRoomsComponent.getUsersInCurrentRoom).toEqual('function');
		expect(chatRoomsComponent.getUsersInCurrentRoom()).toBeDefined();
		expect(chatRoomsComponent.getUsersInCurrentRoom()).toEqual(rm.getUsers());
	});

	it('should have a function that returns the ChatRoom list', () => {
		chatRoomsComponent._setRoomsList([ new ChatRoom('id', 'name', 6, 'ownerID', [ new User('name', 'id') ]) ]);
		expect(typeof chatRoomsComponent.getRoomsList).toEqual('function');
		expect(chatRoomsComponent.getRoomsList()).toEqual(chatRoomsComponent._getRoomsList());
	});

	it('should have a function for creating a new room that should call the corresponding function of the state', async () => {
		let openModalSpy = spyOn(chatRoomsComponent.state.modal, 'createRoom').and.callFake(() => {
			return new Promise((resolve) => {
				resolve(true);
			});
		});
		let createRoomSpy = spyOn(chatRoomsComponent.state.room, 'createRoom').and.callThrough();

		chatRoomsComponent._setCurrentUser(new User('denny', 'dennyID'));
		await chatRoomsComponent.createRoom();

		expect(typeof chatRoomsComponent.createRoom).toEqual('function');
		expect(openModalSpy).toHaveBeenCalled();
		expect(createRoomSpy).toHaveBeenCalled();
	});

	it('should have a functon for determining if the current user owns the current room', () => {
		const dennyID = 'dennyID';
		const user = new User('denny', dennyID);
		const room = new ChatRoom('id', 'room', 6, dennyID, [ user ]);

		let stateFnSpy = spyOn(chatRoomsComponent.state.room, 'userIsAdmin').and.callThrough();

		chatRoomsComponent._setCurrentRoom(room);
		chatRoomsComponent._setCurrentUser(user);

		chatRoomsComponent.currentUserHasRoomPowers();

		expect(typeof chatRoomsComponent.currentUserHasRoomPowers).toEqual('function');
		expect(stateFnSpy).toHaveBeenCalled();
	});

	it('should have a function for editing the current room', async () => {
		const room = new ChatRoom('id', 'room', 6, 'dennyID', [ new User('name', 'id') ]);
		const newRoom = new ChatRoom('id', 'new name', 6, 'dennyID');
		const user = new User('denny', 'dennyID');
		const modalSpy = spyOn(chatRoomsComponent.state.modal, 'editRoom').and.callFake(() => {
			return new Promise((resolve) => {
				resolve(newRoom);
			});
		});

		const updateSpy = spyOn(chatRoomsComponent.state.room, 'emitCurrentRoomUpdate').and.callFake(() => {});
		chatRoomsComponent._setCurrentUser(user);
		chatRoomsComponent._setCurrentRoom(room);

		await chatRoomsComponent.editCurrentRoom();

		expect(typeof chatRoomsComponent.editCurrentRoom).toEqual('function');
		expect(modalSpy).toHaveBeenCalledWith(room);
		expect(updateSpy).toHaveBeenCalledWith(newRoom, user);
	});

	it('should have a function for performing an action on a given user', async () => {
		const admin = new User('admin', 'adminID');
		const room = new ChatRoom('roomID', 'room', 6, admin.getId());
		const userReceivingAction = new User('user', 'userID');
		const action = 'action';
		const powerCheckSpy = spyOn(chatRoomsComponent.state.room, 'userHasRoomPowers').and.callThrough();
		const modalSpy = spyOn(chatRoomsComponent.state.modal, 'performUserAction').and.callFake(() => {
			return Promise.resolve(action);
		});
		const handleSpy = spyOn(chatRoomsComponent, 'handleUserAction').and.callFake(() => {});

		chatRoomsComponent._setCurrentRoom(room);
		chatRoomsComponent._setCurrentUser(admin);

		await chatRoomsComponent.performUserAction(userReceivingAction);

		expect(typeof chatRoomsComponent.performUserAction);
		expect(powerCheckSpy).toHaveBeenCalledWith(admin, room);
		expect(modalSpy).toHaveBeenCalled();
		expect(handleSpy).toHaveBeenCalledWith(action, userReceivingAction);
	});

	it('should not prompt the current user for an action to perform on another user if the current user does not have powers in the current room', () => {
		const currentUser = new User('currUser', 'currUserID');
		const room = new ChatRoom('roomID', 'room', 6, 'owner');
		const userReceivingAction = new User('user', 'userID');
		const action = 'action';
		const modalSpy = spyOn(chatRoomsComponent.state.modal, 'performUserAction').and.callFake(() => {
			return Promise.resolve(action);
		});

		chatRoomsComponent._setCurrentRoom(room);
		chatRoomsComponent._setCurrentUser(currentUser);

		chatRoomsComponent.performUserAction(userReceivingAction);

		expect(modalSpy).toHaveBeenCalledTimes(0);
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
	it('should subscribe to the ChatRooms list of the state service on init', () => {
		let roomsListSubSpy = spyOn(chatRoomsComponent.state.room, 'roomsList').and.callFake(() => {
			return new Observable((sub: Subscriber<Array<any>>) => {
				sub.next([ new ChatRoom('id1', 'roomA', 6, 'ownerID1'), new ChatRoom('id2', 'roomB', 6, 'ownerID2') ]);
			});
		});

		chatRoomsComponent.unsubLocalSubscriptions();
		chatRoomsComponent.ngOnInit();

		expect(roomsListSubSpy).toHaveBeenCalled();
		expect(chatRoomsComponent._getSubscriptions().length).toBeGreaterThan(0);
	});

	it('should subscribe to the current ChatRoom via the state service and update current users subscribers on init', () => {
		let roomsListSubSpy = spyOn(chatRoomsComponent.state.room, 'currentRoom').and.callFake(() => {
			return new Observable((sub: Subscriber<ChatRoom>) => {
				let rm = new ChatRoom('id', 'name', 6, 'ownerID', [ new User('name', 'id') ]);
				sub.next(rm);
			});
		});

		chatRoomsComponent.unsubLocalSubscriptions();
		chatRoomsComponent.ngOnInit();

		expect(roomsListSubSpy).toHaveBeenCalled();
		expect(chatRoomsComponent._getSubscriptions().length).toBeGreaterThan(0);
	});

	it('should subscribe to the current User via the state service on init', () => {
		let currenUserSpy = spyOn(chatRoomsComponent.state.user, 'state').and.callFake(() => {
			return new Observable((sub: Subscriber<User>) => {
				let user = new User('name', 'id');
				sub.next(user);
			});
		});

		chatRoomsComponent.unsubLocalSubscriptions();
		chatRoomsComponent.ngOnInit();

		expect(currenUserSpy).toHaveBeenCalled();
		expect(chatRoomsComponent._getCurrentUser()).toBeDefined();
	});

	it('should unsubscribe local subscriptions on destroy', () => {
		let unsubSpy = spyOn(chatRoomsComponent, 'unsubLocalSubscriptions').and.callThrough();
		chatRoomsComponent.ngOnDestroy();

		expect(unsubSpy).toHaveBeenCalled();
	});

	// Other
	it('should have a function that acts as the modal callback when creating a room, and should only create a room when a unique room name is passed', () => {
		let findSpy = spyOn(chatRoomsComponent.state.room, 'findRoomByName').and.callThrough();
		let createSpy = spyOn(chatRoomsComponent.state.room, 'createRoom').and.callFake(() => {});
		let mockRoomsList = [ new ChatRoom('id1', 'some_name', 6, 'dennyID') ];
		let mockUser = new User('mockUser', 'id');

		chatRoomsComponent._setCurrentUser(mockUser);
		chatRoomsComponent.createRoomCallback('some_name', 6, 'some_password');
		chatRoomsComponent.state.room._setRoomsList(mockRoomsList);
		chatRoomsComponent.createRoomCallback('some_name', 6, 'some_password');

		expect(typeof chatRoomsComponent.createRoomCallback).toEqual('function');
		expect(createSpy).toHaveBeenCalledTimes(1);
		expect(findSpy).toHaveBeenCalled();
	});

	it('should have a function to handle actions to be performed by a given user in a given room', () => {
		expect(typeof chatRoomsComponent.handleUserAction).toEqual('function');
	});

	it('should be able to handle a "promote" user action', () => {
		const actionSpy = spyOn(chatRoomsComponent.state.room, 'promoteUser').and.callFake(() => {});
		const action = 'promote';
		const user = new User('name', 'uid');
		const currentRoom = new ChatRoom('roomID', 'name', 6, 'owner');

		chatRoomsComponent._setCurrentRoom(currentRoom);

		chatRoomsComponent.handleUserAction(action, user);

		expect(actionSpy).toHaveBeenCalledWith(user, currentRoom);
	});

	it('should be able to handle a "demote" user action', () => {
		const actionSpy = spyOn(chatRoomsComponent.state.room, 'demoteUser').and.callFake(() => {});
		const action = 'demote';
		const user = new User('name', 'uid');
		const currentRoom = new ChatRoom('roomID', 'name', 6, 'owner');

		chatRoomsComponent._setCurrentRoom(currentRoom);

		chatRoomsComponent.handleUserAction(action, user);

		expect(actionSpy).toHaveBeenCalledWith(user, currentRoom);
	});

	it('should be able to handle a "kick" user action', () => {
		const actionSpy = spyOn(chatRoomsComponent.state.room, 'kickUser').and.callFake(() => {});
		const action = 'kick';
		const user = new User('name', 'uid');
		const currentRoom = new ChatRoom('roomID', 'name', 6, 'owner');

		chatRoomsComponent._setCurrentRoom(currentRoom);

		chatRoomsComponent.handleUserAction(action, user);

		expect(actionSpy).toHaveBeenCalledWith(user, currentRoom);
	});

	it('should be able to handle a "ban" user action', () => {
		const actionSpy = spyOn(chatRoomsComponent.state.room, 'banUser').and.callFake(() => {});
		const action = 'ban';
		const user = new User('name', 'uid');
		const currentRoom = new ChatRoom('roomID', 'name', 6, 'owner');

		chatRoomsComponent._setCurrentRoom(currentRoom);

		chatRoomsComponent.handleUserAction(action, user);

		expect(actionSpy).toHaveBeenCalledWith(user, currentRoom);
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
