import { TestBed, ComponentFixture } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AppComponent } from './app.component';
import { ReactiveFormsModule } from '@angular/forms';
import { StateService } from './services/state.service';

describe('AppComponent', () => {
	let fixture: ComponentFixture<AppComponent>;
	let app: AppComponent;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [ RouterTestingModule, ReactiveFormsModule ],
			declarations: [ AppComponent ],
			providers: [ StateService ]
		}).compileComponents();
		fixture = TestBed.createComponent(AppComponent);
		app = fixture.componentInstance;
	});

	// DOM-Related
	it('should have a function that returns the StateService', () => {
		expect(typeof app.getStateService).toEqual('function');
		expect(app.getStateService()).toEqual(app._getStateService());
	});

	// Init
	it('should create the app', () => {
		expect(app).toBeTruthy();
	});

	it('should have the StateService injected into it', () => {
		expect(fixture.debugElement.injector.get(StateService)).toBeTruthy();
	});

	it('should have an array for local subscriptions', () => {
		expect(Array.isArray(app._getLocalSubscriptions())).toBeTrue();
	});

	// Lifecycle
	it(`should have an observable of the app's modal active state`, () => {
		app.ngOnInit();

		expect(typeof app.modalActiveState.subscribe).toEqual('function');
	});

	it('should subscribe to the logged-in status of the StateService on init and add that subscription to the local subscriptions array', () => {
		let loggedInBoolSpy = spyOn(app._getStateService(), 'loggedInStatus').and.callThrough();

		app.ngOnInit();

		expect(loggedInBoolSpy).toHaveBeenCalled();
		expect(typeof app.loggedInBool.subscribe).toEqual('function');
	});

	it('should get the modal-active status from the state and assign it to the corresponding class variable', () => {
		let modalActiveStatusSpy = spyOn(app._getStateService(), 'modalActiveStatus').and.callThrough();

		app.ngOnInit();

		expect(modalActiveStatusSpy).toHaveBeenCalled();
		expect(typeof app.modalActiveState.subscribe).toEqual('function');
	});

	// Window
	it('should have a function for when the window unloads', () => {
		expect(typeof app.appUnload).toEqual('function');
	});

	it('should call the "logout" function of the state service when the window unloads', () => {
		let logoutSpy = spyOn(app._getStateService(), 'logout').and.callFake(() => {});

		app.appUnload();

		expect(logoutSpy).toHaveBeenCalled();
	});

	it('should unsubscribe from all socket-related subscriptions of the state service when the window unloads', () => {
		let unsubLocalSubsSpy = spyOn(app._getStateService(), 'unsubscribeAllSocketSubs').and.callFake(() => {});

		app.appUnload();

		expect(unsubLocalSubsSpy).toHaveBeenCalled();
	});
});
