import ts from 'typescript';
// This is the active NativeClass transform: a localized textual + AST-assisted
// downlevel that avoids edge corruption of computed property names (e.g.
// ['frame-in']). It is the single production implementation in this package.
import { getCliFlags } from './cli-flags.js';
import type { Platform } from './platform-types.js';

function isTruthyFlagValue(value: unknown): boolean {
	if (value === true) return true;
	if (typeof value !== 'string') return false;
	const normalized = value.toLowerCase();
	return normalized !== '' && normalized !== '0' && normalized !== 'false';
}

/**
 * Skip the NativeClass ES5 downlevel on every platform so the runtime can consume
 * `@NativeClass` directly. Enabled via `--env.disableNativeClassTransformer`
 * (alias: `--env.disableNativeTransformer`) or `NS_DISABLE_NATIVE_CLASS_TRANSFORMER`
 * (set to `0`/`false` to force-disable).
 */
export function isNativeClassTransformerDisabled(): boolean {
	const envValue = process.env.NS_DISABLE_NATIVE_CLASS_TRANSFORMER;
	if (envValue !== undefined) {
		return isTruthyFlagValue(envValue);
	}
	try {
		const flags = getCliFlags();
		return isTruthyFlagValue(flags.disableNativeClassTransformer) || isTruthyFlagValue(flags.disableNativeTransformer);
	} catch (e) {
		return false;
	}
}

/**
 * Opt-in: skip the NativeClass ES5 downlevel entirely and let the iOS runtime handle plain
 * ES `class X extends NativeBase {}` declarations natively (the runtime registers the
 * Objective-C class lazily via new.target and also provides a global no-op `NativeClass`
 * decorator, so decorated sources keep working without any build-time rewriting).
 *
 * Enabled via `--env.nativeESClasses` or the NS_NATIVE_ES_CLASSES environment variable
 * (set NS_NATIVE_ES_CLASSES=0/false to force-disable). Android continues to require the
 * ES5 downlevel (the Static Binding Generator relies on it), so this never applies to
 * Android targets.
 */
export function isNativeESClassesEnabled(platform?: Platform): boolean {
	if (platform === 'android') return false;
	const envValue = process.env.NS_NATIVE_ES_CLASSES;
	if (envValue !== undefined) {
		return isTruthyFlagValue(envValue);
	}
	try {
		const flags = getCliFlags();
		return isTruthyFlagValue(flags.nativeESClasses);
	} catch (e) {
		return false;
	}
}

/**
 * Returns true when NativeClass sources should be left untouched.
 * @param platform Optional build platform used by the Apple-only native ES class mode.
 */
export function shouldSkipNativeClassTransform(platform?: Platform): boolean {
	return isNativeClassTransformerDisabled() || isNativeESClassesEnabled(platform);
}

/**
 * Apply the NativeClass transformer to a source string. Returns null if no change performed.
 */
