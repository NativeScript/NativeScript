/*
 * Copyright 2016 Google Inc. All rights reserved.
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
import android.content.res.TypedArray;
import android.graphics.Canvas;
import android.graphics.drawable.Drawable;
import androidx.annotation.IntDef; 
import androidx.annotation.NonNull; 
import androidx.core.view.ViewCompat;
import android.util.AttributeSet;
import android.util.SparseIntArray;
import android.view.View;
import android.view.ViewGroup;
import android.widget.FrameLayout;
import android.widget.LinearLayout;
import android.widget.RelativeLayout;

import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

/**
 * A layout that arranges its children in a way its attributes can be specified like the
 * CSS Flexible Box Layout Module.
 * This class extends the {@link ViewGroup} like other layout classes such as {@link LinearLayout}
 * or {@link RelativeLayout}, the attributes can be specified from a layout XML or from code.
 *
 * The supported attributes that you can use are:
 * <ul>
 * <li>{@code flexDirection}</li>
 * <li>{@code flexWrap}</li>
 * <li>{@code justifyContent}</li>
 * <li>{@code alignItems}</li>
 * <li>{@code alignContent}</li>
 * <li>{@code showDivider}</li>
 * <li>{@code showDividerHorizontal}</li>
 * <li>{@code showDividerVertical}</li>
 * <li>{@code dividerDrawable}</li>
 * <li>{@code dividerDrawableHorizontal}</li>
 * <li>{@code dividerDrawableVertical}</li>
 * </ul>
 * for the FlexboxLayout.
 *
 * And for the children of the FlexboxLayout, you can use:
 * <ul>
 * <li>{@code layout_order}</li>
 * <li>{@code layout_flexGrow}</li>
 * <li>{@code layout_flexShrink}</li>
 * <li>{@code layout_flexBasisPercent}</li>
 * <li>{@code layout_alignSelf}</li>
 * <li>{@code layout_minWidth}</li>
 * <li>{@code layout_minHeight}</li>
 * <li>{@code layout_maxWidth}</li>
 * <li>{@code layout_maxHeight}</li>
 * <li>{@code layout_wrapBefore}</li>
 * </ul>
 */
public class FlexboxLayout extends ViewGroup {

    @IntDef({FLEX_DIRECTION_ROW, FLEX_DIRECTION_ROW_REVERSE, FLEX_DIRECTION_COLUMN,
            FLEX_DIRECTION_COLUMN_REVERSE})
    @Retention(RetentionPolicy.SOURCE)
    public @interface FlexDirection {

    }

    public static final int FLEX_DIRECTION_ROW = 0;

    public static final int FLEX_DIRECTION_ROW_REVERSE = 1;

    public static final int FLEX_DIRECTION_COLUMN = 2;

    public static final int FLEX_DIRECTION_COLUMN_REVERSE = 3;

    /**
     * The direction children items are placed inside the Flexbox layout, it determines the
     * direction of the main axis (and the cross axis, perpendicular to the main axis).
     * <ul>
     * <li>
     * {@link #FLEX_DIRECTION_ROW}: Main axis direction -> horizontal. Main start to
     * main end -> Left to right (in LTR languages).
     * Cross start to cross end -> Top to bottom
     * </li>
     * <li>
     * {@link #FLEX_DIRECTION_ROW_REVERSE}: Main axis direction -> horizontal. Main start
     * to main end -> Right to left (in LTR languages). Cross start to cross end ->
     * Top to bottom.
     * </li>
     * <li>
     * {@link #FLEX_DIRECTION_COLUMN}: Main axis direction -> vertical. Main start
     * to main end -> Top to bottom. Cross start to cross end ->
     * Left to right (In LTR languages).
     * </li>
     * <li>
     * {@link #FLEX_DIRECTION_COLUMN_REVERSE}: Main axis direction -> vertical. Main start
     * to main end -> Bottom to top. Cross start to cross end -> Left to right
     * (In LTR languages)
     * </li>
     * </ul>
     * The default value is {@link #FLEX_DIRECTION_ROW}.
     */
    private int mFlexDirection = FLEX_DIRECTION_ROW;


    @IntDef({FLEX_WRAP_NOWRAP, FLEX_WRAP_WRAP, FLEX_WRAP_WRAP_REVERSE})
    @Retention(RetentionPolicy.SOURCE)
    public @interface FlexWrap {

    }

    public static final int FLEX_WRAP_NOWRAP = 0;

    public static final int FLEX_WRAP_WRAP = 1;

    public static final int FLEX_WRAP_WRAP_REVERSE = 2;

    /**
     * This attribute controls whether the flex container is single-line or multi-line, and the
     * direction of the cross axis.
     * <ul>
     * <li>{@link #FLEX_WRAP_NOWRAP}: The flex container is single-line.</li>
     * <li>{@link #FLEX_WRAP_WRAP}: The flex container is multi-line.</li>
     * <li>{@link #FLEX_WRAP_WRAP_REVERSE}: The flex container is multi-line. The direction of the
     * cross axis is opposed to the direction as the {@link #FLEX_WRAP_WRAP}</li>
     * </ul>
     * The default value is {@link #FLEX_WRAP_NOWRAP}.
     */
    private int mFlexWrap = FLEX_WRAP_NOWRAP;


    @IntDef({JUSTIFY_CONTENT_FLEX_START, JUSTIFY_CONTENT_FLEX_END, JUSTIFY_CONTENT_CENTER,
            JUSTIFY_CONTENT_SPACE_BETWEEN, JUSTIFY_CONTENT_SPACE_AROUND})
    @Retention(RetentionPolicy.SOURCE)
    public @interface JustifyContent {

    }

    public static final int JUSTIFY_CONTENT_FLEX_START = 0;

    public static final int JUSTIFY_CONTENT_FLEX_END = 1;

    public static final int JUSTIFY_CONTENT_CENTER = 2;

    public static final int JUSTIFY_CONTENT_SPACE_BETWEEN = 3;

    public static final int JUSTIFY_CONTENT_SPACE_AROUND = 4;

    /**
     * This attribute controls the alignment along the main axis.
     * The default value is {@link #JUSTIFY_CONTENT_FLEX_START}.
     */
    private int mJustifyContent = JUSTIFY_CONTENT_FLEX_START;


    @IntDef({ALIGN_ITEMS_FLEX_START, ALIGN_ITEMS_FLEX_END, ALIGN_ITEMS_CENTER,
            ALIGN_ITEMS_BASELINE, ALIGN_ITEMS_STRETCH})
    @Retention(RetentionPolicy.SOURCE)
    public @interface AlignItems {

    }

    public static final int ALIGN_ITEMS_FLEX_START = 0;

    public static final int ALIGN_ITEMS_FLEX_END = 1;

    public static final int ALIGN_ITEMS_CENTER = 2;

    public static final int ALIGN_ITEMS_BASELINE = 3;

    public static final int ALIGN_ITEMS_STRETCH = 4;

    /**
     * This attribute controls the alignment along the cross axis.
     * The default value is {@link #ALIGN_ITEMS_STRETCH}.
     */
    private int mAlignItems = ALIGN_ITEMS_STRETCH;


    @IntDef({ALIGN_CONTENT_FLEX_START, ALIGN_CONTENT_FLEX_END, ALIGN_CONTENT_CENTER,
            ALIGN_CONTENT_SPACE_BETWEEN, ALIGN_CONTENT_SPACE_AROUND, ALIGN_CONTENT_STRETCH})
    @Retention(RetentionPolicy.SOURCE)
    public @interface AlignContent {

    }

    public static final int ALIGN_CONTENT_FLEX_START = 0;

    public static final int ALIGN_CONTENT_FLEX_END = 1;

    public static final int ALIGN_CONTENT_CENTER = 2;

    public static final int ALIGN_CONTENT_SPACE_BETWEEN = 3;

    public static final int ALIGN_CONTENT_SPACE_AROUND = 4;

    public static final int ALIGN_CONTENT_STRETCH = 5;

    /**
     * This attribute controls the alignment of the flex lines in the flex container.
     * The default value is {@link #ALIGN_CONTENT_STRETCH}.
     */
    private int mAlignContent = ALIGN_CONTENT_STRETCH;

    /**
     * The int definition to be used as the arguments for the {@link #setShowDivider(int)},
     * {@link #setShowDividerHorizontal(int)} or {@link #setShowDividerVertical(int)}.
     * One or more of the values (such as
     * {@link #SHOW_DIVIDER_BEGINNING} | {@link #SHOW_DIVIDER_MIDDLE}) can be passed to those set
     * methods.
     */
    @IntDef(flag = true,
            value = {
                    SHOW_DIVIDER_NONE,
                    SHOW_DIVIDER_BEGINNING,
                    SHOW_DIVIDER_MIDDLE,
                    SHOW_DIVIDER_END
            })
    @Retention(RetentionPolicy.SOURCE)
    public @interface DividerMode {

    }

    /** Constant to how no dividers */
    public static final int SHOW_DIVIDER_NONE = 0;

    /** Constant to show a divider at the beginning of the flex lines (or flex items). */
    public static final int SHOW_DIVIDER_BEGINNING = 1;

    /** Constant to show dividers between flex lines or flex items. */
    public static final int SHOW_DIVIDER_MIDDLE = 1 << 1;

    /** Constant to show a divider at the end of the flex lines or flex items. */
    public static final int SHOW_DIVIDER_END = 1 << 2;

    /** The drawable to be drawn for the horizontal dividers. */
    private Drawable mDividerDrawableHorizontal;

    /** The drawable to be drawn for the vertical dividers. */
    private Drawable mDividerDrawableVertical;

    /**
     * Indicates the divider mode for the {@link #mDividerDrawableHorizontal}. The value needs to
     * be the combination of the value of {@link #SHOW_DIVIDER_NONE},
     * {@link #SHOW_DIVIDER_BEGINNING}, {@link #SHOW_DIVIDER_MIDDLE} and {@link #SHOW_DIVIDER_END}
     */
    private int mShowDividerHorizontal;

    /**
     * Indicates the divider mode for the {@link #mDividerDrawableVertical}. The value needs to
     * be the combination of the value of {@link #SHOW_DIVIDER_NONE},
     * {@link #SHOW_DIVIDER_BEGINNING}, {@link #SHOW_DIVIDER_MIDDLE} and {@link #SHOW_DIVIDER_END}
     */
    private int mShowDividerVertical;

    /** The height of the {@link #mDividerDrawableHorizontal}. */
    private int mDividerHorizontalHeight;

    /** The width of the {@link #mDividerDrawableVertical}. */
    private int mDividerVerticalWidth;

    /**
     * Holds reordered indices, which {@link LayoutParams#order} parameters are taken into account
     */
    private int[] mReorderedIndices;

    /**
     * Caches the {@link LayoutParams#order} attributes for children views.
     * Key: the index of the view ({@link #mReorderedIndices} isn't taken into account)
     * Value: the value for the order attribute
     */
    private SparseIntArray mOrderCache;

    private List<FlexLine> mFlexLines = new ArrayList<>();

    /**
     * Holds the 'frozen' state of children during measure. If a view is frozen it will no longer
     * expand or shrink regardless of flexGrow/flexShrink. Items are indexed by the child's
     * reordered index.
     */
    private boolean[] mChildrenFrozen;

    public FlexboxLayout(Context context) {
        this(context, null);
    }

    public FlexboxLayout(Context context, AttributeSet attrs) {
        this(context, attrs, 0);
    }

    public FlexboxLayout(Context context, AttributeSet attrs, int defStyleAttr) {
        super(context, attrs, defStyleAttr);

        // NOTE: We do not support android xml.
        // TypedArray a = context.obtainStyledAttributes(
        //         attrs, R.styleable.FlexboxLayout, defStyleAttr, 0);
        // mFlexDirection = a.getInt(R.styleable.FlexboxLayout_flexDirection, FLEX_DIRECTION_ROW);
        // mFlexWrap = a.getInt(R.styleable.FlexboxLayout_flexWrap, FLEX_WRAP_NOWRAP);
        // mJustifyContent = a
        //         .getInt(R.styleable.FlexboxLayout_justifyContent, JUSTIFY_CONTENT_FLEX_START);
        // mAlignItems = a.getInt(R.styleable.FlexboxLayout_alignItems, ALIGN_ITEMS_STRETCH);
        // mAlignContent = a.getInt(R.styleable.FlexboxLayout_alignContent, ALIGN_CONTENT_STRETCH);
        // Drawable drawable = a.getDrawable(R.styleable.FlexboxLayout_dividerDrawable);
        // if (drawable != null) {
        //     setDividerDrawableHorizontal(drawable);
        //     setDividerDrawableVertical(drawable);
        // }
        // Drawable drawableHorizontal = a
        //         .getDrawable(R.styleable.FlexboxLayout_dividerDrawableHorizontal);
        // if (drawableHorizontal != null) {
        //     setDividerDrawableHorizontal(drawableHorizontal);
        // }
        // Drawable drawableVertical = a
        //         .getDrawable(R.styleable.FlexboxLayout_dividerDrawableVertical);
        // if (drawableVertical != null) {
        //     setDividerDrawableVertical(drawableVertical);
        // }
        // int dividerMode = a.getInt(R.styleable.FlexboxLayout_showDivider, SHOW_DIVIDER_NONE);
        // if (dividerMode != SHOW_DIVIDER_NONE) {
        //     mShowDividerVertical = dividerMode;
        //     mShowDividerHorizontal = dividerMode;
        // }
        // int dividerModeVertical = a
        //         .getInt(R.styleable.FlexboxLayout_showDividerVertical, SHOW_DIVIDER_NONE);
        // if (dividerModeVertical != SHOW_DIVIDER_NONE) {
        //     mShowDividerVertical = dividerModeVertical;
        // }
        // int dividerModeHorizontal = a
        //         .getInt(R.styleable.FlexboxLayout_showDividerHorizontal, SHOW_DIVIDER_NONE);
        // if (dividerModeHorizontal != SHOW_DIVIDER_NONE) {
        //     mShowDividerHorizontal = dividerModeHorizontal;
        // }
        // a.recycle();
    }

