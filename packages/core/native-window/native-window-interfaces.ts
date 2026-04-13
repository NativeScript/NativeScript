import type { EventData } from '../data/observable';
import type { View } from '../ui/core/view';
import type { NavigationEntry } from '../ui/frame/frame-interfaces';
import type { CoreTypes } from '../core-types';

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
	/** Fired when the window is being closed/destroyed. */
	close: 'close',
	/** Fired after the window content has been displayed for the first time. */
	displayed: 'displayed',
	/** Fired when the root view content is set or changed. */
	contentLoaded: 'contentLoaded',
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
} as const;

/**
 * Base event data for NativeWindow events.
 */
export interface NativeWindowEventData extends EventData {
	/** The NativeWindow that emitted the event. */
	window: INativeWindow;
}

/**
 * Event data fired on Application when a window opens.
 */
export interface WindowOpenEventData extends EventData {
	/** The NativeWindow that was opened. */
	window: INativeWindow;
}

/**
 * Event data fired on Application when a window closes.
 */
export interface WindowCloseEventData extends EventData {
	/** The NativeWindow that was closed. */
	window: INativeWindow;
}

/**
 * Cross-platform NativeWindow interface.
 *
 * A NativeWindow represents a platform window surface:
 * - iOS: UIWindowScene + UIWindow
 * - Android: Activity
 *
 * Each NativeWindow manages its own root view, lifecycle events,
 * and platform-specific accessors.
 */
export interface INativeWindow {
	/**
	 * A stable identifier for this window.
	 * On iOS: derived from the UISceneSession persistentIdentifier.
	 * On Android: derived from the Activity hashCode.
	 */
	readonly id: string;

	/**
	 * Whether this is the primary (main) window.
	 * The first window created is typically the primary window.
	 * Application-level lifecycle events are bridged from the primary window.
	 */
	readonly isPrimary: boolean;

	/**
	 * The current root view of this window.
	 */
	readonly rootView: View;

	/**
	 * Set the content of this window.
	 * @param content A View instance, a NavigationEntry, or a module name string.
	 */
	setContent(content: View | NavigationEntry | string): void;

	/**
	 * Close this window.
	 * The primary window cannot be closed.
	 *
	 * iOS: requests scene session destruction.
	 * Android: finishes the activity.
	 */
	close(): void;

	/**
	 * The current orientation of this window.
	 */
	orientation(): 'portrait' | 'landscape' | 'unknown';

	/**
	 * The current system appearance (light/dark) for this window.
	 */
	systemAppearance(): 'light' | 'dark' | null;

	/**
	 * The current layout direction for this window.
	 */
	layoutDirection(): CoreTypes.LayoutDirectionType | null;

	/**
	 * iOS-specific accessors. Only available when running on iOS.
	 */
	readonly iosWindow?: {
		readonly scene: UIWindowScene;
		readonly window: UIWindow;
	};

	/**
	 * Android-specific accessors. Only available when running on Android.
	 */
	readonly androidWindow?: {
		readonly activity: androidx.appcompat.app.AppCompatActivity;
	};
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
