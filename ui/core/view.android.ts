import viewCommon = require("./view-common");
import viewDefinition = require("ui/core/view");
import trace = require("trace");
import utils = require("utils/utils");
import dependencyObservable = require("ui/core/dependency-observable");
import proxy = require("ui/core/proxy");
import gestures = require("ui/gestures");
import * as typesModule from "utils/types";
import style = require("ui/styling/style");
import styling = require("ui/styling");
import enums = require("ui/enums");
import background = require("ui/styling/background");
import {CommonLayoutParams, Thickness} from "ui/styling/style";

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

function onTranslateXPropertyChanged(data: dependencyObservable.PropertyChangeData) {
    var view = <View>data.object;
    view._nativeView.setTranslationX(data.newValue * utils.layout.getDisplayDensity());
}
(<proxy.PropertyMetadata>viewCommon.View.translateXProperty.metadata).onSetNativeValue = onTranslateXPropertyChanged;

function onTranslateYPropertyChanged(data: dependencyObservable.PropertyChangeData) {
    var view = <View>data.object;
    view._nativeView.setTranslationY(data.newValue * utils.layout.getDisplayDensity());
}
(<proxy.PropertyMetadata>viewCommon.View.translateYProperty.metadata).onSetNativeValue = onTranslateYPropertyChanged;

function onScaleXPropertyChanged(data: dependencyObservable.PropertyChangeData) {
    var view = <View>data.object;
    view._nativeView.setScaleX(data.newValue);
}
(<proxy.PropertyMetadata>viewCommon.View.scaleXProperty.metadata).onSetNativeValue = onScaleXPropertyChanged;

function onScaleYPropertyChanged(data: dependencyObservable.PropertyChangeData) {
    var view = <View>data.object;
    view._nativeView.setScaleY(data.newValue);
}
(<proxy.PropertyMetadata>viewCommon.View.scaleYProperty.metadata).onSetNativeValue = onScaleYPropertyChanged;

function onOriginXPropertyChanged(data: dependencyObservable.PropertyChangeData) {
    var view = <View>data.object;
    var width = view._nativeView.getWidth();
    view._nativeView.setPivotX(data.newValue * width);
}
(<proxy.PropertyMetadata>viewCommon.View.originXProperty.metadata).onSetNativeValue = onOriginXPropertyChanged;

function onOriginYPropertyChanged(data: dependencyObservable.PropertyChangeData) {
    var view = <View>data.object;
    var height = view._nativeView.getHeight();
    view._nativeView.setPivotY(data.newValue * height);
}
(<proxy.PropertyMetadata>viewCommon.View.originYProperty.metadata).onSetNativeValue = onOriginYPropertyChanged;

