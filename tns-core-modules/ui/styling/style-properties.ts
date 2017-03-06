import { Color } from "color";
import { Font, parseFont, FontStyle, FontWeight } from "ui/styling/font";
import { isDataURI, isFileOrResourcePath, layout } from "utils/utils";
import { Background } from "ui/styling/background";
import { isIOS } from "platform";

// TODO: Remove this and start using string as source (for android).
import { fromFileOrResource, fromBase64, fromUrl } from "image-source";

import { Style } from "ui/styling/style";

import { unsetValue, CssProperty, CssAnimationProperty, ShorthandProperty, InheritedCssProperty, makeValidator, makeParser } from "ui/core/properties";

function equalsCommon(a: Length, b: Length): boolean;
function equalsCommon(a: PercentLength, b: PercentLength): boolean;
function equalsCommon(a: PercentLength, b: PercentLength): boolean {
    if (a == "auto") { // tslint:disable-line
        return b == "auto";  // tslint:disable-line
    }
    if (typeof a === "number") {
        if (b == "auto") { // tslint:disable-line
            return false;
        }
        if (typeof b === "number") {
            return a == b; // tslint:disable-line
        }
        return b.unit == "dip" && a == b.value; // tslint:disable-line
    }
    if (b == "auto") { // tslint:disable-line
        return false;
    }
    if (typeof b === "number") {
        return a.unit == "dip" && a.value == b; // tslint:disable-line
    }
    return a.value == b.value && a.unit == b.unit; // tslint:disable-line
}

function convertToStringCommon(length: Length | PercentLength): string {
    if (length == "auto") { // tslint:disable-line
        return "auto";
    }

    if (typeof length === "number") {
        return length.toString();
    }

    let val = length.value;
    if (length.unit === "%") {
        val *= 100;
    }

    return val + length.unit;
}

function toDevicePixelsCommon(length: Length, auto: number): number;
function toDevicePixelsCommon(length: PercentLength, auto: number, parentSize: number): number;
function toDevicePixelsCommon(length: PercentLength, auto: number, parentAvailableWidth?: number): number {
    if (length == "auto") { // tslint:disable-line
        return auto;
    }
    if (typeof length === "number") {
        return Math.round(layout.getDisplayDensity() * length);
    }
    switch (length.unit) {
        case "px":
            return Math.round(length.value);
        default:
        case "dip":
            return Math.round(layout.getDisplayDensity() * length.value);
        case "%":
            return Math.round(parentAvailableWidth * length.value);
    }
}

export type PercentLength = "auto" | number | {
    readonly unit: "%" | "dip" | "px";
    readonly value: number;
}

export namespace PercentLength {
    export function parse(value: string | Length): PercentLength {
        if (value == "auto") { // tslint:disable-line
            return "auto";
        }
        if (typeof value === "string") {
            let type: "%" | "dip" | "px";
            let numberValue = 0;
            let stringValue = value.trim();
            let percentIndex = stringValue.indexOf("%");
            if (percentIndex !== -1) {
                type = "%";
                // if only % or % is not last we treat it as invalid value.
                if (percentIndex !== (stringValue.length - 1) || percentIndex === 0) {
                    numberValue = Number.NaN;
                } else {
                    numberValue = parseFloat(stringValue.substring(0, stringValue.length - 1).trim()) / 100;
                }
            } else {
                if (stringValue.indexOf("px") !== -1) {
                    type = "px";
                    stringValue = stringValue.replace("px", "").trim();
                } else {
                    type = "dip";
                }

                numberValue = parseFloat(stringValue);
            }

            if (isNaN(numberValue) || !isFinite(numberValue)) {
                throw new Error(`Invalid value: ${value}`);
            }

            return {
                value: numberValue,
                unit: type
            };
        } else {
            return value;
        }
    }

    export const equals: { (a: PercentLength, b: PercentLength): boolean } = equalsCommon;
    export const toDevicePixels: { (length: PercentLength, auto: number, parentAvailableWidth: number): number } = toDevicePixelsCommon;
    export const convertToString: { (length: PercentLength): string } = convertToStringCommon;
}

export type Length = "auto" | number | {
    readonly unit: "dip" | "px";
    readonly value: number;
};

export namespace Length {
    export function parse(value: string | Length): Length {
        if (value == "auto") { // tslint:disable-line
            return "auto";
        } else if (typeof value === "string") {
            let type: "dip" | "px";
            let numberValue = 0;
            let stringValue = value.trim();
            if (stringValue.indexOf("px") !== -1) {
                type = "px";
                stringValue = stringValue.replace("px", "").trim();
            } else {
                type = "dip";
            }

            numberValue = parseFloat(stringValue);

            if (isNaN(numberValue) || !isFinite(numberValue)) {
                throw new Error(`Invalid value: ${value}`);
            }

            return {
                value: numberValue,
                unit: type
            };
        } else {
            return value;
        }
    }
    export const equals: { (a: Length, b: Length): boolean } = equalsCommon;
    export const toDevicePixels: { (length: Length, auto: number): number } = toDevicePixelsCommon;
    export const convertToString: { (length: Length): string } = convertToStringCommon;
}

export const zeroLength: Length = { value: 0, unit: "px" };

