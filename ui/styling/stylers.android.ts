import types = require("utils/types");
import trace = require("trace");
import view = require("ui/core/view");
import border = require("ui/border");
import constants = require("utils/android_constants");
import style = require("ui/styling/style");
import definition = require("ui/styling");
import stylersCommon = require("ui/styling/stylers-common");
import enums = require("ui/enums");
import utils = require("utils/utils");

// merge the exports of the common file with the exports of this file
declare var exports;
require("utils/module-merge").merge(stylersCommon, exports);

export class DefaultStyler implements definition.stylers.Styler {
    //Background methods
    private static setBackgroundProperty(view: view.View, newValue: any) {
        (<android.view.View>view.android).setBackgroundColor(newValue);
    }

    private static resetBackgroundProperty(view: view.View, nativeValue: any) {
        if (types.isDefined(nativeValue)) {
            (<android.view.View>view.android).setBackground(nativeValue)
        }
    }

    private static getNativeBackgroundValue(view: view.View): any {
        var drawable = view.android.getBackground();
        if (drawable instanceof android.graphics.drawable.StateListDrawable) {
            // StateListDrawables should not be cached as they should be created per instance of view as they contain the current state within.
            trace.write("Native value of view: " + view + " is StateListDrawable. It will not be cached.", trace.categories.Style);
            return undefined;
        }

        return drawable;
    }

    //Background image methods
    private static setBackgroundImageSourceProperty(view: view.View, newValue: any) {
        var nativeView = <android.view.View>view.android;
        var bmp = <android.graphics.Bitmap>newValue;
        var d = new android.graphics.drawable.BitmapDrawable(bmp);
        d.setTileModeXY(android.graphics.Shader.TileMode.REPEAT, android.graphics.Shader.TileMode.REPEAT);
        d.setDither(true);
        nativeView.setBackgroundDrawable(d);
    }

    private static resetBackgroundImageSourceProperty(view: view.View, nativeValue: any) {
        if (types.isDefined(nativeValue)) {
            (<android.view.View>view.android).setBackgroundDrawable(nativeValue)
        }
    }

    private static getNativeBackgroundImageSourceValue(view: view.View): any {
        var drawable = view.android.getBackground();

        if (drawable instanceof android.graphics.drawable.BitmapDrawable) {
            return drawable;
        }

        return undefined;
    }

    //Visibility methods
    private static setVisibilityProperty(view: view.View, newValue: any) {
        var androidValue = (newValue === enums.Visibility.visible) ? android.view.View.VISIBLE : android.view.View.GONE;
        (<android.view.View>view.android).setVisibility(androidValue);
    }

    private static resetVisibilityProperty(view: view.View, nativeValue: any) {
        (<android.view.View>view.android).setVisibility(android.view.View.VISIBLE);
    }

    //Opacity methods
    private static setOpacityProperty(view: view.View, newValue: any) {
        (<android.view.View>view.android).setAlpha(float(newValue));
    }

    private static resetOpacityProperty(view: view.View, nativeValue: any) {
        (<android.view.View>view.android).setAlpha(float(1.0));
    }

    //minWidth methods
    private static setMinWidthProperty(view: view.View, newValue: any) {
        (<android.view.View>view._nativeView).setMinimumWidth(newValue * utils.layout.getDisplayDensity());
    }

    private static resetMinWidthProperty(view: view.View, nativeValue: any) {
        (<android.view.View>view._nativeView).setMinimumWidth(0);
    }

    //minHeight methods
    private static setMinHeightProperty(view: view.View, newValue: any) {
        (<android.view.View>view._nativeView).setMinimumHeight(newValue * utils.layout.getDisplayDensity());
    }

    private static resetMinHeightProperty(view: view.View, nativeValue: any) {
        (<android.view.View>view._nativeView).setMinimumHeight(0);
    }

