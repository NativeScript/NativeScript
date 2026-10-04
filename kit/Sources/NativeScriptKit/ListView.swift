import UIKit

/// A row's item and index as its template's bindings read them. A recycled
/// cell keeps its views; writing the next item re-runs only its bindings.
public final class ListRow<Item> {
    public let item: Signal<Item>
    public let index: Signal<Double>

    init(_ item: Item, _ index: Double) {
        self.item = Signal(item)
        self.index = Signal(index)
    }
}

/// nativescript-vue's item context, what its `itemTemplateSelector` receives.
public struct ListItem<T> {
    public let item: T
    public let index: Double
    public let even: Bool
    public let odd: Bool

    public init(item: T, index: Double, even: Bool, odd: Bool) {
        self.item = item
        self.index = index
        self.even = even
        self.odd = odd
    }
}

/// The items a ListView shows and the templates that render them, with the item type erased.
/// A flat list is one section; a sectioned list's items are its sections, each holding its rows.
protocol ListSource: AnyObject {
    var sectionCount: Int { get }
    func count(in section: Int) -> Int
    func item(at path: IndexPath) -> Any
    func templateKey(at path: IndexPath) -> String
    func makeContent(key: String, at path: IndexPath) -> ListContent
    var hasHeader: Bool { get }
    func makeHeader(section: Int) -> ListContent
}

/// A cell's rendered template: its view, the scope its bindings live in, and how to show another item.
final class ListContent {
    let view: View
    let owner: Owner
    let show: (IndexPath) -> Void

    init(view: View, owner: Owner, show: @escaping (IndexPath) -> Void) {
        self.view = view
        self.owner = owner
        self.show = show
    }
}

private final class ItemsSource<Section, Item>: ListSource {
    private(set) var sections: [Section] = []
    /// Each section's rows, read once per update.
    private var rowsBySection: [[Item]] = []
    /// A section's rows; nil for a flat list, whose one section is its items.
    let rows: ((Section) -> [Item])?
    let selector: ((Item, Double) -> String)?
    let render: ((String, ListRow<Item>) -> View)?
    let header: ((ListRow<Section>) -> View)?

    init(rows: ((Section) -> [Item])?, selector: ((Item, Double) -> String)?, render: ((String, ListRow<Item>) -> View)?, header: ((ListRow<Section>) -> View)?) {
        self.rows = rows
        self.selector = selector
        self.render = render
        self.header = header
    }

    func update(sections: [Section], items: [Item]) {
        self.sections = sections
        rowsBySection = rows.map { rows in sections.map(rows) } ?? [items]
    }

    private func items(in section: Int) -> [Item] { section < rowsBySection.count ? rowsBySection[section] : [] }

    var sectionCount: Int { rows == nil ? 1 : sections.count }
    func count(in section: Int) -> Int { items(in: section).count }
    func item(at path: IndexPath) -> Any { items(in: path.section)[path.row] }
    private func typedItem(at path: IndexPath) -> Item { items(in: path.section)[path.row] }

    /// The index a template sees: rows counted across the sections before this one.
    private func absoluteIndex(_ path: IndexPath) -> Double {
        Double((0..<path.section).reduce(path.row) { $0 + count(in: $1) })
    }

    func templateKey(at path: IndexPath) -> String {
        selector?(typedItem(at: path), absoluteIndex(path)) ?? "default"
    }

    func makeContent(key: String, at path: IndexPath) -> ListContent {
        let owner = Owner(parent: nil)
        let row = ListRow(typedItem(at: path), absoluteIndex(path))
        let view: View = owner.run {
            if let render { return render(key, row) }
            // `_getDefaultItemContent`: a Label showing the item.
            let label = Label()
            Effect { label.set("text", toText(row.item.value as Any) ?? "") }
            return label
        }
        return ListContent(view: view, owner: owner) { [unowned self] next in
            guard next.section < self.sectionCount, next.row < self.count(in: next.section) else { return }
            batch {
                row.item.value = self.typedItem(at: next)
                row.index.value = self.absoluteIndex(next)
            }
        }
    }

    var hasHeader: Bool { header != nil }

