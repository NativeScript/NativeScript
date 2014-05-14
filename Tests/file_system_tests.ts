
// <snippet name="file-system">
// # File System
// Using the file system requires the FileSystem module.
// ``` JavaScript
import fs = require("filesystem/file_system");
// ```
// The pre-required `fs` module is used throughout the following code snippets.
// </snippet>

import TKUnit = require("Tests/TKUnit");

// <snippet name="file-system">
// ## Path
// </snippet>

export var testPathNormalize = function () {
    // <snippet name="file-system">
    // ### Normalize a Path
    // ``` JavaScript
    var documents = fs.knownFolders.documents();
    var testPath = "///test.txt";
    //// Get a normalized path such as <folder.path>/test.txt from <folder.path>///test.txt
    var normalizedPath = fs.path.normalize(documents.path + testPath);
    // <hide>
    var expected = documents.path + "/test.txt";
    TKUnit.assert(normalizedPath === expected);
    // </hide>
    // ```
    // </snippet>
};

export var testPathJoin = function () {
    // <snippet name="file-system">
    // ### Path Join
    // Concatinate a path to a file by providing multiple path arguments.
    // ``` JavaScript
    var documents = fs.knownFolders.documents();
    //// Generate a path like <documents.path>/myFiles/test.txt
    var path = fs.path.join(documents.path, "myFiles", "test.txt");
    // <hide>
    var expected = documents.path + "/myFiles/test.txt";
    TKUnit.assert(path === expected);
    // </hide>
    // ```
    // </snippet>
};

export var testPathSeparator = function () {
    // <snippet name="file-system">
    // ### Get the Path Separator
    // ``` JavaScript
    //// An OS dependant path separator, "\" or "/".
    var separator = fs.path.separator;
    // <hide>
    var expected = "/";
    TKUnit.assert(separator === expected);
    // </hide>
    // ```
    // </snippet>
};

export var testFileFromPath = function () {
    // <snippet name="file-system">
    // ### Get or Create a File With Path
    // The following example writes some text to a file created for path.
    // It will create a new file or overwrite an existing file.
    // ``` JavaScript
    var documents = fs.knownFolders.documents();
    var path = fs.path.join(documents.path, "FileFromPath.txt");
    var file = fs.File.fromPath(path);

    //// Writing text to the file.
    file.writeText("Something")
        .then(function () {
            //// Succeeded writing to the file.
            // <hide>
            file.readText()
                .then(function (content) {
                    TKUnit.assert(content === "Something", "File read/write not working.");
                    file.remove();
                })
                .fail(function (error) {
                    console.error("Failed to read/write text");
                    console.dump(error);
                });
            // </hide>
        })
        .fail(function (error) {
            //// Failed to write to the file.
            // <hide>
            console.error("Failed to read/write text");
            console.dump(error);
            // </hide>
        });
    // ```
    // </snippet>
}

export var testFolderFromPath = function () {
    // <snippet name="file-system">
    // ### Get or Create a Folder With Path
    // ``` JavaScript
    var path = fs.path.join(fs.knownFolders.documents().path, "music");
    var folder = fs.Folder.fromPath(path);
    // <hide>
    TKUnit.assert(<any>folder, "Folder.getFolder API not working.");
    TKUnit.assert(fs.Folder.exists(folder.path), "Folder.getFolder API not working.");
    folder.remove();
    // </hide>
    // ```
    // </snippet>
}

// <snippet name="file-system">
// ## Create
// </snippet>

export var testFileWrite = function () {
    // <snippet name="file-system">
    // ### Writing a string to a File
    // The following example writes some text to a file.
    // It will create a new file or overwrite an existing file.
    // ``` JavaScript
    var documents = fs.knownFolders.documents();
    var file = documents.getFile("Test_Write.txt");

    //// Writing text to the file.
    file.writeText("Something")
        .then(function () {
            //// Succeeded writing to the file.
            // <hide>
            file.readText()
                .then(function (content) {
                    TKUnit.assert(content === "Something", "File read/write not working.");
                    file.remove();
                })
                .fail(function (error) {
                    console.error("Failed to read/write text");
                    console.dump(error);
                });
            // </hide>
        })
        .fail(function (error) {
            //// Failed to write to the file.
            // <hide>
            console.error("Failed to read/write text");
            console.dump(error);
            // </hide>
        });
    // ```
    // </snippet>
};

