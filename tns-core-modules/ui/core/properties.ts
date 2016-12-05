import { unsetValue } from "ui/core/dependency-observable";
import { WrappedValue } from "data/observable";
import { ViewBase } from "./view-base";
import { Style } from "ui/styling/style";

export { unsetValue };

let symbolPropertyMap = {};
let cssSymbolPropertyMap = {};
let inheritableProperties = new Array<InheritedProperty<any, any>>();
let inheritableCssProperties = new Array<InheritedCssProperty<any, any>>();

const enum ValueSource {
    Default = 0,
    Inherited = 1,
    Css = 2,
    Local = 3
}

export interface PropertyOptions<T, U> {
    name: string,
    defaultValue?: U,
    affectsLayout?: boolean,
    equalityComparer?: (x: U, y: U) => boolean,
    valueChanged?: (target: T, oldValue: U, newValue: U) => void,
    valueConverter?: (value: any) => U
}

export interface CoerciblePropertyOptions<T, U> extends PropertyOptions<T, U> {
    coerceValue(T, U): U
}

export interface ShorthandPropertyOptions {
    name: string,
    cssName: string;
    converter: (value: string) => [CssProperty<any, any>, any][],
    getter: (this: Style) => string
}

export interface CssPropertyOptions<T extends Style, U> extends PropertyOptions<T, U> {
    cssName: string;
    dependentProperty?: CssProperty<T, any>;
}

export class Property<T extends ViewBase, U> implements PropertyDescriptor {
    private registered: boolean;
    private readonly name: string;
    public readonly key: symbol;
    public readonly native: symbol;

    public get: () => U;
    public set: (value: U) => void;
    public enumerable: boolean = true;
    public configurable: boolean = true;

    constructor(options: PropertyOptions<T, U>) {
        let name = options.name;
        this.name = name;

        let key = Symbol(name + ":propertyKey");
        this.key = key;

        let native: symbol = Symbol(name + ":nativeKey");
        this.native = native;

        let eventName = name + "Change";
        let defaultValue: U = options.defaultValue;
        let affectsLayout: boolean = options.affectsLayout;
        let equalityComparer = options.equalityComparer;
        let valueChanged = options.valueChanged;
        let valueConverter = options.valueConverter;

        this.set = function (this: T, value: any): void {
            let reset = value === unsetValue;
            let unboxedValue: U;
            let wrapped: boolean;
            if (reset) {
                unboxedValue = defaultValue;
            } else {
                wrapped = value && (<any>value).wrapped;
                unboxedValue = wrapped ? WrappedValue.unwrap(value) : value;

                if (valueConverter && typeof unboxedValue === "string") {
                    unboxedValue = valueConverter(unboxedValue);
                }
            }

            let currentValue = key in this ? this[key] : defaultValue;
            let changed: boolean = equalityComparer ? !equalityComparer(currentValue, unboxedValue) : currentValue !== unboxedValue;

            if (wrapped || changed) {
                if (reset) {
                    delete this[key];
                } else {
                    this[key] = unboxedValue;
                }

                if (valueChanged) {
                    valueChanged(this, currentValue, unboxedValue);
                }

                if (this.hasListeners(eventName)) {
                    this.notify({
                        eventName: eventName,
                        propertyName: name,
                        object: this,
                        value: unboxedValue
                    });
                }

                let nativeObject = this.nativeView;
                if (nativeObject) {
                    this[native] = unboxedValue;
                }

                if (affectsLayout) {
                    this.requestLayout();
                }
            }
        }

        this.get = function (): U {
            return key in this ? this[key] : defaultValue;
        }

        symbolPropertyMap[key] = this;
    }

    public register(cls: { prototype: T }): void {
        if (this.registered) {
            throw new Error(`Property ${this.name} already registered.`);
        }
        this.registered = true;
        Object.defineProperty(cls.prototype, this.name, this);
    }
}

