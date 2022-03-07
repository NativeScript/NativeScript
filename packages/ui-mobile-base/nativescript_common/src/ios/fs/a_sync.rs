use std::ffi::{c_void, CString};
use std::path::PathBuf;
use std::ptr::NonNull;
use std::sync::Arc;

use libc::{
    c_char, c_int, c_long, c_uchar, c_uint, c_ulong, c_ulonglong, c_ushort, size_t, ssize_t,
};

pub use crate::common::fs::a_sync::FileWatchEvent;
pub use crate::common::fs::a_sync::WatchEvent;
use crate::common::fs::a_sync::{AsyncClosure, OnErrorCallback, OnSuccessCallback};
use crate::common::fs::file_dir::FileDir;
use crate::common::fs::file_dirent::FileDirentBuf;
use crate::common::fs::file_stat::FileStat;
use crate::common::{fs, BufOfStrings, ByteBuf, ByteBufMut};
use crate::ios::prelude::*;

#[derive(Hash)]
pub struct AsyncCallback {
    pub(crate) on_success: OnSuccessCallback,
    pub(crate) on_error: OnErrorCallback,
}

impl PartialEq<Self> for AsyncCallback {
    fn eq(&self, other: &Self) -> bool {
        self.on_success == other.on_success && self.on_error == other.on_error
    }
}

impl Eq for AsyncCallback {}

impl AsyncCallback {
    pub fn new(on_success: OnSuccessCallback, on_error: OnErrorCallback) -> Self {
        Self {
            on_success,
            on_error,
        }
    }

    pub fn on_success(&self, result: Option<NonNull<c_void>>) {
        (self.on_success)(result);
    }

    pub fn on_error(&self, result: Option<NonNull<c_void>>) {
        (self.on_error)(result)
    }

    pub fn clone_from_ptr(ptr: *const AsyncCallback) -> Arc<AsyncCallback> {
        unsafe {
            Arc::increment_strong_count(ptr);
        }
        unsafe { Arc::from_raw(ptr) }
    }

    pub fn into_arc(self) -> Arc<AsyncCallback> {
        Arc::new(self)
    }
}

#[no_mangle]
pub extern "C" fn native_fs_create_async_callback(
    on_success: OnSuccessCallback,
    on_error: OnErrorCallback,
) -> *const AsyncCallback {
    Arc::into_raw(AsyncCallback::new(on_success, on_error).into_arc())
}

#[no_mangle]
pub extern "C" fn native_fs_dispose_async_callback(callback: *const AsyncCallback) {
    if callback.is_null() {
        return;
    }

    let _ = unsafe { Arc::from_raw(callback) };
}

#[no_mangle]
pub extern "C" fn native_fs_access(
    path: *const c_char,
    mode: c_int,
    callback: *const AsyncCallback,
) {
    let on_success = AsyncCallback::clone_from_ptr(callback);
    let callback = AsyncClosure::<(), std::io::Error>::new(Box::new(move |_, error| {
        if let Some(error) = error {
            on_success.on_error(to_error(error.to_string()))
        } else {
            on_success.on_success(None)
        }
    }))
    .into_arc();
    let path = get_str(path, "");
    fs::a_sync::access(path.as_ref(), mode, callback);
}

#[no_mangle]
pub extern "C" fn native_fs_append_file_with_bytes(
    fd: c_int,
    data: *const u8,
    len: size_t,
    callback: *const AsyncCallback,
) {
    let on_success = AsyncCallback::clone_from_ptr(callback);
    let callback = AsyncClosure::<(), std::io::Error>::new(Box::new(move |_, error| {
        if let Some(error) = error {
            on_success.on_error(to_error(error.to_string()))
        } else {
            on_success.on_success(None)
        }
    }))
    .into_arc();
    fs::a_sync::append_file_with_bytes(fd, ByteBuf::new(data, len), callback)
}

#[no_mangle]
pub extern "C" fn native_fs_append_file_with_string(
    fd: c_int,
    data: *const c_char,
    callback: *const AsyncCallback,
) {
    let on_success = AsyncCallback::clone_from_ptr(callback);
    let callback = AsyncClosure::<(), std::io::Error>::new(Box::new(move |_, error| {
        if let Some(error) = error {
            on_success.on_error(to_error(error.to_string()))
        } else {
            on_success.on_success(None)
        }
    }))
    .into_arc();
    let data = get_str(data, "");
    fs::a_sync::append_file_with_str(fd, data.as_ref(), callback);
}

