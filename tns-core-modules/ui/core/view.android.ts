import viewCommon = require("./view-common");
import viewDefinition = require("ui/core/view");
import trace = require("trace");
import utils = require("utils/utils");
import dependencyObservable = require("ui/core/dependency-observable");
import proxy = require("ui/core/proxy");
import gestures = require("ui/gestures");
import * as types from "utils/types";
import style = require("ui/styling/style");
import enums = require("ui/enums");
import background = require("ui/styling/background");
import {CommonLayoutParams} from "ui/styling/style";
import {device} from "platform";

var flexbox;

global.moduleMerge(viewCommon, exports);

var ANDROID = "_android";
var NATIVE_VIEW = "_nativeView";
var VIEW_GROUP = "_viewGroup";

function onAutomationTextPropertyChanged(data: dependencyObservable.PropertyChangeData) {
    var view = <View>data.object;
    view._nativeView.setContentDescription(data.newValue);
}
(<proxy.PropertyMetadata>viewCommon.View.automationTextProperty.metadata).onSetNativeValue = onAutomationTextPropertyChanged;

function onIdPropertyChanged(data: dependencyObservable.PropertyChangeData) {
    var view = <View>data.object;
    view._nativeView.setTag(data.newValue + "");
}
(<proxy.PropertyMetadata>viewCommon.View.idProperty.metadata).onSetNativeValue = onIdPropertyChanged;

function onOriginXPropertyChanged(data: dependencyObservable.PropertyChangeData) {
    org.nativescript.widgets.OriginPoint.setX((<View>data.object)._nativeView, data.newValue);
}
(<proxy.PropertyMetadata>viewCommon.View.originXProperty.metadata).onSetNativeValue = onOriginXPropertyChanged;

function onOriginYPropertyChanged(data: dependencyObservable.PropertyChangeData) {
    org.nativescript.widgets.OriginPoint.setY((<View>data.object)._nativeView, data.newValue);
}
(<proxy.PropertyMetadata>viewCommon.View.originYProperty.metadata).onSetNativeValue = onOriginYPropertyChanged;

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

let styleHandlersInitialized: boolean;

export class View extends viewCommon.View {
    private _disableUserInteractionListener: android.view.View.OnTouchListener = new android.view.View.OnTouchListener({
        onTouch: function (view: android.view.View, event: android.view.MotionEvent) {
            return true;
        }
    });

    constructor() {
        super();
        if (!styleHandlersInitialized) {
            styleHandlersInitialized = true;
            ViewStyler.registerHandlers();
        }
    }

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
        this._unregisterAllAnimations();
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

    public _addViewCore(view: View, atIndex?: number) {
        if (this._context) {
            view._onAttached(this._context);
        }

        super._addViewCore(view, atIndex);

        if (this._context) {
            view._syncNativeProperties();
        }
    }

    public _removeViewCore(view: viewCommon.View) {
        super._removeViewCore(view);
        if (view._context) {
            view._onDetached();
        }
    }

    public _onAttached(context: android.content.Context) {
        if (!context) {
            throw new Error("Expected valid android.content.Context instance.");
        }

        if (trace.enabled) {
            trace.write(`${this}._onAttached(context)`, trace.categories.VisualTreeEvents);
        }
        if (this._context === context) {
            return;
        }

        if (this._context) {
            this._onDetached(true);
        }

        this._context = context;
        this._onContextChanged();

        trace.notifyEvent(this, "_onAttached");

        if (this._childrenCount > 0) {
            // Notify each child for the _onAttached event
            var that = this;
            var eachChild = (child: View): boolean => {
                child._onAttached(context);
                if (!child._isAddedToNativeVisualTree) {
                    // since we have lazy loading of the android widgets, we need to add the native instances at this point.
                    child._isAddedToNativeVisualTree = that._addViewToNativeVisualTree(child);
                }
                child._syncNativeProperties();

                return true;
            }
            this._eachChildView(eachChild);
        }
    }

