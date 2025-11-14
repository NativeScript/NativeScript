import * as textModule from '../text';
import { Application } from '../application';
import { wrapNativeException } from '../utils';
import { getApplicationContext } from '../application/helpers.android';
import { getFileExtension } from '../utils/utils-shared';
import { SDK_VERSION } from '../utils/constants';

import type { IFileSystemAccess } from './file-system-access';

function getOrSetHelper(path: string): org.nativescript.widgets.FileHelper {
	return org.nativescript.widgets.FileHelper.fromString(getApplicationContext(), path);
}
function getOrSetFolderHelper(path: string): org.nativescript.widgets.FolderHelper {
	return org.nativescript.widgets.FolderHelper.fromString(getApplicationContext(), path);
}

function isContentUri(path: string): boolean {
	if (typeof path === 'string' && path.startsWith('content:')) {
		return true;
	}
	return false;
}

export class FileSystemAccess implements IFileSystemAccess {
	private _pathSeparator = '/';

	public getLastModified(path: string): Date {
		const javaFile = new java.io.File(path);

		return new Date(javaFile.lastModified());
	}

	public getFileSize(path: string): number {
		const javaFile = new java.io.File(path);

		return javaFile.length();
	}

	public getParent(path: string, onError?: (error: any) => any): { path: string; name: string } {
		try {
			const javaFile = new java.io.File(path);
			const parent = javaFile.getParentFile();

			return { path: parent.getAbsolutePath(), name: parent.getName() };
		} catch (exception) {
			// TODO: unified approach for error messages
			if (onError) {
				onError(exception);
			}

			return undefined;
		}
	}

	public getFile(path: string, onError?: (error: any) => any, create: boolean = true): { path: string; name: string; extension: string } {
		if (create) {
			return this.ensureFile(new java.io.File(path), false, onError);
		} else {
			return {
				path: path,
				name: path.split('/').pop(),
				extension: path.split('.').pop(),
			};
		}
	}

	public getFolder(path: string, onError?: (error: any) => any, create: boolean = true): { path: string; name: string } {
		const javaFile = new java.io.File(path);
		if (create) {
			const dirInfo = this.ensureFile(javaFile, true, onError);
			if (!dirInfo) {
				return undefined;
			}

			return { path: dirInfo.path, name: dirInfo.name };
		}
		return {
			path,
			name: path.split('/').pop(),
		};
	}

	public eachEntity(path: string, onEntity: (file: { path: string; name: string; extension: string }) => boolean, onError?: (error: any) => any) {
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
		const file = new java.io.File(path);

		return file.exists();
	}

	public folderExists(path: string): boolean {
		const file = new java.io.File(path);

		return file.exists() && file.isDirectory();
	}

	public deleteFile(path: string, onError?: (error: any) => any) {
		try {
			const javaFile = new java.io.File(path);
			if (!javaFile.isFile()) {
				if (onError) {
					onError({
						message: 'The specified parameter is not a File entity.',
					});
				}

				return;
			}

			if (!javaFile.delete()) {
				if (onError) {
					onError({ message: 'File deletion failed' });
				}
			}
		} catch (error) {
			onError?.(wrapNativeException(error));
		}
	}

	public deleteFolder(path: string, onError?: (error: any) => any) {
		try {
			const javaFile = new java.io.File(path);
			if (!javaFile.getCanonicalFile().isDirectory()) {
				if (onError) {
					onError({
						message: 'The specified parameter is not a Folder entity.',
					});
				}

				return;
			}

			// TODO: Asynchronous
			this.deleteFolderContent(javaFile);

			if (!javaFile.delete()) {
				if (onError) {
					onError({ message: 'Folder deletion failed.' });
				}
			}
		} catch (error) {
			onError?.(wrapNativeException(error));
		}
	}

	public emptyFolder(path: string, onError?: (error: any) => any) {
		try {
			const javaFile = new java.io.File(path);
			if (!javaFile.getCanonicalFile().isDirectory()) {
				onError?.(new Error('The specified parameter is not a Folder entity.'));
				return;
			}

			// TODO: Asynchronous
			this.deleteFolderContent(javaFile);
		} catch (error) {
			onError?.(wrapNativeException(error));
		}
	}

	public rename(path: string, newPath: string, onError?: (error: any) => any) {
		const javaFile = new java.io.File(path);
		if (!javaFile.exists()) {
			if (onError) {
				onError(new Error('The file to rename does not exist'));
			}

			return;
		}

		const newFile = new java.io.File(newPath);
		if (newFile.exists()) {
			if (onError) {
				onError(new Error('A file with the same name already exists.'));
			}

			return;
		}

		if (!javaFile.renameTo(newFile)) {
			if (onError) {
				onError(new Error("Failed to rename file '" + path + "' to '" + newPath + "'"));
			}
		}
	}

