import { ViewBase } from '../view-base';

// Types.
import { PropertyChangeData, WrappedValue } from '../../../data/observable';
import { Trace } from '../../../trace';

import { Style } from '../../styling/style';

import { profile } from '../../../profiling';

/**
 * Value specifying that Property should be set to its initial value.
 */
export const unsetValue: any = new Object();

export interface PropertyOptions<T, U> {
	readonly name: string;
	readonly defaultValue?: U;
	readonly affectsLayout?: boolean;
	readonly equalityComparer?: (x: U, y: U) => boolean;
	readonly valueChanged?: (target: T, oldValue: U, newValue: U) => void;
	readonly valueConverter?: (value: string) => U;
}

export interface CoerciblePropertyOptions<T, U> extends PropertyOptions<T, U> {
	readonly coerceValue: (t: T, u: U) => U;
}

export interface CssPropertyOptions<T extends Style, U> extends PropertyOptions<T, U> {
	readonly cssName: string;
}

export interface ShorthandPropertyOptions<P> {
	readonly name: string;
	readonly cssName: string;
	readonly converter: (value: string | P) => [CssProperty<any, any> | CssAnimationProperty<any, any>, any][];
	readonly getter: (this: Style) => string | P;
}

export interface CssAnimationPropertyOptions<T, U> {
	readonly name: string;
	readonly cssName?: string;
	readonly defaultValue?: U;
	readonly affectsLayout?: boolean;
	readonly equalityComparer?: (x: U, y: U) => boolean;
	readonly valueChanged?: (target: T, oldValue: U, newValue: U) => void;
	readonly valueConverter?: (value: string) => U;
}

const cssPropertyNames: string[] = [];
const symbolPropertyMap = {};
const cssSymbolPropertyMap = {};

const inheritableProperties = new Array<InheritedProperty<any, any>>();
const inheritableCssProperties = new Array<InheritedCssProperty<any, any>>();

function print(map) {
	const symbols = Object.getOwnPropertySymbols(map);
	for (const symbol of symbols) {
		const prop = map[symbol];
		if (!prop.registered) {
			console.log(`Property ${prop.name} not Registered!!!!!`);
		}
	}
}

export function _printUnregisteredProperties(): void {
	print(symbolPropertyMap);
	print(cssSymbolPropertyMap);
}

const enum ValueSource {
	Default = 0,
	Inherited = 1,
	Css = 2,
	Local = 3,
	Keyframe = 4,
}

export function _getProperties(): Property<any, any>[] {
	return getPropertiesFromMap(symbolPropertyMap) as Property<any, any>[];
}

export function _getStyleProperties(): CssProperty<any, any>[] {
	return getPropertiesFromMap(cssSymbolPropertyMap) as CssProperty<any, any>[];
}

export function isCssVariable(property: string) {
	return /^--[^,\s]+?$/.test(property);
}

export function isCssCalcExpression(value: string) {
	return value.includes('calc(');
}

export function isCssVariableExpression(value: string) {
	return value.includes('var(--');
}

export function _evaluateCssVariableExpression(view: ViewBase, cssName: string, value: string): string {
	if (typeof value !== 'string') {
		return value;
	}

	if (!isCssVariableExpression(value)) {
		// Value is not using css-variable(s)
		return value;
	}

	let output = value.trim();

	// Evaluate every (and nested) css-variables in the value.
	let lastValue: string;
	while (lastValue !== output) {
		lastValue = output;

		const idx = output.lastIndexOf('var(');
		if (idx === -1) {
			continue;
		}

		const endIdx = output.indexOf(')', idx);
		if (endIdx === -1) {
			continue;
		}

		const matched = output
			.substring(idx + 4, endIdx)
			.split(',')
			.map((v) => v.trim())
			.filter((v) => !!v);
		const cssVariableName = matched.shift();
		let cssVariableValue = view.style.getCssVariable(cssVariableName);
		if (cssVariableValue === null && matched.length) {
			cssVariableValue = _evaluateCssVariableExpression(view, cssName, matched.join(', ')).split(',')[0];
		}

		if (!cssVariableValue) {
			cssVariableValue = 'unset';
		}

		output = `${output.substring(0, idx)}${cssVariableValue}${output.substring(endIdx + 1)}`;
	}

	return output;
}

export function _evaluateCssCalcExpression(value: string) {
	if (typeof value !== 'string') {
		return value;
	}

	if (isCssCalcExpression(value)) {
		// WORKAROUND: reduce-css-calc can't handle the dip-unit.
		return require('reduce-css-calc')(value.replace(/([0-9]+(\.[0-9]+)?)dip\b/g, '$1'));
	} else {
		return value;
	}
}

function getPropertiesFromMap(map): Property<any, any>[] | CssProperty<any, any>[] {
	const props = [];
	Object.getOwnPropertySymbols(map).forEach((symbol) => props.push(map[symbol]));

	return props;
}

function overrideHandlers<T, U>(property: Property<any, U> | CssProperty<any, U> | ShorthandProperty<any, U> | CssAnimationProperty<any, U>) {
	return function (options: any) {
		if (property instanceof CssAnimationProperty || property instanceof CssProperty || property instanceof ShorthandProperty) {
			Object.keys(options).forEach((key) => {
				if (key === 'cssName') {
					if (options[key] !== undefined) {
						//@ts-ignore ignore readonly
						property.cssName = 'css:' + options[key];
						//@ts-ignore ignore readonly
						property.cssLocalName = options[key];
					}
				} else if (options[key] !== undefined) {
					property[key] = options[key];
				}
			});
		} else {
			Object.keys(options).forEach((key) => {
				if (options[key] !== undefined) {
					property[key] = options[key];
				}
			});
		}
	};
}

