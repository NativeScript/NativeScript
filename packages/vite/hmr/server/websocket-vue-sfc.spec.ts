import { describe, expect, it } from 'vitest';

import { buildSfcDelegatedModule, parseVersionedEndpointPath, templateHasRender } from './websocket-vue-sfc.js';

describe('websocket vue sfc helpers', () => {
	it('parses optional version prefixes for endpoint paths', () => {
		expect(parseVersionedEndpointPath('/ns/sfc', '/ns/sfc/42/app/components/Home.vue')).toEqual({
			verFromPath: '42',
			pathStyle: '/app/components/Home.vue',
		});

		expect(parseVersionedEndpointPath('/ns/asm', '/ns/asm/app/components/Home.vue')).toEqual({
			verFromPath: null,
			pathStyle: '/app/components/Home.vue',
		});
	});

	it('builds full-sfc delegators through the assembler endpoint', () => {
		const code = buildSfcDelegatedModule('/app/components/Home.vue', '7');
		expect(code).toContain('// [sfc] kind=full (delegated to assembler) path=/app/components/Home.vue');
		expect(code).toContain('export * from "/ns/asm/7?path=%2Fapp%2Fcomponents%2FHome.vue";');
		expect(code).toContain('export { default } from "/ns/asm/7?path=%2Fapp%2Fcomponents%2FHome.vue";');
	});

	it('detects render exports across template output shapes', () => {
		expect(templateHasRender('export function render(_ctx, _cache) {}')).toBe(true);
		expect(templateHasRender('const render = (_ctx, _cache) => {};\nexport { render };')).toBe(true);
		expect(templateHasRender('const nope = 1;')).toBe(false);
	});
});
