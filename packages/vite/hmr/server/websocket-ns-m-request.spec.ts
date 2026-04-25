import { describe, expect, it } from 'vitest';

import { createNsMRequestContext, resolveNsMTransformedModule } from './websocket-ns-m-request.js';

describe('createNsMRequestContext', () => {
	it('normalizes decorated HMR request paths into canonical module specs', () => {
		const result = createNsMRequestContext('/ns/m/__ns_hmr__/v42/src/app/app.routes', '/workspace', '/src/');

		expect(result.kind).toBe('context');
		if (result.kind !== 'context') {
			return;
		}

		expect(result.value.spec).toBe('/src/app/app.routes');
		expect(result.value.forcedVer).toBe('v42');
		expect(result.value.bootTaggedRequest).toBe(false);
	});

	it('returns a response module for blocked build-time node_modules imports', () => {
		const result = createNsMRequestContext('/ns/m/node_modules/vite/dist/index.js', '/workspace', '/src/');

		expect(result).toEqual({
			kind: 'response',
			statusCode: 404,
			code: expect.stringContaining('build-time package is not device-loadable: vite'),
		});
	});
});

describe('resolveNsMTransformedModule', () => {
	it('falls back to pluginContainer.load for virtual /@id requests', async () => {
		const contextResult = createNsMRequestContext('/ns/m/@id/__x00__virtual:test', '/workspace', '/src/');
		expect(contextResult.kind).toBe('context');
		if (contextResult.kind !== 'context') {
			return;
		}

		const resolved = await resolveNsMTransformedModule({
			context: contextResult.value,
			transformRequest: async () => null,
			resolveId: async () => null,
			loadVirtualId: async (id) => (id === '\0virtual:test' ? 'export const ok = true;\n' : null),
		});

		expect(resolved.resolvedCandidate).toBe('\0virtual:test');
		expect(resolved.transformed?.code).toBe('export const ok = true;\n');
	});
});
