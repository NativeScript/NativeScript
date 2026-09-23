import { findMatchingDelimiter, findStatementEnd, splitTopLevel, stripQuotes } from './js-lexer.js';

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

// Comment-aware JS lexer helpers live in ./js-lexer.ts
