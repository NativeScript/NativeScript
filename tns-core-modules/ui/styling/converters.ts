import { Color } from "color";
import { CubicBezierAnimationCurve } from "ui/animation";

export function colorConverter(value: string): Color {
    return new Color(value);
}

export function floatConverter(value: string): number {
    // TODO: parse different unit types
    const result: number = parseFloat(value);
    return result;
}

export function fontSizeConverter(value: string): number {
    return floatConverter(value);
}

export const numberConverter = parseFloat;

export function visibilityConverter(value: string): string {
    value = value.toLowerCase();
    if (value === "collapsed" || value === "collapse") {
        return "collapse";
    } else if (value === "hidden") {
        return "hidden";
    }
    return "visible";
}

export function opacityConverter(value: string): number {
    let result = parseFloat(value);
    result = Math.max(0.0, result);
    result = Math.min(1.0, result);
    return result;
}

export function timeConverter(value: string): number {
    let result = parseFloat(value);
    if (value.indexOf("ms") === -1) {
        result = result * 1000;
    }

    return Math.max(0.0, result);
}

export function bezieArgumentConverter(value: string): number {
    let result = parseFloat(value);
    result = Math.max(0.0, result);
    result = Math.min(1.0, result);
    return result;
}

export function animationTimingFunctionConverter(value: string): Object {
    let result: Object = "ease";
    switch (value) {
        case "ease":
            result = "ease";
            break;
        case "linear":
            result = "linear";
            break;
        case "ease-in":
            result = "easeIn";
            break;
        case "ease-out":
            result = "easeOut";
            break;
        case "ease-in-out":
            result = "easeInOut";
            break;
        case "spring":
            result = "spring";
            break;
        default:
            if (value.indexOf("cubic-bezier(") === 0) {
                let bezierArr = value.substring(13).split(/[,]+/);
                if (bezierArr.length !== 4) {
                    throw new Error("Invalid value for animation: " + value);
                }

                result = new CubicBezierAnimationCurve(bezieArgumentConverter(bezierArr[0]),
                    bezieArgumentConverter(bezierArr[1]),
                    bezieArgumentConverter(bezierArr[2]),
                    bezieArgumentConverter(bezierArr[3]));
            }
            else {
                throw new Error("Invalid value for animation: " + value);
            }
            break;
    }

    return result;
}

export function transformConverter(value: any): Object {
    if (value === "none") {
        let operations = {};
        operations[value] = value;
        return operations;
    }
    else if (typeof value === "string") {
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
    else {
        return undefined;
    }
}