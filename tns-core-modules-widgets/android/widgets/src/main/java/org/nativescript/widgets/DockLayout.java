/**
 * 
 */
package org.nativescript.widgets;

import android.content.Context;
import android.view.View;

/**
 * @author hhristov
 *
 */
public class DockLayout extends LayoutBase {
    
    private boolean _stretchLastChild = true;

	public DockLayout(Context context) {
		super(context);
	}

    public boolean getStretchLastChild() {
        return this._stretchLastChild;
    }
    public void setStretchLastChild(boolean value) {
        this._stretchLastChild = value;
        this.requestLayout();
    }
	
	protected void onMeasure(int widthMeasureSpec, int heightMeasureSpec) {
        CommonLayoutParams.adjustChildrenLayoutParams(this, widthMeasureSpec, heightMeasureSpec);

        int measureWidth = 0;
        int measureHeight = 0;

        int width = MeasureSpec.getSize(widthMeasureSpec);
        int widthMode = MeasureSpec.getMode(widthMeasureSpec);

        int height = MeasureSpec.getSize(heightMeasureSpec);
        int heightMode = MeasureSpec.getMode(heightMeasureSpec);

        int verticalPadding = this.getPaddingTop() + this.getPaddingBottom();
        int horizontalPadding = this.getPaddingLeft() + this.getPaddingRight();
        
        int remainingWidth = widthMode == MeasureSpec.UNSPECIFIED ? 0 : width - horizontalPadding;
        int remainingHeight = heightMode == MeasureSpec.UNSPECIFIED ? 0 : height - verticalPadding;

        int tempHeight = 0;
        int tempWidth = 0;
        int childWidthMeasureSpec = 0;
        int childHeightMeasureSpec = 0;
        int count = this.getChildCount();
        for (int i = 0; i < count; i++) {
            View child = this.getChildAt(i);
            if (child.getVisibility() == View.GONE) {
                continue;
            }

            if (this._stretchLastChild && (i == (count - 1))) {
                childWidthMeasureSpec = MeasureSpec.makeMeasureSpec(remainingWidth, widthMode);
                childHeightMeasureSpec = MeasureSpec.makeMeasureSpec(remainingHeight, heightMode);
            }
            else {
                // Measure children with AT_MOST even if our mode is EXACT
                childWidthMeasureSpec = MeasureSpec.makeMeasureSpec(remainingWidth, widthMode == MeasureSpec.EXACTLY ? MeasureSpec.AT_MOST : widthMode);
                childHeightMeasureSpec = MeasureSpec.makeMeasureSpec(remainingHeight, heightMode == MeasureSpec.EXACTLY ? MeasureSpec.AT_MOST : heightMode);
            }

            CommonLayoutParams.measureChild(child, childWidthMeasureSpec, childHeightMeasureSpec);
            final int childMeasuredWidth = CommonLayoutParams.getDesiredWidth(child);
            final int childMeasuredHeight = CommonLayoutParams.getDesiredHeight(child);
            
            CommonLayoutParams childLayoutParams = (CommonLayoutParams)child.getLayoutParams();
            Dock dock = childLayoutParams.dock;
            switch (dock) {
                case top:
                case bottom:
                    remainingHeight = Math.max(0, remainingHeight - childMeasuredHeight);
                    tempHeight += childMeasuredHeight;
                    measureWidth = Math.max(measureWidth, tempWidth + childMeasuredWidth);
                    measureHeight = Math.max(measureHeight, tempHeight);
                    break;

                case left:
                case right:
                default:
                    remainingWidth = Math.max(0, remainingWidth - childMeasuredWidth);
                    tempWidth += childMeasuredWidth;
                    measureWidth = Math.max(measureWidth, tempWidth);
                    measureHeight = Math.max(measureHeight, tempHeight + childMeasuredHeight);
                    break;
            }
        }

        // Add in our padding
        measureWidth += horizontalPadding;
        measureHeight += verticalPadding;

        // Check against our minimum sizes
        measureWidth = Math.max(measureWidth, this.getSuggestedMinimumWidth());
        measureHeight = Math.max(measureHeight, this.getSuggestedMinimumHeight());
        
        int widthSizeAndState = resolveSizeAndState(measureWidth, widthMeasureSpec, 0);
        int heightSizeAndState = resolveSizeAndState(measureHeight, heightMeasureSpec, 0);

        this.setMeasuredDimension(widthSizeAndState, heightSizeAndState);
    }

	@Override
	protected void onLayout(boolean changed, int left, int top, int right, int bottom) {
        int childLeft = this.getPaddingLeft();
        int childTop = this.getPaddingTop();

        int x = childLeft;
        int y = childTop;

        int remainingWidth = Math.max(0, right - left - (this.getPaddingLeft() + this.getPaddingRight()));
        int remainingHeight = Math.max(0, bottom - top - (this.getPaddingTop() + this.getPaddingBottom()));

        int count = this.getChildCount();
        View childToStretch = null;
        if (count > 0 && this._stretchLastChild) {
            count--;
            childToStretch = this.getChildAt(count);
        }

        for (int i = 0; i < count; i++) {
            View child = this.getChildAt(i);
            if (child.getVisibility() == View.GONE) {
                continue;
            }

            CommonLayoutParams childLayoutParams = (CommonLayoutParams)child.getLayoutParams();
            int childWidth = CommonLayoutParams.getDesiredWidth(child);
            int childHeight = CommonLayoutParams.getDesiredHeight(child);

            switch (childLayoutParams.dock) {
                case top:
                    childLeft = x;
                    childTop = y;
                    childWidth = remainingWidth;
                    y += childHeight;
                    remainingHeight = Math.max(0, remainingHeight - childHeight);
                    break;

                case bottom:
                    childLeft = x;
                    childTop = y + remainingHeight - childHeight;
                    childWidth = remainingWidth;
                    remainingHeight = Math.max(0, remainingHeight - childHeight);
                    break;

                case right:
                    childLeft = x + remainingWidth - childWidth;
                    childTop = y;
                    childHeight = remainingHeight;
                    remainingWidth = Math.max(0, remainingWidth - childWidth);
                    break;

                case left:
                default:
                    childLeft = x;
                    childTop = y;
                    childHeight = remainingHeight;
                    x += childWidth;
                    remainingWidth = Math.max(0, remainingWidth - childWidth);
                    break;
            }
            
            CommonLayoutParams.layoutChild(child, childLeft, childTop, childLeft + childWidth, childTop + childHeight);
        }

        if (childToStretch != null) {
        	CommonLayoutParams.layoutChild(childToStretch, x, y, x + remainingWidth, y + remainingHeight);
        }

        CommonLayoutParams.restoreOriginalParams(this);
    }
}