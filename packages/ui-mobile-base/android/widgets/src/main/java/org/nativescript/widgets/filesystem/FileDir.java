package org.nativescript.widgets.filesystem;

public class FileDir {
	long nativeFileDir;

	private static native String nativePath(long fileDir);

	private static native String nativeCloseSync(long fileDir);

	private static native void nativeClose(long fileDir, long callback);

	private static native FileDirent nativeReadSync(long fileDir);

	private static native void nativeRead(long fileDir, long callback);

	private static native void dispose(long nativeFileDir);

	static {
		FileSystem.loadNative();
	}

	FileDir(long dir) {
		nativeFileDir = dir;
	}

	public String getPath() {
		return nativePath(nativeFileDir);
	}

	public void closeSync() {
		nativeCloseSync(nativeFileDir);
	}

	public void close(AsyncCallback<Void> callback) {
		nativeClose(nativeFileDir, callback.nativeCallback);
	}

	public FileDirent readSync() {
		return nativeReadSync(nativeFileDir);
	}

	public void read(AsyncCallback<FileDirent> callback) {
		nativeRead(nativeFileDir, callback.nativeCallback);
	}

	@Override
	protected void finalize() throws Throwable {
		dispose(nativeFileDir);
	}
}
