/**
 * Regression test for the Solid + Vite 8 HMR `solid-navigation` boot
 * crash:
 *
 *   [vite] (client) Pre-transform error: Failed to parse source for
 *   import analysis because the content contains invalid JS syntax.
 *   If you are using JSX, make sure to name the file with the .jsx
 *   or .tsx extension.
 *   File: …/node_modules/.vite/deps/solid-navigation.js:51:32
 *
 * Root cause: Vite's depscanner pre-bundles every bare specifier the
 * app imports. `solid-navigation` ships `dist/src/*.jsx` (pre-compiled
 * by `tsc` for JSX-preservation rather than fully transpiled) so the
 * pre-bundle output at `node_modules/.vite/deps/solid-navigation.js`
 * contains JSX expressions verbatim. Rolldown's depscanner doesn't run
 * the Solid JSX transform (that lives in `vite-plugin-solid`'s
 * `transform` hook, which filters on `/\.[mc]?[tj]sx$/i.test(id)` — the
 * pre-bundle's `.js` id never matches), so the JSX is never rewritten.
 * Vite then runs its built-in `vite:import-analysis` on the `.js`
 * output, the JS parser hits a `<` and bails, and dev boot aborts.
 *
 * The fix surfaces in two places:
 *
 *   1. `helpers/solid-jsx-deps.ts` — synchronous scan of the project's
 *      (and monorepo's) `node_modules` that picks out packages with
 *      BOTH (a) a Solid runtime dep declared and (b) at least one
 *      published `.jsx`/`.tsx` file. These two checks together avoid
 *      false positives on plain JS libraries and on Solid-related
 *      packages that ship pre-compiled JS only.
 *   2. `configuration/solid.ts` — those packages are added to
 *      `optimizeDeps.exclude` so Vite serves them through the normal
 *      module pipeline. The original `.jsx` id then matches the
 *      `vite-plugin-solid` `transform` hook and the JSX gets rewritten
 *      before `vite:import-analysis` sees it.
 *
 * These tests pin both the detector contract and the wiring contract:
 *
 *   - The detector excludes plain JS deps even when they declare a
 *     `solid-js` peer (so `optimizeDeps.exclude` stays minimal).
 *   - The detector excludes packages that have `.jsx` files but no
 *     Solid runtime dep (so e.g. a stray React-only package can't
 *     accidentally bypass pre-bundling).
 *   - The detector follows the workspace's hoisted `node_modules`,
 *     since pnpm/Nx/etc. install most packages there.
 *   - `solidConfig`'s `optimizeDeps.exclude` keeps the
 *     defense-in-depth `module` / `node:module` entries (regression
 *     guard for the unrelated `createRequire` polyfill chain).
 *   - Other framework configs (Angular, Vue, React) do NOT pick up
 *     this exclude list — the fix is scoped to Solid, where the
 *     `vite-plugin-solid` transform-hook id filter is the load-
 *     bearing constraint that makes this exclusion necessary.
 */
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { findSolidPackagesShippingJsx } from '../helpers/solid-jsx-deps.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const VITE_PKG_ROOT = path.resolve(__dirname, '..');

function readSource(relativePath: string): string {
	return fs.readFileSync(path.join(VITE_PKG_ROOT, relativePath), 'utf8');
}

/**
 * Build a minimal `node_modules` layout in a temp dir. Each entry is a
 * single package described inline so the test reads as a self-contained
 * scenario without needing to drop fixture files on disk.
 */
function scaffoldProject(spec: {
	rootName?: string;
	packages: Record<
		string,
		{
			pkgJson: Record<string, any>;
			files?: Record<string, string>;
		}
	>;
}): { root: string; cleanup: () => void } {
	const tmpBase = fs.mkdtempSync(path.join(os.tmpdir(), 'ns-vite-solid-jsx-'));
	const root = path.join(tmpBase, spec.rootName ?? 'app');
	fs.mkdirSync(root, { recursive: true });
	fs.writeFileSync(path.join(root, 'package.json'), JSON.stringify({ name: spec.rootName ?? 'app', version: '0.0.0' }), 'utf8');
	const nm = path.join(root, 'node_modules');
	fs.mkdirSync(nm, { recursive: true });
	for (const [pkgName, def] of Object.entries(spec.packages)) {
		const pkgDir = path.join(nm, ...pkgName.split('/'));
		fs.mkdirSync(pkgDir, { recursive: true });
		fs.writeFileSync(path.join(pkgDir, 'package.json'), JSON.stringify({ name: pkgName, version: '1.0.0', ...def.pkgJson }), 'utf8');
		for (const [relPath, contents] of Object.entries(def.files ?? {})) {
			const abs = path.join(pkgDir, relPath);
			fs.mkdirSync(path.dirname(abs), { recursive: true });
			fs.writeFileSync(abs, contents, 'utf8');
		}
	}
	return {
		root,
		cleanup: () => {
			try {
				fs.rmSync(tmpBase, { recursive: true, force: true });
			} catch {
				/* best-effort cleanup */
			}
		},
	};
}

