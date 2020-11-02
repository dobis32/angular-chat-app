import { TestBed } from '@angular/core/testing';

import { StateService } from './state.service';
import { MockSocketService } from '../util/testing/MockSocketService';
import { SocketService } from './socket.service';
import { Socket } from '../util/socket.interface';
import { ChatMessage } from '../util/chatMessage';
import { Subscription } from 'rxjs';

describe('StateService', () => {
	let service: StateService;

	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [ { provide: SocketService, useClass: MockSocketService } ]
		});
		service = TestBed.inject(StateService);
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});

	it('shouuld have the SocketService injected into it', () => {
		expect(service._getSocketService()).toBeTruthy();
	});

	it('should have an array for socket subscriptions', () => {
		expect(Array.isArray(service._getSocketSubscriptions()));
	});

	it('should have an array for chat log subscribers/observers', () => {
		expect(Array.isArray(service._getChatLogSubscribers()));
	});

	it('should have an array for current user subscribers/observers', () => {
		expect(Array.isArray(service._getCurrentUserSubscribers()));
	});

	it('should have an array for current user subscribers/observers', () => {
		expect(Array.isArray(service._getLoggedInStatusSubscribers()));
	});

	it('should have a chat log', () => {
		expect(Array.isArray(service._getChatLog()));
	});

	it('should have a function');

	it('should have the data for the current user', () => {
		expect(typeof service._getCurrentUser()).toEqual('string');
	});

	it('should listen to the "init" event from the SocketService', () => {
		let listenSpy = spyOn(service._getSocketService(), 'listen').and.callThrough();

		service.resetSocketSubs();

		expect(listenSpy).toHaveBeenCalledWith('init');
	});

	it('should listen to the "incomingMessage" event from the SocketService', () => {
		let listenSpy = spyOn(service._getSocketService(), 'listen').and.callThrough();

		service.resetSocketSubs();

		expect(listenSpy).toHaveBeenCalledWith('incomingMessage');
	});

	it('should listen to the "messageReceived" event from the SocketService', () => {
		let listenSpy = spyOn(service._getSocketService(), 'listen').and.callThrough();

		service.resetSocketSubs();

		expect(listenSpy).toHaveBeenCalledWith('messageReceived');
	});

	it('should add ChatMessages received from the "incomingMessage" socket event to the ChatLog', () => {
		let initMessageCount = service._getChatLog().length;
		let socket: Socket = service._getSocketService();

		socket.trigger('incomingMessage', new ChatMessage('Test', new Date(), 'Hello there'));

		expect(service._getChatLog().length).toBeGreaterThan(initMessageCount);
	});

	it('should add ChatMessages received from the "messageReceived" socket event to the ChatLog', () => {
		let initMessageCount = service._getChatLog().length;
		let socket: Socket = service._getSocketService();

		socket.trigger('messageReceived', new ChatMessage('Test', new Date(), 'Hello there'));

		expect(service._getChatLog().length).toBeGreaterThan(initMessageCount);
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

	it('should have a public method/function for exposing an Observable of the ChatLog', () => {
		let obs = service.chatLog();

		expect(typeof service.chatLog).toEqual('function');
		expect(typeof obs.subscribe).toEqual('function');
	});

	it('should have a public method/function for exposing an Observable of the CurrentUser', () => {
		let obs = service.currentUser();

		expect(typeof service.currentUser).toEqual('function');
		expect(typeof obs.subscribe).toEqual('function');
	});

	it('should have a public method/function for emitting ChatMessage data to the SocketService', async () => {
		let emitSpy = spyOn(service._getSocketService(), 'emit').and.callThrough();
		let d = new Date();
		let message = new ChatMessage('foo', d, 'some text');

		await service.sendMessage(message);

		expect(typeof service.sendMessage).toEqual('function');
		expect(emitSpy).toHaveBeenCalled();
		expect(emitSpy).toHaveBeenCalledWith('message', message.toJSON());
	});
});
