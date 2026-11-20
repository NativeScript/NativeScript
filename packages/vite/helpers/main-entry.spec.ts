import { afterEach, describe, expect, it, vi } from 'vitest';

// The boot code names the app's main entry; cwd may be the workspace root.
vi.mock('./project.js', async (importOriginal) => ({ ...(await importOriginal<typeof import('./project.js')>()), getPackageJson: () => ({ main: 'src/app.ts' }) }));

import { generateDevBootCode, isStrictGlobalRequireEnabled } from './main-entry.js';

const STRICT_IMPORT = "import '@nativescript/vite/runtime/strict-global-require.js';";

afterEach(() => {
	delete process.env.NS_VITE_STRICT_REQUIRE;
});

describe('strict global require flag', () => {
	it('is off unless NS_VITE_STRICT_REQUIRE is a truthy spelling', () => {
		expect(isStrictGlobalRequireEnabled({})).toBe(false);
		expect(isStrictGlobalRequireEnabled({ NS_VITE_STRICT_REQUIRE: '0' })).toBe(false);
		expect(isStrictGlobalRequireEnabled({ NS_VITE_STRICT_REQUIRE: 'false' })).toBe(false);
		for (const value of ['1', 'true', 'ON', ' yes ']) expect(isStrictGlobalRequireEnabled({ NS_VITE_STRICT_REQUIRE: value })).toBe(true);
	});

	it('makes the shadow the first import of the dev boot module', () => {
		const opts = { platform: 'ios' as const, verbose: false, flavor: 'typescript' };
		expect(generateDevBootCode(opts)).not.toContain(STRICT_IMPORT);
		process.env.NS_VITE_STRICT_REQUIRE = '1';
		const code = generateDevBootCode(opts);
		expect(code.split('\n').find((line) => line.startsWith('import '))).toBe(STRICT_IMPORT);
	});
});

describe('dev boot module', () => {
	it('awaits the session and exports its failure for bundle.mjs, with no placeholder', () => {
		const code = generateDevBootCode({ platform: 'ios', verbose: false, flavor: 'typescript' });
		expect(code).toContain('export const bootFailure = await startBrowserRuntimeSession({"sessionUrl":"/__ns_dev__/session.mjs","importMapUrl":"/__ns_dev__/import-map.mjs"}, __nsVerboseLog);');
		expect(code).not.toMatch(/placeholder/i);
	});
});
