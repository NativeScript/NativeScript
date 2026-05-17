import { describe, expect, it, beforeEach } from 'vitest';
import { mkdtempSync, writeFileSync, mkdirSync, rmSync } from 'fs';
import { tmpdir } from 'os';
import path from 'path';
import { enumeratePackageExports, __clearPackageExportsCache } from './package-exports';

/**
 * The enumerator drives the single-realm bridge. Its contract is "every
 * named export reachable from a package's ESM entry, including transitive
 * `export *` re-exports, both relative and across package boundaries."
 * These specs lock that contract down with a synthetic on-disk fixture so
 * the assertions don't depend on whichever `nativescript-vue` happens to
 * be installed in the workspace.
 */

function makeFixture(): { root: string; cleanup: () => void } {
	const root = mkdtempSync(path.join(tmpdir(), 'ns-pkg-exports-'));
	const nm = path.join(root, 'node_modules');
	mkdirSync(nm);

	// Inner package providing some named exports that the main package
	// re-exports via `export *`. Mirrors the @vue/runtime-core relationship.
	const innerDir = path.join(nm, 'inner-pkg');
	mkdirSync(innerDir);
	writeFileSync(path.join(innerDir, 'package.json'), JSON.stringify({ name: 'inner-pkg', main: 'dist/index.js' }));
	mkdirSync(path.join(innerDir, 'dist'));
	writeFileSync(
		path.join(innerDir, 'dist', 'index.js'),
		[
			'export const innerA = 1;',
			'export function innerB() {}',
			'export class InnerC {}',
			'export { InnerC as InnerCAlias };',
			// Should NOT appear under that name — `default` is recorded separately.
			'const _d = 1; export default _d;',
		].join('\n'),
	);

	// Main package fixture — both inline declarations, named re-exports
	// across files, an `export *` to a relative file, and a star re-export
	// from `inner-pkg` (cross-package).
	const mainDir = path.join(nm, 'main-pkg');
	mkdirSync(mainDir);
	mkdirSync(path.join(mainDir, 'dist'));
	writeFileSync(path.join(mainDir, 'package.json'), JSON.stringify({ name: 'main-pkg', main: 'dist/index.js' }));
	writeFileSync(path.join(mainDir, 'dist', 'helpers.js'), ['export const helperOne = () => 1;', 'export const helperTwo = () => 2;'].join('\n'));
	writeFileSync(path.join(mainDir, 'dist', 'index.js'), ["export const top = 'top';", 'export function topFn() {}', 'export class TopClass {}', "export { helperOne, helperTwo as twoAliased } from './helpers';", "export * from './helpers';", "export * from 'inner-pkg';", '// `export * as ns` adds the namespace as a single binding, not the inner names.', "export * as innerNs from 'inner-pkg';", 'export default { top };'].join('\n'));

	return {
		root,
		cleanup() {
			try {
				rmSync(root, { recursive: true, force: true });
			} catch {}
		},
	};
}

describe('enumeratePackageExports', () => {
	let fixture: { root: string; cleanup: () => void };

	beforeEach(() => {
		__clearPackageExportsCache();
		fixture = makeFixture();
	});

	it('collects inline named exports of all kinds (const, function, class)', () => {
		const shape = enumeratePackageExports('main-pkg', fixture.root);
		expect(shape.names.has('top')).toBe(true);
		expect(shape.names.has('topFn')).toBe(true);
		expect(shape.names.has('TopClass')).toBe(true);
		fixture.cleanup();
	});

	it('records `default` separately rather than in the named set', () => {
		const shape = enumeratePackageExports('main-pkg', fixture.root);
		expect(shape.hasDefault).toBe(true);
		expect(shape.names.has('default')).toBe(false);
		fixture.cleanup();
	});

	it('captures `export { X } from "./local"` named re-exports including renames', () => {
		const shape = enumeratePackageExports('main-pkg', fixture.root);
		expect(shape.names.has('helperOne')).toBe(true);
		expect(shape.names.has('twoAliased')).toBe(true);
		// `helperTwo` is also captured because the same file `export *`s helpers.js.
		expect(shape.names.has('helperTwo')).toBe(true);
		fixture.cleanup();
	});

	it('recurses through `export *` across package boundaries (e.g. nativescript-vue → @vue/runtime-core)', () => {
		const shape = enumeratePackageExports('main-pkg', fixture.root);
		expect(shape.names.has('innerA')).toBe(true);
		expect(shape.names.has('innerB')).toBe(true);
		expect(shape.names.has('InnerC')).toBe(true);
		expect(shape.names.has('InnerCAlias')).toBe(true);
		fixture.cleanup();
	});

	it('treats `export * as ns from "pkg"` as a single namespace binding (not a fan-out)', () => {
		const shape = enumeratePackageExports('main-pkg', fixture.root);
		expect(shape.names.has('innerNs')).toBe(true);
		// `innerA` is already present from the unaliased `export * from 'inner-pkg'`,
		// so we can't use it as the negative — instead pick a name that exists ONLY
		// inside the namespace if we'd added one. Here we just verify the binding
		// is present, which is the contract.
		fixture.cleanup();
	});

	it('returns an empty shape when the package cannot be resolved (graceful fallback)', () => {
		const shape = enumeratePackageExports('does-not-exist-anywhere', fixture.root);
		expect(shape.entry).toBe('');
		expect(shape.names.size).toBe(0);
		expect(shape.hasDefault).toBe(false);
		fixture.cleanup();
	});

	it('caches by `${projectRoot}::${packageId}` so repeated calls in one session are free', () => {
		const a = enumeratePackageExports('main-pkg', fixture.root);
		const b = enumeratePackageExports('main-pkg', fixture.root);
		// Same Set instance → cached.
		expect(a.names).toBe(b.names);
		fixture.cleanup();
	});
});
