// Definitions.
import { ViewBase as ViewBaseDefinition } from ".";
import { Page } from "../../page";
import { SelectorCore } from "../../styling/css-selector";
import { Order, FlexGrow, FlexShrink, FlexWrapBefore, AlignSelf } from "../../layouts/flexbox-layout";
import { KeyframeAnimation } from "../../animation/keyframe-animation";

// Types.
import { Source } from "../../../utils/debug";
import { Property, CssProperty, CssAnimationProperty, InheritedProperty, Style, clearInheritedProperties, propagateInheritableProperties, propagateInheritableCssProperties, resetCSSProperties, initNativeView, resetNativeView } from "../properties";
import { Binding, BindingOptions, Observable, WrappedValue, PropertyChangeData, traceEnabled, traceWrite, traceCategories, traceNotifyEvent } from "../bindable";
import { isIOS, isAndroid } from "../../../platform";
import { layout } from "../../../utils/utils";
import { Length, paddingTopProperty, paddingRightProperty, paddingBottomProperty, paddingLeftProperty } from "../../styling/style-properties";
import { DOMNode } from "../../../debugger/dom-node";

// TODO: Remove this import!
import * as types from "../../../utils/types";

import { Color } from "../../../color";

import { profile } from "../../../profiling";

export { isIOS, isAndroid, layout, Color };
export * from "../bindable";
export * from "../properties";

import * as ssm from "../../styling/style-scope";
let styleScopeModule: typeof ssm;
function ensureStyleScopeModule() {
    if (!styleScopeModule) {
        styleScopeModule = require("ui/styling/style-scope");
    }
}

let defaultBindingSource = {};

export function getAncestor(view: ViewBaseDefinition, criterion: string | Function): ViewBaseDefinition {
    let matcher: (view: ViewBaseDefinition) => boolean = null;
    if (typeof criterion === "string") {
        matcher = (view: ViewBaseDefinition) => view.typeName === criterion;
    } else {
        matcher = (view: ViewBaseDefinition) => view instanceof criterion;
    }

    for (let parent = view.parent; parent != null; parent = parent.parent) {
        if (matcher(parent)) {
            return parent;
        }
    }

    return null;
}

export function getViewById(view: ViewBaseDefinition, id: string): ViewBaseDefinition {
    if (!view) {
        return undefined;
    }

    if (view.id === id) {
        return view;
    }

    let retVal: ViewBaseDefinition;
    const descendantsCallback = function (child: ViewBaseDefinition): boolean {
        if (child.id === id) {
            retVal = child;
            // break the iteration by returning false
            return false;
        }

        return true;
    };

    eachDescendant(view, descendantsCallback);
    return retVal;
}

export function eachDescendant(view: ViewBaseDefinition, callback: (child: ViewBaseDefinition) => boolean) {
    if (!callback || !view) {
        return;
    }

    let continueIteration: boolean;
    let localCallback = function (child: ViewBaseDefinition): boolean {
        continueIteration = callback(child);
        if (continueIteration) {
            child.eachChild(localCallback);
        }
        return continueIteration;
    };

    view.eachChild(localCallback);
}

let viewIdCounter = 1;

// const contextMap = new WeakMap<Object, Map<string, WeakRef<Object>[]>>();

// function getNativeView(context: Object, typeName: string): Object {
//     let typeMap = contextMap.get(context);
//     if (!typeMap) {
//         typeMap = new Map<string, WeakRef<Object>[]>();
//         contextMap.set(context, typeMap);
//         return undefined;
//     }

//     const array = typeMap.get(typeName);
//     if (array) {
//         let nativeView;
//         while (array.length > 0) {
//             const weakRef = array.pop();
//             nativeView = weakRef.get();
//             if (nativeView) {
//                 return nativeView;
//             }
//         }
//     }
//     return undefined;
// }

// function putNativeView(context: Object, view: ViewBase): void {
//     const typeMap = contextMap.get(context);
//     const typeName = view.typeName;
//     let list = typeMap.get(typeName);
//     if (!list) {
//         list = [];
//         typeMap.set(typeName, list);
//     }
//     list.push(new WeakRef(view.nativeViewProtected));
// }

export abstract class ViewBase extends Observable implements ViewBaseDefinition {
    public static loadedEvent = "loaded";
    public static unloadedEvent = "unloaded";

