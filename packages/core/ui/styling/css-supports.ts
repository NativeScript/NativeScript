import { _isCssDeclarationSupported, isCssVariable } from '../core/properties';
import { createSelector, InvalidSelector } from './css-selector';
import { Trace } from './styling-shared';

type SupportsPart = { kind: 'group'; name: string; body: string } | { kind: 'keyword'; value: string };

class SupportsSyntaxError extends Error {}

const IDENT_START_RE = /[a-zA-Z_-]/;
const IDENT_RE = /[\w-]/;
const PROPERTY_NAME_RE = /^-?-?[a-zA-Z_][\w-]*$/;

/**
 * Evaluate an `@supports` condition against what core can parse.
 * A declaration test passes when core knows the property and parses the value;
 * `selector()` passes when core parses the selector. Anything else evaluates to
 * false, and an invalid condition fails as a whole.
 * @see https://drafts.csswg.org/css-conditional-3/#at-supports
 */
export function evaluateSupportsCondition(condition: string): boolean {
	try {
		return evaluateCondition(condition);
	} catch (e) {
		if (!(e instanceof SupportsSyntaxError)) {
			throw e;
		}

		warn(`Invalid @supports condition [${condition}], ignoring its rules.`);

		return false;
	}
}

function evaluateCondition(text: string): boolean {
	const parts = splitCondition(text);
	if (!parts.length) {
		throw new SupportsSyntaxError();
	}

	const first = parts[0];
	if (first.kind === 'keyword') {
		if (first.value !== 'not' || parts.length !== 2 || parts[1].kind !== 'group') {
			throw new SupportsSyntaxError();
		}

		return !evaluateInParens(parts[1]);
	}

	if (parts.length % 2 === 0) {
		throw new SupportsSyntaxError();
	}

	// `and` and `or` cannot be mixed without parentheses, so every operator must match the first.
	let operator: string;
	let result = evaluateInParens(first);
	for (let i = 1; i < parts.length; i += 2) {
		const keyword = parts[i];
		const operand = parts[i + 1];
		if (keyword.kind !== 'keyword' || (keyword.value !== 'and' && keyword.value !== 'or') || operand.kind !== 'group') {
			throw new SupportsSyntaxError();
		}

		if (operator && operator !== keyword.value) {
			throw new SupportsSyntaxError();
		}
		operator = keyword.value;

		const value = evaluateInParens(operand);
		result = operator === 'and' ? result && value : result || value;
	}

	return result;
}

function evaluateInParens(group: SupportsPart & { kind: 'group' }): boolean {
	if (group.name === 'selector') {
		return isSelectorSupported(group.body.trim());
	}

	if (group.name) {
		warn(`Unsupported @supports function [${group.name}(${group.body})] evaluates to false.`);

		return false;
	}

	const body = group.body.trim();
	if (body[0] === '(' || /^not\s*\(/i.test(body)) {
		return evaluateCondition(body);
	}

	const colon = indexOfTopLevel(body, ':');
	const property = colon === -1 ? '' : body.substring(0, colon).trim();
	if (!PROPERTY_NAME_RE.test(property)) {
		warn(`Unsupported @supports test [(${body})] evaluates to false.`);

		return false;
	}

	const cssName = isCssVariable(property) ? property : property.toLowerCase();
	const value = body
		.substring(colon + 1)
		.replace(/!\s*important\s*$/i, '')
		.trim();

	const supported = _isCssDeclarationSupported(cssName, value);
	if (supported === undefined) {
		warn(`Unknown property in @supports test [(${body})] evaluates to false.`);

		return false;
	}

	return supported;
}

function isSelectorSupported(selector: string): boolean {
	return !!selector && !(createSelector(selector) instanceof InvalidSelector);
}

/**
 * Split a condition into its top-level parts: parenthesized groups, function
 * groups such as `selector(...)`, and the `not` / `and` / `or` keywords between them.
 */
function splitCondition(text: string): SupportsPart[] {
	const parts: SupportsPart[] = [];
	let i = 0;

	while (i < text.length) {
		const char = text[i];
		if (/\s/.test(char)) {
			i++;
			continue;
		}

		let name = '';
		if (IDENT_START_RE.test(char)) {
			const start = i;
			while (i < text.length && IDENT_RE.test(text[i])) {
				i++;
			}
			name = text.substring(start, i).toLowerCase();

			if (text[i] !== '(') {
				parts.push({ kind: 'keyword', value: name });
				continue;
			}
		} else if (char !== '(') {
			throw new SupportsSyntaxError();
		}

		const end = indexOfClosingParen(text, i);
		parts.push({ kind: 'group', name, body: text.substring(i + 1, end) });
		i = end + 1;
	}

	return parts;
}

function indexOfClosingParen(text: string, open: number): number {
	let depth = 0;
	for (let i = open; i < text.length; i++) {
		const char = text[i];
		if (char === '"' || char === "'") {
			i = indexOfClosingQuote(text, i);
		} else if (char === '(') {
			depth++;
		} else if (char === ')' && --depth === 0) {
			return i;
		}
	}

	throw new SupportsSyntaxError();
}

function indexOfTopLevel(text: string, target: string): number {
	let depth = 0;
	for (let i = 0; i < text.length; i++) {
		const char = text[i];
		if (char === '"' || char === "'") {
			i = indexOfClosingQuote(text, i);
		} else if (char === '(') {
			depth++;
		} else if (char === ')') {
			depth--;
		} else if (char === target && depth === 0) {
			return i;
		}
	}

	return -1;
}

function indexOfClosingQuote(text: string, open: number): number {
	const quote = text[open];
	for (let i = open + 1; i < text.length; i++) {
		if (text[i] === '\\') {
			i++;
		} else if (text[i] === quote) {
			return i;
		}
	}

	throw new SupportsSyntaxError();
}

function warn(message: string): void {
	if (Trace.isEnabled()) {
		Trace.write(message, Trace.categories.Style, Trace.messageType.warn);
	}
}
