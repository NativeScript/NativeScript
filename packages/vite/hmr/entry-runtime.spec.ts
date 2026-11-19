import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { APP_CSS_TAG } from './entry-runtime.js';
import { getGlobalScope } from './shared/runtime/global-scope.js';
import { NS_DEV_SYMBOL_KEY, nsDev } from './shared/runtime/dev-globals.js';

describe('installHttpCoreCssSupport', () => {
	let installHttpCoreCssSupport: typeof import('./entry-runtime.js').installHttpCoreCssSupport;
	let getAppCssApplier: typeof import('./shared/runtime/app-css-applier.js').getAppCssApplier;

	// The cold-boot "already applied" flag and the installed applier are module
	// state: each case gets fresh instances, all from the same module graph.
	beforeEach(async () => {
		vi.resetModules();
		({ installHttpCoreCssSupport } = await import('./entry-runtime.js'));
		({ getAppCssApplier } = await import('./shared/runtime/app-css-applier.js'));
		delete getGlobalScope()[Symbol.for(NS_DEV_SYMBOL_KEY)];
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
		expect(getAppCssApplier()).toBe(applier);

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
		nsDev().appCss = '.boot { color: red; }';

		const applier = installHttpCoreCssSupport({ Application }, true);

		expect(typeof applier).toBe('function');
		expect(addCss).toHaveBeenCalledWith('.boot { color: red; }');
		expect(onCssStateChange).toHaveBeenCalled();

		// The bundled app.css is applied once per process.
		addCss.mockClear();
		installHttpCoreCssSupport({ Application }, true);
		expect(addCss).not.toHaveBeenCalled();
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
		// `appCssAst` so HMR cold boot mirrors the no-HMR
		// rolldown bundle's application path. The raw text remains as a
		// fallback for live HMR edits arriving via the dev-server WS.
		const addCss = vi.fn();
		const addTaggedAdditionalCSS = vi.fn(() => true);
		const removeTaggedAdditionalCSS = vi.fn(() => true);
		const Application = { addCss, getRootView: vi.fn(() => null) };

		const ast = { type: 'stylesheet', stylesheet: { rules: [{ type: 'rule', selectors: ['.text-sm'], declarations: [{ type: 'declaration', property: 'line-height', value: '20' }] }] } };
		nsDev().appCssAst = ast;
		nsDev().appCss = '.text-sm { line-height: 20; }';

		installHttpCoreCssSupport({ Application, addTaggedAdditionalCSS, removeTaggedAdditionalCSS });

		expect(removeTaggedAdditionalCSS).toHaveBeenCalledWith(APP_CSS_TAG);
		expect(addTaggedAdditionalCSS).toHaveBeenCalledTimes(1);
		expect(addTaggedAdditionalCSS).toHaveBeenCalledWith(ast, APP_CSS_TAG);
		expect(addCss).not.toHaveBeenCalled();

		addTaggedAdditionalCSS.mockClear();
		installHttpCoreCssSupport({ Application, addTaggedAdditionalCSS, removeTaggedAdditionalCSS });
		expect(addTaggedAdditionalCSS).not.toHaveBeenCalled();
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

		nsDev().appCssAst = { type: 'stylesheet', stylesheet: { rules: [] } };
		nsDev().appCss = '.x { color: red; }';

		installHttpCoreCssSupport({ Application, addTaggedAdditionalCSS, removeTaggedAdditionalCSS });

		// First call attempts AST; throws. Second call is raw text via applyCss.
		expect(addTaggedAdditionalCSS).toHaveBeenCalledTimes(2);
		expect(addTaggedAdditionalCSS).toHaveBeenLastCalledWith('.x { color: red; }', APP_CSS_TAG);

		addTaggedAdditionalCSS.mockClear();
		installHttpCoreCssSupport({ Application, addTaggedAdditionalCSS, removeTaggedAdditionalCSS });
		expect(addTaggedAdditionalCSS).not.toHaveBeenCalled();
	});
});