function getPropertySetter<T extends ViewBase, U>(property: Property<T, U>) {
	return function (this: T, boxedValue: U): void {
		const reset = boxedValue === unsetValue;
		let value: U;
		let wrapped: boolean;
		const key = property.key;
		const defaultValue = property.defaultValue;
		if (reset) {
			value = property.defaultValue;
			if (property instanceof CoercibleProperty) {
				delete this[property.coerceKey];
			}
		} else {
			wrapped = boxedValue && (<any>boxedValue).wrapped;
			value = wrapped ? WrappedValue.unwrap(boxedValue) : boxedValue;

			if (property.valueConverter && typeof value === 'string') {
				value = property.valueConverter(value);
			}
			if (property instanceof CoercibleProperty) {
				this[property.coerceKey] = value;
				value = property.coerceValue(this, value);
			}
		}
		const oldValue = <U>(key in this ? this[key] : defaultValue);
		const changed: boolean = property.equalityComparer ? !property.equalityComparer(oldValue, value) : oldValue !== value;

		if (wrapped || changed) {
			const defaultValueKey = property.defaultValueKey;
			const setNative = property.setNative;
			const valueChanged = property.valueChanged;
			const getDefault = property.getDefault;
			const eventName = property.eventName;
			const propertyName = property.name;
			if (reset) {
				delete this[key];
				if (valueChanged) {
					valueChanged(this, oldValue, value);
				}
				if (this[setNative]) {
					if (this._suspendNativeUpdatesCount) {
						if (this._suspendedUpdates) {
							this._suspendedUpdates[propertyName] = property;
						}
					} else {
						if (defaultValueKey in this) {
							this[setNative](this[defaultValueKey]);
							delete this[defaultValueKey];
						} else {
							this[setNative](defaultValue);
						}
					}
				}
			} else {
				this[key] = value;
				if (valueChanged) {
					valueChanged(this, oldValue, value);
				}

				if (this[setNative]) {
					if (this._suspendNativeUpdatesCount) {
						if (this._suspendedUpdates) {
							this._suspendedUpdates[propertyName] = property;
						}
					} else {
						if (!(defaultValueKey in this)) {
							this[defaultValueKey] = this[getDefault] ? this[getDefault]() : defaultValue;
						}
						this[setNative](value);
					}
				}
			}

			if (this.hasListeners(eventName)) {
				this.notify<PropertyChangeData>({
					object: this,
					eventName,
					propertyName,
					value,
					oldValue,
				});
			}

			if (property.affectsLayout) {
				this.requestLayout();
			}

			if (this.domNode) {
				if (reset) {
					this.domNode.attributeRemoved(propertyName);
				} else {
					this.domNode.attributeModified(propertyName, value);
				}
			}
		}
	};
}

export class Property<T extends ViewBase, U> implements TypedPropertyDescriptor<U>, Property<T, U> {
	private registered: boolean;

	public readonly name: string;
	public readonly key: symbol;
	public readonly eventName: string;

	public readonly getDefault: symbol;
	public readonly setNative: symbol;

	public readonly defaultValueKey: symbol;
	public readonly defaultValue: U;

	public isStyleProperty: boolean;

	public affectsLayout?: boolean;
	public equalityComparer?: (x: U, y: U) => boolean;
	public valueChanged?: (target: T, oldValue: U, newValue: U) => void;
	public valueConverter?: (value: string) => U;

	public get: () => U;
	public set: (value: U) => void;
	public overrideHandlers: (options: PropertyOptions<T, U>) => void;
	public enumerable = true;
	public configurable = true;

	constructor(options: PropertyOptions<T, U>) {
		this.overrideHandlers = overrideHandlers(this);
		this.overrideHandlers(options);
		const propertyName = this.name;
		const key = Symbol(propertyName + ':propertyKey');
		this.key = key;

		const getDefault = Symbol(propertyName + ':getDefault');
		this.getDefault = getDefault;

		const setNative = Symbol(propertyName + ':setNative');
		this.setNative = setNative;

		const defaultValueKey = Symbol(propertyName + ':nativeDefaultValue');
		this.defaultValueKey = defaultValueKey;

		this.eventName = propertyName + 'Change';
		const property = this;
		this.set = getPropertySetter(this);
		this.get = function (this: T): U {
			return <U>(key in this ? this[key] : property.defaultValue);
		};
		symbolPropertyMap[key] = this;
	}
	nativeValueChange(owner: T, value: U): void {
		const key = this.key;
		const defaultValue = this.defaultValue;
		const oldValue = <U>(key in owner ? owner[key] : defaultValue);
		const changed = this.equalityComparer ? !this.equalityComparer(oldValue, value) : oldValue !== value;
		if (changed) {
			const defaultValueKey = this.defaultValueKey;
			const getDefault = this.getDefault;
			const eventName = this.eventName;
			const propertyName = this.name;
			owner[key] = value;
			if (this.valueChanged) {
				this.valueChanged(owner, oldValue, value);
			}

			if (owner.nativeViewProtected && !(defaultValueKey in owner)) {
				owner[defaultValueKey] = owner[getDefault] ? owner[getDefault]() : defaultValue;
			}

			if (owner.hasListeners(eventName)) {
				owner.notify<PropertyChangeData>({
					object: owner,
					eventName,
					propertyName,
					value,
					oldValue,
				});
			}

			if (this.affectsLayout) {
				owner.requestLayout();
			}

			if (owner.domNode) {
				owner.domNode.attributeModified(propertyName, value);
			}
		}
	}
	public register(cls: { prototype: T }): void {
		if (this.registered) {
			throw new Error(`Property ${this.name} already registered.`);
		}
		this.registered = true;
		// we store the property in the class static variable
		// so that animations can get access to us
		if (!cls['registeredProps']) {
			cls['registeredProps'] = {};
		}
		cls['registeredProps'][this.name] = this;
		Object.defineProperty(cls.prototype, this.name, this);
	}

