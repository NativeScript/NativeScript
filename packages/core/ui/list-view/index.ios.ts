import { ItemEventData } from '.';
import { ListViewBase, separatorColorProperty, itemTemplatesProperty, iosEstimatedRowHeightProperty } from './list-view-common';
import { View, KeyedTemplate } from '../core/view';
import { Length } from '../styling/style-properties';
import { Observable, EventData } from '../../data/observable';
import { Color } from '../../color';
import { layout } from '../../utils';
import { StackLayout } from '../layouts/stack-layout';
import { ProxyViewContainer } from '../proxy-view-container';
import { profile } from '../../profiling';
import { Trace } from '../../trace';

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
		cell.backgroundColor = null;

		return cell;
	}

	initWithStyleReuseIdentifier(style: UITableViewCellStyle, reuseIdentifier: string): this {
		const cell = <this>super.initWithStyleReuseIdentifier(style, reuseIdentifier);
		// Clear background by default - this will make cells transparent
		cell.backgroundColor = null;

		return cell;
	}

	public willMoveToSuperview(newSuperview: UIView): void {
		let parent = <ListView>(this.view ? this.view.parent : null);

		// When inside ListView and there is no newSuperview this cell is
		// removed from native visual tree so we remove it from our tree too.
		if (parent && !newSuperview) {
			parent._removeContainer(this);
		}
	}

	public get view(): View {
		return this.owner ? this.owner.get() : null;
	}

	public owner: WeakRef<View>;
}

