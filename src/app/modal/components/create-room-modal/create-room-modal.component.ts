import { Component, Output, OnInit, EventEmitter, Input } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-create-room-modal',
  templateUrl: './create-room-modal.component.html',
  styleUrls: ['./create-room-modal.component.scss']
})
export class CreateRoomModalComponent implements OnInit {
  @Input() roomName: string;
	@Input() cb: Function;

  @Output() submit: EventEmitter<FormGroup> = new EventEmitter();

  public form: FormGroup;
  public submitting: boolean;
  
  constructor(private fb: FormBuilder) { 
    this.form = this.fb.group({
      name: new FormControl('', [ Validators.required ]),
      capacity: new FormControl(2, [ Validators.min(2), Validators.max(12)]),
      password: new FormControl('')

    });
    
    this.submitting = false;
  }

  ngOnInit(): void {

  }

  ngOnDestroy(): void {
		if (!this.submitting) this.form.setValue({ name: '', capacity: 0, password: '' });
		this.cb(this.form.value);
	}

  submitForm(fg: FormGroup) {
    console.log('FG | Valid:', fg.valid, 'Value:', fg.value);
  }

  stopPropagation(event: Event) {
    event.stopPropagation();
  }

}
