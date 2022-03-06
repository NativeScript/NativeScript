use std::ffi::CString;
use std::os::raw::{c_long, c_ushort};
use std::path::Path;

use libc::{c_char, c_int, c_uint, c_ulong, c_ulonglong, size_t, ssize_t};

use crate::common::{BufOfStrings, ByteBuf, ByteBufMut, fs};
use crate::common::fs::file_dir::FileDir;
use crate::common::fs::file_dirent::FileDirentBuf;
use crate::common::fs::file_stat::FileStat;
use crate::common::fs::sync::open_path;
use crate::ios::prelude::*;
use crate::ios::throw_error;

#[no_mangle]
pub extern "C" fn native_fs_access_sync(
    path: *const c_char,
    mode: c_int,
) {
    let result = fs::sync::access(get_str(path, "").as_ref(), mode);

    if let Err(error) = result {
        throw_error(&error.to_string());
    }
}

#[no_mangle]
pub extern "C" fn native_fs_append_file_with_bytes_sync(fd: c_int, data: *const u8, len: size_t) {
    let buf = unsafe { std::slice::from_raw_parts(data, len) };
    let result = fs::sync::append_file_with_bytes(fd, buf);
    if let Err(error) = result {
        throw_error(&error.to_string());
    }
}

#[no_mangle]
pub extern "C" fn native_fs_append_file_with_string_sync(fd: c_int, data: *const c_char) {
    let data = get_str(data, "");
    let result = fs::sync::append_file_with_str(fd, data.as_ref());

    if let Err(error) = result {
        throw_error(&error.to_string());
    }
}

#[no_mangle]
pub extern "C" fn native_fs_append_file_with_path_bytes_sync(path: *const c_char, data: *const u8, len: size_t, mode: c_int, flags: c_int) {
    let path = get_str(path, "");
    let buf = unsafe { std::slice::from_raw_parts(data, len) };
    let result = fs::sync::append_file_with_path_bytes(path.as_ref(), buf, mode, flags);
    if let Err(error) = result {
        throw_error(&error.to_string());
    }
}

#[no_mangle]
pub extern "C" fn native_fs_append_file_with_path_string_sync(path: *const c_char, data: *const c_char, mode: c_int, flags: c_int) {
    let path = get_str(path, "");
    let data = get_str(data, "");
    let result = fs::sync::append_file_with_path_str(path.as_ref(), data.as_ref(), mode, flags);

    if let Err(error) = result {
        throw_error(&error.to_string());
    }
}

#[no_mangle]
pub extern "C" fn native_fs_chmod_sync(path: *const c_char, mode: c_uint) {
    let path = get_str(path, "");
    let result = fs::sync::chmod(path.as_ref(), mode);

    if let Err(error) = result {
        throw_error(&error.to_string());
    }
}

#[no_mangle]
pub extern "C" fn native_fs_chown_sync(path: *const c_char, uid: c_uint, gid: c_uint) {
    let path = get_str(path, "");
    let result = fs::sync::chown(path.as_ref(), uid, gid);

    if let Err(error) = result {
        throw_error(&error.to_string());
    }
}

#[no_mangle]
pub extern "C" fn native_fs_close_sync(fd: c_int) {
    let _ = fs::sync::close_fd(fd);

    // if let Err(error) = result {
    //     throw_error(&error.to_string());
    // }
}

#[no_mangle]
pub extern "C" fn native_fs_copy_file_sync(src: *const c_char, dest: *const c_char, flags: c_uint) {
    let src = get_str(src, "");
    let dest = get_str(dest, "");
    let result = crate::common::fs::copy_file::copy_file(
        Path::new(src.as_ref()),
        Path::new(dest.as_ref()),
        flags,
    );

    if let Err(error) = result {
        throw_error(&error.to_string());
    }
}

#[no_mangle]
pub extern "C" fn native_fs_cp_sync(_src: *const c_char, _dest: *const c_char) {
    todo!()
}

