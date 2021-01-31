import { RoomStateModule } from './room';
import { SocketService } from '../../socket.service';
import { ChatRoom } from '../../../util/chatRoom';
import { User } from '../../../util/user';

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

	it('should have a public method/function for exposing an Observalbe of the current ChatRoom', () => {
		let obs = roomStateModule.currentRoom();

		expect(typeof roomStateModule.currentRoom).toEqual('function');
		expect(typeof obs.subscribe).toEqual('function');
	});

	it('should have a function for updating the current room instance', () => {
		let findSpy = spyOn(roomStateModule, 'findRoomByID').and.callThrough();
		let updateCurrentRoomSubsSpy = spyOn(roomStateModule._getCurrentRoomFreshy(), 'refresh').and.callThrough();
		let updateCurrentUsersSubsSpy = spyOn(
			roomStateModule._getUsersInCurrentRoomFreshy(),
			'refresh'
		).and.callThrough();
		let initCurrentRoom = roomStateModule._getCurrentRoom();
		let uid = 'someID';
		let rm = new ChatRoom('id', 'name', 6, uid);

		roomStateModule._setRoomsList([ rm ]);
		roomStateModule.updateCurrentRoomInstance(rm.getRoomID());

		expect(typeof roomStateModule.updateCurrentRoomInstance).toEqual('function');
		expect(roomStateModule._getCurrentRoom() == initCurrentRoom).toBeFalse();
		expect(findSpy).toHaveBeenCalled();
		expect(updateCurrentRoomSubsSpy).toHaveBeenCalled();
		expect(updateCurrentUsersSubsSpy).toHaveBeenCalled();
	});

	it('should still update the current room if there is no corresponding room instance in the rooms list', () => {
		let findSpy = spyOn(roomStateModule, 'findRoomByID').and.callThrough();
		let updateCurrentRoomSubsSpy = spyOn(roomStateModule._getCurrentRoomFreshy(), 'refresh').and.callThrough();
		let updateCurrentUsersSubsSpy = spyOn(
			roomStateModule._getUsersInCurrentRoomFreshy(),
			'refresh'
		).and.callThrough();
		let initCurrentRoom = roomStateModule._getCurrentRoom();
		let uid = 'someID';
		let rm = new ChatRoom('id', 'name', 6, uid);

		roomStateModule._setRoomsList([ rm ]);
		roomStateModule.updateCurrentRoomInstance('foo');

		expect(typeof roomStateModule.updateCurrentRoomInstance).toEqual('function');
		expect(roomStateModule._getCurrentRoom() == initCurrentRoom).toBeTrue();
		expect(findSpy).toHaveBeenCalled();
		expect(updateCurrentRoomSubsSpy).toHaveBeenCalled();
		expect(updateCurrentUsersSubsSpy).toHaveBeenCalled();
	});

	it('should have a function to have the current user leave the current ChatRoom and update corresponding observers', () => {
		roomStateModule._setCurrentRoom(new ChatRoom('id', 'test room', 6, 'onwerID', [], '', [], []));

		let spy = spyOn(roomStateModule._getCurrentRoomFreshy(), 'refresh').and.callThrough();
		roomStateModule.userLeaveCurrentRoom(new User('denny', 'dennyID'));

		expect(typeof roomStateModule.userLeaveCurrentRoom).toEqual('function');
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
		let pw = 'pw';
		let room = new ChatRoom('rid', 'roomName', 6, 'uid', [], pw);
		let joinableSpy = spyOn(room, 'joinable').and.callThrough();
		let emitSpy = spyOn(roomStateModule._getSocketService(), 'emit').and.callFake(() => {
			return true;
		});

		roomStateModule.joinRoom(user, room, pw);

		expect(typeof roomStateModule.joinRoom).toEqual('function');
		expect(joinableSpy).toHaveBeenCalled();
		expect(emitSpy).toHaveBeenCalledWith('join', { user: user.getId(), room: room.getRoomID() });
		expect(room.joinable(user.getId(), pw)).toBeTrue();
	});

	it('should, when trying to join a room, prevent a "join" socket event from being emitted if the wrong password is provided', () => {
		let user = new User('denny', 'uid');
		let pw = 'pw';
		let room = new ChatRoom('rid', 'roomName', 6, 'uid', [], 'foo');
		let joinableSpy = spyOn(room, 'joinable').and.callThrough();
		let emitSpy = spyOn(roomStateModule._getSocketService(), 'emit').and.callFake(() => {
			return true;
		});

		roomStateModule.joinRoom(user, room, pw);

		expect(joinableSpy).toHaveBeenCalled();
		expect(emitSpy).toHaveBeenCalledTimes(0);
		expect(room.joinable(user.getId())).toBeFalse();
	});

	it('should, when trying to join a room, prevent a "join" socket event from being emitted if a room is full', () => {
		let user = new User('denny', 'uid');
		let usersInRoom = [
			new User('name', 'id1'),
			new User('name', 'id2'),
			new User('name', 'id3'),
			new User('name', 'id4'),
			new User('name', 'id5'),
			new User('name', 'id6')
		];
		let room = new ChatRoom('rid', 'roomName', 6, 'uid', usersInRoom);
		let joinableSpy = spyOn(room, 'joinable').and.callThrough();
		let emitSpy = spyOn(roomStateModule._getSocketService(), 'emit').and.callFake(() => {
			return true;
		});

		roomStateModule.joinRoom(user, room);

		expect(joinableSpy).toHaveBeenCalled();
		expect(emitSpy).toHaveBeenCalledTimes(0);
		expect(room.joinable(user.getId())).toBeFalse();
	});

	it('should, when tyring to join a room, prevent a "join" socket event from being emitted if the current user is banned from the room', () => {
		let user = new User('denny', 'uid');
		let pw = 'pw';
		let room = new ChatRoom('rid', 'roomName', 6, 'uid', [], pw, [], [ user.getId() ]);
		let joinableSpy = spyOn(room, 'joinable').and.callThrough();
		let emitSpy = spyOn(roomStateModule._getSocketService(), 'emit').and.callFake(() => {
			return true;
		});

		roomStateModule.joinRoom(user, room);

		expect(joinableSpy).toHaveBeenCalled();
		expect(emitSpy).toHaveBeenCalledTimes(0);
		expect(room.joinable(user.getId())).toBeFalse();
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

	it('should have a function to emit a "currentRoomUpdate" socket event', () => {
		const rm = new ChatRoom('id', 'name', 6, 'owner');
		const user = new User('denny', 'owner');
		const dataToEmit = {
			roomID: rm.getRoomID(),
			name: rm.getName(),
			capacity: rm.getCapacity(),
			password: rm.getPassword(),
			userID: user.getId()
		};
		const emitSpy = spyOn(roomStateModule._getSocketService(), 'emit').and.callFake(() => {
			return true;
		});
		roomStateModule.emitCurrentRoomUpdate(rm, user);

		expect(typeof roomStateModule.emitCurrentRoomUpdate).toEqual('function');
		expect(emitSpy).toHaveBeenCalledWith('currentRoomUpdate', dataToEmit);
	});

	it('should not emit a "currentRoomUpdate" socket event if the user does not have room powers', () => {
		const rm = new ChatRoom('room', 'name', 2, 'someone');
		const user = new User('denny', 'dennyID');
		const socketSpy = spyOn(roomStateModule._getSocketService(), 'emit').and.callFake(() => {
			return true;
		});

		roomStateModule.emitCurrentRoomUpdate(rm, user);

		expect(roomStateModule.userHasRoomPowers(user, rm)).toBeFalse();
		expect(socketSpy).toHaveBeenCalledTimes(0);
	});

	it('should have a function to return an array of Users in the current room', () => {
		const curRoom = new ChatRoom('roomID', 'roomA', 4, 'foobar');
		roomStateModule._setCurrentRoom(curRoom);
		const obs = roomStateModule.usersInCurrentRoom();
		expect(typeof roomStateModule.usersInCurrentRoom).toEqual('function');
		expect(typeof obs.subscribe).toEqual('function');
	});

	it('should have a function to kick a user from a ChatRoom', () => {
		const userToKick = new User('name', 'id');
		const room = new ChatRoom('roomID', 'roomName', 6, 'owner');
		const emitSpy = spyOn(roomStateModule._getSocketService(), 'emit').and.callFake(() => {
			return true;
		});
		roomStateModule._setCurrentRoom(new ChatRoom('id', 'name', 6, 'owner'));

		roomStateModule.kickUser(userToKick, room);

		expect(typeof roomStateModule.kickUser).toEqual('function');
		expect(emitSpy).toHaveBeenCalled();
	});

	it('should have a function to ban a user from a ChatRoom', () => {
		const userToKick = new User('name', 'id');
		const room = new ChatRoom('roomID', 'roomName', 6, 'owner');
		const emitSpy = spyOn(roomStateModule._getSocketService(), 'emit').and.callFake(() => {
			return true;
		});
		roomStateModule._setCurrentRoom(new ChatRoom('id', 'name', 6, 'owner'));

		roomStateModule.banUser(userToKick, room);

		expect(typeof roomStateModule.kickUser).toEqual('function');
		expect(emitSpy).toHaveBeenCalled();
	});

	it('should have a function for updating the current room instance based on room ID', () => {
		const roomID = 'roomID';
		const roomToUpdate = new ChatRoom(roomID, 'name', 6, 'owner');
		const roomList = [ roomToUpdate, new ChatRoom('otherRoom', 'name', 6, 'owner') ];
		const findRoomSpy = spyOn(roomStateModule, 'findRoomByID').and.callThrough();
		const currentRoomRefreshSpy = spyOn(roomStateModule._getCurrentRoomFreshy(), 'refresh').and.callThrough();
		const currentUsersRefreshSpy = spyOn(
			roomStateModule._getUsersInCurrentRoomFreshy(),
			'refresh'
		).and.callThrough();

		roomStateModule._setRoomsList(roomList);

		roomStateModule.updateCurrentRoomInstance(roomID);

		expect(typeof roomStateModule.updateCurrentRoomInstance).toEqual('function');
		expect(findRoomSpy).toHaveBeenCalled();
		expect(findRoomSpy).toHaveBeenCalledWith(roomID);
		expect(currentRoomRefreshSpy).toHaveBeenCalledWith(roomToUpdate);
		expect(currentUsersRefreshSpy).toHaveBeenCalledWith(roomToUpdate.getUsers());
	});

	it('should update the current room as being undefined if there is not a room with matching ID', () => {
		const roomID = 'roomID';
		const roomToUpdate = new ChatRoom(roomID, 'name', 6, 'owner');
		const roomList = [ roomToUpdate, new ChatRoom('otherRoom', 'name', 6, 'owner') ];
		const findRoomSpy = spyOn(roomStateModule, 'findRoomByID').and.callThrough();
		const currentRoomRefreshSpy = spyOn(roomStateModule._getCurrentRoomFreshy(), 'refresh').and.callThrough();
		const currentUsersRefreshSpy = spyOn(
			roomStateModule._getUsersInCurrentRoomFreshy(),
			'refresh'
		).and.callThrough();

		roomStateModule._setRoomsList(roomList);

		roomStateModule.updateCurrentRoomInstance();

		expect(typeof roomStateModule.updateCurrentRoomInstance).toEqual('function');
		expect(findRoomSpy).toHaveBeenCalledWith('');
		expect(currentRoomRefreshSpy).toHaveBeenCalledWith(undefined);
		expect(currentUsersRefreshSpy).toHaveBeenCalledWith([]);
	});

	it('should have a function to promote a User in a given ChatRoom', () => {
		const room = new ChatRoom('id', 'name', 6, 'owner');
		const user = new User('name', 'id');
		const promoteSpy = spyOn(roomStateModule._getSocketService(), 'emit').and.callFake(() => {
			return true;
		});

		roomStateModule.promoteUser(user, room);

		expect(typeof roomStateModule.promoteUser).toEqual('function');
		expect(promoteSpy).toHaveBeenCalledWith('promote', { user: user.getId(), room: room.getRoomID() });
	});

	it('should have a function to demote a User in a given ChatRoom', () => {
		const room = new ChatRoom('id', 'name', 6, 'owner');
		const user = new User('name', 'id');
		const demoteSpy = spyOn(roomStateModule._getSocketService(), 'emit').and.callFake(() => {
			return true;
		});

		roomStateModule.demoteUser(user, room);

		expect(typeof roomStateModule.demoteUser).toEqual('function');
		expect(demoteSpy).toHaveBeenCalledWith('demote', { user: user.getId(), room: room.getRoomID() });
	});
});
