import { Trace } from '../../trace';
import { CoreTypes } from '../../core-types';
import { Length } from './style-properties';

export function cleanupImportantFlags(value: string, propertyName: string) {
	const index = value?.indexOf('!important');
	if (index >= 0) {
		if (Trace.isEnabled()) {
			Trace.write(`The !important css rule is currently not supported. Property: ${propertyName}`, Trace.categories.Style, Trace.messageType.warn);
		}
		return value.substring(0, index).trim();
	}
	return value;
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
	const first = parts[0];

	if (['', 'none'].includes(first)) {
		return {
			inset: false,
			color: undefined,
			values: [],
		};
	} else {
		const invalidColors = ['inset', 'unset'];
		const inset = parts.includes('inset');
		const last = parts[parts.length - 1];
		let color = 'black';
		if (first && !isLength(first) && !invalidColors.includes(first)) {
			color = first;
		} else if (last && !isLength(last) && !invalidColors.includes(last)) {
			color = last;
		}

		const values = parts
			.filter((n) => !invalidColors.includes(n))
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
}
