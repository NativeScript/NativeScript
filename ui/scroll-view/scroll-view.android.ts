import dependencyObservable = require("ui/core/dependency-observable");
import view = require("ui/core/view");
import definition = require("ui/scroll-view");
import contentView = require("ui/content-view");
import common = require("ui/scroll-view/scroll-view-common");
import utils = require("utils/utils");
import enums = require("ui/enums");

// merge the exports of the common file with the exports of this file
declare var exports;
require("utils/module-merge").merge(common, exports);

var OWNER = "_owner";
var STATE = "_scrollViewState";

common.orientationProperty.metadata.onValueChanged = function scrollViewOrientationChanged(data: dependencyObservable.PropertyChangeData) {
    (<ScrollView>data.object)._onOrientationChanged(data.oldValue, data.newValue);
}

interface ScrollViewState {
    scrollX: number;
    scrollY: number;
}

function onMeasureScrollView(widthMeasureSpec: number, heightMeasureSpec: number) {
    var owner: view.View = this.owner;
    owner.onMeasure(widthMeasureSpec, heightMeasureSpec);
    this.setMeasuredDimension(owner.getMeasuredWidth(), owner.getMeasuredHeight());
}

function onLayoutScrollView(changed: boolean, left: number, top: number, right: number, bottom: number) {
    var owner: view.View = this.owner;
    owner.onLayout(left, top, right, bottom);

    // Restore scroll state on the first layout after native instance is recreated.
    var state: ScrollViewState = owner[STATE];
    if (state) {
        this.scrollTo(state.scrollX, state.scrollY);
        delete owner[STATE];
    }
}

function onSaveInstanceStateNative(): android.os.Parcelable {
    var state: ScrollViewState = {
        scrollX: this.getScrollX(),
        scrollY: this.getScrollY()
    }
    this.owner[STATE] = state;
    return this.super.onSaveInstanceState();
}

class NativeVerticalScrollView extends android.widget.ScrollView {
    constructor(ctx) {
        super(ctx);
        return global.__native(this);
    }

    get owner() {
        return this[OWNER];
    }

    public onMeasure(widthMeasureSpec: number, heightMeasureSpec: number) {
        onMeasureScrollView.apply(this, [widthMeasureSpec, heightMeasureSpec]);
    }

    public onLayout(changed: boolean, left: number, top: number, right: number, bottom: number) {
        onLayoutScrollView.apply(this, [changed, left, top, right, bottom]);
    }

    public onSaveInstanceState() {
        onSaveInstanceStateNative.apply(this, []);
    }
};

class NativeHorizontalScrollView extends android.widget.HorizontalScrollView {
    constructor(ctx) {
        super(ctx);
        return global.__native(this);
    }

    get owner() {
        return this[OWNER];
    }

    public onMeasure(widthMeasureSpec: number, heightMeasureSpec: number) {
        onMeasureScrollView.apply(this, [widthMeasureSpec, heightMeasureSpec]);
    }

    public onLayout(changed: boolean, left: number, top: number, right: number, bottom: number) {
        onLayoutScrollView.apply(this, [changed, left, top, right, bottom]);
    }

    public onSaveInstanceState() {
        onSaveInstanceStateNative.apply(this, []);
    }
};

export class ScrollView extends contentView.ContentView implements definition.ScrollView {
    private _android: android.widget.FrameLayout;
    private _contentMeasuredWidth: number = 0;
    private _contentMeasuredHeight: number = 0;

    private _scrollableLength: number = 0;
    private _androidViewId: number;

    get android(): android.view.ViewGroup {
        return this._android;
    }

    get _nativeView(): android.view.ViewGroup {
        return this._android;
    }

    get orientation(): string {
        return this._getValue(common.orientationProperty);
    }
    set orientation(value: string) {
        this._setValue(common.orientationProperty, value);
    }

    get horizontalOffset(): number {
        if (!this._android) {
            return 0;
        }

        return this._android.getScrollX() / utils.layout.getDisplayDensity();
    }

    get verticalOffset(): number {
        if (!this._android) {
            return 0;
        }

        return this._android.getScrollY() / utils.layout.getDisplayDensity();
    }

    get scrollableWidth(): number {
        if (!this._android || this.orientation !== enums.Orientation.horizontal) {
            return 0;
        }

        return this._scrollableLength;
    }

    get scrollableHeight(): number {
        if (!this._android || this.orientation !== enums.Orientation.vertical) {
            return 0;
        }

        return this._scrollableLength;
    }

    public scrollToVerticalOffset(value: number, animated: boolean) {
        if (this._android && this.orientation === enums.Orientation.vertical) {
            value *= utils.layout.getDisplayDensity();

            var scrollView: android.widget.ScrollView = (<android.widget.ScrollView>this._android);
            if (animated) {
                scrollView.smoothScrollTo(0, value);
            }
            else {
                scrollView.scrollTo(0, value);
            }
        }
    }

    public scrollToHorizontalOffset(value: number, animated: boolean) {
        if (this._android && this.orientation === enums.Orientation.horizontal) {
            value *= utils.layout.getDisplayDensity();

            var scrollView: android.widget.HorizontalScrollView = (<android.widget.HorizontalScrollView>this._android);
            if (animated) {
                scrollView.smoothScrollTo(value, 0);
            }
            else {
                scrollView.scrollTo(value, 0);
            }
        }
    }

    public _createUI() {
        if (this.orientation === enums.Orientation.horizontal) {
            this._android = new NativeHorizontalScrollView(this._context);
        }
        else {
            this._android = new NativeVerticalScrollView(this._context);
        }

        if (!this._androidViewId) {
            this._androidViewId = android.view.View.generateViewId();
        }
        this._android.setId(this._androidViewId);

        this._android[OWNER] = this;
    }

    public _onOrientationChanged(oldValue: string, newValue: string) {
        if (this._android) {
            var parent = this.parent;

            if (parent) {
                parent._removeView(this);
            }

            if (parent) {
                parent._addView(this);
            }
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
            this._scrollableLength = 0;
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
            this._scrollableLength = this._contentMeasuredWidth - width;
            view.View.layoutChild(this, this.content, 0, 0, Math.max(this._contentMeasuredWidth, width), height);
        }
        else {
            this._scrollableLength = this._contentMeasuredHeight - height;
            view.View.layoutChild(this, this.content, 0, 0, width, Math.max(this._contentMeasuredHeight, height));
        }

        this._scrollableLength /= utils.layout.getDisplayDensity();
        this._scrollableLength = Math.max(0, this._scrollableLength);
    }
}