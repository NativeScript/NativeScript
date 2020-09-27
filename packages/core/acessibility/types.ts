import { EventData } from 'data/observable';
import { View } from 'ui/core/view';

export enum AccessibilityTrait {
	/**
	 * The element has no traits.
	 */
	None = 'none',

	/**
	 * The element should be treated as a button.
	 */
	Button = 'button',

	/**
	 * The element should be treated as a link.
	 */
	Link = 'link',

	/**
	 * The element should be treated as a search field.
	 */
	SearchField = 'search',

	/**
	 * The element should be treated as an image.
	 */
	Image = 'image',

	/**
	 * The element is currently selected.
	 */
	Selected = 'selected',

	/**
	 * The element plays its own sound when activated.
	 */
	PlaysSound = 'plays',

	/**
	 * The element behaves as a keyboard key.
	 */
	KeyboardKey = 'key',

	/**
	 * The element should be treated as static text that cannot change.
	 */
	StaticText = 'text',

	/**
	 * The element provides summary information when the application starts.
	 */
	SummaryElement = 'summary',

	/**
	 * The element is not enabled and does not respond to user interaction.
	 */
	NotEnabled = 'disabled',

	/**
	 * The element frequently updates its label or value.
	 */
	UpdatesFrequently = 'frequentUpdates',

	/**
	 * The element starts a media session when it is activated.
	 */
	StartsMediaSession = 'startsMedia',

	/**
	 * The element allows continuous adjustment through a range of values.
	 */
	Adjustable = 'adjustable',

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
	 * The element is a header that divides content into sections, such as the title of a navigation bar.
	 */
	Header = 'header',
}

export enum AccessibilityRole {
	/**
	 * The element has no traits.
	 */
	None = 'none',

	/**
	 * The element should be treated as a button.
	 */
	Button = 'button',

	/**
	 * The element should be treated as a link.
	 */
	Link = 'link',

	/**
	 * The element should be treated as a search field.
	 */
	Search = 'search',

	/**
	 * The element should be treated as an image.
	 */
	Image = 'image',

	/**
	 * The element should be treated as a image button.
	 */
	ImageButton = 'image_button',

	/**
	 * The element behaves as a keyboard key.
	 */
	KeyboardKey = 'keyboard_key',

	/**
	 * The element should be treated as static text that cannot change.
	 */
	StaticText = 'text_field',

	/**
	 * The element allows continuous adjustment through a range of values.
	 */
	Adjustable = 'adjustable',

	/**
	 * The element provides summary information when the application starts.
	 */
	Summary = 'summery',

	/**
	 * The element is a header that divides content into sections, such as the title of a navigation bar.
	 */
	Header = 'header',
	Checkbox = 'checkbox',
	ProgressBar = 'progress_bar',
	RadioButton = 'radiobutton',
	SpinButton = 'spin_button',
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

export interface AccessibilityFocusEventData extends EventData {
	object: View;
}

export type AccessibilityBlurEventData = AccessibilityFocusEventData;

export interface AccessibilityFocusChangedEventData extends AccessibilityFocusEventData {
	value: boolean;
}
