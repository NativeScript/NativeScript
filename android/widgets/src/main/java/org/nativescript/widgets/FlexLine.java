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

import java.util.ArrayList;
import java.util.List;

/**
 * Holds properties related to a single flex line. This class is not expected to be changed outside
 * of the {@link FlexboxLayout}, thus only exposing the getter methods that may be useful for
 * other classes using the {@link FlexboxLayout}.
 */
public class FlexLine {

    FlexLine() {
    }

    /** @see {@link #getLeft()} */
    int mLeft = Integer.MAX_VALUE;

    /** @see {@link #getTop()} */
    int mTop = Integer.MAX_VALUE;

    /** @see {@link #getRight()} */
    int mRight = Integer.MIN_VALUE;

    /** @see {@link #getBottom()} */
    int mBottom = Integer.MIN_VALUE;

    /** @see {@link #getMainSize()} */
    int mMainSize;

    /**
     * The sum of the lengths of dividers along the main axis. This value should be lower or
     * than than the value of {@link #mMainSize}.
     */
    int mDividerLengthInMainSize;

    /** @see {@link #getCrossSize()} */
    int mCrossSize;

    /** @see {@link #getItemCount()} */
    int mItemCount;

    /** @see {@link #getTotalFlexGrow()} */
    float mTotalFlexGrow;

    /** @see {@link #getTotalFlexShrink()} */
    float mTotalFlexShrink;

    /**
     * The largest value of the individual child's baseline (obtained by View#getBaseline()
     * if the {@link FlexboxLayout#mAlignItems} value is not {@link FlexboxLayout#ALIGN_ITEMS_BASELINE}
     * or the flex direction is vertical, this value is not used.
     * If the alignment direction is from the bottom to top,
     * (e.g. flexWrap == FLEX_WRAP_WRAP_REVERSE and flexDirection == FLEX_DIRECTION_ROW)
     * store this value from the distance from the bottom of the view minus baseline.
     * (Calculated as view.getMeasuredHeight() - view.getBaseline - LayoutParams.bottomMargin)
     */
    int mMaxBaseline;

    /**
     * Store the indices of the children views whose alignSelf property is stretch.
     * The stored indices are the absolute indices including all children in the Flexbox,
     * not the relative indices in this flex line.
     */
    List<Integer> mIndicesAlignSelfStretch = new ArrayList<>();

    /**
     * @return the distance in pixels from the top edge of this view's parent
     * to the top edge of this FlexLine.
     */
    public int getLeft() {
        return mLeft;
    }

    /**
     * @return the distance in pixels from the top edge of this view's parent
     * to the top edge of this FlexLine.
     */
    public int getTop() {
        return mTop;
    }

    /**
     * @return the distance in pixels from the right edge of this view's parent
     * to the right edge of this FlexLine.
     */
    public int getRight() {
        return mRight;
    }

    /**
     * @return the distance in pixels from the bottom edge of this view's parent
     * to the bottom edge of this FlexLine.
     */
    public int getBottom() {
        return mBottom;
    }

    /**
     * @return the size of the flex line in pixels along the main axis of the flex container.
     */
    public int getMainSize() {
        return mMainSize;
    }

    /**
     * @return the size of the flex line in pixels along the cross axis of the flex container.
     */
    public int getCrossSize() {
        return mCrossSize;
    }

    /**
     * @return the count of the views contained in this flex line.
     */
    public int getItemCount() {
        return mItemCount;
    }

    /**
     * @return the sum of the flexGrow properties of the children included in this flex line
     */
    public float getTotalFlexGrow() {
        return mTotalFlexGrow;
    }

    /**
     * @return the sum of the flexShrink properties of the children included in this flex line
     */
    public float getTotalFlexShrink() {
        return mTotalFlexShrink;
    }
}
