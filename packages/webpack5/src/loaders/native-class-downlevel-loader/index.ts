import type { LoaderContext } from 'webpack';
import ts from 'typescript';
import { SourceMapConsumer, SourceMapGenerator } from 'source-map';

// Downlevels ONLY classes marked with /*__NativeClass__*/ to ES5 IIFE pattern.
// Operates textually before ts-loader, preserving modern syntax elsewhere.
// Steps per marked class:
//  - Extract full class text including leading marker comment
//  - Remove the marker
//  - transpileModule(snippet, { target: ES5, module: ESNext, noEmitHelpers: true, useDefineForClassFields: false })
//  - Force enumerable: true on defineProperty outputs (compat with NativeScript expectations)
//  - Replace original snippet with downleveled JS
// The returned source map maps the output back to the loader's input, so
// ts-loader can compose it and stack traces point at the original lines.

interface Candidate {
	start: number;
	fullStart: number;
	end: number;
}

interface DownleveledClass {
	code: string;
	map: any;
	// Lines added in front of the transpiled class (separator newline and IIFE wrapper).
	leadingLines: number;
}

interface Position {
	line: number;
	column: number;
}

const SOURCE_MAPPING_URL_RE = /\n?\/\/# sourceMappingURL=[^\n]*\s*$/;

function downlevelClass(
	loader: LoaderContext<any>,
	snippet: string,
): DownleveledClass {
	// strip marker ONLY, preserve surrounding newline to avoid commenting out the next line
	const stripped = snippet.replace(/\/\*__NativeClass__\*\//m, '');
	const transpileResult = ts.transpileModule(stripped, {
		compilerOptions: {
			module: ts.ModuleKind.ESNext,
			target: ts.ScriptTarget.ES5,
			noEmitHelpers: true,
			experimentalDecorators: true,
			emitDecoratorMetadata: false,
			useDefineForClassFields: false,
			sourceMap: true,
		},
		fileName: loader.resourcePath.endsWith('.ts')
			? loader.resourcePath
			: `${loader.resourcePath}.ts`,
		reportDiagnostics: true,
	});
	if (process.env.NATIVECLASS_DEBUG && transpileResult.diagnostics?.length) {
		const diag = transpileResult.diagnostics[0];
		loader.emitWarning(
			new Error(
				`[native-class-downlevel-loader] transpile diagnostics in ${loader.resourcePath}: ${diag?.messageText}`,
			),
		);
	}
	const transpiledRaw = transpileResult.outputText.replace(
		SOURCE_MAPPING_URL_RE,
		'\n',
	);
	// force enumerable:true
	let transpiled = transpiledRaw.replace(
		/(Object\.defineProperty\(.*?{.*?)(enumerable:\s*false)(.*?}\))/gs,
		'$1enumerable: true$3',
	);

	if (
		process.env.NATIVECLASS_DEBUG &&
		/page-transition\.android\.ts$/.test(loader.resourcePath)
	) {
		const head = stripped.slice(0, 200).replace(/\n/g, '\\n');
		const outHead = transpiled.slice(0, 200).replace(/\n/g, '\\n');
		loader.emitWarning(
			new Error(
				`[native-class-downlevel-loader] debug ${loader.resourcePath} snippetHead="${head}" -> outHead="${outHead}"`,
			),
		);
	}
	let leadingLines = 0;
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
			leadingLines = 1;
		}
	} catch (e) {
		// ignore parsing safety guard failures – fallback to raw transpiled
	}
	// transpileModule drops the leading newline; keep statements apart.
	transpiled = `\n${transpiled}`;
	leadingLines += 1;
	if (process.env.NATIVECLASS_DEBUG) {
		loader.emitWarning(
			new Error(
				`[native-class-downlevel-loader] transformed class snippet from ${loader.resourcePath} (bytes: ${snippet.length} -> ${transpiled.length})`,
			),
		);
	}
	return {
		code: transpiled,
		map: JSON.parse(transpileResult.sourceMapText),
		leadingLines,
	};
}

function snippetFor(content: string, { fullStart, end }: Candidate) {
	// include trailing semicolon if immediately follows class (defensive – TS sometimes emits one when rebundled)
	return /^;/.test(content.slice(end, end + 2))
		? content.slice(fullStart, end) + ';'
		: content.slice(fullStart, end);
}

function lineStartsOf(text: string) {
	const starts = [0];
	for (let i = 0; i < text.length; i++) {
		if (text[i] === '\n') {
			starts.push(i + 1);
		}
	}
	return starts;
}

function positionAt(lineStarts: number[], offset: number): Position {
	let low = 0;
	let high = lineStarts.length - 1;
	while (low < high) {
		const mid = (low + high + 1) >> 1;
		if (lineStarts[mid] <= offset) {
			low = mid;
		} else {
			high = mid - 1;
		}
	}
	return { line: low + 1, column: offset - lineStarts[low] };
}

