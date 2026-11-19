import { existsSync, mkdirSync, mkdtempSync, readdirSync, realpathSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import * as path from 'node:path';
import { pathToFileURL } from 'node:url';
import { afterAll, describe, expect, it, vi } from 'vitest';

import { setUserDefineEntries } from '../../helpers/global-defines.js';
import { DEPS_BUNDLE_PATH, buildDepsBundleEntryCode, buildDepsCandidateSpecs, buildDepsVendorRuntimeModule, computeDepsBundleCacheKey, createDepsBundleService, depsBundleCoreSpecifiers, depsRegistryKeyForFile, generateDepsBundle, isDepsPerModuleServingEnabled, resolveDepsEntriesFromVendorCollection } from './deps-bundle.js';
import { registerFrameworkFlavor } from '../framework-flavors.js';

describe('isDepsPerModuleServingEnabled', () => {
	it('is off by default and on for 1/true', () => {
		expect(isDepsPerModuleServingEnabled({} as any)).toBe(false);
		expect(isDepsPerModuleServingEnabled({ NS_DEPS_PER_MODULE: '0' } as any)).toBe(false);
		expect(isDepsPerModuleServingEnabled({ NS_DEPS_PER_MODULE: '1' } as any)).toBe(true);
		expect(isDepsPerModuleServingEnabled({ NS_DEPS_PER_MODULE: 'true' } as any)).toBe(true);
	});
});

describe('depsRegistryKeyForFile', () => {
	it('keys by the substring from the LAST node_modules segment', () => {
		expect(depsRegistryKeyForFile('/proj/node_modules/rxjs/dist/esm/index.js')).toBe('node_modules/rxjs/dist/esm/index.js');
		expect(depsRegistryKeyForFile('/proj/node_modules/a/node_modules/b/index.js')).toBe('node_modules/b/index.js');
		expect(depsRegistryKeyForFile('C:\\proj\\node_modules\\pkg\\index.js')).toBe('node_modules/pkg/index.js');
	});

	it('returns null outside node_modules', () => {
		expect(depsRegistryKeyForFile('/proj/src/app.ts')).toBeNull();
	});
});

describe('buildDepsCandidateSpecs', () => {
	it('fans out extensionless specs to extension and index candidates', () => {
		const specs = buildDepsCandidateSpecs('/node_modules/pkg/util', 'ios');
		expect(specs).toContain('/node_modules/pkg/util.js');
		expect(specs).toContain('/node_modules/pkg/util.ts');
		expect(specs).toContain('/node_modules/pkg/util/index.js');
	});

	it('prefers platform-suffixed variants, matching per-module resolution', () => {
		const ios = buildDepsCandidateSpecs('/node_modules/pkg/canvas', 'ios');
		expect(ios.indexOf('/node_modules/pkg/canvas.ios.js')).toBeLessThan(ios.indexOf('/node_modules/pkg/canvas.js'));
		expect(ios).toContain('/node_modules/pkg/canvas/index.ios.js');
		const android = buildDepsCandidateSpecs('/node_modules/pkg/canvas', 'android');
		expect(android).toContain('/node_modules/pkg/canvas.android.js');
		expect(android).not.toContain('/node_modules/pkg/canvas.ios.js');
	});

	it('tries the exact spec first when it already has an extension', () => {
		const specs = buildDepsCandidateSpecs('/node_modules/pkg/util.mjs', 'ios');
		expect(specs[0]).toBe('/node_modules/pkg/util.mjs');
	});
});

describe('buildDepsBundleEntryCode', () => {
	it('imports every file and registers its namespace under the registry key', () => {
		const code = buildDepsBundleEntryCode([
			{ key: 'node_modules/pkg-a/index.js', absPath: '/proj/node_modules/pkg-a/index.js' },
			{ key: 'node_modules/pkg-b/lib/x.js', absPath: '/proj/node_modules/pkg-b/lib/x.js' },
		]);
		expect(code).toContain(`import * as __ns_dep_0__ from "/proj/node_modules/pkg-a/index.js";`);
		expect(code).toContain(`import * as __ns_dep_1__ from "/proj/node_modules/pkg-b/lib/x.js";`);
		expect(code).toContain('globalThis.__NS_DEPS_MODULES__');
		expect(code).toContain(`__nsDepsReg["node_modules/pkg-a/index.js"] = __ns_dep_0__;`);
		expect(code).toContain(`__nsDepsReg["node_modules/pkg-b/lib/x.js"] = __ns_dep_1__;`);
		expect(code).not.toContain('__nsDepsLazy');
	});

	it('registers lazy files behind a getter instead of importing them', () => {
		const code = buildDepsBundleEntryCode([
			{ key: 'node_modules/pkg-a/index.js', absPath: '/proj/node_modules/pkg-a/index.js' },
			{ key: 'node_modules/pkg-a/esm.js', absPath: '/proj/node_modules/pkg-a/esm.js', lazy: true },
			{ key: 'node_modules/pkg-a/cjs.js', absPath: '/proj/node_modules/pkg-a/cjs.js', lazy: true, cjs: true },
		]);
		expect(code).toContain(`import * as __ns_dep_0__ from "/proj/node_modules/pkg-a/index.js";`);
		expect(code).not.toContain('from "/proj/node_modules/pkg-a/esm.js"');
		expect(code).not.toContain('from "/proj/node_modules/pkg-a/cjs.js"');
		expect(code).toContain(`__nsDepsLazy("node_modules/pkg-a/esm.js", () => require("/proj/node_modules/pkg-a/esm.js"));`);
		expect(code).toContain(`__nsDepsLazy("node_modules/pkg-a/cjs.js", () => __nsDepsCjsNamespace(require("/proj/node_modules/pkg-a/cjs.js")));`);
	});
});

describe('computeDepsBundleCacheKey', () => {
	const base = {
		platform: 'ios',
		mode: 'development',
		flavor: 'angular',
		defines: { __DEV__: 'true' },
		entryKeys: ['node_modules/pkg-a/index.js'],
		lockfile: 'package-lock.json:1:100',
		vitePackageVersion: '1.0.0',
	};

	it('is stable for identical inputs', () => {
		expect(computeDepsBundleCacheKey(base)).toBe(computeDepsBundleCacheKey({ ...base }));
	});

	it('changes when the entry set or lockfile changes', () => {
		const key = computeDepsBundleCacheKey(base);
		expect(computeDepsBundleCacheKey({ ...base, entryKeys: ['node_modules/pkg-b/index.js'] })).not.toBe(key);
		expect(computeDepsBundleCacheKey({ ...base, lockfile: 'package-lock.json:2:100' })).not.toBe(key);
	});
});

// ============================================================================
// Fixture projects shared by the build + service suites. Bundle entries come
// from the vendor collection, i.e. the package.json dependencies.
// ============================================================================

function writeFixturePackages(projectRoot: string): void {
	const write = (rel: string, contents: string) => {
		const abs = path.join(projectRoot, rel);
		mkdirSync(path.dirname(abs), { recursive: true });
		writeFileSync(abs, contents);
	};
	// ESM package with a relative closure, a bare star barrel, and a dynamic import.
	write('node_modules/pkg-a/package.json', JSON.stringify({ name: 'pkg-a', version: '1.0.0', module: 'index.js' }));
	write('node_modules/pkg-a/index.js', `import { helper } from './helper.js';\nexport const A = 'a' + helper;\nexport * from './extra.js';\nexport const load = () => import('./lazy.js');\n`);
	write('node_modules/pkg-a/helper.js', `export const helper = 'h';\n`);
	write('node_modules/pkg-a/extra.js', `export const EXTRA = 1;\n`);
	write('node_modules/pkg-a/lazy.js', `import { LAZY_DEP } from './lazy-dep.js';\nexport const LAZY = LAZY_DEP;\nexport const loadMore = () => import('./lazier.js');\n`);
	write('node_modules/pkg-a/lazy-dep.js', `export const LAZY_DEP = 1;\n`);
	write('node_modules/pkg-a/lazier.js', `export const LAZIER = 2;\n`);
	// A dynamic import whose closure cannot resolve, next to one that can.
	write('node_modules/pkg-k/package.json', JSON.stringify({ name: 'pkg-k', version: '1.0.0', module: 'index.js' }));
	write('node_modules/pkg-k/index.js', `export const K = 'k';\nexport const broken = () => import('./broken.js');\nexport const fine = () => import('./fine.js');\n`);
	write('node_modules/pkg-k/broken.js', `export * from './not-shipped.js';\n`);
	write('node_modules/pkg-k/fine.js', `export const FINE = 1;\n`);
	// CJS package.
	write('node_modules/pkg-b/package.json', JSON.stringify({ name: 'pkg-b', version: '1.0.0', main: 'index.js' }));
	write('node_modules/pkg-b/index.js', `module.exports = { b: 1 };\n`);
	// Package whose root entry is NOT an index file (exercises package.json resolution).
	write('node_modules/pkg-c/package.json', JSON.stringify({ name: 'pkg-c', version: '1.0.0', module: 'dist/entry.mjs' }));
	write('node_modules/pkg-c/dist/entry.mjs', `export const C = 3;\n`);
	// NativeScript-plugin shape with a platform-suffixed bare root import
	// (esbuild's own resolver misses `index.ios.js` roots).
	write('node_modules/nativescript-widgets/package.json', JSON.stringify({ name: 'nativescript-widgets', version: '1.0.0', main: 'index' }));
	write('node_modules/nativescript-widgets/index.ios.js', `export const Widget = 'ios-widget';\n`);
	write('node_modules/nativescript-widgets/index.android.js', `export const Widget = 'android-widget';\n`);
	write('node_modules/pkg-f/package.json', JSON.stringify({ name: 'pkg-f', version: '1.0.0', module: 'index.js' }));
	write('node_modules/pkg-f/index.js', `import { Widget } from 'nativescript-widgets';\nexport const F = Widget;\n`);
	// Deep-entry package imported bare by a sibling (the @ngrx/store shape):
	// the bare import must internalize onto the same bundled file.
	write('node_modules/pkg-g/package.json', JSON.stringify({ name: 'pkg-g', version: '1.0.0', module: 'fesm/pkg-g.mjs' }));
	write('node_modules/pkg-g/fesm/pkg-g.mjs', `export const StoreToken = 'g-store';\n`);
	write('node_modules/pkg-i/package.json', JSON.stringify({ name: 'pkg-i', version: '1.0.0', module: 'index.js' }));
	write('node_modules/pkg-i/index.js', `export const I = 'i';\n`);
	write('node_modules/pkg-h/package.json', JSON.stringify({ name: 'pkg-h', version: '1.0.0', module: 'index.js' }));
	write('node_modules/pkg-h/index.js', `import { StoreToken } from 'pkg-g';\nimport { I } from 'pkg-i';\nexport const H = StoreToken + I;\n`);
	// Dep code reading app-level `__FOO__` defines (Vue feature-flag shape).
	write('node_modules/pkg-flags/package.json', JSON.stringify({ name: 'pkg-flags', version: '1.0.0', module: 'index.js' }));
	write('node_modules/pkg-flags/index.js', `export const optionsApi = typeof __VUE_OPTIONS_API__ === 'boolean' ? __VUE_OPTIONS_API__ : 'unset';\nexport const bad = typeof __BAD_DEFINE__ === 'undefined' ? 'unset' : __BAD_DEFINE__;\n`);
	// A package probing an optional dependency with a guarded require. The dependency throws on
	// evaluation, by design.
	write('node_modules/pkg-guard/package.json', JSON.stringify({ name: 'pkg-guard', version: '1.0.0', module: 'index.js' }));
	write('node_modules/pkg-guard/index.js', `export { helper } from './helper.js';\nexport function probe() {\n  try {\n    return require('pkg-media').Audio;\n  } catch (e) {\n    return 'caught';\n  }\n}\n`);
	write('node_modules/pkg-guard/helper.js', `exports.helper = () => 'helped';\n`);
	write('node_modules/pkg-media/package.json', JSON.stringify({ name: 'pkg-media', version: '1.0.0', module: 'index.js' }));
	write('node_modules/pkg-media/index.js', `export { Audio } from './audio';\n`);
	write('node_modules/pkg-media/audio.js', `throw new Error('pkg-media is not supported here');\n`);
	// Dep code importing dev tooling and core.
	write('node_modules/@nativescript/vite/package.json', JSON.stringify({ name: '@nativescript/vite', version: '1.0.0' }));
	write('node_modules/@nativescript/vite/hmr/shared/runtime/tool.js', `export const tool = 'tool';\n`);
	write('node_modules/@nativescript/core/package.json', JSON.stringify({ name: '@nativescript/core', version: '1.0.0', main: 'index.js' }));
	write('node_modules/@nativescript/core/index.js', `export const Core = 'core';\n`);
	write('node_modules/@nativescript/core/ui/lazy.js', `export const LazyCore = 'lazy-core';\n`);
	write('node_modules/@nativescript/core/http/index.js', `export const Http = 'http';\n`);
	write('node_modules/pkg-tool/package.json', JSON.stringify({ name: 'pkg-tool', version: '1.0.0', module: 'index.js' }));
	write('node_modules/pkg-tool/index.js', `import { tool } from '@nativescript/vite/hmr/shared/runtime/tool.js';\nimport { Core } from '@nativescript/core';\nimport { Http } from '@nativescript/core/http';\nexport const T = tool + Core + Http;\nexport const loadCore = () => import('@nativescript/core/ui/lazy.js');\n`);
}

const fixtureRoots: string[] = [];

function createFixtureProject(dependencies: readonly string[]): string {
	const projectRoot = mkdtempSync(path.join(realpathSync(tmpdir()), 'ns-deps-proj-'));
	fixtureRoots.push(projectRoot);
	writeFileSync(path.join(projectRoot, 'package.json'), JSON.stringify({ name: 'fixture-app', version: '1.0.0', dependencies: Object.fromEntries(dependencies.map((name) => [name, '1.0.0'])) }));
	writeFixturePackages(projectRoot);
	return projectRoot;
}

afterAll(() => {
	for (const root of fixtureRoots) rmSync(root, { recursive: true, force: true });
});

describe('generateDepsBundle', () => {
	const build = (projectRoot: string, flavor = 'typescript') => generateDepsBundle({ projectRoot, platform: 'ios', mode: 'development', flavor });

	it('bundles the vendor-collected closure, registers discovered inputs, and externalizes dynamic imports at their Vite URLs', async () => {
		const state = await build(createFixtureProject(['pkg-a', 'pkg-b', 'pkg-c']));
		expect(state).not.toBeNull();
		expect(state!.keys).toContain('node_modules/pkg-a/index.js');
		expect(state!.keys).toContain('node_modules/pkg-a/helper.js');
		expect(state!.keys).toContain('node_modules/pkg-a/extra.js');
		expect(state!.keys).toContain('node_modules/pkg-b/index.js');
		expect(state!.keys).toContain('node_modules/pkg-c/dist/entry.mjs');
		// Dynamic import targets stay external, but they and their closures
		// (including chained import()s) are registered.
		expect(state!.code).toContain('import("/node_modules/pkg-a/lazy.js")');
		expect(state!.code).toContain('import("/node_modules/pkg-a/lazier.js")');
		expect(state!.keys).toContain('node_modules/pkg-a/lazy.js');
		expect(state!.keys).toContain('node_modules/pkg-a/lazy-dep.js');
		expect(state!.keys).toContain('node_modules/pkg-a/lazier.js');
		expect(state!.code).toContain('__NS_DEPS_MODULES__');
		expect(state!.vendorSpecToKey.get('pkg-c')).toBe('node_modules/pkg-c/dist/entry.mjs');
	});

	it('round-trips through the disk cache on a second build', async () => {
		const projectRoot = createFixtureProject(['pkg-a', 'pkg-b', 'pkg-c']);
		const first = await build(projectRoot);
		const cacheDir = path.join(projectRoot, 'node_modules', '.ns-vite');
		expect(existsSync(cacheDir)).toBe(true);
		expect(readdirSync(cacheDir).some((f) => f.startsWith('deps-bundle-ios-') && f.endsWith('.mjs'))).toBe(true);
		const second = await build(projectRoot);
		expect(second!.hash).toBe(first!.hash);
		expect(second!.code).toBe(first!.code);
		expect(second!.keys).toEqual(first!.keys);
		expect(second!.vendorSpecToKey).toEqual(first!.vendorSpecToKey);
	});

	it('evaluates transitive files on first use, so a guarded require of a throwing module stays guarded', async () => {
		const projectRoot = createFixtureProject(['pkg-guard']);
		const state = await build(projectRoot);
		expect(state).not.toBeNull();
		expect(state!.keys).toContain('node_modules/pkg-media/index.js');
		expect(state!.keys).toContain('node_modules/pkg-media/audio.js');

		// Each copy evaluates as its own module instance: esbuild's CommonJS wrapper remembers a
		// module whose first evaluation threw, so each check needs a fresh one.
		const evaluate = async (name: string) => {
			const file = path.join(projectRoot, `deps-bundle-${name}-${Date.now()}.mjs`);
			writeFileSync(file, state!.code);
			(globalThis as any).__NS_DEPS_MODULES__ = undefined;
			// Evaluating the bundle must not evaluate the throwing file.
			await import(pathToFileURL(file).href);
			return (globalThis as any).__NS_DEPS_MODULES__;
		};
		const previous = (globalThis as any).__NS_DEPS_MODULES__;
		try {
			// The guarded require still sees the throw...
			const guarded = await evaluate('guarded');
			expect(guarded['node_modules/pkg-guard/index.js'].probe()).toBe('caught');
			expect(guarded['node_modules/pkg-guard/helper.js'].helper()).toBe('helped');
			expect(guarded['node_modules/pkg-guard/helper.js'].default.helper()).toBe('helped');
			// ...and a direct read reports it, as importing the module would.
			const registry = await evaluate('direct');
			expect(() => registry['node_modules/pkg-media/audio.js']).toThrow('pkg-media is not supported here');
		} finally {
			(globalThis as any).__NS_DEPS_MODULES__ = previous;
		}
	});

	it('leaves a dynamic import whose closure fails to build out of the registry', async () => {
		const state = await build(createFixtureProject(['pkg-k']));
		expect(state).not.toBeNull();
		expect(state!.keys).toContain('node_modules/pkg-k/index.js');
		expect(state!.keys).toContain('node_modules/pkg-k/fine.js');
		expect(state!.keys).not.toContain('node_modules/pkg-k/broken.js');
		expect(state!.code).toContain('import("/node_modules/pkg-k/broken.js")');
	});

	it('keeps @nativescript/vite and dynamic core imports at their Vite URLs, and static core imports bare', async () => {
		const state = await build(createFixtureProject(['pkg-tool']));
		expect(state).not.toBeNull();
		expect(state!.code).toContain('"/node_modules/@nativescript/vite/hmr/shared/runtime/tool.js"');
		expect(state!.code).toContain('from "@nativescript/core"');
		expect(state!.code).toContain('import("/node_modules/@nativescript/core/ui/lazy.js")');
		expect([...state!.keys].some((key) => key.startsWith('node_modules/@nativescript/'))).toBe(false);
	});

	it('reports the bare core imports of a fresh build and of its disk-cache hit alike', async () => {
		const projectRoot = createFixtureProject(['pkg-tool']);
		const fresh = await build(projectRoot);
		const cached = await build(projectRoot);
		expect(cached).not.toBe(fresh);
		expect(depsBundleCoreSpecifiers(fresh!).sort()).toEqual(['@nativescript/core', '@nativescript/core/http']);
		expect(depsBundleCoreSpecifiers(cached!).sort()).toEqual(['@nativescript/core', '@nativescript/core/http']);
	});

	it('returns null when the project has no bundleable dependencies', async () => {
		expect(await build(createFixtureProject([]))).toBeNull();
	});

	it('internalizes plugin-shaped bare imports with platform-suffixed roots', async () => {
		const state = await build(createFixtureProject(['pkg-f']));
		expect(state).not.toBeNull();
		expect(state!.keys).toContain('node_modules/nativescript-widgets/index.ios.js');
		expect(state!.code).not.toContain('from "nativescript-widgets"');
		expect(state!.code).toContain('ios-widget');
	});

	it('internalizes every resolvable bare import', async () => {
		const state = await build(createFixtureProject(['pkg-h', 'pkg-g']));
		expect(state).not.toBeNull();
		// pkg-g's entry is the same file pkg-h's bare import resolves to: one
		// bundled instance, no bare external.
		expect(state!.keys).toContain('node_modules/pkg-g/fesm/pkg-g.mjs');
		expect(state!.code).not.toContain('from "pkg-g"');
		expect(state!.code).toContain('g-store');
		// pkg-i is not a dependency but is resolvable — discovered and
		// internalized the same way.
		expect(state!.keys).toContain('node_modules/pkg-i/index.js');
		expect(state!.code).not.toContain('from "pkg-i"');
	});

	it('prepends platform polyfills to the payload', async () => {
		const state = await build(createFixtureProject(['pkg-a']));
		expect(state!.code).toContain('platform polyfills');
	});

	it("substitutes the app's __FOO__ defines in bundled dep code, skipping values esbuild cannot define", async () => {
		setUserDefineEntries({ __VUE_OPTIONS_API__: true, __BAD_DEFINE__: 'compute()' });
		try {
			const state = await build(createFixtureProject(['pkg-flags']), 'vue');
			expect(state).not.toBeNull();
			expect(state!.code).not.toContain('__VUE_OPTIONS_API__');
			expect(state!.code).toContain('__BAD_DEFINE__');
		} finally {
			setUserDefineEntries(undefined);
		}
	});
});

// ============================================================================
// Vendor consolidation — seeding entries from the vendor collection and the
// deps-backed vendor module
// ============================================================================

function createVendorSeedFixture(): string {
	const projectRoot = mkdtempSync(path.join(realpathSync(tmpdir()), 'ns-deps-vendorseed-'));
	const write = (rel: string, contents: string) => {
		const abs = path.join(projectRoot, rel);
		mkdirSync(path.dirname(abs), { recursive: true });
		writeFileSync(abs, contents);
	};
	write('package.json', JSON.stringify({ name: 'fixture-app', version: '1.0.0', dependencies: { 'nativescript-widgets': '1.0.0', 'pkg-c': '1.0.0' } }));
	write('node_modules/nativescript-widgets/package.json', JSON.stringify({ name: 'nativescript-widgets', version: '1.0.0', main: 'index' }));
	write('node_modules/nativescript-widgets/index.ios.js', `export const Widget = 'ios-widget';\n`);
	write('node_modules/nativescript-widgets/index.android.js', `export const Widget = 'android-widget';\n`);
	write('node_modules/pkg-c/package.json', JSON.stringify({ name: 'pkg-c', version: '1.0.0', module: 'dist/entry.mjs' }));
	write('node_modules/pkg-c/dist/entry.mjs', `export const C = 3;\n`);
	return projectRoot;
}

describe('depsBundleCoreSpecifiers', () => {
	const stateFor = (code: string) => ({ code, keys: new Set<string>(), vendorSpecToKey: new Map<string, string>(), hash: 'h', builtAt: 0, buildMs: 0 });

	it('lists each bare @nativescript/core import once, static or re-export, and nothing else', () => {
		const state = stateFor([`import { Http } from "@nativescript/core/http";`, `import { Frame } from "@nativescript/core";`, `import { request } from "@nativescript/core/http";`, `export { Color } from "@nativescript/core/color";`, `import { x } from "@nativescript/corelib";`, `import "pkg-external";`, `const lazy = () => import("/node_modules/@nativescript/core/ui/lazy.js");`].join('\n'));
		expect(depsBundleCoreSpecifiers(state)).toEqual(['@nativescript/core/http', '@nativescript/core', '@nativescript/core/color']);
	});

	it('yields no specifiers, with a warning, for code the lexer cannot parse', () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
		expect(depsBundleCoreSpecifiers(stateFor('import { from "@nativescript/core/http"'))).toEqual([]);
		expect(warn).toHaveBeenCalledTimes(1);
		warn.mockRestore();
	});
});

