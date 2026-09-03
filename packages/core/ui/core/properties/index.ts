// Type-only on purpose: `ViewBase` imports this module back, and the cycle only holds while
// nothing here needs `ViewBase` at runtime.
import type { ViewBase } from '../view-base';
import { PropertyChangeData, WrappedValue } from '../../../data/observable';
import { Trace } from '../../../trace';

import { Style } from '../../styling/style';

import { profile } from '../../../profiling';
import { unsetValue, PropertyOptions, CoerciblePropertyOptions, CssPropertyOptions, ShorthandPropertyOptions, CssAnimationPropertyOptions, isCssWideKeyword, isCssUnsetValue, isResetValue } from './property-shared';
import { Invalidation } from '../native-updates/invalidation';
import { NativeUpdateBatch } from '../native-updates/batch';
import { NativeUpdates } from '../native-updates/scheduler';
import type { NativeUpdateEntry } from '../native-updates/batch';
import { calc } from '@csstools/css-calc';

// Backwards compatibility
export { unsetValue } from './property-shared';

const cssPropertyNames: string[] = [];
const cssShorthandConverters = new Map<string, (value: string) => [any, any][]>();
const cssShorthandLonghands = new Map<string, string[]>();
const HAS_OWN = Object.prototype.hasOwnProperty;
const symbolPropertyMap = {};
const cssSymbolPropertyMap = {};

// Hoisted regex/constants for hot paths to avoid re-allocation
const CSS_VARIABLE_NAME_RE = /^--[^,\s]+?$/;
const DIP_RE = /([0-9]+(\.[0-9]+)?)dip\b/g;
const UNSET_RE = /unset/g;
const INFINITY_RE = /infinity/g;

const inheritableProperties = new Array<InheritedProperty<any, any>>();
const inheritableCssProperties = new Array<InheritedCssProperty<any, any>>();

const enum ValueSource {
	Default = 0,
	Inherited = 1,
	Css = 2,
	Local = 3,
	Keyframe = 4,
}

/** `sourceKey` of every registered `CssProperty`, by css name. */
const cssValueSourceKeys: Record<string, symbol> = Object.create(null);

/**
 * Whether the style still carries what the cascade last wrote for the property.
 * A `CssProperty` keeps one value: a local value both suppresses the css write and
 * takes the slot, so clearing it leaves the property at its default with the css
 * value gone. The cascade has to write it again rather than skip it as unchanged.
 */
export function _isCssValueStillApplied(style: unknown, cssLocalName: string, value: unknown): boolean {
	const sourceKey = cssValueSourceKeys[cssLocalName];
	if (sourceKey === undefined) {
		// Applied through the view rather than the style; nothing to verify.
		return true;
	}

	// A reset leaves no source behind, so it is in effect precisely when nothing else claimed the property.
	return style[sourceKey] === (isResetValue(value) ? undefined : ValueSource.Css);
}

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

export function _getProperties(): Property<any, any>[] {
	return getPropertiesFromMap(symbolPropertyMap) as Property<any, any>[];
}

export function _getStyleProperties(): CssProperty<any, any>[] {
	return getPropertiesFromMap(cssSymbolPropertyMap) as CssProperty<any, any>[];
}

/**
 * Placeholder cascaded for each longhand of a shorthand that cannot be split while
 * parsing - a single `var()` may substitute several longhands at once, so the
 * shorthand is only parsed once its expression is resolved per view.
 * @see https://drafts.csswg.org/css-variables/#variables-in-shorthands
 */
export class CssPendingSubstitution {
	constructor(
		public readonly shorthand: string,
		public readonly value: string,
	) {}

	toString(): string {
		return this.value;
	}
}

export function _isCssPendingSubstitution(value: unknown): value is CssPendingSubstitution {
	return value instanceof CssPendingSubstitution;
}

/**
 * The longhands a shorthand expands into, probed from its converter on first use -
 * the longhand properties a converter closes over are not initialized yet while
 * the shorthand itself is being registered.
 */
function getCssShorthandLonghands(cssName: string): string[] | undefined {
	const known = cssShorthandLonghands.get(cssName);
	if (known) {
		return known;
	}

	const converter = cssShorthandConverters.get(cssName);
	if (!converter) {
		return undefined;
	}

	try {
		const probed = converter(unsetValue);
		if (!probed?.length) {
			return undefined;
		}

		const longhands: string[] = [];
		for (let i = 0, length = probed.length; i < length; i++) {
			longhands.push(probed[i][0].cssLocalName);
		}

		cssShorthandLonghands.set(cssName, longhands);

		return longhands;
	} catch (e) {
		Trace.write(`Could not determine the longhands of shorthand [${cssName}]. ${e}`, Trace.categories.Style, Trace.messageType.warn);

		return undefined;
	}
}

/**
 * One pending-substitution value per longhand of the shorthand, or `undefined`
 * when the longhands cannot be determined.
 */
export function _pendingCssShorthandSubstitution(cssName: string, value: string): [string, CssPendingSubstitution][] | undefined {
	const longhands = getCssShorthandLonghands(cssName);
	if (!longhands) {
		return undefined;
	}

	const pending = new CssPendingSubstitution(cssName, value);
	const declarations: [string, CssPendingSubstitution][] = [];
	for (let i = 0, length = longhands.length; i < length; i++) {
		declarations.push([longhands[i], pending]);
	}

	return declarations;
}

