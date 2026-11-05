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

	on(event: 'activate', callback: (data: WindowBaseEventData) => void, thisArg?: any): this;
	on(event: 'deactivate', callback: (data: WindowBaseEventData) => void, thisArg?: any): this;
	on(event: 'background', callback: (data: WindowBaseEventData) => void, thisArg?: any): this;
	on(event: 'foreground', callback: (data: WindowBaseEventData) => void, thisArg?: any): this;
	on(event: 'close', callback: (data: WindowBaseEventData) => void, thisArg?: any): this;
	on(event: 'attached', callback: (data: WindowBaseEventData) => void, thisArg?: any): this;
	on(event: 'detached', callback: (data: WindowBaseEventData) => void, thisArg?: any): this;
	on(event: 'displayed', callback: (data: WindowBaseEventData) => void, thisArg?: any): this;
	on(event: 'orientationChanged', callback: (data: WindowOrientationChangedEventData) => void, thisArg?: any): this;
	on(event: 'systemAppearanceChanged', callback: (data: WindowSystemAppearanceChangedEventData) => void, thisArg?: any): this;
	on(event: 'layoutDirectionChanged', callback: (data: WindowLayoutDirectionChangedEventData) => void, thisArg?: any): this;
	on(event: 'activityCreated', callback: (args: AndroidActivityBundleEventData) => void, thisArg?: any): this;
	on(event: 'activityDestroyed', callback: (args: AndroidActivityEventData) => void, thisArg?: any): this;
	on(event: 'activityStarted', callback: (args: AndroidActivityEventData) => void, thisArg?: any): this;
	on(event: 'activityPaused', callback: (args: AndroidActivityEventData) => void, thisArg?: any): this;
	on(event: 'activityResumed', callback: (args: AndroidActivityEventData) => void, thisArg?: any): this;
	on(event: 'activityStopped', callback: (args: AndroidActivityEventData) => void, thisArg?: any): this;
	on(event: 'saveActivityState', callback: (args: AndroidActivityBundleEventData) => void, thisArg?: any): this;
	on(event: 'activityResult', callback: (args: AndroidActivityResultEventData) => void, thisArg?: any): this;
	on(event: 'activityBackPressed', callback: (args: AndroidActivityBackPressedEventData) => void, thisArg?: any): this;
	on(event: 'activityNewIntent', callback: (args: AndroidActivityNewIntentEventData) => void, thisArg?: any): this;
	on(event: 'activityRequestPermissions', callback: (args: AndroidActivityRequestPermissionsEventData) => void, thisArg?: any): this;
	on(event: 'sceneWillConnect', callback: (args: SceneEventData) => void, thisArg?: any): this;
	on(event: 'sceneDidActivate', callback: (args: SceneEventData) => void, thisArg?: any): this;
	on(event: 'sceneWillResignActive', callback: (args: SceneEventData) => void, thisArg?: any): this;
	on(event: 'sceneWillEnterForeground', callback: (args: SceneEventData) => void, thisArg?: any): this;
	on(event: 'sceneDidEnterBackground', callback: (args: SceneEventData) => void, thisArg?: any): this;
	on(event: 'sceneDidDisconnect', callback: (args: SceneEventData) => void, thisArg?: any): this;
	on(event: 'sceneOpenURLContexts', callback: (args: SceneOpenURLContextsEventData) => void, thisArg?: any): this;
	on(event: 'sceneContinueUserActivity', callback: (args: SceneContinueUserActivityEventData) => void, thisArg?: any): this;
	on(event: 'scenePerformActionForShortcutItem', callback: (args: ScenePerformActionForShortcutItemEventData) => void, thisArg?: any): this;
	on(eventName: string, callback: (data: WindowBaseEventData) => void, thisArg?: any): this;
	on(eventName: string, callback: (data: any) => void, thisArg?: any): this {
		return super.on(eventName, callback, thisArg);
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
