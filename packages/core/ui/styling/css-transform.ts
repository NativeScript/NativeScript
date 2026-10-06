import { Pair, Transformation, TransformationType, TransformationValue, TransformFunctionsInfo, TranslatePair } from '../animation/animation-types';
import { CoreTypes } from '../../core-types';
import { PercentLength } from './length-shared';
import { radiansToDegrees } from '../../utils/number-utils';
import { decompose2DTransformMatrix, getTransformMatrix, matrixArrayToCssMatrix, multiplyAffine2d } from '../../matrix';
import { hasDuplicates } from '../../utils';

type TransformationStyleMap = {
	[key: string]: (value: TransformationValue) => Transformation;
};

const IDENTITY_TRANSFORMATION = {
	translate: { x: 0, y: 0 },
	rotate: { x: 0, y: 0, z: 0 },
	scale: { x: 1, y: 1 },
};

const TRANSFORM_SPLITTER = new RegExp(/\s*(.+?)\((.*?)\)/g);
const TRANSLATE_TRANSFORMATIONS = Object.freeze<TransformationType[]>(['translate', 'translate3d', 'translateX', 'translateY']);
const TRANSFORMATIONS = Object.freeze<TransformationType[]>(['rotate', 'rotateX', 'rotateY', 'rotate3d', ...TRANSLATE_TRANSFORMATIONS, 'scale', 'scale3d', 'scaleX', 'scaleY']);

const STYLE_TRANSFORMATION_MAP: TransformationStyleMap = Object.freeze<TransformationStyleMap>({
	scale: (value: number) => ({ property: 'scale', value }),
	scale3d: (value: number) => ({ property: 'scale', value }),
	scaleX: ({ x }: Pair) => ({
		property: 'scale',
		value: { x, y: IDENTITY_TRANSFORMATION.scale.y },
	}),
	scaleY: ({ y }: Pair) => ({
		property: 'scale',
		value: { y, x: IDENTITY_TRANSFORMATION.scale.x },
	}),
	translate: (value) => ({ property: 'translate', value }),
	translate3d: (value) => ({ property: 'translate', value }),
	translateX: ({ x }: TranslatePair) => ({
		property: 'translate',
		value: { x, y: IDENTITY_TRANSFORMATION.translate.y },
	}),
	translateY: ({ y }: TranslatePair) => ({
		property: 'translate',
		value: { y, x: IDENTITY_TRANSFORMATION.translate.x },
	}),

	rotate3d: (value) => ({ property: 'rotate', value }),
	rotateX: (x: number) => ({
		property: 'rotate',
		value: {
			x,
			y: IDENTITY_TRANSFORMATION.rotate.y,
			z: IDENTITY_TRANSFORMATION.rotate.z,
		},
	}),
	rotateY: (y: number) => ({
		property: 'rotate',
		value: {
			x: IDENTITY_TRANSFORMATION.rotate.x,
			y,
			z: IDENTITY_TRANSFORMATION.rotate.z,
		},
	}),
	rotate: (z: number) => ({
		property: 'rotate',
		value: {
			x: IDENTITY_TRANSFORMATION.rotate.x,
			y: IDENTITY_TRANSFORMATION.rotate.y,
			z,
		},
	}),
});

export function transformConverter(text: string): TransformFunctionsInfo {
	const transformations = parseTransformString(text);

	if (text === 'none' || text === '' || !transformations.length) {
		return IDENTITY_TRANSFORMATION;
	}

	let usedTransforms = transformations.map((t) => t.property);
	if (hasDuplicates(usedTransforms)) {
		// Percent translate values can't be resolved to a concrete value at
		// parse time (they depend on the view's size), so duplicate translate
		// functions are merged axis-wise instead of going through the matrix
		// multiplication below.
		const duplicated = usedTransforms.filter((property, index) => usedTransforms.indexOf(property) !== index);
		if (duplicated.every((property) => property === 'translate')) {
			mergeTranslateTransformations(transformations);
			usedTransforms = transformations.map((t) => t.property);
		}
	}

	if (!hasDuplicates(usedTransforms)) {
		const fullTransformations = { ...IDENTITY_TRANSFORMATION };
		transformations.forEach((transform) => {
			fullTransformations[transform.property] = transform.value;
		});

		return fullTransformations;
	}

	const affineMatrix = transformations.map(normalizeTransformation).map(getTransformMatrix).reduce(multiplyAffine2d);
	const cssMatrix = matrixArrayToCssMatrix(affineMatrix);

	return decompose2DTransformMatrix(cssMatrix);
}

