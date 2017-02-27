import {
    ButtonBase, TouchGestureEventData, GestureTypes, TouchAction,
    PseudoClassHandler,
    paddingLeftProperty, paddingTopProperty, paddingRightProperty, paddingBottomProperty, Length, zIndexProperty
} from "./button-common";

export * from "./button-common";

interface ClickListener {
    new (owner: Button): android.view.View.OnClickListener;
}

let ClickListener: ClickListener;

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
            this.owner._emit(ButtonBase.tapEvent);
        }
    }

    ClickListener = ClickListenerImpl;
}

export class Button extends ButtonBase {
    _button: android.widget.Button;
    private _highlightedHandler: (args: TouchGestureEventData) => void;
    private _defaultNativePadding: android.graphics.Rect;

    get android(): android.widget.Button {
        return this._button;
    }

    public _createNativeView() {
        initializeClickListener();
        this._button = new android.widget.Button(this._context);
        this._button.setOnClickListener(new ClickListener(this));

        // Unlike all other widgets, the Button has padding 30 36 30 36 in device pixels.
        let result = new android.graphics.Rect();
        this._button.getBackground().getPadding(result);
        this._defaultNativePadding = result;

        this.effectivePaddingTop = this._defaultNativePadding.top;
        this.effectivePaddingRight = this._defaultNativePadding.right;
        this.effectivePaddingBottom = this._defaultNativePadding.bottom;
        this.effectivePaddingLeft = this._defaultNativePadding.left;
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

    //PaddingTop
    get [paddingTopProperty.native](): Length {
        return { value: this._defaultNativePadding.top, unit: "px" }
    }
    set [paddingTopProperty.native](value: Length) {
        org.nativescript.widgets.ViewHelper.setPaddingTop(this.nativeView, Length.toDevicePixels(value, 0) + Length.toDevicePixels(this.style.borderTopWidth, 0));
    }

    //PaddingRight
    get [paddingRightProperty.native](): Length {
        return { value: this._defaultNativePadding.right, unit: "px" }
    }
    set [paddingRightProperty.native](value: Length) {
        org.nativescript.widgets.ViewHelper.setPaddingRight(this.nativeView, Length.toDevicePixels(value, 0) + Length.toDevicePixels(this.style.borderRightWidth, 0));
    }

    //PaddingBottom
    get [paddingBottomProperty.native](): Length {
        return { value: this._defaultNativePadding.bottom, unit: "px" }
    }
    set [paddingBottomProperty.native](value: Length) {
        org.nativescript.widgets.ViewHelper.setPaddingBottom(this.nativeView, Length.toDevicePixels(value, 0) + Length.toDevicePixels(this.style.borderBottomWidth, 0));
    }

    //PaddingLeft
    get [paddingLeftProperty.native](): Length {
        return { value: this._defaultNativePadding.left, unit: "px" }
    }
    set [paddingLeftProperty.native](value: Length) {
        org.nativescript.widgets.ViewHelper.setPaddingLeft(this.nativeView, Length.toDevicePixels(value, 0) + Length.toDevicePixels(this.style.borderLeftWidth, 0));
    }

    get [zIndexProperty.native](): number {
        return org.nativescript.widgets.ViewHelper.getZIndex(this.nativeView);
    }
    set [zIndexProperty.native](value: number) {
        org.nativescript.widgets.ViewHelper.setZIndex(this.nativeView, value);
        // API >= 21
        if (this.nativeView.setStateListAnimator) {
            this.nativeView.setStateListAnimator(null);
        }
    }
}