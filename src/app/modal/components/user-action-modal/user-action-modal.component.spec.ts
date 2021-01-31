import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, DebugElement } from '@angular/core';
import { UserActionModalComponent } from './user-action-modal.component';
import { StateService } from 'src/app/services/state/state.service';
import { By } from '@angular/platform-browser';
import { User } from 'src/app/util/user';

@Component({
	selector: `host-component`,
	template: `<app-user-action-modal [cb]="cb" [user]="buffer"></app-user-action-modal>`
})
class TestHostComponent {
	public buffer = new User('denny', 'id');
	public cb = (action: string) => {
		return 'action';
	};
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

	it('should have a function for stopping event propogation', () => {
		let e = new Event('click');
		let stopPropSpy = spyOn(e, 'stopPropagation').and.callThrough();

		userActionModalComponent.stopPropagation(e);

		expect(typeof userActionModalComponent.stopPropagation).toEqual('function');
		expect(stopPropSpy).toHaveBeenCalled();
	});

	it('should have a functon for submitting an action to the parent component', () => {
		const cbSpy = spyOn(userActionModalComponent, 'cb').and.callThrough();
		const emitSpy = spyOn(userActionModalComponent.close, 'emit').and.callThrough();
		const action: string = 'action';

		userActionModalComponent.submit(action);

		expect(typeof userActionModalComponent.submit).toEqual('function');
		expect(cbSpy).toHaveBeenCalled();
		expect(emitSpy).toHaveBeenCalled();
	});

	it('should get data about the user receiving the action from the parent component', () => {
		const user = userActionModalComponent.user;
		const parentBuffer = hostComponent.buffer;
		expect(user).toEqual(parentBuffer);
	});
});
