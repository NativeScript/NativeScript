import { describe, expect, it } from 'vitest';

import { joinEscapedSelectorCommas, normalizeCssAtRules, parseCssAst } from './css-ast.js';

describe('parseCssAst', () => {
	it('keeps an escaped comma inside a class name', () => {
		const ast = parseCssAst('.grid-cols-\\[repeat\\(auto-fill\\,minmax\\(260\\,1fr\\)\\)\\] { grid-template-columns: repeat(auto-fill,minmax(260,1fr)); }');
		expect(ast.stylesheet.rules[0].selectors).toEqual(['.grid-cols-\\[repeat\\(auto-fill\\,minmax\\(260\\,1fr\\)\\)\\]']);
	});

	it('still splits a real selector list', () => {
		const ast = parseCssAst('.a\\,b, .c { color: red; }');
		expect(ast.stylesheet.rules[0].selectors).toEqual(['.a\\,b', '.c']);
	});

	it('repairs rules nested in at-rules', () => {
		const ast = parseCssAst('@media (min-width: 1px) { .x-\\[a\\,b\\] { color: red; } }');
		expect(ast.stylesheet.rules[0].rules[0].selectors).toEqual(['.x-\\[a\\,b\\]']);
	});
});

describe('parseCssAst with at-rules css cannot read', () => {
	const selectors = (code: string) => {
		const ast = parseCssAst(code, { silent: true });
		expect(ast.stylesheet.parsingErrors).toEqual([]);
		return ast.stylesheet.rules.map((rule: any) => (rule.type === 'rule' ? rule.selectors.join(',') : `@${rule.type} ${rule.media ?? ''}`.trim()));
	};

	it.each([
		['@layer', '@layer base { .a { color: red; } } .b { color: blue; }', ['.a', '.b']],
		['@container', '@container card (min-width: 400px) { .a { color: red; } } .b { color: blue; }', ['.b']],
		['@starting-style', '@starting-style { .a { opacity: 0; } } .b { color: blue; }', ['.b']],
		['@property', '@property --x { syntax: "<length>"; inherits: false; initial-value: 0px; } .b { color: blue; }', ['.b']],
		['@scope', '@scope (.card) { .title { color: red; } } .b { color: blue; }', ['.b']],
	])('keeps the rules after %s', (_name, code, expected) => {
		expect(selectors(code)).toEqual(expected);
	});

	it('orders layered rules the way the cascade does: layers in declaration order, then unlayered rules', () => {
		const code = ['@charset "utf-8";', '@layer reboot, utilities;', '.app { color: green; }', '@layer utilities { .u { margin: 0; } }', '@layer reboot { .r { padding: 0; } }', '@layer { .anon { color: red; } }', '@layer utilities { .u2 { margin: 1px; } }'].join('\n');
		const ast = parseCssAst(code, { silent: true });
		expect(ast.stylesheet.rules[0].type).toBe('charset');
		expect(selectors(code).slice(1)).toEqual(['.r', '.u', '.u2', '.anon', '.app']);
	});

	it('unwraps layers inside other at-rules and drops unknown at-rules at any depth', () => {
		const code = '@media (min-width: 1px) { @layer x { .a { color: red; } } @container (width > 1px) { .c { color: red; } } } .b { color: blue; @starting-style { opacity: 0; } }';
		const ast = parseCssAst(code, { silent: true });
		expect(ast.stylesheet.parsingErrors).toEqual([]);
		expect(ast.stylesheet.rules[0].media).toBe('(min-width: 1px)');
		expect(ast.stylesheet.rules[0].rules.map((rule: any) => rule.selectors)).toEqual([['.a']]);
		expect(ast.stylesheet.rules[1].declarations.map((decl: any) => `${decl.property}: ${decl.value}`)).toEqual(['color: blue']);
	});

	it('keeps layered @media and @keyframes for core', () => {
		const code = '@layer components { @media (min-width: 576px) { .c { width: 1px; } } @keyframes spin { to { opacity: 1; } } }';
		const rules = parseCssAst(code, { silent: true }).stylesheet.rules;
		expect(rules.map((rule: any) => rule.type)).toEqual(['media', 'keyframes']);
	});
});

describe('normalizeCssAtRules', () => {
	it('returns a stylesheet without such at-rules unchanged', () => {
		const code = '@import "a.css";\n@media (min-width: 1px) { .a { background: url(a@2x.png); } }\n.b::after { content: "@layer {"; }\n@-webkit-keyframes k { to { opacity: 1 } }';
		expect(normalizeCssAtRules(code)).toBe(code);
	});

	it('leaves text outside the rewritten at-rules as written', () => {
		const code = '.a { background: url(data:image/png;base64,AA==); /* } */ }\n@property --x { inherits: false; }\n.b { content: "}"; }';
		expect(normalizeCssAtRules(code)).toBe('.a { background: url(data:image/png;base64,AA==); /* } */ }\n.b { content: "}"; }');
	});
});

describe('joinEscapedSelectorCommas', () => {
	it('does not join after an escaped backslash', () => {
		// `.a\\` ends in an escaped backslash, so the comma after it is a real separator.
		expect(joinEscapedSelectorCommas(['.a\\\\', '.b'])).toEqual(['.a\\\\', '.b']);
	});
});
