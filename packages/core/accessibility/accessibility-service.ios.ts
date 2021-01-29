import * as Application from '../application';
import { Observable } from '../data/observable';
import { Trace } from '../trace';
import { AccessibilityServiceEnabledPropName, CommonA11YServiceEnabledObservable, SharedA11YObservable } from './accessibility-service-common';

export function isAccessibilityServiceEnabled(): boolean {
	return getSharedA11YObservable().accessibilityServiceEnabled;
}

export function getAndroidAccessibilityManager(): null {
	return null;
}

let sharedA11YObservable: SharedA11YObservable;
let nativeObserver;

function getSharedA11YObservable(): SharedA11YObservable {
	if (sharedA11YObservable) {
		return sharedA11YObservable;
	}

	sharedA11YObservable = new SharedA11YObservable();

	let isVoiceOverRunning: () => boolean;
	if (typeof UIAccessibilityIsVoiceOverRunning === 'function') {
		isVoiceOverRunning = UIAccessibilityIsVoiceOverRunning;
	} else {
		if (typeof UIAccessibilityIsVoiceOverRunning !== 'function') {
			Trace.write(`UIAccessibilityIsVoiceOverRunning() - is not a function`, Trace.categories.Accessibility, Trace.messageType.error);

			isVoiceOverRunning = () => false;
		}
	}

	sharedA11YObservable.set(AccessibilityServiceEnabledPropName, isVoiceOverRunning());

	let voiceOverStatusChangedNotificationName: string | null = null;
	if (typeof UIAccessibilityVoiceOverStatusDidChangeNotification !== 'undefined') {
		// iOS 11+
		voiceOverStatusChangedNotificationName = UIAccessibilityVoiceOverStatusDidChangeNotification;
	} else if (typeof UIAccessibilityVoiceOverStatusChanged !== 'undefined') {
		// iOS <11
		voiceOverStatusChangedNotificationName = UIAccessibilityVoiceOverStatusChanged;
	}

	if (voiceOverStatusChangedNotificationName) {
		nativeObserver = Application.ios.addNotificationObserver(voiceOverStatusChangedNotificationName, () => {
			sharedA11YObservable?.set(AccessibilityServiceEnabledPropName, isVoiceOverRunning());
		});

		Application.on(Application.exitEvent, () => {
			if (nativeObserver) {
				Application.ios.removeNotificationObserver(nativeObserver, voiceOverStatusChangedNotificationName);
			}

			nativeObserver = null;

			if (sharedA11YObservable) {
				sharedA11YObservable.removeEventListener(Observable.propertyChangeEvent);

				sharedA11YObservable = null;
			}
		});
	}

	Application.on(Application.resumeEvent, () => sharedA11YObservable.set(AccessibilityServiceEnabledPropName, isVoiceOverRunning()));

	return sharedA11YObservable;
}

export class AccessibilityServiceEnabledObservable extends CommonA11YServiceEnabledObservable {
	constructor() {
		super(getSharedA11YObservable());
	}
}
