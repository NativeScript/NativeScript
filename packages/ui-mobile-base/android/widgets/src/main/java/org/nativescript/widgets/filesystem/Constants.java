package org.nativescript.widgets.filesystem;

public class Constants {


	static {
		FileSystem.loadNative();
	}

	/**
	 * Flag indicating to open a file for read-only access.
	 */
	public static int O_RDONLY;
	/**
	 * Flag indicating to open a file for write-only access.
	 */
	public static int O_WRONLY;
	/**
	 * Flag indicating to open a file for read-write access.
	 */
	public static int O_RDWR;
	/**
	 * Flag indicating to create the file if it does not already exist.
	 */
	public static int O_CREAT;
	/**
	 * Flag indicating that opening a file should fail if the O_CREAT flag is set and the file already exists.
	 */
	public static int O_EXCL;
	/**
	 * Flag indicating that if path identifies a terminal device, opening the path shall not cause that terminal to become the controlling terminal for the process (if the process does not already have one).
	 */
	public static int O_NOCTTY;
	/***
	 * Flag indicating that if the file exists and is a regular file, and the file is opened successfully for write access, its length shall be truncated to zero.
	 */
	public static int O_TRUNC;
	/**
	 * Flag indicating that data will be appended to the end of the file.
	 */
	public static int O_APPEND;
	/**
	 * Flag indicating that the open should fail if the path is not a directory.
	 */
	public static int O_DIRECTORY;
	/**
	 * Flag indicating reading accesses to the file system will no longer result in an update to the atime information associated with the file. This flag is available on Linux operating systems only.
	 */
	public static int O_NOATIME;
	/**
	 * Flag indicating that the open should fail if the path is a symbolic link.
	 */
	public static int O_NOFOLLOW;
	/**
	 * Flag indicating that the file is opened for synchronized I/O with write operations waiting for file integrity.
	 */
	public static int O_SYNC;
	/**
	 * Flag indicating that the file is opened for synchronized I/O with write operations waiting for data integrity.
	 */
	public static int O_DSYNC;
	/**
	 * Flag indicating to open the symbolic link itself rather than the resource it is pointing to.
	 */
	public static int O_SYMLINK;
	/**
	 * When set, an attempt will be made to minimize caching effects of file I/O.
	 */
	public static int O_DIRECT;
	/**
	 * Flag indicating to open the file in nonblocking mode when possible.
	 */
	public static int O_NONBLOCK;


	/**
	 * Flag indicating that the file is visible to the calling process. This is useful for determining if a file exists, but says nothing about rwx permissions. Default if no mode is specified.
	 */
	public static int F_OK;
	/**
	 * Flag indicating that the file can be read by the calling process.
	 */
	public static int R_OK;
	/**
	 * Flag indicating that the file can be written by the calling process.
	 */
	public static int W_OK;
	/**
	 * Flag indicating that the file can be executed by the calling process.
	 */
	public static int X_OK;

	/**
	 * If present, the copy operation will fail with an error if the destination path already exists.
	 */
	public static int COPYFILE_EXCL;
	/**
	 * If present, the copy operation will attempt to create a copy-on-write reflink. If the underlying platform does not support copy-on-write, then a fallback copy mechanism is used.
	 */
	public static int COPYFILE_FICLONE;
	/**
	 * If present, the copy operation will attempt to create a copy-on-write reflink. If the underlying platform does not support copy-on-write, then the operation will fail with an error.
	 */
	public static int COPYFILE_FICLONE_FORCE;

	/**
	 * Bit mask used to extract the file type code.
	 */
	public static int S_IFMT;
	/**
	 * File type constant for a regular file.
	 */
	public static int S_IFREG;
	/**
	 * File type constant for a directory.
	 */
	public static int S_IFDIR;
	/**
	 * File type constant for a character-oriented device file.
	 */
	public static int S_IFCHR;
	/**
	 * File type constant for a block-oriented device file.
	 */
	public static int S_IFBLK;
	/**
	 * File type constant for a FIFO/pipe.
	 */
	public static int S_IFIFO;
	/**
	 * File type constant for a symbolic link.
	 */
	public static int S_IFLNK;
	/**
	 * File type constant for a socket.
	 */
	public static int S_IFSOCK;

	/**
	 * File mode indicating readable, writable, and executable by owner.
	 */
	public static int S_IRWXU;
	/**
	 * File mode indicating readable by owner.
	 */
	public static int S_IRUSR;
	/**
	 * File mode indicating writable by owner.
	 */
	public static int S_IWUSR;
	/**
	 * File mode indicating executable by owner.
	 */
	public static int S_IXUSR;
	/**
	 * File mode indicating readable, writable, and executable by group.
	 */
	public static int S_IRWXG;
	/**
	 * File mode indicating readable by group.
	 */
	public static int S_IRGRP;
	/**
	 * File mode indicating writable by group.
	 */
	public static int S_IWGRP;
	/**
	 * File mode indicating executable by group.
	 */
	public static int S_IXGRP;
	/**
	 * File mode indicating readable, writable, and executable by others.
	 */
	public static int S_IRWXO;
	/**
	 * File mode indicating readable by others.
	 */
	public static int S_IROTH;
	/**
	 * File mode indicating writable by others.
	 */
	public static int S_IWOTH;
	/**
	 * File mode indicating executable by others.
	 */
	public static int S_IXOTH;
}