    public static registerHandlers() {
        style.registerHandler(style.backgroundColorProperty, new stylersCommon.StylePropertyChangedHandler(
            DefaultStyler.setBackgroundProperty,
            DefaultStyler.resetBackgroundProperty,
            DefaultStyler.getNativeBackgroundValue));

        style.registerHandler(style.backgroundImageSourceProperty, new stylersCommon.StylePropertyChangedHandler(
            DefaultStyler.setBackgroundImageSourceProperty,
            DefaultStyler.resetBackgroundImageSourceProperty,
            DefaultStyler.getNativeBackgroundImageSourceValue));

        style.registerHandler(style.visibilityProperty, new stylersCommon.StylePropertyChangedHandler(
            DefaultStyler.setVisibilityProperty,
            DefaultStyler.resetVisibilityProperty));

        style.registerHandler(style.opacityProperty, new stylersCommon.StylePropertyChangedHandler(
            DefaultStyler.setOpacityProperty,
            DefaultStyler.resetOpacityProperty));

        style.registerHandler(style.minWidthProperty, new stylersCommon.StylePropertyChangedHandler(
            DefaultStyler.setMinWidthProperty,
            DefaultStyler.resetMinWidthProperty));

        style.registerHandler(style.minHeightProperty, new stylersCommon.StylePropertyChangedHandler(
            DefaultStyler.setMinHeightProperty,
            DefaultStyler.resetMinHeightProperty))
    }
}

export class TextViewStyler implements definition.stylers.Styler {
    // color
    private static setColorProperty(view: view.View, newValue: any) {
        (<android.widget.TextView>view.android).setTextColor(newValue);
    }

    private static resetColorProperty(view: view.View, nativeValue: any) {
        (<android.widget.TextView>view.android).setTextColor(nativeValue);
    }

    private static getNativeColorValue(view: view.View): any {
        return (<android.widget.TextView>view.android).getTextColors().getDefaultColor();
    }

    // font-size
    private static setFontSizeProperty(view: view.View, newValue: any) {
        (<android.widget.TextView>view.android).setTextSize(newValue);
    }

    private static resetFontSizeProperty(view: view.View, nativeValue: any) {
        (<android.widget.TextView>view.android).setTextSize(android.util.TypedValue.COMPLEX_UNIT_PX, nativeValue);
    }

    private static getNativeFontSizeValue(view: view.View): any {
        return (<android.widget.TextView>view.android).getTextSize();
    }

    // text-align
    private static setTextAlignmentProperty(view: view.View, newValue: any) {
        var verticalGravity = view.android.getGravity() & android.view.Gravity.VERTICAL_GRAVITY_MASK;
        switch (newValue) {
            case enums.TextAlignment.left:
                view.android.setGravity(android.view.Gravity.LEFT | verticalGravity);
                break;
            case enums.TextAlignment.center:
                view.android.setGravity(android.view.Gravity.CENTER_HORIZONTAL | verticalGravity);
                break;
            case enums.TextAlignment.right:
                view.android.setGravity(android.view.Gravity.RIGHT | verticalGravity);
                break;
            default:
                break;
        }
    }

    private static resetTextAlignmentProperty(view: view.View, nativeValue: any) {
        view.android.setGravity(nativeValue);
    }

    private static getNativeTextAlignmentValue(view: view.View): any {
        return view.android.getGravity();
    }

    public static registerHandlers() {
        style.registerHandler(style.colorProperty, new stylersCommon.StylePropertyChangedHandler(
            TextViewStyler.setColorProperty,
            TextViewStyler.resetColorProperty,
            TextViewStyler.getNativeColorValue));

        style.registerHandler(style.fontSizeProperty, new stylersCommon.StylePropertyChangedHandler(
            TextViewStyler.setFontSizeProperty,
            TextViewStyler.resetFontSizeProperty,
            TextViewStyler.getNativeFontSizeValue));

        style.registerHandler(style.textAlignmentProperty, new stylersCommon.StylePropertyChangedHandler(
            TextViewStyler.setTextAlignmentProperty,
            TextViewStyler.resetTextAlignmentProperty,
            TextViewStyler.getNativeTextAlignmentValue));
    }
}

