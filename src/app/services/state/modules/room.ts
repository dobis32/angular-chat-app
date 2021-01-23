import { isDevMode } from '@angular/core';
import { ChatRoom } from '../../../util/chatRoom';
import { User } from '../../../util/user';
import { SocketService } from './../../socket.service';
import { Observable } from 'rxjs';
import { Freshy } from 'src/app/util/freshy';

export class RoomStateModule {
	private _roomsList: Freshy<Array<ChatRoom>>;
	private _currentRoom: Freshy<ChatRoom>;
	private _usersInCurrentRoom: Freshy<Array<User>>;

	constructor(private socket: SocketService) {
		this._roomsList = new Freshy<Array<ChatRoom>>([]);
		this._currentRoom = new Freshy<ChatRoom>();
		this._usersInCurrentRoom = new Freshy<Array<User>>();
	}

	createRoom(name: string, capacity: number, password: string, userID: string) {
		if (name && capacity && userID) this.socket.emit('createRoom', { name, capacity, password, userID });
	}

	parseAndUpdateRooms(roomsData: Array<any>) {
		let parsedRoomsList = this.parseRoomsList(roomsData);
		this.updateRoomsList(parsedRoomsList);
	}

	currentRoomIsDefined(): boolean {
		if (this._currentRoom.getData() != undefined) return true;
		else return false;
	}

	joinRoom(user: User, room: ChatRoom, password?: string) {
		if (room.joinable(password ? password : ''))
			this.socket.emit('join', { user: user.getId(), room: room.getRoomID() });
	}

	currentRoom(): Observable<ChatRoom> {
		return this._currentRoom.observableData;
	}

	usersInCurrentRoom(): Observable<Array<User>> {
		return this._usersInCurrentRoom.observableData;
	}

	roomsList(): Observable<Array<any>> {
		return this._roomsList.observableData;
	}

	userHasRoomPowers(user: User, room: ChatRoom): boolean {
		if (room.getOwner() == user.getId() || room.getAdmins().find((id) => id == user.getId())) return true;
		else return false;
	}

	getCurrentRoom(): ChatRoom {
		return this._currentRoom.getData();
	}

	findRoomByName(name: string): ChatRoom {
		return this._roomsList.getData().find((rm: ChatRoom) => rm.getName() == name);
	}

	findRoomByID(id: string): ChatRoom {
		return this._roomsList.getData().find((rm: ChatRoom) => rm.getRoomID() == id);
	}

	updateRoomsList(rooms: Array<ChatRoom>): void {
		this._roomsList.refresh(rooms);
	}

	kickUserFromCurrentRoom(user: User) {
		if (this._currentRoom.getData())
			this.socket.emit('kick', { user: user.getId(), room: this._currentRoom.getData().getRoomID() });
	}

	updateCurrentRoomInstance(providedID?: string) {
		let roomID = providedID ? providedID : '';
		let roomInstance = this.findRoomByID(roomID);

		this._currentRoom.refresh(roomInstance);
		this._usersInCurrentRoom.refresh(roomInstance ? roomInstance.getUsers() : []);
	}

	userLeaveCurrentRoom(user: User): void {
		if (this._currentRoom.getData())
			this.socket.emit('leave', { user: user.getId(), room: this._currentRoom.getData().getRoomID() });
		this._currentRoom.refresh(undefined);
	}

	parseRoomsList(unparsedList: Array<any>): Array<ChatRoom> {
		let parsedList = new Array();
		unparsedList.forEach(({ id, name, capacity, owner, users, password, admins, bans }) => {
			try {
				if (!id || !name || !capacity)
					throw new Error('Failed to parse room; one or more required parameters is invalid');
				let parsedUsers: Array<User> = [];
				if (users)
					users.forEach(({ id, name }) => {
						parsedUsers.push(new User(name, id));
					});
				let rm = new ChatRoom(id, name, capacity, owner, parsedUsers, password, admins, bans);
				parsedList.push(rm);
			} catch (error) {
				console.log(error);
			}
		});

		return parsedList;
	}

	emitCurrentRoomUpdate(room: ChatRoom, user: User) {
		if (this.userHasRoomPowers(user, room)) {
			let result = this.socket.emit('currentRoomUpdate', {
				roomID: room.getRoomID(),
				name: room.getName(),
				capacity: room.getCapacity(),
				password: room.getPassword(),
				userID: user.getId()
			});
			if (!result) alert('Failed to create room');
		}
	}

	promoteUser(user: User) {
		// TODO implement & unit test
	}

	demoteUser(user: User) {
		// TODO implement & unit test
	}

	kickUser(user: User) {
		// TODO implement & unit test
	}

	banUser(user: User) {
		// TODO implement & unit test
	}

	_getSocketService(): SocketService {
		if (isDevMode()) return this.socket;
		else {
			console.log('Sorry _getSocketService() is only available in dev mode');
			return undefined;
		}
	}

	_getRoomsList(): Array<ChatRoom> {
		if (isDevMode()) return this._roomsList.getData();
		else {
			console.log('Sorry _getRoomsList() is only available in dev mode');
			return undefined;
		}
	}

	_setRoomsList(rooms: Array<ChatRoom>) {
		if (isDevMode()) this._roomsList.refresh(rooms);
		else {
			console.log('Sorry _setRoomsList() is only available in dev mode');
			return undefined;
		}
	}

	_setCurrentRoom(room: ChatRoom) {
		if (isDevMode()) this._currentRoom.refresh(room);
		else {
			console.log('Sorry _setCurrentRoom() is only available in dev mode');
			return undefined;
		}
	}

	_getCurrentRoom(): ChatRoom {
		if (isDevMode()) return this._currentRoom.getData();
		else {
			console.log('Sorry _getCurrentRoom() is only available in dev mode');
			return undefined;
		}
	}

	_getCurrentRoomFreshy(): Freshy<ChatRoom> {
		if (isDevMode()) return this._currentRoom;
		else {
			console.log('Sorry _getCurrentRoomFreshy() is only available in dev mode');
			return undefined;
		}
	}

	_getRoomsListFreshy(): Freshy<Array<ChatRoom>> {
		if (isDevMode()) return this._roomsList;
		else {
			console.log('Sorry _getRoomsListFreshy() is only available in dev mode');
			return undefined;
		}
	}

	_getUsersInCurrentRoomFreshy(): Freshy<Array<User>> {
		if (isDevMode()) return this._usersInCurrentRoom;
		else {
			console.log('Sorry _getUsersInCurrentRoomFreshy() is only available in dev mode');
			return undefined;
		}
	}
}
