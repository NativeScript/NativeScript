import viewCommon = require("ui/core/view-common");
import viewDefinition = require("ui/core/view");
import trace = require("trace");
import utils = require("utils/utils");
import dependencyObservable = require("ui/core/dependency-observable");
import proxy = require("ui/core/proxy");
import gestures = require("ui/gestures");

global.moduleMerge(viewCommon, exports);

var ANDROID = "_android";
var NATIVE_VIEW = "_nativeView";
var VIEW_GROUP = "_viewGroup";
var OWNER = "_owner";

function onIdPropertyChanged(data: dependencyObservable.PropertyChangeData) {
    var view = <View>data.object;
    view._nativeView.setTag(data.newValue);
}
(<proxy.PropertyMetadata>viewCommon.View.idProperty.metadata).onSetNativeValue = onIdPropertyChanged;

function onIsEnabledPropertyChanged(data: dependencyObservable.PropertyChangeData) {
    var view = <View>data.object;
    view._nativeView.setEnabled(data.newValue);
}
(<proxy.PropertyMetadata>viewCommon.View.isEnabledProperty.metadata).onSetNativeValue = onIsEnabledPropertyChanged;

function onIsUserInteractionEnabledPropertyChanged(data: dependencyObservable.PropertyChangeData) {
    var view = <View>data.object;
    view._updateOnTouchListener(data.newValue);
}
(<proxy.PropertyMetadata>viewCommon.View.isUserInteractionEnabledProperty.metadata).onSetNativeValue = onIsUserInteractionEnabledPropertyChanged;

export var NativeViewGroup = (<any>android.view.ViewGroup).extend({
    get owner() {
        return this[OWNER];
    },
    onMeasure: function (widthMeasureSpec, heightMeasureSpec) {
        var owner: viewDefinition.View = this.owner;
        owner.onMeasure(widthMeasureSpec, heightMeasureSpec);
        this.setMeasuredDimension(owner.getMeasuredWidth(), owner.getMeasuredHeight());
    },
    onLayout: function (changed: boolean, left: number, top: number, right: number, bottom: number): void {
        var owner: viewDefinition.View = this.owner;
        owner.onLayout(left, top, right, bottom);
    }
});

export class View extends viewCommon.View {
    private _disableUserInteractionListener: android.view.View.OnTouchListener = new android.view.View.OnTouchListener({
        onTouch: function (view: android.view.View, event: android.view.MotionEvent) {
            return true;
        }
    });

    public _updateOnTouchListener(isUserInteractionEnabled: boolean) {
        // User interaction is disabled -- we stop it and we do not care whether someone wants to listen for gestures.
        if (!isUserInteractionEnabled) {
            this._nativeView.setOnTouchListener(this._disableUserInteractionListener);
            return;
        }

        // User interaction is enabled and someone wants to listen for gestures.
        if (this._gesturesListener) {
            this._nativeView.setOnTouchListener(this._gesturesListener);
            return;
        }

        // User interaction is enabled and no one wants to listen for gestures.
        this._nativeView.setOnTouchListener(null);
    }

    private _gesturesListener: android.view.View.OnTouchListener;
    set gesturesListener(value: android.view.View.OnTouchListener) {
        this._gesturesListener = value;
        this._updateOnTouchListener(this.isUserInteractionEnabled);
    }

    observe(type: gestures.GestureTypes, callback: (args: gestures.GestureEventData) => void, thisArg?: any): void {
        super.observe(type, callback, thisArg);
        if (this.isLoaded && !this.touchListenerIsSet) {
            this.setOnTouchListener();
        }
    }

    private touchListenerIsSet: boolean;

    public onLoaded() {
        super.onLoaded();
        this.setOnTouchListener();
    }

    public onUnloaded() {
        super.onUnloaded();
        if (this._nativeView && this._nativeView.setOnTouchListener) {
            this._nativeView.setOnTouchListener(null);
            this.touchListenerIsSet = false;
        }
    }

    private hasGestureObservers() {
        return this._gestureObservers ? this._gestureObservers.size > 0 : false;
    }

