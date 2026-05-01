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

	describe('Analog "contains Angular decorators but is not in the TypeScript program" warnings', () => {
		// These appear once per offending file at every cold boot of the
		// dev server (50+ lines for a typical NS Angular app). They aren't
		// actionable — the matching files go through our
		// `tsFallbackTransformPlugin` and load fine without being in the
		// Angular program. See the suppression's inline comment in
		// `logging.ts` for the full rationale.
		const buildAnalogWarning = (filePath: string) => [`warning: [@analogjs/vite-plugin-angular]: "${filePath}" contains Angular decorators but is not in the TypeScript program. Ensure it is included in your tsconfig.`, '  Plugin: @analogjs/vite-plugin-angular', `  File: ${filePath}`].join('\n');

		it('drops the multi-line warning shape Vite actually emits', () => {
			// This is the verbatim shape from the dev server log the user
			// reported — same message, same trailing Plugin/File lines.
			const msg = buildAnalogWarning('/Users/me/app/src/app/shared/services/schedule-time.service.ts');
			expect(shouldSuppressViteWarning(msg)).toBe(true);
		});

		it('drops the warning for any source path (services, components, pipes, directives)', () => {
			const paths = ['/abs/src/app/shared/services/foo.service.ts', '/abs/src/app/components/bar.component.ts', '/abs/src/app/pipes/baz.pipe.ts', '/abs/src/app/directives/qux.directive.ts', '/abs/src/app/utils/dynamic-import-target.ts'];
			for (const p of paths) {
				expect(shouldSuppressViteWarning(buildAnalogWarning(p)), `should suppress for ${p}`).toBe(true);
			}
		});

		it('drops the single-line variant (no trailing Plugin/File lines)', () => {
			// Vite sometimes wraps the message without the multi-line
			// payload (e.g. when warnOnce dedupes). We must catch both
			// shapes — gating purely on the unique substring keeps the
			// match robust.
			const msg = `[@analogjs/vite-plugin-angular]: "/abs/foo.ts" contains Angular decorators but is not in the TypeScript program. Ensure it is included in your tsconfig.`;
			expect(shouldSuppressViteWarning(msg)).toBe(true);
		});

		it('handles ANSI-colored variants (picocolors-wrapped TTY output)', () => {
			const wrapped = `\u001b[33mwarning: [@analogjs/vite-plugin-angular]: "/abs/foo.ts" contains Angular decorators but is not in the TypeScript program. Ensure it is included in your tsconfig.\u001b[39m`;
			expect(shouldSuppressViteWarning(wrapped)).toBe(true);
		});

		it('does NOT suppress unrelated Analog warnings (only the decorator-missing-from-program one)', () => {
			// Guards against over-aggressive matching — any Analog
			// warning that ISN'T this specific message must still
			// surface so we don't silently swallow real diagnostics.
			expect(shouldSuppressViteWarning('warning: [@analogjs/vite-plugin-angular]: Failed to compile component template')).toBe(false);
			expect(shouldSuppressViteWarning('warning: [@analogjs/vite-plugin-angular]: Inline style URL could not be resolved')).toBe(false);
		});

		it('does NOT suppress similar wording from non-Analog sources', () => {
			// Same hallmark phrase but from a different plugin → keep.
			// Defensive: if some other tool ever emits the same text we
			// shouldn't blindly hide it.
			expect(shouldSuppressViteWarning('warning: [some-other-plugin]: file contains Angular decorators but is not in the TypeScript program')).toBe(false);
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