    public _onDetached(force?: boolean) {
        if (trace.enabled) {
            trace.write(`${this}._onDetached(force)`, trace.categories.VisualTreeEvents);
        }
        if (this._childrenCount > 0) {
            // Detach children first
            var that = this;
            var eachChild = function (child: View): boolean {
                if (child._isAddedToNativeVisualTree) {
                    that._removeViewFromNativeVisualTree(child);
                }
                if (child._context) {
                    child._onDetached(force);
                }
                return true;
            }
            this._eachChildView(eachChild);
        }

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
        if (trace.enabled) {
            trace.write(`${this}._onContextChanged`, trace.categories.VisualTreeEvents);
        }
        this._createUI();
        // Ensure layout params
        if (this._nativeView && !this._nativeView.getLayoutParams()) {
            this._nativeView.setLayoutParams(new org.nativescript.widgets.CommonLayoutParams());
        }

        // copy all the locally cached values to the native android widget
        // Initialize padding default values.
        // TODO: remove this code.
        let padding = this.style.paddingLeft;
        padding = this.style.paddingTop;
        padding = this.style.paddingRight;
        padding = this.style.paddingBottom;

        trace.notifyEvent(this, "_onContextChanged");
    }

    get _nativeView(): android.view.View {
        return this.android;
    }

    get isLayoutRequired(): boolean {
        return !this.isLayoutValid;
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

    public getLocationInWindow(): viewDefinition.Point {
        if (!this._nativeView || !this._nativeView.getWindowToken()) {
            return undefined;
        }

        var nativeArray = (<any>Array).create("int", 2);
        this._nativeView.getLocationInWindow(nativeArray);
        return {
            x: utils.layout.toDeviceIndependentPixels(nativeArray[0]),
            y: utils.layout.toDeviceIndependentPixels(nativeArray[1]),
        }
    }

    public getLocationOnScreen(): viewDefinition.Point {
        if (!this._nativeView || !this._nativeView.getWindowToken()) {
            return undefined;
        }

        var nativeArray = (<any>Array).create("int", 2);
        this._nativeView.getLocationOnScreen(nativeArray);
        return {
            x: utils.layout.toDeviceIndependentPixels(nativeArray[0]),
            y: utils.layout.toDeviceIndependentPixels(nativeArray[1]),
        }
    }

    public getLocationRelativeTo(otherView: viewDefinition.View): viewDefinition.Point {
        if (!this._nativeView || !this._nativeView.getWindowToken() ||
            !otherView._nativeView || !otherView._nativeView.getWindowToken() ||
            this._nativeView.getWindowToken() !== otherView._nativeView.getWindowToken()) {
            return undefined;
        }

        var myArray = (<any>Array).create("int", 2);
        this._nativeView.getLocationOnScreen(myArray);
        var otherArray = (<any>Array).create("int", 2);
        otherView._nativeView.getLocationOnScreen(otherArray);
        return {
            x: utils.layout.toDeviceIndependentPixels(myArray[0] - otherArray[0]),
            y: utils.layout.toDeviceIndependentPixels(myArray[1] - otherArray[1]),
        }
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
            if (types.isNullOrUndefined(atIndex) || atIndex >= this._nativeView.getChildCount()) {
                if (trace.enabled) {
                    trace.write(`${this}._nativeView.addView(${child}._nativeView)`, trace.categories.VisualTreeEvents);
                }
                this._nativeView.addView(child._nativeView);
            }
            else {
                if (trace.enabled) {
                    trace.write(`${this}._nativeView.addView(${child}._nativeView, ${atIndex})`, trace.categories.VisualTreeEvents);
                }
                this._nativeView.addView(child._nativeView, atIndex);
            }
            return true;
        }

        return false;
    }

    public _removeViewFromNativeVisualTree(child: View): void {
        super._removeViewFromNativeVisualTree(child);

        if (this._nativeView && child._nativeView) {
            if (trace.enabled) {
                trace.write(`${this}._nativeView.removeView(${child}._nativeView)`, trace.categories.VisualTreeEvents);
            }
            this._nativeView.removeView(child._nativeView);
            trace.notifyEvent(child, "childInLayoutRemovedFromNativeVisualTree");
        }
    }
}

export class ViewStyler implements style.Styler {
    // Background and borders methods
    private static setBackgroundAndBorder(view: View, newValue: any, defaultValue?: any) {
        background.ad.onBackgroundOrBorderPropertyChanged(view);
    }

    private static resetBackgroundAndBorder(view: View, nativeValue: any) {
        background.ad.onBackgroundOrBorderPropertyChanged(view);
    }

    // Visibility methods
    private static setVisibilityProperty(view: View, newValue: any) {
        var androidValue = (newValue === enums.Visibility.visible) ? android.view.View.VISIBLE : android.view.View.GONE;
        (<android.view.View>view._nativeView).setVisibility(androidValue);
    }

