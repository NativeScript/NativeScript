/**
 * 
 */
package org.nativescript.widgets;

import android.annotation.SuppressLint;
import android.content.Context;
import android.view.Gravity;
import android.view.View;

/**
 * @author hhristov
 *
 */
public class StackLayout extends LayoutBase {
	
    private int _totalLength = 0;
    private Orientation _orientation = Orientation.vertical;
    
    public StackLayout(Context context) {
		super(context);
	}
    
    public Orientation getOrientation() {
        return this._orientation;
    }
    public void setOrientation(Orientation value) {
        this._orientation = value;
        this.requestLayout();
    }

    @Override
    protected void onMeasure(int widthMeasureSpec, int heightMeasureSpec) {
    	int childState = 0;
        int measureWidth = 0;
        int measureHeight = 0;

        int width = MeasureSpec.getSize(widthMeasureSpec);
        int widthMode = MeasureSpec.getMode(widthMeasureSpec);

        int height = MeasureSpec.getSize(heightMeasureSpec);
        int heightMode = MeasureSpec.getMode(heightMeasureSpec);

        boolean isVertical = this._orientation == Orientation.vertical;
        int verticalPadding = this.getPaddingTop() + this.getPaddingBottom();
        int horizontalPadding = this.getPaddingLeft() + this.getPaddingRight();

        int count = this.getChildCount();
        int measureSpecMode;
        int remainingLength;

        int mode = isVertical ? heightMode : widthMode;
        if (mode == MeasureSpec.UNSPECIFIED) {
            measureSpecMode = MeasureSpec.UNSPECIFIED;
            remainingLength = 0;
        }
        else {
            measureSpecMode = MeasureSpec.AT_MOST;
            remainingLength = isVertical ? height - verticalPadding : width - horizontalPadding;
        }

        int childMeasureSpec;
        if (isVertical) {
        	int childWidth = (widthMode == MeasureSpec.UNSPECIFIED) ? 0 : width - horizontalPadding;
            childWidth = Math.max(0, childWidth);
            childMeasureSpec = MeasureSpec.makeMeasureSpec(childWidth, widthMode);
        }
        else {
        	int childHeight = (heightMode == MeasureSpec.UNSPECIFIED) ? 0 : height - verticalPadding;
            childHeight = Math.max(0, childHeight);
            childMeasureSpec = MeasureSpec.makeMeasureSpec(childHeight, heightMode);
        }

        for (int i = 0; i < count; i++) {
            View child = this.getChildAt(i);
            if (child.getVisibility() == View.GONE) {
                continue;
            }

            if (isVertical) {
            	CommonLayoutParams.measureChild(child, childMeasureSpec, MeasureSpec.makeMeasureSpec(remainingLength, measureSpecMode));
                final int childMeasuredWidth = CommonLayoutParams.getDesiredWidth(child);
                final int childMeasuredHeight = CommonLayoutParams.getDesiredHeight(child);
                
                measureWidth = Math.max(measureWidth, childMeasuredWidth);
                measureHeight += childMeasuredHeight;
                remainingLength = Math.max(0, remainingLength - childMeasuredHeight);
            }
            else {
            	CommonLayoutParams.measureChild(child, MeasureSpec.makeMeasureSpec(remainingLength, measureSpecMode), childMeasureSpec);
                final int childMeasuredWidth = CommonLayoutParams.getDesiredWidth(child);
                final int childMeasuredHeight = CommonLayoutParams.getDesiredHeight(child);
                
                measureHeight = Math.max(measureHeight, childMeasuredHeight);
                measureWidth += childMeasuredWidth;
                remainingLength = Math.max(0, remainingLength - childMeasuredWidth);
            }
            
            childState = combineMeasuredStates(childState, child.getMeasuredState());
        }

        // Add in our padding
        measureWidth += horizontalPadding;
        measureHeight += verticalPadding;

        // Check against our minimum sizes
        measureWidth = Math.max(measureWidth, this.getSuggestedMinimumWidth());
        measureHeight = Math.max(measureHeight, this.getSuggestedMinimumHeight());

        this._totalLength = isVertical ? measureHeight : measureWidth;

        int widthSizeAndState = resolveSizeAndState(measureWidth, widthMeasureSpec, isVertical ? childState : 0);
        int heightSizeAndState = resolveSizeAndState(measureHeight, heightMeasureSpec, isVertical ? 0 : childState);

        this.setMeasuredDimension(widthSizeAndState, heightSizeAndState);
    }