#[no_mangle]
pub extern "C" fn native_fs_exists_sync(src: *const c_char) -> bool {
    fs::sync::exists(get_str(src, "").as_ref())
}

#[no_mangle]
pub extern "C" fn native_fs_fchmod_sync(fd: c_int, mode: c_ushort) {
    let result = fs::sync::fchmod(fd, mode);

    if let Err(error) = result {
        throw_error(&error.to_string());
    }
}

#[no_mangle]
pub extern "C" fn native_fs_fchown_sync(fd: c_int, uid: c_uint, gid: c_uint) {
    let result = fs::sync::fchown(fd, uid, gid);

    if let Err(error) = result {
        throw_error(&error.to_string());
    }
}

#[no_mangle]
pub extern "C" fn native_fs_fdatasync_sync(fd: c_int) {
    let result = fs::sync::fdatasync(fd);

    if let Err(error) = result {
        throw_error(&error.to_string());
    }
}

#[no_mangle]
pub extern "C" fn native_fs_fstat_sync(fd: c_int) -> *mut FileStat {
    handle_stat_into_box(fs::sync::fstat(fd))
}

#[no_mangle]
pub extern "C" fn native_fs_fsync_sync(fd: c_int) {
    let result = fs::sync::fsync(fd);

    if let Err(error) = result {
        throw_error(&error.to_string());
    }
}

#[no_mangle]
pub extern "C" fn native_fs_ftruncate_sync(fd: c_int, len: c_long) {
    let result = fs::sync::ftruncate(fd, len);

    if let Err(error) = result {
        throw_error(&error.to_string());
    }
}

#[no_mangle]
pub extern "C" fn native_fs_futimes_sync(fd: c_int, atime: c_long, mtime: c_long) {
    let result = fs::sync::futimes(fd, atime, mtime);

    if let Err(error) = result {
        throw_error(&error.to_string());
    }
}

#[no_mangle]
pub extern "C" fn native_fs_lchmod_sync(path: *const c_char, mode: c_ushort) {
    let result = fs::sync::lchmod(get_str(path, "").as_ref(), mode);

    if let Err(error) = result {
        throw_error(&error.to_string());
    }
}

#[no_mangle]
pub extern "C" fn native_fs_lchown_sync(path: *const c_char, uid: c_uint, gid: c_uint) {
    let result = fs::sync::lchown(get_str(path, "").as_ref(), uid, gid);

    if let Err(error) = result {
        throw_error(&error.to_string());
    }
}

#[no_mangle]
pub extern "C" fn native_fs_lutimes_sync(path: *const c_char, atime: c_long, mtime: c_long) {
    let result = fs::sync::lutimes(get_str(path, "").as_ref(), atime, mtime);

    if let Err(error) = result {
        throw_error(&error.to_string());
    }
}

#[no_mangle]
pub extern "C" fn native_fs_link_sync(existing_path: *const c_char, new_path: *const c_char) {
    let result = fs::sync::link(
        get_str(existing_path, "").as_ref(),
        get_str(new_path, "").as_ref(),
    );

    if let Err(error) = result {
        throw_error(&error.to_string());
    }
}

#[no_mangle]
pub extern "C" fn native_fs_lstat_sync(path: *const c_char) -> *mut FileStat {
    handle_stat_into_box(fs::sync::lstat(get_str(path, "").as_ref()))
}

#[no_mangle]
pub extern "C" fn native_fs_mkdir_sync(path: *const c_char, mode: c_uint, recursive: bool) {
    let result = fs::sync::mkdir(get_str(path, "").as_ref(), mode, recursive);

    if let Err(error) = result {
        throw_error(&error.to_string());
    }
}

