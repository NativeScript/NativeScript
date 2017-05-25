export type Transformation = {
    property: TransformationType;
    value?: TransformationValue;
};

export type TransformationType = "rotate" |
    "translate" | "translateX" | "translateY" |
    "scale" | "scaleX" | "scaleY";

export type TransformationValue = number | { x: number, y: number };

export type TransformFunctionsInfo = {
    translate: TransformationValue,
    rotate: number,
    scale: TransformationValue,
}

export const getTransformMatrix = ({property, value}: Transformation) =>
    ALL_TRANSFORM_MATRIXES[property](value);

const MAIN_TRANSFORM_MATRIXES = {
    "scale": ({x = 1, y = 1}) => [
        x, 0, 0,
        0, y, 0,
        0, 0, 1,
    ],
    "translate": ({x = 0, y = 0}) => [
        1, 0, x,
        0, 1, y,
        0, 0, 1,
    ],
    "rotate": angleInRad => [
        Math.cos(angleInRad), -Math.sin(angleInRad), 0,
        Math.sin(angleInRad), Math.cos(angleInRad), 0,
        0, 0, 1,
    ],
};

const ALL_TRANSFORM_MATRIXES = {
    "scale": a => MAIN_TRANSFORM_MATRIXES["scale"]({x: a, y: a}),
    "scale3d": a => MAIN_TRANSFORM_MATRIXES["scale"]({x: a, y: a}),
    "scaleX": x => MAIN_TRANSFORM_MATRIXES["scale"]({x}),
    "scaleY": y => MAIN_TRANSFORM_MATRIXES["scale"]({y}),

    "translate": a => MAIN_TRANSFORM_MATRIXES["translate"]({x: a, y: a}),
    "translate3d": a => MAIN_TRANSFORM_MATRIXES["translate"]({x: a, y: a}),
    "translateX": x => MAIN_TRANSFORM_MATRIXES["translate"]({x}),
    "translateY": y => MAIN_TRANSFORM_MATRIXES["translate"]({y}),

    "rotate": MAIN_TRANSFORM_MATRIXES["rotate"],
};

export const matrixArrayToCssMatrix = (m: number[]) => [
    m[0], m[3], m[1],
    m[4], m[2], m[5],
];

export function multiplyNDimensionalMatriceArrays(
    n: number, m1: number[], m2: number[]): number[] {

    let result = [];

    for (let i = 0; i < n; i += 1) {
        for (let j = 0; j < n; j += 1) {
            let sum = 0;
            for (let k = 0; k < n; k += 1) {
                sum += m1[i * n + k] * m2[k * n + j];
            }
            result[i * n + j] = sum;
        }
    }

    return result;
}

export function decompose2DTransformMatrix(matrix: number[])
    : TransformFunctionsInfo {

    verifyTransformMatrix(matrix);
    return {
        ...getTranslate(matrix),
        ...getRotate(matrix),
        ...getScale(matrix),
    };
}

function verifyTransformMatrix(matrix: number[]) {
    if (matrix.length < 6) {
        throw new Error("Transform matrix should be 2x3.");
    }
}

const getTranslate = (matrix: number[]) => ({
    translate: { x: matrix[4], y: matrix[5] }
});

function getRotate(matrix: number[]): { rotate: number } {
    const [A, B] = [...matrix];

    const radians = Math.atan2(B, A);
    const rotate = radiansToDegrees(radians);

    return {rotate};
}

function getScale(matrix: number[]): { scale: { x, y } } {
    const [A, B, C, D] = [...matrix];
    const determinant = A * D - B * C;

    if (!determinant) {
        return { scale: { x: 0, y: 0 } };
    }

    const multiplier = determinant > 0 ? 1 : -1;
    const x = Math.sqrt(A * A + B * B) * multiplier;
    const y = (determinant / x) * multiplier;

    return { scale: { x, y } };
}

const radiansToDegrees = a => a * (180 / Math.PI);
