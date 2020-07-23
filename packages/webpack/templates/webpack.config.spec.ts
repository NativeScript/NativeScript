import * as proxyquire from 'proxyquire';
import * as nsWebpackIndex from '../index';
import { join } from 'path';
// With noCallThru enabled, `proxyquire` will not fall back to requiring the real module to populate properties that are not mocked.
// This allows us to mock packages that are not available in node_modules.
// In case you want to enable fallback for a specific object, just add `'@noCallThru': false`.
proxyquire.noCallThru();

class EmptyClass {}

let angularCompilerOptions: any;
class AngularCompilerStub {
	constructor(options) {
		angularCompilerOptions = options;
	}
}

let terserOptions: any;
class TerserJsStub {
	constructor(options) {
		terserOptions = options;
	}
}

const nativeScriptDevWebpack = {
	GenerateBundleStarterPlugin: EmptyClass,
	GenerateNativeScriptEntryPointsPlugin: EmptyClass,
	WatchStateLoggerPlugin: EmptyClass,
	PlatformFSPlugin: EmptyClass,
	getAppPath: () => 'app',
	getEntryModule: () => 'EntryModule',
	hasRootLevelScopedModules: () => false,
	hasRootLevelScopedAngular: () => false,
	processTsPathsForScopedModules: () => false,
	processTsPathsForScopedAngular: () => false,
	getResolver: () => null,
	getConvertedExternals: nsWebpackIndex.getConvertedExternals,
	getSourceMapFilename: nsWebpackIndex.getSourceMapFilename,
	processAppComponents: nsWebpackIndex.processAppComponents,
	getUserDefinedEntries: nsWebpackIndex.getUserDefinedEntries,
};

const emptyObject = {};
const FakeHmrTransformerFlag = 'hmr';
const FakeNativeClassTransformerFlag = 'NativeClass';
const FakeLazyTransformerFlag = 'lazy';
const webpackConfigAngular = proxyquire('./webpack.angular', {
	'@nativescript/webpack': nativeScriptDevWebpack,
	'@nativescript/webpack/nativescript-target': emptyObject,
	'@nativescript/webpack/transformers/ns-support-hmr-ng': {
		nsSupportHmrNg: () => {
			return FakeHmrTransformerFlag;
		},
	},
	'@nativescript/webpack/transformers/ns-transform-native-classes-ng': {
		nsTransformNativeClassesNg: () => {
			return FakeNativeClassTransformerFlag;
		},
	},
	'@nativescript/webpack/utils/ast-utils': {
		getMainModulePath: () => {
			return 'fakePath';
		},
	},
	'@nativescript/webpack/utils/tsconfig-utils': {
		getNoEmitOnErrorFromTSConfig: () => {
			return false;
		},
		getCompilerOptionsFromTSConfig: () => {
			return false;
		},
	},
	'@nativescript/webpack/plugins/NativeScriptAngularCompilerPlugin': {
		getAngularCompilerPlugin: () => {
			return AngularCompilerStub;
		},
	},
	'@ngtools/webpack': {
		AngularCompilerPlugin: AngularCompilerStub,
	},
	'terser-webpack-plugin': TerserJsStub,
});

const webpackConfigTypeScript = proxyquire('./webpack.typescript', {
	'@nativescript/webpack': nativeScriptDevWebpack,
	'@nativescript/webpack/nativescript-target': emptyObject,
	'@nativescript/webpack/transformers/ns-transform-native-classes': emptyObject,
	'@nativescript/webpack/utils/tsconfig-utils': {
		getNoEmitOnErrorFromTSConfig: () => {
			return false;
		},
		getCompilerOptionsFromTSConfig: () => {
			return false;
		},
	},
	'terser-webpack-plugin': TerserJsStub,
});

const webpackConfigJavaScript = proxyquire('./webpack.javascript', {
	'@nativescript/webpack': nativeScriptDevWebpack,
	'@nativescript/webpack/nativescript-target': emptyObject,
	'terser-webpack-plugin': TerserJsStub,
});

const webpackConfigVue = proxyquire('./webpack.vue', {
	'@nativescript/webpack': nativeScriptDevWebpack,
	'@nativescript/webpack/nativescript-target': emptyObject,
	'@nativescript/webpack/transformers/ns-transform-native-classes': emptyObject,
	'vue-loader/lib/plugin': EmptyClass,
	'nativescript-vue-template-compiler': emptyObject,
	'terser-webpack-plugin': TerserJsStub,
});

