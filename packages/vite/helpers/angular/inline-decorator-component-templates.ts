import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const DECORATE_ASSIGNMENT_RE = /(^|[^\w$.])([A-Za-z_$][\w$]*)\s*=\s*__decorate\s*\(/gm;
const REGION_RE = /\/\/#region\s+([^\n]+)/g;
const REGION_SOURCE_SUFFIX_RE = /\.(?:[cm]?[jt]sx?)(?=\/)/;

export function inlineDecoratorComponentTemplates(code: string, options: { projectRoot: string }): string {
	let changed = false;
	let lastIndex = 0;
	let output = '';

	for (const match of code.matchAll(DECORATE_ASSIGNMENT_RE)) {
		const prefix = match[1] ?? '';
		const assignmentStart = (match.index ?? 0) + prefix.length;
		const equalsIndex = code.indexOf('=', assignmentStart);
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
		const sourceFile = findEnclosingRegionPath(code, assignmentStart);
		if (!sourceFile) {
			continue;
		}

		const decorateCall = code.slice(decorateIndex, closeParenIndex + 1);
		const inlinedDecorateCall = inlineComponentDecoratorTemplate(decorateCall, sourceFile, options.projectRoot);
		if (!inlinedDecorateCall || inlinedDecorateCall === decorateCall) {
			continue;
		}

		output += code.slice(lastIndex, decorateIndex);
		output += inlinedDecorateCall;
		output += code.slice(closeParenIndex + 1, statementEnd);
		lastIndex = statementEnd;
		changed = true;
	}

	if (!changed) {
		return code;
	}

	output += code.slice(lastIndex);
	return output;
}

function inlineComponentDecoratorTemplate(decorateCall: string, sourceFile: string, projectRoot: string): string | null {
	const decorators = splitDecoratorArray(decorateCall);
	const componentDecorator = decorators.find(isComponentDecorator);
	if (!componentDecorator) {
		return null;
	}

	const componentDecoratorName = componentDecorator.match(/(?:^|\W)(Component(?:\$\d+)?)\s*\(/)?.[1];
	if (!componentDecoratorName) {
		return null;
	}

	const componentArgs = extractCallArgs(componentDecorator, componentDecoratorName);
	if (!componentArgs) {
		return null;
	}

	const trimmedArgs = componentArgs.trim();
	if (!trimmedArgs.startsWith('{') || !trimmedArgs.endsWith('}')) {
		return null;
	}

	const sourceDirs = resolveSourceDirs(projectRoot, sourceFile);
	const properties = splitTopLevel(trimmedArgs.slice(1, -1)).map((property) => {
		const colonIndex = property.indexOf(':');
		return {
			raw: property,
			key: colonIndex === -1 ? null : property.slice(0, colonIndex).trim(),
			value: colonIndex === -1 ? null : property.slice(colonIndex + 1).trim(),
		};
	});
	const inlineStyles = collectInlineStyles(properties, sourceDirs);
	let changed = false;
	let hasInlineTemplate = false;
	let emittedInlineStyles = false;
	const newProperties: string[] = [];

	for (const property of properties) {
		if (!property.key || !property.value) {
			newProperties.push(property.raw);
			continue;
		}

		const key = property.key;
		const value = property.value;
		if (key === 'template') {
			hasInlineTemplate = true;
			newProperties.push(property.raw);
			continue;
		}

		if (key !== 'templateUrl' || hasInlineTemplate) {
			if (key === 'styles' && inlineStyles.length) {
				newProperties.push(mergeStylesProperty(value, inlineStyles));
				emittedInlineStyles = true;
				changed = true;
				continue;
			}

			if ((key === 'styleUrl' || key === 'styleUrls') && inlineStyles.length) {
				if (!emittedInlineStyles) {
					newProperties.push(`styles: [${inlineStyles.join(', ')}]`);
					emittedInlineStyles = true;
				}
				changed = true;
				continue;
			}

			newProperties.push(property.raw);
			continue;
		}

		const relativeTemplatePath = stripQuotes(value);
		const templatePath = sourceDirs.map((sourceDir) => resolve(sourceDir, relativeTemplatePath)).find((candidate) => existsSync(candidate));
		if (!templatePath) {
			newProperties.push(property.raw);
			continue;
		}

		changed = true;
		newProperties.push(`template: ${JSON.stringify(readFileSync(templatePath, 'utf8'))}`);
	}

	if (inlineStyles.length && !emittedInlineStyles) {
		newProperties.push(`styles: [${inlineStyles.join(', ')}]`);
		changed = true;
	}

	if (!changed) {
		return null;
	}

	const updatedDecorator = componentDecorator.replace(componentArgs, `{ ${newProperties.join(', ')} }`);
	return decorateCall.replace(componentDecorator, updatedDecorator);
}

function resolveSourceDirs(projectRoot: string, sourceFile: string): string[] {
	const candidates = [sourceFile, normalizeRegionSourceFile(sourceFile)];
	const resolvedDirs: string[] = [];

	for (const candidate of candidates) {
		const resolvedDir = dirname(resolve(projectRoot, candidate));
		if (!resolvedDirs.includes(resolvedDir)) {
			resolvedDirs.push(resolvedDir);
		}
	}

	return resolvedDirs;
}

function collectInlineStyles(properties: Array<{ raw: string; key: string | null; value: string | null }>, sourceDirs: string[]): string[] {
	const styleProperties = properties.filter((property) => property.key === 'styleUrl' || property.key === 'styleUrls');
	if (!styleProperties.length) {
		return [];
	}

	const inlineStyles: string[] = [];
	for (const property of styleProperties) {
		const styleValues = extractStringList(property.value);
		if (!styleValues.length) {
			return [];
		}

		for (const styleValue of styleValues) {
			const stylePath = sourceDirs.map((sourceDir) => resolve(sourceDir, styleValue)).find((candidate) => existsSync(candidate));
			if (!stylePath) {
				return [];
			}

			inlineStyles.push(JSON.stringify(readFileSync(stylePath, 'utf8')));
		}
	}

	return inlineStyles;
}

function extractStringList(value: string | null): string[] {
	if (!value) {
		return [];
	}

	const trimmed = value.trim();
	if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
		return splitTopLevel(trimmed.slice(1, -1))
			.map((entry) => stripQuotes(entry.trim()))
			.filter(Boolean);
	}

	return [stripQuotes(trimmed)].filter(Boolean);
}

function mergeStylesProperty(value: string, inlineStyles: string[]): string {
	const trimmed = value.trim();
	if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
		const existingValues = trimmed.slice(1, -1).trim();
		const separator = existingValues ? ', ' : '';
		return `styles: [${existingValues}${separator}${inlineStyles.join(', ')}]`;
	}

	return `styles: [...(${trimmed}), ${inlineStyles.join(', ')}]`;
}

function normalizeRegionSourceFile(sourceFile: string): string {
	const match = REGION_SOURCE_SUFFIX_RE.exec(sourceFile);
	if (!match) {
		return sourceFile;
	}

	return sourceFile.slice(0, match.index + match[0].length);
}

function findEnclosingRegionPath(code: string, index: number): string | null {
	let regionPath: string | null = null;
	for (const match of code.matchAll(REGION_RE)) {
		if ((match.index ?? 0) >= index) {
			break;
		}
		regionPath = match[1]?.trim() ?? null;
	}
	return regionPath;
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

function isComponentDecorator(decorator: string): boolean {
	return /(?:^|\W)Component(?:\$\d+)?\s*\(/.test(decorator);
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

function stripQuotes(value: string): string {
	if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'")) || (value.startsWith('`') && value.endsWith('`'))) {
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

function escapeRegex(value: string): string {
	return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
