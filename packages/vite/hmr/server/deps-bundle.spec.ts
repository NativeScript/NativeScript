import { existsSync, mkdirSync, mkdtempSync, readdirSync, realpathSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import * as path from 'node:path';
import { afterAll, afterEach, beforeEach, describe, expect, it } from 'vitest';

import { DEPS_BUNDLE_PATH, buildDepsBundleEntryCode, buildDepsCandidateSpecs, buildDepsShimCode, collectDepsModuleExportInfo, computeDepsBundleCacheKey, createDepsBundleService, depsRegistryKeyForFile, generateDepsBundle, isDepsPerModuleServingEnabled, resolveDepsEntriesFromRecording } from './deps-bundle.js';
import { clearVendorManifest, registerVendorManifest } from '../shared/vendor/registry.js';

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
		vendorManifestHash: 'abc',
		vitePackageVersion: '1.0.0',
	};

	it('is stable for identical inputs', () => {
		expect(computeDepsBundleCacheKey(base)).toBe(computeDepsBundleCacheKey({ ...base }));
	});

	it('changes when the entry set, lockfile, or vendor manifest changes', () => {
		const key = computeDepsBundleCacheKey(base);
		expect(computeDepsBundleCacheKey({ ...base, entryKeys: ['node_modules/pkg-b/index.js'] })).not.toBe(key);
		expect(computeDepsBundleCacheKey({ ...base, lockfile: 'package-lock.json:2:100' })).not.toBe(key);
		expect(computeDepsBundleCacheKey({ ...base, vendorManifestHash: 'def' })).not.toBe(key);
	});
});

describe('collectDepsModuleExportInfo', () => {
	const fixtureRoot = mkdtempSync(path.join(realpathSync(tmpdir()), 'ns-deps-exports-'));
	afterAll(() => rmSync(fixtureRoot, { recursive: true, force: true }));

	const write = (rel: string, contents: string): string => {
		const abs = path.join(fixtureRoot, rel);
		mkdirSync(path.dirname(abs), { recursive: true });
		writeFileSync(abs, contents);
		return abs;
	};

	it('collects direct, braced, and star-as export names', () => {
		const abs = write('direct.js', `export const a = 1;\nexport function b() {}\nconst c = 2;\nexport { c, c as d };\nexport * as ns from './direct-child.js';\n`);
		write('direct-child.js', `export const child = 1;\n`);
		const info = collectDepsModuleExportInfo(abs, 'ios');
		expect(info.names).toEqual(['a', 'b', 'c', 'd', 'ns']);
		expect(info.hasDefault).toBe(false);
	});

	it('recurses through relative export * chains and detects default exports', () => {
		write('barrel/leaf.js', `export const leafA = 1;\nexport const leafB = 2;\n`);
		const abs = write('barrel/index.js', `export * from './leaf.js';\nexport default function main() {}\n`);
		const info = collectDepsModuleExportInfo(abs, 'ios');
		expect(info.names).toEqual(['leafA', 'leafB']);
		expect(info.hasDefault).toBe(true);
	});

	it('resolves export * targets through platform-suffixed files (canvas → canvas.ios.js)', () => {
		write('plat/canvas.ios.js', `export const Canvas = 1;\n`);
		write('plat/canvas.android.js', `export const AndroidCanvas = 1;\n`);
		const abs = write('plat/index.ios.js', `export * from './canvas';\nexport const own = 1;\n`);
		expect(collectDepsModuleExportInfo(abs, 'ios').names).toEqual(['Canvas', 'own']);
		expect(collectDepsModuleExportInfo(abs, 'android', new Set()).names).toEqual(['AndroidCanvas', 'own']);
	});

	it('bails to null for bare export * (name set lives in another package)', () => {
		const abs = write('bare-star.js', `export * from 'other-pkg';\nexport const own = 1;\n`);
		expect(collectDepsModuleExportInfo(abs, 'ios').names).toBeNull();
	});

	it('bails to null for unresolvable relative export * targets', () => {
		const abs = write('broken-star.js', `export * from './does-not-exist.js';\n`);
		expect(collectDepsModuleExportInfo(abs, 'ios').names).toBeNull();
	});

	it('keeps Unicode identifier exports (Angular ɵɵ API surface)', () => {
		const abs = write('ng-core.mjs', `const \u0275\u0275defineInjectable = () => {};\nclass \u0275ChangeDetectionScheduler {}\nconst Injectable = () => {};\nexport { Injectable, \u0275\u0275defineInjectable, \u0275ChangeDetectionScheduler };\n`);
		const info = collectDepsModuleExportInfo(abs, 'ios');
		expect(info.names).toEqual(['Injectable', '\u0275ChangeDetectionScheduler', '\u0275\u0275defineInjectable']);
	});

	it('scans exports.NAME assignments for transpiled CJS files', () => {
		const abs = write('cjs-named.js', `'use strict';\nObject.defineProperty(exports, '__esModule', { value: true });\nconst LTTB = 1;\nexports.LTTB = LTTB;\nexports.createLTTB = () => LTTB;\n`);
		const info = collectDepsModuleExportInfo(abs, 'ios');
		expect(info.names).toEqual(['LTTB', 'createLTTB']);
		expect(info.hasDefault).toBe(false);
	});

	it('returns null for UMD factories with no static export names', () => {
		const abs = write('umd.js', `!function(e,t){"object"==typeof exports?module.exports=t():e.lib=t()}(this,function(){return {}});\n`);
		expect(collectDepsModuleExportInfo(abs, 'ios').names).toBeNull();
	});
});

