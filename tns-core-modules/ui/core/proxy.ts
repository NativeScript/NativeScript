import * as bindable from "ui/core/bindable";
import * as dependencyObservable from "ui/core/dependency-observable";
import * as definition from "ui/core/proxy";

export class PropertyMetadata extends dependencyObservable.PropertyMetadata implements definition.PropertyMetadata {
    private _onSetNativeValue: dependencyObservable.PropertyChangedCallback;

    constructor(
        defaultValue: any,
        options?: number,
        onChanged?: dependencyObservable.PropertyChangedCallback,
        onValidateValue?: dependencyObservable.PropertyValidationCallback,
        onSetNativeValue?: dependencyObservable.PropertyChangedCallback) {
        super(defaultValue, options, onChanged, onValidateValue);
        this._onSetNativeValue = onSetNativeValue;
    }

    get onSetNativeValue(): dependencyObservable.PropertyChangedCallback {
        return this._onSetNativeValue;
    }
    set onSetNativeValue(value: dependencyObservable.PropertyChangedCallback) {
        this._onSetNativeValue = value;
    }
}

export class ProxyObject extends bindable.Bindable implements definition.ProxyObject {
    private _updatingJSPropertiesDict = {};

    public nativeView: any;

    /**
     * Gets the android-specific native instance that lies behind this proxy. Will be available if running on an Android platform.
     */
    get android(): any {
        return undefined;
    }

    /**
     * Gets the ios-specific native instance that lies behind this proxy. Will be available if running on an iOS platform.
     */
    get ios(): any {
        return undefined;
    }

    // public _onPropertyChanged(property: dependencyObservable.Property, oldValue: any, newValue: any) {
    //     super._onPropertyChanged(property, oldValue, newValue);

    //     this._trySetNativeValue(property, oldValue, newValue);
    // }

    /**
     * A property has changed on the native side directly - e.g. the user types in a TextField.
     */
    public _onPropertyChangedFromNative(property: dependencyObservable.Property, newValue: any) {
        if (this._updatingJSPropertiesDict[property.name]) {
            return;
        }
        this._updatingJSPropertiesDict[property.name] = true;
        this._setValue(property, newValue);
        delete this._updatingJSPropertiesDict[property.name];
    }

    // public _syncNativeProperties() {
    //     // var that = this;
    //     // var eachPropertyCallback = function (property: dependencyObservable.Property): boolean {
    //     //     that._trySetNativeValue(property);
    //     //     return true;
    //     // }

    //     // this._eachSetProperty(eachPropertyCallback);
    // }

    /**
     * Checks whether the proxied native object has been created and properties may be applied to it.
     */
    // protected _canApplyNativeProperty(): boolean {
    //     return false;
    // }

    // private _trySetNativeValue(property: dependencyObservable.Property, oldValue?: any, newValue?: any) {
    //     if (this._updatingJSPropertiesDict[property.name]) {
    //         // This is the case when a property has changed from the native side directly and we have received the "_onPropertyChanged" event while synchronizing our local cache
    //         return;
    //     }

    //     if (!this._canApplyNativeProperty()) {
    //         // in android we have lazy loading and we do not have a native widget created yet, do not call the onSetNativeValue callback
    //         // properties will be synced when the widget is created
    //         return;
    //     }

    //     var metadata = property.metadata;
    //     if (!(metadata instanceof PropertyMetadata)) {
    //         return;
    //     }

    //     var proxyMetadata = <PropertyMetadata>metadata;
    //     if (proxyMetadata.onSetNativeValue) {
    //         if (types.isUndefined(newValue)) {
    //             newValue = this._getValue(property);
    //         }

    //         proxyMetadata.onSetNativeValue({
    //             object: this,
    //             property: property,
    //             eventName: observable.Observable.propertyChangeEvent,
    //             newValue: newValue,
    //             oldValue: oldValue
    //         });
    //     }
    // }
}