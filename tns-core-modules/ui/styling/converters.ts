import { 
    Transformation,
    TransformationType,
    TransformationValue,
    TransformFunctionsInfo,
} from "../animation/animation";

import {
    decompose2DTransformMatrix,
    getTransformMatrix,
    matrixArrayToCssMatrix,
    multiplyNDimensionalMatriceArrays,
} from "../../matrix";

import { Color } from "../../color";
import { CubicBezierAnimationCurve } from "../animation";

const TRANSFORM_SPLITTER = new RegExp(/\s*(.+?)\((.*?)\)/g);
const TRANSFORMATIONS = Object.freeze([
    "rotate",
    "translate",
    "translate3d",
    "translateX",
    "translateY",
    "scale",
    "scale3d",
    "scaleX",
    "scaleY",
]);

const IDENTITY_TRANSFORM = Object.freeze({
    translate: { x: 0, y: 0 },
    rotate: 0,
    scale: { x: 1, y: 1 },
});

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
    const transformations = parseTransformString(text);
    if (text === "none" || text === "" || !transformations.length) {
        return IDENTITY_TRANSFORM;
    }

   const affineMatrix = transformations.map(getTransformMatrix)
        .reduce((m1, m2) => multiplyNDimensionalMatriceArrays(3, m1, m2))
   const cssMatrix = matrixArrayToCssMatrix(affineMatrix)

   return decompose2DTransformMatrix(cssMatrix);
}


// using general regex and manually checking the matched
// properties is faster than using more specific regex
// https://jsperf.com/cssparse
export function parseTransformString(text: string): Transformation[] {
    let matches: Transformation[] = [];
    let match;

    while ((match = TRANSFORM_SPLITTER.exec(text)) !== null) {
        const property = match[1];
        const value = convertTransformValue(property, match[2]);

        if (TRANSFORMATIONS.indexOf(property) !== -1) {
            matches.push({ property, value });
        }
    }

    return matches;
}

function convertTransformValue(property: string, stringValue: string)
    : TransformationValue {

    const [x, y = x] = stringValue.split(",").map(parseFloat);

    if (property === "rotate") {
        return stringValue.slice(-3) === "rad" ? x : degreesToRadians(x);
    }

    return { x, y };
}

const degreesToRadians = a => a * (Math.PI / 180);
