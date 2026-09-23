import { describe, it, expect, vi } from 'vitest';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

// Fixture dependency shipping an ESM `nativescript.vite.mjs` that uses a
// top-level await. `require()` (even Node's require-of-ESM) cannot load a module
// with top-level await, so this exercises the async `import()` fallback — the
// path that previously deferred into a never-awaited array and was dropped.
const depDir = mkdtempSync(path.join(tmpdir(), 'ns-ext-cfg-'));
writeFileSync(path.join(depDir, 'nativescript.vite.mjs'), `await Promise.resolve();\nexport default () => ({ define: { __EXTERNAL_ESM_OK__: '"true"' } });\n`);

vi.mock('./utils.js', () => ({
	getAllDependencies: () => ['fixture-dep'],
	getDependencyPath: () => depDir,
}));

import { externalConfigsPlugin } from './external-configs.js';

describe('externalConfigsPlugin', () => {
	it('applies an ESM (top-level-await) external config via the awaited config hook', async () => {
		const plugin = externalConfigsPlugin();
		const hook = plugin.config as (config: unknown, env: unknown) => unknown;
		const result = (await hook.call(plugin, {}, { command: 'serve', mode: 'development' })) as { define?: Record<string, unknown> } | undefined;
		expect(result?.define?.__EXTERNAL_ESM_OK__).toBe('"true"');
	});
});