	public getDocumentsFolderPath(): string {
		const dir = getApplicationContext().getFilesDir();

		return dir.getAbsolutePath();
	}
	public getExternalDocumentsFolderPath(): string {
		const dirs = getApplicationContext().getExternalFilesDirs(null);
		let dir;
		if (dirs && dirs.length > 1) {
			dir = dirs[dirs.length - 1];
		}
		if (!dir) {
			dir = getApplicationContext().getExternalFilesDir(null);
		}
		return dir.getAbsolutePath();
	}

	public getLogicalRootPath(): string {
		const dir = getApplicationContext().getFilesDir();

		return dir.getCanonicalPath();
	}

	public getTempFolderPath(): string {
		const dir = getApplicationContext().getCacheDir();

		return dir.getAbsolutePath();
	}

	public getCurrentAppPath(): string {
		return this.getLogicalRootPath() + '/app';
	}

	public copy = this.copySync.bind(this);

	public copySync(src: string, dest: string, onError?: (error: any) => any) {
		try {
			return org.nativescript.widgets.Async.File.copySync(src, dest, getApplicationContext());
		} catch (error) {
			onError?.(wrapNativeException(error));
		}

		return false;
	}

	public copyAsync(src: string, dest: string): Promise<boolean> {
		return new Promise<boolean>((resolve, reject) => {
			// TODO: clean this i dont think the try catch is needed.
			// also that all file can be refactored
			try {
				org.nativescript.widgets.Async.File.copy(
					src,
					dest,
					new org.nativescript.widgets.Async.CompleteCallback({
						onComplete: (result: boolean) => {
							resolve(result);
						},
						onError: (err) => {
							reject(err);
						},
					}),
					getApplicationContext(),
				);
			} catch (ex) {
				reject(ex);
			}
		}).catch((ex) => {
			throw wrapNativeException(ex);
		});
	}

	public readBuffer = this.readBufferSync.bind(this);

	public readBufferAsync(path: string): Promise<ArrayBuffer> {
		return new Promise<ArrayBuffer>((resolve, reject) => {
			try {
				org.nativescript.widgets.Async.File.readBuffer(
					path,
					new org.nativescript.widgets.Async.CompleteCallback({
						onComplete: (result: java.nio.ByteBuffer) => {
							resolve((ArrayBuffer as any).from(result));
						},
						onError: (err) => {
							reject(err);
						},
					}),
					null,
				);
			} catch (ex) {
				reject(ex);
			}
		}).catch((ex) => {
			throw wrapNativeException(ex);
		});
	}

	public readBufferSync(path: string, onError?: (error: any) => any) {
		try {
			const javaFile = new java.io.File(path);
			const stream = new java.io.FileInputStream(javaFile);
			const channel = stream.getChannel();
			const buffer = new ArrayBuffer(javaFile.length());
			channel.read(buffer as any);
			return buffer;
		} catch (error) {
			onError?.(wrapNativeException(error));
		}
	}

	public read = this.readSync.bind(this);

	public readAsync(path: string): Promise<number[]> {
		return new Promise<number[]>((resolve, reject) => {
			try {
				org.nativescript.widgets.Async.File.read(
					path,
					new org.nativescript.widgets.Async.CompleteCallback({
						onComplete: (result: number[]) => {
							resolve(result);
						},
						onError: (err) => {
							reject(err);
						},
					}),
					null,
				);
			} catch (ex) {
				reject(ex);
			}
		}).catch((ex) => {
			throw wrapNativeException(ex);
		});
	}

	public readSync(path: string, onError?: (error: any) => any) {
		try {
			const javaFile = new java.io.File(path);
			const stream = new java.io.FileInputStream(javaFile);
			const bytes = (<any>Array).create('byte', javaFile.length());
			const dataInputStream = new java.io.DataInputStream(stream);
			dataInputStream.readFully(bytes);

			return bytes;
		} catch (error) {
			onError?.(wrapNativeException(error));
		}
	}

	static getBuffer(buffer: ArrayBuffer | Uint8Array | Uint8ClampedArray): any {
		if (buffer instanceof ArrayBuffer) {
			return (buffer as any).nativeObject || buffer;
		} else {
			return (buffer?.buffer as any)?.nativeObject || buffer;
		}
	}

	public appendBuffer = this.appendBufferSync.bind(this);

	public appendBufferAsync(path: string, buffer: ArrayBuffer | Uint8Array | Uint8ClampedArray): Promise<void> {
		return new Promise<void>((resolve, reject) => {
			try {
				org.nativescript.widgets.Async.File.appendBuffer(
					path,
					FileSystemAccess.getBuffer(buffer),
					new org.nativescript.widgets.Async.CompleteCallback({
						onComplete: () => {
							resolve();
						},
						onError: (err) => {
							reject(err);
						},
					}),
					null,
				);
			} catch (ex) {
				reject(ex);
			}
		}).catch((ex) => {
			throw wrapNativeException(ex);
		});
	}

	public appendBufferSync(path: string, buffer: ArrayBuffer | Uint8Array | Uint8ClampedArray, onError?: (error: any) => any) {
		try {
			const javaFile = new java.io.File(path);
			const stream = new java.io.FileOutputStream(javaFile);
			const channel = stream.getChannel();
			channel.write(FileSystemAccess.getBuffer(buffer));
			stream.close();
		} catch (error) {
			onError?.(wrapNativeException(error));
		}
	}

