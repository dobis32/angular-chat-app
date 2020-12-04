import { Component, OnInit, OnDestroy, isDevMode } from '@angular/core';
import { StateService } from './services/state.service';
import { Subscription } from 'rxjs';
@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: [ './app.component.scss' ]
})
export class AppComponent implements OnInit, OnDestroy {
	private loggedInSub: Subscription;
	private loggedInBool: boolean;
	constructor(private state: StateService) {}

	ngOnInit(): void {
		this.loggedInSub = this.state.loggedInStatus().subscribe((status) => {
			this.loggedInBool = status;
			// this.loggedInBool = true;
		});
		// this.state.login('Denny Dingus', 'pw');
	}

	ngOnDestroy(): void {
		this.unsubLocalSubscriptions();
	}

	appInDevMode(): boolean {
		return isDevMode();
	}

	appUnload() {
		this.state.logout();
		this.unsubLocalSubscriptions();
		this.state.unsubscribeAllSocketSubs();
	}

	unsubLocalSubscriptions() {
		if (this.loggedInSub) {
			this.loggedInSub.unsubscribe();
			this.loggedInSub = undefined;
		}
	}

	getStateService(): StateService {
		return this.state;
	}

	isLoggedIn(): boolean {
		return this.loggedInBool;
	}

	_getLoggedInBool(): boolean {
		if (isDevMode()) return this.loggedInBool;
		else {
			console.log(new Error('ERROR _getLoggedInBool() is only available in dev mode.'));
			return undefined;
		}
	}

	_getStateService(): StateService {
		if (isDevMode()) return this.state;
		else {
			console.log(new Error('ERROR _getStateService() is only available in dev mode.'));
			return undefined;
		}
	}

	_getLoggedInSubscription(): Subscription {
		if (isDevMode()) return this.loggedInSub;
		else {
			console.log(new Error('ERROR _getLoggedInSubscription() is only available in dev mode.'));
			return undefined;
		}
	}

	_setLoggedInSubscription(sub: Subscription) {
		if (isDevMode()) this.loggedInSub = sub;
		else {
			console.log(new Error('ERROR _setLoggedInSubscription() is only available in dev mode.'));
			return undefined;
		}
	}
}
