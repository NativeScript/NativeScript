import { ViewBase } from '../view-base';
import { Property, InheritedProperty } from '../properties';
import { EventData } from '../../../data/observable';
import { Color } from '../../../color';
import { Animation, AnimationDefinition, AnimationPromise } from '../../animation';
import { HorizontalAlignment, VerticalAlignment, Visibility, Length, PercentLength } from '../../styling/style-properties';
import { GestureTypes, GestureEventData, GesturesObserver } from '../../gestures';
import { LinearGradient } from '../../styling/gradient';

// helpers (these are okay re-exported here)
export * from './view-helper';

// This one can eventually be cleaned up but causes issues with a lot of ui-suite plugins in particular if not exported here
export * from '../properties';

export function PseudoClassHandler(...pseudoClasses: string[]): MethodDecorator;

/**
 * Specifies the type name for the instances of this View class,
 * that is used when matching CSS type selectors.
 *
 * Usage:
 * ```
 * @CSSType("Button")
 * class Button extends View {
 * }
 * ```
 *
 * Internally the decorator set `Button.prototype.cssType = "Button"`.
 * @param type The type name, e. g. "Button", "Label", etc.
 */
export function CSSType(type: string): ClassDecorator;

/**
 *
 * @param view The view
 * @param context The ModuleType
 * @param type Type of the ModuleType to be matched
 */
export function viewMatchesModuleContext(view: View, context: ModuleContext, type: ModuleType[]): boolean;

/**
 * Denotes a length number that is in device independent pixel units.
 */
export type dip = number;

/**
 * Denotes a length number that is in physical device pixels.
 */
export type px = number;

/**
 * Denotes a normalized percent number.
 * 0% is represented as 0
 * 50% is represented as 0.5
 * 100% is represented as 1
 */
export type percent = number;

/**
 * The Point interface describes a two dimensional location.
 * It has two properties x and y, representing the x and y coordinate of the location.
 */
export interface Point {
	/**
	 * Represents the x coordinate of the location.
	 */
	x: number;

	/**
	 * Represents the y coordinate of the location.
	 */
	y: number;

	/**
	 * Represents the z coordinate of the location.
	 */
	z?: number;
}

/**
 * The Size interface describes abstract dimensions in two dimensional space.
 * It has two properties width and height, representing the width and height values of the size.
 */
export interface Size {
	/**
	 * Represents the width of the size.
	 */
	width: number;

	/**
	 * Represents the height of the size.
	 */
	height: number;
}

/**
 * Defines the data for the shownModally event.
 */
export interface ShownModallyData extends EventData {
	/**
	 * The context (optional, may be undefined) passed to the view when shown modally.
	 */
	context?: any;

	/**
	 * A callback to call when you want to close the modally shown view.
	 * Pass in any kind of arguments and you will receive when the callback parameter
	 * of View.showModal is executed.
	 */
	closeCallback?: Function;
}

/**
 * This class is the base class for all UI components.
 * A View occupies a rectangular area on the screen and is responsible for drawing and layouting of all UI components within.
 */
export abstract class View extends ViewBase {
	/**
	 * String value used when hooking to layoutChanged event.
	 */
	public static layoutChangedEvent: string;
	/**
	 * String value used when hooking to showingModally event.
	 */
	public static showingModallyEvent: string;

	/**
	 * String value used when hooking to shownModally event.
	 */
	public static shownModallyEvent: string;

	/**
	 * Gets the android-specific native instance that lies behind this proxy. Will be available if running on an Android platform.
	 */
	public android: any;

	/**
	 * Gets the ios-specific native instance that lies behind this proxy. Will be available if running on an iOS platform.
	 */
	public ios: any;

	/**
	 * Gets or sets the binding context of this instance. This object is used as a source for each Binding that does not have a source object specified.
	 */
	bindingContext: any;

	/**
	 * Gets or sets the border color of the view.
	 */
	borderColor: string | Color;

	/**
	 * Gets or sets the top border color of the view.
	 */
	borderTopColor: Color;

	/**
	 * Gets or sets the right border color of the view.
	 */
	borderRightColor: Color;

