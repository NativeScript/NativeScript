import type { Plugin } from 'vite';
import ts from 'typescript';
import { transformNativeClassSource } from './nativeclass-transform.js';

/**
 * Look for `NativeClass` either as a bare identifier or as a `NativeClass(...)` call expression
 * inside a `__decorate` array element. Returns true if the element is a NativeClass marker.
 */
function isNativeClassDecoratorElement(el: ts.Expression): boolean {
	if (ts.isIdentifier(el) && el.text === 'NativeClass') return true;
	if (ts.isCallExpression(el) && ts.isIdentifier(el.expression) && el.expression.text === 'NativeClass') return true;
	return false;
}

/**
 * Walk the AST and collect every `__decorate([..., NativeClass(), ...], X)` (or
 * `__decorate*` variants) where the array contains a NativeClass marker.
 *
 * For each such call we record the target class name (so it can be downleveled
 * later) and produce a textual edit that strips ONLY the `NativeClass` element.
 * If `NativeClass` was the only element, the whole `__decorate(...)` call is
 * replaced with its target identifier so the surrounding assignment becomes a
 * harmless self-assign (`X = X`) and `NativeClass` no longer appears in the
 * served output.
 *
 * Using AST instead of regex lets us tolerate any number of additional
 * decorators in the array (e.g. `__metadata("design:paramtypes", [])`), which
 * Angular's compiler always emits when a class has a constructor.
 */
function collectNativeClassDecorateEdits(code: string, sf: ts.SourceFile): { edits: Array<{ start: number; end: number; text: string }>; classNames: Set<string> } {
	const edits: Array<{ start: number; end: number; text: string }> = [];
	const classNames = new Set<string>();

	const visit = (node: ts.Node): void => {
		if (ts.isCallExpression(node)) {
			const callee = node.expression;
			const calleeName = ts.isIdentifier(callee) ? callee.text : ts.isPropertyAccessExpression(callee) && ts.isIdentifier(callee.expression) && ts.isIdentifier(callee.name) ? `${callee.expression.text}.${callee.name.text}` : undefined;
			if (calleeName && /^__decorate/.test(calleeName) && node.arguments.length >= 2) {
				const firstArg = node.arguments[0];
				const secondArg = node.arguments[1];
				if (ts.isArrayLiteralExpression(firstArg) && ts.isIdentifier(secondArg)) {
					const remaining = firstArg.elements.filter((el) => !isNativeClassDecoratorElement(el));
					if (remaining.length !== firstArg.elements.length) {
						classNames.add(secondArg.text);
						const callStart = node.getStart(sf);
						const callEnd = node.getEnd();
						if (remaining.length === 0) {
							// Replace `__decorate([NativeClass()], X)` with `X` so the surrounding
							// assignment (`X = __decorate(...)`) becomes `X = X` — a no-op the runtime
							// will skip without errors.
							edits.push({ start: callStart, end: callEnd, text: secondArg.text });
						} else {
							const remainingText = remaining.map((el) => code.slice(el.getStart(sf), el.getEnd())).join(', ');
							const followingArgs = node.arguments.slice(1);
							const argsText = `[${remainingText}]` + (followingArgs.length ? ', ' + followingArgs.map((a) => code.slice(a.getStart(sf), a.getEnd())).join(', ') : '');
							edits.push({ start: callStart, end: callEnd, text: `${calleeName}(${argsText})` });
						}
					}
				}
			}
		}
		ts.forEachChild(node, visit);
	};
	visit(sf);

	return { edits, classNames };
}

/**
 * Strip `__extends` from any tslib named import that may already exist in the
 * served file. The NativeScript iOS V8 runtime registers a NATIVE-aware
 * `__extends` on `globalThis` (see ClassBuilder.mm `RegisterNativeTypeScriptExtendsFunction`)
 * which performs ObjC class registration when the parent is a native wrapper
 * (e.g. `NSObject`). Importing `__extends` from tslib shadows that global with
 * tslib's plain implementation, which never registers the class as a native
 * subclass — leading to `Cannot read properties of undefined (reading '__extended')`
 * when `_super.call(this)` runs. We must let `__extends` fall through to the
 * runtime global, so any pre-existing tslib `__extends` named import is removed
 * from this file's `tslib` import.
 */
