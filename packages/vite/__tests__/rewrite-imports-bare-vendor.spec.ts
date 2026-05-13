/**
 * Regression tests for the `SyntaxError: ... does not provide an export
 * named 'defineStore'` runtime crash that surfaced in `ConsumerApp`
 * (NativeScript Vue) under Vite 8 HMR after the concatenated-`;import`
 * normalization fix in `rewrite-imports-concatenated.spec.ts` landed.
 *
 * Symptom chain:
 *
 *   1. Before the concatenated-imports fix, packed lines like
 *      `} = __ns_rt_ns_1;import { defineStore } from "pinia";`
 *      slipped past `rewriteImports` entirely because every
 *      import-matching regex (`IMPORT_PATTERN_1`, `_2`, `_3`,
 *      `IMPORT_PATTERN_SIDE_EFFECT`) anchors on `(?:^|\n)\s*import`.
 *      The bare `pinia` spec survived to the device and the iOS HTTP
 *      ESM loader consulted the import map, which routed it to
 *      `ns-vendor://pinia` and served the prebuilt CJS wrapper from
 *      `bundle.mjs`. Named exports worked.
 *   2. After the fix, `rewriteImports` now sees every import. Bare
 *      vendor specifiers fell through to the catch-all bare-npm
 *      fallback at the bottom of `replaceVueImport`, which
 *      unconditionally rewrites to `/ns/m/node_modules/<spec>`. That
 *      path serves the package source over HTTP and bypasses the
 *      vendor bridge entirely. For CJS/UMD packages like Pinia the
 *      bare HTTP path doesn't expose the full named-export surface
 *      (only the default export round-trips), so the very next
 *      consumer (e.g. `core/v4/pinia/store.ts`) blew up at
 *      instantiation with:
 *
 *        SyntaxError: The requested module
 *          'http://localhost:5173/ns/m/node_modules/pinia' does not
 *          provide an export named 'defineStore'
 *
 *      The device-side `startBrowserRuntimeSession` then aborted, the
 *      app failed to boot, and HMR never came up.
 *
 * The fix adds a vendor-routing pre-check to the bare-specifier branch
 * of `rewriteImports`. When `resolveVendorRouting(spec, projectRoot)`
 * returns `{ route: 'vendor', bareSpec }` we preserve the bare spec so
 * the device-side import map can dispatch to `ns-vendor://<pkg>` —
 * mirroring the behaviour already used by the existing
 * `nodeModulesSpecifier` branch for paths that explicitly contain
 * `/node_modules/<pkg>/`.
 *
 * These tests pin both the positive contract (manifest-listed bare
 * specs stay bare) and the negative contract (unlisted specs and
 * non-main-entry subpaths still route to `/ns/m/node_modules/<spec>`).
 */
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { clearVendorManifest, registerVendorManifest } from '../hmr/shared/vendor/registry.js';
import { rewriteImports } from '../hmr/server/websocket.js';

const SERVER_ORIGIN = 'http://localhost:5173';

interface ManifestModule {
	id: string;
	exports: Record<string, boolean>;
}

function makeVendorManifest(modules: Record<string, ManifestModule>) {
	return {
		version: 1,
		createdAt: '2026-01-01T00:00:00.000Z',
		hash: 'test-bare-vendor',
		modules,
		aliases: {},
	};
}

