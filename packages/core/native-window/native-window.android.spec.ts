import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { CoreTypes } from '../core-types';

// `frame-helper-for-android` pulls in `fragment.transitions.android`, which the iOS-flavoured
// vitest resolver cannot load. Only the CALLBACKS key is used by the module under test.
vi.mock('../ui/frame/frame-helper-for-android', () => ({
	CALLBACKS: '_callbacks',
}));

import { AndroidNativeWindow } from './native-window.android';
import { NativeWindowEvents } from './native-window-interfaces';

// Real android.content.res.Configuration / android.view.View constants: the bitmask logic
// under test is only meaningful against the values the platform actually reports.
const Configuration = {
	ORIENTATION_UNDEFINED: 0,
	ORIENTATION_PORTRAIT: 1,
	ORIENTATION_LANDSCAPE: 2,
	UI_MODE_NIGHT_MASK: 0x30,
	UI_MODE_NIGHT_UNDEFINED: 0x00,
	UI_MODE_NIGHT_NO: 0x10,
	UI_MODE_NIGHT_YES: 0x20,
	UI_MODE_TYPE_NORMAL: 0x01,
	UI_MODE_TYPE_CAR: 0x03,
};

const AndroidView = {
	LAYOUT_DIRECTION_LTR: 0,
	LAYOUT_DIRECTION_RTL: 1,
};

class FakeComponentCallbacks2 {
	constructor(implementation: Record<string, any>) {
		Object.assign(this, implementation);
	}
}

/** Mirrors android.os.Bundle's string slots: a miss reads back as null, not undefined. */
class FakeBundle {
	private readonly values = new Map<string, string>();

	putString(key: string, value: string): void {
		this.values.set(key, value);
	}

	getString(key: string): string | null {
		return this.values.has(key) ? this.values.get(key) : null;
	}
}

function createConfiguration(overrides: Partial<{ orientation: number; uiMode: number; layoutDirection: number }> = {}) {
	const state = {
		orientation: Configuration.ORIENTATION_PORTRAIT,
		uiMode: Configuration.UI_MODE_TYPE_NORMAL | Configuration.UI_MODE_NIGHT_NO,
		layoutDirection: AndroidView.LAYOUT_DIRECTION_LTR,
		...overrides,
	};

	return Object.assign(state, {
		getLayoutDirection() {
			return state.layoutDirection;
		},
	});
}

type FakeConfiguration = ReturnType<typeof createConfiguration>;

function createActivity(configuration: FakeConfiguration) {
	return {
		registered: [] as any[],
		unregistered: [] as any[],
		finishCalls: 0,
		getResources() {
			return { getConfiguration: () => configuration };
		},
		registerComponentCallbacks(callbacks: any) {
			this.registered.push(callbacks);
		},
		unregisterComponentCallbacks(callbacks: any) {
			this.unregistered.push(callbacks);
		},
		finish() {
			this.finishCalls++;
		},
	};
}

type FakeActivity = ReturnType<typeof createActivity>;

function createWindow(activity: FakeActivity, id?: string, isPrimary = false): AndroidNativeWindow {
	return new AndroidNativeWindow(activity as unknown as androidx.appcompat.app.AppCompatActivity, id, isPrimary);
}