    private static resetVisibilityProperty(view: View, nativeValue: any) {
        (<android.view.View>view._nativeView).setVisibility(android.view.View.VISIBLE);
    }

    // Opacity methods
    private static setOpacityProperty(view: View, newValue: any) {
        (<android.view.View>view._nativeView).setAlpha(float(newValue));
    }

    private static resetOpacityProperty(view: View, nativeValue: any) {
        (<android.view.View>view._nativeView).setAlpha(float(1.0));
    }

    // minWidth methods
    private static setMinWidthProperty(view: View, newValue: any) {
        (<android.view.View>view._nativeView).setMinimumWidth(Math.round(newValue * utils.layout.getDisplayDensity()));
    }

    private static resetMinWidthProperty(view: View, nativeValue: any) {
        (<android.view.View>view._nativeView).setMinimumWidth(0);
    }

    // minHeight methods
    private static setMinHeightProperty(view: View, newValue: any) {
        (<android.view.View>view._nativeView).setMinimumHeight(Math.round(newValue * utils.layout.getDisplayDensity()));
    }

    private static resetMinHeightProperty(view: View, nativeValue: any) {
        (<android.view.View>view._nativeView).setMinimumHeight(0);
    }

    private static setNativeLayoutParamsProperty(view: View, params: CommonLayoutParams): void {
        let nativeView: android.view.View = view._nativeView;

        let width = params.width * utils.layout.getDisplayDensity();
        let height = params.height * utils.layout.getDisplayDensity();

        // If width is not specified set it as WRAP_CONTENT
        if (width < 0) {
            width = -2;
        }

        // If height is not specified set it as WRAP_CONTENT
        if (height < 0) {
            height = -2;
        }

        let gravity = 0;
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

            case enums.VerticalAlignment.center:
            case enums.VerticalAlignment.middle:
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

        let lp = nativeView.getLayoutParams();
        lp.width = Math.round(width);
        lp.height = Math.round(height);

        if (lp instanceof org.nativescript.widgets.CommonLayoutParams) {
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
            lp.gravity = gravity;

            if (lp instanceof org.nativescript.widgets.FlexboxLayout.LayoutParams) {
                if (!flexbox) {
                    flexbox = require("ui/layouts/flexbox-layout");
                }
                flexbox._setAndroidLayoutParams(lp, view);
            }
        }
        else {
            let layoutParams: any = lp;
            if (types.isDefined(layoutParams.widthPercent)) {
                layoutParams.widthPercent = params.widthPercent;
            }

            if (types.isDefined(layoutParams.heightPercent)) {
                layoutParams.heightPercent = params.heightPercent;
            }

            if (types.isDefined(layoutParams.leftMarginPercent)) {
                layoutParams.leftMarginPercent = params.leftMarginPercent;
            }

            if (types.isDefined(layoutParams.topMarginPercent)) {
                layoutParams.topMarginPercent = params.topMarginPercent;
            }

            if (types.isDefined(layoutParams.rightMarginPercent)) {
                layoutParams.rightMarginPercent = params.rightMarginPercent;
            }

            if (types.isDefined(layoutParams.bottomMarginPercent)) {
                layoutParams.bottomMarginPercent = params.bottomMarginPercent;
            }

            if (types.isDefined(layoutParams.leftMargin)) {
                layoutParams.leftMargin = Math.round(params.leftMargin * utils.layout.getDisplayDensity());
            }

            if (types.isDefined(layoutParams.topMargin)) {
                layoutParams.topMargin = Math.round(params.topMargin * utils.layout.getDisplayDensity());
            }

            if (types.isDefined(layoutParams.rightMargin)) {
                layoutParams.rightMargin = Math.round(params.rightMargin * utils.layout.getDisplayDensity());
            }

            if (types.isDefined(layoutParams.bottomMargin)) {
                layoutParams.bottomMargin = Math.round(params.bottomMargin * utils.layout.getDisplayDensity());
            }

            if (types.isDefined(layoutParams.gravity)) {
                layoutParams.gravity = gravity;
            }
        }

        nativeView.setLayoutParams(lp);
    }

    private static resetNativeLayoutParamsProperty(view: View, nativeValue: any): void {
        ViewStyler.setNativeLayoutParamsProperty(view, style.nativeLayoutParamsProperty.defaultValue)
    }

