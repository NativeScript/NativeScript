import definition = require("ui/styling/style");
import {Observable} from "data/observable";
import {View} from "ui/core/view";
import {Color} from "color";
import {Font} from "ui/styling/font";
import {Background} from "ui/styling/background";
import {isAndroid, isIOS} from "platform";
import {CssProperty, InheritedCssProperty} from "ui/core/properties";
import {fromBase64, fromFileOrResource, fromUrl} from "image-source";
import {isDataURI, isFileOrResourcePath} from "utils/utils";

import {HorizontalAlignment, VerticalAlignment, Visibility,
    TextDecoration, TextTransform, TextAlignment,
    WhiteSpace, FontWeight, FontStyle} from "ui/enums";

import {numberConverter, colorConverter, fontSizeConverter,
    textAlignConverter, textDecorationConverter, textTransformConverter,
    whiteSpaceConverter, transformConverter} from "./converters";

// on Android we explicitly set AffectsLayout to False because android will invalidate its layout when needed so we skip unnecessary native calls.
let affectsIOSLayout = isIOS;

interface Thickness {
    left: Object;
    top: Object;
    right: Object;
    bottom: Object;
}

interface PercentHelper {
    value: number;
    isPercent: boolean;
    isError: boolean;
}

// function parseMargin(value: any): Thickness {
//     if (types.isString(value)) {
//         let arr = (<string>value).split(/[ ,]+/);

//         let top: Object;
//         let right: Object;
//         let bottom: Object;
//         let left: Object;

//         if (arr.length === 1) {
//             top = right = bottom = left = arr[0];
//         }
//         else if (arr.length === 2) {
//             top = bottom = arr[0];
//             right = left = arr[1];
//         }
//         else if (arr.length === 4) {
//             top = arr[0];
//             right = arr[1];
//             bottom = arr[2];
//             left = arr[3];
//         }
//         else {
//             throw new Error("Invalid value for margin: " + value);
//         }

//         return {
//             top: top,
//             right: right,
//             bottom: bottom,
//             left: left
//         }
//     }
//     else if (types.isNumber(value)) {
//         return {
//             top: value,
//             right: value,
//             bottom: value,
//             left: value
//         }
//     }
//     else {
//         return value;
//     }
// }

// function parseThickness(value: any): definition.Thickness {
//     let result: definition.Thickness = { top: 0, right: 0, bottom: 0, left: 0 };
//     if (types.isString(value)) {
//         let arr = value.split(/[ ,]+/);
//         let top = parseInt(arr[0]);
//         top = isNaN(top) ? 0 : top;

//         let right = parseInt(arr[1]);
//         right = isNaN(right) ? top : right;

//         let bottom = parseInt(arr[2]);
//         bottom = isNaN(bottom) ? top : bottom;

//         let left = parseInt(arr[3]);
//         left = isNaN(left) ? right : left;

//         result.top = top;
//         result.right = right;
//         result.bottom = bottom;
//         result.left = left;

//     } else if (types.isNumber(value)) {
//         result.top = result.right = result.bottom = result.left = value;
//     }
//     else {
//         result = value;
//     }

//     return result;
// }

// function layoutParamsComparer(x: definition.CommonLayoutParams, y: definition.CommonLayoutParams): boolean {
//     return x.width === y.width
//         && x.height === y.height
//         && x.leftMargin === y.leftMargin
//         && x.topMargin === y.topMargin
//         && x.rightMargin === y.rightMargin
//         && x.bottomMargin === y.bottomMargin
//         && x.horizontalAlignment === y.horizontalAlignment
//         && x.verticalAlignment === y.verticalAlignment
//         && x.widthPercent === y.widthPercent
//         && x.heightPercent === y.heightPercent
//         && x.leftMarginPercent === y.leftMarginPercent
//         && x.topMarginPercent === y.topMarginPercent
//         && x.rightMarginPercent === y.rightMarginPercent
//         && x.bottomMarginPercent === y.bottomMarginPercent
// }

// function onLayoutParamsChanged(data: PropertyChangeData) {
//     let style = <Style>data.object;


//     let heightValue = convertToPercentHelper(style.height);
//     let height: number;
//     let heightPercent: number;
//     if (heightValue.isPercent) {
//         height = style.verticalAlignment === VerticalAlignment.stretch ? -1 : -2;
//         heightPercent = heightValue.value / 100;
//     }
//     else {
//         height = isNaN(heightValue.value) ? -1 : heightValue.value;
//         heightPercent = -1;
//     }

//     let marginLeftValue = convertToPercentHelper(style.marginLeft);
//     let marginTopValue = convertToPercentHelper(style.marginTop);
//     let marginRightValue = convertToPercentHelper(style.marginRight);
//     let marginBottomValue = convertToPercentHelper(style.marginBottom);

//     // Negative marginPercent means no marginPercent so native layout won't override margin with this % value.
//     let layoutParams: definition.CommonLayoutParams =
//         {
//             width: width,
//             height: height,
//             widthPercent: widthPercent,
//             heightPercent: heightPercent,
//             leftMargin: marginLeftValue.isPercent ? 0 : marginLeftValue.value,
//             leftMarginPercent: marginLeftValue.isPercent ? marginLeftValue.value / 100 : -1,
//             topMargin: marginTopValue.isPercent ? 0 : marginTopValue.value,
//             topMarginPercent: marginTopValue.isPercent ? marginTopValue.value / 100 : -1,
//             rightMargin: marginRightValue.isPercent ? 0 : marginRightValue.value,
//             rightMarginPercent: marginRightValue.isPercent ? marginRightValue.value / 100 : -1,
//             bottomMargin: marginBottomValue.isPercent ? 0 : marginBottomValue.value,
//             bottomMarginPercent: marginBottomValue.isPercent ? marginBottomValue.value / 100 : -1,
//             horizontalAlignment: style.horizontalAlignment,
//             verticalAlignment: style.verticalAlignment
//         };

//     style.nativeLayoutParamsProperty = layoutParams;
// }

// function onPaddingValueChanged(data: PropertyChangeData) {
//     var style = <Style>data.object;
//     var thickness: definition.Thickness = {
//         top: style.paddingTop,
//         right: style.paddingRight,
//         bottom: style.paddingBottom,
//         left: style.paddingLeft
//     };

