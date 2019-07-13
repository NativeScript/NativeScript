// imported for definition purposes only
import * as platformModule from "../platform";
import { FSWorker } from "./file-system-worker/components";
import { FileSystemAccess } from "./file-system-access";
import { profile } from "../profiling";

namespace _FileSystem {
  let fileAccess: FileSystemAccess;
  let platform: typeof platformModule;

  export function postJob(job: FSWorker.Job, resolve, reject): void {
    if (!FSWorker.isRunning()) FSWorker.createWorkerInstance();
    FSWorker.getWorkerInstance().postJob(job, resolve, reject);
  }

  export function getFileAccess() {
    if (!(fileAccess instanceof FileSystemAccess)) {
      fileAccess = new FileSystemAccess();
    }
    return fileAccess;
  }

  export function getPlatform() {
    if (!platform) {
      platform = require("../platfrom");
    }
    return platform;
  }

  export function createFile(info: {
    path: string;
    name: string;
    extension: string;
  }) {
    const file = new File();
    file._path = info.path;
    file._name = info.name;
    file._extension = info.extension;

    return file;
  }

  export function createFolder(info: { path: string; name: string }) {
    const documents = knownFolders.documents();
    if (info.path === documents.path) {
      return documents;
    }

    const temp = knownFolders.temp();
    if (info.path === temp.path) {
      return temp;
    }

    const folder = new Folder();

    folder._path = info.path;
    folder._name = info.name;

    return folder;
  }
}

export class FileSystemEntity {
  _path: string;
  _name: string;
  _extension: string;
  _locked: boolean;
  _lastModified: Date;
  _isKnown: boolean;

  get parent(): Folder {
    const onError = function(error) {
      throw error;
    };

    const folderInfo = _FileSystem
      .getFileAccess()
      .getParent(this.path, onError);
    if (!folderInfo) {
      return undefined;
    }

    return _FileSystem.createFolder(folderInfo);
  }

  public remove(): Promise<any> {
    return new Promise((resolve, reject) => {
      this._isKnown
        ? reject(new Error("Cannot delete known folder."))
        : _FileSystem.postJob(
            new FSWorker.Job(
              FSWorker.WorkType.entity,
              FSWorker.WorkTask.removeEntity,
              { path: this.path, isFile: this instanceof File }
            ),
            resolve,
            reject
          );
    });
  }

  public removeSync(onError?: (error: any) => any): void {
    if (this._isKnown) {
      if (onError) {
        onError({ message: "Cannot delete known folder." });
      }

      return;
    }

    const fileAccess = _FileSystem.getFileAccess();

    if (this instanceof File) {
      fileAccess.deleteFile(this.path, onError);
    } else if (this instanceof Folder) {
      fileAccess.deleteFolder(this.path, onError);
    }
  }

  public rename(newName: string): Promise<any> {
    return new Promise((resolve, reject) => {
      if (this._isKnown || !this.parent) {
        reject(
          new Error(
            this._isKnown ? "Cannot delete known folder" : "No parent folder"
          )
        );
      }

      _FileSystem.postJob(
        new FSWorker.Job(
          FSWorker.WorkType.entity,
          FSWorker.WorkTask.renameEntity,
          {
            name: name,
            path: this.path,
            parentPath: this.parent._path
          }
        ),
        (result: { name: string; path: string; extension: string }) => {
          this._name = result.name;
          this._path = result.path;
          if (this instanceof File) {
            this._extension = result.extension;
          }
          resolve(result);
        },
        reject
      );
    });
  }

  public renameSync(newName: string, onError?: (error: any) => any): void {
    if (this._isKnown) {
      if (onError) {
        onError(new Error("Cannot rename known folder."));
      }

      return;
    }

    const parentFolder = this.parent;
    if (!parentFolder) {
      if (onError) {
        onError(new Error("No parent folder."));
      }

      return;
    }

    const fileAccess = _FileSystem.getFileAccess();
    const path = parentFolder.path;
    const newPath = fileAccess.joinPath(path, newName);

    const localError = function(error) {
      if (onError) {
        onError(error);
      }

      return null;
    };

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
    let value = this._lastModified;
    if (!this._lastModified) {
      value = this._lastModified = _FileSystem
        .getFileAccess()
        .getLastModified(this.path);
    }

    return value;
  }
}