export class ButtonStyler implements definition.stylers.Styler {
    //Background methods
    private static setButtonBackgroundProperty(view: view.View, newValue: any) {
        (<android.view.View>view.android).setBackgroundColor(newValue);
    }

    private static resetButtonBackgroundProperty(view: view.View, nativeValue: any) {
        (<android.view.View>view.android).setBackgroundResource(constants.btn_default);
    }

    public static registerHandlers() {
        style.registerHandler(style.backgroundColorProperty, new stylersCommon.StylePropertyChangedHandler(
            ButtonStyler.setButtonBackgroundProperty,
            ButtonStyler.resetButtonBackgroundProperty), "Button");
    }
}

export class ActivityIndicatorStyler implements definition.stylers.Styler {
    //Visibility methods
    public static setActivityIndicatorVisibilityProperty(view: view.View, newValue: any) {
        ActivityIndicatorStyler.setIndicatorVisibility((<any>view).busy, newValue, view.android);
    }

    public static resetActivityIndicatorVisibilityProperty(view: view.View, nativeValue: any) {
        ActivityIndicatorStyler.setIndicatorVisibility((<any>view).busy, enums.Visibility.visible, view.android);
    }

    public static setIndicatorVisibility(isBusy: boolean, visibility: string, nativeView: android.view.View) {
        if (visibility === enums.Visibility.collapsed) {
            nativeView.setVisibility(android.view.View.GONE);
        }
        else {
            nativeView.setVisibility(isBusy ? android.view.View.VISIBLE : android.view.View.INVISIBLE);
        }
    }

    public static registerHandlers() {
        style.registerHandler(style.visibilityProperty, new stylersCommon.StylePropertyChangedHandler(
            ActivityIndicatorStyler.setActivityIndicatorVisibilityProperty,
            ActivityIndicatorStyler.resetActivityIndicatorVisibilityProperty), "ActivityIndicator");
    }
}

export class SegmentedBarStyler implements definition.stylers.Styler {
    //Text color methods
    private static setColorProperty(view: view.View, newValue: any) {
        var tabHost = <android.widget.TabHost>view.android;

        for (var tabIndex = 0; tabIndex < tabHost.getTabWidget().getTabCount(); tabIndex++) {
            var tab = <android.view.ViewGroup>tabHost.getTabWidget().getChildTabViewAt(tabIndex);
            var t = <android.widget.TextView>tab.getChildAt(1);
            t.setTextColor(newValue);
        }
    }

    private static resetColorProperty(view: view.View, nativeValue: any) {
        var tabHost = <android.widget.TabHost>view.android;

        for (var tabIndex = 0; tabIndex < tabHost.getTabWidget().getTabCount(); tabIndex++) {
            var tab = <android.view.ViewGroup>tabHost.getTabWidget().getChildTabViewAt(tabIndex);
            var t = <android.widget.TextView>tab.getChildAt(1);
            t.setTextColor(constants.btn_default);
        }
    }

    public static registerHandlers() {
        style.registerHandler(style.colorProperty, new stylersCommon.StylePropertyChangedHandler(
            SegmentedBarStyler.setColorProperty,
            SegmentedBarStyler.resetColorProperty), "SegmentedBar");
    }
}

export class SearchBarStyler implements definition.stylers.Styler {

    private static getBackgroundColorProperty(view: view.View): any {
        var bar = <android.widget.SearchView>view.android;
        return bar.getDrawingCacheBackgroundColor();
    }

    private static setBackgroundColorProperty(view: view.View, newValue: any) {
        var bar = <android.widget.SearchView>view.android;
        bar.setBackgroundColor(newValue);
        SearchBarStyler._changeSearchViewPlateBackgroundColor(bar, newValue);
    }