describe('buildDepsShimCode', () => {
	it('imports the bundle, re-exports names from the registry, and keeps the self-namespace default', () => {
		const code = buildDepsShimCode('node_modules/pkg-a/index.js', ['alpha', 'beta'], false);
		expect(code).toContain(`import "${DEPS_BUNDLE_PATH}";`);
		expect(code).toContain('globalThis.__NS_DEPS_MODULES__');
		expect(code).toContain('export const alpha = ');
		expect(code).toContain('export const beta = ');
		expect(code).toContain('export default __ns_dep_ns__;');
	});

	it('re-exports the module default when the module has its own', () => {
		const code = buildDepsShimCode('node_modules/pkg-a/index.js', [], true);
		expect(code).toContain('export default __ns_dep_ns__.default;');
	});

	it('filters reserved words and non-identifier names but keeps Unicode identifiers', () => {
		const code = buildDepsShimCode('node_modules/pkg-a/index.js', ['ok', 'default', 'class', 'not-an-ident', '\u0275\u0275defineInjectable'], false);
		expect(code).toContain('export const ok = ');
		expect(code).toContain('export const \u0275\u0275defineInjectable = ');
		expect(code).not.toContain('export const default');
		expect(code).not.toContain('export const class');
		expect(code).not.toContain('not-an-ident');
	});
});

// ============================================================================
// Fixture project shared by the recording-resolution + build + service suites
// ============================================================================

