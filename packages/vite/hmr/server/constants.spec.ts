import { describe, expect, it } from 'vitest';

import { EXPORT_PATTERN, IMPORT_PATTERN_1, IMPORT_PATTERN_2, IMPORT_PATTERN_3, IMPORT_PATTERN_SIDE_EFFECT } from './constants.js';

const replacePassthrough = (_match: string, prefix: string, spec: string, suffix: string) => `${prefix}${spec.toUpperCase()}${suffix}`;

describe('IMPORT/EXPORT regex patterns', () => {
	describe('IMPORT_PATTERN_1', () => {
		it('preserves leading newline when rewriting subsequent imports', () => {
			const input = `const x = 1;\nimport { foo } from "a";\nimport { bar } from "b";\n`;
			const out = input.replace(IMPORT_PATTERN_1, replacePassthrough);
			expect(out).toBe(`const x = 1;\nimport { foo } from "A";\nimport { bar } from "B";\n`);
		});

		it('handles import at start of file (no leading newline)', () => {
			const input = `import { foo } from "a";\n`;
			const out = input.replace(IMPORT_PATTERN_1, replacePassthrough);
			expect(out).toBe(`import { foo } from "A";\n`);
		});

		it('preserves blank lines between imports', () => {
			const input = `import { foo } from "a";\n\nimport { bar } from "b";\n`;
			const out = input.replace(IMPORT_PATTERN_1, replacePassthrough);
			expect(out).toBe(`import { foo } from "A";\n\nimport { bar } from "B";\n`);
		});
	});

	describe('IMPORT_PATTERN_2 / EXPORT_PATTERN', () => {
		it('preserves newline between IIFE and export-without-semicolon', () => {
			// Mirrors the @supabase/supabase-js bug: the require-guard IIFE
			// is followed by `export * from "..."` (no trailing semicolon),
			// which used to collapse onto a single line and trigger
			// `SyntaxError: Unexpected token 'export'`.
			const input = `})();\nexport * from "url-a"\nexport * from "url-b"\n`;
			const out = input.replace(IMPORT_PATTERN_2, replacePassthrough);
			expect(out).toBe(`})();\nexport * from "URL-A"\nexport * from "URL-B"\n`);
		});

		it('survives running the same pattern twice (since EXPORT_PATTERN aliases IMPORT_PATTERN_2)', () => {
			// rewriteImports() runs IMPORT_PATTERN_2 and EXPORT_PATTERN
			// back-to-back. Each pass must keep newlines intact so a
			// double-pass doesn't collapse exports onto a single line
			// (which produced `Unexpected token 'export'` in the field).
			expect(EXPORT_PATTERN).toBe(IMPORT_PATTERN_2);
			const input = `})();\nexport * from "url-a"\nexport * from "url-b"\n`;
			let out = input.replace(IMPORT_PATTERN_2, replacePassthrough);
			out = out.replace(EXPORT_PATTERN, replacePassthrough);
			expect(out).toBe(`})();\nexport * from "URL-A"\nexport * from "URL-B"\n`);
			expect(out).not.toMatch(/"export/);
		});

		it('preserves blank lines between consecutive export-froms', () => {
			const input = `export * from "a"\n\nexport * from "b"\n`;
			const out = input.replace(IMPORT_PATTERN_2, replacePassthrough);
			expect(out).toBe(`export * from "A"\n\nexport * from "B"\n`);
		});
	});

	describe('IMPORT_PATTERN_SIDE_EFFECT', () => {
		it('preserves newlines for side-effect imports', () => {
			const input = `const x = 1;\nimport "a";\nimport "b";\n`;
			const out = input.replace(IMPORT_PATTERN_SIDE_EFFECT, replacePassthrough);
			expect(out).toBe(`const x = 1;\nimport "A";\nimport "B";\n`);
		});

		it('handles side-effect import at start of file', () => {
			const input = `import "a";\n`;
			const out = input.replace(IMPORT_PATTERN_SIDE_EFFECT, replacePassthrough);
			expect(out).toBe(`import "A";\n`);
		});
	});

	describe('IMPORT_PATTERN_3 (dynamic imports)', () => {
		it('does not affect surrounding newlines (no leading anchor)', () => {
			const input = `await import("a");\nawait import("b");\n`;
			const out = input.replace(IMPORT_PATTERN_3, replacePassthrough);
			expect(out).toBe(`await import("A");\nawait import("B");\n`);
		});
	});
});