export var testGetFile = function () {
    // <snippet name="file-system">
    // ### Get or Create a File
    // ``` JavaScript
    var documents = fs.knownFolders.documents();
    var file = documents.getFile("NewFileToCreate.txt");
    // <hide>
    TKUnit.assert(<any>file, "File.getFile API not working.");
    TKUnit.assert(fs.File.exists(file.path), "File.getFile API not working.");
    file.remove();
    // </hide>
    // ```
    // </snippet>
}

export var testGetFolder = function () {
    // <snippet name="file-system">
    // ### Get or Create a Folder
    // ``` JavaScript
    var documents = fs.knownFolders.documents();
    var folder = documents.getFolder("NewFolderToCreate");
    // <hide>
    TKUnit.assert(<any>folder, "Folder.getFolder API not working.");
    TKUnit.assert(fs.Folder.exists(folder.path), "Folder.getFolder API not working.");
    folder.remove();
    // </hide>
    // ```
    // </snippet>
};

// <snippet name="file-system">
// ## Read
// </snippet>

export var testFileRead = function () {
    // <snippet name="file-system">
    // ### Reading from a File
    // The following example writes some text to a file and then reads it back.
    // ``` JavaScript
    var documents = fs.knownFolders.documents();
    var myFile = documents.getFile("Test_Write.txt");

    var written: boolean;
    //// Writing text to the file.
    myFile.writeText("Something")
        .then(function () {
            //// Succeeded writing to the file.

            //// Getting back the contents of the file.
            myFile.readText()
                .then(function (content) {
                    //// Successfuly read the file's content.
                    // <hide>
                    written = content === "Something";
                    TKUnit.assert(written, "File read/write not working.");
                    myFile.remove();
                    // </hide>
                })
                .fail(function (error) {
                    //// Failed to read from the file.
                    // <hide>
                    console.error("Failed to read/write text");
                    console.dump(error);
                    // </hide>
                });
        })
        .fail(function (error) {
            //// Failed to write to the file.
            // <hide>
            console.error("Failed to read/write text");
            console.dump(error);
            // </hide>
        });
    // ```
    // </snippet>
};

export var testGetKnownFolders = function () {
    // <snippet name="file-system">
    // ### Getting the Known Folders
    // Each app has several well known folders. This is how to access them:
    // ``` JavaScript
    //// Getting the application's 'documents' folder.
    var documents = fs.knownFolders.documents();
    // <hide>
    TKUnit.assert(<any>documents, "Could not retrieve the Documents known folder.");
    TKUnit.assert(documents.isKnown, "The Documents folder should have its isKnown property set to true.");
    // </hide>
    //// Getting the application's 'temp' folder.
    var temp = fs.knownFolders.temp();
    // <hide>
    TKUnit.assert(<any>temp, "Could not retrieve the Temporary known folder.");
    TKUnit.assert(temp.isKnown, "The Temporary folder should have its isKnown property set to true.");
    // </hide>
    // ```
    // </snippet>
};

export var testGetEntities = function () {
    // <snippet name="file-system">
    // ### Getting Folder Contents
    // Getting all files and folders within a folder:
    // ``` JavaScript
    var documents = fs.knownFolders.documents();
    // <hide>
    var file = documents.getFile("Test.txt");
    var file1 = documents.getFile("Test1.txt");

    var fileFound,
        file1Found;

    // IMPORTANT: console.log is mocked to make the snippet pretty.
    var globalConsole = console;
    var console = {
        log: function (file) {
            if (file === "Test.txt") {
                fileFound = true;
            } else if (file === "Test1.txt") {
                file1Found = true;
            }
        }
    };

    // </hide>
    documents.getEntities()
        .then(function (entities) {
            //// entities is array with the document's files and folders.
            entities.forEach(function (entity) {
                console.log(entity.name);
            });
            // <hide>

            TKUnit.assert(fileFound, "Failed to enumerate Test.txt");
            TKUnit.assert(file1Found, "Failed to enumerate Test1.txt");

            file.remove();
            file1.remove();
            // </hide>
        })
        .fail(function (error) {
            //// Failed to obtain folder's contents.
            // globalConsole.error(error.message);
        });
    // ```
    // </snippet>
};