    @Override
    protected void onMeasure(int widthMeasureSpec, int heightMeasureSpec) {
        CommonLayoutParams.adjustChildrenLayoutParams(this, widthMeasureSpec, heightMeasureSpec);

        super.onMeasure(widthMeasureSpec, heightMeasureSpec);
        if (isOrderChangedFromLastMeasurement()) {
            mReorderedIndices = createReorderedIndices();
        }
        if (mChildrenFrozen == null || mChildrenFrozen.length < getChildCount()) {
            mChildrenFrozen = new boolean[getChildCount()];
        }

        // TODO: Only calculate the children views which are affected from the last measure.

        switch (mFlexDirection) {
            case FLEX_DIRECTION_ROW: // Intentional fall through
            case FLEX_DIRECTION_ROW_REVERSE:
                measureHorizontal(widthMeasureSpec, heightMeasureSpec);
                break;
            case FLEX_DIRECTION_COLUMN: // Intentional fall through
            case FLEX_DIRECTION_COLUMN_REVERSE:
                measureVertical(widthMeasureSpec, heightMeasureSpec);
                break;
            default:
                throw new IllegalStateException(
                        "Invalid value for the flex direction is set: " + mFlexDirection);
        }

        Arrays.fill(mChildrenFrozen, false);
    }

    /**
     * Returns a View, which is reordered by taking {@link LayoutParams#order} parameters
     * into account.
     *
     * @param index the index of the view
     * @return the reordered view, which {@link LayoutParams@order} is taken into account.
     * If the index is negative or out of bounds of the number of contained views,
     * returns {@code null}.
     */
    public View getReorderedChildAt(int index) {
        if (index < 0 || index >= mReorderedIndices.length) {
            return null;
        }
        return getChildAt(mReorderedIndices[index]);
    }

    @Override
    public void addView(View child, int index, ViewGroup.LayoutParams params) {
        // Create an array for the reordered indices before the View is added in the parent
        // ViewGroup since otherwise reordered indices won't be in effect before the
        // FlexboxLayout's onMeasure is called.
        // Because requestLayout is requested in the super.addView method.
        mReorderedIndices = createReorderedIndices(child, index, params);
        super.addView(child, index, params);
    }

    /**
     * Create an array, which indicates the reordered indices that {@link LayoutParams#order}
     * attributes are taken into account. This method takes a View before that is added as the
     * parent ViewGroup's children.
     *
     * @param viewBeforeAdded          the View instance before added to the array of children
     *                                 Views of the parent ViewGroup
     * @param indexForViewBeforeAdded  the index for the View before added to the array of the
     *                                 parent ViewGroup
     * @param paramsForViewBeforeAdded the layout parameters for the View before added to the array
     *                                 of the parent ViewGroup
     * @return an array which have the reordered indices
     */
    private int[] createReorderedIndices(View viewBeforeAdded, int indexForViewBeforeAdded,
            ViewGroup.LayoutParams paramsForViewBeforeAdded) {
        int childCount = getChildCount();
        List<Order> orders = createOrders(childCount);
        Order orderForViewToBeAdded = new Order();
        if (viewBeforeAdded != null
                && paramsForViewBeforeAdded instanceof FlexboxLayout.LayoutParams) {
            orderForViewToBeAdded.order = ((LayoutParams) paramsForViewBeforeAdded).order;
        } else {
            orderForViewToBeAdded.order = LayoutParams.ORDER_DEFAULT;
        }

        if (indexForViewBeforeAdded == -1 || indexForViewBeforeAdded == childCount) {
            orderForViewToBeAdded.index = childCount;
        } else if (indexForViewBeforeAdded < getChildCount()) {
            orderForViewToBeAdded.index = indexForViewBeforeAdded;
            for (int i = indexForViewBeforeAdded; i < childCount; i++) {
                orders.get(i).index++;
            }
        } else {
            // This path is not expected since OutOfBoundException will be thrown in the ViewGroup
            // But setting the index for fail-safe
            orderForViewToBeAdded.index = childCount;
        }
        orders.add(orderForViewToBeAdded);

        return sortOrdersIntoReorderedIndices(childCount + 1, orders);
    }

    /**
     * Create an array, which indicates the reordered indices that {@link LayoutParams#order}
     * attributes are taken into account.
     *
     * @return @return an array which have the reordered indices
     */
    private int[] createReorderedIndices() {
        int childCount = getChildCount();
        List<Order> orders = createOrders(childCount);
        return sortOrdersIntoReorderedIndices(childCount, orders);
    }

    private int[] sortOrdersIntoReorderedIndices(int childCount, List<Order> orders) {
        Collections.sort(orders);
        if (mOrderCache == null) {
            mOrderCache = new SparseIntArray(childCount);
        }
        mOrderCache.clear();
        int[] reorderedIndices = new int[childCount];
        int i = 0;
        for (Order order : orders) {
            reorderedIndices[i] = order.index;
            mOrderCache.append(i, order.order);
            i++;
        }
        return reorderedIndices;
    }

    @NonNull
    private List<Order> createOrders(int childCount) {
        List<Order> orders = new ArrayList<>();
        for (int i = 0; i < childCount; i++) {
            View child = getChildAt(i);
            LayoutParams params = (LayoutParams) child.getLayoutParams();
            Order order = new Order();
            order.order = params.order;
            order.index = i;
            orders.add(order);
        }
        return orders;
    }

    /**
     * Returns if any of the children's {@link LayoutParams#order} attributes are changed
     * from the last measurement.
     *
     * @return {@code true} if changed from the last measurement, {@code false} otherwise.
     */
    private boolean isOrderChangedFromLastMeasurement() {
        int childCount = getChildCount();
        if (mOrderCache == null) {
            mOrderCache = new SparseIntArray(childCount);
        }
        if (mOrderCache.size() != childCount) {
            return true;
        }
        for (int i = 0; i < childCount; i++) {
            View view = getChildAt(i);
            if (view == null) {
                continue;
            }
            LayoutParams lp = (LayoutParams) view.getLayoutParams();
            if (lp.order != mOrderCache.get(i)) {
                return true;
            }
        }
        return false;
    }

    /**
    * Invalidates the cache of the orders so that they are recalculated. 
    */
    public void invalidateOrdersCache() {
        if (this.mOrderCache != null) {
            this.mOrderCache.clear();
        }
    }

    /**
     * Sub method for {@link #onMeasure(int, int)}, when the main axis direction is horizontal
     * (either left to right or right to left).
     *
     * @param widthMeasureSpec  horizontal space requirements as imposed by the parent
     * @param heightMeasureSpec vertical space requirements as imposed by the parent
     * @see #onMeasure(int, int)
     * @see #setFlexDirection(int)
     * @see #setFlexWrap(int)
     * @see #setAlignItems(int)
     * @see #setAlignContent(int)
     */
    private void measureHorizontal(int widthMeasureSpec, int heightMeasureSpec) {
        int widthMode = MeasureSpec.getMode(widthMeasureSpec);
        int widthSize = MeasureSpec.getSize(widthMeasureSpec);
        int childState = 0;

        mFlexLines.clear();

        // Determine how many flex lines are needed in this layout by measuring each child.
        // (Expand or shrink the view depending on the flexGrow and flexShrink attributes in a later
        // loop)
        {
            int childCount = getChildCount();
            int paddingStart = ViewCompat.getPaddingStart(this);
            int paddingEnd = ViewCompat.getPaddingEnd(this);
            int largestHeightInRow = Integer.MIN_VALUE;
            FlexLine flexLine = new FlexLine();

            // The index of the view in a same flex line.
            int indexInFlexLine = 0;
            flexLine.mMainSize = paddingStart + paddingEnd;
            for (int i = 0; i < childCount; i++) {
                View child = getReorderedChildAt(i);
                if (child == null) {
                    addFlexLineIfLastFlexItem(i, childCount, flexLine);
                    continue;
                } else if (child.getVisibility() == View.GONE) {
                    flexLine.mItemCount++;
                    addFlexLineIfLastFlexItem(i, childCount, flexLine);
                    continue;
                }

                FlexboxLayout.LayoutParams lp = (LayoutParams) child.getLayoutParams();
                if (lp.alignSelf == LayoutParams.ALIGN_SELF_STRETCH) {
                    flexLine.mIndicesAlignSelfStretch.add(i);
                }

                int childWidth = lp.width;
                if (lp.flexBasisPercent != LayoutParams.FLEX_BASIS_PERCENT_DEFAULT
                        && widthMode == MeasureSpec.EXACTLY) {
                    childWidth = Math.round(widthSize * lp.flexBasisPercent);
                    // Use the dimension from the layout_width attribute if the widthMode is not
                    // MeasureSpec.EXACTLY even if any fraction value is set to
                    // layout_flexBasisPercent.
                    // There are likely quite few use cases where assigning any fraction values
                    // with widthMode is not MeasureSpec.EXACTLY (e.g. FlexboxLayout's layout_width
                    // is set to wrap_content)
                }
                int childWidthMeasureSpec = getChildMeasureSpec(widthMeasureSpec,
                        getPaddingLeft() + getPaddingRight() + lp.leftMargin
                                + lp.rightMargin, childWidth < 0 ? LayoutParams.WRAP_CONTENT : childWidth);
                int childHeightMeasureSpec = getChildMeasureSpec(heightMeasureSpec,
                        getPaddingTop() + getPaddingBottom() + lp.topMargin
                                + lp.bottomMargin, lp.height < 0 ? LayoutParams.WRAP_CONTENT : lp.height);

                child.measure(childWidthMeasureSpec, childHeightMeasureSpec);

                // Check the size constraint after the first measurement for the child
                // To prevent the child's width/height violate the size constraints imposed by the
                // {@link LayoutParams#minWidth}, {@link LayoutParams#minHeight},
                // {@link LayoutParams#maxWidth} and {@link LayoutParams#maxHeight} attributes.
                // E.g. When the child's layout_width is wrap_content the measured width may be
                // less than the min width after the first measurement.
                checkSizeConstraints(child);

                childState = ViewCompat
                        .combineMeasuredStates(childState, ViewCompat.getMeasuredState(child));
                largestHeightInRow = Math.max(largestHeightInRow,
                        child.getMeasuredHeight() + lp.topMargin + lp.bottomMargin);

                if (isWrapRequired(widthMode, widthSize, flexLine.mMainSize,
                        child.getMeasuredWidth() + lp.leftMargin + lp.rightMargin, lp,
                        i, indexInFlexLine)) {
                    if (flexLine.mItemCount > 0) {
                        addFlexLine(flexLine);
                    }

                    flexLine = new FlexLine();
                    flexLine.mItemCount = 1;
                    flexLine.mMainSize = paddingStart + paddingEnd;
                    largestHeightInRow = child.getMeasuredHeight() + lp.topMargin + lp.bottomMargin;
                    indexInFlexLine = 0;
                } else {
                    flexLine.mItemCount++;
                    indexInFlexLine++;
                }
                flexLine.mMainSize += child.getMeasuredWidth() + lp.leftMargin + lp.rightMargin;
                flexLine.mTotalFlexGrow += lp.flexGrow;
                flexLine.mTotalFlexShrink += lp.flexShrink;
                // Temporarily set the cross axis length as the largest child in the row
                // Expand along the cross axis depending on the mAlignContent property if needed
                // later
                flexLine.mCrossSize = Math.max(flexLine.mCrossSize, largestHeightInRow);

                // Check if the beginning or middle divider is required for the flex item
                if (hasDividerBeforeChildAtAlongMainAxis(i, indexInFlexLine)) {
                    flexLine.mMainSize += mDividerVerticalWidth;
                    flexLine.mDividerLengthInMainSize += mDividerVerticalWidth;
                }

                if (mFlexWrap != FLEX_WRAP_WRAP_REVERSE) {
                    flexLine.mMaxBaseline = Math
                            .max(flexLine.mMaxBaseline, child.getBaseline() + lp.topMargin);
                } else {
                    // if the flex wrap property is FLEX_WRAP_WRAP_REVERSE, calculate the
                    // baseline as the distance from the cross end and the baseline
                    // since the cross size calculation is based on the distance from the cross end
                    flexLine.mMaxBaseline = Math
                            .max(flexLine.mMaxBaseline,
                                    child.getMeasuredHeight() - child.getBaseline()
                                            + lp.bottomMargin);
                }
                addFlexLineIfLastFlexItem(i, childCount, flexLine);
            }
        }

        determineMainSize(mFlexDirection, widthMeasureSpec, heightMeasureSpec);

        // TODO: Consider the case any individual child's alignSelf is set to ALIGN_SELF_BASELINE
        if (mAlignItems == ALIGN_ITEMS_BASELINE) {
            int viewIndex = 0;
            for (FlexLine flexLine : mFlexLines) {
                // The largest height value that also take the baseline shift into account
                int largestHeightInLine = Integer.MIN_VALUE;
                for (int i = viewIndex; i < viewIndex + flexLine.mItemCount; i++) {
                    View child = getReorderedChildAt(i);
                    LayoutParams lp = (LayoutParams) child.getLayoutParams();
                    if (mFlexWrap != FLEX_WRAP_WRAP_REVERSE) {
                        int marginTop = flexLine.mMaxBaseline - child.getBaseline();
                        marginTop = Math.max(marginTop, lp.topMargin);
                        largestHeightInLine = Math.max(largestHeightInLine,
                                child.getHeight() + marginTop + lp.bottomMargin);
                    } else {
                        int marginBottom = flexLine.mMaxBaseline - child.getMeasuredHeight() +
                                child.getBaseline();
                        marginBottom = Math.max(marginBottom, lp.bottomMargin);
                        largestHeightInLine = Math.max(largestHeightInLine,
                                child.getHeight() + lp.topMargin + marginBottom);
                    }
                }
                flexLine.mCrossSize = largestHeightInLine;
                viewIndex += flexLine.mItemCount;
            }
        }

        determineCrossSize(mFlexDirection, widthMeasureSpec, heightMeasureSpec,
                getPaddingTop() + getPaddingBottom());
        // Now cross size for each flex line is determined.
        // Expand the views if alignItems (or alignSelf in each child view) is set to stretch
        stretchViews(mFlexDirection, mAlignItems);
        setMeasuredDimensionForFlex(mFlexDirection, widthMeasureSpec, heightMeasureSpec,
                childState);
    }

