import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { APP_CSS_TAG, installHttpCoreCssSupport, preloadHttpCoreStyleScope } from './entry-runtime.js';
import { getGlobalScope } from './shared/runtime/global-scope.js';

describe('installHttpCoreCssSupport', () => {
	beforeEach(() => {
		delete getGlobalScope().__NS_HMR_APPLY_CSS__;
		delete getGlobalScope().__NS_HMR_APP_CSS__;
		delete getGlobalScope().__NS_HMR_APP_CSS_AST__;
		delete getGlobalScope().__NS_HMR_HTTP_APP_CSS_APPLIED__;
		delete getGlobalScope().addTaggedAdditionalCSS;
		delete getGlobalScope().removeTaggedAdditionalCSS;
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('replaces app.css selectors via the tagged remove + add pair so deleted rules disappear', () => {
		const addCss = vi.fn();
		const addTaggedAdditionalCSS = vi.fn(() => true);
		const removeTaggedAdditionalCSS = vi.fn(() => true);
		const Application = { addCss, getRootView: vi.fn(() => null) };

		const applier = installHttpCoreCssSupport({ Application, addTaggedAdditionalCSS, removeTaggedAdditionalCSS });
		expect(typeof applier).toBe('function');

		applier!('.foo { color: blue; }');

		expect(removeTaggedAdditionalCSS).toHaveBeenCalledWith(APP_CSS_TAG);
		expect(addTaggedAdditionalCSS).toHaveBeenCalledWith('.foo { color: blue; }', APP_CSS_TAG);
		expect(addCss).not.toHaveBeenCalled();
	});

	it('falls back to additive Application.addCss when the tagged API throws', () => {
		const addCss = vi.fn();
		const addTaggedAdditionalCSS = vi.fn(() => {
			throw new Error('boom');
		});
		const removeTaggedAdditionalCSS = vi.fn(() => true);
		const Application = { addCss, getRootView: vi.fn(() => null) };

		const applier = installHttpCoreCssSupport({ Application, addTaggedAdditionalCSS, removeTaggedAdditionalCSS });
		applier!('.x { color: red; }');

		expect(addCss).toHaveBeenCalledWith('.x { color: red; }');
	});

	it('falls back to additive Application.addCss when the tagged API is absent (e.g. older NS Core)', () => {
		const addCss = vi.fn();
		const onCssStateChange = vi.fn();
		const Application = { addCss, getRootView: vi.fn(() => ({ _onCssStateChange: onCssStateChange })) };
		getGlobalScope().__NS_HMR_APP_CSS__ = '.boot { color: red; }';

		const applier = installHttpCoreCssSupport({ Application }, true);

		expect(typeof applier).toBe('function');
		expect(addCss).toHaveBeenCalledWith('.boot { color: red; }');
		expect(onCssStateChange).toHaveBeenCalled();
		expect(getGlobalScope().__NS_HMR_HTTP_APP_CSS_APPLIED__).toBe(true);
	});

	it('does not refresh the root view when refreshRoot=false', () => {
		const addTaggedAdditionalCSS = vi.fn(() => true);
		const removeTaggedAdditionalCSS = vi.fn(() => true);
		const getRootView = vi.fn();
		const Application = { addCss: vi.fn(), getRootView };

		const applier = installHttpCoreCssSupport({ Application, addTaggedAdditionalCSS, removeTaggedAdditionalCSS });
		applier!('.css { color: red; }', false);

		expect(addTaggedAdditionalCSS).toHaveBeenCalled();
		expect(getRootView).not.toHaveBeenCalled();
	});

	it('skips empty CSS text to avoid no-op selector churn', () => {
		const addCss = vi.fn();
		const addTaggedAdditionalCSS = vi.fn(() => true);
		const removeTaggedAdditionalCSS = vi.fn(() => true);
		const Application = { addCss, getRootView: vi.fn(() => null) };

		const applier = installHttpCoreCssSupport({ Application, addTaggedAdditionalCSS, removeTaggedAdditionalCSS });
		applier!('');

		expect(addCss).not.toHaveBeenCalled();
		expect(addTaggedAdditionalCSS).not.toHaveBeenCalled();
		expect(removeTaggedAdditionalCSS).not.toHaveBeenCalled();
	});

	it('returns null when the coreModule does not expose Application.addCss', () => {
		expect(installHttpCoreCssSupport({})).toBeNull();
	});

	it('cold-boot prefers the rework AST stashed on globalThis over the raw text fallback', () => {
		// `helpers/main-entry.ts` stashes the rework AST on
		// `__NS_HMR_APP_CSS_AST__` so HMR cold boot mirrors the no-HMR
		// rolldown bundle's application path. The raw text remains as a
		// fallback for live HMR edits arriving via the dev-server WS.
		const addCss = vi.fn();
		const addTaggedAdditionalCSS = vi.fn(() => true);
		const removeTaggedAdditionalCSS = vi.fn(() => true);
		const Application = { addCss, getRootView: vi.fn(() => null) };

		const ast = { type: 'stylesheet', stylesheet: { rules: [{ type: 'rule', selectors: ['.text-sm'], declarations: [{ type: 'declaration', property: 'line-height', value: '20' }] }] } };
		getGlobalScope().__NS_HMR_APP_CSS_AST__ = ast;
		getGlobalScope().__NS_HMR_APP_CSS__ = '.text-sm { line-height: 20; }';

		installHttpCoreCssSupport({ Application, addTaggedAdditionalCSS, removeTaggedAdditionalCSS });

		expect(removeTaggedAdditionalCSS).toHaveBeenCalledWith(APP_CSS_TAG);
		expect(addTaggedAdditionalCSS).toHaveBeenCalledTimes(1);
		expect(addTaggedAdditionalCSS).toHaveBeenCalledWith(ast, APP_CSS_TAG);
		expect(addCss).not.toHaveBeenCalled();
		expect(getGlobalScope().__NS_HMR_HTTP_APP_CSS_APPLIED__).toBe(true);
	});

	it('cold-boot falls back to raw text when the AST apply throws', () => {
		const addCss = vi.fn();
		let call = 0;
		const addTaggedAdditionalCSS = vi.fn(() => {
			call += 1;
			if (call === 1) throw new Error('AST not understood');
			return true;
		});
		const removeTaggedAdditionalCSS = vi.fn(() => true);
		const Application = { addCss, getRootView: vi.fn(() => null) };

		getGlobalScope().__NS_HMR_APP_CSS_AST__ = { type: 'stylesheet', stylesheet: { rules: [] } };
		getGlobalScope().__NS_HMR_APP_CSS__ = '.x { color: red; }';

		installHttpCoreCssSupport({ Application, addTaggedAdditionalCSS, removeTaggedAdditionalCSS });

		// First call attempts AST; throws. Second call is raw text via applyCss.
		expect(addTaggedAdditionalCSS).toHaveBeenCalledTimes(2);
		expect(addTaggedAdditionalCSS).toHaveBeenLastCalledWith('.x { color: red; }', APP_CSS_TAG);
		expect(getGlobalScope().__NS_HMR_HTTP_APP_CSS_APPLIED__).toBe(true);
	});
});

describe('preloadHttpCoreStyleScope', () => {
	it('preloads the canonical `/ns/core/ui/styling/style-scope` URL', async () => {
		// Every consumer of `@nativescript/core/ui/styling/style-scope` —
		// this cold-boot preload, app-side imports, vendor `require()`
		// shims via the runtime import map — must land on the same URL
		// string so iOS's HTTP-ESM loader keys them to one module record.
		// Any divergence here re-introduces the class-identity split that
		// caused the gray-screen `Application.resetRootView` regression
		const importer = vi.fn().mockResolvedValue({});
		const result = await preloadHttpCoreStyleScope(importer, 'http://localhost:5173', true);

		expect(importer).toHaveBeenCalledWith('http://localhost:5173/ns/core/ui/styling/style-scope');
		expect(result).toMatchObject({ ok: true, url: 'http://localhost:5173/ns/core/ui/styling/style-scope' });
	});

	it('reports failure when the preload import rejects', async () => {
		const importer = vi.fn().mockRejectedValue(new Error('boom'));
		const result = await preloadHttpCoreStyleScope(importer, 'http://localhost:5173', true);

		expect(result.ok).toBe(false);
		expect(result.err).toContain('boom');
	});
});
