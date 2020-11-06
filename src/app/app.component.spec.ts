import { TestBed, ComponentFixture } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AppComponent } from './app.component';
import { ReactiveFormsModule } from '@angular/forms';
import { StateService } from './services/state.service';
import { Observable } from 'rxjs';
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

	it('should create the app', () => {
		expect(app).toBeTruthy();
	});

	it('should have the StateService injected into it', () => {
		expect(fixture.debugElement.injector.get(StateService)).toBeTruthy();
	});

	it('should subscribe to the logged-in status of the StateService on init', () => {
		let loggedIn = true;
		let loggedInStatusSpy = spyOn(app._getStateService(), 'loggedInStatus').and.callFake(() => {
			return new Observable((sub) => {
				sub.next(loggedIn);
			});
		});
		app.ngOnInit();
		expect(loggedInStatusSpy).toHaveBeenCalled();
		expect(app._getLoggedInBool()).toBeTruthy();
	});

	it('should unsubscribe from the logged-in status subscription it gets from the StateService when it it destroyed', () => {
		app.ngOnInit();

		let loggedInSubSpy = spyOn(app._getLoggedInSubscription(), 'unsubscribe').and.callThrough();

		app.ngOnDestroy();

		expect(loggedInSubSpy).toHaveBeenCalled();
	});

	it('should call the function of the StateService that unsubscribes all socket-related subscriptions when it it destroyed', () => {
		app.ngOnInit();

		let unsubSocketSubsSpy = spyOn(app._getStateService(), 'unsubscribeAllSocketSubs').and.callFake(() => {});

		app.ngOnDestroy();

		expect(unsubSocketSubsSpy).toHaveBeenCalled();
	});

	it('should have a function that returns the injected StateService', () => {
		expect(app._getStateService()).toEqual(fixture.debugElement.injector.get(StateService));
	});

	it('should have a function that returns the injected StateService', () => {
		let loggedIn = true;
		spyOn(app._getStateService(), 'loggedInStatus').and.callFake(() => {
			return new Observable((sub) => {
				sub.next(loggedIn);
			});
		});
		app.ngOnInit();
		expect(app.isLoggedIn()).toEqual(app._getLoggedInBool());
	});
});
