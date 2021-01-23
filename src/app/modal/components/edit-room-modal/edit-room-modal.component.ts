import { Component, OnInit, Input, Output, EventEmitter, isDevMode } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { ChatRoom } from '../../../util/chatRoom';

@Component({
	selector: 'app-edit-room-modal',
	templateUrl: './edit-room-modal.component.html',
	styleUrls: [ './edit-room-modal.component.scss' ]
})
export class EditRoomModalComponent implements OnInit {
	@Input() roomToEdit: ChatRoom;
	@Input() cb: Function;

	@Output() submit: EventEmitter<FormGroup> = new EventEmitter();

	public form: FormGroup;
	public _submitting: boolean;

	constructor(private fb: FormBuilder) {
		this._submitting = false;
	}

	ngOnInit(): void {
		this.form = this.fb.group({
			name: new FormControl(this.roomToEdit ? this.roomToEdit.getName() : '', [ Validators.required ]),
			capacity: new FormControl(this.roomToEdit ? this.roomToEdit.getCapacity() : 2, [
				Validators.min(2),
				Validators.max(12)
			]),
			password: new FormControl(this.roomToEdit ? this.roomToEdit.getPassword() : '')
		});
	}

	ngOnDestroy(): void {
		let { name, capacity, password } = this.getFormInputs();
		this.cb(name, capacity, password);
	}

	getFormInputs() {
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
