package org.nativescript.widgets;

import android.content.Context;

import androidx.annotation.Nullable;
import androidx.recyclerview.widget.RecyclerView;
import androidx.viewpager2.widget.ViewPager2;
import android.util.AttributeSet;
import android.widget.LinearLayout;

// See this thread for more information https://stackoverflow.com/questions/9650265
public class TabViewPager extends LinearLayout {
    private boolean swipePageEnabled = true;
    private boolean animationEnabled = true;
		ViewPager2 viewPager;
    public TabViewPager(Context context) {
        super(context);
				viewPager = new ViewPager2(context);
				init();
    }

    public TabViewPager(Context context, AttributeSet attrs) {
        super(context, attrs);
        viewPager = new ViewPager2(context, attrs);
				init();
    }

    private void init(){
    	viewPager.setLayoutParams(
    		new LayoutParams(
    			LayoutParams.MATCH_PARENT,
					LayoutParams.MATCH_PARENT)
			);
    	addView(viewPager);
		}


    public void setSwipePageEnabled(boolean enabled) {
        this.swipePageEnabled = enabled;
        viewPager.setUserInputEnabled(enabled);
    }

    public void setAnimationEnabled(boolean enabled) {
        this.animationEnabled = enabled;
    }


    public void setCurrentItem(int item) {
        boolean smoothScroll = this.animationEnabled && this.swipePageEnabled;
        viewPager.setCurrentItem(item, smoothScroll);
    }

		public void setCurrentItem(int item, boolean  smoothScroll) {
			viewPager.setCurrentItem(item, smoothScroll);
		}

    public int getOffscreenPageLimit(){
    	return viewPager.getOffscreenPageLimit();
		}

		public void setOffscreenPageLimit(int limit){
    	viewPager.setOffscreenPageLimit(limit);
		}

		public void setAdapter(@Nullable @SuppressWarnings("rawtypes") RecyclerView.Adapter adapter){
    	viewPager.setAdapter(adapter);
		}

		public void unregisterOnPageChangeCallback(ViewPager2.OnPageChangeCallback callback){
    	viewPager.unregisterOnPageChangeCallback(callback);
		}

		public void registerOnPageChangeCallback(ViewPager2.OnPageChangeCallback callback){
			viewPager.registerOnPageChangeCallback(callback);
		}

		public void setOrientation(int orientation) {
    	viewPager.setOrientation(orientation);
		}

		public int getOrientation(){
    	return viewPager.getOrientation();
		}

		public void setPageTransformer(ViewPager2.PageTransformer transformer){
    	viewPager.setPageTransformer(transformer);
		}

	public ViewPager2 getViewPager() {
		return viewPager;
	}
}
