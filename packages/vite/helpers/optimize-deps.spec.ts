import { afterEach, describe, expect, it } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createServer, resolveConfig, type Plugin, type ViteDevServer } from 'vite';
import { collectOwnOptimizeDepsInclude, enforceOptimizeDepsPolicy, NS_OPTIMIZE_DEPS_EXCLUDE, nsOptimizeDepsPolicyPlugin } from './optimize-deps.js';

// Stands in for a framework plugin (Analog) that adds includes and turns discovery back on.
const injectingPlugin: Plugin = {
	name: 'spec-injects-optimize-deps',
	config: () => ({ optimizeDeps: { include: ['injected-by-plugin'], noDiscovery: false, entries: ['src/**/*.ts'] } }),
	configEnvironment: (name) => (name === 'client' ? { optimizeDeps: { include: ['injected-for-client'] } } : undefined),
};

describe('enforceOptimizeDepsPolicy', () => {
	it('turns discovery off, clears entries and keeps only the allowed includes', () => {
		const deps = { noDiscovery: false, entries: ['src/**'], include: ['a', 'plugin-dep'] };
		const dropped = enforceOptimizeDepsPolicy(deps, ['a', 'b']);
		expect(deps).toEqual({ noDiscovery: true, entries: [], include: ['a', 'b'] });
		expect(dropped).toEqual(['plugin-dep']);
	});
});

describe('collectOwnOptimizeDepsInclude', () => {
	it('reads the top-level and client-environment include lists once each', () => {
		expect(collectOwnOptimizeDepsInclude({ optimizeDeps: { include: ['a', 'b'] }, environments: { client: { optimizeDeps: { include: ['b', 'c'] } } } })).toEqual(['a', 'b', 'c']);
		expect(collectOwnOptimizeDepsInclude({})).toEqual([]);
	});
});

describe('NS_OPTIMIZE_DEPS_EXCLUDE', () => {
	it('keeps the single-instance packages and the aliased shims external to pre-bundles', () => {
		expect(NS_OPTIMIZE_DEPS_EXCLUDE).toEqual(expect.arrayContaining(['@nativescript/core', '@nativescript/vite', 'module', 'node:module', 'set-value']));
		expect(NS_OPTIMIZE_DEPS_EXCLUDE).not.toContain('react');
		expect(NS_OPTIMIZE_DEPS_EXCLUDE).not.toContain('react-reconciler');
	});
});

describe('nsOptimizeDepsPolicyPlugin', () => {
	let tmp: string | undefined;
	let server: ViteDevServer | undefined;
	afterEach(async () => {
		await server?.close();
		server = undefined;
		if (tmp) fs.rmSync(tmp, { recursive: true, force: true });
		tmp = undefined;
	});
	const makeRoot = () => (tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'ns-optimize-deps-policy-')));

	it("keeps the app's own includes and drops those other plugins add", async () => {
		const resolved = await resolveConfig(
			{
				root: makeRoot(),
				configFile: false,
				logLevel: 'silent',
				optimizeDeps: { include: ['app-cjs-dep'] },
				plugins: [nsOptimizeDepsPolicyPlugin(), injectingPlugin],
			},
			'serve',
		);
		expect(resolved.optimizeDeps.include).toEqual(['app-cjs-dep']);
		expect(resolved.optimizeDeps.noDiscovery).toBe(true);
		expect(resolved.optimizeDeps.entries).toEqual([]);
		expect(resolved.environments.client.optimizeDeps).toBe(resolved.optimizeDeps);
	});

	it('leaves the client environment without a dep optimizer when the app includes nothing', async () => {
		server = await createServer({
			root: makeRoot(),
			configFile: false,
			logLevel: 'silent',
			appType: 'custom',
			server: { middlewareMode: true, ws: false, watch: null },
			plugins: [nsOptimizeDepsPolicyPlugin(), injectingPlugin],
		});
		expect(server.environments.client.depsOptimizer).toBeUndefined();
	});

	it('does not touch builds', async () => {
		const resolved = await resolveConfig({ root: makeRoot(), configFile: false, logLevel: 'silent', plugins: [nsOptimizeDepsPolicyPlugin(), injectingPlugin] }, 'build');
		expect(resolved.optimizeDeps.include).toContain('injected-by-plugin');
	});
});
