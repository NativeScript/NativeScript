import common = require("./button-common");
import stateChanged = require("ui/core/control-state-change");
import style = require("ui/styling/style");
import font = require("ui/styling/font");
import view = require("ui/core/view");
import utils = require("utils/utils");
import enums = require("ui/enums");
import dependencyObservable = require("ui/core/dependency-observable");
import types = require("utils/types");
import {PseudoClassHandler} from "ui/core/view";

class TapHandlerImpl extends NSObject {
    private _owner: WeakRef<Button>;

    public static initWithOwner(owner: WeakRef<Button>): TapHandlerImpl {
        let handler = <TapHandlerImpl>TapHandlerImpl.new();
        handler._owner = owner;
        return handler;
    }

    public tap(args) {
        let owner = this._owner.get();
        if (owner) {
            owner._emit(common.Button.tapEvent);
        }
    }

    public static ObjCExposedMethods = {
        "tap": { returns: interop.types.void, params: [interop.types.id] }
    };
}

global.moduleMerge(common, exports);

export class Button extends common.Button {
    private _ios: UIButton;
    private _tapHandler: NSObject;
    private _stateChangedHandler: stateChanged.ControlStateChangeListener;

    constructor() {
        super();
        this._ios = UIButton.buttonWithType(UIButtonType.UIButtonTypeSystem);

        this._tapHandler = TapHandlerImpl.initWithOwner(new WeakRef(this));
        this._ios.addTargetActionForControlEvents(this._tapHandler, "tap", UIControlEvents.UIControlEventTouchUpInside);
    }

    get ios(): UIButton {
        return this._ios;
    }

    public _onTextPropertyChanged(data: dependencyObservable.PropertyChangeData) {
        // In general, if a property is not specified for a state, the default is to use
        // the UIControlStateNormal value. If the value for UIControlStateNormal is not set,
        // then the property defaults to a system value. Therefore, at a minimum, you should
        // set the value for the normal state.
        this.ios.setTitleForState(data.newValue + "", UIControlState.UIControlStateNormal);
    }

    public _setFormattedTextPropertyToNative(value) {
        // In general, if a property is not specified for a state, the default is to use
        // the UIControlStateNormal value. If the value for UIControlStateNormal is not set,
        // then the property defaults to a system value. Therefore, at a minimum, you should
        // set the value for the normal state.
        let newText = value ? value._formattedText : null;
        this.ios.setAttributedTitleForState(newText, UIControlState.UIControlStateNormal);
        //RemoveThisDoubleCall
        this.style._updateTextDecoration();
        this.style._updateTextTransform();
    }

    public onUnloaded() {
        super.onUnloaded();
        if (this._stateChangedHandler) {
            this._stateChangedHandler.stop();
        }
    }

    @PseudoClassHandler("normal", "highlighted")
    _updateHandler(subscribe: boolean) {
        if (subscribe) {
            if (!this._stateChangedHandler) {
                this._stateChangedHandler = new stateChanged.ControlStateChangeListener(this._ios, (s: string) => {
                    this._goToVisualState(s);
                });
            }
            this._stateChangedHandler.start();
        } else {
            this._stateChangedHandler.stop();
        }
    }
}

