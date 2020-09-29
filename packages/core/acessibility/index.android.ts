import * as Application from '../application';
import { Trace } from '../trace';
import type { View } from '../ui/core/view';
import type { ViewBase } from '../ui/core/view-base';
import { GestureTypes } from '../ui/gestures';
import * as utils from '../utils/utils';
import { accessibilityScrollOnFocusEvent, notifyAccessibilityFocusState } from './accessibility-common';
import { AccessibilityRole, AccessibilityState, AndroidAccessibilityEvent } from './accessibility-types';

export * from './accessibility-common';
export * from './accessibility-types';
export * from './fontscale-observable';

const AccessibilityEvent = android.view.accessibility.AccessibilityEvent;
type AccessibilityEvent = android.view.accessibility.AccessibilityEvent;
const AccessibilityManager = android.view.accessibility.AccessibilityManager;
type AccessibilityManager = android.view.accessibility.AccessibilityManager;
let AccessibilityDelegate = android.view.View.androidviewViewAccessibilityDelegate;
// WORKAROUND: Typing referes to android.view.View.androidviewViewAccessibilityDelegate but it is called android.view.View.AccessibilityDelegate at runtime
AccessibilityDelegate = android.view.View['AccessibilityDelegate'];
type AccessibilityDelegate = android.view.View.AccessibilityDelegate;
const AccessibilityNodeInfo = android.view.accessibility.AccessibilityNodeInfo;
type AccessibilityNodeInfo = android.view.accessibility.AccessibilityNodeInfo;
const AndroidView = android.view.View;
type AndroidView = android.view.View;
const AndroidViewGroup = android.view.ViewGroup;
type AndroidViewGroup = android.view.ViewGroup;

type AccessibilityManagerCompat = androidx.core.view.accessibility.AccessibilityManagerCompat;
const AccessibilityManagerCompat = androidx.core.view.accessibility.AccessibilityManagerCompat;
type TouchExplorationStateChangeListener = androidx.core.view.accessibility.AccessibilityManagerCompat.TouchExplorationStateChangeListener;
const TouchExplorationStateChangeListener = androidx.core.view.accessibility.AccessibilityManagerCompat.TouchExplorationStateChangeListener;
type AccessibilityStateChangeListener = androidx.core.view.accessibility.AccessibilityManagerCompat.AccessibilityStateChangeListener;
const AccessibilityStateChangeListener = androidx.core.view.accessibility.AccessibilityManagerCompat.AccessibilityStateChangeListener;

let clickableRolesMap = new Set<string>();

