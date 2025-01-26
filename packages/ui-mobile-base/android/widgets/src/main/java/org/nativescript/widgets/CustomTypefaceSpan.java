package org.nativescript.widgets;

import android.annotation.SuppressLint;
import android.graphics.Typeface;
import android.text.TextPaint;
import android.text.style.TypefaceSpan;

/**
 * Created by hhristov on 2/27/17.
 * Updated by CatchABus on 1/26/25.
 */
@SuppressLint("ParcelCreator")
public class CustomTypefaceSpan extends TypefaceSpan {
	public CustomTypefaceSpan(Typeface typeface) {
		super(typeface);
	}

	public void updateDrawState(TextPaint ds) {
		this.applyCustomTypeFace(ds);
	}

	public void updateMeasureState(TextPaint paint) {
		this.applyCustomTypeFace(paint);
	}

	private void applyCustomTypeFace(TextPaint paint) {
		final Typeface old = paint.getTypeface();
		final int oldStyle = (old == null) ? 0 : old.getStyle();

		Typeface typeface = this.getTypeface();
		int fake = oldStyle & ~typeface.getStyle();
		if ((fake & android.graphics.Typeface.BOLD) != 0) {
			paint.setFakeBoldText(true);
		}

		if ((fake & android.graphics.Typeface.ITALIC) != 0) {
			paint.setTextSkewX(-0.25f);
		}

		paint.setTypeface(typeface);
	}
}
