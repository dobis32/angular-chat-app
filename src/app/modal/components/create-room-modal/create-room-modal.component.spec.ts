import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, DebugElement } from '@angular/core';
import { CreateRoomModalComponent } from './create-room-modal.component';
import { By } from '@angular/platform-browser';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';

@Component({
	selector: `host-component`,
	template: `<app-create-room-modal [cb]="cb" (submit)="handleSubmit()"></app-create-room-modal>`
})
class TestHostComponent {
	public roomName = 'test_room';
	public cb = () => {};
	constructor() {}

	handleSubmit() {}
}

describe('CreateRoomModalComponent', () => {
	let hostComponent: TestHostComponent;
	let hostFixture: ComponentFixture<TestHostComponent>;
	let modalDebugElement: DebugElement;
	let createRoomModalComponent: CreateRoomModalComponent;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [ ReactiveFormsModule ],
			declarations: [ CreateRoomModalComponent, TestHostComponent ],
			providers: [ FormBuilder ]
		}).compileComponents();
	});

	beforeEach(() => {
		hostFixture = TestBed.createComponent(TestHostComponent);
		hostComponent = hostFixture.componentInstance;
		hostFixture.detectChanges();
		modalDebugElement = hostFixture.debugElement.query(By.directive(CreateRoomModalComponent));
		createRoomModalComponent = modalDebugElement.componentInstance;
	});

	it('should create', () => {
		expect(createRoomModalComponent).toBeTruthy();
		expect(hostComponent).toBeTruthy();
	});

	// DOM-Related
	it('should have a function that sets the submitting bool to true and emit the form via submit EventEmitter', () => {
		const emitSpy = spyOn(createRoomModalComponent.submit, 'emit').and.callFake(() => {});

		createRoomModalComponent._setSubmittingBoolean(false);
		createRoomModalComponent.form.setValue({ name: 'name', capacity: 6, password: 'pw' });

		createRoomModalComponent.submitForm(createRoomModalComponent.form);

		expect(typeof createRoomModalComponent.submitForm).toEqual('function');
		expect(createRoomModalComponent._getSubmittingBoolean()).toBeTrue();
		expect(emitSpy).toHaveBeenCalledWith(createRoomModalComponent.form);
	});

	it('should have a function for stopping event propogation', () => {
		let e = new Event('click');
		let stopPropSpy = spyOn(e, 'stopPropagation').and.callThrough();

		createRoomModalComponent.stopPropagation(e);

		expect(typeof createRoomModalComponent.stopPropagation).toEqual('function');
		expect(stopPropSpy).toHaveBeenCalled();
	});

	// Lifecycle
	it('should get the form inputs and call the callback function on destroy', () => {
		const getInputsSpy = spyOn(createRoomModalComponent, 'getFormInputs').and.callThrough();
		const cbSpy = spyOn(createRoomModalComponent, 'cb').and.callThrough();

		createRoomModalComponent.ngOnDestroy();

		expect(getInputsSpy).toHaveBeenCalled();
		expect(cbSpy).toHaveBeenCalled();
	});

	// Other
	it('should have a function to get the form inputs', () => {
		const formValues = { name: 'name', capacity: 6, password: 'pw' };
		createRoomModalComponent._setSubmittingBoolean(true);
		createRoomModalComponent.form.setValue(formValues);

		const values = createRoomModalComponent.getFormInputs();

		expect(typeof createRoomModalComponent.getFormInputs).toEqual('function');
		expect(values).toEqual(formValues);
	});

	it('should return junk/falsy data as form values when submitting bool is false', () => {
		const junkData = { name: '', capacity: 0, password: '' };

		createRoomModalComponent._setSubmittingBoolean(false);

		const returnedValues = createRoomModalComponent.getFormInputs();

		expect(returnedValues).toEqual(junkData);
	});
});
