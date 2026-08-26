import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Application } from './application.ios';

const APPLICATION_ROLE = 'UIWindowSceneSessionRoleApplication';
const CARPLAY_ROLE = 'CPTemplateApplicationSceneSessionRoleApplication';

/** Mirrors the surface of UISceneConfiguration the default configuration builds. */
class FakeSceneConfiguration {
	sceneClass: any;
	delegateClass: any;

	constructor(
		readonly name: string,
		readonly role: string,
	) {}

	static configurationWithNameSessionRole(name: string, role: string) {
		return new FakeSceneConfiguration(name, role);
	}
}

function createSession(role: string) {
	return { role, persistentIdentifier: `session-${role}` } as any;
}

function createSessionSet(sessions: any[]) {
	return {
		allObjects: {
			count: sessions.length,
			objectAtIndex: (index: number) => sessions[index],
		},
	} as any;
}

/** A custom application delegate as an app would declare it, minus the native class registration. */
function createDelegateClass(prototypeMembers: Record<string, any> = {}) {
	class CustomDelegate {}

	Object.assign(CustomDelegate.prototype, prototypeMembers);
	(CustomDelegate as any).ObjCProtocols = [(global as any).UIApplicationDelegate];

	return CustomDelegate as any;
}

let previousDelegate: any;

beforeEach(() => {
	(global as any).UISceneConfiguration = FakeSceneConfiguration;
	(global as any).UIWindowSceneSessionRoleApplication = APPLICATION_ROLE;
	(global as any).UIWindowScene = class UIWindowScene {};
	previousDelegate = Application.ios.delegate;
});

afterEach(() => {
	Application.ios.delegate = previousDelegate;
	Application.ios.onSceneConfiguration = null;
	delete (global as any).UISceneConfiguration;
	delete (global as any).UIWindowSceneSessionRoleApplication;
	delete (global as any).UIWindowScene;
});

describe('custom application delegate', () => {
	it('installs both scene methods on a delegate that has neither', () => {
		const CustomDelegate = createDelegateClass();

		Application.ios.delegate = CustomDelegate;

		expect(typeof CustomDelegate.prototype.applicationConfigurationForConnectingSceneSessionOptions).toBe('function');
		expect(typeof CustomDelegate.prototype.applicationDidDiscardSceneSessions).toBe('function');
	});

	it('keeps a delegate implementation and installs only the missing one', () => {
		const ownConfiguration = vi.fn();
		const CustomDelegate = createDelegateClass({ applicationConfigurationForConnectingSceneSessionOptions: ownConfiguration });

		Application.ios.delegate = CustomDelegate;

		expect(CustomDelegate.prototype.applicationConfigurationForConnectingSceneSessionOptions).toBe(ownConfiguration);
		expect(typeof CustomDelegate.prototype.applicationDidDiscardSceneSessions).toBe('function');
	});

	it('leaves a method inherited from a base class alone', () => {
		const inherited = vi.fn();

		class BaseDelegate {}
		Object.assign(BaseDelegate.prototype, { applicationDidDiscardSceneSessions: inherited });

		class CustomDelegate extends BaseDelegate {}
		(CustomDelegate as any).ObjCProtocols = [(global as any).UIApplicationDelegate];

		Application.ios.delegate = CustomDelegate as any;

		expect((CustomDelegate.prototype as any).applicationDidDiscardSceneSessions).toBe(inherited);
		expect(Object.prototype.hasOwnProperty.call(CustomDelegate.prototype, 'applicationDidDiscardSceneSessions')).toBe(false);
	});

	it('installs a scene configuration that matches the default', () => {
		const CustomDelegate = createDelegateClass();
		const session = createSession(APPLICATION_ROLE);

		Application.ios.delegate = CustomDelegate;

		const installed = CustomDelegate.prototype.applicationConfigurationForConnectingSceneSessionOptions(null, session, null);
		const expected = Application.ios.defaultSceneConfiguration(null, session, null);

		expect(installed.name).toBe(expected.name);
		expect(installed.role).toBe(expected.role);
		expect(installed.sceneClass).toBe(expected.sceneClass);
		expect(installed.delegateClass).toBe(expected.delegateClass);
	});

	it('installs a discard handler that retires the sessions windows', () => {
		const CustomDelegate = createDelegateClass();
		const sessions = createSessionSet([createSession(APPLICATION_ROLE)]);
		const discarded = vi.spyOn(Application.ios, '_onSceneSessionsDiscarded');

		Application.ios.delegate = CustomDelegate;
		CustomDelegate.prototype.applicationDidDiscardSceneSessions(null, sessions);

		expect(discarded).toHaveBeenCalledWith(sessions);

		discarded.mockRestore();
	});
});

