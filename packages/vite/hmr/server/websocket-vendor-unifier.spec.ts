import { describe, expect, it } from 'vitest';

import { solidServerStrategy } from '../frameworks/solid/server/strategy.js';
import { vueServerStrategy } from '../frameworks/vue/server/strategy.js';
import { maybeRewriteVendorModule, shouldHandleVendorUnifierPath } from './websocket-vendor-unifier.js';

describe('websocket vendor unifier', () => {
	it('only intercepts JavaScript-like request paths outside runtime bridge endpoints', () => {
		expect(shouldHandleVendorUnifierPath('/node_modules/vue/dist/vue.runtime.esm-bundler.js')).toBe(true);
		expect(shouldHandleVendorUnifierPath('/@id/nativescript-vue')).toBe(true);
		expect(shouldHandleVendorUnifierPath('/ns/m/node_modules/vue/index.mjs')).toBe(true);
		expect(shouldHandleVendorUnifierPath('/ns/rt/7')).toBe(false);
		expect(shouldHandleVendorUnifierPath('/ns/core/7')).toBe(false);
		expect(shouldHandleVendorUnifierPath('/app/styles.css')).toBe(false);
	});

	it('rewrites Vue runtime imports to the /ns/rt bridge', () => {
		const input = 'import { createApp } from "vue";\nimport { h } from "nativescript-vue/runtime";\n';
		const output = maybeRewriteVendorModule(input, vueServerStrategy, 'http://localhost:5173', 7);
		expect(output).toContain('/ns/rt/7');
		expect(output).not.toContain('from "vue"');
	});

	it('does not rewrite Solid modules because the Solid strategy has no vendor hook', () => {
		const input = 'import { createSignal } from "solid-js";\n';
		expect(solidServerStrategy.rewriteVendorSpec).toBeUndefined();
		expect(maybeRewriteVendorModule(input, solidServerStrategy, 'http://localhost:5173', 7)).toBe(input);
	});
});
