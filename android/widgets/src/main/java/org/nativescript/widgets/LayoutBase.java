/**
 * 
 */
package org.nativescript.widgets;

import android.content.Context;
import android.util.AttributeSet;
import android.view.Gravity;
import android.view.View;
import android.view.ViewGroup;
import android.widget.FrameLayout;

/**
 * @author hhristov
 *
 */
public abstract class LayoutBase extends ViewGroup {

	public LayoutBase(Context context) {
		super(context);
	}

    @Override
    protected LayoutParams generateDefaultLayoutParams() {
        return new CommonLayoutParams();
    }
    
    /**
     * {@inheritDoc}
     */
    @Override
    public LayoutParams generateLayoutParams(AttributeSet attrs) {
        return new CommonLayoutParams();        
    }

    /**
     * {@inheritDoc}
     */
    @Override
    protected boolean checkLayoutParams(LayoutParams p) {
        return p instanceof CommonLayoutParams;
    }

    @Override
    protected ViewGroup.LayoutParams generateLayoutParams(ViewGroup.LayoutParams from) {
        if (from instanceof CommonLayoutParams)
            return new CommonLayoutParams((CommonLayoutParams)from);

        if (from instanceof FrameLayout.LayoutParams)
            return new CommonLayoutParams((FrameLayout.LayoutParams)from);

        if (from instanceof ViewGroup.MarginLayoutParams)
            return new CommonLayoutParams((ViewGroup.MarginLayoutParams)from);

        return new CommonLayoutParams(from);
    }

	@Override
	public boolean shouldDelayChildPressedState() {
		return false;
	}
	
	protected static int getGravity(View view) {
		int gravity = -1;
		LayoutParams params = view.getLayoutParams();
		if (params instanceof FrameLayout.LayoutParams) {
			gravity = ((FrameLayout.LayoutParams)params).gravity;	
		}
	        
        if (gravity == -1) {
            gravity = Gravity.FILL;
        }
        
        return gravity;
	}
}