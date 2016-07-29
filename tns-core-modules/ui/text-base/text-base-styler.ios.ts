import view = require("ui/core/view");
import utils = require("utils/utils");
import style = require("ui/styling/style");
import font = require("ui/styling/font");
import enums = require("ui/enums");
import types = require("utils/types");
import { TextBase } from "ui/text-base";

export class TextBaseStyler implements style.Styler {
    // font
    private static setFontInternalProperty(textBase: TextBase, newValue: any, nativeValue?: any) {
        var ios = <utils.ios.TextUIView>textBase._nativeView;
        ios.font = (<font.Font>newValue).getUIFont(nativeValue);
    }

    private static resetFontInternalProperty(textBase: TextBase, nativeValue: any) {
        var ios = <utils.ios.TextUIView>textBase._nativeView;
        ios.font = nativeValue;
    }

    private static getNativeFontInternalValue(textBase: TextBase): any {
        var ios = <utils.ios.TextUIView>textBase._nativeView;
        return ios.font;
    }

    // text-align
    private static setTextAlignmentProperty(textBase: TextBase, newValue: any) {
        utils.ios.setTextAlignment(textBase._nativeView, newValue);
    }

    private static resetTextAlignmentProperty(textBase: TextBase, nativeValue: any) {
        var ios = <utils.ios.TextUIView>textBase._nativeView;
        ios.textAlignment = nativeValue;
    }

    private static getNativeTextAlignmentValue(textBase: TextBase): any {
        var ios = <utils.ios.TextUIView>textBase._nativeView;
        return ios.textAlignment;
    }

    // text-decoration
    private static setTextDecorationProperty(textBase: TextBase, newValue: any) {
        TextBaseStyler._setTextBaseTextDecorationAndTransform(textBase, newValue, textBase.style.textTransform, textBase.style.letterSpacing);
    }

    private static resetTextDecorationProperty(textBase: TextBase, nativeValue: any) {
        TextBaseStyler._setTextBaseTextDecorationAndTransform(textBase, enums.TextDecoration.none, textBase.style.textTransform, textBase.style.letterSpacing);
    }

    // text-transform
    private static setTextTransformProperty(textBase: TextBase, newValue: any) {
        TextBaseStyler._setTextBaseTextDecorationAndTransform(textBase, textBase.style.textDecoration, newValue, textBase.style.letterSpacing);
    }

    private static resetTextTransformProperty(textBase: TextBase, nativeValue: any) {
        TextBaseStyler._setTextBaseTextDecorationAndTransform(textBase, textBase.style.textDecoration, enums.TextTransform.none, textBase.style.letterSpacing);
    }

    // letter-spacing
    private static setLetterSpacingProperty(textBase: TextBase, newValue: any) {
        TextBaseStyler._setTextBaseTextDecorationAndTransform(textBase, textBase.style.textDecoration, textBase.style.textTransform, newValue);
    }

    private static resetLetterSpacingProperty(textBase: TextBase, nativeValue: any) {
        TextBaseStyler._setTextBaseTextDecorationAndTransform(textBase, textBase.style.textDecoration, textBase.style.textTransform, 0);
    }

    // white-space
    private static setWhiteSpaceProperty(textBase: view.View, newValue: any) {
        utils.ios.setWhiteSpace(textBase._nativeView, newValue);
    }

    private static resetWhiteSpaceProperty(textBase: view.View, nativeValue: any) {
        utils.ios.setWhiteSpace(textBase._nativeView, enums.WhiteSpace.normal);
    }

    // color
    private static setColorProperty(textBase: view.View, newValue: any) {
        var ios = <utils.ios.TextUIView>textBase._nativeView;
        ios.textColor = newValue;
    }

    private static resetColorProperty(textBase: view.View, nativeValue: any) {
        var ios = <utils.ios.TextUIView>textBase._nativeView;
        ios.textColor = nativeValue;
    }

    private static getNativeColorValue(textBase: view.View): any {
        var ios = <utils.ios.TextUIView>textBase._nativeView;
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
        
    private static _setTextBaseTextDecorationAndTransform(textBase: TextBase, decoration: string, transform: string, letterSpacing: number) {
        // if (!textBase["counter"]){
        //     textBase["counter"] = 0;
        // }
        // textBase["counter"]++;
        // console.log(`>>> ${textBase["counter"]} ${textBase} ${decoration}; ${transform}; ${letterSpacing}; text: ${textBase.text}; formattedText: ${textBase.formattedText}; isLoaded: ${textBase.isLoaded};`);
        
        let hasLetterSpacing = types.isNumber(letterSpacing) && !isNaN(letterSpacing);
        let nativeView = <utils.ios.TextUIView>textBase._nativeView;

        if (textBase.formattedText) {
            if (textBase.style.textDecoration.indexOf(enums.TextDecoration.none) === -1) {

                if (textBase.style.textDecoration.indexOf(enums.TextDecoration.underline) !== -1) {
                    textBase.formattedText.underline = NSUnderlineStyle.NSUnderlineStyleSingle;
                }

                if (textBase.style.textDecoration.indexOf(enums.TextDecoration.lineThrough) !== -1) {
                    textBase.formattedText.strikethrough = NSUnderlineStyle.NSUnderlineStyleSingle;
                }
            } 
            else {
                textBase.formattedText.underline = NSUnderlineStyle.NSUnderlineStyleNone;
            }

            for (let i = 0; i < textBase.formattedText.spans.length; i++) {
                let span = textBase.formattedText.spans.getItem(i);
                span.text = utils.ios.getTransformedText(textBase, span.text, transform);
            }
            
            if (hasLetterSpacing) {
                let attrText = NSMutableAttributedString.alloc().initWithAttributedString(nativeView.attributedText);
                attrText.addAttributeValueRange(NSKernAttributeName, letterSpacing * (<UIFont>nativeView.font).pointSize, { location: 0, length: attrText.length });
                nativeView.attributedText = attrText;
            }
        } 
        else {
            let source = textBase.text;
            let attributes = new Array();
            let range = { location: 0, length: source.length };

            var decorationValues = (decoration + "").split(" ");

            if (decorationValues.indexOf(enums.TextDecoration.none) === -1 || hasLetterSpacing) {
                let dict = new Map<string, number>();

                if (decorationValues.indexOf(enums.TextDecoration.underline) !== -1) {
                    dict.set(NSUnderlineStyleAttributeName, NSUnderlineStyle.NSUnderlineStyleSingle);
                }

                if (decorationValues.indexOf(enums.TextDecoration.lineThrough) !== -1) {
                    dict.set(NSStrikethroughStyleAttributeName, NSUnderlineStyle.NSUnderlineStyleSingle);
                }

                if (hasLetterSpacing) {
                    dict.set(NSKernAttributeName, letterSpacing * (<UIFont>nativeView.font).pointSize);
                }

                attributes.push({ attrs: dict, range: NSValue.valueWithRange(range) });
            }

            source = utils.ios.getTransformedText(textBase, source, transform);

            if (attributes.length > 0) {
                let result = NSMutableAttributedString.alloc().initWithString(<string>source);
                for (let i = 0; i < attributes.length; i++) {
                    result.setAttributesRange(attributes[i]["attrs"], attributes[i]["range"].rangeValue);
                }
                nativeView.attributedText = result;
            } 
            else {
                nativeView.text = source;
            }
        }
    }
}