function createFixtureProject(): string {
	const projectRoot = mkdtempSync(path.join(realpathSync(tmpdir()), 'ns-deps-proj-'));
	const write = (rel: string, contents: string) => {
		const abs = path.join(projectRoot, rel);
		mkdirSync(path.dirname(abs), { recursive: true });
		writeFileSync(abs, contents);
	};
	write('package.json', JSON.stringify({ name: 'fixture-app', version: '1.0.0' }));
	// ESM package with a relative closure, a bare star barrel, and a dynamic import.
	write('node_modules/pkg-a/package.json', JSON.stringify({ name: 'pkg-a', version: '1.0.0', module: 'index.js' }));
	write('node_modules/pkg-a/index.js', `import { helper } from './helper.js';\nexport const A = 'a' + helper;\nexport * from './extra.js';\nexport const load = () => import('./lazy.js');\n`);
	write('node_modules/pkg-a/helper.js', `export const helper = 'h';\n`);
	write('node_modules/pkg-a/extra.js', `export const EXTRA = 1;\n`);
	write('node_modules/pkg-a/lazy.js', `export const LAZY = 1;\n`);
	// CJS package: bundleable, but not shim-servable (no static ESM exports).
	write('node_modules/pkg-b/package.json', JSON.stringify({ name: 'pkg-b', version: '1.0.0', main: 'index.js' }));
	write('node_modules/pkg-b/index.js', `module.exports = { b: 1 };\n`);
	// Package whose root entry is NOT an index file (exercises package.json resolution).
	write('node_modules/pkg-c/package.json', JSON.stringify({ name: 'pkg-c', version: '1.0.0', module: 'dist/entry.mjs' }));
	write('node_modules/pkg-c/dist/entry.mjs', `export const C = 3;\n`);
	// NativeScript-plugin shape: platform-suffixed entry + platform export * chain.
	write('node_modules/pkg-d/package.json', JSON.stringify({ name: 'pkg-d', version: '1.0.0', main: 'index' }));
	write('node_modules/pkg-d/index.ios.js', `export * from './impl';\nexport const D = 4;\n`);
	write('node_modules/pkg-d/index.android.js', `export * from './impl';\nexport const D = 4;\n`);
	write('node_modules/pkg-d/impl.ios.js', `export const Impl = 'ios';\n`);
	write('node_modules/pkg-d/impl.android.js', `export const Impl = 'android';\n`);
	// Transpiled CJS with static exports.NAME assignments.
	write('node_modules/pkg-e/package.json', JSON.stringify({ name: 'pkg-e', version: '1.0.0', main: 'index.js' }));
	write('node_modules/pkg-e/index.js', `'use strict';\nObject.defineProperty(exports, '__esModule', { value: true });\nexports.eOne = 1;\nexports.eTwo = 2;\n`);
	// NativeScript-plugin-shaped transitive dep NOT in any vendor manifest:
	// `resolveVendorRouting` answers 'vendor' for its bare root import, but the
	// bundle must internalize it (single-ownership rule) — an external bare
	// would resolve on-device to this bundle's own shim and cycle.
	write('node_modules/nativescript-widgets/package.json', JSON.stringify({ name: 'nativescript-widgets', version: '1.0.0', main: 'index' }));
	write('node_modules/nativescript-widgets/index.ios.js', `export const Widget = 'ios-widget';\n`);
	write('node_modules/nativescript-widgets/index.android.js', `export const Widget = 'android-widget';\n`);
	write('node_modules/pkg-f/package.json', JSON.stringify({ name: 'pkg-f', version: '1.0.0', module: 'index.js' }));
	write('node_modules/pkg-f/index.js', `import { Widget } from 'nativescript-widgets';\nexport const F = Widget;\n`);
	// Vendor-manifest member whose deep file is ALSO recorded (the @ngrx/store
	// shape): bundle membership must win over vendor externalization.
	write('node_modules/pkg-g/package.json', JSON.stringify({ name: 'pkg-g', version: '1.0.0', module: 'fesm/pkg-g.mjs' }));
	write('node_modules/pkg-g/fesm/pkg-g.mjs', `export const StoreToken = 'g-store';\n`);
	// Vendor-manifest member NOT recorded: stays external bare (vendor realm).
	write('node_modules/pkg-i/package.json', JSON.stringify({ name: 'pkg-i', version: '1.0.0', module: 'index.js' }));
	write('node_modules/pkg-i/index.js', `export const I = 'i';\n`);
	write('node_modules/pkg-h/package.json', JSON.stringify({ name: 'pkg-h', version: '1.0.0', module: 'index.js' }));
	write('node_modules/pkg-h/index.js', `import { StoreToken } from 'pkg-g';\nimport { I } from 'pkg-i';\nexport const H = StoreToken + I;\n`);
	return projectRoot;
}

const recordedPaths = [
	'/ns/m/node_modules/pkg-a/index.js',
	'/ns/m/node_modules/pkg-a/index.js?t=1234', // volatile duplicate
	'/ns/m/node_modules/pkg-b/index.js',
	'/ns/m/node_modules/pkg-c', // package root
	'/ns/m/node_modules/pkg-d', // platform-suffixed package root
	'/ns/m/node_modules/pkg-d/impl', // extensionless platform-suffixed file
	'/ns/m/node_modules/pkg-e/index.js', // transpiled CJS
	'/ns/m/node_modules/@nativescript/core/ui/frame', // owned by /ns/core bridge
	'/ns/m/node_modules/@nativescript/vite/hmr/client', // never-bundled dev tooling
	'/ns/m/node_modules/pkg-a/styles.css', // non-script asset
	'/ns/m/src/app/app.component', // app code
];

