import { Observable } from '../data/observable';
import type { CoreTypes } from '../core-types';
import type { View } from '../ui/core/view';
import type { NavigationEntry } from '../ui/frame/frame-interfaces';
import type { AndroidActivityEventData, AndroidActivityBundleEventData, AndroidActivityResultEventData, AndroidActivityBackPressedEventData, AndroidActivityNewIntentEventData, AndroidActivityRequestPermissionsEventData, SceneEventData, SceneOpenURLContextsEventData, SceneContinueUserActivityEventData, ScenePerformActionForShortcutItemEventData } from '../application/application-interfaces';
import type { NativeWindowEventData, WindowBaseEventData, WindowLayoutDirectionChangedEventData, WindowOrientationChangedEventData, WindowSystemAppearanceChangedEventData } from './native-window-interfaces';

export * from './native-window-interfaces';

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

/**
 * Cross-platform base for any window surface.
 *
 * Carries identity, role, state, lifecycle events and the native accessors.
 * Surfaces that host a NativeScript view tree are {@link NativeWindow} instances.
 */
export abstract class WindowBase extends Observable {
	/**
	 * Stable identifier of this window, unique for the lifetime of the JS context.
	 * Survives a detach/re-attach, so it can be used to correlate a window across
	 * an iOS scene reconnect or an Android activity recreation.
	 */
	readonly id: string;

	/**
	 * The purpose this window surface serves.
	 */
	readonly role: WindowRole;

	/**
	 * Where this window currently sits in its lifecycle.
	 */
	readonly state: WindowState;

	/**
	 * Whether this is the application's primary window.
	 *
	 * At most one window is primary at a time. When the primary window closes another
	 * attached window is promoted and `primaryWindowChanged` is raised on the Application.
	 */
	readonly isPrimary: boolean;

	/**
	 * The iOS surface backing this window, or `undefined` when not running on iOS.
	 * `scene` is absent for apps still on the pre-scene (window-only) lifecycle.
	 */
	readonly ios?: { readonly scene?: UIWindowScene; readonly uiWindow: UIWindow };

	/**
	 * The Android surface backing this window, or `undefined` when not running on Android
	 * or when the activity is already gone.
	 */
	readonly android?: { readonly activity: androidx.appcompat.app.AppCompatActivity };

	/**
	 * Closes this window.
	 *
	 * Ends the window session: the native surface is dismissed, `close` is raised and the
	 * window is dropped from the Application registry.
	 */
	abstract close(): void;

	/**
	 * Raised when the window becomes the active/focused window.
	 */
	on(event: 'activate', callback: (data: WindowBaseEventData) => void, thisArg?: any): void;

	/**
	 * Raised when the window loses focus.
	 */
	on(event: 'deactivate', callback: (data: WindowBaseEventData) => void, thisArg?: any): void;

	/**
	 * Raised when the window enters the background.
	 */
	on(event: 'background', callback: (data: WindowBaseEventData) => void, thisArg?: any): void;

	/**
	 * Raised when the window enters the foreground.
	 */
	on(event: 'foreground', callback: (data: WindowBaseEventData) => void, thisArg?: any): void;

	/**
	 * Raised when a native surface is bound to the window - both on the first connect and
	 * on every re-attach after a `detached`.
	 */
	on(event: 'attached', callback: (data: WindowBaseEventData) => void, thisArg?: any): void;

	/**
	 * Raised when the native surface goes away while the window session stays alive
	 * (iOS scene disconnect, Android activity recreation).
	 *
	 * The window stays registered on the Application and keeps its listeners, so the same
	 * instance is handed back when a surface re-attaches and handlers registered before the
	 * detach keep working afterwards.
	 */
	on(event: 'detached', callback: (data: WindowBaseEventData) => void, thisArg?: any): void;

	/**
	 * Raised when the window session ends for good.
	 *
	 * Fires exactly once per window. Listeners stay registered for the whole teardown, so a
	 * handler added at any earlier point still observes it; immediately after it is
	 * dispatched the framework drops every listener on the instance, so nothing registered
	 * on a window outlives the window.
	 */
	on(event: 'close', callback: (data: WindowBaseEventData) => void, thisArg?: any): void;