export class File extends FileSystemEntity {
  public static fromPath(path: string) {
    const onError = function(error) {
      throw error;
    };

    const fileInfo = _FileSystem.getFileAccess().getFile(path, onError);
    if (!fileInfo) {
      return undefined;
    }

    return _FileSystem.createFile(fileInfo);
  }

  public static exists(path: string): boolean {
    return _FileSystem.getFileAccess().fileExists(path);
  }

  get extension(): string {
    return this._extension;
  }

  get isLocked(): boolean {
    // !! is a boolean conversion/cast, handling undefined as well
    return !!this._locked;
  }

  get size(): number {
    return _FileSystem.getFileAccess().getFileSize(this.path);
  }

  public readSync(onError?: (error: any) => any): any {
    this.checkAccess();

    this._locked = true;

    const that = this;
    const localError = error => {
      that._locked = false;
      if (onError) {
        onError(error);
      }
    };

    const content = _FileSystem.getFileAccess().read(this.path, localError);

    this._locked = false;

    return content;
  }

  public writeSync(content: any, onError?: (error: any) => any): void {
    this.checkAccess();

    try {
      this._locked = true;

      const that = this;
      const localError = function(error) {
        that._locked = false;
        if (onError) {
          onError(error);
        }
      };

      _FileSystem.getFileAccess().write(this.path, content, localError);
    } finally {
      this._locked = false;
    }
  }

  public readText(encoding?: string): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        this.checkAccess();
        this._locked = true;
        const onResult = (result: any) => {
          this._locked = false;
          result instanceof Error ? reject(result) : resolve(result);
        };
        _FileSystem.postJob(
          new FSWorker.Job(FSWorker.WorkType.file, FSWorker.WorkTask.readText, {
            path: this.path,
            encoding: encoding
          }),
          onResult,
          onResult
        );
      } catch (error) {
        reject(error);
      }
    });
  }

  @profile
  public readTextSync(
    onError?: (error: any) => any,
    encoding?: string
  ): string {
    this.checkAccess();

    this._locked = true;

    const that = this;
    const localError = error => {
      that._locked = false;
      if (onError) {
        onError(error);
      }
    };

    const content = _FileSystem
      .getFileAccess()
      .readText(this.path, localError, encoding);
    this._locked = false;

    return content;
  }

  public writeText(content: string, encoding?: string): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        this.checkAccess();
        this._locked = true;
        const onResult = (result: any) => {
          this._locked = false;
          result instanceof Error ? reject(result) : resolve(result);
        };

        _FileSystem.postJob(
          new FSWorker.Job(
            FSWorker.WorkType.file,
            FSWorker.WorkTask.writeText,
            {
              content,
              encoding,
              path: this.path
            }
          ),
          onResult,
          onResult
        );
      } catch (error) {
        reject(error);
      }
    });
  }

  public writeTextSync(
    content: string,
    onError?: (error: any) => any,
    encoding?: string
  ): void {
    this.checkAccess();

    try {
      this._locked = true;

      const that = this;
      const localError = function(error) {
        that._locked = false;
        if (onError) {
          onError(error);
        }
      };

      // TODO: Asyncronous
      _FileSystem
        .getFileAccess()
        .writeText(this.path, content, localError, encoding);
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
    const onError = function(error) {
      throw error;
    };

    const folderInfo = _FileSystem.getFileAccess().getFolder(path, onError);
    if (!folderInfo) {
      return undefined;
    }

    return _FileSystem.createFolder(folderInfo);
  }

  public static exists(path: string): boolean {
    return _FileSystem.getFileAccess().folderExists(path);
  }

  public contains(name: string): boolean {
    const fileAccess = _FileSystem.getFileAccess();
    const path = fileAccess.joinPath(this.path, name);

    if (fileAccess.fileExists(path)) {
      return true;
    }

    return fileAccess.folderExists(path);
  }

  public clear(): Promise<any> {
    return new Promise((resolve, reject) => {
      _FileSystem.postJob(
        new FSWorker.Job(
          FSWorker.WorkType.folder,
          FSWorker.WorkTask.clearFolder,
          { path: this.path }
        ),
        resolve,
        reject
      );
    });
  }

  public clearSync(onError?: (error: any) => void): void {
    _FileSystem.getFileAccess().emptyFolder(this.path, onError);
  }

  get isKnown(): boolean {
    return this._isKnown;
  }

  public getFile(name: string): File {
    const fileAccess = _FileSystem.getFileAccess();
    const path = fileAccess.joinPath(this.path, name);

    const onError = function(error) {
      throw error;
    };

    const fileInfo = fileAccess.getFile(path, onError);
    if (!fileInfo) {
      return undefined;
    }

    return _FileSystem.createFile(fileInfo);
  }

  public getFolder(name: string): Folder {
    const fileAccess = _FileSystem.getFileAccess();
    const path = fileAccess.joinPath(this.path, name);

    const onError = function(error) {
      throw error;
    };

    const folderInfo = fileAccess.getFolder(path, onError);
    if (!folderInfo) {
      return undefined;
    }

    return _FileSystem.createFolder(folderInfo);
  }

  public getEntities(): Promise<Array<FileSystemEntity>> {
    return new Promise((resolve, reject) => {
      _FileSystem.postJob(
        new FSWorker.Job(
          FSWorker.WorkType.folder,
          FSWorker.WorkTask.getEntities,
          { path: this.path }
        ),
        entities => {
          const _entities = entities.map(
            entity =>
              entity.extension
                ? _FileSystem.createFile(entity)
                : _FileSystem.createFolder(entity)
          );
          resolve(_entities);
        },
        reject
      );
    });
  }

  public getEntitiesSync(
    onError?: (error: any) => any
  ): Array<FileSystemEntity> {
    const fileInfos = _FileSystem
      .getFileAccess()
      .getEntities(this.path, onError);
    if (!fileInfos) {
      return null;
    }

    const entities = new Array<FileSystemEntity>();
    for (let i = 0; i < fileInfos.length; i++) {
      if (fileInfos[i].extension) {
        entities.push(_FileSystem.createFile(fileInfos[i]));
      } else {
        entities.push(_FileSystem.createFolder(fileInfos[i]));
      }
    }

    return entities;
  }

  public eachEntity(onEntity: (entity: FileSystemEntity) => boolean) {
    if (!onEntity) {
      return;
    }

    const onSuccess = function(fileInfo: {
      path: string;
      name: string;
      extension: string;
    }): boolean {
      let entity;
      if (fileInfo.extension) {
        entity = _FileSystem.createFile(fileInfo);
      } else {
        entity = _FileSystem.createFolder(fileInfo);
      }

      return onEntity(entity);
    };

    const onError = function(error) {
      throw error;
    };

    _FileSystem.getFileAccess().eachEntity(this.path, onSuccess, onError);
  }
}

