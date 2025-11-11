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
		const snippet = output.slice(fullStart, end);
		const stripped = snippet.replace(/\s*\/\*__NativeClass__\*\/\s*/m, '');
		const transpiled = ts
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
			.outputText.replace(
				/(Object\.defineProperty\(.*?{.*?)(enumerable:\s*false)(.*?}\))/gs,
				'$1enumerable: true$3',
			);

		output = output.slice(0, fullStart) + transpiled + output.slice(end);
	}

	this.callback(null, output, map);
}
