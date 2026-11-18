import ts from 'typescript';
import { SourceMapConsumer } from 'source-map';

import appCssLoader from '../../src/loaders/app-css-loader';

const SOURCE = [
	"import { Application } from '@nativescript/core';",
	'',
	'declare const unused: number;',
	'',
	'function fail(): never {',
	"\tthrow new Error('boom');",
	'}',
	'',
	"Application.run({ moduleName: 'app-root' });",
].join('\n');

interface LoaderResult {
	code: string;
	map?: any;
}

function transpile() {
	const output = ts.transpileModule(SOURCE, {
		fileName: '/app/app.ts',
		compilerOptions: {
			module: ts.ModuleKind.ESNext,
			target: ts.ScriptTarget.ES2020,
			sourceMap: true,
		},
	});
	return { code: output.outputText, map: JSON.parse(output.sourceMapText) };
}

function runLoader(
	content: string,
	map: any,
	cssFile: string | null,
): Promise<LoaderResult> {
	return new Promise((resolve, reject) => {
		const context = {
			context: '/app',
			resourcePath: '/app/app.ts',
			getOptions: () => ({ platform: 'ios' }),
			getResolve:
				() =>
				(_context: string, _request: string, done: (err, res?) => void) =>
					cssFile ? done(null, cssFile) : done(new Error('not found')),
			async: () => (err: Error | null, code: string, outputMap?: any) =>
				err ? reject(err) : resolve({ code, map: outputMap }),
		};
		appCssLoader.call(context, content, map);
	});
}

async function originalLine(result: LoaderResult, needle: string) {
	const lines = result.code.split('\n');
	const line = lines.findIndex((text) => text.includes(needle));
	const consumer = await new SourceMapConsumer(result.map);
	try {
		return consumer.originalPositionFor({
			line: line + 1,
			column: lines[line].indexOf(needle),
		}).line;
	} finally {
		consumer.destroy();
	}
}

describe('app-css-loader', () => {
	it('imports the app css and keeps source map positions', async () => {
		const { code, map } = transpile();
		const result = await runLoader(code, map, '/app/app.css');

		expect(result.code).toContain('import "./app.css";');
		expect(await originalLine(result, 'throw new Error')).toBe(6);
		expect(await originalLine(result, 'Application.run')).toBe(9);
	});

	it('passes content and map through when there is no app css', async () => {
		const { code, map } = transpile();
		const result = await runLoader(code, map, null);

		expect(result.code).toBe(code);
		expect(result.map).toBe(map);
	});

	it('imports the app css without a map when none is given', async () => {
		const { code } = transpile();
		const result = await runLoader(code, undefined, '/app/app.scss');

		expect(result.code).toContain('import "./app.scss";');
		expect(result.code).toContain(code);
		expect(result.map).toBeUndefined();
	});
});
