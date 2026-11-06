import { outPointer } from '../utils/gtk.linux';
// File access on GLib/GIO. Whole-file reads hand out zero-copy ArrayBuffers (freed with g_free).

type Entity = { path: string; name: string; extension: string };

function nameOf(path: string): string {
	const trimmed = path.length > 1 ? path.replace(/\/+$/, '') : path;
	return trimmed.substring(trimmed.lastIndexOf('/') + 1);
}

function extensionOf(name: string): string {
	const dot = name.lastIndexOf('.');
	return dot > 0 ? name.substring(dot) : '';
}

function parentOf(path: string): string {
	const trimmed = path.length > 1 ? path.replace(/\/+$/, '') : path;
	const i = trimmed.lastIndexOf('/');
	return i <= 0 ? '/' : trimmed.substring(0, i);
}

/** Runs a GError-reporting call; throws the GError's message. */
function check<T>(call: (error: any) => T, failed: (result: T) => boolean): T {
	const error = outPointer();
	const result = call(error);
	if (error.value) {
		const gerror: any = new interop.Reference(_GError, error.value).value;
		const message = gerror.message ? interop.stringFromCString(gerror.message as any) : 'unknown error';
		g_error_free(error.value);
		throw new Error(message);
	}
	if (failed(result)) {
		throw new Error('operation failed');
	}
	return result;
}

function appName(): string {
	return g_get_prgname() || 'nativescript-app';
}

function fail(onError: ((error: any) => any) | undefined, error: any) {
	if (onError) {
		onError(error);
	} else {
		throw error;
	}
}

function toBytes(content: ArrayBuffer | ArrayBufferView): Uint8Array {
	return content instanceof ArrayBuffer ? new Uint8Array(content) : new Uint8Array(content.buffer, content.byteOffset, content.byteLength);
}

export class FileSystemAccess {
	private _queryInfo(path: string): any {
		const file = g_file_new_for_path(path);
		try {
			return check(
				(error) => g_file_query_info(file, 'standard::size,time::modified', 0, null, error),
				(info) => !info,
			);
		} finally {
			g_object_unref(file);
		}
	}

	public getLastModified(path: string): Date {
		const info = this._queryInfo(path);
		const seconds = Number(g_file_info_get_attribute_uint64(info, 'time::modified'));
		g_object_unref(info);
		return new Date(seconds * 1000);
	}

	public getFileSize(path: string): number {
		const info = this._queryInfo(path);
		const size = Number(g_file_info_get_size(info));
		g_object_unref(info);
		return size;
	}

	public getParent(path: string, onError?: (error: any) => any): { path: string; name: string } {
		const parent = parentOf(path);
		return { path: parent, name: nameOf(parent) };
	}

	public getFile(path: string, onError?: (error: any) => any): Entity {
		try {
			if (!this.fileExists(path)) {
				g_mkdir_with_parents(parentOf(path), 0o755);
				this._write(path, new Uint8Array(0));
			}
			const name = nameOf(path);
			return { path, name, extension: extensionOf(name) };
		} catch (e) {
			fail(onError, e);
			return undefined;
		}
	}

	public getFolder(path: string, onError?: (error: any) => any): { path: string; name: string } {
		if (g_mkdir_with_parents(path, 0o755) !== 0) {
			fail(onError, new Error(`Cannot create folder '${path}'`));
			return undefined;
		}
		return { path, name: nameOf(path) };
	}

	public getExistingFolder(path: string, onError?: (error: any) => any): { path: string; name: string } {
		if (!this.folderExists(path)) {
			fail(onError, new Error(`Folder '${path}' does not exist`));
			return undefined;
		}
		return { path, name: nameOf(path) };
	}

	public eachEntity(path: string, onEntity: (file: Entity) => any, onError?: (error: any) => any) {
		let dir: any;
		try {
			dir = check(
				(error) => g_dir_open(path, 0, error),
				(d) => !d,
			);
		} catch (e) {
			fail(onError, e);
			return;
		}
		try {
			for (let entry = g_dir_read_name(dir); entry; entry = g_dir_read_name(dir)) {
				const name = typeof entry === 'string' ? entry : interop.stringFromCString(entry as any);
				const child = this.joinPath(path, name);
				const isDir = !!g_file_test(child, GFileTest.IS_DIR);
				if (onEntity({ path: child, name, extension: isDir ? '' : extensionOf(name) }) === false) {
					break;
				}
			}
		} finally {
			g_dir_close(dir);
		}
	}

