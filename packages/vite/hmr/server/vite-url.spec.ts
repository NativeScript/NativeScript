import { describe, expect, it } from 'vitest';
import { transformIdForViteUrl, viteUrlForFile } from './vite-url.js';

describe('viteUrlForFile', () => {
	it('mirrors Vite: root-relative inside the root, /@fs outside it', () => {
		expect(viteUrlForFile('/app/src/main.ts', '/app')).toBe('/src/main.ts');
		expect(viteUrlForFile('/app/src/main.ts', '/app/')).toBe('/src/main.ts');
		expect(viteUrlForFile('/repo/dist/packages/core/index.js', '/app')).toBe('/@fs/repo/dist/packages/core/index.js');
		expect(viteUrlForFile('/application/x.js', '/app')).toBe('/@fs/application/x.js');
	});
});

describe('transformIdForViteUrl', () => {
	it('maps virtual-module URLs to the id transformRequest expects', () => {
		expect(transformIdForViteUrl('/@id/__x00__virtual:foo')).toBe('\0virtual:foo');
		expect(transformIdForViteUrl('/@id/pkg/x.js')).toBe('pkg/x.js');
		expect(transformIdForViteUrl('/src/a.ts')).toBe('/src/a.ts');
	});
});
