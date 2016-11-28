import { View as ViewDefinition, Point, Size } from "ui/core/view";
import { Style } from "ui/styling/style";
import { CssState, StyleScope, applyInlineSyle } from "ui/styling/style-scope";
import { Color } from "color";
import { Animation, AnimationPromise } from "ui/animation";
import { KeyframeAnimation } from "ui/animation/keyframe-animation";
import { Source } from "utils/debug";
import { Observable, EventData } from "data/observable";
import { Background } from "ui/styling/background";
import { ViewBase, getEventOrGestureName } from "./view-base";
import { propagateInheritedProperties, clearInheritedProperties, Property, InheritedProperty, CssProperty, ShorthandProperty, InheritedCssProperty } from "./properties";
import { observe, fromString as gestureFromString, GesturesObserver, GestureTypes, GestureEventData } from "ui/gestures";
import { isIOS } from "platform";
import { Font } from "ui/styling/font";

// TODO: Remove this and start using string as source (for android).
import { fromFileOrResource, fromBase64, fromUrl } from "image-source";

import { enabled as traceEnabled, write as traceWrite, categories as traceCategories } from "trace";
import { isDataURI, isFileOrResourcePath } from "utils/utils";
export * from "./view-base";

// registerSpecialProperty("class", (instance: ViewDefinition, propertyValue: string) => {
//     instance.className = propertyValue;
// });
// registerSpecialProperty("text", (instance, propertyValue) => {
//     instance.set("text", propertyValue);
// });

declare module "ui/styling/style" {
    interface Style {
        effectiveMinWidth: number;
        effectiveMinHeight: number;
        effectiveWidth: number;
        effectiveHeight: number;
        effectiveMarginTop: number;
        effectiveMarginRight: number;
        effectiveMarginBottom: number;
        effectiveMarginLeft: number;
        effectivePaddingTop: number;
        effectivePaddingRight: number;
        effectivePaddingBottom: number;
        effectivePaddingLeft: number;
        effectiveBorderTopWidth: number;
        effectiveBorderRightWidth: number;
        effectiveBorderBottomWidth: number;
        effectiveBorderLeftWidth: number;
    }
}

export namespace layout {
    const MODE_SHIFT = 30;
    const MODE_MASK = 0x3 << MODE_SHIFT;

    export const UNSPECIFIED = 0 << MODE_SHIFT;
    export const EXACTLY = 1 << MODE_SHIFT;
    export const AT_MOST = 2 << MODE_SHIFT;

    export const MEASURED_HEIGHT_STATE_SHIFT = 0x00000010; /* 16 */
    export const MEASURED_STATE_TOO_SMALL = 0x01000000;
    export const MEASURED_STATE_MASK = 0xff000000;
    export const MEASURED_SIZE_MASK = 0x00ffffff;

    export function getMeasureSpecMode(spec: number): number {
        return (spec & MODE_MASK);
    }

    export function getMeasureSpecSize(spec: number): number {
        return (spec & ~MODE_MASK);
    }

    export function getDisplayDensity(): number {
        return 1;
    }

    export function makeMeasureSpec(size: number, mode: number): number {
        return (Math.round(size) & ~MODE_MASK) | (mode & MODE_MASK);
    }

    export function toDevicePixels(value: number): number {
        return value * getDisplayDensity();
    }

    export function toDeviceIndependentPixels(value: number): number {
        return value / getDisplayDensity();
    }

    export function measureSpecToString(measureSpec: number): string {
        let mode = getMeasureSpecMode(measureSpec);
        let size = getMeasureSpecSize(measureSpec);

        let text = "MeasureSpec: ";

        if (mode === UNSPECIFIED) {
            text += "UNSPECIFIED ";
        }
        else if (mode === EXACTLY) {
            text += "EXACTLY ";
        }
        else if (mode === AT_MOST) {
            text += "AT_MOST ";
        }
        else {
            text += mode + " ";
        }

        text += size;
        return text;
    }
}

export function getViewById(view: ViewDefinition, id: string): ViewDefinition {
    if (!view) {
        return undefined;
    }

    if (view.id === id) {
        return view;
    }

    let retVal: ViewDefinition;
    let descendantsCallback = function (child: ViewDefinition): boolean {
        if (child.id === id) {
            retVal = child;
            // break the iteration by returning false
            return false;
        }

        return true;
    }

    eachDescendant(view, descendantsCallback);
    return retVal;
}

export function eachDescendant(view: ViewDefinition, callback: (child: ViewDefinition) => boolean) {
    if (!callback || !view) {
        return;
    }

    let continueIteration: boolean;
    let localCallback = function (child: ViewDefinition): boolean {
        continueIteration = callback(child);
        if (continueIteration) {
            child._eachChildView(localCallback);
        }
        return continueIteration;
    }

    view._eachChildView(localCallback);
}

export function PseudoClassHandler(...pseudoClasses: string[]): MethodDecorator {
    let stateEventNames = pseudoClasses.map(s => ":" + s);
    let listeners = Symbol("listeners");
    return <T>(target: Object, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<T>) => {
        function update(change: number) {
            let prev = this[listeners] || 0;
            let next = prev + change;
            if (prev <= 0 && next > 0) {
                this[propertyKey](true);
            } else if (prev > 0 && next <= 0) {
                this[propertyKey](false);
            }
        }
        stateEventNames.forEach(s => target[s] = update);
    }
}

let viewIdCounter = 0;

export abstract class ViewCommon extends ViewBase implements ViewDefinition {
    public static loadedEvent = "loaded";
    public static unloadedEvent = "unloaded";

    private _measuredWidth: number;
    private _measuredHeight: number;

    _currentWidthMeasureSpec: number;
    _currentHeightMeasureSpec: number;
    private _oldLeft: number;
    private _oldTop: number;
    private _oldRight: number;
    private _oldBottom: number;

    private _parent: ViewCommon;

    private _visualState: string;
    private _isLoaded: boolean;
    private _isLayoutValid: boolean;
    private _cssType: string;

    private _updatingInheritedProperties: boolean;
    private _registeredAnimations: Array<KeyframeAnimation>;

    public _domId: number;
    public _isAddedToNativeVisualTree: boolean;
    public _gestureObservers = {};

    public cssClasses: Set<string> = new Set();
    public cssPseudoClasses: Set<string> = new Set();

    public _cssState: CssState;
    public parent: ViewCommon;

    constructor() {
        super();

        this._domId = viewIdCounter++;
        this._goToVisualState("normal");
    }

    observe(type: GestureTypes, callback: (args: GestureEventData) => void, thisArg?: any): void {
        if (!this._gestureObservers[type]) {
            this._gestureObservers[type] = [];
        }

        this._gestureObservers[type].push(observe(this, type, callback, thisArg));
    }

    public getGestureObservers(type: GestureTypes): Array<GesturesObserver> {
        return this._gestureObservers[type];
    }

    public addEventListener(arg: string | GestureTypes, callback: (data: EventData) => void, thisArg?: any) {
        if (typeof arg === "string") {
            arg = getEventOrGestureName(<string>arg);

            let gesture = gestureFromString(<string>arg);
            if (gesture && !this._isEvent(<string>arg)) {
                this.observe(gesture, callback, thisArg);
            } else {
                let events = (<string>arg).split(",");
                if (events.length > 0) {
                    for (let i = 0; i < events.length; i++) {
                        let evt = events[i].trim();
                        let gst = gestureFromString(evt);
                        if (gst && !this._isEvent(<string>arg)) {
                            this.observe(gst, callback, thisArg);
                        } else {
                            super.addEventListener(evt, callback, thisArg);
                        }
                    }
                } else {
                    super.addEventListener(<string>arg, callback, thisArg);
                }
            }
        } else if (typeof arg === "number") {
            this.observe(<GestureTypes>arg, callback, thisArg);
        }
    }

    public removeEventListener(arg: string | GestureTypes, callback?: any, thisArg?: any) {
        if (typeof arg === "string") {
            let gesture = gestureFromString(<string>arg);
            if (gesture && !this._isEvent(<string>arg)) {
                this._disconnectGestureObservers(gesture);
            } else {
                let events = (<string>arg).split(",");
                if (events.length > 0) {
                    for (let i = 0; i < events.length; i++) {
                        let evt = events[i].trim();
                        let gst = gestureFromString(evt);
                        if (gst && !this._isEvent(<string>arg)) {
                            this._disconnectGestureObservers(gst);
                        } else {
                            super.removeEventListener(evt, callback, thisArg);
                        }
                    }
                } else {
                    super.removeEventListener(<string>arg, callback, thisArg);
                }

            }
        } else if (typeof arg === "number") {
            this._disconnectGestureObservers(<GestureTypes>arg);
        }
    }

    public eachChild(callback: (child: ViewCommon) => boolean): void {
        this._eachChildView(callback);
    }

    private _isEvent(name: string): boolean {
        return this.constructor && `${name}Event` in this.constructor;
    }

    private _disconnectGestureObservers(type: GestureTypes): void {
        let observers = this.getGestureObservers(type);
        if (observers) {
            for (let i = 0; i < observers.length; i++) {
                observers[i].disconnect();
            }
        }
    }

    getViewById<T extends ViewDefinition>(id: string): T {
        return <T>getViewById(this, id);
    }

    // START Style property shortcuts
    get borderColor(): string | Color {
        return this.style.borderColor;
    }
    set borderColor(value: string | Color) {
        this.style.borderColor = value;
    }

