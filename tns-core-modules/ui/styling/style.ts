import definition = require("ui/styling/style");
import { Observable } from "data/observable";
import { View } from "ui/core/view";
import { Color } from "color";
import { Font } from "ui/styling/font";
import { Background } from "ui/styling/background";
import { isAndroid, isIOS } from "platform";
import { CssProperty, InheritedCssProperty } from "ui/core/properties";
import { fromBase64, fromFileOrResource, fromUrl } from "image-source";
import { isDataURI, isFileOrResourcePath } from "utils/utils";
import { Length } from "ui/core/view";

import {
    HorizontalAlignment, VerticalAlignment, Visibility,
    TextDecoration, TextTransform, TextAlignment,
    WhiteSpace, FontWeight, FontStyle
} from "ui/enums";

import {
    numberConverter, colorConverter, fontSizeConverter,
    textAlignConverter, textDecorationConverter, textTransformConverter,
    whiteSpaceConverter, transformConverter
} from "./converters";

// on Android we explicitly set AffectsLayout to False because android will invalidate its layout when needed so we skip unnecessary native calls.
let affectsIOSLayout = isIOS;

interface Thickness {
    left: Object;
    top: Object;
    right: Object;
    bottom: Object;
}





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
//     let style = <Style>data.object;
//     let thickness: definition.Thickness = {
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
    let result = convertToPercentHelper(value);
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
    let parsedValue: number = parseFloat(value);
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

    _transform: string;
    _cssTransform: string;

    // public _updateTextDecoration() {
    //     if (this.textDecoration !== TextDecoration.none) {
    //         this._applyProperty(textDecorationProperty, this._getValue(textDecorationProperty));
    // }
    //     }

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
    //     let pairs = styleProperty.getShorthandPairs(name, value);
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
// export let rotateProperty = new styleProperty.Property("rotate", "rotate", new PropertyMetadata(undefined, PropertyMetadataSettings.None, null));

export let scaleXProperty = new CssProperty<Style, number>({ name: "scaleX", cssName: "scaleX", defaultValue: 1 });
scaleXProperty.register(Style);
// export let scaleXProperty = new styleProperty.Property("scaleX", "scaleX", new PropertyMetadata(undefined, PropertyMetadataSettings.None, null));

export let scaleYProperty = new CssProperty<Style, number>({ name: "scaleY", cssName: "scaleY", defaultValue: 1 });
scaleYProperty.register(Style);
// export let scaleYProperty = new styleProperty.Property("scaleY", "scaleY", new PropertyMetadata(undefined, PropertyMetadataSettings.None, null));

export let translateXProperty = new CssProperty<Style, number>({ name: "translateX", cssName: "translateX", defaultValue: 0 });
translateXProperty.register(Style);
// export let translateXProperty = new styleProperty.Property("translateX", "translateX", new PropertyMetadata(undefined, PropertyMetadataSettings.None, null));

export let translateYProperty = new CssProperty<Style, number>({ name: "translateY", cssName: "translateY", defaultValue: 0 });
translateYProperty.register(Style);
// export let translateYProperty = new styleProperty.Property("translateY", "translateY", new PropertyMetadata(undefined, PropertyMetadataSettings.None, null));

// NOTE: clip-path should not affects layout.
export let clipPathProperty = new CssProperty<Style, string>({ name: "clipPath", cssName: "clip-path", valueChanged: onClipPathPropertyChanged });
clipPathProperty.register(Style);
// export let clipPathProperty = new styleProperty.Property("clipPath", "clip-path",
//     new PropertyMetadata(undefined, AffectsLayout, onClipPathPropertyChanged, isClipPathValid));

export let color = new InheritedCssProperty<Style, Color>({ name: "color", cssName: "color", equalityComparer: Color.equals, valueConverter: colorConverter });
color.register(Style);
// export let colorProperty = new styleProperty.Property("color", "color", new PropertyMetadata(undefined, PropertyMetadataSettings.Inheritable, undefined, Color.isValid, Color.equals), colorConverter);

export let tintColorProperty = new CssProperty<Style, Color>({ name: "tintColor", cssName: "tint-color", equalityComparer: Color.equals, valueConverter: colorConverter });
tintColorProperty.register(Style);

