import { parse } from 'acorn';
import { parseExpressionNode } from './expression-parser';

function acornExpression(text: string): any {
	const program: any = parse(text, { ecmaVersion: 2020 });
	for (const statement of program.body) {
		if (statement.type === 'ExpressionStatement') {
			return statement.expression;
		}
	}
	return undefined;
}

// acorn nodes are class instances; compare structure, keeping regexps, bigints and holes distinguishable.
function plain(value: any): any {
	if (value === undefined) {
		return { $undefined: true };
	}
	if (value === null || typeof value !== 'object') {
		return typeof value === 'bigint' ? { $bigint: value.toString() } : value;
	}
	if (value instanceof RegExp) {
		return { $regexp: value.source, flags: value.flags };
	}
	if (Array.isArray(value)) {
		const out = [];
		for (let i = 0; i < value.length; i++) {
			out.push(i in value ? plain(value[i]) : { $hole: true });
		}
		return out;
	}
	const out = {};
	for (const key of Object.keys(value)) {
		out[key] = plain(value[key]);
	}
	return out;
}

const sameAsAcorn = [
	// binding forms core hands to parseExpression
	"$parents['ListView'].test + 2",
	'$value',
	'$newPropertyValue | converter',
	"date | dateConverter('dd.mm.yyyy')",
	'value | conv.toView | new Upper()',
	"items.length > 0 ? 'some' : 'none'",
	'isLoading || isBusy',
	'`${firstName} ${lastName}`',
	// literals
	'0x1F + 0o17 + 0b101 + 010 + 08 + .5 + 5. + 1e-3',
	'1n + 0x10n',
	`'\\n\\t\\x41\\u0042\\u{1F600}\\101' + "q\\"q"`,
	'null, true, false, this',
	'/[/]+/gi.test(a)',
	'a / b / c',
	'`a${b}c${`${d}`}`',
	'tag`\\unicode`',
	'`\\``',
	// precedence and associativity
	'a + b * c - d / e % f',
	'a ** b ** c',
	'(-a) ** 2',
	'a << b >> c >>> d',
	'a < b <= c in d instanceof e',
	'a == b != c === d !== e',
	'a & b ^ c | d',
	'a && b || c',
	'a ?? (b || c)',
	'a ? b : c ? d : e',
	'!~-+a',
	'typeof void delete a.b',
	'a++ + --b',
	'(a, b), c',
	'(a + b) * c',
	// members, calls, chains
	'a.b[c](d)?.e?.[f]?.(g).h',
	'(a?.b).c',
	'a.class.if?.new',
	'f(...a, b,)',
	'new X',
	'new X.Y(a)(b)',
	'new (f())()',
	// collections
	'[, a, , ...b, ]',
	'({ a, b: 1, "c": 2, 3: d, [e]: f, ...g, if: h, get: i, __proto__: j })',
	// assignment, arrows, patterns
	'a.b += c = d',
	'[a, { b = 1 }, ...c] = d',
	'(x, [y], { z } = {}) => x + y',
	'async x => await x',
	'import(a)',
	// statements and ASI
	';a',
	'a\n(b)',
	'a\n++b',
	'"use strict"; a',
	'a <!-- comment',
	'/* c */ a // c',
];

const rejectedLikeAcorn = ['a +', 'a b', '-a ** 2', 'a ?? b || c', '1_000', '3in x', '08n', "'abc", '`\\x`', '/a/gg', '/(?i:a)/', '(a, a) => 1', 'a?.b = 1', '({ a = 1 })', '"use strict"; 010', '"use strict"; delete a', '\\u0074rue', 'super.x', 'new.target', 'a ||= b', 'return a'];

const unsupported = ['a + function () {}', 'a + class {}', '({ m() {} })', '({ get a() { return 1; } })', 'x => { return x; }', 'if (a) b', 'var a = 1'];

describe('parseExpressionNode', () => {
	it.each(sameAsAcorn)('matches acorn for %j', (text) => {
		expect(plain(parseExpressionNode(text))).toStrictEqual(plain(acornExpression(text)));
	});

	it.each(rejectedLikeAcorn)('rejects %j like acorn', (text) => {
		expect(() => acornExpression(text)).toThrow();
		expect(() => parseExpressionNode(text)).toThrow(SyntaxError);
	});

	it.each(unsupported)('rejects %j, which needs statement or function body parsing', (text) => {
		expect(() => acornExpression(text)).not.toThrow();
		expect(() => parseExpressionNode(text)).toThrow(/Unsupported/);
	});

	it('returns undefined when the text has no top-level expression statement', () => {
		expect(parseExpressionNode('{ a: 1 }')).toBeUndefined();
		expect(parseExpressionNode('label: a')).toBeUndefined();
		expect(parseExpressionNode(';')).toBeUndefined();
		expect(parseExpressionNode('')).toBeUndefined();
	});

	it('produces plain objects that the binding evaluator can mutate', () => {
		const node = parseExpressionNode('value | converter(arg)');
		expect(Object.getPrototypeOf(node)).toBe(Object.prototype);
		expect(node.right.arguments).toEqual([expect.objectContaining({ type: 'Identifier', name: 'arg' })]);
	});
});