export class ButtonStyler implements style.Styler {
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
    private static setFontInternalProperty(view: view.View, newValue: any, nativeValue?: any) {
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
        utils.ios.setTextAlignment(btn.titleLabel, newValue);

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

    // text-decoration
    private static setTextDecorationProperty(view: view.View, newValue: any) {
        ButtonStyler._setButtonTextDecorationAndTransform(<Button>view, newValue, view.style.textTransform, view.style.letterSpacing);
    }

    private static resetTextDecorationProperty(view: view.View, nativeValue: any) {
        ButtonStyler._setButtonTextDecorationAndTransform(<Button>view, enums.TextDecoration.none, view.style.textTransform, view.style.letterSpacing);
    }

    // text-transform
    private static setTextTransformProperty(view: view.View, newValue: any) {
        ButtonStyler._setButtonTextDecorationAndTransform(<Button>view, view.style.textDecoration, newValue, view.style.letterSpacing);
    }

    private static resetTextTransformProperty(view: view.View, nativeValue: any) {
        ButtonStyler._setButtonTextDecorationAndTransform(<Button>view, view.style.textDecoration, enums.TextTransform.none, view.style.letterSpacing);
    }

    // letter-spacing
    private static setLetterSpacingProperty(view: view.View, newValue: any) {
        ButtonStyler._setButtonTextDecorationAndTransform(<Button>view, view.style.textDecoration, view.style.textTransform, newValue);
    }

    private static resetLetterSpacingProperty(view: view.View, nativeValue: any) {
        ButtonStyler._setButtonTextDecorationAndTransform(<Button>view, view.style.textDecoration, view.style.textTransform, 0);
    }

    // white-space
    private static setWhiteSpaceProperty(view: view.View, newValue: any) {
        utils.ios.setWhiteSpace((<UIButton>view.ios).titleLabel, newValue, view.ios);
    }

    private static resetWhiteSpaceProperty(view: view.View, nativeValue: any) {
        utils.ios.setWhiteSpace((<UIButton>view.ios).titleLabel, enums.WhiteSpace.normal, view.ios);
    }

    public static registerHandlers() {
        style.registerHandler(style.colorProperty, new style.StylePropertyChangedHandler(
            ButtonStyler.setColorProperty,
            ButtonStyler.resetColorProperty,
            ButtonStyler.getNativeColorValue), "Button");

        style.registerHandler(style.fontInternalProperty, new style.StylePropertyChangedHandler(
            ButtonStyler.setFontInternalProperty,
            ButtonStyler.resetFontInternalProperty,
            ButtonStyler.getNativeFontInternalValue), "Button");

        style.registerHandler(style.textAlignmentProperty, new style.StylePropertyChangedHandler(
            ButtonStyler.setTextAlignmentProperty,
            ButtonStyler.resetTextAlignmentProperty,
            ButtonStyler.getNativeTextAlignmentValue), "Button");

        style.registerHandler(style.nativePaddingsProperty, new style.StylePropertyChangedHandler(
            ButtonStyler.setPaddingProperty,
            ButtonStyler.resetPaddingProperty), "Button");

        style.registerHandler(style.textDecorationProperty, new style.StylePropertyChangedHandler(
            ButtonStyler.setTextDecorationProperty,
            ButtonStyler.resetTextDecorationProperty), "Button");

        style.registerHandler(style.textTransformProperty, new style.StylePropertyChangedHandler(
            ButtonStyler.setTextTransformProperty,
            ButtonStyler.resetTextTransformProperty), "Button");

        style.registerHandler(style.letterSpacingProperty, new style.StylePropertyChangedHandler(
            ButtonStyler.setLetterSpacingProperty,
            ButtonStyler.resetLetterSpacingProperty), "Button");

        style.registerHandler(style.whiteSpaceProperty, new style.StylePropertyChangedHandler(
            ButtonStyler.setWhiteSpaceProperty,
            ButtonStyler.resetWhiteSpaceProperty), "Button");
    }

    private static _setButtonTextDecorationAndTransform(button: Button, decoration: string, transform: string, letterSpacing: number) {
        let hasLetterSpacing = types.isNumber(letterSpacing) && !isNaN(letterSpacing);

        if (button.formattedText) {
            if (button.style.textDecoration.indexOf(enums.TextDecoration.none) === -1) {
                
                if (button.style.textDecoration.indexOf(enums.TextDecoration.underline) !== -1) {
                    button.formattedText.underline = NSUnderlineStyle.NSUnderlineStyleSingle;
                }

                if (button.style.textDecoration.indexOf(enums.TextDecoration.lineThrough) !== -1) {
                    button.formattedText.strikethrough = NSUnderlineStyle.NSUnderlineStyleSingle;
                }
            } 
            else {
                button.formattedText.underline = NSUnderlineStyle.NSUnderlineStyleNone;
            }

            for (let i = 0; i < button.formattedText.spans.length; i++) {
                let span = button.formattedText.spans.getItem(i);
                span.text = utils.ios.getTransformedText(button, span.text, transform);
            }
            
            if (hasLetterSpacing) {
                let attrText = NSMutableAttributedString.alloc().initWithAttributedString(button.ios.attributedTitleForState(UIControlState.UIControlStateNormal));
                attrText.addAttributeValueRange(NSKernAttributeName, letterSpacing * button.ios.font.pointSize, { location: 0, length: attrText.length });
                button.ios.setAttributedTitleForState(attrText, UIControlState.UIControlStateNormal);            
            }
        } 
        else {
            let source = button.text;
            let attributes = new Array();
            let range = { location: 0, length: source.length };

            let decorationValues = (decoration + "").split(" ");

            let dict = new Map<string, number>();
            if (decorationValues.indexOf(enums.TextDecoration.none) === -1 || hasLetterSpacing) {
                if (decorationValues.indexOf(enums.TextDecoration.underline) !== -1) {
                    dict.set(NSUnderlineStyleAttributeName, NSUnderlineStyle.NSUnderlineStyleSingle);
                }

                if (decorationValues.indexOf(enums.TextDecoration.lineThrough) !== -1) {
                    dict.set(NSStrikethroughStyleAttributeName, NSUnderlineStyle.NSUnderlineStyleSingle);
                }

                if (hasLetterSpacing) {
                    dict.set(NSKernAttributeName, letterSpacing * button.ios.font.pointSize);
                }
            }

            if (button.style.color && button.style.color.ios){
                dict.set(NSForegroundColorAttributeName, button.style.color.ios);
            }
            
            if (dict.size > 0){
                attributes.push({ attrs: dict, range: NSValue.valueWithRange(range) });
            }

            source = utils.ios.getTransformedText(button, source, transform);

            let result = NSMutableAttributedString.alloc().initWithString(source);
            if (attributes.length > 0) {
                for (let i = 0; i < attributes.length; i++) {
                    result.setAttributesRange(attributes[i]["attrs"], attributes[i]["range"].rangeValue);
                }

                button.ios.setAttributedTitleForState(result, UIControlState.UIControlStateNormal);
            } 
            else {
                button.ios.setAttributedTitleForState(result, UIControlState.UIControlStateNormal);
                button.ios.setTitleForState(source, UIControlState.UIControlStateNormal);
            }
        }
    }
}

ButtonStyler.registerHandlers();
