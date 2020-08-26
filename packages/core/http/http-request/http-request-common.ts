import * as fsModule from '../../file-system';

export function getFilenameFromUrl(url: string) {
	const fs: typeof fsModule = require('../../file-system');
	const slashPos = url.lastIndexOf('/') + 1;
	const questionMarkPos = url.lastIndexOf('?');

	let actualFileName: string;
	if (questionMarkPos !== -1) {
		actualFileName = url.substring(slashPos, questionMarkPos);
	} else {
		actualFileName = url.substring(slashPos);
	}

	const result = fs.path.join(fs.knownFolders.documents().path, actualFileName);

	return result;
}