    func makeHeader(section: Int) -> ListContent {
        let owner = Owner(parent: nil)
        let row = ListRow(sections[section], Double(section))
        let view: View = owner.run { header!(row) }
        return ListContent(view: view, owner: owner) { [unowned self] next in
            guard next.section < self.sections.count else { return }
            batch {
                row.item.value = self.sections[next.section]
                row.index.value = Double(next.section)
            }
        }
    }
}

/// `ListViewCell` from list-view/index.ios: transparent, holding one template's view.
final class ListViewCell: UITableViewCell {
    weak var list: ListView?
    var content: ListContent?

    override init(style: UITableViewCell.CellStyle, reuseIdentifier: String?) {
        super.init(style: style, reuseIdentifier: reuseIdentifier)
        backgroundColor = .clear
    }

    required init?(coder: NSCoder) { fatalError("init(coder:) is not supported") }

    override func willMove(toSuperview newSuperview: UIView?) {
        super.willMove(toSuperview: newSuperview)
        if newSuperview == nil, content != nil, let list { list.removeContainer(self) }
    }
}

/// `ListView` from list-view/index.ios and list-view-common: a UITableView
/// whose rows are template views, measured to find each row's height.
open class ListView: View, UITableViewDataSource, UITableViewDelegate {
    open override class var cssType: String { "ListView" }
    open override class var overflowsSafeArea: Bool { true }

    private static let defaultHeight: CGFloat = 44

    private var tableView: UITableView? { nativeView as? UITableView }
    private var source: ListSource?
    private var templateKeys: [String] = ["default"]
    /// Measured row heights in device pixels.
    private var heights: [IndexPath: Double] = [:]
    private var preparingCell = false
    /// Cells and the template views in them, in the order they were prepared.
    private var cells: [ListViewCell] = []
    private var measureCells: [String: ListViewCell] = [:]
    private var effectiveRowHeight: Double = -1
    var widthMeasureSpec = 0
    private var sectioned = false
    private var stickyHeader = false
    private var stickyHeaderHeight: Any? = "auto"
    /// iOS's own padding above a section header, which the list removes unless asked to keep it.
    private var stickyHeaderTopPadding = true
    private var preparingHeader = false
    private var headers: [ListViewHeaderCell] = []

    /// The sticky header's height in device pixels: 44 points when `auto`.
    private var headerHeight: Double {
        if let s = stickyHeaderHeight as? String, s == "auto" { return LayoutHelper.toDevicePixels(44) }
        return Length(stickyHeaderHeight, default: .auto).toDevicePixels(auto: LayoutHelper.toDevicePixels(44))
    }

    open override func createNativeView() -> UIView? { UITableView() }

    open override func initNativeView() {
        guard let tableView else { return }
        tableView.register(ListViewCell.self, forCellReuseIdentifier: "default")
        tableView.register(ListViewHeaderCell.self, forHeaderFooterViewReuseIdentifier: "stickyHeader")
        tableView.estimatedRowHeight = ListView.defaultHeight
        tableView.rowHeight = UITableView.automaticDimension
        tableView.dataSource = self
        tableView.delegate = self
        if !stickyHeaderTopPadding { tableView.sectionHeaderTopPadding = 0 }
        setNativeClipToBounds()
    }

    open override func setNativeClipToBounds() { nativeView?.clipsToBounds = true }

    /// Binds the items and the templates: `render` makes the view for a template key and a row.
    public func bind<Item>(items: @escaping () -> [Item], templates: [String] = ["default"], selector: ((Item, Double) -> String)? = nil,
                           render: ((String, ListRow<Item>) -> View)? = nil) {
        let source = ItemsSource<Item, Item>(rows: nil, selector: selector, render: render, header: nil)
        bind(source, templates: templates) { source.update(sections: [], items: items()) }
    }

    /// A sectioned list (`sectioned`): the items are sections, `rows` reads a section's rows, and
    /// `header` renders a section's sticky header. Templates see a row's index across all sections.
    public func bind<Section, Item>(sections: @escaping () -> [Section], rows: @escaping (Section) -> [Item], templates: [String] = ["default"],
                                    selector: ((Item, Double) -> String)? = nil, render: ((String, ListRow<Item>) -> View)? = nil,
                                    header: ((ListRow<Section>) -> View)? = nil) {
        let source = ItemsSource<Section, Item>(rows: rows, selector: selector, render: render, header: header)
        bind(source, templates: templates) { source.update(sections: sections(), items: []) }
    }

