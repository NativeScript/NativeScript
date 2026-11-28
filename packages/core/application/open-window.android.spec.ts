import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.hoisted(() => {
	(globalThis as any).NativeScriptGlobals.addEventWiring = () => {};
});

import { AndroidApplication } from './application.android';
import type { AndroidNativeWindow } from '../native-window/native-window.android';

function activity(name: string, nativeScript = true) {
	return {
		...(nativeScript ? { isNativeScriptActivity: true } : {}),
		getClass: () => name,
		isFinishing: () => false,
		isDestroyed: () => false,
		isInMultiWindowMode: () => false,
		startActivity: vi.fn(),
	} as unknown as androidx.appcompat.app.AppCompatActivity;
}

describe('Android openWindow activity selection', () => {
	let app: AndroidApplication;
	let context: any;
	let windows: AndroidNativeWindow[];
	let start: androidx.appcompat.app.AppCompatActivity;
	let foreground: androidx.appcompat.app.AppCompatActivity;
	let launchComponent: any;

	beforeEach(() => {
		app = new AndroidApplication();
		start = undefined;
		foreground = undefined;
		windows = [];
		launchComponent = 'com.example.LaunchActivity';
		context = {
			startActivity: vi.fn(),
			getPackageName: () => 'com.example',
			getPackageManager: () => ({ getLaunchIntentForPackage: () => launchComponent && { getComponent: () => launchComponent } }),
		};
		vi.spyOn(console, 'warn').mockImplementation(() => {});
		vi.spyOn(app, 'context', 'get').mockReturnValue(context);
		vi.spyOn(app, 'startActivity', 'get').mockImplementation(() => start);
		vi.spyOn(app, 'foregroundActivity', 'get').mockImplementation(() => foreground);
		vi.spyOn(app, '_getWindows').mockImplementation(() => windows);
	});

	afterEach(() => vi.restoreAllMocks());

	function addWindow(owner: androidx.appcompat.app.AppCompatActivity, overrides = {}) {
		windows.push({ activity: owner, state: 'attached', _surfaceGone: false, ...overrides } as AndroidNativeWindow);
	}

	function openedIntent() {
		const launchers = new Set([context, start, foreground, ...windows.map((window) => window.activity)]);
		const calls = [...launchers].filter(Boolean).flatMap((launcher) => vi.mocked(launcher.startActivity).mock.calls);
		expect(calls).toHaveLength(1);
		return calls[0][0];
	}

	it('continues opening windows after the original activity has finished', () => {
		const surviving = activity('com.example.DocumentActivity');
		addWindow(surviving);

		app.openWindow();

		expect(openedIntent().component).toBe(surviving.getClass());
	});

	it('keeps using the original NativeScript activity while it is available', () => {
		start = activity('com.example.MainActivity');
		foreground = activity('com.example.DocumentActivity');
		addWindow(foreground);

		app.openWindow();

		expect(openedIntent().component).toBe(start.getClass());
	});

	it('uses a foreground NativeScript activity when the original is gone', () => {
		foreground = activity('com.example.DocumentActivity');

		app.openWindow();

		expect(openedIntent().component).toBe(foreground.getClass());
	});

	it('does not reopen an SDK activity registered ahead of a surviving NativeScript window', () => {
		start = foreground = activity('com.example.PaymentActivity', false);
		addWindow(start);
		const surviving = activity('com.example.DocumentActivity');
		addWindow(surviving);

		app.openWindow();

		expect(openedIntent().component).toBe(surviving.getClass());
	});

	it.each(['isFinishing', 'isDestroyed'] as const)('skips an activity whose %s is true', (method) => {
		start = activity('com.example.OldActivity');
		vi.spyOn(start, method).mockReturnValue(true);
		addWindow(start);
		const surviving = activity('com.example.DocumentActivity');
		addWindow(surviving);

		app.openWindow();

		expect(openedIntent().component).toBe(surviving.getClass());
	});

	it.each([{ state: 'detached' }, { _surfaceGone: true }])('skips a window without a live surface: %j', (overrides) => {
		addWindow(activity('com.example.OldActivity'), overrides);
		const surviving = activity('com.example.DocumentActivity');
		addWindow(surviving);

		app.openWindow();

		expect(openedIntent().component).toBe(surviving.getClass());
	});

	it('uses the configured launch component when there is no surviving NativeScript activity', () => {
		app.openWindow();

		const intent = context.startActivity.mock.calls[0][0];
		expect(intent.component).toBe(launchComponent);
		expect(intent.flags).toBe(android.content.Intent.FLAG_ACTIVITY_NEW_TASK | android.content.Intent.FLAG_ACTIVITY_MULTIPLE_TASK | android.content.Intent.FLAG_ACTIVITY_NEW_DOCUMENT);
	});

	it('reports a missing launch component without starting an undeclared activity', () => {
		launchComponent = undefined;

		expect(() => app.openWindow()).toThrow(/no NativeScript activity or launch activity/i);
		expect(context.startActivity).not.toHaveBeenCalled();
	});
});
