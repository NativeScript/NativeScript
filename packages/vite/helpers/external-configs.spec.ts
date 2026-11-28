import { describe, it, expect, vi } from 'vitest';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { resolveConfig, type Plugin } from 'vite';

// Fixture dependency shipping an ESM `nativescript.vite.mjs` that uses a
// top-level await. `require()` (even Node's require-of-ESM) cannot load a module
// with top-level await, so this exercises the async `import()` fallback.
const depDir = mkdtempSync(path.join(tmpdir(), 'ns-ext-cfg-'));
writeFileSync(
	path.join(depDir, 'nativescript.vite.mjs'),
	`await Promise.resolve();
export default () => {
	globalThis.__nsExternalConfigCalls = (globalThis.__nsExternalConfigCalls ?? 0) + 1;
	return {
		define: { __EXTERNAL_ESM_OK__: '"true"' },
		plugins: [
			{
				name: 'fixture-external-plugin',
				configResolved() {
					globalThis.__nsExternalPluginRan = true;
				},
			},
		],
	};
};
`,
);

vi.mock('./utils.js', () => ({
	getAllDependencies: () => ['fixture-dep'],
	getDependencyPath: () => depDir,
}));

import { externalConfigsPlugin } from './external-configs.js';

const globals = globalThis as { __nsExternalConfigCalls?: number; __nsExternalPluginRan?: boolean };

describe('externalConfigsPlugin', () => {
	it('merges an ESM (top-level-await) external config via the awaited config hook, without its plugins', async () => {
		const plugin = externalConfigsPlugin().find((entry): entry is Plugin => (entry as Plugin)?.name === 'ns-external-configs');
		const hook = plugin!.config as (config: unknown, env: unknown) => unknown;
		const result = (await hook.call(plugin, {}, { command: 'serve', mode: 'development' })) as Record<string, any> | undefined;
		expect(result?.define?.__EXTERNAL_ESM_OK__).toBe('"true"');
		expect(result).not.toHaveProperty('plugins');
	});

	it('registers plugins returned by an external config with Vite', async () => {
		const resolved = await resolveConfig({ configFile: false, root: depDir, logLevel: 'silent', plugins: externalConfigsPlugin() }, 'serve');
		expect(resolved.plugins.map((p) => p.name)).toContain('fixture-external-plugin');
		expect(globals.__nsExternalPluginRan).toBe(true);
		expect(resolved.define?.__EXTERNAL_ESM_OK__).toBe('"true"');
	});

	it('loads each external config once per process', () => {
		expect(globals.__nsExternalConfigCalls).toBe(1);
	});
});
