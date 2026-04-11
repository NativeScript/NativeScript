import { resolve } from 'path';
import { pathToFileURL } from 'url';

import FixSourceMapUrlPlugin from '../../src/plugins/FixSourceMapUrlPlugin';

function createCompiler() {
	let emitHandler: ((compilation: any) => void) | undefined;

	return {
		compiler: {
			hooks: {
				emit: {
					tap(_name: string, handler: (compilation: any) => void) {
						emitHandler = handler;
					},
				},
			},
		} as any,
		run(compilation: any) {
			if (!emitHandler) {
				throw new Error('Expected emit hook to be registered.');
			}

			emitHandler(compilation);
		},
	};
}

function createCompilation(source: string) {
	return {
		assets: {
			'bundle.js': {
				source: () => source,
				size: () => source.length,
			},
		},
	};
}

describe('FixSourceMapUrlPlugin', () => {
	it('encodes spaces in rewritten source map urls', () => {
		const outputPath = '/Users/test/my tns app/platforms/android/dist';
		const { compiler, run } = createCompiler();

		new FixSourceMapUrlPlugin({ outputPath }).apply(compiler);

		const compilation = createCompilation(
			'console.log("test");\n//# sourceMappingURL=bundle.js.map',
		);
		run(compilation);

		expect(compilation.assets['bundle.js'].source()).toContain(
			`//# sourceMappingURL=${pathToFileURL(resolve(outputPath, 'bundle.js.map')).toString()}`,
		);
		expect(compilation.assets['bundle.js'].source()).toContain('%20');
	});

	it('leaves absolute source map urls unchanged', () => {
		const outputPath = '/Users/test/my tns app/platforms/android/dist';
		const existingUrl =
			'file:///Users/test/my%20tns%20app/platforms/android/dist/bundle.js.map';
		const { compiler, run } = createCompiler();

		new FixSourceMapUrlPlugin({ outputPath }).apply(compiler);

		const compilation = createCompilation(
			`console.log("test");\n//# sourceMappingURL=${existingUrl}`,
		);
		run(compilation);

		expect(compilation.assets['bundle.js'].source()).toContain(
			`//# sourceMappingURL=${existingUrl}`,
		);
	});
});
