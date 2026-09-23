import { describe, expect, it } from 'vitest';
import { toStaticImportSpecifier } from './import-specifier.js';

describe('toStaticImportSpecifier', () => {
	it('keeps in-project Windows paths as root-relative POSIX imports', () => {
		const result = toStaticImportSpecifier('C:\\PsicoSys\\sample', 'C:\\PsicoSys\\sample\\app\\app.ts');

		expect(result).toBe('/app/app.ts');
	});

	it('falls back to a file URL when the target is outside the project root', () => {
		const result = toStaticImportSpecifier('C:\\PsicoSys\\sample', 'D:\\shared\\app\\app.ts');

		expect(result).toBe('file:///D:/shared/app/app.ts');
	});
});
