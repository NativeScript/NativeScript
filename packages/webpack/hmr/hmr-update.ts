import * as hot from '../helpers/hot';

declare const __webpack_require__: any;

export function hmrUpdate() {
	const coreFile = require('@nativescript/core');
	const currentAppFolder = coreFile.knownFolders.currentApp();
	const latestHash = __webpack_require__['h']();
	return hot(latestHash, (filename) => {
		const fullFilePath = coreFile.path.join(currentAppFolder.path, filename);
		return coreFile.File.exists(fullFilePath) ? currentAppFolder.getFile(filename) : null;
	});
}
