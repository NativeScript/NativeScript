import observable = require("data/observable");
import definition = require("ui/list-view");
import common = require("./list-view-common");
import utils = require("utils/utils");
import view = require("ui/core/view");
import proxy = require("ui/core/proxy");
import {StackLayout} from "ui/layouts/stack-layout";
import {ProxyViewContainer} from "ui/proxy-view-container";
import dependencyObservable = require("ui/core/dependency-observable");
import * as colorModule from "color";

var color: typeof colorModule;
function ensureColor() {
    if (!color) {
        color = require("color");
    }
}

var CELLIDENTIFIER = "cell";
var ITEMLOADING = common.ListView.itemLoadingEvent;
var LOADMOREITEMS = common.ListView.loadMoreItemsEvent;
var ITEMTAP = common.ListView.itemTapEvent;
var DEFAULT_HEIGHT = 44;

global.moduleMerge(common, exports);

var infinity = utils.layout.makeMeasureSpec(0, utils.layout.UNSPECIFIED);

class ListViewCell extends UITableViewCell {
    public willMoveToSuperview(newSuperview: UIView): void {
        let parent = <ListView>(this.view ? this.view.parent : null);

        // When inside ListView and there is no newSuperview this cell is 
        // removed from native visual tree so we remove it from our tree too.
        if (parent && !newSuperview) {
            parent._removeContainer(this);
        }
    }

    public get view(): view.View {
        return this.owner ? this.owner.get() : null
    }

    public owner: WeakRef<view.View>;
}

function notifyForItemAtIndex(listView: definition.ListView, cell: any, view: view.View, eventName: string, indexPath: NSIndexPath) {
    let args = <definition.ItemEventData>{ eventName: eventName, object: listView, index: indexPath.row, view: view, ios: cell, android: undefined };
    listView.notify(args);
    return args;
}

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
        return (owner && owner.items) ? owner.items.length : 0;
    }

    public tableViewCellForRowAtIndexPath(tableView: UITableView, indexPath: NSIndexPath): UITableViewCell {
        // We call this method because ...ForIndexPath calls tableViewHeightForRowAtIndexPath immediately (before we can prepare and measure it).
        let cell = <ListViewCell>(tableView.dequeueReusableCellWithIdentifier(CELLIDENTIFIER) || ListViewCell.new());
        let owner = this._owner.get();
        if (owner) {
            owner._prepareCell(cell, indexPath);

            let cellView: view.View = cell.view;
            if (cellView && cellView.isLayoutRequired) {
                // Arrange cell views. We do it here instead of _layoutCell because _layoutCell is called 
                // from 'tableViewHeightForRowAtIndexPath' method too (in iOS 7.1) and we don't want to arrange the fake cell.
                let width = utils.layout.getMeasureSpecSize(owner.widthMeasureSpec);
                let rowHeight = owner._nativeView.rowHeight;
                let cellHeight = rowHeight > 0 ? rowHeight : owner.getHeight(indexPath.row);
                view.View.layoutChild(owner, cellView, 0, 0, width, cellHeight);
            }
        }
        return cell;
    }
}

class UITableViewDelegateImpl extends NSObject implements UITableViewDelegate {
    public static ObjCProtocols = [UITableViewDelegate];

    private _owner: WeakRef<ListView>;
    private _measureCell: ListViewCell;

    public static initWithOwner(owner: WeakRef<ListView>): UITableViewDelegateImpl {
        let delegate = <UITableViewDelegateImpl>UITableViewDelegateImpl.new();
        delegate._owner = owner;
        return delegate;
    }

    public tableViewWillDisplayCellForRowAtIndexPath(tableView: UITableView, cell: UITableViewCell, indexPath: NSIndexPath) {
        let owner = this._owner.get();
        if (owner && (indexPath.row === owner.items.length - 1)) {
            owner.notify(<observable.EventData>{ eventName: LOADMOREITEMS, object: owner });
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
            return DEFAULT_HEIGHT;
        }

        let height = undefined;
        if (utils.ios.MajorVersion >= 8) {
            height = owner.getHeight(indexPath.row);
        }

        if (utils.ios.MajorVersion < 8 || height === undefined) {
            // in iOS 7.1 (or iOS8+ after call to scrollToRowAtIndexPath:atScrollPosition:animated:) this method is called before tableViewCellForRowAtIndexPath so we need fake cell to measure its content.
            let cell = this._measureCell;
            if (!cell) {
                this._measureCell = (<any>tableView.dequeueReusableCellWithIdentifier(CELLIDENTIFIER)) || ListViewCell.new();
                cell = this._measureCell;
            }

            height = owner._prepareCell(cell, indexPath);
        }

        return height;
    }
}

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
        if (owner && (indexPath.row === owner.items.length - 1)) {
            owner.notify(<observable.EventData>{ eventName: LOADMOREITEMS, object: owner });
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

    public tableViewHeightForRowAtIndexPath(tableView: UITableView, indexPath: NSIndexPath): number {
        let owner = this._owner.get();
        if (!owner) {
            return DEFAULT_HEIGHT;
        }

        return owner._rowHeight;
    }
}

function onSeparatorColorPropertyChanged(data: dependencyObservable.PropertyChangeData) {
    var bar = <ListView>data.object;
    if (!bar.ios) {
        return;
    }

    ensureColor();

    if (data.newValue instanceof color.Color) {
        bar.ios.separatorColor = data.newValue.ios;
    }
}

