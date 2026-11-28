/* tslint:disable:no-unused-variable */
// >> file-system-require
import * as fs from '@nativescript/core/file-system';
// << file-system-require

import * as TKUnit from '../tk-unit';
import { Application, isIOS, Device, platformNames, isAndroid } from '@nativescript/core';

export const testPathNormalize = function () {
	// >> file-system-normalize
	const documents = fs.knownFolders.documents();
	const testPath = '///test.txt';
	// Get a normalized path such as <folder.path>/test.txt from <folder.path>///test.txt
	const normalizedPath = fs.path.normalize(documents.path + testPath);
	// >> (hide)
	const expected = documents.path + '/test.txt';
	TKUnit.assert(normalizedPath === expected);
	// << (hide)
	// << file-system-normalize
};

export const testPathJoin = function () {
	// >> file-system-multiple-args
	const documents = fs.knownFolders.documents();
	// Generate a path like <documents.path>/myFiles/test.txt
	const path = fs.path.join(documents.path, 'myFiles', 'test.txt');
	// >> (hide)
	const expected = documents.path + '/myFiles/test.txt';
	TKUnit.assert(path === expected);
	// << (hide)
	// << file-system-multiple-args
};

export const testPathSeparator = function () {
	// >> file-system-separator
	// An OS dependent path separator, "\" or "/".
	const separator = fs.path.separator;
	// >> (hide)
	const expected = '/';
	TKUnit.assert(separator === expected);
	// << (hide)
	// << file-system-separator
};

export const testFileFromPath = function () {
	// >> file-system-create
	const documents = fs.knownFolders.documents();
	const path = fs.path.join(documents.path, 'FileFromPath.txt');
	const file = fs.File.fromPath(path);

	// Writing text to the file.
	file.writeText('Something').then(
		function () {
			// Succeeded writing to the file.
			// >> (hide)
			file.readText().then(
				function (content) {
					TKUnit.assert(content === 'Something', 'File read/write not working.');
					file.remove();
				},
				function (error) {
					TKUnit.assert(false, 'Failed to read/write text');
					//console.dir(error);
				},
			);
			// << (hide)
		},
		function (error) {
			// Failed to write to the file.
			// >> (hide)
			TKUnit.assert(false, 'Failed to read/write text');
			//console.dir(error);
			// << (hide)
		},
	);
	// << file-system-create
};

export const testFolderFromPath = function () {
	// >> file-system-create-folder
	const path = fs.path.join(fs.knownFolders.documents().path, 'music');
	const folder = fs.Folder.fromPath(path);
	// >> (hide)
	TKUnit.assert(<any>folder, 'Folder.getFolder API not working.');
	TKUnit.assert(fs.Folder.exists(folder.path), 'Folder.getFolder API not working.');
	folder.remove();
	// << (hide)
	// << file-system-create-folder
};

export const testFileWrite = function () {
	// >> file-system-write-string
	const documents = fs.knownFolders.documents();
	const file = documents.getFile('Test_Write.txt');

	// Writing text to the file.
	file.writeText('Something').then(
		function () {
			// Succeeded writing to the file.
			// >> (hide)
			file.readText().then(
				function (content) {
					TKUnit.assert(content === 'Something', 'File read/write not working.');
					file.remove();
				},
				function (error) {
					TKUnit.assert(false, 'Failed to read/write text');
					//console.dir(error);
				},
			);
			// << (hide)
		},
		function (error) {
			// Failed to write to the file.
			// >> (hide)
			TKUnit.assert(false, 'Failed to read/write text');
			//console.dir(error);
			// << (hide)
		},
	);
	// << file-system-write-string
};

export const testGetFile = function () {
	// >> file-system-create-file
	const documents = fs.knownFolders.documents();
	const file = documents.getFile('NewFileToCreate.txt');
	// >> (hide)
	TKUnit.assert(<any>file, 'File.getFile API not working.');
	TKUnit.assert(fs.File.exists(file.path), 'File.getFile API not working.');
	file.remove();
	// << (hide)
	// << file-system-create-file
};