//     style.nativePaddingsProperty = thickness;
// }

// function thicknessComparer(x: definition.Thickness, y: definition.Thickness): boolean {
//     if (x && y) {
//         return x.left === y.left && x.top === y.top && x.right === y.right && x.bottom === y.bottom;
//     }
//     return !x === !y;
// }

function convertToPercentHelper(value: Object): PercentHelper {
    let numberValue = 0;
    let isPercent = false;
    let isError = true;
    let valueType = typeof value;
    if (valueType === "string") {
        var stringValue = (<string>value).trim();
        var percentIndex = stringValue.indexOf("%");
        if (percentIndex !== -1) {
            // if only % or % is not last we treat it as invalid value.
            if (percentIndex !== (stringValue.length - 1) || percentIndex === 0) {
                numberValue = 0;
            }
            else {
                isPercent = true;
                numberValue = numberConverter(stringValue.substring(0, stringValue.length - 1).trim());
                isError = numberValue === 0;
            }
        }
        else {
            isError = false;
            isPercent = false;
            numberValue = numberConverter(stringValue);
        }
    }
    else if (valueType === "number") {
        isError = false;
        isPercent = false;
        numberValue = <number>value;
    }

    return {
        isError: isError,
        isPercent: isPercent,
        value: numberValue
    }
}

function numberOrPercentConverter(value: Object) {
    let result = convertToPercentHelper(value);
    if (result.isError) {
        throw new Error("Invalid value: " + value);
    }
    return result.isPercent ? value : result.value;
}

function widthHeightConverter(value: Object): Object {
    var result = convertToPercentHelper(value);
    let newValue = result.value;
    if (result.isError || !(isNaN(newValue) || (newValue >= 0.0 && isFinite(newValue)))) {
        throw new Error("Invalid value: " + value);
    }

    return value;
}

function minWidthMinHeightConverter(value: any): number {
    let newValue = parseFloat(value);
    if (isNaN(value) || value < 0.0 || !isFinite(value)) {
        throw new Error(`Invalid value: ${newValue}`);
    }

    return newValue;
}



function onBackgroundColorPropertyChanged(style: Style, oldValue: Color, newValue: Color) {
    let currentBackground = style.backgroundInternal;
    if (!Color.equals(currentBackground.color, newValue)) {
        style.backgroundInternal = currentBackground.withColor(newValue);
    }
}

