import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { clearSolidDevEntryCache, getSolidDevEntryNsmPath, getSolidJsDevEntryRelPath, isSolidRuntimePackage, resolveSolidDevEntry } from './solid-runtime.js';

// Export maps copied from the published packages.
const SOLID_1_9_9_EXPORTS = {
	'.': {
		browser: { types: './types/index.d.ts', import: './dist/solid.js', require: './dist/solid.cjs', development: { types: './types/index.d.ts', import: './dist/dev.js', require: './dist/dev.cjs' } },
		development: { types: './types/index.d.ts', import: './dist/dev.js', require: './dist/dev.cjs' },
		import: './dist/solid.js',
	},
};
const SOLID_2_RC_0_EXPORTS = {
	'.': {
		browser: { import: { default: './dist/solid.js' }, development: { import: { default: './dist/dev.js' } } },
		development: { import: { default: './dist/dev.js' } },
		import: { default: './dist/solid.js' },
	},
};
const SOLID_2_RC_19_EXPORTS = {
	'.': {
		browser: { types: './types/index.d.ts', default: './dist/solid.js', development: { types: './types/index.d.ts', default: './dist/solid.dev.js' } },
		development: { types: './types/index.d.ts', default: './dist/solid.dev.js' },
		default: './dist/solid.js',
	},
	'./internal': { default: './dist/internal.js' },
};
const SIGNALS_RC_0_EXPORTS = { '.': { import: { test: './dist/dev.js', types: './dist/types/index.d.ts', default: './dist/prod/index.js', development: './dist/dev.js' } } };
const SIGNALS_RC_21_EXPORTS = { '.': { types: './dist/types/index.d.ts', test: './dist/dev.js', development: './dist/dev.js', observe: './dist/observe/index.js', default: './dist/prod/index.js' } };

let root: string;

function installPackage(name: string, exportsMap: unknown, files: string[], base = root): void {
	const dir = path.join(base, 'node_modules', ...name.split('/'));
	mkdirSync(dir, { recursive: true });
	writeFileSync(path.join(dir, 'package.json'), JSON.stringify({ name, exports: exportsMap }));
	for (const file of files) {
		mkdirSync(path.dirname(path.join(dir, file)), { recursive: true });
		writeFileSync(path.join(dir, file), '');
	}
}

beforeEach(() => {
	root = mkdtempSync(path.join(tmpdir(), 'ns-solid-runtime-'));
	clearSolidDevEntryCache();
});

afterEach(() => {
	rmSync(root, { recursive: true, force: true });
});

describe('resolveSolidDevEntry', () => {
	it.each([
		['1.9.9', SOLID_1_9_9_EXPORTS, ['dist/dev.js', 'dist/solid.js'], 'dist/dev.js'],
		['2.0.0-rc.0', SOLID_2_RC_0_EXPORTS, ['dist/dev.js', 'dist/solid.js'], 'dist/dev.js'],
		['2.0.0-rc.19', SOLID_2_RC_19_EXPORTS, ['dist/solid.dev.js', 'dist/solid.js'], 'dist/solid.dev.js'],
	])('resolves solid-js@%s to its dev build', (_version, exportsMap, files, expected) => {
		installPackage('solid-js', exportsMap, files);
		expect(resolveSolidDevEntry('solid-js', root)).toEqual({ absPath: path.join(root, 'node_modules/solid-js', expected), relPath: expected });
	});

	it.each([
		['2.0.0-rc.0', SIGNALS_RC_0_EXPORTS],
		['2.0.0-rc.21', SIGNALS_RC_21_EXPORTS],
	])('resolves @solidjs/signals@%s to dist/dev.js regardless of condition order', (_version, exportsMap) => {
		installPackage('@solidjs/signals', exportsMap, ['dist/dev.js', 'dist/prod/index.js']);
		expect(resolveSolidDevEntry('@solidjs/signals', root)?.relPath).toBe('dist/dev.js');
	});

	it('finds packages hoisted above the starting directory', () => {
		installPackage('@solidjs/universal', { '.': { development: { default: './dist/universal.dev.js' }, default: './dist/universal.js' } }, ['dist/universal.dev.js']);
		const nested = path.join(root, 'node_modules', 'solid-js', 'dist');
		mkdirSync(nested, { recursive: true });
		expect(resolveSolidDevEntry('@solidjs/universal', nested)?.relPath).toBe('dist/universal.dev.js');
	});

	it('returns null when the exports map names no dev build', () => {
		installPackage('@solidjs/web', { '.': { default: './dist/web.js' } }, ['dist/web.js']);
		expect(resolveSolidDevEntry('@solidjs/web', root)).toBeNull();
	});

	it('returns null when the mapped dev file is missing on disk', () => {
		installPackage('@solidjs/signals', SIGNALS_RC_21_EXPORTS, ['dist/prod/index.js']);
		expect(resolveSolidDevEntry('@solidjs/signals', root)).toBeNull();
	});

	it('returns null for uninstalled and non-Solid packages', () => {
		expect(resolveSolidDevEntry('@solidjs/signals', root)).toBeNull();
		installPackage('vue', { '.': { development: './dist/vue.dev.js' } }, ['dist/vue.dev.js']);
		expect(resolveSolidDevEntry('vue', root)).toBeNull();
	});
});

describe('getSolidDevEntryNsmPath', () => {
	it('falls back to the legacy solid-js layout when solid-js is not found', () => {
		expect(getSolidJsDevEntryRelPath(root)).toBe('dist/dev.js');
		expect(getSolidDevEntryNsmPath('solid-js', root)).toBe('/ns/m/node_modules/solid-js/dist/dev.js');
	});

	it('builds /ns/m URLs from each package dev build', () => {
		installPackage('solid-js', SOLID_2_RC_19_EXPORTS, ['dist/solid.dev.js']);
		installPackage('@solidjs/signals', SIGNALS_RC_21_EXPORTS, ['dist/dev.js']);
		expect(getSolidDevEntryNsmPath('solid-js', root)).toBe('/ns/m/node_modules/solid-js/dist/solid.dev.js');
		expect(getSolidDevEntryNsmPath('@solidjs/signals', root)).toBe('/ns/m/node_modules/@solidjs/signals/dist/dev.js');
	});

	it('returns null for a non-solid-js package without a dev build', () => {
		expect(getSolidDevEntryNsmPath('@solidjs/web', root)).toBeNull();
	});
});

describe('isSolidRuntimePackage', () => {
	it('matches only exact runtime package roots', () => {
		expect(isSolidRuntimePackage('@solidjs/signals')).toBe(true);
		expect(isSolidRuntimePackage('solid-js/internal')).toBe(false);
		expect(isSolidRuntimePackage('solid-navigation')).toBe(false);
	});
});