export const minWidthProperty = new CssProperty<Style, Length>({
    name: "minWidth", cssName: "min-width", defaultValue: zeroLength, affectsLayout: isIOS, equalityComparer: Length.equals,
    valueChanged: (target, oldValue, newValue) => {
        target.view.effectiveMinWidth = Length.toDevicePixels(newValue, 0);
    }, valueConverter: Length.parse
});
minWidthProperty.register(Style);

export const minHeightProperty = new CssProperty<Style, Length>({
    name: "minHeight", cssName: "min-height", defaultValue: zeroLength, affectsLayout: isIOS, equalityComparer: Length.equals,
    valueChanged: (target, oldValue, newValue) => {
        target.view.effectiveMinHeight = Length.toDevicePixels(newValue, 0);
    }, valueConverter: Length.parse
});
minHeightProperty.register(Style);

export const widthProperty = new CssProperty<Style, PercentLength>({ name: "width", cssName: "width", defaultValue: "auto", affectsLayout: isIOS, equalityComparer: Length.equals, valueConverter: PercentLength.parse });
widthProperty.register(Style);

export const heightProperty = new CssProperty<Style, PercentLength>({ name: "height", cssName: "height", defaultValue: "auto", affectsLayout: isIOS, equalityComparer: Length.equals, valueConverter: PercentLength.parse });
heightProperty.register(Style);

const marginProperty = new ShorthandProperty<Style, string | PercentLength>({
    name: "margin", cssName: "margin",
    getter: function (this: Style) {
        if (PercentLength.equals(this.marginTop, this.marginRight) &&
            PercentLength.equals(this.marginTop, this.marginBottom) &&
            PercentLength.equals(this.marginTop, this.marginLeft)) {
            return this.marginTop;
        }
        return `${PercentLength.convertToString(this.marginTop)} ${PercentLength.convertToString(this.marginRight)} ${PercentLength.convertToString(this.marginBottom)} ${PercentLength.convertToString(this.marginLeft)}`;
    },
    converter: convertToMargins
});
marginProperty.register(Style);

export const marginLeftProperty = new CssProperty<Style, PercentLength>({ name: "marginLeft", cssName: "margin-left", defaultValue: zeroLength, affectsLayout: isIOS, equalityComparer: Length.equals, valueConverter: PercentLength.parse });
marginLeftProperty.register(Style);

export const marginRightProperty = new CssProperty<Style, PercentLength>({ name: "marginRight", cssName: "margin-right", defaultValue: zeroLength, affectsLayout: isIOS, equalityComparer: Length.equals, valueConverter: PercentLength.parse });
marginRightProperty.register(Style);

export const marginTopProperty = new CssProperty<Style, PercentLength>({ name: "marginTop", cssName: "margin-top", defaultValue: zeroLength, affectsLayout: isIOS, equalityComparer: Length.equals, valueConverter: PercentLength.parse });
marginTopProperty.register(Style);

export const marginBottomProperty = new CssProperty<Style, PercentLength>({ name: "marginBottom", cssName: "margin-bottom", defaultValue: zeroLength, affectsLayout: isIOS, equalityComparer: Length.equals, valueConverter: PercentLength.parse });
marginBottomProperty.register(Style);

const paddingProperty = new ShorthandProperty<Style, string | Length>({
    name: "padding", cssName: "padding",
    getter: function (this: Style) {
        if (Length.equals(this.paddingTop, this.paddingRight) &&
            Length.equals(this.paddingTop, this.paddingBottom) &&
            Length.equals(this.paddingTop, this.paddingLeft)) {
            return this.paddingTop;
        }
        return `${Length.convertToString(this.paddingTop)} ${Length.convertToString(this.paddingRight)} ${Length.convertToString(this.paddingBottom)} ${Length.convertToString(this.paddingLeft)}`;
    },
    converter: convertToPaddings
});
paddingProperty.register(Style);

export const paddingLeftProperty = new CssProperty<Style, Length>({
    name: "paddingLeft", cssName: "padding-left", defaultValue: zeroLength, affectsLayout: isIOS, equalityComparer: Length.equals,
    valueChanged: (target, oldValue, newValue) => {
        target.view.effectivePaddingLeft = Length.toDevicePixels(newValue, 0);
    }, valueConverter: Length.parse
});
paddingLeftProperty.register(Style);

export const paddingRightProperty = new CssProperty<Style, Length>({
    name: "paddingRight", cssName: "padding-right", defaultValue: zeroLength, affectsLayout: isIOS, equalityComparer: Length.equals,
    valueChanged: (target, oldValue, newValue) => {
        target.view.effectivePaddingRight = Length.toDevicePixels(newValue, 0);
    }, valueConverter: Length.parse
});
paddingRightProperty.register(Style);

export const paddingTopProperty = new CssProperty<Style, Length>({
    name: "paddingTop", cssName: "padding-top", defaultValue: zeroLength, affectsLayout: isIOS, equalityComparer: Length.equals,
    valueChanged: (target, oldValue, newValue) => {
        target.view.effectivePaddingTop = Length.toDevicePixels(newValue, 0);
    }, valueConverter: Length.parse
});
paddingTopProperty.register(Style);

