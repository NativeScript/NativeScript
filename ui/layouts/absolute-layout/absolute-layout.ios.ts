import utils = require("utils/utils");
import view = require("ui/core/view");
import common = require("ui/layouts/absolute-layout/absolute-layout-common");

// merge the exports of the common file with the exports of this file
declare var exports;
require("utils/module-merge").merge(common, exports);

export class AbsoluteLayout extends common.AbsoluteLayout {

    protected onLeftChanged(view: view.View, oldValue: number, newValue: number) {
        this.requestLayout();
    }

    protected onTopChanged(view: view.View, oldValue: number, newValue: number) {
        this.requestLayout();
    }

    public onMeasure(widthMeasureSpec: number, heightMeasureSpec: number): void {
        super.onMeasure(widthMeasureSpec, heightMeasureSpec);

        var measureWidth = 0;
        var measureHeight = 0;

        var width = utils.layout.getMeasureSpecSize(widthMeasureSpec);
        var widthMode = utils.layout.getMeasureSpecMode(widthMeasureSpec);

        var height = utils.layout.getMeasureSpecSize(heightMeasureSpec);
        var heightMode = utils.layout.getMeasureSpecMode(heightMeasureSpec);

        var childMeasureSpec = utils.layout.makeMeasureSpec(0, utils.layout.UNSPECIFIED);
        var density = utils.layout.getDisplayDensity();

        var count = this.getChildrenCount();
        for (var i = 0; i < count; i++) {
            var child = this.getChildAt(i);
            if (!child || !child._isVisible) {
                continue;
            }

            var childSize = view.View.measureChild(this, child, childMeasureSpec, childMeasureSpec);
            measureWidth = Math.max(measureWidth, AbsoluteLayout.getLeft(child) * density + childSize.measuredWidth);
            measureHeight = Math.max(measureHeight, AbsoluteLayout.getTop(child) * density + childSize.measuredHeight);
        }

        measureWidth += (this.paddingLeft + this.paddingRight) * density;
        measureHeight += (this.paddingTop + this.paddingBottom) * density;

        measureWidth = Math.max(measureWidth, this.minWidth * density);
        measureHeight = Math.max(measureHeight, this.minHeight * density);

        var widthAndState = view.View.resolveSizeAndState(measureWidth, width, widthMode, 0);
        var heightAndState = view.View.resolveSizeAndState(measureHeight, height, heightMode, 0);

        this.setMeasuredDimension(widthAndState, heightAndState);
    }

    public onLayout(left: number, top: number, right: number, bottom: number): void {
        super.onLayout(left, top, right, bottom);

        var density = utils.layout.getDisplayDensity();
        var count = this.getChildrenCount();
        for (var i = 0; i < count; i++) {
            var child = this.getChildAt(i);
            if (!child || !child._isVisible) {
                continue;
            }

            var childWidth = child.getMeasuredWidth();
            var childHeight = child.getMeasuredHeight();

            var childLeft = (this.paddingLeft + AbsoluteLayout.getLeft(child)) * density;
            var childTop = (this.paddingTop + AbsoluteLayout.getTop(child)) * density;
            var childRight = childLeft + childWidth + (child.marginLeft + child.marginRight) * density;
            var childBottom = childTop + childHeight + (child.marginTop + child.marginBottom) * density;

            view.View.layoutChild(this, child, childLeft, childTop, childRight, childBottom);
        }
    }
}