describe('webpack.config.js', () => {
	const getInput = (options: { platform: string; hmr?: boolean; externals?: string[]; sourceMap?: boolean; hiddenSourceMap?: boolean | string }) => {
		const input: any = Object.assign({}, options);
		input[options.platform] = true;
		return input;
	};

	[
		{ type: 'javascript', webpackConfig: webpackConfigJavaScript },
		{ type: 'typescript', webpackConfig: webpackConfigTypeScript },
		{ type: 'angular', webpackConfig: webpackConfigAngular },
		{ type: 'vue', webpackConfig: webpackConfigVue },
	].forEach((element) => {
		const { type, webpackConfig } = element;
		['android', 'ios'].forEach((platform) => {
			describe(`verify externals for webpack.${type}.js (${platform})`, () => {
				afterEach(() => {
					nativeScriptDevWebpack.getConvertedExternals = nsWebpackIndex.getConvertedExternals;
				});

				it('returns empty array when externals are not passed', () => {
					const input = getInput({ platform });
					const config = webpackConfig(input);
					expect(config.externals).toEqual([]);
				});

				it('calls getConvertedExternals to convert externals', () => {
					let isCalled = false;
					nativeScriptDevWebpack.getConvertedExternals = () => {
						isCalled = true;
						return [];
					};

					const input = getInput({ platform, externals: ['nativescript-vue'] });
					webpackConfig(input);
					expect(isCalled).toBe(true, 'Webpack.config.js must use the getConvertedExternals method');
				});

				// if (platform === "ios") {
				//     it('has inspector_modules entry when tns-core-modules are not externals', () => {
				//         const input = getInput({ platform, externals: ['nativescript-vue'] });
				//         const config = webpackConfig(input);
				//         expect(config.entry["tns_modules/@nativescript/core/inspector_modules"]).toEqual("inspector_modules");
				//     });

				//     it('does not have inspector_modules entry when @nativescript/core are externals', () => {
				//         const input = getInput({ platform, externals: ['@nativescript'] });
				//         const config = webpackConfig(input);
				//         expect(config.entry["tns_modules/@nativescript/core/inspector_modules"]).toBeUndefined();
				//     });
				// }

				[
					{
						input: ['nativescript-vue'],
						expectedOutput: [/^nativescript-vue((\/.*)|$)/],
					},
					{
						input: ['nativescript-vue', 'nativescript-angular'],
						expectedOutput: [/^nativescript-vue((\/.*)|$)/, /^nativescript-angular((\/.*)|$)/],
					},
				].forEach((testCase) => {
					const input = getInput({ platform, externals: testCase.input });

					it(`are correct regular expressions, for input ${testCase.input}`, () => {
						const config = webpackConfig(input);
						expect(config.externals).toEqual(testCase.expectedOutput);
					});
				});
			});

			if (type === 'angular') {
				describe(`angular transformers for webpack.${type}.js (${platform})`, () => {
					beforeEach(() => {
						angularCompilerOptions = null;
					});

					it('should contain only NativeClass transformer by default', () => {
						const input = getInput({ platform });

						webpackConfig(input);

						expect(angularCompilerOptions).toBeDefined();
						expect(angularCompilerOptions.platformTransformers).toBeDefined();
						expect(angularCompilerOptions.platformTransformers.length).toEqual(1);
						expect(angularCompilerOptions.platformTransformers[0]).toEqual(FakeNativeClassTransformerFlag);
					});

					it('should contain the HMR transformer when the HMR flag is passed', () => {
						const input = getInput({ platform, hmr: true });

						webpackConfig(input);

						expect(angularCompilerOptions).toBeDefined();
						expect(angularCompilerOptions.platformTransformers).toBeDefined();
						expect(angularCompilerOptions.platformTransformers.length).toEqual(2);
						expect(angularCompilerOptions.platformTransformers[1]).toEqual(FakeHmrTransformerFlag);
					});
				});
			}

			describe(`source map for webpack.${type}.js (${platform})`, () => {
				beforeEach(() => {
					terserOptions = null;
				});

				it('should not set source maps without the flag', () => {
					const input = getInput({ platform, sourceMap: false });

					const config = webpackConfig(input);

					expect(config.devtool).toEqual('none');
					expect(terserOptions.sourceMap).toBeFalsy();
					expect(terserOptions.terserOptions.output.semicolons).toBeTruthy();
					expect(config.output.sourceMapFilename).toEqual('[file].map');
				});

				it('should set inline-source-map devtool', () => {
					const input = getInput({ platform, sourceMap: true });

					const config = webpackConfig(input);

					expect(config.devtool).toEqual('inline-source-map');
					expect(terserOptions.sourceMap).toBeTruthy();
					expect(terserOptions.terserOptions.output.semicolons).toBeFalsy();
					expect(config.output.sourceMapFilename).toEqual('[file].map');
				});
			});

			describe(`hidden source map for webpack.${type}.js (${platform})`, () => {
				beforeEach(() => {
					terserOptions = null;
				});

				it('should not set source maps without the flag', () => {
					const input = getInput({ platform, hiddenSourceMap: false });

					const config = webpackConfig(input);

					expect(config.devtool).toEqual('none');
					expect(terserOptions.sourceMap).toBeFalsy();
					expect(terserOptions.terserOptions.output.semicolons).toBeTruthy();
					expect(config.output.sourceMapFilename).toEqual('[file].map');
				});

				it('should set hidden-source-map devtool and the default sourceMap folder', () => {
					const input = getInput({ platform, hiddenSourceMap: true });

					const config = webpackConfig(input);

					expect(config.devtool).toEqual('hidden-source-map');
					expect(terserOptions.sourceMap).toBeTruthy();
					expect(terserOptions.terserOptions.output.semicolons).toBeFalsy();
					expect(config.output.sourceMapFilename).toEqual(join('..', 'sourceMap', '[file].map'));
				});

				it('should override the sourceMap property and the default sourceMap folder', () => {
					const input = getInput({ platform, sourceMap: true, hiddenSourceMap: true });

					const config = webpackConfig(input);

					expect(config.devtool).toEqual('hidden-source-map');
					expect(terserOptions.sourceMap).toBeTruthy();
					expect(terserOptions.terserOptions.output.semicolons).toBeFalsy();
					expect(config.output.sourceMapFilename).toEqual(join('..', 'sourceMap', '[file].map'));
				});

				it('should set hidden-source-map devtool and override the sourceMapFilename', () => {
					const newSourceMapFolder = 'myCoolSourceMapFolder';
					const input = getInput({ platform, sourceMap: true, hiddenSourceMap: newSourceMapFolder });

					const config = webpackConfig(input);

					expect(config.devtool).toEqual('hidden-source-map');
					expect(terserOptions.sourceMap).toBeTruthy();
					expect(terserOptions.terserOptions.output.semicolons).toBeFalsy();
					expect(config.output.sourceMapFilename).toEqual(join('..', newSourceMapFolder, '[file].map'));
				});
			});
		});
	});
});
