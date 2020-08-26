package org.nativescript.widgets;

import android.view.View;
import java.util.WeakHashMap;

/**
 * A class encapsulating the logic of setting an origin point.
 * The origin acts as a pivot point but is relative to the View size,
 * Where 0 is the left or top of the view, 0.5 is at the middle and 1 is right or bottom.
 * Under the hood the pivot point is set but is updated when the View's layout is changed.
 */
public class OriginPoint {
    private static WeakHashMap<View, PivotSetter> layoutListeners;

    public static void setX(View view, float x) {
        getSetter(view).setOriginX(view, x);
    }

    public static void setY(View view, float y) {
        getSetter(view).setOriginY(view, y);
    }

    private static PivotSetter getSetter(View view) {
        PivotSetter setter = null;

        if (layoutListeners == null) {
            layoutListeners = new WeakHashMap<>();
        } else {
            setter = layoutListeners.get(view);
        }

        if (setter == null) {
            setter = new PivotSetter();
            view.addOnLayoutChangeListener(setter);
            layoutListeners.put(view, setter);
        }

        return setter;
    }

    private static class PivotSetter implements View.OnLayoutChangeListener {
        private float originX;
        private float originY;

        public PivotSetter() {
            originX = 0.5f;
            originY = 0.5f;
        }

        public void setOriginX(View view, float x) {
            originX = x;
            updateX(view, view.getWidth());
        }

        public void setOriginY(View view, float y) {
            originY = y;
            updateY(view, view.getHeight());
        }

        public void onLayoutChange(View view, int left, int top, int right, int bottom, int oldLeft, int oldTop, int oldRight, int oldBottom) {
            updateX(view, right - left);
            updateY(view, bottom - top);
        }

        private void updateX(View view, int width) {
            view.setPivotX(originX * width);
        }

        private void updateY(View view, int height) {
            view.setPivotY(originY * height);
        }
    }
}
