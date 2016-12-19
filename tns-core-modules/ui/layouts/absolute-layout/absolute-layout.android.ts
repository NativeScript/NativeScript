import { AbsoluteLayoutBase, View, leftProperty, topProperty, Length, zeroLength } from "./absolute-layout-common";

export * from "./absolute-layout-common";

// define native getter and setter for leftProperty.
let leftDescriptor: TypedPropertyDescriptor<Length> = {
    enumerable: true,
    configurable: true,
    get: () => zeroLength,
    set: function (this: View, value: Length) {
        setNativeProperty(this, (lp) => lp.left = this.effectiveLeft);
    }
}

// define native getter and setter for topProperty.
let topDescriptor: TypedPropertyDescriptor<Length> = {
    enumerable: true,
    configurable: true,
    get: () => zeroLength,
    set: function (this: View, value: Length) {
        setNativeProperty(this, (lp) => lp.top = this.effectiveTop);
    }
}

// register native properties on View type.
Object.defineProperties(View, {
    [leftProperty.native]: leftDescriptor,
    [topProperty.native]: topDescriptor
});

function setNativeProperty(view: View, setter: (lp: org.nativescript.widgets.CommonLayoutParams) => void) {
    if (view instanceof View) {
        const nativeView: android.view.View = view._nativeView;
        const lp = nativeView.getLayoutParams() || new org.nativescript.widgets.CommonLayoutParams();
        if (lp instanceof org.nativescript.widgets.CommonLayoutParams) {
            setter(lp);
            nativeView.setLayoutParams(lp);
        }
    }
}

export class AbsoluteLayout extends AbsoluteLayoutBase {

    private _layout: org.nativescript.widgets.AbsoluteLayout;

    get android(): org.nativescript.widgets.AbsoluteLayout {
        return this._layout;
    }

    get _nativeView(): org.nativescript.widgets.AbsoluteLayout {
        return this._layout;
    }

    public _createUI() {
        this._layout = new org.nativescript.widgets.AbsoluteLayout(this._context);
    }
}