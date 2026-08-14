import { describe, expect, it } from 'vitest';

import { isRuntimeGraphExcludedPath, matchesRuntimeGraphModuleId, shouldIncludeRuntimeGraphFile } from './runtime-graph-filter.js';

const TS_PATTERN = /\.(ts|js|tsx|jsx|mjs)$/i;

describe('isRuntimeGraphExcludedPath', () => {
	it('excludes test and mock paths', () => {
		expect(isRuntimeGraphExcludedPath('/src/app/__tests__/harness.ts')).toBe(true);
		expect(isRuntimeGraphExcludedPath('/src/app/__mocks__/service.ts')).toBe(true);
		expect(isRuntimeGraphExcludedPath('/src/app/home.component.spec.ts')).toBe(true);
		expect(isRuntimeGraphExcludedPath('/src/app/home.component.test.ts')).toBe(true);
	});

	it('excludes TypeScript declaration files (types-only, never runtime modules)', () => {
		// A hand-written ambient-module shim like
		// `src/nstudio-ncharts-angular.d.ts` matches the `.ts` runtime pattern;
		// without this exclusion it becomes a phantom served/prefetched module
		// and its `export * from '<types path>'` sends the star-export expander
		// chasing targets that only exist as declarations.
		expect(isRuntimeGraphExcludedPath('/src/nstudio-ncharts-angular.d.ts')).toBe(true);
		expect(isRuntimeGraphExcludedPath('/src/typings/globals.d.mts')).toBe(true);
		expect(isRuntimeGraphExcludedPath('/src/typings/globals.d.cts')).toBe(true);
		// Query suffixes are stripped before matching.
		expect(isRuntimeGraphExcludedPath('/src/shims.d.ts?import')).toBe(true);
	});

	it('keeps regular runtime modules', () => {
		expect(isRuntimeGraphExcludedPath('/src/main.ts')).toBe(false);
		expect(isRuntimeGraphExcludedPath('/src/app/home.component.ts')).toBe(false);
		// A file that merely contains a `d` segment is not a declaration file.
		expect(isRuntimeGraphExcludedPath('/src/app/d.ts.helper.ts')).toBe(false);
		expect(isRuntimeGraphExcludedPath('/src/app/grid.ts')).toBe(false);
	});
});

describe('shouldIncludeRuntimeGraphFile / matchesRuntimeGraphModuleId', () => {
	it('rejects declaration files even when the file pattern matches', () => {
		expect(shouldIncludeRuntimeGraphFile('/src/shims.d.ts', TS_PATTERN)).toBe(false);
		expect(matchesRuntimeGraphModuleId('/src/shims.d.ts', '/src/', TS_PATTERN)).toBe(false);
	});

	it('accepts regular app modules', () => {
		expect(shouldIncludeRuntimeGraphFile('/src/main.ts', TS_PATTERN)).toBe(true);
		expect(matchesRuntimeGraphModuleId('/src/main.ts', '/src/', TS_PATTERN)).toBe(true);
	});
});