	public isSet(instance: T): boolean {
		return this.key in instance;
	}
}
Property.prototype.isStyleProperty = false;

export class CoercibleProperty<T extends ViewBase, U> extends Property<T, U> implements CoercibleProperty<T, U> {
	coerceKey?: symbol;
	coerceValue?: (t: T, u: U) => U;

	constructor(options: CoerciblePropertyOptions<T, U>) {
		super(options);
		this.coerceKey = Symbol(this.name + ':coerceKey');
	}

	coerce(target: T): void {
		const originalValue = <U>(this.coerceKey in target ? target[this.coerceKey] : this.defaultValue);
		// need that to make coercing but also fire change events
		target[this.name] = originalValue;
	}
}

export class InheritedProperty<T extends ViewBase, U> extends Property<T, U> implements InheritedProperty<T, U> {
	public readonly sourceKey: symbol;
	public readonly setInheritedValue: (value: U) => void;

	constructor(options: PropertyOptions<T, U>) {
		super(options);
		const key = this.key;

		const sourceKey = Symbol(this.name + ':valueSourceKey');
		this.sourceKey = sourceKey;

		const setBase = this.set;
		const property = this;
		const setFunc = (valueSource: ValueSource) =>
			function (value: U): void {
				const that = <T>this;

				let unboxedValue: U;
				let newValueSource: number;

				if (value === unsetValue) {
					// If unsetValue - we want to reset the property.
					const parent: ViewBase = that.parent;
					// If we have parent and it has non-default value we use as our inherited value.
					if (parent && parent[sourceKey] !== ValueSource.Default) {
						unboxedValue = parent[property.name];
						newValueSource = ValueSource.Inherited;
					} else {
						unboxedValue = property.defaultValue;
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
								setInheritedValue.call(child, newValue);
							}
						}

						return true;
					});
				}
			};

		const setInheritedValue = setFunc(ValueSource.Inherited);
		this.setInheritedValue = setInheritedValue;

		this.set = setFunc(ValueSource.Local);

		inheritableProperties.push(this);
	}
}

function setCssFunc<T extends Style, U>(property: CssProperty<T, U>, valueSource: ValueSource) {
	return function (this: T, newValue: any): void {
		const view = this.viewRef.get();
		if (!view) {
			Trace.write(`${newValue} not set to view because ".viewRef" is cleared`, Trace.categories.Style, Trace.messageType.warn);

			return;
		}
		const sourceKey = property.sourceKey;
		if (valueSource === ValueSource.Css) {
			const currentValueSource: number = this[sourceKey] || ValueSource.Default;

			// We have localValueSource - NOOP.
			if (currentValueSource === ValueSource.Local) {
				return;
			}
		}
		const defaultValue = property.defaultValue;
		const key = property.key;
		const reset = newValue === unsetValue || newValue === '';
		let value: U;
		if (reset) {
			value = defaultValue;
			delete this[sourceKey];
		} else {
			this[sourceKey] = valueSource;
			value = property.valueConverter && typeof newValue === 'string' ? property.valueConverter(newValue) : <U>newValue;
		}

		const oldValue = <U>(key in this ? this[key] : defaultValue);
		const changed: boolean = property.equalityComparer ? !property.equalityComparer(oldValue, value) : oldValue !== value;

		if (changed) {
			const setNative = property.setNative;
			const defaultValueKey = property.defaultValueKey;
			const propertyName = property.name;
			const valueChanged = property.valueChanged;
			const eventName = property.eventName;
			if (reset) {
				delete this[key];
				if (valueChanged) {
					valueChanged(this, oldValue, value);
				}

				if (view[setNative]) {
					if (view._suspendNativeUpdatesCount) {
						if (view._suspendedUpdates) {
							view._suspendedUpdates[propertyName] = property;
						}
					} else {
						if (defaultValueKey in this) {
							view[setNative](this[defaultValueKey]);
							delete this[defaultValueKey];
						} else {
							view[setNative](defaultValue);
						}
					}
				}
			} else {
				this[key] = value;
				if (valueChanged) {
					valueChanged(this, oldValue, value);
				}

				if (view[setNative]) {
					if (view._suspendNativeUpdatesCount) {
						if (view._suspendedUpdates) {
							view._suspendedUpdates[propertyName] = property;
						}
					} else {
						if (!(defaultValueKey in this)) {
							const getDefault = property.getDefault;
							this[defaultValueKey] = view[getDefault] ? view[getDefault]() : defaultValue;
						}
						view[setNative](value);
					}
				}
			}

			if (this.hasListeners(eventName)) {
				this.notify<PropertyChangeData>({
					object: this,
					eventName,
					propertyName,
					value,
					oldValue,
				});
			}

			if (property.affectsLayout) {
				view.requestLayout();
			}
		}
	};
}