export const paddingBottomProperty = new CssProperty<Style, Length>({
    name: "paddingBottom", cssName: "padding-bottom", defaultValue: zeroLength, affectsLayout: isIOS, equalityComparer: Length.equals,
    valueChanged: (target, oldValue, newValue) => {
        target.view.effectivePaddingBottom = Length.toDevicePixels(newValue, 0);
    }, valueConverter: Length.parse
});
paddingBottomProperty.register(Style);

export type HorizontalAlignment = "left" | "center" | "right" | "stretch";
export namespace HorizontalAlignment {
    export const LEFT: "left" = "left";
    export const CENTER: "center" = "center";
    export const RIGHT: "right" = "right";
    export const STRETCH: "stretch" = "stretch";
    export const isValid = makeValidator<HorizontalAlignment>(LEFT, CENTER, RIGHT, STRETCH);
    export const parse = makeParser<HorizontalAlignment>(isValid);
}

export const horizontalAlignmentProperty = new CssProperty<Style, HorizontalAlignment>({ name: "horizontalAlignment", cssName: "horizontal-align", defaultValue: HorizontalAlignment.STRETCH, affectsLayout: isIOS, valueConverter: HorizontalAlignment.parse });
horizontalAlignmentProperty.register(Style);

export type VerticalAlignment = "top" | "middle" | "bottom" | "stretch";
export namespace VerticalAlignment {
    export const TOP: "top" = "top";
    export const MIDDLE: "middle" = "middle";
    export const BOTTOM: "bottom" = "bottom";
    export const STRETCH: "stretch" = "stretch";
    export const isValid = makeValidator<VerticalAlignment>(TOP, MIDDLE, BOTTOM, STRETCH);
    export const parse = (value: string) => value.toLowerCase() === "center" ? MIDDLE : parseStrict(value);
    const parseStrict = makeParser<VerticalAlignment>(isValid);
}

export const verticalAlignmentProperty = new CssProperty<Style, VerticalAlignment>({ name: "verticalAlignment", cssName: "vertical-align", defaultValue: VerticalAlignment.STRETCH, affectsLayout: isIOS, valueConverter: VerticalAlignment.parse });
verticalAlignmentProperty.register(Style);

interface Thickness {
    top: string;
    right: string;
    bottom: string;
    left: string;
}

function parseThickness(value: string): Thickness {
    if (typeof value === "string") {
        let arr = value.split(/[ ,]+/);

        let top: string;
        let right: string;
        let bottom: string;
        let left: string;

        if (arr.length === 1) {
            top = arr[0];
            right = arr[0];
            bottom = arr[0];
            left = arr[0];
        }
        else if (arr.length === 2) {
            top = arr[0];
            bottom = arr[0];
            right = arr[1];
            left = arr[1];
        }
        else if (arr.length === 3) {
            top = arr[0];
            right = arr[1];
            left = arr[1];
            bottom = arr[2];
        }
        else if (arr.length === 4) {
            top = arr[0];
            right = arr[1];
            bottom = arr[2];
            left = arr[3];
        }
        else {
            throw new Error("Expected 1, 2, 3 or 4 parameters. Actual: " + value);
        }

        return {
            top: top,
            right: right,
            bottom: bottom,
            left: left
        };
    } else {
        return value;
    }
}

function convertToMargins(this: void, value: string | PercentLength): [CssProperty<any, any>, any][] {
    if (typeof value === "string" && value !== "auto") {
        let thickness = parseThickness(value);
        return [
            [marginTopProperty, PercentLength.parse(thickness.top)],
            [marginRightProperty, PercentLength.parse(thickness.right)],
            [marginBottomProperty, PercentLength.parse(thickness.bottom)],
            [marginLeftProperty, PercentLength.parse(thickness.left)]
        ];
    }
    else {
        return [
            [marginTopProperty, value],
            [marginRightProperty, value],
            [marginBottomProperty, value],
            [marginLeftProperty, value]
        ];
    }
}

function convertToPaddings(this: void, value: string | Length): [CssProperty<any, any>, any][] {
    if (typeof value === "string" && value !== "auto") {
        let thickness = parseThickness(value);
        return [
            [paddingTopProperty, Length.parse(thickness.top)],
            [paddingRightProperty, Length.parse(thickness.right)],
            [paddingBottomProperty, Length.parse(thickness.bottom)],
            [paddingLeftProperty, Length.parse(thickness.left)]
        ];
    }
    else {
        return [
            [paddingTopProperty, value],
            [paddingRightProperty, value],
            [paddingBottomProperty, value],
            [paddingLeftProperty, value]
        ];
    }
}

export const rotateProperty = new CssAnimationProperty<Style, number>({ name: "rotate", cssName: "rotate", defaultValue: 0, valueConverter: parseFloat });
rotateProperty.register(Style);

export const scaleXProperty = new CssAnimationProperty<Style, number>({ name: "scaleX", cssName: "scaleX", defaultValue: 1, valueConverter: parseFloat });
scaleXProperty.register(Style);

export const scaleYProperty = new CssAnimationProperty<Style, number>({ name: "scaleY", cssName: "scaleY", defaultValue: 1, valueConverter: parseFloat });
scaleYProperty.register(Style);

export const translateXProperty = new CssAnimationProperty<Style, Length>({ name: "translateX", cssName: "translateX", defaultValue: 0, valueConverter: Length.parse, equalityComparer: Length.equals });
translateXProperty.register(Style);

