import file_access_module = require("FileSystem/file_system_access");

// The FileSystemAccess implementation, used through all the APIs.
var fileAccess;
var getFileAccess = function (): file_access_module.FileSystemAccess {
    if (!fileAccess) {
        fileAccess = new file_access_module.FileSystemAccess();
    }

    return fileAccess;
};

// we are defining these as private variables within the IO scope and will use them to access the corresponding properties for each FSEntity instance.
// this allows us to encapsulate (hide) the explicit property setters and force the users go through the exposed APIs to receive FSEntity instances.
var nameProperty = "_name";
var pathProperty = "_path";
var isKnownProperty = "_isKnown";
var fileLockedProperty = "_locked";
var extensionProperty = "_extension";
var lastModifiedProperty = "_lastModified";

var createFile = function (info: { path: string; name: string; extension: string }) {
    var file = new File();
    file[pathProperty] = info.path;
    file[nameProperty] = info.name;
    file[extensionProperty] = info.extension;

    return file;
};

var createFolder = function (info: { path: string; name: string; }) {
    var documents = knownFolders.documents();
    if (info.path === documents.path) {
        return documents;
    }

    var temp = knownFolders.temp();
    if (info.path === temp.path) {
        return temp;
    }

    var folder = new Folder();

    folder[pathProperty] = info.path;
    folder[nameProperty] = info.name;

    return folder;
};

/**
* Represents the basic file system entity - a File or a Folder.
*/
export class FileSystemEntity {
    /**
    * Gets the Folder object representing the parent of this entity. Will be null for a root folder like Documents or Temporary.
    */
    public getParent(onError?: (error: any) => any): Folder {
        var folderInfo = getFileAccess().getParent(this.path, onError);
        if (!folderInfo) {
            return undefined;
        }

        return createFolder(folderInfo);
    }

    /**
    * Removes the current entity from the file system.
    */
    public remove(onSuccess?: () => any, onError?: (error: any) => any) {
        if (this instanceof File) {
            getFileAccess().deleteFile(this.path, onSuccess, onError);
        } else if (this instanceof Folder) {
            getFileAccess().deleteFolder(this.path, this[isKnownProperty], onSuccess, onError);
        }
    }

    /**
    * Renames the current entity using the specified name.
    */
    public rename(newName: string, onSuccess?: () => any, onError?: (error: any) => any) {
        if (this instanceof Folder) {
            if (this[isKnownProperty]) {
                if (onError) {
                    onError(new Error("Cannot rename known folder."));
                }

                return;
            }
        }

        var parentFolder = this.getParent();
        if (!parentFolder) {
            if (onError) {
                onError(new Error("No parent folder."));
            }

            return;
        }

        var fileAccess = getFileAccess();
        var path = parentFolder.path;
        var newPath = fileAccess.concatPath(path, newName);

        var that = this;
        var localSucceess = function () {
            that[pathProperty] = newPath;
            that[nameProperty] = newName;

            if (that instanceof File) {
                that[extensionProperty] = fileAccess.getFileExtension(newPath);
            }

            if (onSuccess) {
                onSuccess();
            }
        }

        fileAccess.rename(this.path, newPath, localSucceess, onError);
    }

    /**
    * Gets the name of the entity.
    */
    get name(): string {
        return this[nameProperty];
    }

    /**
        * Gets the fully-qualified path (including the extension for a File) of the entity.
        */
    get path(): string {
        return this[pathProperty];
    }

    /**
        * Gets the fully-qualified path (including the extension for a File) of the entity.
        */
    get lastModified(): Date {
        var value = this[lastModifiedProperty];
        if (this[lastModifiedProperty] === undefined) {
            value = this[lastModifiedProperty] = getFileAccess().getLastModified(this.path);
        }

        return value;
    }
}

/**
    * Represents a File entity.
    */
export class File extends FileSystemEntity {
    /**
        * Gets the File instance associated with the specified path.
        */
    public static fromPath(path: string, onError?: (error: any) => any) {
        var fileInfo = getFileAccess().getFile(path, onError);
        if (!fileInfo) {
            return undefined;
        }

        return createFile(fileInfo);
    }

    /**
    * Checks whether a File with the specified path already exists.
    */
    public static exists(path: string): boolean {
        return getFileAccess().fileExists(path);
    }

    /**
    * Gets the extension of the entity.
    */
    get extension(): string {
        return this[extensionProperty];
    }

    /**
        * Gets a value indicating whether the file is currently locked, meaning a background operation associated with this file is running.
        */
    get isLocked(): boolean {
        return this[fileLockedProperty];
    }

    /**
      * Reads the content of the file as a string using the specified encoding (defaults to UTF-8).
      */
    public readText(onSuccess: (content: string) => any, onError?: (error: any) => any, encoding?: string) {
        if (!onSuccess) {
            return;
        }

        this.checkAccess();
        this[fileLockedProperty] = true;

        var that = this;
        var localSuccess = function (content: string) {
            that[fileLockedProperty] = false;
            onSuccess(content);
        }

        var localError = function (error) {
            that[fileLockedProperty] = false;
            if (onError) {
                onError(error);
            }
        }

        // TODO: Asyncronous
        getFileAccess().readText(this.path, localSuccess, localError, encoding);
    }

