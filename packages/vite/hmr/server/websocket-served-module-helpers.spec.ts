import { describe, expect, it } from 'vitest';

import { classifyServedModule, classifyServedRequest, hasEsmDefaultExport } from './websocket-served-module-helpers.js';

describe('classifyServedRequest', () => {
	it('treats a package request as library code when its resolved id is a symlink target outside node_modules', () => {
		// `file:` / `npm link` packages resolve to their real path, which has no
		// node_modules segment; the request spec still identifies a vendor package.
		expect(classifyServedRequest('/node_modules/nativescript-vue', '/Users/dev/nativescript-vue/dist/index.js')).toBe('library');
		expect(classifyServedRequest('/node_modules/nativescript-vue/dist/renderer/index.js', '/Users/dev/nativescript-vue/dist/renderer/index.js')).toBe('library');
	});

	it('keeps library classification when only the resolved id is under node_modules', () => {
		expect(classifyServedRequest('/src/app.ts', '/proj/node_modules/some-pkg/index.js')).toBe('library');
	});

	it('classifies app sources as app', () => {
		expect(classifyServedRequest('/src/components/Home.vue', '/proj/src/components/Home.vue')).toBe('app');
		expect(classifyServedRequest('/src/app.ts', null)).toBe('app');
	});

	it('falls back to the spec when nothing resolved', () => {
		expect(classifyServedRequest('/node_modules/pkg/index.js', null)).toBe('library');
		expect(classifyServedModule('/node_modules/pkg/index.js')).toBe('library');
	});
});

describe('hasEsmDefaultExport', () => {
	it.each([
		['export default 17;', true],
		['const named = 23; export { named as default };', true],
		['export { default } from "./base.mjs";', true],
		['export * as default from "./base.mjs";', true],
		['export const named = 99;', false],
		['export * from "./base.mjs";', false],
		['// export default 17;\nexport const text = "export default 17";', false],
		['export { type Value as default } from "./types";', false],
		['module.exports = 17;', false],
	])('%s → %s', (code, expected) => {
		expect(hasEsmDefaultExport(code)).toBe(expected);
	});

	it('returns null for unparseable code', () => {
		expect(hasEsmDefaultExport('export default (;')).toBeNull();
	});
});
