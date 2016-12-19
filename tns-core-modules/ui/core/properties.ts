import { unsetValue } from "ui/core/dependency-observable";
import { WrappedValue } from "data/observable";
import { ViewBase } from "./view-base";
import { Style } from "ui/styling/style";

export { unsetValue, Style };

let symbolPropertyMap = {};
let cssSymbolPropertyMap = {};
let inheritableProperties = new Array<InheritedProperty<any, any>>();
let inheritableCssProperties = new Array<InheritedCssProperty<any, any>>();

function print(map) {
    let symbols = (<any>Object).getOwnPropertySymbols(map);
    for (let symbol of symbols) {
        const prop = map[symbol];
        if (!prop.registered) {
            console.log(`Property ${prop.name} not Registered!!!!!`);
        }
    }
}
export function printUnregisteredProperties(): void {
    print(symbolPropertyMap);
    print(cssSymbolPropertyMap)
}

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
    valueConverter?: (value: string) => U
}

export interface CoerciblePropertyOptions<T, U> extends PropertyOptions<T, U> {
    readonly coerceValue: (T, U) => U;
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
    public readonly defaultValueKey: symbol;
    public readonly defaultValue: U;

    public get: () => U;
    public set: (value: U) => void;
    public enumerable: boolean = true;
    public configurable: boolean = true;