// Skip events triggered when a listview item is scrolled onto screen.
let suspendAccessibilityEvents = false;
let lastFocusedView: WeakRef<View>;
function accessibilityEventHelper(view: View, eventType: number) {
	const eventName = accessibilityEventTypeMap.get(eventType);
	if (!isAccessibilityServiceEnabled()) {
		if (Trace.isEnabled()) {
			Trace.write(`accessibilityEventHelper: Service not active`, Trace.categories.Accessibility);
		}

		return;
	}

	if (!eventName) {
		Trace.write(`accessibilityEventHelper: unknown eventType: ${eventType}`, Trace.categories.Accessibility, Trace.messageType.error);

		return;
	}

	if (!view) {
		if (Trace.isEnabled()) {
			Trace.write(`accessibilityEventHelper: no owner: ${eventName}`, Trace.categories.Accessibility);
		}

		return;
	}

	const androidView = view.nativeViewProtected as AndroidView;
	if (!androidView) {
		if (Trace.isEnabled()) {
			Trace.write(`accessibilityEventHelper: no nativeView`, Trace.categories.Accessibility);
		}

		return;
	}

	switch (eventType) {
		case AccessibilityEvent.TYPE_VIEW_CLICKED: {
			/**
			 * Android API >= 26 handles accessibility tap-events by converting them to TYPE_VIEW_CLICKED
			 * These aren't triggered for custom tap events in NativeScript.
			 */
			if (android.os.Build.VERSION.SDK_INT >= 26) {
				// Find all tap gestures and trigger them.
				for (const tapGesture of view.getGestureObservers(GestureTypes.tap) ?? []) {
					tapGesture.callback({
						android: view.android,
						eventName: 'tap',
						ios: null,
						object: view,
						type: GestureTypes.tap,
						view: view,
					});
				}
			}

			return;
		}
		case AccessibilityEvent.TYPE_VIEW_ACCESSIBILITY_FOCUSED: {
			const lastView = lastFocusedView?.get();
			if (lastView && view !== lastView) {
				const lastAndroidView = lastView.nativeViewProtected as AndroidView;
				if (lastAndroidView) {
					lastAndroidView.clearFocus();
					lastFocusedView = null;

					notifyAccessibilityFocusState(lastView, false, true);
				}
			}

			lastFocusedView = new WeakRef(view);

			notifyAccessibilityFocusState(view, true, false);

			const tree = new Array<string>();

			try {
				suspendAccessibilityEvents = true;
				for (let node: ViewBase = view; node; node = node.parent) {
					node.notify({
						eventName: accessibilityScrollOnFocusEvent,
						object: view,
					});

					tree.push(`${node}[${node.className || ''}]`);
				}

				if (Trace.isEnabled()) {
					Trace.write(`Focus-tree: ${tree.reverse().join(' => ')}`, Trace.categories.Accessibility);
				}
			} finally {
				suspendAccessibilityEvents = false;
			}

			return;
		}
		case AccessibilityEvent.TYPE_VIEW_ACCESSIBILITY_FOCUS_CLEARED: {
			const lastView = lastFocusedView?.get();
			if (lastView && view === lastView) {
				lastFocusedView = null;
				androidView.clearFocus();
			}

			notifyAccessibilityFocusState(view, false, true);

			return;
		}
	}
}

let TNSAccessibilityDelegate: AccessibilityDelegate;

const androidViewToTNSView = new WeakMap<AndroidView, WeakRef<View>>();

let accessibilityEventMap: Map<AndroidAccessibilityEvent, number>;
let accessibilityEventTypeMap: Map<number, string>;

