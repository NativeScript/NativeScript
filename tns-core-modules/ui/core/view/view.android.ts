// Definitions.
import { Point, CustomLayoutView as CustomLayoutViewDefinition, dip } from ".";
import { GestureTypes, GestureEventData } from "../../gestures";

// Types.
import { Background, ad as androidBackground } from "../../styling/background";
import {
    ViewCommon, layout, isEnabledProperty, originXProperty, originYProperty, automationTextProperty, isUserInteractionEnabledProperty,
    traceEnabled, traceWrite, traceCategories, traceNotifyEvent
} from "./view-common";

import {
    Length, PercentLength, Visibility, HorizontalAlignment, VerticalAlignment,
    visibilityProperty, opacityProperty, horizontalAlignmentProperty, verticalAlignmentProperty,
    minWidthProperty, minHeightProperty, widthProperty, heightProperty,
    marginLeftProperty, marginTopProperty, marginRightProperty, marginBottomProperty,
    rotateProperty, scaleXProperty, scaleYProperty, translateXProperty, translateYProperty,
    zIndexProperty, backgroundInternalProperty
} from "../../styling/style-properties";
import { profile } from "../../../profiling";

export * from "./view-common";

interface TouchListener {
    new (owner: View): android.view.View.OnTouchListener;
}

let TouchListener: TouchListener;
let disableUserInteractionListener: org.nativescript.widgets.DisableUserInteractionListener;

function initializeDisabledListener(): void {
    if (disableUserInteractionListener) {
        return;
    }

    disableUserInteractionListener = new org.nativescript.widgets.DisableUserInteractionListener();
}

function initializeTouchListener(): void {
    if (TouchListener) {
        return;
    }

    @Interfaces([android.view.View.OnTouchListener])
    class TouchListenerImpl extends java.lang.Object implements android.view.View.OnTouchListener {
        constructor(private owner: View) {
            super();
            return global.__native(this);
        }

        onTouch(view: android.view.View, event: android.view.MotionEvent): boolean {
            const owner = this.owner;
            for (let type in owner._gestureObservers) {
                let list = owner._gestureObservers[type];
                list.forEach(element => {
                    element.androidOnTouchEvent(event);
                });
            }

            let nativeView = owner.nativeView;
            if (!nativeView || !nativeView.onTouchEvent) {
                return false;
            }

            return nativeView.onTouchEvent(event);
        }
    }

    TouchListener = TouchListenerImpl;
}

export class View extends ViewCommon {
    private touchListenerIsSet: boolean;
    private touchListener: android.view.View.OnTouchListener;

    nativeView: android.view.View;

    // TODO: Implement unobserve that detach the touchListener.
    observe(type: GestureTypes, callback: (args: GestureEventData) => void, thisArg?: any): void {
        super.observe(type, callback, thisArg);
        if (this.isLoaded && !this.touchListenerIsSet) {
            this.setOnTouchListener();
        }
    }

    @profile
    public onLoaded() {
        super.onLoaded();
        this.setOnTouchListener();
    }

    @profile
    public onUnloaded() {
        if (this.touchListenerIsSet) {
            this.nativeView.setOnTouchListener(null);
            this.touchListenerIsSet = false;
        }

        this._cancelAllAnimations();
        super.onUnloaded();
    }

    private hasGestureObservers() {
        return this._gestureObservers && Object.keys(this._gestureObservers).length > 0
    }

    private setOnTouchListener() {
        if (this.nativeView && this.hasGestureObservers()) {
            this.touchListenerIsSet = true;
            if (this.nativeView.setClickable) {
                this.nativeView.setClickable(true);
            }

            initializeTouchListener();
            this.touchListener = this.touchListener || new TouchListener(this);
            this.nativeView.setOnTouchListener(this.touchListener);
        }
    }

    get isLayoutRequired(): boolean {
        return !this.isLayoutValid;
    }

    get isLayoutValid(): boolean {
        if (this.nativeView) {
            return !this.nativeView.isLayoutRequested();
        }

        return false;
    }

    public layoutNativeView(left: number, top: number, right: number, bottom: number): void {
        if (this.nativeView) {
            this.nativeView.layout(left, top, right, bottom);
        }
    }

