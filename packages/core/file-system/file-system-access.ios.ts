import { encoding as textEncoding } from '../text';
import { iOSNativeHelper } from '../utils';

// TODO: Implement all the APIs receiving callback using async blocks
// TODO: Check whether we need try/catch blocks for the iOS implementation
export class FileSystemAccess {
	public getLastModified(path: string): Date {
		const fileManager = NSFileManager.defaultManager;
		const attributes = fileManager.attributesOfItemAtPathError(path);

		if (attributes) {
			return attributes.objectForKey('NSFileModificationDate');
		} else {
			return new Date();
		}
	}

	public getFileSize(path: string): number {
		const fileManager = NSFileManager.defaultManager;
		const attributes = fileManager.attributesOfItemAtPathError(path);
		if (attributes) {
			return attributes.objectForKey('NSFileSize');
		} else {
			return 0;
		}
	}

	public getParent(path: string, onError?: (error: any) => any): { path: string; name: string } {
		try {
			const fileManager = NSFileManager.defaultManager;
			const nsString = NSString.stringWithString(path);

			const parentPath = nsString.stringByDeletingLastPathComponent;
			const name = fileManager.displayNameAtPath(parentPath);

			return {
				path: parentPath.toString(),
				name: name,
			};
		} catch (exception) {
			if (onError) {
				onError(exception);
			}

			return undefined;
		}
	}

	public getFile(path: string, onError?: (error: any) => any): { path: string; name: string; extension: string } {
		try {
			const fileManager = NSFileManager.defaultManager;
			const exists = fileManager.fileExistsAtPath(path);

			if (!exists) {
				const parentPath = this.getParent(path, onError).path;
				if (!fileManager.createDirectoryAtPathWithIntermediateDirectoriesAttributesError(parentPath, true, null) || !fileManager.createFileAtPathContentsAttributes(path, null, null)) {
					if (onError) {
						onError(new Error("Failed to create file at path '" + path + "'"));
					}

					return undefined;
				}
			}

			const fileName = fileManager.displayNameAtPath(path);

			return {
				path: path,
				name: fileName,
				extension: this.getFileExtension(path),
			};
		} catch (exception) {
			if (onError) {
				onError(exception);
			}

			return undefined;
		}
	}

	public getFolder(path: string, onError?: (error: any) => any): { path: string; name: string } {
		try {
			const fileManager = NSFileManager.defaultManager;
			const exists = this.folderExists(path);

			if (!exists) {
				try {
					fileManager.createDirectoryAtPathWithIntermediateDirectoriesAttributesError(path, true, null);
				} catch (ex) {
					if (onError) {
						onError(new Error("Failed to create folder at path '" + path + "': " + ex));
					}

					return undefined;
				}
			}

			const dirName = fileManager.displayNameAtPath(path);

			return {
				path: path,
				name: dirName,
			};
		} catch (ex) {
			if (onError) {
				onError(new Error("Failed to create folder at path '" + path + "'"));
			}

			return undefined;
		}
	}

	public getExistingFolder(path: string, onError?: (error: any) => any): { path: string; name: string } {
		try {
			const fileManager = NSFileManager.defaultManager;
			const exists = this.folderExists(path);

			if (exists) {
				const dirName = fileManager.displayNameAtPath(path);

				return {
					path: path,
					name: dirName,
				};
			}

			return undefined;
		} catch (ex) {
			if (onError) {
				onError(new Error("Failed to get folder at path '" + path + "'"));
			}

			return undefined;
		}
	}

	public eachEntity(path: string, onEntity: (file: { path: string; name: string; extension: string }) => any, onError?: (error: any) => any) {
		if (!onEntity) {
			return;
		}

		this.enumEntities(path, onEntity, onError);
	}

	public getEntities(path: string, onError?: (error: any) => any): Array<{ path: string; name: string; extension: string }> {
		const fileInfos = new Array<{
			path: string;
			name: string;
			extension: string;
		}>();

		const onEntity = function (entity: { path: string; name: string; extension: string }): boolean {
			fileInfos.push(entity);

			return true;
		};

		let errorOccurred;
		const localError = function (error: any) {
			if (onError) {
				onError(error);
			}

			errorOccurred = true;
		};

		this.enumEntities(path, onEntity, localError);

		if (!errorOccurred) {
			return fileInfos;
		}

		return null;
	}