    private func bind(_ source: ListSource, templates: [String], update: @escaping () -> Void) {
        self.source = source
        templateKeys = templates
        for key in templates { tableView?.register(ListViewCell.self, forCellReuseIdentifier: key) }
        Owner.current?.onCleanup { [weak self] in self?.disposeCells() }
        Effect { [weak self] in
            update()
            untrack { self?.refresh() }
        }
    }

    public func refresh() {
        tableView?.reloadData()
        requestLayout()
    }

    public func scrollToIndex(_ index: Double) { scrollTo(index, animated: false) }
    public func scrollToIndexAnimated(_ index: Double) { scrollTo(index, animated: true) }

    private func scrollTo(_ index: Double, animated: Bool) {
        guard let tableView, let count = source?.count(in: 0), count > 0 else { return }
        let row = min(max(Int(index), 0), count - 1)
        tableView.scrollToRow(at: IndexPath(row: row, section: 0), at: .top, animated: animated)
    }

    private func disposeCells() {
        for cell in cells { cell.content?.owner.dispose() }
        for cell in measureCells.values { cell.content?.owner.dispose() }
        for header in headers { header.content?.owner.dispose() }
    }

    open override func setProperty(_ name: String, _ value: Any?) {
        switch name {
        case "rowHeight":
            effectiveRowHeight = Length(value, default: .auto).toDevicePixels(auto: -1)
            guard let tableView else { return }
            let height = LayoutHelper.toDeviceIndependentPixels(effectiveRowHeight)
            if height < 0 {
                tableView.rowHeight = UITableView.automaticDimension
                tableView.estimatedRowHeight = ListView.defaultHeight
            } else {
                tableView.rowHeight = height
                tableView.estimatedRowHeight = height
            }
            refresh()
        case "iosEstimatedRowHeight":
            let height = LayoutHelper.toDeviceIndependentPixels(Length(value, default: .zero).toDevicePixels(auto: 0))
            tableView?.estimatedRowHeight = height < 0 ? ListView.defaultHeight : height
        case "separatorColor":
            tableView?.separatorColor = toColor(value)
        case "sectioned", "stickyHeader":
            if name == "sectioned" { sectioned = toBool(value) ?? false } else { stickyHeader = toBool(value) ?? false }
            if isLoaded { refresh() }
        case "stickyHeaderHeight":
            stickyHeaderHeight = value
            if isLoaded { refresh() }
        case "stickyHeaderTopPadding":
            stickyHeaderTopPadding = toBool(value) ?? true
            if !stickyHeaderTopPadding { tableView?.sectionHeaderTopPadding = 0 }
        default:
            super.setProperty(name, value)
        }
    }

    // MARK: Children

    open override func eachChildView(_ body: (View) -> Void) {
        for cell in cells { if let view = cell.content?.view { body(view) } }
        for header in headers { if let view = header.content?.view { body(view) } }
    }

    func removeHeaderContainer(_ header: ListViewHeaderCell) {
        guard let view = header.content?.view else { return }
        let preparing = preparingHeader
        preparingHeader = true
        removeView(view)
        preparingHeader = preparing
        headers.removeAll { $0 === header }
    }

    func removeContainer(_ cell: ListViewCell) {
        guard let view = cell.content?.view else { return }
        let preparing = preparingCell
        preparingCell = true
        removeView(view)
        preparingCell = preparing
        cells.removeAll { $0 === cell }
    }

    // MARK: Measure and layout

    open override func requestLayout() {
        if !preparingCell && !preparingHeader { super.requestLayout() }
    }

    override func measure(_ widthMeasureSpec: Int, _ heightMeasureSpec: Int) {
        let changed = currentWidthMeasureSpec != widthMeasureSpec || currentHeightMeasureSpec != heightMeasureSpec
        self.widthMeasureSpec = widthMeasureSpec
        super.measure(widthMeasureSpec, heightMeasureSpec)
        if changed { tableView?.reloadData() }
    }

