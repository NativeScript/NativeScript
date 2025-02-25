import { AlignSelf, Flex, FlexFlow, FlexGrow, FlexShrink, FlexWrapBefore, Order } from '../../layouts/flexbox-layout';
import { Page } from '../../page';
import { CoreTypes } from '../../../core-types';
import { Property, CssProperty, CssAnimationProperty, InheritedProperty, clearInheritedProperties, propagateInheritableProperties, propagateInheritableCssProperties, initNativeView } from '../properties';
import { CSSUtils } from '../../../css/system-classes';
import { Source } from '../../../utils/debug';
import { Binding, BindingOptions } from '../bindable';
import { Trace } from '../../../trace';
import { Observable, PropertyChangeData, WrappedValue } from '../../../data/observable';
import { Style } from '../../styling/style';
import { paddingTopProperty, paddingRightProperty, paddingBottomProperty, paddingLeftProperty } from '../../styling/style-properties';
import type { ModalTransition } from '../../transition/modal-transition';

// TODO: Remove this import!
import { getClass } from '../../../utils/types';

import { profile } from '../../../profiling';

import * as dnm from '../../../debugger/dom-node';
import * as ssm from '../../styling/style-scope';
import { ViewBase as ViewBaseDefinition } from '.';

let domNodeModule: typeof dnm;

function ensuredomNodeModule(): void {
	if (!domNodeModule) {
		domNodeModule = require('../../../debugger/dom-node');
	}
}

let styleScopeModule: typeof ssm;
function ensureStyleScopeModule() {
	if (!styleScopeModule) {
		styleScopeModule = require('../../styling/style-scope');
	}
}

const defaultBindingSource = {};

export interface ModalTransitionType {
	name?: string;
	instance?: ModalTransition;
	duration?: number;
	curve?: any;
}

export interface ShowModalOptions {
	/**
	 * Any context you want to pass to the modally shown view. This same context will be available in the arguments of the shownModally event handler.
	 */
	context: any;

	/**
	 * A function that will be called when the view is closed. Any arguments provided when calling ShownModallyData.closeCallback will be available here.
	 */
	closeCallback: (...args) => void;

	/**
	 * An optional parameter specifying whether to show the modal view in full-screen mode.
	 */
	fullscreen?: boolean;

	/**
	 * An optional parameter specifying whether to show the modal view with animation.
	 */
	animated?: boolean;

	/**
	 * An optional parameter specifying whether to stretch the modal view when not in full-screen mode.
	 */
	stretched?: boolean;

	/**
	 * An optional custom transition effect
	 */
	transition?: ModalTransitionType;

	/**
	 * An optional parameter that specify options specific to iOS as an object.
	 */
	ios?: {
		/**
		 * The UIModalPresentationStyle to be used when showing the dialog in iOS .
		 */
		presentationStyle?: any /* UIModalPresentationStyle */;
		/**
		 * width of the popup dialog
		 */
		width?: number;
		/**
		 * height of the popup dialog
		 */
		height?: number;
	};
	android?: {
		/**
		 * @deprecated Use ShowModalOptions.cancelable instead.
		 * An optional parameter specifying whether the modal view can be dismissed when not in full-screen mode.
		 */
		cancelable?: boolean;

		/**
		 * An optional parameter specifying the windowSoftInputMode of the dialog window.
		 * For possible values see https://developer.android.com/reference/android/view/WindowManager.LayoutParams#softInputMode
		 */
		windowSoftInputMode?: number;
	};
	/**
	 * An optional parameter specifying whether the modal view can be dismissed when not in full-screen mode.
	 */
	cancelable?: boolean;
}

/**
 * Gets an ancestor from a given type.
 * @param view - Starting view (child view).
 * @param criterion - The type of ancestor view we are looking for. Could be a string containing a class name or an actual type.
 * Returns an instance of a view (if found), otherwise undefined.
 */
export function getAncestor(view: ViewBaseDefinition, criterion: string | { new () }): ViewBaseDefinition {
	let matcher: (view: ViewBaseDefinition) => boolean = null;
	if (typeof criterion === 'string') {
		matcher = (view: ViewBaseDefinition) => view.typeName === criterion;
	} else {
		matcher = (view: ViewBaseDefinition) => view instanceof criterion;
	}

	for (let parent = view.parent; parent != null; parent = parent.parent) {
		if (matcher(parent)) {
			return parent;
		}
	}

	return null;
}

/**
 * Gets a child view by id.
 * @param view - The parent (container) view of the view to look for.
 * @param id - The id of the view to look for.
 * Returns an instance of a view (if found), otherwise undefined.
 */
export function getViewById(view: ViewBaseDefinition, id: string): ViewBaseDefinition {
	if (!view) {
		return undefined;
	}

	if (view.id === id) {
		return view;
	}

	let retVal: ViewBaseDefinition;
	const descendantsCallback = function (child: ViewBaseDefinition): boolean {
		if (child.id === id) {
			retVal = child;

			// break the iteration by returning false
			return false;
		}

		return true;
	};

	eachDescendant(view, descendantsCallback);

	return retVal;
}

/**
 * Gets a child view by domId.
 * @param view - The parent (container) view of the view to look for.
 * @param domId - The id of the view to look for.
 * Returns an instance of a view (if found), otherwise undefined.
 */
export function getViewByDomId(view: ViewBaseDefinition, domId: number): ViewBaseDefinition {
	if (!view) {
		return undefined;
	}

	if (view._domId === domId) {
		return view;
	}

	let retVal: ViewBaseDefinition;
	const descendantsCallback = function (child: ViewBaseDefinition): boolean {
		if (view._domId === domId) {
			retVal = child;

			// break the iteration by returning false
			return false;
		}

		return true;
	};

	eachDescendant(view, descendantsCallback);

	return retVal;
}

// TODO: allow all selector types (just using attributes now)
/**
 * Gets a child view by selector.
 * @param view - The parent (container) view of the view to look for.
 * @param selector - The selector of the view to look for.
 * Returns an instance of a view (if found), otherwise undefined.
 */
