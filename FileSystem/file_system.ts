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
    var documents = KnownFolders.documents();
    if (info.path === documents.path) {
        return documents;
    }

    var temp = KnownFolders.temporary();
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
        * Deletes the current entity from the file system.
        */
    public delete(onSuccess?: () => any, onError?: (error: any) => any) {
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
        * Creates a FileReader object over this file and locks the file until the reader is released.
        */
    public openRead(): FileReader {
        this.checkAccess();
        return new FileReader(this);
    }
    /**
        * Creates a FileWriter object over this file and locks the file until the writer is released.
        */
    public openWrite(): FileWriter {
        this.checkAccess();
        return new FileWriter(this);
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

    private checkAccess() {
        if (this.isLocked) {
            throw {
                message: "Cannot access a locked file."
            };
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
    public containsFile(name: string): boolean {
        var fileAccess = getFileAccess();
        var path = fileAccess.concatPath(this.path, name);
        return fileAccess.fileExists(path);
    }

    /**
        * Checks whether this Folder contains a Folder with the specified name.
        */
    public containsFolder(name: string): boolean {
        var fileAccess = getFileAccess();
        var path = fileAccess.concatPath(this.path, name);
        return fileAccess.folderExists(path);
    }

    /**
        * Deletes all the files and folders (recursively), contained within this Folder.
        */
    public empty(onSuccess?: () => any, onError?: (error: any) => any) {
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
    public enumEntities(onSuccess: (files: Array<FileSystemEntity>) => any, onError?: (error: any) => any) {
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
        getFileAccess().enumFiles(this.path, localSuccess, onError);
    }
}

/**
    * Provides access to the top-level Folders instances that are accessible from the application. Use these as entry points to access the FileSystem.
    */
export class KnownFolders {
    private static _documents: Folder;
    private static _temp: Folder;

    /**
        * Gets the Documents folder available for the current application. This Folder is private for the application and not accessible from Users/External apps.
        */
    public static documents(): Folder {
        if (!KnownFolders._documents) {
            var path = getFileAccess().getDocumentsFolderPath();
            KnownFolders._documents = new Folder();
            KnownFolders._documents[pathProperty] = path;
            KnownFolders._documents[isKnownProperty] = true;
        }

        return KnownFolders._documents;
    }

    /**
        * Gets the Temporary (Caches) folder available for the current application. This Folder is private for the application and not accessible from Users/External apps.
        */
    public static temporary(): Folder {
        if (!KnownFolders._temp) {
            var path = getFileAccess().getTempFolderPath();
            KnownFolders._temp = new Folder();
            KnownFolders._temp[pathProperty] = path;
            KnownFolders._temp[isKnownProperty] = true;
        }

        return KnownFolders._temp;
    }
}

/**
    * Base class for FileReader and FileWriter APIs.
    */
export class FileAccess {
    private _file;

    constructor(file: File) {
        this._file = file;
        this._file[fileLockedProperty] = true;
    }

    /**
        * Unlocks the file and allows other operations over it.
        */
    public release() {
        this._file[fileLockedProperty] = false;
        this._file = undefined;
    }

    /**
        * Gets the underlying File instance.
        */
    get file(): File {
        return this._file;
    }
}

/**
    * Enables reading the content of a File entity.
    */
export class FileReader extends FileAccess {
    /**
        * Reads the content of the underlying File as a UTF8 encoded string.
        */
    public readText(onSuccess: (content: string) => any, onError?: (error: any) => any) {
        getFileAccess().readText(this.file.path, onSuccess, onError);
    }
}

/**
    * Enables saving data to a File entity.
    */
export class FileWriter extends FileAccess {
    public writeText(content: string, onSuccess?: () => any, onError?: (error: any) => any) {
        getFileAccess().writeText(this.file.path, content, onSuccess, onError);
    }
}