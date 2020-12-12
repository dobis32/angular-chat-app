import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { PasswordModalComponent } from './password-modal.component';

describe('PasswordModalComponent', () => {
	let component: PasswordModalComponent;
	let fixture: ComponentFixture<PasswordModalComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [ ReactiveFormsModule ],
			declarations: [ PasswordModalComponent ],
			providers: [ FormBuilder ]
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(PasswordModalComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
