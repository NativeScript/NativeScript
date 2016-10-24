import {
    FlexDirection,
    FlexWrap,
    JustifyContent,
    AlignItems,
    AlignContent,
    AlignSelf,
    FlexboxLayoutBase,
    FlexBasisPercent
} from "./flexbox-layout-common";

export * from "./flexbox-layout-common";

import {CommonLayoutParams, nativeLayoutParamsProperty} from "ui/styling/style";
import {LayoutBase} from "ui/layouts/layout-base";
import {View} from "ui/core/view";
import * as utils from "utils/utils";
import * as enums from "ui/enums";

import EXACTLY = utils.layout.EXACTLY;
import AT_MOST = utils.layout.AT_MOST;
import UNSPECIFIED = utils.layout.UNSPECIFIED;

import MEASURED_SIZE_MASK = utils.layout.MEASURED_SIZE_MASK;
import MEASURED_STATE_TOO_SMALL = utils.layout.MEASURED_STATE_TOO_SMALL;

const MATCH_PARENT = -1;
const WRAP_CONTENT = -2;

const View_sUseZeroUnspecifiedMeasureSpec = true; // NOTE: android version < M

// Long ints may not be safe in JavaScript
const MAX_SIZE = 0x00FFFFFF  & MEASURED_SIZE_MASK;

import makeMeasureSpec = utils.layout.makeMeasureSpec;
import getMeasureSpecMode = utils.layout.getMeasureSpecMode;
import getMeasureSpecSize = utils.layout.getMeasureSpecSize;

class FlexLine {

    _left: number = Number.MAX_VALUE;
    _top: number = Number.MAX_VALUE;
    _right: number = Number.MAX_VALUE;
    _bottom: number = Number.MAX_VALUE;

    _mainSize: number = 0;
    _dividerLengthInMainSize = 0;
    _crossSize: number = 0;
    _itemCount: number = 0;
    _totalFlexGrow: number = 0;
    _totalFlexShrink: number = 0;
    _maxBaseline: number = 0;

    _indicesAlignSelfStretch: number[] = [];

    get left(): number { return this._left; }
    get top(): number { return this._top; }
    get right(): number { return this._right; }
    get bottom(): number { return this._bottom; }

    get mainSize(): number { return this._mainSize; }
    get crossSize(): number { return this._crossSize; }
    get itemCount(): number { return this._itemCount; }
    get totalFlexGrow(): number { return this._totalFlexGrow; }
    get totalFlexShrink(): number { return this._totalFlexShrink; }
}

class Order {
    index: number;
    order: number;

    public compareTo(another: Order): number {
        if (this.order !== another.order) {
            return this.order - another.order;
        }
        return this.index - another.index;
    }
}

export class FlexboxLayout extends FlexboxLayoutBase {

    // Omit divider

    private _reorderedIndices: number[];

    private _orderCache: number[];
    private _flexLines: FlexLine[] = [];
    private _childrenFrozen: boolean[];

    protected invalidate() {
        this.requestLayout();
    }

    protected setNativeFlexDirection(flexDirection: FlexDirection) {
        // lint happy no-op
    }
    protected setNativeFlexWrap(flexWrap: FlexWrap) {
        // lint happy no-op
    }
    protected setNativeJustifyContent(justifyContent: JustifyContent) {
        // lint happy no-op
    }
    protected setNativeAlignItems(alignItems: AlignItems) {
        // lint happy no-op
    }
    protected setNativeAlignContent(alignContent: AlignContent) {
        // lint happy no-op
    }

    public onMeasure(widthMeasureSpec: number, heightMeasureSpec: number): void {
        LayoutBase.adjustChildrenLayoutParams(this, widthMeasureSpec, heightMeasureSpec);

        // Omit: super.onMeasure(widthMeasureSpec, heightMeasureSpec);

        if (this._isOrderChangedFromLastMeasurement) {
            this._reorderedIndices = this._createReorderedIndices();
        }
        if (!this._childrenFrozen || this._childrenFrozen.length < this.getChildrenCount()) {
            this._childrenFrozen = new Array(this.getChildrenCount());
        }

        switch(this.flexDirection) {
            case FlexDirection.ROW:
            case FlexDirection.ROW_REVERSE:
                this._measureHorizontal(widthMeasureSpec, heightMeasureSpec);
                break;
            case FlexDirection.COLUMN:
            case FlexDirection.COLUMN_REVERSE:
                this._measureVertical(widthMeasureSpec, heightMeasureSpec);
                break;
            default:
                throw new Error("Invalid value for the flex direction is set: " + this.flexDirection);
        }

        this._childrenFrozen.length = 0;
    }

    private _getReorderedChildAt(index: number): View {
        let child: View;
        if (index < 0 || index >= this._reorderedIndices.length) {
            child = null;
        } else {
            let reorderedIndex = this._reorderedIndices[index];
            child = this.getChildAt(reorderedIndex);
        }
        return child;
    }

    public addChild(child: View) {
        let index = this.getChildrenCount(); // Goes last
        this._reorderedIndices = this._createReorderedIndices(child, index, FlexboxLayout.getLayoutParams(child));
        super.addChild(child);
    }

    public insertChild(child: View, index: number): void {
        this._reorderedIndices = this._createReorderedIndices(child, index, FlexboxLayout.getLayoutParams(child));
        super.addChild(child);
    }

    private _createReorderedIndices(viewBeforeAdded: View, indexForViewBeforeAdded: number, paramsForViewBeforeAdded: FlexboxLayout.LayoutParams): number[];
    private _createReorderedIndices(): number[];
    private _createReorderedIndices(viewBeforeAdded?: View, indexForViewBeforeAdded?: number, paramsForViewBeforeAdded?: FlexboxLayout.LayoutParams) {
        if (arguments.length === 0) {
            let childCount = this.getChildrenCount();
            let orders = this._createOrders(childCount);
            return this._sortOrdersIntoReorderedIndices(childCount, orders);
        } else {
            let childCount: number = this.getChildrenCount();
            let orders = this._createOrders(childCount);
            let orderForViewToBeAdded = new Order();
            if (viewBeforeAdded !== null) {
                orderForViewToBeAdded.order = paramsForViewBeforeAdded.order;
            } else {
                orderForViewToBeAdded.order = 1 /* Default order */;
            }

            if (indexForViewBeforeAdded === -1 || indexForViewBeforeAdded === childCount) {
                orderForViewToBeAdded.index = childCount;
            } else if (indexForViewBeforeAdded) {
                orderForViewToBeAdded.index = indexForViewBeforeAdded;
                for (let i = indexForViewBeforeAdded; i < childCount; i++) {
                    orders[i].index++;
                }
            } else {
                orderForViewToBeAdded.index = childCount;
            }
            orders.push(orderForViewToBeAdded);

            return this._sortOrdersIntoReorderedIndices(childCount + 1, orders);
        }
    }

    private _sortOrdersIntoReorderedIndices(childCount: number, orders: Order[]): number[] {
        orders.sort((a, b) => a.compareTo(b));
        if (!this._orderCache) {
            this._orderCache = [];
        }

        this._orderCache.length = 0;
        let reorderedIndices: number[] = [];
        orders.forEach((order, i) => {
            reorderedIndices[i] = order.index;
            this._orderCache[i] = order.order;
        });
        return reorderedIndices;
    }

