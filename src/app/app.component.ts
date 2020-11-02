import { Component, OnInit, OnDestroy } from '@angular/core';
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
		});
	}

	ngOnDestroy(): void {
		this.loggedInSub.unsubscribe();
		this.state.unsubscribeAllSocketSubs();
	}

	getStateService(): StateService {
		return this.state;
	}

	isLoggedIn(): boolean {
		return this.loggedInBool;
	}
}
