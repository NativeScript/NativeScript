import viewCommon = require("ui/core/view-common");
import trace = require("trace");
import utils = require("utils/utils");
import dependencyObservable = require("ui/core/dependency-observable");
import proxy = require("ui/core/proxy");
import background = require("ui/styling/background");
import types = require("utils/types");

global.moduleMerge(viewCommon, exports);

function onIdPropertyChanged(data: dependencyObservable.PropertyChangeData) {
    var view = <View>data.object;
    if (!view._nativeView) {
        return;
    }

    view._nativeView.accessibilityIdentifier = data.newValue;
}
(<proxy.PropertyMetadata>viewCommon.View.idProperty.metadata).onSetNativeValue = onIdPropertyChanged;

function onIsEnabledPropertyChanged(data: dependencyObservable.PropertyChangeData) {
    var view = <View>data.object;
    if (!view._nativeView) {
        return;
    }

    if (view._nativeView instanceof UIControl) {
        (<UIControl>view._nativeView).enabled = data.newValue;
    }
}
(<proxy.PropertyMetadata>viewCommon.View.isEnabledProperty.metadata).onSetNativeValue = onIsEnabledPropertyChanged;

function onIsUserInteractionEnabledPropertyChanged(data: dependencyObservable.PropertyChangeData) {
    var view = <View>data.object;
    if (!view._nativeView) {
        return;
    }

    view._nativeView.userInteractionEnabled = data.newValue;
}
(<proxy.PropertyMetadata>viewCommon.View.isUserInteractionEnabledProperty.metadata).onSetNativeValue = onIsUserInteractionEnabledPropertyChanged;

var PFLAG_FORCE_LAYOUT = 1;
var PFLAG_MEASURED_DIMENSION_SET = 1 << 1;
var PFLAG_LAYOUT_REQUIRED = 1 << 2;

export class View extends viewCommon.View {
    private _privateFlags: number;

    constructor() {
        super();
        this._privateFlags = PFLAG_LAYOUT_REQUIRED | PFLAG_FORCE_LAYOUT;
    }

    public _addViewCore(view: viewCommon.View) {
        super._addViewCore(view);
        this.requestLayout();
    }

    public _removeViewCore(view: viewCommon.View) {
        super._removeViewCore(view);
        // TODO: Detach from the context?
        view._onDetached();
        this.requestLayout();
    }

    public onLoaded() {
        super.onLoaded();

        // TODO: It is very late to work with options here in the onLoaded method. 
        // We should not do anything that affects UI AFTER the widget has been loaded.
        utils.copyFrom(this._options, this);
        delete this._options;

        // We do not need to call this in iOS, since the native instance is created immediately
        // and any props that you set on our instance are immediately synced onto the native one.
        // _syncNativeProperties makes sense for Android only, where widgets are created later.
        // this._syncNativeProperties();
    }

    get _nativeView(): UIView {
        return this.ios;
    }

    get isLayoutRequested(): boolean {
        return (this._privateFlags & PFLAG_FORCE_LAYOUT) === PFLAG_FORCE_LAYOUT;
    }

    public requestLayout(): void {
        super.requestLayout();
        this._privateFlags |= PFLAG_FORCE_LAYOUT;

        var parent = <View>this.parent;
        if (parent && !parent.isLayoutRequested) {
            parent.requestLayout();
        }
    }

    public measure(widthMeasureSpec: number, heightMeasureSpec: number): void {

        var measureSpecsChanged = this._setCurrentMeasureSpecs(widthMeasureSpec, heightMeasureSpec);
        var forceLayout = (this._privateFlags & PFLAG_FORCE_LAYOUT) === PFLAG_FORCE_LAYOUT;
        if (forceLayout || measureSpecsChanged) {
            
            // first clears the measured dimension flag
            this._privateFlags &= ~PFLAG_MEASURED_DIMENSION_SET;

            // measure ourselves, this should set the measured dimension flag back
            this.onMeasure(widthMeasureSpec, heightMeasureSpec);
            this._privateFlags |= PFLAG_LAYOUT_REQUIRED;

            // flag not set, setMeasuredDimension() was not invoked, we raise
            // an exception to warn the developer
            if ((this._privateFlags & PFLAG_MEASURED_DIMENSION_SET) !== PFLAG_MEASURED_DIMENSION_SET) {
                throw new Error("onMeasure() did not set the measured dimension by calling setMeasuredDimension()");
            }
        }
    }

    public layout(left: number, top: number, right: number, bottom: number): void {
        var changed: boolean = this._setCurrentLayoutBounds(left, top, right, bottom);
        this.layoutNativeView(left, top, right, bottom);

        if (changed || (this._privateFlags & PFLAG_LAYOUT_REQUIRED) === PFLAG_LAYOUT_REQUIRED) {
            this.onLayout(left, top, right, bottom);
            this._privateFlags &= ~PFLAG_LAYOUT_REQUIRED;
            this._onBoundsChanged();
        }
        this._privateFlags &= ~PFLAG_FORCE_LAYOUT;
    }

