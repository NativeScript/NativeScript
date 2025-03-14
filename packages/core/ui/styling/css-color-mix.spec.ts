import { _evaluateCssColorMixExpression } from '../core/properties';

describe('css-color-mix', () => {
	it('empty', () => {
		const value = _evaluateCssColorMixExpression('');
		expect(value).toBe('');
	});

	it('color-mix(in oklab, var(--color-black) 50%, transparent)', () => {
		const value = _evaluateCssColorMixExpression('color-mix(in oklab, black 50%, transparent)');
		expect(value).toBe('rgba(0, 0, 0, 0.5)');
	});

	it('color-mix(in hsl, hsl(200 50 80), coral 80%)', () => {
		const value = _evaluateCssColorMixExpression('color-mix(in hsl, hsl(200 50 80), coral 80%)');
		expect(value).toBe('rgba(204, 102, 64, 0.8007843137254902)');
	});
});
