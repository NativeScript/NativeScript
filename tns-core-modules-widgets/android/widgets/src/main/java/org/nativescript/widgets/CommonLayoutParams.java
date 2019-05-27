/**
 *
 */
package org.nativescript.widgets;

import android.annotation.SuppressLint;
import android.content.Context;
import android.content.pm.ApplicationInfo;
import android.content.pm.PackageManager.NameNotFoundException;
import android.util.Log;
import android.view.Gravity;
import android.view.View;
import android.view.View.MeasureSpec;
import android.view.ViewGroup;
import android.view.ViewGroup.LayoutParams;
import android.widget.FrameLayout;

/**
 * @author hhristov
 */
public class CommonLayoutParams extends FrameLayout.LayoutParams {

    static final String TAG = "NSLayout";
    static int debuggable = -1;
    private static final int NOT_SET = Integer.MIN_VALUE;
    private static final StringBuilder sb = new StringBuilder();

    public CommonLayoutParams() {
        super(LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT, Gravity.FILL);
    }

    public CommonLayoutParams(ViewGroup.LayoutParams source) {
        super(source);
    }

    public CommonLayoutParams(ViewGroup.MarginLayoutParams source) {
        super(source);
    }

    public CommonLayoutParams(FrameLayout.LayoutParams source) {
        super((ViewGroup.MarginLayoutParams) source);
        this.gravity = source.gravity;
    }

    public CommonLayoutParams(CommonLayoutParams source) {
        this((FrameLayout.LayoutParams) source);

        this.widthPercent = source.widthPercent;
        this.heightPercent = source.heightPercent;

        this.topMargin = source.topMargin;
        this.leftMargin = source.leftMargin;
        this.bottomMargin = source.bottomMargin;
        this.rightMargin = source.rightMargin;

        this.left = source.left;
        this.top = source.top;
        this.row = source.row;
        this.column = source.column;
        this.rowSpan = source.rowSpan;
        this.columnSpan = source.columnSpan;
        this.dock = source.dock;
    }

    public float widthPercent = 0;
    public float heightPercent = 0;

    public float topMarginPercent = 0;
    public float leftMarginPercent = 0;
    public float bottomMarginPercent = 0;
    public float rightMarginPercent = 0;

    public int widthOriginal = NOT_SET;
    public int heightOriginal = NOT_SET;

    public int topMarginOriginal = NOT_SET;
    public int leftMarginOriginal = NOT_SET;
    public int bottomMarginOriginal = NOT_SET;
    public int rightMarginOriginal = NOT_SET;

    public int left = 0;
    public int top = 0;
    public int row = 0;
    public int column = 0;
    public int rowSpan = 1;
    public int columnSpan = 1;
    public Dock dock = Dock.left;

    protected static int getDesiredWidth(View view) {
        CommonLayoutParams lp = (CommonLayoutParams) view.getLayoutParams();
        return view.getMeasuredWidth() + lp.leftMargin + lp.rightMargin;
    }

    protected static int getDesiredHeight(View view) {
        CommonLayoutParams lp = (CommonLayoutParams) view.getLayoutParams();
        return view.getMeasuredHeight() + lp.topMargin + lp.bottomMargin;
    }

