import { ItemEventData, SearchEventData, ItemsSource } from '.';
import { ListViewBase, separatorColorProperty, itemTemplatesProperty, iosEstimatedRowHeightProperty, stickyHeaderProperty, stickyHeaderTemplateProperty, stickyHeaderHeightProperty, sectionedProperty, showSearchProperty, searchAutoHideProperty } from './list-view-common';
import { CoreTypes } from '../../core-types';
import { View, type KeyedTemplate, type Template } from '../core/view';
import { Length } from '../styling/length-shared';
import { Observable, EventData } from '../../data/observable';
import { Color } from '../../color';
import { layout } from '../../utils';
import { SDK_VERSION } from '../../utils/constants';
import { StackLayout } from '../layouts/stack-layout';
import { ProxyViewContainer } from '../proxy-view-container';
import { profile } from '../../profiling';
import { Trace } from '../../trace';
import { Builder } from '../builder';
import { Label } from '../label';
import { isFunction } from '../../utils/types';

export * from './list-view-common';

const ITEMLOADING = ListViewBase.itemLoadingEvent;
const LOADMOREITEMS = ListViewBase.loadMoreItemsEvent;
const ITEMTAP = ListViewBase.itemTapEvent;
const DEFAULT_HEIGHT = 44;

const infinity = layout.makeMeasureSpec(0, layout.UNSPECIFIED);

interface ViewItemIndex {
	_listViewItemIndex?: number;
}

type ItemView = View & ViewItemIndex;

@NativeClass
class ListViewCell extends UITableViewCell {
	public static initWithEmptyBackground(): ListViewCell {
		const cell = <ListViewCell>ListViewCell.new();
		// Clear background by default - this will make cells transparent
		cell.backgroundColor = UIColor.clearColor;

		return cell;
	}

	initWithStyleReuseIdentifier(style: UITableViewCellStyle, reuseIdentifier: string): this {
		const cell = <this>super.initWithStyleReuseIdentifier(style, reuseIdentifier);
		// Clear background by default - this will make cells transparent
		cell.backgroundColor = UIColor.clearColor;

		return cell;
	}

	public willMoveToSuperview(newSuperview: UIView): void {
		const parent = <ListView>(this.view ? this.view.parent : null);

		// When inside ListView and there is no newSuperview this cell is
		// removed from native visual tree so we remove it from our tree too.
		if (parent && !newSuperview) {
			parent._removeContainer(this);
		}
	}

	public get view(): View {
		return this.owner ? this.owner.deref() : null;
	}

	public owner: WeakRef<View>;
}

@NativeClass
class ListViewHeaderCell extends UITableViewHeaderFooterView {
	public static initWithEmptyBackground(): ListViewHeaderCell {
		const cell = <ListViewHeaderCell>ListViewHeaderCell.new();
		// Clear background by default - this will make headers transparent
		cell.backgroundColor = UIColor.clearColor;

		return cell;
	}

	initWithReuseIdentifier(reuseIdentifier: string): this {
		const cell = <this>super.initWithReuseIdentifier(reuseIdentifier);
		// Clear background by default - this will make headers transparent
		cell.backgroundColor = UIColor.clearColor;

		return cell;
	}

	public willMoveToSuperview(newSuperview: UIView): void {
		const parent = <ListView>(this.view ? this.view.parent : null);

		// When inside ListView and there is no newSuperview this header is
		// removed from native visual tree so we remove it from our tree too.
		if (parent && !newSuperview) {
			parent._removeHeaderContainer(this);
		}
	}

	public get view(): View {
		return this.owner ? this.owner.deref() : null;
	}

	public owner: WeakRef<View>;
}

function notifyForItemAtIndex(listView: ListViewBase, cell: any, view: View, eventName: string, indexPath: NSIndexPath) {
	const args = <ItemEventData>{
		eventName: eventName,
		object: listView,
		index: indexPath.row,
		view: view,
		ios: cell,
		android: undefined,
	};
	listView.notify(args);

	return args;
}

@NativeClass
class DataSource extends NSObject implements UITableViewDataSource {
	public static ObjCProtocols = [UITableViewDataSource];

	private _owner: WeakRef<ListView>;

	public static initWithOwner(owner: WeakRef<ListView>): DataSource {
		const dataSource = <DataSource>DataSource.new();
		dataSource._owner = owner;

		return dataSource;
	}

	public numberOfSectionsInTableView(tableView: UITableView): number {
		const owner = this._owner?.deref();

		if (!owner) {
			return 1;
		}

		const sections = owner._getSectionCount();
		if (Trace.isEnabled()) {
			Trace.write(`ListView: numberOfSections = ${sections} (sectioned: ${owner.sectioned})`, Trace.categories.Debug);
		}
		return sections;
	}

	public tableViewNumberOfRowsInSection(tableView: UITableView, section: number) {
		const owner = this._owner?.deref();

		if (!owner) {
			return 0;
		}

		const sectionItems = owner._getItemsInSection(section);
		const rowCount = sectionItems ? sectionItems.length : 0;
		if (Trace.isEnabled()) {
			Trace.write(`ListView: numberOfRows in section ${section} = ${rowCount}`, Trace.categories.Debug);
		}
		return rowCount;
	}

