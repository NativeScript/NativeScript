/**
 * Contains contains utility methods for transforming css matrixes.
 * All methods in this module are experimental and
 * may be changed in a non-major version.
 * @module "matrix"
 */ /** */

export type Transformation = {
    property: TransformationType;
    value?: TransformationValue;
};

export type TransformationType = "rotate" |
    "translate" | "translateX" | "translateY" |
    "scale" | "scaleX" | "scaleY";

export type TransformationValue = number | {x: number, y: number};

export type TransformFunctionsInfo = {
    translate: TransformationValue,
    rotate: number,
    scale: TransformationValue,
}

/**
 * Returns the affine matrix representation of the transformation.
 * @param transformation Property and value of the transformation.
 */
export declare const getTransformMatrix: ({property, value}: Transformation) =>
    number[];


/**
 * Returns the css matrix representation of
 * an affine transformation matrix
 * @param m The flat matrix array to be transformed
 */
export declare const matrixArrayToCssMatrix: (m: number[]) => number[];


/**
 * Multiplies two nxn-dimensional matrix arrays
 * @param n Denotes if the matrices are 2x2-, 3x3-, ..., or nxn- dimensional
 * @param m1 Left-side matrix array
 * @param m2 Right-side matrix array
 */
export declare function multiplyNDimensionalMatriceArrays(
    n: number, m1: number[], m2: number[]): number[];

/**
 * QR decomposition using the Gram–Schmidt process.
 * Decomposes a css matrix to simple transforms - translate, rotate and scale.
 * @param matrix The css matrix array to decompose.
 */
export function decompose2DTransformMatrix(matrix: number[])
    : TransformFunctionsInfo;