export const translateYProperty = new CssAnimationProperty<Style, Length>({ name: "translateY", cssName: "translateY", defaultValue: 0, valueConverter: Length.parse, equalityComparer: Length.equals });
translateYProperty.register(Style);

const transformProperty = new ShorthandProperty<Style, string>({
    name: "transform", cssName: "transform",
    getter: function (this: Style) {
        let scaleX = this.scaleX;
        let scaleY = this.scaleY;
        let translateX = this.translateX;
        let translateY = this.translateY;
        let rotate = this.rotate;
        let result = "";
        if (translateX !== 0 || translateY !== 0) {
            result += `translate(${translateX}, ${translateY}) `;
        }
        if (scaleX !== 1 || scaleY !== 1) {
            result += `scale(${scaleX}, ${scaleY}) `;
        }
        if (rotate !== 0) {
            result += `rotate (${rotate})`;
        }

        return result.trim();
    },
    converter: convertToTransform
});
transformProperty.register(Style);

function transformConverter(value: string): Object {
    if (value.indexOf("none") !== -1) {
        let operations = {};
        operations[value] = value;
        return operations;
    }

    let operations = {};
    let operator = "";
    let pos = 0;
    while (pos < value.length) {
        if (value[pos] === " " || value[pos] === ",") {
            pos++;
        }
        else if (value[pos] === "(") {
            let start = pos + 1;
            while (pos < value.length && value[pos] !== ")") {
                pos++;
            }
            let operand = value.substring(start, pos);
            operations[operator] = operand.trim();
            operator = "";
            pos++;
        }
        else {
            operator += value[pos++];
        }
    }
    return operations;
}

function convertToTransform(value: string): [CssProperty<any, any>, any][] {
    let newTransform = value === unsetValue ? { "none": "none" } : transformConverter(value);
    let array = [];
    let values: Array<string>;
    for (let transform in newTransform) {
        switch (transform) {
            case "scaleX":
                array.push([scaleXProperty, newTransform[transform]]);
                break;
            case "scaleY":
                array.push([scaleYProperty, newTransform[transform]]);
                break;
            case "scale":
            case "scale3d":
                values = newTransform[transform].split(",");
                if (values.length >= 2) {
                    array.push([scaleXProperty, values[0]]);
                    array.push([scaleYProperty, values[1]]);
                }
                else if (values.length === 1) {
                    array.push([scaleXProperty, values[0]]);
                    array.push([scaleYProperty, values[0]]);
                }
                break;
            case "translateX":
                array.push([translateXProperty, newTransform[transform]]);
                break;
            case "translateY":
                array.push([translateYProperty, newTransform[transform]]);
                break;
            case "translate":
            case "translate3d":
                values = newTransform[transform].split(",");
                if (values.length >= 2) {
                    array.push([translateXProperty, values[0]]);
                    array.push([translateYProperty, values[1]]);
                }
                else if (values.length === 1) {
                    array.push([translateXProperty, values[0]]);
                    array.push([translateYProperty, values[0]]);
                }
                break;
            case "rotate":
                let text = newTransform[transform];
                let val = parseFloat(text);
                if (text.slice(-3) === "rad") {
                    val = val * (180.0 / Math.PI);
                }
                array.push([rotateProperty, val]);
                break;
            case "none":
                array.push([scaleXProperty, 1]);
                array.push([scaleYProperty, 1]);
                array.push([translateXProperty, 0]);
                array.push([translateYProperty, 0]);
                array.push([rotateProperty, 0]);
                break;
        }
    }
    return array;
}

// Background properties.
export const backgroundInternalProperty = new CssProperty<Style, Background>({
    name: "backgroundInternal",
    cssName: "_backgroundInternal",
    defaultValue: Background.default
});
backgroundInternalProperty.register(Style);

let pattern: RegExp = /url\(('|")(.*?)\1\)/;
export const backgroundImageProperty = new CssProperty<Style, string>({
    name: "backgroundImage", cssName: "background-image", valueChanged: (target, oldValue, newValue) => {

        let style = target;
        let currentBackground = target.backgroundInternal;
        let url: string = newValue;
        let isValid = false;

        if (url === undefined) {
            style.backgroundInternal = currentBackground.withImage(undefined);
            return;
        }

        let match = url.match(pattern);
        if (match && match[2]) {
            url = match[2];
        }

        if (isDataURI(url)) {
            let base64Data = url.split(",")[1];
            if (typeof base64Data !== "undefined") {
                style.backgroundInternal = currentBackground.withImage(fromBase64(base64Data));
                isValid = true;
            } else {
                style.backgroundInternal = currentBackground.withImage(undefined);
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
                    currentBackground = target.backgroundInternal;
                    target.backgroundInternal = currentBackground.withImage(r);
                }
            });
            isValid = true;
        }

        if (!isValid) {
            style.backgroundInternal = currentBackground.withImage(undefined);
        }
    }
});
backgroundImageProperty.register(Style);

export const backgroundColorProperty = new CssAnimationProperty<Style, Color>({
    name: "backgroundColor", cssName: "background-color", valueChanged: (target, oldValue, newValue) => {
        let background = target.backgroundInternal;
        target.backgroundInternal = background.withColor(newValue);
    }, equalityComparer: Color.equals, valueConverter: (value) => new Color(value)
});
backgroundColorProperty.register(Style);

