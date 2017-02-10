import { Layout as LayoutDefinition } from "ui/layouts/layout";
import { LayoutBase, View, layout, traceEnabled, traceWrite, traceCategories } from "ui/layouts/layout-base";

export * from "ui/layouts/layout-base";

const OWNER = Symbol("_owner");

var NativeViewGroupClass;
function ensureNativeViewGroupClass() {
    if (NativeViewGroupClass) {
        return;
    }

    NativeViewGroupClass = (<any>android.view.ViewGroup).extend({
        onMeasure: function (widthMeasureSpec, heightMeasureSpec) {
            const owner: View = this[OWNER];
            owner.onMeasure(widthMeasureSpec, heightMeasureSpec);
            this.setMeasuredDimension(owner.getMeasuredWidth(), owner.getMeasuredHeight());
        },
        onLayout: function (changed: boolean, left: number, top: number, right: number, bottom: number): void {
            const owner: View = this[OWNER];
            owner.onLayout(left, top, right, bottom);
        }
    });
}

export class Layout extends LayoutBase implements LayoutDefinition {
    private _viewGroup: android.view.ViewGroup;

    get android(): android.view.ViewGroup {
        return this._viewGroup;
    }

    get _nativeView(): android.view.ViewGroup {
        return this._viewGroup;
    }

    public _createNativeView() {
        ensureNativeViewGroupClass();
        this._viewGroup = new NativeViewGroupClass(this._context);
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
}