    open override func onMeasure(_ widthMeasureSpec: Int, _ heightMeasureSpec: Int) {
        super.onMeasure(widthMeasureSpec, heightMeasureSpec)
        for cell in cells {
            guard let view = cell.content?.view, let w = view.currentWidthMeasureSpec, let h = view.currentHeightMeasureSpec else { continue }
            ViewHelper.measureChild(self, view, w, h)
        }
        for header in headers {
            guard let view = header.content?.view, let w = view.currentWidthMeasureSpec, let h = view.currentHeightMeasureSpec else { continue }
            ViewHelper.measureChild(self, view, w, h)
        }
    }

    open override func onLayout(_ left: Double, _ top: Double, _ right: Double, _ bottom: Double) {
        super.onLayout(left, top, right, bottom)
        for cell in cells {
            guard let view = cell.content?.view, let index = cellIndex[ObjectIdentifier(view)] else { continue }
            let height = effectiveRowHeight > 0 ? effectiveRowHeight : heights[index]
            if let height, height != 0 {
                view.set("iosOverflowSafeAreaEnabled", false)
                ViewHelper.layoutChild(self, view, 0, 0, Double(LayoutHelper.size(widthMeasureSpec)), height)
            }
        }
        for header in headers {
            guard let view = header.content?.view else { continue }
            view.set("iosOverflowSafeAreaEnabled", false)
            ViewHelper.layoutChild(self, view, 0, 0, Double(LayoutHelper.size(widthMeasureSpec)), headerHeight)
        }
    }

    /// The row each template view shows (`_listViewItemIndex`, `_listViewSectionIndex`).
    private var cellIndex: [ObjectIdentifier: IndexPath] = [:]

    private func layoutCell(_ view: View, _ index: IndexPath) -> Double {
        let heightSpec = effectiveRowHeight >= 0
            ? LayoutHelper.makeMeasureSpec(effectiveRowHeight, LayoutHelper.exactly)
            : LayoutHelper.makeMeasureSpec(0, LayoutHelper.unspecified)
        let size = ViewHelper.measureChild(self, view, widthMeasureSpec, heightSpec)
        heights[index] = size.height
        return size.height
    }

    /// `_prepareCell`: the cell's template view shows the row, measured.
    @discardableResult
    private func prepareCell(_ cell: ListViewCell, _ indexPath: IndexPath) -> Double {
        preparingCell = true
        defer { preparingCell = false }
        guard let source else { return 0 }
        let index = indexPath
        cell.list = self
        let content: ListContent
        if let existing = cell.content {
            content = existing
            content.show(index)
        } else {
            content = source.makeContent(key: source.templateKey(at: index), at: index)
            cell.content = content
        }
        let view = content.view
        cellIndex[ObjectIdentifier(view)] = index
        if !cells.contains(where: { $0 === cell }) { cells.append(cell) }
        emit("itemLoading", ItemEventPayload(index: Double(index.row), item: source.item(at: index), view: view))
        if view.parent == nil {
            addView(view)
            if let nativeView = view.nativeView { cell.contentView.addSubview(nativeView) }
        }
        return layoutCell(view, index)
    }

    // MARK: UITableViewDataSource

    public func numberOfSections(in tableView: UITableView) -> Int { sectioned ? source?.sectionCount ?? 1 : 1 }

    public func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int { source?.count(in: section) ?? 0 }

