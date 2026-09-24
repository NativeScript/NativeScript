import { describe, it, expect, beforeEach, afterEach } from 'vitest';

import { _evaluateCssEnvExpression, isCssEnvExpression, registerCssEnvironmentVariable, unregisterCssEnvironmentVariable, _trackCssEnvironmentDependent, _untrackCssEnvironmentDependent, notifyCssEnvironmentChanged } from './css-env';

// Distinct per edge, so a wrong one is obvious.
const INSETS = { top: '24dip', right: '0dip', bottom: '48dip', left: '0dip' };

function registerSafeArea(): void {
	for (const edge of Object.keys(INSETS)) {
		registerCssEnvironmentVariable(`safe-area-inset-${edge}`, 0, () => INSETS[edge]);
	}
}

function unregisterSafeArea(): void {
	for (const edge of Object.keys(INSETS)) {
		unregisterCssEnvironmentVariable(`safe-area-inset-${edge}`);
	}
}

describe('isCssEnvExpression', () => {
	it('detects an env() anywhere in the value', () => {
		expect(isCssEnvExpression('env(safe-area-inset-top)')).toBe(true);
		expect(isCssEnvExpression('calc(12dip + env(safe-area-inset-bottom))')).toBe(true);
	});

	it('does not match a value without one', () => {
		expect(isCssEnvExpression('12dip')).toBe(false);
		expect(isCssEnvExpression('var(--env)')).toBe(false);
		expect(isCssEnvExpression('environment(x)')).toBe(false);
	});
});

describe('env() substitution', () => {
	beforeEach(registerSafeArea);
	afterEach(unregisterSafeArea);

	it('leaves a value with no env() alone', () => {
		expect(_evaluateCssEnvExpression('12dip')).toBe('12dip');
	});

	it('substitutes each of the four safe area insets', () => {
		expect(_evaluateCssEnvExpression('env(safe-area-inset-top)')).toBe('24dip');
		expect(_evaluateCssEnvExpression('env(safe-area-inset-right)')).toBe('0dip');
		expect(_evaluateCssEnvExpression('env(safe-area-inset-bottom)')).toBe('48dip');
		expect(_evaluateCssEnvExpression('env(safe-area-inset-left)')).toBe('0dip');
	});

	it('substitutes in place, keeping the rest of the value', () => {
		expect(_evaluateCssEnvExpression('calc(12dip + env(safe-area-inset-bottom))')).toBe('calc(12dip + 48dip)');
	});

	it('substitutes every occurrence in a multi-value declaration', () => {
		expect(_evaluateCssEnvExpression('env(safe-area-inset-top) 16dip env(safe-area-inset-bottom) 16dip')).toBe('24dip 16dip 48dip 16dip');
	});

	it('tolerates whitespace around the arguments', () => {
		expect(_evaluateCssEnvExpression('env( safe-area-inset-top )')).toBe('24dip');
	});
});

describe('env() fallback', () => {
	beforeEach(registerSafeArea);
	afterEach(unregisterSafeArea);

	it('uses the fallback for an unknown variable', () => {
		expect(_evaluateCssEnvExpression('env(not-a-real-variable, 10dip)')).toBe('10dip');
	});

	it('ignores the fallback when the variable resolves', () => {
		expect(_evaluateCssEnvExpression('env(safe-area-inset-top, 10dip)')).toBe('24dip');
		expect(_evaluateCssEnvExpression('env(safe-area-inset-top, ###)')).toBe('24dip');
	});

	it('keeps a fallback holding commas intact', () => {
		expect(_evaluateCssEnvExpression('env(missing, rgb(1, 2, 3))')).toBe('rgb(1, 2, 3)');
	});

	it('substitutes a nested env() inside the fallback', () => {
		expect(_evaluateCssEnvExpression('env(missing, env(safe-area-inset-bottom))')).toBe('48dip');
	});

	it('walks a chain of fallbacks', () => {
		expect(_evaluateCssEnvExpression('env(missing-a, env(missing-b, 4dip))')).toBe('4dip');
	});

	it('treats a bare comma as an empty fallback', () => {
		expect(_evaluateCssEnvExpression('env(missing,)')).toBe('');
	});

	it('leaves a var() in an unused fallback untouched', () => {
		expect(_evaluateCssEnvExpression('env(safe-area-inset-top, var(--x))')).toBe('24dip');
	});

	it('passes a var() in a used fallback through for the next pass', () => {
		expect(_evaluateCssEnvExpression('env(missing, var(--x))')).toBe('var(--x)');
	});
});