#[no_mangle]
pub extern "C" fn native_fs_append_file_with_path_bytes(
    path: *const c_char,
    data: *const u8,
    len: size_t,
    mode: c_int,
    flags: c_int,
    callback: *const AsyncCallback,
) {
    let on_success = AsyncCallback::clone_from_ptr(callback);
    let callback = AsyncClosure::<(), std::io::Error>::new(Box::new(move |_, error| {
        if let Some(error) = error {
            on_success.on_error(to_error(error.to_string()))
        } else {
            on_success.on_success(None)
        }
    }))
    .into_arc();
    let path = get_str(path, "");
    fs::a_sync::append_file_with_path_bytes(
        path.as_ref(),
        ByteBufMut::new(data as *mut u8, len),
        mode,
        flags,
        callback,
    )
}

#[no_mangle]
pub extern "C" fn native_fs_append_file_with_path_string(
    path: *const c_char,
    data: *const c_char,
    mode: c_int,
    flags: c_int,
    callback: *const AsyncCallback,
) {
    let path = get_str(path, "");
    let data = get_str(data, "");

    let on_success = AsyncCallback::clone_from_ptr(callback);
    let callback = AsyncClosure::<(), std::io::Error>::new(Box::new(move |_, error| {
        if let Some(error) = error {
            on_success.on_error(to_error(error.to_string()))
        } else {
            on_success.on_success(None)
        }
    }))
    .into_arc();

    fs::a_sync::append_file_with_path_str(path.as_ref(), data.as_ref(), mode, flags, callback);
}

#[no_mangle]
pub extern "C" fn native_fs_chmod(
    path: *const c_char,
    mode: c_uint,
    callback: *const AsyncCallback,
) {
    let path = get_str(path, "");
    let on_success = AsyncCallback::clone_from_ptr(callback);
    let callback = AsyncClosure::<(), std::io::Error>::new(Box::new(move |_, error| {
        if let Some(error) = error {
            on_success.on_error(to_error(error.to_string()))
        } else {
            on_success.on_success(None)
        }
    }))
    .into_arc();
    fs::a_sync::chmod(path.as_ref(), mode, callback);
}

#[no_mangle]
pub extern "C" fn native_fs_chown(
    path: *const c_char,
    uid: c_uint,
    gid: c_uint,
    callback: *const AsyncCallback,
) {
    let path = get_str(path, "");
    let on_success = AsyncCallback::clone_from_ptr(callback);
    let callback = AsyncClosure::<(), std::io::Error>::new(Box::new(move |_, error| {
        if let Some(error) = error {
            on_success.on_error(to_error(error.to_string()))
        } else {
            on_success.on_success(None)
        }
    }))
    .into_arc();
    fs::a_sync::chown(path.as_ref(), uid, gid, callback);
}

#[no_mangle]
pub extern "C" fn native_fs_close(fd: c_int, callback: *const AsyncCallback) {
    let on_success = AsyncCallback::clone_from_ptr(callback);
    let callback = AsyncClosure::<(), std::io::Error>::new(Box::new(move |_, error| {
        if let Some(error) = error {
            on_success.on_error(to_error(error.to_string()))
        } else {
            on_success.on_success(None)
        }
    }))
    .into_arc();
    fs::a_sync::close(fd, callback);
}

#[no_mangle]
pub extern "C" fn native_fs_copy_file(
    src: *const c_char,
    dest: *const c_char,
    flags: c_uint,
    callback: *const AsyncCallback,
) {
    let src = get_str(src, "");
    let dest = get_str(dest, "");
    let on_success = AsyncCallback::clone_from_ptr(callback);
    let callback = AsyncClosure::<(), std::io::Error>::new(Box::new(move |_, error| {
        if let Some(error) = error {
            on_success.on_error(to_error(error.to_string()))
        } else {
            on_success.on_success(None)
        }
    }))
    .into_arc();
    crate::common::fs::a_sync::copy_file(src.as_ref(), dest.as_ref(), flags, callback);
}

#[no_mangle]
pub extern "C" fn native_fs_cp(
    _src: *const c_char,
    _dest: *const c_char,
    _callback: *const AsyncCallback,
) {
    todo!()
}

