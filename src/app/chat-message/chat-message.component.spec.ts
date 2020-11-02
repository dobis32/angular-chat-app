import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';

import { ChatMessageComponent } from './chat-message.component';
import { ChatMessage } from '../util/chatMessage';

@Component({
	selector: `host-component`,
	template: `<app-chat-message [messageBuffer]="_getChatMessage()"></app-chat-message>`
})
class TestHostComponent {
	private _chatMessage: ChatMessage;
	constructor() {
		this._chatMessage = new ChatMessage('foo', new Date(), 'some text');
	}

	_getChatMessage() {
		return this._chatMessage;
	}
}

describe('ChatMessageComponent', () => {
	let hostComponent: TestHostComponent;
	let hostFixture: ComponentFixture<TestHostComponent>;
	let chatMessageDebugElement: DebugElement;
	let chatMessageComponent: ChatMessageComponent;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ TestHostComponent, ChatMessageComponent ]
		}).compileComponents();
	});

	beforeEach(async () => {
		hostFixture = TestBed.createComponent(TestHostComponent);
		hostComponent = hostFixture.componentInstance;
		hostFixture.detectChanges();
		await hostFixture.whenStable();
		chatMessageDebugElement = hostFixture.debugElement.query(By.directive(ChatMessageComponent));
		chatMessageComponent = chatMessageDebugElement.componentInstance;
	});

	it('should create', () => {
		expect(chatMessageComponent).toBeTruthy();
		expect(hostComponent).toBeTruthy();
	});

	it('should have a ChatMessage bound to the messageBuffer input from the host/parent component', () => {
		expect(chatMessageComponent.messageBuffer).toEqual(hostComponent._getChatMessage());
	});

	it('should have a function to get the user of the ChatMessage', () => {
		expect(typeof chatMessageComponent.userName).toEqual('function');
		expect(chatMessageComponent.userName()).toEqual(hostComponent._getChatMessage().getUser());
	});

	it('should have a function to get the text of the ChatMessage', () => {
		expect(typeof chatMessageComponent.text).toEqual('function');
		expect(chatMessageComponent.text()).toEqual(hostComponent._getChatMessage().getText());
	});
});