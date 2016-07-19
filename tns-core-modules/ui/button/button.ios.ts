import common = require("./button-common");
import stateChanged = require("ui/core/control-state-change");
import style = require("ui/styling/style");
import font = require("ui/styling/font");
import view = require("ui/core/view");
import utils = require("utils/utils");
import enums = require("ui/enums");
import dependencyObservable = require("ui/core/dependency-observable");
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
    }

    public _setFormattedTextPropertyToNative(value) {
        // In general, if a property is not specified for a state, the default is to use
        // the UIControlState.Normal value. If the value for UIControlState.Normal is not set,
        // then the property defaults to a system value. Therefore, at a minimum, you should
        // set the value for the normal state.
        let newText = value ? value._formattedText : null;
        this.ios.setAttributedTitleForState(newText, UIControlState.Normal);
        this.style._updateTextDecoration();
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

    // letter-spacing
    private static setLetterSpacingProperty(view: view.View, newValue: any) {
        utils.ios.setTextDecorationAndTransform(view, view.style.textDecoration, view.style.textTransform, newValue);
    }

    private static resetLetterSpacingProperty(view: view.View, nativeValue: any) {
        utils.ios.setTextDecorationAndTransform(view, view.style.textDecoration, view.style.textTransform, 0);
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
}

ButtonStyler.registerHandlers();
