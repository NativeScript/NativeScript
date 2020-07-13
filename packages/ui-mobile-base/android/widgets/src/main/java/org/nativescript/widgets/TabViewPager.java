package org.nativescript.widgets;

import android.content.Context;
import androidx.viewpager.widget.ViewPager;
import android.util.AttributeSet;
import android.view.MotionEvent;
import android.view.KeyEvent;

// See this thread for more information https://stackoverflow.com/questions/9650265
public class TabViewPager extends ViewPager {
    private boolean swipePageEnabled = true;
    private boolean animationEnabled = true;

    public TabViewPager(Context context) {
        super(context);
    }

    public TabViewPager(Context context, AttributeSet attrs) {
        super(context, attrs);
    }

    public void setSwipePageEnabled(boolean enabled) {
        this.swipePageEnabled = enabled;
    }

    public void setAnimationEnabled(boolean enabled) {
        this.animationEnabled = enabled;
    }

    @Override
    public boolean onInterceptTouchEvent(MotionEvent event) {
        if (this.swipePageEnabled) {
            return super.onInterceptTouchEvent(event);
        }

        return false;
    }

    @Override
    public boolean onTouchEvent(MotionEvent event) {
        if (this.swipePageEnabled) {
            return super.onTouchEvent(event);
        }

        return false;
    }

    @Override
    public boolean executeKeyEvent(KeyEvent event) {
        if (this.swipePageEnabled) {
            return super.executeKeyEvent(event);
        }

        return false;
    }

    @Override
    public void setCurrentItem(int item) {
        boolean smoothScroll = this.animationEnabled && this.swipePageEnabled;
        super.setCurrentItem(item, smoothScroll);
    }
}
