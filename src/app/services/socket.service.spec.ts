import { TestBed } from '@angular/core/testing';

import { SocketService } from './socket.service';

describe('SocketService', () => {
	let service: SocketService;

	beforeEach(() => {
		TestBed.configureTestingModule({});
		service = TestBed.inject(SocketService);
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});

	it('should have a function for listening to events', () => {
		expect(typeof service.listen).toEqual('function');
	});

	it('should have a function  for emitting events', () => {
		expect(typeof service.emit).toEqual('function');
	});
});
