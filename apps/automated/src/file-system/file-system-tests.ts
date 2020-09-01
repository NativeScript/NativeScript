/* tslint:disable:no-unused-variable */
// >> file-system-require
import * as fs from '@nativescript/core/file-system';
// << file-system-require

import * as TKUnit from '../tk-unit';
import * as appModule from '@nativescript/core/application';
import { isIOS, Device, platformNames } from '@nativescript/core';

export var testPathNormalize = function () {
	// >> file-system-normalize
	var documents = fs.knownFolders.documents();
	var testPath = '///test.txt';
	// Get a normalized path such as <folder.path>/test.txt from <folder.path>///test.txt
	var normalizedPath = fs.path.normalize(documents.path + testPath);
	// >> (hide)
	var expected = documents.path + '/test.txt';
	TKUnit.assert(normalizedPath === expected);
	// << (hide)
	// << file-system-normalize
};

export var testPathJoin = function () {
	// >> file-system-multiple-args
	var documents = fs.knownFolders.documents();
	// Generate a path like <documents.path>/myFiles/test.txt
	var path = fs.path.join(documents.path, 'myFiles', 'test.txt');
	// >> (hide)
	var expected = documents.path + '/myFiles/test.txt';
	TKUnit.assert(path === expected);
	// << (hide)
	// << file-system-multiple-args
};

export var testPathSeparator = function () {
	// >> file-system-separator
	// An OS dependent path separator, "\" or "/".
	var separator = fs.path.separator;
	// >> (hide)
	var expected = '/';
	TKUnit.assert(separator === expected);
	// << (hide)
	// << file-system-separator
};

export var testFileFromPath = function () {
	// >> file-system-create
	var documents = fs.knownFolders.documents();
	var path = fs.path.join(documents.path, 'FileFromPath.txt');
	var file = fs.File.fromPath(path);

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
				}
			);
			// << (hide)
		},
		function (error) {
			// Failed to write to the file.
			// >> (hide)
			TKUnit.assert(false, 'Failed to read/write text');
			//console.dir(error);
			// << (hide)
		}
	);
	// << file-system-create
};

export var testFolderFromPath = function () {
	// >> file-system-create-folder
	var path = fs.path.join(fs.knownFolders.documents().path, 'music');
	var folder = fs.Folder.fromPath(path);
	// >> (hide)
	TKUnit.assert(<any>folder, 'Folder.getFolder API not working.');
	TKUnit.assert(fs.Folder.exists(folder.path), 'Folder.getFolder API not working.');
	folder.remove();
	// << (hide)
	// << file-system-create-folder
};

export var testFileWrite = function () {
	// >> file-system-write-string
	var documents = fs.knownFolders.documents();
	var file = documents.getFile('Test_Write.txt');

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
				}
			);
			// << (hide)
		},
		function (error) {
			// Failed to write to the file.
			// >> (hide)
			TKUnit.assert(false, 'Failed to read/write text');
			//console.dir(error);
			// << (hide)
		}
	);
	// << file-system-write-string
};

export var testGetFile = function () {
	// >> file-system-create-file
	var documents = fs.knownFolders.documents();
	var file = documents.getFile('NewFileToCreate.txt');
	// >> (hide)
	TKUnit.assert(<any>file, 'File.getFile API not working.');
	TKUnit.assert(fs.File.exists(file.path), 'File.getFile API not working.');
	file.remove();
	// << (hide)
	// << file-system-create-file
};

export var testGetFolder = function () {
	// >> file-system-get-folder
	var documents = fs.knownFolders.documents();
	var folder = documents.getFolder('NewFolderToCreate');
	// >> (hide)
	TKUnit.assert(<any>folder, 'Folder.getFolder API not working.');
	TKUnit.assert(fs.Folder.exists(folder.path), 'Folder.getFolder API not working.');
	folder.remove();
	// << (hide)
	// << file-system-get-folder
};

export var testFileRead = function () {
	// >> file-system-example-text
	var documents = fs.knownFolders.documents();
	var myFile = documents.getFile('Test_Write.txt');

	var written: boolean;
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
				}
			);
		},
		function (error) {
			// Failed to write to the file.
			// >> (hide)
			TKUnit.assert(false, 'Failed to read/write text');
			//console.dir(error);
			// << (hide)
		}
	);
	// << file-system-example-text
};

export var testFileReadWriteBinary = function () {
	// >> file-system-read-binary
	var fileName = 'logo.png';
	var error;

	var sourceFile = fs.File.fromPath(__dirname + '/assets/' + fileName);
	var destinationFile = fs.knownFolders.documents().getFile(fileName);

	var source = sourceFile.readSync((e) => {
		error = e;
	});

	destinationFile.writeSync(source, (e) => {
		error = e;
	});

	// >> (hide)
	var destination = destinationFile.readSync((e) => {
		error = e;
	});
	TKUnit.assertNull(error);
	if (Device.os === platformNames.ios) {
		TKUnit.assertTrue(source.isEqualToData(destination));
	} else {
		TKUnit.assertEqual(new java.io.File(sourceFile.path).length(), new java.io.File(destinationFile.path).length());
	}

	destinationFile.removeSync();
	// << (hide)
	// << file-system-read-binary
};