	public tableViewCellForRowAtIndexPath(tableView: UITableView, indexPath: NSIndexPath): UITableViewCell {
		// We call this method because ...ForIndexPath calls tableViewHeightForRowAtIndexPath immediately (before we can prepare and measure it).
		const owner = this._owner?.deref();
		let cell: ListViewCell;
		if (owner) {
			const template = owner._getItemTemplate(indexPath.row);
			cell = <ListViewCell>(tableView.dequeueReusableCellWithIdentifier(template.key) || ListViewCell.initWithEmptyBackground());
			owner._prepareCell(cell, indexPath);

			const cellView: View = cell.view;
			if (cellView && cellView.isLayoutRequired) {
				// Arrange cell views. We do it here instead of _layoutCell because _layoutCell is called
				// from 'tableViewHeightForRowAtIndexPath' method too (in iOS 7.1) and we don't want to arrange the fake cell.
				const width = layout.getMeasureSpecSize(owner.widthMeasureSpec);
				const rowHeight = owner._effectiveRowHeight;
				const cellHeight = rowHeight > 0 ? rowHeight : owner.getHeight(indexPath.row);
				cellView.iosOverflowSafeAreaEnabled = false;
				View.layoutChild(owner, cellView, 0, 0, width, cellHeight);
			}
		} else {
			cell = <ListViewCell>ListViewCell.initWithEmptyBackground();
		}

		return cell;
	}
}

@NativeClass
class UITableViewDelegateImpl extends NSObject implements UITableViewDelegate {
	public static ObjCProtocols = [UITableViewDelegate];

	private _owner: WeakRef<ListView>;

	private _measureCellMap: Map<string, ListViewCell>;

	public static initWithOwner(owner: WeakRef<ListView>): UITableViewDelegateImpl {
		const delegate = <UITableViewDelegateImpl>UITableViewDelegateImpl.new();
		delegate._owner = owner;
		delegate._measureCellMap = new Map<string, ListViewCell>();

		return delegate;
	}

	public tableViewWillDisplayCellForRowAtIndexPath(tableView: UITableView, cell: UITableViewCell, indexPath: NSIndexPath) {
		const owner = this._owner?.deref();
		if (owner && indexPath.row === owner.items.length - 1) {
			owner.notify(<EventData>{
				eventName: LOADMOREITEMS,
				object: owner,
			});
		}
	}

	public tableViewWillSelectRowAtIndexPath(tableView: UITableView, indexPath: NSIndexPath): NSIndexPath {
		const cell = <ListViewCell>tableView.cellForRowAtIndexPath(indexPath);
		const owner = this._owner?.deref();
		if (owner) {
			notifyForItemAtIndex(owner, cell, cell.view, ITEMTAP, indexPath);
		}

		return indexPath;
	}

	public tableViewDidSelectRowAtIndexPath(tableView: UITableView, indexPath: NSIndexPath): NSIndexPath {
		tableView.deselectRowAtIndexPathAnimated(indexPath, true);

		return indexPath;
	}

	public tableViewHeightForRowAtIndexPath(tableView: UITableView, indexPath: NSIndexPath): number {
		const owner = this._owner?.deref();
		if (!owner) {
			return tableView.estimatedRowHeight;
		}

		let height = owner.getHeight(indexPath.row);
		if (height === undefined) {
			// in iOS8+ after call to scrollToRowAtIndexPath:atScrollPosition:animated: this method is called before tableViewCellForRowAtIndexPath so we need fake cell to measure its content.
			const template = owner._getItemTemplate(indexPath.row);
			let cell = this._measureCellMap.get(template.key);
			if (!cell) {
				cell = <any>tableView.dequeueReusableCellWithIdentifier(template.key) || ListViewCell.initWithEmptyBackground();
				this._measureCellMap.set(template.key, cell);
			}

			height = owner._prepareCell(cell, indexPath);
		}

		return layout.toDeviceIndependentPixels(height);
	}

	public tableViewViewForHeaderInSection(tableView: UITableView, section: number): UIView {
		const owner = this._owner?.deref();

		if (!owner || !owner.stickyHeader || !owner.stickyHeaderTemplate) {
			if (Trace.isEnabled()) {
				Trace.write(`ListView: No sticky header (stickyHeader: ${owner?.stickyHeader}, hasTemplate: ${!!owner?.stickyHeaderTemplate})`, Trace.categories.Debug);
			}
			return null;
		}

		if (Trace.isEnabled()) {
			Trace.write(`ListView: Creating sticky header`, Trace.categories.Debug);
		}

		const headerReuseIdentifier = 'stickyHeader';
		let headerCell = <ListViewHeaderCell>tableView.dequeueReusableHeaderFooterViewWithIdentifier(headerReuseIdentifier);

		if (!headerCell) {
			// Use proper iOS initialization for registered header cells
			headerCell = <ListViewHeaderCell>ListViewHeaderCell.alloc().initWithReuseIdentifier(headerReuseIdentifier);
			headerCell.backgroundColor = UIColor.clearColor;
		}

		owner._prepareHeader(headerCell, section);

		return headerCell;
	}