export function querySelectorAll(view: ViewBaseDefinition, selector: string): Array<ViewBaseDefinition> {
	if (!view) {
		return [];
	}

	const retVal: Array<ViewBaseDefinition> = [];
	if (view[selector]) {
		retVal.push(view);
	}

	const descendantsCallback = function (child: ViewBaseDefinition): boolean {
		if (child[selector]) {
			retVal.push(child);
		}

		return true;
	};

	eachDescendant(view, descendantsCallback);

	return retVal;
}

/**
 * Iterates through all child views (via visual tree) and executes a function.
 * @param view - Starting view (parent container).
 * @param callback - A function to execute on every child. If function returns false it breaks the iteration.
 */
export function eachDescendant(view: ViewBaseDefinition, callback: (child: ViewBaseDefinition) => boolean) {
	if (!callback || !view) {
		return;
	}

	let continueIteration: boolean;
	const localCallback = function (child: ViewBaseDefinition): boolean {
		continueIteration = callback(child);
		if (continueIteration) {
			child.eachChild(localCallback);
		}

		return continueIteration;
	};

	view.eachChild(localCallback);
}

let viewIdCounter = 1;

// const contextMap = new WeakMap<Object, Map<string, WeakRef<Object>[]>>();

// function getNativeView(context: Object, typeName: string): Object {
//     let typeMap = contextMap.get(context);
//     if (!typeMap) {
//         typeMap = new Map<string, WeakRef<Object>[]>();
//         contextMap.set(context, typeMap);
//         return undefined;
//     }

//     const array = typeMap.get(typeName);
//     if (array) {
//         let nativeView;
//         while (array.length > 0) {
//             const weakRef = array.pop();
//             nativeView = weakRef.get();
//             if (nativeView) {
//                 return nativeView;
//             }
//         }
//     }
//     return undefined;
// }

// function putNativeView(context: Object, view: ViewBase): void {
//     const typeMap = contextMap.get(context);
//     const typeName = view.typeName;
//     let list = typeMap.get(typeName);
//     if (!list) {
//         list = [];
//         typeMap.set(typeName, list);
//     }
//     list.push(new WeakRef(view.nativeViewProtected));
// }

enum Flags {
	superOnLoadedCalled = 'Loaded',
	superOnUnloadedCalled = 'Unloaded',
}

enum SuspendType {
	Incremental = 0,
	Loaded = 1 << 20,
	NativeView = 1 << 21,
	UISetup = 1 << 22,
	IncrementalCountMask = ~((1 << 20) + (1 << 21) + (1 << 22)),
}

namespace SuspendType {
	export function toString(type: SuspendType): string {
		return (type ? 'suspended' : 'resumed') + '(' + 'Incremental: ' + (type & SuspendType.IncrementalCountMask) + ', ' + 'Loaded: ' + !(type & SuspendType.Loaded) + ', ' + 'NativeView: ' + !(type & SuspendType.NativeView) + ', ' + 'UISetup: ' + !(type & SuspendType.UISetup) + ')';
	}
}

const DEFAULT_VIEW_PADDINGS: Map<string, any> = new Map();

/**
 *
 * @nsView ViewBase
 */
export abstract class ViewBase extends Observable implements ViewBaseDefinition {
	/**
	 * String value used when hooking to loaded event.
	 *
	 * @nsEvent loaded
	 */
	public static loadedEvent = 'loaded';
	/**
	 * String value used when hooking to unloaded event.
	 *
	 * @nsEvent unloaded
	 */
	public static unloadedEvent = 'unloaded';
	/**
	 * String value used when hooking to creation event
	 *
	 * @nsEvent created
	 */
	public static createdEvent = 'created';
	/**
	 * String value used when hooking to disposeNativeView event
	 *
	 * @nsEvent disposeNativeView
	 */
	public static disposeNativeViewEvent = 'disposeNativeView';

	private _onLoadedCalled = false;
	private _onUnloadedCalled = false;
	private _iosView: Object;
	private _androidView: Object;
	private _style: Style;
	private _isLoaded: boolean;

	/**
	 * @deprecated
	 */
	private _visualState: string;

	private _templateParent: ViewBase;
	private __nativeView: any;
	// private _disableNativeViewRecycling: boolean;

	public domNode: dnm.DOMNode;

	public recycleNativeView: 'always' | 'never' | 'auto';
	/**
	 * returns the native UIViewController.
	 */
	public viewController: any;
	/**
	 * @nsProperty
	 */
	public bindingContext: any;
	/**
	 * read-only. If you want to set out-of-band the nativeView use the setNativeView method.
	 */
	public nativeViewProtected: any;
	/**
	 * Gets the parent view. This property is read-only.
	 */
	public parent: ViewBase;
	/**
	 * Returns true if visibility is set to 'collapse'.
	 * Default(false) set in prototype
	 * Readonly property
	 */
	public isCollapsed;

	/**
	 * Gets or sets the id for this view.
	 *
	 * @nsProperty
	 */
	public id: string;
	/**
	 * Gets or sets the CSS class name for this view.
	 *
	 * @nsProperty
	 */
	public className: string;

	/**
	 * Gets or sets the visual state of the view.
	 * @nsProperty
	 */
	public hidden: boolean;
	/**
	 * Gets or sets the shared transition tag for animated view transitions
	 *
	 * @nsProperty
	 */
	public sharedTransitionTag: string;
	/**
	 * Opt out of shared transition under different binding conditions
	 *
	 * @nsProperty
	 */
	public sharedTransitionIgnore: boolean;

	/**
	 * Default visual state, defaults to 'normal'
	 *
	 * @nsProperty
	 */
	public defaultVisualState: string = 'normal';

