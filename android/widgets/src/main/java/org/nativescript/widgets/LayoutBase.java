/**
 * 
 */
package org.nativescript.widgets;

import android.content.Context;
import android.util.AttributeSet;
import android.view.Gravity;
import android.view.MotionEvent;
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

    private boolean passThroughParent;

    public boolean getPassThroughParent() { return this.passThroughParent; }
    public void setPassThroughParent(boolean value) { this.passThroughParent = value; }

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

    @Override
    public boolean onTouchEvent(MotionEvent event) {
        if (!this.passThroughParent) {
            return super.onTouchEvent(event);
        }

        // LayoutBase.onTouchEvent(ev) execution means no interactive child view handled
        // the event so we let the event pass through to parent view of the layout container
        // because passThroughParent is set to true
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