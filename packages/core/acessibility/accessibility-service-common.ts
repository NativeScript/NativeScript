import { View } from '../ui/core/view';
import { Page } from '../ui/page';
import { Observable } from '../data/observable';
import { AccessibilityBlurEventData, AccessibilityFocusChangedEventData, AccessibilityFocusEventData } from './types';

const lastFocusedViewOnPageKeyName = '__lastFocusedViewOnPage';

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

export interface SharedA11YObservable extends Observable {
	readonly accessibilityServiceEnabled?: boolean;
}

export const AccessibilityServiceEnabledPropName = 'accessibilityServiceEnabled';

export class CommonA11YServiceEnabledObservable extends Observable {
	readonly accessibilityServiceEnabled: boolean;

	constructor(sharedA11YObservable: SharedA11YObservable) {
		super();

		const ref = new WeakRef(this);
		let lastValue: boolean;

		function callback() {
			const self = ref && ref.get();
			if (!self) {
				sharedA11YObservable.off(Observable.propertyChangeEvent, callback);

				return;
			}

			const newValue = sharedA11YObservable.accessibilityServiceEnabled;
			if (newValue !== lastValue) {
				self.set(AccessibilityServiceEnabledPropName, newValue);
				lastValue = newValue;
			}
		}

		sharedA11YObservable.on(Observable.propertyChangeEvent, callback);

		this.set(AccessibilityServiceEnabledPropName, sharedA11YObservable.accessibilityServiceEnabled);
	}
}