export class CoercibleProperty<T extends ViewBase, U> implements PropertyDescriptor {
    private registered: boolean;
    private readonly name: string;
    public readonly key: symbol;
    public readonly native: symbol;

    public get: () => U;
    public set: (value: U) => void;
    public enumerable: boolean = true;
    public configurable: boolean = true;

    public readonly coerce: (target: T) => void;

    constructor(options: CoerciblePropertyOptions<T, U>) {
        let name = options.name;
        this.name = name;

        let key = Symbol(name + ":propertyKey");
        this.key = key;

        let native: symbol = Symbol(name + ":nativeKey");
        this.native = native;

        let coerceKey = Symbol(name + ":coerceKey");

        let eventName = name + "Change";
        let defaultValue: U = options.defaultValue;
        let affectsLayout: boolean = options.affectsLayout;
        let equalityComparer = options.equalityComparer;
        let valueChanged = options.valueChanged;
        let valueConverter = options.valueConverter;
        let coerceCallback = options.coerceValue;

        this.coerce = function (target: T): void {
            let originalValue: U = coerceKey in target ? target[coerceKey] : defaultValue;
            target[key] = originalValue;
        }

        this.set = function (this: T, value: U): void {
            let reset = value === unsetValue;
            let unboxedValue: U;
            let wrapped: boolean;
            if (reset) {
                unboxedValue = defaultValue;
                delete this[coerceKey];
            } else {
                wrapped = value && (<any>value).wrapped;
                unboxedValue = wrapped ? WrappedValue.unwrap(value) : value;

                if (valueConverter && typeof unboxedValue === "string") {
                    unboxedValue = valueConverter(unboxedValue);
                }

                this[coerceKey] = unboxedValue;
                unboxedValue = coerceCallback(this, unboxedValue);
            }

            let currentValue = key in this ? this[key] : defaultValue;
            let changed: boolean = equalityComparer ? !equalityComparer(currentValue, unboxedValue) : currentValue !== unboxedValue;

            if (wrapped || changed) {
                if (reset) {
                    delete this[key];
                } else {
                    this[key] = unboxedValue;
                }

                if (valueChanged) {
                    valueChanged(this, currentValue, unboxedValue);
                }

                if (this.hasListeners(eventName)) {
                    this.notify({
                        eventName: eventName,
                        propertyName: name,
                        object: this,
                        value: unboxedValue
                    });
                }

                let nativeObject = this.nativeView;
                if (nativeObject) {
                    this[native] = unboxedValue;
                }

                if (affectsLayout) {
                    this.requestLayout();
                }
            }
        }

        this.get = function (): U {
            return key in this ? this[key] : defaultValue;
        }

        symbolPropertyMap[key] = this;
    }

    public register(cls: { prototype: T }): void {
        if (this.registered) {
            throw new Error(`Property ${this.name} already registered.`);
        }
        this.registered = true;
        Object.defineProperty(cls.prototype, this.name, this);
    }
}

export class InheritedProperty<T extends ViewBase, U> extends Property<T, U> {
    public sourceKey: symbol;
    public setInheritedValue: (value: U) => void;

