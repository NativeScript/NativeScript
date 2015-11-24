import types = require("utils/types");
import definition = require("ui/core/view");
import proxy = require("ui/core/proxy");
import style = require("../styling/style");
import styling = require("ui/styling");
import visualStateConstants = require("ui/styling/visual-state-constants");
import trace = require("trace");
import dependencyObservable = require("ui/core/dependency-observable");
import gestures = require("ui/gestures");
import bindable = require("ui/core/bindable");
import styleScope = require("../styling/style-scope");
import enums = require("ui/enums");
import utils = require("utils/utils");
import color = require("color");
import animationModule = require("ui/animation");
import observable = require("data/observable");
import {registerSpecialProperty} from "ui/builder/special-properties";

registerSpecialProperty("class", (instance: definition.View, propertyValue: string) => {
    instance.className = propertyValue;
});

function getEventOrGestureName(name: string) : string {
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

    for (let parent: definition.View = view.parent; parent != null; parent = parent.parent) {
        if (matcher(parent)) {
            return parent;
        }
    }

    return null;
}

var viewIdCounter = 0;

function onCssClassPropertyChanged(data: dependencyObservable.PropertyChangeData) {
    var view = <View>data.object;

    if (types.isString(data.newValue)) {
        view._cssClasses = (<string>data.newValue).split(" ");
    }
    else {
        view._cssClasses.length = 0;
    }
}

var idProperty = new dependencyObservable.Property(
    "id",
    "View",
    new proxy.PropertyMetadata(undefined, dependencyObservable.PropertyMetadataSettings.AffectsStyle)
    );

var cssClassProperty = new dependencyObservable.Property(
    "cssClass",
    "View",
    new proxy.PropertyMetadata(undefined, dependencyObservable.PropertyMetadataSettings.AffectsStyle, onCssClassPropertyChanged)
);

var classNameProperty = new dependencyObservable.Property(
    "className",
    "View",
    new proxy.PropertyMetadata(undefined, dependencyObservable.PropertyMetadataSettings.AffectsStyle, onCssClassPropertyChanged)
);

var translateXProperty = new dependencyObservable.Property(
    "translateX",
    "View",
    new proxy.PropertyMetadata(0)
    );

var translateYProperty = new dependencyObservable.Property(
    "translateY",
    "View",
    new proxy.PropertyMetadata(0)
    );

var scaleXProperty = new dependencyObservable.Property(
    "scaleX",
    "View",
    new proxy.PropertyMetadata(1)
    );

var scaleYProperty = new dependencyObservable.Property(
    "scaleY",
    "View",
    new proxy.PropertyMetadata(1)
    );
    
var pivotXProperty = new dependencyObservable.Property(
    "pivotX",
    "View",
    new proxy.PropertyMetadata(0.5)
    );

var pivotYProperty = new dependencyObservable.Property(
    "pivotY",
    "View",
    new proxy.PropertyMetadata(0.5)
    );

var rotateProperty = new dependencyObservable.Property(
    "rotate",
    "View",
    new proxy.PropertyMetadata(0)
    );

var isEnabledProperty = new dependencyObservable.Property(
    "isEnabled",
    "View",
    new proxy.PropertyMetadata(true)
    );

var isUserInteractionEnabledProperty = new dependencyObservable.Property(
    "isUserInteractionEnabled",
    "View",
    new proxy.PropertyMetadata(true)
    );

export class View extends proxy.ProxyObject implements definition.View {
    public static loadedEvent = "loaded";
    public static unloadedEvent = "unloaded";

    public static idProperty = idProperty;
    public static cssClassProperty = cssClassProperty;
    public static classNameProperty = classNameProperty;
    public static translateXProperty = translateXProperty;
    public static translateYProperty = translateYProperty;
    public static scaleXProperty = scaleXProperty;
    public static scaleYProperty = scaleYProperty;
    public static pivotXProperty = pivotXProperty;
    public static pivotYProperty = pivotYProperty;
    public static rotateProperty = rotateProperty;
    public static isEnabledProperty = isEnabledProperty;
    public static isUserInteractionEnabledProperty = isUserInteractionEnabledProperty;

    private _isVisibleCache: boolean = true;
    private _measuredWidth: number = Number.NaN;
    private _measuredHeight: number = Number.NaN;

    private _oldWidthMeasureSpec: number = Number.NaN;
    private _oldHeightMeasureSpec: number = Number.NaN;
    private _oldLeft: number = 0;
    private _oldTop: number = 0;
    private _oldRight: number = 0;
    private _oldBottom: number = 0;