describe('findSolidPackagesShippingJsx', () => {
	let cleanups: Array<() => void> = [];
	beforeEach(() => {
		cleanups = [];
	});
	afterEach(() => {
		for (const fn of cleanups) fn();
		cleanups = [];
	});

	it('flags `solid-navigation`-style packages: solid dep + .jsx files in dist', () => {
		// This is the exact failure mode from the bug report. `solid-navigation`'s
		// published artifact has `dist/src/stack-router.jsx` (JSX preserved by tsc)
		// and the package declares `solid-js` as a devDep + peer of
		// `@nativescript-community/solid-js`. With both signals present, the
		// detector must include it.
		const { root, cleanup } = scaffoldProject({
			packages: {
				'solid-navigation': {
					pkgJson: {
						main: 'dist/index.js',
						peerDependencies: { '@nativescript-community/solid-js': '*' },
						devDependencies: { 'solid-js': '^1.8.0' },
					},
					files: {
						'dist/index.js': "export * from './src/stack-router';\n",
						'dist/src/stack-router.jsx': 'export const X = () => <Foo />;\n',
					},
				},
			},
		});
		cleanups.push(cleanup);
		expect(findSolidPackagesShippingJsx(root)).toEqual(['solid-navigation']);
	});

	it('skips packages without a Solid runtime dep even if they ship .jsx', () => {
		// A vanilla React-style component lib that ships .jsx files but
		// has no Solid dep must NOT land in Solid's optimizeDeps.exclude
		// — Vite would happily pre-bundle and transform it under the
		// React JSX path. (We don't ship a React config that calls this
		// detector, but pinning the contract here protects future
		// flavor configs from accidentally importing it and breaking.)
		const { root, cleanup } = scaffoldProject({
			packages: {
				'random-jsx-lib': {
					pkgJson: { main: 'dist/index.jsx', dependencies: { react: '^18.0.0' } },
					files: { 'dist/index.jsx': 'export default <div />;\n' },
				},
			},
		});
		cleanups.push(cleanup);
		expect(findSolidPackagesShippingJsx(root)).toEqual([]);
	});

	it('skips Solid-related packages that ship pre-compiled JS only', () => {
		// `@nativescript-community/solid-js` itself is the renderer and
		// ships compiled JS — it MUST be pre-bundled (or aliased) for
		// the Solid runtime to come up. The detector's "no `.jsx`/`.tsx`
		// in dist" check keeps it out of the exclude list so the base
		// `optimizeDeps.exclude` and the Solid plugin's `dedupe` chain
		// stay in charge.
		const { root, cleanup } = scaffoldProject({
			packages: {
				'solid-js-consumer': {
					pkgJson: { main: 'dist/index.js', dependencies: { 'solid-js': '^1.8.0' } },
					files: {
						'dist/index.js': 'export const x = 1;\n',
						'dist/utils.js': 'export const y = 2;\n',
					},
				},
			},
		});
		cleanups.push(cleanup);
		expect(findSolidPackagesShippingJsx(root)).toEqual([]);
	});

	it('skips raw `src/` directories (raw source, not the published bundle)', () => {
		// Some libraries ship their pre-build `src/` alongside `dist/`.
		// `src/` is not what `package.json#main` points at, so its JSX
		// files are not on the depscanner's path. Excluding the package
		// based on `src/*.jsx` alone would be over-eager. The detector
		// scans only `dist`/`lib`/`build`/`es`/`esm`/`out` at depth 0.
		const { root, cleanup } = scaffoldProject({
			packages: {
				'shipped-with-src-only': {
					pkgJson: { main: 'dist/index.js', peerDependencies: { 'solid-js': '*' } },
					files: {
						'dist/index.js': 'export const x = 1;\n',
						'src/component.jsx': 'export default () => <div />;\n',
					},
				},
			},
		});
		cleanups.push(cleanup);
		expect(findSolidPackagesShippingJsx(root)).toEqual([]);
	});

	it('handles scoped packages (e.g. `@scope/pkg`)', () => {
		// Scoped names need an extra directory level under
		// `node_modules`. Verifies the scanner recurses one level for
		// `@scope` entries and then re-joins the name.
		const { root, cleanup } = scaffoldProject({
			packages: {
				'@nativescript-community/solid-navigation': {
					pkgJson: {
						main: 'dist/index.js',
						peerDependencies: { '@nativescript-community/solid-js': '*' },
						devDependencies: { 'solid-js': '^1.8.0' },
					},
					files: {
						'dist/index.js': "export * from './src/x';\n",
						'dist/src/x.jsx': 'export const X = () => <Foo />;\n',
					},
				},
			},
		});
		cleanups.push(cleanup);
		expect(findSolidPackagesShippingJsx(root)).toEqual(['@nativescript-community/solid-navigation']);
	});

	it('finds packages installed in the monorepo workspace `node_modules`', () => {
		// In Nx/pnpm/etc. setups, `solid-navigation` may be hoisted to
		// the workspace root rather than sitting in the app's
		// `node_modules`. The detector accepts an optional
		// `monorepoRoot` and de-duplicates against the project root so
		// the same package found in both places is only reported once.
		const tmpBase = fs.mkdtempSync(path.join(os.tmpdir(), 'ns-vite-solid-mono-'));
		const monorepoRoot = path.join(tmpBase, 'workspace');
		const appRoot = path.join(monorepoRoot, 'apps', 'demo');
		fs.mkdirSync(appRoot, { recursive: true });
		fs.writeFileSync(path.join(monorepoRoot, 'pnpm-workspace.yaml'), 'packages:\n  - "apps/*"\n', 'utf8');
		fs.writeFileSync(path.join(appRoot, 'package.json'), JSON.stringify({ name: 'demo', version: '0.0.0' }), 'utf8');
		fs.mkdirSync(path.join(appRoot, 'node_modules'), { recursive: true });
		const hoistedPkgDir = path.join(monorepoRoot, 'node_modules', 'solid-navigation');
		fs.mkdirSync(path.join(hoistedPkgDir, 'dist', 'src'), { recursive: true });
		fs.writeFileSync(
			path.join(hoistedPkgDir, 'package.json'),
			JSON.stringify({
				name: 'solid-navigation',
				version: '1.0.0',
				main: 'dist/index.js',
				peerDependencies: { '@nativescript-community/solid-js': '*' },
				devDependencies: { 'solid-js': '^1.8.0' },
			}),
			'utf8',
		);
		fs.writeFileSync(path.join(hoistedPkgDir, 'dist', 'index.js'), "export * from './src/stack-router';\n", 'utf8');
		fs.writeFileSync(path.join(hoistedPkgDir, 'dist', 'src', 'stack-router.jsx'), 'export const X = () => <Foo />;\n', 'utf8');

		try {
			expect(findSolidPackagesShippingJsx(appRoot, monorepoRoot)).toEqual(['solid-navigation']);
		} finally {
			fs.rmSync(tmpBase, { recursive: true, force: true });
		}
	});
});