    /**
     * Sub method for {@link #onMeasure(int, int)} when the main axis direction is vertical
     * (either from top to bottom or bottom to top).
     *
     * @param widthMeasureSpec  horizontal space requirements as imposed by the parent
     * @param heightMeasureSpec vertical space requirements as imposed by the parent
     * @see #onMeasure(int, int)
     * @see #setFlexDirection(int)
     * @see #setFlexWrap(int)
     * @see #setAlignItems(int)
     * @see #setAlignContent(int)
     */
    private void measureVertical(int widthMeasureSpec, int heightMeasureSpec) {
        int heightMode = MeasureSpec.getMode(heightMeasureSpec);
        int heightSize = MeasureSpec.getSize(heightMeasureSpec);
        int childState = 0;

        mFlexLines.clear();

        // Determine how many flex lines are needed in this layout by measuring each child.
        // (Expand or shrink the view depending on the flexGrow and flexShrink attributes in a later
        // loop)
        int childCount = getChildCount();
        int paddingTop = getPaddingTop();
        int paddingBottom = getPaddingBottom();
        int largestWidthInColumn = Integer.MIN_VALUE;
        FlexLine flexLine = new FlexLine();
        flexLine.mMainSize = paddingTop + paddingBottom;
        // The index of the view in a same flex line.
        int indexInFlexLine = 0;
        for (int i = 0; i < childCount; i++) {
            View child = getReorderedChildAt(i);
            if (child == null) {
                addFlexLineIfLastFlexItem(i, childCount, flexLine);
                continue;
            } else if (child.getVisibility() == View.GONE) {
                flexLine.mItemCount++;
                addFlexLineIfLastFlexItem(i, childCount, flexLine);
                continue;
            }

            FlexboxLayout.LayoutParams lp = (LayoutParams) child.getLayoutParams();
            if (lp.alignSelf == LayoutParams.ALIGN_SELF_STRETCH) {
                flexLine.mIndicesAlignSelfStretch.add(i);
            }

            int childHeight = lp.height;
            if (lp.flexBasisPercent != LayoutParams.FLEX_BASIS_PERCENT_DEFAULT
                    && heightMode == MeasureSpec.EXACTLY) {
                childHeight = Math.round(heightSize * lp.flexBasisPercent);
                // Use the dimension from the layout_height attribute if the heightMode is not
                // MeasureSpec.EXACTLY even if any fraction value is set to layout_flexBasisPercent.
                // There are likely quite few use cases where assigning any fraction values
                // with heightMode is not MeasureSpec.EXACTLY (e.g. FlexboxLayout's layout_height
                // is set to wrap_content)
            }

            int childWidthMeasureSpec = getChildMeasureSpec(widthMeasureSpec,
                    getPaddingLeft() + getPaddingRight() + lp.leftMargin
                            + lp.rightMargin, lp.width < 0 ? LayoutParams.WRAP_CONTENT : lp.width);
            int childHeightMeasureSpec = getChildMeasureSpec(heightMeasureSpec,
                    getPaddingTop() + getPaddingBottom() + lp.topMargin
                            + lp.bottomMargin, childHeight < 0 ? LayoutParams.WRAP_CONTENT : childHeight);

            child.measure(childWidthMeasureSpec, childHeightMeasureSpec);

            // Check the size constraint after the first measurement for the child
            // To prevent the child's width/height violate the size constraints imposed by the
            // {@link LayoutParams#minWidth}, {@link LayoutParams#minHeight},
            // {@link LayoutParams#maxWidth} and {@link LayoutParams#maxHeight} attributes.
            // E.g. When the child's layout_height is wrap_content the measured height may be
            // less than the min height after the first measurement.
            checkSizeConstraints(child);

            childState = ViewCompat
                    .combineMeasuredStates(childState, ViewCompat.getMeasuredState(child));
            largestWidthInColumn = Math.max(largestWidthInColumn,
                    child.getMeasuredWidth() + lp.leftMargin + lp.rightMargin);

            if (isWrapRequired(heightMode, heightSize, flexLine.mMainSize,
                    child.getMeasuredHeight() + lp.topMargin + lp.bottomMargin, lp,
                    i, indexInFlexLine)) {
                if (flexLine.mItemCount > 0) {
                    addFlexLine(flexLine);
                }

                flexLine = new FlexLine();
                flexLine.mItemCount = 1;
                flexLine.mMainSize = paddingTop + paddingBottom;
                largestWidthInColumn = child.getMeasuredWidth() + lp.leftMargin + lp.rightMargin;
                indexInFlexLine = 0;
            } else {
                flexLine.mItemCount++;
                indexInFlexLine++;
            }
            flexLine.mMainSize += child.getMeasuredHeight() + lp.topMargin + lp.bottomMargin;
            flexLine.mTotalFlexGrow += lp.flexGrow;
            flexLine.mTotalFlexShrink += lp.flexShrink;
            // Temporarily set the cross axis length as the largest child width in the column
            // Expand along the cross axis depending on the mAlignContent property if needed
            // later
            flexLine.mCrossSize = Math.max(flexLine.mCrossSize, largestWidthInColumn);

            if (hasDividerBeforeChildAtAlongMainAxis(i, indexInFlexLine)) {
                flexLine.mMainSize += mDividerHorizontalHeight;
            }
            addFlexLineIfLastFlexItem(i, childCount, flexLine);
        }

        determineMainSize(mFlexDirection, widthMeasureSpec, heightMeasureSpec);
        determineCrossSize(mFlexDirection, widthMeasureSpec, heightMeasureSpec,
                getPaddingLeft() + getPaddingRight());
        // Now cross size for each flex line is determined.
        // Expand the views if alignItems (or alignSelf in each child view) is set to stretch
        stretchViews(mFlexDirection, mAlignItems);
        setMeasuredDimensionForFlex(mFlexDirection, widthMeasureSpec, heightMeasureSpec,
                childState);
    }

    /**
     * Checks if the view's width/height don't violate the minimum/maximum size constraints imposed
     * by the {@link LayoutParams#minWidth}, {@link LayoutParams#minHeight},
     * {@link LayoutParams#maxWidth} and {@link LayoutParams#maxHeight} attributes.
     *
     * @param view the view to be checked
     */
    private void checkSizeConstraints(View view) {
        boolean needsMeasure = false;
        LayoutParams lp = (LayoutParams) view.getLayoutParams();
        int childWidth = view.getMeasuredWidth();
        int childHeight = view.getMeasuredHeight();

        if (view.getMeasuredWidth() < lp.minWidth) {
            needsMeasure = true;
            childWidth = lp.minWidth;
        } else if (view.getMeasuredWidth() > lp.maxWidth) {
            needsMeasure = true;
            childWidth = lp.maxWidth;
        }

        if (childHeight < lp.minHeight) {
            needsMeasure = true;
            childHeight = lp.minHeight;
        } else if (childHeight > lp.maxHeight) {
            needsMeasure = true;
            childHeight = lp.maxHeight;
        }
        if (needsMeasure) {
            view.measure(MeasureSpec.makeMeasureSpec(childWidth, MeasureSpec.EXACTLY),
                    MeasureSpec.makeMeasureSpec(childHeight, MeasureSpec.EXACTLY));
        }
    }

    private void addFlexLineIfLastFlexItem(int childIndex, int childCount, FlexLine flexLine) {
        if (childIndex == childCount - 1 && flexLine.mItemCount != 0) {
            // Add the flex line if this item is the last item
            addFlexLine(flexLine);
        }
    }

    private void addFlexLine(FlexLine flexLine) {
        // The size of the end divider isn't added until the flexLine is added to the flex container
        // take the divider width (or height) into account when adding the flex line.
        if (isMainAxisDirectionHorizontal(mFlexDirection)) {
            if ((mShowDividerVertical & SHOW_DIVIDER_END) > 0) {
                flexLine.mMainSize += mDividerVerticalWidth;
                flexLine.mDividerLengthInMainSize += mDividerVerticalWidth;
            }
        } else {
            if ((mShowDividerHorizontal & SHOW_DIVIDER_END) > 0) {
                flexLine.mMainSize += mDividerHorizontalHeight;
                flexLine.mDividerLengthInMainSize += mDividerHorizontalHeight;
            }
        }
        mFlexLines.add(flexLine);
    }

    /**
     * Determine the main size by expanding (shrinking if negative remaining free space is given)
     * an individual child in each flex line if any children's flexGrow (or flexShrink if remaining
     * space is negative) properties are set to non-zero.
     *
     * @param flexDirection     the value of the flex direction
     * @param widthMeasureSpec  horizontal space requirements as imposed by the parent
     * @param heightMeasureSpec vertical space requirements as imposed by the parent
     * @see #setFlexDirection(int)
     * @see #getFlexDirection()
     */
    private void determineMainSize(@FlexDirection int flexDirection, int widthMeasureSpec,
            int heightMeasureSpec) {
        int mainSize;
        int paddingAlongMainAxis;
        switch (flexDirection) {
            case FLEX_DIRECTION_ROW: // Intentional fall through
            case FLEX_DIRECTION_ROW_REVERSE:
                int widthMode = MeasureSpec.getMode(widthMeasureSpec);
                int widthSize = MeasureSpec.getSize(widthMeasureSpec);
                if (widthMode == MeasureSpec.EXACTLY) {
                    mainSize = widthSize;
                } else {
                    mainSize = getLargestMainSize();
                }
                paddingAlongMainAxis = getPaddingLeft() + getPaddingRight();
                break;
            case FLEX_DIRECTION_COLUMN: // Intentional fall through
            case FLEX_DIRECTION_COLUMN_REVERSE:
                int heightMode = MeasureSpec.getMode(heightMeasureSpec);
                int heightSize = MeasureSpec.getSize(heightMeasureSpec);
                if (heightMode == MeasureSpec.EXACTLY) {
                    mainSize = heightSize;
                } else {
                    mainSize = getLargestMainSize();
                }
                paddingAlongMainAxis = getPaddingTop() + getPaddingBottom();
                break;
            default:
                throw new IllegalArgumentException("Invalid flex direction: " + flexDirection);
        }

        int childIndex = 0;
        for (FlexLine flexLine : mFlexLines) {
            if (flexLine.mMainSize < mainSize) {
                childIndex = expandFlexItems(flexLine, flexDirection, mainSize,
                        paddingAlongMainAxis, childIndex);
            } else {
                childIndex = shrinkFlexItems(flexLine, flexDirection, mainSize,
                        paddingAlongMainAxis, childIndex);
            }
        }
    }

    /**
     * Expand the flex items along the main axis based on the individual flexGrow attribute.
     *
     * @param flexLine             the flex line to which flex items belong
     * @param flexDirection        the flexDirection value for this FlexboxLayout
     * @param maxMainSize          the maximum main size. Expanded main size will be this size
     * @param paddingAlongMainAxis the padding value along the main axis
     * @param startIndex           the start index of the children views to be expanded. This index
     *                             needs to
     *                             be an absolute index in the flex container (FlexboxLayout),
     *                             not the relative index in the flex line.
     * @return the next index, the next flex line's first flex item starts from the returned index
     * @see #getFlexDirection()
     * @see #setFlexDirection(int)
     * @see LayoutParams#flexGrow
     */
    private int expandFlexItems(FlexLine flexLine, @FlexDirection int flexDirection,
            int maxMainSize, int paddingAlongMainAxis, int startIndex) {
        int childIndex = startIndex;
        if (flexLine.mTotalFlexGrow <= 0 || maxMainSize < flexLine.mMainSize) {
            childIndex += flexLine.mItemCount;
            return childIndex;
        }
        int sizeBeforeExpand = flexLine.mMainSize;
        boolean needsReexpand = false;
        float unitSpace = (maxMainSize - flexLine.mMainSize) / flexLine.mTotalFlexGrow;
        flexLine.mMainSize = paddingAlongMainAxis + flexLine.mDividerLengthInMainSize;
        float accumulatedRoundError = 0;
        for (int i = 0; i < flexLine.mItemCount; i++) {
            View child = getReorderedChildAt(childIndex);
            if (child == null) {
                continue;
            } else if (child.getVisibility() == View.GONE) {
                childIndex++;
                continue;
            }
            LayoutParams lp = (LayoutParams) child.getLayoutParams();
            if (isMainAxisDirectionHorizontal(flexDirection)) {
                // The direction of the main axis is horizontal
                if (!mChildrenFrozen[childIndex]) {
                    float rawCalculatedWidth = child.getMeasuredWidth() + unitSpace * lp.flexGrow + accumulatedRoundError;
                    int roundedCalculatedWidth = Math.round(rawCalculatedWidth);
                    if (roundedCalculatedWidth > lp.maxWidth) {
                        // This means the child can't expand beyond the value of the maxWidth attribute.
                        // To adjust the flex line length to the size of maxMainSize, remaining
                        // positive free space needs to be re-distributed to other flex items
                        // (children views). In that case, invoke this method again with the same
                        // startIndex.
                        needsReexpand = true;
                        roundedCalculatedWidth = lp.maxWidth;
                        mChildrenFrozen[childIndex] = true;
                        flexLine.mTotalFlexGrow -= lp.flexGrow;
                    } else {
                        accumulatedRoundError = (rawCalculatedWidth - roundedCalculatedWidth);
                    }
                    child.measure(MeasureSpec.makeMeasureSpec(roundedCalculatedWidth, MeasureSpec.EXACTLY),
                            MeasureSpec
                                    .makeMeasureSpec(child.getMeasuredHeight(),
                                            MeasureSpec.EXACTLY));
                }
                flexLine.mMainSize += child.getMeasuredWidth() + lp.leftMargin + lp.rightMargin;
            } else {
                // The direction of the main axis is vertical
                if (!mChildrenFrozen[childIndex]) {
                    float rawCalculatedHeight = child.getMeasuredHeight() + unitSpace * lp.flexGrow;
                    int roundedCalculatedHeight = Math.round(rawCalculatedHeight);
                    if (roundedCalculatedHeight > lp.maxHeight) {
                        // This means the child can't expand beyond the value of the maxHeight
                        // attribute.
                        // To adjust the flex line length to the size of maxMainSize, remaining
                        // positive free space needs to be re-distributed to other flex items
                        // (children views). In that case, invoke this method again with the same
                        // startIndex.
                        needsReexpand = true;
                        roundedCalculatedHeight = lp.maxHeight;
                        mChildrenFrozen[childIndex] = true;
                        flexLine.mTotalFlexGrow -= lp.flexGrow;
                    } else {
                        accumulatedRoundError = rawCalculatedHeight - roundedCalculatedHeight;
                    }
                    child.measure(MeasureSpec.makeMeasureSpec(child.getMeasuredWidth(),
                            MeasureSpec.EXACTLY),
                            MeasureSpec.makeMeasureSpec(roundedCalculatedHeight, MeasureSpec.EXACTLY));
                }
                flexLine.mMainSize += child.getMeasuredHeight() + lp.topMargin + lp.bottomMargin;
            }
            childIndex++;
        }

        if (needsReexpand && sizeBeforeExpand != flexLine.mMainSize) {
            // Re-invoke the method with the same startIndex to distribute the positive free space
            // that wasn't fully distributed (because of maximum length constraint)
            expandFlexItems(flexLine, flexDirection, maxMainSize, paddingAlongMainAxis, startIndex);
        }
        return childIndex;
    }

