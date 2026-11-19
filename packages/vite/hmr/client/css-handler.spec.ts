import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { APP_CSS_TAG } from './css-handler.js';

const core = vi.hoisted(() => ({
	Application: undefined as any,
	addTaggedAdditionalCSS: (() => true) as (...args: any[]) => unknown,
	removeTaggedAdditionalCSS: (() => true) as (...args: any[]) => unknown,
}));

vi.mock('@nativescript/core', () => ({
	get Application() {
		return core.Application;
	},
	addTaggedAdditionalCSS: (...args: any[]) => core.addTaggedAdditionalCSS(...args),
	removeTaggedAdditionalCSS: (...args: any[]) => core.removeTaggedAdditionalCSS(...args),
}));

describe('css-handler', () => {
	let applyCssText: typeof import('./css-handler.js').applyCssText;
	let handleCssUpdates: typeof import('./css-handler.js').handleCssUpdates;
	let setAppCssApplier: typeof import('../shared/runtime/app-css-applier.js').setAppCssApplier;

	// The installed app.css applier is module state: each case gets a fresh
	// instance, shared with the css-handler it imports.
	beforeEach(async () => {
		vi.resetModules();
		({ applyCssText, handleCssUpdates } = await import('./css-handler.js'));
		({ setAppCssApplier } = await import('../shared/runtime/app-css-applier.js'));
		core.Application = undefined;
		core.addTaggedAdditionalCSS = vi.fn(() => true);
		core.removeTaggedAdditionalCSS = vi.fn(() => true);
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('prefers the HTTP-realm CSS applier when one is installed (used by HTTP-ESM cold boot)', () => {
		const realmApplier = vi.fn();
		setAppCssApplier(realmApplier);
		core.Application = { addCss: vi.fn(), getRootView: vi.fn() };

		applyCssText('.login { color: red; }');

		expect(realmApplier).toHaveBeenCalledWith('.login { color: red; }', true);
		expect(core.Application.addCss).not.toHaveBeenCalled();
		expect(core.addTaggedAdditionalCSS).not.toHaveBeenCalled();
	});

	it('replaces app.css selectors via the tagged remove + add pair so deleted rules disappear', () => {
		const onCssStateChange = vi.fn();
		const addCss = vi.fn();
		core.Application = {
			addCss,
			getRootView: vi.fn(() => ({ _onCssStateChange: onCssStateChange })),
		};

		applyCssText('.login { color: red; }');

		expect(core.removeTaggedAdditionalCSS).toHaveBeenCalledWith(APP_CSS_TAG);
		expect(core.addTaggedAdditionalCSS).toHaveBeenCalledWith('.login { color: red; }', APP_CSS_TAG);
		expect(addCss).not.toHaveBeenCalled();
		expect(onCssStateChange).toHaveBeenCalled();
	});

	it('never routes a component-tagged update through the HTTP-realm applier (it only replaces the global app.css tag)', () => {
		const realmApplier = vi.fn();
		setAppCssApplier(realmApplier);
		core.Application = { addCss: vi.fn(), getRootView: vi.fn(() => null) };

		const tag = '/src/app/header/header.component.css';
		applyCssText('.appstore-header { color: blue; }', tag);

		expect(realmApplier).not.toHaveBeenCalled();
		expect(core.removeTaggedAdditionalCSS).toHaveBeenCalledWith(tag);
		expect(core.addTaggedAdditionalCSS).toHaveBeenCalledWith('.appstore-header { color: blue; }', tag);
	});

	it('replaces under a per-component tag (component styleUrls), independent of the app.css tag', () => {
		const onCssStateChange = vi.fn();
		core.Application = {
			addCss: vi.fn(),
			getRootView: vi.fn(() => ({ _onCssStateChange: onCssStateChange })),
		};

		const tag = '/src/app/header/header.component.css';
		applyCssText('.appstore-header { background-color: #ff6600; }', tag);

		// Uses the supplied per-file tag — NOT the shared app.css tag — so a
		// component's rules replace without wiping the global stylesheet.
		expect(core.removeTaggedAdditionalCSS).toHaveBeenCalledWith(tag);
		expect(core.addTaggedAdditionalCSS).toHaveBeenCalledWith('.appstore-header { background-color: #ff6600; }', tag);
		expect(core.removeTaggedAdditionalCSS).not.toHaveBeenCalledWith(APP_CSS_TAG);
		expect(onCssStateChange).toHaveBeenCalled();
	});

	it('falls back to additive Application.addCss when the tagged API throws', () => {
		vi.spyOn(console, 'warn').mockImplementation(() => {});
		const addCss = vi.fn();
		core.Application = { addCss, getRootView: vi.fn(() => null) };
		core.addTaggedAdditionalCSS = vi.fn(() => {
			throw new Error('boom');
		});

		applyCssText('.x { color: red; }');

		expect(addCss).toHaveBeenCalledWith('.x { color: red; }');
	});

	it('skips empty CSS text', () => {
		const addCss = vi.fn();
		core.Application = { addCss, getRootView: vi.fn(() => null) };

		applyCssText('');

		expect(addCss).not.toHaveBeenCalled();
		expect(core.addTaggedAdditionalCSS).not.toHaveBeenCalled();
	});

	it('applies the stylesheet text each update carries, without any fetch', async () => {
		const realmApplier = vi.fn();
		setAppCssApplier(realmApplier);
		const fetch = vi.fn();
		vi.stubGlobal('fetch', fetch);

		await handleCssUpdates([{ type: 'css-update', path: '/src/app.css', acceptedPath: '/src/app.css', timestamp: 7, css: '.a { color: red; }' }]);

		expect(fetch).not.toHaveBeenCalled();
		expect(realmApplier).toHaveBeenCalledWith('.a { color: red; }', true);
		vi.unstubAllGlobals();
	});
});
