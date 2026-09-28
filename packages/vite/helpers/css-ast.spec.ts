import { describe, expect, it } from 'vitest';

import { joinEscapedSelectorCommas, parseCssAst } from './css-ast.js';

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

describe('joinEscapedSelectorCommas', () => {
	it('does not join after an escaped backslash', () => {
		// `.a\\` ends in an escaped backslash, so the comma after it is a real separator.
		expect(joinEscapedSelectorCommas(['.a\\\\', '.b'])).toEqual(['.a\\\\', '.b']);
	});
});
