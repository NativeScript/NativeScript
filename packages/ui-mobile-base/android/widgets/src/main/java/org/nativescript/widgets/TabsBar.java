/*
 * Copyright 2014 Google Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package org.nativescript.widgets;

import android.content.Context;
import android.graphics.Typeface;
import androidx.viewpager.widget.PagerAdapter;
import androidx.viewpager.widget.ViewPager;
import android.text.TextUtils;
import android.util.AttributeSet;
import android.util.SparseArray;
import android.util.TypedValue;
import android.view.Gravity;
import android.view.View;
import android.view.ViewGroup;
import android.widget.HorizontalScrollView;
import android.widget.ImageView;
import android.widget.ImageView.ScaleType;
import android.widget.LinearLayout;
import android.widget.TextView;

/**
 * To be used with ViewPager to provide a tab indicator component which give
 * constant feedback as to the user's scroll progress.
 * <p>
 * To use the component, simply add it to your view hierarchy. Then in your
 * {@link android.app.Activity} or {@link android.support.v4.app.Fragment} call
 * {@link #setViewPager(ViewPager)} providing it the ViewPager this layout is
 * being used for.
 * <p>
 * The colors can be customized in two ways. The first and simplest is to
 * provide an array of colors via {@link #setSelectedIndicatorColors(int...)}.
 * The alternative is via the {@link TabColorizer} interface which provides you
 * complete control over which color is used for any individual position.
 * <p>
 */
public class TabsBar extends HorizontalScrollView {
    /**
     * Allows complete control over the colors drawn in the tab layout. Set with
     * {@link #setCustomTabColorizer(TabColorizer)}.
     */
    public interface TabColorizer {

        /**
         * @return return the color of the indicator used when {@code position}
         *         is selected.
         */
        int getIndicatorColor(int position);

    }

    private static final int TITLE_OFFSET_DIPS = 24;
    private static final int TAB_VIEW_PADDING_DIPS = 16;
    private static final int TAB_VIEW_TEXT_SIZE_SP = 12;
    private static final int TEXT_MAX_WIDTH = 180;
    private static final int SMALL_MIN_HEIGHT = 48;
    private static final int LARGE_MIN_HEIGHT = 72;

    private int mTitleOffset;

    private boolean mDistributeEvenly = true;

    private TabItemSpec[] mTabItems;
    private ViewPager mViewPager;
    private SparseArray<String> mContentDescriptions = new SparseArray<String>();
    private ViewPager.OnPageChangeListener mViewPagerPageChangeListener;

    private final TabStrip mTabStrip;

    public TabsBar(Context context) {
        this(context, null);
    }

    public TabsBar(Context context, AttributeSet attrs) {
        this(context, attrs, 0);
    }

    public TabsBar(Context context, AttributeSet attrs, int defStyle) {
        super(context, attrs, defStyle);
        // Disable the Scroll Bar
        setHorizontalScrollBarEnabled(false);
        // Make sure that the Tab Strips fills this View
        setFillViewport(true);

        mTitleOffset = (int) (TITLE_OFFSET_DIPS * getResources().getDisplayMetrics().density);

        mTabStrip = new TabStrip(context);
        addView(mTabStrip, LayoutParams.MATCH_PARENT, LayoutParams.WRAP_CONTENT);
    }

    /**
     * Set the custom {@link TabColorizer} to be used.
     *
     * If you only require simple customisation then you can use
     * {@link #setSelectedIndicatorColors(int...)} to achieve similar effects.
     */
    public void setCustomTabColorizer(TabColorizer tabColorizer) {
        //mTabStrip.setCustomTabColorizer(tabColorizer);
    }

    public void setDistributeEvenly(boolean distributeEvenly) {
        mDistributeEvenly = distributeEvenly;
    }

    /**
     * Sets the colors to be used for indicating the selected tab. These colors
     * are treated as a circular array. Providing one color will mean that all
     * tabs are indicated with the same color.
     */
    public void setSelectedIndicatorColors(int... colors) {
        mTabStrip.setSelectedIndicatorColors(colors);
        this.mSelectedIndicatorColors = colors;
    }

    private int[] mSelectedIndicatorColors;
    public int[] getSelectedIndicatorColors() {
        return this.mSelectedIndicatorColors;
    }

    public void setTabTextColor(int color){
        mTabStrip.setTabTextColor(color);
    }

    public int getTabTextColor(){
        return mTabStrip.getTabTextColor();
    }

    public void setSelectedTabTextColor(int color){
        mTabStrip.setSelectedTabTextColor(color);
    }

    public int getSelectedTabTextColor(){
        return mTabStrip.getSelectedTabTextColor();
    }

    public void setTabTextFontSize(float fontSize){
        mTabStrip.setTabTextFontSize(fontSize);
    }

    public float getTabTextFontSize(){
        return mTabStrip.getTabTextFontSize();
    }