describe('rewriteImports: bare vendor specifier routing', () => {
	const tempRoots: string[] = [];
	let projectRoot = '';

	beforeEach(() => {
		// Each test gets a fresh project root with the package layouts it
		// expects on disk. `resolveVendorRouting` reads `package.json`
		// off-disk via `resolveNodeModulesPackageBoundary` (cached per
		// project) so a real filesystem fixture is the cheapest faithful
		// reproduction.
		projectRoot = mkdtempSync(join(tmpdir(), 'ns-rewrite-bare-vendor-'));
		tempRoots.push(projectRoot);
	});

	afterEach(() => {
		clearVendorManifest();
		while (tempRoots.length) {
			const root = tempRoots.pop();
			if (root) {
				rmSync(root, { recursive: true, force: true });
			}
		}
	});

	function seedPackage(name: string, packageJson: Record<string, unknown> = { name, version: '1.0.0', main: './index.js' }) {
		const dir = join(projectRoot, 'node_modules', ...name.split('/'));
		mkdirSync(dir, { recursive: true });
		writeFileSync(join(dir, 'package.json'), JSON.stringify(packageJson, null, 2));
	}

	it('preserves bare vendor specifiers (e.g. `pinia`) so the import map can route them to `ns-vendor://`', () => {
		// Reproduces the ConsumerApp boot crash: `pinia` is a CJS-shape
		// package wrapped by the vendor bundle. The device's import map
		// maps `pinia` → `ns-vendor://pinia` and exposes the full named-
		// export surface (including `defineStore`). The rewriter must
		// NOT collapse this to `/ns/m/node_modules/pinia` or the device
		// will instantiate it as raw ESM and crash on the missing
		// `defineStore` export.
		seedPackage('pinia');
		registerVendorManifest(
			makeVendorManifest({
				pinia: { id: 'pinia', exports: { '*': true } },
			}),
		);

		const input = `import { defineStore } from "pinia";`;
		const out = rewriteImports(input, '/src/store.ts', new Map(), new Map(), projectRoot, false, undefined, SERVER_ORIGIN);

		expect(out).toContain(`from "pinia"`);
		// Negative pin: the previous behavior emitted this and broke boot.
		expect(out).not.toContain('/ns/m/node_modules/pinia');
	});

	it('preserves scoped bare vendor specifiers (e.g. `@nativescript-community/perms`)', () => {
		// Scoped specs go through the same bare-spec regex
		// (`^(?:@[A-Za-z0-9][\\w.-]*\\/)?[A-Za-z0-9]...`) but it's worth
		// pinning since the leading `@` historically tripped up specifier
		// classifiers (cf. `if (spec === '@')` guard upstream).
		seedPackage('@nativescript-community/perms');
		registerVendorManifest(
			makeVendorManifest({
				'@nativescript-community/perms': { id: '@nativescript-community/perms', exports: { '*': true } },
			}),
		);

		const input = `import { request } from "@nativescript-community/perms";`;
		const out = rewriteImports(input, '/src/utils/permissions.ts', new Map(), new Map(), projectRoot, false, undefined, SERVER_ORIGIN);

		expect(out).toContain(`from "@nativescript-community/perms"`);
		expect(out).not.toContain('/ns/m/node_modules/@nativescript-community/perms');
	});

	it('falls back to `/ns/m/node_modules/<spec>` for bare specs NOT in the vendor manifest', () => {
		// The bare-npm fallback at the bottom of `replaceVueImport`
		// exists for build-time helpers that emit specifiers like
		// `source-map-js/lib/source-map-generator.js`. Our new
		// vendor-routing pre-check must not regress this branch — if
		// `resolveVendorRouting` returns `null` (no manifest entry,
		// no NS plugin heuristic match) we must fall through.
		seedPackage('source-map-js');
		// Intentionally no manifest entry for `source-map-js`.
		registerVendorManifest(makeVendorManifest({}));

		const input = `import { SourceMapGenerator } from "source-map-js/lib/source-map-generator.js";`;
		const out = rewriteImports(input, '/src/bundler.ts', new Map(), new Map(), projectRoot, false, undefined, SERVER_ORIGIN);

		expect(out).toContain(`${SERVER_ORIGIN}/ns/m/node_modules/source-map-js/lib/source-map-generator.js`);
		// Negative pin: the spec must not survive as a bare specifier —
		// iOS's HTTP ESM loader can't satisfy a bare-spec lookup from a
		// `/ns/m/...` importer URL.
		expect(out).not.toMatch(/from\s+["']source-map-js\/lib\/source-map-generator\.js["']/);
	});

	it('routes non-main-entry subpath imports of vendor packages through HTTP', () => {
		// `pinia/plugins/foo` is a manifest-listed package but the
		// subpath is not the main entry, so `resolveVendorRouting`
		// returns `{ route: 'http' }`. The bare-vendor pre-check must
		// honor that (i.e. NOT short-circuit to the bare spec) so the
		// existing bare-npm fallback can rewrite it to
		// `/ns/m/node_modules/pinia/plugins/foo`. This matches the
		// behaviour already enforced by the `nodeModulesSpecifier`
		// branch for path-with-`/node_modules/` inputs.
		seedPackage('pinia', { name: 'pinia', version: '2.0.0', main: './index.js' });
		registerVendorManifest(
			makeVendorManifest({
				pinia: { id: 'pinia', exports: { '*': true } },
			}),
		);

		const input = `import foo from "pinia/plugins/foo";`;
		const out = rewriteImports(input, '/src/store.ts', new Map(), new Map(), projectRoot, false, undefined, SERVER_ORIGIN);

		expect(out).toContain(`${SERVER_ORIGIN}/ns/m/node_modules/pinia/plugins/foo`);
		expect(out).not.toMatch(/from\s+["']pinia\/plugins\/foo["']/);
	});

	it('preserves bare vendor specifiers even when packed onto a line with relative imports (App.vue scenario)', () => {
		// Combined regression: the concatenated-`;import` fix +
		// bare-vendor routing must both apply on the same line. This
		// mirrors the exact crash sequence in ConsumerApp:
		//
		//   1. Babel's `retainLines:true` packs the SFC asm output onto
		//      one line.
		//   2. `;\\s*import\\s+` → `;\\nimport ` splits them.
		//   3. The relative `../utils` becomes `/ns/m/src/utils`.
		//   4. The bare `pinia` stays bare so the device-side import map
		//      can route it to `ns-vendor://pinia`.
		seedPackage('pinia');
		registerVendorManifest(
			makeVendorManifest({
				pinia: { id: 'pinia', exports: { '*': true } },
			}),
		);

		const input = `} = __ns_rt_ns_1;import { $goTo } from "../utils";import { defineStore } from "pinia";let __ns_sfc__;`;
		const out = rewriteImports(input, '/src/components/App.vue', new Map(), new Map(), projectRoot, false, undefined, SERVER_ORIGIN);

		expect(out).toContain('/ns/m/src/utils');
		expect(out).toContain(`from "pinia"`);
		expect(out).not.toContain('/ns/m/node_modules/pinia');
		expect(out).not.toMatch(/from\s+["']\.\.\/utils["']/);
	});

	it('routes the dynamic-import form of a bare vendor spec the same as the static form', () => {
		// `IMPORT_PATTERN_3` covers `import('pinia')`; the bare-vendor
		// pre-check sits inside the shared `replaceVueImport` closure
		// so the dynamic and static forms must converge on the same
		// output. Without this guarantee `import('pinia').then(...)`
		// would still hit the broken HTTP path while
		// `import { defineStore } from 'pinia'` was fixed.
		seedPackage('pinia');
		registerVendorManifest(
			makeVendorManifest({
				pinia: { id: 'pinia', exports: { '*': true } },
			}),
		);

		const input = `const piniaModule = await import("pinia");`;
		const out = rewriteImports(input, '/src/lazy-store.ts', new Map(), new Map(), projectRoot, false, undefined, SERVER_ORIGIN);

		expect(out).toContain(`import("pinia")`);
		expect(out).not.toContain('/ns/m/node_modules/pinia');
	});
});