    private _iosView: Object;
    private _androidView: Object;
    private _style: Style;
    private _isLoaded: boolean;
    private _visualState: string;
    private __nativeView: any;
    // private _disableNativeViewRecycling: boolean;
    public domNode: DOMNode;

    public recycleNativeView: "always" | "never" | "auto";
    public bindingContext: any;
    public nativeViewProtected: any;
    public parent: ViewBase;
    public isCollapsed; // Default(false) set in prototype

    public id: string;
    public className: string;

    public _domId: number;
    public _context: any;
    public _isAddedToNativeVisualTree: boolean;
    public _cssState: ssm.CssState = new ssm.CssState(this);
    public _styleScope: ssm.StyleScope;
    public _suspendedUpdates: { [propertyName: string]: Property<ViewBase, any> | CssProperty<Style, any> | CssAnimationProperty<Style, any> };
    public _suspendNativeUpdatesCount: number;

    // Dynamic properties.
    left: Length;
    top: Length;
    effectiveLeft: number;
    effectiveTop: number;
    dock: "left" | "top" | "right" | "bottom";
    row: number;
    col: number;
    rowSpan: number;
    colSpan: number;

    order: Order;
    flexGrow: FlexGrow;
    flexShrink: FlexShrink;
    flexWrapBefore: FlexWrapBefore;
    alignSelf: AlignSelf;

    _oldLeft: number;
    _oldTop: number;
    _oldRight: number;
    _oldBottom: number;

    public effectiveMinWidth: number;
    public effectiveMinHeight: number;
    public effectiveWidth: number;
    public effectiveHeight: number;
    public effectiveMarginTop: number;
    public effectiveMarginRight: number;
    public effectiveMarginBottom: number;
    public effectiveMarginLeft: number;
    public effectivePaddingTop: number;
    public effectivePaddingRight: number;
    public effectivePaddingBottom: number;
    public effectivePaddingLeft: number;
    public effectiveBorderTopWidth: number;
    public effectiveBorderRightWidth: number;
    public effectiveBorderBottomWidth: number;
    public effectiveBorderLeftWidth: number;

    public _defaultPaddingTop: number;
    public _defaultPaddingRight: number;
    public _defaultPaddingBottom: number;
    public _defaultPaddingLeft: number;
    public _isPaddingRelative: boolean;

    constructor() {
        super();
        this._domId = viewIdCounter++;
        this._style = new Style(this);
    }

    get nativeView(): any {
        // this._disableNativeViewRecycling = true;
        return this.nativeViewProtected;
    }
    set nativeView(value: any) {
        this.setNativeView(value);
    }

    // TODO: Use Type.prototype.typeName instead.
    get typeName(): string {
        return types.getClass(this);
    }

    get style(): Style {
        return this._style;
    }
    set style(inlineStyle: Style /* | string */) {
        if (typeof inlineStyle === "string") {
            this.setInlineStyle(inlineStyle);
        } else {
            throw new Error("View.style property is read-only.");
        }
    }

    get android(): any {
        // this._disableNativeViewRecycling = true;
        return this._androidView;
    }

    get ios(): any {
        // this._disableNativeViewRecycling = true;
        return this._iosView;
    }

    get isLoaded(): boolean {
        return this._isLoaded;
    }

    get class(): string {
        return this.className;
    }
    set class(v: string) {
        this.className = v;
    }

    getViewById<T extends ViewBaseDefinition>(id: string): T {
        return <T>getViewById(this, id);
    }

    get page(): Page {
        if (this.parent) {
            return this.parent.page;
        }

        return null;
    }

    public ensureDomNode() {
        if (!this.domNode) {
            this.domNode = new DOMNode(this);
        }
    }

    // Overridden so we don't raise `poropertyChange`
    // The property will raise its own event.
    public set(name: string, value: any) {
        this[name] = WrappedValue.unwrap(value);
    }

    @profile
    public onLoaded() {
        this._isLoaded = true;
        this._cssState.onLoaded();
        this._resumeNativeUpdates();
        this._loadEachChild();
        this._emit("loaded");
    }

    public _loadEachChild() {
        this.eachChild((child) => {
            child.onLoaded();
            return true;
        });
    }

