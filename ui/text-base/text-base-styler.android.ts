import view = require("ui/core/view");
import utils = require("utils/utils");
import style = require("ui/styling/style");
import font = require("ui/styling/font");
import enums = require("ui/enums");

export class TextBaseStyler implements style.Styler {
    // color
    private static setColorProperty(view: view.View, newValue: any) {
        (<android.widget.TextView>view._nativeView).setTextColor(newValue);
    }

    private static resetColorProperty(view: view.View, nativeValue: any) {
        (<android.widget.TextView>view._nativeView).setTextColor(nativeValue);
    }

    private static getNativeColorValue(view: view.View): any {
        return (<android.widget.TextView>view._nativeView).getTextColors().getDefaultColor();
    }

    // font
    private static setFontInternalProperty(view: view.View, newValue: any, nativeValue?: any) {
        var tv = <android.widget.TextView>view._nativeView;
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
        var tv: android.widget.TextView = <android.widget.TextView>view._nativeView;
        if (tv && nativeValue) {
            tv.setTypeface(nativeValue.typeface);
            tv.setTextSize(android.util.TypedValue.COMPLEX_UNIT_PX, nativeValue.size);
        }
    }

    private static getNativeFontInternalValue(view: view.View): any {
        var tv: android.widget.TextView = <android.widget.TextView>view._nativeView;
        return {
            typeface: tv.getTypeface(),
            size: tv.getTextSize()
        };
    }

    // text-align
    private static setTextAlignmentProperty(view: view.View, newValue: any) {
        var verticalGravity = view._nativeView.getGravity() & android.view.Gravity.VERTICAL_GRAVITY_MASK;
        switch (newValue) {
            case enums.TextAlignment.left:
                view._nativeView.setGravity(android.view.Gravity.LEFT | verticalGravity);
                break;
            case enums.TextAlignment.center:
                view._nativeView.setGravity(android.view.Gravity.CENTER_HORIZONTAL | verticalGravity);
                break;
            case enums.TextAlignment.right:
                view._nativeView.setGravity(android.view.Gravity.RIGHT | verticalGravity);
                break;
            default:
                break;
        }
    }

    private static resetTextAlignmentProperty(view: view.View, nativeValue: any) {
        view._nativeView.setGravity(nativeValue);
    }

    private static getNativeTextAlignmentValue(view: view.View): any {
        return view._nativeView.getGravity();
    }

    // text-decoration
    private static setTextDecorationProperty(view: view.View, newValue: any) {
        utils.ad.setTextDecoration(view._nativeView, newValue);
    }

    private static resetTextDecorationProperty(view: view.View, nativeValue: any) {
        utils.ad.setTextDecoration(view._nativeView, enums.TextDecoration.none);
    }

    // text-transform
    private static setTextTransformProperty(view: view.View, newValue: any) {
        utils.ad.setTextTransform(view, newValue);
    }

    private static resetTextTransformProperty(view: view.View, nativeValue: any) {
        utils.ad.setTextTransform(view, enums.TextTransform.none);
    }

    // white-space
    private static setWhiteSpaceProperty(view: view.View, newValue: any) {
        utils.ad.setWhiteSpace(view._nativeView, newValue);
    }

    private static resetWhiteSpaceProperty(view: view.View, nativeValue: any) {
        utils.ad.setWhiteSpace(view._nativeView, enums.WhiteSpace.normal);
    }

    // letter-spacing
    private static getLetterSpacingProperty(view: view.View) : any {
        return view.android.getLetterSpacing ? view.android.getLetterSpacing() : 0;
    }

    private static setLetterSpacingProperty(view: view.View, newValue: any) {
        if(view.android.setLetterSpacing) {
           view.android.setLetterSpacing(utils.layout.toDeviceIndependentPixels(newValue));
        }
    }

    private static resetLetterSpacingProperty(view: view.View, nativeValue: any) {
        if(view.android.setLetterSpacing) {
            view.android.setLetterSpacing(nativeValue);
        }
    }

    public static registerHandlers() {
        style.registerHandler(style.colorProperty, new style.StylePropertyChangedHandler(
            TextBaseStyler.setColorProperty,
            TextBaseStyler.resetColorProperty,
            TextBaseStyler.getNativeColorValue), "TextBase");

        style.registerHandler(style.fontInternalProperty, new style.StylePropertyChangedHandler(
            TextBaseStyler.setFontInternalProperty,
            TextBaseStyler.resetFontInternalProperty,
            TextBaseStyler.getNativeFontInternalValue), "TextBase");

        style.registerHandler(style.textAlignmentProperty, new style.StylePropertyChangedHandler(
            TextBaseStyler.setTextAlignmentProperty,
            TextBaseStyler.resetTextAlignmentProperty,
            TextBaseStyler.getNativeTextAlignmentValue), "TextBase");

        style.registerHandler(style.textDecorationProperty, new style.StylePropertyChangedHandler(
            TextBaseStyler.setTextDecorationProperty,
            TextBaseStyler.resetTextDecorationProperty), "TextBase");

        style.registerHandler(style.textTransformProperty, new style.StylePropertyChangedHandler(
            TextBaseStyler.setTextTransformProperty,
            TextBaseStyler.resetTextTransformProperty), "TextBase");

        style.registerHandler(style.whiteSpaceProperty, new style.StylePropertyChangedHandler(
            TextBaseStyler.setWhiteSpaceProperty,
            TextBaseStyler.resetWhiteSpaceProperty), "TextBase");

        style.registerHandler(style.letterSpacingProperty, new style.StylePropertyChangedHandler(
            TextBaseStyler.setLetterSpacingProperty,
            TextBaseStyler.resetLetterSpacingProperty,
            TextBaseStyler.getLetterSpacingProperty), "TextBase");

        // !!! IMPORTANT !!! Button registrations were moved to button.android.ts to make sure they 
        // are executed when there is a Button on the page: https://github.com/NativeScript/NativeScript/issues/1902
        // If there is no TextBase on the Page, the TextBaseStyler.registerHandlers
        // method was never called because the file it is called from was never required.
    }
}
