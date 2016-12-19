import {
    PropertyMetadata as PropertyMetadataDefinition, Property as PropertyDefinition, PropertyEntry as PropertyEntryDefinition,
    DependencyObservable as DependencyObservableDefinition, NativeValueResult,
    PropertyChangedCallback, PropertyValidationCallback, PropertyEqualityComparer
} from "ui/core/dependency-observable";
import { Observable, WrappedValue } from "data/observable";
import { getClassInfo, isString } from "utils/types";

// use private variables in the scope of the module rather than static members of the class since a member is still accessible through JavaScript and may be changed.
var propertyFromKey = {};
var propertyIdCounter = 0;
export const unsetValue = new Object();

function generatePropertyKey(name: string, ownerType: string, validate?: boolean) {
    if (validate) {
        validateRegisterParameters(name, ownerType);
    }
    return ownerType + "." + name;
}

function validateRegisterParameters(name: string, ownerType: string) {
    if (name == null || name.trim().length === 0) {
        throw new Error("Name should not be null or empty string.");
    }

    if (ownerType == null || ownerType.trim().length === 0) {
        throw new Error("OwnerType should not be null or empty string.");
    }
}

function getPropertyByNameAndType(name: string, owner: any): Property {
    var result;
    var key;
    var classInfo = getClassInfo(owner);
    while (classInfo) {
        key = generatePropertyKey(name, classInfo.name);
        result = propertyFromKey[key];
        if (result) {
            break;
        }
        classInfo = classInfo.baseClassInfo;
    }
    return result;
}

export module PropertyMetadataSettings {
    export var None = 0;
    export var AffectsLayout = 1;
    export var AffectsStyle = 1 << 1;
    export var Inheritable = 1 << 2;
}

export module ValueSource {
    export var Default = 0;
    export var Inherited = 1;
    export var Css = 2;
    export var Local = 3;
    export var VisualState = 4;
}

export class PropertyMetadata implements PropertyMetadataDefinition {
    public inheritable: boolean;
    public affectsStyle: boolean;
    public affectsLayout: boolean;
    public onValueChanged: PropertyChangedCallback;
    public onValidateValue: PropertyValidationCallback;
    public equalityComparer: PropertyEqualityComparer;

    constructor(
        public defaultValue: any,
        public options: number = PropertyMetadataSettings.None,
        onChanged?: PropertyChangedCallback,
        onValidateValue?: PropertyValidationCallback,
        equalityComparer?: PropertyEqualityComparer) {

        this.defaultValue = defaultValue;
        this.options = options;
        this.onValueChanged = onChanged;
        this.onValidateValue = onValidateValue;
        this.equalityComparer = equalityComparer;
        this.inheritable = (options & PropertyMetadataSettings.Inheritable) === PropertyMetadataSettings.Inheritable;
        this.affectsStyle = (options & PropertyMetadataSettings.AffectsStyle) === PropertyMetadataSettings.AffectsStyle;
        this.affectsLayout = (options & PropertyMetadataSettings.AffectsLayout) === PropertyMetadataSettings.AffectsLayout;
    }
}

export class Property implements PropertyDefinition {
    public key: string;

    public id: number;
    public defaultValue;
    public equalityComparer;
    public inheritable;
    public affectsStyle;
    public affectsLayout;
    public nameEvent: string;

    public onValidateValue;
    public onValueChanged: PropertyChangedCallback;

    public valueConverter: (value: string) => any

    constructor(public name: string, public ownerType: string, public metadata: PropertyMetadata, valueConverter?: (value: string) => any) {
        // register key
        this.key = generatePropertyKey(name, ownerType, true);
        if (propertyFromKey[this.key]) {
            throw new Error("Property " + name + " already registered for type " + ownerType + ".");
        }

        propertyFromKey[this.key] = this;

        if (!metadata || !(metadata instanceof PropertyMetadata)) {
            throw new Error("Expected valid PropertyMetadata instance.");
        }

        this.name = name;
        this.nameEvent = name + "Change";
        this.ownerType = ownerType;
        this.metadata = metadata;

        // generate a unique numeric id for each property (faster lookup than a string key)
        this.id = propertyIdCounter++;
        this.valueConverter = valueConverter;
        this.defaultValue = metadata.defaultValue;
        this.onValueChanged = metadata.onValueChanged;
        this.onValidateValue = metadata.onValidateValue;
        this.equalityComparer = metadata.equalityComparer || ((x, y) => x === y);
        this.inheritable = metadata.inheritable;
        this.affectsStyle = metadata.affectsStyle;
        this.affectsLayout = metadata.affectsLayout;
    }

    public defaultValueGetter: (instance: DependencyObservable) => NativeValueResult;
}