function onRotatePropertyChanged(data: dependencyObservable.PropertyChangeData) {
    var view = <View>data.object;
    view._nativeView.setRotation(data.newValue);
}
(<proxy.PropertyMetadata>viewCommon.View.rotateProperty.metadata).onSetNativeValue = onRotatePropertyChanged;

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
        return this._gestureObservers && Object.keys(this._gestureObservers).length > 0
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

                    for (let type in owner._gestureObservers) {
                        let list = owner._gestureObservers[type];
                        for (let i = 0; i < list.length; i++) {
                            list[i].androidOnTouchEvent(motionEvent);
                        }
                    }

                    if (!owner._nativeView || !owner._nativeView.onTouchEvent) {
                        return false;
                    }

                    return owner._nativeView.onTouchEvent(motionEvent);
                }
            }));
        }
    }

    public _addViewCore(view: viewCommon.View, atIndex?: number) {
        if (this._context) {
            view._onAttached(this._context);
        }

        super._addViewCore(view, atIndex);
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
        // Ensure layout params
        if (this._nativeView && !(this._nativeView.getLayoutParams() instanceof org.nativescript.widgets.CommonLayoutParams)) {
            this._nativeView.setLayoutParams(new org.nativescript.widgets.CommonLayoutParams());
        }

        utils.copyFrom(this._options, this);
        delete this._options;

        // copy all the locally cached values to the native android widget
        this._syncNativeProperties();
        trace.notifyEvent(this, "_onContextChanged");
    }

    get _nativeView(): android.view.View {
        return this.android;
    }

    get isLayoutValid(): boolean {
        if (this._nativeView) {
            return !this._nativeView.isLayoutRequested();
        }

        return false;
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
            view.measure(widthMeasureSpec, heightMeasureSpec);
            this.setMeasuredDimension(view.getMeasuredWidth(), view.getMeasuredHeight());
        }
    }

    public onLayout(left: number, top: number, right: number, bottom: number): void {
        var view = this._nativeView;
        if (view) {
            this.layoutNativeView(left, top, right, bottom);
        }
    }

    _getCurrentLayoutBounds(): { left: number; top: number; right: number; bottom: number } {
        if (this._nativeView) {
            return {
                left: this._nativeView.getLeft(),
                top: this._nativeView.getTop(),
                right: this._nativeView.getRight(),
                bottom: this._nativeView.getBottom()
            };
        }

        return super._getCurrentLayoutBounds();
    }

    public getMeasuredWidth(): number {
        if (this._nativeView) {
            return this._nativeView.getMeasuredWidth();
        }

        return super.getMeasuredWidth();
    }

    public getMeasuredHeight(): number {
        if (this._nativeView) {
            return this._nativeView.getMeasuredHeight();
        }

        return super.getMeasuredHeight();
    }

    public focus(): boolean {
        if (this._nativeView) {
            return this._nativeView.requestFocus();
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
        this._viewGroup = new org.nativescript.widgets.ContentLayout(this._context);
    }

    public _addViewToNativeVisualTree(child: View, atIndex?: number): boolean {
        super._addViewToNativeVisualTree(child);

        if (this._nativeView && child._nativeView) {
            var types : typeof typesModule = require("utils/types");

            if (types.isNullOrUndefined(atIndex) || atIndex >= this._nativeView.getChildCount()) {
                this._nativeView.addView(child._nativeView);
            }
            else {
                this._nativeView.addView(child._nativeView, atIndex);
            }
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
}

export class ViewStyler implements style.Styler {
    //Background and borders methods
    private static setBackgroundBorderProperty(view: View, newValue: any, defaultValue?: any) {
        background.ad.onBackgroundOrBorderPropertyChanged(view);
    }

    private static resetBackgroundBorderProperty(view: View, nativeValue: any) {
        background.ad.onBackgroundOrBorderPropertyChanged(view);
    }

    //Visibility methods
    private static setVisibilityProperty(view: View, newValue: any) {
        var androidValue = (newValue === enums.Visibility.visible) ? android.view.View.VISIBLE : android.view.View.GONE;
        (<android.view.View>view._nativeView).setVisibility(androidValue);
    }

    private static resetVisibilityProperty(view: View, nativeValue: any) {
        (<android.view.View>view._nativeView).setVisibility(android.view.View.VISIBLE);
    }

    //Opacity methods
    private static setOpacityProperty(view: View, newValue: any) {
        (<android.view.View>view._nativeView).setAlpha(float(newValue));
    }

    private static resetOpacityProperty(view: View, nativeValue: any) {
        (<android.view.View>view._nativeView).setAlpha(float(1.0));
    }

    //minWidth methods
    private static setMinWidthProperty(view: View, newValue: any) {
        (<android.view.View>view._nativeView).setMinimumWidth(Math.round(newValue * utils.layout.getDisplayDensity()));
    }

    private static resetMinWidthProperty(view: View, nativeValue: any) {
        (<android.view.View>view._nativeView).setMinimumWidth(0);
    }

    //minHeight methods
    private static setMinHeightProperty(view: View, newValue: any) {
        (<android.view.View>view._nativeView).setMinimumHeight(Math.round(newValue * utils.layout.getDisplayDensity()));
    }

    private static resetMinHeightProperty(view: View, nativeValue: any) {
        (<android.view.View>view._nativeView).setMinimumHeight(0);
    }

    private static getNativeLayoutParams(nativeView: android.view.View): org.nativescript.widgets.CommonLayoutParams {
        var lp = <org.nativescript.widgets.CommonLayoutParams>nativeView.getLayoutParams();
        if (!(lp instanceof org.nativescript.widgets.CommonLayoutParams)) {
            lp = new org.nativescript.widgets.CommonLayoutParams();
        }

        return lp;
    }

    private static setNativeLayoutParamsProperty(view: View, params: CommonLayoutParams): void {
        var nativeView: android.view.View = view._nativeView;
        var lp = ViewStyler.getNativeLayoutParams(nativeView);

        lp.widthPercent = params.widthPercent;
        lp.heightPercent = params.heightPercent;

        lp.leftMarginPercent = params.leftMarginPercent;
        lp.topMarginPercent = params.topMarginPercent;
        lp.rightMarginPercent = params.rightMarginPercent;
        lp.bottomMarginPercent = params.bottomMarginPercent;

        lp.leftMargin = Math.round(params.leftMargin * utils.layout.getDisplayDensity());
        lp.topMargin = Math.round(params.topMargin * utils.layout.getDisplayDensity());
        lp.rightMargin = Math.round(params.rightMargin * utils.layout.getDisplayDensity());
        lp.bottomMargin = Math.round(params.bottomMargin * utils.layout.getDisplayDensity());

        var width = params.width * utils.layout.getDisplayDensity();
        var height = params.height * utils.layout.getDisplayDensity();
        
        // If width is not specified set it as WRAP_CONTENT
        if (width < 0) {
            width = -2;
        }

        // If height is not specified set it as WRAP_CONTENT
        if (height < 0) {
            height = -2;
        }

        var gravity = 0;
        switch (params.horizontalAlignment) {
            case enums.HorizontalAlignment.left:
               	gravity |= android.view.Gravity.LEFT;
                break;

            case enums.HorizontalAlignment.center:
                gravity |= android.view.Gravity.CENTER_HORIZONTAL;
                break;

            case enums.HorizontalAlignment.right:
                gravity |= android.view.Gravity.RIGHT;
                break;

            case enums.HorizontalAlignment.stretch:
                gravity |= android.view.Gravity.FILL_HORIZONTAL;
                // If width is not specified set it as MATCH_PARENT
                if (width < 0) {
                    width = -1;
                }
                break;

            default:
                throw new Error("Invalid horizontalAlignment value: " + params.horizontalAlignment);
        }

        switch (params.verticalAlignment) {
            case enums.VerticalAlignment.top:
                gravity |= android.view.Gravity.TOP;
                break;

            case enums.VerticalAlignment.center || enums.VerticalAlignment.middle:
                gravity |= android.view.Gravity.CENTER_VERTICAL;
                break;

            case enums.VerticalAlignment.bottom:
                gravity |= android.view.Gravity.BOTTOM;
                break;

            case enums.VerticalAlignment.stretch:
                gravity |= android.view.Gravity.FILL_VERTICAL;
                // If height is not specified set it as MATCH_PARENT
                if (height < 0) {
                    height = -1;
                }
                break;

            default:
                throw new Error("Invalid verticalAlignment value: " + params.verticalAlignment);
        }

        lp.gravity = gravity;
        lp.width = Math.round(width);
        lp.height = Math.round(height);

        nativeView.setLayoutParams(lp);
    }

    private static resetNativeLayoutParamsProperty(view: View, nativeValue: any): void {
        var nativeView: android.view.View = view._nativeView;
        var lp = ViewStyler.getNativeLayoutParams(nativeView);

        lp.width = -1;
        lp.height = -1;
        lp.leftMargin = 0;
        lp.topMargin = 0;
        lp.rightMargin = 0;
        lp.bottomMargin = 0;
        lp.gravity = android.view.Gravity.FILL_HORIZONTAL | android.view.Gravity.FILL_VERTICAL;
        nativeView.setLayoutParams(lp);
    }

    private static setPaddingProperty(view: View, newValue: Thickness) {
        var density = utils.layout.getDisplayDensity();
        var left = Math.round((newValue.left + view.borderWidth) * density);
        var top = Math.round((newValue.top + view.borderWidth) * density);
        var right = Math.round((newValue.right + view.borderWidth) * density);
        var bottom = Math.round((newValue.bottom + view.borderWidth) * density);
        (<android.view.View>view._nativeView).setPadding(left, top, right, bottom);
    }

    private static resetPaddingProperty(view: View, nativeValue: Thickness) {
        var density = utils.layout.getDisplayDensity();
        var left = Math.round((nativeValue.left + view.borderWidth) * density);
        var top = Math.round((nativeValue.top + view.borderWidth) * density);
        var right = Math.round((nativeValue.right + view.borderWidth) * density);
        var bottom = Math.round((nativeValue.bottom + view.borderWidth) * density);
        (<android.view.View>view._nativeView).setPadding(left, top, right, bottom);
    }

    public static registerHandlers() {
        style.registerHandler(style.visibilityProperty, new style.StylePropertyChangedHandler(
            ViewStyler.setVisibilityProperty,
            ViewStyler.resetVisibilityProperty));

        style.registerHandler(style.opacityProperty, new style.StylePropertyChangedHandler(
            ViewStyler.setOpacityProperty,
            ViewStyler.resetOpacityProperty));

        style.registerHandler(style.minWidthProperty, new style.StylePropertyChangedHandler(
            ViewStyler.setMinWidthProperty,
            ViewStyler.resetMinWidthProperty));

        style.registerHandler(style.minHeightProperty, new style.StylePropertyChangedHandler(
            ViewStyler.setMinHeightProperty,
            ViewStyler.resetMinHeightProperty))

        // Use the same handler for all background/border properties
        // Note: There is no default value getter - the default value is handled in background.ad.onBackgroundOrBorderPropertyChanged
        var borderHandler = new style.StylePropertyChangedHandler(
            ViewStyler.setBackgroundBorderProperty,
            ViewStyler.resetBackgroundBorderProperty);

        style.registerHandler(style.backgroundInternalProperty, borderHandler);
        style.registerHandler(style.borderWidthProperty, borderHandler);
        style.registerHandler(style.borderColorProperty, borderHandler);
        style.registerHandler(style.borderRadiusProperty, borderHandler);

        style.registerHandler(style.nativeLayoutParamsProperty, new style.StylePropertyChangedHandler(
            ViewStyler.setNativeLayoutParamsProperty,
            ViewStyler.resetNativeLayoutParamsProperty));

        style.registerHandler(style.nativePaddingsProperty, new style.StylePropertyChangedHandler(
            ViewStyler.setPaddingProperty,
            ViewStyler.resetPaddingProperty), "TextBase");

        style.registerHandler(style.nativePaddingsProperty, new style.StylePropertyChangedHandler(
            ViewStyler.setPaddingProperty,
            ViewStyler.resetPaddingProperty), "Button");

        style.registerHandler(style.nativePaddingsProperty, new style.StylePropertyChangedHandler(
            ViewStyler.setPaddingProperty,
            ViewStyler.resetPaddingProperty), "LayoutBase");
    }
}

ViewStyler.registerHandlers();
