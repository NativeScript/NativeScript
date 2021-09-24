import { CubicBezierAnimationCurve } from '../ui/animation';
import { FontStyleType, FontWeightType } from '../ui/styling/font-common';

export namespace CoreTypes {
	/**
	 * Denotes a length number that is in device independent pixel units.
	 */
	export type dip = number;

	/**
	 * Denotes a length number that is in physical device pixels.
	 */
	export type px = number;

	/**
	 * Denotes a normalized percent number.
	 * 0% is represented as 0
	 * 50% is represented as 0.5
	 * 100% is represented as 1
	 */
	export type percent = number;

	export type LengthDipUnit = { readonly unit: 'dip'; readonly value: dip };
	export type LengthPxUnit = { readonly unit: 'px'; readonly value: px };
	export type LengthPercentUnit = { readonly unit: '%'; readonly value: percent };

	export type LengthType = 'auto' | dip | LengthDipUnit | LengthPxUnit;
	export type PercentLengthType = 'auto' | dip | LengthDipUnit | LengthPxUnit | LengthPercentUnit;

	export type KeyboardInputType = 'datetime' | 'phone' | 'number' | 'url' | 'email' | 'integer';
	/**
	 * Represents a soft keyboard flavor.
	 */
	export module KeyboardType {
		/**
		 * Android: [TYPE_CLASS_DATETIME](http://developer.android.com/reference/android/text/InputType.html#TYPE_CLASS_DATETIME) | [TYPE_DATETIME_VARIATION_NORMAL](http://developer.android.com/reference/android/text/InputType.html#TYPE_DATETIME_VARIATION_NORMAL)
		 * iOS:  [UIKeyboardTypeNumbersAndPunctuation](https://developer.apple.com/library/ios/documentation/UIKit/Reference/UITextInputTraits_Protocol/index.html#//apple_ref/c/tdef/UIKeyboardType)
		 */
		export const datetime: KeyboardInputType;
		/**
		 * Android: [TYPE_CLASS_PHONE](http://developer.android.com/reference/android/text/InputType.html#TYPE_CLASS_PHONE)
		 * iOS:  [UIKeyboardTypePhonePad](https://developer.apple.com/library/ios/documentation/UIKit/Reference/UITextInputTraits_Protocol/index.html#//apple_ref/c/tdef/UIKeyboardType)
		 */
		export const phone: KeyboardInputType;

		/**
		 * Android: [TYPE_CLASS_NUMBER](http://developer.android.com/reference/android/text/InputType.html#TYPE_CLASS_NUMBER) | [TYPE_NUMBER_VARIATION_NORMAL](http://developer.android.com/intl/es/reference/android/text/InputType.html#TYPE_NUMBER_VARIATION_NORMAL) | [TYPE_NUMBER_FLAG_SIGNED](http://developer.android.com/reference/android/text/InputType.html#TYPE_NUMBER_FLAG_SIGNED) | [TYPE_NUMBER_FLAG_DECIMAL](http://developer.android.com/reference/android/text/InputType.html#TYPE_NUMBER_FLAG_DECIMAL)
		 * iOS:  [UIKeyboardTypeNumbersAndPunctuation](https://developer.apple.com/library/ios/documentation/UIKit/Reference/UITextInputTraits_Protocol/index.html#//apple_ref/c/tdef/UIKeyboardType)
		 */
		export const number: KeyboardInputType;

		/**
		 * Android: [TYPE_CLASS_TEXT](http://developer.android.com/reference/android/text/InputType.html#TYPE_CLASS_TEXT) | [TYPE_TEXT_VARIATION_URI](http://developer.android.com/reference/android/text/InputType.html#TYPE_TEXT_VARIATION_URI)
		 * iOS:  [UIKeyboardTypeURL](https://developer.apple.com/library/ios/documentation/UIKit/Reference/UITextInputTraits_Protocol/index.html#//apple_ref/c/tdef/UIKeyboardType)
		 */
		export const url: KeyboardInputType;

