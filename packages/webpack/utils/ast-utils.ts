// inspired by:
// https://github.com/angular/angular-cli/blob/d202480a1707be6575b2c8cf0383cfe6db44413c/packages/schematics/angular/utility/ast-utils.ts
// https://github.com/angular/angular-cli/blob/d202480a1707be6575b2c8cf0383cfe6db44413c/packages/schematics/angular/utility/ng-ast-utils.ts
// https://github.com/NativeScript/nativescript-schematics/blob/438b9e3ef613389980bfa9d071e28ca1f32ab04f/src/ast-utils.ts

// important notes:
// 1) DO NOT USE `null` when building nodes or you will get `Cannot read property 'transformFlags' of null`
// https://github.com/Microsoft/TypeScript/issues/22372#issuecomment-371221056
// 2) DO NOT USE `node.getText()` or `node.getFullText()` while analyzing the AST - it is trying to  read
//  the text from the source file and if the node is affected by another transformer, it will lead to
//  an unexpected behavior. You can use `identifier.text` instead.
// 3) DO NOT USE `node.parent` while analyzing the AST. It will be null when the node is replaced by
// another transformer and will lead to an exception. Take a look at `findMethodCallInSource` for an
// example of a working workaround by searching for content in each parent.
// 4) Always test your transformer both single and in combinations with the other ones.

import { dirname, join, relative } from 'path';
import * as ts from 'typescript';
import { readFileSync, existsSync } from 'fs';
import { collectDeepNodes } from '@ngtools/webpack/src/transformers';
import { getCompilerOptionsFromTSConfig } from './tsconfig-utils';

export function getMainModulePath(entryFilePath: string, tsConfigName: string) {
	try {
		// backwards compatibility
		tsConfigName = tsConfigName || 'tsconfig.tns.json';

		const tsModuleName = findBootstrappedModulePath(entryFilePath);
		const result = tsResolve(tsModuleName, entryFilePath, tsConfigName);

		return result;
	} catch (e) {
		return null;
	}
}

/**
 * Returns the real path to the ts/d.ts of the specified `moduleName` relative to the specified `containingFilePath`. (e.g. `~/app/file` -> `./app/file.ts`)
 * @param moduleName The name of the module to be resolved (e.g. `~/config.js`, `lodash`, `./already-relative.js`, `@custom-path/file`).
 * @param containingFilePath An absolute path to the file where the `moduleName` is imported. The relative result will be based on this file.
 * @param tsConfigName The name of the tsconfig which will be used during the module resolution (e.g. `tsconfig.json`).
 * We need this config in order to get its compiler options into account (e.g. resolve any custom `paths` like `~` or `@src`).
 */
function tsResolve(moduleName: string, containingFilePath: string, tsConfigName: string) {
	let result = moduleName;
	try {
		const moduleResolutionHost: ts.ModuleResolutionHost = {
			fileExists: ts.sys.fileExists,
			readFile: ts.sys.readFile,
		};

		const compilerOptions = getCompilerOptionsFromTSConfig(tsConfigName);

		const resolutionResult = ts.resolveModuleName(moduleName, containingFilePath, compilerOptions, moduleResolutionHost);

		if (resolutionResult && resolutionResult.resolvedModule && resolutionResult.resolvedModule.resolvedFileName) {
			result = relative(dirname(containingFilePath), resolutionResult.resolvedModule.resolvedFileName);
		}
	} catch (err) {}

	return result;
}

export function findBootstrapModuleCall(mainPath: string): ts.CallExpression | null {
	const source = getSourceFile(mainPath);

	return findBootstrapModuleCallInSource(source);
}

export function findBootstrapModuleCallInSource(source: ts.SourceFile): ts.CallExpression | null {
	return findMethodCallInSource(source, 'bootstrapModule') || findMethodCallInSource(source, 'bootstrapModuleFactory');
}
export function findNativeScriptPlatformCallInSource(source: ts.SourceFile): ts.CallExpression | null {
	return findMethodCallInSource(source, 'platformNativeScriptDynamic') || findMethodCallInSource(source, 'platformNativeScript');
}