    constructor(options: PropertyOptions<T, U>) {
        super(options);
        let name = options.name;
        let key = this.key;
        let defaultValue = options.defaultValue;

        let sourceKey = Symbol(name + ":valueSourceKey");
        this.sourceKey = sourceKey;

        let setBase = this.set;
        let setFunc = (valueSource: ValueSource) => function (value: U): void {
            let that = <T>this;
            let currentValueSource: number = that[sourceKey] || ValueSource.Default;

            let unboxedValue: U;
            let newValueSource: number;

            if (value === unsetValue) {
                // If unsetValue - we want to reset the property.
                let parent: ViewBase = that.parent;
                // If we have parent and it has non-default value we use as our inherited value.
                if (parent && parent[sourceKey] !== ValueSource.Default) {
                    unboxedValue = parent[key];
                    newValueSource = ValueSource.Inherited;
                }
                else {
                    unboxedValue = defaultValue;
                    newValueSource = ValueSource.Default;
                }
            } else {
                // else we are set through property set.
                unboxedValue = value;
                newValueSource = valueSource;
            }

            // take currentValue before calling base - base may change it.
            let currentValue = that[key];
            setBase.call(that, unboxedValue);

            let newValue = that[key];
            that[sourceKey] = newValueSource;

            if (currentValue !== newValue) {
                let reset = newValueSource === ValueSource.Default;
                that.eachChild((child) => {
                    let childValueSource = child[sourceKey];
                    if (reset) {
                        if (childValueSource === ValueSource.Inherited) {
                            setFunc.call(child, unsetValue);
                        }
                    } else {
                        if (childValueSource <= ValueSource.Inherited) {
                            setInheritedValue.call(child, child.parent[key]);
                        }
                    }
                    return true;
                });
            }
        }

        let setInheritedValue = setFunc(ValueSource.Inherited);
        this.setInheritedValue = setInheritedValue;

        this.set = setFunc(ValueSource.Local);

        inheritableProperties.push(this);
    }
}

export class CssProperty<T extends Style, U> {
    private registered: boolean;
    private setLocalValue: (value: U) => void;
    private setCssValue: (value: U) => void;

    public name: string;
    public cssName: string;

    protected cssValueDescriptor: PropertyDescriptor;
    protected localValueDescriptor: PropertyDescriptor;

    public key: symbol;
    public native: symbol;
    public sourceKey: symbol;

    constructor(options: CssPropertyOptions<T, U>) {
        let name = options.name;
        this.name = name;

        let cssName = `css-${options.cssName}`;
        this.cssName = cssName;

        let key = Symbol(name + ":propertyKey");
        this.key = key;

        let sourceKey = Symbol(name + ":valueSourceKey");
        this.sourceKey = sourceKey;

        let native = Symbol(name + ":nativeKey");
        this.native = native;

        let eventName = name + "Change";
        let defaultValue: U = options.defaultValue;
        let affectsLayout: boolean = options.affectsLayout;
        let equalityComparer = options.equalityComparer;
        let valueChanged = options.valueChanged;
        let valueConverter = options.valueConverter;

        let dependentProperty = options.dependentProperty;
        let dependentPropertyKey = dependentProperty ? dependentProperty.key : undefined;
        let dependentPropertyNativeKey = dependentProperty ? dependentProperty.native : undefined;

        function setLocalValue(this: T, value: U): void {
            let reset = value === unsetValue;
            if (reset) {
                value = defaultValue;
                delete this[sourceKey];
            }
            else {
                this[sourceKey] = ValueSource.Local;
                if (valueConverter && typeof value === "string") {
                    value = valueConverter(value);
                }
            }

            let currentValue: U = key in this ? this[key] : defaultValue;
            let changed: boolean = equalityComparer ? !equalityComparer(currentValue, value) : currentValue !== value;

            if (changed) {
                if (reset) {
                    delete this[key];
                } else {
                    this[key] = value;
                }

                if (valueChanged) {
                    valueChanged(this, currentValue, value);
                }

                if (this.hasListeners(eventName)) {
                    this.notify({
                        eventName: eventName,
                        propertyName: name,
                        object: this,
                        value: value
                    });
                }

                let view = this.view;
                if (view.nativeView) {
                    view[native] = value;
                    if (dependentPropertyNativeKey) {
                        // Call the native setter for dependent property. 
                        view[dependentPropertyNativeKey] = this[dependentPropertyKey];
                    }
                }

                if (affectsLayout) {
                    view.requestLayout();
                }
            }
        }

        function setCssValue(this: T, value: U): void {
            let reset = value === unsetValue;
            let currentValueSource: number = this[sourceKey] || ValueSource.Default;

            // We have localValueSource - NOOP.
            if (currentValueSource === ValueSource.Local) {
                return;
            }

            if (reset) {
                value = defaultValue;
                delete this[sourceKey];
            } else {
                this[sourceKey] = ValueSource.Css;
                if (valueConverter && typeof value === "string") {
                    value = valueConverter(value);
                }
            }

            let currentValue: U = key in this ? this[key] : defaultValue;
            let changed: boolean = equalityComparer ? !equalityComparer(currentValue, value) : currentValue !== value;

            if (changed) {
                if (reset) {
                    delete this[key];
                } else {
                    this[key] = value;
                }

                if (valueChanged) {
                    valueChanged(this, currentValue, value);
                }

                if (this.hasListeners(eventName)) {
                    this.notify({
                        eventName: eventName,
                        propertyName: name,
                        object: this,
                        value: value
                    });
                }

                let view = this.view;
                if (view.nativeView) {
                    view[native] = value;
                    if (dependentPropertyNativeKey) {
                        // Call the native setter for dependent property. 
                        view[dependentPropertyNativeKey] = this[dependentPropertyKey];
                    }
                }

                if (affectsLayout) {
                    view.requestLayout();
                }
            }
        }

        function get(): U {
            return key in this ? this[key] : defaultValue;
        }

        this.cssValueDescriptor = {
            enumerable: true,
            configurable: true,
            get: get,
            set: setCssValue
        };

        this.localValueDescriptor = {
            enumerable: true,
            configurable: true,
            get: get,
            set: setLocalValue
        };

        cssSymbolPropertyMap[key] = this;
    }

