import { encoding as textEncoding } from '../text';

function getPathSep(): string {
	return '\\';
}

function getFileName(path: string): string {
	const sep = path.lastIndexOf('\\') !== -1 ? '\\' : '/';
	return path.substring(path.lastIndexOf(sep) + 1);
}

function getExtension(name: string): string {
	const dot = name.lastIndexOf('.');
	return dot >= 0 ? name.substring(dot) : '';
}

export class FileSystemAccess {
	public getLastModified(path: string): Date {
		try {
			const file = Windows.Storage.StorageFile.GetFileFromPathAsync(path) as any;
			return file?.DateCreated ? new Date(file.DateCreated) : new Date();
		} catch {
			return new Date();
		}
	}

	public getFileSize(path: string): number {
		try {
			const props = (Windows.Storage.StorageFile.GetFileFromPathAsync(path) as any)?.GetBasicPropertiesAsync?.();
			return props?.Size ?? 0;
		} catch {
			return 0;
		}
	}

	public getParent(path: string, onError?: (error: any) => any): { path: string; name: string } {
		try {
			const sep = path.lastIndexOf('\\') !== -1 ? '\\' : '/';
			const parentPath = path.substring(0, path.lastIndexOf(sep)) || path;
			const name = getFileName(parentPath);
			return { path: parentPath, name };
		} catch (ex) {
			if (onError) onError(ex);
			return undefined;
		}
	}

	public getFile(path: string, onError?: (error: any) => any): { path: string; name: string; extension: string } {
		try {
			if (!this.fileExists(path)) {
				this._ensureParentDir(path);
				Windows.Storage.PathIO.WriteTextAsync(path, '');
			}
			const name = getFileName(path);
			return { path, name, extension: getExtension(name) };
		} catch (ex) {
			if (onError) onError(ex);
			return undefined;
		}
	}

	public getFolder(path: string, onError?: (error: any) => any): { path: string; name: string } {
		try {
			if (!this.folderExists(path)) {
				Windows.Storage.StorageFolder.GetFolderFromPathAsync(path);
			}
			return { path, name: getFileName(path) };
		} catch (ex) {
			if (onError) onError(ex);
			return undefined;
		}
	}

	public getExistingFolder(path: string, onError?: (error: any) => any): { path: string; name: string } {
		try {
			if (this.folderExists(path)) {
				return { path, name: getFileName(path) };
			}
			return undefined;
		} catch (ex) {
			if (onError) onError(ex);
			return undefined;
		}
	}

	public eachEntity(path: string, onEntity: (file: { path: string; name: string; extension: string }) => any, onError?: (error: any) => any) {
		if (!onEntity) return;
		this._enumEntities(path, onEntity, onError);
	}

	public getEntities(path: string, onError?: (error: any) => any): Array<{ path: string; name: string; extension: string }> {
		const results: Array<{ path: string; name: string; extension: string }> = [];
		let errored = false;
		this._enumEntities(
			path,
			(entity) => {
				results.push(entity);
				return true;
			},
			(err) => {
				if (onError) onError(err);
				errored = true;
			},
		);
		return errored ? null : results;
	}

	public fileExists(path: string): boolean {
		try {
			Windows.Storage.StorageFile.GetFileFromPathAsync(path);
			return true;
		} catch {
			return false;
		}
	}

	public folderExists(path: string): boolean {
		try {
			Windows.Storage.StorageFolder.GetFolderFromPathAsync(path);
			return true;
		} catch {
			return false;
		}
	}

	public deleteFile(path: string, onError?: (error: any) => any) {
		try {
			const file = Windows.Storage.StorageFile.GetFileFromPathAsync(path) as any;
			file?.DeleteAsync?.();
		} catch (ex) {
			if (onError) onError(ex);
		}
	}

	public deleteFolder(path: string, onError?: (error: any) => any) {
		try {
			const folder = Windows.Storage.StorageFolder.GetFolderFromPathAsync(path) as any;
			folder?.DeleteAsync?.();
		} catch (ex) {
			if (onError) onError(ex);
		}
	}

	public emptyFolder(path: string, onError?: (error: any) => any) {
		const entities = this.getEntities(path, onError);
		if (!entities) return;
		for (const entity of entities) {
			try {
				this.deleteFile(entity.path, onError);
			} catch (ex) {
				if (onError) onError(ex);
				return;
			}
		}
	}

	public rename(path: string, newPath: string, onError?: (error: any) => any) {
		try {
			const file = Windows.Storage.StorageFile.GetFileFromPathAsync(path) as any;
			const newName = getFileName(newPath);
			file?.RenameAsync?.(newName);
		} catch (ex) {
			if (onError) onError(new Error(`Failed to rename '${path}' to '${newPath}': ${ex}`));
		}
	}

	public readText = this.readTextSync.bind(this);

	public readTextAsync(path: string, encoding?: any): Promise<string> {
		const enc = encoding ?? textEncoding.UTF_8;
		return new Promise<string>((resolve, reject) => {
			try {
				NSWinRT.toPromise(Windows.Storage.PathIO.ReadTextAsync(path)).then(resolve, reject);
			} catch (ex) {
				reject(new Error(`Failed to read file at path '${path}': ${ex}`));
			}
		});
	}