	public fileExists(path: string): boolean {
		const result = this.exists(path);

		return result.exists;
	}

	public folderExists(path: string): boolean {
		const result = this.exists(path);

		return result.exists && result.isDirectory;
	}

	private exists(path: string): { exists: boolean; isDirectory: boolean } {
		const fileManager = NSFileManager.defaultManager;
		const isDirectory = new interop.Reference(interop.types.bool, false);
		const exists = fileManager.fileExistsAtPathIsDirectory(path, isDirectory);

		return { exists: exists, isDirectory: isDirectory.value };
	}

	public concatPath(left: string, right: string): string {
		return NSString.pathWithComponents(<any>[left, right]).toString();
	}

	public deleteFile(path: string, onError?: (error: any) => any) {
		this.deleteEntity(path, onError);
	}

	public deleteFolder(path: string, onError?: (error: any) => any) {
		this.deleteEntity(path, onError);
	}

	public emptyFolder(path: string, onError?: (error: any) => any) {
		const fileManager = NSFileManager.defaultManager;
		const entities = this.getEntities(path, onError);

		if (!entities) {
			return;
		}

		for (let i = 0; i < entities.length; i++) {
			try {
				fileManager.removeItemAtPathError(entities[i].path);
			} catch (ex) {
				if (onError) {
					onError(new Error("Failed to empty folder '" + path + "': " + ex));
				}

				return;
			}
		}
	}

	public rename(path: string, newPath: string, onError?: (error: any) => any) {
		const fileManager = NSFileManager.defaultManager;

		try {
			fileManager.moveItemAtPathToPathError(path, newPath);
		} catch (ex) {
			if (onError) {
				onError(new Error("Failed to rename '" + path + "' to '" + newPath + "': " + ex));
			}
		}
	}

	public getLogicalRootPath(): string {
		const mainBundlePath = NSBundle.mainBundle.bundlePath;
		const resolvedPath = NSString.stringWithString(mainBundlePath).stringByResolvingSymlinksInPath;

		return resolvedPath;
	}

	public getDocumentsFolderPath(): string {
		return this.getKnownPath(NSSearchPathDirectory.DocumentDirectory);
	}

	public getTempFolderPath(): string {
		return this.getKnownPath(NSSearchPathDirectory.CachesDirectory);
	}

	public getCurrentAppPath(): string {
		return iOSNativeHelper.getCurrentAppPath();
	}

	public readText = this.readTextSync.bind(this);

	public readTextAsync(path: string, encoding?: any) {
		const actualEncoding = encoding || textEncoding.UTF_8;

		return new Promise<string>((resolve, reject) => {
			try {
				(NSString as any).stringWithContentsOfFileEncodingCompletion(path, actualEncoding, (result, error) => {
					if (error) {
						reject(error);
					} else {
						resolve(result.toString());
					}
				});
			} catch (ex) {
				reject(new Error("Failed to read file at path '" + path + "': " + ex));
			}
		});
	}

	public readTextSync(path: string, onError?: (error: any) => any, encoding?: any) {
		const actualEncoding = encoding || textEncoding.UTF_8;

		try {
			const nsString = NSString.stringWithContentsOfFileEncodingError(path, actualEncoding);

			return nsString.toString();
		} catch (ex) {
			if (onError) {
				onError(new Error("Failed to read file at path '" + path + "': " + ex));
			}
		}
	}

	public read = this.readSync.bind(this);

	public readAsync(path: string): Promise<NSData> {
		return new Promise<NSData>((resolve, reject) => {
			try {
				(NSData as any).dataWithContentsOfFileCompletion(path, resolve);
			} catch (ex) {
				reject(new Error("Failed to read file at path '" + path + "': " + ex));
			}
		});
	}

	public readSync(path: string, onError?: (error: any) => any): NSData {
		try {
			return NSData.dataWithContentsOfFile(path);
		} catch (ex) {
			if (onError) {
				onError(new Error("Failed to read file at path '" + path + "': " + ex));
			}
		}
	}

	public writeText = this.writeTextSync.bind(this);

