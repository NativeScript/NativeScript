import * as textModule from '../text';
import { getNativeApplication } from '../application';

let applicationContext: android.content.Context;
function getApplicationContext() {
	if (!applicationContext) {
		applicationContext = (<android.app.Application>getNativeApplication()).getApplicationContext();
	}

	return applicationContext;
}

export class FileSystemAccess {
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

	public getFile(path: string, onError?: (error: any) => any): { path: string; name: string; extension: string } {
		return this.ensureFile(new java.io.File(path), false, onError);
	}

	public getFolder(path: string, onError?: (error: any) => any): { path: string; name: string } {
		const javaFile = new java.io.File(path);
		const dirInfo = this.ensureFile(javaFile, true, onError);
		if (!dirInfo) {
			return undefined;
		}

		return { path: dirInfo.path, name: dirInfo.name };
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
		} catch (exception) {
			if (onError) {
				onError(exception);
			}
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
		} catch (exception) {
			if (onError) {
				onError(exception);
			}
		}
	}

	public emptyFolder(path: string, onError?: (error: any) => any) {
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
		} catch (exception) {
			if (onError) {
				onError(exception);
			}
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
							reject(new Error(err));
						},
					}),
					null
				);
			} catch (ex) {
				reject(ex);
			}
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
		} catch (exception) {
			if (onError) {
				onError(exception);
			}
		}
	}

	public write = this.writeSync.bind(this);

	public writeAsync(path: string, bytes: native.Array<number>): Promise<void> {
		return new Promise<void>((resolve, reject) => {
			try {
				org.nativescript.widgets.Async.File.write(
					path,
					bytes,
					new org.nativescript.widgets.Async.CompleteCallback({
						onComplete: () => {
							resolve();
						},
						onError: (err) => {
							reject(new Error(err));
						},
					}),
					null
				);
			} catch (ex) {
				reject(ex);
			}
		});
	}

	public writeSync(path: string, bytes: native.Array<number>, onError?: (error: any) => any) {
		try {
			const javaFile = new java.io.File(path);
			const stream = new java.io.FileOutputStream(javaFile);
			stream.write(bytes, 0, bytes.length);
			stream.close();
		} catch (exception) {
			if (onError) {
				onError(exception);
			}
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
						onError: (err) => {
							reject(new Error(err));
						},
					}),
					null
				);
			} catch (ex) {
				reject(ex);
			}
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
			while (true) {
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
		} catch (exception) {
			if (onError) {
				onError(exception);
			}
		}
	}

	private static _removeUtf8Bom(s: string): string {
		if (s.charCodeAt(0) === 0xfeff) {
			s = s.slice(1);
			//console.log("Removed UTF8 BOM.");
		}

		return s;
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
						onError: (err) => {
							reject(new Error(err));
						},
					}),
					null
				);
			} catch (ex) {
				reject(ex);
			}
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
		} catch (exception) {
			if (onError) {
				onError(exception);
			}
		}
	}

	private deleteFolderContent(file: java.io.File): boolean {
		const filesList = file.listFiles();
		if (filesList.length === 0) {
			return true; // Nothing to delete, so success!
		}

		let childFile: java.io.File;
		let success: boolean = false;

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
					// TODO: unified approach for error messages
					if (onError) {
						onError('Failed to create new java File for path ' + javaFile.getAbsolutePath());
					}

					return undefined;
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
		} catch (exception) {
			// TODO: unified approach for error messages
			if (onError) {
				onError(exception);
			}

			return undefined;
		}
	}

	// TODO: This method is the same as in the iOS implementation.
	// Make it in a separate file / module so it can be reused from both implementations.
	public getFileExtension(path: string): string {
		const dotIndex = path.lastIndexOf('.');
		if (dotIndex && dotIndex >= 0 && dotIndex < path.length) {
			return path.substring(dotIndex);
		}

		return '';
	}

	private enumEntities(path: string, callback: (entity: { path: string; name: string; extension: string }) => boolean, onError?: (error) => any) {
		try {
			let javaFile = new java.io.File(path);
			if (!javaFile.getCanonicalFile().isDirectory()) {
				if (onError) {
					onError('There is no folder existing at path ' + path);
				}

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
		} catch (exception) {
			if (onError) {
				onError(exception);
			}
		}
	}

	public getPathSeparator(): string {
		return this._pathSeparator;
	}

	public normalizePath(path: string): string {
		const file = new java.io.File(path);

		return file.getAbsolutePath();
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
