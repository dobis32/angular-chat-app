import { Component, OnInit, Input, isDevMode, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { StateService } from '../services/state.service';
import { ChatRoom } from '../util/chatRoom';
@Component({
  selector: 'app-chat-rooms',
  templateUrl: './chat-rooms.component.html',
  styleUrls: ['./chat-rooms.component.scss']
})
export class ChatRoomsComponent implements OnInit, OnDestroy{
  @Input() state: StateService;
  private _roomsList: Array<any>;
  private _roomsListSubscription: Subscription;

  constructor() {
    this._roomsList = new Array();
   }

  ngOnInit(): void {
    this._roomsListSubscription = this.state.roomsList().subscribe((roomsList: Array<any>) => {
      this._roomsList = roomsList
    });
  }

  ngOnDestroy(): void {
    if(this._roomsListSubscription) {
      this._roomsListSubscription.unsubscribe();
      this._roomsListSubscription = undefined;
    } 

  }

  getRoomsList(): Array<any> {
    return this._roomsList;
  }

  async joinRoom(room: ChatRoom) {
    try {
      if(room.getCapacity() == room.getUsers().length) throw new Error()
      if(room.getPassword().length) {
        alert('implement modal to enter password');
      }
      let result = await this.state.joinRoom(room.getID());
      if(!result) throw new Error()
    } catch(error) {
      console.log(error);
      alert('Failed to join room. Room is either at capacity or something else went wrong on the server-side.')
    }
  }

  _getRoomsList(): Array<any> {
    if(isDevMode()) return this._roomsList;
    else {
      console.log('Sorry _getRoomsList() is only available in dev mode');
      return undefined;
    }
  }

  _getRoomslistSubscription(): Subscription {
    if(isDevMode()) return this._roomsListSubscription;
    else {
      console.log('Sorry _getRoomslistSubscription() is only available in dev mode');
      return undefined;
    }  }
  
}