    private _createOrders(childCount: number): Order[] {
        let orders: Order[] = [];
        for (let i = 0; i < childCount; i++) {
            let child = this.getChildAt(i);
            let params = FlexboxLayout.getLayoutParams(child);
            let order = new Order();
            order.order = params.order;
            order.index = i;
            orders.push(order);
        }
        return orders;
    }

    private get _isOrderChangedFromLastMeasurement(): boolean {
        let childCount = this.getChildrenCount();
        if (this._orderCache === null) {
            this._orderCache = [];
        }
        if (this._orderCache.length !== childCount) {
            return true;
        }
        for (let i = 0; i < childCount; i++) {
            let view = this.getChildAt(i);
            if (view === null) {
                continue;
            }
            let lp = FlexboxLayout.getLayoutParams(view);
            if (lp.order !== this._orderCache[i]) {
                return true;
            }
        }
        return false;
    }

    private _measureHorizontal(widthMeasureSpec: number, heightMeasureSpec: number): void {
        let widthMode = getMeasureSpecMode(widthMeasureSpec);
        let widthSize = getMeasureSpecSize(widthMeasureSpec);
        let childState = 0;

        this._flexLines.length = 0;

        (() => {
            let childCount = this.getChildrenCount();
            let paddingStart = FlexboxLayout.getPaddingStart(this);
            let paddingEnd = FlexboxLayout.getPaddingEnd(this);
            let largestHeightInRow = Number.MIN_VALUE;
            let flexLine = new FlexLine();

            let indexInFlexLine = 0;
            flexLine._mainSize = paddingStart + paddingEnd;
            for (let i = 0; i < childCount; i++) {
                let child = this._getReorderedChildAt(i);
                if (child === null) {
                    this._addFlexLineIfLastFlexItem(i, childCount, flexLine);
                    continue;
                } else if (FlexboxLayout.isGone(child)) {
                    flexLine._itemCount++;
                    this._addFlexLineIfLastFlexItem(i, childCount, flexLine);
                    continue;
                }

                let lp: FlexboxLayout.LayoutParams = FlexboxLayout.getLayoutParams(child);
                if (lp.alignSelf === AlignSelf.STRETCH) {
                    flexLine._indicesAlignSelfStretch.push(i);
                }

                let childWidth = lp.width;
                if (lp.flexBasisPercent !== FlexBasisPercent.DEFAULT && widthMode === EXACTLY) {
                    childWidth = Math.round(widthSize * lp.flexBasisPercent);
                }

                let childWidthMeasureSpec = FlexboxLayout.getChildMeasureSpec(widthMeasureSpec,
                    this.paddingLeft + this.paddingRight + lp.leftMargin
                        + lp.rightMargin, childWidth < 0 ? WRAP_CONTENT : childWidth);

                let childHeightMeasureSpec = FlexboxLayout.getChildMeasureSpec(heightMeasureSpec,
                    this.paddingTop + this.paddingBottom + lp.topMargin
                        + lp.bottomMargin, lp.height < 0 ? WRAP_CONTENT : lp.height);

                child.measure(childWidthMeasureSpec, childHeightMeasureSpec);

                this._checkSizeConstraints(child);

                childState = View.combineMeasuredStates(childState, child.getMeasuredState());
                largestHeightInRow = Math.max(largestHeightInRow,
                    child.getMeasuredHeight() + lp.topMargin + lp.bottomMargin);

                if (this._isWrapRequired(widthMode, widthSize, flexLine._mainSize,
                        child.getMeasuredWidth() + lp.leftMargin + lp.rightMargin, lp,
                        i, indexInFlexLine)) {
                    if (flexLine.itemCount > 0) {
                        this._addFlexLine(flexLine);
                    }

                    flexLine = new FlexLine();
                    flexLine._itemCount = 1;
                    flexLine._mainSize = paddingStart + paddingEnd;
                    largestHeightInRow = child.getMeasuredHeight() + lp.topMargin + lp.bottomMargin;
                    indexInFlexLine = 0;
                } else {
                    flexLine._itemCount++;
                    indexInFlexLine++;
                }
                flexLine._mainSize += child.getMeasuredWidth() + lp.leftMargin + lp.rightMargin;
                flexLine._totalFlexGrow += lp.flexGrow;
                flexLine._totalFlexShrink += lp.flexShrink;

                flexLine._crossSize = Math.max(flexLine._crossSize, largestHeightInRow);

                // Omit divider

                if (this.flexWrap !== FlexWrap.WRAP_REVERSE) {
                    flexLine._maxBaseline = Math.max(flexLine._maxBaseline, FlexboxLayout.getBaseline(child) + lp.topMargin)
                } else {
                    flexLine._maxBaseline = Math.max(flexLine._maxBaseline, child.getMeasuredHeight() - FlexboxLayout.getBaseline(child) + lp.bottomMargin);
                }
                this._addFlexLineIfLastFlexItem(i, childCount, flexLine);
            }
        })();

        this._determineMainSize(this.flexDirection, widthMeasureSpec, heightMeasureSpec);

        if (this.alignItems === AlignItems.BASELINE) {
            let viewIndex = 0;
            this._flexLines.forEach(flexLine => {
                let largestHeightInLine = Number.MIN_VALUE;
                for (let i = viewIndex; i < viewIndex + flexLine._itemCount; i++) {
                    let child = this._getReorderedChildAt(i);
                    let lp = FlexboxLayout.getLayoutParams(child);
                    if (this.flexWrap !== FlexWrap.WRAP_REVERSE) {
                        let marginTop = flexLine._maxBaseline - FlexboxLayout.getBaseline(child);
                        marginTop = Math.max(marginTop, lp.topMargin);
                        largestHeightInLine = Math.max(largestHeightInLine, child.getActualSize().height + marginTop + lp.bottomMargin);
                    } else {
                        let marginBottom = flexLine._maxBaseline - child.getMeasuredHeight() + FlexboxLayout.getBaseline(child);
                        marginBottom = Math.max(marginBottom, lp.bottomMargin);
                        largestHeightInLine = Math.max(largestHeightInLine, child.getActualSize().height + lp.topMargin + marginBottom);
                    }
                }
                flexLine._crossSize = largestHeightInLine;
                viewIndex += flexLine.itemCount;
            });
        }

        this._determineCrossSize(this.flexDirection, widthMeasureSpec, heightMeasureSpec, this.paddingTop + this.paddingBottom);
        this._stretchViews(this.flexDirection, this.alignItems);
        this._setMeasuredDimensionForFlex(this.flexDirection, widthMeasureSpec, heightMeasureSpec, childState);
    }

