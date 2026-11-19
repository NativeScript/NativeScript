import { describe, expect, it, vi } from 'vitest';
import { createPreBundleSourceWatch, installedPackageDir, isInstalledPackageFile, preBundleSourceFiles } from './prebundle-watch.js';

describe('installedPackageDir', () => {
	it('returns the package directory after the last node_modules segment', () => {
		expect(installedPackageDir('/app/node_modules/tslib/tslib.es6.mjs', '/')).toBe('/app/node_modules/tslib');
		expect(installedPackageDir('/app/node_modules/@angular/core/fesm2022/core.mjs', '/')).toBe('/app/node_modules/@angular/core');
		expect(installedPackageDir('/app/node_modules/a/node_modules/b/index.js', '/')).toBe('/app/node_modules/a/node_modules/b');
	});

	it('is undefined outside an installed package', () => {
		expect(installedPackageDir('/repo/packages/core/index.ts', '/')).toBeUndefined();
		expect(installedPackageDir('/app/node_modules/tslib', '/')).toBeUndefined();
		expect(installedPackageDir('/app/node_modules/@scope/pkg', '/')).toBeUndefined();
	});
});

describe('preBundleSourceFiles', () => {
	it('resolves sources against the map file and its sourceRoot, dropping virtual modules', () => {
		const map = { sources: ['../../tslib/tslib.es6.mjs', '\0rolldown/runtime.js', 'rolldown:runtime', null], sourceRoot: '' };
		expect(preBundleSourceFiles(map, '/app/node_modules/.vite/deps/tslib.js.map')).toEqual(['/app/node_modules/tslib/tslib.es6.mjs']);
		expect(preBundleSourceFiles({ sources: ['tslib/index.js'], sourceRoot: '../..' }, '/app/node_modules/.vite/deps/tslib.js.map')).toEqual(['/app/node_modules/tslib/index.js']);
	});
});

describe('isInstalledPackageFile', () => {
	const links: Record<string, string> = { '/app/node_modules/@nativescript/core/index.js': '/repo/packages/core/index.js' };
	const realpath = (file: string) => links[file] ?? file;

	it('accepts installed package files and rejects linked checkouts and app files', () => {
		expect(isInstalledPackageFile('/app/node_modules/tslib/tslib.es6.mjs', realpath)).toBe(true);
		expect(isInstalledPackageFile('/app/node_modules/@nativescript/core/index.js', realpath)).toBe(false);
		expect(isInstalledPackageFile('/app/src/main.ts', realpath)).toBe(false);
	});

	it('rejects a file that no longer exists', () => {
		expect(
			isInstalledPackageFile('/app/node_modules/gone/index.js', () => {
				throw new Error('ENOENT');
			}),
		).toBe(false);
	});
});

describe('createPreBundleSourceWatch', () => {
	function setup() {
		const listeners = new Map<string, (filename: string | null) => void>();
		const closed: string[] = [];
		const onChange = vi.fn();
		const watch = createPreBundleSourceWatch({
			onChange,
			realpath: (file) => file.replace('/app/node_modules/linked/', '/repo/linked/'),
			watchDir: (dir, listener) => {
				listeners.set(dir, listener);
				return { close: () => closed.push(dir) };
			},
		});
		return { watch, listeners, closed, onChange };
	}

	it('watches each source directory once and reports only pre-bundle sources', () => {
		const { watch, listeners, onChange } = setup();
		watch.track(['/app/node_modules/rxjs/dist/esm/index.js', '/app/node_modules/rxjs/dist/esm/Observable.js', '/app/node_modules/linked/index.js', '/app/src/main.ts']);
		expect([...listeners.keys()]).toEqual(['/app/node_modules/rxjs/dist/esm']);

		const rxjs = listeners.get('/app/node_modules/rxjs/dist/esm')!;
		rxjs('Observable.js');
		rxjs('Subject.js');
		rxjs(null);
		expect(onChange.mock.calls).toEqual([['/app/node_modules/rxjs/dist/esm/Observable.js']]);
	});

	it('picks up sources added to an already watched directory', () => {
		const { watch, listeners, onChange } = setup();
		watch.track(['/app/node_modules/rxjs/dist/esm/index.js']);
		watch.track(['/app/node_modules/rxjs/dist/esm/Subject.js']);
		listeners.get('/app/node_modules/rxjs/dist/esm')!('Subject.js');
		expect(onChange).toHaveBeenCalledWith('/app/node_modules/rxjs/dist/esm/Subject.js');
	});

	it('close() stops every watcher and forgets the sources', () => {
		const { watch, listeners, closed, onChange } = setup();
		watch.track(['/app/node_modules/tslib/tslib.es6.mjs', '/app/node_modules/@angular/core/fesm2022/core.mjs']);
		watch.close();
		expect(closed).toEqual(['/app/node_modules/tslib', '/app/node_modules/@angular/core/fesm2022']);
		listeners.get('/app/node_modules/tslib')!('tslib.es6.mjs');
		expect(onChange).not.toHaveBeenCalled();
	});
});
