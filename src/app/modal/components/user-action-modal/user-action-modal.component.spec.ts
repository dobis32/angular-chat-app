import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, DebugElement } from '@angular/core';
import { UserActionModalComponent } from './user-action-modal.component';
import { StateService } from 'src/app/services/state/state.service';
import { By } from '@angular/platform-browser';

@Component({
	selector: `host-component`,
	template: `<app-user-action-modal [cb]="cb" [state]="getState()"></app-user-action-modal>`
})
class TestHostComponent {
	public cb = () => {};
	constructor(private state: StateService) {}

	handleSubmit() {}

	getState(): StateService {
		return this.state;
	}
}

describe('UserActionModalComponent', () => {
	let hostComponent: TestHostComponent;
	let hostFixture: ComponentFixture<TestHostComponent>;
	let userActionModalDebugElement: DebugElement;
	let userActionModalComponent: UserActionModalComponent;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ TestHostComponent, UserActionModalComponent ]
		}).compileComponents();
	});

	beforeEach(() => {
		hostFixture = TestBed.createComponent(TestHostComponent);
		hostComponent = hostFixture.componentInstance;
		hostFixture.detectChanges();
		userActionModalDebugElement = hostFixture.debugElement.query(By.directive(UserActionModalComponent));
		userActionModalComponent = userActionModalDebugElement.componentInstance;
	});

	it('should create', () => {
		expect(hostComponent).toBeTruthy();
		expect(userActionModalComponent).toBeTruthy();
	});

	it('should have a function that closes the modal', () => {
		const closeSpy = spyOn(userActionModalComponent.state.modal, 'closeModal').and.callFake(() => {});

		expect(typeof userActionModalComponent.closeModal).toEqual('function');
		expect(closeSpy).toHaveBeenCalled();
	});

	it('should have a function for stopping event propogation', () => {
		let e = new Event('click');
		let stopPropSpy = spyOn(e, 'stopPropagation').and.callThrough();

		userActionModalComponent.stopPropagation(e);

		expect(typeof userActionModalComponent.stopPropagation).toEqual('function');
		expect(stopPropSpy).toHaveBeenCalled();
	});
});
