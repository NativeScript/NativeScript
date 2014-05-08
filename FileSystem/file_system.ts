import file_access_module = require("FileSystem/file_system_access");
import promises = require("promises/promises");

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
    public getParent(): Folder {
        var onError = function (error) {
            throw error;
        }

        var folderInfo = getFileAccess().getParent(this.path, onError);
        if (!folderInfo) {
            return undefined;
        }

        return createFolder(folderInfo);
    }

    /**
    * Removes the current entity from the file system.
    */
    public remove(): promises.Promise<any> {
        var fileAccess = getFileAccess();
        var promise = promises.defer<any>();

        var localSucces = function () {
            promise.resolve();
        }
        var localError = function (error: any) {
            promise.reject(error);
        }

        if (this instanceof File) {
            fileAccess.deleteFile(this.path, localSucces, localError);
        } else if (this instanceof Folder) {
            fileAccess.deleteFolder(this.path, this[isKnownProperty], localSucces, localError);
        }

        return promise.promise();
    }

    /**
    * Renames the current entity using the specified name.
    */
    public rename(newName: string): promises.Promise<any> {
        var deferred = promises.defer<any>();

        if (this instanceof Folder) {
            if (this[isKnownProperty]) {
                deferred.reject(new Error("Cannot rename known folder."));
                return deferred.promise();
            }
        }

        var parentFolder = this.getParent();
        if (!parentFolder) {
            deferred.reject(new Error("No parent folder."));
            return deferred.promise();
        }

        var fileAccess = getFileAccess();
        var path = parentFolder.path;
        var newPath = fileAccess.joinPath(path, newName);

        var that = this;
        var localSucceess = function () {
            that[pathProperty] = newPath;
            that[nameProperty] = newName;

            if (that instanceof File) {
                that[extensionProperty] = fileAccess.getFileExtension(newPath);
            }

            deferred.resolve();
        }

        var localError = function (error) {
            deferred.reject(error);
        }

        fileAccess.rename(this.path, newPath, localSucceess, localError);

        return deferred.promise();
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
        if (!this[lastModifiedProperty]) {
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
    public static fromPath(path: string) {
        var onError = function (error) {
            throw error;
        }

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
    public readText(encoding?: string): promises.Promise<string> {
        this.checkAccess();

        var deferred = promises.defer<string>();
        this[fileLockedProperty] = true;

        var that = this;
        var localSuccess = function (content: string) {
            that[fileLockedProperty] = false;
            deferred.resolve(content);
        }

        var localError = function (error) {
            that[fileLockedProperty] = false;
            deferred.reject(error);
        }

        // TODO: Asyncronous
        getFileAccess().readText(this.path, localSuccess, localError, encoding);

        return deferred.promise();
    }

    /**
      * Writes the provided string to the file, using the specified encoding. Any previous content will be overwritten.
      */
    public writeText(content: string, encoding?: string): promises.Promise<any> {
        this.checkAccess();

        var deferred = promises.defer<string>();
        this[fileLockedProperty] = true;

        var that = this;
        var localSuccess = function () {
            that[fileLockedProperty] = false;
            deferred.resolve();
        };

        var localError = function (error) {
            that[fileLockedProperty] = false;
            deferred.reject(error);
        };

        // TODO: Asyncronous
        getFileAccess().writeText(this.path, content, localSuccess, localError, encoding);

        return deferred.promise();
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
    public static fromPath(path: string): Folder {
        var onError = function (error) {
            throw error;
        }

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
        var path = fileAccess.joinPath(this.path, name);

        if (fileAccess.fileExists(path)) {
            return true;
        }

        return fileAccess.folderExists(path);
    }

    /**
    * Removes all the files and folders (recursively), contained within this Folder.
    */
    public clear(): promises.Promise<any> {
        var deferred = promises.defer<any>();

        var onSuccess = function () {
            deferred.resolve();
        }
        var onError = function (error) {
            deferred.reject(error);
        }

        getFileAccess().emptyFolder(this.path, onSuccess, onError);

        return deferred.promise();
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
    public getFile(name: string): File {
        var fileAccess = getFileAccess();
        var path = fileAccess.joinPath(this.path, name);

        var onError = function (error) {
            throw error;
        }

        var fileInfo = fileAccess.getFile(path, onError);
        if (!fileInfo) {
            return undefined;
        }

        return createFile(fileInfo);
    }

    /**
    * Attempts to open a Folder with the specified name within this Folder and optionally creates a new Folder if there is no existing one.
    */
    public getFolder(name: string): Folder {
        var fileAccess = getFileAccess();
        var path = fileAccess.joinPath(this.path, name);

        var onError = function (error) {
            throw error;
        }

        var folderInfo = fileAccess.getFolder(path, onError);
        if (!folderInfo) {
            return undefined;
        }

        return createFolder(folderInfo);
    }

    /**
    * Gets all the top-level FileSystem entities residing within this Folder.
    */
    public getEntities(): promises.Promise<Array<FileSystemEntity>> {
        var deferred = promises.defer<Array<FileSystemEntity>>();

        var onSuccess = function (fileInfos: Array<{ path: string; name: string; extension: string }>) {
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

            deferred.resolve(entities);
        }

        var onError = function (error) {
            throw error;
        }

        getFileAccess().getEntities(this.path, onSuccess, onError);

        return deferred.promise();
    }

    /**
    Enumerates all the top-level FileSystem entities residing within this folder.
    The first parameter is a callback that receives the current entity. 
    If the callback returns false this will mean for the iteration to stop.
    */
    public eachEntity(onEntity: (entity: FileSystemEntity) => boolean) {
        if (!onEntity) {
            return;
        }

        var onSuccess = function (fileInfo: { path: string; name: string; extension: string }): boolean {
            var entity;
            if (fileInfo.extension) {
                entity = createFile(fileInfo);
            } else {
                entity = createFolder(fileInfo);
            }

            return onEntity(entity);
        }

        var onError = function (error) {
            throw error;
        }

        getFileAccess().eachEntity(this.path, onSuccess, onError);
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

/**
* Enables path-specific operations like join, extension, etc.
*/
export module path {
    /**
    * Normalizes a path, taking care of occurrances like ".." and "//"
    */
    export function normalize(path: string): string {
        return getFileAccess().normalizePath(path);
    }

    /**
    * Joins all the provided string components, forming a valid and normalized path.
    */
    export function join(...paths: string[]): string {
        var fileAccess = getFileAccess();
        return fileAccess.joinPaths(paths);
    }

    /**
    * Gets the string used to separate file paths.
    */
    export var separator = getFileAccess().getPathSeparator();
}