use std::os::raw::c_uint;

use libc::{c_int, mode_t};

#[no_mangle]
pub static FILE_COPY_OPTIONS_COPYFILE_EXCL: c_uint = 1;

#[no_mangle]
pub static FILE_COPY_OPTIONS_COPYFILE_FICLONE: c_uint = 2;

#[no_mangle]
pub static FILE_COPY_OPTIONS_COPYFILE_FICLONE_FORCE: c_uint = 3;

#[no_mangle]
pub static FILE_OPEN_OPTIONS_O_RDONLY: c_int = libc::O_RDONLY;

#[no_mangle]
pub static FILE_OPEN_OPTIONS_O_WRONLY: c_int = libc::O_WRONLY;

#[no_mangle]
pub static FILE_OPEN_OPTIONS_O_RDWR: c_int = libc::O_RDWR;

#[cfg(any(target_os = "android"))]
#[no_mangle]
pub static FILE_OPEN_OPTIONS_O_CREAT: c_int = libc::O_CREAT;

#[cfg(any(target_os = "macos", target_os = "ios"))]
#[no_mangle]
pub static FILE_OPEN_OPTIONS_O_CREAT: c_int = libc::O_CREAT;

#[no_mangle]
pub static FILE_OPEN_OPTIONS_O_EXCL: c_int = libc::O_EXCL;
#[no_mangle]
pub static FILE_OPEN_OPTIONS_O_NOCTTY: c_int = libc::O_NOCTTY;
#[no_mangle]
pub static FILE_OPEN_OPTIONS_O_TRUNC: c_int = libc::O_TRUNC;
#[no_mangle]
pub static FILE_OPEN_OPTIONS_O_APPEND: c_int = libc::O_APPEND;
#[no_mangle]
pub static FILE_OPEN_OPTIONS_O_DIRECTORY: c_int = libc::O_DIRECTORY;

#[cfg(any(target_os = "android"))]
#[no_mangle]
pub static FILE_OPEN_OPTIONS_O_NOATIME: c_int = libc::MS_NOATIME as c_int;

#[cfg(any(target_os = "macos", target_os = "ios"))]
#[no_mangle]
pub static FILE_OPEN_OPTIONS_O_NOATIME: c_int = libc::MNT_NOATIME;

#[no_mangle]
pub static FILE_OPEN_OPTIONS_O_NOFOLLOW: c_int = libc::O_NOFOLLOW;
#[no_mangle]
pub static FILE_OPEN_OPTIONS_O_SYNC: c_int = libc::O_SYNC;
#[no_mangle]
pub static FILE_OPEN_OPTIONS_O_DSYNC: c_int = libc::O_DSYNC;

#[cfg(any(target_os = "macos", target_os = "ios"))]
#[no_mangle]
pub static FILE_OPEN_OPTIONS_O_SYMLINK: c_int = libc::O_SYMLINK;

#[cfg(any(target_os = "android"))]
#[no_mangle]
pub static FILE_OPEN_OPTIONS_O_SYMLINK: c_int = -1;

#[no_mangle]
pub static FILE_OPEN_OPTIONS_O_DIRECT: c_int = 0x4000;
#[no_mangle]
pub static FILE_OPEN_OPTIONS_O_NONBLOCK: c_int = libc::O_NONBLOCK;

#[no_mangle]
pub static FILE_ACCESS_OPTIONS_F_OK: c_int = libc::F_OK;

#[no_mangle]
pub static FILE_ACCESS_OPTIONS_R_OK: c_int = libc::R_OK;

#[no_mangle]
pub static FILE_ACCESS_OPTIONS_W_OK: c_int = libc::W_OK;

#[no_mangle]
pub static FILE_ACCESS_OPTIONS_X_OK: c_int = libc::X_OK;

#[no_mangle]
pub static FILE_TYPE_OPTIONS_S_IFMT: mode_t = libc::S_IFMT;

#[no_mangle]
pub static FILE_TYPE_OPTIONS_S_IFREG: mode_t = libc::S_IFREG;

#[no_mangle]
pub static FILE_TYPE_OPTIONS_S_IFDIR: mode_t = libc::S_IFDIR;

#[no_mangle]
pub static FILE_TYPE_OPTIONS_S_IFCHR: mode_t = libc::S_IFCHR;

#[no_mangle]
pub static FILE_TYPE_OPTIONS_S_IFBLK: mode_t = libc::S_IFBLK;

#[no_mangle]
pub static FILE_TYPE_OPTIONS_S_IFIFO: mode_t = libc::S_IFIFO;

#[no_mangle]
pub static FILE_TYPE_OPTIONS_S_IFLNK: mode_t = libc::S_IFLNK;

#[no_mangle]
pub static FILE_TYPE_OPTIONS_S_IFSOCK: mode_t = libc::S_IFSOCK;

#[no_mangle]
pub static FILE_MODE_OPTIONS_S_IRWXU: mode_t = libc::S_IRWXU;

#[no_mangle]
pub static FILE_MODE_OPTIONS_S_IRUSR: mode_t = libc::S_IRUSR;

#[no_mangle]
pub static FILE_MODE_OPTIONS_S_IWUSR: mode_t = libc::S_IWUSR;

#[no_mangle]
pub static FILE_MODE_OPTIONS_S_IXUSR: mode_t = libc::S_IXUSR;

#[no_mangle]
pub static FILE_MODE_OPTIONS_S_IRWXG: mode_t = libc::S_IRWXG;

#[no_mangle]
pub static FILE_MODE_OPTIONS_S_IRGRP: mode_t = libc::S_IRGRP;

#[no_mangle]
pub static FILE_MODE_OPTIONS_S_IWGRP: mode_t = libc::S_IWGRP;

#[no_mangle]
pub static FILE_MODE_OPTIONS_S_IXGRP: mode_t = libc::S_IXGRP;

#[no_mangle]
pub static FILE_MODE_OPTIONS_S_IRWXO: mode_t = libc::S_IRWXO;

#[no_mangle]
pub static FILE_MODE_OPTIONS_S_IROTH: mode_t = libc::S_IROTH;

#[no_mangle]
pub static FILE_MODE_OPTIONS_S_IWOTH: mode_t = libc::S_IWOTH;

#[no_mangle]
pub static FILE_MODE_OPTIONS_S_IXOTH: mode_t = libc::S_IXOTH;
