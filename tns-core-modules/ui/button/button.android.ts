import {
    ButtonBase, PseudoClassHandler,
    paddingLeftProperty, paddingTopProperty, paddingRightProperty, paddingBottomProperty,
    Length, zIndexProperty, textAlignmentProperty, TextAlignment
} from "./button-common";
import { profile } from "../../profiling";
import { TouchGestureEventData, GestureTypes, TouchAction } from "../gestures";

export * from "./button-common";

interface ClickListener {
    new(owner: Button): android.view.View.OnClickListener;
}

let ClickListener: ClickListener;
let APILEVEL: number;
let AndroidButton: typeof android.widget.Button;

function initializeClickListener(): void {
    if (ClickListener) {
        return;
    }

    @Interfaces([android.view.View.OnClickListener])
    class ClickListenerImpl extends java.lang.Object implements android.view.View.OnClickListener {
        constructor(public owner: Button) {
            super();
            return global.__native(this);
        }

        public onClick(v: android.view.View): void {
            const owner = this.owner;
            if (owner) {
                owner._emit(ButtonBase.tapEvent);
            }
        }
    }

    ClickListener = ClickListenerImpl;
    APILEVEL = android.os.Build.VERSION.SDK_INT;
    AndroidButton = android.widget.Button;
}

export class Button extends ButtonBase {
    nativeViewProtected: android.widget.Button;

    private _stateListAnimator: any;
    private _highlightedHandler: (args: TouchGestureEventData) => void;

    @profile
    public createNativeView() {
        initializeClickListener();
        const button = new AndroidButton(this._context);
        const clickListener = new ClickListener(this);
        button.setOnClickListener(clickListener);
        (<any>button).clickListener = clickListener;
        return button;
    }

    public initNativeView(): void {
        const nativeView = this.nativeViewProtected;
        (<any>nativeView).clickListener.owner = this;
        super.initNativeView();
    }

    public disposeNativeView() {
        (<any>this.nativeViewProtected).clickListener.owner = null;
        super.disposeNativeView();
    }

    public resetNativeView(): void {
        super.resetNativeView();

        if (this._stateListAnimator && APILEVEL >= 21) {
            (<any>this.nativeViewProtected).setStateListAnimator(this._stateListAnimator);
            this._stateListAnimator = undefined;
        }
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

    [paddingTopProperty.getDefault](): Length {
        return { value: this._defaultPaddingTop, unit: "px" }
    }
    [paddingTopProperty.setNative](value: Length) {
        org.nativescript.widgets.ViewHelper.setPaddingTop(this.nativeViewProtected, Length.toDevicePixels(value, 0) + Length.toDevicePixels(this.style.borderTopWidth, 0));
    }

    [paddingRightProperty.getDefault](): Length {
        return { value: this._defaultPaddingRight, unit: "px" }
    }
    [paddingRightProperty.setNative](value: Length) {
        org.nativescript.widgets.ViewHelper.setPaddingRight(this.nativeViewProtected, Length.toDevicePixels(value, 0) + Length.toDevicePixels(this.style.borderRightWidth, 0));
    }

    [paddingBottomProperty.getDefault](): Length {
        return { value: this._defaultPaddingBottom, unit: "px" }
    }
    [paddingBottomProperty.setNative](value: Length) {
        org.nativescript.widgets.ViewHelper.setPaddingBottom(this.nativeViewProtected, Length.toDevicePixels(value, 0) + Length.toDevicePixels(this.style.borderBottomWidth, 0));
    }

    [paddingLeftProperty.getDefault](): Length {
        return { value: this._defaultPaddingLeft, unit: "px" }
    }
    [paddingLeftProperty.setNative](value: Length) {
        org.nativescript.widgets.ViewHelper.setPaddingLeft(this.nativeViewProtected, Length.toDevicePixels(value, 0) + Length.toDevicePixels(this.style.borderLeftWidth, 0));
    }

    [zIndexProperty.setNative](value: number) {
        // API >= 21
        if (APILEVEL >= 21) {
            const nativeView = this.nativeViewProtected;
            if (!this._stateListAnimator) {
                this._stateListAnimator = (<any>nativeView).getStateListAnimator();
            }
            (<any>nativeView).setStateListAnimator(null);
        }

        org.nativescript.widgets.ViewHelper.setZIndex(this.nativeViewProtected, value);
    }

    [textAlignmentProperty.setNative](value: TextAlignment) {
        // Button initial value is center.
        const newValue = value === "initial" ? "center" : value;
        super[textAlignmentProperty.setNative](newValue);
    }
}