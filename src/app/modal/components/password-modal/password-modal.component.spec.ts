import { Component, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { PasswordModalComponent } from './password-modal.component';
import { By } from '@angular/platform-browser';

@Component({
	selector: `host-component`,
	template: `<app-password-modal [cb]="cb" (submit)="handleSubmit()"></app-password-modal>`
})
class TestHostComponent {
	public roomName = 'test_room';
	public cb = () => {};
	constructor() {}

	handleSubmit() {}
}

describe('PasswordModalComponent', () => {
	let hostComponent: TestHostComponent;
	let hostFixture: ComponentFixture<TestHostComponent>;
	let modalDebugElement: DebugElement;
	let passwordModalComponent: PasswordModalComponent;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [ ReactiveFormsModule ],
			declarations: [ PasswordModalComponent, TestHostComponent ],
			providers: [ FormBuilder ]
		}).compileComponents();

		hostFixture = TestBed.createComponent(TestHostComponent);
		hostComponent = hostFixture.componentInstance;
		hostFixture.detectChanges();
		modalDebugElement = hostFixture.debugElement.query(By.directive(PasswordModalComponent));
		passwordModalComponent = modalDebugElement.componentInstance;
	});

	// DOM-Related
	it("should have a function for submitting the user's input from the password form", () => {
		expect(typeof passwordModalComponent.submitPassword).toEqual('function');
	});

	it('should change the submitting component/class variable to true when submitting input', () => {
		passwordModalComponent.submitPassword(passwordModalComponent.passwordForm);

		expect(passwordModalComponent._getSubmittingBool()).toBeTrue();
	});

	it('should emit from the submit component/class EventEmitter when submitting input', () => {
		let submitSpy = spyOn(passwordModalComponent.submit, 'emit').and.callThrough();
		let handleSubmitSpy = spyOn(hostComponent, 'handleSubmit').and.callThrough();

		passwordModalComponent.submitPassword(passwordModalComponent.passwordForm);

		expect(submitSpy).toHaveBeenCalledWith(passwordModalComponent.passwordForm);
		expect(handleSubmitSpy).toHaveBeenCalled();
	});

	it('should have a function for stopping event propogation', () => {
		let e = new Event('click');
		let stopPropSpy = spyOn(e, 'stopPropagation').and.callThrough();

		passwordModalComponent.stopPropagation(e);

		expect(typeof passwordModalComponent.stopPropagation).toEqual('function');
		expect(stopPropSpy).toHaveBeenCalled();
	});

	// Init
	it('should create', () => {
		expect(passwordModalComponent).toBeTruthy();
	});

	it('should receive the modal callback fucntion from the parent/host component', () => {
		expect(passwordModalComponent.cb).toEqual(hostComponent.cb);
	});

	it('should have a "submit" event emitter', () => {
		expect(typeof passwordModalComponent.submit.emit).toEqual('function');
	});

	it('should have a password form', () => {
		expect(passwordModalComponent.passwordForm).toBeDefined();
		expect(passwordModalComponent.passwordForm.value).toBeDefined();
		expect(passwordModalComponent.passwordForm.valid).toBeDefined();
	});

	it('should have a boolean class/component variable for determining if the modal is submitting or just closing', () => {
		expect(passwordModalComponent._getSubmittingBool()).toBeDefined();
	});

	// Lifecycle
	it('should set the password value of the corresponding form when the component is destroyed and the form is not being submitted', () => {
		passwordModalComponent._setSubmittingBool(false);
		passwordModalComponent.passwordForm.setValue({ password: 'some_password' });
		let setValueSpy = spyOn(passwordModalComponent.passwordForm, 'setValue').and.callThrough();

		passwordModalComponent.ngOnDestroy();

		expect(setValueSpy).toHaveBeenCalled();
	});

	it('should call the modal callback function with the password value of the corresponding form when the component is destroyed', () => {
		let cbSpy = spyOn(passwordModalComponent, 'cb').and.callThrough();

		passwordModalComponent.ngOnDestroy();

		expect(cbSpy).toHaveBeenCalled();
	});
});
