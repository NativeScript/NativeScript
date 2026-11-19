import { describe, expect, it } from 'vitest';
import { getHmrWatchIgnoreGlobs, getNodeModulesWatchGlobs } from './hmr-scope.js';

describe('getNodeModulesWatchGlobs', () => {
	it('negates each named package and, as directories only, node_modules and the scopes on the way', () => {
		expect(getNodeModulesWatchGlobs(['rxjs', '@nativescript/core', '@nativescript/theme', 'rxjs'])).toEqual(['!**/node_modules', '!**/node_modules/@nativescript', '!**/node_modules/rxjs/**', '!**/node_modules/@nativescript/core/**', '!**/node_modules/@nativescript/theme/**']);
	});

	it('escapes glob syntax in a package name', () => {
		expect(getNodeModulesWatchGlobs(['legacy(pkg)!'])).toEqual(['!**/node_modules', '!**/node_modules/legacy\\(pkg\\)\\!/**']);
	});

	it('is empty without packages, never a negation of all of node_modules', () => {
		expect(getNodeModulesWatchGlobs([])).toEqual([]);
		expect(getNodeModulesWatchGlobs(['a', '@s/b'])).not.toContain('!**/node_modules/**');
	});
});

describe('getHmrWatchIgnoreGlobs', () => {
	it('ignores only heavy native/generated dirs', () => {
		const globs = getHmrWatchIgnoreGlobs();
		expect(globs).toEqual(['**/platforms/**', '**/hooks/**', '**/App_Resources/**', '**/.ns-vite-build/**']);
	});

	it('appends a custom dist output folder without duplicating the default', () => {
		expect(getHmrWatchIgnoreGlobs('.ns-vite-build')).not.toContain('**/.ns-vite-build/**/**');
		expect(getHmrWatchIgnoreGlobs('dist/custom')).toContain('**/dist/custom/**');
	});
});
