import { describe, expect, it } from 'vitest';

import { containsRealNgDeclare, stripJsComments } from './util.js';

describe('stripJsComments', () => {
	it('returns the input unchanged when there are no comments', () => {
		const src = "const x = 'hello';\nconst y = `tpl`;";
		expect(stripJsComments(src)).toBe(src);
	});

	it('blanks `//` line comments while preserving newlines and overall length', () => {
		const src = ['const a = 1;', '// styleUrls: ["./x.scss"]', 'const b = 2;'].join('\n');
		const out = stripJsComments(src);
		expect(out.length).toBe(src.length);
		expect(out).not.toMatch(/styleUrls/);
		expect(out).toMatch(/const a = 1;/);
		expect(out).toMatch(/const b = 2;/);
	});

	it('blanks `/* ... */` block comments and keeps interior newlines', () => {
		const src = ['const a = 1;', '/* styleUrls: ["./x.scss"]', '   templateUrl: "./y.html"', '*/', 'const b = 2;'].join('\n');
		const out = stripJsComments(src);
		expect(out.length).toBe(src.length);
		expect(out).not.toMatch(/styleUrls|templateUrl/);
		expect(out).toMatch(/const a = 1;/);
		expect(out).toMatch(/const b = 2;/);
		const newlineCount = (s: string) => (s.match(/\n/g) || []).length;
		expect(newlineCount(out)).toBe(newlineCount(src));
	});

	it('does not strip text inside string or template literals that look like comments', () => {
		const src = ["const a = '// not a comment';", 'const b = "/* still not a comment */";', 'const c = `// nor here`;'].join('\n');
		const out = stripJsComments(src);
		expect(out).toBe(src);
	});

	it('handles escaped quotes inside strings without misclassifying comment markers', () => {
		const src = "const a = 'it\\'s // ok';\nconst b = 1;";
		const out = stripJsComments(src);
		expect(out).toBe(src);
	});

	it('does not produce a `styleUrls` match for a commented-out @Component property', () => {
		const src = ["import { Component } from '@angular/core';", '', '@Component({', "  selector: 'app-x',", "  templateUrl: './x.html',", '  // styleUrls: ["./x.scss"],', '})', 'export class XComponent {}'].join('\n');
		const out = stripJsComments(src);
		expect(/styleUrls\s*:\s*\[/.test(out)).toBe(false);
		expect(/templateUrl\s*:\s*['"]\.\/x\.html['"]/.test(out)).toBe(true);
	});
});

describe('containsRealNgDeclare', () => {
	it('detects ɵɵngDeclareComponent in real code', () => {
		expect(containsRealNgDeclare('export const x = i0.ɵɵngDeclareComponent({});')).toBe(true);
	});

	it('ignores ɵɵngDeclare references inside string literals', () => {
		expect(containsRealNgDeclare("const s = 'i0.ɵɵngDeclareComponent(';")).toBe(false);
	});

	it('ignores ɵɵngDeclare references inside line comments', () => {
		expect(containsRealNgDeclare('// i0.ɵɵngDeclareComponent({})')).toBe(false);
	});
});
