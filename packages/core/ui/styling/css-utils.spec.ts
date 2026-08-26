import { parseCSSCommaSeparatedListOfValues, parseCSSShorthand, splitOnTopLevelComma, splitOnTopLevelSpacesAndCommas, splitOnTopLevelWhiteSpace } from './css-utils';
import { Length } from './length-shared';

describe('css-utils', () => {
	describe('splitOnTopLevelWhiteSpace', () => {
		it('splits plain values', () => {
			expect(splitOnTopLevelWhiteSpace('1px 1px 2px black')).toEqual(['1px', '1px', '2px', 'black']);
		});

		it('keeps single-level function arguments together', () => {
			expect(splitOnTopLevelWhiteSpace('0 0 10px rgba(0, 0, 0, 0.5)')).toEqual(['0', '0', '10px', 'rgba(0, 0, 0, 0.5)']);
		});

		it('keeps nested function arguments together', () => {
			expect(splitOnTopLevelWhiteSpace('0 0 10px color-mix(in srgb, var(--x) 35%, transparent)')).toEqual(['0', '0', '10px', 'color-mix(in srgb, var(--x) 35%, transparent)']);
		});

		it('collapses consecutive whitespace', () => {
			expect(splitOnTopLevelWhiteSpace('1px\t 2px\n3px')).toEqual(['1px', '2px', '3px']);
		});

		it('recovers after an unbalanced closing parenthesis', () => {
			expect(splitOnTopLevelWhiteSpace('a) b c')).toEqual(['a)', 'b', 'c']);
		});

		it('returns no parts for an empty string', () => {
			expect(splitOnTopLevelWhiteSpace('')).toEqual([]);
		});
	});

	describe('splitOnTopLevelComma', () => {
		it('splits a list of functions but not their arguments', () => {
			expect(splitOnTopLevelComma('rgb(1, 2, 3), rgb(4, 5, 6)')).toEqual(['rgb(1, 2, 3)', ' rgb(4, 5, 6)']);
		});

		it('handles nested functions', () => {
			expect(splitOnTopLevelComma('0 0 10px color-mix(in srgb, var(--x) 35%, transparent), 0 0 5px red')).toEqual(['0 0 10px color-mix(in srgb, var(--x) 35%, transparent)', ' 0 0 5px red']);
		});

		it('keeps empty parts like String.split', () => {
			expect(splitOnTopLevelComma('a,,b,')).toEqual(['a', '', 'b', '']);
		});
	});

	describe('splitOnTopLevelSpacesAndCommas', () => {
		it('separates on commas as well as whitespace', () => {
			expect(splitOnTopLevelSpacesAndCommas('red,blue')).toEqual(['red', 'blue']);
			expect(splitOnTopLevelSpacesAndCommas('red, blue green')).toEqual(['red', 'blue', 'green']);
		});

		it('keeps function arguments together', () => {
			expect(splitOnTopLevelSpacesAndCommas('red rgb(1, 2, 3) color-mix(in srgb, red 35%, blue)')).toEqual(['red', 'rgb(1, 2, 3)', 'color-mix(in srgb, red 35%, blue)']);
		});
	});

	describe('parseCSSCommaSeparatedListOfValues', () => {
		it('returns an empty list for an empty value', () => {
			expect(parseCSSCommaSeparatedListOfValues('')).toEqual([]);
		});

		it('splits multiple shadows with nested function colors', () => {
			const values = parseCSSCommaSeparatedListOfValues('0 0 10px color-mix(in srgb, blue 35%, transparent), 1px 1px 2px black');
			expect(values).toHaveLength(2);
			expect(values[0]).toBe('0 0 10px color-mix(in srgb, blue 35%, transparent)');
		});
	});

	describe('parseCSSShorthand', () => {
		it('parses a shadow-like shorthand with a nested function color', () => {
			const data = parseCSSShorthand('0 0 10px color-mix(in srgb, var(--x) 35%, transparent)');
			expect(data.color).toBe('color-mix(in srgb, var(--x) 35%, transparent)');
			expect(data.inset).toBe(false);
			expect(data.values).toEqual([0, 0, Length.parse('10px')]);
		});

		it('parses a leading function color', () => {
			const data = parseCSSShorthand('rgba(0, 0, 0, 0.5) 1px 2px');
			expect(data.color).toBe('rgba(0, 0, 0, 0.5)');
			expect(data.values).toEqual([Length.parse('1px'), Length.parse('2px')]);
		});

		it('returns null for empty and keyword values', () => {
			expect(parseCSSShorthand('')).toBeNull();
			expect(parseCSSShorthand('none')).toBeNull();
			expect(parseCSSShorthand('unset')).toBeNull();
		});
	});
});