	public tableViewHeightForHeaderInSection(tableView: UITableView, section: number): number {
		const owner = this._owner?.deref();

		if (!owner || !owner.stickyHeader) {
			return 0;
		}

		let height: number;
		if (owner.stickyHeaderHeight === 'auto') {
			height = 44;
		} else {
			height = layout.toDeviceIndependentPixels(Length.toDevicePixels(owner.stickyHeaderHeight, 44));
		}

		if (Trace.isEnabled()) {
			Trace.write(`ListView: Sticky header height: ${height}`, Trace.categories.Debug);
		}

		return height;
	}
}

@NativeClass
class UITableViewRowHeightDelegateImpl extends NSObject implements UITableViewDelegate {
	public static ObjCProtocols = [UITableViewDelegate];

	private _owner: WeakRef<ListView>;

	public static initWithOwner(owner: WeakRef<ListView>): UITableViewRowHeightDelegateImpl {
		const delegate = <UITableViewRowHeightDelegateImpl>UITableViewRowHeightDelegateImpl.new();
		delegate._owner = owner;

		return delegate;
	}

	public tableViewWillDisplayCellForRowAtIndexPath(tableView: UITableView, cell: UITableViewCell, indexPath: NSIndexPath) {
		const owner = this._owner?.deref();
		if (owner && indexPath.row === owner.items.length - 1) {
			owner.notify(<EventData>{
				eventName: LOADMOREITEMS,
				object: owner,
			});
		}
	}

	public tableViewWillSelectRowAtIndexPath(tableView: UITableView, indexPath: NSIndexPath): NSIndexPath {
		const cell = <ListViewCell>tableView.cellForRowAtIndexPath(indexPath);
		const owner = this._owner?.deref();
		if (owner) {
			notifyForItemAtIndex(owner, cell, cell.view, ITEMTAP, indexPath);
		}

		return indexPath;
	}

	public tableViewDidSelectRowAtIndexPath(tableView: UITableView, indexPath: NSIndexPath): NSIndexPath {
		tableView.deselectRowAtIndexPathAnimated(indexPath, true);

		return indexPath;
	}

	public tableViewHeightForRowAtIndexPath(tableView: UITableView, indexPath: NSIndexPath): number {
		const owner = this._owner?.deref();
		if (!owner) {
			return tableView.estimatedRowHeight;
		}

		return layout.toDeviceIndependentPixels(owner._effectiveRowHeight);
	}

	public tableViewViewForHeaderInSection(tableView: UITableView, section: number): UIView {
		const owner = this._owner?.deref();

		if (!owner || !owner.stickyHeader || !owner.stickyHeaderTemplate) {
			if (Trace.isEnabled()) {
				Trace.write(`ListView: No sticky header (stickyHeader: ${owner?.stickyHeader}, hasTemplate: ${!!owner?.stickyHeaderTemplate})`, Trace.categories.Debug);
			}
			return null;
		}

		if (Trace.isEnabled()) {
			Trace.write(`ListView: Creating sticky header`, Trace.categories.Debug);
		}

		const headerReuseIdentifier = 'stickyHeader';
		let headerCell = <ListViewHeaderCell>tableView.dequeueReusableHeaderFooterViewWithIdentifier(headerReuseIdentifier);

		if (!headerCell) {
			headerCell = <ListViewHeaderCell>ListViewHeaderCell.alloc().initWithReuseIdentifier(headerReuseIdentifier);
			headerCell.backgroundColor = UIColor.clearColor;
		}

		owner._prepareHeader(headerCell, section);

		return headerCell;
	}

	public tableViewHeightForHeaderInSection(tableView: UITableView, section: number): number {
		const owner = this._owner?.deref();

		if (!owner || !owner.stickyHeader) {
			return 0;
		}

		let height: number;
		if (owner.stickyHeaderHeight === 'auto') {
			height = 44;
		} else {
			height = layout.toDeviceIndependentPixels(Length.toDevicePixels(owner.stickyHeaderHeight, 44));
		}

		if (Trace.isEnabled()) {
			Trace.write(`ListView: Sticky header height: ${height}`, Trace.categories.Debug);
		}

		return height;
	}
}

@NativeClass
class UISearchResultsUpdatingImpl extends NSObject implements UISearchResultsUpdating {
	public static ObjCProtocols = [UISearchResultsUpdating];

	private _owner: WeakRef<ListView>;

	public static initWithOwner(owner: WeakRef<ListView>): UISearchResultsUpdatingImpl {
		const handler = <UISearchResultsUpdatingImpl>UISearchResultsUpdatingImpl.new();
		handler._owner = owner;

		return handler;
	}

	public updateSearchResultsForSearchController(searchController: UISearchController) {
		const owner = this._owner ? this._owner.get() : null;
		if (!owner) {
			return;
		}

		const searchText = searchController.searchBar.text || '';

		// Track search state
		owner._isSearchActive = searchController.active;

		// Create SearchEventData
		const eventData: SearchEventData = {
			eventName: ListViewBase.searchChangeEvent,
			object: owner,
			text: searchText,
			ios: searchController,
		};

		// Fire the searchChange event
		owner.notify(eventData);
	}
}

