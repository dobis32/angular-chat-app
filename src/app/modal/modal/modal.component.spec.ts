import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, DebugElement } from '@angular/core';
import { ModalComponent } from './modal.component';
import { StateService } from '../../services/state/state.service';
import { By } from '@angular/platform-browser';
import { ChatRoom } from 'src/app/util/chatRoom';
import { Observable, Observer } from 'rxjs';
@Component({
	selector: `host-component`,
	template: `<app-modal [state]="getState()"></app-modal>`
})
class TestHostComponent {
	constructor(private state: StateService) {}

	getState() {
		return this.state;
	}
}

describe('ModalComponent', () => {
	let hostComponent: TestHostComponent;
	let hostFixture: ComponentFixture<TestHostComponent>;
	let modalDebugElement: DebugElement;
	let modalComponent: ModalComponent;
	let modal = 'modal';
	let cb = () => {};
	let mockModalObservable = new Observable<any>((sub: Observer<any>) => {
		sub.next({ modal, cb });
	});
	let modalCBSubSpy: jasmine.Spy;
	let activeNameSubSpy: jasmine.Spy;
	let currentRoomSpy: jasmine.Spy;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ ModalComponent, TestHostComponent ]
		}).compileComponents();

		hostFixture = TestBed.createComponent(TestHostComponent);
		hostComponent = hostFixture.componentInstance;
		hostFixture.detectChanges();
		modalDebugElement = hostFixture.debugElement.query(By.directive(ModalComponent));
		modalComponent = modalDebugElement.componentInstance;

		modalComponent.ngOnDestroy();
		modalCBSubSpy = spyOn(modalComponent.state.modal, 'modalCB').and.callThrough();
		activeNameSubSpy = spyOn(modalComponent.state.modal, 'activeModalName').and.callThrough();
		currentRoomSpy = spyOn(modalComponent.state.room, 'currentRoom').and.callThrough();
		modalComponent.ngOnInit();
	});

	// DOM-Related
	it('should have a function that closes the modal', () => {
		expect(typeof modalComponent.closeModal).toEqual('function');
	});

	// Init
	it('should create', () => {
		expect(hostComponent).toBeTruthy();
		expect(modalComponent).toBeTruthy();
	});

	it('should receive the state service from the parent/host component', () => {
		expect(modalComponent.state).toEqual(hostComponent.getState());
	});

	it('should have the active-modal name as a string class/component variable', () => {
		expect(typeof modalComponent.activeModalName).toEqual('string');
	});

	it('should have the current room as a class/component variable', () => {
		modalComponent._setCurrentRoom(new ChatRoom('id', 'name', 6, 'ownerID'));
		expect(modalComponent.currentRoom).toBeDefined();
		expect(typeof modalComponent.currentRoom.getRoomID).toEqual('function');
	});

	it('should have the modal callback function as a function class/component variable', () => {
		expect(typeof modalComponent.modalCB).toEqual('function');
	});

	it('should have a subscription of the current/active-room', () => {
		expect(typeof modalComponent._getCurrRoomSub().unsubscribe).toEqual('function');
	});

	// Lifecycle
	it('should subscribe to the current/active-room of the StateService', () => {
		modalComponent.ngOnInit();

		expect(currentRoomSpy).toHaveBeenCalled();
	});

	it('should subscribe to the modal callback function of the StateService', () => {
		expect(modalCBSubSpy).toHaveBeenCalled();
	});

	it('should subscribe to the active modal name of the StateService', () => {
		expect(activeNameSubSpy).toHaveBeenCalled();
	});

	it('should unsubscribe from the current/active-room subscription when the component is destoryed', () => {
		let currRoomUnsubSpy = spyOn(modalComponent._getCurrRoomSub(), 'unsubscribe').and.callThrough();

		modalComponent.ngOnDestroy();

		expect(currRoomUnsubSpy).toHaveBeenCalled();
	});

	it('should unsubscribe from the active modal name subscription when the component is destoryed', () => {
		let modalUnsubSpy = spyOn(modalComponent._getActiveNameSub(), 'unsubscribe').and.callThrough();

		modalComponent.ngOnDestroy();

		expect(modalUnsubSpy).toHaveBeenCalled();
	});

	it('should unsubscribe from the modal callback subscription when the component is destoryed', () => {
		let modalUnsubSpy = spyOn(modalComponent._getModalCBSub(), 'unsubscribe').and.callThrough();

		modalComponent.ngOnDestroy();

		expect(modalUnsubSpy).toHaveBeenCalled();
	});
});
