import * as file_access_module from "./file-system-access";
import * as platformModule from "../platform";
import { profile } from "../profiling";

// The FileSystemAccess implementation, used through all the APIs.
var fileAccess;
var getFileAccess = function (): file_access_module.FileSystemAccess {
    if (!fileAccess) {
        fileAccess = new file_access_module.FileSystemAccess();
    }

    return fileAccess;
};

let platform: typeof platformModule;
function ensurePlatform() {
    if (!platform) {
        platform = require("platform");
    }
}

var createFile = function (info: { path: string; name: string; extension: string }) {
    var file = new File();
    file._path = info.path;
    file._name = info.name;
    file._extension = info.extension;

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

    folder._path = info.path;
    folder._name = info.name;

    return folder;
};

export class FileSystemEntity {
    _path: string;
    _name: string;
    _extension: string;
    _locked: boolean;
    _lastModified: Date;
    _isKnown: boolean;

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
            var hasError = false;
            var localError = function (error: any) {
                hasError = true;
                reject(error);
            };

            this.removeSync(localError);
            if (!hasError) {
                resolve();
            }
        });
    }

    public removeSync(onError?: (error: any) => any): void {
        if (this._isKnown) {
            if (onError) {
                onError({ message: "Cannot delete known folder." });
            }

            return;
        }

        var fileAccess = getFileAccess();

        if (this instanceof File) {
            fileAccess.deleteFile(this.path, onError);
        } else if (this instanceof Folder) {
            fileAccess.deleteFolder(this.path, onError);
        }
    }

    public rename(newName: string): Promise<any> {
        return new Promise((resolve, reject) => {
            var hasError = false;
            var localError = function (error) {
                hasError = true;
                reject(error);
            }

            this.renameSync(newName, localError);

            if (!hasError) {
                resolve();
            }
        });
    }

    public renameSync(newName: string, onError?: (error: any) => any): void {
        if (this._isKnown) {
            if (onError) {
                onError(new Error("Cannot rename known folder."));
            }
            return;
        }

        var parentFolder = this.parent;
        if (!parentFolder) {
            if (onError) {
                onError(new Error("No parent folder."));
            }
            return;
        }

        var fileAccess = getFileAccess();
        var path = parentFolder.path;
        var newPath = fileAccess.joinPath(path, newName);

        var hasError = false;
        var localError = function (error) {
            hasError = true;
            if (onError) {
                onError(error);
            }
            return null;
        }

        fileAccess.rename(this.path, newPath, localError);
        this._path = newPath;
        this._name = newName;

        if (this instanceof File) {
            this._extension = fileAccess.getFileExtension(newPath);
        }
    }

    get name(): string {
        return this._name;
    }

    get path(): string {
        return this._path;
    }

    get lastModified(): Date {
        var value = this._lastModified;
        if (!this._lastModified) {
            value = this._lastModified = getFileAccess().getLastModified(this.path);
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
        return this._extension;
    }

    get isLocked(): boolean {
        // !! is a boolean conversion/cast, handling undefined as well
        return !!this._locked;
    }

    public readSync(onError?: (error: any) => any): any {
        this.checkAccess();

        this._locked = true;

        var that = this;
        var localError = (error) => {
            that._locked = false;
            if (onError) {
                onError(error);
            }
        };

        var content = getFileAccess().read(this.path, localError);

        this._locked = false;

        return content;

    }

    public writeSync(content: any, onError?: (error: any) => any): void {
        this.checkAccess();

        try {
            this._locked = true;

            var that = this;
            var localError = function (error) {
                that._locked = false;
                if (onError) {
                    onError(error);
                }
            };

            getFileAccess().write(this.path, content, localError);
        } finally {
            this._locked = false;
        }
    }

    public readText(encoding?: string): Promise<string> {
        return new Promise((resolve, reject) => {
            var hasError = false;
            var localError = (error) => {
                hasError = true;
                reject(error);
            };

            var content = this.readTextSync(localError, encoding);
            if (!hasError) {
                resolve(content);
            }
        });
    }

    @profile
    public readTextSync(onError?: (error: any) => any, encoding?: string): string {
        this.checkAccess();

        this._locked = true;

        var that = this;
        var localError = (error) => {
            that._locked = false;
            if (onError) {
                onError(error);
            }
        };

        var content = getFileAccess().readText(this.path, localError, encoding);
        this._locked = false;

        return content;
    }

    public writeText(content: string, encoding?: string): Promise<any> {
        return new Promise((resolve, reject) => {
            var hasError = false;
            var localError = function (error) {
                hasError = true;
                reject(error);
            };

            this.writeTextSync(content, localError, encoding);
            if (!hasError) {
                resolve();
            }
        });
    }

    public writeTextSync(content: string, onError?: (error: any) => any, encoding?: string): void {
        this.checkAccess();

        try {
            this._locked = true;

            var that = this;
            var localError = function (error) {
                that._locked = false;
                if (onError) {
                    onError(error);
                }
            };
    
            // TODO: Asyncronous
            getFileAccess().writeText(this.path, content, localError, encoding);
        } finally {
            this._locked = false;
        }
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
            var hasError = false;
            var onError = function (error) {
                hasError = true;
                reject(error);
            };

            this.clearSync(onError);
            if (!hasError) {
                resolve();
            }
        });
    }

    public clearSync(onError?: (error: any) => void): void {
        getFileAccess().emptyFolder(this.path, onError);
    }

    get isKnown(): boolean {
        return this._isKnown;
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
            var hasError = false;
            var localError = function (error) {
                hasError = true;
                reject(error);
            };

            var entities = this.getEntitiesSync(localError);
            if (!hasError) {
                resolve(entities);
            }
        });
    }

    public getEntitiesSync(onError?: (error: any) => any): Array<FileSystemEntity> {
        var fileInfos = getFileAccess().getEntities(this.path, onError);
        if (!fileInfos) {
            return null;
        }

        var entities = new Array<FileSystemEntity>();

        var i;
        for (i = 0; i < fileInfos.length; i++) {
            if (fileInfos[i].extension) {
                entities.push(createFile(fileInfos[i]));
            } else {
                entities.push(createFolder(fileInfos[i]));
            }
        }

        return entities;
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
            _documents._path = path;
            _documents._isKnown = true;
        }

        return _documents;
    };

    export var temp = function (): Folder {
        if (!_temp) {
            var path = getFileAccess().getTempFolderPath();
            _temp = new Folder();
            _temp._path = path;
            _temp._isKnown = true;
        }

        return _temp;
    };

    export var currentApp = function (): Folder {
        if (!_app) {
            var path = getFileAccess().getCurrentAppPath();
            _app = new Folder();
            _app._path = path;
            _app._isKnown = true;
        }

        return _app;
    };
    
    export module ios {
        function _checkPlatform(knownFolderName: string){
            ensurePlatform();
            if (!platform.isIOS){
                throw new Error(`The "${knownFolderName}" known folder is available on iOS only!`);
            }            
        }
        
        let _library: Folder;
        export var library = function(): Folder {
            _checkPlatform("library");
            if (!_library) {
                let existingFolderInfo = getExistingFolderInfo(NSSearchPathDirectory.LibraryDirectory);

                if (existingFolderInfo) {
                    _library = existingFolderInfo.folder;
                    _library._path = existingFolderInfo.path;
                    _library._isKnown = true;
                }
            }

            return _library;
        };
        
        let _developer: Folder;
        export var developer = function(): Folder {
            _checkPlatform("developer");
            if (!_developer) {
                let existingFolderInfo = getExistingFolderInfo(NSSearchPathDirectory.DeveloperDirectory);

                if (existingFolderInfo) {
                    _developer = existingFolderInfo.folder;
                    _developer._path = existingFolderInfo.path;
                    _developer._isKnown = true;
                }
            }

            return _developer;
        };
        
        let _desktop: Folder;
        export var desktop = function(): Folder {
            _checkPlatform("desktop");
            if (!_desktop) {
                 let existingFolderInfo = getExistingFolderInfo(NSSearchPathDirectory.DesktopDirectory);

                if (existingFolderInfo) {
                    _desktop = existingFolderInfo.folder;
                    _desktop._path = existingFolderInfo.path;
                    _desktop._isKnown = true;
                }
            }

            return _desktop;
        };
        
        let _downloads: Folder;
        export var downloads = function(): Folder {
            _checkPlatform("downloads");
            if (!_downloads) {
                let existingFolderInfo = getExistingFolderInfo(NSSearchPathDirectory.DownloadsDirectory);

                if (existingFolderInfo) {
                    _downloads = existingFolderInfo.folder;
                    _downloads._path = existingFolderInfo.path;
                    _downloads._isKnown = true;
                }
            }

            return _downloads;
        };
        
        let _movies: Folder;
        export var movies = function(): Folder {
            _checkPlatform("movies");
            if (!_movies) {
                 let existingFolderInfo = getExistingFolderInfo(NSSearchPathDirectory.MoviesDirectory);

                if (existingFolderInfo) {
                    _movies = existingFolderInfo.folder;
                    _movies._path = existingFolderInfo.path;
                    _movies._isKnown = true;
                }
            }

            return _movies;
        };
        
        let _music: Folder;
        export var music = function(): Folder {
            _checkPlatform("music");
            if (!_music) {
                let existingFolderInfo = getExistingFolderInfo(NSSearchPathDirectory.MusicDirectory);

                if (existingFolderInfo) {
                    _music = existingFolderInfo.folder;
                    _music._path = existingFolderInfo.path;
                    _music._isKnown = true;
                }
            }

            return _music;
        };

        let _pictures: Folder;
        export var pictures = function(): Folder {
            _checkPlatform("pictures");
            if (!_pictures) {
                  let existingFolderInfo = getExistingFolderInfo(NSSearchPathDirectory.PicturesDirectory);

                if (existingFolderInfo) {
                    _pictures = existingFolderInfo.folder;
                    _pictures._path = existingFolderInfo.path;
                    _pictures._isKnown = true;
                }
            }

            return _pictures;
        };

        let _sharedPublic: Folder;
        export var sharedPublic = function(): Folder {
            _checkPlatform("sharedPublic");
            if (!_sharedPublic) {
                let existingFolderInfo = getExistingFolderInfo(NSSearchPathDirectory.SharedPublicDirectory);

                if (existingFolderInfo) {
                    _sharedPublic = existingFolderInfo.folder;
                    _sharedPublic._path = existingFolderInfo.path;
                    _sharedPublic._isKnown = true;
                }
            }

            return _sharedPublic;
        };

        function getExistingFolderInfo(pathDirectory: any /* NSSearchPathDirectory */): { folder: Folder; path: string } {
            var fileAccess = (<any>getFileAccess());
            var folderPath = fileAccess.getKnownPath(pathDirectory);
            var folderInfo = fileAccess.getExistingFolder(folderPath);

            if (folderInfo) {
                return {
                    folder: createFolder(folderInfo),
                    path: folderPath
                };
            }
            return undefined;
        }
    }
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
