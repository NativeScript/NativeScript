import { describe, expect, it } from 'vitest';

import { collectCssHotUpdatePaths } from './websocket-css-hot-update.js';

describe('collectCssHotUpdatePaths', () => {
	const projectRoot = '/repo/apps/safety/nativescript-safety';
	const appRootDir = 'src';
	const appEntryCss = `${projectRoot}/src/app.css`;

	it('returns the changed file as a root-relative path for an in-scope CSS edit', () => {
		const paths = collectCssHotUpdatePaths({
			file: `${projectRoot}/src/app.css`,
			root: projectRoot,
			appRootDir,
			appEntryCss,
		});
		expect(paths).toEqual(['/src/app.css']);
	});

	it('treats files under <root>/core/ as in scope', () => {
		const paths = collectCssHotUpdatePaths({
			file: `${projectRoot}/core/theme.css`,
			root: projectRoot,
			appRootDir,
			appEntryCss,
		});
		expect(paths).toEqual(['/core/theme.css']);
	});

	it('treats files under a non-default appRootDir (e.g. "app") as in scope', () => {
		const root = '/repo/apps/legacy';
		const paths = collectCssHotUpdatePaths({
			file: `${root}/app/main.css`,
			root,
			appRootDir: 'app',
			appEntryCss: `${root}/app/main.css`,
		});
		expect(paths).toEqual(['/app/main.css']);
	});

	it('falls back to appEntryCss when an out-of-scope CSS file changes (workspace dep `@import` case)', () => {
		// The bug we're fixing: an Nx monorepo CSS lib at
		// `<repo>/libs/.../index.css` is `@import`'d from `app.css`.
		// Vite sees the file change but `ctx.modules` is empty for
		// `addWatchFile`-registered deps, so we broadcast app.css and
		// let PostCSS re-resolve the chain on the next fetch.
		const paths = collectCssHotUpdatePaths({
			file: '/repo/libs/xplat/nativescript/css/src/index.css',
			root: projectRoot,
			appRootDir,
			appEntryCss,
		});
		expect(paths).toEqual(['/src/app.css']);
	});

	it('returns [] for an out-of-scope CSS save when no appEntryCss is supplied', () => {
		const paths = collectCssHotUpdatePaths({
			file: '/repo/libs/foo/index.css',
			root: projectRoot,
			appRootDir,
		});
		expect(paths).toEqual([]);
	});

	it('returns [] for non-CSS file changes (the broadcast is gated to .css)', () => {
		// Watch deps may include Tailwind content paths (.ts, .html);
		// those changes go through the TS HMR pipeline, not CSS.
		const paths = collectCssHotUpdatePaths({
			file: '/repo/libs/some-library/src/foo.ts',
			root: projectRoot,
			appRootDir,
			appEntryCss,
		});
		expect(paths).toEqual([]);
	});

	it('rejects empty inputs gracefully', () => {
		expect(collectCssHotUpdatePaths({ file: '', root: projectRoot, appEntryCss })).toEqual([]);
		expect(collectCssHotUpdatePaths({ file: '/some/path.css', root: '', appEntryCss })).toEqual([]);
	});

	it('does not match `<root>/source/` as if it were `<root>/src/` (substring guard)', () => {
		// Exact-prefix scope detection: directory names that share a
		// prefix with `src` or `core` must not count as in-scope.
		const root = '/repo/apps/legacy';
		const paths = collectCssHotUpdatePaths({
			file: `${root}/source/styles.css`,
			root,
			appRootDir: 'src',
			appEntryCss: `${root}/src/app.css`,
		});
		// Out-of-scope, but appEntryCss is supplied → falls back to it.
		expect(paths).toEqual(['/src/app.css']);
	});

	it('normalizes Windows-style backslash paths to POSIX root-relative paths', () => {
		const root = 'C:\\repo\\apps\\safety\\nativescript-safety';
		const paths = collectCssHotUpdatePaths({
			file: 'C:\\repo\\apps\\safety\\nativescript-safety\\src\\app.css',
			root,
			appRootDir: 'src',
			appEntryCss: 'C:\\repo\\apps\\safety\\nativescript-safety\\src\\app.css',
		});
		expect(paths).toEqual(['/src/app.css']);
	});

	it('strips query suffixes from absolute paths during scope detection', () => {
		const paths = collectCssHotUpdatePaths({
			file: `${projectRoot}/src/app.css?direct=1`,
			root: projectRoot,
			appRootDir,
			appEntryCss,
		});
		expect(paths).toEqual(['/src/app.css']);
	});
});