#[no_mangle]
pub extern "C" fn native_fs_mkdtemp_sync(prefix: *const c_char) -> *mut c_char {
    let prefix = get_str(prefix, "");
    let result = fs::sync::mkdtemp(prefix.as_ref());

    match result {
        Ok(pre) => match CString::new(pre.as_ref()) {
            Ok(val) => val.into_raw(),
            Err(error) => {
                throw_error(&error.to_string());
                std::ptr::null_mut()
            }
        },
        Err(error) => {
            throw_error(&error.to_string());
            std::ptr::null_mut()
        }
    }
}

#[no_mangle]
pub extern "C" fn native_fs_open_dir_sync(dir: *const c_char) -> *mut FileDir {
    return match fs::sync::opendir(get_str(dir, "").as_ref()) {
        Ok(fd) => Box::into_raw(Box::new(fd)),
        Err(error) => {
            throw_error(&error.to_string());
            std::ptr::null_mut()
        }
    };
}

#[no_mangle]
pub extern "C" fn native_fs_open_sync(path: *const c_char, flags: c_int, mode: c_int) -> c_int {
    match open_path(path, flags, mode) {
        Ok(fd) => fd,
        Err(error) => {
            throw_error(&error.to_string());
            0
        }
    }
}

#[no_mangle]
pub extern "C" fn native_fs_readdir_with_file_type_sync(
    path: *const c_char,
) -> *mut FileDirentBuf {
    return match fs::sync::readdir_with_file_types(get_str(path, "").as_ref(), "") {
        Ok(buf) => {
            Box::into_raw(
                Box::new(
                    FileDirentBuf::from(buf)
                )
            )
        }
        Err(error) => {
            throw_error(&error.to_string());
            std::ptr::null_mut()
        }
    };
}

#[no_mangle]
pub extern "C" fn native_fs_readdir_sync(dir: *const c_char) -> *mut BufOfStrings {
    use std::os::unix::ffi::OsStrExt;
    return match fs::sync::readdir_with_file(get_str(dir, "").as_ref(), "") {
        Ok(fd) => {
            let mut buf = Vec::new();
            for dir in fd {
                buf.push(CString::new(dir.as_bytes()).unwrap().into_raw())
            }
            Box::into_raw(
                Box::new(
                    BufOfStrings::from(buf)
                )
            )
        }
        Err(error) => {
            throw_error(&error.to_string());
            std::ptr::null_mut()
        }
    };
}

#[no_mangle]
pub extern "C" fn native_fs_read_file_sync(path: *const c_char, flags: i32) -> *mut ByteBufMut {
    match fs::sync::read_file(get_str(path, "").as_ref(), flags) {
        Ok(buf) => {
            Box::into_raw(
                Box::new(
                    ByteBufMut::from(buf)
                )
            )
        }
        Err(error) => {
            throw_error(&error.to_string());
            std::ptr::null_mut()
        }
    }
}

#[no_mangle]
pub extern "C" fn native_fs_read_file_with_fd_sync(fd: c_int, flags: c_int) -> *mut ByteBufMut {
    match fs::sync::read_file_with_fd(fd, flags) {
        Ok(buf) => {
            Box::into_raw(
                Box::new(
                    ByteBufMut::from(buf)
                )
            )
        }
        Err(error) => {
            throw_error(&error.to_string());
            std::ptr::null_mut()
        }
    }
}

#[no_mangle]
pub extern "C" fn native_fs_readlink_sync(path: *const c_char) -> *mut c_char {
    match fs::sync::read_link(get_str(path, "").as_ref(), "") {
        Ok(buf) => CString::new(buf.to_string_lossy().as_ref())
            .unwrap()
            .into_raw(),
        Err(error) => {
            throw_error(&error.to_string());
            std::ptr::null_mut()
        }
    }
}

#[no_mangle]
pub extern "C" fn native_fs_read_sync(
    fd: c_int,
    buf: *mut u8,
    buf_len: size_t,
    offset: size_t,
    length: size_t,
    position: ssize_t,
) -> c_ulong {
    if !buf.is_null() {
        let buffer = unsafe { std::slice::from_raw_parts_mut(buf, buf_len) };
        return match fs::sync::read(fd, buffer, offset, length, position) {
            Ok(read) => read,
            Err(error) => {
                throw_error(&error.to_string());
                0
            }
        } as c_ulong;
    }
    0
}