describe('resolveDepsEntriesFromVendorCollection', () => {
	const projectRoot = createVendorSeedFixture();
	afterAll(() => rmSync(projectRoot, { recursive: true, force: true }));

	it('seeds package-root entries from package.json dependencies with platform-aware resolution', () => {
		const seed = resolveDepsEntriesFromVendorCollection(projectRoot, null, 'ios', 'typescript');
		expect(seed.vendorSpecToKey.get('nativescript-widgets')).toBe('node_modules/nativescript-widgets/index.ios.js');
		expect(seed.vendorSpecToKey.get('pkg-c')).toBe('node_modules/pkg-c/dist/entry.mjs');
		const specs = seed.entries.map((e) => e.spec);
		expect(specs).toContain('/node_modules/nativescript-widgets');
		expect(specs).toContain('/node_modules/pkg-c');
	});

	it('resolves platform-suffixed package roots per platform', () => {
		const seed = resolveDepsEntriesFromVendorCollection(projectRoot, null, 'android', 'typescript');
		expect(seed.vendorSpecToKey.get('nativescript-widgets')).toBe('node_modules/nativescript-widgets/index.android.js');
	});

	it('leaves a package root the registered flavor excludes out of the seed and the vendor specifier map', () => {
		registerFrameworkFlavor({ flavor: 'seed-fixture', vendor: { exclude: ['pkg-c'] } });
		const seed = resolveDepsEntriesFromVendorCollection(projectRoot, null, 'ios', 'seed-fixture');
		expect(seed.vendorSpecToKey.has('pkg-c')).toBe(false);
		expect(seed.entries.map((e) => e.spec)).toEqual(['/node_modules/nativescript-widgets']);
	});

	it('prefers the declared package entry over a stray root index source (solid-navigation shape)', () => {
		const root = mkdtempSync(path.join(realpathSync(tmpdir()), 'ns-deps-stray-index-'));
		try {
			const write = (rel: string, contents: string) => {
				mkdirSync(path.dirname(path.join(root, rel)), { recursive: true });
				writeFileSync(path.join(root, rel), contents);
			};
			write('package.json', JSON.stringify({ name: 'fixture-app', version: '1.0.0', dependencies: { 'pkg-j': '1.0.0' } }));
			write('node_modules/pkg-j/package.json', JSON.stringify({ name: 'pkg-j', version: '1.0.0', main: 'dist/index.js' }));
			write('node_modules/pkg-j/index.ts', `export * from './src/not-shipped';\n`);
			write('node_modules/pkg-j/dist/index.js', `export const J = 'j-dist';\n`);
			const seed = resolveDepsEntriesFromVendorCollection(root, null, 'ios', 'typescript');
			expect(seed.entries.map((e) => e.key)).toEqual(['node_modules/pkg-j/dist/index.js']);
		} finally {
			rmSync(root, { recursive: true, force: true });
		}
	});

	it('returns an empty seed when the project has no collectable dependencies', () => {
		const emptyRoot = mkdtempSync(path.join(realpathSync(tmpdir()), 'ns-deps-empty-'));
		writeFileSync(path.join(emptyRoot, 'package.json'), JSON.stringify({ name: 'empty', version: '1.0.0' }));
		const seed = resolveDepsEntriesFromVendorCollection(emptyRoot, null, 'ios', 'typescript');
		expect(seed.entries).toEqual([]);
		expect(seed.vendorSpecToKey.size).toBe(0);
		rmSync(emptyRoot, { recursive: true, force: true });
	});
});

