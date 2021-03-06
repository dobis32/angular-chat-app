import { ModalStateModule } from './modal';
import { ChatRoom } from 'src/app/util/chatRoom';
import { User } from 'src/app/util/user';

describe('ModalStateModule', () => {
	let modalStateModule: ModalStateModule;
	beforeEach(() => {
		modalStateModule = new ModalStateModule();
	});

	it('should be created', () => {
		expect(modalStateModule).toBeTruthy();
	});

	it('should have a function that returns an observable of the active modal name', () => {
		let obs = modalStateModule.activeModalName();

		expect(typeof modalStateModule.activeModalName).toEqual('function');
		expect(typeof obs.subscribe).toEqual('function');
	});

	it('should have a function that returns an observable of the active modal callback function', () => {
		let obs = modalStateModule.modalCB();

		expect(typeof modalStateModule.modalCB).toEqual('function');
		expect(typeof obs.subscribe).toEqual('function');
	});

	it('should have a function that returns an observable of the active-status of the app modal', () => {
		let obs = modalStateModule.modalActiveStatus();

		expect(typeof modalStateModule.modalActiveStatus).toEqual('function');
		expect(typeof obs.subscribe).toEqual('function');
	});

	it('should have a function that returns the modal buffer Freshy', () => {
		let dataBufferFreshy = modalStateModule.getBuffer();

		expect(typeof modalStateModule.getBuffer).toEqual('function');
		expect(typeof dataBufferFreshy.getData).toEqual('function');
		expect(typeof dataBufferFreshy.refresh).toEqual('function');
	});

	it('should have a function to open the app modal and set the modal-active status and callback function', () => {
		let modalName = 'test';
		let cb = () => {
			return true;
		};
		let bufferData = { foo: 123 };
		let refreshModalCBSpy = spyOn(modalStateModule._getModalCBFreshy(), 'refresh').and.callThrough();
		let refreshActiveModalNameSpy = spyOn(
			modalStateModule._getActiveModalNameFreshy(),
			'refresh'
		).and.callThrough();
		let refreshModalActiveStatusSubsSpy = spyOn(
			modalStateModule._getModalActiveStatusFreshy(),
			'refresh'
		).and.callThrough();
		let refreshModalBufferSubsSpy = spyOn(modalStateModule._getModalBufferFreshy(), 'refresh');

		modalStateModule.openModal(modalName, cb, bufferData);

		expect(typeof modalStateModule.openModal).toEqual('function');
		expect(refreshActiveModalNameSpy).toHaveBeenCalledWith(modalName);
		expect(refreshModalCBSpy).toHaveBeenCalledWith(cb);
		expect(refreshModalActiveStatusSubsSpy).toHaveBeenCalledWith(true);
		expect(refreshModalBufferSubsSpy).toHaveBeenCalledWith(bufferData);
	});

	it('should have a function to close the app modal', () => {
		let initStatus = true;
		let refreshModalCBSpy = spyOn(modalStateModule._getModalCBFreshy(), 'refresh').and.callThrough();
		let refreshActiveModalNameSpy = spyOn(
			modalStateModule._getActiveModalNameFreshy(),
			'refresh'
		).and.callThrough();
		let refreshModalActiveStatusSubsSpy = spyOn(
			modalStateModule._getModalActiveStatusFreshy(),
			'refresh'
		).and.callThrough();
		let refreshModalBufferSubsSpy = spyOn(modalStateModule._getModalBufferFreshy(), 'refresh').and.callThrough();

		modalStateModule._setModalActiveStatus(initStatus);
		modalStateModule.closeModal();

		expect(typeof modalStateModule.closeModal).toEqual('function');
		expect(modalStateModule._getModalActiveStatus()).toBeFalse();
		expect(refreshModalCBSpy).toHaveBeenCalled();
		expect(refreshActiveModalNameSpy).toHaveBeenCalled();
		expect(refreshModalActiveStatusSubsSpy).toHaveBeenCalled();
		expect(refreshModalBufferSubsSpy).toHaveBeenCalled();
	});

	it('should have the current modal callback function', () => {
		let cb = () => {};

		modalStateModule._setModalCB(cb);

		expect(modalStateModule._getModalCB()).toEqual(cb);
	});

	it('should have the current active-modal name', () => {
		let modalName = 'test';

		modalStateModule._setActiveModalName(modalName);

		expect(modalStateModule._getActiveModalName()).toEqual(modalName);
	});

	it('should have a function that uses the app modal to prompt the user for a room password', () => {
		let modalSpy = spyOn(modalStateModule, 'openModal').and.callThrough();

		modalStateModule.promptRoomPassword();
		modalStateModule.closeModal();

		expect(typeof modalStateModule.promptRoomPassword).toEqual('function');
		expect(modalSpy).toHaveBeenCalled();
	});

	it('should have a function that uses the modal to edit a room', () => {
		let modalSpy = spyOn(modalStateModule, 'openModal').and.callThrough();

		modalStateModule.editRoom(new ChatRoom('id', 'name', 6, 'ownerID'));
		modalStateModule.closeModal();

		expect(typeof modalStateModule.editRoom).toEqual('function');
		expect(modalSpy).toHaveBeenCalled();
	});

	it('should have a function that uses the modal to create a room', () => {
		let modalSpy = spyOn(modalStateModule, 'openModal').and.callThrough();

		modalStateModule.createRoom();
		modalStateModule.closeModal();

		expect(typeof modalStateModule.createRoom).toEqual('function');
		expect(modalSpy).toHaveBeenCalled();
	});

	it('should have a function to prompt a the user for an action to perform', () => {
		const user = new User('name', 'id');
		let openSpy = spyOn(modalStateModule, 'openModal').and.callThrough();

		modalStateModule.performUserAction(user);

		expect(typeof modalStateModule.performUserAction).toEqual('function');
		expect(openSpy).toHaveBeenCalled();

		modalStateModule.closeModal();
	});
});
