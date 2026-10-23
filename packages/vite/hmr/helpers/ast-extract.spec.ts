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

	it('keeps object properties whose value is undefined or null', () => {
		const source = `
import { ref } from 'vue';
const themeOptions = [{ label: 'System', value: undefined }, { label: 'Light', value: 'light' }];
const flags = { a: 1, b: null, c: void 0, nullable: 2 };
`;
		const body = astExtractImportsAndStripTypes(source).body.replace(/\s+/g, ' ');
		expect(body).toContain("{ label: 'System', value: undefined }");
		expect(body).toContain('{ a: 1, b: null, c: void 0, nullable: 2 }');
	});

	it('strips type annotations left on function parameters', () => {
		const source = `
function f(a: string, b?: undefined, ...rest: any[]) { return [a, b, rest]; }
const g = (x: number = 1) => x;
`;
		const result = astExtractImportsAndStripTypes(source);
		const body = result.body.replace(/\s+/g, ' ');
		expect(body).toContain('function f(a, b, ...rest)');
		expect(body).toContain('const g = (x = 1) => x');
		expect(result.diagnostics).toEqual(expect.arrayContaining(['[ast-fallback] stripped residual param annotations']));
	});
});
