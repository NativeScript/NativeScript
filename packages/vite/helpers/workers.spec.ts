import path from 'node:path';
import { describe, expect, it } from 'vitest';

import { viteWorkerAssetPathToNsMUrl, workerHmrUrlPlugin } from './workers.js';

// --- viteWorkerAssetPathToNsMUrl ---------------------------------------
//
// This helper takes Vite's emitted dev-server worker asset path (project-
// relative or `/@fs/`-absolute), strips the rewritable file extension, and
// returns the canonical `/ns/m/<rel>` URL the NativeScript HMR middleware
// serves. It must:
//
//   * Map project-relative paths the same way `/ns/m/` does (drop `.ts`,
//     `.js`, `.mjs`, `.cjs`, `.tsx`, `.jsx`).
//   * Map `/@fs/` paths that fall *under* the project or workspace root
//     by stripping the matching prefix.
//   * Refuse to map URLs without the `worker_file` query (so non-worker
//     `new URL(..., import.meta.url)` calls — assets, generic URLs — are
//     left to Vite's default handling).
//   * Refuse to map `/@fs/` paths outside both the project and the
//     workspace root (we'd have nowhere safe to anchor them; Vite's
//     default behaviour is fine for those).
//
// The fixed POSIX paths below stand in for a typical Nx workspace layout
// (`<workspace>/apps/<app>/src/...`) so the assertions don't depend on the
// machine running them.
const PROJECT_ROOT = '/abs/workspace/apps/console';
const WORKSPACE_ROOT = '/abs/workspace';