	public _domId: number;
	public _context: any /* android.content.Context */;
	public _isAddedToNativeVisualTree: boolean;
	/* "ui/styling/style-scope" */ public _cssState: ssm.CssState = new ssm.CssState(new WeakRef(this));
	public _styleScope: ssm.StyleScope;
	/**
	 * A property bag holding suspended native updates.
	 * Native setters that had to execute while there was no native view,
	 * or the view was detached from the visual tree etc. will accumulate in this object,
	 * and will be applied when all prerequisites are met.
	 * @private
	 */
	public _suspendedUpdates: {
		[propertyName: string]: Property<ViewBase, any> | CssProperty<Style, any> | CssAnimationProperty<Style, any>;
	};
	//@endprivate
	/**
	 * Determines the depth of suspended updates.
	 * When the value is 0 the current property updates are not batched nor scoped and must be immediately applied.
	 * If the value is 1 or greater, the current updates are batched and does not have to provide immediate update.
	 * Do not set this field, the _batchUpdate method is responsible to keep the count up to date,
	 * as well as adding/rmoving the view to/from the visual tree.
	 */
	public _suspendNativeUpdatesCount: number;
	public _isStyleScopeHost: boolean;
	public _automaticallyAdjustsScrollViewInsets: boolean;

	// Dynamic properties.
	/**
	 * Gets or sets the distance, in pixels, between the left edge of the child and the left edge of its parent.
	 * @nsProperty
	 */
	left: CoreTypes.LengthType;
	/**
	 * Gets or sets the distance, in pixels, between the top edge of the child and the top edge of its parent.
	 * @nsProperty
	 */
	top: CoreTypes.LengthType;
	effectiveLeft: number;
	effectiveTop: number;
	/**
	 * Dock position of the view within its parent.
	 * @nsProperty
	 */
	dock: 'left' | 'top' | 'right' | 'bottom';
	/**
	 * The row for the element. The rows are 0-indexed, so the first row is indicated by 0.
	 *
	 * @nsProperty
	 */
	row: number;
	/**
	 * The column for the element. The columns are 0-indexed, so the first column is indicated by 0.
	 * @nsProperty
	 */
	col: number;
	/**
	 * The column for the element. The columns are 0-indexed, so the first column is indicated by 0.
	 * @nsProperty
	 */
	column: number; // synonym for "col"
	/**
	 * The number of rows for the element to span across.
	 * @nsProperty
	 */
	rowSpan: number;
	/**
	 * The number of columns for the element to span across.
	 * @nsProperty
	 */
	colSpan: number;
	/**
	 * @nsProperty
	 */
	columnSpan: number; // synonym for "columnSpan"
	/**
	 * Sets the order in which child elements inside a Flex appear in relation to one another.
	 * @nsProperty
	 */
	order: Order;
	/**
	 * Indicates that the child should grow in size, if necessary. Sets how much the child will grow in proportion to the rest of the child elements in the flex container.
	 * @nsProperty
	 */
	flexGrow: FlexGrow;
	/**
	 * Indicates that the child should shrink when the row runs out of space. Sets how much the flex item will shrink in proportion to the rest of the child elements in the flex container. When not specified, its value is set to 1.
	 * @nsProperty
	 */
	flexShrink: FlexShrink;
	/**
	 * When true, forces the item to wrap onto a new line.
	 * @nsProperty
	 */
	flexWrapBefore: FlexWrapBefore;
	/**
	 * (Android-only) Overrides the alignItems value for the child.
	 * @nsProperty
	 */
	alignSelf: AlignSelf;

	_oldLeft: number;
	_oldTop: number;
	_oldRight: number;
	_oldBottom: number;
	_ignoreFlexMinWidthHeightReset: boolean;

	public effectiveMinWidth: number;
	public effectiveMinHeight: number;
	public effectiveWidth: number;
	public effectiveHeight: number;
	public effectiveMarginTop: number;
	public effectiveMarginRight: number;
	public effectiveMarginBottom: number;
	public effectiveMarginLeft: number;
	public effectivePaddingTop: number;
	public effectivePaddingRight: number;
	public effectivePaddingBottom: number;
	public effectivePaddingLeft: number;
	public effectiveBorderTopWidth: number;
	public effectiveBorderRightWidth: number;
	public effectiveBorderBottomWidth: number;
	public effectiveBorderLeftWidth: number;

	public _defaultPaddingTop: number;
	public _defaultPaddingRight: number;
	public _defaultPaddingBottom: number;
	public _defaultPaddingLeft: number;
	public _isPaddingRelative: boolean;

	/**
	 * @private
	 * Module name when the view is a module root. Otherwise, it is undefined.
	 */
	public _moduleName: string;

	/**
	 * Gets or sets if the view is reusable. Reusable views are not automatically destroyed when removed from the View tree.
	 *
	 * @nsProperty
	 */
	public reusable: boolean;

	public readonly cssClasses: Set<string>;
	public readonly cssPseudoClasses: Set<string>;

	constructor() {
		super();
		this._domId = viewIdCounter++;
		this._style = new Style(new WeakRef(this));
		this.cssClasses = new Set();
		this.cssPseudoClasses = new Set();

		this.cssPseudoClasses.add(this.defaultVisualState);

		this.notify({ eventName: ViewBase.createdEvent, type: this.constructor.name, object: this });
	}

	// Used in Angular. TODO: remove from here
	/**
	 * Gets the template parent or the native parent. Sets the template parent.
	 */
	get parentNode() {
		return this._templateParent || this.parent;
	}
	set parentNode(node: ViewBase) {
		this._templateParent = node;
	}

	get nativeView(): any {
		// this._disableNativeViewRecycling = true;
		return this.nativeViewProtected;
	}
	set nativeView(value: any) {
		this.setNativeView(value);
	}

	// TODO: Use Type.prototype.typeName instead.
	/**
	 * Gets the name of the constructor function for this instance. E.g. for a Button class this will return "Button".
	 */
	get typeName(): string {
		return getClass(this);
	}

	/**
	 * Gets the style object associated to this view.
	 */
	get style(): Style {
		return this._style;
	}

	/**
	 *
	 * @nsProperty
	 */
	set style(inlineStyle: Style /* | string */) {
		if (typeof inlineStyle === 'string') {
			this.setInlineStyle(inlineStyle);
		} else {
			throw new Error('View.style property is read-only.');
		}
	}

	get android(): any {
		// this._disableNativeViewRecycling = true;
		return this._androidView;
	}