		/**
		 * Android: [TYPE_CLASS_TEXT](http://developer.android.com/reference/android/text/InputType.html#TYPE_CLASS_TEXT) | [TYPE_TEXT_VARIATION_EMAIL_ADDRESS](http://developer.android.com/reference/android/text/InputType.html#TYPE_TEXT_VARIATION_EMAIL_ADDRESS)
		 * iOS:  [UIKeyboardTypeEmailAddress](https://developer.apple.com/library/ios/documentation/UIKit/Reference/UITextInputTraits_Protocol/index.html#//apple_ref/c/tdef/UIKeyboardType)
		 */
		export const email: KeyboardInputType;

		/**
		 * Android: [TYPE_CLASS_NUMBER](http://developer.android.com/reference/android/text/InputType.html#TYPE_CLASS_NUMBER | [TYPE_NUMBER_VARIATION_PASSWORD](android type_text_variation_password))
		 * iOS:  [UIKeyboardTypeNumberPad](https://developer.apple.com/library/ios/documentation/UIKit/Reference/UITextInputTraits_Protocol/index.html#//apple_ref/c/tdef/UIKeyboardType)
		 */
		export const integer: KeyboardInputType;
	}

	export type ReturnKeyButtonType = 'done' | 'next' | 'go' | 'search' | 'send';
	/**
	 * Represents the flavor of the return key on the soft keyboard.
	 */
	export module ReturnKeyType {
		/**
		 * Android: [IME_ACTION_DONE](http://developer.android.com/reference/android/view/inputmethod/EditorInfo.html#IME_ACTION_DONE)
		 * iOS: [UIReturnKeyDone](https://developer.apple.com/library/ios/documentation/UIKit/Reference/UITextInputTraits_Protocol/index.html#//apple_ref/c/tdef/UIReturnKeyType)
		 */
		export const done: ReturnKeyButtonType;

		/**
		 * Android: [IME_ACTION_NEXT](http://developer.android.com/reference/android/view/inputmethod/EditorInfo.html#IME_ACTION_NEXT)
		 * iOS: [UIReturnKeyNext](https://developer.apple.com/library/ios/documentation/UIKit/Reference/UITextInputTraits_Protocol/index.html#//apple_ref/c/tdef/UIReturnKeyType)
		 */
		export const next: ReturnKeyButtonType;

		/**
		 * Android: [IME_ACTION_GO](http://developer.android.com/reference/android/view/inputmethod/EditorInfo.html#IME_ACTION_GO)
		 * iOS: [UIReturnKeyGo](https://developer.apple.com/library/ios/documentation/UIKit/Reference/UITextInputTraits_Protocol/index.html#//apple_ref/c/tdef/UIReturnKeyType)
		 */
		export const go: ReturnKeyButtonType;

		/**
		 * Android: [IME_ACTION_SEARCH](http://developer.android.com/reference/android/view/inputmethod/EditorInfo.html#IME_ACTION_SEARCH)
		 * iOS: [UIReturnKeySearch](https://developer.apple.com/library/ios/documentation/UIKit/Reference/UITextInputTraits_Protocol/index.html#//apple_ref/c/tdef/UIReturnKeyType)
		 */
		export const search: ReturnKeyButtonType;

		/**
		 * Android: [IME_ACTION_SEND](http://developer.android.com/reference/android/view/inputmethod/EditorInfo.html#IME_ACTION_SEND)
		 * iOS: [UIReturnKeySend](https://developer.apple.com/library/ios/documentation/UIKit/Reference/UITextInputTraits_Protocol/index.html#//apple_ref/c/tdef/UIReturnKeyType)
		 */
		export const send: string;
	}

	export type TextAlignmentType = 'initial' | 'left' | 'center' | 'right' | 'justify';
	/**
	 * Represents a text-align enumeration.
	 */
	export module TextAlignment {
		/**
		 * Represents left text-align.
		 */
		export const left: TextAlignmentType;

		/**
		 * Represents center text-align.
		 */
		export const center: TextAlignmentType;

		/**
		 * Represents right text-align.
		 */
		export const right: TextAlignmentType;
		
		/**
		 * Represents justify text-align.
		 */
		 export const justify: TextAlignmentType;
	}

	export type OrientationType = 'horizontal' | 'vertical';
	/**
	 * Orientation indicates a direction of a layout that can exist in a horizontal or vertical state.
	 */
	export module Orientation {
		/**
		 * Layout should be horizontally oriented.
		 */
		export const horizontal: OrientationType;
		/**
		 * Layout should be vertically oriented.
		 */
		export const vertical: OrientationType;
	}

