import { AbsoluteLayoutBase, View, leftProperty, topProperty } from "./absolute-layout-common";

export * from "./absolute-layout-common";

function makeNativeSetter<T>(setter: (this: View, lp: org.nativescript.widgets.CommonLayoutParams, value: T) => void) {
    return function(this: View, value: T) {
        const nativeView: android.view.View = this._nativeView;
        const lp = nativeView.getLayoutParams() || new org.nativescript.widgets.CommonLayoutParams();
        if (lp instanceof org.nativescript.widgets.CommonLayoutParams) {
            setter.call(this, lp, value);
            nativeView.setLayoutParams(lp);
        }
    }
}

View.prototype[topProperty.setNative] = makeNativeSetter<number>(function(this: View, lp, value) { lp.top = this.effectiveTop });
View.prototype[leftProperty.setNative] = makeNativeSetter<number>(function(this: View, lp, value) { lp.left = this.effectiveLeft });

export class AbsoluteLayout extends AbsoluteLayoutBase {

    private _layout: org.nativescript.widgets.AbsoluteLayout;

    get android(): org.nativescript.widgets.AbsoluteLayout {
        return this._layout;
    }

    get _nativeView(): org.nativescript.widgets.AbsoluteLayout {
        return this._layout;
    }

    public _createNativeView() {
        const layout = this._layout = new org.nativescript.widgets.AbsoluteLayout(this._context);
        return layout;
    }
}