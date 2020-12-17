import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
	selector: 'app-password-modal',
	templateUrl: './password-modal.component.html',
	styleUrls: [ './password-modal.component.scss' ]
})
export class PasswordModalComponent implements OnInit {
	@Input() roomName: string;
	public passwordFailed: boolean;
	public passwordForm: FormGroup;

	constructor(private formBuilder: FormBuilder) {
		this.passwordFailed = false;
		this.passwordForm = this.formBuilder.group({
			password: new FormControl('', [ Validators.required, Validators.minLength(1) ])
		});
	}

	ngOnInit(): void {}

	submitPassword(fg: FormGroup): void {
		// if (fg.valid) {
		// 	this.submit.emit(fg.value.password);
		// } else this.passwordFailed = true;
	}
}
