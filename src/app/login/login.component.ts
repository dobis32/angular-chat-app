import { Component, OnInit, Input, isDevMode } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { StateService } from '../services/state/state.service';

@Component({
	selector: 'app-login',
	templateUrl: './login.component.html',
	styleUrls: [ './login.component.scss' ]
})
export class LoginComponent implements OnInit {
	@Input() state: StateService;
	public loginForm: FormGroup;
	public loginFailed: boolean;
	constructor(private formBuilder: FormBuilder) {
		this.loginFailed = false;
		this.loginForm = this.formBuilder.group({
			username: new FormControl('', [ Validators.required, Validators.minLength(1) ]),
			password: new FormControl('', [ Validators.required, Validators.minLength(1) ])
		});
	}

	_getFormBuilder(): FormBuilder {
		if (isDevMode()) return this.formBuilder;
		else {
			console.log('ERROR _getFormBuilder is only available in dev mode');
			return undefined;
		}
	}

	ngOnInit(): void {}

	login(fg: FormGroup) {
		let { username, password } = fg.value;
		this.loginFailed = false;
		console.log(username, password);
		if (fg.valid) {
			let result = this.state.user.attemptLogin(username, password);
			if (result) this.loginFailed = false;
			else this.loginFailed = true;
		} else this.loginFailed = true;
	}
}