    public func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        guard let source else { return ListViewCell(style: .default, reuseIdentifier: nil) }
        let key = source.templateKey(at: indexPath)
        let cell = (tableView.dequeueReusableCell(withIdentifier: templateKeys.contains(key) ? key : "default") as? ListViewCell)
            ?? ListViewCell(style: .default, reuseIdentifier: nil)
        prepareCell(cell, indexPath)
        if let view = cell.content?.view, view.isLayoutRequired {
            let width = Double(LayoutHelper.size(widthMeasureSpec))
            let height = effectiveRowHeight > 0 ? effectiveRowHeight : (heights[indexPath] ?? 0)
            view.set("iosOverflowSafeAreaEnabled", false)
            ViewHelper.layoutChild(self, view, 0, 0, width, height)
        }
        return cell
    }

    // MARK: UITableViewDelegate

    public func tableView(_ tableView: UITableView, willDisplay cell: UITableViewCell, forRowAt indexPath: IndexPath) {
        // `owner.items.length`: the number of sections in a sectioned list.
        let count = sectioned ? source?.sectionCount ?? 0 : source?.count(in: 0) ?? 0
        if indexPath.row == count - 1 { emit("loadMoreItems", nil) }
    }

    public func tableView(_ tableView: UITableView, willSelectRowAt indexPath: IndexPath) -> IndexPath? {
        let cell = tableView.cellForRow(at: indexPath) as? ListViewCell
        emit("itemTap", ItemEventPayload(index: Double(indexPath.row), item: source?.item(at: indexPath), view: cell?.content?.view))
        return indexPath
    }

    public func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
        tableView.deselectRow(at: indexPath, animated: true)
    }

    public func tableView(_ tableView: UITableView, heightForRowAt indexPath: IndexPath) -> CGFloat {
        if effectiveRowHeight >= 0 { return CGFloat(LayoutHelper.toDeviceIndependentPixels(effectiveRowHeight)) }
        guard let source else { return tableView.estimatedRowHeight }
        var height = heights[indexPath]
        if height == nil {
            let key = source.templateKey(at: indexPath)
            let reuse = templateKeys.contains(key) ? key : "default"
            let cell = measureCells[reuse] ?? (tableView.dequeueReusableCell(withIdentifier: reuse) as? ListViewCell) ?? ListViewCell(style: .default, reuseIdentifier: nil)
            measureCells[reuse] = cell
            height = prepareCell(cell, indexPath)
        }
        return CGFloat(LayoutHelper.toDeviceIndependentPixels(height ?? 0))
    }

    // MARK: Sticky headers

    /// `_prepareHeader`: the header cell's view shows the section, measured at the header height.
    @discardableResult
    private func prepareHeader(_ header: ListViewHeaderCell, _ section: Int) -> Double {
        preparingHeader = true
        defer { preparingHeader = false }
        guard let source else { return 0 }
        header.list = self
        let content: ListContent
        if let existing = header.content {
            content = existing
            content.show(IndexPath(row: 0, section: section))
        } else {
            content = source.makeHeader(section: section)
            header.content = content
        }
        let view = content.view
        if !headers.contains(where: { $0 === header }) { headers.append(header) }
        if view.parent == nil {
            addView(view)
            if let nativeView = view.nativeView { header.contentView.addSubview(nativeView) }
        }
        let heightSpec = LayoutHelper.makeMeasureSpec(headerHeight, LayoutHelper.exactly)
        let size = ViewHelper.measureChild(self, view, widthMeasureSpec, heightSpec)
        ViewHelper.layoutChild(self, view, 0, 0, size.width, size.height)
        return size.height
    }

    public func tableView(_ tableView: UITableView, viewForHeaderInSection section: Int) -> UIView? {
        guard stickyHeader, source?.hasHeader == true else { return nil }
        let header = (tableView.dequeueReusableHeaderFooterView(withIdentifier: "stickyHeader") as? ListViewHeaderCell) ?? ListViewHeaderCell(reuseIdentifier: "stickyHeader")
        prepareHeader(header, section)
        return header
    }

    public func tableView(_ tableView: UITableView, heightForHeaderInSection section: Int) -> CGFloat {
        guard stickyHeader else { return 0 }
        return CGFloat(LayoutHelper.toDeviceIndependentPixels(headerHeight))
    }
}

/// `ListViewHeaderCell` from list-view/index.ios: a transparent section header holding the header template's view.
final class ListViewHeaderCell: UITableViewHeaderFooterView {
    weak var list: ListView?
    var content: ListContent?

    override init(reuseIdentifier: String?) {
        super.init(reuseIdentifier: reuseIdentifier)
        backgroundColor = .clear
    }

    required init?(coder: NSCoder) { fatalError("init(coder:) is not supported") }

    override func willMove(toSuperview newSuperview: UIView?) {
        super.willMove(toSuperview: newSuperview)
        if newSuperview == nil, content != nil, let list { list.removeHeaderContainer(self) }
    }
}
