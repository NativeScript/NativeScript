import { View } from '../ui/core/view';
import { Observable } from '../data/observable';

/**
 * Is Android TalkBack or iOS VoiceOver enabled?
 */
export function isAccessibilityServiceEnabled(): boolean;

export function initA11YView(view: View): void;

export function updateAccessibilityProperties(view: View): void;

/**
 * Android helper function for triggering accessiblity events
 */
export function sendAccessibilityEvent(View: View, eventName: string, text?: string): void;

/**
 * Update the content description for android views
 */
export function updateContentDescription(View: View, forceUpdate?: boolean): string;

/**
 * Send notification when accessibility focus state changes.
 * If either receivedFocus or lostFocus is true, 'accessibilityFocusChanged' is send with value true if element received focus
 * If receivedFocus, 'accessibilityFocus' is send
 * if lostFocus, 'accessibilityBlur' is send
 *
 * @param {View} view
 * @param {boolean} receivedFocus
 * @param {boolean} lostFocus
 */
export function notifyAccessibilityFocusState(view: View, receivedFocus: boolean, lostFocus: boolean): void;

export class AccessibilityServiceEnabledObservable extends Observable {
	public readonly accessibilityServiceEnabled?: boolean;
}