    private _measureVertical(widthMeasureSpec, heightMeasureSpec): void {
        let heightMode = getMeasureSpecMode(heightMeasureSpec);
        let heightSize = getMeasureSpecSize(heightMeasureSpec);
        let childState = 0;

        this._flexLines.length = 0;

        let childCount = this.getChildrenCount();
        let paddingTop = this.paddingTop;
        let paddingBottom = this.paddingBottom;
        let largestWidthInColumn = Number.MIN_VALUE;
        let flexLine = new FlexLine();
        flexLine._mainSize = paddingTop + paddingBottom;

        let indexInFlexLine = 0;
        for(let i = 0; i < childCount; i++) {
            let child = this._getReorderedChildAt(i);
            if (child === null) {
                this._addFlexLineIfLastFlexItem(i, childCount, flexLine);
                continue;
            } else if (FlexboxLayout.isGone(child)) {
                flexLine._itemCount++;
                this._addFlexLineIfLastFlexItem(i, childCount, flexLine);
                continue;
            }

            let lp = FlexboxLayout.getLayoutParams(child);
            if (lp.alignSelf === AlignSelf.STRETCH) {
                flexLine._indicesAlignSelfStretch.push(i);
            }

            let childHeight = lp.height;
            if (lp.flexBasisPercent !== FlexBasisPercent.DEFAULT && heightMode === EXACTLY) {
                childHeight = Math.round(heightSize * lp.flexBasisPercent);
            }

            let childWidthMeasureSpec = FlexboxLayout.getChildMeasureSpec(widthMeasureSpec,
                this.paddingLeft + this.paddingRight + lp.leftMargin
                    + lp.rightMargin, lp.width < 0 ? WRAP_CONTENT : lp.width);
            let childHeightMeasureSpec = FlexboxLayout.getChildMeasureSpec(heightMeasureSpec,
                this.paddingTop + this.paddingBottom + lp.topMargin
                    + lp.bottomMargin, childHeight < 0 ? WRAP_CONTENT : childHeight);
            child.measure(childWidthMeasureSpec, childHeightMeasureSpec);

            this._checkSizeConstraints(child);

            childState = View.combineMeasuredStates(childState, child.getMeasuredState());
            largestWidthInColumn = Math.max(largestWidthInColumn,
                child.getMeasuredWidth() + lp.leftMargin + lp.rightMargin);
            
            if (this._isWrapRequired(heightMode, heightSize, flexLine.mainSize,
                child.getMeasuredHeight() + lp.topMargin + lp.bottomMargin, lp,
                i, indexInFlexLine)) {

                if (flexLine._itemCount > 0) {
                    this._addFlexLine(flexLine);
                }

                flexLine = new FlexLine();
                flexLine._itemCount = 1;
                flexLine._mainSize = paddingTop + paddingBottom;
                largestWidthInColumn = child.getMeasuredWidth() + lp.leftMargin + lp.rightMargin;
                indexInFlexLine = 0;
            } else {
                flexLine._itemCount++;
                indexInFlexLine++;
            }

            flexLine._mainSize += child.getMeasuredHeight() + lp.topMargin + lp.bottomMargin;
            flexLine._totalFlexGrow += lp.flexGrow;
            flexLine._totalFlexShrink += lp.flexShrink;

            flexLine._crossSize = Math.max(flexLine._crossSize, largestWidthInColumn);

            // Omit divider
            this._addFlexLineIfLastFlexItem(i, childCount, flexLine);
        }

        this._determineMainSize(this.flexDirection, widthMeasureSpec, heightMeasureSpec);
        this._determineCrossSize(this.flexDirection, widthMeasureSpec, heightMeasureSpec, this.paddingLeft + this.paddingRight);
        this._stretchViews(this.flexDirection, this.alignItems);
        this._setMeasuredDimensionForFlex(this.flexDirection, widthMeasureSpec, heightMeasureSpec, childState);
    }

