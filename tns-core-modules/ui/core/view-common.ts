import { View as ViewDefinition, Point, Size, Thickness } from "ui/core/view";
import { Style, CommonLayoutParams } from "ui/styling/style";
import { CssState, StyleScope, applyInlineSyle } from "ui/styling/style-scope";
import { VerticalAlignment, HorizontalAlignment } from "ui/enums";
import { Color } from "color";
import { Animation, AnimationPromise } from "ui/animation";
import { KeyframeAnimation } from "ui/animation/keyframe-animation";
import { Source } from "utils/debug";
import { Observable, EventData } from "data/observable";
import { ViewBase } from "./view-base";
import { propagateInheritedProperties, clearInheritedProperties, Property, InheritedProperty, CssProperty, ShorthandProperty } from "./properties";
import { isString, isNumber } from "utils/types";
import { observe, fromString, GesturesObserver, GestureTypes, GestureEventData } from "ui/gestures";
import { isAndroid, isIOS } from "platform";

import * as trace from "trace";
import * as utils from "utils/utils";
import bindable = require("ui/core/bindable");

// on Android we explicitly set AffectsLayout to False because android will invalidate its layout when needed so we skip unnecessary native calls.
let affectsIOSLayout = isIOS;

// registerSpecialProperty("class", (instance: ViewDefinition, propertyValue: string) => {
//     instance.className = propertyValue;
// });
// registerSpecialProperty("text", (instance, propertyValue) => {
//     instance.set("text", propertyValue);
// });

function getEventOrGestureName(name: string): string {
    return name.indexOf("on") === 0 ? name.substr(2, name.length - 2) : name;
}

export namespace layout {
    let MODE_SHIFT = 30;
    let MODE_MASK = 0x3 << MODE_SHIFT;

    export let UNSPECIFIED = 0 << MODE_SHIFT;
    export let EXACTLY = 1 << MODE_SHIFT;
    export let AT_MOST = 2 << MODE_SHIFT;