#[no_mangle]
pub extern "C" fn native_fs_exists(src: *const c_char, callback: *const AsyncCallback) {
    let on_success = AsyncCallback::clone_from_ptr(callback);
    let callback = AsyncClosure::<bool, std::io::Error>::new(Box::new(move |success, error| {
        if let Some(error) = error {
            on_success.on_error(to_error(error.to_string()))
        } else {
            on_success.on_success(NonNull::new(success.unwrap() as c_uchar as *mut c_void))
        }
    }))
    .into_arc();
    fs::a_sync::exists(get_str(src, "").as_ref(), callback);
}

#[no_mangle]
pub extern "C" fn native_fs_fchmod(fd: c_int, mode: c_ushort, callback: *const AsyncCallback) {
    let on_success = AsyncCallback::clone_from_ptr(callback);
    let callback = AsyncClosure::<(), std::io::Error>::new(Box::new(move |_, error| {
        if let Some(error) = error {
            on_success.on_error(to_error(error.to_string()))
        } else {
            on_success.on_success(None)
        }
    }))
    .into_arc();
    fs::a_sync::fchmod(fd, mode, callback);
}

#[no_mangle]
pub extern "C" fn native_fs_fchown(
    fd: c_int,
    uid: c_uint,
    gid: c_uint,
    callback: *const AsyncCallback,
) {
    let on_success = AsyncCallback::clone_from_ptr(callback);
    let callback = AsyncClosure::<(), std::io::Error>::new(Box::new(move |_, error| {
        if let Some(error) = error {
            on_success.on_error(to_error(error.to_string()))
        } else {
            on_success.on_success(None)
        }
    }))
    .into_arc();
    fs::a_sync::fchown(fd, uid, gid, callback);
}

#[no_mangle]
pub extern "C" fn native_fs_fdatasync(fd: c_int, callback: *const AsyncCallback) {
    let on_success = AsyncCallback::clone_from_ptr(callback);
    let callback = AsyncClosure::<(), std::io::Error>::new(Box::new(move |_, error| {
        if let Some(error) = error {
            on_success.on_error(to_error(error.to_string()))
        } else {
            on_success.on_success(None)
        }
    }))
    .into_arc();
    fs::a_sync::fdatasync(fd, callback);
}

#[no_mangle]
pub extern "C" fn native_fs_fstat(fd: c_int, callback: *const AsyncCallback) {
    let on_success = AsyncCallback::clone_from_ptr(callback);
    let callback =
        AsyncClosure::<FileStat, std::io::Error>::new(Box::new(move |success, error| {
            if let Some(error) = error {
                on_success.on_error(to_error(error.to_string()))
            } else {
                on_success.on_success(NonNull::new(
                    Box::into_raw(Box::new(success.unwrap())) as *mut c_void
                ))
            }
        }))
        .into_arc();
    fs::a_sync::fstat(fd, callback)
}

#[no_mangle]
pub extern "C" fn native_fs_fsync(fd: c_int, callback: *const AsyncCallback) {
    let on_success = AsyncCallback::clone_from_ptr(callback);
    let callback = AsyncClosure::<(), std::io::Error>::new(Box::new(move |_, error| {
        if let Some(error) = error {
            on_success.on_error(to_error(error.to_string()))
        } else {
            on_success.on_success(None)
        }
    }))
    .into_arc();
    fs::a_sync::fsync(fd, callback)
}

#[no_mangle]
pub extern "C" fn native_fs_ftruncate(fd: c_int, len: c_long, callback: *const AsyncCallback) {
    let on_success = AsyncCallback::clone_from_ptr(callback);
    let callback = AsyncClosure::<(), std::io::Error>::new(Box::new(move |_, error| {
        if let Some(error) = error {
            on_success.on_error(to_error(error.to_string()))
        } else {
            on_success.on_success(None)
        }
    }))
    .into_arc();
    fs::a_sync::ftruncate(fd, len, callback)
}

#[no_mangle]
pub extern "C" fn native_fs_futimes(
    fd: c_int,
    atime: c_long,
    mtime: c_long,
    callback: *const AsyncCallback,
) {
    let on_success = AsyncCallback::clone_from_ptr(callback);
    let callback = AsyncClosure::<(), std::io::Error>::new(Box::new(move |_, error| {
        if let Some(error) = error {
            on_success.on_error(to_error(error.to_string()))
        } else {
            on_success.on_success(None)
        }
    }))
    .into_arc();
    fs::a_sync::futimes(fd, atime, mtime, callback)
}

