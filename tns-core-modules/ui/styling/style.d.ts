declare module "ui/styling/style" {
    import { Observable } from "data/observable";
    import { ViewBase } from "ui/core/view-base";
    import { Color } from "color";
    import { CssProperty, InheritedCssProperty } from "ui/core/properties";
    import { Font } from "ui/styling/font";
    import { Background } from "ui/styling/background";
    import { Length } from "ui/core/view";
    
    export interface Thickness {
        left: number;
        top: number;
        right: number;
        bottom: number;
    }

    export interface BorderColor {
        top: Color;
        right: Color;
        bottom: Color;
        left: Color;
    }

    export interface CommonLayoutParams {
        width: number;
        height: number;

        widthPercent: number;
        heightPercent: number;

        leftMargin: number;
        topMargin: number;
        rightMargin: number;
        bottomMargin: number;

        leftMarginPercent: number;
        topMarginPercent: number;
        rightMarginPercent: number;
        bottomMarginPercent: number;

        horizontalAlignment: "left" | "center" | "middle" | "right" | "stretch";
        verticalAlignment: "top" | "center" | "middle" | "bottom" | "stretch";
    }

    export class Style extends Observable {

        public rotate: number;
        public scaleX: number;
        public scaleY: number;
        public translateX: number;
        public translateY: number;

        public clipPath: string;
        public color: Color;
        public tintColor: Color;
        public placeholderColor: Color;

        public backgroundColor: Color;
        public backgroundImage: string;
        public backgroundRepeat: string;
        public backgroundSize: string;
        public backgroundPosition: string;

        public borderColor: string | Color;
        public borderTopColor: Color;
        public borderRightColor: Color;
        public borderBottomColor: Color;
        public borderLeftColor: Color;
        public borderWidth: string | number;
        public borderTopWidth: number;
        public borderRightWidth: number;
        public borderBottomWidth: number;
        public borderLeftWidth: number;
        public borderRadius: string | number;
        public borderTopLeftRadius: number;
        public borderTopRightRadius: number;
        public borderBottomRightRadius: number;
        public borderBottomLeftRadius: number;

        public fontSize: number;
        public fontFamily: string;
        public fontStyle: string;
        public fontWeight: string;
        public font: string;

        public zIndex: number;
        public opacity: number;
        public visibility: string;

        public textAlignment: string;
        public textDecoration: string;
        public textTransform: string;
        public letterSpacing: number;
        public whiteSpace: string;

        // TODO: Change minWidth/Height to Length to support 'px'
        public minWidth: number;
        public minHeight: number;
        public width: Length;
        public height: Length;
        public margin: string;
        public marginLeft: Length;
        public marginTop: Length;
        public marginRight: Length;
        public marginBottom: Length;
        public padding: string;
        public paddingLeft: Length;
        public paddingTop: Length;
        public paddingRight: Length;
        public paddingBottom: Length;
        public horizontalAlignment: "left" | "center" | "middle" | "right" | "stretch";
        public verticalAlignment: "top" | "center" | "middle" | "bottom" | "stretch";

        // TabView-specific props
        public tabTextColor: Color;
        public tabBackgroundColor: Color;
        public selectedTabTextColor: Color;
        public androidSelectedTabHighlightColor: Color;

        //SegmentedBar-specific props
        public selectedBackgroundColor: Color;

        constructor(ownerView: ViewBase);
        public view: ViewBase;

        // public _beginUpdate();
        // public _endUpdate();
        // public _resetCssValues(): void;
        // public _syncNativeProperties(): void;
        // public _inheritStyleProperty(property: Property): void;
        // public _inheritStyleProperties(parent: View): void;
        // public _boundsChanged(): void;
        // public _updateTextDecoration(): void;
        // public _updateTextTransform(): void;
    }

    // export function registerNoStylingClass(className);
    // export function getHandler(property: Property, view: View): StylePropertyChangedHandler;
    // Property registration

    export let rotateProperty: CssProperty<Style, number>;
    export let scaleXProperty: CssProperty<Style, number>;
    export let scaleYProperty: CssProperty<Style, number>;
    export let translateXProperty: CssProperty<Style, number>;
    export let translateYProperty: CssProperty<Style, number>;

    export let clipPathProperty: CssProperty<Style, string>;
    export let colorProperty: InheritedCssProperty<Style, Color>;
    export let tintColorProperty: InheritedCssProperty<Style, Color>;
    export let placeholderColorProperty: InheritedCssProperty<Style, Color>;

    export let backgroundColorProperty: CssProperty<Style, Color>;
    export let backgroundImageProperty: CssProperty<Style, string>;
    export let backgroundRepeatProperty: CssProperty<Style, string>;
    export let backgroundSizeProperty: CssProperty<Style, string>;
    export let backgroundPositionProperty: CssProperty<Style, string>;

    export let borderColorProperty: CssProperty<Style, Color>;
    export let borderTopColorProperty: CssProperty<Style, Color>;
    export let borderRightColorProperty: CssProperty<Style, Color>;
    export let borderBottomColorProperty: CssProperty<Style, Color>;
    export let borderLeftColorProperty: CssProperty<Style, Color>;
    
    export let borderWidthProperty: CssProperty<Style, number>;
    export let borderTopWidthProperty: CssProperty<Style, number>;
    export let borderRightWidthProperty: CssProperty<Style, number>;
    export let borderBottomWidthProperty: CssProperty<Style, number>;
    export let borderLeftWidthProperty: CssProperty<Style, number>;

    export let borderRadiusProperty: CssProperty<Style, number>;
    export let borderTopLeftRadiusProperty: CssProperty<Style, number>;
    export let borderTopRightRadiusProperty: CssProperty<Style, number>;
    export let borderBottomRightRadiusProperty: CssProperty<Style, number>;
    export let borderBottomLeftRadiusProperty: CssProperty<Style, number>; 

    // Helper property holding most layout related properties available in CSS.
    // When layout related properties are set in CSS we chache them and send them to the native view in a single call.
    export var nativeLayoutParamsProperty: styleProperty.Property;
    export var widthProperty: styleProperty.Property;
    export var heightProperty: styleProperty.Property;
    export var verticalAlignmentProperty: styleProperty.Property;
    export var horizontalAlignmentProperty: styleProperty.Property;
    export var marginLeftProperty: styleProperty.Property;
    export var marginRightProperty: styleProperty.Property;
    export var marginTopProperty: styleProperty.Property;
    export var marginBottomProperty: styleProperty.Property;

    export let zIndexProperty: CssProperty<Style, number>;
    export let visibilityProperty: CssProperty<Style, string>;
    export let opacityProperty: CssProperty<Style, number>;

    export let textAlignmentProperty: InheritedCssProperty<Style, string>;
    export let textDecorationProperty: CssProperty<Style, string>;
    export let textTransformProperty: CssProperty<Style, string>;
    export let letterSpacingProperty: CssProperty<Style, number>;
    export let whiteSpaceProperty: CssProperty<Style, string>;

    export let minWidthProperty: CssProperty<Style, number>;
    export let minHeightProperty: CssProperty<Style, number>;
    export let widthProperty: CssProperty<Style, number>;
    export let heightProperty: CssProperty<Style, Length>;
    export let marginProperty: CssProperty<Style, string>;
    export let marginLeftProperty: CssProperty<Style, Length>;
    export let marginRightProperty: CssProperty<Style, Length>;
    export let marginTopProperty: CssProperty<Style, Length>;
    export let marginBottomProperty: CssProperty<Style, Length>;

    export let paddingProperty: CssProperty<Style, string>;
    export let paddingLeftProperty: CssProperty<Style, Length>;
    export let paddingRightProperty: CssProperty<Style, Length>;
    export let paddingTopProperty: CssProperty<Style, Length>;
    export let paddingBottomProperty: CssProperty<Style, Length>;

    export let verticalAlignmentProperty: CssProperty<Style, string>;
    export let horizontalAlignmentProperty: CssProperty<Style, string>;

    // /**
    //  * Represents an object that defines how style property should be applied on a native view/widget.
    //  */
    // export class StylePropertyChangedHandler {
    //     /**
    //      * Creates a new StylePropertyChangedHandler object.
    //      * @param applyCallback - called when a property value should be applied onto the native view/widget.
    //      * @param resetCallback - called when the property value is cleared to restore the native view/widget in its original state. The callback
    //      * also receives as a parameter the value stored by the getNativeValue callback.
    //      * @param getNativeValue - called when a style property is set for the first time to get the default native value for this property
    //      * in the native view/widget. This value will be passed to resetCallback in case the property value is cleared. Optional.
    //      */
    //     constructor(applyCallback: (view: View, newValue: any) => void,
    //         resetCallback: (view: View, nativeValue: any) => void,
    //         getNativeValue?: (view: View) => any);
    // }

    // /**
    //  * Represents a sceleton for an object that holds all style related callbacks and registers handlers.
    //  * Used for better code readability.
    //  */
    // export class Styler {
    //     public static registerHandlers();
    // }

    // /**
    //  * A function that actually registers a property with a StylePropertyChangedHandler.
    //  * @param property - Usually a style dependency property which should be registered for style changes.
    //  * @param handler - The handler that reacts on property changes.
    //  * @param className(optional) - This parameter (when set) registers handler only for the class with that name and all its inheritors.
    //  */
    // export function registerHandler(property: Property, handler: StylePropertyChangedHandler, className?: string);

    // export var ignorePropertyHandler;
}