    private static resetBackgroundColorProperty(view: view.View, nativeValue: any) {
        var bar = <android.widget.SearchView>view.android;
        bar.setBackgroundColor(nativeValue);
        SearchBarStyler._changeSearchViewPlateBackgroundColor(bar, nativeValue);
    }

    private static getColorProperty(view: view.View): any {
        var bar = <android.widget.SearchView>view.android;
        var textView = SearchBarStyler._getSearchViewTextView(bar);

        if (textView) {
            return textView.getCurrentTextColor();
        }

        return undefined;
    }

    private static setColorProperty(view: view.View, newValue: any) {
        var bar = <android.widget.SearchView>view.android;
        SearchBarStyler._changeSearchViewTextColor(bar, newValue);
    }

    private static resetColorProperty(view: view.View, nativeValue: any) {
        var bar = <android.widget.SearchView>view.android;
        SearchBarStyler._changeSearchViewTextColor(bar, nativeValue);
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
    }

    private static _getSearchViewTextView(bar: android.widget.SearchView): android.widget.TextView {
        var id = bar.getContext().getResources().getIdentifier("android:id/search_src_text", null, null);
        return <android.widget.TextView> bar.findViewById(id);
    }

    private static _changeSearchViewTextColor(bar: android.widget.SearchView, color: number) {
        var textView = SearchBarStyler._getSearchViewTextView(bar);
        if (textView) {
            textView.setTextColor(color);
        }
    }

    private static _changeSearchViewPlateBackgroundColor(bar: android.widget.SearchView, color: number) {
        var id = bar.getContext().getResources().getIdentifier("android:id/search_plate", null, null);
        var textView = <android.view.View> bar.findViewById(id);
        if (textView) {
            textView.setBackgroundColor(color);
        }
    }
}

export class BorderStyler implements definition.stylers.Styler {
    //Background methods
    private static setBackgroundProperty(view: view.View, newValue: any) {
        var border = <border.Border>view;
        border._updateAndroidBorder();
    }

    private static resetBackgroundProperty(view: view.View, nativeValue: any) {
        var border = <border.Border>view;
        border._updateAndroidBorder();
    }

    //Background image methods
    private static setBackgroundImageSourceProperty(view: view.View, newValue: any) {
        var border = <border.Border>view;
        border._updateAndroidBorder(newValue);
    }

    private static resetBackgroundImageSourceProperty(view: view.View, nativeValue: any) {
        var border = <border.Border>view;
        if (types.isDefined(nativeValue)) {
            (<android.view.View>view.android).setBackgroundDrawable(nativeValue);
            border._updateAndroidBorder();
        }
    }

    private static getNativeBackgroundImageSourceValue(view: view.View): any {
        var drawable = view.android.getBackground();

        if (drawable instanceof android.graphics.drawable.GradientDrawable) {
            return drawable;
        }

        return undefined;
    }

    public static registerHandlers() {
        style.registerHandler(style.backgroundColorProperty, new stylersCommon.StylePropertyChangedHandler(
            BorderStyler.setBackgroundProperty,
            BorderStyler.resetBackgroundProperty), "Border");

        style.registerHandler(style.backgroundImageSourceProperty, new stylersCommon.StylePropertyChangedHandler(
            BorderStyler.setBackgroundImageSourceProperty,
            BorderStyler.resetBackgroundImageSourceProperty,
            BorderStyler.getNativeBackgroundImageSourceValue), "Border");

    }
}

export function _registerDefaultStylers() {
    style.registerNoStylingClass("Frame");
    DefaultStyler.registerHandlers();
    ButtonStyler.registerHandlers();
    TextViewStyler.registerHandlers();
    ActivityIndicatorStyler.registerHandlers();
    SegmentedBarStyler.registerHandlers();
    SearchBarStyler.registerHandlers();
    BorderStyler.registerHandlers();
}
