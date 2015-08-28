import definition = require("ui/styling/style-property");
import types = require("utils/types");
import observable = require("ui/core/dependency-observable"); 

var propertiesByName = {};
var propertiesByCssName = {};
var callbackByShorthandName = new Map<string, (value: any) => Array<definition.KeyValuePair<definition.Property, any>>>();
var inheritableProperties: Array<Property> = [];

function registerProperty(property: Property) {
    if (propertiesByCssName[property.cssName]) {
        throw new Error("Property with name " + property.cssName + " is already registered!");
    }

    propertiesByCssName[property.cssName] = property;
    propertiesByName[property.name] = property;

    if (property.metadata.inheritable) {
        inheritableProperties.push(property);
    }
}

export function getShorthandPairs(name: string, value: any): Array<definition.KeyValuePair<definition.Property, any>> {
    var callback = callbackByShorthandName.get(name);
    if (callback) {
        return callback(value)
    }

    return undefined;
}

export function registerShorthandCallback(name: string, callback: (value: any) => Array<definition.KeyValuePair<definition.Property, any>>): void {
    if (callbackByShorthandName.has(name)) {
        throw new Error("Shorthand callback already registered for property: " + name);
    }

    callbackByShorthandName.set(name, callback);
}

export function getPropertyByName(name: string): Property {
    return propertiesByName[name];
}

export function getPropertyByCssName(name: string): Property {
    return propertiesByCssName[name];
}

export function eachProperty(callback: (property: Property) => void) {
    types.verifyCallback(callback);

    var i;
    var key;
    var keys = Object.keys(propertiesByName);

    for (i = 0; i < keys.length; i++) {
        key = keys[i];
        callback(propertiesByName[key]);
    }
}

export function eachInheritableProperty(callback: (property: Property) => void) {
    types.verifyCallback(callback);

    var i;
    for (i = 0; i < inheritableProperties.length; i++) {
        callback(inheritableProperties[i]);
    }
}

export class Property extends observable.Property implements definition.Property {
    private _cssName;

    constructor(name: string, cssName: string, metadata: observable.PropertyMetadata, valueConverter?: (value: any) => any) {
        super(name, "Style", metadata, valueConverter);

        this._cssName = cssName;

        registerProperty(this);
    }

    public get cssName(): string {
        return this._cssName;
    }

    public _getEffectiveValue(entry: observable.PropertyEntry): any {
        if (types.isDefined(entry.visualStateValue)) {
            entry.valueSource = observable.ValueSource.VisualState;
            return entry.visualStateValue;
        }

        if (types.isDefined(entry.localValue)) {
            entry.valueSource = observable.ValueSource.Local;
            return entry.localValue;
        }

        if (types.isDefined(entry.cssValue)) {
            entry.valueSource = observable.ValueSource.Css;
            return entry.cssValue;
        }

        if (types.isDefined(entry.inheritedValue)) {
            entry.valueSource = observable.ValueSource.Inherited;
            return entry.inheritedValue;
        }

        entry.valueSource = observable.ValueSource.Default;
        return this.metadata.defaultValue;
    }
}