/**
 * Expand a shorthand declaration into its longhand declarations, or `undefined`
 * when the property is not a shorthand, the value still has to be evaluated per
 * view (`var()`/`calc()`), or it does not parse.
 */
export function _expandCssShorthand(cssName: string, value: string): [string, any][] | undefined {
	const converter = cssShorthandConverters.get(cssName);
	if (!converter) {
		return undefined;
	}

	if (typeof value === 'string' && (isCssVariableExpression(value) || isCssCalcExpression(value))) {
		return undefined;
	}

	try {
		const converted = converter(value);
		const expanded: [string, any][] = [];
		for (let i = 0, length = converted.length; i < length; i++) {
			expanded.push([converted[i][0].cssLocalName, converted[i][1]]);
		}

		return expanded;
	} catch (e) {
		Trace.write(`Failed to expand shorthand [${cssName}] with value [${value}]. ${e}`, Trace.categories.Style, Trace.messageType.warn);

		return undefined;
	}
}

export function isCssVariable(property: string) {
	return CSS_VARIABLE_NAME_RE.test(property);
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
		return calc(_replaceKeywordsWithValues(_replaceDip(value)));
	} else {
		return value;
	}
	return value;
}

function _replaceDip(value: string) {
	return value.replace(DIP_RE, '$1');
}

function _replaceKeywordsWithValues(value: string) {
	let cssValue = value;
	if (cssValue.includes('unset')) {
		cssValue = cssValue.replace(UNSET_RE, '0');
	}
	if (cssValue.includes('infinity')) {
		cssValue = cssValue.replace(INFINITY_RE, '999999');
	}
	return cssValue;
}

function getPropertiesFromMap(map): Property<any, any>[] | CssProperty<any, any>[] {
	const symbols = Object.getOwnPropertySymbols(map);
	const len = symbols.length;
	const props = new Array(len);
	for (let i = 0; i < len; i++) {
		props[i] = map[symbols[i]];
	}
	return props;
}

type NativeProperty = Property<any, any> | CssProperty<any, any> | CssAnimationProperty<any, any>;

/**
 * What a setter asks of the native view. The `store` a write is made against is where the
 * captured native default lives: the view for view properties, the style for css ones.
 */
const enum NativeWrite {
	/** Nothing to push; the write only has to be recorded while updates are suspended. */
	None,
	/** Push the value, capturing the native default first when nothing captured it yet. */
	Value,
	/** Push the value without capturing: the slot doubles as `CssAnimationProperty`'s `default:` value. */
	ValueNoCapture,
	/** Push the captured native default back and drop the capture. */
	Default,
	/** Push the captured native default back, keeping it for the same reason as `ValueNoCapture`. */
	DefaultNoRelease,
}

function captureNativeDefault(view: ViewBase, store: any, property: NativeProperty): void {
	const defaultValueKey = property.defaultValueKey;
	if (!(defaultValueKey in store)) {
		const getDefault = property.getDefault;
		store[defaultValueKey] = view[getDefault] ? view[getDefault]() : property.defaultValue;
	}
}

function applyNativeValue(view: ViewBase, store: any, property: NativeProperty, value: any, write: NativeWrite): void {
	const setNative = property.setNative;

	if (write === NativeWrite.Value || write === NativeWrite.ValueNoCapture) {
		if (write === NativeWrite.Value) {
			captureNativeDefault(view, store, property);
		}

		view[setNative](value);

		return;
	}

	const defaultValueKey = property.defaultValueKey;
	if (defaultValueKey in store) {
		view[setNative](store[defaultValueKey]);
		if (write === NativeWrite.Default) {
			delete store[defaultValueKey];
		}
	} else {
		view[setNative](property.defaultValue);
	}
}

// Bound once: the setters read the batch depth on every write, and going through the module
// namespace on each of them is measurable.
const scheduler = NativeUpdates;

let defaultCommitNativeUpdates: unknown;

/**
 * Registered by `ViewBase` at load. Setters compare a node's hook against it to tell whether its
 * class takes part in commit ordering, which they cannot ask `ViewBase` for directly.
 * @private
 */
export function _setDefaultCommitNativeUpdates(commit: unknown): void {
	defaultCommitNativeUpdates = commit;
}

/**
 * The single native routing point of every property setter. A live view whose class takes no part
 * in commit ordering writes straight through; anything else records the property as dirty and lets
 * a commit apply it, right away when nothing is holding native updates back.
 */
function queueOrApplyNative(view: ViewBase, store: any, property: NativeProperty, value: any, write: NativeWrite, oldValue: any): void {
	if (view._suspendNativeUpdatesCount !== 0 || scheduler._depth !== 0 || view.commitNativeUpdates !== defaultCommitNativeUpdates || property.invalidates !== undefined) {
		queueNativeUpdate(view, property, oldValue);

		return;
	}

	const setNative = property.setNative;
	if (!view[setNative]) {
		return;
	}

	// The plain write is spelled out rather than delegated: it is the one every live set takes,
	// and a call per set is measurable on an interpreter-only engine.
	if (write === NativeWrite.Value) {
		const defaultValueKey = property.defaultValueKey;
		if (!(defaultValueKey in store)) {
			const getDefault = property.getDefault;
			store[defaultValueKey] = view[getDefault] ? view[getDefault]() : property.defaultValue;
		}

		view[setNative](value);
	} else if (write !== NativeWrite.None) {
		applyNativeValue(view, store, property, value, write);
	}
}