	/**
	 * Gets or sets the bottom border color of the view.
	 */
	borderBottomColor: Color;

	/**
	 * Gets or sets the left border color of the view.
	 */
	borderLeftColor: Color;

	/**
	 * Gets or sets the border width of the view.
	 */
	borderWidth: string | Length;

	/**
	 * Gets or sets the top border width of the view.
	 */
	borderTopWidth: Length;

	/**
	 * Gets or sets the right border width of the view.
	 */
	borderRightWidth: Length;

	/**
	 * Gets or sets the bottom border width of the view.
	 */
	borderBottomWidth: Length;

	/**
	 * Gets or sets the left border width of the view.
	 */
	borderLeftWidth: Length;

	/**
	 * Gets or sets the border radius of the view.
	 */
	borderRadius: string | Length;

	/**
	 * Gets or sets the top left border radius of the view.
	 */
	borderTopLeftRadius: Length;

	/**
	 * Gets or sets the top right border radius of the view.
	 */
	borderTopRightRadius: Length;

	/**
	 * Gets or sets the bottom right border radius of the view.
	 */
	borderBottomRightRadius: Length;

	/**
	 * Gets or sets the bottom left border radius of the view.
	 */
	borderBottomLeftRadius: Length;

	/**
	 * Gets or sets the color of the view.
	 */
	color: Color;

	/**
	 * Gets or sets the elevation of the android view.
	 */
	androidElevation: number;

	/**
	 * Gets or sets the dynamic elevation offset of the android view.
	 */
	androidDynamicElevationOffset: number;

	/**
	 * Gets or sets the background style property.
	 */
	background: string;

	/**
	 * Gets or sets the background color of the view.
	 */
	backgroundColor: string | Color;

	/**
	 * Gets or sets the background image of the view.
	 */
	backgroundImage: string | LinearGradient;

	/**
	 * Gets or sets the minimum width the view may grow to.
	 */
	minWidth: Length;

	/**
	 * Gets or sets the minimum height the view may grow to.
	 */
	minHeight: Length;

	/**
	 * Gets or sets the desired width of the view.
	 */
	width: PercentLength;

	/**
	 * Gets or sets the desired height of the view.
	 */
	height: PercentLength;

	/**
	 * Gets or sets margin style property.
	 */
	margin: string | PercentLength;

	/**
	 * Specifies extra space on the left side of this view.
	 */
	marginLeft: PercentLength;

	/**
	 * Specifies extra space on the top side of this view.
	 */
	marginTop: PercentLength;

	/**
	 * Specifies extra space on the right side of this view.
	 */
	marginRight: PercentLength;

	/**
	 * Specifies extra space on the bottom side of this view.
	 */
	marginBottom: PercentLength;

	/**
	 * Gets or sets the alignment of this view within its parent along the Horizontal axis.
	 */
	horizontalAlignment: HorizontalAlignment;

	/**
	 * Gets or sets the alignment of this view within its parent along the Vertical axis.
	 */
	verticalAlignment: VerticalAlignment;

	/**
	 * Gets or sets the visibility of the view.
	 */
	visibility: Visibility;

	/**
	 * Gets or sets the opacity style property.
	 */
	opacity: number;

	/**
	 * Gets or sets the rotate affine transform of the view along the Z axis.
	 */
	rotate: number;

	/**
	 * Gets or sets the rotate affine transform of the view along the X axis.
	 */
	rotateX: number;

	/**
	 * Gets or sets the rotate affine transform of the view along the Y axis.
	 */
	rotateY: number;

	/**
	 * Gets or sets the distance of the camera form the view perspective.
	 * Usually needed when rotating the view over the X or Y axis.
	 */
	perspective: number;

	/**
	 * Gets or sets the translateX affine transform of the view in device independent pixels.
	 */
	translateX: dip;

	/**
	 * Gets or sets the translateY affine transform of the view in device independent pixels.
	 */
	translateY: dip;

	/**
	 * Gets or sets the scaleX affine transform of the view.
	 */
	scaleX: number;

	/**
	 * Gets or sets the scaleY affine transform of the view.
	 */
	scaleY: number;

	//END Style property shortcuts

