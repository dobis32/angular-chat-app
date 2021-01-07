import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { Component, DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { EditRoomModalComponent } from './edit-room-modal.component';

@Component({
	selector: `host-component`,
	template: `<app-edit-room-modal [cb]="cb" (submit)="submitForm()"></app-edit-room-modal>`
})
class TestHostComponent {
	public roomName = 'test_room';
	public cb = () => {};
	constructor() {}

	handleSubmit() {}
}

describe('EditRoomModalComponent', () => {
	let hostComponent: TestHostComponent;
	let hostFixture: ComponentFixture<TestHostComponent>;
	let modalDebugElement: DebugElement;
	let editRoomModalComponent: EditRoomModalComponent;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [ ReactiveFormsModule ],
			declarations: [ EditRoomModalComponent, TestHostComponent ],
			providers: [ FormBuilder ]
		}).compileComponents();
	});

	beforeEach(() => {
		hostFixture = TestBed.createComponent(TestHostComponent);
		hostComponent = hostFixture.componentInstance;
		hostFixture.detectChanges();
		modalDebugElement = hostFixture.debugElement.query(By.directive(EditRoomModalComponent));
		editRoomModalComponent = modalDebugElement.componentInstance;
	});

	it('should create', () => {
		expect(EditRoomModalComponent).toBeTruthy();
		expect(hostComponent).toBeTruthy();
	});

	// DOM-Related
	it('should have a function that sets the submitting boolean to true and emits the form through the submit EventEmitter', () => {
		editRoomModalComponent._setSubmittingBoolean(false);

		const emitSpy = spyOn(editRoomModalComponent.submit, 'emit').and.callFake(() => {});

		editRoomModalComponent.submitForm(editRoomModalComponent.form);

		expect(typeof editRoomModalComponent.submitForm).toEqual('function');
		expect(emitSpy).toHaveBeenCalled();
		expect(editRoomModalComponent._getSubmittingBoolean()).toBeTrue();
	});

	it('should have a function for stopping event propogation', () => {
		let e = new Event('click');
		let stopPropSpy = spyOn(e, 'stopPropagation').and.callThrough();

		editRoomModalComponent.stopPropagation(e);

		expect(typeof editRoomModalComponent.stopPropagation).toEqual('function');
		expect(stopPropSpy).toHaveBeenCalled();
	});

	// Lifecycle
	it('should get the form inputs and call the callback function on destroy', () => {
		const getInputsSpy = spyOn(editRoomModalComponent, 'getFormInputs').and.callThrough();
		const cbSpy = spyOn(editRoomModalComponent, 'cb').and.callThrough();

		editRoomModalComponent.ngOnDestroy();

		expect(getInputsSpy).toHaveBeenCalled();
		expect(cbSpy).toHaveBeenCalled();
	});

	// Other
	it('should have a function for getting form inputs', () => {
		const mockValues = { name: 'name', capacity: 6, password: 'pw' };
		editRoomModalComponent._setSubmittingBoolean(true);
		editRoomModalComponent.form.setValue(mockValues);

		expect(typeof editRoomModalComponent.getFormInputs).toEqual('function');
	});

	it('should have a function that returns junk/falsy form values when the submitting boolean is false', () => {
		const junkValues = { name: '', capacity: 0, password: '' };

		editRoomModalComponent._setSubmittingBoolean(false);

		const inputs = editRoomModalComponent.getFormInputs();

		expect(editRoomModalComponent._getSubmittingBoolean()).toBeFalse();
		expect(inputs).toEqual(junkValues);
	});
});
