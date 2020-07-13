import { tags } from '@angular-devkit/core';
import { createTypescriptContext, transformTypescript } from '@ngtools/webpack/src/transformers/spec_helpers';
import { nsSupportHmrNg, getHmrOptionsCode, getAcceptMainModuleCode, GeneratedDynamicAppOptions } from './ns-support-hmr-ng';
import { AngularCompilerPlugin } from '@ngtools/webpack';

describe('@ngtools/webpack transformers', () => {
	describe('ns-support-hmr-ng', () => {
		const nsFactoryImportName = `__NgCli_bootstrap_2_1`;
		const handleHmrPlatformDynamicImport = `import * as nativescript_angular_platform_Generated from "@nativescript/angular";`;
		const handleHmrPlatformStaticImport = `import * as nativescript_angular_platform_Generated from "@nativescript/angular";`;
		const handleAotPlatformStaticImport = `import * as __NgCli_bootstrap_1_1 from "@nativescript/angular";`;
		const handleAotNgFactoryImport = `import * as ${nsFactoryImportName} from "./test-file.ts.ngfactory";`;
		const handleHmrOptionsDeclaration = `var ${GeneratedDynamicAppOptions} = {};`;
		const nsStaticPlatformCall = `nativescript_angular_platform_Generated.platformNativeScript`;
		const nsDynamicPlatformCall = `nativescript_angular_platform_Generated.platformNativeScriptDynamic`;
		const handleHmrOptionsCode = getHmrOptionsCode('AppModule', './app/app.module');
		const acceptMainModuleCode = getAcceptMainModuleCode('./app/app.module');
		const handleHmrOptionsAotCode = getHmrOptionsCode('AppModuleNgFactory', './test-file.ts.ngfactory');
		const acceptMainModuleAotCode = getAcceptMainModuleCode('./test-file.ts.ngfactory');
		const getAppOptions = (currentAppOptionsString?: string) => {
			return `Object.assign(${currentAppOptionsString || '{}'}, ${GeneratedDynamicAppOptions})`;
		};
		const defaultAppOptions = getAppOptions();
		const testCases = [
			{
				name: 'should not handle HMR when the AppModule import cannot be found',
				rawFile: `
                import { platformNativeScript } from "@nativescript/angular";
                platformNativeScript().bootstrapModule(SyntaxErrorModule);
            `,
				transformedFile: `
                import { platformNativeScript } from "@nativescript/angular";
                platformNativeScript().bootstrapModule(SyntaxErrorModule);
            `,
				transformedFileWithAot: `
                import { platformNativeScript } from "@nativescript/angular";
                platformNativeScript().bootstrapModule(SyntaxErrorModule);
            `,
			},
		];
		testCases.forEach((testCase: any) => {
			it(`${testCase.name}`, async () => {
				const testFile = '/project/src/test-file.ts';
				const input = tags.stripIndent`${testCase.rawFile}`;
				const output = tags.stripIndent`${testCase.transformedFile}`;
				const { program, compilerHost } = createTypescriptContext(input);
				const ngCompiler = <AngularCompilerPlugin>{
					typeChecker: program.getTypeChecker(),
					entryModule: {
						path: testFile,
						className: 'AppModule',
					},
				};
				const transformer = nsSupportHmrNg(() => ngCompiler, testFile);
				const result = transformTypescript(undefined, [transformer], program, compilerHost);

				expect(tags.oneLine`${result}`).toEqual(tags.oneLine`${output}`);
			});

			it(`${testCase.name} (in combination with AOT transformer)`, async () => {
				const projectDir = '/project/src/';
				const testFile = `${projectDir}test-file.ts`;
				const input = tags.stripIndent`${testCase.rawFile}`;
				const output = tags.stripIndent`${testCase.transformedFileWithAot}`;
				const { program, compilerHost } = createTypescriptContext(input);
				const ngCompiler = <AngularCompilerPlugin>{
					typeChecker: program.getTypeChecker(),
					entryModule: {
						path: testFile,
						className: testCase.customAppModuleName || 'AppModule',
					},
				};

				const hmrTransformer = nsSupportHmrNg(() => ngCompiler, testFile);
				const result = transformTypescript(undefined, [hmrTransformer], program, compilerHost);

				expect(tags.oneLine`${result}`).toEqual(tags.oneLine`${output}`);
			});
		});
	});
});