export type BackgroundRepeat = "repeat" | "repeat-x" | "repeat-y" | "no-repeat";
export namespace BackgroundRepeat {
    export const REPEAT: "repeat" = "repeat";
    export const REPEAT_X: "repeat-x" = "repeat-x";
    export const REPEAT_Y: "repeat-y" = "repeat-y";
    export const NO_REPEAT: "no-repeat" = "no-repeat";
    export const isValid = makeValidator<BackgroundRepeat>(REPEAT, REPEAT_X, REPEAT_Y, NO_REPEAT);
    export const parse = makeParser<BackgroundRepeat>(isValid);
}

export const backgroundRepeatProperty = new CssProperty<Style, BackgroundRepeat>({
    name: "backgroundRepeat", cssName: "background-repeat", valueConverter: BackgroundRepeat.parse,
    valueChanged: (target, oldValue, newValue) => {
        let background = target.backgroundInternal;
        target.backgroundInternal = background.withRepeat(newValue);
    }
});
backgroundRepeatProperty.register(Style);

export const backgroundSizeProperty = new CssProperty<Style, string>({
    name: "backgroundSize", cssName: "background-size", valueChanged: (target, oldValue, newValue) => {
        let background = target.backgroundInternal;
        target.backgroundInternal = background.withSize(newValue);
    }
});
backgroundSizeProperty.register(Style);

export const backgroundPositionProperty = new CssProperty<Style, string>({
    name: "backgroundPosition", cssName: "background-position", valueChanged: (target, oldValue, newValue) => {
        let background = target.backgroundInternal;
        target.backgroundInternal = background.withPosition(newValue);
    }
});
backgroundPositionProperty.register(Style);

function parseBorderColor(value: string): { top: Color, right: Color, bottom: Color, left: Color } {
    let result: { top: Color, right: Color, bottom: Color, left: Color } = { top: undefined, right: undefined, bottom: undefined, left: undefined };
    if (value.indexOf("rgb") === 0) {
        result.top = result.right = result.bottom = result.left = new Color(value);
        return result;
    }

    let arr = value.split(/[ ,]+/);
    if (arr.length === 1) {
        let arr0 = new Color(arr[0]);
        result.top = arr0;
        result.right = arr0;
        result.bottom = arr0;
        result.left = arr0;
    }
    else if (arr.length === 2) {
        let arr0 = new Color(arr[0]);
        let arr1 = new Color(arr[1]);
        result.top = arr0;
        result.right = arr1;
        result.bottom = arr0;
        result.left = arr1;
    }
    else if (arr.length === 3) {
        let arr0 = new Color(arr[0]);
        let arr1 = new Color(arr[1]);
        let arr2 = new Color(arr[2]);
        result.top = arr0;
        result.right = arr1;
        result.bottom = arr2;
        result.left = arr1;
    }
    else if (arr.length === 4) {
        let arr0 = new Color(arr[0]);
        let arr1 = new Color(arr[1]);
        let arr2 = new Color(arr[2]);
        let arr3 = new Color(arr[3]);
        result.top = arr0;
        result.right = arr1;
        result.bottom = arr2;
        result.left = arr3;
    }
    else {
        throw new Error(`Expected 1, 2, 3 or 4 parameters. Actual: ${value}`);
    }
    return result;
}

// Border Color properties.
const borderColorProperty = new ShorthandProperty<Style, string | Color>({
    name: "borderColor", cssName: "border-color",
    getter: function (this: Style) {
        if (Color.equals(this.borderTopColor, this.borderRightColor) &&
            Color.equals(this.borderTopColor, this.borderBottomColor) &&
            Color.equals(this.borderTopColor, this.borderLeftColor)) {
            return this.borderTopColor;
        }
        else {
            return `${this.borderTopColor} ${this.borderRightColor} ${this.borderBottomColor} ${this.borderLeftColor}`;
        }
    },
    converter: function (value) {
        if (typeof value === "string") {
            let fourColors = parseBorderColor(value);
            return [
                [borderTopColorProperty, fourColors.top],
                [borderRightColorProperty, fourColors.right],
                [borderBottomColorProperty, fourColors.bottom],
                [borderLeftColorProperty, fourColors.left]
            ];
        }
        else {
            return [
                [borderTopColorProperty, value],
                [borderRightColorProperty, value],
                [borderBottomColorProperty, value],
                [borderLeftColorProperty, value]
            ];
        }
    }
});
borderColorProperty.register(Style);

export const borderTopColorProperty = new CssProperty<Style, Color>({
    name: "borderTopColor", cssName: "border-top-color", valueChanged: (target, oldValue, newValue) => {
        let background = target.backgroundInternal;
        target.backgroundInternal = background.withBorderTopColor(newValue);
    }, equalityComparer: Color.equals, valueConverter: (value) => new Color(value)
});
borderTopColorProperty.register(Style);

export const borderRightColorProperty = new CssProperty<Style, Color>({
    name: "borderRightColor", cssName: "border-right-color", valueChanged: (target, oldValue, newValue) => {
        let background = target.backgroundInternal;
        target.backgroundInternal = background.withBorderRightColor(newValue);
    }, equalityComparer: Color.equals, valueConverter: (value) => new Color(value)
});
borderRightColorProperty.register(Style);

