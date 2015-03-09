import view = require("ui/core/view");
import style = require("ui/styling/style");
import definition = require("ui/styling");
import stylersCommon = require("ui/styling/stylers-common");
import enums = require("ui/enums");

// merge the exports of the common file with the exports of this file
declare var exports;
require("utils/module-merge").merge(stylersCommon, exports);

export class DefaultStyler implements definition.stylers.Styler {
    //Background methods
    private static setBackgroundProperty(view: view.View, newValue: any) {
        var nativeView: UIView = <UIView>view._nativeView;
        if (nativeView) {
            nativeView.backgroundColor = newValue;
        }
    }

    private static resetBackgroundProperty(view: view.View, nativeValue: any) {
        var nativeView: UIView = <UIView>view._nativeView;
        if (nativeView) {
            nativeView.backgroundColor = nativeValue;
        }
    }

    private static getNativeBackgroundValue(view: view.View): any {
        var nativeView: UIView = <UIView>view._nativeView;
        if (nativeView) {
            return nativeView.backgroundColor;
        }
        return undefined;
    }

    //Visibility methods
    private static setVisibilityProperty(view: view.View, newValue: any) {
        var nativeView: UIView = <UIView>view._nativeView;
        if (nativeView) {
            return nativeView.hidden = (newValue !== enums.Visibility.visible);
        }
    }

    private static resetVisibilityProperty(view: view.View, nativeValue: any) {
        var nativeView: UIView = <UIView>view._nativeView;
        if (nativeView) {
            return nativeView.hidden = false;
        }
    }

    //Opacity methods
    private static setOpacityProperty(view: view.View, newValue: any) {
        var nativeView: UIView = <UIView>view._nativeView;
        if (nativeView) {
            return nativeView.alpha = newValue;
        }
    }

    private static resetOpacityProperty(view: view.View, nativeValue: any) {
        var nativeView: UIView = <UIView>view._nativeView;
        if (nativeView) {
            return nativeView.alpha = 1.0;
        }
    }

    public static registerHandlers() {
        style.registerHandler(style.backgroundColorProperty, new stylersCommon.StylePropertyChangedHandler(
            DefaultStyler.setBackgroundProperty,
            DefaultStyler.resetBackgroundProperty,
            DefaultStyler.getNativeBackgroundValue));

        style.registerHandler(style.visibilityProperty, new stylersCommon.StylePropertyChangedHandler(
            DefaultStyler.setVisibilityProperty,
            DefaultStyler.resetVisibilityProperty));

        style.registerHandler(style.opacityProperty, new stylersCommon.StylePropertyChangedHandler(
            DefaultStyler.setOpacityProperty,
            DefaultStyler.resetOpacityProperty));
    }
}

export class ButtonStyler implements definition.stylers.Styler {
    // Color methods
    private static setColorProperty(view: view.View, newValue: any) {
        var btn: UIButton = <UIButton>view._nativeView;
        if (btn) {
            btn.setTitleColorForState(newValue, UIControlState.UIControlStateNormal);
        }
    }

    private static resetColorProperty(view: view.View, nativeValue: any) {
        var btn: UIButton = <UIButton>view._nativeView;
        if (btn) {
            btn.setTitleColorForState(nativeValue, UIControlState.UIControlStateNormal);
        }
    }

    private static getNativeColorValue(view: view.View): any {
        var btn: UIButton = <UIButton>view._nativeView;
        if (btn) {
            return btn.titleColorForState(UIControlState.UIControlStateNormal);
        }
    }

    // Font size
    private static setFontSizeProperty(view: view.View, newValue: any) {
        var btn: UIButton = <UIButton>view._nativeView;
        if (btn) {
            btn.titleLabel.font = btn.titleLabel.font.fontWithSize(newValue);
        }
    }

    private static resetFontSizeProperty(view: view.View, nativeValue: any) {
        var btn: UIButton = <UIButton>view._nativeView;
        if (btn) {
            btn.font = btn.titleLabel.font.fontWithSize(nativeValue);
        }
    }

    private static getNativeFontSizeValue(view: view.View): any {
        var btn: UIButton = <UIButton>view._nativeView;
        if (btn) {
            return btn.titleLabel.font.pointSize;
        }
    }

    // text-align
    private static setTextAlignmentProperty(view: view.View, newValue: any) {
        var ios: UIButton = <UIButton>view._nativeView;
        if (ios) {
            switch (newValue) {
                case enums.TextAlignment.left:
                    ios.titleLabel.textAlignment = NSTextAlignment.NSTextAlignmentLeft;
                    break;
                case enums.TextAlignment.center:
                    ios.titleLabel.textAlignment = NSTextAlignment.NSTextAlignmentCenter;
                    break;
                case enums.TextAlignment.right:
                    ios.titleLabel.textAlignment = NSTextAlignment.NSTextAlignmentRight;
                    break;
                default:
                    break;
            }
        }
    }