	public append = this.appendSync.bind(this);

	public appendAsync(path: string, bytes: androidNative.Array<number>): Promise<void> {
		return new Promise<void>((resolve, reject) => {
			try {
				org.nativescript.widgets.Async.File.append(
					path,
					bytes,
					new org.nativescript.widgets.Async.CompleteCallback({
						onComplete: () => {
							resolve();
						},
						onError: reject,
					}),
					null,
				);
			} catch (ex) {
				reject(ex);
			}
		}).catch((ex) => {
			throw wrapNativeException(ex);
		});
	}

	public appendSync(path: string, bytes: androidNative.Array<number>, onError?: (error: any) => any) {
		try {
			const javaFile = new java.io.File(path);
			const stream = new java.io.FileOutputStream(javaFile, true);
			stream.write(bytes, 0, bytes.length);
			stream.close();
		} catch (error) {
			onError?.(wrapNativeException(error));
		}
	}

	public writeBuffer = this.writeBufferSync.bind(this);

	public writeBufferAsync(path: string, buffer: ArrayBuffer | Uint8Array | Uint8ClampedArray): Promise<void> {
		return new Promise<void>((resolve, reject) => {
			try {
				org.nativescript.widgets.Async.File.writeBuffer(
					path,
					FileSystemAccess.getBuffer(buffer),
					new org.nativescript.widgets.Async.CompleteCallback({
						onComplete: () => {
							resolve();
						},
						onError: reject,
					}),
					null,
				);
			} catch (ex) {
				reject(ex);
			}
		}).catch((ex) => {
			throw wrapNativeException(ex);
		});
	}

	public writeBufferSync(path: string, buffer: ArrayBuffer | Uint8Array | Uint8ClampedArray, onError?: (error: any) => any) {
		try {
			const javaFile = new java.io.File(path);
			const stream = new java.io.FileOutputStream(javaFile);
			const channel = stream.getChannel();
			channel.write(FileSystemAccess.getBuffer(buffer));
			stream.close();
		} catch (error) {
			onError?.(wrapNativeException(error));
		}
	}

	public write = this.writeSync.bind(this);

	public writeAsync(path: string, bytes: androidNative.Array<number>): Promise<void> {
		return new Promise<void>((resolve, reject) => {
			try {
				org.nativescript.widgets.Async.File.write(
					path,
					bytes,
					new org.nativescript.widgets.Async.CompleteCallback({
						onComplete: () => {
							resolve();
						},
						onError: reject,
					}),
					null,
				);
			} catch (ex) {
				reject(ex);
			}
		}).catch((ex) => {
			throw wrapNativeException(ex);
		});
	}

	public writeSync(path: string, bytes: androidNative.Array<number>, onError?: (error: any) => any) {
		try {
			const javaFile = new java.io.File(path);
			const stream = new java.io.FileOutputStream(javaFile);
			stream.write(bytes, 0, bytes.length);
			stream.close();
		} catch (error) {
			onError?.(wrapNativeException(error));
		}
	}

	public readText = this.readTextSync.bind(this);

	public readTextAsync(path: string, encoding?: any): Promise<string> {
		let actualEncoding = encoding;
		if (!actualEncoding) {
			actualEncoding = textModule.encoding.UTF_8;
		}

		return new Promise<string>((resolve, reject) => {
			try {
				org.nativescript.widgets.Async.File.readText(
					path,
					actualEncoding,
					new org.nativescript.widgets.Async.CompleteCallback({
						onComplete: (result: string) => {
							if (actualEncoding === textModule.encoding.UTF_8) {
								// Remove UTF8 BOM if present. http://www.rgagnon.com/javadetails/java-handle-utf8-file-with-bom.html
								result = FileSystemAccess._removeUtf8Bom(result);
							}
							resolve(result);
						},
						onError: reject,
					}),
					null,
				);
			} catch (ex) {
				reject(ex);
			}
		}).catch((ex) => {
			throw wrapNativeException(ex);
		});
	}

	public readTextSync(path: string, onError?: (error: any) => any, encoding?: any) {
		try {
			const javaFile = new java.io.File(path);
			const stream = new java.io.FileInputStream(javaFile);

			let actualEncoding = encoding;
			if (!actualEncoding) {
				actualEncoding = textModule.encoding.UTF_8;
			}
			const reader = new java.io.InputStreamReader(stream, actualEncoding);
			const bufferedReader = new java.io.BufferedReader(reader);

			// TODO: We will need to read the entire file to a CharBuffer instead of reading it line by line
			// TODO: bufferedReader.read(CharBuffer) does not currently work
			let line = undefined;
			let result = '';
			while (line !== null) {
				line = bufferedReader.readLine();
				if (line === null) {
					break;
				}

				if (result.length > 0) {
					// add the new line manually to the result
					// TODO: Try with CharBuffer at a later stage, when the Bridge allows it
					result += '\n';
				}

				result += line;
			}

			if (actualEncoding === textModule.encoding.UTF_8) {
				// Remove UTF8 BOM if present. http://www.rgagnon.com/javadetails/java-handle-utf8-file-with-bom.html
				result = FileSystemAccess._removeUtf8Bom(result);
			}

			bufferedReader.close();

			return result;
		} catch (error) {
			onError?.(wrapNativeException(error));
		}
	}

