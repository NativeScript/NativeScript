import common = require("./button-common");
import stateChanged = require("ui/core/control-state-change");
import style = require("ui/styling/style");
import font = require("ui/styling/font");
import styling = require("ui/styling");
import view = require("ui/core/view");
import utils = require("utils/utils");
import enums = require("ui/enums");

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

        this._stateChangedHandler = new stateChanged.ControlStateChangeListener(this._ios, (s: string) => {
            this._goToVisualState(s);
        });
    }

    get ios(): UIButton {
        return this._ios;
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
        utils.ios.setTextDecoration((<UIButton>view.ios).titleLabel, newValue);
    }

    private static resetTextDecorationProperty(view: view.View, nativeValue: any) {
        utils.ios.setTextDecoration((<UIButton>view.ios).titleLabel, enums.TextDecoration.none);
    }

    // text-transform
    private static setTextTransformProperty(view: view.View, newValue: any) {
        utils.ios.setTextTransform(view.ios, newValue);
    }

    private static resetTextTransformProperty(view: view.View, nativeValue: any) {
        utils.ios.setTextTransform(view.ios, enums.TextTransform.none);
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

        style.registerHandler(style.whiteSpaceProperty, new style.StylePropertyChangedHandler(
            ButtonStyler.setWhiteSpaceProperty,
            ButtonStyler.resetWhiteSpaceProperty), "Button");
    }
}

ButtonStyler.registerHandlers();
