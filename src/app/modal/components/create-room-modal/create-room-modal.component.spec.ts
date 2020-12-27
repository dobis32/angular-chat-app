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
    })
    .compileComponents();
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
  });
});
