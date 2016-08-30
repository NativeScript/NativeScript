import common = require("./stack-layout-common");
import utils = require("utils/utils");
import {View} from "ui/core/view";
import {Orientation, VerticalAlignment, HorizontalAlignment} from "ui/enums";
import {CommonLayoutParams, nativeLayoutParamsProperty} from "ui/styling/style";

global.moduleMerge(common, exports);

export class StackLayout extends common.StackLayout {
    private _totalLength = 0;

    public onMeasure(widthMeasureSpec: number, heightMeasureSpec: number): void {
        StackLayout.adjustChildrenLayoutParams(this, widthMeasureSpec, heightMeasureSpec);
        super.onMeasure(widthMeasureSpec, heightMeasureSpec);
        var density = utils.layout.getDisplayDensity();

        var measureWidth = 0;
        var measureHeight = 0;

        var width = utils.layout.getMeasureSpecSize(widthMeasureSpec);
        var widthMode = utils.layout.getMeasureSpecMode(widthMeasureSpec);

        var height = utils.layout.getMeasureSpecSize(heightMeasureSpec);
        var heightMode = utils.layout.getMeasureSpecMode(heightMeasureSpec);

        var isVertical = this.orientation === Orientation.vertical;
        var verticalPadding = (this.borderTopWidth + this.paddingTop + this.paddingBottom + this.borderBottomWidth) * density;
        var horizontalPadding = (this.borderLeftWidth + this.paddingLeft + this.paddingRight + this.borderRightWidth) * density;

        var measureSpec: number;

        var mode = isVertical ? heightMode : widthMode;
        var remainingLength: number;

        if (mode === utils.layout.UNSPECIFIED) {
            measureSpec = utils.layout.UNSPECIFIED;
            remainingLength = 0;
        }
        else {
            measureSpec = utils.layout.AT_MOST;
            remainingLength = isVertical ? height - verticalPadding : width - horizontalPadding;
        }

        var childMeasureSpec: number;
        if (isVertical) {
            let childWidth = (widthMode === utils.layout.UNSPECIFIED) ? 0 : width - horizontalPadding;
            childWidth = Math.max(0, childWidth);
            childMeasureSpec = utils.layout.makeMeasureSpec(childWidth, widthMode)
        }
        else {
            let childHeight = (heightMode === utils.layout.UNSPECIFIED) ? 0 : height - verticalPadding;
            childHeight = Math.max(0, childHeight);
            childMeasureSpec = utils.layout.makeMeasureSpec(childHeight, heightMode)
        }

        var childSize: { measuredWidth: number; measuredHeight: number };

        this.eachLayoutChild((child, last) => {
            if (isVertical) {
                childSize = View.measureChild(this, child, childMeasureSpec, utils.layout.makeMeasureSpec(remainingLength, measureSpec));
                measureWidth = Math.max(measureWidth, childSize.measuredWidth);
                var viewHeight = childSize.measuredHeight;
                measureHeight += viewHeight;
                remainingLength = Math.max(0, remainingLength - viewHeight);
            }
            else {
                childSize = View.measureChild(this, child, utils.layout.makeMeasureSpec(remainingLength, measureSpec), childMeasureSpec);
                measureHeight = Math.max(measureHeight, childSize.measuredHeight);
                var viewWidth = childSize.measuredWidth;
                measureWidth += viewWidth;
                remainingLength = Math.max(0, remainingLength - viewWidth);
            }
        });

        measureWidth += horizontalPadding;
        measureHeight += verticalPadding;

        measureWidth = Math.max(measureWidth, this.minWidth * density);
        measureHeight = Math.max(measureHeight, this.minHeight * density);

        this._totalLength = isVertical ? measureHeight : measureWidth;

        var widthAndState = View.resolveSizeAndState(measureWidth, width, widthMode, 0);
        var heightAndState = View.resolveSizeAndState(measureHeight, height, heightMode, 0);

        this.setMeasuredDimension(widthAndState, heightAndState);
    }

    public onLayout(left: number, top: number, right: number, bottom: number): void {
        super.onLayout(left, top, right, bottom);
        if (this.orientation === Orientation.vertical) {
            this.layoutVertical(left, top, right, bottom);
        }
        else {
            this.layoutHorizontal(left, top, right, bottom);
        }

        StackLayout.restoreOriginalParams(this);
    }

    private layoutVertical(left: number, top: number, right: number, bottom: number): void {
        var density = utils.layout.getDisplayDensity();
        var paddingLeft = (this.borderLeftWidth + this.paddingLeft) * density;
        var paddingRight = (this.borderRightWidth + this.paddingRight) * density;
        var paddingTop = (this.borderTopWidth + this.paddingTop) * density;
        var paddingBottom = (this.borderBottomWidth + this.paddingBottom) * density;

        var childTop: number;
        var childLeft: number = paddingLeft;
        var childRight = right - left - paddingRight;

        switch (this.verticalAlignment) {
            case VerticalAlignment.center:
            case VerticalAlignment.middle:
                childTop = (bottom - top - this._totalLength) / 2 + paddingTop - paddingBottom;
                break;

            case VerticalAlignment.bottom:
                childTop = bottom - top - this._totalLength + paddingTop - paddingBottom;
                break;

            case VerticalAlignment.top:
            case VerticalAlignment.stretch:
            default:
                childTop = paddingTop;
                break;
        }

        this.eachLayoutChild((child, last) => {
            let lp: CommonLayoutParams = child.style._getValue(nativeLayoutParamsProperty);
            let childHeight = child.getMeasuredHeight() + (lp.topMargin + lp.bottomMargin) * density;

            View.layoutChild(this, child, childLeft, childTop, childRight, childTop + childHeight);
            childTop += childHeight;
        })
    }

    private layoutHorizontal(left: number, top: number, right: number, bottom: number): void {
        var density = utils.layout.getDisplayDensity();
        var paddingLeft = (this.borderLeftWidth + this.paddingLeft) * density;
        var paddingRight = (this.borderRightWidth + this.paddingRight) * density;
        var paddingTop = (this.borderTopWidth + this.paddingTop) * density;
        var paddingBottom = (this.borderBottomWidth + this.paddingBottom) * density;

        var childTop: number = paddingTop;
        var childLeft: number;
        var childBottom = bottom - top - paddingBottom;

        switch (this.horizontalAlignment) {
            case HorizontalAlignment.center:
                childLeft = (right - left - this._totalLength) / 2 + paddingLeft - paddingRight;
                break;

            case HorizontalAlignment.right:
                childLeft = right - left - this._totalLength + paddingLeft - paddingRight;
                break;

            case HorizontalAlignment.left:
            case HorizontalAlignment.stretch:
            default:
                childLeft = paddingLeft;
                break;
        }

        this.eachLayoutChild((child, last) => {
            let lp: CommonLayoutParams = child.style._getValue(nativeLayoutParamsProperty);
            let childWidth = child.getMeasuredWidth() + (lp.leftMargin + lp.rightMargin) * density;

            View.layoutChild(this, child, childLeft, childTop, childLeft + childWidth, childBottom);
            childLeft += childWidth;
        });
    }
}