    get borderTopColor(): Color {
        return this.style.borderTopColor;
    }
    set borderTopColor(value: Color) {
        this.style.borderTopColor = value;
    }

    get borderRightColor(): Color {
        return this.style.borderRightColor;
    }
    set borderRightColor(value: Color) {
        this.style.borderRightColor = value;
    }

    get borderBottomColor(): Color {
        return this.style.borderBottomColor;
    }
    set borderBottomColor(value: Color) {
        this.style.borderBottomColor = value;
    }

    get borderLeftColor(): Color {
        return this.style.borderLeftColor;
    }
    set borderLeftColor(value: Color) {
        this.style.borderLeftColor = value;
    }

    get borderWidth(): string | number {
        return this.style.borderWidth;
    }
    set borderWidth(value: string | number) {
        this.style.borderWidth = value;
    }

    get borderTopWidth(): Length {
        return this.style.borderTopWidth;
    }
    set borderTopWidth(value: Length) {
        this.style.borderTopWidth = value;
    }

    get borderRightWidth(): Length {
        return this.style.borderRightWidth;
    }
    set borderRightWidth(value: Length) {
        this.style.borderRightWidth = value;
    }

    get borderBottomWidth(): Length {
        return this.style.borderBottomWidth;
    }
    set borderBottomWidth(value: Length) {
        this.style.borderBottomWidth = value;
    }

    get borderLeftWidth(): Length {
        return this.style.borderLeftWidth;
    }
    set borderLeftWidth(value: Length) {
        this.style.borderLeftWidth = value;
    }

    get borderRadius(): string | number {
        return this.style.borderRadius;
    }
    set borderRadius(value: string | number) {
        this.style.borderRadius = value;
    }

    get borderTopLeftRadius(): number {
        return this.style.borderTopLeftRadius;
    }
    set borderTopLeftRadius(value: number) {
        this.style.borderTopLeftRadius = value;
    }

    get borderTopRightRadius(): number {
        return this.style.borderTopRightRadius;
    }
    set borderTopRightRadius(value: number) {
        this.style.borderTopRightRadius = value;
    }

    get borderBottomRightRadius(): number {
        return this.style.borderBottomRightRadius;
    }
    set borderBottomRightRadius(value: number) {
        this.style.borderBottomRightRadius = value;
    }

    get borderBottomLeftRadius(): number {
        return this.style.borderBottomLeftRadius;
    }
    set borderBottomLeftRadius(value: number) {
        this.style.borderBottomLeftRadius = value;
    }

    get color(): Color {
        return this.style.color;
    }
    set color(value: Color) {
        this.style.color = value;
    }

    get backgroundColor(): Color {
        return this.style.backgroundColor;
    }
    set backgroundColor(value: Color) {
        this.style.backgroundColor = value;
    }

    get backgroundImage(): string {
        return this.style.backgroundImage;
    }
    set backgroundImage(value: string) {
        this.style.backgroundImage = value;
    }

    get minWidth(): Length {
        return this.style.minWidth;
    }
    set minWidth(value: Length) {
        this.style.minWidth = value;
    }

    get minHeight(): Length {
        return this.style.minHeight;
    }
    set minHeight(value: Length) {
        this.style.minHeight = value;
    }

    get width(): Length {
        return this.style.width;
    }
    set width(value: Length) {
        this.style.width = value;
    }

    get height(): Length {
        return this.style.height;
    }
    set height(value: Length) {
        this.style.height = value;
    }

    get margin(): string {
        return this.style.margin;
    }
    set margin(value: string) {
        this.style.margin = value;
    }

    get marginLeft(): Length {
        return this.style.marginLeft;
    }
    set marginLeft(value: Length) {
        this.style.marginLeft = value;
    }

    get marginTop(): Length {
        return this.style.marginTop;
    }
    set marginTop(value: Length) {
        this.style.marginTop = value;
    }

    get marginRight(): Length {
        return this.style.marginRight;
    }
    set marginRight(value: Length) {
        this.style.marginRight = value;
    }

    get marginBottom(): Length {
        return this.style.marginBottom;
    }
    set marginBottom(value: Length) {
        this.style.marginBottom = value;
    }

    get horizontalAlignment(): "left" | "center" | "middle" | "right" | "stretch" {
        return this.style.horizontalAlignment;
    }
    set horizontalAlignment(value: "left" | "center" | "middle" | "right" | "stretch") {
        this.style.horizontalAlignment = value;
    }

    get verticalAlignment(): "top" | "center" | "middle" | "bottom" | "stretch" {
        return this.style.verticalAlignment;
    }
    set verticalAlignment(value: "top" | "center" | "middle" | "bottom" | "stretch") {
        this.style.verticalAlignment = value;
    }

    get visibility(): "visible" | "hidden" | "collapse" | "collapsed" {
        return this.style.visibility;
    }
    set visibility(value: "visible" | "hidden" | "collapse" | "collapsed") {
        this.style.visibility = value;
    }

    get opacity(): number {
        return this.style.opacity;
    }
    set opacity(value: number) {
        this.style.opacity = value;
    }

    get rotate(): number {
        return this.style.rotate;
    }
    set rotate(value: number) {
        this.style.rotate = value;
    }

    get translateX(): number {
        return this.style.translateX;
    }
    set translateX(value: number) {
        this.style.translateX = value;
    }

    get translateY(): number {
        return this.style.translateY;
    }
    set translateY(value: number) {
        this.style.translateY = value;
    }

    get scaleX(): number {
        return this.style.scaleX;
    }
    set scaleX(value: number) {
        this.style.scaleX = value;
    }

    get scaleY(): number {
        return this.style.scaleY;
    }
    set scaleY(value: number) {
        this.style.scaleY = value;
    }

    //END Style property shortcuts


    get page(): ViewDefinition {
        if (this.parent) {
            return this.parent.page;
        }

        return null;
    }

    public id: string;
    public automationText: string;
    public originX: number;
    public originY: number;
    public isEnabled: boolean;
    public isUserInteractionEnabled: boolean;
    public className: string;

    get isLayoutValid(): boolean {
        return this._isLayoutValid;
    }

    get cssType(): string {
        if (!this._cssType) {
            this._cssType = this.typeName.toLowerCase();
        }
        return this._cssType;
    }

    get isLayoutRequired(): boolean {
        return true;
    }

    get isLoaded(): boolean {
        return this._isLoaded;
    }

    public onLoaded() {
        this._isLoaded = true;
        this._loadEachChildView();
        this._applyStyleFromScope();
        this._emit("loaded");
    }

    public _loadEachChildView() {
        if (this._childrenCount > 0) {
            // iterate all children and call onLoaded on them first
            let eachChild = function (child: ViewCommon): boolean {
                child.onLoaded();
                return true;
            }
            this._eachChildView(eachChild);
        }
    }

    public onUnloaded() {
        this._setCssState(null);

        this._unloadEachChildView();

        this._isLoaded = false;
        this._emit("unloaded");
    }

    public _unloadEachChildView() {
        if (this._childrenCount > 0) {
            this._eachChildView((child: ViewCommon) => {
                if (child.isLoaded) {
                    child.onUnloaded();
                }

                return true;
            });
        }
    }

    // public _onPropertyChanged(property: Property, oldValue: any, newValue: any) {
    //     super._onPropertyChanged(property, oldValue, newValue);

    //     if (this._childrenCount > 0) {
    //         let shouldUpdateInheritableProps = (property.inheritable && !(property instanceof styling.Property));
    //         if (shouldUpdateInheritableProps) {
    //             this._updatingInheritedProperties = true;
    //             this._eachChildView((child) => {
    //                 child._setValue(property, this._getValue(property), ValueSource.Inherited);
    //                 return true;
    //             });
    //             this._updatingInheritedProperties = false;
    //         }
    //     }

    //     this._checkMetadataOnPropertyChanged(property.metadata);
    // }

    // public _isInheritedChange() {
    //     if (this._updatingInheritedProperties) {
    //         return true;
    //     }
    //     let parentView: ViewDefinition;
    //     parentView = <View>(this.parent);
    //     while (parentView) {
    //         if (parentView._updatingInheritedProperties) {
    //             return true;
    //         }
    //         parentView = <View>(parentView.parent);
    //     }
    //     return false;
    // }

    // public _checkMetadataOnPropertyChanged(metadata: doPropertyMetadata) {
    //     if (metadata.affectsLayout) {
    //         this.requestLayout();
    //     }

    //     if (metadata.affectsStyle) {
    //         this.style._resetCssValues();
    //         this._applyStyleFromScope();
    //         this._eachChildView((v) => {
    //             v._checkMetadataOnPropertyChanged(metadata);
    //             return true;
    //         });
    //     }
    // }

    public measure(widthMeasureSpec: number, heightMeasureSpec: number): void {
        this._setCurrentMeasureSpecs(widthMeasureSpec, heightMeasureSpec);
    }

    public layout(left: number, top: number, right: number, bottom: number): void {
        this._setCurrentLayoutBounds(left, top, right, bottom);
    }

    public getMeasuredWidth(): number {
        return this._measuredWidth & layout.MEASURED_SIZE_MASK || 0;
    }

    public getMeasuredHeight(): number {
        return this._measuredHeight & layout.MEASURED_SIZE_MASK || 0;
    }

