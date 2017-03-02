// Definitions.
import { ViewBase as ViewBaseDefinition } from "ui/core/view-base";
import { Page } from "ui/page";
import { SelectorCore } from "ui/styling/css-selector";
import { Order, FlexGrow, FlexShrink, FlexWrapBefore, AlignSelf } from "ui/layouts/flexbox-layout";
import { Length } from "../../styling/style-properties";
import { KeyframeAnimation } from "ui/animation/keyframe-animation";

// Types.
import { Property, InheritedProperty, Style, clearInheritedProperties, propagateInheritableProperties, propagateInheritableCssProperties, resetCSSProperties, initNativeView, resetNativeView } from "../properties";
import { Binding, BindingOptions, Observable, WrappedValue, PropertyChangeData, traceEnabled, traceWrite, traceCategories, traceNotifyEvent } from "ui/core/bindable";
import { isIOS, isAndroid } from "platform";
import { layout } from "utils/utils";

// TODO: Remove this import!
import * as types from "utils/types";

import { Color } from "color";

export { isIOS, isAndroid, layout, Color };
export * from "ui/core/bindable";
export * from "../properties";

import * as ssm from "ui/styling/style-scope";
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

export class ViewBase extends Observable implements ViewBaseDefinition {
    public static loadedEvent = "loaded";
    public static unloadedEvent = "unloaded";

    public recycleNativeView: boolean;

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
        return undefined;
    }

    get ios(): any {
        return undefined;
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

    public get inlineStyleSelector(): SelectorCore {
        return this._inlineStyleSelector;
    }

    public set inlineStyleSelector(value: SelectorCore) {
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
        this._styleScope = null;
        this._setCssState(null);
        this._unloadEachChild();
        this._isLoaded = false;
        this._emit("unloaded");
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
        if (!this._cssState) {
            return;
        }

        // this.style._beginUpdate();
        this._cssState.apply();
        // this.style._endUpdate();
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
        propagateInheritableProperties(this);

        const styleScope = this._styleScope;
        if (styleScope) {
            view._setStyleScope(styleScope);
        }

        propagateInheritableCssProperties(this.style);

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
        if (view.isLoaded) {
            view.onUnloaded();
        }

        // view.unsetInheritedProperties();

        if (view._context) {
            view._tearDownUI();
        }
    }

    public _createNativeView() {
        //
    }

    public _disposeNativeView() {
        //
    }

    public _initNativeView(): void {
        //
    }

    public _resetNativeView(): void {
        if (this.nativeView && this.recycleNativeView) {
            resetNativeView(this);
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

        // TODO: refactor createUI to return native view
        this._createNativeView();
        this.nativeView = (<any>this)._nativeView;

        this._initNativeView();

        if (this.parent) {
            let nativeIndex = this.parent._childIndexToNativeChildIndex(atIndex);
            this._isAddedToNativeVisualTree = this.parent._addViewToNativeVisualTree(this, nativeIndex);
        }

        if (this.nativeView) {
            initNativeView(this);
        }

        this.eachChild((child) => {
            child._setupUI(context);
            return true;
        });
    }

    public _tearDownUI(force?: boolean) {
        if (traceEnabled()) {
            traceWrite(`${this}._tearDownUI(${force})`, traceCategories.VisualTreeEvents);
        }

        this.eachChild((child) => {
            child._tearDownUI(force);
            return true;
        });

        if (this.parent) {
            this.parent._removeViewFromNativeVisualTree(this);
        }

        this._resetNativeView();

        this._disposeNativeView();

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
                oldParent.parent.off("bindingContextChange", this.bindingContextChanged, this);
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
    view._cancelAllAnimations();
    resetCSSProperties(view.style);
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
