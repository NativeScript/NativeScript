const DECORATE_ASSIGNMENT_RE = /(^|[^\w$.])([A-Za-z_$][\w$]*)\s*=\s*__decorate(?:\$\w+)?\s*\(/gm;

export function synthesizeDecoratorCtorParameters(code: string): string {
	let changed = false;
	let lastIndex = 0;
	let output = '';

	for (const match of code.matchAll(DECORATE_ASSIGNMENT_RE)) {
		const prefix = match[1] ?? '';
		const className = match[2];
		const assignmentStart = (match.index ?? 0) + prefix.length;
		const equalsIndex = code.indexOf('=', assignmentStart + className.length);
		const decorateIndex = code.indexOf('__decorate', equalsIndex);
		const openParenIndex = code.indexOf('(', decorateIndex);
		if (equalsIndex === -1 || decorateIndex === -1 || openParenIndex === -1 || hasCtorParameters(code, className)) {
			continue;
		}

		const closeParenIndex = findMatchingDelimiter(code, openParenIndex, '(', ')');
		if (closeParenIndex === -1) {
			continue;
		}

		const statementEnd = findStatementEnd(code, closeParenIndex + 1);
		const decorateCall = code.slice(decorateIndex, closeParenIndex + 1);
		const decorators = splitDecoratorArray(decorateCall);
		if (!decorators.some(isAngularClassDecorator)) {
			continue;
		}

		const paramTypes = extractParamTypes(decorators);
		if (!paramTypes?.length) {
			continue;
		}

		output += code.slice(lastIndex, assignmentStart);
		output += `${className}.ctorParameters = () => [${paramTypes.map((paramType) => `{ type: ${paramType} }`).join(', ')}];\n`;
		output += code.slice(assignmentStart, statementEnd);
		lastIndex = statementEnd;
		changed = true;
	}

	if (!changed) {
		return code;
	}

	output += code.slice(lastIndex);
	return output;
}

function hasCtorParameters(code: string, className: string): boolean {
	return [`${className}.ctorParameters`, `Object.defineProperty(${className}, "ctorParameters"`, `Object.defineProperty(${className}, 'ctorParameters'`].some((marker) => code.includes(marker));
}

function splitDecoratorArray(decorateCall: string): string[] {
	const openParenIndex = decorateCall.indexOf('(');
	const closeParenIndex = decorateCall.lastIndexOf(')');
	if (openParenIndex === -1 || closeParenIndex === -1) {
		return [];
	}

	const args = splitTopLevel(decorateCall.slice(openParenIndex + 1, closeParenIndex));
	if (!args.length) {
		return [];
	}

	const decoratorArray = args[0].trim();
	if (!decoratorArray.startsWith('[') || !decoratorArray.endsWith(']')) {
		return [];
	}

	return splitTopLevel(decoratorArray.slice(1, -1));
}

function extractParamTypes(decorators: string[]): string[] | null {
	for (const decorator of decorators) {
		if (!decorator.includes('__decorateMetadata')) {
			continue;
		}

		const openParenIndex = decorator.indexOf('(');
		const closeParenIndex = findMatchingDelimiter(decorator, openParenIndex, '(', ')');
		if (openParenIndex === -1 || closeParenIndex === -1) {
			continue;
		}

		const args = splitTopLevel(decorator.slice(openParenIndex + 1, closeParenIndex));
		if (args.length < 2 || stripQuotes(args[0].trim()) !== 'design:paramtypes') {
			continue;
		}

		const paramArray = args[1].trim();
		if (!paramArray.startsWith('[') || !paramArray.endsWith(']')) {
			continue;
		}

		return splitTopLevel(paramArray.slice(1, -1));
	}

	return null;
}

function isAngularClassDecorator(decorator: string): boolean {
	return /(?:^|\W)(?:Injectable|Component|Directive|Pipe|NgModule)(?:\$\d+)?\s*\(/.test(decorator);
}

function stripQuotes(value: string): string {
	if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
		return value.slice(1, -1);
	}
	return value;
}

function findStatementEnd(source: string, startIndex: number): number {
	let index = startIndex;
	while (index < source.length && /\s/.test(source[index])) {
		index++;
	}
	if (source[index] === ';') {
		return index + 1;
	}
	return startIndex;
}

function findMatchingDelimiter(source: string, openIndex: number, openChar: string, closeChar: string): number {
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

function splitTopLevel(source: string): string[] {
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
			parts.push(source.slice(start, index).trim());
			start = index + 1;
		}
	}

	const tail = source.slice(start).trim();
	if (tail) {
		parts.push(tail);
	}

	return parts;
}
