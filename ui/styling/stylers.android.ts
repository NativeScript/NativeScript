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
import styleModule = require("ui/styling/style");
import imageSource = require("image-source");
import font = require("ui/styling/font");

// merge the exports of the common file with the exports of this file
declare var exports;
require("utils/module-merge").merge(stylersCommon, exports);

class BorderGradientDrawable extends android.graphics.drawable.GradientDrawable {
    private _density = utils.layout.getDisplayDensity();

    constructor() {
        super();

        return global.__native(this);
    }

    private _borderWidth: number;
    get borderWidth(): number {
        return this._borderWidth;
    }
    set borderWidth(value: number) {
        if (this._borderWidth !== value) {
            this._borderWidth = value;

            this.setStroke(this._borderWidth * this._density, this._borderColor);
        }
    }

    private _cornerRadius: number;
    get cornerRadius(): number {
        return this._cornerRadius;
    }
    set cornerRadius(value: number) {
        if (this._cornerRadius !== value) {
            this._cornerRadius = value;

            this.setCornerRadius(this._cornerRadius * this._density);
        }
    }

    private _borderColor: number;
    get borderColor(): number {
        return this._borderColor;
    }
    set borderColor(value: number) {
        if (this._borderColor !== value) {
            this._borderColor = value;

            this.setStroke(this._borderWidth * this._density, this._borderColor);
        }
    }

    private _backgroundColor: number;
    get backgroundColor(): number {
        return this._backgroundColor;
    }
    set backgroundColor(value: number) {
        if (this._backgroundColor !== value) {
            this._backgroundColor = value;

            this.setColor(this._backgroundColor);
        }
    }

    private _bitmap: android.graphics.Bitmap
    get bitmap(): android.graphics.Bitmap {
        return this._bitmap;
    }
    set bitmap(value: android.graphics.Bitmap) {
        if (this._bitmap !== value) {
            this._bitmap = value;

            this.invalidateSelf();
        }
    }

    public draw(canvas: android.graphics.Canvas): void {
        super.draw(canvas);

        if (this.bitmap) {
            var radius = this._cornerRadius * this._density;
            var stroke = this._borderWidth * this._density;

            var bounds = this.getBounds();

            var path = new android.graphics.Path();
            path.addRoundRect(new android.graphics.RectF(stroke, stroke, bounds.right - stroke, bounds.bottom - stroke), radius, radius, android.graphics.Path.Direction.CW)
            canvas.clipPath(path);

            canvas.drawBitmap(this.bitmap, stroke, stroke, undefined);
        }
    }
}

function onBorderPropertyChanged(v: view.View) {
    if (!v._nativeView) {
        return;
    }

    var value = <imageSource.ImageSource>v.style._getValue(styleModule.backgroundImageSourceProperty);

    if (v.borderWidth !== 0 || v.borderRadius !== 0 || !types.isNullOrUndefined(v.backgroundColor) || !types.isNullOrUndefined(value)) {
        var nativeView = <android.view.View>v._nativeView;

        var bkg = <BorderGradientDrawable>nativeView.getBackground();

        if (!(bkg instanceof BorderGradientDrawable)) {
            bkg = new BorderGradientDrawable();
            nativeView.setBackground(bkg);
        }

        var padding = v.borderWidth * utils.layout.getDisplayDensity();

        nativeView.setPadding(padding, padding, padding, padding);

        bkg.borderWidth = v.borderWidth;
        bkg.cornerRadius = v.borderRadius;
        bkg.borderColor = v.borderColor ? v.borderColor.android : android.graphics.Color.TRANSPARENT;
        bkg.backgroundColor = v.backgroundColor ? v.backgroundColor.android : android.graphics.Color.TRANSPARENT;

        bkg.bitmap = value ? value.android : undefined;
    }
}

export class DefaultStyler implements definition.stylers.Styler {
    //Background methods
    private static setBackgroundProperty(view: view.View, newValue: any) {
        onBorderPropertyChanged(view);
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
        onBorderPropertyChanged(view);
    }

    private static resetBackgroundImageSourceProperty(view: view.View, nativeValue: any) {
        if (types.isDefined(nativeValue)) {
            (<android.view.View>view.android).setBackgroundDrawable(nativeValue)
        }
    }

    private static getNativeBackgroundImageSourceValue(view: view.View): any {
        return view.android.getBackground();
    }

    //Border width methods
    private static setBorderWidthProperty(view: view.View, newValue: any) {
        onBorderPropertyChanged(view);
    }

    private static resetBorderWidthProperty(view: view.View, nativeValue: any) {
        view.borderWidth = 0;
    }

