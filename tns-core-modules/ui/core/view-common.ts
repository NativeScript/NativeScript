import types = require("utils/types");
import definition = require("ui/core/view");
import {Style} from "ui/styling/style";
import trace = require("trace");
import gestures = require("ui/gestures");
import styleScope = require("../styling/style-scope");
import {VerticalAlignment, HorizontalAlignment} from "ui/enums";
import utils = require("utils/utils");
import {Color} from "color";
import {KeyframeAnimation} from "ui/animation/keyframe-animation";
import * as animModule from "ui/animation";
import {CssState} from "ui/styling/style-scope";
import {Source} from "utils/debug";
import {Observable, EventData} from "data/observable";
import {ViewBase} from "./view-base";

import {propagateInheritedProperties, clearInheritedProperties, applyNativeSetters, Property, InheritedProperty} from "./properties";
import bindable = require("ui/core/bindable");
// registerSpecialProperty("class", (instance: definition.View, propertyValue: string) => {
//     instance.className = propertyValue;
// });
// registerSpecialProperty("text", (instance, propertyValue) => {
//     instance.set("text", propertyValue);
// });


let animationModule: typeof animModule;
function ensureAnimationModule() {
    if (!animationModule) {
        animationModule = require("ui/animation");
    }
}

function getEventOrGestureName(name: string): string {
    return name.indexOf("on") === 0 ? name.substr(2, name.length - 2) : name;
}

export function isEventOrGesture(name: string, view: View): boolean {
    if (types.isString(name)) {
        var eventOrGestureName = getEventOrGestureName(name);
        var evt = `${eventOrGestureName}Event`;

        return view.constructor && evt in view.constructor ||
            gestures.fromString(eventOrGestureName.toLowerCase()) !== undefined;
    }

    return false;
}

