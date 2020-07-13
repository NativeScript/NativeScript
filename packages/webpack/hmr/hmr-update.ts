import * as hot from '../hot';
import { knownFolders, path, File } from '@nativescript/core';

declare const __webpack_require__: any;

export function hmrUpdate() {
	const currentAppFolder = knownFolders.currentApp();
	const latestHash = __webpack_require__['h']();
	return hot(latestHash, (filename) => {
		const fullFilePath = path.join(currentAppFolder.path, filename);
		return File.exists(fullFilePath) ? currentAppFolder.getFile(filename) : null;
	});
}