    public getMeasuredState(): number {
        return (this._measuredWidth & layout.MEASURED_STATE_MASK)
            | ((this._measuredHeight >> layout.MEASURED_HEIGHT_STATE_SHIFT)
                & (layout.MEASURED_STATE_MASK >> layout.MEASURED_HEIGHT_STATE_SHIFT));
    }

    public setMeasuredDimension(measuredWidth: number, measuredHeight: number): void {
        this._measuredWidth = measuredWidth;
        this._measuredHeight = measuredHeight;
        if (traceEnabled) {
            traceWrite(this + " :setMeasuredDimension: " + measuredWidth + ", " + measuredHeight, traceCategories.Layout);
        }
    }

    public requestLayout(): void {
        this._isLayoutValid = false;
    }

    public abstract onMeasure(widthMeasureSpec: number, heightMeasureSpec: number): void;
    public abstract onLayout(left: number, top: number, right: number, bottom: number): void;
    public abstract layoutNativeView(left: number, top: number, right: number, bottom: number): void;

    private pseudoClassAliases = {
        'highlighted': [
            'active',
            'pressed'
        ]
    };

    private getAllAliasedStates(name: string): Array<string> {
        let allStates = [];
        allStates.push(name);
        if (name in this.pseudoClassAliases) {
            for (let i = 0; i < this.pseudoClassAliases[name].length; i++) {
                allStates.push(this.pseudoClassAliases[name][i]);
            }
        }
        return allStates;
    }

    public addPseudoClass(name: string): void {
        let allStates = this.getAllAliasedStates(name);
        for (let i = 0; i < allStates.length; i++) {
            if (!this.cssPseudoClasses.has(allStates[i])) {
                this.cssPseudoClasses.add(allStates[i]);
                this.notifyPseudoClassChanged(allStates[i]);
            }
        }
    }

    public deletePseudoClass(name: string): void {
        let allStates = this.getAllAliasedStates(name);
        for (let i = 0; i < allStates.length; i++) {
            if (this.cssPseudoClasses.has(allStates[i])) {
                this.cssPseudoClasses.delete(allStates[i]);
                this.notifyPseudoClassChanged(allStates[i]);
            }
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
                    result = Math.round(specSize + 0.499) | layout.MEASURED_STATE_TOO_SMALL;
                }
                break;

            case layout.EXACTLY:
                result = specSize;
                break;
        }

