import type { View } from '../ui/core/view';
import { CoreTypes } from '../core-types';
import { SDK_VERSION } from '../utils/constants';
import { AndroidActivityCallbacks, NavigationEntry } from '../ui/frame/frame-common';
import { CALLBACKS } from '../ui/frame/frame-helper-for-android';
import { NativeWindow } from './native-window-common';
import type { WindowRole } from './window-base';

/**
 * Android implementation of NativeWindow.
 * Wraps an AppCompatActivity.
 */
export class AndroidNativeWindow extends NativeWindow {
	private _activity: WeakRef<androidx.appcompat.app.AppCompatActivity>;
	private _componentCallbacks: android.content.ComponentCallbacks2;
	private _componentCallbacksActivity: WeakRef<androidx.appcompat.app.AppCompatActivity>;

	constructor(activity: androidx.appcompat.app.AppCompatActivity, id?: string, isPrimary = false, role: WindowRole = 'application') {
		super(id, isPrimary, role);
		this._activity = new WeakRef(activity);
	}

	/**
	 * @internal – bind a recreated activity to this window session after a detach.
	 */
	_reattach(activity: androidx.appcompat.app.AppCompatActivity): void {
		this._activity = new WeakRef(activity);
		this._setState('attached');
	}

	/**
	 * @internal – observe the activity's own configuration.
	 *
	 * Registered on the activity rather than the application context: in multi-window
	 * and multi-display setups each activity gets its own configuration, and only these
	 * callbacks report the one this window actually renders with.
	 */
	_registerConfigurationCallbacks(): void {
		const activity = this.activity;
		if (!activity || this._componentCallbacks) {
			return;
		}

		const callbacks = new android.content.ComponentCallbacks2({
			onLowMemory(): void {
				// Handled application-wide.
			},
			onTrimMemory(level: number): void {
				// Handled application-wide.
			},
			onConfigurationChanged: (newConfiguration: android.content.res.Configuration): void => {
				this._setOrientation(this._getOrientationValue(newConfiguration));
				this._setSystemAppearance(this._getSystemAppearanceValue(newConfiguration));
				this._setLayoutDirection(this._getLayoutDirectionValue(newConfiguration));
			},
		});

		activity.registerComponentCallbacks(callbacks);
		this._componentCallbacks = callbacks;
		this._componentCallbacksActivity = new WeakRef(activity);
	}

	/**
	 * @internal – drop the configuration callbacks, so a recreated activity does not
	 * leave the previous one registered.
	 */
	_unregisterConfigurationCallbacks(): void {
		const callbacks = this._componentCallbacks;
		if (!callbacks) {
			return;
		}

		this._componentCallbacks = null;
		this._componentCallbacksActivity?.deref()?.unregisterComponentCallbacks(callbacks);
		this._componentCallbacksActivity = null;
	}

	_detach(): void {
		this._unregisterConfigurationCallbacks();
		super._detach();
	}

	/**
	 * The wrapped Android Activity (may be GC'd).
	 */
	get activity(): androidx.appcompat.app.AppCompatActivity | undefined {
		return this._activity?.deref();
	}

	get android() {
		const activity = this.activity;
		if (!activity) {
			return undefined;
		}
		return { activity };
	}

	/**
	 * Platform-specific: apply the view as root content of this Activity.
	 */
	protected _setNativeContent(view: View): void {
		const activity = this.activity;
		if (!activity) {
			throw new Error('NativeWindow: Activity is no longer available.');
		}

		const callbacks: AndroidActivityCallbacks = (activity as any)[CALLBACKS];
		if (!callbacks) {
			throw new Error('NativeWindow: Cannot find activity callbacks.');
		}
		callbacks.resetActivityContent(activity, view);
	}

	/**
	 * Close this window by finishing the activity.
	 */
	close(): void {
		if (this.isPrimary) {
			console.log('NativeWindow: Cannot close the primary window.');
			return;
		}

		const activity = this.activity;
		if (activity) {
			activity.finish();
		}
	}

	// --- Platform getters ---

	protected _getOrientation(): 'portrait' | 'landscape' | 'unknown' {
		const activity = this.activity;
		if (!activity) {
			return 'unknown';
		}
		const configuration = activity.getResources().getConfiguration();
		return this._getOrientationValue(configuration);
	}

	protected _getSystemAppearance(): 'light' | 'dark' | null {
		const activity = this.activity;
		if (!activity) {
			return null;
		}
		const configuration = activity.getResources().getConfiguration();
		return this._getSystemAppearanceValue(configuration);
	}

	protected _getLayoutDirection(): CoreTypes.LayoutDirectionType | null {
		const activity = this.activity;
		if (!activity) {
			return null;
		}
		const configuration = activity.getResources().getConfiguration();
		return this._getLayoutDirectionValue(configuration);
	}

	// --- Value converters ---

	_getOrientationValue(configuration: android.content.res.Configuration): 'portrait' | 'landscape' | 'unknown' {
		switch (configuration.orientation) {
			case android.content.res.Configuration.ORIENTATION_LANDSCAPE:
				return 'landscape';
			case android.content.res.Configuration.ORIENTATION_PORTRAIT:
				return 'portrait';
			default:
				return 'unknown';
		}
	}

	_getSystemAppearanceValue(configuration: android.content.res.Configuration): 'dark' | 'light' {
		const mode = configuration.uiMode & android.content.res.Configuration.UI_MODE_NIGHT_MASK;
		switch (mode) {
			case android.content.res.Configuration.UI_MODE_NIGHT_YES:
				return 'dark';
			case android.content.res.Configuration.UI_MODE_NIGHT_NO:
			case android.content.res.Configuration.UI_MODE_NIGHT_UNDEFINED:
			default:
				return 'light';
		}
	}

	_getLayoutDirectionValue(configuration: android.content.res.Configuration): CoreTypes.LayoutDirectionType {
		switch (configuration.getLayoutDirection()) {
			case android.view.View.LAYOUT_DIRECTION_RTL:
				return CoreTypes.LayoutDirection.rtl;
			case android.view.View.LAYOUT_DIRECTION_LTR:
			default:
				return CoreTypes.LayoutDirection.ltr;
		}
	}

	protected _onDestroy(): void {
		this._unregisterConfigurationCallbacks();
		super._onDestroy();
		this._activity = null;
	}

	/**
	 * Mints a window identity. Android has no stable activity id, so the value is kept
	 * in the activity saved state to survive recreation (rotation, theme change).
	 */
	static newWindowId(): string {
		return `window-${java.util.UUID.randomUUID().toString()}`;
	}
}
