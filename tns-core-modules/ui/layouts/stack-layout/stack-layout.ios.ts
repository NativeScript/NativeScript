import { StackLayoutBase, View, layout, VerticalAlignment, HorizontalAlignment } from "./stack-layout-common";

export * from "./stack-layout-common";

export class StackLayout extends StackLayoutBase {
    private _totalLength = 0;

    public onMeasure(widthMeasureSpec: number, heightMeasureSpec: number): void {
        super.onMeasure(widthMeasureSpec, heightMeasureSpec);

        let measureWidth = 0;
        let measureHeight = 0;

        const width = layout.getMeasureSpecSize(widthMeasureSpec);
        const widthMode = layout.getMeasureSpecMode(widthMeasureSpec);

        const height = layout.getMeasureSpecSize(heightMeasureSpec);
        const heightMode = layout.getMeasureSpecMode(heightMeasureSpec);

        const isVertical = this.orientation === "vertical";
        const style = this.style;
        const horizontalPaddingsAndMargins = style.effectivePaddingLeft + style.effectivePaddingRight + style.effectiveBorderLeftWidth + style.effectiveBorderRightWidth;
        const verticalPaddingsAndMargins = style.effectivePaddingTop + style.effectivePaddingBottom + style.effectiveBorderTopWidth + style.effectiveBorderBottomWidth;

        let measureSpec: number;

        let mode = isVertical ? heightMode : widthMode;
        let remainingLength: number;

        if (mode === layout.UNSPECIFIED) {
            measureSpec = layout.UNSPECIFIED;
            remainingLength = 0;
        }
        else {
            measureSpec = layout.AT_MOST;
            remainingLength = isVertical ? height - verticalPaddingsAndMargins : width - horizontalPaddingsAndMargins;
        }

        let childMeasureSpec: number;
        if (isVertical) {
            let childWidth = (widthMode === layout.UNSPECIFIED) ? 0 : width - horizontalPaddingsAndMargins;
            childWidth = Math.max(0, childWidth);
            childMeasureSpec = layout.makeMeasureSpec(childWidth, widthMode)
        }
        else {
            let childHeight = (heightMode === layout.UNSPECIFIED) ? 0 : height - verticalPaddingsAndMargins;
            childHeight = Math.max(0, childHeight);
            childMeasureSpec = layout.makeMeasureSpec(childHeight, heightMode)
        }

        let childSize: { measuredWidth: number; measuredHeight: number };

        this.eachLayoutChild((child, last) => {
            if (isVertical) {
                childSize = View.measureChild(this, child, childMeasureSpec, layout.makeMeasureSpec(remainingLength, measureSpec));
                measureWidth = Math.max(measureWidth, childSize.measuredWidth);
                let viewHeight = childSize.measuredHeight;
                measureHeight += viewHeight;
                remainingLength = Math.max(0, remainingLength - viewHeight);
            }
            else {
                childSize = View.measureChild(this, child, layout.makeMeasureSpec(remainingLength, measureSpec), childMeasureSpec);
                measureHeight = Math.max(measureHeight, childSize.measuredHeight);
                let viewWidth = childSize.measuredWidth;
                measureWidth += viewWidth;
                remainingLength = Math.max(0, remainingLength - viewWidth);
            }
        });

        measureWidth += horizontalPaddingsAndMargins;
        measureHeight += verticalPaddingsAndMargins;

        // Check against our minimum sizes
        measureWidth = Math.max(measureWidth, style.effectiveMinWidth);
        measureHeight = Math.max(measureHeight, style.effectiveMinHeight);

        this._totalLength = isVertical ? measureHeight : measureWidth;

        const widthAndState = View.resolveSizeAndState(measureWidth, width, widthMode, 0);
        const heightAndState = View.resolveSizeAndState(measureHeight, height, heightMode, 0);

        this.setMeasuredDimension(widthAndState, heightAndState);
    }

    public onLayout(left: number, top: number, right: number, bottom: number): void {
        super.onLayout(left, top, right, bottom);
        if (this.orientation === "vertical") {
            this.layoutVertical(left, top, right, bottom);
        }
        else {
            this.layoutHorizontal(left, top, right, bottom);
        }
    }

    private layoutVertical(left: number, top: number, right: number, bottom: number): void {
        const style = this.style;
        const paddingLeft = style.effectiveBorderLeftWidth + style.effectivePaddingLeft;
        const paddingTop = style.effectiveBorderTopWidth + style.effectivePaddingTop;
        const paddingRight = style.effectiveBorderRightWidth + style.effectivePaddingRight;
        const paddingBottom = style.effectiveBorderBottomWidth + style.effectivePaddingBottom;

        let childTop: number;
        let childLeft: number = paddingLeft;
        let childRight = right - left - paddingRight;

        switch (this.verticalAlignment) {
            case VerticalAlignment.MIDDLE:
                childTop = (bottom - top - this._totalLength) / 2 + paddingTop - paddingBottom;
                break;

            case VerticalAlignment.BOTTOM:
                childTop = bottom - top - this._totalLength + paddingTop - paddingBottom;
                break;

            case VerticalAlignment.TOP:
            case VerticalAlignment.STRETCH:
            default:
                childTop = paddingTop;
                break;
        }

        this.eachLayoutChild((child, last) => {
            const childStyle = child.style;
            const childHeight = child.getMeasuredHeight() + childStyle.effectiveMarginTop + childStyle.effectiveMarginBottom;

            View.layoutChild(this, child, childLeft, childTop, childRight, childTop + childHeight);
            childTop += childHeight;
        })
    }

    private layoutHorizontal(left: number, top: number, right: number, bottom: number): void {
        const style = this.style;
        const paddingLeft = style.effectiveBorderLeftWidth + style.effectivePaddingLeft;
        const paddingTop = style.effectiveBorderTopWidth + style.effectivePaddingTop;
        const paddingRight = style.effectiveBorderRightWidth + style.effectivePaddingRight;
        const paddingBottom = style.effectiveBorderBottomWidth + style.effectivePaddingBottom;

        let childTop: number = paddingTop;
        let childLeft: number;
        let childBottom = bottom - top - paddingBottom;

        switch (this.horizontalAlignment) {
            case HorizontalAlignment.CENTER:
                childLeft = (right - left - this._totalLength) / 2 + paddingLeft - paddingRight;
                break;

            case HorizontalAlignment.RIGHT:
                childLeft = right - left - this._totalLength + paddingLeft - paddingRight;
                break;

            case HorizontalAlignment.LEFT:
            case HorizontalAlignment.STRETCH:
            default:
                childLeft = paddingLeft;
                break;
        }

        this.eachLayoutChild((child, last) => {
            const childStyle = child.style;
            const childWidth = child.getMeasuredWidth() + childStyle.effectiveMarginLeft + childStyle.effectiveMarginRight;

            View.layoutChild(this, child, childLeft, childTop, childLeft + childWidth, childBottom);
            childLeft += childWidth;
        });
    }
}