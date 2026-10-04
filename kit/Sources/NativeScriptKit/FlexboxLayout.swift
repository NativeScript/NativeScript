import UIKit

/// `FlexboxLayout` from layouts/flexbox-layout (index.ios and
/// flexbox-layout-common), ported statement for statement: lines, grow and
/// shrink with their carried rounding error, align-content's spacer lines,
/// and the layout arithmetic, including where NativeScript does not round.
open class FlexboxLayout: LayoutBase {
    open override class var cssType: String { "FlexboxLayout" }

    private static let matchParent: Double = -1
    private static let wrapContent: Double = -2

    var flexDirection = "row"
    var flexWrap = "nowrap"
    var justifyContent = "flex-start"
    var alignItems = "stretch"
    var alignContent = "stretch"
    var effectiveRowGap: Double = 0
    var effectiveColumnGap: Double = 0

    private var children: [View] = []
    private var reorderedIndices: [Int] = []
    private var flexLines: [FlexLine] = []
    private var childrenFrozen: [Bool] = []

    final class FlexLine {
        var mainSize: Double = 0
        var gapLengthInMainSize: Double = 0
        var crossSize: Double = 0
        var itemCount = 0
        var goneItemCount = 0
        var totalFlexGrow: Double = 0
        var totalFlexShrink: Double = 0
        var maxBaseline: Double = 0
        var indicesAlignSelfStretch: [Int] = []

        var layoutVisibleItemCount: Int { itemCount - goneItemCount }
    }

    open override func setProperty(_ name: String, _ value: Any?) {
        func keyword(_ valid: [String], _ fallback: String) -> String {
            let lower = (value as? String)?.trimmingCharacters(in: .whitespaces).lowercased() ?? fallback
            return valid.contains(lower) ? lower : fallback
        }
        switch name {
        case "flexDirection": flexDirection = keyword(["row", "row-reverse", "column", "column-reverse"], "row")
        case "flexWrap": flexWrap = keyword(["nowrap", "wrap", "wrap-reverse"], "nowrap")
        case "justifyContent": justifyContent = keyword(["flex-start", "flex-end", "center", "space-between", "space-around"], "flex-start")
        case "alignItems": alignItems = keyword(["flex-start", "flex-end", "center", "baseline", "stretch"], "stretch")
        case "alignContent": alignContent = keyword(["flex-start", "flex-end", "center", "space-between", "space-around", "stretch"], "stretch")
        case "rowGap": effectiveRowGap = Length(value, default: .zero).toDevicePixels(auto: 0)
        case "columnGap": effectiveColumnGap = Length(value, default: .zero).toDevicePixels(auto: 0)
        default:
            super.setProperty(name, value)
            return
        }
        requestLayout()
    }

    // MARK: Child properties (style.order, flexGrow, flexShrink, alignSelf, flexWrapBefore)

    static func getOrder(_ view: View) -> Double {
        switch view.applied["order"] {
        case let s as String: return parseFloat(s)?.rounded(.towardZero) ?? 1
        case let v: return toDouble(v) ?? 1
        }
    }

    static func getFlexGrow(_ view: View) -> Double { toDouble(view.applied["flexGrow"]) ?? 0 }
    static func getFlexShrink(_ view: View) -> Double { toDouble(view.applied["flexShrink"]) ?? 1 }

    static func getAlignSelf(_ view: View) -> String {
        let value = (view.applied["alignSelf"] as? String)?.trimmingCharacters(in: .whitespaces).lowercased() ?? "auto"
        return ["auto", "flex-start", "flex-end", "center", "baseline", "stretch"].contains(value) ? value : "auto"
    }

    static func getFlexWrapBefore(_ view: View) -> Bool {
        switch view.applied["flexWrapBefore"] {
        case let b as Bool: return b
        case nil: return false
        case let v: return toText(v)?.trimmingCharacters(in: .whitespaces).lowercased() == "true"
        }
    }

    /// iOS has no baseline for a view here, as in NativeScript.
    static func getBaseline(_ child: View) -> Double { 0 }

    // MARK: Measure

    open override func onMeasure(_ widthMeasureSpec: Int, _ heightMeasureSpec: Int) {
        children = []
        eachLayoutChild { children.append($0) }
        reorderedIndices = createReorderedIndices()
        childrenFrozen = Array(repeating: false, count: children.count)
        switch flexDirection {
        case "row", "row-reverse": measureHorizontal(widthMeasureSpec, heightMeasureSpec)
        default: measureVertical(widthMeasureSpec, heightMeasureSpec)
        }
        childrenFrozen = []
    }

    private func getReorderedChildAt(_ index: Int) -> View? {
        if index < 0 || index >= reorderedIndices.count { return nil }
        return children[reorderedIndices[index]]
    }

    private func createReorderedIndices() -> [Int] {
        let orders = children.enumerated().map { (index: $0.offset, order: FlexboxLayout.getOrder($0.element)) }
        return orders.sorted { $0.order != $1.order ? $0.order < $1.order : $0.index < $1.index }.map(\.index)
    }