describe('solidConfig wiring', () => {
	it('imports the JSX-package detector so the exclude list is populated', () => {
		// If a future refactor drops the import, the dev-server crash
		// returns silently. Pin the wiring at the import-statement
		// level so a missing call site is impossible to miss in
		// review.
		const solidSource = readSource('configuration/solid.ts');
		expect(solidSource).toMatch(/from\s+['"]\.\.\/helpers\/solid-jsx-deps\.js['"]/);
		expect(solidSource).toMatch(/findSolidPackagesShippingJsx\s*\(/);
	});

	it('feeds detector results into `optimizeDeps.exclude`', () => {
		// Belt for the suspenders above. Even if the import survives a
		// refactor, the detector must actually feed the exclude
		// list — otherwise the depscanner still pre-bundles the JSX
		// package and the dev server crashes the same way.
		const solidSource = readSource('configuration/solid.ts');
		const match = solidSource.match(/optimizeDeps:\s*\{[\s\S]*?exclude:\s*\[([\s\S]*?)\]/);
		expect(match, 'Solid optimizeDeps.exclude block must exist').toBeTruthy();
		expect(match![1]).toMatch(/\.\.\.solidJsxPackages/);
	});

	it('keeps the defense-in-depth `module` / `node:module` entries', () => {
		// Cross-check against `module-polyfill-prebundle.spec.ts`: the
		// css-tree `createRequire` polyfill regression test already
		// requires these to be present in Solid's exclude block. We
		// re-assert here so a refactor that consolidates the exclude
		// list into the detector output can't silently drop them.
		const solidSource = readSource('configuration/solid.ts');
		const match = solidSource.match(/optimizeDeps:\s*\{[\s\S]*?exclude:\s*\[([\s\S]*?)\]/);
		const items = match ? (match[1].match(/['"`]([^'"`]+)['"`]/g) || []).map((entry) => entry.slice(1, -1)) : [];
		expect(items).toContain('module');
		expect(items).toContain('node:module');
	});
});

describe('other framework configs (Angular, Vue, React) do not import the Solid detector', () => {
	// The detector walks the full `node_modules` tree on every config
	// load. That cost is acceptable for the Solid flavor (where the
	// alternative is a dev-server boot crash) but unnecessary —
	// possibly harmful — for the others. Pin the negative contract so
	// a future cleanup pass can't `import` it everywhere "for
	// symmetry" and slow non-Solid dev boots.
	it.each(['angular.ts', 'vue.ts', 'react.ts'])('%s does not reference findSolidPackagesShippingJsx', (fileName) => {
		const source = readSource(`configuration/${fileName}`);
		expect(source).not.toMatch(/findSolidPackagesShippingJsx/);
	});
});