export function getViewById(view: View, id: string): View {
    if (!view) {
        return undefined;
    }

    if (view.id === id) {
        return view;
    }

    var retVal: View;
    var descendantsCallback = function (child: View): boolean {
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

export function eachDescendant(view: definition.View, callback: (child: View) => boolean) {
    if (!callback || !view) {
        return;
    }

    var continueIteration: boolean;
    var localCallback = function (child: View): boolean {
        continueIteration = callback(child);
        if (continueIteration) {
            child._eachChildView(localCallback);
        }
        return continueIteration;
    }

    view._eachChildView(localCallback);
}

export function getAncestor(view: View, criterion: string | Function): definition.View {
    let matcher: (view: definition.View) => boolean = null;
    if (typeof criterion === "string") {
        matcher = (view: definition.View) => view.typeName === criterion;
    } else {
        matcher = (view: definition.View) => view instanceof criterion;
    }

    for (let parent = view.parent; parent != null; parent = parent.parent) {
        if (matcher(parent)) {
            return parent;
        }
    }

    return null;
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

function onCssClassPropertyChanged(view: View, oldValue: string, newValue: string) {
    let classes = view.cssClasses;
    classes.clear();
    if (types.isString(newValue)) {
        newValue.split(" ").forEach(c => classes.add(c));
    }
}

// var cssClassProperty = new Property("cssClass", "View", new PropertyMetadata(undefined, PropertyMetadataSettings.AffectsStyle, onCssClassPropertyChanged));
let cssClassProperty = new Property<View, string>({ name: "cssClass", valueChanged: onCssClassPropertyChanged });
cssClassProperty.register(View);

// var classNameProperty = new Property("className", "View", new PropertyMetadata(undefined, PropertyMetadataSettings.AffectsStyle, onCssClassPropertyChanged));
let classNameProperty = new Property<View, string>({ name: "className", valueChanged: onCssClassPropertyChanged });
classNameProperty.register(View);

function resetStyles(view: View): void {
    // view.style._resetCssValues();
    // view._applyStyleFromScope();
    view._eachChildView((child) => {
        resetStyles(child);
        return true;
    });
}
// var idProperty = new Property("id", "View", new PropertyMetadata(undefined, PropertyMetadataSettings.AffectsStyle));
let idProperty = new Property<View, string>({ name: "id", valueChanged: (view, oldValue, newValue) => resetStyles(view) });
idProperty.register(View);

// var automationTextProperty = new Property("automationText", "View", new PropertyMetadata(undefined));
let automationTextProperty = new Property<View, string>({ name: "automationText" });
automationTextProperty.register(View);

// var originXProperty = new Property("originX", "View", new PropertyMetadata(0.5));
let originXProperty = new Property<View, number>({ name: "originX", defaultValue: 0.5 });
originXProperty.register(View);

// var originYProperty = new Property("originY", "View", new PropertyMetadata(0.5));
let originYProperty = new Property<View, number>({ name: "originY", defaultValue: 0.5 });
originYProperty.register(View);

// var isEnabledProperty = new Property("isEnabled", "View", new PropertyMetadata(true));
let isEnabledProperty = new Property<View, boolean>({ name: "isEnabled", defaultValue: true });
isEnabledProperty.register(View);

// var isUserInteractionEnabledProperty = new Property("isUserInteractionEnabled", "View", new PropertyMetadata(true));
let isUserInteractionEnabledProperty = new Property<View, boolean>({ name: "isUserInteractionEnabled", defaultValue: true });
isUserInteractionEnabledProperty.register(View);

let bindingContextProperty = new InheritedProperty<View, any>({ name: "bindingContext" })
bindingContextProperty.register(View);

let defaultBindingSource = {};

export class View extends ViewBase implements definition.View {
    public static loadedEvent = "loaded";
    public static unloadedEvent = "unloaded";

    public static automationTextProperty = automationTextProperty;
    public static idProperty = idProperty;
    public static cssClassProperty = cssClassProperty;
    public static classNameProperty = classNameProperty;
    public static originXProperty = originXProperty;
    public static originYProperty = originYProperty;
    public static isEnabledProperty = isEnabledProperty;
    public static isUserInteractionEnabledProperty = isUserInteractionEnabledProperty;

    private _measuredWidth: number = Number.NaN;
    private _measuredHeight: number = Number.NaN;

    private _oldWidthMeasureSpec: number = Number.NaN;
    private _oldHeightMeasureSpec: number = Number.NaN;
    private _oldLeft: number = 0;
    private _oldTop: number = 0;
    private _oldRight: number = 0;
    private _oldBottom: number = 0;

    private _parent: View;

    private _visualState: string;
    private _isLoaded: boolean;
    private _isLayoutValid: boolean = false;
    private _cssType: string;

    private _updatingInheritedProperties: boolean;
    private _registeredAnimations: Array<KeyframeAnimation>;

    public _domId: number;
    public _isAddedToNativeVisualTree = false;
    public _gestureObservers = {};

    public cssClasses: Set<string> = new Set();
    public cssPseudoClasses: Set<string> = new Set();

    public _cssState: CssState;
    public isVisible = true;



    public getGestureObservers(type: gestures.GestureTypes): Array<gestures.GesturesObserver> {
        return this._gestureObservers[type];
    }








    constructor() {
        super();

        this._domId = viewIdCounter++;
        this._goToVisualState("normal");
    }

    observe(type: gestures.GestureTypes, callback: (args: gestures.GestureEventData) => void, thisArg?: any): void {
        if (!this._gestureObservers[type]) {
            this._gestureObservers[type] = [];
        }

        this._gestureObservers[type].push(gestures.observe(this, type, callback, thisArg));
    }

    public addEventListener(arg: string | gestures.GestureTypes, callback: (data: EventData) => void, thisArg?: any) {
        if (types.isString(arg)) {
            arg = getEventOrGestureName(<string>arg);

            let gesture = gestures.fromString(<string>arg);
            if (gesture && !this._isEvent(<string>arg)) {
                this.observe(gesture, callback, thisArg);
            } else {
                let events = (<string>arg).split(",");
                if (events.length > 0) {
                    for (let i = 0; i < events.length; i++) {
                        let evt = events[i].trim();
                        let gst = gestures.fromString(evt);
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
        } else if (types.isNumber(arg)) {
            this.observe(<gestures.GestureTypes>arg, callback, thisArg);
        }
    }

    public removeEventListener(arg: string | gestures.GestureTypes, callback?: any, thisArg?: any) {
        if (types.isString(arg)) {
            let gesture = gestures.fromString(<string>arg);
            if (gesture && !this._isEvent(<string>arg)) {
                this._disconnectGestureObservers(gesture);
            } else {
                let events = (<string>arg).split(",");
                if (events.length > 0) {
                    for (let i = 0; i < events.length; i++) {
                        let evt = events[i].trim();
                        let gst = gestures.fromString(evt);
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
        } else if (types.isNumber(arg)) {
            this._disconnectGestureObservers(<gestures.GestureTypes>arg);
        }
    }

    public eachChild(callback: (child: View) => boolean): void {
        this._eachChildView(callback);
    }

    private _isEvent(name: string): boolean {
        return this.constructor && `${name}Event` in this.constructor;
    }

    private _disconnectGestureObservers(type: gestures.GestureTypes): void {
        var observers = this.getGestureObservers(type);
        if (observers) {
            for (let i = 0; i < observers.length; i++) {
                observers[i].disconnect();
            }
        }
    }

    getViewById<T extends View>(id: string): T {
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

    get width(): number {
        return this.style.width;
    }
    set width(value: number) {
        this.style.width = value;
    }

    get height(): number {
        return this.style.height;
    }
    set height(value: number) {
        this.style.height = value;
    }

    get margin(): string {
        return this.style.margin;
    }
    set margin(value: string) {
        this.style.margin = value;
    }

    get marginLeft(): number {
        return this.style.marginLeft;
    }
    set marginLeft(value: number) {
        this.style.marginLeft = value;
    }

    get marginTop(): number {
        return this.style.marginTop;
    }
    set marginTop(value: number) {
        this.style.marginTop = value;
    }

    get marginRight(): number {
        return this.style.marginRight;
    }
    set marginRight(value: number) {
        this.style.marginRight = value;
    }

    get marginBottom(): number {
        return this.style.marginBottom;
    }
    set marginBottom(value: number) {
        this.style.marginBottom = value;
    }

    get horizontalAlignment(): string {
        return this.style.horizontalAlignment;
    }
    set horizontalAlignment(value: string) {
        this.style.horizontalAlignment = value;
    }

    get verticalAlignment(): string {
        return this.style.verticalAlignment;
    }
    set verticalAlignment(value: string) {
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


    get page(): definition.View {
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

    get parent(): View {
        return this._parent;
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
            var eachChild = function (child: View): boolean {
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
            this._eachChildView((child) => {
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
    //     var parentView: View;
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

    public onMeasure(widthMeasureSpec: number, heightMeasureSpec: number): void {
        //
    }

    public onLayout(left: number, top: number, right: number, bottom: number): void {
        //
    }

    public layoutNativeView(left: number, top: number, right: number, bottom: number): void {
        //
    }

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
        var result = size;
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

    public static layoutChild(parent: View, child: View, left: number, top: number, right: number, bottom: number): void {
        if (!child || !child.isVisible) {
            return;
        }

        let density = utils.layout.getDisplayDensity();
        let childStyle = child.style;

        let childTop: number;
        let childLeft: number;

        let childWidth = child.getMeasuredWidth();
        let childHeight = child.getMeasuredHeight();

        let vAlignment: string;
        if (childStyle.height >= 0 && childStyle.verticalAlignment === VerticalAlignment.stretch) {
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
                childTop = top + marginTop * density;
                break;

            case VerticalAlignment.center:
            case VerticalAlignment.middle:
                childTop = top + (bottom - top - childHeight + (marginTop - marginBottom) * density) / 2;
                break;

            case VerticalAlignment.bottom:
                childTop = bottom - childHeight - (marginBottom * density);
                break;

            case VerticalAlignment.stretch:
            default:
                childTop = top + marginTop * density;
                childHeight = bottom - top - (marginTop + marginBottom) * density;
                break;
        }

        let hAlignment: string;
        if (childStyle.width >= 0 && childStyle.horizontalAlignment === HorizontalAlignment.stretch) {
            hAlignment = HorizontalAlignment.center;
        }
        else {
            hAlignment = childStyle.horizontalAlignment;
        }

        switch (hAlignment) {
            case HorizontalAlignment.left:
                childLeft = left + marginLeft * density;
                break;

            case HorizontalAlignment.center:
                childLeft = left + (right - left - childWidth + (marginLeft - marginRight) * density) / 2;
                break;

            case HorizontalAlignment.right:
                childLeft = right - childWidth - (marginRight * density);
                break;

            case HorizontalAlignment.stretch:
            default:
                childLeft = left + marginLeft * density;
                childWidth = right - left - (marginLeft + marginRight) * density;
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

    public static measureChild(parent: View, child: View, widthMeasureSpec: number, heightMeasureSpec: number): { measuredWidth: number; measuredHeight: number } {
        let measureWidth = 0;
        let measureHeight = 0;

        if (child && child.isVisible) {
            let width = utils.layout.getMeasureSpecSize(widthMeasureSpec);
            let widthMode = utils.layout.getMeasureSpecMode(widthMeasureSpec);

            let height = utils.layout.getMeasureSpecSize(heightMeasureSpec);
            let heightMode = utils.layout.getMeasureSpecMode(heightMeasureSpec);

            let childWidthMeasureSpec = View.getMeasureSpec(child, width, widthMode, true);
            let childHeightMeasureSpec = View.getMeasureSpec(child, height, heightMode, false);

            if (trace.enabled) {
                trace.write(child.parent + " :measureChild: " + child + " " + utils.layout.measureSpecToString(childWidthMeasureSpec) + ", " + utils.layout.measureSpecToString(childHeightMeasureSpec), trace.categories.Layout);
            }

            child.measure(childWidthMeasureSpec, childHeightMeasureSpec);
            measureWidth = child.getMeasuredWidth();
            measureHeight = child.getMeasuredHeight();

            let density = utils.layout.getDisplayDensity();
            let childStyle = child.style;

            // Convert to pixels.
            measureWidth = Math.round(measureWidth + (childStyle.marginLeft + childStyle.marginRight) * density);
            measureHeight = Math.round(measureHeight + (childStyle.marginTop + childStyle.marginBottom) * density);
        }

        return { measuredWidth: measureWidth, measuredHeight: measureHeight };
    }

    private static getMeasureSpec(view: View, parentLength: number, parentSpecMode: number, horizontal: boolean): number {
        let childStyle = view.style;

        let density = utils.layout.getDisplayDensity();
        let margins = horizontal ? childStyle.marginLeft + childStyle.marginRight : childStyle.marginTop + childStyle.marginBottom;
        margins = Math.round(margins * density);

        let resultSize = 0;
        let resultMode = 0;

        let measureLength = Math.max(0, parentLength - margins);

        // Convert to pixels.
        let childLength = Math.round((horizontal ? childStyle.width : childStyle.height) * density);

        // We want a specific size... let be it.
        if (childLength >= 0) {
            if (parentSpecMode !== utils.layout.UNSPECIFIED) {
                resultSize = Math.min(parentLength, childLength);
            }
            else {
                resultSize = childLength;
            }

            resultMode = utils.layout.EXACTLY;
        }
        else {
            switch (parentSpecMode) {
                // Parent has imposed an exact size on us
                case utils.layout.EXACTLY:
                    resultSize = measureLength;
                    let stretched = horizontal ? childStyle.horizontalAlignment === HorizontalAlignment.stretch : childStyle.verticalAlignment === VerticalAlignment.stretch;

                    // if stretched - nativeView wants to be our size. So be it.
                    // else - nativeView wants to determine its own size. It can't be bigger than us.
                    resultMode = stretched ? utils.layout.EXACTLY : utils.layout.AT_MOST;
                    break;

                // Parent has imposed a maximum size on us
                case utils.layout.AT_MOST:
                    resultSize = measureLength;
                    resultMode = utils.layout.AT_MOST;
                    break;

                case utils.layout.UNSPECIFIED:
                    // Equivalent to measure with Infinity.
                    resultSize = 0;
                    resultMode = utils.layout.UNSPECIFIED;
                    break;
            }
        }

        return utils.layout.makeMeasureSpec(resultSize, resultMode);
    }

    _setCurrentMeasureSpecs(widthMeasureSpec: number, heightMeasureSpec: number): boolean {
        let changed: boolean = this._oldWidthMeasureSpec !== widthMeasureSpec || this._oldHeightMeasureSpec !== heightMeasureSpec;
        this._oldWidthMeasureSpec = widthMeasureSpec;
        this._oldHeightMeasureSpec = heightMeasureSpec;
        return changed;
    }

    protected static adjustChildLayoutParams(view: View, widthMeasureSpec: number, heightMeasureSpec: number): void {
        if (!view) {
            return;
        }

        let availableWidth = utils.layout.getMeasureSpecSize(widthMeasureSpec);
        let widthSpec = utils.layout.getMeasureSpecMode(widthMeasureSpec);

        let availableHeight = utils.layout.getMeasureSpecSize(heightMeasureSpec);
        let heightSpec = utils.layout.getMeasureSpecMode(heightMeasureSpec);

        let lp: CommonLayoutParams = view.style._getValue(style.nativeLayoutParamsProperty);

        if (widthSpec !== utils.layout.UNSPECIFIED) {
            if (lp.widthPercent > 0) {
                lp.width = Math.round(availableWidth * lp.widthPercent);
            }

            if (lp.leftMarginPercent > 0) {
                lp.leftMargin = Math.round(availableWidth * lp.leftMarginPercent);
            }

            if (lp.rightMarginPercent > 0) {
                lp.rightMargin = Math.round(availableWidth * lp.rightMarginPercent);
            }
        }

        if (heightSpec !== utils.layout.UNSPECIFIED) {
            if (lp.heightPercent > 0) {
                lp.height = Math.round(availableHeight * lp.heightPercent);
            }

            if (lp.topMarginPercent > 0) {
                lp.topMargin = Math.round(availableHeight * lp.topMarginPercent);
            }

            if (lp.bottomMarginPercent > 0) {
                lp.bottomMargin = Math.round(availableHeight * lp.bottomMarginPercent);
            }
        }
    }

    protected static restoreChildOriginalParams(view: View): void {
        if (!view) {
            return;
        }
        let lp: CommonLayoutParams = view.style._getValue(style.nativeLayoutParamsProperty);

        if (lp.widthPercent > 0) {
            lp.width = -1;
        }

        if (lp.heightPercent > 0) {
            lp.height = -1;
        }
        if (lp.leftMarginPercent > 0) {
            lp.leftMargin = 0;
        }
        if (lp.topMarginPercent > 0) {
            lp.topMargin = 0;
        }
        if (lp.rightMarginPercent > 0) {
            lp.rightMargin = 0;
        }
        if (lp.bottomMarginPercent > 0) {
            lp.bottomMargin = 0;
        }
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
        let scope: styleScope.StyleScope = (<any>rootPage)._getStyleScope();
        scope.applySelectors(this);
    }

    private _applyInlineStyle(inlineStyle) {
        if (types.isString(inlineStyle)) {
            try {
                // this.style._beginUpdate();
                styleScope.applyInlineSyle(this, <string>inlineStyle);
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

    public _eachChildView(callback: (view: View) => boolean) {
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
    public _addView(view: View, atIndex?: number) {
        if (trace.enabled) {
            trace.write(`${this}._addView(${view}, ${atIndex})`, trace.categories.ViewHierarchy);
        }

        if (!view) {
            throw new Error("Expecting a valid View instance.");
        }
        if (!(view instanceof View)) {
            throw new Error(view + " is not a valid View instance.");
        }
        if (view._parent) {
            throw new Error("View already has a parent. View: " + view + " Parent: " + view._parent);
        }

        view._parent = this;
        this._addViewCore(view, atIndex);
        view._parentChanged(null);
    }

    /**
     * Method is intended to be overridden by inheritors and used as "protected"
     */
    public _addViewCore(view: View, atIndex?: number) {
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

    public _propagateInheritableProperties(view: View) {
        propagateInheritedProperties(this);
        // view._inheritProperties(this);
        // view.style._inheritStyleProperties(this);
    }

    // public _inheritProperties(parentView: View) {
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
    public _removeView(view: View) {
        if (trace.enabled) {
            trace.write(`${this}._removeView(${view})`, trace.categories.ViewHierarchy);
        }
        if (view._parent !== this) {
            throw new Error("View not added to this instance. View: " + view + " CurrentParent: " + view._parent + " ExpectedParent: " + this);
        }

        this._removeViewCore(view);
        view._parent = undefined;
        view._parentChanged(this);
    }

    /**
     * Method is intended to be overridden by inheritors and used as "protected"
     */
    public _removeViewCore(view: View) {
        // Remove the view from the native visual scene first
        this._removeViewFromNativeVisualTree(view);

        // TODO: Discuss this.
        if (view.isLoaded) {
            view.onUnloaded();
        }

        view.unsetInheritedProperties();
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

    public _parentChanged(oldParent: View): void {
        //Overridden
        if (oldParent) {
            // Move these method in property class.
            clearInheritedProperties(this);
        }
    }

    /**
     * Method is intended to be overridden by inheritors and used as "protected".
     */
    public _addViewToNativeVisualTree(view: View, atIndex?: number): boolean {
        if (view._isAddedToNativeVisualTree) {
            throw new Error("Child already added to the native visual tree.");
        }

        return true;
    }

    /**
     * Method is intended to be overridden by inheritors and used as "protected"
     */
    public _removeViewFromNativeVisualTree(view: View) {
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
        if (!types.isString(style)) {
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

    public getLocationInWindow(): definition.Point {
        return undefined;
    }

    public getLocationOnScreen(): definition.Point {
        return undefined;
    }

    public getLocationRelativeTo(otherView: definition.View): definition.Point {
        return undefined;
    }

    public getActualSize(): definition.Size {
        var currentBounds = this._getCurrentLayoutBounds();
        if (!currentBounds) {
            return undefined;
        }

        return {
            width: utils.layout.toDeviceIndependentPixels(currentBounds.right - currentBounds.left),
            height: utils.layout.toDeviceIndependentPixels(currentBounds.bottom - currentBounds.top),
        }
    }

    public animate(animation: any): animModule.AnimationPromise {
        return this.createAnimation(animation).play();
    }

    public createAnimation(animation: any): any {
        ensureAnimationModule();
        animation.target = this;
        return new animationModule.Animation([animation]);
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
        var str = this.typeName;
        if (this.id) {
            str += `<${this.id}>`;
        } else {
            str += `(${this._domId})`;
        }
        var source = Source.get(this);
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
