import { describe, it, expect, vi } from 'vitest';
import { createHash } from 'crypto';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'fs';
import * as path from 'path';
import os from 'os';

vi.mock('../../../helpers/vendor-rewrite.js', () => {
	return {
		rewriteVendorVueSpec: vi.fn((code: string, origin: string, version: number) => `rewritten(${version})::${code}`),
	};
});

import { rewriteVendorVueSpec } from '../../../helpers/vendor-rewrite.js';
import { vueServerStrategy } from './strategy.js';
import { getProjectAppVirtualPath } from '../../../../helpers/utils.js';
import type { FrameworkProcessFileContext, FrameworkRegistryContext } from '../../../server/framework-strategy.js';

type ProcessHelpers = NonNullable<FrameworkProcessFileContext['helpers']>;
type RegistryHelpers = NonNullable<FrameworkRegistryContext['helpers']>;

const mockedRewriteVendor = vi.mocked(rewriteVendorVueSpec);

const APP_ENTRY = getProjectAppVirtualPath('App.vue');
const APP_ENTRY_WITH_QUERY = `${APP_ENTRY}?vue&type=script&lang.ts`;
const CHILD_ENTRY = getProjectAppVirtualPath('Child.vue');

describe('vueServerStrategy', () => {
	it('matches and cleans Vue modules', () => {
		expect(vueServerStrategy.flavor).toBe('vue');
		expect(vueServerStrategy.matchesFile(APP_ENTRY)).toBe(true);
		expect(vueServerStrategy.matchesFile(APP_ENTRY_WITH_QUERY)).toBe(true);

		const dirty = `
import "./App.vue?type=style&lang.css";
import helper from "__vite-plugin-vue_export-helper";
import virtual from "/@id/__generated";
const keep = 1;
`;
		const cleaned = vueServerStrategy.preClean(dirty);
		expect(cleaned).not.toContain('type=style');
		expect(cleaned).not.toContain('__vite-plugin-vue_export_helper');
		expect(cleaned).not.toContain('/@id/');
		expect(cleaned).toContain('const keep = 1');
	});

	it('rewrites framework imports and strips HMR noise', () => {
		const raw = `
import { createApp } from "vue";
import { something } from "nativescript-vue/runtime";
if (__VUE_HMR_RUNTIME__) {
  __VUE_HMR_RUNTIME__.reload();
} else {
  __VUE_HMR_RUNTIME__.rerender();
}
const __hmrId = "foo";
export default {};
`;
		const rewritten = vueServerStrategy.rewriteFrameworkImports(raw);
		expect(rewritten).toContain('/@nativescript/vendor.mjs');

		const post = vueServerStrategy.postClean(rewritten);
		expect(post).not.toContain('__VUE_HMR_RUNTIME__.reload');
		expect(post).not.toContain('__VUE_HMR_RUNTIME__.rerender');
		expect(post).not.toMatch(/__hmrId/);
	});

	it('ensures SFC imports are versioned', () => {
		const code = `
import View from "/ns/sfc/components/View.vue";
const lazy = import("/ns/sfc/components/View.vue");
`;
		const versioned = vueServerStrategy.ensureVersionedImports(code, 'http://localhost:5173', 42);
		expect(versioned).toContain('/ns/sfc/42/components/View.vue');
		expect(versioned.match(/\/ns\/sfc\/42/g)?.length).toBe(2);
	});

	it('delegates vendor rewrite to helper', () => {
		mockedRewriteVendor.mockClear();
		const input = "import { createApp } from 'vue';";
		expect(vueServerStrategy.rewriteVendorSpec).toBeDefined();
		const result = vueServerStrategy.rewriteVendorSpec!(input, 'http://localhost:5173', 7);
		expect(mockedRewriteVendor).toHaveBeenCalledWith(input, 'http://localhost:5173', 7);
		expect(result).toBe(`rewritten(7)::${input}`);
	});

	it('registers nested Vue dependencies during processFile', async () => {
		const server = {
			transformRequest: vi.fn(async () => ({ code: 'export default {};' })),
		} as unknown as FrameworkProcessFileContext['server'];

		const basePath = APP_ENTRY;
		const childPath = CHILD_ENTRY;
		const sfcFileMap = new Map<string, string>([[basePath, 'sfc-root.mjs']]);
		const depFileMap = new Map<string, string>();
		const visitedPaths = new Set<string>();
		const helpers: ProcessHelpers = {
			cleanCode: (code) => code,
			collectImportDependencies: (_: string, importer: string): Set<string> => (importer === basePath ? new Set<string>([childPath]) : new Set<string>()),
			isCoreGlobalsReference: () => false,
			isNativeScriptCoreModule: () => false,
			isNativeScriptPluginModule: () => false,
			resolveVendorFromCandidate: () => null,
			createHash: (value) => createHash('md5').update(value).digest('hex'),
		};

		await vueServerStrategy.processFile({
			filePath: basePath,
			server,
			sfcFileMap,
			depFileMap,
			visitedPaths,
			wss: {} as any,
			verbose: false,
			helpers,
		});

		const expectedHash = createHash('md5').update(childPath).digest('hex').slice(0, 8);
		expect(sfcFileMap.get(childPath)).toBe(`sfc-${expectedHash}.mjs`);
		expect(server.transformRequest).toHaveBeenCalledWith(childPath);
		expect(visitedPaths.has(childPath)).toBe(true);
	});

	it('builds and broadcasts an SFC registry', async () => {
		const tmpRoot = mkdtempSync(path.join(os.tmpdir(), 'vue-strategy-'));
		try {
			const appPath = path.join(tmpRoot, 'App.vue');
			const childDir = path.join(tmpRoot, 'components');
			mkdirSync(childDir, { recursive: true });
			const childPath = path.join(childDir, 'Child.vue');
			writeFileSync(appPath, '<template></template>');
			writeFileSync(childPath, '<template></template>');

			const sfcFileMap = new Map<string, string>();
			const depFileMap = new Map<string, string>();
			const sent: any[] = [];
			const client = {
				OPEN: 1,
				readyState: 1,
				send: vi.fn((msg: string) => sent.push(JSON.parse(msg))),
			};
			const wss = {
				clients: new Set([client]),
			} as unknown as FrameworkRegistryContext['wss'];

			const server = {
				config: { root: tmpRoot },
				transformRequest: vi.fn(async (id: string) => {
					if (id.endsWith('App.vue')) {
						return {
							code: 'import Child from "./components/Child.vue"; export default {};',
						};
					}
					if (id.endsWith('Child.vue')) {
						return { code: 'export default {};' };
					}
					return { code: '' };
				}),
			} as unknown as FrameworkRegistryContext['server'];

			const collectDeps = vi.fn((_: string, importer: string): Set<string> => (importer.endsWith('App.vue') ? new Set<string>(['/components/Child.vue']) : new Set<string>()));

			const helpers: RegistryHelpers = {
				cleanCode: (code) => code,
				collectImportDependencies: collectDeps,
				isCoreGlobalsReference: () => false,
				isNativeScriptCoreModule: () => false,
				isNativeScriptPluginModule: () => false,
				resolveVendorFromCandidate: () => null,
				createHash: (value) => createHash('md5').update(value).digest('hex'),
				processSfcCode: vi.fn((code: string) => code),
				rewriteImports: vi.fn((_code, _importerPath, _sfcFileMap, _depFileMap, _projectRoot, _verbose, _outputDirOverrideRel) => 'rewritten'),
			};

			await vueServerStrategy.buildRegistry({
				server,
				sfcFileMap,
				depFileMap,
				wss,
				verbose: false,
				helpers,
			});

			expect(server.transformRequest).toHaveBeenCalledWith('/App.vue');
			expect(server.transformRequest).toHaveBeenCalledWith('/components/Child.vue');
			expect(helpers.processSfcCode).toHaveBeenCalled();
			expect(helpers.rewriteImports).toHaveBeenCalled();
			expect(client.send).toHaveBeenCalledTimes(1);

			const payload = sent[0];
			expect(payload.type).toBe('ns:vue-sfc-registry');
			expect(Array.isArray(payload.entries)).toBe(true);
			expect(payload.entries.length).toBeGreaterThanOrEqual(1);

			const expectedAppHash = createHash('md5').update('/App.vue').digest('hex').slice(0, 8);
			expect(sfcFileMap.get('/App.vue')).toBe(`sfc-${expectedAppHash}.mjs`);
		} finally {
			rmSync(tmpRoot, { recursive: true, force: true });
		}
	});
});