describe('buildDepsVendorRuntimeModule', () => {
	const vendorSpecToKey = new Map([
		['pkg-c', 'node_modules/pkg-c/dist/entry.mjs'],
		['pkg-d/index', 'node_modules/pkg-d/index.ios.js'],
	]);

	it('imports the deps bundle and maps vendor specifiers to registry namespaces', () => {
		const code = buildDepsVendorRuntimeModule(vendorSpecToKey, { modules: {}, aliases: {} });
		expect(code).toContain(`import "${DEPS_BUNDLE_PATH}";`);
		expect(code).toContain('globalThis.__NS_DEPS_MODULES__');
		expect(code).toContain(`"pkg-c": __nsDepsReg["node_modules/pkg-c/dist/entry.mjs"]`);
		expect(code).toContain('export const __nsVendorModuleMap');
		expect(code).toContain('export const vendorManifest');
		expect(code).toContain('export default vendorManifest;');
	});

	it('adds manifest-canonical aliases so wrapper lookups hit either form', () => {
		const code = buildDepsVendorRuntimeModule(vendorSpecToKey, { modules: {}, aliases: { 'pkg-d/index': 'pkg-d' } });
		expect(code).toContain(`"pkg-d/index": __nsDepsReg["node_modules/pkg-d/index.ios.js"]`);
		expect(code).toContain(`"pkg-d": __nsDepsReg["node_modules/pkg-d/index.ios.js"]`);
	});

	it('maps @nativescript/core through a bare import when the manifest lists it', () => {
		const withCore = buildDepsVendorRuntimeModule(vendorSpecToKey, { modules: { '@nativescript/core': { id: '@nativescript/core', exports: {} } }, aliases: {} });
		expect(withCore).toContain(`import * as __ns_core__ from "@nativescript/core";`);
		expect(withCore).toContain(`"@nativescript/core": __ns_core__,`);
		const withoutCore = buildDepsVendorRuntimeModule(vendorSpecToKey, { modules: {}, aliases: {} });
		expect(withoutCore).not.toContain('__ns_core__');
	});

	it('embeds the manifest payload for installVendorBootstrap', () => {
		const manifest = { modules: {}, aliases: {}, hash: 'abc123' };
		const code = buildDepsVendorRuntimeModule(vendorSpecToKey, manifest as any);
		expect(code).toContain('"hash":"abc123"');
	});
});

