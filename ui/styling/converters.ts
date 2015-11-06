import color = require("color");
import enums = require("ui/enums");

export function colorConverter(value: string): color.Color {
    return new color.Color(value);
}

export function fontSizeConverter(value: string): number {
    // TODO: parse different unit types
    var result: number = parseFloat(value);
    return result;
}

export function textAlignConverter(value: string): string {
    switch (value) {
        case enums.TextAlignment.left:
        case enums.TextAlignment.center:
        case enums.TextAlignment.right:
            return value;
        default:
            throw new Error("CSS text-align \"" + value + "\" is not supported.");
    }
}

export function textDecorationConverter(value: string): string {
    var values = (value + "").split(" ");

    if (values.indexOf(enums.TextDecoration.underline) !== -1 || values.indexOf(enums.TextDecoration.lineThrough) !== -1) {
        return value;
    } else {
        throw new Error("CSS text-decoration \"" + value + "\" is not supported.");
    }
}

export var numberConverter = parseFloat;

export function visibilityConverter(value: string): string {
    if (value.toLowerCase() === enums.Visibility.collapsed) {
        return enums.Visibility.collapsed;
    } else if (value.toLowerCase() === enums.Visibility.collapse) {
        return enums.Visibility.collapse;
    }
    return enums.Visibility.visible;
}

export function opacityConverter(value: string): number {
    var result = parseFloat(value);
    result = Math.max(0.0, result);
    result = Math.min(1.0, result);

    return result;
}

