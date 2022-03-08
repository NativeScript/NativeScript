package org.nativescript.widgets.filesystem;

import java.lang.ref.PhantomReference;
import java.lang.ref.Reference;
import java.lang.ref.ReferenceQueue;
import java.nio.ByteBuffer;
import java.util.HashMap;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicInteger;

public class FileSystem {

	private static native void disposeByteBufMut(long buffer);

	private static native void nativeAccess(String path, int mode, long callback);

	private static native void nativeAppendFileWithBytes(int fd, byte[] bytes, long callback);

	private static native void nativeAppendFileWithString(int fd, String data, long callback);

	private static native void nativeAppendFileWithPathBytes(String path, byte[] bytes, int mode, int flags, long callback);

	private static native void nativeAppendFileWithPathString(String path, String data, int mode, int flags, long callback);

	private static native void nativeChmod(String path, int mode, long callback);

	private static native void nativeChown(String path, int uid, int gid, long callback);

	private static native void nativeCopyFile(String src, String dest, int flags, long callback);

	private static native void nativeExists(String path, long callback);

	private static native void nativeFchmod(int fd, int mode, long callback);

	private static native void nativeFchown(int fd, int uid, int gid, long callback);

	private static native void nativeFdatasync(int fd, long callback);

	private static native void nativeFstat(int fd, long callback);

	private static native void nativeFsync(int fd, long callback);

	private static native void nativeFtruncate(int fd, long len, long callback);

	private static native void nativeFutimes(int fd, long atime, long mtime, long callback);

	private static native void nativeLchmod(String path, int mode, long callback);

	private static native void nativeLchown(String path, int uid, int gid, long callback);

	private static native void nativeLutimes(String path, long atime, long mtime, long callback);

	private static native void nativeLink(String oldPath, String newPath, long callback);

	private static native void nativeLstat(String path, long callback);

	private static native void nativeMkdir(String path, int mode, boolean recursive, long callback);

	private static native void nativeMkdtemp(String prefix, long callback);

	private static native void nativeOpen(String path, int flags, int mode, long callback);

	private static native void nativeOpenDir(String path, long callback);

	private static native void nativeRead(int fd, ByteBuffer buffer, long offset, long length, long position, long callback);

	private static native void nativeReadWithBytes(int fd, byte[] buffer, long offset, long length, long position, long callback);

	private static native void nativeReaddirWithFileTypes(String path, String encoding, long callback);

	private static native void nativeReaddirWithFile(String path, String encoding, long callback);

	private static native void nativeReadFile(String path, int flags, long callback);

	private static native void nativeReadFileBytes(String path, int flags, long callback);

	private static native void nativeReadFileWithFd(int fd, int flags, long callback);

	private static native void nativeReadFileBytesWithFd(int fd, int flags, long callback);

	private static native void nativeReadLink(String path, String encoding, long callback);

	private static native void nativeReadv(int fd, ByteBuffer[] buffers, long position, long callback);

	private static native void nativeRealPath(String path, long callback);

	private static native void nativeRename(String oldPath, String newPath, long callback);

	private static native void nativeRmdir(String path, int maxRetries, boolean recursive, long retryDelay, long callback);

	private static native void nativeRm(String path, int maxRetries, boolean recursive, long retryDelay, long callback);

	private static native void nativeStat(String path, boolean throwIfNoEntry, long callback);

	private static native void nativeSymlink(String target, String path, long callback);

	private static native void nativeTruncate(String path, long len, long callback);

	private static native void nativeUnlink(String path, long callback);

	private static native void nativeUnwatchFile(String path, long callback);

	private static native void nativeUtimes(String path, long atime, long mtime, long callback);

	private static native FsWatcher nativeWatch(String path, boolean persistent, boolean recursive, String encoding, long callback);

	private static native FileWatcher nativeWatchFile(String path, boolean bigint, boolean persistent, long interval, long callback);

	private static native void nativeWrite(int fd, ByteBuffer buffer, long offset, long length, long position, long callback);

	private static native void nativeWriteBytes(int fd, byte[] buffer, long offset, long length, long position, long callback);

	private static native void nativeWriteString(int fd, String string, String encoding, long position, long callback);

	private static native void nativeWriteFileWithString(int fd, String data, long callback);

	private static native void nativeWriteFileWithBuffer(int fd, ByteBuffer data, long callback);

	private static native void nativeWriteFileWithBytes(int fd, byte[] data, long callback);

	private static native void nativeWriteFileWithStringFromPath(String path, String data, String encoding, int mode, int flag, long callback);

	private static native void nativeWriteFileWithBytesFromPath(String path, byte[] data, String encoding, int mode, int flag, long callback);

	private static native void nativeWriteFileWithBufferFromPath(String path, ByteBuffer data, String encoding, int mode, int flag, long callback);

	private static native void nativeWritev(int fd, ByteBuffer[] buffers, long position, long callback);

	private static native void nativeAccessSync(String path, int mode);

	private static native void nativeAppendFileWithBytesSync(int fd, byte[] bytes);

	private static native void nativeAppendFileWithStringSync(int fd, String data);

	private static native void nativeAppendFileWithPathBytesSync(String path, byte[] bytes, int mode, int flags);

	private static native void nativeAppendFileWithPathStringSync(String path, String data, int mode, int flags);

	private static native void nativeChmodSync(String path, int mode);

	private static native void nativeChownSync(String path, int uid, int gid);

	private static native void nativeCopyFileSync(String src, String dest, int flags);

