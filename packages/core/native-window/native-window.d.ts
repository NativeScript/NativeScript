import { NativeWindowCommon } from './native-window-common';
import type { INativeWindow, NativeWindowEventData } from './native-window-interfaces';

export { NativeWindowCommon } from './native-window-common';
export * from './native-window-interfaces';

/**
 * Cross-platform NativeWindow class.
 *
 * On iOS: wraps a UIWindowScene + UIWindow.
 * On Android: wraps an AppCompatActivity.
 *
 * Use `Application.primaryWindow` to get the main window,
 * or `Application.getWindows()` to get all active windows.
 */
export class NativeWindow extends NativeWindowCommon implements INativeWindow {
	readonly iosWindow:
		| {
				readonly scene: UIWindowScene;
				readonly window: UIWindow;
		  }
		| undefined;

	readonly androidWindow:
		| {
				readonly activity: androidx.appcompat.app.AppCompatActivity;
		  }
		| undefined;
	// Event methods (inherited from Observable)
	on(eventName: string, callback: (data: NativeWindowEventData) => void, thisArg?: any): void;
	once(eventName: string, callback: (data: NativeWindowEventData) => void, thisArg?: any): void;
	off(eventName: string, callback?: (data: NativeWindowEventData) => void, thisArg?: any): void;
}
