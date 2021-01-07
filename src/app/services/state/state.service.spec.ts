import { TestBed } from '@angular/core/testing';

import { StateService } from './state.service';
import { MockSocketService } from '../../util/testing/MockSocketService';
import { SocketService } from './../socket.service';
import { Subscription } from 'rxjs';
import { ChatRoom } from '../../util/chatRoom';
import { User } from '../../util/user';

describe('StateService', () => {
	let service: StateService;

	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [ { provide: SocketService, useClass: MockSocketService } ]
		});
		service = TestBed.inject(StateService);
		service.user._setUser(new User('Test user', 'test_nonce')); // login a user for convenience
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});

	// Socket
	it('should have the SocketService injected into it', () => {
		expect(service._getSocketService()).toBeTruthy();
	});

	it('should have an array for socket subscriptions', () => {
		expect(Array.isArray(service._getSocketSubscriptions()));
	});

	it('should listen to the "init" event from the SocketService', () => {
		let listenSpy = spyOn(service._getSocketService(), 'listen').and.callThrough();

		service.resetSocketSubs();

		expect(listenSpy).toHaveBeenCalledWith('init');
	});

	it('should listen to the "message" event from the SocketService', () => {
		let listenSpy = spyOn(service._getSocketService(), 'listen').and.callThrough();

		service.resetSocketSubs();

		expect(listenSpy).toHaveBeenCalledWith('message');
	});

	it('should listen to the "roomsUpdate" event from the SocketService', () => {
		let listenSpy = spyOn(service._getSocketService(), 'listen').and.callThrough();

		service.resetSocketSubs();

		expect(listenSpy).toHaveBeenCalledWith('roomsUpdate');
	});

	it('should listen to the "currentRoomUpdate" event from the SocketService', () => {
		let listenSpy = spyOn(service._getSocketService(), 'listen').and.callThrough();

		service.resetSocketSubs();

		expect(listenSpy).toHaveBeenCalledWith('currentRoomUpdate');
	});

	it('should have a function to unsubscribe from all socket subscriptions', () => {
		let subSpies = new Array();
		service._getSocketSubscriptions().forEach((sub: Subscription) => {
			let spy = spyOn(sub, 'unsubscribe').and.callThrough();
			subSpies.push(spy);
		});

		service.unsubscribeAllSocketSubs();

		expect(typeof service.unsubscribeAllSocketSubs).toEqual('function');
		subSpies.forEach((spy) => {
			expect(spy).toHaveBeenCalled();
		});
	});

	it('should have a function to "reset"/"resubscribe" to all socket subscriptions', () => {
		let initSubCount = service._getSocketSubscriptions().length;
		let unsubSpy = spyOn(service, 'unsubscribeAllSocketSubs').and.callThrough();

		service.resetSocketSubs();

		expect(typeof service.resetSocketSubs).toEqual('function');
		expect(service._getSocketSubscriptions().length).toEqual(initSubCount);
		expect(unsubSpy).toHaveBeenCalled();
	});

	// Socket Event Handlers
	it('shoulld have a function that handles "init" socket event', () => {
		let parseAndUpdateSpy = spyOn(service.room, 'parseAndUpdateRooms').and.callThrough();
		let unparsedRoomsList = [ { id: 'id1', name: 'denny', capacity: 6 }, { id: 'id2', name: 'hugh', capacity: 4 } ];
		let devUserJSON = { id: 'id', name: 'denny' };

		service.handleInit({ rooms: unparsedRoomsList, devUserJSON });

		expect(typeof service.handleInit).toEqual('function');
		expect(parseAndUpdateSpy).toHaveBeenCalledWith(unparsedRoomsList);
	});

	it('should have a fnction to handle the "message" socket event', () => {
		let initCount = service.chatLog._getChatLog().length;
		let date = new Date();

		service.room._setCurrentRoom(new ChatRoom('id', 'name', 6, 'denny'));
		service.handleMessage({ user: 'denny', id: 'dennyID', date: date.toDateString(), text: 'hello world' });

		expect(typeof service.handleMessage).toEqual('function');
		expect(service.chatLog._getChatLog().length).toBeGreaterThan(initCount);
	});

	it('should have a function for handling the "notification" socket event', () => {
		expect(typeof service.handleNotification).toEqual('function');
	});

	it('should handle an "error" notifcation appropriately', () => {
		let errorSpy = spyOn(service, 'errorNotify').and.callFake(() => {});
		let errorData = { notification: 'error', message: 'some error' };
		service.handleNotification(errorData);
		expect(errorSpy).toHaveBeenCalledWith(errorData.message);
	});

	it('should handle a "leave" notification appropriately', () => {
		let leaveSpy = spyOn(service, 'roomNotifyUserLeft').and.callFake(() => {});
		let leaveData = { notification: 'leave', user: 'denny' };
		service.roomNotifyUserLeft(leaveData.user);
		expect(leaveSpy).toHaveBeenCalledWith(leaveData.user);
	});

	it('should handle a "join" notification appropriately', () => {
		let joinNotifySpy = spyOn(service, 'roomNotifyUserJoin').and.callFake(() => {});
		let joinData = { notification: 'join', user: 'denny' };
		service.handleNotification(joinData);
		expect(joinNotifySpy).toHaveBeenCalledWith(joinData.user);
	});

	it('should have a function to handle a "roomsUpdate" socket event', () => {
		let parseAndUpdateSpy = spyOn(service.room, 'parseAndUpdateRooms').and.callFake(() => {});

		service.handleRoomsUpdate([]);

		expect(typeof service.handleRoomsUpdate).toEqual('function');
		expect(parseAndUpdateSpy).toHaveBeenCalled();
	});

	it('should, upon handling a "currentRoomUpdate" socket event, update the current room', () => {
		let updateCurrentRoomSpy = spyOn(service.room, 'updateCurrentRoom').and.callFake(() => {});
		let rm = new ChatRoom('id', 'name', 6, 'denny');

		service.room._setCurrentRoom(rm);

		service.handleCurrentRoomUpdate({ rooms: [], roomToJoin: 'foo' });

		expect(updateCurrentRoomSpy).toHaveBeenCalled();
	});

	it('should have a function to handle a "currentRoomUpdate" socket event', () => {
		expect(typeof service.handleCurrentRoomUpdate).toEqual('function');
	});

	// Notification handlers
	it('should have a function to handle "leave" notifications', () => {
		let pushSpy = spyOn(service.chatLog._getChatLog(), 'push').and.callThrough();
		let username = 'user';

		service.roomNotifyUserLeft(username);

		expect(typeof service.roomNotifyUserLeft).toEqual('function');
		expect(pushSpy).toHaveBeenCalled();
	});

	it('should have a function to handle "join" notifications', () => {
		let pushSpy = spyOn(service.chatLog._getChatLog(), 'push').and.callThrough();
		let username = 'user';

		service.roomNotifyUserJoin(username);

		expect(typeof service.roomNotifyUserJoin).toEqual('function');
		expect(pushSpy).toHaveBeenCalled();
	});

	it('should have a function to handle "error" notifications', () => {
		expect(typeof service.errorNotify).toEqual('function');
	});

	it('should handle a "roomsUpdate" notification appropriately', () => {
		let parseRoomsListSpy = spyOn(service.room, 'parseRoomsList').and.callThrough();
		let updateRoomsListSpy = spyOn(service.room, 'updateRoomsList').and.callThrough();
		let roomsData = [ { id: 'id1', name: 'test1', capacity: 6 }, { id: 'id2', name: 'test2', capacity: 6 } ];

		service.handleRoomsUpdate(roomsData);

		expect(typeof service.handleRoomsUpdate).toEqual('function');
		expect(parseRoomsListSpy).toHaveBeenCalledWith(roomsData);
		expect(updateRoomsListSpy).toHaveBeenCalled();
	});
});
