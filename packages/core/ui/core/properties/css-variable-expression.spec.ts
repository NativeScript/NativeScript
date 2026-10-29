import { describe, it, expect } from 'vitest';
import { _evaluateCssVariableExpression } from '.';

function viewWithVariables(variables: Record<string, string>): any {
	return {
		style: {
			getCssVariable: (name: string) => (name in variables ? variables[name] : null),
		},
	};
}

describe('_evaluateCssVariableExpression', () => {
	const view = viewWithVariables({ '--defined': 'blue', '--size': '4', '--empty': '' });

	it('substitutes defined variables', () => {
		expect(_evaluateCssVariableExpression(view, 'color', 'var(--defined)')).toBe('blue');
		expect(_evaluateCssVariableExpression(view, 'color', 'color-mix(in srgb, var(--defined) 35%, transparent)')).toBe('color-mix(in srgb, blue 35%, transparent)');
	});

	it('substitutes fallbacks of undefined variables', () => {
		expect(_evaluateCssVariableExpression(view, 'color', 'var(--undefined, red)')).toBe('red');
		expect(_evaluateCssVariableExpression(view, 'color', 'var(--undefined, var(--defined))')).toBe('blue');
		expect(_evaluateCssVariableExpression(view, 'color', 'var(--undefined, var(--undefined2, yellow))')).toBe('yellow');
		expect(_evaluateCssVariableExpression(view, 'color', 'var(--defined, var(--undefined))')).toBe('blue');
		expect(_evaluateCssVariableExpression(view, 'color', 'color-mix(in srgb, var(--defined, var(--undefined)) 35%, transparent)')).toBe('color-mix(in srgb, blue 35%, transparent)');
		expect(_evaluateCssVariableExpression(view, 'color', 'color-mix(in srgb, var(--undefined, red) 35%, transparent)')).toBe('color-mix(in srgb, red 35%, transparent)');
	});

	it('unsets the whole value for an undefined variable without fallback', () => {
		expect(_evaluateCssVariableExpression(view, 'color', 'var(--undefined)')).toBe('unset');
		expect(_evaluateCssVariableExpression(view, 'color', 'color-mix(in srgb, var(--undefined) 35%, transparent)')).toBe('unset');
		expect(_evaluateCssVariableExpression(view, 'margin', 'calc(var(--undefined) + 10)')).toBe('unset');
		expect(_evaluateCssVariableExpression(view, 'margin', 'var(--size) var(--undefined)')).toBe('unset');
	});

	it('unsets the whole value when the fallback cannot be resolved either', () => {
		expect(_evaluateCssVariableExpression(view, 'color', 'var(--undefined, var(--undefined2))')).toBe('unset');
		expect(_evaluateCssVariableExpression(view, 'color', 'color-mix(in srgb, var(--undefined, var(--undefined2)) 35%, transparent)')).toBe('unset');
	});

	it('unsets the whole value for a variable defined as empty', () => {
		expect(_evaluateCssVariableExpression(view, 'color', 'var(--empty)')).toBe('unset');
		expect(_evaluateCssVariableExpression(view, 'color', 'color-mix(in srgb, var(--empty) 35%, transparent)')).toBe('unset');
	});
});
