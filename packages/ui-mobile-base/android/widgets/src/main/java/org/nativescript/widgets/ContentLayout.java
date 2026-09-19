/**
 *
 */
package org.nativescript.widgets;

import android.content.Context;
import android.view.View;
import android.util.AttributeSet;

/**
 * @author hhristov
 *
 */
public class ContentLayout extends LayoutBase {

	public ContentLayout(Context context) {
		this(context, null);
	}
	public ContentLayout(Context context, AttributeSet attrs) {
		this(context, attrs, 0);
	}
	public ContentLayout(Context context, AttributeSet attrs, int defStyleAttr) {
		super(context, attrs, defStyleAttr);
	}

	@Override
	protected void onMeasure(int widthMeasureSpec, int heightMeasureSpec) {
		CommonLayoutParams.adjustChildrenLayoutParams(this, widthMeasureSpec, heightMeasureSpec);

		int measureWidth = 0;
		int measureHeight = 0;

		int paddingLeft = this.getPaddingLeft();
		int paddingRight = this.getPaddingRight();
		int paddingTop = this.getPaddingTop();
		int paddingBottom = this.getPaddingBottom();

		// Our own padding is not available to children: reduce the spec we pass down,
		// mirroring StackLayout/DockLayout. Without this, a child measured against the
		// full parent size can be laid out larger than the padding box it actually gets,
		// silently losing content to clipChildren (e.g. Android edge-to-edge insets
		// applied as padding on an ancestor).
		int widthMode = MeasureSpec.getMode(widthMeasureSpec);
		int childWidthMeasureSpec = widthMode == MeasureSpec.UNSPECIFIED ? widthMeasureSpec : MeasureSpec.makeMeasureSpec(Math.max(0, MeasureSpec.getSize(widthMeasureSpec) - paddingLeft - paddingRight), widthMode);

		int heightMode = MeasureSpec.getMode(heightMeasureSpec);
		int childHeightMeasureSpec = heightMode == MeasureSpec.UNSPECIFIED ? heightMeasureSpec : MeasureSpec.makeMeasureSpec(Math.max(0, MeasureSpec.getSize(heightMeasureSpec) - paddingTop - paddingBottom), heightMode);

		for (int i = 0, count = this.getChildCount(); i < count; i++) {
			View child = this.getChildAt(i);
			if (child.getVisibility() == View.GONE) {
				continue;
			}

			CommonLayoutParams.measureChild(child, childWidthMeasureSpec, childHeightMeasureSpec);
			final int childMeasuredWidth = CommonLayoutParams.getDesiredWidth(child);
			final int childMeasuredHeight = CommonLayoutParams.getDesiredHeight(child);

			measureWidth = Math.max(measureWidth, childMeasuredWidth);
			measureHeight = Math.max(measureHeight, childMeasuredHeight);
		}

		// Add in our padding
		measureWidth += paddingLeft + paddingRight;
		measureHeight += paddingTop + paddingBottom;

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
		int childBottom = bottom - top - paddingBottom;

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
