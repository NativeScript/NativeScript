// Shared Length, FixedLength, and PercentLength helpers for styling modules.
// Only put platform-agnostic logic here.

import { CoreTypes } from '../../core-types';
import { layout } from '../../utils/layout-helper';
import { isCssWideKeyword } from '../core/properties/property-shared';

function equalsCommon(a: CoreTypes.LengthType, b: CoreTypes.LengthType): boolean;
function equalsCommon(a: CoreTypes.PercentLengthType, b: CoreTypes.PercentLengthType): boolean;
function equalsCommon(a: CoreTypes.PercentLengthType, b: CoreTypes.PercentLengthType): boolean {
	if (a == 'auto' || isCssWideKeyword(a)) {
		return b == 'auto' || isCssWideKeyword(b);
	}

	if (b == 'auto' || isCssWideKeyword(b)) {
		return false;
	}

	if (typeof a === 'number') {
		if (typeof b === 'number') {
			return a == b;
		}
		if (!b) {
			return false;
		}
		return (b as CoreTypes.LengthDipUnit).unit == 'dip' && a == (b as CoreTypes.LengthDipUnit).value;
	}

	if (typeof b === 'number') {
		return a ? (a as CoreTypes.LengthDipUnit).unit == 'dip' && (a as CoreTypes.LengthDipUnit).value == b : false;
	}
	if (!a || !b) {
		return false;
	}
	return (a as CoreTypes.LengthDipUnit).value == (b as CoreTypes.LengthDipUnit).value && (a as CoreTypes.LengthDipUnit).unit == (b as CoreTypes.LengthDipUnit).unit;
}

function convertToStringCommon(length: CoreTypes.LengthType | CoreTypes.PercentLengthType): string {
	if (length == 'auto' || isCssWideKeyword(length)) {
		return 'auto';
	}

	if (typeof length === 'number') {
		return length.toString();
	}

	let val = (length as CoreTypes.LengthPercentUnit).value;
	if ((length as CoreTypes.LengthPercentUnit).unit === '%') {
		val *= 100;
	}

	return val + (length as CoreTypes.LengthPercentUnit).unit;
}

function toDevicePixelsCommon(length: CoreTypes.PercentLengthType, auto: number = Number.NaN, parentAvailableWidth: number = Number.NaN): number {
	if (length == 'auto' || isCssWideKeyword(length)) {
		return auto;
	}
	if (typeof length === 'number') {
		return layout.round(layout.toDevicePixels(length));
	}
	if (!length) {
		return auto;
	}
	// @ts-ignore
	switch (length.unit) {
		case 'px':
			// @ts-ignore
			return layout.round(length.value);
		case '%':
			// @ts-ignore
			return layout.round(parentAvailableWidth * length.value);
		case 'dip':
		default:
			// @ts-ignore
			return layout.round(layout.toDevicePixels(length.value));
	}
}

export namespace PercentLength {
	export function parse(fromValue: string | CoreTypes.LengthType): CoreTypes.PercentLengthType {
		if (fromValue == 'auto') {
			return 'auto';
		}

		if (typeof fromValue === 'string') {
			let stringValue = fromValue.trim();
			const percentIndex = stringValue.indexOf('%');
			if (percentIndex !== -1) {
				let value: CoreTypes.percent;
				// if only % or % is not last we treat it as invalid value.
				if (percentIndex !== stringValue.length - 1 || percentIndex === 0) {
					value = Number.NaN;
				} else {
					// Normalize result to values between -1 and 1
					value = parseFloat(stringValue.substring(0, stringValue.length - 1).trim()) / 100;
				}

				if (isNaN(value) || !isFinite(value)) {
					throw new Error(`Invalid value: ${fromValue}`);
				}

				return { unit: '%', value };
			} else if (stringValue.indexOf('px') !== -1) {
				stringValue = stringValue.replace('px', '').trim();
				const value: CoreTypes.px = parseFloat(stringValue);
				if (isNaN(value) || !isFinite(value)) {
					throw new Error(`Invalid value: ${fromValue}`);
				}

				return { unit: 'px', value };
			} else {
				const value: CoreTypes.dip = parseFloat(stringValue);
				if (isNaN(value) || !isFinite(value)) {
					throw new Error(`Invalid value: ${fromValue}`);
				}

				return value;
			}
		} else {
			return fromValue;
		}
	}

	export const equals: {
		(a: CoreTypes.PercentLengthType, b: CoreTypes.PercentLengthType): boolean;
	} = equalsCommon;
	export const toDevicePixels: {
		(length: CoreTypes.PercentLengthType, auto: number, parentAvailableWidth: number): number;
	} = toDevicePixelsCommon;
	export const convertToString: {
		(length: CoreTypes.PercentLengthType): string;
	} = convertToStringCommon;
}

export namespace FixedLength {
	export function parse(fromValue: string | CoreTypes.FixedLengthType): CoreTypes.FixedLengthType {
		if (typeof fromValue === 'string') {
			let stringValue = fromValue.trim();
			if (stringValue.indexOf('px') !== -1) {
				stringValue = stringValue.replace('px', '').trim();
				const value: CoreTypes.px = parseFloat(stringValue);
				if (isNaN(value) || !isFinite(value)) {
					throw new Error(`Invalid value: ${stringValue}`);
				}

				return { unit: 'px', value };
			} else {
				const value: CoreTypes.dip = parseFloat(stringValue);
				if (isNaN(value) || !isFinite(value)) {
					throw new Error(`Invalid value: ${stringValue}`);
				}

				return value;
			}
		} else {
			return fromValue;
		}
	}
	export const equals: { (a: CoreTypes.FixedLengthType, b: CoreTypes.FixedLengthType): boolean } = equalsCommon;
	export const toDevicePixels: {
		(length: CoreTypes.FixedLengthType): number;
	} = toDevicePixelsCommon;
	export const convertToString: {
		(length: CoreTypes.FixedLengthType): string;
	} = convertToStringCommon;
}

export namespace Length {
	export function parse(fromValue: string | CoreTypes.LengthType): CoreTypes.LengthType {
		if (fromValue == 'auto') {
			return 'auto';
		}

		return FixedLength.parse(fromValue);
	}
	export const equals: { (a: CoreTypes.LengthType, b: CoreTypes.LengthType): boolean } = equalsCommon;
	export const toDevicePixels: {
		(length: CoreTypes.LengthType, auto?: number): number;
	} = toDevicePixelsCommon;
	export const convertToString: {
		(length: CoreTypes.LengthType): string;
	} = convertToStringCommon;
}
