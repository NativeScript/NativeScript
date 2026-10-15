import { parse } from 'css';

/**
 * Rejoins selectors that `css` split at an escaped comma.
 *
 * `css` splits a rule's selector list on every comma outside parentheses, and
 * treats an escaped `\(` as a parenthesis for that purpose, so an escaped
 * `\,` inside a class name splits the class: Tailwind's
 * `.grid-cols-\[repeat\(auto-fill\,minmax\(260\,1fr\)\)\]` became
 * `.grid-cols-\[repeat\(auto-fill\` and `minmax\(260\,1fr\)\)\]`, neither of
 * which matches anything. A piece that ends in an odd number of backslashes
 * ended on an escaped comma, so it is glued back to the next one.
 */
export function joinEscapedSelectorCommas(selectors: string[]): string[] {
	const joined: string[] = [];
	for (const selector of selectors) {
		const previous = joined[joined.length - 1];
		if (previous !== undefined && /(?:^|[^\\])(?:\\\\)*\\$/.test(previous)) {
			joined[joined.length - 1] = `${previous},${selector}`;
		} else {
			joined.push(selector);
		}
	}
	return joined;
}

function repairRules(rules: any[] | undefined): void {
	if (!Array.isArray(rules)) return;
	for (const rule of rules) {
		if (Array.isArray(rule?.selectors)) {
			rule.selectors = joinEscapedSelectorCommas(rule.selectors);
		}
		// @media, @supports, @document, @host, ... nest their rules.
		repairRules(rule?.rules);
	}
}

// The at-rules `css` knows how to parse (its lib/parse `atrule()`).
const PARSEABLE_AT_RULE = /^(?:(?:-[\w]+-)?(?:keyframes|document)|media|custom-media|supports|import|charset|namespace|page|host|font-face)$/i;
// Top-level statements that have to stay ahead of every rule.
const LEADING_AT_RULE = /^(?:charset|import|namespace|layer)$/i;

interface CssItem {
	start: number;
	end: number;
	/** `{` and its matching `}` (or the end of the input), for a block. */
	open?: number;
	close?: number;
	children?: CssItem[];
}

/**
 * Splits `css[from..]` into statements (`…;`) and blocks (`… { … }`) up to the
 * first unmatched `}`, skipping comments, strings and escapes, and `;` inside
 * parentheses (`url(data:…;base64,…)`). Every character lands in exactly one
 * item, so the items rejoin to the original text.
 */
function splitCssItems(css: string, from: number, nested: boolean): { items: CssItem[]; end: number } {
	const items: CssItem[] = [];
	let start = from;
	let parens = 0;
	let i = from;
	while (i < css.length) {
		const ch = css[i];
		if (ch === '/' && css[i + 1] === '*') {
			const close = css.indexOf('*/', i + 2);
			i = close === -1 ? css.length : close + 2;
			continue;
		}
		if (ch === '"' || ch === "'") {
			i++;
			while (i < css.length && css[i] !== ch && css[i] !== '\n') {
				i += css[i] === '\\' ? 2 : 1;
			}
			i++;
			continue;
		}
		if (ch === '\\') {
			i += 2;
			continue;
		}
		if (ch === '(') {
			parens++;
		} else if (ch === ')') {
			parens = Math.max(0, parens - 1);
		} else if (ch === ';' && parens === 0) {
			items.push({ start, end: i + 1 });
			start = i + 1;
		} else if (ch === '{') {
			const inner = splitCssItems(css, i + 1, true);
			const end = Math.min(inner.end + 1, css.length);
			items.push({ start, end, open: i, close: inner.end, children: inner.items });
			start = i = end;
			parens = 0;
			continue;
		} else if (ch === '}' && nested) {
			break;
		}
		i++;
	}
	i = Math.min(i, css.length);
	if (start < i) {
		items.push({ start, end: i });
	}
	return { items, end: i };
}

/** The at-rule an item starts with, past any whitespace and comments. */
function cssItemAtRule(css: string, item: CssItem): { name: string; prelude: string } | null {
	const prelude = css
		.slice(item.start, item.open ?? item.end)
		.replace(/\/\*[\s\S]*?(?:\*\/|$)/g, ' ')
		.trim();
	const match = /^@([-\w]+)/.exec(prelude);
	return match ? { name: match[1].toLowerCase(), prelude: prelude.slice(match[0].length).replace(/;$/, '').trim() } : null;
}

