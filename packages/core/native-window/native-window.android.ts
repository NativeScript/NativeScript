import type { View } from '../ui/core/view';
import { CoreTypes } from '../core-types';
import { SDK_VERSION } from '../utils/constants';
import { AndroidActivityCallbacks, NavigationEntry } from '../ui/frame/frame-common';
import { NativeWindow } from './native-window-common';

/**
 * Android implementation of NativeWindow.
 * Wraps an AppCompatActivity.
 */
export class AndroidNativeWindow extends NativeWindow {
	private _activity: WeakRef<androidx.appcompat.app.AppCompatActivity>;

	constructor(activity: androidx.appcompat.app.AppCompatActivity, id: string, isPrimary = false) {
		super(id, isPrimary);
		this._activity = new WeakRef(activity);
	}

	/**
	 * The wrapped Android Activity (may be GC'd).
	 */
	get activity(): androidx.appcompat.app.AppCompatActivity | undefined {
		return this._activity?.deref();
	}

	get androidWindow() {
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

		const callbacks: AndroidActivityCallbacks = (activity as any)['_callbacks'];
		if (!callbacks) {
			throw new Error('NativeWindow: Cannot find activity callbacks.');
		}
		callbacks.resetActivityContent(activity);
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

	/**
	 * @internal
	 */
	_destroy(): void {
		super._destroy();
		this._activity = null;
	}

	/**
	 * Gets a stable identifier from an Activity.
	 */
	static getActivityId(activity: androidx.appcompat.app.AppCompatActivity): string {
		return `activity-${activity.hashCode()}`;
	}
}
