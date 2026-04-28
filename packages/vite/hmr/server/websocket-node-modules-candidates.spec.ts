import { afterEach, describe, expect, it } from 'vitest';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync, realpathSync, symlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { filterExistingNodeModulesTransformCandidates } from './websocket-module-specifiers.js';

describe('filterExistingNodeModulesTransformCandidates', () => {
	let fixtureRoot: string | null = null;

	afterEach(() => {
		if (fixtureRoot) {
			rmSync(fixtureRoot, { recursive: true, force: true });
			fixtureRoot = null;
		}
	});

	it('fast-fails missing node_modules subpath candidates', () => {
		fixtureRoot = mkdtempSync(join(tmpdir(), 'ns-hmr-node-modules-candidates-'));
		mkdirSync(join(fixtureRoot, 'node_modules/@nativescript-community/ui-drawer'), { recursive: true });
		writeFileSync(join(fixtureRoot, 'node_modules/@nativescript-community/ui-drawer/index.js'), 'export const Drawer = true;\n');

		const candidates = ['/node_modules/@nativescript-community/ui-drawer/common.ts', '/node_modules/@nativescript-community/ui-drawer/common.js', '/node_modules/@nativescript-community/ui-drawer/common/index.js'];

		expect(filterExistingNodeModulesTransformCandidates('/node_modules/@nativescript-community/ui-drawer/common', candidates, fixtureRoot)).toEqual([]);
	});

	it('keeps existing explicit node_modules files', () => {
		fixtureRoot = mkdtempSync(join(tmpdir(), 'ns-hmr-node-modules-candidates-'));
		mkdirSync(join(fixtureRoot, 'node_modules/pkg'), { recursive: true });
		writeFileSync(join(fixtureRoot, 'node_modules/pkg/index.js'), 'export const value = 42;\n');

		const candidates = ['/node_modules/pkg/index.ts', '/node_modules/pkg/index.js'];

		expect(filterExistingNodeModulesTransformCandidates('/node_modules/pkg/index', candidates, fixtureRoot)).toEqual(['/node_modules/pkg/index.js']);
	});

	it('leaves non-node_modules candidates unchanged', () => {
		const candidates = ['/src/app.ts', '/src/app.js'];

		expect(filterExistingNodeModulesTransformCandidates('/src/app', candidates, '/tmp/project')).toEqual(candidates);
	});

	it('rewrites hoisted-monorepo node_modules candidates to /@fs/<abs-path>', () => {
		// Simulate an Nx-style layout:
		//   <ws>/apps/<app>/        ← projectRoot (Vite config.root)
		//   <ws>/node_modules/<pkg> ← hoisted, NOT under projectRoot
		// `css-tree`'s `package.json#exports` does not expose the
		// `lib/syntax/index.js` subpath, so the bridge MUST hand the
		// transformer the `/@fs/...` form which bypasses bare-specifier
		// resolution. Otherwise `transformRequest` rejects every
		// candidate even though the file is on disk.
		const wsRoot = realpathSync(mkdtempSync(join(tmpdir(), 'ns-hmr-node-modules-candidates-')));
		fixtureRoot = wsRoot;
		const appRoot = join(wsRoot, 'apps', 'app');
		mkdirSync(appRoot, { recursive: true });
		const hoistedPkgDir = join(wsRoot, 'node_modules/css-tree/lib/syntax');
		mkdirSync(hoistedPkgDir, { recursive: true });
		writeFileSync(join(hoistedPkgDir, 'index.js'), 'export default {};\n');

		const candidates = ['/node_modules/css-tree/lib/syntax/index.js', '/node_modules/css-tree/lib/syntax/index.ts'];
		const expectedFsPath = `/@fs${join(wsRoot, 'node_modules/css-tree/lib/syntax/index.js').replace(/\\/g, '/')}`;

		expect(filterExistingNodeModulesTransformCandidates('/node_modules/css-tree/lib/syntax/index.js', candidates, appRoot, wsRoot)).toEqual([expectedFsPath]);
	});

	it('preserves query suffix when rewriting hoisted candidates to /@fs/', () => {
		const wsRoot = realpathSync(mkdtempSync(join(tmpdir(), 'ns-hmr-node-modules-candidates-')));
		fixtureRoot = wsRoot;
		const appRoot = join(wsRoot, 'apps', 'app');
		mkdirSync(appRoot, { recursive: true });
		const hoistedPkgDir = join(wsRoot, 'node_modules/foo');
		mkdirSync(hoistedPkgDir, { recursive: true });
		writeFileSync(join(hoistedPkgDir, 'bar.js'), 'export const v = 1;\n');

		const candidates = ['/node_modules/foo/bar.js?import'];
		const expectedFsPath = `/@fs${join(wsRoot, 'node_modules/foo/bar.js').replace(/\\/g, '/')}?import`;

		expect(filterExistingNodeModulesTransformCandidates('/node_modules/foo/bar.js?import', candidates, appRoot, wsRoot)).toEqual([expectedFsPath]);
	});

	it('keeps app-local candidates as URL paths even when a workspace root is provided', () => {
		// When a package is duplicated in BOTH the app-local and the
		// hoisted node_modules, prefer the local one untouched — that
		// mirrors how Node's resolution sees it during build, and
		// keeps existing /ns/m/ HMR keys stable.
		const wsRoot = realpathSync(mkdtempSync(join(tmpdir(), 'ns-hmr-node-modules-candidates-')));
		fixtureRoot = wsRoot;
		const appRoot = join(wsRoot, 'apps', 'app');
		mkdirSync(join(appRoot, 'node_modules/foo'), { recursive: true });
		writeFileSync(join(appRoot, 'node_modules/foo/index.js'), 'export const v = 1;\n');
		mkdirSync(join(wsRoot, 'node_modules/foo'), { recursive: true });
		writeFileSync(join(wsRoot, 'node_modules/foo/index.js'), 'export const v = 2;\n');

		const candidates = ['/node_modules/foo/index.js'];

		expect(filterExistingNodeModulesTransformCandidates('/node_modules/foo/index.js', candidates, appRoot, wsRoot)).toEqual(['/node_modules/foo/index.js']);
	});

	it('returns empty when the file is missing in both project and workspace roots', () => {
		const wsRoot = realpathSync(mkdtempSync(join(tmpdir(), 'ns-hmr-node-modules-candidates-')));
		fixtureRoot = wsRoot;
		const appRoot = join(wsRoot, 'apps', 'app');
		mkdirSync(appRoot, { recursive: true });

		const candidates = ['/node_modules/missing/index.js'];

		expect(filterExistingNodeModulesTransformCandidates('/node_modules/missing/index.js', candidates, appRoot, wsRoot)).toEqual([]);
	});

	it('rewrites node_modules entries that symlink to non-node_modules workspace source to /@fs/<realpath>', () => {
		// NativeScript monorepo pattern: `<ws>/plugins/src/` is the
		// workspace's source-only package, re-exposed via a symlink at
		// `<ws>/node_modules/@scope/pkg -> ../../plugins/src`. The app's
		// own `node_modules/@scope/pkg` symlinks back up to the hoisted
		// copy. Without realpath-aware rewriting the bridge hands Vite
		// `/node_modules/@scope/pkg/ui-helper-common.ts`, where the
		// built-in esbuild plugin's `node_modules` exclusion filter
		// short-circuits the TS->JS conversion and the device receives
		// raw TypeScript that V8 rejects on type annotations.
		const wsRoot = realpathSync(mkdtempSync(join(tmpdir(), 'ns-hmr-node-modules-candidates-')));
		fixtureRoot = wsRoot;
		const appRoot = join(wsRoot, 'apps', 'app');
		mkdirSync(join(appRoot, 'node_modules/@scope'), { recursive: true });

		const sourceDir = join(wsRoot, 'plugins/src/ui-helper');
		mkdirSync(sourceDir, { recursive: true });
		writeFileSync(join(sourceDir, 'ui-helper-common.ts'), "export const importFileEvent: string = 'importFile';\n");

		mkdirSync(join(wsRoot, 'node_modules/@scope'), { recursive: true });
		// `<ws>/node_modules/@scope/pkg` -> `<ws>/plugins/src`
		symlinkSync(join(wsRoot, 'plugins/src'), join(wsRoot, 'node_modules/@scope/pkg'), 'dir');
		// `<app>/node_modules/@scope/pkg` -> `<ws>/node_modules/@scope/pkg`
		symlinkSync(join(wsRoot, 'node_modules/@scope/pkg'), join(appRoot, 'node_modules/@scope/pkg'), 'dir');

		const candidates = ['/node_modules/@scope/pkg/ui-helper/ui-helper-common.ts', '/node_modules/@scope/pkg/ui-helper/ui-helper-common.js'];
		const expectedFsPath = `/@fs${join(wsRoot, 'plugins/src/ui-helper/ui-helper-common.ts').replace(/\\/g, '/')}`;

		expect(filterExistingNodeModulesTransformCandidates('/node_modules/@scope/pkg/ui-helper/ui-helper-common.ts', candidates, appRoot, wsRoot)).toEqual([expectedFsPath]);
	});

	it('does not rewrite a node_modules entry whose realpath stays inside node_modules (regular hoisted package)', () => {
		// Regular hoisted packages must still go through the existing
		// "rewrite to /@fs/<resolved>" branch. A regression here would
		// re-introduce the `package.json#exports` 404 fixed by the
		// hoisted-monorepo case above.
		const wsRoot = realpathSync(mkdtempSync(join(tmpdir(), 'ns-hmr-node-modules-candidates-')));
		fixtureRoot = wsRoot;
		const appRoot = join(wsRoot, 'apps', 'app');
		mkdirSync(appRoot, { recursive: true });
		mkdirSync(join(wsRoot, 'node_modules/foo'), { recursive: true });
		writeFileSync(join(wsRoot, 'node_modules/foo/index.js'), 'export const v = 1;\n');

		const candidates = ['/node_modules/foo/index.js'];
		const expectedFsPath = `/@fs${join(wsRoot, 'node_modules/foo/index.js').replace(/\\/g, '/')}`;

		expect(filterExistingNodeModulesTransformCandidates('/node_modules/foo/index.js', candidates, appRoot, wsRoot)).toEqual([expectedFsPath]);
	});
});
