package org.nativescript.widgets;

import android.content.Context;
import android.graphics.Canvas;
import android.text.TextPaint;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import kotlin.Unit;
import kotlin.jvm.functions.Function1;

/**
 * @author NathanWalker
 */
public class StyleableTextView extends androidx.appcompat.widget.AppCompatTextView {
	int mTextStrokeWidth = 0;
	int mTextStrokeColor = 0;
	int mTextColor = 0;

	public StyleableTextView(Context context) {
		super(context);
	}


	@Nullable
	private CSSFilters.CSSFilter mFilter = null;

	private String mFilterRaw = "";

	public String getFilter() {
		return mFilterRaw;
	}

	public void setFilter(String value) {
		mFilterRaw = value;
		boolean hadFilters = mFilter != null && !mFilter.getFilters().isEmpty();
		mFilter = CSSFilters.parse(value);
		if (!mFilter.getFilters().isEmpty() || (value.isEmpty() && hadFilters)) {
			invalidate();
		}
	}

	@Override
	public void draw(@NonNull Canvas canvas) {
		Object suppress = getTag(R.id.tag_suppress_ops);
		if (suppress != null && (boolean) suppress) {
			super.onDraw(canvas);
		} else {
			super.draw(canvas);
		}
	}

	@Override
	protected void onDraw(Canvas canvas) {
		ViewUtils.onDraw(this, canvas, mFilter, new Function1<Canvas, Unit>() {
			@Override
			public Unit invoke(Canvas canvas) {
				if (mTextStrokeWidth > 0) {
					_applyStroke(canvas);
				} else {
					StyleableTextView.super.onDraw(canvas);
				}
				return null;
			}
		});
	}

	@Override
	public void requestLayout() {
		super.requestLayout();
		CSSFilters.invalidateCssFilters(this);
	}

	public void setTextStroke(int width, int color, int textColor) {
		mTextStrokeWidth = width;
		mTextStrokeColor = color;
		mTextColor = textColor;
	}

	private void _applyStroke(Canvas canvas) {
		// set paint to fill mode
		TextPaint p = this.getPaint();
		p.setStyle(TextPaint.Style.FILL);
		// draw the fill part of text
		super.onDraw(canvas);
		// stroke color and width
		p.setStyle(TextPaint.Style.STROKE);
		p.setStrokeWidth(mTextStrokeWidth);
		this.setTextColor(mTextStrokeColor);
		// draw stroke
		super.onDraw(canvas);
		// draw original text color fill back (fallback to white)
		p.setStyle(TextPaint.Style.FILL);
		this.setTextColor(mTextColor != 0 ? mTextColor : 0xffffffff);
	}
}
