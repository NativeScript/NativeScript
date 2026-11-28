import * as TKUnit from '../tk-unit';
import { knownFolders, path, File, Folder } from '@nativescript/core';

export const test_UTF8_BOM_is_not_returned = function () {
	const folder1 = path.join(knownFolders.documents().path, 'file-system-access-tests');
	if (!Folder.exists(folder1)) {
		Folder.fromPath(folder1);
	}
	const filePath = path.join(folder1, 'xml.expected');
	const file = File.fromPath(filePath);

	const onError = function (error) {
		TKUnit.assert(false, 'Could not read file xml.expected');
	};

	const text = file.readTextSync(onError);
	if (text) {
		const actualCharCode = text.charCodeAt(0);
		const expectedCharCode = '{'.charCodeAt(0);
		TKUnit.assert(actualCharCode === expectedCharCode, 'Actual character code: ' + actualCharCode + '; Expected character code: ' + expectedCharCode);
	}
};

export const test_file_exists_on_folder = function () {
	const folder1 = path.join(knownFolders.documents().path, 'file-system-access-tests');
	if (!Folder.exists(folder1)) {
		Folder.fromPath(folder1);
	}
	const filePath = path.join(folder1, 'folder');
	if (!Folder.exists(filePath)) {
		Folder.fromPath(filePath);
	}

	if (!Folder.exists(filePath)) {
		TKUnit.assert(false, `Could not read path ${filePath}`);

		return;
	}

	TKUnit.assertTrue(File.exists(filePath), 'File.exists() returned false for folder!');
};

export const test_leading_slash_is_not_returned = function () {
	const parts = ['app', 'tns_modules', 'fileName'];
	const expected = parts.join('/');
	const filePath = path.join(...parts);

	TKUnit.assertEqual(filePath, expected, 'Leading slash should not be part of the path');
};
