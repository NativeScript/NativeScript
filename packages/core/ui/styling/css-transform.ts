import { Pair, Transformation, TransformationValue, TransformFunctionsInfo } from '../animation';
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
const TRANSFORMATIONS = Object.freeze(['rotate', 'rotateX', 'rotateY', 'rotate3d', 'translate', 'translate3d', 'translateX', 'translateY', 'scale', 'scale3d', 'scaleX', 'scaleY']);

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
	translateX: ({ x }: Pair) => ({
		property: 'translate',
		value: { x, y: IDENTITY_TRANSFORMATION.translate.y },
	}),
	translateY: ({ y }: Pair) => ({
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

	const usedTransforms = transformations.map((t) => t.property);
	if (!hasDuplicates(usedTransforms)) {
		const fullTransformations = { ...IDENTITY_TRANSFORMATION };
		transformations.forEach((transform) => {
			fullTransformations[transform.property] = transform.value;
		});

		return fullTransformations;
	}

	const affineMatrix = transformations.map(getTransformMatrix).reduce(multiplyAffine2d);
	const cssMatrix = matrixArrayToCssMatrix(affineMatrix);

	return decompose2DTransformMatrix(cssMatrix);
}

// using general regex and manually checking the matched
// properties is faster than using more specific regex
// https://jsperf.com/cssparse
function parseTransformString(text: string): Transformation[] {
	const matches: Transformation[] = [];
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

function normalizeTransformation({ property, value }: Transformation): Transformation {
	return STYLE_TRANSFORMATION_MAP[property](value);
}

function convertTransformValue(property: string, stringValue: string): TransformationValue {
	const values = stringValue.split(',').map(parseFloat);
	const x = values[0];

	let y = values[1];
	let z = values[2];

	if (property === 'translate') {
		y ??= IDENTITY_TRANSFORMATION.translate.y;
	} else {
		y ??= x;
		z ??= y;
	}

	if (property === 'rotate' || property === 'rotateX' || property === 'rotateY') {
		return stringValue.slice(-3) === 'rad' ? radiansToDegrees(x) : x;
	}

	return { x, y, z };
}