	private static native boolean nativeExistsSync(String path);

	private static native void nativeFchmodSync(int fd, int mode);

	private static native void nativeFchownSync(int fd, int uid, int gid);

	private static native void nativeFdatasyncSync(int fd);

	private static native FileStat nativeFstatSync(int fd);

	private static native void nativeFsyncSync(int fd);

	private static native void nativeFtruncateSync(int fd, long len);

	private static native void nativeFutimesSync(int fd, long atime, long mtime);

	private static native void nativeLchmodSync(String path, int mode);

	private static native void nativeLchownSync(String path, int uid, int gid);

	private static native void nativeLutimesSync(String path, long atime, long mtime);

	private static native void nativeLinkSync(String oldPath, String newPath);

	private static native FileStat nativeLstatSync(String path);

	private static native void nativeMkdirSync(String path, int mode, boolean recursive);

	private static native String nativeMkdtempSync(String prefix);

	private static native int nativeOpenSync(String path, int flags, int mode);

	private static native FileDir nativeOpenDirSync(String path);

	private static native long nativeReadSync(int fd, ByteBuffer buffer, long offset, long length, long position);

	private static native long nativeReadWithBytesSync(int fd, byte[] buffer, long offset, long length, long position);

	private static native FileDirent[] nativeReaddirWithFileTypesSync(String path, String encoding);

	private static native String[] nativeReaddirWithFileSync(String path, String encoding);

	private static native ByteBuffer nativeReadFileSync(String path, int flags);

	private static native byte[] nativeReadFileBytesSync(String path, int flags);

	private static native ByteBuffer nativeReadFileWithFdSync(int fd, int flags);

	private static native byte[] nativeReadFileBytesWithFdSync(int fd, int flags);

	private static native String nativeReadLinkSync(String path, String encoding);

	private static native long nativeReadvSync(int fd, ByteBuffer[] buffers, long position);

	private static native String nativeRealPathSync(String path);

	private static native void nativeRenameSync(String oldPath, String newPath);

	private static native void nativeRmdirSync(String path, int maxRetries, boolean recursive, long retryDelay);

	private static native void nativeRmSync(String path, int maxRetries, boolean recursive, long retryDelay);

	private static native FileStat nativeStatSync(String path, boolean throwIfNoEntry);

	private static native void nativeSymlinkSync(String target, String path);

	private static native void nativeTruncateSync(String path, long len);

	private static native void nativeUnlinkSync(String path);

	private static native void nativeUtimesSync(String path, long atime, long mtime);

	private static native long nativeWriteSync(int fd, ByteBuffer buffer, long offset, long length, long position);

	private static native long nativeWriteBytesSync(int fd, byte[] buffer, long offset, long length, long position);

	private static native long nativeWriteStringSync(int fd, String string, String encoding, long position);

	private static native void nativeWriteFileWithStringSync(int fd, String data);

	private static native void nativeWriteFileWithBufferSync(int fd, ByteBuffer data);

	private static native void nativeWriteFileWithBytesSync(int fd, byte[] data);

	private static native void nativeWriteFileWithStringFromPathSync(String path, String data, String encoding, int mode, int flag);

	private static native void nativeWriteFileWithBytesFromPathSync(String path, byte[] data, String encoding, int mode, int flag);

	private static native void nativeWriteFileWithBufferFromPathSync(String path, ByteBuffer data, String encoding, int mode, int flag);

	private static native long nativeWritevSync(int fd, ByteBuffer[] buffers, long position);

	private static boolean isLoaded = false;

	static void loadNative() {
		if (isLoaded) {
			return;
		}
		try {
			System.loadLibrary("nativescript_common");
		} catch (Exception ignored) {
		}
	}

	private static ReferenceQueue<ByteBuffer> bufferRefQue = new ReferenceQueue<>();
	private static HashMap<Reference<ByteBuffer>, Long> keyMap = new HashMap<>();
	private static HashMap<Long, Reference<ByteBuffer>> map = new HashMap<>();

	private static ExecutorService executor = Executors.newSingleThreadExecutor();

	private static AtomicBoolean monitoring = new AtomicBoolean();

	static {
		loadNative();
		startWatch();
	}

	static final String FILE_OPTIONS_PATH = "path";
	static final String FILE_OPTIONS_DIRECTORY = "directory";
	static final String FILE_OPTIONS_DIRECTORY_CACHE = "CACHE";

	private static void startWatch() {
		if (monitoring.get()) {
			return;
		}
		monitoring.set(true);
		AtomicInteger dropped = new AtomicInteger();
		executor.execute(() -> {
			while (monitoring.get()) {
				Reference<? extends ByteBuffer> tmp = bufferRefQue.poll();
				if (tmp != null) {
					Long key = keyMap.get(tmp);
					if (key != null) {
						keyMap.remove(tmp);
						map.remove(key);
						disposeByteBufMut(key);
						dropped.getAndIncrement();
					}
				}
			}
		});
	}

	private static void stopWatch() {
		monitoring.set(false);
		executor.shutdown();
	}

	public static void restartWatch() {
		startWatch();
		executor = Executors.newSingleThreadExecutor();
		startWatch();
	}

	public static void watchItem(long key, ByteBuffer value) {
		Reference<ByteBuffer> ref = new PhantomReference<>(value, bufferRefQue);
		keyMap.put(ref, key);
		map.put(key, ref);
	}