export let placeholderColorProperty = new CssProperty<Style, Color>({ name: "placeholderColor", cssName: "placeholder-color", equalityComparer: Color.equals, valueConverter: colorConverter });
placeholderColorProperty.register(Style);

export let backgroundColorProperty = new CssProperty<Style, Color>({ name: "backgroundColor", cssName: "background-color", valueChanged: onBackgroundColorPropertyChanged, equalityComparer: Color.equals, valueConverter: colorConverter });
backgroundColorProperty.register(Style);
// export let backgroundColorProperty = new styleProperty.Property("backgroundColor", "background-color",
//     new PropertyMetadata(undefined, PropertyMetadataSettings.None, onBackgroundColorPropertyChanged, Color.isValid, Color.equals), colorConverter);

export let backgroundImageProperty = new CssProperty<Style, string>({ name: "backgroundImage", cssName: "background-image", valueChanged: onBackgroundImagePropertyChanged });
backgroundImageProperty.register(Style);
// export let backgroundImageProperty = new styleProperty.Property("backgroundImage", "background-image", new PropertyMetadata(undefined, PropertyMetadataSettings.None, onBackgroundImagePropertyChanged));

export let backgroundRepeatProperty = new CssProperty<Style, string>({ name: "backgroundRepeat", cssName: "background-repeat", valueChanged: onBackgroundRepeatPropertyChanged });
backgroundRepeatProperty.register(Style);
// export let backgroundRepeatProperty = new styleProperty.Property("backgroundRepeat", "background-repeat",
//     new PropertyMetadata(undefined, PropertyMetadataSettings.None, onBackgroundRepeatPropertyChanged));

export let backgroundSizeProperty = new CssProperty<Style, string>({ name: "backgroundSize", cssName: "background-size", valueChanged: onBackgroundSizePropertyChanged });
backgroundSizeProperty.register(Style);
// export let backgroundSizeProperty = new styleProperty.Property("backgroundSize", "background-size",
//     new PropertyMetadata(undefined, PropertyMetadataSettings.None, onBackgroundSizePropertyChanged));

export let backgroundPositionProperty = new CssProperty<Style, string>({ name: "backgroundPosition", cssName: "background-position", valueChanged: onBackgroundPositionPropertyChanged });
backgroundPositionProperty.register(Style);
// export let backgroundPositionProperty = new styleProperty.Property("backgroundPosition", "background-position",
//     new PropertyMetadata(undefined, PropertyMetadataSettings.None, onBackgroundPositionPropertyChanged));

export let borderColorProperty = new CssProperty<Style, Color>({ name: "borderColor", cssName: "border-color", valueChanged: onBorderColorPropertyChanged, equalityComparer: Color.equals, valueConverter: colorConverter });
borderColorProperty.register(Style);
// export let borderColorProperty = new styleProperty.Property("borderColor", "border-color",
//     new PropertyMetadata(undefined, PropertyMetadataSettings.None, onBorderColorPropertyChanged, Color.isValid, Color.equals), colorConverter);

export let borderTopColorProperty = new CssProperty<Style, Color>({ name: "borderTopColor", cssName: "border-top-color", valueChanged: NOTIMPLEMENTED, equalityComparer: Color.equals, valueConverter: colorConverter });
borderTopColorProperty.register(Style);
export let borderRightColorProperty = new CssProperty<Style, Color>({ name: "borderRightColor", cssName: "border-right-color", valueChanged: NOTIMPLEMENTED, equalityComparer: Color.equals, valueConverter: colorConverter });
borderRightColorProperty.register(Style);
export let borderBottomColorProperty = new CssProperty<Style, Color>({ name: "borderBottomColor", cssName: "border-bottom-color", valueChanged: NOTIMPLEMENTED, equalityComparer: Color.equals, valueConverter: colorConverter });
borderBottomColorProperty.register(Style);
export let borderLeftColorProperty = new CssProperty<Style, Color>({ name: "borderLeftColor", cssName: "border-left-color", valueChanged: NOTIMPLEMENTED, equalityComparer: Color.equals, valueConverter: colorConverter });
borderLeftColorProperty.register(Style);

