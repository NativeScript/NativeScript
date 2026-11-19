import { describe, expect, it } from 'vitest';
import { getHmrWatchIgnoreGlobs } from './hmr-scope.js';

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