	private static void watchRef(ByteBuffer buffer) {
		Reference<ByteBuffer> ref = new PhantomReference<>(buffer, bufferRefQue);
	}

	public static void access(String path, int mode, AsyncCallback<Void> callback) {
		nativeAccess(path, mode, callback.nativeCallback);
	}

	public static void appendFile(int fd, byte[] bytes, AsyncCallback<Void> callback) {
		nativeAppendFileWithBytes(fd, bytes, callback.nativeCallback);
	}

	public static void appendFile(int fd, String string, AsyncCallback<Void> callback) {
		nativeAppendFileWithString(fd, string, callback.nativeCallback);
	}

	public static void appendFile(String path, byte[] data, int flags, int mode, AsyncCallback<Void> callback) {
		nativeAppendFileWithPathBytes(path, data, flags, mode, callback.nativeCallback);
	}

	public static void appendFile(String path, String data, int flags, int mode, AsyncCallback<Void> callback) {
		nativeAppendFileWithPathString(path, data, flags, mode, callback.nativeCallback);
	}

	public static void chmod(String path, int mode, AsyncCallback<Void> callback) {
		nativeChmod(path, mode, callback.nativeCallback);
	}

	public static void chown(String path, int uid, int gid, AsyncCallback<Void> callback) {
		nativeChown(path, uid, gid, callback.nativeCallback);
	}

	public static void copyFile(String src, String dest, int flags, AsyncCallback<Void> callback) {
		nativeCopyFile(src, dest, flags, callback.nativeCallback);
	}

	public static void exists(String path, AsyncCallback<Boolean> callback) {
		nativeExists(path, callback.nativeCallback);
	}

	public static void fchmod(int fd, int mode, AsyncCallback<Void> callback) {
		nativeFchmod(fd, mode, callback.nativeCallback);
	}

	public static void fchown(int fd, int uid, int gid, AsyncCallback<Void> callback) {
		nativeFchown(fd, uid, gid, callback.nativeCallback);
	}

	public static void fdatasync(int fd, AsyncCallback<Void> callback) {
		nativeFdatasync(fd, callback.nativeCallback);
	}

	public static void fstat(int fd, AsyncCallback<FileStat> callback) {
		nativeFstat(fd, callback.nativeCallback);
	}

	public static void fsync(int fd, AsyncCallback<Void> callback) {
		nativeFsync(fd, callback.nativeCallback);
	}

	public static void ftruncate(int fd, long len, AsyncCallback<Void> callback) {
		nativeFtruncate(fd, len, callback.nativeCallback);
	}

	public static void futimes(int fd, long atime, long mtime, AsyncCallback<Void> callback) {
		nativeFutimes(fd, atime, mtime, callback.nativeCallback);
	}

	public static void lchmod(String path, int mode, AsyncCallback<Void> callback) {
		nativeLchmod(path, mode, callback.nativeCallback);
	}

	public static void lchown(String path, int uid, int gid, AsyncCallback<Void> callback) {
		nativeLchown(path, uid, gid, callback.nativeCallback);
	}

	public static void lutimes(String path, long atime, long mtime, AsyncCallback<Void> callback) {
		nativeLutimes(path, atime, mtime, callback.nativeCallback);
	}

	public static void link(String oldPath, String newPath, AsyncCallback<Void> callback) {
		nativeLink(oldPath, newPath, callback.nativeCallback);
	}

	public static void lstat(String path, AsyncCallback<FileStat> callback) {
		nativeLstat(path, callback.nativeCallback);
	}

	public static void mkdir(String path, int mode, boolean recursive, AsyncCallback<Void> callback) {
		nativeMkdir(path, mode, recursive, callback.nativeCallback);
	}

	public static void mkdtemp(String prefix, AsyncCallback<String> callback) {
		nativeMkdtemp(prefix, callback.nativeCallback);
	}

	public static void open(String path, int flag, int mode, AsyncCallback<Integer> callback) {
		nativeOpen(path, flag, mode, callback.nativeCallback);
	}

	public static void openDir(String path, AsyncCallback<FileDir> callback) {
		nativeOpenDir(path, callback.nativeCallback);
	}

	public static void read(int fd, ByteBuffer buffer, long offset, long length, long position, AsyncCallback<Long> callback) {
		nativeRead(fd, buffer, offset, length, position, callback.nativeCallback);
	}

	public static void read(int fd, byte[] buffer, long offset, long length, long position, AsyncCallback<Long> callback) {
		nativeReadWithBytes(fd, buffer, offset, length, position, callback.nativeCallback);
	}

	public static void readdir(String path, String encoding, boolean withTypes, AsyncCallback<Object[]> callback) {
		if (withTypes) {
			nativeReaddirWithFileTypes(path, encoding, callback.nativeCallback);
		} else {
			nativeReaddirWithFile(path, encoding, callback.nativeCallback);
		}
	}

	public static void readFile(String path, int flags, AsyncCallback<ByteBuffer> callback) {
		nativeReadFile(path, flags, callback.nativeCallback);
	}

	public static void readFile(int fd, int flags, AsyncCallback<ByteBuffer> callback) {
		nativeReadFileWithFd(fd, flags, callback.nativeCallback);
	}

	public static void readFileBytes(String path, int flags, AsyncCallback<byte[]> callback) {
		nativeReadFileBytes(path, flags, callback.nativeCallback);
	}

	public static void readFileBytes(int fd, int flags, AsyncCallback<byte[]> callback) {
		nativeReadFileBytesWithFd(fd, flags, callback.nativeCallback);
	}

