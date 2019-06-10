package org.nativescript.widgets;

import android.graphics.Paint;
import android.graphics.drawable.ColorDrawable;
import androidx.annotation.ColorInt;

/**
 * Created by hhristov on 2/23/17.
 */

public class SegmentedBarColorDrawable extends ColorDrawable {

    private float thickness;

    public SegmentedBarColorDrawable(@ColorInt int color, float thickness) {
        super(color);
        this.thickness = thickness;
    }

    public void draw(android.graphics.Canvas canvas) {
        Paint p = new Paint();
        p.setColor(this.getColor());
        p.setStyle(android.graphics.Paint.Style.FILL);
        canvas.drawRect(0, this.getBounds().height() - thickness, this.getBounds().width(), this.getBounds().height(), p);
    }
}