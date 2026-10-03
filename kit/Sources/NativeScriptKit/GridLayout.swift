import UIKit

/// `GridLayout` from layouts/grid-layout (index.ios and grid-layout-common),
/// including its MeasureHelper, ported statement for statement: star and
/// auto lengths are distributed and rounded in the same order.
open class GridLayout: LayoutBase {
    open override class var cssType: String { "GridLayout" }

    final class ItemSpec {
        enum Unit { case pixel, star, auto }
        let value: Double
        let unit: Unit
        var actualLength: Double = 0

        init(_ value: Double = 1, _ unit: Unit = .star) {
            self.value = value
            self.unit = unit
        }

        var isAbsolute: Bool { unit == .pixel }
        var isAuto: Bool { unit == .auto }
        var isStar: Bool { unit == .star }

        /// `convertGridLength`: "auto", "*", "2*", or a number of DIPs (parseInt, as NativeScript reads it).
        static func parse(_ text: String) -> ItemSpec? {
            if text == "auto" { return ItemSpec(1, .auto) }
            if text.contains("*") {
                let count = text.replacingOccurrences(of: "*", with: "")
                return ItemSpec(count.isEmpty ? 1 : Double(parseInt(count) ?? 1), .star)
            }
            if let value = parseInt(text) { return ItemSpec(Double(value), .pixel) }
            return nil
        }
    }

    private var rowsInternal: [ItemSpec] = []
    private var columnsInternal: [ItemSpec] = []
    private var columnOffsets: [Double] = []
    private var rowOffsets: [Double] = []
    private var map: [ObjectIdentifier: MeasureSpecs] = [:]
    private lazy var helper = MeasureHelper(grid: self)

    open override func setProperty(_ name: String, _ value: Any?) {
        switch name {
        case "rows":
            removeRows()
            addRows(GridLayout.parseSpecs(value))
        case "columns":
            removeColumns()
            addColumns(GridLayout.parseSpecs(value))
        default:
            super.setProperty(name, value)
        }
    }

    private static func parseSpecs(_ value: Any?) -> [ItemSpec] {
        guard let text = toText(value) else { return [] }
        return text.split(whereSeparator: { $0 == " " || $0 == "," }).compactMap { ItemSpec.parse(String($0)) }
    }

    private func addRows(_ specs: [ItemSpec]) {
        for spec in specs {
            rowsInternal.append(spec)
            helper.rows.append(ItemGroup(spec))
        }
        invalidate()
    }

    private func addColumns(_ specs: [ItemSpec]) {
        for spec in specs {
            columnsInternal.append(spec)
            helper.columns.append(ItemGroup(spec))
        }
        invalidate()
    }

    private func removeRows() {
        for i in stride(from: rowsInternal.count - 1, through: 0, by: -1) {
            helper.rows[i].children.removeAll()
            helper.rows.remove(at: i)
        }
        rowsInternal.removeAll()
        invalidate()
    }

    private func removeColumns() {
        for i in stride(from: columnsInternal.count - 1, through: 0, by: -1) {
            helper.columns[i].children.removeAll()
            helper.columns.remove(at: i)
        }
        columnsInternal.removeAll()
        invalidate()
    }

    func invalidate() { requestLayout() }

    override func registerLayoutChild(_ child: View) { map[ObjectIdentifier(child)] = MeasureSpecs(child) }
    override func unregisterLayoutChild(_ child: View) { map[ObjectIdentifier(child)] = nil }

    private func columnIndex(_ view: View) -> Int { max(0, min(view.col, columnsInternal.count - 1)) }
    private func rowIndex(_ view: View) -> Int { max(0, min(view.row, rowsInternal.count - 1)) }
    private func columnSpan(_ view: View, _ index: Int) -> Int { max(1, min(view.colSpan, columnsInternal.count - index)) }
    private func rowSpan(_ view: View, _ index: Int) -> Int { max(1, min(view.rowSpan, rowsInternal.count - index)) }

