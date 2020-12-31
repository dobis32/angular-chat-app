import { Component, OnInit, OnDestroy, Input, Output, EventEmitter, isDevMode } from '@angular/core';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';

@Component({
	selector: 'app-password-modal',
	templateUrl: './password-modal.component.html',
	styleUrls: [ './password-modal.component.scss' ]
})
export class PasswordModalComponent implements OnInit, OnDestroy {
	@Input() cb: Function;

	@Output() submit: EventEmitter<FormGroup> = new EventEmitter();

	public passwordForm: FormGroup;

	private submitting: boolean;

	constructor(private formBuilder: FormBuilder) {
		this.passwordForm = this.formBuilder.group({
			password: new FormControl('')
		});
		this.submitting = false;
	}

	ngOnInit(): void {}

	ngOnDestroy(): void {
		if (!this.submitting) this.passwordForm.setValue({ password: '' });
		this.cb(this.passwordForm.value.password);
	}

	submitPassword(fg: FormGroup): void {
		this.submitting = true;
		this.submit.emit(fg);
	}

	stopPropagation(event: Event) {
		event.stopPropagation();
	}

	_getSubmittingBool(): boolean {
		if (isDevMode()) return this.submitting;
		else {
			console.log(new Error('ERROR _getSubmittingBool() is only available in dev mode.'));
			return undefined;
		}
	}

	_setSubmittingBool(bool: boolean) {
		if (isDevMode()) this.submitting = bool;
		else {
			console.log(new Error('ERROR _setSubmittingBool() is only available in dev mode.'));
		}
	}
}
