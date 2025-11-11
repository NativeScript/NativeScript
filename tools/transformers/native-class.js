const ts = require('typescript');

function before(_options, program) {
	const compilerOptions = program?.getCompilerOptions?.() ?? {};

	return (context) => {
		const factory = context.factory ?? ts.factory;

		return (sourceFile) => {
			let mutated = false;

			// Always preserve original top-level import declarations in final output
			const originalImportStatements = sourceFile.statements.filter((s) => ts.isImportDeclaration(s));

			const transformStatements = (statements, isTopLevel) => {
				let changed = false;
				const result = [];

				for (const statement of statements) {
					if (ts.isClassDeclaration(statement) && hasNativeClassDecorator(statement)) {
						mutated = true;
						changed = true;
						result.push(...emitDownleveledClass(statement));
						continue;
					}

					if (ts.isExpressionStatement(statement)) {
						const updated = removeNativeClassFromDecorate(factory, statement);
						if (updated === undefined) {
							mutated = true;
							changed = true;
							continue;
						}
						const visited = ts.visitEachChild(updated, visitNode, context);
						if (updated !== statement || visited !== statement) {
							mutated = true;
							changed = true;
						}
						result.push(visited);
						continue;
					}

					if (isTopLevel && ts.isImportDeclaration(statement)) {
						// Safety: Do not alter import declarations here. Earlier versions attempted to
						// remove `NativeClass` from named imports, but this proved too risky and could
						// accidentally elide unrelated imports in certain TS versions/configs. We keep
						// imports intact and rely on bundlers/TS to tree-shake if needed.
						result.push(statement);
						continue;
					}

					const visited = ts.visitEachChild(statement, visitNode, context);
					if (visited !== statement) {
						mutated = true;
						changed = true;
					}
					result.push(visited);
				}

				return [changed ? factory.createNodeArray(result) : statements, changed];
			};

			function visitNode(node) {
				if (ts.isBlock(node)) {
					const [blockStatements, changed] = transformStatements(node.statements, false);
					if (!changed) {
						return node;
					}
					return factory.updateBlock(node, blockStatements);
				}

				if (ts.isModuleBlock(node)) {
					const [moduleStatements, changed] = transformStatements(node.statements, false);
					if (!changed) {
						return node;
					}
					return factory.updateModuleBlock(node, moduleStatements);
				}

				if (ts.isCaseClause(node)) {
					const expression = ts.visitNode(node.expression, visitNode);
					const [clauseStatements, changed] = transformStatements(node.statements, false);
					if (expression !== node.expression) {
						mutated = true;
					}
					if (!changed && expression === node.expression) {
						return node;
					}
					return factory.updateCaseClause(node, expression ?? node.expression, clauseStatements);
				}

				if (ts.isDefaultClause(node)) {
					const [clauseStatements, changed] = transformStatements(node.statements, false);
					if (!changed) {
						return node;
					}
					mutated = true;
					return factory.updateDefaultClause(node, clauseStatements);
				}

				return ts.visitEachChild(node, visitNode, context);
			}

			const [updatedStatements] = transformStatements(sourceFile.statements, true);
			if (!mutated) {
				return sourceFile;
			}

			// Ensure imports are retained at the top in the updated source
			const nonImportStatements = updatedStatements.filter((s) => !ts.isImportDeclaration(s));
			const finalStatements = factory.createNodeArray([...originalImportStatements, ...nonImportStatements]);

			const updatedSource = factory.updateSourceFile(sourceFile, finalStatements);
			// Do NOT clear or rebind the entire SourceFile here. Doing so can break TS's
			// import usage analysis and lead to import elision. The factory/update API
			// preserves parents/bindings for original nodes (like imports). We only
			// synthesize/bind the newly inserted class replacement statements.
			return updatedSource;
		};
	};
}

function hasNativeClassDecorator(node) {
	const decorators = ts.getDecorators?.(node) ?? node.decorators;
	return !!decorators && decorators.some((decorator) => getIdentifierText(decorator) === 'NativeClass');
}

function emitDownleveledClass(node) {
	// Preserve leading trivia (including possible preceding import statements separated earlier by bundler) only remove the decorator itself.
	const stripped = node.getText().replace(/@NativeClass(?:\((?:.|\n)*?\))?\s*/gm, '');
	const downleveled = ts
		.transpileModule(stripped, {
compilerOptions: {
module: ts.ModuleKind.ESNext,
target: ts.ScriptTarget.ES5,
noEmitHelpers: true,
experimentalDecorators: true,
emitDecoratorMetadata: true,
useDefineForClassFields: false,
},
})
		.outputText.replace(/(Object\.defineProperty\(.*?{.*?)(enumerable:\s*false)(.*?}\))/gs, '$1enumerable: true$3');

	const helperSource = ts.createSourceFile(
		(node.getSourceFile()?.fileName ?? 'NativeClass.ts') + '.helper.js',
		downleveled,
		ts.ScriptTarget.ES5,
		true,
		ts.ScriptKind.JS,
	);

	const statements = [];
	for (const statement of helperSource.statements) {
		if (statement.kind === ts.SyntaxKind.EndOfFileToken) {
			continue;
		}
		// Explicitly skip import declarations accidentally re-emitted (shouldn't occur but defensive)
		if (ts.isImportDeclaration(statement)) {
			continue;
		}
		const prepared = prepareSynthesizedNode(statement, node);
		statements.push(prepared);
	}

	return statements;
}

