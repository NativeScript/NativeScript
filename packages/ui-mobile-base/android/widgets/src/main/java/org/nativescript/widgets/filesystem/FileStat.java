package org.nativescript.widgets.filesystem;

public class FileStat {
	long dev;
	long ino;
	int mode;
	long nlink;
	int uid;
	int gid;
	long rdev;
	long size;
	long blksize;
	long blocks;
	double atimeMs;
	double mtimeMs;
	double ctimeMs;
	double birthtimeMs;
	double birthtime;
	double atime;
	double mtime;
	double ctime;
	boolean isBlockDevice;
	boolean isCharacterDevice;
	boolean isDirectory;
	boolean isFIFO;
	boolean isFile;
	boolean isSocket;
	boolean isSymbolicLink;

	static {
		FileSystem.loadNative();
	}

	public long getDev() {
		return dev;
	}

	public long getIno() {
		return ino;
	}

	public int getMode() {
		return mode;
	}

	public long getNlink() {
		return nlink;
	}

	public int getUid() {
		return uid;
	}

	public int getGid() {
		return gid;
	}

	public long getRdev() {
		return rdev;
	}

	public long getSize() {
		return size;
	}

	public long getBlksize() {
		return blksize;
	}

	public long getBlocks() {
		return blocks;
	}

	public double getAtimeMs() {
		return atimeMs;
	}

	public double getMtimeMs() {
		return mtimeMs;
	}

	public double getCtimeMs() {
		return ctimeMs;
	}

	public double getBirthtimeMs() {
		return birthtimeMs;
	}

	public double getBirthtime() {
		return birthtime;
	}

	public double getAtime() {
		return atime;
	}

	public double getMtime() {
		return mtime;
	}

	public double getCtime() {
		return ctime;
	}

	public boolean isBlockDevice() {
		return isBlockDevice;
	}

	public boolean isCharacterDevice() {
		return isCharacterDevice;
	}

	public boolean isDirectory() {
		return isDirectory;
	}

	public boolean isFIFO() {
		return isFIFO;
	}

	public boolean isFile() {
		return isFile;
	}

	public boolean isSocket() {
		return isSocket;
	}

	public boolean isSymbolicLink() {
		return isSymbolicLink;
	}
}