describe('resolveDepsEntriesFromRecording', () => {
	const projectRoot = createFixtureProject();
	afterAll(() => rmSync(projectRoot, { recursive: true, force: true }));

	it('maps recorded node_modules paths to deduped entries and skips core/blocked/assets/app code', () => {
		const entries = resolveDepsEntriesFromRecording(recordedPaths, projectRoot, null, 'ios');
		const keys = entries.map((e) => e.key);
		expect(keys).toEqual(['node_modules/pkg-a/index.js', 'node_modules/pkg-b/index.js', 'node_modules/pkg-c/dist/entry.mjs', 'node_modules/pkg-d/index.ios.js', 'node_modules/pkg-d/impl.ios.js', 'node_modules/pkg-e/index.js']);
		const rootEntry = entries.find((e) => e.spec === '/node_modules/pkg-c');
		expect(rootEntry?.absPath).toBe(path.join(projectRoot, 'node_modules/pkg-c/dist/entry.mjs'));
	});

	it('resolves platform-suffixed files per platform', () => {
		const entries = resolveDepsEntriesFromRecording(['/ns/m/node_modules/pkg-d/impl'], projectRoot, null, 'android');
		expect(entries.map((e) => e.key)).toEqual(['node_modules/pkg-d/impl.android.js']);
	});
});

describe('generateDepsBundle', () => {
	const projectRoot = createFixtureProject();
	afterAll(() => rmSync(projectRoot, { recursive: true, force: true }));

	it('bundles the recorded closure, registers discovered inputs, and externalizes core + dynamic imports', async () => {
		const state = await generateDepsBundle({ projectRoot, platform: 'ios', mode: 'development', flavor: 'typescript', recordedPaths });
		expect(state).not.toBeNull();
		// Recorded entries + pass-1 discovered static closure are all registered.
		expect(state!.keys).toContain('node_modules/pkg-a/index.js');
		expect(state!.keys).toContain('node_modules/pkg-a/helper.js');
		expect(state!.keys).toContain('node_modules/pkg-a/extra.js');
		expect(state!.keys).toContain('node_modules/pkg-b/index.js');
		expect(state!.keys).toContain('node_modules/pkg-c/dist/entry.mjs');
		// Dynamic import target stays external at its canonical /ns/m URL.
		expect(state!.keys).not.toContain('node_modules/pkg-a/lazy.js');
		expect(state!.code).toContain('"/ns/m/node_modules/pkg-a/lazy"');
		expect(state!.code).toContain('__NS_DEPS_MODULES__');
		expect(state!.specToKey.get('/node_modules/pkg-c')).toBe('node_modules/pkg-c/dist/entry.mjs');
	});

	it('round-trips through the disk cache on a second build', async () => {
		const first = await generateDepsBundle({ projectRoot, platform: 'ios', mode: 'development', flavor: 'typescript', recordedPaths });
		const cacheDir = path.join(projectRoot, 'node_modules', '.ns-vite');
		expect(existsSync(cacheDir)).toBe(true);
		expect(readdirSync(cacheDir).some((f) => f.startsWith('deps-bundle-ios-') && f.endsWith('.mjs'))).toBe(true);
		const second = await generateDepsBundle({ projectRoot, platform: 'ios', mode: 'development', flavor: 'typescript', recordedPaths });
		expect(second!.hash).toBe(first!.hash);
		expect(second!.code).toBe(first!.code);
		expect(second!.keys).toEqual(first!.keys);
	});

	it('returns null when the recording has no bundleable node_modules entries', async () => {
		const state = await generateDepsBundle({ projectRoot, platform: 'ios', mode: 'development', flavor: 'typescript', recordedPaths: ['/ns/m/src/app'] });
		expect(state).toBeNull();
	});

	it('internalizes plugin-shaped bare imports that are not in the vendor manifest (single-ownership rule)', async () => {
		const state = await generateDepsBundle({ projectRoot, platform: 'ios', mode: 'development', flavor: 'typescript', recordedPaths: ['/ns/m/node_modules/pkg-f/index.js'] });
		expect(state).not.toBeNull();
		// The platform-suffixed dep resolves and registers inside the bundle...
		expect(state!.keys).toContain('node_modules/nativescript-widgets/index.ios.js');
		// ...and no bare external for it survives in the output — a bare import
		// would resolve on-device to this bundle's own shim and cycle.
		expect(state!.code).not.toContain('from "nativescript-widgets"');
		expect(state!.code).toContain('ios-widget');
	});

	describe('with a vendor manifest registered', () => {
		beforeEach(() => {
			registerVendorManifest({
				version: 1,
				createdAt: new Date().toISOString(),
				hash: 'test-hash',
				modules: { 'pkg-g': { id: 'pkg-g', exports: { '*': true } }, 'pkg-i': { id: 'pkg-i', exports: { '*': true } } },
				aliases: {},
			} as any);
		});
		afterEach(() => clearVendorManifest());

		it('bundle membership wins over vendor externalization; non-members stay vendor-external', async () => {
			const state = await generateDepsBundle({
				projectRoot,
				platform: 'ios',
				mode: 'development',
				flavor: 'typescript',
				recordedPaths: ['/ns/m/node_modules/pkg-h/index.js', '/ns/m/node_modules/pkg-g/fesm/pkg-g.mjs'],
			});
			expect(state).not.toBeNull();
			// pkg-g's recorded fesm is a bundle member: its bare import from pkg-h
			// internalizes (a vendor external would evaluate a second realm).
			expect(state!.keys).toContain('node_modules/pkg-g/fesm/pkg-g.mjs');
			expect(state!.code).not.toContain('from "pkg-g"');
			expect(state!.code).toContain('g-store');
			// pkg-i is vendored and NOT a bundle member: stays external bare.
			expect(state!.keys).not.toContain('node_modules/pkg-i/index.js');
			expect(state!.code).toContain('from "pkg-i"');
		});
	});
});

