import fs from 'fs';
import path from 'path';

/**
 * Why this helper exists
 * ----------------------
 *
 * Vite's depscanner happily pre-bundles every bare specifier the app
 * imports. For a Solid library that publishes pre-compiled-but-still-JSX
 * files (e.g. `solid-navigation`'s `dist/src/*.jsx`), the pre-bundle output
 * lands at `node_modules/.vite/deps/<pkg>.js` with the JSX intact —
 * rolldown's depscanner doesn't run Solid's JSX transform (that lives in
 * `vite-plugin-solid`'s `transform` hook, which only matches files whose
 * id ends in `.jsx`/`.tsx`).
 *
 * Vite then runs `vite:import-analysis` on the `.js` output, hits the
 * first JSX expression, and aborts the dev server's pre-transform with:
 *
 *   Failed to parse source for import analysis because the content
 *   contains invalid JS syntax. If you are using JSX, make sure to
 *   name the file with the .jsx or .tsx extension.
 *   File: /…/.vite/deps/<pkg>.js:51:32
 *
 * The fix: when a project depends on a Solid library that ships `.jsx`
 * (or `.tsx`) source files in its package directory, mark that package
 * as `optimizeDeps.exclude` so Vite serves it through the regular dev
 * pipeline, where `vite-plugin-solid`'s `transform` hook matches the
 * original `.jsx` id and applies the Solid babel preset.
 *
 * Detection rules — biased toward false negatives so we never wrongly
 * exclude a package that Vite must pre-bundle (esp. CJS-only deps that
 * need esm interop). A package is excluded only when ALL of the
 * following hold:
 *
 *   1. It declares `solid-js` or `@nativescript-community/solid-js` in
 *      `dependencies` / `peerDependencies` / `devDependencies`. This is
 *      a strong signal that the package's published artifacts are
 *      meant to be processed by a Solid-aware JSX transformer.
 *   2. Its package directory contains at least one `.jsx` / `.tsx`
 *      source file under `dist` / `lib` / `build` / `es` / `esm` /
 *      `out` (the common published-output dirs) or directly at the
 *      package root. We deliberately skip `node_modules`, `src` (raw
 *      sources, not what `main` points to), and test dirs.
 *
 * Both checks are scoped to packages installed in the app's
 * `node_modules` (plus the monorepo's hoisted `node_modules`, if any)
 * — we never recurse into transitive nested copies, since those are
 * also reachable from the same top-level scan once Vite resolves them.
 */

const PUBLISHED_OUTPUT_DIRS = new Set(['dist', 'lib', 'build', 'es', 'esm', 'out']);
// Always-skip subdirs regardless of depth: nested copies, test fixtures,
// docs, and example apps. Notably `src` is NOT in here because a published
// bundle may use `dist/src/<file>.jsx` as its layout (e.g. `solid-navigation`).
// `src/` at the *package root* is rejected separately by the
// "depth 0 must be a published-output dir" gate below.
const ALWAYS_SKIP_DIR_NAMES = new Set(['node_modules', 'test', 'tests', '__tests__', 'spec', 'specs', 'docs', 'examples', 'example', '.git', '.cache']);
const JSX_EXT_RE = /\.(jsx|tsx)$/;
const MAX_SCAN_DEPTH = 4;

function isSolidConsumer(pkgJson: Record<string, any>): boolean {
	const buckets = ['dependencies', 'peerDependencies', 'devDependencies', 'optionalDependencies'] as const;
	for (const key of buckets) {
		const deps = pkgJson[key];
		if (!deps || typeof deps !== 'object') continue;
		if (deps['solid-js']) return true;
		if (deps['@nativescript-community/solid-js']) return true;
	}
	return false;
}

function hasJsxFile(dir: string, depth = 0): boolean {
	if (depth > MAX_SCAN_DEPTH) return false;
	let entries: fs.Dirent[];
	try {
		entries = fs.readdirSync(dir, { withFileTypes: true });
	} catch {
		return false;
	}
	for (const entry of entries) {
		if (entry.isFile() && JSX_EXT_RE.test(entry.name)) {
			return true;
		}
		if (entry.isDirectory()) {
			if (entry.name.startsWith('.')) continue;
			if (ALWAYS_SKIP_DIR_NAMES.has(entry.name)) continue;
			// At depth 0 (package root) only descend into known
			// published-output dirs so a sibling `src/` (raw sources)
			// can't flag the package on its own. Deeper levels are
			// inside a publish dir already, so any subdir (incl. `src`)
			// is fair game.
			if (depth === 0 && !PUBLISHED_OUTPUT_DIRS.has(entry.name)) continue;
			if (hasJsxFile(path.join(dir, entry.name), depth + 1)) return true;
		}
	}
	return false;
}

function scanDirectoryForJsxPackages(nodeModulesDir: string, result: Set<string>, scope = ''): void {
	let entries: fs.Dirent[];
	try {
		entries = fs.readdirSync(nodeModulesDir, { withFileTypes: true });
	} catch {
		return;
	}
	for (const entry of entries) {
		if (!entry.isDirectory()) continue;
		if (entry.name.startsWith('.')) continue;
		if (entry.name === 'node_modules') continue;
		const entryPath = path.join(nodeModulesDir, entry.name);
		if (!scope && entry.name.startsWith('@')) {
			scanDirectoryForJsxPackages(entryPath, result, entry.name);
			continue;
		}
		const pkgName = scope ? `${scope}/${entry.name}` : entry.name;
		if (result.has(pkgName)) continue;
		const pkgJsonPath = path.join(entryPath, 'package.json');
		if (!fs.existsSync(pkgJsonPath)) continue;
		let pkgJson: any;
		try {
			pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'));
		} catch {
			continue;
		}
		if (!isSolidConsumer(pkgJson)) continue;
		if (!hasJsxFile(entryPath)) continue;
		result.add(pkgName);
	}
}

/**
 * Find installed packages whose pre-bundle output would smuggle JSX into
 * Vite's import-analysis stage. Returned names are safe to drop into
 * `optimizeDeps.exclude` — the dev server will serve them through the
 * normal module pipeline, where `vite-plugin-solid` can transform their
 * original `.jsx`/`.tsx` files.
 *
 * The function is intentionally synchronous and best-effort: filesystem
 * errors are swallowed, missing directories are skipped, and the scan
 * caps at {@link MAX_SCAN_DEPTH} levels per package. Callers should
 * treat the empty-array result as "no exclusions needed", not "scan
 * failed". A nullable `monorepoRoot` is accepted so workspace hoisting
 * is covered without forcing every caller to compute it.
 */
export function findSolidPackagesShippingJsx(projectRoot: string, monorepoRoot?: string | null): string[] {
	const found = new Set<string>();
	const seenDirs = new Set<string>();
	const scanDirs: string[] = [];
	const projectNodeModules = path.resolve(projectRoot, 'node_modules');
	scanDirs.push(projectNodeModules);
	if (monorepoRoot && path.resolve(monorepoRoot) !== path.resolve(projectRoot)) {
		const monorepoNodeModules = path.resolve(monorepoRoot, 'node_modules');
		scanDirs.push(monorepoNodeModules);
	}
	for (const dir of scanDirs) {
		const key = path.resolve(dir);
		if (seenDirs.has(key)) continue;
		seenDirs.add(key);
		if (!fs.existsSync(dir)) continue;
		scanDirectoryForJsxPackages(dir, found);
	}
	return Array.from(found).sort();
}
