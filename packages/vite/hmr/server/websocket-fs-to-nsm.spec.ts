import { describe, expect, it } from 'vitest';
import { rewriteFsAbsoluteToNsM } from './websocket-module-specifiers.js';

const PROJECT_ROOT = '/Users/dev/work/monorepo/apps/console';
const WORKSPACE_ROOT = '/Users/dev/work/monorepo';

describe('rewriteFsAbsoluteToNsM', () => {
	it('returns null for non-/@fs/ specifiers', () => {
		expect(rewriteFsAbsoluteToNsM('/ns/m/src/main.ts', PROJECT_ROOT, WORKSPACE_ROOT)).toBeNull();
		expect(rewriteFsAbsoluteToNsM('http://localhost:5173/foo.js', PROJECT_ROOT, WORKSPACE_ROOT)).toBeNull();
		expect(rewriteFsAbsoluteToNsM('/@vite/client', PROJECT_ROOT, WORKSPACE_ROOT)).toBeNull();
		expect(rewriteFsAbsoluteToNsM('/@id/virtual:foo', PROJECT_ROOT, WORKSPACE_ROOT)).toBeNull();
		expect(rewriteFsAbsoluteToNsM('papaparse', PROJECT_ROOT, WORKSPACE_ROOT)).toBeNull();
		expect(rewriteFsAbsoluteToNsM('', PROJECT_ROOT, WORKSPACE_ROOT)).toBeNull();
	});

	it('rewrites a project-local /@fs/ URL to /ns/m/<projectRel>', () => {
		expect(rewriteFsAbsoluteToNsM(`/@fs${PROJECT_ROOT}/src/main.ts`, PROJECT_ROOT, WORKSPACE_ROOT)).toBe('/ns/m/src/main.ts');
		expect(rewriteFsAbsoluteToNsM(`/@fs${PROJECT_ROOT}/src/feature/bar.component.ts`, PROJECT_ROOT, WORKSPACE_ROOT)).toBe('/ns/m/src/feature/bar.component.ts');
	});

	it('rewrites a workspace-lib /@fs/ URL to /ns/m/<workspaceRel>', () => {
		// This is the key papaparse-class fix: workspace libs at
		// `<workspaceRoot>/libs/...` were leaking out of our pipeline as
		// raw `/@fs/...` URLs, so transitive node_modules imports (papaparse)
		// got fetched via Vite's standard middleware without CJS wrapping.
		expect(rewriteFsAbsoluteToNsM(`/@fs${WORKSPACE_ROOT}/libs/multi-console-parser/src/index.ts`, PROJECT_ROOT, WORKSPACE_ROOT)).toBe('/ns/m/libs/multi-console-parser/src/index.ts');
		expect(rewriteFsAbsoluteToNsM(`/@fs${WORKSPACE_ROOT}/libs/xplat/utils/src/index.ts`, PROJECT_ROOT, WORKSPACE_ROOT)).toBe('/ns/m/libs/xplat/utils/src/index.ts');
	});

	it('rewrites a hoisted node_modules /@fs/ URL to /ns/m/node_modules/<pkg>/...', () => {
		// Hoisted-to-workspace-root packages must also flow through /ns/m/
		// so wrapCommonJsModuleForDevice runs on UMD/CJS bundles.
		expect(rewriteFsAbsoluteToNsM(`/@fs${WORKSPACE_ROOT}/node_modules/papaparse/papaparse.js`, PROJECT_ROOT, WORKSPACE_ROOT)).toBe('/ns/m/node_modules/papaparse/papaparse.js');
		expect(rewriteFsAbsoluteToNsM(`/@fs${WORKSPACE_ROOT}/node_modules/lodash/lodash.js`, PROJECT_ROOT, WORKSPACE_ROOT)).toBe('/ns/m/node_modules/lodash/lodash.js');
	});

	it('prefers projectRoot over workspaceRoot when the path is reachable from both', () => {
		// App-local node_modules (un-hoisted) should produce the shorter
		// /ns/m/node_modules/... URL, identical to what the bare-specifier
		// rewriter emits — keeps URLs canonical across all paths a module
		// could have arrived from.
		const projectLocalNm = `/@fs${PROJECT_ROOT}/node_modules/foo/index.js`;
		expect(rewriteFsAbsoluteToNsM(projectLocalNm, PROJECT_ROOT, WORKSPACE_ROOT)).toBe('/ns/m/node_modules/foo/index.js');
	});

	it('preserves ?query and #hash suffixes', () => {
		expect(rewriteFsAbsoluteToNsM(`/@fs${PROJECT_ROOT}/src/main.ts?import`, PROJECT_ROOT, WORKSPACE_ROOT)).toBe('/ns/m/src/main.ts?import');
		expect(rewriteFsAbsoluteToNsM(`/@fs${WORKSPACE_ROOT}/libs/foo/src/x.ts?vue&type=template`, PROJECT_ROOT, WORKSPACE_ROOT)).toBe('/ns/m/libs/foo/src/x.ts?vue&type=template');
		expect(rewriteFsAbsoluteToNsM(`/@fs${WORKSPACE_ROOT}/libs/foo/src/x.ts#frag`, PROJECT_ROOT, WORKSPACE_ROOT)).toBe('/ns/m/libs/foo/src/x.ts#frag');
		expect(rewriteFsAbsoluteToNsM(`/@fs${WORKSPACE_ROOT}/node_modules/papaparse/papaparse.js?v=1234`, PROJECT_ROOT, WORKSPACE_ROOT)).toBe('/ns/m/node_modules/papaparse/papaparse.js?v=1234');
	});

	it('returns null for /@fs/ paths outside both projectRoot and workspaceRoot', () => {
		// Defensive: paths that resolve nowhere we know about are left as
		// /@fs/... so the existing fall-through branches can take a swing
		// at them (e.g. /node_modules/<pkg>/ rewriting downstream).
		expect(rewriteFsAbsoluteToNsM('/@fs/Users/somebody-else/not-our-tree/foo.ts', PROJECT_ROOT, WORKSPACE_ROOT)).toBeNull();
		expect(rewriteFsAbsoluteToNsM('/@fs/etc/hosts', PROJECT_ROOT, WORKSPACE_ROOT)).toBeNull();
	});

	it('handles missing workspaceRoot (single-package layout) without breaking project-local rewrites', () => {
		// When projectRoot === workspaceRoot or no workspaceRoot is
		// detected, project-local rewrites must still work and
		// out-of-tree paths still return null.
		expect(rewriteFsAbsoluteToNsM(`/@fs${PROJECT_ROOT}/src/main.ts`, PROJECT_ROOT, null)).toBe('/ns/m/src/main.ts');
		expect(rewriteFsAbsoluteToNsM(`/@fs${PROJECT_ROOT}/src/main.ts`, PROJECT_ROOT, undefined)).toBe('/ns/m/src/main.ts');
		expect(rewriteFsAbsoluteToNsM(`/@fs${WORKSPACE_ROOT}/libs/foo/src/x.ts`, PROJECT_ROOT, null)).toBeNull();
	});

	it('does not double-rewrite when projectRoot equals workspaceRoot', () => {
		const root = '/Users/dev/standalone-app';
		expect(rewriteFsAbsoluteToNsM(`/@fs${root}/src/main.ts`, root, root)).toBe('/ns/m/src/main.ts');
		expect(rewriteFsAbsoluteToNsM(`/@fs${root}/node_modules/papaparse/papaparse.js`, root, root)).toBe('/ns/m/node_modules/papaparse/papaparse.js');
	});

	it('normalises trailing slashes on the supplied roots', () => {
		// `getMonorepoWorkspaceRoot` returns a path with no trailing slash
		// today, but defensive code paths should not break if a caller
		// hands in a trailing slash (or a relative path that path.resolve
		// expands).
		expect(rewriteFsAbsoluteToNsM(`/@fs${PROJECT_ROOT}/src/main.ts`, `${PROJECT_ROOT}/`, `${WORKSPACE_ROOT}/`)).toBe('/ns/m/src/main.ts');
		expect(rewriteFsAbsoluteToNsM(`/@fs${WORKSPACE_ROOT}/libs/foo/src/x.ts`, `${PROJECT_ROOT}/`, `${WORKSPACE_ROOT}/`)).toBe('/ns/m/libs/foo/src/x.ts');
	});

	it('returns null when /@fs/ has no leading slash after the prefix', () => {
		// `/@fs<not-a-slash>foo` is malformed; do not invent a rewrite.
		expect(rewriteFsAbsoluteToNsM('/@fs/', PROJECT_ROOT, WORKSPACE_ROOT)).toBeNull();
	});

	it('handles the URL-shaped roots emitted by Vite (no trailing slash, posix separators)', () => {
		// Sanity check that a fresh value from `process.cwd()` style inputs
		// works in both directions. This documents the expected shape so a
		// future caller doesn't need to re-derive it from the implementation.
		const proj = '/some/project/root';
		const ws = '/some';
		expect(rewriteFsAbsoluteToNsM(`/@fs${proj}/src/index.ts`, proj, ws)).toBe('/ns/m/src/index.ts');
		expect(rewriteFsAbsoluteToNsM(`/@fs${ws}/shared/src/index.ts`, proj, ws)).toBe('/ns/m/shared/src/index.ts');
	});
});