export let borderWidthProperty = new CssProperty<Style, number>({ name: "borderWidth", cssName: "border-width", defaultValue: 0, affectsLayout: affectsIOSLayout, valueChanged: onBorderWidthPropertyChanged, valueConverter: isNonNegativeFiniteNumberConverter });
borderWidthProperty.register(Style);
// export let borderWidthProperty = new styleProperty.Property("borderWidth", "border-width",
//     new PropertyMetadata(0, AffectsLayout, onBorderWidthPropertyChanged, isNonNegativeFiniteNumber), numberConverter);

export let borderTopWidthProperty = new CssProperty<Style, number>({ name: "borderTopWidth", cssName: "border-top-width", defaultValue: 0, affectsLayout: affectsIOSLayout, valueChanged: NOTIMPLEMENTED, valueConverter: isNonNegativeFiniteNumberConverter });
borderTopWidthProperty.register(Style);
export let borderRightWidthProperty = new CssProperty<Style, number>({ name: "borderRightWidth", cssName: "border-right-width", defaultValue: 0, affectsLayout: affectsIOSLayout, valueChanged: NOTIMPLEMENTED, valueConverter: isNonNegativeFiniteNumberConverter });
borderRightWidthProperty.register(Style);
export let borderBottomWidthProperty = new CssProperty<Style, number>({ name: "borderBottomWidth", cssName: "border-bottom-width", defaultValue: 0, affectsLayout: affectsIOSLayout, valueChanged: NOTIMPLEMENTED, valueConverter: isNonNegativeFiniteNumberConverter });
borderBottomWidthProperty.register(Style);
export let borderLeftWidthProperty = new CssProperty<Style, number>({ name: "borderLeftWidth", cssName: "border-left-width", defaultValue: 0, affectsLayout: affectsIOSLayout, valueChanged: NOTIMPLEMENTED, valueConverter: isNonNegativeFiniteNumberConverter });
borderLeftWidthProperty.register(Style);


export let borderRadiusProperty = new CssProperty<Style, number>({ name: "borderRadius", cssName: "border-radius", defaultValue: 0, affectsLayout: affectsIOSLayout, valueChanged: onBorderRadiusPropertyChanged, valueConverter: isNonNegativeFiniteNumberConverter });
borderRadiusProperty.register(Style);
// export let borderRadiusProperty = new styleProperty.Property("borderRadius", "border-radius",
//     new PropertyMetadata(0, AffectsLayout, onBorderRadiusPropertyChanged, isNonNegativeFiniteNumber), numberConverter);

export let borderTopLeftRadiusProperty = new CssProperty<Style, number>({ name: "borderTopLeftRadius", cssName: "border-top-left-radius", defaultValue: 0, affectsLayout: affectsIOSLayout, valueChanged: NOTIMPLEMENTED, valueConverter: isNonNegativeFiniteNumberConverter });
borderTopLeftRadiusProperty.register(Style);
export let borderTopRightRadiusProperty = new CssProperty<Style, number>({ name: "borderTopRightRadius", cssName: "border-top-right-radius", defaultValue: 0, affectsLayout: affectsIOSLayout, valueChanged: NOTIMPLEMENTED, valueConverter: isNonNegativeFiniteNumberConverter });
borderTopRightRadiusProperty.register(Style);
export let borderBottomRightRadiusProperty = new CssProperty<Style, number>({ name: "borderBottomRightRadius", cssName: "border-bottom-right-radius", defaultValue: 0, affectsLayout: affectsIOSLayout, valueChanged: NOTIMPLEMENTED, valueConverter: isNonNegativeFiniteNumberConverter });
borderBottomRightRadiusProperty.register(Style);
export let borderBottomLeftRadiusProperty = new CssProperty<Style, number>({ name: "borderBottomLeftRadius", cssName: "border-bottom-left-radius", defaultValue: 0, affectsLayout: affectsIOSLayout, valueChanged: NOTIMPLEMENTED, valueConverter: isNonNegativeFiniteNumberConverter });
borderBottomLeftRadiusProperty.register(Style);


export let backgroundInternalProperty = new CssProperty<Style, Background>({ name: "backgroundInternal", cssName: "backgroundInternal", defaultValue: Background.default, equalityComparer: Background.equals });
backgroundInternalProperty.register(Style);
// export let backgroundInternalProperty = new styleProperty.Property("_backgroundInternal", "_backgroundInternal",
//     new PropertyMetadata(Background.default, PropertyMetadataSettings.None, undefined, undefined, Background.equals));

