import type { EventData } from '../data/observable';

export enum AccessibilityTrait {
	/**
	 * The element allows direct touch interaction for VoiceOver users.
	 */
	AllowsDirectInteraction,

	/**
	 * The element should cause an automatic page turn when VoiceOver finishes reading the text within it.
	 * Note: Requires custom view with accessibilityScroll(...)
	 */
	CausesPageTurn,

	/**
	 * The element is not enabled and does not respond to user interaction.
	 */
	NotEnabled,

	/**
	 * The element is currently selected.
	 */
	Selected,

	/**
	 * The element frequently updates its label or value.
	 */
	UpdatesFrequently,
}

export enum AccessibilityRole {
	/**
	 * The element allows continuous adjustment through a range of values.
	 */
	Adjustable,

	/**
	 * The element should be treated as a button.
	 */
	Button,

	/**
	 * The element behaves like a Checkbox
	 */
	Checkbox,

	/**
	 * The element is a header that divides content into sections, such as the title of a navigation bar.
	 */
	Header,

	/**
	 * The element should be treated as an image.
	 */
	Image,

	/**
	 * The element should be treated as a image button.
	 */
	ImageButton,

	/**
	 * The element behaves as a keyboard key.
	 */
	KeyboardKey,

	/**
	 * The element should be treated as a link.
	 */
	Link,

	/**
	 * The element has no traits.
	 */
	None,

	/**
	 * The element plays its own sound when activated.
	 */
	PlaysSound,

	/**
	 * The element behaves like a ProgressBar
	 */
	ProgressBar,

	/**
	 * The element behaves like a RadioButton
	 */
	RadioButton,

	/**
	 * The element should be treated as a search field.
	 */
	Search,

	/**
	 * The element behaves like a SpinButton
	 */
	SpinButton,

	/**
	 * The element starts a media session when it is activated.
	 */
	StartsMediaSession,

	/**
	 * The element should be treated as static text that cannot change.
	 */
	StaticText,

	/**
	 * The element provides summary information when the application starts.
	 */
	Summary,

	/**
	 * The element behaves like a switch
	 */
	Switch,
}

export enum AccessibilityState {
	Selected,
	Checked,
	Unchecked,
	Disabled,
}

export enum AccessibilityLiveRegion {
	None,
	Polite,
	Assertive,
}

export enum IOSPostAccessibilityNotificationType {
	Announcement,
	Screen,
	Layout,
}

export enum AndroidAccessibilityEvent {
	/**
	 * Invalid selection/focus position.
	 */
	INVALID_POSITION,

	/**
	 * Maximum length of the text fields.
	 */
	MAX_TEXT_LENGTH,

	/**
	 * Represents the event of clicking on a android.view.View like android.widget.Button, android.widget.CompoundButton, etc.
	 */
	VIEW_CLICKED,

	/**
	 * Represents the event of long clicking on a android.view.View like android.widget.Button, android.widget.CompoundButton, etc.
	 */
	VIEW_LONG_CLICKED,

	/**
	 * Represents the event of selecting an item usually in the context of an android.widget.AdapterView.
	 */
	VIEW_SELECTED,

	/**
	 * Represents the event of setting input focus of a android.view.View.
	 */
	VIEW_FOCUSED,

	/**
	 * Represents the event of changing the text of an android.widget.EditText.
	 */
	VIEW_TEXT_CHANGED,

	/**
	 * Represents the event of opening a android.widget.PopupWindow, android.view.Menu, android.app.Dialog, etc.
	 */
	WINDOW_STATE_CHANGED,

	/**
	 * Represents the event showing a android.app.Notification.
	 */
	NOTIFICATION_STATE_CHANGED,

	/**
	 * Represents the event of a hover enter over a android.view.View.
	 */
	VIEW_HOVER_ENTER,

	/**
	 * Represents the event of a hover exit over a android.view.View.
	 */
	VIEW_HOVER_EXIT,
	/**
	 * Represents the event of starting a touch exploration gesture.
	 */
	TOUCH_EXPLORATION_GESTURE_START,
	/**
	 * Represents the event of ending a touch exploration gesture.
	 */
	TOUCH_EXPLORATION_GESTURE_END,

	/**
	 * Represents the event of changing the content of a window and more specifically the sub-tree rooted at the event's source.
	 */
	WINDOW_CONTENT_CHANGED,

	/**
	 * Represents the event of scrolling a view.
	 */
	VIEW_SCROLLED,

	/**
	 * Represents the event of changing the selection in an android.widget.EditText.
	 */
	VIEW_TEXT_SELECTION_CHANGED,

	/**
	 * Represents the event of an application making an announcement.
	 */
	ANNOUNCEMENT,

	/**
	 * Represents the event of gaining accessibility focus.
	 */
	VIEW_ACCESSIBILITY_FOCUSED,

	/**
	 * Represents the event of clearing accessibility focus.
	 */
	VIEW_ACCESSIBILITY_FOCUS_CLEARED,

	/**
	 * Represents the event of traversing the text of a view at a given movement granularity.
	 */
	VIEW_TEXT_TRAVERSED_AT_MOVEMENT_GRANULARITY,

	/**
	 * Represents the event of beginning gesture detection.
	 */
	GESTURE_DETECTION_START,

	/**
	 * Represents the event of ending gesture detection.
	 */
	GESTURE_DETECTION_END,

	/**
	 * Represents the event of the user starting to touch the screen.
	 */
	TOUCH_INTERACTION_START,

	/**
	 * Represents the event of the user ending to touch the screen.
	 */
	TOUCH_INTERACTION_END,

	/**
	 * Mask for AccessibilityEvent all types.
	 */
	ALL_MASK,
}

export interface AccessibilityEventPerformEscape extends EventData {
	cancel?: boolean;
}

export interface AccessibilityEventOptions {
	androidAccessibilityEvent?: AndroidAccessibilityEvent;
	iosNotificationType?: IOSPostAccessibilityNotificationType;
	message?: string;
}