    @profile
    public requestLayout(): void {
        super.requestLayout();
        if (this.nativeView) {
            return this.nativeView.requestLayout();
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
        let view = this.nativeView;
        if (view) {
            view.measure(widthMeasureSpec, heightMeasureSpec);
            this.setMeasuredDimension(view.getMeasuredWidth(), view.getMeasuredHeight());
        }
    }

    public onLayout(left: number, top: number, right: number, bottom: number): void {
        let view = this.nativeView;
        if (view) {
            this.layoutNativeView(left, top, right, bottom);
        }
    }

    _getCurrentLayoutBounds(): { left: number; top: number; right: number; bottom: number } {
        if (this.nativeView && !this.isCollapsed) {
            return {
                left: this.nativeView.getLeft(),
                top: this.nativeView.getTop(),
                right: this.nativeView.getRight(),
                bottom: this.nativeView.getBottom()
            };
        } else {
            return { left: 0, top: 0, right: 0, bottom: 0 };
        }
    }

    public getMeasuredWidth(): number {
        if (this.nativeView) {
            return this.nativeView.getMeasuredWidth();
        }

        return super.getMeasuredWidth();
    }

    public getMeasuredHeight(): number {
        if (this.nativeView) {
            return this.nativeView.getMeasuredHeight();
        }

        return super.getMeasuredHeight();
    }

    public focus(): boolean {
        if (this.nativeView) {
            return this.nativeView.requestFocus();
        }

        return false;
    }

    public getLocationInWindow(): Point {
        if (!this.nativeView || !this.nativeView.getWindowToken()) {
            return undefined;
        }

        let nativeArray = (<any>Array).create("int", 2);
        this.nativeView.getLocationInWindow(nativeArray);
        return {
            x: layout.toDeviceIndependentPixels(nativeArray[0]),
            y: layout.toDeviceIndependentPixels(nativeArray[1]),
        }
    }

    public getLocationOnScreen(): Point {
        if (!this.nativeView || !this.nativeView.getWindowToken()) {
            return undefined;
        }

        let nativeArray = (<any>Array).create("int", 2);
        this.nativeView.getLocationOnScreen(nativeArray);
        return {
            x: layout.toDeviceIndependentPixels(nativeArray[0]),
            y: layout.toDeviceIndependentPixels(nativeArray[1]),
        }
    }

    public getLocationRelativeTo(otherView: ViewCommon): Point {
        if (!this.nativeView || !this.nativeView.getWindowToken() ||
            !otherView.nativeView || !otherView.nativeView.getWindowToken() ||
            this.nativeView.getWindowToken() !== otherView.nativeView.getWindowToken()) {
            return undefined;
        }

        let myArray = (<any>Array).create("int", 2);
        this.nativeView.getLocationOnScreen(myArray);
        let otherArray = (<any>Array).create("int", 2);
        otherView.nativeView.getLocationOnScreen(otherArray);
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

    [isEnabledProperty.getDefault](): boolean {
        return this.nativeView.isEnabled();
    }
    [isEnabledProperty.setNative](value: boolean) {
        this.nativeView.setEnabled(value);
    }

    [originXProperty.getDefault](): number {
        return this.nativeView.getPivotX();
    }
    [originXProperty.setNative](value: number) {
        org.nativescript.widgets.OriginPoint.setX(this.nativeView, value);
    }

    [originYProperty.getDefault](): number {
        return this.nativeView.getPivotY();
    }
    [originYProperty.setNative](value: number) {
        org.nativescript.widgets.OriginPoint.setY(this.nativeView, value);
    }

    [automationTextProperty.getDefault](): string {
        return this.nativeView.getContentDescription();
    }
    [automationTextProperty.setNative](value: string) {
        this.nativeView.setContentDescription(value);
    }

    [isUserInteractionEnabledProperty.getDefault](): boolean {
        return true;
    }
    [isUserInteractionEnabledProperty.setNative](value: boolean) {
        if (!value) {
            initializeDisabledListener();
            // User interaction is disabled -- we stop it and we do not care whether someone wants to listen for gestures.
            this.nativeView.setOnTouchListener(disableUserInteractionListener);
        } else {
            this.setOnTouchListener();
        }
    }

    [visibilityProperty.getDefault](): Visibility {
        let nativeVisibility = this.nativeView.getVisibility();
        switch (nativeVisibility) {
            case android.view.View.VISIBLE:
                return "visible";
            case android.view.View.INVISIBLE:
                return "hidden";
            case android.view.View.GONE:
                return "collapse";
            default:
                throw new Error(`Unsupported android.view.View visibility: ${nativeVisibility}. Currently supported values are android.view.View.VISIBLE, android.view.View.INVISIBLE, android.view.View.GONE.`);
        }
    }
    [visibilityProperty.setNative](value: Visibility) {
        switch (value) {
            case "visible":
                this.nativeView.setVisibility(android.view.View.VISIBLE);
                break;
            case "hidden":
                this.nativeView.setVisibility(android.view.View.INVISIBLE);
                break;
            case "collapse":
                this.nativeView.setVisibility(android.view.View.GONE);
                break;
            default:
                throw new Error(`Invalid visibility value: ${value}. Valid values are: visible, hidden, collapse.`);
        }
    }

    [opacityProperty.getDefault](): number {
        return this.nativeView.getAlpha();
    }
    [opacityProperty.setNative](value: number) {
        this.nativeView.setAlpha(float(value));
    }

    [horizontalAlignmentProperty.getDefault](): HorizontalAlignment {
        return <HorizontalAlignment>org.nativescript.widgets.ViewHelper.getHorizontalAlignment(this.nativeView);
    }
    [horizontalAlignmentProperty.setNative](value: HorizontalAlignment) {
        const nativeView = this.nativeView;
        const lp: any = nativeView.getLayoutParams() || new org.nativescript.widgets.CommonLayoutParams();
        // Set only if params gravity exists.
        if (lp.gravity !== undefined) {
            switch (value) {
                case "left":
                    lp.gravity = android.view.Gravity.LEFT | (lp.gravity & android.view.Gravity.VERTICAL_GRAVITY_MASK);
                    break;
                case "center":
                    lp.gravity = android.view.Gravity.CENTER_HORIZONTAL | (lp.gravity & android.view.Gravity.VERTICAL_GRAVITY_MASK);
                    break;
                case "right":
                    lp.gravity = android.view.Gravity.RIGHT | (lp.gravity & android.view.Gravity.VERTICAL_GRAVITY_MASK);
                    break;
                case "stretch":
                    lp.gravity = android.view.Gravity.FILL_HORIZONTAL | (lp.gravity & android.view.Gravity.VERTICAL_GRAVITY_MASK);
                    break;
            }
            nativeView.setLayoutParams(lp);
        }
    }

    [verticalAlignmentProperty.getDefault](): VerticalAlignment {
        return <VerticalAlignment>org.nativescript.widgets.ViewHelper.getVerticalAlignment(this.nativeView);
    }
    [verticalAlignmentProperty.setNative](value: VerticalAlignment) {
        const nativeView = this.nativeView;
        const lp: any = nativeView.getLayoutParams() || new org.nativescript.widgets.CommonLayoutParams();
        // Set only if params gravity exists.
        if (lp.gravity !== undefined) {
            switch (value) {
                case "top":
                    lp.gravity = android.view.Gravity.TOP | (lp.gravity & android.view.Gravity.HORIZONTAL_GRAVITY_MASK);
                    break;
                case "middle":
                    lp.gravity = android.view.Gravity.CENTER_VERTICAL | (lp.gravity & android.view.Gravity.HORIZONTAL_GRAVITY_MASK);
                    break;
                case "bottom":
                    lp.gravity = android.view.Gravity.BOTTOM | (lp.gravity & android.view.Gravity.HORIZONTAL_GRAVITY_MASK);
                    break;
                case "stretch":
                    lp.gravity = android.view.Gravity.FILL_VERTICAL | (lp.gravity & android.view.Gravity.HORIZONTAL_GRAVITY_MASK);
                    break;
            }
            nativeView.setLayoutParams(lp);
        }
    }

    [rotateProperty.setNative](value: number) {
        org.nativescript.widgets.ViewHelper.setRotate(this.nativeView, float(value));
    }

    [scaleXProperty.setNative](value: number) {
        org.nativescript.widgets.ViewHelper.setScaleX(this.nativeView, float(value));
    }

    [scaleYProperty.setNative](value: number) {
        org.nativescript.widgets.ViewHelper.setScaleY(this.nativeView, float(value));
    }

    [translateXProperty.setNative](value: dip) {
        org.nativescript.widgets.ViewHelper.setTranslateX(this.nativeView, layout.toDevicePixels(value));
    }

    [translateYProperty.setNative](value: dip) {
        org.nativescript.widgets.ViewHelper.setTranslateY(this.nativeView, layout.toDevicePixels(value));
    }

    [zIndexProperty.getDefault](): number {
        return org.nativescript.widgets.ViewHelper.getZIndex(this.nativeView);
    }
    [zIndexProperty.setNative](value: number) {
        org.nativescript.widgets.ViewHelper.setZIndex(this.nativeView, value);
    }

    [backgroundInternalProperty.getDefault](): android.graphics.drawable.Drawable {
        return this.nativeView.getBackground();
    }
    [backgroundInternalProperty.setNative](value: android.graphics.drawable.Drawable | Background) {
        this._redrawNativeBackground(value);
    }

    [minWidthProperty.setNative](value: Length) {
        if (this.parent instanceof CustomLayoutView && this.parent.nativeView) {
            this.parent._setChildMinWidthNative(this);
        } else {
            this._setMinWidthNative(this.minWidth);
        }
    }

    [minHeightProperty.setNative](value: Length) {
        if (this.parent instanceof CustomLayoutView && this.parent.nativeView) {
            this.parent._setChildMinHeightNative(this);
        } else {
            this._setMinHeightNative(this.minHeight);
        }
    }

    _redrawNativeBackground(value: android.graphics.drawable.Drawable | Background): void {
        if (value instanceof android.graphics.drawable.Drawable) {
            this.nativeView.setBackground(value);
        } else {
            androidBackground.onBackgroundOrBorderPropertyChanged(this);
        }
    }
}

export class CustomLayoutView extends View implements CustomLayoutViewDefinition {
    nativeView: android.view.ViewGroup;

    public createNativeView() {
        return new org.nativescript.widgets.ContentLayout(this._context);
    }

    public _addViewToNativeVisualTree(child: ViewCommon, atIndex: number = -1): boolean {
        super._addViewToNativeVisualTree(child);

        if (this.nativeView && child.nativeView) {
            if (traceEnabled()) {
                traceWrite(`${this}.nativeView.addView(${child}.nativeView, ${atIndex})`, traceCategories.VisualTreeEvents);
            }
            this.nativeView.addView(child.nativeView, atIndex);
            if (child instanceof View) {
                this._updateNativeLayoutParams(child);
            }
            return true;
        }

        return false;
    }

    public _updateNativeLayoutParams(child: View): void {
        this._setChildMinWidthNative(child);
        this._setChildMinHeightNative(child);
    }

    public _setChildMinWidthNative(child: View): void {
        child._setMinWidthNative(child.minWidth);
    }

    public _setChildMinHeightNative(child: View): void {
        child._setMinHeightNative(child.minHeight);
    }

    public _removeViewFromNativeVisualTree(child: ViewCommon): void {
        super._removeViewFromNativeVisualTree(child);

        if (this.nativeView && child.nativeView) {
            this.nativeView.removeView(child.nativeView);
            if (traceEnabled()) {
                traceWrite(`${this}.nativeView.removeView(${child}.nativeView)`, traceCategories.VisualTreeEvents);
                traceNotifyEvent(child, "childInLayoutRemovedFromNativeVisualTree");
            }
        }
    }
}

type NativeSetter = { (view: android.view.View, value: number): void };
type NativeGetter = { (view: android.view.View): number };
const percentNotSupported = (view: android.view.View, value: number) => { throw new Error("PercentLength is not supported."); };
interface NativePercentLengthPropertyOptions {
    getter?: string | symbol;
    setter: string | symbol;
    auto?: number;
    getPixels?: NativeGetter;
    setPixels: NativeSetter;
    setPercent?: NativeSetter
}

function createNativePercentLengthProperty(options: NativePercentLengthPropertyOptions) {
    const { getter, setter, auto = 0 } = options;
    let setPixels, getPixels, setPercent;
    if (getter) {
        View.prototype[getter] = function(this: View): PercentLength {
            if (options) {
                setPixels = options.setPixels;
                getPixels = options.getPixels;
                setPercent = options.setPercent || percentNotSupported;
                options = null;
            }
            const value = getPixels(this.nativeView);
            if (value == auto) { // tslint:disable-line
                return "auto";
            } else {
                return { value, unit: "px" };
            }
        }
    }
    if (setter) {
        View.prototype[setter] = function(this: View, length: PercentLength) {
            if (options) {
                setPixels = options.setPixels;
                getPixels = options.getPixels;
                setPercent = options.setPercent || percentNotSupported;
                options = null;
            }
            if (length == "auto") { // tslint:disable-line
                setPixels(this.nativeView, auto);
            } else if (typeof length === "number") {
                setPixels(this.nativeView, layout.round(layout.toDevicePixels(length)));
            } else if (length.unit == "dip") { // tslint:disable-line
                setPixels(this.nativeView, layout.round(layout.toDevicePixels(length.value)));
            } else if (length.unit == "px") { // tslint:disable-line
                setPixels(this.nativeView, layout.round(length.value));
            } else if (length.unit == "%") { // tslint:disable-line
                setPercent(this.nativeView, length.value);
            } else {
                throw new Error(`Unsupported PercentLength ${length}`);
            }
        }
    }
}

createNativePercentLengthProperty({
    getter: marginTopProperty.getDefault,
    setter: marginTopProperty.setNative,
    get getPixels() { return org.nativescript.widgets.ViewHelper.getMarginTop },
    get setPixels() { return org.nativescript.widgets.ViewHelper.setMarginTop },
    get setPercent() { return org.nativescript.widgets.ViewHelper.setMarginTopPercent }
});

createNativePercentLengthProperty({
    getter: marginRightProperty.getDefault,
    setter: marginRightProperty.setNative,
    get getPixels() { return org.nativescript.widgets.ViewHelper.getMarginRight },
    get setPixels() { return org.nativescript.widgets.ViewHelper.setMarginRight },
    get setPercent() { return org.nativescript.widgets.ViewHelper.setMarginRightPercent }
});

createNativePercentLengthProperty({
    getter: marginBottomProperty.getDefault,
    setter: marginBottomProperty.setNative,
    get getPixels() { return org.nativescript.widgets.ViewHelper.getMarginBottom },
    get setPixels() { return org.nativescript.widgets.ViewHelper.setMarginBottom },
    get setPercent() { return org.nativescript.widgets.ViewHelper.setMarginBottomPercent }
});

createNativePercentLengthProperty({
    getter: marginLeftProperty.getDefault,
    setter: marginLeftProperty.setNative,
    get getPixels() { return org.nativescript.widgets.ViewHelper.getMarginLeft },
    get setPixels() { return org.nativescript.widgets.ViewHelper.setMarginLeft },
    get setPercent() { return org.nativescript.widgets.ViewHelper.setMarginLeftPercent }
});

createNativePercentLengthProperty({
    getter: widthProperty.getDefault,
    setter: widthProperty.setNative,
    auto: -1, //android.view.ViewGroup.LayoutParams.MATCH_PARENT,
    get getPixels() { return org.nativescript.widgets.ViewHelper.getWidth },
    get setPixels() { return org.nativescript.widgets.ViewHelper.setWidth },
    get setPercent() { return org.nativescript.widgets.ViewHelper.setWidthPercent }
});

createNativePercentLengthProperty({
    getter: heightProperty.getDefault,
    setter: heightProperty.setNative,
    auto: -1, //android.view.ViewGroup.LayoutParams.MATCH_PARENT,
    get getPixels() { return org.nativescript.widgets.ViewHelper.getHeight },
    get setPixels() { return org.nativescript.widgets.ViewHelper.setHeight },
    get setPercent() { return org.nativescript.widgets.ViewHelper.setHeightPercent }
});

createNativePercentLengthProperty({
    setter: "_setMinWidthNative",
    get setPixels() { return org.nativescript.widgets.ViewHelper.setMinWidth }
});

createNativePercentLengthProperty({
    setter: "_setMinHeightNative",
    get setPixels() { return org.nativescript.widgets.ViewHelper.setMinHeight }
});