    private func measureHorizontal(_ widthMeasureSpec: Int, _ heightMeasureSpec: Int) {
        let widthSize = LayoutHelper.size(widthMeasureSpec)
        let widthMode = LayoutHelper.mode(widthMeasureSpec)
        let heightSize = LayoutHelper.size(heightMeasureSpec)
        let heightMode = LayoutHelper.mode(heightMeasureSpec)
        flexLines = []
        let childCount = children.count
        let paddingStart = effectivePaddingLeft
        let paddingEnd = effectivePaddingRight
        var largestHeightInRow = Double.leastNonzeroMagnitude
        var flexLine = FlexLine()
        var indexInFlexLine = 0
        flexLine.mainSize = paddingStart + paddingEnd
        for i in 0..<childCount {
            guard let child = getReorderedChildAt(i) else {
                addFlexLineIfLastFlexItem(i, childCount, flexLine)
                continue
            }
            if child.isCollapsed {
                flexLine.itemCount += 1
                flexLine.goneItemCount += 1
                addFlexLineIfLastFlexItem(i, childCount, flexLine)
                continue
            }
            child.updateEffectiveLayoutValues(widthSize, widthMode, heightSize, heightMode)
            if FlexboxLayout.getAlignSelf(child) == "stretch" { flexLine.indicesAlignSelfStretch.append(i) }
            let childWidth = child.effectiveWidth
            // The child's own padding, not this layout's, as NativeScript subtracts it.
            let childWidthMeasureSpec = FlexboxLayout.getChildMeasureSpec(widthMeasureSpec,
                child.effectivePaddingLeft + child.effectivePaddingRight + child.effectiveMarginLeft + child.effectiveMarginRight,
                childWidth < 0 ? FlexboxLayout.wrapContent : childWidth)
            let childHeightMeasureSpec = FlexboxLayout.getChildMeasureSpec(heightMeasureSpec,
                child.effectivePaddingTop + child.effectivePaddingBottom + child.effectiveMarginTop + child.effectiveMarginBottom,
                child.effectiveHeight < 0 ? FlexboxLayout.wrapContent : child.effectiveHeight)
            child.measure(childWidthMeasureSpec, childHeightMeasureSpec)
            checkSizeConstraints(child)
            largestHeightInRow = max(largestHeightInRow, Double(child.measuredHeight) + child.effectiveMarginTop + child.effectiveMarginBottom)
            if isWrapRequired(child, widthMode, Double(widthSize), flexLine.mainSize, Double(child.measuredWidth) + child.effectiveMarginLeft + child.effectiveMarginRight, i, indexInFlexLine) {
                if flexLine.layoutVisibleItemCount > 0 { flexLines.append(flexLine) }
                flexLine = FlexLine()
                flexLine.itemCount = 1
                flexLine.mainSize = paddingStart + paddingEnd
                largestHeightInRow = Double(child.measuredHeight) + child.effectiveMarginTop + child.effectiveMarginBottom
                indexInFlexLine = 0
            } else {
                flexLine.itemCount += 1
                indexInFlexLine += 1
            }
            flexLine.mainSize += Double(child.measuredWidth) + child.effectiveMarginLeft + child.effectiveMarginRight
            flexLine.totalFlexGrow += FlexboxLayout.getFlexGrow(child)
            flexLine.totalFlexShrink += FlexboxLayout.getFlexShrink(child)
            flexLine.crossSize = max(flexLine.crossSize, largestHeightInRow)
            if effectiveColumnGap > 0 && hasPrecedingViews(i, indexInFlexLine) {
                flexLine.mainSize += effectiveColumnGap
                flexLine.gapLengthInMainSize += effectiveColumnGap
            }
            if flexWrap != "wrap-reverse" {
                flexLine.maxBaseline = max(flexLine.maxBaseline, FlexboxLayout.getBaseline(child) + child.effectiveMarginTop)
            } else {
                flexLine.maxBaseline = max(flexLine.maxBaseline, Double(child.measuredHeight) - FlexboxLayout.getBaseline(child) + child.effectiveMarginBottom)
            }
            addFlexLineIfLastFlexItem(i, childCount, flexLine)
        }
        determineMainSize(widthMeasureSpec, heightMeasureSpec)
        if alignItems == "baseline" {
            var viewIndex = 0
            for line in flexLines {
                var largestHeightInLine = Double.leastNonzeroMagnitude
                for i in viewIndex..<(viewIndex + line.itemCount) {
                    guard let child = getReorderedChildAt(i) else { continue }
                    if flexWrap != "wrap-reverse" {
                        let marginTop = max(line.maxBaseline - FlexboxLayout.getBaseline(child), child.effectiveMarginTop)
                        largestHeightInLine = max(largestHeightInLine, Double(child.measuredHeight) + marginTop + child.effectiveMarginBottom)
                    } else {
                        let marginBottom = max(line.maxBaseline - Double(child.measuredHeight) + FlexboxLayout.getBaseline(child), child.effectiveMarginBottom)
                        largestHeightInLine = max(largestHeightInLine, Double(child.measuredHeight) + child.effectiveMarginTop + marginBottom)
                    }
                }
                line.crossSize = largestHeightInLine
                viewIndex += line.itemCount
            }
        }
        determineCrossSize(widthMeasureSpec, heightMeasureSpec, effectivePaddingTop + effectivePaddingBottom)
        stretchViews()
        setMeasuredDimensionForFlex(widthMeasureSpec, heightMeasureSpec)
    }

    private func measureVertical(_ widthMeasureSpec: Int, _ heightMeasureSpec: Int) {
        let widthSize = LayoutHelper.size(widthMeasureSpec)
        let widthMode = LayoutHelper.mode(widthMeasureSpec)
        let heightSize = LayoutHelper.size(heightMeasureSpec)
        let heightMode = LayoutHelper.mode(heightMeasureSpec)
        flexLines = []
        let childCount = children.count
        let paddingTop = effectivePaddingTop
        let paddingBottom = effectivePaddingBottom
        var largestWidthInColumn = Double.leastNonzeroMagnitude
        var flexLine = FlexLine()
        flexLine.mainSize = paddingTop + paddingBottom
        var indexInFlexLine = 0
        for i in 0..<childCount {
            guard let child = getReorderedChildAt(i) else {
                addFlexLineIfLastFlexItem(i, childCount, flexLine)
                continue
            }
            if child.isCollapsed {
                flexLine.itemCount += 1
                flexLine.goneItemCount += 1
                addFlexLineIfLastFlexItem(i, childCount, flexLine)
                continue
            }
            child.updateEffectiveLayoutValues(widthSize, widthMode, heightSize, heightMode)
            if FlexboxLayout.getAlignSelf(child) == "stretch" { flexLine.indicesAlignSelfStretch.append(i) }
            let childHeight = child.effectiveHeight
            let childWidthMeasureSpec = FlexboxLayout.getChildMeasureSpec(widthMeasureSpec,
                effectivePaddingLeft + effectivePaddingRight + child.effectiveMarginLeft + child.effectiveMarginRight,
                child.effectiveWidth < 0 ? FlexboxLayout.wrapContent : child.effectiveWidth)
            let childHeightMeasureSpec = FlexboxLayout.getChildMeasureSpec(heightMeasureSpec,
                effectivePaddingTop + effectivePaddingBottom + child.effectiveMarginTop + child.effectiveMarginBottom,
                childHeight < 0 ? FlexboxLayout.wrapContent : childHeight)
            child.measure(childWidthMeasureSpec, childHeightMeasureSpec)
            checkSizeConstraints(child)
            largestWidthInColumn = max(largestWidthInColumn, Double(child.measuredWidth) + child.effectiveMarginLeft + child.effectiveMarginRight)
            if isWrapRequired(child, heightMode, Double(heightSize), flexLine.mainSize, Double(child.measuredHeight) + child.effectiveMarginTop + child.effectiveMarginBottom, i, indexInFlexLine) {
                if flexLine.layoutVisibleItemCount > 0 { flexLines.append(flexLine) }
                flexLine = FlexLine()
                flexLine.itemCount = 1
                flexLine.mainSize = paddingTop + paddingBottom
                largestWidthInColumn = Double(child.measuredWidth) + child.effectiveMarginLeft + child.effectiveMarginRight
                indexInFlexLine = 0
            } else {
                flexLine.itemCount += 1
                indexInFlexLine += 1
            }
            flexLine.mainSize += Double(child.measuredHeight) + child.effectiveMarginTop + child.effectiveMarginBottom
            flexLine.totalFlexGrow += FlexboxLayout.getFlexGrow(child)
            flexLine.totalFlexShrink += FlexboxLayout.getFlexShrink(child)
            flexLine.crossSize = max(flexLine.crossSize, largestWidthInColumn)
            // Unlike the row direction, the gap is not counted in gapLengthInMainSize.
            if effectiveRowGap > 0 && hasPrecedingViews(i, indexInFlexLine) {
                flexLine.mainSize += effectiveRowGap
            }
            addFlexLineIfLastFlexItem(i, childCount, flexLine)
        }
        determineMainSize(widthMeasureSpec, heightMeasureSpec)
        determineCrossSize(widthMeasureSpec, heightMeasureSpec, effectivePaddingLeft + effectivePaddingRight)
        stretchViews()
        setMeasuredDimensionForFlex(widthMeasureSpec, heightMeasureSpec)
    }