        return Math.round(result + 0.499) | (childMeasuredState & layout.MEASURED_STATE_MASK);
    }

    public static combineMeasuredStates(curState: number, newState): number {
        return curState | newState;
    }

    public static layoutChild(parent: ViewDefinition, child: ViewDefinition, left: number, top: number, right: number, bottom: number): void {
        if (!child || child.isCollapsed) {
            return;
        }

        let childStyle = child.style;

        let childTop: number;
        let childLeft: number;

        let childWidth = child.getMeasuredWidth();
        let childHeight = child.getMeasuredHeight();

        let effectiveMarginTop = childStyle.effectiveMarginTop;
        let effectiveMarginBottom = childStyle.effectiveMarginBottom;

        let vAlignment: string;
        if (childStyle.effectiveHeight >= 0 && childStyle.verticalAlignment === "stretch") {
            vAlignment = "center";
        }
        else {
            vAlignment = childStyle.verticalAlignment;
        }

        let marginTop = childStyle.marginTop;
        let marginBottom = childStyle.marginBottom;
        let marginLeft = childStyle.marginLeft;
        let marginRight = childStyle.marginRight;

        switch (vAlignment) {
            case "top":
                childTop = top + effectiveMarginTop;
                break;

            case "center":
            case "middle":
                childTop = top + (bottom - top - childHeight + (effectiveMarginTop - effectiveMarginBottom)) / 2;
                break;

            case "bottom":
                childTop = bottom - childHeight - effectiveMarginBottom;
                break;

            case "stretch":
            default:
                childTop = top + effectiveMarginTop;
                childHeight = bottom - top - (effectiveMarginTop + effectiveMarginBottom);
                break;
        }

        let effectiveMarginLeft = childStyle.effectiveMarginLeft;
        let effectiveMarginRight = childStyle.effectiveMarginRight;

        let hAlignment: string;
        if (childStyle.effectiveWidth >= 0 && childStyle.horizontalAlignment === "stretch") {
            hAlignment = "center";
        }
        else {
            hAlignment = childStyle.horizontalAlignment;
        }

        switch (hAlignment) {
            case "left":
                childLeft = left + effectiveMarginLeft;
                break;

            case "center":
            case "middle":
                childLeft = left + (right - left - childWidth + (effectiveMarginLeft - effectiveMarginRight)) / 2;
                break;

            case "right":
                childLeft = right - childWidth - effectiveMarginRight;
                break;

            case "stretch":
            default:
                childLeft = left + effectiveMarginLeft;
                childWidth = right - left - (effectiveMarginLeft + effectiveMarginRight);
                break;
        }

        let childRight = Math.round(childLeft + childWidth);
        let childBottom = Math.round(childTop + childHeight);
        childLeft = Math.round(childLeft);
        childTop = Math.round(childTop);

        if (traceEnabled) {
            traceWrite(child.parent + " :layoutChild: " + child + " " + childLeft + ", " + childTop + ", " + childRight + ", " + childBottom, traceCategories.Layout);
        }

        child.layout(childLeft, childTop, childRight, childBottom);
    }

    public static measureChild(parent: ViewCommon, child: ViewCommon, widthMeasureSpec: number, heightMeasureSpec: number): { measuredWidth: number; measuredHeight: number } {
        let measureWidth = 0;
        let measureHeight = 0;

        if (child && !child.isCollapsed) {
            let density = layout.getDisplayDensity();
            let width = layout.getMeasureSpecSize(widthMeasureSpec);
            let widthMode = layout.getMeasureSpecMode(widthMeasureSpec);

            let height = layout.getMeasureSpecSize(heightMeasureSpec);
            let heightMode = layout.getMeasureSpecMode(heightMeasureSpec);

            let parentWidthMeasureSpec = parent._currentWidthMeasureSpec;
            updateChildLayoutParams(child, parent, density);

            let style = child.style;
            let horizontalMargins = style.effectiveMarginLeft + style.effectiveMarginRight;
            let verticalMargins = style.effectiveMarginTop + style.effectiveMarginRight;

            let childWidthMeasureSpec = ViewCommon.getMeasureSpec(width, widthMode, horizontalMargins, style.effectiveWidth, style.horizontalAlignment === "stretch");
            let childHeightMeasureSpec = ViewCommon.getMeasureSpec(height, heightMode, verticalMargins, style.effectiveHeight, style.verticalAlignment === "stretch");

            if (traceEnabled) {
                traceWrite(child.parent + " :measureChild: " + child + " " + layout.measureSpecToString(childWidthMeasureSpec) + ", " + layout.measureSpecToString(childHeightMeasureSpec), traceCategories.Layout);
            }

            child.measure(childWidthMeasureSpec, childHeightMeasureSpec);
            measureWidth = Math.round(child.getMeasuredWidth() + horizontalMargins);
            measureHeight = Math.round(child.getMeasuredHeight() + verticalMargins);
        }

        return { measuredWidth: measureWidth, measuredHeight: measureHeight };
    }

    private static getMeasureSpec(parentLength: number, parentSpecMode: number, margins: number, childLength: number, stretched: boolean): number {
        let resultSize = 0;
        let resultMode = 0;

        // We want a specific size... let be it.
        if (childLength >= 0) {
            // If mode !== UNSPECIFIED we take the smaller of parentLength and childLength
            // Otherwise we will need to clip the view but this is not possible in all Android API levels.
            resultSize = parentSpecMode === layout.UNSPECIFIED ? childLength : Math.min(parentLength, childLength);
            resultMode = layout.EXACTLY;
        }
        else {
            switch (parentSpecMode) {
                // Parent has imposed an exact size on us
                case layout.EXACTLY:
                    resultSize = Math.max(0, parentLength - margins);
                    // if stretched - nativeView wants to be our size. So be it.
                    // else - nativeView wants to determine its own size. It can't be bigger than us.
                    resultMode = stretched ? layout.EXACTLY : layout.AT_MOST;
                    break;

                // Parent has imposed a maximum size on us
                case layout.AT_MOST:
                    resultSize = Math.max(0, parentLength - margins);
                    resultMode = layout.AT_MOST;
                    break;

                // Equivalent to measure with Infinity.
                case layout.UNSPECIFIED:
                    resultSize = 0;
                    resultMode = layout.UNSPECIFIED;
                    break;
            }
        }

        return layout.makeMeasureSpec(resultSize, resultMode);
    }

    _setCurrentMeasureSpecs(widthMeasureSpec: number, heightMeasureSpec: number): boolean {
        let changed: boolean = this._currentWidthMeasureSpec !== widthMeasureSpec || this._currentHeightMeasureSpec !== heightMeasureSpec;
        this._currentWidthMeasureSpec = widthMeasureSpec;
        this._currentHeightMeasureSpec = heightMeasureSpec;
        return changed;
    }

    _getCurrentLayoutBounds(): { left: number; top: number; right: number; bottom: number } {
        return { left: this._oldLeft, top: this._oldTop, right: this._oldRight, bottom: this._oldBottom }
    }

    /**
     * Returns two booleans - the first if "boundsChanged" the second is "sizeChanged".
     */
    _setCurrentLayoutBounds(left: number, top: number, right: number, bottom: number): { boundsChanged: boolean, sizeChanged: boolean } {
        this._isLayoutValid = true;
        let boundsChanged: boolean = this._oldLeft !== left || this._oldTop !== top || this._oldRight !== right || this._oldBottom !== bottom;
        let sizeChanged: boolean = (this._oldRight - this._oldLeft !== right - left) || (this._oldBottom - this._oldTop !== bottom - top);
        this._oldLeft = left;
        this._oldTop = top;
        this._oldRight = right;
        this._oldBottom = bottom;
        return { boundsChanged, sizeChanged };
    }

    private _applyStyleFromScope() {
        let rootPage = this.page;
        if (!rootPage || !rootPage.isLoaded) {
            return;
        }
        let scope: StyleScope = (<any>rootPage)._getStyleScope();
        scope.applySelectors(this);
    }

    private _applyInlineStyle(inlineStyle) {
        if (typeof inlineStyle === "string") {
            try {
                // this.style._beginUpdate();
                applyInlineSyle(this, <string>inlineStyle);
            } finally {
                // this.style._endUpdate();
            }
        }
    }

    // TODO: We need to implement some kind of build step that includes these members only when building for Android
    //@android
    public _context: android.content.Context;

    public _onAttached(context: android.content.Context) {
        //
    }

    public _onDetached(force?: boolean) {
        //
    }

    public _createUI() {
        //
    }

    public _onContextChanged() {
        //
    }
    //@endandroid

    // TODO: We need to implement some kind of build step that includes these members only when building for iOS

    //@endios
    get _childrenCount(): number {
        return 0;
    }

    public _eachChildView(callback: (view: ViewCommon) => boolean) {
        //
    }

    _childIndexToNativeChildIndex(index?: number): number {
        return index;
    }

    _getNativeViewsCount(): number {
        return this._isAddedToNativeVisualTree ? 1 : 0;
    }

    _eachLayoutView(callback: (View) => void): void {
        return callback(this);
    }

    _addToSuperview(superview: any, index?: number): boolean {
        // IOS specific
        return false;
    }
    _removeFromSuperview(): void {
        // IOS specific
    }

    /**
     * Core logic for adding a child view to this instance. Used by the framework to handle lifecycle events more centralized. Do not outside the UI Stack implementation.
     * // TODO: Think whether we need the base Layout routine.
     */
    public _addView(view: ViewDefinition, atIndex?: number) {
        if (traceEnabled) {
            traceWrite(`${this}._addView(${view}, ${atIndex})`, traceCategories.ViewHierarchy);
        }

        if (!view) {
            throw new Error("Expecting a valid View instance.");
        }
        if (!(view instanceof ViewBase)) {
            throw new Error(view + " is not a valid View instance.");
        }
        if (view.parent) {
            throw new Error("View already has a parent. View: " + view + " Parent: " + view.parent);
        }

        view.parent = this;
        this._addViewCore(view, atIndex);
        view._parentChanged(null);
    }

    /**
     * Method is intended to be overridden by inheritors and used as "protected"
     */
    public _addViewCore(view: ViewDefinition, atIndex?: number) {
        this._propagateInheritableProperties(view);

        if (!view._isAddedToNativeVisualTree) {
            let nativeIndex = this._childIndexToNativeChildIndex(atIndex);
            view._isAddedToNativeVisualTree = this._addViewToNativeVisualTree(view, nativeIndex);
        }

        // TODO: Discuss this.
        if (this._isLoaded) {
            view.onLoaded();
        }
    }

    public _propagateInheritableProperties(view: ViewDefinition) {
        propagateInheritedProperties(this);
        // view._inheritProperties(this);
        // view.style._inheritStyleProperties(this);
    }

    // public _inheritProperties(parentView: ViewDefinition) {
    //     parentView._eachSetProperty((property) => {
    //         if (!(property instanceof styling.Property) && property.inheritable) {
    //             let baseValue = parentView._getValue(property);
    //             this._setValue(property, baseValue, ValueSource.Inherited);
    //         }
    //         return true;
    //     });
    // }

    /**
     * Core logic for removing a child view from this instance. Used by the framework to handle lifecycle events more centralized. Do not outside the UI Stack implementation.
     */
    public _removeView(view: ViewDefinition) {
        if (traceEnabled) {
            traceWrite(`${this}._removeView(${view})`, traceCategories.ViewHierarchy);
        }
        if (view.parent !== this) {
            throw new Error("View not added to this instance. View: " + view + " CurrentParent: " + view.parent + " ExpectedParent: " + this);
        }

        this._removeViewCore(view);
        view.parent = undefined;
        view._parentChanged(this);
    }

    /**
     * Method is intended to be overridden by inheritors and used as "protected"
     */
    public _removeViewCore(view: ViewDefinition) {
        // TODO: Change type from ViewCommon to ViewBase. Probably this 
        // method will need to go to ViewBase class.
        // Remove the view from the native visual scene first
        this._removeViewFromNativeVisualTree(view);

        // TODO: Discuss this.
        if (view.isLoaded) {
            view.onUnloaded();
        }

        // view.unsetInheritedProperties();
    }

    public unsetInheritedProperties(): void {
        // this._setValue(ProxyObject.bindingContextProperty, undefined, ValueSource.Inherited);
        // this._eachSetProperty((property) => {
        //     if (!(property instanceof styling.Property) && property.inheritable) {
        //         this._resetValue(property, ValueSource.Inherited);
        //     }
        //     return true;
        // });
    }

    public _parentChanged(oldParent: ViewDefinition): void {
        //Overridden
        if (oldParent) {
            // Move these method in property class.
            clearInheritedProperties(this);
        }
    }

    /**
     * Method is intended to be overridden by inheritors and used as "protected".
     */
    public _addViewToNativeVisualTree(view: ViewDefinition, atIndex?: number): boolean {
        if (view._isAddedToNativeVisualTree) {
            throw new Error("Child already added to the native visual tree.");
        }

        return true;
    }

    /**
     * Method is intended to be overridden by inheritors and used as "protected"
     */
    public _removeViewFromNativeVisualTree(view: ViewDefinition) {
        view._isAddedToNativeVisualTree = false;
    }

    public _goToVisualState(state: string) {
        if (traceEnabled) {
            traceWrite(this + " going to state: " + state, traceCategories.Style);
        }
        if (state === this._visualState) {
            return;
        }

        this.deletePseudoClass(this._visualState);
        this._visualState = state;
        this.addPseudoClass(state);
    }

    public _applyXmlAttribute(attribute, value): boolean {
        if (attribute === "style") {
            this._applyInlineStyle(value);
            return true;
        }

        return false;
    }

    public setInlineStyle(style: string): void {
        if (typeof style !== "string") {
            throw new Error("Parameter should be valid CSS string!");
        }

        this._applyInlineStyle(style);
    }

    public _updateLayout() {
        // needed for iOS.
    }

    get _nativeView(): any {
        return undefined;
    }

    public _shouldApplyStyleHandlers() {
        // If we have native view we are ready to apply style handelr;
        return !!this._nativeView;
    }

    public focus(): boolean {
        return undefined;
    }

    public getLocationInWindow(): Point {
        return undefined;
    }

    public getLocationOnScreen(): Point {
        return undefined;
    }

    public getLocationRelativeTo(otherView: ViewDefinition): Point {
        return undefined;
    }

    public getActualSize(): Size {
        let currentBounds = this._getCurrentLayoutBounds();
        if (!currentBounds) {
            return undefined;
        }

        return {
            width: layout.toDeviceIndependentPixels(currentBounds.right - currentBounds.left),
            height: layout.toDeviceIndependentPixels(currentBounds.bottom - currentBounds.top),
        }
    }

    public animate(animation: any): AnimationPromise {
        return this.createAnimation(animation).play();
    }

    public createAnimation(animation: any): any {
        animation.target = this;
        return new Animation([animation]);
    }

    public _registerAnimation(animation: KeyframeAnimation) {
        if (this._registeredAnimations === undefined) {
            this._registeredAnimations = new Array<KeyframeAnimation>();
        }
        this._registeredAnimations.push(animation);
    }

    public _unregisterAnimation(animation: KeyframeAnimation) {
        if (this._registeredAnimations) {
            let index = this._registeredAnimations.indexOf(animation);
            if (index >= 0) {
                this._registeredAnimations.splice(index, 1);
            }
        }
    }

    public _unregisterAllAnimations() {
        if (this._registeredAnimations) {
            for (let animation of this._registeredAnimations) {
                animation.cancel();
            }
        }
    }

    public toString(): string {
        let str = this.typeName;
        if (this.id) {
            str += `<${this.id}>`;
        } else {
            str += `(${this._domId})`;
        }
        let source = Source.get(this);
        if (source) {
            str += `@${source};`;
        }

        return str;
    }

    public _setNativeViewFrame(nativeView: any, frame: any) {
        //
    }

    // public _onStylePropertyChanged(property: Property): void {
    //     //
    // }

    // protected _canApplyNativeProperty(): boolean {
    //     // Check for a valid _nativeView instance
    //     return !!this._nativeView;
    // }

    private notifyPseudoClassChanged(pseudoClass: string): void {
        this.notify({ eventName: ":" + pseudoClass, object: this });
    }

    // TODO: Make sure the state is set to null and this is called on unloaded to clean up change listeners...
    _setCssState(next: CssState): void {
        const previous = this._cssState;
        this._cssState = next;

        if (!this._invalidateCssHandler) {
            this._invalidateCssHandler = () => {
                if (this._invalidateCssHandlerSuspended) {
                    return;
                }
                this.applyCssState();
            };
        }

        try {
            this._invalidateCssHandlerSuspended = true;

            if (next) {
                next.changeMap.forEach((changes, view) => {
                    if (changes.attributes) {
                        changes.attributes.forEach(attribute => {
                            view.addEventListener(attribute + "Change", this._invalidateCssHandler)
                        });
                    }
                    if (changes.pseudoClasses) {
                        changes.pseudoClasses.forEach(pseudoClass => {
                            let eventName = ":" + pseudoClass;
                            view.addEventListener(":" + pseudoClass, this._invalidateCssHandler);
                            if (view[eventName]) {
                                view[eventName](+1);
                            }
                        });
                    }
                });
            }

            if (previous) {
                previous.changeMap.forEach((changes, view) => {
                    if (changes.attributes) {
                        changes.attributes.forEach(attribute => {
                            view.removeEventListener("onPropertyChanged:" + attribute, this._invalidateCssHandler)
                        });
                    }
                    if (changes.pseudoClasses) {
                        changes.pseudoClasses.forEach(pseudoClass => {
                            let eventName = ":" + pseudoClass;
                            view.removeEventListener(eventName, this._invalidateCssHandler)
                            if (view[eventName]) {
                                view[eventName](-1);
                            }
                        });
                    }
                });
            }

        } finally {
            this._invalidateCssHandlerSuspended = false;
        }

        this.applyCssState();
    }

    /**
     * Notify that some attributes or pseudo classes that may affect the current CssState had changed.
     */
    private _invalidateCssHandler;
    private _invalidateCssHandlerSuspended: boolean;

    private applyCssState(): void {
        if (!this._cssState) {
            return;
        }

        // this.style._beginUpdate();
        this._cssState.apply();
        // this.style._endUpdate();
    }
}

