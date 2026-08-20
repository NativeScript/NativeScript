import type { CoreTypes } from '../core-types';
import type { EventData } from '../data/observable';
import type { View } from '../ui/core/view';
import type { NavigationEntry } from '../ui/frame/frame-interfaces';
import type { NativeWindow, WindowBase } from '.';

/**
 * Events emitted by a NativeWindow instance.
 */
export const NativeWindowEvents = {
	/** Fired when the window becomes the active/focused window. */
	activate: 'activate',
	/** Fired when the window loses focus. */
	deactivate: 'deactivate',
	/** Fired when the window enters the background. */
	background: 'background',
	/** Fired when the window enters the foreground. */
	foreground: 'foreground',
	/**
	 * Fired when the window session ends for good. Fires at most once per window;
	 * every listener on the window is dropped right after it is dispatched.
	 */
	close: 'close',
	/** Fired when a native surface is bound to the window, both on first connect and on every re-attach. */
	attached: 'attached',
	/**
	 * Fired when the native surface goes away while the window session stays alive
	 * (iOS scene disconnect, Android activity recreation). The window stays registered
	 * and keeps its listeners, so the same instance is reused when `attached` fires again.
	 */
	detached: 'detached',
	/** Fired after the window content has been displayed for the first time. */
	displayed: 'displayed',
	/** Fired when the root view content is set or changed. */
	contentLoaded: 'contentLoaded',
	/** Fired when the orientation of this window changes. */
	orientationChanged: 'orientationChanged',
	/** Fired when the system appearance of this window changes between light and dark. */
	systemAppearanceChanged: 'systemAppearanceChanged',
	/** Fired when the layout direction of this window changes between ltr and rtl. */
	layoutDirectionChanged: 'layoutDirectionChanged',

	// iOS scene lifecycle events
	/** Fired when the scene is about to connect (iOS only). */
	sceneWillConnect: 'sceneWillConnect',
	/** Fired when the scene becomes active (iOS only). */
	sceneDidActivate: 'sceneDidActivate',
	/** Fired when the scene is about to resign active state (iOS only). */
	sceneWillResignActive: 'sceneWillResignActive',
	/** Fired when the scene is about to enter the foreground (iOS only). */
	sceneWillEnterForeground: 'sceneWillEnterForeground',
	/** Fired when the scene has entered the background (iOS only). */
	sceneDidEnterBackground: 'sceneDidEnterBackground',
	/** Fired when the scene has disconnected (iOS only). */
	sceneDidDisconnect: 'sceneDidDisconnect',
	/** Fired when the scene is asked to open one or more URLs (iOS only). */
	sceneOpenURLContexts: 'sceneOpenURLContexts',
	/** Fired when the scene is asked to continue a handoff/universal link activity (iOS only). */
	sceneContinueUserActivity: 'sceneContinueUserActivity',
	/** Fired when a home screen quick action is directed at the scene (iOS only). */
	scenePerformActionForShortcutItem: 'scenePerformActionForShortcutItem',

	// Android activity lifecycle events
	/** Fired when the activity is created (Android only). */
	activityCreated: 'activityCreated',
	/** Fired when the activity is destroyed (Android only). */
	activityDestroyed: 'activityDestroyed',
	/** Fired when the activity is started (Android only). */
	activityStarted: 'activityStarted',
	/** Fired when the activity is paused (Android only). */
	activityPaused: 'activityPaused',
	/** Fired when the activity is resumed (Android only). */
	activityResumed: 'activityResumed',
	/** Fired when the activity is stopped (Android only). */
	activityStopped: 'activityStopped',
	/** Fired when the activity state is being saved (Android only). */
	saveActivityState: 'saveActivityState',
	/** Fired when the activity receives a result (Android only). */
	activityResult: 'activityResult',
	/** Fired when the back button is pressed (Android only). */
	activityBackPressed: 'activityBackPressed',
	/** Fired when the activity receives a new intent (Android only). */
	activityNewIntent: 'activityNewIntent',
	/** Fired when permission results are received (Android only). */
	activityRequestPermissions: 'activityRequestPermissions',
} as const;

export type NativeWindowEventName = (typeof NativeWindowEvents)[keyof typeof NativeWindowEvents];

/**
 * Application-level events related to window management.
 */
export const WindowEvents = {
	/** Fired on Application when a new NativeWindow is created. */
	windowOpen: 'windowOpen',
	/** Fired on Application when a NativeWindow is closed/destroyed. */
	windowClose: 'windowClose',
	/** Fired on Application when another window takes over the primary role. */
	primaryWindowChanged: 'primaryWindowChanged',
} as const;

/**
 * Base event data for window surface events.
 */
export interface WindowBaseEventData extends EventData {
	/** The window that emitted the event. */
	window: WindowBase;
}

/**
 * Base event data for NativeWindow events.
 */
export interface NativeWindowEventData extends WindowBaseEventData {
	/** The NativeWindow that emitted the event. */
	window: NativeWindow;
}

/**
 * Event data for the `orientationChanged` event of a NativeWindow.
 */
export interface WindowOrientationChangedEventData extends NativeWindowEventData {
	/** The orientation the window is now in. */
	newValue: 'portrait' | 'landscape' | 'unknown';
}

/**
 * Event data for the `systemAppearanceChanged` event of a NativeWindow.
 */
export interface WindowSystemAppearanceChangedEventData extends NativeWindowEventData {
	/** The system appearance the window is now showing. */
	newValue: 'light' | 'dark';
}

/**
 * Event data for the `layoutDirectionChanged` event of a NativeWindow.
 */
export interface WindowLayoutDirectionChangedEventData extends NativeWindowEventData {
	/** The layout direction the window is now using. */
	newValue: CoreTypes.LayoutDirectionType;
}

/**
 * Event data fired on Application when a window opens.
 */
export interface WindowOpenEventData extends EventData {
	/** The NativeWindow that was opened. */
	window: NativeWindow;
}

/**
 * Event data fired on Application when a window closes.
 */
export interface WindowCloseEventData extends EventData {
	/** The NativeWindow that was closed. */
	window: NativeWindow;
}

/**
 * Event data fired on Application when the primary window changes.
 */
export interface PrimaryWindowChangedEventData extends EventData {
	/** The NativeWindow that is now primary. */
	window: NativeWindow;
}

/**
 * Options for opening a new window.
 */
export interface WindowOpenOptions {
	/**
	 * Data to pass to the new window.
	 * On iOS: serialized into NSUserActivity.userInfo.
	 * On Android: added as intent extras.
	 */
	data?: Record<string, any>;
}

/**
 * Supplies the UI for a window that needs content. Called once per window that needs it.
 *
 * Return a `View`, a `NavigationEntry` or a module name to set the window content,
 * `null` to take ownership and set the content asynchronously later, or `undefined`
 * to fall back to the application main entry.
 */
export type WindowContentResolver = (request: WindowContentRequest) => View | NavigationEntry | string | null | undefined;

/**
 * Describes the window asking for content.
 */
export interface WindowContentRequest {
	/** The window that needs content. */
	window: NativeWindow;
	/** Whether the window is the application's primary window. */
	isPrimary: boolean;
	/** NSUserActivity.userInfo on iOS, intent extras on Android. */
	data?: Record<string, any>;
	ios?: {
		connectionOptions?: UISceneConnectionOptions;
	};
	android?: {
		intent?: android.content.Intent;
		savedInstanceState?: android.os.Bundle;
	};
}