    private func checkSizeConstraints(_ view: View) {
        var needsMeasure = false
        var childWidth = Double(view.measuredWidth)
        var childHeight = Double(view.measuredHeight)
        let minWidth = view.effectiveMinWidth
        view.effectiveMinWidth = 0
        if Double(view.measuredWidth) < minWidth {
            needsMeasure = true
            childWidth = minWidth
        } else if Double(view.measuredWidth) > view.effectiveMaxWidth {
            needsMeasure = true
            childWidth = view.effectiveMaxWidth
        }
        let minHeight = view.effectiveMinHeight
        view.effectiveMinHeight = 0
        if childHeight < minHeight {
            needsMeasure = true
            childHeight = minHeight
        } else if childHeight > view.effectiveMaxHeight {
            needsMeasure = true
            childHeight = view.effectiveMaxHeight
        }
        if needsMeasure {
            view.measure(LayoutHelper.makeMeasureSpec(childWidth, LayoutHelper.exactly), LayoutHelper.makeMeasureSpec(childHeight, LayoutHelper.exactly))
        }
        view.effectiveMinWidth = minWidth
        view.effectiveMinHeight = minHeight
    }

    private func addFlexLineIfLastFlexItem(_ childIndex: Int, _ childCount: Int, _ flexLine: FlexLine) {
        if childIndex == childCount - 1 && flexLine.layoutVisibleItemCount != 0 { flexLines.append(flexLine) }
    }

    private var isMainAxisDirectionHorizontal: Bool { flexDirection == "row" || flexDirection == "row-reverse" }

    private func determineMainSize(_ widthMeasureSpec: Int, _ heightMeasureSpec: Int) {
        let mainSize: Double
        let paddingAlongMainAxis: Double
        if isMainAxisDirectionHorizontal {
            mainSize = LayoutHelper.mode(widthMeasureSpec) == LayoutHelper.exactly ? Double(LayoutHelper.size(widthMeasureSpec)) : getLargestMainSize()
            paddingAlongMainAxis = effectivePaddingLeft + effectivePaddingRight
        } else {
            mainSize = LayoutHelper.mode(heightMeasureSpec) == LayoutHelper.exactly ? Double(LayoutHelper.size(heightMeasureSpec)) : getLargestMainSize()
            paddingAlongMainAxis = effectivePaddingTop + effectivePaddingBottom
        }
        var childIndex = 0
        for flexLine in flexLines {
            if flexLine.mainSize < mainSize {
                childIndex = expandFlexItems(flexLine, mainSize, paddingAlongMainAxis, childIndex)
            } else {
                childIndex = shrinkFlexItems(flexLine, mainSize, paddingAlongMainAxis, childIndex)
            }
        }
    }

    private func expandFlexItems(_ flexLine: FlexLine, _ maxMainSize: Double, _ paddingAlongMainAxis: Double, _ startIndex: Int) -> Int {
        var childIndex = startIndex
        if flexLine.totalFlexGrow <= 0 || maxMainSize < flexLine.mainSize {
            return childIndex + flexLine.itemCount
        }
        let sizeBeforeExpand = flexLine.mainSize
        var needsReexpand = false
        let pendingSpace = maxMainSize - flexLine.mainSize
        let unitSpace = pendingSpace / flexLine.totalFlexGrow
        flexLine.mainSize = paddingAlongMainAxis + flexLine.gapLengthInMainSize
        var accumulatedRoundError: Double = 0
        for _ in 0..<flexLine.itemCount {
            guard let child = getReorderedChildAt(childIndex) else { continue }
            if child.isCollapsed {
                childIndex += 1
                continue
            }
            if isMainAxisDirectionHorizontal {
                if !childrenFrozen[childIndex] {
                    let flexGrow = FlexboxLayout.getFlexGrow(child)
                    let rawCalculatedWidth = Double(child.measuredWidth) + unitSpace * flexGrow + accumulatedRoundError
                    var roundedCalculatedWidth = jsRound(rawCalculatedWidth)
                    if roundedCalculatedWidth > child.effectiveMaxWidth {
                        needsReexpand = true
                        roundedCalculatedWidth = child.effectiveMaxWidth
                        childrenFrozen[childIndex] = true
                        flexLine.totalFlexGrow -= flexGrow
                    } else {
                        accumulatedRoundError = rawCalculatedWidth - roundedCalculatedWidth
                    }
                    child.measure(LayoutHelper.makeMeasureSpec(roundedCalculatedWidth, LayoutHelper.exactly), LayoutHelper.makeMeasureSpec(Double(child.measuredHeight), LayoutHelper.exactly))
                }
                flexLine.mainSize += Double(child.measuredWidth) + child.effectiveMarginLeft + child.effectiveMarginRight
            } else {
                if !childrenFrozen[childIndex] {
                    let flexGrow = FlexboxLayout.getFlexGrow(child)
                    let rawCalculatedHeight = Double(child.measuredHeight) + unitSpace * flexGrow + accumulatedRoundError
                    var roundedCalculatedHeight = jsRound(rawCalculatedHeight)
                    if roundedCalculatedHeight > child.effectiveMaxHeight {
                        needsReexpand = true
                        roundedCalculatedHeight = child.effectiveMaxHeight
                        childrenFrozen[childIndex] = true
                        flexLine.totalFlexGrow -= flexGrow
                    } else {
                        accumulatedRoundError = rawCalculatedHeight - roundedCalculatedHeight
                    }
                    child.measure(LayoutHelper.makeMeasureSpec(Double(child.measuredWidth), LayoutHelper.exactly), LayoutHelper.makeMeasureSpec(roundedCalculatedHeight, LayoutHelper.exactly))
                }
                flexLine.mainSize += Double(child.measuredHeight) + child.effectiveMarginTop + child.effectiveMarginBottom
            }
            childIndex += 1
        }
        if needsReexpand && sizeBeforeExpand != flexLine.mainSize {
            _ = expandFlexItems(flexLine, maxMainSize, paddingAlongMainAxis, startIndex)
        }
        return childIndex
    }

