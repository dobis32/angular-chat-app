import { TestBed } from '@angular/core/testing';

import { StateService } from './state.service';
import { MockSocketService } from '../../util/testing/MockSocketService';
import { SocketService } from './../socket.service';
import { ChatMessage } from '../../util/chatMessage';
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
		service._setUser(new User('Test user', 'test_nonce')); // login a user for convenience
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

	it('should listen to the "createRoom" event from the SocketService', () => {
		let listenSpy = spyOn(service._getSocketService(), 'listen').and.callThrough();

		service.resetSocketSubs();

		expect(listenSpy).toHaveBeenCalledWith('createRoom');
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

	it('should have a function that handles "join" socket event', () => {
		expect(typeof service.handleJoin).toEqual('function');
	});

	it('should leave the current room when the "join" event handler receives undefined room data upon "join" socket event', () => {
		let dennyID = 'dennyID';
		let data = {};
		service.room._setCurrentRoom(new ChatRoom('id', 'name', 6, dennyID));
		service._setUser(new User('denny', dennyID));
		let leaveFnSpy = spyOn(service.room, 'leaveCurrentRoom').and.callThrough();

		service.handleJoin(data);

		expect(leaveFnSpy).toHaveBeenCalled();
	});

	it('should look for and attempt to join target ChatRoom if room ID is received upon "join" socket event', () => {
		let updateSpy = spyOn(service.room, 'updateCurrentRoom').and.callThrough();
		let data = { id: 'roomID', name: 'name', capacity: 6, owner: 'ownerID' };

		service.room._setRoomsList([ new ChatRoom(data.id, data.name, data.capacity, data.owner) ]);
		service.handleJoin(data);

		expect(updateSpy).toHaveBeenCalledWith(data.id);
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

	it('should have a function to appropriately handle a "createRoom" socket event', () => {
		let parseAndUpdateSpy = spyOn(service.room, 'parseAndUpdateRooms').and.callFake(() => {});
		let updateCurrentRoomSpy = spyOn(service.room, 'updateCurrentRoom').and.callFake(() => {});

		service.handleRoomCreation({ rooms: [], roomToJoin: 'foobar' });

		expect(typeof service.handleRoomCreation).toEqual('function');
		expect(parseAndUpdateSpy).toHaveBeenCalled();
		expect(updateCurrentRoomSpy).toHaveBeenCalled();
	});

	it('should have a function to handle a "roomsUpdate" socket event', () => {
		let parseAndUpdateSpy = spyOn(service.room, 'parseAndUpdateRooms').and.callFake(() => {});

		service.handleRoomsUpdate([]);

		expect(typeof service.handleRoomsUpdate).toEqual('function');
		expect(parseAndUpdateSpy).toHaveBeenCalled();
	});

	it('should, upon handling a "roomsUpdate" socket event, update the current room', () => {
		let updateCurrentRoomSpy = spyOn(service.room, 'updateCurrentRoom').and.callFake(() => {});
		let rm = new ChatRoom('id', 'name', 6, 'denny');

		service.room._setCurrentRoom(rm);

		service.handleRoomsUpdate([]);

		expect(updateCurrentRoomSpy).toHaveBeenCalled();
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

	// Modal
	it('should have a function that returns an observable of the active modal name and callback function', () => {
		let obs = service.modal.state();

		expect(typeof service.modal.state).toEqual('function');
		expect(typeof obs.subscribe).toEqual('function');
	});

	it('should have a function that returns an observable of the active-status of the app modal', () => {
		let obs = service.modal.modalActiveStatus();

		expect(typeof service.modal.modalActiveStatus).toEqual('function');
		expect(typeof obs.subscribe).toEqual('function');
	});

	it('should have a function to open the app modal and set the modal-active status and callback function', () => {
		let modalName = 'test';
		let cb = () => {
			return true;
		};
		let refreshModalSubsSpy = spyOn(service.modal, 'refreshModalSubscriber').and.callThrough();
		let refreshModalActiveStatusSubsSpy = spyOn(
			service.modal,
			'refreshModalActiveStatusSubscriber'
		).and.callThrough();

		service.modal._setModalActiveStatus(false);
		service.modal._setModalCB(undefined);
		service.modal._setActiveModalName(undefined);

		service.modal.openModal(modalName, cb);

		expect(typeof service.modal.openModal).toEqual('function');
		expect(refreshModalSubsSpy).toHaveBeenCalled();
		expect(refreshModalActiveStatusSubsSpy).toHaveBeenCalled();
		expect(service.modal._getModalActiveStatus()).toBeTrue();
		expect(service.modal._getActiveModalName()).toEqual(modalName);
		expect(service.modal._getModalCB()).toEqual(cb);
	});

	it('should have a function to close the app modal', () => {
		let initStatus = true;
		let refreshModalSubsSpy = spyOn(service.modal, 'refreshModalSubscriber').and.callThrough();
		let refreshModalActiveStatusSubsSpy = spyOn(
			service.modal,
			'refreshModalActiveStatusSubscriber'
		).and.callThrough();

		service.modal._setModalActiveStatus(initStatus);
		service.modal.closeModal();

		expect(typeof service.modal.closeModal).toEqual('function');
		expect(service.modal._getModalActiveStatus()).toBeFalse();
		expect(refreshModalSubsSpy).toHaveBeenCalled();
		expect(refreshModalActiveStatusSubsSpy).toHaveBeenCalled();
	});

	it('should have a function to refresh the observer of the modal active status', () => {
		let sub = service.modal.modalActiveStatus().subscribe();
		let activeStatusObserver = service.modal._getModalActiveStatusSubscriber();
		let observerSpy = spyOn(activeStatusObserver, 'next').and.callThrough();

		service.modal.refreshModalActiveStatusSubscriber();

		expect(typeof service.modal.refreshModalActiveStatusSubscriber).toEqual('function');
		expect(observerSpy).toHaveBeenCalled();

		sub.unsubscribe();
	});

	it('should have a function to refresh the observer of the modal', () => {
		let sub = service.modal.state().subscribe();
		let modalObserver = service.modal._getModalSubscriber();
		let observerSpy = spyOn(modalObserver, 'next').and.callThrough();

		service.modal.refreshModalSubscriber();

		expect(typeof service.modal.refreshModalSubscriber).toEqual('function');
		expect(observerSpy).toHaveBeenCalled();

		sub.unsubscribe();
	});

	it('should have the current modal callback function', () => {
		let cb = () => {};
		service.modal._setModalCB(cb);
		expect(service.modal._getModalCB()).toEqual(cb);
	});

	it('should have the current active-modal name', () => {
		let modalName = 'test';
		service.modal._setActiveModalName(modalName);
		expect(service.modal._getActiveModalName()).toEqual(modalName);

	});

	it('should have a function that uses the app modal to prompt the user for a room password', () => {
		let modalSpy = spyOn(service.modal, 'openModal').and.callThrough();
	
		service.modal.promptRoomPassword();
		service.modal.closeModal();

		expect(typeof service.modal.promptRoomPassword).toEqual('function');
		expect(modalSpy).toHaveBeenCalled();
	});

	// Chat Rooms
	it('should have an array for holding data about available chat rooms', () => {
		expect(Array.isArray(service.room._getRoomsList())).toBeTrue();
	});

	it('should have a fucntion for determining if the current ChatRoom is defined', () => {
		expect(typeof service.room.currentRoomIsDefined).toEqual('function');

		service.room._setCurrentRoom(undefined);
		expect(service.room.currentRoomIsDefined()).toBeFalse();
		
		service.room._setCurrentRoom(new ChatRoom('room', 'name', 6, 'owner'));
		expect(service.room.currentRoomIsDefined()).toBeTrue();
	});

	it('should have a public method/function for exposing an Observalbe of the chat rooms array', () => {
		let obs = service.room.roomsList();

		expect(typeof service.room.roomsList).toEqual('function');
		expect(typeof obs.subscribe).toEqual('function');
	});

	it('should have an array for chat room array subscribers', () => {
		expect(Array.isArray(service.room._getRoomsListSubscribers())).toBeTrue();
	});

	it('should have a funciton for updating the chat rooms array and updates rooms list subscribers', () => {
		let spy = spyOn(service.room, 'updateRoomsListSubscribers').and.callThrough();

		let newRoomsList = [ new ChatRoom('id1', 'Room A', 2, 'ownerID') ];

		service.room.updateRoomsList(newRoomsList);

		expect(typeof service.room.updateRoomsList).toEqual('function');
		expect(spy).toHaveBeenCalledWith();
	});

	it('should have a function for updating rooms list subscribers', () => {
		let sub1: Subscription = service.room.roomsList().subscribe(); // init observer
		let sub2: Subscription = service.room.roomsList().subscribe(); // init observer

		let spy1 = spyOn(service.room._getRoomsListSubscribers()[0], 'next').and.callThrough();
		let spy2 = spyOn(service.room._getRoomsListSubscribers()[1], 'next').and.callThrough();

		service.room.updateRoomsListSubscribers();

		expect(typeof service.room.updateRoomsListSubscribers).toEqual('function');
		expect(spy1).toHaveBeenCalled();
		expect(spy2).toHaveBeenCalled();

		sub1.unsubscribe();
		sub2.unsubscribe();
	});

	it('should have a public method/function for exposing an Observalbe of the current ChatRoom', () => {
		let obs = service.room.currentRoom();

		expect(typeof service.room.currentRoom).toEqual('function');
		expect(typeof obs.subscribe).toEqual('function');
	});

	it('should have an array for current ChatRoom subscribers', () => {
		expect(Array.isArray(service.room._getCurrentRoomSubscribers())).toBeTrue();
	});

	it('should have a function for updating the current room', () => {
		let findSpy = spyOn(service.room, 'findRoomByID').and.callThrough();
		let updateCurrentRoomSubsSpy = spyOn(service.room, 'updateCurrentRoomSubscribers').and.callThrough();
		let initCurrentRoom = service.room._getCurrentRoom();
		let uid = 'someID';
		let rm = new ChatRoom('id', 'name', 6, uid);

		service.room._setRoomsList([ rm ]);
		service.room.updateCurrentRoom(rm.getRoomID());

		expect(typeof service.room.updateCurrentRoom).toEqual('function');
		expect(service.room._getCurrentRoom() == initCurrentRoom).toBeFalse();
		expect(findSpy).toHaveBeenCalled();
		expect(updateCurrentRoomSubsSpy).toHaveBeenCalled();
	});

	it('should not update the current room if there is no corresponding room instance in the rooms list', () => {
		let findSpy = spyOn(service.room, 'findRoomByID').and.callThrough();
		let updateCurrentRoomSubsSpy = spyOn(service.room, 'updateCurrentRoomSubscribers').and.callThrough();
		let initCurrentRoom = service.room._getCurrentRoom();
		let uid = 'someID';
		let rm = new ChatRoom('id', 'name', 6, uid);

		service.room._setRoomsList([ rm ]);
		service.room.updateCurrentRoom('foo');

		expect(typeof service.room.updateCurrentRoom).toEqual('function');
		expect(service.room._getCurrentRoom() == initCurrentRoom).toBeTrue();
		expect(findSpy).toHaveBeenCalled();
		expect(updateCurrentRoomSubsSpy).toHaveBeenCalledTimes(0);
	});

	it('should have a function for updating current room subscribers', () => {
		let sub1: Subscription = service.room.currentRoom().subscribe(); // init observer
		let sub2: Subscription = service.room.currentRoom().subscribe(); // init observer

		let spy1 = spyOn(service.room._getCurrentRoomSubscribers()[0], 'next').and.callThrough();
		let spy2 = spyOn(service.room._getCurrentRoomSubscribers()[1], 'next').and.callThrough();

		service.room.updateCurrentRoomSubscribers();

		expect(typeof service.room.updateCurrentRoomSubscribers).toEqual('function');
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

	it('should have a function to leave the current ChatRoom and update corresponding observers', () => {
		service.room._setCurrentRoom(new ChatRoom('id', 'test room', 6, 'onwerID', [], '', [], []));

		let spy = spyOn(service.room, 'updateCurrentRoomSubscribers').and.callThrough();
		service.room.leaveCurrentRoom(new User('denny', 'dennyID'));

		expect(typeof service.room.leaveCurrentRoom).toEqual('function');
		expect(spy).toHaveBeenCalled();
		expect(service.room._getCurrentRoom()).toEqual(undefined);
	});

	it('should have a function to parse rooms list data into ChatRoom instances and return an array of said ChatRooms', () => {
		let parsed = service.room.parseRoomsList([
			{ id: 'id', name: 'name', capacity: 6 },
			{ id: 'id', name: 'name', capacity: 6 },
			{ id: 'id', name: 'name', capacity: 6 }
		]);

		expect(typeof service.room.parseRoomsList).toEqual('function');
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

		let parsed1 = service.room.parseRoomsList(unparsed1);
		let parsed2 = service.room.parseRoomsList(unparsed2);
		let parsed3 = service.room.parseRoomsList(unparsed3);

		expect(parsed1.length).toEqual(2);
		expect(parsed2.length).toEqual(2);
		expect(parsed3.length).toEqual(2);
	});

	it('should have a function for parsing and updating the rooms list', () => {
		let parseSpy = spyOn(service.room, 'parseRoomsList').and.callThrough();
		let updateSpy = spyOn(service.room, 'updateRoomsList').and.callThrough();
		let mockData = [
			{
				id: 'id',
				name: 'name',
				owner: 'owner',
				capacity: 6,
				password: 'password',
				users: [],
				admins: [],
				bans: []
			}
		];

		service.room.parseAndUpdateRooms(mockData);

		expect(typeof service.room.parseAndUpdateRooms).toEqual('function');
		expect(parseSpy).toHaveBeenCalledWith(mockData);
		expect(updateSpy).toHaveBeenCalled();
	});

	it('should have a function for joining a ChatRoom that should emit a "join" socket event if said ChatRoom is joinable', () => {
		let user = new User('denny', 'uid');
		let room = new ChatRoom('rid', 'roomName', 6, 'uid');
		let joinableSpy = spyOn(room, 'joinable').and.callThrough();
		let emitSpy = spyOn(service._getSocketService(), 'emit').and.callFake(() => {
			return true;
		});

		service.room.joinRoom(user, room);

		expect(typeof service.room.joinRoom).toEqual('function');
		expect(joinableSpy).toHaveBeenCalled();
		expect(emitSpy).toHaveBeenCalledWith('join', { user: user.getId(), room: room.getRoomID()})
		expect(room.joinable()).toBeTrue();
	});

	it('should prevent a "join" socket event from being emitted if a room is not joinable', () => {
		let user = new User('denny', 'uid');
		let pw = 'pw';
		let room = new ChatRoom('rid', 'roomName', 6, 'uid', [], pw);
		let joinableSpy = spyOn(room, 'joinable').and.callThrough();
		let emitSpy = spyOn(service._getSocketService(), 'emit').and.callFake(() => {
			return true;
		});

		service.room.joinRoom(user, room);

		expect(joinableSpy).toHaveBeenCalled();
		expect(emitSpy).toHaveBeenCalledTimes(0)
		expect(room.joinable()).toBeFalse();
	});

	it('should have a function for getting the current ChatRoom instance', () => {
		let room = new ChatRoom('id', 'name', 6, 'owner');
		
		service.room._setCurrentRoom(room);

		expect(typeof service.room.getCurrentRoom).toEqual('function');
		expect(service.room.getCurrentRoom()).toEqual(room);
	});

	it('should have a function to find a room instance by name', () => {
		let roomToFind = new ChatRoom('id', 'name', 6, 'owner');
		let rooms = [roomToFind,  new ChatRoom('id', 'foo', 6, 'owner'), new ChatRoom('id', 'bar', 6, 'owner')]
		
		service.room._setRoomsList(rooms);

		let result1 = service.room.findRoomByName('fizz');
		let result2 = service.room.findRoomByName(roomToFind.getName());

		expect(typeof service.room.findRoomByName).toEqual('function');
		expect(result1).toBeUndefined();
		expect(result2).toEqual(roomToFind);
		
	});

	//Chat log
	it('should have a chat log', () => {
		expect(Array.isArray(service.chatLog._getChatLog()));
	});

	it('should have an array for chat log subscribers/observers', () => {
		expect(Array.isArray(service.chatLog._getChatLogSubscribers()));
	});

	it('should have a public method/function for exposing an Observable of the ChatLog', () => {
		let obs = service.chatLog.state();

		expect(typeof service.chatLog.state).toEqual('function');
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

		parsedMessages = service.chatLog.parseChatLog(chatMessageData);

		expect(Array.isArray(parsedMessages));
		expect(parsedMessages.length).toEqual(chatMessageData.length);
	});

	it('should have a function for updating all chat log subscribers', () => {
		let currentChatLog = service.chatLog._getChatLog();

		let subscription1 = service.chatLog.state().subscribe();
		let subscription2 = service.chatLog.state().subscribe();

		let obSpy1 = spyOn(service.chatLog._getChatLogSubscribers()[0], 'next').and.callThrough();
		let obSpy2 = spyOn(service.chatLog._getChatLogSubscribers()[1], 'next').and.callThrough();

		service.chatLog.updateChatLogSubscribers();

		expect(typeof service.chatLog.updateChatLogSubscribers).toEqual('function');
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
		let uid = 'someID';
		let message = new ChatMessage('foo', uid, d, 'some text');
		let room = new ChatRoom('id', 'name', 6, uid);
		service.room._setCurrentRoom(room);
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
		let emitSpy = spyOn(service._getSocketService(), 'emit').and.callFake((eventName: string, credentials: any) => {
			return true;
		});
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

	it('should have a function to log-out the current user which should update current-user subscribers and logged-in-status subscribers', () => {
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

	it('should have the current user leave the current room (if any) when user logs out', () => {
		let leaveRoomSpy = spyOn(service.room, 'leaveCurrentRoom').and.callThrough();

		service.attemptLogin('denny', 'password');
		service.logout();

		expect(leaveRoomSpy).toHaveBeenCalled();
	});
});
