// Definitions.
import { ViewBase as ViewBaseDefinition } from ".";
import { Page } from "../../page";
import { SelectorCore } from "../../styling/css-selector";
import { Order, FlexGrow, FlexShrink, FlexWrapBefore, AlignSelf } from "../../layouts/flexbox-layout";
import { KeyframeAnimation } from "../../animation/keyframe-animation";
import { BindingOptions } from "../bindable";

// Types.
import { unsetValue, Property, InheritedProperty, Style, clearInheritedProperties, propagateInheritableProperties, propagateInheritableCssProperties, resetCSSProperties, initNativeView, resetNativeView } from "../properties";
import { isIOS, isAndroid } from "../../../platform";
import { layout } from "../../../utils/utils";
import { Length, paddingTopProperty, paddingRightProperty, paddingBottomProperty, paddingLeftProperty } from "../../styling/style-properties";

// from ../bindable
import { Observable, WrappedValue, PropertyChangeData, EventData } from "../../../data/observable";
import { addWeakEventListener, removeWeakEventListener } from "../weak-event-listener";
import { bindingConstants, parentsRegex } from "../../builder/binding-builder";
import { escapeRegexSymbols } from "../../../utils/utils";
import { isEnabled as traceEnabled, write as traceWrite, categories as traceCategories, notifyEvent as traceNotifyEvent, isCategorySet, messageType as traceMessageType } from "../../../trace";

import * as application from "../../../application";
import * as polymerExpressions from "../../../js-libs/polymer-expressions";

// TODO: Remove this import!
import * as types from "../../../utils/types";

import { Color } from "../../../color";

export { isIOS, isAndroid, layout, Color };
export * from "../properties";

export {
    Observable, WrappedValue, PropertyChangeData, EventData,
    traceEnabled, traceWrite, traceCategories, traceNotifyEvent, traceMessageType, isCategorySet
};

