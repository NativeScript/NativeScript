import observable = require("data/observable");
import definition = require("ui/list-view");
import common = require("./list-view-common");
import utils = require("utils/utils");
import view = require("ui/core/view");
import proxy = require("ui/core/proxy");
import dependencyObservable = require("ui/core/dependency-observable");
import color = require("color");

var CELLIDENTIFIER = "cell";
var ITEMLOADING = common.ListView.itemLoadingEvent;
var LOADMOREITEMS = common.ListView.loadMoreItemsEvent;
var ITEMTAP = common.ListView.itemTapEvent;
var DEFAULT_HEIGHT = 80;

global.moduleMerge(common, exports);

var infinity = utils.layout.makeMeasureSpec(0, utils.layout.UNSPECIFIED);

class ListViewCell extends UITableViewCell {
    static new(): ListViewCell {
        return <ListViewCell>super.new();
    }
}

function notifyForItemAtIndex(listView: definition.ListView, cell: any, eventName: string, indexPath: NSIndexPath) {
    var args = <definition.ItemEventData>{ eventName: eventName, object: listView, index: indexPath.row, view: cell.view, ios: cell, android: undefined };
    listView.notify(args);
    return args;
}

class DataSource extends NSObject implements UITableViewDataSource {
    public static ObjCProtocols = [UITableViewDataSource];

    static new(): DataSource {
        return <DataSource>super.new();
    }

    private _owner: ListView;

    public initWithOwner(owner: ListView): DataSource {
        this._owner = owner;
        return this;
    }

    public tableViewNumberOfRowsInSection(tableView: UITableView, section: number) {
        return this._owner.items ? this._owner.items.length : 0;
    }

    public tableViewCellForRowAtIndexPath(tableView: UITableView, indexPath: NSIndexPath): UITableViewCell {
        // We call this method because ...ForIndexPath calls tableViewHeightForRowAtIndexPath immediately (before we can prepare and measure it).
        var cell = tableView.dequeueReusableCellWithIdentifier(CELLIDENTIFIER) || ListViewCell.new();
        this._owner._prepareCell(cell, indexPath);

        var cellView: view.View = cell.view;
        if (cellView) {
            // Arrange cell views. We do it here instead of _layoutCell because _layoutCell is called 
            // from 'tableViewHeightForRowAtIndexPath' method too (in iOS 7.1) and we don't want to arrange the fake cell.
            var width = utils.layout.getMeasureSpecSize(this._owner.widthMeasureSpec);
            var cellHeight = this._owner.getHeight(indexPath.row);
            view.View.layoutChild(this._owner, cellView, 0, 0, width, cellHeight);
        }

        return cell;
    }
}

class UITableViewDelegateImpl extends NSObject implements UITableViewDelegate {
    public static ObjCProtocols = [UITableViewDelegate];

    static new(): UITableViewDelegateImpl {
        return <UITableViewDelegateImpl>super.new();
    }

    private _owner: ListView;
    private _measureCell: UITableViewCell;

    public initWithOwner(owner: ListView): UITableViewDelegateImpl {
        this._owner = owner;
        return this;
    }

    public tableViewWillDisplayCellForRowAtIndexPath(tableView: UITableView, cell: UITableViewCell, indexPath: NSIndexPath) {
        if (indexPath.row === this._owner.items.length - 1) {
            this._owner.notify(<observable.EventData>{ eventName: LOADMOREITEMS, object: this._owner });
        }
    }

    public tableViewWillSelectRowAtIndexPath(tableView: UITableView, indexPath: NSIndexPath): NSIndexPath {
        var cell = tableView.cellForRowAtIndexPath(indexPath);
        notifyForItemAtIndex(this._owner, cell, ITEMTAP, indexPath);
        cell.highlighted = false;
        return indexPath;
    }

    public tableViewHeightForRowAtIndexPath(tableView: UITableView, indexPath: NSIndexPath): number {
        var height = undefined;
        if (utils.ios.MajorVersion >= 8) {
            height = this._owner.getHeight(indexPath.row);
        }
        if (utils.ios.MajorVersion < 8 || height === undefined) {
            // in iOS 7.1 (or iOS8+ after call to scrollToRowAtIndexPath:atScrollPosition:animated:) this method is called before tableViewCellForRowAtIndexPath so we need fake cell to measure its content.
            var cell = this._measureCell;
            if (!cell) {
                this._measureCell = tableView.dequeueReusableCellWithIdentifier(CELLIDENTIFIER) || ListViewCell.new();
                cell = this._measureCell;
            }

            height = this._owner._prepareCell(cell, indexPath);
        }

        return height;
    }
}

function onSeparatorColorPropertyChanged(data: dependencyObservable.PropertyChangeData) {
    var bar = <ListView>data.object;
    if (!bar.ios) {
        return;
    }

    if (data.newValue instanceof color.Color) {
        bar.ios.separatorColor = (<color.Color>data.newValue).ios;
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

    widthMeasureSpec: number = 0;

    constructor() {
        super();

        this._ios = new UITableView();
        this._ios.registerClassForCellReuseIdentifier(ListViewCell.class(), CELLIDENTIFIER);
        this._ios.autoresizesSubviews = false;
        this._ios.autoresizingMask = UIViewAutoresizing.UIViewAutoresizingNone;
        this._ios.estimatedRowHeight = DEFAULT_HEIGHT;

        var dataSource = DataSource.new().initWithOwner(this);

        this._dataSource = dataSource;
        this._ios.dataSource = this._dataSource;

        this._delegate = UITableViewDelegateImpl.new().initWithOwner(this);

        this._heights = new Array<number>();
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

    public scrollToIndex(index: number) {
        if (this._ios) {
            this._ios.scrollToRowAtIndexPathAtScrollPositionAnimated(NSIndexPath.indexPathForItemInSection(index, 0),
                UITableViewScrollPosition.UITableViewScrollPositionTop, false);
        }
    }

    public refresh() {
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
            var measuredSize = view.View.measureChild(this, cellView, this.widthMeasureSpec, infinity);
            var height = measuredSize.measuredHeight;
            this.setHeight(indexPath.row, height);
            return height;
        }

        return 0;
    }

    public _prepareCell(tableCell: UITableViewCell, indexPath: NSIndexPath): number {
        var cell: any = tableCell;
        var cellHeight: number;

        try {
            this._preparingCell = true;
            if (!cell.view) {
                cell.view = this._getItemTemplateContent(indexPath.row);
            }

            var args = notifyForItemAtIndex(this, cell, ITEMLOADING, indexPath);
            var view = cell.view = args.view || this._getDefaultItemContent(indexPath.row);

            this._prepareItem(view, indexPath.row);
            if (view && !view.parent && view.ios) {
                cell.contentView.addSubview(view.ios);
                this._addView(view);
            }

            cellHeight = this._layoutCell(view, indexPath);
        }
        finally {
            this._preparingCell = false;
        }
        return cellHeight;
    }
}