    private _checkSizeConstraints(view: View) {
        let needsMeasure = false;
        let lp = FlexboxLayout.getLayoutParams(view);
        let childWidth = view.getMeasuredWidth();
        let childHeight = view.getMeasuredHeight();

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
            view.measure(makeMeasureSpec(childWidth, EXACTLY), makeMeasureSpec(childHeight, EXACTLY));
        }
    }

    private _addFlexLineIfLastFlexItem(childIndex: number, childCount: number, flexLine: FlexLine) {
        if (childIndex === childCount - 1 && flexLine.itemCount !== 0) {
            this._addFlexLine(flexLine);
        }
    }

    private _addFlexLine(flexLine: FlexLine) {
        // Omit divider
        this._flexLines.push(flexLine);
    }

    private _determineMainSize(flexDirection: FlexDirection, widthMeasureSpec: number, heightMeasureSpec: number) {
        let mainSize: number;
        let paddingAlongMainAxis: number;

        switch(flexDirection) {
            case FlexDirection.ROW:
            case FlexDirection.ROW_REVERSE:
                let widthMode = getMeasureSpecMode(widthMeasureSpec);
                let widthSize = getMeasureSpecSize(widthMeasureSpec);
                if (widthMode === EXACTLY) {
                    mainSize = widthSize;
                } else {
                    mainSize = this._getLargestMainSize();
                }
                paddingAlongMainAxis = this.paddingLeft + this.paddingRight;
                break;
            case FlexDirection.COLUMN:
            case FlexDirection.COLUMN_REVERSE:
                let heightMode = getMeasureSpecMode(heightMeasureSpec);
                let heightSize = getMeasureSpecSize(heightMeasureSpec);
                if (heightMode === EXACTLY) {
                    mainSize = heightSize;
                } else {
                    mainSize = this._getLargestMainSize();
                }
                paddingAlongMainAxis = this.paddingTop + this.paddingBottom;
                break;
            default:
                throw new Error("Invalid flex direction: " + flexDirection);
        }

        let childIndex = 0;
        this._flexLines.forEach(flexLine => {
            if (flexLine.mainSize < mainSize) {
                childIndex = this._expandFlexItems(flexLine, flexDirection, mainSize, paddingAlongMainAxis, childIndex);
            } else {
                childIndex = this._shrinkFlexItems(flexLine, flexDirection, mainSize, paddingAlongMainAxis, childIndex);
            }
        });
    }

    private _expandFlexItems(flexLine: FlexLine, flexDirection: FlexDirection, maxMainSize: number, paddingAlongMainAxis: number, startIndex: number) {
        let childIndex = startIndex;
        if (flexLine._totalFlexGrow <= 0 || maxMainSize < flexLine._mainSize) {
            childIndex += flexLine._itemCount;
            return childIndex;
        }
        let sizeBeforeExpand = flexLine._mainSize;
        let needsReexpand = false;
        let pendingSpace = maxMainSize - flexLine._mainSize;
        let unitSpace = pendingSpace / flexLine._totalFlexGrow;
        flexLine._mainSize = paddingAlongMainAxis + flexLine._dividerLengthInMainSize;
        let accumulatedRoundError = 0;
        for (let i = 0; i < flexLine.itemCount; i++) {
            let child = this._getReorderedChildAt(childIndex);
            if (child === null) {
                continue;
            } else if (FlexboxLayout.isGone(child)) {
                childIndex++;
                continue;
            }
            let lp = FlexboxLayout.getLayoutParams(child);
            if (this._isMainAxisDirectionHorizontal(flexDirection)) {
                if (!this._childrenFrozen[childIndex]) {
                    let rawCalculatedWidth = child.getMeasuredWidth() + unitSpace * lp.flexGrow + accumulatedRoundError;
                    let roundedCalculatedWidth = Math.round(rawCalculatedWidth);
                    if (roundedCalculatedWidth > lp.maxWidth) {
                        needsReexpand = true;
                        roundedCalculatedWidth = lp.maxWidth;
                        this._childrenFrozen[childIndex] = true;
                        flexLine._totalFlexGrow -= lp.flexGrow;
                    } else {
                        accumulatedRoundError = rawCalculatedWidth - roundedCalculatedWidth;
                    }
                    child.measure(makeMeasureSpec(roundedCalculatedWidth, EXACTLY), makeMeasureSpec(child.getMeasuredHeight(), EXACTLY));
                }
                flexLine._mainSize += child.getMeasuredWidth() + lp.leftMargin + lp.rightMargin;
            } else {
                if (!this._childrenFrozen[childIndex]) {
                    let rawCalculatedHeight = child.getMeasuredHeight() + unitSpace * lp.flexGrow + accumulatedRoundError;
                    let roundedCalculatedHeight = Math.round(rawCalculatedHeight);
                    if (roundedCalculatedHeight > lp.maxHeight) {
                        needsReexpand = true;
                        roundedCalculatedHeight = lp.maxHeight;
                        this._childrenFrozen[childIndex] = true;
                        flexLine._totalFlexGrow -= lp.flexGrow;
                    } else {
                        accumulatedRoundError = rawCalculatedHeight - roundedCalculatedHeight;
                    }
                    child.measure(makeMeasureSpec(child.getMeasuredWidth(), EXACTLY), makeMeasureSpec(roundedCalculatedHeight, EXACTLY));
                }
                flexLine._mainSize += child.getMeasuredHeight() + lp.topMargin + lp.bottomMargin;
            }
            childIndex++;
        }

        if (needsReexpand && sizeBeforeExpand !== flexLine._mainSize) {
            this._expandFlexItems(flexLine, flexDirection, maxMainSize, paddingAlongMainAxis, startIndex);
        }
        return childIndex;
    }

    private _shrinkFlexItems(flexLine: FlexLine, flexDirection: FlexDirection, maxMainSize: number, paddingAlongMainAxis: number, startIndex: number): number {
        let childIndex = startIndex;
        let sizeBeforeShrink = flexLine._mainSize;
        if (flexLine._totalFlexShrink <= 0 || maxMainSize > flexLine._mainSize) {
            childIndex += flexLine.itemCount;
            return childIndex;
        }
        let needsReshrink = false;
        let unitShrink = (flexLine._mainSize - maxMainSize) / flexLine._totalFlexShrink;
        let accumulatedRoundError = 0;
        flexLine._mainSize = paddingAlongMainAxis + flexLine._dividerLengthInMainSize;
        for (let i = 0; i < flexLine.itemCount; i++) {
            let child = this._getReorderedChildAt(childIndex);
            if (child === null) {
                continue;
            } else if (FlexboxLayout.isGone(child)) {
                childIndex++;
                continue;
            }
            let lp = FlexboxLayout.getLayoutParams(child);
            if (this._isMainAxisDirectionHorizontal(flexDirection)) {
                // The direction of main axis is horizontal
                if (!this._childrenFrozen[childIndex]) {
                    let rawCalculatedWidth = child.getMeasuredWidth() - unitShrink * lp.flexShrink;
                    if (i === flexLine.itemCount - 1) {
                        rawCalculatedWidth += accumulatedRoundError;
                        accumulatedRoundError = 0;
                    }
                    let newWidth = Math.round(rawCalculatedWidth);
                    if (newWidth < lp.minWidth) {
                        needsReshrink = true;
                        newWidth = lp.minWidth;
                        this._childrenFrozen[childIndex] = true;
                        flexLine._totalFlexShrink -= lp.flexShrink;
                    } else {
                        accumulatedRoundError += (rawCalculatedWidth - newWidth);
                        if (accumulatedRoundError > 1.0) {
                            newWidth += 1;
                            accumulatedRoundError -= 1;
                        } else if (accumulatedRoundError < -1.0) {
                            newWidth -= 1;
                            accumulatedRoundError += 1;
                        }
                    }
                    child.measure(makeMeasureSpec(newWidth, EXACTLY), makeMeasureSpec(child.getMeasuredHeight(), EXACTLY));
                }
                flexLine._mainSize += child.getMeasuredWidth() + lp.leftMargin + lp.rightMargin;
            } else {
                if (!this._childrenFrozen[childIndex]) {
                    let rawCalculatedHeight = child.getMeasuredHeight() - unitShrink * lp.flexShrink;
                    if (i === flexLine.itemCount - 1) {
                        rawCalculatedHeight += accumulatedRoundError;
                        accumulatedRoundError = 0;
                    }
                    let newHeight = Math.round(rawCalculatedHeight);
                    if (newHeight < lp.minHeight) {
                        needsReshrink = true;
                        newHeight = lp.minHeight;
                        this._childrenFrozen[childIndex] = true;
                        flexLine._totalFlexShrink -= lp.flexShrink;
                    } else {
                        accumulatedRoundError += (rawCalculatedHeight - newHeight);
                        if (accumulatedRoundError > 1.0) {
                            newHeight += 1;
                            accumulatedRoundError -= 1;
                        } else if (accumulatedRoundError < -1.0) {
                            newHeight -= 1;
                            accumulatedRoundError += 1;
                        }
                    }
                    child.measure(makeMeasureSpec(child.getMeasuredWidth(), EXACTLY), makeMeasureSpec(newHeight, EXACTLY));
                }
                flexLine._mainSize += child.getMeasuredHeight() + lp.topMargin + lp.bottomMargin;
            }
            childIndex++;
        }

        if (needsReshrink && sizeBeforeShrink !== flexLine._mainSize) {
            this._shrinkFlexItems(flexLine, flexDirection, maxMainSize, paddingAlongMainAxis, startIndex);
        }
        return childIndex;
    }

    private _determineCrossSize(flexDirection: FlexDirection, widthMeasureSpec: number, heightMeasureSpec: number, paddingAlongCrossAxis: number) {
        let mode;
        let size;
        switch (flexDirection) {
            case FlexDirection.ROW:
            case FlexDirection.ROW_REVERSE:
                mode = getMeasureSpecMode(heightMeasureSpec);
                size = getMeasureSpecSize(heightMeasureSpec);
                break;
            case FlexDirection.COLUMN:
            case FlexDirection.COLUMN_REVERSE:
                mode = getMeasureSpecMode(widthMeasureSpec);
                size = getMeasureSpecSize(widthMeasureSpec);
                break;
            default:
                throw new Error("Invalid flex direction: " + flexDirection);
        }
        if (mode === EXACTLY) {
            let totalCrossSize = this._getSumOfCrossSize() + paddingAlongCrossAxis;
            if (this._flexLines.length === 1) {
                this._flexLines[0]._crossSize = size - paddingAlongCrossAxis;
            } else if (this._flexLines.length >= 2 && totalCrossSize < size) {
                switch (this.alignContent) {
                    case AlignContent.STRETCH:
                        (() => {
                            let freeSpaceUnit = (size - totalCrossSize) / this._flexLines.length;
                            let accumulatedError = 0;
                            for (let i = 0, flexLinesSize = this._flexLines.length; i < flexLinesSize; i++) {
                                let flexLine = this._flexLines[i];
                                let newCrossSizeAsFloat = flexLine._crossSize + freeSpaceUnit;
                                if (i === this._flexLines.length - 1) {
                                    newCrossSizeAsFloat += accumulatedError;
                                    accumulatedError = 0;
                                }
                                let newCrossSize = Math.round(newCrossSizeAsFloat);
                                accumulatedError += (newCrossSizeAsFloat - newCrossSize);
                                if (accumulatedError > 1) {
                                    newCrossSize += 1;
                                    accumulatedError -= 1;
                                } else if (accumulatedError < -1) {
                                    newCrossSize -= 1;
                                    accumulatedError += 1;
                                }
                                flexLine._crossSize = newCrossSize;
                            }
                        })();
                    break;
                    case AlignContent.SPACE_AROUND:
                        (() => {
                            let spaceTopAndBottom = size - totalCrossSize;
                            let numberOfSpaces = this._flexLines.length * 2;
                            spaceTopAndBottom = spaceTopAndBottom / numberOfSpaces;
                            let newFlexLines: FlexLine[] = [];
                            let dummySpaceFlexLine = new FlexLine();
                            dummySpaceFlexLine._crossSize = spaceTopAndBottom;
                            this._flexLines.forEach(flexLine => {
                                newFlexLines.push(dummySpaceFlexLine);
                                newFlexLines.push(flexLine);
                                newFlexLines.push(dummySpaceFlexLine);
                            });
                            this._flexLines = newFlexLines;
                        })();
                        break;
                    case AlignContent.SPACE_BETWEEN:
                        (() => {
                            let spaceBetweenFlexLine = size - totalCrossSize;
                            let numberOfSpaces = this._flexLines.length - 1;
                            spaceBetweenFlexLine = spaceBetweenFlexLine / numberOfSpaces;
                            let accumulatedError = 0;
                            let newFlexLines: FlexLine[] = [];
                            for (let i = 0, flexLineSize = this._flexLines.length; i < flexLineSize; i++) {
                                let flexLine = this._flexLines[i];
                                newFlexLines.push(flexLine);

                                if (i !== this._flexLines.length - 1) {
                                    let dummySpaceFlexLine = new FlexLine();
                                    if (i === this._flexLines.length - 2) {
                                        dummySpaceFlexLine._crossSize = Math.round(spaceBetweenFlexLine + accumulatedError);
                                        accumulatedError = 0;
                                    } else {
                                        dummySpaceFlexLine._crossSize = Math.round(spaceBetweenFlexLine);
                                    }
                                    accumulatedError += (spaceBetweenFlexLine - dummySpaceFlexLine._crossSize);
                                    if (accumulatedError > 1) {
                                        dummySpaceFlexLine._crossSize += 1;
                                        accumulatedError -= 1;
                                    } else if (accumulatedError < -1) {
                                        dummySpaceFlexLine._crossSize -= 1;
                                        accumulatedError += 1;
                                    }
                                    newFlexLines.push(dummySpaceFlexLine);
                                }
                            }
                            this._flexLines = newFlexLines;
                        })();
                        break;
                    case AlignContent.CENTER: {
                        let spaceAboveAndBottom = size - totalCrossSize;
                        spaceAboveAndBottom = spaceAboveAndBottom / 2;
                        let newFlexLines: FlexLine[] = [];
                        let dummySpaceFlexLine = new FlexLine();
                        dummySpaceFlexLine._crossSize = spaceAboveAndBottom;
                        for (let i = 0, flexLineSize = this._flexLines.length; i < flexLineSize; i++) {
                            if (i === 0) {
                                newFlexLines.push(dummySpaceFlexLine);
                            }
                            let flexLine = this._flexLines[i];
                            newFlexLines.push(flexLine);
                            if (i === this._flexLines.length - 1) {
                                newFlexLines.push(dummySpaceFlexLine);
                            }
                        }
                        this._flexLines = newFlexLines;
                        break;
                    }
                    case AlignContent.FLEX_END: {
                        let spaceTop = size - totalCrossSize;
                        let dummySpaceFlexLine = new FlexLine();
                        dummySpaceFlexLine._crossSize = spaceTop;
                        this._flexLines.unshift(dummySpaceFlexLine);
                        break;
                    }
                }
            }
        }
    }

    private _stretchViews(flexDirection: FlexDirection, alignItems: AlignItems) {
        if (alignItems === AlignItems.STRETCH) {
            let viewIndex = 0;
            this._flexLines.forEach(flexLine => {
                for (let i = 0; i < flexLine.itemCount; i++, viewIndex++) {
                    let view = this._getReorderedChildAt(viewIndex);
                    let lp = FlexboxLayout.getLayoutParams(view);
                    if (lp.alignSelf !== AlignSelf.AUTO && lp.alignSelf !== AlignSelf.STRETCH) {
                        continue;
                    }
                    switch (flexDirection) {
                        case FlexDirection.ROW:
                        case FlexDirection.ROW_REVERSE:
                            this._stretchViewVertically(view, flexLine._crossSize);
                            break;
                        case FlexDirection.COLUMN:
                        case FlexDirection.COLUMN_REVERSE:
                            this._stretchViewHorizontally(view, flexLine._crossSize);
                            break;
                        default:
                            throw new Error("Invalid flex direction: " + flexDirection);
                    }
                }
            });
        } else {
            this._flexLines.forEach(flexLine => {
                flexLine._indicesAlignSelfStretch.forEach(index => {
                    let view = this._getReorderedChildAt(index);
                    switch (flexDirection) {
                        case FlexDirection.ROW:
                        case FlexDirection.ROW_REVERSE:
                            this._stretchViewVertically(view, flexLine._crossSize);
                            break;
                        case FlexDirection.COLUMN:
                        case FlexDirection.COLUMN_REVERSE:
                            this._stretchViewHorizontally(view, flexLine._crossSize);
                            break;
                        default:
                            throw new Error("Invalid flex direction: " + flexDirection);
                    }
                });
            });
        }
    }

    private _stretchViewVertically(view: View, crossSize: number) {
        let lp = FlexboxLayout.getLayoutParams(view);
        let newHeight = crossSize - lp.topMargin - lp.bottomMargin;
        newHeight = Math.max(newHeight, 0);
        view.measure(makeMeasureSpec(view.getMeasuredWidth(), EXACTLY), makeMeasureSpec(newHeight, EXACTLY));
    }

    private _stretchViewHorizontally(view: View, crossSize: number) {
        let lp = FlexboxLayout.getLayoutParams(view);
        let newWidth = crossSize - lp.leftMargin - lp.rightMargin;
        newWidth = Math.max(newWidth, 0);
        view.measure(makeMeasureSpec(newWidth, EXACTLY), makeMeasureSpec(view.getMeasuredHeight(), EXACTLY));
    }

    private _setMeasuredDimensionForFlex(flexDirection: FlexDirection, widthMeasureSpec: number, heightMeasureSpec: number, childState: number) {
        let widthMode = getMeasureSpecMode(widthMeasureSpec);
        let widthSize = getMeasureSpecSize(widthMeasureSpec);
        let heightMode = getMeasureSpecMode(heightMeasureSpec);
        let heightSize = getMeasureSpecSize(heightMeasureSpec);
        let calculatedMaxHeight;
        let calculatedMaxWidth;
        switch (flexDirection) {
            case FlexDirection.ROW:
            case FlexDirection.ROW_REVERSE:
                calculatedMaxHeight = this._getSumOfCrossSize() + this.paddingTop + this.paddingBottom;
                calculatedMaxWidth = this._getLargestMainSize();
                break;
            case FlexDirection.COLUMN:
            case FlexDirection.COLUMN_REVERSE:
                calculatedMaxHeight = this._getLargestMainSize();
                calculatedMaxWidth = this._getSumOfCrossSize() + this.paddingLeft + this.paddingRight;
                break;
            default:
                throw new Error("Invalid flex direction: " + flexDirection);
        }

        let widthSizeAndState;
        switch (widthMode) {
            case EXACTLY:
                if (widthSize < calculatedMaxWidth) {
                    childState = View.combineMeasuredStates(childState, MEASURED_STATE_TOO_SMALL);
                }
                widthSizeAndState = View.resolveSizeAndState(widthSize, widthSize, widthMode, childState);
                break;
            case AT_MOST: {
                if (widthSize < calculatedMaxWidth) {
                    childState = View.combineMeasuredStates(childState, MEASURED_STATE_TOO_SMALL);
                } else {
                    widthSize = calculatedMaxWidth;
                }
                widthSizeAndState = View.resolveSizeAndState(widthSize, widthSize, widthMode, childState);
                break;
            }
            case UNSPECIFIED: {
                widthSizeAndState = View.resolveSizeAndState(calculatedMaxWidth, widthSize, widthMode, childState);
                break;
            }
            default:
                throw new Error("Unknown width mode is set: " + widthMode);
        }
        let heightSizeAndState;
        switch (heightMode) {
            case EXACTLY:
                if (heightSize < calculatedMaxHeight) {
                    childState = View.combineMeasuredStates(childState, MEASURED_STATE_TOO_SMALL >> utils.layout.MEASURED_HEIGHT_STATE_SHIFT);
                }
                heightSizeAndState = View.resolveSizeAndState(heightSize, heightSize, heightMode, childState);
                break;
            case AT_MOST: {
                if (heightSize < calculatedMaxHeight) {
                    childState = View.combineMeasuredStates(childState, MEASURED_STATE_TOO_SMALL >> utils.layout.MEASURED_HEIGHT_STATE_SHIFT);
                } else {
                    heightSize = calculatedMaxHeight;
                }

                heightSizeAndState = View.resolveSizeAndState(heightSize, heightSize, heightMode, childState);
                break;
            }
            case UNSPECIFIED: {
                heightSizeAndState = View.resolveSizeAndState(calculatedMaxHeight, heightSize, heightMode, childState);
                break;
            }
            default:
                throw new Error("Unknown height mode is set: " + heightMode);
        }
        this.setMeasuredDimension(widthSizeAndState, heightSizeAndState);
    }

    private _isWrapRequired(mode: number, maxSize: number, currentLength: number, childLength: number, lp: FlexboxLayout.LayoutParams, childAbsoluteIndex: number, childRelativeIndexInFlexLine: number): boolean {
        if (this.flexWrap === FlexWrap.NOWRAP) {
            return false;
        }
        if (lp.wrapBefore) {
            return true;
        }
        if (mode === UNSPECIFIED) {
            return false;
        }

        // Omit divider

        return maxSize < currentLength + childLength;
    }

    private _getLargestMainSize(): number {
        return this._flexLines.reduce((max, flexLine) => Math.max(max, flexLine.mainSize), Number.MIN_VALUE);
    }

    private _getSumOfCrossSize(): number {
        // Omit divider
        return this._flexLines.reduce((sum, flexLine) => sum + flexLine._crossSize, 0);
    }

    private _isMainAxisDirectionHorizontal(flexDirection: FlexDirection): boolean {
        return flexDirection === FlexDirection.ROW || flexDirection === FlexDirection.ROW_REVERSE;
    }

    public onLayout(left: number, top: number, right: number, bottom: number) {
        let isRtl;
        switch (this.flexDirection) {
            case FlexDirection.ROW:
                isRtl = false;
                this._layoutHorizontal(isRtl, left, top, right, bottom);
                break;
            case FlexDirection.ROW_REVERSE:
                isRtl = true;
                this._layoutHorizontal(isRtl, left, top, right, bottom);
                break;
            case FlexDirection.COLUMN:
                isRtl = false;
                if (this.flexWrap === FlexWrap.WRAP_REVERSE) {
                    isRtl = !isRtl;
                }
                this._layoutVertical(isRtl, false, left, top, right, bottom);
                break;
            case FlexDirection.COLUMN_REVERSE:
                isRtl = false;
                if (this.flexWrap === FlexWrap.WRAP_REVERSE) {
                    isRtl = !isRtl;
                }
                this._layoutVertical(isRtl, true, left, top, right, bottom);
                break;
            default:
                throw new Error("Invalid flex direction is set: " + this.flexDirection);
        }

        LayoutBase.restoreOriginalParams(this);
    }

    private _layoutHorizontal(isRtl: boolean, left: number, top: number, right: number, bottom: number) {
        let paddingLeft = this.paddingLeft;
        let paddingRight = this.paddingRight;

        let childLeft;
        let currentViewIndex = 0;

        let height = bottom - top;
        let width = right - left;

        let childBottom = height - this.paddingBottom;
        let childTop = this.paddingTop;

        let childRight;
        this._flexLines.forEach((flexLine, i) => {

            // Omit divider

            let spaceBetweenItem = 0.0;
            switch (this.justifyContent) {
                case JustifyContent.FLEX_START:
                    childLeft = paddingLeft;
                    childRight = width - paddingRight;
                    break;
                case JustifyContent.FLEX_END:
                    childLeft = width - flexLine._mainSize + paddingRight;
                    childRight = flexLine._mainSize - paddingLeft;
                    break;
                case JustifyContent.CENTER:
                    childLeft = paddingLeft + (width - flexLine._mainSize) / 2.0;
                    childRight = width - paddingRight - (width - flexLine._mainSize) / 2.0;
                    break;
                case JustifyContent.SPACE_AROUND:
                    if (flexLine._itemCount !== 0) {
                        spaceBetweenItem = (width - flexLine.mainSize) / flexLine._itemCount;
                    }
                    childLeft = paddingLeft + spaceBetweenItem / 2.0;
                    childRight = width - paddingRight - spaceBetweenItem / 2.0;
                    break;
                case JustifyContent.SPACE_BETWEEN:
                    childLeft = paddingLeft;
                    let denominator = flexLine.itemCount !== 1 ? flexLine.itemCount - 1 : 1.0;
                    spaceBetweenItem = (width - flexLine.mainSize) / denominator;
                    childRight = width - paddingRight;
                    break;
                default:
                    throw new Error("Invalid justifyContent is set: " + this.justifyContent);
            }
            spaceBetweenItem = Math.max(spaceBetweenItem, 0);

            for (let j = 0; j < flexLine.itemCount; j++) {
                let child = this._getReorderedChildAt(currentViewIndex);
                if (child === null) {
                    continue;
                } else if (FlexboxLayout.isGone(child)) {
                    currentViewIndex++;
                    continue;
                }
                let lp = FlexboxLayout.getLayoutParams(child);
                childLeft += lp.leftMargin;
                childRight -= lp.rightMargin;

                // Omit divider

                if (this.flexWrap === FlexWrap.WRAP_REVERSE) {
                    if (isRtl) {
                        this._layoutSingleChildHorizontal(child, flexLine, this.flexWrap, this.alignItems,
                                Math.round(childRight) - child.getMeasuredWidth(),
                                childBottom - child.getMeasuredHeight(), Math.round(childRight),
                                childBottom);
                    } else {
                        this._layoutSingleChildHorizontal(child, flexLine, this.flexWrap, this.alignItems,
                                Math.round(childLeft), childBottom - child.getMeasuredHeight(),
                                Math.round(childLeft) + child.getMeasuredWidth(),
                                childBottom);
                    }
                } else {
                    if (isRtl) {
                        this._layoutSingleChildHorizontal(child, flexLine, this.flexWrap, this.alignItems,
                                Math.round(childRight) - child.getMeasuredWidth(), childTop,
                                Math.round(childRight), childTop + child.getMeasuredHeight());
                    } else {
                        this._layoutSingleChildHorizontal(child, flexLine, this.flexWrap, this.alignItems,
                                Math.round(childLeft), childTop,
                                Math.round(childLeft) + child.getMeasuredWidth(),
                                childTop + child.getMeasuredHeight());
                    }
                }
                childLeft += child.getMeasuredWidth() + spaceBetweenItem + lp.rightMargin;
                childRight -= child.getMeasuredWidth() + spaceBetweenItem + lp.leftMargin;
                currentViewIndex++;

                let bounds = child._getCurrentLayoutBounds();
                flexLine._left = Math.min(flexLine._left, bounds.left - lp.leftMargin);
                flexLine._top = Math.min(flexLine._top, bounds.top - lp.topMargin);
                flexLine._right = Math.max(flexLine._right, bounds.right + lp.rightMargin);
                flexLine._bottom = Math.max(flexLine._bottom, bounds.bottom + lp.bottomMargin);
            }

            childTop += flexLine._crossSize;
            childBottom -= flexLine._crossSize;
        });
    }

    private _layoutSingleChildHorizontal(view: View, flexLine: FlexLine, flexWrap: FlexWrap, alignItems: AlignItems, left: number, top: number, right: number, bottom: number): void {
        let lp = FlexboxLayout.getLayoutParams(view);

        if (lp.alignSelf !== AlignSelf.AUTO) {
            alignItems = lp.alignSelf;
        }

        let crossSize = flexLine._crossSize;
        switch (alignItems) {
            case AlignItems.FLEX_START:
            case AlignItems.STRETCH:
                if (flexWrap !== FlexWrap.WRAP_REVERSE) {
                    view.layout(left, top + lp.topMargin, right, bottom + lp.topMargin);
                } else {
                    view.layout(left, top - lp.bottomMargin, right, bottom - lp.bottomMargin);
                }
                break;
            case AlignItems.BASELINE:
                if (flexWrap !== FlexWrap.WRAP_REVERSE) {
                    let marginTop = flexLine._maxBaseline - FlexboxLayout.getBaseline(view);
                    marginTop = Math.max(marginTop, lp.topMargin);
                    view.layout(left, top + marginTop, right, bottom + marginTop);
                } else {
                    let marginBottom = flexLine._maxBaseline - view.getMeasuredHeight() + FlexboxLayout.getBaseline(view);
                    marginBottom = Math.max(marginBottom, lp.bottomMargin);
                    view.layout(left, top - marginBottom, right, bottom - marginBottom);
                }
                break;
            case AlignItems.FLEX_END:
                if (flexWrap !== FlexWrap.WRAP_REVERSE) {
                    view.layout(left,
                            top + crossSize - view.getMeasuredHeight() - lp.bottomMargin,
                            right, top + crossSize - lp.bottomMargin);
                } else {
                    view.layout(left, top - crossSize + view.getMeasuredHeight() + lp.topMargin,
                            right, bottom - crossSize + view.getMeasuredHeight() + lp.topMargin);
                }
                break;
            case AlignItems.CENTER:
                let topFromCrossAxis = (crossSize - view.getMeasuredHeight()) / 2;
                if (flexWrap !== FlexWrap.WRAP_REVERSE) {
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

    private _layoutVertical(isRtl: boolean, fromBottomToTop: boolean, left: number, top: number, right: number, bottom: number) {
        let paddingTop = this.paddingTop;
        let paddingBottom = this.paddingBottom;

        let paddingRight = this.paddingRight;
        let childLeft = this.paddingLeft;
        let currentViewIndex = 0;

        let width = right - left;
        let height = bottom - top;
        let childRight = width - paddingRight;

        let childTop;
        let childBottom;

        this._flexLines.forEach(flexLine => {

            // Omit divider.

            let spaceBetweenItem = 0.0;

            switch (this.justifyContent) {
                case JustifyContent.FLEX_START:
                    childTop = paddingTop;
                    childBottom = height - paddingBottom;
                    break;
                case JustifyContent.FLEX_END:
                    childTop = height - flexLine._mainSize + paddingBottom;
                    childBottom = flexLine._mainSize - paddingTop;
                    break;
                case JustifyContent.CENTER:
                    childTop = paddingTop + (height - flexLine._mainSize) / 2.0;
                    childBottom = height - paddingBottom - (height - flexLine._mainSize) / 2.0;
                    break;
                case JustifyContent.SPACE_AROUND:
                    if (flexLine._itemCount !== 0) {
                        spaceBetweenItem = (height - flexLine._mainSize) / flexLine.itemCount;
                    }
                    childTop = paddingTop + spaceBetweenItem / 2.0;
                    childBottom = height - paddingBottom - spaceBetweenItem / 2.0;
                    break;
                case JustifyContent.SPACE_BETWEEN:
                    childTop = paddingTop;
                    let denominator = flexLine.itemCount !== 1 ? flexLine.itemCount - 1 : 1.0;
                    spaceBetweenItem = (height - flexLine.mainSize) / denominator;
                    childBottom = height - paddingBottom;
                    break;
                default:
                    throw new Error("Invalid justifyContent is set: " + this.justifyContent);
            }
            spaceBetweenItem = Math.max(spaceBetweenItem, 0);

            for (let j = 0; j < flexLine.itemCount; j++) {
                let child = this._getReorderedChildAt(currentViewIndex);
                if (child === null) {
                    continue;
                } else if (FlexboxLayout.isGone(child)) {
                    currentViewIndex++;
                    continue;
                }
                let lp = FlexboxLayout.getLayoutParams(child);
                childTop += lp.topMargin;
                childBottom -= lp.bottomMargin;

                // Omit divider.

                if (isRtl) {
                    if (fromBottomToTop) {
                        this._layoutSingleChildVertical(child, flexLine, true, this.alignItems,
                                childRight - child.getMeasuredWidth(),
                                Math.round(childBottom) - child.getMeasuredHeight(), childRight,
                                Math.round(childBottom));
                    } else {
                        this._layoutSingleChildVertical(child, flexLine, true, this.alignItems,
                                childRight - child.getMeasuredWidth(), Math.round(childTop),
                                childRight, Math.round(childTop) + child.getMeasuredHeight());
                    }
                } else {
                    if (fromBottomToTop) {
                        this._layoutSingleChildVertical(child, flexLine, false, this.alignItems,
                                childLeft, Math.round(childBottom) - child.getMeasuredHeight(),
                                childLeft + child.getMeasuredWidth(), Math.round(childBottom));
                    } else {
                        this._layoutSingleChildVertical(child, flexLine, false, this.alignItems,
                                childLeft, Math.round(childTop),
                                childLeft + child.getMeasuredWidth(),
                                Math.round(childTop) + child.getMeasuredHeight());
                    }
                }
                childTop += child.getMeasuredHeight() + spaceBetweenItem + lp.bottomMargin;
                childBottom -= child.getMeasuredHeight() + spaceBetweenItem + lp.topMargin;
                currentViewIndex++;

                let bounds = child._getCurrentLayoutBounds();
                flexLine._left = Math.min(flexLine._left, bounds.left - lp.leftMargin);
                flexLine._top = Math.min(flexLine._top, bounds.top - lp.topMargin);
                flexLine._right = Math.max(flexLine._right, bounds.right + lp.rightMargin);
                flexLine._bottom = Math.max(flexLine._bottom, bounds.bottom + lp.bottomMargin);
            }

            childLeft += flexLine.crossSize;
            childRight -= flexLine.crossSize;
        });
    }

    private _layoutSingleChildVertical(view: View, flexLine: FlexLine, isRtl: boolean, alignItems: AlignItems, left: number, top: number, right: number, bottom: number) {
        let lp = FlexboxLayout.getLayoutParams(view);
        if (lp.alignSelf !== AlignSelf.AUTO) {
            alignItems = lp.alignSelf;
        }
        let crossSize = flexLine.crossSize;
        switch (alignItems) {
            case AlignItems.FLEX_START:
            case AlignItems.STRETCH:
            case AlignItems.BASELINE:
                if (!isRtl) {
                    view.layout(left + lp.leftMargin, top, right + lp.leftMargin, bottom);
                } else {
                    view.layout(left - lp.rightMargin, top, right - lp.rightMargin, bottom);
                }
                break;
            case AlignItems.FLEX_END:
                if (!isRtl) {
                    view.layout(left + crossSize - view.getMeasuredWidth() - lp.rightMargin,
                            top, right + crossSize - view.getMeasuredWidth() - lp.rightMargin,
                            bottom);
                } else {
                    // If the flexWrap === FLEX_WRAP_WRAP_REVERSE, the direction of the
                    // flexEnd is flipped (from left to right).
                    view.layout(left - crossSize + view.getMeasuredWidth() + lp.leftMargin, top,
                            right - crossSize + view.getMeasuredWidth() + lp.leftMargin,
                            bottom);
                }
                break;
            case AlignItems.CENTER:
                let leftFromCrossAxis = (crossSize - view.getMeasuredWidth()) / 2;
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

    // Omit divider in onDraw(), drawDividersHorizontal, drawDividersVertical, drawVerticalDivider

    // requestLayout on set flexDirection, set flexWrap, set justifyContent, set alignItems, set alignContent

    // NOTE Consider moving to View if frequently used
    private static getChildMeasureSpec(spec: number, padding: number, childDimension: number): number {
        let specMode = utils.layout.getMeasureSpecMode(spec);
        let specSize = utils.layout.getMeasureSpecSize(spec);

        let size = Math.max(0, specSize - padding);

        let resultSize = 0;
        let resultMode = 0;

        switch (specMode) {
            // Parent has imposed an exact size on us
            case EXACTLY:
                if (childDimension >= 0) {
                    resultSize = childDimension;
                    resultMode = EXACTLY;
                } else if (childDimension === MATCH_PARENT) {
                    resultSize = size;
                    resultMode = EXACTLY;
                } else if (childDimension ===  WRAP_CONTENT) {
                    resultSize = size;
                    resultMode = AT_MOST;
                }
                break;

            case AT_MOST:
                if (childDimension >= 0) {
                    resultSize = childDimension;
                    resultMode = EXACTLY;
                } else if (childDimension === MATCH_PARENT) {
                    resultSize = size;
                    resultMode = AT_MOST;
                } else if (childDimension === WRAP_CONTENT) {
                    resultSize = size;
                    resultMode = AT_MOST;
                }
                break;

            case UNSPECIFIED:
                if (childDimension >= 0) {
                    resultSize = childDimension;
                    resultMode = EXACTLY;
                } else if (childDimension === MATCH_PARENT) {
                    resultSize = View_sUseZeroUnspecifiedMeasureSpec ? 0 : size;
                    resultMode = UNSPECIFIED;
                } else if (childDimension === WRAP_CONTENT) {
                    resultSize = View_sUseZeroUnspecifiedMeasureSpec ? 0 : size;
                    resultMode = UNSPECIFIED;
                }
                break;
        }
        return utils.layout.makeMeasureSpec(resultSize, resultMode);
    }
}

export namespace FlexboxLayout {
    export interface LayoutParams extends CommonLayoutParams {
        order: number;
        alignSelf: AlignSelf;
        flexGrow: number;
        flexShrink: number;
        flexBasisPercent: number;
        wrapBefore: boolean;
        minWidth: number;
        minHeight: number;
        maxWidth: number;
        maxHeight: number;
    }

    export function getLayoutParams(child: View): FlexboxLayout.LayoutParams {
        let lp: CommonLayoutParams = child.style._getValue(nativeLayoutParamsProperty);
        let flp: FlexboxLayout.LayoutParams = {
            width: lp.width,
            height: lp.height,

            widthPercent: lp.widthPercent,
            heightPercent: lp.heightPercent,

            leftMargin: lp.leftMargin,
            topMargin: lp.topMargin,
            rightMargin: lp.rightMargin,
            bottomMargin: lp.bottomMargin,

            leftMarginPercent: lp.leftMarginPercent,
            topMarginPercent: lp.topMarginPercent,
            rightMarginPercent: lp.rightMarginPercent,
            bottomMarginPercent: lp.bottomMarginPercent,

            horizontalAlignment: lp.horizontalAlignment,
            verticalAlignment: lp.verticalAlignment,

            alignSelf: FlexboxLayout.getAlignSelf(child),
            flexBasisPercent: FlexBasisPercent.DEFAULT,
            flexGrow: FlexboxLayout.getFlexGrow(child),
            flexShrink: FlexboxLayout.getFlexShrink(child),
            maxHeight: MAX_SIZE,
            maxWidth: MAX_SIZE,
            minHeight: child.minHeight,
            minWidth: child.minWidth,
            order: FlexboxLayout.getOrder(child),
            wrapBefore: FlexboxLayout.getFlexWrapBefore(child)
        };

        return flp;
    }

    export function getBaseline(child: View): number {
        // TODO: Check if we support baseline for iOS.
        return 0;
    }

    export function isGone(child: View): boolean {
        return child.visibility !== enums.Visibility.visible;
    }

    export function getPaddingStart(child: View): number {
        return child.style.paddingLeft;
    }

    export function getPaddingEnd(child: View): number {
        return child.style.paddingRight;
    }
}