	private static _removeUtf8Bom(s: string): string {
		if (s.charCodeAt(0) === 0xfeff) {
			s = s.slice(1);
			//console.log("Removed UTF8 BOM.");
		}

		return s;
	}

	public appendText = this.appendTextSync.bind(this);

	public appendTextAsync(path: string, content: string, encoding?: any): Promise<void> {
		let actualEncoding = encoding;
		if (!actualEncoding) {
			actualEncoding = textModule.encoding.UTF_8;
		}

		return new Promise<void>((resolve, reject) => {
			try {
				org.nativescript.widgets.Async.File.appendText(
					path,
					content,
					actualEncoding,
					new org.nativescript.widgets.Async.CompleteCallback({
						onComplete: () => {
							resolve();
						},
						onError: reject,
					}),
					null,
				);
			} catch (ex) {
				reject(ex);
			}
		}).catch((ex) => {
			throw wrapNativeException(ex);
		});
	}

	public appendTextSync(path: string, content: string, onError?: (error: any) => any, encoding?: any) {
		try {
			const javaFile = new java.io.File(path);
			const stream = new java.io.FileOutputStream(javaFile, true);

			let actualEncoding = encoding;
			if (!actualEncoding) {
				actualEncoding = textModule.encoding.UTF_8;
			}
			const writer = new java.io.OutputStreamWriter(stream, actualEncoding);

			writer.write(content);
			writer.close();
		} catch (error) {
			onError?.(wrapNativeException(error));
		}
	}

	public writeText = this.writeTextSync.bind(this);

	public writeTextAsync(path: string, content: string, encoding?: any): Promise<void> {
		let actualEncoding = encoding;
		if (!actualEncoding) {
			actualEncoding = textModule.encoding.UTF_8;
		}

		return new Promise<void>((resolve, reject) => {
			try {
				org.nativescript.widgets.Async.File.writeText(
					path,
					content,
					actualEncoding,
					new org.nativescript.widgets.Async.CompleteCallback({
						onComplete: () => {
							resolve();
						},
						onError: reject,
					}),
					null,
				);
			} catch (ex) {
				reject(ex);
			}
		}).catch((ex) => {
			throw wrapNativeException(ex);
		});
	}

	public writeTextSync(path: string, content: string, onError?: (error: any) => any, encoding?: any) {
		try {
			const javaFile = new java.io.File(path);
			const stream = new java.io.FileOutputStream(javaFile);

			let actualEncoding = encoding;
			if (!actualEncoding) {
				actualEncoding = textModule.encoding.UTF_8;
			}
			const writer = new java.io.OutputStreamWriter(stream, actualEncoding);

			writer.write(content);
			writer.close();
		} catch (error) {
			onError?.(wrapNativeException(error));
		}
	}

	private deleteFolderContent(file: java.io.File): boolean {
		const filesList = file.listFiles();
		if (!filesList || filesList.length === 0) {
			return true; // Nothing to delete, so success!
		}

		let childFile: java.io.File;
		let success = false;

		for (let i = 0; i < filesList.length; i++) {
			childFile = filesList[i];
			if (childFile.getCanonicalFile().isDirectory()) {
				success = this.deleteFolderContent(childFile);
				if (!success) {
					break;
				}
			}

			success = childFile.delete();
		}

		return success;
	}

	private ensureFile(javaFile: java.io.File, isFolder: boolean, onError?: (error: any) => any): { path: string; name: string; extension: string } {
		try {
			if (!javaFile.exists()) {
				let created;
				if (isFolder) {
					created = javaFile.mkdirs();
				} else {
					javaFile.getParentFile().mkdirs();
					created = javaFile.createNewFile();
				}

				if (!created) {
					onError?.(new Error('Failed to create new java File for path ' + javaFile.getAbsolutePath()));
					return;
				} else {
					javaFile.setReadable(true);
					javaFile.setWritable(true);
				}
			}

			const path = javaFile.getAbsolutePath();

			return {
				path: path,
				name: javaFile.getName(),
				extension: this.getFileExtension(path),
			};
		} catch (error) {
			onError?.(wrapNativeException(error));
			return;
		}
	}

	// TODO: This method is the same as in the iOS implementation.
	// Make it in a separate file / module so it can be reused from both implementations.
	public getFileExtension(path: string): string {
		return getFileExtension(path);
	}

