declare module "ui/core/view-base" {
    import { Property, InheritedProperty, Style } from "ui/core/properties";
    import { BindingOptions, Observable } from "ui/core/bindable";

    import { SelectorCore } from "ui/styling/css-selector";
    import { isIOS, isAndroid } from "platform";

    import { KeyframeAnimation } from "ui/animation/keyframe-animation";
    import { Page } from "ui/page";
    import { layout } from "utils/utils";

    import { Color } from "color";

    export { isIOS, isAndroid, layout, Color };
    export * from "ui/core/properties";
    export * from "ui/core/bindable";

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

    export abstract class ViewBase extends Observable {

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

        public ios: any;
        public android: any;
        public nativeView: any;
        public bindingContext: any;
        public recycleNativeView: boolean;

        /**
         * Gets the name of the constructor function for this instance. E.g. for a Button class this will return "Button".
         */
        public typeName: string;

        /**
         * Gets the parent view. This property is read-only.
         */
        public readonly parent: ViewBase;

        /**
         * Gets or sets the id for this view.
         */
        public id: string;

        /**
         * Gets or sets the CSS class name for this view.
         */
        public className: string;

        /**
         * Gets or sets inline style selectors for this view.   
         */
        public inlineStyleSelector: SelectorCore;

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

        public onLoaded(): void;
        public onUnloaded(): void;

        public bind(options: BindingOptions, source?: Object): void;
        public unbind(property: string): void;

        public requestLayout(): void;
        public eachChild(callback: (child: ViewBase) => boolean): void;

        public _addView(view: ViewBase, atIndex?: number): void;
        public _removeView(view: ViewBase): void;
        public _parentChanged(oldParent: ViewBase): void;

        _domId: number;

        _cssState: any /* "ui/styling/style-scope" */;
        _setCssState(next: any /* "ui/styling/style-scope" */);
        _registerAnimation(animation: KeyframeAnimation);
        _unregisterAnimation(animation: KeyframeAnimation);
        _cancelAllAnimations();

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
         * Creates a native view
         */
        _createNativeView(): void;

        /**
         * Clean up references to the native view.
         */
        _disposeNativeView(): void;

        /**
         * Initializes properties/listeners of the native view.
         */
        _initNativeView(): void;

        /**
         * Resets properties/listeners set to the native view.
         */
        _resetNativeView(): void;

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
         * A widget can call this method to discard mathing css pseudo class.
         */
        public deletePseudoClass(name: string): void;

        //@private
        public _styleScope: any;
        //@endprivate
    }

    export const idProperty: Property<ViewBase, string>;
    export const classNameProperty: Property<ViewBase, string>;
    export const bindingContextProperty: InheritedProperty<ViewBase, any>;

    /**
     * Converts string into boolean value.
     * Throws error if value is not 'true' or 'false'.
     */
    export function booleanConverter(v: string): boolean;
}