export class PropertyEntry implements PropertyEntryDefinition {
    public valueSource: number = ValueSource.Default;
    public defaultValue: any;
    public inheritedValue: any;
    public cssValue: any;
    public localValue: any;
    public effectiveValue: any;
    public visualStateValue: any;

    constructor(public property: Property) {
    }

    public resetValue() {
        this.valueSource = ValueSource.Default;
        this.inheritedValue = this.cssValue = this.localValue = this.visualStateValue = this.effectiveValue = undefined;
    }
}

export class DependencyObservable extends Observable implements DependencyObservableDefinition {
    private _propertyEntries = {};

    public set(name: string, value: any) {
        var property = getPropertyByNameAndType(name, this);
        if (property) {
            this._setValueInternal(property, value, ValueSource.Local);
        } else {
            super.set(name, value);
        }
    }

    public get(name: string): any {
        var property = getPropertyByNameAndType(name, this);
        if (property) {
            return this._getValue(property);
        } else {
            return super.get(name);
        }
    }

    public _setValue(property: Property, value: any, source?: number) {
        this._setValueInternal(property, value, source || ValueSource.Local);
    }

    public _getValueSource(property: Property): number {
        var entry: PropertyEntry = this._propertyEntries[property.id];
        if (entry) {
            return entry.valueSource;
        }

        return ValueSource.Default;
    }

    public _getValue(property: Property): any {
        var entry: PropertyEntry = this._propertyEntries[property.id];
        if (entry) {
            return entry.effectiveValue;
        }
        else {
            return this._getDefaultValue(property);
        }
    }

    private _getDefaultValue(property: Property): any {
        if (property.defaultValueGetter) {
            // we check for cached properties only for these which have 'defaultValueGetter' defined;
            // When DependencyProperties are removed from Style - fix this check.
            let defaultValueResult = property.defaultValueGetter(this);
            let defaultValue = defaultValueResult.result;
            if (defaultValueResult.cacheable) {
                let entry = new PropertyEntry(property);
                entry.effectiveValue = entry.defaultValue = defaultValue;
                this._propertyEntries[property.id] = entry;
            }

            return defaultValue;
        }

        return property.defaultValue;
    }

    public _resetValues(valueSource: number): void {
        for (let i = 0, keys = Object.keys(this._propertyEntries); i < keys.length; i++) {
            let key = keys[i];
            let entry: PropertyEntry = this._propertyEntries[key];
            this._resetValueInternal(entry.property, entry, valueSource);
        }
    }

    public _resetValue(property: Property, valueSource: number = ValueSource.Local): void {
        let entry: PropertyEntry = this._propertyEntries[property.id];
        if (!entry) {
            return;
        }

        this._resetValueInternal(property, entry, valueSource);
    }

    private _resetValueInternal(property: Property, entry: PropertyEntry, valueSource: number): void {
        switch (valueSource) {
            case ValueSource.Inherited:
                entry.inheritedValue = undefined;
                break;
            case ValueSource.Css:
                entry.cssValue = undefined;
                break;
            case ValueSource.Local:
                entry.localValue = undefined;
                break;
            case ValueSource.VisualState:
                entry.visualStateValue = undefined;
                break;
        }

        let currentValueSource = entry.valueSource;
        if (currentValueSource !== valueSource) {
            // If current valueSource is larget than the one we reset - do nothing. 
            // We are reseting property will lower priority and it won't change effectValue;
            // Reseting larger source means we somehow was able to set value without updating currentValueSource which is clearly a bug.
            return;
        }

        let currentValue = entry.effectiveValue;
        let newValue = this.getEffectiveValueAndUpdateEntry(currentValueSource, entry, property);
        if (!property.equalityComparer(currentValue, newValue)) {
            // If we fallback to defalutValue - remove propertyEntry.
            // Don't delete properties with ValueGetters because they will get their default value again
            // and it will be the current native value (if it was set before that, e.g. it will be wrong).
            if (entry.valueSource === ValueSource.Default && !property.defaultValueGetter) {
                delete this._propertyEntries[property.id];
            }
            else {
                entry.effectiveValue = newValue;
            }

            this._onPropertyChanged(property, currentValue, newValue);
        }
    }

    public _onPropertyChanged(property: Property, oldValue: any, newValue: any) {
        // let realNewValue = WrappedValue.unwrap(newValue);
        let valueChanged = property.onValueChanged;
        if (valueChanged) {
            valueChanged({
                object: this,
                property: property,
                eventName: Observable.propertyChangeEvent,
                newValue: newValue,
                oldValue: oldValue
            });
        }

        let propName = property.name;
        if (this.hasListeners(Observable.propertyChangeEvent)) {
            let changeData = super._createPropertyChangeData(propName, newValue);
            this.notify(changeData);
        }

        let eventName = property.nameEvent;
        if (this.hasListeners(eventName)) {
            let ngChangedData = {
                eventName: eventName,
                propertyName: propName,
                object: this,
                value: newValue
            }
            this.notify(ngChangedData);
        }
    }

