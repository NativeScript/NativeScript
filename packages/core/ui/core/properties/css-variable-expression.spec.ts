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

	it('resolves nested fallbacks', () => {
		expect(evaluate('var(--missing, var(--b))', { '--b': 'lime' })).toBe('lime');
		expect(evaluate('var(--missing, var(--missing-too, yellow))')).toBe('yellow');
		expect(evaluate('var(--missing, var(--missing-too))')).toBe('unset');
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
		expect(evaluate('linear-gradient(var(--via-stops, var(--position), var(--from) var(--from-position), var(--to) var(--to-position)))', variables)).toBe(
			'linear-gradient(to right in oklab, rgb(98, 96, 255) 0%, rgb(246, 51, 154) 100%)',
		);
	});

	it('leaves values without variables alone', () => {
		expect(evaluate('rgb(0, 0, 0)')).toBe('rgb(0, 0, 0)');
	});
});
