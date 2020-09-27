import { Observable } from 'index';
import * as Application from '../application';
import { AccessibilityServiceEnabledPropName, CommonA11YServiceEnabledObservable, SharedA11YObservable } from './accessibility-service-common';
import { Trace } from '../trace';

export function isAccessibilityServiceEnabled(): boolean {
	return getSharedA11YObservable().accessibilityServiceEnabled;
}

let sharedA11YObservable: SharedA11YObservable;
let notificationObserver: NSNotification;

function getSharedA11YObservable(): SharedA11YObservable {
	if (sharedA11YObservable) {
		return sharedA11YObservable;
	}

	sharedA11YObservable = new Observable() as SharedA11YObservable;

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
		notificationObserver = Application.ios.addNotificationObserver(voiceOverStatusChangedNotificationName, () => {
			if (sharedA11YObservable) {
				sharedA11YObservable.set(AccessibilityServiceEnabledPropName, isVoiceOverRunning());
			}
		});

		Application.on(Application.exitEvent, () => {
			if (notificationObserver) {
				Application.ios.removeNotificationObserver(notificationObserver, voiceOverStatusChangedNotificationName);
			}

			notificationObserver = null;
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