    private func updateMeasureSpecs(_ child: View, _ spec: MeasureSpecs) {
        let ci = columnIndex(child)
        let ri = rowIndex(child)
        spec.columnIndex = ci
        spec.columnSpan = columnSpan(child, ci)
        spec.rowIndex = ri
        spec.rowSpan = rowSpan(child, ri)
        spec.autoColumnsCount = 0
        spec.autoRowsCount = 0
        spec.measured = false
        spec.pixelHeight = 0
        spec.pixelWidth = 0
        spec.starColumnsCount = 0
        spec.starRowsCount = 0
    }

    open override func onMeasure(_ widthMeasureSpec: Int, _ heightMeasureSpec: Int) {
        let width = LayoutHelper.size(widthMeasureSpec), widthMode = LayoutHelper.mode(widthMeasureSpec)
        let height = LayoutHelper.size(heightMeasureSpec), heightMode = LayoutHelper.mode(heightMeasureSpec)
        let horizontalPaddingsAndMargins = effectivePaddingLeft + effectivePaddingRight + effectiveBorderLeftWidth + effectiveBorderRightWidth
        let verticalPaddingsAndMargins = effectivePaddingTop + effectivePaddingBottom + effectiveBorderTopWidth + effectiveBorderBottomWidth
        let infinityWidth = widthMode == LayoutHelper.unspecified
        let infinityHeight = heightMode == LayoutHelper.unspecified
        helper.width = max(0, Double(width) - horizontalPaddingsAndMargins)
        helper.height = max(0, Double(height) - verticalPaddingsAndMargins)
        helper.stretchedHorizontally = widthMode == LayoutHelper.exactly || (horizontalAlignment == "stretch" && !infinityWidth)
        helper.stretchedVertically = heightMode == LayoutHelper.exactly || (verticalAlignment == "stretch" && !infinityHeight)
        helper.setInfinityWidth(infinityWidth)
        helper.setInfinityHeight(infinityHeight)
        helper.clearMeasureSpecs()
        helper.initGroups()
        eachLayoutChild { child in
            guard let spec = map[ObjectIdentifier(child)] else { return }
            updateMeasureSpecs(child, spec)
            helper.addMeasureSpec(spec)
        }
        helper.measure()
        var measureWidth = helper.measuredWidth + horizontalPaddingsAndMargins
        var measureHeight = helper.measuredHeight + verticalPaddingsAndMargins
        measureWidth = min(max(measureWidth, effectiveMinWidth), effectiveMaxWidth)
        measureHeight = min(max(measureHeight, effectiveMinHeight), effectiveMaxHeight)
        setMeasuredDimension(
            ViewHelper.resolveSizeAndState(measureWidth, width, widthMode, 0),
            ViewHelper.resolveSizeAndState(measureHeight, height, heightMode, 0))
    }

    open override func onLayout(_ left: Double, _ top: Double, _ right: Double, _ bottom: Double) {
        let insets = getSafeAreaInsets()
        let paddingLeft = effectiveBorderLeftWidth + effectivePaddingLeft + insets.left
        let paddingTop = effectiveBorderTopWidth + effectivePaddingTop + insets.top
        columnOffsets = [paddingLeft]
        rowOffsets = [paddingTop]
        var offset = paddingLeft
        var roundedOffset = paddingLeft
        for group in helper.columns {
            offset += group.length
            let roundedLength = jsRound(offset - roundedOffset)
            group.spec.actualLength = LayoutHelper.round(LayoutHelper.toDeviceIndependentPixels(roundedLength))
            roundedOffset += roundedLength
            columnOffsets.append(roundedOffset)
        }
        offset = paddingTop
        roundedOffset = paddingTop
        for group in helper.rows {
            offset += group.length
            let roundedLength = jsRound(offset - roundedOffset)
            group.spec.actualLength = LayoutHelper.round(LayoutHelper.toDeviceIndependentPixels(roundedLength))
            roundedOffset += roundedLength
            rowOffsets.append(roundedOffset)
        }
        for group in helper.columns {
            for spec in group.children {
                ViewHelper.layoutChild(self, spec.child,
                                       columnOffsets[spec.columnIndex], rowOffsets[spec.rowIndex],
                                       columnOffsets[spec.columnIndex + spec.columnSpan], rowOffsets[spec.rowIndex + spec.rowSpan])
            }
        }
    }
}