	get ios(): any {
		// this._disableNativeViewRecycling = true;
		return this._iosView;
	}

	get isLoaded(): boolean {
		return this._isLoaded;
	}

	get ['class'](): string {
		return this.className;
	}
	set ['class'](v: string) {
		this.className = v;
	}

	/**
	 * Returns the child view with the specified id.
	 */
	getViewById<T extends ViewBaseDefinition>(id: string): T {
		return <T>getViewById(this, id);
	}

	/**
	 * Returns the child view with the specified domId.
	 */
	getViewByDomId<T extends ViewBaseDefinition>(domId: number): T {
		return <T>getViewByDomId(this, domId);
	}

	/**
	 * Gets owner page. This is a read-only property.
	 */
	get page(): Page {
		if (this.parent) {
			return this.parent.page;
		}

		return null;
	}

	/**
	 * @unstable
	 * Ensures a dom-node for this view.
	 */
	public ensureDomNode() {
		if (!this.domNode) {
			ensuredomNodeModule();
			this.domNode = new domNodeModule.DOMNode(this);
		}
	}

	// Overridden so we don't raise `propertyChange`
	// The property will raise its own event.
	public set(name: string, value: any) {
		this[name] = WrappedValue.unwrap(value);
	}

	@profile
	public onLoaded() {
		this.setFlag(Flags.superOnLoadedCalled, true);
		if (this._isLoaded) {
			return;
		}

		this._isLoaded = true;
		this._cssState.onLoaded();
		this._resumeNativeUpdates(SuspendType.Loaded);

		this.eachChild((child) => {
			this.loadView(child);

			return true;
		});

		this._emit('loaded');
	}

	@profile
	public onUnloaded() {
		this.setFlag(Flags.superOnUnloadedCalled, true);
		if (!this._isLoaded) {
			return;
		}

		this._suspendNativeUpdates(SuspendType.Loaded);

		this.eachChild((child) => {
			this.unloadView(child);

			return true;
		});

		this._isLoaded = false;
		this._cssState.onUnloaded();
		this._emit('unloaded');
	}

	public _layoutParent() {
		if (this.parent) {
			this.parent._layoutParent();
		}
	}

	public _suspendNativeUpdates(type: SuspendType): void {
		if (type) {
			this._suspendNativeUpdatesCount = this._suspendNativeUpdatesCount | type;
		} else {
			this._suspendNativeUpdatesCount++;
		}
	}
	public _resumeNativeUpdates(type: SuspendType): void {
		if (type) {
			this._suspendNativeUpdatesCount = this._suspendNativeUpdatesCount & ~type;
		} else {
			if ((this._suspendNativeUpdatesCount & SuspendType.IncrementalCountMask) === 0) {
				throw new Error(`Invalid call to ${this}._resumeNativeUpdates`);
			}
			this._suspendNativeUpdatesCount--;
		}

		if (!this._suspendNativeUpdatesCount) {
			this.onResumeNativeUpdates();
		}
	}

	/**
	 * Allow multiple updates to be performed on the instance at once.
	 */
	public _batchUpdate<T>(callback: () => T): T {
		try {
			this._suspendNativeUpdates(SuspendType.Incremental);

			return callback();
		} finally {
			this._resumeNativeUpdates(SuspendType.Incremental);
		}
	}

	private setFlag(flag: Flags, value: boolean): void {
		switch (flag) {
			case Flags.superOnLoadedCalled:
				this._onLoadedCalled = value;
				break;

			case Flags.superOnUnloadedCalled:
				this._onUnloadedCalled = value;
				break;
		}
	}

	private isFlagSet(flag: Flags): boolean {
		switch (flag) {
			case Flags.superOnLoadedCalled:
				return this._onLoadedCalled;

			case Flags.superOnUnloadedCalled:
				return this._onUnloadedCalled;
		}
	}

	private callFunctionWithSuper(flag: Flags, func: () => void): void {
		this.setFlag(flag, false);
		func();
		if (!this.isFlagSet(flag)) {
			throw new Error(`super.${flag} not called in ${this}`);
		}
	}

	public callLoaded(): void {
		this.callFunctionWithSuper(Flags.superOnLoadedCalled, () => this.onLoaded());
	}

	public callUnloaded(): void {
		this.callFunctionWithSuper(Flags.superOnUnloadedCalled, () => this.onUnloaded());
	}

	private notifyPseudoClassChanged(pseudoClass: string): void {
		this.notify({ eventName: ':' + pseudoClass, object: this });
	}

	private pseudoClassAliases = {
		highlighted: ['active', 'pressed'],
	};

	private getAllAliasedStates(name: string): string[] {
		const allStates: string[] = [name];

		if (name in this.pseudoClassAliases) {
			for (let i = 0, length = this.pseudoClassAliases[name].length; i < length; i++) {
				allStates.push(this.pseudoClassAliases[name][i]);
			}
		}

		return allStates;
	}

	/**
	 * @protected
	 * @unstable
	 * A widget can call this method to add a matching css pseudo class.
	 */
	@profile
	public addPseudoClass(name: string): void {
		const allStates = this.getAllAliasedStates(name);
		for (let i = 0, length = allStates.length; i < length; i++) {
			if (!this.cssPseudoClasses.has(allStates[i])) {
				this.cssPseudoClasses.add(allStates[i]);
				this.notifyPseudoClassChanged(allStates[i]);
			}
		}
	}

	/**
	 * @protected
	 * @unstable
	 * A widget can call this method to discard matching css pseudo class.
	 */
	@profile
	public deletePseudoClass(name: string): void {
		const allStates = this.getAllAliasedStates(name);
		for (let i = 0, length = allStates.length; i < length; i++) {
			if (this.cssPseudoClasses.has(allStates[i])) {
				this.cssPseudoClasses.delete(allStates[i]);
				this.notifyPseudoClassChanged(allStates[i]);
			}
		}
	}

	private bindingContextChanged(data: PropertyChangeData): void {
		this.bindings.get('bindingContext').bind(data.value);
	}

