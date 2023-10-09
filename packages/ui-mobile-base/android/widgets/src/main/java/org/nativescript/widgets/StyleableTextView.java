package org.nativescript.widgets;

import android.content.Context;
import android.graphics.Canvas;
import android.text.TextPaint;

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

	@Override
	protected void onDraw(Canvas canvas) {
		if (mTextStrokeWidth > 0) {
			_applyStroke(canvas);
		}
		super.onDraw(canvas);
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