function ensureNativeClasses() {
	if (TNSAccessibilityDelegate) {
		return;
	}

	const RoleTypeMap = new Map<AccessibilityRole, string>([
		[AccessibilityRole.Button, android.widget.Button.class.getName()],
		[AccessibilityRole.Search, android.widget.EditText.class.getName()],
		[AccessibilityRole.Image, android.widget.ImageView.class.getName()],
		[AccessibilityRole.ImageButton, android.widget.ImageButton.class.getName()],
		[AccessibilityRole.KeyboardKey, android.inputmethodservice.Keyboard.Key.class.getName()],
		[AccessibilityRole.StaticText, android.widget.TextView.class.getName()],
		[AccessibilityRole.Adjustable, android.widget.SeekBar.class.getName()],
		[AccessibilityRole.Checkbox, android.widget.CheckBox.class.getName()],
		[AccessibilityRole.RadioButton, android.widget.RadioButton.class.getName()],
		[AccessibilityRole.SpinButton, android.widget.Spinner.class.getName()],
		[AccessibilityRole.Switch, android.widget.Switch.class.getName()],
		[AccessibilityRole.ProgressBar, android.widget.ProgressBar.class.getName()],
	]);

	clickableRolesMap = new Set<string>([AccessibilityRole.Button, AccessibilityRole.ImageButton]);

	const ignoreRoleTypesForTrace = new Set([AccessibilityRole.Header, AccessibilityRole.Link, AccessibilityRole.None, AccessibilityRole.Summary]);

	class TNSAccessibilityDelegateImpl extends AccessibilityDelegate {
		constructor() {
			super();

			return global.__native(this);
		}

		private getTnsView(androidView: AndroidView) {
			const view = androidViewToTNSView.get(androidView)?.get();
			if (!view) {
				androidViewToTNSView.delete(androidView);

				return null;
			}

			return view;
		}

		public onInitializeAccessibilityNodeInfo(host: AndroidView, info: AccessibilityNodeInfo) {
			super.onInitializeAccessibilityNodeInfo(host, info);

			const view = this.getTnsView(host);
			if (!view) {
				if (Trace.isEnabled()) {
					Trace.write(`onInitializeAccessibilityNodeInfo ${host} ${info} no tns-view`, Trace.categories.Accessibility);
				}

				return;
			}

			const accessibilityRole = view.accessibilityRole as AccessibilityRole;
			if (accessibilityRole) {
				const androidClassName = RoleTypeMap.get(accessibilityRole);
				if (androidClassName) {
					const oldClassName = info.getClassName() || (android.os.Build.VERSION.SDK_INT >= 28 && host.getAccessibilityClassName()) || null;
					info.setClassName(androidClassName);

					if (Trace.isEnabled()) {
						Trace.write(`${view}.accessibilityRole = "${accessibilityRole}" is mapped to "${androidClassName}" (was ${oldClassName}). ${info.getClassName()}`, Trace.categories.Accessibility);
					}
				} else if (!ignoreRoleTypesForTrace.has(accessibilityRole as AccessibilityRole)) {
					if (Trace.isEnabled()) {
						Trace.write(`${view}.accessibilityRole = "${accessibilityRole}" is unknown`, Trace.categories.Accessibility);
					}
				}

				if (clickableRolesMap.has(accessibilityRole)) {
					if (Trace.isEnabled()) {
						Trace.write(`onInitializeAccessibilityNodeInfo ${view} - set clickable role=${accessibilityRole}`, Trace.categories.Accessibility);
					}

					info.setClickable(true);
				}

				if (android.os.Build.VERSION.SDK_INT >= 28) {
					if (accessibilityRole === AccessibilityRole.Header) {
						if (Trace.isEnabled()) {
							Trace.write(`onInitializeAccessibilityNodeInfo ${view} - set heading role=${accessibilityRole}`, Trace.categories.Accessibility);
						}

						info.setHeading(true);
					} else if (host.isAccessibilityHeading()) {
						if (Trace.isEnabled()) {
							Trace.write(`onInitializeAccessibilityNodeInfo ${view} - set heading from host`, Trace.categories.Accessibility);
						}

						info.setHeading(true);
					} else {
						if (Trace.isEnabled()) {
							Trace.write(`onInitializeAccessibilityNodeInfo ${view} - set not heading`, Trace.categories.Accessibility);
						}

						info.setHeading(false);
					}
				}

				switch (accessibilityRole) {
					case AccessibilityRole.Switch:
					case AccessibilityRole.RadioButton:
					case AccessibilityRole.Checkbox: {
						if (Trace.isEnabled()) {
							Trace.write(`onInitializeAccessibilityNodeInfo ${view} - set checkable and check=${view.accessibilityState === AccessibilityState.Checked}`, Trace.categories.Accessibility);
						}

						info.setCheckable(true);
						info.setChecked(view.accessibilityState === AccessibilityState.Checked);
						break;
					}
					default: {
						if (Trace.isEnabled()) {
							Trace.write(`onInitializeAccessibilityNodeInfo ${view} - set enabled=${view.accessibilityState !== AccessibilityState.Disabled} and selected=${view.accessibilityState === AccessibilityState.Selected}`, Trace.categories.Accessibility);
						}

						info.setEnabled(view.accessibilityState !== AccessibilityState.Disabled);
						info.setSelected(view.accessibilityState === AccessibilityState.Selected);
						break;
					}
				}
			}

			if (view.accessible === true) {
				info.setFocusable(true);
			}
		}

		public onInitializeAccessibilityEvent(view: AndroidView, event: AccessibilityEvent) {
			// for debugger
			super.onInitializeAccessibilityEvent(view, event);
		}

		public onPopulateAccessibilityEvent(view: AndroidView, event: AccessibilityEvent) {
			// for debugger
			super.onPopulateAccessibilityEvent(view, event);
		}

		public dispatchPopulateAccessibilityEvent(view: AndroidView, event: AccessibilityEvent) {
			// for debugger
			return super.dispatchPopulateAccessibilityEvent(view, event);
		}

		public sendAccessibilityEvent(host: AndroidViewGroup, eventType: number) {
			super.sendAccessibilityEvent(host, eventType);
			const view = this.getTnsView(host);
			if (!view) {
				console.log(`skip - ${host} - ${accessibilityEventTypeMap.get(eventType)}`);

				return;
			}

			if (suspendAccessibilityEvents) {
				if (Trace.isEnabled()) {
					Trace.write(`sendAccessibilityEvent: ${view} - skip`, Trace.categories.Accessibility);
				}

				return;
			}

			try {
				accessibilityEventHelper(view, eventType);
			} catch (err) {
				console.error(err);
			}
		}

		public onRequestSendAccessibilityEvent(host: AndroidViewGroup, view: AndroidView, event: AccessibilityEvent) {
			if (suspendAccessibilityEvents) {
				return false;
			}

			return super.onRequestSendAccessibilityEvent(host, view, event);
		}
	}

	TNSAccessibilityDelegate = new TNSAccessibilityDelegateImpl();

	accessibilityEventMap = new Map<AndroidAccessibilityEvent, number>([
		/**
		 * Invalid selection/focus position.
		 */
		[AndroidAccessibilityEvent.INVALID_POSITION, AccessibilityEvent.INVALID_POSITION],
		/**
		 * Maximum length of the text fields.
		 */
		[AndroidAccessibilityEvent.MAX_TEXT_LENGTH, AccessibilityEvent.MAX_TEXT_LENGTH],
		/**
		 * Represents the event of clicking on a android.view.View like android.widget.Button, android.widget.CompoundButton, etc.
		 */
		[AndroidAccessibilityEvent.VIEW_CLICKED, AccessibilityEvent.TYPE_VIEW_CLICKED],
		/**
		 * Represents the event of long clicking on a android.view.View like android.widget.Button, android.widget.CompoundButton, etc.
		 */
		[AndroidAccessibilityEvent.VIEW_LONG_CLICKED, AccessibilityEvent.TYPE_VIEW_LONG_CLICKED],
		/**
		 * Represents the event of selecting an item usually in the context of an android.widget.AdapterView.
		 */
		[AndroidAccessibilityEvent.VIEW_SELECTED, AccessibilityEvent.TYPE_VIEW_SELECTED],
		/**
		 * Represents the event of setting input focus of a android.view.View.
		 */
		[AndroidAccessibilityEvent.VIEW_FOCUSED, AccessibilityEvent.TYPE_VIEW_FOCUSED],
		/**
		 * Represents the event of changing the text of an android.widget.EditText.
		 */
		[AndroidAccessibilityEvent.VIEW_TEXT_CHANGED, AccessibilityEvent.TYPE_VIEW_TEXT_CHANGED],
		/**
		 * Represents the event of opening a android.widget.PopupWindow, android.view.Menu, android.app.Dialog, etc.
		 */
		[AndroidAccessibilityEvent.WINDOW_STATE_CHANGED, AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED],
		/**
		 * Represents the event showing a android.app.Notification.
		 */
		[AndroidAccessibilityEvent.NOTIFICATION_STATE_CHANGED, AccessibilityEvent.TYPE_NOTIFICATION_STATE_CHANGED],
		/**
		 * Represents the event of a hover enter over a android.view.View.
		 */
		[AndroidAccessibilityEvent.VIEW_HOVER_ENTER, AccessibilityEvent.TYPE_VIEW_HOVER_ENTER],
		/**
		 * Represents the event of a hover exit over a android.view.View.
		 */
		[AndroidAccessibilityEvent.VIEW_HOVER_EXIT, AccessibilityEvent.TYPE_VIEW_HOVER_EXIT],
		/**
		 * Represents the event of starting a touch exploration gesture.
		 */
		[AndroidAccessibilityEvent.TOUCH_EXPLORATION_GESTURE_START, AccessibilityEvent.TYPE_TOUCH_EXPLORATION_GESTURE_START],
		/**
		 * Represents the event of ending a touch exploration gesture.
		 */
		[AndroidAccessibilityEvent.TOUCH_EXPLORATION_GESTURE_END, AccessibilityEvent.TYPE_TOUCH_EXPLORATION_GESTURE_END],
		/**
		 * Represents the event of changing the content of a window and more specifically the sub-tree rooted at the event's source.
		 */
		[AndroidAccessibilityEvent.WINDOW_CONTENT_CHANGED, AccessibilityEvent.TYPE_WINDOW_CONTENT_CHANGED],
		/**
		 * Represents the event of scrolling a view.
		 */
		[AndroidAccessibilityEvent.VIEW_SCROLLED, AccessibilityEvent.TYPE_VIEW_SCROLLED],
		/**
		 * Represents the event of changing the selection in an android.widget.EditText.
		 */
		[AndroidAccessibilityEvent.VIEW_TEXT_SELECTION_CHANGED, AccessibilityEvent.TYPE_VIEW_TEXT_SELECTION_CHANGED],
		/**
		 * Represents the event of an application making an announcement.
		 */
		[AndroidAccessibilityEvent.ANNOUNCEMENT, AccessibilityEvent.TYPE_ANNOUNCEMENT],
		/**
		 * Represents the event of gaining accessibility focus.
		 */
		[AndroidAccessibilityEvent.VIEW_ACCESSIBILITY_FOCUSED, AccessibilityEvent.TYPE_VIEW_ACCESSIBILITY_FOCUSED],
		/**
		 * Represents the event of clearing accessibility focus.
		 */
		[AndroidAccessibilityEvent.VIEW_ACCESSIBILITY_FOCUS_CLEARED, AccessibilityEvent.TYPE_VIEW_ACCESSIBILITY_FOCUS_CLEARED],
		/**
		 * Represents the event of traversing the text of a view at a given movement granularity.
		 */
		[AndroidAccessibilityEvent.VIEW_TEXT_TRAVERSED_AT_MOVEMENT_GRANULARITY, AccessibilityEvent.TYPE_VIEW_TEXT_TRAVERSED_AT_MOVEMENT_GRANULARITY],
		/**
		 * Represents the event of beginning gesture detection.
		 */
		[AndroidAccessibilityEvent.GESTURE_DETECTION_START, AccessibilityEvent.TYPE_GESTURE_DETECTION_START],
		/**
		 * Represents the event of ending gesture detection.
		 */
		[AndroidAccessibilityEvent.GESTURE_DETECTION_END, AccessibilityEvent.TYPE_GESTURE_DETECTION_END],
		/**
		 * Represents the event of the user starting to touch the screen.
		 */
		[AndroidAccessibilityEvent.TOUCH_INTERACTION_START, AccessibilityEvent.TYPE_TOUCH_INTERACTION_START],
		/**
		 * Represents the event of the user ending to touch the screen.
		 */
		[AndroidAccessibilityEvent.TOUCH_INTERACTION_END, AccessibilityEvent.TYPE_TOUCH_INTERACTION_END],
		/**
		 * Mask for AccessibilityEvent all types.
		 */
		[AndroidAccessibilityEvent.ALL_MASK, AccessibilityEvent.TYPES_ALL_MASK],
	]);

	accessibilityEventTypeMap = new Map([...accessibilityEventMap].map(([k, v]) => [v, k]));
}

