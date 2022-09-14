import { Property, CssProperty, CssAnimationProperty, InheritedProperty } from '../properties';
import { BindingOptions } from '../bindable';
import { Observable } from '../../../data/observable';
import { Style } from '../../styling/style';
import { CoreTypes } from '../../../core-types';
import { Page } from '../../page';

import { Order, FlexGrow, FlexShrink, FlexWrapBefore, AlignSelf } from '../../layouts/flexbox-layout';
import { Length } from '../../styling/style-properties';
import { DOMNode } from '../../../debugger/dom-node';
import type { CustomTransitionModal } from '../../transition';

/**
 * Iterates through all child views (via visual tree) and executes a function.
 * @param view - Starting view (parent container).
 * @param callback - A function to execute on every child. If function returns false it breaks the iteration.
 */
export function eachDescendant(view: ViewBase, callback: (child: ViewBase) => boolean);

/**
 * Gets an ancestor from a given type.
 * @param view - Starting view (child view).
 * @param criterion - The type of ancestor view we are looking for. Could be a string containing a class name or an actual type.
 * Returns an instance of a view (if found), otherwise undefined.
 */
export function getAncestor(view: ViewBase, criterion: string | Function): ViewBase;

export function isEventOrGesture(name: string, view: ViewBase): boolean;

/**
 * Gets a child view by id.
 * @param view - The parent (container) view of the view to look for.
 * @param id - The id of the view to look for.
 * Returns an instance of a view (if found), otherwise undefined.
 */
export function getViewById(view: ViewBase, id: string): ViewBase;

/**
 * Gets a child view by domId.
 * @param view - The parent (container) view of the view to look for.
 * @param domId - The id of the view to look for.
 * Returns an instance of a view (if found), otherwise undefined.
 */
export function getViewByDomId(view: ViewBase, domId: number): ViewBase;

export interface ModalTransition {
	name?: string;
	instance?: CustomTransitionModal;
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
	 * An optional custom transition effect
	 */
	transition?: ModalTransition;

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
		 * An optional parameter specifying the windowSoftInputMode of the dialog window
		 * For possible values see https://developer.android.com/reference/android/view/WindowManager.LayoutParams#softInputMode
		 */
		windowSoftInputMode?: number;
	};
	/**
	 * An optional parameter specifying whether the modal view can be dismissed when not in full-screen mode.
	 */
	cancelable?: boolean;
}

export abstract class ViewBase extends Observable {
	// Dynamic properties.
	left: CoreTypes.LengthType;
	top: CoreTypes.LengthType;
	effectiveLeft: number;
	effectiveTop: number;
	dock: 'left' | 'top' | 'right' | 'bottom';
	row: number;
	col: number;
	/**
	 * Setting `column` property is the same as `col`
	 */
	column: number;
	rowSpan: number;
	colSpan: number;
	/**
	 * Setting `columnSpan` property is the same as `colSpan`
	 */
	columnSpan: number;
	domNode: DOMNode;

	order: Order;
	flexGrow: FlexGrow;
	flexShrink: FlexShrink;
	flexWrapBefore: FlexWrapBefore;
	alignSelf: AlignSelf;

	/**
	 * @private
	 * Module name when the view is a module root. Otherwise, it is undefined.
	 */
	_moduleName?: string;

	//@private
	/**
	 * @private
	 */
	_oldLeft: number;
	/**
	 * @private
	 */
	_oldTop: number;
	/**
	 * @private
	 */
	_oldRight: number;
	/**
	 * @private
	 */
	_oldBottom: number;
	/**
	 * @private
	 */
	_defaultPaddingTop: number;
	/**
	 * @private
	 */
	_defaultPaddingRight: number;
	/**
	 * @private
	 */
	_defaultPaddingBottom: number;
	/**
	 * @private
	 */
	_defaultPaddingLeft: number;

	/**
	 * A property bag holding suspended native updates.
	 * Native setters that had to execute while there was no native view,
	 * or the view was detached from the visual tree etc. will accumulate in this object,
	 * and will be applied when all prerequisites are met.
	 * @private
	 */
	_suspendedUpdates: {
		[propertyName: string]: Property<any, any> | CssProperty<Style, any> | CssAnimationProperty<Style, any>;
	};
	//@endprivate

