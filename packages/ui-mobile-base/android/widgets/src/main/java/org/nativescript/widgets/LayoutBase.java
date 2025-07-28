package org.nativescript.widgets;

import android.content.Context;
import android.util.AttributeSet;
import android.view.Gravity;
import android.view.MotionEvent;
import android.view.View;
import android.view.ViewGroup;
import android.widget.FrameLayout;

import androidx.appcompat.app.AppCompatActivity;
import androidx.core.graphics.Insets;

/**
 * @author hhristov
 */
public abstract class LayoutBase extends ViewGroup {
	private boolean passThroughParent;
	boolean applyingEdges;

	public static final int OverflowEdgeNone = 0;
	public static final int OverflowEdgeLeft = 1;
	public static final int OverflowEdgeTop = 2;
	public static final int OverflowEdgeRight = 3;
	public static final int OverflowEdgeBottom = 4;
	public static final int OverflowEdgeDontApply = 5;

	Insets edgeInsets = Insets.NONE;

	int overflowEdge = OverflowEdgeNone;

	public LayoutBase(Context context, AttributeSet attrs, int defStyleAttr) {
		super(context, attrs, defStyleAttr);
	}

	public LayoutBase(Context context) {
		super(context);
	}

	public Insets getEdgeInsets() {
		return edgeInsets;
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
			return new CommonLayoutParams((CommonLayoutParams) from);

		if (from instanceof FrameLayout.LayoutParams)
			return new CommonLayoutParams((FrameLayout.LayoutParams) from);

		if (from instanceof ViewGroup.MarginLayoutParams)
			return new CommonLayoutParams((ViewGroup.MarginLayoutParams) from);

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
			gravity = ((FrameLayout.LayoutParams) params).gravity;
		}

		if (gravity == -1) {
			gravity = Gravity.FILL;
		}

		return gravity;
	}

	public boolean getPassThroughParent() {
		return this.passThroughParent;
	}

	public void setPassThroughParent(boolean value) {
		this.passThroughParent = value;
	}

	int mPaddingLeft = 0;
	int mPaddingTop = 0;
	int mPaddingRight = 0;
	int mPaddingBottom = 0;

	@Override
	public void setPadding(int left, int top, int right, int bottom) {
		if (!applyingEdges) {
			mPaddingLeft = left;
			mPaddingTop = top;
			mPaddingRight = right;
			mPaddingBottom = bottom;
		}

		if (!applyingEdges) {
			Utils.LayoutBaseInset data = Utils.edgeToEdgeMap.get((AppCompatActivity) getContext());
			if (data != null) {
				Insets inset = Utils.getFinalInset(data.insets, this, overflowEdge);
				super.setPadding(inset.left, inset.top, inset.right, inset.bottom);
				return;
			}
		}

		super.setPadding(left, top, right, bottom);
	}

	public void setOverflowEdge(int value) {
		overflowEdge = value;
		Utils.setEdgeToEdgeForView(this, value);
	}

	public int getOverflowEdge() {
		return overflowEdge;
	}
}
