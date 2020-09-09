import * as ts from 'typescript';

export function getCompilerOptionsFromTSConfig(tsConfigPath: string): ts.CompilerOptions {
	const parseConfigFileHost: ts.ParseConfigFileHost = {
		getCurrentDirectory: ts.sys.getCurrentDirectory,
		useCaseSensitiveFileNames: false,
		readDirectory: ts.sys.readDirectory,
		fileExists: ts.sys.fileExists,
		readFile: ts.sys.readFile,
		onUnRecoverableConfigFileDiagnostic: undefined,
	};

	const tsConfig = ts.getParsedCommandLineOfConfigFile(tsConfigPath, ts.getDefaultCompilerOptions(), parseConfigFileHost);

	const compilerOptions: ts.CompilerOptions = tsConfig.options || ts.getDefaultCompilerOptions();

	return compilerOptions;
}

export function getNoEmitOnErrorFromTSConfig(tsConfigPath: string): boolean {
	const compilerOptions = getCompilerOptionsFromTSConfig(tsConfigPath);
	const noEmitOnError = !!compilerOptions.noEmitOnError;

	return noEmitOnError;
}
