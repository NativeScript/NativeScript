import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// `application.android.ts` registers deferred event wiring while it loads, through a hook the
// `NativeScriptGlobals` stub in `vitest.setup.ts` does not carry. Hoisted so it lands before
// the imports below.
vi.hoisted(() => {
	(globalThis as any).NativeScriptGlobals.addEventWiring = () => {};
});

import { CoreTypes } from '../core-types';
import { Observable } from '../data/observable';
import type { View } from '../ui/core/view';
import { ApplicationCommon } from './application-common';
import { AndroidApplication } from './application.android';
import { setNativeApp } from './helpers-common';

/** See application-registry.spec.ts: makes the application's events observable. */
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

function createRootView() {
	return {
		cssClasses: new Set<string>(),
		_onCssStateChange: vi.fn(),
		_getRootModalViews: () => [],
	};
}

class TestApplication extends ApplicationCommon {
	rootView = createRootView();

	getRootView(): View {
		return this.rootView as unknown as View;
	}

	getOrientation(): 'portrait' | 'landscape' | 'unknown' {
		return 'portrait';
	}

	getSystemAppearance(): 'dark' | 'light' | null {
		return 'light';
	}

	getLayoutDirection(): CoreTypes.LayoutDirectionType | null {
		return CoreTypes.LayoutDirection.ltr;
	}

	changeSystemAppearance(value: 'dark' | 'light') {
		this.setSystemAppearance(value);
	}
}

describe('system appearance', () => {
	let app: TestApplication;

	beforeEach(() => {
		installApplicationEventBus();
		app = new TestApplication();
	});

	afterEach(() => {
		app.setAutoSystemAppearanceChanged(true);
		installApplicationEventBus();
	});

	it('applies the appearance an app sets while automatic changes are off', () => {
		app.setAutoSystemAppearanceChanged(false);

		app.systemAppearanceChanged(app.getRootView(), 'dark');

		expect(app.rootView.cssClasses.has('ns-dark')).toBe(true);
		expect(app.rootView._onCssStateChange).toHaveBeenCalled();
	});

	it('leaves the classes alone when the system changes while automatic changes are off', () => {
		const changes: string[] = [];
		app.on(app.systemAppearanceChangedEvent, (args: any) => changes.push(args.newValue));
		app.setAutoSystemAppearanceChanged(false);

		app.changeSystemAppearance('dark');

		expect(app.rootView.cssClasses.has('ns-dark')).toBe(false);
		expect(changes).toEqual(['dark']);
	});

	it('applies system changes while automatic changes are on', () => {
		app.changeSystemAppearance('dark');

		expect(app.rootView.cssClasses.has('ns-dark')).toBe(true);
	});
});

describe('Android application traits before the app has started', () => {
	const UI_MODE_NIGHT_YES = 0x20;
	let globals: Record<string, any>;

	beforeEach(() => {
		installApplicationEventBus();
		globals = { android: (global as any).android };
		(global as any).android = {
			...globals.android,
			content: {
				...globals.android?.content,
				res: {
					Configuration: {
						UI_MODE_NIGHT_MASK: 0x30,
						UI_MODE_NIGHT_UNDEFINED: 0x00,
						UI_MODE_NIGHT_NO: 0x10,
						UI_MODE_NIGHT_YES,
						ORIENTATION_PORTRAIT: 1,
						ORIENTATION_LANDSCAPE: 2,
					},
				},
			},
		};
		const configuration = { uiMode: 0x01 | UI_MODE_NIGHT_YES, orientation: 2 };
		setNativeApp({ getResources: () => ({ getConfiguration: () => configuration }) } as any);
	});

	afterEach(() => {
		(global as any).android = globals.android;
		setNativeApp(undefined);
		installApplicationEventBus();
	});

	it('reads them from the native application', () => {
		const app = new AndroidApplication();

		expect(app.context).toBeUndefined();
		expect(app.systemAppearance()).toBe('dark');
		expect(app.orientation()).toBe('landscape');
	});
});
