import { bench, describe } from 'vitest';
import { isCssWideKeyword, isResetValue, unsetValue } from '../../ui/core/properties/property-shared';

const objectValue = { some: 'value' };

describe('property value helpers', () => {
	bench('isResetValue - number value', () => {
		isResetValue(42);
	});

	bench('isResetValue - object value', () => {
		isResetValue(objectValue);
	});

	bench('isResetValue - regular string value', () => {
		isResetValue('center');
	});

	bench('isResetValue - unsetValue', () => {
		isResetValue(unsetValue);
	});

	bench('isCssWideKeyword - number value', () => {
		isCssWideKeyword(42);
	});

	bench('isCssWideKeyword - regular string value', () => {
		isCssWideKeyword('center');
	});
});
