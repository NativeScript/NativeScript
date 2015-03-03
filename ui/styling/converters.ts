import color = require("color");
import enums = require("ui/enums");
import types = require("utils/types");

export function colorConverter(cssValue: any): color.Color {
    return new color.Color(cssValue);
}

export function fontSizeConverter(cssValue: any): number {
    // TODO: parse different unit types
    var result: number = parseFloat(cssValue);
    return result;
}

export function textAlignConverter(cssValue: any): string {
    switch (cssValue) {
        case enums.TextAlignment.left:
        case enums.TextAlignment.center:
        case enums.TextAlignment.right:
            return cssValue;
            break;
        default:
            throw new Error("CSS text-align \"" + cssValue + "\" is not supported.");
            break;
    }
}

export var numberConverter = parseFloat;

export function visibilityConverter(cssValue: any): string {
    if (types.isString(cssValue) && cssValue.toLowerCase() === enums.Visibility.collapsed) {
        return enums.Visibility.collapsed;
    }
    return enums.Visibility.visible;
}

export function opacityConverter(cssValue: any): number {
    var result = parseFloat(cssValue);
    result = Math.max(0.0, result);
    result = Math.min(1.0, result);

    return result;
}

