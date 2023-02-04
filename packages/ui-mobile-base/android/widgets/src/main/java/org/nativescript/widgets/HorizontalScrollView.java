package org.nativescript.widgets;

import android.content.Context;
import android.util.AttributeSet;
import android.view.MotionEvent;
import android.view.View;
import android.view.ViewGroup;
import android.widget.FrameLayout;

/**
 * @author hhristov
 */
public class HorizontalScrollView extends android.widget.HorizontalScrollView {

	private int contentMeasuredWidth = 0;
	private int contentMeasuredHeight = 0;
	private int scrollableLength = 0;
	private boolean scrollEnabled = true;

	public HorizontalScrollView(Context context) {
		super(context);
	}

	public int getScrollableLength() {
		return this.scrollableLength;
	}

	public boolean getScrollEnabled() {
		return this.scrollEnabled;
	}

	public void setScrollEnabled(boolean value) {
		this.scrollEnabled = value;
	}

	@Override
	public boolean onInterceptTouchEvent(MotionEvent ev) {
		// Do nothing with intercepted touch events if we are not scrollable
		if (!this.scrollEnabled) {
			return false;
		}

		return super.onInterceptTouchEvent(ev);
	}

	@Override
	public boolean onTouchEvent(MotionEvent ev) {
		if (!this.scrollEnabled && (ev.getAction() == MotionEvent.ACTION_DOWN || ev.getAction() == MotionEvent.ACTION_MOVE)) {
			return false;
		}

		return super.onTouchEvent(ev);
	}

	@Override
	protected CommonLayoutParams generateDefaultLayoutParams() {
		return new CommonLayoutParams();
	}

	/**
	 * {@inheritDoc}
	 */
	@Override
	public CommonLayoutParams generateLayoutParams(AttributeSet attrs) {
		return new CommonLayoutParams();
	}

	/**
	 * {@inheritDoc}
	 */
	@Override
	protected boolean checkLayoutParams(ViewGroup.LayoutParams p) {
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
	protected void onMeasure(int widthMeasureSpec, int heightMeasureSpec) {
		CommonLayoutParams.adjustChildrenLayoutParams(this, widthMeasureSpec, heightMeasureSpec);

		// Don't call measure because it will measure content twice.
		// ScrollView is expected to have single child so we measure only the first child.
		View child = this.getChildCount() > 0 ? this.getChildAt(0) : null;
		if (child == null) {
			this.scrollableLength = 0;
			this.contentMeasuredWidth = 0;
			this.contentMeasuredHeight = 0;

			this.setPadding(0, 0, 0, 0);
		} else {
			CommonLayoutParams.measureChild(child, MeasureSpec.makeMeasureSpec(0, MeasureSpec.UNSPECIFIED), heightMeasureSpec);
			this.contentMeasuredWidth = CommonLayoutParams.getDesiredWidth(child);
			this.contentMeasuredHeight = CommonLayoutParams.getDesiredHeight(child);

			// Android ScrollView does not account to child margins so we set them as paddings. Otherwise you can never scroll to bottom.
			CommonLayoutParams lp = (CommonLayoutParams) child.getLayoutParams();
			this.setPadding(lp.leftMargin, lp.topMargin, lp.rightMargin, lp.bottomMargin);
		}

		// Don't add in our paddings because they are already added as child margins. (we will include them twice if we add them).
		// Check the previous line - this.setPadding(lp.leftMargin, lp.topMargin, lp.rightMargin, lp.bottomMargin);
		//this.contentMeasuredWidth += this.getPaddingLeft() + this.getPaddingRight();
		//this.contentMeasuredHeight += this.getPaddingTop() + this.getPaddingBottom();

		// Check against our minimum height
		this.contentMeasuredWidth = Math.max(this.contentMeasuredWidth, this.getSuggestedMinimumWidth());
		this.contentMeasuredHeight = Math.max(this.contentMeasuredHeight, this.getSuggestedMinimumHeight());

		int widthSizeAndState = resolveSizeAndState(this.contentMeasuredWidth, widthMeasureSpec, 0);
		int heightSizeAndState = resolveSizeAndState(this.contentMeasuredHeight, heightMeasureSpec, 0);

		this.setMeasuredDimension(widthSizeAndState, heightSizeAndState);
	}

	@Override
	protected void onLayout(boolean changed, int left, int top, int right, int bottom) {
		final int width = right - left;

		if (this.getChildCount() > 0) {
			final View child = this.getChildAt(0);
			final CommonLayoutParams lp = (CommonLayoutParams) child.getLayoutParams();

			final int leftMargin = lp.leftMargin;
			final int topMargin = lp.topMargin;
			final int rightMargin = lp.rightMargin;
			final int bottomMargin = lp.bottomMargin;

			// Android scrollviews don't handle margins very well, so unset margin values and set their values anew when layout calculations are done
			lp.leftMargin = 0;
			lp.topMargin = 0;
			lp.rightMargin = 0;
			lp.bottomMargin = 0;

			super.onLayout(changed, left, top, right, bottom);

			// View has finished laying out child, set margin values
			lp.leftMargin = leftMargin;
			lp.topMargin = topMargin;
			lp.rightMargin = rightMargin;
			lp.bottomMargin = bottomMargin;

			this.scrollableLength = Math.max(0, this.contentMeasuredWidth - width);
		} else {
			this.scrollableLength = 0;
		}

		CommonLayoutParams.restoreOriginalParams(this);
	}
}
