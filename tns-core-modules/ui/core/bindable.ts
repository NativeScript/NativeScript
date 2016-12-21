import * as definition from "ui/core/bindable";
import { Observable, PropertyChangeData } from "data/observable";
import { unsetValue, DependencyObservable, Property } from "ui/core/dependency-observable";
import { addWeakEventListener, removeWeakEventListener } from "ui/core/weak-event-listener";
import types = require("utils/types");
import bindingBuilder = require("../builder/binding-builder");
import { ViewBase, isEventOrGesture, bindingContextProperty } from "ui/core/view-base";
import * as application from "application";
import * as polymerExpressions from "js-libs/polymer-expressions";
import * as specialProperties from "ui/builder/special-properties";
import * as utils from "utils/utils";

import { enabled as traceEnabled, write as traceWrite, categories as traceCategories, messageType as traceMessageType } from "trace";

// let bindingContextProperty = new Property(
//     "bindingContext",
//     "Bindable",
//     new PropertyMetadata(undefined, PropertyMetadataSettings.Inheritable, onBindingContextChanged)
// );

// function onBindingContextChanged(data: DependencyPropertyChangeData) {
//     let bindable = <Bindable>data.object;
//     bindable._onBindingContextChanged(data.oldValue, data.newValue);
// }

let contextKey = "context";
// this regex is used to get parameters inside [] for example:
// from $parents['ListView'] will return 'ListView'
// from $parents[1] will return 1
let paramsRegex = /\[\s*(['"])*(\w*)\1\s*\]/;

let bc = bindingBuilder.bindingConstants;

let defaultBindingSource = {};

export class Bindable extends DependencyObservable implements definition.Bindable {

    public static bindingContextProperty = bindingContextProperty;

    private bindings = new Map<string, Binding>();

    get bindingContext(): Object {
        throw new Error("Not implemented");
    }
    set bindingContext(value: Object) {
        throw new Error("Not implemented");
    }

    public bind(options: definition.BindingOptions, source: Object = defaultBindingSource) {
        throw new Error("Not implemented");
        // let binding: Binding = this.bindings.get(options.targetProperty);
        // if (binding) {
        //     binding.unbind();
        // }

        // binding = new Binding(this, options);
        // this.bindings.set(options.targetProperty, binding);

        // let bindingSource = source;
        // if (bindingSource === defaultBindingSource) {
        //     bindingSource = this.bindingContext;
        //     binding.sourceIsBindingContext = true;
        // }

        // // if (!types.isNullOrUndefined(bindingSource)) {
        // binding.bind(bindingSource);
        // // }
    }

    public unbind(property: string) {
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

    public _setCore(data: PropertyChangeData) {
        super._setCore(data);
        this._updateTwoWayBinding(data.propertyName, data.value);
    }

    public _onPropertyChanged(property: Property, oldValue: any, newValue: any) {
        if (traceEnabled) {
            traceWrite(`${this}._onPropertyChanged(${property.name}, ${oldValue}, ${newValue})`, traceCategories.Binding);
        }
        super._onPropertyChanged(property, oldValue, newValue);
        // if (this instanceof viewModule.View) {
        //     if (property.inheritable && (<viewModule.View>(<any>this))._isInheritedChange() === true) {
        //         return;
        //     }
        // }

        let binding = this.bindings.get(property.name);
        if (binding && !binding.updating) {
            if (binding.options.twoWay) {
                if (traceEnabled) {
                    traceWrite(`${this}._updateTwoWayBinding(${property.name}, ${newValue});` + property.name, traceCategories.Binding);
                }
                this._updateTwoWayBinding(property.name, newValue);
            }
            else {
                if (traceEnabled) {
                    traceWrite(`${this}.unbind(${property.name});`, traceCategories.Binding);
                }
                this.unbind(property.name);
            }
        }
    }

    public _onBindingContextChanged(oldValue: any, newValue: any) {
        let bindingContextBinding = this.bindings.get("bindingContext");
        if (bindingContextBinding) {
            if (!bindingContextBinding.updating) {
                bindingContextBinding.bind(newValue);
            }
        }

        let bindingContextSource = this.bindingContext;

        this.bindings.forEach((binding, index, bindings) => {
            if (!binding.updating && binding.sourceIsBindingContext && binding.options.targetProperty !== "bindingContext") {
                if (traceEnabled) {
                    traceWrite(`Binding ${binding.target.get()}.${binding.options.targetProperty} to new context ${bindingContextSource}`, traceCategories.Binding);
                }
                if (!types.isNullOrUndefined(bindingContextSource)) {
                    binding.bind(bindingContextSource);
                } else {
                    binding.clearBinding();
                }
            }
        });
    }
}

let emptyArray = [];
function getProperties(property: string): Array<string> {
    let result: Array<string> = emptyArray;
    if (property) {
        // first replace all '$parents[..]' with a safe string
        // second removes all ] since they are not important for property access and not needed 
        // then split properties either on '.' or '['
        let parentsMatches = property.match(bindingBuilder.parentsRegex);
        result = property.replace(bindingBuilder.parentsRegex, "parentsMatch")
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
    public options: definition.BindingOptions;

    constructor(target: ViewBase, options: definition.BindingOptions) {
        this.target = new WeakRef(target);
        this.options = options;
        this.sourceProperties = getProperties(options.sourceProperty);
        this.targetOptions = this.resolveOptions(target, getProperties(options.targetProperty));
        if (!this.targetOptions) {
            throw new Error(`Invalid property: ${options.targetProperty} for target: ${target}`);
        }
    }

    public loadedHandlerVisualTreeBinding(args) {
        let target = args.object;
        target.off(ViewBase.loadedEvent, this.loadedHandlerVisualTreeBinding, this);
        if (!types.isNullOrUndefined(target.bindingContext)) {
            this.bind(target.bindingContext);
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
        let target = this.target.get();
        if (!target) {
            this.unbind();
            return;
        }

        let source = target.bindingContext;
        // We don't have source so this is first bindingContextChange.
        // Bind to the new source.
        if (!this.source) {
            this.bind(source);
        } else if (source == null || source === undefined) {
            this.clearBinding();
        }
    }

    public bind(source: Object): void {
        this.clearSource();

        source = this.sourceAsObject(source);

        if (!types.isNullOrUndefined(source)) {
            this.source = new WeakRef(source);
            this.sourceOptions = this.resolveOptions(source, this.sourceProperties);

            let sourceValue = this.getSourcePropertyValue();
            this.updateTarget(sourceValue);
            this.addPropertyChangeListeners(this.source, this.sourceProperties);
        } else if (!this.sourceIsBindingContext) {
            let sourceValue = this.getSourcePropertyValue();
            this.updateTarget(sourceValue ? sourceValue : source);
        } else if (this.sourceIsBindingContext && (source === undefined || source === null)) {
            this.target.get().off("bindingContextChange", this.bindingContextChanged, this);
            this.target.get().on("bindingContextChange", this.bindingContextChanged, this);
        }
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
                    targetInstance.off(ViewBase.loadedEvent, this.loadedHandlerVisualTreeBinding, this);
                    targetInstance.on(ViewBase.loadedEvent, this.loadedHandlerVisualTreeBinding, this);
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
            prop += "$" + objectsAndProperties[i].property;
            let currentObject = objectsAndProperties[i].instance;
            if (!this.propertyChangeListeners.has(prop) && currentObject instanceof Observable) {
                addWeakEventListener(
                    currentObject,
                    Observable.propertyChangeEvent,
                    this.onSourcePropertyChanged,
                    this);
                this.propertyChangeListeners.set(prop, currentObject);
            }
        }
    }

    public unbind() {
        if (!this.source) {
            return;
        }

        this.clearSource();

        let target = this.target.get();
        if (target) {
            target.off(`${bindingContextProperty}Change`, this.bindingContextChanged, this);
        }

        if (this.targetOptions) {
            this.targetOptions = undefined;
        }
        this.sourceProperties = undefined;
    }

    private prepareExpressionForUpdate(): string {
        // this regex is used to create a valid RegExp object from a string that has some special regex symbols like [,(,$ and so on.
        // Basically this method replaces all matches of 'source property' in expression with '$newPropertyValue'.
        // For example: with an expression similar to:
        // text="{{ sourceProperty = $parents['ListView'].test, expression = $parents['ListView'].test + 2}}"
        // update expression will be '$newPropertyValue + 2'
        // then on expression execution the new value will be taken and target property will be updated with the value of the expression.
        let escapedSourceProperty = utils.escapeRegexSymbols(this.options.sourceProperty);
        let expRegex = new RegExp(escapedSourceProperty, 'g');
        let resultExp = this.options.expression.replace(expRegex, bc.newPropertyValueKey);
        return resultExp;
    }

    public updateTwoWay(value: any) {
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
                for (let prop in application.resources) {
                    if (application.resources.hasOwnProperty(prop) && !context.hasOwnProperty(prop)) {
                        context[prop] = application.resources[prop];
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
        let sourceProps = this.sourceProperties;
        let sourcePropsLength = sourceProps.length;
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
            let expressionValue = this._getExpressionValue(this.options.expression, false, undefined);
            if (expressionValue instanceof Error) {
                traceWrite((<Error>expressionValue).message, traceCategories.Binding, traceMessageType.error);
            } else {
                this.updateTarget(expressionValue);
            }
        } else {
            if (changedPropertyIndex > -1) {
                let props = sourceProps.slice(changedPropertyIndex + 1);
                let propsLength = props.length;
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

        // we need to do this only if nested objects are used as source and some middle object is changed.
        if (changedPropertyIndex > -1 && changedPropertyIndex < sourcePropsLength - 1) {
            var probablyChangedObject = this.propertyChangeListeners.get(parentProps);
            if (probablyChangedObject &&
                probablyChangedObject !== data.object[sourceProps[changedPropertyIndex]]) {
                // remove all weakevent listeners after change, because changed object replaces object that is hooked for
                // propertyChange event
                for (let i = sourcePropsLength - 1; i > changedPropertyIndex; i--) {
                    let prop = "$" + sourceProps.slice(0, i + 1).join("$");
                    if (this.propertyChangeListeners.has(prop)) {
                        removeWeakEventListener(
                            this.propertyChangeListeners.get(prop),
                            Observable.propertyChangeEvent,
                            this.onSourcePropertyChanged,
                            this);
                        this.propertyChangeListeners.delete(prop);
                    }
                }

                let newProps = sourceProps.slice(changedPropertyIndex + 1);
                // add new weakevent listeners
                var newObject = data.object[sourceProps[changedPropertyIndex]]
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

        let parentsArray = expression.match(bindingBuilder.parentsRegex);
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
        this.updateTarget(undefined);
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
        if (!target || !(target instanceof ViewBase)) {
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
            if (optionsInstance instanceof ViewBase &&
                isEventOrGesture(options.property, <any>optionsInstance) &&
                types.isFunction(value)) {
                // calling off method with null as handler will remove all handlers for options.property event
                optionsInstance.off(options.property, null, optionsInstance.bindingContext);
                optionsInstance.on(options.property, value, optionsInstance.bindingContext);
            } else {
                let specialSetter = specialProperties.getSpecialPropertySetter(options.property);
                if (specialSetter) {
                    specialSetter(optionsInstance, value);
                } else {
                    if (optionsInstance instanceof Observable) {
                        optionsInstance.set(options.property, value);
                    } else {
                        optionsInstance[options.property] = value;
                    }
                }
            }
        }
        catch (ex) {
            traceWrite("Binding error while setting property " + options.property + " of " + optionsInstance + ": " + ex,
                traceCategories.Binding,
                traceMessageType.error);
        }

        this.updating = false;
    }
}