	export type DeviceOrientationType = 'portrait' | 'landscape' | 'unknown';
	/**
	 * Orientation of a device.
	 */
	export module DeviceOrientation {
		/**
		 * Portrait orientation.
		 */
		export const portrait: string;
		/**
		 * Landscape orientation.
		 */
		export const landscape: string;
		/**
		 * Orientation cannot be determined.
		 */
		export const unknown: string;
	}

	export type HorizontalAlignmentType = 'left' | 'center' | 'right' | 'stretch';
	/**
	 * HorizontalAlignment indicates where an element should be displayed on the horizontal axis relative to the allocated layout slot of the parent element.
	 */
	export module HorizontalAlignment {
		/**
		 * An element should be left aligned.
		 */
		export const left: HorizontalAlignmentType;

		/**
		 * An element should be center aligned.
		 */
		export const center: HorizontalAlignmentType;

		/**
		 * An element should be right aligned.
		 */
		export const right: HorizontalAlignmentType;

		/**
		 * An element should be stretched to fill all the available size.
		 */
		export const stretch: HorizontalAlignmentType;
	}

	export type VerticalAlignmentType = 'top' | 'middle' | 'bottom' | 'stretch';
	export type VerticalAlignmentTextType = (VerticalAlignmentType & 'text-top') | 'text-bottom' | 'super' | 'sub' | 'baseline';
	/**
	 * VerticalAlignment indicates where an element should be displayed on the horizontal axis relative to the allocated layout slot of the parent element.
	 */
	export module VerticalAlignment {
		/**
		 * An element should be top aligned.
		 */
		export const top: VerticalAlignmentType;

		/**
		 * An element should be center aligned.
		 */
		export const center: VerticalAlignmentType;

		/**
		 * Same as center. An element should be aligned in the middle.
		 */
		export const middle: VerticalAlignmentType;

		/**
		 * An element should be bottom aligned.
		 */
		export const bottom: VerticalAlignmentType;

		/**
		 * An element should be stretched to fill all the available size.
		 */
		export const stretch: VerticalAlignmentType;
	}

	export type ImageStretchType = 'none' | 'aspectFill' | 'aspectFit' | 'fill';
	/**
	 * Describes how content is resized to fill its allocated space.
	 */
	export module ImageStretch {
		/**
		 * The image preserves its original size.
		 */
		export const none: ImageStretchType;

		/**
		 * The image is resized to fill in the destination dimensions while it preserves its native aspect ratio.
		 * If the aspect ratio of the destination rectangle differs from the image, the image is clipped to fill
		 * in the destination.
		 */
		export const aspectFill: ImageStretchType;

		/**
		 * The image is resized to fit the destination dimensions while it preserves
		 * its native aspect ratio.
		 */
		export const aspectFit: ImageStretchType;

		/**
		 * The image is resized to fill the destination dimensions. The aspect ratio is not preserved.
		 */
		export const fill: ImageStretchType;
	}

	export type VisibilityType = 'visible' | 'hidden' | 'collapse' | 'collapsed';
	/**
	 * Represents the visibility mode of a view.
	 */
	export module Visibility {
		/**
		 * The view is visible.
		 */
		export const visible: VisibilityType;

		/**
		 * The view is not visible and won't take place in the layout.
		 */
		export const collapse: VisibilityType;

		/**
		 * @deprecated Use collapse instead
		 */
		export const collapsed: VisibilityType;

		/**
		 * The view is not visible but will take place in the layout.
		 */
		export const hidden: VisibilityType;
	}

	/**
	 * A flag enum that represents common font attributes.
	 */
	export module FontAttributes {
		/**
		 * Denotes that text should be drawn in a normal style.
		 */
		export const Normal: number;

		/**
		 * Denotes that text should be drawn in a bold weight.
		 */
		export const Bold: number;

		/**
		 * Denotes that text should be drawn in a italic style.
		 */
		export const Italic: number;
	}

	/**
	 * Describes the type of a device
	 */
	export module DeviceType {
		/**
		 * Indicates a smart-phone device.
		 */
		export const Phone: string;

		/**
		 * Indicates a tablet device.
		 */
		export const Tablet: string;
	}