export var testFileReadWriteBinaryAsync = function () {
	// >> file-system-read-binary-async
	var fileName = 'logo.png';

	var sourceFile = fs.File.fromPath(__dirname + '/assets/' + fileName);
	var destinationFile = fs.knownFolders.documents().getFile(fileName);

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
							if (Device.os === platformNames.ios) {
								TKUnit.assertTrue(source.isEqualToData(destination));
							} else {
								TKUnit.assertEqual(new java.io.File(sourceFile.path).length(), new java.io.File(destinationFile.path).length());
							}

							destinationFile.removeSync();
						},
						function (error) {
							TKUnit.assert(false, 'Failed to read destination binary async');
						}
					);
				},
				function (error) {
					// Failed to write the file.
					TKUnit.assert(false, 'Failed to write binary async');
				}
			);
			// << (hide)
		},
		function (error) {
			// Failed to read the file.
			// >> (hide)
			TKUnit.assert(false, 'Failed to read binary async');
			// << (hide)
		}
	);
	// << file-system-read-binary-async
};

export var testGetKnownFolders = function () {
	// >> file-system-known-folders
	// Getting the application's 'documents' folder.
	var documents = fs.knownFolders.documents();
	// >> (hide)
	TKUnit.assert(<any>documents, 'Could not retrieve the Documents known folder.');
	TKUnit.assert(documents.isKnown, 'The Documents folder should have its isKnown property set to true.');
	// << (hide)
	// Getting the application's 'temp' folder.
	var temp = fs.knownFolders.temp();
	// >> (hide)
	TKUnit.assert(<any>temp, 'Could not retrieve the Temporary known folder.');
	TKUnit.assert(temp.isKnown, 'The Temporary folder should have its isKnown property set to true.');
	// << (hide)
	// << file-system-known-folders
};

function _testIOSSpecificKnownFolder(knownFolderName: string) {
	let knownFolder: fs.Folder;
	let createdFile: fs.File;
	let testFunc = function testFunc() {
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

export var testIOSSpecificKnownFolders = function () {
	_testIOSSpecificKnownFolder('library');
	_testIOSSpecificKnownFolder('developer');
	_testIOSSpecificKnownFolder('desktop');
	_testIOSSpecificKnownFolder('downloads');
	_testIOSSpecificKnownFolder('movies');
	_testIOSSpecificKnownFolder('music');
	_testIOSSpecificKnownFolder('pictures');
	_testIOSSpecificKnownFolder('sharedPublic');
};

export var testGetEntities = function () {
	// >> file-system-folders-content
	var documents = fs.knownFolders.documents();
	// >> (hide)
	var file = documents.getFile('Test.txt');
	var file1 = documents.getFile('Test1.txt');

	var fileFound, file1Found;

	// IMPORTANT: console.log is mocked to make the snippet pretty.
	var globalConsole = console;
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
		}
	);
	// << file-system-folders-content
};