    private func shrinkFlexItems(_ flexLine: FlexLine, _ maxMainSize: Double, _ paddingAlongMainAxis: Double, _ startIndex: Int) -> Int {
        var childIndex = startIndex
        let sizeBeforeShrink = flexLine.mainSize
        if flexLine.totalFlexShrink <= 0 || maxMainSize > flexLine.mainSize {
            return childIndex + flexLine.itemCount
        }
        var needsReshrink = false
        let unitShrink = (flexLine.mainSize - maxMainSize) / flexLine.totalFlexShrink
        var accumulatedRoundError: Double = 0
        flexLine.mainSize = paddingAlongMainAxis + flexLine.gapLengthInMainSize
        for _ in 0..<flexLine.itemCount {
            guard let child = getReorderedChildAt(childIndex) else { continue }
            if child.isCollapsed {
                childIndex += 1
                continue
            }
            if isMainAxisDirectionHorizontal {
                if !childrenFrozen[childIndex] {
                    let flexShrink = FlexboxLayout.getFlexShrink(child)
                    let rawCalculatedWidth = Double(child.measuredWidth) - unitShrink * flexShrink + accumulatedRoundError
                    var roundedCalculatedWidth = jsRound(rawCalculatedWidth)
                    let minWidth = child.effectiveMinWidth
                    child.effectiveMinWidth = 0
                    if roundedCalculatedWidth < minWidth {
                        needsReshrink = true
                        roundedCalculatedWidth = minWidth
                        childrenFrozen[childIndex] = true
                        flexLine.totalFlexShrink -= flexShrink
                    } else {
                        accumulatedRoundError = rawCalculatedWidth - roundedCalculatedWidth
                    }
                    let childWidthMeasureSpec = LayoutHelper.makeMeasureSpec(roundedCalculatedWidth, LayoutHelper.exactly)
                    // A narrower wrapping label may grow taller, so the height is measured again rather than kept.
                    let childHeightMeasureSpec = FlexboxLayout.getChildMeasureSpec(currentHeightMeasureSpec ?? 0,
                        child.effectivePaddingTop + child.effectivePaddingBottom + child.effectiveMarginTop + child.effectiveMarginBottom,
                        child.effectiveHeight < 0 ? FlexboxLayout.wrapContent : child.effectiveHeight)
                    child.measure(childWidthMeasureSpec, childHeightMeasureSpec)
                    child.effectiveMinWidth = minWidth
                    flexLine.crossSize = max(flexLine.crossSize, Double(child.measuredHeight) + child.effectiveMarginTop + child.effectiveMarginBottom)
                }
                flexLine.mainSize += Double(child.measuredWidth) + child.effectiveMarginLeft + child.effectiveMarginRight
            } else {
                if !childrenFrozen[childIndex] {
                    let flexShrink = FlexboxLayout.getFlexShrink(child)
                    let rawCalculatedHeight = Double(child.measuredHeight) - unitShrink * flexShrink + accumulatedRoundError
                    var roundedCalculatedHeight = jsRound(rawCalculatedHeight)
                    let minHeight = child.effectiveMinHeight
                    child.effectiveMinHeight = 0
                    if roundedCalculatedHeight < minHeight {
                        needsReshrink = true
                        roundedCalculatedHeight = minHeight
                        childrenFrozen[childIndex] = true
                        flexLine.totalFlexShrink -= flexShrink
                    } else {
                        accumulatedRoundError = rawCalculatedHeight - roundedCalculatedHeight
                    }
                    child.measure(LayoutHelper.makeMeasureSpec(Double(child.measuredWidth), LayoutHelper.exactly), LayoutHelper.makeMeasureSpec(roundedCalculatedHeight, LayoutHelper.exactly))
                    child.effectiveMinHeight = minHeight
                }
                flexLine.mainSize += Double(child.measuredHeight) + child.effectiveMarginTop + child.effectiveMarginBottom
            }
            childIndex += 1
        }
        if needsReshrink && sizeBeforeShrink != flexLine.mainSize {
            _ = shrinkFlexItems(flexLine, maxMainSize, paddingAlongMainAxis, startIndex)
        }
        return childIndex
    }

