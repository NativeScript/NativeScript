package org.nativescript.widgets;

import android.annotation.SuppressLint;
import android.graphics.Paint;
import android.graphics.Typeface;
import android.text.TextPaint;
import android.text.style.TypefaceSpan;

/**
 * Created by hhristov on 2/27/17.
 */

@SuppressLint("ParcelCreator")
public class CustomTypefaceSpan extends TypefaceSpan {
    private Typeface typeface;

    public CustomTypefaceSpan(String family, Typeface typeface) {
        super(family);
        this.typeface = typeface;
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

        Typeface typeface = this.typeface;
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