function getEffectiveValue(prentAvailableLength: number, density: number, param: Length): number {
    switch (param.unit) {
        case "%":
            return Math.round(prentAvailableLength * param.value);

        case "px":
            return Math.round(param.value);

        default:
        case "dip":
            return Math.round(density * param.value);
    }
}

function updateChildLayoutParams(child: ViewCommon, parent: ViewCommon, density: number): void {
    let style = child.style;

    let parentWidthMeasureSpec = parent._currentWidthMeasureSpec;
    let parentWidthMeasureSize = layout.getMeasureSpecSize(parentWidthMeasureSpec);
    let parentWidthMeasureMode = layout.getMeasureSpecMode(parentWidthMeasureSpec);
    let parentAvailableWidth = parentWidthMeasureMode === layout.UNSPECIFIED ? -1 : parentWidthMeasureSize;
    style.effectiveWidth = getEffectiveValue(parentAvailableWidth, density, style.width);
    style.effectiveMarginLeft = getEffectiveValue(parentAvailableWidth, density, style.marginLeft);
    style.effectiveMarginRight = getEffectiveValue(parentAvailableWidth, density, style.marginRight);

    let parentHeightMeasureSpec = parent._currentHeightMeasureSpec;
    let parentHeightMeasureSize = layout.getMeasureSpecSize(parentHeightMeasureSpec);
    let parentHeightMeasureMode = layout.getMeasureSpecMode(parentHeightMeasureSpec);
    let parentAvailableHeight = parentHeightMeasureMode === layout.UNSPECIFIED ? -1 : parentHeightMeasureSize;
    style.effectiveHeight = getEffectiveValue(parentAvailableHeight, density, style.height);
    style.effectiveMarginTop = getEffectiveValue(parentAvailableHeight, density, style.marginTop);
    style.effectiveMarginBottom = getEffectiveValue(parentAvailableHeight, density, style.marginBottom);
}

interface Length {
    readonly unit: "%" | "dip" | "px";
    readonly value: number;
}

export namespace Length {
    export function parse(value: string | Length): Length {
        if (typeof value === "string") {
            let type: "%" | "dip" | "px";
            let numberValue = 0;
            let stringValue = value.trim();
            let percentIndex = stringValue.indexOf("%");
            if (percentIndex !== -1) {
                type = "%";
                // if only % or % is not last we treat it as invalid value.
                if (percentIndex !== (stringValue.length - 1) || percentIndex === 0) {
                    numberValue = Number.NaN;
                } else {
                    numberValue = parseFloat(stringValue.substring(0, stringValue.length - 1).trim()) / 100;
                }
            } else {
                if (stringValue.indexOf("px") !== -1) {
                    type = "px";
                    stringValue = stringValue.replace("px", "").trim();
                } else {
                    type = "dip";
                }

                numberValue = parseFloat(stringValue);
            }

            if (isNaN(numberValue) || !isFinite(numberValue)) {
                throw new Error("Invalid value: " + value);
            }

            return {
                value: numberValue,
                unit: type
            }
        } else {
            return value;
        }
    }
}

function onCssClassPropertyChanged(view: ViewCommon, oldValue: string, newValue: string) {
    let classes = view.cssClasses;
    classes.clear();
    if (typeof newValue === "string") {
        newValue.split(" ").forEach(c => classes.add(c));
    }
}

export const classNameProperty = new Property<ViewCommon, string>({ name: "className", valueChanged: onCssClassPropertyChanged });
classNameProperty.register(ViewCommon);

function resetStyles(view: ViewCommon): void {
    // view.style._resetCssValues();
    // view._applyStyleFromScope();
    view._eachChildView((child) => {
        // TODO.. Check old implementation....
        resetStyles(child);
        return true;
    });
}
// let idProperty = new Property("id", "View", new PropertyMetadata(undefined, PropertyMetadataSettings.AffectsStyle));
export const idProperty = new Property<ViewCommon, string>({ name: "id", valueChanged: (view, oldValue, newValue) => resetStyles(view) });
idProperty.register(ViewCommon);

export const automationTextProperty = new Property<ViewCommon, string>({ name: "automationText" });
automationTextProperty.register(ViewCommon);

export const originXProperty = new Property<ViewCommon, number>({ name: "originX", defaultValue: 0.5 });
originXProperty.register(ViewCommon);

export const originYProperty = new Property<ViewCommon, number>({ name: "originY", defaultValue: 0.5 });
originYProperty.register(ViewCommon);

export const isEnabledProperty = new Property<ViewCommon, boolean>({ name: "isEnabled", defaultValue: true });
isEnabledProperty.register(ViewCommon);

export const isUserInteractionEnabledProperty = new Property<ViewCommon, boolean>({ name: "isUserInteractionEnabled", defaultValue: true });
isUserInteractionEnabledProperty.register(ViewCommon);

const zeroLength: Length = { value: 0, unit: "px" };

export const minWidthProperty = new CssProperty<Style, Length>({
    name: "minWidth", cssName: "min-width", defaultValue: zeroLength, affectsLayout: isIOS, valueChanged: (target, newValue) => {
        target.effectiveMinWidth = getEffectiveValue(0, layout.getDisplayDensity(), newValue);
    }, valueConverter: Length.parse
});
minWidthProperty.register(Style);

export const minHeightProperty = new CssProperty<Style, Length>({
    name: "minHeight", cssName: "min-height", defaultValue: zeroLength, affectsLayout: isIOS, valueChanged: (target, newValue) => {
        target.effectiveMinHeight = getEffectiveValue(0, layout.getDisplayDensity(), newValue);
    }, valueConverter: Length.parse
});
minHeightProperty.register(Style);

const matchParent: Length = { value: -1, unit: "px" };

export const widthProperty = new CssProperty<Style, Length>({ name: "width", cssName: "width", defaultValue: matchParent, affectsLayout: isIOS, valueConverter: Length.parse });
widthProperty.register(Style);

export const heightProperty = new CssProperty<Style, Length>({ name: "height", cssName: "height", defaultValue: matchParent, affectsLayout: isIOS, valueConverter: Length.parse });
heightProperty.register(Style);

export const marginProperty = new ShorthandProperty<Style>({
    name: "margin", cssName: "margin",
    getter: function (this: Style) { return `${this.marginTop} ${this.marginRight} ${this.marginBottom} ${this.marginLeft}`; },
    converter: convertToMargins
});
marginProperty.register(Style);

export const marginLeftProperty = new CssProperty<Style, Length>({ name: "marginLeft", cssName: "margin-left", defaultValue: zeroLength, affectsLayout: isIOS, valueConverter: Length.parse });
marginLeftProperty.register(Style);

export const marginRightProperty = new CssProperty<Style, Length>({ name: "marginRight", cssName: "margin-right", defaultValue: zeroLength, affectsLayout: isIOS, valueConverter: Length.parse });
marginRightProperty.register(Style);

export const marginTopProperty = new CssProperty<Style, Length>({ name: "marginTop", cssName: "margin-top", defaultValue: zeroLength, affectsLayout: isIOS, valueConverter: Length.parse });
marginTopProperty.register(Style);

export const marginBottomProperty = new CssProperty<Style, Length>({ name: "marginBottom", cssName: "margin-bottom", defaultValue: zeroLength, affectsLayout: isIOS, valueConverter: Length.parse });
marginBottomProperty.register(Style);

export const paddingProperty = new ShorthandProperty<Style>({
    name: "padding", cssName: "padding",
    getter: function (this: Style) { return `${this.paddingTop} ${this.paddingRight} ${this.paddingBottom} ${this.paddingLeft}`; },
    converter: convertToPaddings
});
paddingProperty.register(Style);