	public readTextSync(path: string, onError?: (error: any) => any, _encoding?: any): string {
		try {
			let result: string;
			(Windows.Storage.PathIO.ReadTextAsync(path) as any).done((text: string) => {
				result = text;
			});
			return result ?? '';
		} catch (ex) {
			if (onError) onError(new Error(`Failed to read file at path '${path}': ${ex}`));
			return undefined;
		}
	}

	public writeText = this.writeTextSync.bind(this);

	public writeTextAsync(path: string, content: string, _encoding?: any): Promise<void> {
		return new Promise<void>((resolve, reject) => {
			try {
				NSWinRT.toPromise(Windows.Storage.PathIO.WriteTextAsync(path, content)).then(resolve, reject);
			} catch (ex) {
				reject(new Error(`Failed to write file at path '${path}': ${ex}`));
			}
		});
	}

	public writeTextSync(path: string, content: string, onError?: (error: any) => any, _encoding?: any) {
		try {
			(Windows.Storage.PathIO.WriteTextAsync(path, content) as any).done();
		} catch (ex) {
			if (onError) onError(new Error(`Failed to write file at path '${path}': ${ex}`));
		}
	}

	public appendText = this.appendTextSync.bind(this);

	public appendTextAsync(path: string, content: string, _encoding?: any): Promise<void> {
		return new Promise<void>((resolve, reject) => {
			try {
				NSWinRT.toPromise(Windows.Storage.PathIO.AppendTextAsync(path, content)).then(resolve, reject);
			} catch (ex) {
				reject(new Error(`Failed to append to file at path '${path}': ${ex}`));
			}
		});
	}

	public appendTextSync(path: string, content: string, onError?: (error: any) => any, _encoding?: any) {
		try {
			(Windows.Storage.PathIO.AppendTextAsync(path, content) as any).done();
		} catch (ex) {
			if (onError) onError(new Error(`Failed to append to file at path '${path}': ${ex}`));
		}
	}

	public readBuffer = this.readBufferSync.bind(this);

	public readBufferAsync(path: string): Promise<ArrayBuffer> {
		return new Promise<ArrayBuffer>((resolve, reject) => {
			try {
				NSWinRT.toPromise(Windows.Storage.PathIO.ReadBufferAsync(path)).then((buffer: any) => {
					const reader = Windows.Storage.Streams.DataReader.FromBuffer(buffer);
					const bytes = new Uint8Array(buffer.Length);
					reader.ReadBytes(bytes as any);
					resolve(bytes.buffer);
				}, reject);
			} catch (ex) {
				reject(new Error(`Failed to read buffer at path '${path}': ${ex}`));
			}
		});
	}

	public readBufferSync(path: string, onError?: (error: any) => any): ArrayBuffer {
		try {
			let result: ArrayBuffer;
			(Windows.Storage.PathIO.ReadBufferAsync(path) as any).done((buffer: any) => {
				const reader = Windows.Storage.Streams.DataReader.FromBuffer(buffer);
				const bytes = new Uint8Array(buffer.Length);
				reader.ReadBytes(bytes as any);
				result = bytes.buffer;
			});
			return result;
		} catch (ex) {
			if (onError) onError(new Error(`Failed to read buffer at path '${path}': ${ex}`));
			return undefined;
		}
	}

	public writeBuffer = this.writeBufferSync.bind(this);

	public writeBufferAsync(path: string, content: ArrayBuffer): Promise<void> {
		return new Promise<void>((resolve, reject) => {
			try {
				const writer = new Windows.Storage.Streams.DataWriter();
				writer.WriteBytes(new Uint8Array(content) as any);
				const buf = writer.DetachBuffer();
				NSWinRT.toPromise(Windows.Storage.PathIO.WriteBufferAsync(path, buf)).then(resolve, reject);
			} catch (ex) {
				reject(new Error(`Failed to write buffer at path '${path}': ${ex}`));
			}
		});
	}

	public writeBufferSync(path: string, content: ArrayBuffer, onError?: (error: any) => any) {
		try {
			const writer = new Windows.Storage.Streams.DataWriter();
			writer.WriteBytes(new Uint8Array(content) as any);
			const buf = writer.DetachBuffer();
			(Windows.Storage.PathIO.WriteBufferAsync(path, buf) as any).done();
		} catch (ex) {
			if (onError) onError(new Error(`Failed to write buffer at path '${path}': ${ex}`));
		}
	}

	public read = this.readSync.bind(this);

	public readAsync(path: string): Promise<any> {
		return this.readBufferAsync(path);
	}

	public readSync(path: string, onError?: (error: any) => any): any {
		return this.readBufferSync(path, onError);
	}

	public write = this.writeSync.bind(this);

	public writeAsync(path: string, content: any): Promise<void> {
		return this.writeBufferAsync(path, content);
	}

	public writeSync(path: string, content: any, onError?: (error: any) => any) {
		return this.writeBufferSync(path, content, onError);
	}

