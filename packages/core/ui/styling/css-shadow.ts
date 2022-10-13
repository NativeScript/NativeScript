import { CoreTypes } from '../../core-types';
import { Color } from '../../color';
import { Length, zeroLength } from './style-properties';

export interface CSSShadow {
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

/**
 * Parse a string into a CSSShadow
 * Supports any valid css box/text shadow combination.
 *
 * inspired by https://github.com/jxnblk/css-box-shadow/blob/master/index.js (MIT License)
 *
 * @param value
 */
export function parseCSSShadow(value: string): CSSShadow {
	const parts = value.trim().split(PARTS_RE);
	const inset = parts.includes('inset');
	const first = parts[0];
	const last = parts[parts.length - 1];

	if (first === 'none') {
		return null;
	}

	let colorRaw = 'black';
	if (first && !isLength(first) && first !== 'inset') {
		colorRaw = first;
	} else if (last && !isLength(last)) {
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

// if (value.indexOf('rgb') > -1) {
//   arr = value.split(' ');
//   colorRaw = arr.pop();
// } else {
//   arr = value.split(/[ ,]+/);
//   colorRaw = arr.pop();
// }

// let offsetX: number;
// let offsetY: number;
// let blurRadius: number; // not currently in use
// let spreadRadius: number; // maybe rename this to just radius
// let color: Color = new Color(colorRaw);

// if (arr.length === 2) {
//   offsetX = parseFloat(arr[0]);
//   offsetY = parseFloat(arr[1]);
// } else if (arr.length === 3) {
//   offsetX = parseFloat(arr[0]);
//   offsetY = parseFloat(arr[1]);
//   blurRadius = parseFloat(arr[2]);
// } else if (arr.length === 4) {
//   offsetX = parseFloat(arr[0]);
//   offsetY = parseFloat(arr[1]);
//   blurRadius = parseFloat(arr[2]);
//   spreadRadius = parseFloat(arr[3]);
// } else {
//   throw new Error('Expected 3, 4 or 5 parameters. Actual: ' + value);
// }
// return {
//   offsetX: offsetX,
//   offsetY: offsetY,
//   blurRadius: blurRadius,
//   spreadRadius: spreadRadius,
//   color: color,
// };