export class ListView extends ListViewBase {
	public nativeViewProtected: UITableView;
	// tslint:disable-next-line
	private _dataSource;
	private _delegate;
	private _heights: Array<number>;
	private _preparingCell: boolean;
	private _isDataDirty: boolean;
	private _map: Map<ListViewCell, ItemView>;
	private _headerMap: Map<ListViewHeaderCell, View>;
	private _preparingHeader: boolean;
	private _headerTemplateCache: View;
	private _searchController: UISearchController;
	private _searchDelegate: UISearchResultsUpdatingImpl;
	_isSearchActive: boolean = false;
	widthMeasureSpec = 0;

	constructor() {
		super();
		this._map = new Map<ListViewCell, ItemView>();
		this._headerMap = new Map<ListViewHeaderCell, View>();
		this._heights = new Array<number>();
	}

	createNativeView() {
		return UITableView.new();
	}

	initNativeView() {
		super.initNativeView();
		const nativeView = this.nativeViewProtected;
		nativeView.registerClassForCellReuseIdentifier(ListViewCell.class(), this._defaultTemplate.key);
		nativeView.registerClassForHeaderFooterViewReuseIdentifier(ListViewHeaderCell.class(), 'stickyHeader');
		nativeView.estimatedRowHeight = DEFAULT_HEIGHT;
		nativeView.rowHeight = UITableViewAutomaticDimension;
		nativeView.dataSource = this._dataSource = DataSource.initWithOwner(new WeakRef(this));
		this._delegate = UITableViewDelegateImpl.initWithOwner(new WeakRef(this));

		// Control section header top padding (iOS 15+)
		if (nativeView.respondsToSelector('setSectionHeaderTopPadding:')) {
			if (!this.stickyHeaderTopPadding) {
				nativeView.sectionHeaderTopPadding = 0;
			}
			// When stickyHeaderTopPadding is true, don't set the property to use iOS default
		}

		this._setNativeClipToBounds();
	}

	disposeNativeView() {
		this._cleanupSearchController();
		this._delegate = null;
		this._dataSource = null;
		super.disposeNativeView();
	}

	private _setupSearchController() {
		if (!this.showSearch || this._searchController) {
			return; // Already setup or not needed
		}

		// 1. Create UISearchController with nil (show results in this table)
		this._searchController = UISearchController.alloc().initWithSearchResultsController(null);
		this._searchDelegate = UISearchResultsUpdatingImpl.initWithOwner(new WeakRef(this));

		// 2. Tell it who will update results
		this._searchController.searchResultsUpdater = this._searchDelegate;

		// 3. Critical: Don't dim or obscure the table, and prevent extra content
		this._searchController.obscuresBackgroundDuringPresentation = false;
		this._searchController.dimsBackgroundDuringPresentation = false;
		this._searchController.hidesNavigationBarDuringPresentation = false;

		// 4. Placeholder text and styling
		this._searchController.searchBar.placeholder = 'Search';
		this._searchController.searchBar.searchBarStyle = UISearchBarStyle.Minimal;

		// 5. CRITICAL: Proper presentation context setup
		const viewController = this._getViewController();
		if (viewController) {
			viewController.definesPresentationContext = true;
			viewController.providesPresentationContextTransitionStyle = true;

			// 6a. If we're in a UINavigationController (iOS 11+)...
			if (SDK_VERSION >= 11.0 && viewController.navigationItem) {
				viewController.navigationItem.searchController = this._searchController;

				// Set auto-hide behavior based on searchAutoHide property
				viewController.navigationItem.hidesSearchBarWhenScrolling = this.searchAutoHide;

				// Optional: Enable large titles for better auto-hide effect when searchAutoHide is true
				// if (this.searchAutoHide && viewController.navigationController && viewController.navigationController.navigationBar) {
				// 	// Only set large titles if not already configured
				// 	if (!viewController.navigationController.navigationBar.prefersLargeTitles) {
				// 		viewController.navigationController.navigationBar.prefersLargeTitles = true;
				// 	}
				// 	// Set large title display mode for this specific view controller
				// 	if (viewController.navigationItem.largeTitleDisplayMode === UINavigationItemLargeTitleDisplayMode.Automatic) {
				// 		viewController.navigationItem.largeTitleDisplayMode = UINavigationItemLargeTitleDisplayMode.Always;
				// 	}
				// }
			} else {
				// 6b. Fallback: put it at the top of our table
				this.nativeViewProtected.tableHeaderView = this._searchController.searchBar;
			}
		} else {
			// Fallback: no view controller found, use table header
			this.nativeViewProtected.tableHeaderView = this._searchController.searchBar;
		}

		// 7. Ensure search bar is properly sized and prevent content inset issues
		this._searchController.searchBar.sizeToFit();

		// 8. Disable automatic content inset adjustment that can cause spacing issues
		if (this.nativeViewProtected.respondsToSelector('setContentInsetAdjustmentBehavior:')) {
			// iOS 11+ - prevent automatic content inset adjustments
			this.nativeViewProtected.contentInsetAdjustmentBehavior = UIScrollViewContentInsetAdjustmentBehavior.Never;
		} else {
			// iOS 10 and below - disable automatic content inset
			this.nativeViewProtected.automaticallyAdjustsScrollIndicatorInsets = false;
		}

		if (Trace.isEnabled()) {
			Trace.write(`ListView: UISearchController setup complete with searchAutoHide: ${this.searchAutoHide}`, Trace.categories.Debug);
		}
	}

