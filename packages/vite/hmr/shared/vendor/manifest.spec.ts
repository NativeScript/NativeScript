import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { afterEach, describe, expect, it } from 'vitest';

import { __test_collectVendorModules as collectVendorModules, __test_createVendorBundleRuntimeModule as createVendorBundleRuntimeModule } from './manifest.js';

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
		//     vendor-module loop would set
		//     `imports['solid-js'] = 'ns-vendor://solid-js'` and
		//     overwrite the HTTP redirect; the duplicate-realm
		//     regression returns wholesale.
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
		mkdirSync(join(root, 'node_modules', 'solid-js'), { recursive: true });
		writeFileSync(join(root, 'node_modules', 'solid-js', 'package.json'), JSON.stringify({ name: 'solid-js', version: '1.9.0' }, null, 2));
		mkdirSync(join(root, 'node_modules', 'solid-navigation'), { recursive: true });
		writeFileSync(join(root, 'node_modules', 'solid-navigation', 'package.json'), JSON.stringify({ name: 'solid-navigation', version: '1.0.0' }, null, 2));

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

		const collected = collectVendorModules(root, 'ios', 'vue');

		expect(collected.entries).toContain('solid-js');
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
