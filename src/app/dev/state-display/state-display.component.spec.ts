import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, DebugElement } from '@angular/core';
import { StateDisplayComponent } from './state-display.component';
import { StateService } from '../../services/state/state.service';
import { By } from '@angular/platform-browser';

@Component({
	selector: `host-component`,
	template: `<app-state-display [state]="getState()"></app-state-display>`
})
class TestHostComponent {
	constructor(private state: StateService) {}

	getState() {
		return this.state;
	}
}

describe('StateDisplayComponent', () => {
	// let component: StateDisplayComponent;
	// let fixture: ComponentFixture<StateDisplayComponent>;

	let hostComponent: TestHostComponent;
	let hostFixture: ComponentFixture<TestHostComponent>;
	let stateDisplayDebugElement: DebugElement;
	let stateDisplayComponent: StateDisplayComponent;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ StateDisplayComponent, TestHostComponent ]
		}).compileComponents();
	});

	beforeEach(() => {
		hostFixture = TestBed.createComponent(TestHostComponent);
		hostComponent = hostFixture.componentInstance;
		hostFixture.detectChanges();
		stateDisplayDebugElement = hostFixture.debugElement.query(By.directive(StateDisplayComponent));
		stateDisplayComponent = stateDisplayDebugElement.componentInstance;
	});

	it('should create', () => {
		expect(stateDisplayComponent).toBeTruthy();
		expect(hostComponent).toBeTruthy();
	});
});