	/**
	 * Raised after the window content has been displayed for the first time.
	 */
	on(event: 'displayed', callback: (data: WindowBaseEventData) => void, thisArg?: any): void;

	/**
	 * Raised when the orientation of this window changes.
	 */
	on(event: 'orientationChanged', callback: (data: WindowOrientationChangedEventData) => void, thisArg?: any): void;

	/**
	 * Raised when the system appearance of this window changes between light and dark.
	 */
	on(event: 'systemAppearanceChanged', callback: (data: WindowSystemAppearanceChangedEventData) => void, thisArg?: any): void;

	/**
	 * Raised when the layout direction of this window changes between ltr and rtl.
	 */
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

	/**
	 * Adds a listener for the specified event name.
	 *
	 * @param eventName The name of the event.
	 * @param callback The event listener to add. Will be called when an event of
	 * the given name is raised.
	 * @param thisArg An optional parameter which, when set, will be bound as the
	 * `this` context when the callback is called. Falsy values will be not be
	 * bound.
	 */
	on(eventName: string, callback: (data: WindowBaseEventData) => void, thisArg?: any): void;

	once(event: 'activate', callback: (data: WindowBaseEventData) => void, thisArg?: any): void;
	once(event: 'deactivate', callback: (data: WindowBaseEventData) => void, thisArg?: any): void;
	once(event: 'background', callback: (data: WindowBaseEventData) => void, thisArg?: any): void;
	once(event: 'foreground', callback: (data: WindowBaseEventData) => void, thisArg?: any): void;
	once(event: 'attached', callback: (data: WindowBaseEventData) => void, thisArg?: any): void;
	once(event: 'detached', callback: (data: WindowBaseEventData) => void, thisArg?: any): void;
	once(event: 'close', callback: (data: WindowBaseEventData) => void, thisArg?: any): void;
	once(event: 'displayed', callback: (data: WindowBaseEventData) => void, thisArg?: any): void;
	once(event: 'orientationChanged', callback: (data: WindowOrientationChangedEventData) => void, thisArg?: any): void;
	once(event: 'systemAppearanceChanged', callback: (data: WindowSystemAppearanceChangedEventData) => void, thisArg?: any): void;
	once(event: 'layoutDirectionChanged', callback: (data: WindowLayoutDirectionChangedEventData) => void, thisArg?: any): void;
	once(event: 'activityCreated', callback: (args: AndroidActivityBundleEventData) => void, thisArg?: any): void;
	once(event: 'activityDestroyed', callback: (args: AndroidActivityEventData) => void, thisArg?: any): void;
	once(event: 'activityStarted', callback: (args: AndroidActivityEventData) => void, thisArg?: any): void;
	once(event: 'activityPaused', callback: (args: AndroidActivityEventData) => void, thisArg?: any): void;
	once(event: 'activityResumed', callback: (args: AndroidActivityEventData) => void, thisArg?: any): void;
	once(event: 'activityStopped', callback: (args: AndroidActivityEventData) => void, thisArg?: any): void;
	once(event: 'saveActivityState', callback: (args: AndroidActivityBundleEventData) => void, thisArg?: any): void;
	once(event: 'activityResult', callback: (args: AndroidActivityResultEventData) => void, thisArg?: any): void;
	once(event: 'activityBackPressed', callback: (args: AndroidActivityBackPressedEventData) => void, thisArg?: any): void;
	once(event: 'activityNewIntent', callback: (args: AndroidActivityNewIntentEventData) => void, thisArg?: any): void;
	once(event: 'activityRequestPermissions', callback: (args: AndroidActivityRequestPermissionsEventData) => void, thisArg?: any): void;
	once(event: 'sceneWillConnect', callback: (args: SceneEventData) => void, thisArg?: any): void;
	once(event: 'sceneDidActivate', callback: (args: SceneEventData) => void, thisArg?: any): void;
	once(event: 'sceneWillResignActive', callback: (args: SceneEventData) => void, thisArg?: any): void;
	once(event: 'sceneWillEnterForeground', callback: (args: SceneEventData) => void, thisArg?: any): void;
	once(event: 'sceneDidEnterBackground', callback: (args: SceneEventData) => void, thisArg?: any): void;
	once(event: 'sceneDidDisconnect', callback: (args: SceneEventData) => void, thisArg?: any): void;
	once(event: 'sceneOpenURLContexts', callback: (args: SceneOpenURLContextsEventData) => void, thisArg?: any): void;
	once(event: 'sceneContinueUserActivity', callback: (args: SceneContinueUserActivityEventData) => void, thisArg?: any): void;
	once(event: 'scenePerformActionForShortcutItem', callback: (args: ScenePerformActionForShortcutItemEventData) => void, thisArg?: any): void;