    private static getNativePaddingLeft(view: View): number {
        let density = utils.layout.getDisplayDensity();
        return view._nativeView.getPaddingLeft() / density;
    }

    private static getNativePaddingTop(view: View): number {
        let density = utils.layout.getDisplayDensity();
        return view._nativeView.getPaddingTop() / density;
    }

    private static getNativePaddingRight(view: View): number {
        let density = utils.layout.getDisplayDensity();
        return view._nativeView.getPaddingRight() / density;
    }

    private static getNativePaddingBottom(view: View): number {
        let density = utils.layout.getDisplayDensity();
        return view._nativeView.getPaddingBottom() / density;
    }

    private static setNativePaddingLeft(view: View, value: number): void {
        let nativeView = view._nativeView;
        let density = utils.layout.getDisplayDensity();
        let left = (value + view.borderLeftWidth) * density;
        let top = nativeView.getPaddingTop();
        let right = nativeView.getPaddingRight();
        let bottom = nativeView.getPaddingBottom();
        nativeView.setPadding(left, top, right, bottom);
    }

    private static setNativePaddingTop(view: View, value: number): void {
        let nativeView = view._nativeView;
        let density = utils.layout.getDisplayDensity();
        let left = nativeView.getPaddingLeft();
        let top = (value + view.borderTopWidth) * density;
        let right = nativeView.getPaddingRight();
        let bottom = nativeView.getPaddingBottom();
        nativeView.setPadding(left, top, right, bottom);
    }

    private static setNativePaddingRight(view: View, value: number): void {
        let nativeView = view._nativeView;
        let density = utils.layout.getDisplayDensity();
        let left = nativeView.getPaddingLeft();
        let top = nativeView.getPaddingTop();
        let right = (value + view.borderRightWidth) * density;
        let bottom = nativeView.getPaddingBottom();
        nativeView.setPadding(left, top, right, bottom);
    }

    private static setNativePaddingBottom(view: View, value: number): void {
        let nativeView = view._nativeView;
        let density = utils.layout.getDisplayDensity();
        let left = nativeView.getPaddingLeft();
        let top = nativeView.getPaddingTop();
        let right = nativeView.getPaddingRight();
        let bottom = (value + view.borderBottomWidth) * density;
        nativeView.setPadding(left, top, right, bottom);
    }

    // Rotate
    private static setRotateProperty(view: View, newValue: any) {
        view._nativeView.setRotation(newValue);
    }

    private static resetRotateProperty(view: View, nativeValue: any) {
        view._nativeView.setRotation(float(0));
    }

    // ScaleX
    private static setScaleXProperty(view: View, newValue: any) {
        view._nativeView.setScaleX(newValue);
    }

    private static resetScaleXProperty(view: View, nativeValue: any) {
        view._nativeView.setScaleX(float(1.0));
    }

    // ScaleY
    private static setScaleYProperty(view: View, newValue: any) {
        view._nativeView.setScaleY(newValue);
    }

    private static resetScaleYProperty(view: View, nativeValue: any) {
        view._nativeView.setScaleY(float(1.0));
    }

    // TranslateX
    private static setTranslateXProperty(view: View, newValue: any) {
        view._nativeView.setTranslationX(newValue * utils.layout.getDisplayDensity());
    }

    private static resetTranslateXProperty(view: View, nativeValue: any) {
        view._nativeView.setTranslationX(float(0));
    }

    // TranslateY
    private static setTranslateYProperty(view: View, newValue: any) {
        view._nativeView.setTranslationY(newValue * utils.layout.getDisplayDensity());
    }

    private static resetTranslateYProperty(view: View, nativeValue: any) {
        view._nativeView.setTranslationY(float(0));
    }

    // z-index
    private static getZIndexProperty(view: View): any {
        return view.android.getZ ? view.android.getZ() : 0;
    }

    private static setZIndexProperty(view: View, newValue: any) {
        if (view.android.setZ) {
            view.android.setZ(newValue);

            if (view.android instanceof android.widget.Button) {
                (<any>view.android).setStateListAnimator(null);
            }
        }
    }