	/**
	 * Gets or sets the automation text of the view.
	 */
	automationText: string;

	/**
	 * Gets or sets the X component of the origin point around which the view will be transformed. The default value is 0.5 representing the center of the view.
	 */
	originX: number;

	/**
	 * Gets or sets the Y component of the origin point around which the view will be transformed. The default value is 0.5 representing the center of the view.
	 */
	originY: number;

	/**
	 * Gets or sets a value indicating whether the the view is enabled. This affects the appearance of the view.
	 */
	isEnabled: boolean;

	/**
	 * Gets or sets a value indicating whether the user can interact with the view. This does not affect the appearance of the view.
	 */
	isUserInteractionEnabled: boolean;

	/**
	 * Instruct container view to expand beyond the safe area. This property is iOS specific. Default value: false
	 */
	iosOverflowSafeArea: boolean;

	/**
	 * Enables or disables the iosOverflowSafeArea property for all children. This property is iOS specific. Default value: true
	 */
	iosOverflowSafeAreaEnabled: boolean;

	/**
	 * Gets is layout is valid. This is a read-only property.
	 */
	isLayoutValid: boolean;

	/**
	 * Gets the CSS fully qualified type name.
	 * Using this as element type should allow for PascalCase and kebap-case selectors, when fully qualified, to match the element.
	 */
	cssType: string;

	cssClasses: Set<string>;
	cssPseudoClasses: Set<string>;

	/**
	 * This is called to find out how big a view should be. The parent supplies constraint information in the width and height parameters.
	 * The actual measurement work of a view is performed in onMeasure(int, int), called by this method. Therefore, only onMeasure(int, int) can and must be overridden by subclasses.
	 * @param widthMeasureSpec    Horizontal space requirements as imposed by the parent
	 * @param heightMeasureSpec    Vertical space requirements as imposed by the parent
	 */
	public measure(widthMeasureSpec: number, heightMeasureSpec: number): void;

	/**
	 * Assign a size and position to a view and all of its descendants
	 * This is the second phase of the layout mechanism. (The first is measuring). In this phase, each parent calls layout on all of its children to position them. This is typically done using the child measurements that were stored in the measure pass().
	 * Derived classes should not override this method. Derived classes with children should override onLayout. In that method, they should call layout on each of their children.
	 * @param l Left position, relative to parent
	 * @param t Top position, relative to parent
	 * @param r Right position, relative to parent
	 * @param b Bottom position, relative to parent
	 */
	public layout(left: number, top: number, right: number, bottom: number, setFrame?: boolean): void;

	/**
	 * Returns the raw width component.
	 */
	public getMeasuredWidth(): number;

	/**
	 * Returns the raw height component.
	 */
	public getMeasuredHeight(): number;

	public getMeasuredState(): number;

	/**
	 * Measure the view and its content to determine the measured width and the measured height. This method is invoked by measure(int, int) and should be overriden by subclasses to provide accurate and efficient measurement of their contents.
	 * When overriding this method, you must call setMeasuredDimension(int, int) to store the measured width and height of this view. Failure to do so will trigger an exception, thrown by measure(int, int).
	 * @param widthMeasureSpec    horizontal space requirements as imposed by the parent. The requirements are encoded with View.MeasureSpec.
	 * @param heightMeasureSpec    vertical space requirements as imposed by the parent. The requirements are encoded with View.MeasureSpec.
	 */
	public onMeasure(widthMeasureSpec: number, heightMeasureSpec: number): void;

	/**
	 * Called from layout when this view should assign a size and position to each of its children. Derived classes with children should override this method and call layout on each of their children.
	 * @param left      Left position, relative to parent
	 * @param top       Top position, relative to parent
	 * @param right     Right position, relative to parent
	 * @param bottom    Bottom position, relative to parent
	 */
	public onLayout(left: number, top: number, right: number, bottom: number): void;