export const testGetFolder = function () {
	// >> file-system-get-folder
	const documents = fs.knownFolders.documents();
	const folder = documents.getFolder('NewFolderToCreate');
	// >> (hide)
	TKUnit.assert(<any>folder, 'Folder.getFolder API not working.');
	TKUnit.assert(fs.Folder.exists(folder.path), 'Folder.getFolder API not working.');
	folder.remove();
	// << (hide)
	// << file-system-get-folder
};

export const testFileRead = function () {
	// >> file-system-example-text
	const documents = fs.knownFolders.documents();
	const myFile = documents.getFile('Test_Write.txt');

	let written: boolean;
	// Writing text to the file.
	myFile.writeText('Something').then(
		function () {
			// Succeeded writing to the file.

			// Getting back the contents of the file.
			myFile.readText().then(
				function (content) {
					// Successfully read the file's content.
					// >> (hide)
					written = content === 'Something';
					TKUnit.assert(written, 'File read/write not working.');
					myFile.remove();
					// << (hide)
				},
				function (error) {
					// Failed to read from the file.
					// >> (hide)
					TKUnit.assert(false, 'Failed to read/write text');
					//console.dir(error);
					// << (hide)
				},
			);
		},
		function (error) {
			// Failed to write to the file.
			// >> (hide)
			TKUnit.assert(false, 'Failed to read/write text');
			//console.dir(error);
			// << (hide)
		},
	);
	// << file-system-example-text
};

export function testFileReadWriteBinary() {
	// >> file-system-read-binary
	const fileName = 'logo.png';
	let error;
	const appFolder = fs.knownFolders.currentApp().path;
	const sourceFile = fs.File.fromPath(appFolder + '/assets/' + fileName);
	const destinationFile = fs.knownFolders.documents().getFile(fileName);

	const source = sourceFile.readSync((e) => {
		error = e;
	});

	destinationFile.writeSync(source, (e) => {
		error = e;
	});

	// >> (hide)
	const destination = destinationFile.readSync((e) => {
		error = e;
	});
	TKUnit.assertNull(error);
	if (__APPLE__) {
		TKUnit.assertTrue(source.isEqualToData(destination));
	} else {
		TKUnit.assertEqual(new java.io.File(sourceFile.path).length(), new java.io.File(destinationFile.path).length());
	}

	destinationFile.removeSync();
	// << (hide)
	// << file-system-read-binary
}

export function testFileReadWriteBinaryAsync() {
	// >> file-system-read-binary-async
	const fileName = 'logo.png';
	const appFolder = fs.knownFolders.currentApp().path;
	const sourceFile = fs.File.fromPath(appFolder + '/assets/' + fileName);
	const destinationFile = fs.knownFolders.documents().getFile(fileName);

	// Read the file
	sourceFile.read().then(
		function (source) {
			// Succeeded in reading the file
			// >> (hide)
			destinationFile.write(source).then(
				function () {
					// Succeded in writing the file
					destinationFile.read().then(
						function (destination) {
							if (__APPLE__) {
								TKUnit.assertTrue(source.isEqualToData(destination));
							} else {
								TKUnit.assertEqual(new java.io.File(sourceFile.path).length(), new java.io.File(destinationFile.path).length());
							}

							destinationFile.removeSync();
						},
						function (error) {
							TKUnit.assert(false, 'Failed to read destination binary async');
						},
					);
				},
				function (error) {
					// Failed to write the file.
					TKUnit.assert(false, 'Failed to write binary async');
				},
			);
			// << (hide)
		},
		function (error) {
			// Failed to read the file.
			// >> (hide)
			TKUnit.assert(false, 'Failed to read binary async');
			// << (hide)
		},
	);
	// << file-system-read-binary-async
}

export const testGetKnownFolders = function () {
	// >> file-system-known-folders
	// Getting the application's 'documents' folder.
	const documents = fs.knownFolders.documents();
	// >> (hide)
	TKUnit.assert(<any>documents, 'Could not retrieve the Documents known folder.');
	TKUnit.assert(documents.isKnown, 'The Documents folder should have its isKnown property set to true.');
	// << (hide)
	// Getting the application's 'temp' folder.
	const temp = fs.knownFolders.temp();
	// >> (hide)
	TKUnit.assert(<any>temp, 'Could not retrieve the Temporary known folder.');
	TKUnit.assert(temp.isKnown, 'The Temporary folder should have its isKnown property set to true.');
	// << (hide)
	// << file-system-known-folders
};