// register the setNativeValue callbacks
(<proxy.PropertyMetadata>common.ListView.separatorColorProperty.metadata).onSetNativeValue = onSeparatorColorPropertyChanged;

export class ListView extends common.ListView {
    private _ios: UITableView;
    private _dataSource;
    private _delegate;
    private _heights: Array<number>;
    private _preparingCell: boolean = false;
    private _isDataDirty: boolean = false;
    private _map: Map<ListViewCell, view.View>;
    public _rowHeight: number = -1;
    widthMeasureSpec: number = 0;

    constructor() {
        super();
        this._ios = UITableView.new();
        this._ios.registerClassForCellReuseIdentifier(ListViewCell.class(), CELLIDENTIFIER);
        this._ios.autoresizingMask = UIViewAutoresizing.None;
        this._ios.estimatedRowHeight = DEFAULT_HEIGHT;
        this._ios.rowHeight = UITableViewAutomaticDimension;
        this._ios.dataSource = this._dataSource = DataSource.initWithOwner(new WeakRef(this));
        this._delegate = UITableViewDelegateImpl.initWithOwner(new WeakRef(this));
        this._heights = new Array<number>();
        this._map = new Map<ListViewCell, view.View>();
    }

    public onLoaded() {
        super.onLoaded();
        if (this._isDataDirty) {
            this.refresh();
        }
        this._ios.delegate = this._delegate;
    }

    public onUnloaded() {
        this._ios.delegate = null;
        super.onUnloaded();
    }

    get ios(): UITableView {
        return this._ios;
    }

    get _childrenCount(): number {
        return this._map.size;
    }

    public _eachChildView(callback: (child: view.View) => boolean): void {
        this._map.forEach((view, key) => {
            callback(view);
        });
    }

    public scrollToIndex(index: number) {
        if (this._ios) {
            this._ios.scrollToRowAtIndexPathAtScrollPositionAnimated(NSIndexPath.indexPathForItemInSection(index, 0),
                UITableViewScrollPosition.Top, false);
        }
    }

    public refresh() {
        // clear bindingContext when it is not observable because otherwise bindings to items won't reevaluate
        this._map.forEach((view, nativeView, map) => {
            if (!(view.bindingContext instanceof observable.Observable)) {
                view.bindingContext = null;
            }
        });

        if (this.isLoaded) {
            this._ios.reloadData();
            this.requestLayout();
            this._isDataDirty = false;
        } else {
            this._isDataDirty = true;
        }
    }

    public getHeight(index: number): number {
        return this._heights[index];
    }

    public setHeight(index: number, value: number): void {
        this._heights[index] = value;
    }

    public _onRowHeightPropertyChanged(data: dependencyObservable.PropertyChangeData) {
        this._rowHeight = data.newValue;
        if (data.newValue < 0) {
            this._nativeView.rowHeight = UITableViewAutomaticDimension;
            this._nativeView.estimatedRowHeight = DEFAULT_HEIGHT;
            this._delegate = UITableViewDelegateImpl.initWithOwner(new WeakRef(this));
        }
        else {
            this._nativeView.rowHeight = data.newValue;
            this._nativeView.estimatedRowHeight = data.newValue;
            this._delegate = UITableViewRowHeightDelegateImpl.initWithOwner(new WeakRef(this));
        }

        if (this.isLoaded) {
            this._nativeView.delegate = this._delegate;
        }

        super._onRowHeightPropertyChanged(data);
    }

    public requestLayout(): void {
        // When preparing cell don't call super - no need to invalidate our measure when cell desiredSize is changed.
        if (!this._preparingCell) {
            super.requestLayout();
        }
    }

    public measure(widthMeasureSpec: number, heightMeasureSpec: number): void {
        this.widthMeasureSpec = widthMeasureSpec;
        var changed = this._setCurrentMeasureSpecs(widthMeasureSpec, heightMeasureSpec);
        super.measure(widthMeasureSpec, heightMeasureSpec);
        if (changed) {
            this._ios.reloadData();
        }
    }

    private _layoutCell(cellView: view.View, indexPath: NSIndexPath): number {
        if (cellView) {
            let measuredSize = view.View.measureChild(this, cellView, this.widthMeasureSpec, this._rowHeight < 0 ? infinity : this._rowHeight);
            let height = measuredSize.measuredHeight;
            this.setHeight(indexPath.row, height);
            return height;
        }

        return DEFAULT_HEIGHT;
    }

    public _prepareCell(cell: ListViewCell, indexPath: NSIndexPath): number {
        let cellHeight: number;
        try {
            this._preparingCell = true;
            let view = cell.view;
            if (!view) {
                view = this._getItemTemplateContent(indexPath.row);
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
                (<UIView>cell.view._nativeView).removeFromSuperview();
                cell.owner = new WeakRef(view);
            }

            this._prepareItem(view, indexPath.row);
            this._map.set(cell, view);
            // We expect that views returned from itemLoading are new (e.g. not reused).
            if (view && !view.parent && view._nativeView) {
                cell.contentView.addSubview(view._nativeView);
                this._addView(view);
            }

            cellHeight = this._layoutCell(view, indexPath);
        } finally {
            this._preparingCell = false;
        }
        return cellHeight;
    }

    public _removeContainer(cell: ListViewCell): void {
        let view = cell.view;
        // This is to clear the StackLayout that is used to wrap ProxyViewContainer instances.
        if (!(view.parent instanceof ListView)) {
            this._removeView(view.parent);
        }

        view.parent._removeView(view);
        this._map.delete(cell);
    }
}