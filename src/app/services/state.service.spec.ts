import { TestBed } from '@angular/core/testing';

import { StateService } from './state.service';
import { MockSocketService } from '../util/testing/MockSocketService';
import { SocketService } from './socket.service';
import { ChatMessage } from '../util/chatMessage';
import { Subscription } from 'rxjs';
import { ChatRoom } from '../util/chatRoom';
import { User } from '../util/user';

describe('StateService', () => {
	let service: StateService;

	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [ { provide: SocketService, useClass: MockSocketService } ]
		});
		service = TestBed.inject(StateService);
		service._setUser(new User('Test user', 'test_nonce')); // login a user for convenience
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});

	// Socket
	it('shouuld have the SocketService injected into it', () => {
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

	it('should listen to the "join" event from the SocketService', () => {
		let listenSpy = spyOn(service._getSocketService(), 'listen').and.callThrough();

		service.resetSocketSubs();

		expect(listenSpy).toHaveBeenCalledWith('join');
	});

	it('should listen to the "roomsUpdate" event from the SocketService', () => {
		let listenSpy = spyOn(service._getSocketService(), 'listen').and.callThrough();

		service.resetSocketSubs();

		expect(listenSpy).toHaveBeenCalledWith('roomsUpdate');
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
		let parseSpy = spyOn(service, 'parseRoomsList').and.callThrough();
		let updateRoomsSpy = spyOn(service, 'updateRoomsList').and.callThrough();
		let unparsedRoomsList = [ { id: 'id1', name: 'denny', capacity: 6 }, { id: 'id2', name: 'hugh', capacity: 4 } ];
		let devUserJSON = { id: 'id', name: 'denny' };

		service.handleInit({ rooms: unparsedRoomsList, devUserJSON });

		expect(typeof service.handleInit).toEqual('function');
		expect(parseSpy).toHaveBeenCalled();
		expect(updateRoomsSpy).toHaveBeenCalled();
	});

	it('should have a function that handles "join" socket event', () => {
		expect(typeof service.handleJoin).toEqual('function');
	});

	it('should leave the current room when the "join" event handler receives undefined room data', () => {
		let data = {};
		service._setCurrentRoom(new ChatRoom('id', 'name', 6));
		service._setUser(new User('denny', 'dennyID'));
		let leaveFnSpy = spyOn(service, 'leaveCurrentRoom').and.callThrough();

		service.handleJoin(data);

		expect(leaveFnSpy).toHaveBeenCalled();
	});

	it('should look for and attempt to join target ChatRoom if room ID is received', () => {
		let updateSpy = spyOn(service, 'updateCurrentRoom').and.callThrough();
		let data = { id: 'roomID', name: 'name', capacity: 6 };

		service._setRoomsList([ new ChatRoom(data.id, data.name, data.capacity) ]);
		service.handleJoin(data);

		expect(updateSpy).toHaveBeenCalled();
	});

	it('should have a fnction to handle the "message" socket event', () => {
		expect(typeof service.handleMessage).toEqual('function');
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

	// Notification handlers
	it('should have a function to handle "leave" notifications', () => {
		let pushSpy = spyOn(service._getChatLog(), 'push').and.callThrough();
		let username = 'user';

		service.roomNotifyUserLeft(username);

		expect(typeof service.roomNotifyUserLeft).toEqual('function');
		expect(pushSpy).toHaveBeenCalled();
	});

	it('should have a function to handle "join" notifications', () => {
		let pushSpy = spyOn(service._getChatLog(), 'push').and.callThrough();
		let username = 'user';

		service.roomNotifyUserJoin(username);

		expect(typeof service.roomNotifyUserJoin).toEqual('function');
		expect(pushSpy).toHaveBeenCalled();
	});

	it('should have a function to handle "error" notifications', () => {
		expect(typeof service.errorNotify).toEqual('function');
	});

	it('should handle a "roomsUpdate" notification appropriately', () => {
		let parseRoomsListSpy = spyOn(service, 'parseRoomsList').and.callThrough();
		let updateRoomsListSpy = spyOn(service, 'updateRoomsList').and.callThrough();
		let roomsData = [ { id: 'id1', name: 'test1', capacity: 6 }, { id: 'id2', name: 'test2', capacity: 6 } ];

		service.handleRoomsUpdate(roomsData);

		expect(typeof service.handleRoomsUpdate).toEqual('function');
		expect(parseRoomsListSpy).toHaveBeenCalledWith(roomsData);
		expect(updateRoomsListSpy).toHaveBeenCalled();
	});

	// Chat Rooms
	it('should have an array for holding data about available chat rooms', () => {
		expect(Array.isArray(service._getRoomsList())).toBeTrue();
	});

	it('should have a public method/function for exposing an Observalbe of the chat rooms array', () => {
		let obs = service.roomsList();

		expect(typeof service.chatLog).toEqual('function');
		expect(typeof obs.subscribe).toEqual('function');
	});

	it('should have an array for chat room array subscribers', () => {
		expect(Array.isArray(service._getRoomsListSubscribers())).toBeTrue();
	});

	it('should have a funciton for updating the chat rooms array and updates rooms list subscribers', () => {
		let spy = spyOn(service, 'updateRoomsListSubscribers').and.callThrough();

		let newRoomsList = [ new ChatRoom('id1', 'Room A', 2) ];

		service.updateRoomsList(newRoomsList);

		expect(typeof service.updateRoomsList).toEqual('function');
		expect(spy).toHaveBeenCalledWith();
	});

	it('should have a function for updating rooms list subscribers', () => {
		let sub1: Subscription = service.roomsList().subscribe(); // init observer
		let sub2: Subscription = service.roomsList().subscribe(); // init observer

		let spy1 = spyOn(service._getRoomsListSubscribers()[0], 'next').and.callThrough();
		let spy2 = spyOn(service._getRoomsListSubscribers()[1], 'next').and.callThrough();

		service.updateRoomsListSubscribers();

		expect(typeof service.updateRoomsListSubscribers).toEqual('function');
		expect(spy1).toHaveBeenCalled();
		expect(spy2).toHaveBeenCalled();

		sub1.unsubscribe();
		sub2.unsubscribe();
	});

	it('should have a public method/function for exposing an Observalbe of the current ChatRoom', () => {
		let obs = service.currentRoom();

		expect(typeof service.currentRoom).toEqual('function');
		expect(typeof obs.subscribe).toEqual('function');
	});

	it('should have an array for current ChatRoom subscribers', () => {
		expect(Array.isArray(service._getCurrentRoomSubscribers())).toBeTrue();
	});

	it('should have a function for updating the current room that also resets the chat log array', () => {
		let updateChatSubsSpy = spyOn(service, 'updateChatLogSubscribers').and.callThrough();
		let updateCurrentRoomSubsSpy = spyOn(service, 'updateCurrentRoomSubscribers').and.callThrough();
		let initCurrentRoom = service._getCurrentRoom();
		let d = new Date();
		service._setChatLog([ new ChatMessage('user', d, 'message') ]);
		service.updateCurrentRoom(new ChatRoom('id', 'name', 6));

		expect(typeof service.updateCurrentRoom).toEqual('function');
		expect(service._getCurrentRoom() == initCurrentRoom).toBeFalse();
		expect(updateChatSubsSpy).toHaveBeenCalled();
		expect(updateCurrentRoomSubsSpy).toHaveBeenCalled();
		expect(service._getChatLog().length).toEqual(0);
	});

	it('should have a funciton for updating the current ChatRoom, resets the chat log and updates current ChatRoom subscribers', () => {
		let updateRoomSpy = spyOn(service, 'updateCurrentRoomSubscribers').and.callThrough();
		let resetChatLogSpy = spyOn(service, 'resetChatLog').and.callThrough();
		let room = new ChatRoom('id1', 'Room A', 2);

		service.updateCurrentRoom(room);

		expect(typeof service.updateRoomsList).toEqual('function');
		expect(updateRoomSpy).toHaveBeenCalled();
		expect(resetChatLogSpy).toHaveBeenCalled();
	});

	it('should have a function for updating current room subscribers', () => {
		let sub1: Subscription = service.currentRoom().subscribe(); // init observer
		let sub2: Subscription = service.currentRoom().subscribe(); // init observer

		let spy1 = spyOn(service._getCurrentRoomSubscribers()[0], 'next').and.callThrough();
		let spy2 = spyOn(service._getCurrentRoomSubscribers()[1], 'next').and.callThrough();

		service.updateCurrentRoomSubscribers();

		expect(typeof service.updateCurrentRoomSubscribers).toEqual('function');
		expect(spy1).toHaveBeenCalled();
		expect(spy2).toHaveBeenCalled();

		sub1.unsubscribe();
		sub2.unsubscribe();
	});

	it('should have a function for exposing an Observable of the index of the current room', () => {
		let obs = service.currentRoomIndex();
		expect(typeof service.currentRoomIndex).toEqual('function');
		expect(typeof obs.subscribe).toEqual('function');
	});

	it('should have a function for creating a new room', async () => {
		let emitSpy = spyOn(service._getSocketService(), 'emit').and.callFake((eventName: string, roomName: string) => {
			return Promise.resolve();
		});
		let newRoom = 'test';

		await service.createRoom(newRoom);

		expect(emitSpy).toHaveBeenCalledWith('createRoom', newRoom);
	});

	it('should have a function for joining a new room that should emit the "joinRoom" event from the SocketService', async () => {
		let roomToJoin = 'test';
		let socketSpy = spyOn(
			service._getSocketService(),
			'emit'
		).and.callFake((eventName: string, roomname: string) => {
			return Promise.resolve(true);
		});

		await service.joinRoom(roomToJoin);

		expect(socketSpy).toHaveBeenCalledWith('join', {
			user: service._getCurrentUser().getId(),
			room: roomToJoin
		});
	});

	it('should have a function to leave the current ChatRoom and update corresponding observers', () => {
		service._setCurrentRoom(new ChatRoom('id', 'test room', 6, [], ''));

		let spy = spyOn(service, 'updateCurrentRoomSubscribers').and.callThrough();

		service.leaveCurrentRoom();

		expect(typeof service.leaveCurrentRoom).toEqual('function');
		expect(spy).toHaveBeenCalled();
		expect(service._getCurrentRoom()).toEqual(undefined);
	});

	it('should have a function to parse rooms list data into ChatRoom instances and return an array of said ChatRooms', () => {
		let parsed = service.parseRoomsList([
			{ id: 'id', name: 'name', capacity: 6 },
			{ id: 'id', name: 'name', capacity: 6 },
			{ id: 'id', name: 'name', capacity: 6 }
		]);

		expect(typeof service.parseRoomsList).toEqual('function');
		expect(Array.isArray(parsed)).toBeTrue();
	});

	it('should be able to parse rooms list data gracefully', () => {
		let unparsed1 = [
			{ name: 'name', capacity: 6 },
			{ id: 'id2', name: 'name', capacity: 6 },
			{ id: 'id3', name: 'name', capacity: 6 }
		];

		let unparsed2 = [
			{ id: 'id1', name: 'name' },
			{ id: 'id2', name: 'name', capacity: 6 },
			{ id: 'id3', name: 'name', capacity: 6 }
		];

		let unparsed3 = [
			{ id: 'id', capacity: 6 },
			{ id: 'id', name: 'name', capacity: 6 },
			{ id: 'id', name: 'name', capacity: 6 }
		];

		let parsed1 = service.parseRoomsList(unparsed1);
		let parsed2 = service.parseRoomsList(unparsed2);
		let parsed3 = service.parseRoomsList(unparsed3);

		expect(parsed1.length).toEqual(2);
		expect(parsed2.length).toEqual(2);
		expect(parsed3.length).toEqual(2);
	});

	//Chat log
	it('should have a chat log', () => {
		expect(Array.isArray(service._getChatLog()));
	});

	it('should have an array for chat log subscribers/observers', () => {
		expect(Array.isArray(service._getChatLogSubscribers()));
	});

	it('should have a public method/function for exposing an Observable of the ChatLog', () => {
		let obs = service.chatLog();

		expect(typeof service.chatLog).toEqual('function');
		expect(typeof obs.subscribe).toEqual('function');
	});

	it('should have a function to parse an array of ChatMessage data', () => {
		let parsedMessages: Array<ChatMessage>;
		let d = new Date();
		let chatMessageData = [
			{ user: 'foo', date: d.toDateString(), text: 'some message1' },
			{ user: 'bar', date: d.toDateString(), text: 'some message2' },
			{ user: 'fizz', date: d.toDateString(), text: 'some message3' }
		];

		parsedMessages = service.parseChatLog(chatMessageData);

		expect(Array.isArray(parsedMessages));
		expect(parsedMessages.length).toEqual(chatMessageData.length);
	});

	it('should have a function for updating all chat log subscribers', () => {
		let currentChatLog = service._getChatLog();

		let subscription1 = service.chatLog().subscribe();
		let subscription2 = service.chatLog().subscribe();

		let obSpy1 = spyOn(service._getChatLogSubscribers()[0], 'next').and.callThrough();
		let obSpy2 = spyOn(service._getChatLogSubscribers()[1], 'next').and.callThrough();

		service.updateChatLogSubscribers();

		expect(typeof service.updateChatLogSubscribers).toEqual('function');
		expect(obSpy1).toHaveBeenCalledWith(currentChatLog);
		expect(obSpy2).toHaveBeenCalledWith(currentChatLog);

		subscription1.unsubscribe();
		subscription2.unsubscribe();
	});

	// Chat Message
	it('should have a public method/function for emitting ChatMessage data to the SocketService', () => {
		let emitSpy = spyOn(service._getSocketService(), 'emit').and.callFake((event: string, data: any) => {
			return true;
		});
		let d = new Date();
		let message = new ChatMessage('foo', d, 'some text');
		let room = new ChatRoom('id', 'name', 6);
		service._setCurrentRoom(room);
		service.sendMessage(message);

		expect(typeof service.sendMessage).toEqual('function');
		expect(emitSpy).toHaveBeenCalled();
		expect(emitSpy).toHaveBeenCalledWith('message', { ...message.toJSON(), room: room.getRoomID() });
	});

	// User
	it('should have an array for current user subscribers/observers', () => {
		expect(Array.isArray(service._getCurrentUserSubscribers()));
	});

	it('should have an array for logged-in status subscribers/observers', () => {
		expect(Array.isArray(service._getLoggedInStatusSubscribers()));
	});

	it('should have the data for the current user', () => {
		expect(service._getCurrentUser()).toBeDefined();
	});

	it('should have a public method/function for exposing an Observable of the CurrentUser', () => {
		let obs = service.currentUser();

		expect(typeof service.currentUser).toEqual('function');
		expect(typeof obs.subscribe).toEqual('function');
	});

	it('should have a function to make a login attempt by emitting through the socket service', () => {
		let emitSpy = spyOn(service._getSocketService(), 'emit').and.callFake(({ username, password }) => {});
		let username = 'username';
		let password = 'password';

		let result = service.attemptLogin(username, password);

		expect(typeof service.attemptLogin).toEqual('function');
		expect(emitSpy).toHaveBeenCalledWith('login', { username, password });
		expect(result).toBeTrue();
	});

	it('should have a function to log-in a user, which should update current-user subscribers and logged-in status subscribers', () => {
		let updateCurrentUserSubSpy = spyOn(service, 'updateCurrentUserSubscribers');
		let updateLoggedInSubSpy = spyOn(service, 'updateLoggedInSubscribers');
		service.login('denny', 'id');

		expect(typeof service.login).toEqual('function');
		expect(updateCurrentUserSubSpy).toHaveBeenCalled();
		expect(updateLoggedInSubSpy).toHaveBeenCalled();
	});

	it('should have a function to log-out the current user', () => {
		let updateCurrentUserSubSpy = spyOn(service, 'updateCurrentUserSubscribers');
		let updateLoggedInSubSpy = spyOn(service, 'updateLoggedInSubscribers');
		let result = service.attemptLogin('denny', 'password');

		service.logout();

		expect(typeof service.logout).toEqual('function');
		expect(result).toBeTrue();
		expect(updateCurrentUserSubSpy).toHaveBeenCalled();
		expect(updateLoggedInSubSpy).toHaveBeenCalled();
		expect(service._getCurrentUser()).toBeFalsy();
	});
});