function prepareSynthesizedNode(node, original) {
	const clone = ts.factory.cloneNode(node);
	markSynthesizedRecursive(clone);
	setSynthesizedRangeRecursive(clone);
	clearBindingRecursive(clone);
	setOriginalRecursive(clone, original);
	return clone;
}

function markSynthesizedRecursive(node) {
	if (!node || typeof node.kind !== 'number') {
		return;
	}

	if (typeof node.flags === 'number') {
		node.flags |= ts.NodeFlags.Synthesized;
	}

	ts.forEachChild(node, (child) => markSynthesizedRecursive(child));
}

function removeBindingData(node) {
	delete node.symbol;
	delete node.localSymbol;
	delete node.emitNode;
	delete node.flowNode;
	delete node.locals;
	delete node.nextContainer;
}

function clearBindingRecursive(node) {
	if (!node || typeof node.kind !== 'number') {
		return;
	}

	removeBindingData(node);
	ts.forEachChild(node, (child) => clearBindingRecursive(child));
}

function setSynthesizedRangeRecursive(node) {
	if (!node || typeof node.kind !== 'number') {
		return;
	}

	if (typeof node.pos === 'number') {
		node.pos = -1;
	}

	if (typeof node.end === 'number') {
		node.end = -1;
	}

	ts.forEachChild(node, (child) => setSynthesizedRangeRecursive(child));
}

function setParentRecursive(node, parent) {
	if (!node || typeof node.kind !== 'number') {
		return;
	}

	node.parent = parent;
	ts.forEachChild(node, (child) => setParentRecursive(child, node));
}

function setOriginalRecursive(node, original) {
	ts.setOriginalNode(node, original);
	ts.forEachChild(node, (child) => setOriginalRecursive(child, original));
}

function removeNativeClassFromDecorate(factory, statement) {
	const expr = statement.expression;
	if (!ts.isBinaryExpression(expr) || expr.operatorToken.kind !== ts.SyntaxKind.EqualsToken) {
		return statement;
	}

	const right = expr.right;
	if (!ts.isCallExpression(right) || getIdentifierText(right.expression) !== '__decorate' || right.arguments.length === 0) {
		return statement;
	}

	const arrayLiteral = right.arguments[0];
	if (!ts.isArrayLiteralExpression(arrayLiteral)) {
		return statement;
	}

	const retained = arrayLiteral.elements.filter((element) => getIdentifierText(element) !== 'NativeClass');
	if (retained.length === arrayLiteral.elements.length) {
		return statement;
	}

	if (retained.length === 0) {
		return undefined;
	}

	const updatedArray = factory.updateArrayLiteralExpression(arrayLiteral, retained);
	const updatedCall = factory.updateCallExpression(right, right.expression, right.typeArguments, [updatedArray, ...right.arguments.slice(1)]);
	const updatedBinary = factory.updateBinaryExpression(expr, expr.left, expr.operatorToken, updatedCall);
	return factory.updateExpressionStatement(statement, updatedBinary);
}

function removeNativeClassImport(factory, node) {
	const clause = node.importClause;
	if (!clause || !clause.namedBindings || !ts.isNamedImports(clause.namedBindings)) {
		return node;
	}

	const remaining = clause.namedBindings.elements.filter((element) => {
		const imported = element.propertyName ?? element.name;
		return imported.text !== 'NativeClass';
	});

	if (remaining.length === clause.namedBindings.elements.length) {
		return node;
	}

	if (remaining.length === 0 && !clause.name && !clause.isTypeOnly && !clause.phaseModifier) {
		return undefined;
	}

	const updatedNamedImports = remaining.length ? factory.updateNamedImports(clause.namedBindings, remaining) : undefined;
	const updatedClause = factory.updateImportClause(clause, clause.phaseModifier, clause.name, updatedNamedImports);
	return factory.updateImportDeclaration(node, node.modifiers, updatedClause, node.moduleSpecifier, node.attributes);
}

function getIdentifierText(node) {
	if (!node) {
		return undefined;
	}

	if (ts.isIdentifier(node)) {
		return node.text;
	}

	if (ts.isDecorator(node)) {
		return getIdentifierText(node.expression);
	}

	if (ts.isCallExpression(node)) {
		return getIdentifierText(node.expression);
	}

	if (ts.isPropertyAccessExpression(node)) {
		return node.name.text;
	}

	if (ts.isParenthesizedExpression(node)) {
		return getIdentifierText(node.expression);
	}

	return undefined;
}

function setParents(statements, parent) {
	for (const statement of statements) {
		setParentRecursive(statement, parent);
	}
}

module.exports = { before };
