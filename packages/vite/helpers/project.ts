import { existsSync, readFileSync } from 'fs';
import { dirname, join, resolve } from 'path';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);

export function getProjectRootPath(): string {
	return process.cwd();
}

// Markers that indicate the directory is a monorepo workspace root. Vite's
// own `searchForWorkspaceRoot` only knows about pnpm/lerna/yarn|npm
// `workspaces` and Deno; this list extends it to cover popular JS/TS
// monorepo tools (Nx, Rush, Turborepo) and any future tool by simply adding
// a marker file name. The order doesn't matter — we return the first
// ancestor that has any one of them.
//
// Why this matters: when an app lives at `apps/<name>/` inside a monorepo,
// `process.cwd()` (and therefore Vite's `config.root`) is the app dir. The
// hoisted `node_modules/` is at the workspace root. If Vite's default
// `fs.allow` doesn't reach that high, every transform-time fs read of a
// hoisted package fails with `Failed to load url … Does the file exist?`
// even though the file is right there on disk. The fix is to widen
// `server.fs.allow` to the detected workspace root.
const MONOREPO_WORKSPACE_MARKERS = [
	// Standard JS package-manager workspace files (pnpm/yarn-classic/lerna).
	'pnpm-workspace.yaml',
	'pnpm-workspace.yml',
	'lerna.json',
	// Build orchestrators that are monorepo-by-design.
	'nx.json',
	'rush.json',
	'turbo.json',
	// Deno workspaces.
	'deno.json',
	'deno.jsonc',
];

function packageJsonHasWorkspaces(dir: string): boolean {
	const pkgPath = join(dir, 'package.json');
	if (!existsSync(pkgPath)) return false;
	try {
		const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
		return !!(pkg && pkg.workspaces);
	} catch {
		return false;
	}
}

function denoConfigHasWorkspace(dir: string): boolean {
	for (const name of ['deno.json', 'deno.jsonc']) {
		const p = join(dir, name);
		if (!existsSync(p)) continue;
		try {
			const cfg = JSON.parse(readFileSync(p, 'utf-8'));
			if (cfg && cfg.workspace) return true;
		} catch {}
	}
	return false;
}

/**
 * Walk up from `start` looking for the nearest monorepo workspace root.
 *
 * Returns the absolute path of the workspace root, or `null` if none of
 * the supported markers are found before reaching the filesystem root. The
 * search returns the FIRST matching ancestor — so a deeply nested app dir
 * inside an Nx monorepo that happens to also live inside a parent pnpm
 * workspace returns the Nx root (closer to the app) rather than the outer
 * pnpm one. This matches Vite's own `searchForWorkspaceRoot` behaviour.
 *
 * Recognized markers (see {@link MONOREPO_WORKSPACE_MARKERS}):
 *  - `pnpm-workspace.yaml` / `pnpm-workspace.yml`
 *  - `lerna.json`
 *  - `nx.json`        (Nx)
 *  - `rush.json`      (Rush)
 *  - `turbo.json`     (Turborepo)
 *  - `deno.json` / `deno.jsonc` containing a `workspace` field
 *  - `package.json` containing a `workspaces` field (npm/yarn workspaces)
 */
export function findMonorepoWorkspaceRoot(start: string = getProjectRootPath()): string | null {
	let current = resolve(start);
	while (true) {
		for (const marker of MONOREPO_WORKSPACE_MARKERS) {
			if (marker.startsWith('deno.')) {
				if (denoConfigHasWorkspace(current)) return current;
				continue;
			}
			if (existsSync(join(current, marker))) return current;
		}
		if (packageJsonHasWorkspaces(current)) return current;
		const parent = dirname(current);
		if (!parent || parent === current) return null;
		current = parent;
	}
}

const monorepoWorkspaceRootCache = new Map<string, string | null>();

/**
 * Memoized variant of {@link findMonorepoWorkspaceRoot}.
 *
 * The dev server resolves hoisted `node_modules/<pkg>/...` candidates on
 * every `/ns/m/` request, and each lookup walks the directory tree once
 * doing `existsSync` calls. Since the workspace layout doesn't change at
 * runtime, the result is safe to cache per `start` directory for the
 * lifetime of the dev server process.
 */
export function getMonorepoWorkspaceRoot(start: string = getProjectRootPath()): string | null {
	const key = resolve(start);
	if (monorepoWorkspaceRootCache.has(key)) {
		return monorepoWorkspaceRootCache.get(key) ?? null;
	}
	const result = findMonorepoWorkspaceRoot(key);
	monorepoWorkspaceRootCache.set(key, result);
	return result;
}

/**
 * Clear the {@link getMonorepoWorkspaceRoot} memoization cache. Intended
 * for tests that mutate the filesystem inside a temp dir between calls.
 */
export function clearMonorepoWorkspaceRootCache(): void {
	monorepoWorkspaceRootCache.clear();
}

// Get current directory for ES modules (equivalent to __dirname)
export const __dirname = import.meta.dirname;

interface IPackageJson {
	name?: string;
	main?: string;
	dependencies?: {
		[name: string]: string;
	};
	devDependencies?: {
		[name: string]: string;
	};
	// todo: add additional fields as we require them
}

/**
 * Utility function to get the contents of the project package.json
 */
export function getPackageJson() {
	return require(getProjectFilePath('package.json')) as IPackageJson;
}

/**
 * Utility to get project files relative to the project root.
 * @param filePath path to get
 */
export function getProjectFilePath(filePath: string): string {
	return resolve(getProjectRootPath(), filePath);
}

export function getProjectTSConfigPath(): string | undefined {
	return [getProjectFilePath('tsconfig.app.json'), getProjectFilePath('tsconfig.json')].find((path) => existsSync(path));
}
