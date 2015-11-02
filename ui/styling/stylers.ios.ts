import view = require("ui/core/view");
import style = require("./style");
import definition = require("ui/styling");
import stylersCommon = require("./stylers-common");
import enums = require("ui/enums");
import font = require("ui/styling/font");
import background = require("ui/styling/background");
import frame = require("ui/frame");
import tabView = require("ui/tab-view");

global.moduleMerge(stylersCommon, exports);

interface TextUIView {
    font: UIFont;
    textAlignment: number;
    textColor: UIColor;
}

var ignorePropertyHandler = new stylersCommon.StylePropertyChangedHandler(
    (view, val) => {
        // empty
    },
    (view, val) => {
        // empty
    });

export class DefaultStyler implements definition.stylers.Styler {
    //Background methods
    private static setBackgroundInternalProperty(view: view.View, newValue: any) {
        var nativeView: UIView = <UIView>view._nativeView;
        if (nativeView) {
            nativeView.backgroundColor = background.ios.createBackgroundUIColor(view);
        }
    }

    private static resetBackgroundInternalProperty(view: view.View, nativeValue: any) {
        var nativeView: UIView = <UIView>view._nativeView;
        if (nativeView) {
            nativeView.backgroundColor = nativeValue;
        }
    }

    private static getNativeBackgroundInternalValue(view: view.View): any {
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

    //Border width methods
    private static setBorderWidthProperty(view: view.View, newValue: any) {
        if (view._nativeView instanceof UIView) {
            (<UIView>view._nativeView).layer.borderWidth = newValue;
        }
    }

    private static resetBorderWidthProperty(view: view.View, nativeValue: any) {
        if (view._nativeView instanceof UIView) {
            (<UIView>view._nativeView).layer.borderWidth = nativeValue;
        }
    }

    private static getBorderWidthProperty(view: view.View): any {
        if (view._nativeView instanceof UIView) {
            return (<UIView>view._nativeView).layer.borderWidth;
        }
        return 0;
    }

    //Border color methods
    private static setBorderColorProperty(view: view.View, newValue: any) {
        if (view._nativeView instanceof UIView && newValue instanceof UIColor) {
            (<UIView>view._nativeView).layer.borderColor = (<UIColor>newValue).CGColor;
        }
    }

    private static resetBorderColorProperty(view: view.View, nativeValue: any) {
        if (view._nativeView instanceof UIView && nativeValue instanceof UIColor) {
            (<UIView>view._nativeView).layer.borderColor = nativeValue;
        }
    }

    private static getBorderColorProperty(view: view.View): any {
        if (view._nativeView instanceof UIView) {
            return (<UIView>view._nativeView).layer.borderColor;
        }
        return undefined;
    }

    //Border radius methods
    private static setBorderRadiusProperty(view: view.View, newValue: any) {
        if (view._nativeView instanceof UIView) {
            (<UIView>view._nativeView).layer.cornerRadius = newValue;
            (<UIView>view._nativeView).clipsToBounds = true;
        }
    }

    private static resetBorderRadiusProperty(view: view.View, nativeValue: any) {
        if (view._nativeView instanceof UIView) {
            (<UIView>view._nativeView).layer.cornerRadius = nativeValue;
        }
    }

    private static getBorderRadiusProperty(view: view.View): any {
        if (view._nativeView instanceof UIView) {
            return (<UIView>view._nativeView).layer.cornerRadius;
        }
        return 0;
    }

    public static registerHandlers() {
        style.registerHandler(style.backgroundInternalProperty, new stylersCommon.StylePropertyChangedHandler(
            DefaultStyler.setBackgroundInternalProperty,
            DefaultStyler.resetBackgroundInternalProperty,
            DefaultStyler.getNativeBackgroundInternalValue));

        style.registerHandler(style.visibilityProperty, new stylersCommon.StylePropertyChangedHandler(
            DefaultStyler.setVisibilityProperty,
            DefaultStyler.resetVisibilityProperty));

        style.registerHandler(style.opacityProperty, new stylersCommon.StylePropertyChangedHandler(
            DefaultStyler.setOpacityProperty,
            DefaultStyler.resetOpacityProperty));

        style.registerHandler(style.borderWidthProperty, new stylersCommon.StylePropertyChangedHandler(
            DefaultStyler.setBorderWidthProperty,
            DefaultStyler.resetBorderWidthProperty,
            DefaultStyler.getBorderWidthProperty));

        style.registerHandler(style.borderColorProperty, new stylersCommon.StylePropertyChangedHandler(
            DefaultStyler.setBorderColorProperty,
            DefaultStyler.resetBorderColorProperty,
            DefaultStyler.getBorderColorProperty));

        style.registerHandler(style.borderRadiusProperty, new stylersCommon.StylePropertyChangedHandler(
            DefaultStyler.setBorderRadiusProperty,
            DefaultStyler.resetBorderRadiusProperty,
            DefaultStyler.getBorderRadiusProperty));
    }
}

export class ButtonStyler implements definition.stylers.Styler {
    // color
    private static setColorProperty(view: view.View, newValue: any) {
        var btn: UIButton = <UIButton>view._nativeView;
        btn.setTitleColorForState(newValue, UIControlState.UIControlStateNormal);
    }

