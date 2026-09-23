/**
 * Regression tests for the `createRequire is not defined` runtime crash
 * triggered by `css-tree/lib/data-patch.js` under non-Angular HMR.
 *
 * The crash chain (reproduced in `ConsumerApp` on `@nativescript/vite`
 * 8.0.0-alpha.15 with NativeScript Vue):
 *
 *   1. `@nativescript/core` pulls in `css-tree` for CSS parsing.
 *   2. `css-tree/lib/data-patch.js` runs `import { createRequire } from 'module';`.
 *   3. The base Vite config aliases the bare `module` specifier (via
 *      `aliasCssTree`) and `node:module` (via `resolveConfig.alias`) to local
 *      polyfills that export a working `createRequire`.
 *   4. BUT: when Vite's depscanner runs with discovery enabled (every
 *      non-Angular flavor: Vue, React, Solid, JS, TS), it sees those imports
 *      and pre-bundles the polyfill at `/node_modules/.vite/deps/module.js`,
 *      rewriting the original import to point there.
 *   5. The HMR `/ns/m/` pipeline's `rewriteVitePrebundleImportsForDevice`
 *      then tries to map `node_modules/.vite/deps/module.js` back to a bare
 *      specifier via the vendor manifest. Because `module` is NOT a real npm
 *      package (no manifest entry), the lookup returns `null` and the entire
 *      import statement is silently dropped from the device-side output.
 *   6. On device, `createRequire` is therefore undefined and `data-patch.js`
 *      throws `ReferenceError: createRequire is not defined` at boot.
 *
 * The fix is to surface both `module` and `node:module` in the base
 * `optimizeDeps.exclude` list so the depscanner never pre-bundles them, and
 * the original alias path (bare specifier → local polyfill) survives.
 * Angular's config takes a different route — it sets `noDiscovery: true`,
 * so it never hits this — but excluding here is harmless for Angular too.
 *
 * These tests pin both the static contract (the source-of-truth list in
 * `base.ts`) and the resolved runtime contract (the alias map actually
 * points the bare specifiers at local polyfill files, not somewhere else).
 */
import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const VITE_PKG_ROOT = path.resolve(__dirname, '..');

function readSource(relativePath: string): string {
	return fs.readFileSync(path.join(VITE_PKG_ROOT, relativePath), 'utf8');
}

/**
 * Extract the contents of a `const <name> = [...]` literal from a TS file so
 * we don't rely on importing `base.ts` (which would force us to mock the
 * full project resolution chain just to read a constant).
 */
function extractArrayLiteral(source: string, name: string): string[] {
	const re = new RegExp(`const\\s+${name}\\s*=\\s*\\[([\\s\\S]*?)\\]`);
	const match = source.match(re);
	if (!match) {
		throw new Error(`Could not find array literal: ${name}`);
	}
	const body = match[1];
	const items: string[] = [];
	const itemRe = /['"`]([^'"`]+)['"`]/g;
	let m: RegExpExecArray | null;
	while ((m = itemRe.exec(body)) !== null) {
		items.push(m[1]);
	}
	return items;
}

describe('css-tree createRequire polyfill protection', () => {
	const baseSource = readSource('configuration/base.ts');

	it('keeps bare `module` and `node:module` out of the depscanner pre-bundle set', () => {
		// If this fails, css-tree's `data-patch.js` will crash on the device
		// with `ReferenceError: createRequire is not defined` under HMR. See
		// the top-of-file comment for the full chain. The canonical exclude list
		// now lives in `helpers/optimize-deps.ts` (NS_OPTIMIZE_DEPS_EXCLUDE),
		// consumed by `configuration/base.ts` and `configuration/angular.ts`.
		const optimizeDepsSource = readSource('helpers/optimize-deps.ts');
		const exclude = extractArrayLiteral(optimizeDepsSource, 'NS_OPTIMIZE_DEPS_EXCLUDE');
		expect(exclude).toContain('module');
		expect(exclude).toContain('node:module');
		// base.ts must consume the shared constant (not re-list it inline).
		expect(baseSource).toContain('NS_OPTIMIZE_DEPS_EXCLUDE');
	});

	it('aliases the bare `module` specifier to the local css-tree polyfill', () => {
		// Belt for the suspenders above. Even if the depscanner exclusion
		// regresses, the alias must continue to point at our polyfill so any
		// other call site that bypasses the depscanner still resolves to a
		// working `createRequire`.
		const cssTreeSource = readSource('helpers/css-tree.ts');
		expect(cssTreeSource).toMatch(/find:\s*['"]module['"]/);
		expect(cssTreeSource).toMatch(/polyfills\/module\.js/);
	});

	it('aliases `node:module` to the NS runtime shim', () => {
		// The depscanner exclusion only matters during pre-bundling; at
		// runtime any code that still reaches for `node:module` (e.g. inside
		// transitively bundled vendor code) needs the NS-safe shim path.
		expect(baseSource).toMatch(/find:\s*\/\^node:module\$\//);
		expect(baseSource).toMatch(/shims\/node-module\.js/);
	});

	it('exposes a `createRequire` symbol from the css-tree polyfill', () => {
		// Final guard: the polyfill itself must actually export
		// `createRequire`. Tests in the chain above only confirm the alias
		// points at this file; this confirms the file fulfills the contract
		// css-tree depends on.
		const polyfillSource = readSource('polyfills/module.ts');
		expect(polyfillSource).toMatch(/export\s+function\s+createRequire/);
	});

	it('exposes a `createRequire` symbol from the node-module shim', () => {
		const shimSource = readSource('shims/node-module.ts');
		expect(shimSource).toMatch(/export\s+function\s+createRequire/);
	});

	it('keeps Solid HMR config defensively excluding both specifiers', () => {
		// Solid was historically the only flavor that surfaced this bug
		// (see `fix: createRequire with solid hmr` 5b12961e0). The base
		// fix now covers everything, but Solid's defensive override is
		// kept as belt-and-suspenders so this regression cannot return via
		// a future config refactor that swaps out the base exclude list.
		const solidSource = readSource('configuration/solid.ts');
		const match = solidSource.match(/optimizeDeps:\s*\{[\s\S]*?exclude:\s*\[([\s\S]*?)\]/);
		expect(match, 'Solid optimizeDeps.exclude block not found').toBeTruthy();
		const items = (match![1].match(/['"`]([^'"`]+)['"`]/g) || []).map((entry) => entry.slice(1, -1));
		expect(items, 'Solid optimizeDeps.exclude must keep its defense-in-depth entries').toContain('module');
		expect(items, 'Solid optimizeDeps.exclude must keep its defense-in-depth entries').toContain('node:module');
	});
});