	private bindings: Map<string, Binding>;
	private shouldAddHandlerToParentBindingContextChanged: boolean;
	private bindingContextBoundToParentBindingContextChanged: boolean;

	public bind(options: BindingOptions, source: Object = defaultBindingSource): void {
		const targetProperty = options.targetProperty;
		this.unbind(targetProperty);

		if (!this.bindings) {
			this.bindings = new Map<string, Binding>();
		}

		const binding = new Binding(this, options);
		this.bindings.set(targetProperty, binding);

		let bindingSource = source;
		if (bindingSource === defaultBindingSource) {
			bindingSource = this.bindingContext;
			binding.sourceIsBindingContext = true;
			if (targetProperty === 'bindingContext') {
				this.bindingContextBoundToParentBindingContextChanged = true;
				const parent = this.parent;
				if (parent) {
					parent.on('bindingContextChange', this.bindingContextChanged, this);
				} else {
					this.shouldAddHandlerToParentBindingContextChanged = true;
				}
			}
		}

		binding.bind(bindingSource);
	}

	public unbind(property: string): void {
		const bindings = this.bindings;
		if (!bindings) {
			return;
		}

		const binding = bindings.get(property);
		if (binding) {
			binding.unbind();
			bindings.delete(property);
			if (binding.sourceIsBindingContext) {
				if (property === 'bindingContext') {
					this.shouldAddHandlerToParentBindingContextChanged = false;
					this.bindingContextBoundToParentBindingContextChanged = false;
					const parent = this.parent;
					if (parent) {
						parent.off('bindingContextChange', this.bindingContextChanged, this);
					}
				}
			}
		}
	}

	private performLayout(currentRun = 0) {
		// if there's an animation in progress we need to delay the layout
		// we've added a guard of 5000 milliseconds execution
		// to make sure that the layout will happen even if the animation haven't finished in 5 seconds
		if (this._shouldDelayLayout() && currentRun < 100) {
			setTimeout(() => this.performLayout(currentRun), currentRun);
			currentRun++;
		} else {
			this.parent.requestLayout();
		}
	}

	/**
	 * Invalidates the layout of the view and triggers a new layout pass.
	 */
	@profile
	public requestLayout(): void {
		// Default implementation for non View instances (like TabViewItem).
		const parent = this.parent;
		if (parent) {
			this.performLayout();
		}
	}

	/**
	 * Iterates over children of type ViewBase.
	 * @param callback Called for each child of type ViewBase. Iteration stops if this method returns falsy value.
	 */
	public eachChild(callback: (child: ViewBase) => boolean) {
		//
	}

	public _inheritStyles(view: ViewBase): void {
		propagateInheritableProperties(this, view);
		view._inheritStyleScope(this._styleScope);
		propagateInheritableCssProperties(this.style, view.style);
	}

	@profile
	public _addView(view: ViewBase, atIndex?: number) {
		if (Trace.isEnabled()) {
			Trace.write(`${this}._addView(${view}, ${atIndex})`, Trace.categories.ViewHierarchy);
		}

		if (!view) {
			throw new Error('Expecting a valid View instance.');
		}
		if (!(view instanceof ViewBase)) {
			throw new Error(view + ' is not a valid View instance.');
		}
		if (view.parent) {
			throw new Error('View already has a parent. View: ' + view + ' Parent: ' + view.parent);
		}

		view.parent = this;
		this._addViewCore(view, atIndex);
		view._parentChanged(null);

		if (this.domNode) {
			this.domNode.onChildAdded(view);
		}
	}

	/**
	 * Method is intended to be overridden by inheritors and used as "protected"
	 */
	public _addViewCore(view: ViewBase, atIndex?: number) {
		this._inheritStyles(view);

		if (this._context) {
			view._setupUI(this._context, atIndex);
		}

		if (this._isLoaded) {
			this.loadView(view);
		}
	}

	/**
	 * Load view.
	 * @param view to load.
	 */
	public loadView(view: ViewBase): void {
		if (view && !view.isLoaded) {
			view.callLoaded();
		}
	}

	/**
	 * When returning true the callLoaded method will be run in setTimeout
	 * Method is intended to be overridden by inheritors and used as "protected"
	 */
	public _shouldDelayLayout(): boolean {
		return false;
	}

	/**
	 * Unload view.
	 * @param view to unload.
	 */
	public unloadView(view: ViewBase): void {
		if (view && view.isLoaded) {
			view.callUnloaded();
		}
	}

	/**
	 * Core logic for removing a child view from this instance. Used by the framework to handle lifecycle events more centralized. Do not use outside the UI Stack implementation.
	 */
	public _removeView(view: ViewBase) {
		if (Trace.isEnabled()) {
			Trace.write(`${this}._removeView(${view})`, Trace.categories.ViewHierarchy);
		}

		if (view.parent !== this) {
			throw new Error('View not added to this instance. View: ' + view + ' CurrentParent: ' + view.parent + ' ExpectedParent: ' + this);
		}

		if (this.domNode) {
			this.domNode.onChildRemoved(view);
		}

		this._removeViewCore(view);
		view.parent = undefined;
		view._parentChanged(this);
	}

	/**
	 * Method is intended to be overridden by inheritors and used as "protected"
	 */
	public _removeViewCore(view: ViewBase) {
		this.unloadView(view);

		if (view._context) {
			view._tearDownUI();
		}
	}

	/**
	 * Creates a native view.
	 * Returns either android.view.View or UIView.
	 */
	public createNativeView(): Object {
		return undefined;
	}

	/**
	 * Clean up references to the native view.
	 */
	public disposeNativeView() {
		// Unset these values so that view checks for resize the next time it's added back to view tree
		this._oldLeft = 0;
		this._oldTop = 0;
		this._oldRight = 0;
		this._oldBottom = 0;

		this.notify({
			eventName: ViewBase.disposeNativeViewEvent,
			object: this,
		});
	}

	/**
	 * Initializes properties/listeners of the native view.
	 */
	public initNativeView(): void {
		//
	}

	/**
	 * Resets properties/listeners set to the native view.
	 */
	public resetNativeView(): void {
		//
	}

