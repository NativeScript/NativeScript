// Types
import { ViewBase } from '../view-base';
import { BindingOptions, ValueConverter } from './bindable-types';

// Requires
import { unsetValue } from '../properties';
import { Observable, PropertyChangeData } from '../../../data/observable';
import { fromString as gestureFromString } from '../../../ui/gestures/gestures-common';
import { addWeakEventListener, removeWeakEventListener } from '../weak-event-listener';
import { bindingConstants, parentsRegex } from '../../builder/binding-builder';
import { escapeRegexSymbols } from '../../../utils';
import { Trace } from '../../../trace';
import { parseExpression, convertExpressionToValue } from './bindable-expressions';
import * as types from '../../../utils/types';
import * as bindableResources from './bindable-resources';

const contextKey = 'context';
// this regex is used to get parameters inside [] for example:
// from $parents['ListView'] will return 'ListView'
// from $parents[1] will return 1
const paramsRegex = /\[\s*(['"])*(\w*)\1\s*\]/;
const bc = bindingConstants;
const emptyArray = [];
const propertiesCache = {};

function getProperties(property: string): Array<string> {
	if (!property) {
		return emptyArray;
	}

	let result: Array<string> = propertiesCache[property];
	if (result) {
		return result;
	}

	// first replace all '$parents[..]' with a safe string
	// second removes all ] since they are not important for property access and not needed
	// then split properties either on '.' or '['
	const parentsMatches = property.match(parentsRegex);
	result = property.replace(parentsRegex, 'parentsMatch').replace(/\]/g, '').split(/\.|\[/);

	let parentsMatchesCounter = 0;
	for (let i = 0, resultLength = result.length; i < resultLength; i++) {
		if (result[i] === 'parentsMatch') {
			result[i] = parentsMatches[parentsMatchesCounter++];
		}
	}
	propertiesCache[property] = result;

	return result;
}

/**
 * Normalizes "ontap" to "tap", and "ondoubletap" to "ondoubletap".
 *
 * Removes the leading "on" from an event gesture name, for example:
 * - "ontap" -> "tap"
 * - "ondoubletap" -> "doubletap"
 * - "onTap" -> "Tap"
 *
 * Be warned that, as event/gesture names in NativeScript are case-sensitive,
 * this may produce an invalid event/gesture name (i.e. "doubletap" would fail
 * to match the "doubleTap" gesture name), and so it is up to the consumer to
 * handle the output properly.
 */
export function getEventOrGestureName(name: string): string {
	return name.indexOf('on') === 0 ? name.slice(2) : name;
}

export function isGesture(eventOrGestureName: string): boolean {
	// Not sure whether this trimming and lowercasing is still needed in practice
	// (all Core tests pass without it), so worth revisiting in future. I think
	// this is used exclusively by the XML flavour, and my best guess is that
	// maybe it's to handle how getEventOrGestureName("onTap") might pass "Tap"
	// into this.
	const t = eventOrGestureName.trim().toLowerCase();

	// Would be nice to have a convenience function for getting all GestureState
	// names in `gestures-common.ts`, but when I tried introducing it, it created
	// a circular dependency that crashed the automated tests app.
	return t === 'tap' || t === 'doubletap' || t === 'pinch' || t === 'pan' || t === 'swipe' || t === 'rotation' || t === 'longpress' || t === 'touch';
}

// TODO: Make this instance function so that we dont need public static tapEvent = "tap"
// in controls. They will just override this one and provide their own event support.
export function isEventOrGesture(name: string, view: ViewBase): boolean {
	if (typeof name === 'string') {
		const eventOrGestureName = getEventOrGestureName(name);
		const evt = `${eventOrGestureName}Event`;

		return (view.constructor && evt in view.constructor) || isGesture(eventOrGestureName);
	}

	return false;
}

export class Binding {
	private source: WeakRef<Object>;
	// TODO: target should be hard reference!
	public target: WeakRef<ViewBase>;

	private sourceOptions: { instance: WeakRef<any>; property: string };
	private targetOptions: { instance: WeakRef<Object>; property: string };

	private sourceProperties: Array<string>;
	private propertyChangeListeners: Map<string, Observable> = new Map<string, Observable>();

	public updating: boolean;
	public sourceIsBindingContext: boolean;
	public options: BindingOptions;

	constructor(target: ViewBase, options: BindingOptions) {
		this.target = new WeakRef(target);
		this.options = options;
		this.sourceProperties = getProperties(options.sourceProperty);
		this.targetOptions = this.resolveOptions(target, getProperties(options.targetProperty));
		if (!this.targetOptions) {
			throw new Error(`Invalid property: ${options.targetProperty} for target: ${target}`);
		}

		if (options.twoWay) {
			const target = this.targetOptions.instance.get();
			if (target instanceof Observable) {
				target.on(`${this.targetOptions.property}Change`, this.onTargetPropertyChanged, this);
			}
		}
	}

	private onTargetPropertyChanged(data: PropertyChangeData): void {
		this.updateTwoWay(data.value);
	}

	public loadedHandlerVisualTreeBinding(args) {
		const target = args.object;
		target.off('loaded', this.loadedHandlerVisualTreeBinding, this);
		const context = target.bindingContext;
		if (context !== undefined && context !== null) {
			this.update(context);
		}
	}

	public clearSource(): void {
		this.propertyChangeListeners.forEach((observable, index, map) => {
			removeWeakEventListener(observable, Observable.propertyChangeEvent, this.onSourcePropertyChanged, this);
		});

		this.propertyChangeListeners.clear();

		// if (this.source) {
		// 	this.source.clear();
		// }

		if (this.sourceOptions) {
			this.sourceOptions.instance = undefined;
			this.sourceOptions = undefined;
		}
	}

	private sourceAsObject(source: any): any {
		/* tslint:disable */
		const objectType = typeof source;
		if (objectType === 'number') {
			source = new Number(source);
		} else if (objectType === 'boolean') {
			source = new Boolean(source);
		} else if (objectType === 'string') {
			source = new String(source);
		}

		/* tslint:enable */
		return source;
	}

	private bindingContextChanged(data: PropertyChangeData): void {
		const target = this.targetOptions.instance.get();
		if (!target) {
			this.unbind();

			return;
		}

		const value = data.value;
		if (value !== null && value !== undefined) {
			this.update(value);
		} else {
			// TODO: Is this correct?
			// What should happen when bindingContext is null/undefined?
			this.clearBinding();
		}

		// TODO: if oneWay - call target.unbind();
	}

	public bind(source: any): void {
		const target = this.targetOptions.instance.get();
		if (this.sourceIsBindingContext && target instanceof Observable && this.targetOptions.property !== 'bindingContext') {
			target.on('bindingContextChange', this.bindingContextChanged, this);
		}

		this.update(source);
	}

	private update(source: any): void {
		this.clearSource();

		source = this.sourceAsObject(source);

		if (!types.isNullOrUndefined(source)) {
			// TODO: if oneWay - call target.unbind();
			this.source = new WeakRef(source);
			this.sourceOptions = this.resolveOptions(source, this.sourceProperties);

			const sourceValue = this.getSourcePropertyValue();
			this.updateTarget(sourceValue);
			this.addPropertyChangeListeners(this.source, this.sourceProperties);
		} else if (!this.sourceIsBindingContext) {
			// TODO: if oneWay - call target.unbind();
			const sourceValue = this.getSourcePropertyValue();
			this.updateTarget(sourceValue ? sourceValue : source);
		}
	}

	public unbind() {
		const target = this.targetOptions.instance.get();
		if (target instanceof Observable) {
			if (this.options.twoWay) {
				target.off(`${this.targetOptions.property}Change`, this.onTargetPropertyChanged, this);
			}

			if (this.sourceIsBindingContext && this.targetOptions.property !== 'bindingContext') {
				target.off('bindingContextChange', this.bindingContextChanged, this);
			}
		}

		if (this.targetOptions) {
			this.targetOptions = undefined;
		}

		this.sourceProperties = undefined;
		if (!this.source) {
			return;
		}

		this.clearSource();
	}

	// Consider returning single {} instead of array for performance.
	private resolveObjectsAndProperties(source: Object, properties: Array<string>): Array<{ instance: Object; property: string }> {
		const result = [];
		let currentObject = source;
		let currentObjectChanged = false;
		for (let i = 0, propsArrayLength = properties.length; i < propsArrayLength; i++) {
			const property = properties[i];
			if (property === bc.bindingValueKey) {
				currentObjectChanged = true;
			}

			if (property === bc.parentValueKey || property.indexOf(bc.parentsValueKey) === 0) {
				const parentView = this.getParentView(this.target.get(), property).view;
				if (parentView) {
					currentObject = parentView.bindingContext;
				} else {
					const targetInstance = this.target.get();
					targetInstance.off('loaded', this.loadedHandlerVisualTreeBinding, this);
					targetInstance.on('loaded', this.loadedHandlerVisualTreeBinding, this);
				}

				currentObjectChanged = true;
			}

			if (currentObject) {
				result.push({ instance: currentObject, property: property });
			} else {
				break;
			}

			// do not need to dive into last object property getter on binding stage will handle it
			if (!currentObjectChanged && i < propsArrayLength - 1) {
				currentObject = currentObject ? currentObject[properties[i]] : null;
			}

			currentObjectChanged = false;
		}

		return result;
	}

	private addPropertyChangeListeners(source: WeakRef<Object>, sourceProperty: Array<string>, parentProperies?: string) {
		const objectsAndProperties = this.resolveObjectsAndProperties(source.get(), sourceProperty);
		let prop = parentProperies || '';

		for (let i = 0, length = objectsAndProperties.length; i < length; i++) {
			const propName = objectsAndProperties[i].property;
			prop += '$' + propName;
			const currentObject = objectsAndProperties[i].instance;
			if (!this.propertyChangeListeners.has(prop) && currentObject instanceof Observable && currentObject._isViewBase) {
				// Add listener for properties created with after 3.0 version
				addWeakEventListener(currentObject, `${propName}Change`, this.onSourcePropertyChanged, this);
				addWeakEventListener(currentObject, Observable.propertyChangeEvent, this.onSourcePropertyChanged, this);
				this.propertyChangeListeners.set(prop, currentObject);
			} else if (!this.propertyChangeListeners.has(prop) && currentObject instanceof Observable) {
				addWeakEventListener(currentObject, Observable.propertyChangeEvent, this.onSourcePropertyChanged, this);
				this.propertyChangeListeners.set(prop, currentObject);
			}
		}
	}

	private prepareExpressionForUpdate(): string {
		// this regex is used to create a valid RegExp object from a string that has some special regex symbols like [,(,$ and so on.
		// Basically this method replaces all matches of 'source property' in expression with '$newPropertyValue'.
		// For example: with an expression similar to:
		// text="{{ sourceProperty = $parents['ListView'].test, expression = $parents['ListView'].test + 2}}"
		// update expression will be '$newPropertyValue + 2'
		// then on expression execution the new value will be taken and target property will be updated with the value of the expression.
		const escapedSourceProperty = escapeRegexSymbols(this.options.sourceProperty);
		const expRegex = new RegExp(escapedSourceProperty, 'g');
		const resultExp = this.options.expression.replace(expRegex, bc.newPropertyValueKey);

		return resultExp;
	}

	private updateTwoWay(value: any) {
		if (this.updating || !this.options.twoWay) {
			return;
		}

		let newValue = value;
		if (__UI_USE_EXTERNAL_RENDERER__) {
		} else if (this.options.expression) {
			const changedModel = {};
			const targetInstance = this.target.get();
			let sourcePropertyName = '';
			if (this.sourceOptions) {
				sourcePropertyName = this.sourceOptions.property;
			} else if (typeof this.options.sourceProperty === 'string' && this.options.sourceProperty.indexOf('.') === -1) {
				sourcePropertyName = this.options.sourceProperty;
			}

			const updateExpression = this.prepareExpressionForUpdate();
			this.prepareContextForExpression(targetInstance, changedModel, updateExpression);

			/**
			 * Wait for 'prepareContextForExpression' to assign keys first and override any possible occurences.
			 * For example, 'bindingValueKey' key can result in a circular reference if it's set in both cases.
			 */
			changedModel[bc.bindingValueKey] = value;
			changedModel[bc.newPropertyValueKey] = value;
			if (sourcePropertyName !== '') {
				changedModel[sourcePropertyName] = value;
			}

			const expressionValue = this._getExpressionValue(updateExpression, true, changedModel);
			if (expressionValue instanceof Error) {
				Trace.write((<Error>expressionValue).message, Trace.categories.Binding, Trace.messageType.error);
			}

			newValue = expressionValue;
		}

		this.updateSource(newValue);
	}

	private _getExpressionValue(expression: string, isBackConvert: boolean, changedModel: any): any {
		let result: any = null;

		if (!__UI_USE_EXTERNAL_RENDERER__) {
			let context;
			const targetInstance = this.target.get();
			const addedProps = [];
			try {
				let exp;
				try {
					exp = parseExpression(expression);
				} catch (e) {
					result = new Error(e + ' at ' + targetInstance);
				}

				if (exp) {
					context = (this.source && this.source.get && this.source.get()) || global;
					const resources = bindableResources.get();
					for (const prop in resources) {
						if (resources.hasOwnProperty(prop) && !context.hasOwnProperty(prop)) {
							context[prop] = resources[prop];
							addedProps.push(prop);
						}
					}

					// For expressions, there are also cases when binding must be updated after component is loaded (e.g. ListView)
					if (this.prepareContextForExpression(targetInstance, context, expression, addedProps)) {
						result = convertExpressionToValue(exp, context, isBackConvert, changedModel ? changedModel : context);
					} else {
						targetInstance.off('loaded', this.loadedHandlerVisualTreeBinding, this);
						targetInstance.on('loaded', this.loadedHandlerVisualTreeBinding, this);
					}
				}
			} catch (e) {
				result = new Error(e + ' at ' + targetInstance);
			}

			// Clear added props
			for (const prop of addedProps) {
				delete context[prop];
			}
			addedProps.length = 0;
		}
		return result;
	}

	public onSourcePropertyChanged(data: PropertyChangeData) {
		const sourceProps = this.sourceProperties;
		const sourcePropsLength = sourceProps.length;
		let changedPropertyIndex = sourceProps.indexOf(data.propertyName);
		let parentProps = '';
		if (changedPropertyIndex > -1) {
			parentProps = '$' + sourceProps.slice(0, changedPropertyIndex + 1).join('$');
			while (this.propertyChangeListeners.get(parentProps) !== data.object) {
				changedPropertyIndex += sourceProps.slice(changedPropertyIndex + 1).indexOf(data.propertyName) + 1;
				parentProps = '$' + sourceProps.slice(0, changedPropertyIndex + 1).join('$');
			}
		}

		if (__UI_USE_EXTERNAL_RENDERER__ || !this.options.expression) {
			if (changedPropertyIndex > -1) {
				const props = sourceProps.slice(changedPropertyIndex + 1);
				const propsLength = props.length;
				if (propsLength > 0) {
					let value = data.value;
					for (let i = 0; i < propsLength; i++) {
						value = value[props[i]];
					}

					this.updateTarget(value);
				} else if (data.propertyName === this.sourceOptions.property) {
					this.updateTarget(data.value);
				}
			}
		} else {
			const expressionValue = this._getExpressionValue(this.options.expression, false, undefined);
			if (expressionValue instanceof Error) {
				Trace.write(expressionValue.message, Trace.categories.Binding, Trace.messageType.error);
			} else {
				this.updateTarget(expressionValue);
			}
		}

		// we need to do this only if nested objects are used as source and some middle object has changed.
		if (changedPropertyIndex > -1 && changedPropertyIndex < sourcePropsLength - 1) {
			const probablyChangedObject = this.propertyChangeListeners.get(parentProps);
			if (probablyChangedObject && probablyChangedObject !== data.object[sourceProps[changedPropertyIndex]]) {
				// remove all weakevent listeners after change, because changed object replaces object that is hooked for
				// propertyChange event
				for (let i = sourcePropsLength - 1; i > changedPropertyIndex; i--) {
					const prop = '$' + sourceProps.slice(0, i + 1).join('$');
					if (this.propertyChangeListeners.has(prop)) {
						removeWeakEventListener(this.propertyChangeListeners.get(prop), Observable.propertyChangeEvent, this.onSourcePropertyChanged, this);
						this.propertyChangeListeners.delete(prop);
					}
				}

				const newProps = sourceProps.slice(changedPropertyIndex + 1);
				// add new weak event listeners
				const newObject = data.object[sourceProps[changedPropertyIndex]];
				if (!types.isNullOrUndefined(newObject) && typeof newObject === 'object') {
					this.addPropertyChangeListeners(new WeakRef(newObject), newProps, parentProps);
				}
			}
		}
	}

	private prepareContextForExpression(target: any, model: Object, expression: string, addedProps = []) {
		let success = true;
		let parentViewAndIndex: { view: ViewBase; index: number };
		let parentView;
		let expressionCP = expression;
		if (expressionCP.indexOf(bc.bindingValueKey) > -1) {
			model[bc.bindingValueKey] = model;
			addedProps.push(bc.bindingValueKey);
		}

		const parentsArray = expressionCP.match(parentsRegex);
		if (parentsArray) {
			for (let i = 0; i < parentsArray.length; i++) {
				// This prevents later checks to mistake $parents[] for $parent
				expressionCP = expressionCP.replace(parentsArray[i], '');
				parentViewAndIndex = this.getParentView(target, parentsArray[i]);
				if (parentViewAndIndex.view) {
					model[bc.parentsValueKey] = model[bc.parentsValueKey] || {};
					model[bc.parentsValueKey][parentViewAndIndex.index] = parentViewAndIndex.view.bindingContext;
					addedProps.push(bc.parentsValueKey);
				} else {
					success = false;
				}
			}
		}

		if (expressionCP.indexOf(bc.parentValueKey) > -1) {
			parentView = this.getParentView(target, bc.parentValueKey).view;
			if (parentView) {
				model[bc.parentValueKey] = parentView.bindingContext;
				addedProps.push(bc.parentValueKey);
			} else {
				success = false;
			}
		}
		return success;
	}

	private getSourcePropertyValue() {
		if (__UI_USE_EXTERNAL_RENDERER__) {
		} else if (this.options.expression) {
			const changedModel = {};
			changedModel[bc.bindingValueKey] = this.source ? this.source.get() : undefined;
			const expressionValue = this._getExpressionValue(this.options.expression, false, changedModel);
			if (expressionValue instanceof Error) {
				Trace.write((<Error>expressionValue).message, Trace.categories.Binding, Trace.messageType.error);
			} else {
				return expressionValue;
			}
		}

		if (this.sourceOptions) {
			const sourceOptionsInstance = this.sourceOptions.instance.get();
			if (this.sourceOptions.property === bc.bindingValueKey) {
				return sourceOptionsInstance;
			} else if (sourceOptionsInstance instanceof Observable && this.sourceOptions.property && this.sourceOptions.property !== '') {
				return sourceOptionsInstance.get(this.sourceOptions.property);
			} else if (sourceOptionsInstance && this.sourceOptions.property && this.sourceOptions.property !== '' && this.sourceOptions.property in sourceOptionsInstance) {
				return sourceOptionsInstance[this.sourceOptions.property];
			} else {
				Trace.write("Property: '" + this.sourceOptions.property + "' is invalid or does not exist. SourceProperty: '" + this.options.sourceProperty + "'", Trace.categories.Binding, Trace.messageType.error);
			}
		}

		return null;
	}

	public clearBinding() {
		this.clearSource();
		this.updateTarget(unsetValue);
	}

	private updateTarget(value: any) {
		if (this.updating) {
			return;
		}

		this.updateOptions(this.targetOptions, types.isNullOrUndefined(value) ? unsetValue : value);
	}

	private updateSource(value: any) {
		if (this.updating || !this.source || !this.source.get()) {
			return;
		}

		this.updateOptions(this.sourceOptions, value);
	}

	private getParentView(target: any, property: string): { view: ViewBase; index: number } {
		if (!target) {
			return { view: null, index: null };
		}

		let result: ViewBase;
		if (property === bc.parentValueKey) {
			result = target.parent;
		}

		let index = null;
		if (property.indexOf(bc.parentsValueKey) === 0) {
			result = target.parent;
			const indexParams = paramsRegex.exec(property);
			if (indexParams && indexParams.length > 1) {
				index = indexParams[2];
			}

			if (!isNaN(index)) {
				let indexAsInt = parseInt(index);
				while (indexAsInt > 0) {
					result = result.parent;
					indexAsInt--;
				}
			} else if (types.isString(index)) {
				while (result && result.typeName !== index) {
					result = result.parent;
				}
			}
		}

		return { view: result, index: index };
	}

	private resolveOptions(obj: Object, properties: Array<string>): { instance: WeakRef<Object>; property: any } {
		const objectsAndProperties = this.resolveObjectsAndProperties(obj, properties);
		if (objectsAndProperties.length > 0) {
			const resolvedObj = objectsAndProperties[objectsAndProperties.length - 1].instance;
			const prop = objectsAndProperties[objectsAndProperties.length - 1].property;

			return {
				instance: new WeakRef(this.sourceAsObject(resolvedObj)),
				property: prop,
			};
		}

		return null;
	}

	private updateOptions(options: { instance: WeakRef<any>; property: string }, value: any) {
		let optionsInstance;
		if (options && options.instance) {
			optionsInstance = options.instance.get();
		}

		if (!optionsInstance) {
			return;
		}

		this.updating = true;

		try {
			if (isEventOrGesture(options.property, <any>optionsInstance) && types.isFunction(value)) {
				// Calling Observable.prototype.off() with just the event name will
				// remove all handlers under that event name.
				optionsInstance.off(options.property);
				optionsInstance.on(options.property, value, optionsInstance.bindingContext);
			} else if (optionsInstance instanceof Observable) {
				optionsInstance.set(options.property, value);
			} else {
				optionsInstance[options.property] = value;
			}
		} catch (ex) {
			Trace.write('Binding error while setting property ' + options.property + ' of ' + optionsInstance + ': ' + ex, Trace.categories.Binding, Trace.messageType.error);
		}

		this.updating = false;
	}
}