export const paddingLeftProperty = new CssProperty<Style, Length>({
    name: "paddingLeft", cssName: "padding-left", defaultValue: zeroLength, affectsLayout: isIOS, valueChanged: (target, newValue) => {
        target.effectivePaddingLeft = getEffectiveValue(0, layout.getDisplayDensity(), newValue);
    }, valueConverter: Length.parse
});
paddingLeftProperty.register(Style);

export const paddingRightProperty = new CssProperty<Style, Length>({
    name: "paddingRight", cssName: "padding-right", defaultValue: zeroLength, affectsLayout: isIOS, valueChanged: (target, newValue) => {
        target.effectivePaddingRight = getEffectiveValue(0, layout.getDisplayDensity(), newValue);
    }, valueConverter: Length.parse
});
paddingRightProperty.register(Style);

export const paddingTopProperty = new CssProperty<Style, Length>({
    name: "paddingTop", cssName: "padding-top", defaultValue: zeroLength, affectsLayout: isIOS, valueChanged: (target, newValue) => {
        target.effectivePaddingTop = getEffectiveValue(0, layout.getDisplayDensity(), newValue);
    }, valueConverter: Length.parse
});
paddingTopProperty.register(Style);

export const paddingBottomProperty = new CssProperty<Style, Length>({
    name: "paddingBottom", cssName: "padding-bottom", defaultValue: zeroLength, affectsLayout: isIOS, valueChanged: (target, newValue) => {
        target.effectivePaddingBottom = getEffectiveValue(0, layout.getDisplayDensity(), newValue);
    }, valueConverter: Length.parse
});
paddingBottomProperty.register(Style);

export const verticalAlignmentProperty = new CssProperty<Style, string>({ name: "verticalAlignment", cssName: "vertical-align", defaultValue: "stretch", affectsLayout: isIOS });
verticalAlignmentProperty.register(Style);

export const horizontalAlignmentProperty = new CssProperty<Style, string>({ name: "horizontalAlignment", cssName: "horizontal-align", defaultValue: "stretch", affectsLayout: isIOS });
horizontalAlignmentProperty.register(Style);

interface Thickness {
    top: string,
    right: string,
    bottom: string,
    left: string
}

function parseThickness(value: string): Thickness {
    if (typeof value === "string") {
        let arr = value.split(/[ ,]+/);

        let top: string;
        let right: string;
        let bottom: string;
        let left: string;

        if (arr.length === 1) {
            top = arr[0];
            right = arr[0];
            bottom = arr[0];
            left = arr[0];
        }
        else if (arr.length === 2) {
            top = arr[0];
            bottom = arr[0];
            right = arr[1];
            left = arr[1];
        }
        else if (arr.length === 3) {
            top = arr[0];
            right = arr[1];
            left = arr[1];
            bottom = arr[2];
        }
        else if (arr.length === 4) {
            top = arr[0];
            right = arr[1];
            bottom = arr[2];
            left = arr[3];
        }
        else {
            throw new Error("Expected 1, 2, 3 or 4 parameters. Actual: " + value);
        }

        return {
            top: top,
            right: right,
            bottom: bottom,
            left: left
        }
    } else {
        return value;
    }
}

function convertToMargins(this: Style, value: string): [CssProperty<any, any>, any][] {
    let thickness = parseThickness(value);
    return [
        [marginTopProperty, Length.parse(thickness.top)],
        [marginRightProperty, Length.parse(thickness.right)],
        [marginBottomProperty, Length.parse(thickness.bottom)],
        [marginLeftProperty, Length.parse(thickness.left)]
    ];
}

function convertToPaddings(this: Style, value: string): [CssProperty<any, any>, any][] {
    let thickness = parseThickness(value);
    return [
        [paddingTopProperty, Length.parse(thickness.top)],
        [paddingRightProperty, Length.parse(thickness.right)],
        [paddingBottomProperty, Length.parse(thickness.bottom)],
        [paddingLeftProperty, Length.parse(thickness.left)]
    ];
}

export const rotateProperty = new CssProperty<Style, number>({ name: "rotate", cssName: "rotate", defaultValue: 0 });
rotateProperty.register(Style);

export const scaleXProperty = new CssProperty<Style, number>({ name: "scaleX", cssName: "scaleX", defaultValue: 1 });
scaleXProperty.register(Style);

export const scaleYProperty = new CssProperty<Style, number>({ name: "scaleY", cssName: "scaleY", defaultValue: 1 });
scaleYProperty.register(Style);

export const translateXProperty = new CssProperty<Style, number>({ name: "translateX", cssName: "translateX", defaultValue: 0 });
translateXProperty.register(Style);

export const translateYProperty = new CssProperty<Style, number>({ name: "translateY", cssName: "translateY", defaultValue: 0 });
translateYProperty.register(Style);

export const transformProperty = new ShorthandProperty<Style>({
    name: "transform", cssName: "transform",
    getter: function (this: Style) {
        let scaleX = this.scaleX;
        let scaleY = this.scaleY;
        let translateX = this.translateX;
        let translateY = this.translateY;
        let rotate = this.rotate;
        let result = "";
        if (translateX !== 0 || translateY !== 0) {
            result += `translate(${translateX}, ${translateY}) `;
        }
        if (scaleX !== 1 || scaleY !== 1) {
            result += `scale(${scaleX}, ${scaleY}) `;
        }
        if (rotate !== 0) {
            result += `rotate (${rotate})`;
        }

        return result.trim();
    },
    converter: convertToTransform
});
transformProperty.register(Style);

function transformConverter(value: string): Object {
    if (value.indexOf("none") !== -1) {
        let operations = {};
        operations[value] = value;
        return operations;
    }

    let operations = {};
    let operator = "";
    let pos = 0;
    while (pos < value.length) {
        if (value[pos] === " " || value[pos] === ",") {
            pos++;
        }
        else if (value[pos] === "(") {
            let start = pos + 1;
            while (pos < value.length && value[pos] !== ")") {
                pos++;
            }
            let operand = value.substring(start, pos);
            operations[operator] = operand.trim();
            operator = "";
            pos++;
        }
        else {
            operator += value[pos++];
        }
    }
    return operations;
}

function convertToTransform(value: string): [CssProperty<any, any>, any][] {
    let newTransform = transformConverter(value);
    let array = [];
    let values: Array<string>;
    for (var transform in newTransform) {
        switch (transform) {
            case "scaleX":
                array.push([scaleXProperty, parseFloat(newTransform[transform])]);
                break;
            case "scaleY":
                array.push([scaleYProperty, parseFloat(newTransform[transform])]);
                break;
            case "scale":
            case "scale3d":
                values = newTransform[transform].split(",");
                if (values.length >= 2) {
                    array.push([scaleXProperty, parseFloat(values[0])]);
                    array.push([scaleYProperty, parseFloat(values[1])]);
                }
                else if (values.length === 1) {
                    array.push([scaleXProperty, parseFloat(values[0])]);
                    array.push([scaleYProperty, parseFloat(values[0])]);
                }
                break;
            case "translateX":
                array.push([translateXProperty, parseFloat(newTransform[transform])]);
                break;
            case "translateY":
                array.push([translateYProperty, parseFloat(newTransform[transform])]);
                break;
            case "translate":
            case "translate3d":
                values = newTransform[transform].split(",");
                if (values.length >= 2) {
                    array.push([translateXProperty, parseFloat(values[0])]);
                    array.push([translateYProperty, parseFloat(values[1])]);
                }
                else if (values.length === 1) {
                    array.push([translateXProperty, parseFloat(values[0])]);
                    array.push([translateYProperty, parseFloat(values[0])]);
                }
                break;
            case "rotate":
                let text = newTransform[transform];
                let val = parseFloat(text);
                if (text.slice(-3) === "rad") {
                    val = val * (180.0 / Math.PI);
                }
                array.push([rotateProperty, val]);
                break;
            case "none":
                array.push([scaleXProperty, 1]);
                array.push([scaleYProperty, 1]);
                array.push([translateXProperty, 0]);
                array.push([translateYProperty, 0]);
                array.push([rotateProperty, 0]);
                break;
        }
    }
    return array;
}

// Background properties.
export const backgroundInternalProperty = new CssProperty<Style, Background>({ name: "backgroundInternal", cssName: "_backgroundInternal", defaultValue: Background.default });