function getAccessibilityManager() {
	const context = utils.ad.getApplicationContext() as android.content.Context;
	if (!context) {
		return null;
	}

	return context.getSystemService(android.content.Context.ACCESSIBILITY_SERVICE) as AccessibilityManager;
}

let accessibilityStateChangeListener: AccessibilityStateChangeListener;
let touchExplorationStateChangeListener: TouchExplorationStateChangeListener;

let accessbilityServiceEnabled: boolean;
export function isAccessibilityServiceEnabled(): boolean {
	if (typeof accessbilityServiceEnabled === 'boolean') {
		return accessbilityServiceEnabled;
	}

	function updateAccessibilityServiceState() {
		const a11yManager = getAccessibilityManager();
		if (!a11yManager) {
			return;
		}

		accessbilityServiceEnabled = !!a11yManager.isEnabled() && !!a11yManager.isTouchExplorationEnabled();
	}

	const a11yManager = getAccessibilityManager();
	accessibilityStateChangeListener = new AccessibilityStateChangeListener({
		onAccessibilityStateChanged(enabled) {
			updateAccessibilityServiceState();

			if (Trace.isEnabled()) {
				Trace.write(`AccessibilityStateChangeListener state changed to: ${!!enabled}`, Trace.categories.Accessibility);
			}
		},
	});

	touchExplorationStateChangeListener = new TouchExplorationStateChangeListener({
		onTouchExplorationStateChanged(enabled) {
			updateAccessibilityServiceState();

			if (Trace.isEnabled()) {
				Trace.write(`TouchExplorationStateChangeListener state changed to: ${!!enabled}`, Trace.categories.Accessibility);
			}
		},
	});

	AccessibilityManagerCompat.addAccessibilityStateChangeListener(a11yManager, accessibilityStateChangeListener);
	AccessibilityManagerCompat.addTouchExplorationStateChangeListener(a11yManager, touchExplorationStateChangeListener);

	updateAccessibilityServiceState();

	Application.on(Application.exitEvent, (args: Application.ApplicationEventData) => {
		const activity = args.android as android.app.Activity;
		if (activity && !activity.isFinishing()) {
			return;
		}

		const a11yManager = getAccessibilityManager();
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

		Application.off(Application.resumeEvent, updateAccessibilityServiceState);
	});

	Application.on(Application.resumeEvent, updateAccessibilityServiceState);

	return accessbilityServiceEnabled;
}