export class CssProperty<T extends Style, U> implements CssProperty<T, U> {
	public static properties: {
		[cssName: string]: CssProperty<any, any>;
	} = {};
	private registered: boolean;

	public readonly name: string;
	public readonly cssName: string;
	public readonly cssLocalName: string;
	public readonly eventName: string;

	protected readonly cssValueDescriptor: PropertyDescriptor;
	protected readonly localValueDescriptor: PropertyDescriptor;

	public isStyleProperty: boolean;

	public readonly key: symbol;
	public readonly getDefault: symbol;
	public readonly setNative: symbol;
	public readonly sourceKey: symbol;
	public readonly defaultValueKey: symbol;
	public readonly defaultValue: U;

	public affectsLayout?: boolean;
	public equalityComparer?: (x: U, y: U) => boolean;
	public valueChanged?: (target: T, oldValue: U, newValue: U) => void;
	public valueConverter?: (value: string) => U;

	public overrideHandlers: (options: CssPropertyOptions<T, U>) => void;

	constructor(options: CssPropertyOptions<T, U>) {
		this.overrideHandlers = overrideHandlers(this);
		this.overrideHandlers(options);
		const propertyName = this.name;

		CssProperty.properties[propertyName] = this;
		if (this.cssLocalName && this.cssLocalName !== propertyName) {
			CssProperty.properties[this.cssLocalName] = this;
		}

		const key = Symbol(propertyName + ':propertyKey');
		this.key = key;

		const sourceKey = Symbol(propertyName + ':valueSourceKey');
		this.sourceKey = sourceKey;

		const getDefault = Symbol(propertyName + ':getDefault');
		this.getDefault = getDefault;

		const setNative = Symbol(propertyName + ':setNative');
		this.setNative = setNative;

		const defaultValueKey = Symbol(propertyName + ':nativeDefaultValue');
		this.defaultValueKey = defaultValueKey;

		this.eventName = propertyName + 'Change';

		const property = this;
		function get(): U {
			return key in this ? this[key] : property.defaultValue;
		}

		this.cssValueDescriptor = {
			enumerable: true,
			configurable: true,
			get: get,
			set: setCssFunc(this, ValueSource.Css),
		};

		this.localValueDescriptor = {
			enumerable: true,
			configurable: true,
			get: get,
			set: setCssFunc(this, ValueSource.Local),
		};

		cssSymbolPropertyMap[key] = this;
	}

	public register(cls: { prototype: T }): void {
		if (this.registered) {
			throw new Error(`Property ${this.name} already registered.`);
		}
		// we add it so that overrideHandlers might work
		cssPropertyNames.push(this.cssLocalName);

		this.registered = true;
		Object.defineProperty(cls.prototype, this.name, this.localValueDescriptor);
		Object.defineProperty(cls.prototype, this.cssName, this.cssValueDescriptor);
		if (this.cssLocalName !== this.cssName) {
			Object.defineProperty(cls.prototype, this.cssLocalName, this.localValueDescriptor);
		}
	}

	public isSet(instance: T): boolean {
		return this.key in instance;
	}
}
CssProperty.prototype.isStyleProperty = true;

export class CssAnimationProperty<T extends Style, U> implements CssAnimationProperty<T, U> {
	public readonly name: string;
	public readonly cssName: string;
	public readonly cssLocalName: string;
	public readonly eventName: string;

	public readonly getDefault: symbol;
	public readonly setNative: symbol;

	public readonly register: (cls: { prototype }) => void;

	public readonly keyframe: string;
	public readonly defaultValueKey: symbol;
	public readonly key: symbol;
	private readonly source: symbol;

	public readonly defaultValue: U;

	public isStyleProperty: boolean;

	public static properties: {
		[cssName: string]: CssAnimationProperty<any, any>;
	} = {};

	readonly affectsLayout?: boolean;
	readonly equalityComparer?: (x: U, y: U) => boolean;
	readonly valueChanged?: (target: T, oldValue: U, newValue: U) => void;
	readonly valueConverter?: (value: string) => U;
	public overrideHandlers: (options: CssAnimationPropertyOptions<T, U>) => void;

