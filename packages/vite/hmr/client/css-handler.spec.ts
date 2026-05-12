import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { APP_CSS_TAG, applyCssText } from './css-handler.js';

describe('css-handler', () => {
	beforeEach(() => {
		delete (globalThis as any).__NS_HMR_APPLY_CSS__;
		delete (globalThis as any).Application;
		delete (globalThis as any).__nsVendorRegistry;
		delete (globalThis as any).__nsVendorRequire;
		delete (globalThis as any).__nsRequire;
		delete (globalThis as any).require;
		delete (globalThis as any).addTaggedAdditionalCSS;
		delete (globalThis as any).removeTaggedAdditionalCSS;
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('prefers the HTTP-realm CSS applier when one is installed (used by HTTP-ESM cold boot)', () => {
		const realmApplier = vi.fn();
		(globalThis as any).__NS_HMR_APPLY_CSS__ = realmApplier;
		(globalThis as any).Application = { addCss: vi.fn(), getRootView: vi.fn() };

		applyCssText('.login { color: red; }');

		expect(realmApplier).toHaveBeenCalledWith('.login { color: red; }', true);
		expect((globalThis as any).Application.addCss).not.toHaveBeenCalled();
	});

	it('replaces app.css selectors via the tagged remove + add pair so deleted rules disappear', () => {
		const onCssStateChange = vi.fn();
		const addCss = vi.fn();
		const addTaggedAdditionalCSS = vi.fn(() => true);
		const removeTaggedAdditionalCSS = vi.fn(() => true);
		(globalThis as any).Application = {
			addCss,
			getRootView: vi.fn(() => ({ _onCssStateChange: onCssStateChange })),
		};
		(globalThis as any).addTaggedAdditionalCSS = addTaggedAdditionalCSS;
		(globalThis as any).removeTaggedAdditionalCSS = removeTaggedAdditionalCSS;

		applyCssText('.login { color: red; }');

		expect(removeTaggedAdditionalCSS).toHaveBeenCalledWith(APP_CSS_TAG);
		expect(addTaggedAdditionalCSS).toHaveBeenCalledWith('.login { color: red; }', APP_CSS_TAG);
		expect(addCss).not.toHaveBeenCalled();
		expect(onCssStateChange).toHaveBeenCalled();
	});

	it('falls back to additive Application.addCss when the tagged API throws', () => {
		const addCss = vi.fn();
		(globalThis as any).Application = { addCss, getRootView: vi.fn(() => null) };
		(globalThis as any).addTaggedAdditionalCSS = vi.fn(() => {
			throw new Error('boom');
		});
		(globalThis as any).removeTaggedAdditionalCSS = vi.fn(() => true);

		applyCssText('.x { color: red; }');

		expect(addCss).toHaveBeenCalledWith('.x { color: red; }');
	});

	it('falls back to additive Application.addCss when the tagged API is absent', () => {
		const onCssStateChange = vi.fn();
		const addCss = vi.fn();
		(globalThis as any).Application = {
			addCss,
			getRootView: vi.fn(() => ({ _onCssStateChange: onCssStateChange })),
		};

		applyCssText('.login { color: red; }');

		expect(addCss).toHaveBeenCalledWith('.login { color: red; }');
		expect(onCssStateChange).toHaveBeenCalled();
	});

	it('skips empty CSS text', () => {
		const addCss = vi.fn();
		const addTaggedAdditionalCSS = vi.fn();
		(globalThis as any).Application = { addCss, getRootView: vi.fn(() => null) };
		(globalThis as any).addTaggedAdditionalCSS = addTaggedAdditionalCSS;
		(globalThis as any).removeTaggedAdditionalCSS = vi.fn();

		applyCssText('');

		expect(addCss).not.toHaveBeenCalled();
		expect(addTaggedAdditionalCSS).not.toHaveBeenCalled();
	});
});
