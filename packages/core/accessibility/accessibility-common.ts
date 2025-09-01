import type { EventData, EventDataValue } from '../data/observable';
import { Observable } from '../data/observable';
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
export function notifyAccessibilityFocusState(view: View, receivedFocus: boolean, lostFocus: boolean): void {
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

export class SharedA11YObservable extends Observable {
	accessibilityServiceEnabled?: boolean;
}

export const AccessibilityServiceEnabledPropName = 'accessibilityServiceEnabled';

export class CommonA11YServiceEnabledObservable extends SharedA11YObservable {
	constructor(sharedA11YObservable: SharedA11YObservable) {
		super();

		const ref = new WeakRef(this);
		let lastValue: boolean;

		function callback() {
			const self = ref?.get();
			if (!self) {
				sharedA11YObservable.off(Observable.propertyChangeEvent, callback);

				return;
			}

			const newValue = !!sharedA11YObservable.accessibilityServiceEnabled;
			if (newValue !== lastValue) {
				self.set(AccessibilityServiceEnabledPropName, newValue);
				lastValue = newValue;
			}
		}

		sharedA11YObservable.on(Observable.propertyChangeEvent, callback);

		this.set(AccessibilityServiceEnabledPropName, !!sharedA11YObservable.accessibilityServiceEnabled);
	}
}

let a11yServiceEnabled: boolean;
export function isA11yEnabled(): boolean {
	if (typeof a11yServiceEnabled === 'boolean') {
		return a11yServiceEnabled;
	}
	return undefined;
}
export function setA11yEnabled(value: boolean): void {
	a11yServiceEnabled = value;
}

export function enforceArray(val: string | string[]): string[] {
	if (Array.isArray(val)) {
		return val;
	}

	if (typeof val === 'string') {
		return val.split(/[, ]/g).filter((v: string) => !!v);
	}

	return [];
}

export const VALID_FONT_SCALES = __APPLE__ // Apple supports a wider number of font scales than Android does.
	? [0.5, 0.7, 0.85, 1, 1.15, 1.3, 1.5, 2, 2.5, 3, 3.5, 4]
	: [0.85, 1, 1.15, 1.3];

export function getClosestValidFontScale(fontScale: number): number {
	fontScale = Number(fontScale) || 1;

	return VALID_FONT_SCALES.sort((a, b) => Math.abs(fontScale - a) - Math.abs(fontScale - b))[0];
}

export enum FontScaleCategory {
	ExtraSmall = 'extra-small',
	Medium = 'medium',
	ExtraLarge = 'extra-large',
}

export const fontScaleExtraSmallCategoryClass = `a11y-fontscale-xs`;
export const fontScaleMediumCategoryClass = `a11y-fontscale-m`;
export const fontScaleExtraLargeCategoryClass = `a11y-fontscale-xl`;

export const fontScaleCategoryClasses = [fontScaleExtraSmallCategoryClass, fontScaleMediumCategoryClass, fontScaleExtraLargeCategoryClass];

export const a11yServiceEnabledClass = `a11y-service-enabled`;
export const a11yServiceDisabledClass = `a11y-service-disabled`;
export const a11yServiceClasses = [a11yServiceEnabledClass, a11yServiceDisabledClass];

let currentFontScale: number = null;
export function setFontScale(scale: number) {
	currentFontScale = scale;
}

export function getFontScale() {
	return currentFontScale;
}

export function getFontScaleCategory(): FontScaleCategory {
	if (__ANDROID__) {
		return FontScaleCategory.Medium;
	}

	if (getFontScale() < 0.85) {
		return FontScaleCategory.ExtraSmall;
	}

	if (getFontScale() > 1.5) {
		return FontScaleCategory.ExtraLarge;
	}

	return FontScaleCategory.Medium;
}

let initAccessibilityCssHelperCallback: () => void;
export function setInitAccessibilityCssHelper(callback: () => void) {
	initAccessibilityCssHelperCallback = callback;
}

export function readyInitAccessibilityCssHelper() {
	if (initAccessibilityCssHelperCallback) {
		initAccessibilityCssHelperCallback();
		initAccessibilityCssHelperCallback = null;
	}
}

let initFontScaleCallback: () => void;
export function setInitFontScale(callback: () => void) {
	initFontScaleCallback = callback;
}

export function readyInitFontScale() {
	if (initFontScaleCallback) {
		initFontScaleCallback();
		initFontScaleCallback = null;
	}
}

let fontScaleCssClasses: Map<number, string>;
export function setFontScaleCssClasses(value: Map<number, string>) {
	fontScaleCssClasses = value;
}

export function getFontScaleCssClasses() {
	return fontScaleCssClasses;
}

let currentFontScaleClass = '';
export function setCurrentFontScaleClass(value: string) {
	currentFontScaleClass = value;
}

export function getCurrentFontScaleClass() {
	return currentFontScaleClass;
}
let currentFontScaleCategory = '';
export function setCurrentFontScaleCategory(value: string) {
	currentFontScaleCategory = value;
}

export function getCurrentFontScaleCategory() {
	return currentFontScaleCategory;
}
let currentA11YServiceClass = '';
export function setCurrentA11YServiceClass(value: string) {
	currentA11YServiceClass = value;
}

export function getCurrentA11YServiceClass() {
	return currentA11YServiceClass;
}

export enum AccessibilityTrait {
	/**
	 * The element allows direct touch interaction for VoiceOver users.
	 */
	AllowsDirectInteraction = 'allowsDirectInteraction',

	/**
	 * The element should cause an automatic page turn when VoiceOver finishes reading the text within it.
	 * Note: Requires custom view with accessibilityScroll(...)
	 */
	CausesPageTurn = 'pageTurn',

	/**
	 * The element is not enabled and does not respond to user interaction.
	 */
	NotEnabled = 'disabled',

	/**
	 * The element is currently selected.
	 */
	Selected = 'selected',

	/**
	 * The element frequently updates its label or value.
	 */
	UpdatesFrequently = 'frequentUpdates',
}

export enum AccessibilityRole {
	/**
	 * The element allows continuous adjustment through a range of values.
	 */
	Adjustable = 'adjustable',

	/**
	 * The element should be treated as a button.
	 */
	Button = 'button',

	/**
	 * The element behaves like a Checkbox
	 */
	Checkbox = 'checkbox',

	/**
	 * The element is a header that divides content into sections, such as the title of a navigation bar.
	 */
	Header = 'header',

	/**
	 * The element should be treated as an image.
	 */
	Image = 'image',

	/**
	 * The element should be treated as a image button.
	 */
	ImageButton = 'imageButton',

	/**
	 * The element behaves as a keyboard key.
	 */
	KeyboardKey = 'keyboardKey',

	/**
	 * The element should be treated as a link.
	 */
	Link = 'link',

	/**
	 * The element has no traits.
	 */
	None = 'none',

	/**
	 * The element plays its own sound when activated.
	 */
	PlaysSound = 'plays',

	/**
	 * The element behaves like a ProgressBar
	 */
	ProgressBar = 'progressBar',

	/**
	 * The element behaves like a RadioButton
	 */
	RadioButton = 'radioButton',

	/**
	 * The element should be treated as a search field.
	 */
	Search = 'search',

	/**
	 * The element behaves like a SpinButton
	 */
	SpinButton = 'spinButton',

	/**
	 * The element starts a media session when it is activated.
	 */
	StartsMediaSession = 'startsMedia',

	/**
	 * The element should be treated as static text that cannot change.
	 */
	StaticText = 'text',

	/**
	 * The element provides summary information when the application starts.
	 */
	Summary = 'summary',

	/**
	 * The element behaves like a switch
	 */
	Switch = 'switch',
}

export enum AccessibilityState {
	Selected = 'selected',
	Checked = 'checked',
	Unchecked = 'unchecked',
	Disabled = 'disabled',
}

export enum AccessibilityLiveRegion {
	None = 'none',
	Polite = 'polite',
	Assertive = 'assertive',
}

export enum IOSPostAccessibilityNotificationType {
	Announcement = 'announcement',
	Screen = 'screen',
	Layout = 'layout',
}

export enum AndroidAccessibilityEvent {
	/**
	 * Invalid selection/focus position.
	 */
	INVALID_POSITION = 'invalid_position',

	/**
	 * Maximum length of the text fields.
	 */
	MAX_TEXT_LENGTH = 'max_text_length',

	/**
	 * Represents the event of clicking on a android.view.View like android.widget.Button, android.widget.CompoundButton, etc.
	 */
	VIEW_CLICKED = 'view_clicked',

	/**
	 * Represents the event of long clicking on a android.view.View like android.widget.Button, android.widget.CompoundButton, etc.
	 */
	VIEW_LONG_CLICKED = 'view_long_clicked',

	/**
	 * Represents the event of selecting an item usually in the context of an android.widget.AdapterView.
	 */
	VIEW_SELECTED = 'view_selected',

	/**
	 * Represents the event of setting input focus of a android.view.View.
	 */
	VIEW_FOCUSED = 'view_focused',

	/**
	 * Represents the event of changing the text of an android.widget.EditText.
	 */
	VIEW_TEXT_CHANGED = 'view_text_changed',

	/**
	 * Represents the event of opening a android.widget.PopupWindow, android.view.Menu, android.app.Dialog, etc.
	 */
	WINDOW_STATE_CHANGED = 'window_state_changed',

	/**
	 * Represents the event showing a android.app.Notification.
	 */
	NOTIFICATION_STATE_CHANGED = 'notification_state_changed',

	/**
	 * Represents the event of a hover enter over a android.view.View.
	 */
	VIEW_HOVER_ENTER = 'view_hover_enter',

	/**
	 * Represents the event of a hover exit over a android.view.View.
	 */
	VIEW_HOVER_EXIT = 'view_hover_exit',
	/**
	 * Represents the event of starting a touch exploration gesture.
	 */
	TOUCH_EXPLORATION_GESTURE_START = 'touch_exploration_gesture_start',
	/**
	 * Represents the event of ending a touch exploration gesture.
	 */
	TOUCH_EXPLORATION_GESTURE_END = 'touch_exploration_gesture_end',

	/**
	 * Represents the event of changing the content of a window and more specifically the sub-tree rooted at the event's source.
	 */
	WINDOW_CONTENT_CHANGED = 'window_content_changed',

	/**
	 * Represents the event of scrolling a view.
	 */
	VIEW_SCROLLED = 'view_scrolled',

	/**
	 * Represents the event of changing the selection in an android.widget.EditText.
	 */
	VIEW_TEXT_SELECTION_CHANGED = 'view_text_selection_changed',

	/**
	 * Represents the event of an application making an announcement.
	 */
	ANNOUNCEMENT = 'announcement',

	/**
	 * Represents the event of gaining accessibility focus.
	 */
	VIEW_ACCESSIBILITY_FOCUSED = 'view_accessibility_focused',

	/**
	 * Represents the event of clearing accessibility focus.
	 */
	VIEW_ACCESSIBILITY_FOCUS_CLEARED = 'view_accessibility_focus_cleared',

	/**
	 * Represents the event of traversing the text of a view at a given movement granularity.
	 */
	VIEW_TEXT_TRAVERSED_AT_MOVEMENT_GRANULARITY = 'view_text_traversed_at_movement_granularity',

	/**
	 * Represents the event of beginning gesture detection.
	 */
	GESTURE_DETECTION_START = 'gesture_detection_start',

	/**
	 * Represents the event of ending gesture detection.
	 */
	GESTURE_DETECTION_END = 'gesture_detection_end',

	/**
	 * Represents the event of the user starting to touch the screen.
	 */
	TOUCH_INTERACTION_START = 'touch_interaction_start',

	/**
	 * Represents the event of the user ending to touch the screen.
	 */
	TOUCH_INTERACTION_END = 'touch_interaction_end',

	/**
	 * Mask for AccessibilityEvent all types.
	 */
	ALL_MASK = 'all',
}

export interface AccessibilityEventPerformEscape extends EventData {
	cancel?: boolean;
}

export interface AccessibilityEventOptions {
	androidAccessibilityEvent?: AndroidAccessibilityEvent;
	iosNotificationType?: IOSPostAccessibilityNotificationType;
	message?: string;
}