export function findMethodCallInSource(source: ts.SourceFile, methodName: string): ts.CallExpression | null {
	const allMethodCalls = collectDeepNodes<ts.CallExpression>(source, ts.SyntaxKind.CallExpression);
	let methodCallNode: ts.CallExpression | null = null;

	for (const callNode of allMethodCalls) {
		const currentMethodName = getExpressionName(callNode.expression);
		if (methodName === currentMethodName) {
			methodCallNode = callNode;
		}
	}

	return methodCallNode;
}

export function findBootstrappedModulePath(mainPath: string): string {
	const source = getSourceFile(mainPath);

	return findBootstrappedModulePathInSource(source);
}

export function findBootstrappedModulePathInSource(source: ts.SourceFile): string {
	const bootstrapCall = findBootstrapModuleCallInSource(source);
	if (!bootstrapCall) {
		throw new Error('Bootstrap call not found');
	}

	const appModulePath = getExpressionImportPath(source, bootstrapCall.arguments[0]);

	return appModulePath;
}

export function findNativeScriptPlatformPathInSource(source: ts.SourceFile): string {
	const nsPlatformCall = findNativeScriptPlatformCallInSource(source);
	if (!nsPlatformCall) {
		throw new Error('NativeScriptPlatform call not found');
	}

	const nsPlatformImportPath = getExpressionImportPath(source, nsPlatformCall.expression);

	return nsPlatformImportPath;
}

function getImportPathInSource(source: ts.SourceFile, importName: string) {
	const allImports = collectDeepNodes(source, ts.SyntaxKind.ImportDeclaration);
	const importPath = allImports
		.filter((imp) => {
			return findIdentifierNode(imp, importName);
		})
		.map((imp: ts.ImportDeclaration) => {
			const modulePathStringLiteral = imp.moduleSpecifier as ts.StringLiteral;
			return modulePathStringLiteral.text;
		})[0];
	return importPath;
}

export function getAppModulePath(mainPath: string): string {
	const moduleRelativePath = findBootstrappedModulePath(mainPath);
	const mainDir = dirname(mainPath);
	const modulePath = join(mainDir, `${moduleRelativePath}.ts`);

	return modulePath;
}

export function findIdentifierNode(node: ts.Node, text: string): ts.Node | null {
	if (node.kind === ts.SyntaxKind.Identifier && (<ts.Identifier>node).text === text) {
		return node;
	}

	let foundNode: ts.Node | null = null;
	ts.forEachChild(node, (childNode) => {
		foundNode = foundNode || findIdentifierNode(childNode, text);
	});

	return foundNode;
}

export function getObjectPropertyMatches(objectNode: ts.ObjectLiteralExpression, sourceFile: ts.SourceFile, targetPropertyName: string): ts.ObjectLiteralElement[] {
	return objectNode.properties
		.filter((prop) => prop.kind == ts.SyntaxKind.PropertyAssignment)
		.filter((prop: ts.PropertyAssignment) => {
			const name = prop.name;
			switch (name.kind) {
				case ts.SyntaxKind.Identifier:
					return (name as ts.Identifier).text == targetPropertyName;
				case ts.SyntaxKind.StringLiteral:
					return (name as ts.StringLiteral).text == targetPropertyName;
			}
			return false;
		});
}