    private static resetColorProperty(view: view.View, nativeValue: any) {
        var btn: UIButton = <UIButton>view._nativeView;
        btn.setTitleColorForState(nativeValue, UIControlState.UIControlStateNormal);
    }

    private static getNativeColorValue(view: view.View): any {
        var btn: UIButton = <UIButton>view._nativeView;
        return btn.titleColorForState(UIControlState.UIControlStateNormal);
    }

    // font
    private static setFontInternalProperty(view: view.View, newValue: any, nativeValue: any) {
        var btn: UIButton = <UIButton>view._nativeView;
        btn.titleLabel.font = (<font.Font>newValue).getUIFont(nativeValue);
    }

    private static resetFontInternalProperty(view: view.View, nativeValue: any) {
        var btn: UIButton = <UIButton>view._nativeView;
        btn.titleLabel.font = nativeValue;
    }

    private static getNativeFontInternalValue(view: view.View): any {
        var btn: UIButton = <UIButton>view._nativeView;
        return btn.titleLabel.font;
    }

    // text-align
    private static setTextAlignmentProperty(view: view.View, newValue: any) {
        var btn: UIButton = <UIButton>view._nativeView;
        setTextAlignment(btn.titleLabel, newValue);

        // Also set the contentHorizontalAlignment
        switch (newValue) {
            case enums.TextAlignment.left:
                btn.contentHorizontalAlignment = UIControlContentHorizontalAlignment.UIControlContentHorizontalAlignmentLeft;
                break;
            case enums.TextAlignment.center:
                btn.contentHorizontalAlignment = UIControlContentHorizontalAlignment.UIControlContentHorizontalAlignmentCenter;
                break;
            case enums.TextAlignment.right:
                btn.contentHorizontalAlignment = UIControlContentHorizontalAlignment.UIControlContentHorizontalAlignmentRight;
                break;
            default:
                break;
        }
    }

    private static resetTextAlignmentProperty(view: view.View, nativeValue: any) {
        var btn: UIButton = <UIButton>view._nativeView;
        btn.titleLabel.textAlignment = nativeValue.textAlign;
        btn.contentHorizontalAlignment = nativeValue.contentAlign;
    }

    private static getNativeTextAlignmentValue(view: view.View): any {
        var btn: UIButton = <UIButton>view._nativeView;
        return {
            textAlign: btn.titleLabel.textAlignment,
            contentAlign: btn.contentHorizontalAlignment
        }
    }

    // Padding
    private static setPaddingProperty(view: view.View, newValue: any) {
        var top = newValue.top + view.borderWidth;
        var left = newValue.left + view.borderWidth;
        var bottom = newValue.bottom + view.borderWidth;
        var right = newValue.right + view.borderWidth;
        (<UIButton>view._nativeView).contentEdgeInsets = UIEdgeInsetsFromString(`{${top},${left},${bottom},${right}}`);
    }

    private static resetPaddingProperty(view: view.View, nativeValue: any) {
        (<UIButton>view._nativeView).contentEdgeInsets = UIEdgeInsetsFromString("{0,0,0,0}");
    }