	export type UpdateTextTriggerType = 'focusLost' | 'textChanged';
	/**
	 * Represents an enumeration specifying when the text property of an EditableTextBase will be updated.
	 */
	export module UpdateTextTrigger {
		/**
		 * The text property will be udpaded when the widget loses focus.
		 */
		export const focusLost: UpdateTextTriggerType;

		/**
		 * The text property will be udpaded on every single character typed by the user.
		 */
		export const textChanged: UpdateTextTriggerType;
	}

	/**
	 * Specifies common accuracy values.
	 */
	export namespace Accuracy {
		/**
		 * The default accuracy. About 300 meters.
		 */
		export const any: number;

		/**
		 * High accuracy. About 3 meters.
		 */
		export const high: number;
	}

	export type DockType = 'left' | 'top' | 'right' | 'bottom';
	/**
	 * Specifies the Dock position of a child element that is inside a DockLayout.
	 */
	export module Dock {
		/**
		 * A child element that is positioned on the left side of the DockLayout.
		 */
		export const left: DockType;

		/**
		 * A child element that is positioned on the top side of the DockLayout.
		 */
		export const top: DockType;

		/**
		 * A child element that is positioned on the right side of the DockLayout.
		 */
		export const right: DockType;

		/**
		 * A child element that is positioned on the bottom side of the DockLayout.
		 */
		export const bottom: DockType;
	}

	export type AutocapitalizationInputType = 'none' | 'words' | 'sentences' | 'allcharacters';
	/**
	 * Represents the auto-capitalization style for a text input.
	 */
	export module AutocapitalizationType {
		/**
		 * Do not capitalize any text automatically.
		 */
		export const none: AutocapitalizationInputType;

		/**
		 * Capitalize the first letter of each word automatically.
		 */
		export const words: AutocapitalizationInputType;

		/**
		 * Capitalize the first letter of each sentence automatically.
		 */
		export const sentences: AutocapitalizationInputType;

		/**
		 * Capitalize all characters automatically.
		 */
		export const allCharacters: AutocapitalizationInputType;
	}

	/**
	 * Defines the recognized image formats.
	 */
	export module ImageFormat {
		/**
		 * The W3C Portable Network Graphics (PNG) image format.
		 */
		export const png: string;

		/**
		 * The Joint Photographic Experts Group (JPEG) image format.
		 */
		export const jpeg: string;

		/**
		 * The Joint Photographic Experts Group (JPEG) image format.
		 */
		export const jpg: string;
	}

	/**
	 * Specifies NavigationBar visibility mode.
	 */
	export module NavigationBarVisibility {
		/**
		 * NavigationBar will be visible if there if frame backstack canGoBack is true or if the page Action Bar is not empty.
		 */
		export const auto: string;

		/**
		 * NavigationBar will be hidden.
		 */
		export const never: string;

		/**
		 * NavigationBar will be visible.
		 */
		export const always: string;
	}

	/**
	 * Specifies the visibility of the application bar icon
	 */
	export module AndroidActionBarIconVisibility {
		export const auto: string;
		export const never: string;
		export const always: string;
	}

	/**
	 * Specifies android MenuItem position.
	 */
	export module AndroidActionItemPosition {
		/**
		 * Always show this item as a button in an Action Bar.
		 */
		export const actionBar: string;

		/**
		 * Show this item as a button in an Action Bar if the system decides there is room for it.
		 */
		export const actionBarIfRoom: string;

		/**
		 * Never show this item as a button in an Action Bar.
		 */
		export const popup: string;
	}

	/**
	 * Specifies different font styles.
	 */
	export module FontStyle {
		/**
		 * Normal font style.
		 */
		export const normal: FontStyleType;

		/**
		 * Italic font style.
		 */
		export const italic: FontStyleType;
	}

	export type TextDecorationType = 'none' | 'underline' | 'line-through' | 'underline line-through';
	/**
	 * Specifies different text decorations.
	 */
	export module TextDecoration {
		/**
		 * No decoration.
		 */
		export const none: TextDecorationType;

		/**
		 * Text decoration underline.
		 */
		export const underline: TextDecorationType;

		/**
		 * Text decoration line-through.
		 */
		export const lineThrough: TextDecorationType;
	}

	export type TextTransformType = 'initial' | 'none' | 'capitalize' | 'uppercase' | 'lowercase';
	/**
	 * Specifies different text transforms.
	 */
	export module TextTransform {
		/**
		 * No transform.
		 */
		export const none: TextTransformType;

