
declare class TNSByteBuf extends NSData {

	static alloc(): TNSByteBuf; // inherited from NSObject

	static data(): TNSByteBuf; // inherited from NSData

	static dataWithBytesLength(bytes: interop.Pointer | interop.Reference<any>, length: number): TNSByteBuf; // inherited from NSData

	static dataWithBytesNoCopyLength(bytes: interop.Pointer | interop.Reference<any>, length: number): TNSByteBuf; // inherited from NSData

	static dataWithBytesNoCopyLengthFreeWhenDone(bytes: interop.Pointer | interop.Reference<any>, length: number, b: boolean): TNSByteBuf; // inherited from NSData

	static dataWithContentsOfFile(path: string): TNSByteBuf; // inherited from NSData

	static dataWithContentsOfFileOptionsError(path: string, readOptionsMask: NSDataReadingOptions): TNSByteBuf; // inherited from NSData

	static dataWithContentsOfURL(url: NSURL): TNSByteBuf; // inherited from NSData

	static dataWithContentsOfURLOptionsError(url: NSURL, readOptionsMask: NSDataReadingOptions): TNSByteBuf; // inherited from NSData

	static dataWithData(data: NSData): TNSByteBuf; // inherited from NSData

	static new(): TNSByteBuf; // inherited from NSObject
}

declare class TNSByteBufMut extends NSMutableData {

	static alloc(): TNSByteBufMut; // inherited from NSObject

	static data(): TNSByteBufMut; // inherited from NSData

	static dataWithBytesLength(bytes: interop.Pointer | interop.Reference<any>, length: number): TNSByteBufMut; // inherited from NSData

	static dataWithBytesNoCopyLength(bytes: interop.Pointer | interop.Reference<any>, length: number): TNSByteBufMut; // inherited from NSData

	static dataWithBytesNoCopyLengthFreeWhenDone(bytes: interop.Pointer | interop.Reference<any>, length: number, b: boolean): TNSByteBufMut; // inherited from NSData

	static dataWithCapacity(aNumItems: number): TNSByteBufMut; // inherited from NSMutableData

	static dataWithContentsOfFile(path: string): TNSByteBufMut; // inherited from NSData

	static dataWithContentsOfFileOptionsError(path: string, readOptionsMask: NSDataReadingOptions): TNSByteBufMut; // inherited from NSData

	static dataWithContentsOfURL(url: NSURL): TNSByteBufMut; // inherited from NSData

	static dataWithContentsOfURLOptionsError(url: NSURL, readOptionsMask: NSDataReadingOptions): TNSByteBufMut; // inherited from NSData

	static dataWithData(data: NSData): TNSByteBufMut; // inherited from NSData

	static dataWithLength(length: number): TNSByteBufMut; // inherited from NSMutableData

	static new(): TNSByteBufMut; // inherited from NSObject
}

declare class TNSFileHandle extends NSObject {

	static alloc(): TNSFileHandle; // inherited from NSObject

	static new(): TNSFileHandle; // inherited from NSObject

	readonly fd: number;

	constructor(o: { handle: any; });

	addCloseListener(listener: () => any): any;

	appendFileWithDataCallback(data: NSData, callback: (p1: NSError) => void): void;

	appendFileWithStringCallback(string: string, callback: (p1: NSError) => void): void;

	chmodCallback(mode: number, callback: (p1: NSError) => void): void;

	close(callback: (p1: NSError) => void): void;

	datasync(callback: (p1: NSError) => void): void;

	fchownGidCallback(uid: number, gid: number, callback: (p1: NSError) => void): void;

	initWithHandle(handle: any): this;

	readFileCallback(encoding: string, callback: (p1: interop.Pointer | interop.Reference<number>, p2: NSError) => void): void;

	readWithBufferOffsetLengthPositionCallback(buffer: NSMutableData, offset: number, length: number, position: number, callback: (p1: number, p2: NSMutableData, p3: NSError) => void): void;

