import { IFileSystemAccess, FileSystemAccess, FileSystemAccess29 } from './file-system-access';
import { SDK_VERSION } from '../utils';
import { Application } from '../application';

// The FileSystemAccess implementation, used through all the APIs.
let fileAccess: IFileSystemAccess;

/**
 * Returns FileSystemAccess, a shared singleton utility class to provide methods to access and work with the file system. This is used under the hood of all the file system apis in @nativescript/core and provided as a lower level convenience if needed.
 * @returns FileSystemAccess
 */
export function getFileAccess(): IFileSystemAccess {
	if (!fileAccess) {
		if (global.isAndroid && SDK_VERSION >= 29) {
			fileAccess = new FileSystemAccess29();
		} else {
			fileAccess = new FileSystemAccess();
		}
	}

	return fileAccess;
}

function createFile(info: { path: string; name: string; extension: string }) {
	const file = new File();
	file._path = info.path;
	file._name = info.name;
	file._extension = info.extension;

	return file;
}

function createFolder(info: { path: string; name: string }) {
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

export class FileSystemEntity {
	_path: string;
	_name: string;
	_extension: string;
	_locked: boolean;
	_lastModified: Date;
	_isKnown: boolean;

	get parent(): Folder {
		const onError = function (error) {
			throw error;
		};

		const folderInfo = getFileAccess().getParent(this.path, onError);
		if (!folderInfo) {
			return undefined;
		}

		return createFolder(folderInfo);
	}

	public remove(): Promise<any> {
		return new Promise((resolve, reject) => {
			let hasError = false;
			const localError = function (error: any) {
				hasError = true;
				reject(error);
			};

			this.removeSync(localError);
			if (!hasError) {
				resolve(true);
			}
		});
	}

	public removeSync(onError?: (error: any) => any): void {
		if (this._isKnown) {
			if (onError) {
				onError({ message: 'Cannot delete known folder.' });
			}

			return;
		}

		const fileAccess = getFileAccess();

		if (this instanceof File) {
			fileAccess.deleteFile(this.path, onError);
		} else if (this instanceof Folder) {
			fileAccess.deleteFolder(this.path, onError);
		}
	}

	public rename(newName: string): Promise<any> {
		return new Promise((resolve, reject) => {
			let hasError = false;
			const localError = function (error) {
				hasError = true;
				reject(error);
			};

			this.renameSync(newName, localError);

			if (!hasError) {
				resolve(true);
			}
		});
	}

	public renameSync(newName: string, onError?: (error: any) => any): void {
		if (this._isKnown) {
			if (onError) {
				onError(new Error('Cannot rename known folder.'));
			}

			return;
		}

		const localError = function (error) {
			if (onError) {
				onError(error);
			}

			return null;
		};

		const fileAccess = getFileAccess();
		// call rename for FileSystemAccess29
		if ((<any>fileAccess).__skip) {
			fileAccess.rename(this.path, newName, localError);
			const fileInfo = getFileAccess().getFile(this.path, null);
			if (fileInfo) {
				this._name = fileInfo.name;
				this._extension = fileInfo.extension;
			}
			return;
		}

		const parentFolder = this.parent;
		if (!parentFolder) {
			if (onError) {
				onError(new Error('No parent folder.'));
			}

			return;
		}

		const path = parentFolder.path;
		const newPath = fileAccess.joinPath(path, newName);

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
		return getFileAccess().getLastModified(this.path);
	}
}

let applicationContext;
function getApplicationContext() {
	if (!applicationContext) {
		applicationContext = Application.android.getNativeApplication().getApplicationContext();
	}

	return applicationContext;
}

export enum AndroidDirectory {
	ALARMS = 'alarms',
	AUDIOBOOKS = 'audiobooks',
	DCIM = 'dcim',
	DOCUMENTS = 'documents',
	DOWNLOADS = 'downloads',
	MOVIES = 'movies',
	MUSIC = 'music',
	NOTIFICATIONS = 'notifications',
	PICTURES = 'pictures',
	PODCASTS = 'podcasts',
	RINGTONES = 'ringtones',
	SCREENSHOTS = 'screenshots',
}

function getAndroidDirectory(value: AndroidDirectory): { path: string; column: android.net.Uri } | null {
	switch (value) {
		case AndroidDirectory.ALARMS:
			return {
				path: android.os.Environment.DIRECTORY_ALARMS,
				column: android.provider.MediaStore.Audio.Media.EXTERNAL_CONTENT_URI,
			};
		case AndroidDirectory.AUDIOBOOKS:
			return {
				path: android.os.Environment.DIRECTORY_AUDIOBOOKS,
				column: android.provider.MediaStore.Audio.Media.EXTERNAL_CONTENT_URI,
			};
		case AndroidDirectory.DCIM:
			return {
				path: android.os.Environment.DIRECTORY_DCIM,
				column: android.provider.MediaStore.Images.Media.EXTERNAL_CONTENT_URI,
			};
		case AndroidDirectory.DOCUMENTS:
			return {
				path: android.os.Environment.DIRECTORY_DOCUMENTS,
				column: android.provider.MediaStore.Files.getContentUri('external'),
			};
		case AndroidDirectory.DOWNLOADS:
			return {
				path: android.os.Environment.DIRECTORY_DOWNLOADS,
				column: android.provider.MediaStore.Downloads.EXTERNAL_CONTENT_URI,
			};
		case AndroidDirectory.MOVIES:
			return {
				path: android.os.Environment.DIRECTORY_MOVIES,
				column: android.provider.MediaStore.Video.Media.EXTERNAL_CONTENT_URI,
			};
		case AndroidDirectory.MUSIC:
			return {
				path: android.os.Environment.DIRECTORY_MUSIC,
				column: android.provider.MediaStore.Audio.Media.EXTERNAL_CONTENT_URI,
			};
		case AndroidDirectory.NOTIFICATIONS:
			return {
				path: android.os.Environment.DIRECTORY_NOTIFICATIONS,
				column: android.provider.MediaStore.Audio.Media.EXTERNAL_CONTENT_URI,
			};
		case AndroidDirectory.PICTURES:
			return {
				path: android.os.Environment.DIRECTORY_PICTURES,
				column: android.provider.MediaStore.Images.Media.EXTERNAL_CONTENT_URI,
			};
		case AndroidDirectory.PODCASTS:
			return {
				path: android.os.Environment.DIRECTORY_PODCASTS,
				column: android.provider.MediaStore.Audio.Media.EXTERNAL_CONTENT_URI,
			};
		case AndroidDirectory.RINGTONES:
			return {
				path: android.os.Environment.DIRECTORY_RINGTONES,
				column: android.provider.MediaStore.Audio.Media.EXTERNAL_CONTENT_URI,
			};
		case AndroidDirectory.SCREENSHOTS:
			return {
				path: android.os.Environment.DIRECTORY_SCREENSHOTS,
				column: android.provider.MediaStore.Images.Media.EXTERNAL_CONTENT_URI,
			};
		default:
			return null;
	}
}

class Android {
	createFile(options: { relativePath?: string; name: string; mime: string; directory: AndroidDirectory }): File {
		if (!global.isAndroid) {
			throw new Error(`createFile is available on Android only!`);
		}

		const context = getApplicationContext() as android.content.Context;

		const meta = new android.content.ContentValues();
		meta.put(android.provider.MediaStore.MediaColumns.DISPLAY_NAME, options.name);
		meta.put(android.provider.MediaStore.MediaColumns.MIME_TYPE, options.mime);
		//meta.put(android.provider.MediaStore.MediaColumns.DATE_ADDED, java.lang.System.currentTimeMillis() as any);

		const externalDirectory = getAndroidDirectory(options.directory);

		if (SDK_VERSION >= 29) {
			const relativePath = options?.relativePath ? `/${options.relativePath}` : '';
			meta.put(android.provider.MediaStore.MediaColumns.RELATIVE_PATH, `${externalDirectory.path}${relativePath}`);
			// todo
			//	meta.put(android.provider.MediaStore.MediaColumns.IS_PENDING, java.lang.Integer.valueOf(1));
		} else {
			const relativePath = options?.relativePath ? `${options.relativePath}/` : '';
			const directory = android.os.Environment.getExternalStoragePublicDirectory(externalDirectory.path);
			const file = new java.io.File(directory, `${relativePath}${options.name}`);
			meta.put(android.provider.MediaStore.MediaColumns.DATA, file.getAbsolutePath());
		}

		const uri = context.getContentResolver().insert(externalDirectory.column, meta);

		return File.fromPath(uri.toString());
	}
}

const ad = new Android();

class iOS {}

const ios = new iOS();

export class File extends FileSystemEntity {
	public static get ios() {
		return ios;
	}

	public static get android() {
		return ad;
	}

	public static fromPath(path: string, copy: boolean = false) {
		const onError = function (error) {
			throw error;
		};

		if (global.isAndroid && copy) {
			if (path.startsWith('content:')) {
				const fileInfo = getFileAccess().getFile(path, onError);
				// falls back to creating a temp file without a known extension.
				if (!fileInfo) {
					const tempFile = `${knownFolders.temp().path}/${java.util.UUID.randomUUID().toString()}`;
					org.nativescript.widgets.Async.File.copySync(path, tempFile, getApplicationContext());
					path = tempFile;
				} else {
					const ext = fileInfo.extension;
					const name = `${fileInfo.name.replace(`.${ext}`, '')}.${ext}`;
					const tempFile = `${knownFolders.temp().path}/${name}`;
					getFileAccess().copySync(path, tempFile);
					path = tempFile;
				}
			}
		}

		const fileInfo = getFileAccess().getFile(path, onError);
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

	get size(): number {
		return getFileAccess().getFileSize(this.path);
	}

	public append(content: any): Promise<void> {
		return new Promise<void>((resolve, reject) => {
			try {
				this._checkAccess();
			} catch (ex) {
				reject(ex);

				return;
			}

			this._locked = true;

			getFileAccess()
				.appendAsync(this.path, content)
				.then(
					() => {
						resolve();
						this._locked = false;
					},
					(error) => {
						reject(error);
						this._locked = false;
					}
				);
		});
	}

	public appendSync(content: any, onError?: (error: any) => any): void {
		this._checkAccess();

		try {
			this._locked = true;

			const that = this;
			const localError = function (error) {
				that._locked = false;
				if (onError) {
					onError(error);
				}
			};

			getFileAccess().appendSync(this.path, content, localError);
		} finally {
			this._locked = false;
		}
	}

	public appendText(content: string, encoding?: string): Promise<any> {
		return new Promise((resolve, reject) => {
			try {
				this._checkAccess();
			} catch (ex) {
				reject(ex);

				return;
			}

			this._locked = true;

			getFileAccess()
				.appendTextAsync(this.path, content, encoding)
				.then(
					() => {
						resolve(true);
						this._locked = false;
					},
					(error) => {
						reject(error);
						this._locked = false;
					}
				);
		});
	}

	public appendTextSync(content: string, onError?: (error: any) => any, encoding?: string): void {
		this._checkAccess();

		try {
			this._locked = true;

			const that = this;
			const localError = function (error) {
				that._locked = false;
				if (onError) {
					onError(error);
				}
			};

			getFileAccess().appendTextSync(this.path, content, localError, encoding);
		} finally {
			this._locked = false;
		}
	}

	public copy(dest: string): Promise<boolean> {
		return new Promise<boolean>((resolve, reject) => {
			try {
				this._checkAccess();
			} catch (ex) {
				reject(ex);

				return;
			}

			this._locked = true;

			getFileAccess()
				.copyAsync(this.path, dest)
				.then(
					(result) => {
						resolve(result);
						this._locked = false;
					},
					(error) => {
						reject(error);
						this._locked = false;
					}
				);
		});
	}

	public copySync(dest: string, onError?: (error: any) => any): any {
		this._checkAccess();

		this._locked = true;

		const that = this;
		const localError = (error) => {
			that._locked = false;
			if (onError) {
				onError(error);
			}
		};

		const content = getFileAccess().copySync(this.path, dest, localError);

		this._locked = false;

		return content;
	}

	public read(): Promise<any> {
		return new Promise<any>((resolve, reject) => {
			try {
				this._checkAccess();
			} catch (ex) {
				reject(ex);

				return;
			}

			this._locked = true;

			getFileAccess()
				.readAsync(this.path)
				.then(
					(result) => {
						resolve(result);
						this._locked = false;
					},
					(error) => {
						reject(error);
						this._locked = false;
					}
				);
		});
	}

	public readSync(onError?: (error: any) => any): any {
		this._checkAccess();

		this._locked = true;

		const that = this;
		const localError = (error) => {
			that._locked = false;
			if (onError) {
				onError(error);
			}
		};

		const content = getFileAccess().readSync(this.path, localError);

		this._locked = false;

		return content;
	}

	public write(content: any): Promise<void> {
		return new Promise<void>((resolve, reject) => {
			try {
				this._checkAccess();
			} catch (ex) {
				reject(ex);

				return;
			}

			this._locked = true;

			getFileAccess()
				.writeAsync(this.path, content)
				.then(
					() => {
						resolve();
						this._locked = false;
					},
					(error) => {
						reject(error);
						this._locked = false;
					}
				);
		});
	}

	public writeSync(content: any, onError?: (error: any) => any): void {
		this._checkAccess();

		try {
			this._locked = true;

			const that = this;
			const localError = function (error) {
				that._locked = false;
				if (onError) {
					onError(error);
				}
			};

			getFileAccess().writeSync(this.path, content, localError);
		} finally {
			this._locked = false;
		}
	}

	public readText(encoding?: string): Promise<string> {
		return new Promise((resolve, reject) => {
			try {
				this._checkAccess();
			} catch (ex) {
				reject(ex);

				return;
			}

			this._locked = true;

			getFileAccess()
				.readTextAsync(this.path, encoding)
				.then(
					(result) => {
						resolve(result);
						this._locked = false;
					},
					(error) => {
						reject(error);
						this._locked = false;
					}
				);
		});
	}

	public readTextSync(onError?: (error: any) => any, encoding?: string): string {
		this._checkAccess();

		this._locked = true;

		const that = this;
		const localError = (error) => {
			that._locked = false;
			if (onError) {
				onError(error);
			}
		};

		const content = getFileAccess().readTextSync(this.path, localError, encoding);
		this._locked = false;

		return content;
	}

	public writeText(content: string, encoding?: string): Promise<any> {
		return new Promise((resolve, reject) => {
			try {
				this._checkAccess();
			} catch (ex) {
				reject(ex);

				return;
			}

			this._locked = true;

			getFileAccess()
				.writeTextAsync(this.path, content, encoding)
				.then(
					() => {
						resolve(true);
						this._locked = false;
					},
					(error) => {
						reject(error);
						this._locked = false;
					}
				);
		});
	}

	public writeTextSync(content: string, onError?: (error: any) => any, encoding?: string): void {
		this._checkAccess();

		try {
			this._locked = true;

			const that = this;
			const localError = function (error) {
				that._locked = false;
				if (onError) {
					onError(error);
				}
			};

			getFileAccess().writeTextSync(this.path, content, localError, encoding);
		} finally {
			this._locked = false;
		}
	}

	_checkAccess() {
		if (this.isLocked) {
			throw new Error('Cannot access a locked file.');
		}
	}
}

export class Folder extends FileSystemEntity {
	public static fromPath(path: string): Folder {
		const onError = function (error) {
			throw error;
		};

		const folderInfo = getFileAccess().getFolder(path, onError);
		if (!folderInfo) {
			return undefined;
		}

		return createFolder(folderInfo);
	}

	public static exists(path: string): boolean {
		return getFileAccess().folderExists(path);
	}

	public contains(name: string): boolean {
		const fileAccess = getFileAccess();
		const path = fileAccess.joinPath(this.path, name);

		if (fileAccess.fileExists(path)) {
			return true;
		}

		return fileAccess.folderExists(path);
	}

	public clear(): Promise<any> {
		return new Promise((resolve, reject) => {
			let hasError = false;
			const onError = function (error) {
				hasError = true;
				reject(error);
			};

			this.clearSync(onError);
			if (!hasError) {
				resolve(true);
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
		const fileAccess = getFileAccess();
		const path = fileAccess.joinPath(this.path, name);

		const onError = function (error) {
			throw error;
		};

		const fileInfo = fileAccess.getFile(path, onError);
		if (!fileInfo) {
			return undefined;
		}

		return createFile(fileInfo);
	}

	public getFolder(name: string): Folder {
		const fileAccess = getFileAccess();
		const path = fileAccess.joinPath(this.path, name);

		const onError = function (error) {
			throw error;
		};

		const folderInfo = fileAccess.getFolder(path, onError);
		if (!folderInfo) {
			return undefined;
		}

		return createFolder(folderInfo);
	}

	public getEntities(): Promise<Array<FileSystemEntity>> {
		return new Promise((resolve, reject) => {
			let hasError = false;
			const localError = function (error) {
				hasError = true;
				reject(error);
			};

			const entities = this.getEntitiesSync(localError);
			if (!hasError) {
				resolve(entities);
			}
		});
	}

	public getEntitiesSync(onError?: (error: any) => any): Array<FileSystemEntity> {
		const fileInfos = getFileAccess().getEntities(this.path, onError);
		if (!fileInfos) {
			return null;
		}

		const entities = new Array<FileSystemEntity>();
		for (let i = 0; i < fileInfos.length; i++) {
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

		const onSuccess = function (fileInfo: { path: string; name: string; extension: string }): boolean {
			let entity;
			if (fileInfo.extension) {
				entity = createFile(fileInfo);
			} else {
				entity = createFolder(fileInfo);
			}

			return onEntity(entity);
		};

		const onError = function (error) {
			throw error;
		};

		getFileAccess().eachEntity(this.path, onSuccess, onError);
	}
}

export namespace knownFolders {
	let _documents: Folder;
	let _externalDocuments: Folder;
	let _temp: Folder;
	let _app: Folder;

	export function documents(): Folder {
		if (!_documents) {
			const path = getFileAccess().getDocumentsFolderPath();
			_documents = new Folder();
			_documents._path = path;
			_documents._isKnown = true;
		}

		return _documents;
	}

	export function externalDocuments(): Folder {
		if (!_externalDocuments) {
			const path = getFileAccess().getExternalDocumentsFolderPath();
			_externalDocuments = new Folder();
			_externalDocuments._path = path;
			_externalDocuments._isKnown = true;
		}

		return _externalDocuments;
	}

	export function temp(): Folder {
		if (!_temp) {
			const path = getFileAccess().getTempFolderPath();
			_temp = new Folder();
			_temp._path = path;
			_temp._isKnown = true;
		}

		return _temp;
	}

	export function currentApp(): Folder {
		if (!_app) {
			const path = getFileAccess().getCurrentAppPath();
			_app = new Folder();
			_app._path = path;
			_app._isKnown = true;
		}

		return _app;
	}

	export namespace ios {
		function _checkPlatform(knownFolderName: string) {
			if (!global.isIOS) {
				throw new Error(`The "${knownFolderName}" known folder is available on iOS only!`);
			}
		}

		let _library: Folder;
		export function library(): Folder {
			_checkPlatform('library');
			if (!_library) {
				const existingFolderInfo = getExistingFolderInfo(NSSearchPathDirectory.LibraryDirectory);

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
			_checkPlatform('developer');
			if (!_developer) {
				const existingFolderInfo = getExistingFolderInfo(NSSearchPathDirectory.DeveloperDirectory);

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
			_checkPlatform('desktop');
			if (!_desktop) {
				const existingFolderInfo = getExistingFolderInfo(NSSearchPathDirectory.DesktopDirectory);

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
			_checkPlatform('downloads');
			if (!_downloads) {
				const existingFolderInfo = getExistingFolderInfo(NSSearchPathDirectory.DownloadsDirectory);

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
			_checkPlatform('movies');
			if (!_movies) {
				const existingFolderInfo = getExistingFolderInfo(NSSearchPathDirectory.MoviesDirectory);

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
			_checkPlatform('music');
			if (!_music) {
				const existingFolderInfo = getExistingFolderInfo(NSSearchPathDirectory.MusicDirectory);

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
			_checkPlatform('pictures');
			if (!_pictures) {
				const existingFolderInfo = getExistingFolderInfo(NSSearchPathDirectory.PicturesDirectory);

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
			_checkPlatform('sharedPublic');
			if (!_sharedPublic) {
				const existingFolderInfo = getExistingFolderInfo(NSSearchPathDirectory.SharedPublicDirectory);

				if (existingFolderInfo) {
					_sharedPublic = existingFolderInfo.folder;
					_sharedPublic._path = existingFolderInfo.path;
					_sharedPublic._isKnown = true;
				}
			}

			return _sharedPublic;
		}

		function getExistingFolderInfo(pathDirectory: any /* NSSearchPathDirectory */): {
			folder: Folder;
			path: string;
		} {
			const fileAccess = <any>getFileAccess();
			const folderPath = fileAccess.getKnownPath(pathDirectory);
			const folderInfo = fileAccess.getExistingFolder(folderPath);

			if (folderInfo) {
				return {
					folder: createFolder(folderInfo),
					path: folderPath,
				};
			}

			return undefined;
		}
	}
}

export namespace path {
	export function normalize(path: string): string {
		return getFileAccess().normalizePath(path);
	}

	export function join(...paths: string[]): string {
		const fileAccess = getFileAccess();

		return fileAccess.joinPaths(paths);
	}

	export const separator = getFileAccess().getPathSeparator();
}
