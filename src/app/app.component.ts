import { Component, OnInit, OnDestroy, isDevMode } from '@angular/core';
import { StateService } from './services/state.service';
import { Subscription, Observable } from 'rxjs';
@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: [ './app.component.scss' ]
})
export class AppComponent implements OnInit, OnDestroy {
	public modalActiveState: Observable<boolean>;
	private localSubscriptions: Array<Subscription>;
	public loggedInBool: Observable<boolean>;
	constructor(private state: StateService) {
		this.localSubscriptions = new Array();
	}

	ngOnInit(): void {
		this.loggedInBool = this.state.loggedInStatus();

		this.modalActiveState = this.state.modalActiveStatus();
	}

	ngOnDestroy(): void {}

	appInDevMode(): boolean {
		return isDevMode();
	}

	appUnload() {
		this.state.logout();
		this.state.unsubscribeAllSocketSubs();
	}

	getStateService(): StateService {
		return this.state;
	}

	_getStateService(): StateService {
		if (isDevMode()) return this.state;
		else {
			console.log(new Error('ERROR _getStateService() is only available in dev mode.'));
			return undefined;
		}
	}

	_getLocalSubscriptions(): Array<Subscription> {
		if (isDevMode()) return this.localSubscriptions;
		else {
			console.log(new Error('ERROR _getLoggedInSubscription() is only available in dev mode.'));
			return undefined;
		}
	}

	_setLocalSubscriptions(sub: Array<Subscription>) {
		if (isDevMode()) this.localSubscriptions = sub;
		else {
			console.log(new Error('ERROR _setLoggedInSubscription() is only available in dev mode.'));
		}
	}
}
