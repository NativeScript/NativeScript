/**
 *
 */
package org.nativescript.widgets;

import android.content.Context;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.Paint;
import android.graphics.Path;
import android.graphics.PorterDuff;
import android.graphics.PorterDuffXfermode;
import android.graphics.drawable.Drawable;
import android.os.Build;
import android.util.AttributeSet;
import android.view.Gravity;
import android.view.MotionEvent;
import android.view.View;
import android.view.ViewGroup;
import android.widget.FrameLayout;

import android.util.Log;

import androidx.annotation.RequiresApi;

/**
 * @author hhristov
 *
 */
public abstract class LayoutBase extends ViewGroup {
    private boolean passThroughParent;
    private boolean clipEnabled = true;
    private static Paint clipPaint;

    public LayoutBase(Context context, AttributeSet attrs, int defStyleAttr) {
        super(context, attrs, defStyleAttr);
        init();
    }

    private void init() {
        setLayerType(View.LAYER_TYPE_HARDWARE, null);
        setClipToBounds(clipEnabled);
    }

    public LayoutBase(Context context) {
        super(context);
        init();
    }

    public void setClipToBounds(boolean value) {
        clipEnabled = value;
        if (value) {
            // TODO: does it cost to enable it even if we actually
            // will still need to clip?
            if (android.os.Build.VERSION.SDK_INT >= 21) {
                setClipToOutline(true);
            }
        } else if (android.os.Build.VERSION.SDK_INT >= 21) {
            setClipToOutline(false);
        }
    }

    @Override
    protected LayoutParams generateDefaultLayoutParams() {
        return new CommonLayoutParams();
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public LayoutParams generateLayoutParams(AttributeSet attrs) {
        return new CommonLayoutParams();
    }

    /**
     * {@inheritDoc}
     */
    @Override
    protected boolean checkLayoutParams(LayoutParams p) {
        return p instanceof CommonLayoutParams;
    }

    @Override
    protected ViewGroup.LayoutParams generateLayoutParams(ViewGroup.LayoutParams from) {
        if (from instanceof CommonLayoutParams)
            return new CommonLayoutParams((CommonLayoutParams) from);

        if (from instanceof FrameLayout.LayoutParams)
            return new CommonLayoutParams((FrameLayout.LayoutParams) from);

        if (from instanceof ViewGroup.MarginLayoutParams)
            return new CommonLayoutParams((ViewGroup.MarginLayoutParams) from);

        return new CommonLayoutParams(from);
    }

    @Override
    public boolean shouldDelayChildPressedState() {
        return false;
    }

    @Override
    public boolean onTouchEvent(MotionEvent event) {
        if (!this.passThroughParent) {
            return super.onTouchEvent(event);
        }

        // LayoutBase.onTouchEvent(ev) execution means no interactive child view handled
        // the event so we let the event pass through to parent view of the layout container
        // because passThroughParent is set to true
        return false;
    }

    protected static int getGravity(View view) {
        int gravity = -1;
        LayoutParams params = view.getLayoutParams();
        if (params instanceof FrameLayout.LayoutParams) {
            gravity = ((FrameLayout.LayoutParams) params).gravity;
        }

        if (gravity == -1) {
            gravity = Gravity.FILL;
        }

        return gravity;
    }

    public boolean getPassThroughParent() {
        return this.passThroughParent;
    }

    public void setPassThroughParent(boolean value) {
        this.passThroughParent = value;
    }

    public boolean getClipEnabled() {
        return this.clipEnabled;
    }

    public void setClipEnabled(boolean value) {
        this.clipEnabled = value;
    }

    @RequiresApi(api = Build.VERSION_CODES.KITKAT)
    @Override
    protected void dispatchDraw(Canvas canvas) {
        if (clipEnabled) {
            Drawable drawable = getBackground();
            if (drawable instanceof BorderDrawable) {
                Path clippingPath = ((BorderDrawable) drawable).getClippingPath();
                // if no clippingPath either it is unnecessary or handled by outline
                if (clippingPath != null) {
                    if (LayoutBase.clipPaint == null) {
                        LayoutBase.clipPaint = new Paint(Paint.ANTI_ALIAS_FLAG);
                        // LayoutBase.clipPaint.setColor(Color.WHITE);
                        LayoutBase.clipPaint.setXfermode(new PorterDuffXfermode(PorterDuff.Mode.CLEAR));
                    }
                    int saveCount;
                    int width = getWidth();
                    int height = getHeight();
                    if (android.os.Build.VERSION.SDK_INT >= 21) {
                        saveCount = canvas.saveLayer(new android.graphics.RectF(0.0f, 0.0f, width, height), null);
                    } else {
                        saveCount = canvas.saveLayer(0.0f, 0.0f, width, height, null, Canvas.ALL_SAVE_FLAG);
                    }
                    super.dispatchDraw(canvas);
                    // we dont use clipPath as it is not antialiased
                    canvas.drawPath(clippingPath, LayoutBase.clipPaint);
                    canvas.restoreToCount(saveCount);
                    return;
                }
            }
        }
        super.dispatchDraw(canvas);
    }
}
