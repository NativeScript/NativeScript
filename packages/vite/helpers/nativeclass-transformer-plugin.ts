import type { Plugin } from 'vite';
import ts from 'typescript';
import { transformNativeClassSource } from './nativeclass-transform.js';

/**
 * Post-phase cleanup for NativeClass decorators.
 * Strips __decorate([NativeClass()], X) and downlevels ES6 classes to ES5
 * so the NativeScript runtime can detect native class inheritance via __extends.
 *
 * Exported separately for testability.
 */
export function postCleanupNativeClass(code: string, bareId: string, verbose = false): { code: string; map: null } | null {
	if (!code) return null;
	if (!code.includes('__decorate') || !code.includes('NativeClass')) return null;

	// Collect class names that have NativeClass in their __decorate call
	const decorateRe = /(\w+)\s*=\s*(?:\w+\s*=\s*)?__decorate\(\s*\[\s*NativeClass\(\)\s*\]\s*,\s*(\w+)\s*\)/g;
	const classNamesToDownlevel = new Set<string>();
	let m: RegExpExecArray | null;
	while ((m = decorateRe.exec(code)) !== null) {
		classNamesToDownlevel.add(m[2]);
	}

	if (!classNamesToDownlevel.size) return null;

	// Strip NativeClass from __decorate arrays: __decorate([NativeClass()], X) → X
	let output = code.replace(decorateRe, '$1 = $2');

	// Now downlevel any ES6 class expression that extends a native base.
	// Angular's re-compilation may have emitted:
	//   var AppDelegate = class AppDelegate extends UIResponder { ... };
	// or with _1 alias:
	//   var PDFViewDelegateImpl = PDFViewDelegateImpl_1 = class PDFViewDelegateImpl extends NSObject { ... };
	// We need to find these and downlevel them to ES5 with __extends so the
	// NativeScript runtime can detect native class inheritance.
	for (const className of Array.from(classNamesToDownlevel)) {
		try {
			// Use TypeScript AST to find and extract the class expression reliably
			const sf = ts.createSourceFile(bareId + '.js', output, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
			let classNode: ts.ClassExpression | ts.ClassDeclaration | undefined;
			let baseName = '';
			let varDeclStart = -1;
			let varDeclEnd = -1;
			let aliasName = ''; // e.g. PDFViewDelegateImpl_1

			const findClass = (node: ts.Node) => {
				if (classNode) return;
				// Match: var X = class X extends Y { ... }
				// or: var X = X_1 = class X extends Y { ... }
				if (ts.isVariableStatement(node)) {
					for (const decl of node.declarationList.declarations) {
						if (ts.isIdentifier(decl.name) && decl.name.text === className && decl.initializer) {
							let classExpr = decl.initializer;
							// Handle alias: X = X_1 = class X extends Y { ... }
							if (ts.isBinaryExpression(classExpr) && classExpr.operatorToken.kind === ts.SyntaxKind.EqualsToken) {
								if (ts.isIdentifier(classExpr.left)) {
									aliasName = classExpr.left.text;
								}
								classExpr = classExpr.right;
							}
							if (ts.isClassExpression(classExpr) && classExpr.heritageClauses?.length) {
								const extendsClause = classExpr.heritageClauses.find((h) => h.token === ts.SyntaxKind.ExtendsKeyword);
								if (extendsClause?.types[0]) {
									baseName = output.slice(extendsClause.types[0].expression.getStart(sf), extendsClause.types[0].expression.getEnd());
									classNode = classExpr;
									varDeclStart = node.getStart(sf);
									varDeclEnd = node.getEnd();
								}
							}
						}
					}
				}
				ts.forEachChild(node, findClass);
			};
			findClass(sf);

			if (!classNode || !baseName) continue;

			// Extract just the class as a declaration for ts.transpileModule
			const classText = output.slice(classNode.getStart(sf), classNode.getEnd());
			// Convert class expression to declaration for proper downlevel
			const classAsDecl = classText.replace(/^class\b/, `class`);
			const toDownlevel = `class ${className} extends ${baseName} ${classAsDecl.slice(classAsDecl.indexOf('{'))}`;

			const downleveled = ts
				.transpileModule(toDownlevel, {
					compilerOptions: {
						module: ts.ModuleKind.ESNext,
						target: ts.ScriptTarget.ES5,
						experimentalDecorators: true,
						emitDecoratorMetadata: false,
						noEmitHelpers: true,
						useDefineForClassFields: false,
					},
				})
				.outputText.replace(/enumerable:\s*false/g, 'enumerable: true')
				.replace(/export \{\};?\s*$/m, '')
				.trim();

			// The downleveled output is a var statement: var ClassName = (function(_super) { ... })(Base);
			// Build the replacement, preserving any alias assignment
			let replacement = downleveled;
			if (aliasName) {
				// Original was: var X = X_1 = class X extends Y {...};
				// Downlevel produces: var X = (function(_super){...})(Y);
				// We need: var X = X_1 = (function(_super){...})(Y);
				replacement = replacement.replace(`var ${className} =`, `var ${className} = ${aliasName} =`);
			}

			output = output.slice(0, varDeclStart) + replacement + output.slice(varDeclEnd);

			if (verbose) {
				console.log(`[ns-nativeclass-post] Downleveled ES6 class "${className}" to ES5 with __extends in ${bareId}`);
			}
		} catch (e) {
			if (verbose) {
				console.warn(`[ns-nativeclass-post] Failed to downlevel class "${className}" in ${bareId}:`, e);
			}
			// If downleveling fails, the decorator is at least stripped
		}
	}

	if (output !== code) {
		if (verbose) {
			console.log(`[ns-nativeclass-post] Cleaned __decorate NativeClass from ${bareId}`);
		}
		return { code: output, map: null };
	}
	return null;
}

/**
 * Wraps NativeClass TS transformer into a Vite plugin.
 */
export function createNativeClassTransformerPlugin(): Plugin[] {
	const verbose = !!process.env.NS_DEBUG_NATIVECLASS;

	return [
		{
			name: 'ns-nativeclass-transformer',
			enforce: 'pre',
			async transform(code: string, id: string) {
				if (!code) return null;
				const bareId = id.split('?')[0];
				const isTSFile = /\.(ts|tsx)$/.test(bareId);
				const isJSFile = /\.(js|mjs|cjs)$/.test(bareId);
				const isVueTSBlock = !isTSFile && /[?&]lang\.(ts|tsx)\b/.test(id);
				if (!isTSFile && !isVueTSBlock && !isJSFile) return null;

				const hasDecoratorSyntax = code.includes('@NativeClass');
				const hasNativeClassIdentifier = code.includes('NativeClass');
				const hasDecorateCall = isJSFile && code.includes('__decorate');

				// Most modules never contain NativeClass decorations.
				// Skip the heavier TS-based helper unless the source has one of the patterns it can actually rewrite.
				if (!hasDecoratorSyntax && !hasNativeClassIdentifier && !hasDecorateCall) {
					return null;
				}

				if (verbose && (hasDecoratorSyntax || hasNativeClassIdentifier)) {
					console.log(`[ns-nativeclass] Processing file with NativeClass: ${bareId}`);
				}

				const res = transformNativeClassSource(code, bareId);

				if (verbose && (hasDecoratorSyntax || hasNativeClassIdentifier)) {
					if (res) {
						const stillHas = /\bNativeClass\b/.test(res.code);
						if (stillHas) {
							console.warn(`[ns-nativeclass] WARNING: NativeClass still present after transform in ${bareId}`);
						} else {
							console.log(`[ns-nativeclass] Successfully transformed ${bareId}`);
						}
					} else {
						console.log(`[ns-nativeclass] Transform returned null for ${bareId} (may be skipped due to platform filter)`);
					}
				}

				return res;
			},
		},
		// Post-phase cleanup: the Angular plugin (normal phase) may re-compile TypeScript from its
		// own compilation pipeline, re-introducing __decorate([NativeClass()], ...) after the pre-phase
		// transformer already stripped @NativeClass. This post-phase pass catches those survivors.
		// In addition to stripping the decorator, we must also downlevel any ES6 class that was
		// decorated with NativeClass to ES5 (using __extends) so the NativeScript runtime can
		// detect native class inheritance and register ObjC classes.
		{
			name: 'ns-nativeclass-post-cleanup',
			enforce: 'post',
			transform(code: string, id: string) {
				const bareId = id.split('?')[0];
				if (!/\.(ts|tsx|js|mjs)$/.test(bareId)) return null;
				return postCleanupNativeClass(code, bareId, verbose);
			},
		},
	];
}
