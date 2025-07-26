import { knownFolders, path } from '../../file-system';

export function getFilenameFromUrl(url: string) {
	const slashPos = url.lastIndexOf('/') + 1;
	const questionMarkPos = url.lastIndexOf('?');

	let actualFileName: string;
	if (questionMarkPos !== -1) {
		actualFileName = url.substring(slashPos, questionMarkPos);
	} else {
		actualFileName = url.substring(slashPos);
	}

	const result = path.join(knownFolders.documents().path, actualFileName);

	return result;
}
