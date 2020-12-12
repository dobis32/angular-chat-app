import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, DebugElement } from '@angular/core';
import { ModalComponent } from './modal.component';
import { StateService } from '../../services/state.service';
import { By } from '@angular/platform-browser';

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

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ ModalComponent, TestHostComponent ]
		}).compileComponents();
	});

	beforeEach(() => {
		hostFixture = TestBed.createComponent(TestHostComponent);
		hostComponent = hostFixture.componentInstance;
		hostFixture.detectChanges();
		modalDebugElement = hostFixture.debugElement.query(By.directive(ModalComponent));
		modalComponent = modalDebugElement.componentInstance;
	});

	it('should create', () => {
		expect(hostComponent).toBeTruthy();
		expect(modalComponent).toBeTruthy();
	});
});
