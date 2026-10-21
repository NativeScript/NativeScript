import { mkdtempSync, mkdirSync, rmSync, symlinkSync, writeFileSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { afterEach, describe, expect, it } from 'vitest';

import { createVendorBundleRuntimeModule } from './manifest.js';
import { collectVendorModules } from './manifest-collect.js';
import { registerFrameworkFlavor } from '../../framework-flavors.js';
import { typescriptServerStrategy } from '../../frameworks/typescript/server/strategy.js';

describe('collectVendorModules', () => {
	const tempRoots: string[] = [];

	afterEach(() => {
		while (tempRoots.length) {
			const root = tempRoots.pop();
			if (root) {
				rmSync(root, { recursive: true, force: true });
			}
		}
	});

	it('includes stacktrace-js when the package resolves in the project', () => {
		const root = mkdtempSync(join(tmpdir(), 'ns-vendor-manifest-'));
		tempRoots.push(root);

		mkdirSync(join(root, 'node_modules', 'stacktrace-js'), { recursive: true });
		writeFileSync(join(root, 'package.json'), JSON.stringify({ name: 'fixture-app', version: '0.0.0', dependencies: {} }, null, 2));
		writeFileSync(join(root, 'node_modules', 'stacktrace-js', 'package.json'), JSON.stringify({ name: 'stacktrace-js', version: '1.0.0' }, null, 2));

		const collected = collectVendorModules(root, 'ios', 'angular');

		expect(collected.entries).toContain('stacktrace-js');
	});

	it('skips stacktrace-js when the package is not installed', () => {
		const root = mkdtempSync(join(tmpdir(), 'ns-vendor-manifest-'));
		tempRoots.push(root);

		writeFileSync(join(root, 'package.json'), JSON.stringify({ name: 'fixture-app', version: '0.0.0', dependencies: {} }, null, 2));

		const collected = collectVendorModules(root, 'ios', 'angular');

		expect(collected.entries).not.toContain('stacktrace-js');
	});

	it('excludes Angular framework packages so they resolve only through HTTP', () => {
		const root = mkdtempSync(join(tmpdir(), 'ns-vendor-manifest-'));
		tempRoots.push(root);

		writeFileSync(
			join(root, 'package.json'),
			JSON.stringify(
				{
					name: 'fixture-app',
					version: '0.0.0',
					dependencies: {
						'@nativescript/angular': '*',
						'@angular/core': '*',
						'@angular/common': '*',
						'@angular/compiler': '*',
						'@angular/forms': '*',
						'@angular/router': '*',
						'@angular/platform-browser': '*',
					},
				},
				null,
				2,
			),
		);

		for (const name of ['@nativescript/angular', '@angular/core', '@angular/common', '@angular/compiler', '@angular/forms', '@angular/router', '@angular/platform-browser']) {
			mkdirSync(join(root, 'node_modules', ...name.split('/')), { recursive: true });
			writeFileSync(join(root, 'node_modules', ...name.split('/'), 'package.json'), JSON.stringify({ name, version: '1.0.0' }, null, 2));
		}

		const collected = collectVendorModules(root, 'ios', 'angular');

		for (const name of ['@nativescript/angular', '@angular/core', '@angular/common', '@angular/compiler', '@angular/forms', '@angular/router', '@angular/platform-browser']) {
			expect(collected.entries).not.toContain(name);
		}
	});

	it('keeps `solid-js` OUT of the vendor manifest for the Solid flavor so it resolves through HTTP', () => {
		// Regression for the boot-time
		//   `computations created outside a createRoot or render`
		// warning + the silent-HMR symptom (toast fires, screen never
		// updates). Both stem from solid-refresh's HTTP-served imports
		// of `solid-js` resolving to a DIFFERENT module realm than the
		// vendor bundle's transitively-resolved `solid-js` (pulled in
		// via `@nativescript-community/solid-js`'s peerDeps). Two solid-js
		// realms → two `Owner` module-locals → solid-refresh's HMRComp
		// memo and the live page tree's render effect can't talk.
		//
		// The matching pieces are:
		//   - `nsSolidJsExternalPlugin` in `manifest.ts` marks `solid-js`
		//     external in the esbuild step, so vendor.mjs's
		//     `import 'solid-js'` survives as a literal bare specifier.
		//   - `addFrameworkEntries` in `import-map.ts` pins
		//     `imports['solid-js']` to the same `/ns/m/node_modules/.../dev.js`
		//     URL Vite's alias produces for user code. V8 dedupes the
		//     two import sites by URL.
		//   - This test pins the third leg: `solid-js` must NOT
		//     appear in the vendor manifest's `modules` map for the
		//     Solid flavor. If it did, the import-map generator's
		//     vendor-module loop would set `imports['solid-js']` to the
		//     package ROOT URL and overwrite the dev.js pin; the
		//     duplicate-realm regression returns wholesale.
		const root = mkdtempSync(join(tmpdir(), 'ns-vendor-manifest-'));
		tempRoots.push(root);

		writeFileSync(
			join(root, 'package.json'),
			JSON.stringify(
				{
					name: 'fixture-app',
					version: '0.0.0',
					dependencies: {
						'@nativescript-community/solid-js': '*',
						'solid-js': '*',
						'solid-navigation': '*',
					},
				},
				null,
				2,
			),
		);

		// `@nativescript-community/solid-js` declares `solid-js` as a peerDep —
		// that's the path through which the vendor candidate walker would
		// normally pull `solid-js` into the bundle (see the `peerDependencies`
		// loop in `collectVendorModules`). With the Solid-flavor skip in
		// `addCandidate`, that pull is suppressed.
		mkdirSync(join(root, 'node_modules', '@nativescript-community', 'solid-js'), { recursive: true });
		writeFileSync(join(root, 'node_modules', '@nativescript-community', 'solid-js', 'package.json'), JSON.stringify({ name: '@nativescript-community/solid-js', version: '0.1.2', peerDependencies: { 'solid-js': '^1.8.0' } }, null, 2));
		writeFileSync(join(root, 'node_modules', '@nativescript-community', 'solid-js', 'index.js'), 'module.exports = {};\n');
		mkdirSync(join(root, 'node_modules', 'solid-js'), { recursive: true });
		writeFileSync(join(root, 'node_modules', 'solid-js', 'package.json'), JSON.stringify({ name: 'solid-js', version: '1.9.0' }, null, 2));
		writeFileSync(join(root, 'node_modules', 'solid-js', 'index.js'), 'module.exports = {};\n');
		mkdirSync(join(root, 'node_modules', 'solid-navigation'), { recursive: true });
		writeFileSync(join(root, 'node_modules', 'solid-navigation', 'package.json'), JSON.stringify({ name: 'solid-navigation', version: '1.0.0' }, null, 2));
		writeFileSync(join(root, 'node_modules', 'solid-navigation', 'index.js'), 'module.exports = {};\n');

		const collected = collectVendorModules(root, 'ios', 'solid');

		expect(collected.entries).not.toContain('solid-js');
		// Sanity: the OTHER Solid-ecosystem packages still belong in vendor.
		// The bug is scoped to the `solid-js` ROOT specifier — subpaths and
		// renderer packages keep their bundled identity (their internal
		// `import 'solid-js'` becomes external and flows through the
		// unified HTTP-served instance).
		expect(collected.entries).toContain('@nativescript-community/solid-js');
		expect(collected.entries).toContain('solid-navigation');
	});

	it('still bundles `solid-js` for non-Solid flavors (e.g. when a vue app happens to ship it)', () => {
		// Belt-and-suspenders: the skip is gated on `flavor === 'solid'`,
		// not on `solid-js` appearing anywhere in deps. A Vue app that
		// transitively pulls solid-js (rare but possible) must still get
		// the conventional vendor-bundled path — there's no
		// duplicate-realm risk because the HTTP-served solid-refresh
		// middleware never loads in that flavor.
		const root = mkdtempSync(join(tmpdir(), 'ns-vendor-manifest-'));
		tempRoots.push(root);

		writeFileSync(join(root, 'package.json'), JSON.stringify({ name: 'fixture-app', version: '0.0.0', dependencies: { 'solid-js': '*' } }, null, 2));
		mkdirSync(join(root, 'node_modules', 'solid-js'), { recursive: true });
		writeFileSync(join(root, 'node_modules', 'solid-js', 'package.json'), JSON.stringify({ name: 'solid-js', version: '1.9.0' }, null, 2));
		writeFileSync(join(root, 'node_modules', 'solid-js', 'index.js'), 'module.exports = {};\n');

		const collected = collectVendorModules(root, 'ios', 'vue');

		expect(collected.entries).toContain('solid-js');
	});

	it('keeps a package root the registered flavor excludes out of vendor, even as a peer of a vendored package', () => {
		// Octane shape: the app lists `octane` only to satisfy the renderer
		// package's peer range, and the compiler rewrites every `from 'octane'`
		// in compiled components to the renderer package. Seeding `octane` would
		// evaluate its DOM runtime on device for nothing.
		const root = mkdtempSync(join(tmpdir(), 'ns-vendor-manifest-'));
		tempRoots.push(root);

		writeFileSync(join(root, 'package.json'), JSON.stringify({ name: 'fixture-app', version: '0.0.0', dependencies: { '@acme/octane-ns': '*', octane: '*' } }, null, 2));
		mkdirSync(join(root, 'node_modules', '@acme', 'octane-ns'), { recursive: true });
		writeFileSync(join(root, 'node_modules', '@acme', 'octane-ns', 'package.json'), JSON.stringify({ name: '@acme/octane-ns', version: '1.0.0', peerDependencies: { octane: '*' } }, null, 2));
		writeFileSync(join(root, 'node_modules', '@acme', 'octane-ns', 'index.js'), 'module.exports = {};\n');
		mkdirSync(join(root, 'node_modules', 'octane'), { recursive: true });
		writeFileSync(join(root, 'node_modules', 'octane', 'package.json'), JSON.stringify({ name: 'octane', version: '1.0.0' }, null, 2));
		writeFileSync(join(root, 'node_modules', 'octane', 'index.js'), 'module.exports = {};\n');
		registerFrameworkFlavor({ flavor: 'acme', server: { ...typescriptServerStrategy, flavor: 'acme' }, client: '@acme/octane-ns/client', vendor: { exclude: ['octane'] } });

		expect(collectVendorModules(root, 'ios', 'acme').entries).toEqual(['@acme/octane-ns']);
		// The policy belongs to the flavor that declared it.
		expect(collectVendorModules(root, 'ios', 'typescript').entries).toEqual(['@acme/octane-ns', 'octane']);
	});

	it('emits the same runtime bundle contract for served vendor modules', () => {
		const code = createVendorBundleRuntimeModule({
			code: 'export const __nsVendorModuleMap = { "pinia": {} };\n',
			manifest: {
				version: 1,
				createdAt: '2026-04-18T00:00:00.000Z',
				hash: 'hash-123',
				modules: {
					pinia: {
						id: 'pinia',
						exports: { '*': true },
					},
				},
				aliases: {},
			},
			entries: ['pinia'],
		});

		expect(code).toContain('export const __nsVendorModuleMap = { "pinia": {} };');
		expect(code).toContain('export const vendorManifest = {"version":1,"createdAt":"2026-04-18T00:00:00.000Z","hash":"hash-123"');
		expect(code).toContain('export default vendorManifest;');
	});
});

describe('collectVendorModules — source-only dependencies', () => {
	const tempRoots: string[] = [];

	afterEach(() => {
		while (tempRoots.length) {
			const root = tempRoots.pop();
			if (root) {
				rmSync(root, { recursive: true, force: true });
			}
		}
	});

	const makeApp = (deps: Record<string, string>): string => {
		const root = mkdtempSync(join(tmpdir(), 'ns-vendor-source-only-'));
		tempRoots.push(root);
		mkdirSync(join(root, 'node_modules'), { recursive: true });
		writeFileSync(join(root, 'package.json'), JSON.stringify({ name: 'fixture-app', version: '0.0.0', dependencies: deps }));
		return root;
	};

	const installPackage = (root: string, name: string, pkg: Record<string, unknown>, files: Record<string, string> = {}) => {
		const dir = join(root, 'node_modules', ...name.split('/'));
		mkdirSync(dir, { recursive: true });
		writeFileSync(join(dir, 'package.json'), JSON.stringify({ name, version: '1.0.0', ...pkg }));
		for (const [rel, content] of Object.entries(files)) {
			mkdirSync(join(dir, rel, '..'), { recursive: true });
			writeFileSync(join(dir, rel), content);
		}
	};

	it('excludes a semver dep whose package exports only TS source', () => {
		const root = makeApp({ 'src-lib': '1.0.0' });
		installPackage(root, 'src-lib', { exports: { '.': { types: './src/index.d.ts', default: './src/index.ts' }, './package.json': './package.json' } }, { 'src/index.ts': 'export const x = 1;\n', 'src/index.d.ts': 'export declare const x: number;\n' });

		expect(collectVendorModules(root, 'ios', 'typescript').entries).not.toContain('src-lib');
	});

	it('excludes a semver dep hook-linked to an external source checkout', () => {
		const root = makeApp({ 'hook-lib': '1.0.0' });
		const checkout = mkdtempSync(join(tmpdir(), 'ns-vendor-source-checkout-'));
		tempRoots.push(checkout);
		const depDir = join(checkout, 'hook-lib');
		mkdirSync(join(depDir, 'src'), { recursive: true });
		writeFileSync(join(depDir, 'package.json'), JSON.stringify({ name: 'hook-lib', version: '1.0.0', main: 'src/index.ts' }));
		writeFileSync(join(depDir, 'src/index.ts'), 'export const y = 1;\n');
		symlinkSync(depDir, join(root, 'node_modules', 'hook-lib'), 'dir');

		expect(collectVendorModules(root, 'ios', 'typescript').entries).not.toContain('hook-lib');
	});

	it('vendors a semver dep with a compiled entry when exports omit ./package.json', () => {
		const root = makeApp({ 'compiled-lib': '1.0.0' });
		installPackage(root, 'compiled-lib', { exports: { '.': './dist/index.js' } }, { 'dist/index.js': 'module.exports = {};\n' });

		expect(collectVendorModules(root, 'ios', 'typescript').entries).toContain('compiled-lib');
	});

	it('vendors a semver dep whose extensionless main names a directory with index.js', () => {
		const root = makeApp({ 'dir-main-lib': '1.0.0' });
		installPackage(root, 'dir-main-lib', { main: 'lib' }, { 'lib/index.js': 'module.exports = {};\n' });

		expect(collectVendorModules(root, 'ios', 'typescript').entries).toContain('dir-main-lib');
	});

	it('vendors a semver NativeScript plugin shipping only platform-suffixed entries', () => {
		const root = makeApp({ 'ns-plugin': '1.0.0' });
		installPackage(root, 'ns-plugin', { main: 'index' }, { 'index.ios.js': 'module.exports = {};\n', 'index.android.js': 'module.exports = {};\n' });

		expect(collectVendorModules(root, 'ios', 'typescript').entries).toContain('ns-plugin');
	});

	it('keeps vendoring a file: tarball spec whose installed package has compiled JS', () => {
		const root = makeApp({ 'tgz-lib': 'file:./pkg.tgz' });
		installPackage(root, 'tgz-lib', { main: 'index.js' }, { 'index.js': 'module.exports = {};\n' });

		expect(collectVendorModules(root, 'ios', 'typescript').entries).toContain('tgz-lib');
	});

	it('vendors a compiled file: dir package but not a source-only one', () => {
		const root = makeApp({ 'file-compiled': 'file:../file-compiled', 'file-source': 'file:../file-source' });
		installPackage(root, 'file-compiled', { main: 'index.js' }, { 'index.js': 'module.exports = {};\n' });
		installPackage(root, 'file-source', { main: 'src/index.ts' }, { 'src/index.ts': 'export const z = 1;\n' });

		const entries = collectVendorModules(root, 'ios', 'typescript').entries;
		expect(entries).toContain('file-compiled');
		expect(entries).not.toContain('file-source');
	});

	it('keeps the pristine result for a declared-but-not-installed dep', () => {
		const root = makeApp({ 'ghost-lib': '1.0.0' });

		expect(collectVendorModules(root, 'ios', 'typescript').entries).toContain('ghost-lib');
	});

	it('vendors a semver plugin whose declared main is missing on disk', () => {
		const root = makeApp({ 'stale-main-plugin': '1.0.0' });
		installPackage(root, 'stale-main-plugin', { main: 'plugin' }, { 'index.ios.js': 'module.exports = {};\n', 'index.android.js': 'module.exports = {};\n' });

		expect(collectVendorModules(root, 'ios', 'typescript').entries).toContain('stale-main-plugin');
	});

	it('vendors imported subpaths of monorepo root deps that have no root entry', () => {
		const workspace = makeApp({ 'subpath-lib': '1.0.0', 'wildcard-lib': '1.0.0' });
		writeFileSync(join(workspace, 'nx.json'), '{}');
		installPackage(workspace, 'subpath-lib', {}, { 'a.js': 'export default 1;\n' });
		installPackage(workspace, 'wildcard-lib', { exports: { './*': './dist/*.js' } }, { 'dist/w.js': 'export default 2;\n' });
		const app = join(workspace, 'apps', 'app');
		mkdirSync(join(app, 'src'), { recursive: true });
		writeFileSync(join(app, 'package.json'), JSON.stringify({ name: 'app', version: '0.0.0', dependencies: {} }));
		writeFileSync(join(app, 'src', 'app.ts'), "import a from 'subpath-lib/a.js';\nimport w from 'wildcard-lib/w';\nconsole.log(a, w);\n");

		const entries = collectVendorModules(app, 'ios', 'typescript').entries;
		expect(entries).toContain('subpath-lib/a.js');
		expect(entries).toContain('wildcard-lib/w');
	});
});