    // We use our own layout method because the one in FrameLayout is broken when margins are set and gravity is CENTER_VERTICAL or CENTER_HORIZONTAL.
    @SuppressLint("RtlHardcoded")
    protected static void layoutChild(View child, int left, int top, int right, int bottom) {
        if (child == null || child.getVisibility() == View.GONE) {
            return;
        }

        int childTop = 0;
        int childLeft = 0;

        int childWidth = child.getMeasuredWidth();
        int childHeight = child.getMeasuredHeight();

        CommonLayoutParams lp = (CommonLayoutParams) child.getLayoutParams();
        int gravity = lp.gravity;
        if (gravity == -1) {
            gravity = Gravity.FILL;
        }

        int verticalGravity = gravity & Gravity.VERTICAL_GRAVITY_MASK;

        // If we have explicit height and gravity is FILL we need to be centered otherwise our explicit height won't be taken into account.
        if ((lp.height >= 0 || lp.heightPercent > 0) && verticalGravity == Gravity.FILL_VERTICAL) {
            verticalGravity = Gravity.CENTER_VERTICAL;
        }

        switch (verticalGravity) {
            case Gravity.TOP:
                childTop = top + lp.topMargin;
                break;

            case Gravity.CENTER_VERTICAL:
                childTop = top + (bottom - top - childHeight + lp.topMargin - lp.bottomMargin) / 2;
                break;

            case Gravity.BOTTOM:
                childTop = bottom - childHeight - lp.bottomMargin;
                break;

            case Gravity.FILL_VERTICAL:
            default:
                childTop = top + lp.topMargin;
                childHeight = bottom - top - (lp.topMargin + lp.bottomMargin);
                break;
        }

        int horizontalGravity = Gravity.getAbsoluteGravity(gravity, child.getLayoutDirection()) & Gravity.HORIZONTAL_GRAVITY_MASK;

        // If we have explicit width and gravity is FILL we need to be centered otherwise our explicit width won't be taken into account.
        if ((lp.width >= 0 || lp.widthPercent > 0) && horizontalGravity == Gravity.FILL_HORIZONTAL) {
            horizontalGravity = Gravity.CENTER_HORIZONTAL;
        }

        switch (horizontalGravity) {
            case Gravity.LEFT:
                childLeft = left + lp.leftMargin;
                break;

            case Gravity.CENTER_HORIZONTAL:
                childLeft = left + (right - left - childWidth + lp.leftMargin - lp.rightMargin) / 2;
                break;

            case Gravity.RIGHT:
                childLeft = right - childWidth - lp.rightMargin;
                break;

            case Gravity.FILL_HORIZONTAL:
            default:
                childLeft = left + lp.leftMargin;
                childWidth = right - left - (lp.leftMargin + lp.rightMargin);
                break;
        }

        int childRight = Math.round(childLeft + childWidth);
        int childBottom = Math.round(childTop + childHeight);
        childLeft = Math.round(childLeft);
        childTop = Math.round(childTop);

        // Re-measure TextView because it is not centered if layout width is larger than measure width.
        if (child instanceof android.widget.TextView) {

            boolean canChangeWidth = lp.width < 0;
            boolean canChangeHeight = lp.height < 0;

            int measuredWidth = child.getMeasuredWidth();
            int measuredHeight = child.getMeasuredHeight();

            int width = childRight - childLeft;
            int height = childBottom - childTop;
            if ((Math.abs(measuredWidth - width) > 1 && canChangeWidth) || (Math.abs(measuredHeight - height) > 1 && canChangeHeight)) {
                int widthMeasureSpec = MeasureSpec.makeMeasureSpec(canChangeWidth ? width : lp.width, MeasureSpec.EXACTLY);
                int heightMeasureSpec = MeasureSpec.makeMeasureSpec(canChangeHeight ? height : lp.height, MeasureSpec.EXACTLY);
                if (debuggable > 0) {
                    sb.setLength(0);
                    sb.append("remeasure ");
                    sb.append(child);
                    sb.append(" with ");
                    sb.append(MeasureSpec.toString(widthMeasureSpec));
                    sb.append(", ");
                    sb.append(MeasureSpec.toString(heightMeasureSpec));
                    log(TAG, sb.toString());
                }

                child.measure(widthMeasureSpec, heightMeasureSpec);
            }
        }

        if (debuggable > 0) {
            sb.setLength(0);
            sb.append(child.getParent().toString());
            sb.append(" :layoutChild: ");
            sb.append(child.toString());
            sb.append(" ");
            sb.append(childLeft);
            sb.append(", ");
            sb.append(childTop);
            sb.append(", ");
            sb.append(childRight);
            sb.append(", ");
            sb.append(childBottom);
            log(TAG, sb.toString());
        }

        child.layout(childLeft, childTop, childRight, childBottom);
    }