    /**
      * Writes the provided string to the file, using the specified encoding. Any previous content will be overwritten.
      */
    public writeText(content: string, onSuccess?: () => any, onError?: (error: any) => any, encoding?: string) {
        this.checkAccess();
        this[fileLockedProperty] = true;

        var that = this;
        var localSuccess = function () {
            that[fileLockedProperty] = false;
            if (onSuccess) {
                onSuccess();
            }
        };

        var localError = function (error) {
            that[fileLockedProperty] = false;
            if (onError) {
                onError(error);
            }
        };

        // TODO: Asyncronous
        getFileAccess().writeText(this.path, content, localSuccess, localError, encoding);
    }

    private checkAccess() {
        if (this.isLocked) {
            throw new Error("Cannot access a locked file.");
        }
    }
}

/**
* Represents a Folder entity.
*/
export class Folder extends FileSystemEntity {
    /**
    * Attempts to access a Folder at the specified path and creates a new Folder if there is no existing one.
    */
    public static fromPath(path: string, onSuccess: (folder: Folder) => any, onError?: (error: any) => any) {
        var folderInfo = getFileAccess().getFolder(path, onError);
        if (!folderInfo) {
            return undefined;
        }

        return createFolder(folderInfo);
    }

    /**
    * Checks whether a Folder with the specified path already exists.
    */
    public static exists(path: string): boolean {
        return getFileAccess().folderExists(path);
    }

    /**
    * Checks whether this Folder contains a file with the specified name.
    */
    public contains(name: string): boolean {
        var fileAccess = getFileAccess();
        var path = fileAccess.concatPath(this.path, name);

        if (fileAccess.fileExists(path)) {
            return true;
        }

        return fileAccess.folderExists(path);
    }

    /**
    * Removes all the files and folders (recursively), contained within this Folder.
    */
    public clear(onSuccess?: () => any, onError?: (error: any) => any) {
        getFileAccess().emptyFolder(this.path, onSuccess, onError);
    }

    /**
    * Determines whether this instance is a KnownFolder (accessed through the KnownFolders object).
    */
    get isKnown(): boolean {
        return this[isKnownProperty];
    }

    /**
    * Attempts to open a File with the specified name within this Folder and optionally creates a new File if there is no existing one.
    */
    public getFile(name: string, onError?: (error: any) => any): File {
        var fileAccess = getFileAccess();
        var path = fileAccess.concatPath(this.path, name);

        var fileInfo = fileAccess.getFile(path, onError);
        if (!fileInfo) {
            return undefined;
        }

        return createFile(fileInfo);
    }

    /**
    * Attempts to open a Folder with the specified name within this Folder and optionally creates a new Folder if there is no existing one.
    */
    public getFolder(name: string, onError?: (error: any) => any): Folder {
        var fileAccess = getFileAccess();
        var path = fileAccess.concatPath(this.path, name);

        var folderInfo = fileAccess.getFolder(path, onError);
        if (!folderInfo) {
            return undefined;
        }

        return createFolder(folderInfo);
    }

    /**
    * Gets all the top-level FileSystem entities residing within this Folder.
    */
    public getEntities(onSuccess: (files: Array<FileSystemEntity>) => any, onError?: (error: any) => any) {
        var localSuccess = function (fileInfos: Array<{ path: string; name: string; extension: string }>) {
            if (onSuccess) {
                var entities = new Array<FileSystemEntity>();
                var i,
                    path: string,
                    entity: FileSystemEntity;

                for (i = 0; i < fileInfos.length; i++) {
                    if (fileInfos[i].extension) {
                        entities.push(createFile(fileInfos[i]));
                    } else {
                        entities.push(createFolder(fileInfos[i]));
                    }
                }

                onSuccess(entities);
            }
        }
        getFileAccess().getEntities(this.path, localSuccess, onError);
    }

    /**
    Enumerates all the top-level FileSystem entities residing within this folder.
    The first parameter is a callback that receives the current entity. 
    If the callback returns false this will mean for the iteration to stop.
    */
    public eachEntity(onEntity: (entity: FileSystemEntity) => boolean, onError?: (error: any) => any) {
        if (!onEntity) {
            return;
        }

        var localSuccess = function (fileInfo: { path: string; name: string; extension: string }): boolean {
            var entity;
            if (fileInfo.extension) {
                entity = createFile(fileInfo);
            } else {
                entity = createFolder(fileInfo);
            }

            return onEntity(entity);
        }
        getFileAccess().eachEntity(this.path, localSuccess, onError);
    }
}

/**
* Provides access to the top-level Folders instances that are accessible from the application. Use these as entry points to access the FileSystem.
*/
export module knownFolders {
    var _documents: Folder;
    var _temp: Folder;

    /**
    * Gets the Documents folder available for the current application. This Folder is private for the application and not accessible from Users/External apps.
    */
    export var documents = function (): Folder {
        if (!_documents) {
            var path = getFileAccess().getDocumentsFolderPath();
            _documents = new Folder();
            _documents[pathProperty] = path;
            _documents[isKnownProperty] = true;
        }

        return _documents;
    };

    /**
    * Gets the Temporary (Caches) folder available for the current application. This Folder is private for the application and not accessible from Users/External apps.
    */
    export var temp = function (): Folder {
        if (!_temp) {
            var path = getFileAccess().getTempFolderPath();
            _temp = new Folder();
            _temp[pathProperty] = path;
            _temp[isKnownProperty] = true;
        }

        return _temp;
    }
}