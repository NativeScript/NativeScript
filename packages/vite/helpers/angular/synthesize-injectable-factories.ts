const DECORATE_ASSIGNMENT_RE = /(^|[^\w$.])([A-Za-z_$][\w$]*)\s*=\s*__decorate(?:\$\w+)?\s*\(/gm;
const SYNTHETIC_INJECT_IDENTIFIER = '__nsInject';

export function synthesizeMissingInjectableFactories(code: string, options: { vendorInjectExport?: string } = {}): string {
	let changed = false;
	let requiresInjectHelper = false;
	let lastIndex = 0;
	let output = '';

	for (const match of code.matchAll(DECORATE_ASSIGNMENT_RE)) {
		const prefix = match[1] ?? '';
		const className = match[2];
		const assignmentStart = (match.index ?? 0) + prefix.length;
		const equalsIndex = code.indexOf('=', assignmentStart + className.length);
		const decorateIndex = code.indexOf('__decorate', equalsIndex);
		const openParenIndex = code.indexOf('(', decorateIndex);
		if (equalsIndex === -1 || decorateIndex === -1 || openParenIndex === -1) {
			continue;
		}

		const closeParenIndex = findMatchingDelimiter(code, openParenIndex, '(', ')');
		if (closeParenIndex === -1) {
			continue;
		}

		const statementEnd = findStatementEnd(code, closeParenIndex + 1);
		if (hasInjectableMetadata(code, className)) {
			continue;
		}

		const decorateCall = code.slice(decorateIndex, closeParenIndex + 1);
		const paramTypes = resolveParamTypes(code, className, assignmentStart, decorateCall);
		if (!paramTypes) {
			continue;
		}

		if (paramTypes.length > 0 && !options.vendorInjectExport) {
			continue;
		}

		const synthesized = buildInjectableMetadata(className, decorateCall, paramTypes);
		if (!synthesized) {
			continue;
		}
		requiresInjectHelper ||= paramTypes.length > 0;

		output += code.slice(lastIndex, assignmentStart);
		output += `${synthesized}\n`;
		output += code.slice(assignmentStart, statementEnd);
		lastIndex = statementEnd;
		changed = true;
	}

	if (!changed) {
		return code;
	}

	output += code.slice(lastIndex);
	if (!requiresInjectHelper) {
		return output;
	}

	return ensureInjectHelperImport(output, options.vendorInjectExport);
}

function buildInjectableMetadata(className: string, decorateCall: string, paramTypes: string[]): string | null {
	const openParenIndex = decorateCall.indexOf('(');
	const closeParenIndex = decorateCall.lastIndexOf(')');
	if (openParenIndex === -1 || closeParenIndex === -1) {
		return null;
	}

	const args = splitTopLevel(decorateCall.slice(openParenIndex + 1, closeParenIndex));
	if (args.length < 2) {
		return null;
	}

	const decoratorArray = args[0].trim();
	if (!decoratorArray.startsWith('[') || !decoratorArray.endsWith(']')) {
		return null;
	}

	const decorators = splitTopLevel(decoratorArray.slice(1, -1));
	const injectableDecorator = decorators.find(isInjectableDecorator);
	if (!injectableDecorator) {
		return null;
	}

	const ctorArgs = paramTypes.map((param) => `${SYNTHETIC_INJECT_IDENTIFIER}(${param})`).join(', ');
	const factory = `Object.defineProperty(${className}, "ɵfac", { value: function ${className}_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || ${className})(${ctorArgs}); }, configurable: true, writable: true });`;

	const providedIn = extractProvidedIn(injectableDecorator);
	const provider = `Object.defineProperty(${className}, "ɵprov", { value: /* @__PURE__ */ ({ token: ${className}, providedIn: ${providedIn ?? 'null'}, factory: ${className}.ɵfac, value: undefined }), configurable: true, writable: true });`;

	return `${factory}\n${provider}`;
}

function hasInjectableMetadata(code: string, className: string): boolean {
	return [`${className}.ɵfac`, `${className}.ɵprov`, `Object.defineProperty(${className}, "ɵfac"`, `Object.defineProperty(${className}, 'ɵfac'`, `Object.defineProperty(${className}, "ɵprov"`, `Object.defineProperty(${className}, 'ɵprov'`].some((marker) => code.includes(marker));
}

function ensureInjectHelperImport(code: string, vendorInjectExport?: string): string {
	if (!vendorInjectExport || code.includes(` as ${SYNTHETIC_INJECT_IDENTIFIER}`) || code.includes(` ${SYNTHETIC_INJECT_IDENTIFIER} from `)) {
		return code;
	}

	const importStatement = `import { ${vendorInjectExport} as ${SYNTHETIC_INJECT_IDENTIFIER} } from "./vendor.mjs";\n`;
	const importMatches = [...code.matchAll(/^import[\s\S]*?;\n?/gm)];
	if (!importMatches.length) {
		return `${importStatement}${code}`;
	}

	const lastImport = importMatches[importMatches.length - 1];
	const insertIndex = (lastImport.index ?? 0) + lastImport[0].length;
	return `${code.slice(0, insertIndex)}${importStatement}${code.slice(insertIndex)}`;
}

function resolveParamTypes(code: string, className: string, assignmentStart: number, decorateCall: string): string[] | null {
	const explicitParamTypes = extractParamTypes(splitDecoratorArray(decorateCall));
	if (explicitParamTypes) {
		return explicitParamTypes;
	}

	const classBody = extractClassBody(code, className, assignmentStart);
	if (classBody == null) {
		return null;
	}

	const constructorParams = extractConstructorParams(classBody);
	if (constructorParams == null) {
		return [];
	}

	if (!constructorParams.trim()) {
		return [];
	}

	if (isSyntheticRestConstructor(classBody, constructorParams)) {
		return [];
	}

	return null;
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
		if (args.length < 2) {
			continue;
		}

		const metadataKey = stripQuotes(args[0].trim());
		if (metadataKey !== 'design:paramtypes') {
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

function splitDecoratorArray(decorateCall: string): string[] {
	const openParenIndex = decorateCall.indexOf('(');
	const closeParenIndex = decorateCall.lastIndexOf(')');
	if (openParenIndex === -1 || closeParenIndex === -1) {
		return [];
	}

	const args = splitTopLevel(decorateCall.slice(openParenIndex + 1, closeParenIndex));
	if (args.length < 1) {
		return [];
	}

	const decoratorArray = args[0].trim();
	if (!decoratorArray.startsWith('[') || !decoratorArray.endsWith(']')) {
		return [];
	}

	return splitTopLevel(decoratorArray.slice(1, -1));
}

function extractClassBody(code: string, className: string, assignmentStart: number): string | null {
	const prefix = code.slice(0, assignmentStart);
	const classMarkers = [`var ${className} = class ${className}`, `let ${className} = class ${className}`, `const ${className} = class ${className}`, `${className} = class ${className}`];
	const classStart = classMarkers.map((marker) => prefix.lastIndexOf(marker)).reduce((latest, current) => Math.max(latest, current), -1);
	if (classStart === -1) {
		return null;
	}

	const openBraceIndex = code.indexOf('{', classStart);
	const closeBraceIndex = findMatchingDelimiter(code, openBraceIndex, '{', '}');
	if (openBraceIndex === -1 || closeBraceIndex === -1) {
		return null;
	}

	return code.slice(openBraceIndex + 1, closeBraceIndex);
}

function extractConstructorParams(classBody: string): string | null {
	const constructorIndex = classBody.indexOf('constructor(');
	if (constructorIndex === -1) {
		return null;
	}

	const openParenIndex = classBody.indexOf('(', constructorIndex);
	const closeParenIndex = findMatchingDelimiter(classBody, openParenIndex, '(', ')');
	if (openParenIndex === -1 || closeParenIndex === -1) {
		return null;
	}

	return classBody.slice(openParenIndex + 1, closeParenIndex);
}

function isSyntheticRestConstructor(classBody: string, constructorParams: string): boolean {
	const restMatch = constructorParams.trim().match(/^\.\.\.\s*([A-Za-z_$][\w$]*)$/);
	if (!restMatch) {
		return false;
	}

	const restName = restMatch[1];
	const constructorIndex = classBody.indexOf('constructor(');
	const openBraceIndex = classBody.indexOf('{', constructorIndex);
	const closeBraceIndex = findMatchingDelimiter(classBody, openBraceIndex, '{', '}');
	if (constructorIndex === -1 || openBraceIndex === -1 || closeBraceIndex === -1) {
		return false;
	}

	const constructorBody = classBody.slice(openBraceIndex + 1, closeBraceIndex);
	return new RegExp(`\\bsuper\\(\\.\\.\\.${escapeRegex(restName)}\\);`).test(constructorBody);
}

function extractProvidedIn(decorator: string): string | null {
	const args = extractCallArgs(decorator, 'Injectable');
	if (!args) {
		return null;
	}

	const trimmed = args.trim();
	if (!trimmed.startsWith('{') || !trimmed.endsWith('}')) {
		return null;
	}

	for (const property of splitTopLevel(trimmed.slice(1, -1))) {
		const colonIndex = property.indexOf(':');
		if (colonIndex === -1) {
			continue;
		}

		const key = property.slice(0, colonIndex).trim();
		if (key !== 'providedIn') {
			continue;
		}

		const value = property.slice(colonIndex + 1).trim();
		return value || null;
	}

	return null;
}

function isInjectableDecorator(decorator: string): boolean {
	return /(?:^|\W)Injectable\s*\(/.test(decorator);
}

function extractCallArgs(source: string, callName: string): string | null {
	const nameIndex = source.search(new RegExp(`(?:^|\\W)${escapeRegex(callName)}\\s*\\(`));
	if (nameIndex === -1) {
		return null;
	}

	const openParenIndex = source.indexOf('(', nameIndex);
	const closeParenIndex = findMatchingDelimiter(source, openParenIndex, '(', ')');
	if (openParenIndex === -1 || closeParenIndex === -1) {
		return null;
	}

	return source.slice(openParenIndex + 1, closeParenIndex);
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

function stripQuotes(value: string): string {
	if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
		return value.slice(1, -1);
	}
	return value;
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
			continue;
		}

		if (char === closeChar) {
			depth--;
			if (depth === 0) {
				return index;
			}
		}
	}

	return -1;
}

function escapeRegex(value: string): string {
	return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
