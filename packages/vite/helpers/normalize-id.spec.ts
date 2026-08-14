import { describe, expect, it } from 'vitest';
import { normalizeModuleId } from './normalize-id.js';

describe('normalizeModuleId', () => {
	it('converts Windows backslashes to forward slashes', () => {
		expect(normalizeModuleId('C:\\proj\\node_modules\\@nativescript\\core\\ui\\index.js')).toBe('C:/proj/node_modules/@nativescript/core/ui/index.js');
	});

	it('uppercases a lowercase Windows drive letter', () => {
		expect(normalizeModuleId('c:/proj/node_modules/@nativescript/core/index.js')).toBe('C:/proj/node_modules/@nativescript/core/index.js');
	});

	it('canonicalizes both separator style and drive case together', () => {
		expect(normalizeModuleId('c:\\proj\\src\\app.ts')).toBe('C:/proj/src/app.ts');
	});

	it('collapses the two Windows id variants of the same core file to one id', () => {
		// The alias path (forward slash, realpath drive case) and the
		// path.resolve() path (backslash, cwd drive case) must converge so
		// Rolldown dedupes @nativescript/core instead of evaluating it twice.
		const aliasId = 'C:/UPS1/node_modules/@nativescript/core/ui/styling/style-scope.js';
		const resolverId = 'c:\\UPS1\\node_modules\\@nativescript\\core\\ui\\styling\\style-scope.js';
		expect(normalizeModuleId(resolverId)).toBe(normalizeModuleId(aliasId));
	});

	it('is a no-op for POSIX absolute paths (macOS/Linux unchanged)', () => {
		const id = '/Users/dev/UPS1/node_modules/@nativescript/core/index.js';
		expect(normalizeModuleId(id)).toBe(id);
	});

	it('leaves bare specifiers and query suffixes intact', () => {
		expect(normalizeModuleId('@nativescript/core')).toBe('@nativescript/core');
		expect(normalizeModuleId('C:\\proj\\worker.ts?worker_file')).toBe('C:/proj/worker.ts?worker_file');
	});

	it('preserves Rollup virtual-module ids without mangling the NUL prefix', () => {
		expect(normalizeModuleId('\0virtual:entry-with-polyfills')).toBe('\0virtual:entry-with-polyfills');
	});

	it('returns empty / falsy input unchanged', () => {
		expect(normalizeModuleId('')).toBe('');
	});

	it('does not touch a drive letter that is already uppercase', () => {
		expect(normalizeModuleId('C:/proj/app.ts')).toBe('C:/proj/app.ts');
	});
});
