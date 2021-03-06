import { Component, Output, OnInit, EventEmitter, Input, isDevMode } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
	selector: 'app-create-room-modal',
	templateUrl: './create-room-modal.component.html',
	styleUrls: [ './create-room-modal.component.scss' ]
})
export class CreateRoomModalComponent implements OnInit {
	@Input() roomName: string;
	@Input() cb: Function;

	@Output() submit: EventEmitter<FormGroup> = new EventEmitter();

	public form: FormGroup;

	private _submitting: boolean;

	constructor(private fb: FormBuilder) {
		this.form = this.fb.group({
			name: new FormControl('', [ Validators.required ]),
			capacity: new FormControl(2, [ Validators.min(2), Validators.max(12) ]),
			password: new FormControl('')
		});

		this._submitting = false;
	}

	ngOnInit(): void {}

	ngOnDestroy(): void {
		let { name, capacity, password } = this.getFormInputs();
		this.cb(name, capacity, password);
	}

	getFormInputs(): any {
		return this._submitting ? this.form.value : { name: '', capacity: 0, password: '' };
	}

	submitForm(fg: FormGroup) {
		this._submitting = true;
		this.submit.emit(fg);
	}

	stopPropagation(event: Event) {
		event.stopPropagation();
	}

	_setSubmittingBoolean(b: boolean) {
		if (isDevMode()) this._submitting = b;
		else {
			console.log('Sorry _setSubmittingBoolean() is only available in dev mode');
		}
	}

	_getSubmittingBoolean(): boolean {
		if (isDevMode()) return this._submitting;
		else {
			console.log('Sorry _getSubmittingBoolean() is only available in dev mode');
		}
	}
}