    private func determineCrossSize(_ widthMeasureSpec: Int, _ heightMeasureSpec: Int, _ paddingAlongCrossAxis: Double) {
        let spec = isMainAxisDirectionHorizontal ? heightMeasureSpec : widthMeasureSpec
        let mode = LayoutHelper.mode(spec)
        let size = Double(LayoutHelper.size(spec))
        guard mode == LayoutHelper.exactly else { return }
        let totalCrossSize = getSumOfCrossSize() + paddingAlongCrossAxis
        if flexLines.count == 1 {
            flexLines[0].crossSize = size - paddingAlongCrossAxis
        } else if flexLines.count >= 2 && totalCrossSize < size {
            switch alignContent {
            case "stretch":
                let freeSpaceUnit = (size - totalCrossSize) / Double(flexLines.count)
                var accumulatedError: Double = 0
                for (i, flexLine) in flexLines.enumerated() {
                    var newCrossSizeAsFloat = flexLine.crossSize + freeSpaceUnit
                    if i == flexLines.count - 1 {
                        newCrossSizeAsFloat += accumulatedError
                        accumulatedError = 0
                    }
                    var newCrossSize = jsRound(newCrossSizeAsFloat)
                    accumulatedError += newCrossSizeAsFloat - newCrossSize
                    if accumulatedError > 1 {
                        newCrossSize += 1
                        accumulatedError -= 1
                    } else if accumulatedError < -1 {
                        newCrossSize -= 1
                        accumulatedError += 1
                    }
                    flexLine.crossSize = newCrossSize
                }
            case "space-around":
                let numberOfSpaces = Double(flexLines.count * 2)
                let dummySpaceFlexLine = FlexLine()
                dummySpaceFlexLine.crossSize = (size - totalCrossSize) / numberOfSpaces
                flexLines = flexLines.flatMap { [dummySpaceFlexLine, $0, dummySpaceFlexLine] }
            case "space-between":
                let spaceBetweenFlexLine = (size - totalCrossSize) / Double(flexLines.count - 1)
                var accumulatedError: Double = 0
                var newFlexLines: [FlexLine] = []
                for (i, flexLine) in flexLines.enumerated() {
                    newFlexLines.append(flexLine)
                    if i != flexLines.count - 1 {
                        let dummySpaceFlexLine = FlexLine()
                        if i == flexLines.count - 2 {
                            dummySpaceFlexLine.crossSize = jsRound(spaceBetweenFlexLine + accumulatedError)
                            accumulatedError = 0
                        } else {
                            dummySpaceFlexLine.crossSize = jsRound(spaceBetweenFlexLine)
                        }
                        accumulatedError += spaceBetweenFlexLine - dummySpaceFlexLine.crossSize
                        if accumulatedError > 1 {
                            dummySpaceFlexLine.crossSize += 1
                            accumulatedError -= 1
                        } else if accumulatedError < -1 {
                            dummySpaceFlexLine.crossSize -= 1
                            accumulatedError += 1
                        }
                        newFlexLines.append(dummySpaceFlexLine)
                    }
                }
                flexLines = newFlexLines
            case "center":
                let dummySpaceFlexLine = FlexLine()
                dummySpaceFlexLine.crossSize = (size - totalCrossSize) / 2
                flexLines = [dummySpaceFlexLine] + flexLines + [dummySpaceFlexLine]
            case "flex-end":
                let dummySpaceFlexLine = FlexLine()
                dummySpaceFlexLine.crossSize = size - totalCrossSize
                flexLines.insert(dummySpaceFlexLine, at: 0)
            default:
                break
            }
        }
    }

    private func stretchViews() {
        if alignItems == "stretch" {
            var viewIndex = 0
            for flexLine in flexLines {
                for _ in 0..<flexLine.itemCount {
                    defer { viewIndex += 1 }
                    guard let view = getReorderedChildAt(viewIndex) else { continue }
                    let alignSelf = FlexboxLayout.getAlignSelf(view)
                    if alignSelf != "auto" && alignSelf != "stretch" { continue }
                    if isMainAxisDirectionHorizontal { stretchViewVertically(view, flexLine.crossSize) } else { stretchViewHorizontally(view, flexLine.crossSize) }
                }
            }
        } else {
            for flexLine in flexLines {
                for index in flexLine.indicesAlignSelfStretch {
                    guard let view = getReorderedChildAt(index) else { continue }
                    if isMainAxisDirectionHorizontal { stretchViewVertically(view, flexLine.crossSize) } else { stretchViewHorizontally(view, flexLine.crossSize) }
                }
            }
        }
    }

    private func stretchViewVertically(_ view: View, _ crossSize: Double) {
        let newHeight = max(crossSize - view.effectiveMarginTop - view.effectiveMarginBottom, 0)
        let originalMeasuredWidth = Double(view.measuredWidth)
        var childWidthMeasureSpec = FlexboxLayout.getChildMeasureSpec(currentWidthMeasureSpec ?? 0,
            view.effectivePaddingLeft + view.effectivePaddingRight + view.effectiveMarginLeft + view.effectiveMarginRight,
            view.effectiveWidth < 0 ? FlexboxLayout.wrapContent : min(view.effectiveWidth, originalMeasuredWidth))
        view.measure(childWidthMeasureSpec, LayoutHelper.makeMeasureSpec(newHeight, LayoutHelper.exactly))
        if originalMeasuredWidth > Double(view.measuredWidth) {
            childWidthMeasureSpec = LayoutHelper.makeMeasureSpec(originalMeasuredWidth, LayoutHelper.exactly)
            view.measure(childWidthMeasureSpec, LayoutHelper.makeMeasureSpec(newHeight, LayoutHelper.exactly))
        }
    }

    private func stretchViewHorizontally(_ view: View, _ crossSize: Double) {
        let newWidth = max(crossSize - view.effectiveMarginLeft - view.effectiveMarginRight, 0)
        view.measure(LayoutHelper.makeMeasureSpec(newWidth, LayoutHelper.exactly), LayoutHelper.makeMeasureSpec(Double(view.measuredHeight), LayoutHelper.exactly))
    }

