import observable = require("data/observable");
import definition = require("ui/core/bindable");
import dependencyObservable = require("ui/core/dependency-observable");
import weakEvents = require("ui/core/weak-event-listener");
import appModule = require("application");
import types = require("utils/types");
import trace = require("trace");
import polymerExpressions = require("js-libs/polymer-expressions");
import bindingBuilder = require("../builder/binding-builder");
import viewModule = require("ui/core/view");

var bindingContextProperty = new dependencyObservable.Property(
    "bindingContext",
    "Bindable",
    new dependencyObservable.PropertyMetadata(undefined, dependencyObservable.PropertyMetadataSettings.Inheritable, onBindingContextChanged)
    );

function onBindingContextChanged(data: dependencyObservable.PropertyChangeData) {
    var bindable = <Bindable>data.object;
    bindable._onBindingContextChanged(data.oldValue, data.newValue);
}

var contextKey = "context";
// this regex is used to get parameters inside [] for example:
// from $parents['ListView'] will return 'ListView'
// from $parents[1] will return 1
var paramsRegex = /\[\s*(['"])*(\w*)\1\s*\]/;

// this regex is used to search for all instaces of '$parents[]' within an expression
var parentsRegex = /\$parents\s*\[\s*(['"]*)\w*\1\s*\]/g;
var bc = bindingBuilder.bindingConstants;

export class Bindable extends dependencyObservable.DependencyObservable implements definition.Bindable {

    public static bindingContextProperty = bindingContextProperty;

    // TODO: Implement with WeakRef to prevent memory leaks.
    private _bindings: Object;

    private get bindings(): Object {
        if (!this._bindings) {
            this._bindings = {};
        }
        return this._bindings;
    }

    get bindingContext(): Object {
        return this._getValue(Bindable.bindingContextProperty);
    }
    set bindingContext(value: Object) {
        this._setValue(Bindable.bindingContextProperty, value);
    }

    public bind(options: definition.BindingOptions, source?: Object) {
        var binding: Binding = this.bindings[options.targetProperty];
        if (binding) {
            binding.unbind();
        }

        binding = new Binding(this, options);
        this.bindings[options.targetProperty] = binding;

        var bindingSource = source;
        if (!bindingSource) {
            bindingSource = this.bindingContext;
            binding.sourceIsBindingContext = true;
        }
        if (!types.isNullOrUndefined(bindingSource)) {
            binding.bind(bindingSource);
        }
    }

    public unbind(property: string) {
        var binding: Binding = this.bindings[property];
        if (binding) {
            binding.unbind();
            delete this.bindings[property];
        }
    }

    public _updateTwoWayBinding(propertyName: string, value: any) {
        var binding: Binding = this.bindings[propertyName];

        if (binding) {
            binding.updateTwoWay(value);
        }
    }

    public _setCore(data: observable.PropertyChangeData) {
        super._setCore(data);
        this._updateTwoWayBinding(data.propertyName, data.value);
    }

    public _onPropertyChanged(property: dependencyObservable.Property, oldValue: any, newValue: any) {
        trace.write("Bindable._onPropertyChanged(" + this + ") " + property.name, trace.categories.Binding);
        super._onPropertyChanged(property, oldValue, newValue);
        if (this instanceof viewModule.View) {
            if (property.metadata.inheritable && (<viewModule.View>(<any>this))._isInheritedChange() === true) {
                return;
            }
        }
        var binding = this.bindings[property.name];
        if (binding && !binding.updating) {
            if (binding.options.twoWay) {
                trace.write("_updateTwoWayBinding(" + this + "): " + property.name, trace.categories.Binding);
                this._updateTwoWayBinding(property.name, newValue);
            }
            else {
                trace.write("_onPropertyChanged(" + this + ") removing binding for property: " + property.name, trace.categories.Binding);
                this.unbind(property.name);
            }
        }
    }

    public _onBindingContextChanged(oldValue: any, newValue: any) {
        var binding: Binding;
        for (var p in this.bindings) {
            binding = this.bindings[p];

            if (binding.updating || !binding.sourceIsBindingContext) {
                continue;
            }

            trace.write(
                "Binding target: " + binding.target.get() +
                " targetProperty: " + binding.options.targetProperty +
                " to the changed context: " + newValue, trace.categories.Binding);
            binding.unbind();
            if (!types.isNullOrUndefined(newValue)) {
                binding.bind(newValue);
            }
        }
    }
}

export class Binding {
    options: definition.BindingOptions;
    updating = false;
    sourceIsBindingContext: boolean;
    source: WeakRef<Object>;
    target: WeakRef<Bindable>;

    private propertyChangeListeners = {};

    private sourceOptions: { instance: WeakRef<any>; property: any };
    private targetOptions: { instance: WeakRef<any>; property: any };

    private sourcePropertiesArray: Array<string>;

    constructor(target: Bindable, options: definition.BindingOptions) {
        this.target = new WeakRef(target);
        this.options = options;
    }

    public bind(obj: Object) {
        if (types.isNullOrUndefined(obj)) {
            throw new Error("Expected valid object reference as a source in the Binding.bind method.");
        }

        /* tslint:disable */
        if (typeof (obj) === "number") {
            obj = new Number(obj);
        }

        if (typeof (obj) === "boolean") {
            obj = new Boolean(obj);
        }

        if (typeof (obj) === "string") {
            obj = new String(obj);
        }
        /* tslint:enable */
        this.source = new WeakRef(obj);
        this.updateTarget(this.getSourcePropertyValue());

        if (!this.sourceOptions) {
            this.sourceOptions = this.resolveOptions(this.source, this.getSourceProperties());
        }

        this.addPropertyChangeListeners(this.source, this.getSourceProperties());
    }

    private getSourceProperties(): Array<string> {
        if (!this.sourcePropertiesArray) {
            this.sourcePropertiesArray = Binding.getProperties(this.options.sourceProperty);
        }
        return this.sourcePropertiesArray;
    }

    private static getProperties(property: string) {
        return property.split(".");
    }

    private resolveObjectsAndProperties(source: Object, propsArray: Array<string>) {
        var result = [];
        var i;
        var propsArrayLength = propsArray.length;
        var currentObject = source;
        var objProp = "";
        var currentObjectChanged = false;
        for (i = 0; i < propsArrayLength; i++) {
            objProp = propsArray[i];
            if (propsArray[i] === bc.bindingValueKey) {
                currentObjectChanged = true;
            }
            if (propsArray[i] === bc.parentValueKey || propsArray[i].indexOf(bc.parentsValueKey) === 0) {
                var parentView = this.getParentView(this.target.get(), propsArray[i]).view;
                if (parentView) {
                    currentObject = parentView.bindingContext;
                }
                currentObjectChanged = true;
            }
            result.push({ instance: currentObject, property: objProp });
            if (!currentObjectChanged) {
                currentObject = currentObject[propsArray[i]];
                currentObjectChanged = false;
            }
        }
        return result;
    }

    private addPropertyChangeListeners(source: WeakRef<Object>, sourceProperty: Array<string>) {
        var objectsAndProperties = this.resolveObjectsAndProperties(source.get(), sourceProperty)
        var objectsAndPropertiesLength = objectsAndProperties.length;
        if (objectsAndPropertiesLength > 0) {
            var i;
            for (i = 0; i < objectsAndPropertiesLength; i++) {
                var prop = objectsAndProperties[i].property;
                var currentObject = objectsAndProperties[i].instance;
                if (!this.propertyChangeListeners[prop] && currentObject instanceof observable.Observable) {
                    weakEvents.addWeakEventListener(
                        currentObject,
                        observable.Observable.propertyChangeEvent,
                        this.onSourcePropertyChanged,
                        this);
                    this.propertyChangeListeners[prop] = currentObject;
                }
            }
        }
    }

    public unbind() {
        if (!this.source) {
            return;
        }

        var i;
        var propertyChangeListenersKeys = Object.keys(this.propertyChangeListeners);
        for (i = 0; i < propertyChangeListenersKeys.length; i++) {
            weakEvents.removeWeakEventListener(
                this.propertyChangeListeners[propertyChangeListenersKeys[i]],
                observable.Observable.propertyChangeEvent,
                this.onSourcePropertyChanged,
                this);
            delete this.propertyChangeListeners[propertyChangeListenersKeys[i]];
        }

        if (this.source) {
            this.source.clear();
        }
        if (this.sourceOptions) {
            this.sourceOptions.instance.clear();
            this.sourceOptions = undefined;
        }
        if (this.targetOptions) {
            this.targetOptions = undefined;
        }
        this.sourcePropertiesArray = undefined;
    }

    private prepareExpressionForUpdate(): string {
        // this regex is used to create a valid RegExp object from a string that has some special regex symbols like [,(,$ and so on.
        // Basically this method replaces all matches of 'source property' in expression with '$newPropertyValue'.
        // For example: with an expression similar to:
        // text="{{ sourceProperty = $parents['ListView'].test, expression = $parents['ListView'].test + 2}}"
        // update expression will be '$newPropertyValue + 2'
        // then on expression execution the new value will be taken and target property will be updated with the value of the expression.
        var escapeRegex = /[-\/\\^$*+?.()|[\]{}]/g;
        var escapedSourceProperty = this.options.sourceProperty.replace(escapeRegex, '\\$&');
        var expRegex = new RegExp(escapedSourceProperty, 'g');
        var resultExp = this.options.expression.replace(expRegex, bc.newPropertyValueKey);
        return resultExp;
    }

    public updateTwoWay(value: any) {
        if (this.updating) {
            return;
        }
        if (this.options.twoWay) {
            if (this.options.expression) {
                var changedModel = {};
                changedModel[bc.bindingValueKey] = value;
                changedModel[bc.newPropertyValueKey] = value;
                var sourcePropertyName = "";
                if (this.sourceOptions) {
                    sourcePropertyName = this.sourceOptions.property;
                }
                else if (typeof this.options.sourceProperty === "string" && this.options.sourceProperty.indexOf(".") === -1) {
                    sourcePropertyName = this.options.sourceProperty;
                }
                if (sourcePropertyName !== "") {
                    changedModel[sourcePropertyName] = value;
                }
                var updateExpression = this.prepareExpressionForUpdate();
                this.prepareContextForExpression(changedModel, updateExpression);
                var expressionValue = this._getExpressionValue(updateExpression, true, changedModel);
                if (expressionValue instanceof Error) {
                    trace.write((<Error>expressionValue).message, trace.categories.Binding, trace.messageType.error);
                }
                else {
                    this.updateSource(expressionValue);
                }
            }
            else {
                this.updateSource(value);
            }
        }
    }

    private _getExpressionValue(expression: string, isBackConvert: boolean, changedModel: any): any {
        try {
            var exp = polymerExpressions.PolymerExpressions.getExpression(expression);
            if (exp) {
                var context = this.source && this.source.get && this.source.get() || global;
                var model = {};
                for (var prop in appModule.resources) {
                    if (appModule.resources.hasOwnProperty(prop) && !context.hasOwnProperty(prop)) {
                        context[prop] = appModule.resources[prop];
                    }
                }

                this.prepareContextForExpression(context, expression);

				model[contextKey] = context;
				return exp.getValue(model, isBackConvert, changedModel);
            }
            return new Error(expression + " is not a valid expression.");
        }
        catch (e) {
            var errorMessage = "Run-time error occured in file: " + e.sourceURL + " at line: " + e.line + " and column: " + e.column;
            return new Error(errorMessage);
        }
    }

    public onSourcePropertyChanged(data: observable.PropertyChangeData) {
        if (this.options.expression) {
            var expressionValue = this._getExpressionValue(this.options.expression, false, undefined);
            if (expressionValue instanceof Error) {
                trace.write((<Error>expressionValue).message, trace.categories.Binding, trace.messageType.error);
            }
            else {
                this.updateTarget(expressionValue);
            }
        } else {
            var propIndex = this.getSourceProperties().indexOf(data.propertyName);
            if (propIndex > -1) {
                var props = this.getSourceProperties().slice(propIndex + 1);
                var propsLength = props.length;
                if (propsLength > 0) {
                    var value = data.value;
                    var i;
                    for (i = 0; i < propsLength; i++) {
                        value = value[props[i]];
                    }
                    this.updateTarget(value);
                }
                else if (data.propertyName === this.sourceOptions.property) {
                    this.updateTarget(data.value);
                }
            }
        }

        var sourceProps = Binding.getProperties(this.options.sourceProperty);
        var sourcePropsLength = sourceProps.length;
        var changedPropertyIndex = sourceProps.indexOf(data.propertyName);
        if (changedPropertyIndex > -1) {
            var probablyChangedObject = this.propertyChangeListeners[sourceProps[changedPropertyIndex + 1]];
            if (probablyChangedObject &&
                probablyChangedObject !== data.object[sourceProps[changedPropertyIndex]]) {
                // remove all weakevent listeners after change, because changed object replaces object that is hooked for
                // propertyChange event
                for (i = sourcePropsLength - 1; i > changedPropertyIndex; i--) {
                    weakEvents.removeWeakEventListener(
                        this.propertyChangeListeners[sourceProps[i]],
                        observable.Observable.propertyChangeEvent,
                        this.onSourcePropertyChanged,
                        this);
                    delete this.propertyChangeListeners[sourceProps[i]];
                }
                //var newProps = this.options.sourceProperty.substr(this.options.sourceProperty.indexOf(data.propertyName) + data.propertyName.length + 1);
                var newProps = sourceProps.slice(changedPropertyIndex + 1);
                // add new weakevent listeners
                this.addPropertyChangeListeners(new WeakRef(data.object[sourceProps[changedPropertyIndex]]), newProps);
            }
        }
    }

    private prepareContextForExpression(model, expression) {
        var parentViewAndIndex;
        var parentView;
        if (expression.indexOf(bc.parentValueKey) > -1) {
            parentView = this.getParentView(this.target.get(), bc.parentValueKey).view;
            if (parentView) {
                model[bc.parentValueKey] = parentView.bindingContext;
            }
        }

        var parentsArray = expression.match(parentsRegex);
        if (parentsArray) {
            var i;
            for (i = 0; i < parentsArray.length; i++) {
                parentViewAndIndex = this.getParentView(this.target.get(), parentsArray[i]);
                if (parentViewAndIndex.view) {
                    model[bc.parentsValueKey] = model[bc.parentsValueKey] || {};
                    model[bc.parentsValueKey][parentViewAndIndex.index] = parentViewAndIndex.view.bindingContext;
                }
            }
        }
    }

    private getSourcePropertyValue() {
        if (this.options.expression) {
            var changedModel = {};
            changedModel[bc.bindingValueKey] = this.source.get();
            var expressionValue = this._getExpressionValue(this.options.expression, false, changedModel);
            if (expressionValue instanceof Error) {
                trace.write((<Error>expressionValue).message, trace.categories.Binding, trace.messageType.error);
            }
            else {
                return expressionValue;
            }
        }

        if (!this.sourceOptions) {
            this.sourceOptions = this.resolveOptions(this.source, this.getSourceProperties());
        }

        var value;

        if (this.sourceOptions) {
            var sourceOptionsInstance = this.sourceOptions.instance.get();
            if (this.sourceOptions.property === bc.bindingValueKey) {
                value = sourceOptionsInstance;
            }
            else if (sourceOptionsInstance instanceof observable.Observable) {
                value = sourceOptionsInstance.get(this.sourceOptions.property);
            }
            else if (sourceOptionsInstance && this.sourceOptions.property &&
                this.sourceOptions.property in sourceOptionsInstance) {
                value = sourceOptionsInstance[this.sourceOptions.property];
            }
        }
        return value;
    }

    private updateTarget(value: any) {
        if (this.updating || (!this.target || !this.target.get())) {
            return;
        }

        if (!this.targetOptions) {
            this.targetOptions = this.resolveOptions(this.target, Binding.getProperties(this.options.targetProperty));
        }

        this.updateOptions(this.targetOptions, value);
    }

    private updateSource(value: any) {
        if (this.updating || (!this.source || !this.source.get())) {
            return;
        }

        if (!this.sourceOptions) {
            this.sourceOptions = this.resolveOptions(this.source, this.getSourceProperties());
        }

        this.updateOptions(this.sourceOptions, value);
    }

    private getParentView(target, property) {
        if (!target || !(target instanceof viewModule.View)) {
            return {view: null, index: null};
        }
        
        var result;        
        if (property === bc.parentValueKey) {
            result = target.parent;
        }

        if (property.indexOf(bc.parentsValueKey) === 0) {
            result = target.parent;
            var indexParams = paramsRegex.exec(property);
            var index;
            if (indexParams && indexParams.length > 1) {
                index = indexParams[2];
            }
            
            if (!isNaN(index)) {
                var indexAsInt = parseInt(index);
                while (indexAsInt > 0) {
                    result = result.parent;
                    indexAsInt--;
                }
            }
            else {
                while (result && result.typeName !== index) {
                    result = result.parent;
                }
            }
        }

        return { view: result, index: index };
    }

    private resolveOptions(obj: WeakRef<any>, properties: Array<string>): { instance: any; property: any } {
        var objectsAndProperties = this.resolveObjectsAndProperties(obj.get(), properties);
        if (objectsAndProperties.length > 0) {
            var resolvedObj = objectsAndProperties[objectsAndProperties.length - 1].instance;
            var prop = objectsAndProperties[objectsAndProperties.length - 1].property;
            return {
                instance: new WeakRef(resolvedObj),
                property: prop
            }
        }
        else {
            return null;
        }
    }

    private updateOptions(options: { instance: WeakRef<any>; property: any }, value: any) {
        var optionsInstance;
        if (options && options.instance) {
            optionsInstance = options.instance.get();
        }
        if (!optionsInstance) {
            return;
        }

        this.updating = true;

        try {
            if (optionsInstance instanceof observable.Observable) {
                optionsInstance.set(options.property, value);
            } else {
                optionsInstance[options.property] = value;
            }
        }
        catch (ex) {
            trace.write("Binding error while setting property " + options.property + " of " + optionsInstance + ": " + ex,
                trace.categories.Binding,
                trace.messageType.error);
        }

        this.updating = false;
    }
}