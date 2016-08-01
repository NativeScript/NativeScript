import common = require("./button-common");
import utils = require("utils/utils")
import dependencyObservable = require("ui/core/dependency-observable");
import style = require("ui/styling/style");
import { TextBaseStyler as TBS } from "ui/text-base/text-base-styler";
import {device} from "platform";

global.moduleMerge(common, exports);

export class Button extends common.Button {
    private _android: android.widget.Button;
    private _isPressed: boolean;

    constructor() {
        super();

        this._isPressed = false;
    }

    get android(): android.widget.Button {
        return this._android;
    }

    public _createUI() {

        var that = new WeakRef(this);

        this._android = new android.widget.Button(this._context);

        this._android.setOnClickListener(new android.view.View.OnClickListener(
            <utils.Owned & android.view.View.IOnClickListener>{
                get owner() {
                    return that.get();
                },

                onClick: function (v) {
                    if (this.owner) {
                        this.owner._emit(common.Button.tapEvent);
                    }
                }
            }));

        this._android.setOnTouchListener(new android.view.View.OnTouchListener(
            <utils.Owned & android.view.View.IOnTouchListener>{
                get owner() {
                    return that.get();
                },

                onTouch: function (v, ev) {
                    if (ev.getAction() === 0) { // down
                        this.owner._goToVisualState("highlighted");
                    }
                    else if (ev.getAction() === 1) { // up
                        this.owner._goToVisualState("normal");
                    }
                    return false;
                }
            }
        ));
    }

    public _onTextPropertyChanged(data: dependencyObservable.PropertyChangeData) {
        if (this.android) {
            this.android.setText(data.newValue + "");
        }
    }

    private _transformationMethod;
    public _setFormattedTextPropertyToNative(value) {
        var newText = value ? value._formattedText : null;
        if (this.android) {
            if (newText) {
                if (!this._transformationMethod) {
                    this._transformationMethod = this.android.getTransformationMethod();
                }
                this.android.setTransformationMethod(null);
            } else {
                if (this._transformationMethod && !this.android.getTransformationMethod()) {
                    this.android.setTransformationMethod(this._transformationMethod);
                }
            }

            this.android.setText(newText);
        }
    }
}

export class ButtonStyler implements style.Styler {
    public static registerHandlers() {
        // !!! IMPORTANT !!! This was moved here because of the following bug: https://github.com/NativeScript/NativeScript/issues/1902
        // If there is no TextBase on the Page, the TextBaseStyler.registerHandlers
        // method was never called because the file it is called from was never required.

        // Register the same stylers for Button.
        // It also derives from TextView but is not under TextBase in our View hierarchy.
        var TextBaseStyler = <any>TBS;
        style.registerHandler(style.colorProperty, new style.StylePropertyChangedHandler(
            TextBaseStyler.setColorProperty,
            TextBaseStyler.resetColorProperty,
            TextBaseStyler.getNativeColorValue), "Button");

        style.registerHandler(style.fontInternalProperty, new style.StylePropertyChangedHandler(
            TextBaseStyler.setFontInternalProperty,
            TextBaseStyler.resetFontInternalProperty,
            TextBaseStyler.getNativeFontInternalValue), "Button");

        style.registerHandler(style.textAlignmentProperty, new style.StylePropertyChangedHandler(
            TextBaseStyler.setTextAlignmentProperty,
            TextBaseStyler.resetTextAlignmentProperty,
            TextBaseStyler.getNativeTextAlignmentValue), "Button");

        style.registerHandler(style.textDecorationProperty, new style.StylePropertyChangedHandler(
            TextBaseStyler.setTextDecorationProperty,
            TextBaseStyler.resetTextDecorationProperty), "Button");

        style.registerHandler(style.textTransformProperty, new style.StylePropertyChangedHandler(
            TextBaseStyler.setTextTransformProperty,
            TextBaseStyler.resetTextTransformProperty), "Button");

        style.registerHandler(style.whiteSpaceProperty, new style.StylePropertyChangedHandler(
            TextBaseStyler.setWhiteSpaceProperty,
            TextBaseStyler.resetWhiteSpaceProperty), "Button");

        if (parseInt(device.sdkVersion, 10) >= 21) {
            style.registerHandler(style.letterSpacingProperty, new style.StylePropertyChangedHandler(
                TextBaseStyler.setLetterSpacingProperty,
                TextBaseStyler.resetLetterSpacingProperty,
                TextBaseStyler.getLetterSpacingProperty), "Button");
        }
    }
}

ButtonStyler.registerHandlers();