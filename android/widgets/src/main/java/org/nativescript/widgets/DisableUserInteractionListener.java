package org.nativescript.widgets;

import android.view.MotionEvent;
import android.view.View;

/**
 * Created by hhristov on 2/22/17.
 */

public final class DisableUserInteractionListener extends Object implements View.OnTouchListener {
    @Override
    public boolean onTouch(View view, MotionEvent motionEvent) {
        return true;
    }
}
