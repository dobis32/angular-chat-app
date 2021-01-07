import { ChatLogStateModule } from './chatlog';
import { SocketService } from '../../socket.service';
import { ChatMessage } from '../../../util/chatMessage';
import { ChatRoom } from '../../../util/chatRoom';

describe('ChatLogStateModule', () => {
	let chatLogStateModule: ChatLogStateModule;
	let mockSocket: SocketService;
	beforeEach(() => {
		mockSocket = new SocketService();
		mockSocket._setURI('foobar');
		chatLogStateModule = new ChatLogStateModule(mockSocket);
	});

	it('should be created', () => {
		expect(chatLogStateModule).toBeTruthy();
	});

	it('should have a chat log', () => {
		expect(Array.isArray(chatLogStateModule._getChatLog()));
	});

	it('should have an array for chat log subscribers/observers', () => {
		expect(Array.isArray(chatLogStateModule._getChatLogSubscribers()));
	});

	it('should have a function that can determine whether or not the chat log is defined', () => {
		expect(typeof chatLogStateModule.chatLogIsDefined).toEqual('function');
		expect(chatLogStateModule.chatLogIsDefined()).toBeTrue();
	});

	it('should have a public method/function for exposing an Observable of the ChatLog', () => {
		let obs = chatLogStateModule.state();
		expect(typeof chatLogStateModule.state).toEqual('function');
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

		parsedMessages = chatLogStateModule.parseChatLog(chatMessageData);

		expect(Array.isArray(parsedMessages));
		expect(parsedMessages.length).toEqual(chatMessageData.length);
	});

	it('should have a function for updating all chat log subscribers', () => {
		let currentChatLog = chatLogStateModule._getChatLog();

		let subscription1 = chatLogStateModule.state().subscribe();
		let subscription2 = chatLogStateModule.state().subscribe();

		let obSpy1 = spyOn(chatLogStateModule._getChatLogSubscribers()[0], 'next').and.callThrough();
		let obSpy2 = spyOn(chatLogStateModule._getChatLogSubscribers()[1], 'next').and.callThrough();

		chatLogStateModule.updateChatLogSubscribers();

		expect(typeof chatLogStateModule.updateChatLogSubscribers).toEqual('function');
		expect(obSpy1).toHaveBeenCalledWith(currentChatLog);
		expect(obSpy2).toHaveBeenCalledWith(currentChatLog);

		subscription1.unsubscribe();
		subscription2.unsubscribe();
	});

	it('should have a public method/function for emitting ChatMessage data to the SocketService', () => {
		let emitSpy = spyOn(chatLogStateModule._getSocketService(), 'emit').and.callFake((event: string, data: any) => {
			return true;
		});
		let d = new Date();
		let uid = 'someID';
		let message = new ChatMessage('foo', uid, d, 'some text');
		let room = new ChatRoom('id', 'name', 6, uid);
		chatLogStateModule.sendMessage(message, room);

		expect(typeof chatLogStateModule.sendMessage).toEqual('function');
		expect(emitSpy).toHaveBeenCalled();
		expect(emitSpy).toHaveBeenCalledWith('message', { ...message.toJSON(), room: room.getRoomID() });
	});
});
