/**
 * @module "ui/enums"
 */ /** */

import { CubicBezierAnimationCurve } from "../animation";
import {
    KeyboardType as BaseKeyboardType,
    ReturnKeyType as BaseReturnKeyType,
    UpdateTextTrigger as BaseUpdateTrigger,
    AutocapitalizationType as BaseAutocapitalizationType
} from "../editable-text-base";

import {
    WhiteSpace as BaseWhiteSpace,
    TextAlignment as BaseTextAlignment,
    TextTransform as BaseTextTransform,
    TextDecoration as BaseTextDecoration
} from "../text-base";

import {
    Orientation as BaseOrientation
} from "../layouts/stack-layout";

import {
    Dock as BaseDock
} from "../layouts/dock-layout";

import {
    BackgroundRepeat as BaseBackgroundRepeat,
    Visibility as BaseVisibility,
    HorizontalAlignment as BaseHorizontalAlignment,
    VerticalAlignment as BaseVerticalAlignment
} from "../styling/style-properties";

import {
    Stretch as BaseStretch
} from "../image";

import {
    FontStyle as BaseFontStyle,
    FontWeight as BaseFontWeight
} from "../styling/font-common";

/**
 * Represents a soft keyboard flavor.
 */
export module KeyboardType {
    /**
     * Android: [TYPE_CLASS_DATETIME](http://developer.android.com/reference/android/text/InputType.html#TYPE_CLASS_DATETIME) | [TYPE_DATETIME_VARIATION_NORMAL](http://developer.android.com/reference/android/text/InputType.html#TYPE_DATETIME_VARIATION_NORMAL)
     * iOS:  [UIKeyboardTypeNumbersAndPunctuation](https://developer.apple.com/library/ios/documentation/UIKit/Reference/UITextInputTraits_Protocol/index.html#//apple_ref/c/tdef/UIKeyboardType)
     */
    export const datetime: BaseKeyboardType
    /**
     * Android: [TYPE_CLASS_PHONE](http://developer.android.com/reference/android/text/InputType.html#TYPE_CLASS_PHONE)
     * iOS:  [UIKeyboardTypePhonePad](https://developer.apple.com/library/ios/documentation/UIKit/Reference/UITextInputTraits_Protocol/index.html#//apple_ref/c/tdef/UIKeyboardType)
     */
    export const phone: BaseKeyboardType

    /**
     * Android: [TYPE_CLASS_NUMBER](http://developer.android.com/reference/android/text/InputType.html#TYPE_CLASS_NUMBER) | [TYPE_NUMBER_VARIATION_NORMAL](http://developer.android.com/intl/es/reference/android/text/InputType.html#TYPE_NUMBER_VARIATION_NORMAL) | [TYPE_NUMBER_FLAG_SIGNED](http://developer.android.com/reference/android/text/InputType.html#TYPE_NUMBER_FLAG_SIGNED) | [TYPE_NUMBER_FLAG_DECIMAL](http://developer.android.com/reference/android/text/InputType.html#TYPE_NUMBER_FLAG_DECIMAL)
     * iOS:  [UIKeyboardTypeNumbersAndPunctuation](https://developer.apple.com/library/ios/documentation/UIKit/Reference/UITextInputTraits_Protocol/index.html#//apple_ref/c/tdef/UIKeyboardType)
     */
    export const number: BaseKeyboardType

    /**
     * Android: [TYPE_CLASS_TEXT](http://developer.android.com/reference/android/text/InputType.html#TYPE_CLASS_TEXT) | [TYPE_TEXT_VARIATION_URI](http://developer.android.com/reference/android/text/InputType.html#TYPE_TEXT_VARIATION_URI)
     * iOS:  [UIKeyboardTypeURL](https://developer.apple.com/library/ios/documentation/UIKit/Reference/UITextInputTraits_Protocol/index.html#//apple_ref/c/tdef/UIKeyboardType)
     */
    export const url: BaseKeyboardType

    /**
     * Android: [TYPE_CLASS_TEXT](http://developer.android.com/reference/android/text/InputType.html#TYPE_CLASS_TEXT) | [TYPE_TEXT_VARIATION_EMAIL_ADDRESS](http://developer.android.com/reference/android/text/InputType.html#TYPE_TEXT_VARIATION_EMAIL_ADDRESS)
     * iOS:  [UIKeyboardTypeEmailAddress](https://developer.apple.com/library/ios/documentation/UIKit/Reference/UITextInputTraits_Protocol/index.html#//apple_ref/c/tdef/UIKeyboardType)
     */
    export const email: BaseKeyboardType

    /**
     * Android: [TYPE_CLASS_NUMBER](http://developer.android.com/reference/android/text/InputType.html#TYPE_CLASS_NUMBER | [TYPE_NUMBER_VARIATION_PASSWORD](android type_text_variation_password)) 
     * iOS:  [UIKeyboardTypeNumberPad](https://developer.apple.com/library/ios/documentation/UIKit/Reference/UITextInputTraits_Protocol/index.html#//apple_ref/c/tdef/UIKeyboardType)
     */
    export const integer: BaseKeyboardType
}

