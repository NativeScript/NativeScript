import utils = require("utils/utils");
import view = require("ui/core/view");
import common = require("./absolute-layout-common");
import {CommonLayoutParams, nativeLayoutParamsProperty} from "ui/styling/style";

global.moduleMerge(common, exports);

export class AbsoluteLayout extends common.AbsoluteLayout {

    protected onLeftChanged(view: view.View, oldValue: number, newValue: number) {
        this.requestLayout();
    }

    protected onTopChanged(view: view.View, oldValue: number, newValue: number) {
        this.requestLayout();
    }

    public onMeasure(widthMeasureSpec: number, heightMeasureSpec: number): void {
        AbsoluteLayout.adjustChildrenLayoutParams(this, widthMeasureSpec, heightMeasureSpec);
        super.onMeasure(widthMeasureSpec, heightMeasureSpec);

        var measureWidth = 0;
        var measureHeight = 0;

        var width = utils.layout.getMeasureSpecSize(widthMeasureSpec);
        var widthMode = utils.layout.getMeasureSpecMode(widthMeasureSpec);

        var height = utils.layout.getMeasureSpecSize(heightMeasureSpec);
        var heightMode = utils.layout.getMeasureSpecMode(heightMeasureSpec);

        var childMeasureSpec = utils.layout.makeMeasureSpec(0, utils.layout.UNSPECIFIED);
        var density = utils.layout.getDisplayDensity();

        for (let i = 0, count = this.getChildrenCount(); i < count; i++) {
            let child = this.getChildAt(i);
            if (!child._isVisible) {
                continue;
            }

            let childSize = view.View.measureChild(this, child, childMeasureSpec, childMeasureSpec);
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
        for (let i = 0, count = this.getChildrenCount(); i < count; i++) {
            let child = this.getChildAt(i);
            if (!child._isVisible) {
                continue;
            }

            let lp: CommonLayoutParams = child.style._getValue(nativeLayoutParamsProperty);

            let childWidth = child.getMeasuredWidth();
            let childHeight = child.getMeasuredHeight();

            let childLeft = (this.paddingLeft + AbsoluteLayout.getLeft(child)) * density;
            let childTop = (this.paddingTop + AbsoluteLayout.getTop(child)) * density;
            let childRight = childLeft + childWidth + (lp.leftMargin + lp.rightMargin) * density;
            let childBottom = childTop + childHeight + (lp.topMargin + lp.bottomMargin) * density;

            view.View.layoutChild(this, child, childLeft, childTop, childRight, childBottom);
        }

        AbsoluteLayout.restoreOriginalParams(this);
    }
}