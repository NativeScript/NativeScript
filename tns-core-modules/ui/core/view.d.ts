declare module "ui/core/view" {
    import style = require("ui/styling");
    import dependencyObservable = require("ui/core/dependency-observable");
    import proxy = require("ui/core/proxy");
    import gestures = require("ui/gestures");
    import color = require("color");
    import observable = require("data/observable");
    import animation = require("ui/animation");
    import keyframeAnimationModule = require("ui/animation/keyframe-animation");

    /**
     * Gets a child view by id.
     * @param view - The parent (container) view of the view to look for.
     * @param id - The id of the view to look for.
     * Returns an instance of a view (if found), otherwise undefined.
     */
    export function getViewById(view: View, id: string): View;

    /**
     * Iterates through all child views (via visual tree) and executes a function.
     * @param view - Starting view (parent container).
     * @param callback - A function to execute on every child. If function returns false it breaks the iteration.
     */
    export function eachDescendant(view: View, callback: (child: View) => boolean);

    /**
     * Gets an ancestor from a given type.
     * @param view - Starting view (child view).
     * @param criterion - The type of ancestor view we are looking for. Could be a string containing a class name or an actual type.
     * Returns an instance of a view (if found), otherwise undefined.
     */
    export function getAncestor(view: View, criterion: string | Function): View;

    export function isEventOrGesture(name: string, view: View): boolean;

    export function PseudoClassHandler(... pseudoClasses: string[]): MethodDecorator;

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
     * This class is the base class for all UI components. 
     * A View occupies a rectangular area on the screen and is responsible for drawing and layouting of all UI components within. 
     */
    export class View extends proxy.ProxyObject implements ApplyXmlAttributes {
        /**
         * Gets or sets the border color of the view.
         */
        borderColor: string | color.Color;
        
        /**
         * Gets or sets the top border color of the view.
         */
        borderTopColor: color.Color;
        
        /**
         * Gets or sets the right border color of the view.
         */
        borderRightColor: color.Color;
        
        /**
         * Gets or sets the bottom border color of the view.
         */
        borderBottomColor: color.Color;
        
        /**
         * Gets or sets the left border color of the view.
         */
        borderLeftColor: color.Color;

        /**
         * Gets or sets the border width of the view.
         */
        borderWidth: string | number;

        /**
         * Gets or sets the top border width of the view.
         */
        borderTopWidth: number;

        /**
         * Gets or sets the right border width of the view.
         */
        borderRightWidth: number;

        /**
         * Gets or sets the bottom border width of the view.
         */
        borderBottomWidth: number;

        /**
         * Gets or sets the left border width of the view.
         */
        borderLeftWidth: number;

        /**
         * Gets or sets the border radius of the view.
         */
        borderRadius: string | number;

        /**
         * Gets or sets the top left border radius of the view.
         */
        borderTopLeftRadius: number;

        /**
         * Gets or sets the top right border radius of the view.
         */
        borderTopRightRadius: number;

        /**
         * Gets or sets the bottom right border radius of the view.
         */
        borderBottomRightRadius: number;

        /**
         * Gets or sets the bottom left border radius of the view.
         */
        borderBottomLeftRadius: number;

        /**
         * Gets or sets the automation text of the view.
         */
        automationText: string;

        /**
         * String value used when hooking to loaded event.
         */
        public static loadedEvent: string;

        /**
         * String value used when hooking to unloaded event.
         */
        public static unloadedEvent: string;

        /**
         * Represents the observable property backing the automationText property of each View.
         */
        public static automationTextProperty: dependencyObservable.Property;

        /**
         * Represents the observable property backing the id property of each View.
         */
        public static idProperty: dependencyObservable.Property;

        /**
         * [Deprecated. Please use className instead.] Represents the observable property backing the cssClass property of each View.
         */
        public static cssClassProperty: dependencyObservable.Property;

        /**
         * Represents the observable property backing the className property of each View.
         */
        public static classNameProperty: dependencyObservable.Property;

        /**
         * Represents the observable property backing the isEnabled property of each View.
         */
        public static isEnabledProperty: dependencyObservable.Property;

        /**
         * Represents the observable property backing the isUserInteractionEnabled property of each View.
         */
        public static isUserInteractionEnabledProperty: dependencyObservable.Property;

        //----------Style property shortcuts----------

        /**
         * Gets or sets the color of the view.
         */
        color: color.Color;
        
        /**
         * Gets or sets the background color of the view.
         */
        backgroundColor: color.Color;

        /**
         * Gets or sets the background image of the view.
         */
        backgroundImage: string;
                
        /**
         * Gets or sets the minimum width the view may grow to.
         */
        minWidth: number;

        /**
         * Gets or sets the minimum height the view may grow to.
         */
        minHeight: number;

        /**
         * Gets or sets the desired width of the view.
         */
        width: number;

        /**
         * Gets or sets the desired height of the view.
         */
        height: number;

        /**
         * Gets or sets margin style property.
         */
        margin: string;

        /**
         * Specifies extra space on the left side of this view.
         */
        marginLeft: number;

        /**
         * Specifies extra space on the top side of this view.
         */
        marginTop: number;

        /**
         * Specifies extra space on the right side of this view.
         */
        marginRight: number;

        /**
         * Specifies extra space on the bottom side of this view.
         */
        marginBottom: number;

        /**
         * Gets or sets the alignment of this view within its parent along the Horizontal axis.
         */
        horizontalAlignment: string;

        /**
         * Gets or sets the alignment of this view within its parent along the Vertical axis.
         */
        verticalAlignment: string;

        /**
         * Gets or sets the visibility of the view.
         */
        visibility: string;

        /**
         * Gets or sets the opacity style property.
         */
        opacity: number;
        
        //----------Style property shortcuts----------

        /**
         * Gets or sets the translateX affine transform of the view.
         */
        translateX: number;

        /**
         * Gets or sets the translateY affine transform of the view.
         */
        translateY: number;

        /**
         * Gets or sets the scaleX affine transform of the view.
         */
        scaleX: number;

        /**
         * Gets or sets the scaleY affine transform of the view.
         */
        scaleY: number;

        /**
         * Gets or sets the X component of the origin point around which the view will be transformed. The deafault value is 0.5 representing the center of the view.
         */
        originX: number;

        /**
         * Gets or sets the Y component of the origin point around which the view will be transformed. The deafault value is 0.5 representing the center of the view.
         */
        originY: number;

        /**
         * Gets or sets the rotate affine transform of the view.
         */
        rotate: number;

        /**
         * Gets or sets a value indicating whether the the view is enabled. This affects the appearance of the view.
         */
        isEnabled: boolean;

        /**
         * Gets or sets a value indicating whether the user can interact with the view. This does not affect the appearance of the view.
         */
        isUserInteractionEnabled: boolean;

        /**
         * Gets or sets the id for this view.
         */
        id: string;

        /**
         * [Deprecated. Please use className instead.] Gets or sets the CSS class for this view.
         */
        cssClass: string;

        /**
         * Gets or sets the CSS class name for this view.
         */
        className: string;

        /**
         * Gets the style object associated to this view.
         */
        style: style.Style;

        /**
         * Gets the View instance that parents this view. This property is read-only.
         */
        parent: View;

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
         * Gets owner page. This is a read-only property.
         */
        page: View;

        /**
         * This is called to find out how big a view should be. The parent supplies constraint information in the width and height parameters.
         * The actual measurement work of a view is performed in onMeasure(int, int), called by this method. Therefore, only onMeasure(int, int) can and must be overridden by subclasses.
         * @param widthMeasureSpec	Horizontal space requirements as imposed by the parent
         * @param heightMeasureSpec	Vertical space requirements as imposed by the parent
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
        public layout(left: number, top: number, right: number, bottom: number): void;

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
         * Call this when something has changed which has invalidated the layout of this view. This will schedule a layout pass of the view tree.
         */
        public requestLayout(): void;

        /**
         * Measure the view and its content to determine the measured width and the measured height. This method is invoked by measure(int, int) and should be overriden by subclasses to provide accurate and efficient measurement of their contents.
         * When overriding this method, you must call setMeasuredDimension(int, int) to store the measured width and height of this view. Failure to do so will trigger an exception, thrown by measure(int, int).
         * @param widthMeasureSpec	horizontal space requirements as imposed by the parent. The requirements are encoded with View.MeasureSpec.
         * @param heightMeasureSpec	vertical space requirements as imposed by the parent. The requirements are encoded with View.MeasureSpec.
         */
        public onMeasure(widthMeasureSpec: number, heightMeasureSpec: number): void;

        /**
         * Called from layout when this view should assign a size and position to each of its children. Derived classes with children should override this method and call layout on each of their children.
         * @param left      Left position, relative to parent
         * @param top       Top position, relative to parent
         * @param right     Right position, relative to parent
         * @param bottom	Bottom position, relative to parent
         */
        public onLayout(left: number, top: number, right: number, bottom: number): void;

        /**
         * This method must be called by onMeasure(int, int) to store the measured width and measured height. Failing to do so will trigger an exception at measurement time.
         * @param measuredWidth	    The measured width of this view. May be a complex bit mask as defined by MEASURED_SIZE_MASK and MEASURED_STATE_TOO_SMALL.
         * @param measuredHeight	The measured height of this view. May be a complex bit mask as defined by MEASURED_SIZE_MASK and MEASURED_STATE_TOO_SMALL.
         */
        public setMeasuredDimension(measuredWidth: number, measuredHeight: number): void;

        /**
         * Called from onLayout when native view position is about to be changed.
         * @param parent    This parameter is not used. You can pass null.
         * @param left      Left position, relative to parent
         * @param top       Top position, relative to parent
         * @param right     Right position, relative to parent
         * @param bottom	Bottom position, relative to parent
         */
        public layoutNativeView(left: number, top: number, right: number, bottom: number): void;

        /**
         * Measure a child by taking into account its margins and a given measureSpecs.
         * @param parent            This parameter is not used. You can pass null.
         * @param child             The view to be measured.
         * @param measuredWidth	    The measured width that the parent layout specifies for this view.
         * @param measuredHeight	The measured height that the parent layout specifies for this view.
         */
        public static measureChild(parent: View, child: View, widthMeasureSpec: number, heightMeasureSpec: number): { measuredWidth: number; measuredHeight: number };
        
        /**
         * Layout a child by taking into account its margins, horizontal and vertical alignments and a given bounds.
         * @param parent    This parameter is not used. You can pass null.
         * @param left      Left position, relative to parent
         * @param top       Top position, relative to parent
         * @param right     Right position, relative to parent
         * @param bottom	Bottom position, relative to parent
         */
        public static layoutChild(parent: View, child: View, left: number, top: number, right: number, bottom: number): void;

        /**
         * Changes the width, height and margins of the child to one calculated from percentage values.
         *
         * @param widthMeasureSpec  Width MeasureSpec of the parent layout.
         * @param heightMeasureSpec Height MeasureSpec of the parent layout.
         */
        protected static adjustChildLayoutParams(view: View, widthMeasureSpec: number, heightMeasureSpec: number): void;

        /**
         * Restores the original dimensions of the child that were changed for percentage values.
         */
        protected static restoreChildOriginalParams(view: View): void;

        /**
         * Utility to reconcile a desired size and state, with constraints imposed
         * by a MeasureSpec.  Will take the desired size, unless a different size
         * is imposed by the constraints.  The returned value is a compound integer,
         * with the resolved size in the {@link #MEASURED_SIZE_MASK} bits and
         * optionally the bit {@link #MEASURED_STATE_TOO_SMALL} set if the resulting
         * size is smaller than the size the view wants to be.
         */
        public static resolveSizeAndState(size: number, specSize: number, specMode: number, childMeasuredState: number): number;

        public static combineMeasuredStates(curState: number, newState): number;

        /**
         * Returns the child view with the specified id.
         */
        public getViewById<T extends View>(id: string): T;

        /**
         * Tries to focus the view.
         * Returns a value indicating whether this view or one of its descendants actually took focus.
         */
        public focus(): boolean;

        /**
         * Sets in-line CSS string as style.
         * @param style - In-line CSS string. 
         */
        public setInlineStyle(style: string): void;

        public getGestureObservers(type: gestures.GestureTypes): Array<gestures.GesturesObserver>;

        /**
         * [Deprecated. Please use the on() instead.] Adds a gesture observer.
         * @param type - Type of the gesture.
         * @param callback - A function that will be executed when gesture is received.
         * @param thisArg - An optional parameter which will be used as `this` context for callback execution. 
         */
        observe(type: gestures.GestureTypes, callback: (args: gestures.GestureEventData) => void, thisArg?: any);

        /**
         * A basic method signature to hook an event listener (shortcut alias to the addEventListener method).
         * @param eventNames - String corresponding to events (e.g. "propertyChange"). Optionally could be used more events separated by `,` (e.g. "propertyChange", "change") or you can use gesture types. 
         * @param callback - Callback function which will be executed when event is raised.
         * @param thisArg - An optional parameter which will be used as `this` context for callback execution.
         */
        on(eventNames: string | gestures.GestureTypes, callback: (data: observable.EventData) => void, thisArg?: any);
        
        /**
         * Removes listener(s) for the specified event name.
         * @param eventNames Comma delimited names of the events or gesture types the specified listener is associated with.
         * @param callback An optional parameter pointing to a specific listener. If not defined, all listeners for the event names will be removed.
         * @param thisArg An optional parameter which when set will be used to refine search of the correct callback which will be removed as event listener.
         */
        off(eventNames: string | gestures.GestureTypes, callback?: (data: observable.EventData) => void, thisArg?: any);

        /**
         * Raised when a loaded event occurs.
         */
        on(event: "loaded", callback: (args: observable.EventData) => void, thisArg?: any);

        /**
         * Raised when an unloaded event occurs.
         */
        on(event: "unloaded", callback: (args: observable.EventData) => void, thisArg?: any);

        /**
         * Animates one or more properties of the view based on the supplied options. 
         */
        public animate(options: animation.AnimationDefinition): animation.AnimationPromise;
        
        /**
         * Creates an Animation object based on the supplied options. 
         */
        public createAnimation(options: animation.AnimationDefinition): animation.Animation;

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
         * @protected
         * @unstable
         * A widget can call this method to add a matching css pseudo class.
         */
        public addPseudoClass(name: string): void;

        /**
         * @protected
         * @unstable
         * A widget can call this method to discard mathing css pseudo class.
         */
        public deletePseudoClass(name: string): void;
        
        // Lifecycle events
        onLoaded(): void;
        onUnloaded(): void;
        isLoaded: boolean;

        _addView(view: View, atIndex?: number);
        _propagateInheritableProperties(view: View);
        _inheritProperties(parentView: View);
        _removeView(view: View);
        _context: any /* android.content.Context */;

        _childIndexToNativeChildIndex(index?: number): number;
        _getNativeViewsCount(): number;

        _eachLayoutView(callback: (View) => void): void;

        _addToSuperview(superview: any, index?: number): boolean;
        _removeFromSuperview();

        public _applyXmlAttribute(attribute: string, value: any): boolean;

        //@private
        isLayoutRequired: boolean;
        _parentChanged(oldParent: View): void;
        _gestureObservers: any;
        _isInheritedChange(): boolean;
        _domId: number;

        _cssState: any /* "ui/styling/style-scope" */;
        _onCssStateChange(previous: any /* "ui/styling/style-scope" */, any /* "ui/styling/style-scope" */);

        _registerAnimation(animation: keyframeAnimationModule.KeyframeAnimation);
        _unregisterAnimation(animation: keyframeAnimationModule.KeyframeAnimation);
        _unregisterAllAnimations();

        _isAddedToNativeVisualTree: boolean;

        /**
         * Performs the core logic of adding a child view to the native visual tree. Returns true if the view's native representation has been successfully added, false otherwise.
         */
        _addViewToNativeVisualTree(view: View, atIndex?: number): boolean;
        _removeViewFromNativeVisualTree(view: View): void;

        _eachChildView(callback: (child: View) => boolean);
        _childrenCount: number;

        _onAttached(context: any /* android.content.Context */): void;
        _onContextChanged(): void;
        _onDetached(force?: boolean): void;
        _createUI(): void;

        _shouldApplyStyleHandlers();
        _checkMetadataOnPropertyChanged(metadata: dependencyObservable.PropertyMetadata);

        _updateLayout(): void;

        /**
         * Called by measure method to cache measureSpecs.
         */
        _setCurrentMeasureSpecs(widthMeasureSpec: number, heightMeasureSpec: number): boolean;

        /**
         * Called by layout method to cache view bounds.
         */
        _setCurrentLayoutBounds(left: number, top: number, right: number, bottom: number): void;

        /**
         * Return view bounds.
         */
        _getCurrentLayoutBounds(): { left: number; top: number; right: number; bottom: number };

        _goToVisualState(state: string);
        _nativeView: any;
        _isVisible: boolean;
        _setNativeViewFrame(nativeView: any, frame: any): void;
        _onStylePropertyChanged(property: dependencyObservable.Property): void;
        //@endprivate
    }

    /**
     * Base class for all UI components that implements custom layouts. 
     */
    export class CustomLayoutView extends View {
    }

    /**
     * Defines an interface for a View factory function.
     * Commonly used to specify the visualization of data objects.
     */
    interface Template {
        /**
         * Call signature of the factory function.
         * Returns a new View instance.
         */
        (): View;
    }

    /**
     * Defines an interface for Template with a key.
     */
    interface KeyedTemplate {
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
    interface AddArrayFromBuilder {
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
    interface AddChildFromBuilder {
        /**
         * Called for every child element declared in xml.
         * This method will add a child element (value) to current element.
         * @param name - Name of the element.
         * @param value - Value of the element.
         */
        _addChildFromBuilder(name: string, value: any): void;
    }

    /**
     * Defines an interface used to create a member of a class from string representation (used in xml declaration).
     */
    interface ApplyXmlAttributes {
        /**
         * Called for every attribute in xml declaration. <... fontAttributes="bold" ../>
         * @param attributeName - the name of the attribute (fontAttributes)
         * @param attrValue - the value of the attribute (bold)
         * Should return true if this attribute is handled and there is no need default handler to process it.
         */
        _applyXmlAttribute(attributeName: string, attrValue: any): boolean;
    }
}
