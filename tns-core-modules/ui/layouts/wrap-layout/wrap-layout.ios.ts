import { WrapLayoutBase, View, layout } from "./wrap-layout-common";

export * from "./wrap-layout-common";

export class WrapLayout extends WrapLayoutBase {
    private _lengths: Array<number> = new Array<number>();

    private static getChildMeasureSpec(parentMode: number, parentLength: number, itemLength): number {
        if (itemLength > 0) {
            return layout.makeMeasureSpec(itemLength, layout.EXACTLY);
        }
        else if (parentMode === layout.UNSPECIFIED) {
            return layout.makeMeasureSpec(0, layout.UNSPECIFIED);
        }
        else {
            return layout.makeMeasureSpec(parentLength, layout.AT_MOST);
        }
    }

    public onMeasure(widthMeasureSpec: number, heightMeasureSpec: number): void {
        super.onMeasure(widthMeasureSpec, heightMeasureSpec);

        let measureWidth = 0;
        let measureHeight = 0;

        const width = layout.getMeasureSpecSize(widthMeasureSpec);
        const widthMode = layout.getMeasureSpecMode(widthMeasureSpec);

        const height = layout.getMeasureSpecSize(heightMeasureSpec);
        const heightMode = layout.getMeasureSpecMode(heightMeasureSpec);

        const horizontalPaddingsAndMargins = this.effectivePaddingLeft + this.effectivePaddingRight + this.effectiveBorderLeftWidth + this.effectiveBorderRightWidth;
        const verticalPaddingsAndMargins = this.effectivePaddingTop + this.effectivePaddingBottom + this.effectiveBorderTopWidth + this.effectiveBorderBottomWidth;

        const availableWidth = widthMode === layout.UNSPECIFIED ? Number.MAX_VALUE : width - horizontalPaddingsAndMargins;
        const availableHeight = heightMode === layout.UNSPECIFIED ? Number.MAX_VALUE : height - verticalPaddingsAndMargins;

        const childWidthMeasureSpec: number = WrapLayout.getChildMeasureSpec(widthMode, availableWidth, this.effectiveItemWidth);
        const childHeightMeasureSpec: number = WrapLayout.getChildMeasureSpec(heightMode, availableHeight, this.effectiveItemHeight);

        let remainingWidth = availableWidth;
        let remainingHeight = availableHeight;

        this._lengths.length = 0;
        var rowOrColumn = 0;
        var maxLength = 0;

        var isVertical = this.orientation === "vertical";

        let useItemWidth: boolean = this.effectiveItemWidth > 0;
        let useItemHeight: boolean = this.effectiveItemHeight > 0;
        let itemWidth = this.effectiveItemWidth;
        let itemHeight = this.effectiveItemHeight;

        this.eachLayoutChild((child, last) => {
            const desiredSize = View.measureChild(this, child, childWidthMeasureSpec, childHeightMeasureSpec);
            let childMeasuredWidth = useItemWidth ? itemWidth : desiredSize.measuredWidth;
            let childMeasuredHeight = useItemHeight ? itemHeight : desiredSize.measuredHeight;
            let isFirst = this._lengths.length <= rowOrColumn;

            if (isVertical) {
                if (childMeasuredHeight > remainingHeight) {
                    rowOrColumn++;
                    maxLength = Math.max(maxLength, measureHeight);
                    measureHeight = childMeasuredHeight;
                    remainingHeight = availableHeight - childMeasuredHeight;
                    this._lengths[isFirst ? rowOrColumn - 1 : rowOrColumn] = childMeasuredWidth;
                }
                else {
                    remainingHeight -= childMeasuredHeight;
                    measureHeight += childMeasuredHeight;
                }
            }
            else {
                if (childMeasuredWidth > remainingWidth) {
                    rowOrColumn++;
                    maxLength = Math.max(maxLength, measureWidth);
                    measureWidth = childMeasuredWidth;
                    remainingWidth = availableWidth - childMeasuredWidth;
                    this._lengths[isFirst ? rowOrColumn - 1 : rowOrColumn] = childMeasuredHeight;
                }
                else {
                    remainingWidth -= childMeasuredWidth;
                    measureWidth += childMeasuredWidth;
                }
            }

            if (isFirst) {
                this._lengths[rowOrColumn] = isVertical ? childMeasuredWidth : childMeasuredHeight;
            }
            else {
                this._lengths[rowOrColumn] = Math.max(this._lengths[rowOrColumn], isVertical ? childMeasuredWidth : childMeasuredHeight);
            }
        });

        if (isVertical) {
            measureHeight = Math.max(maxLength, measureHeight);
            this._lengths.forEach((value, index, array) => {
                measureWidth += value;
            });
        }
        else {
            measureWidth = Math.max(maxLength, measureWidth);
            this._lengths.forEach((value, index, array) => {
                measureHeight += value;
            });
        }

        measureWidth += horizontalPaddingsAndMargins;
        measureHeight += verticalPaddingsAndMargins;

        // Check against our minimum sizes
        measureWidth = Math.max(measureWidth, this.effectiveMinWidth);
        measureHeight = Math.max(measureHeight, this.effectiveMinHeight);

        const widthAndState = View.resolveSizeAndState(measureWidth, width, widthMode, 0);
        const heightAndState = View.resolveSizeAndState(measureHeight, height, heightMode, 0);

        this.setMeasuredDimension(widthAndState, heightAndState);
    }

