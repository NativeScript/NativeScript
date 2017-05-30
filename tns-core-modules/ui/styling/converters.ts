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

import { hasDuplicates } from "../../utils/utils";
import { radiansToDegrees } from "../../utils/number-utils";

const IDENTITY_TRANSFORMATION = {
    translate: { x: 0, y: 0 },
    rotate: 0,
    scale: { x: 1, y: 1 },
};

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

const STYLE_TRANSFORMATION_MAP = Object.freeze({
    "scale": value => ({ property: "scale", value }),
    "scale3d": value => ({ property: "scale", value }),
    "scaleX": ({x}) => ({ property: "scale", value: { x, y: IDENTITY_TRANSFORMATION.scale.y } }),
    "scaleY": ({y}) => ({ property: "scale", value: { y, x: IDENTITY_TRANSFORMATION.scale.x } }),

    "translate": value => ({ property: "translate", value }),
    "translate3d": value => ({ property: "translate", value }),
    "translateX": ({x}) => ({ property: "translate", value: { x, y: IDENTITY_TRANSFORMATION.translate.y } }),
    "translateY": ({y}) => ({ property: "translate", value: { y, x: IDENTITY_TRANSFORMATION.translate.x } }),

    "rotate": value => ({ property: "rotate", value }),
});

export function transformConverter(text: string): TransformFunctionsInfo {
    const transformations = parseTransformString(text);

    if (text === "none" || text === "" || !transformations.length) {
        return IDENTITY_TRANSFORMATION;
    }

    const usedTransforms = transformations.map(t => t.property);
    if (!hasDuplicates(usedTransforms)) {
        const fullTransformations = Object.assign({}, IDENTITY_TRANSFORMATION);
        transformations.forEach(transform => {
            fullTransformations[transform.property] = transform.value;
        });

        return fullTransformations;
    }

   const affineMatrix = transformations
        .map(getTransformMatrix)
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
            matches.push(normalizeTransformation({ property, value }));
        }
    }

    return matches;
}

function normalizeTransformation({ property, value }: Transformation) { 
    return STYLE_TRANSFORMATION_MAP[property](value);
}

function convertTransformValue(property: string, stringValue: string)
    : TransformationValue {

    const [x, y = x] = stringValue.split(",").map(parseFloat);

    if (property === "rotate") {
        return stringValue.slice(-3) === "rad" ? radiansToDegrees(x) : x;
    }

    return y ? { x, y } : x;
}

