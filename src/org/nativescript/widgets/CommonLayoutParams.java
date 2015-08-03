/**
 * 
 */
package org.nativescript.widgets;

import android.annotation.SuppressLint;
import android.content.Context;
import android.content.pm.ApplicationInfo;
import android.content.pm.PackageManager.NameNotFoundException;
import android.util.Log;
import android.view.Gravity;
import android.view.View;
import android.view.View.MeasureSpec;
import android.view.ViewGroup.LayoutParams;
import android.widget.FrameLayout;

/**
 * @author hhristov
 *
 */
public class CommonLayoutParams extends FrameLayout.LayoutParams {

	static final String tag = "NSLayout";
	static int debuggable = -1;
	private static final StringBuilder sb = new StringBuilder();
	
	public CommonLayoutParams() {
		super(LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT);
	}

	public int left = 0;
	public int top = 0;
	public int row = 0;
	public int column = 0;
	public int rowSpan = 1;
	public int columnSpan = 1;	
	public Dock dock = Dock.left;
	
    public static int getDesiredWidth(View view) {
        CommonLayoutParams lp = (CommonLayoutParams)view.getLayoutParams();          
        return view.getMeasuredWidth() + lp.leftMargin + lp.rightMargin;
    }
  
    public static int getDesiredHeight(View view) {
    	CommonLayoutParams lp = (CommonLayoutParams)view.getLayoutParams();
    	return view.getMeasuredHeight() + lp.topMargin + lp.bottomMargin;
    }

    // We use our own layout method because the one in FrameLayout is broken when margins are set and gravity is CENTER_VERTICAL or CENTER_HORIZONTAL.
    @SuppressLint("RtlHardcoded")
	public static void layoutChild(View child, int left, int top, int right, int bottom) {
        if (child.getVisibility() == View.GONE) {
            return;
        }

        int childTop = 0;
        int childLeft = 0;

        int childWidth = child.getMeasuredWidth();
        int childHeight = child.getMeasuredHeight();

        CommonLayoutParams lp = (CommonLayoutParams)child.getLayoutParams();        
        int gravity = lp.gravity;
        if (gravity == -1) {
            gravity = Gravity.FILL;
        } 
        
        int verticalGravity = gravity & Gravity.VERTICAL_GRAVITY_MASK;
        
        // If we have explicit height and gravity is FILL we need to be centered otherwise our explicit height won't be taken into account.
        if (lp.height >= 0 && verticalGravity == Gravity.FILL_VERTICAL) {
        	verticalGravity = Gravity.CENTER_VERTICAL;
        }
        
        switch (verticalGravity) {
	        case Gravity.TOP:
	            childTop = top + lp.topMargin;
	            break;
	
	        case Gravity.CENTER_VERTICAL:
	            childTop = top + (bottom - top - childHeight + lp.topMargin - lp.bottomMargin) / 2;
	            break;
	
	        case Gravity.BOTTOM:
	            childTop = bottom - childHeight - lp.bottomMargin;
	            break;
	
	        case Gravity.FILL_VERTICAL:
	        default:
	            childTop = top + lp.topMargin;
	            childHeight = bottom - top - (lp.topMargin + lp.bottomMargin);
	            break;
        }

        int horizontalGravity = Gravity.getAbsoluteGravity(gravity, child.getLayoutDirection()) & Gravity.HORIZONTAL_GRAVITY_MASK;
        
        // If we have explicit width and gravity is FILL we need to be centered otherwise our explicit width won't be taken into account.
        if (lp.width >= 0 && horizontalGravity == Gravity.FILL_HORIZONTAL) {
        	horizontalGravity = Gravity.CENTER_HORIZONTAL;
        }

        switch (horizontalGravity) {
	        case Gravity.LEFT:
	            childLeft = left + lp.leftMargin;
	            break;
	
	        case Gravity.CENTER_HORIZONTAL:
	            childLeft = left + (right - left - childWidth + lp.leftMargin - lp.rightMargin) / 2;
	            break;
	
	        case Gravity.RIGHT:
	            childLeft = right - childWidth - lp.rightMargin;
	            break;
	
	        case Gravity.FILL_HORIZONTAL:
	        default:
	            childLeft = left + lp.leftMargin;
	            childWidth = right - left - (lp.leftMargin + lp.rightMargin);
	            break;
	    }

        int childRight = Math.round(childLeft + childWidth);
        int childBottom = Math.round(childTop + childHeight);
        childLeft = Math.round(childLeft);
        childTop = Math.round(childTop);
        
        // Re-measure TextView because it is not centered if layout width is larger than measure width.
        if (child instanceof android.widget.TextView) {
        	int measuredWidth = child.getMeasuredWidth();
        	int measuredHeight = child.getMeasuredHeight();
	
	        int width = right - left;
	        int height = bottom - top;
	        if (Math.abs(measuredWidth - width) > 1  || Math.abs(measuredHeight - height) > 1) {
	            int widthMeasureSpec = MeasureSpec.makeMeasureSpec(width, MeasureSpec.EXACTLY);
	            int heightMeasureSpec = MeasureSpec.makeMeasureSpec(height, MeasureSpec.EXACTLY);
	            if (debuggable > 0) {
	            	sb.setLength(0);
	            	sb.append("remeasure ");
	            	sb.append(child);
	            	sb.append(" with ");
	    	        sb.append(MeasureSpec.toString(widthMeasureSpec));
	    	        sb.append(", ");
	    	        sb.append(MeasureSpec.toString(heightMeasureSpec));
	            	log(tag, sb.toString());	
	            }
	            
	            child.measure(widthMeasureSpec, heightMeasureSpec);
	        }
        }
        
        if (debuggable > 0) {
        	sb.setLength(0);
	        sb.append(child.getParent().toString());
	        sb.append(" :layoutChild: ");
	        sb.append(child.toString());
	        sb.append(" ");
	        sb.append(childLeft);
	        sb.append(", ");
	        sb.append(childTop);
	        sb.append(", ");
	        sb.append(childRight);
	        sb.append(", ");
	        sb.append(childBottom);
	        log(tag, sb.toString());
        }
        
        child.layout(childLeft, childTop, childRight, childBottom);
    }
    