	private _cleanupSearchController() {
		if (!this._searchController) {
			return;
		}

		// Remove search controller from navigation item or table header
		const viewController = this._getViewController();
		if (viewController && viewController.navigationItem && viewController.navigationItem.searchController === this._searchController) {
			viewController.navigationItem.searchController = null;
		} else if (this.nativeViewProtected.tableHeaderView === this._searchController.searchBar) {
			this.nativeViewProtected.tableHeaderView = null;
		}

		// Reset content inset adjustment behavior
		if (this.nativeViewProtected.respondsToSelector('setContentInsetAdjustmentBehavior:')) {
			// iOS 11+ - restore automatic content inset adjustments
			this.nativeViewProtected.contentInsetAdjustmentBehavior = UIScrollViewContentInsetAdjustmentBehavior.Automatic;
		} else {
			// iOS 10 and below - restore automatic content inset
			this.nativeViewProtected.automaticallyAdjustsScrollIndicatorInsets = true;
		}

		// Cleanup references
		this._searchController.searchResultsUpdater = null;
		this._searchController = null;
		this._searchDelegate = null;
	}

	private _getViewController(): UIViewController {
		// Helper to get the current view controller
		let parent = this.parent;
		while (parent) {
			if (parent.viewController) {
				return parent.viewController;
			}
			parent = parent.parent;
		}
		return null;
	}

	_setNativeClipToBounds() {
		// Always set clipsToBounds for list-view
		const view = this.nativeViewProtected;
		if (view) {
			view.clipsToBounds = true;
		}
	}

	@profile
	public onLoaded() {
		super.onLoaded();
		if (this._isDataDirty) {
			this.refresh();
		}
		this.nativeViewProtected.delegate = this._delegate;

		// Setup search controller if enabled
		if (this.showSearch) {
			this._setupSearchController();
		}
	}

	// @ts-ignore
	get ios(): UITableView {
		return this.nativeViewProtected;
	}

	get _childrenCount(): number {
		return this._map.size + this._headerMap.size;
	}

	public eachChildView(callback: (child: View) => boolean): void {
		this._map.forEach((view, key) => {
			callback(view);
		});
		this._headerMap.forEach((view, key) => {
			callback(view);
		});
	}

	public scrollToIndex(index: number) {
		this._scrollToIndex(index, false);
	}

	public scrollToIndexAnimated(index: number) {
		this._scrollToIndex(index);
	}

	private _scrollToIndex(index: number, animated = true) {
		if (!this.nativeViewProtected) {
			return;
		}

		const itemsLength = this.items ? this.items.length : 0;
		// mimic Android behavior that silently coerces index values within [0, itemsLength - 1] range
		if (itemsLength > 0) {
			if (index < 0) {
				index = 0;
			} else if (index >= itemsLength) {
				index = itemsLength - 1;
			}

			this.nativeViewProtected.scrollToRowAtIndexPathAtScrollPositionAnimated(NSIndexPath.indexPathForItemInSection(index, 0), UITableViewScrollPosition.Top, animated);
		} else if (Trace.isEnabled()) {
			Trace.write(`Cannot scroll listview to index ${index} when listview items not set`, Trace.categories.Binding);
		}
	}

	public refresh() {
		// clear bindingContext when it is not observable because otherwise bindings to items won't reevaluate
		this._map.forEach((view, nativeView, map) => {
			if (!(view.bindingContext instanceof Observable)) {
				view.bindingContext = null;
			}
		});
		this._headerMap.forEach((view, nativeView, map) => {
			if (!(view.bindingContext instanceof Observable)) {
				view.bindingContext = null;
			}
		});

		if (this.isLoaded) {
			this.nativeViewProtected.reloadData();
			this.requestLayout();
			this._isDataDirty = false;
		} else {
			this._isDataDirty = true;
		}
	}

	public isItemAtIndexVisible(itemIndex: number): boolean {
		const indexes: NSIndexPath[] = Array.from(this.nativeViewProtected.indexPathsForVisibleRows);

		return indexes.some((visIndex) => visIndex.row === itemIndex);
	}

	public getHeight(index: number): number {
		return this._heights[index];
	}

	public setHeight(index: number, value: number): void {
		this._heights[index] = value;
	}

	public _onRowHeightPropertyChanged(oldValue: CoreTypes.LengthType, newValue: CoreTypes.LengthType) {
		const value = layout.toDeviceIndependentPixels(this._effectiveRowHeight);
		const nativeView = this.nativeViewProtected;
		if (value < 0) {
			nativeView.rowHeight = UITableViewAutomaticDimension;
			nativeView.estimatedRowHeight = DEFAULT_HEIGHT;
			this._delegate = UITableViewDelegateImpl.initWithOwner(new WeakRef(this));
		} else {
			nativeView.rowHeight = value;
			nativeView.estimatedRowHeight = value;
			this._delegate = UITableViewRowHeightDelegateImpl.initWithOwner(new WeakRef(this));
		}

		if (this.isLoaded) {
			nativeView.delegate = this._delegate;
		}

		super._onRowHeightPropertyChanged(oldValue, newValue);
	}