	private resetNativeViewInternal(): void {
		// const nativeView = this.nativeViewProtected;
		// if (nativeView && __ANDROID__) {
		//     const recycle = this.recycleNativeView;
		//     if (recycle === "always" || (recycle === "auto" && !this._disableNativeViewRecycling)) {
		//         resetNativeView(this);
		//         if (this._isPaddingRelative) {
		//             nativeView.setPaddingRelative(this._defaultPaddingLeft, this._defaultPaddingTop, this._defaultPaddingRight, this._defaultPaddingBottom);
		//         } else {
		//             nativeView.setPadding(this._defaultPaddingLeft, this._defaultPaddingTop, this._defaultPaddingRight, this._defaultPaddingBottom);
		//         }
		//         this.resetNativeView();
		//     }
		// }
		// if (this._cssState) {
		//     this._cancelAllAnimations();
		// }
	}

	/**
	 * if _setupAsRootView is called it means it is not supposed to be
	 * added to a parent. However parent can be set before for the purpose
	 * of CSS variables/classes. That variable ensures that _addViewToNativeVisualTree
	 * is not called in _setupAsRootView
	 */
	mIsRootView = false;
	_setupAsRootView(context: any): void {
		this.mIsRootView = true;
		this._setupUI(context);
		this.mIsRootView = false;
	}

	/**
	 * Setups the UI for ViewBase and all its children recursively.
	 * This method should *not* be overridden by derived views.
	 */
	@profile
	public _setupUI(context: any /* android.content.Context */, atIndex?: number, parentIsLoaded?: boolean): void {
		if (this._context === context) {
			// this check is unnecessary as this function should never be called when this._context === context as it means the view was somehow detached,
			// which is only possible by setting reusable = true. Adding it either way for feature flag safety
			if (this.reusable) {
				if (!this.mIsRootView && this.parent && !this._isAddedToNativeVisualTree) {
					const nativeIndex = this.parent._childIndexToNativeChildIndex(atIndex);
					this._isAddedToNativeVisualTree = this.parent._addViewToNativeVisualTree(this, nativeIndex);
				}
			}
			return;
		} else if (this._context) {
			this._tearDownUI(true);
		}

		this._context = context;

		// This will account for nativeView that is created in createNativeView, recycled
		// or for backward compatibility - set before _setupUI in iOS constructor.
		let nativeView = this.nativeViewProtected;

		// if (__ANDROID__) {
		//     const recycle = this.recycleNativeView;
		//     if (recycle === "always" || (recycle === "auto" && !this._disableNativeViewRecycling)) {
		//         nativeView = <android.view.View>getNativeView(context, this.typeName);
		//     }
		// }
		if (!nativeView) {
			nativeView = this.createNativeView();
		}

		if (__ANDROID__) {
			// this check is also unecessary as this code should never be reached with _androidView != null unless reusable = true
			// also adding this check for feature flag safety
			if (this._androidView !== nativeView || !this.reusable) {
				this._androidView = nativeView;
				if (nativeView) {
					const className = this.constructor.name;

					if (this._isPaddingRelative === undefined) {
						this._isPaddingRelative = nativeView.isPaddingRelative();
					}

					let result: any /* android.graphics.Rect */ = DEFAULT_VIEW_PADDINGS.get(className) || (<any>nativeView).defaultPaddings;
					if (result === undefined) {
						DEFAULT_VIEW_PADDINGS.set(className, org.nativescript.widgets.ViewHelper.getPadding(nativeView));
						(<any>nativeView).defaultPaddings = DEFAULT_VIEW_PADDINGS.get(className);
						result = DEFAULT_VIEW_PADDINGS.get(className);
					}

					if (!nativeView.defaultPaddings) {
						nativeView.defaultPaddings = DEFAULT_VIEW_PADDINGS.get(className);
					}

					this._defaultPaddingTop = result.top;
					this._defaultPaddingRight = result.right;
					this._defaultPaddingBottom = result.bottom;
					this._defaultPaddingLeft = result.left;

					const style = this.style;
					if (!paddingTopProperty.isSet(style)) {
						this.effectivePaddingTop = this._defaultPaddingTop;
					}
					if (!paddingRightProperty.isSet(style)) {
						this.effectivePaddingRight = this._defaultPaddingRight;
					}
					if (!paddingBottomProperty.isSet(style)) {
						this.effectivePaddingBottom = this._defaultPaddingBottom;
					}
					if (!paddingLeftProperty.isSet(style)) {
						this.effectivePaddingLeft = this._defaultPaddingLeft;
					}
				}
			}
		} else {
			this._iosView = nativeView;
		}

		this.setNativeView(nativeView);

		if (!this.mIsRootView && this.parent) {
			const nativeIndex = this.parent._childIndexToNativeChildIndex(atIndex);
			this._isAddedToNativeVisualTree = this.parent._addViewToNativeVisualTree(this, nativeIndex);
		}

		this._resumeNativeUpdates(SuspendType.UISetup);

		this.eachChild((child) => {
			child._setupUI(context);

			return true;
		});
	}

	/**
	 * Set the nativeView field performing extra checks and updates to the native properties on the new view.
	 * Use in cases where the createNativeView is not suitable.
	 * As an example use in item controls where the native parent view will create the native views for child items.
	 */
	setNativeView(value: any): void {
		if (this.__nativeView === value) {
			return;
		}

		if (this.__nativeView) {
			this._suspendNativeUpdates(SuspendType.NativeView);
			// We may do a `this.resetNativeView()` here?
		}

		this.__nativeView = this.nativeViewProtected = value;
		if (this.__nativeView) {
			this._suspendedUpdates = undefined;
			this.initNativeView();
			this._resumeNativeUpdates(SuspendType.NativeView);
		}
	}

	/**
	 * Tears down the UI of a reusable node by making it no longer reusable.
	 * @see _tearDownUI
	 * @param forceDestroyChildren Force destroy the children (even if they are reusable)
	 */
	public destroyNode(forceDestroyChildren?: boolean): void {
		this.reusable = false;
		this.callUnloaded();
		this._tearDownUI(forceDestroyChildren);
	}