    /**
     * Set the {@link ViewPager.OnPageChangeListener}. When using
     * {@link TabsBar} you are required to set any
     * {@link ViewPager.OnPageChangeListener} through this method. This is so
     * that the layout can update it's scroll position correctly.
     *
     * @see ViewPager#setOnPageChangeListener(ViewPager.OnPageChangeListener)
     */
    public void setOnPageChangeListener(ViewPager.OnPageChangeListener listener) {
        mViewPagerPageChangeListener = listener;
    }

    /**
     * Sets the associated view pager. Note that the assumption here is that the
     * pager content (number of tabs and tab titles) does not change after this
     * call has been made.
     */
    public void setViewPager(ViewPager viewPager) {
        this.setItems(null, viewPager);
    }

    public void setItems(TabItemSpec[] items, ViewPager viewPager) {
        mTabStrip.removeAllViews();

        mViewPager = viewPager;
        mTabItems = items;
        if (viewPager != null) {
            viewPager.addOnPageChangeListener(new InternalViewPagerListener());
            populateTabStrip();
        }
    }

    /**
     * Updates the UI of an item at specified index
     */
    public void updateItemAt(int position, TabItemSpec tabItem) {
        LinearLayout ll = (LinearLayout)mTabStrip.getChildAt(position);
        ImageView imgView = (ImageView)ll.getChildAt(0);
        TextView textView = (TextView)ll.getChildAt(1);
        this.setupItem(ll, textView, imgView, tabItem);
    }

    /**
     * Gets the TextView for tab item at index
     */
    public TextView getTextViewForItemAt(int index){
        LinearLayout ll = this.getViewForItemAt(index);
        return  (ll != null) ? (TextView)ll.getChildAt(1) : null;
    }

    /**
     * Gets the LinearLayout container for tab item at index
     */
    public LinearLayout getViewForItemAt(int index){
        LinearLayout result = null;

        if(this.mTabStrip.getChildCount() > index){
            result = (LinearLayout)this.mTabStrip.getChildAt(index);
        }

        return result;
    }

    /**
     * Gets the number of realized tabs.
     */
    public int getItemCount(){
        return this.mTabStrip.getChildCount();
    }

    /**
     * Create a default view to be used for tabs.
     */
    protected View createDefaultTabView(Context context, TabItemSpec tabItem) {
        float density = getResources().getDisplayMetrics().density;
        int padding = (int) (TAB_VIEW_PADDING_DIPS * density);

        LinearLayout ll = new LinearLayout(context);
        ll.setLayoutParams(new LinearLayout.LayoutParams(ViewGroup.LayoutParams.WRAP_CONTENT, ViewGroup.LayoutParams.MATCH_PARENT));
        ll.setGravity(Gravity.CENTER);
        ll.setOrientation(LinearLayout.VERTICAL);
        TypedValue outValue = new TypedValue();
        getContext().getTheme().resolveAttribute(android.R.attr.selectableItemBackground, outValue, true);
        ll.setBackgroundResource(outValue.resourceId);

        ImageView imgView = new ImageView(context);
        imgView.setScaleType(ScaleType.FIT_CENTER);
        LinearLayout.LayoutParams imgLP = new LinearLayout.LayoutParams(ViewGroup.LayoutParams.WRAP_CONTENT, ViewGroup.LayoutParams.WRAP_CONTENT);
        imgLP.gravity = Gravity.CENTER;
        imgView.setLayoutParams(imgLP);

        TextView textView = new TextView(context);
        textView.setGravity(Gravity.CENTER);
        textView.setMaxWidth((int) (TEXT_MAX_WIDTH * density));
        textView.setTextSize(TypedValue.COMPLEX_UNIT_SP, TAB_VIEW_TEXT_SIZE_SP);
        textView.setEllipsize(TextUtils.TruncateAt.END);
        textView.setMaxLines(2);
        textView.setLayoutParams(new LinearLayout.LayoutParams(ViewGroup.LayoutParams.WRAP_CONTENT, ViewGroup.LayoutParams.WRAP_CONTENT));
        textView.setPadding(padding, 0, padding, 0);

        this.setupItem(ll, textView, imgView, tabItem);

        ll.addView(imgView);
        ll.addView(textView);
        return ll;
    }

    private void setupItem(LinearLayout ll, TextView textView,ImageView imgView, TabItemSpec tabItem){
        float density = getResources().getDisplayMetrics().density;

        if (tabItem.iconId != 0) {
            imgView.setImageResource(tabItem.iconId);
            imgView.setVisibility(VISIBLE);
        } else if (tabItem.iconDrawable != null) {
            imgView.setImageDrawable(tabItem.iconDrawable);
            imgView.setVisibility(VISIBLE);
        } else {
            imgView.setVisibility(GONE);
        }

        if (tabItem.title != null && !tabItem.title.isEmpty()) {
            textView.setText(tabItem.title);
            textView.setVisibility(VISIBLE);

            if (tabItem.typeFace != null) {
                textView.setTypeface(tabItem.typeFace);
            }

            if (tabItem.fontSize != 0) {
                textView.setTextSize(tabItem.fontSize);
            }

            if (tabItem.color != 0) {
                textView.setTextColor(tabItem.color);
                mTabStrip.setShouldUpdateTabsTextColor(false);
            }
        } else {
            textView.setVisibility(GONE);
        }

        if (tabItem.backgroundColor != 0) {
            ll.setBackgroundColor(tabItem.backgroundColor);
        }

        if (imgView.getVisibility() == VISIBLE && textView.getVisibility() == VISIBLE) {
            ll.setMinimumHeight((int) (LARGE_MIN_HEIGHT * density));
        } else {
            ll.setMinimumHeight((int) (SMALL_MIN_HEIGHT * density));
        }

        if (mDistributeEvenly) {
            LinearLayout.LayoutParams lp = (LinearLayout.LayoutParams) ll.getLayoutParams();
            lp.width = 0;
            lp.weight = 1;
        }
    }

