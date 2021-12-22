import { readConfigFile, parseJsonConfigFileContent, sys } from 'typescript';
import { dirname } from 'path';

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
