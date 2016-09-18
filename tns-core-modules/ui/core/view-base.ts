import {Observable, EventData} from "data/observable";

import {propagateInheritedProperties, clearInheritedProperties, applyNativeSetters, Property, InheritedProperty} from "./properties";
import {Binding, BindingOptions} from "ui/core/bindable";

import {ViewBase as ViewBaseDefinition} from "ui/core/view-base";
import {Style} from "ui/styling/style";

let bindingContextProperty = new InheritedProperty<ViewBase, any>({ name: "bindingContext" })
bindingContextProperty.register(ViewBase);

let defaultBindingSource = {};

export class ViewBase extends Observable implements ViewBaseDefinition {
    private _updatingJSPropertiesDict = {};
    private _style: Style;

    public bindingContext: any;
    public nativeView: any;
    public parent: ViewBase;

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
}