	constructor(options: CssAnimationPropertyOptions<T, U>) {
		this.overrideHandlers = overrideHandlers(this);
		this.overrideHandlers(options);

		const propertyName = this.name;

		CssAnimationProperty.properties[propertyName] = this;
		if (this.cssLocalName && this.cssLocalName !== propertyName) {
			CssAnimationProperty.properties[this.cssLocalName] = this;
		}

		const keyframeName = 'keyframe:' + propertyName;
		this.keyframe = keyframeName;
		const defaultName = 'default:' + propertyName;

		const defaultValueKey = Symbol(defaultName);
		this.defaultValueKey = defaultValueKey;

		const cssValue = Symbol(this.cssName);
		const styleValue = Symbol(`local:${propertyName}`);
		const keyframeValue = Symbol(keyframeName);
		const computedValue = Symbol('computed-value:' + propertyName);
		this.key = computedValue;
		const computedSource = Symbol('computed-source:' + propertyName);
		this.source = computedSource;

		this.getDefault = Symbol(propertyName + ':getDefault');
		const getDefault = this.getDefault;
		const setNative = (this.setNative = Symbol(propertyName + ':setNative'));
		this.eventName = propertyName + 'Change';

		const property = this;

		function descriptor(symbol: symbol, propertySource: ValueSource, enumerable: boolean, configurable: boolean, getsComputed: boolean): PropertyDescriptor {
			return {
				enumerable,
				configurable,
				get: getsComputed
					? function (this: T) {
							return this[computedValue];
					  }
					: function (this: T) {
							return this[symbol];
					  },
				set(this: T, boxedValue: U | string) {
					const view = this.viewRef.get();
					if (!view) {
						Trace.write(`${boxedValue} not set to view because ".viewRef" is cleared`, Trace.categories.Animation, Trace.messageType.warn);

						return;
					}

					const oldValue = this[computedValue];
					const oldSource = this[computedSource];
					const wasSet = oldSource !== ValueSource.Default;
					const reset = boxedValue === unsetValue || boxedValue === '';
					if (reset) {
						this[symbol] = unsetValue;
						if (this[computedSource] === propertySource) {
							// Fallback to lower value source.
							if (this[styleValue] !== unsetValue) {
								this[computedSource] = ValueSource.Local;
								this[computedValue] = this[styleValue];
							} else if (this[cssValue] !== unsetValue) {
								this[computedSource] = ValueSource.Css;
								this[computedValue] = this[cssValue];
							} else {
								delete this[computedSource];
								delete this[computedValue];
							}
						}
					} else {
						if (property.valueConverter && typeof boxedValue === 'string') {
							boxedValue = property.valueConverter(boxedValue);
						}
						this[symbol] = boxedValue;
						if (this[computedSource] <= propertySource) {
							this[computedSource] = propertySource;
							this[computedValue] = boxedValue;
						}
					}

					const value = this[computedValue];
					const source = this[computedSource];
					const isSet = source !== ValueSource.Default;

					const computedValueChanged = oldValue !== value && (!property.equalityComparer || !property.equalityComparer(oldValue, value));

					if (computedValueChanged && property.valueChanged) {
						property.valueChanged(this, oldValue, value);
					}

					if (view[setNative] && (computedValueChanged || isSet !== wasSet)) {
						if (view._suspendNativeUpdatesCount) {
							if (view._suspendedUpdates) {
								view._suspendedUpdates[propertyName] = property;
							}
						} else {
							if (isSet) {
								if (!wasSet && !(defaultValueKey in this)) {
									this[defaultValueKey] = view[getDefault] ? view[getDefault]() : property.defaultValue;
								}
								view[setNative](value);
							} else if (wasSet) {
								if (defaultValueKey in this) {
									view[setNative](this[defaultValueKey]);
								} else {
									view[setNative](property.defaultValue);
								}
							}
						}
					}
					const eventName = property.eventName;
					if (computedValueChanged && this.hasListeners(eventName)) {
						this.notify<PropertyChangeData>({
							object: this,
							eventName,
							propertyName,
							value,
							oldValue,
						});
					}
					if (property.affectsLayout) {
						view.requestLayout();
					}
				},
			};
		}

		const defaultPropertyDescriptor = descriptor(defaultValueKey, ValueSource.Default, false, false, false);
		const cssPropertyDescriptor = descriptor(cssValue, ValueSource.Css, false, false, false);
		const stylePropertyDescriptor = descriptor(styleValue, ValueSource.Local, true, true, true);
		const keyframePropertyDescriptor = descriptor(keyframeValue, ValueSource.Keyframe, false, false, false);

		symbolPropertyMap[computedValue] = this;
		cssSymbolPropertyMap[computedValue] = this;

		this.register = (cls: { prototype: T }) => {
			// we add it so that overrideHandlers might work
			cssPropertyNames.push(this.cssLocalName);

			cls.prototype[computedValue] = this.defaultValue;
			cls.prototype[computedSource] = ValueSource.Default;

			cls.prototype[cssValue] = unsetValue;
			cls.prototype[styleValue] = unsetValue;
			cls.prototype[keyframeValue] = unsetValue;

			Object.defineProperty(cls.prototype, defaultName, defaultPropertyDescriptor);
			Object.defineProperty(cls.prototype, this.cssName, cssPropertyDescriptor);
			Object.defineProperty(cls.prototype, propertyName, stylePropertyDescriptor);
			if (this.cssLocalName && this.cssLocalName !== this.name) {
				Object.defineProperty(cls.prototype, this.cssLocalName, stylePropertyDescriptor);
			}
			Object.defineProperty(cls.prototype, keyframeName, keyframePropertyDescriptor);
		};
	}

	public _initDefaultNativeValue(target: T): void {
		const view = target.viewRef.get();
		if (!view) {
			Trace.write(`_initDefaultNativeValue not executed to view because ".viewRef" is cleared`, Trace.categories.Animation, Trace.messageType.warn);

			return;
		}

		const defaultValueKey = this.defaultValueKey;

		if (!(defaultValueKey in target)) {
			const getDefault = this.getDefault;
			target[defaultValueKey] = view[getDefault] ? view[getDefault]() : this.defaultValue;
		}
	}

