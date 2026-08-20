import type { EventData } from '../data/observable';
import type { NativeWindow } from './native-window-common';
import type { WindowBase } from './window-base';

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