	public append = this.appendSync.bind(this);

	public appendAsync(path: string, content: any): Promise<void> {
		return new Promise<void>((resolve, reject) => {
			try {
				const writer = new Windows.Storage.Streams.DataWriter();
				writer.WriteBytes(new Uint8Array(content) as any);
				const buf = writer.DetachBuffer();
				NSWinRT.toPromise(Windows.Storage.PathIO.WriteBufferAsync(path, buf)).then(resolve, reject);
			} catch (ex) {
				reject(ex);
			}
		});
	}

	public appendSync(path: string, content: any, onError?: (error: any) => any) {
		try {
			const writer = new Windows.Storage.Streams.DataWriter();
			writer.WriteBytes(new Uint8Array(content) as any);
			const buf = writer.DetachBuffer();
			(Windows.Storage.PathIO.WriteBufferAsync(path, buf) as any).done();
		} catch (ex) {
			if (onError) onError(ex);
		}
	}

	public copy = this.copySync.bind(this);

	public copySync(src: string, dest: string, onError?: (error: any) => any): boolean {
		try {
			const srcFile = Windows.Storage.StorageFile.GetFileFromPathAsync(src) as any;
			const destParent = this.getParent(dest)?.path;
			const destFolder = Windows.Storage.StorageFolder.GetFolderFromPathAsync(destParent) as any;
			const destName = getFileName(dest);
			srcFile?.CopyAsync?.(destFolder, destName, Windows.Storage.NameCollisionOption.ReplaceExisting);
			return true;
		} catch (ex) {
			if (onError) onError(ex);
			return false;
		}
	}

	public copyAsync(src: string, dest: string): Promise<boolean> {
		const destParent = this.getParent(dest)?.path;
		const destName = getFileName(dest);
		return NSWinRT.toPromise(Windows.Storage.StorageFile.GetFileFromPathAsync(src))
			.then((srcFile: any) => NSWinRT.toPromise(Windows.Storage.StorageFolder.GetFolderFromPathAsync(destParent))
				.then((destFolder: any) => NSWinRT.toPromise(srcFile.CopyAsync(destFolder, destName, Windows.Storage.NameCollisionOption.ReplaceExisting)))
			)
			.then(() => true);
	}

	public getPathSeparator(): string {
		return getPathSep();
	}

	public normalizePath(path: string): string {
		return path.replace(/\//g, '\\');
	}

	public joinPath(left: string, right: string): string {
		const l = left.endsWith('\\') || left.endsWith('/') ? left.slice(0, -1) : left;
		const r = right.startsWith('\\') || right.startsWith('/') ? right.slice(1) : right;
		return `${l}\\${r}`;
	}

	// Single string[] arg (matches the interface and how path.join calls it). A rest param made the
	// array arrive as [[a,b]], so reduce returned it unchanged and path.join produced an array.
	public joinPaths(paths: string[]): string {
		if (!paths || paths.length === 0) {
			return '';
		}
		return paths.reduce((acc, p) => this.joinPath(acc, p));
	}

	public getDocumentsFolderPath(): string {
		try {
			return Windows.Storage.ApplicationData.Current.LocalFolder.Path;
		} catch {
			return '';
		}
	}

	public getExternalDocumentsFolderPath(): string {
		return this.getDocumentsFolderPath();
	}

	public getTempFolderPath(): string {
		try {
			return Windows.Storage.ApplicationData.Current.TemporaryFolder.Path;
		} catch {
			return '';
		}
	}

	public getCurrentAppPath(): string {
		try {
			return Windows.ApplicationModel.Package.Current.InstalledLocation.Path;
		} catch {
			if (!global.__dirname) {
				global.__dirname = typeof __dirname !== 'undefined' ? __dirname : '';
			}
			return global.__dirname;
		}
	}

	public getLogicalRootPath(): string {
		return this.getCurrentAppPath();
	}

	private _ensureParentDir(path: string): void {
		const parent = this.getParent(path)?.path;
		if (parent && !this.folderExists(parent)) {
			try {
				const parts = parent.split('\\');
				let current = parts[0];
				for (let i = 1; i < parts.length; i++) {
					current += '\\' + parts[i];
					if (!this.folderExists(current)) {
						(Windows.Storage.StorageFolder.GetFolderFromPathAsync(current) as any);
					}
				}
			} catch {}
		}
	}

	private _enumEntities(path: string, onEntity: (file: { path: string; name: string; extension: string }) => any, onError?: (error: any) => any) {
		try {
			(Windows.Storage.StorageFolder.GetFolderFromPathAsync(path) as any).done((folder: any) => {
				(folder.GetItemsAsync() as any).done((items: any) => {
					for (let i = 0; i < items.Size; i++) {
						const item = items.GetAt(i);
						const name = item.Name;
						const itemPath = item.Path;
						const cont = onEntity({ path: itemPath, name, extension: getExtension(name) });
						if (cont === false) break;
					}
				});
			});
		} catch (ex) {
			if (onError) onError(ex);
		}
	}
}