/// JavaScript `parseInt` in base 10.
private func parseInt(_ text: String) -> Int? {
    let s = text.trimmingCharacters(in: .whitespaces)
    var digits = ""
    for (i, c) in s.enumerated() {
        if c.isASCII && c.isNumber { digits.append(c) } else if i == 0 && (c == "-" || c == "+") { digits.append(c) } else { break }
    }
    return Int(digits)
}

private final class MeasureSpecs {
    let child: View
    var columnSpan = 1 { didSet { columnSpan = max(1, columnSpan) } }
    var rowSpan = 1 { didSet { rowSpan = max(1, rowSpan) } }
    var pixelWidth: Double = 0
    var pixelHeight: Double = 0
    var starColumnsCount: Double = 0
    var starRowsCount: Double = 0
    var autoColumnsCount: Double = 0
    var autoRowsCount: Double = 0
    var measured = false
    var columnIndex = 0
    var rowIndex = 0

    init(_ child: View) { self.child = child }

    var spanned: Bool { columnSpan > 1 || rowSpan > 1 }
    var isStar: Bool { starRowsCount > 0 || starColumnsCount > 0 }
}

private final class ItemGroup {
    let spec: GridLayout.ItemSpec
    var length: Double = 0
    var measuredCount = 0
    var children: [MeasureSpecs] = []
    var measureToFix = 0
    var currentMeasureToFixCount = 0
    var infinityLength = false

    init(_ spec: GridLayout.ItemSpec) { self.spec = spec }

    func initLength(_ density: Double) {
        measuredCount = 0
        currentMeasureToFixCount = 0
        length = spec.isAbsolute ? spec.value * density : 0
    }

    var allMeasured: Bool { measuredCount == children.count }
    var canBeFixed: Bool { currentMeasureToFixCount == measureToFix }
    var isAuto: Bool { spec.isAuto || (spec.isStar && infinityLength) }
    var isStar: Bool { spec.isStar && !infinityLength }
    var isAbsolute: Bool { spec.isAbsolute }
}

private final class MeasureHelper {
    let infinity = LayoutHelper.makeMeasureSpec(0, LayoutHelper.unspecified)
    var rows: [ItemGroup] = []
    var columns: [ItemGroup] = []
    var width: Double = 0
    var height: Double = 0
    var stretchedHorizontally = false
    var stretchedVertically = false
    var infinityWidth = false
    var infinityHeight = false
    var minColumnStarValue: Double = 0
    var maxColumnStarValue: Double = 0
    var minRowStarValue: Double = 0
    var maxRowStarValue: Double = 0
    var measuredWidth: Double = 0
    var measuredHeight: Double = 0
    var fakeRowAdded = false
    var fakeColumnAdded = false
    unowned let grid: GridLayout
    let singleRowGroup = ItemGroup(GridLayout.ItemSpec())
    let singleColumnGroup = ItemGroup(GridLayout.ItemSpec())

    init(grid: GridLayout) { self.grid = grid }

    func setInfinityWidth(_ value: Bool) {
        infinityWidth = value
        for group in columns { group.infinityLength = value }
    }

    func setInfinityHeight(_ value: Bool) {
        infinityHeight = value
        for group in rows { group.infinityLength = value }
    }

