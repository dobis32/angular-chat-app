import { isDevMode } from '@angular/core';
import { ChatRoom } from '../../../util/chatRoom';
import { User } from '../../../util/user';
import { SocketService } from './../../socket.service';
import { Observer, Observable, Subscriber } from 'rxjs';

export class RoomStateModule {
	private _socket: SocketService;
	private _roomsList: Array<ChatRoom>;
	private _currentRoom: ChatRoom;

	private _currentRoomSubscribers: Array<Observer<ChatRoom>>;
	private _roomsListSubscribers: Array<Observer<Array<ChatRoom>>>;

	constructor(socket: SocketService) {
		this._socket = socket;
		this._roomsList = new Array();
		this._currentRoomSubscribers = new Array();
		this._roomsListSubscribers = new Array();
	}

	createRoom(name: string, capacity: number, password: string, userID: string) {
		this._socket.emit('createRoom', { name, capacity, password, userID });
	}

	parseAndUpdateRooms(roomsData: Array<any>) {
		let parsedRoomsList = this.parseRoomsList(roomsData);
		this.updateRoomsList(parsedRoomsList);
	}

	currentRoomIsDefined(): boolean {
		if (this._currentRoom != undefined) return true;
		else return false;
	}

	joinRoom(user: User, room: ChatRoom, password?: string) { 
		if(room.joinable(password ? password : '')) this._socket.emit('join', { user: user.getId(), room: room.getRoomID() });
	}

	currentRoom(): Observable<ChatRoom> {
		return new Observable((sub: Subscriber<ChatRoom>) => {
			sub.next(this._currentRoom);
			this._currentRoomSubscribers.push(sub);
		});
	}

	roomsList(): Observable<Array<any>> {
		return new Observable((sub: Subscriber<Array<any>>) => {
			sub.next(this._roomsList);
			this._roomsListSubscribers.push(sub);
		});
	}

	getCurrentRoom(): ChatRoom {
		return this._currentRoom;
	}

	findRoomByName(name: string): ChatRoom {
		return this._roomsList.find((rm: ChatRoom) => rm.getName() == name);
	}

	findRoomByID(id: string): ChatRoom {
		return this._roomsList.find((rm: ChatRoom) => rm.getRoomID() == id);
	}

	updateRoomsList(rooms: Array<any>): void {
		this._roomsList = rooms;
		this.updateRoomsListSubscribers();
	}

	updateRoomsListSubscribers(): void {
		this._roomsListSubscribers.forEach((sub: Observer<Array<ChatRoom>>) => {
			sub.next(this._roomsList);
		});
	}

	updateCurrentRoom(providedID?: string) {
		let roomID = providedID ? providedID : '';
		let roomInstance = this.findRoomByID(roomID);
		if (roomInstance) {
			this._currentRoom = roomInstance;
			this.updateCurrentRoomSubscribers();
		} else {
			console.log('whoops, that room does not seem to exist...');
		}
	}

	leaveCurrentRoom(user: User): void {
		if (this._currentRoom) {
			console.log('LEAVE ROOM', this._currentRoom);
			this._socket.emit('leave', { user: user.getId(), room: this._currentRoom.getRoomID() });
			this._currentRoom = undefined;
			this.updateCurrentRoomSubscribers();
		}
	}

	updateCurrentRoomSubscribers(): void {
		this._currentRoomSubscribers.forEach((obs: Observer<ChatRoom>) => {
			obs.next(this._currentRoom);
		});
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

	_getRoomsList(): Array<ChatRoom> {
		if (isDevMode()) return this._roomsList;
		else {
			console.log('Sorry _getRoomsList() is only available in dev mode');
			return undefined;
		}
	}

	_setRoomsList(rooms: Array<ChatRoom>) {
		if (isDevMode()) this._roomsList = rooms;
		else {
			console.log('Sorry _setRoomsList() is only available in dev mode');
			return undefined;
		}
	}

	_getRoomsListSubscribers(): Array<Observer<Array<ChatRoom>>> {
		if (isDevMode()) return this._roomsListSubscribers;
		else {
			console.log('Sorry _getRoomsListSubscribers() is only available in dev mode');
			return undefined;
		}
	}

	_setCurrentRoom(room: ChatRoom) {
		if (isDevMode()) this._currentRoom = room;
		else {
			console.log('Sorry _setCurrentRoom() is only available in dev mode');
			return undefined;
		}
	}

	_getCurrentRoom(): ChatRoom {
		if (isDevMode()) return this._currentRoom;
		else {
			console.log('Sorry _getCurrentRoom() is only available in dev mode');
			return undefined;
		}
	}

	_getCurrentRoomSubscribers(): Array<Observer<ChatRoom>> {
		if (isDevMode()) return this._currentRoomSubscribers;
		else {
			console.log('Sorry _getCurrentRoomSubscribers() is only available in dev mode');
			return undefined;
		}
	}
}