describe('createDepsBundleService', () => {
	it('returns null from ensureBuilt when there is nothing to vendor-seed', async () => {
		const service = createDepsBundleService({ projectRoot: createFixtureProject([]), platform: 'ios', mode: 'development', flavor: 'typescript' });
		expect(await service.ensureBuilt()).toBeNull();
		expect(service.getState()).toBeNull();
		expect(service.hasFailed()).toBe(false);
	});

	it('builds from the vendor collection', async () => {
		const seedRoot = createVendorSeedFixture();
		try {
			const service = createDepsBundleService({ projectRoot: seedRoot, platform: 'ios', mode: 'development', flavor: 'typescript' });
			const state = await service.ensureBuilt();
			expect(state).not.toBeNull();
			expect(state!.keys).toContain('node_modules/nativescript-widgets/index.ios.js');
			expect(state!.keys).toContain('node_modules/pkg-c/dist/entry.mjs');
			expect(state!.vendorSpecToKey.get('nativescript-widgets')).toBe('node_modules/nativescript-widgets/index.ios.js');
		} finally {
			rmSync(seedRoot, { recursive: true, force: true });
		}
	});

	it('pins Solid runtime packages to their dev builds for bare imports and collected roots', async () => {
		const root = mkdtempSync(path.join(realpathSync(tmpdir()), 'ns-deps-solid-'));
		const write = (rel: string, contents: string) => {
			const abs = path.join(root, rel);
			mkdirSync(path.dirname(abs), { recursive: true });
			writeFileSync(abs, contents);
		};
		try {
			write('package.json', JSON.stringify({ name: 'fixture-app', version: '1.0.0', dependencies: { 'solid-js': '2.0.0', '@solidjs/signals': '2.0.0', 'solid-ui': '1.0.0' } }));
			write('node_modules/solid-js/package.json', JSON.stringify({ name: 'solid-js', version: '2.0.0', exports: { '.': { browser: { development: { default: './dist/solid.dev.js' }, default: './dist/solid.js' }, development: { default: './dist/solid.dev.js' }, default: './dist/solid.js' } } }));
			write('node_modules/solid-js/dist/solid.dev.js', `import { DEV } from '@solidjs/signals';\nexport const guideUrl = DEV.guideUrl;\n`);
			write('node_modules/solid-js/dist/solid.js', `import { DEV } from '@solidjs/signals';\nexport const guideUrl = DEV;\n`);
			write('node_modules/@solidjs/signals/package.json', JSON.stringify({ name: '@solidjs/signals', version: '2.0.0', exports: { '.': { development: './dist/dev.js', default: './dist/prod/index.js' } } }));
			write('node_modules/@solidjs/signals/dist/dev.js', `export const DEV = { guideUrl: () => '' };\n`);
			write('node_modules/@solidjs/signals/dist/prod/index.js', `export const DEV = undefined;\n`);
			write('node_modules/solid-ui/package.json', JSON.stringify({ name: 'solid-ui', version: '1.0.0', module: 'index.js' }));
			write('node_modules/solid-ui/index.js', `import { guideUrl } from 'solid-js';\nexport const ui = guideUrl;\n`);
			const service = createDepsBundleService({ projectRoot: root, platform: 'ios', mode: 'development', flavor: 'solid' });
			const state = await service.ensureBuilt();
			expect(state!.keys).toContain('node_modules/solid-js/dist/solid.dev.js');
			expect(state!.keys).toContain('node_modules/@solidjs/signals/dist/dev.js');
			expect(state!.keys).not.toContain('node_modules/solid-js/dist/solid.js');
			expect(state!.keys).not.toContain('node_modules/@solidjs/signals/dist/prod/index.js');
			expect(state!.vendorSpecToKey.get('@solidjs/signals')).toBe('node_modules/@solidjs/signals/dist/dev.js');
		} finally {
			rmSync(root, { recursive: true, force: true });
		}
	});

	it('keeps the payload after disableServingForSession', async () => {
		const service = createDepsBundleService({ projectRoot: createFixtureProject(['pkg-a']), platform: 'ios', mode: 'development', flavor: 'typescript' });
		await service.ensureBuilt();
		expect(service.isServingDisabled()).toBe(false);
		service.disableServingForSession('package.json changed');
		expect(service.isServingDisabled()).toBe(true);
		expect(service.getState()).not.toBeNull();
	});
});