    func addMeasureSpec(_ spec: MeasureSpecs) {
        var end = spec.columnIndex + spec.columnSpan
        for i in spec.columnIndex..<end {
            let group = columns[i]
            if group.isAuto { spec.autoColumnsCount += 1 }
            else if group.isStar { spec.starColumnsCount += group.spec.value }
            else if group.isAbsolute { spec.pixelWidth += LayoutHelper.toDevicePixels(group.spec.value) }
        }
        if spec.autoColumnsCount > 0 && spec.starColumnsCount == 0 {
            for i in spec.columnIndex..<end where columns[i].isAuto { columns[i].measureToFix += 1 }
        }
        end = spec.rowIndex + spec.rowSpan
        for i in spec.rowIndex..<end {
            let group = rows[i]
            if group.isAuto { spec.autoRowsCount += 1 }
            else if group.isStar { spec.starRowsCount += group.spec.value }
            else if group.isAbsolute { spec.pixelHeight += LayoutHelper.toDevicePixels(group.spec.value) }
        }
        if spec.autoRowsCount > 0 && spec.starRowsCount == 0 {
            for i in spec.rowIndex..<end where rows[i].isAuto { rows[i].measureToFix += 1 }
        }
        columns[spec.columnIndex].children.append(spec)
        rows[spec.rowIndex].children.append(spec)
    }

    func clearMeasureSpecs() {
        for group in columns { group.children.removeAll() }
        for group in rows { group.children.removeAll() }
    }

    func initGroups() {
        if rows.isEmpty {
            singleRowGroup.infinityLength = infinityHeight
            rows.append(singleRowGroup)
            fakeRowAdded = true
        } else if rows.count > 1 && fakeRowAdded {
            rows.remove(at: 0)
            fakeRowAdded = false
        }
        if columns.isEmpty {
            fakeColumnAdded = true
            singleColumnGroup.infinityLength = infinityWidth
            columns.append(singleColumnGroup)
        } else if columns.count > 1 && fakeColumnAdded {
            columns.remove(at: 0)
            fakeColumnAdded = false
        }
        let density = Double(LayoutHelper.scale)
        for group in rows { group.initLength(density) }
        for group in columns { group.initLength(density) }
        minColumnStarValue = -1
        minRowStarValue = -1
        maxColumnStarValue = -1
        maxRowStarValue = -1
    }

    func itemMeasured(_ spec: MeasureSpecs, _ isFakeMeasure: Bool) {
        if !isFakeMeasure {
            columns[spec.columnIndex].measuredCount += 1
            rows[spec.rowIndex].measuredCount += 1
            spec.measured = true
        }
        if spec.autoColumnsCount > 0 && spec.starColumnsCount == 0 {
            for i in spec.columnIndex..<(spec.columnIndex + spec.columnSpan) where columns[i].isAuto { columns[i].currentMeasureToFixCount += 1 }
        }
        if spec.autoRowsCount > 0 && spec.starRowsCount == 0 {
            for i in spec.rowIndex..<(spec.rowIndex + spec.rowSpan) where rows[i].isAuto { rows[i].currentMeasureToFixCount += 1 }
        }
    }

    func fixColumns() {
        var currentColumnWidth: Double = 0
        var columnStarCount: Double = 0
        for item in columns {
            if item.spec.isStar { columnStarCount += item.spec.value } else { currentColumnWidth += item.length }
        }
        let widthForStarColumns = max(0, width - currentColumnWidth)
        maxColumnStarValue = columnStarCount > 0 ? widthForStarColumns / columnStarCount : 0
        MeasureHelper.updateStarLength(columns, maxColumnStarValue)
    }

    func fixRows() {
        var currentRowHeight: Double = 0
        var rowStarCount: Double = 0
        for item in rows {
            if item.spec.isStar { rowStarCount += item.spec.value } else { currentRowHeight += item.length }
        }
        let heightForStarRows = max(0, height - currentRowHeight)
        maxRowStarValue = rowStarCount > 0 ? heightForStarRows / rowStarCount : 0
        MeasureHelper.updateStarLength(rows, maxRowStarValue)
    }

    static func updateStarLength(_ list: [ItemGroup], _ starValue: Double) {
        var offset: Double = 0
        var roundedOffset: Double = 0
        for item in list where item.isStar {
            offset += item.spec.value * starValue
            let roundedLength = jsRound(offset - roundedOffset)
            item.length = roundedLength
            roundedOffset += roundedLength
        }
    }

