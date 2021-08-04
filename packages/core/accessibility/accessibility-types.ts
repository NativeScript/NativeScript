import type { EventData } from '../data/observable';

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