export namespace knownFolders {
  let _documents: Folder;
  let _temp: Folder;
  let _app: Folder;

  export function documents(): Folder {
    if (!_documents) {
      const path = _FileSystem.getFileAccess().getDocumentsFolderPath();
      _documents = new Folder();
      _documents._path = path;
      _documents._isKnown = true;
    }

    return _documents;
  }

  export function temp(): Folder {
    if (!_temp) {
      const path = _FileSystem.getFileAccess().getTempFolderPath();
      _temp = new Folder();
      _temp._path = path;
      _temp._isKnown = true;
    }

    return _temp;
  }

  export function currentApp(): Folder {
    if (!_app) {
      const path = _FileSystem.getFileAccess().getCurrentAppPath();
      _app = new Folder();
      _app._path = path;
      _app._isKnown = true;
    }

    return _app;
  }

  export namespace ios {
    function _checkPlatform(knownFolderName: string) {
      if (_FileSystem.getPlatform().isAndroid) {
        throw new Error(
          `The "${knownFolderName}" known folder is available on iOS only!`
        );
      }
    }

    let _library: Folder;
    export function library(): Folder {
      _checkPlatform("library");
      if (!_library) {
        let existingFolderInfo = getExistingFolderInfo(
          NSSearchPathDirectory.LibraryDirectory
        );

        if (existingFolderInfo) {
          _library = existingFolderInfo.folder;
          _library._path = existingFolderInfo.path;
          _library._isKnown = true;
        }
      }

      return _library;
    }

