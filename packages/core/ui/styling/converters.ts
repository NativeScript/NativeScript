import { CoreTypes } from '../../core-types';

const STYLE_CURVE_MAP = Object.freeze({
	ease: CoreTypes.AnimationCurve.ease,
	linear: CoreTypes.AnimationCurve.linear,
	'ease-in': CoreTypes.AnimationCurve.easeIn,
	'ease-out': CoreTypes.AnimationCurve.easeOut,
	'ease-in-out': CoreTypes.AnimationCurve.easeInOut,
	spring: CoreTypes.AnimationCurve.spring,
});

export function timeConverter(value: string): number {
	let result = parseFloat(value);
	if (value.indexOf('ms') === -1) {
		result = result * 1000;
	}

	return Math.max(0.0, result);
}

export function animationTimingFunctionConverter(value: string): any {
	return value ? STYLE_CURVE_MAP[value] || parseCubicBezierCurve(value) : CoreTypes.AnimationCurve.ease;
}

function parseCubicBezierCurve(value: string) {
	const coordsString = /\((.*?)\)/.exec(value);
	const coords = coordsString && coordsString[1].split(',').map(stringToBezieCoords);

	if (value.startsWith('cubic-bezier') && coordsString && coords.length === 4) {
		const [x1, x2, y1, y2] = [...coords];

		return CoreTypes.AnimationCurve.cubicBezier(x1, x2, y1, y2);
	} else {
		throw new Error(`Invalid value for animation: ${value}`);
	}
}

function stringToBezieCoords(value: string): number {
	const result = parseFloat(value);
	if (result < 0) {
		return 0;
	} else if (result > 1) {
		return 1;
	}

	return result;
}
