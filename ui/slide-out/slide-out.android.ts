import common = require("ui/slide-out/slide-out-common");
import view = require("ui/core/view");
import utils = require("utils/utils");
import frame = require("ui/frame");

export class SlideOutControl extends common.SlideOutControl {
    // private _android: android.support.v4.widget.DrawerLayout;
    // TODO: Update with actual types once the definitions are available
    private _android: any;
    private _toggle: any;
    private _optionSelectedCallback: (data: frame.AndroidOptionEventData) => void;
    private _optionsCallbackAdded = false;

    constructor() {
        super();

        var that = this;
        this._optionSelectedCallback = function (data: frame.AndroidOptionEventData) {
            if (that._android) {
                data.handled = that._toggle.onOptionsItemSelected(data.item);
            }
        }
    }

    public _createUI() {
        this._android = new android.support.v4.widget.DrawerLayout(this._context);
        this._createToggle();
    }

    get android(): android.support.v4.widget.DrawerLayout {
        return this._android;
    }

    public _addViewToNativeVisualTree(child: view.View): boolean {
        super._addViewToNativeVisualTree(child);

        if (!this._android) {
            return false;
        }

        this._android.addView(child.android);

        var layoutParams: android.support.v4.widget.DrawerLayout.LayoutParams;
        if (child === this.slideContent) {
            var density = utils.layout.getDisplayDensity();
            layoutParams = new android.support.v4.widget.DrawerLayout.LayoutParams(
                this.slideContentWidth * density,
                android.view.ViewGroup.LayoutParams.MATCH_PARENT,
                android.view.Gravity.START
                );
        } else {
            layoutParams = new android.support.v4.widget.DrawerLayout.LayoutParams(
                android.view.ViewGroup.LayoutParams.MATCH_PARENT,
                android.view.ViewGroup.LayoutParams.MATCH_PARENT
                );
        }

        child.android.setLayoutParams(layoutParams);

        // Z-order is important, bring slide content to front
        if (this.slideContent && this.slideContent._isAddedToNativeVisualTree) {
            this._android.bringChildToFront(this.slideContent.android);
        }

        return true;
    }

    public _removeViewFromNativeVisualTree(child: view.View) {
        super._removeViewFromNativeVisualTree(child);

        if (this._android) {
            this._android.removeView(child.android);
        }
    }

    public _getMeasureSpec(length: number, horizontal: boolean): number {
        return utils.layout.makeMeasureSpec(length, utils.layout.EXACTLY);
    }

    public _onDetached(force?: boolean) {
        super._onDetached(force);

        if (!this._optionsCallbackAdded) {
            return;
        }

        var owningFrame: frame.Frame = <frame.Frame>view.getAncestor(this, "Frame");
        if (owningFrame) {
            owningFrame.android.removeEventListener(frame.knownEvents.android.optionSelected, this._optionSelectedCallback);
            this._optionsCallbackAdded = false;
        }
    }

    //public _measureOverride(availableSize: geometry.Size): geometry.Size {
    //    var baseSize = super._measureOverride(availableSize);

    //    if (this.slideContent) {
    //        this.slideContent.measure(new geometry.Size(this.slideContentWidth, availableSize.height), utils.layout.EXACTLY);
    //    }

    //    //TODO: Here we probably need to measure with size returned from measuring native element (baseSize is 0).
    //    if (this.mainContent) {
    //        this.mainContent.measure(baseSize, utils.layout.EXACTLY);
    //    }

    //    return baseSize;
    //}

    //private _createSlideLayout() {
    //    // TODO: Implement our own FrameLayout layout
    //    this._slideLayout = new android.widget.FrameLayout(this._context);

    //    var layoutParams: android.support.v4.widget.DrawerLayout.LayoutParams;
    //    var width = this.slideContentWidth;
    //    if (!width) {
    //        width = DEFAULT_SLIDE_WIDTH;
    //    }

    //    layoutParams = new android.support.v4.widget.DrawerLayout.LayoutParams(
    //        utils.layout.getDevicePixels(width, this._context),
    //        android.view.ViewGroup.LayoutParams.MATCH_PARENT,
    //        android.view.Gravity.START
    //        );

    //    this._slideLayout.setLayoutParams(layoutParams);
    //}

    //private _createMainLayout() {
    //    // TODO: Implement our own FrameLayout layout
    //    this._mainLayout = new android.widget.FrameLayout(this._context);

    //    var layoutParams: android.support.v4.widget.DrawerLayout.LayoutParams;
    //    layoutParams = new android.support.v4.widget.DrawerLayout.LayoutParams(
    //        android.view.ViewGroup.LayoutParams.MATCH_PARENT,
    //        android.view.ViewGroup.LayoutParams.MATCH_PARENT
    //        );

    //    this._mainLayout.setLayoutParams(layoutParams);
    //}

    private _createToggle() {
        // To create a valid ActionBarDrawerToggle we need all of the android options specified
        var opts = this.options;
        if (!opts || !opts.android) {
            return;
        }

        if (!opts.android.closeDescriptionResourceId ||
            !opts.android.openDescriptionResourceId ||
            !opts.android.toggleImageResourceId) {
            return;
        }

        var activity = <android.app.Activity>this._context;
        if (!activity) {
            return;
        }

        var bar = activity.getActionBar();
        if (!bar) {
            return;
        }

        bar.setHomeButtonEnabled(true);
        bar.setDisplayHomeAsUpEnabled(true);

        this._toggle = new android.support.v4.app.ActionBarDrawerToggle(
            activity,
            this._android, opts.android.toggleImageResourceId,
            opts.android.openDescriptionResourceId,
            opts.android.closeDescriptionResourceId
            );

        this._android.setDrawerListener(this._toggle);
        this._toggle.syncState();

        var owningFrame: frame.Frame = <frame.Frame>view.getAncestor(this, "Frame");
        if (owningFrame) {
            owningFrame.android.addEventListener(frame.knownEvents.android.optionSelected, this._optionSelectedCallback);
            this._optionsCallbackAdded = true;
        }
    }
}