    //Border color methods
    private static setBorderColorProperty(view: view.View, newValue: any) {
        onBorderPropertyChanged(view);
    }

    private static resetBorderColorProperty(view: view.View, nativeValue: any) {
        view.borderColor = undefined;
    }

    //Corner radius methods
    private static setBorderRadiusProperty(view: view.View, newValue: any) {
        onBorderPropertyChanged(view);
    }

    private static resetBorderRadiusProperty(view: view.View, nativeValue: any) {
        view.borderRadius = 0;
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

        style.registerHandler(style.borderWidthProperty, new stylersCommon.StylePropertyChangedHandler(
            DefaultStyler.setBorderWidthProperty,
            DefaultStyler.resetBorderWidthProperty));

        style.registerHandler(style.borderColorProperty, new stylersCommon.StylePropertyChangedHandler(
            DefaultStyler.setBorderColorProperty,
            DefaultStyler.resetBorderColorProperty));

        style.registerHandler(style.borderRadiusProperty, new stylersCommon.StylePropertyChangedHandler(
            DefaultStyler.setBorderRadiusProperty,
            DefaultStyler.resetBorderRadiusProperty));
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

    // font
    private static setFontInternalProperty(view: view.View, newValue: any, nativeValue: any) {
        var tv = <android.widget.TextView>view.android;
        var fontValue = <font.Font>newValue;

        var typeface = fontValue.getAndroidTypeface();
        if (typeface) {
            tv.setTypeface(typeface);
        }
        else {
            tv.setTypeface(nativeValue.typeface);
        }

        if (fontValue.fontSize) {
            tv.setTextSize(fontValue.fontSize);
        }
        else {
            tv.setTextSize(android.util.TypedValue.COMPLEX_UNIT_PX, nativeValue.size);
        }
    }

    private static resetFontInternalProperty(view: view.View, nativeValue: any) {
        var tv: android.widget.TextView = <android.widget.TextView>view.android;
        tv.setTypeface(nativeValue.typeface);
        tv.setTextSize(android.util.TypedValue.COMPLEX_UNIT_PX, nativeValue.size);
    }

    private static getNativeFontInternalValue(view: view.View): any {
        var tv: android.widget.TextView = <android.widget.TextView>view.android;
        return {
            typeface: tv.getTypeface(),
            size: tv.getTextSize()
        };
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
            TextViewStyler.getNativeColorValue), "TextBase");

        style.registerHandler(style.fontInternalProperty, new stylersCommon.StylePropertyChangedHandler(
            TextViewStyler.setFontInternalProperty,
            TextViewStyler.resetFontInternalProperty,
            TextViewStyler.getNativeFontInternalValue), "TextBase");

        style.registerHandler(style.textAlignmentProperty, new stylersCommon.StylePropertyChangedHandler(
            TextViewStyler.setTextAlignmentProperty,
            TextViewStyler.resetTextAlignmentProperty,
            TextViewStyler.getNativeTextAlignmentValue), "TextBase");

        // Register the same stylers for Button.
        // It also derives from TextView but is not under TextBase in our View hierarchy.
        style.registerHandler(style.colorProperty, new stylersCommon.StylePropertyChangedHandler(
            TextViewStyler.setColorProperty,
            TextViewStyler.resetColorProperty,
            TextViewStyler.getNativeColorValue), "Button");

        style.registerHandler(style.fontInternalProperty, new stylersCommon.StylePropertyChangedHandler(
            TextViewStyler.setFontInternalProperty,
            TextViewStyler.resetFontInternalProperty,
            TextViewStyler.getNativeFontInternalValue), "Button");

        style.registerHandler(style.textAlignmentProperty, new stylersCommon.StylePropertyChangedHandler(
            TextViewStyler.setTextAlignmentProperty,
            TextViewStyler.resetTextAlignmentProperty,
            TextViewStyler.getNativeTextAlignmentValue), "Button");

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
        if (visibility === enums.Visibility.collapsed || visibility === enums.Visibility.collapse) {
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

    public static registerHandlers() {
        style.registerHandler(style.backgroundColorProperty, new stylersCommon.StylePropertyChangedHandler(
            BorderStyler.setBackgroundProperty,
            BorderStyler.resetBackgroundProperty), "Border");
    }
}

// Register all styler at the end.
export function _registerDefaultStylers() {
    style.registerNoStylingClass("Frame");
    DefaultStyler.registerHandlers();
    TextViewStyler.registerHandlers();
    ActivityIndicatorStyler.registerHandlers();
    SegmentedBarStyler.registerHandlers();
    SearchBarStyler.registerHandlers();
    BorderStyler.registerHandlers();
}
