import { ViewBase as ViewBaseDefinition } from "ui/core/view-base";
import { Observable, EventData } from "data/observable";
import { Property, InheritedProperty, CssProperty, Style, clearInheritedProperties, propagateInheritedProperties, resetStyleProperties } from "./properties";
import { Binding, BindingOptions, Bindable } from "ui/core/bindable";
import { isIOS, isAndroid } from "platform";
import { fromString as gestureFromString } from "ui/gestures";
import { CssState, StyleScope, applyInlineSyle } from "ui/styling/style-scope";
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
    }

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
    }

    view.eachChild(localCallback);
}

export class ViewBase extends Observable implements ViewBaseDefinition {
    private _updatingJSPropertiesDict = {};
    private _style: Style;
    private _isLoaded: boolean;
    private _registeredAnimations: Array<KeyframeAnimation>;
    private _visualState: string;

    public bindingContext: any;
    public nativeView: any;
    public parent: ViewBase;
    public isCollapsed;

    public id: string;
    public className: string;

    public _cssState: CssState;
    constructor() {
        super();
        this._style = new Style(this);
    }

    get style(): Style {
        return this._style;
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
        this._loadEachChildView();
        this._applyStyleFromScope();
        this._emit("loaded");
    }

    get _childrenCount(): number {
        return 0;
    }

    public _loadEachChildView() {
        if (this._childrenCount > 0) {
            this.eachChild((child) => {
                child.onLoaded();
                return true;
            });
        }
    }

    public onUnloaded() {
        this._setCssState(null);
        this._unloadEachChildView();
        this._isLoaded = false;
        this._emit("unloaded");
    }

    private _unloadEachChildView() {
        if (this._childrenCount > 0) {
            this.eachChild((child) => {
                if (child.isLoaded) {
                    child.onUnloaded();
                }

                return true;
            });
        }
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
                applyInlineSyle(this, inlineStyle);
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

    // public _setCore(data: PropertyChangeData) {
    //     super._setCore(data);
    //     this._updateTwoWayBinding(data.propertyName, data.value);
    // }

    public nativePropertyChanged(property: Property<ViewBase, any>, newValue: any): void {
        if (this._updatingJSPropertiesDict[property.native]) {
            return;
        }
        this._updatingJSPropertiesDict[property.native] = true;
        property.set.call(this, newValue);
        delete this._updatingJSPropertiesDict[property.native];
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
        // TODO: Discuss this.
        if (this._isLoaded) {
            view.onLoaded();
        }

        propagateInheritedProperties(this);
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

export const visibilityProperty = new CssProperty<Style, "visible" | "hidden" | "collapse" | "collapsed">({
    name: "visibility", cssName: "visibility", defaultValue: "visible", affectsLayout: isIOS, valueChanged: (target, newValue) => {
        if (newValue !== "visible" && newValue !== "collapse" && newValue !== "collapsed" && newValue !== "hidden") {
            throw new Error(`Invalid visibility value: ${newValue}`);
        }

        target.view.isCollapsed = (newValue === "collapse" || newValue === "collapsed");
    }
});
visibilityProperty.register(Style);

export const bindingContextProperty = new InheritedProperty<ViewBase, any>({ name: "bindingContext" });
bindingContextProperty.register(ViewBase);


function onCssClassPropertyChanged(view: ViewBase, oldValue: string, newValue: string) {
    let classes = view.cssClasses;
    classes.clear();
    if (typeof newValue === "string") {
        newValue.split(" ").forEach(c => classes.add(c));
    }
}

export const classNameProperty = new Property<ViewBase, string>({ name: "className", valueChanged: onCssClassPropertyChanged });
classNameProperty.register(ViewBase);

function resetStyles(view: ViewBase): void {
    view.eachChild((child) => {
        child._cancelAllAnimations();
        resetStyleProperties(child.style);
        child._applyStyleFromScope();
        resetStyles(child);
        return true;
    });
}

export const idProperty = new Property<ViewBase, string>({ name: "id", valueChanged: (view, oldValue, newValue) => resetStyles(view) });
idProperty.register(ViewBase);