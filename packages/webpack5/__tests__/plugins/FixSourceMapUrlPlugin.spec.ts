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
		hasEmitHandler() {
			return !!emitHandler;
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
	it('rewrites sourceMappingURL to the devtoolsHost origin', () => {
		const devtoolsHost = 'http://127.0.0.1:41500';
		const { compiler, run } = createCompiler();

		new FixSourceMapUrlPlugin({ devtoolsHost }).apply(compiler);

		const compilation = createCompilation(
			'console.log("test");\n//# sourceMappingURL=bundle.js.map',
		);
		run(compilation);

		expect(compilation.assets['bundle.js'].source()).toContain(
			`//# sourceMappingURL=${devtoolsHost}/bundle.js.map`,
		);
	});

	it('strips leading slashes from the map path when joining with the host', () => {
		const devtoolsHost = 'http://127.0.0.1:41500';
		const { compiler, run } = createCompiler();

		new FixSourceMapUrlPlugin({ devtoolsHost }).apply(compiler);

		const compilation = createCompilation(
			'console.log("test");\n//# sourceMappingURL=/bundle.js.map',
		);
		run(compilation);

		expect(compilation.assets['bundle.js'].source()).toContain(
			`//# sourceMappingURL=${devtoolsHost}/bundle.js.map`,
		);
		expect(compilation.assets['bundle.js'].source()).not.toContain(
			`${devtoolsHost}//`,
		);
	});

	it('strips trailing slashes from the devtoolsHost', () => {
		const devtoolsHost = 'http://127.0.0.1:41500/';
		const { compiler, run } = createCompiler();

		new FixSourceMapUrlPlugin({ devtoolsHost }).apply(compiler);

		const compilation = createCompilation(
			'console.log("test");\n//# sourceMappingURL=bundle.js.map',
		);
		run(compilation);

		expect(compilation.assets['bundle.js'].source()).toContain(
			`//# sourceMappingURL=http://127.0.0.1:41500/bundle.js.map`,
		);
	});

	it('leaves absolute source map urls unchanged', () => {
		const devtoolsHost = 'http://127.0.0.1:41500';
		const existingUrl = 'http://example.test/bundle.js.map';
		const { compiler, run } = createCompiler();

		new FixSourceMapUrlPlugin({ devtoolsHost }).apply(compiler);

		const compilation = createCompilation(
			`console.log("test");\n//# sourceMappingURL=${existingUrl}`,
		);
		run(compilation);

		expect(compilation.assets['bundle.js'].source()).toContain(
			`//# sourceMappingURL=${existingUrl}`,
		);
	});

	it('no-ops and skips tapping hooks when devtoolsHost is not provided', () => {
		const { compiler, hasEmitHandler } = createCompiler();

		new FixSourceMapUrlPlugin({}).apply(compiler);

		expect(hasEmitHandler()).toBe(false);
	});
});