describe('AndroidNativeWindow', () => {
	let configuration: FakeConfiguration;
	let activity: FakeActivity;
	let window: AndroidNativeWindow;
	let uuidCounter: number;

	beforeEach(() => {
		uuidCounter = 0;
		vi.stubGlobal('android', {
			content: {
				res: { Configuration },
				ComponentCallbacks2: FakeComponentCallbacks2,
			},
			view: { View: AndroidView },
		});
		vi.stubGlobal('java', {
			util: {
				UUID: {
					randomUUID: () => ({ toString: () => `uuid-${++uuidCounter}` }),
				},
			},
		});

		configuration = createConfiguration();
		activity = createActivity(configuration);
		window = createWindow(activity, 'window-under-test');
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	describe('Configuration value converters', () => {
		it('maps the orientation constants, treating anything else as unknown', () => {
			expect(window._getOrientationValue(createConfiguration({ orientation: Configuration.ORIENTATION_PORTRAIT }) as any)).toBe('portrait');
			expect(window._getOrientationValue(createConfiguration({ orientation: Configuration.ORIENTATION_LANDSCAPE }) as any)).toBe('landscape');
			expect(window._getOrientationValue(createConfiguration({ orientation: Configuration.ORIENTATION_UNDEFINED }) as any)).toBe('unknown');
		});

		it('reads the night bits out of uiMode rather than comparing the whole field', () => {
			// uiMode packs the ui type into the low bits; a whole-field comparison would miss this.
			const carAtNight = createConfiguration({ uiMode: Configuration.UI_MODE_TYPE_CAR | Configuration.UI_MODE_NIGHT_YES });

			expect(window._getSystemAppearanceValue(carAtNight as any)).toBe('dark');
		});

		it('reports light for night-no, night-undefined and unknown night bits', () => {
			const dayCases = [Configuration.UI_MODE_NIGHT_NO, Configuration.UI_MODE_NIGHT_UNDEFINED, Configuration.UI_MODE_NIGHT_MASK];

			for (const nightBits of dayCases) {
				const config = createConfiguration({ uiMode: Configuration.UI_MODE_TYPE_NORMAL | nightBits });
				expect(window._getSystemAppearanceValue(config as any)).toBe('light');
			}
		});

		it('maps the layout direction constants, defaulting to ltr', () => {
			expect(window._getLayoutDirectionValue(createConfiguration({ layoutDirection: AndroidView.LAYOUT_DIRECTION_RTL }) as any)).toBe(CoreTypes.LayoutDirection.rtl);
			expect(window._getLayoutDirectionValue(createConfiguration({ layoutDirection: AndroidView.LAYOUT_DIRECTION_LTR }) as any)).toBe(CoreTypes.LayoutDirection.ltr);
			expect(window._getLayoutDirectionValue(createConfiguration({ layoutDirection: 99 }) as any)).toBe(CoreTypes.LayoutDirection.ltr);
		});

		it('reads the traits off the activity configuration', () => {
			configuration.orientation = Configuration.ORIENTATION_LANDSCAPE;
			configuration.uiMode = Configuration.UI_MODE_TYPE_NORMAL | Configuration.UI_MODE_NIGHT_YES;
			configuration.layoutDirection = AndroidView.LAYOUT_DIRECTION_RTL;

			expect(window.orientation()).toBe('landscape');
			expect(window.systemAppearance()).toBe('dark');
			expect(window.layoutDirection()).toBe(CoreTypes.LayoutDirection.rtl);
		});
	});

	describe('per-activity configuration callbacks', () => {
		it('registers on the activity and announces every trait a configuration change carries', () => {
			window.orientation();
			window.systemAppearance();
			window.layoutDirection();
			const changes: Array<[string, unknown]> = [];
			for (const eventName of [NativeWindowEvents.orientationChanged, NativeWindowEvents.systemAppearanceChanged, NativeWindowEvents.layoutDirectionChanged]) {
				window.on(eventName, (data: any) => changes.push([data.eventName, data.newValue]));
			}

			window._registerConfigurationCallbacks();
			expect(activity.registered).toHaveLength(1);

			const changed = createConfiguration({
				orientation: Configuration.ORIENTATION_LANDSCAPE,
				uiMode: Configuration.UI_MODE_TYPE_NORMAL | Configuration.UI_MODE_NIGHT_YES,
				layoutDirection: AndroidView.LAYOUT_DIRECTION_RTL,
			});
			(activity.registered[0] as any).onConfigurationChanged(changed);

			expect(changes).toEqual([
				['orientationChanged', 'landscape'],
				['systemAppearanceChanged', 'dark'],
				['layoutDirectionChanged', CoreTypes.LayoutDirection.rtl],
			]);
		});

		it('registers at most once for the same activity', () => {
			window._registerConfigurationCallbacks();
			window._registerConfigurationCallbacks();

			expect(activity.registered).toHaveLength(1);
		});

		it('unregisters the callbacks it registered when the surface detaches', () => {
			window._registerConfigurationCallbacks();

			window._detach();

			expect(activity.unregistered).toEqual(activity.registered);
			expect(window.state).toBe('detached');
		});
	});

	describe('window identity across activity recreation', () => {
		it('mints a prefixed, unique id', () => {
			const first = AndroidNativeWindow.newWindowId();
			const second = AndroidNativeWindow.newWindowId();

			expect(first).toMatch(/^window-uuid-/);
			expect(second).not.toBe(first);
		});

		it('carries the minted id through the saved state bundle onto the recreated window', () => {
			const bundle = new FakeBundle();
			const original = createWindow(activity, AndroidNativeWindow.newWindowId());

			bundle.putString('com.tns.activity.windowId', original.id);
			const restored = createWindow(createActivity(createConfiguration()), bundle.getString('com.tns.activity.windowId'));

			expect(restored.id).toBe(original.id);
		});

		it('mints a fresh id when the bundle carries none', () => {
			const bundle = new FakeBundle();
			const savedId = bundle.getString('com.tns.activity.windowId');

			const created = createWindow(activity, savedId || AndroidNativeWindow.newWindowId());

			expect(savedId).toBeNull();
			expect(created.id).toBe('window-uuid-1');
		});

		it('binds a recreated activity to the same window session', () => {
			const events: string[] = [];
			window.on(NativeWindowEvents.detached, (data) => events.push(data.eventName));
			window._registerConfigurationCallbacks();

			window._detach();
			const recreated = createActivity(createConfiguration());
			window._reattach(recreated as unknown as androidx.appcompat.app.AppCompatActivity);

			expect(events).toEqual(['detached']);
			expect(window.state).toBe('attached');
			expect(window.id).toBe('window-under-test');
			expect(window.android?.activity).toBe(recreated as unknown as androidx.appcompat.app.AppCompatActivity);
		});
	});

	describe('close', () => {
		it('finishes the activity of a secondary window', () => {
			window.close();

			expect(activity.finishCalls).toBe(1);
		});

		it('refuses to close the primary window', () => {
			const primary = createWindow(activity, 'primary', true);
			const log = vi.spyOn(console, 'log').mockImplementation(() => {});

			primary.close();

			expect(activity.finishCalls).toBe(0);
			log.mockRestore();
		});
	});
});
