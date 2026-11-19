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
