/**
 * Helps sanitize a module name if it is prefixed with '~/', '~' or '/'
 * @param moduleName the name
 * @param removeExtension whether to remove extension
 */
export function sanitizeModuleName(moduleName: string, removeExtension: boolean = true): string {
	moduleName = moduleName.trim();

	if (moduleName.startsWith('~/')) {
		moduleName = moduleName.substring(2);
	} else if (moduleName.startsWith('~')) {
		moduleName = moduleName.substring(1);
	} else if (moduleName.startsWith('/')) {
		moduleName = moduleName.substring(1);
	}

	if (removeExtension) {
		const extToRemove = ['js', 'ts', 'xml', 'html', 'css', 'scss'];
		const extensionRegEx = new RegExp(`(.*)\\.(?:${extToRemove.join('|')})`, 'i');
		moduleName = moduleName.replace(extensionRegEx, '$1');
	}

	return moduleName;
}
