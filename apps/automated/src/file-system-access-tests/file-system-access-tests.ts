import * as TKUnit from '../tk-unit';
import { knownFolders, path, File, Folder } from '@nativescript/core';

export var test_UTF8_BOM_is_not_returned = function () {
	const folder1 = path.join(knownFolders.documents().path, 'file-system-access-tests');
	if (!Folder.exists(folder1)) {
		Folder.fromPath(folder1);
	}
	var filePath = path.join(folder1, 'xml.expected');
	var file = File.fromPath(filePath);

	var onError = function (error) {
		TKUnit.assert(false, 'Could not read file xml.expected');
	};

	var text = file.readTextSync(onError);
	if (text) {
		var actualCharCode = text.charCodeAt(0);
		var expectedCharCode = '{'.charCodeAt(0);
		TKUnit.assert(actualCharCode === expectedCharCode, 'Actual character code: ' + actualCharCode + '; Expected character code: ' + expectedCharCode);
	}
};

export var test_file_exists_on_folder = function () {
	const folder1 = path.join(knownFolders.documents().path, 'file-system-access-tests');
	if (!Folder.exists(folder1)) {
		Folder.fromPath(folder1);
	}
	var filePath = path.join(folder1, 'folder');
	if (!Folder.exists(filePath)) {
		Folder.fromPath(filePath);
	}

	if (!Folder.exists(filePath)) {
		TKUnit.assert(false, `Could not read path ${filePath}`);

		return;
	}

	TKUnit.assertTrue(File.exists(filePath), 'File.exists() returned false for folder!');
};

export var test_leading_slash_is_not_returned = function () {
	var parts = ['app', 'tns_modules', 'fileName'];
	var expected = parts.join('/');
	var filePath = path.join(...parts);

	TKUnit.assertEqual(filePath, expected, 'Leading slash should not be part of the path');
};
