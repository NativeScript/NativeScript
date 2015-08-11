import definition = require("ui/layouts/layout");
import view = require("ui/core/view");
import layoutBase = require("ui/layouts/layout-base");
import trace = require("trace");
import utils = require("utils/utils");

var OWNER = "_owner";

export class Layout extends layoutBase.LayoutBase implements definition.Layout {
    private _viewGroup: android.view.ViewGroup;

    get android(): android.view.ViewGroup {
        return this._viewGroup;
    }

    get _nativeView(): android.view.ViewGroup {
        return this._viewGroup;
    }

    public _createUI() {
        this._viewGroup = new view.NativeViewGroup(this._context);
        this._viewGroup[OWNER] = this;
    }

    public _onDetached(force?: boolean) {
        delete this._viewGroup[OWNER];
        super._onDetached(force);
    }

    public measure(widthMeasureSpec: number, heightMeasureSpec: number): void {
        this._setCurrentMeasureSpecs(widthMeasureSpec, heightMeasureSpec);

        var view = this._nativeView;
        if (view) {
            var width = utils.layout.getMeasureSpecSize(widthMeasureSpec);
            var widthMode = utils.layout.getMeasureSpecMode(widthMeasureSpec);

            var height = utils.layout.getMeasureSpecSize(heightMeasureSpec);
            var heightMode = utils.layout.getMeasureSpecMode(heightMeasureSpec);

            trace.write(this + " :measure: " + utils.layout.getMode(widthMode) + " " + width + ", " + utils.layout.getMode(heightMode) + " " + height, trace.categories.Layout);
            view.measure(widthMeasureSpec, heightMeasureSpec);
        }
    }

    public layout(left: number, top: number, right: number, bottom: number): void {
        this._setCurrentLayoutBounds(left, top, right, bottom);

        var view = this._nativeView;
        if (view) {
            this.layoutNativeView(left, top, right, bottom);
            trace.write(this + " :layout: " + left + ", " + top + ", " + (right - left) + ", " + (bottom - top), trace.categories.Layout);
        }
    }

    public onMeasure(widthMeasureSpec: number, heightMeasureSpec: number): void {
        // Don't call super because it will trigger measure again.
    }

    public onLayout(left: number, top: number, right: number, bottom: number): void {
        // Don't call super because it will trigger layout again.
    }
}