    constructor(options: PropertyOptions<T, U>) {
        const name = options.name;
        this.name = name;

        const key = Symbol(name + ":propertyKey");
        this.key = key;

        const native: symbol = Symbol(name + ":nativeKey");
        this.native = native;

        const defaultValueKey = Symbol(name + ":nativeDefaultValue");
        this.defaultValueKey = defaultValueKey;

        const defaultValue: U = options.defaultValue;
        this.defaultValue = defaultValue;

        const eventName = name + "Change";
        const affectsLayout: boolean = options.affectsLayout;
        const equalityComparer = options.equalityComparer;
        const valueChanged = options.valueChanged;
        const valueConverter = options.valueConverter;

        this.set = function (this: T, value: any): void {
            const reset = value === unsetValue;
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

            const currentValue = key in this ? this[key] : defaultValue;
            const changed: boolean = equalityComparer ? !equalityComparer(currentValue, unboxedValue) : currentValue !== unboxedValue;

            if (wrapped || changed) {
                const setNativeValue = this.nativeView && native in this;
                if (reset) {
                    delete this[key];
                    if (setNativeValue) {
                        this[native] = this[defaultValueKey];
                        delete this[defaultValueKey];
                    }
                } else {
                    this[key] = value;
                    if (setNativeValue) {
                        if (!(defaultValueKey in this)) {
                            this[defaultValueKey] = this[native];
                        }

                        this[native] = value;
                    }
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
    public readonly defaultValueKey: symbol;
    public readonly defaultValue: U;

    public readonly get: () => U;
    public readonly set: (value: U) => void;
    public readonly enumerable: boolean = true;
    public readonly configurable: boolean = true;

    public readonly coerce: (target: T) => void;

    constructor(options: CoerciblePropertyOptions<T, U>) {
        const name = options.name;
        this.name = name;

        const key = Symbol(name + ":propertyKey");
        this.key = key;

        const native: symbol = Symbol(name + ":nativeKey");
        this.native = native;

        const defaultValueKey = Symbol(name + ":nativeDefaultValue");
        this.defaultValueKey = defaultValueKey;

        const coerceKey = Symbol(name + ":coerceKey");

        const defaultValue: U = options.defaultValue;
        this.defaultValue = defaultValue;

        const eventName = name + "Change";
        const affectsLayout: boolean = options.affectsLayout;
        const equalityComparer = options.equalityComparer;
        const valueChanged = options.valueChanged;
        const valueConverter = options.valueConverter;
        const coerceCallback = options.coerceValue;

        this.coerce = function (target: T): void {
            const originalValue: U = coerceKey in target ? target[coerceKey] : defaultValue;
            target[key] = originalValue;
        }

        this.set = function (this: T, value: U): void {
            const reset = value === unsetValue;
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

            const currentValue = key in this ? this[key] : defaultValue;
            const changed: boolean = equalityComparer ? !equalityComparer(currentValue, unboxedValue) : currentValue !== unboxedValue;

            if (wrapped || changed) {
                const setNativeValue = this.nativeView && native in this;
                if (reset) {
                    delete this[key];
                    if (setNativeValue) {
                        this[native] = this[defaultValueKey];
                        delete this[defaultValueKey];
                    }
                } else {
                    this[key] = value;
                    if (setNativeValue) {
                        if (!(defaultValueKey in this)) {
                            this[defaultValueKey] = this[native];
                        }

                        this[native] = value;
                    }
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
    public readonly sourceKey: symbol;
    public readonly setInheritedValue: (value: U) => void;

    constructor(options: PropertyOptions<T, U>) {
        super(options);
        const name = options.name;
        const key = this.key;
        const defaultValue = options.defaultValue;

        const sourceKey = Symbol(name + ":valueSourceKey");
        this.sourceKey = sourceKey;

        const setBase = this.set;
        const setFunc = (valueSource: ValueSource) => function (value: U): void {
            const that = <T>this;
            const currentValueSource: number = that[sourceKey] || ValueSource.Default;

            let unboxedValue: U;
            let newValueSource: number;

            if (value === unsetValue) {
                // If unsetValue - we want to reset the property.
                const parent: ViewBase = that.parent;
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
            const currentValue = that[key];
            setBase.call(that, unboxedValue);

            const newValue = that[key];
            that[sourceKey] = newValueSource;

            if (currentValue !== newValue) {
                const reset = newValueSource === ValueSource.Default;
                that.eachChild((child) => {
                    const childValueSource = child[sourceKey] || ValueSource.Default;
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

        const setInheritedValue = setFunc(ValueSource.Inherited);
        this.setInheritedValue = setInheritedValue;

        this.set = setFunc(ValueSource.Local);

        inheritableProperties.push(this);
    }
}

export class CssProperty<T extends Style, U> {
    private registered: boolean;
    private readonly setLocalValue: (value: U) => void;
    private readonly setCssValue: (value: U) => void;

    public readonly name: string;
    public readonly cssName: string;

    protected readonly cssValueDescriptor: PropertyDescriptor;
    protected readonly localValueDescriptor: PropertyDescriptor;

    public readonly key: symbol;
    public readonly native: symbol;
    public readonly sourceKey: symbol;
    public readonly defaultValueKey: symbol;
    public readonly defaultValue: U;

    constructor(options: CssPropertyOptions<T, U>) {
        const name = options.name;
        this.name = name;

        const cssName = `css-${options.cssName}`;
        this.cssName = cssName;

        const key = Symbol(name + ":propertyKey");
        this.key = key;

        const sourceKey = Symbol(name + ":valueSourceKey");
        this.sourceKey = sourceKey;

        const native = Symbol(name + ":nativeKey");
        this.native = native;

        const defaultValueKey = Symbol(name + ":nativeDefaultValue");
        this.defaultValueKey = defaultValueKey;

        const defaultValue: U = options.defaultValue;
        this.defaultValue = defaultValue;

        const eventName = name + "Change";
        const affectsLayout: boolean = options.affectsLayout;
        const equalityComparer = options.equalityComparer;
        const valueChanged = options.valueChanged;
        const valueConverter = options.valueConverter;

        function setLocalValue(this: T, value: U): void {
            const reset = value === unsetValue;
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

            const currentValue: U = key in this ? this[key] : defaultValue;
            const changed: boolean = equalityComparer ? !equalityComparer(currentValue, value) : currentValue !== value;

            if (changed) {
                const view = this.view;
                const setNativeValue = view.nativeView && native in view;
                if (reset) {
                    delete this[key];
                    if (setNativeValue) {
                        view[native] = this[defaultValueKey];
                        delete this[defaultValueKey];
                    }
                } else {
                    this[key] = value;
                    if (setNativeValue) {
                        if (!(defaultValueKey in this)) {
                            this[defaultValueKey] = view[native];
                        }

                        view[native] = value;
                    }
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

                if (affectsLayout) {
                    view.requestLayout();
                }
            }
        }

        function setCssValue(this: T, value: U): void {
            const reset = value === unsetValue;
            const currentValueSource: number = this[sourceKey] || ValueSource.Default;

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

            const currentValue: U = key in this ? this[key] : defaultValue;
            const changed: boolean = equalityComparer ? !equalityComparer(currentValue, value) : currentValue !== value;

            if (changed) {
                const view = this.view;
                const setNativeValue = view.nativeView && native in view;
                if (reset) {
                    delete this[key];
                    if (setNativeValue) {
                        view[native] = this[defaultValueKey];
                        delete this[defaultValueKey];
                    }
                } else {
                    this[key] = value;
                    if (setNativeValue) {
                        if (!(defaultValueKey in this)) {
                            this[defaultValueKey] = view[native];
                        }

                        view[native] = value;
                    }
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
        const name = options.name;
        const cssName = `css-${name}`;

        const key = this.key;
        const sourceKey = this.sourceKey;
        const native = this.native;
        const defaultValueKey = this.defaultValueKey;

        const eventName = name + "Change";
        const defaultValue: U = options.defaultValue;
        const affectsLayout: boolean = options.affectsLayout;
        const equalityComparer = options.equalityComparer;
        const valueChanged = options.valueChanged;
        const valueConverter = options.valueConverter;

        const setFunc = (valueSource: ValueSource) => function (this: T, value: any): void {
            const reset = value === unsetValue;
            const currentValueSource: number = this[sourceKey] || ValueSource.Default;
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

            const view = this.view;
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

            const currentValue: U = key in this ? this[key] : defaultValue;
            const changed: boolean = equalityComparer ? !equalityComparer(currentValue, newValue) : currentValue !== newValue;

            if (changed) {
                const view = this.view;
                const setNativeValue = view.nativeView && native in view;
                if (reset) {
                    delete this[key];
                    if (setNativeValue) {
                        view[native] = this[defaultValueKey];
                        delete this[defaultValueKey];
                    }
                } else {
                    this[key] = newValue;
                    if (setNativeValue) {
                        if (!(defaultValueKey in this)) {
                            this[defaultValueKey] = view[native];
                        }

                        view[native] = newValue;
                    }
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

                if (affectsLayout) {
                    view.requestLayout();
                }

                view.eachChild((child) => {
                    const childStyle = child.style;
                    const childValueSource = childStyle[sourceKey] || ValueSource.Default;
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

        const setDefaultFunc = setFunc(ValueSource.Default);
        const setInheritedFunc = setFunc(ValueSource.Inherited);

        this.setInhertiedValue = setInheritedFunc;
        this.cssValueDescriptor.set = setFunc(ValueSource.Css);
        this.localValueDescriptor.set = setFunc(ValueSource.Local);

        inheritableCssProperties.push(this);
    }
}

export class ShorthandProperty<T extends Style> {
    private registered: boolean;
    private readonly setLocalValue: (value: string) => void;
    private readonly setCssValue: (value: string) => void;

    public readonly key: symbol;
    public readonly name: string;
    public readonly cssName: string;

    protected readonly cssValueDescriptor: PropertyDescriptor;
    protected readonly localValueDescriptor: PropertyDescriptor;

    public readonly native: symbol;
    public readonly sourceKey: symbol;

    constructor(options: ShorthandPropertyOptions) {
        const name = options.name;
        this.name = name;

        const key = Symbol(name + ":propertyKey");
        this.key = key;

        const cssName = `css-${options.cssName}`;
        this.cssName = cssName;

        const sourceKey = Symbol(name + ":valueSourceKey");
        this.sourceKey = sourceKey;

        const converter = options.converter;

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
            const currentValueSource: number = this[sourceKey] || ValueSource.Default;
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
        if (this.registered) {
            throw new Error(`Property ${this.name} already registered.`);
        }
        this.registered = true;
        Object.defineProperty(cls.prototype, this.name, this.localValueDescriptor);
        Object.defineProperty(cls.prototype, this.cssName, this.cssValueDescriptor);
    }
}

function inheritablePropertyValuesOn(view: ViewBase): Array<{ property: InheritedProperty<any, any>, value: any }> {
    const array = new Array<{ property: InheritedProperty<any, any>, value: any }>();
    for (let prop of inheritableProperties) {
        const sourceKey = prop.sourceKey;
        const valueSource: number = view[sourceKey] || ValueSource.Default;
        if (valueSource !== ValueSource.Default) {
            array.push({ property: prop, value: view[prop.key] });
        }
    }

    return array;
}

function inheritableCssPropertyValuesOn(style: Style): Array<{ property: InheritedCssProperty<any, any>, value: any }> {
    const array = new Array<{ property: InheritedCssProperty<any, any>, value: any }>();
    for (let prop of inheritableCssProperties) {
        const sourceKey = prop.sourceKey;
        const valueSource: number = style[sourceKey] || ValueSource.Default;
        if (valueSource !== ValueSource.Default) {
            array.push({ property: prop, value: style[prop.key] });
        }
    }

    return array;
}

function inheritablePropertiesOn(view: ViewBase): Array<InheritedProperty<any, any>> {
    const array = new Array<InheritedProperty<any, any>>();
    for (let prop of inheritableProperties) {
        const sourceKey = prop.sourceKey;
        const valueSource: number = view[sourceKey] || ValueSource.Default;
        if (valueSource === ValueSource.Inherited) {
            array.push(prop);
        }
    }

    return array;
}

function inheritableCssPropertiesOn(style: Object): Array<InheritedCssProperty<any, any>> {
    const array = new Array<InheritedCssProperty<any, any>>();
    for (let prop of inheritableCssProperties) {
        const sourceKey = prop.sourceKey;
        const valueSource: number = style[sourceKey] || ValueSource.Default;
        if (valueSource === ValueSource.Inherited) {
            array.push(prop);
        }
    }

    return array;
}

export function applyNativeSetters(view: ViewBase): void {
    let symbols = (<any>Object).getOwnPropertySymbols(view);
    for (let symbol of symbols) {
        const property: Property<any, any> = symbolPropertyMap[symbol];
        if (!property) {
            continue;
        }

        const native = property.native;
        if (native in view) {
            const defaultValueKey = property.defaultValueKey;
            if (!(defaultValueKey in view)) {
                view[defaultValueKey] = view[native];
            }

            const value = view[symbol];
            view[native] = value;
        }
    }

    const style = view.style;
    symbols = (<any>Object).getOwnPropertySymbols(style);
    for (let symbol of symbols) {
        const property: CssProperty<any, any> = cssSymbolPropertyMap[symbol];
        if (!property) {
            continue;
        }

        const native = property.native;
        if (native in view) {
            const defaultValueKey = property.defaultValueKey;
            if (!(defaultValueKey in style)) {
                style[defaultValueKey] = view[native];
            }

            const value = style[symbol];
            view[native] = value;
        }
    }
}

export function clearInheritedProperties(view: ViewBase): void {
    for (let prop of inheritableProperties) {
        const sourceKey = prop.sourceKey;
        if (view[sourceKey] === ValueSource.Inherited) {
            prop.set.call(view, unsetValue);
        }
    }

    const style = view.style;
    for (let prop of inheritableCssProperties) {
        const sourceKey = prop.sourceKey;
        if (style[sourceKey] === ValueSource.Inherited) {
            prop.setInhertiedValue.call(style, unsetValue);
        }
    }
}

export function resetStyleProperties(style: Style): void {
    let symbols = (<any>Object).getOwnPropertySymbols(style);
    const view = style.view;
    for (let symbol of symbols) {
        const property: CssProperty<any, any> = symbolPropertyMap[symbol];
        if (!property) {
            continue;
        }

        const native = property.native;
        if (native in view) {
            view[native] = style[property.defaultValueKey];
            delete style[property.defaultValueKey];
        }

        // This will not call propertyChange!!!
        delete style[property.key];
    }
}

export function propagateInheritedProperties(view: ViewBase): void {
    const inheritablePropertyValues = inheritablePropertyValuesOn(view);
    const inheritableCssPropertyValues = inheritableCssPropertyValuesOn(view.style);
    if (inheritablePropertyValues.length === 0 && inheritableCssPropertyValues.length === 0) {
        return;
    }

    view.eachChild((child) => {
        for (let pair of inheritablePropertyValues) {
            const prop = pair.property;
            const sourceKey = prop.sourceKey;
            const currentValueSource: number = child[sourceKey] || ValueSource.Default;
            if (currentValueSource <= ValueSource.Inherited) {
                prop.setInheritedValue.call(child, pair.value);
            }
            return true;
        }

        for (let pair of inheritableCssPropertyValues) {
            const prop = pair.property;
            const sourceKey = prop.sourceKey;
            const style = child.style;
            const currentValueSource: number = style[sourceKey] || ValueSource.Default;
            if (currentValueSource <= ValueSource.Inherited) {
                prop.setInhertiedValue.call(style, pair.value, ValueSource.Inherited);
            }
            return true;
        }
    });
}

export function makeValidator<T>(...values: T[]): (value: any) => value is T {
    const set = new Set(values);
    return (value: any): value is T => set.has(value);
}
export function makeParser<T>(isValid: (value: any) => boolean, def: T): (value: any) => T {
    return value => {
        const lower = value && value.toLowerCase();
        return isValid(lower) ? lower : def;
    }
}