import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChatLogComponent } from './chat-log.component';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Component, DebugElement } from '@angular/core';
import { StateService } from '../services/state.service';
import { By } from '@angular/platform-browser';

@Component({
	selector: `host-component`,
	template: `<app-chat-log [state]="getState()"></app-chat-log>`
})
class TestHostComponent {
	constructor(private state: StateService) {}

	getState() {
		return this.state;
	}
}

describe('ChatLogComponent', () => {
	// let component: ChatLogComponent;
	// let fixture: ComponentFixture<ChatLogComponent>;

	let hostComponent: TestHostComponent;
	let hostFixture: ComponentFixture<TestHostComponent>;
	let chatLogDebugElement: DebugElement;
	let chatLogComponent: ChatLogComponent;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [ ReactiveFormsModule ],
			declarations: [ TestHostComponent, ChatLogComponent ],
			providers: [ FormBuilder ]
		}).compileComponents();
	});

	beforeEach(async () => {
		hostFixture = TestBed.createComponent(TestHostComponent);
		hostComponent = hostFixture.componentInstance;
		hostFixture.detectChanges();
		await hostFixture.whenStable();
		chatLogDebugElement = hostFixture.debugElement.query(By.directive(ChatLogComponent));
		chatLogComponent = chatLogDebugElement.componentInstance;
	});

	it('should create', () => {
		expect(chatLogComponent).toBeTruthy();
		expect(hostComponent).toBeTruthy();
	});
});