#[no_mangle]
pub extern "C" fn native_fs_lchmod(
    path: *const c_char,
    mode: c_ushort,
    callback: *const AsyncCallback,
) {
    let on_success = AsyncCallback::clone_from_ptr(callback);
    let callback = AsyncClosure::<(), std::io::Error>::new(Box::new(move |_, error| {
        if let Some(error) = error {
            on_success.on_error(to_error(error.to_string()))
        } else {
            on_success.on_success(None)
        }
    }))
    .into_arc();
    fs::a_sync::lchmod(get_str(path, "").as_ref(), mode, callback)
}

#[no_mangle]
pub extern "C" fn native_fs_lchown(
    path: *const c_char,
    uid: c_uint,
    gid: c_uint,
    callback: *const AsyncCallback,
) {
    let on_success = AsyncCallback::clone_from_ptr(callback);
    let callback = AsyncClosure::<(), std::io::Error>::new(Box::new(move |_, error| {
        if let Some(error) = error {
            on_success.on_error(to_error(error.to_string()))
        } else {
            on_success.on_success(None)
        }
    }))
    .into_arc();
    fs::a_sync::lchown(get_str(path, "").as_ref(), uid, gid, callback)
}

#[no_mangle]
pub extern "C" fn native_fs_lutimes(
    path: *const c_char,
    atime: c_long,
    mtime: c_long,
    callback: *const AsyncCallback,
) {
    let on_success = AsyncCallback::clone_from_ptr(callback);
    let callback = AsyncClosure::<(), std::io::Error>::new(Box::new(move |_, error| {
        if let Some(error) = error {
            on_success.on_error(to_error(error.to_string()))
        } else {
            on_success.on_success(None)
        }
    }))
    .into_arc();
    fs::a_sync::lutimes(get_str(path, "").as_ref(), atime, mtime, callback)
}

#[no_mangle]
pub extern "C" fn native_fs_link(
    existing_path: *const c_char,
    new_path: *const c_char,
    callback: *const AsyncCallback,
) {
    let on_success = AsyncCallback::clone_from_ptr(callback);
    let callback = AsyncClosure::<(), std::io::Error>::new(Box::new(move |_, error| {
        if let Some(error) = error {
            on_success.on_error(to_error(error.to_string()))
        } else {
            on_success.on_success(None)
        }
    }))
    .into_arc();
    fs::a_sync::link(
        get_str(existing_path, "").as_ref(),
        get_str(new_path, "").as_ref(),
        callback,
    )
}

#[no_mangle]
pub extern "C" fn native_fs_lstat(path: *const c_char, callback: *const AsyncCallback) {
    let on_success = AsyncCallback::clone_from_ptr(callback);
    let callback =
        AsyncClosure::<FileStat, std::io::Error>::new(Box::new(move |success, error| {
            if let Some(error) = error {
                on_success.on_error(to_error(error.to_string()))
            } else {
                on_success.on_success(NonNull::new(
                    Box::into_raw(Box::new(success.unwrap())) as *mut c_void
                ))
            }
        }))
        .into_arc();
    fs::a_sync::lstat(get_str(path, "").as_ref(), callback)
}

#[no_mangle]
pub extern "C" fn native_fs_mkdir(
    path: *const c_char,
    mode: c_uint,
    recursive: bool,
    callback: *const AsyncCallback,
) {
    let on_success = AsyncCallback::clone_from_ptr(callback);
    let callback = AsyncClosure::<(), std::io::Error>::new(Box::new(move |_, error| {
        if let Some(error) = error {
            on_success.on_error(to_error(error.to_string()))
        } else {
            on_success.on_success(None)
        }
    }))
    .into_arc();
    fs::a_sync::mkdir(get_str(path, "").as_ref(), mode, recursive, callback)
}

