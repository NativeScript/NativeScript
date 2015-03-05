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
        //@private
        /**
         * An expression used for calculations (convertions) based on the value of the property.
         */
        expression?: string;
        //@endprivate
    }

    
    //@private
    /**
     * An interface which defines methods need to create binding value converter.
     */
    export interface ValueConverter {
        /**
         * A method that will be executed when a value (of the binding property) should be converted to the observable model.
         * For example: user types in a text field, but our business logic requires to store data in a different manner (e.g. in lower case).
         * @param params - An array of parameters where first element is the value of the property and next elements are parameters send to converter.
         */
        toModel: (...params: any[]) => any;
        /**
         * A method that will be executed when a value should be converted to the UI view. For example we have a date object which should be displayed to the end user in a specific date format.
         * @param params - An array of parameters where first element is the value of the property and next elements are parameters send to converter.
         */
        toView: (...params: any[]) => any;
    }
    //@endprivate

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
        static _getBindingOptions(name: string, bindingExpression: string): BindingOptions;
        _updateTwoWayBinding(propertyName: string, value: any);
        _onBindingContextChanged(oldValue: any, newValue: any);
        //@endprivate
    }
}
