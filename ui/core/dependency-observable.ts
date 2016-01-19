import definition = require("ui/core/dependency-observable");
import observable = require("data/observable");
import types = require("utils/types");

// use private variables in the scope of the module rather than static members of the class since a member is still accessible through JavaScript and may be changed.
var propertyFromKey = {};
var propertyIdCounter = 0;

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
    var classInfo = types.getClassInfo(owner);
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

export class PropertyMetadata implements definition.PropertyMetadata {
    private _defaultValue: any;
    private _options: number;
    private _onChanged: definition.PropertyChangedCallback;
    private _onValidateValue: definition.PropertyValidationCallback;
    private _equalityComparer: definition.PropertyEqualityComparer;

    constructor(
        defaultValue: any,
        options?: number,
        onChanged?: definition.PropertyChangedCallback,
        onValidateValue?: definition.PropertyValidationCallback,
        equalityComparer?: definition.PropertyEqualityComparer) {
        this._defaultValue = defaultValue;
        this._options = options;
        if (types.isNullOrUndefined(this._options)) {
            this._options = PropertyMetadataSettings.None;
        }
        this._onChanged = onChanged;
        this._onValidateValue = onValidateValue;
        this._equalityComparer = equalityComparer;
    }

    public get defaultValue(): any {
        return this._defaultValue;
    }

    public get options(): number {
        return this._options;
    }

    public get onValueChanged(): definition.PropertyChangedCallback {
        return this._onChanged;
    }
    public set onValueChanged(value: definition.PropertyChangedCallback) {
        this._onChanged = value;
    }

    public get onValidateValue(): definition.PropertyValidationCallback {
        return this._onValidateValue;
    }

    public get equalityComparer(): definition.PropertyEqualityComparer {
        return this._equalityComparer;
    }

    public get affectsLayout(): boolean {
        return (this._options & PropertyMetadataSettings.AffectsLayout) === PropertyMetadataSettings.AffectsLayout;
    }

    public get affectsStyle(): boolean {
        return (this._options & PropertyMetadataSettings.AffectsStyle) === PropertyMetadataSettings.AffectsStyle;
    }

    public get inheritable(): boolean {
        return (this._options & PropertyMetadataSettings.Inheritable) === PropertyMetadataSettings.Inheritable;
    }
}

export class Property implements definition.Property {
    private _metadata: PropertyMetadata;
    private _key: string;
    private _name: string;
    private _ownerType: string;
    private _id: number;
    private _valueConverter: (value: any) => any;

    constructor(name: string, ownerType: string, metadata: PropertyMetadata, valueConverter?: (value: string) => any) {
        // register key
        this._key = generatePropertyKey(name, ownerType, true);

        if (propertyFromKey[this._key]) {
            throw new Error("Property " + name + " already registered for type " + ownerType + ".");
        }

        propertyFromKey[this._key] = this;

        if (!metadata || !(metadata instanceof PropertyMetadata)) {
            throw new Error("Expected valid PropertyMetadata instance.");
        }

        this._name = name;
        this._ownerType = ownerType;
        this._metadata = metadata;

        // generate a unique numeric id for each property (faster lookup than a string key)
        this._id = propertyIdCounter++;
        this._valueConverter = valueConverter;
    }

    public defaultValueGetter: (instance: definition.DependencyObservable) => definition.NativeValueResult;

    public get name(): string {
        return this._name;
    }

    public get id(): number {
        return this._id;
    }

    public get metadata(): PropertyMetadata {
        return this._metadata;
    }

    public isValidValue(value: Object): boolean {
        if (this.metadata.onValidateValue) {
            return this.metadata.onValidateValue(value);
        }

        // TODO: consider type check here (e.g. passing function where object is expected)
        return true;
    }

    public get valueConverter(): (value: string) => any {
        return this._valueConverter;
    }

    public _getEffectiveValue(entry: PropertyEntry): any {
        if (types.isDefined(entry.localValue)) {
            entry.valueSource = ValueSource.Local;
            return entry.localValue;
        }

        if (types.isDefined(entry.inheritedValue)) {
            entry.valueSource = ValueSource.Inherited;
            return entry.inheritedValue;
        }

        entry.valueSource = ValueSource.Default;
        return this.metadata.defaultValue;
    }
}

export class PropertyEntry implements definition.PropertyEntry {
    private _property: Property;

    private _valueSource: number;
    private _inheritedValue: any;
    private _cssValue: any;
    private _localValue: any;
    private _effectiveValue: any;
    private _visualStateValue: any;

    constructor(property: Property) {
        this._property = property;
    }

    get property(): Property {
        return this._property;
    }

    get effectiveValue() {
        if (!this._effectiveValue) {
            this._effectiveValue = this._property._getEffectiveValue(this);
        }

        return this._effectiveValue;
    }

    get valueSource(): number {
        return this._valueSource;
    }
    set valueSource(value: number) {
        this._valueSource = value;
    }

    get localValue(): any {
        return this._localValue;
    }
    set localValue(value: any) {
        this._localValue = value;
        this._effectiveValue = undefined;
    }

