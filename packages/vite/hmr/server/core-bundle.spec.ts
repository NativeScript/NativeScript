import { mkdtempSync, mkdirSync, rmSync, writeFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import * as path from 'node:path';
import { afterAll, describe, expect, it } from 'vitest';

import { CORE_BUNDLE_PATH, buildCoreBundleEntryCode, buildCoreMainShimCode, buildCoreSubShimCode, createCoreBundleService, enumerateCoreModuleSubpaths, generateCoreBundle, isCorePerModuleServingEnabled, isExpectedCoreBundleExclusion, resolveCoreRootForBundle } from './core-bundle.js';

describe('isCorePerModuleServingEnabled', () => {
	const standalone = () => false;
	const monorepoCore = () => true;

	it('is off by default for standalone apps and on for 1/true', () => {
		expect(isCorePerModuleServingEnabled({} as any, standalone)).toBe(false);
		expect(isCorePerModuleServingEnabled({ NS_CORE_PER_MODULE: '0' } as any, standalone)).toBe(false);
		expect(isCorePerModuleServingEnabled({ NS_CORE_PER_MODULE: '1' } as any, standalone)).toBe(true);
		expect(isCorePerModuleServingEnabled({ NS_CORE_PER_MODULE: 'true' } as any, standalone)).toBe(true);
	});

	it('auto-enables for monorepo core source, with explicit env overrides winning', () => {
		expect(isCorePerModuleServingEnabled({} as any, monorepoCore)).toBe(true);
		expect(isCorePerModuleServingEnabled({ NS_CORE_PER_MODULE: '0' } as any, monorepoCore)).toBe(false);
		expect(isCorePerModuleServingEnabled({ NS_CORE_PER_MODULE: 'false' } as any, monorepoCore)).toBe(false);
		expect(isCorePerModuleServingEnabled({ NS_CORE_PER_MODULE: '1' } as any, monorepoCore)).toBe(true);
	});

	it('falls back to bundle mode when workspace detection throws', () => {
		expect(
			isCorePerModuleServingEnabled({} as any, () => {
				throw new Error('fs unavailable');
			}),
		).toBe(false);
	});
});

describe('enumerateCoreModuleSubpaths', () => {
	const fixtureRoot = mkdtempSync(path.join(tmpdir(), 'ns-core-enum-'));
	afterAll(() => rmSync(fixtureRoot, { recursive: true, force: true }));

	const write = (rel: string, contents = 'export const x = 1;') => {
		const abs = path.join(fixtureRoot, rel);
		mkdirSync(path.dirname(abs), { recursive: true });
		writeFileSync(abs, contents);
	};

	write('index.ts');
	write('application/index.ios.ts');
	write('application/index.android.ts');
	write('ui/frame/index.ios.ts');
	write('ui/frame/index.android.ts');
	write('ui/frame/fragment.transitions.android.ts');
	write('ui/frame/frame-helper-for-android.ts');
	write('utils/index.ts');
	write('utils/native-helper.ios.ts');
	write('inspector_modules.ts');
	write('debugger/webinspector-network.ts');
	write('cli-hooks/before-checkForChanges.js');
	write('platforms/ios/README.md');
	write('index.d.ts');
	write('utils/index.spec.ts');
	write('vite.config.ts');

	it('collapses platform variants to canonical subs and applies exclusions (ios)', () => {
		const subs = enumerateCoreModuleSubpaths(fixtureRoot, 'ios');
		expect(subs).toContain('application');
		expect(subs).toContain('ui/frame');
		expect(subs).toContain('utils');
		expect(subs).toContain('utils/native-helper');
		// android-only module — not loadable on ios
		expect(subs).not.toContain('ui/frame/fragment.transitions');
		// cross-platform helper whose siblings only exist for android
		expect(subs).not.toContain('ui/frame/frame-helper-for-android');
		// exclusions
		expect(subs).not.toContain('inspector_modules');
		expect(subs.some((s) => s.startsWith('debugger/'))).toBe(false);
		expect(subs.some((s) => s.startsWith('cli-hooks/'))).toBe(false);
		expect(subs.some((s) => s.startsWith('platforms/'))).toBe(false);
		expect(subs).not.toContain('vite.config');
		// non-modules
		expect(subs).not.toContain('index');
		expect(subs).not.toContain('utils/index.spec');
	});

	it('includes android-only modules on android and skips ios-only ones', () => {
		const subs = enumerateCoreModuleSubpaths(fixtureRoot, 'android');
		expect(subs).toContain('ui/frame/fragment.transitions');
		expect(subs).toContain('ui/frame/frame-helper-for-android');
		expect(subs).not.toContain('utils/native-helper');
		// dirs with both platform variants stay
		expect(subs).toContain('ui/frame');
	});
});

describe('isExpectedCoreBundleExclusion', () => {
	it('recognizes deliberately excluded subs (the boot-time inspector/debugger set)', () => {
		expect(isExpectedCoreBundleExclusion('bundle-entry-points')).toBe(true);
		expect(isExpectedCoreBundleExclusion('inspector_modules')).toBe(true);
		expect(isExpectedCoreBundleExclusion('debugger')).toBe(true);
		expect(isExpectedCoreBundleExclusion('debugger/webinspector-network')).toBe(true);
		expect(isExpectedCoreBundleExclusion('debugger/devtools-elements.common')).toBe(true);
	});

	it('does not flag normal runtime subs or the package main', () => {
		expect(isExpectedCoreBundleExclusion('')).toBe(false);
		expect(isExpectedCoreBundleExclusion('ui/frame')).toBe(false);
		expect(isExpectedCoreBundleExclusion('utils')).toBe(false);
		expect(isExpectedCoreBundleExclusion('application')).toBe(false);
	});
});

describe('buildCoreBundleEntryCode', () => {
	it('imports main first, registers every sub under its registration keys, and re-exports main', () => {
		const code = buildCoreBundleEntryCode(['application', 'ui/frame']);
		expect(code).toContain(`import * as __ns_core_main__ from "@nativescript/core";`);
		expect(code).toContain(`import * as __ns_core_m_0__ from "@nativescript/core/application";`);
		expect(code).toContain(`import * as __ns_core_m_1__ from "@nativescript/core/ui/frame";`);
		expect(code).toContain('globalThis.__NS_CORE_MODULES__');
		// registration keys come from the canonical helper (bare + sub + tolerated tails)
		expect(code).toContain('"@nativescript/core/ui/frame"');
		expect(code).toContain('"ui/frame"');
		expect(code).toContain('"@nativescript/core/ui/frame/index.js"');
		expect(code).toContain(`export * from "@nativescript/core";`);
	});
});

describe('shim codegen', () => {
	it('main shim re-exports the bundle with a default bridge', () => {
		const code = buildCoreMainShimCode();
		expect(code).toContain(`import * as __ns_core_bundle_ns__ from "${CORE_BUNDLE_PATH}";`);
		expect(code).toContain(`export * from "${CORE_BUNDLE_PATH}";`);
		expect(code).toContain('export default __ns_core_bundle_ns__;');
	});

	it('sub shim imports the bundle FIRST, reads the registry, and emits filtered named exports + default', () => {
		const code = buildCoreSubShimCode('ui/frame/index.js', ['Frame', 'setActivityCallbacks', 'Frame', 'default', 'class', 'not-an-identifier', '__ns_core_sub_ns__']);
		// canonicalized registry key (`/index.js` tail stripped)
		expect(code).toContain(`(globalThis.__NS_CORE_MODULES__ || {})["@nativescript/core/ui/frame"]`);
		const bundleImportIdx = code.indexOf(`import "${CORE_BUNDLE_PATH}";`);
		const registryReadIdx = code.indexOf('__NS_CORE_MODULES__');
		expect(bundleImportIdx).toBeGreaterThanOrEqual(0);
		expect(bundleImportIdx).toBeLessThan(registryReadIdx);
		expect(code).toContain('export const Frame = __ns_core_sub_ns__.Frame;');
		expect(code).toContain('export const setActivityCallbacks = __ns_core_sub_ns__.setActivityCallbacks;');
		// deduped
		expect(code.match(/export const Frame /g)).toHaveLength(1);
		// reserved / invalid / internal names filtered
		expect(code).not.toContain('export const default');
		expect(code).not.toContain('export const class');
		expect(code).not.toContain('not-an-identifier');
		expect(code).not.toContain('export const __ns_core_sub_ns__');
		expect(code).toContain('export default __ns_core_sub_ns__;');
	});

	it('sub shim with no discovered names still provides a default export', () => {
		const code = buildCoreSubShimCode('utils', []);
		expect(code).toContain('export default __ns_core_sub_ns__;');
		expect(code).not.toContain('export const');
	});

	it('sub shim with an own default export forwards the registry default (not the namespace)', () => {
		// utils/lazy.js declares `export default function lazy(...)` — consumers
		// do `import lazy from '@nativescript/core/utils/lazy'` and call it.
		const code = buildCoreSubShimCode('utils/lazy', [], true);
		expect(code).toContain('export default __ns_core_sub_ns__.default;');
		expect(code).not.toContain('export default __ns_core_sub_ns__;');
	});
});

describe('createCoreBundleService', () => {
	it('fails soft: unresolvable core root → null result, hasFailed(), and stays failed', async () => {
		const service = createCoreBundleService({ projectRoot: path.join(tmpdir(), 'does-not-exist-ns'), platform: 'ios', mode: 'development' });
		expect(await service.ensureBuilt()).toBeNull();
		expect(service.hasFailed()).toBe(true);
		expect(service.getState()).toBeNull();
		// second call short-circuits to null without rebuilding
		expect(await service.ensureBuilt()).toBeNull();
	});
});

// Real esbuild integration — only runs inside the NativeScript monorepo where
// packages/core (TS source, the hardest input) is available. Guarded so the
// spec is a no-op for consumers running the published package's tests.
describe('generateCoreBundle (integration)', () => {
	const specDir = path.dirname(new URL(import.meta.url).pathname);
	const monorepoRoot = path.resolve(specDir, '../../../..');
	const toolboxRoot = path.join(monorepoRoot, 'apps/toolbox');
	const hasFixture = existsSync(path.join(monorepoRoot, 'packages/core/package.json')) && existsSync(path.join(toolboxRoot, 'package.json'));

	it.skipIf(!hasFixture)(
		'bundles monorepo core for ios into one self-contained ESM payload',
		async () => {
			const coreRoot = resolveCoreRootForBundle(toolboxRoot);
			const subs = enumerateCoreModuleSubpaths(coreRoot, 'ios');
			expect(subs.length).toBeGreaterThan(100);
			expect(subs).toContain('ui/frame');
			expect(subs).toContain('ui/styling/style-scope');

			const state = await generateCoreBundle({ projectRoot: toolboxRoot, platform: 'ios', mode: 'development', flavor: 'typescript' });
			expect(state.subs.has('ui/frame')).toBe(true);
			// Self-contained: no top-level static imports may remain (bare 'module'
			// etc. must be aliased to polyfills; node builtins must be unused).
			expect(state.code).not.toMatch(/^import[\s"']/m);
			// NativeClass decorators transformed away
			expect(state.code).not.toContain('@NativeClass');
			// Registry population + named export surface present
			expect(state.code).toContain('__NS_CORE_MODULES__');
			expect(state.code).toMatch(/^export \{/m);
		},
		120000,
	);
});