    /// The measured states NativeScript combines here never reach a size, so they are left out.
    private func setMeasuredDimensionForFlex(_ widthMeasureSpec: Int, _ heightMeasureSpec: Int) {
        let widthMode = LayoutHelper.mode(widthMeasureSpec)
        var widthSize = Double(LayoutHelper.size(widthMeasureSpec))
        let heightMode = LayoutHelper.mode(heightMeasureSpec)
        var heightSize = Double(LayoutHelper.size(heightMeasureSpec))
        let calculatedMaxHeight: Double
        let calculatedMaxWidth: Double
        if isMainAxisDirectionHorizontal {
            calculatedMaxHeight = getSumOfCrossSize() + effectivePaddingTop + effectivePaddingBottom
            calculatedMaxWidth = getLargestMainSize()
        } else {
            calculatedMaxHeight = getLargestMainSize()
            calculatedMaxWidth = getSumOfCrossSize() + effectivePaddingLeft + effectivePaddingRight
        }
        let widthSizeAndState: Int
        switch widthMode {
        case LayoutHelper.exactly:
            widthSizeAndState = ViewHelper.resolveSizeAndState(widthSize, Int(widthSize), widthMode, 0)
        case LayoutHelper.atMost:
            if widthSize >= calculatedMaxWidth { widthSize = calculatedMaxWidth }
            widthSizeAndState = ViewHelper.resolveSizeAndState(widthSize, jsInt32(widthSize), widthMode, 0)
        default:
            widthSizeAndState = ViewHelper.resolveSizeAndState(calculatedMaxWidth, Int(widthSize), widthMode, 0)
        }
        let heightSizeAndState: Int
        switch heightMode {
        case LayoutHelper.exactly:
            heightSizeAndState = ViewHelper.resolveSizeAndState(heightSize, Int(heightSize), heightMode, 0)
        case LayoutHelper.atMost:
            if heightSize >= calculatedMaxHeight { heightSize = calculatedMaxHeight }
            heightSizeAndState = ViewHelper.resolveSizeAndState(heightSize, jsInt32(heightSize), heightMode, 0)
        default:
            heightSizeAndState = ViewHelper.resolveSizeAndState(calculatedMaxHeight, Int(heightSize), heightMode, 0)
        }
        setMeasuredDimension(widthSizeAndState, heightSizeAndState)
    }

    private func isWrapRequired(_ child: View, _ mode: Int, _ maxSize: Double, _ currentLength: Double, _ childLength: Double, _ childAbsoluteIndex: Int, _ childRelativeIndexInFlexLine: Int) -> Bool {
        if flexWrap == "nowrap" { return false }
        if FlexboxLayout.getFlexWrapBefore(child) { return true }
        if mode == LayoutHelper.unspecified { return false }
        var childLength = childLength
        let gap = isMainAxisDirectionHorizontal ? effectiveColumnGap : effectiveRowGap
        if gap > 0 && hasPrecedingViews(childAbsoluteIndex, childRelativeIndexInFlexLine) { childLength += gap }
        return maxSize < currentLength + childLength
    }

    private func getLargestMainSize() -> Double {
        flexLines.reduce(Double.leastNonzeroMagnitude) { max($0, $1.mainSize) }
    }

    private func getSumOfCrossSize() -> Double {
        let gap = isMainAxisDirectionHorizontal ? effectiveRowGap : effectiveColumnGap
        var sum: Double = 0
        for (i, flexLine) in flexLines.enumerated() {
            if gap > 0 && hasPrecedingFlexLines(i) { sum += gap }
            sum += flexLine.crossSize
        }
        return sum
    }

    // MARK: Layout

    open override func onLayout(_ left: Double, _ top: Double, _ right: Double, _ bottom: Double) {
        let insets = safeAreaInsetsPosition()
        var isRtl = false
        switch flexDirection {
        case "row":
            layoutHorizontal(isRtl, left, top, right, bottom, insets)
        case "row-reverse":
            layoutHorizontal(!isRtl, left, top, right, bottom, insets)
        case "column":
            if flexWrap == "wrap-reverse" { isRtl = !isRtl }
            layoutVertical(isRtl, false, left, top, right, bottom, insets)
        default:
            if flexWrap == "wrap-reverse" { isRtl = !isRtl }
            layoutVertical(isRtl, true, left, top, right, bottom, insets)
        }
    }

    private func layoutHorizontal(_ isRtl: Bool, _ left: Double, _ top: Double, _ right: Double, _ bottom: Double, _ insets: Position) {
        let paddingLeft = effectivePaddingLeft + insets.left
        let paddingTop = effectivePaddingTop + insets.top
        let paddingRight = effectivePaddingRight + insets.right
        let paddingBottom = effectivePaddingBottom + insets.bottom
        var childLeft: Double
        var currentViewIndex = 0
        let height = bottom - top
        let width = right - left
        var childBottom = height - paddingBottom
        var childTop = paddingTop
        var childRight: Double
        for (i, flexLine) in flexLines.enumerated() {
            if effectiveRowGap > 0 && hasPrecedingFlexLines(i) {
                childBottom -= effectiveRowGap
                childTop += effectiveRowGap
            }
            var spaceBetweenItem: Double = 0
            switch justifyContent {
            case "flex-end":
                childLeft = width - flexLine.mainSize + paddingRight
                childRight = flexLine.mainSize - paddingLeft
            case "center":
                childLeft = paddingLeft + (width - insets.left - insets.right - flexLine.mainSize) / 2
                childRight = width - paddingRight - (width - insets.left - insets.right - flexLine.mainSize) / 2
            case "space-around":
                let visibleCount = flexLine.layoutVisibleItemCount
                if visibleCount != 0 { spaceBetweenItem = (width - insets.left - insets.right - flexLine.mainSize) / Double(visibleCount) }
                childLeft = paddingLeft + spaceBetweenItem / 2
                childRight = width - paddingRight - spaceBetweenItem / 2
            case "space-between":
                let visibleCount = flexLine.layoutVisibleItemCount
                let denominator = visibleCount != 1 ? Double(visibleCount - 1) : 1
                childLeft = paddingLeft
                spaceBetweenItem = (width - insets.left - insets.right - flexLine.mainSize) / denominator
                childRight = width - paddingRight
            default:
                childLeft = paddingLeft
                childRight = width - paddingRight
            }
            spaceBetweenItem = max(spaceBetweenItem, 0)
            for j in 0..<flexLine.itemCount {
                guard let child = getReorderedChildAt(currentViewIndex) else { continue }
                if child.isCollapsed {
                    currentViewIndex += 1
                    continue
                }
                childLeft += child.effectiveMarginLeft
                childRight -= child.effectiveMarginRight
                if effectiveColumnGap > 0 && hasPrecedingViews(currentViewIndex, j) {
                    childLeft += effectiveColumnGap
                    childRight -= effectiveColumnGap
                }
                let w = Double(child.measuredWidth), h = Double(child.measuredHeight)
                if flexWrap == "wrap-reverse" {
                    if isRtl {
                        layoutSingleChildHorizontal(child, flexLine, jsRound(childRight) - w, childBottom - h, jsRound(childRight), childBottom)
                    } else {
                        layoutSingleChildHorizontal(child, flexLine, jsRound(childLeft), childBottom - h, jsRound(childLeft) + w, childBottom)
                    }
                } else {
                    if isRtl {
                        layoutSingleChildHorizontal(child, flexLine, jsRound(childRight) - w, childTop, jsRound(childRight), childTop + h)
                    } else {
                        layoutSingleChildHorizontal(child, flexLine, jsRound(childLeft), childTop, jsRound(childLeft) + w, childTop + h)
                    }
                }
                childLeft += w + spaceBetweenItem + child.effectiveMarginRight
                childRight -= w + spaceBetweenItem + child.effectiveMarginLeft
                currentViewIndex += 1
            }
            childTop += flexLine.crossSize
            childBottom -= flexLine.crossSize
        }
    }