    public register(cls: { prototype: T }): void {
        if (this.registered) {
            throw new Error(`Property ${this.name} already registered.`);
        }
        this.registered = true;
        Object.defineProperty(cls.prototype, this.name, this.localValueDescriptor);
        Object.defineProperty(cls.prototype, this.cssName, this.cssValueDescriptor);
    }
}

export class InheritedCssProperty<T extends Style, U> extends CssProperty<T, U> {
    public setInhertiedValue: (value: U) => void;

    constructor(options: CssPropertyOptions<T, U>) {
        super(options);
        let name = options.name;
        this.name = name;

        let cssName = `css-${name}`;
        this.cssName = cssName;

        let key = this.key;
        let sourceKey = this.sourceKey;
        let native = this.native;

        let eventName = name + "Change";
        let defaultValue: U = options.defaultValue;
        let affectsLayout: boolean = options.affectsLayout;
        let equalityComparer = options.equalityComparer;
        let valueChanged = options.valueChanged;
        let valueConverter = options.valueConverter;

        let dependentProperty = options.dependentProperty;
        let dependentPropertyKey = dependentProperty ? dependentProperty.key : undefined;
        let dependentPropertyNativeKey = dependentProperty ? dependentProperty.native : undefined;

        let setFunc = (valueSource: ValueSource) => function (this: T, value: any): void {
            let reset = value === unsetValue;
            let currentValueSource: number = this[sourceKey] || ValueSource.Default;
            if (reset) {
                // If we want to reset cssValue and we have localValue - return;
                if (valueSource === ValueSource.Css && currentValueSource === ValueSource.Local) {
                    return;
                }
            } else {
                if (currentValueSource > valueSource) {
                    return;
                }
            }

            let view = this.view;
            let newValue: U;
            if (reset) {
                // If unsetValue - we want to reset this property.
                let parent = view.parent;
                let style = parent ? parent.style : null
                // If we have parent and it has non-default value we use as our inherited value.
                if (style && style[sourceKey] !== ValueSource.Default) {
                    newValue = style[key];
                    this[sourceKey] = ValueSource.Inherited;
                }
                else {
                    newValue = defaultValue;
                    delete this[sourceKey];
                }
            } else {
                this[sourceKey] = valueSource;
                if (valueConverter && typeof value === "string") {
                    newValue = valueConverter(value);
                } else {
                    newValue = value;
                }
            }

            let currentValue: U = key in this ? this[key] : defaultValue;
            let changed: boolean = equalityComparer ? !equalityComparer(currentValue, newValue) : currentValue !== newValue;

            if (changed) {
                if (reset) {
                    delete this[key];
                } else {
                    this[key] = newValue;
                }

                if (valueChanged) {
                    valueChanged(this, currentValue, newValue);
                }

                if (this.hasListeners(eventName)) {
                    this.notify({
                        eventName: eventName,
                        propertyName: name,
                        object: this,
                        value: newValue
                    });
                }

                let nativeView = view.nativeView;
                if (nativeView) {
                    view[native] = value;
                    if (dependentPropertyNativeKey) {
                        // Call the native setter for dependent property. 
                        view[dependentPropertyNativeKey] = this[dependentPropertyKey];
                    }
                }

                if (affectsLayout) {
                    view.requestLayout();
                }

                view.eachChild((child) => {
                    let childStyle = child.style;
                    let childValueSource = childStyle[sourceKey] || ValueSource.Default;
                    if (reset) {
                        if (childValueSource === ValueSource.Inherited) {
                            setDefaultFunc.call(childStyle, unsetValue);
                        }
                    } else {
                        if (childValueSource <= ValueSource.Inherited) {
                            setInheritedFunc.call(childStyle, newValue);
                        }
                    }
                    return true;
                });
            }
        }

        let setDefaultFunc = setFunc(ValueSource.Default);
        let setInheritedFunc = setFunc(ValueSource.Inherited);

        this.setInhertiedValue = setInheritedFunc;
        this.cssValueDescriptor.set = setFunc(ValueSource.Css);
        this.localValueDescriptor.set = setFunc(ValueSource.Local);

        inheritableCssProperties.push(this);
    }
}