describe('createDepsBundleService', () => {
	const projectRoot = createFixtureProject();
	afterAll(() => rmSync(projectRoot, { recursive: true, force: true }));

	const makeService = (paths: readonly string[] | null = recordedPaths) =>
		createDepsBundleService({
			projectRoot,
			platform: 'ios',
			mode: 'development',
			flavor: 'typescript',
			getRecordedPaths: () => paths,
		});

	it('serves shims for bundled ESM specs, including extensionless and discovered-file forms', async () => {
		const service = makeService();
		expect(service.getShimForSpec('/node_modules/pkg-a/index.js')).toBeNull(); // not built yet
		await service.ensureBuilt();
		const shim = service.getShimForSpec('/node_modules/pkg-a/index.js');
		expect(shim).toContain(`import "${DEPS_BUNDLE_PATH}";`);
		expect(shim).toContain('export const A = ');
		expect(shim).toContain('export const EXTRA = ');
		// Extensionless spec resolves to the same bundled file.
		expect(service.getShimForSpec('/node_modules/pkg-a/index')).toContain('export const A = ');
		// Discovered (non-recorded) closure file is also shim-servable.
		expect(service.getShimForSpec('/node_modules/pkg-a/helper.js')).toContain('export const helper = ');
	});

	it('serves shims for platform-suffixed packages and transpiled CJS', async () => {
		const service = makeService();
		await service.ensureBuilt();
		// Package root resolving through index.ios.js, with export * through impl.ios.js.
		const rootShim = service.getShimForSpec('/node_modules/pkg-d');
		expect(rootShim).toContain('export const D = ');
		expect(rootShim).toContain('export const Impl = ');
		// Extensionless platform-suffixed file.
		expect(service.getShimForSpec('/node_modules/pkg-d/impl')).toContain('export const Impl = ');
		// CJS with static exports.NAME assignments.
		const cjsShim = service.getShimForSpec('/node_modules/pkg-e/index.js');
		expect(cjsShim).toContain('export const eOne = ');
		expect(cjsShim).toContain('export const eTwo = ');
	});

	it('falls through to per-module serving for CJS, unbundled, and non-node_modules specs', async () => {
		const service = makeService();
		await service.ensureBuilt();
		expect(service.getShimForSpec('/node_modules/pkg-b/index.js')).toBeNull();
		expect(service.getShimForSpec('/node_modules/unknown-pkg/index.js')).toBeNull();
		expect(service.getShimForSpec('/src/app.ts')).toBeNull();
	});

	it('returns null from ensureBuilt when no recording exists', async () => {
		const service = makeService(null);
		expect(await service.ensureBuilt()).toBeNull();
		expect(service.getState()).toBeNull();
		expect(service.hasFailed()).toBe(false);
	});

	it('stops handing out new shims after disableServingForSession but keeps the payload servable', async () => {
		const service = makeService();
		await service.ensureBuilt();
		expect(service.getShimForSpec('/node_modules/pkg-a/index.js')).not.toBeNull();
		service.disableServingForSession('package.json changed');
		expect(service.getShimForSpec('/node_modules/pkg-a/index.js')).toBeNull();
		expect(service.getState()).not.toBeNull();
	});
});
