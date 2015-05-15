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
var resourcesKey = "resources";

export class Bindable extends dependencyObservable.DependencyObservable implements definition.Bindable {

    public static bindingContextProperty = bindingContextProperty;

    // TODO: Implement with WeakRef to prevent memory leaks.
    private _bindings = {};

    get bindingContext(): Object {
        return this._getValue(Bindable.bindingContextProperty);
    }
    set bindingContext(value: Object) {
        this._setValue(Bindable.bindingContextProperty, value);
    }

    public bind(options: definition.BindingOptions, source?: Object) {
        var binding: Binding = this._bindings[options.targetProperty];
        if (binding) {
            binding.unbind();
        }

        binding = new Binding(this, options);
        this._bindings[options.targetProperty] = binding;

        var bindingSource = source;
        if (!bindingSource) {
            bindingSource = this.bindingContext;
        }
        if (!types.isNullOrUndefined(bindingSource)) {
            binding.bind(bindingSource);
        }
    }

    public unbind(property: string) {
        var binding: Binding = this._bindings[property];
        if (binding) {
            binding.unbind();
            delete this._bindings[property];
        }
    }

    public _updateTwoWayBinding(propertyName: string, value: any) {
        var binding: Binding = this._bindings[propertyName];

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
        var binding = this._bindings[property.name];
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
        for (var p in this._bindings) {
            binding = this._bindings[p];

            var sourceIsNotBindingContext = (binding.source && (binding.source.get() !== oldValue));
            if (binding.updating || sourceIsNotBindingContext) {
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
    source: WeakRef<Object>;
    target: WeakRef<Bindable>;
    weakEventId: number;

    private sourceOptions: { instance: WeakRef<any>; property: any };
    private targetOptions: { instance: WeakRef<any>; property: any };

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
        this.updateTarget(this.getSourceProperty());

        if (!this.sourceOptions) {
            this.sourceOptions = this.resolveOptions(this.source, this.options.sourceProperty);
        }

        if (this.sourceOptions) {
            var sourceOptionsInstance = this.sourceOptions.instance.get();
            if (sourceOptionsInstance instanceof observable.Observable) {
                weakEvents.addWeakEventListener(
                    sourceOptionsInstance,
                    observable.Observable.propertyChangeEvent,
                    this.onSourcePropertyChanged,
                    this);
            }
        }
    }

    public unbind() {
        if (!this.source) {
            return;
        }

        if (this.sourceOptions) {
            var sourceOptionsInstance = this.sourceOptions.instance.get();
            if (sourceOptionsInstance) {
                weakEvents.removeWeakEventListener(sourceOptionsInstance,
                    observable.Observable.propertyChangeEvent,
                    this.onSourcePropertyChanged,
                    this);
            }
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
    }

    public updateTwoWay(value: any) {
        if (this.updating) {
            return;
        }
        if (this.options.twoWay) {
            if (this._isExpression(this.options.expression)) {
                var changedModel = {};
                if (this.options.sourceProperty === bindingBuilder.bindingConstants.bindingValueKey) {
                    changedModel[bindingBuilder.bindingConstants.bindingValueKey] = value;
                }
                else {
                    changedModel[this.options.sourceProperty] = value;
                }
                var expressionValue = this._getExpressionValue(this.options.expression, true, changedModel);
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

    private _isExpression(expression: string): boolean {
        if (expression) {
            var result = expression.indexOf(" ") !== -1;
            return result;
        }
        else {
            return false;
        }
    }

    private _getExpressionValue(expression: string, isBackConvert: boolean, changedModel: any): any {
        try {
            var exp = polymerExpressions.PolymerExpressions.getExpression(expression);
            if (exp) {
                var context = this.source && this.source.get && this.source.get() || global;
                var model = {};
                model[contextKey] = context;
                model[resourcesKey] = appModule.resources;
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
        if (this._isExpression(this.options.expression)) {
            var expressionValue = this._getExpressionValue(this.options.expression, false, undefined);
            if (expressionValue instanceof Error) {
                trace.write((<Error>expressionValue).message, trace.categories.Binding, trace.messageType.error);
            }
            else {
                this.updateTarget(expressionValue);
            }
        } else if (data.propertyName === this.options.sourceProperty) {
            this.updateTarget(data.value);
        }
    }

    private getSourceProperty() {
        if (this._isExpression(this.options.expression)) {
            var changedModel = {};
            if (this.options.sourceProperty === bindingBuilder.bindingConstants.bindingValueKey) {
                changedModel[bindingBuilder.bindingConstants.bindingValueKey] = this.source.get();
            }
            var expressionValue = this._getExpressionValue(this.options.expression, false, changedModel);
            if (expressionValue instanceof Error) {
                trace.write((<Error>expressionValue).message, trace.categories.Binding, trace.messageType.error);
            }
            else {
                return expressionValue;
            }
        }

        if (!this.sourceOptions) {
            this.sourceOptions = this.resolveOptions(this.source, this.options.sourceProperty);
        }

        var value;

        if (this.sourceOptions) {
            var sourceOptionsInstance = this.sourceOptions.instance.get();
            if (this.sourceOptions.property === bindingBuilder.bindingConstants.bindingValueKey) {
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
            this.targetOptions = this.resolveOptions(this.target, this.options.targetProperty);
        }

        this.updateOptions(this.targetOptions, value);
    }

    private updateSource(value: any) {
        if (this.updating || (!this.source || !this.source.get())) {
            return;
        }

        if (!this.sourceOptions) {
            this.sourceOptions = this.resolveOptions(this.source, this.options.sourceProperty);
        }

        this.updateOptions(this.sourceOptions, value);
    }

    private resolveOptions(obj: WeakRef<any>, property: string): { instance: any; property: any } {
        var options;

        if (property === bindingBuilder.bindingConstants.bindingValueKey) {
            options = {
                instance: obj,
                property: property
            };
            return options;
        }

        if (!this._isExpression(property) && types.isString(property) && property.indexOf(".") !== -1) {
            var properties = property.split(".");

            var i: number;
            var currentObject = obj.get();

            for (i = 0; i < properties.length - 1; i++) {
                currentObject = currentObject[properties[i]];
            }

            if (!types.isNullOrUndefined(currentObject)) {
                options = {
                    instance: new WeakRef(currentObject),
                    property: properties[properties.length - 1]
                }
            }
        } else {
            options = {
                instance: obj,
                property: property
            }
        }

        return options;
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
