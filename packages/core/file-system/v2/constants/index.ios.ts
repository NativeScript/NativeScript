/**
 * Flag indicating to open a file for read-only access.
 */
export const O_RDONLY = TNSFsConstants.FILE_OPEN_OPTIONS_O_RDONLY();
/**
 * Flag indicating to open a file for write-only access.
 */
export const O_WRONLY = TNSFsConstants.FILE_OPEN_OPTIONS_O_WRONLY();
/**
 * Flag indicating to open a file for read-write access.
 */
export const O_RDWR = TNSFsConstants.FILE_OPEN_OPTIONS_O_RDWR();
/**
 * Flag indicating to create the file if it does not already exist.
 */
export const O_CREAT = TNSFsConstants.FILE_OPEN_OPTIONS_O_CREAT();
/**
 * Flag indicating that opening a file should fail if the O_CREAT flag is set and the file already exists.
 */
export const O_EXCL = TNSFsConstants.FILE_OPEN_OPTIONS_O_EXCL();
/**
 * Flag indicating that if path identifies a terminal device, opening the path shall not cause that terminal to become the controlling terminal for the process (if the process does not already have one).
 */
export const O_NOCTTY = TNSFsConstants.FILE_OPEN_OPTIONS_O_NOCTTY();
/***
 * Flag indicating that if the file exists and is a regular file, and the file is opened successfully for write access, its length shall be truncated to zero.
 */
export const O_TRUNC = TNSFsConstants.FILE_OPEN_OPTIONS_O_TRUNC();
/**
 * Flag indicating that data will be appended to the end of the file.
 */
export const O_APPEND = TNSFsConstants.FILE_OPEN_OPTIONS_O_APPEND();
/**
 * Flag indicating that the open should fail if the path is not a directory.
 */
export const O_DIRECTORY = TNSFsConstants.FILE_OPEN_OPTIONS_O_DIRECTORY();
/**
 * Flag indicating reading accesses to the file system will no longer result in an update to the atime information associated with the file. This flag is available on Linux operating systems only.
 */
export const O_NOATIME = TNSFsConstants.FILE_OPEN_OPTIONS_O_NOATIME();
/**
 * Flag indicating that the open should fail if the path is a symbolic link.
 */
export const O_NOFOLLOW = TNSFsConstants.FILE_OPEN_OPTIONS_O_NOFOLLOW();
/**
 * Flag indicating that the file is opened for synchronized I/O with write operations waiting for file integrity.
 */
export const O_SYNC = TNSFsConstants.FILE_OPEN_OPTIONS_O_SYNC();
/**
 * Flag indicating that the file is opened for synchronized I/O with write operations waiting for data integrity.
 */
export const O_DSYNC = TNSFsConstants.FILE_OPEN_OPTIONS_O_DSYNC();
/**
 * Flag indicating to open the symbolic link itself rather than the resource it is pointing to.
 */
export const O_SYMLINK = TNSFsConstants.FILE_OPEN_OPTIONS_O_SYMLINK();
/**
 * When set, an attempt will be made to minimize caching effects of file I/O.
 */
export const O_DIRECT = TNSFsConstants.FILE_OPEN_OPTIONS_O_DIRECT();
/**
 * Flag indicating to open the file in nonblocking mode when possible.
 */
export const O_NONBLOCK = TNSFsConstants.FILE_OPEN_OPTIONS_O_NONBLOCK();

/**
 * Flag indicating that the file is visible to the calling process. This is useful for determining if a file exists, but says nothing about rwx permissions. Default if no mode is specified.
 */
export const F_OK = TNSFsConstants.FILE_ACCESS_OPTIONS_F_OK();
/**
 * Flag indicating that the file can be read by the calling process.
 */
export const R_OK = TNSFsConstants.FILE_ACCESS_OPTIONS_R_OK();
/**
 * Flag indicating that the file can be written by the calling process.
 */
export const W_OK = TNSFsConstants.FILE_ACCESS_OPTIONS_W_OK();
/**
 * Flag indicating that the file can be executed by the calling process.
 */
export const X_OK = TNSFsConstants.FILE_ACCESS_OPTIONS_X_OK();

