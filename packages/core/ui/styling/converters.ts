import { CoreTypes } from '../../core-types';

const STYLE_CURVE_MAP = Object.freeze({
	ease: CoreTypes.AnimationCurve.ease,
	linear: CoreTypes.AnimationCurve.linear,
	'ease-in': CoreTypes.AnimationCurve.easeIn,
	'ease-out': CoreTypes.AnimationCurve.easeOut,
	'ease-in-out': CoreTypes.AnimationCurve.easeInOut,
	spring: CoreTypes.AnimationCurve.spring,
});

/**
 * Converts a time value string to milliseconds.
 * Supports both 's' (seconds) and 'ms' (milliseconds) units.
 * @param value The time value as a string (e.g., '1s', '500ms', '2.5')
 * @returns Time in milliseconds, always >= 0
 * @throws Error if the input is not a valid time value
 */
export function timeConverter(value: string): number {
	if (!value || typeof value !== 'string') {
		throw new Error(`Invalid time value: '${value}'. Expected a string with time value.`);
	}

	const numericValue = parseFloat(value);
	if (isNaN(numericValue)) {
		throw new Error(`Invalid time value: '${value}'. Expected a numeric value with optional 's' or 'ms' unit.`);
	}

	let result = numericValue;
	// Convert seconds to milliseconds if 'ms' is not specified
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
		throw new Error(`Invalid cubic-bezier animation timing function: '${value}'. Expected format: cubic-bezier(x1, y1, x2, y2) where coordinates are between 0 and 1.`);
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