    /**
     * Shrink the flex items along the main axis based on the individual flexShrink attribute.
     *
     * @param flexLine             the flex line to which flex items belong
     * @param flexDirection        the flexDirection value for this FlexboxLayout
     * @param maxMainSize          the maximum main size. Shrank main size will be this size
     * @param paddingAlongMainAxis the padding value along the main axis
     * @param startIndex           the start index of the children views to be shrank. This index
     *                             needs to
     *                             be an absolute index in the flex container (FlexboxLayout),
     *                             not the relative index in the flex line.
     * @return the next index, the next flex line's first flex item starts from the returned index
     * @see #getFlexDirection()
     * @see #setFlexDirection(int)
     * @see LayoutParams#flexShrink
     */
    private int shrinkFlexItems(FlexLine flexLine, @FlexDirection int flexDirection,
            int maxMainSize, int paddingAlongMainAxis, int startIndex) {
        int childIndex = startIndex;
        int sizeBeforeShrink = flexLine.mMainSize;
        if (flexLine.mTotalFlexShrink <= 0 || maxMainSize > flexLine.mMainSize) {
            childIndex += flexLine.mItemCount;
            return childIndex;
        }
        boolean needsReshrink = false;
        float unitShrink = (flexLine.mMainSize - maxMainSize) / flexLine.mTotalFlexShrink;
        float accumulatedRoundError = 0;
        flexLine.mMainSize = paddingAlongMainAxis + flexLine.mDividerLengthInMainSize;
        for (int i = 0; i < flexLine.mItemCount; i++) {
            View child = getReorderedChildAt(childIndex);
            if (child == null) {
                continue;
            } else if (child.getVisibility() == View.GONE) {
                childIndex++;
                continue;
            }
            LayoutParams lp = (LayoutParams) child.getLayoutParams();
            if (isMainAxisDirectionHorizontal(flexDirection)) {
                // The direction of main axis is horizontal
                if (!mChildrenFrozen[childIndex]) {
                    float rawCalculatedWidth = child.getMeasuredWidth() - unitShrink * lp.flexShrink + accumulatedRoundError;
                    int roundedCalculatedWidth = Math.round(rawCalculatedWidth);
                    if (roundedCalculatedWidth < lp.minWidth) {
                        needsReshrink = true;
                        roundedCalculatedWidth = lp.minWidth;
                        mChildrenFrozen[childIndex] = true;
                        flexLine.mTotalFlexShrink -= lp.flexShrink;
                    } else {
                        accumulatedRoundError = rawCalculatedWidth - roundedCalculatedWidth;
                    }

                    int childWidthMeasureSpec = MeasureSpec.makeMeasureSpec(roundedCalculatedWidth, MeasureSpec.EXACTLY);

                    // NOTE: for controls that support internal content wrapping (e.g. TextView) reducing the width
                    // might result in increased height e.g. text that could be shown on one line for larger
                    // width needs to be wrapped in two when width is reduced.
                    // As a result we cannot unconditionally measure with EXACTLY the current measured height
                    int childHeightMeasureSpec = getChildMeasureSpec(this.getMeasuredHeightAndState(),
                            getPaddingTop() + getPaddingBottom() + lp.topMargin
                                    + lp.bottomMargin, lp.height < 0 ? LayoutParams.WRAP_CONTENT : lp.height);

                    child.measure(childWidthMeasureSpec, childHeightMeasureSpec);

                    // make sure crossSize is up-to-date as child calculated height might have increased
                    flexLine.mCrossSize = Math.max(
                            flexLine.mCrossSize,
                            child.getMeasuredHeight() + lp.topMargin + lp.bottomMargin
                    );
                }
                flexLine.mMainSize += child.getMeasuredWidth() + lp.leftMargin + lp.rightMargin;
            } else {
                // The direction of main axis is vertical
                if (!mChildrenFrozen[childIndex]) {
                    float rawCalculatedHeight = child.getMeasuredHeight() - unitShrink * lp.flexShrink + accumulatedRoundError;
                    int roundedCalculatedHeight = Math.round(rawCalculatedHeight);
                    if (roundedCalculatedHeight < lp.minHeight) {
                        needsReshrink = true;
                        roundedCalculatedHeight = lp.minHeight;
                        mChildrenFrozen[childIndex] = true;
                        flexLine.mTotalFlexShrink -= lp.flexShrink;
                    } else {
                        accumulatedRoundError = rawCalculatedHeight - roundedCalculatedHeight;
                    }
                    child.measure(MeasureSpec.makeMeasureSpec(child.getMeasuredWidth(),
                            MeasureSpec.EXACTLY),
                            MeasureSpec.makeMeasureSpec(roundedCalculatedHeight, MeasureSpec.EXACTLY));
                }
                flexLine.mMainSize += child.getMeasuredHeight() + lp.topMargin + lp.bottomMargin;
            }
            childIndex++;
        }

        if (needsReshrink && sizeBeforeShrink != flexLine.mMainSize) {
            // Re-invoke the method with the same startIndex to distribute the negative free space
            // that wasn't fully distributed (because some views length were not enough)
            shrinkFlexItems(flexLine, flexDirection, maxMainSize, paddingAlongMainAxis, startIndex);
        }
        return childIndex;
    }

    /**
     * Determines the cross size (Calculate the length along the cross axis).
     * Expand the cross size only if the height mode is MeasureSpec.EXACTLY, otherwise
     * use the sum of cross sizes of all flex lines.
     *
     * @param flexDirection         the flex direction attribute
     * @param widthMeasureSpec      horizontal space requirements as imposed by the parent
     * @param heightMeasureSpec     vertical space requirements as imposed by the parent
     * @param paddingAlongCrossAxis the padding value for the FlexboxLayout along the cross axis
     * @see #getFlexDirection()
     * @see #setFlexDirection(int)
     * @see #getAlignContent()
     * @see #setAlignContent(int)
     */
    private void determineCrossSize(int flexDirection, int widthMeasureSpec,
            int heightMeasureSpec, int paddingAlongCrossAxis) {
        // The MeasureSpec mode along the cross axis
        int mode;
        // The MeasureSpec size along the cross axis
        int size;
        switch (flexDirection) {
            case FLEX_DIRECTION_ROW: // Intentional fall through
            case FLEX_DIRECTION_ROW_REVERSE:
                mode = MeasureSpec.getMode(heightMeasureSpec);
                size = MeasureSpec.getSize(heightMeasureSpec);
                break;
            case FLEX_DIRECTION_COLUMN: // Intentional fall through
            case FLEX_DIRECTION_COLUMN_REVERSE:
                mode = MeasureSpec.getMode(widthMeasureSpec);
                size = MeasureSpec.getSize(widthMeasureSpec);
                break;
            default:
                throw new IllegalArgumentException("Invalid flex direction: " + flexDirection);
        }
        if (mode == MeasureSpec.EXACTLY) {
            int totalCrossSize = getSumOfCrossSize() + paddingAlongCrossAxis;
            if (mFlexLines.size() == 1) {
                mFlexLines.get(0).mCrossSize = size - paddingAlongCrossAxis;
                // alignContent property is valid only if the Flexbox has at least two lines
            } else if (mFlexLines.size() >= 2 && totalCrossSize < size) {
                switch (mAlignContent) {
                    case ALIGN_CONTENT_STRETCH: {
                        float freeSpaceUnit = (size - totalCrossSize) / (float) mFlexLines.size();
                        float accumulatedError = 0;
                        for (int i = 0, flexLinesSize = mFlexLines.size(); i < flexLinesSize; i++) {
                            FlexLine flexLine = mFlexLines.get(i);
                            float newCrossSizeAsFloat = flexLine.mCrossSize + freeSpaceUnit;
                            if (i == mFlexLines.size() - 1) {
                                newCrossSizeAsFloat += accumulatedError;
                                accumulatedError = 0;
                            }
                            int newCrossSize = Math.round(newCrossSizeAsFloat);
                            accumulatedError += (newCrossSizeAsFloat - newCrossSize);
                            if (accumulatedError > 1) {
                                newCrossSize += 1;
                                accumulatedError -= 1;
                            } else if (accumulatedError < -1) {
                                newCrossSize -= 1;
                                accumulatedError += 1;
                            }
                            flexLine.mCrossSize = newCrossSize;
                        }
                        break;
                    }
                    case ALIGN_CONTENT_SPACE_AROUND: {
                        // The value of free space along the cross axis which needs to be put on top
                        // and below the bottom of each flex line.
                        int spaceTopAndBottom = size - totalCrossSize;
                        // The number of spaces along the cross axis
                        int numberOfSpaces = mFlexLines.size() * 2;
                        spaceTopAndBottom = spaceTopAndBottom / numberOfSpaces;
                        List<FlexLine> newFlexLines = new ArrayList<>();
                        FlexLine dummySpaceFlexLine = new FlexLine();
                        dummySpaceFlexLine.mCrossSize = spaceTopAndBottom;
                        for (FlexLine flexLine : mFlexLines) {
                            newFlexLines.add(dummySpaceFlexLine);
                            newFlexLines.add(flexLine);
                            newFlexLines.add(dummySpaceFlexLine);
                        }
                        mFlexLines = newFlexLines;
                        break;
                    }
                    case ALIGN_CONTENT_SPACE_BETWEEN: {
                        // The value of free space along the cross axis between each flex line.
                        float spaceBetweenFlexLine = size - totalCrossSize;
                        int numberOfSpaces = mFlexLines.size() - 1;
                        spaceBetweenFlexLine = spaceBetweenFlexLine / (float) numberOfSpaces;
                        float accumulatedError = 0;
                        List<FlexLine> newFlexLines = new ArrayList<>();
                        for (int i = 0, flexLineSize = mFlexLines.size(); i < flexLineSize; i++) {
                            FlexLine flexLine = mFlexLines.get(i);
                            newFlexLines.add(flexLine);

                            if (i != mFlexLines.size() - 1) {
                                FlexLine dummySpaceFlexLine = new FlexLine();
                                if (i == mFlexLines.size() - 2) {
                                    // The last dummy space block in the flex container.
                                    // Adjust the cross size by the accumulated error.
                                    dummySpaceFlexLine.mCrossSize = Math
                                            .round(spaceBetweenFlexLine + accumulatedError);
                                    accumulatedError = 0;
                                } else {
                                    dummySpaceFlexLine.mCrossSize = Math
                                            .round(spaceBetweenFlexLine);
                                }
                                accumulatedError += (spaceBetweenFlexLine
                                        - dummySpaceFlexLine.mCrossSize);
                                if (accumulatedError > 1) {
                                    dummySpaceFlexLine.mCrossSize += 1;
                                    accumulatedError -= 1;
                                } else if (accumulatedError < -1) {
                                    dummySpaceFlexLine.mCrossSize -= 1;
                                    accumulatedError += 1;
                                }
                                newFlexLines.add(dummySpaceFlexLine);
                            }
                        }
                        mFlexLines = newFlexLines;
                        break;
                    }
                    case ALIGN_CONTENT_CENTER: {
                        int spaceAboveAndBottom = size - totalCrossSize;
                        spaceAboveAndBottom = spaceAboveAndBottom / 2;
                        List<FlexLine> newFlexLines = new ArrayList<>();
                        FlexLine dummySpaceFlexLine = new FlexLine();
                        dummySpaceFlexLine.mCrossSize = spaceAboveAndBottom;
                        for (int i = 0, flexLineSize = mFlexLines.size(); i < flexLineSize; i++) {
                            if (i == 0) {
                                newFlexLines.add(dummySpaceFlexLine);
                            }
                            FlexLine flexLine = mFlexLines.get(i);
                            newFlexLines.add(flexLine);
                            if (i == mFlexLines.size() - 1) {
                                newFlexLines.add(dummySpaceFlexLine);
                            }
                        }
                        mFlexLines = newFlexLines;
                        break;
                    }
                    case ALIGN_CONTENT_FLEX_END: {
                        int spaceTop = size - totalCrossSize;
                        FlexLine dummySpaceFlexLine = new FlexLine();
                        dummySpaceFlexLine.mCrossSize = spaceTop;
                        mFlexLines.add(0, dummySpaceFlexLine);
                        break;
                    }
                }
            }
        }
    }