    protected static void measureChild(View child, int widthMeasureSpec, int heightMeasureSpec) {
        if (child == null || child.getVisibility() == View.GONE) {
            return;
        }

        // Negative means not initialized.
        if (debuggable < 0) {
            try {
                Context context = child.getContext();
                ApplicationInfo ai = context.getPackageManager().getApplicationInfo(context.getPackageName(), android.content.pm.PackageManager.GET_META_DATA);
                android.os.Bundle bundle = ai.metaData;
                Boolean debugLayouts = bundle != null ? bundle.getBoolean("debugLayouts", false) : false;
                debuggable = debugLayouts ? 1 : 0;
            } catch (NameNotFoundException e) {
                debuggable = 0;
                Log.e(TAG, "Failed to load meta-data, NameNotFound: " + e.getMessage());
            } catch (NullPointerException e) {
                debuggable = 0;
                Log.e(TAG, "Failed to load meta-data, NullPointer: " + e.getMessage());
            }
        }

        int childWidthMeasureSpec = getMeasureSpec(child, widthMeasureSpec, true);
        int childHeightMeasureSpec = getMeasureSpec(child, heightMeasureSpec, false);

        if (debuggable > 0) {
            sb.setLength(0);
            sb.append(child.getParent().toString());
            sb.append(" :measureChild: ");
            sb.append(child.toString());
            sb.append(" ");
            sb.append(MeasureSpec.toString(childWidthMeasureSpec));
            sb.append(", ");
            sb.append(MeasureSpec.toString(childHeightMeasureSpec));
            log(TAG, sb.toString());
        }

        child.measure(childWidthMeasureSpec, childHeightMeasureSpec);
    }

    /**
     * Iterates over children and changes their width and height to one calculated from percentage
     * values.
     *
     * @param viewGroup         The parent ViewGroup.
     * @param widthMeasureSpec  Width MeasureSpec of the parent ViewGroup.
     * @param heightMeasureSpec Height MeasureSpec of the parent ViewGroup.
     */
    protected static void adjustChildrenLayoutParams(ViewGroup viewGroup, int widthMeasureSpec, int heightMeasureSpec) {

        int availableWidth = MeasureSpec.getSize(widthMeasureSpec);
        int widthSpec = MeasureSpec.getMode(widthMeasureSpec);

        int availableHeight = MeasureSpec.getSize(heightMeasureSpec);
        int heightSpec = MeasureSpec.getMode(heightMeasureSpec);

        for (int i = 0, count = viewGroup.getChildCount(); i < count; i++) {
            View child = viewGroup.getChildAt(i);
            LayoutParams params = child.getLayoutParams();

            if (params instanceof CommonLayoutParams) {
                CommonLayoutParams lp = (CommonLayoutParams) child.getLayoutParams();
                if (widthSpec != MeasureSpec.UNSPECIFIED) {
                    if (lp.widthPercent > 0) {
                        // If we get measured twice we will override the original value with the one calculated from percentValue from the first measure.
                        // So we set originalValue only the first time.
                        if (lp.widthOriginal == NOT_SET) {
                            lp.widthOriginal = lp.width;
                        }
                        lp.width = (int) (availableWidth * lp.widthPercent);
                    }
                    else {
                        lp.widthOriginal = NOT_SET;
                    }

                    if (lp.leftMarginPercent > 0) {
                        if (lp.leftMarginOriginal == NOT_SET) {
                            lp.leftMarginOriginal = lp.leftMargin;
                        }
                        lp.leftMargin = (int) (availableWidth * lp.leftMarginPercent);
                    }
                    else {
                        lp.leftMarginOriginal = NOT_SET;
                    }

                    if (lp.rightMarginPercent > 0) {
                        if (lp.rightMarginOriginal == NOT_SET) {
                            lp.rightMarginOriginal = lp.rightMargin;
                        }
                        lp.rightMargin = (int) (availableWidth * lp.rightMarginPercent);
                    }
                    else {
                        lp.rightMarginOriginal = NOT_SET;
                    }
                }

                if (heightSpec != MeasureSpec.UNSPECIFIED) {
                    if (lp.heightPercent > 0) {
                        if (lp.heightOriginal == NOT_SET) {
                            lp.heightOriginal = lp.height;
                        }
                        lp.height = (int) (availableHeight * lp.heightPercent);
                    }
                    else {
                        lp.heightOriginal = NOT_SET;
                    }

                    if (lp.topMarginPercent > 0) {
                        if (lp.topMarginOriginal == NOT_SET) {
                            lp.topMarginOriginal = lp.topMargin;
                        }
                        lp.topMargin = (int) (availableHeight * lp.topMarginPercent);
                    }
                    else {
                        lp.topMarginOriginal = NOT_SET;
                    }

                    if (lp.bottomMarginPercent > 0) {
                        if (lp.bottomMarginOriginal == NOT_SET) {
                            lp.bottomMarginOriginal = lp.bottomMargin;
                        }
                        lp.bottomMargin = (int) (availableHeight * lp.bottomMarginPercent);
                    }
                    else {
                        lp.bottomMarginOriginal = NOT_SET;
                    }
                }
            }
        }
    }