	protected enumEntities(path: string, callback: (entity: { path: string; name: string; extension: string }) => boolean, onError?: (error) => any) {
		try {
			let javaFile = new java.io.File(path);
			if (!javaFile.getCanonicalFile().isDirectory()) {
				onError?.(new Error('There is no folder existing at path ' + path));
				return;
			}

			const filesList = javaFile.listFiles();
			const length = filesList.length;
			let info;
			let retVal;

			for (let i = 0; i < length; i++) {
				javaFile = filesList[i];

				info = {
					path: javaFile.getAbsolutePath(),
					name: javaFile.getName(),
				};

				if (javaFile.isFile()) {
					info.extension = this.getFileExtension(info.path);
				}

				retVal = callback(info);
				if (retVal === false) {
					break;
				}
			}
		} catch (error) {
			onError?.(wrapNativeException(error));
		}
	}

	public getPathSeparator(): string {
		return this._pathSeparator;
	}

	public normalizePath(path: string): string {
		if (SDK_VERSION >= 26) {
			// the [''] is a trick to not have to create a android.net.URI
			// and use the method with string signature
			return java.nio.file.Paths.get(path, ['']).normalize().toString();
		} else {
			// for now it wont work on pre 26 as File does not normalize
			const file = new java.io.File(path);
			return file.getAbsolutePath();
		}
	}

	public joinPath(left: string, right: string): string {
		const file1 = new java.io.File(left);
		const file2 = new java.io.File(file1, right);

		return file2.getPath();
	}

	public joinPaths(paths: string[]): string {
		if (!paths || paths.length === 0) {
			return '';
		}

		if (paths.length === 1) {
			return paths[0];
		}

		let result = paths[0];
		for (let i = 1; i < paths.length; i++) {
			result = this.joinPath(result, paths[i]);
		}

		return result;
	}
}

export class FileSystemAccess29 extends FileSystemAccess {
	__skip = true;
	getLastModified(path: string): Date {
		if (isContentUri(path)) {
			return new Date(getOrSetHelper(path).getLastModified() * 1000);
		}
		return super.getLastModified(path);
	}

	getFileSize(path: string): number {
		if (isContentUri(path)) {
			return getOrSetHelper(path).getSize();
		}
		return super.getFileSize(path);
	}

	getParent(path: string, onError?: (error: any) => any): { path: string; name: string } {
		if (isContentUri(path)) {
			try {
				const parent = getOrSetFolderHelper(path).getParent();
				if (parent) {
					return {
						path: parent.getUri().toString(),
						name: parent.getName(),
					};
				}
			} catch (e) {
				onError?.(wrapNativeException(e));
				return;
			}
			return null;
		}
		return super.getParent(path, onError);
	}
	getFile(path: string, onError?: (error: any) => any, create: boolean = true): { path: string; name: string; extension: string } {
		if (isContentUri(path)) {
			try {
				const file = getOrSetHelper(path);

				return {
					path,
					name: file.getName(),
					extension: file.getExtension(),
				};
			} catch (e) {
				onError?.(wrapNativeException(e));
				return;
			}
		}
		return super.getFile(path, onError);
	}
	getFolder(path: string, onError?: (error: any) => any, create: boolean = true): { path: string; name: string } {
		if (isContentUri(path)) {
			const folder = getOrSetFolderHelper(path);
			if (folder) {
				return {
					path,
					name: folder.getName(),
				};
			}
			return null;
		}
		return super.getFolder(path, onError, create);
	}

	protected enumEntities(path: string, callback: (entity: { path: string; name: string; extension: string }) => boolean, onError?: (error) => any) {
		if (!isContentUri(path)) {
			return super.enumEntities(path, callback);
		}
		try {
			const folder = getOrSetFolderHelper(path);
			if (!folder) {
				onError?.(new Error('There is no folder existing at path ' + path));
				return;
			}
			const documentFolder = folder.getDocumentFile() as androidx.documentfile.provider.DocumentFile;
			const filesList = documentFolder.listFiles();
			const length = filesList.length;
			let info;
			let retVal;
			let documentFile: androidx.documentfile.provider.DocumentFile;

			for (let i = 0; i < length; i++) {
				documentFile = filesList[i];

				info = {
					path: documentFile.getUri().toString(),
					name: documentFile.getName(),
				};

				if (documentFile.isFile()) {
					info.extension = this.getFileExtension(info.path);
				}

				retVal = callback(info);
				if (retVal === false) {
					break;
				}
			}
		} catch (error) {
			onError?.(wrapNativeException(error));
		}
	}
	fileExists(path: string): boolean {
		if (isContentUri(path)) {
			return org.nativescript.widgets.FileHelper.exists(getApplicationContext(), path);
		}
		return super.fileExists(path);
	}
	folderExists(path: string): boolean {
		if (isContentUri(path)) {
			return org.nativescript.widgets.FolderHelper.exists(getApplicationContext(), path);
		}
		return super.folderExists(path);
	}
	deleteFile(path: string, onError?: (error: any) => any) {
		if (isContentUri(path)) {
			try {
				getOrSetHelper(path).delete(getApplicationContext());
			} catch (e) {
				onError?.(wrapNativeException(e));
			}
		} else {
			super.deleteFile(path, onError);
		}
	}
	deleteFolder(path: string, onError?: (error: any) => any) {
		if (isContentUri(path)) {
			try {
				getOrSetFolderHelper(path).delete(getApplicationContext());
			} catch (e) {
				onError?.(wrapNativeException(e));
			}
		} else {
			super.deleteFolder(path, onError);
		}
	}
	private deleteDocumentUriFolderContent(documentFile: androidx.documentfile.provider.DocumentFile): boolean {
		if (!documentFile.isDirectory()) {
			return false;
		}
		const filesList = documentFile.listFiles();
		if (filesList.length === 0) {
			return true; // Nothing to delete, so success!
		}

		let childFile: androidx.documentfile.provider.DocumentFile;
		let success = false;

		for (let i = 0; i < filesList.length; i++) {
			childFile = filesList[i];
			if (childFile.isDirectory()) {
				success = this.deleteDocumentUriFolderContent(childFile);
				if (!success) {
					break;
				}
			}

			success = childFile.delete();
		}

		return success;
	}
	emptyFolder(path: string, onError?: (error: any) => any): void {
		if (isContentUri(path)) {
			try {
				const documentFile = getOrSetFolderHelper(path)?.getDocumentFile();
				if (!documentFile?.isDirectory()) {
					onError?.(new Error('The specified parameter is not a Folder entity.'));
					return;
				}
				this.deleteDocumentUriFolderContent(documentFile);
			} catch (error) {
				onError?.(wrapNativeException(error));
			}
		} else {
			super.emptyFolder(path, onError);
		}
	}
	rename(path: string, newPath: string, onError?: (error: any) => any): void {
		if (isContentUri(path)) {
			let callback = null;
			if (typeof onError === 'function') {
				callback = new org.nativescript.widgets.FileHelper.Callback({
					onSuccess(result) {},
					onError(ex) {
						onError(wrapNativeException(ex));
					},
				});
			}
			getOrSetHelper(path).renameSync(getApplicationContext(), newPath, callback);
		} else {
			super.rename(path, newPath, onError);
		}
	}

