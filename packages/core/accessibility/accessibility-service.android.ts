import * as Application from '../application';
import { Observable } from '../data/observable';
import { Trace } from '../trace';
import * as Utils from '../utils';
import { CommonA11YServiceEnabledObservable, SharedA11YObservable } from './accessibility-service-common';

export function getAndroidAccessibilityManager(): android.view.accessibility.AccessibilityManager | null {
	const context = Utils.ad.getApplicationContext() as android.content.Context;
	if (!context) {
		return null;
	}

	return context.getSystemService(android.content.Context.ACCESSIBILITY_SERVICE) as android.view.accessibility.AccessibilityManager;
}

const accessibilityStateEnabledPropName = 'accessibilityStateEnabled';
const touchExplorationStateEnabledPropName = 'touchExplorationStateEnabled';

class AndroidSharedA11YObservable extends SharedA11YObservable {
	[accessibilityStateEnabledPropName]: boolean;
	[touchExplorationStateEnabledPropName]: boolean;

	// @ts-ignore todo: fix
	get accessibilityServiceEnabled(): boolean {
		return !!this[accessibilityStateEnabledPropName] && !!this[touchExplorationStateEnabledPropName];
	}

	set accessibilityServiceEnabled(v) {
		return;
	}
}

let accessibilityStateChangeListener: android.view.accessibility.AccessibilityManager.AccessibilityStateChangeListener;
let touchExplorationStateChangeListener: android.view.accessibility.AccessibilityManager.TouchExplorationStateChangeListener;
let sharedA11YObservable: AndroidSharedA11YObservable;

function updateAccessibilityState(): void {
	const accessibilityManager = getAndroidAccessibilityManager();
	if (!accessibilityManager) {
		sharedA11YObservable.set(accessibilityStateEnabledPropName, false);
		sharedA11YObservable.set(touchExplorationStateEnabledPropName, false);

		return;
	}

	sharedA11YObservable.set(accessibilityStateEnabledPropName, !!accessibilityManager.isEnabled());
	sharedA11YObservable.set(touchExplorationStateEnabledPropName, !!accessibilityManager.isTouchExplorationEnabled());
}

function ensureStateListener(): SharedA11YObservable {
	if (sharedA11YObservable) {
		return sharedA11YObservable;
	}

	const accessibilityManager = getAndroidAccessibilityManager();
	sharedA11YObservable = new AndroidSharedA11YObservable();

	if (!accessibilityManager) {
		sharedA11YObservable.set(accessibilityStateEnabledPropName, false);
		sharedA11YObservable.set(touchExplorationStateEnabledPropName, false);

		return sharedA11YObservable;
	}

	accessibilityStateChangeListener = new android.view.accessibility.AccessibilityManager.AccessibilityStateChangeListener({
		onAccessibilityStateChanged(enabled) {
			updateAccessibilityState();

			if (Trace.isEnabled()) {
				Trace.write(`AccessibilityStateChangeListener state changed to: ${!!enabled}`, Trace.categories.Accessibility);
			}
		},
	});

	touchExplorationStateChangeListener = new android.view.accessibility.AccessibilityManager.TouchExplorationStateChangeListener({
		onTouchExplorationStateChanged(enabled) {
			updateAccessibilityState();

			if (Trace.isEnabled()) {
				Trace.write(`TouchExplorationStateChangeListener state changed to: ${!!enabled}`, Trace.categories.Accessibility);
			}
		},
	});

	accessibilityManager.addAccessibilityStateChangeListener(accessibilityStateChangeListener);
	accessibilityManager.addTouchExplorationStateChangeListener(touchExplorationStateChangeListener);

	updateAccessibilityState();

	Application.on(Application.resumeEvent, updateAccessibilityState);

	return sharedA11YObservable;
}

export function isAccessibilityServiceEnabled(): boolean {
	return ensureStateListener().accessibilityServiceEnabled;
}

Application.on(Application.exitEvent, (args: Application.ApplicationEventData) => {
	const activity = args.android as android.app.Activity;
	if (activity && !activity.isFinishing()) {
		return;
	}

	const accessibilityManager = getAndroidAccessibilityManager();
	if (accessibilityManager) {
		if (accessibilityStateChangeListener) {
			accessibilityManager.removeAccessibilityStateChangeListener(accessibilityStateChangeListener);
		}

		if (touchExplorationStateChangeListener) {
			accessibilityManager.removeTouchExplorationStateChangeListener(touchExplorationStateChangeListener);
		}
	}

	accessibilityStateChangeListener = null;
	touchExplorationStateChangeListener = null;

	if (sharedA11YObservable) {
		sharedA11YObservable.removeEventListener(Observable.propertyChangeEvent);
		sharedA11YObservable = null;
	}

	Application.off(Application.resumeEvent, updateAccessibilityState);
});

export class AccessibilityServiceEnabledObservable extends CommonA11YServiceEnabledObservable {
	constructor() {
		super(ensureStateListener());
	}
}
