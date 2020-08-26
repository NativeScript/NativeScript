package org.nativescript.widgets.image;

import android.graphics.Bitmap;
import android.graphics.drawable.Drawable;

/**
 * Created by hhristov on 4/18/17.
 */

public interface BitmapOwner {
    void setBitmap(Bitmap value);
    void setDrawable(Drawable asyncDrawable);
    Drawable getDrawable();

}
