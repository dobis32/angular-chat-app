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

});
