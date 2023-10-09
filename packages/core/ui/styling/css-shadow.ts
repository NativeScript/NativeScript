import { CoreTypes } from '../../core-types';
import { Color } from '../../color';
import { Length } from './style-properties';

export interface ShadowCSSValues {
	inset: boolean;
	offsetX: CoreTypes.LengthType;
	offsetY: CoreTypes.LengthType;
	blurRadius?: CoreTypes.LengthType;
	spreadRadius?: CoreTypes.LengthType;
	color: Color;
}

/**
 * Matches whitespace except if the whitespace is contained in parenthesis - ex. rgb(a), hsl color.
 */
const PARTS_RE = /\s(?![^(]*\))/;

/**
 * Matches a Length value with or without a unit
 */
const LENGTH_RE = /^-?[0-9]+[a-zA-Z%]*?$/;

/**
 * Checks if the value is a Length or 0
 */
const isLength = (v) => v === '0' || LENGTH_RE.test(v);

export function parseCSSShorthand(value: string): {
	values: Array<CoreTypes.LengthType>;
	color: string;
	inset: boolean;
} {
	const parts = value.trim().split(PARTS_RE);
	const inset = parts.includes('inset');
	const first = parts[0];
	const last = parts[parts.length - 1];

	if (first === 'none') {
		return null;
	}

	let color = 'black';
	if (first && !isLength(first) && first !== 'inset') {
		color = first;
	} else if (last && !isLength(last)) {
		color = last;
	}
	const values = parts
		.filter((n) => n !== 'inset')
		.filter((n) => n !== color)
		.map((val) => {
			try {
				return Length.parse(val);
			} catch (err) {
				return CoreTypes.zeroLength;
			}
		});
	return {
		inset,
		color,
		values,
	};
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
	const [offsetX, offsetY, blurRadius, spreadRadius] = data.values;

	return {
		inset: data.inset,
		offsetX: offsetX,
		offsetY: offsetY,
		blurRadius: blurRadius,
		spreadRadius: spreadRadius,
		color: new Color(data.color),
	};
}
