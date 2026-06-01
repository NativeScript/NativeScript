import { describe, expect, it } from 'vitest';
import type { FrameworkClientStrategy } from './framework-client-strategy.js';
import { vueClientStrategy } from '../frameworks/vue/client/strategy.js';
import { angularClientStrategy } from '../frameworks/angular/client/strategy.js';

// Mirrors the production CLIENT_STRATEGY selection in client/index.ts: only Vue
// and Angular ship a client module. Solid and TypeScript have none and resolve
// to `undefined`, so the shared client paths run unchanged for them.
const REGISTRY: FrameworkClientStrategy[] = [vueClientStrategy, angularClientStrategy];

describe('FrameworkClientStrategy contract', () => {
	it('every registered client strategy implements the required surface', () => {
		for (const strategy of REGISTRY) {
			expect(typeof strategy.flavor).toBe('string');
			expect(typeof strategy.install).toBe('function');
		}
	});

	it('Vue owns the SFC mount/navigate/registry surface and opts out of the navigate fast path', () => {
		expect(vueClientStrategy.flavor).toBe('vue');
		expect(vueClientStrategy.allowNavigateFastPath).toBe(false);
		const vueHooks = ['installBackWrapper', 'selectMountCandidate', 'loadComponentForMount', 'beforeNavigateBuild', 'onNavAppCreated', 'createRoot', 'recordPayloadChanges', 'refreshAfterBatch', 'handleSfcRegistry', 'handleSfcRegistryUpdate'] as const;
		for (const hook of vueHooks) {
			expect(typeof vueClientStrategy[hook]).toBe('function');
		}
		// Vue refreshes via the SFC registry path, never the Angular hot-update message.
		expect(vueClientStrategy.handleHotUpdateMessage).toBeUndefined();
	});

	it('Angular owns only install + the hot-update message and keeps shared defaults elsewhere', () => {
		expect(angularClientStrategy.flavor).toBe('angular');
		expect(angularClientStrategy.allowNavigateFastPath).toBe(true);
		expect(typeof angularClientStrategy.handleHotUpdateMessage).toBe('function');
		const sharedDefaultHooks = ['installBackWrapper', 'selectMountCandidate', 'loadComponentForMount', 'beforeNavigateBuild', 'onNavAppCreated', 'createRoot', 'recordPayloadChanges', 'refreshAfterBatch', 'handleSfcRegistry', 'handleSfcRegistryUpdate'] as const;
		for (const hook of sharedDefaultHooks) {
			expect(angularClientStrategy[hook]).toBeUndefined();
		}
	});

	it('Vue selectMountCandidate prefers an app-entry .vue dep, then any graphed .vue', () => {
		const graph = new Map<string, { id: string; deps: string[]; hash: string }>([
			['/src/app.ts', { id: '/src/app.ts', deps: ['/src/components/Home.vue', '/src/util.ts'], hash: '' }],
			['/src/components/Home.vue', { id: '/src/components/Home.vue', deps: [], hash: '' }],
		]);
		expect(vueClientStrategy.selectMountCandidate!({ graph, appMainEntrySpec: '/src/app.ts' })).toBe('/src/components/Home.vue');

		// No app-entry dep → falls back to scanning the graph for any .vue id.
		const graphNoEntry = new Map<string, { id: string; deps: string[]; hash: string }>([['/src/components/Other.vue', { id: '/src/components/Other.vue', deps: [], hash: '' }]]);
		expect(vueClientStrategy.selectMountCandidate!({ graph: graphNoEntry, appMainEntrySpec: '/src/app.ts' })).toBe('/src/components/Other.vue');

		// No .vue anywhere → null (no mount candidate).
		const graphNoVue = new Map<string, { id: string; deps: string[]; hash: string }>([['/src/app.ts', { id: '/src/app.ts', deps: ['/src/util.ts'], hash: '' }]]);
		expect(vueClientStrategy.selectMountCandidate!({ graph: graphNoVue, appMainEntrySpec: '/src/app.ts' })).toBeNull();
	});
});