	public renameAsync(path: string, newPath: string): Promise<any> {
		return new Promise<void>((resolve, reject) => {
			getOrSetHelper(path).renameSync(
				getApplicationContext(),
				newPath,
				new org.nativescript.widgets.FileHelper.Callback({
					onSuccess(result) {
						resolve();
					},
					onError: reject,
				}),
			);
		}).catch((ex) => {
			throw wrapNativeException(ex);
		});
	}

	getDocumentsFolderPath(): string {
		return super.getDocumentsFolderPath();
	}
	getTempFolderPath(): string {
		return super.getTempFolderPath();
	}
	getLogicalRootPath(): string {
		return super.getLogicalRootPath();
	}
	getCurrentAppPath(): string {
		return super.getCurrentAppPath();
	}

	appendBuffer = this.appendBufferSync.bind(this);

	appendBufferAsync(path: string, content: any): Promise<void> {
		if (isContentUri(path)) {
			return new Promise<void>((resolve, reject) => {
				getOrSetHelper(path).appendBuffer(
					getApplicationContext(),
					FileSystemAccess.getBuffer(content),
					new org.nativescript.widgets.FileHelper.Callback({
						onSuccess(result) {
							resolve();
						},
						onError: reject,
					}),
				);
			}).catch((ex) => {
				throw wrapNativeException(ex);
			});
		}
		return super.appendAsync(path, content);
	}

	appendBufferSync(path: string, content: any, onError?: (error: any) => any) {
		if (isContentUri(path)) {
			let callback = null;
			if (typeof onError === 'function') {
				callback = new org.nativescript.widgets.FileHelper.Callback({
					onSuccess(result) {},
					onError(ex) {
						onError(wrapNativeException(ex));
					},
				});
			}
			getOrSetHelper(path).appendSync(getApplicationContext(), FileSystemAccess.getBuffer(content), callback);
		} else {
			super.appendSync(path, content, onError);
		}
	}

	append = this.appendSync.bind(this);

	appendAsync(path: string, content: any): Promise<void> {
		if (isContentUri(path)) {
			return new Promise<void>((resolve, reject) => {
				getOrSetHelper(path).append(
					getApplicationContext(),
					content,
					new org.nativescript.widgets.FileHelper.Callback({
						onSuccess(result) {
							resolve();
						},
						onError: reject,
					}),
				);
			}).catch((ex) => {
				throw wrapNativeException(ex);
			});
		}
		return super.appendAsync(path, content);
	}

	appendSync(path: string, content: any, onError?: (error: any) => any) {
		if (isContentUri(path)) {
			let callback = null;
			if (typeof onError === 'function') {
				callback = new org.nativescript.widgets.FileHelper.Callback({
					onSuccess(result) {},
					onError(ex) {
						onError(wrapNativeException(ex));
					},
				});
			}
			getOrSetHelper(path).appendSync(getApplicationContext(), content, callback);
		} else {
			super.appendSync(path, content, onError);
		}
	}

	appendText = this.appendTextSync.bind(this);