    private static resetTextAlignmentProperty(view: view.View, nativeValue: any) {
        var ios: UIButton = <UIButton>view._nativeView;
        if (ios) {
            ios.titleLabel.textAlignment = nativeValue;
        }
    }

    private static getNativeTextAlignmentValue(view: view.View): any {
        var ios: UIButton = <UIButton>view._nativeView;
        if (ios) {
            return ios.titleLabel.textAlignment;
        }
    }

    public static registerHandlers() {
        style.registerHandler(style.colorProperty, new stylersCommon.StylePropertyChangedHandler(
            ButtonStyler.setColorProperty,
            ButtonStyler.resetColorProperty,
            ButtonStyler.getNativeColorValue), "Button");

        style.registerHandler(style.fontSizeProperty, new stylersCommon.StylePropertyChangedHandler(
            ButtonStyler.setFontSizeProperty,
            ButtonStyler.resetFontSizeProperty,
            ButtonStyler.getNativeFontSizeValue), "Button");

        style.registerHandler(style.textAlignmentProperty, new stylersCommon.StylePropertyChangedHandler(
            ButtonStyler.setTextAlignmentProperty,
            ButtonStyler.resetTextAlignmentProperty,
            ButtonStyler.getNativeTextAlignmentValue), "Button");
    }
}

export class LabelStyler implements definition.stylers.Styler {
    // Color methods
    private static setColorProperty(view: view.View, newValue: any) {
        var label: UILabel = <UILabel>view._nativeView;
        if (label) {
            label.textColor = newValue;
        }
    }

    private static resetColorProperty(view: view.View, nativeValue: any) {
        var label: UILabel = <UILabel>view._nativeView;
        if (label) {
            label.textColor = nativeValue;
        }
    }

    private static getNativeColorValue(view: view.View): any {
        var label: UILabel = <UILabel>view._nativeView;
        if (label) {
            return label.textColor;
        }
    }

    // Font size
    private static setFontSizeProperty(view: view.View, newValue: any) {
        var label: UILabel = <UILabel>view._nativeView;
        if (label) {
            label.font = label.font.fontWithSize(newValue);
        }
    }

    private static resetFontSizeProperty(view: view.View, nativeValue: any) {
        var label: UILabel = <UILabel>view._nativeView;
        if (label) {
            label.font = label.font.fontWithSize(nativeValue);
        }
    }

    private static getNativeFontSizeValue(view: view.View): any {
        var label: UILabel = <UILabel>view._nativeView;
        if (label) {
            return label.font.pointSize;
        }
    }

    // text-align
    private static setTextAlignmentProperty(view: view.View, newValue: any) {
        var ios: UILabel = <UILabel>view._nativeView;
        if (ios) {
            switch (newValue) {
                case enums.TextAlignment.left:
                    ios.textAlignment = NSTextAlignment.NSTextAlignmentLeft;
                    break;
                case enums.TextAlignment.center:
                    ios.textAlignment = NSTextAlignment.NSTextAlignmentCenter;
                    break;
                case enums.TextAlignment.right:
                    ios.textAlignment = NSTextAlignment.NSTextAlignmentRight;
                    break;
                default:
                    break;
            }
        }
    }

    private static resetTextAlignmentProperty(view: view.View, nativeValue: any) {
        var ios: UILabel = <UILabel>view._nativeView;
        if (ios) {
            ios.textAlignment = nativeValue;
        }
    }

    private static getNativeTextAlignmentValue(view: view.View): any {
        var ios: UILabel = <UILabel>view._nativeView;
        if (ios) {
            return ios.textAlignment;
        }
    }

    public static registerHandlers() {
        style.registerHandler(style.colorProperty, new stylersCommon.StylePropertyChangedHandler(
            LabelStyler.setColorProperty,
            LabelStyler.resetColorProperty,
            LabelStyler.getNativeColorValue), "Label");

        style.registerHandler(style.fontSizeProperty, new stylersCommon.StylePropertyChangedHandler(
            LabelStyler.setFontSizeProperty,
            LabelStyler.resetFontSizeProperty,
            LabelStyler.getNativeFontSizeValue), "Label");

        style.registerHandler(style.textAlignmentProperty, new stylersCommon.StylePropertyChangedHandler(
            LabelStyler.setTextAlignmentProperty,
            LabelStyler.resetTextAlignmentProperty,
            LabelStyler.getNativeTextAlignmentValue), "Label");
    }
}