describe('defaultSceneConfiguration', () => {
	it('returns a NativeScript managed configuration for the application role', () => {
		const config = Application.ios.defaultSceneConfiguration(null, createSession(APPLICATION_ROLE), null) as any;

		expect(config.name).toBe('Default Configuration');
		expect(config.role).toBe(APPLICATION_ROLE);
		expect(config.sceneClass).toBe((global as any).UIWindowScene);
		expect(config.delegateClass).toBe((global as any).SceneDelegate);
	});

	it('returns an unmanaged configuration for any other role', () => {
		const config = Application.ios.defaultSceneConfiguration(null, createSession(CARPLAY_ROLE), null) as any;

		expect(config.name).toBe('Unmanaged');
		expect(config.role).toBe(CARPLAY_ROLE);
		expect(config.sceneClass).toBeUndefined();
		expect(config.delegateClass).toBeUndefined();
	});

	it('honors a configuration returned by onSceneConfiguration', () => {
		const session = createSession(APPLICATION_ROLE);
		const userConfig = { name: 'User Configuration' } as any;
		const handler = vi.fn(() => userConfig);

		Application.ios.onSceneConfiguration = handler;

		expect(Application.ios.defaultSceneConfiguration(null, session, null)).toBe(userConfig);
		expect(handler).toHaveBeenCalledWith(null, session, null);
	});

	it('falls back to the default when onSceneConfiguration declines', () => {
		Application.ios.onSceneConfiguration = () => null;

		const config = Application.ios.defaultSceneConfiguration(null, createSession(APPLICATION_ROLE), null) as any;

		expect(config.name).toBe('Default Configuration');
	});
});

describe('delegate warnings', () => {
	it('warns when the delegate class does not declare UIApplicationDelegate conformance', () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

		class CustomDelegate {}
		Application.ios.delegate = CustomDelegate as any;

		expect(warn).toHaveBeenCalledTimes(1);
		expect(warn.mock.calls[0][0]).toContain('ObjCProtocols');

		// The warning is one-shot, so a second offending class must stay quiet.
		class AnotherDelegate {}
		Application.ios.delegate = AnotherDelegate as any;

		expect(warn).toHaveBeenCalledTimes(1);

		warn.mockRestore();
	});

	it('warns when the delegate is assigned after the app has started', () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
		const wasStarted = Application.ios.started;
		Application.ios.started = true;

		Application.ios.delegate = createDelegateClass();

		Application.ios.started = wasStarted;

		expect(warn).toHaveBeenCalledTimes(1);
		expect(warn.mock.calls[0][0]).toContain('after the application started');

		warn.mockRestore();
	});
});

describe('delegate window accessor', () => {
	it('stores what is assigned instead of discarding it', () => {
		const CustomDelegate = createDelegateClass();

		Application.ios.delegate = CustomDelegate;

		const instance = new CustomDelegate();
		const window = { tag: 'window' };
		instance.window = window;

		expect(instance.window).toBe(window);
	});

	it('leaves a delegate that declares its own window accessor alone', () => {
		let assigned: any;

		class CustomDelegate {
			get window() {
				return assigned;
			}

			set window(value: any) {
				assigned = value;
			}
		}
		(CustomDelegate as any).ObjCProtocols = [(global as any).UIApplicationDelegate];

		const descriptorBefore = Object.getOwnPropertyDescriptor(CustomDelegate.prototype, 'window');

		Application.ios.delegate = CustomDelegate as any;

		expect(Object.getOwnPropertyDescriptor(CustomDelegate.prototype, 'window')).toEqual(descriptorBefore);
	});
});
