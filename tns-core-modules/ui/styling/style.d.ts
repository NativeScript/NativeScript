declare module "ui/styling/style" {
    import { Observable } from "data/observable";
    import { ViewBase } from "ui/core/view-base";
    import { Color } from "color";
    import { Font } from "ui/styling/font";
    import { Background } from "ui/styling/background";
    import { Length, PercentLength } from "ui/core/view";
    
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

        public fontInternal: Font;
        public backgroundInternal: Background;

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
        public backgroundRepeat: "repeat" | "repeat-x" | "repeat-y" | "no-repeat";;
        public backgroundSize: string;
        public backgroundPosition: string;

        public borderColor: string | Color;
        public borderTopColor: Color;
        public borderRightColor: Color;
        public borderBottomColor: Color;
        public borderLeftColor: Color;
        public borderWidth: string | number;
        public borderTopWidth: Length;
        public borderRightWidth: Length;
        public borderBottomWidth: Length;
        public borderLeftWidth: Length;
        public borderRadius: string | number;
        public borderTopLeftRadius: number;
        public borderTopRightRadius: number;
        public borderBottomRightRadius: number;
        public borderBottomLeftRadius: number;

        public fontSize: number;
        public fontFamily: string;
        public fontStyle: "normal" | "italic";
        public fontWeight: "100" | "200" | "300" | "normal" | "400" | "500" | "600" | "bold" | "700" | "800" | "900";
        public font: string;

        public zIndex: number;
        public opacity: number;
        public visibility: "visible" | "hidden" | "collapse" | "collapsed";

        public letterSpacing: number;
        public textAlignment:  "left" | "center" | "right";
        public textDecoration: "none" | "underline" | "lineThrough";
        public textTransform: "none" | "capitalize" | "uppercase" | "lowercase";
        public whiteSpace: "normal" | "nowrap";

        public minWidth: Length;
        public minHeight: Length;
        public width: PercentLength;
        public height: PercentLength;
        public margin: string;
        public marginLeft: PercentLength;
        public marginTop: PercentLength;
        public marginRight: PercentLength;
        public marginBottom: PercentLength;
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
        // public _sizeChanged(): void;
    }

    // export function registerNoStylingClass(className);
    // export function getHandler(property: Property, view: View): StylePropertyChangedHandler;
    // Property registration

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