    public _eachSetProperty(callback: (property: Property) => boolean) {
        for (let i = 0, keys = Object.keys(this._propertyEntries); i < keys.length; i++) {
            let key = keys[i];
            let entry: PropertyEntry = this._propertyEntries[key];
            if (!callback(entry.property)) {
                break;
            }
        }
    }

    public _eachSetPropertyValue(callback: (property: Property, value: any) => void): void {
        for (let i = 0, keys = Object.keys(this._propertyEntries); i < keys.length; i++) {
            let key = keys[i];
            let entry: PropertyEntry = this._propertyEntries[key];
            if (entry.valueSource === ValueSource.Default) {
                continue;
            }
            if (!callback(entry.property, entry.effectiveValue)) {
                break;
            }
        }
    }

    public toString(): string {
        return this.typeName;
    }

    private _setValueInternal(property: Property, value: any, source: number) {
        if (value === unsetValue) {
            this._resetValue(property, source);
            return;
        }

        let wrapped = value && value.wrapped;
        let realValue = wrapped ? WrappedValue.unwrap(value) : value;
        let validate = property.onValidateValue;
        if (validate && !validate(realValue)) {
            throw new Error("Invalid value " + realValue + " for property " + property.name);
        }

        // Convert the value to the real property type in case it is coming as a string from CSS or XML.
        let converter = property.valueConverter;
        if (converter && isString(realValue)) {
            realValue = converter(realValue);
        }

        let entry: PropertyEntry = this._propertyEntries[property.id];
        let currentValue;
        if (!entry) {
            entry = new PropertyEntry(property);
            entry.effectiveValue = this._getDefaultValue(property);
            this._propertyEntries[property.id] = entry;
        }

        currentValue = entry.effectiveValue;

        switch (source) {
            case ValueSource.Inherited:
                entry.inheritedValue = realValue;
                break;

            case ValueSource.Css:
                entry.cssValue = realValue;
                break;

            case ValueSource.Local:
                entry.localValue = realValue;
                break;

            case ValueSource.VisualState:
                entry.visualStateValue = realValue;
                break;
        }

        let currentValueSource = entry.valueSource;
        if (currentValueSource > source) {
            return;
        }
        else if (currentValueSource < source) {
            entry.valueSource = source;
        }

        if (wrapped || !property.equalityComparer(currentValue, realValue)) {
            entry.effectiveValue = realValue;
            this._onPropertyChanged(property, currentValue, realValue);
        }
    }

    private getEffectiveValueAndUpdateEntry(currentValueSource: number, entry: PropertyEntry, property: Property): any {
        let newValue: any;
        switch (currentValueSource) {
            case ValueSource.Inherited:
                newValue = property.defaultValue;
                entry.valueSource = ValueSource.Default;
                break;

            case ValueSource.Css:
                if (entry.inheritedValue !== undefined) {
                    newValue = entry.inheritedValue;
                    entry.valueSource = ValueSource.Inherited;
                }
                else {
                    newValue = entry.defaultValue !== undefined ? entry.defaultValue : property.defaultValue;
                    entry.valueSource = ValueSource.Default;
                }
                break;

            case ValueSource.Local:
                if (entry.cssValue !== undefined) {
                    newValue = entry.cssValue;
                    entry.valueSource = ValueSource.Css;
                }
                else if (entry.inheritedValue !== undefined) {
                    newValue = entry.inheritedValue;
                    entry.valueSource = ValueSource.Inherited;
                }
                else {
                    newValue = entry.defaultValue !== undefined ? entry.defaultValue : property.defaultValue;
                    entry.valueSource = ValueSource.Default;
                }
                break;

            case ValueSource.VisualState:
                if (entry.localValue !== undefined) {
                    newValue = entry.localValue;
                    entry.valueSource = ValueSource.Local;
                }
                else if (entry.cssValue !== undefined) {
                    newValue = entry.cssValue;
                    entry.valueSource = ValueSource.Css;
                }
                else if (entry.inheritedValue !== undefined) {
                    newValue = entry.inheritedValue;
                    entry.valueSource = ValueSource.Inherited;
                }
                else {
                    newValue = entry.defaultValue !== undefined ? entry.defaultValue : property.defaultValue;
                    entry.valueSource = ValueSource.Default;
                }
                break;
        }

        return newValue;
    }
}