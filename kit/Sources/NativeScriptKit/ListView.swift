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
protocol ListSource: AnyObject {
    var count: Int { get }
    func item(at index: Int) -> Any
    func templateKey(at index: Int) -> String
    func makeContent(key: String, index: Int) -> ListContent
}

/// A cell's rendered template: its view, the scope its bindings live in, and how to show another item.
final class ListContent {
    let view: View
    let owner: Owner
    let show: (Int) -> Void

    init(view: View, owner: Owner, show: @escaping (Int) -> Void) {
        self.view = view
        self.owner = owner
        self.show = show
    }
}

private final class ItemsSource<Item>: ListSource {
    var items: [Item] = []
    let selector: ((Item, Double) -> String)?
    let render: ((String, ListRow<Item>) -> View)?

    init(selector: ((Item, Double) -> String)?, render: ((String, ListRow<Item>) -> View)?) {
        self.selector = selector
        self.render = render
    }

    var count: Int { items.count }
    func item(at index: Int) -> Any { items[index] }

    func templateKey(at index: Int) -> String {
        selector?(items[index], Double(index)) ?? "default"
    }

    func makeContent(key: String, index: Int) -> ListContent {
        let owner = Owner(parent: nil)
        let row = ListRow(items[index], Double(index))
        let view: View = owner.run {
            if let render { return render(key, row) }
            // `_getDefaultItemContent`: a Label showing the item.
            let label = Label()
            Effect { label.set("text", toText(row.item.value as Any) ?? "") }
            return label
        }
        return ListContent(view: view, owner: owner) { [unowned self] next in
            guard next < self.items.count else { return }
            batch {
                row.item.value = self.items[next]
                row.index.value = Double(next)
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
    private var heights: [Int: Double] = [:]
    private var preparingCell = false
    /// Cells and the template views in them, in the order they were prepared.
    private var cells: [ListViewCell] = []
    private var measureCells: [String: ListViewCell] = [:]
    private var effectiveRowHeight: Double = -1
    var widthMeasureSpec = 0

    open override func createNativeView() -> UIView? { UITableView() }

    open override func initNativeView() {
        guard let tableView else { return }
        tableView.register(ListViewCell.self, forCellReuseIdentifier: "default")
        tableView.estimatedRowHeight = ListView.defaultHeight
        tableView.rowHeight = UITableView.automaticDimension
        tableView.dataSource = self
        tableView.delegate = self
        tableView.sectionHeaderTopPadding = 0
        setNativeClipToBounds()
    }

    open override func setNativeClipToBounds() { nativeView?.clipsToBounds = true }

    /// Binds the items and the templates: `render` makes the view for a template key and a row.
    public func bind<Item>(items: @escaping () -> [Item], templates: [String] = ["default"], selector: ((Item, Double) -> String)? = nil,
                           render: ((String, ListRow<Item>) -> View)? = nil) {
        let source = ItemsSource<Item>(selector: selector, render: render)
        self.source = source
        templateKeys = templates
        for key in templates { tableView?.register(ListViewCell.self, forCellReuseIdentifier: key) }
        Owner.current?.onCleanup { [weak self] in self?.disposeCells() }
        Effect { [weak self] in
            let list = items()
            untrack {
                source.items = list
                self?.refresh()
            }
        }
    }

    public func refresh() {
        tableView?.reloadData()
        requestLayout()
    }

    public func scrollToIndex(_ index: Double) { scrollTo(index, animated: false) }
    public func scrollToIndexAnimated(_ index: Double) { scrollTo(index, animated: true) }

    private func scrollTo(_ index: Double, animated: Bool) {
        guard let tableView, let count = source?.count, count > 0 else { return }
        let row = min(max(Int(index), 0), count - 1)
        tableView.scrollToRow(at: IndexPath(row: row, section: 0), at: .top, animated: animated)
    }

    private func disposeCells() {
        for cell in cells { cell.content?.owner.dispose() }
        for cell in measureCells.values { cell.content?.owner.dispose() }
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
        default:
            super.setProperty(name, value)
        }
    }

    // MARK: Children

    open override func eachChildView(_ body: (View) -> Void) {
        for cell in cells { if let view = cell.content?.view { body(view) } }
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
        if !preparingCell { super.requestLayout() }
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
    }

    /// The row each template view shows (`_listViewItemIndex`).
    private var cellIndex: [ObjectIdentifier: Int] = [:]

    private func layoutCell(_ view: View, _ index: Int) -> Double {
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
        let index = indexPath.row
        cell.list = self
        let content: ListContent
        if let existing = cell.content {
            content = existing
            content.show(index)
        } else {
            content = source.makeContent(key: source.templateKey(at: index), index: index)
            cell.content = content
        }
        let view = content.view
        cellIndex[ObjectIdentifier(view)] = index
        if !cells.contains(where: { $0 === cell }) { cells.append(cell) }
        emit("itemLoading", ItemEventPayload(index: Double(index), item: source.item(at: index), view: view))
        if view.parent == nil {
            addView(view)
            if let nativeView = view.nativeView { cell.contentView.addSubview(nativeView) }
        }
        return layoutCell(view, index)
    }

    // MARK: UITableViewDataSource

    public func numberOfSections(in tableView: UITableView) -> Int { 1 }

    public func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int { source?.count ?? 0 }

    public func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        guard let source else { return ListViewCell(style: .default, reuseIdentifier: nil) }
        let key = source.templateKey(at: indexPath.row)
        let cell = (tableView.dequeueReusableCell(withIdentifier: templateKeys.contains(key) ? key : "default") as? ListViewCell)
            ?? ListViewCell(style: .default, reuseIdentifier: nil)
        prepareCell(cell, indexPath)
        if let view = cell.content?.view, view.isLayoutRequired {
            let width = Double(LayoutHelper.size(widthMeasureSpec))
            let height = effectiveRowHeight > 0 ? effectiveRowHeight : (heights[indexPath.row] ?? 0)
            view.set("iosOverflowSafeAreaEnabled", false)
            ViewHelper.layoutChild(self, view, 0, 0, width, height)
        }
        return cell
    }

    // MARK: UITableViewDelegate

    public func tableView(_ tableView: UITableView, willDisplay cell: UITableViewCell, forRowAt indexPath: IndexPath) {
        if indexPath.row == (source?.count ?? 0) - 1 { emit("loadMoreItems", nil) }
    }

    public func tableView(_ tableView: UITableView, willSelectRowAt indexPath: IndexPath) -> IndexPath? {
        let cell = tableView.cellForRow(at: indexPath) as? ListViewCell
        emit("itemTap", ItemEventPayload(index: Double(indexPath.row), item: source?.item(at: indexPath.row), view: cell?.content?.view))
        return indexPath
    }

    public func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
        tableView.deselectRow(at: indexPath, animated: true)
    }

    public func tableView(_ tableView: UITableView, heightForRowAt indexPath: IndexPath) -> CGFloat {
        if effectiveRowHeight >= 0 { return CGFloat(LayoutHelper.toDeviceIndependentPixels(effectiveRowHeight)) }
        guard let source else { return tableView.estimatedRowHeight }
        var height = heights[indexPath.row]
        if height == nil {
            let key = source.templateKey(at: indexPath.row)
            let reuse = templateKeys.contains(key) ? key : "default"
            let cell = measureCells[reuse] ?? (tableView.dequeueReusableCell(withIdentifier: reuse) as? ListViewCell) ?? ListViewCell(style: .default, reuseIdentifier: nil)
            measureCells[reuse] = cell
            height = prepareCell(cell, indexPath)
        }
        return CGFloat(LayoutHelper.toDeviceIndependentPixels(height ?? 0))
    }
}