export const borderBottomColorProperty = new CssProperty<Style, Color>({
    name: "borderBottomColor", cssName: "border-bottom-color", valueChanged: (target, oldValue, newValue) => {
        let background = target.backgroundInternal;
        target.backgroundInternal = background.withBorderBottomColor(newValue);
    }, equalityComparer: Color.equals, valueConverter: (value) => new Color(value)
});
borderBottomColorProperty.register(Style);

export const borderLeftColorProperty = new CssProperty<Style, Color>({
    name: "borderLeftColor", cssName: "border-left-color", valueChanged: (target, oldValue, newValue) => {
        let background = target.backgroundInternal;
        target.backgroundInternal = background.withBorderLeftColor(newValue);
    }, equalityComparer: Color.equals, valueConverter: (value) => new Color(value)
});
borderLeftColorProperty.register(Style);

// Border Width properties.
const borderWidthProperty = new ShorthandProperty<Style, string | Length>({
    name: "borderWidth", cssName: "border-width",
    getter: function (this: Style) {
        if (Length.equals(this.borderTopWidth, this.borderRightWidth) &&
            Length.equals(this.borderTopWidth, this.borderBottomWidth) &&
            Length.equals(this.borderTopWidth, this.borderLeftWidth)) {
            return this.borderTopWidth;
        }
        else {
            return `${Length.convertToString(this.borderTopWidth)} ${Length.convertToString(this.borderRightWidth)} ${Length.convertToString(this.borderBottomWidth)} ${Length.convertToString(this.borderLeftWidth)}`;
        }
    },
    converter: function (value) {
        if (typeof value === "string" && value !== "auto") {
            let borderWidths = parseThickness(value);
            return [
                [borderTopWidthProperty, borderWidths.top],
                [borderRightWidthProperty, borderWidths.right],
                [borderBottomWidthProperty, borderWidths.bottom],
                [borderLeftWidthProperty, borderWidths.left]
            ];
        }
        else {
            return [
                [borderTopWidthProperty, value],
                [borderRightWidthProperty, value],
                [borderBottomWidthProperty, value],
                [borderLeftWidthProperty, value]
            ];
        }
    }
});
borderWidthProperty.register(Style);

export const borderTopWidthProperty = new CssProperty<Style, Length>({
    name: "borderTopWidth", cssName: "border-top-width", defaultValue: zeroLength, affectsLayout: isIOS, equalityComparer: Length.equals,
    valueChanged: (target, oldValue, newValue) => {
        let value = Length.toDevicePixels(newValue, 0);
        if (!isNonNegativeFiniteNumber(value)) {
            throw new Error(`border-top-width should be Non-Negative Finite number. Value: ${value}`);
        }

        target.view.effectiveBorderTopWidth = value;
        let background = target.backgroundInternal;
        target.backgroundInternal = background.withBorderTopWidth(value);
    }, valueConverter: Length.parse
});
borderTopWidthProperty.register(Style);

export const borderRightWidthProperty = new CssProperty<Style, Length>({
    name: "borderRightWidth", cssName: "border-right-width", defaultValue: zeroLength, affectsLayout: isIOS, equalityComparer: Length.equals,
    valueChanged: (target, oldValue, newValue) => {
        let value = Length.toDevicePixels(newValue, 0);
        if (!isNonNegativeFiniteNumber(value)) {
            throw new Error(`border-right-width should be Non-Negative Finite number. Value: ${value}`);
        }

        target.view.effectiveBorderRightWidth = value;
        let background = target.backgroundInternal;
        target.backgroundInternal = background.withBorderRightWidth(value);
    }, valueConverter: Length.parse
});
borderRightWidthProperty.register(Style);

export const borderBottomWidthProperty = new CssProperty<Style, Length>({
    name: "borderBottomWidth", cssName: "border-bottom-width", defaultValue: zeroLength, affectsLayout: isIOS, equalityComparer: Length.equals,
    valueChanged: (target, oldValue, newValue) => {
        let value = Length.toDevicePixels(newValue, 0);
        if (!isNonNegativeFiniteNumber(value)) {
            throw new Error(`border-bottom-width should be Non-Negative Finite number. Value: ${value}`);
        }

        target.view.effectiveBorderBottomWidth = value;
        let background = target.backgroundInternal;
        target.backgroundInternal = background.withBorderBottomWidth(value);
    }, valueConverter: Length.parse
});
borderBottomWidthProperty.register(Style);

export const borderLeftWidthProperty = new CssProperty<Style, Length>({
    name: "borderLeftWidth", cssName: "border-left-width", defaultValue: zeroLength, affectsLayout: isIOS, equalityComparer: Length.equals,
    valueChanged: (target, oldValue, newValue) => {
        let value = Length.toDevicePixels(newValue, 0);
        if (!isNonNegativeFiniteNumber(value)) {
            throw new Error(`border-left-width should be Non-Negative Finite number. Value: ${value}`);
        }

        target.view.effectiveBorderLeftWidth = value;
        let background = target.backgroundInternal;
        target.backgroundInternal = background.withBorderLeftWidth(value);
    }, valueConverter: Length.parse
});
borderLeftWidthProperty.register(Style);

