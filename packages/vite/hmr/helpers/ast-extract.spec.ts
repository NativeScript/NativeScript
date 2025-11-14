import { describe, it, expect } from 'vitest';
import { astExtractImportsAndStripTypes } from './ast-extract.js';

describe('astExtractImportsAndStripTypes', () => {
	it('hoists imports and strips type-only specifiers', () => {
		const source = `
import type { Foo } from './types';
import { ref, type ComputedRef } from 'vue';
const count: number = 0;
export default { default: 1 };
`;
		const result = astExtractImportsAndStripTypes(source);
		const importsCombined = result.imports.join('\n');

		expect(importsCombined).toContain('ref');
		expect(importsCombined).not.toContain('import type');
		expect(importsCombined).not.toContain('Foo');
		expect(result.body).not.toContain('import');
		expect(result.body).toContain('const count = 0;');
		expect(result.body).not.toContain(': number');
		expect(result.diagnostics).toEqual(expect.arrayContaining([expect.stringContaining('[ast-fallback] stripped variable type annotations')]));
	});

	it('preserves default property counts', () => {
		const source = `
import { something } from './helper';
const obj = { default: 1, other: 2 };
export default obj;
`;
		const result = astExtractImportsAndStripTypes(source);
		expect(result.diagnostics.some((d) => d.includes('[ast][warn]'))).toBe(false);
		expect(result.body.replace(/\s+/g, ' ').trim()).toContain('const obj = { default: 1, other: 2 }');
	});
});
