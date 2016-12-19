import { PercentLength, Length, Point, CustomLayoutView as CustomLayoutViewDefinition } from "ui/core/view";
import { ad as androidBackground } from "ui/styling/background";
import {
    ViewCommon, layout, isEnabledProperty, originXProperty, originYProperty, automationTextProperty, isUserInteractionEnabledProperty, visibilityProperty, opacityProperty, minWidthProperty, minHeightProperty,
    widthProperty, heightProperty, marginLeftProperty, marginTopProperty,
    marginRightProperty, marginBottomProperty, horizontalAlignmentProperty, verticalAlignmentProperty,
    paddingLeftProperty, paddingTopProperty, paddingRightProperty, paddingBottomProperty,
    rotateProperty, scaleXProperty, scaleYProperty,
    translateXProperty, translateYProperty, zIndexProperty, backgroundInternalProperty,
    Background, GestureTypes, GestureEventData, applyNativeSetters, Property,
    traceEnabled, traceWrite, traceCategories, traceNotifyEvent, Visibility, HorizontalAlignment, VerticalAlignment
} from "./view-common";

export * from "./view-common";

let flexbox;

const ANDROID = "_android";
const NATIVE_VIEW = "_nativeView";
const VIEW_GROUP = "_viewGroup";

// TODO: Move this class into widgets.
@Interfaces([android.view.View.OnTouchListener])
class DisableUserInteractionListener extends java.lang.Object implements android.view.View.OnTouchListener {
    constructor() {
        super();
        return global.__native(this);
    }

    onTouch(view: android.view.View, event: android.view.MotionEvent): boolean {
        return true;
    }
}

@Interfaces([android.view.View.OnTouchListener])
class TouchListener extends java.lang.Object implements android.view.View.OnTouchListener {
    constructor(private owner: WeakRef<View>) {
        super();
        return global.__native(this);
    }

    onTouch(view: android.view.View, event: android.view.MotionEvent): boolean {
        let owner = this.owner.get();
        if (!owner) {
            return false;
        }

        for (let type in owner._gestureObservers) {
            let list = owner._gestureObservers[type];
            for (let i = 0; i < list.length; i++) {
                list[i].androidOnTouchEvent(event);
            }
        }

        let nativeView = owner._nativeView;
        if (!nativeView || !nativeView.onTouchEvent) {
            return false;
        }

        return nativeView.onTouchEvent(event);
    }
}

const disableUserInteractionListener = new DisableUserInteractionListener();

export class View extends ViewCommon {
    private touchListenerIsSet: boolean;
    private touchListener: android.view.View.OnTouchListener;
    private _gesturesListener: android.view.View.OnTouchListener;

    public nativeView: android.view.View;

    // TODO: Implement unobserve that detach the touchListener.
    observe(type: GestureTypes, callback: (args: GestureEventData) => void, thisArg?: any): void {
        super.observe(type, callback, thisArg);
        if (this.isLoaded && !this.touchListenerIsSet) {
            this.setOnTouchListener();
        }
    }

    public onLoaded() {
        super.onLoaded();
        this.setOnTouchListener();
    }

    public onUnloaded() {
        if (this.touchListenerIsSet) {
            this._nativeView.setOnTouchListener(null);
            this.touchListenerIsSet = false;
        }

        this._cancelAllAnimations();
        super.onUnloaded();
    }

    private hasGestureObservers() {
        return this._gestureObservers && Object.keys(this._gestureObservers).length > 0
    }

    private setOnTouchListener() {
        if (this._nativeView && this.hasGestureObservers()) {
            this.touchListenerIsSet = true;
            if (this._nativeView.setClickable) {
                this._nativeView.setClickable(true);
            }

            this.touchListener = this.touchListener || new TouchListener(new WeakRef(this));
            this._nativeView.setOnTouchListener(this.touchListener);
        }
    }

    public _addViewCore(view: ViewCommon, atIndex?: number) {
        if (this._context) {
            view._onAttached(this._context);
        }

        super._addViewCore(view, atIndex);
    }

    public _removeViewCore(view: ViewCommon) {
        super._removeViewCore(view);
        if (view._context) {
            view._onDetached();
        }
    }