#[no_mangle]
pub extern "C" fn native_fs_mkdtemp(prefix: *const c_char, callback: *const AsyncCallback) {
    let on_success = AsyncCallback::clone_from_ptr(callback);
    let callback =
        AsyncClosure::<std::path::PathBuf, std::io::Error>::new(Box::new(move |success, error| {
            if let Some(error) = error {
                on_success.on_error(to_error(error.to_string()))
            } else {
                on_success.on_success(NonNull::new(
                    CString::new(success.unwrap().to_string_lossy().as_ref())
                        .unwrap()
                        .into_raw() as *mut c_void,
                ))
            }
        }))
        .into_arc();
    fs::a_sync::mkdtemp(get_str(prefix, "").as_ref(), callback)
}

#[no_mangle]
pub extern "C" fn native_fs_open_dir(dir: *const c_char, callback: *const AsyncCallback) {
    let on_success = AsyncCallback::clone_from_ptr(callback);
    let callback = AsyncClosure::<FileDir, std::io::Error>::new(Box::new(move |success, error| {
        if error.is_some() {
            on_success.on_error(to_error(error.unwrap().to_string()))
        } else {
            on_success.on_success(NonNull::new(
                Box::into_raw(Box::new(success.unwrap())) as *mut c_void
            ))
        }
    }))
    .into_arc();
    fs::a_sync::opendir(get_str(dir, "").as_ref(), callback)
}

#[no_mangle]
pub extern "C" fn native_fs_open(
    path: *const c_char,
    flags: c_int,
    mode: c_int,
    callback: *const AsyncCallback,
) {
    let on_success = AsyncCallback::clone_from_ptr(callback);
    let callback = AsyncClosure::<c_int, std::io::Error>::new(Box::new(move |success, error| {
        if error.is_some() {
            on_success.on_error(to_error(error.unwrap().to_string()))
        } else {
            on_success.on_success(NonNull::new(success.unwrap() as *mut c_void))
        }
    }))
    .into_arc();
    fs::a_sync::open(get_str(path, "").as_ref(), flags, mode, callback)
}

#[no_mangle]
pub extern "C" fn native_fs_readdir_with_file_type(
    dir: *const c_char,
    encoding: *const c_char,
    callback: *const AsyncCallback,
) {
    let on_success = AsyncCallback::clone_from_ptr(callback);

    let dir = get_str(dir, "");
    let encoding = get_str(encoding, "");

    fs::a_sync::readdir_with_file_types(
        dir.as_ref(),
        encoding.as_ref(),
        Box::new(move |success, error| {
            if error.is_some() {
                on_success.on_error(NonNull::new(
                    CString::new(error.unwrap().to_string()).unwrap().into_raw() as *mut c_void,
                ))
            } else {
                on_success.on_success(NonNull::new(Box::into_raw(Box::new(FileDirentBuf::from(
                    success.unwrap(),
                ))) as *mut c_void))
            }
        }),
    );
}

#[no_mangle]
pub extern "C" fn native_fs_readdir(
    dir: *const c_char,
    encoding: *const c_char,
    callback: *const AsyncCallback,
) {
    use std::os::unix::ffi::OsStrExt;
    let callback = AsyncCallback::clone_from_ptr(callback);
    fs::a_sync::readdir_with_file(
        get_str(dir, "").as_ref(),
        get_str(encoding, "").as_ref(),
        Box::new(move |fd, error| {
            if error.is_some() {
                callback.on_error(NonNull::new(
                    CString::new(error.unwrap().to_string()).unwrap().into_raw() as *mut c_void,
                ))
            } else {
                let mut buf = Vec::new();
                for dir in fd.unwrap() {
                    buf.push(CString::new(dir.as_bytes()).unwrap().into_raw())
                }

                callback.on_success(NonNull::new(
                    Box::into_raw(Box::new(BufOfStrings::from(buf))) as *mut c_void,
                ))
            }
        }),
    )
}

#[no_mangle]
pub extern "C" fn native_fs_read_file(
    path: *const c_char,
    flags: c_int,
    callback: *const AsyncCallback,
) {
    let on_success = AsyncCallback::clone_from_ptr(callback);
    let callback =
        AsyncClosure::<ByteBufMut, std::io::Error>::new(Box::new(move |success, error| {
            if let Some(error) = error {
                on_success.on_error(to_error(error.to_string()))
            } else {
                on_success.on_success(NonNull::new(
                    Box::into_raw(Box::new(success.unwrap())) as *mut c_void
                ))
            }
        }))
        .into_arc();

    fs::a_sync::read_file(get_str(path, "").as_ref(), flags, callback)
}