function _testIOSSpecificKnownFolder(knownFolderName: string) {
	let knownFolder: fs.Folder;
	let createdFile: fs.File;
	const testFunc = function testFunc() {
		knownFolder = fs.knownFolders.ios[knownFolderName]();
		if (knownFolder) {
			createdFile = knownFolder.getFile('createdFile');
			createdFile.writeTextSync('some text');
		}
	};
	if (isIOS) {
		testFunc();
		if (knownFolder) {
			TKUnit.assertTrue(knownFolder.isKnown, `The ${knownFolderName} folder should have its "isKnown" property set to true.`);
			TKUnit.assertNotNull(createdFile, `Could not create a new file in the ${knownFolderName} known folder.`);
			TKUnit.assertTrue(fs.File.exists(createdFile.path), `Could not create a new file in the ${knownFolderName} known folder.`);
			TKUnit.assertEqual(createdFile.readTextSync(), 'some text', `The contents of the new file created in the ${knownFolderName} known folder are not as expected.`);
		}
	} else {
		TKUnit.assertThrows(testFunc, `Trying to retrieve the ${knownFolderName} known folder on a platform different from iOS should throw!`, `The "${knownFolderName}" known folder is available on iOS only!`);
	}
}

export const testIOSSpecificKnownFolders = function () {
	if (__IOS__) {
		_testIOSSpecificKnownFolder('library');
		_testIOSSpecificKnownFolder('developer');
		_testIOSSpecificKnownFolder('desktop');
		_testIOSSpecificKnownFolder('downloads');
		_testIOSSpecificKnownFolder('movies');
		_testIOSSpecificKnownFolder('music');
		_testIOSSpecificKnownFolder('pictures');
		_testIOSSpecificKnownFolder('sharedPublic');
	}
};

export const testGetEntities = function () {
	// >> file-system-folders-content
	const documents = fs.knownFolders.documents();
	// >> (hide)
	const file = documents.getFile('Test.txt');
	const file1 = documents.getFile('Test1.txt');

	let fileFound, file1Found;

	// IMPORTANT: console.log is mocked to make the snippet pretty.
	const globalConsole = console;
	// eslint-disable-next-line no-var -- hoisting makes globalConsole read this (undefined) instead of throwing in the TDZ
	var console = {
		log: function (file) {
			if (file === 'Test.txt') {
				fileFound = true;
			} else if (file === 'Test1.txt') {
				file1Found = true;
			}
		},
	};

	// << (hide)
	documents.getEntities().then(
		function (entities) {
			// entities is array with the document's files and folders.
			entities.forEach(function (entity) {
				console.log(entity.name);
			});
			// >> (hide)

			TKUnit.assert(fileFound, 'Failed to enumerate Test.txt');
			TKUnit.assert(file1Found, 'Failed to enumerate Test1.txt');

			file.remove();
			file1.remove();
			// << (hide)
		},
		function (error) {
			// Failed to obtain folder's contents.
			// globalConsole.error(error.message);
		},
	);
	// << file-system-folders-content
};

export const testEnumEntities = function () {
	// >> file-system-enum-content
	const documents = fs.knownFolders.documents();
	// >> (hide)
	const file = documents.getFile('Test.txt');
	const file1 = documents.getFile('Test1.txt');
	const testFolder = documents.getFolder('testFolder');
	const nestedFile = testFolder.getFile('Nested.txt');
	let fileFound = false;
	let file1Found = false;
	let testFolderFound = false;
	let nestedFileFound = false;
	const console = {
		log: function (file) {
			if (file === 'Test.txt') {
				fileFound = true;
			} else if (file === 'Test1.txt') {
				file1Found = true;
			} else if (file === 'testFolder') {
				testFolderFound = true;
			} else if (file === 'Nested.txt') {
				nestedFileFound = true;
			}
		},
	};
	// << (hide)
	documents.eachEntity(function (entity) {
		console.log(entity.name);

		// Return true to continue, or return false to stop the iteration.
		return true;
	});
	// >> (hide)
	TKUnit.assert(fileFound, 'Failed to enumerate Test.txt');
	TKUnit.assert(file1Found, 'Failed to enumerate Test1.txt');
	TKUnit.assert(testFolderFound, 'Failed to enumerate testFolder');
	TKUnit.assert(!nestedFileFound, 'eachEntity should not enumerate nested files');

	file.remove();
	file1.remove();
	nestedFile.remove();
	testFolder.remove();
	// << (hide)
	// << file-system-enum-content
};

