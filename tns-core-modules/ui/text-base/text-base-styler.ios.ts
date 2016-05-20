import view = require("ui/core/view");
import utils = require("utils/utils");
import style = require("ui/styling/style");
import font = require("ui/styling/font");
import enums = require("ui/enums");

export class TextBaseStyler implements style.Styler {
    // font
    private static setFontInternalProperty(view: view.View, newValue: any, nativeValue?: any) {
        var ios = <utils.ios.TextUIView>view._nativeView;
        ios.font = (<font.Font>newValue).getUIFont(nativeValue);
    }

    private static resetFontInternalProperty(view: view.View, nativeValue: any) {
        var ios = <utils.ios.TextUIView>view._nativeView;
        ios.font = nativeValue;
    }

    private static getNativeFontInternalValue(view: view.View): any {
        var ios = <utils.ios.TextUIView>view._nativeView;
        return ios.font;
    }

    // text-align
    private static setTextAlignmentProperty(view: view.View, newValue: any) {
        utils.ios.setTextAlignment(view._nativeView, newValue);
    }

    private static resetTextAlignmentProperty(view: view.View, nativeValue: any) {
        var ios = <utils.ios.TextUIView>view._nativeView;
        ios.textAlignment = nativeValue;
    }

    private static getNativeTextAlignmentValue(view: view.View): any {
        var ios = <utils.ios.TextUIView>view._nativeView;
        return ios.textAlignment;
    }

    // text-decoration
    private static setTextDecorationProperty(view: view.View, newValue: any) {
        utils.ios.setTextDecorationAndTransform(view, newValue, view.style.textTransform, view.style.letterSpacing);
    }

    private static resetTextDecorationProperty(view: view.View, nativeValue: any) {
        utils.ios.setTextDecorationAndTransform(view, enums.TextDecoration.none, view.style.textTransform, view.style.letterSpacing);
    }

    // text-transform
    private static setTextTransformProperty(view: view.View, newValue: any) {
        utils.ios.setTextDecorationAndTransform(view, view.style.textDecoration, newValue, view.style.letterSpacing);
    }

    private static resetTextTransformProperty(view: view.View, nativeValue: any) {
        utils.ios.setTextDecorationAndTransform(view, view.style.textDecoration, enums.TextTransform.none, view.style.letterSpacing);
    }

    // white-space
    private static setWhiteSpaceProperty(view: view.View, newValue: any) {
        utils.ios.setWhiteSpace(view._nativeView, newValue);
    }

    private static resetWhiteSpaceProperty(view: view.View, nativeValue: any) {
        utils.ios.setWhiteSpace(view._nativeView, enums.WhiteSpace.normal);
    }
    
    // letter-spacing
    private static setLetterSpacingProperty(view: view.View, newValue: any) {
        utils.ios.setTextDecorationAndTransform(view, view.style.textDecoration, enums.TextTransform.none, newValue);
    }

    private static resetLetterSpacingProperty(view: view.View, nativeValue: any) {
        utils.ios.setTextDecorationAndTransform(view, view.style.textDecoration, enums.TextTransform.none, 0);
    }

    // color
    private static setColorProperty(view: view.View, newValue: any) {
        var ios = <utils.ios.TextUIView>view._nativeView;
        ios.textColor = newValue;
    }

    private static resetColorProperty(view: view.View, nativeValue: any) {
        var ios = <utils.ios.TextUIView>view._nativeView;
        ios.textColor = nativeValue;
    }

    private static getNativeColorValue(view: view.View): any {
        var ios = <utils.ios.TextUIView>view._nativeView;
        return ios.textColor;
    }

    public static registerHandlers() {
        style.registerHandler(style.fontInternalProperty, new style.StylePropertyChangedHandler(
            TextBaseStyler.setFontInternalProperty,
            TextBaseStyler.resetFontInternalProperty,
            TextBaseStyler.getNativeFontInternalValue), "TextBase");

        style.registerHandler(style.textAlignmentProperty, new style.StylePropertyChangedHandler(
            TextBaseStyler.setTextAlignmentProperty,
            TextBaseStyler.resetTextAlignmentProperty,
            TextBaseStyler.getNativeTextAlignmentValue), "TextBase");

        style.registerHandler(style.colorProperty, new style.StylePropertyChangedHandler(
            TextBaseStyler.setColorProperty,
            TextBaseStyler.resetColorProperty,
            TextBaseStyler.getNativeColorValue), "TextBase");

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
            TextBaseStyler.resetLetterSpacingProperty), "TextBase");            
    }
}