	/**
	 * This method must be called by onMeasure(int, int) to store the measured width and measured height. Failing to do so will trigger an exception at measurement time.
	 * @param measuredWidth        The measured width of this view. May be a complex bit mask as defined by MEASURED_SIZE_MASK and MEASURED_STATE_TOO_SMALL.
	 * @param measuredHeight    The measured height of this view. May be a complex bit mask as defined by MEASURED_SIZE_MASK and MEASURED_STATE_TOO_SMALL.
	 */
	public setMeasuredDimension(measuredWidth: number, measuredHeight: number): void;

	/**
	 * Called from onLayout when native view position is about to be changed.
	 * @param left      Left position, relative to parent
	 * @param top       Top position, relative to parent
	 * @param right     Right position, relative to parent
	 * @param bottom    Bottom position, relative to parent
	 */
	public layoutNativeView(left: number, top: number, right: number, bottom: number): void;

	/**
	 * Measure a child by taking into account its margins and a given measureSpecs.
	 * @param parent            This parameter is not used. You can pass null.
	 * @param child             The view to be measured.
	 * @param measuredWidth     The measured width that the parent layout specifies for this view.
	 * @param measuredHeight    The measured height that the parent layout specifies for this view.
	 */
	public static measureChild(parent: View, child: View, widthMeasureSpec: number, heightMeasureSpec: number): { measuredWidth: number; measuredHeight: number };

	/**
	 * Layout a child by taking into account its margins, horizontal and vertical alignments and a given bounds.
	 * @param parent    This parameter is not used. You can pass null.
	 * @param left      Left position, relative to parent
	 * @param top       Top position, relative to parent
	 * @param right     Right position, relative to parent
	 * @param bottom    Bottom position, relative to parent
	 */
	public static layoutChild(parent: View, child: View, left: number, top: number, right: number, bottom: number): void;

	/**
	 * Utility to reconcile a desired size and state, with constraints imposed
	 * by a MeasureSpec.  Will take the desired size, unless a different size
	 * is imposed by the constraints.  The returned value is a compound integer,
	 * with the resolved size in the MEASURED_SIZE_MASK bits and
	 * optionally the bit MEASURED_STATE_TOO_SMALL set if the resulting
	 * size is smaller than the size the view wants to be.
	 */
	public static resolveSizeAndState(size: number, specSize: number, specMode: number, childMeasuredState: number): number;

	public static combineMeasuredStates(curState: number, newState): number;

	/**
	 * Tries to focus the view.
	 * Returns a value indicating whether this view or one of its descendants actually took focus.
	 */
	public focus(): boolean;

	public getGestureObservers(type: GestureTypes): Array<GesturesObserver>;

	/**
	 * A basic method signature to hook an event listener (shortcut alias to the addEventListener method).
	 * @param eventNames - String corresponding to events (e.g. "propertyChange"). Optionally could be used more events separated by `,` (e.g. "propertyChange", "change") or you can use gesture types.
	 * @param callback - Callback function which will be executed when event is raised.
	 * @param thisArg - An optional parameter which will be used as `this` context for callback execution.
	 */
	on(eventNames: string | GestureTypes, callback: (args: EventData) => void, thisArg?: any);

	/**
	 * Removes listener(s) for the specified event name.
	 * @param eventNames Comma delimited names of the events or gesture types the specified listener is associated with.
	 * @param callback An optional parameter pointing to a specific listener. If not defined, all listeners for the event names will be removed.
	 * @param thisArg An optional parameter which when set will be used to refine search of the correct callback which will be removed as event listener.
	 */
	off(eventNames: string | GestureTypes, callback?: (args: EventData) => void, thisArg?: any);

	/**
	 * Raised when a loaded event occurs.
	 */
	on(event: 'loaded', callback: (args: EventData) => void, thisArg?: any);

	/**
	 * Raised when an unloaded event occurs.
	 */
	on(event: 'unloaded', callback: (args: EventData) => void, thisArg?: any);

	/**
	 * Raised when a back button is pressed.
	 * This event is raised only for android.
	 */
	on(event: 'androidBackPressed', callback: (args: EventData) => void, thisArg?: any);

	/**
	 * Raised before the view is shown as a modal dialog.
	 */
	on(event: 'showingModally', callback: (args: ShownModallyData) => void, thisArg?: any): void;