export class ShorthandProperty<T extends Style> {
    private setLocalValue: (value: string) => void;
    private setCssValue: (value: string) => void;

    public key: symbol;
    public name: string;
    public cssName: string;

    protected cssValueDescriptor: PropertyDescriptor;
    protected localValueDescriptor: PropertyDescriptor;

    public native: symbol;
    public sourceKey: symbol;

    constructor(options: ShorthandPropertyOptions) {
        let name = options.name;
        this.name = name;

        let key = Symbol(name + ":propertyKey");
        this.key = key;

        let cssName = `css-${options.cssName}`;
        this.cssName = cssName;

        let sourceKey = Symbol(name + ":valueSourceKey");
        this.sourceKey = sourceKey;

        let converter = options.converter;

        function setLocalValue(this: T, value: string): void {
            this[sourceKey] = ValueSource.Local;
            if (this[key] !== value) {
                this[key] = value;
                for (let [p, v] of converter(value)) {
                    this[p.name] = v;
                }
            }
        }

        function setCssValue(this: T, value: string): void {
            let currentValueSource: number = this[sourceKey] || ValueSource.Default;
            // We have localValueSource - NOOP.
            if (currentValueSource === ValueSource.Local) {
                return;
            }

            if (this[key] !== value) {
                this[key] = value;
                for (let [p, v] of converter(value)) {
                    this[p.cssName] = v;
                }
            }
        }

        this.cssValueDescriptor = {
            enumerable: true,
            configurable: true,
            get: options.getter,
            set: setCssValue
        };

        this.localValueDescriptor = {
            enumerable: true,
            configurable: true,
            get: options.getter,
            set: setLocalValue
        };

        cssSymbolPropertyMap[key] = this;
    }

    public register(cls: { prototype: T }): void {
        Object.defineProperty(cls.prototype, this.name, this.localValueDescriptor);
        Object.defineProperty(cls.prototype, this.cssName, this.cssValueDescriptor);
    }
}