export function transformNativeClassSource(code: string, fileName: string) {
	// Avoid transforming platform-specific sources for the non-target platform.
	// Example: don't run Android-specific transforms on iOS builds and vice versa.
	let platform: Platform | undefined;
	try {
		const flags = getCliFlags();
		platform = flags.android ? 'android' : 'ios';
		if (fileName.includes('.android.') && platform !== 'android') return null;
		if ((fileName.includes('.ios.') || fileName.includes('.visionos.')) && platform === 'android') return null;
	} catch (e) {
		// If cli flags cannot be read for any reason, fall back to original behavior.
	}

	// Skip downlevel when the runtime should handle NativeClass.
	if (shouldSkipNativeClassTransform(platform)) return null;

	// If this is JS and we see a __decorate* call that references NativeClass, strip it safely.
	const isJS = /\.(js|mjs|cjs)$/.test(fileName);
	if (isJS && /__decorate[a-zA-Z$]*\s*\(/.test(code) && /\bNativeClass\b/.test(code)) {
		try {
			const sfJS = ts.createSourceFile(fileName, code, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
			let mutated = false;
			const transformer: ts.TransformerFactory<ts.SourceFile> = (ctx) => {
				const factory = ctx.factory ?? ts.factory;
				const visit: ts.Visitor = (node) => {
					if (ts.isCallExpression(node)) {
						const callee = node.expression;
						const calleeName = ts.isIdentifier(callee) ? callee.text : ts.isPropertyAccessExpression(callee) && ts.isIdentifier(callee.expression) ? `${callee.expression.text}.${callee.name.text}` : undefined;
						if (calleeName && /^__decorate/.test(calleeName) && node.arguments.length >= 1) {
							const firstArg = node.arguments[0];
							if (ts.isArrayLiteralExpression(firstArg)) {
								const kept = firstArg.elements.filter((el) => !(ts.isIdentifier(el) && el.text === 'NativeClass'));
								if (kept.length !== firstArg.elements.length) {
									mutated = true;
									if (kept.length === 0 && node.arguments.length >= 2) {
										return ts.visitNode(node.arguments[1], visit) as ts.Expression;
									}
									const newArr = factory.updateArrayLiteralExpression(firstArg, kept as any);
									return factory.updateCallExpression(node, node.expression, node.typeArguments, [newArr, ...node.arguments.slice(1)]);
								}
							}
						}
					}
					return ts.visitEachChild(node, visit, ctx);
				};
				return (node) => ts.visitNode(node, visit) as ts.SourceFile;
			};
			const res = ts.transform<ts.SourceFile>(sfJS, [transformer]);
			const transformed = res.transformed[0];
			if (!mutated) {
				res.dispose();
				return null;
			}
			const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
			const output = printer.printFile(transformed);
			res.dispose();
			return { code: output, map: null };
		} catch {
			// fall through to TS path if anything goes wrong
		}
	}

	// Pre-strip textual @NativeClass decorator (and variants with args) immediately preceding a class,
	// replacing just that occurrence with a stable marker. This ensures we never leave a runtime
	// identifier behind if TypeScript skips or rearranges decorators in this compile phase.
	// Matches stacked decorators and multi-line @NativeClass(...) args.
	// Match @NativeClass (optionally with args, multi-line) not preceded by another decorator line capturing stacked sequences.
	// We'll place the marker right before the class declaration start to simplify slicing.
	const DECORATOR_BLOCK_RE = /(^|\n)((?:\s*@[\w$][^\n]*\n)*)\s*@NativeClass(?:\([\s\S]*?\))?\s*(?=\n(?:\s*@[\w$][^\n]*\n)*\s*(?:export\s+)?class\s)/g;
	const working = code.replace(DECORATOR_BLOCK_RE, (full, prefix, stacked) => {
		// Keep other decorators, inject marker after them.
		return `${prefix || '\n'}${stacked || ''}/*__NativeClass__*/`;
	});

	// If neither original nor marker is present, skip transform early.
	if (!working.includes('@NativeClass') && !working.includes('/*__NativeClass__*/')) return null;
	try {
		const sf = ts.createSourceFile(fileName, working, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
		const edits: { start: number; end: number; text: string }[] = [];
		// Collect all class declarations (top-level or nested) for potential transform
		const collect = (node: ts.Node) => {
			if (ts.isClassDeclaration(node)) {
				const fullStart = (node as any).getFullStart ? (node as any).getFullStart() : node.pos;
				const preamble = working.slice(fullStart, Math.min(node.getStart(sf) + 64, node.end));
				if (/\/\*__NativeClass__\*\//.test(preamble)) {
					const original = working.slice(fullStart, node.end);
					const stripped = original.replace(/\/\*__NativeClass__\*\/\s*/g, '').replace(/^\s*@NativeClass(?:\([\s\S]*?\))?\s*$/gm, '');
					const hadExport = /^\s*export\s+class\b/.test(stripped);
					const down = ts
						.transpileModule(stripped, {
							compilerOptions: {
								module: ts.ModuleKind.ESNext,
								target: ts.ScriptTarget.ES5,
								experimentalDecorators: true,
								emitDecoratorMetadata: false,
								noEmitHelpers: true,
								useDefineForClassFields: false,
							},
						})
						.outputText.replace(/enumerable:\s*false/g, 'enumerable: true');
					let cleaned = down.replace(/export \{\};?\s*$/m, '');
					if (hadExport) {
						const name = (node as ts.ClassDeclaration).name?.text;
						if (name && !new RegExp(`export\\s*\\{\\s*${name}\\s*\\}`, 'm').test(cleaned)) {
							cleaned += `\nexport { ${name} };\n`;
						}
					}
					edits.push({ start: fullStart, end: node.end, text: cleaned });
				}
			}
			ts.forEachChild(node, collect);
		};
		collect(sf);
		if (!edits.length) return null;
		// Apply edits sequentially
		let output = working;
		// Sort edits by start descending so indices remain valid
		for (const e of edits.sort((a, b) => b.start - a.start)) {
			output = output.slice(0, e.start) + e.text + output.slice(e.end);
		}
		// Remove any remaining markers
		output = output.replace(/\/\*__NativeClass__\*\/\s*/g, '').replace(/@NativeClass(?:\([\s\S]*?\))?\s*/g, '');

		// Deduplicate accidental duplicate re-export lines (e.g. `export { Foo };` appearing twice)
		// This can happen if the transpiled snippet already emitted an export and we also appended one.
		const seenExportLines = new Set<string>();
		output = output
			.split(/\r?\n/)
			.filter((line) => {
				const trimmed = line.trim();
				if (/^export\s*{\s*[A-Za-z_$][A-Za-z0-9_$]*\s*};?$/.test(trimmed)) {
					if (seenExportLines.has(trimmed)) {
						return false; // drop duplicate
					}
					seenExportLines.add(trimmed);
				}
				return true;
			})
			.join('\n');
		return { code: output, map: null };
	} catch {
		return null;
	}
}
