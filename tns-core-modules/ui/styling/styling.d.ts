// declare module "ui/styling" {
//     import * as observable from "ui/core/dependency-observable";
//     import {Observable} from "data/observable";
//     import * as color from "color";
//     import * as view from "ui/core/view";

//     /**
//      * Represents an observable property which can have its value set form CSS style.
//      */
//     export class Property extends observable.Property {

//         /**
//          * Creates a new style property.
//          * @param name Name of the property
//          * @param cssName The name of property when it is defined in CSS
//          * @param metadata The property metadata
//          * @param valueConverter Converter function that will be used to convert the CSS value to the actual property type.
//          */
//         constructor(name: string, cssName: string, metadata: observable.PropertyMetadata, valueConverter?: (value: any) => any);

//         /**
//          * Gets the CSS name of the property.
//          */
//         cssName: string;

//         /**
//          * Gets the converter function that will be used to convert the CSS value to the actual property type. 
//          */
//         valueConverter: (value: any) => any;
//     }

//     /**
//      * Represents as style object containing all the style properties for a particular view.
//      */
//     export class Style extends Observable {
//         /**
//          * Creates new style object.
//          * @param view The view for which the style is created for.
//          */
//         constructor(view: view.View);

//         /**
//          * Get the view for which the style is created.
//          */
//         view: view.View;

//         /**
//          * Gets or sets the color style property.
//          */
//         color: color.Color;
//         /**
//          * Gets or sets the background-color style property.
//          */
//         backgroundColor: color.Color;
        
//         /**
//          * Gets or sets the background-image style property.
//          */
//         backgroundImage: string;
        
//         /**
//          * Gets or sets the background-size style property.
//          */
//         backgroundSize: string;
        
//         /**
//          * Gets or sets the background-position style property.
//          */
//         backgroundPosition: string;
        
//         /**
//          * Gets or sets the background-repeat style property.
//          */
//         backgroundRepeat: string;

//         /**
//          * Gets or sets the border-color style property.
//          */
//         borderColor: string | color.Color 

//         /**
//          * Gets or sets the border-width style property.
//          */
//         borderWidth: number

//         /**
//          * Gets or sets the border-radius style property.
//          */
//         borderRadius: number;
        
//         /**
//          * Gets or sets the clip-path style property.
//          */
//         clipPath: string;        

//         /**
//          * Gets or sets font-size style property.
//          */
//         fontSize: number;
        
//         /**
//          * Gets or sets z-index style property.
//          */        
//         zIndex: number;

//         /**
//          * Gets or sets font-family style property.
//          */
//         fontFamily: string;

//         /**
//          * Gets or sets font-style style property.
//          */
//         fontStyle: string;

//         /**
//          * Gets or sets font-weight style property.
//          */
//         fontWeight: string;

//         /**
//          * Gets or sets text-alignment style property.
//          */
//         textAlignment: string;

//         /**
//          * Gets or sets min-width style property.
//          */
//         minWidth: number;

//         /**
//          * Gets or sets min-height style property.
//          */
//         minHeight: number;

//         /**
//          * Gets or sets width style property.
//          */
//         width: number;

//         /**
//          * Gets or sets height style property.
//          */
//         height: number;

//         /**
//          * Gets or sets margin style property.
//          */
//         margin: string;

//         /**
//          * Specifies extra space on the left side of this view.
//          */
//         marginLeft: number;

//         /**
//          * Specifies extra space on the top side of this view.
//          */
//         marginTop: number;

//         /**
//          * Specifies extra space on the right side of this view.
//          */
//         marginRight: number;

//         /**
//          * Specifies extra space on the bottom side of this view.
//          */
//         marginBottom: number;

//         /**
//          * Gets or sets padding style property.
//          */
//         padding: string;

//         /**
//          * Specify the left padding of this view.
//          */
//         paddingLeft: number;

//         /**
//          * Specify the top padding of this view.
//          */
//         paddingTop: number;

//         /**
//          * Specify the right padding of this view.
//          */
//         paddingRight: number;

//         /**
//          * Specify the bottom padding of this view.
//          */
//         paddingBottom: number;

//         /**
//          * Gets or sets horizontal-alignment style property.
//          */
//         horizontalAlignment: string;

//         /**
//          * Gets or sets vertical-alignment style property.
//          */
//         verticalAlignment: string;

//         /**
//          * Gets or sets the visibility style property.
//          */
//         visibility: string;

//         /**
//          * Gets or sets the opacity style property.
//          */
//         opacity: number;

//         /**
//          * Gets or sets the text decoration style property. Possible values are contained in the [TextDecoration enumeration](../enums/TextDecoration/README.md).
//          */
//         textDecoration: string;
        
//         /**
//          * Gets or sets the text transform style property. Possible values are contained in the [TextTransform enumeration](../enums/TextTransform/README.md).
//          */
//         textTransform: string;
        
