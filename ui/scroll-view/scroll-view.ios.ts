import view = require("ui/core/view");
import definition = require("ui/scroll-view");
import contentView = require("ui/content-view");
import common = require("./scroll-view-common");
import enums = require("ui/enums");
import utils = require("utils/utils");

global.moduleMerge(common, exports);

export class ScrollView extends contentView.ContentView implements definition.ScrollView {
    private _scroll: UIScrollView;
    private _contentMeasuredWidth: number = 0;
    private _contentMeasuredHeight: number = 0;

    constructor() {
        super();
        this._scroll = new UIScrollView();
    }

    get orientation(): string {
        return this._getValue(common.orientationProperty);
    }
    set orientation(value: string) {
        this._setValue(common.orientationProperty, value);
    }

    get horizontalOffset(): number {
        return this._scroll.contentOffset.x;
    }

    get verticalOffset(): number {
        return this._scroll.contentOffset.y;
    }

    get scrollableWidth(): number {
        if (this.orientation !== enums.Orientation.horizontal) {
            return 0;
        }

        return Math.max(0, this._scroll.contentSize.width - this._scroll.bounds.size.width);
    }

    get scrollableHeight(): number {
        if (this.orientation !== enums.Orientation.vertical) {
            return 0;
        }

        return Math.max(0, this._scroll.contentSize.height - this._scroll.bounds.size.height);
    }

    get ios(): UIView {
        return this._scroll;
    }

    get _nativeView(): UIView {
        return this._scroll;
    }

    public scrollToVerticalOffset(value: number, animated: boolean) {
        if (this.orientation === enums.Orientation.vertical) {
            var bounds = this._scroll.bounds.size;
            this._scroll.scrollRectToVisibleAnimated(CGRectMake(0, value, bounds.width, bounds.height), animated);
        }
    }

    public scrollToHorizontalOffset(value: number, animated: boolean) {
        if (this.orientation === enums.Orientation.horizontal) {
            var bounds = this._scroll.bounds.size;
            this._scroll.scrollRectToVisibleAnimated(CGRectMake(value, 0, bounds.width, bounds.height), animated);
        }
    }

    public onMeasure(widthMeasureSpec: number, heightMeasureSpec: number): void {
        // Don't call measure because it will measure content twice.
        var width = utils.layout.getMeasureSpecSize(widthMeasureSpec);
        var widthMode = utils.layout.getMeasureSpecMode(widthMeasureSpec);

        var height = utils.layout.getMeasureSpecSize(heightMeasureSpec);
        var heightMode = utils.layout.getMeasureSpecMode(heightMeasureSpec);

        var density = utils.layout.getDisplayDensity();
        var child = this.content
        if (!child) {
            this._contentMeasuredWidth = this.minWidth * density;
            this._contentMeasuredHeight = this.minHeight * density;
        }
        else {
            var childSize: { measuredWidth: number; measuredHeight: number };
            if (this.orientation === enums.Orientation.vertical) {
                childSize = view.View.measureChild(this, child, widthMeasureSpec, utils.layout.makeMeasureSpec(0, utils.layout.UNSPECIFIED));
            }
            else {
                childSize = view.View.measureChild(this, child, utils.layout.makeMeasureSpec(0, utils.layout.UNSPECIFIED), heightMeasureSpec);
            }

            this._scroll.contentSize = CGSizeMake(childSize.measuredWidth, childSize.measuredHeight);
            this._contentMeasuredWidth = Math.max(childSize.measuredWidth, this.minWidth * density);
            this._contentMeasuredHeight = Math.max(childSize.measuredHeight, this.minHeight * density);
        }

        var widthAndState = view.View.resolveSizeAndState(this._contentMeasuredWidth, width, widthMode, 0);
        var heightAndState = view.View.resolveSizeAndState(this._contentMeasuredHeight, height, heightMode, 0);

        this.setMeasuredDimension(widthAndState, heightAndState);
    }

    public onLayout(left: number, top: number, right: number, bottom: number): void {

        var width = (right - left);
        var height = (bottom - top);

        if (this.orientation === enums.Orientation.horizontal) {
            view.View.layoutChild(this, this.content, 0, 0, Math.max(this._contentMeasuredWidth, width), height);
        }
        else {
            view.View.layoutChild(this, this.content, 0, 0, width, Math.max(this._contentMeasuredHeight, height));
        }
    }
}
