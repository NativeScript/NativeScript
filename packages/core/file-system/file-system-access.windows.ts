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

// StorageFile/StorageFolder want backslashes and no trailing separator (except on a drive root).
function toStoragePath(path: string): string {
	const p = path.replace(/\//g, '\\');
	return p.length > 3 && p.endsWith('\\') ? p.slice(0, -1) : p;
}

function getParentPath(path: string): string {
	const p = toStoragePath(path);
	const i = p.lastIndexOf('\\');
	if (i < 0) {
		return '';
	}
	// Keep the separator of a drive root ("C:\").
	return i === 2 && p[1] === ':' ? p.substring(0, 3) : p.substring(0, i);
}

// Upper bound for the *Sync members, which block on WinRT async operations.
const SYNC_TIMEOUT_MS = 30000;

const enum AsyncStatus {
	Started = 0,
	Completed = 1,
	Canceled = 2,
	Error = 3,
}

function winrtError(code: any): Error {
	if (code instanceof Error) {
		return code;
	}
	const hr = typeof code === 'number' ? code : Number(code?.Value);
	return new Error(Number.isNaN(hr) ? 'WinRT async operation failed' : `WinRT async operation failed (HRESULT 0x${(hr >>> 0).toString(16).padStart(8, '0')})`);
}

// Blocks until a WinRT IAsyncOperation/IAsyncAction settles and returns its result. A failed
// operation throws its HRESULT; GetResults is only called on success. Polls Status instead of
// NSWinRT.wait, which pumps messages and would re-enter JS mid-call: storage operations
// complete on the thread pool.
function awaitSync<T = any>(op: any): T {
	const deadline = Date.now() + SYNC_TIMEOUT_MS;
	while (Number(op.Status) === AsyncStatus.Started && Date.now() < deadline) {
		// spin
	}
	switch (Number(op.Status)) {
		case AsyncStatus.Completed:
			return op.GetResults();
		case AsyncStatus.Canceled:
			throw new Error('WinRT async operation was canceled');
		case AsyncStatus.Error:
			throw winrtError(op.ErrorCode);
		default:
			throw new Error(`WinRT async operation did not complete within ${SYNC_TIMEOUT_MS}ms`);
	}
}

function awaitAsync<T = any>(op: any): Promise<T> {
	return NSWinRT.toPromise(op).catch((err: any) => {
		throw winrtError(err);
	}) as Promise<T>;
}

// A WinRT DateTime: a Date, or { UniversalTime } in 100ns ticks since 1601-01-01.
function toDate(value: any): Date {
	if (value instanceof Date) {
		return value;
	}
	const ticks = Number(value?.UniversalTime ?? value);
	return new Date(ticks / 10000 - 11644473600000);
}

function toBytes(content: ArrayBuffer | ArrayBufferView): Uint8Array {
	if (content instanceof Uint8Array) {
		return content;
	}
	if (ArrayBuffer.isView(content)) {
		return new Uint8Array(content.buffer, content.byteOffset, content.byteLength);
	}
	return new Uint8Array(content);
}

function toIBuffer(content: ArrayBuffer | ArrayBufferView): any {
	const writer = new Windows.Storage.Streams.DataWriter();
	writer.WriteBytes(toBytes(content) as any);
	return writer.DetachBuffer();
}

function fromIBuffer(buffer: any): ArrayBuffer {
	const bytes = new Uint8Array(buffer.Length);
	Windows.Storage.Streams.DataReader.FromBuffer(buffer).ReadBytes(bytes as any);
	return bytes.buffer;
}

function isFolder(item: any): boolean {
	return item.IsOfType(Windows.Storage.StorageItemTypes.Folder);
}

export class FileSystemAccess {
	public getLastModified(path: string): Date {
		const item = this._getItem(path);
		if (!item) {
			return new Date();
		}
		return toDate(awaitSync(item.GetBasicPropertiesAsync()).DateModified);
	}

	public getFileSize(path: string): number {
		const item = this._getItem(path);
		if (!item || isFolder(item)) {
			return 0;
		}
		return Number(awaitSync(item.GetBasicPropertiesAsync()).Size);
	}

	public getParent(path: string, onError?: (error: any) => any): { path: string; name: string } {
		try {
			const parentPath = getParentPath(path) || path;
			return { path: parentPath, name: getFileName(parentPath) };
		} catch (ex) {
			if (onError) onError(ex);
			return undefined;
		}
	}

	public getFile(path: string, onError?: (error: any) => any): { path: string; name: string; extension: string } {
		try {
			if (!this.fileExists(path)) {
				const folder = this._ensureFolder(getParentPath(path));
				awaitSync(folder.CreateFileAsync(getFileName(toStoragePath(path)), Windows.Storage.CreationCollisionOption.OpenIfExists));
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
			this._ensureFolder(path);
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
		const item = this._getItem(path);
		return !!item && !isFolder(item);
	}

	public folderExists(path: string): boolean {
		const item = this._getItem(path);
		return !!item && isFolder(item);
	}

	public deleteFile(path: string, onError?: (error: any) => any) {
		try {
			const file = awaitSync(Windows.Storage.StorageFile.GetFileFromPathAsync(toStoragePath(path)));
			awaitSync(file.DeleteAsync(Windows.Storage.StorageDeleteOption.PermanentDelete));
		} catch (ex) {
			if (onError) onError(ex);
		}
	}

	public deleteFolder(path: string, onError?: (error: any) => any) {
		try {
			const folder = awaitSync(Windows.Storage.StorageFolder.GetFolderFromPathAsync(toStoragePath(path)));
			awaitSync(folder.DeleteAsync(Windows.Storage.StorageDeleteOption.PermanentDelete));
		} catch (ex) {
			if (onError) onError(ex);
		}
	}

	public emptyFolder(path: string, onError?: (error: any) => any) {
		try {
			const folder = awaitSync(Windows.Storage.StorageFolder.GetFolderFromPathAsync(toStoragePath(path)));
			const items = awaitSync(folder.GetItemsAsync());
			for (let i = 0; i < items.Size; i++) {
				awaitSync(items.GetAt(i).DeleteAsync(Windows.Storage.StorageDeleteOption.PermanentDelete));
			}
		} catch (ex) {
			if (onError) onError(ex);
		}
	}

	public rename(path: string, newPath: string, onError?: (error: any) => any) {
		try {
			const item = this._getItem(path);
			if (!item) {
				throw new Error(`No file or folder at '${path}'`);
			}
			const newName = getFileName(toStoragePath(newPath));
			const newParent = getParentPath(newPath);
			const fail = Windows.Storage.NameCollisionOption.FailIfExists;
			if (newParent.toLowerCase() === getParentPath(path).toLowerCase()) {
				awaitSync(item.RenameAsync(newName, fail));
			} else if (!isFolder(item)) {
				const folder = awaitSync(Windows.Storage.StorageFolder.GetFolderFromPathAsync(newParent));
				awaitSync(item.MoveAsync(folder, newName, fail));
			} else {
				throw new Error('Moving a folder to another folder is not supported');
			}
		} catch (ex) {
			if (onError) onError(new Error(`Failed to rename '${path}' to '${newPath}': ${ex?.message ?? ex}`));
		}
	}

	public getFileExtension(path: string): string {
		return getExtension(getFileName(path));
	}

	public readText = this.readTextSync.bind(this);

	public readTextAsync(path: string, _encoding?: any): Promise<string> {
		return awaitAsync<string>(Windows.Storage.PathIO.ReadTextAsync(toStoragePath(path))).catch((ex) => {
			throw new Error(`Failed to read file at path '${path}': ${ex.message}`);
		});
	}

	public readTextSync(path: string, onError?: (error: any) => any, _encoding?: any): string {
		try {
			return awaitSync<string>(Windows.Storage.PathIO.ReadTextAsync(toStoragePath(path)));
		} catch (ex) {
			if (onError) onError(new Error(`Failed to read file at path '${path}': ${ex.message}`));
			return undefined;
		}
	}

	public writeText = this.writeTextSync.bind(this);

	public writeTextAsync(path: string, content: string, _encoding?: any): Promise<void> {
		return this._openFileAsync(path)
			.then((file) => awaitAsync<void>(Windows.Storage.FileIO.WriteTextAsync(file, content)))
			.catch((ex) => {
				throw new Error(`Failed to write file at path '${path}': ${ex.message}`);
			});
	}

	public writeTextSync(path: string, content: string, onError?: (error: any) => any, _encoding?: any) {
		try {
			awaitSync(Windows.Storage.FileIO.WriteTextAsync(this._openFile(path), content));
		} catch (ex) {
			if (onError) onError(new Error(`Failed to write file at path '${path}': ${ex.message}`));
		}
	}

	public appendText = this.appendTextSync.bind(this);

	public appendTextAsync(path: string, content: string, _encoding?: any): Promise<void> {
		return this._openFileAsync(path)
			.then((file) => awaitAsync<void>(Windows.Storage.FileIO.AppendTextAsync(file, content)))
			.catch((ex) => {
				throw new Error(`Failed to append to file at path '${path}': ${ex.message}`);
			});
	}

	public appendTextSync(path: string, content: string, onError?: (error: any) => any, _encoding?: any) {
		try {
			awaitSync(Windows.Storage.FileIO.AppendTextAsync(this._openFile(path), content));
		} catch (ex) {
			if (onError) onError(new Error(`Failed to append to file at path '${path}': ${ex.message}`));
		}
	}

	public readBuffer = this.readBufferSync.bind(this);

	public readBufferAsync(path: string): Promise<ArrayBuffer> {
		return awaitAsync(Windows.Storage.PathIO.ReadBufferAsync(toStoragePath(path)))
			.then(fromIBuffer)
			.catch((ex) => {
				throw new Error(`Failed to read buffer at path '${path}': ${ex.message}`);
			});
	}

	public readBufferSync(path: string, onError?: (error: any) => any): ArrayBuffer {
		try {
			return fromIBuffer(awaitSync(Windows.Storage.PathIO.ReadBufferAsync(toStoragePath(path))));
		} catch (ex) {
			if (onError) onError(new Error(`Failed to read buffer at path '${path}': ${ex.message}`));
			return undefined;
		}
	}

	public writeBuffer = this.writeBufferSync.bind(this);

	public writeBufferAsync(path: string, content: ArrayBuffer | ArrayBufferView): Promise<void> {
		return this._openFileAsync(path)
			.then((file) => awaitAsync<void>(Windows.Storage.FileIO.WriteBufferAsync(file, toIBuffer(content))))
			.catch((ex) => {
				throw new Error(`Failed to write buffer at path '${path}': ${ex.message}`);
			});
	}

	public writeBufferSync(path: string, content: ArrayBuffer | ArrayBufferView, onError?: (error: any) => any) {
		try {
			awaitSync(Windows.Storage.FileIO.WriteBufferAsync(this._openFile(path), toIBuffer(content)));
		} catch (ex) {
			if (onError) onError(new Error(`Failed to write buffer at path '${path}': ${ex.message}`));
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

	public appendBuffer = this.appendBufferSync.bind(this);

	public appendBufferAsync(path: string, content: ArrayBuffer | ArrayBufferView): Promise<void> {
		return this._openFileAsync(path)
			.then((file) => awaitAsync(file.OpenAsync(Windows.Storage.FileAccessMode.ReadWrite)))
			.then((stream: any) => {
				stream.Seek(stream.Size);
				return awaitAsync(stream.WriteAsync(toIBuffer(content)))
					.then(() => awaitAsync(stream.FlushAsync()))
					.finally(() => stream.Close());
			})
			.then(() => undefined)
			.catch((ex) => {
				throw new Error(`Failed to append to file at path '${path}': ${ex.message}`);
			});
	}

	public appendBufferSync(path: string, content: ArrayBuffer | ArrayBufferView, onError?: (error: any) => any) {
		try {
			const stream = awaitSync(this._openFile(path).OpenAsync(Windows.Storage.FileAccessMode.ReadWrite));
			try {
				stream.Seek(stream.Size);
				awaitSync(stream.WriteAsync(toIBuffer(content)));
				awaitSync(stream.FlushAsync());
			} finally {
				stream.Close();
			}
		} catch (ex) {
			if (onError) onError(new Error(`Failed to append to file at path '${path}': ${ex.message}`));
		}
	}

	public append = this.appendSync.bind(this);

	public appendAsync(path: string, content: any): Promise<void> {
		return this.appendBufferAsync(path, content);
	}

	public appendSync(path: string, content: any, onError?: (error: any) => any) {
		return this.appendBufferSync(path, content, onError);
	}

	public copy = this.copySync.bind(this);

	public copySync(src: string, dest: string, onError?: (error: any) => any): boolean {
		try {
			const srcFile = awaitSync(Windows.Storage.StorageFile.GetFileFromPathAsync(toStoragePath(src)));
			const destFolder = awaitSync(Windows.Storage.StorageFolder.GetFolderFromPathAsync(getParentPath(dest)));
			awaitSync(srcFile.CopyAsync(destFolder, getFileName(toStoragePath(dest)), Windows.Storage.NameCollisionOption.ReplaceExisting));
			return true;
		} catch (ex) {
			if (onError) onError(ex);
			return false;
		}
	}

	public copyAsync(src: string, dest: string): Promise<boolean> {
		const destName = getFileName(toStoragePath(dest));
		return Promise.all([awaitAsync(Windows.Storage.StorageFile.GetFileFromPathAsync(toStoragePath(src))), awaitAsync(Windows.Storage.StorageFolder.GetFolderFromPathAsync(getParentPath(dest)))])
			.then(([srcFile, destFolder]: any[]) => awaitAsync(srcFile.CopyAsync(destFolder, destName, Windows.Storage.NameCollisionOption.ReplaceExisting)))
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

	// The app ships in the package's app\ folder (ms-appx:///app/), so ~/ resolves there,
	// as on iOS (<bundle>/app) and Android (files/app).
	public getCurrentAppPath(): string {
		try {
			return Windows.ApplicationModel.Package.Current.InstalledLocation.Path + '\\app';
		} catch {
			if (!global.__dirname) {
				global.__dirname = typeof __dirname !== 'undefined' ? __dirname : '';
			}
			return global.__dirname;
		}
	}

	public getLogicalRootPath(): string {
		try {
			return Windows.ApplicationModel.Package.Current.InstalledLocation.Path;
		} catch {
			return this.getCurrentAppPath();
		}
	}

	// The file or folder at `path`, or null when there is none. Looks the name up in its parent
	// with TryGetItemAsync, which resolves null for a missing child instead of failing.
	private _getItem(path: string): any {
		if (!path) {
			return null;
		}
		const target = toStoragePath(path);
		const parent = getParentPath(target);
		try {
			if (!parent || parent === target) {
				return awaitSync(Windows.Storage.StorageFolder.GetFolderFromPathAsync(target));
			}
			const folder = awaitSync(Windows.Storage.StorageFolder.GetFolderFromPathAsync(parent));
			return awaitSync(folder.TryGetItemAsync(getFileName(target)));
		} catch {
			return null;
		}
	}

	// The folder at `path`, creating it and any missing ancestors.
	private _ensureFolder(path: string): any {
		const target = toStoragePath(path);
		const existing = this._getItem(target);
		if (existing && isFolder(existing)) {
			return existing;
		}
		const parent = getParentPath(target);
		if (!parent || parent === target) {
			throw new Error(`Cannot create folder '${path}'`);
		}
		return awaitSync(this._ensureFolder(parent).CreateFolderAsync(getFileName(target), Windows.Storage.CreationCollisionOption.OpenIfExists));
	}

	// The file at `path`, created if missing (its folder must exist).
	private _openFile(path: string): any {
		const target = toStoragePath(path);
		const folder = awaitSync(Windows.Storage.StorageFolder.GetFolderFromPathAsync(getParentPath(target)));
		return awaitSync(folder.CreateFileAsync(getFileName(target), Windows.Storage.CreationCollisionOption.OpenIfExists));
	}

	private _openFileAsync(path: string): Promise<any> {
		const target = toStoragePath(path);
		return awaitAsync(Windows.Storage.StorageFolder.GetFolderFromPathAsync(getParentPath(target))).then((folder: any) => awaitAsync(folder.CreateFileAsync(getFileName(target), Windows.Storage.CreationCollisionOption.OpenIfExists)));
	}

	private _enumEntities(path: string, onEntity: (file: { path: string; name: string; extension: string }) => any, onError?: (error: any) => any) {
		try {
			const folder = awaitSync(Windows.Storage.StorageFolder.GetFolderFromPathAsync(toStoragePath(path)));
			const items = awaitSync(folder.GetItemsAsync());
			for (let i = 0; i < items.Size; i++) {
				const item = items.GetAt(i);
				const name = item.Name;
				// Folder.getEntities classifies by extension, so a folder never reports one.
				const cont = onEntity({ path: item.Path, name, extension: isFolder(item) ? '' : getExtension(name) });
				if (cont === false) break;
			}
		} catch (ex) {
			if (onError) onError(ex);
		}
	}
}

// stub to avoid cross platform warning (file-system/index.ts imports it on every platform)
export class FileSystemAccess29 extends FileSystemAccess {}
