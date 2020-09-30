import { Observable } from '../data/observable';

export class AccessibilityServiceEnabledObservable extends Observable {
	public readonly accessibilityServiceEnabled?: boolean;
}

/**
 * Get the Android platform's AccessibilityManager.
 */
export function getAndroidAccessibilityManager(): /* android.view.accessibility.AccessibilityManager */ any | null;