    public static registerHandlers() {
        style.registerHandler(style.colorProperty, new stylersCommon.StylePropertyChangedHandler(
            ButtonStyler.setColorProperty,
            ButtonStyler.resetColorProperty,
            ButtonStyler.getNativeColorValue), "Button");

        style.registerHandler(style.fontInternalProperty, new stylersCommon.StylePropertyChangedHandler(
            ButtonStyler.setFontInternalProperty,
            ButtonStyler.resetFontInternalProperty,
            ButtonStyler.getNativeFontInternalValue), "Button");

        style.registerHandler(style.textAlignmentProperty, new stylersCommon.StylePropertyChangedHandler(
            ButtonStyler.setTextAlignmentProperty,
            ButtonStyler.resetTextAlignmentProperty,
            ButtonStyler.getNativeTextAlignmentValue), "Button");

        style.registerHandler(style.nativePaddingsProperty, new stylersCommon.StylePropertyChangedHandler(
            ButtonStyler.setPaddingProperty,
            ButtonStyler.resetPaddingProperty), "Button");
    }
}

export class TextBaseStyler implements definition.stylers.Styler {
    // font
    private static setFontInternalProperty(view: view.View, newValue: any, nativeValue: any) {
        var ios: TextUIView = <TextUIView>view._nativeView;
        ios.font = (<font.Font>newValue).getUIFont(nativeValue);
    }

    private static resetFontInternalProperty(view: view.View, nativeValue: any) {
        var ios: TextUIView = <TextUIView>view._nativeView;
        ios.font = nativeValue;
    }

    private static getNativeFontInternalValue(view: view.View): any {
        var ios: TextUIView = <TextUIView>view._nativeView;
        return ios.font;
    }

    // text-align
    private static setTextAlignmentProperty(view: view.View, newValue: any) {
        setTextAlignment(view._nativeView, newValue);
    }

    private static resetTextAlignmentProperty(view: view.View, nativeValue: any) {
        var ios: TextUIView = <TextUIView>view._nativeView;
        ios.textAlignment = nativeValue;
    }

    private static getNativeTextAlignmentValue(view: view.View): any {
        var ios: TextUIView = <TextUIView>view._nativeView;
        return ios.textAlignment;
    }

    // color
    private static setColorProperty(view: view.View, newValue: any) {
        var ios: TextUIView = <TextUIView>view._nativeView;
        ios.textColor = newValue;
    }

    private static resetColorProperty(view: view.View, nativeValue: any) {
        var ios: TextUIView = <TextUIView>view._nativeView;
        ios.textColor = nativeValue;
    }

    private static getNativeColorValue(view: view.View): any {
        var ios: TextUIView = <TextUIView>view._nativeView;
        return ios.textColor;
    }

    public static registerHandlers() {
        style.registerHandler(style.fontInternalProperty, new stylersCommon.StylePropertyChangedHandler(
            TextBaseStyler.setFontInternalProperty,
            TextBaseStyler.resetFontInternalProperty,
            TextBaseStyler.getNativeFontInternalValue), "TextBase");

        style.registerHandler(style.textAlignmentProperty, new stylersCommon.StylePropertyChangedHandler(
            TextBaseStyler.setTextAlignmentProperty,
            TextBaseStyler.resetTextAlignmentProperty,
            TextBaseStyler.getNativeTextAlignmentValue), "TextBase");

        style.registerHandler(style.colorProperty, new stylersCommon.StylePropertyChangedHandler(
            TextBaseStyler.setColorProperty,
            TextBaseStyler.resetColorProperty,
            TextBaseStyler.getNativeColorValue), "TextBase");
    }
}

export class TextViewStyler implements definition.stylers.Styler {
    // Color methods
    private static setColorProperty(view: view.View, newValue: any) {
        var textView: UITextView = <UITextView>view._nativeView;
        TextViewStyler._setTextViewColor(textView, newValue);
    }

    private static resetColorProperty(view: view.View, nativeValue: any) {
        var textView: UITextView = <UITextView>view._nativeView;
        TextViewStyler._setTextViewColor(textView, nativeValue);
    }

    private static _setTextViewColor(textView: UITextView, newValue: any) {
        var color: UIColor = <UIColor>newValue;
        if ((<any>textView).isShowingHint && color) {
            textView.textColor = (<UIColor>color).colorWithAlphaComponent(0.22);
        }
        else {
            textView.textColor = color;
            textView.tintColor = color;
        }
    }

    private static getNativeColorValue(view: view.View): any {
        var textView: UITextView = <UITextView>view._nativeView;
        if ((<any>textView).isShowingHint && textView.textColor) {
            return textView.textColor.colorWithAlphaComponent(1);
        }
        else {
            return textView.textColor;
        }
    }