export var testEnumEntities = function () {
    // <snippet name="file-system">
    // ### Enumerating Folder Contents
    // Getting all folder entities in array may be slow with large number of files.
    // Enumerating the folder entities would itterate the files one by one without blocking the UI.
    // ``` JavaScript
    var documents = fs.knownFolders.documents();
    // <hide>
    var file = documents.getFile("Test.txt");
    var file1 = documents.getFile("Test1.txt");
    var fileFound,
        file1Found;
    var console = {
        log: function (file) {
            if (file === "Test.txt") {
                fileFound = true;
            } else if (file === "Test1.txt") {
                file1Found = true;
            }
        }
    }
    // </hide>
    documents.eachEntity(function (entity) {
        console.log(entity.name);
        //// Return true to continue, or return false to stop the itteration.
        return true;
    });
    // <hide>
    TKUnit.assert(fileFound, "Failed to enumerate Test.txt");
    TKUnit.assert(file1Found, "Failed to enumerate Test1.txt");

    file.remove();
    file1.remove();
    // </hide>
    // ```
    // </snippet>
};

export var testGetParent = function () {
    // <snippet name="file-system">
    // ### Getting Parent Folder
    // ``` JavaScript
    var documents = fs.knownFolders.documents();
    var file = documents.getFile("Test.txt");
    // <hide>
    TKUnit.assert(<any>file, "Failed to create file in the Documents folder.");
    // </hide>
    //// The parent folder of the file would be the documents folder.
    var parent = file.getParent();
    // <hide>
    TKUnit.assert(documents == parent, "The parent folder should be the Documents folder.");
    file.remove();
    // </hide>
    // ```
    // </snippet>
};

export var testFileNameExtension = function () {
    // <snippet name="file-system">
    // ### Getting File Name and Extension
    // ``` JavaScript
    var documents = fs.knownFolders.documents();
    var file = documents.getFile("Test.txt");
    //// Getting the file name "Test.txt".
    var fileName = file.name;
    //// Getting the file extension ".txt".
    var fileExtension = file.extension;
    // <hide>
    TKUnit.assert(fileName === "Test.txt", "Wrong file name.");
    TKUnit.assert(fileExtension === ".txt", "Wrong extension.");
    file.remove();
    // </hide>
    // ```
    // </snippet>
};

export var testFileExists = function () {
    // <snippet name="file-system">
    // ### Checking if a File Exists
    // ``` JavaScript
    var documents = fs.knownFolders.documents();
    var file = documents.getFile("Test.txt");
    var exists = fs.File.exists(file.path);
    // <hide>
    TKUnit.assert(exists, "File.exists API not working.");
    exists = fs.File.exists(file.path + "_");
    TKUnit.assert(!exists, "File.exists API not working.");
    file.remove();
    // </hide>
    // ```
    // </snippet>
};

export var testFolderExists = function () {
    // <snippet name="file-system">
    // ### Checking if a Folder Exists
    // ``` JavaScript
    var documents = fs.knownFolders.documents();
    var exists = fs.Folder.exists(documents.path);
    // <hide>
    TKUnit.assert(exists, "Folder.exists API not working.");
    exists = fs.Folder.exists(documents.path + "_");
    TKUnit.assert(!exists, "Folder.exists API not working.");
    // </hide>
    // ```
    // </snippet>
};

export var testContainsFile = function () {
    var folder = fs.knownFolders.documents();
    var file = folder.getFile("Test.txt");

    var contains = folder.contains("Test.txt");
    TKUnit.assert(contains, "Folder.contains API not working.");
    contains = folder.contains("Test_xxx.txt");
    TKUnit.assert(!contains, "Folder.contains API not working.");

    file.remove();
};