#[no_mangle]
pub extern "C" fn native_fs_read_file_with_fd(
    fd: c_int,
    flags: c_int,
    callback: *const AsyncCallback,
) {
    let on_success = AsyncCallback::clone_from_ptr(callback);
    let callback =
        AsyncClosure::<ByteBufMut, std::io::Error>::new(Box::new(move |success, error| {
            if let Some(error) = error {
                on_success.on_error(to_error(error.to_string()))
            } else {
                on_success.on_success(NonNull::new(
                    Box::into_raw(Box::new(success.unwrap())) as *mut c_void
                ))
            }
        }))
        .into_arc();
    fs::a_sync::read_file_with_fd(fd, flags, callback)
}

#[no_mangle]
pub extern "C" fn native_fs_readlink(
    path: *const c_char,
    encoding: *const c_char,
    callback: *const AsyncCallback,
) {
    let on_success = AsyncCallback::clone_from_ptr(callback);
    let callback = AsyncClosure::<PathBuf, std::io::Error>::new(Box::new(move |success, error| {
        if error.is_some() {
            on_success.on_error(to_error(error.unwrap().to_string()))
        } else {
            let ret = success.unwrap();
            let ret = ret.to_string_lossy();
            on_success.on_success(NonNull::new(
                CString::new(ret.as_ref()).unwrap().into_raw() as *mut c_void
            ))
        }
    }))
    .into_arc();
    fs::a_sync::read_link(
        get_str(path, "").as_ref(),
        get_str(encoding, "").as_ref(),
        callback,
    )
}

#[no_mangle]
pub extern "C" fn native_fs_read(
    fd: c_int,
    buf: *mut u8,
    buf_len: size_t,
    offset: size_t,
    length: size_t,
    position: ssize_t,
    callback: *const AsyncCallback,
) {
    let on_success = AsyncCallback::clone_from_ptr(callback);
    let callback = AsyncClosure::<usize, std::io::Error>::new(Box::new(move |success, error| {
        if error.is_some() {
            on_success.on_error(to_error(error.unwrap().to_string()))
        } else {
            on_success.on_success(NonNull::new(success.unwrap() as *mut c_void))
        }
    }))
    .into_arc();

    fs::a_sync::read(
        fd,
        ByteBufMut::new(buf, buf_len),
        offset,
        length,
        position,
        callback,
    )
}

#[no_mangle]
pub extern "C" fn native_fs_readv(
    fd: c_int,
    buffer: *const *mut ByteBufMut,
    buffer_len: size_t,
    position: c_long,
    callback: *const AsyncCallback,
) {
    let on_success = AsyncCallback::clone_from_ptr(callback);
    let callback = AsyncClosure::<usize, std::io::Error>::new(Box::new(move |success, error| {
        if error.is_some() {
            on_success.on_error(to_error(error.unwrap().to_string()))
        } else {
            on_success.on_success(NonNull::new(success.unwrap() as *mut c_void))
        }
    }))
    .into_arc();

    fs::a_sync::readv_raw(fd, buffer, buffer_len, position, callback)
}

#[no_mangle]
pub extern "C" fn native_fs_realpath(path: *const c_char, callback: *const AsyncCallback) {
    let on_success = AsyncCallback::clone_from_ptr(callback);
    let callback = AsyncClosure::<PathBuf, std::io::Error>::new(Box::new(move |success, error| {
        if error.is_some() {
            on_success.on_error(to_error(error.unwrap().to_string()))
        } else {
            let ret = success.unwrap();
            let ret = ret.to_string_lossy();
            on_success.on_success(NonNull::new(
                CString::new(ret.as_ref()).unwrap().into_raw() as *mut c_void
            ))
        }
    }))
    .into_arc();
    fs::a_sync::real_path(get_str(path, "").as_ref(), callback)
}

#[no_mangle]
pub extern "C" fn native_fs_rename(
    old_path: *const c_char,
    new_path: *const c_char,
    callback: *const AsyncCallback,
) {
    let on_success = AsyncCallback::clone_from_ptr(callback);
    let callback = AsyncClosure::<(), std::io::Error>::new(Box::new(move |_, error| {
        if let Some(error) = error {
            on_success.on_error(to_error(error.to_string()))
        } else {
            on_success.on_success(None)
        }
    }))
    .into_arc();
    fs::a_sync::rename(
        get_str(old_path, "").as_ref(),
        get_str(new_path, "").as_ref(),
        callback,
    )
}