	/**
	 * Raised after the view is shown as a modal dialog.
	 */
	on(event: 'shownModally', callback: (args: ShownModallyData) => void, thisArg?: any);

	/**
	 * Returns the current modal view that this page is showing (is parent of), if any.
	 */
	modal: View;

	/**
	 * Animates one or more properties of the view based on the supplied options.
	 */
	public animate(options: AnimationDefinition): AnimationPromise;

	/**
	 * Creates an Animation object based on the supplied options.
	 */
	public createAnimation(options: AnimationDefinition): Animation;

	/**
	 * Returns the iOS safe area insets of this view.
	 */
	public getSafeAreaInsets(): { left; top; right; bottom };

	/**
	 * Returns the location of this view in the window coordinate system.
	 */
	public getLocationInWindow(): Point;

	/**
	 * Returns the location of this view in the screen coordinate system.
	 */
	public getLocationOnScreen(): Point;

	/**
	 * Returns the location of this view in the otherView's coordinate system.
	 */
	public getLocationRelativeTo(otherView: View): Point;

	/**
	 * Returns the actual size of the view in device-independent pixels.
	 */
	public getActualSize(): Size;

	/**
	 * Derived classes can override this method to handle Android back button press.
	 */
	onBackPressed(): boolean;

	/**
	 * @private
	 * A valid css string which will be applied for all nested UI components (based on css rules).
	 */
	css: string;

	/**
	 * @private
	 * Adds a new values to current css.
	 * @param cssString - A valid css which will be added to current css.
	 */
	addCss(cssString: string): void;

	/**
	 * @private
	 * Adds the content of the file to the current css.
	 * @param cssFileName - A valid file name (from the application root) which contains a valid css.
	 */
	addCssFile(cssFileName: string): void;

	/**
	 * @private
	 * Changes the current css to the content of the file.
	 * @param cssFileName - A valid file name (from the application root) which contains a valid css.
	 */
	changeCssFile(cssFileName: string): void;

	// Lifecycle events
	_getNativeViewsCount(): number;

	/**
	 * Internal method:
	 * Closes all modal views. Should be used by plugins like `nativescript-angular` which implement their own `modal views` service.
	 */
	_closeAllModalViewsInternal(): boolean;

	/**
	 * Internal method:
	 * Gets all modal views of the current view.
	 */
	_getRootModalViews(): Array<ViewBase>;

	_eachLayoutView(callback: (View) => void): void;

	/**
	 * iOS Only Internal method used to update various view details like background rerendering, border, etc.
	 */
	_onSizeChanged?(): void;

	/**
	 * Android only check if gesture observers are attached
	 */
	hasGestureObservers?(): boolean;

	/**
	 * Android only to set the touch listener
	 */
	setOnTouchListener?(): void;

	/**
	 * Iterates over children of type View.
	 * @param callback Called for each child of type View. Iteration stops if this method returns falsy value.
	 */
	public eachChildView(callback: (view: View) => boolean): void;

	//@private
	/**
	 * @private
	 */
	_modalParent?: View;
	/**
	 * @private
	 */
	isLayoutRequired: boolean;
	/**
	 * @private
	 */
	_gestureObservers: any;
	/**
	 * @private
	 * androidx.fragment.app.FragmentManager
	 */
	_manager: any;
	/**
	 * @private
	 */
	_setNativeClipToBounds(): void;
	/**
	 * Called by measure method to cache measureSpecs.
	 * @private
	 */
	_setCurrentMeasureSpecs(widthMeasureSpec: number, heightMeasureSpec: number): boolean;
	/**
	 * Called by layout method to cache view bounds.
	 * @private
	 */
	_setCurrentLayoutBounds(left: number, top: number, right: number, bottom: number): { boundsChanged: boolean; sizeChanged: boolean };
	/**
	 * Return view bounds.
	 * @private
	 */
	_getCurrentLayoutBounds(): {
		left: number;
		top: number;
		right: number;
		bottom: number;
	};
	/**
	 * @private
	 */
	_goToVisualState(state: string);
	/**
	 * @private
	 */
	_setNativeViewFrame(nativeView: any, frame: any): void;
	// _onStylePropertyChanged(property: dependencyObservable.Property): void;
	/**
	 * @private
	 */
	_updateEffectiveLayoutValues(parentWidthMeasureSize: number, parentWidthMeasureMode: number, parentHeightMeasureSize: number, parentHeightMeasureMode: number): void;
	/**
	 * @private
	 */
	_currentWidthMeasureSpec: number;
	/**
	 * @private
	 */
	_currentHeightMeasureSpec: number;
	/**
	 * @private
	 */
	_setMinWidthNative(value: Length): void;
	/**
	 * @private
	 */
	_setMinHeightNative(value: Length): void;
	/**
	 * @private
	 */
	_redrawNativeBackground(value: any): void;
	/**
	 * @private
	 */
	_removeAnimation(animation: Animation): boolean;
	/**
	 * @private
	 */
	_onLivesync(context?: { type: string; path: string }): boolean;
	/**
	 * @private
	 */
	_getFragmentManager(): any; /* androidx.fragment.app.FragmentManager */
	_handleLivesync(context?: { type: string; path: string }): boolean;