export const testGetParent = function () {
	// >> file-system-parent
	const documents = fs.knownFolders.documents();
	const file = documents.getFile('Test.txt');
	// >> (hide)
	TKUnit.assert(<any>file, 'Failed to create file in the Documents folder.');
	// << (hide)
	// The parent folder of the file would be the documents folder.
	const parent = file.parent;
	// >> (hide)
	TKUnit.assert(documents === parent, 'The parent folder should be the Documents folder.');
	file.remove();
	// << (hide)
	// << file-system-parent
};

export const testFileNameExtension = function () {
	// >> file-system-extension
	const documents = fs.knownFolders.documents();
	const file = documents.getFile('Test.txt');
	// Getting the file name "Test.txt".
	const fileName = file.name;
	// Getting the file extension "txt".
	const fileExtension = file.extension;
	// >> (hide)
	TKUnit.assert(fileName === 'Test.txt', 'Wrong file name.');
	TKUnit.assert(fileExtension === 'txt', 'Wrong extension.');
	file.remove();
	// << (hide)
	// << file-system-extension
};

export const testFileExists = function () {
	// >> file-system-fileexists
	const documents = fs.knownFolders.documents();
	const filePath = fs.path.join(documents.path, 'Test.txt');
	let exists = fs.File.exists(filePath);
	// >> (hide)
	TKUnit.assert(!exists, 'File.exists API not working.');
	const file = documents.getFile('Test.txt');
	exists = fs.File.exists(file.path);
	TKUnit.assert(exists, 'File.exists API not working.');
	file.remove();
	// << (hide)
	// << file-system-fileexists
};

export const testFolderExists = function () {
	// >> file-system-folderexists
	const documents = fs.knownFolders.documents();
	let exists = fs.Folder.exists(documents.path);
	// >> (hide)
	TKUnit.assert(exists, 'Folder.exists API not working.');
	exists = fs.Folder.exists(documents.path + '_');
	TKUnit.assert(!exists, 'Folder.exists API not working.');
	// << (hide)
	// << file-system-folderexists
};

export const testContainsFile = function () {
	const folder = fs.knownFolders.documents();
	const file = folder.getFile('Test.txt');

	let contains = folder.contains('Test.txt');
	TKUnit.assert(contains, 'Folder.contains API not working.');
	contains = folder.contains('Test_xxx.txt');
	TKUnit.assert(!contains, 'Folder.contains API not working.');

	file.remove();
};

export const testFileRename = function () {
	// >> file-system-renaming
	const documents = fs.knownFolders.documents();
	const file = documents.getFile('Test.txt');

	file.rename('Test_renamed.txt').then(
		function (result) {
			// Successfully Renamed.
			// >> (hide)
			TKUnit.assert(file.name === 'Test_renamed.txt', 'File.rename API not working.');
			file.remove();
			documents.getFile('Test.txt').remove();
			// << (hide)
		},
		function (error) {
			// Failed to rename the file.
			// >> (hide)
			TKUnit.assert(false, 'Failed to rename file');
			// << (hide)
		},
	);
	// << file-system-renaming
};

export const testFolderRename = function () {
	// >> file-system-renaming-folder
	const folder = fs.knownFolders.documents();
	const myFolder = folder.getFolder('Test__');

	myFolder.rename('Something').then(
		function (result) {
			// Successfully Renamed.
			// >> (hide)
			TKUnit.assert(myFolder.name === 'Something', 'Folder.rename API not working.');
			myFolder.remove();
			folder.getFolder('Test__').remove();
			// << (hide)
		},
		function (error) {
			// Failed to rename the folder.
			// >> (hide)
			TKUnit.assert(false, 'Folder.rename API not working.');
			// << (hide)
		},
	);
	// << file-system-renaming-folder
};