	public static _getByCssName(name: string): CssAnimationProperty<any, any> {
		return this.properties[name];
	}

	public static _getPropertyNames(): string[] {
		return Object.keys(CssAnimationProperty.properties);
	}

	public isSet(instance: T): boolean {
		return instance[this.source] !== ValueSource.Default;
	}
}
CssAnimationProperty.prototype.isStyleProperty = true;

function setCssInheritedFunc<T extends Style, U>(property: InheritedCssProperty<T, U>, valueSource: ValueSource) {
	return function (this: T, boxedValue: any): void {
		const view = this.viewRef.get();
		if (!view) {
			Trace.write(`${boxedValue} not set to view's property because ".viewRef" is cleared`, Trace.categories.Style, Trace.messageType.warn);

			return;
		}
		const key = property.key;
		const defaultValue = property.defaultValue;
		const sourceKey = property.sourceKey;
		const propertyName = property.name;

		const reset = boxedValue === unsetValue || boxedValue === '';
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

		const oldValue = <U>(key in this ? this[key] : defaultValue);
		let value: U;
		let unsetNativeValue = false;
		if (reset) {
			// If unsetValue - we want to reset this property.
			const parent = view.parent;
			const style = parent ? parent.style : null;
			// If we have parent and it has non-default value we use as our inherited value.
			if (style && style[sourceKey] > ValueSource.Default) {
				value = style[propertyName];
				this[sourceKey] = ValueSource.Inherited;
				this[key] = value;
			} else {
				value = defaultValue;
				delete this[sourceKey];
				delete this[key];
				unsetNativeValue = true;
			}
		} else {
			this[sourceKey] = valueSource;
			if (property.valueConverter && typeof boxedValue === 'string') {
				value = property.valueConverter(boxedValue);
			} else {
				value = boxedValue;
			}
			this[key] = value;
		}

		const changed: boolean = property.equalityComparer ? !property.equalityComparer(oldValue, value) : oldValue !== value;

		if (changed) {
			const setNative = property.setNative;
			const defaultValueKey = property.defaultValueKey;
			const eventName = property.eventName;
			const getDefault = property.getDefault;
			if (property.valueChanged) {
				property.valueChanged(this, oldValue, value);
			}

			if (view[setNative]) {
				if (view._suspendNativeUpdatesCount) {
					if (view._suspendedUpdates) {
						view._suspendedUpdates[propertyName] = property;
					}
				} else {
					if (unsetNativeValue) {
						if (defaultValueKey in this) {
							view[setNative](this[defaultValueKey]);
							delete this[defaultValueKey];
						} else {
							view[setNative](defaultValue);
						}
					} else {
						if (!(defaultValueKey in this)) {
							this[defaultValueKey] = view[getDefault] ? view[getDefault]() : defaultValue;
						}

						view[setNative](value);
					}
				}
			}

			if (this.hasListeners(eventName)) {
				this.notify<PropertyChangeData>({
					object: this,
					eventName,
					propertyName,
					value,
					oldValue,
				});
			}

			if (property.affectsLayout) {
				view.requestLayout();
			}

			view.eachChild((child) => {
				const childStyle = child.style;
				const childValueSource = childStyle[sourceKey] || ValueSource.Default;
				if (reset) {
					if (childValueSource === ValueSource.Inherited) {
						property.setDefaultValue.call(childStyle, unsetValue);
					}
				} else {
					if (childValueSource <= ValueSource.Inherited) {
						property.setInheritedValue.call(childStyle, value);
					}
				}

				return true;
			});
		}
	};
}

export class InheritedCssProperty<T extends Style, U> extends CssProperty<T, U> implements InheritedCssProperty<T, U> {
	public setInheritedValue: (value: U) => void;
	public setDefaultValue: (value: U) => void;
	public static properties: {
		[cssName: string]: InheritedCssProperty<any, any>;
	} = {};
	constructor(options: CssPropertyOptions<T, U>) {
		super(options);
		const propertyName = options.name;
		InheritedCssProperty.properties[propertyName] = this;

		this.setDefaultValue = setCssInheritedFunc(this, ValueSource.Default);
		this.setInheritedValue = setCssInheritedFunc(this, ValueSource.Inherited);
		this.cssValueDescriptor.set = setCssInheritedFunc(this, ValueSource.Css);
		this.localValueDescriptor.set = setCssInheritedFunc(this, ValueSource.Local);
		inheritableCssProperties.push(this);
	}
}

function setShorthandFunc<T extends Style, U>(property: ShorthandProperty<T, U>, valueSource: ValueSource) {
	return function (this: T, newValue: any): void {
		const view = this.viewRef.get();
		if (!view) {
			Trace.write(`setLocalValue not executed to view because ".viewRef" is cleared`, Trace.categories.Animation, Trace.messageType.warn);

			return;
		}

		view._batchUpdate(() => {
			for (const [p, v] of property.converter(newValue)) {
				if (valueSource === ValueSource.Css) {
					this[p.cssName] = v;
				} else {
					this[p.name] = v;
				}
			}
		});
	};
}
export class ShorthandProperty<T extends Style, P> implements ShorthandProperty<T, P> {
	private registered: boolean;

