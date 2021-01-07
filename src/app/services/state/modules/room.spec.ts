import { RoomStateModule } from './room';
import { SocketService } from '../../socket.service';
import { ChatRoom } from '../../../util/chatRoom';
import { User } from '../../../util/user';

import { Subscription } from 'rxjs';
describe('RoomStateModule', () => {
	let roomStateModule: RoomStateModule;
	let mockSocket: SocketService;
	beforeEach(() => {
		mockSocket = new SocketService();
		mockSocket._setURI('foobar');
		roomStateModule = new RoomStateModule(mockSocket);
	});

	it('should be created', () => {
		expect(roomStateModule).toBeTruthy();
	});

	it('should have an array for holding data about available chat rooms', () => {
		expect(Array.isArray(roomStateModule._getRoomsList())).toBeTrue();
	});

	it('should have a fucntion for determining if the current ChatRoom is defined', () => {
		expect(typeof roomStateModule.currentRoomIsDefined).toEqual('function');

		roomStateModule._setCurrentRoom(undefined);
		expect(roomStateModule.currentRoomIsDefined()).toBeFalse();

		roomStateModule._setCurrentRoom(new ChatRoom('room', 'name', 6, 'owner'));
		expect(roomStateModule.currentRoomIsDefined()).toBeTrue();
	});

	it('should have a public method/function for exposing an Observalbe of the chat rooms array', () => {
		let obs = roomStateModule.roomsList();

		expect(typeof roomStateModule.roomsList).toEqual('function');
		expect(typeof obs.subscribe).toEqual('function');
	});

	it('should have an array for chat room array subscribers', () => {
		expect(Array.isArray(roomStateModule._getRoomsListSubscribers())).toBeTrue();
	});

	it('should have a funciton for updating the chat rooms array and updates rooms list subscribers', () => {
		let spy = spyOn(roomStateModule, 'updateRoomsListSubscribers').and.callThrough();

		let newRoomsList = [ new ChatRoom('id1', 'Room A', 2, 'ownerID') ];

		roomStateModule.updateRoomsList(newRoomsList);

		expect(typeof roomStateModule.updateRoomsList).toEqual('function');
		expect(spy).toHaveBeenCalledWith();
	});

	it('should have a function for updating rooms list subscribers', () => {
		let sub1: Subscription = roomStateModule.roomsList().subscribe(); // init observer
		let sub2: Subscription = roomStateModule.roomsList().subscribe(); // init observer

		let spy1 = spyOn(roomStateModule._getRoomsListSubscribers()[0], 'next').and.callThrough();
		let spy2 = spyOn(roomStateModule._getRoomsListSubscribers()[1], 'next').and.callThrough();

		roomStateModule.updateRoomsListSubscribers();

		expect(typeof roomStateModule.updateRoomsListSubscribers).toEqual('function');
		expect(spy1).toHaveBeenCalled();
		expect(spy2).toHaveBeenCalled();

		sub1.unsubscribe();
		sub2.unsubscribe();
	});

	it('should have a public method/function for exposing an Observalbe of the current ChatRoom', () => {
		let obs = roomStateModule.currentRoom();

		expect(typeof roomStateModule.currentRoom).toEqual('function');
		expect(typeof obs.subscribe).toEqual('function');
	});

	it('should have an array for current ChatRoom subscribers', () => {
		expect(Array.isArray(roomStateModule._getCurrentRoomSubscribers())).toBeTrue();
	});

	it('should have a function for updating the current room', () => {
		let findSpy = spyOn(roomStateModule, 'findRoomByID').and.callThrough();
		let updateCurrentRoomSubsSpy = spyOn(roomStateModule, 'updateCurrentRoomSubscribers').and.callThrough();
		let initCurrentRoom = roomStateModule._getCurrentRoom();
		let uid = 'someID';
		let rm = new ChatRoom('id', 'name', 6, uid);

		roomStateModule._setRoomsList([ rm ]);
		roomStateModule.updateCurrentRoom(rm.getRoomID());

		expect(typeof roomStateModule.updateCurrentRoom).toEqual('function');
		expect(roomStateModule._getCurrentRoom() == initCurrentRoom).toBeFalse();
		expect(findSpy).toHaveBeenCalled();
		expect(updateCurrentRoomSubsSpy).toHaveBeenCalled();
	});

	it('should not update the current room if there is no corresponding room instance in the rooms list', () => {
		let findSpy = spyOn(roomStateModule, 'findRoomByID').and.callThrough();
		let updateCurrentRoomSubsSpy = spyOn(roomStateModule, 'updateCurrentRoomSubscribers').and.callThrough();
		let initCurrentRoom = roomStateModule._getCurrentRoom();
		let uid = 'someID';
		let rm = new ChatRoom('id', 'name', 6, uid);

		roomStateModule._setRoomsList([ rm ]);
		roomStateModule.updateCurrentRoom('foo');

		expect(typeof roomStateModule.updateCurrentRoom).toEqual('function');
		expect(roomStateModule._getCurrentRoom() == initCurrentRoom).toBeTrue();
		expect(findSpy).toHaveBeenCalled();
		expect(updateCurrentRoomSubsSpy).toHaveBeenCalledTimes(0);
	});

	it('should have a function for updating current room subscribers', () => {
		let sub1: Subscription = roomStateModule.currentRoom().subscribe(); // init observer
		let sub2: Subscription = roomStateModule.currentRoom().subscribe(); // init observer

		let spy1 = spyOn(roomStateModule._getCurrentRoomSubscribers()[0], 'next').and.callThrough();
		let spy2 = spyOn(roomStateModule._getCurrentRoomSubscribers()[1], 'next').and.callThrough();

		roomStateModule.updateCurrentRoomSubscribers();

		expect(typeof roomStateModule.updateCurrentRoomSubscribers).toEqual('function');
		expect(spy1).toHaveBeenCalled();
		expect(spy2).toHaveBeenCalled();

		sub1.unsubscribe();
		sub2.unsubscribe();
	});

	it('should have a function to leave the current ChatRoom and update corresponding observers', () => {
		roomStateModule._setCurrentRoom(new ChatRoom('id', 'test room', 6, 'onwerID', [], '', [], []));

		let spy = spyOn(roomStateModule, 'updateCurrentRoomSubscribers').and.callThrough();
		roomStateModule.leaveCurrentRoom(new User('denny', 'dennyID'));

		expect(typeof roomStateModule.leaveCurrentRoom).toEqual('function');
		expect(spy).toHaveBeenCalled();
		expect(roomStateModule._getCurrentRoom()).toEqual(undefined);
	});

	it('should have a function to parse rooms list data into ChatRoom instances and return an array of said ChatRooms', () => {
		let parsed = roomStateModule.parseRoomsList([
			{ id: 'id', name: 'name', capacity: 6 },
			{ id: 'id', name: 'name', capacity: 6 },
			{ id: 'id', name: 'name', capacity: 6 }
		]);

		expect(typeof roomStateModule.parseRoomsList).toEqual('function');
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

		let parsed1 = roomStateModule.parseRoomsList(unparsed1);
		let parsed2 = roomStateModule.parseRoomsList(unparsed2);
		let parsed3 = roomStateModule.parseRoomsList(unparsed3);

		expect(parsed1.length).toEqual(2);
		expect(parsed2.length).toEqual(2);
		expect(parsed3.length).toEqual(2);
	});

	it('should have a function for parsing and updating the rooms list', () => {
		let parseSpy = spyOn(roomStateModule, 'parseRoomsList').and.callThrough();
		let updateSpy = spyOn(roomStateModule, 'updateRoomsList').and.callThrough();
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

		roomStateModule.parseAndUpdateRooms(mockData);

		expect(typeof roomStateModule.parseAndUpdateRooms).toEqual('function');
		expect(parseSpy).toHaveBeenCalledWith(mockData);
		expect(updateSpy).toHaveBeenCalled();
	});

	it('should have a function for joining a ChatRoom that should emit a "join" socket event if said ChatRoom is joinable', () => {
		let user = new User('denny', 'uid');
		let room = new ChatRoom('rid', 'roomName', 6, 'uid');
		let joinableSpy = spyOn(room, 'joinable').and.callThrough();
		let emitSpy = spyOn(roomStateModule._getSocketService(), 'emit').and.callFake(() => {
			return true;
		});

		roomStateModule.joinRoom(user, room);

		expect(typeof roomStateModule.joinRoom).toEqual('function');
		expect(joinableSpy).toHaveBeenCalled();
		expect(emitSpy).toHaveBeenCalledWith('join', { user: user.getId(), room: room.getRoomID() });
		expect(room.joinable()).toBeTrue();
	});

	it('should prevent a "join" socket event from being emitted if a room is not joinable', () => {
		let user = new User('denny', 'uid');
		let pw = 'pw';
		let room = new ChatRoom('rid', 'roomName', 6, 'uid', [], pw);
		let joinableSpy = spyOn(room, 'joinable').and.callThrough();
		let emitSpy = spyOn(roomStateModule._getSocketService(), 'emit').and.callFake(() => {
			return true;
		});

		roomStateModule.joinRoom(user, room);

		expect(joinableSpy).toHaveBeenCalled();
		expect(emitSpy).toHaveBeenCalledTimes(0);
		expect(room.joinable()).toBeFalse();
	});

	it('should have a function for getting the current ChatRoom instance', () => {
		let room = new ChatRoom('id', 'name', 6, 'owner');

		roomStateModule._setCurrentRoom(room);

		expect(typeof roomStateModule.getCurrentRoom).toEqual('function');
		expect(roomStateModule.getCurrentRoom()).toEqual(room);
	});

	it('should have a function to find a room instance by name', () => {
		let roomToFind = new ChatRoom('id', 'name', 6, 'owner');
		let rooms = [ roomToFind, new ChatRoom('id', 'foo', 6, 'owner'), new ChatRoom('id', 'bar', 6, 'owner') ];

		roomStateModule._setRoomsList(rooms);

		let result1 = roomStateModule.findRoomByName('fizz');
		let result2 = roomStateModule.findRoomByName(roomToFind.getName());

		expect(typeof roomStateModule.findRoomByName).toEqual('function');
		expect(result1).toBeUndefined();
		expect(result2).toEqual(roomToFind);
	});

	it('should have a function to determine if a user has powers in a ChatRoom', () => {
		const ownerID = 'owner';
		const owner = new User('name', ownerID);

		const adminID = 'admin';
		const admin = new User('name', adminID);

		const rando = new User('user', 'random');

		const rm = new ChatRoom('id', 'name', 6, owner.getId(), [], '', [ adminID ]);

		const result1 = roomStateModule.userHasRoomPowers(owner, rm);
		const result2 = roomStateModule.userHasRoomPowers(admin, rm);
		const result3 = roomStateModule.userHasRoomPowers(rando, rm);

		expect(typeof roomStateModule.userHasRoomPowers).toEqual('function');
		expect(result1).toBeTrue();
		expect(result2).toBeTrue();
		expect(result3).toBeFalse();
	});
});
