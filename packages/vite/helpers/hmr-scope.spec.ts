import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { isWithinHmrScope, getHmrWatchIgnoreGlobs, getHmrSourceRoots } from './hmr-scope.js';
import { getProjectAppAbsolutePath } from './utils.js';
import { normalizeModuleId } from './normalize-id.js';

const asRoot = (p: string) => normalizeModuleId(p).replace(/\/+$/, '');

describe('isWithinHmrScope', () => {
	const roots = [asRoot('/ws/apps/safety/nativescript-safety/src'), asRoot('/ws/libs/xplat/core/src')];

	it('accepts files inside the app source dir', () => {
		expect(isWithinHmrScope('/ws/apps/safety/nativescript-safety/src/app.component.ts', roots)).toBe(true);
		expect(isWithinHmrScope('/ws/apps/safety/nativescript-safety/src/ui/release-note/release-note.component.html', roots)).toBe(true);
	});

	it('accepts files inside a configured shared library', () => {
		expect(isWithinHmrScope('/ws/libs/xplat/core/src/lib/services/foo.service.ts', roots)).toBe(true);
	});

	it('rejects the reported .env.azconfig and other project-root config files', () => {
		expect(isWithinHmrScope('/ws/apps/safety/nativescript-safety/.env.azconfig', roots)).toBe(false);
		expect(isWithinHmrScope('/ws/apps/safety/nativescript-safety/nativescript.config.ts', roots)).toBe(false);
		expect(isWithinHmrScope('/ws/apps/safety/nativescript-safety/package.json', roots)).toBe(false);
	});

	it('rejects native / generated dirs and node_modules', () => {
		expect(isWithinHmrScope('/ws/apps/safety/nativescript-safety/platforms/android/x.js', roots)).toBe(false);
		expect(isWithinHmrScope('/ws/apps/safety/nativescript-safety/hooks/after-prepare/x.js', roots)).toBe(false);
		expect(isWithinHmrScope('/ws/node_modules/@scope/lib/index.js', roots)).toBe(false);
		expect(isWithinHmrScope('/ws/apps/safety/nativescript-safety/.ns-vite-build/bundle.mjs', roots)).toBe(false);
	});

	it('does not treat a sibling dir with a shared prefix as in-scope', () => {
		// "/src-gen" must not match the "/src" root via a naive startsWith.
		expect(isWithinHmrScope('/ws/apps/safety/nativescript-safety/src-generated/x.ts', roots)).toBe(false);
	});

	it('handles Windows separators and query/hash suffixes', () => {
		const winRoots = [asRoot('C:/ws/apps/safety/nativescript-safety/src')];
		expect(isWithinHmrScope('C:\\ws\\apps\\safety\\nativescript-safety\\src\\app.ts', winRoots)).toBe(true);
		expect(isWithinHmrScope('C:\\ws\\apps\\safety\\nativescript-safety\\.env.azconfig', winRoots)).toBe(false);
		expect(isWithinHmrScope('/ws/apps/safety/nativescript-safety/src/app.component.ts?ngResource', roots)).toBe(true);
	});

	it('returns false for empty input or empty roots', () => {
		expect(isWithinHmrScope('', roots)).toBe(false);
		expect(isWithinHmrScope('/ws/apps/safety/nativescript-safety/src/app.ts', [])).toBe(false);
	});
});

describe('getHmrSourceRoots', () => {
	it('always includes the app source dir', () => {
		const appDir = asRoot(getProjectAppAbsolutePath());
		const roots = getHmrSourceRoots();
		expect(roots).toContain(appDir);
		// A file under the app dir is therefore in scope.
		expect(isWithinHmrScope(path.join(getProjectAppAbsolutePath(), 'app.ts'), roots)).toBe(true);
	});

	it('includes tsconfig-configured shared library roots (file alias → dir)', () => {
		const roots = getHmrSourceRoots({ paths: { '@org/lib': ['/ws/libs/lib/src/index.ts'] }, baseUrl: '.' });
		expect(roots).toContain(asRoot('/ws/libs/lib/src'));
	});
});

describe('getHmrWatchIgnoreGlobs', () => {
	it('ignores only heavy native/generated dirs (performance guard, not the correctness gate)', () => {
		const globs = getHmrWatchIgnoreGlobs();
		expect(globs).toEqual(['**/platforms/**', '**/hooks/**', '**/App_Resources/**', '**/.ns-vite-build/**']);
	});

	it('appends a custom dist output folder without duplicating the default', () => {
		expect(getHmrWatchIgnoreGlobs('.ns-vite-build')).not.toContain('**/.ns-vite-build/**/**');
		expect(getHmrWatchIgnoreGlobs('dist/custom')).toContain('**/dist/custom/**');
	});
});
