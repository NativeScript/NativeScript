import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// `application.android.ts` registers deferred event wiring while it loads, through a hook the
// `NativeScriptGlobals` stub in `vitest.setup.ts` does not carry. Hoisted so it lands before
// the import below.
vi.hoisted(() => {
	(globalThis as any).NativeScriptGlobals.addEventWiring = () => {};
});

import { Observable } from '../data/observable';
import { AndroidApplication } from './application.android';
import type { NativeWindow } from '../native-window/native-window-common';

/**
 * `vitest.setup.ts` installs a `NativeScriptGlobals` whose event bus methods are no-ops, and
 * `ApplicationCommon` binds them per instance. Swapping in a real Observable before each
 * Application is constructed is what makes its events observable at all.
 */
function installApplicationEventBus(): Observable {
	const events = new Observable();
	const bus = (global.NativeScriptGlobals as any).events;

	bus.on = events.on.bind(events);
	bus.once = events.once.bind(events);
	bus.off = events.off.bind(events);
	bus.notify = events.notify.bind(events);
	bus.hasListeners = events.hasListeners.bind(events);

	return events;
}

/** Nothing about the window itself reaches the aggregate — only its identity. */
function createWindow(): NativeWindow {
	return {} as unknown as NativeWindow;
}

describe('activity lifecycle aggregate', () => {
	let app: AndroidApplication;
	let order: string[];

	beforeEach(() => {
		installApplicationEventBus();
		app = new AndroidApplication();

		order = [];
		for (const eventName of ['resume', 'suspend']) {
			app.on(eventName, () => order.push(eventName));
		}
	});

	afterEach(() => {
		vi.restoreAllMocks();
		installApplicationEventBus();
	});

	it('raises each app-level event once as a single window moves through the lifecycle', () => {
		const window = createWindow();

		app._setWindowActive(window, true);
		expect(order).toEqual(['resume']);
		expect(app.suspended).toBe(false);

		app._setWindowActive(window, false);
		expect(order).toEqual(['resume', 'suspend']);
		expect(app.suspended).toBe(true);
	});

	it('raises only on the first window in and the last window out', () => {
		const first = createWindow();
		const second = createWindow();

		app._setWindowActive(first, true);
		app._setWindowActive(second, true);
		expect(order).toEqual(['resume']);

		// The window the user switched away from resigns while the other is still on screen.
		app._setWindowActive(first, false);
		expect(order).toEqual(['resume']);
		expect(app.suspended).toBe(false);

		app._setWindowActive(second, false);
		expect(order).toEqual(['resume', 'suspend']);
		expect(app.suspended).toBe(true);
	});

	it('ignores repeated calls for the same window', () => {
		const window = createWindow();

		app._setWindowActive(window, true);
		app._setWindowActive(window, true);
		expect(order).toEqual(['resume']);

		app._setWindowActive(window, false);
		app._setWindowActive(window, false);
		expect(order).toEqual(['resume', 'suspend']);
	});

	it('ignores a window resigning that never became active', () => {
		const window = createWindow();
		const other = createWindow();

		app._setWindowActive(window, false);
		expect(order).toEqual([]);

		app._setWindowActive(window, true);
		app._setWindowActive(other, false);
		expect(order).toEqual(['resume']);
	});

	it('lets an activity with no registered window speak for the app while no window does', () => {
		app._setWindowActive(undefined, true);
		expect(order).toEqual(['resume']);

		app._setWindowActive(undefined, false);
		expect(order).toEqual(['resume', 'suspend']);
	});

	it('does not let an activity with no registered window suspend an app another window holds active', () => {
		const window = createWindow();

		app._setWindowActive(window, true);
		app._setWindowActive(undefined, false);

		expect(order).toEqual(['resume']);
		expect(app.suspended).toBe(false);
	});

	it('carries the activity on the app-level event', () => {
		const activity = {} as androidx.appcompat.app.AppCompatActivity;
		const received: any[] = [];
		app.on('resume', (args) => received.push(args));

		app._setWindowActive(createWindow(), true, activity);

		expect(received).toHaveLength(1);
		expect(received[0].activity).toBe(activity);
		expect(received[0].android).toBe(activity);
	});
});