#[no_mangle]
pub extern "C" fn native_fs_readv_sync(
    fd: c_int,
    buffer: *const *mut ByteBufMut,
    buffer_len: size_t,
    position: c_long,
) -> c_long {
    if !buffer.is_null() {
        return match fs::sync::readv_raw(fd, buffer, buffer_len, position) {
            Ok(read) => read as c_long,
            Err(error) => {
                throw_error(&error.to_string());
                0
            }
        };
    }
    return 0;
}

#[no_mangle]
pub extern "C" fn native_fs_realpath_sync(path: *const c_char) -> *mut c_char {
    match fs::sync::real_path(get_str(path, "").as_ref()) {
        Ok(buf) => CString::new(buf.to_string_lossy().as_ref())
            .unwrap()
            .into_raw(),
        Err(error) => {
            throw_error(&error.to_string());
            std::ptr::null_mut()
        }
    }
}

#[no_mangle]
pub extern "C" fn native_fs_rename_sync(old_path: *const c_char, new_path: *const c_char) {
    let result = fs::sync::rename(
        get_str(old_path, "").as_ref(),
        get_str(new_path, "").as_ref(),
    );

    if let Err(error) = result {
        throw_error(&error.to_string());
    }
}

#[no_mangle]
pub extern "C" fn native_fs_rmdir_sync(
    path: *const c_char,
    max_retries: c_int,
    recursive: bool,
    retry_delay: c_ulong,
) {
    let result = fs::sync::rmdir(
        get_str(path, "").as_ref(),
        max_retries,
        recursive,
        retry_delay,
    );

    if let Err(error) = result {
        throw_error(&error.to_string());
    }
}

#[no_mangle]
pub extern "C" fn native_fs_rm_sync(
    path: *const c_char,
    max_retries: c_int,
    recursive: bool,
    retry_delay: c_ulong,
) {
    let result = fs::sync::rm(
        get_str(path, "").as_ref(),
        max_retries,
        recursive,
        retry_delay,
    );

    if let Err(error) = result {
        throw_error(&error.to_string());
    }
}

#[no_mangle]
pub extern "C" fn native_fs_stat_sync(
    path: *const c_char,
    throw_if_no_entry: bool,
) -> *mut FileStat {
    let meta = fs::sync::stat(get_str(path, "").as_ref());
    match meta {
        Ok(meta) => handle_meta_into_box(&meta),
        Err(error) => {
            if throw_if_no_entry && error.kind() == std::io::ErrorKind::NotFound {
                throw_error(&error.to_string());
                std::ptr::null_mut()
            } else {
                std::ptr::null_mut()
            }
        }
    }
}

#[no_mangle]
pub extern "C" fn native_fs_symlink_sync(
    target: *const c_char,
    path: *const c_char,
    type_: *const c_char,
) {
    let result = fs::sync::symlink(
        get_str(target, "").as_ref(),
        get_str(path, "").as_ref(),
        get_str(type_, "").as_ref(),
    );
    if let Err(error) = result {
        throw_error(&error.to_string());
    }
}

#[no_mangle]
pub extern "C" fn native_fs_truncate_sync(path: *const c_char, len: c_ulonglong) {
    let result = fs::sync::truncate(get_str(path, "").as_ref(), len);
    if let Err(error) = result {
        throw_error(&error.to_string());
    }
}

#[no_mangle]
pub extern "C" fn native_fs_unlink_sync(path: *const c_char) {
    let result = fs::sync::unlink(get_str(path, "").as_ref());
    if let Err(error) = result {
        throw_error(&error.to_string());
    }
}

// #[no_mangle]
// pub extern "C" fn native_fs_unwatch_file_sync(
//     path: *const c_char,
// ) {
//
// }