export let fontSizeProperty = new InheritedCssProperty<Style, number>({ name: "fontSize", cssName: "font-size", valueChanged: onFontSizeChanged, valueConverter: fontSizeConverter });
fontSizeProperty.register(Style);
// export let fontSizeProperty = new styleProperty.Property("fontSize", "font-size",
//     new PropertyMetadata(undefined, PropertyMetadataSettings.Inheritable, onFontSizeChanged), fontSizeConverter);

export let fontFamilyProperty = new InheritedCssProperty<Style, string>({ name: "fontFamily", cssName: "font-family", valueChanged: onFontFamilyChanged });
fontFamilyProperty.register(Style);
// export let fontFamilyProperty = new styleProperty.Property("fontFamily", "font-family",
// new PropertyMetadata(undefined, PropertyMetadataSettings.Inheritable, onFontFamilyChanged));

export let fontStyleProperty = new InheritedCssProperty<Style, string>({ name: "fontStyle", cssName: "font-style", defaultValue: FontStyle.normal, valueChanged: onFontStyleChanged });
fontStyleProperty.register(Style);
// export let fontStyleProperty = new styleProperty.Property("fontStyle", "font-style",
//     new PropertyMetadata(FontStyle.normal, PropertyMetadataSettings.Inheritable, onFontStyleChanged, isFontStyleValid));

export let fontWeightProperty = new InheritedCssProperty<Style, string>({ name: "fontWeight", cssName: "font-weight", defaultValue: FontWeight.normal, valueChanged: onFontWeightChanged });
fontWeightProperty.register(Style);
// export let fontWeightProperty = new styleProperty.Property("fontWeight", "font-weight",
//     new PropertyMetadata(FontWeight.normal, PropertyMetadataSettings.Inheritable, onFontWeightChanged, isFontWeightValid));

export let fontProperty = new InheritedCssProperty<Style, Font>({ name: "font", cssName: "font", defaultValue: Font.default, valueChanged: onFontChanged, equalityComparer: Font.equals, valueConverter: Font.parse });
fontProperty.register(Style);
// export let fontInternal = new styleProperty.Property("_fontInternal", "_fontInternal",
//     new PropertyMetadata(Font.default, AffectsLayout, null, null, Font.equals), Font.parse);

export let zIndexProperty = new CssProperty<Style, number>({ name: "zIndex", cssName: "z-index", defaultValue: 0, valueConverter: isFloatValueConverter });
zIndexProperty.register(Style);
// export let zIndexProperty = new styleProperty.Property("zIndex", "z-index",
//     new PropertyMetadata(Number.NaN, AffectsLayout, undefined, isFloatValueValid), floatConverter);

export let visibilityProperty = new CssProperty<Style, string>({ name: "visibility", cssName: "visibility", defaultValue: Visibility.visible, affectsLayout: affectsIOSLayout, valueChanged: onVisibilityChanged });
visibilityProperty.register(Style);
// export let visibilityProperty = new styleProperty.Property("visibility", "visibility",
//     new PropertyMetadata(Visibility.visible, AffectsLayout, onVisibilityChanged, isVisibilityValid), visibilityConverter);

export let opacityProperty = new CssProperty<Style, number>({ name: "opacity", cssName: "opacity", defaultValue: 1, valueConverter: opacityConverter });
opacityProperty.register(Style);
// export let opacityProperty = new styleProperty.Property("opacity", "opacity",
//     new PropertyMetadata(1.0, PropertyMetadataSettings.None, undefined, isOpacityValid), opacityConverter);

// NOTE: text-align should not affects layout.
export let textAlignmentProperty = new InheritedCssProperty<Style, string>({ name: "textAlignment", cssName: "text-align", valueConverter: textAlignConverter });
textAlignmentProperty.register(Style);
// export let textAlignmentProperty = new styleProperty.Property("textAlignment", "text-align",
//     new PropertyMetadata(undefined, AffectsLayout | PropertyMetadataSettings.Inheritable), textAlignConverter);