    /**
     * Expand the view if the {@link #mAlignItems} attribute is set to {@link #ALIGN_ITEMS_STRETCH}
     * or {@link LayoutParams#ALIGN_SELF_STRETCH} is set to an individual child view.
     *
     * @param flexDirection the flex direction attribute
     * @param alignItems    the align items attribute
     * @see #getFlexDirection()
     * @see #setFlexDirection(int)
     * @see #getAlignItems()
     * @see #setAlignItems(int)
     * @see LayoutParams#alignSelf
     */
    private void stretchViews(int flexDirection, int alignItems) {
        if (alignItems == ALIGN_ITEMS_STRETCH) {
            int viewIndex = 0;
            for (FlexLine flexLine : mFlexLines) {
                for (int i = 0; i < flexLine.mItemCount; i++, viewIndex++) {
                    View view = getReorderedChildAt(viewIndex);
                    LayoutParams lp = (LayoutParams) view.getLayoutParams();
                    if (lp.alignSelf != LayoutParams.ALIGN_SELF_AUTO &&
                            lp.alignSelf != LayoutParams.ALIGN_SELF_STRETCH) {
                        continue;
                    }
                    switch (flexDirection) {
                        case FLEX_DIRECTION_ROW: // Intentional fall through
                        case FLEX_DIRECTION_ROW_REVERSE:
                            stretchViewVertically(view, flexLine.mCrossSize);
                            break;
                        case FLEX_DIRECTION_COLUMN:
                        case FLEX_DIRECTION_COLUMN_REVERSE:
                            stretchViewHorizontally(view, flexLine.mCrossSize);
                            break;
                        default:
                            throw new IllegalArgumentException(
                                    "Invalid flex direction: " + flexDirection);
                    }
                }
            }
        } else {
            for (FlexLine flexLine : mFlexLines) {
                for (Integer index : flexLine.mIndicesAlignSelfStretch) {
                    View view = getReorderedChildAt(index);
                    switch (flexDirection) {
                        case FLEX_DIRECTION_ROW: // Intentional fall through
                        case FLEX_DIRECTION_ROW_REVERSE:
                            stretchViewVertically(view, flexLine.mCrossSize);
                            break;
                        case FLEX_DIRECTION_COLUMN:
                        case FLEX_DIRECTION_COLUMN_REVERSE:
                            stretchViewHorizontally(view, flexLine.mCrossSize);
                            break;
                        default:
                            throw new IllegalArgumentException(
                                    "Invalid flex direction: " + flexDirection);
                    }
                }
            }
        }
    }

    /**
     * Expand the view vertically to the size of the crossSize (considering the view margins)
     *
     * @param view      the View to be stretched
     * @param crossSize the cross size
     */
    private void stretchViewVertically(View view, int crossSize) {
        LayoutParams lp = (LayoutParams) view.getLayoutParams();
        int newHeight = crossSize - lp.topMargin - lp.bottomMargin;
        newHeight = Math.max(newHeight, 0);
        view.measure(MeasureSpec
                        .makeMeasureSpec(view.getMeasuredWidth(), MeasureSpec.EXACTLY),
                MeasureSpec.makeMeasureSpec(newHeight, MeasureSpec.EXACTLY));
    }

    /**
     * Expand the view horizontally to the size of the crossSize (considering the view margins)
     *
     * @param view      the View to be stretched
     * @param crossSize the cross size
     */
    private void stretchViewHorizontally(View view, int crossSize) {
        LayoutParams lp = (LayoutParams) view.getLayoutParams();
        int newWidth = crossSize - lp.leftMargin - lp.rightMargin;
        newWidth = Math.max(newWidth, 0);
        view.measure(MeasureSpec
                        .makeMeasureSpec(newWidth, MeasureSpec.EXACTLY),
                MeasureSpec.makeMeasureSpec(view.getMeasuredHeight(), MeasureSpec.EXACTLY));
    }

    /**
     * Set this FlexboxLayouts' width and height depending on the calculated size of main axis and
     * cross axis.
     *
     * @param flexDirection     the value of the flex direction
     * @param widthMeasureSpec  horizontal space requirements as imposed by the parent
     * @param heightMeasureSpec vertical space requirements as imposed by the parent
     * @param childState        the child state of the View
     * @see #getFlexDirection()
     * @see #setFlexDirection(int)
     */
    private void setMeasuredDimensionForFlex(@FlexDirection int flexDirection, int widthMeasureSpec,
            int heightMeasureSpec, int childState) {
        int widthMode = MeasureSpec.getMode(widthMeasureSpec);
        int widthSize = MeasureSpec.getSize(widthMeasureSpec);
        int heightMode = MeasureSpec.getMode(heightMeasureSpec);
        int heightSize = MeasureSpec.getSize(heightMeasureSpec);
        int calculatedMaxHeight;
        int calculatedMaxWidth;
        switch (flexDirection) {
            case FLEX_DIRECTION_ROW: // Intentional fall through
            case FLEX_DIRECTION_ROW_REVERSE:
                calculatedMaxHeight = getSumOfCrossSize() + getPaddingTop()
                        + getPaddingBottom();
                calculatedMaxWidth = getLargestMainSize();
                break;
            case FLEX_DIRECTION_COLUMN: // Intentional fall through
            case FLEX_DIRECTION_COLUMN_REVERSE:
                calculatedMaxHeight = getLargestMainSize();
                calculatedMaxWidth = getSumOfCrossSize() + getPaddingLeft() + getPaddingRight();
                break;
            default:
                throw new IllegalArgumentException("Invalid flex direction: " + flexDirection);
        }

        int widthSizeAndState;
        switch (widthMode) {
            case MeasureSpec.EXACTLY:
                if (widthSize < calculatedMaxWidth) {
                    childState = ViewCompat
                            .combineMeasuredStates(childState, ViewCompat.MEASURED_STATE_TOO_SMALL);
                }
                widthSizeAndState = ViewCompat.resolveSizeAndState(widthSize, widthMeasureSpec,
                        childState);
                break;
            case MeasureSpec.AT_MOST: {
                if (widthSize < calculatedMaxWidth) {
                    childState = ViewCompat
                            .combineMeasuredStates(childState, ViewCompat.MEASURED_STATE_TOO_SMALL);
                } else {
                    widthSize = calculatedMaxWidth;
                }
                widthSizeAndState = ViewCompat.resolveSizeAndState(widthSize, widthMeasureSpec,
                        childState);
                break;
            }
            case MeasureSpec.UNSPECIFIED: {
                widthSizeAndState = ViewCompat
                        .resolveSizeAndState(calculatedMaxWidth, widthMeasureSpec, childState);
                break;
            }
            default:
                throw new IllegalStateException("Unknown width mode is set: " + widthMode);
        }
        int heightSizeAndState;
        switch (heightMode) {
            case MeasureSpec.EXACTLY:
                if (heightSize < calculatedMaxHeight) {
                    childState = ViewCompat.combineMeasuredStates(childState,
                            ViewCompat.MEASURED_STATE_TOO_SMALL
                                    >> ViewCompat.MEASURED_HEIGHT_STATE_SHIFT);
                }
                heightSizeAndState = ViewCompat.resolveSizeAndState(heightSize, heightMeasureSpec,
                        childState);
                break;
            case MeasureSpec.AT_MOST: {
                if (heightSize < calculatedMaxHeight) {
                    childState = ViewCompat.combineMeasuredStates(childState,
                            ViewCompat.MEASURED_STATE_TOO_SMALL
                                    >> ViewCompat.MEASURED_HEIGHT_STATE_SHIFT);
                } else {
                    heightSize = calculatedMaxHeight;
                }
                heightSizeAndState = ViewCompat.resolveSizeAndState(heightSize, heightMeasureSpec,
                        childState);
                break;
            }
            case MeasureSpec.UNSPECIFIED: {
                heightSizeAndState = ViewCompat.resolveSizeAndState(calculatedMaxHeight,
                        heightMeasureSpec, childState);
                break;
            }
            default:
                throw new IllegalStateException("Unknown height mode is set: " + heightMode);
        }
        setMeasuredDimension(widthSizeAndState, heightSizeAndState);
    }

    /**
     * Determine if a wrap is required (add a new flex line).
     *
     * @param mode          the width or height mode along the main axis direction
     * @param maxSize       the max size along the main axis direction
     * @param currentLength the accumulated current length
     * @param childLength   the length of a child view which is to be collected to the flex line
     * @param lp            the LayoutParams for the view being determined whether a new flex line
     *                      is needed
     * @return {@code true} if a wrap is required, {@code false} otherwise
     * @see #getFlexWrap()
     * @see #setFlexWrap(int)
     */
    private boolean isWrapRequired(int mode, int maxSize, int currentLength, int childLength,
            LayoutParams lp, int childAbsoluteIndex, int childRelativeIndexInFlexLine) {
        if (mFlexWrap == FLEX_WRAP_NOWRAP) {
            return false;
        }
        if (lp.wrapBefore) {
            return true;
        }
        if (mode == MeasureSpec.UNSPECIFIED) {
            return false;
        }
        if (isMainAxisDirectionHorizontal(mFlexDirection)) {
            if (hasDividerBeforeChildAtAlongMainAxis(childAbsoluteIndex,
                    childRelativeIndexInFlexLine)) {
                childLength += mDividerVerticalWidth;
            }
            if ((mShowDividerVertical & SHOW_DIVIDER_END) > 0) {
                childLength += mDividerVerticalWidth;
            }
        } else {
            if (hasDividerBeforeChildAtAlongMainAxis(childAbsoluteIndex,
                    childRelativeIndexInFlexLine)) {
                childLength += mDividerHorizontalHeight;
            }
            if ((mShowDividerHorizontal & SHOW_DIVIDER_END) > 0) {
                childLength += mDividerHorizontalHeight;
            }
        }
        return maxSize < currentLength + childLength;
    }

    /**
     * Retrieve the largest main size of all flex lines.
     *
     * @return the largest main size
     */
    private int getLargestMainSize() {
        int largestSize = Integer.MIN_VALUE;
        for (FlexLine flexLine : mFlexLines) {
            largestSize = Math.max(largestSize, flexLine.mMainSize);
        }
        return largestSize;
    }

    /**
     * Retrieve the sum of the cross sizes of all flex lines including divider lengths.
     *
     * @return the sum of the cross sizes
     */
    private int getSumOfCrossSize() {
        int sum = 0;
        for (int i = 0, size = mFlexLines.size(); i < size; i++) {
            FlexLine flexLine = mFlexLines.get(i);

            // Judge if the beginning or middle dividers are required
            if (hasDividerBeforeFlexLine(i)) {
                if (isMainAxisDirectionHorizontal(mFlexDirection)) {
                    sum += mDividerHorizontalHeight;
                } else {
                    sum += mDividerVerticalWidth;
                }
            }

            // Judge if the end divider is required
            if (hasEndDividerAfterFlexLine(i)) {
                if (isMainAxisDirectionHorizontal(mFlexDirection)) {
                    sum += mDividerHorizontalHeight;
                } else {
                    sum += mDividerVerticalWidth;
                }
            }
            sum += flexLine.mCrossSize;
        }
        return sum;
    }

    private boolean isMainAxisDirectionHorizontal(@FlexDirection int flexDirection) {
        return flexDirection == FLEX_DIRECTION_ROW
                || flexDirection == FLEX_DIRECTION_ROW_REVERSE;
    }

    @Override
    protected void onLayout(boolean changed, int left, int top, int right, int bottom) {
        int layoutDirection = ViewCompat.getLayoutDirection(this);
        boolean isRtl;
        switch (mFlexDirection) {
            case FLEX_DIRECTION_ROW:
                isRtl = layoutDirection == ViewCompat.LAYOUT_DIRECTION_RTL;
                layoutHorizontal(isRtl, left, top, right, bottom);
                break;
            case FLEX_DIRECTION_ROW_REVERSE:
                isRtl = layoutDirection != ViewCompat.LAYOUT_DIRECTION_RTL;
                layoutHorizontal(isRtl, left, top, right, bottom);
                break;
            case FLEX_DIRECTION_COLUMN:
                isRtl = layoutDirection == ViewCompat.LAYOUT_DIRECTION_RTL;
                if (mFlexWrap == FLEX_WRAP_WRAP_REVERSE) {
                    isRtl = !isRtl;
                }
                layoutVertical(isRtl, false, left, top, right, bottom);
                break;
            case FLEX_DIRECTION_COLUMN_REVERSE:
                isRtl = layoutDirection == ViewCompat.LAYOUT_DIRECTION_RTL;
                if (mFlexWrap == FLEX_WRAP_WRAP_REVERSE) {
                    isRtl = !isRtl;
                }
                layoutVertical(isRtl, true, left, top, right, bottom);
                break;
            default:
                throw new IllegalStateException("Invalid flex direction is set: " + mFlexDirection);
        }

        CommonLayoutParams.restoreOriginalParams(this);
    }