    /**
     * Iterates over children and restores their original dimensions that were changed for
     * percentage values.
     */
    protected static void restoreOriginalParams(ViewGroup viewGroup) {
        for (int i = 0, count = viewGroup.getChildCount(); i < count; i++) {
            View view = viewGroup.getChildAt(i);
            LayoutParams params = view.getLayoutParams();
            if (params instanceof CommonLayoutParams) {
                CommonLayoutParams lp = (CommonLayoutParams) params;
                if (lp.widthPercent > 0) {
                    lp.width = lp.widthOriginal;
                }
                if (lp.heightPercent > 0) {
                    lp.height = lp.heightOriginal;
                }
                if (lp.leftMarginPercent > 0) {
                    lp.leftMargin = lp.leftMarginOriginal;
                }
                if (lp.topMarginPercent > 0) {
                    lp.topMargin = lp.topMarginOriginal;
                }
                if (lp.rightMarginPercent > 0) {
                    lp.rightMargin = lp.rightMarginOriginal;
                }
                if (lp.bottomMarginPercent > 0) {
                    lp.bottomMargin = lp.bottomMarginOriginal;
                }

                lp.widthOriginal = NOT_SET;
                lp.heightOriginal = NOT_SET;
                lp.leftMarginOriginal = NOT_SET;
                lp.topMarginOriginal = NOT_SET;
                lp.rightMarginOriginal = NOT_SET;
                lp.bottomMarginOriginal = NOT_SET;
            }
        }
    }

    static void log(String tag, String message) {
        Log.v(tag, message);
    }

    static StringBuilder getStringBuilder() {
        sb.setLength(0);
        return sb;
    }

    private static int getMeasureSpec(View view, int parentMeasureSpec, boolean horizontal) {

        int parentLength = MeasureSpec.getSize(parentMeasureSpec);
        int parentSpecMode = MeasureSpec.getMode(parentMeasureSpec);

        CommonLayoutParams lp = (CommonLayoutParams) view.getLayoutParams();
        final int margins = horizontal ? lp.leftMargin + lp.rightMargin : lp.topMargin + lp.bottomMargin;

        int resultSize = 0;
        int resultMode = MeasureSpec.UNSPECIFIED;

        int measureLength = Math.max(0, parentLength - margins);
        int childLength = horizontal ? lp.width : lp.height;

        // We want a specific size... let be it.
        if (childLength >= 0) {
            if (parentSpecMode != MeasureSpec.UNSPECIFIED) {
                resultSize = Math.min(parentLength, childLength);
            } else {
                resultSize = childLength;
            }

            resultMode = MeasureSpec.EXACTLY;
        } else {
            switch (parentSpecMode) {
                // Parent has imposed an exact size on us
                case MeasureSpec.EXACTLY:
                    resultSize = measureLength;
                    int gravity = LayoutBase.getGravity(view);
                    boolean stretched;
                    if (horizontal) {
                        final int horizontalGravity = Gravity.getAbsoluteGravity(gravity, view.getLayoutDirection()) & Gravity.HORIZONTAL_GRAVITY_MASK;
                        stretched = horizontalGravity == Gravity.FILL_HORIZONTAL;
                    } else {
                        final int verticalGravity = gravity & Gravity.VERTICAL_GRAVITY_MASK;
                        stretched = verticalGravity == Gravity.FILL_VERTICAL;
                    }

                    // if stretched - view wants to be our size. So be it.
                    // else - view wants to determine its own size. It can't be bigger than us.
                    resultMode = stretched ? MeasureSpec.EXACTLY : MeasureSpec.AT_MOST;
                    break;

                // Parent has imposed a maximum size on us
                case MeasureSpec.AT_MOST:
                    resultSize = measureLength;
                    resultMode = MeasureSpec.AT_MOST;
                    break;

                case MeasureSpec.UNSPECIFIED:
                    resultSize = 0;
                    resultMode = MeasureSpec.UNSPECIFIED;
                    break;
            }
        }

        return MeasureSpec.makeMeasureSpec(resultSize, resultMode);
    }
}