// NOTE: textDecorationConverter throws if value it fails.
export let textDecorationProperty = new CssProperty<Style, string>({ name: "textDecoration", cssName: "text-decoration", defaultValue: TextDecoration.none, valueConverter: textDecorationConverter });
textDecorationProperty.register(Style);
// export let textDecorationProperty = new styleProperty.Property("textDecoration", "text-decoration",
//     new PropertyMetadata(TextDecoration.none, PropertyMetadataSettings.None, undefined, isTextDecorationValid), textDecorationConverter);

export let textTransformProperty = new CssProperty<Style, string>({ name: "textTransform", cssName: "text-transform", defaultValue: TextTransform.none, valueConverter: textTransformConverter });
textTransformProperty.register(Style);
// export let textTransformProperty = new styleProperty.Property("textTransform", "text-transform",
//     new PropertyMetadata(TextTransform.none, PropertyMetadataSettings.None, undefined, isTextTransformValid), textTransformConverter);

export let letterSpacingProperty = new CssProperty<Style, number>({ name: "letterSpacing", cssName: "letter-spacing", defaultValue: Number.NaN, affectsLayout: affectsIOSLayout, valueConverter: isFloatValueConverter });
letterSpacingProperty.register(Style);
// export let letterSpacingProperty = new styleProperty.Property("letterSpacing", "letter-spacing",
//     new PropertyMetadata(Number.NaN, AffectsLayout, undefined, isFloatValueValid), floatConverter);

export let whiteSpaceProperty = new CssProperty<Style, string>({ name: "whiteSpace", cssName: "white-space", valueConverter: whiteSpaceConverter });
whiteSpaceProperty.register(Style);
// export let whiteSpaceProperty = new styleProperty.Property("whiteSpace", "white-space",
//     new PropertyMetadata(undefined, AffectsLayout, undefined, isWhiteSpaceValid), whiteSpaceConverter);

function onFontChanged(style: Style, oldValue: Font, newValue: Font): void {
    // TODO: Do we need these here?
    style.fontFamily = newValue.fontFamily;
    style.fontStyle = newValue.fontStyle;
    style.fontWeight = newValue.fontWeight;
    style.fontSize = newValue.fontSize;
}

function shorthand(name: string, parser: (value: string) => {}) {
    Object.defineProperty(Style, "css-" + name, {
        set(value: string) {
            const kvps = parser(value);
            for (const key in kvps) {
                const value = kvps[key];
                Style["css-" + key] = value;
            }
        }
    });
    Object.defineProperty(Style, name, {
        set(value: string) {
            const kvps = parser(value);
            for (const key in kvps) {
                const value = kvps[key];
                Style["css-" + key] = value;
            }
        }
    })
}


class ShorthandProperty<T> {
    constructor(name: string, private convert: (value: string) => T, private convertback) {
    }
}

