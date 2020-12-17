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
	private loggedInBool: boolean;
	constructor(private state: StateService) {
		this.localSubscriptions = new Array();
	}

	ngOnInit(): void {
		let loggedInSub = this.state.loggedInStatus().subscribe((status) => {
			this.loggedInBool = status;
			// this.loggedInBool = true;
		});
		this.localSubscriptions.push(loggedInSub);

		this.modalActiveState = this.state.modalActiveStatus();

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
		while (this.localSubscriptions.length) this.localSubscriptions.shift().unsubscribe();
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
			return undefined;
		}
	}
}
