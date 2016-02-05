/**
 * 
 */
package org.nativescript.widgets;

import java.util.ArrayList;
import android.content.Context;
import android.view.View;

/**
 * @author hhristov
 *
 */
public class WrapLayout extends LayoutBase {

	private int _itemWidth = -1;
	private int _itemHeight = -1;
	private Orientation _orientation = Orientation.horizontal;
    private ArrayList<Integer> _lengths = new ArrayList<Integer>();
    
	public WrapLayout(Context context) {
		super(context);
	}	

	public Orientation getOrientation() {
	    return this._orientation;
	}
	public void setOrientation(Orientation value) {
	    this._orientation = value;
	    this.requestLayout();
	}
	
	public int getItemWidth() {
	    return this._itemWidth;
	}
	public void setItemWidth(int value) {
	    this._itemWidth = value;
	    this.requestLayout();
	}
	
	public int getItemHeight() {
	    return this._itemHeight;
	}
	public void setItemHeight(int value) {
	    this._itemHeight = value;
	    this.requestLayout();
	}
	
    private static int getViewMeasureSpec(int parentMode, int parentLength, int itemLength) {
        if (itemLength > 0) {
            return MeasureSpec.makeMeasureSpec(itemLength, MeasureSpec.EXACTLY);
        }
        else if (parentMode == MeasureSpec.UNSPECIFIED) {
            return MeasureSpec.makeMeasureSpec(0, MeasureSpec.UNSPECIFIED);
        }
        else {
            return MeasureSpec.makeMeasureSpec(parentLength, MeasureSpec.AT_MOST);
        }
    }

    private int getDesiredWidth(View child) {
        if (this._itemWidth > 0) {
            return this._itemWidth;
        }

        // Add margins because layoutChild will subtract them.
        return CommonLayoutParams.getDesiredWidth(child);
    }

    private int getDesiredHeight(View child) {
        if (this._itemHeight > 0) {
            return this._itemHeight;
        }

        // Add margins because layoutChild will subtract them.
        return CommonLayoutParams.getDesiredHeight(child);
    }

    @Override
    protected void onMeasure(int widthMeasureSpec, int heightMeasureSpec) {
        CommonLayoutParams.adjustChildrenLayoutParams(this, widthMeasureSpec, heightMeasureSpec);

        int measureWidth = 0;
    	int measureHeight = 0;

        boolean isVertical = this._orientation == Orientation.vertical;
        int verticalPadding = this.getPaddingTop() + this.getPaddingBottom();
        int horizontalPadding = this.getPaddingLeft() + this.getPaddingRight();

        int widthMode = MeasureSpec.getMode(widthMeasureSpec);
        int heightMode = MeasureSpec.getMode(heightMeasureSpec);

        int availableWidth = widthMode == MeasureSpec.UNSPECIFIED ? Integer.MAX_VALUE : MeasureSpec.getSize(widthMeasureSpec) - horizontalPadding;
        int availableHeight = heightMode == MeasureSpec.UNSPECIFIED ? Integer.MAX_VALUE : MeasureSpec.getSize(heightMeasureSpec) - verticalPadding;

        int childWidthMeasureSpec = getViewMeasureSpec(widthMode, availableWidth, this._itemWidth);
        int childHeightMeasureSpec = getViewMeasureSpec(heightMode, availableHeight, this._itemHeight);

        int remainingWidth = availableWidth;
        int remainingHeight = availableHeight;

        this._lengths.clear();
        int rowOrColumn = 0;
        int maxLength = 0;
        
        for (int i = 0, count = this.getChildCount(); i < count; i++) {
            View child = this.getChildAt(i);
            if (child.getVisibility() == View.GONE) {
                continue;
            }

        	CommonLayoutParams.measureChild(child, childWidthMeasureSpec, childHeightMeasureSpec);
            final int childMeasuredWidth = this.getDesiredWidth(child);
            final int childMeasuredHeight = this.getDesiredHeight(child);
            final boolean isFirst = this._lengths.size() <= rowOrColumn;
            
            if (isVertical) {
                if (childMeasuredHeight > remainingHeight) {
                    rowOrColumn++;
                    maxLength = Math.max(maxLength, measureHeight);
                    measureHeight = childMeasuredHeight;
                    remainingHeight = availableHeight - childMeasuredHeight;
                    this._lengths.add(isFirst ? rowOrColumn - 1 : rowOrColumn, childMeasuredWidth);
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
                    this._lengths.add(isFirst ? rowOrColumn - 1 : rowOrColumn, childMeasuredHeight);
                }
                else {
                    remainingWidth -= childMeasuredWidth;
                    measureWidth += childMeasuredWidth;
                }
            }
            
            if(isFirst) {
            	this._lengths.add(rowOrColumn, isVertical ? childMeasuredWidth : childMeasuredHeight);
            }
            else {
            	this._lengths.set(rowOrColumn, Math.max(this._lengths.get(rowOrColumn), isVertical ? childMeasuredWidth : childMeasuredHeight));
            }
        }

        if (isVertical) {
            measureHeight = Math.max(maxLength, measureHeight);
            for (int i = 0, count = this._lengths.size(); i < count; i++) {
                measureWidth += this._lengths.get(i);
            }
        }
        else {
            measureWidth = Math.max(maxLength, measureWidth);
            for (int i = 0, count = this._lengths.size(); i < count; i++) {
                measureHeight += this._lengths.get(i);
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
		boolean isVertical = this._orientation == Orientation.vertical;
        int paddingLeft = this.getPaddingLeft();
        int paddingRight = this.getPaddingRight();
        int paddingTop = this.getPaddingTop();
        int paddingBottom = this.getPaddingBottom();

        int childLeft = paddingLeft;
        int childTop = paddingTop;
        int childrenLength = isVertical ? bottom - top - paddingBottom : right - left - paddingRight;

        int rowOrColumn = 0;
        for (int i = 0, count = this.getChildCount(); i < count; i++) {
            View child = this.getChildAt(i);
            if (child.getVisibility() == View.GONE) {
                continue;
            }

            int childWidth = this.getDesiredWidth(child);
            int childHeight = this.getDesiredHeight(child);

            int length = this._lengths.get(rowOrColumn);
            if (isVertical) {
                childWidth = length;
                final boolean isFirst = childTop == paddingTop;
                if (childTop + childHeight > childrenLength) {
                    // Move to top.
                    childTop = paddingTop;

                    if (!isFirst){
                        // Move to right with current column width.
                        childLeft += length;
                    }

                    // Move to next column.
                    rowOrColumn++;

                    // Take respective column width.
                    childWidth = this._lengths.get(isFirst ? rowOrColumn - 1 : rowOrColumn);
                }
            }
            else {
                childHeight = length;
                final boolean isFirst = childLeft == paddingLeft;
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
                    childHeight = this._lengths.get(isFirst ? rowOrColumn - 1 : rowOrColumn);
                }
            }

            CommonLayoutParams.layoutChild(child, childLeft, childTop, childLeft + childWidth, childTop + childHeight);

            if (isVertical) {
                // Move next child Top position to bottom.
                childTop += childHeight;
            }
            else {
                // Move next child Left position to right.
                childLeft += childWidth;
            }
        }

        CommonLayoutParams.restoreOriginalParams(this);
    }
}