export const testFileRemove = function () {
	// >> file-system-remove-file
	const documents = fs.knownFolders.documents();
	const file = documents.getFile('AFileToRemove.txt');
	file.remove().then(
		function (result) {
			// Success removing the file.
			// >> (hide)
			TKUnit.assert(!fs.File.exists(file.path));
			// << (hide)
		},
		function (error) {
			// Failed to remove the file.
			// >> (hide)
			TKUnit.assert(false, 'File.remove API not working.');
			// << (hide)
		},
	);
	// << file-system-remove-file
};

export const testFolderRemove = function () {
	// >> file-system-remove-folder
	const documents = fs.knownFolders.documents();
	const file = documents.getFolder('AFolderToRemove');
	// Remove a folder and recursively its content.
	file.remove().then(
		function (result) {
			// Success removing the folder.
			// >> (hide)
			TKUnit.assert(!fs.File.exists(file.path));
			// << (hide)
		},
		function (error) {
			// Failed to remove the folder.
			// >> (hide)
			TKUnit.assert(false, 'File.remove API not working.');
			// << (hide)
		},
	);
	// << file-system-remove-folder
};

export const testFolderClear = function () {
	// >> file-system-clear-folder
	const documents = fs.knownFolders.documents();
	const folder = documents.getFolder('testFolderEmpty');
	// >> (hide)
	folder.getFile('Test1.txt');
	folder.getFile('Test2.txt');
	const subfolder = folder.getFolder('subfolder');
	let emptied;
	// << (hide)
	folder.clear().then(
		function () {
			// Successfully cleared the folder.
			// >> (hide)
			emptied = true;
			// << (hide)
		},
		function (error) {
			// Failed to clear the folder.
			// >> (hide)
			TKUnit.assert(false, error.message);
			// << (hide)
		},
	);
	// >> (hide)
	folder.getEntities().then(function (entities) {
		TKUnit.assertEqual(entities.length, 0, `${entities.length} entities left after clearing a folder.`);
		folder.remove();
	});
	// << (hide)
	// << file-system-clear-folder
};

// misc
export const testKnownFolderRename = function () {
	// You can rename known folders in android - so skip this test.
	if (!Application.android) {
		const folder = fs.knownFolders.documents();
		folder.rename('Something').then(
			function (result) {
				TKUnit.assert(false, 'Known folders should not be renamed.');
			},
			function (error) {
				TKUnit.assert(true);
			},
		);
	}
};

export function testKnownFolderRemove(done) {
	let result;

	const knownFolder = fs.knownFolders.temp();

	knownFolder.remove().then(
		function () {
			done(new Error('Remove known folder should resolve as error.'));
		},
		function (error) {
			done(null);
		},
	);
}

export function test_FSEntity_Properties() {
	const documents = fs.knownFolders.documents();
	const file = documents.getFile('Test_File.txt');

	TKUnit.assert(file.extension === 'txt', 'FileEntity.extension not working.');
	TKUnit.assert(file.isLocked === false, 'FileEntity.isLocked not working.');
	TKUnit.assert(file.lastModified instanceof Date, 'FileEntity.lastModified not working.');
	TKUnit.assert(file.size === 0, 'FileEntity.size not working.');
	TKUnit.assert(file.name === 'Test_File.txt', 'FileEntity.name not working.');
	TKUnit.assert(file.parent === documents, 'FileEntity.parent not working.');

	file.remove();
}

export function test_FileSize(done) {
	const file = fs.knownFolders.documents().getFile('Test_File_Size.txt');
	file
		.writeText('Hello World!')
		.then(() => {
			TKUnit.assert(file.size === 'Hello World!'.length);

			return file.remove();
		})
		.then(() => done())
		.catch(done);
}

export function test_UnlockAfterWrite(done) {
	const file = fs.knownFolders.documents().getFile('Test_File_Lock.txt');
	file
		.writeText('Hello World!')
		.then(() => {
			return file.readText();
		})
		.then((value) => {
			TKUnit.assert(value === 'Hello World!');

			return file.remove();
		})
		.then(() => done())
		.catch(done);
}

export function test_CreateParentOnNewFile(done) {
	const documentsFolderName = fs.knownFolders.documents().path;
	const tempFileName = fs.path.join(documentsFolderName, 'folder1', 'folder2', 'Test_File_Create_Parent.txt');
	const file = fs.File.fromPath(tempFileName);
	file
		.writeText('Hello World!')
		.then(() => {
			return fs.knownFolders.documents().getFolder('folder1').remove();
		})
		.then(() => done())
		.catch(done);
}

