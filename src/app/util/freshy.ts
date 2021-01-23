import { Observer, Observable } from 'rxjs';

export class Freshy<T> {
	public observableData: Observable<T>;

	private _data: T;
	private _observers: Array<Observer<T>>;

	constructor(data?: T) {
		this._data = data;
		this._observers = [];
		this.observableData = new Observable((sub: Observer<T>) => {
			this._observers.push(sub);
			sub.next(this._data);
		});
	}

	getData(): T {
		return this._data;
	}

	refresh(data: T) {
		this._data = data;
		this.updateObservers();
	}

	updateObservers(): void {
		this._observers.forEach((obs: Observer<T>) => {
			obs.next(this._data);
		});
	}
}