	public readonly key: symbol;
	public readonly name: string;
	public readonly cssName: string;
	public readonly cssLocalName: string;

	protected readonly cssValueDescriptor: PropertyDescriptor;
	protected readonly localValueDescriptor: PropertyDescriptor;
	protected readonly propertyBagDescriptor: PropertyDescriptor;
	readonly converter: (value: string | P) => [CssProperty<any, any> | CssAnimationProperty<any, any>, any][];
	public overrideHandlers: (options: ShorthandPropertyOptions<P>) => void;
	public readonly sourceKey: symbol;

	public static properties: {
		[cssName: string]: ShorthandProperty<any, any>;
	} = {};

	constructor(options: ShorthandPropertyOptions<P>) {
		this.overrideHandlers = overrideHandlers(this);
		this.overrideHandlers(options);
		const key = Symbol(this.name + ':propertyKey');
		ShorthandProperty.properties[this.name] = this;
		this.key = key;

		this.cssValueDescriptor = {
			enumerable: true,
			configurable: true,
			get: options.getter,
			set: setShorthandFunc(this, ValueSource.Css),
		};

		this.localValueDescriptor = {
			enumerable: true,
			configurable: true,
			get: options.getter,
			set: setShorthandFunc(this, ValueSource.Local),
		};

		const property = this;
		this.propertyBagDescriptor = {
			enumerable: false,
			configurable: true,
			set(value: string) {
				property.converter(value).forEach(([property, value]) => {
					this[property.cssLocalName] = value;
				});
			},
		};

		cssSymbolPropertyMap[key] = this;
	}

	public register(cls: typeof Style): void {
		if (this.registered) {
			throw new Error(`Property ${this.name} already registered.`);
		}

		this.registered = true;
		Object.defineProperty(cls.prototype, this.name, this.localValueDescriptor);
		Object.defineProperty(cls.prototype, this.cssName, this.cssValueDescriptor);
		if (this.cssLocalName !== this.cssName) {
			Object.defineProperty(cls.prototype, this.cssLocalName, this.localValueDescriptor);
		}

		Object.defineProperty(cls.prototype.PropertyBag, this.cssLocalName, this.propertyBagDescriptor);
	}
}

function inheritablePropertyValuesOn<T extends InheritedProperty<any, any> | InheritedCssProperty<any, any>>(view: ViewBase | Style, properties: Array<T>): Array<{ property: T; value: any }> {
	const array = new Array<{
		property: T;
		value: any;
	}>();
	for (const prop of properties) {
		const sourceKey = prop.sourceKey;
		const valueSource: number = view[sourceKey] || ValueSource.Default;
		if (valueSource !== ValueSource.Default) {
			// use prop.name as it will return value or default value.
			// prop.key will return undefined if property is set the same value as default one.
			array.push({ property: prop, value: view[prop.name] });
		}
	}

	return array;
}

type PropertyInterface = Property<ViewBase, any> | CssProperty<Style, any> | CssAnimationProperty<Style, any>;

export const initNativeView = profile('"properties".initNativeView', function initNativeView(view: ViewBase): void {
	const wasSuspended = view.suspendRequestLayout;
	view.suspendRequestLayout = true;
	if (view._suspendedUpdates) {
		applyPendingNativeSetters(view);
	} else {
		applyAllNativeSetters(view);
	}
	// Would it be faster to delete all members of the old object?
	view._suspendedUpdates = {};

	// if the view requestLayout was not suspended before
	// it means we can request a layout if needed.
	// will be done after otherwise
	view.suspendRequestLayout = wasSuspended;
	if (!wasSuspended && view.isLayoutRequestNeeded) {
		view.requestLayout();
	}
});

export function applyPendingNativeSetters(view: ViewBase): void {
	// TODO: Check what happens if a view was suspended and its value was reset, or set back to default!
	const suspendedUpdates = view._suspendedUpdates;
	for (const propertyName in suspendedUpdates) {
		const property = <PropertyInterface>suspendedUpdates[propertyName];
		const setNative = property.setNative;
		if (view[setNative]) {
			const { getDefault, isStyleProperty, defaultValueKey, defaultValue } = property;
			let value;
			if (isStyleProperty) {
				const style = view.style;
				if ((<CssProperty<Style, any> | CssAnimationProperty<Style, any>>property).isSet(view.style)) {
					if (!(defaultValueKey in style)) {
						style[defaultValueKey] = view[getDefault] ? view[getDefault]() : defaultValue;
					}
					value = view.style[propertyName];
				} else {
					value = style[defaultValueKey];
				}
			} else {
				if ((<Property<ViewBase, any>>property).isSet(view)) {
					if (!(defaultValueKey in view)) {
						view[defaultValueKey] = view[getDefault] ? view[getDefault]() : defaultValue;
					}
					value = view[propertyName];
				} else {
					value = view[defaultValueKey];
				}
			}
			// TODO: Only if value is different from the value before the scope was created.
			view[setNative](value);
		}
	}
}

