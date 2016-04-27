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
public class ContentLayout extends LayoutBase {

	public ContentLayout(Context context) {
		super(context);
	}

	@Override
	protected void onMeasure(int widthMeasureSpec, int heightMeasureSpec) {
        CommonLayoutParams.adjustChildrenLayoutParams(this, widthMeasureSpec, heightMeasureSpec);

        int measureWidth = 0;
        int measureHeight = 0;

        for (int i = 0, count = this.getChildCount(); i < count; i++) {
            View child = this.getChildAt(i);
            if (child.getVisibility() == View.GONE) {
                continue;
            }

        	CommonLayoutParams.measureChild(child, widthMeasureSpec, heightMeasureSpec);
            final int childMeasuredWidth = CommonLayoutParams.getDesiredWidth(child);
            final int childMeasuredHeight = CommonLayoutParams.getDesiredHeight(child);
            
            measureWidth = Math.max(measureWidth, childMeasuredWidth);
            measureHeight = Math.max(measureHeight, childMeasuredHeight);
        }
        
        // Add in our padding
        measureWidth += this.getPaddingLeft() + this.getPaddingRight();
        measureHeight += this.getPaddingTop() + this.getPaddingBottom();

        // Check against our minimum sizes
        measureWidth = Math.max(measureWidth, this.getSuggestedMinimumWidth());
        measureHeight = Math.max(measureHeight, this.getSuggestedMinimumHeight());

        int widthSizeAndState = resolveSizeAndState(measureWidth, widthMeasureSpec, 0);
        int heightSizeAndState = resolveSizeAndState(measureHeight, heightMeasureSpec, 0);

        this.setMeasuredDimension(widthSizeAndState, heightSizeAndState);
    }

	@Override
	protected void onLayout(boolean changed, int left, int top, int right, int bottom) {
		int paddingLeft = this.getPaddingLeft();
		int paddingRight = this.getPaddingRight();
		int paddingTop = this.getPaddingTop();
		int paddingBottom = this.getPaddingBottom();
		
		int childLeft = paddingLeft;
		int childTop = paddingTop;
		
		int childRight = right - left - (paddingLeft + paddingRight);
		int childBottom = bottom - top - (paddingRight + paddingBottom);

		for (int i = 0, count = this.getChildCount(); i < count; i++) {
		    View child = this.getChildAt(i);
		    if (child.getVisibility() == View.GONE) {
		        continue;
		    }
		
		    CommonLayoutParams.layoutChild(child, childLeft, childTop, childRight, childBottom);
		}

		CommonLayoutParams.restoreOriginalParams(this);
	}
}