	/**
	 * Adds a listener for the specified event name that is removed as soon as it is raised
	 * once.
	 */
	once(eventName: string, callback: (data: WindowBaseEventData) => void, thisArg?: any): void;

	off(event: 'activate', callback?: (data: WindowBaseEventData) => void, thisArg?: any): void;
	off(event: 'deactivate', callback?: (data: WindowBaseEventData) => void, thisArg?: any): void;
	off(event: 'background', callback?: (data: WindowBaseEventData) => void, thisArg?: any): void;
	off(event: 'foreground', callback?: (data: WindowBaseEventData) => void, thisArg?: any): void;
	off(event: 'attached', callback?: (data: WindowBaseEventData) => void, thisArg?: any): void;
	off(event: 'detached', callback?: (data: WindowBaseEventData) => void, thisArg?: any): void;
	off(event: 'close', callback?: (data: WindowBaseEventData) => void, thisArg?: any): void;
	off(event: 'displayed', callback?: (data: WindowBaseEventData) => void, thisArg?: any): void;
	off(event: 'orientationChanged', callback?: (data: WindowOrientationChangedEventData) => void, thisArg?: any): void;
	off(event: 'systemAppearanceChanged', callback?: (data: WindowSystemAppearanceChangedEventData) => void, thisArg?: any): void;
	off(event: 'layoutDirectionChanged', callback?: (data: WindowLayoutDirectionChangedEventData) => void, thisArg?: any): void;
	off(event: 'activityCreated', callback?: (args: AndroidActivityBundleEventData) => void, thisArg?: any): void;
	off(event: 'activityDestroyed', callback?: (args: AndroidActivityEventData) => void, thisArg?: any): void;
	off(event: 'activityStarted', callback?: (args: AndroidActivityEventData) => void, thisArg?: any): void;
	off(event: 'activityPaused', callback?: (args: AndroidActivityEventData) => void, thisArg?: any): void;
	off(event: 'activityResumed', callback?: (args: AndroidActivityEventData) => void, thisArg?: any): void;
	off(event: 'activityStopped', callback?: (args: AndroidActivityEventData) => void, thisArg?: any): void;
	off(event: 'saveActivityState', callback?: (args: AndroidActivityBundleEventData) => void, thisArg?: any): void;
	off(event: 'activityResult', callback?: (args: AndroidActivityResultEventData) => void, thisArg?: any): void;
	off(event: 'activityBackPressed', callback?: (args: AndroidActivityBackPressedEventData) => void, thisArg?: any): void;
	off(event: 'activityNewIntent', callback?: (args: AndroidActivityNewIntentEventData) => void, thisArg?: any): void;
	off(event: 'activityRequestPermissions', callback?: (args: AndroidActivityRequestPermissionsEventData) => void, thisArg?: any): void;
	off(event: 'sceneWillConnect', callback?: (args: SceneEventData) => void, thisArg?: any): void;
	off(event: 'sceneDidActivate', callback?: (args: SceneEventData) => void, thisArg?: any): void;
	off(event: 'sceneWillResignActive', callback?: (args: SceneEventData) => void, thisArg?: any): void;
	off(event: 'sceneWillEnterForeground', callback?: (args: SceneEventData) => void, thisArg?: any): void;
	off(event: 'sceneDidEnterBackground', callback?: (args: SceneEventData) => void, thisArg?: any): void;
	off(event: 'sceneDidDisconnect', callback?: (args: SceneEventData) => void, thisArg?: any): void;
	off(event: 'sceneOpenURLContexts', callback?: (args: SceneOpenURLContextsEventData) => void, thisArg?: any): void;
	off(event: 'sceneContinueUserActivity', callback?: (args: SceneContinueUserActivityEventData) => void, thisArg?: any): void;
	off(event: 'scenePerformActionForShortcutItem', callback?: (args: ScenePerformActionForShortcutItemEventData) => void, thisArg?: any): void;