#[no_mangle]
pub extern "C" fn native_fs_rmdir(
    path: *const c_char,
    max_retries: c_int,
    recursive: bool,
    retry_delay: c_ulong,
    callback: *const AsyncCallback,
) {
    let on_success = AsyncCallback::clone_from_ptr(callback);
    let callback = AsyncClosure::<(), std::io::Error>::new(Box::new(move |_, error| {
        if let Some(error) = error {
            on_success.on_error(to_error(error.to_string()))
        } else {
            on_success.on_success(None)
        }
    }))
    .into_arc();
    fs::a_sync::rmdir(
        get_str(path, "").as_ref(),
        max_retries,
        recursive,
        retry_delay,
        callback,
    )
}

#[no_mangle]
pub extern "C" fn native_fs_rm(
    path: *const c_char,
    max_retries: c_int,
    recursive: bool,
    retry_delay: c_ulong,
    callback: *const AsyncCallback,
) {
    let on_success = AsyncCallback::clone_from_ptr(callback);
    let callback = AsyncClosure::<(), std::io::Error>::new(Box::new(move |_, error| {
        if let Some(error) = error {
            on_success.on_error(to_error(error.to_string()))
        } else {
            on_success.on_success(None)
        }
    }))
    .into_arc();

    fs::a_sync::rm(
        get_str(path, "").as_ref(),
        max_retries,
        recursive,
        retry_delay,
        callback,
    )
}

#[no_mangle]
pub extern "C" fn native_fs_stat(
    path: *const c_char,
    throw_if_no_entry: bool,
    callback: *const AsyncCallback,
) {
    let on_success = AsyncCallback::clone_from_ptr(callback);
    let callback =
        AsyncClosure::<FileStat, std::io::Error>::new(Box::new(move |success, error| {
            if let Some(error) = error {
                on_success.on_error(to_error(error.to_string()))
            } else {
                on_success.on_success(NonNull::new(
                    Box::into_raw(Box::new(success.unwrap())) as *mut c_void
                ))
            }
        }))
        .into_arc();

    fs::a_sync::stat(get_str(path, "").as_ref(), throw_if_no_entry, callback)
}

#[no_mangle]
pub extern "C" fn native_fs_symlink(
    target: *const c_char,
    path: *const c_char,
    type_: *const c_char,
    callback: *const AsyncCallback,
) {
    let on_success = AsyncCallback::clone_from_ptr(callback);
    let callback = AsyncClosure::<(), std::io::Error>::new(Box::new(move |_, error| {
        if let Some(error) = error {
            on_success.on_error(to_error(error.to_string()))
        } else {
            on_success.on_success(None)
        }
    }))
    .into_arc();

    fs::a_sync::symlink(
        get_str(target, "").as_ref(),
        get_str(path, "").as_ref(),
        get_str(type_, "").as_ref(),
        callback,
    )
}

#[no_mangle]
pub extern "C" fn native_fs_truncate(
    path: *const c_char,
    len: c_ulonglong,
    callback: *const AsyncCallback,
) {
    let on_success = AsyncCallback::clone_from_ptr(callback);
    let callback = AsyncClosure::<(), std::io::Error>::new(Box::new(move |_, error| {
        if let Some(error) = error {
            on_success.on_error(to_error(error.to_string()))
        } else {
            on_success.on_success(None)
        }
    }))
    .into_arc();
    fs::a_sync::truncate(get_str(path, "").as_ref(), len, callback)
}

#[no_mangle]
pub extern "C" fn native_fs_unlink(path: *const c_char, callback: *const AsyncCallback) {
    let on_success = AsyncCallback::clone_from_ptr(callback);
    let callback = AsyncClosure::<(), std::io::Error>::new(Box::new(move |_, error| {
        if let Some(error) = error {
            on_success.on_error(to_error(error.to_string()))
        } else {
            on_success.on_success(None)
        }
    }))
    .into_arc();

    fs::a_sync::unlink(get_str(path, "").as_ref(), callback)
}