function queueNativeUpdate(view: ViewBase, property: NativeProperty, oldValue: any): void {
	if (scheduler._depth !== 0) {
		scheduler._hold(view);
	}

	const invalidates = property.invalidates;
	const dirty = view._suspendedUpdates;
	if (dirty && view[property.setNative]) {
		// `NativeUpdateBatch.previous` is only reachable from a commit hook or an aggregate
		// handler, so a node with neither records nothing.
		if (invalidates !== undefined || view.commitNativeUpdates !== defaultCommitNativeUpdates) {
			let previous = view._pendingPrevious;
			if (!previous) {
				previous = view._pendingPrevious = new Map();
			}
			if (!previous.has(property)) {
				previous.set(property, oldValue);
			}
		}

		dirty[property.name] = property;
	}

	if (invalidates) {
		let pending = view._pendingInvalidations;
		if (!pending) {
			pending = view._pendingInvalidations = new Set();
		}

		for (let i = 0, length = invalidates.length; i < length; i++) {
			pending.add(invalidates[i]);
		}
	}

	if (view._suspendNativeUpdatesCount === 0) {
		initNativeView(view);
	}
}

export class Property<T extends ViewBase, U> implements TypedPropertyDescriptor<U>, Property<T, U> {
	private registered: boolean;

	public readonly name: string;
	public readonly key: symbol;

	public readonly getDefault: symbol;
	public readonly setNative: symbol;

	public readonly defaultValueKey: symbol;
	public readonly defaultValue: U;
	public readonly invalidates: readonly Invalidation[] | undefined;
	public readonly nativeValueChange: (owner: T, value: U) => void;

	public isStyleProperty: boolean;

	public get: () => U;
	public set: (value: U) => void;
	public overrideHandlers: (options: PropertyOptions<T, U>) => void;
	public enumerable = true;
	public configurable = true;