	appendTextAsync(path: string, content: string, encoding?: any): Promise<void> {
		if (isContentUri(path)) {
			return new Promise<void>((resolve, reject) => {
				getOrSetHelper(path).appendText(
					getApplicationContext(),
					content,
					encoding ?? null,
					new org.nativescript.widgets.FileHelper.Callback({
						onSuccess(result) {
							resolve();
						},
						onError: reject,
					}),
				);
			}).catch((ex) => {
				throw wrapNativeException(ex);
			});
		}
		return super.appendTextAsync(path, content, encoding);
	}

	appendTextSync(path: string, content: string, onError?: (error: any) => any, encoding?: any) {
		if (isContentUri(path)) {
			let callback = null;
			if (typeof onError === 'function') {
				callback = new org.nativescript.widgets.FileHelper.Callback({
					onSuccess(result) {},
					onError(ex) {
						onError(wrapNativeException(ex));
					},
				});
			}
			getOrSetHelper(path).appendTextSync(getApplicationContext(), content, encoding ?? null, callback);
		} else {
			super.appendTextSync(path, content, onError);
		}
	}

	public readText = this.readTextSync.bind(this);

	readTextAsync(path: string, encoding?: any): Promise<string> {
		if (isContentUri(path)) {
			return new Promise<string>((resolve, reject) => {
				getOrSetHelper(path).readText(
					getApplicationContext(),
					encoding ?? null,
					new org.nativescript.widgets.FileHelper.Callback({
						onSuccess(result) {
							resolve(result);
						},
						onError: reject,
					}),
				);
			}).catch((ex) => {
				throw wrapNativeException(ex);
			});
		}
		return super.readTextAsync(path, encoding);
	}
	readTextSync(path: string, onError?: (error: any) => any, encoding?: any): string {
		if (isContentUri(path)) {
			let callback = null;
			if (typeof onError === 'function') {
				callback = new org.nativescript.widgets.FileHelper.Callback({
					onSuccess(result) {},
					onError(ex) {
						onError(wrapNativeException(ex));
					},
				});
			}
			return getOrSetHelper(path).readTextSync(getApplicationContext(), encoding ?? null, callback);
		} else {
			return super.readTextSync(path, onError, encoding);
		}
	}

	readBuffer = this.readBufferSync.bind(this);

	readBufferAsync(path: string): Promise<any> {
		if (isContentUri(path)) {
			return new Promise((resolve, reject) => {
				getOrSetHelper(path).readBuffer(
					getApplicationContext(),
					new org.nativescript.widgets.FileHelper.Callback({
						onSuccess(result) {
							resolve(result);
						},
						onError: reject,
					}),
				);
			}).catch((ex) => {
				throw wrapNativeException(ex);
			});
		}
		return super.readBufferAsync(path);
	}

	readBufferSync(path: string, onError?: (error: any) => any) {
		if (isContentUri(path)) {
			let callback = null;
			if (typeof onError === 'function') {
				callback = new org.nativescript.widgets.FileHelper.Callback({
					onSuccess(result) {},
					onError(ex) {
						onError(wrapNativeException(ex));
					},
				});
			}
			const ret = getOrSetHelper(path).readBufferSync(getApplicationContext(), callback);
			if (ret) {
				return null;
			}
			return (ArrayBuffer as any).from(ret);
		}
		return super.readBufferSync(path, onError);
	}

	read = this.readSync.bind(this);

	readAsync(path: string): Promise<any> {
		if (isContentUri(path)) {
			return new Promise((resolve, reject) => {
				getOrSetHelper(path).read(
					getApplicationContext(),
					new org.nativescript.widgets.FileHelper.Callback({
						onSuccess(result) {
							resolve(result);
						},
						onError: reject,
					}),
				);
			}).catch((ex) => {
				throw wrapNativeException(ex);
			});
		}
		return super.readAsync(path);
	}

	readSync(path: string, onError?: (error: any) => any) {
		if (isContentUri(path)) {
			let callback = null;
			if (typeof onError === 'function') {
				callback = new org.nativescript.widgets.FileHelper.Callback({
					onSuccess(result) {},
					onError(ex) {
						onError(wrapNativeException(ex));
					},
				});
			}
			return getOrSetHelper(path).readSync(getApplicationContext(), callback);
		}
		return super.readSync(path, onError);
	}

	writeText = this.writeTextSync.bind(this);

	writeTextAsync(path: string, content: string, encoding?: any): Promise<void> {
		if (isContentUri(path)) {
			return new Promise<void>((resolve, reject) => {
				getOrSetHelper(path).writeText(
					getApplicationContext(),
					content,
					encoding ?? null,
					new org.nativescript.widgets.FileHelper.Callback({
						onSuccess(result) {
							resolve();
						},
						onError: reject,
					}),
				);
			}).catch((ex) => {
				throw wrapNativeException(ex);
			});
		}
		return super.writeTextAsync(path, content, encoding);
	}

	writeTextSync(path: string, content: string, onError?: (error: any) => any, encoding?: any) {
		if (isContentUri(path)) {
			let callback = null;
			if (typeof onError === 'function') {
				callback = new org.nativescript.widgets.FileHelper.Callback({
					onSuccess(result) {},
					onError(ex) {
						onError(wrapNativeException(ex));
					},
				});
			}
			getOrSetHelper(path).writeTextSync(getApplicationContext(), content, encoding ?? null, callback);
		} else {
			super.writeTextSync(path, content, onError);
		}
	}