	public requestLayout(): void {
		// When preparing cell or header don't call super - no need to invalidate our measure when cell/header desiredSize is changed.
		if (!this._preparingCell && !this._preparingHeader) {
			super.requestLayout();
		}
	}

	public measure(widthMeasureSpec: number, heightMeasureSpec: number): void {
		const changed: boolean = this._currentWidthMeasureSpec !== widthMeasureSpec || this._currentHeightMeasureSpec !== heightMeasureSpec;

		this.widthMeasureSpec = widthMeasureSpec;
		super.measure(widthMeasureSpec, heightMeasureSpec);

		// Reload native view cells only in the case of size change
		if (changed) {
			this.nativeViewProtected.reloadData();
		}
	}

	public onMeasure(widthMeasureSpec: number, heightMeasureSpec: number): void {
		super.onMeasure(widthMeasureSpec, heightMeasureSpec);

		this._map.forEach((childView, listViewCell) => {
			View.measureChild(this, childView, childView._currentWidthMeasureSpec, childView._currentHeightMeasureSpec);
		});
		this._headerMap.forEach((childView, listViewHeaderCell) => {
			View.measureChild(this, childView, childView._currentWidthMeasureSpec, childView._currentHeightMeasureSpec);
		});
	}

	public onLayout(left: number, top: number, right: number, bottom: number): void {
		super.onLayout(left, top, right, bottom);

		this._map.forEach((childView, listViewCell) => {
			const rowHeight = this._effectiveRowHeight;
			const cellHeight = rowHeight > 0 ? rowHeight : this.getHeight(childView._listViewItemIndex);
			if (cellHeight) {
				const width = layout.getMeasureSpecSize(this.widthMeasureSpec);
				childView.iosOverflowSafeAreaEnabled = false;
				View.layoutChild(this, childView, 0, 0, width, cellHeight);
			}
		});
		this._headerMap.forEach((childView, listViewHeaderCell) => {
			const headerHeight = this.stickyHeaderHeight === 'auto' ? 44 : Length.toDevicePixels(this.stickyHeaderHeight, 44);
			const width = layout.getMeasureSpecSize(this.widthMeasureSpec);
			childView.iosOverflowSafeAreaEnabled = false;
			View.layoutChild(this, childView, 0, 0, width, headerHeight);
		});
	}

	private _layoutCell(cellView: View, indexPath: NSIndexPath): number {
		if (cellView) {
			const rowHeight = this._effectiveRowHeight;
			const heightMeasureSpec: number = rowHeight >= 0 ? layout.makeMeasureSpec(rowHeight, layout.EXACTLY) : infinity;
			const measuredSize = View.measureChild(this, cellView, this.widthMeasureSpec, heightMeasureSpec);
			const height = measuredSize.measuredHeight;
			this.setHeight(indexPath.row, height);

			return height;
		}

		return this.nativeViewProtected.estimatedRowHeight;
	}

	public _prepareCell(cell: ListViewCell, indexPath: NSIndexPath): number {
		let cellHeight: number;
		try {
			this._preparingCell = true;
			let view: ItemView = cell.view;
			if (!view) {
				if (this.sectioned) {
					// For sectioned data, we need to calculate the absolute index for template selection
					let absoluteIndex = 0;
					for (let i = 0; i < indexPath.section; i++) {
						absoluteIndex += this._getItemsInSection(i).length;
					}
					absoluteIndex += indexPath.row;
					view = this._getItemTemplate(absoluteIndex).createView();
				} else {
					view = this._getItemTemplate(indexPath.row).createView();
				}
			}

			const args = notifyForItemAtIndex(this, cell, view, ITEMLOADING, indexPath);
			view = args.view || this._getDefaultItemContent(this.sectioned ? indexPath.row : indexPath.row);

			// Proxy containers should not get treated as layouts.
			// Wrap them in a real layout as well.
			if (view instanceof ProxyViewContainer) {
				const sp = new StackLayout();
				sp.addChild(view);
				view = sp;
			}

			// If cell is reused it have old content - remove it first.
			if (!cell.view) {
				cell.owner = new WeakRef(view);
			} else if (cell.view !== view) {
				// Remove view from super view now as nativeViewProtected will be null afterwards
				(<UIView>cell.view.nativeViewProtected)?.removeFromSuperview();
				this._removeContainer(cell);
				cell.owner = new WeakRef(view);
			}

			if (this.sectioned) {
				this._prepareItemInSection(view, indexPath.section, indexPath.row);
				view._listViewItemIndex = indexPath.row; // Keep row index for compatibility
				(view as any)._listViewSectionIndex = indexPath.section;
			} else {
				this._prepareItem(view, indexPath.row);
				view._listViewItemIndex = indexPath.row;
			}
			this._map.set(cell, view);

			// We expect that views returned from itemLoading are new (e.g. not reused).
			if (view && !view.parent) {
				this._addView(view);
				cell.contentView.addSubview(view.nativeViewProtected);
			}

			cellHeight = this._layoutCell(view, indexPath);
		} finally {
			this._preparingCell = false;
		}

		return cellHeight;
	}