	public static void readLink(String path, String encoding, AsyncCallback<String> callback) {
		nativeReadLink(path, encoding, callback.nativeCallback);
	}

	public static void readv(int fd, ByteBuffer[] buffers, long position, AsyncCallback<Long> callback) {
		nativeReadv(fd, buffers, position, callback.nativeCallback);
	}

	public static void realPath(String path, AsyncCallback<String> callback) {
		nativeRealPath(path, callback.nativeCallback);
	}

	public static void rename(String oldPath, String newPath, AsyncCallback<Void> callback) {
		nativeRename(oldPath, newPath, callback.nativeCallback);
	}

	public static void rmdir(String path, int maxRetries, boolean recursive, long retryDelay, AsyncCallback<Void> callback) {
		nativeRmdir(path, maxRetries, recursive, retryDelay, callback.nativeCallback);
	}

	public static void rm(String path, int maxRetries, boolean recursive, long retryDelay, AsyncCallback<Void> callback) {
		nativeRm(path, maxRetries, recursive, retryDelay, callback.nativeCallback);
	}

	public static void stat(String path, boolean throwIfNoEntry, AsyncCallback<FileStat> callback) {
		nativeStat(path, throwIfNoEntry, callback.nativeCallback);
	}

	public static void symlink(String target, String path, AsyncCallback<Void> callback) {
		nativeSymlink(target, path, callback.nativeCallback);
	}

	public static void truncate(String path, long len, AsyncCallback<Void> callback) {
		nativeTruncate(path, len, callback.nativeCallback);
	}

	public static void unlink(String path, AsyncCallback<Void> callback) {
		nativeUnlink(path, callback.nativeCallback);
	}

	public static void unwatchFile(String path, AsyncCallback<FileWatcher.Event> callback) {
		nativeUnwatchFile(path, callback.nativeCallback);
	}

	public static void utimes(String path, long atime, long mtime, AsyncCallback<Void> callback) {
		nativeUtimes(path, atime, mtime, callback.nativeCallback);
	}

	public static FsWatcher watch(String path, boolean persistent, boolean recursive, String encoding, AsyncCallback<FsWatcher.Event> callback) {
		return nativeWatch(path, persistent, recursive, encoding, callback.nativeCallback);
	}

	public static FileWatcher watchFile(String path, boolean bigint, boolean persistent, long interval, AsyncCallback<FileWatcher.Event> callback) {
		return nativeWatchFile(path, bigint, persistent, interval, callback.nativeCallback);
	}

	public static void write(int fd, ByteBuffer buffer, long offset, long length, long position, AsyncCallback<Long> callback) {
		nativeWrite(fd, buffer, offset, length, position, callback.nativeCallback);
	}

	public static void write(int fd, byte[] buffer, long offset, long length, long position, AsyncCallback<Long> callback) {
		nativeWriteBytes(fd, buffer, offset, length, position, callback.nativeCallback);
	}

	public static void write(int fd, String string, String encoding, long position, AsyncCallback<Long> callback) {
		nativeWriteString(fd, string, encoding, position, callback.nativeCallback);
	}

	public static void writeFile(int fd, String data, AsyncCallback<Void> callback) {
		nativeWriteFileWithString(fd, data, callback.nativeCallback);
	}

	public static void writeFile(int fd, ByteBuffer data, AsyncCallback<Void> callback) {
		nativeWriteFileWithBuffer(fd, data, callback.nativeCallback);
	}

	public static void writeFile(int fd, byte[] data, AsyncCallback<Void> callback) {
		nativeWriteFileWithBytes(fd, data, callback.nativeCallback);
	}

	public static void writeFile(String path, String data, String encoding, int mode, int flag, AsyncCallback<Void> callback) {
		nativeWriteFileWithStringFromPath(path, data, encoding, mode, flag, callback.nativeCallback);
	}

	public static void writeFile(String path, byte[] data, String encoding, int mode, int flag, AsyncCallback<Void> callback) {
		nativeWriteFileWithBytesFromPath(path, data, encoding, mode, flag, callback.nativeCallback);
	}

	public static void writeFile(String path, ByteBuffer data, String encoding, int mode, int flag, AsyncCallback<Void> callback) {
		nativeWriteFileWithBufferFromPath(path, data, encoding, mode, flag, callback.nativeCallback);
	}

	public static void writev(int fd, ByteBuffer[] buffers, long position, AsyncCallback<Long> callback) {
		nativeWritev(fd, buffers, position, callback.nativeCallback);
	}


	public static void accessSync(String path, int mode) throws Exception {
		nativeAccessSync(path, mode);
	}

	public static void appendFileSync(int fd, byte[] bytes) throws Exception {
		nativeAppendFileWithBytesSync(fd, bytes);
	}

	public static void appendFilesYNC(int fd, String string) throws Exception {
		nativeAppendFileWithStringSync(fd, string);
	}

	public static void appendFileSync(String path, byte[] data, int flags, int mode) throws Exception {
		nativeAppendFileWithPathBytesSync(path, data, flags, mode);
	}

	public static void appendFileSync(String path, String data, int flags, int mode) throws Exception {
		nativeAppendFileWithPathStringSync(path, data, flags, mode);
	}

	public static void chmodSync(String path, int mode) throws Exception {
		nativeChmodSync(path, mode);
	}

	public static void chownSync(String path, int uid, int gid) throws Exception {
		nativeChownSync(path, uid, gid);
	}

