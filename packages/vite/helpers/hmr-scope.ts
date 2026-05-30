// Defines which files HMR is allowed to react to; an allowlist driven by the
// project's own configuration.

import { getProjectAppAbsolutePath } from './utils.js';
import { getTsConfigAliasRoots } from './ts-config-paths.js';
import { normalizeModuleId } from './normalize-id.js';

// Canonical root form: forward slashes, uppercase Windows drive, no trailing slash.
function asRoot(p: string): string {
	return normalizeModuleId(String(p || '')).replace(/\/+$/, '');
}

/**
 * Absolute directories HMR is allowed to react to:
 *   - the app source dir (`appPath`, default `src`)
 *   - shared-library roots from tsconfig `paths` (monorepo libs)
 *
 * Pass the project's tsconfig data (`{ paths, baseUrl }` from `getTsConfigData`)
 * to include configured workspace libraries. Always includes the app source dir.
 */
export function getHmrSourceRoots(tsConfig?: { paths?: Record<string, string[]>; baseUrl?: string }): string[] {
	const roots = new Set<string>();
	const appDir = asRoot(getProjectAppAbsolutePath());
	if (appDir) roots.add(appDir);
	for (const aliasRoot of getTsConfigAliasRoots({ paths: tsConfig?.paths, baseUrl: tsConfig?.baseUrl })) {
		const r = asRoot(aliasRoot);
		if (r) roots.add(r);
	}
	return [...roots];
}

/**
 * True when `file` lives inside one of the HMR source roots (app source dir or a
 * configured shared-library root). Accepts absolute paths with either separator
 * style and strips any query/hash suffix (`…/app.component.ts?ngResource`).
 */
export function isWithinHmrScope(file: string, roots: string[]): boolean {
	if (!file || !roots || roots.length === 0) return false;
	const f = normalizeModuleId(String(file).replace(/[?#].*$/, ''));
	for (const root of roots) {
		if (!root) continue;
		if (f === root || f.startsWith(root + '/')) return true;
	}
	return false;
}

/**
 * Minimal glob list for `server.watch.ignored`. This is a *performance* guard,
 * NOT the correctness gate (that's the {@link isWithinHmrScope} allowlist applied
 * in `handleHotUpdate`). It keeps chokidar from walking the large native/generated
 * trees that live under the app root. Vite already ignores `node_modules` and
 * `.git` by default; these are the NativeScript-specific additions.
 */
export function getHmrWatchIgnoreGlobs(distOutputFolder?: string): string[] {
	const globs = ['**/platforms/**', '**/hooks/**', '**/App_Resources/**', '**/.ns-vite-build/**'];
	if (distOutputFolder) {
		const clean = distOutputFolder
			.replace(/\\/g, '/')
			.replace(/^\.\/+/, '')
			.replace(/\/+$/, '');
		if (clean && clean !== '.ns-vite-build') {
			globs.push(`**/${clean}/**`);
		}
	}
	return globs;
}
