/**
 * Minimal glob list for `server.watch.ignored`. It keeps chokidar from walking
 * the large native/generated trees that live under the app root. Vite already
 * ignores `node_modules` and `.git` by default; these are the NativeScript-specific
 * additions.
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

const GLOB_SPECIAL = /[*?[\]{}()!]/g;

/**
 * `server.watch.ignored` negations that let Vite's watcher report edits to
 * the named installed packages (`--env.watchNodeModules`). A negation wins
 * over every ignore glob, in any order.
 *
 * Chokidar skips an ignored directory's contents, except with macOS
 * FSEvents, which filters events instead. So the `node_modules` and scope
 * directories on the way are un-ignored too, as directories only: their
 * other entries stay ignored. Never all of `node_modules`, which would also
 * watch the optimizer's cache directory.
 */
export function getNodeModulesWatchGlobs(packageNames: Iterable<string>): string[] {
	const escape = (value: string) => value.replace(GLOB_SPECIAL, '\\$&');
	const names = [...new Set(packageNames)];
	if (!names.length) return [];
	const scopes = new Set(names.filter((name) => name.startsWith('@') && name.includes('/')).map((name) => name.split('/')[0]));
	return ['!**/node_modules', ...[...scopes].map((scope) => `!**/node_modules/${escape(scope)}`), ...names.map((name) => `!**/node_modules/${escape(name)}/**`)];
}