function stripExtendsImportFromTslib(code: string): string {
	if (!/\b__extends\b/.test(code)) return code;

	let sf: ts.SourceFile;
	try {
		sf = ts.createSourceFile('extends-import-check.js', code, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
	} catch {
		return code;
	}

	const edits: Array<{ start: number; end: number; text: string }> = [];

	for (const stmt of sf.statements) {
		if (!ts.isImportDeclaration(stmt)) continue;
		const spec = stmt.moduleSpecifier;
		if (!ts.isStringLiteral(spec)) continue;
		// Match any tslib variant ("tslib", "tslib/...", or absolute paths to tslib).
		if (!/(?:^|\/)tslib(?:\/|$)|(?:^|[/\\])tslib[/\\]/.test(spec.text)) continue;
		const clause = stmt.importClause;
		if (!clause || !clause.namedBindings || !ts.isNamedImports(clause.namedBindings)) continue;
		const named = clause.namedBindings;
		const remaining = named.elements.filter((el) => (el.propertyName?.text ?? el.name.text) !== '__extends');
		if (remaining.length === named.elements.length) continue;
		if (remaining.length === 0 && !clause.name) {
			// The whole import would become empty — drop the entire statement.
			edits.push({ start: stmt.getFullStart(), end: stmt.getEnd(), text: '' });
			continue;
		}
		const remainingText = remaining.map((el) => code.slice(el.getStart(sf), el.getEnd())).join(', ');
		edits.push({ start: named.getStart(sf), end: named.getEnd(), text: `{ ${remainingText} }` });
	}

	if (!edits.length) return code;

	let output = code;
	for (const e of edits.sort((a, b) => b.start - a.start)) {
		output = output.slice(0, e.start) + e.text + output.slice(e.end);
	}
	return output;
}

/**
 * Post-phase cleanup for NativeClass decorators.
 * Strips `NativeClass` from any `__decorate([...], X)` call (regardless of what
 * other decorators / metadata appear in the array) and downlevels ES6 classes
 * to ES5 so the NativeScript runtime can detect native class inheritance via
 * `__extends`.
 *
 * The pre-phase plugin runs before Vite's TS pipeline and produces ES5 directly,
 * but downstream plugins (notably the Angular plugin) re-compile from the
 * original TypeScript source and overwrite the pre-phase output. This post-phase
 * pass catches those survivors. It's the safety net, not the primary path.
 *
 * Exported separately for testability.
 */
export function postCleanupNativeClass(code: string, bareId: string, verbose = false): { code: string; map: null } | null {
	if (!code) return null;
	if (!code.includes('__decorate') || !code.includes('NativeClass')) return null;

	let sf: ts.SourceFile;
	try {
		sf = ts.createSourceFile(bareId + '.js', code, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
	} catch {
		return null;
	}

	const { edits: decorateEdits, classNames: classNamesToDownlevel } = collectNativeClassDecorateEdits(code, sf);

	if (!classNamesToDownlevel.size) return null;

	// Apply decorator-stripping edits first so the AST we re-parse for Phase 2 is consistent.
	let output = code;
	for (const e of decorateEdits.sort((a, b) => b.start - a.start)) {
		output = output.slice(0, e.start) + e.text + output.slice(e.end);
	}

	// Phase 2: Downlevel any ES6 class expression that extends a native base.
	// Angular's re-compilation typically emits:
	//   var AppDelegate = class AppDelegate extends UIResponder { ... };
	// or with _1 alias:
	//   var PDFViewDelegateImpl = PDFViewDelegateImpl_1 = class PDFViewDelegateImpl extends NSObject { ... };
	// We rewrite each into ES5 with __extends so the NativeScript runtime can detect
	// native class inheritance and register ObjC/Java classes.
	let downleveledAtLeastOne = false;
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
			downleveledAtLeastOne = true;

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

	// If we downleveled at least one class, the output now references __extends.
	// We MUST NOT import __extends from tslib here: the NativeScript iOS V8 runtime
	// installs a native-aware `__extends` on `globalThis` that handles native class
	// registration when the parent is a native wrapper (e.g. NSObject). Importing
	// tslib's __extends would shadow that global with a plain implementation that
	// never registers the class as a native subclass, leading to
	// `Cannot read properties of undefined (reading '__extended')` when
	// `_super.call(this)` runs. Let the bare `__extends(...)` reference fall
	// through to the runtime global.
	if (downleveledAtLeastOne) {
		output = stripExtendsImportFromTslib(output);
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