export function initA11YView(view: View): void {
	updateAccessibilityProperties(view);
}

export function updateAccessibilityProperties(view: View): void {
	if (!view.nativeViewProtected) {
		return;
	}

	setAccessibilityDelegate(view);
	applyContentDescription(view);
}

export function sendAccessibilityEvent(view: View, eventType: AndroidAccessibilityEvent, text?: string): void {
	const cls = `sendAccessibilityEvent(${view}, ${eventType}, ${text})`;

	const androidView = view.nativeViewProtected as AndroidView;
	if (!androidView) {
		if (Trace.isEnabled()) {
			Trace.write(`${cls}: no nativeView`, Trace.categories.Accessibility);
		}

		return;
	}

	if (!eventType) {
		if (Trace.isEnabled()) {
			Trace.write(`${cls}: no eventName provided`, Trace.categories.Accessibility);
		}

		return;
	}

	if (!isAccessibilityServiceEnabled()) {
		if (Trace.isEnabled()) {
			Trace.write(`${cls} - TalkBack not enabled`, Trace.categories.Accessibility);
		}

		return;
	}

	const a11yService = getAccessibilityManager();
	if (!a11yService.isEnabled()) {
		if (Trace.isEnabled()) {
			Trace.write(`${cls} - a11yService not enabled`, Trace.categories.Accessibility);
		}

		return;
	}

	if (!accessibilityEventMap.has(eventType)) {
		if (Trace.isEnabled()) {
			Trace.write(`${cls} - unknown event`, Trace.categories.Accessibility);
		}

		return;
	}
	const eventInt = accessibilityEventMap.get(eventType);

	if (!text) {
		return androidView.sendAccessibilityEvent(eventInt);
	}

	const a11yEvent = AccessibilityEvent.obtain(eventInt);
	a11yEvent.setSource(androidView);

	a11yEvent.getText().clear();

	if (!text) {
		applyContentDescription(view);

		text = androidView.getContentDescription() || view['title'];
		if (Trace.isEnabled()) {
			Trace.write(`${cls} - text not provided use androidView.getContentDescription() - ${text}`, Trace.categories.Accessibility);
		}
	}

	if (Trace.isEnabled()) {
		Trace.write(`${cls}: send event with text: '${JSON.stringify(text)}'`, Trace.categories.Accessibility);
	}

	if (text) {
		a11yEvent.getText().add(text);
	}

	a11yService.sendAccessibilityEvent(a11yEvent);
}