class OutputBuilder {
	code = '';
	private line = 1;
	private column = 0;

	constructor(
		private readonly generator: SourceMapGenerator,
		private readonly source: string,
	) {}

	get position(): Position {
		return { line: this.line, column: this.column };
	}

	addMapping(generated: Position, original: Position) {
		this.generator.addMapping({ generated, original, source: this.source });
	}

	// Copies untouched input, mapping every line start and token to itself.
	appendOriginal(text: string, original: Position) {
		let mapNext = true;
		let originalLine = original.line;
		let originalColumn = original.column;
		for (const char of text) {
			const isSpace = char === ' ' || char === '\t' || char === '\r';
			if (char !== '\n' && !isSpace && mapNext) {
				this.addMapping(this.position, {
					line: originalLine,
					column: originalColumn,
				});
			}
			mapNext = isSpace || char === '\n' || /[^\w$]/.test(char);
			this.code += char;
			if (char === '\n') {
				this.line++;
				this.column = 0;
				originalLine++;
				originalColumn = 0;
				this.addMapping(this.position, {
					line: originalLine,
					column: originalColumn,
				});
			} else {
				this.column++;
				originalColumn++;
			}
		}
	}

	appendGenerated(text: string) {
		for (const char of text) {
			this.code += char;
			if (char === '\n') {
				this.line++;
				this.column = 0;
			} else {
				this.column++;
			}
		}
	}
}

async function appendDownleveled(
	output: OutputBuilder,
	downleveled: DownleveledClass,
	classStart: Position,
) {
	const start = output.position;
	const firstLine = start.line + downleveled.leadingLines;
	const firstColumn = downleveled.leadingLines ? 0 : start.column;
	const byLine = new Map<
		number,
		Array<{ column: number; original: Position }>
	>();

	await SourceMapConsumer.with(downleveled.map, null, (consumer) => {
		consumer.eachMapping((m) => {
			if (m.originalLine == null) {
				return;
			}
			const line = firstLine + m.generatedLine - 1;
			const column =
				m.generatedLine === 1
					? firstColumn + m.generatedColumn
					: m.generatedColumn;
			const original = {
				line: classStart.line + m.originalLine - 1,
				column:
					m.originalLine === 1
						? classStart.column + m.originalColumn
						: m.originalColumn,
			};
			if (!byLine.has(line)) {
				byLine.set(line, []);
			}
			byLine.get(line).push({ column, original });
		});
	});

	output.appendGenerated(downleveled.code);
	const end = output.position;

	// Every generated line needs a mapping from its first column, or
	// composing maps would fall back to the downleveled text.
	let last = classStart;
	for (let line = start.line; line <= end.line; line++) {
		const mappings = (byLine.get(line) ?? []).sort(
			(a, b) => a.column - b.column,
		);
		const lineStart = line === start.line ? start.column : 0;
		if (!mappings.length || mappings[0].column > lineStart) {
			output.addMapping(
				{ line, column: lineStart },
				mappings[0]?.original ?? last,
			);
		}
		for (const { column, original } of mappings) {
			output.addMapping({ line, column }, original);
			last = original;
		}
	}
}

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
	const candidates: Candidate[] = [];

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

	candidates.sort((a, b) => a.fullStart - b.fullStart);
	const nested = candidates.some(
		(candidate, i) => i > 0 && candidate.fullStart < candidates[i - 1].end,
	);
	if (nested) {
		// Replace from last to first to keep indices valid; no map for nested classes.
		let output = content;
		for (const candidate of [...candidates].reverse()) {
			const { code } = downlevelClass(this, snippetFor(output, candidate));
			output =
				output.slice(0, candidate.fullStart) +
				code +
				output.slice(candidate.end);
		}
		this.callback(null, output, map);
		return;
	}

	const callback = this.async();
	const generator = new SourceMapGenerator({ file: this.resourcePath });
	generator.setSourceContent(this.resourcePath, content);
	const output = new OutputBuilder(generator, this.resourcePath);
	const lineStarts = lineStartsOf(content);

	(async () => {
		let cursor = 0;
		for (const candidate of candidates) {
			output.appendOriginal(
				content.slice(cursor, candidate.fullStart),
				positionAt(lineStarts, cursor),
			);
			await appendDownleveled(
				output,
				downlevelClass(this, snippetFor(content, candidate)),
				positionAt(lineStarts, candidate.fullStart),
			);
			cursor = candidate.end;
		}
		output.appendOriginal(
			content.slice(cursor),
			positionAt(lineStarts, cursor),
		);

		if (map) {
			await SourceMapConsumer.with(
				{ ...map, file: this.resourcePath },
				null,
				(consumer) => generator.applySourceMap(consumer, this.resourcePath),
			);
		}
		return { code: output.code, map: generator.toJSON() };
	})().then(
		({ code, map: outputMap }) => callback(null, code, outputMap),
		(err) => callback(err),
	);
}
