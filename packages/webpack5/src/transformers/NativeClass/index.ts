import ts from 'typescript';

/**
 * A TypeScript transform that compiles classes marked with `@NativeClass` as es5
 */
export default function (ctx: ts.TransformationContext) {
	const factory = ctx.factory ?? ts.factory;

	function isNativeClassExtension(node: ts.ClassDeclaration) {
		let decorators: Readonly<ts.Decorator[]> | undefined;

		if ('canHaveDecorators' in ts && ts.canHaveDecorators(node)) {
			decorators = ts.getDecorators(node);
		} else {
			decorators = (node as any).decorators;
		}

		return !!decorators?.some((d) => {
			const fullText = d.getFullText().trim();
			return fullText.indexOf('@NativeClass') > -1;
		});
	}

	function transformNode(node: ts.Node): ts.Node {
		if (ts.isSourceFile(node)) {
			return factory.updateSourceFile(
				node,
				transformStatements(node.statements),
			);
		}

		if (ts.isBlock(node)) {
			return factory.updateBlock(node, transformStatements(node.statements));
		}

		if (ts.isModuleBlock(node)) {
			return factory.updateModuleBlock(
				node,
				transformStatements(node.statements),
			);
		}

		return ts.visitEachChild(node, transformNode, ctx);
	}

	function transformStatements(
		statements: ts.NodeArray<ts.Statement>,
	): ts.NodeArray<ts.Statement> {
		const result: ts.Statement[] = [];

		for (const statement of statements) {
			if (isNativeClassDecorateStatement(statement)) {
				continue;
			}
			if (
				ts.isClassDeclaration(statement) &&
				isNativeClassExtension(statement)
			) {
				result.push(...createHelper(statement));
				continue;
			}

			result.push(ts.visitEachChild(statement, transformNode, ctx));
		}

		return factory.createNodeArray(result);
	}

	function synthesizeNode<T extends ts.Node>(node: T): T {
		function visit(current: ts.Node): ts.Node {
			const updated = ts.visitEachChild(current, visit, ctx);
			ts.setTextRange(updated, { pos: -1, end: -1 });
			return updated;
		}

		return visit(node) as T;
	}

	function isNativeClassDecorateStatement(statement: ts.Statement): boolean {
		if (!ts.isExpressionStatement(statement)) {
			return false;
		}

		const expr = statement.expression;
		if (
			!ts.isBinaryExpression(expr) ||
			expr.operatorToken.kind !== ts.SyntaxKind.EqualsToken
		) {
			return false;
		}

		const right = expr.right;
		if (!ts.isCallExpression(right)) {
			return false;
		}

		const callee = right.expression;
		if (!ts.isIdentifier(callee) || callee.text !== '__decorate') {
			return false;
		}

		const decoratorArray = right.arguments[0];
		if (!decoratorArray || !ts.isArrayLiteralExpression(decoratorArray)) {
			return false;
		}

		return decoratorArray.elements.some(
			(element) => ts.isIdentifier(element) && element.text === 'NativeClass',
		);
	}

	function createHelper(node: ts.ClassDeclaration): ts.Statement[] {
		const transpiled = ts
			.transpileModule(
				node.getText().replace(/@NativeClass(?:\((?:.|\n)*?\))?\s*/gm, ''),
				{
					compilerOptions: {
						noEmitHelpers: true,
						module: ts.ModuleKind.ESNext,
						target: ts.ScriptTarget.ES5,
						experimentalDecorators: true,
						emitDecoratorMetadata: true,
					},
				},
			)
			.outputText.replace(
				/(Object\.defineProperty\(.*?{.*?)(enumerable:\s*false)(.*?}\))/gs,
				'$1enumerable: true$3',
			)
			.replace(/void\s*\*\s*\?\s*void\s*\/b/g, 'void 0 ? void 0');

		const helperSource = ts.createSourceFile(
			(node.getSourceFile()?.fileName ?? 'NativeClass.ts') + '.helper.js',
			transpiled,
			ts.ScriptTarget.ES2015,
			true,
			ts.ScriptKind.JS,
		);

		const helperStatements: ts.Statement[] = [];

		for (const statement of helperSource.statements) {
			if (statement.kind === ts.SyntaxKind.EndOfFileToken) {
				continue;
			}

			helperStatements.push(
				synthesizeNode(ts.visitEachChild(statement, transformNode, ctx)),
			);
		}

		return helperStatements;
	}

	return (source: ts.SourceFile) => transformNode(source) as ts.SourceFile;
}