	public static void copyFileSync(String src, String dest, int flags) throws Exception {
		nativeCopyFileSync(src, dest, flags);
	}

	public static boolean existsSync(String path) {
		return nativeExistsSync(path);
	}

	public static void fchmodSync(int fd, int mode) throws Exception {
		nativeFchmodSync(fd, mode);
	}

	public static void fchownSync(int fd, int uid, int gid) throws Exception {
		nativeFchownSync(fd, uid, gid);
	}

	public static void fdatasyncSync(int fd) throws Exception {
		nativeFdatasyncSync(fd);
	}

	public static FileStat fstatSync(int fd) throws Exception {
		return nativeFstatSync(fd);
	}

	public static void fsyncSync(int fd) throws Exception {
		nativeFsyncSync(fd);
	}

	public static void ftruncateSync(int fd, long len) throws Exception {
		nativeFtruncateSync(fd, len);
	}

	public static void futimesSync(int fd, long atime, long mtime) throws Exception {
		nativeFutimesSync(fd, atime, mtime);
	}

	public static void lchmodSync(String path, int mode) throws Exception {
		nativeLchmodSync(path, mode);
	}

	public static void lchownSync(String path, int uid, int gid) throws Exception {
		nativeLchownSync(path, uid, gid);
	}

	public static void lutimesSync(String path, long atime, long mtime) throws Exception {
		nativeLutimesSync(path, atime, mtime);
	}

	public static void linkSync(String oldPath, String newPath) throws Exception {
		nativeLinkSync(oldPath, newPath);
	}

	public static FileStat lstatSync(String path) throws Exception {
		return nativeLstatSync(path);
	}

	public static void mkdirSync(String path, int mode, boolean recursive) throws Exception {
		nativeMkdirSync(path, mode, recursive);
	}

	public static String mkdtempSync(String prefix) throws Exception {
		return nativeMkdtempSync(prefix);
	}

	public static int openSync(String path, int flag, int mode) throws Exception {
		return nativeOpenSync(path, flag, mode);
	}

	public static FileDir openDirSync(String path) throws Exception {
		return nativeOpenDirSync(path);
	}

	public static long readSync(int fd, ByteBuffer buffer, long offset, long length, long position) throws Exception {
		return nativeReadSync(fd, buffer, offset, length, position);
	}

	public static long readSync(int fd, byte[] buffer, long offset, long length, long position) throws Exception {
		return nativeReadWithBytesSync(fd, buffer, offset, length, position);
	}

	public static Object[] readdirSync(String path, String encoding, boolean withTypes) throws Exception {
		if (withTypes) {
			return nativeReaddirWithFileTypesSync(path, encoding);
		} else {
			return nativeReaddirWithFileSync(path, encoding);
		}
	}

	public static ByteBuffer readFileSync(String path, int flags) throws Exception {
		return nativeReadFileSync(path, flags);
	}

	public static ByteBuffer readFileSync(int fd, int flags) throws Exception {
		return nativeReadFileWithFdSync(fd, flags);
	}

	public static byte[] readFileBytesSync(String path, int flags) throws Exception {
		return nativeReadFileBytesSync(path, flags);
	}

	public static byte[] readFileBytesSync(int fd, int flags) throws Exception {
		return nativeReadFileBytesWithFdSync(fd, flags);
	}

	public static String readLinkSync(String path, String encoding) throws Exception {
		return nativeReadLinkSync(path, encoding);
	}

	public static long readvSync(int fd, ByteBuffer[] buffers, long position) throws Exception {
		return nativeReadvSync(fd, buffers, position);
	}

	public static String realPathSync(String path) throws Exception {
		return nativeRealPathSync(path);
	}

	public static void renameSync(String oldPath, String newPath) throws Exception {
		nativeRenameSync(oldPath, newPath);
	}

	public static void rmdirSync(String path, int maxRetries, boolean recursive, long retryDelay) throws Exception {
		nativeRmdirSync(path, maxRetries, recursive, retryDelay);
	}

	public static void rmSync(String path, int maxRetries, boolean recursive, long retryDelay) throws Exception {
		nativeRmSync(path, maxRetries, recursive, retryDelay);
	}

	public static FileStat statSync(String path, boolean throwIfNoEntry) throws Exception {
		return nativeStatSync(path, throwIfNoEntry);
	}

	public static void symlinkSync(String target, String path) throws Exception {
		nativeSymlinkSync(target, path);
	}

	public static void truncateSync(String path, long len) throws Exception {
		nativeTruncateSync(path, len);
	}

	public static void unlinkSync(String path) throws Exception {
		nativeUnlinkSync(path);
	}

	public static void utimesSync(String path, long atime, long mtime) throws Exception {
		nativeUtimesSync(path, atime, mtime);
	}

	public static long writeSync(int fd, ByteBuffer buffer, long offset, long length, long position) throws Exception {
		return nativeWriteSync(fd, buffer, offset, length, position);
	}

	public static long writeSync(int fd, byte[] buffer, long offset, long length, long position) throws Exception {
		return nativeWriteBytesSync(fd, buffer, offset, length, position);
	}

	public static long writeSync(int fd, String string, String encoding, long position) throws Exception {
		return nativeWriteStringSync(fd, string, encoding, position);
	}

	public static void writeFileSync(int fd, String data) throws Exception {
		nativeWriteFileWithStringSync(fd, data);
	}

	public static void writeFileSync(int fd, ByteBuffer data) throws Exception {
		nativeWriteFileWithBufferSync(fd, data);
	}

