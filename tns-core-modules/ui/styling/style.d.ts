//@private
declare module "ui/styling/style" {
    import styling = require("ui/styling");
    import {DependencyObservable, Property} from "ui/core/dependency-observable";
    import {View} from "ui/core/view";
    import {Color} from "color";
    import styleProperty = require("ui/styling/style-property");

    export interface Thickness {
        left: number;
        top: number;
        right: number;
        bottom: number;
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

        horizontalAlignment: string;
        verticalAlignment: string;
    }

    export class Style extends DependencyObservable implements styling.Style {
        public rotate: number;
        public translateX: number;
        public translateY: number;
        public scaleX: number;
        public scaleY: number;
        public color: Color;
        public backgroundColor: Color;
        public backgroundImage: string;
        public backpublic: string;
        public backgroundSize: string;
        public backgroundPosition: string;
        public backgroundRepeat: string;
        public borderColor: Color;
        public borderWidth: number;
        public borderRadius: number;
        public fontSize: number;
        public fontFamily: string;
        public fontStyle: string;
        public fontWeight: string;
        public font: string;
        public textAlignment: string;
        public textDecoration: string;
        public textTransform: string;
        public minWidth: number;
        public minHeight: number;
        public width: number;
        public height: number;
        public margin: string;
        public marginLeft: number;
        public marginTop: number;
        public marginRight: number;
        public marginBottom: number;
        public padding: string;
        public paddingLeft: number;
        public paddingTop: number;
        public paddingRight: number;
        public paddingBottom: number;
        public horizontalAlignment: string;
        public verticalAlignment: string;
        public visibility: string;
        public clipPath: string;
        public opacity: number;
        public whiteSpace: string;
        public letterSpacing: number;
        public zIndex: number;

        constructor(parentView: View);

        public _beginUpdate();
        public _endUpdate();
        public _resetCssValues(): void;
        public _syncNativeProperties(): void;
        // public _inheritStyleProperty(property: Property): void;
        public _inheritStyleProperties(parent: View): void;
        public _boundsChanged(): void;
        public _updateTextDecoration(): void;
        public _updateTextTransform(): void;
    }

    export function registerNoStylingClass(className);
    export function getHandler(property: Property, view: View): StylePropertyChangedHandler;
    // Property registration

    export var rotateProperty: styleProperty.Property;
    export var translateXProperty: styleProperty.Property;
    export var translateYProperty: styleProperty.Property;
    export var scaleXProperty: styleProperty.Property;
    export var scaleYProperty: styleProperty.Property;
    export var colorProperty: styleProperty.Property;
    export var backgroundImageProperty: styleProperty.Property;
    export var backgroundColorProperty: styleProperty.Property;
    export var backgroundRepeatProperty: styleProperty.Property;
    export var backgroundSizeProperty: styleProperty.Property;
    export var backgroundPositionProperty: styleProperty.Property;
    export var borderColorProperty: styleProperty.Property;
    export var borderWidthProperty: styleProperty.Property;
    export var borderRadiusProperty: styleProperty.Property;
    export var clipPathProperty: styleProperty.Property;
    export var backgroundInternalProperty: styleProperty.Property;
    export var fontSizeProperty: styleProperty.Property;
    export var fontFamilyProperty: styleProperty.Property;
    export var fontStyleProperty: styleProperty.Property;
    export var fontWeightProperty: styleProperty.Property;
    export var fontInternalProperty: styleProperty.Property;
    export var textAlignmentProperty: styleProperty.Property;
    export var minWidthProperty: styleProperty.Property;
    export var minHeightProperty: styleProperty.Property;
    export var visibilityProperty: styleProperty.Property;
    export var opacityProperty: styleProperty.Property;
    export var textDecorationProperty: styleProperty.Property;
    export var textTransformProperty: styleProperty.Property;
    export var whiteSpaceProperty: styleProperty.Property;
    export var letterSpacingProperty: styleProperty.Property;
    export var zIndexProperty: styleProperty.Property;

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

    // Helper property holding all paddings. When paddings are set through CSS we cache them and send them to the native view in a single call.
    export var nativePaddingsProperty: styleProperty.Property;
    export var paddingLeftProperty: styleProperty.Property;
    export var paddingRightProperty: styleProperty.Property;
    export var paddingTopProperty: styleProperty.Property;
    export var paddingBottomProperty: styleProperty.Property;

    /**
     * Represents an object that defines how style property should be applied on a native view/widget.
     */
    export class StylePropertyChangedHandler {
        /**
         * Creates a new StylePropertyChangedHandler object.
         * @param applyCallback - called when a property value should be applied onto the native view/widget.
         * @param resetCallback - called when the property value is cleared to restore the native view/widget in its original state. The callback
         * also receives as a parameter the value stored by the getNativeValue callback.
         * @param getNativeValue - called when a style property is set for the first time to get the default native value for this property
         * in the native view/widget. This value will be passed to resetCallback in case the property value is cleared. Optional.
         */
        constructor(applyCallback: (view: View, newValue: any) => void,
            resetCallback: (view: View, nativeValue: any) => void,
            getNativeValue?: (view: View) => any);
    }

    /**
     * Represents a sceleton for an object that holds all style related callbacks and registers handlers.
     * Used for better code readability.
     */
    export class Styler {
        public static registerHandlers();
    }

    /**
     * A function that actually registers a property with a StylePropertyChangedHandler.
     * @param property - Usually a style dependency property which should be registered for style changes.
     * @param handler - The handler that reacts on property changes.
     * @param className(optional) - This parameter (when set) registers handler only for the class with that name and all its inheritors.
     */
    export function registerHandler(property: Property, handler: StylePropertyChangedHandler, className?: string);

    export var ignorePropertyHandler;

}