    private setOnTouchListener() {
        if (this._nativeView && this._nativeView.setOnTouchListener && this.hasGestureObservers()) {
            this.touchListenerIsSet = true;
            var that = new WeakRef(this);
            if (this._nativeView.setClickable) {
                this._nativeView.setClickable(true);
            }
            this._nativeView.setOnTouchListener(new android.view.View.OnTouchListener({
                onTouch: function (view: android.view.View, motionEvent: android.view.MotionEvent) {
                    var owner = that.get();
                    if (!owner) {
                        return false;
                    }

                    var i;
                    for (var gestType in gestures.GestureTypes) {
                        if (gestures.GestureTypes.hasOwnProperty(gestType) && typeof gestures.GestureTypes[gestType] === "number") {
                            var gestArray = owner.getGestureObservers(parseInt(gestures.GestureTypes[gestType]));
                            if (gestArray) {
                                for (i = 0; i < gestArray.length; i++) {
                                    var gestObserver = gestArray[i];
                                    gestObserver.androidOnTouchEvent(motionEvent);
                                }
                            }
                        }
                    }
                    return owner._nativeView.onTouchEvent(motionEvent);
                }
            }));
        }
    }

    public _addViewCore(view: viewCommon.View) {
        if (this._context) {
            view._onAttached(this._context);
        }

        super._addViewCore(view);
    }

    public _removeViewCore(view: viewCommon.View) {
        super._removeViewCore(view);
        // TODO: Detach from the context?
        view._onDetached();
    }

    public _onAttached(context: android.content.Context) {
        if (!context) {
            throw new Error("Expected valid android.content.Context instance.");
        }

        trace.write("calling _onAttached on view " + this._domId, trace.categories.VisualTreeEvents);

        if (this._context === context) {
            return;
        }

        if (this._context) {
            this._onDetached();
        }

        this._context = context;
        this._onContextChanged();

        trace.notifyEvent(this, "_onAttached");

        if (this._childrenCount > 0) {
            // Notify each child for the _onAttached event
            var that = this;
            var eachChild = function (child: View): boolean {
                child._onAttached(context);
                if (!child._isAddedToNativeVisualTree) {
                    // since we have lazy loading of the android widgets, we need to add the native instances at this point.
                    child._isAddedToNativeVisualTree = that._addViewToNativeVisualTree(child);
                }
                return true;
            }
            this._eachChildView(eachChild);
        }
    }

    public _onDetached(force?: boolean) {
        if (this._childrenCount > 0) {
            // Detach children first
            var that = this;
            var eachChild = function (child: View): boolean {
                if (child._isAddedToNativeVisualTree) {
                    that._removeViewFromNativeVisualTree(child);
                }
                child._onDetached(force);
                return true;
            }
            this._eachChildView(eachChild);
        }

        trace.write("calling _onDetached on view " + this._domId, trace.categories.VisualTreeEvents);

        this._clearAndroidReference();

        this._context = undefined;

        trace.notifyEvent(this, "_onDetached");
    }

    // TODO: revise this method
    public _clearAndroidReference() {

        // Widgets like buttons and such have reference to their native view in both properties.
        if (this[NATIVE_VIEW] === this[ANDROID]) {
            this[NATIVE_VIEW] = undefined;
        }

        // Handle layout and content view
        if (this[VIEW_GROUP] === this[ANDROID]) {
            this[VIEW_GROUP] = undefined;
        }

        this[ANDROID] = undefined;
    }

    public _onContextChanged() {
        trace.write("calling _onContextChanged on view " + this._domId, trace.categories.VisualTreeEvents);

        this._createUI();

        utils.copyFrom(this._options, this);
        delete this._options;

        // copy all the locally cached values to the native android widget
        this._syncNativeProperties();
        trace.notifyEvent(this, "_onContextChanged");
    }

    get _nativeView(): android.view.View {
        return this.android;
    }

    public layoutNativeView(left: number, top: number, right: number, bottom: number): void {
        if (this._nativeView) {
            this._nativeView.layout(left, top, right, bottom);
        }
    }

    public requestLayout(): void {
        super.requestLayout();
        if (this._nativeView) {
            return this._nativeView.requestLayout();
        }
    }

    public measure(widthMeasureSpec: number, heightMeasureSpec: number): void {
        super.measure(widthMeasureSpec, heightMeasureSpec);
        this.onMeasure(widthMeasureSpec, heightMeasureSpec);
    }

    public layout(left: number, top: number, right: number, bottom: number): void {
        super.layout(left, top, right, bottom);
        this.onLayout(left, top, right, bottom);
    }

    public onMeasure(widthMeasureSpec: number, heightMeasureSpec: number): void {
        var view = this._nativeView;
        if (view) {
            var width = utils.layout.getMeasureSpecSize(widthMeasureSpec);
            var widthMode = utils.layout.getMeasureSpecMode(widthMeasureSpec);

            var height = utils.layout.getMeasureSpecSize(heightMeasureSpec);
            var heightMode = utils.layout.getMeasureSpecMode(heightMeasureSpec);

            trace.write(this + " :onMeasure: " + utils.layout.getMode(widthMode) + " " + width + ", " + utils.layout.getMode(heightMode) + " " + height, trace.categories.Layout);

            view.measure(widthMeasureSpec, heightMeasureSpec);
            this.setMeasuredDimension(view.getMeasuredWidth(), view.getMeasuredHeight());
        }
    }