describe('env() invalid at computed-value time', () => {
	beforeEach(registerSafeArea);
	afterEach(unregisterSafeArea);

	it('reports an unknown variable with no fallback', () => {
		expect(_evaluateCssEnvExpression('env(not-a-real-variable)')).toBe('unset');
	});

	it('invalidates the whole declaration, not just the function', () => {
		expect(_evaluateCssEnvExpression('10dip env(not-a-real-variable) 10dip')).toBe('unset');
	});

	it('rejects a name that is not a custom-ident', () => {
		expect(_evaluateCssEnvExpression('env(4-leading-digit)')).toBe('unset');
		expect(_evaluateCssEnvExpression('env()')).toBe('unset');
	});

	it('rejects a non-integer index', () => {
		expect(_evaluateCssEnvExpression('env(safe-area-inset-top 1.5)')).toBe('unset');
		expect(_evaluateCssEnvExpression('env(safe-area-inset-top -1)')).toBe('unset');
	});
});

describe('env() variable names', () => {
	beforeEach(registerSafeArea);
	afterEach(unregisterSafeArea);

	it('is case-sensitive', () => {
		expect(_evaluateCssEnvExpression('env(Safe-Area-Inset-Top, 1dip)')).toBe('1dip');
		expect(_evaluateCssEnvExpression('env(SAFE-AREA-INSET-TOP)')).toBe('unset');
	});
});

describe('env() indices', () => {
	beforeEach(() => {
		registerCssEnvironmentVariable('viewport-segment-width', 2, (indices) => `${indices[0]}${indices[1]}dip`);
	});
	afterEach(() => unregisterCssEnvironmentVariable('viewport-segment-width'));

	it('passes the indices to the variable', () => {
		expect(_evaluateCssEnvExpression('env(viewport-segment-width 1 0)')).toBe('10dip');
	});

	it('falls back when the index count does not match the dimensions', () => {
		expect(_evaluateCssEnvExpression('env(viewport-segment-width, 9dip)')).toBe('9dip');
		expect(_evaluateCssEnvExpression('env(viewport-segment-width 0, 9dip)')).toBe('9dip');
		expect(_evaluateCssEnvExpression('env(viewport-segment-width 0 0 0, 9dip)')).toBe('9dip');
	});

	it('falls back when a scalar variable is given indices', () => {
		registerCssEnvironmentVariable('safe-area-inset-top', 0, () => '24dip');

		expect(_evaluateCssEnvExpression('env(safe-area-inset-top 0, 9dip)')).toBe('9dip');

		unregisterCssEnvironmentVariable('safe-area-inset-top');
	});
});

describe('env() variables with no value', () => {
	afterEach(() => unregisterCssEnvironmentVariable('sometimes'));

	it('falls back when the provider returns null', () => {
		registerCssEnvironmentVariable('sometimes', 0, () => null);

		expect(_evaluateCssEnvExpression('env(sometimes, 7dip)')).toBe('7dip');
		expect(_evaluateCssEnvExpression('env(sometimes)')).toBe('unset');
	});

	it('falls back when the provider throws', () => {
		registerCssEnvironmentVariable('sometimes', 0, () => {
			throw new Error('no value');
		});

		expect(_evaluateCssEnvExpression('env(sometimes, 7dip)')).toBe('7dip');
	});
});

describe('css environment dependents', () => {
	it('notifies a tracked dependent', () => {
		let notified = 0;
		const dependent = { _reevaluateCssEnvironment: () => notified++ };

		_trackCssEnvironmentDependent(dependent);
		notifyCssEnvironmentChanged();
		expect(notified).toBe(1);

		_untrackCssEnvironmentDependent(dependent);
		notifyCssEnvironmentChanged();
		expect(notified).toBe(1);
	});

	it('tracks a dependent once however often it registers', () => {
		let notified = 0;
		const dependent = { _reevaluateCssEnvironment: () => notified++ };

		_trackCssEnvironmentDependent(dependent);
		_trackCssEnvironmentDependent(dependent);
		notifyCssEnvironmentChanged();

		expect(notified).toBe(1);
		_untrackCssEnvironmentDependent(dependent);
	});

	it('keeps notifying the others when one throws', () => {
		let notified = 0;
		const thrower = {
			_reevaluateCssEnvironment: () => {
				throw new Error('boom');
			},
		};
		const dependent = { _reevaluateCssEnvironment: () => notified++ };

		_trackCssEnvironmentDependent(thrower);
		_trackCssEnvironmentDependent(dependent);
		notifyCssEnvironmentChanged();

		expect(notified).toBe(1);
		_untrackCssEnvironmentDependent(thrower);
		_untrackCssEnvironmentDependent(dependent);
	});
});