export class TextFieldStyler implements definition.stylers.Styler {
    // Color methods
    private static setColorProperty(view: view.View, newValue: any) {
        var textField: UITextField = <UITextField>view._nativeView;
        if (textField) {
            textField.textColor = newValue;
        }
    }

    private static resetColorProperty(view: view.View, nativeValue: any) {
        var textField: UITextField = <UITextField>view._nativeView;
        if (textField) {
            textField.textColor = nativeValue;
        }
    }

    private static getNativeColorValue(view: view.View): any {
        var textField: UITextField = <UITextField>view._nativeView;
        if (textField) {
            return textField.textColor;
        }
    }

    // Font size
    private static setFontSizeProperty(view: view.View, newValue: any) {
        var textField: UITextField = <UITextField>view._nativeView;
        if (textField) {
            textField.font = textField.font.fontWithSize(newValue);
        }
    }

    private static resetFontSizeProperty(view: view.View, nativeValue: any) {
        var textField: UITextField = <UITextField>view._nativeView;
        if (textField) {
            textField.font = textField.font.fontWithSize(nativeValue);
        }
    }

    private static getNativeFontSizeValue(view: view.View): any {
        var textField: UITextField = <UITextField>view._nativeView;
        if (textField) {
            return textField.font.pointSize;
        }
    }

    // text-align
    private static setTextAlignmentProperty(view: view.View, newValue: any) {
        var ios: UITextField = <UITextField>view._nativeView;
        if (ios) {
            switch (newValue) {
                case enums.TextAlignment.left:
                    ios.textAlignment = NSTextAlignment.NSTextAlignmentLeft;
                    break;
                case enums.TextAlignment.center:
                    ios.textAlignment = NSTextAlignment.NSTextAlignmentCenter;
                    break;
                case enums.TextAlignment.right:
                    ios.textAlignment = NSTextAlignment.NSTextAlignmentRight;
                    break;
                default:
                    break;
            }
        }
    }

    private static resetTextAlignmentProperty(view: view.View, nativeValue: any) {
        var ios: UITextField = <UITextField>view._nativeView;
        if (ios) {
            ios.textAlignment = nativeValue;
        }
    }

    private static getNativeTextAlignmentValue(view: view.View): any {
        var ios: UITextField = <UITextField>view._nativeView;
        if (ios) {
            return ios.textAlignment;
        }
    }

    public static registerHandlers() {
        style.registerHandler(style.colorProperty, new stylersCommon.StylePropertyChangedHandler(
            TextFieldStyler.setColorProperty,
            TextFieldStyler.resetColorProperty,
            TextFieldStyler.getNativeColorValue), "TextField");

        style.registerHandler(style.fontSizeProperty, new stylersCommon.StylePropertyChangedHandler(
            TextFieldStyler.setFontSizeProperty,
            TextFieldStyler.resetFontSizeProperty,
            TextFieldStyler.getNativeFontSizeValue), "TextField");

        style.registerHandler(style.textAlignmentProperty, new stylersCommon.StylePropertyChangedHandler(
            TextFieldStyler.setTextAlignmentProperty,
            TextFieldStyler.resetTextAlignmentProperty,
            TextFieldStyler.getNativeTextAlignmentValue), "TextField");
    }
}

export class TextViewStyler implements definition.stylers.Styler {
    // Color methods
    private static setColorProperty(view: view.View, newValue: any) {
        var textView: UITextView = <UITextView>view._nativeView;
        if (textView) {
            textView.textColor = newValue;
        }
    }

    private static resetColorProperty(view: view.View, nativeValue: any) {
        var textView: UITextView = <UITextView>view._nativeView;
        if (textView) {
            textView.textColor = nativeValue;
        }
    }

    private static getNativeColorValue(view: view.View): any {
        var textView: UITextView = <UITextView>view._nativeView;
        if (textView) {
            return textView.textColor;
        }
    }

    // Font size
    private static setFontSizeProperty(view: view.View, newValue: any) {
        var textView: UITextView = <UITextView>view._nativeView;
        if (textView) {
            textView.font = textView.font.fontWithSize(newValue);
        }
    }

    private static resetFontSizeProperty(view: view.View, nativeValue: any) {
        var textView: UITextView = <UITextView>view._nativeView;
        if (textView) {
            textView.font = textView.font.fontWithSize(nativeValue);
        }
    }

    private static getNativeFontSizeValue(view: view.View): any {
        var textView: UITextView = <UITextView>view._nativeView;
        if (textView) {
            return textView.font.pointSize;
        }
    }

