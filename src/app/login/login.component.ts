import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { StateService } from '../services/state.service';

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

	ngOnInit(): void {}

	login(fg: FormGroup) {
		let { username, password } = fg.value
		this.loginFailed = false;
		console.log(username, password);
		if(fg.valid) {
			let result = this.state.login(username, password);
			if(result) this.loginFailed = false;
			else this.loginFailed = true;
		}
	}
}