export function getDecoratorMetadata(source: ts.SourceFile, identifier: string, module: string): ts.Node[] {
	const angularImports: { [name: string]: string } = collectDeepNodes(source, ts.SyntaxKind.ImportDeclaration)
		.map((node: ts.ImportDeclaration) => angularImportsFromNode(node, source))
		.reduce((acc: { [name: string]: string }, current: { [name: string]: string }) => {
			for (const key of Object.keys(current)) {
				acc[key] = current[key];
			}

			return acc;
		}, {});

	return collectDeepNodes(source, ts.SyntaxKind.Decorator)
		.filter((node) => {
			return (node as ts.Decorator).expression.kind == ts.SyntaxKind.CallExpression;
		})
		.map((node) => (node as ts.Decorator).expression as ts.CallExpression)
		.filter((expr) => {
			if (expr.expression.kind == ts.SyntaxKind.Identifier) {
				const id = expr.expression as ts.Identifier;

				return id.getFullText(source) == identifier && angularImports[id.getFullText(source)] === module;
			} else if (expr.expression.kind == ts.SyntaxKind.PropertyAccessExpression) {
				// This covers foo.NgModule when importing * as foo.
				const paExpr = expr.expression as ts.PropertyAccessExpression;
				// If the left expression is not an identifier, just give up at that point.
				if (paExpr.expression.kind !== ts.SyntaxKind.Identifier) {
					return false;
				}

				const id = paExpr.name.text;
				const moduleId = (paExpr.expression as ts.Identifier).text;

				return id === identifier && angularImports[moduleId + '.'] === module;
			}

			return false;
		})
		.filter((expr) => expr.arguments[0] && (expr.arguments[0].kind == ts.SyntaxKind.ObjectLiteralExpression || expr.arguments[0].kind == ts.SyntaxKind.Identifier))
		.map((expr) => expr.arguments[0] as ts.Node);
}

export function angularImportsFromNode(node: ts.ImportDeclaration, _sourceFile: ts.SourceFile): { [name: string]: string } {
	const ms = node.moduleSpecifier;
	let modulePath: string;
	switch (ms.kind) {
		case ts.SyntaxKind.StringLiteral:
			modulePath = (ms as ts.StringLiteral).text;
			break;
		default:
			return {};
	}

	if (!modulePath.startsWith('@angular/')) {
		return {};
	}

	if (node.importClause) {
		if (node.importClause.name) {
			// This is of the form `import Name from 'path'`. Ignore.
			return {};
		} else if (node.importClause.namedBindings) {
			const nb = node.importClause.namedBindings;
			if (nb.kind == ts.SyntaxKind.NamespaceImport) {
				// This is of the form `import * as name from 'path'`. Return `name.`.
				return {
					[(nb as ts.NamespaceImport).name.text + '.']: modulePath,
				};
			} else {
				// This is of the form `import {a,b,c} from 'path'`
				const namedImports = nb as ts.NamedImports;

				return namedImports.elements
					.map((is: ts.ImportSpecifier) => (is.propertyName ? is.propertyName.text : is.name.text))
					.reduce((acc: { [name: string]: string }, curr: string) => {
						acc[curr] = modulePath;

						return acc;
					}, {});
			}
		}

		return {};
	} else {
		// This is of the form `import 'path';`. Nothing to do.
		return {};
	}
}

export function getExpressionName(expression: ts.Expression): string {
	let text = '';
	if (!expression) {
		return text;
	}

	if (expression.kind == ts.SyntaxKind.Identifier) {
		text = (<ts.Identifier>expression).text;
	} else if (expression.kind == ts.SyntaxKind.PropertyAccessExpression) {
		text = (<ts.PropertyAccessExpression>expression).name.text;
	}

	return text;
}

function getExpressionImportPath(source: ts.SourceFile, expression: ts.Expression): string {
	let importString = '';
	if (!expression) {
		return undefined;
	}

	if (expression.kind == ts.SyntaxKind.Identifier) {
		importString = (<ts.Identifier>expression).text;
	} else if (expression.kind == ts.SyntaxKind.PropertyAccessExpression) {
		const targetPAArg = <ts.PropertyAccessExpression>expression;
		if (targetPAArg.expression.kind == ts.SyntaxKind.Identifier) {
			importString = (<ts.Identifier>targetPAArg.expression).text;
		}
	}

	const importPath = getImportPathInSource(source, importString);

	return importPath;
}

function getSourceFile(mainPath: string): ts.SourceFile {
	if (!existsSync(mainPath)) {
		throw new Error(`Main file (${mainPath}) not found`);
	}
	const mainText = readFileSync(mainPath, 'utf8');
	const source = ts.createSourceFile(mainPath, mainText, ts.ScriptTarget.Latest, true);
	return source;
}