// <snippet name="file-system">
// ## Update
// </snippet>

export var testFileRename = function () {
    // <snippet name="file-system">
    // ### Renaming a File
    // ``` JavaScript
    var documents = fs.knownFolders.documents();
    var file = documents.getFile("Test.txt");

    file.rename("Test_renamed.txt")
        .then(function (result) {
            //// Successfully Renamed.
            // <hide>
            TKUnit.assert(file.name === "Test_renamed.txt", "File.rename API not working.");
            file.remove();
            documents.getFile("Test.txt").remove();
            // </hide>
        })
        .fail(function (error) {
            //// Failed to rename the file.
            // <hide>
            console.error("Failed to rename file");
            // </hide>
        });
    // ```
    // </snippet>
};

export var testFolderRename = function () {
    // <snippet name="file-system">
    // ### Renaming a Folder
    // ``` JavaScript
    var folder = fs.knownFolders.documents();
    var myFolder = folder.getFolder("Test__");

    myFolder.rename("Something")
        .then(function (result) {
            //// Successfully Renamed.
            // <hide>
            TKUnit.assert(myFolder.name === "Something", "Folder.rename API not working.");
            myFolder.remove();
            folder.getFolder("Test__").remove();
            // </hide>
        })
        .fail(function (error) {
            //// Failed to rename the folder.
            // <hide>
            TKUnit.assert(false, "Folder.rename API not working.");
            // </hide>
        });
    // ```
    // </snippet>
};

// <snippet name="file-system">
// ## Delete
// </snippet>

export var testFileRemove = function () {
    // <snippet name="file-system">
    // ### Removing a File
    // To 'delete', 'remove' or 'unlink' a file use the file's remove method:
    // ``` JavaScript
    var documents = fs.knownFolders.documents();
    var file = documents.getFile("AFileToRemove.txt");
    file.remove()
        .then(function (result) {
            //// Success removing the file.
            // <hide>
            TKUnit.assert(!fs.File.exists(file.path));
            // </hide>
        })
        .fail(function (error) {
            //// Failed to remove the file.
            // <hide>
            TKUnit.assert(false, "File.remove API not working.");
            // </hide>
        });
    // ```
    // </snippet>
};

export var testFolderRemove = function () {
    // <snippet name="file-system">
    // ### Removing a Folder
    // ``` JavaScript
    var documents = fs.knownFolders.documents();
    var file = documents.getFolder("AFolderToRemove");
    //// Remove a folder and recursively its content.
    file.remove()
        .then(function (result) {
            //// Success removing the folder.
            // <hide>
            TKUnit.assert(!fs.File.exists(file.path));
            // </hide>
        })
        .fail(function (error) {
            //// Failed to remove the folder.
            // <hide>
            TKUnit.assert(false, "File.remove API not working.");
            // </hide>
        });
    // ```
    // </snippet>
}

export var testFolderClear = function () {
    // <snippet name="file-system">
    // ### Clearing the Contents of a Folder
    // The clear method removes all files within a folder.
    // ``` JavaScript
    var documents = fs.knownFolders.documents();
    var folder = documents.getFolder("testFolderEmpty");
    // <hide>
    var file1 = folder.getFile("Test1.txt");
    var file2 = folder.getFile("Test2.txt");
    var emptied;
    // </hide>
    folder.clear()
        .then(function () {
            //// Successfully cleared the folder.
            // <hide>
            emptied = true;
            // </hide>
        })
        .fail(function (error) {
            //// Failed to clear the folder.
            // <hide>
            console.error(error.message);
            // </hide>
        });
    // <hide>
    folder.getEntities()
        .then(function (entities) {
            TKUnit.assert(entities.length === 0, "Failed to clear a Folder");
            folder.remove();
        });
    // </hide>
    // ```
    // </snippet>
};

// misc

export var testKnownFolderRename = function () {
    var folder = fs.knownFolders.documents();

    folder.rename("Something")
        .then(function (result) {
            console.error("Known folders should not be renamed.");
        })
        .fail(function (error) {
            TKUnit.assert(true);
        });
};