    public setMeasuredDimension(measuredWidth: number, measuredHeight: number): void {
        super.setMeasuredDimension(measuredWidth, measuredHeight);
        this._privateFlags |= PFLAG_MEASURED_DIMENSION_SET;
    }

    public onMeasure(widthMeasureSpec: number, heightMeasureSpec: number): void {
        var view = this._nativeView;
        if (view) {

            var width = utils.layout.getMeasureSpecSize(widthMeasureSpec);
            var widthMode = utils.layout.getMeasureSpecMode(widthMeasureSpec);

            var height = utils.layout.getMeasureSpecSize(heightMeasureSpec);
            var heightMode = utils.layout.getMeasureSpecMode(heightMeasureSpec);

            if (widthMode === utils.layout.UNSPECIFIED) {
                width = Number.POSITIVE_INFINITY;
            }

            if (heightMode === utils.layout.UNSPECIFIED) {
                height = Number.POSITIVE_INFINITY;
            }

            trace.write(this + " :onMeasure: " + utils.layout.getMode(widthMode) + " " + width + ", " + utils.layout.getMode(heightMode) + " " + height, trace.categories.Layout);

            var nativeSize = view.sizeThatFits(CGSizeMake(width, height));

            var measureWidth = Math.max(nativeSize.width, this.minWidth);
            var measureHeight = Math.max(nativeSize.height, this.minHeight);

            var widthAndState = View.resolveSizeAndState(measureWidth, width, widthMode, 0);
            var heightAndState = View.resolveSizeAndState(measureHeight, height, heightMode, 0);

            this.setMeasuredDimension(widthAndState, heightAndState);
        }
    }

    public onLayout(left: number, top: number, right: number, bottom: number): void {
        trace.write(this + " :onLayout: " + left + ", " + top + ", " + (right - left) + ", " + (bottom - top), trace.categories.Layout);
    }

    public layoutNativeView(left: number, top: number, right: number, bottom: number): void {
        if (!this._nativeView) {
            return;
        }

        var frame = CGRectMake(left, top, right - left, bottom - top);

        // This is done because when rotated in iOS7 there is rotation applied on the first subview on the Window which is our frame.nativeView.view.
        // If we set it it should be transformed so it is correct. 
        // When in landscape in iOS 7 there is transformation on the first subview of the window so we set frame to its subview.
        // in iOS 8 we set frame to subview again otherwise we get clipped.
        var nativeView: UIView;
        if (!this.parent && this._nativeView.subviews.count > 0 && !(<any>this)._isModal) {
            trace.write(this + " has no parent. Setting frame to first child instead.", trace.categories.Layout);
            nativeView = (<UIView>this._nativeView.subviews[0]);
        }
        else {
            nativeView = this._nativeView;
        }

        if (!CGRectEqualToRect(nativeView.frame, frame)) {
            trace.write(this + ", Native setFrame: = " + NSStringFromCGRect(frame), trace.categories.Layout);
            nativeView.frame = frame;
        }
    }

    public _updateLayout() {
        var oldBounds = this._getCurrentLayoutBounds();
        this.layoutNativeView(oldBounds.left, oldBounds.top, oldBounds.right, oldBounds.bottom);
    }

    public focus(): boolean {
        if (this.ios) {
            return this.ios.becomeFirstResponder();
        }

        return false;
    }

    private _onBoundsChanged() {
        var bgColor = background.ios.createBackgroundUIColor(this);
        if (bgColor) {
            this._nativeView.backgroundColor = bgColor;
        }
    }
}

export class CustomLayoutView extends View {

    private _view: UIView;

    constructor() {
        super();

        this._view = new UIView();
        this._view.autoresizesSubviews = false;
    }

    get ios(): UIView {
        return this._view;
    }

    get _nativeView(): UIView {
        return this._view;
    }

    public onMeasure(widthMeasureSpec: number, heightMeasureSpec: number): void {
        // Don't call super because it will set MeasureDimension. This method must be overriden and calculate its measuredDimensions.

        var width = utils.layout.getMeasureSpecSize(widthMeasureSpec);
        var widthMode = utils.layout.getMeasureSpecMode(widthMeasureSpec);

        var height = utils.layout.getMeasureSpecSize(heightMeasureSpec);
        var heightMode = utils.layout.getMeasureSpecMode(heightMeasureSpec);
        trace.write(this + " :onMeasure: " + utils.layout.getMode(widthMode) + " " + width + ", " + utils.layout.getMode(heightMode) + " " + height, trace.categories.Layout);
    }

    public _addViewToNativeVisualTree(child: View, atIndex: number): boolean {
        super._addViewToNativeVisualTree(child);

        if (this._nativeView && child._nativeView) {
            if (types.isNullOrUndefined(atIndex) || atIndex >= this._nativeView.subviews.count) {
            this._nativeView.addSubview(child._nativeView);
            }
            else {
                this._nativeView.insertSubviewAtIndex(child._nativeView, atIndex);
            }
            
            return true;
        }

        return false;
    }

    public _removeViewFromNativeVisualTree(child: View): void {
        super._removeViewFromNativeVisualTree(child);

        if (child._nativeView) {
            child._nativeView.removeFromSuperview();
        }
    }
}
