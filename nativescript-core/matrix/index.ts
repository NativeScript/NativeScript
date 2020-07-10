import { TransformFunctionsInfo } from '../ui/animation';

import { radiansToDegrees, degreesToRadians } from '../utils/number-utils';

export const getTransformMatrix = ({ property, value }) => TRANSFORM_MATRIXES[property](value);

const TRANSFORM_MATRIXES = {
	scale: ({ x, y }) => [x, 0, 0, 0, y, 0, 0, 0, 1],
	translate: ({ x, y }) => [1, 0, x, 0, 1, y, 0, 0, 1],
	rotate: ({ x, y, z }) => {
		// TODO: Handle rotations over X and Y axis
		const radZ = degreesToRadians(z);
		const cosZ = Math.cos(radZ);
		const sinZ = Math.sin(radZ);

		return [cosZ, -sinZ, 0, sinZ, cosZ, 0, 0, 0, 1];
	},
};

export const matrixArrayToCssMatrix = (m: number[]) => [m[0], m[3], m[1], m[4], m[2], m[5]];

export function multiplyAffine2d(m1: number[], m2: number[]): number[] {
	return [m1[0] * m2[0] + m1[1] * m2[3], m1[0] * m2[1] + m1[1] * m2[4], m1[0] * m2[2] + m1[1] * m2[5] + m1[2], m1[3] * m2[0] + m1[4] * m2[3], m1[3] * m2[1] + m1[4] * m2[4], m1[3] * m2[2] + m1[4] * m2[5] + m1[5]];
}

// TODO: Decompose rotations over X and Y axis
export function decompose2DTransformMatrix(matrix: number[]): TransformFunctionsInfo {
	verifyTransformMatrix(matrix);

	const [A, B, C, D, E, F] = [...matrix];
	const determinant = A * D - B * C;
	const translate = { x: E || 0, y: F || 0 };

	// rewrite with obj destructuring using the identity matrix
	let rotate = 0;
	let scale = { x: 1, y: 1 };
	if (A || B) {
		const R = Math.sqrt(A * A + B * B);
		rotate = B > 0 ? Math.acos(A / R) : -Math.acos(A / R);
		scale = { x: R, y: determinant / R };
	} else if (C || D) {
		const R = Math.sqrt(C * C + D * D);
		rotate = Math.PI / 2 - (D > 0 ? Math.acos(-C / R) : -Math.acos(C / R));
		scale = { x: determinant / R, y: R };
	}

	rotate = radiansToDegrees(rotate);

	return { translate, rotate: { x: 0, y: 0, z: rotate }, scale };
}

function verifyTransformMatrix(matrix: number[]) {
	if (matrix.length < 6) {
		throw new Error('Transform matrix should be 2x3.');
	}
}