	/**
	 * Removes a listener for the specified event name. Omitting the callback removes every
	 * listener registered for that event on this window.
	 */
	off(eventName: string, callback?: (data: WindowBaseEventData) => void, thisArg?: any): void;
}

/**
 * A window surface that hosts a NativeScript view tree.
 *
 * Wraps a platform window (iOS UIWindowScene + UIWindow, Android Activity) and owns the
 * per-window root view, its CSS classes and its lifecycle events. Instances are created by
 * the framework as the platform connects surfaces; reach them through
 * `Application.primaryWindow`, `Application.getWindows()` or `Application.getWindowById()`,
 * and use `ios` / `android` to get at the native objects.
 */
export abstract class NativeWindow extends WindowBase {
	/**
	 * The root view currently hosted by this window, if any.
	 */
	readonly rootView: View;

	/**
	 * Sets the content of this window.
	 *
	 * Replaces any content set earlier, tears the previous root view down and raises
	 * `contentLoaded`.
	 *
	 * @param content A View, a NavigationEntry, or the name of a module to load.
	 */
	setContent(content: View | NavigationEntry | string): void;

	/**
	 * The current orientation of this window.
	 *
	 * Read from the native surface while the window is attached; a detached window reports
	 * the last value it saw. A read that catches a change the platform has not reported yet
	 * also raises `orientationChanged`, so a change is never swallowed by the reading.
	 */
	orientation(): 'portrait' | 'landscape' | 'unknown';

	/**
	 * The current system appearance of this window.
	 *
	 * Read from the native surface while the window is attached; a detached window reports
	 * the last value it saw. A read that catches a change the platform has not reported yet
	 * also raises `systemAppearanceChanged`, so a change is never swallowed by the reading.
	 */
	systemAppearance(): 'light' | 'dark' | null;

	/**
	 * The current layout direction of this window.
	 *
	 * Read from the native surface while the window is attached; a detached window reports
	 * the last value it saw. A read that catches a change the platform has not reported yet
	 * also raises `layoutDirectionChanged`, so a change is never swallowed by the reading.
	 */
	layoutDirection(): CoreTypes.LayoutDirectionType | null;

	/**
	 * Raised when the root view content of this window is set or changed.
	 *
	 * Bringing a window up follows a fixed order that app code can rely on:
	 * Application `ready` -> Application `windowOpen` -> the raw platform connect/create
	 * event (`sceneWillConnect` / `activityCreated`) -> content resolution (the window
	 * content resolver, or the legacy `launch` bridge for the first window) ->
	 * `contentLoaded` -> `activate` and `displayed`.
	 */
	on(event: 'contentLoaded', callback: (data: NativeWindowEventData) => void, thisArg?: any): void;

	// The whole inherited set is repeated below: an override only covers the overloads it
	// lists, so declaring `contentLoaded` alone would hide every WindowBase event. See
	// WindowBase for what each of them means.
	on(event: 'activate', callback: (data: NativeWindowEventData) => void, thisArg?: any): void;
	on(event: 'deactivate', callback: (data: NativeWindowEventData) => void, thisArg?: any): void;
	on(event: 'background', callback: (data: NativeWindowEventData) => void, thisArg?: any): void;
	on(event: 'foreground', callback: (data: NativeWindowEventData) => void, thisArg?: any): void;
	on(event: 'attached', callback: (data: NativeWindowEventData) => void, thisArg?: any): void;
	on(event: 'detached', callback: (data: NativeWindowEventData) => void, thisArg?: any): void;
	on(event: 'close', callback: (data: NativeWindowEventData) => void, thisArg?: any): void;
	on(event: 'displayed', callback: (data: NativeWindowEventData) => void, thisArg?: any): void;
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
	on(eventName: string, callback: (data: NativeWindowEventData) => void, thisArg?: any): void;

