/**
 * Contains the DependencyObservable class, which represents an extended Observable object that uses Property instances for value backing mechanism.
 */
declare module "ui/core/dependency-observable" {
    import { Observable, EventData } from "data/observable";

    /**
     * Value specifing that Property value should be reset. Used when bindingContext on bound property is creared/null.
     */
    export const unsetValue: any;

    /**
     * Interface used by Propery 'defaultValueGetter' function to specify if the default value returned by the native instance can be cached or not.
     * One example is - android.widget.Button background. It is state drawable so it cannot be reused/cached.
     */
    export interface NativeValueResult {
        result: any;
        cacheable: boolean;
    }

    /**
     * Represents a special Property which supports changed callback, metadata and value validation.
     */
    export class Property {

        /**
         * Creates a new Property instance.
         * @param name The name of the property.
         * @param ownerType The name of class that registers this property.
         * @param metadata The PropertyMetadata object associated with this property.
         * @param valueConverter A function that can create an instance of the property type given a string. Used when parsing CSS and XML attribute values which are strings.
         */
        constructor(name: string, ownerType: string, metadata: PropertyMetadata, valueConverter?: (value: string) => any);

        /**
         * Gets the name of the property. This is a read-only property.
         */
        name: string;

        /**
         * Gets the id of the property. This is used for fast lookup. This is a read-only property.
         */
        id: number;

        /**
         * Gets the PropertyMetadata object associated with the property. This is a read-only property.
         */
        metadata: PropertyMetadata;

        /**
         * Gets the valueConverter function associated with the property. This is a read-only property.
         */
        valueConverter: (value: string) => any

        /**
         * Gets or sets the defaultValueGetter function used to get the default value for this property.
         * If default value is 'undefined' and this property is set this function will be used to extract the default value from the native instance.
         */
        defaultValueGetter: (instance: DependencyObservable) => NativeValueResult;

        defaultValue: any;
        onValueChanged: PropertyChangedCallback;
        onValidateValue: PropertyValidationCallback;
        equalityComparer: PropertyEqualityComparer;
        affectsLayout: boolean;
        inheritable: boolean;
        affectsStyle: boolean;
    }

    /**
     * Represents an Object that describes a Property instance.
     */
    export class PropertyMetadata {
        /**
         * Creates a new PropertyMetadata instance.
         * @param defaultValue The default value for the property. E.g. 0 for a numeric property.
         * @param options An optional parameter that specifies how the associated property should be processed by the visual tree. Valid values are one or more bitwise combinations from the PropertyMetadataSettings module.
         * @param onChanged An optional callback that will be raised whenever the associated property changes for any DependencyObservable instance that uses the property to store a value.
         * @param onValidateValue An optional callback that will be raised prior to a change of the associated property for any DependencyObservable instance that uses the property.
         * @param equalityComparer An optional function that used to compare if two property values are equal.
         */
        constructor(
            defaultValue: any,
            options?: number,
            onChanged?: PropertyChangedCallback,
            onValidateValue?: PropertyValidationCallback,
            equalityComparer?: PropertyEqualityComparer);

        /**
         * Gets the options parameter passed to the constructor of this instance. This is a read-only property.
         */
        options: number;
        /**
         * Gets the default value parameter passed to the constructor of this instance. This is a read-only property.
         */
        defaultValue: any;
        /**
         * Gets or sets the callback to be raised whenever the associated property changes for any DependencyObservable instance that uses the property to store a value.
         */
        onValueChanged: PropertyChangedCallback;
        /**
         * Gets or sets the callback to be raised whenever the associated property is about to change for any DependencyObservable instance that uses the property to store a value.
         */
        onValidateValue: PropertyValidationCallback;
        /**
         * Gets function that used to compare if two property values are equal.
         */
        equalityComparer: PropertyEqualityComparer;
        /**
         * Checks whether the PropertyMetadataSettings.affectsLayout bit is present in the options value.
         */
        affectsLayout: boolean;
        /**
         * Checks whether the PropertyMetadataSettings.Inheritable bit is present in the options value.
         */
        inheritable: boolean;
        /**
         * Checks whether the PropertyMetadataSettings.AffectsStyle bit is present in the options value.
         */
        affectsStyle: boolean;
    }

    /**
     * The data for the event raised when a value of a Property changes for a DependencyObservable instance.
     */
    export interface PropertyChangeData extends EventData {
        /**
         * The Property associated with the change.
         */
        property: Property;
        /**
         * The old property value.
         */
        oldValue: any;
        /**
         * The new property value.
         */
        newValue: any;
    }

