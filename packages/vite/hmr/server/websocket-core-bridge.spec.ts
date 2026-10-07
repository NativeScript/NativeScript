import { describe, expect, it } from 'vitest';

import { extractDirectExportedNames, maskJsComments } from './websocket-core-bridge.js';

describe('maskJsComments', () => {
	it('blanks line and block comments while preserving length and newlines', () => {
		const code = ['const a = 1; // export const x = 1;', '/* export let y;', 'export var z; */', 'export const b = 2;'].join('\n');
		const masked = maskJsComments(code);
		expect(masked).toHaveLength(code.length);
		expect(masked.split('\n')).toHaveLength(4);
		expect(masked).not.toMatch(/export (const x|let y|var z)/);
		expect(masked).toContain('export const b = 2;');
	});

	it('leaves comment markers inside string and template literals alone', () => {
		const code = `const u = "http://host/*"; const t = \`a // b\`; const s = '/* x */';`;
		expect(maskJsComments(code)).toBe(code);
	});

	it('does not let quotes inside regex literals desync string tracking', () => {
		const code = ['const re = /["\']/g;', 'const glob = "src/**/*.ts";', 'export const kept = 1;', 'const r2 = x.split(/\\//); // export const gone = 1;'].join('\n');
		expect(extractDirectExportedNames(code)).toEqual(['kept']);
	});

	it('treats a slash after an operand as division, not a regex', () => {
		const code = ['const half = total / 2; // export const gone = 1;', 'export const kept = half / 2;'].join('\n');
		expect(extractDirectExportedNames(code)).toEqual(['kept']);
	});
});
