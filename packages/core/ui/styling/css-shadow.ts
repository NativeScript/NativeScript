import { Color } from '../../color';
import { Length, zeroLength } from './style-properties';

export interface CSSShadow {
	inset: boolean;
	offsetX: Length;
	offsetY: Length;
	blurRadius?: Length;
	spreadRadius?: Length;
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

/**
 * Parse a string into a CSSShadow
 * Supports any valid css box/text shadow combination.
 *
 * inspired by https://github.com/jxnblk/css-box-shadow/blob/master/index.js (MIT License)
 *
 * @param value
 */
export function parseCSSShadow(value: string): CSSShadow {
	const parts = value.split(PARTS_RE);
	const inset = parts.includes('inset');
	const first = parts[0];
	const last = parts[parts.length - 1];

	let colorRaw = 'black';
	if (!isLength(first) && first !== 'inset') {
		colorRaw = first;
	} else if (!isLength(last)) {
		colorRaw = last;
	}
	const nums = parts
		.filter((n) => n !== 'inset')
		.filter((n) => n !== colorRaw)
		.map((val) => {
			try {
				return Length.parse(val);
			} catch (err) {
				return zeroLength;
			}
		});
	const [offsetX, offsetY, blurRadius, spreadRadius] = nums;

	return {
		inset,
		offsetX: offsetX,
		offsetY: offsetY,
		blurRadius: blurRadius,
		spreadRadius: spreadRadius,
		color: new Color(colorRaw),
	};
}