    /**
     * Defines the signature of the function that handles the propertyChanged event.
     */
    export interface PropertyChangedCallback {
        (data: PropertyChangeData): void;
    }

    /**
     * Defines the signature of the function that handles the validateValue event.
     */
    export interface PropertyValidationCallback {
        (value: any): boolean;
    }

    /**
     * Defines the signature of the function that compares if two property values are equal.
     */
    export interface PropertyEqualityComparer {
        (x: any, y: any): boolean;
    }

    /**
     * Represents an Object that is used to back a value for a Property in a DependencyObservable Object instance.
     */
    export class PropertyEntry {
        /**
         * Resets effective value and all the modifiers available for this entry.
         */
        resetValue(): void;

        /**
         * Gets the effective value of this entry.
         * The value is composed depending on the current valueSource value, using the following priority:
         *     1. VisualState
         *     2. Local
         *     3. Css
         *     4. Inherited
         *     5. Default
         */
        effectiveValue: any;
        /**
         * Gets the source of the current effective value for this entry. The available options for this property are defined in the ValueSource namespace.
         */
        valueSource: number;
        /**
         * Gets or sets the local value for this entry. This will trigger re-evaluation of the current effective value.
         */
        localValue: any;
        /**
         * Gets or sets the inherited value for this entry. This will trigger re-evaluation of the current effective value.
         */
        inheritedValue: any;
        /**
         * Gets or sets the css value for this entry. This will trigger re-evaluation of the current effective value.
         */
        cssValue: any;
        /**
         * Gets or sets the visual-state value for this entry. This will trigger re-evaluation of the current effective value.
         */
        visualStateValue: any;
    }

    /**
     * Represents an extended Observable Object that uses Property instances for value backing mechanism.
     * This routine allows for various value modifiers per Property, which is used for inheritance, data-binding and styling purposes.
     */
    export class DependencyObservable extends Observable {
        // TODO: Do we want to expose the get/setValue methods as public?
        /**
         * Gets a value for the property.
         * @param property - A dependency property to retrieve a value for.
         */
        _getValue(property: Property): any;

        /**
         * Gets the value source (local, inherited) of a property.
         * @param property - A dependency property to retrieve a value source for.
         */
        _getValueSource(property: Property): number;

        /**
         * Sets a value for a property.
         * @param property - A dependency property to set.
         * @param value - The new value.
         * @param source(optional) - The value source (default is local).
         */
        _setValue(property: Property, value: any, source?: number): void;

        /**
         * Resets a value for a property.
         * @param - property - A dependency property to reset.
         * @param source(optional) - The value source (default is local).
         */
        _resetValue(property: Property, source?: number): void;

        /**
         * Handler for property changed event.
         * @param property - A dependency property indentifier.
         * @param oldValue - The old value of the property.
         * @param newValue - The new value of the property.
         */
        _onPropertyChanged(property: Property, oldValue: any, newValue: any): void;

        /**
         * Iterates all the properties which have a PropertyEntry registered for this instance.
         */
        _resetValues(valueSource: number): void;
        _eachSetProperty(callback: (property: Property) => boolean): void;
        _eachSetPropertyValue(callback: (property: Property, value: any) => void): void;
        //@endprivate
    }

    /**
     * Lists the possible values for the PropertyMetadata.options property. Each actual numeric value is a power of two allowing for bitwise operations.
     */
    export module PropertyMetadataSettings {
        /**
         * No options are specified. This is the default value.
         */
        export var None: number;
        /**
         * A change in the Property associated with the metadata will invalidate the layout.
         */
        export var AffectsLayout;
        /**
         * The Property associated with the metadata is inheritable and its value should be propagated down in the visual tree.
         */
        export var Inheritable: number;
        /**
         * A change in the Property associated with the metadata will cause all CSS styles to be re-evaluated for for owning element.
         */
        export var AffectsStyle: number;
    }

    /**
     * Lists the possible values for the PropertyEntry.valueSource property.
     */
    export module ValueSource {
        /**
         * Default value, coming from the PropertyMetadata.defaultValue.
         */
        export var Default: number;
        /**
         * Inherited value, coming from the logical parent of the current DependencyObservable instance.
         */
        export var Inherited: number;
        /**
         * Css value, coming a css selector and rule that matches the current DependencyObservable instance.
         */
        export var Css: number;
        /**
         * Local value, set directly to the current DependencyObservable instance.
         */
        export var Local: number;
        /**
         * VisualState value, coming from a visual-state css selector. E.g. { button:pressed }.
         */
        export var VisualState: number;
    }
}