	once(event: 'contentLoaded', callback: (data: NativeWindowEventData) => void, thisArg?: any): void;
	once(event: 'activate', callback: (data: NativeWindowEventData) => void, thisArg?: any): void;
	once(event: 'deactivate', callback: (data: NativeWindowEventData) => void, thisArg?: any): void;
	once(event: 'background', callback: (data: NativeWindowEventData) => void, thisArg?: any): void;
	once(event: 'foreground', callback: (data: NativeWindowEventData) => void, thisArg?: any): void;
	once(event: 'attached', callback: (data: NativeWindowEventData) => void, thisArg?: any): void;
	once(event: 'detached', callback: (data: NativeWindowEventData) => void, thisArg?: any): void;
	once(event: 'close', callback: (data: NativeWindowEventData) => void, thisArg?: any): void;
	once(event: 'displayed', callback: (data: NativeWindowEventData) => void, thisArg?: any): void;
	once(event: 'orientationChanged', callback: (data: WindowOrientationChangedEventData) => void, thisArg?: any): void;
	once(event: 'systemAppearanceChanged', callback: (data: WindowSystemAppearanceChangedEventData) => void, thisArg?: any): void;
	once(event: 'layoutDirectionChanged', callback: (data: WindowLayoutDirectionChangedEventData) => void, thisArg?: any): void;
	once(event: 'activityCreated', callback: (args: AndroidActivityBundleEventData) => void, thisArg?: any): void;
	once(event: 'activityDestroyed', callback: (args: AndroidActivityEventData) => void, thisArg?: any): void;
	once(event: 'activityStarted', callback: (args: AndroidActivityEventData) => void, thisArg?: any): void;
	once(event: 'activityPaused', callback: (args: AndroidActivityEventData) => void, thisArg?: any): void;
	once(event: 'activityResumed', callback: (args: AndroidActivityEventData) => void, thisArg?: any): void;
	once(event: 'activityStopped', callback: (args: AndroidActivityEventData) => void, thisArg?: any): void;
	once(event: 'saveActivityState', callback: (args: AndroidActivityBundleEventData) => void, thisArg?: any): void;
	once(event: 'activityResult', callback: (args: AndroidActivityResultEventData) => void, thisArg?: any): void;
	once(event: 'activityBackPressed', callback: (args: AndroidActivityBackPressedEventData) => void, thisArg?: any): void;
	once(event: 'activityNewIntent', callback: (args: AndroidActivityNewIntentEventData) => void, thisArg?: any): void;
	once(event: 'activityRequestPermissions', callback: (args: AndroidActivityRequestPermissionsEventData) => void, thisArg?: any): void;
	once(event: 'sceneWillConnect', callback: (args: SceneEventData) => void, thisArg?: any): void;
	once(event: 'sceneDidActivate', callback: (args: SceneEventData) => void, thisArg?: any): void;
	once(event: 'sceneWillResignActive', callback: (args: SceneEventData) => void, thisArg?: any): void;
	once(event: 'sceneWillEnterForeground', callback: (args: SceneEventData) => void, thisArg?: any): void;
	once(event: 'sceneDidEnterBackground', callback: (args: SceneEventData) => void, thisArg?: any): void;
	once(event: 'sceneDidDisconnect', callback: (args: SceneEventData) => void, thisArg?: any): void;
	once(event: 'sceneOpenURLContexts', callback: (args: SceneOpenURLContextsEventData) => void, thisArg?: any): void;
	once(event: 'sceneContinueUserActivity', callback: (args: SceneContinueUserActivityEventData) => void, thisArg?: any): void;
	once(event: 'scenePerformActionForShortcutItem', callback: (args: ScenePerformActionForShortcutItemEventData) => void, thisArg?: any): void;
	once(eventName: string, callback: (data: NativeWindowEventData) => void, thisArg?: any): void;

