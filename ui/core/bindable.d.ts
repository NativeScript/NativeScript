declare module "ui/core/bindable" {
    import dependencyObservable = require("ui/core/dependency-observable");

    /**
     * The options object used in the Bindable.bind method.
     */
    export interface BindingOptions {
        /**
         * The property name of the source object (typically the ViewModel) to bind to.
         */
        sourceProperty: string;
        /**
         * The property name of the target object (that is the Bindable instance) to bind the source property to.
         */
        targetProperty: string;
        /**
         * True to establish a two-way binding, false otherwise. A two-way binding will synchronize both the source and the target property values regardless of which one initiated the change.
         */
        twoWay?: boolean;
    }

    /**
     * Represents an extended DependencyObservable object that supports data-binding.
     */
    export class Bindable extends dependencyObservable.DependencyObservable {
        /**
         * Represents the dependency Property used to back the bindingContext value.
         */
        public static bindingContextProperty: dependencyObservable.Property;

        /**
         * Gets or sets the binding context of this instance. This object is used as a source for each Binding that does not have a source object specified.
         */
        bindingContext: any;
        /**
         * Establishes a binding between the source object and this Bindable instance.
         * @param options The options for the binding.
         * @param source An optional parameter, specifying the source object to bind to. If no source is specified the bindingContext value (if any) will be used as a source.
         */
        bind(options: BindingOptions, source?: Object);
        /**
         * Removes the existing binding (if any) for the specified property.
         * @param property The name of the property to unbind.
         */
        unbind(property: string);

        //@private
        _updateTwoWayBinding(propertyName: string, value: any);
        _onBindingContextChanged(oldValue: any, newValue: any);
        //@endprivate
    }
}