    public static registerHandlers() {
        style.registerHandler(style.colorProperty, new stylersCommon.StylePropertyChangedHandler(
            TextViewStyler.setColorProperty,
            TextViewStyler.resetColorProperty,
            TextViewStyler.getNativeColorValue), "TextView");
    }
}

export class TextFieldStyler implements definition.stylers.Styler {
    private static setColorProperty(view: view.View, newValue: any) {
        var tf: UITextField = <UITextField>view._nativeView;
        TextFieldStyler._setTextFieldColor(tf, newValue);
    }

    private static resetColorProperty(view: view.View, nativeValue: any) {
        var tf: UITextField = <UITextField>view._nativeView;
        TextFieldStyler._setTextFieldColor(tf, nativeValue);
    }

    private static _setTextFieldColor(tf: UITextField, newValue: any) {
        var color: UIColor = <UIColor>newValue;
        if ((<any>tf).isShowingHint && color) {
            tf.textColor = (<UIColor>color).colorWithAlphaComponent(0.22);
        }
        else {
            tf.textColor = color;
            tf.tintColor = color;
        }
    }

    private static getNativeColorValue(view: view.View): any {
        var tf: UITextField = <UITextField>view._nativeView;
        return tf.tintColor;
    }

    public static registerHandlers() {
        style.registerHandler(style.colorProperty, new stylersCommon.StylePropertyChangedHandler(
            TextFieldStyler.setColorProperty,
            TextFieldStyler.resetColorProperty,
            TextFieldStyler.getNativeColorValue), "TextField");
    }
}

export class SegmentedBarStyler implements definition.stylers.Styler {
    //Text color methods
    private static setColorProperty(view: view.View, newValue: any) {
        let bar = <UISegmentedControl>view.ios;
        let currentAttrs = bar.titleTextAttributesForState(UIControlState.UIControlStateNormal);
        let attrs;
        if (currentAttrs) {
            attrs = currentAttrs.mutableCopy();
        }
        else {
            attrs = NSMutableDictionary.new();
        }
        attrs.setValueForKey(newValue, NSForegroundColorAttributeName);
        bar.setTitleTextAttributesForState(attrs, UIControlState.UIControlStateNormal);
    }

    private static resetColorProperty(view: view.View, nativeValue: any) {
        let bar = <UISegmentedControl>view.ios;
        let currentAttrs = bar.titleTextAttributesForState(UIControlState.UIControlStateNormal);
        let attrs;
        if (currentAttrs) {
            attrs = currentAttrs.mutableCopy();
        }
        else {
            attrs = NSMutableDictionary.new();
        }
        attrs.setValueForKey(nativeValue, NSForegroundColorAttributeName);
        bar.setTitleTextAttributesForState(attrs, UIControlState.UIControlStateNormal);
    }

    //Text fonts methods
    private static setFontInternalProperty(view: view.View, newValue: any) {
        let bar = <UISegmentedControl>view.ios;
        let currentAttrs = bar.titleTextAttributesForState(UIControlState.UIControlStateNormal);
        let attrs;
        if (currentAttrs) {
            attrs = currentAttrs.mutableCopy();
        }
        else {
            attrs = NSMutableDictionary.new();
        }
        let newFont = (<font.Font>newValue).getUIFont(UIFont.systemFontOfSize(UIFont.labelFontSize()));
        attrs.setValueForKey(newFont, NSFontAttributeName);
        bar.setTitleTextAttributesForState(attrs, UIControlState.UIControlStateNormal);
    }

    private static resetFontInternalProperty(view: view.View, nativeValue: any) {
        let bar = <UISegmentedControl>view.ios;
        let currentAttrs = bar.titleTextAttributesForState(UIControlState.UIControlStateNormal);
        let attrs;
        if (currentAttrs) {
            attrs = currentAttrs.mutableCopy();
        }
        else {
            attrs = NSMutableDictionary.new();
        }
        attrs.setValueForKey(nativeValue, NSFontAttributeName);
        bar.setTitleTextAttributesForState(attrs, UIControlState.UIControlStateNormal);
    }

    private static getNativeFontValue(view: view.View) {
        let bar = <UISegmentedControl>view.ios;
        let currentAttrs = bar.titleTextAttributesForState(UIControlState.UIControlStateNormal);
        let currentFont;
        if (currentAttrs) {
            currentFont = currentAttrs.objectForKey(NSFontAttributeName);
        }
        if (!currentFont) {
            currentFont = UIFont.systemFontOfSize(UIFont.labelFontSize());
        }
        return currentFont;
    }

