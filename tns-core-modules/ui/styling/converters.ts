import {
    TransformFunctionsInfo,
    Transformation,
    TransformationValue,
    decompose2DTransformMatrix,
    getTransformMatrix,
    matrixArrayToCssMatrix,
    multiplyNDimensionalMatriceArrays,
} from "../../matrix";

import { Color } from "../../color";
import { CubicBezierAnimationCurve } from "../animation";

const TRANSFORM_SPLITTER = new RegExp(/([a-zA-Z\-]+)\((.*?)\)/g);

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

export function transformConverter(text: string): TransformFunctionsInfo {
    if (text === "none" || text === "") {
        return {
            translate: { x: 0, y: 0 },
            rotate: 0,
            scale: { x: 1, y: 1 },
        };
    }

    const affineMatrix = parseTransformString(text)
        .map(getTransformMatrix)
        .reduce((m1, m2) => multiplyNDimensionalMatriceArrays(3, m1, m2))
   const cssMatrix = matrixArrayToCssMatrix(affineMatrix)

   return decompose2DTransformMatrix(cssMatrix);
}

export function parseTransformString(text: string): Transformation[] {
    let matches: Transformation[] = [];
    let match;

    while ((match = TRANSFORM_SPLITTER.exec(text)) !== null) {
        const property = match[1];
        const value = convertTransformValue(match[2]);

        matches.push({ property, value });
    }

    return matches;
}

function convertTransformValue(stringValue: string): TransformationValue {
    const [x, y] = stringValue.split(",").map(parseFloat);

    if (x && y) {
        return { x, y };
    } else {
        return stringValue.slice(-3) === "rad" ? x : degreesToRadians(x);
     }
}

const degreesToRadians = a => a * (Math.PI / 180);
