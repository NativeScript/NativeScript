import ts from 'typescript';

// NativeClass transformer
// Goal: Downlevel ONLY classes decorated with @NativeClass / @NativeClass() to ES5 IIFE form
// while leaving all other code at the project’s configured target (modern). We cannot globally
// force ScriptTarget.ES5 because that would regress performance and syntax elsewhere.
//
// Strategy:
// 1. Detect decorator via AST or textual marker (/*__NativeClass__*/ inserted by strip loader).
// 2. Extract the full class (including leading decorator trivia) and remove the decorator/marker.
// 3. Use a localized transpileModule call (target ES5) ONLY for that class snippet with helpers disabled.
// 4. Parse the emitted ES5 snippet into statements and splice them back into the original tree.
// 5. Clean up any __decorate([...]) helper statements still referencing NativeClass as a fallback.
//
// IMPORTANT: We intentionally avoid deep traversal to reduce chance of corrupting internal TS state.
// Only top-level/class-block statement arrays are rewritten.
export default function (context: ts.TransformationContext, ...args) {
	const factory = context.factory ?? ts.factory;
	return (sourceFile: ts.SourceFile) => {
		if (sourceFile.isDeclarationFile) return sourceFile;
		let mutated = false;

		// Minimal mutable shape
		type MutableNode = ts.Node & {
			flags?: ts.NodeFlags;
			parent?: ts.Node;
			pos?: number;
			end?: number;
		};

		function getIdentifierText(node: ts.Node | undefined): string | undefined {
			if (!node) return undefined;
			if (ts.isIdentifier(node)) return node.text;
			if (ts.isDecorator(node)) return getIdentifierText(node.expression);
			if (ts.isCallExpression(node)) return getIdentifierText(node.expression);
			if (ts.isPropertyAccessExpression(node)) return node.name.text;
			if (ts.isParenthesizedExpression(node))
				return getIdentifierText(node.expression);
			return undefined;
		}

		function hasNativeClassDecorator(node: ts.ClassDeclaration): boolean {
			// Primary: standard decorator detection
			const decorators = (
				'canHaveDecorators' in ts && ts.canHaveDecorators(node)
					? ts.getDecorators(node)
					: (node as any).decorators
			) as ts.NodeArray<ts.Decorator> | undefined;
			if (decorators?.some((d) => getIdentifierText(d) === 'NativeClass'))
				return true;
			// Fallback: text-level check in leading trivia (handles parser quirks / differing TS versions)
			const sf = node.getSourceFile?.() ?? sourceFile;
			const start = (node as any).getFullStart
				? (node as any).getFullStart()
				: (node.pos ?? node.getStart?.(sf));
			const text = sf.text.slice(start, node.end);
			if (/^\s*@NativeClass\b/m.test(text)) return true;
			// Also detect marker inserted by strip loader
			return /\/\*__NativeClass__\*\//m.test(text);
		}

		function emitDownleveledClass(node: ts.ClassDeclaration): ts.Statement[] {
			const sf = node.getSourceFile?.() ?? sourceFile;
			const start = (node as any).getFullStart
				? (node as any).getFullStart()
				: (node.pos ?? node.getStart?.(sf));
			const nodeText = sf.text.slice(start, node.end);
			// Remove either original decorator or marker line
			const stripped = nodeText
				.replace(/^\s*@NativeClass(?:\([\s\S]*?\))?\s*/m, '')
				.replace(/^\s*\/\*__NativeClass__\*\/\s*/m, '');

			// Perform localized ES5 transpile ONLY for this class block.
			const downleveled = ts
				.transpileModule(stripped, {
					compilerOptions: {
						module: ts.ModuleKind.ESNext,
						target: ts.ScriptTarget.ES5,
						noEmitHelpers: true,
						experimentalDecorators: true,
						emitDecoratorMetadata: false,
						useDefineForClassFields: false,
					},
				})
				.outputText.replace(
					/(Object\.defineProperty\(.*?{.*?)(enumerable:\s*false)(.*?}\))/gs,
					'$1enumerable: true$3',
				);

			const helperSource = ts.createSourceFile(
				`${node.getSourceFile()?.fileName ?? 'NativeClass.ts'}.helper.js`,
				downleveled,
				ts.ScriptTarget.ES5,
				true,
				ts.ScriptKind.JS,
			);
			const out: ts.Statement[] = [];
			for (const stmt of helperSource.statements) {
				if (stmt.kind === ts.SyntaxKind.EndOfFileToken) continue;
				out.push(prepareSynthesizedNode(stmt, node));
			}
			return out;
		}

		function removeNativeClassImport(
			node: ts.ImportDeclaration,
		): ts.ImportDeclaration | undefined {
			const clause = node.importClause;
			if (
				!clause ||
				!clause.namedBindings ||
				!ts.isNamedImports(clause.namedBindings)
			)
				return node;
			const remain = clause.namedBindings.elements.filter(
				(el) => (el.propertyName ?? el.name).text !== 'NativeClass',
			);
			if (remain.length === clause.namedBindings.elements.length) return node;
			if (
				remain.length === 0 &&
				!clause.name &&
				!clause.isTypeOnly &&
				!(clause as any).phaseModifier
			)
				return undefined;
			const updatedNamed = remain.length
				? factory.updateNamedImports(clause.namedBindings, remain)
				: undefined;
			const updatedClause = factory.updateImportClause(
				clause,
				clause.isTypeOnly,
				clause.name,
				updatedNamed,
			);
			return factory.updateImportDeclaration(
				node,
				node.modifiers,
				updatedClause,
				node.moduleSpecifier,
				node.assertClause,
			);
		}

		function removeNativeClassFromDecorate(
			statement: ts.ExpressionStatement,
		): ts.ExpressionStatement | undefined {
			const expr = (statement as any).expression as ts.Expression | undefined;
			if (
				!expr ||
				!ts.isBinaryExpression(expr) ||
				expr.operatorToken.kind !== ts.SyntaxKind.EqualsToken
			)
				return statement;
			const right = expr.right;
			if (
				!ts.isCallExpression(right) ||
				getIdentifierText(right.expression) !== '__decorate' ||
				right.arguments.length === 0
			)
				return statement;
			const arr = right.arguments[0];
			if (!ts.isArrayLiteralExpression(arr)) return statement;
			const retained = arr.elements.filter(
				(el) => getIdentifierText(el) !== 'NativeClass',
			);
			if (retained.length === arr.elements.length) return statement;
			if (retained.length === 0) return undefined; // remove whole statement
			const newArr = factory.updateArrayLiteralExpression(arr, retained);
			const newCall = factory.updateCallExpression(
				right,
				right.expression,
				right.typeArguments,
				[newArr, ...right.arguments.slice(1)],
			);
			const newBin = factory.updateBinaryExpression(
				expr,
				expr.left,
				expr.operatorToken,
				newCall,
			);
			return factory.updateExpressionStatement(statement, newBin);
		}

		function visitNode(node: ts.Node): ts.Node {
			// Do not traverse synthesized helper trees; leave them intact
			if (((node as MutableNode).flags ?? 0) & ts.NodeFlags.Synthesized) {
				return node;
			}
			if (ts.isSourceFile(node)) {
				const [stmts, changed] = transformStatements(node.statements, true);
				return changed ? factory.updateSourceFile(node, stmts) : node;
			}
			if (ts.isBlock(node)) {
				const [stmts, changed] = transformStatements(node.statements, false);
				return changed ? factory.updateBlock(node, stmts) : node;
			}
			if (ts.isModuleBlock(node)) {
				const [stmts, changed] = transformStatements(node.statements, false);
				return changed ? factory.updateModuleBlock(node, stmts) : node;
			}
			if (ts.isCaseClause(node)) {
				// Avoid deep traversal; only transform statements inside the clause
				const [stmts, changed] = transformStatements(node.statements, false);
				return changed
					? factory.updateCaseClause(node, node.expression, stmts)
					: node;
			}
			if (ts.isDefaultClause(node)) {
				const [stmts, changed] = transformStatements(node.statements, false);
				return changed ? factory.updateDefaultClause(node, stmts) : node;
			}
			// No generic deep traversal; leave unrelated subtrees intact
			return ts.visitEachChild(node, visitNode, context);
		}

		function transformStatements(
			statements: ts.NodeArray<ts.Statement>,
			isTopLevel: boolean,
		): [ts.NodeArray<ts.Statement>, boolean] {
			let changed = false;
			if (!statements) {
				return [null, changed];
			}
			const result: ts.Statement[] = [];
			for (const statement of statements) {
				if (
					((statement as MutableNode).flags ?? 0) & ts.NodeFlags.Synthesized
				) {
					result.push(statement);
					continue;
				}
				if (ts.isClassDeclaration(statement)) {
					if (hasNativeClassDecorator(statement)) {
						mutated = true;
						changed = true;
						result.push(...emitDownleveledClass(statement));
						continue;
					} else {
						// As an extra fallback, raw text check in case decorator nodes failed and regex missed
						const sf = statement.getSourceFile();
						const start = (statement as any).getFullStart
							? (statement as any).getFullStart()
							: (statement.pos ?? statement.getStart?.(sf));
						const raw = sf.text.slice(start, statement.end);
						if (/^\s*@NativeClass\b/m.test(raw)) {
							mutated = true;
							changed = true;
							result.push(...emitDownleveledClass(statement));
							continue;
						}
					}
				}
				if (ts.isExpressionStatement(statement)) {
					const updated = removeNativeClassFromDecorate(statement);
					if (!updated) {
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
					const updated = removeNativeClassImport(statement);
					if (!updated) {
						mutated = true;
						changed = true;
						continue;
					}
					if (updated !== statement) {
						mutated = true;
						changed = true;
					}
					result.push(updated);
					continue;
				}
				// No deep traversal for unrelated nodes
				result.push(statement);
			}
			return [changed ? factory.createNodeArray(result) : statements, changed];
		}
		const updated = ts.visitNode(sourceFile, visitNode) as ts.SourceFile;
		if (!mutated) return sourceFile;
		return updated;
	};
}

// Clone and mark helper nodes as synthesized; attach original for diagnostics
function prepareSynthesizedNode<T extends ts.Node>(
	node: T,
	original: ts.Node,
): T {
	const cloneNode = (
		ts.factory as unknown as { cloneNode?: (value: ts.Node) => ts.Node }
	).cloneNode;
	const getMutableClone = (
		ts as unknown as { getMutableClone?: <U extends ts.Node>(value: U) => U }
	).getMutableClone;
	const prepared = (cloneNode?.(node) ?? getMutableClone?.(node) ?? node) as T;
	markSynthesizedRecursive(prepared);
	setSynthesizedRangeRecursive(prepared);
	setOriginalRecursive(prepared, original);
	return prepared;
}

function markSynthesizedRecursive(node: ts.Node): void {
	const mutable = node as any as { flags?: ts.NodeFlags };
	mutable.flags = ((mutable.flags ?? 0) |
		ts.NodeFlags.Synthesized) as ts.NodeFlags;
	ts.forEachChild(node, (child) => markSynthesizedRecursive(child));
}

function setSynthesizedRangeRecursive(node: ts.Node): void {
	const mutable = node as any as { pos?: number; end?: number };
	if (typeof mutable.pos === 'number') mutable.pos = -1;
	if (typeof mutable.end === 'number') mutable.end = -1;
	ts.forEachChild(node, (child) => setSynthesizedRangeRecursive(child));
}

function setOriginalRecursive(node: ts.Node, original: ts.Node): void {
	ts.setOriginalNode(node, original);
	ts.forEachChild(node, (child) => setOriginalRecursive(child, original));
}
