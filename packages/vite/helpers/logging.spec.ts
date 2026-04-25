import { describe, expect, it } from 'vitest';
import { shouldSuppressViteWarning } from './logging.js';

describe('shouldSuppressViteWarning', () => {
	describe('cross-package sourcemap warnings', () => {
		it('drops "points to a source file outside its package" warnings for @nativescript/core', () => {
			// This fires on every cold boot of a real app for every core
			// submodule because the published sourcemap still references the
			// monorepo source path (packages/core/**) that doesn't exist in
			// the consumer's node_modules.
			const msg = 'Sourcemap for "/Users/me/app/node_modules/@nativescript/core/xhr/index.js" points to a source file outside its package: "/Users/me/app/packages/core/xhr/index.ts"';
			expect(shouldSuppressViteWarning(msg)).toBe(true);
		});

		it('drops the warning for every kind of nested subpath (utils, http, trace, globals, file-system, http-request/*)', () => {
			const subpaths = ['node_modules/@nativescript/core/utils/types.js', 'node_modules/@nativescript/core/trace/index.js', 'node_modules/@nativescript/core/http/index.js', 'node_modules/@nativescript/core/http/http-interfaces.js', 'node_modules/@nativescript/core/http/http-request/index.ios.js', 'node_modules/@nativescript/core/globals/index.js', 'node_modules/@nativescript/core/file-system/index.js', 'node_modules/@nativescript/core/http/http-request-internal/index.ios.js'];
			for (const file of subpaths) {
				const msg = `Sourcemap for "/abs/${file}" points to a source file outside its package: "/abs/packages/core/${file.split('/').slice(2).join('/').replace('.js', '.ts')}"`;
				expect(shouldSuppressViteWarning(msg), `should suppress for ${file}`).toBe(true);
			}
		});

		it('still surfaces unrelated "Sourcemap for" warnings (different wording)', () => {
			// Guards against over-aggressive matching — only messages that
			// include BOTH hallmark substrings should be dropped.
			const msg = 'Sourcemap for "/abs/foo.js" is empty and cannot be decoded';
			expect(shouldSuppressViteWarning(msg)).toBe(false);
		});

		it('still suppresses the pre-existing "missing source files" variant', () => {
			const msg = 'Sourcemap for "/abs/foo.js" missing source files: ["/abs/foo.ts"]';
			expect(shouldSuppressViteWarning(msg)).toBe(true);
		});

		it('handles ANSI-colored messages (picocolors wraps the plain text)', () => {
			// picocolors yellow = \u001b[33m...\u001b[39m. Using .includes()
			// rather than .startsWith() means our filter works on TTY output
			// as well as piped / NO_COLOR streams.
			const wrapped = `\u001b[33mSourcemap for "/abs/foo.js" points to a source file outside its package: "/abs/packages/foo.ts"\u001b[39m`;
			expect(shouldSuppressViteWarning(wrapped)).toBe(true);
		});
	});

	describe('missing sidecar source-map warnings', () => {
		it('drops "Failed to load source map for" ENOENT groups (multi-line payload)', () => {
			// Vite concatenates the reader error into the warn payload, so
			// the whole block arrives on a single logger.warn call.
			const msg = ['Failed to load source map for /abs/node_modules/@nativescript-community/observable/observable.js.', 'Error: An error occurred while trying to read the map file at observable.js.map', "Error: ENOENT: no such file or directory, open '/abs/node_modules/@nativescript-community/observable/observable.js.map'", '    at Object.readFileSync (node:fs:435:20)'].join('\n');
			expect(shouldSuppressViteWarning(msg)).toBe(true);
		});

		it('works on the bare single-line variant too', () => {
			const msg = 'Failed to load source map for /abs/node_modules/foo/bar.js.';
			expect(shouldSuppressViteWarning(msg)).toBe(true);
		});

		it('does not suppress unrelated ENOENT messages that are not source-map related', () => {
			const msg = "Error: ENOENT: no such file or directory, open '/abs/some-asset.svg'";
			expect(shouldSuppressViteWarning(msg)).toBe(false);
		});
	});

	describe('vendor bundle diagnostics (legacy coverage)', () => {
		it('drops eval warnings attributed to the @nativescript/vendor virtual module', () => {
			expect(shouldSuppressViteWarning('Use of eval is discouraged in "@nativescript/vendor"')).toBe(true);
			expect(shouldSuppressViteWarning('Use of eval is discouraged in @nativescript/vendor virtual')).toBe(true);
		});

		it('keeps eval warnings for arbitrary modules', () => {
			expect(shouldSuppressViteWarning('Use of eval in /abs/my-app/src/some-file.ts')).toBe(false);
		});

		it('drops annotation/license position warnings for the vendor bundle', () => {
			expect(shouldSuppressViteWarning('Comment "/*! LEGAL */" in "@nativescript/vendor" contains an annotation that Rollup cannot interpret')).toBe(true);
			expect(shouldSuppressViteWarning('position of the comment in "@nativescript/vendor"')).toBe(true);
		});

		it('keeps annotation warnings for other modules', () => {
			expect(shouldSuppressViteWarning('Comment in "my-pkg" contains an annotation that Rollup cannot interpret')).toBe(false);
		});
	});

	describe('Analog Angular optimizer warnings', () => {
		it('drops "Sourcemap is likely to be incorrect" for analogjs-router-optimization', () => {
			expect(shouldSuppressViteWarning('Sourcemap is likely to be incorrect: a plugin (analogjs-router-optimization) was used to transform files')).toBe(true);
		});

		it('drops the same warning for @analogjs/vite-plugin-angular-optimizer', () => {
			expect(shouldSuppressViteWarning('Sourcemap is likely to be incorrect: a plugin (@analogjs/vite-plugin-angular-optimizer) was used to transform files')).toBe(true);
		});

		it('keeps the warning for other optimizer plugins', () => {
			// We only silence the analog plugins because they deliberately
			// skip sourcemap generation; other tools might expose a real
			// bug the user wants to know about.
			expect(shouldSuppressViteWarning('Sourcemap is likely to be incorrect: a plugin (some-other-plugin) was used to transform files')).toBe(false);
		});
	});

	describe('fallthrough behaviour', () => {
		it('never suppresses arbitrary Vite warnings', () => {
			// Regression guard: future edits must not broaden the filter so
			// much that ordinary diagnostics (compile errors, unresolved
			// imports, HMR handler failures) get swallowed.
			const arbitrary = ['[vite] hmr update detected for /src/app.ts', 'Failed to resolve import "~/shared/foo"', 'Transform failed with 1 error: Expected ";"', '', '    '];
			for (const msg of arbitrary) {
				expect(shouldSuppressViteWarning(msg), `should NOT suppress: ${JSON.stringify(msg)}`).toBe(false);
			}
		});
	});
});
