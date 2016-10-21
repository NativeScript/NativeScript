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
        this._ios = UIButton.buttonWithType(UIButtonType.System);

        this._tapHandler = TapHandlerImpl.initWithOwner(new WeakRef(this));
        this._ios.addTargetActionForControlEvents(this._tapHandler, "tap", UIControlEvents.TouchUpInside);
    }

    get ios(): UIButton {
        return this._ios;
    }

    public _onTextPropertyChanged(data: dependencyObservable.PropertyChangeData) {
        // In general, if a property is not specified for a state, the default is to use
        // the UIControlState.Normal value. If the value for UIControlState.Normal is not set,
        // then the property defaults to a system value. Therefore, at a minimum, you should
        // set the value for the normal state.
        this.ios.setTitleForState(data.newValue + "", UIControlState.Normal);
        
        //https://github.com/NativeScript/NativeScript/issues/2615
        let attributedTitle = this.ios.attributedTitleForState(UIControlState.Normal);
        if (attributedTitle !== null){
            ButtonStyler._setButtonTextDecorationAndTransform(this, this.style.textDecoration, this.style.textTransform, this.style.letterSpacing);
        }
    }

    public _setFormattedTextPropertyToNative(value) {
        // In general, if a property is not specified for a state, the default is to use
        // the UIControlState.Normal value. If the value for UIControlState.Normal is not set,
        // then the property defaults to a system value. Therefore, at a minimum, you should
        // set the value for the normal state.
        let newText = value ? value._formattedText : null;
        this.ios.setAttributedTitleForState(newText, UIControlState.Normal);
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

    @PseudoClassHandler("normal", "highlighted", "pressed", "active")
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
        btn.setTitleColorForState(newValue, UIControlState.Normal);
    }

    private static resetColorProperty(view: view.View, nativeValue: any) {
        var btn: UIButton = <UIButton>view._nativeView;
        btn.setTitleColorForState(nativeValue, UIControlState.Normal);
    }

    private static getNativeColorValue(view: view.View): any {
        var btn: UIButton = <UIButton>view._nativeView;
        return btn.titleColorForState(UIControlState.Normal);
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
                btn.contentHorizontalAlignment = UIControlContentHorizontalAlignment.Left;
                break;
            case enums.TextAlignment.center:
                btn.contentHorizontalAlignment = UIControlContentHorizontalAlignment.Center;
                break;
            case enums.TextAlignment.right:
                btn.contentHorizontalAlignment = UIControlContentHorizontalAlignment.Right;
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

    // Borders
    private static setBorderTopWidthProperty(view: view.View, newValue: number) {
        ButtonStyler.setNativeBorderTopWidth(view, newValue);
    }

    private static resetBorderTopWidthProperty(view: view.View, nativeValue: number) {
        ButtonStyler.setNativeBorderTopWidth(view, nativeValue);
    }

    private static setNativeBorderTopWidth(view: view.View, newValue: number) {
        let nativeButton = <UIButton>view._nativeView; 
        let top = view.style.paddingTop + newValue;
        let left = nativeButton.contentEdgeInsets.left;
        let bottom = nativeButton.contentEdgeInsets.bottom;
        let right = nativeButton.contentEdgeInsets.right;
        nativeButton.contentEdgeInsets = UIEdgeInsetsFromString(`{${top},${left},${bottom},${right}}`);
    }

    private static setBorderRightWidthProperty(view: view.View, newValue: number) {
        ButtonStyler.setNativeBorderRightWidth(view, newValue);
    }

    private static resetBorderRightWidthProperty(view: view.View, nativeValue: number) {
        ButtonStyler.setNativeBorderRightWidth(view, nativeValue);
    }

    private static setNativeBorderRightWidth(view: view.View, newValue: number) {
        let nativeButton = <UIButton>view._nativeView; 
        let top = nativeButton.contentEdgeInsets.top;
        let left = nativeButton.contentEdgeInsets.left;
        let bottom = nativeButton.contentEdgeInsets.bottom;
        let right = view.style.paddingRight + newValue;
        nativeButton.contentEdgeInsets = UIEdgeInsetsFromString(`{${top},${left},${bottom},${right}}`);
    }

    private static setBorderBottomWidthProperty(view: view.View, newValue: number) {
        ButtonStyler.setNativeBorderBottomWidth(view, newValue);
    }

    private static resetBorderBottomWidthProperty(view: view.View, nativeValue: number) {
        ButtonStyler.setNativeBorderBottomWidth(view, nativeValue);
    }

    private static setNativeBorderBottomWidth(view: view.View, newValue: number) {
        let nativeButton = <UIButton>view._nativeView; 
        let top = nativeButton.contentEdgeInsets.top;
        let left = nativeButton.contentEdgeInsets.left;
        let bottom = view.style.paddingBottom + newValue;
        let right = nativeButton.contentEdgeInsets.right;
        nativeButton.contentEdgeInsets = UIEdgeInsetsFromString(`{${top},${left},${bottom},${right}}`);
    }

    private static setBorderLeftWidthProperty(view: view.View, newValue: number) {
        ButtonStyler.setNativeBorderLeftWidth(view, newValue);
    }

    private static resetBorderLeftWidthProperty(view: view.View, nativeValue: number) {
        ButtonStyler.setNativeBorderLeftWidth(view, nativeValue);
    }

    private static setNativeBorderLeftWidth(view: view.View, newValue: number) {
        let nativeButton = <UIButton>view._nativeView; 
        let top = nativeButton.contentEdgeInsets.top;
        let left = view.style.paddingLeft + newValue;
        let bottom = nativeButton.contentEdgeInsets.bottom;
        let right = nativeButton.contentEdgeInsets.right;
        nativeButton.contentEdgeInsets = UIEdgeInsetsFromString(`{${top},${left},${bottom},${right}}`);
    }

    // Padding
    private static setPaddingProperty(view: view.View, newValue: any) {
        var top = newValue.top + view.borderTopWidth;
        var left = newValue.left + view.borderLeftWidth;
        var bottom = newValue.bottom + view.borderBottomWidth;
        var right = newValue.right + view.borderRightWidth;
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

        style.registerHandler(style.borderTopWidthProperty, new style.StylePropertyChangedHandler(
            ButtonStyler.setBorderTopWidthProperty,
            ButtonStyler.resetBorderTopWidthProperty), "Button");
        style.registerHandler(style.borderRightWidthProperty, new style.StylePropertyChangedHandler(
            ButtonStyler.setBorderRightWidthProperty,
            ButtonStyler.resetBorderRightWidthProperty), "Button");
        style.registerHandler(style.borderBottomWidthProperty, new style.StylePropertyChangedHandler(
            ButtonStyler.setBorderBottomWidthProperty,
            ButtonStyler.resetBorderBottomWidthProperty), "Button");
        style.registerHandler(style.borderLeftWidthProperty, new style.StylePropertyChangedHandler(
            ButtonStyler.setBorderLeftWidthProperty,
            ButtonStyler.resetBorderLeftWidthProperty), "Button");

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

    public static _setButtonTextDecorationAndTransform(button: Button, decoration: string, transform: string, letterSpacing: number) {
        let hasLetterSpacing = types.isNumber(letterSpacing) && !isNaN(letterSpacing);

        if (button.formattedText) {
            if (button.style.textDecoration.indexOf(enums.TextDecoration.none) === -1) {
                
                if (button.style.textDecoration.indexOf(enums.TextDecoration.underline) !== -1) {
                    button.formattedText.underline = NSUnderlineStyle.StyleSingle;
                }

                if (button.style.textDecoration.indexOf(enums.TextDecoration.lineThrough) !== -1) {
                    button.formattedText.strikethrough = NSUnderlineStyle.StyleSingle;
                }
            } 
            else {
                button.formattedText.underline = NSUnderlineStyle.StyleNone;
            }

            for (let i = 0; i < button.formattedText.spans.length; i++) {
                let span = button.formattedText.spans.getItem(i);
                span.text = utils.ios.getTransformedText(button, span.text, transform);
            }
            
            if (hasLetterSpacing) {
                let attrText = NSMutableAttributedString.alloc().initWithAttributedString(button.ios.attributedTitleForState(UIControlState.Normal));
                attrText.addAttributeValueRange(NSKernAttributeName, letterSpacing * button.ios.font.pointSize, { location: 0, length: attrText.length });
                button.ios.setAttributedTitleForState(attrText, UIControlState.Normal);            
            }
        } 
        else {
            let source = button.text;
            let decorationValues = (decoration + "").split(" ");
            let dict = new Map<string, number>();
            if (decorationValues.indexOf(enums.TextDecoration.none) === -1 || hasLetterSpacing) {
                if (decorationValues.indexOf(enums.TextDecoration.underline) !== -1) {
                    dict.set(NSUnderlineStyleAttributeName, NSUnderlineStyle.StyleSingle);
                }

                if (decorationValues.indexOf(enums.TextDecoration.lineThrough) !== -1) {
                    dict.set(NSStrikethroughStyleAttributeName, NSUnderlineStyle.StyleSingle);
                }

                if (hasLetterSpacing) {
                    dict.set(NSKernAttributeName, letterSpacing * button.ios.font.pointSize);
                }
            }

            let buttonColor = button.style.color;
            if (buttonColor){
                dict.set(NSForegroundColorAttributeName, buttonColor.ios);
            }
            
            source = utils.ios.getTransformedText(button, source, transform);

            let result = NSMutableAttributedString.alloc().initWithString(source);
            if (dict.size > 0) {
                result.setAttributesRange(<any>dict, NSValue.valueWithRange({ location: 0, length: source.length }).rangeValue);
            } 
            
            button.ios.setAttributedTitleForState(result, UIControlState.Normal);
            
            if (dict.size === 0) {
                button.ios.setTitleForState(source, UIControlState.Normal);
            }
        }
    }
}

ButtonStyler.registerHandlers();