    public onLayout(left: number, top: number, right: number, bottom: number): void {
        var view = this._nativeView;
        if (view) {
            this.layoutNativeView(left, top, right, bottom);
            trace.write(this + " :onLayout: " + left + ", " + top + ", " + (right - left) + ", " + (bottom - top), trace.categories.Layout);
        }
    }

    public focus(): boolean {
        if (this.android) {
            return this.android.requestFocus();
        }

        return false;
    }

    public static resolveSizeAndState(size: number, specSize: number, specMode: number, childMeasuredState: number): number {
        var result = size;
        switch (specMode) {
            case utils.layout.UNSPECIFIED:
                result = size;
                break;

            case utils.layout.AT_MOST:
                if (specSize < size) {
                    result = specSize | utils.layout.MEASURED_STATE_TOO_SMALL;
                }
                break;

            case utils.layout.EXACTLY:
                result = specSize;
                break;
        }

        return result | (childMeasuredState & utils.layout.MEASURED_STATE_MASK);
    }
}

export class CustomLayoutView extends View implements viewDefinition.CustomLayoutView {
    private _viewGroup: android.view.ViewGroup;

    get android(): android.view.ViewGroup {
        return this._viewGroup;
    }

    get _nativeView(): android.view.ViewGroup {
        return this._viewGroup;
    }

    public _createUI() {
        this._viewGroup = new NativeViewGroup(this._context);
        this._viewGroup[OWNER] = this;
    }

    //public _onDetached(force?: boolean) {
    //    delete this._viewGroup[OWNER];
    //    super._onDetached(force);
    //}

    public _addViewToNativeVisualTree(child: View): boolean {
        super._addViewToNativeVisualTree(child);

        if (this._nativeView && child._nativeView) {
            this._nativeView.addView(child._nativeView);
            return true;
        }

        return false;
    }

    public _removeViewFromNativeVisualTree(child: View): void {
        super._removeViewFromNativeVisualTree(child);

        if (this._nativeView && child._nativeView) {
            this._nativeView.removeView(child._nativeView);
            trace.notifyEvent(child, "childInLayoutRemovedFromNativeVisualTree");
        }
    }

    public measure(widthMeasureSpec: number, heightMeasureSpec: number): void {
        this._setCurrentMeasureSpecs(widthMeasureSpec, heightMeasureSpec);

        var view = this._nativeView;
        if (view) {
            var width = utils.layout.getMeasureSpecSize(widthMeasureSpec);
            var widthMode = utils.layout.getMeasureSpecMode(widthMeasureSpec);

            var height = utils.layout.getMeasureSpecSize(heightMeasureSpec);
            var heightMode = utils.layout.getMeasureSpecMode(heightMeasureSpec);

            trace.write(this + " :measure: " + utils.layout.getMode(widthMode) + " " + width + ", " + utils.layout.getMode(heightMode) + " " + height, trace.categories.Layout);
            view.measure(widthMeasureSpec, heightMeasureSpec);
        }
    }

    public layout(left: number, top: number, right: number, bottom: number): void {
        this._setCurrentLayoutBounds(left, top, right, bottom);

        var view = this._nativeView;
        if (view) {
            this.layoutNativeView(left, top, right, bottom);
            trace.write(this + " :layout: " + left + ", " + top + ", " + (right - left) + ", " + (bottom - top), trace.categories.Layout);
        }
    }
    
    public onMeasure(widthMeasureSpec: number, heightMeasureSpec: number): void {
        // Don't call super because it will trigger measure again.

        var width = utils.layout.getMeasureSpecSize(widthMeasureSpec);
        var widthMode = utils.layout.getMeasureSpecMode(widthMeasureSpec);

        var height = utils.layout.getMeasureSpecSize(heightMeasureSpec);
        var heightMode = utils.layout.getMeasureSpecMode(heightMeasureSpec);
        trace.write(this + " :onMeasure: " + utils.layout.getMode(widthMode) + " " + width + ", " + utils.layout.getMode(heightMode) + " " + height, trace.categories.Layout);
    }

    public onLayout(left: number, top: number, right: number, bottom: number): void {
        // Don't call super because it will trigger layout again.
        trace.write(this + " :onLayout: " + left + ", " + top + ", " + (right - left) + ", " + (bottom - top), trace.categories.Layout);
    }
}