describe('viteWorkerAssetPathToNsMUrl', () => {
	it('maps a project-relative TS worker asset to /ns/m/ with the extension stripped', () => {
		const result = viteWorkerAssetPathToNsMUrl('/src/workers/light-controller/light-controller.worker.ts?worker_file&type=classic', PROJECT_ROOT, WORKSPACE_ROOT);
		expect(result).toBe('/ns/m/src/workers/light-controller/light-controller.worker');
	});

	it('strips every rewritable extension Vite may emit (.ts/.tsx/.mjs/.cjs/.js/.jsx)', () => {
		for (const ext of ['ts', 'tsx', 'mjs', 'cjs', 'js', 'jsx']) {
			const result = viteWorkerAssetPathToNsMUrl(`/src/workers/foo.worker.${ext}?worker_file&type=classic`, PROJECT_ROOT, WORKSPACE_ROOT);
			expect(result).toBe('/ns/m/src/workers/foo.worker');
		}
	});

	it('refuses to map URLs without the `worker_file` query (non-worker import.meta.url sites)', () => {
		// Generic `new URL('./foo.png', import.meta.url)` lookalikes — these
		// are the asset/url-loader path that NS already tolerates because
		// they're wrapped in try/catch. We must not rewrite them.
		expect(viteWorkerAssetPathToNsMUrl('/src/assets/foo.png?import', PROJECT_ROOT, WORKSPACE_ROOT)).toBeNull();
		expect(viteWorkerAssetPathToNsMUrl('/src/foo.ts', PROJECT_ROOT, WORKSPACE_ROOT)).toBeNull();
	});

	it('handles `worker_file` as a bare flag, with `&` continuation, and as the final query key', () => {
		// All three forms are how Vite spells the marker depending on the
		// surrounding query options. The helper must accept every shape.
		expect(viteWorkerAssetPathToNsMUrl('/src/foo.worker.ts?worker_file', PROJECT_ROOT, WORKSPACE_ROOT)).toBe('/ns/m/src/foo.worker');
		expect(viteWorkerAssetPathToNsMUrl('/src/foo.worker.ts?worker_file=1', PROJECT_ROOT, WORKSPACE_ROOT)).toBe('/ns/m/src/foo.worker');
		expect(viteWorkerAssetPathToNsMUrl('/src/foo.worker.ts?worker_file&type=classic', PROJECT_ROOT, WORKSPACE_ROOT)).toBe('/ns/m/src/foo.worker');
		expect(viteWorkerAssetPathToNsMUrl('/src/foo.worker.ts?something=1&worker_file&type=classic', PROJECT_ROOT, WORKSPACE_ROOT)).toBe('/ns/m/src/foo.worker');
	});

	it('rejects empty / non-string input defensively', () => {
		expect(viteWorkerAssetPathToNsMUrl('', PROJECT_ROOT, WORKSPACE_ROOT)).toBeNull();
		expect(viteWorkerAssetPathToNsMUrl(undefined as any, PROJECT_ROOT, WORKSPACE_ROOT)).toBeNull();
		expect(viteWorkerAssetPathToNsMUrl(null as any, PROJECT_ROOT, WORKSPACE_ROOT)).toBeNull();
	});

	describe('/@fs/ absolute paths (Vite uses these for files outside the project root)', () => {
		it('maps a path under the project root by stripping the project-root prefix', () => {
			const fsPath = `/@fs${PROJECT_ROOT}/src/workers/foo.worker.ts?worker_file&type=classic`;
			expect(viteWorkerAssetPathToNsMUrl(fsPath, PROJECT_ROOT, WORKSPACE_ROOT)).toBe('/ns/m/src/workers/foo.worker');
		});

		it('falls back to the workspace root for monorepo lib paths outside the app dir', () => {
			// `libs/xplat/...` sits outside `apps/console/` but inside the workspace,
			// which is the common monorepo case for shared lib files imported from
			// a worker entry. The helper should anchor at the workspace root.
			const fsPath = `/@fs${WORKSPACE_ROOT}/libs/xplat/utils/src/index.worker.ts?worker_file&type=classic`;
			expect(viteWorkerAssetPathToNsMUrl(fsPath, PROJECT_ROOT, WORKSPACE_ROOT)).toBe('/ns/m/libs/xplat/utils/src/index.worker');
		});

		it('returns null for absolute paths that fall outside both the project and the workspace root', () => {
			// We can't safely map e.g. /Users/foo/global/Library/... — there's no
			// route prefix that would resolve to that on the device. Better to
			// leave Vite's default behaviour in place and let any breakage
			// surface as a clear "module not found" rather than a wrong-route
			// 404 from NS.
			const fsPath = '/@fs/Users/foo/elsewhere/random.worker.ts?worker_file&type=classic';
			expect(viteWorkerAssetPathToNsMUrl(fsPath, PROJECT_ROOT, WORKSPACE_ROOT)).toBeNull();
		});

		it('returns null when the workspace root is unknown and the path is outside the project', () => {
			const fsPath = `/@fs${WORKSPACE_ROOT}/libs/xplat/utils/src/index.worker.ts?worker_file&type=classic`;
			// No workspace root → only project-root anchoring is available.
			expect(viteWorkerAssetPathToNsMUrl(fsPath, PROJECT_ROOT, null)).toBeNull();
		});
	});
});

// --- workerHmrUrlPlugin ------------------------------------------------
//
// The plugin runs as `enforce: 'post'` against Vite's already-transformed
// dev output. The shape it must match is the canonical output of Vite's
// built-in `workerImportMetaUrlPlugin`:
//
//   new Worker(new URL(/* @vite-ignore */ "/src/.../foo.worker.ts?worker_file&type=classic",
//                      '' + import.meta.url))
//
// (See `workerImportMetaUrlPlugin` in vite/dist/node/chunks/node.js — the
// `/* @vite-ignore */` and the empty-string `'' +` coercion are emitted
// unconditionally, and the asset path may use single quotes, double
// quotes, or backticks.) The plugin's job is to detect that exact shape
// and rewrite it to a string URL that routes through `/ns/m/` so the
// worker's transitive imports flow through our HMR pipeline.
//
// We test the plugin via its `Plugin.transform` hook directly, the same
// pattern `__tests__/angular-template-watch.spec.ts` uses for
// `angular-template-deps`.