    public boolean onTap(int position) {
        // to be overridden in JS
        return true;
    }

    public void onSelectedPositionChange(int position, int prevPosition) {
        // to be overridden in JS
    }

    private void populateTabStrip() {
        final PagerAdapter adapter = mViewPager.getAdapter();
        final OnClickListener tabClickListener = new TabClickListener();

        for (int i = 0; i < adapter.getCount(); i++) {
            View tabView = null;

            TabItemSpec tabItem;
            if (this.mTabItems != null && this.mTabItems.length > i) {
                tabItem = this.mTabItems[i];
            } else {
                tabItem = new TabItemSpec();
                tabItem.title = adapter.getPageTitle(i).toString();
            }

            tabView = createDefaultTabView(getContext(), tabItem);

            tabView.setOnClickListener(tabClickListener);
            String desc = mContentDescriptions.get(i, null);
            if (desc != null) {
                tabView.setContentDescription(desc);
            }

            mTabStrip.addView(tabView);
            if (i == mViewPager.getCurrentItem()) {
                tabView.setSelected(true);
            }
        }
    }

    public void setContentDescription(int i, String desc) {
        mContentDescriptions.put(i, desc);
    }

    @Override
    protected void onAttachedToWindow() {
        super.onAttachedToWindow();

        if (mViewPager != null) {
            scrollToTab(mViewPager.getCurrentItem(), 0);
        }
    }

    private void scrollToTab(int tabIndex, int positionOffset) {
        final int tabStripChildCount = mTabStrip.getChildCount();
        if (tabStripChildCount == 0 || tabIndex < 0 || tabIndex >= tabStripChildCount) {
            return;
        }

        View selectedChild = mTabStrip.getChildAt(tabIndex);
        if (selectedChild != null) {
            int targetScrollX = selectedChild.getLeft() + positionOffset;

            if (tabIndex > 0 || positionOffset > 0) {
                // If we're not at the first child and are mid-scroll, make sure
                // we obey the offset
                targetScrollX -= mTitleOffset;
            }

            scrollTo(targetScrollX, 0);
        }
    }

    private class InternalViewPagerListener implements ViewPager.OnPageChangeListener {
        private int mScrollState;

        @Override
        public void onPageScrolled(int position, float positionOffset, int positionOffsetPixels) {
            int tabStripChildCount = mTabStrip.getChildCount();
            if ((tabStripChildCount == 0) || (position < 0) || (position >= tabStripChildCount)) {
                return;
            }

            int prevPosition = mTabStrip.getSelectedPosition();

            if (prevPosition != position) {
                onSelectedPositionChange(position, prevPosition);
            }

            mTabStrip.onTabsViewPagerPageChanged(position, positionOffset);

            View selectedTitle = mTabStrip.getChildAt(position);
            int extraOffset = (selectedTitle != null) ? (int) (positionOffset * selectedTitle.getWidth()) : 0;
            scrollToTab(position, extraOffset);

            if (mViewPagerPageChangeListener != null) {
                mViewPagerPageChangeListener.onPageScrolled(position, positionOffset, positionOffsetPixels);
            }
        }

        @Override
        public void onPageScrollStateChanged(int state) {
            mScrollState = state;

            if (mViewPagerPageChangeListener != null) {
                mViewPagerPageChangeListener.onPageScrollStateChanged(state);
            }
        }

        @Override
        public void onPageSelected(int position) {
            if (mScrollState == ViewPager.SCROLL_STATE_IDLE) {
                mTabStrip.onTabsViewPagerPageChanged(position, 0f);
                scrollToTab(position, 0);
            }
            for (int i = 0; i < mTabStrip.getChildCount(); i++) {
                mTabStrip.getChildAt(i).setSelected(position == i);
            }
            if (mViewPagerPageChangeListener != null) {
                mViewPagerPageChangeListener.onPageSelected(position);
            }
        }

    }

    private class TabClickListener implements OnClickListener {
        @Override
        public void onClick(View v) {
            for (int i = 0; i < mTabStrip.getChildCount(); i++) {
                if (v == mTabStrip.getChildAt(i)) {
                    if (onTap(i)) {
                        mViewPager.setCurrentItem(i);
                    }
                    return;
                }
            }
        }
    }
}