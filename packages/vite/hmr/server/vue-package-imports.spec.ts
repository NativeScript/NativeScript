import { describe, expect, it } from 'vitest';
import { parse } from '@babel/parser';
import { vueServerStrategy } from '../frameworks/vue/server/strategy.js';
import { astNormalizeModuleImportsAndHelpers } from '../helpers/ast-normalizer.js';
import { cleanCode, processCodeForDevice, rewriteImports } from './websocket-device-transform.js';

describe('Vue package imports in HTTP modules', () => {
	it('keeps native navigation helpers on the runtime bridge through the full transform', () => {
		const source = `import { $navigateTo, ref } from 'nativescript-vue';\nexport const current = ref(null);\nexport function go(page) { $navigateTo(page); }`;
		const cleaned = cleanCode(source, vueServerStrategy);
		const processed = processCodeForDevice(cleaned, false, true, true, '/node_modules/native-router/dist/frame.js');
		const output = rewriteImports(processed, '/node_modules/native-router/dist/frame.js', new Map(), new Map(), '/', false, undefined, 'http://localhost:5173');
		expect(output).not.toContain('/@nativescript/vendor.mjs');
		expect(output).toContain('/ns/rt');
		expect(() => parse(output, { sourceType: 'module' })).not.toThrow();
	});

	it.each(['vue-router-ns', 'vue-router-ns_file-routing', 'vue-demi', 'nativescript-vue-router'])('does not redirect the %s prebundle to the Vue runtime', (name) => {
		const url = `/node_modules/.vite/deps/${name}.js?v=abc`;
		const output = astNormalizeModuleImportsAndHelpers(`import { createRouter } from '${url}'; export const router = createRouter();`);
		expect(output).toContain(url);
		expect(output).not.toContain('/ns/rt');
	});

	it.each(['vue', 'nativescript-vue', 'vue_dist_vue_runtime_esm-bundler'])('still redirects the %s runtime prebundle', (name) => {
		const output = astNormalizeModuleImportsAndHelpers(`import { ref } from '/node_modules/.vite/deps/${name}.js?v=abc'; export const value = ref(0);`);
		expect(output).toContain('/ns/rt');
		expect(output).not.toContain('/node_modules/.vite/deps/');
	});

	it('preserves a similarly named bare plugin import', () => {
		const output = astNormalizeModuleImportsAndHelpers(`import { createRouter } from 'nativescript-vue-router'; export const router = createRouter();`);
		expect(output).toContain('nativescript-vue-router');
		expect(output).not.toContain('/ns/rt');
	});
});