function notifyForItemAtIndex(listView: ListViewBase, cell: any, view: View, eventName: string, indexPath: NSIndexPath) {
	let args = <ItemEventData>{
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
		let dataSource = <DataSource>DataSource.new();
		dataSource._owner = owner;

		return dataSource;
	}

	public tableViewNumberOfRowsInSection(tableView: UITableView, section: number) {
		let owner = this._owner.get();

		return owner && owner.items ? owner.items.length : 0;
	}

	public tableViewCellForRowAtIndexPath(tableView: UITableView, indexPath: NSIndexPath): UITableViewCell {
		// We call this method because ...ForIndexPath calls tableViewHeightForRowAtIndexPath immediately (before we can prepare and measure it).
		let owner = this._owner.get();
		let cell: ListViewCell;
		if (owner) {
			let template = owner._getItemTemplate(indexPath.row);
			cell = <ListViewCell>(tableView.dequeueReusableCellWithIdentifier(template.key) || ListViewCell.initWithEmptyBackground());
			owner._prepareCell(cell, indexPath);

			let cellView: View = cell.view;
			if (cellView && cellView.isLayoutRequired) {
				// Arrange cell views. We do it here instead of _layoutCell because _layoutCell is called
				// from 'tableViewHeightForRowAtIndexPath' method too (in iOS 7.1) and we don't want to arrange the fake cell.
				let width = layout.getMeasureSpecSize(owner.widthMeasureSpec);
				let rowHeight = owner._effectiveRowHeight;
				let cellHeight = rowHeight > 0 ? rowHeight : owner.getHeight(indexPath.row);
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
		const owner = this._owner.get();
		if (owner && indexPath.row === owner.items.length - 1) {
			owner.notify(<EventData>{
				eventName: LOADMOREITEMS,
				object: owner,
			});
		}
	}

	public tableViewWillSelectRowAtIndexPath(tableView: UITableView, indexPath: NSIndexPath): NSIndexPath {
		const cell = <ListViewCell>tableView.cellForRowAtIndexPath(indexPath);
		const owner = this._owner.get();
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
		const owner = this._owner.get();
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
}

@NativeClass
class UITableViewRowHeightDelegateImpl extends NSObject implements UITableViewDelegate {
	public static ObjCProtocols = [UITableViewDelegate];

	private _owner: WeakRef<ListView>;

	public static initWithOwner(owner: WeakRef<ListView>): UITableViewRowHeightDelegateImpl {
		let delegate = <UITableViewRowHeightDelegateImpl>UITableViewRowHeightDelegateImpl.new();
		delegate._owner = owner;

		return delegate;
	}

	public tableViewWillDisplayCellForRowAtIndexPath(tableView: UITableView, cell: UITableViewCell, indexPath: NSIndexPath) {
		let owner = this._owner.get();
		if (owner && indexPath.row === owner.items.length - 1) {
			owner.notify(<EventData>{
				eventName: LOADMOREITEMS,
				object: owner,
			});
		}
	}

	public tableViewWillSelectRowAtIndexPath(tableView: UITableView, indexPath: NSIndexPath): NSIndexPath {
		let cell = <ListViewCell>tableView.cellForRowAtIndexPath(indexPath);
		let owner = this._owner.get();
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
		let owner = this._owner.get();
		if (!owner) {
			return tableView.estimatedRowHeight;
		}

		return layout.toDeviceIndependentPixels(owner._effectiveRowHeight);
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
	widthMeasureSpec: number = 0;

	constructor() {
		super();
		this._map = new Map<ListViewCell, ItemView>();
		this._heights = new Array<number>();
	}

	createNativeView() {
		return UITableView.new();
	}

	initNativeView() {
		super.initNativeView();
		const nativeView = this.nativeViewProtected;
		nativeView.registerClassForCellReuseIdentifier(ListViewCell.class(), this._defaultTemplate.key);
		nativeView.estimatedRowHeight = DEFAULT_HEIGHT;
		nativeView.rowHeight = UITableViewAutomaticDimension;
		nativeView.dataSource = this._dataSource = DataSource.initWithOwner(new WeakRef(this));
		this._delegate = UITableViewDelegateImpl.initWithOwner(new WeakRef(this));
		this._setNativeClipToBounds();
	}

	disposeNativeView() {
		this._delegate = null;
		this._dataSource = null;
		super.disposeNativeView();
	}

	_setNativeClipToBounds() {
		// Always set clipsToBounds for list-view
		this.ios.clipsToBounds = true;
	}

	@profile
	public onLoaded() {
		super.onLoaded();
		if (this._isDataDirty) {
			this.refresh();
		}
		this.ios.delegate = this._delegate;
	}

	public onUnloaded() {
		this.ios.delegate = null;
		super.onUnloaded();
	}

	get ios(): UITableView {
		return this.nativeViewProtected;
	}

	get _childrenCount(): number {
		return this._map.size;
	}

	public eachChildView(callback: (child: View) => boolean): void {
		this._map.forEach((view, key) => {
			callback(view);
		});
	}

	public scrollToIndex(index: number) {
		this._scrollToIndex(index, false);
	}

	public scrollToIndexAnimated(index: number) {
		this._scrollToIndex(index);
	}

	private _scrollToIndex(index: number, animated: boolean = true) {
		if (!this.ios) {
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

			this.ios.scrollToRowAtIndexPathAtScrollPositionAnimated(NSIndexPath.indexPathForItemInSection(index, 0), UITableViewScrollPosition.Top, animated);
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

		if (this.isLoaded) {
			this.ios.reloadData();
			this.requestLayout();
			this._isDataDirty = false;
		} else {
			this._isDataDirty = true;
		}
	}

	public isItemAtIndexVisible(itemIndex: number): boolean {
		const indexes: NSIndexPath[] = Array.from(this.ios.indexPathsForVisibleRows);

		return indexes.some((visIndex) => visIndex.row === itemIndex);
	}

	public getHeight(index: number): number {
		return this._heights[index];
	}

	public setHeight(index: number, value: number): void {
		this._heights[index] = value;
	}

	public _onRowHeightPropertyChanged(oldValue: Length, newValue: Length) {
		const value = layout.toDeviceIndependentPixels(this._effectiveRowHeight);
		const nativeView = this.ios;
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
		// When preparing cell don't call super - no need to invalidate our measure when cell desiredSize is changed.
		if (!this._preparingCell) {
			super.requestLayout();
		}
	}

	public measure(widthMeasureSpec: number, heightMeasureSpec: number): void {
		this.widthMeasureSpec = widthMeasureSpec;
		const changed = this._setCurrentMeasureSpecs(widthMeasureSpec, heightMeasureSpec);
		super.measure(widthMeasureSpec, heightMeasureSpec);
		if (changed) {
			this.ios.reloadData();
		}
	}

	public onMeasure(widthMeasureSpec: number, heightMeasureSpec: number): void {
		super.onMeasure(widthMeasureSpec, heightMeasureSpec);

		this._map.forEach((childView, listViewCell) => {
			View.measureChild(this, childView, childView._currentWidthMeasureSpec, childView._currentHeightMeasureSpec);
		});
	}

	public onLayout(left: number, top: number, right: number, bottom: number): void {
		super.onLayout(left, top, right, bottom);

		this._map.forEach((childView, listViewCell) => {
			let rowHeight = this._effectiveRowHeight;
			let cellHeight = rowHeight > 0 ? rowHeight : this.getHeight(childView._listViewItemIndex);
			if (cellHeight) {
				let width = layout.getMeasureSpecSize(this.widthMeasureSpec);
				childView.iosOverflowSafeAreaEnabled = false;
				View.layoutChild(this, childView, 0, 0, width, cellHeight);
			}
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

		return this.ios.estimatedRowHeight;
	}

	public _prepareCell(cell: ListViewCell, indexPath: NSIndexPath): number {
		let cellHeight: number;
		try {
			this._preparingCell = true;
			let view: ItemView = cell.view;
			if (!view) {
				view = this._getItemTemplate(indexPath.row).createView();
			}

			let args = notifyForItemAtIndex(this, cell, view, ITEMLOADING, indexPath);
			view = args.view || this._getDefaultItemContent(indexPath.row);

			// Proxy containers should not get treated as layouts.
			// Wrap them in a real layout as well.
			if (view instanceof ProxyViewContainer) {
				let sp = new StackLayout();
				sp.addChild(view);
				view = sp;
			}

			// If cell is reused it have old content - remove it first.
			if (!cell.view) {
				cell.owner = new WeakRef(view);
			} else if (cell.view !== view) {
				this._removeContainer(cell);
				(<UIView>cell.view.nativeViewProtected).removeFromSuperview();
				cell.owner = new WeakRef(view);
			}

			this._prepareItem(view, indexPath.row);
			view._listViewItemIndex = indexPath.row;
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
		let view: ItemView = cell.view;
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

	[separatorColorProperty.getDefault](): UIColor {
		return this.ios.separatorColor;
	}
	[separatorColorProperty.setNative](value: Color | UIColor) {
		this.ios.separatorColor = value instanceof Color ? value.ios : value;
	}

	[itemTemplatesProperty.getDefault](): KeyedTemplate[] {
		return null;
	}
	[itemTemplatesProperty.setNative](value: KeyedTemplate[]) {
		this._itemTemplatesInternal = new Array<KeyedTemplate>(this._defaultTemplate);
		if (value) {
			for (let i = 0, length = value.length; i < length; i++) {
				this.ios.registerClassForCellReuseIdentifier(ListViewCell.class(), value[i].key);
			}
			this._itemTemplatesInternal = this._itemTemplatesInternal.concat(value);
		}

		this.refresh();
	}

	[iosEstimatedRowHeightProperty.getDefault](): Length {
		return DEFAULT_HEIGHT;
	}
	[iosEstimatedRowHeightProperty.setNative](value: Length) {
		const nativeView = this.ios;
		const estimatedHeight = Length.toDevicePixels(value, 0);
		nativeView.estimatedRowHeight = estimatedHeight < 0 ? DEFAULT_HEIGHT : estimatedHeight;
	}
}
