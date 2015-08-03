import definition = require("ui/layouts/layout");
import layoutBase = require("ui/layouts/layout-base");
import trace = require("trace");
import utils = require("utils/utils");

export class Layout extends layoutBase.LayoutBase implements definition.Layout {

    private _view: UIView;

    constructor() {
        super();

        this._view = new UIView();
        this._view.autoresizesSubviews = false;
    }

    get ios(): UIView {
        return this._view;
    }

    get _nativeView(): UIView {
        return this._view;
    }

    public onMeasure(widthMeasureSpec: number, heightMeasureSpec: number): void {
        // Don't call super because it will measure the native element.

        var width = utils.layout.getMeasureSpecSize(widthMeasureSpec);
        var widthMode = utils.layout.getMeasureSpecMode(widthMeasureSpec);

        var height = utils.layout.getMeasureSpecSize(heightMeasureSpec);
        var heightMode = utils.layout.getMeasureSpecMode(heightMeasureSpec);
        trace.write(this + " :onMeasure: " + utils.layout.getMode(widthMode) + " " + width + ", " + utils.layout.getMode(heightMode) + " " + height, trace.categories.Layout);
    }
}