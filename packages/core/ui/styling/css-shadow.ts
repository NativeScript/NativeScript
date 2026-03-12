import { Color } from '../../color';
import { CoreTypes } from '../../core-types';
import { Length } from './length-shared';
import { parseCSSShorthand } from './css-utils';

export interface ShadowCSSValues {
	inset: boolean;
	offsetX: CoreTypes.LengthType;
	offsetY: CoreTypes.LengthType;
	blurRadius?: CoreTypes.LengthType;
	spreadRadius?: CoreTypes.LengthType;
	color: Color;
}

/**
 * Parse a string into ShadowCSSValues
 * Supports any valid css box/text shadow combination.
 *
 * inspired by https://github.com/jxnblk/css-box-shadow/blob/master/index.js (MIT License)
 *
 * @param value
 */
export function parseCSSShadow(value: string): ShadowCSSValues {
	const data = parseCSSShorthand(value);
	if (!data) {
		return null;
	}
	const [offsetX, offsetY, blurRadius, spreadRadius] = data.values;

	return {
		inset: data.inset,
		offsetX: offsetX,
		offsetY: offsetY,
		blurRadius: blurRadius,
		spreadRadius: spreadRadius,
		color: data.color ? new Color(data.color) : undefined,
	};
}