	readvPositionCallback(buffer: NSArray<NSMutableData> | NSMutableData[], position: number, callback: (p1: number, p2: NSError) => void): void;

	removeCloseListener(listener: () => any): void;

	stat(callback: (p1: interop.Pointer | interop.Reference<number>, p2: NSError) => void): void;

	sync(callback: (p1: NSError) => void): void;

	truncateCallback(length: number, callback: (p1: NSError) => void): void;

	utimesMtimeAndCallback(atime: number, mtime: number, callback: (p1: NSError) => void): void;

	writeFileWithDataCallback(data: NSData, callback: (p1: NSError) => void): void;

	writeFileWithStringCallback(string: string, callback: (p1: NSError) => void): void;

	writeWithDataOffsetLengthPositionCallback(data: NSData, offset: number, length: number, position: number, callback: (p1: number, p2: NSData, p3: NSError) => void): void;

	writeWithStringEncodingPositionCallback(string: string, encoding: string, position: number, callback: (p1: number, p2: string, p3: NSError) => void): void;
}

declare class TNSFileSystem extends NSObject {

	static accessSyncWithMode(path: string, mode: number): void;

	static accessWithModeCallback(path: string, mode: number, callback: (p1: NSError) => void): void;

	static alloc(): TNSFileSystem; // inherited from NSObject

	static appendFileSyncWithDataModeFlags(path: string, data: NSData, mode: number, flags: number): void;

	static appendFileSyncWithFdWithData(fd: number, data: NSData): void;

	static appendFileSyncWithFdWithString(fd: number, string: string): void;

	static appendFileSyncWithStringModeFlags(path: string, string: string, mode: number, flags: number): void;

	static appendFileWithDataModeFlagsCallback(path: string, data: NSData, mode: number, flags: number, callback: (p1: NSError) => void): void;

	static appendFileWithFdWithDataCallback(fd: number, data: NSData, callback: (p1: NSError) => void): void;

	static appendFileWithFdWithStringCallback(fd: number, string: string, callback: (p1: NSError) => void): void;

	static appendFileWithStringModeFlagsCallback(path: string, string: string, mode: number, flags: number, callback: (p1: NSError) => void): void;

	static chmodModeWithCallback(path: string, mode: number, callback: (p1: NSError) => void): void;

	static chmodSyncMode(path: string, mode: number): void;

	static chownSyncUidGid(path: string, uid: number, gid: number): void;

	static chownUidGidWithCallback(path: string, uid: number, gid: number, callback: (p1: NSError) => void): void;

	static closeSync(handle: number): void;

	static closeWithCallback(handle: number, callback: (p1: NSError) => void): void;

	static copyFileSyncWithSrcDestFlags(src: string, dest: string, flags: number): void;

	static copyFileWithSrcDestFlagsCallback(src: string, dest: string, flags: number, callback: (p1: NSError) => void): void;

	static existsSync(path: string): boolean;

	static existsSyncCallback(path: string, callback: (p1: boolean) => void): void;

	static fchmodModeWithCallback(fd: number, mode: number, callback: (p1: NSError) => void): void;

	static fchmodSyncMode(fd: number, mode: number): void;

	static fchownSyncUidGid(fd: number, uid: number, gid: number): void;

	static fchownUidGidWithCallback(fd: number, uid: number, gid: number, callback: (p1: NSError) => void): void;

	static fdatasyncSync(fd: number): void;

	static fdatasyncWithCallback(fd: number, callback: (p1: NSError) => void): void;

	static fstatSync(fd: number): TNSFsStat;

	static fstateWithCallback(fd: number, callback: (p1: TNSFsStat, p2: NSError) => void): void;

	static fsyncSync(fd: number): void;

	static fsyncWithCallback(fd: number, callback: (p1: NSError) => void): void;

	static ftruncateLengthWithCallback(fd: number, length: number, callback: (p1: NSError) => void): void;

