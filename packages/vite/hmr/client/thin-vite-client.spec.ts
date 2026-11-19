import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { addTaggedAdditionalCSS, Application, removeTaggedAdditionalCSS } from '@nativescript/core';
import { injectQuery, removeStyle, updateStyle } from './thin-vite-client.js';
import { nsDev } from '../shared/runtime/dev-globals.js';

vi.mock('@nativescript/core', () => ({ addTaggedAdditionalCSS: vi.fn(), removeTaggedAdditionalCSS: vi.fn(), Application: { getRootView: vi.fn() } }));

const getRootView = vi.mocked(Application.getRootView);
const settle = () => new Promise((resolve) => setTimeout(resolve, 0));

function fakeRoot(modals: unknown[] = []) {
	return { _onCssStateChange: vi.fn(), _getRootModalViews: () => modals };
}

describe('updateStyle / removeStyle', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('replaces the stylesheet under its id', () => {
		updateStyle('/abs/src/app.css', '.a { color: red; }');
		expect(removeTaggedAdditionalCSS).toHaveBeenCalledWith('/abs/src/app.css');
		expect(addTaggedAdditionalCSS).toHaveBeenCalledWith('.a { color: red; }', '/abs/src/app.css');
		removeStyle('/abs/src/app.css');
		expect(removeTaggedAdditionalCSS).toHaveBeenCalledTimes(2);
	});

	it('restyles the root view and its modals once for the style changes of one tick', async () => {
		const modal = { _onCssStateChange: vi.fn() };
		const root = fakeRoot([modal]);
		getRootView.mockReturnValue(root as any);

		updateStyle('/a.css', '.a {}');
		updateStyle('/b.css', '.b {}');
		removeStyle('/c.css');
		expect(root._onCssStateChange).not.toHaveBeenCalled();
		await settle();

		expect(getRootView).toHaveBeenCalledTimes(1);
		expect(root._onCssStateChange).toHaveBeenCalledTimes(1);
		expect(modal._onCssStateChange).toHaveBeenCalledTimes(1);

		updateStyle('/a.css', '.a { color: blue; }');
		await settle();
		expect(root._onCssStateChange).toHaveBeenCalledTimes(2);
	});

	it('does nothing more than apply the stylesheet while there is no root view', async () => {
		getRootView.mockReturnValue(undefined as any);
		updateStyle('/abs/src/app.css', '.a {}');
		await settle();
		expect(addTaggedAdditionalCSS).toHaveBeenCalledTimes(1);

		getRootView.mockImplementation(() => {
			throw new Error('no activity yet');
		});
		updateStyle('/abs/src/app.css', '.a {}');
		await expect(settle()).resolves.toBeUndefined();
	});
});

const ORIGIN = 'http://192.168.1.5:5173';

describe('injectQuery', () => {
	afterEach(() => {
		delete nsDev().httpOrigin;
	});

	it('makes a root-relative URL absolute on the dev-server origin, query first as in Vite', () => {
		nsDev().httpOrigin = `${ORIGIN}/`;
		expect(injectQuery('/src/data.json?raw#x', 'import')).toBe(`${ORIGIN}/src/data.json?import&raw#x`);
	});

	it('leaves absolute and bare specifiers untouched', () => {
		nsDev().httpOrigin = ORIGIN;
		expect(injectQuery(`${ORIGIN}/src/a.ts?t=1`, 'import')).toBe(`${ORIGIN}/src/a.ts?t=1`);
		expect(injectQuery('@nativescript/core', 'import')).toBe('@nativescript/core');
	});

	it('injects into a relative URL without making it absolute', () => {
		nsDev().httpOrigin = ORIGIN;
		expect(injectQuery('./a.json', 'import')).toBe('./a.json?import');
	});

	it('stays root-relative without a known origin', () => {
		expect(injectQuery('/src/a.json', 'import')).toBe('/src/a.json?import');
	});
});