	public _removeContainer(cell: ListViewCell): void {
		const view: ItemView = cell.view;
		// This is to clear the StackLayout that is used to wrap ProxyViewContainer instances.
		if (!(view.parent instanceof ListView)) {
			this._removeView(view.parent);
		}

		// No need to request layout when we are removing cells.
		const preparing = this._preparingCell;
		this._preparingCell = true;
		view.parent._removeView(view);
		view._listViewItemIndex = undefined;
		this._preparingCell = preparing;
		this._map.delete(cell);
	}

	public _prepareHeader(headerCell: ListViewHeaderCell, section: number): number {
		let headerHeight: number;
		try {
			this._preparingHeader = true;
			let view: View = headerCell.view;
			if (!view) {
				view = this._getHeaderTemplate();
				if (!view) {
					if (Trace.isEnabled()) {
						Trace.write(`ListView: Failed to create header view for section ${section}`, Trace.categories.Debug);
					}
					// Create a fallback view
					const lbl = new Label();
					lbl.text = `Section ${section}`;
					view = lbl;
				}
			}

			// Handle header cell reuse
			if (!headerCell.view) {
				headerCell.owner = new WeakRef(view);
			} else if (headerCell.view !== view) {
				// Remove old view and set new one
				(<UIView>headerCell.view.nativeViewProtected)?.removeFromSuperview();
				this._removeHeaderContainer(headerCell);
				headerCell.owner = new WeakRef(view);
			}

			// Clear existing binding context and set new one
			if (view.bindingContext) {
				view.bindingContext = null;
			}

			if (this.sectioned) {
				const sectionData = this._getSectionData(section);
				if (sectionData) {
					view.bindingContext = sectionData;
				} else {
					// Fallback if section data is missing
					view.bindingContext = { title: `Section ${section}`, section: section };
				}
			} else {
				view.bindingContext = this.bindingContext;
			}

			// Force immediate binding context evaluation
			if (view && typeof (view as any)._onBindingContextChanged === 'function') {
				(view as any)._onBindingContextChanged(null, view.bindingContext);

				// Also trigger for child views
				// @ts-ignore
				if (view._childrenCount) {
					view.eachChildView((child) => {
						if (typeof (child as any)._onBindingContextChanged === 'function') {
							(child as any)._onBindingContextChanged(null, view.bindingContext);
						}
						return true;
					});
				}
			}
			this._headerMap.set(headerCell, view);

			// Add new header view to the cell
			if (view && !view.parent) {
				this._addView(view);
				headerCell.contentView.addSubview(view.nativeViewProtected);
			}

			// Request layout and measure/layout the header
			if (view && view.bindingContext) {
				view.requestLayout();
			}

			headerHeight = this._layoutHeader(view);
		} finally {
			this._preparingHeader = false;
		}

		return headerHeight;
	}

	private _layoutHeader(headerView: View): number {
		if (headerView) {
			const headerHeight = this.stickyHeaderHeight === 'auto' ? 44 : Length.toDevicePixels(this.stickyHeaderHeight, 44);
			const heightMeasureSpec: number = layout.makeMeasureSpec(headerHeight, layout.EXACTLY);

			const measuredSize = View.measureChild(this, headerView, this.widthMeasureSpec, heightMeasureSpec);
			// Layout the header with the measured size
			View.layoutChild(this, headerView, 0, 0, measuredSize.measuredWidth, measuredSize.measuredHeight);

			return measuredSize.measuredHeight;
		}

		return 44;
	}

	private _getHeaderTemplate(): View {
		if (this.stickyHeaderTemplate) {
			if (__UI_USE_EXTERNAL_RENDERER__) {
				if (isFunction(this.stickyHeaderTemplate)) {
					return (<Template>this.stickyHeaderTemplate)();
				}
			} else {
				if (typeof this.stickyHeaderTemplate === 'string') {
					try {
						const parsed = Builder.parse(this.stickyHeaderTemplate, this);
						if (!parsed) {
							// Create a simple fallback
							const fallbackLabel = new Label();
							fallbackLabel.text = 'Parse Failed';
							return fallbackLabel;
						}
						return parsed;
					} catch (error) {
						if (Trace.isEnabled()) {
							Trace.write(`ListView: Template parsing error: ${error}`, Trace.categories.Debug);
						}
						// Create a simple fallback
						const errorLabel = new Label();
						errorLabel.text = 'Template Error';
						return errorLabel;
					}
				} else {
					const view = (<Template>this.stickyHeaderTemplate)();
					if (Trace.isEnabled()) {
						Trace.write(`ListView: Created header view from template function: ${!!view} (type: ${view?.constructor?.name})`, Trace.categories.Debug);
					}
					return view;
				}
			}
		}

		if (Trace.isEnabled()) {
			Trace.write(`ListView: No sticky header template, creating default`, Trace.categories.Debug);
		}

		// Return a default header if no template is provided
		const lbl = new Label();
		lbl.text = 'Default Header';
		return lbl;
	}

