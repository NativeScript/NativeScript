import { describe, it, expect } from 'vitest';

import { _evaluateCssVariableExpression } from '.';

function evaluate(value: string, variables: Record<string, string> = {}) {
	const view = { style: { getCssVariable: (name: string) => (name in variables ? variables[name] : null) } };
	return _evaluateCssVariableExpression(view as any, 'color', value);
}

describe('_evaluateCssVariableExpression', () => {
	it('substitutes defined variables and falls back for undefined ones', () => {
		expect(evaluate('var(--a)', { '--a': 'blue' })).toBe('blue');
		expect(evaluate('var(--a, red)', { '--a': 'blue' })).toBe('blue');
		expect(evaluate('var(--missing, red)')).toBe('red');
		expect(evaluate('var(--missing)')).toBe('unset');
	});

	it('substitutes variables nested in a function', () => {
		expect(evaluate('color-mix(in srgb, var(--a) 35%, transparent)', { '--a': 'blue' })).toBe('color-mix(in srgb, blue 35%, transparent)');
		expect(evaluate('color-mix(in srgb, var(--missing, red) 35%, transparent)')).toBe('color-mix(in srgb, red 35%, transparent)');
	});

	it('resolves nested fallbacks', () => {
		expect(evaluate('var(--missing, var(--b))', { '--b': 'lime' })).toBe('lime');
		expect(evaluate('var(--missing, var(--missing-too, yellow))')).toBe('yellow');
		expect(evaluate('var(--missing, var(--missing-too))')).toBe('unset');
	});

	it('ignores an unresolved variable in the fallback of a resolved one', () => {
		expect(evaluate('var(--a, var(--missing))', { '--a': 'blue' })).toBe('blue');
		expect(evaluate('color-mix(in srgb, var(--a, var(--missing)) 35%, transparent)', { '--a': 'blue' })).toBe('color-mix(in srgb, blue 35%, transparent)');
	});

	it('unsets the whole value for an unresolved variable wherever it is nested', () => {
		expect(evaluate('color-mix(in srgb, var(--missing) 35%, transparent)')).toBe('unset');
		expect(evaluate('color-mix(in srgb, var(--missing, var(--missing-too)) 35%, transparent)')).toBe('unset');
		expect(evaluate('calc(var(--missing) + 10)')).toBe('unset');
		expect(evaluate('var(--size) var(--missing)', { '--size': '4' })).toBe('unset');
	});

	it('unsets the whole value for a variable defined as empty', () => {
		expect(evaluate('var(--empty)', { '--empty': '' })).toBe('unset');
		expect(evaluate('color-mix(in srgb, var(--empty) 35%, transparent)', { '--empty': '' })).toBe('unset');
	});

	it('keeps parentheses inside the fallback', () => {
		expect(evaluate('var(--missing, rgb(0, 0, 255))')).toBe('rgb(0, 0, 255)');
		expect(evaluate('linear-gradient(var(--missing, rgb(255, 0, 0) 0%, rgb(0, 0, 255) 100%))')).toBe('linear-gradient(rgb(255, 0, 0) 0%, rgb(0, 0, 255) 100%)');
	});

	it('keeps every comma-separated part of the fallback', () => {
		expect(evaluate('var(--missing, red 0%, blue 100%)')).toBe('red 0%, blue 100%');
	});

	it('uses the fallback for a variable set to initial', () => {
		expect(evaluate('var(--a, red)', { '--a': 'initial' })).toBe('red');
		expect(evaluate('var(--a)', { '--a': 'initial' })).toBe('unset');
	});

	it('resolves a gradient built from variables with fallbacks', () => {
		const variables = {
			'--via-stops': 'initial',
			'--position': 'to right in oklab',
			'--from': 'rgb(98, 96, 255)',
			'--from-position': '0%',
			'--to': 'rgb(246, 51, 154)',
			'--to-position': '100%',
		};
		expect(evaluate('linear-gradient(var(--via-stops, var(--position), var(--from) var(--from-position), var(--to) var(--to-position)))', variables)).toBe('linear-gradient(to right in oklab, rgb(98, 96, 255) 0%, rgb(246, 51, 154) 100%)');
	});

	it('leaves values without variables alone', () => {
		expect(evaluate('rgb(0, 0, 0)')).toBe('rgb(0, 0, 0)');
	});
});