    public _onAttached(context: android.content.Context) {
        if (!context) {
            throw new Error("Expected valid android.content.Context instance.");
        }

        if (traceEnabled) {
            traceWrite(`${this}._onAttached(context)`, traceCategories.VisualTreeEvents);
        }

        if (this._context === context) {
            return;
        }

        if (this._context) {
            this._onDetached(true);
        }

        this._context = context;
        this._onContextChanged();

        if (traceEnabled) {
            traceNotifyEvent(this, "_onAttached");
        }

        if (this._childrenCount > 0) {
            // Notify each child for the _onAttached event
            let that = this;
            // TODO: This should be done in a call 
            let eachChild = (child: View): boolean => {
                child._onAttached(context);
                if (!child._isAddedToNativeVisualTree) {
                    // since we have lazy loading of the android widgets, we need to add the native instances at this point.
                    child._isAddedToNativeVisualTree = that._addViewToNativeVisualTree(child);
                }

                // copy all the locally cached values to the native android widget
                applyNativeSetters(child);
                return true;
            }
            this._eachChildView(eachChild);
        } else if (this._nativeView && !this.parent) {
            // copy all the locally cached values to the native android widget
            applyNativeSetters(this);
        }
    }

    public _onDetached(force?: boolean) {
        if (traceEnabled) {
            traceWrite(`${this}._onDetached(force)`, traceCategories.VisualTreeEvents);
        }

        if (this._childrenCount > 0) {
            // Detach children first
            let that = this;
            let eachChild = function (child: View): boolean {
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
        if (traceEnabled) {
            traceNotifyEvent(this, "_onDetached");
        }
    }

    // TODO: revise this method
    public _clearAndroidReference() {

        // Widgets like buttons and such have reference to their native view in both properties.
        if (this[NATIVE_VIEW] === this[ANDROID]) {
            (<any>this)[NATIVE_VIEW] = undefined;
        }

        // Handle layout and content view
        if (this[VIEW_GROUP] === this[ANDROID]) {
            this[VIEW_GROUP] = undefined;
        }

        this[ANDROID] = undefined;
    }

    public _onContextChanged() {
        if (traceEnabled) {
            traceWrite(`${this}._onContextChanged`, traceCategories.VisualTreeEvents);
        }
        this._createUI();
        // Ensure layout params
        if (this._nativeView && !this._nativeView.getLayoutParams()) {
            this._nativeView.setLayoutParams(new org.nativescript.widgets.CommonLayoutParams());
        }

        this.nativeView = this._nativeView;

        if (traceEnabled) {
            traceNotifyEvent(this, "_onContextChanged");
        }
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
        let view = this._nativeView;
        if (view) {
            view.measure(widthMeasureSpec, heightMeasureSpec);
            this.setMeasuredDimension(view.getMeasuredWidth(), view.getMeasuredHeight());
        }
    }

    public onLayout(left: number, top: number, right: number, bottom: number): void {
        let view = this._nativeView;
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

    public getLocationInWindow(): Point {
        if (!this._nativeView || !this._nativeView.getWindowToken()) {
            return undefined;
        }

        let nativeArray = (<any>Array).create("int", 2);
        this._nativeView.getLocationInWindow(nativeArray);
        return {
            x: layout.toDeviceIndependentPixels(nativeArray[0]),
            y: layout.toDeviceIndependentPixels(nativeArray[1]),
        }
    }

    public getLocationOnScreen(): Point {
        if (!this._nativeView || !this._nativeView.getWindowToken()) {
            return undefined;
        }

        let nativeArray = (<any>Array).create("int", 2);
        this._nativeView.getLocationOnScreen(nativeArray);
        return {
            x: layout.toDeviceIndependentPixels(nativeArray[0]),
            y: layout.toDeviceIndependentPixels(nativeArray[1]),
        }
    }

    public getLocationRelativeTo(otherView: ViewCommon): Point {
        if (!this._nativeView || !this._nativeView.getWindowToken() ||
            !otherView._nativeView || !otherView._nativeView.getWindowToken() ||
            this._nativeView.getWindowToken() !== otherView._nativeView.getWindowToken()) {
            return undefined;
        }

        let myArray = (<any>Array).create("int", 2);
        this._nativeView.getLocationOnScreen(myArray);
        let otherArray = (<any>Array).create("int", 2);
        otherView._nativeView.getLocationOnScreen(otherArray);
        return {
            x: layout.toDeviceIndependentPixels(myArray[0] - otherArray[0]),
            y: layout.toDeviceIndependentPixels(myArray[1] - otherArray[1]),
        }
    }

    public static resolveSizeAndState(size: number, specSize: number, specMode: number, childMeasuredState: number): number {
        let result = size;
        switch (specMode) {
            case layout.UNSPECIFIED:
                result = size;
                break;

            case layout.AT_MOST:
                if (specSize < size) {
                    result = specSize | layout.MEASURED_STATE_TOO_SMALL;
                }
                break;

            case layout.EXACTLY:
                result = specSize;
                break;
        }

        return result | (childMeasuredState & layout.MEASURED_STATE_MASK);
    }

    get [isEnabledProperty.native](): boolean {
        return this.nativeView.isEnabled();
    }
    set [isEnabledProperty.native](value: boolean) {
        this.nativeView.setEnabled(value);
    }

    get [originXProperty.native](): number {
        return this.nativeView.getPivotX();
    }
    set [originXProperty.native](value: number) {
        org.nativescript.widgets.OriginPoint.setX(this.nativeView, value);
    }

    get [originYProperty.native](): number {
        return this.nativeView.getPivotY();
    }
    set [originYProperty.native](value: number) {
        org.nativescript.widgets.OriginPoint.setY(this.nativeView, value);
    }

    get [automationTextProperty.native](): string {
        return this.nativeView.getContentDescription();
    }
    set [automationTextProperty.native](value: string) {
        this.nativeView.setContentDescription(value);
    }

    get [isUserInteractionEnabledProperty.native](): boolean {
        return true;
    }
    set [isUserInteractionEnabledProperty.native](value: boolean) {
        if (!value) {
            // User interaction is disabled -- we stop it and we do not care whether someone wants to listen for gestures.
            this._nativeView.setOnTouchListener(disableUserInteractionListener);
        } else {
            this.setOnTouchListener();
        }
    }

    get [visibilityProperty.native](): Visibility {
        let nativeVisibility = this.nativeView.getVisibility();
        switch (nativeVisibility) {
            case android.view.View.VISIBLE:
                return Visibility.VISIBLE;
            case android.view.View.INVISIBLE:
                return Visibility.HIDDEN;
            case android.view.View.GONE:
                return Visibility.COLLAPSE;
            default: 
                throw new Error(`Unsupported android.view.View visibility: ${nativeVisibility}. Currently supported values are android.view.View.VISIBLE, android.view.View.INVISIBLE, android.view.View.GONE.`);
        }
    }
    set [visibilityProperty.native](value: Visibility) {
        switch (value) {
            case Visibility.VISIBLE:
                this.nativeView.setVisibility(android.view.View.VISIBLE);
                break;
            case Visibility.HIDDEN:
                this.nativeView.setVisibility(android.view.View.INVISIBLE);
                break;
            case Visibility.COLLAPSE:
                this.nativeView.setVisibility(android.view.View.GONE);
                break;
            default: 
                throw new Error(`Invalid visibility value: ${value}. Valid values are: "${Visibility.VISIBLE}", "${Visibility.HIDDEN}", "${Visibility.COLLAPSE}".`);
        }
    }

    get [opacityProperty.native](): number {
        return this.nativeView.getAlpha();
    }
    set [opacityProperty.native](value: number) {
        this.nativeView.setAlpha(value);
    }

    get [minWidthProperty.native](): Length {
        return { value: org.nativescript.widgets.ViewHelper.getMinWidth(this.nativeView), unit: "px" };
    }
    set [minWidthProperty.native](value: Length) {
        let density = value.unit === "dip" ? layout.getDisplayDensity() : 1;
        org.nativescript.widgets.ViewHelper.setMinWidth(this.nativeView, value.value * density);
    }

    get [minHeightProperty.native](): Length {
        return { value: org.nativescript.widgets.ViewHelper.getMinHeight(this.nativeView), unit: "px" };
    }
    set [minHeightProperty.native](value: Length) {
        let density = value.unit === "dip" ? layout.getDisplayDensity() : 1;
        org.nativescript.widgets.ViewHelper.setMinHeight(this.nativeView, value.value * density);
    }

    get [widthProperty.native](): PercentLength {
        return { value: org.nativescript.widgets.ViewHelper.getWidth(this.nativeView), unit: "px" };
    }
    set [widthProperty.native](value: PercentLength) {
        let type = value.unit;
        if (type === "%") {
            org.nativescript.widgets.ViewHelper.setWidthPercent(this.nativeView, value.value);
        } else if (type === "px") {
            org.nativescript.widgets.ViewHelper.setWidth(this.nativeView, value.value);
        } else {
            org.nativescript.widgets.ViewHelper.setWidth(this.nativeView, value.value * layout.getDisplayDensity());
        }
    }

    get [heightProperty.native](): PercentLength {
        return { value: org.nativescript.widgets.ViewHelper.getHeight(this.nativeView), unit: "px" };
    }
    set [heightProperty.native](value: PercentLength) {
        let type = value.unit;
        if (type === "%") {
            org.nativescript.widgets.ViewHelper.setHeightPercent(this.nativeView, value.value);
        } else if (type === "px") {
            org.nativescript.widgets.ViewHelper.setHeight(this.nativeView, value.value);
        } else {
            org.nativescript.widgets.ViewHelper.setHeight(this.nativeView, value.value * layout.getDisplayDensity());
        }
    }

    get [marginLeftProperty.native](): PercentLength {
        return { value: org.nativescript.widgets.ViewHelper.getMarginLeft(this.nativeView), unit: "px" };
    }
    set [marginLeftProperty.native](value: PercentLength) {
        let type = value.unit;
        if (type === "%") {
            org.nativescript.widgets.ViewHelper.setMarginLeftPercent(this.nativeView, value.value);
        } else if (type === "px") {
            org.nativescript.widgets.ViewHelper.setMarginLeft(this.nativeView, value.value);
        } else {
            org.nativescript.widgets.ViewHelper.setMarginLeft(this.nativeView, value.value * layout.getDisplayDensity());
        }
    }

    get [marginTopProperty.native](): PercentLength {
        return { value: org.nativescript.widgets.ViewHelper.getMarginTop(this.nativeView), unit: "px" };
    }
    set [marginTopProperty.native](value: PercentLength) {
        let type = value.unit;
        if (type === "%") {
            org.nativescript.widgets.ViewHelper.setMarginTopPercent(this.nativeView, value.value);
        } else if (type === "px") {
            org.nativescript.widgets.ViewHelper.setMarginTop(this.nativeView, value.value);
        } else {
            org.nativescript.widgets.ViewHelper.setMarginTop(this.nativeView, value.value * layout.getDisplayDensity());
        }
    }

    get [marginRightProperty.native](): PercentLength {
        return { value: org.nativescript.widgets.ViewHelper.getMarginRight(this.nativeView), unit: "px" };
    }
    set [marginRightProperty.native](value: PercentLength) {
        let type = value.unit;
        if (type === "%") {
            org.nativescript.widgets.ViewHelper.setMarginRightPercent(this.nativeView, value.value);
        } else if (type === "px") {
            org.nativescript.widgets.ViewHelper.setMarginRight(this.nativeView, value.value);
        } else {
            org.nativescript.widgets.ViewHelper.setMarginRight(this.nativeView, value.value * layout.getDisplayDensity());
        }
    }

    get [marginBottomProperty.native](): PercentLength {
        return { value: org.nativescript.widgets.ViewHelper.getMarginBottom(this.nativeView), unit: "px" };
    }
    set [marginBottomProperty.native](value: PercentLength) {
        let type = value.unit;
        if (type === "%") {
            org.nativescript.widgets.ViewHelper.setMarginBottomPercent(this.nativeView, value.value);
        } else if (type === "px") {
            org.nativescript.widgets.ViewHelper.setMarginBottom(this.nativeView, value.value);
        } else {
            org.nativescript.widgets.ViewHelper.setMarginBottom(this.nativeView, value.value * layout.getDisplayDensity());
        }
    }

    get [horizontalAlignmentProperty.native](): HorizontalAlignment {
        return <HorizontalAlignment>org.nativescript.widgets.ViewHelper.getHorizontalAlignment(this.nativeView);
    }
    set [horizontalAlignmentProperty.native](value: HorizontalAlignment) {
        org.nativescript.widgets.ViewHelper.setHorizontalAlignment(this.nativeView, value);
    }

    get [verticalAlignmentProperty.native](): VerticalAlignment {
        return <VerticalAlignment>org.nativescript.widgets.ViewHelper.getVerticalAlignment(this.nativeView);
    }
    set [verticalAlignmentProperty.native](value: VerticalAlignment) {
        org.nativescript.widgets.ViewHelper.setVerticalAlignment(this.nativeView, value);
    }

    get [rotateProperty.native](): number {
        return org.nativescript.widgets.ViewHelper.getRotate(this.nativeView);
    }
    set [rotateProperty.native](value: number) {
        org.nativescript.widgets.ViewHelper.setRotate(this.nativeView, float(value));
    }

    get [scaleXProperty.native](): number {
        return org.nativescript.widgets.ViewHelper.getScaleX(this.nativeView);
    }
    set [scaleXProperty.native](value: number) {
        org.nativescript.widgets.ViewHelper.setScaleX(this.nativeView, float(value));
    }

    get [scaleYProperty.native](): number {
        return org.nativescript.widgets.ViewHelper.getScaleY(this.nativeView);
    }
    set [scaleYProperty.native](value: number) {
        org.nativescript.widgets.ViewHelper.setScaleY(this.nativeView, float(value));
    }

    get [translateXProperty.native](): number {
        return org.nativescript.widgets.ViewHelper.getTranslateX(this.nativeView);
    }
    set [translateXProperty.native](value: number) {
        org.nativescript.widgets.ViewHelper.setTranslateX(this.nativeView, float(value));
    }

    get [translateYProperty.native](): number {
        return org.nativescript.widgets.ViewHelper.getTranslateY(this.nativeView);
    }
    set [translateYProperty.native](value: number) {
        org.nativescript.widgets.ViewHelper.setTranslateY(this.nativeView, float(value));
    }

    get [zIndexProperty.native](): number {
        return org.nativescript.widgets.ViewHelper.getZIndex(this.nativeView);
    }
    set [zIndexProperty.native](value: number) {
        org.nativescript.widgets.ViewHelper.setZIndex(this.nativeView, value);
        // let nativeView = this.nativeView;
        // if (nativeView instanceof android.widget.Button) {
        //     nativeView.setStateListAnimator(null);
        // }
    }

    get [backgroundInternalProperty.native](): android.graphics.drawable.Drawable {
        return this.nativeView.getBackground();
    }
    set [backgroundInternalProperty.native](value: android.graphics.drawable.Drawable | Background) {
        if (value instanceof android.graphics.drawable.Drawable) {
            this.nativeView.setBackground(value);
        } else {
            androidBackground.onBackgroundOrBorderPropertyChanged(this);
        }
    }
}

type NativeSetter = { (view: android.view.View, value: number): void };
type NativeGetter = { (view: android.view.View): number };
const percentNotSupported = (view: android.view.View, value: number) => { throw new Error("PercentLength is not supported."); };
interface NativePercentLengthPropertyOptions {
    key: string | symbol;
    auto?: number;
    getPixels: NativeGetter;
    setPixels: NativeSetter;
    setPercent?: NativeSetter
}
function createNativePercentLengthProperty({key, auto = 0, getPixels, setPixels, setPercent = percentNotSupported}: NativePercentLengthPropertyOptions) {
    Object.defineProperty(View, key, {
        get: function (this: View) { return { value: getPixels(this.nativeView), unit: "px" } },
        set: function (this: View, length: PercentLength) {
            if (length == "auto") {
                setPixels(this.nativeView, auto);
            } else if (typeof length === "number") {
                setPixels(this.nativeView, length * layout.getDisplayDensity());
            } else if (length.unit == "dip") {
                setPixels(this.nativeView, length.value * layout.getDisplayDensity());
            } else if (length.unit == "px") {
                setPixels(this.nativeView, length.value);
            } else if (length.unit == "%") {
                setPercent(this.nativeView, length.value);
            } else {
                throw new Error(`Unsupported PercentLength ${length}`);
            }
        }
    });
}

const ViewHelper = org.nativescript.widgets.ViewHelper;

createNativePercentLengthProperty({
    key: marginTopProperty.native,
    getPixels: ViewHelper.getMarginTop,
    setPixels: ViewHelper.setMarginTop,
    setPercent: ViewHelper.setMarginTopPercent
});

createNativePercentLengthProperty({
    key: marginRightProperty.native,
    getPixels: ViewHelper.getMarginRight,
    setPixels: ViewHelper.setMarginRight,
    setPercent: ViewHelper.setMarginRightPercent
});

createNativePercentLengthProperty({
    key: marginBottomProperty.native,
    getPixels: ViewHelper.getMarginBottom,
    setPixels: ViewHelper.setMarginBottom,
    setPercent: ViewHelper.setMarginBottomPercent
});

createNativePercentLengthProperty({
    key: marginLeftProperty.native,
    getPixels: ViewHelper.getMarginLeft,
    setPixels: ViewHelper.setMarginLeft,
    setPercent: ViewHelper.setMarginLeftPercent
});

createNativePercentLengthProperty({
    key: paddingTopProperty.native,
    getPixels: ViewHelper.getPaddingTop,
    setPixels: ViewHelper.setPaddingTop
});

createNativePercentLengthProperty({
    key: paddingRightProperty.native,
    getPixels: ViewHelper.getPaddingRight,
    setPixels: ViewHelper.setPaddingRight
});

createNativePercentLengthProperty({
    key: paddingBottomProperty.native,
    getPixels: ViewHelper.getPaddingBottom,
    setPixels: ViewHelper.setPaddingBottom
});

createNativePercentLengthProperty({
    key: paddingLeftProperty.native,
    getPixels: ViewHelper.getPaddingLeft,
    setPixels: ViewHelper.setPaddingLeft
});

createNativePercentLengthProperty({
    key: widthProperty.native,
    auto: android.view.ViewGroup.LayoutParams.MATCH_PARENT,
    getPixels: ViewHelper.getWidth,
    setPixels: ViewHelper.setWidth,
    setPercent: ViewHelper.setWidthPercent
});

createNativePercentLengthProperty({
    key: heightProperty.native,
    auto: android.view.ViewGroup.LayoutParams.MATCH_PARENT,
    getPixels: ViewHelper.getHeight,
    setPixels: ViewHelper.setHeight,
    setPercent: ViewHelper.setHeightPercent
});

createNativePercentLengthProperty({
    key: minWidthProperty.native,
    getPixels: ViewHelper.getMinWidth,
    setPixels: ViewHelper.setMinWidth
});

createNativePercentLengthProperty({
    key: minHeightProperty.native,
    getPixels: ViewHelper.getMinHeight,
    setPixels: ViewHelper.setMinHeight
});

export class CustomLayoutView extends View implements CustomLayoutViewDefinition {
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

    public _addViewToNativeVisualTree(child: ViewCommon, atIndex: number = -1): boolean {
        super._addViewToNativeVisualTree(child);

        if (this._nativeView && child.nativeView) {
            if (traceEnabled) {
                traceWrite(`${this}.nativeView.addView(${child}.nativeView, ${atIndex})`, traceCategories.VisualTreeEvents);
            }
            this._nativeView.addView(child.nativeView, atIndex);
            return true;
        }

        return false;
    }

    public _removeViewFromNativeVisualTree(child: ViewCommon): void {
        super._removeViewFromNativeVisualTree(child);

        if (this._nativeView && child._nativeView) {
            this._nativeView.removeView(child._nativeView);
            if (traceEnabled) {
                traceWrite(`${this}._nativeView.removeView(${child}._nativeView)`, traceCategories.VisualTreeEvents);
                traceNotifyEvent(child, "childInLayoutRemovedFromNativeVisualTree");
            }
        }
    }
}