	public writeTextAsync(path: string, content: string, encoding?: any): Promise<void> {
		const nsString = NSString.stringWithString(content);
		const actualEncoding = encoding || textEncoding.UTF_8;

		return new Promise<void>((resolve, reject) => {
			try {
				(nsString as any).writeToFileAtomicallyEncodingCompletion(path, true, actualEncoding, (error) => {
					if (error) {
						reject(error);
					} else {
						resolve();
					}
				});
			} catch (ex) {
				reject(new Error("Failed to write file at path '" + path + "': " + ex));
			}
		});
	}

	public writeTextSync(path: string, content: string, onError?: (error: any) => any, encoding?: any) {
		const nsString = NSString.stringWithString(content);

		const actualEncoding = encoding || textEncoding.UTF_8;

		// TODO: verify the useAuxiliaryFile parameter should be false
		try {
			nsString.writeToFileAtomicallyEncodingError(path, false, actualEncoding);
		} catch (ex) {
			if (onError) {
				onError(new Error("Failed to write to file '" + path + "': " + ex));
			}
		}
	}

	public write = this.writeSync.bind(this);

	public writeAsync(path: string, content: NSData): Promise<void> {
		return new Promise<void>((resolve, reject) => {
			try {
				(content as any).writeToFileAtomicallyCompletion(path, true, () => {
					resolve();
				});
			} catch (ex) {
				reject(new Error("Failed to write file at path '" + path + "': " + ex));
			}
		});
	}

	public writeSync(path: string, content: NSData, onError?: (error: any) => any) {
		try {
			content.writeToFileAtomically(path, true);
		} catch (ex) {
			if (onError) {
				onError(new Error("Failed to write to file '" + path + "': " + ex));
			}
		}
	}

	private getKnownPath(folderType: number): string {
		const fileManager = NSFileManager.defaultManager;
		const paths = fileManager.URLsForDirectoryInDomains(folderType, NSSearchPathDomainMask.UserDomainMask);

		const url = paths.objectAtIndex(0);

		return url.path;
	}

	// TODO: This method is the same as in the iOS implementation.
	// Make it in a separate file / module so it can be reused from both implementations.
	public getFileExtension(path: string): string {
		// TODO [For Panata]: The definitions currently specify "any" as a return value of this method
		//const nsString = Foundation.NSString.stringWithString(path);
		//const extension = nsString.pathExtension();

		//if (extension && extension.length > 0) {
		//    extension = extension.concat(".", extension);
		//}

		//return extension;
		const dotIndex = path.lastIndexOf('.');
		if (dotIndex && dotIndex >= 0 && dotIndex < path.length) {
			return path.substring(dotIndex);
		}

		return '';
	}

	private deleteEntity(path: string, onError?: (error: any) => any) {
		const fileManager = NSFileManager.defaultManager;
		try {
			fileManager.removeItemAtPathError(path);
		} catch (ex) {
			if (onError) {
				onError(new Error("Failed to delete file at path '" + path + "': " + ex));
			}
		}
	}

	private enumEntities(path: string, callback: (entity: { path: string; name: string; extension: string }) => boolean, onError?: (error) => any) {
		try {
			const fileManager = NSFileManager.defaultManager;
			let files: NSArray<string>;
			try {
				files = fileManager.contentsOfDirectoryAtPathError(path);
			} catch (ex) {
				if (onError) {
					onError(new Error("Failed to enum files for folder '" + path + "': " + ex));
				}

				return;
			}

			for (let i = 0; i < files.count; i++) {
				const file = files.objectAtIndex(i);

				const info = {
					path: this.concatPath(path, file),
					name: file,
					extension: '',
				};

				if (!this.folderExists(this.joinPath(path, file))) {
					info.extension = this.getFileExtension(info.path);
				}

				const retVal = callback(info);
				if (retVal === false) {
					// the callback returned false meaning we should stop the iteration
					break;
				}
			}
		} catch (ex) {
			if (onError) {
				onError(ex);
			}
		}
	}

	public getPathSeparator(): string {
		return '/';
	}

	public normalizePath(path: string): string {
		const nsString: NSString = NSString.stringWithString(path);
		const normalized = nsString.stringByStandardizingPath;

		return normalized;
	}

	public joinPath(left: string, right: string): string {
		const nsString: NSString = NSString.stringWithString(left);

		return nsString.stringByAppendingPathComponent(right);
	}

	public joinPaths(paths: string[]): string {
		return iOSNativeHelper.joinPaths(...paths);
	}
}