		/**
		 * Text transform capitalize.
		 */
		export const capitalize: TextTransformType;

		/**
		 * Text transform uppercase.
		 */
		export const uppercase: TextTransformType;

		/**
		 * Text transform lowercase.
		 */
		export const lowercase: TextTransformType;
	}

	export type WhiteSpaceType = 'initial' | 'normal' | 'nowrap';
	/**
	 * Specifies different white spaces.
	 */
	export module WhiteSpace {
		/**
		 * Normal wrap.
		 */
		export const normal: WhiteSpaceType;

		/**
		 * No wrap.
		 */
		export const nowrap: WhiteSpaceType;
	}

	/**
	 * Specifies different font weights.
	 */
	export module FontWeight {
		/**
		 * Thin font weight. CSS font-weight 100.
		 */
		export const thin: FontWeightType;

		/**
		 * Extra-light / Ultra-light font weight. CSS font-weight 200.
		 */
		export const extraLight: FontWeightType;

		/**
		 * Light font weight. CSS font-weight 300.
		 */
		export const light: FontWeightType;

		/**
		 * Normal font weight. CSS font-weight 400.
		 */
		export const normal: FontWeightType;

		/**
		 * Medium font weight. CSS font-weight 500.
		 */
		export const medium: FontWeightType;

		/**
		 * Semi-bold / Demi-bold font weight. CSS font-weight 600.
		 */
		export const semiBold: FontWeightType;

		/**
		 * Bold font weight. CSS font-weight 700.
		 */
		export const bold: FontWeightType;

		/**
		 * Extra-bold / Ultra-bold font weight. CSS font-weight 800.
		 */
		export const extraBold: FontWeightType;

		/**
		 * Black font weight. CSS font-weight 900.
		 */
		export const black: FontWeightType;
	}

	export type BackgroundRepeatType = 'repeat' | 'repeat-x' | 'repeat-y' | 'no-repeat';
	/**
	 * Specifies background repeat.
	 */
	export module BackgroundRepeat {
		export const repeat: BackgroundRepeatType;
		export const repeatX: BackgroundRepeatType;
		export const repeatY: BackgroundRepeatType;
		export const noRepeat: BackgroundRepeatType;
		export const isValid: (value: any) => BackgroundRepeatType;
		export const parse: (value: any) => BackgroundRepeatType;
	}

	/**
	 * Specifies android MenuItem position.
	 */
	export module IOSActionItemPosition {
		/**
		 * Show this item at the left of the navigation bar.
		 */
		export const left: string;

		/**
		 * Show this item at the right of the action bar.
		 */
		export const right: string;
	}

	/**
	 * Represents an animation curve type.
	 */
	export module AnimationCurve {
		/**
		 * Default value. Specifies a transition effect with a slow start, then fast, then end slowly (equivalent to cubic-bezier(0.25,0.1,0.25,1))
		 */
		export const ease: string;

		/**
		 * An ease-in curve causes the animation to begin slowly, and then speed up as it progresses.
		 */
		export const easeIn: string;

		/**
		 * An ease-out curve causes the animation to begin quickly, and then slow down as it completes.
		 */
		export const easeOut: string;

		/**
		 * An ease-in ease-out curve causes the animation to begin slowly, accelerate through the middle of its duration, and then slow again before completing.
		 */
		export const easeInOut: string;

		/**
		 * A linear animation curve causes an animation to occur evenly over its duration.
		 */
		export const linear: string;

		/**
		 * A spring animation curve causes an animation to produce a spring (bounce) effect.
		 */
		export const spring: string;

		/**
		 * A custom cubic bezier function defined by its two control points. Possible values are numeric values from 0 to 1
		 */
		export function cubicBezier(x1: number, y1: number, x2: number, y2: number): CubicBezierAnimationCurve;
	}

	/**
	 * @deprecated use `SystemAppearance` instead.
	 *
	 * Specifies the types of the status bar style.
	 */
	export module StatusBarStyle {
		/**
		 * The light style of the status bar - light background with dark letters.
		 */
		export const light: string;

		/**
		 * The dark style of the status bar - dark background with light letters.
		 */
		export const dark: string;
	}

