import { CoreTypes } from '../../core-types';
import { Color } from '../../color';
import { parseCSSShorthand } from './css-utils';

export interface StrokeCSSValues {
	width: CoreTypes.LengthType;
	color: Color;
}

/**
 * Parse a string into StrokeCSSValues
 * https://developer.mozilla.org/en-US/docs/Web/CSS/-webkit-text-stroke
 * @param value
 */
export function parseCSSStroke(value: string): StrokeCSSValues {
	const data = parseCSSShorthand(value);
	const [width] = data.values;

	return {
		width,
		color: data.color ? new Color(data.color) : undefined,
	};
}
