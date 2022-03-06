/**
 * Flag indicating to open a file for read-only access.
 */
export const O_RDONLY;
/**
 * Flag indicating to open a file for write-only access.
 */
export const O_WRONLY;
/**
 * Flag indicating to open a file for read-write access.
 */
export const O_RDWR;
/**
 * Flag indicating to create the file if it does not already exist.
 */
export const O_CREAT;
/**
 * Flag indicating that opening a file should fail if the O_CREAT flag is set and the file already exists.
 */
export const O_EXCL;
/**
 * Flag indicating that if path identifies a terminal device, opening the path shall not cause that terminal to become the controlling terminal for the process (if the process does not already have one).
 */
export const O_NOCTTY;
/***
 * Flag indicating that if the file exists and is a regular file, and the file is opened successfully for write access, its length shall be truncated to zero.
 */
export const O_TRUNC;
/**
 * Flag indicating that data will be appended to the end of the file.
 */
export const O_APPEND;
/**
 * Flag indicating that the open should fail if the path is not a directory.
 */
export const O_DIRECTORY;
/**
 * Flag indicating reading accesses to the file system will no longer result in an update to the atime information associated with the file. This flag is available on Linux operating systems only.
 */
export const O_NOATIME;
/**
 * Flag indicating that the open should fail if the path is a symbolic link.
 */
export const O_NOFOLLOW;
/**
 * Flag indicating that the file is opened for synchronized I/O with write operations waiting for file integrity.
 */
export const O_SYNC;
/**
 * Flag indicating that the file is opened for synchronized I/O with write operations waiting for data integrity.
 */
export const O_DSYNC;
/**
 * Flag indicating to open the symbolic link itself rather than the resource it is pointing to.
 */
export const O_SYMLINK;
/**
 * When set, an attempt will be made to minimize caching effects of file I/O.
 */
export const O_DIRECT;
/**
 * Flag indicating to open the file in nonblocking mode when possible.
 */
export const O_NONBLOCK;

/**
 * Flag indicating that the file is visible to the calling process. This is useful for determining if a file exists, but says nothing about rwx permissions. Default if no mode is specified.
 */
export const F_OK;
/**
 * Flag indicating that the file can be read by the calling process.
 */
export const R_OK;
/**
 * Flag indicating that the file can be written by the calling process.
 */
export const W_OK;
/**
 * Flag indicating that the file can be executed by the calling process.
 */
export const X_OK;

/**
 * If present, the copy operation will fail with an error if the destination path already exists.
 */
export const COPYFILE_EXCL;
/**
 * If present, the copy operation will attempt to create a copy-on-write reflink. If the underlying platform does not support copy-on-write, then a fallback copy mechanism is used.
 */
export const COPYFILE_FICLONE;
/**
 * If present, the copy operation will attempt to create a copy-on-write reflink. If the underlying platform does not support copy-on-write, then the operation will fail with an error.
 */
export const COPYFILE_FICLONE_FORCE;

/**
 * Bit mask used to extract the file type code.
 */
export const S_IFMT;
/**
 * File type constant for a regular file.
 */
export const S_IFREG;
/**
 * File type constant for a directory.
 */
export const S_IFDIR;
/**
 * File type constant for a character-oriented device file.
 */
export const S_IFCHR;
/**
 * File type constant for a block-oriented device file.
 */
export const S_IFBLK;
/**
 * File type constant for a FIFO/pipe.
 */
export const S_IFIFO;
/**
 * File type constant for a symbolic link.
 */
export const S_IFLNK;
/**
 * File type constant for a socket.
 */
export const S_IFSOCK;

/**
 * File mode indicating readable, writable, and executable by owner.
 */
export const S_IRWXU;
/**
 * File mode indicating readable by owner.
 */
export const S_IRUSR;
/**
 * File mode indicating writable by owner.
 */
export const S_IWUSR;
/**
 * File mode indicating executable by owner.
 */
export const S_IXUSR;
/**
 * File mode indicating readable, writable, and executable by group.
 */
export const S_IRWXG;
/**
 * File mode indicating readable by group.
 */
export const S_IRGRP;
/**
 * File mode indicating writable by group.
 */
export const S_IWGRP;
/**
 * File mode indicating executable by group.
 */
export const S_IXGRP;
/**
 * File mode indicating readable, writable, and executable by others.
 */
export const S_IRWXO;
/**
 * File mode indicating readable by others.
 */
export const S_IROTH;
/**
 * File mode indicating writable by others.
 */
export const S_IWOTH;
/**
 * File mode indicating executable by others.
 */
export const S_IXOTH;
