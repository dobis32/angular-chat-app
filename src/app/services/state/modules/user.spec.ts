import { UserStateModule } from './user';
import { SocketService } from '../../socket.service';
import { User } from 'src/app/util/user';

describe('UserStateModule', () => {
	let userStateModule: UserStateModule;
	let mockSocket: SocketService;

	beforeEach(() => {
		mockSocket = new SocketService();
		mockSocket._setURI('foobar');
		userStateModule = new UserStateModule(mockSocket);
	});

	it('should be created', () => {
		expect(userStateModule).toBeTruthy();
	});

	it('should have a public method/function for exposing an Observable of the CurrentUser', () => {
		let obs = userStateModule.state();

		expect(typeof userStateModule.state).toEqual('function');
		expect(typeof obs.subscribe).toEqual('function');
	});

	it('should have a function to make a login attempt by emitting through the socket service', () => {
		let emitSpy = spyOn(
			userStateModule._getSocketService(),
			'emit'
		).and.callFake((eventName: string, credentials: any) => {
			return true;
		});
		let username = 'username';
		let password = 'password';

		let result = userStateModule.attemptLogin(username, password);

		expect(typeof userStateModule.attemptLogin).toEqual('function');
		expect(emitSpy).toHaveBeenCalledWith('login', { username, password });
		expect(result).toBeTrue();
	});

	it('should have a function to log-in a user, which should update current-user subscribers and logged-in status subscribers', () => {
		let updateCurrentUserSubSpy = spyOn(userStateModule._getCurrentUserFreshy(), 'refresh');
		let updateLoggedInSubSpy = spyOn(userStateModule._getLoggedInStatusFreshy(), 'refresh');
		userStateModule.login('denny', 'id');

		expect(typeof userStateModule.login).toEqual('function');
		expect(updateCurrentUserSubSpy).toHaveBeenCalled();
		expect(updateLoggedInSubSpy).toHaveBeenCalled();
	});

	it('should have a function to log-out the current user which should update current-user subscribers and logged-in-status subscribers', () => {
		let updateCurrentUserSubSpy = spyOn(userStateModule._getCurrentUserFreshy(), 'refresh');
		let updateLoggedInSubSpy = spyOn(userStateModule._getLoggedInStatusFreshy(), 'refresh');
		userStateModule._setCurrentUser(new User('name', 'id'));

		userStateModule.logout();

		expect(typeof userStateModule.logout).toEqual('function');
		expect(updateCurrentUserSubSpy).toHaveBeenCalledWith(undefined);
		expect(updateLoggedInSubSpy).toHaveBeenCalledWith(false);
		expect(userStateModule._getCurrentUser()).toBeFalsy();
	});

	it('should have a function to return the current user', () => {
		// NOTE user is set in beforeEach()
		expect(typeof userStateModule.getCurrentUser).toEqual('function');
		expect(userStateModule.getCurrentUser()).toEqual(userStateModule._getCurrentUser());
	});
});