    private _parent: definition.View;
    private _style: style.Style;
    private _visualState: string;
    private _requestedVisualState: string;
    private _isLoaded: boolean;
    private _isLayoutValid: boolean = false;

    public _domId: number;
    public _isAddedToNativeVisualTree = false;

    public _cssClasses: Array<string> = [];

    public _gestureObservers = {};

    public getGestureObservers(type: gestures.GestureTypes): Array<gestures.GesturesObserver> {
        return this._gestureObservers[type];
    }

    private _updatingInheritedProperties: boolean;

    public _options: definition.Options;

    constructor(options?: definition.Options) {
        super();

        this._options = options;

        this._style = new style.Style(this);
        this._domId = viewIdCounter++;
        this._visualState = visualStateConstants.Normal;
    }

    observe(type: gestures.GestureTypes, callback: (args: gestures.GestureEventData) => void, thisArg?: any): void {
        if (!this._gestureObservers[type]) {
            this._gestureObservers[type] = [];
        } 

        this._gestureObservers[type].push(gestures.observe(this, type, callback, thisArg));
    }

    public addEventListener(arg: string | gestures.GestureTypes, callback: (data: observable.EventData) => void, thisArg?: any) {
        if (types.isString(arg)) {

            arg = getEventOrGestureName(<string>arg);

            var gesture = gestures.fromString(<string>arg);
            if (gesture && !this._isEvent(<string>arg)) {
                this.observe(gesture, callback, thisArg);
            } else {
                var events = (<string>arg).split(",");
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
            var gesture = gestures.fromString(<string>arg);
            if (gesture && !this._isEvent(<string>arg)) {
                this._disconnectGestureObservers(gesture);
            } else {
                var events = (<string>arg).split(",");
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

    // START Style property shortcuts
    get borderRadius(): number {
        return this.style.borderRadius;
    }
    set borderRadius(value: number) {
        this.style.borderRadius = value;
    }

    get borderWidth(): number {
        return this.style.borderWidth;
    }
    set borderWidth(value: number) {
        this.style.borderWidth = value;
    }

    get borderColor(): color.Color {
        return this.style.borderColor;
    }
    set borderColor(value: color.Color) {
        this.style.borderColor = value;
    }

    get color(): color.Color {
        return this.style.color;
    }
    set color(value: color.Color) {
        this.style.color = value;
    }

    get backgroundColor(): color.Color {
        return this.style.backgroundColor;
    }
    set backgroundColor(value: color.Color) {
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
            
    //END Style property shortcuts

    get translateX(): number {
        return this._getValue(View.translateXProperty);
    }
    set translateX(value: number) {
        this._setValue(View.translateXProperty, value);
    }

    get translateY(): number {
        return this._getValue(View.translateYProperty);
    }
    set translateY(value: number) {
        this._setValue(View.translateYProperty, value);
    }

    get scaleX(): number {
        return this._getValue(View.scaleXProperty);
    }
    set scaleX(value: number) {
        this._setValue(View.scaleXProperty, value);
    }

    get scaleY(): number {
        return this._getValue(View.scaleYProperty);
    }
    set scaleY(value: number) {
        this._setValue(View.scaleYProperty, value);
    }

    get pivotX(): number {
        return this._getValue(View.pivotXProperty);
    }
    set pivotX(value: number) {
        this._setValue(View.pivotXProperty, value);
    }

    get pivotY(): number {
        return this._getValue(View.pivotYProperty);
    }
    set pivotY(value: number) {
        this._setValue(View.pivotYProperty, value);
    }

    get rotate(): number {
        return this._getValue(View.rotateProperty);
    }
    set rotate(value: number) {
        this._setValue(View.rotateProperty, value);
    }

    get isEnabled(): boolean {
        return this._getValue(View.isEnabledProperty);
    }
    set isEnabled(value: boolean) {
        this._setValue(View.isEnabledProperty, value);
    }

    get page(): definition.View {
        if (this.parent) {
            return this.parent.page;
        }

        return null;
    }

    get isUserInteractionEnabled(): boolean {
        return this._getValue(View.isUserInteractionEnabledProperty);
    }
    set isUserInteractionEnabled(value: boolean) {
        this._setValue(View.isUserInteractionEnabledProperty, value);
    }

    get id(): string {
        return this._getValue(View.idProperty);
    }
    set id(value: string) {
        this._setValue(View.idProperty, value);
    }

    get cssClass(): string {
        return this._getValue(View.cssClassProperty);
    }
    set cssClass(value: string) {
        this._setValue(View.cssClassProperty, value);
    }

    get className(): string {
        return this._getValue(View.cssClassProperty);
    }
    set className(value: string) {
        this._setValue(View.cssClassProperty, value);
    }

    get style(): style.Style {
        return this._style;
    }
    set style(value) {
        throw new Error("View.style property is read-only.");
    }

    get isLayoutValid(): boolean {
        return this._isLayoutValid;
    }
    set isLayoutValid(value: boolean) {
        throw new Error("isLayoutValid is read-only property.");
    }

    get visualState(): string {
        return this._visualState;
    }

    get cssType(): string {
        return this.typeName.toLowerCase();
    }

    get parent(): definition.View {
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
        this._unloadEachChildView();

        this._isLoaded = false;
        this._emit("unloaded");
    }

    public _unloadEachChildView() {
        if (this._childrenCount > 0) {
            // iterate all children and call onLoaded on them first
            var eachChild = function (child: View): boolean {
                child.onUnloaded();
                return true;
            }
            this._eachChildView(eachChild);
        }
    }

    public _onPropertyChanged(property: dependencyObservable.Property, oldValue: any, newValue: any) {
        super._onPropertyChanged(property, oldValue, newValue);

        if (this._childrenCount > 0) {
            var shouldUpdateInheritableProps = ((property.metadata && property.metadata.inheritable) &&
                !(property instanceof styling.Property));
            var that = this;
            if (shouldUpdateInheritableProps) {
                var notifyEachChild = function (child: View) {
                    child._setValue(property, that._getValue(property), dependencyObservable.ValueSource.Inherited);
                    return true;
                };
                this._updatingInheritedProperties = true;
                this._eachChildView(notifyEachChild);
                this._updatingInheritedProperties = false;
            }
        }

        this._checkMetadataOnPropertyChanged(property.metadata);
    }

    public _isInheritedChange() {
        if (this._updatingInheritedProperties) {
            return true;
        }
        var parentView: View;
        parentView = <View>(this.parent);
        while (parentView) {
            if (parentView._updatingInheritedProperties) {
                return true;
            }
            parentView = <View>(parentView.parent);
        }
        return false;
    }

    public _checkMetadataOnPropertyChanged(metadata: dependencyObservable.PropertyMetadata) {
        if (metadata.affectsLayout) {
            this.requestLayout();
        }

        if (metadata.affectsStyle) {
            this.style._resetCssValues();
            this._applyStyleFromScope();
        }
    }

    public measure(widthMeasureSpec: number, heightMeasureSpec: number): void {
        this._setCurrentMeasureSpecs(widthMeasureSpec, heightMeasureSpec);
    }

    public layout(left: number, top: number, right: number, bottom: number): void {
        this._setCurrentLayoutBounds(left, top, right, bottom);
    }

    public getMeasuredWidth(): number {
        return this._measuredWidth & utils.layout.MEASURED_SIZE_MASK;
    }

    public getMeasuredHeight(): number {
        return this._measuredHeight & utils.layout.MEASURED_SIZE_MASK;
    }

    public setMeasuredDimension(measuredWidth: number, measuredHeight: number): void {
        this._measuredWidth = measuredWidth;
        this._measuredHeight = measuredHeight;
        trace.write(this + " :setMeasuredDimension: " + measuredWidth + ", " + measuredHeight, trace.categories.Layout);
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

    public static layoutChild(parent: View, child: View, left: number, top: number, right: number, bottom: number): void {

        if (!child || !child._isVisible) {
            return;
        }

        var density = utils.layout.getDisplayDensity();

        var childTop: number;
        var childLeft: number;

        var childWidth = child.getMeasuredWidth();
        var childHeight = child.getMeasuredHeight();

        var vAlignment: string;
        if (!isNaN(child.height) && child.verticalAlignment === enums.VerticalAlignment.stretch) {
            vAlignment = enums.VerticalAlignment.center;
        }
        else {
            vAlignment = child.verticalAlignment;
        }

        switch (vAlignment) {
            case enums.VerticalAlignment.top:
                childTop = top + child.marginTop * density;
                break;

            case enums.VerticalAlignment.center || enums.VerticalAlignment.middle:
                childTop = top + (bottom - top - childHeight + (child.marginTop - child.marginBottom) * density) / 2;
                break;

            case enums.VerticalAlignment.bottom:
                childTop = bottom - childHeight - (child.marginBottom * density);
                break;

            case enums.VerticalAlignment.stretch:
            default:
                childTop = top + child.marginTop * density;
                childHeight = bottom - top - (child.marginTop + child.marginBottom) * density;
                break;
        }

        var hAlignment: string;
        if (!isNaN(child.width) && child.horizontalAlignment === enums.HorizontalAlignment.stretch) {
            hAlignment = enums.HorizontalAlignment.center;
        }
        else {
            hAlignment = child.horizontalAlignment;
        }

        switch (hAlignment) {
            case enums.HorizontalAlignment.left:
                childLeft = left + child.marginLeft * density;
                break;

            case enums.HorizontalAlignment.center:
                childLeft = left + (right - left - childWidth + (child.marginLeft - child.marginRight) * density) / 2;
                break;

            case enums.HorizontalAlignment.right:
                childLeft = right - childWidth - child.marginRight * density;
                break;

            case enums.HorizontalAlignment.stretch:
            default:
                childLeft = left + child.marginLeft * density;
                childWidth = right - left - (child.marginLeft + child.marginRight) * density;
                break;
        }

        var childRight = Math.round(childLeft + childWidth);
        var childBottom = Math.round(childTop + childHeight);
        childLeft = Math.round(childLeft);
        childTop = Math.round(childTop);

        trace.write(parent + " :layoutChild: " + child + " " + childLeft + ", " + childTop + ", " + childRight + ", " + childBottom, trace.categories.Layout);
        child.layout(childLeft, childTop, childRight, childBottom);
    }

    public static measureChild(parent: View, child: View, widthMeasureSpec: number, heightMeasureSpec: number): { measuredWidth: number; measuredHeight: number } {
        var measureWidth = 0;
        var measureHeight = 0;

        if (child && child._isVisible) {

            var width = utils.layout.getMeasureSpecSize(widthMeasureSpec);
            var widthMode = utils.layout.getMeasureSpecMode(widthMeasureSpec);

            var height = utils.layout.getMeasureSpecSize(heightMeasureSpec);
            var heightMode = utils.layout.getMeasureSpecMode(heightMeasureSpec);
            trace.write(parent + " :measureChild: " + child + " " + utils.layout.getMode(widthMode) + " " + width + ", " + utils.layout.getMode(heightMode) + " " + height, trace.categories.Layout);

            var childWidthMeasureSpec = View.getMeasureSpec(child, width, widthMode, true);
            var childHeightMeasureSpec = View.getMeasureSpec(child, height, heightMode, false);

            child.measure(childWidthMeasureSpec, childHeightMeasureSpec);
            measureWidth = child.getMeasuredWidth();
            measureHeight = child.getMeasuredHeight();

            var density = utils.layout.getDisplayDensity();
            // Convert to pixels.
            measureWidth = Math.round(measureWidth + (child.marginLeft + child.marginRight) * density);
            measureHeight = Math.round(measureHeight + (child.marginTop + child.marginBottom) * density);
        }

        return { measuredWidth: measureWidth, measuredHeight: measureHeight };
    }

    private static getMeasureSpec(view: View, parentLength: number, parentSpecMode: number, horizontal: boolean): number {

        var density = utils.layout.getDisplayDensity();
        var margins = horizontal ? view.marginLeft + view.marginRight : view.marginTop + view.marginBottom;
        margins = Math.floor(margins * density);

        var resultSize = 0;
        var resultMode = 0;

        var measureLength = Math.max(0, parentLength - margins);

        // Convert to pixels.
        var childLength = Math.floor((horizontal ? view.width : view.height) * density);

        // We want a specific size... let be it.
        if (!isNaN(childLength)) {
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
                    var stretched = horizontal ? view.horizontalAlignment === enums.HorizontalAlignment.stretch : view.verticalAlignment === enums.VerticalAlignment.stretch;

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
        var changed: boolean = this._oldWidthMeasureSpec !== widthMeasureSpec || this._oldHeightMeasureSpec !== heightMeasureSpec;
        this._oldWidthMeasureSpec = widthMeasureSpec;
        this._oldHeightMeasureSpec = heightMeasureSpec;
        return changed;
    }

    _getCurrentLayoutBounds(): { left: number; top: number; right: number; bottom: number } {
        return { left: this._oldLeft, top: this._oldTop, right: this._oldRight, bottom: this._oldBottom }
    }

    _setCurrentLayoutBounds(left: number, top: number, right: number, bottom: number): boolean {
        this._isLayoutValid = true;
        var changed: boolean = this._oldLeft !== left || this._oldTop !== top || this._oldRight !== right || this._oldBottom !== bottom;
        this._oldLeft = left;
        this._oldTop = top;
        this._oldRight = right;
        this._oldBottom = bottom;
        return changed;
    }

    private _applyStyleFromScope() {
        var rootPage = this.page;
        if (!rootPage || !rootPage.isLoaded) {
            return;
        }

        var scope: styleScope.StyleScope = (<any>rootPage)._getStyleScope()
        scope.applySelectors(this);
    }

    private _applyInlineStyle(inlineStyle) {
        if (types.isString(inlineStyle)) {
            try {
                this.style._beginUpdate();
                styleScope.applyInlineSyle(this, <string>inlineStyle);
            } finally {
                this.style._endUpdate();
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

    /**
     * Core logic for adding a child view to this instance. Used by the framework to handle lifecycle events more centralized. Do not outside the UI Stack implementation.
     * // TODO: Think whether we need the base Layout routine.
     */
    public _addView(view: View, atIndex?: number) {
        if (!view) {
            throw new Error("Expecting a valid View instance.");
        }

        if (view._parent) {
            throw new Error("View already has a parent. View: " + view + " Parent: " + view._parent);
        }

        view._parent = this;
        this._addViewCore(view, atIndex);

        trace.write("called _addView on view " + this._domId + " for a child " + view._domId, trace.categories.ViewHierarchy);
    }

    /**
     * Method is intended to be overridden by inheritors and used as "protected"
     */
    public _addViewCore(view: View, atIndex?: number) {
        this._propagateInheritableProperties(view);

        view.style._inheritStyleProperties();

        if (!view._isAddedToNativeVisualTree) {
            view._isAddedToNativeVisualTree = this._addViewToNativeVisualTree(view, atIndex);
        }

        // TODO: Discuss this.
        if (this._isLoaded) {
            view.onLoaded();
        }
    }

    public _propagateInheritableProperties(view: View) {
        view._inheritProperties(this);
    }

    public _inheritProperties(parentView: View) {
        var that = this;
        var inheritablePropertySetCallback = function (property: dependencyObservable.Property) {
            if (property instanceof styling.Property) {
                return true;
            }
            if (property.metadata && property.metadata.inheritable) {
                var baseValue = parentView._getValue(property);
                that._setValue(property, baseValue, dependencyObservable.ValueSource.Inherited);
            }
            return true;
        };

        parentView._eachSetProperty(inheritablePropertySetCallback);
    }

    /**
     * Core logic for removing a child view from this instance. Used by the framework to handle lifecycle events more centralized. Do not outside the UI Stack implementation.
     */
    public _removeView(view: View) {
        if (view._parent !== this) {
            throw new Error("View not added to this instance. View: " + view + " CurrentParent: " + view._parent + " ExpectedParent: " + this);
        }

        this._removeViewCore(view);
        view._parent = undefined;

        trace.write("called _removeView on view " + this._domId + " for a child " + view._domId, trace.categories.ViewHierarchy);
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

        view._setValue(bindable.Bindable.bindingContextProperty, undefined, dependencyObservable.ValueSource.Inherited);
        var inheritablePropertiesSetCallback = function (property: dependencyObservable.Property) {
            if (property instanceof styling.Property) {
                return true;
            }
            if (property.metadata && property.metadata.inheritable) {
                view._resetValue(property, dependencyObservable.ValueSource.Inherited);
            }
            return true;
        }
        view._eachSetProperty(inheritablePropertiesSetCallback);
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

    public _syncNativeProperties() {
        super._syncNativeProperties();

        // loop all style properties and call the _applyStyleProperty method
        // TODO: Potential performance bottle-neck
        this.style._syncNativeProperties();
    }

    public _goToVisualState(state: string) {
        trace.write(this + " going to state: " + state, trace.categories.Style);
        if (state === this._visualState || this._requestedVisualState === state) {
            return;
        }
        // we use lazy require to prevent cyclic dependencies issues
        var vsm = require("ui/styling/visual-state");
        this._visualState = vsm.goToState(this, state);

        // TODO: What state should we set here - the requested or the actual one?
        this._requestedVisualState = state;
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

    get _isVisible(): boolean {
        return this._isVisibleCache;
    }

    public _shouldApplyStyleHandlers() {
        // If we have native view we are ready to apply style handelr;
        return !!this._nativeView;
    }

    public focus(): boolean {
        return undefined;
    }

    public animate(animation: animationModule.AnimationDefinition): Promise<void> {
        return this.createAnimation(animation).play();
    }

    public createAnimation(animation: animationModule.AnimationDefinition): animationModule.Animation {
        var that = this;
        animation.target = that;
        return new animationModule.Animation([animation]);
    }

    public toString(): string {
        if (this.id) {
            return this.typeName + `<${this.id}>`;
        }

        return this.typeName + `(${this._domId})`;
    }

    public _setNativeViewFrame(nativeView: any, frame: any) {
        //
    }
}
