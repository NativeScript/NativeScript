import path from 'node:path';
import { pathToFileURL } from 'node:url';

function looksLikeWindowsPath(value: string): boolean {
	return /^[A-Za-z]:[\\/]/.test(value) || value.startsWith('\\\\');
}

export function toStaticImportSpecifier(projectRoot: string, filePath: string): string {
	const useWindowsPath = looksLikeWindowsPath(projectRoot) || looksLikeWindowsPath(filePath);
	const pathApi = useWindowsPath ? path.win32 : path.posix;

	try {
		const relativePath = pathApi.relative(projectRoot, filePath);
		if (relativePath && !pathApi.isAbsolute(relativePath) && !relativePath.startsWith('..')) {
			return ('/' + relativePath.replace(/\\/g, '/')).replace(/\/+/g, '/');
		}
	} catch {}

	return pathToFileURL(filePath, { windows: useWindowsPath }).toString();
}
