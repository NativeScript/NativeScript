import {
    ButtonBase, textProperty, formattedTextProperty, TouchGestureEventData, FormattedString, GestureTypes, TouchAction,
    PseudoClassHandler
} from "./button-common";

export * from "./button-common";

@Interfaces([android.view.View.OnClickListener])
class ClickListener extends java.lang.Object implements android.view.View.OnClickListener {
    constructor(public owner: WeakRef<Button>) {
        super();
        return global.__native(this);
    }

    public onClick(v: android.view.View): void {
        let btn = this.owner.get();
        if (btn) {
            btn._emit(ButtonBase.tapEvent);
        }
    }
}

export class Button extends ButtonBase {
    _button: android.widget.Button;
    private _isPressed: boolean;
    private _transformationMethod;
    private _highlightedHandler: (args: TouchGestureEventData) => void;

    get android(): android.widget.Button {
        return this._button;
    }

    public _createUI() {
        let weakRef = new WeakRef(this);
        this._button = new android.widget.Button(this._context);
        this._button.setOnClickListener(new ClickListener(weakRef));
    }

    public _setFormattedTextPropertyToNative(value: FormattedString) {
        let newText = value ? value._formattedText : null;
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

        this._button.setText(newText);
    }

    @PseudoClassHandler("normal", "highlighted", "pressed", "active")
    _updateHandler(subscribe: boolean) {
        if (subscribe) {
            this._highlightedHandler = this._highlightedHandler || ((args: TouchGestureEventData) => {
                switch (args.action) {
                    case TouchAction.up:
                        this._goToVisualState("normal");
                        break;
                    case TouchAction.down:
                        this._goToVisualState("highlighted");
                        break;
                }
            });
            this.on(GestureTypes.touch, this._highlightedHandler);
        } else {
            this.off(GestureTypes.touch, this._highlightedHandler);
        }
    }
}