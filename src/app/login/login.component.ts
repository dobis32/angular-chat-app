import { Component, OnInit, Input } from '@angular/core';
import { StateService } from '../services/state.service';

@Component({
	selector: 'app-login',
	templateUrl: './login.component.html',
	styleUrls: [ './login.component.scss' ]
})
export class LoginComponent implements OnInit {
	@Input() state: StateService;

	constructor() {}

	ngOnInit(): void {}
}