#[no_mangle]
pub extern "C" fn native_fs_utimes_sync(path: *const c_char, atime: c_long, mtime: c_long) {
    let result = fs::sync::utimes(get_str(path, "").as_ref(), atime, mtime);

    if let Err(error) = result {
        throw_error(&error.to_string());
    }
}

#[no_mangle]
pub extern "C" fn native_fs_write_file_with_path_string_sync(
    path: *const c_char,
    data: *const c_char,
    encoding: *const c_char,
    mode: c_int,
    flag: c_int,
) {
    if !data.is_null() {
        let result = fs::sync::write_file_with_str_from_path(
            get_str(path, "").as_ref(),
            get_str(data, "").as_ref(),
            get_str(encoding, "").as_ref(),
            mode,
            flag,
        );

        if let Err(error) = result {
            throw_error(&error.to_string());
        }
    }
}


#[no_mangle]
pub extern "C" fn native_fs_write_file_with_string_sync(
    fd: c_int,
    data: *const c_char,
    encoding: *const c_char,
) {
    if !data.is_null() {
        let result = fs::sync::write_file_with_str(
            fd,
            get_str(data, "").as_ref(),
            get_str(encoding, "").as_ref(),
        ).map(|_| ());

        if let Err(error) = result {
            throw_error(&error.to_string());
        }
    }
}

#[no_mangle]
pub extern "C" fn native_fs_write_file_with_path_bytes_sync(
    path: *const c_char,
    data: *const u8,
    data_len: size_t,
    encoding: *const c_char,
    mode: c_int,
    flag: c_int,
) {
    if !data.is_null() {
        let buf = unsafe { std::slice::from_raw_parts(data, data_len) };
        let result = fs::sync::write_file_with_bytes_from_path(
            get_str(path, "").as_ref(),
            buf,
            get_str(encoding, "").as_ref(),
            mode,
            flag,
        );

        if let Err(error) = result {
            throw_error(&error.to_string());
        }
    }
}

#[no_mangle]
pub extern "C" fn native_fs_write_file_with_bytes_sync(
    fd: c_int,
    data: *const u8,
    data_len: size_t,
    encoding: *const c_char,
) {
    if !data.is_null() {
        let buf = unsafe { std::slice::from_raw_parts(data, data_len) };
        let result = fs::sync::write_file_with_bytes(fd, buf);

        if let Err(error) = result {
            throw_error(&error.to_string());
        }
    }
}

#[no_mangle]
pub extern "C" fn native_fs_write_sync(
    fd: c_int,
    data: *const u8,
    data_len: size_t,
    offset: size_t,
    length: size_t,
    position: ssize_t,
) -> c_ulong {
    if !data.is_null() {
        let buf = unsafe { std::slice::from_raw_parts(data, data_len) };
        return match fs::sync::write(fd, buf, offset, length, position) {
            Ok(wrote) => wrote,
            Err(error) => {
                throw_error(&error.to_string());
                0
            }
        } as c_ulong;
    }
    0
}

#[no_mangle]
pub extern "C" fn native_fs_write_string_sync(
    fd: c_int,
    data: *const c_char,
    encoding: *const c_char,
    position: ssize_t,
) -> c_ulong {
    if !data.is_null() {
        return match fs::sync::write_string(fd, get_str(data, "").as_ref(), get_str(encoding, "").as_ref(),position) {
            Ok(wrote) => wrote,
            Err(error) => {
                throw_error(&error.to_string());
                0
            }
        } as c_ulong;
    }
    0
}

#[no_mangle]
pub extern "C" fn native_fs_writev_sync(
    fd: c_int,
    buffer: *const *const ByteBuf,
    buffer_len: size_t,
    position: c_long,
) -> c_long {
    if !buffer.is_null() {
        return match fs::sync::writev_raw(fd, buffer, buffer_len, position) {
            Ok(wrote) => wrote as c_long,
            Err(error) => {
                throw_error(&error.to_string());
                0
            }
        };
    }
    0
}