	/**
	 * Tears down the UI for ViewBase and all its children recursively.
	 * This method should *not* be overridden by derived views.
	 */
	@profile
	public _tearDownUI(force?: boolean): void {
		// No context means we are already teared down.
		if (!this._context) {
			return;
		}
		const preserveNativeView = this.reusable && !force;

		this.resetNativeViewInternal();

		if (!preserveNativeView) {
			this.eachChild((child) => {
				child._tearDownUI(force);

				return true;
			});
		}

		if (this.parent) {
			this.parent._removeViewFromNativeVisualTree(this);
		}

		// const nativeView = this.nativeViewProtected;
		// if (nativeView && __ANDROID__) {
		//     const recycle = this.recycleNativeView;
		//     let shouldRecycle = false;
		//     if (recycle === "always") {
		//         shouldRecycle = true;
		//     } else if (recycle === "auto" && !this._disableNativeViewRecycling) {
		//         const propertiesSet = Object.getOwnPropertySymbols(this).length + Object.getOwnPropertySymbols(this.style).length / 2;
		//         shouldRecycle = propertiesSet <= this.recyclePropertyCounter;
		//     }

		//     // const nativeParent = __ANDROID__ ? (<android.view.View>nativeView).getParent() : (<UIView>nativeView).superview;
		//     const nativeParent = (<android.view.View>nativeView).getParent();
		//     const animation = (<android.view.View>nativeView).getAnimation();
		//     if (shouldRecycle && !nativeParent && !animation) {
		//         putNativeView(this._context, this);
		//     }
		// }

		if (!preserveNativeView) {
			this.disposeNativeView();

			this._suspendNativeUpdates(SuspendType.UISetup);

			this.setNativeView(null);
			this._androidView = null;
			this._iosView = null;

			this._context = null;
		}

		if (this.domNode) {
			this.domNode.dispose();
			this.domNode = undefined;
		}
	}

	_childIndexToNativeChildIndex(index?: number): number {
		return index;
	}

	/**
	 * Performs the core logic of adding a child view to the native visual tree. Returns true if the view's native representation has been successfully added, false otherwise.
	 * Method is intended to be overridden by inheritors and used as "protected".
	 */
	public _addViewToNativeVisualTree(view: ViewBase, atIndex?: number): boolean {
		if (view._isAddedToNativeVisualTree) {
			throw new Error('Child already added to the native visual tree.');
		}

		return true;
	}

	/**
	 * Method is intended to be overridden by inheritors and used as "protected"
	 */
	public _removeViewFromNativeVisualTree(view: ViewBase) {
		view._isAddedToNativeVisualTree = false;
	}

	/**
	 * @deprecated
	 */
	public get visualState() {
		return this._visualState;
	}

	public _addVisualState(state: string): void {
		this.deletePseudoClass(this.defaultVisualState);
		this.addPseudoClass(state);
	}

	public _removeVisualState(state: string): void {
		this.deletePseudoClass(state);

		if (!this.cssPseudoClasses.size) {
			this.addPseudoClass(this.defaultVisualState);
		}
	}

	/**
	 * @deprecated Use View._addVisualState() and View._removeVisualState() instead.
	 */
	public _goToVisualState(state: string) {
		console.log('_goToVisualState() is deprecated. Use View._addVisualState() and View._removeVisualState() instead.');

		if (Trace.isEnabled()) {
			Trace.write(this + ' going to state: ' + state, Trace.categories.Style);
		}

		if (state === this._visualState) {
			return;
		}

		this.deletePseudoClass(this._visualState);
		this._visualState = state;
		this.addPseudoClass(state);
	}

	/**
	 * @deprecated
	 *
	 * This used to be the way to set attribute values in early {N} versions.
	 * Now attributes are expected to be set as plain properties on the view instances.
	 */
	public _applyXmlAttribute(attribute: string, value: string): boolean {
		console.log('ViewBase._applyXmlAttribute(...) is deprecated; set attributes as plain properties instead');

		if (attribute === 'style' || attribute === 'rows' || attribute === 'columns' || attribute === 'fontAttributes') {
			this[attribute] = value;

			return true;
		}

		return false;
	}

	public setInlineStyle(style: string): void {
		if (typeof style !== 'string') {
			throw new Error('Parameter should be valid CSS string!');
		}

		ensureStyleScopeModule();
		styleScopeModule.applyInlineStyle(this, style, undefined);
	}

	public _parentChanged(oldParent: ViewBase): void {
		const newParent = this.parent;

		//Overridden
		if (oldParent) {
			clearInheritedProperties(this);
			if (this.bindingContextBoundToParentBindingContextChanged) {
				oldParent.off('bindingContextChange', this.bindingContextChanged, this);
			}
		} else if (this.shouldAddHandlerToParentBindingContextChanged) {
			newParent.on('bindingContextChange', this.bindingContextChanged, this);
			this.bindings.get('bindingContext').bind(newParent.bindingContext);
		}
	}

	public onResumeNativeUpdates(): void {
		// Apply native setters...
		initNativeView(this, undefined, undefined);
	}

	public toString(): string {
		let str = this.typeName;
		if (this.id) {
			str += `<${this.id}>`;
		} else {
			str += `(${this._domId})`;
		}
		const source = Source.get(this);
		if (source) {
			str += `@${source};`;
		}

		return str;
	}

	/**
	 * @private
	 * Notifies each child's css state for change, recursively.
	 * Either the style scope, className or id properties were changed.
	 */
	_onCssStateChange(): void {
		this._cssState.onChange();
		eachDescendant(this, (child: ViewBase) => {
			child._cssState.onChange();

			return true;
		});
	}

	_inheritStyleScope(styleScope: ssm.StyleScope): void {
		// If we are styleScope don't inherit parent stylescope.
		// TODO: Consider adding parent scope and merge selectors.
		if (this._isStyleScopeHost) {
			return;
		}

		if (this._styleScope !== styleScope) {
			this._styleScope = styleScope;
			this._onCssStateChange();
			this.eachChild((child) => {
				child._inheritStyleScope(styleScope);

				return true;
			});
		}
	}

