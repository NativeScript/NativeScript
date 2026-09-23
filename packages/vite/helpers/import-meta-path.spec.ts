import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { resolveRelativeToImportMeta } from './import-meta-path.js';

describe('resolveRelativeToImportMeta', () => {
	it('produces a valid Windows filesystem path for file URLs', () => {
		const metaUrl = 'file:///C:/Program%20Files/NativeScript/packages/vite/configuration/base.js';

		const result = resolveRelativeToImportMeta(metaUrl, '../shims/node-module.js', { windows: true });

		expect(result).toBe(path.win32.join('C:\\', 'Program Files', 'NativeScript', 'packages', 'vite', 'shims', 'node-module.js'));
		expect(result.startsWith('\\')).toBe(false);
		expect(result.includes('%20')).toBe(false);
	});

	it('resolves relative segments from the module URL', () => {
		const result = resolveRelativeToImportMeta('file:///Users/test/NativeScript/packages/vite/configuration/base.js', '../shims/set-value.js');

		expect(result).toBe(path.posix.join('/Users', 'test', 'NativeScript', 'packages', 'vite', 'shims', 'set-value.js'));
	});
});
