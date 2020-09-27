import { Observable } from 'index';
import * as Application from '../application';
import * as utils from '../utils/utils';
import { AccessibilityServiceEnabledPropName, CommonA11YServiceEnabledObservable } from './accessibility-service-common';
import { Trace } from '../trace';

type AccessibilityManagerCompat = androidx.core.view.accessibility.AccessibilityManagerCompat;
const AccessibilityManagerCompat = androidx.core.view.accessibility.AccessibilityManagerCompat;
type TouchExplorationStateChangeListener = androidx.core.view.accessibility.AccessibilityManagerCompat.TouchExplorationStateChangeListener;
const TouchExplorationStateChangeListener = androidx.core.view.accessibility.AccessibilityManagerCompat.TouchExplorationStateChangeListener;
type AccessibilityStateChangeListener = androidx.core.view.accessibility.AccessibilityManagerCompat.AccessibilityStateChangeListener;
const AccessibilityStateChangeListener = androidx.core.view.accessibility.AccessibilityManagerCompat.AccessibilityStateChangeListener;

type AccessibilityManager = android.view.accessibility.AccessibilityManager;
const AccessibilityManager = android.view.accessibility.AccessibilityManager;

function getA11YManager(): AccessibilityManager | null {
	const context = utils.ad.getApplicationContext() as android.content.Context;
	if (!context) {
		return null;
	}

	return context.getSystemService(android.content.Context.ACCESSIBILITY_SERVICE) as AccessibilityManager;
}

interface SharedA11YObservable extends CommonA11YServiceEnabledObservable {
	a11yStateEnabled?: boolean;
	touchExplorationStateEnabled?: boolean;
}

let accessibilityStateChangeListener: AccessibilityStateChangeListener;
let touchExplorationStateChangeListener: TouchExplorationStateChangeListener;
let sharedA11YObservable: SharedA11YObservable;

const A11yStateEnabledPropName = 'a11yStateEnabled';
const TouchExplorationStateEnabledPropName = 'touchExplorationStateEnabled';

function updateState(): void {
	const a11yManager = getA11YManager();
	if (!a11yManager) {
		return;
	}

	sharedA11YObservable.set(A11yStateEnabledPropName, !!a11yManager.isEnabled());
	sharedA11YObservable.set(TouchExplorationStateEnabledPropName, !!a11yManager.isTouchExplorationEnabled());
}

function ensureStateListener(): SharedA11YObservable {
	if (accessibilityStateChangeListener) {
		return sharedA11YObservable;
	}

	const a11yManager = getA11YManager();
	sharedA11YObservable = new Observable() as SharedA11YObservable;
	Object.defineProperty(sharedA11YObservable, AccessibilityServiceEnabledPropName, {
		get(this: SharedA11YObservable) {
			return !!this[A11yStateEnabledPropName] && !!this[TouchExplorationStateEnabledPropName];
		},
	});

	if (!a11yManager) {
		sharedA11YObservable.set(A11yStateEnabledPropName, false);
		sharedA11YObservable.set(TouchExplorationStateEnabledPropName, false);

		return sharedA11YObservable;
	}

	accessibilityStateChangeListener = new AccessibilityStateChangeListener({
		onAccessibilityStateChanged(enabled) {
			updateState();

			if (Trace.isEnabled()) {
				Trace.write(`AccessibilityStateChangeListener state changed to: ${!!enabled}`, Trace.categories.Accessibility);
			}
		},
	});

	touchExplorationStateChangeListener = new TouchExplorationStateChangeListener({
		onTouchExplorationStateChanged(enabled) {
			updateState();

			if (Trace.isEnabled()) {
				Trace.write(`TouchExplorationStateChangeListener state changed to: ${!!enabled}`, Trace.categories.Accessibility);
			}
		},
	});

	AccessibilityManagerCompat.addAccessibilityStateChangeListener(a11yManager, accessibilityStateChangeListener);
	AccessibilityManagerCompat.addTouchExplorationStateChangeListener(a11yManager, touchExplorationStateChangeListener);

	updateState();

	Application.on(Application.resumeEvent, updateState);

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

	const a11yManager = getA11YManager();
	if (a11yManager) {
		if (accessibilityStateChangeListener) {
			AccessibilityManagerCompat.removeAccessibilityStateChangeListener(a11yManager, accessibilityStateChangeListener);
		}

		if (touchExplorationStateChangeListener) {
			AccessibilityManagerCompat.removeTouchExplorationStateChangeListener(a11yManager, touchExplorationStateChangeListener);
		}
	}

	accessibilityStateChangeListener = null;
	touchExplorationStateChangeListener = null;

	if (sharedA11YObservable) {
		sharedA11YObservable.removeEventListener(Observable.propertyChangeEvent);
		sharedA11YObservable = null;
	}

	Application.off(Application.resumeEvent, updateState);
});

export class AccessibilityServiceEnabledObservable extends CommonA11YServiceEnabledObservable {
	constructor() {
		super(ensureStateListener());
	}
}