    // text-align
    private static setTextAlignmentProperty(view: view.View, newValue: any) {
        var ios: UITextView = <UITextView>view._nativeView;
        if (ios) {
            switch (newValue) {
                case enums.TextAlignment.left:
                    ios.textAlignment = NSTextAlignment.NSTextAlignmentLeft;
                    break;
                case enums.TextAlignment.center:
                    ios.textAlignment = NSTextAlignment.NSTextAlignmentCenter;
                    break;
                case enums.TextAlignment.right:
                    ios.textAlignment = NSTextAlignment.NSTextAlignmentRight;
                    break;
                default:
                    break;
            }
        }
    }

    private static resetTextAlignmentProperty(view: view.View, nativeValue: any) {
        var ios: UITextView = <UITextView>view._nativeView;
        if (ios) {
            ios.textAlignment = nativeValue;
        }
    }

    private static getNativeTextAlignmentValue(view: view.View): any {
        var ios: UITextView = <UITextView>view._nativeView;
        if (ios) {
            return ios.textAlignment;
        }
    }

    public static registerHandlers() {
        style.registerHandler(style.colorProperty, new stylersCommon.StylePropertyChangedHandler(
            TextViewStyler.setColorProperty,
            TextViewStyler.resetColorProperty,
            TextViewStyler.getNativeColorValue), "TextView");

        style.registerHandler(style.fontSizeProperty, new stylersCommon.StylePropertyChangedHandler(
            TextViewStyler.setFontSizeProperty,
            TextViewStyler.resetFontSizeProperty,
            TextViewStyler.getNativeFontSizeValue), "TextView");

        style.registerHandler(style.textAlignmentProperty, new stylersCommon.StylePropertyChangedHandler(
            TextViewStyler.setTextAlignmentProperty,
            TextViewStyler.resetTextAlignmentProperty,
            TextViewStyler.getNativeTextAlignmentValue), "TextView");
    }
}

export class SegmentedBarStyler implements definition.stylers.Styler {
    //Text color methods
    private static setColorProperty(view: view.View, newValue: any) {
        var bar = <UISegmentedControl>view.ios;
        var attrs = NSMutableDictionary.new();
        attrs.setValueForKey(newValue, NSForegroundColorAttributeName);
        bar.setTitleTextAttributesForState(attrs, UIControlState.UIControlStateNormal);
    }

    private static resetColorProperty(view: view.View, nativeValue: any) {
        var bar = <UISegmentedControl>view.ios;
        var attrs = NSMutableDictionary.new();
        attrs.setValueForKey(nativeValue, NSForegroundColorAttributeName);
        bar.setTitleTextAttributesForState(attrs, UIControlState.UIControlStateNormal);
    }

    public static registerHandlers() {
        style.registerHandler(style.colorProperty, new stylersCommon.StylePropertyChangedHandler(
            SegmentedBarStyler.setColorProperty,
            SegmentedBarStyler.resetColorProperty), "SegmentedBar");
    }
}

export class SearchBarStyler implements definition.stylers.Styler {

    private static setBackgroundColorProperty(view: view.View, newValue: any) {
        var bar = <UISearchBar>view.ios;
        bar.barTintColor = newValue;
    }

    private static resetBackgroundColorProperty(view: view.View, nativeValue: any) {
        var bar = <UISearchBar>view.ios;
        bar.barTintColor = nativeValue;
    }

    private static setColorProperty(view: view.View, newValue: any) {
        var bar = <UISearchBar>view.ios;

        (<UITextField>bar.valueForKey("_searchField")).textColor = newValue;
    }

    private static resetColorProperty(view: view.View, nativeValue: any) {
        var bar = <UISearchBar>view.ios;

        (<UITextField>bar.valueForKey("_searchField")).textColor = nativeValue;
    }

    public static registerHandlers() {
        style.registerHandler(style.backgroundColorProperty, new stylersCommon.StylePropertyChangedHandler(
            SearchBarStyler.setBackgroundColorProperty,
            SearchBarStyler.resetBackgroundColorProperty), "SearchBar");

        style.registerHandler(style.colorProperty, new stylersCommon.StylePropertyChangedHandler(
            SearchBarStyler.setColorProperty,
            SearchBarStyler.resetColorProperty), "SearchBar");
    }
}

export function _registerDefaultStylers() {
    style.registerNoStylingClass("Frame");
    DefaultStyler.registerHandlers();
    ButtonStyler.registerHandlers();
    LabelStyler.registerHandlers();
    TextFieldStyler.registerHandlers();
    TextViewStyler.registerHandlers();
    SegmentedBarStyler.registerHandlers();
    SearchBarStyler.registerHandlers();
}