let pattern: RegExp = /url\(('|")(.*?)\1\)/;
function onBackgroundImagePropertyChanged(style: Style, oldValue: string, newValue: string) {
    let url: string = newValue;
    let currentBackground = style.backgroundInternal;
    let isValid = false;
    let typeofValue = typeof newValue;
    if (typeofValue === "string") {
        let match = url.match(pattern);
        if (match && match[2]) {
            url = match[2];
        }

        if (isDataURI(url)) {
            let base64Data = url.split(",")[1];
            if (base64Data !== "undefined") {
                style.backgroundInternal = currentBackground.withImage(fromBase64(base64Data));
                isValid = true;
            }
        }
        else if (isFileOrResourcePath(url)) {
            style.backgroundInternal = currentBackground.withImage(fromFileOrResource(url));
            isValid = true;
        }
        else if (url.indexOf("http") !== -1) {
            style["_url"] = url;
            style.backgroundInternal = currentBackground.withImage(undefined);
            fromUrl(url).then((r) => {
                if (style && style["_url"] === url) {
                    // Get the current background again, as it might have changed while doing the request.
                    currentBackground = style.backgroundInternal;
                    style.backgroundInternal = currentBackground.withImage(r);
                }
            });
            isValid = true;
        }
    }

    if (!isValid) {
        style.backgroundInternal = currentBackground.withImage(undefined);
    }
}

function onBackgroundRepeatPropertyChanged(style: Style, oldValue: string, newValue: string) {
    let currentBackground = style.backgroundInternal;
    if (newValue !== currentBackground.repeat) {
        style.backgroundInternal = currentBackground.withRepeat(newValue);
    }
}

function onBackgroundPositionPropertyChanged(style: Style, oldValue: string, newValue: string) {
    let currentBackground = style.backgroundInternal;
    if (newValue !== currentBackground.position) {
        style.backgroundInternal = currentBackground.withPosition(newValue);
    }
}

function onBackgroundSizePropertyChanged(style: Style, oldValue: string, newValue: string) {
    let currentBackground = style.backgroundInternal;
    if (newValue !== currentBackground.size) {
        style.backgroundInternal = currentBackground.withSize(newValue);
    }
}

function isNonNegativeFiniteNumberConverter(value: string): number {
    let number = numberConverter(value);
    if (!isNonNegativeFiniteNumber(number)) {
        throw new Error("border-width should be NonNegative Finite number.");
    }
    return number;
}

function onBorderWidthPropertyChanged(style: Style, oldValue: number, newValue: number) {
    if (isAndroid) {
        let currentBackground = style.backgroundInternal;
        if (newValue !== currentBackground.borderWidth) {
            style.backgroundInternal = currentBackground.withBorderWidth(newValue);
        }
    }
}

function onBorderColorPropertyChanged(style: Style, oldValue: Color, newValue: Color) {
    if (isAndroid) {
        let currentBackground = style.backgroundInternal;
        if (newValue !== currentBackground.borderColor) {
            style.backgroundInternal = currentBackground.withBorderColor(newValue);
        }
    }
}

function borderRadiusConverter(value: string): number {
    let number = numberConverter(value);
    if (!isNonNegativeFiniteNumber(number)) {
        throw new Error("border-radius should be NonNegative Finite number.");
    }
    return number;
}

function onBorderRadiusPropertyChanged(style: Style, oldValue: number, newValue: number) {
    if (isAndroid) {
        let currentBackground = style.backgroundInternal;
        if (newValue !== currentBackground.borderRadius) {
            style.backgroundInternal = currentBackground.withBorderRadius(newValue);
        }
    }
}

let supportedPaths = ["rect", "circle", "ellipse", "polygon"];
function isClipPathValid(value: string): boolean {
    if (!value) {
        return true;
    }
    let functionName = value.substring(0, value.indexOf("(")).trim();
    return supportedPaths.indexOf(functionName) !== -1;
}

function onClipPathPropertyChanged(style: Style, oldValue: string, newValue: string) {
    // TODO: isClipPathValid
    if (!isClipPathValid(newValue)) {
        throw new Error("clip-path is not valid.");
    }

    if (isAndroid) {
        let currentBackground = style.backgroundInternal;
        if (newValue !== currentBackground.clipPath) {
            style.backgroundInternal = currentBackground.withClipPath(newValue);
        }
    }
}

function isTextDecorationValid(value: string): boolean {
    let values = (value + "").split(" ");
    return values.indexOf(TextDecoration.none) !== -1 || values.indexOf(TextDecoration.underline) !== -1 || values.indexOf(TextDecoration.lineThrough) !== -1;
}

function isTextTransformValid(value: string): boolean {
    return value === TextTransform.none || value === TextTransform.uppercase || value === TextTransform.lowercase || value === TextTransform.capitalize;
}

function isWhiteSpaceValid(value: string): boolean {
    return value === WhiteSpace.nowrap || value === WhiteSpace.normal;
}

function isNonNegativeFiniteNumber(value: number): boolean {
    return isFinite(value) && !isNaN(value) && value >= 0;
}



function isMarginValid(value: number): boolean {
    var result = convertToPercentHelper(value);
    if (result.isError) {
        return false;
    }

    return isFinite(result.value) && !isNaN(result.value);
}

function opacityConverter(value: any): number {
    let newValue = parseFloat(value);
    if (!isNaN(newValue) && 0 <= newValue && newValue <= 1) {
        return newValue;
    }

    throw new Error(`Opacity should be between [0, 1]. Value: ${newValue}`);
}
function isOpacityValid(value: string): boolean {
    var parsedValue: number = parseFloat(value);
    return !isNaN(parsedValue) && 0 <= parsedValue && parsedValue <= 1;
}

function isFloatValueConverter(value: any): number {
    let newValue = parseFloat(value);
    if (isNaN(newValue)) {
        throw new Error(`Invalid value: ${newValue}`);
    }

    return newValue;
}

function onVisibilityChanged(style: Style, oldValue: string, newValue: string) {
    if (!(newValue === Visibility.visible || newValue === Visibility.collapse || newValue === Visibility.collapsed)) {
        throw new Error(`Invalid visibility value: ${newValue}`);
    }
    style.view.isVisible = newValue === Visibility.visible;
}

function onFontFamilyChanged(style: Style, oldValue: string, newValue: string) {
    let currentFont = style.fontInternal;
    if (currentFont.fontFamily !== newValue) {
        style.fontInternal = currentFont.withFontFamily(newValue);
    }
}

function onFontStyleChanged(style: Style, oldValue: string, newValue: string) {
    if (newValue !== FontStyle.normal && newValue !== FontStyle.italic) {
        throw new Error(`font-style should be 'normal' or 'italic'. value:${newValue}`)
    }

    let currentFont = style.fontInternal;
    if (currentFont.fontStyle !== newValue) {
        style.fontInternal = currentFont.withFontStyle(newValue);
    }
}

function onFontWeightChanged(style: Style, oldValue: string, newValue: string) {
    if (!newValue) {
        console.trace();
    }

    if (!(newValue === FontWeight.thin
        || newValue === FontWeight.extraLight
        || newValue === FontWeight.light
        || newValue === FontWeight.normal || newValue === "400"
        || newValue === FontWeight.medium
        || newValue === FontWeight.semiBold
        || newValue === FontWeight.bold || newValue === "700"
        || newValue === FontWeight.extraBold
        || newValue === FontWeight.black)) {
        throw new Error(`Invalid font-weight value: ${newValue}`);
    }

    let currentFont = style.fontInternal;
    if (currentFont.fontWeight !== newValue) {
        style.fontInternal = currentFont.withFontWeight(newValue);
    }
}

function onFontSizeChanged(style: Style, oldValue: number, newValue: number) {
    let currentFont = style.fontInternal;
    if (currentFont.fontSize !== newValue) {
        style.fontInternal = currentFont.withFontSize(newValue);
    }
}

export class Style extends Observable implements definition.Style {
    constructor(public view: View) {
        super();
    }

    private _updateCounter = 0;
    // private _nativeSetters = new Map<Property, any>();

    public backgroundInternal: Background;

    public rotate: number;
    public scaleX: number;
    public scaleY: number;
    public translateX: number;
    public translateY: number;

    public clipPath: string;
    public color: Color;
    public backgroundColor: Color;
    public backgroundImage: string;
    public backgroundRepeat: string;
    public backgroundSize: string;
    public backgroundPosition: string;
    public borderColor: Color;
    public borderWidth: number;
    public borderRadius: number;

    public fontSize: number;
    public fontFamily: string;
    public fontStyle: string;
    public fontWeight: string;
    public font: string;
    public fontInternal: Font;

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

    public zIndex: number;
    public opacity: number;
    public visibility: string;

    public textAlignment: string;
    public textDecoration: string;
    public textTransform: string;
    public letterSpacing: number;
    public whiteSpace: string;

    // public _updateTextDecoration() {
    //     if (this.textDecoration !== TextDecoration.none) {
    //         this._applyProperty(textDecorationProperty, this._getValue(textDecorationProperty));
    //     }
    // }

    // public _updateTextTransform() {
    //     if (this._getValue(textTransformProperty) !== TextTransform.none) {
    //         this._applyProperty(textTransformProperty, this._getValue(textTransformProperty));
    //     }
    // }

    // public _beginUpdate() {
    //     this._updateCounter++;
    // }

    // public _endUpdate() {
    //     this._updateCounter--;
    //     if (this._updateCounter < 0) {
    //         throw new Error("style._endUpdate() called, but no update is in progress.");
    //     }

    //     if (this._updateCounter === 0) {
    //         this._nativeSetters.forEach((newValue, property, map) => { this._applyStyleProperty(property, newValue); });
    //         this._nativeSetters.clear();
    //     }
    // }

    // public _resetCssValues() {
    //     this.view._unregisterAllAnimations();
    //     this._resetValues(ValueSource.Css);
    // }

    // public _resetLocalValues() {
    //     this._resetValues(ValueSource.Local);
    // }

    // public _inheritStyleProperties(parent: View) {
    //     parent.style._eachSetPropertyValue((property, value) => {
    //         if (property.inheritable) {
    //             // this._inheritStyleProperty(property, value);
    //             this._setValue(property, value, ValueSource.Inherited);
    //         }

    //         return true;
    //     });
    // }

    // public _onPropertyChanged(property: Property, oldValue: any, newValue: any) {
    //     if (trace.enabled) {
    //         trace.write(
    //             "Style._onPropertyChanged view:" + this._view +
    //             ", property: " + property.name +
    //             ", oldValue: " + oldValue +
    //             ", newValue: " + newValue, trace.categories.Style);
    //     }

    //     super._onPropertyChanged(property, oldValue, newValue);

    //     this._view._checkMetadataOnPropertyChanged(property.metadata);

    //     this._applyProperty(property, newValue);
    // }

    // public _sizeChanged() {
    //     if (!this.backgroundInternal.isEmpty()) {
    //         this._applyStyleProperty(backgroundInternalProperty, this.backgroundInternal);
    //     }

    //     let clipPathPropertyValue = this.clipPath;
    //     if (types.isString(clipPathPropertyValue) && clipPathPropertyValue !== "") {
    //         this._applyStyleProperty(clipPathProperty, clipPathPropertyValue);
    //     }
    // }

    // public _syncNativeProperties() {
    //     this._eachSetPropertyValue((property, value) => {
    //         this._applyStyleProperty(property, value);
    //         return true;
    //     });
    // }

    // private _applyProperty(property: Property, newValue: any) {
    //     this._applyStyleProperty(property, newValue);

    //     // The effective value of an inheritable property has changed
    //     // propagate the change down to the descendants to update their inherited properties.
    //     if (property.inheritable && this._view._childrenCount > 0) {
    //         this._view._eachChildView((child: View) => {
    //             // child.style._inheritStyleProperty(property);
    //             child.style._setValue(property, newValue, ValueSource.Inherited);
    //             return true;
    //         });
    //     }
    // }

    // private _applyStyleProperty(property: Property, newValue: any) {
    //     if (!this._view._shouldApplyStyleHandlers()) {
    //         return;
    //     }

    //     if (this._updateCounter > 0) {
    //         this._nativeSetters.set(property, newValue);
    //         return;
    //     }

    //     let handler: definition.StylePropertyChangedHandler = getHandler(property, this._view);
    //     if (!handler) {
    //         if (trace.enabled) {
    //             trace.write("No handler for property: " + property.name + " with id: " + property.id + ", view:" + this._view, trace.categories.Style);
    //         }
    //     }
    //     else {
    //         if (trace.enabled) {
    //             trace.write("Found handler for property: " + property.name + ", view:" + this._view, trace.categories.Style);
    //         }

    //         let shouldReset = false;
    //         if (property.equalityComparer) {
    //             shouldReset = property.equalityComparer(newValue, property.defaultValue);
    //         }
    //         else {
    //             shouldReset = (newValue === property.defaultValue);
    //         }

    public _updateTextDecoration() {
        if (this._getValue(textDecorationProperty) !== enums.TextDecoration.none) {
            this._applyProperty(textDecorationProperty, this._getValue(textDecorationProperty));
        }
    }

    //         this._view._onStylePropertyChanged(property);
    //     }
    // }

    // get _nativeView(): any {
    //     return this._view._nativeView;
    // }

    // private _setShorthandProperty(name: string, value: any): void {
    //     var pairs = styleProperty.getShorthandPairs(name, value);
    //     if (pairs) {
    //         this._beginUpdate();
    //         for (let j = 0; j < pairs.length; j++) {
    //             let pair = pairs[j];
    //             this._setValue(pair.property, pair.value, ValueSource.Local);
    //         }
    //         this._endUpdate();
    //     }
    // }
}

// Property registration

export let rotateProperty = new CssProperty<Style, number>({ name: "rotate", cssName: "rotate", defaultValue: 0 });
rotateProperty.register(Style);
// export var rotateProperty = new styleProperty.Property("rotate", "rotate", new PropertyMetadata(undefined, PropertyMetadataSettings.None, null));

export let scaleXProperty = new CssProperty<Style, number>({ name: "scaleX", cssName: "scaleX", defaultValue: 1 });
scaleXProperty.register(Style);
// export var scaleXProperty = new styleProperty.Property("scaleX", "scaleX", new PropertyMetadata(undefined, PropertyMetadataSettings.None, null));

export let scaleYProperty = new CssProperty<Style, number>({ name: "scaleY", cssName: "scaleY", defaultValue: 1 });
scaleYProperty.register(Style);
// export var scaleYProperty = new styleProperty.Property("scaleY", "scaleY", new PropertyMetadata(undefined, PropertyMetadataSettings.None, null));

export let translateXProperty = new CssProperty<Style, number>({ name: "translateX", cssName: "translateX", defaultValue: 0 });
translateXProperty.register(Style);
// export var translateXProperty = new styleProperty.Property("translateX", "translateX", new PropertyMetadata(undefined, PropertyMetadataSettings.None, null));

export let translateYProperty = new CssProperty<Style, number>({ name: "translateY", cssName: "translateY", defaultValue: 0 });
translateYProperty.register(Style);
// export var translateYProperty = new styleProperty.Property("translateY", "translateY", new PropertyMetadata(undefined, PropertyMetadataSettings.None, null));

export var color = new InheritedCssProperty<Style, Color>({ name: "color", cssName: "color", equalityComparer: Color.equals, valueConverter: colorConverter });
color.register(Style);
// export var colorProperty = new styleProperty.Property("color", "color", new PropertyMetadata(undefined, PropertyMetadataSettings.Inheritable, undefined, Color.isValid, Color.equals), colorConverter);

// NOTE: clip-path should not affects layout.
export var clipPathProperty = new CssProperty<Style, string>({ name: "clipPath", cssName: "clip-path", valueChanged: onClipPathPropertyChanged });
clipPathProperty.register(Style);
// export var clipPathProperty = new styleProperty.Property("clipPath", "clip-path",
//     new PropertyMetadata(undefined, AffectsLayout, onClipPathPropertyChanged, isClipPathValid));

export let backgroundColorProperty = new CssProperty<Style, Color>({ name: "backgroundColor", cssName: "background-color", valueChanged: onBackgroundColorPropertyChanged, equalityComparer: Color.equals, valueConverter: colorConverter });
backgroundColorProperty.register(Style);
// export var backgroundColorProperty = new styleProperty.Property("backgroundColor", "background-color",
//     new PropertyMetadata(undefined, PropertyMetadataSettings.None, onBackgroundColorPropertyChanged, Color.isValid, Color.equals), colorConverter);

export let backgroundImageProperty = new CssProperty<Style, string>({ name: "backgroundImage", cssName: "background-image", valueChanged: onBackgroundImagePropertyChanged });
backgroundImageProperty.register(Style);
// export var backgroundImageProperty = new styleProperty.Property("backgroundImage", "background-image", new PropertyMetadata(undefined, PropertyMetadataSettings.None, onBackgroundImagePropertyChanged));

export var backgroundRepeatProperty = new CssProperty<Style, string>({ name: "backgroundRepeat", cssName: "background-repeat", valueChanged: onBackgroundRepeatPropertyChanged });
backgroundRepeatProperty.register(Style);
// export var backgroundRepeatProperty = new styleProperty.Property("backgroundRepeat", "background-repeat",
//     new PropertyMetadata(undefined, PropertyMetadataSettings.None, onBackgroundRepeatPropertyChanged));

export let backgroundSizeProperty = new CssProperty<Style, string>({ name: "backgroundSize", cssName: "background-size", valueChanged: onBackgroundSizePropertyChanged });
backgroundSizeProperty.register(Style);
// export var backgroundSizeProperty = new styleProperty.Property("backgroundSize", "background-size",
//     new PropertyMetadata(undefined, PropertyMetadataSettings.None, onBackgroundSizePropertyChanged));

export let backgroundPositionProperty = new CssProperty<Style, string>({ name: "backgroundPosition", cssName: "background-position", valueChanged: onBackgroundPositionPropertyChanged });
backgroundPositionProperty.register(Style);
// export var backgroundPositionProperty = new styleProperty.Property("backgroundPosition", "background-position",
//     new PropertyMetadata(undefined, PropertyMetadataSettings.None, onBackgroundPositionPropertyChanged));

export let borderColorProperty = new CssProperty<Style, Color>({ name: "borderColor", cssName: "border-color", valueChanged: onBorderColorPropertyChanged, equalityComparer: Color.equals, valueConverter: colorConverter });
borderColorProperty.register(Style);
// export var borderColorProperty = new styleProperty.Property("borderColor", "border-color",
//     new PropertyMetadata(undefined, PropertyMetadataSettings.None, onBorderColorPropertyChanged, Color.isValid, Color.equals), colorConverter);

export let borderWidthProperty = new CssProperty<Style, number>({ name: "borderWidth", cssName: "border-width", defaultValue: 0, affectsLayout: affectsIOSLayout, valueChanged: onBorderWidthPropertyChanged, valueConverter: isNonNegativeFiniteNumberConverter });
borderWidthProperty.register(Style);
// export var borderWidthProperty = new styleProperty.Property("borderWidth", "border-width",
//     new PropertyMetadata(0, AffectsLayout, onBorderWidthPropertyChanged, isNonNegativeFiniteNumber), numberConverter);

export let borderRadiusProperty = new CssProperty<Style, number>({ name: "borderRadius", cssName: "border-radius", defaultValue: 0, affectsLayout: affectsIOSLayout, valueChanged: onBorderRadiusPropertyChanged, valueConverter: isNonNegativeFiniteNumberConverter });
borderRadiusProperty.register(Style);
// export var borderRadiusProperty = new styleProperty.Property("borderRadius", "border-radius",
//     new PropertyMetadata(0, AffectsLayout, onBorderRadiusPropertyChanged, isNonNegativeFiniteNumber), numberConverter);

export var backgroundInternalProperty = new CssProperty<Style, Background>({ name: "backgroundInternal", cssName: "backgroundInternal", defaultValue: Background.default, equalityComparer: Background.equals });
backgroundInternalProperty.register(Style);
// export var backgroundInternalProperty = new styleProperty.Property("_backgroundInternal", "_backgroundInternal",
//     new PropertyMetadata(Background.default, PropertyMetadataSettings.None, undefined, undefined, Background.equals));

export let fontSizeProperty = new InheritedCssProperty<Style, number>({ name: "fontSize", cssName: "font-size", valueChanged: onFontSizeChanged, valueConverter: fontSizeConverter });
fontSizeProperty.register(Style);
// export var fontSizeProperty = new styleProperty.Property("fontSize", "font-size",
//     new PropertyMetadata(undefined, PropertyMetadataSettings.Inheritable, onFontSizeChanged), fontSizeConverter);

export let fontFamilyProperty = new InheritedCssProperty<Style, string>({ name: "fontFamily", cssName: "font-family", valueChanged: onFontFamilyChanged });
fontFamilyProperty.register(Style);
// export var fontFamilyProperty = new styleProperty.Property("fontFamily", "font-family",
// new PropertyMetadata(undefined, PropertyMetadataSettings.Inheritable, onFontFamilyChanged));

export let fontStyleProperty = new InheritedCssProperty<Style, string>({ name: "fontStyle", cssName: "font-style", defaultValue: FontStyle.normal, valueChanged: onFontStyleChanged });
fontStyleProperty.register(Style);
// export var fontStyleProperty = new styleProperty.Property("fontStyle", "font-style",
//     new PropertyMetadata(FontStyle.normal, PropertyMetadataSettings.Inheritable, onFontStyleChanged, isFontStyleValid));

export let fontWeightProperty = new InheritedCssProperty<Style, string>({ name: "fontWeight", cssName: "font-weight", defaultValue: FontWeight.normal, valueChanged: onFontWeightChanged });
fontWeightProperty.register(Style);
// export var fontWeightProperty = new styleProperty.Property("fontWeight", "font-weight",
//     new PropertyMetadata(FontWeight.normal, PropertyMetadataSettings.Inheritable, onFontWeightChanged, isFontWeightValid));

export let fontProperty = new InheritedCssProperty<Style, Font>({ name: "font", cssName: "font", defaultValue: Font.default, valueChanged: onFontChanged, equalityComparer: Font.equals, valueConverter: Font.parse });
fontProperty.register(Style);
// export var fontInternal = new styleProperty.Property("_fontInternal", "_fontInternal",
//     new PropertyMetadata(Font.default, AffectsLayout, null, null, Font.equals), Font.parse);

export var zIndexProperty = new CssProperty<Style, number>({ name: "zIndex", cssName: "z-index", defaultValue: 0, valueConverter: isFloatValueConverter });
zIndexProperty.register(Style);
// export var zIndexProperty = new styleProperty.Property("zIndex", "z-index",
//     new PropertyMetadata(Number.NaN, AffectsLayout, undefined, isFloatValueValid), floatConverter);

export var visibilityProperty = new CssProperty<Style, string>({ name: "visibility", cssName: "visibility", defaultValue: Visibility.visible, affectsLayout: affectsIOSLayout, valueChanged: onVisibilityChanged });
visibilityProperty.register(Style);
// export var visibilityProperty = new styleProperty.Property("visibility", "visibility",
//     new PropertyMetadata(Visibility.visible, AffectsLayout, onVisibilityChanged, isVisibilityValid), visibilityConverter);

export var opacityProperty = new CssProperty<Style, number>({ name: "opacity", cssName: "opacity", defaultValue: 1, valueConverter: opacityConverter });
opacityProperty.register(Style);
// export var opacityProperty = new styleProperty.Property("opacity", "opacity",
//     new PropertyMetadata(1.0, PropertyMetadataSettings.None, undefined, isOpacityValid), opacityConverter);

// NOTE: text-align should not affects layout.
export let textAlignmentProperty = new InheritedCssProperty<Style, string>({ name: "textAlignment", cssName: "text-align", valueConverter: textAlignConverter });
textAlignmentProperty.register(Style);
// export var textAlignmentProperty = new styleProperty.Property("textAlignment", "text-align",
//     new PropertyMetadata(undefined, AffectsLayout | PropertyMetadataSettings.Inheritable), textAlignConverter);

// NOTE: textDecorationConverter throws if value it fails.
export var textDecorationProperty = new CssProperty<Style, string>({ name: "textDecoration", cssName: "text-decoration", defaultValue: TextDecoration.none, valueConverter: textDecorationConverter });
textDecorationProperty.register(Style);
// export var textDecorationProperty = new styleProperty.Property("textDecoration", "text-decoration",
//     new PropertyMetadata(TextDecoration.none, PropertyMetadataSettings.None, undefined, isTextDecorationValid), textDecorationConverter);

export var textTransformProperty = new CssProperty<Style, string>({ name: "textTransform", cssName: "text-transform", defaultValue: TextTransform.none, valueConverter: textTransformConverter });
textTransformProperty.register(Style);
// export var textTransformProperty = new styleProperty.Property("textTransform", "text-transform",
//     new PropertyMetadata(TextTransform.none, PropertyMetadataSettings.None, undefined, isTextTransformValid), textTransformConverter);

export var letterSpacingProperty = new CssProperty<Style, number>({ name: "letterSpacing", cssName: "letter-spacing", defaultValue: Number.NaN, affectsLayout: affectsIOSLayout, valueConverter: isFloatValueConverter });
letterSpacingProperty.register(Style);
// export var letterSpacingProperty = new styleProperty.Property("letterSpacing", "letter-spacing",
//     new PropertyMetadata(Number.NaN, AffectsLayout, undefined, isFloatValueValid), floatConverter);

export var whiteSpaceProperty = new CssProperty<Style, string>({ name: "whiteSpace", cssName: "white-space", valueConverter: whiteSpaceConverter });
whiteSpaceProperty.register(Style);
// export var whiteSpaceProperty = new styleProperty.Property("whiteSpace", "white-space",
//     new PropertyMetadata(undefined, AffectsLayout, undefined, isWhiteSpaceValid), whiteSpaceConverter);

// // Helper property holding most layout related properties available in CSS.
// // When layout related properties are set in CSS we chache them and send them to the native view in a single call.
// export var nativeLayoutParamsProperty = new CssProperty<Style, definition.CommonLayoutParams>(
//     {
//         name: "nativeLayoutParams", cssName: "nativeLayoutParams",
//         defaultValue: {
//             width: -1,
//             widthPercent: -1,
//             height: -1,
//             heightPercent: -1,
//             leftMargin: 0,
//             leftMarginPercent: -1,
//             topMargin: 0,
//             topMarginPercent: -1,
//             rightMargin: 0,
//             rightMarginPercent: -1,
//             bottomMargin: 0,
//             bottomMarginPercent: -1,
//             horizontalAlignment: HorizontalAlignment.stretch,
//             verticalAlignment: VerticalAlignment.stretch
//         },
//         equalityComparer: layoutParamsComparer
//     });
// nativeLayoutParamsProperty.register(Style);
// export var nativeLayoutParamsProperty = new styleProperty.Property("nativeLayoutParams", "nativeLayoutParams",
//     new PropertyMetadata({
//         width: -1,
//         widthPercent: -1,
//         height: -1,
//         heightPercent: -1,
//         leftMargin: 0,
//         leftMarginPercent: -1,
//         topMargin: 0,
//         topMarginPercent: -1,
//         rightMargin: 0,
//         rightMarginPercent: -1,
//         bottomMargin: 0,
//         bottomMarginPercent: -1,
//         horizontalAlignment: HorizontalAlignment.stretch,
//         verticalAlignment: VerticalAlignment.stretch
//     }, null, null, null, layoutParamsComparer));

// TODO: Use different converter that calls isMinWidthHeightValid.
export let minWidthProperty = new CssProperty<Style, number>({ name: "minWidth", cssName: "min-width", defaultValue: 0, affectsLayout: affectsIOSLayout });
minWidthProperty.register(Style);
// export var minWidthProperty = new styleProperty.Property("minWidth", "min-width",
//     new PropertyMetadata(0, AffectsLayout, null, isMinWidthHeightValid), numberConverter);

export let minHeightProperty = new CssProperty<Style, number>({ name: "minHeight", cssName: "min-height", defaultValue: 0, affectsLayout: affectsIOSLayout });
minHeightProperty.register(Style);
// export var minHeightProperty = new styleProperty.Property("minHeight", "min-height",
//     new PropertyMetadata(0, AffectsLayout, null, isMinWidthHeightValid), numberConverter);

export let widthProperty = new CssProperty<Style, number>({ name: "width", cssName: "width", defaultValue: -1, affectsLayout: affectsIOSLayout });
widthProperty.register(Style);
// export var widthProperty = new styleProperty.Property("width", "width",
//     new PropertyMetadata(Number.NaN, AffectsLayout, onLayoutParamsChanged, isWidthHeightValid), numberOrPercentConverter);

export let heightProperty = new CssProperty<Style, number>({ name: "height", cssName: "height", defaultValue: -1, affectsLayout: affectsIOSLayout });
heightProperty.register(Style);
// export var heightProperty = new styleProperty.Property("height", "height",
//     new PropertyMetadata(Number.NaN, AffectsLayout, onLayoutParamsChanged, isWidthHeightValid), numberOrPercentConverter);

export let marginProperty = new CssProperty<Style, Thickness>({ name: "margin", cssName: "margin", defaultValue: { left: 0, top: 0, right: 0, bottom: 0 }, affectsLayout: affectsIOSLayout });
marginProperty.register(Style);

export let marginLeftProperty = new CssProperty<Style, number>({ name: "marginLeft", cssName: "margin-left", defaultValue: 0, affectsLayout: affectsIOSLayout });
marginLeftProperty.register(Style);
// export var marginLeftProperty = new styleProperty.Property("marginLeft", "margin-left",
//     new PropertyMetadata(0, AffectsLayout, onLayoutParamsChanged, isMarginValid), numberOrPercentConverter);

export let marginRightProperty = new CssProperty<Style, number>({ name: "marginRight", cssName: "margin-right", defaultValue: 0, affectsLayout: affectsIOSLayout });
marginRightProperty.register(Style);
// export var marginRightProperty = new styleProperty.Property("marginRight", "margin-right",
//     new PropertyMetadata(0, AffectsLayout, onLayoutParamsChanged, isMarginValid), numberOrPercentConverter);

export let marginTopProperty = new CssProperty<Style, number>({ name: "marginTop", cssName: "margin-top", defaultValue: 0, affectsLayout: affectsIOSLayout });
marginTopProperty.register(Style);
// export var marginTopProperty = new styleProperty.Property("marginTop", "margin-top",
//     new PropertyMetadata(0, AffectsLayout, onLayoutParamsChanged, isMarginValid), numberOrPercentConverter);

export let marginBottomProperty = new CssProperty<Style, number>({ name: "marginBottom", cssName: "margin-bottom", defaultValue: 0, affectsLayout: affectsIOSLayout });
marginBottomProperty.register(Style);
// export var marginBottomProperty = new styleProperty.Property("marginBottom", "margin-bottom",
//     new PropertyMetadata(0, AffectsLayout, onLayoutParamsChanged, isMarginValid), numberOrPercentConverter);

// function getNativePadding(nativeView: android.view.View, callback: (view: android.view.View) => number): NativeValueResult {
//     return {
//         result: nativeView ? callback(nativeView) / utils.layout.getDisplayDensity() : 0,
//         cacheable: !!nativeView
//     };
// }

// function getNativePaddingLeft(instance: DependencyObservable): NativeValueResult {
//     var nativeView: android.view.View = (<any>instance)._nativeView;
//     return getNativePadding(nativeView, (view) => { return view.getPaddingLeft(); });
// }

// function getNativePaddingTop(instance: DependencyObservable): NativeValueResult {
//     var nativeView: android.view.View = (<any>instance)._nativeView;
//     return getNativePadding(nativeView, (view) => { return view.getPaddingTop(); });
// }

// function getNativePaddingRight(instance: DependencyObservable): NativeValueResult {
//     var nativeView: android.view.View = (<any>instance)._nativeView;
//     return getNativePadding(nativeView, (view) => { return view.getPaddingRight(); });
// }

// function getNativePaddingBottom(instance: DependencyObservable): NativeValueResult {
//     var nativeView: android.view.View = (<any>instance)._nativeView;
//     return getNativePadding(nativeView, (view) => { return view.getPaddingBottom(); });
// }

// Helper property holding all paddings. When paddings are set through CSS we cache them and send them to the native view in a single call.
// export let nativePaddingsProperty = new CssProperty<Style, definition.Thickness>({ name: "paddingNative", cssName: "paddingNative", equalityComparer: thicknessComparer });
// nativePaddingsProperty.register(Style);
// export var nativePaddingsProperty = new styleProperty.Property("paddingNative", "paddingNative",
//     new PropertyMetadata(undefined, null, null, null, thicknessComparer));

export let paddingProperty = new CssProperty<Style, definition.Thickness>({ name: "padding", cssName: "padding", defaultValue: { left: 0, top: 0, right: 0, bottom: 0 }, affectsLayout: affectsIOSLayout });
paddingProperty.register(Style);

export let paddingLeftProperty = new CssProperty<Style, number>({ name: "paddingLeft", cssName: "padding-left", defaultValue: 0, affectsLayout: affectsIOSLayout, valueConverter: isNonNegativeFiniteNumberConverter });
paddingLeftProperty.register(Style);
// export var paddingLeftProperty = new styleProperty.Property("paddingLeft", "padding-left",
//     new PropertyMetadata(defaultPadding, AffectsLayout, onPaddingValueChanged, isNonNegativeFiniteNumber), numberConverter);

export let paddingRightProperty = new CssProperty<Style, number>({ name: "paddingRight", cssName: "padding-right", defaultValue: 0, affectsLayout: affectsIOSLayout, valueConverter: isNonNegativeFiniteNumberConverter });
paddingRightProperty.register(Style);
// export var paddingRightProperty = new styleProperty.Property("paddingRight", "padding-right",
//     new PropertyMetadata(defaultPadding, AffectsLayout, onPaddingValueChanged, isNonNegativeFiniteNumber), numberConverter);

export let paddingTopProperty = new CssProperty<Style, number>({ name: "paddingTop", cssName: "padding-top", defaultValue: 0, affectsLayout: affectsIOSLayout, valueConverter: isNonNegativeFiniteNumberConverter });
paddingTopProperty.register(Style);
// export var paddingTopProperty = new styleProperty.Property("paddingTop", "padding-top",
//     new PropertyMetadata(defaultPadding, AffectsLayout, onPaddingValueChanged, isNonNegativeFiniteNumber), numberConverter);

export let paddingBottomProperty = new CssProperty<Style, number>({ name: "paddingBottom", cssName: "padding-bottom", defaultValue: 0, affectsLayout: affectsIOSLayout, valueConverter: isNonNegativeFiniteNumberConverter });
paddingBottomProperty.register(Style);
// export var paddingBottomProperty = new styleProperty.Property("paddingBottom", "padding-bottom",
//     new PropertyMetadata(defaultPadding, AffectsLayout, onPaddingValueChanged, isNonNegativeFiniteNumber), numberConverter);

export let verticalAlignmentProperty = new CssProperty<Style, string>({ name: "verticalAlignment", cssName: "vertical-align", defaultValue: VerticalAlignment.stretch, affectsLayout: affectsIOSLayout });
verticalAlignmentProperty.register(Style);
// export var verticalAlignmentProperty = new styleProperty.Property("verticalAlignment", "vertical-align",
//     new PropertyMetadata(VerticalAlignment.stretch, AffectsLayout, onLayoutParamsChanged));

// Helper property holding most layout related properties available in CSS.
// When layout related properties are set in CSS we chache them and send them to the native view in a single call.
export var nativeLayoutParamsProperty = new styleProperty.Property("nativeLayoutParams", "nativeLayoutParams",
    new PropertyMetadata({
        width: -1,
        widthPercent: -1,
        height: -1,
        heightPercent: -1,
        leftMargin: 0,
        leftMarginPercent: -1,
        topMargin: 0,
        topMarginPercent: -1,
        rightMargin: 0,
        rightMarginPercent: -1,
        bottomMargin: 0,
        bottomMarginPercent: -1,
        horizontalAlignment: enums.HorizontalAlignment.stretch,
        verticalAlignment: enums.VerticalAlignment.stretch
    }, null, null, null, layoutParamsComparer));

// // TODO: separate into .android/.ios files so that there is no need for such checks
// if (isAndroid) {
//     paddingTopProperty.defaultValueGetter = getNativePaddingTop;
//     paddingLeftProperty.defaultValueGetter = getNativePaddingLeft;
//     paddingRightProperty.defaultValueGetter = getNativePaddingRight;
//     paddingBottomProperty.defaultValueGetter = getNativePaddingBottom;
// }

// function onPaddingChanged(value: any): Array<styleProperty.KeyValuePair<styleProperty.Property, any>> {
//     var thickness = parseThickness(value);
//     var array = new Array<styleProperty.KeyValuePair<styleProperty.Property, any>>();
//     array.push({ property: paddingTopProperty, value: thickness.top });
//     array.push({ property: paddingRightProperty, value: thickness.right });
//     array.push({ property: paddingBottomProperty, value: thickness.bottom });
//     array.push({ property: paddingLeftProperty, value: thickness.left });
//     return array;
// }

// function onMarginChanged(value: any): Array<styleProperty.KeyValuePair<styleProperty.Property, any>> {
//     var thickness = parseMargin(value);
//     var array = new Array<styleProperty.KeyValuePair<styleProperty.Property, any>>();
//     array.push({ property: marginTopProperty, value: thickness.top });
//     array.push({ property: marginRightProperty, value: thickness.right });
//     array.push({ property: marginBottomProperty, value: thickness.bottom });
//     array.push({ property: marginLeftProperty, value: thickness.left });
//     return array;
// }

function onFontChanged(style: Style, oldValue: Font, newValue: Font): void {
    // TODO: Do we need these here?
    style.fontFamily = newValue.fontFamily;
    style.fontStyle = newValue.fontStyle;
    style.fontWeight = newValue.fontWeight;
    style.fontSize = newValue.fontSize;
}

export let transformProperty = new CssProperty<Style, Object>({ name: "transform", cssName: "transform", defaultValue: "none", valueChanged: onTransformChanged, valueConverter: transformConverter });
transformProperty.register(Style);

function onTransformChanged(style: Style, oldValue: Object, value: Object): void {
    for (var transform in value) {
        switch (transform) {
            case "scaleX":
                style.scaleX = parseFloat(value[transform]);
                break;
            case "scaleY":
                style.scaleY = parseFloat(value[transform]);
                break;
            case "scale":
            case "scale3d":
                let scaleValues = value[transform].split(",");
                if (scaleValues.length > 2) {
                    style.scaleX = parseFloat(scaleValues[0]);
                    style.scaleY = parseFloat(scaleValues[1]);
                }  else if (values.length === 1) {
		    style.scaleX = parseFloat(scaleValues[0]);
                    style.scaleY = parseFloat(scaleValues[0]);
		}
                break;
            case "translateX":
                style.translateX = parseFloat(value[transform]);
                break;
            case "translateY":
                style.translateY = parseFloat(value[transform]);
                break;
            case "translate":
            case "translate3d":
                let values = value[transform].split(",");
                if (values.length > 2) {
                    style.translateX = parseFloat(values[0]);
                    style.translateY = parseFloat(values[1]);
                } else if (values.length === 1) {
		    style.translateX = parseFloat(values[0]);
                    style.translateY = parseFloat(values[0]);
		}
                break;
            case "rotate":
                let text = value[transform];
                let val = parseFloat(text);
                if (text.slice(-3) === "rad") {
                    val = val * (180.0 / Math.PI);
                }
                style.rotate = val;
                break;
            case "none":
                style.scaleX = 1;
                style.scaleY = 1;
                style.translateX = 0;
                style.translateY = 0;
                style.rotate = 0;
                break;
        }
    }
}

// register default shorthand callbacks.
// styleProperty.registerShorthandCallback("font", onFontChanged);
// styleProperty.registerShorthandCallback("margin", onMarginChanged);
// styleProperty.registerShorthandCallback("padding", onPaddingChanged);
// styleProperty.registerShorthandCallback("transform", onTransformChanged);
