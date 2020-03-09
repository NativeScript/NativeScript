/**
 * Contains utility methods for transforming css matrixes.
 * All methods in this module are experimental and
 * may be changed in a non-major version.
 * @module "matrix"
 */ /** */

import { TransformFunctionsInfo } from "../ui/animation/animation";

/**
 * Returns the affine matrix representation of the transformation.
 * @param transformation Property and value of the transformation.
 */
export declare const getTransformMatrix: ({ property, value }) => number[];

/**
 * Returns the css matrix representation of
 * an affine transformation matrix
 * @param m The flat matrix array to be transformed
 */
export declare const matrixArrayToCssMatrix: (m: number[]) => number[];

/**
 * Multiplies two two-dimensional affine matrices
 * https://jsperf.com/array-vs-object-affine-matrices/
 * @param m1 Left-side matrix array
 * @param m2 Right-side matrix array
 */
export declare function multiplyAffine2d(m1: number[], m2: number[]): number[];

/**
 * QR decomposition using the Gram–Schmidt process.
 * Decomposes a css matrix to simple transforms - translate, rotate and scale.
 * @param matrix The css matrix array to decompose.
 */
export function decompose2DTransformMatrix(matrix: number[])
    : TransformFunctionsInfo;