	public getEntities(path: string, onError?: (error: any) => any): Array<Entity> {
		const entities: Entity[] = [];
		this.eachEntity(path, (e) => (entities.push(e), true), onError);
		return entities;
	}

	public fileExists(path: string): boolean {
		return !!path && !!g_file_test(path, GFileTest.IS_REGULAR);
	}

	public folderExists(path: string): boolean {
		return !!path && !!g_file_test(path, GFileTest.IS_DIR);
	}

	private _delete(path: string) {
		const file = g_file_new_for_path(path);
		try {
			check(
				(error) => g_file_delete(file, null, error),
				(ok) => !ok,
			);
		} finally {
			g_object_unref(file);
		}
	}

	public deleteFile(path: string, onError?: (error: any) => any) {
		try {
			this._delete(path);
		} catch (e) {
			fail(onError, e);
		}
	}

	public deleteFolder(path: string, onError?: (error: any) => any) {
		try {
			this.emptyFolder(path);
			this._delete(path);
		} catch (e) {
			fail(onError, e);
		}
	}

	public emptyFolder(path: string, onError?: (error: any) => any) {
		try {
			for (const entity of this.getEntities(path)) {
				if (this.folderExists(entity.path)) {
					this.deleteFolder(entity.path);
				} else {
					this.deleteFile(entity.path);
				}
			}
		} catch (e) {
			fail(onError, e);
		}
	}

	public rename(path: string, newPath: string, onError?: (error: any) => any) {
		const from = g_file_new_for_path(path);
		const to = g_file_new_for_path(newPath);
		try {
			check(
				(error) => g_file_move(from, to, 0 as any, null, null, null, error),
				(ok) => !ok,
			);
		} catch (e) {
			fail(onError, e);
		} finally {
			g_object_unref(from);
			g_object_unref(to);
		}
	}

	public getFileExtension(path: string): string {
		return extensionOf(nameOf(path));
	}

	public readBufferSync(path: string, onError?: (error: any) => any): ArrayBuffer {
		try {
			const contents = outPointer();
			const length = new interop.Reference(interop.types.uint64, 0);
			check(
				(error) => g_file_get_contents(path, contents, length, error),
				(ok) => !ok,
			);
			const size = Number(length.value);
			if (size === 0) {
				g_free(contents.value);
				return new ArrayBuffer(0);
			}
			return interop.bufferFromData(contents.value, size, g_free);
		} catch (e) {
			fail(onError, e);
			return undefined;
		}
	}

	public readBufferAsync(path: string): Promise<ArrayBuffer> {
		return new Promise((resolve, reject) => setTimeout(() => resolve(this.readBufferSync(path, reject))));
	}

	public readTextSync(path: string, onError?: (error: any) => any, _encoding?: any): string {
		const buffer = this.readBufferSync(path, onError);
		return buffer ? new TextDecoder().decode(buffer) : undefined;
	}

	public readTextAsync(path: string, encoding?: any): Promise<string> {
		return this.readBufferAsync(path).then((buffer) => new TextDecoder().decode(buffer));
	}

	public readSync(path: string, onError?: (error: any) => any): any {
		return this.readBufferSync(path, onError);
	}

	public readAsync(path: string): Promise<any> {
		return this.readBufferAsync(path);
	}

	private _write(path: string, bytes: Uint8Array) {
		check(
			(error) => g_file_set_contents(path, bytes as any, bytes.byteLength, error),
			(ok) => !ok,
		);
	}

	private _append(path: string, bytes: Uint8Array) {
		const file = g_file_new_for_path(path);
		try {
			const stream: any = check(
				(error) => g_file_append_to(file, 0 as any, null, error),
				(s) => !s,
			);
			try {
				check(
					(error) => g_output_stream_write_all(stream, bytes as any, bytes.byteLength, null, null, error),
					(ok) => !ok,
				);
				check(
					(error) => g_output_stream_close(stream, null, error),
					(ok) => !ok,
				);
			} finally {
				g_object_unref(stream);
			}
		} finally {
			g_object_unref(file);
		}
	}

	public writeBufferSync(path: string, content: ArrayBuffer | ArrayBufferView, onError?: (error: any) => any) {
		try {
			this._write(path, toBytes(content));
		} catch (e) {
			fail(onError, e);
		}
	}