    /**
     * Sub method for {@link #onLayout(boolean, int, int, int, int)} when the
     * {@link #mFlexDirection} is either {@link #FLEX_DIRECTION_ROW} or
     * {@link #FLEX_DIRECTION_ROW_REVERSE}.
     *
     * @param isRtl  {@code true} if the horizontal layout direction is right to left, {@code
     *               false} otherwise.
     * @param left   the left position of this View
     * @param top    the top position of this View
     * @param right  the right position of this View
     * @param bottom the bottom position of this View
     * @see #getFlexWrap()
     * @see #setFlexWrap(int)
     * @see #getJustifyContent()
     * @see #setJustifyContent(int)
     * @see #getAlignItems()
     * @see #setAlignItems(int)
     * @see LayoutParams#alignSelf
     */
    private void layoutHorizontal(boolean isRtl, int left, int top, int right, int bottom) {
        int paddingLeft = getPaddingLeft();
        int paddingRight = getPaddingRight();
        // Use float to reduce the round error that may happen in when justifyContent ==
        // SPACE_BETWEEN or SPACE_AROUND
        float childLeft;
        int currentViewIndex = 0;

        int height = bottom - top;
        int width = right - left;
        // childBottom is used if the mFlexWrap is FLEX_WRAP_WRAP_REVERSE otherwise
        // childTop is used to align the vertical position of the children views.
        int childBottom = height - getPaddingBottom();
        int childTop = getPaddingTop();

        // Used only for RTL layout
        // Use float to reduce the round error that may happen in when justifyContent ==
        // SPACE_BETWEEN or SPACE_AROUND
        float childRight;
        for (int i = 0, size = mFlexLines.size(); i < size; i++) {
            FlexLine flexLine = mFlexLines.get(i);
            if (hasDividerBeforeFlexLine(i)) {
                childBottom -= mDividerHorizontalHeight;
                childTop += mDividerHorizontalHeight;
            }
            float spaceBetweenItem = 0f;
            switch (mJustifyContent) {
                case JUSTIFY_CONTENT_FLEX_START:
                    childLeft = paddingLeft;
                    childRight = width - paddingRight;
                    break;
                case JUSTIFY_CONTENT_FLEX_END:
                    childLeft = width - flexLine.mMainSize + paddingRight;
                    childRight = flexLine.mMainSize - paddingLeft;
                    break;
                case JUSTIFY_CONTENT_CENTER:
                    childLeft = paddingLeft + (width - flexLine.mMainSize) / 2f;
                    childRight = width - paddingRight - (width - flexLine.mMainSize) / 2f;
                    break;
                case JUSTIFY_CONTENT_SPACE_AROUND:
                    if (flexLine.mItemCount != 0) {
                        spaceBetweenItem = (width - flexLine.mMainSize)
                                / (float) flexLine.mItemCount;
                    }
                    childLeft = paddingLeft + spaceBetweenItem / 2f;
                    childRight = width - paddingRight - spaceBetweenItem / 2f;
                    break;
                case JUSTIFY_CONTENT_SPACE_BETWEEN:
                    childLeft = paddingLeft;
                    float denominator = flexLine.mItemCount != 1 ? flexLine.mItemCount - 1 : 1f;
                    spaceBetweenItem = (width - flexLine.mMainSize) / denominator;
                    childRight = width - paddingRight;
                    break;
                default:
                    throw new IllegalStateException(
                            "Invalid justifyContent is set: " + mJustifyContent);
            }
            spaceBetweenItem = Math.max(spaceBetweenItem, 0);

            for (int j = 0; j < flexLine.mItemCount; j++) {
                View child = getReorderedChildAt(currentViewIndex);
                if (child == null) {
                    continue;
                } else if (child.getVisibility() == View.GONE) {
                    currentViewIndex++;
                    continue;
                }
                LayoutParams lp = ((LayoutParams) child.getLayoutParams());
                childLeft += lp.leftMargin;
                childRight -= lp.rightMargin;
                if (hasDividerBeforeChildAtAlongMainAxis(currentViewIndex, j)) {
                    childLeft += mDividerVerticalWidth;
                    childRight -= mDividerVerticalWidth;
                }

                if (mFlexWrap == FLEX_WRAP_WRAP_REVERSE) {
                    if (isRtl) {
                        layoutSingleChildHorizontal(child, flexLine, mFlexWrap, mAlignItems,
                                Math.round(childRight) - child.getMeasuredWidth(),
                                childBottom - child.getMeasuredHeight(), Math.round(childRight),
                                childBottom);
                    } else {
                        layoutSingleChildHorizontal(child, flexLine, mFlexWrap, mAlignItems,
                                Math.round(childLeft), childBottom - child.getMeasuredHeight(),
                                Math.round(childLeft) + child.getMeasuredWidth(),
                                childBottom);
                    }
                } else {
                    if (isRtl) {
                        layoutSingleChildHorizontal(child, flexLine, mFlexWrap, mAlignItems,
                                Math.round(childRight) - child.getMeasuredWidth(), childTop,
                                Math.round(childRight), childTop + child.getMeasuredHeight());
                    } else {
                        layoutSingleChildHorizontal(child, flexLine, mFlexWrap, mAlignItems,
                                Math.round(childLeft), childTop,
                                Math.round(childLeft) + child.getMeasuredWidth(),
                                childTop + child.getMeasuredHeight());
                    }
                }
                childLeft += child.getMeasuredWidth() + spaceBetweenItem + lp.rightMargin;
                childRight -= child.getMeasuredWidth() + spaceBetweenItem + lp.leftMargin;
                currentViewIndex++;

                flexLine.mLeft = Math.min(flexLine.mLeft, child.getLeft() - lp.leftMargin);
                flexLine.mTop = Math.min(flexLine.mTop, child.getTop() - lp.topMargin);
                flexLine.mRight = Math.max(flexLine.mRight, child.getRight() + lp.rightMargin);
                flexLine.mBottom = Math.max(flexLine.mBottom, child.getBottom() + lp.bottomMargin);
            }
            childTop += flexLine.mCrossSize;
            childBottom -= flexLine.mCrossSize;
        }
    }

    /**
     * Place a single View when the layout direction is horizontal ({@link #mFlexDirection} is
     * either {@link #FLEX_DIRECTION_ROW} or {@link #FLEX_DIRECTION_ROW_REVERSE}).
     *
     * @param view       the View to be placed
     * @param flexLine   the {@link FlexLine} where the View belongs to
     * @param flexWrap   the flex wrap attribute of this FlexboxLayout
     * @param alignItems the align items attribute of this FlexboxLayout
     * @param left       the left position of the View, which the View's margin is already taken
     *                   into account
     * @param top        the top position of the flex line where the View belongs to. The actual
     *                   View's top position is shifted depending on the flexWrap and alignItems
     *                   attributes
     * @param right      the right position of the View, which the View's margin is already taken
     *                   into account
     * @param bottom     the bottom position of the flex line where the View belongs to. The actual
     *                   View's bottom position is shifted depending on the flexWrap and alignItems
     *                   attributes
     * @see #getAlignItems()
     * @see #setAlignItems(int)
     * @see LayoutParams#alignSelf
     */
    private void layoutSingleChildHorizontal(View view, FlexLine flexLine, @FlexWrap int flexWrap,
            int alignItems, int left, int top, int right, int bottom) {
        LayoutParams lp = (LayoutParams) view.getLayoutParams();
        if (lp.alignSelf != LayoutParams.ALIGN_SELF_AUTO) {
            // Expecting the values for alignItems and alignSelf match except for ALIGN_SELF_AUTO.
            // Assigning the alignSelf value as alignItems should work.
            alignItems = lp.alignSelf;
        }
        int crossSize = flexLine.mCrossSize;
        switch (alignItems) {
            case ALIGN_ITEMS_FLEX_START: // Intentional fall through
            case ALIGN_ITEMS_STRETCH:
                if (flexWrap != FLEX_WRAP_WRAP_REVERSE) {
                    view.layout(left, top + lp.topMargin, right, bottom + lp.topMargin);
                } else {
                    view.layout(left, top - lp.bottomMargin, right, bottom - lp.bottomMargin);
                }
                break;
            case ALIGN_ITEMS_BASELINE:
                if (flexWrap != FLEX_WRAP_WRAP_REVERSE) {
                    int marginTop = flexLine.mMaxBaseline - view.getBaseline();
                    marginTop = Math.max(marginTop, lp.topMargin);
                    view.layout(left, top + marginTop, right, bottom + marginTop);
                } else {
                    int marginBottom = flexLine.mMaxBaseline - view.getMeasuredHeight() + view
                            .getBaseline();
                    marginBottom = Math.max(marginBottom, lp.bottomMargin);
                    view.layout(left, top - marginBottom, right, bottom - marginBottom);
                }
                break;
            case ALIGN_ITEMS_FLEX_END:
                if (flexWrap != FLEX_WRAP_WRAP_REVERSE) {
                    view.layout(left,
                            top + crossSize - view.getMeasuredHeight() - lp.bottomMargin,
                            right, top + crossSize - lp.bottomMargin);
                } else {
                    // If the flexWrap == FLEX_WRAP_WRAP_REVERSE, the direction of the
                    // flexEnd is flipped (from top to bottom).
                    view.layout(left, top - crossSize + view.getMeasuredHeight() + lp.topMargin,
                            right, bottom - crossSize + view.getMeasuredHeight() + lp.topMargin);
                }
                break;
            case ALIGN_ITEMS_CENTER:
                int topFromCrossAxis = (crossSize - view.getMeasuredHeight()) / 2;
                if (flexWrap != FLEX_WRAP_WRAP_REVERSE) {
                    view.layout(left, top + topFromCrossAxis + lp.topMargin - lp.bottomMargin,
                            right, top + topFromCrossAxis + view.getMeasuredHeight() + lp.topMargin
                                    - lp.bottomMargin);
                } else {
                    view.layout(left, top - topFromCrossAxis + lp.topMargin - lp.bottomMargin,
                            right, top - topFromCrossAxis + view.getMeasuredHeight() + lp.topMargin
                                    - lp.bottomMargin);
                }
                break;
        }
    }

    /**
     * Sub method for {@link #onLayout(boolean, int, int, int, int)} when the
     * {@link #mFlexDirection} is either {@link #FLEX_DIRECTION_COLUMN} or
     * {@link #FLEX_DIRECTION_COLUMN_REVERSE}.
     *
     * @param isRtl           {@code true} if the horizontal layout direction is right to left,
     *                        {@code false}
     *                        otherwise
     * @param fromBottomToTop {@code true} if the layout direction is bottom to top, {@code false}
     *                        otherwise
     * @param left            the left position of this View
     * @param top             the top position of this View
     * @param right           the right position of this View
     * @param bottom          the bottom position of this View
     * @see #getFlexWrap()
     * @see #setFlexWrap(int)
     * @see #getJustifyContent()
     * @see #setJustifyContent(int)
     * @see #getAlignItems()
     * @see #setAlignItems(int)
     * @see LayoutParams#alignSelf
     */
    private void layoutVertical(boolean isRtl, boolean fromBottomToTop, int left, int top,
            int right, int bottom) {
        int paddingTop = getPaddingTop();
        int paddingBottom = getPaddingBottom();

        int paddingRight = getPaddingRight();
        int childLeft = getPaddingLeft();
        int currentViewIndex = 0;

        int width = right - left;
        int height = bottom - top;
        // childRight is used if the mFlexWrap is FLEX_WRAP_WRAP_REVERSE otherwise
        // childLeft is used to align the horizontal position of the children views.
        int childRight = width - paddingRight;

        // Use float to reduce the round error that may happen in when justifyContent ==
        // SPACE_BETWEEN or SPACE_AROUND
        float childTop;

        // Used only for if the direction is from bottom to top
        float childBottom;

        for (int i = 0, size = mFlexLines.size(); i < size; i++) {
            FlexLine flexLine = mFlexLines.get(i);
            if (hasDividerBeforeFlexLine(i)) {
                childLeft += mDividerVerticalWidth;
                childRight -= mDividerVerticalWidth;
            }
            float spaceBetweenItem = 0f;
            switch (mJustifyContent) {
                case JUSTIFY_CONTENT_FLEX_START:
                    childTop = paddingTop;
                    childBottom = height - paddingBottom;
                    break;
                case JUSTIFY_CONTENT_FLEX_END:
                    childTop = height - flexLine.mMainSize + paddingBottom;
                    childBottom = flexLine.mMainSize - paddingTop;
                    break;
                case JUSTIFY_CONTENT_CENTER:
                    childTop = paddingTop + (height - flexLine.mMainSize) / 2f;
                    childBottom = height - paddingBottom - (height - flexLine.mMainSize) / 2f;
                    break;
                case JUSTIFY_CONTENT_SPACE_AROUND:
                    if (flexLine.mItemCount != 0) {
                        spaceBetweenItem = (height - flexLine.mMainSize)
                                / (float) flexLine.mItemCount;
                    }
                    childTop = paddingTop + spaceBetweenItem / 2f;
                    childBottom = height - paddingBottom - spaceBetweenItem / 2f;
                    break;
                case JUSTIFY_CONTENT_SPACE_BETWEEN:
                    childTop = paddingTop;
                    float denominator = flexLine.mItemCount != 1 ? flexLine.mItemCount - 1 : 1f;
                    spaceBetweenItem = (height - flexLine.mMainSize) / denominator;
                    childBottom = height - paddingBottom;
                    break;
                default:
                    throw new IllegalStateException(
                            "Invalid justifyContent is set: " + mJustifyContent);
            }
            spaceBetweenItem = Math.max(spaceBetweenItem, 0);

            for (int j = 0; j < flexLine.mItemCount; j++) {
                View child = getReorderedChildAt(currentViewIndex);
                if (child == null) {
                    continue;
                } else if (child.getVisibility() == View.GONE) {
                    currentViewIndex++;
                    continue;
                }
                LayoutParams lp = ((LayoutParams) child.getLayoutParams());
                childTop += lp.topMargin;
                childBottom -= lp.bottomMargin;
                if (hasDividerBeforeChildAtAlongMainAxis(currentViewIndex, j)) {
                    childTop += mDividerHorizontalHeight;
                    childBottom -= mDividerHorizontalHeight;
                }
                if (isRtl) {
                    if (fromBottomToTop) {
                        layoutSingleChildVertical(child, flexLine, true, mAlignItems,
                                childRight - child.getMeasuredWidth(),
                                Math.round(childBottom) - child.getMeasuredHeight(), childRight,
                                Math.round(childBottom));
                    } else {
                        layoutSingleChildVertical(child, flexLine, true, mAlignItems,
                                childRight - child.getMeasuredWidth(), Math.round(childTop),
                                childRight, Math.round(childTop) + child.getMeasuredHeight());
                    }
                } else {
                    if (fromBottomToTop) {
                        layoutSingleChildVertical(child, flexLine, false, mAlignItems,
                                childLeft, Math.round(childBottom) - child.getMeasuredHeight(),
                                childLeft + child.getMeasuredWidth(), Math.round(childBottom));
                    } else {
                        layoutSingleChildVertical(child, flexLine, false, mAlignItems,
                                childLeft, Math.round(childTop),
                                childLeft + child.getMeasuredWidth(),
                                Math.round(childTop) + child.getMeasuredHeight());
                    }
                }
                childTop += child.getMeasuredHeight() + spaceBetweenItem + lp.bottomMargin;
                childBottom -= child.getMeasuredHeight() + spaceBetweenItem + lp.topMargin;
                currentViewIndex++;

                flexLine.mLeft = Math.min(flexLine.mLeft, child.getLeft() - lp.leftMargin);
                flexLine.mTop = Math.min(flexLine.mTop, child.getTop() - lp.topMargin);
                flexLine.mRight = Math.max(flexLine.mRight, child.getRight() + lp.rightMargin);
                flexLine.mBottom = Math.max(flexLine.mBottom, child.getBottom() + lp.bottomMargin);
            }
            childLeft += flexLine.mCrossSize;
            childRight -= flexLine.mCrossSize;
        }
    }

