import { ViewBase as ViewBaseDefinition } from "ui/core/view-base";
import { Observable, EventData } from "data/observable";
import { Property, InheritedProperty, Style, clearInheritedProperties, propagateInheritedProperties, resetCSSProperties, applyNativeSetters, resetStyleProperties } from "./properties";
import { Binding, BindingOptions, Bindable } from "ui/core/bindable";
import { isIOS, isAndroid } from "platform";
import { fromString as gestureFromString } from "ui/gestures";
import { CssState, StyleScope, applyInlineStyle } from "ui/styling/style-scope";
import { SelectorCore } from "ui/styling/css-selector";
import { KeyframeAnimation } from "ui/animation/keyframe-animation";

import { enabled as traceEnabled, write as traceWrite, categories as traceCategories, notifyEvent as traceNotifyEvent, isCategorySet } from "trace";

export {
    KeyframeAnimation, Observable, EventData, Binding, BindingOptions, Bindable, isIOS, isAndroid,
    gestureFromString, traceEnabled, traceWrite, traceCategories, traceNotifyEvent, isCategorySet
};
export * from "./properties";

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

export function getEventOrGestureName(name: string): string {
    return name.indexOf("on") === 0 ? name.substr(2, name.length - 2) : name;
}

export function isEventOrGesture(name: string, view: ViewBaseDefinition): boolean {
    if (typeof name === "string") {
        let eventOrGestureName = getEventOrGestureName(name);
        let evt = `${eventOrGestureName}Event`;

        return view.constructor && evt in view.constructor ||
            gestureFromString(eventOrGestureName.toLowerCase()) !== undefined;
    }

    return false;
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

let viewIdCounter = 0;

export class ViewBase extends Observable implements ViewBaseDefinition {
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
    public _isAddedToNativeVisualTree: any;

    public _cssState: CssState;
    constructor() {
        super();
        this._domId = viewIdCounter++;
        this._style = new Style(this);
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

    get page(): ViewBaseDefinition {
        if (this.parent) {
            return this.parent.page;
        }

        return null;
    }

    public onLoaded() {
        this._isLoaded = true;
        this._loadEachChild();
        this._applyStyleFromScope();
        this._emit("loaded");
    }

    public _loadEachChild() {
        this.eachChild((child) => {
            child.onLoaded();
            return true;
        });
    }

    public onUnloaded() {
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
        let rootPage = this.page;
        if (!rootPage || !rootPage.isLoaded) {
            return;
        }
        let scope: StyleScope = (<any>rootPage)._getStyleScope();
        scope.applySelectors(this);
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
                applyInlineStyle(this, inlineStyle);
            } finally {
                // this.style._endUpdate();
            }
        }
    }

    private bindings = new Map<string, Binding>();
    public bind(options: BindingOptions, source: Object = defaultBindingSource): void {
        let binding: Binding = this.bindings.get(options.targetProperty);
        if (binding) {
            binding.unbind();
        }

        binding = new Binding(this, options);
        this.bindings.set(options.targetProperty, binding);

        let bindingSource = source;
        if (bindingSource === defaultBindingSource) {
            bindingSource = this.bindingContext;
            binding.sourceIsBindingContext = true;
        }

        // if (!types.isNullOrUndefined(bindingSource)) {
        binding.bind(bindingSource);
        // }
    }

    public unbind(property: string): void {
        let binding: Binding = this.bindings.get(property);
        if (binding) {
            binding.unbind();
            this.bindings.delete(property);
        }
    }

    public _updateTwoWayBinding(propertyName: string, value: any) {
        let binding: Binding = this.bindings.get(propertyName);
        if (binding) {
            binding.updateTwoWay(value);
        }
    }

    public requestLayout(): void {
        //
    }

    public eachChild(callback: (child: ViewBase) => boolean) {
        //
    }

    public _addView(view: ViewBase, atIndex?: number) {
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

    protected _addViewCore(view: ViewBase, atIndex?: number) {
        if (this._context) {
            view._setupUI(this._context, atIndex);
        }

        // TODO: Split this method - we want binding context before loaded.
        propagateInheritedProperties(this);

        // TODO: Discuss this.
        if (this._isLoaded) {
            view.onLoaded();
        }
    }

    /**
    * Core logic for removing a child view from this instance. Used by the framework to handle lifecycle events more centralized. Do not outside the UI Stack implementation.
    */
    public _removeView(view: ViewBase) {
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
        //
    }

    public _setupUI(context: android.content.Context, atIndex?: number) {
        traceNotifyEvent(this, "_setupUI");
        if (traceEnabled) {
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
            applyNativeSetters(this);
        }

        this.eachChild((child) => {
            child._setupUI(context);
            return true;
        });
    }

    public _tearDownUI(force?: boolean) {
        if (traceEnabled) {
            traceWrite(`${this}._tearDownUI(${force})`, traceCategories.VisualTreeEvents);
        }

        this.eachChild((child) => {
            child._tearDownUI(force);
            return true;
        });

        if (this.nativeView) {
            // TODO: rename and implement this as resetNativeSetters
            resetStyleProperties(this.style);
        }

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

    public _parentChanged(oldParent: ViewBase): void {
        //Overridden
        if (oldParent) {
            // Move these method in property class.
            clearInheritedProperties(this);
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