    get inheritedValue(): any {
        return this._inheritedValue;
    }
    set inheritedValue(value: any) {
        this._inheritedValue = value;
        this._effectiveValue = undefined;
    }

    get cssValue(): any {
        return this._cssValue;
    }
    set cssValue(value: any) {
        this._cssValue = value;
        this._effectiveValue = undefined;
    }

    get visualStateValue(): any {
        return this._visualStateValue;
    }
    set visualStateValue(value: any) {
        this._visualStateValue = value;
        this._effectiveValue = undefined;
    }

    public resetValue() {
        this._valueSource = ValueSource.Default;
        this._visualStateValue = undefined;
        this._localValue = undefined;
        this._cssValue = undefined;
        this._inheritedValue = undefined;
        this._effectiveValue = undefined;
    }
}

var defaultValueForPropertyPerType: Map<string, any> = new Map<string, any>();

export class DependencyObservable extends observable.Observable {
    private _propertyEntries = {};

    public set(name: string, value: any) {
        var property = getPropertyByNameAndType(name, this);
        if (property) {
            this._setValue(property, value, ValueSource.Local);
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
        if (!property.isValidValue(value)) {
            throw new Error("Invalid value " + value + " for property " + property.name);
        }

        if (types.isUndefined(source)) {
            source = ValueSource.Local;
        }

        this._setValueInternal(property, value, source);
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
        else if (property.defaultValueGetter) { // we check for cached properties only for these which have 'defaultValueGetter' defined;
            // When DependencyProperties are removed from Style - fix this check.
            var view = (<any>this)._view || this;
            let key = types.getClass(view) + "." + property.id;
            let defaultValue = defaultValueForPropertyPerType.get(key);
            if (types.isUndefined(defaultValue) && view._nativeView) {
                let defaultValueResult = property.defaultValueGetter(this);
                defaultValue = defaultValueResult.result;
                if (defaultValueResult.cacheable) {
                    defaultValueForPropertyPerType.set(key, defaultValue);
                }
            }

            return defaultValue;
        }

        return property.metadata.defaultValue;
    }

    public _resetValue(property: Property, source?: number) {
        if (!(property.id in this._propertyEntries)) {
            return;
        }

        if (types.isDefined(source)) {
            // resetting particular modifier to undefined will remove it from the effective value composition
            this._setValueInternal(property, undefined, source);
        } else {
            var currentValue = this._getValue(property);
            delete this._propertyEntries[property.id];
            var newValue = this._getValue(property);

            var comparer: (x: any, y: any) => boolean = property.metadata.equalityComparer || this._defaultComparer;
            if (!comparer(currentValue, newValue)) {
                this._onPropertyChanged(property, currentValue, newValue);
            }
        }
    }

    public _onPropertyChanged(property: Property, oldValue: any, newValue: any) {
        if (property.metadata.onValueChanged) {
            property.metadata.onValueChanged({
                object: this,
                property: property,
                eventName: observable.Observable.propertyChangeEvent,
                newValue: newValue,
                oldValue: oldValue
            });
        }

        if (this.hasListeners(observable.Observable.propertyChangeEvent)) {
            var changeData = super._createPropertyChangeData(property.name, newValue);
            this.notify(changeData);
        }

        let eventName = property.name + "Change";
        if (this.hasListeners(eventName)) {
            var ngChangedData = {
                eventName: eventName,
                propertyName: property.name,
                object: this,
                value: newValue
            }
            this.notify(ngChangedData);
        }
    }

    public _eachSetProperty(callback: (property: Property) => boolean) {
        var i;
        var key;
        var entry: PropertyEntry;
        var retVal: boolean;
        var keys = Object.keys(this._propertyEntries);

        for (i = 0; i < keys.length; i++) {
            key = keys[i];
            entry = this._propertyEntries[key];
            retVal = callback(entry.property);
            if (!retVal) {
                break;
            }
        }
    }

    public toString(): string {
        return this.typeName;
    }

    private _setValueInternal(property: Property, value: any, source: number) {

        // Convert the value to the real property type in case it is coming as a string from CSS or XML.
        if (types.isString(value) && property.valueConverter) {
            value = property.valueConverter(value);
        }

        var entry: PropertyEntry = this._propertyEntries[property.id];
        if (!entry) {
            entry = new PropertyEntry(property);
            this._propertyEntries[property.id] = entry;
        }

        var currentValue = entry.effectiveValue;

        switch (source) {
            case ValueSource.Css:
                entry.cssValue = value;
                break;
            case ValueSource.Inherited:
                entry.inheritedValue = value;
                break;
            case ValueSource.Local:
                entry.localValue = value;
                break;
            case ValueSource.VisualState:
                entry.visualStateValue = value;
                break;
        }

        var comparer: (x: any, y: any) => boolean = property.metadata.equalityComparer || this._defaultComparer;
        if (!comparer(currentValue, entry.effectiveValue)) {
            this._onPropertyChanged(property, currentValue, entry.effectiveValue);
        }
    }

    private _defaultComparer(x: any, y: any): boolean {
        return x === y;
    }
}
