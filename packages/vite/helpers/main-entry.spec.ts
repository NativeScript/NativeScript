import { afterEach, describe, expect, it } from 'vitest';
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