	static ftruncateSyncLength(fd: number, length: number): void;

	static futimesAtimeUtimeWithCallback(fd: number, atime: number, utime: number, callback: (p1: NSError) => void): void;

	static futimesSyncAtimeUtime(fd: number, atime: number, utime: number): void;

	static lchmodModeWithCallback(path: string, mode: number, callback: (p1: NSError) => void): void;

	static lchmodSyncMode(path: string, mode: number): void;

	static lchownSyncUidGid(path: string, uid: number, gid: number): void;

	static lchownUidGidWithCallback(path: string, uid: number, gid: number, callback: (p1: NSError) => void): void;

	static linkNewPathWithCallback(existingPath: string, newPath: string, callback: (p1: NSError) => void): void;

	static linkSyncNewPath(existingPath: string, newPath: string): void;

	static lstatSync(path: string): TNSFsStat;

	static lstatWithCallback(path: string, callback: (p1: TNSFsStat, p2: NSError) => void): void;

	static lutimesAtimeUtimeWithCallback(path: string, atime: number, utime: number, callback: (p1: NSError) => void): void;

	static lutimesSyncAtimeUtime(path: string, atime: number, utime: number): void;

	static mkdirModeRecursiveCallback(path: string, mode: number, recursive: boolean, callback: (p1: NSError) => void): void;

	static mkdirSyncModeRecursive(path: string, mode: number, recursive: boolean): void;

	static mkdtempCallback(prefix: string, callback: (p1: string, p2: NSError) => void): void;

	static mkdtempSync(prefix: string): string;

	static new(): TNSFileSystem; // inherited from NSObject

	static openFlagsModeCallback(path: string, flags: number, mode: number, callback: (p1: number, p2: NSError) => void): void;

	static openHandleWithPathFlagsModeCallback(path: string, flag: number, mode: number, callback: (p1: TNSFileHandle, p2: NSError) => void): void;

	static openSyncFlagsMode(path: string, flags: number, mode: number): number;

	static opendirCallback(path: string, callback: (p1: TNSFsDir, p2: NSError) => void): void;

	static opendirSync(path: string): TNSFsDir;

	static readFileFlagCallback(path: string, flags: number, callback: (p1: TNSByteBuf, p2: NSError) => void): void;

	static readFileSyncFlag(path: string, flags: number): any;

	static readSyncWithBufferOffsetLengthPosition(fd: number, buffer: NSMutableData, offset: number, length: number, position: number): number;

	static readWithBufferOffsetLengthPositionCallback(fd: number, buffer: NSMutableData, offset: number, length: number, position: number, callback: (p1: number, p2: NSMutableData, p3: NSError) => void): void;

	static readdirCallback(path: string, callback: (p1: NSArray<TNSFsDirent>, p2: NSError) => void): void;

	static readdirSync(path: string): NSArray<TNSFsDirent>;

	static readlinkCallback(path: string, callback: (p1: string, p2: NSError) => void): void;

	static readlinkSync(path: string): string;

	static readvBufferPositionCallback(fd: number, buffer: NSArray<NSMutableData> | NSMutableData[], position: number, callback: (p1: number, p2: NSError) => void): void;

	static readvSyncBufferPosition(fd: number, buffer: NSArray<NSMutableData> | NSMutableData[], position: number): number;

	static realpathCallback(path: string, callback: (p1: string, p2: NSError) => void): void;

	static realpathSync(path: string): string;

	static renameNewPathCallback(oldPath: string, newPath: string, callback: (p1: NSError) => void): void;

	static renameSyncNewPath(oldPath: string, newPath: string): void;

	static rmMaxRetriesRecursiveRetryDelayCallback(path: string, maxRetries: number, recursive: boolean, retryDelay: number, callback: (p1: NSError) => void): void;

	static rmSyncMaxRetriesRecursiveRetryDelay(path: string, maxRetries: number, recursive: boolean, retryDelay: number): void;