	/**
	 * Specifies the types of the system appearance.
	 */
	export module SystemAppearance {
		/**
		 * The light system appearance.
		 */
		export const light: string;

		/**
		 * The dark system appearance.
		 */
		export const dark: string;
	}

	/**
	 * @deprecated use `SystemAppearance` instead.
	 *
	 * Specifies the types of the user interface style.
	 */
	export module UserInterfaceStyle {
		/**
		 * The light style of the user interface.
		 */
		export const light: string;

		/**
		 * The dark style of the user interface.
		 */
		export const dark: string;
	}
}

/**
 * @deprecated Use `CoreTypes.dip` instead.
 */
export type dip = CoreTypes.dip;

/**
 * @deprecated Use `CoreTypes.px` instead.
 */
export type px = CoreTypes.px;

/**
 * @deprecated Use `CoreTypes.percent` instead.
 */
export type percent = CoreTypes.percent;

/**
 * @deprecated Use `CoreTypes.LengthDipUnit` instead.
 */
export type LengthDipUnit = CoreTypes.LengthDipUnit;
/**
 * @deprecated Use `CoreTypes.LengthPxUnit` instead.
 */
export type LengthPxUnit = CoreTypes.LengthPxUnit;
/**
 * @deprecated Use `CoreTypes.LengthPercentUnit` instead.
 */
export type LengthPercentUnit = CoreTypes.LengthPercentUnit;

/**
 * @deprecated Use `CoreTypes.LengthType` instead.
 */
export type LengthType = CoreTypes.LengthType;
/**
 * @deprecated Use `CoreTypes.PercentLengthType` instead.
 */
export type PercentLengthType = CoreTypes.PercentLengthType;

/**
 * @deprecated Use `CoreTypes.AnimationCurve` instead.
 */
export const AnimationCurve: typeof CoreTypes.AnimationCurve;

/**
 * @deprecated Use `CoreTypes.HorizontalAlignmentType` instead.
 */
export type HorizontalAlignment = CoreTypes.HorizontalAlignmentType;

/**
 * @deprecated Use `CoreTypes.VerticalAlignmentType` instead.
 */
export type VerticalAlignment = CoreTypes.VerticalAlignmentType;

/**
 * @deprecated Use `CoreTypes` instead. Enums will be removed in 9.0
 */
export declare const Enums: {
	Accuracy: typeof CoreTypes.Accuracy;
	AndroidActionBarIconVisibility: typeof CoreTypes.AndroidActionBarIconVisibility;
	AndroidActionItemPosition: typeof CoreTypes.AndroidActionItemPosition;
	AnimationCurve: typeof CoreTypes.AnimationCurve;
	AutocapitalizationType: typeof CoreTypes.AutocapitalizationType;
	BackgroundRepeat: typeof CoreTypes.BackgroundRepeat;
	DeviceOrientation: typeof CoreTypes.DeviceOrientation;
	DeviceType: typeof CoreTypes.DeviceType;
	Dock: typeof CoreTypes.Dock;
	FontAttributes: typeof CoreTypes.FontAttributes;
	FontStyle: typeof CoreTypes.FontStyle;
	FontWeight: typeof CoreTypes.FontWeight;
	HorizontalAlignment: typeof CoreTypes.HorizontalAlignment;
	IOSActionItemPosition: typeof CoreTypes.IOSActionItemPosition;
	ImageFormat: typeof CoreTypes.ImageFormat;
	KeyboardType: typeof CoreTypes.KeyboardType;
	NavigationBarVisibility: typeof CoreTypes.NavigationBarVisibility;
	Orientation: typeof CoreTypes.Orientation;
	ReturnKeyType: typeof CoreTypes.ReturnKeyType;
	StatusBarStyle: typeof CoreTypes.StatusBarStyle;
	Stretch: typeof CoreTypes.ImageStretch;
	SystemAppearance: typeof CoreTypes.SystemAppearance;
	TextAlignment: CoreTypes.TextAlignmentType;
	TextDecoration: CoreTypes.TextDecorationType;
	TextTransform: CoreTypes.TextTransformType;
	UpdateTextTrigger: CoreTypes.UpdateTextTriggerType;
	VerticalAlignment: CoreTypes.VerticalAlignmentType;
	Visibility: CoreTypes.VisibilityType;
	WhiteSpace: CoreTypes.WhiteSpaceType;
};
