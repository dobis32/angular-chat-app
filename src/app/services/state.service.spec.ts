import { TestBed } from '@angular/core/testing';

import { StateService } from './state.service';
import { MockSocketService } from '../util/testing/MockSocketService';
import { SocketService } from './socket.service';
import { ChatMessage } from '../util/chatMessage';
import { Subscription } from 'rxjs';
import { ChatRoom } from '../util/chatRoom';
import { User } from '../util/user';
import { hostViewClassName } from '@angular/compiler';

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

	// it('should add ChatMessages received from the "incomingMessage" socket event to the ChatLog', () => {
	// 	let initMessageCount = service._getChatLog().length;
	// 	let socket: Socket = service._getSocketService();

	// 	socket.trigger('incomingMessage', new ChatMessage('Test', new Date(), 'Hello there'));

	// 	expect(service._getChatLog().length).toBeGreaterThan(initMessageCount);
	// });

	// it('should add ChatMessages received from the "messageReceived" socket event to the ChatLog', () => {
	// 	let initMessageCount = service._getChatLog().length;
	// 	let socket: Socket = service._getSocketService();

	// 	socket.trigger('messageReceived', new ChatMessage('Test', new Date(), 'Hello there'));

	// 	expect(service._getChatLog().length).toBeGreaterThan(initMessageCount);
	// });

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

	it('should have a funciton for updating the current ChatRoom and updates current ChatRoom subscribers', () => {
		let spy = spyOn(service, 'updateCurrentRoomSubscribers').and.callThrough();

		let room = new ChatRoom('id1', 'Room A', 2);

		service.updateCurrentRoom(room);

		expect(typeof service.updateRoomsList).toEqual('function');
		expect(spy).toHaveBeenCalledWith();
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

	// Chat Message
	it('should have a public method/function for emitting ChatMessage data to the SocketService', async () => {
		let emitSpy = spyOn(service._getSocketService(), 'emit').and.callFake((event: string, data: any) => {
			return Promise.resolve();
		});
		let d = new Date();
		let message = new ChatMessage('foo', d, 'some text');

		await service.sendMessage(message);

		expect(typeof service.sendMessage).toEqual('function');
		expect(emitSpy).toHaveBeenCalled();
		expect(emitSpy).toHaveBeenCalledWith('message', message.toJSON());
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

	it('should have a function to log-in a user, which should update current-user subscribers and logged-in status subscribers', () => {
		let updateCurrentUserSubSpy = spyOn(service, 'updateCurrentUserSubscribers');
		let updateLoggedInSubSpy = spyOn(service, 'updateLoggedInSubscribers');
		let result = service.login('denny', 'password');

		expect(typeof service.login).toEqual('function');
		expect(result).toBeTrue();
		expect(updateCurrentUserSubSpy).toHaveBeenCalled();
		expect(updateLoggedInSubSpy).toHaveBeenCalled();
	});

	it('should have a function to log-out the current user', () => {
		let updateCurrentUserSubSpy = spyOn(service, 'updateCurrentUserSubscribers');
		let updateLoggedInSubSpy = spyOn(service, 'updateLoggedInSubscribers');
		let result = service.login('denny', 'password');

		service.logout();

		expect(typeof service.logout).toEqual('function');
		expect(result).toBeTrue();
		expect(updateCurrentUserSubSpy).toHaveBeenCalled();
		expect(updateLoggedInSubSpy).toHaveBeenCalled();
		expect(service._getCurrentUser()).toBeFalsy();
	});
});
