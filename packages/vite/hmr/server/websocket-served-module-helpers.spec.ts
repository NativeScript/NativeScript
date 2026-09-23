import { describe, expect, it } from 'vitest';

import { classifyServedModule, classifyServedRequest } from './websocket-served-module-helpers.js';

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