export function applyAllNativeSetters(view: ViewBase): void {
	let symbols = Object.getOwnPropertySymbols(view);
	for (const symbol of symbols) {
		const property: Property<any, any> = symbolPropertyMap[symbol];
		if (!property) {
			continue;
		}

		const setNative = property.setNative;
		const getDefault = property.getDefault;
		if (setNative in view) {
			const defaultValueKey = property.defaultValueKey;
			if (!(defaultValueKey in view)) {
				view[defaultValueKey] = view[getDefault] ? view[getDefault]() : property.defaultValue;
			}

			const value = view[symbol];
			view[setNative](value);
		}
	}

	const style = view.style;
	symbols = Object.getOwnPropertySymbols(style);
	for (const symbol of symbols) {
		const property: CssProperty<any, any> = cssSymbolPropertyMap[symbol];
		if (!property) {
			continue;
		}

		if (view[property.setNative]) {
			const defaultValueKey = property.defaultValueKey;
			if (!(defaultValueKey in style)) {
				style[defaultValueKey] = view[property.getDefault] ? view[property.getDefault]() : property.defaultValue;
			}

			const value = style[symbol];
			view[property.setNative](value);
		}
	}
}

export function resetNativeView(view: ViewBase): void {
	let symbols = Object.getOwnPropertySymbols(view);
	for (const symbol of symbols) {
		const property: Property<any, any> = symbolPropertyMap[symbol];
		if (!property) {
			continue;
		}

		if (view[property.setNative]) {
			if (property.defaultValueKey in view) {
				view[property.setNative](view[property.defaultValueKey]);
				delete view[property.defaultValueKey];
			} else {
				view[property.setNative](property.defaultValue);
			}
		}
	}

	const style = view.style;

	symbols = Object.getOwnPropertySymbols(style);
	for (const symbol of symbols) {
		const property: CssProperty<any, any> = cssSymbolPropertyMap[symbol];
		if (!property) {
			continue;
		}

		if (view[property.setNative]) {
			if (property.defaultValueKey in style) {
				view[property.setNative](style[property.defaultValueKey]);
				delete style[property.defaultValueKey];
			} else {
				view[property.setNative](property.defaultValue);
			}
		}
	}
}

export function clearInheritedProperties(view: ViewBase): void {
	for (const prop of inheritableProperties) {
		const sourceKey = prop.sourceKey;
		if (view[sourceKey] === ValueSource.Inherited) {
			prop.set.call(view, unsetValue);
		}
	}

	const style = view.style;
	for (const prop of inheritableCssProperties) {
		const sourceKey = prop.sourceKey;
		if (style[sourceKey] === ValueSource.Inherited) {
			prop.setInheritedValue.call(style, unsetValue);
		}
	}
}

export function resetCSSProperties(style: Style): void {
	const symbols = Object.getOwnPropertySymbols(style);
	for (const symbol of symbols) {
		let cssProperty;
		if ((cssProperty = cssSymbolPropertyMap[symbol])) {
			style[cssProperty.cssName] = unsetValue;
			if (cssProperty instanceof CssAnimationProperty) {
				style[cssProperty.keyframe] = unsetValue;
			}
		}
	}
}

export function propagateInheritableCssProperties(style: Style, child: Style) {
	return _propagateInheritableProperties(style, child, inheritableCssProperties);
}
export function propagateInheritableProperties(view: ViewBase, child: ViewBase) {
	return _propagateInheritableProperties(view, child, inheritableProperties);
}
function _propagateInheritableProperties<U extends ViewBase | Style, T extends InheritedProperty<any, any> | InheritedCssProperty<any, any>>(view: U, child: U, properties: Array<T>): void {
	const inheritablePropertyValues = inheritablePropertyValuesOn(view, properties);
	for (const pair of inheritablePropertyValues) {
		const prop = pair.property;
		const sourceKey = prop.sourceKey;
		const currentValueSource: number = child[sourceKey] || ValueSource.Default;
		if (currentValueSource <= ValueSource.Inherited) {
			prop.setInheritedValue.call(child, pair.value);
		}
	}
}

export function makeValidator<T>(...values: T[]): (value: any) => value is T {
	const set = new Set(values);

	return (value: any): value is T => set.has(value);
}

export function makeParser<T>(isValid: (value: any) => boolean, allowNumbers = false): (value: any) => T {
	return (value) => {
		const lower = value && value.toLowerCase();
		if (isValid(lower)) {
			return lower;
		} else {
			if (allowNumbers) {
				const convNumber = +value;
				if (!isNaN(convNumber)) {
					return value;
				}
			}
			throw new Error('Invalid value: ' + value);
		}
	};
}

export function getSetProperties(view: ViewBase): [string, any][] {
	const result = [];

	Object.getOwnPropertyNames(view).forEach((prop) => {
		result.push([prop, view[prop]]);
	});

	const symbols = Object.getOwnPropertySymbols(view);
	for (const symbol of symbols) {
		const property = symbolPropertyMap[symbol];
		if (!property) {
			continue;
		}

		const value = view[property.key];
		result.push([property.name, value]);
	}

	return result;
}

export function getComputedCssValues(view: ViewBase): [string, any][] {
	const result = [];
	const style = view.style;
	for (const prop of cssPropertyNames) {
		result.push([prop, style[prop]]);
	}

	// Add these to enable box model in chrome-devtools styles tab
	result.push(['top', 'auto']);
	result.push(['left', 'auto']);
	result.push(['bottom', 'auto']);
	result.push(['right', 'auto']);

	return result;
}