/**
 * Rewrites the at-rules `css` can't parse into CSS it can.
 *
 * `css` reads an at-rule it doesn't know (`@layer`, `@container`,
 * `@starting-style`, `@property`, ...) as the start of a selector, and the
 * first one ends the parse: every rule after it is lost. Bootstrap 6 wraps its
 * whole stylesheet in `@layer`s, and Tailwind 4 emits `@layer` and `@property`.
 * Core's styling only reads rules, `@media` and `@keyframes` (plus `@import`),
 * so nothing it uses is in these at-rules except the rules inside `@layer`:
 *
 * - `@layer` blocks are replaced with their rules. Top-level layers are moved
 *   ahead of the unlayered rules in layer order (first mention, including
 *   `@layer a, b;`), which is how the cascade orders them: unlayered rules
 *   beat every layer, and a later layer beats an earlier one. A layer nested
 *   in another at-rule is unwrapped where it is. `@layer a, b;` is removed.
 * - Every other at-rule `css` doesn't know is removed, with its block.
 *
 * Text outside those at-rules is kept as written, and a stylesheet without
 * them is returned unchanged.
 */
export function normalizeCssAtRules(css: string): string {
	let foreign = false;
	for (const match of css.matchAll(/@([-\w]+)/g)) {
		if (!PARSEABLE_AT_RULE.test(match[1])) {
			foreign = true;
			break;
		}
	}
	if (!foreign) return css;

	const { items } = splitCssItems(css, 0, false);

	// Layer order is the order of first mention, in `@layer a, b;` or a block.
	const layerOrder: (string | symbol)[] = [];
	const layers = new Map<string | symbol, string[]>();
	const blockLayer = new Map<CssItem, string | symbol>();
	const declareLayer = (name: string | symbol) => {
		if (!layers.has(name)) {
			layerOrder.push(name);
			layers.set(name, []);
		}
	};
	for (const item of items) {
		const atRule = cssItemAtRule(css, item);
		if (atRule?.name !== 'layer') continue;
		const names = atRule.prelude
			.split(',')
			.map((name) => name.trim())
			.filter(Boolean);
		if (item.children) {
			// A nameless block is a layer of its own.
			const name = names[0] ?? Symbol('anonymous layer');
			blockLayer.set(item, name);
			declareLayer(name);
		} else {
			names.forEach(declareLayer);
		}
	}

	const write = (items: CssItem[], topLevel: boolean): string => {
		let out = '';
		for (const item of items) {
			const atRule = cssItemAtRule(css, item);
			if (atRule && !PARSEABLE_AT_RULE.test(atRule.name)) {
				if (atRule.name !== 'layer' || !item.children) continue;
				const content = write(item.children, false);
				if (!topLevel) {
					out += content;
					continue;
				}
				layers.get(blockLayer.get(item)!)!.push(content);
				continue;
			}
			out += item.children ? css.slice(item.start, item.open! + 1) + write(item.children, false) + css.slice(item.close!, item.end) : css.slice(item.start, item.end);
		}
		return out;
	};

	// `@charset`/`@import`/`@namespace` stay first; layered rules follow.
	let head = 0;
	while (head < items.length && !items[head].children && LEADING_AT_RULE.test(cssItemAtRule(css, items[head])?.name ?? '')) {
		head++;
	}
	const leading = write(items.slice(0, head), true);
	const rest = write(items.slice(head), true);
	const layered = layerOrder.flatMap((name) => layers.get(name)!);
	if (!layered.length) return leading + rest;
	return leading + '\n' + layered.join('\n') + '\n' + rest;
}

/**
 * `css`'s parse, with at-rules it can't read rewritten first (see
 * normalizeCssAtRules) and selector lists repaired (see
 * joinEscapedSelectorCommas).
 */
export function parseCssAst(code: string, options?: { silent?: boolean; source?: string }): any {
	const ast: any = parse(normalizeCssAtRules(code), options);
	repairRules(ast?.stylesheet?.rules);
	return ast;
}
