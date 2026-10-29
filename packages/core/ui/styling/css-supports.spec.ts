import { describe, it, expect, beforeAll } from 'vitest';

import { evaluateSupportsCondition } from './css-supports';

describe('evaluateSupportsCondition', () => {
	beforeAll(async () => {
		// Registers the style properties the declaration tests look up.
		await import('../label');
	});

	it('passes a declaration core parses', () => {
		expect(evaluateSupportsCondition('(color: red)')).toBe(true);
		expect(evaluateSupportsCondition('(color: color-mix(in srgb, red 50%, blue))')).toBe(true);
		expect(evaluateSupportsCondition('(text-transform: uppercase)')).toBe(true);
		expect(evaluateSupportsCondition('(margin: 10 20)')).toBe(true);
	});

	it('fails a declaration whose value core does not parse', () => {
		expect(evaluateSupportsCondition('(color: not-a-color)')).toBe(false);
		expect(evaluateSupportsCondition('(text-transform: full-width)')).toBe(false);
	});

	it('fails a declaration of a property core does not know', () => {
		expect(evaluateSupportsCondition('(display: grid)')).toBe(false);
	});

	it('passes values that only resolve per view', () => {
		expect(evaluateSupportsCondition('(color: var(--accent))')).toBe(true);
		expect(evaluateSupportsCondition('(width: calc(100% - 10))')).toBe(true);
		expect(evaluateSupportsCondition('(--accent: red)')).toBe(true);
	});

	it('matches property names case-insensitively', () => {
		expect(evaluateSupportsCondition('(COLOR: red)')).toBe(true);
	});

	it('ignores !important in a declaration test', () => {
		expect(evaluateSupportsCondition('(color: red !important)')).toBe(true);
	});

	it('evaluates not, and, or', () => {
		expect(evaluateSupportsCondition('not (display: grid)')).toBe(true);
		expect(evaluateSupportsCondition('not (color: red)')).toBe(false);
		expect(evaluateSupportsCondition('(color: red) and (display: grid)')).toBe(false);
		expect(evaluateSupportsCondition('(color: red) and (text-transform: uppercase) and (margin: 4)')).toBe(true);
		expect(evaluateSupportsCondition('(display: grid) or (color: red)')).toBe(true);
		expect(evaluateSupportsCondition('(display: grid) or (display: flex)')).toBe(false);
		expect(evaluateSupportsCondition('(color: red) AND (margin: 4)')).toBe(true);
	});

	it('evaluates nested conditions', () => {
		expect(evaluateSupportsCondition('((display: grid) or (color: red)) and (not (display: grid))')).toBe(true);
		expect(evaluateSupportsCondition('(not ((color: red) and (display: grid)))')).toBe(true);
	});

	it('fails mixed and/or without parentheses as a whole', () => {
		expect(evaluateSupportsCondition('(color: red) and (margin: 4) or (display: grid)')).toBe(false);
	});

	it('fails malformed conditions as a whole', () => {
		expect(evaluateSupportsCondition('')).toBe(false);
		expect(evaluateSupportsCondition('color: red')).toBe(false);
		expect(evaluateSupportsCondition('(color: red')).toBe(false);
		expect(evaluateSupportsCondition('not (color: red) and (margin: 4)')).toBe(false);
		expect(evaluateSupportsCondition('(color: red) (margin: 4)')).toBe(false);
	});

	it('evaluates unknown tests to false, so they can still be negated', () => {
		expect(evaluateSupportsCondition('font-tech(color-COLRv1)')).toBe(false);
		expect(evaluateSupportsCondition('not font-tech(color-COLRv1)')).toBe(true);
		expect(evaluateSupportsCondition('(foo bar)')).toBe(false);
	});

	it('evaluates selector()', () => {
		expect(evaluateSupportsCondition('selector(.a > .b)')).toBe(true);
		expect(evaluateSupportsCondition('selector(.a >)')).toBe(false);
	});

	it('does not split on parentheses or colons inside strings', () => {
		expect(evaluateSupportsCondition('(font-family: "a:b)")')).toBe(true);
	});
});