	static rmdirMaxRetriesRecursiveRetryDelayCallback(path: string, maxRetries: number, recursive: boolean, retryDelay: number, callback: (p1: NSError) => void): void;

	static rmdirSyncMaxRetriesRecursiveRetryDelay(path: string, maxRetries: number, recursive: boolean, retryDelay: number): void;

	static statSyncThrowIfNoEntry(path: string, throwIfNoEntry: boolean): TNSFsStat;

	static statThrowIfNoEntryWithCallback(path: string, throwIfNoEntry: boolean, callback: (p1: TNSFsStat, p2: NSError) => void): void;

	static symlinkPathTypeCallback(target: string, path: string, type: string, callback: (p1: NSError) => void): void;

	static symlinkSyncPathType(target: string, path: string, type: string): void;

	static truncateLengthWithCallback(path: string, length: number, callback: (p1: NSError) => void): void;

	static truncateSyncLength(path: string, length: number): void;

	static unlinkCallback(path: string, callback: (p1: NSError) => void): void;

	static unlinkSync(path: string): void;

	static unwatchFile(filename: string): void;

	static utimesAtimeUtimeWithCallback(path: string, atime: number, utime: number, callback: (p1: NSError) => void): void;

	static utimesSyncAtimeUtime(path: string, atime: number, utime: number): void;

	static watchFileWithFileNameBigintPersistentIntervalListener(filename: string, bigint: boolean, persistent: boolean, interval: number, listener: (p1: string, p2: string) => void): void;

	static watchWithFileNamePersistentRecursiveEncodingSignalListener(filename: string, persistent: boolean, recursive: boolean, encoding: string, signal: (p1: NSError) => void, listener: (p1: string, p2: string) => void): void;

	static writeFileDataOptionsEncodingModeFlagsSignalCallback(fd: number, data: NSData, encoding: string, mode: number, flags: number, signal: (p1: NSError) => void, callback: (p1: NSError) => void): void;

	static writeFileStringOptionsEncodingModeFlagsSignalCallback(fd: number, data: string, encoding: string, mode: number, flags: number, signal: (p1: NSError) => void, callback: (p1: NSError) => void): void;

	static writeFileSyncDataOptionsEncodingModeFlags(fd: number, data: NSData, encoding: string, mode: number, flags: number): void;

	static writeFileSyncStringOptionsEncodingModeFlags(fd: number, string: string, encoding: string, mode: number, flags: number): void;

	static writeFileWithPathDataOptionsEncodingModeFlagsSignalCallback(path: string, data: NSData, encoding: string, mode: number, flags: number, signal: (p1: NSError) => void, callback: (p1: NSError) => void): void;

	static writeFileWithPathStringOptionsEncodingModeFlagsSignalCallback(path: string, string: string, encoding: string, mode: number, flags: number, signal: (p1: NSError) => void, callback: (p1: NSError) => void): void;

	static writeFileWithPathSyncDataOptionsEncodingModeFlags(path: string, data: NSData, encoding: string, mode: number, flags: number): void;

	static writeFileWithPathSyncStringOptionsEncodingModeFlags(path: string, string: string, encoding: string, mode: number, flags: number): void;

	static writeSyncWithBufferOffsetLengthPosition(fd: number, buffer: NSData, offset: number, length: number, position: number): number;

	static writeSyncWithStringPositionEncoding(fd: number, string: string, position: number, encoding: string): number;

	static writeWithBufferOffsetLengthPositionCallback(fd: number, buffer: NSData, offset: number, length: number, position: number, callback: (p1: number, p2: TNSByteBuf, p3: NSError) => void): void;

	static writeWithStringPositionEncodingCallback(fd: number, string: string, position: number, encoding: string, callback: (p1: number, p2: NSError) => void): void;