    private static resetZIndexProperty(view: View, nativeValue: any) {
        if (view.android.setZ) {
            view.android.setZ(nativeValue);
        }
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
        style.registerHandler(style.backgroundInternalProperty, new style.StylePropertyChangedHandler(
            ViewStyler.setBackgroundAndBorder,
            ViewStyler.resetBackgroundAndBorder));

        style.registerHandler(style.nativeLayoutParamsProperty, new style.StylePropertyChangedHandler(
            ViewStyler.setNativeLayoutParamsProperty,
            ViewStyler.resetNativeLayoutParamsProperty));

        style.registerHandler(style.paddingLeftProperty,
            new style.StylePropertyChangedHandler(ViewStyler.setNativePaddingLeft, ViewStyler.setNativePaddingLeft, ViewStyler.getNativePaddingLeft), "TextBase");
        style.registerHandler(style.paddingTopProperty,
            new style.StylePropertyChangedHandler(ViewStyler.setNativePaddingTop, ViewStyler.setNativePaddingTop, ViewStyler.getNativePaddingTop), "TextBase");
        style.registerHandler(style.paddingRightProperty,
            new style.StylePropertyChangedHandler(ViewStyler.setNativePaddingRight, ViewStyler.setNativePaddingRight, ViewStyler.getNativePaddingRight), "TextBase");
        style.registerHandler(style.paddingBottomProperty,
            new style.StylePropertyChangedHandler(ViewStyler.setNativePaddingBottom, ViewStyler.setNativePaddingBottom, ViewStyler.getNativePaddingBottom), "TextBase");

        style.registerHandler(style.paddingLeftProperty,
            new style.StylePropertyChangedHandler(ViewStyler.setNativePaddingLeft, ViewStyler.setNativePaddingLeft, ViewStyler.getNativePaddingLeft), "Button");
        style.registerHandler(style.paddingTopProperty,
            new style.StylePropertyChangedHandler(ViewStyler.setNativePaddingTop, ViewStyler.setNativePaddingTop, ViewStyler.getNativePaddingTop), "Button");
        style.registerHandler(style.paddingRightProperty,
            new style.StylePropertyChangedHandler(ViewStyler.setNativePaddingRight, ViewStyler.setNativePaddingRight, ViewStyler.getNativePaddingRight), "Button");
        style.registerHandler(style.paddingBottomProperty,
            new style.StylePropertyChangedHandler(ViewStyler.setNativePaddingBottom, ViewStyler.setNativePaddingBottom, ViewStyler.getNativePaddingBottom), "Button");

        style.registerHandler(style.paddingLeftProperty,
            new style.StylePropertyChangedHandler(ViewStyler.setNativePaddingLeft, ViewStyler.setNativePaddingLeft, ViewStyler.getNativePaddingLeft), "LayoutBase");
        style.registerHandler(style.paddingTopProperty,
            new style.StylePropertyChangedHandler(ViewStyler.setNativePaddingTop, ViewStyler.setNativePaddingTop, ViewStyler.getNativePaddingTop), "LayoutBase");
        style.registerHandler(style.paddingRightProperty,
            new style.StylePropertyChangedHandler(ViewStyler.setNativePaddingRight, ViewStyler.setNativePaddingRight, ViewStyler.getNativePaddingRight), "LayoutBase");
        style.registerHandler(style.paddingBottomProperty,
            new style.StylePropertyChangedHandler(ViewStyler.setNativePaddingBottom, ViewStyler.setNativePaddingBottom, ViewStyler.getNativePaddingBottom), "LayoutBase");

        style.registerHandler(style.rotateProperty, new style.StylePropertyChangedHandler(
            ViewStyler.setRotateProperty,
            ViewStyler.resetRotateProperty));

        style.registerHandler(style.scaleXProperty, new style.StylePropertyChangedHandler(
            ViewStyler.setScaleXProperty,
            ViewStyler.resetScaleXProperty));

        style.registerHandler(style.scaleYProperty, new style.StylePropertyChangedHandler(
            ViewStyler.setScaleYProperty,
            ViewStyler.resetScaleYProperty));

        style.registerHandler(style.translateXProperty, new style.StylePropertyChangedHandler(
            ViewStyler.setTranslateXProperty,
            ViewStyler.resetTranslateXProperty));

        style.registerHandler(style.translateYProperty, new style.StylePropertyChangedHandler(
            ViewStyler.setTranslateYProperty,
            ViewStyler.resetTranslateYProperty));

        if (parseInt(device.sdkVersion, 10) >= 21) {
            style.registerHandler(style.zIndexProperty, new style.StylePropertyChangedHandler(
                ViewStyler.setZIndexProperty,
                ViewStyler.resetZIndexProperty,
                ViewStyler.getZIndexProperty));
        }
    }
}