const contextKey = "context";
// this regex is used to get parameters inside [] for example:
// from $parents['ListView'] will return 'ListView'
// from $parents[1] will return 1
const paramsRegex = /\[\s*(['"])*(\w*)\1\s*\]/;
const bc = bindingConstants;
const emptyArray = [];

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

const contextMap = new Map<Object, Map<string, WeakRef<Object>[]>>();

function getNativeView(context: Object, typeName: string): Object {
    let typeMap = contextMap.get(context);
    if (!typeMap) {
        typeMap = new Map<string, WeakRef<Object>[]>();
        contextMap.set(context, typeMap);
        return undefined;
    }

    const array = typeMap.get(typeName);
    if (array) {
        let nativeView;
        while (array.length > 0) {
            const weakRef = array.pop();
            nativeView = weakRef.get();
            if (nativeView) {
                return nativeView;
            }
        }
    }
    return undefined;
}

function putNativeView(context: Object, view: ViewBase): void {
    const typeMap = contextMap.get(context);
    const typeName = view.typeName;
    let list = typeMap.get(typeName);
    if (!list) {
        list = [];
        typeMap.set(typeName, list);
    }
    list.push(new WeakRef(view.nativeView));
}

export abstract class ViewBase extends Observable implements ViewBaseDefinition {
    public static loadedEvent = "loaded";
    public static unloadedEvent = "unloaded";

    public recycleNativeView: boolean;

    private _iosView: Object;
    private _androidView: Object;
    private _style: Style;
    private _isLoaded: boolean;
    private _registeredAnimations: Array<KeyframeAnimation>;
    private _visualState: string;
    private _inlineStyleSelector: SelectorCore;

    public bindingContext: any;
    public nativeView: any;
    public parent: ViewBase;
    public isCollapsed; // Default(false) set in prototype

    public id: string;
    public className: string;

    public _domId: number;
    public _context: any;
    public _isAddedToNativeVisualTree: boolean;
    public _cssState: ssm.CssState;
    public _styleScope: ssm.StyleScope;

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

    constructor() {
        super();
        this._domId = viewIdCounter++;
        this._style = new Style(this);
    }

    // TODO: Use Type.prototype.typeName instead.
    get typeName(): string {
        return types.getClass(this);
    }

    get style(): Style {
        return this._style;
    }
    set style(value) {
        throw new Error("View.style property is read-only.");
    }

    get android(): any {
        return this._androidView;
    }

    get ios(): any {
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

    get inlineStyleSelector(): SelectorCore {
        return this._inlineStyleSelector;
    }
    set inlineStyleSelector(value: SelectorCore) {
        this._inlineStyleSelector = value;
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

    // Overriden so we don't raise `poropertyChange`
    // The property will raise its own event.
    public set(name: string, value: any) {
        this[name] = WrappedValue.unwrap(value);
    }

    public onLoaded() {
        this._isLoaded = true;
        this._loadEachChild();
        this._emit("loaded");
    }

    public _loadEachChild() {
        this.eachChild((child) => {
            child.onLoaded();
            return true;
        });
    }

    public onUnloaded() {
        this._unloadEachChild();
        this._isLoaded = false;
        this._emit("unloaded");
    }

    public _batchUpdateScope: number;
    public _batchUpdate<T>(callback: () => T): T {
        try {
            ++this._batchUpdateScope;
            return callback();
        } finally {
            --this._batchUpdateScope;
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

    public _applyStyleFromScope() {
        const scope = this._styleScope;
        if (scope) {
            scope.applySelectors(this);
        } else {
            this._setCssState(null);
        }
    }

    // TODO: Make sure the state is set to null and this is called on unloaded to clean up change listeners...
    _setCssState(next: ssm.CssState): void {
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
                            view.addEventListener(attribute + "Change", this._invalidateCssHandler);
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
                            view.removeEventListener("onPropertyChanged:" + attribute, this._invalidateCssHandler);
                        });
                    }
                    if (changes.pseudoClasses) {
                        changes.pseudoClasses.forEach(pseudoClass => {
                            let eventName = ":" + pseudoClass;
                            view.removeEventListener(eventName, this._invalidateCssHandler);
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

    private notifyPseudoClassChanged(pseudoClass: string): void {
        this.notify({ eventName: ":" + pseudoClass, object: this });
    }

    /**
     * Notify that some attributes or pseudo classes that may affect the current CssState had changed.
     */
    private _invalidateCssHandler;
    private _invalidateCssHandlerSuspended: boolean;

    private applyCssState(): void {
        this._batchUpdate(() => {
            if (!this._cssState) {
                this._cancelAllAnimations();
                resetCSSProperties(this.style);
                return;
            }
            this._cssState.apply();
        });
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

    private _applyInlineStyle(inlineStyle) {
        if (typeof inlineStyle === "string") {
            try {
                // this.style._beginUpdate();
                ensureStyleScopeModule();
                styleScopeModule.applyInlineStyle(this, inlineStyle);
            } finally {
                // this.style._endUpdate();
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

    public requestLayout(): void {
        let parent = this.parent;
        if (parent) {
            parent.requestLayout();
        }
    }

    public eachChild(callback: (child: ViewBase) => boolean) {
        //
    }

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
    }

    private _setStyleScope(scope: ssm.StyleScope): void {
        this._styleScope = scope;
        this._applyStyleFromScope();
        this.eachChild((v) => {
            v._setStyleScope(scope);
            return true;
        });
    }

    public _addViewCore(view: ViewBase, atIndex?: number) {
        propagateInheritableProperties(this, view);

        const styleScope = this._styleScope;
        if (styleScope) {
            view._setStyleScope(styleScope);
        }

        propagateInheritableCssProperties(this.style, view.style);

        if (this._context) {
            view._setupUI(this._context, atIndex);
        }

        if (this._isLoaded) {
            view.onLoaded();
        }
    }

    /**
    * Core logic for removing a child view from this instance. Used by the framework to handle lifecycle events more centralized. Do not outside the UI Stack implementation.
    */
    public _removeView(view: ViewBase) {
        if (traceEnabled()) {
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
    public _removeViewCore(view: ViewBase) {
        // TODO: Discuss this.
        if (this._styleScope === view._styleScope) {
            view._setStyleScope(null);
        }
        if (view.isLoaded) {
            view.onUnloaded();
        }

        // view.unsetInheritedProperties();

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
        // No initNativeView(this)?
        if (this._cssState) {
            this._cssState.playPendingKeyframeAnimations();
        }
    }

    public resetNativeView(): void {
        if (this.nativeView && this.recycleNativeView && isAndroid) {
            resetNativeView(this);
        }
        if (this._cssState) {
            this._cancelAllAnimations();
        }
    }

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

        let currentNativeView = this.nativeView;
        if (isAndroid) {
            let nativeView: android.view.View;
            if (this.recycleNativeView) {
                nativeView = <android.view.View>getNativeView(context, this.typeName);
            }

            if (!nativeView) {
                nativeView = <android.view.View>this.createNativeView();
            }

            this._androidView = this.nativeView = nativeView;
            if (nativeView) {
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
            const nativeView = this.createNativeView();
            if (!currentNativeView && nativeView) {
                this.nativeView = this._iosView = nativeView;
            }
        }

        this.initNativeView();

        if (this.parent) {
            let nativeIndex = this.parent._childIndexToNativeChildIndex(atIndex);
            this._isAddedToNativeVisualTree = this.parent._addViewToNativeVisualTree(this, nativeIndex);
        }

        if (this.nativeView) {
            if (currentNativeView !== this.nativeView) {
                initNativeView(this);
            }
        }

        this.eachChild((child) => {
            child._setupUI(context);
            return true;
        });
    }

    public _tearDownUI(force?: boolean) {
        // No context means we are already teared down.
        if (!this._context) {
            return;
        }

        if (traceEnabled()) {
            traceWrite(`${this}._tearDownUI(${force})`, traceCategories.VisualTreeEvents);
        }

        this.resetNativeView();

        this.eachChild((child) => {
            child._tearDownUI(force);
            return true;
        });

        if (this.parent) {
            this.parent._removeViewFromNativeVisualTree(this);
        }

        const nativeView = this.nativeView;
        if (nativeView && this.recycleNativeView && isAndroid) {
            const nativeParent = isAndroid ? (<android.view.View>nativeView).getParent() : (<UIView>nativeView).superview;
            if (!nativeParent) {
                putNativeView(this._context, this);
            }
        }

        this.disposeNativeView();

        if (isAndroid) {
            this.nativeView = null;
            this._androidView = null;
        }

        // this._iosView = null;

        this._context = null;
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

    public _parentChanged(oldParent: ViewBase): void {
        //Overridden
        if (oldParent) {
            clearInheritedProperties(this);
            if (this.bindingContextBoundToParentBindingContextChanged) {
                oldParent.off("bindingContextChange", this.bindingContextChanged, this);
            }
        } else if (this.shouldAddHandlerToParentBindingContextChanged) {
            const parent = this.parent;
            parent.on("bindingContextChange", this.bindingContextChanged, this);
            this.bindings.get("bindingContext").bind(parent.bindingContext);
        }
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

    public _cancelAllAnimations() {
        if (this._registeredAnimations) {
            for (let animation of this._registeredAnimations) {
                animation.cancel();
            }
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

ViewBase.prototype._batchUpdateScope = 0;

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
        resetStyles(view);
    }
});
classNameProperty.register(ViewBase);

function resetStyles(view: ViewBase): void {
    view._applyStyleFromScope();
    view.eachChild((child) => {
        resetStyles(child);
        return true;
    });
}

export const idProperty = new Property<ViewBase, string>({ name: "id", valueChanged: (view, oldValue, newValue) => resetStyles(view) });
idProperty.register(ViewBase);

export function booleanConverter(v: string): boolean {
    let lowercase = (v + '').toLowerCase();
    if (lowercase === "true") {
        return true;
    } else if (lowercase === "false") {
        return false;
    }

    throw new Error(`Invalid boolean: ${v}`);
}

function getProperties(property: string): Array<string> {
    let result: Array<string> = emptyArray;
    if (property) {
        // first replace all '$parents[..]' with a safe string
        // second removes all ] since they are not important for property access and not needed 
        // then split properties either on '.' or '['
        const parentsMatches = property.match(parentsRegex);
        result = property.replace(parentsRegex, "parentsMatch")
            .replace(/\]/g, "")
            .split(/\.|\[/);

        let parentsMatchesCounter = 0;
        for (let i = 0, resultLength = result.length; i < resultLength; i++) {
            if (result[i] === "parentsMatch") {
                result[i] = parentsMatches[parentsMatchesCounter++];
            }
        }
    }

    return result;
}

export function getEventOrGestureName(name: string): string {
    return name.indexOf("on") === 0 ? name.substr(2, name.length - 2) : name;
}

// NOTE: method fromString from "ui/gestures";
export function isGesture(eventOrGestureName: string): boolean {
    let t = eventOrGestureName.trim().toLowerCase();
    return t === "tap"
        || t === "doubletap"
        || t === "pinch"
        || t === "pan"
        || t === "swipe"
        || t === "rotation"
        || t === "longpress"
        || t === "touch";
}

// TODO: Make this instance function so that we dont need public statc tapEvent = "tap"
// in controls. They will just override this one and provide their own event support.
export function isEventOrGesture(name: string, view: ViewBase): boolean {
    if (typeof name === "string") {
        let eventOrGestureName = getEventOrGestureName(name);
        let evt = `${eventOrGestureName}Event`;

        return view.constructor && evt in view.constructor || isGesture(eventOrGestureName.toLowerCase());
    }
    return false;
}

export class Binding {
    private source: WeakRef<Object>;
    // TODO: target should be hard reference!
    public target: WeakRef<ViewBase>;

    private sourceOptions: { instance: WeakRef<any>; property: string };
    private targetOptions: { instance: WeakRef<Object>; property: string };

    private sourcesAndProperties: Array<{ instance: Object; property: string }>;

    private sourceProperties: Array<string>;
    private propertyChangeListeners: Map<string, Observable> = new Map<string, Observable>();

    public updating: boolean;
    public sourceIsBindingContext: boolean;
    public options: BindingOptions;

    constructor(target: ViewBase, options: BindingOptions) {
        this.target = new WeakRef(target);
        this.options = options;
        this.sourceProperties = getProperties(options.sourceProperty);
        this.targetOptions = this.resolveOptions(target, getProperties(options.targetProperty));
        if (!this.targetOptions) {
            throw new Error(`Invalid property: ${options.targetProperty} for target: ${target}`);
        }

        if (options.twoWay) {
            const target = this.targetOptions.instance.get();
            if (target instanceof Observable) {
                target.on(`${this.targetOptions.property}Change`, this.onTargetPropertyChanged, this);
            }
        }
    }

    private onTargetPropertyChanged(data: PropertyChangeData): void {
        this.updateTwoWay(data.value);
    }

    public loadedHandlerVisualTreeBinding(args) {
        let target = args.object;
        target.off("loaded", this.loadedHandlerVisualTreeBinding, this);
        const context = target.bindingContext;
        if (context !== undefined && context !== null) {
            this.update(context);
        }
    };

    public clearSource(): void {
        this.propertyChangeListeners.forEach((observable, index, map) => {
            removeWeakEventListener(
                observable,
                Observable.propertyChangeEvent,
                this.onSourcePropertyChanged,
                this);
        });

        this.propertyChangeListeners.clear();
        this.sourcesAndProperties = null;

        if (this.source) {
            this.source.clear();
        }

        if (this.sourceOptions) {
            this.sourceOptions.instance.clear();
            this.sourceOptions = undefined;
        }
    }

    private sourceAsObject(source: any): any {
        /* tslint:disable */
        let objectType = typeof source;
        if (objectType === "number") {
            source = new Number(source);
        }
        else if (objectType === "boolean") {
            source = new Boolean(source);
        }
        else if (objectType === "string") {
            source = new String(source);
        }
        /* tslint:enable */
        return source;
    }

    private bindingContextChanged(data: PropertyChangeData): void {
        const target = this.targetOptions.instance.get();
        if (!target) {
            this.unbind();
            return;
        }

        const value = data.value;
        if (value !== null && value !== undefined) {
            this.update(value);
        } else {
            // TODO: Is this correct?
            // What should happen when bindingContext is null/undefined?
            this.clearBinding();
        }

        // TODO: if oneWay - call target.unbind();
    }

    public bind(source: any): void {
        const target = this.targetOptions.instance.get();
        if (this.sourceIsBindingContext && target instanceof Observable && this.targetOptions.property !== "bindingContext") {
            target.on("bindingContextChange", this.bindingContextChanged, this);
        }

        this.update(source);
    }

    private update(source: any): void {
        this.clearSource();

        source = this.sourceAsObject(source);

        if (!types.isNullOrUndefined(source)) {
            // TODO: if oneWay - call target.unbind();
            this.source = new WeakRef(source);
            this.sourceOptions = this.resolveOptions(source, this.sourceProperties);

            let sourceValue = this.getSourcePropertyValue();
            this.updateTarget(sourceValue);
            this.addPropertyChangeListeners(this.source, this.sourceProperties);
        } else if (!this.sourceIsBindingContext) {
            // TODO: if oneWay - call target.unbind();
            let sourceValue = this.getSourcePropertyValue();
            this.updateTarget(sourceValue ? sourceValue : source);
        }
    }

    public unbind() {
        const target = this.targetOptions.instance.get();
        if (target instanceof Observable) {
            if (this.options.twoWay) {
                target.off(`${this.targetOptions.property}Change`, this.onTargetPropertyChanged, this);
            }

            if (this.sourceIsBindingContext && this.targetOptions.property !== "bindingContext") {
                target.off("bindingContextChange", this.bindingContextChanged, this);
            }
        }

        if (this.targetOptions) {
            this.targetOptions = undefined;
        }

        this.sourceProperties = undefined;
        if (!this.source) {
            return;
        }

        this.clearSource();
    }

    // Consider returning single {} instead of array for performance.
    private resolveObjectsAndProperties(source: Object, properties: Array<string>): Array<{ instance: Object; property: string }> {
        let result = [];
        let currentObject = source;
        let currentObjectChanged = false;
        for (let i = 0, propsArrayLength = properties.length; i < propsArrayLength; i++) {
            let property = properties[i];
            if (property === bc.bindingValueKey) {
                currentObjectChanged = true;
            }

            if (property === bc.parentValueKey || property.indexOf(bc.parentsValueKey) === 0) {
                let parentView = this.getParentView(this.target.get(), property).view;
                if (parentView) {
                    currentObject = parentView.bindingContext;
                } else {
                    let targetInstance = this.target.get();
                    targetInstance.off("loaded", this.loadedHandlerVisualTreeBinding, this);
                    targetInstance.on("loaded", this.loadedHandlerVisualTreeBinding, this);
                }

                currentObjectChanged = true;
            }

            if (currentObject) {
                result.push({ instance: currentObject, property: property });
            } else {
                break;
            }

            // do not need to dive into last object property getter on binding stage will handle it
            if (!currentObjectChanged && (i < propsArrayLength - 1)) {
                currentObject = currentObject ? currentObject[properties[i]] : null;
            }

            currentObjectChanged = false;
        }

        return result;
    }

    private addPropertyChangeListeners(source: WeakRef<Object>, sourceProperty: Array<string>, parentProperies?: string) {
        let objectsAndProperties = this.resolveObjectsAndProperties(source.get(), sourceProperty)
        let prop = parentProperies || "";

        for (let i = 0, length = objectsAndProperties.length; i < length; i++) {
            const propName = objectsAndProperties[i].property;
            prop += "$" + propName;
            let currentObject = objectsAndProperties[i].instance;
            if (!this.propertyChangeListeners.has(prop) && currentObject instanceof ViewBase) {
                // Add listener for properties created with after 3.0 version
                addWeakEventListener(currentObject, `${propName}Change`, this.onSourcePropertyChanged, this);
                addWeakEventListener(currentObject, Observable.propertyChangeEvent, this.onSourcePropertyChanged, this);
                this.propertyChangeListeners.set(prop, currentObject);
            } else if (!this.propertyChangeListeners.has(prop) && currentObject instanceof Observable) {
                addWeakEventListener(currentObject, Observable.propertyChangeEvent, this.onSourcePropertyChanged, this);
                this.propertyChangeListeners.set(prop, currentObject);
            }
        }
    }

    private prepareExpressionForUpdate(): string {
        // this regex is used to create a valid RegExp object from a string that has some special regex symbols like [,(,$ and so on.
        // Basically this method replaces all matches of 'source property' in expression with '$newPropertyValue'.
        // For example: with an expression similar to:
        // text="{{ sourceProperty = $parents['ListView'].test, expression = $parents['ListView'].test + 2}}"
        // update expression will be '$newPropertyValue + 2'
        // then on expression execution the new value will be taken and target property will be updated with the value of the expression.
        let escapedSourceProperty = escapeRegexSymbols(this.options.sourceProperty);
        let expRegex = new RegExp(escapedSourceProperty, 'g');
        let resultExp = this.options.expression.replace(expRegex, bc.newPropertyValueKey);
        return resultExp;
    }

    private updateTwoWay(value: any) {
        if (this.updating || !this.options.twoWay) {
            return;
        }

        let newValue = value;
        if (this.options.expression) {
            let changedModel = {};
            changedModel[bc.bindingValueKey] = value;
            changedModel[bc.newPropertyValueKey] = value;
            let sourcePropertyName = "";
            if (this.sourceOptions) {
                sourcePropertyName = this.sourceOptions.property;
            }
            else if (typeof this.options.sourceProperty === "string" && this.options.sourceProperty.indexOf(".") === -1) {
                sourcePropertyName = this.options.sourceProperty;
            }

            if (sourcePropertyName !== "") {
                changedModel[sourcePropertyName] = value;
            }

            let updateExpression = this.prepareExpressionForUpdate();
            this.prepareContextForExpression(changedModel, updateExpression, undefined);

            let expressionValue = this._getExpressionValue(updateExpression, true, changedModel);
            if (expressionValue instanceof Error) {
                traceWrite((<Error>expressionValue).message, traceCategories.Binding, traceMessageType.error);
            }

            newValue = expressionValue;
        }

        this.updateSource(newValue);
    }

    private _getExpressionValue(expression: string, isBackConvert: boolean, changedModel: any): any {
        try {
            let exp = polymerExpressions.PolymerExpressions.getExpression(expression);
            if (exp) {
                let context = this.source && this.source.get && this.source.get() || global;
                let model = {};
                let addedProps = [];
                const resources = application.getResources();
                for (let prop in resources) {
                    if (resources.hasOwnProperty(prop) && !context.hasOwnProperty(prop)) {
                        context[prop] = resources[prop];
                        addedProps.push(prop);
                    }
                }

                this.prepareContextForExpression(context, expression, addedProps);
                model[contextKey] = context;
                let result = exp.getValue(model, isBackConvert, changedModel ? changedModel : model);
                // clear added props
                let addedPropsLength = addedProps.length;
                for (let i = 0; i < addedPropsLength; i++) {
                    delete context[addedProps[i]];
                }
                addedProps.length = 0;

                return result;
            }
            return new Error(expression + " is not a valid expression.");
        }
        catch (e) {
            let errorMessage = "Run-time error occured in file: " + e.sourceURL + " at line: " + e.line + " and column: " + e.column;
            return new Error(errorMessage);
        }
    }

    public onSourcePropertyChanged(data: PropertyChangeData) {
        const sourceProps = this.sourceProperties;
        const sourcePropsLength = sourceProps.length;
        let changedPropertyIndex = sourceProps.indexOf(data.propertyName);
        let parentProps = "";
        if (changedPropertyIndex > -1) {
            parentProps = "$" + sourceProps.slice(0, changedPropertyIndex + 1).join("$");
            while (this.propertyChangeListeners.get(parentProps) !== data.object) {
                changedPropertyIndex += sourceProps.slice(changedPropertyIndex + 1).indexOf(data.propertyName) + 1;
                parentProps = "$" + sourceProps.slice(0, changedPropertyIndex + 1).join("$");
            }
        }

        if (this.options.expression) {
            const expressionValue = this._getExpressionValue(this.options.expression, false, undefined);
            if (expressionValue instanceof Error) {
                traceWrite(expressionValue.message, traceCategories.Binding, traceMessageType.error);
            } else {
                this.updateTarget(expressionValue);
            }
        } else {
            if (changedPropertyIndex > -1) {
                const props = sourceProps.slice(changedPropertyIndex + 1);
                const propsLength = props.length;
                if (propsLength > 0) {
                    let value = data.value;
                    for (let i = 0; i < propsLength; i++) {
                        value = value[props[i]];
                    }

                    this.updateTarget(value);
                } else if (data.propertyName === this.sourceOptions.property) {
                    this.updateTarget(data.value);
                }
            }
        }

        // we need to do this only if nested objects are used as source and some middle object has changed.
        if (changedPropertyIndex > -1 && changedPropertyIndex < sourcePropsLength - 1) {
            const probablyChangedObject = this.propertyChangeListeners.get(parentProps);
            if (probablyChangedObject &&
                probablyChangedObject !== data.object[sourceProps[changedPropertyIndex]]) {
                // remove all weakevent listeners after change, because changed object replaces object that is hooked for
                // propertyChange event
                for (let i = sourcePropsLength - 1; i > changedPropertyIndex; i--) {
                    const prop = "$" + sourceProps.slice(0, i + 1).join("$");
                    if (this.propertyChangeListeners.has(prop)) {
                        removeWeakEventListener(
                            this.propertyChangeListeners.get(prop),
                            Observable.propertyChangeEvent,
                            this.onSourcePropertyChanged,
                            this);
                        this.propertyChangeListeners.delete(prop);
                    }
                }

                const newProps = sourceProps.slice(changedPropertyIndex + 1);
                // add new weak event listeners
                const newObject = data.object[sourceProps[changedPropertyIndex]]
                if (!types.isNullOrUndefined(newObject) && typeof newObject === 'object') {
                    this.addPropertyChangeListeners(new WeakRef(newObject), newProps, parentProps);
                }
            }
        }
    }

    private prepareContextForExpression(model: Object, expression: string, newProps: Array<string>) {
        let parentViewAndIndex: { view: ViewBase, index: number };
        let parentView;
        let addedProps = newProps || [];
        if (expression.indexOf(bc.bindingValueKey) > -1) {
            model[bc.bindingValueKey] = model;
            addedProps.push(bc.bindingValueKey);
        }

        if (expression.indexOf(bc.parentValueKey) > -1) {
            parentView = this.getParentView(this.target.get(), bc.parentValueKey).view;
            if (parentView) {
                model[bc.parentValueKey] = parentView.bindingContext;
                addedProps.push(bc.parentValueKey);
            }
        }

        let parentsArray = expression.match(parentsRegex);
        if (parentsArray) {
            for (let i = 0; i < parentsArray.length; i++) {
                parentViewAndIndex = this.getParentView(this.target.get(), parentsArray[i]);
                if (parentViewAndIndex.view) {
                    model[bc.parentsValueKey] = model[bc.parentsValueKey] || {};
                    model[bc.parentsValueKey][parentViewAndIndex.index] = parentViewAndIndex.view.bindingContext;
                    addedProps.push(bc.parentsValueKey);
                }
            }
        }
    }

    private getSourcePropertyValue() {
        if (this.options.expression) {
            let changedModel = {};
            changedModel[bc.bindingValueKey] = this.source ? this.source.get() : undefined;
            let expressionValue = this._getExpressionValue(this.options.expression, false, changedModel);
            if (expressionValue instanceof Error) {
                traceWrite((<Error>expressionValue).message, traceCategories.Binding, traceMessageType.error);
            }
            else {
                return expressionValue;
            }
        }

        if (this.sourceOptions) {
            let sourceOptionsInstance = this.sourceOptions.instance.get();
            if (this.sourceOptions.property === bc.bindingValueKey) {
                return sourceOptionsInstance;
            } else if ((sourceOptionsInstance instanceof Observable) && (this.sourceOptions.property && this.sourceOptions.property !== "")) {
                return sourceOptionsInstance.get(this.sourceOptions.property);
            } else if (sourceOptionsInstance && this.sourceOptions.property && this.sourceOptions.property !== "" &&
                this.sourceOptions.property in sourceOptionsInstance) {
                return sourceOptionsInstance[this.sourceOptions.property];
            } else {
                traceWrite("Property: '" + this.sourceOptions.property + "' is invalid or does not exist. SourceProperty: '" + this.options.sourceProperty + "'", traceCategories.Binding, traceMessageType.error);
            }
        }

        return null;
    }

    public clearBinding() {
        this.clearSource();
        this.updateTarget(unsetValue);
    }

    private updateTarget(value: any) {
        if (this.updating) {
            return;
        }

        this.updateOptions(this.targetOptions, types.isNullOrUndefined(value) ? unsetValue : value);
    }

    private updateSource(value: any) {
        if (this.updating || !this.source || !this.source.get()) {
            return;
        }

        this.updateOptions(this.sourceOptions, value);
    }

    private getParentView(target: any, property: string): { view: ViewBase, index: number } {
        if (!target) {
            return { view: null, index: null };
        }

        let result: ViewBase;
        if (property === bc.parentValueKey) {
            result = target.parent;
        }

        let index = null;
        if (property.indexOf(bc.parentsValueKey) === 0) {
            result = target.parent;
            let indexParams = paramsRegex.exec(property);
            if (indexParams && indexParams.length > 1) {
                index = indexParams[2];
            }

            if (!isNaN(index)) {
                let indexAsInt = parseInt(index);
                while (indexAsInt > 0) {
                    result = result.parent;
                    indexAsInt--;
                }
            } else if (types.isString(index)) {
                while (result && result.typeName !== index) {
                    result = result.parent;
                }
            }
        }

        return { view: result, index: index };
    }

    private resolveOptions(obj: Object, properties: Array<string>): { instance: WeakRef<Object>; property: any } {
        let objectsAndProperties = this.resolveObjectsAndProperties(obj, properties);
        if (objectsAndProperties.length > 0) {
            let resolvedObj = objectsAndProperties[objectsAndProperties.length - 1].instance;
            let prop = objectsAndProperties[objectsAndProperties.length - 1].property;
            return {
                instance: new WeakRef(this.sourceAsObject(resolvedObj)),
                property: prop
            }
        }
        return null;
    }

    private updateOptions(options: { instance: WeakRef<any>; property: string }, value: any) {
        let optionsInstance;
        if (options && options.instance) {
            optionsInstance = options.instance.get();
        }

        if (!optionsInstance) {
            return;
        }

        this.updating = true;

        try {
            if (isEventOrGesture(options.property, <any>optionsInstance) &&
                types.isFunction(value)) {
                // calling off method with null as handler will remove all handlers for options.property event
                optionsInstance.off(options.property, null, optionsInstance.bindingContext);
                optionsInstance.on(options.property, value, optionsInstance.bindingContext);
            } else if (optionsInstance instanceof Observable) {
                optionsInstance.set(options.property, value);
            } else {
                optionsInstance[options.property] = value;
            }
        } catch (ex) {
            traceWrite("Binding error while setting property " + options.property + " of " + optionsInstance + ": " + ex,
                traceCategories.Binding,
                traceMessageType.error);
        }

        this.updating = false;
    }
}