	static writevBuffersPositionCallback(fd: number, buffers: NSArray<NSData> | NSData[], position: number, callback: (p1: number, p2: NSError) => void): void;

	static writevSyncBuffersPosition(fd: number, buffers: NSArray<NSData> | NSData[], position: number): number;
}

declare class TNSFsCallback extends NSObject {

	static alloc(): TNSFsCallback; // inherited from NSObject

	static new(): TNSFsCallback; // inherited from NSObject
}

declare class TNSFsConstants extends NSObject {

	static FILE_ACCESS_OPTIONS_F_OK(): number;

	static FILE_ACCESS_OPTIONS_R_OK(): number;

	static FILE_ACCESS_OPTIONS_W_OK(): number;

	static FILE_ACCESS_OPTIONS_X_OK(): number;

	static FILE_COPY_OPTIONS_COPYFILE_EXCL(): number;

	static FILE_COPY_OPTIONS_COPYFILE_FICLONE(): number;

	static FILE_COPY_OPTIONS_COPYFILE_FICLONE_FORCE(): number;

	static FILE_MODE_OPTIONS_S_IRGRP(): number;

	static FILE_MODE_OPTIONS_S_IROTH(): number;

	static FILE_MODE_OPTIONS_S_IRUSR(): number;

	static FILE_MODE_OPTIONS_S_IRWXG(): number;

	static FILE_MODE_OPTIONS_S_IRWXO(): number;

	static FILE_MODE_OPTIONS_S_IRWXU(): number;

	static FILE_MODE_OPTIONS_S_IWGRP(): number;

	static FILE_MODE_OPTIONS_S_IWOTH(): number;

	static FILE_MODE_OPTIONS_S_IWUSR(): number;

	static FILE_MODE_OPTIONS_S_IXGRP(): number;

	static FILE_MODE_OPTIONS_S_IXOTH(): number;

	static FILE_MODE_OPTIONS_S_IXUSR(): number;

	static FILE_OPEN_OPTIONS_O_APPEND(): number;

	static FILE_OPEN_OPTIONS_O_CREAT(): number;

	static FILE_OPEN_OPTIONS_O_DIRECT(): number;

	static FILE_OPEN_OPTIONS_O_DIRECTORY(): number;

	static FILE_OPEN_OPTIONS_O_DSYNC(): number;

	static FILE_OPEN_OPTIONS_O_EXCL(): number;

	static FILE_OPEN_OPTIONS_O_NOATIME(): number;

	static FILE_OPEN_OPTIONS_O_NOCTTY(): number;

	static FILE_OPEN_OPTIONS_O_NOFOLLOW(): number;

	static FILE_OPEN_OPTIONS_O_NONBLOCK(): number;

	static FILE_OPEN_OPTIONS_O_RDONLY(): number;

	static FILE_OPEN_OPTIONS_O_RDWR(): number;

	static FILE_OPEN_OPTIONS_O_SYMLINK(): number;

	static FILE_OPEN_OPTIONS_O_SYNC(): number;

	static FILE_OPEN_OPTIONS_O_TRUNC(): number;

	static FILE_OPEN_OPTIONS_O_WRONLY(): number;

	static FILE_TYPE_OPTIONS_S_IFBLK(): number;

	static FILE_TYPE_OPTIONS_S_IFCHR(): number;

	static FILE_TYPE_OPTIONS_S_IFDIR(): number;

	static FILE_TYPE_OPTIONS_S_IFIFO(): number;

	static FILE_TYPE_OPTIONS_S_IFLNK(): number;

	static FILE_TYPE_OPTIONS_S_IFMT(): number;

	static FILE_TYPE_OPTIONS_S_IFREG(): number;

	static FILE_TYPE_OPTIONS_S_IFSOCK(): number;

	static alloc(): TNSFsConstants; // inherited from NSObject

	static new(): TNSFsConstants; // inherited from NSObject
}

declare class TNSFsDir extends NSObject {

	static alloc(): TNSFsDir; // inherited from NSObject