	off(event: 'contentLoaded', callback?: (data: NativeWindowEventData) => void, thisArg?: any): void;
	off(event: 'activate', callback?: (data: NativeWindowEventData) => void, thisArg?: any): void;
	off(event: 'deactivate', callback?: (data: NativeWindowEventData) => void, thisArg?: any): void;
	off(event: 'background', callback?: (data: NativeWindowEventData) => void, thisArg?: any): void;
	off(event: 'foreground', callback?: (data: NativeWindowEventData) => void, thisArg?: any): void;
	off(event: 'attached', callback?: (data: NativeWindowEventData) => void, thisArg?: any): void;
	off(event: 'detached', callback?: (data: NativeWindowEventData) => void, thisArg?: any): void;
	off(event: 'close', callback?: (data: NativeWindowEventData) => void, thisArg?: any): void;
	off(event: 'displayed', callback?: (data: NativeWindowEventData) => void, thisArg?: any): void;
	off(event: 'orientationChanged', callback?: (data: WindowOrientationChangedEventData) => void, thisArg?: any): void;
	off(event: 'systemAppearanceChanged', callback?: (data: WindowSystemAppearanceChangedEventData) => void, thisArg?: any): void;
	off(event: 'layoutDirectionChanged', callback?: (data: WindowLayoutDirectionChangedEventData) => void, thisArg?: any): void;
	off(event: 'activityCreated', callback?: (args: AndroidActivityBundleEventData) => void, thisArg?: any): void;
	off(event: 'activityDestroyed', callback?: (args: AndroidActivityEventData) => void, thisArg?: any): void;
	off(event: 'activityStarted', callback?: (args: AndroidActivityEventData) => void, thisArg?: any): void;
	off(event: 'activityPaused', callback?: (args: AndroidActivityEventData) => void, thisArg?: any): void;
	off(event: 'activityResumed', callback?: (args: AndroidActivityEventData) => void, thisArg?: any): void;
	off(event: 'activityStopped', callback?: (args: AndroidActivityEventData) => void, thisArg?: any): void;
	off(event: 'saveActivityState', callback?: (args: AndroidActivityBundleEventData) => void, thisArg?: any): void;
	off(event: 'activityResult', callback?: (args: AndroidActivityResultEventData) => void, thisArg?: any): void;
	off(event: 'activityBackPressed', callback?: (args: AndroidActivityBackPressedEventData) => void, thisArg?: any): void;
	off(event: 'activityNewIntent', callback?: (args: AndroidActivityNewIntentEventData) => void, thisArg?: any): void;
	off(event: 'activityRequestPermissions', callback?: (args: AndroidActivityRequestPermissionsEventData) => void, thisArg?: any): void;
	off(event: 'sceneWillConnect', callback?: (args: SceneEventData) => void, thisArg?: any): void;
	off(event: 'sceneDidActivate', callback?: (args: SceneEventData) => void, thisArg?: any): void;
	off(event: 'sceneWillResignActive', callback?: (args: SceneEventData) => void, thisArg?: any): void;
	off(event: 'sceneWillEnterForeground', callback?: (args: SceneEventData) => void, thisArg?: any): void;
	off(event: 'sceneDidEnterBackground', callback?: (args: SceneEventData) => void, thisArg?: any): void;
	off(event: 'sceneDidDisconnect', callback?: (args: SceneEventData) => void, thisArg?: any): void;
	off(event: 'sceneOpenURLContexts', callback?: (args: SceneOpenURLContextsEventData) => void, thisArg?: any): void;
	off(event: 'sceneContinueUserActivity', callback?: (args: SceneContinueUserActivityEventData) => void, thisArg?: any): void;
	off(event: 'scenePerformActionForShortcutItem', callback?: (args: ScenePerformActionForShortcutItemEventData) => void, thisArg?: any): void;
	off(eventName: string, callback?: (data: NativeWindowEventData) => void, thisArg?: any): void;
}
