import file_access_module = require("file-system/file-system-access");

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

export class FileSystemEntity {
    get parent(): Folder {
        var onError = function (error) {
            throw error;
        }

        var folderInfo = getFileAccess().getParent(this.path, onError);
        if (!folderInfo) {
            return undefined;
        }

        return createFolder(folderInfo);
    }

    public remove(): Promise<any> {
        return new Promise((resolve, reject) => {
            var fileAccess = getFileAccess();

            var localSucces = function () {
                resolve();
            };

            var localError = function (error: any) {
                reject(error);
            };

            if (this instanceof File) {
                fileAccess.deleteFile(this.path, localSucces, localError);
            } else if (this instanceof Folder) {
                fileAccess.deleteFolder(this.path, this[isKnownProperty], localSucces, localError);
            }
        });
    }

    public rename(newName: string): Promise<any> {
        return new Promise((resolve, reject) => {
            if (this instanceof Folder) {
                if (this[isKnownProperty]) {
                    reject(new Error("Cannot rename known folder."));
                }
            }

            var parentFolder = this.parent;
            if (!parentFolder) {
                reject(new Error("No parent folder."));
            }

            var fileAccess = getFileAccess();
            var path = parentFolder.path;
            var newPath = fileAccess.joinPath(path, newName);

            var localSucceess = () => {
                this[pathProperty] = newPath;
                this[nameProperty] = newName;

                if (this instanceof File) {
                    this[extensionProperty] = fileAccess.getFileExtension(newPath);
                }

                resolve();
            }

            var localError = function (error) {
                reject(error);
            }

            fileAccess.rename(this.path, newPath, localSucceess, localError);
        });
    }

    get name(): string {
        return this[nameProperty];
    }

    get path(): string {
        return this[pathProperty];
    }

    get lastModified(): Date {
        var value = this[lastModifiedProperty];
        if (!this[lastModifiedProperty]) {
            value = this[lastModifiedProperty] = getFileAccess().getLastModified(this.path);
        }

        return value;
    }
}

export class File extends FileSystemEntity {

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

    public static exists(path: string): boolean {
        return getFileAccess().fileExists(path);
    }

    get extension(): string {
        return this[extensionProperty];
    }

    get isLocked(): boolean {
        // !! is a boolean conversion/cast, handling undefined as well
        return !!this[fileLockedProperty];
    }

    public readText(encoding?: string): Promise<string> {
        this.checkAccess();

        return new Promise((resolve, reject) => {
            this[fileLockedProperty] = true;

            var localSuccess = (content: string) => {
                this[fileLockedProperty] = false;
                resolve(content);
            };

            var localError = (error) => {
                this[fileLockedProperty] = false;
                reject(error);
            };

            // TODO: Asyncronous
            getFileAccess().readText(this.path, localSuccess, localError, encoding);

        });
    }

    public writeText(content: string, encoding?: string): Promise<any> {
        this.checkAccess();

        return new Promise((resolve, reject) => {
            this[fileLockedProperty] = true;

            var that = this;
            var localSuccess = function () {
                that[fileLockedProperty] = false;
                resolve();
            };

            var localError = function (error) {
                that[fileLockedProperty] = false;
                reject(error);
            };

            // TODO: Asyncronous
            getFileAccess().writeText(this.path, content, localSuccess, localError, encoding);

        });
    }

    private checkAccess() {
        if (this.isLocked) {
            throw new Error("Cannot access a locked file.");
        }
    }
}

export class Folder extends FileSystemEntity {

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

    public static exists(path: string): boolean {
        return getFileAccess().folderExists(path);
    }

    public contains(name: string): boolean {
        var fileAccess = getFileAccess();
        var path = fileAccess.joinPath(this.path, name);

        if (fileAccess.fileExists(path)) {
            return true;
        }

        return fileAccess.folderExists(path);
    }

    public clear(): Promise<any> {
        return new Promise((resolve, reject) => {

            var onSuccess = function () {
                resolve();
            };

            var onError = function (error) {
                reject(error);
            };

            getFileAccess().emptyFolder(this.path, onSuccess, onError);

        });
    }

    get isKnown(): boolean {
        return this[isKnownProperty];
    }

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

    public getEntities(): Promise<Array<FileSystemEntity>> {
        return new Promise((resolve, reject) => {

            var onSuccess = function (fileInfos: Array<{ path: string; name: string; extension: string }>) {
                var entities = new Array<FileSystemEntity>();
                var i;

                for (i = 0; i < fileInfos.length; i++) {
                    if (fileInfos[i].extension) {
                        entities.push(createFile(fileInfos[i]));
                    } else {
                        entities.push(createFolder(fileInfos[i]));
                    }
                }

                resolve(entities);
            }

            var onError = function (error) {
                throw error;
            };

            getFileAccess().getEntities(this.path, onSuccess, onError);

        });
    }

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

export module knownFolders {
    var _documents: Folder;
    var _temp: Folder;
    var _app: Folder;

    export var documents = function (): Folder {
        if (!_documents) {
            var path = getFileAccess().getDocumentsFolderPath();
            _documents = new Folder();
            _documents[pathProperty] = path;
            _documents[isKnownProperty] = true;
        }

        return _documents;
    };

    export var temp = function (): Folder {
        if (!_temp) {
            var path = getFileAccess().getTempFolderPath();
            _temp = new Folder();
            _temp[pathProperty] = path;
            _temp[isKnownProperty] = true;
        }

        return _temp;
    };

    export var currentApp = function (): Folder {
        if (!_app) {
            var currentDir = __dirname;
            var path = currentDir.substring(0, currentDir.indexOf("/tns_modules"));
            _app = new Folder();
            _app[pathProperty] = path;
            _app[isKnownProperty] = true;
        }

        return _app;
    };
}

export module path {

    export function normalize(path: string): string {
        return getFileAccess().normalizePath(path);
    }

    export function join(...paths: string[]): string {
        var fileAccess = getFileAccess();
        return fileAccess.joinPaths(paths);
    }

    export var separator = getFileAccess().getPathSeparator();
}