    let _developer: Folder;
    export function developer(): Folder {
      _checkPlatform("developer");
      if (!_developer) {
        let existingFolderInfo = getExistingFolderInfo(
          NSSearchPathDirectory.DeveloperDirectory
        );

        if (existingFolderInfo) {
          _developer = existingFolderInfo.folder;
          _developer._path = existingFolderInfo.path;
          _developer._isKnown = true;
        }
      }

      return _developer;
    }

    let _desktop: Folder;
    export function desktop(): Folder {
      _checkPlatform("desktop");
      if (!_desktop) {
        let existingFolderInfo = getExistingFolderInfo(
          NSSearchPathDirectory.DesktopDirectory
        );

        if (existingFolderInfo) {
          _desktop = existingFolderInfo.folder;
          _desktop._path = existingFolderInfo.path;
          _desktop._isKnown = true;
        }
      }

      return _desktop;
    }

    let _downloads: Folder;
    export function downloads(): Folder {
      _checkPlatform("downloads");
      if (!_downloads) {
        let existingFolderInfo = getExistingFolderInfo(
          NSSearchPathDirectory.DownloadsDirectory
        );

        if (existingFolderInfo) {
          _downloads = existingFolderInfo.folder;
          _downloads._path = existingFolderInfo.path;
          _downloads._isKnown = true;
        }
      }

      return _downloads;
    }

    let _movies: Folder;
    export function movies(): Folder {
      _checkPlatform("movies");
      if (!_movies) {
        let existingFolderInfo = getExistingFolderInfo(
          NSSearchPathDirectory.MoviesDirectory
        );

        if (existingFolderInfo) {
          _movies = existingFolderInfo.folder;
          _movies._path = existingFolderInfo.path;
          _movies._isKnown = true;
        }
      }

      return _movies;
    }

    let _music: Folder;
    export function music(): Folder {
      _checkPlatform("music");
      if (!_music) {
        let existingFolderInfo = getExistingFolderInfo(
          NSSearchPathDirectory.MusicDirectory
        );

        if (existingFolderInfo) {
          _music = existingFolderInfo.folder;
          _music._path = existingFolderInfo.path;
          _music._isKnown = true;
        }
      }

      return _music;
    }

    let _pictures: Folder;
    export function pictures(): Folder {
      _checkPlatform("pictures");
      if (!_pictures) {
        let existingFolderInfo = getExistingFolderInfo(
          NSSearchPathDirectory.PicturesDirectory
        );

        if (existingFolderInfo) {
          _pictures = existingFolderInfo.folder;
          _pictures._path = existingFolderInfo.path;
          _pictures._isKnown = true;
        }
      }

      return _pictures;
    }

    let _sharedPublic: Folder;
    export function sharedPublic(): Folder {
      _checkPlatform("sharedPublic");
      if (!_sharedPublic) {
        let existingFolderInfo = getExistingFolderInfo(
          NSSearchPathDirectory.SharedPublicDirectory
        );

        if (existingFolderInfo) {
          _sharedPublic = existingFolderInfo.folder;
          _sharedPublic._path = existingFolderInfo.path;
          _sharedPublic._isKnown = true;
        }
      }

      return _sharedPublic;
    }

    function getExistingFolderInfo(
      pathDirectory: any /* NSSearchPathDirectory */
    ): { folder: Folder; path: string } {
      const fileAccess = <any>_FileSystem.getFileAccess();
      const folderPath = fileAccess.getKnownPath(pathDirectory);
      const folderInfo = fileAccess.getExistingFolder(folderPath);

      if (folderInfo) {
        return {
          folder: _FileSystem.createFolder(folderInfo),
          path: folderPath
        };
      }

      return undefined;
    }
  }
}

export namespace path {
  export function normalize(path: string): string {
    return _FileSystem.getFileAccess().normalizePath(path);
  }

  export function join(...paths: string[]): string {
    const fileAccess = _FileSystem.getFileAccess();

    return fileAccess.joinPaths(paths);
  }

  export const separator = _FileSystem.getFileAccess().getPathSeparator();
}

export namespace worker {
  export function terminate(): void {
    if (FSWorker.isRunning()) FSWorker.getWorkerInstance().terminate();
  }

  export function keepAlive(): void {
    if (FSWorker.isRunning()) FSWorker.getWorkerInstance().keepAlive();
  }
}
