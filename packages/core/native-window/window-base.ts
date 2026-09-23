import { Observable } from '../data/observable';
import type { NativeWindowEventName, WindowBaseEventData, WindowLayoutDirectionChangedEventData, WindowOrientationChangedEventData, WindowSystemAppearanceChangedEventData } from './native-window-interfaces';
import type { AndroidActivityEventData, AndroidActivityBundleEventData, AndroidActivityResultEventData, AndroidActivityBackPressedEventData, AndroidActivityNewIntentEventData, AndroidActivityRequestPermissionsEventData, SceneEventData, SceneOpenURLContextsEventData, SceneContinueUserActivityEventData, ScenePerformActionForShortcutItemEventData } from '../application/application-interfaces';

/**
 * The purpose a window surface serves.
 *
 * - `application` – a regular app window (iOS application scene, Android activity).
 * - `embedded` – a window hosted inside another app or container.
 * - `carplay` – a CarPlay template scene.
 * - `externalDisplay` – an external/secondary display scene.
 */
export type WindowRole = 'application' | 'embedded' | 'carplay' | 'externalDisplay';

/**
 * The lifecycle state of a window surface.
 *
 * - `attached` – connected to a live native surface.
 * - `detached` – the native surface went away but the window may be reconnected.
 * - `closed` – permanently torn down.
 */
export type WindowState = 'attached' | 'detached' | 'closed';

let _windowIdCounter = 0;

/**
 * Cross-platform base for any window surface.
 *
 * Carries identity, role, state, lifecycle events and the native accessors.
 * Surfaces that host a NativeScript view tree extend {@link NativeWindow} instead.
 */
export abstract class WindowBase extends Observable {
	private _id: string;
	private _role: WindowRole;
	private _state: WindowState = 'attached';
	private _isPrimary: boolean;

	/**
	 * @internal – whether the native surface behind this window is known to be gone.
	 *
	 * Only the platform's disconnect callback can establish this, and {@link state} cannot
	 * stand in for it: a disconnect that ends the session unregisters the window while it is
	 * still `attached`, so an attached window is not necessarily a live one.
	 */
	_surfaceGone = false;

	constructor(id?: string, isPrimary = false, role: WindowRole = 'application') {
		super();
		this._id = id || `window-${++_windowIdCounter}`;
		this._isPrimary = isPrimary;
		this._role = role;
	}

	get id(): string {
		return this._id;
	}

	get role(): WindowRole {
		return this._role;
	}

	get state(): WindowState {
		return this._state;
	}

	get isPrimary(): boolean {
		return this._isPrimary;
	}

	/**
	 * @internal - used by the Application to promote a window to primary.
	 */
	_setIsPrimary(value: boolean): void {
		this._isPrimary = value;
	}

	/**
	 * @internal
	 */
	_setState(value: WindowState): void {
		// A window only ever attaches to a surface that exists, so attaching is what clears
		// the record of the previous one going away.
		if (value === 'attached') {
			this._surfaceGone = false;
		}

		this._state = value;
	}

	get ios(): { readonly scene?: UIWindowScene; readonly uiWindow: UIWindow } | undefined {
		return undefined;
	}

	get android(): { readonly activity: androidx.appcompat.app.AppCompatActivity } | undefined {
		return undefined;
	}

	/**
	 * Close this window.
	 */
	abstract close(): void;

	// --- Typed event overloads ---