	/**
	 * Shows the View contained in moduleName as a modal view.
	 * @param moduleName - The name of the module to load starting from the application root.
	 * @param modalOptions - A ShowModalOptions instance
	 */
	showModal(moduleName: string, modalOptions?: ShowModalOptions): ViewBase;

	/**
	 * Shows the view passed as parameter as a modal view.
	 * @param view - View instance to be shown modally.
	 * @param modalOptions - A ShowModalOptions instance
	 */
	showModal(view: ViewBase, modalOptions?: ShowModalOptions): ViewBase;

	/**
	 * Closes the current modal view that this page is showing.
	 * @param context - Any context you want to pass back to the host when closing the modal view.
	 */
	closeModal(context?: any): void;

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

	/**
	 * String value used when hooking to loaded event.
	 */
	public static loadedEvent: string;

	/**
	 * String value used when hooking to unloaded event.
	 */
	public static unloadedEvent: string;

	/**
	 * String value used when hooking to creation event
	 */
	public static createdEvent: string;

	/**
	 * String value used when hooking to disposeNativeView event
	 */
	public static disposeNativeViewEvent: string;

	public ios: any;
	public android: any;

	/**
	 * returns the native UIViewController.
	 */
	public viewController: any;

	/**
	 * read-only. If you want to set out-of-band the nativeView use the setNativeView method.
	 */
	public nativeViewProtected: any;
	public nativeView: any;
	public bindingContext: any;

	/**
	 * Gets or sets if the view is reusable.
	 * Reusable views are not automatically destroyed when removed from the View tree.
	 */
	public reusable: boolean;

	/**
	 * Gets the name of the constructor function for this instance. E.g. for a Button class this will return "Button".
	 */
	public typeName: string;

	/**
	 * Gets the parent view. This property is read-only.
	 */
	public readonly parent: ViewBase;

	/**
	 * Gets the template parent or the native parent. Sets the template parent.
	 */
	public parentNode: ViewBase;

	/**
	 * Gets or sets the id for this view.
	 */
	public id: string;

	/**
	 * Gets or sets the CSS class name for this view.
	 */
	public className: string;

	/**
	 * Gets owner page. This is a read-only property.
	 */
	public readonly page: Page;

	/**
	 * Gets the style object associated to this view.
	 */
	public readonly style: Style;

	/**
	 * Returns true if visibility is set to 'collapse'.
	 * Readonly property
	 */
	public isCollapsed: boolean;
	public readonly isLoaded: boolean;

	/**
	 * Returns the child view with the specified id.
	 */
	public getViewById<T extends ViewBase>(id: string): T;

	/**
	 * Returns the child view with the specified domId.
	 */
	public getViewByDomId<T extends ViewBase>(id: number): T;

	/**
	 * Load view.
	 * @param view to load.
	 */
	public loadView(view: ViewBase): void;

	/**
	 * Unload view.
	 * @param view to unload.
	 */
	public unloadView(view: ViewBase): void;

	public onLoaded(): void;
	public onUnloaded(): void;
	public onResumeNativeUpdates(): void;

	public bind(options: BindingOptions, source?: Object): void;
	public unbind(property: string): void;

	/**
	 * Invalidates the layout of the view and triggers a new layout pass.
	 */
	public requestLayout(): void;

	/**
	 * Iterates over children of type ViewBase.
	 * @param callback Called for each child of type ViewBase. Iteration stops if this method returns falsy value.
	 */
	public eachChild(callback: (child: ViewBase) => boolean): void;

	public _addView(view: ViewBase, atIndex?: number): void;
	/**
	 * Method is intended to be overridden by inheritors and used as "protected"
	 */
	public _addViewCore(view: ViewBase, atIndex?: number): void;

	public _removeView(view: ViewBase): void;
	/**
	 * Method is intended to be overridden by inheritors and used as "protected"
	 */
	public _removeViewCore(view: ViewBase): void;
	public _parentChanged(oldParent: ViewBase): void;
	/**
	 * Method is intended to be overridden by inheritors and used as "protected"
	 */
	public _dialogClosed(): void;
	/**
	 * Method is intended to be overridden by inheritors and used as "protected"
	 */
	public _onRootViewReset(): void;

	_domId: number;

	_cssState: any /* "ui/styling/style-scope" */;
	/**
	 * @private
	 * Notifies each child's css state for change, recursively.
	 * Either the style scope, className or id properties were changed.
	 */
	_onCssStateChange(): void;

