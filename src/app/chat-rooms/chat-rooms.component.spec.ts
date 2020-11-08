import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, DebugElement } from '@angular/core';
import { ChatRoomsComponent } from './chat-rooms.component';
import { StateService } from '../services/state.service';
import { By } from '@angular/platform-browser';
import { Subscriber, Observable } from 'rxjs';
import { ChatRoom } from '../util/chatRoom';

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
    })
    .compileComponents();
  });

  beforeEach(() => {
    hostFixture = TestBed.createComponent(TestHostComponent);
		hostComponent = hostFixture.componentInstance;
		hostFixture.detectChanges();
		ChatRoomsDebugElement = hostFixture.debugElement.query(By.directive(ChatRoomsComponent));
		chatRoomsComponent = ChatRoomsDebugElement.componentInstance;
  });

  it('should create', () => {
    expect(chatRoomsComponent).toBeTruthy();
    expect(hostComponent).toBeTruthy();
  });


  it('should have the state service injected into it from the parent/host component', () => {
    expect(chatRoomsComponent.state).toEqual(hostComponent.getState());
  })

  it('should have an array containing chat room data', () => {
    expect(Array.isArray(chatRoomsComponent._getRoomsList())).toBeTrue();
  });

  it('should subscribe to the rooms list of the state service on init', () => {
    let roomsListSubSpy = spyOn(chatRoomsComponent.state, 'roomsList').and.callFake(() => {
      return new Observable((sub: Subscriber<Array<any>>) => {
        sub.next([new ChatRoom('roomA', 6), new ChatRoom('roomB', 6)]);
      })
    })
    let sub = chatRoomsComponent._getRoomslistSubscription()
    if(sub) sub.unsubscribe();

    chatRoomsComponent.ngOnInit()

    expect(roomsListSubSpy).toHaveBeenCalled();
    expect(chatRoomsComponent._getRoomslistSubscription()).toBeTruthy();
  })

  it('should unsubscribe from the rooms list of the state service on destory', () => {
    let unsubSpy = spyOn(chatRoomsComponent._getRoomslistSubscription(), 'unsubscribe').and.callThrough();
    
    chatRoomsComponent.ngOnDestroy();

    expect(unsubSpy).toHaveBeenCalled();
    expect(chatRoomsComponent._getRoomslistSubscription()).toBeUndefined();
  });

  it('should have a function for joining chat rooms', () => {
    expect(typeof chatRoomsComponent.joinRoom).toEqual('function');
  });

  it('should have a function to join a room that checks the capacity of the room before emitting through the SocketService', () => {
    let roomName = 'testRoom';
    let room = new ChatRoom(roomName, 6);
    let capacitySpy = spyOn(room, 'getCapacity').and.callThrough();
    let usersSpy = spyOn(room, 'getUsers').and.callThrough();

    chatRoomsComponent.joinRoom(room);
    
    expect(capacitySpy).toHaveBeenCalled();
    expect(usersSpy).toHaveBeenCalled();
  });

  it('should have a function to join a room that prompts for a password before emitting through the SocketService', () => {
    let roomName = 'testRoom';
    let room = new ChatRoom(roomName, 6);
    let passwordSpy = spyOn(room, 'getPassword').and.callThrough();

    chatRoomsComponent.joinRoom(room);
    
    expect(passwordSpy).toHaveBeenCalled();
  });


  it('should have a function that calls the "joinRoom" function of the StateService', () => {
    let joinSpy = spyOn(chatRoomsComponent.state, 'joinRoom').and.callFake((roomName: string) => {
      return Promise.resolve(true);
    });
    let room = new ChatRoom('test', 6);

    chatRoomsComponent.joinRoom(room);

    expect(typeof chatRoomsComponent.joinRoom).toEqual('function');
    expect(joinSpy).toHaveBeenCalled();
  });

});