    /**
     * Place a single View when the layout direction is vertical ({@link #mFlexDirection} is
     * either {@link #FLEX_DIRECTION_COLUMN} or {@link #FLEX_DIRECTION_COLUMN_REVERSE}).
     *
     * @param view       the View to be placed
     * @param flexLine   the {@link FlexLine} where the View belongs to
     * @param isRtl      {@code true} if the layout direction is right to left, {@code false}
     *                   otherwise
     * @param alignItems the align items attribute of this FlexboxLayout
     * @param left       the left position of the flex line where the View belongs to. The actual
     *                   View's left position is shifted depending on the isRtl and alignItems
     *                   attributes
     * @param top        the top position of the View, which the View's margin is already taken
     *                   into account
     * @param right      the right position of the flex line where the View belongs to. The actual
     *                   View's right position is shifted depending on the isRtl and alignItems
     *                   attributes
     * @param bottom     the bottom position of the View, which the View's margin is already taken
     *                   into account
     * @see #getAlignItems()
     * @see #setAlignItems(int)
     * @see LayoutParams#alignSelf
     */
    private void layoutSingleChildVertical(View view, FlexLine flexLine, boolean isRtl,
            int alignItems, int left, int top, int right, int bottom) {
        LayoutParams lp = (LayoutParams) view.getLayoutParams();
        if (lp.alignSelf != LayoutParams.ALIGN_SELF_AUTO) {
            // Expecting the values for alignItems and alignSelf match except for ALIGN_SELF_AUTO.
            // Assigning the alignSelf value as alignItems should work.
            alignItems = lp.alignSelf;
        }
        int crossSize = flexLine.mCrossSize;
        switch (alignItems) {
            case ALIGN_ITEMS_FLEX_START: // Intentional fall through
            case ALIGN_ITEMS_STRETCH: // Intentional fall through
            case ALIGN_ITEMS_BASELINE:
                if (!isRtl) {
                    view.layout(left + lp.leftMargin, top, right + lp.leftMargin, bottom);
                } else {
                    view.layout(left - lp.rightMargin, top, right - lp.rightMargin, bottom);
                }
                break;
            case ALIGN_ITEMS_FLEX_END:
                if (!isRtl) {
                    view.layout(left + crossSize - view.getMeasuredWidth() - lp.rightMargin,
                            top, right + crossSize - view.getMeasuredWidth() - lp.rightMargin,
                            bottom);
                } else {
                    // If the flexWrap == FLEX_WRAP_WRAP_REVERSE, the direction of the
                    // flexEnd is flipped (from left to right).
                    view.layout(left - crossSize + view.getMeasuredWidth() + lp.leftMargin, top,
                            right - crossSize + view.getMeasuredWidth() + lp.leftMargin,
                            bottom);
                }
                break;
            case ALIGN_ITEMS_CENTER:
                int leftFromCrossAxis = (crossSize - view.getMeasuredWidth()) / 2;
                if (!isRtl) {
                    view.layout(left + leftFromCrossAxis + lp.leftMargin - lp.rightMargin,
                            top, right + leftFromCrossAxis + lp.leftMargin - lp.rightMargin,
                            bottom);
                } else {
                    view.layout(left - leftFromCrossAxis + lp.leftMargin - lp.rightMargin,
                            top, right - leftFromCrossAxis + lp.leftMargin - lp.rightMargin,
                            bottom);
                }
                break;
        }
    }

    @Override
    protected void onDraw(Canvas canvas) {
        if (mDividerDrawableVertical == null && mDividerDrawableHorizontal == null) {
            return;
        }
        if (mShowDividerHorizontal == SHOW_DIVIDER_NONE
                && mShowDividerVertical == SHOW_DIVIDER_NONE) {
            return;
        }

        int layoutDirection = ViewCompat.getLayoutDirection(this);
        boolean isRtl;
        boolean fromBottomToTop = false;
        switch (mFlexDirection) {
            case FLEX_DIRECTION_ROW:
                isRtl = layoutDirection == ViewCompat.LAYOUT_DIRECTION_RTL;
                if (mFlexWrap == FLEX_WRAP_WRAP_REVERSE) {
                    fromBottomToTop = true;
                }
                drawDividersHorizontal(canvas, isRtl, fromBottomToTop);
                break;
            case FLEX_DIRECTION_ROW_REVERSE:
                isRtl = layoutDirection != ViewCompat.LAYOUT_DIRECTION_RTL;
                if (mFlexWrap == FLEX_WRAP_WRAP_REVERSE) {
                    fromBottomToTop = true;
                }
                drawDividersHorizontal(canvas, isRtl, fromBottomToTop);
                break;
            case FLEX_DIRECTION_COLUMN:
                isRtl = layoutDirection == ViewCompat.LAYOUT_DIRECTION_RTL;
                if (mFlexWrap == FLEX_WRAP_WRAP_REVERSE) {
                    isRtl = !isRtl;
                }
                fromBottomToTop = false;
                drawDividersVertical(canvas, isRtl, fromBottomToTop);
                break;
            case FLEX_DIRECTION_COLUMN_REVERSE:
                isRtl = layoutDirection == ViewCompat.LAYOUT_DIRECTION_RTL;
                if (mFlexWrap == FLEX_WRAP_WRAP_REVERSE) {
                    isRtl = !isRtl;
                }
                fromBottomToTop = true;
                drawDividersVertical(canvas, isRtl, fromBottomToTop);
                break;
        }
    }

    /**
     * Sub method for {@link #onDraw(Canvas)} when the main axis direction is horizontal
     * ({@link #mFlexDirection} is either of {@link #FLEX_DIRECTION_ROW} or
     * {@link #FLEX_DIRECTION_ROW_REVERSE}.
     *
     * @param canvas          the canvas on which the background will be drawn
     * @param isRtl           {@code true} when the horizontal layout direction is right to left,
     *                        {@code false} otherwise
     * @param fromBottomToTop {@code true} when the vertical layout direction is bottom to top,
     *                        {@code false} otherwise
     */
    private void drawDividersHorizontal(Canvas canvas, boolean isRtl, boolean fromBottomToTop) {
        int currentViewIndex = 0;
        int paddingLeft = getPaddingLeft();
        int paddingRight = getPaddingRight();
        int horizontalDividerLength = Math.max(0, getWidth() - paddingRight - paddingLeft);
        for (int i = 0, size = mFlexLines.size(); i < size; i++) {
            FlexLine flexLine = mFlexLines.get(i);
            for (int j = 0; j < flexLine.mItemCount; j++) {
                View view = getReorderedChildAt(currentViewIndex);
                LayoutParams lp = (LayoutParams) view.getLayoutParams();

                // Judge if the beginning or middle divider is needed
                if (hasDividerBeforeChildAtAlongMainAxis(currentViewIndex, j)) {
                    int dividerLeft;
                    if (isRtl) {
                        dividerLeft = view.getRight() + lp.rightMargin;
                    } else {
                        dividerLeft = view.getLeft() - lp.leftMargin - mDividerVerticalWidth;
                    }

                    drawVerticalDivider(canvas, dividerLeft, flexLine.mTop, flexLine.mCrossSize);
                }

                // Judge if the end divider is needed
                if (j == flexLine.mItemCount - 1) {
                    if ((mShowDividerVertical & SHOW_DIVIDER_END) > 0) {
                        int dividerLeft;
                        if (isRtl) {
                            dividerLeft = view.getLeft() - lp.leftMargin - mDividerVerticalWidth;
                        } else {
                            dividerLeft = view.getRight() + lp.rightMargin;
                        }

                        drawVerticalDivider(canvas, dividerLeft, flexLine.mTop,
                                flexLine.mCrossSize);
                    }
                }
                currentViewIndex++;
            }

            // Judge if the beginning or middle dividers are needed before the flex line
            if (hasDividerBeforeFlexLine(i)) {
                int horizontalDividerTop;
                if (fromBottomToTop) {
                    horizontalDividerTop = flexLine.mBottom;
                } else {
                    horizontalDividerTop = flexLine.mTop - mDividerHorizontalHeight;
                }
                drawHorizontalDivider(canvas, paddingLeft, horizontalDividerTop,
                        horizontalDividerLength);
            }
            // Judge if the end divider is needed before the flex line
            if (hasEndDividerAfterFlexLine(i)) {
                if ((mShowDividerHorizontal & SHOW_DIVIDER_END) > 0) {
                    int horizontalDividerTop;
                    if (fromBottomToTop) {
                        horizontalDividerTop = flexLine.mTop - mDividerHorizontalHeight;
                    } else {
                        horizontalDividerTop = flexLine.mBottom;
                    }
                    drawHorizontalDivider(canvas, paddingLeft, horizontalDividerTop,
                            horizontalDividerLength);
                }
            }
        }
    }

    /**
     * Sub method for {@link #onDraw(Canvas)} when the main axis direction is vertical
     * ({@link #mFlexDirection} is either of {@link #FLEX_DIRECTION_COLUMN} or
     * {@link #FLEX_DIRECTION_COLUMN_REVERSE}.
     *
     * @param canvas          the canvas on which the background will be drawn
     * @param isRtl           {@code true} when the horizontal layout direction is right to left,
     *                        {@code false} otherwise
     * @param fromBottomToTop {@code true} when the vertical layout direction is bottom to top,
     *                        {@code false} otherwise
     */
    private void drawDividersVertical(Canvas canvas, boolean isRtl, boolean fromBottomToTop) {
        int currentViewIndex = 0;
        int paddingTop = getPaddingTop();
        int paddingBottom = getPaddingBottom();
        int verticalDividerLength = Math.max(0, getHeight() - paddingBottom - paddingTop);
        for (int i = 0, size = mFlexLines.size(); i < size; i++) {
            FlexLine flexLine = mFlexLines.get(i);

            // Draw horizontal dividers if needed
            for (int j = 0; j < flexLine.mItemCount; j++) {
                View view = getReorderedChildAt(currentViewIndex);
                LayoutParams lp = (LayoutParams) view.getLayoutParams();

                // Judge if the beginning or middle divider is needed
                if (hasDividerBeforeChildAtAlongMainAxis(currentViewIndex, j)) {
                    int dividerTop;
                    if (fromBottomToTop) {
                        dividerTop = view.getBottom() + lp.bottomMargin;
                    } else {
                        dividerTop = view.getTop() - lp.topMargin - mDividerHorizontalHeight;
                    }

                    drawHorizontalDivider(canvas, flexLine.mLeft, dividerTop, flexLine.mCrossSize);
                }

                // Judge if the end divider is needed
                if (j == flexLine.mItemCount - 1) {
                    if ((mShowDividerHorizontal & SHOW_DIVIDER_END) > 0) {
                        int dividerTop;
                        if (fromBottomToTop) {
                            dividerTop = view.getTop() - lp.topMargin - mDividerHorizontalHeight;
                        } else {
                            dividerTop = view.getBottom() + lp.bottomMargin;
                        }

                        drawHorizontalDivider(canvas, flexLine.mLeft, dividerTop,
                                flexLine.mCrossSize);
                    }
                }
                currentViewIndex++;
            }

            // Judge if the beginning or middle dividers are needed before the flex line
            if (hasDividerBeforeFlexLine(i)) {
                int verticalDividerLeft;
                if (isRtl) {
                    verticalDividerLeft = flexLine.mRight;
                } else {
                    verticalDividerLeft = flexLine.mLeft - mDividerVerticalWidth;
                }
                drawVerticalDivider(canvas, verticalDividerLeft, paddingTop,
                        verticalDividerLength);
            }
            if (hasEndDividerAfterFlexLine(i)) {
                if ((mShowDividerVertical & SHOW_DIVIDER_END) > 0) {
                    int verticalDividerLeft;
                    if (isRtl) {
                        verticalDividerLeft = flexLine.mLeft - mDividerVerticalWidth;
                    } else {
                        verticalDividerLeft = flexLine.mRight;
                    }
                    drawVerticalDivider(canvas, verticalDividerLeft, paddingTop,
                            verticalDividerLength);
                }
            }
        }
    }

    private void drawVerticalDivider(Canvas canvas, int left, int top, int length) {
        if (mDividerDrawableVertical == null) {
            return;
        }
        mDividerDrawableVertical.setBounds(left, top, left + mDividerVerticalWidth, top + length);
        mDividerDrawableVertical.draw(canvas);
    }

    private void drawHorizontalDivider(Canvas canvas, int left, int top, int length) {
        if (mDividerDrawableHorizontal == null) {
            return;
        }
        mDividerDrawableHorizontal
                .setBounds(left, top, left + length, top + mDividerHorizontalHeight);
        mDividerDrawableHorizontal.draw(canvas);
    }

    @Override
    protected boolean checkLayoutParams(ViewGroup.LayoutParams p) {
        return p instanceof FlexboxLayout.LayoutParams;
    }

    @Override
    public LayoutParams generateLayoutParams(AttributeSet attrs) {
        return new FlexboxLayout.LayoutParams();
    }

    @Override
    protected ViewGroup.LayoutParams generateLayoutParams(ViewGroup.LayoutParams from) {
        if (from instanceof FlexboxLayout.LayoutParams)
            return new FlexboxLayout.LayoutParams((FlexboxLayout.LayoutParams)from);

        if (from instanceof CommonLayoutParams)
            return new FlexboxLayout.LayoutParams((CommonLayoutParams)from);

        if (from instanceof FrameLayout.LayoutParams)
            return new FlexboxLayout.LayoutParams((FrameLayout.LayoutParams)from);

        if (from instanceof ViewGroup.MarginLayoutParams)
            return new FlexboxLayout.LayoutParams((ViewGroup.MarginLayoutParams)from);

        return new FlexboxLayout.LayoutParams(from);
    }

    @FlexDirection
    public int getFlexDirection() {
        return mFlexDirection;
    }

    public void setFlexDirection(@FlexDirection int flexDirection) {
        if (mFlexDirection != flexDirection) {
            mFlexDirection = flexDirection;
            requestLayout();
        }
    }

    @FlexWrap
    public int getFlexWrap() {
        return mFlexWrap;
    }

    public void setFlexWrap(@FlexWrap int flexWrap) {
        if (mFlexWrap != flexWrap) {
            mFlexWrap = flexWrap;
            requestLayout();
        }
    }

    @JustifyContent
    public int getJustifyContent() {
        return mJustifyContent;
    }

    public void setJustifyContent(@JustifyContent int justifyContent) {
        if (mJustifyContent != justifyContent) {
            mJustifyContent = justifyContent;
            requestLayout();
        }
    }

    @AlignItems
    public int getAlignItems() {
        return mAlignItems;
    }

    public void setAlignItems(@AlignItems int alignItems) {
        if (mAlignItems != alignItems) {
            mAlignItems = alignItems;
            requestLayout();
        }
    }

    @AlignContent
    public int getAlignContent() {
        return mAlignContent;
    }