	public _removeHeaderContainer(headerCell: ListViewHeaderCell): void {
		const view: View = headerCell.view;
		// This is to clear the StackLayout that is used to wrap ProxyViewContainer instances.
		if (!(view.parent instanceof ListView)) {
			this._removeView(view.parent);
		}

		// No need to request layout when we are removing headers.
		const preparing = this._preparingHeader;
		this._preparingHeader = true;
		view.parent._removeView(view);
		this._preparingHeader = preparing;
		this._headerMap.delete(headerCell);
	}

	[separatorColorProperty.getDefault](): UIColor {
		return this.nativeViewProtected.separatorColor;
	}
	[separatorColorProperty.setNative](value: Color | UIColor) {
		this.nativeViewProtected.separatorColor = value instanceof Color ? value.ios : value;
	}

	[itemTemplatesProperty.getDefault](): KeyedTemplate[] {
		return null;
	}
	[itemTemplatesProperty.setNative](value: KeyedTemplate[]) {
		this._itemTemplatesInternal = new Array<KeyedTemplate>(this._defaultTemplate);
		if (value) {
			for (let i = 0, length = value.length; i < length; i++) {
				this.nativeViewProtected.registerClassForCellReuseIdentifier(ListViewCell.class(), value[i].key);
			}
			this._itemTemplatesInternal = this._itemTemplatesInternal.concat(value);
		}

		this.refresh();
	}

	[iosEstimatedRowHeightProperty.getDefault](): CoreTypes.LengthType {
		return DEFAULT_HEIGHT;
	}
	[iosEstimatedRowHeightProperty.setNative](value: CoreTypes.LengthType) {
		const nativeView = this.nativeViewProtected;
		const estimatedHeight = layout.toDeviceIndependentPixels(Length.toDevicePixels(value, 0));
		nativeView.estimatedRowHeight = estimatedHeight < 0 ? DEFAULT_HEIGHT : estimatedHeight;
	}

	[stickyHeaderProperty.getDefault](): boolean {
		return false;
	}
	[stickyHeaderProperty.setNative](value: boolean) {
		if (Trace.isEnabled()) {
			Trace.write(`ListView: stickyHeader set to ${value}`, Trace.categories.Debug);
		}
		// Immediately refresh to apply changes
		if (this.isLoaded) {
			this.refresh();
		}
	}

	[stickyHeaderTemplateProperty.getDefault](): string | Template {
		return null;
	}
	[stickyHeaderTemplateProperty.setNative](value: string | Template) {
		if (Trace.isEnabled()) {
			Trace.write(`ListView: stickyHeaderTemplate set: ${typeof value} ${value ? '(has value)' : '(null)'}`, Trace.categories.Debug);
		}
		// Clear any cached template
		this._headerTemplateCache = null;
		// Immediately refresh to apply changes
		if (this.isLoaded) {
			this.refresh();
		}
	}

	[stickyHeaderHeightProperty.getDefault](): CoreTypes.LengthType {
		return 'auto';
	}
	[stickyHeaderHeightProperty.setNative](value: CoreTypes.LengthType) {
		if (Trace.isEnabled()) {
			Trace.write(`ListView: stickyHeaderHeight set to ${value}`, Trace.categories.Debug);
		}
		// Immediately refresh to apply changes
		if (this.isLoaded) {
			this.refresh();
		}
	}

	[sectionedProperty.getDefault](): boolean {
		return false;
	}
	[sectionedProperty.setNative](value: boolean) {
		if (Trace.isEnabled()) {
			Trace.write(`ListView: sectioned set to ${value}`, Trace.categories.Debug);
		}
		// Immediately refresh to apply changes
		if (this.isLoaded) {
			this.refresh();
		}
	}

	[showSearchProperty.getDefault](): boolean {
		return false;
	}
	[showSearchProperty.setNative](value: boolean) {
		if (Trace.isEnabled()) {
			Trace.write(`ListView: showSearch set to ${value}`, Trace.categories.Debug);
		}

		if (value) {
			this._setupSearchController();
		} else {
			this._cleanupSearchController();
		}
	}

	[searchAutoHideProperty.getDefault](): boolean {
		return false;
	}
	[searchAutoHideProperty.setNative](value: boolean) {
		if (Trace.isEnabled()) {
			Trace.write(`ListView: searchAutoHide set to ${value}`, Trace.categories.Debug);
		}

		// If search is already enabled, update the existing search controller
		if (this.showSearch && this._searchController) {
			const viewController = this._getViewController();
			if (viewController && viewController.navigationItem && SDK_VERSION >= 11.0) {
				viewController.navigationItem.hidesSearchBarWhenScrolling = value;

				// Enable large titles for better auto-hide effect when searchAutoHide is true
				// if (value && viewController.navigationController && viewController.navigationController.navigationBar) {
				// 	if (!viewController.navigationController.navigationBar.prefersLargeTitles) {
				// 		viewController.navigationController.navigationBar.prefersLargeTitles = true;
				// 	}
				// 	if (viewController.navigationItem.largeTitleDisplayMode === UINavigationItemLargeTitleDisplayMode.Automatic) {
				// 		viewController.navigationItem.largeTitleDisplayMode = UINavigationItemLargeTitleDisplayMode.Always;
				// 	}
				// }
			}
		}
		// If search is not enabled yet, the property will be used when _setupSearchController is called
	}
}
