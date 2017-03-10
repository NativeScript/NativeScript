package org.nativescript.widgets;

import android.graphics.Paint;
import android.graphics.drawable.ColorDrawable;
import android.support.annotation.ColorInt;

/**
 * Created by hhristov on 2/23/17.
 */

public class SegmentedBarColorDrawable extends ColorDrawable {
    static final int indicatorThickness = android.os.Build.VERSION.SDK_INT >= 21 ? 6 : 15;

    public SegmentedBarColorDrawable(@ColorInt int color) {
        super(color);
    }

    public void draw(android.graphics.Canvas canvas) {
        Paint p = new Paint();
        p.setColor(this.getColor());
        p.setStyle(android.graphics.Paint.Style.FILL);
        canvas.drawRect(0, this.getBounds().height() - indicatorThickness, this.getBounds().width(), this.getBounds().height(), p);
    }
}