    private func layoutSingleChildHorizontal(_ view: View, _ flexLine: FlexLine, _ left: Double, _ top: Double, _ right: Double, _ bottom: Double) {
        var alignItems = self.alignItems
        let alignSelf = FlexboxLayout.getAlignSelf(view)
        if alignSelf != "auto" { alignItems = alignSelf }
        let crossSize = flexLine.crossSize
        let h = Double(view.measuredHeight)
        let marginTop = view.effectiveMarginTop, marginBottom = view.effectiveMarginBottom
        switch alignItems {
        case "flex-start", "stretch":
            if flexWrap != "wrap-reverse" {
                view.layout(left, top + marginTop, right, bottom + marginTop)
            } else {
                view.layout(left, top - marginBottom, right, bottom - marginBottom)
            }
        case "baseline":
            if flexWrap != "wrap-reverse" {
                let offset = max(flexLine.maxBaseline - FlexboxLayout.getBaseline(view), marginTop)
                view.layout(left, top + offset, right, bottom + offset)
            } else {
                let offset = max(flexLine.maxBaseline - h + FlexboxLayout.getBaseline(view), marginBottom)
                view.layout(left, top - offset, right, bottom - offset)
            }
        case "flex-end":
            if flexWrap != "wrap-reverse" {
                view.layout(left, top + crossSize - h - marginBottom, right, top + crossSize - marginBottom)
            } else {
                view.layout(left, top - crossSize + h + marginTop, right, bottom - crossSize + h + marginTop)
            }
        case "center":
            let topFromCrossAxis = (crossSize - h) / 2
            if flexWrap != "wrap-reverse" {
                view.layout(left, top + topFromCrossAxis + marginTop - marginBottom, right, top + topFromCrossAxis + h + marginTop - marginBottom)
            } else {
                view.layout(left, top - topFromCrossAxis + marginTop - marginBottom, right, top - topFromCrossAxis + h + marginTop - marginBottom)
            }
        default:
            break
        }
    }

    private func layoutVertical(_ isRtl: Bool, _ fromBottomToTop: Bool, _ left: Double, _ top: Double, _ right: Double, _ bottom: Double, _ insets: Position) {
        let paddingLeft = effectivePaddingLeft + insets.left
        let paddingTop = effectivePaddingTop + insets.top
        let paddingRight = effectivePaddingRight + insets.right
        let paddingBottom = effectivePaddingBottom + insets.bottom
        var childLeft = paddingLeft
        var currentViewIndex = 0
        let width = right - left
        let height = bottom - top
        var childRight = width - paddingRight
        var childTop: Double
        var childBottom: Double
        for (i, flexLine) in flexLines.enumerated() {
            if effectiveColumnGap > 0 && hasPrecedingFlexLines(i) {
                childLeft += effectiveColumnGap
                childRight -= effectiveColumnGap
            }
            var spaceBetweenItem: Double = 0
            switch justifyContent {
            case "flex-end":
                childTop = height - flexLine.mainSize + paddingBottom
                childBottom = flexLine.mainSize - paddingTop
            case "center":
                childTop = paddingTop + (height - insets.top - insets.bottom - flexLine.mainSize) / 2
                childBottom = height - paddingBottom - (height - insets.top - insets.bottom - flexLine.mainSize) / 2
            case "space-around":
                let visibleCount = flexLine.layoutVisibleItemCount
                if visibleCount != 0 { spaceBetweenItem = (height - insets.top - insets.bottom - flexLine.mainSize) / Double(visibleCount) }
                childTop = paddingTop + spaceBetweenItem / 2
                childBottom = height - paddingBottom - spaceBetweenItem / 2
            case "space-between":
                let visibleCount = flexLine.layoutVisibleItemCount
                let denominator = visibleCount != 1 ? Double(visibleCount - 1) : 1
                childTop = paddingTop
                spaceBetweenItem = (height - insets.top - insets.bottom - flexLine.mainSize) / denominator
                childBottom = height - paddingBottom
            default:
                childTop = paddingTop
                childBottom = height - paddingBottom
            }
            spaceBetweenItem = max(spaceBetweenItem, 0)
            for j in 0..<flexLine.itemCount {
                guard let child = getReorderedChildAt(currentViewIndex) else { continue }
                if child.isCollapsed {
                    currentViewIndex += 1
                    continue
                }
                childTop += child.effectiveMarginTop
                childBottom -= child.effectiveMarginBottom
                if effectiveRowGap > 0 && hasPrecedingViews(currentViewIndex, j) {
                    childTop += effectiveRowGap
                    childBottom -= effectiveRowGap
                }
                let w = Double(child.measuredWidth), h = Double(child.measuredHeight)
                if isRtl {
                    if fromBottomToTop {
                        layoutSingleChildVertical(child, flexLine, true, childRight - w, jsRound(childBottom) - h, childRight, jsRound(childBottom))
                    } else {
                        layoutSingleChildVertical(child, flexLine, true, childRight - w, jsRound(childTop), childRight, jsRound(childTop) + h)
                    }
                } else {
                    if fromBottomToTop {
                        layoutSingleChildVertical(child, flexLine, false, childLeft, jsRound(childBottom) - h, childLeft + w, jsRound(childBottom))
                    } else {
                        layoutSingleChildVertical(child, flexLine, false, childLeft, jsRound(childTop), childLeft + w, jsRound(childTop) + h)
                    }
                }
                childTop += h + spaceBetweenItem + child.effectiveMarginBottom
                childBottom -= h + spaceBetweenItem + child.effectiveMarginTop
                currentViewIndex += 1
            }
            childLeft += flexLine.crossSize
            childRight -= flexLine.crossSize
        }
    }