    @profile
    public onUnloaded() {
        this._suspendNativeUpdates();
        this._unloadEachChild();
        this._isLoaded = false;
        this._cssState.onUnloaded();
        this._emit("unloaded");
    }

    public _suspendNativeUpdates(): void {
        this._suspendNativeUpdatesCount++;
    }
    public _resumeNativeUpdates(): void {
        this._suspendNativeUpdatesCount--;
        if (!this._suspendNativeUpdatesCount) {
            this.onResumeNativeUpdates();
        }
    }
    public _batchUpdate<T>(callback: () => T): T {
        try {
            this._suspendNativeUpdates();
            return callback();
        } finally {
            this._resumeNativeUpdates();
        }
    }

    private _unloadEachChild() {
        this.eachChild((child) => {
            if (child.isLoaded) {
                child.onUnloaded();
            }

            return true;
        });
    }

    private notifyPseudoClassChanged(pseudoClass: string): void {
        this.notify({ eventName: ":" + pseudoClass, object: this });
    }

    private pseudoClassAliases = {
        'highlighted': [
            'active',
            'pressed'
        ]
    };

    public cssClasses: Set<string> = new Set();
    public cssPseudoClasses: Set<string> = new Set();

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

    @profile
    public addPseudoClass(name: string): void {
        let allStates = this.getAllAliasedStates(name);
        for (let i = 0; i < allStates.length; i++) {
            if (!this.cssPseudoClasses.has(allStates[i])) {
                this.cssPseudoClasses.add(allStates[i]);
                this.notifyPseudoClassChanged(allStates[i]);
            }
        }
    }

    @profile
    public deletePseudoClass(name: string): void {
        let allStates = this.getAllAliasedStates(name);
        for (let i = 0; i < allStates.length; i++) {
            if (this.cssPseudoClasses.has(allStates[i])) {
                this.cssPseudoClasses.delete(allStates[i]);
                this.notifyPseudoClassChanged(allStates[i]);
            }
        }
    }

    private bindingContextChanged(data: PropertyChangeData): void {
        this.bindings.get("bindingContext").bind(data.value);
    }

    private bindings: Map<string, Binding>;
    private shouldAddHandlerToParentBindingContextChanged: boolean;
    private bindingContextBoundToParentBindingContextChanged: boolean;

    public bind(options: BindingOptions, source: Object = defaultBindingSource): void {
        const targetProperty = options.targetProperty;
        this.unbind(targetProperty);

        if (!this.bindings) {
            this.bindings = new Map<string, Binding>();
        }

        const binding = new Binding(this, options);
        this.bindings.set(targetProperty, binding);

        let bindingSource = source;
        if (bindingSource === defaultBindingSource) {
            bindingSource = this.bindingContext;
            binding.sourceIsBindingContext = true;
            if (targetProperty === "bindingContext") {
                this.bindingContextBoundToParentBindingContextChanged = true;
                const parent = this.parent;
                if (parent) {
                    parent.on("bindingContextChange", this.bindingContextChanged, this);
                } else {
                    this.shouldAddHandlerToParentBindingContextChanged = true;
                }
            }
        }

        binding.bind(bindingSource);
    }

    public unbind(property: string): void {
        const bindings = this.bindings;
        if (!bindings) {
            return;
        }

        const binding = bindings.get(property);
        if (binding) {
            binding.unbind();
            bindings.delete(property);
            if (binding.sourceIsBindingContext) {
                if (property === "bindingContext") {
                    this.shouldAddHandlerToParentBindingContextChanged = false;
                    this.bindingContextBoundToParentBindingContextChanged = false;
                    const parent = this.parent;
                    if (parent) {
                        parent.off("bindingContextChange", this.bindingContextChanged, this);
                    }
                }
            }
        }
    }

    @profile
    public requestLayout(): void {
        let parent = this.parent;
        if (parent) {
            parent.requestLayout();
        }
    }

    public eachChild(callback: (child: ViewBase) => boolean) {
        //
    }