const margin1 = new ShorthandProperty("margin", (value: string) => {
    {
        [this.style.paddingTop]: 
}, () => {
    return `${this.style.paddingTop} ${this.style.paddingRight} ${this.style.paddingBottom} ${this.style.paddingLeft}`;
});

shorthand("transform", {
    get() {
    },
    set(value: string) {
        const parsed = //...
        this["css-translateX"] = parsed.translateX;
    }
});

Object.defineProperty(Style, "css-transform", {
    enumerable: true,
    configurable: true,
    get: function (this: Style): string {
        return this._cssTransform;
    },
    set: function (this: Style, value: string) {
        let oldValue = this._cssTransform;
        this._cssTransform = value;
        if (oldValue !== value) {
            if (oldValue.indexOf("none") !== -1) {
                onCssTransformChanged(this, "none");
            }

            // We reset it from above so no need to 
            if (value.indexOf("none") !== -1)
                onCssTransformChanged(this, transformConverter(value));
        }
    }
})

Object.defineProperty(Style, "transform", {
    enumerable: true,
    configurable: true,
    get: function (this: Style): string {
        return this._transform;
    },
    set: function (this: Style, value: string) {
        let oldValue = this._transform;
        this._transform = value;
        if (oldValue !== value) {
            if (oldValue.indexOf("none") !== -1) {
                onTransformChanged(this, "none");
            }

            // We reset it from above so no need to 
            if (value.indexOf("none") !== -1)
                onTransformChanged(this, transformConverter(value));
        }
    }
})

export let transformProperty = new CssProperty<Style, Object>({ name: "transform", cssName: "transform", defaultValue: "none", valueChanged: onTransformChanged, valueConverter: transformConverter });
transformProperty.register(Style);

function onTransformChanged(stlyle: Style, value: Object): void {
    for (let transform in value) {
        switch (transform) {
            case "scaleX":
                stlyle.scaleX = parseFloat(value[transform]);
                break;

            case "scaleY":
                stlyle.scaleY = parseFloat(value[transform]);
                break;

            case "scale":
            case "scale3d":
                let scaleValues = value[transform].split(",");
                if (scaleValues.length === 2 || scaleValues.length === 3) {
                    stlyle.scaleX = parseFloat(scaleValues[0]);
                    stlyle.scaleY = parseFloat(scaleValues[1]);
                }
                break;

            case "translateX":
                stlyle.translateX = parseFloat(value[transform]);
                break;

            case "translateY":
                stlyle.translateY = parseFloat(value[transform]);
                break;

            case "translate":
            case "translate3d":
                let values = value[transform].split(",");
                if (values.length === 2 || values.length === 3) {
                    stlyle.translateX = parseFloat(values[0]);
                    stlyle.translateY = parseFloat(values[1]);
                }
                break;

            case "rotate":
                let text = value[transform];
                let val = parseFloat(text);
                if (text.slice(-3) === "rad") {
                    val = val * (180.0 / Math.PI);
                }
                stlyle.rotate = val;
                break;

            case "none":
                stlyle.scaleX = 1;
                stlyle.scaleY = 1;
                stlyle.translateX = 0;
                stlyle.translateY = 0;
                stlyle.rotate = 0;
                break;
        }
    }
}

let margin = new ShorthandProperty("margin", [top, right, bottom, left], convert, convertBack);

function onCssTransformChanged(style: Style, value: Object): void {
    for (let transform in value) {
        switch (transform) {
            case "scaleX":
                style[scaleXProperty.cssName] = parseFloat(value[transform]);
                break;

            case "scaleY":
                style[scaleYProperty.cssName] = parseFloat(value[transform]);
                break;

            case "scale":
            case "scale3d":
                let scaleValues = value[transform].split(",");
                if (scaleValues.length >= 2) {
                    style[scaleXProperty.cssName] = parseFloat(scaleValues[0]);
                    style[scaleYProperty.cssName] = parseFloat(scaleValues[1]);
                } else if (scaleValues.length === 1) {
		    style[scaleXProperty.cssName] = parseFloat(scaleValues[0]);
                    style[scaleYProperty.cssName] = parseFloat(scaleValues[0]);
		}
                break;

            case "translateX":
                style[translateXProperty.cssName] = parseFloat(value[transform]);
                break;

            case "translateY":
                style[translateYProperty.cssName] = parseFloat(value[transform]);
                break;

            case "translate":
            case "translate3d":
                let values = value[transform].split(",");
                if (values.length >= 2) {
                    style[translateXProperty.cssName] = parseFloat(values[0]);
                    style[translateYProperty.cssName] = parseFloat(values[1]);
                } else if (values.length === 1) {
		    style[translateXProperty.cssName] = parseFloat(values[0]);
                    style[translateYProperty.cssName] = parseFloat(values[0]);
		}
                break;

            case "rotate":
                let text = value[transform];
                let val = parseFloat(text);
                if (text.slice(-3) === "rad") {
                    val = val * (180.0 / Math.PI);
                }
                style[rotateProperty.cssName] = val;
                break;

            case "none":
                style[scaleXProperty.cssName] = 1;
                style[scaleYProperty.cssName] = 1;
                style[translateXProperty.cssName] = 0;
                style[translateYProperty.cssName] = 0;
                style[rotateProperty.cssName] = 0;
                break;
        }
    }
}

// register default shorthand callbacks.
// styleProperty.registerShorthandCallback("font", onFontChanged);
// styleProperty.registerShorthandCallback("margin", onMarginChanged);
// styleProperty.registerShorthandCallback("padding", onPaddingChanged);
// styleProperty.registerShorthandCallback("transform", onTransformChanged);
