import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { APP_CSS_TAG, applyCssText, handleCssUpdates } from './css-handler.js';
import { getGlobalScope } from '../shared/runtime/global-scope.js';

describe('css-handler', () => {
	beforeEach(() => {
		delete getGlobalScope().__NS_HMR_APPLY_CSS__;
		delete getGlobalScope().Application;
		delete getGlobalScope().__nsVendorRegistry;
		delete getGlobalScope().__nsVendorRequire;
		delete getGlobalScope().__nsRequire;
		delete getGlobalScope().require;
		delete getGlobalScope().addTaggedAdditionalCSS;
		delete getGlobalScope().removeTaggedAdditionalCSS;
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('prefers the HTTP-realm CSS applier when one is installed (used by HTTP-ESM cold boot)', () => {
		const realmApplier = vi.fn();
		getGlobalScope().__NS_HMR_APPLY_CSS__ = realmApplier;
		getGlobalScope().Application = { addCss: vi.fn(), getRootView: vi.fn() };

		applyCssText('.login { color: red; }');

		expect(realmApplier).toHaveBeenCalledWith('.login { color: red; }', true);
		expect(getGlobalScope().Application.addCss).not.toHaveBeenCalled();
	});

	it('replaces app.css selectors via the tagged remove + add pair so deleted rules disappear', () => {
		const onCssStateChange = vi.fn();
		const addCss = vi.fn();
		const addTaggedAdditionalCSS = vi.fn(() => true);
		const removeTaggedAdditionalCSS = vi.fn(() => true);
		getGlobalScope().Application = {
			addCss,
			getRootView: vi.fn(() => ({ _onCssStateChange: onCssStateChange })),
		};
		getGlobalScope().addTaggedAdditionalCSS = addTaggedAdditionalCSS;
		getGlobalScope().removeTaggedAdditionalCSS = removeTaggedAdditionalCSS;

		applyCssText('.login { color: red; }');

		expect(removeTaggedAdditionalCSS).toHaveBeenCalledWith(APP_CSS_TAG);
		expect(addTaggedAdditionalCSS).toHaveBeenCalledWith('.login { color: red; }', APP_CSS_TAG);
		expect(addCss).not.toHaveBeenCalled();
		expect(onCssStateChange).toHaveBeenCalled();
	});

	it('never routes a component-tagged update through the HTTP-realm applier (it only replaces the global app.css tag)', () => {
		const realmApplier = vi.fn();
		const addTaggedAdditionalCSS = vi.fn(() => true);
		const removeTaggedAdditionalCSS = vi.fn(() => true);
		getGlobalScope().__NS_HMR_APPLY_CSS__ = realmApplier;
		getGlobalScope().Application = { addCss: vi.fn(), getRootView: vi.fn(() => null) };
		getGlobalScope().addTaggedAdditionalCSS = addTaggedAdditionalCSS;
		getGlobalScope().removeTaggedAdditionalCSS = removeTaggedAdditionalCSS;

		const tag = '/src/app/header/header.component.css';
		applyCssText('.appstore-header { color: blue; }', tag);

		expect(realmApplier).not.toHaveBeenCalled();
		expect(removeTaggedAdditionalCSS).toHaveBeenCalledWith(tag);
		expect(addTaggedAdditionalCSS).toHaveBeenCalledWith('.appstore-header { color: blue; }', tag);
	});

	it('replaces under a per-component tag (component styleUrls), independent of the app.css tag', () => {
		const onCssStateChange = vi.fn();
		const addTaggedAdditionalCSS = vi.fn(() => true);
		const removeTaggedAdditionalCSS = vi.fn(() => true);
		getGlobalScope().Application = {
			addCss: vi.fn(),
			getRootView: vi.fn(() => ({ _onCssStateChange: onCssStateChange })),
		};
		getGlobalScope().addTaggedAdditionalCSS = addTaggedAdditionalCSS;
		getGlobalScope().removeTaggedAdditionalCSS = removeTaggedAdditionalCSS;

		const tag = '/src/app/header/header.component.css';
		applyCssText('.appstore-header { background-color: #ff6600; }', tag);

		// Uses the supplied per-file tag — NOT the shared app.css tag — so a
		// component's rules replace without wiping the global stylesheet.
		expect(removeTaggedAdditionalCSS).toHaveBeenCalledWith(tag);
		expect(addTaggedAdditionalCSS).toHaveBeenCalledWith('.appstore-header { background-color: #ff6600; }', tag);
		expect(removeTaggedAdditionalCSS).not.toHaveBeenCalledWith(APP_CSS_TAG);
		expect(onCssStateChange).toHaveBeenCalled();
	});

	it('falls back to additive Application.addCss when the tagged API throws', () => {
		const addCss = vi.fn();
		getGlobalScope().Application = { addCss, getRootView: vi.fn(() => null) };
		getGlobalScope().addTaggedAdditionalCSS = vi.fn(() => {
			throw new Error('boom');
		});
		getGlobalScope().removeTaggedAdditionalCSS = vi.fn(() => true);

		applyCssText('.x { color: red; }');

		expect(addCss).toHaveBeenCalledWith('.x { color: red; }');
	});

	it('falls back to additive Application.addCss when the tagged API is absent', () => {
		const onCssStateChange = vi.fn();
		const addCss = vi.fn();
		getGlobalScope().Application = {
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
		getGlobalScope().Application = { addCss, getRootView: vi.fn(() => null) };
		getGlobalScope().addTaggedAdditionalCSS = addTaggedAdditionalCSS;
		getGlobalScope().removeTaggedAdditionalCSS = vi.fn();

		applyCssText('');

		expect(addCss).not.toHaveBeenCalled();
		expect(addTaggedAdditionalCSS).not.toHaveBeenCalled();
	});

	it('fetches each stylesheet as raw CSS with a t cache-buster and applies it', async () => {
		const realmApplier = vi.fn();
		getGlobalScope().__NS_HMR_APPLY_CSS__ = realmApplier;
		const fetch = vi.fn(async () => ({ text: async () => '.a { color: red; }' }));
		vi.stubGlobal('fetch', fetch);

		await handleCssUpdates([{ type: 'css-update', path: '/src/app.css', acceptedPath: '/src/app.css', timestamp: 7 }], 'http://127.0.0.1:5173/');

		expect(fetch).toHaveBeenCalledWith('http://127.0.0.1:5173/src/app.css?t=7', { headers: { Accept: 'text/css' } });
		expect(realmApplier).toHaveBeenCalledWith('.a { color: red; }', true);
		vi.unstubAllGlobals();
	});
});
