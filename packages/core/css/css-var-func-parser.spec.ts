import { parseCssVariableExpression } from './css-var-func-parser';

describe('css-var-func-parser', () => {
	it('basic css variable resolution', () => {
		const cssVal = 'red';
		const value = parseCssVariableExpression('var(--bg-color)', (cssVarName) => cssVal);

		expect(value).toBe('red');
	});

	it('css expression with list of values', () => {
		const cssVal = 'red';
		const value = parseCssVariableExpression('25 solid var(--bg-color)', (cssVarName) => cssVal);

		expect(value).toBe('25 solid red');
	});

	it('basic css variable resolution failure', () => {
		const value = parseCssVariableExpression('var(--bg-color)', null);

		expect(value).toBe('unset');
	});

	it('css expression with list of values failure', () => {
		expect(() => parseCssVariableExpression('25 solid var(--bg-color)', null)).toThrowError('var(--bg-color)');
	});

	it('css variable with basic fallback', () => {
		const value = parseCssVariableExpression('var(--bg-color, yellow)', null);

		expect(value).toBe('yellow');
	});

	it('css variable with css variable fallback', () => {
		const fallbackVal = 'blue';
		const value = parseCssVariableExpression('var(--bg-color, var(--test))', (cssVarName) => {
			if (cssVarName === '--test') {
				return fallbackVal;
			}
		});

		expect(value).toBe(fallbackVal);
	});

	it('css variable with multiple fallbacks', () => {
		const value = parseCssVariableExpression('var(--bg-color, var(--test), var(--test2), purple)', null);

		expect(value).toBe('purple');
	});

	it('css variable with deeply nested css variable fallback', () => {
		const fallbackVal = 'black';
		const value = parseCssVariableExpression('var(--bg-color, var(--test, var(--test2, var(--test3, red))))', (cssVarName) => {
			if (cssVarName === '--test3') {
				return fallbackVal;
			}
		});

		expect(value).toBe(fallbackVal);
	});

	it('css expression with list of comma-separated values', () => {
		const expression = 'var(--shadow-color) var(--shadow-offset-x) var(--shadow-offset-y), var(--shadow-inset-color) var(--shadow-inset-x) var(--shadow-inset-y)';
		const value = parseCssVariableExpression(expression, (cssVarName) => {
			switch (cssVarName) {
				case '--shadow-color':
					return 'green';
				case '--shadow-offset-x':
					return '5';
				case '--shadow-offset-y':
					return '5';
				case '--shadow-inset-color':
					return 'yellow';
				case '--shadow-inset-x':
					return '15';
				case '--shadow-inset-y':
					return '15';
			}
		});

		expect(value).toBe('green 5 5, yellow 15 15');
	});

	it('css expression with list of comma-separated values failure', () => {
		const expression = 'var(--shadow-color) var(--shadow-offset-x) var(--shadow-offset-y), var(--shadow-inset-color) var(--shadow-inset-x) var(--shadow-inset-y)';

		expect(() =>
			parseCssVariableExpression(expression, (cssVarName) => {
				switch (cssVarName) {
					case '--shadow-color':
						return 'green';
					case '--shadow-offset-x':
						return '5';
					case '--shadow-offset-y':
						return '5';
				}
			}),
		).toThrowError('var(--shadow-inset-color)');
	});
});
