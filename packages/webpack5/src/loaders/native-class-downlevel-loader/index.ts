import type { LoaderContext } from 'webpack';
import ts from 'typescript';

// Downlevels ONLY classes marked with /*__NativeClass__*/ to ES5 IIFE pattern.
// Operates textually before ts-loader, preserving modern syntax elsewhere.
// Steps per marked class:
//  - Extract full class text including leading marker comment
//  - Remove the marker
//  - transpileModule(snippet, { target: ES5, module: ESNext, noEmitHelpers: true, useDefineForClassFields: false })
//  - Force enumerable: true on defineProperty outputs (compat with NativeScript expectations)
//  - Replace original snippet with downleveled JS

export default function nativeClassDownlevelLoader(
	this: LoaderContext<any>,
	content: string,
	map: any,
) {
	if (!content.includes('/*__NativeClass__*/')) {
		this.callback(null, content, map);
		return;
	}

	const sf = ts.createSourceFile(
		this.resourcePath,
		content,
		ts.ScriptTarget.Latest,
		/*setParentNodes*/ true,
		ts.ScriptKind.TS,
	);

	// Collect candidate classes with the marker in their leading trivia
	const candidates: Array<{ start: number; fullStart: number; end: number }> =
		[];

	const checkNode = (node: ts.Node) => {
		if (ts.isClassDeclaration(node)) {
			const fullStart = (node as any).getFullStart
				? (node as any).getFullStart()
				: node.pos;
			const start = node.getStart(sf);
			const leading = content.slice(fullStart, start);
			if (/\/\*__NativeClass__\*\//.test(leading)) {
				candidates.push({ start, fullStart, end: node.end });
			}
		}
		ts.forEachChild(node, checkNode);
	};
	checkNode(sf);

	if (candidates.length === 0) {
		// Marker exists but not immediately preceding a class; leave as-is
		this.callback(null, content, map);
		return;
	}

	// Replace from last to first to keep indices valid
	candidates.sort((a, b) => b.fullStart - a.fullStart);
	let output = content;
	for (const { fullStart, end } of candidates) {
		let snippet = output.slice(fullStart, end);
		// include trailing semicolon if immediately follows class (defensive – TS sometimes emits one when rebundled)
		const after = output.slice(end, end + 2);
		if (/^;/.test(after)) {
			snippet += ';';
		}
		// strip marker ONLY, preserve surrounding newline to avoid commenting out the next line
		const stripped = snippet.replace(/\/\*__NativeClass__\*\//m, '');
		const transpileResult = ts.transpileModule(stripped, {
			compilerOptions: {
				module: ts.ModuleKind.ESNext,
				target: ts.ScriptTarget.ES5,
				noEmitHelpers: true,
				experimentalDecorators: true,
				emitDecoratorMetadata: true,
				useDefineForClassFields: false,
			},
			fileName: this.resourcePath.endsWith('.ts')
				? this.resourcePath
				: `${this.resourcePath}.ts`,
			reportDiagnostics: true,
		});
		if (process.env.NATIVECLASS_DEBUG && transpileResult.diagnostics?.length) {
			const diag = transpileResult.diagnostics[0];
			this.emitWarning(
				new Error(
					`[native-class-downlevel-loader] transpile diagnostics in ${this.resourcePath}: ${diag?.messageText}`,
				),
			);
		}
		const transpiledRaw = transpileResult.outputText;
		// force enumerable:true
		let transpiled = transpiledRaw.replace(
			/(Object\.defineProperty\(.*?{.*?)(enumerable:\s*false)(.*?}\))/gs,
			'$1enumerable: true$3',
		);

		if (
			process.env.NATIVECLASS_DEBUG &&
			/page-transition\.android\.ts$/.test(this.resourcePath)
		) {
			const head = stripped.slice(0, 200).replace(/\n/g, '\\n');
			const outHead = transpiled.slice(0, 200).replace(/\n/g, '\\n');
			this.emitWarning(
				new Error(
					`[native-class-downlevel-loader] debug ${this.resourcePath} snippetHead="${head}" -> outHead="${outHead}"`,
				),
			);
		}
		// Safety: parse transpiled snippet to ensure no top-level return statements leaked.
		// (Would indicate a slicing bug causing constructor body to escape.)
		try {
			const checkSource = ts.createSourceFile(
				'check.js',
				transpiled,
				ts.ScriptTarget.ES2017,
				true,
				ts.ScriptKind.JS,
			);
			const hasTopLevelReturn = checkSource.statements.some(
				(s) => s.kind === ts.SyntaxKind.ReturnStatement,
			);
			if (hasTopLevelReturn) {
				// Wrap in an IIFE to retain semantics and avoid syntax error
				transpiled = `(function(){\n${transpiled}\n})();`;
			}
		} catch (e) {
			// ignore parsing safety guard failures – fallback to raw transpiled
		}
		if (process.env.NATIVECLASS_DEBUG) {
			this.emitWarning(
				new Error(
					`[native-class-downlevel-loader] transformed class snippet from ${this.resourcePath} (bytes: ${snippet.length} -> ${transpiled.length})`,
				),
			);
		}
		output = output.slice(0, fullStart) + transpiled + output.slice(end);
	}

	this.callback(null, output, map);
}