// Border Radius properties.
const borderRadiusProperty = new ShorthandProperty<Style, string | Length>({
    name: "borderRadius", cssName: "border-radius",
    getter: function (this: Style) {
        if (Length.equals(this.borderTopLeftRadius, this.borderTopRightRadius) &&
            Length.equals(this.borderTopLeftRadius, this.borderBottomRightRadius) &&
            Length.equals(this.borderTopLeftRadius, this.borderBottomLeftRadius)) {
            return this.borderTopLeftRadius;
        }
        return `${Length.convertToString(this.borderTopLeftRadius)} ${Length.convertToString(this.borderTopRightRadius)} ${Length.convertToString(this.borderBottomRightRadius)} ${Length.convertToString(this.borderBottomLeftRadius)}`;
    },
    converter: function (value) {
        if (typeof value === "string") {
            let borderRadius = parseThickness(value);
            return [
                [borderTopLeftRadiusProperty, borderRadius.top],
                [borderTopRightRadiusProperty, borderRadius.right],
                [borderBottomRightRadiusProperty, borderRadius.bottom],
                [borderBottomLeftRadiusProperty, borderRadius.left]
            ];
        }
        else {
            return [
                [borderTopLeftRadiusProperty, value],
                [borderTopRightRadiusProperty, value],
                [borderBottomRightRadiusProperty, value],
                [borderBottomLeftRadiusProperty, value]
            ];
        }
    }
});
borderRadiusProperty.register(Style);

export const borderTopLeftRadiusProperty = new CssProperty<Style, Length>({
    name: "borderTopLeftRadius", cssName: "border-top-left-radius", defaultValue: 0, affectsLayout: isIOS, valueChanged: (target, oldValue, newValue) => {
        let value = Length.toDevicePixels(newValue, 0);
        if (!isNonNegativeFiniteNumber(value)) {
            throw new Error(`border-top-left-radius should be Non-Negative Finite number. Value: ${value}`);
        }
        let background = target.backgroundInternal;
        target.backgroundInternal = background.withBorderTopLeftRadius(value);
    }, valueConverter: Length.parse
});
borderTopLeftRadiusProperty.register(Style);

export const borderTopRightRadiusProperty = new CssProperty<Style, Length>({
    name: "borderTopRightRadius", cssName: "border-top-right-radius", defaultValue: 0, affectsLayout: isIOS, valueChanged: (target, oldValue, newValue) => {
        let value = Length.toDevicePixels(newValue, 0);
        if (!isNonNegativeFiniteNumber(value)) {
            throw new Error(`border-top-right-radius should be Non-Negative Finite number. Value: ${value}`);
        }
        let background = target.backgroundInternal;
        target.backgroundInternal = background.withBorderTopRightRadius(value);
    }, valueConverter: Length.parse
});
borderTopRightRadiusProperty.register(Style);

export const borderBottomRightRadiusProperty = new CssProperty<Style, Length>({
    name: "borderBottomRightRadius", cssName: "border-bottom-right-radius", defaultValue: 0, affectsLayout: isIOS, valueChanged: (target, oldValue, newValue) => {
        let value = Length.toDevicePixels(newValue, 0);
        if (!isNonNegativeFiniteNumber(value)) {
            throw new Error(`border-bottom-right-radius should be Non-Negative Finite number. Value: ${value}`);
        }
        let background = target.backgroundInternal;
        target.backgroundInternal = background.withBorderBottomRightRadius(value);
    }, valueConverter: Length.parse
});
borderBottomRightRadiusProperty.register(Style);

export const borderBottomLeftRadiusProperty = new CssProperty<Style, Length>({
    name: "borderBottomLeftRadius", cssName: "border-bottom-left-radius", defaultValue: 0, affectsLayout: isIOS, valueChanged: (target, oldValue, newValue) => {
        let value = Length.toDevicePixels(newValue, 0);
        if (!isNonNegativeFiniteNumber(value)) {
            throw new Error(`border-bottom-left-radius should be Non-Negative Finite number. Value: ${value}`);
        }
        let background = target.backgroundInternal;
        target.backgroundInternal = background.withBorderBottomLeftRadius(value);
    }, valueConverter: Length.parse
});
borderBottomLeftRadiusProperty.register(Style);

function isNonNegativeFiniteNumber(value: number): boolean {
    return isFinite(value) && !isNaN(value) && value >= 0;
}

let supportedPaths = ["rect", "circle", "ellipse", "polygon", "inset"];
function isClipPathValid(value: string): boolean {
    if (!value) {
        return true;
    }
    let functionName = value.substring(0, value.indexOf("(")).trim();
    return supportedPaths.indexOf(functionName) !== -1;
}

export const clipPathProperty = new CssProperty<Style, string>({
    name: "clipPath", cssName: "clip-path", valueChanged: (target, oldValue, newValue) => {
        if (!isClipPathValid(newValue)) {
            throw new Error("clip-path is not valid.");
        }

        let background = target.backgroundInternal;
        target.backgroundInternal = background.withClipPath(newValue);
    }
});
clipPathProperty.register(Style);