/**
 * Represents the flavor of the return key on the soft keyboard.
 */
export module ReturnKeyType {
    /**
     * Android: [IME_ACTION_DONE](http://developer.android.com/reference/android/view/inputmethod/EditorInfo.html#IME_ACTION_DONE)
     * iOS: [UIReturnKeyDone](https://developer.apple.com/library/ios/documentation/UIKit/Reference/UITextInputTraits_Protocol/index.html#//apple_ref/c/tdef/UIReturnKeyType)
     */
    export const done: BaseReturnKeyType;

    /**
     * Android: [IME_ACTION_NEXT](http://developer.android.com/reference/android/view/inputmethod/EditorInfo.html#IME_ACTION_NEXT)
     * iOS: [UIReturnKeyNext](https://developer.apple.com/library/ios/documentation/UIKit/Reference/UITextInputTraits_Protocol/index.html#//apple_ref/c/tdef/UIReturnKeyType)
     */
    export const next: BaseReturnKeyType;

    /**
     * Android: [IME_ACTION_GO](http://developer.android.com/reference/android/view/inputmethod/EditorInfo.html#IME_ACTION_GO)
     * iOS: [UIReturnKeyGo](https://developer.apple.com/library/ios/documentation/UIKit/Reference/UITextInputTraits_Protocol/index.html#//apple_ref/c/tdef/UIReturnKeyType)
     */
    export const go: BaseReturnKeyType;

    /**
     * Android: [IME_ACTION_SEARCH](http://developer.android.com/reference/android/view/inputmethod/EditorInfo.html#IME_ACTION_SEARCH)
     * iOS: [UIReturnKeySearch](https://developer.apple.com/library/ios/documentation/UIKit/Reference/UITextInputTraits_Protocol/index.html#//apple_ref/c/tdef/UIReturnKeyType)
     */
    export const search: BaseReturnKeyType;

    /**
     * Android: [IME_ACTION_SEND](http://developer.android.com/reference/android/view/inputmethod/EditorInfo.html#IME_ACTION_SEND)
     * iOS: [UIReturnKeySend](https://developer.apple.com/library/ios/documentation/UIKit/Reference/UITextInputTraits_Protocol/index.html#//apple_ref/c/tdef/UIReturnKeyType)
     */
    export const send: string;
}

/**
 * Represents a text-align enumeration.
 */
export module TextAlignment {
    /**
     * Represents left text-align.
     */
    export const left: BaseTextAlignment;

    /**
     * Represents center text-align.
     */
    export const center: BaseTextAlignment;

    /**
     * Represents right text-align.
     */
    export const right: BaseTextAlignment;
}

/**
 * Orientation indicates a direction of a layout that can exist in a horizontal or vertical state.
 */
export module Orientation {
    /**
     * Layout should be horizontally oriented.
     */
    export const horizontal: BaseOrientation;
    /**
     * Layout should be vertically oriented.
     */
    export const vertical: BaseOrientation;
}

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

/**
 * HorizontalAlignment indicates where an element should be displayed on the horizontal axis relative to the allocated layout slot of the parent element.
 */
export module HorizontalAlignment {
    /**
     * An element should be left aligned.
     */
    export const left: BaseHorizontalAlignment;

    /**
     * An element should be center aligned.
     */
    export const center: BaseHorizontalAlignment;

    /**
     * An element should be right aligned.
     */
    export const right: BaseHorizontalAlignment;

    /**
     * An element should be stretched to fill all the available size.
     */
    export const stretch: BaseHorizontalAlignment;
}

/**
 * VerticalAlignment indicates where an element should be displayed on the horizontal axis relative to the allocated layout slot of the parent element.
 */
export module VerticalAlignment {
    /**
     * An element should be top aligned.
     */
    export const top: BaseVerticalAlignment;

    /**
     * An element should be center aligned.
     */
    export const center: BaseVerticalAlignment;

    /**
     * Same as center. An element should be aligned in the middle.
     */
    export const middle: BaseVerticalAlignment;

    /**
     * An element should be bottom aligned.
     */
    export const bottom: BaseVerticalAlignment;

    /**
     * An element should be stretched to fill all the available size.
     */
    export const stretch: BaseVerticalAlignment;
}

/**
 * Describes how content is resized to fill its allocated space.
 */
export module Stretch {
    /**
     * The image preserves its original size.
     */
    export const none: BaseStretch;

    /**
     * The image is resized to fill in the destination dimensions while it preserves its native aspect ratio.
     * If the aspect ratio of the destination rectangle differs from the image, the image is clipped to fill
     * in the destination.
     */
    export const aspectFill: BaseStretch;

