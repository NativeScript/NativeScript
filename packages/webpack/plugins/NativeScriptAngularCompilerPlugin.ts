import { parse, join } from 'path';
import { AngularCompilerPlugin } from '@ngtools/webpack';

export function getAngularCompilerPlugin(platform: string): any {
	class NativeScriptAngularCompilerPlugin extends AngularCompilerPlugin {
		// This is the bridge between the @ngtols/webpack loader and the AngularCompilerPlugin plugin itself:
		// https://github.com/angular/angular-cli/blob/bf52b26219ffc16bed2dd55716e21773b415fd2a/packages/ngtools/webpack/src/loader.ts#L49
		// The problem is that the loader does not call the `hostReplacementPaths` method when asking for the compiledFile.
		// By overriding this method, we work around this issue and support platform specific files from the loader
		// that are not compiled by the AngularCompilerPlugin plugin. e.g. main.ts is the webpack entry point and
		// it's loaded by the @ngtools/webpack loader but its not compiled by the plugin because the TypeScript Compiler
		// knowns only about main.android.ts and main.ios.ts (main.ts is not imported/required anywhere in the app).
		getCompiledFile(file) {
			try {
				if (platform) {
					const parsed = parse(file);
					const platformFile = join(parsed.dir, `${parsed.name}.${platform}${parsed.ext}`);
					const result = super.getCompiledFile(platformFile);
					// In case there's some issue with the generation, getCompilePath may fail or
					// produce a result with empty outputText and errorDependencies array populated with files.
					if (result && result.outputText) {
						return result;
					}
				}
			} catch (e) {}

			return super.getCompiledFile(file);
		}
	}

	return NativeScriptAngularCompilerPlugin;
}
