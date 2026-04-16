import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { applyCssText } from './css-handler.js';

describe('css-handler', () => {
	beforeEach(() => {
		delete (globalThis as any).__NS_HMR_APPLY_CSS__;
		delete (globalThis as any).Application;
		delete (globalThis as any).__nsVendorRegistry;
		delete (globalThis as any).__nsVendorRequire;
		delete (globalThis as any).__nsRequire;
		delete (globalThis as any).require;
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('prefers the HTTP core realm CSS applier when available', () => {
		const applier = vi.fn();
		(globalThis as any).__NS_HMR_APPLY_CSS__ = applier;
		(globalThis as any).Application = {
			addCss: vi.fn(),
			getRootView: vi.fn(),
		};

		applyCssText('.login { color: red; }');

		expect(applier).toHaveBeenCalledWith('.login { color: red; }', true);
		expect((globalThis as any).Application.addCss).not.toHaveBeenCalled();
	});

	it('falls back to Application.addCss when no HTTP core realm applier is installed', () => {
		const onCssStateChange = vi.fn();
		(globalThis as any).Application = {
			addCss: vi.fn(),
			getRootView: vi.fn(() => ({
				_onCssStateChange: onCssStateChange,
			})),
		};

		applyCssText('.login { color: red; }');

		expect((globalThis as any).Application.addCss).toHaveBeenCalledWith('.login { color: red; }');
		expect(onCssStateChange).toHaveBeenCalled();
	});
});