//         /**
//          * Gets or sets the whitespace style property. Possible values are contained in the [WhiteSpace enumeration](../enums/WhiteSpace/README.md).
//          */
//         whiteSpace: string;
        
//         /**
//          * Gets or sets the letter spacing style property. Values are in [EM units](https://en.wikipedia.org/wiki/Em_(typography)). Negative values tighten text.
//          */
//         letterSpacing: number;

//         //@private
//         // public _beginUpdate();
//         // public _endUpdate();
//         // public _resetCssValues(): void;
//         // public _syncNativeProperties(): void;
//         // public _inheritStyleProperty(property: dependencyObservable.Property): void;
//         // public _inheritStyleProperties(parent: view.View): void;
//         // public _updateTextDecoration(): void;
//         // public _updateTextTransform(): void;
//         //@endprivate
//     }

//     /**
//      * Encapsulates the style properties definitions and utility methods.
//      */
//     module properties {
//         /**
//          * The font-size property definition.
//          */
//         export var fontSizeProperty: Property;

//         /**
//          * The color property definition.
//          */
//         export var colorProperty: Property;

//         /**
//          * The background-color property definition.
//          */
//         export var backgroundColorProperty: Property;

//         /**
//          * The text-alignment property definition.
//          */
//         export var textAlignmentProperty: Property;

//         /**
//          * Gets style Property by its name.
//          * @param The name.
//          */
//         export function getPropertyByName(name: string): Property;

//         /**
//          * Gets style Property by its CSS name.
//          * @param The CSS name.
//          */
//         export function getPropertyByCssName(name: string): Property;

//         /**
//          * Executes a callback for all defined style properties.
//          * @param The callback.
//          */
//         export function eachProperty(callback: (property: Property) => void);

//         /**
//          * Executes a callback for all defined inheritable style properties.
//          * @param The callback.
//          */
//         export function eachInheritableProperty(callback: (property: Property) => void);
//     }

//     /**
//      * Encapsulates CSS converter methods.
//      */
//     module converters {
//         /**
//          * CSS color converter function.
//          * @param cssValue The css value.
//          */
//         export function colorConverter(cssValue: any): color.Color;

//         /**
//          * CSS font-size converter function.
//          * @param cssValue The css value.
//          */
//         export function fontSizeConverter(cssValue: any): number;

//         /**
//          * CSS text-align converter function.
//          * @param cssValue The css value.
//          */
//         export function textAlignConverter(cssValue: any): string;

//         /**
//          * CSS number converter function.
//          * @param cssValue The css value.
//          */
//         export function numberConverter(cssValue: any): number;

        //@private
        // public _beginUpdate();
        // public _endUpdate();
        // public _resetCssValues(): void;
        // public _syncNativeProperties(): void;
        // // public _inheritStyleProperty(property: dependencyObservable.Property): void;
        // public _inheritStyleProperties(parent: view.View): void;
        // public _updateTextDecoration(): void;
        // public _updateTextTransform(): void;
        //@endprivate
    // }

//     /**
//      * Encapsulates the style properties definitions and utility methods.
//      */
//     module properties {
//         /**
//          * The font-size property definition.
//          */
//         export var fontSizeProperty: Property;

//         /**
//          * The color property definition.
//          */
//         export var colorProperty: Property;

//         /**
//          * The background-color property definition.
//          */
//         export var backgroundColorProperty: Property;

//         /**
//          * The text-alignment property definition.
//          */
//         export var textAlignmentProperty: Property;

//         /**
//          * Gets style Property by its name.
//          * @param The name.
//          */
//         export function getPropertyByName(name: string): Property;

//         /**
//          * Gets style Property by its CSS name.
//          * @param The CSS name.
//          */
//         export function getPropertyByCssName(name: string): Property;

//         /**
//          * Executes a callback for all defined style properties.
//          * @param The callback.
//          */
//         export function eachProperty(callback: (property: Property) => void);

//         /**
//          * Executes a callback for all defined inheritable style properties.
//          * @param The callback.
//          */
//         export function eachInheritableProperty(callback: (property: Property) => void);
//     }

//     /**
//      * Encapsulates CSS converter methods.
//      */
//     module converters {
//         /**
//          * CSS color converter function.
//          * @param cssValue The css value.
//          */
//         export function colorConverter(cssValue: any): color.Color;

//         /**
//          * CSS font-size converter function.
//          * @param cssValue The css value.
//          */
//         export function fontSizeConverter(cssValue: any): number;

//         /**
//          * CSS text-align converter function.
//          * @param cssValue The css value.
//          */
//         export function textAlignConverter(cssValue: any): string;

//         /**
//          * CSS number converter function.
//          * @param cssValue The css value.
//          */
//         export function numberConverter(cssValue: any): number;

//         /**
//          * CSS visibility converter function.
//          * @param cssValue The css value.
//          */
//         export function visibilityConverter(cssValue: any): number;
//     }
// }