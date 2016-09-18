import { ButtonBase, textProperty, formattedTextProperty, FormattedString } from "./button-common";
import { device } from "platform";


export * from "./button-common";

@Implements([android.view.View.OnClickListener])
class ClickListener implements android.view.View.OnClickListener {
    constructor(public owner: WeakRef<Button>) { }

    public onClick(v: android.view.View): void {
        this.owner.get()._emit(ButtonBase.tapEvent);
    }
}

@Implements([android.view.View.OnTouchListener])
class TouchListener implements android.view.View.OnTouchListener {
    constructor(public owner: WeakRef<Button>) { }

    public onTouch(v: android.view.View, event: android.view.MotionEvent): boolean {
        if (event.getAction() === 0) { // down
            this.owner.get()._goToVisualState("highlighted");
        }
        else if (event.getAction() === 1) { // up
            this.owner.get()._goToVisualState("normal");
        }
        return false;
    }
}

export class Button extends ButtonBase {
    nativeView: android.widget.Button;
    private _isPressed: boolean = false;
    private _transformationMethod;

    get android(): android.widget.Button {
        return this.nativeView;
    }

    public _createUI() {
        this.nativeView = new android.widget.Button(this._context);
        this.nativeView.setOnClickListener(new ClickListener(new WeakRef(this)));
        this.nativeView.setOnTouchListener(new TouchListener(new WeakRef(this)));
    }

    public _onTextPropertyChanged(data: dependencyObservable.PropertyChangeData) {
        if (this.android) {
            this.android.setText(data.newValue + "");
        }
    }


    public _setFormattedTextPropertyToNative(value) {

    }

    get [textProperty.native](): string {
        return this.nativeView.getText();
    }
    set [textProperty.native](value: string) {
        this.nativeView.setText(value);
    }

    get [formattedTextProperty.native](): string {
        return this.nativeView.getText();
    }
    set [formattedTextProperty.native](value: FormattedString) {
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

        this.android.setText(newText);
    }
}

    @PseudoClassHandler("normal", "highlighted", "pressed", "active")
    _updateHandler(subscribe: boolean) {
        if (subscribe) {
            this._highlightedHandler = this._highlightedHandler || ((args: TouchGestureEventData) => {
                switch(args.action) {
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

