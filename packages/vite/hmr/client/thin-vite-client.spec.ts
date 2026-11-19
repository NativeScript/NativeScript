import { afterEach, describe, expect, it, vi } from 'vitest';
import { injectQuery } from './thin-vite-client.js';
import { nsDev } from '../shared/runtime/dev-globals.js';

vi.mock('@nativescript/core', () => ({ addTaggedAdditionalCSS: vi.fn(), removeTaggedAdditionalCSS: vi.fn() }));

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