    @profile
    public _addView(view: ViewBase, atIndex?: number) {
        if (traceEnabled()) {
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

        if (this.domNode) {
            this.domNode.onChildAdded(view);
        }
    }

    public _addViewCore(view: ViewBase, atIndex?: number) {
        propagateInheritableProperties(this, view);
        view._inheritStyleScope(this._styleScope);
        propagateInheritableCssProperties(this.style, view.style);

        if (this._context) {
            view._setupUI(this._context, atIndex);
        }

        if (this._isLoaded) {
            view.onLoaded();
        }
    }

    /**
     * Core logic for removing a child view from this instance. Used by the framework to handle lifecycle events more centralized. Do not use outside the UI Stack implementation.
     */
    public _removeView(view: ViewBase) {
        if (traceEnabled()) {
            traceWrite(`${this}._removeView(${view})`, traceCategories.ViewHierarchy);
        }

        if (view.parent !== this) {
            throw new Error("View not added to this instance. View: " + view + " CurrentParent: " + view.parent + " ExpectedParent: " + this);
        }

        if (this.domNode) {
            this.domNode.onChildRemoved(view);
        }

        this._removeViewCore(view);
        view.parent = undefined;
        view._parentChanged(this);
    }

    /**
     * Method is intended to be overridden by inheritors and used as "protected"
     */
    public _removeViewCore(view: ViewBase) {
        if (view.isLoaded) {
            view.onUnloaded();
        }

        if (view._context) {
            view._tearDownUI();
        }
    }

    public createNativeView(): Object {
        return undefined;
    }

    public disposeNativeView() {
        //
    }

    public initNativeView(): void {
        //
    }

    public resetNativeView(): void {
        //    
    }

    private resetNativeViewInternal(): void {
        // const nativeView = this.nativeViewProtected;
        // if (nativeView && isAndroid) {
        //     const recycle = this.recycleNativeView;
        //     if (recycle === "always" || (recycle === "auto" && !this._disableNativeViewRecycling)) {
        //         resetNativeView(this);
        //         if (this._isPaddingRelative) {
        //             nativeView.setPaddingRelative(this._defaultPaddingLeft, this._defaultPaddingTop, this._defaultPaddingRight, this._defaultPaddingBottom);
        //         } else {
        //             nativeView.setPadding(this._defaultPaddingLeft, this._defaultPaddingTop, this._defaultPaddingRight, this._defaultPaddingBottom);
        //         }
        //         this.resetNativeView();
        //     }
        // }

        // if (this._cssState) {
        //     this._cancelAllAnimations();
        // }
    }

    _setupAsRootView(context: any): void {
        this._setupUI(context);
    }

    @profile
    public _setupUI(context: android.content.Context, atIndex?: number, parentIsLoaded?: boolean) {

        traceNotifyEvent(this, "_setupUI");
        if (traceEnabled()) {
            traceWrite(`${this}._setupUI(${context})`, traceCategories.VisualTreeEvents);
        }

        if (this._context === context) {
            return;
        }

        this._context = context;
        traceNotifyEvent(this, "_onContextChanged");

        let nativeView;
        if (isAndroid) {
            // const recycle = this.recycleNativeView;
            // if (recycle === "always" || (recycle === "auto" && !this._disableNativeViewRecycling)) {
            //     nativeView = <android.view.View>getNativeView(context, this.typeName);
            // }

            if (!nativeView) {
                nativeView = <android.view.View>this.createNativeView();
            }

            this._androidView = nativeView;
            if (nativeView) {
                if (this._isPaddingRelative === undefined) {
                    this._isPaddingRelative = nativeView.isPaddingRelative();
                }

                let result: android.graphics.Rect = (<any>nativeView).defaultPaddings;
                if (result === undefined) {
                    result = org.nativescript.widgets.ViewHelper.getPadding(nativeView);
                    (<any>nativeView).defaultPaddings = result;
                }

                this._defaultPaddingTop = result.top;
                this._defaultPaddingRight = result.right;
                this._defaultPaddingBottom = result.bottom;
                this._defaultPaddingLeft = result.left;

                const style = this.style;
                if (!paddingTopProperty.isSet(style)) {
                    this.effectivePaddingTop = this._defaultPaddingTop;
                }
                if (!paddingRightProperty.isSet(style)) {
                    this.effectivePaddingRight = this._defaultPaddingRight;
                }
                if (!paddingBottomProperty.isSet(style)) {
                    this.effectivePaddingBottom = this._defaultPaddingBottom;
                }
                if (!paddingLeftProperty.isSet(style)) {
                    this.effectivePaddingLeft = this._defaultPaddingLeft;
                }
            }
        } else {
            // TODO: Implement _createNativeView for iOS
            nativeView = this.createNativeView();
            if (nativeView) {
                this._iosView = nativeView;
            }
        }

        // This will account for nativeView that is created in createNativeView, recycled
        // or for backward compatability - set before _setupUI in iOS contructor.
        this.setNativeView(nativeView || this.nativeViewProtected);

        if (this.parent) {
            let nativeIndex = this.parent._childIndexToNativeChildIndex(atIndex);
            this._isAddedToNativeVisualTree = this.parent._addViewToNativeVisualTree(this, nativeIndex);
        }

        this._resumeNativeUpdates();

        this.eachChild((child) => {
            child._setupUI(context);
            return true;
        });
    }

    setNativeView(value: any): void {
        if (this.__nativeView === value) {
            return;
        }

        if (this.__nativeView) {
            this._suspendNativeUpdates();
            // We may do a `this.resetNativeView()` here?
        }
        this.__nativeView = this.nativeViewProtected = value;
        if (this.__nativeView) {
            this._suspendedUpdates = undefined;
            this.initNativeView();
            this._resumeNativeUpdates();
        }
    }

    @profile
    public _tearDownUI(force?: boolean) {
        if (traceEnabled()) {
            traceWrite(`${this}._tearDownUI(${force})`, traceCategories.VisualTreeEvents);
        }

        // No context means we are already teared down.
        if (!this._context) {
            return;
        }

        this.resetNativeViewInternal();

        this.eachChild((child) => {
            child._tearDownUI(force);
            return true;
        });

        if (this.parent) {
            this.parent._removeViewFromNativeVisualTree(this);
        }

        // const nativeView = this.nativeViewProtected;
        // if (nativeView && isAndroid) {
        //     const recycle = this.recycleNativeView;
        //     let shouldRecycle = false;
        //     if (recycle === "always") {
        //         shouldRecycle = true;
        //     } else if (recycle === "auto" && !this._disableNativeViewRecycling) {
        //         const propertiesSet = Object.getOwnPropertySymbols(this).length + Object.getOwnPropertySymbols(this.style).length / 2;
        //         shouldRecycle = propertiesSet <= this.recyclePropertyCounter;
        //     }

        //     // const nativeParent = isAndroid ? (<android.view.View>nativeView).getParent() : (<UIView>nativeView).superview;
        //     const nativeParent = (<android.view.View>nativeView).getParent();
        //     const animation = (<android.view.View>nativeView).getAnimation();
        //     if (shouldRecycle && !nativeParent && !animation) {
        //         putNativeView(this._context, this);
        //     }
        // }

        this.disposeNativeView();

        this._suspendNativeUpdates();

        if (isAndroid) {
            this.setNativeView(null);
            this._androidView = null;
        }

        // this._iosView = null;

        this._context = null;

        if (this.domNode) {
            this.domNode.dispose();
            this.domNode = undefined;
        }

        traceNotifyEvent(this, "_onContextChanged");
        traceNotifyEvent(this, "_tearDownUI");
    }

    _childIndexToNativeChildIndex(index?: number): number {
        return index;
    }

    /**
     * Method is intended to be overridden by inheritors and used as "protected".
     */
    public _addViewToNativeVisualTree(view: ViewBase, atIndex?: number): boolean {
        if (view._isAddedToNativeVisualTree) {
            throw new Error("Child already added to the native visual tree.");
        }

        return true;
    }

    /**
     * Method is intended to be overridden by inheritors and used as "protected"
     */
    public _removeViewFromNativeVisualTree(view: ViewBase) {
        traceNotifyEvent(view, "_removeViewFromNativeVisualTree");
        view._isAddedToNativeVisualTree = false;
    }

    public _goToVisualState(state: string) {
        if (traceEnabled()) {
            traceWrite(this + " going to state: " + state, traceCategories.Style);
        }
        if (state === this._visualState) {
            return;
        }

        this.deletePseudoClass(this._visualState);
        this._visualState = state;
        this.addPseudoClass(state);
    }

    /**
     * This used to be the way to set attribute values in early {N} versions.
     * Now attributes are expected to be set as plain properties on the view instances.
     * @deprecated
     */
    public _applyXmlAttribute(): boolean {
        return false;
    }

    public setInlineStyle(style: string): void {
        if (typeof style !== "string") {
            throw new Error("Parameter should be valid CSS string!");
        }

        ensureStyleScopeModule();
        styleScopeModule.applyInlineStyle(this, style);
    }

    public _parentChanged(oldParent: ViewBase): void {
        const newParent = this.parent;

        //Overridden
        if (oldParent) {
            clearInheritedProperties(this);
            if (this.bindingContextBoundToParentBindingContextChanged) {
                oldParent.off("bindingContextChange", this.bindingContextChanged, this);
            }
        } else if (this.shouldAddHandlerToParentBindingContextChanged) {
            newParent.on("bindingContextChange", this.bindingContextChanged, this);
            this.bindings.get("bindingContext").bind(newParent.bindingContext);
        }
    }

    public onResumeNativeUpdates(): void {
        // Apply native setters...
        initNativeView(this);
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

    _onCssStateChange(): void {
        this._cssState.onChange();
        eachDescendant(this, (child: ViewBase) => {
            child._cssState.onChange();
            return true;
        });
    }

    _inheritStyleScope(styleScope: ssm.StyleScope): void {
        if (this._styleScope !== styleScope) {
            this._styleScope = styleScope;
            this._onCssStateChange();
            this.eachChild(child => {
                child._inheritStyleScope(styleScope);
                return true
            });
        }
    }
}

ViewBase.prototype.isCollapsed = false;

ViewBase.prototype._oldLeft = 0;
ViewBase.prototype._oldTop = 0;
ViewBase.prototype._oldRight = 0;
ViewBase.prototype._oldBottom = 0;

ViewBase.prototype.effectiveMinWidth = 0;
ViewBase.prototype.effectiveMinHeight = 0;
ViewBase.prototype.effectiveWidth = 0;
ViewBase.prototype.effectiveHeight = 0;
ViewBase.prototype.effectiveMarginTop = 0;
ViewBase.prototype.effectiveMarginRight = 0;
ViewBase.prototype.effectiveMarginBottom = 0;
ViewBase.prototype.effectiveMarginLeft = 0;
ViewBase.prototype.effectivePaddingTop = 0;
ViewBase.prototype.effectivePaddingRight = 0;
ViewBase.prototype.effectivePaddingBottom = 0;
ViewBase.prototype.effectivePaddingLeft = 0;
ViewBase.prototype.effectiveBorderTopWidth = 0;
ViewBase.prototype.effectiveBorderRightWidth = 0;
ViewBase.prototype.effectiveBorderBottomWidth = 0;
ViewBase.prototype.effectiveBorderLeftWidth = 0;
ViewBase.prototype._defaultPaddingTop = 0;
ViewBase.prototype._defaultPaddingRight = 0;
ViewBase.prototype._defaultPaddingBottom = 0;
ViewBase.prototype._defaultPaddingLeft = 0;
ViewBase.prototype._isViewBase = true;
ViewBase.prototype.recycleNativeView = "never";

// Removing from visual tree does +1, adding to visual tree does -1, see parentChanged
// Removing the nativeView does +1, adding the nativeView does -1, see set nativeView
// Pre _setupUI and post _tearDownUI does +1, in between _setupUI and _tearDownUI is -1
// Initially launch with 2, native updates wont fire unless both added to the JS visual tree and got nativeView.
ViewBase.prototype._suspendNativeUpdatesCount = 3;

export const bindingContextProperty = new InheritedProperty<ViewBase, any>({ name: "bindingContext" });
bindingContextProperty.register(ViewBase);

export const classNameProperty = new Property<ViewBase, string>({
    name: "className",
    valueChanged(view: ViewBase, oldValue: string, newValue: string) {
        let classes = view.cssClasses;
        classes.clear();
        if (typeof newValue === "string") {
            newValue.split(" ").forEach(c => classes.add(c));
        }
        view._onCssStateChange();
    }
});
classNameProperty.register(ViewBase);

export const idProperty = new Property<ViewBase, string>({ name: "id", valueChanged: (view, oldValue, newValue) => view._onCssStateChange() });
idProperty.register(ViewBase);

export function booleanConverter(v: string): boolean {
    const lowercase = (v + '').toLowerCase();
    if (lowercase === "true") {
        return true;
    } else if (lowercase === "false") {
        return false;
    }

    throw new Error(`Invalid boolean: ${v}`);
}