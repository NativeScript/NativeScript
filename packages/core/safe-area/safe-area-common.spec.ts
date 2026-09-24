import { describe, it, expect, beforeEach, afterEach } from 'vitest';

import { SafeArea, SafeAreaCommon, ZERO_INSETS } from '.';
import { _evaluateCssEnvExpression } from '../ui/styling/css-env';

function reset(): void {
	SafeArea._setInsets(0, 0, 0, 0);
	SafeArea._resetMaxInsets();
}

describe('SafeArea insets', () => {
	beforeEach(reset);
	afterEach(reset);

	it('starts at zero on every edge', () => {
		expect(SafeArea.insets).toEqual(ZERO_INSETS);
	});

	it('records a new set of insets', () => {
		SafeArea._setInsets(24, 0, 48, 0);

		expect(SafeArea.insets).toEqual({ top: 24, right: 0, bottom: 48, left: 0 });
	});

	it('reports whether anything moved', () => {
		expect(SafeArea._setInsets(24, 0, 48, 0)).toBe(true);
		expect(SafeArea._setInsets(24, 0, 48, 0)).toBe(false);
		expect(SafeArea._setInsets(24, 0, 49, 0)).toBe(true);
	});

	it('raises insetsChanged with both sets of insets', () => {
		SafeArea._setInsets(24, 0, 48, 0);

		let received: any;
		const handler = (args) => (received = args);
		SafeArea.on(SafeAreaCommon.insetsChangedEvent, handler);
		SafeArea._setInsets(0, 44, 21, 0);
		SafeArea.off(SafeAreaCommon.insetsChangedEvent, handler);

		expect(received.insets).toEqual({ top: 0, right: 44, bottom: 21, left: 0 });
		expect(received.previousInsets).toEqual({ top: 24, right: 0, bottom: 48, left: 0 });
	});

	it('does not raise insetsChanged when nothing moved', () => {
		SafeArea._setInsets(24, 0, 48, 0);

		let notified = 0;
		const handler = () => notified++;
		SafeArea.on(SafeAreaCommon.insetsChangedEvent, handler);
		SafeArea._setInsets(24, 0, 48, 0);
		SafeArea.off(SafeAreaCommon.insetsChangedEvent, handler);

		expect(notified).toBe(0);
	});
});

describe('SafeArea maxInsets', () => {
	beforeEach(reset);
	afterEach(reset);

	it('keeps the largest value seen per edge', () => {
		SafeArea._setInsets(24, 0, 48, 0);
		SafeArea._setInsets(0, 44, 21, 44);

		expect(SafeArea.maxInsets).toEqual({ top: 24, right: 44, bottom: 48, left: 44 });
	});

	it('does not shrink back when the insets do', () => {
		SafeArea._setInsets(24, 0, 48, 0);
		SafeArea._setInsets(0, 0, 0, 0);

		expect(SafeArea.maxInsets).toEqual({ top: 24, right: 0, bottom: 48, left: 0 });
	});
});

describe('SafeArea css environment variables', () => {
	beforeEach(reset);
	afterEach(reset);

	it('backs env(safe-area-inset-*) in dip', () => {
		SafeArea._setInsets(24, 0, 48, 0);

		expect(_evaluateCssEnvExpression('env(safe-area-inset-top)')).toBe('24dip');
		expect(_evaluateCssEnvExpression('env(safe-area-inset-right)')).toBe('0dip');
		expect(_evaluateCssEnvExpression('env(safe-area-inset-bottom)')).toBe('48dip');
		expect(_evaluateCssEnvExpression('env(safe-area-inset-left)')).toBe('0dip');
	});

	it('backs env(safe-area-max-inset-*)', () => {
		SafeArea._setInsets(24, 0, 48, 0);
		SafeArea._setInsets(0, 0, 0, 0);

		expect(_evaluateCssEnvExpression('env(safe-area-max-inset-bottom)')).toBe('48dip');
		expect(_evaluateCssEnvExpression('env(safe-area-inset-bottom)')).toBe('0dip');
	});

	it('resolves against the current insets rather than the ones at registration', () => {
		SafeArea._setInsets(24, 0, 48, 0);
		expect(_evaluateCssEnvExpression('env(safe-area-inset-bottom)')).toBe('48dip');

		SafeArea._setInsets(24, 0, 12, 0);
		expect(_evaluateCssEnvExpression('env(safe-area-inset-bottom)')).toBe('12dip');
	});
});
