import { afterEach, describe, expect, it, vi } from 'vitest';
import { mkdtempSync, mkdirSync, realpathSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { createNsMRequestContext, resolveFsAnchoredSpec, resolveNsMTransformedModule } from './websocket-ns-m-request.js';

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

	it('decodes percent-encoded pathname specs (device-encoded bracketed files)', () => {
		const encoded = createNsMRequestContext('/ns/m/packages/app/src/app/demo/%5Bid%5D.tsrx?import', '/workspace', '/src/');
		const raw = createNsMRequestContext('/ns/m/packages/app/src/app/demo/[id].tsrx?import', '/workspace', '/src/');

		expect(encoded.kind).toBe('context');
		expect(raw.kind).toBe('context');
		if (encoded.kind !== 'context' || raw.kind !== 'context') {
			return;
		}

		expect(encoded.value.spec).toBe('/packages/app/src/app/demo/[id].tsrx');
		expect(encoded.value.spec).toBe(raw.value.spec);
	});

	it('does not double-decode the already-decoded ?path= spec', () => {
		const result = createNsMRequestContext('/ns/m/?path=/app/demo/%255Bid%255D.tsrx', '/workspace', '/src/');

		expect(result.kind).toBe('context');
		if (result.kind !== 'context') {
			return;
		}

		expect(result.value.spec).toBe('/app/demo/%5Bid%5D.tsrx');
	});

	it('leaves encoded reserved characters encoded, matching Vite', () => {
		const result = createNsMRequestContext('/ns/m/app/a%3Fb%23c%2Fd.ts', '/workspace', '/src/');

		expect(result.kind).toBe('context');
		if (result.kind !== 'context') {
			return;
		}

		expect(result.value.spec).toBe('/app/a%3Fb%23c%2Fd.ts');
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

describe('createNsMRequestContext — platform-suffixed candidates', () => {
	afterEach(() => {
		vi.unstubAllEnvs();
	});

	it('probes only the active platform suffix, ahead of unsuffixed variants', () => {
		vi.stubEnv('NATIVESCRIPT_BUNDLER_ENV', JSON.stringify({ ios: true }));
		const result = createNsMRequestContext('/ns/m/src/plugin', '/workspace', '/src/');
		if (result.kind !== 'context') throw new Error('expected context');
		const { candidates } = result.value;

		expect(candidates.indexOf('/src/plugin/index.ios.js')).toBeGreaterThan(-1);
		expect(candidates.indexOf('/src/plugin/index.ios.js')).toBeLessThan(candidates.indexOf('/src/plugin/index.js'));
		expect(candidates.some((c) => c.includes('.android.'))).toBe(false);
	});
});

describe('resolveNsMTransformedModule', () => {
	let fixtureRoot: string | null = null;

	afterEach(() => {
		if (fixtureRoot) {
			rmSync(fixtureRoot, { recursive: true, force: true });
			fixtureRoot = null;
		}
	});

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

	it('rewrites hoisted workspace-root /node_modules/ candidates to /@fs/<abs> form', () => {
		// Reproduce the Nx-style layout that triggered the bug.
		const wsRoot = realpathSync(mkdtempSync(join(tmpdir(), 'ns-hmr-ns-m-context-')));
		fixtureRoot = wsRoot;
		const appRoot = join(wsRoot, 'apps', 'app');
		mkdirSync(appRoot, { recursive: true });
		const hoistedDir = join(wsRoot, 'node_modules/css-tree/lib/syntax');
		mkdirSync(hoistedDir, { recursive: true });
		writeFileSync(join(hoistedDir, 'index.js'), 'export default 1;\n');

		const result = createNsMRequestContext('/ns/m/node_modules/css-tree/lib/syntax/index.js', appRoot, '/src/', wsRoot);

		expect(result.kind).toBe('context');
		if (result.kind !== 'context') return;

		expect(result.value.spec).toBe('/node_modules/css-tree/lib/syntax/index.js');
		expect(result.value.workspaceRoot).toBe(wsRoot);
		expect(result.value.transformCandidates).toEqual([`/@fs${join(wsRoot, 'node_modules/css-tree/lib/syntax/index.js').replace(/\\/g, '/')}`]);
	});

	it('falls back to /@fs/<workspaceRoot>/<spec> when project-root candidates are exhausted', async () => {
		const wsRoot = realpathSync(mkdtempSync(join(tmpdir(), 'ns-hmr-ns-m-fs-fallback-')));
		fixtureRoot = wsRoot;
		const appRoot = join(wsRoot, 'apps', 'app');
		mkdirSync(appRoot, { recursive: true });
		const hoistedDir = join(wsRoot, 'node_modules/foo');
		mkdirSync(hoistedDir, { recursive: true });
		writeFileSync(join(hoistedDir, 'baz.js'), 'export const v = 1;\n');

		const result = createNsMRequestContext('/ns/m/node_modules/foo/baz', appRoot, '/src/', wsRoot);
		expect(result.kind).toBe('context');
		if (result.kind !== 'context') return;

		const expectedFsId = `/@fs${join(wsRoot, 'node_modules/foo/baz.js').replace(/\\/g, '/')}`;
		expect(result.value.transformCandidates).toContain(expectedFsId);

		const transformedCalls: string[] = [];
		const resolved = await resolveNsMTransformedModule({
			context: result.value,
			transformRequest: async (url) => {
				transformedCalls.push(url);
				if (url === expectedFsId) {
					return { code: 'export const v = 1;\n' } as never;
				}
				return null;
			},
			resolveId: async () => null,
			loadVirtualId: async () => null,
		});

		expect(resolved.transformed?.code).toBe('export const v = 1;\n');
		expect(resolved.resolvedCandidate).toBe(expectedFsId);
		expect(transformedCalls).toContain(expectedFsId);
	});
});

describe('resolveFsAnchoredSpec', () => {
	it('anchors a workspace css file outside the app root to its /@fs id', () => {
		const wsRoot = realpathSync(mkdtempSync(join(tmpdir(), 'ns-hmr-ns-m-fs-anchor-')));
		try {
			const appRoot = join(wsRoot, 'apps/native');
			mkdirSync(appRoot, { recursive: true });
			mkdirSync(join(wsRoot, 'packages/ui/src/theme'), { recursive: true });
			writeFileSync(join(wsRoot, 'packages/ui/src/theme/tokens.css'), '.a { color: red; }');

			expect(resolveFsAnchoredSpec('/packages/ui/src/theme/tokens.css', appRoot, wsRoot)).toBe(`/@fs/${wsRoot.replace(/\\/g, '/').replace(/^\//, '')}/packages/ui/src/theme/tokens.css`);
			expect(resolveFsAnchoredSpec('/packages/ui/src/theme/missing.css', appRoot, wsRoot)).toBeNull();
		} finally {
			rmSync(wsRoot, { recursive: true, force: true });
		}
	});
});