export var testEnumEntities = function () {
	// >> file-system-enum-content
	var documents = fs.knownFolders.documents();
	// >> (hide)
	var file = documents.getFile('Test.txt');
	var file1 = documents.getFile('Test1.txt');
	var testFolder = documents.getFolder('testFolder');
	var fileFound = false;
	var file1Found = false;
	var testFolderFound = false;
	var console = {
		log: function (file) {
			if (file === 'Test.txt') {
				fileFound = true;
			} else if (file === 'Test1.txt') {
				file1Found = true;
			} else if (file === 'testFolder') {
				testFolderFound = true;
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

	file.remove();
	file1.remove();
	testFolder.remove();
	// << (hide)
	// << file-system-enum-content
};

export var testGetParent = function () {
	// >> file-system-parent
	var documents = fs.knownFolders.documents();
	var file = documents.getFile('Test.txt');
	// >> (hide)
	TKUnit.assert(<any>file, 'Failed to create file in the Documents folder.');
	// << (hide)
	// The parent folder of the file would be the documents folder.
	var parent = file.parent;
	// >> (hide)
	TKUnit.assert(documents === parent, 'The parent folder should be the Documents folder.');
	file.remove();
	// << (hide)
	// << file-system-parent
};

export var testFileNameExtension = function () {
	// >> file-system-extension
	var documents = fs.knownFolders.documents();
	var file = documents.getFile('Test.txt');
	// Getting the file name "Test.txt".
	var fileName = file.name;
	// Getting the file extension ".txt".
	var fileExtension = file.extension;
	// >> (hide)
	TKUnit.assert(fileName === 'Test.txt', 'Wrong file name.');
	TKUnit.assert(fileExtension === '.txt', 'Wrong extension.');
	file.remove();
	// << (hide)
	// << file-system-extension
};

export var testFileExists = function () {
	// >> file-system-fileexists
	var documents = fs.knownFolders.documents();
	var filePath = fs.path.join(documents.path, 'Test.txt');
	var exists = fs.File.exists(filePath);
	// >> (hide)
	TKUnit.assert(!exists, 'File.exists API not working.');
	var file = documents.getFile('Test.txt');
	exists = fs.File.exists(file.path);
	TKUnit.assert(exists, 'File.exists API not working.');
	file.remove();
	// << (hide)
	// << file-system-fileexists
};

export var testFolderExists = function () {
	// >> file-system-folderexists
	var documents = fs.knownFolders.documents();
	var exists = fs.Folder.exists(documents.path);
	// >> (hide)
	TKUnit.assert(exists, 'Folder.exists API not working.');
	exists = fs.Folder.exists(documents.path + '_');
	TKUnit.assert(!exists, 'Folder.exists API not working.');
	// << (hide)
	// << file-system-folderexists
};

export var testContainsFile = function () {
	var folder = fs.knownFolders.documents();
	var file = folder.getFile('Test.txt');

	var contains = folder.contains('Test.txt');
	TKUnit.assert(contains, 'Folder.contains API not working.');
	contains = folder.contains('Test_xxx.txt');
	TKUnit.assert(!contains, 'Folder.contains API not working.');

	file.remove();
};

export var testFileRename = function () {
	// >> file-system-renaming
	var documents = fs.knownFolders.documents();
	var file = documents.getFile('Test.txt');

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
		}
	);
	// << file-system-renaming
};

export var testFolderRename = function () {
	// >> file-system-renaming-folder
	var folder = fs.knownFolders.documents();
	var myFolder = folder.getFolder('Test__');

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
		}
	);
	// << file-system-renaming-folder
};

export var testFileRemove = function () {
	// >> file-system-remove-file
	var documents = fs.knownFolders.documents();
	var file = documents.getFile('AFileToRemove.txt');
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
		}
	);
	// << file-system-remove-file
};

export var testFolderRemove = function () {
	// >> file-system-remove-folder
	var documents = fs.knownFolders.documents();
	var file = documents.getFolder('AFolderToRemove');
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
		}
	);
	// << file-system-remove-folder
};

export var testFolderClear = function () {
	// >> file-system-clear-folder
	var documents = fs.knownFolders.documents();
	var folder = documents.getFolder('testFolderEmpty');
	// >> (hide)
	folder.getFile('Test1.txt');
	folder.getFile('Test2.txt');
	var subfolder = folder.getFolder('subfolder');
	var emptied;
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
		}
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
export var testKnownFolderRename = function () {
	// You can rename known folders in android - so skip this test.
	if (!appModule.android) {
		var folder = fs.knownFolders.documents();
		folder.rename('Something').then(
			function (result) {
				TKUnit.assert(false, 'Known folders should not be renamed.');
			},
			function (error) {
				TKUnit.assert(true);
			}
		);
	}
};

export function testKnownFolderRemove(done) {
	var result;

	var knownFolder = fs.knownFolders.temp();

	knownFolder.remove().then(
		function () {
			done(new Error('Remove known folder should resolve as error.'));
		},
		function (error) {
			done(null);
		}
	);
}

export function test_FSEntity_Properties() {
	var documents = fs.knownFolders.documents();
	var file = documents.getFile('Test_File.txt');

	TKUnit.assert(file.extension === '.txt', 'FileEntity.extension not working.');
	TKUnit.assert(file.isLocked === false, 'FileEntity.isLocked not working.');
	TKUnit.assert(file.lastModified instanceof Date, 'FileEntity.lastModified not working.');
	TKUnit.assert(file.size === 0, 'FileEntity.size not working.');
	TKUnit.assert(file.name === 'Test_File.txt', 'FileEntity.name not working.');
	TKUnit.assert(file.parent === documents, 'FileEntity.parent not working.');

	file.remove();
}

export function test_FileSize(done) {
	var file = fs.knownFolders.documents().getFile('Test_File_Size.txt');
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
	var file = fs.knownFolders.documents().getFile('Test_File_Lock.txt');
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
	var documentsFolderName = fs.knownFolders.documents().path;
	var tempFileName = fs.path.join(documentsFolderName, 'folder1', 'folder2', 'Test_File_Create_Parent.txt');
	var file = fs.File.fromPath(tempFileName);
	file
		.writeText('Hello World!')
		.then(() => {
			return fs.knownFolders.documents().getFolder('folder1').remove();
		})
		.then(() => done())
		.catch(done);
}

export function test_FolderClear_RemovesEmptySubfolders(done) {
	let documents = fs.knownFolders.documents();
	let rootFolder = documents.getFolder('rootFolder');
	let emptySubfolder = rootFolder.getFolder('emptySubfolder');
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