    private func layoutSingleChildVertical(_ view: View, _ flexLine: FlexLine, _ isRtl: Bool, _ left: Double, _ top: Double, _ right: Double, _ bottom: Double) {
        var alignItems = self.alignItems
        let alignSelf = FlexboxLayout.getAlignSelf(view)
        if alignSelf != "auto" { alignItems = alignSelf }
        let crossSize = flexLine.crossSize
        let w = Double(view.measuredWidth)
        let marginLeft = view.effectiveMarginLeft, marginRight = view.effectiveMarginRight
        switch alignItems {
        case "flex-start", "stretch", "baseline":
            if !isRtl {
                view.layout(left + marginLeft, top, right + marginLeft, bottom)
            } else {
                view.layout(left - marginRight, top, right - marginRight, bottom)
            }
        case "flex-end":
            if !isRtl {
                view.layout(left + crossSize - w - marginRight, top, right + crossSize - w - marginRight, bottom)
            } else {
                view.layout(left - crossSize + w + marginLeft, top, right - crossSize + w + marginLeft, bottom)
            }
        case "center":
            let leftFromCrossAxis = (crossSize - w) / 2
            if !isRtl {
                view.layout(left + leftFromCrossAxis + marginLeft - marginRight, top, right + leftFromCrossAxis + marginLeft - marginRight, bottom)
            } else {
                view.layout(left - leftFromCrossAxis + marginLeft - marginRight, top, right - leftFromCrossAxis + marginLeft - marginRight, bottom)
            }
        default:
            break
        }
    }

    private func hasPrecedingViews(_ childAbsoluteIndex: Int, _ childRelativeIndexInFlexLine: Int) -> Bool {
        guard childRelativeIndexInFlexLine >= 1 else { return false }
        for i in 1...childRelativeIndexInFlexLine {
            if let view = getReorderedChildAt(childAbsoluteIndex - i), !view.isCollapsed { return true }
        }
        return false
    }

    private func hasPrecedingFlexLines(_ flexLineIndex: Int) -> Bool {
        if flexLineIndex < 0 || flexLineIndex >= flexLines.count { return false }
        for i in 0..<flexLineIndex where flexLines[i].layoutVisibleItemCount > 0 { return true }
        return false
    }

    private static func getChildMeasureSpec(_ spec: Int, _ padding: Double, _ childDimension: Double) -> Int {
        let specMode = LayoutHelper.mode(spec)
        let specSize = Double(LayoutHelper.size(spec))
        let size = max(0, specSize - padding)
        var resultSize: Double = 0
        var resultMode = 0
        switch specMode {
        case LayoutHelper.exactly:
            if childDimension >= 0 {
                resultSize = childDimension
                resultMode = LayoutHelper.exactly
            } else if childDimension == matchParent {
                resultSize = size
                resultMode = LayoutHelper.exactly
            } else if childDimension == wrapContent {
                resultSize = size
                resultMode = LayoutHelper.atMost
            }
        case LayoutHelper.atMost:
            if childDimension >= 0 {
                resultSize = childDimension
                resultMode = LayoutHelper.exactly
            } else {
                resultSize = size
                resultMode = LayoutHelper.atMost
            }
        default:
            if childDimension >= 0 {
                resultSize = childDimension
                resultMode = LayoutHelper.exactly
            } else {
                resultSize = 0
                resultMode = LayoutHelper.unspecified
            }
        }
        return LayoutHelper.makeMeasureSpec(resultSize, resultMode)
    }
}

/// JavaScript's `x | 0`.
func jsInt32(_ value: Double) -> Int {
    guard value.isFinite else { return 0 }
    return Int(Int32(truncatingIfNeeded: Int64(fmod(value.rounded(.towardZero), 4_294_967_296))))
}

/// The `flex` shorthand as NativeScript converts it (grow and shrink only;
/// `inital` is spelled as NativeScript matches it).
func expandFlex(_ value: Any?) -> [(String, Any?)] {
    guard let text = value.flatMap(toText) else { return [("flexGrow", nil), ("flexShrink", nil)] }
    func isValid(_ s: String) -> Bool { parseFloat(s).map { $0.isFinite && $0 >= 0 } ?? false }
    let values = text.split(whereSeparator: { $0.isWhitespace }).map(String.init)
    if values.count == 1 {
        switch values[0] {
        case "inital": return [("flexGrow", 0.0), ("flexShrink", 1.0)]
        case "auto": return [("flexGrow", 1.0), ("flexShrink", 1.0)]
        case "none": return [("flexGrow", 0.0), ("flexShrink", 0.0)]
        default: return isValid(values[0]) ? [("flexGrow", values[0]), ("flexShrink", 1.0)] : []
        }
    }
    if values.count >= 2, isValid(values[0]), isValid(values[1]) { return [("flexGrow", values[0]), ("flexShrink", values[1])] }
    return []
}

/// `flex-flow: <flex-direction> || <flex-wrap>`, each part kept only when valid.
func expandFlexFlow(_ value: Any?) -> [(String, Any?)] {
    guard let text = value as? String else { return [("flexDirection", value), ("flexWrap", value)] }
    let values = text.split(whereSeparator: { $0.isWhitespace }).map { $0.lowercased() }
    var result: [(String, Any?)] = []
    if values.count >= 1, ["row", "row-reverse", "column", "column-reverse"].contains(values[0]) { result.append(("flexDirection", values[0])) }
    if values.count >= 2, ["nowrap", "wrap", "wrap-reverse"].contains(values[1]) { result.append(("flexWrap", values[1])) }
    return result
}

/// `gap: <row> [<column>]`.
func expandGap(_ value: Any?) -> [(String, Any?)] {
    guard let text = value as? String, text != "auto" else { return [("rowGap", value), ("columnGap", value)] }
    if text.isEmpty { return [("rowGap", 0.0), ("columnGap", 0.0)] }
    let parts = text.split(whereSeparator: { $0 == " " || $0 == "," }).map(String.init)
    switch parts.count {
    case 1: return [("rowGap", parts[0]), ("columnGap", parts[0])]
    case 2: return [("rowGap", parts[0]), ("columnGap", parts[1])]
    default: return []
    }
}