function isFloatValueConverter(value: string): number {
    let newValue = parseFloat(value);
    if (isNaN(newValue)) {
        throw new Error(`Invalid value: ${newValue}`);
    }

    return newValue;
}

export const zIndexProperty = new CssProperty<Style, number>({ name: "zIndex", cssName: "z-index", defaultValue: Number.NaN, valueConverter: isFloatValueConverter });
zIndexProperty.register(Style);

function opacityConverter(value: any): number {
    let newValue = parseFloat(value);
    if (!isNaN(newValue) && 0 <= newValue && newValue <= 1) {
        return newValue;
    }

    throw new Error(`Opacity should be between [0, 1]. Value: ${newValue}`);
}

export const opacityProperty = new CssAnimationProperty<Style, number>({ name: "opacity", cssName: "opacity", defaultValue: 1, valueConverter: opacityConverter });
opacityProperty.register(Style);

export const colorProperty = new InheritedCssProperty<Style, Color>({ name: "color", cssName: "color", equalityComparer: Color.equals, valueConverter: (v) => new Color(v) });
colorProperty.register(Style);

export const fontInternalProperty = new CssProperty<Style, Font>({ name: "fontInternal", cssName: "_fontInternal", defaultValue: Font.default });
fontInternalProperty.register(Style);

export const fontFamilyProperty = new InheritedCssProperty<Style, string>({
    name: "fontFamily", cssName: "font-family", affectsLayout: isIOS, valueChanged: (target, oldValue, newValue) => {
        let currentFont = target.fontInternal;
        if (currentFont.fontFamily !== newValue) {
            const newFont = currentFont.withFontFamily(newValue);
            target.fontInternal = Font.equals(Font.default, newFont) ? unsetValue : newFont;
        }
    }
});
fontFamilyProperty.register(Style);

export const fontSizeProperty = new InheritedCssProperty<Style, number>({
    name: "fontSize", cssName: "font-size", affectsLayout: isIOS, valueChanged: (target, oldValue, newValue) => {
        let currentFont = target.fontInternal;
        if (currentFont.fontSize !== newValue) {
            const newFont = currentFont.withFontSize(newValue);
            target.fontInternal = Font.equals(Font.default, newFont) ? unsetValue : newFont;
        }
    },
    valueConverter: (v) => parseFloat(v)
});
fontSizeProperty.register(Style);

export const fontStyleProperty = new InheritedCssProperty<Style, FontStyle>({
    name: "fontStyle", cssName: "font-style", affectsLayout: isIOS, defaultValue: FontStyle.NORMAL, valueConverter: FontStyle.parse, valueChanged: (target, oldValue, newValue) => {
        let currentFont = target.fontInternal;
        if (currentFont.fontStyle !== newValue) {
            const newFont = currentFont.withFontStyle(newValue);
            target.fontInternal = Font.equals(Font.default, newFont) ? unsetValue : newFont;
        }
    }
});
fontStyleProperty.register(Style);

export const fontWeightProperty = new InheritedCssProperty<Style, FontWeight>({
    name: "fontWeight", cssName: "font-weight", affectsLayout: isIOS, defaultValue: FontWeight.NORMAL, valueConverter: FontWeight.parse, valueChanged: (target, oldValue, newValue) => {
        let currentFont = target.fontInternal;
        if (currentFont.fontWeight !== newValue) {
            const newFont = currentFont.withFontWeight(newValue);
            target.fontInternal = Font.equals(Font.default, newFont) ? unsetValue : newFont;
        }
    }
});
fontWeightProperty.register(Style);

const fontProperty = new ShorthandProperty<Style, string>({
    name: "font", cssName: "font",
    getter: function (this: Style) {
        return `${this.fontStyle} ${this.fontWeight} ${this.fontSize} ${this.fontFamily}`;
    },
    converter: function (value) {
        if (value === unsetValue) {
            return [
                [fontStyleProperty, unsetValue],
                [fontWeightProperty, unsetValue],
                [fontSizeProperty, unsetValue],
                [fontFamilyProperty, unsetValue]
            ];
        } else {
            const font = parseFont(value);
            const fontSize = parseFloat(font.fontSize);

            return [
                [fontStyleProperty, font.fontStyle],
                [fontWeightProperty, font.fontWeight],
                [fontSizeProperty, fontSize],
                [fontFamilyProperty, font.fontFamily]
            ];
        }
    }
});
fontProperty.register(Style);

export type Visibility = "visible" | "hidden" | "collapse";
export namespace Visibility {
    export const VISIBLE: "visible" = "visible";
    export const HIDDEN: "hidden" = "hidden";
    export const COLLAPSE: "collapse" = "collapse";
    export const isValid = makeValidator<Visibility>(VISIBLE, HIDDEN, COLLAPSE);
    export const parse = (value: string) => value.toLowerCase() === "collapsed" ? COLLAPSE : parseStrict(value);
    const parseStrict = makeParser<Visibility>(isValid);
}

export const visibilityProperty = new CssProperty<Style, Visibility>({
    name: "visibility", cssName: "visibility", defaultValue: Visibility.VISIBLE, affectsLayout: isIOS, valueConverter: Visibility.parse, valueChanged: (target, oldValue, newValue) => {
        target.view.isCollapsed = (newValue === Visibility.COLLAPSE);
    }
});
visibilityProperty.register(Style);