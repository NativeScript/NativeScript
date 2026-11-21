import ts from 'typescript';
import { SourceMapConsumer, SourceMapGenerator } from 'source-map';

import stripLoader from '../../src/loaders/native-class-strip-loader';
import downlevelLoader from '../../src/loaders/native-class-downlevel-loader';

const RESOURCE = '/app/delegate.ts';

const SOURCE = [
	"import { Observable } from '@nativescript/core';",
	'',
	'',
	'@NativeClass()',
	'class Delegate extends NSObject {',
	'\tstatic ObjCProtocols = [];',
	'',
	'\tvalue = 1;',
	'',
	'\trun(): number {',
	'\t\treturn this.value + 1;',
	'\t}',
	'}',
	'',
	'export function afterClass(): number {',
	'\treturn (Delegate.new() as Delegate).run();',
	'}',
	'',
	'export const observable = new Observable();',
].join('\n');

interface LoaderOutput {
	code: string;
	map?: any;
}

function runLoader(loader: Function, content: string, map?: any) {
	return new Promise<LoaderOutput>((resolve, reject) => {
		const done = (err: Error | null, code?: string, outputMap?: any) =>
			err ? reject(err) : resolve({ code: code ?? '', map: outputMap });
		loader.call(
			{
				resourcePath: RESOURCE,
				emitWarning: () => {},
				callback: done,
				async: () => done,
			},
			content,
			map,
		);
	});
}

// Compiles like ts-loader: its own map, composed with the incoming one.
async function compileLikeTsLoader({ code, map }: LoaderOutput) {
	const output = ts.transpileModule(code, {
		fileName: RESOURCE,
		compilerOptions: {
			module: ts.ModuleKind.ESNext,
			target: ts.ScriptTarget.ES2020,
			sourceMap: true,
		},
	});
	const tsMap = Object.assign(JSON.parse(output.sourceMapText), {
		sources: [RESOURCE],
		sourcesContent: [code],
	});
	if (!map) {
		return { code: output.outputText, map: tsMap };
	}
	const tsConsumer = await new SourceMapConsumer(tsMap);
	const inputConsumer = await new SourceMapConsumer({ ...map, file: RESOURCE });
	const generator = SourceMapGenerator.fromSourceMap(tsConsumer);
	generator.applySourceMap(inputConsumer);
	tsConsumer.destroy();
	inputConsumer.destroy();
	return { code: output.outputText, map: generator.toJSON() };
}

async function build(source: string) {
	const stripped = await runLoader(stripLoader, source);
	const downleveled = await runLoader(
		downlevelLoader,
		stripped.code,
		stripped.map,
	);
	return { downleveled, compiled: await compileLikeTsLoader(downleveled) };
}

async function originalLine(output: LoaderOutput, needle: string) {
	const lines = output.code.split('\n');
	const line = lines.findIndex((text) => text.includes(needle));
	expect(line).toBeGreaterThanOrEqual(0);
	const consumer = await new SourceMapConsumer(output.map);
	try {
		return consumer.originalPositionFor({
			line: line + 1,
			column: lines[line].indexOf(needle),
		}).line;
	} finally {
		consumer.destroy();
	}
}

describe('native-class loaders source maps', () => {
	it('maps code inside and after a downleveled class to its original line', async () => {
		const { downleveled, compiled } = await build(SOURCE);

		expect(downleveled.code).not.toContain('class Delegate');
		expect(await originalLine(compiled, 'this.value + 1')).toBe(11);
		expect(await originalLine(compiled, 'afterClass')).toBe(15);
		expect(await originalLine(compiled, 'Delegate.new()')).toBe(16);
		expect(await originalLine(compiled, 'new Observable()')).toBe(19);
	});

	it('embeds the original source in the composed map', async () => {
		const { compiled } = await build(SOURCE);

		expect(compiled.map.sourcesContent).toEqual([SOURCE]);
	});

	it('keeps the line count when stripping the decorator', async () => {
		const atStart = [
			'@NativeClass',
			'class A extends NSObject {}',
			'export const a = 1;',
		].join('\n');
		const afterBlankLines = [
			'const x = 1;',
			'',
			'',
			'@NativeClass({',
			'\tprotocols: [],',
			'})',
			'class B extends NSObject {}',
		].join('\n');

		for (const source of [atStart, afterBlankLines]) {
			const stripped = await runLoader(stripLoader, source);
			expect(stripped.code).toContain('/*__NativeClass__*/');
			expect(stripped.code).not.toContain('@NativeClass');
			expect(stripped.code.split('\n').length).toBe(source.split('\n').length);
		}
	});
});
