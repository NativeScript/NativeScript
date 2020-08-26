/**
 * 
 */
package org.nativescript.widgets;

import android.annotation.SuppressLint;
import android.content.Context;
import android.view.Gravity;
import android.view.View;
import android.util.Log;

/**
 * @author hhristov
 *
 */
public class StackLayout extends LayoutBase {
    static final String TAG = "JS";
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
        CommonLayoutParams.adjustChildrenLayoutParams(this, widthMeasureSpec, heightMeasureSpec);

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
                // Measuring android.widget.ListView, with no height property set, with MeasureSpec.AT_MOST will 
                // result in height required for all list view items or the maximum available space for the StackLayout. 
                // Any following controls will be visible only if enough space left.
                CommonLayoutParams.measureChild(child, childMeasureSpec, MeasureSpec.makeMeasureSpec(remainingLength, measureSpecMode));

                if(measureSpecMode == MeasureSpec.AT_MOST && this.isUnsizedScrollableView(child)){
                    Log.e(TAG, "Avoid using ListView or ScrollView with no explicit height set inside StackLayout. Doing so might results in poor user interface performance and a poor user experience.");
                }

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

        CommonLayoutParams.restoreOriginalParams(this);
    }

    private void layoutVertical(int left, int top, int right, int bottom) {

        int paddingLeft = this.getPaddingLeft();
        int paddingRight = this.getPaddingRight();
        int paddingTop = this.getPaddingTop();
        int paddingBottom = this.getPaddingBottom();

        int childTop = 0;
        int childLeft = paddingLeft;
        int childRight = right - left - paddingRight;
        
        int gravity = LayoutBase.getGravity(this);
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

        for (int i = 0, count = this.getChildCount(); i < count; i++) {
            View child = this.getChildAt(i);
            if (child.getVisibility() == View.GONE) {
                continue;
            }

            int childHeight = CommonLayoutParams.getDesiredHeight(child);
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
        
        int gravity = LayoutBase.getGravity(this);
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

        for (int i = 0, count = this.getChildCount(); i < count; i++) {
            View child = this.getChildAt(i);
            if (child.getVisibility() == View.GONE) {
                continue;
            }

            int childWidth = CommonLayoutParams.getDesiredWidth(child);
            CommonLayoutParams.layoutChild(child, childLeft, childTop, childLeft + childWidth, childBottom);
            childLeft += childWidth;
        }
    }

    private boolean isUnsizedScrollableView(View child) {
        LayoutParams childLayoutParams = child.getLayoutParams();

        if (childLayoutParams.height == -1 && (child instanceof android.widget.ListView || child instanceof org.nativescript.widgets.VerticalScrollView)) {
            return true;
        }

        return false;
    }
}