#[no_mangle]
pub extern "C" fn native_fs_utimes(
    path: *const c_char,
    atime: c_long,
    mtime: c_long,
    callback: *const AsyncCallback,
) {
    let on_success = AsyncCallback::clone_from_ptr(callback);
    let callback = AsyncClosure::<(), std::io::Error>::new(Box::new(move |_, error| {
        if let Some(error) = error {
            on_success.on_error(to_error(error.to_string()))
        } else {
            on_success.on_success(None)
        }
    }))
    .into_arc();
    fs::a_sync::utimes(get_str(path, "").as_ref(), atime, mtime, callback)
}

#[no_mangle]
pub extern "C" fn native_fs_write_file_with_path_string(
    path: *const c_char,
    data: *const c_char,
    encoding: *const c_char,
    mode: c_int,
    flag: c_int,
    callback: *const AsyncCallback,
) {
    let on_success = AsyncCallback::clone_from_ptr(callback);
    let callback = AsyncClosure::<(), std::io::Error>::new(Box::new(move |_, error| {
        if let Some(error) = error {
            on_success.on_error(to_error(error.to_string()))
        } else {
            on_success.on_success(None)
        }
    }))
    .into_arc();

    fs::a_sync::write_file_with_str_from_path(
        get_str(path, "").as_ref(),
        get_str(data, "").as_ref(),
        get_str(encoding, "").as_ref(),
        mode,
        flag,
        callback,
    )
}

#[no_mangle]
pub extern "C" fn native_fs_write_file_with_string(
    fd: c_int,
    data: *const c_char,
    encoding: *const c_char,
    callback: *const AsyncCallback,
) {
    let on_success = AsyncCallback::clone_from_ptr(callback);
    let callback = AsyncClosure::<(), std::io::Error>::new(Box::new(move |_, error| {
        if error.is_some() {
            on_success.on_error(to_error(error.unwrap().to_string()))
        } else {
            on_success.on_success(None)
        }
    }))
    .into_arc();

    fs::a_sync::write_file_with_str(
        fd,
        get_str(data, "").as_ref(),
        get_str(encoding, "").as_ref(),
        callback,
    )
}

#[no_mangle]
pub extern "C" fn native_fs_write_file_with_path_bytes(
    path: *const c_char,
    data: *mut u8,
    data_len: size_t,
    encoding: *const c_char,
    mode: c_int,
    flag: c_int,
    callback: *const AsyncCallback,
) {
    let on_success = AsyncCallback::clone_from_ptr(callback);
    let callback = AsyncClosure::<(), std::io::Error>::new(Box::new(move |_, error| {
        if let Some(error) = error {
            on_success.on_error(to_error(error.to_string()))
        } else {
            on_success.on_success(None)
        }
    }))
    .into_arc();

    fs::a_sync::write_file_with_bytes_from_path(
        get_str(path, "").as_ref(),
        ByteBuf::new(data, data_len),
        get_str(encoding, "").as_ref(),
        mode,
        flag,
        callback,
    )
}

#[no_mangle]
pub extern "C" fn native_fs_write_file_with_bytes(
    fd: c_int,
    data: *const u8,
    data_len: size_t,
    callback: *const AsyncCallback,
) {
    let on_success = AsyncCallback::clone_from_ptr(callback);
    let callback = AsyncClosure::<(), std::io::Error>::new(Box::new(move |_, error| {
        if let Some(error) = error {
            on_success.on_error(to_error(error.to_string()))
        } else {
            on_success.on_success(None)
        }
    }))
    .into_arc();

    fs::a_sync::write_file_with_bytes(fd, ByteBuf::new(data, data_len), callback)
}

#[no_mangle]
pub extern "C" fn native_fs_writev(
    fd: c_int,
    buffer: *const *const ByteBuf,
    buffer_len: size_t,
    position: c_long,
    callback: *const AsyncCallback,
) {
    writev(fd, buffer, buffer_len, position, callback);
}

pub(crate) fn writev(
    fd: c_int,
    buffer: *const *const ByteBuf,
    buffer_len: size_t,
    position: c_long,
    callback: *const AsyncCallback,
) {
    let on_success = AsyncCallback::clone_from_ptr(callback);
    let callback = AsyncClosure::<usize, std::io::Error>::new(Box::new(move |success, error| {
        if error.is_some() {
            on_success.on_error(to_error(error.unwrap().to_string()))
        } else {
            on_success.on_success(NonNull::new(success.unwrap() as *mut c_void))
        }
    }))
    .into_arc();

    fs::a_sync::writev_raw(fd, buffer, buffer_len, position, callback)
}