	static new(): TNSFsDir; // inherited from NSObject

	readonly path: string;

	close(callback: (p1: NSError) => void): void;

	closeSync(): void;

	read(callback: (p1: TNSFsDirent, p2: NSError) => void): void;

	readSync(): TNSFsDirent;
}

declare class TNSFsDirent extends NSObject {

	static alloc(): TNSFsDirent; // inherited from NSObject

	static new(): TNSFsDirent; // inherited from NSObject

	isBlockDevice(): boolean;

	isCharacterDevice(): boolean;

	isDirectory(): boolean;

	isFIFO(): boolean;

	isFile(): boolean;

	isSocket(): boolean;

	isSymbolicLink(): boolean;

	name(): string;
}

declare class TNSFsStat extends NSObject {

	static alloc(): TNSFsStat; // inherited from NSObject

	static new(): TNSFsStat; // inherited from NSObject

	readonly atime: Date;

	readonly atimeMs: number;

	readonly birthtime: Date;

	readonly birthtimeMs: number;

	readonly blksize: number;

	readonly blocks: number;

	readonly ctime: Date;

	readonly ctimeMs: number;

	readonly dev: number;

	readonly gid: number;

	readonly ino: number;

	readonly mode: number;

	readonly mtime: Date;

	readonly mtimeMs: number;

	readonly nlink: number;

	readonly rdev: number;

	readonly size: number;

	readonly uid: number;

	isBlockDevice(): boolean;

	isCharacterDevice(): boolean;

	isDirectory(): boolean;

	isFIFO(): boolean;

	isFile(): boolean;

	isSocket(): boolean;

	isSymbolicLink(): boolean;
}

declare class TNSFsStatWatcher extends NSObject {

	static alloc(): TNSFsStatWatcher; // inherited from NSObject

	static new(): TNSFsStatWatcher; // inherited from NSObject

	ref(): void;

	unref(): void;
}

declare class TNSFsWatcher extends NSObject {

	static alloc(): TNSFsWatcher; // inherited from NSObject

	static new(): TNSFsWatcher; // inherited from NSObject

	addChangeListener(listener: (p1: string, p2: string) => any): any;

	addCloseListener(listener: () => any): any;

	addErrorListener(listener: (p1: NSError) => any): any;

	close(): void;

	ref(): void;

	removeChangeListener(listener: (p1: string, p2: string) => any): void;

	removeCloseListener(listener: () => any): void;

	removeErrorListener(listener: (p1: NSError) => any): void;

	unref(): void;
}

declare class TNSHelpers extends NSObject {

	static alloc(): TNSHelpers; // inherited from NSObject

	static fromRustErrorChar(error: string | interop.Pointer | interop.Reference<any>): NSError;

	static new(): TNSHelpers; // inherited from NSObject

	static toError(exception: NSException): NSError;
}

declare class TNSLabel extends UILabel {

	static alloc(): TNSLabel; // inherited from NSObject

	static appearance(): TNSLabel; // inherited from UIAppearance

	static appearanceForTraitCollection(trait: UITraitCollection): TNSLabel; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedIn(trait: UITraitCollection, ContainerClass: typeof NSObject): TNSLabel; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedInInstancesOfClasses(trait: UITraitCollection, containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): TNSLabel; // inherited from UIAppearance

	static appearanceWhenContainedIn(ContainerClass: typeof NSObject): TNSLabel; // inherited from UIAppearance

	static appearanceWhenContainedInInstancesOfClasses(containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): TNSLabel; // inherited from UIAppearance

	static new(): TNSLabel; // inherited from NSObject

	borderThickness: UIEdgeInsets;

	padding: UIEdgeInsets;
}

declare var TNSWidgetsVersionNumber: number;

declare var TNSWidgetsVersionString: interop.Reference<number>;

declare function __nslog(message: string): void;

declare function __tns_uptime(): number;