    public static registerHandlers() {
        style.registerHandler(style.colorProperty, new stylersCommon.StylePropertyChangedHandler(
            SegmentedBarStyler.setColorProperty,
            SegmentedBarStyler.resetColorProperty), "SegmentedBar");
        style.registerHandler(style.fontInternalProperty, new stylersCommon.StylePropertyChangedHandler(
            SegmentedBarStyler.setFontInternalProperty,
            SegmentedBarStyler.resetFontInternalProperty,
            SegmentedBarStyler.getNativeFontValue), "SegmentedBar");
    }
}

export class ActivityIndicatorStyler implements definition.stylers.Styler {
    private static setColorProperty(view: view.View, newValue: any) {
        var bar = <UIActivityIndicatorView>view.ios;
        bar.color = newValue;
    }

    private static resetColorProperty(view: view.View, nativeValue: any) {
        var bar = <UIActivityIndicatorView>view.ios;
        bar.color = nativeValue;
    }

    private static getNativeColorValue(view: view.View): any {
        var bar = <UIActivityIndicatorView>view.ios;
        return bar.color;
    }

    public static registerHandlers() {
        style.registerHandler(style.colorProperty, new stylersCommon.StylePropertyChangedHandler(
            ActivityIndicatorStyler.setColorProperty,
            ActivityIndicatorStyler.resetColorProperty,
            ActivityIndicatorStyler.getNativeColorValue), "ActivityIndicator");
    }
}

export class SliderStyler implements definition.stylers.Styler {
    private static setColorProperty(view: view.View, newValue: any) {
        var bar = <UISlider>view.ios;
        bar.thumbTintColor = newValue;
    }

    private static resetColorProperty(view: view.View, nativeValue: any) {
        var bar = <UISlider>view.ios;
        bar.thumbTintColor = nativeValue;
    }

    private static getNativeColorValue(view: view.View): any {
        var bar = <UISlider>view.ios;
        return bar.thumbTintColor;
    }

    private static setBackgroundColorProperty(view: view.View, newValue: any) {
        var bar = <UISlider>view.ios;
        bar.minimumTrackTintColor = newValue;
    }

    private static resetBackgroundColorProperty(view: view.View, nativeValue: any) {
        var bar = <UISlider>view.ios;
        bar.minimumTrackTintColor = nativeValue;
    }

    private static getBackgroundColorProperty(view: view.View): any {
        var bar = <UISlider>view.ios;
        return bar.minimumTrackTintColor;
    }

    public static registerHandlers() {
        style.registerHandler(style.colorProperty, new stylersCommon.StylePropertyChangedHandler(
            SliderStyler.setColorProperty,
            SliderStyler.resetColorProperty,
            SliderStyler.getNativeColorValue), "Slider");


        style.registerHandler(style.backgroundColorProperty, new stylersCommon.StylePropertyChangedHandler(
            SliderStyler.setBackgroundColorProperty,
            SliderStyler.resetBackgroundColorProperty,
            SliderStyler.getBackgroundColorProperty), "Slider");

        style.registerHandler(style.backgroundInternalProperty, ignorePropertyHandler, "Slider");
    }
}

export class ProgressStyler implements definition.stylers.Styler {
    //Text color methods
    private static setColorProperty(view: view.View, newValue: any) {
        var bar = <UIProgressView>view.ios;
        bar.progressTintColor = newValue;
    }

    private static resetColorProperty(view: view.View, nativeValue: any) {
        var bar = <UIProgressView>view.ios;
        bar.progressTintColor = nativeValue;
    }

    private static getNativeColorValue(view: view.View): any {
        var bar = <UIProgressView>view.ios;
        return bar.progressTintColor;
    }

    private static setBackgroundColorProperty(view: view.View, newValue: any) {
        var bar = <UIProgressView>view.ios;
        bar.trackTintColor = newValue;
    }

    private static resetBackgroundColorProperty(view: view.View, nativeValue: any) {
        var bar = <UIProgressView>view.ios;
        bar.trackTintColor = nativeValue;
    }

    private static getBackgroundColorProperty(view: view.View): any {
        var bar = <UIProgressView>view.ios;
        return bar.trackTintColor;
    }