    public static void measureChild(View child, int widthMeasureSpec, int heightMeasureSpec) {
        if (child.getVisibility() == View.GONE) {
            return;
        }

        // Negative means we are not initialized.
        if(debuggable < 0) {
        	try {
				Context context = child.getContext();
				int flags = context.getPackageManager().getPackageInfo(context.getPackageName(), 0).applicationInfo.flags;
				debuggable = (flags & ApplicationInfo.FLAG_DEBUGGABLE) != 0 ? 1 : 0;
			} 
			catch (NameNotFoundException e) { 
				debuggable = 0;
			}
        }
        
        if (debuggable > 0) {
        	sb.setLength(0);
	        sb.append(child.getParent().toString());
	        sb.append(" :measureChild: ");
	        sb.append(child.toString());
	        sb.append(" ");
	        sb.append(MeasureSpec.toString(widthMeasureSpec));
	        sb.append(", ");
	        sb.append(MeasureSpec.toString(heightMeasureSpec));
	        log(tag,  sb.toString());
        }
        
        int childWidthMeasureSpec = getMeasureSpec(child, widthMeasureSpec, true);
        int childHeightMeasureSpec = getMeasureSpec(child, heightMeasureSpec, false);

        child.measure(childWidthMeasureSpec, childHeightMeasureSpec);
    }

    static void log(String tag, String message) {
        Log.d(tag, message);
    }
    
	static StringBuilder getStringBuilder() {
		sb.setLength(0);
		return sb;
	}
    
    private static int getMeasureSpec(View view, int parentMeasureSpec, boolean horizontal) {

    	int parentLength = MeasureSpec.getSize(parentMeasureSpec);
    	int parentSpecMode = MeasureSpec.getMode(parentMeasureSpec);
    	
    	CommonLayoutParams lp = (CommonLayoutParams)view.getLayoutParams();
        final int margins = horizontal ? lp.leftMargin + lp.rightMargin : lp.topMargin + lp.bottomMargin;

        int resultSize = 0;
        int resultMode = 0;

        int measureLength = Math.max(0, parentLength - margins);
        int childLength = horizontal ? lp.width : lp.height;

        // We want a specific size... let be it.
        if (childLength >= 0) {
            if (parentSpecMode != MeasureSpec.UNSPECIFIED) {
                resultSize = Math.min(parentLength, childLength);
            }
            else {
                resultSize = childLength;
            }

            resultMode = MeasureSpec.EXACTLY;
        }
        else {
            switch (parentSpecMode) {
                // Parent has imposed an exact size on us
                case MeasureSpec.EXACTLY:
                    resultSize = measureLength;
                    int gravity = LayoutBase.getGravity(view);
                    boolean stretched;
                    if (horizontal) { 
                    	final int horizontalGravity = Gravity.getAbsoluteGravity(gravity, view.getLayoutDirection()) & Gravity.HORIZONTAL_GRAVITY_MASK;
                    	stretched = horizontalGravity == Gravity.FILL_HORIZONTAL;
                    }
                    else {
                    	final int verticalGravity = gravity & Gravity.VERTICAL_GRAVITY_MASK;
                    	stretched = verticalGravity == Gravity.FILL_VERTICAL;
                    }

                    // if stretched - view wants to be our size. So be it.
                    // else - view wants to determine its own size. It can't be bigger than us.
                    resultMode = stretched ? MeasureSpec.EXACTLY : MeasureSpec.AT_MOST;
                    break;

                // Parent has imposed a maximum size on us
                case MeasureSpec.AT_MOST:
                    resultSize = measureLength;
                    resultMode = MeasureSpec.AT_MOST;
                    break;

                case MeasureSpec.UNSPECIFIED:
                    resultSize = 0;
                    resultMode = MeasureSpec.UNSPECIFIED;
                    break;
            }
        }

        return MeasureSpec.makeMeasureSpec(resultSize, resultMode);
    }
}