	/**
	 * Shows the view passed as parameter as a modal view.
	 * @param view - View instance to be shown modally.
	 * @param modalOptions - A ShowModalOptions instance
	 */
	public showModal(view: ViewBase, modalOptions?: ShowModalOptions): ViewBase;
	/**
	 * Shows the View contained in moduleName as a modal view.
	 * @param moduleName - The name of the module to load starting from the application root.
	 * @param modalOptions - A ShowModalOptions instance
	 */
	public showModal(moduleName: string, modalOptions?: ShowModalOptions): ViewBase;

	public showModal(moduleOrView: string | ViewBase, modalOptions?: ShowModalOptions): ViewBase {
		const parent = this.parent;

		return parent && parent.showModal(<ViewBase>moduleOrView, modalOptions);
	}

	/**
	 * Closes the current modal view that this page is showing.
	 * @param context - Any context you want to pass back to the host when closing the modal view.
	 */
	public closeModal(...args): void {
		const parent = this.parent;
		if (parent) {
			parent.closeModal(...args);
		}
	}

	/**
	 * Method is intended to be overridden by inheritors and used as "protected"
	 */
	public _dialogClosed(): void {
		eachDescendant(this, (child: ViewBase) => {
			child._dialogClosed();

			return true;
		});
	}

	/**
	 * Method is intended to be overridden by inheritors and used as "protected"
	 */
	public _onRootViewReset(): void {
		eachDescendant(this, (child: ViewBase) => {
			child._onRootViewReset();

			return true;
		});
	}
}

ViewBase.prototype.isCollapsed = false;

ViewBase.prototype._oldLeft = 0;
ViewBase.prototype._oldTop = 0;
ViewBase.prototype._oldRight = 0;
ViewBase.prototype._oldBottom = 0;

ViewBase.prototype.effectiveMinWidth = 0;
ViewBase.prototype.effectiveMinHeight = 0;
ViewBase.prototype.effectiveWidth = 0;
ViewBase.prototype.effectiveHeight = 0;
ViewBase.prototype.effectiveMarginTop = 0;
ViewBase.prototype.effectiveMarginRight = 0;
ViewBase.prototype.effectiveMarginBottom = 0;
ViewBase.prototype.effectiveMarginLeft = 0;
ViewBase.prototype.effectivePaddingTop = 0;
ViewBase.prototype.effectivePaddingRight = 0;
ViewBase.prototype.effectivePaddingBottom = 0;
ViewBase.prototype.effectivePaddingLeft = 0;
ViewBase.prototype.effectiveBorderTopWidth = 0;
ViewBase.prototype.effectiveBorderRightWidth = 0;
ViewBase.prototype.effectiveBorderBottomWidth = 0;
ViewBase.prototype.effectiveBorderLeftWidth = 0;
ViewBase.prototype._defaultPaddingTop = 0;
ViewBase.prototype._defaultPaddingRight = 0;
ViewBase.prototype._defaultPaddingBottom = 0;
ViewBase.prototype._defaultPaddingLeft = 0;
ViewBase.prototype._isViewBase = true;
ViewBase.prototype.recycleNativeView = 'never';
ViewBase.prototype.reusable = false;

ViewBase.prototype._suspendNativeUpdatesCount = SuspendType.Loaded | SuspendType.NativeView | SuspendType.UISetup;

export const bindingContextProperty = new InheritedProperty<ViewBase, any>({
	name: 'bindingContext',
});
bindingContextProperty.register(ViewBase);

export const hiddenProperty = new Property<ViewBase, boolean>({
	name: 'hidden',
	defaultValue: false,
	affectsLayout: __APPLE__,
	valueConverter: booleanConverter,
	valueChanged: (target, oldValue, newValue) => {
		if (target) {
			target.isCollapsed = !!newValue;
		}
	},
});
hiddenProperty.register(ViewBase);

export const classNameProperty = new Property<ViewBase, string>({
	name: 'className',
	valueChanged(view: ViewBase, oldValue: string, newValue: string) {
		const cssClasses = view.cssClasses;
		const rootViewsCssClasses = CSSUtils.getSystemCssClasses();

		const shouldAddModalRootViewCssClasses = cssClasses.has(CSSUtils.MODAL_ROOT_VIEW_CSS_CLASS);
		const shouldAddRootViewCssClasses = cssClasses.has(CSSUtils.ROOT_VIEW_CSS_CLASS);

		cssClasses.clear();

		if (shouldAddModalRootViewCssClasses) {
			cssClasses.add(CSSUtils.MODAL_ROOT_VIEW_CSS_CLASS);
		} else if (shouldAddRootViewCssClasses) {
			cssClasses.add(CSSUtils.ROOT_VIEW_CSS_CLASS);
		}

		rootViewsCssClasses.forEach((c) => cssClasses.add(c));

		if (typeof newValue === 'string' && newValue !== '') {
			newValue.split(' ').forEach((c) => cssClasses.add(c));
		}

		view._onCssStateChange();
	},
});
classNameProperty.register(ViewBase);

export const idProperty = new Property<ViewBase, string>({
	name: 'id',
	valueChanged: (view, oldValue, newValue) => view._onCssStateChange(),
});
idProperty.register(ViewBase);

export const defaultVisualStateProperty = new Property<ViewBase, string>({
	name: 'defaultVisualState',
	defaultValue: 'normal',
	valueChanged(this: void, target, oldValue, newValue): void {
		const value = newValue || 'normal';

		// Append new default if old one is currently applied
		if (target.cssPseudoClasses && target.cssPseudoClasses.has(oldValue)) {
			target.deletePseudoClass(oldValue);
			target.addPseudoClass(newValue);
		}
	},
});
defaultVisualStateProperty.register(ViewBase);

export function booleanConverter(v: string | boolean): boolean {
	const lowercase = (v + '').toLowerCase();
	if (lowercase === 'true') {
		return true;
	} else if (lowercase === 'false') {
		return false;
	}

	throw new Error(`Invalid boolean: ${v}`);
}