export function test_FolderClear_RemovesEmptySubfolders(done) {
	const documents = fs.knownFolders.documents();
	const rootFolder = documents.getFolder('rootFolder');
	const emptySubfolder = rootFolder.getFolder('emptySubfolder');
	TKUnit.assertTrue(fs.Folder.exists(emptySubfolder.path), 'emptySubfolder should exist before parent folder is cleared.');
	rootFolder
		.clear()
		.then(() => {
			TKUnit.assertFalse(fs.File.exists(emptySubfolder.path), 'emptySubfolder should not exist after parent folder was cleared.');
			rootFolder.remove();
			done();
		})
		.catch(done);
}

export function test_FileCopy(done) {
	const now = Date.now();
	const tempFile = fs.File.fromPath(fs.path.join(fs.knownFolders.temp().path, `${now}.txt`));
	const content = 'Hello World: ' + now;
	tempFile.writeTextSync(content);
	const tempCopy = fs.File.fromPath(fs.path.join(fs.knownFolders.temp().path, `${now}-copy.txt`));
	tempFile
		.copy(tempCopy.path)
		.then(() => {
			TKUnit.assert(tempCopy.size === tempFile.size);
			return tempCopy.readText();
		})
		.then((value) => {
			TKUnit.assert(value === content);

			return Promise.allSettled([tempFile.remove(), tempCopy.remove()]);
		})
		.then(() => done())
		.catch(done);
}

export function testAndroidCreate() {
	const testFunc = function testFunc() {
		const file = fs.File.android.createFile({
			directory: fs.AndroidDirectory.DOWNLOADS,
			name: `${Date.now()}.txt`,
			mime: 'text/plain',
			relativePath: `NativeScript`,
		});

		file.writeTextSync('some text');

		return file;
	};
	if (isAndroid) {
		const file = testFunc();
		TKUnit.assertEqual(file.readTextSync(), 'some text', `The contents of the new file created in the 'AndroidDirectory.DOWNLOADS' folder are not as expected.`);
		file.removeSync();
		TKUnit.assertTrue(!fs.File.exists(file.path));
	} else {
		TKUnit.assertThrows(testFunc, `Trying to retrieve createFile on a platform different from Android should throw!`, `createFile is available on Android only!`);
	}
}

export function test_FileAppend(done) {
	const content = 'Hello World';
	const hello_world = __APPLE__ ? NSString.stringWithString(content).dataUsingEncoding(NSUTF8StringEncoding) : new java.lang.String(content).getBytes('UTF-8');
	const file = fs.File.fromPath(fs.path.join(fs.knownFolders.temp().path, `${Date.now()}-app.txt`));
	file
		.appendText('Hello')
		.then(() => file.appendText(' World'))
		.then(() => {
			TKUnit.assert(file.size === hello_world.length);
			return file.readText();
		})
		.then((value) => {
			TKUnit.assert(value === content);

			return Promise.allSettled([file.remove()]);
		})
		.then(() => done())
		.catch(done);
}

export function test_FileAppendText(done) {
	const content = 'Hello World';
	const file = fs.File.fromPath(fs.path.join(fs.knownFolders.temp().path, `${Date.now()}-app.txt`));
	file
		.appendText('Hello')
		.then(() => file.appendText(' World'))
		.then(() => file.readText())
		.then((value) => {
			TKUnit.assert(value === content);

			return Promise.allSettled([file.remove()]);
		})
		.then(() => done())
		.catch(done);
}

export function test_FileReadTextKeepsLineBreaks(done) {
	const content = '\nfirst\r\nsecond\rthird\n\n' + 'more than one read chunk\r\n'.repeat(5000);
	const file = fs.File.fromPath(fs.path.join(fs.knownFolders.temp().path, `${Date.now()}-line-breaks.txt`));
	file.writeTextSync(content);
	TKUnit.assertEqual(file.readTextSync(), content, 'readTextSync should return the file content unchanged');
	file
		.readText()
		.then((value) => {
			TKUnit.assertEqual(value, content, 'readText should return the file content unchanged');

			return Promise.allSettled([file.remove()]);
		})
		.then(() => done())
		.catch(done);
}
