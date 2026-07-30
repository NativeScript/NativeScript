import ts from 'typescript';

// NativeClass transformer for Vite
// Detect both @NativeClass and /*__NativeClass__*/ markers and downlevel ONLY the marked class
// while leaving everything else at the project’s target.
export default function (ctx: ts.TransformationContext) {
	const factory = ctx.factory ?? ts.factory;
	return (sourceFile: ts.SourceFile) => {
		if (sourceFile.isDeclarationFile) return sourceFile;
		let mutated = false;

		function getIdentifierText(node: ts.Node | undefined): string | undefined {
			if (!node) return undefined;
			if (ts.isIdentifier(node)) return node.text;
			if (ts.isDecorator(node)) return getIdentifierText(node.expression);
			if (ts.isCallExpression(node)) return getIdentifierText(node.expression);
			if (ts.isPropertyAccessExpression(node)) return node.name.text;
			if (ts.isParenthesizedExpression(node)) return getIdentifierText(node.expression);
			return undefined;
		}

		function hasNativeClassDecorator(node: ts.ClassDeclaration): boolean {
			// AST-level
			const decorators = ('canHaveDecorators' in ts && ts.canHaveDecorators(node) ? ts.getDecorators(node) : (node as any).decorators) as ts.NodeArray<ts.Decorator> | undefined;
			if (decorators?.some((d) => getIdentifierText(d) === 'NativeClass')) return true;
			// Leading trivia raw-text and marker detection
			const sf = node.getSourceFile?.() ?? sourceFile;
			const fullStart = (node as any).getFullStart ? (node as any).getFullStart() : node.pos;
			const header = sf.text.slice(fullStart, node.getStart(sf));
			if (/\/\*__NativeClass__\*\//.test(header)) return true;
			if (/^\s*@NativeClass\b/m.test(header)) return true;
			return false;
		}

		function emitDownleveledClass(node: ts.ClassDeclaration): ts.Statement[] {
			const sf = node.getSourceFile?.() ?? sourceFile;
			const fullStart = (node as any).getFullStart ? (node as any).getFullStart() : node.pos;
			const nodeText = sf.text.slice(fullStart, node.end);
			// Remove marker/decorator but preserve surrounding newline so next 'class' stays on its own line
			let stripped = nodeText.replace(/@NativeClass(?:\([\s\S]*?\))?/m, '').replace(/\/\*__NativeClass__\*\//m, '');
			// Provide a .ts filename to help transpileModule parse TS types consistently
			const transpileResult = ts.transpileModule(stripped, {
				compilerOptions: {
					module: ts.ModuleKind.ESNext,
					target: ts.ScriptTarget.ES5,
					noEmitHelpers: true,
					experimentalDecorators: true,
					emitDecoratorMetadata: true,
					useDefineForClassFields: false,
				},
				fileName: sf.fileName.endsWith('.ts') ? sf.fileName : `${sf.fileName}.ts`,
				reportDiagnostics: !!process.env.NATIVECLASS_DEBUG,
			});
			if (process.env.NATIVECLASS_DEBUG && transpileResult.diagnostics?.length) {
				// Emit only first diagnostic for brevity
				const first = transpileResult.diagnostics[0];
				console.warn('[NativeClass:vite] diagnostic', first.messageText);
			}
			const downleveled = transpileResult.outputText;

			const helperSource = ts.createSourceFile(`${node.getSourceFile()?.fileName ?? 'NativeClass.ts'}.helper.js`, downleveled, ts.ScriptTarget.ES5, true, ts.ScriptKind.JS);
			// Visitor to set enumerable: true inside Object.defineProperty descriptor objects safely (no regex)
			const makeEnumerableVisitor = (n: ts.Node): ts.Node => {
				return ts.visitEachChild(
					n,
					(child) => {
						if (ts.isCallExpression(child)) {
							const exp = child.expression;
							const isDefineProp = ts.isPropertyAccessExpression(exp) ? exp.name.text === 'defineProperty' && ts.isIdentifier(exp.expression) && exp.expression.text === 'Object' : ts.isIdentifier(exp) && exp.text === ('Object' as any); // fallback, though TS emits property access
							if (isDefineProp && child.arguments.length >= 3 && ts.isObjectLiteralExpression(child.arguments[2])) {
								const obj = child.arguments[2] as ts.ObjectLiteralExpression;
								const newProps = obj.properties.map((p) => {
									if (ts.isPropertyAssignment(p)) {
										const name = p.name;
										const isEnumerable = (ts.isIdentifier(name) && name.text === 'enumerable') || (ts.isStringLiteral(name) && name.text === 'enumerable');
										if (isEnumerable) {
											return factory.updatePropertyAssignment(p, p.name, factory.createTrue());
										}
									}
									return p;
								});
								const newObj = factory.updateObjectLiteralExpression(obj, newProps);
								const newArgs = [...child.arguments.slice(0, 2), newObj, ...child.arguments.slice(3)];
								return factory.updateCallExpression(child, child.expression, child.typeArguments, newArgs);
							}
						}
						return makeEnumerableVisitor(child);
					},
					ctx,
				);
			};

			const transformedStatements: ts.Statement[] = [];
			for (const stmt of helperSource.statements) {
				if (stmt.kind === ts.SyntaxKind.EndOfFileToken) continue;
				const updated = ts.visitNode(stmt, makeEnumerableVisitor) as ts.Statement;
				transformedStatements.push(updated);
			}
			const out: ts.Statement[] = transformedStatements;
			return out;
		}

		function removeNativeClassImport(node: ts.ImportDeclaration): ts.ImportDeclaration | undefined {
			const clause = node.importClause;
			if (!clause || !clause.namedBindings || !ts.isNamedImports(clause.namedBindings)) return node;
			const remain = clause.namedBindings.elements.filter((el) => (el.propertyName ?? el.name).text !== 'NativeClass');
			if (remain.length === clause.namedBindings.elements.length) return node;
			if (remain.length === 0 && !clause.name && !clause.isTypeOnly && !(clause as any).phaseModifier) return undefined;
			const updatedNamed = remain.length ? factory.updateNamedImports(clause.namedBindings, remain) : undefined;
			const updatedClause = factory.updateImportClause(clause, clause.isTypeOnly, clause.name, updatedNamed);
			return factory.updateImportDeclaration(node, node.modifiers, updatedClause, node.moduleSpecifier, node.assertClause);
		}

		function removeNativeClassFromDecorate(statement: ts.ExpressionStatement): ts.ExpressionStatement | undefined {
			const expr = (statement as any).expression as ts.Expression | undefined;
			if (!expr || !ts.isBinaryExpression(expr) || expr.operatorToken.kind !== ts.SyntaxKind.EqualsToken) return statement;
			const right = expr.right;
			if (!ts.isCallExpression(right) || getIdentifierText(right.expression) !== '__decorate' || right.arguments.length === 0) return statement;
			const arr = right.arguments[0];
			if (!ts.isArrayLiteralExpression(arr)) return statement;
			const retained = arr.elements.filter((el) => getIdentifierText(el) !== 'NativeClass');
			if (retained.length === arr.elements.length) return statement;
			if (retained.length === 0) return undefined;
			const newArr = factory.updateArrayLiteralExpression(arr, retained);
			const newCall = factory.updateCallExpression(right, right.expression, right.typeArguments, [newArr, ...right.arguments.slice(1)]);
			const newBin = factory.updateBinaryExpression(expr, expr.left, expr.operatorToken, newCall);
			return factory.updateExpressionStatement(statement, newBin);
		}

		function visitNode(node: ts.Node): ts.Node {
			if (ts.isBlock(node)) {
				const [stmts, changed] = transformStatements(node.statements, false);
				return changed ? factory.updateBlock(node, stmts) : node;
			}
			if (ts.isModuleBlock(node)) {
				const [stmts, changed] = transformStatements(node.statements, false);
				return changed ? factory.updateModuleBlock(node, stmts) : node;
			}
			if (ts.isCaseClause(node)) {
				const expr = ts.visitNode(node.expression, visitNode) as ts.Expression | undefined;
				const [stmts, changed] = transformStatements(node.statements, false);
				if (!changed && (expr ?? node.expression) === node.expression) return node;
				mutated = true;
				return factory.updateCaseClause(node, (expr ?? node.expression) as ts.Expression, stmts);
			}
			if (ts.isDefaultClause(node)) {
				const [stmts, changed] = transformStatements(node.statements, false);
				return changed ? factory.updateDefaultClause(node, stmts) : node;
			}
			return ts.visitEachChild(node, visitNode, ctx);
		}

		function transformStatements(statements: ts.NodeArray<ts.Statement>, isTopLevel: boolean): [ts.NodeArray<ts.Statement>, boolean] {
			let changed = false;
			const out: ts.Statement[] = [];
			for (const s of statements) {
				if (ts.isClassDeclaration(s) && hasNativeClassDecorator(s)) {
					mutated = true;
					changed = true;
					out.push(...emitDownleveledClass(s));
					continue;
				}
				if (ts.isExpressionStatement(s)) {
					const updated = removeNativeClassFromDecorate(s);
					if (!updated) {
						mutated = true;
						changed = true;
						continue;
					}
					const visited = ts.visitEachChild(updated, visitNode, ctx) as ts.ExpressionStatement;
					if (visited !== s) {
						mutated = true;
						changed = true;
					}
					out.push(visited);
					continue;
				}
				if (isTopLevel && ts.isImportDeclaration(s)) {
					const updated = removeNativeClassImport(s);
					if (!updated) {
						mutated = true;
						changed = true;
						continue;
					}
					if (updated !== s) {
						mutated = true;
						changed = true;
					}
					out.push(updated);
					continue;
				}
				const visited = ts.visitEachChild(s, visitNode, ctx);
				if (visited !== s) {
					mutated = true;
					changed = true;
				}
				out.push(visited);
			}
			return [changed ? factory.createNodeArray(out) : statements, changed];
		}

		const [updatedStatements] = transformStatements(sourceFile.statements, true);
		if (!mutated) return sourceFile;
		const updated = factory.updateSourceFile(sourceFile, updatedStatements);
		const setParentRecursive = (node: ts.Node, parent: ts.Node) => {
			(node as any).parent = parent;
			ts.forEachChild(node, (child) => setParentRecursive(child, node));
		};
		for (const stmt of updated.statements) {
			if ((stmt as any).parent !== updated) setParentRecursive(stmt, updated);
		}
		return updated;
	};
}