	on(event: 'activate', callback: (data: WindowBaseEventData) => void, thisArg?: any): void;
	on(event: 'deactivate', callback: (data: WindowBaseEventData) => void, thisArg?: any): void;
	on(event: 'background', callback: (data: WindowBaseEventData) => void, thisArg?: any): void;
	on(event: 'foreground', callback: (data: WindowBaseEventData) => void, thisArg?: any): void;
	on(event: 'close', callback: (data: WindowBaseEventData) => void, thisArg?: any): void;
	on(event: 'attached', callback: (data: WindowBaseEventData) => void, thisArg?: any): void;
	on(event: 'detached', callback: (data: WindowBaseEventData) => void, thisArg?: any): void;
	on(event: 'displayed', callback: (data: WindowBaseEventData) => void, thisArg?: any): void;
	on(event: 'orientationChanged', callback: (data: WindowOrientationChangedEventData) => void, thisArg?: any): void;
	on(event: 'systemAppearanceChanged', callback: (data: WindowSystemAppearanceChangedEventData) => void, thisArg?: any): void;
	on(event: 'layoutDirectionChanged', callback: (data: WindowLayoutDirectionChangedEventData) => void, thisArg?: any): void;
	on(event: 'activityCreated', callback: (args: AndroidActivityBundleEventData) => void, thisArg?: any): void;
	on(event: 'activityDestroyed', callback: (args: AndroidActivityEventData) => void, thisArg?: any): void;
	on(event: 'activityStarted', callback: (args: AndroidActivityEventData) => void, thisArg?: any): void;
	on(event: 'activityPaused', callback: (args: AndroidActivityEventData) => void, thisArg?: any): void;
	on(event: 'activityResumed', callback: (args: AndroidActivityEventData) => void, thisArg?: any): void;
	on(event: 'activityStopped', callback: (args: AndroidActivityEventData) => void, thisArg?: any): void;
	on(event: 'saveActivityState', callback: (args: AndroidActivityBundleEventData) => void, thisArg?: any): void;
	on(event: 'activityResult', callback: (args: AndroidActivityResultEventData) => void, thisArg?: any): void;
	on(event: 'activityBackPressed', callback: (args: AndroidActivityBackPressedEventData) => void, thisArg?: any): void;
	on(event: 'activityNewIntent', callback: (args: AndroidActivityNewIntentEventData) => void, thisArg?: any): void;
	on(event: 'activityRequestPermissions', callback: (args: AndroidActivityRequestPermissionsEventData) => void, thisArg?: any): void;
	on(event: 'sceneWillConnect', callback: (args: SceneEventData) => void, thisArg?: any): void;
	on(event: 'sceneDidActivate', callback: (args: SceneEventData) => void, thisArg?: any): void;
	on(event: 'sceneWillResignActive', callback: (args: SceneEventData) => void, thisArg?: any): void;
	on(event: 'sceneWillEnterForeground', callback: (args: SceneEventData) => void, thisArg?: any): void;
	on(event: 'sceneDidEnterBackground', callback: (args: SceneEventData) => void, thisArg?: any): void;
	on(event: 'sceneDidDisconnect', callback: (args: SceneEventData) => void, thisArg?: any): void;
	on(event: 'sceneOpenURLContexts', callback: (args: SceneOpenURLContextsEventData) => void, thisArg?: any): void;
	on(event: 'sceneContinueUserActivity', callback: (args: SceneContinueUserActivityEventData) => void, thisArg?: any): void;
	on(event: 'scenePerformActionForShortcutItem', callback: (args: ScenePerformActionForShortcutItemEventData) => void, thisArg?: any): void;
	on(eventName: string, callback: (data: WindowBaseEventData) => void, thisArg?: any): void;
	on(eventName: string, callback: (data: any) => void, thisArg?: any): void {
		super.on(eventName, callback, thisArg);
	}

	/**
	 * @internal – emit a window lifecycle event.
	 */
	_notifyEvent(eventName: NativeWindowEventName): void {
		this.notify(<WindowBaseEventData>{
			eventName,
			window: this,
			object: this,
		});
	}

	/**
	 * @internal – ends the window session for good.
	 *
	 * Listeners stay live through the whole teardown and are dropped last, so handlers
	 * registered on this instance can still observe `close` yet never outlive the window.
	 */
	_destroy(): void {
		this._setState('closed');
		this._onDestroy();
		this._clearEventListeners();
	}

	/**
	 * Teardown hook for subclasses. Runs while the listeners are still registered.
	 */
	protected _onDestroy(): void {
		// noop
	}
}
