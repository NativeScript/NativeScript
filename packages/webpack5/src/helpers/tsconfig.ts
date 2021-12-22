import { dirname } from 'path';
import { readConfigFile, parseJsonConfigFileContent, sys } from 'typescript';

export function readTsConfig(path: string) {
	const f = readConfigFile(path, sys.readFile);

	const parsed = parseJsonConfigFileContent(
		f.config,
		{
			fileExists: sys.fileExists,
			readFile: sys.readFile,
			readDirectory: sys.readDirectory,
			useCaseSensitiveFileNames: true,
		},
		dirname(path)
	);

	return parsed;
}