/**
 * If present, the copy operation will fail with an error if the destination path already exists.
 */
export const COPYFILE_EXCL = TNSFsConstants.FILE_COPY_OPTIONS_COPYFILE_EXCL();
/**
 * If present, the copy operation will attempt to create a copy-on-write reflink. If the underlying platform does not support copy-on-write, then a fallback copy mechanism is used.
 */
export const COPYFILE_FICLONE = TNSFsConstants.FILE_COPY_OPTIONS_COPYFILE_FICLONE();
/**
 * If present, the copy operation will attempt to create a copy-on-write reflink. If the underlying platform does not support copy-on-write, then the operation will fail with an error.
 */
export const COPYFILE_FICLONE_FORCE = TNSFsConstants.FILE_COPY_OPTIONS_COPYFILE_FICLONE_FORCE();

/**
 * Bit mask used to extract the file type code.
 */
export const S_IFMT = TNSFsConstants.FILE_TYPE_OPTIONS_S_IFMT();
/**
 * File type constant for a regular file.
 */
export const S_IFREG = TNSFsConstants.FILE_TYPE_OPTIONS_S_IFREG();
/**
 * File type constant for a directory.
 */
export const S_IFDIR = TNSFsConstants.FILE_TYPE_OPTIONS_S_IFDIR();
/**
 * File type constant for a character-oriented device file.
 */
export const S_IFCHR = TNSFsConstants.FILE_TYPE_OPTIONS_S_IFCHR();
/**
 * File type constant for a block-oriented device file.
 */
export const S_IFBLK = TNSFsConstants.FILE_TYPE_OPTIONS_S_IFBLK();
/**
 * File type constant for a FIFO/pipe.
 */
export const S_IFIFO = TNSFsConstants.FILE_TYPE_OPTIONS_S_IFIFO();
/**
 * File type constant for a symbolic link.
 */
export const S_IFLNK = TNSFsConstants.FILE_TYPE_OPTIONS_S_IFLNK();
/**
 * File type constant for a socket.
 */
export const S_IFSOCK = TNSFsConstants.FILE_TYPE_OPTIONS_S_IFSOCK();

/**
 * File mode indicating readable, writable, and executable by owner.
 */
export const S_IRWXU = TNSFsConstants.FILE_MODE_OPTIONS_S_IRWXU();
/**
 * File mode indicating readable by owner.
 */
export const S_IRUSR = TNSFsConstants.FILE_MODE_OPTIONS_S_IRUSR();
/**
 * File mode indicating writable by owner.
 */
export const S_IWUSR = TNSFsConstants.FILE_MODE_OPTIONS_S_IWUSR();
/**
 * File mode indicating executable by owner.
 */
export const S_IXUSR = TNSFsConstants.FILE_MODE_OPTIONS_S_IXUSR();
/**
 * File mode indicating readable, writable, and executable by group.
 */
export const S_IRWXG = TNSFsConstants.FILE_MODE_OPTIONS_S_IRWXG();
/**
 * File mode indicating readable by group.
 */
export const S_IRGRP = TNSFsConstants.FILE_MODE_OPTIONS_S_IRGRP();
/**
 * File mode indicating writable by group.
 */
export const S_IWGRP = TNSFsConstants.FILE_MODE_OPTIONS_S_IWGRP();
/**
 * File mode indicating executable by group.
 */
export const S_IXGRP = TNSFsConstants.FILE_MODE_OPTIONS_S_IXGRP();
/**
 * File mode indicating readable, writable, and executable by others.
 */
export const S_IRWXO = TNSFsConstants.FILE_MODE_OPTIONS_S_IRWXO();
/**
 * File mode indicating readable by others.
 */
export const S_IROTH = TNSFsConstants.FILE_MODE_OPTIONS_S_IROTH();
/**
 * File mode indicating writable by others.
 */
export const S_IWOTH = TNSFsConstants.FILE_MODE_OPTIONS_S_IWOTH();
/**
 * File mode indicating executable by others.
 */
export const S_IXOTH = TNSFsConstants.FILE_MODE_OPTIONS_S_IXOTH();
