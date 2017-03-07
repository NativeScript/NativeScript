import { Layout as LayoutDefinition } from "ui/layouts/layout";
import { LayoutBase, View, layout, traceEnabled, traceWrite, traceCategories } from "ui/layouts/layout-base";

export * from "ui/layouts/layout-base";

const OWNER = Symbol("_owner");

interface NativeViewGroup {
    new (context: android.content.Context): android.view.ViewGroup;
}

let NativeViewGroup: NativeViewGroup;
function initializeNativeViewGroup() {
    if (NativeViewGroup) {
        return;
    }

    class NativeViewGroupImpl extends android.view.ViewGroup {
        constructor(context: android.content.Context) {
            super(context);
            return global.__native(this);
        }

        onMeasure(widthMeasureSpec: number, heightMeasureSpec: number): void {
            const owner: View = this[OWNER];
            owner.onMeasure(widthMeasureSpec, heightMeasureSpec);
            this.setMeasuredDimension(owner.getMeasuredWidth(), owner.getMeasuredHeight());
        }

        onLayout(changed: boolean, left: number, top: number, right: number, bottom: number): void {
            const owner: View = this[OWNER];
            owner.onLayout(left, top, right, bottom);
        }
    }

    NativeViewGroup = NativeViewGroupImpl;
}

export class Layout extends LayoutBase implements LayoutDefinition {
    private _viewGroup: android.view.ViewGroup;
    _measuredWidth: number;
    _measuredHeight: number;

    get android(): android.view.ViewGroup {
        return this._viewGroup;
    }

    get _nativeView(): android.view.ViewGroup {
        return this._viewGroup;
    }

    public _createNativeView() {
        initializeNativeViewGroup();
        this._viewGroup = new NativeViewGroup(this._context);
        this._viewGroup[OWNER] = this;
    }

    public _disposeNativeView() {
        delete this._viewGroup[OWNER];
        super._disposeNativeView();
    }

    public measure(widthMeasureSpec: number, heightMeasureSpec: number): void {
        this._setCurrentMeasureSpecs(widthMeasureSpec, heightMeasureSpec);

        const view = this._nativeView;
        if (view) {
            if (traceEnabled()) {
                traceWrite(`${this} :measure: ${layout.measureSpecToString(widthMeasureSpec)}, ${layout.measureSpecToString(heightMeasureSpec)}`, traceCategories.Layout);
            }
            view.measure(widthMeasureSpec, heightMeasureSpec);
        }
    }

    public layout(left: number, top: number, right: number, bottom: number): void {
        this._setCurrentLayoutBounds(left, top, right, bottom);

        var view = this._nativeView;
        if (view) {
            this.layoutNativeView(left, top, right, bottom);
            if (traceEnabled()) {
                traceWrite(`${this} :layout: ${left}, ${top}, ${right - left}, ${bottom - top}`, traceCategories.Layout);
            }
        }
    }

    public onMeasure(widthMeasureSpec: number, heightMeasureSpec: number): void {
        // Don't call super because it will trigger measure again.
    }

    public onLayout(left: number, top: number, right: number, bottom: number): void {
        // Don't call super because it will trigger layout again.
    }

    // NOTE: overriden so we cache measuredWidth & measuredHeight.
    public setMeasuredDimension(measuredWidth: number, measuredHeight: number): void {
        super.setMeasuredDimension(measuredWidth, measuredHeight);
        this._measuredWidth = measuredWidth;
        this._measuredHeight = measuredHeight;
    }

    // NOTE: base implementation use the nativeView.getMeasuredWidth which should
    // not be called while we are in onMeasure.
    public getMeasuredWidth(): number {
        return this._measuredWidth;
    }

    // NOTE: base implementation use the nativeView.getMeasuredWidth which should
    // not be called while we are in onMeasure.
    public getMeasuredHeight(): number {
        return this._measuredHeight;
    }
}