function inheritablePropertyValuesOn(view: ViewBase): Array<{ property: InheritedProperty<any, any>, value: any }> {
    let array = new Array<{ property: InheritedProperty<any, any>, value: any }>();
    for (let prop of inheritableProperties) {
        let sourceKey = prop.sourceKey;
        let valueSource: number = view[sourceKey] || ValueSource.Default;
        if (valueSource !== ValueSource.Default) {
            array.push({ property: prop, value: view[prop.key] });
        }
    }

    return array;
}

function inheritableCssPropertyValuesOn(style: Style): Array<{ property: InheritedCssProperty<any, any>, value: any }> {
    let array = new Array<{ property: InheritedCssProperty<any, any>, value: any }>();
    for (let prop of inheritableCssProperties) {
        let sourceKey = prop.sourceKey;
        let valueSource: number = style[sourceKey] || ValueSource.Default;
        if (valueSource !== ValueSource.Default) {
            array.push({ property: prop, value: style[prop.key] });
        }
    }

    return array;
}

function inheritablePropertiesOn(view: ViewBase): Array<InheritedProperty<any, any>> {
    let array = new Array<InheritedProperty<any, any>>();
    for (let prop of inheritableProperties) {
        let sourceKey = prop.sourceKey;
        let valueSource: number = view[sourceKey] || ValueSource.Default;
        if (valueSource === ValueSource.Inherited) {
            array.push(prop);
        }
    }

    return array;
}

function inheritableCssPropertiesOn(style: Object): Array<InheritedCssProperty<any, any>> {
    let array = new Array<InheritedCssProperty<any, any>>();
    for (let prop of inheritableCssProperties) {
        let sourceKey = prop.sourceKey;
        let valueSource: number = style[sourceKey] || ValueSource.Default;
        if (valueSource === ValueSource.Inherited) {
            array.push(prop);
        }
    }

    return array;
}

export function applyNativeSetters(view: ViewBase): void {
    let symbols = Object.getOwnPropertySymbols(view);
    for (let symbol of symbols) {
        let property: Property<any, any> = symbolPropertyMap[symbol];
        if (!property) {
            continue;
        }

        let native = property.native;
        if (view[native]) {
            let value = view[symbol];
            view[native] = value;
        }
    }

    let style = view.style;
    symbols = Object.getOwnPropertySymbols(style);
    for (let symbol of symbols) {
        let property: CssProperty<any, any> = cssSymbolPropertyMap[symbol];
        if (!property) {
            continue;
        }

        let native = property.native;
        if (view[native]) {
            let value = style[symbol];
            view[native] = value;
        }
    }
}

export function clearInheritedProperties(view: ViewBase): void {
    for (let prop of inheritableProperties) {
        let sourceKey = prop.sourceKey;
        if (view[sourceKey] === ValueSource.Inherited) {
            prop.set.call(view, unsetValue);
        }
    }

    let style = view.style;
    for (let prop of inheritableCssProperties) {
        let sourceKey = prop.sourceKey;
        if (style[sourceKey] === ValueSource.Inherited) {
            prop.setInhertiedValue.call(style, unsetValue);
        }
    }
}

export function propagateInheritedProperties(view: ViewBase): void {
    let inheritablePropertyValues = inheritablePropertyValuesOn(view);
    let inheritableCssPropertyValues = inheritableCssPropertyValuesOn(view.style);
    view.eachChild((child) => {
        for (let pair of inheritablePropertyValues) {
            let prop = pair.property;
            let sourceKey = prop.sourceKey;
            let currentValueSource: number = child[sourceKey] || ValueSource.Default;
            if (currentValueSource <= ValueSource.Inherited) {
                prop.setInheritedValue.call(child, pair.value);
            }
            return true;
        }

        for (let pair of inheritableCssPropertyValues) {
            let prop = pair.property;
            let sourceKey = prop.sourceKey;
            let style = child.style;
            let currentValueSource: number = style[sourceKey] || ValueSource.Default;
            if (currentValueSource <= ValueSource.Inherited) {
                prop.setInhertiedValue.call(style, pair.value, ValueSource.Inherited);
            }
            return true;
        }
    });
}