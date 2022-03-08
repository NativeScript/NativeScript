package org.nativescript.widgets.filesystem;

public class FileDirent {
	long nativeFileDirent;

	private static native String nativeName(long nativeFileDirent);

	private static native void nativeDispose(long nativeFileDirent);

	private static native boolean nativeIsBlockDevice(long nativeFileDirent);

	private static native boolean nativeIsCharacterDevice(long nativeFileDirent);

	private static native boolean nativeIsDirectory(long nativeFileDirent);

	private static native boolean nativeIsFifo(long nativeFileDirent);

	private static native boolean nativeIsFile(long nativeFileDirent);

	private static native boolean nativeIsSocket(long nativeFileDirent);

	private static native boolean nativeIsSymbolicLink(long nativeFileDirent);

	static {
		FileSystem.loadNative();
	}

	FileDirent(long dirent) {
		nativeFileDirent = dirent;
	}

	public String getName() {
		return nativeName(nativeFileDirent);
	}

	public boolean isBlockDevice() {
		return nativeIsBlockDevice(nativeFileDirent);
	}

	public boolean isCharacterDevice() {
		return nativeIsCharacterDevice(nativeFileDirent);
	}

	public boolean isDirectory() {
		return nativeIsDirectory(nativeFileDirent);
	}

	public boolean isFifo() {
		return nativeIsFifo(nativeFileDirent);
	}

	public boolean isFile() {
		return nativeIsFile(nativeFileDirent);
	}

	public boolean isSocket() {
		return nativeIsSocket(nativeFileDirent);
	}

	public boolean isSymbolicLink() {
		return nativeIsSymbolicLink(nativeFileDirent);
	}

	@Override
	protected void finalize() throws Throwable {
		nativeDispose(nativeFileDirent);
	}
}