    public static registerHandlers() {
        style.registerHandler(style.colorProperty, new stylersCommon.StylePropertyChangedHandler(
            ProgressStyler.setColorProperty,
            ProgressStyler.resetColorProperty,
            ProgressStyler.getNativeColorValue), "Progress");

        style.registerHandler(style.backgroundColorProperty, new stylersCommon.StylePropertyChangedHandler(
            ProgressStyler.setBackgroundColorProperty,
            ProgressStyler.resetBackgroundColorProperty,
            ProgressStyler.getBackgroundColorProperty), "Progress");
    }
}

export class SwitchStyler implements definition.stylers.Styler {
    private static setColorProperty(view: view.View, newValue: any) {
        var sw = <UISwitch>view.ios;
        sw.thumbTintColor = newValue;
    }

    private static resetColorProperty(view: view.View, nativeValue: any) {
        var sw = <UISwitch>view.ios;
        sw.thumbTintColor = nativeValue;
    }

    private static getNativeColorValue(view: view.View): any {
        var sw = <UISwitch>view.ios;
        return sw.thumbTintColor;
    }

    private static setBackgroundColorProperty(view: view.View, newValue: any) {
        var sw = <UISwitch>view.ios;
        sw.onTintColor = view.backgroundColor.ios;
    }

    private static resetBackgroundColorProperty(view: view.View, nativeValue: any) {
        var sw = <UISwitch>view.ios;
        sw.onTintColor = nativeValue;
    }

    private static getBackgroundColorProperty(view: view.View): any {
        var sw = <UISwitch>view.ios;
        return sw.onTintColor;
    }

    public static registerHandlers() {
        style.registerHandler(style.colorProperty, new stylersCommon.StylePropertyChangedHandler(
            SwitchStyler.setColorProperty,
            SwitchStyler.resetColorProperty,
            SwitchStyler.getNativeColorValue), "Switch");

        style.registerHandler(style.backgroundColorProperty, new stylersCommon.StylePropertyChangedHandler(
            SwitchStyler.setBackgroundColorProperty,
            SwitchStyler.resetBackgroundColorProperty,
            SwitchStyler.getBackgroundColorProperty), "Switch");

        // Ignore the default backgroundInternalProperty handler
        style.registerHandler(style.backgroundInternalProperty, ignorePropertyHandler, "Switch");
    }
}

export class SearchBarStyler implements definition.stylers.Styler {

    private static setBackgroundColorProperty(view: view.View, newValue: any) {
        var bar = <UISearchBar>view.ios;
        bar.barTintColor = newValue;
    }

    private static getBackgroundColorProperty(view: view.View): any {
        var bar = <UISearchBar>view.ios;
        return bar.barTintColor;
    }

    private static resetBackgroundColorProperty(view: view.View, nativeValue: any) {
        var bar = <UISearchBar>view.ios;
        bar.barTintColor = nativeValue;
    }

    private static getColorProperty(view: view.View): any {
        var sf = <UITextField>(<any>view)._textField;
        if (sf) {
            return sf.textColor;
        }

        return undefined;
    }

    private static setColorProperty(view: view.View, newValue: any) {
        var sf = <UITextField>(<any>view)._textField;
        if (sf) {
            sf.textColor = newValue;
            sf.tintColor = newValue;
        }
    }

    private static resetColorProperty(view: view.View, nativeValue: any) {
        var sf = <UITextField>(<any>view)._textField;
        if (sf) {
            sf.textColor = nativeValue;
            sf.tintColor = nativeValue;
        }
    }

    // font
    private static setFontInternalProperty(view: view.View, newValue: any, nativeValue: any) {
        var sf = <UITextField>(<any>view)._textField;
        if (sf) {
            sf.font = (<font.Font>newValue).getUIFont(nativeValue);
        }
    }

    private static resetFontInternalProperty(view: view.View, nativeValue: any) {
        var sf = <UITextField>(<any>view)._textField;
        if (sf) {
            sf.font = nativeValue;
        }
    }

    private static getNativeFontInternalValue(view: view.View): any {
        var sf = <UITextField>(<any>view)._textField;
        if (sf) {
            return sf.font;
        }

        return undefined;
    }