    public void setAlignContent(@AlignContent int alignContent) {
        if (mAlignContent != alignContent) {
            mAlignContent = alignContent;
            requestLayout();
        }
    }

    /**
     * @return the flex lines composing this flex container. This method returns an unmodifiable
     * list. Thus any changes of the returned list are not supported.
     */
    public List<FlexLine> getFlexLines() {
        return Collections.unmodifiableList(mFlexLines);
    }

    /**
     * @return the horizontal divider drawable that will divide each item.
     * @see #setDividerDrawable(Drawable)
     * @see #setDividerDrawableHorizontal(Drawable)
     */
    public Drawable getDividerDrawableHorizontal() {
        return mDividerDrawableHorizontal;
    }

    /**
     * @return the vertical divider drawable that will divide each item.
     * @see #setDividerDrawable(Drawable)
     * @see #setDividerDrawableVertical(Drawable)
     */
    public Drawable getDividerDrawableVertical() {
        return mDividerDrawableVertical;
    }

    /**
     * Set a drawable to be used as a divider between items. The drawable is used for both
     * horizontal and vertical dividers.
     *
     * @param divider Drawable that will divide each item for both horizontally and vertically.
     * @see #setShowDivider(int)
     */
    public void setDividerDrawable(Drawable divider) {
        setDividerDrawableHorizontal(divider);
        setDividerDrawableVertical(divider);
    }

    /**
     * Set a drawable to be used as a horizontal divider between items.
     *
     * @param divider Drawable that will divide each item.
     * @see #setDividerDrawable(Drawable)
     * @see #setShowDivider(int)
     * @see #setShowDividerHorizontal(int)
     */
    public void setDividerDrawableHorizontal(Drawable divider) {
        if (divider == mDividerDrawableHorizontal) {
            return;
        }
        mDividerDrawableHorizontal = divider;
        if (divider != null) {
            mDividerHorizontalHeight = divider.getIntrinsicHeight();
        } else {
            mDividerHorizontalHeight = 0;
        }
        setWillNotDrawFlag();
        requestLayout();
    }

    /**
     * Set a drawable to be used as a vertical divider between items.
     *
     * @param divider Drawable that will divide each item.
     * @see #setDividerDrawable(Drawable)
     * @see #setShowDivider(int)
     * @see #setShowDividerVertical(int)
     */
    public void setDividerDrawableVertical(Drawable divider) {
        if (divider == mDividerDrawableVertical) {
            return;
        }
        mDividerDrawableVertical = divider;
        if (divider != null) {
            mDividerVerticalWidth = divider.getIntrinsicWidth();
        } else {
            mDividerVerticalWidth = 0;
        }
        setWillNotDrawFlag();
        requestLayout();
    }

    @FlexboxLayout.DividerMode
    public int getShowDividerVertical() {
        return mShowDividerVertical;
    }

    @FlexboxLayout.DividerMode
    public int getShowDividerHorizontal() {
        return mShowDividerHorizontal;
    }

    /**
     * Set how dividers should be shown between items in this layout. This method sets the
     * divider mode for both horizontally and vertically.
     *
     * @param dividerMode One or more of {@link #SHOW_DIVIDER_BEGINNING},
     *                    {@link #SHOW_DIVIDER_MIDDLE}, or {@link #SHOW_DIVIDER_END},
     *                    or {@link #SHOW_DIVIDER_NONE} to show no dividers.
     * @see #setShowDividerVertical(int)
     * @see #setShowDividerHorizontal(int)
     */
    public void setShowDivider(@DividerMode int dividerMode) {
        setShowDividerVertical(dividerMode);
        setShowDividerHorizontal(dividerMode);
    }

    /**
     * Set how vertical dividers should be shown between items in this layout
     *
     * @param dividerMode One or more of {@link #SHOW_DIVIDER_BEGINNING},
     *                    {@link #SHOW_DIVIDER_MIDDLE}, or {@link #SHOW_DIVIDER_END},
     *                    or {@link #SHOW_DIVIDER_NONE} to show no dividers.
     * @see #setShowDivider(int)
     */
    public void setShowDividerVertical(@DividerMode int dividerMode) {
        if (dividerMode != mShowDividerVertical) {
            mShowDividerVertical = dividerMode;
            requestLayout();
        }
    }

    /**
     * Set how horizontal dividers should be shown between items in this layout.
     *
     * @param dividerMode One or more of {@link #SHOW_DIVIDER_BEGINNING},
     *                    {@link #SHOW_DIVIDER_MIDDLE}, or {@link #SHOW_DIVIDER_END},
     *                    or {@link #SHOW_DIVIDER_NONE} to show no dividers.
     * @see #setShowDivider(int)
     */
    public void setShowDividerHorizontal(@DividerMode int dividerMode) {
        if (dividerMode != mShowDividerHorizontal) {
            mShowDividerHorizontal = dividerMode;
            requestLayout();
        }
    }

    private void setWillNotDrawFlag() {
        if (mDividerDrawableHorizontal == null && mDividerDrawableVertical == null) {
            setWillNotDraw(true);
        } else {
            setWillNotDraw(false);
        }
    }

    /**
     * Check if a divider is needed before the view whose indices are passed as arguments.
     *
     * @param childAbsoluteIndex           the absolute index of the view to be judged
     * @param childRelativeIndexInFlexLine the relative index in the flex line where the view
     *                                     belongs
     * @return {@code true} if a divider is needed, {@code false} otherwise
     */
    private boolean hasDividerBeforeChildAtAlongMainAxis(int childAbsoluteIndex,
            int childRelativeIndexInFlexLine) {
        if (allViewsAreGoneBefore(childAbsoluteIndex, childRelativeIndexInFlexLine)) {
            if (isMainAxisDirectionHorizontal(mFlexDirection)) {
                return (mShowDividerVertical & SHOW_DIVIDER_BEGINNING) != 0;
            } else {
                return (mShowDividerHorizontal & SHOW_DIVIDER_BEGINNING) != 0;
            }
        } else {
            if (isMainAxisDirectionHorizontal(mFlexDirection)) {
                return (mShowDividerVertical & SHOW_DIVIDER_MIDDLE) != 0;
            } else {
                return (mShowDividerHorizontal & SHOW_DIVIDER_MIDDLE) != 0;
            }
        }
    }

    private boolean allViewsAreGoneBefore(int childAbsoluteIndex,
            int childRelativeIndexInFlexLine) {
        for (int i = 1; i <= childRelativeIndexInFlexLine; i++) {
            View view = getReorderedChildAt(childAbsoluteIndex - i);
            if (view != null && view.getVisibility() != View.GONE) {
                return false;
            }
        }
        return true;
    }

    /**
     * Check if a divider is needed before the flex line whose index is passed as an argument.
     *
     * @param flexLineIndex the index of the flex line to be checked
     * @return {@code true} if a divider is needed, {@code false} otherwise
     */
    private boolean hasDividerBeforeFlexLine(int flexLineIndex) {
        if (flexLineIndex < 0 || flexLineIndex >= mFlexLines.size()) {
            return false;
        }
        if (allFlexLinesAreDummyBefore(flexLineIndex)) {
            if (isMainAxisDirectionHorizontal(mFlexDirection)) {
                return (mShowDividerHorizontal & SHOW_DIVIDER_BEGINNING) != 0;
            } else {
                return (mShowDividerVertical & SHOW_DIVIDER_BEGINNING) != 0;
            }
        } else {
            if (isMainAxisDirectionHorizontal(mFlexDirection)) {
                return (mShowDividerHorizontal & SHOW_DIVIDER_MIDDLE) != 0;
            } else {
                return (mShowDividerVertical & SHOW_DIVIDER_MIDDLE) != 0;
            }
        }
    }

    private boolean allFlexLinesAreDummyBefore(int flexLineIndex) {
        for (int i = 0; i < flexLineIndex; i++) {
            if (mFlexLines.get(i).mItemCount > 0) {
                return false;
            }
        }
        return true;
    }

    /**
     * Check if a end divider is needed after the flex line whose index is passed as an argument.
     *
     * @param flexLineIndex the index of the flex line to be checked
     * @return {@code true} if a divider is needed, {@code false} otherwise
     */
    private boolean hasEndDividerAfterFlexLine(int flexLineIndex) {
        if (flexLineIndex < 0 || flexLineIndex >= mFlexLines.size()) {
            return false;
        }

        for (int i = flexLineIndex + 1; i < mFlexLines.size(); i++) {
            if (mFlexLines.get(i).mItemCount > 0) {
                return false;
            }
        }
        if (isMainAxisDirectionHorizontal(mFlexDirection)) {
            return (mShowDividerHorizontal & SHOW_DIVIDER_END) != 0;
        } else {
            return (mShowDividerVertical & SHOW_DIVIDER_END) != 0;
        }

    }

    /**
     * Per child parameters for children views of the {@link FlexboxLayout}.
     */
    public static class LayoutParams extends CommonLayoutParams {

        private static final int ORDER_DEFAULT = 1;

        private static final float FLEX_GROW_DEFAULT = 0f;

        private static final float FLEX_SHRINK_DEFAULT = 1f;

        public static final float FLEX_BASIS_PERCENT_DEFAULT = -1f;

        public static final int ALIGN_SELF_AUTO = -1;

        public static final int ALIGN_SELF_FLEX_START = ALIGN_ITEMS_FLEX_START;

        public static final int ALIGN_SELF_FLEX_END = ALIGN_ITEMS_FLEX_END;

        public static final int ALIGN_SELF_CENTER = ALIGN_ITEMS_CENTER;

        public static final int ALIGN_SELF_BASELINE = ALIGN_ITEMS_BASELINE;

        public static final int ALIGN_SELF_STRETCH = ALIGN_ITEMS_STRETCH;

        private static final int MAX_SIZE = Integer.MAX_VALUE & ViewCompat.MEASURED_SIZE_MASK;

        /**
         * This attribute can change the ordering of the children views are laid out.
         * By default, children are displayed and laid out in the same order as they appear in the
         * layout XML. If not specified, {@link #ORDER_DEFAULT} is set as a default value.
         */
        public int order = ORDER_DEFAULT;

        /**
         * This attribute determines how much this child will grow if positive free space is
         * distributed relative to the rest of other flex items included in the same flex line.
         * If not specified, {@link #FLEX_GROW_DEFAULT} is set as a default value.
         */
        public float flexGrow = FLEX_GROW_DEFAULT;

        /**
         * This attributes determines how much this child will shrink is negative free space is
         * distributed relative to the rest of other flex items included in the same flex line.
         * If not specified, {@link #FLEX_SHRINK_DEFAULT} is set as a default value.
         */
        public float flexShrink = FLEX_SHRINK_DEFAULT;

        /**
         * This attributes determines the alignment along the cross axis (perpendicular to the
         * main axis). The alignment in the same direction can be determined by the
         * {@link #mAlignItems} in the parent, but if this is set to other than
         * {@link #ALIGN_SELF_AUTO}, the cross axis alignment is overridden for this child.
         * The value needs to be one of the values in ({@link #ALIGN_SELF_AUTO},
         * {@link #ALIGN_SELF_STRETCH}, {@link #ALIGN_SELF_FLEX_START}, {@link
         * #ALIGN_SELF_FLEX_END}, {@link #ALIGN_SELF_CENTER}, or {@link #ALIGN_SELF_BASELINE}).
         * If not specified, {@link #ALIGN_SELF_AUTO} is set as a default value.
         */
        public int alignSelf = ALIGN_SELF_AUTO;

        /**
         * The initial flex item length in a fraction format relative to its parent.
         * The initial main size of this child View is trying to be expanded as the specified
         * fraction against the parent main size.
         * If this value is set, the length specified from layout_width
         * (or layout_height) is overridden by the calculated value from this attribute.
         * This attribute is only effective when the parent's MeasureSpec mode is
         * MeasureSpec.EXACTLY. The default value is {@link #FLEX_BASIS_PERCENT_DEFAULT}, which
         * means not set.
         */
        public float flexBasisPercent = FLEX_BASIS_PERCENT_DEFAULT;

        /**
         * This attribute determines the minimum width the child can shrink to.
         */
        public int minWidth;

        /**
         * This attribute determines the minimum height the child can shrink to.
         */
        public int minHeight;

        /**
         * This attribute determines the maximum width the child can expand to.
         */
        public int maxWidth = MAX_SIZE;

        /**
         * This attribute determines the maximum height the child can expand to.
         */
        public int maxHeight = MAX_SIZE;

        /**
         * This attribute forces a flex line wrapping. i.e. if this is set to {@code true} for a
         * flex item, the item will become the first item of the new flex line. (A wrapping happens
         * regardless of the flex items being processed in the the previous flex line)
         * This attribute is ignored if the flex_wrap attribute is set as nowrap.
         * The equivalent attribute isn't defined in the original CSS Flexible Box Module
         * specification, but having this attribute is useful for Android developers to flatten
         * the layouts when building a grid like layout or for a situation where developers want
         * to put a new flex line to make a semantic difference from the previous one, etc.
         */
        public boolean wrapBefore;

        public LayoutParams() {
            super();
        }

        public LayoutParams(ViewGroup.LayoutParams source) {
            super(source);
        }

        public LayoutParams(ViewGroup.MarginLayoutParams source) {
            super(source);
        }

        public LayoutParams(FrameLayout.LayoutParams source) {
            super(source);
        }

        public LayoutParams(CommonLayoutParams source) {
            super(source);
        }

        public LayoutParams(LayoutParams source) {
            super(source);

            this.order = source.order;
            this.flexGrow = source.flexGrow;
            this.flexShrink = source.flexShrink;
            this.wrapBefore = source.wrapBefore;
            this.alignSelf = source.alignSelf;
        }
    }

    /**
     * A class that is used for calculating the view order which view's indices and order
     * properties from Flexbox are taken into account.
     */
    private static class Order implements Comparable<Order> {

        /** {@link View}'s index */
        int index;

        /** order property in the Flexbox */
        int order;

        @Override
        public int compareTo(@NonNull Order another) {
            if (order != another.order) {
                return order - another.order;
            }
            return index - another.index;
        }

        @Override
        public String toString() {
            return "Order{" +
                    "order=" + order +
                    ", index=" + index +
                    '}';
        }
    }
}