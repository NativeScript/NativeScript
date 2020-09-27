import { View } from '../ui/core/view';
import { Page } from '../ui/page';
import { AccessibilityBlurEventData, AccessibilityFocusChangedEventData, AccessibilityFocusEventData } from './accessibility-types';

const lastFocusedViewOnPageKeyName = '__lastFocusedViewOnPage';

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
export function notifyAccessibilityFocusState(view: View, receivedFocus: boolean, lostFocus: boolean): void {
	if (!receivedFocus && !lostFocus) {
		return;
	}

	view.notify({
		eventName: View.accessibilityFocusChangedEvent,
		object: view,
		value: !!receivedFocus,
	} as AccessibilityFocusChangedEventData);

	if (receivedFocus) {
		if (view.page) {
			view.page[lastFocusedViewOnPageKeyName] = new WeakRef(view);
		}

		view.notify({
			eventName: View.accessibilityFocusEvent,
			object: view,
		} as AccessibilityFocusEventData);
	} else if (lostFocus) {
		view.notify({
			eventName: View.accessibilityBlurEvent,
			object: view,
		} as AccessibilityBlurEventData);
	}
}

export function getLastFocusedViewOnPage(page: Page): View | null {
	try {
		const lastFocusedViewRef = page[lastFocusedViewOnPageKeyName] as WeakRef<View>;
		if (!lastFocusedViewRef) {
			return null;
		}

		const lastFocusedView = lastFocusedViewRef.get();
		if (!lastFocusedView) {
			return null;
		}

		if (!lastFocusedView.parent || lastFocusedView.page !== page) {
			return null;
		}

		return lastFocusedView;
	} catch {
		// ignore
	} finally {
		delete page[lastFocusedViewOnPageKeyName];
	}

	return null;
}
