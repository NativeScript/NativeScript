import { Observable } from 'index';
import * as Application from '../application';
import { AccessibilityServiceEnabledPropName, CommonA11YServiceEnabledObservable, SharedA11YObservable } from './accessibility-service-common';
import { Trace } from '../trace';

export function isAccessibilityServiceEnabled(): boolean {
	return getSharedA11YObservable().accessibilityServiceEnabled;
}

let sharedA11YObservable: SharedA11YObservable;
let nativeObserver: any;

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
		voiceOverStatusChangedNotificationName = UIAccessibilityVoiceOverStatusDidChangeNotification;
	} else if (typeof UIAccessibilityVoiceOverStatusChanged !== 'undefined') {
		voiceOverStatusChangedNotificationName = UIAccessibilityVoiceOverStatusChanged;
	}

	if (voiceOverStatusChangedNotificationName) {
		nativeObserver = Application.ios.addNotificationObserver(voiceOverStatusChangedNotificationName, () => {
			if (sharedA11YObservable) {
				sharedA11YObservable.set(AccessibilityServiceEnabledPropName, isVoiceOverRunning());
			}
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
