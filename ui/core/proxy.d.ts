declare module "ui/core/proxy" {
    import dependencyObservable = require("ui/core/dependency-observable");
    import bindable = require("ui/core/bindable");

    /**
     * A class that describes dependency property metadata.
     */
    class PropertyMetadata extends dependencyObservable.PropertyMetadata {
        /**
         * Gets or sets a dependencyObservable.PropertyChangedCallback which is used to set the value on native side.
         */
        public onSetNativeValue: dependencyObservable.PropertyChangedCallback;

        /**
         * Initializes a new instance of PropertyMetadata class.
         * @param defaultValue A value to be used as default value for the dependency property.
         * @param options (optional) A value that states how this property affects visual tree.
         * @param onChanged (optional) A callback function which will be executed when value of the dependency property is changed.
         * @param onValidateValue (optional) A callback function which will be executed to validate the value of the dependency property.
         * @param onSetNativeValue (optional) A callback function which will be executed to set the value on native side.
         */
        constructor(
            defaultValue: any,
            options?: number,
            onChanged?: dependencyObservable.PropertyChangedCallback,
            onValidateValue?: dependencyObservable.PropertyValidationCallback,
            onSetNativeValue?: dependencyObservable.PropertyChangedCallback);
    }

    /**
     * A class that serves as a proxy between JavaScript object and native object.
     * Used in cases when native instance is not avaibale yet (stores all properties).
     */
    class ProxyObject extends bindable.Bindable {
        /**
         * Gets the android-specific native instance that lies behind this proxy. Will be available if running on an Android platform.
         */
        public android: any;

        /**
         * Gets the ios-specific native instance that lies behind this proxy. Will be available if running on an iOS platform.
         */
        public ios: any;

        /**
         * A property is changed.
         */
        public _onPropertyChanged(property: dependencyObservable.Property, oldValue: any, newValue: any): void;

        /**
         * A property has changed on the native side directly - e.g. the user types in a TextField.
         */
        public _onPropertyChangedFromNative(property: dependencyObservable.Property, newValue: any): void;

        /**
         * Synchronizes all properties with native values.
         */
        public _syncNativeProperties(): void;
    }
} 