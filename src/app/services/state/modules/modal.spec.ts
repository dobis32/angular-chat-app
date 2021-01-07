import { ModalStateModule } from './modal';
import { ChatRoom } from 'src/app/util/chatRoom';

describe('ModalStateModule', () => {
	let modalStateModule: ModalStateModule;
	beforeEach(() => {
		modalStateModule = new ModalStateModule();
	});

	it('should be created', () => {
		expect(modalStateModule).toBeTruthy();
	});

	it('should have a function that returns an observable of the active modal name and callback function', () => {
		let obs = modalStateModule.state();

		expect(typeof modalStateModule.state).toEqual('function');
		expect(typeof obs.subscribe).toEqual('function');
	});

	it('should have a function that returns an observable of the active-status of the app modal', () => {
		let obs = modalStateModule.modalActiveStatus();

		expect(typeof modalStateModule.modalActiveStatus).toEqual('function');
		expect(typeof obs.subscribe).toEqual('function');
	});

	it('should have a function to open the app modal and set the modal-active status and callback function', () => {
		let modalName = 'test';
		let cb = () => {
			return true;
		};
		let refreshModalSubsSpy = spyOn(modalStateModule, 'refreshModalSubscriber').and.callThrough();
		let refreshModalActiveStatusSubsSpy = spyOn(
			modalStateModule,
			'refreshModalActiveStatusSubscriber'
		).and.callThrough();

		modalStateModule._setModalActiveStatus(false);
		modalStateModule._setModalCB(undefined);
		modalStateModule._setActiveModalName(undefined);

		modalStateModule.openModal(modalName, cb);

		expect(typeof modalStateModule.openModal).toEqual('function');
		expect(refreshModalSubsSpy).toHaveBeenCalled();
		expect(refreshModalActiveStatusSubsSpy).toHaveBeenCalled();
		expect(modalStateModule._getModalActiveStatus()).toBeTrue();
		expect(modalStateModule._getActiveModalName()).toEqual(modalName);
		expect(modalStateModule._getModalCB()).toEqual(cb);
	});

	it('should have a function to close the app modal', () => {
		let initStatus = true;
		let refreshModalSubsSpy = spyOn(modalStateModule, 'refreshModalSubscriber').and.callThrough();
		let refreshModalActiveStatusSubsSpy = spyOn(
			modalStateModule,
			'refreshModalActiveStatusSubscriber'
		).and.callThrough();

		modalStateModule._setModalActiveStatus(initStatus);
		modalStateModule.closeModal();

		expect(typeof modalStateModule.closeModal).toEqual('function');
		expect(modalStateModule._getModalActiveStatus()).toBeFalse();
		expect(refreshModalSubsSpy).toHaveBeenCalled();
		expect(refreshModalActiveStatusSubsSpy).toHaveBeenCalled();
	});

	it('should have a function to refresh the observer of the modal active status', () => {
		let sub = modalStateModule.modalActiveStatus().subscribe();
		let activeStatusObserver = modalStateModule._getModalActiveStatusSubscriber();
		let observerSpy = spyOn(activeStatusObserver, 'next').and.callThrough();

		modalStateModule.refreshModalActiveStatusSubscriber();

		expect(typeof modalStateModule.refreshModalActiveStatusSubscriber).toEqual('function');
		expect(observerSpy).toHaveBeenCalled();

		sub.unsubscribe();
	});

	it('should have a function to refresh the observer of the modal', () => {
		let sub = modalStateModule.state().subscribe();
		let modalObserver = modalStateModule._getModalSubscriber();
		let observerSpy = spyOn(modalObserver, 'next').and.callThrough();

		modalStateModule.refreshModalSubscriber();

		expect(typeof modalStateModule.refreshModalSubscriber).toEqual('function');
		expect(observerSpy).toHaveBeenCalled();

		sub.unsubscribe();
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
});