let pattern: RegExp = /url\(('|")(.*?)\1\)/;
export const backgroundImageProperty = new CssProperty<Style, string>({
    name: "backgroundImage", cssName: "background-image", valueChanged: (target, oldValue, newValue) => {
        let style = target;
        let currentBackground = target.backgroundInternal;
        let url: string = newValue;
        let isValid = false;

        let match = url.match(pattern);
        if (match && match[2]) {
            url = match[2];
        }

        if (isDataURI(url)) {
            let base64Data = url.split(",")[1];
            if (typeof base64Data !== "undefined") {
                style.backgroundInternal = currentBackground.withImage(fromBase64(base64Data));
                isValid = true;
            } else {
                style.backgroundInternal, currentBackground.withImage(undefined);
            }
        }
        else if (isFileOrResourcePath(url)) {
            style.backgroundInternal = currentBackground.withImage(fromFileOrResource(url));
            isValid = true;
        }
        else if (url.indexOf("http") !== -1) {
            style["_url"] = url;
            style.backgroundInternal = currentBackground.withImage(undefined);
            fromUrl(url).then((r) => {
                if (style && style["_url"] === url) {
                    // Get the current background again, as it might have changed while doing the request.
                    currentBackground = target.backgroundInternal;
                    target.backgroundInternal = currentBackground.withImage(r);
                }
            });
            isValid = true;
        }

        if (!isValid) {
            style.backgroundInternal = currentBackground.withImage(undefined);
        }
    }
});
backgroundImageProperty.register(Style);

export const backgroundColorProperty = new CssProperty<Style, Color>({
    name: "backgroundColor", cssName: "background-color", valueChanged: (target, newValue) => {
        let background = target.backgroundInternal;
        target.backgroundInternal = background.withColor(newValue);
    }, equalityComparer: Color.equals, valueConverter: (value) => new Color(value)
});
backgroundColorProperty.register(Style);

export const backgroundRepeatProperty = new CssProperty<Style, string>({
    name: "backgroundRepeat", cssName: "background-repeat", valueChanged: (target, newValue) => {
        let background = target.backgroundInternal;
        target.backgroundInternal = background.withRepeat(newValue);
    }
});
backgroundRepeatProperty.register(Style);

export const backgroundSizeProperty = new CssProperty<Style, string>({
    name: "backgroundSize", cssName: "background-size", valueChanged: (target, newValue) => {
        let background = target.backgroundInternal;
        target.backgroundInternal = background.withSize(newValue);
    }
});
backgroundSizeProperty.register(Style);

export const backgroundPositionProperty = new CssProperty<Style, string>({
    name: "backgroundPosition", cssName: "background-position", valueChanged: (target, newValue) => {
        let background = target.backgroundInternal;
        target.backgroundInternal = background.withPosition(newValue);
    }
});
backgroundPositionProperty.register(Style);

function isNonNegativeFiniteNumberConverter(value: string): number {
    let number = parseFloat(value);
    if (!isNonNegativeFiniteNumber(number)) {
        throw new Error("border-width should be Non-Negative Finite number.");
    }
    return number;
}

function parseBorderColor(value: string): { top: Color, right: Color, bottom: Color, left: Color } {
    let result: { top: Color, right: Color, bottom: Color, left: Color };
    if (value.indexOf("rgb") === 0) {
        result.top = result.right = result.bottom = result.left = new Color(value);
        return result;
    }

    let arr = value.split(/[ ,]+/);
    if (arr.length === 1) {
        let arr0 = new Color(arr[0]);
        result.top = arr0;
        result.right = arr0;
        result.bottom = arr0;
        result.left = arr0;
    }
    else if (arr.length === 2) {
        let arr0 = new Color(arr[0]);
        let arr1 = new Color(arr[1]);
        result.top = arr0;
        result.right = arr1;
        result.bottom = arr0;
        result.left = arr1;
    }
    else if (arr.length === 3) {
        let arr0 = new Color(arr[0]);
        let arr1 = new Color(arr[1]);
        let arr2 = new Color(arr[2]);
        result.top = arr0;
        result.right = arr1;
        result.bottom = arr2;
        result.left = arr1;
    }
    else if (arr.length === 4) {
        let arr0 = new Color(arr[0]);
        let arr1 = new Color(arr[1]);
        let arr2 = new Color(arr[2]);
        let arr3 = new Color(arr[3]);
        result.top = arr0;
        result.right = arr1;
        result.bottom = arr2;
        result.left = arr3;
    }
    else {
        throw new Error("Expected 1, 2, 3 or 4 parameters. Actual: " + value);
    }
}

// Border Color properties.
export const borderColorProperty = new ShorthandProperty<Style>({
    name: "borderColor", cssName: "border-color",
    getter: function (this: Style) {
        if (Color.equals(this.borderTopColor, this.borderRightColor) &&
            Color.equals(this.borderTopColor, this.borderBottomColor) &&
            Color.equals(this.borderTopColor, this.borderLeftColor)) {
            return this.borderTopColor ? this.borderTopColor.toString() : "";
        } else {
            return `${this.borderTopColor} ${this.borderRightColor} ${this.borderBottomColor} ${this.borderLeftColor}`;
        }
    },
    converter: function (value: string) {
        let fourColors = parseBorderColor(value);
        return [
            [borderTopColorProperty, fourColors.top],
            [borderRightColorProperty, fourColors.right],
            [borderBottomColorProperty, fourColors.bottom],
            [borderLeftColorProperty, fourColors.left]
        ];
    }
})
borderColorProperty.register(Style);

export const borderTopColorProperty = new CssProperty<Style, Color>({
    name: "borderTopColor", cssName: "border-top-color", valueChanged: (target, newValue) => {
        let background = target.backgroundInternal;
        target.backgroundInternal = background.withBorderTopColor(newValue);
    },
    equalityComparer: Color.equals, valueConverter: (value) => new Color(value)
});
borderTopColorProperty.register(Style);

export const borderRightColorProperty = new CssProperty<Style, Color>({
    name: "borderRightColor", cssName: "border-right-color", valueChanged: (target, newValue) => {
        let background = target.backgroundInternal;
        target.backgroundInternal = background.withBorderRightColor(newValue);
    }, equalityComparer: Color.equals, valueConverter: (value) => new Color(value)
});
borderRightColorProperty.register(Style);

export const borderBottomColorProperty = new CssProperty<Style, Color>({
    name: "borderBottomColor", cssName: "border-bottom-color", valueChanged: (target, newValue) => {
        let background = target.backgroundInternal;
        target.backgroundInternal = background.withBorderBottomColor(newValue);
    }, equalityComparer: Color.equals, valueConverter: (value) => new Color(value)
});
borderBottomColorProperty.register(Style);

export const borderLeftColorProperty = new CssProperty<Style, Color>({
    name: "borderLeftColor", cssName: "border-left-color", valueChanged: (target, newValue) => {
        let background = target.backgroundInternal;
        target.backgroundInternal = background.withBorderLeftColor(newValue);
    }, equalityComparer: Color.equals, valueConverter: (value) => new Color(value)
});
borderLeftColorProperty.register(Style);

// Border Width properties.
export const borderWidthProperty = new ShorthandProperty<Style>({
    name: "borderWidth", cssName: "border-width",
    getter: function (this: Style) {
        if (Color.equals(this.borderTopColor, this.borderRightColor) &&
            Color.equals(this.borderTopColor, this.borderBottomColor) &&
            Color.equals(this.borderTopColor, this.borderLeftColor)) {
            return this.borderTopColor + "";
        } else {
            return `${this.borderTopColor} ${this.borderRightColor} ${this.borderBottomColor} ${this.borderLeftColor}`;
        }
    },
    converter: function (value: string) {
        let borderWidths = parseThickness(value);
        return [
            [borderTopWidthProperty, borderWidths.top],
            [borderRightWidthProperty, borderWidths.right],
            [borderBottomWidthProperty, borderWidths.bottom],
            [borderLeftWidthProperty, borderWidths.left]
        ];
    }
})
borderWidthProperty.register(Style);

export const borderTopWidthProperty = new CssProperty<Style, Length>({
    name: "borderTopWidth", cssName: "border-top-width", defaultValue: zeroLength, affectsLayout: isIOS, valueChanged: (target, newValue) => {
        let value = getEffectiveValue(0, layout.getDisplayDensity(), newValue);
        if (!isNonNegativeFiniteNumber(value)) {
            throw new Error(`border-top-width should be Non-Negative Finite number. Value: ${value}`);
        }
        target.effectiveBorderTopWidth = value;
        let background = target.backgroundInternal;
        target.backgroundInternal = background.withBorderTopWidth(value);
    }, valueConverter: Length.parse
});
borderTopWidthProperty.register(Style);

export const borderRightWidthProperty = new CssProperty<Style, Length>({
    name: "borderRightWidth", cssName: "border-right-width", defaultValue: zeroLength, affectsLayout: isIOS, valueChanged: (target, newValue) => {
        let value = getEffectiveValue(0, layout.getDisplayDensity(), newValue);
        if (!isNonNegativeFiniteNumber(value)) {
            throw new Error(`border-right-width should be Non-Negative Finite number. Value: ${value}`);
        }
        target.effectiveBorderRightWidth = value;
        let background = target.backgroundInternal;
        target.backgroundInternal = background.withBorderRightWidth(value);
    }, valueConverter: Length.parse
});
borderRightWidthProperty.register(Style);

export const borderBottomWidthProperty = new CssProperty<Style, Length>({
    name: "borderBottomWidth", cssName: "border-bottom-width", defaultValue: zeroLength, affectsLayout: isIOS, valueChanged: (target, newValue) => {
        let value = getEffectiveValue(0, layout.getDisplayDensity(), newValue);
        if (!isNonNegativeFiniteNumber(value)) {
            throw new Error(`border-bottom-width should be Non-Negative Finite number. Value: ${value}`);
        }
        target.effectiveBorderBottomWidth = value;
        let background = target.backgroundInternal;
        target.backgroundInternal = background.withBorderBottomWidth(value);
    }, valueConverter: Length.parse
});
borderBottomWidthProperty.register(Style);

export const borderLeftWidthProperty = new CssProperty<Style, Length>({
    name: "borderLeftWidth", cssName: "border-left-width", defaultValue: zeroLength, affectsLayout: isIOS, valueChanged: (target, newValue) => {
        let value = getEffectiveValue(0, layout.getDisplayDensity(), newValue);
        if (!isNonNegativeFiniteNumber(value)) {
            throw new Error(`border-left-width should be Non-Negative Finite number. Value: ${value}`);
        }
        target.effectiveBorderLeftWidth = value;
        let background = target.backgroundInternal;
        target.backgroundInternal = background.withBorderLeftWidth(value);
    }, valueConverter: Length.parse
});
borderLeftWidthProperty.register(Style);

// Border Radius properties.
export const borderRadiusProperty = new ShorthandProperty<Style>({
    name: "borderRadius", cssName: "border-radius",
    getter: function (this: Style) {
        if (this.borderTopLeftRadius === this.borderTopRightRadius &&
            this.borderTopLeftRadius === this.borderBottomRightRadius &&
            this.borderTopLeftRadius === this.borderBottomLeftRadius) {
            return this.borderTopLeftRadius + "";
        } else {
            return `${this.borderTopLeftRadius} ${this.borderTopRightRadius} ${this.borderBottomRightRadius} ${this.borderBottomLeftRadius}`;
        }
    },
    converter: function (value: string) {
        let borderRadius = parseThickness(value);
        return [
            [borderTopLeftRadiusProperty, borderRadius.top],
            [borderTopRightRadiusProperty, borderRadius.right],
            [borderBottomRightRadiusProperty, borderRadius.bottom],
            [borderBottomLeftRadiusProperty, borderRadius.left]
        ];
    }
})
borderRadiusProperty.register(Style);

export const borderTopLeftRadiusProperty = new CssProperty<Style, number>({
    name: "borderTopLeftRadius", cssName: "border-top-left-radius", defaultValue: 0, affectsLayout: isIOS, valueChanged: (target, newValue) => {
        let background = target.backgroundInternal;
        target.backgroundInternal = background.withBorderTopLeftRadius(newValue);
    }, valueConverter: isNonNegativeFiniteNumberConverter
});
borderTopLeftRadiusProperty.register(Style);

export const borderTopRightRadiusProperty = new CssProperty<Style, number>({
    name: "borderTopRightRadius", cssName: "border-top-right-radius", defaultValue: 0, affectsLayout: isIOS, valueChanged: (target, newValue) => {
        let background = target.backgroundInternal;
        target.backgroundInternal = background.withBorderTopRightRadius(newValue);
    }, valueConverter: isNonNegativeFiniteNumberConverter
});
borderTopRightRadiusProperty.register(Style);

export const borderBottomRightRadiusProperty = new CssProperty<Style, number>({
    name: "borderBottomRightRadius", cssName: "border-bottom-right-radius", defaultValue: 0, affectsLayout: isIOS, valueChanged: (target, newValue) => {
        let background = target.backgroundInternal;
        target.backgroundInternal = background.withBorderBottomLeftRadius(newValue);
    }, valueConverter: isNonNegativeFiniteNumberConverter
});
borderBottomRightRadiusProperty.register(Style);

export const borderBottomLeftRadiusProperty = new CssProperty<Style, number>({
    name: "borderBottomLeftRadius", cssName: "border-bottom-left-radius", defaultValue: 0, affectsLayout: isIOS, valueChanged: (target, newValue) => {
        let background = target.backgroundInternal;
        target.backgroundInternal = background.withBorderBottomRightRadius(newValue);
    }, valueConverter: isNonNegativeFiniteNumberConverter
});
borderBottomLeftRadiusProperty.register(Style);

function isNonNegativeFiniteNumber(value: number): boolean {
    return isFinite(value) && !isNaN(value) && value >= 0;
}

let supportedPaths = ["rect", "circle", "ellipse", "polygon"];
function isClipPathValid(value: string): boolean {
    if (!value) {
        return true;
    }
    let functionName = value.substring(0, value.indexOf("(")).trim();
    return supportedPaths.indexOf(functionName) !== -1;
}

export const clipPathProperty = new CssProperty<Style, string>({
    name: "clipPath", cssName: "clip-path", valueChanged: (target, newValue) => {
        if (!isClipPathValid(newValue)) {
            throw new Error("clip-path is not valid.");
        }

        let background = target.backgroundInternal;
        target.backgroundInternal = background.withClipPath(newValue);
    }
});
clipPathProperty.register(Style);

function isFloatValueConverter(value: string): number {
    let newValue = parseFloat(value);
    if (isNaN(newValue)) {
        throw new Error(`Invalid value: ${newValue}`);
    }

    return newValue;
}

export const zIndexProperty = new CssProperty<Style, number>({ name: "zIndex", cssName: "z-index", defaultValue: 0, valueConverter: isFloatValueConverter });
zIndexProperty.register(Style);

function opacityConverter(value: any): number {
    let newValue = parseFloat(value);
    if (!isNaN(newValue) && 0 <= newValue && newValue <= 1) {
        return newValue;
    }

    throw new Error(`Opacity should be between [0, 1]. Value: ${newValue}`);
}

function isOpacityValid(value: string): boolean {
    let parsedValue: number = parseFloat(value);
    return !isNaN(parsedValue) && 0 <= parsedValue && parsedValue <= 1;
}

export const opacityProperty = new CssProperty<Style, number>({ name: "opacity", cssName: "opacity", defaultValue: 1, valueConverter: opacityConverter });
opacityProperty.register(Style);

export const colorProperty = new InheritedCssProperty<Style, Color>({ name: "color", cssName: "color", equalityComparer: Color.equals, valueConverter: (v: string) => new Color(v) });
colorProperty.register(Style);


export let fontInternalProperty = new CssProperty<Style, Font>({ name: "fontInternal", cssName: "_fontInternal", defaultValue: Font.default });

export let fontFamilyProperty = new InheritedCssProperty<Style, string>({
    name: "fontFamily", cssName: "font-family", valueChanged: (target, newValue) => {
        let currentFont = target.fontInternal;
        if (currentFont.fontFamily !== newValue) {
            target.fontInternal = currentFont.withFontFamily(newValue);
        }
    }
});
fontFamilyProperty.register(Style);

export let fontSizeProperty = new InheritedCssProperty<Style, number>({
    name: "fontSize", cssName: "font-size", valueChanged: (target, newValue) => {
        let currentFont = target.fontInternal;
        if (currentFont.fontSize !== newValue) {
            target.fontInternal = currentFont.withFontSize(newValue);
        }
    },
    valueConverter: (v) => parseFloat(v)
});
fontSizeProperty.register(Style);

export let fontStyleProperty = new InheritedCssProperty<Style, "normal" | "italic">({
    name: "fontStyle", cssName: "font-style", defaultValue: "normal", valueChanged: (target, newValue) => {
        if (!(newValue === "normal" || newValue === "italic")) {
            throw new Error(`font-style should be 'normal' or 'italic'. value: ${newValue}`)
        }

        let currentFont = target.fontInternal;
        if (currentFont.fontStyle !== newValue) {
            target.fontInternal = currentFont.withFontStyle(newValue);
        }
    }
});
fontStyleProperty.register(Style);

export let fontWeightProperty = new InheritedCssProperty<Style, "100" | "200" | "300" | "normal" | "400" | "500" | "600" | "bold" | "700" | "800" | "900">({
    name: "fontWeight", cssName: "font-weight", defaultValue: "normal", valueChanged: (target, newValue) => {
        if (!newValue) {
            console.trace();
        }

        // TODO: Console.log errors or throw error?
        if (!(newValue === "normal" || newValue === "bold"
            || newValue === "100" || newValue === "200" || newValue === "300"
            || newValue === "400" || newValue === "500" || newValue === "600"
            || newValue === "700" || newValue === "800" || newValue === "900")) {
            throw new Error(`Invalid font-weight value: ${newValue}`);
        }

        let currentFont = target.fontInternal;
        if (currentFont.fontWeight !== newValue) {
            target.fontInternal = currentFont.withFontWeight(newValue);
        }
    }
});
fontWeightProperty.register(Style);

export let fontProperty = new ShorthandProperty<Style>({
    name: "font", cssName: "font",
    getter: function (this: Style) {
        return `${this.fontStyle} ${this.fontWeight} ${this.fontSize} ${this.fontFamily}`;
    },
    converter: function (value: string) {
        return parseFont(value);
    }
})
fontProperty.register(Style);

function parseFont(font: string): [CssProperty<any, any>, any][] {
    let fontSize: number;
    let fontFamily: string;
    let fontStyle: "normal" | "italic" = "normal";
    let fontWeight: string = "normal";

    let elements = font.split(/\s+/);
    let element: string;
    while (element = elements.shift()) {
        switch (element) {
            case "normal":
                break;

            // TODO: add support for oblique font style.
            case "italic":
                // case "oblique":
                fontStyle = "italic";
                break;

            case "100":
            case "200":
            case "300":
            case "normal":
            case "400":
            case "500":
            case "600":
            case "bold":
            case "700":
            case "800":
            case "900":
                fontWeight = element;
                break;

            default:
                if (!fontSize) {
                    let parts = element.split("/");
                    // TODO: add support for px support.
                    fontSize = parseFloat(parts[0]);
                    // TODO: add support for lineHeight.
                    // if (parts.length > 1) {
                    //     lineHeight = parts[1];
                    // }
                    break;
                }

                fontFamily = element;
            // if (elements.length) {
            //     fontFamily += " " + elements.join(" ");
            // }
        }
    }

    return [
        [fontStyleProperty, fontStyle],
        [fontWeightProperty, fontWeight],
        [fontSizeProperty, fontSize],
        [fontFamilyProperty, fontFamily]
    ]
}