/**
 * Whether a translate value is a percentage that has to be resolved
 * against the element's own size.
 */
export function isPercentTranslate(value: CoreTypes.PercentLengthType): boolean {
	return (value as CoreTypes.LengthPercentUnit)?.unit === '%';
}

function isTransformType(propertyName: string): propertyName is TransformationType {
	return (TRANSFORMATIONS as string[]).indexOf(propertyName) !== -1;
}

// using general regex and manually checking the matched
// properties is faster than using more specific regex
// https://jsperf.com/cssparse
function parseTransformString(text: string): Transformation[] {
	const matches: Transformation[] = [];
	let match: RegExpExecArray;

	while ((match = TRANSFORM_SPLITTER.exec(text)) !== null) {
		const property = match[1];

		if (isTransformType(property)) {
			const value = convertTransformValue(property, match[2]);
			matches.push(STYLE_TRANSFORMATION_MAP[property](value));
		}
	}

	return matches;
}

function convertTransformValue(property: TransformationType, rawValue: string): TransformationValue {
	if (property === 'rotate' || property === 'rotateX' || property === 'rotateY') {
		const x = parseFloat(rawValue);

		return rawValue.slice(-3) === 'rad' ? radiansToDegrees(x) : x;
	}

	if (TRANSLATE_TRANSFORMATIONS.indexOf(property) !== -1) {
		const values = rawValue.split(',').map(PercentLength.parse);
		const x = values[0];
		const y = property === 'translate' ? (values[1] ?? IDENTITY_TRANSFORMATION.translate.y) : (values[1] ?? x);

		return { x, y };
	}

	const values = rawValue.split(',').map(parseFloat);
	const x = values[0];
	const y = values[1] ?? x;
	const z = values[2] ?? y;

	return { x, y, z };
}

function mergeTranslateTransformations(transformations: Transformation[]): void {
	const xValues: CoreTypes.PercentLengthType[] = [];
	const yValues: CoreTypes.PercentLengthType[] = [];

	for (let i = transformations.length - 1; i >= 0; i--) {
		const transformation = transformations[i];
		if (transformation.property === 'translate') {
			const value = transformation.value as TranslatePair;
			xValues.unshift(value.x);
			yValues.unshift(value.y);
			transformations.splice(i, 1);
		}
	}

	transformations.unshift({ property: 'translate', value: { x: mergeTranslateAxis(xValues), y: mergeTranslateAxis(yValues) } });
}

function mergeTranslateAxis(values: CoreTypes.PercentLengthType[]): CoreTypes.PercentLengthType {
	const nonZero = values.filter((value) => !isZeroTranslate(value));
	if (nonZero.length === 0) {
		return 0;
	}
	if (nonZero.length === 1) {
		return nonZero[0];
	}

	// Values in the same unit can be summed without losing the unit.
	const unit = typeof nonZero[0] === 'object' && nonZero[0] !== null ? nonZero[0].unit : null;
	if (unit !== null && nonZero.every((value) => typeof value === 'object' && value !== null && value.unit === unit)) {
		return { unit, value: nonZero.reduce((sum: number, value: CoreTypes.LengthPercentUnit) => sum + value.value, 0) } as CoreTypes.PercentLengthType;
	}

	// Mixed units can't be combined into a single static value; coerce them
	// to their numeric value like the old parseFloat-based parsing did.
	return nonZero.reduce((sum: number, value) => sum + translateValueToNumber(value), 0);
}

function isZeroTranslate(value: CoreTypes.PercentLengthType): boolean {
	if (typeof value === 'number') {
		return value === 0;
	}
	if (typeof value !== 'object' || value === null) {
		return true;
	}

	return value.value === 0;
}

function translateValueToNumber(value: CoreTypes.PercentLengthType): number {
	if (typeof value === 'number') {
		return value;
	}
	if (typeof value !== 'object' || value === null) {
		return 0;
	}

	// A % value stores its fraction (e.g. -50% => -0.5); the pre-unit-aware
	// parser produced the raw number (-50), which matrix composition keeps.
	return value.unit === '%' ? value.value * 100 : value.value;
}

function normalizeTransformation(transformation: Transformation): Transformation {
	if (transformation.property === 'translate') {
		const { x, y } = transformation.value as TranslatePair;

		return { property: 'translate', value: { x: translateValueToNumber(x), y: translateValueToNumber(y) } };
	}

	return transformation;
}