    public static registerHandlers() {
        style.registerHandler(style.backgroundColorProperty, new stylersCommon.StylePropertyChangedHandler(
            SearchBarStyler.setBackgroundColorProperty,
            SearchBarStyler.resetBackgroundColorProperty,
            SearchBarStyler.getBackgroundColorProperty), "SearchBar");

        style.registerHandler(style.colorProperty, new stylersCommon.StylePropertyChangedHandler(
            SearchBarStyler.setColorProperty,
            SearchBarStyler.resetColorProperty,
            SearchBarStyler.getColorProperty), "SearchBar");

        style.registerHandler(style.fontInternalProperty, new stylersCommon.StylePropertyChangedHandler(
            SearchBarStyler.setFontInternalProperty,
            SearchBarStyler.resetFontInternalProperty,
            SearchBarStyler.getNativeFontInternalValue), "SearchBar");
    }
}

export class ActionBarStyler implements definition.stylers.Styler {
    // color
    private static setColorProperty(view: view.View, newValue: any) {
        var topFrame = frame.topmost();
        if (topFrame) {
            var navBar = topFrame.ios.controller.navigationBar;
            navBar.titleTextAttributes = <any>{ [NSForegroundColorAttributeName]: newValue };
            navBar.tintColor = newValue;
        }
    }

    private static resetColorProperty(view: view.View, nativeValue: any) {
        var topFrame = frame.topmost();
        if (topFrame) {
            var navBar = topFrame.ios.controller.navigationBar;
            navBar.titleTextAttributes = null;
            navBar.tintColor = null;
        }
    }

    // background-color
    private static setBackgroundColorProperty(view: view.View, newValue: any) {
        var topFrame = frame.topmost();
        if (topFrame) {
            var navBar = topFrame.ios.controller.navigationBar;
            navBar.barTintColor = newValue;
        }
    }

    private static resetBackgroundColorProperty(view: view.View, nativeValue: any) {
        var topFrame = frame.topmost();
        if (topFrame) {
            var navBar = topFrame.ios.controller.navigationBar;
            navBar.barTintColor = null;
        }
    }

    public static registerHandlers() {
        style.registerHandler(style.colorProperty, new stylersCommon.StylePropertyChangedHandler(
            ActionBarStyler.setColorProperty,
            ActionBarStyler.resetColorProperty), "ActionBar");

        style.registerHandler(style.backgroundColorProperty, new stylersCommon.StylePropertyChangedHandler(
            ActionBarStyler.setBackgroundColorProperty,
            ActionBarStyler.resetBackgroundColorProperty), "ActionBar");

        style.registerHandler(style.backgroundInternalProperty, ignorePropertyHandler, "ActionBar");
    }
}

export class TabViewStyler implements definition.stylers.Styler {
    // color
    private static setColorProperty(view: view.View, newValue: any) {
        var tab = <tabView.TabView>view;
        tab._updateIOSTabBarColors();
    }

    private static resetColorProperty(view: view.View, nativeValue: any) {
        var tab = <tabView.TabView>view;
        tab._updateIOSTabBarColors();
    }

    public static registerHandlers() {
        style.registerHandler(style.colorProperty, new stylersCommon.StylePropertyChangedHandler(
            TabViewStyler.setColorProperty,
            TabViewStyler.resetColorProperty), "TabView");
    }
}

function setTextAlignment(view: TextUIView, value: string) {
    switch (value) {
        case enums.TextAlignment.left:
            view.textAlignment = NSTextAlignment.NSTextAlignmentLeft;
            break;
        case enums.TextAlignment.center:
            view.textAlignment = NSTextAlignment.NSTextAlignmentCenter;
            break;
        case enums.TextAlignment.right:
            view.textAlignment = NSTextAlignment.NSTextAlignmentRight;
            break;
        default:
            break;
    }
}

// Register all styler at the end.
export function _registerDefaultStylers() {
    style.registerNoStylingClass("Frame");
    DefaultStyler.registerHandlers();
    TextBaseStyler.registerHandlers();
    ButtonStyler.registerHandlers();
    TextViewStyler.registerHandlers();
    SegmentedBarStyler.registerHandlers();
    SearchBarStyler.registerHandlers();
    ActionBarStyler.registerHandlers();
    TabViewStyler.registerHandlers();
    ProgressStyler.registerHandlers();
    SwitchStyler.registerHandlers();
    TextFieldStyler.registerHandlers();
    ActivityIndicatorStyler.registerHandlers();
    SliderStyler.registerHandlers();
}
