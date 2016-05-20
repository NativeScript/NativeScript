import utils = require("utils/utils");
import common = require("./absolute-layout-common");
import {View} from "ui/core/view";
import {CommonLayoutParams, nativeLayoutParamsProperty} from "ui/styling/style";

global.moduleMerge(common, exports);

export class AbsoluteLayout extends common.AbsoluteLayout {
    protected onLeftChanged(view: View, oldValue: number, newValue: number) {
        this.requestLayout();
    }

    protected onTopChanged(view: View, oldValue: number, newValue: number) {
        this.requestLayout();
    }

    public onMeasure(widthMeasureSpec: number, heightMeasureSpec: number): void {
        AbsoluteLayout.adjustChildrenLayoutParams(this, widthMeasureSpec, heightMeasureSpec);
        super.onMeasure(widthMeasureSpec, heightMeasureSpec);

        let measureWidth = 0;
        let measureHeight = 0;
        
        let width = utils.layout.getMeasureSpecSize(widthMeasureSpec);
        let widthMode = utils.layout.getMeasureSpecMode(widthMeasureSpec);
        
        let height = utils.layout.getMeasureSpecSize(heightMeasureSpec);
        let heightMode = utils.layout.getMeasureSpecMode(heightMeasureSpec);
        
        let childMeasureSpec = utils.layout.makeMeasureSpec(0, utils.layout.UNSPECIFIED);
        let density = utils.layout.getDisplayDensity();

        this.eachLayoutChild((child, last) => {
            let childSize = View.measureChild(this, child, childMeasureSpec, childMeasureSpec);
            measureWidth = Math.max(measureWidth, AbsoluteLayout.getLeft(child) * density + childSize.measuredWidth);
            measureHeight = Math.max(measureHeight, AbsoluteLayout.getTop(child) * density + childSize.measuredHeight);
        });

        measureWidth += (this.paddingLeft + this.paddingRight) * density;
        measureHeight += (this.paddingTop + this.paddingBottom) * density;

        measureWidth = Math.max(measureWidth, this.minWidth * density);
        measureHeight = Math.max(measureHeight, this.minHeight * density);

        let widthAndState = View.resolveSizeAndState(measureWidth, width, widthMode, 0);
        let heightAndState = View.resolveSizeAndState(measureHeight, height, heightMode, 0);

        this.setMeasuredDimension(widthAndState, heightAndState);
    }

    public onLayout(left: number, top: number, right: number, bottom: number): void {
        super.onLayout(left, top, right, bottom);

        let density = utils.layout.getDisplayDensity();
        this.eachLayoutChild((child, last) => {
            let lp: CommonLayoutParams = child.style._getValue(nativeLayoutParamsProperty);

            let childWidth = child.getMeasuredWidth();
            let childHeight = child.getMeasuredHeight();

            let childLeft = (this.paddingLeft + AbsoluteLayout.getLeft(child)) * density;
            let childTop = (this.paddingTop + AbsoluteLayout.getTop(child)) * density;
            let childRight = childLeft + childWidth + (lp.leftMargin + lp.rightMargin) * density;
            let childBottom = childTop + childHeight + (lp.topMargin + lp.bottomMargin) * density;

            View.layoutChild(this, child, childLeft, childTop, childRight, childBottom);
        });

        AbsoluteLayout.restoreOriginalParams(this);
    }
}