	writeBuffer = this.writeBufferSync.bind(this);

	writeBufferAsync(path: string, content: any): Promise<void> {
		if (isContentUri(path)) {
			return new Promise<void>((resolve, reject) => {
				getOrSetHelper(path).writeBuffer(
					getApplicationContext(),
					FileSystemAccess.getBuffer(content),
					new org.nativescript.widgets.FileHelper.Callback({
						onSuccess(result) {
							resolve();
						},
						onError: reject,
					}),
				);
			}).catch((ex) => {
				throw wrapNativeException(ex);
			});
		}
		return super.writeAsync(path, content);
	}

	writeBufferSync(path: string, content: any, onError?: (error: any) => any) {
		if (isContentUri(path)) {
			let callback = null;
			if (typeof onError === 'function') {
				callback = new org.nativescript.widgets.FileHelper.Callback({
					onSuccess(result) {},
					onError(ex) {
						onError(wrapNativeException(ex));
					},
				});
			}
			getOrSetHelper(path).writeSync(getApplicationContext(), FileSystemAccess.getBuffer(content), callback);
		} else {
			super.writeSync(path, content, onError);
		}
	}

	write = this.writeSync.bind(this);

	writeAsync(path: string, content: any): Promise<void> {
		if (isContentUri(path)) {
			return new Promise<void>((resolve, reject) => {
				getOrSetHelper(path).write(
					getApplicationContext(),
					content,
					new org.nativescript.widgets.FileHelper.Callback({
						onSuccess(result) {
							resolve();
						},
						onError: reject,
					}),
				);
			}).catch((ex) => {
				throw wrapNativeException(ex);
			});
		}
		return super.writeAsync(path, content);
	}

	writeSync(path: string, content: any, onError?: (error: any) => any) {
		if (isContentUri(path)) {
			let callback = null;
			if (typeof onError === 'function') {
				callback = new org.nativescript.widgets.FileHelper.Callback({
					onSuccess(result) {},
					onError(ex) {
						onError(wrapNativeException(ex));
					},
				});
			}
			getOrSetHelper(path).writeSync(getApplicationContext(), content, callback);
		} else {
			super.writeSync(path, content, onError);
		}
	}

	getFileExtension(path: string): string {
		if (isContentUri(path)) {
			return getOrSetHelper(path).getExtension();
		}
		return super.getFileExtension(path);
	}
	getPathSeparator(): string {
		return super.getPathSeparator();
	}
	normalizePath(path: string): string {
		if (isContentUri(path)) {
			return android.net.Uri.parse(path).toString();
		}
		return super.normalizePath(path);
	}
	joinPath(left: string, right: string): string {
		return super.joinPath(left, right);
	}
	joinPaths(paths: string[]): string {
		const [firstPath, ...others] = paths;
		if (isContentUri(firstPath)) {
			// custom SAF uri generation
			const split = firstPath.split('%3A');
			if (split.length === 2) {
				return [[firstPath, 'document', firstPath.split('/').pop()].join('/'), ...others].join('%2F');
			} else {
				return [firstPath, ...others].join('%2F');
			}
		}
		return super.joinPaths(paths);
	}
	contains(path: string, fileName: string): boolean {
		if (isContentUri(path)) {
			return getOrSetFolderHelper(path).containsFileOrFolder(fileName);
		} else {
			const subPath = this.joinPath(path, fileName);

			if (this.fileExists(subPath)) {
				return true;
			}

			return this.folderExists(subPath);
		}
	}
	getOrCreateFile?(
		path: string,
		fileName: string,
		create?: boolean,
	): {
		path: string;
		name: string;
		extension: string;
	} {
		if (isContentUri(path)) {
			const documentFile = getOrSetFolderHelper(path).getOrCreateFile(fileName, create);
			const subPath = documentFile?.getUri()?.toString();
			return documentFile
				? {
						path: subPath,
						name: documentFile.getName(),
						extension: getOrSetHelper(subPath).getExtension(),
					}
				: undefined;
		} else {
			const subPath = this.joinPath(path, fileName);

			return super.getFile(
				subPath,
				(error) => {
					throw error;
				},
				create,
			);
		}
	}
	/**
	 *get a file inside a folder.
	 * @param path folder path.
	 * @param fileName filename to check
	 * Returns boolean
	 */
	getOrCreateFolder?(
		path: string,
		fileName: string,
		create?: boolean,
	): {
		path: string;
		name: string;
	} {
		if (isContentUri(path)) {
			const documentFile = getOrSetFolderHelper(path).getOrCreateFolder(fileName, create);
			return documentFile
				? {
						path: documentFile.getUri().toString(),
						name: documentFile.getName(),
					}
				: undefined;
		} else {
			const subPath = this.joinPath(path, fileName);

			return super.getFolder(
				subPath,
				(error) => {
					throw error;
				},
				create,
			);
		}
	}
}