	public cssClasses: Set<string>;
	public cssPseudoClasses: Set<string>;

	public _goToVisualState(state: string): void;

	public setInlineStyle(style: string): void;

	_context: any /* android.content.Context */;

	/**
	 * Setups the UI for ViewBase and all its children recursively.
	 * This method should *not* be overridden by derived views.
	 */
	_setupUI(context: any /* android.content.Context */, atIndex?: number): void;

	/**
	 * Tears down the UI for ViewBase and all its children recursively.
	 * This method should *not* be overridden by derived views.
	 */
	_tearDownUI(force?: boolean): void;

	/**
	 * Tears down the UI of a reusable node by making it no longer reusable.
	 * @see _tearDownUI
	 * @param forceDestroyChildren Force destroy the children (even if they are reusable)
	 */
	destroyNode(forceDestroyChildren?: boolean): void;

	/**
	 * Creates a native view.
	 * Returns either android.view.View or UIView.
	 */
	createNativeView(): Object;

	/**
	 * Initializes properties/listeners of the native view.
	 */
	initNativeView(): void;

	/**
	 * Clean up references to the native view.
	 */
	disposeNativeView(): void;

	/**
	 * Resets properties/listeners set to the native view.
	 */
	resetNativeView(): void;

	/**
	 * Set the nativeView field performing extra checks and updates to the native properties on the new view.
	 * Use in cases where the createNativeView is not suitable.
	 * As an example use in item controls where the native parent view will create the native views for child items.
	 */
	setNativeView(view: any): void;

	_isAddedToNativeVisualTree: boolean;

	/**
	 * Performs the core logic of adding a child view to the native visual tree. Returns true if the view's native representation has been successfully added, false otherwise.
	 */
	_addViewToNativeVisualTree(view: ViewBase, atIndex?: number): boolean;
	_removeViewFromNativeVisualTree(view: ViewBase): void;
	_childIndexToNativeChildIndex(index?: number): number;

	/**
	 * @protected
	 * @unstable
	 * A widget can call this method to add a matching css pseudo class.
	 */
	public addPseudoClass(name: string): void;

	/**
	 * @protected
	 * @unstable
	 * A widget can call this method to discard matching css pseudo class.
	 */
	public deletePseudoClass(name: string): void;

	/**
	 * @unstable
	 * Ensures a dom-node for this view.
	 */
	public ensureDomNode();

	public recycleNativeView: 'always' | 'never' | 'auto';

	/**
	 * @private
	 */
	public _isPaddingRelative: boolean;

	/**
	 * @private
	 */
	public _ignoreFlexMinWidthHeightReset: boolean;

	public _styleScope: any;

	/**
	 * @private
	 */
	public _automaticallyAdjustsScrollViewInsets: boolean;
	/**
	 * @private
	 */
	_isStyleScopeHost: boolean;

	/**
	 * @private
	 */
	public _layoutParent(): void;

	/**
	 * Determines the depth of suspended updates.
	 * When the value is 0 the current property updates are not batched nor scoped and must be immediately applied.
	 * If the value is 1 or greater, the current updates are batched and does not have to provide immediate update.
	 * Do not set this field, the _batchUpdate method is responsible to keep the count up to date,
	 * as well as adding/rmoving the view to/from the visual tree.
	 */
	public _suspendNativeUpdatesCount: number;

	/**
	 * Allow multiple updates to be performed on the instance at once.
	 */
	public _batchUpdate<T>(callback: () => T): T;
	/**
	 * @private
	 */
	_setupAsRootView(context: any): void;

	/**
	 * When returning true the callLoaded method will be run in setTimeout
	 * Method is intended to be overridden by inheritors and used as "protected"
	 */
	_shouldDelayLayout(): boolean;

	/**
	 * @private
	 */
	_inheritStyleScope(styleScope: any /* StyleScope */): void;

	/**
	 * @private
	 */
	callLoaded(): void;

	/**
	 * @private
	 */
	callUnloaded(): void;
	//@endprivate
}

export class Binding {
	constructor(target: ViewBase, options: BindingOptions);
	public bind(source: Object): void;
	public unbind();
}

export const idProperty: Property<any, string>;
export const classNameProperty: Property<any, string>;
export const bindingContextProperty: InheritedProperty<any, any>;

/**
 * Converts string into boolean value.
 * Throws error if value is not 'true' or 'false'.
 */
export function booleanConverter(v: string): boolean;
