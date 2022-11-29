import { EventData, EventDataValue } from '../data/observable';
import type { View } from '../ui/core/view';
import type { Page } from '../ui/page';

const lastFocusedViewOnPageKeyName = '__lastFocusedViewOnPage';

export const accessibilityBlurEvent = 'accessibilityBlur';
export const accessibilityFocusEvent = 'accessibilityFocus';
export const accessibilityFocusChangedEvent = 'accessibilityFocusChanged';
export const accessibilityPerformEscapeEvent = 'accessibilityPerformEscape';

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
export function notifyAccessibilityFocusState(view: Partial<View>, receivedFocus: boolean, lostFocus: boolean): void {
	if (!receivedFocus && !lostFocus) {
		return;
	}

	view.notify({
		eventName: accessibilityFocusChangedEvent,
		object: view,
		value: !!receivedFocus,
	} as EventDataValue);

	if (receivedFocus) {
		if (view.page) {
			view.page[lastFocusedViewOnPageKeyName] = new WeakRef(view);
		}

		view.notify({
			eventName: accessibilityFocusEvent,
			object: view,
		} as EventData);
	} else if (lostFocus) {
		view.notify({
			eventName: accessibilityBlurEvent,
			object: view,
		} as EventData);
	}
}

export function getLastFocusedViewOnPage(page: Page): View | null {
	try {
		const lastFocusedViewRef = page[lastFocusedViewOnPageKeyName] as WeakRef<View>;
		if (!lastFocusedViewRef) {
			return null;
		}

		const lastFocusedView = lastFocusedViewRef.deref();
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
