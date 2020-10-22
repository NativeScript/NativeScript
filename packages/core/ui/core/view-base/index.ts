// Definitions.
import { AlignSelf, FlexGrow, FlexShrink, FlexWrapBefore, Order } from '../../layouts/flexbox-layout';
import { Page } from '../../page';

// Types.
import { Property, CssProperty, CssAnimationProperty, InheritedProperty, clearInheritedProperties, propagateInheritableProperties, propagateInheritableCssProperties, initNativeView } from '../properties';
import { CSSUtils } from '../../../css/system-classes';
import { Source } from '../../../utils/debug';
import { Binding, BindingOptions } from '../bindable';
import { Trace } from '../../../trace';
import { Observable, PropertyChangeData, WrappedValue } from '../../../data/observable';
import { Style } from '../../styling/style';
import { Length, paddingTopProperty, paddingRightProperty, paddingBottomProperty, paddingLeftProperty } from '../../styling/style-properties';

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

let defaultBindingSource = {};

export interface ShowModalOptions {
	/**
	 * Any context you want to pass to the modally shown view. This same context will be available in the arguments of the shownModally event handler.
	 */
	context: any;

	/**
	 * A function that will be called when the view is closed. Any arguments provided when calling ShownModallyData.closeCallback will be available here.
	 */
	closeCallback: Function;

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
	};
	/**
	 * An optional parameter specifying whether the modal view can be dismissed when not in full-screen mode.
	 */
	cancelable?: boolean;
}

