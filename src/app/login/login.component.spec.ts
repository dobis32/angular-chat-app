import { Component, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { StateService } from '../services/state/state.service';
import { LoginComponent } from './login.component';
import { By } from '@angular/platform-browser';

@Component({
	selector: `host-component`,
	template: `<app-login [state]="getState()"></app-login>`
})
class TestHostComponent {
	constructor(private state: StateService) {}

	getState() {
		return this.state;
	}
}

describe('LoginComponent', () => {
	let hostComponent: TestHostComponent;
	let hostFixture: ComponentFixture<TestHostComponent>;
	let loginDebugElement: DebugElement;
	let loginComponent: LoginComponent;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [ ReactiveFormsModule ],
			declarations: [ LoginComponent, TestHostComponent ],
			providers: [ FormBuilder ]
		}).compileComponents();

		hostFixture = TestBed.createComponent(TestHostComponent);
		hostComponent = hostFixture.componentInstance;
		hostFixture.detectChanges();
		loginDebugElement = hostFixture.debugElement.query(By.directive(LoginComponent));
		loginComponent = loginDebugElement.componentInstance;
	});

	// DOM Re-lated
	it('should have an invalid login message when logging-in fails', () => {
		let initState = loginComponent.loginFailed;

		loginComponent.loginForm.setValue({ username: '', password: '' });
		loginComponent.login(loginComponent.loginForm);

		expect(initState).toBeDefined();
		expect(loginComponent.loginFailed).toBeTrue();
		hostFixture.detectChanges();
		expect(loginDebugElement.query(By.css('.failure'))).toBeTruthy();
	});

	it('should prevent a login attempt if there is no username entered in the login form', () => {
		let loginSpy = spyOn(loginComponent.state.user, 'attemptLogin').and.callThrough();

		loginComponent.loginForm.setValue({ username: '', password: 'foobar' });
		loginComponent.login(loginComponent.loginForm);

		expect(loginComponent.loginFailed).toBeTrue();
		expect(loginSpy).toHaveBeenCalledTimes(0);
	});

	it('should prevent a login attempt if there is no password entered in the login form', () => {
		let loginSpy = spyOn(loginComponent.state.user, 'attemptLogin').and.callThrough();

		loginComponent.loginForm.setValue({ username: 'denny', password: '' });
		loginComponent.login(loginComponent.loginForm);

		expect(loginComponent.loginFailed).toBeTrue();
		expect(loginSpy).toHaveBeenCalledTimes(0);
	});

	it('should make a login attempt when there is a username and a password entered into the login form', () => {
		let username = 'denny';
		let password = 'foobar';
		let loginSpy = spyOn(loginComponent.state.user, 'attemptLogin').and.callFake((username, password) => {
			return true;
		});

		loginComponent.loginForm.setValue({ username, password });
		loginComponent.login(loginComponent.loginForm);

		expect(loginSpy).toHaveBeenCalled();
		expect(loginSpy).toHaveBeenCalledWith(username, password);
		expect(loginComponent.loginForm.valid).toBeTrue();
		expect(loginComponent.loginFailed).toBeFalse();
	});

	// Init
	it('should create', () => {
		expect(hostComponent).toBeTruthy();
		expect(loginComponent).toBeTruthy();
	});

	it('should have the state service injected into it from the parent/host component', () => {
		expect(loginComponent.state).toEqual(hostComponent.getState());
	});

	it('should have a FormBuilder', () => {
		expect(loginComponent._getFormBuilder()).toBeTruthy();
	});

	it('should have a FormGroup for login credentials', () => {
		expect(loginComponent.loginForm).toBeTruthy();
	});

	it('should have a function for logging-in', () => {
		expect(typeof loginComponent.login).toEqual('function');
	});
});