function makeStubContext() {
	return {
		addWatchFile() {},
	};
}

function configurePlugin(plugin: ReturnType<typeof workerHmrUrlPlugin>, projectRoot: string) {
	// Vite calls `configResolved` once at startup with the resolved user
	// config; we mirror that here with the minimal shape the plugin
	// actually consumes (`config.root`). Workspace-root probing in the
	// plugin's `configResolved` walks up via `findMonorepoWorkspaceRoot`
	// looking for marker files (nx.json, pnpm-workspace.yaml, etc.). Our
	// fake `/abs/workspace/...` path doesn't exist, so the walk returns
	// `null` — which is exactly what we want for these tests, since the
	// `/@fs/` mapping cases are all covered directly by
	// `viteWorkerAssetPathToNsMUrl` above.
	const configResolved = (plugin as any).configResolved as (config: any) => void;
	configResolved.call(plugin, { root: projectRoot });
}

function callTransform(plugin: ReturnType<typeof workerHmrUrlPlugin>, code: string, id: string) {
	const transform = (plugin as any).transform as (code: string, id: string) => any;
	return transform.call(makeStubContext(), code, id);
}

describe('workerHmrUrlPlugin (transform)', () => {
	it('rewrites the canonical Vite worker shape to a /ns/m/ string URL', () => {
		const plugin = workerHmrUrlPlugin();
		configurePlugin(plugin, PROJECT_ROOT);

		const input = ['export function CreateLightControllerWorker() {', '  return new Worker(new URL(/* @vite-ignore */"/src/workers/light-controller/light-controller.worker.ts?worker_file&type=classic", \'\' + import.meta.url));', '}'].join('\n');

		const result = callTransform(plugin, input, path.join(PROJECT_ROOT, 'src/workers/light-controller/index.ts'));

		expect(result).not.toBeNull();
		expect(result.code).toContain('"/ns/m/src/workers/light-controller/light-controller.worker"');
		expect(result.code).toContain('__NS_HTTP_ORIGIN__');
		// The ASSERT line: the new URL+import.meta.url indirection is gone,
		// which is the entire reason this plugin exists.
		expect(result.code).not.toContain('new URL(');
		expect(result.code).not.toContain('import.meta.url');
	});

	it('preserves the trailing options object (e.g. `{ name, type }`) when present', () => {
		const plugin = workerHmrUrlPlugin();
		configurePlugin(plugin, PROJECT_ROOT);

		const input = "new Worker(new URL(/* @vite-ignore */\"/src/workers/foo.worker.ts?worker_file&type=classic\", '' + import.meta.url), { name: 'foo', type: 'classic' });";

		const result = callTransform(plugin, input, path.join(PROJECT_ROOT, 'src/index.ts'));

		expect(result).not.toBeNull();
		expect(result.code).toContain("{ name: 'foo', type: 'classic' }");
	});

	it('accepts every quote style Vite may emit for the asset path (single, double, backtick)', () => {
		const plugin = workerHmrUrlPlugin();
		configurePlugin(plugin, PROJECT_ROOT);

		for (const quote of ["'", '"', '`']) {
			const empty = quote === '`' ? '``' : `${quote}${quote}`;
			const input = `new Worker(new URL(/* @vite-ignore */${quote}/src/workers/foo.worker.ts?worker_file&type=classic${quote}, ${empty} + import.meta.url));`;

			const result = callTransform(plugin, input, path.join(PROJECT_ROOT, 'src/index.ts'));

			expect(result, `failed for quote=${quote}`).not.toBeNull();
			expect(result.code).toContain('"/ns/m/src/workers/foo.worker"');
		}
	});

	it('returns null (skips work) when the file contains no `new Worker` mention', () => {
		const plugin = workerHmrUrlPlugin();
		configurePlugin(plugin, PROJECT_ROOT);

		const code = 'export const x = 1;';
		expect(callTransform(plugin, code, path.join(PROJECT_ROOT, 'src/foo.ts'))).toBeNull();
	});

	it('returns null (skips work) when the file mentions `new Worker` but has no Vite-shaped match', () => {
		const plugin = workerHmrUrlPlugin();
		configurePlugin(plugin, PROJECT_ROOT);

		// Pre-Vite source — the user's untransformed code. By the time we
		// run, Vite has already rewritten this; if we ever see it, it's
		// because Vite *didn't* transform (e.g. wrong file type) and we
		// shouldn't make it worse.
		const code = "new Worker(new URL('./worker', import.meta.url));";
		expect(callTransform(plugin, code, path.join(PROJECT_ROOT, 'src/foo.ts'))).toBeNull();
	});

	it('skips files inside node_modules even if they contain a Vite worker shape', () => {
		// We intentionally leave 3rd-party packages alone — anything they
		// did with workers either already worked, or has its own
		// downstream patch. Rewriting them risks routing 3rd-party worker
		// code through `/ns/m/` paths that don't exist for that package.
		const plugin = workerHmrUrlPlugin();
		configurePlugin(plugin, PROJECT_ROOT);

		const code = 'new Worker(new URL(/* @vite-ignore */"/src/foo.worker.ts?worker_file&type=classic", \'\' + import.meta.url));';
		expect(callTransform(plugin, code, path.join(PROJECT_ROOT, 'node_modules/some-pkg/dist/index.js'))).toBeNull();
		expect(callTransform(plugin, code, path.join(PROJECT_ROOT, '.vite/deps/foo.js'))).toBeNull();
	});

	it('returns null when the asset path is outside the project + workspace (we hand back to Vite)', () => {
		const plugin = workerHmrUrlPlugin();
		configurePlugin(plugin, PROJECT_ROOT);

		const code = 'new Worker(new URL(/* @vite-ignore */"/@fs/Users/foo/elsewhere/random.worker.ts?worker_file&type=classic", \'\' + import.meta.url));';
		// No mapping found → leave the original (broken-but-not-our-bug)
		// shape so the developer sees Vite's error rather than a silent
		// "wrong worker URL" runtime crash.
		expect(callTransform(plugin, code, path.join(PROJECT_ROOT, 'src/foo.ts'))).toBeNull();
	});

	it('rewrites multiple worker creations in a single module', () => {
		const plugin = workerHmrUrlPlugin();
		configurePlugin(plugin, PROJECT_ROOT);

		const input = ['export const a = new Worker(new URL(/* @vite-ignore */"/src/workers/effect/effect.worker.ts?worker_file&type=classic", \'\' + import.meta.url));', 'export const b = new Worker(new URL(/* @vite-ignore */"/src/workers/transition/transition.worker.ts?worker_file&type=classic", \'\' + import.meta.url));'].join('\n');

		const result = callTransform(plugin, input, path.join(PROJECT_ROOT, 'src/index.ts'));

		expect(result).not.toBeNull();
		expect(result.code).toContain('"/ns/m/src/workers/effect/effect.worker"');
		expect(result.code).toContain('"/ns/m/src/workers/transition/transition.worker"');
		expect(result.code).not.toContain('import.meta.url');
	});

	it('returns null for the source map (Vite recomposes from upstream maps; per-Worker shift is small)', () => {
		const plugin = workerHmrUrlPlugin();
		configurePlugin(plugin, PROJECT_ROOT);

		const input = 'new Worker(new URL(/* @vite-ignore */"/src/workers/foo.worker.ts?worker_file&type=classic", \'\' + import.meta.url));';
		const result = callTransform(plugin, input, path.join(PROJECT_ROOT, 'src/index.ts'));

		expect(result).not.toBeNull();
		expect(result.map).toBeNull();
	});
});