    /**
     * The image is resized to fit the destination dimensions while it preserves
     * its native aspect ratio.
     */
    export const aspectFit: BaseStretch;

    /**
     * The image is resized to fill the destination dimensions. The aspect ratio is not preserved.
     */
    export const fill: BaseStretch;
}

/**
 * Represents the visibility mode of a view.
 */
export module Visibility {
    /**
     * The view is visible.
     */
    export const visible: BaseVisibility;

    /**
     * The view is not visible and won't take place in the layout.
     */
    export const collapse: BaseVisibility;

    /**
     * The view is not visible but will take place in the layout.
     */
    export const hidden: BaseVisibility;
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

/**
 * Represents an enumeration specifying when the text property of an EditableTextBase will be updated.
 */
export module UpdateTextTrigger {
    /**
     * The text property will be udpaded when the widget loses focus.
     */
    export const focusLost: BaseUpdateTrigger;

    /**
     * The text property will be udpaded on every single character typed by the user.
     */
    export const textChanged: BaseUpdateTrigger;
}

/**
 * Specifies common accuracy values.
 */
export module Accuracy {
    /**
     * The default accuracy. About 300 meters.
     */
    export const any: number;

    /**
     * High accuracy. About 3 meters.
     */
    export const high: number;
}

/**
 * Specifies the Dock position of a child element that is inside a DockLayout.
 */
export module Dock {
    /**
     * A child element that is positioned on the left side of the DockLayout.
     */
    export const left: BaseDock;

    /**
     * A child element that is positioned on the top side of the DockLayout.
     */
    export const top: BaseDock;

    /**
     * A child element that is positioned on the right side of the DockLayout.
     */
    export const right: BaseDock;

    /**
     * A child element that is positioned on the bottom side of the DockLayout.
     */
    export const bottom: BaseDock;
}

/**
 * Represents the auto-capitalization style for a text input.
 */
export module AutocapitalizationType {
    /**
     * Do not capitalize any text automatically.
     */
    export const none: BaseAutocapitalizationType;

    /**
     * Capitalize the first letter of each word automatically.
     */
    export const words: BaseAutocapitalizationType;

    /**
     * Capitalize the first letter of each sentence automatically.
     */
    export const sentences: BaseAutocapitalizationType;

    /**
     * Capitalize all characters automatically.
     */
    export const allCharacters: BaseAutocapitalizationType;
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
    export const normal: BaseFontStyle;

    /**
     * Italic font style.
     */
    export const italic: BaseFontStyle;
}

/**
 * Specifies different text decorations.
 */
export module TextDecoration {
    /**
     * No decoration.
     */
    export const none: BaseTextDecoration;

    /**
     * Text decoration underline.
     */
    export const underline: BaseTextDecoration;

    /**
     * Text decoration line-through.
     */
    export const lineThrough: BaseTextDecoration;
}

/**
 * Specifies different text transforms.
 */
export module TextTransform {
    /**
     * No transform.
     */
    export const none: BaseTextTransform;

    /**
     * Text transform capitalize.
     */
    export const capitalize: BaseTextTransform;

    /**
     * Text transform uppercase.
     */
    export const uppercase: BaseTextTransform;

    /**
     * Text transform lowercase.
     */
    export const lowercase: BaseTextTransform;
}

/**
 * Specifies different white spaces.
 */
export module WhiteSpace {
    /**
     * Normal wrap.
     */
    export const normal: BaseWhiteSpace;

    /**
     * No wrap.
     */
    export const nowrap: BaseWhiteSpace;
}

/**
 * Specifies different font weights.
 */
export module FontWeight {
    /**
     * Thin font weight. CSS font-weight 100.
     */
    export const thin: BaseFontWeight;

    /**
     * Extra-light / Ultra-light font weight. CSS font-weight 200.
     */
    export const extraLight: BaseFontWeight;

    /**
     * Light font weight. CSS font-weight 300.
     */
    export const light: BaseFontWeight;

    /**
     * Normal font weight. CSS font-weight 400.
     */
    export const normal: BaseFontWeight;

    /**
     * Medium font weight. CSS font-weight 500.
     */
    export const medium: BaseFontWeight;

    /**
     * Semi-bold / Demi-bold font weight. CSS font-weight 600.
     */
    export const semiBold: BaseFontWeight;

    /**
     * Bold font weight. CSS font-weight 700.
     */
    export const bold: BaseFontWeight;

    /**
     * Extra-bold / Ultra-bold font weight. CSS font-weight 800.
     */
    export const extraBold: BaseFontWeight;

    /**
     * Black font weight. CSS font-weight 900.
     */
    export const black: BaseFontWeight;
}

/**
 * Specifies background repeat.
 */
export module BackgroundRepeat {
    export const repeat: BaseBackgroundRepeat;
    export const repeatX: BaseBackgroundRepeat;
    export const repeatY: BaseBackgroundRepeat;
    export const noRepeat: BaseBackgroundRepeat;
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
