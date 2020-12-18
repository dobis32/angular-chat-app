import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
	selector: 'app-password-modal',
	templateUrl: './password-modal.component.html',
	styleUrls: [ './password-modal.component.scss' ]
})
export class PasswordModalComponent implements OnInit, OnDestroy {
	@Input() roomName: string;
	@Input() cb: Function;
	@Output() submit: EventEmitter<FormGroup> = new EventEmitter();
	
	public passwordFailed: boolean;
	public passwordForm: FormGroup;

	private submitting: boolean;


	constructor(private formBuilder: FormBuilder) {
		this.passwordFailed = false;
		this.passwordForm = this.formBuilder.group({
			password: new FormControl('', [ Validators.required, Validators.minLength(1) ])
		});
		this.submitting = false;
	}

	ngOnInit(): void {}

	ngOnDestroy(): void {
		if(!this.submitting) this.passwordForm.setValue({password: ''});
		this.cb(this.passwordForm.value.password)
	}

	submitPassword(fg: FormGroup): void {
		this.submitting = true;
		if (fg.valid) {
			this.submit.emit(fg);
		} else this.passwordFailed = true;
	}

	stopPropagation(event: Event) {
		event.stopPropagation();
	}
}