	public static void writeFileSync(int fd, byte[] data) throws Exception {
		nativeWriteFileWithBytesSync(fd, data);
	}

	public static void writeFileSync(String path, String data, String encoding, int mode, int flag) throws Exception {
		nativeWriteFileWithStringFromPathSync(path, data, encoding, mode, flag);
	}

	public static void writeFileSync(String path, byte[] data, String encoding, int mode, int flag) throws Exception {
		nativeWriteFileWithBytesFromPathSync(path, data, encoding, mode, flag);
	}

	public static void writeFileSync(String path, ByteBuffer data, String encoding, int mode, int flag) throws Exception {
		nativeWriteFileWithBufferFromPathSync(path, data, encoding, mode, flag);
	}

	public static long writevSync(int fd, ByteBuffer[] buffers, long position) throws Exception {
		return nativeWritevSync(fd, buffers, position);
	}

//
//	public static void open(Context context, String path, String mode, String flag, Callback<FileHandle> callback) {
//		executors.execute(() -> {
//			try {
//				callback.onSuccess(openSync(context, path, mode, flag));
//			} catch (FileNotFoundException e) {
//				callback.onError(new Exception("No such file or directory"));
//			} catch (Exception e) {
//				callback.onError(e);
//			}
//		});
//	}
//
//	public static void close(FileHandle fd, Callback<Void> callback) {
//		executors.execute(() -> {
//			try {
//				closeSync(fd);
//				callback.onSuccess(null);
//			} catch (IOException e) {
//				callback.onError(e);
//			}
//		});
//	}
//
//	public static void closeSync(FileHandle fd) throws IOException {
//		FileHandle.nativeClose(fd.nativeFileHandle);
//		fd.nativeFileHandle = 0;
//		fd.closed = true;
//	}
//
//	public static void appendFileSync(FileHandle path, FileHandle data, String options) throws IOException {
//		FileHandle.nativeAppend(path.nativeFileHandle, data.nativeFileHandle);
//	}
//
//	public static void appendFileSync(FileHandle path, String data, String options) throws IOException {
//		FileHandle.nativeAppendString(path.nativeFileHandle, data);
//	}
//
//	public static void appendFileSync(FileHandle path, ByteBuffer data, String options) throws IOException {
//		if (!data.isDirect()) {
//			appendFileSync(path, data.array(), options);
//			return;
//		}
//		FileHandle.nativeAppendBuffer(path.nativeFileHandle, data);
//	}
//
//	public static void appendFileSync(FileHandle path, byte[] data, String options) throws IOException {
//		FileHandle.nativeAppendBytes(path.nativeFileHandle, data);
//	}
//
//	public static long readSync(FileHandle fd, ByteBuffer buffer, int offset, int length, int position) throws IOException {
//		if (!buffer.isDirect()) {
//			return readSync(fd, buffer.array(), offset, length, position);
//		}
//
//		return FileHandle.nativeReadBuffer(fd.nativeFileHandle, buffer, offset, length, position);
//	}
//
//	public static long readSync(FileHandle fd, byte[] buffer, int offset, int length, int position) throws IOException {
//		return FileHandle.nativeRead(fd.nativeFileHandle, buffer, offset, length, position);
//	}
//
//	public static void unlinkSync(Context context, String path) {
//		context.getContentResolver().delete(
//			Uri.parse(path), null, null
//		);
//	}
//
//	public static void unlink(Context context, String path, Callback<Void> callback) {
//		executors.execute(() -> {
//			try {
//				context.getContentResolver().delete(
//					Uri.parse(path), null, null
//				);
//				callback.onSuccess(null);
//			} catch (Exception e) {
//				callback.onError(e);
//			}
//
//		});
//	}
//
//	public static JSONObject statSync(FileHandle fd) throws IOException {
//		return FileHandle.nativeStat(fd.nativeFileHandle);
//	}
//
//	public static boolean existsSync(Context context, String path) {
//		return Exists(context, path);
//	}
//
//	public static void exists(Context context, String path, Callback<Boolean> callback) {
//		executors.execute(() -> {
//			boolean exists = Exists(context, path);
//			callback.onSuccess(exists);
//		});
//	}
//
//	public static void fdatasyncSync(FileHandle fd) {
//		FileHandle.nativeDataSync(fd.nativeFileHandle);
//	}
//
//	public static void fsyncSync(FileHandle fd) {
//		FileHandle.nativeSync(fd.nativeFileHandle);
//	}
//
//	public static void futimesSync(FileHandle fd, long atime, long mtime) {
//		FileHandle.nativeFutimes(fd.nativeFileHandle, atime, mtime);
//	}
//
//	public static void copyFileSync(String src, String dest) {
//		FileHandle.nativeCopyFile(src, dest);
//	}
//
//	public static void copyFile(String src, String dest, Callback<Void> callback) {
//		executors.execute(() -> {
//			try {
//				FileHandle.nativeCopyFile(src, dest);
//				callback.onSuccess(null);
//			} catch (Exception e) {
//				callback.onError(e);
//			}
//		});
//	}
//
//	public static void writeSync(FileHandle path, FileHandle data, String options) throws IOException {
//		FileHandle.nativeWrite(path.nativeFileHandle, data.nativeFileHandle);
//	}
//
//	public static void writeSync(FileHandle path, String data, String options) throws IOException {
//		FileHandle.nativeWriteString(path.nativeFileHandle, data);
//	}
//
//	public static void writeSync(FileHandle path, ByteBuffer data, String options) throws IOException {
//		if (!data.isDirect()) {
//			appendFileSync(path, data.array(), options);
//			return;
//		}
//		FileHandle.nativeWriteBuffer(path.nativeFileHandle, data);
//	}
//
//	public static void writeSync(FileHandle path, byte[] data, String options) throws IOException {
//		FileHandle.nativeWriteBytes(path.nativeFileHandle, data);
//	}


//	public static byte[] readFileSync(Context context, String options) {
//		JSONObject config;
//		try {
//			config = new JSONObject(options);
//		} catch (JSONException e) {
//		}
//
//		String path = config.optString(FILE_OPTIONS_PATH, "");
//		String directory = config.optString(FILE_OPTIONS_DIRECTORY, "");
//		if (directory.equals(FILE_OPTIONS_DIRECTORY_CACHE)) {
//			new File(context.getCacheDir(), path).getAbsolutePath()
//		}
//	}


//	static boolean Exists(Context context, String path) {
//		boolean exists = false;
//		try {
//			Uri uri = Uri.parse(path);
	//content://
//			if (path.startsWith(ContentResolver.SCHEME_CONTENT + "://")) {
//				ParcelFileDescriptor pfd = context.getContentResolver().openFileDescriptor(uri, "r");
//				exists = true;
//				pfd.close();
	//android-asset://
//			} else if (path.startsWith(ContentResolver.SCHEME_ANDROID_RESOURCE + "://")) {
//				AssetFileDescriptor afd = context.getContentResolver().openAssetFileDescriptor(uri, "r");
//				exists = true;
//				afd.close();
//			} else {
//				ParcelFileDescriptor pfd = ParcelFileDescriptor.open(new File(path), ParcelFileDescriptor.MODE_READ_ONLY);
//				exists = true;
//				pfd.close();
//			}
//		} catch (FileNotFoundException ignored) {
//		} catch (IOException ignored) {
//		}
//
//		return exists;
//	}
//
//	static void checkOrThrow(Context context, String path) throws Exception {
//		if (FileSystem.Exists(context, path)) {
//			throw new Exception("File exists");
//		}
//	}
//
//	public static FileHandle openSync(Context context, String path, String modeStr, String flag) throws Exception {
//		int mode = 0;
//		String modeString = "";
//
//		switch (modeStr) {
//			case "a":
//				mode = ParcelFileDescriptor.MODE_CREATE | ParcelFileDescriptor.MODE_APPEND;
//				modeString = "a";
//				break;
//			case "ax":
//				checkOrThrow(context, path);
//				mode = ParcelFileDescriptor.MODE_CREATE | ParcelFileDescriptor.MODE_APPEND;
//				modeString = "a";
//				break;
//			case "a+":
//				mode = ParcelFileDescriptor.MODE_CREATE | ParcelFileDescriptor.MODE_APPEND | ParcelFileDescriptor.MODE_READ_ONLY;
//				modeString = "ra";
//				break;
//			case "ax+":
//				checkOrThrow(context, path);
//				mode = ParcelFileDescriptor.MODE_CREATE | ParcelFileDescriptor.MODE_APPEND | ParcelFileDescriptor.MODE_READ_ONLY;
//				modeString = "ra";
//				break;
//			case "as":
//				mode = ParcelFileDescriptor.MODE_CREATE | ParcelFileDescriptor.MODE_APPEND;
//				modeString = "a";
//				break;
//			case "as+":
//				mode = ParcelFileDescriptor.MODE_CREATE | ParcelFileDescriptor.MODE_APPEND | ParcelFileDescriptor.MODE_READ_ONLY;
//				modeString = "ra";
//				break;
//			case "r":
//				mode = ParcelFileDescriptor.MODE_READ_ONLY;
//				modeString = "r";
//				break;
//			case "r+":
//			case "rs+":
//				mode = ParcelFileDescriptor.MODE_READ_ONLY | ParcelFileDescriptor.MODE_WRITE_ONLY;
//				modeString = "rw";
//				break;
//			case "w":
//				mode = ParcelFileDescriptor.MODE_CREATE | ParcelFileDescriptor.MODE_WRITE_ONLY;
//				modeString = "w";
//				break;
//			case "wx":
//				checkOrThrow(context, path);
//				mode = ParcelFileDescriptor.MODE_CREATE | ParcelFileDescriptor.MODE_WRITE_ONLY;
//				modeString = "w";
//				break;
//			case "w+":
//				mode = ParcelFileDescriptor.MODE_CREATE | ParcelFileDescriptor.MODE_WRITE_ONLY | ParcelFileDescriptor.MODE_READ_ONLY | ParcelFileDescriptor.MODE_TRUNCATE;
//				modeString = "rwt";
//				break;
//			case "wx+":
//				checkOrThrow(context, path);
//				mode = ParcelFileDescriptor.MODE_CREATE | ParcelFileDescriptor.MODE_WRITE_ONLY | ParcelFileDescriptor.MODE_READ_ONLY | ParcelFileDescriptor.MODE_TRUNCATE;
//				modeString = "rwt";
//				break;
//		}
//
//		try {
//			if (path.startsWith(ContentResolver.SCHEME_CONTENT + "://")) {
//				return new FileHandle(context.getContentResolver().openFileDescriptor(
//					Uri.parse(path), modeString));
//			} else if (path.startsWith(ContentResolver.SCHEME_ANDROID_RESOURCE + "://")) {
//				return new FileHandle(context.getContentResolver().openAssetFileDescriptor(
//					Uri.parse(path), modeString).getParcelFileDescriptor());
//			} else {
//				return new FileHandle(ParcelFileDescriptor.open(new File(path), mode));
//			}
//		} catch (FileNotFoundException e) {
//			if (e.toString().contains("EACCES")) {
//				throw new Exception("Permission denied");
//			}
//			throw new Exception("No such file or directory");
//		}
//	}
//
//	public static void open(Context context, String path, String mode, String flag, Callback<FileHandle> callback) {
//		executors.execute(() -> {
//			try {
//				callback.onSuccess(openSync(context, path, mode, flag));
//			} catch (FileNotFoundException e) {
//				callback.onError(new Exception("No such file or directory"));
//			} catch (Exception e) {
//				callback.onError(e);
//			}
//		});
//	}
//
//	public static void close(FileHandle fd, Callback<Void> callback) {
//		executors.execute(() -> {
//			try {
//				closeSync(fd);
//				callback.onSuccess(null);
//			} catch (IOException e) {
//				callback.onError(e);
//			}
//		});
//	}
//
//	public static void closeSync(FileHandle fd) throws IOException {
//		FileHandle.nativeClose(fd.nativeFileHandle);
//		fd.nativeFileHandle = 0;
//		fd.closed = true;
//	}
//
//	public static void appendFileSync(FileHandle path, FileHandle data, String options) throws IOException {
//		FileHandle.nativeAppend(path.nativeFileHandle, data.nativeFileHandle);
//	}
//
//	public static void appendFileSync(FileHandle path, String data, String options) throws IOException {
//		FileHandle.nativeAppendString(path.nativeFileHandle, data);
//	}
//
//	public static void appendFileSync(FileHandle path, ByteBuffer data, String options) throws IOException {
//		if (!data.isDirect()) {
//			appendFileSync(path, data.array(), options);
//			return;
//		}
//		FileHandle.nativeAppendBuffer(path.nativeFileHandle, data);
//	}
//
//	public static void appendFileSync(FileHandle path, byte[] data, String options) throws IOException {
//		FileHandle.nativeAppendBytes(path.nativeFileHandle, data);
//	}
//
//	public static long readSync(FileHandle fd, ByteBuffer buffer, int offset, int length, int position) throws IOException {
//		if (!buffer.isDirect()) {
//			return readSync(fd, buffer.array(), offset, length, position);
//		}
//
//		return FileHandle.nativeReadBuffer(fd.nativeFileHandle, buffer, offset, length, position);
//	}
//
//	public static long readSync(FileHandle fd, byte[] buffer, int offset, int length, int position) throws IOException {
//		return FileHandle.nativeRead(fd.nativeFileHandle, buffer, offset, length, position);
//	}
//
//	public static void unlinkSync(Context context, String path) {
//		context.getContentResolver().delete(
//			Uri.parse(path), null, null
//		);
//	}
//
//	public static void unlink(Context context, String path, Callback<Void> callback) {
//		executors.execute(() -> {
//			try {
//				context.getContentResolver().delete(
//					Uri.parse(path), null, null
//				);
//				callback.onSuccess(null);
//			} catch (Exception e) {
//				callback.onError(e);
//			}
//
//		});
//	}
//
//	public static JSONObject statSync(FileHandle fd) throws IOException {
//		return FileHandle.nativeStat(fd.nativeFileHandle);
//	}
//
//	public static boolean existsSync(Context context, String path) {
//		return Exists(context, path);
//	}
//
//	public static void exists(Context context, String path, Callback<Boolean> callback) {
//		executors.execute(() -> {
//			boolean exists = Exists(context, path);
//			callback.onSuccess(exists);
//		});
//	}
//
//	public static void fdatasyncSync(FileHandle fd) {
//		FileHandle.nativeDataSync(fd.nativeFileHandle);
//	}
//
//	public static void fsyncSync(FileHandle fd) {
//		FileHandle.nativeSync(fd.nativeFileHandle);
//	}
//
//	public static void futimesSync(FileHandle fd, long atime, long mtime) {
//		FileHandle.nativeFutimes(fd.nativeFileHandle, atime, mtime);
//	}
//
//	public static void copyFileSync(String src, String dest) {
//		FileHandle.nativeCopyFile(src, dest);
//	}
//
//	public static void copyFile(String src, String dest, Callback<Void> callback) {
//		executors.execute(() -> {
//			try {
//				FileHandle.nativeCopyFile(src, dest);
//				callback.onSuccess(null);
//			} catch (Exception e) {
//				callback.onError(e);
//			}
//		});
//	}
//
//	public static void writeSync(FileHandle path, FileHandle data, String options) throws IOException {
//		FileHandle.nativeWrite(path.nativeFileHandle, data.nativeFileHandle);
//	}
//
//	public static void writeSync(FileHandle path, String data, String options) throws IOException {
//		FileHandle.nativeWriteString(path.nativeFileHandle, data);
//	}
//
//	public static void writeSync(FileHandle path, ByteBuffer data, String options) throws IOException {
//		if (!data.isDirect()) {
//			appendFileSync(path, data.array(), options);
//			return;
//		}
//		FileHandle.nativeWriteBuffer(path.nativeFileHandle, data);
//	}
//
//	public static void writeSync(FileHandle path, byte[] data, String options) throws IOException {
//		FileHandle.nativeWriteBytes(path.nativeFileHandle, data);
//	}

}