	public writeBufferAsync(path: string, content: ArrayBuffer | ArrayBufferView): Promise<void> {
		return new Promise((resolve, reject) => setTimeout(() => (this.writeBufferSync(path, content, reject), resolve())));
	}

	public writeTextSync(path: string, content: string, onError?: (error: any) => any, _encoding?: any) {
		this.writeBufferSync(path, new TextEncoder().encode(content), onError);
	}

	public writeTextAsync(path: string, content: string, _encoding?: any): Promise<void> {
		return this.writeBufferAsync(path, new TextEncoder().encode(content));
	}

	public writeSync(path: string, content: any, onError?: (error: any) => any) {
		this.writeBufferSync(path, content, onError);
	}

	public writeAsync(path: string, content: any): Promise<void> {
		return this.writeBufferAsync(path, content);
	}

	public appendBufferSync(path: string, content: ArrayBuffer | ArrayBufferView, onError?: (error: any) => any) {
		try {
			this._append(path, toBytes(content));
		} catch (e) {
			fail(onError, e);
		}
	}

	public appendBufferAsync(path: string, content: ArrayBuffer | ArrayBufferView): Promise<void> {
		return new Promise((resolve, reject) => setTimeout(() => (this.appendBufferSync(path, content, reject), resolve())));
	}

	public appendTextSync(path: string, content: string, onError?: (error: any) => any, _encoding?: any) {
		this.appendBufferSync(path, new TextEncoder().encode(content), onError);
	}

	public appendTextAsync(path: string, content: string, _encoding?: any): Promise<void> {
		return this.appendBufferAsync(path, new TextEncoder().encode(content));
	}

	public appendSync(path: string, content: any, onError?: (error: any) => any) {
		this.appendBufferSync(path, content, onError);
	}

	public appendAsync(path: string, content: any): Promise<void> {
		return this.appendBufferAsync(path, content);
	}

	public copySync(src: string, dest: string, onError?: (error: any) => any): boolean {
		const from = g_file_new_for_path(src);
		const to = g_file_new_for_path(dest);
		try {
			// G_FILE_COPY_OVERWRITE
			check(
				(error) => g_file_copy(from, to, 1 as any, null, null, null, error),
				(ok) => !ok,
			);
			return true;
		} catch (e) {
			fail(onError, e);
			return false;
		} finally {
			g_object_unref(from);
			g_object_unref(to);
		}
	}

	public copyAsync(src: string, dest: string): Promise<boolean> {
		return new Promise((resolve, reject) => setTimeout(() => resolve(this.copySync(src, dest, reject))));
	}

	public getPathSeparator(): string {
		return '/';
	}

	public normalizePath(path: string): string {
		const absolute = path.startsWith('/');
		const parts: string[] = [];
		for (const part of path.split('/')) {
			if (part === '..') {
				parts.pop();
			} else if (part && part !== '.') {
				parts.push(part);
			}
		}
		return (absolute ? '/' : '') + parts.join('/');
	}

	public joinPath(left: string, right: string): string {
		return this.normalizePath(`${left}/${right}`);
	}

	public joinPaths(paths: string[]): string {
		return paths && paths.length ? this.normalizePath(paths.join('/')) : '';
	}

	/** $XDG_DATA_HOME/<app> */
	public getDocumentsFolderPath(): string {
		const path = `${g_get_user_data_dir()}/${appName()}`;
		g_mkdir_with_parents(path, 0o700);
		return path;
	}

	public getExternalDocumentsFolderPath(): string {
		return this.getDocumentsFolderPath();
	}

	/** $XDG_CACHE_HOME/<app> */
	public getTempFolderPath(): string {
		const path = `${g_get_user_cache_dir()}/${appName()}`;
		g_mkdir_with_parents(path, 0o700);
		return path;
	}

	/** The app folder the runtime started (process.argv[1]). */
	public getCurrentAppPath(): string {
		const entry = (globalThis as any).process?.argv?.[1] ?? '';
		return this.folderExists(entry) ? entry : parentOf(entry);
	}

	public getLogicalRootPath(): string {
		return parentOf(this.getCurrentAppPath());
	}
}

// stub to avoid cross platform warning (file-system/index.ts imports it on every platform)
export class FileSystemAccess29 extends FileSystemAccess {}
