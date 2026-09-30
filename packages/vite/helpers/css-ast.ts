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

/** `css`'s parse, with selector lists repaired (see joinEscapedSelectorCommas). */
export function parseCssAst(code: string, options?: { silent?: boolean; source?: string }): any {
	const ast: any = parse(code, options);
	repairRules(ast?.stylesheet?.rules);
	return ast;
}