    export let MEASURED_HEIGHT_STATE_SHIFT = 0x00000010; /* 16 */
    export let MEASURED_STATE_TOO_SMALL = 0x01000000;
    export let MEASURED_STATE_MASK = 0xff000000;
    export let MEASURED_SIZE_MASK = 0x00ffffff;

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
export function isEventOrGesture(name: string, view: ViewDefinition): boolean {
    if (isString(name)) {
        let eventOrGestureName = getEventOrGestureName(name);
        let evt = `${eventOrGestureName}Event`;

        return view.constructor && evt in view.constructor ||
            fromString(eventOrGestureName.toLowerCase()) !== undefined;
    }

    return false;
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

function onCssClassPropertyChanged(view: ViewDefinition, oldValue: string, newValue: string) {
    let classes = view.cssClasses;
    classes.clear();
    if (isString(newValue)) {
        newValue.split(" ").forEach(c => classes.add(c));
    }
}

// let cssClassProperty = new Property("cssClass", "View", new PropertyMetadata(undefined, PropertyMetadataSettings.AffectsStyle, onCssClassPropertyChanged));
export let cssClassProperty = new Property<ViewCommon, string>({ name: "cssClass", valueChanged: onCssClassPropertyChanged });
cssClassProperty.register(ViewCommon);

// let classNameProperty = new Property("className", "View", new PropertyMetadata(undefined, PropertyMetadataSettings.AffectsStyle, onCssClassPropertyChanged));
export let classNameProperty = new Property<ViewCommon, string>({ name: "className", valueChanged: onCssClassPropertyChanged });
classNameProperty.register(ViewCommon);

function resetStyles(view: ViewCommon): void {
    // view.style._resetCssValues();
    // view._applyStyleFromScope();
    view._eachChildView((child) => {
        resetStyles(child);
        return true;
    });
}
// let idProperty = new Property("id", "View", new PropertyMetadata(undefined, PropertyMetadataSettings.AffectsStyle));
export let idProperty = new Property<ViewCommon, string>({ name: "id", valueChanged: (view, oldValue, newValue) => resetStyles(view) });
idProperty.register(ViewCommon);

// let automationTextProperty = new Property("automationText", "View", new PropertyMetadata(undefined));
export let automationTextProperty = new Property<ViewCommon, string>({ name: "automationText" });
automationTextProperty.register(ViewCommon);

// let originXProperty = new Property("originX", "View", new PropertyMetadata(0.5));
export let originXProperty = new Property<ViewCommon, number>({ name: "originX", defaultValue: 0.5 });
originXProperty.register(ViewCommon);

// let originYProperty = new Property("originY", "View", new PropertyMetadata(0.5));
export let originYProperty = new Property<ViewCommon, number>({ name: "originY", defaultValue: 0.5 });
originYProperty.register(ViewCommon);

// let isEnabledProperty = new Property("isEnabled", "View", new PropertyMetadata(true));
export let isEnabledProperty = new Property<ViewCommon, boolean>({ name: "isEnabled", defaultValue: true });
isEnabledProperty.register(ViewCommon);

// let isUserInteractionEnabledProperty = new Property("isUserInteractionEnabled", "View", new PropertyMetadata(true));
export let isUserInteractionEnabledProperty = new Property<ViewCommon, boolean>({ name: "isUserInteractionEnabled", defaultValue: true });
isUserInteractionEnabledProperty.register(ViewCommon);

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
    public isVisible = true;
    public parent: this;

    public layoutParams: CommonLayoutParams = {
        width: -1,
        widthPercent: -1,
        height: -1,
        heightPercent: -1,
        leftMargin: 0,
        leftMarginPercent: -1,
        topMargin: 0,
        topMarginPercent: -1,
        rightMargin: 0,
        rightMarginPercent: -1,
        bottomMargin: 0,
        bottomMarginPercent: -1,
        horizontalAlignment: "stretch",
        verticalAlignment: "stretch"
    };

    public getGestureObservers(type: GestureTypes): Array<GesturesObserver> {
        return this._gestureObservers[type];
    }








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

    public addEventListener(arg: string | GestureTypes, callback: (data: EventData) => void, thisArg?: any) {
        if (isString(arg)) {
            arg = getEventOrGestureName(<string>arg);

            let gesture = fromString(<string>arg);
            if (gesture && !this._isEvent(<string>arg)) {
                this.observe(gesture, callback, thisArg);
            } else {
                let events = (<string>arg).split(",");
                if (events.length > 0) {
                    for (let i = 0; i < events.length; i++) {
                        let evt = events[i].trim();
                        let gst = fromString(evt);
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
        } else if (isNumber(arg)) {
            this.observe(<GestureTypes>arg, callback, thisArg);
        }
    }

    public removeEventListener(arg: string | GestureTypes, callback?: any, thisArg?: any) {
        if (isString(arg)) {
            let gesture = fromString(<string>arg);
            if (gesture && !this._isEvent(<string>arg)) {
                this._disconnectGestureObservers(gesture);
            } else {
                let events = (<string>arg).split(",");
                if (events.length > 0) {
                    for (let i = 0; i < events.length; i++) {
                        let evt = events[i].trim();
                        let gst = fromString(evt);
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
        } else if (isNumber(arg)) {
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

    public automationText: string;

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

    get borderTopWidth(): number {
        return this.style.borderTopWidth;
    }
    set borderTopWidth(value: number) {
        this.style.borderTopWidth = value;
    }

    get borderRightWidth(): number {
        return this.style.borderRightWidth;
    }
    set borderRightWidth(value: number) {
        this.style.borderRightWidth = value;
    }

    get borderBottomWidth(): number {
        return this.style.borderBottomWidth;
    }
    set borderBottomWidth(value: number) {
        this.style.borderBottomWidth = value;
    }

    get borderLeftWidth(): number {
        return this.style.borderLeftWidth;
    }
    set borderLeftWidth(value: number) {
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

    get minWidth(): number {
        return this.style.minWidth;
    }
    set minWidth(value: number) {
        this.style.minWidth = value;
    }

    get minHeight(): number {
        return this.style.minHeight;
    }
    set minHeight(value: number) {
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

    get visibility(): string {
        return this.style.visibility;
    }
    set visibility(value: string) {
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

    public originX: number;
    public originY: number;
    public isEnabled: boolean;
    public isUserInteractionEnabled: boolean;
    public id: string;
    public cssClass: string;
    public className: string;

    // get style(): Style {
    //     return this._style;
    // }
    // set style(value) {
    //     throw new Error("View.style property is read-only.");
    // }

    get isLayoutRequired(): boolean {
        return true;
    }

    get isLayoutValid(): boolean {
        return this._isLayoutValid;
    }
    set isLayoutValid(value: boolean) {
        throw new Error("isLayoutValid is read-only property.");
    }

    get cssType(): string {
        if (!this._cssType) {
            this._cssType = this.typeName.toLowerCase();
        }
        return this._cssType;
    }

    // get parent(): ViewCommon {
    //     return this.parent;
    // }

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
        return this._measuredWidth & utils.layout.MEASURED_SIZE_MASK || 0;
    }

    public getMeasuredHeight(): number {
        return this._measuredHeight & utils.layout.MEASURED_SIZE_MASK || 0;
    }

    public getMeasuredState(): number {
        return (this._measuredWidth & utils.layout.MEASURED_STATE_MASK)
            | ((this._measuredHeight >> utils.layout.MEASURED_HEIGHT_STATE_SHIFT)
                & (utils.layout.MEASURED_STATE_MASK >> utils.layout.MEASURED_HEIGHT_STATE_SHIFT));
    }

    public setMeasuredDimension(measuredWidth: number, measuredHeight: number): void {
        this._measuredWidth = measuredWidth;
        this._measuredHeight = measuredHeight;
        if (trace.enabled) {
            trace.write(this + " :setMeasuredDimension: " + measuredWidth + ", " + measuredHeight, trace.categories.Layout);
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
            case utils.layout.UNSPECIFIED:
                result = size;
                break;

            case utils.layout.AT_MOST:
                if (specSize < size) {
                    result = Math.round(specSize + 0.499) | utils.layout.MEASURED_STATE_TOO_SMALL;
                }
                break;

            case utils.layout.EXACTLY:
                result = specSize;
                break;
        }

        return Math.round(result + 0.499) | (childMeasuredState & utils.layout.MEASURED_STATE_MASK);
    }

    public static combineMeasuredStates(curState: number, newState): number {
        return curState | newState;
    }

    public static layoutChild(parent: ViewDefinition, child: ViewDefinition, left: number, top: number, right: number, bottom: number): void {
        if (!child || !child.isVisible) {
            return;
        }

        let childStyle = child.style;

        let childTop: number;
        let childLeft: number;

        let childWidth = child.getMeasuredWidth();
        let childHeight = child.getMeasuredHeight();

        let vAlignment: string;
        if (childStyle.height.effectiveValue >= 0 && childStyle.verticalAlignment === VerticalAlignment.stretch) {
            vAlignment = VerticalAlignment.center;
        }
        else {
            vAlignment = childStyle.verticalAlignment;
        }

        let marginTop = childStyle.marginTop;
        let marginBottom = childStyle.marginBottom;
        let marginLeft = childStyle.marginLeft;
        let marginRight = childStyle.marginRight;

        switch (vAlignment) {
            case VerticalAlignment.top:
                childTop = top + marginTop.effectiveValue;
                break;

            case VerticalAlignment.center:
            case VerticalAlignment.middle:
                childTop = top + (bottom - top - childHeight + (marginTop.effectiveValue - marginBottom.effectiveValue)) / 2;
                break;

            case VerticalAlignment.bottom:
                childTop = bottom - childHeight - marginBottom.effectiveValue;
                break;

            case VerticalAlignment.stretch:
            default:
                childTop = top + marginTop.effectiveValue;
                childHeight = bottom - top - (marginTop.effectiveValue + marginBottom.effectiveValue);
                break;
        }

        let hAlignment: string;
        if (childStyle.width.effectiveValue >= 0 && childStyle.horizontalAlignment === HorizontalAlignment.stretch) {
            hAlignment = HorizontalAlignment.center;
        }
        else {
            hAlignment = childStyle.horizontalAlignment;
        }

        switch (hAlignment) {
            case HorizontalAlignment.left:
                childLeft = left + marginLeft.effectiveValue;
                break;

            case HorizontalAlignment.center:
                childLeft = left + (right - left - childWidth + (marginLeft.effectiveValue - marginRight.effectiveValue)) / 2;
                break;

            case HorizontalAlignment.right:
                childLeft = right - childWidth - marginRight.effectiveValue;
                break;

            case HorizontalAlignment.stretch:
            default:
                childLeft = left + marginLeft.effectiveValue;
                childWidth = right - left - (marginLeft.effectiveValue + marginRight.effectiveValue);
                break;
        }

        let childRight = Math.round(childLeft + childWidth);
        let childBottom = Math.round(childTop + childHeight);
        childLeft = Math.round(childLeft);
        childTop = Math.round(childTop);

        if (trace.enabled) {
            trace.write(child.parent + " :layoutChild: " + child + " " + childLeft + ", " + childTop + ", " + childRight + ", " + childBottom, trace.categories.Layout);
        }

        child.layout(childLeft, childTop, childRight, childBottom);
    }

    public static measureChild(parent: ViewCommon, child: ViewCommon, widthMeasureSpec: number, heightMeasureSpec: number): { measuredWidth: number; measuredHeight: number } {
        let measureWidth = 0;
        let measureHeight = 0;

        if (child && child.isVisible) {
            let density = layout.getDisplayDensity();
            let width = layout.getMeasureSpecSize(widthMeasureSpec);
            let widthMode = layout.getMeasureSpecMode(widthMeasureSpec);

            let height = layout.getMeasureSpecSize(heightMeasureSpec);
            let heightMode = layout.getMeasureSpecMode(heightMeasureSpec);

            let parentWidthMeasureSpec = parent._currentWidthMeasureSpec;
            updateChildLayoutParams(child, parent, density);

            let style = child.style;
            let horizontalMargins = style.marginLeft.effectiveValue + style.marginRight.effectiveValue;
            let verticalMargins = style.marginTop.effectiveValue + style.marginRight.effectiveValue;

            let childWidthMeasureSpec = ViewCommon.getMeasureSpec(width, widthMode, horizontalMargins, style.width.effectiveValue, style.horizontalAlignment === HorizontalAlignment.stretch);
            let childHeightMeasureSpec = ViewCommon.getMeasureSpec(height, heightMode, verticalMargins, style.height.effectiveValue, style.verticalAlignment === VerticalAlignment.stretch);

            if (trace.enabled) {
                trace.write(child.parent + " :measureChild: " + child + " " + layout.measureSpecToString(childWidthMeasureSpec) + ", " + layout.measureSpecToString(childHeightMeasureSpec), trace.categories.Layout);
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

    // protected static restoreChildOriginalParams(view: ViewDefinition): void {
    //     if (!view) {
    //         return;
    //     }

    //     let lp: CommonLayoutParams = view.layoutParams;
    //     if (lp.widthPercent > 0) {
    //         lp.width = -1;
    //     }

    //     if (lp.heightPercent > 0) {
    //         lp.height = -1;
    //     }
    //     if (lp.leftMarginPercent > 0) {
    //         lp.leftMargin = 0;
    //     }
    //     if (lp.topMarginPercent > 0) {
    //         lp.topMargin = 0;
    //     }
    //     if (lp.rightMarginPercent > 0) {
    //         lp.rightMargin = 0;
    //     }
    //     if (lp.bottomMarginPercent > 0) {
    //         lp.bottomMargin = 0;
    //     }
    // }

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
        if (isString(inlineStyle)) {
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
        if (trace.enabled) {
            trace.write(`${this}._addView(${view}, ${atIndex})`, trace.categories.ViewHierarchy);
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
        if (trace.enabled) {
            trace.write(`${this}._removeView(${view})`, trace.categories.ViewHierarchy);
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
        if (trace.enabled) {
            trace.write(this + " going to state: " + state, trace.categories.Style);
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
        if (!isString(style)) {
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
            width: utils.layout.toDeviceIndependentPixels(currentBounds.right - currentBounds.left),
            height: utils.layout.toDeviceIndependentPixels(currentBounds.bottom - currentBounds.top),
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

function updateEffectiveValues(prentAvailableLength: number, density: number, ...params: Length[]): void {
    for (let param of params) {
        switch (param.unit) {
            case "%":
                param.effectiveValue = Math.round(prentAvailableLength * param.value);
                break;

            case "dip":
                param.effectiveValue = Math.round(density * param.value);
                break;

            case "px":
            default:
                param.effectiveValue = Math.round(param.value);
                break;
        }
    }
}

function updateChildLayoutParams(child: ViewCommon, parent: ViewCommon, density: number): void {
    let style = child.style;

    let parentWidthMeasureSpec = parent._currentWidthMeasureSpec;
    let parentWidthMeasureSize = layout.getMeasureSpecSize(parentWidthMeasureSpec);
    let parentWidthMeasureMode = layout.getMeasureSpecMode(parentWidthMeasureSpec);
    let parentAvailableWidth = parentWidthMeasureMode === utils.layout.UNSPECIFIED ? -1 : parentWidthMeasureSize;
    updateEffectiveValues(parentAvailableWidth, density, style.width, style.marginLeft, style.marginRight);

    let parentHeightMeasureSpec = parent._currentHeightMeasureSpec;
    let parentHeightMeasureSize = layout.getMeasureSpecSize(parentHeightMeasureSpec);
    let parentHeightMeasureMode = layout.getMeasureSpecMode(parentHeightMeasureSpec);
    let parentAvailableHeight = parentHeightMeasureMode === utils.layout.UNSPECIFIED ? -1 : parentHeightMeasureSize;
    updateEffectiveValues(parentAvailableHeight, density, style.height, style.marginTop, style.marginBottom);
}

interface Length {
    readonly unit: "%" | "dip" | "px";
    readonly value: number;
    effectiveValue: number;
}

export namespace Length {
    export function parse(value: string | Length): Length {
        let numberValue = 0;
        let type: "%" | "dip" | "px";
        if (typeof value === "string") {
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
                if (stringValue.indexOf("px")) {
                    type = "px";
                    stringValue = stringValue.replace("px", "").trim();
                } else {
                    type = "dip";
                }

                numberValue = parseFloat(stringValue);
            }

            if (isNaN(numberValue) || !isFinite(numberValue) || numberValue < 0) {
                throw new Error("Invalid value: " + value);
            }

            return {
                value: numberValue,
                unit: type,
                effectiveValue: undefined
            }
        } else {
            return value;
        }
    }
}

function minWidthMinHeightConverter(value: string | number): number {
    let newValue: number = typeof value === "string" ? parseFloat(value) : value;
    if (isNaN(newValue) || value < 0.0 || !isFinite(newValue)) {
        throw new Error(`Invalid value: ${newValue}`);
    }

    return newValue;
}

// TODO: Use different converter that calls isMinWidthHeightValid.
export let minWidthProperty = new CssProperty<Style, number>({ name: "minWidth", cssName: "min-width", defaultValue: 0, affectsLayout: affectsIOSLayout, valueConverter: minWidthMinHeightConverter });
minWidthProperty.register(Style);
// export let minWidthProperty = new styleProperty.Property("minWidth", "min-width",
//     new PropertyMetadata(0, AffectsLayout, null, isMinWidthHeightValid), numberConverter);

export let minHeightProperty = new CssProperty<Style, number>({ name: "minHeight", cssName: "min-height", defaultValue: 0, affectsLayout: affectsIOSLayout, valueConverter: minWidthMinHeightConverter });
minHeightProperty.register(Style);
// export let minHeightProperty = new styleProperty.Property("minHeight", "min-height",
//     new PropertyMetadata(0, AffectsLayout, null, isMinWidthHeightValid), numberConverter);

export let widthProperty = new CssProperty<Style, Length>({ name: "width", cssName: "width", defaultValue: Length.parse("-1"), affectsLayout: affectsIOSLayout, valueConverter: Length.parse });
widthProperty.register(Style);
// export let widthProperty = new styleProperty.Property("width", "width",
//     new PropertyMetadata(Number.NaN, AffectsLayout, onLayoutParamsChanged, isWidthHeightValid), numberOrPercentConverter);

export let heightProperty = new CssProperty<Style, Length>({ name: "height", cssName: "height", defaultValue: Length.parse("-1"), affectsLayout: affectsIOSLayout, valueConverter: Length.parse });
heightProperty.register(Style);
// export let heightProperty = new styleProperty.Property("height", "height",
//     new PropertyMetadata(Number.NaN, AffectsLayout, onLayoutParamsChanged, isWidthHeightValid), numberOrPercentConverter);

export let marginProperty = new ShorthandProperty<Style>({
    name: "margin", cssName: "margin",
    getter: () => { return `${this.marginTop} ${this.marginRight} ${this.marginBottom} ${this.marginLeft}`; },
    converter: convertToMargins
});
marginProperty.register(Style);

export let marginLeftProperty = new CssProperty<Style, Length>({ name: "marginLeft", cssName: "margin-left", defaultValue: Length.parse("0"), affectsLayout: affectsIOSLayout, valueConverter: Length.parse });
marginLeftProperty.register(Style);
// export let marginLeftProperty = new styleProperty.Property("marginLeft", "margin-left",
//     new PropertyMetadata(0, AffectsLayout, onLayoutParamsChanged, isMarginValid), numberOrPercentConverter);

export let marginRightProperty = new CssProperty<Style, Length>({ name: "marginRight", cssName: "margin-right", defaultValue: Length.parse("0"), affectsLayout: affectsIOSLayout, valueConverter: Length.parse });
marginRightProperty.register(Style);
// export let marginRightProperty = new styleProperty.Property("marginRight", "margin-right",
//     new PropertyMetadata(0, AffectsLayout, onLayoutParamsChanged, isMarginValid), numberOrPercentConverter);

export let marginTopProperty = new CssProperty<Style, Length>({ name: "marginTop", cssName: "margin-top", defaultValue: Length.parse("0"), affectsLayout: affectsIOSLayout, valueConverter: Length.parse });
marginTopProperty.register(Style);
// export let marginTopProperty = new styleProperty.Property("marginTop", "margin-top",
//     new PropertyMetadata(0, AffectsLayout, onLayoutParamsChanged, isMarginValid), numberOrPercentConverter);

export let marginBottomProperty = new CssProperty<Style, Length>({ name: "marginBottom", cssName: "margin-bottom", defaultValue: Length.parse("0"), affectsLayout: affectsIOSLayout, valueConverter: Length.parse });
marginBottomProperty.register(Style);
// export let marginBottomProperty = new styleProperty.Property("marginBottom", "margin-bottom",
//     new PropertyMetadata(0, AffectsLayout, onLayoutParamsChanged, isMarginValid), numberOrPercentConverter);

export let paddingProperty = new ShorthandProperty<Style>({
    name: "padding", cssName: "padding",
    getter: () => { return `${this.paddingTop} ${this.paddingRight} ${this.paddingBottom} ${this.paddingLeft}`; },
    converter: convertToPaddings
});
paddingProperty.register(Style);

export let paddingLeftProperty = new CssProperty<Style, Length>({ name: "paddingLeft", cssName: "padding-left", defaultValue: Length.parse("0"), affectsLayout: affectsIOSLayout, valueConverter: Length.parse });
paddingLeftProperty.register(Style);
// export let paddingLeftProperty = new styleProperty.Property("paddingLeft", "padding-left",
//     new PropertyMetadata(defaultPadding, AffectsLayout, onPaddingValueChanged, isNonNegativeFiniteNumber), numberConverter);

export let paddingRightProperty = new CssProperty<Style, Length>({ name: "paddingRight", cssName: "padding-right", defaultValue: Length.parse("0"), affectsLayout: affectsIOSLayout, valueConverter: Length.parse });
paddingRightProperty.register(Style);
// export let paddingRightProperty = new styleProperty.Property("paddingRight", "padding-right",
//     new PropertyMetadata(defaultPadding, AffectsLayout, onPaddingValueChanged, isNonNegativeFiniteNumber), numberConverter);

export let paddingTopProperty = new CssProperty<Style, Length>({ name: "paddingTop", cssName: "padding-top", defaultValue: Length.parse("0"), affectsLayout: affectsIOSLayout, valueConverter: Length.parse });
paddingTopProperty.register(Style);
// export let paddingTopProperty = new styleProperty.Property("paddingTop", "padding-top",
//     new PropertyMetadata(defaultPadding, AffectsLayout, onPaddingValueChanged, isNonNegativeFiniteNumber), numberConverter);

export let paddingBottomProperty = new CssProperty<Style, Length>({ name: "paddingBottom", cssName: "padding-bottom", defaultValue: Length.parse("0"), affectsLayout: affectsIOSLayout, valueConverter: Length.parse });
paddingBottomProperty.register(Style);
// export let paddingBottomProperty = new styleProperty.Property("paddingBottom", "padding-bottom",
//     new PropertyMetadata(defaultPadding, AffectsLayout, onPaddingValueChanged, isNonNegativeFiniteNumber), numberConverter);

export let verticalAlignmentProperty = new CssProperty<Style, string>({ name: "verticalAlignment", cssName: "vertical-align", defaultValue: VerticalAlignment.stretch, affectsLayout: affectsIOSLayout });
verticalAlignmentProperty.register(Style);
// export let verticalAlignmentProperty = new styleProperty.Property("verticalAlignment", "vertical-align",
//     new PropertyMetadata(VerticalAlignment.stretch, AffectsLayout, onLayoutParamsChanged));

export let horizontalAlignmentProperty = new CssProperty<Style, string>({ name: "horizontalAlignment", cssName: "horizontal-align", defaultValue: HorizontalAlignment.stretch, affectsLayout: affectsIOSLayout });
horizontalAlignmentProperty.register(Style);
// export let horizontalAlignmentProperty = new styleProperty.Property("horizontalAlignment", "horizontal-align",
//     new PropertyMetadata(HorizontalAlignment.stretch, AffectsLayout, onLayoutParamsChanged));

function parseThickness(value: string): Thickness {
    if (typeof value === "string") {
        let arr = value.split(/[ ,]+/);

        let top: Length;
        let right: Length;
        let bottom: Length;
        let left: Length;

        if (arr.length === 1) {
            top = Length.parse(arr[0]);
            right = Length.parse(arr[0]);
            bottom = Length.parse(arr[0]);
            left = Length.parse(arr[0]);
        }
        else if (arr.length === 2) {
            top = Length.parse(arr[0]);
            bottom = Length.parse(arr[0]);
            right = Length.parse(arr[1]);
            left = Length.parse(arr[1]);
        }
        else if (arr.length === 3) {
            top = Length.parse(arr[0]);
            right = Length.parse(arr[1]);
            left = Length.parse(arr[1]);
            bottom = Length.parse(arr[2]);
        }
        else if (arr.length === 4) {
            top = Length.parse(arr[0]);
            right = Length.parse(arr[1]);
            bottom = Length.parse(arr[2]);
            left = Length.parse(arr[3]);
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
        [marginTopProperty, thickness.top],
        [marginRightProperty, thickness.right],
        [marginBottomProperty, thickness.bottom],
        [marginLeftProperty, thickness.left]
    ];
}

function convertToPaddings(this: Style, value: string): [CssProperty<any, any>, any][] {
    let thickness = parseThickness(value);
    return [
        [paddingTopProperty, thickness.top],
        [paddingRightProperty, thickness.right],
        [paddingBottomProperty, thickness.bottom],
        [paddingLeftProperty, thickness.left]
    ];
}