    public onLayout(left: number, top: number, right: number, bottom: number): void {
        super.onLayout(left, top, right, bottom);

        const isVertical = this.orientation === "vertical";
        const paddingLeft = this.effectiveBorderLeftWidth + this.effectivePaddingLeft;
        const paddingTop = this.effectiveBorderTopWidth + this.effectivePaddingTop;
        const paddingRight = this.effectiveBorderRightWidth + this.effectivePaddingRight;
        const paddingBottom = this.effectiveBorderBottomWidth + this.effectivePaddingBottom;

        let childLeft = paddingLeft;
        let childTop = paddingTop;
        let childrenLength: number;
        if (isVertical) {
            childrenLength = bottom - top - paddingBottom;
        }
        else {
            childrenLength = right - left - paddingRight;
        }

        var rowOrColumn = 0;
        this.eachLayoutChild((child, last) => {
            // Add margins because layoutChild will sustract them.
            // * density converts them to device pixels.
            let childHeight = child.getMeasuredHeight() + child.effectiveMarginTop + child.effectiveMarginBottom;
            let childWidth = child.getMeasuredWidth() + child.effectiveMarginLeft + child.effectiveMarginRight;
            
            let length = this._lengths[rowOrColumn];
            if (isVertical) {
                childWidth = length;
                childHeight = this.effectiveItemHeight > 0 ? this.effectiveItemHeight : childHeight;
                let isFirst = childTop === paddingTop;
                if (childTop + childHeight > childrenLength) {
                    // Move to top.
                    childTop = paddingTop;

                    if (!isFirst) {
                        // Move to right with current column width.
                        childLeft += length;
                    }

                    // Move to next column.
                    rowOrColumn++;

                    // Take respective column width.
                    childWidth = this._lengths[isFirst ? rowOrColumn - 1 : rowOrColumn];
                }
            }
            else {
                childWidth = this.effectiveItemWidth > 0 ? this.effectiveItemWidth : childWidth;
                childHeight = length;
                let isFirst = childLeft === paddingLeft;
                if (childLeft + childWidth > childrenLength) {
                    // Move to left.
                    childLeft = paddingLeft;

                    if (!isFirst) {
                        // Move to bottom with current row height.
                        childTop += length;
                    }

                    // Move to next row.
                    rowOrColumn++;

                    // Take respective row height.
                    childHeight = this._lengths[isFirst ? rowOrColumn - 1 : rowOrColumn];
                }
            }

            View.layoutChild(this, child, childLeft, childTop, childLeft + childWidth, childTop + childHeight);

            if (isVertical) {
                // Move next child Top position to bottom.
                childTop += childHeight;
            }
            else {
                // Move next child Left position to right.
                childLeft += childWidth;
            }
        });
    }
}