	@Override
	protected void onLayout(boolean changed, int l, int t, int r, int b) {

        if (this._orientation == Orientation.vertical) {
            this.layoutVertical(l, t, r, b);
        }
        else {
            this.layoutHorizontal(l, t, r, b);
        }
    }

    private void layoutVertical(int left, int top, int right, int bottom) {

        int paddingLeft = this.getPaddingLeft();
        int paddingRight = this.getPaddingRight();
        int paddingTop = this.getPaddingTop();
        int paddingBottom = this.getPaddingBottom();

        int childTop = 0;
        int childLeft = paddingLeft;
        int childRight = right - left - paddingRight;
        
        int gravity = getGravity(this);
        final int verticalGravity = gravity & Gravity.VERTICAL_GRAVITY_MASK;
        
        switch (verticalGravity) {
            case Gravity.CENTER_VERTICAL:
                childTop = (bottom - top - this._totalLength) / 2 + paddingTop - paddingBottom;
                break;

            case Gravity.BOTTOM:
                childTop = bottom - top - this._totalLength + paddingTop - paddingBottom;
                break;

            case Gravity.TOP:
            case Gravity.FILL_VERTICAL:
            default:
                childTop = paddingTop;
                break;
        }

        int count = this.getChildCount();
        for (int i = 0; i < count; i++) {
            View child = this.getChildAt(i);
            if (child.getVisibility() == View.GONE) {
                continue;
            }

            CommonLayoutParams childLayoutParams = (CommonLayoutParams)child.getLayoutParams();
            int childHeight = child.getMeasuredHeight() + childLayoutParams.topMargin + childLayoutParams.bottomMargin;
            CommonLayoutParams.layoutChild(child, childLeft, childTop, childRight, childTop + childHeight);
            childTop += childHeight;
        }
    }

    @SuppressLint("RtlHardcoded")
	private void layoutHorizontal(int left, int top, int right, int bottom) {

        int paddingLeft = this.getPaddingLeft();
        int paddingRight = this.getPaddingRight();
        int paddingTop = this.getPaddingTop();
        int paddingBottom = this.getPaddingBottom();

        int childTop = paddingTop;
        int childLeft = 0;
        int childBottom = bottom - top - paddingBottom;
        
        int gravity = getGravity(this);
        final int horizontalGravity = Gravity.getAbsoluteGravity(gravity, this.getLayoutDirection()) & Gravity.HORIZONTAL_GRAVITY_MASK;
        
        switch (horizontalGravity) {
            case Gravity.CENTER_HORIZONTAL:
                childLeft = (right - left - this._totalLength) / 2 + paddingLeft - paddingRight;
                break;

            case Gravity.RIGHT:
                childLeft = right - left - this._totalLength + paddingLeft - paddingRight;
                break;

            case Gravity.LEFT:
            case Gravity.FILL_HORIZONTAL:
            default:
                childLeft = paddingLeft;
                break;
        }

        int count = this.getChildCount();
        for (int i = 0; i < count; i++) {
            View child = this.getChildAt(i);
            if (child.getVisibility() == View.GONE) {
                continue;
            }

            CommonLayoutParams childLayoutParams = (CommonLayoutParams)child.getLayoutParams();
            int childWidth = child.getMeasuredWidth() + childLayoutParams.leftMargin + childLayoutParams.rightMargin;
            CommonLayoutParams.layoutChild(child, childLeft, childTop, childLeft + childWidth, childBottom);
            childLeft += childWidth;
        }
    }
}
