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
public class AbsoluteLayout extends LayoutBase {

	public AbsoluteLayout(Context context) {
		super(context);
	}

	@Override
	protected void onMeasure(int widthMeasureSpec, int heightMeasureSpec) {
		CommonLayoutParams.adjustChildrenLayoutParams(this, widthMeasureSpec, heightMeasureSpec);

        int measureWidth = 0;
        int measureHeight = 0;
        int childMeasureSpec = MeasureSpec.makeMeasureSpec(0, MeasureSpec.UNSPECIFIED);

		for (int i = 0, count = this.getChildCount(); i < count; i++) {
			View child = this.getChildAt(i);
			if (child.getVisibility() == View.GONE) {
			    continue;
			}

			CommonLayoutParams.measureChild(child, childMeasureSpec, childMeasureSpec);		   	
		    final int childMeasuredWidth = CommonLayoutParams.getDesiredWidth(child);
		    final int childMeasuredHeight = CommonLayoutParams.getDesiredHeight(child);
		    
		    CommonLayoutParams childLayoutParams = (CommonLayoutParams)child.getLayoutParams();
		    measureWidth = Math.max(measureWidth, childLayoutParams.left  + childMeasuredWidth);
		    measureHeight = Math.max(measureHeight, childLayoutParams.top + childMeasuredHeight);
		}
        
        // Add in our padding
        measureWidth += this.getPaddingLeft() + this.getPaddingRight();
        measureHeight += this.getPaddingTop() + this.getPaddingBottom();

        // Check against our minimum height
        measureWidth = Math.max(measureWidth, this.getSuggestedMinimumWidth());
        measureHeight = Math.max(measureHeight, this.getSuggestedMinimumHeight());

        int widthSizeAndState = resolveSizeAndState(measureWidth, widthMeasureSpec, 0);
        int heightSizeAndState = resolveSizeAndState(measureHeight, heightMeasureSpec, 0);

        this.setMeasuredDimension(widthSizeAndState, heightSizeAndState);
    }

	@Override
	protected void onLayout(boolean changed, int left, int top, int right, int bottom) {
		int leftPadding = this.getPaddingLeft();
		int topPadding = this.getPaddingTop();

		for (int i = 0, count = this.getChildCount(); i < count; i++) {
			View child = this.getChildAt(i);
			if (child.getVisibility() == View.GONE) {
			    continue;
			}
		    
		    CommonLayoutParams childLayoutParams = (CommonLayoutParams)child.getLayoutParams();		
		    int childWidth = child.getMeasuredWidth();
		    int childHeight = child.getMeasuredHeight();
		
		    int childLeft = leftPadding + childLayoutParams.left;
		    int childTop = topPadding + childLayoutParams.top;
		    int childRight = childLeft + childWidth + childLayoutParams.leftMargin + childLayoutParams.rightMargin;
		    int childBottom = childTop + childHeight + childLayoutParams.topMargin + childLayoutParams.bottomMargin;
		
		    CommonLayoutParams.layoutChild(child, childLeft, childTop, childRight, childBottom);
		}

		CommonLayoutParams.restoreOriginalParams(this);
    }
}