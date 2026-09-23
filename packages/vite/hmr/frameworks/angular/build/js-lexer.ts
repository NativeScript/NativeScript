// Comment- and string-aware lexing helpers shared by the Angular source
// rewriters. They operate on raw source (not an AST) so they can run on the
// partially-transformed output the linker/decorator passes produce.

export function findStatementEnd(source: string, startIndex: number): number {
	let index = startIndex;
	while (index < source.length && /\s/.test(source[index])) {
		index++;
	}
	if (source[index] === ';') {
		return index + 1;
	}
	return startIndex;
}

export function stripQuotes(value: string): string {
	if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'")) || (value.startsWith('`') && value.endsWith('`'))) {
		return value.slice(1, -1);
	}
	return value;
}

// Returns the index of the delimiter that closes the one at `openIndex`,
// skipping over strings, template literals, and comments. Returns -1 when the
// open char is missing or unbalanced.
export function findMatchingDelimiter(source: string, openIndex: number, openChar: string, closeChar: string): number {
	if (openIndex < 0 || source[openIndex] !== openChar) {
		return -1;
	}

	let depth = 0;
	let quote: string | null = null;
	let escape = false;
	let inLineComment = false;
	let inBlockComment = false;

	for (let index = openIndex; index < source.length; index++) {
		const char = source[index];
		const next = source[index + 1];

		if (inLineComment) {
			if (char === '\n') {
				inLineComment = false;
			}
			continue;
		}

		if (inBlockComment) {
			if (char === '*' && next === '/') {
				inBlockComment = false;
				index++;
			}
			continue;
		}

		if (quote) {
			if (escape) {
				escape = false;
				continue;
			}
			if (char === '\\') {
				escape = true;
				continue;
			}
			if (char === quote) {
				quote = null;
			}
			continue;
		}

		if (char === '/' && next === '/') {
			inLineComment = true;
			index++;
			continue;
		}

		if (char === '/' && next === '*') {
			inBlockComment = true;
			index++;
			continue;
		}

		if (char === '"' || char === "'" || char === '`') {
			quote = char;
			continue;
		}

		if (char === openChar) {
			depth++;
		} else if (char === closeChar) {
			depth--;
			if (depth === 0) {
				return index;
			}
		}
	}

	return -1;
}

// Splits a comma-separated list at top level only, ignoring commas nested in
// parentheses, brackets, braces, strings, or comments.
export function splitTopLevel(source: string): string[] {
	const parts: string[] = [];
	let start = 0;
	let parenDepth = 0;
	let bracketDepth = 0;
	let braceDepth = 0;
	let quote: string | null = null;
	let escape = false;
	let inLineComment = false;
	let inBlockComment = false;

	for (let index = 0; index < source.length; index++) {
		const char = source[index];
		const next = source[index + 1];

		if (inLineComment) {
			if (char === '\n') {
				inLineComment = false;
			}
			continue;
		}

		if (inBlockComment) {
			if (char === '*' && next === '/') {
				inBlockComment = false;
				index++;
			}
			continue;
		}

		if (quote) {
			if (escape) {
				escape = false;
				continue;
			}
			if (char === '\\') {
				escape = true;
				continue;
			}
			if (char === quote) {
				quote = null;
			}
			continue;
		}

		if (char === '/' && next === '/') {
			inLineComment = true;
			index++;
			continue;
		}

		if (char === '/' && next === '*') {
			inBlockComment = true;
			index++;
			continue;
		}

		if (char === '"' || char === "'" || char === '`') {
			quote = char;
			continue;
		}

		if (char === '(') {
			parenDepth++;
			continue;
		}

		if (char === ')') {
			parenDepth--;
			continue;
		}

		if (char === '[') {
			bracketDepth++;
			continue;
		}

		if (char === ']') {
			bracketDepth--;
			continue;
		}

		if (char === '{') {
			braceDepth++;
			continue;
		}

		if (char === '}') {
			braceDepth--;
			continue;
		}

		if (char === ',' && parenDepth === 0 && bracketDepth === 0 && braceDepth === 0) {
			const part = source.slice(start, index).trim();
			if (part) {
				parts.push(part);
			}
			start = index + 1;
		}
	}

	const tail = source.slice(start).trim();
	if (tail) {
		parts.push(tail);
	}

	return parts;
}