    func fakeMeasure() {
        for group in columns where !group.allMeasured {
            for spec in group.children where spec.starRowsCount > 0 && spec.autoColumnsCount > 0 && spec.starColumnsCount == 0 {
                measureChild(spec, true)
            }
        }
    }

    func measureFixedColumnsNoStarRows() {
        for group in columns {
            for spec in group.children where spec.starColumnsCount > 0 && spec.starRowsCount == 0 {
                measureChildFixedColumns(spec)
            }
        }
    }

    func measureNoStarColumnsFixedRows() {
        for group in columns {
            for spec in group.children where spec.starRowsCount > 0 && spec.starColumnsCount == 0 {
                measureChildFixedRows(spec)
            }
        }
    }

    static func canFix(_ list: [ItemGroup]) -> Bool { list.allSatisfy(\.canBeFixed) }

    static func measureLength(_ list: [ItemGroup]) -> Double { list.reduce(0) { $0 + $1.length } }

    func measure() {
        for group in columns {
            for spec in group.children where !spec.isStar && !spec.spanned { measureChild(spec, false) }
        }
        for group in columns {
            for spec in group.children where !spec.isStar && spec.spanned { measureChild(spec, false) }
        }
        let fixColumns = MeasureHelper.canFix(columns)
        let fixRows = MeasureHelper.canFix(rows)
        if fixColumns { self.fixColumns() }
        if fixRows { self.fixRows() }
        if !fixColumns && !fixRows {
            fakeMeasure()
            self.fixColumns()
            measureFixedColumnsNoStarRows()
            self.fixRows()
        } else if fixColumns && !fixRows {
            measureFixedColumnsNoStarRows()
            self.fixRows()
        } else if !fixColumns && fixRows {
            measureNoStarColumnsFixedRows()
            self.fixColumns()
        }
        for group in columns {
            for spec in group.children where !spec.measured { measureChildFixedColumnsAndRows(spec) }
        }
        if !stretchedHorizontally && minColumnStarValue != -1 && minColumnStarValue < maxColumnStarValue {
            MeasureHelper.updateStarLength(columns, minColumnStarValue)
        }
        if !stretchedVertically && minRowStarValue != -1 && minRowStarValue < maxRowStarValue {
            MeasureHelper.updateStarLength(rows, minRowStarValue)
        }
        measuredWidth = MeasureHelper.measureLength(columns)
        measuredHeight = MeasureHelper.measureLength(rows)
    }

    private func grow(_ list: [ItemGroup], _ range: Range<Int>, by measured: Double, count: Double) {
        var remaining = measured
        for i in range { remaining -= list[i].length }
        if remaining > 0 {
            let growSize = remaining / count
            for i in range where list[i].isAuto { list[i].length += growSize }
        }
    }

    func measureChild(_ spec: MeasureSpecs, _ isFakeMeasure: Bool) {
        let widthSpec = spec.autoColumnsCount > 0 ? infinity : LayoutHelper.makeMeasureSpec(spec.pixelWidth, LayoutHelper.exactly)
        let heightSpec = isFakeMeasure || spec.autoRowsCount > 0 ? infinity : LayoutHelper.makeMeasureSpec(spec.pixelHeight, LayoutHelper.exactly)
        let size = ViewHelper.measureChild(grid, spec.child, widthSpec, heightSpec)
        if spec.autoColumnsCount > 0 {
            grow(columns, spec.columnIndex..<(spec.columnIndex + spec.columnSpan), by: size.width, count: spec.autoColumnsCount)
        }
        if !isFakeMeasure && spec.autoRowsCount > 0 {
            grow(rows, spec.rowIndex..<(spec.rowIndex + spec.rowSpan), by: size.height, count: spec.autoRowsCount)
        }
        itemMeasured(spec, isFakeMeasure)
    }