	/**
	 * Updates styleScope or create new styleScope.
	 * @param cssFileName
	 * @param cssString
	 * @param css
	 */
	_updateStyleScope(cssFileName?: string, cssString?: string, css?: string): void;

	/**
	 * Called in android when native view is attached to window.
	 */
	_onAttachedToWindow(): void;

	/**
	 * Called in android when native view is dettached from window.
	 */
	_onDetachedFromWindow(): void;

	/**
	 * Checks whether the current view has specific view for an ancestor.
	 */
	_hasAncestorView(ancestorView: View): boolean;
	//@endprivate

	/**
	 * __Obsolete:__ There is a new property system that does not rely on _getValue.
	 */
	_getValue(property: any): never;

	/**
	 * __Obsolete:__ There is a new property system that does not rely on _setValue.
	 */
	_setValue(property: any, value: any): never;
}

/**
 * Base class for all UI components that are containers.
 */
export class ContainerView extends View {
	/**
	 * Instruct container view to expand beyond the safe area. This property is iOS specific. Default value: true
	 */
	public iosOverflowSafeArea: boolean;
}

/**
 * Base class for all UI components that implement custom layouts.
 */
export class CustomLayoutView extends ContainerView {
	//@private
	/**
	 * @private
	 */
	_updateNativeLayoutParams(child: View): void;
	/**
	 * @private
	 */
	_setChildMinWidthNative(child: View, value: Length): void;
	/**
	 * @private
	 */
	_setChildMinHeightNative(child: View, value: Length): void;
	//@endprivate
}

/**
 * Defines an interface for a View factory function.
 * Commonly used to specify the visualization of data objects.
 */
export interface Template {
	/**
	 * Call signature of the factory function.
	 * Returns a new View instance.
	 */
	(): View;
}

/**
 * Defines an interface for Template with a key.
 */
export interface KeyedTemplate {
	/**
	 * The unique key of the template.
	 */
	key: string;

	/**
	 * The function that creates the view.
	 */
	createView: Template;
}

/**
 * Defines an interface for adding arrays declared in xml.
 */
export interface AddArrayFromBuilder {
	/**
	 * A function that is called when an array declaration is found in xml.
	 * @param name - Name of the array.
	 * @param value - The actual value of the array.
	 */
	_addArrayFromBuilder(name: string, value: Array<any>): void;
}

/**
 * Defines an interface for adding a child element declared in xml.
 */
export interface AddChildFromBuilder {
	/**
	 * Called for every child element declared in xml.
	 * This method will add a child element (value) to current element.
	 * @param name - Name of the element.
	 * @param value - Value of the element.
	 */
	_addChildFromBuilder(name: string, value: any): void;
}

export const automationTextProperty: Property<View, string>;
export const originXProperty: Property<View, number>;
export const originYProperty: Property<View, number>;
export const isEnabledProperty: Property<View, boolean>;
export const isUserInteractionEnabledProperty: Property<View, boolean>;
export const iosOverflowSafeAreaProperty: Property<View, boolean>;
export const iosOverflowSafeAreaEnabledProperty: InheritedProperty<View, boolean>;