	constructor(options: PropertyOptions<T, U>) {
		const propertyName = options.name;
		this.name = propertyName;

		const key = Symbol(propertyName + ':propertyKey');
		this.key = key;

		const getDefault = Symbol(propertyName + ':getDefault');
		this.getDefault = getDefault;

		const setNative = Symbol(propertyName + ':setNative');
		this.setNative = setNative;

		const defaultValueKey = Symbol(propertyName + ':nativeDefaultValue');
		this.defaultValueKey = defaultValueKey;

		const defaultValue: U = options.defaultValue;
		this.defaultValue = defaultValue;
		this.invalidates = options.invalidates;

		const eventName = propertyName + 'Change';

		let equalityComparer = options.equalityComparer;
		let affectsLayout: boolean = options.affectsLayout;
		let valueChanged = options.valueChanged;
		let valueConverter = options.valueConverter;
		let overrideConverter = false;

		this.overrideHandlers = function (options: PropertyOptions<T, U>) {
			if (typeof options.equalityComparer !== 'undefined') {
				equalityComparer = options.equalityComparer;
			}
			if (typeof options.affectsLayout !== 'undefined') {
				affectsLayout = options.affectsLayout;
			}
			if (typeof options.valueChanged !== 'undefined') {
				valueChanged = options.valueChanged;
			}
			if (typeof options.valueConverter !== 'undefined') {
				valueConverter = options.valueConverter;
				overrideConverter = true;
			}
		};

		const property = this;

		this.set = function (this: T, boxedValue: U): void {
			const reset = isResetValue(boxedValue);
			let value: U;
			let wrapped: boolean;
			if (reset) {
				value = defaultValue;
			} else {
				wrapped = boxedValue && (<any>boxedValue).wrapped;
				value = wrapped ? WrappedValue.unwrap(boxedValue) : boxedValue;

				if (valueConverter && typeof value === 'string') {
					value = overrideConverter ? valueConverter.call(this, value) : valueConverter(value);
				}
			}

			const oldValue = <U>(key in this ? this[key] : defaultValue);
			const changed: boolean = equalityComparer ? !equalityComparer(oldValue, value) : oldValue !== value;

			if (wrapped || changed) {
				if (affectsLayout) {
					this.requestLayout();
				}

				if (reset) {
					delete this[key];
				} else {
					this[key] = value;
				}

				if (valueChanged) {
					valueChanged(this, oldValue, value);
				}

				queueOrApplyNative(this, this, property, value, reset ? NativeWrite.Default : NativeWrite.Value, oldValue);

				if (this.hasListeners(eventName)) {
					this.notify<PropertyChangeData>({
						object: this,
						eventName,
						propertyName,
						value,
						oldValue,
					});
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

		this.get = function (this: T): U {
			return <U>(key in this ? this[key] : defaultValue);
		};

		this.nativeValueChange = function (owner: T, value: U): void {
			const oldValue = <U>(key in owner ? owner[key] : defaultValue);
			const changed = equalityComparer ? !equalityComparer(oldValue, value) : oldValue !== value;
			if (changed) {
				owner[key] = value;
				if (valueChanged) {
					valueChanged(owner, oldValue, value);
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

				if (affectsLayout) {
					owner.requestLayout();
				}

				if (owner.domNode) {
					owner.domNode.attributeModified(propertyName, value);
				}
			}
		};

		symbolPropertyMap[key] = this;
	}

	public register(cls: { prototype: T }): void {
		if (this.registered) {
			throw new Error(`Property ${this.name} already registered.`);
		}
		this.registered = true;
		Object.defineProperty(cls.prototype, this.name, this);
	}

	public isSet(instance: T): boolean {
		return this.key in instance;
	}
}
Property.prototype.isStyleProperty = false;

export class CoercibleProperty<T extends ViewBase, U> extends Property<T, U> implements CoercibleProperty<T, U> {
	public readonly coerce: (target: T) => void;

	constructor(options: CoerciblePropertyOptions<T, U>) {
		super(options);

		const propertyName = options.name;
		const key = this.key;
		const defaultValue: U = this.defaultValue;

		const coerceKey = Symbol(propertyName + ':coerceKey');

		const eventName = propertyName + 'Change';
		let affectsLayout: boolean = options.affectsLayout;
		let equalityComparer = options.equalityComparer;
		let valueChanged = options.valueChanged;
		let valueConverter = options.valueConverter;
		let coerceCallback = options.coerceValue;
		let overrideConverter = false;
		const property = this;

		this.overrideHandlers = function (options: CoerciblePropertyOptions<T, U>) {
			if (typeof options.equalityComparer !== 'undefined') {
				equalityComparer = options.equalityComparer;
			}
			if (typeof options.affectsLayout !== 'undefined') {
				affectsLayout = options.affectsLayout;
			}
			if (typeof options.valueChanged !== 'undefined') {
				valueChanged = options.valueChanged;
			}
			if (typeof options.valueConverter !== 'undefined') {
				valueConverter = options.valueConverter;
				overrideConverter = true;
			}
			if (typeof options.coerceValue !== 'undefined') {
				coerceCallback = options.coerceValue;
			}
		};

		this.coerce = function (target: T): void {
			const originalValue = <U>(coerceKey in target ? target[coerceKey] : defaultValue);
			// need that to make coercing but also fire change events
			target[propertyName] = originalValue;
		};

		this.set = function (this: T, boxedValue: U): void {
			const reset = isResetValue(boxedValue);
			let value: U;
			let wrapped: boolean;
			if (reset) {
				value = defaultValue;
				delete this[coerceKey];
			} else {
				wrapped = boxedValue && (<any>boxedValue).wrapped;
				value = wrapped ? WrappedValue.unwrap(boxedValue) : boxedValue;

				if (valueConverter && typeof value === 'string') {
					value = overrideConverter ? valueConverter.call(this, value) : valueConverter(value);
				}

				this[coerceKey] = value;
				value = coerceCallback(this, value);
			}

			const oldValue = key in this ? this[key] : defaultValue;
			const changed: boolean = equalityComparer ? !equalityComparer(oldValue, value) : oldValue !== value;

			if (wrapped || changed) {
				if (reset) {
					delete this[key];
				} else {
					this[key] = value;
				}

				if (valueChanged) {
					valueChanged(this, oldValue, value);
				}

				queueOrApplyNative(this, this, property, value, reset ? NativeWrite.Default : NativeWrite.Value, oldValue);

				if (this.hasListeners(eventName)) {
					this.notify<PropertyChangeData>({
						object: this,
						eventName,
						propertyName,
						value,
						oldValue,
					});
				}

				if (affectsLayout) {
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
}

export class InheritedProperty<T extends ViewBase, U> extends Property<T, U> implements InheritedProperty<T, U> {
	public readonly sourceKey: symbol;
	public readonly setInheritedValue: (value: U) => void;

	constructor(options: PropertyOptions<T, U>) {
		super(options);
		const name = options.name;
		const key = this.key;
		const defaultValue = options.defaultValue;

		const sourceKey = Symbol(name + ':valueSourceKey');
		this.sourceKey = sourceKey;

		const setBase = this.set;
		const setFunc = (valueSource: ValueSource) =>
			function (value: U): void {
				const that = <T>this;

				let unboxedValue: U;
				let newValueSource: number;

				if (isResetValue(value)) {
					const parent: ViewBase = that.parent;

					// If value is not initial or unset and view has a parent that has non-default value, use it as the reset value.
					if (value !== 'initial' && parent && parent[sourceKey] !== ValueSource.Default) {
						unboxedValue = parent[name];
						newValueSource = ValueSource.Inherited;
					} else {
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

export class CssProperty<T extends Style, U> {
	private registered: boolean;

	public readonly name: string;
	public readonly cssName: string;
	public readonly cssLocalName: string;

	protected readonly cssValueDescriptor: PropertyDescriptor;
	protected readonly localValueDescriptor: PropertyDescriptor;

	public isStyleProperty: boolean;

	public readonly key: symbol;
	public readonly getDefault: symbol;
	public readonly setNative: symbol;
	public readonly sourceKey: symbol;
	public readonly defaultValueKey: symbol;
	public readonly defaultValue: U;
	public readonly invalidates: readonly Invalidation[] | undefined;

	public overrideHandlers: (options: CssPropertyOptions<T, U>) => void;

	constructor(options: CssPropertyOptions<T, U>) {
		const propertyName = options.name;
		this.name = propertyName;

		// Guard against undefined cssName
		if (options.cssName) {
			cssPropertyNames.push(options.cssName);
		}

		this.cssName = `css:${options.cssName}`;
		this.cssLocalName = options.cssName;

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

		const defaultValue: U = options.defaultValue;
		this.defaultValue = defaultValue;
		this.invalidates = options.invalidates;

		const eventName = propertyName + 'Change';
		let affectsLayout: boolean = options.affectsLayout;
		let equalityComparer = options.equalityComparer;
		let valueChanged = options.valueChanged;
		let valueConverter = options.valueConverter;
		let overrideConverter = false;

		this.overrideHandlers = function (options: CssPropertyOptions<T, U>) {
			if (typeof options.equalityComparer !== 'undefined') {
				equalityComparer = options.equalityComparer;
			}
			if (typeof options.affectsLayout !== 'undefined') {
				affectsLayout = options.affectsLayout;
			}
			if (typeof options.valueChanged !== 'undefined') {
				valueChanged = options.valueChanged;
			}
			if (typeof options.valueConverter !== 'undefined') {
				valueConverter = options.valueConverter;
				overrideConverter = true;
			}
		};

		const property = this;

		function setLocalValue(this: T, newValue: U | string): void {
			const view = this.viewRef.get();
			if (!view) {
				Trace.write(`${newValue} not set to view because ".viewRef" is cleared`, Trace.categories.Style, Trace.messageType.warn);

				return;
			}

			this._localValueVersion++;

			const reset = isResetValue(newValue) || newValue === '';
			let value: U;

			if (reset) {
				value = defaultValue;
				delete this[sourceKey];
			} else {
				this[sourceKey] = ValueSource.Local;
				value = valueConverter && typeof newValue === 'string' ? (overrideConverter ? valueConverter.call(this, newValue) : valueConverter(newValue)) : <U>newValue;
			}

			const oldValue = <U>(key in this ? this[key] : defaultValue);
			const changed: boolean = equalityComparer ? !equalityComparer(oldValue, value) : oldValue !== value;

			if (changed) {
				if (reset) {
					delete this[key];
				} else {
					this[key] = value;
				}

				if (valueChanged) {
					valueChanged(this, oldValue, value);
				}

				queueOrApplyNative(view, this, property, value, reset ? NativeWrite.Default : NativeWrite.Value, oldValue);

				if (this.hasListeners(eventName)) {
					this.notify<PropertyChangeData>({
						object: this,
						eventName,
						propertyName,
						value,
						oldValue,
					});
				}

				if (affectsLayout) {
					view.requestLayout();
				}
			}
		}

		function setCssValue(this: T, newValue: U | string): void {
			const view = this.viewRef.get();
			if (!view) {
				Trace.write(`${newValue} not set to view because ".viewRef" is cleared`, Trace.categories.Style, Trace.messageType.warn);

				return;
			}

			const currentValueSource: number = this[sourceKey] || ValueSource.Default;

			// We have localValueSource - NOOP.
			if (currentValueSource === ValueSource.Local) {
				return;
			}

			const reset = isResetValue(newValue) || newValue === '';
			let value: U;

			if (reset) {
				value = defaultValue;
				delete this[sourceKey];
			} else {
				value = valueConverter && typeof newValue === 'string' ? (overrideConverter ? valueConverter.call(this, newValue) : valueConverter(newValue)) : <U>newValue;
				this[sourceKey] = ValueSource.Css;
			}

			const oldValue = <U>(key in this ? this[key] : defaultValue);
			const changed: boolean = equalityComparer ? !equalityComparer(oldValue, value) : oldValue !== value;

			if (changed) {
				if (reset) {
					delete this[key];
				} else {
					this[key] = value;
				}

				if (valueChanged) {
					valueChanged(this, oldValue, value);
				}

				queueOrApplyNative(view, this, property, value, reset ? NativeWrite.Default : NativeWrite.Value, oldValue);

				if (this.hasListeners(eventName)) {
					this.notify<PropertyChangeData>({
						object: this,
						eventName,
						propertyName,
						value,
						oldValue,
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
			set: setCssValue,
		};

		this.localValueDescriptor = {
			enumerable: true,
			configurable: true,
			get: get,
			set: setLocalValue,
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
		if (this.cssLocalName !== this.cssName) {
			Object.defineProperty(cls.prototype, this.cssLocalName, this.localValueDescriptor);
		}

		cssValueSourceKeys[this.cssLocalName] = this.sourceKey;
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

	public readonly getDefault: symbol;
	public readonly setNative: symbol;

	public readonly register: (cls: { prototype }) => void;

	public readonly keyframe: string;
	public readonly defaultValueKey: symbol;
	public readonly key: symbol;
	private readonly source: symbol;

	public readonly defaultValue: U;
	public readonly invalidates: readonly Invalidation[] | undefined;

	public isStyleProperty: boolean;

	private static properties: {
		[cssName: string]: CssAnimationProperty<any, any>;
	} = {};

	public _valueConverter?: (value: string) => any;

	constructor(options: CssAnimationPropertyOptions<T, U>) {
		const propertyName = options.name;
		this.name = propertyName;

		if (options.cssName) {
			cssPropertyNames.push(options.cssName);
		}

		CssAnimationProperty.properties[propertyName] = this;
		if (options.cssName && options.cssName !== propertyName) {
			CssAnimationProperty.properties[options.cssName] = this;
		}

		this._valueConverter = options.valueConverter;

		const cssLocalName = options.cssName || propertyName;
		this.cssLocalName = cssLocalName;
		const cssName = 'css:' + cssLocalName;
		this.cssName = cssName;

		const keyframeName = 'keyframe:' + propertyName;
		this.keyframe = keyframeName;
		const defaultName = 'default:' + propertyName;

		const defaultValueKey = Symbol(defaultName);
		this.defaultValueKey = defaultValueKey;

		this.defaultValue = options.defaultValue;
		this.invalidates = options.invalidates;

		const cssValue = Symbol(cssName);
		const styleValue = Symbol(`local:${propertyName}`);
		const keyframeValue = Symbol(keyframeName);
		const computedValue = Symbol('computed-value:' + propertyName);
		this.key = computedValue;
		const computedSource = Symbol('computed-source:' + propertyName);
		this.source = computedSource;

		this.getDefault = Symbol(propertyName + ':getDefault');
		this.setNative = Symbol(propertyName + ':setNative');
		const eventName = propertyName + 'Change';

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
					const reset = isResetValue(boxedValue) || boxedValue === '';

					if (reset) {
						this[symbol] = boxedValue;
						if (this[computedSource] === propertySource) {
							// Fallback to lower value source.
							if (!isResetValue(this[styleValue])) {
								this[computedSource] = ValueSource.Local;
								this[computedValue] = this[styleValue];
							} else if (!isResetValue(this[cssValue])) {
								this[computedSource] = ValueSource.Css;
								this[computedValue] = this[cssValue];
							} else {
								delete this[computedSource];
								delete this[computedValue];
							}
						}
					} else {
						if (options.valueConverter && typeof boxedValue === 'string') {
							boxedValue = options.valueConverter.call(this, boxedValue);
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

					const computedValueChanged = oldValue !== value && (!options.equalityComparer || !options.equalityComparer(oldValue, value));

					if (computedValueChanged && options.valueChanged) {
						options.valueChanged(this, oldValue, value);
					}

					if (computedValueChanged || isSet !== wasSet) {
						queueOrApplyNative(view, this, property, value, isSet ? (wasSet ? NativeWrite.ValueNoCapture : NativeWrite.Value) : wasSet ? NativeWrite.DefaultNoRelease : NativeWrite.None, oldValue);
					}

					if (computedValueChanged && this.hasListeners(eventName)) {
						this.notify<PropertyChangeData>({
							object: this,
							eventName,
							propertyName,
							value,
							oldValue,
						});
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
			cls.prototype[computedValue] = options.defaultValue;
			cls.prototype[computedSource] = ValueSource.Default;

			cls.prototype[cssValue] = unsetValue;
			cls.prototype[styleValue] = unsetValue;
			cls.prototype[keyframeValue] = unsetValue;

			Object.defineProperty(cls.prototype, defaultName, defaultPropertyDescriptor);
			Object.defineProperty(cls.prototype, cssName, cssPropertyDescriptor);
			Object.defineProperty(cls.prototype, propertyName, stylePropertyDescriptor);
			if (options.cssName && options.cssName !== options.name) {
				Object.defineProperty(cls.prototype, options.cssName, stylePropertyDescriptor);
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

export class InheritedCssProperty<T extends Style, U> extends CssProperty<T, U> implements InheritedCssProperty<T, U> {
	public setInheritedValue: (value: U) => void;

	constructor(options: CssPropertyOptions<T, U>) {
		super(options);
		const propertyName = options.name;

		const key = this.key;
		const sourceKey = this.sourceKey;
		const eventName = propertyName + 'Change';
		const defaultValue: U = options.defaultValue;

		let affectsLayout: boolean = options.affectsLayout;
		let equalityComparer = options.equalityComparer;
		let valueChanged = options.valueChanged;
		let valueConverter = options.valueConverter;
		let overrideConverter = false;

		const property = this;

		this.overrideHandlers = function (options: CssPropertyOptions<T, U>) {
			if (typeof options.equalityComparer !== 'undefined') {
				equalityComparer = options.equalityComparer;
			}
			if (typeof options.affectsLayout !== 'undefined') {
				affectsLayout = options.affectsLayout;
			}
			if (typeof options.valueChanged !== 'undefined') {
				valueChanged = options.valueChanged;
			}
			if (typeof options.valueConverter !== 'undefined') {
				valueConverter = options.valueConverter;
				overrideConverter = true;
			}
		};

		const setFunc = (valueSource: ValueSource) => {
			const isLocalWrite = valueSource === ValueSource.Local;

			return function (this: T, boxedValue: any): void {
				const view = this.viewRef.get();
				if (!view) {
					Trace.write(`${boxedValue} not set to view's property because ".viewRef" is cleared`, Trace.categories.Style, Trace.messageType.warn);
					return;
				}

				if (isLocalWrite) {
					this._localValueVersion++;
				}

				const reset = isResetValue(boxedValue) || boxedValue === '';
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

				const oldValue: U = key in this ? this[key] : defaultValue;
				let value: U;
				let unsetNativeValue = false;

				if (reset) {
					const parentStyle = view.parent ? view.parent.style : null;

					// If value is not initial or unset and view has a parent that has non-default value, use it as the reset value.
					if (boxedValue !== 'initial' && parentStyle && parentStyle[sourceKey] > ValueSource.Default) {
						value = parentStyle[propertyName];
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
					if (valueConverter && typeof boxedValue === 'string') {
						value = overrideConverter ? valueConverter.call(this, boxedValue) : valueConverter(boxedValue);
					} else {
						value = boxedValue;
					}
					this[key] = value;
				}

				const changed: boolean = equalityComparer ? !equalityComparer(oldValue, value) : oldValue !== value;

				if (changed) {
					if (valueChanged) {
						valueChanged(this, oldValue, value);
					}

					queueOrApplyNative(view, this, property, value, unsetNativeValue ? NativeWrite.Default : NativeWrite.Value, oldValue);

					if (this.hasListeners(eventName)) {
						this.notify<PropertyChangeData>({
							object: this,
							eventName,
							propertyName,
							value,
							oldValue,
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
								setInheritedFunc.call(childStyle, value);
							}
						}

						return true;
					});
				}
			};
		};

		const setDefaultFunc = setFunc(ValueSource.Default);
		const setInheritedFunc = setFunc(ValueSource.Inherited);

		this.setInheritedValue = setInheritedFunc;
		this.cssValueDescriptor.set = setFunc(ValueSource.Css);
		this.localValueDescriptor.set = setFunc(ValueSource.Local);

		inheritableCssProperties.push(this);
	}
}

export class ShorthandProperty<T extends Style, P> implements ShorthandProperty<T, P> {
	private registered: boolean;

	public readonly key: symbol;
	public readonly name: string;
	public readonly cssName: string;
	public readonly cssLocalName: string;

	protected readonly cssValueDescriptor: PropertyDescriptor;
	protected readonly localValueDescriptor: PropertyDescriptor;

	public readonly sourceKey: symbol;

	constructor(options: ShorthandPropertyOptions<P>) {
		this.name = options.name;

		const key = Symbol(this.name + ':propertyKey');
		this.key = key;

		this.cssName = `css:${options.cssName}`;
		this.cssLocalName = `${options.cssName}`;
		cssShorthandConverters.set(options.cssName, options.converter as (value: string) => [any, any][]);

		const converter = options.converter;

		function setLocalValue(this: T, value: string | P): void {
			const view = this.viewRef.get();
			if (!view) {
				Trace.write(`setLocalValue not executed to view because ".viewRef" is cleared`, Trace.categories.Animation, Trace.messageType.warn);

				return;
			}

			view._batchUpdate(() => {
				for (const [p, v] of converter(value)) {
					this[p.name] = v;
				}
			});
		}

		function setCssValue(this: T, value: string): void {
			const view = this.viewRef.get();
			if (!view) {
				Trace.write(`setCssValue not executed to view because ".viewRef" is cleared`, Trace.categories.Animation, Trace.messageType.warn);

				return;
			}

			view._batchUpdate(() => {
				for (const [p, v] of converter(value)) {
					this[p.cssName] = v;
				}
			});
		}

		this.cssValueDescriptor = {
			enumerable: true,
			configurable: true,
			get: options.getter,
			set: setCssValue,
		};

		this.localValueDescriptor = {
			enumerable: true,
			configurable: true,
			get: options.getter,
			set: setLocalValue,
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

		// Nothing is defined on `PropertyBag`: shorthands are expanded while parsing,
		// and the var()/calc() ones that do reach the bag must stay unconverted.
	}
}

export { makeValidator, makeParser } from '../../../core-types/validators';

function inheritablePropertyValuesOn(view: ViewBase): Array<{ property: InheritedProperty<any, any>; value: any }> {
	const array = new Array<{
		property: InheritedProperty<any, any>;
		value: any;
	}>();
	for (const prop of inheritableProperties) {
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

function inheritableCssPropertyValuesOn(style: Style): Array<{ property: InheritedCssProperty<any, any>; value: any }> {
	const array = new Array<{
		property: InheritedCssProperty<any, any>;
		value: any;
	}>();
	for (const prop of inheritableCssProperties) {
		const sourceKey = prop.sourceKey;
		const valueSource: number = style[sourceKey] || ValueSource.Default;
		if (valueSource !== ValueSource.Default) {
			// use prop.name as it will return value or default value.
			// prop.key will return undefined if property is set the same value as default one.
			array.push({ property: prop, value: style[prop.name] });
		}
	}

	return array;
}

type PropertyInterface = Property<ViewBase, any> | CssProperty<Style, any> | CssAnimationProperty<Style, any>;

/** What a commit has to apply, in the order `ViewBase.commitNativeUpdates` will apply it. */
function collectNativeUpdateEntries(view: ViewBase, isMount: boolean): NativeUpdateEntry[] {
	const entries: NativeUpdateEntry[] = [];

	if (isMount) {
		let symbols = Object.getOwnPropertySymbols(view);
		for (const symbol of symbols) {
			const property: Property<any, any> = symbolPropertyMap[symbol];
			if (property) {
				entries.push(property);
			}
		}

		symbols = Object.getOwnPropertySymbols(view.style);
		for (const symbol of symbols) {
			const property: CssProperty<any, any> = cssSymbolPropertyMap[symbol];
			if (property) {
				entries.push(property);
			}
		}
	} else {
		const suspendedUpdates = view._suspendedUpdates;
		for (const propertyName in suspendedUpdates) {
			if (HAS_OWN.call(suspendedUpdates, propertyName)) {
				entries.push(<PropertyInterface>suspendedUpdates[propertyName]);
			}
		}
	}

	const invalidations = view._pendingInvalidations;
	if (invalidations) {
		for (const invalidation of invalidations) {
			entries.push(invalidation);
		}
	}

	return entries;
}

function applyNativeUpdate(batch: NativeUpdateBatch, entry: NativeUpdateEntry): void {
	const view = batch.node;

	if (entry instanceof Invalidation) {
		const handler = view[entry.apply];
		if (handler) {
			handler.call(view, batch);
		}

		return;
	}

	if (batch.isMount) {
		applyMountedNativeSetter(view, entry);
	} else {
		applyPendingNativeSetter(view, entry);
	}
}

/**
 * Builds the batch of everything dirty on the view and hands it to `commitNativeUpdates`.
 * @deprecated Override `ViewBase.commitNativeUpdates` to order a class's native writes, or call
 * `ViewBase.flushNativeUpdates` to push what is pending.
 */
export const initNativeView = profile('"properties".initNativeView', function initNativeView(view: ViewBase): void {
	const dirty = view._suspendedUpdates;
	const isMount = dirty === undefined;

	if (view._pendingInvalidations === undefined && view.commitNativeUpdates === defaultCommitNativeUpdates) {
		// Nothing on this node can reach a batch, so the sweep runs straight off the dirty set,
		// which is dropped first as on the batch path.
		view._suspendedUpdates = {};
		view._pendingPrevious = undefined;

		if (isMount) {
			applyAllNativeSetters(view);
		} else {
			applyDirtyNativeSetters(view, dirty);
		}

		return;
	}

	const batch = new NativeUpdateBatch(view, isMount, collectNativeUpdateEntries(view, isMount), view._pendingPrevious, applyNativeUpdate);

	// Dropped before the commit runs so that a write made from a handler queues against a fresh set.
	// Would it be faster to delete all members of the old object?
	view._suspendedUpdates = {};
	view._pendingPrevious = undefined;
	view._pendingInvalidations = undefined;

	view.commitNativeUpdates(batch);
});

/**
 * One entry of `applyPendingNativeSetters`: the value is re-read from its store, so a property
 * dirtied several times while suspended reaches native once, with the value it ended up at.
 */
function applyPendingNativeSetter(view: ViewBase, property: PropertyInterface): void {
	const setNative = property.setNative;
	if (!view[setNative]) {
		return;
	}

	const store = property.isStyleProperty ? view.style : view;
	if ((<any>property).isSet(store)) {
		captureNativeDefault(view, store, property);
		// TODO: Only if value is different from the value before the scope was created.
		view[setNative](store[property.name]);
	} else {
		view[setNative](store[property.defaultValueKey]);
	}
}

/** One entry of `applyAllNativeSetters`: every value the instance carries is dirty. */
function applyMountedNativeSetter(view: ViewBase, property: PropertyInterface): void {
	const setNative = property.setNative;

	if (property.isStyleProperty) {
		if (!view[setNative]) {
			return;
		}

		const style = view.style;
		captureNativeDefault(view, style, property);
		view[setNative](style[property.key]);
	} else {
		if (!(setNative in view)) {
			return;
		}

		captureNativeDefault(view, view, property);
		view[setNative](view[property.key]);
	}
}

/**
 * @deprecated Superseded by `ViewBase.commitNativeUpdates`, which applies the same dirty set
 * through a `NativeUpdateBatch` the class can reorder.
 */
function applyDirtyNativeSetters(view: ViewBase, dirty: ViewBase['_suspendedUpdates']): void {
	// TODO: Check what happens if a view was suspended and its value was reset, or set back to default!
	for (const propertyName in dirty) {
		if (!HAS_OWN.call(dirty, propertyName)) continue;
		applyPendingNativeSetter(view, <PropertyInterface>dirty[propertyName]);
	}
}

export function applyPendingNativeSetters(view: ViewBase): void {
	applyDirtyNativeSetters(view, view._suspendedUpdates);
}

/**
 * @deprecated Superseded by `ViewBase.commitNativeUpdates` with a batch whose `isMount` is set.
 */
export function applyAllNativeSetters(view: ViewBase): void {
	let symbols = Object.getOwnPropertySymbols(view);
	for (const symbol of symbols) {
		const property: Property<any, any> = symbolPropertyMap[symbol];
		if (property) {
			applyMountedNativeSetter(view, property);
		}
	}

	symbols = Object.getOwnPropertySymbols(view.style);
	for (const symbol of symbols) {
		const property: CssProperty<any, any> = cssSymbolPropertyMap[symbol];
		if (property) {
			applyMountedNativeSetter(view, property);
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

export function propagateInheritableProperties(view: ViewBase, child: ViewBase): void {
	const inheritablePropertyValues = inheritablePropertyValuesOn(view);
	for (const pair of inheritablePropertyValues) {
		const prop = pair.property;
		const sourceKey = prop.sourceKey;
		const currentValueSource: number = child[sourceKey] || ValueSource.Default;
		if (currentValueSource <= ValueSource.Inherited) {
			prop.setInheritedValue.call(child, pair.value);
		}
	}
}

export function propagateInheritableCssProperties(parentStyle: Style, childStyle: Style): void {
	const inheritableCssPropertyValues = inheritableCssPropertyValuesOn(parentStyle);
	for (const pair of inheritableCssPropertyValues) {
		const prop = pair.property;
		const sourceKey = prop.sourceKey;
		const currentValueSource: number = childStyle[sourceKey] || ValueSource.Default;
		if (currentValueSource <= ValueSource.Inherited) {
			prop.setInheritedValue.call(childStyle, pair.value, ValueSource.Inherited);
		}
	}
}

export function getSetProperties(view: ViewBase): [string, any][] {
	const result = [];

	const ownProps = Object.getOwnPropertyNames(view);
	for (let i = 0; i < ownProps.length; i++) {
		const prop = ownProps[i];
		result.push([prop, view[prop]]);
	}

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
		if (prop !== undefined && prop !== null) {
			result.push([prop, style[prop]]);
		}
	}

	// Add these to enable box model in chrome-devtools styles tab
	result.push(['top', 'auto']);
	result.push(['left', 'auto']);
	result.push(['bottom', 'auto']);
	result.push(['right', 'auto']);

	return result;
}