    func measureChildFixedColumns(_ spec: MeasureSpecs) {
        let columnRange = spec.columnIndex..<(spec.columnIndex + spec.columnSpan)
        let measureWidth = columnRange.reduce(0) { $0 + columns[$1].length }
        let widthSpec = LayoutHelper.makeMeasureSpec(measureWidth, stretchedHorizontally ? LayoutHelper.exactly : LayoutHelper.atMost)
        let heightSpec = spec.autoRowsCount > 0 ? infinity : LayoutHelper.makeMeasureSpec(spec.pixelHeight, LayoutHelper.exactly)
        let size = ViewHelper.measureChild(grid, spec.child, widthSpec, heightSpec)
        updateMinColumnStarValueIfNeeded(spec, size.width)
        if spec.autoRowsCount > 0 {
            grow(rows, spec.rowIndex..<(spec.rowIndex + spec.rowSpan), by: size.height, count: spec.autoRowsCount)
        }
        itemMeasured(spec, false)
    }

    func measureChildFixedRows(_ spec: MeasureSpecs) {
        let rowRange = spec.rowIndex..<(spec.rowIndex + spec.rowSpan)
        let measureHeight = rowRange.reduce(0) { $0 + rows[$1].length }
        let widthSpec = spec.autoColumnsCount > 0 ? infinity : LayoutHelper.makeMeasureSpec(spec.pixelWidth, LayoutHelper.exactly)
        let heightSpec = LayoutHelper.makeMeasureSpec(measureHeight, stretchedVertically ? LayoutHelper.exactly : LayoutHelper.atMost)
        let size = ViewHelper.measureChild(grid, spec.child, widthSpec, heightSpec)
        if spec.autoColumnsCount > 0 {
            grow(columns, spec.columnIndex..<(spec.columnIndex + spec.columnSpan), by: size.width, count: spec.autoColumnsCount)
        }
        updateMinRowStarValueIfNeeded(spec, size.height)
        itemMeasured(spec, false)
    }

    func measureChildFixedColumnsAndRows(_ spec: MeasureSpecs) {
        let measureWidth = (spec.columnIndex..<(spec.columnIndex + spec.columnSpan)).reduce(0) { $0 + columns[$1].length }
        let measureHeight = (spec.rowIndex..<(spec.rowIndex + spec.rowSpan)).reduce(0) { $0 + rows[$1].length }
        let widthSpec = LayoutHelper.makeMeasureSpec(measureWidth, spec.starColumnsCount > 0 && !stretchedHorizontally ? LayoutHelper.atMost : LayoutHelper.exactly)
        let heightSpec = LayoutHelper.makeMeasureSpec(measureHeight, spec.starRowsCount > 0 && !stretchedVertically ? LayoutHelper.atMost : LayoutHelper.exactly)
        let size = ViewHelper.measureChild(grid, spec.child, widthSpec, heightSpec)
        updateMinColumnStarValueIfNeeded(spec, size.width)
        updateMinRowStarValueIfNeeded(spec, size.height)
        itemMeasured(spec, false)
    }

    func updateMinRowStarValueIfNeeded(_ spec: MeasureSpecs, _ childMeasuredHeight: Double) {
        guard !stretchedVertically && spec.starRowsCount > 0 else { return }
        var remaining = childMeasuredHeight
        for i in spec.rowIndex..<(spec.rowIndex + spec.rowSpan) where !rows[i].isStar { remaining -= rows[i].length }
        if remaining > 0 { minRowStarValue = max(remaining / spec.starRowsCount, minRowStarValue) }
    }

    func updateMinColumnStarValueIfNeeded(_ spec: MeasureSpecs, _ childMeasuredWidth: Double) {
        guard !stretchedHorizontally && spec.starColumnsCount > 0 else { return }
        var remaining = childMeasuredWidth
        for i in spec.columnIndex..<(spec.columnIndex + spec.columnSpan) where !columns[i].isStar { remaining -= columns[i].length }
        if remaining > 0 { minColumnStarValue = max(remaining / spec.starColumnsCount, minColumnStarValue) }
    }
}