export function updateContentDescription(view: View, forceUpdate?: boolean): string | null {
	if (!view.nativeViewProtected) {
		return;
	}

	return applyContentDescription(view, forceUpdate);
}

function setAccessibilityDelegate(view: View): void {
	if (!view.nativeViewProtected) {
		return;
	}

	ensureNativeClasses();

	const androidView = view.nativeViewProtected as AndroidView;
	if (!androidView) {
		return;
	}

	androidViewToTNSView.set(androidView, new WeakRef(view));

	const hasOldDelegate = androidView.getAccessibilityDelegate() === TNSAccessibilityDelegate;

	if (hasOldDelegate) {
		return;
	}

	androidView.setAccessibilityDelegate(TNSAccessibilityDelegate);
}

function applyContentDescription(view: View, forceUpdate?: boolean) {
	let androidView = view.nativeViewProtected as AndroidView;
	if (!androidView) {
		return;
	}

	if (androidView instanceof androidx.appcompat.widget.Toolbar) {
		const numChildren = androidView.getChildCount();

		for (let i = 0; i < numChildren; i += 1) {
			const childAndroidView = androidView.getChildAt(i);
			if (childAndroidView instanceof androidx.appcompat.widget.AppCompatTextView) {
				androidView = childAndroidView;
				break;
			}
		}
	}

	const cls = `applyContentDescription(${view})`;
	if (!androidView) {
		return null;
	}

	const titleValue = view['title'] as string;
	const textValue = view['text'] as string;

	if (!forceUpdate && view._androidContentDescriptionUpdated === false && textValue === view['_lastText'] && titleValue === view['_lastTitle']) {
		// prevent updating this too much
		return androidView.getContentDescription();
	}

	const contentDescriptionBuilder = new Array<string>();

	// Workaround: TalkBack won't read the checked state for fake Switch.
	if (view.accessibilityRole === AccessibilityRole.Switch) {
		const androidSwitch = new android.widget.Switch(Application.android.context);
		if (view.accessibilityState === AccessibilityState.Checked) {
			contentDescriptionBuilder.push(androidSwitch.getTextOn());
		} else {
			contentDescriptionBuilder.push(androidSwitch.getTextOff());
		}
	}

	if (view.accessibilityLabel) {
		if (Trace.isEnabled()) {
			Trace.write(`${cls} - have accessibilityLabel`, Trace.categories.Accessibility);
		}

		contentDescriptionBuilder.push(`${view.accessibilityLabel}`);
	}

	if (view.accessibilityValue) {
		if (Trace.isEnabled()) {
			Trace.write(`${cls} - have accessibilityValue`, Trace.categories.Accessibility);
		}

		contentDescriptionBuilder.push(`${view.accessibilityValue}`);
	} else if (textValue) {
		if (textValue !== view.accessibilityLabel) {
			if (Trace.isEnabled()) {
				Trace.write(`${cls} - don't have accessibilityValue - use 'text' value`, Trace.categories.Accessibility);
			}

			contentDescriptionBuilder.push(`${textValue}`);
		}
	} else if (titleValue) {
		if (titleValue !== view.accessibilityLabel) {
			if (Trace.isEnabled()) {
				Trace.write(`${cls} - don't have accessibilityValue - use 'title' value`, Trace.categories.Accessibility);
			}

			contentDescriptionBuilder.push(`${titleValue}`);
		}
	}

	if (view.accessibilityHint) {
		if (Trace.isEnabled()) {
			Trace.write(`${cls} - have accessibilityHint`, Trace.categories.Accessibility);
		}

		contentDescriptionBuilder.push(`${view.accessibilityHint}`);
	}

	const contentDescription = contentDescriptionBuilder.join('. ').trim().replace(/^\.$/, '');

	if (contentDescription) {
		if (Trace.isEnabled()) {
			Trace.write(`${cls} - set to "${contentDescription}"`, Trace.categories.Accessibility);
		}

		androidView.setContentDescription(contentDescription);
	} else {
		if (Trace.isEnabled()) {
			Trace.write(`${cls} - remove value`, Trace.categories.Accessibility);
		}

		androidView.setContentDescription(null);
	}

	view['_lastTitle'] = titleValue;
	view['_lastText'] = textValue;
	view._androidContentDescriptionUpdated = false;

	return contentDescription;
}