export function getAncestor(view: ViewBaseDefinition, criterion: string | Function): ViewBaseDefinition {
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

export function eachDescendant(view: ViewBaseDefinition, callback: (child: ViewBaseDefinition) => boolean) {
	if (!callback || !view) {
		return;
	}

	let continueIteration: boolean;
	let localCallback = function (child: ViewBaseDefinition): boolean {
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

export abstract class ViewBase extends Observable implements ViewBaseDefinition {
	public static loadedEvent = 'loaded';
	public static unloadedEvent = 'unloaded';
	public static createdEvent = 'created';

	private _onLoadedCalled: boolean = false;
	private _onUnloadedCalled: boolean = false;
	private _iosView: Object;
	private _androidView: Object;
	private _style: Style;
	private _isLoaded: boolean;
	private _visualState: string;
	private _templateParent: ViewBase;
	private __nativeView: any;
	// private _disableNativeViewRecycling: boolean;

	public domNode: dnm.DOMNode;

	public recycleNativeView: 'always' | 'never' | 'auto';
	public viewController: any;
	public bindingContext: any;
	public nativeViewProtected: any;
	public parent: ViewBase;
	public isCollapsed; // Default(false) set in prototype

	public id: string;
	public className: string;

	public _domId: number;
	public _context: any;
	public _isAddedToNativeVisualTree: boolean;
	public _cssState: ssm.CssState = new ssm.CssState(new WeakRef(this));
	public _styleScope: ssm.StyleScope;
	public _suspendedUpdates: {
		[propertyName: string]: Property<ViewBase, any> | CssProperty<Style, any> | CssAnimationProperty<Style, any>;
	};
	public _suspendNativeUpdatesCount: number;
	public _isStyleScopeHost: boolean;
	public _automaticallyAdjustsScrollViewInsets: boolean;

	// Dynamic properties.
	left: Length;
	top: Length;
	effectiveLeft: number;
	effectiveTop: number;
	dock: 'left' | 'top' | 'right' | 'bottom';
	row: number;
	col: number;
	column: number; // synonym for "col"
	rowSpan: number;
	colSpan: number;
	columnSpan: number; // synonym for "columnSpan"

	order: Order;
	flexGrow: FlexGrow;
	flexShrink: FlexShrink;
	flexWrapBefore: FlexWrapBefore;
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

	public _moduleName: string;

	constructor() {
		super();
		this._domId = viewIdCounter++;
		this._style = new Style(new WeakRef(this));
		this.notify({ eventName: ViewBase.createdEvent, type: this.constructor.name, object: this });
	}

	// Used in Angular.
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
	get typeName(): string {
		return getClass(this);
	}

	get style(): Style {
		return this._style;
	}
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

	get class(): string {
		return this.className;
	}
	set class(v: string) {
		this.className = v;
	}

	getViewById<T extends ViewBaseDefinition>(id: string): T {
		return <T>getViewById(this, id);
	}

	get page(): Page {
		if (this.parent) {
			return this.parent.page;
		}

		return null;
	}

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

	public cssClasses: Set<string> = new Set();
	public cssPseudoClasses: Set<string> = new Set();

	private getAllAliasedStates(name: string): Array<string> {
		const allStates = [];
		allStates.push(name);
		if (name in this.pseudoClassAliases) {
			for (let i = 0; i < this.pseudoClassAliases[name].length; i++) {
				allStates.push(this.pseudoClassAliases[name][i]);
			}
		}

		return allStates;
	}

	@profile
	public addPseudoClass(name: string): void {
		let allStates = this.getAllAliasedStates(name);
		for (let i = 0; i < allStates.length; i++) {
			if (!this.cssPseudoClasses.has(allStates[i])) {
				this.cssPseudoClasses.add(allStates[i]);
				this.notifyPseudoClassChanged(allStates[i]);
			}
		}
	}

	@profile
	public deletePseudoClass(name: string): void {
		let allStates = this.getAllAliasedStates(name);
		for (let i = 0; i < allStates.length; i++) {
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

	@profile
	public requestLayout(): void {
		// Default implementation for non View instances (like TabViewItem).
		const parent = this.parent;
		if (parent) {
			this.performLayout();
		}
	}

	public eachChild(callback: (child: ViewBase) => boolean) {
		//
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

	public _addViewCore(view: ViewBase, atIndex?: number) {
		propagateInheritableProperties(this, view);
		view._inheritStyleScope(this._styleScope);
		propagateInheritableCssProperties(this.style, view.style);

		if (this._context) {
			view._setupUI(this._context, atIndex);
		}

		if (this._isLoaded) {
			this.loadView(view);
		}
	}

	public loadView(view: ViewBase): void {
		if (view && !view.isLoaded) {
			view.callLoaded();
		}
	}

	public _shouldDelayLayout(): boolean {
		return false;
	}

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

	public createNativeView(): Object {
		return undefined;
	}

	public disposeNativeView() {
		//
	}

	public initNativeView(): void {
		//
	}

	public resetNativeView(): void {
		//
	}

	private resetNativeViewInternal(): void {
		// const nativeView = this.nativeViewProtected;
		// if (nativeView && global.isAndroid) {
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

	_setupAsRootView(context: any): void {
		this._setupUI(context);
	}

	@profile
	public _setupUI(context: any, atIndex?: number, parentIsLoaded?: boolean): void {
		if (this._context === context) {
			return;
		} else if (this._context) {
			this._tearDownUI(true);
		}

		this._context = context;

		// This will account for nativeView that is created in createNativeView, recycled
		// or for backward compatability - set before _setupUI in iOS contructor.
		let nativeView = this.nativeViewProtected;

		// if (global.isAndroid) {
		//     const recycle = this.recycleNativeView;
		//     if (recycle === "always" || (recycle === "auto" && !this._disableNativeViewRecycling)) {
		//         nativeView = <android.view.View>getNativeView(context, this.typeName);
		//     }
		// }
		if (!nativeView) {
			nativeView = this.createNativeView();
		}

		if (global.isAndroid) {
			this._androidView = nativeView;
			if (nativeView) {
				if (this._isPaddingRelative === undefined) {
					this._isPaddingRelative = nativeView.isPaddingRelative();
				}

				let result: any /* android.graphics.Rect */ = (<any>nativeView).defaultPaddings;
				if (result === undefined) {
					result = org.nativescript.widgets.ViewHelper.getPadding(nativeView);
					(<any>nativeView).defaultPaddings = result;
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
		} else {
			this._iosView = nativeView;
		}

		this.setNativeView(nativeView);

		if (this.parent) {
			const nativeIndex = this.parent._childIndexToNativeChildIndex(atIndex);
			this._isAddedToNativeVisualTree = this.parent._addViewToNativeVisualTree(this, nativeIndex);
		}

		this._resumeNativeUpdates(SuspendType.UISetup);

		this.eachChild((child) => {
			child._setupUI(context);

			return true;
		});
	}

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

	@profile
	public _tearDownUI(force?: boolean): void {
		// No context means we are already teared down.
		if (!this._context) {
			return;
		}

		this.resetNativeViewInternal();

		this.eachChild((child) => {
			child._tearDownUI(force);

			return true;
		});

		if (this.parent) {
			this.parent._removeViewFromNativeVisualTree(this);
		}

		// const nativeView = this.nativeViewProtected;
		// if (nativeView && global.isAndroid) {
		//     const recycle = this.recycleNativeView;
		//     let shouldRecycle = false;
		//     if (recycle === "always") {
		//         shouldRecycle = true;
		//     } else if (recycle === "auto" && !this._disableNativeViewRecycling) {
		//         const propertiesSet = Object.getOwnPropertySymbols(this).length + Object.getOwnPropertySymbols(this.style).length / 2;
		//         shouldRecycle = propertiesSet <= this.recyclePropertyCounter;
		//     }

		//     // const nativeParent = global.isAndroid ? (<android.view.View>nativeView).getParent() : (<UIView>nativeView).superview;
		//     const nativeParent = (<android.view.View>nativeView).getParent();
		//     const animation = (<android.view.View>nativeView).getAnimation();
		//     if (shouldRecycle && !nativeParent && !animation) {
		//         putNativeView(this._context, this);
		//     }
		// }

		this.disposeNativeView();

		this._suspendNativeUpdates(SuspendType.UISetup);

		if (global.isAndroid) {
			this.setNativeView(null);
			this._androidView = null;
		}

		// this._iosView = null;

		this._context = null;

		if (this.domNode) {
			this.domNode.dispose();
			this.domNode = undefined;
		}
	}

	_childIndexToNativeChildIndex(index?: number): number {
		return index;
	}

	/**
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

	public _goToVisualState(state: string) {
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
		let source = Source.get(this);
		if (source) {
			str += `@${source};`;
		}

		return str;
	}

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

	public showModal(...args): ViewBase {
		const parent = this.parent;

		return parent && parent.showModal(...args);
	}

	public closeModal(...args): void {
		const parent = this.parent;
		if (parent) {
			parent.closeModal(...args);
		}
	}

	public _dialogClosed(): void {
		eachDescendant(this, (child: ViewBase) => {
			child._dialogClosed();

			return true;
		});
	}

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

ViewBase.prototype._suspendNativeUpdatesCount = SuspendType.Loaded | SuspendType.NativeView | SuspendType.UISetup;

export const bindingContextProperty = new InheritedProperty<ViewBase, any>({
	name: 'bindingContext',
});
bindingContextProperty.register(ViewBase);

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

export function booleanConverter(v: string): boolean {
	const lowercase = (v + '').toLowerCase();
	if (lowercase === 'true') {
		return true;
	} else if (lowercase === 'false') {
		return false;
	}

	throw new Error(`Invalid boolean: ${v}`);
}
