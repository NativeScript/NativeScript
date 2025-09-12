import { tokenize, TokenType } from '@csstools/css-tokenizer';
import { ComponentValue, FunctionNode, isCommentNode, isFunctionNode, isTokenNode, parseCommaSeparatedListOfComponentValues, parseListOfComponentValues, stringify, walk } from '@csstools/css-parser-algorithms';

const functionName: string = 'var';

export function parseCssVariableExpression(value: string, replaceWithCallback: (cssVarName: string) => string): string {
	const componentValueSet = parseCommaSeparatedListOfComponentValues(
		tokenize({
			css: value,
		}),
	);

	for (const componentValues of componentValueSet) {
		let unresolvedNode: ComponentValue = null;

		walk(componentValues, (entry, index) => {
			const componentValue = entry.node;

			if (isFunctionNode(componentValue) && componentValue.getName() === functionName) {
				const newNode = _parseCssVarFunctionArguments(componentValue, replaceWithCallback);
				const parentNodes = entry.parent.value;

				if (!newNode || !_replaceNode(index, newNode, parentNodes)) {
					unresolvedNode = componentValue;
					return false;
				}
			}
		});

		if (unresolvedNode) {
			const isSingleNode = componentValueSet.length === 1 && componentValueSet[0].length === 1 && componentValueSet[0][0] === unresolvedNode;
			if (!isSingleNode) {
				throw new Error(`Failed to resolve CSS variable '${unresolvedNode}' for expression: '${value}'`);
			}

			return 'unset';
		}
	}

	return stringify(componentValueSet).trim();
}

/**
 * Parses css variable functions and their fallback values.
 *
 * @param node
 * @param replaceWithCallback
 * @returns
 */
function _parseCssVarFunctionArguments(node: FunctionNode, replaceWithCallback: (cssVarName: string) => string): ComponentValue | ComponentValue[] {
	let cssVarName: string = null;
	let finalValue: ComponentValue | ComponentValue[] = null;
	let currentFallbackValues: ComponentValue[];

	const fallbackValueSet: ComponentValue[][] = [];

	node.forEach((entry) => {
		const childNode = entry.node;

		if (isCommentNode(childNode)) {
			return;
		}

		if (isTokenNode(childNode)) {
			const tokens = childNode.value;

			if (tokens[0] === TokenType.Ident) {
				if (tokens[1].startsWith('--')) {
					if (fallbackValueSet.length) {
						throw new Error('Invalid css variable function fallback value: ' + childNode);
					} else {
						// This is the first parsable parameter
						cssVarName = tokens[1];
					}
					return;
				}
			}

			// Track the fallback comma-separated values
			if (tokens[0] === TokenType.Comma) {
				currentFallbackValues = [];
				fallbackValueSet.push(currentFallbackValues);
				return;
			}
		}

		if (currentFallbackValues) {
			currentFallbackValues.push(childNode);
		}
	});

	// Resolve the css variable here and use a fallback value if it fails
	const cssVarValue = replaceWithCallback?.(cssVarName);

	if (cssVarValue) {
		finalValue = parseListOfComponentValues(
			tokenize({
				css: cssVarValue,
			}),
		);
	} else {
		// Switch to the first available fallback value if any
		for (const componentValues of fallbackValueSet) {
			let isValidFallback: boolean = true;

			walk(componentValues, (entry, index) => {
				const componentValue = entry.node;

				if (isFunctionNode(componentValue) && componentValue.getName() === functionName) {
					const nodeResult = _parseCssVarFunctionArguments(componentValue, replaceWithCallback);
					const parentNodes = entry.parent.value;

					if (!nodeResult || !_replaceNode(index, nodeResult, parentNodes)) {
						isValidFallback = false;
						return false; // Invalid fallback
					}
				}
			});

			if (isValidFallback) {
				finalValue = componentValues;
				break;
			}
		}
	}

	return finalValue;
}

function _replaceNode(index: string | number, newNode: ComponentValue | ComponentValue[], nodes: ComponentValue[]): boolean {
	if (typeof index !== 'number') {
		return false;
	}

	if (Array.isArray(newNode)) {
		nodes.splice(index, 1, ...newNode);
	} else {
		nodes.splice(index, 1, newNode);
	}

	return true;
}
