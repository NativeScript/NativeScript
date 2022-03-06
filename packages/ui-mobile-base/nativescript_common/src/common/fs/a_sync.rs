use std::collections::HashMap;
use std::ffi::{c_void, CString, OsString};
use std::fmt::Debug;
use std::fs::File;
use std::io::{Error, ErrorKind};
use std::os::raw::c_longlong;
#[cfg(unix)]
use std::os::unix::prelude::*;
use std::panic::catch_unwind;
use std::path::{Path, PathBuf};
use std::ptr::NonNull;
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::Arc;

use libc::{c_char, c_int, c_long, c_uint, c_ulong, c_ulonglong, c_ushort};
use once_cell::sync::OnceCell;
use parking_lot::Mutex;
use rand::Rng;
use tokio::runtime::Runtime;

use crate::common::fs::file_dir::FileDir;
use crate::common::fs::file_dirent::FileDirent;
use crate::common::fs::file_stat::FileStat;
use crate::common::fs::prelude::handle_meta;
use crate::common::fs::sync::open_path_with_str;
use crate::common::{ByteBuf, ByteBufMut};

pub type OnSuccessCallback = extern "C" fn(result: Option<NonNull<c_void>>);

pub type OnErrorCallback = extern "C" fn(error: Option<NonNull<c_void>>);

pub struct AsyncClosure<T, U> {
    pub(crate) callback: Box<dyn Fn(Option<T>, Option<U>)>,
}

impl<T, U> AsyncClosure<T, U> {
    pub fn new(callback: Box<dyn Fn(Option<T>, Option<U>)>) -> Self {
        Self { callback }
    }

    pub fn on_success(&self, result: Option<T>) {
        (self.callback)(result, None)
    }

    pub fn on_error(&self, result: Option<U>) {
        (self.callback)(None, result)
    }

    pub fn into_arc(self) -> Arc<Self> {
        Arc::new(self)
    }
}

unsafe impl<T, U> Sync for AsyncClosure<T, U> {}

unsafe impl<T, U> Send for AsyncClosure<T, U> {}

#[derive(Debug)]
#[repr(C)]
pub struct WatchEvent {
    pub(crate) filename: Option<NonNull<c_char>>,
    pub(crate) event_type: Option<NonNull<c_char>>,
}

impl WatchEvent {
    pub fn new(filename: &str, event_type: &str) -> Self {
        Self {
            filename: NonNull::new(CString::new(filename.to_string()).unwrap().into_raw()),
            event_type: NonNull::new(CString::new(event_type.to_string()).unwrap().into_raw()),
        }
    }

    pub fn into_box(self) -> Box<WatchEvent> {
        Box::new(self)
    }
}

#[derive(Debug)]
#[repr(C)]
pub struct FileWatchEvent {
    pub(crate) current: Option<NonNull<FileStat>>,
    pub(crate) previous: Option<NonNull<FileStat>>,
}

impl FileWatchEvent {
    pub fn new(current: FileStat, previous: FileStat) -> Self {
        Self {
            current: NonNull::new(Box::into_raw(Box::new(current))),
            previous: NonNull::new(Box::into_raw(Box::new(previous))),
        }
    }

    pub fn into_box(self) -> Box<FileWatchEvent> {
        Box::new(self)
    }
}

static INSTANCE: OnceCell<Runtime> = OnceCell::new();

pub(crate) fn runtime() -> &'static Runtime {
    INSTANCE.get_or_init(|| {
        let mut builder = tokio::runtime::Builder::new_multi_thread();
        set_handler(&mut builder);
        builder.build().unwrap()
    })
}

#[cfg(target_os = "android")]
fn set_handler(builder: &mut tokio::runtime::Builder) {
    builder.on_thread_start(|| {
        if let Some(jvm) = crate::android::JVM.get() {
            let _ = jvm.attach_current_thread();
            log::info!("on_thread_start");
        }
    });
}

#[cfg(any(target_os = "ios", target_os = "macos"))]
fn set_handler(_builder: &mut tokio::runtime::Builder) {}

pub(crate) struct WatcherItem {
    watcher: notify::RecommendedWatcher,
    callbacks: Vec<Arc<AsyncClosure<WatchEvent, Error>>>,
    is_alive: AtomicBool,
    persistent: bool,
}

pub(crate) struct FileWatcherItem {
    watcher: notify::PollWatcher,
    callbacks: Vec<Arc<AsyncClosure<FileWatchEvent, Error>>>,
    is_alive: AtomicBool,
    persistent: bool,
}

type WatcherMap = Arc<Mutex<HashMap<String, WatcherItem>>>;
type FileWatcherMap = Arc<Mutex<HashMap<String, FileWatcherItem>>>;

fn watcher_map() -> &'static WatcherMap {
    static INSTANCE: OnceCell<WatcherMap> = OnceCell::new();
    INSTANCE.get_or_init(|| Arc::new(Mutex::new(HashMap::new())))
}

fn file_watcher_map() -> &'static FileWatcherMap {
    static INSTANCE: OnceCell<FileWatcherMap> = OnceCell::new();
    INSTANCE.get_or_init(|| Arc::new(Mutex::new(HashMap::new())))
}

pub fn access(path: &str, access: c_int, callback: Arc<AsyncClosure<(), Error>>) {
    let path = path.to_string();
    let callback = Arc::clone(&callback);
    runtime().spawn(async move {
        match super::sync::access(&path, access) {
            Ok(_) => {
                callback.on_success(None);
            }
            Err(error) => {
                callback.on_error(Some(error));
            }
        }
    });
}

pub fn append_file_with_str(fd: c_int, data: &str, callback: Arc<AsyncClosure<(), Error>>) {
    let data = data.to_string();
    runtime().spawn(async move {
        match super::sync::append_file_with_str(fd, &data) {
            Ok(_) => {
                callback.on_success(None);
            }
            Err(error) => {
                callback.on_error(Some(error));
            }
        }
    });
}

pub fn append_file_with_bytes(fd: c_int, data: ByteBuf, callback: Arc<AsyncClosure<(), Error>>) {
    let callback = Arc::clone(&callback);
    runtime().block_on(async move {
        match super::sync::append_file_with_bytes(fd, data.as_slice()) {
            Ok(_) => {
                callback.on_success(None);
            }
            Err(error) => {
                callback.on_error(Some(error));
            }
        }
    });
}

pub fn append_file_with_path_str(
    path: &str,
    data: &str,
    mode: c_int,
    flags: c_int,
    callback: Arc<AsyncClosure<(), Error>>,
) {
    let path = path.to_string();
    let data = data.to_string();
    runtime().block_on(async move {
        match super::sync::append_file_with_path_str(&path, &data, mode, flags) {
            Ok(_) => {
                callback.on_success(None);
            }
            Err(error) => {
                callback.on_error(Some(error));
            }
        }
    });
}

pub fn append_file_with_path_bytes(
    path: &str,
    data: ByteBufMut,
    mode: c_int,
    flags: c_int,
    callback: Arc<AsyncClosure<(), Error>>,
) {
    let path = path.to_string();
    let callback = Arc::clone(&callback);
    runtime().block_on(async move {
        match super::sync::append_file_with_path_bytes(&path, data.as_slice(), mode, flags) {
            Ok(_) => {
                callback.on_success(None);
            }
            Err(error) => {
                callback.on_error(Some(error));
            }
        }
    });
}

pub fn chmod(path: &str, mode: c_uint, callback: Arc<AsyncClosure<(), Error>>) {
    let path = path.to_string();
    let callback = Arc::clone(&callback);
    runtime().spawn(async move {
        match super::sync::chmod(&path, mode) {
            Ok(_) => {
                callback.on_success(None);
            }
            Err(error) => {
                callback.on_error(Some(error));
            }
        }
    });
}

pub fn chown(path: &str, uid: c_uint, gid: c_uint, callback: Arc<AsyncClosure<(), Error>>) {
    let path = path.to_string();
    let callback = Arc::clone(&callback);
    runtime().spawn(async move {
        match super::sync::chown(&path, uid, gid) {
            Ok(_) => {
                callback.on_success(None);
            }
            Err(error) => {
                callback.on_error(Some(error));
            }
        }
    });
}

pub fn close(fd: c_int, callback: Arc<AsyncClosure<(), Error>>) {
    let callback = Arc::clone(&callback);
    runtime().spawn(async move {
        match catch_unwind(|| {
            let _ = unsafe { File::from_raw_fd(fd) };
        }) {
            Ok(_) => {
                callback.on_success(None);
            }
            Err(_) => {
                callback.on_error(Some(std::io::Error::new(
                    std::io::ErrorKind::Other,
                    "Failed to close descriptor",
                )));
            }
        }
    });
}

pub fn copy_file(src: &str, dest: &str, flags: c_uint, callback: Arc<AsyncClosure<(), Error>>) {
    let src = src.to_string();
    let dest = dest.to_string();
    let callback = Arc::clone(&callback);
    runtime().spawn(async move {
        let src = Path::new(&src);
        let dest = Path::new(&dest);
        match super::copy_file::copy_file(src, dest, flags) {
            Ok(_) => {
                callback.on_success(None);
            }
            Err(error) => {
                callback.on_error(Some(error));
            }
        }
    });
}

pub fn cp(_src: &str, _dest: &str) {
    todo!()
    // let src = Path::new(src);
    // let dest = Path::new(dest);
    // for entry in fs::read_dir(src)? {
    //     let entry = entry?;
    // }
}

pub fn exists(path: &str, callback: Arc<AsyncClosure<bool, Error>>) {
    let path = path.to_string();
    let callback = Arc::clone(&callback);
    runtime().spawn(async move {
        let exists = super::sync::exists(&path);
        callback.on_success(Some(exists));
    });
}

pub fn fchmod(fd: c_int, mode: c_ushort, callback: Arc<AsyncClosure<(), Error>>) {
    let callback = Arc::clone(&callback);
    runtime().spawn(async move {
        match super::sync::fchmod(fd, mode) {
            Ok(_) => {
                callback.on_success(None);
            }
            Err(error) => {
                callback.on_error(Some(error));
            }
        }
    });
}

pub fn fchown(fd: c_int, uid: c_uint, gid: c_uint, callback: Arc<AsyncClosure<(), Error>>) {
    runtime().spawn(async move {
        match super::sync::fchown(fd, uid, gid) {
            Ok(_) => {
                callback.on_success(None);
            }
            Err(error) => {
                callback.on_error(Some(error));
            }
        }
    });
}

pub fn fdatasync(fd: c_int, callback: Arc<AsyncClosure<(), Error>>) {
    let callback = Arc::clone(&callback);
    runtime().spawn(async move {
        match super::sync::fdatasync(fd) {
            Ok(_) => {
                callback.on_success(None);
            }
            Err(error) => {
                callback.on_error(Some(error));
            }
        }
    });
}

pub fn fstat(fd: c_int, callback: Arc<AsyncClosure<FileStat, Error>>) {
    let callback = Arc::clone(&callback);
    runtime().spawn(async move {
        match super::sync::fstat(fd) {
            Ok(meta) => {
                callback.on_success(Some(handle_meta(&meta)));
            }
            Err(error) => {
                callback.on_error(Some(error));
            }
        }
    });
}

pub fn fsync(fd: c_int, callback: Arc<AsyncClosure<(), Error>>) {
    let callback = Arc::clone(&callback);
    runtime().spawn(async move {
        match super::sync::fsync(fd) {
            Ok(_) => {
                callback.on_success(None);
            }
            Err(error) => {
                callback.on_error(Some(error));
            }
        }
    });
}

pub fn ftruncate(fd: c_int, len: c_long, callback: Arc<AsyncClosure<(), Error>>) {
    let callback = Arc::clone(&callback);
    runtime().spawn(async move {
        match super::sync::ftruncate(fd, len) {
            Ok(_) => {
                callback.on_success(None);
            }
            Err(error) => {
                callback.on_error(Some(error));
            }
        }
    });
}

pub fn futimes(fd: c_int, atime: c_long, mtime: c_long, callback: Arc<AsyncClosure<(), Error>>) {
    let callback = Arc::clone(&callback);
    runtime().spawn(async move {
        match super::sync::futimes(fd, atime, mtime) {
            Ok(_) => {
                callback.on_success(None);
            }
            Err(error) => {
                callback.on_error(Some(error));
            }
        }
    });
}

pub fn lchmod(path: &str, mode: c_ushort, callback: Arc<AsyncClosure<(), Error>>) {
    let callback = Arc::clone(&callback);
    let path = path.to_string();
    runtime().spawn(async move {
        match super::sync::lchmod(&path, mode) {
            Ok(_) => {
                callback.on_success(None);
            }
            Err(error) => {
                callback.on_error(Some(error));
            }
        }
    });
}

pub fn lchown(path: &str, uid: c_uint, gid: c_uint, callback: Arc<AsyncClosure<(), Error>>) {
    let callback = Arc::clone(&callback);
    let path = path.to_string();
    runtime().spawn(async move {
        match super::sync::lchown(&path, uid, gid) {
            Ok(_) => {
                callback.on_success(None);
            }
            Err(error) => {
                callback.on_error(Some(error));
            }
        }
    });
}

pub fn lutimes(path: &str, atime: c_long, mtime: c_long, callback: Arc<AsyncClosure<(), Error>>) {
    let path = path.to_string();
    let callback = Arc::clone(&callback);
    runtime().spawn(async move {
        match super::sync::lutimes(&path, atime, mtime) {
            Ok(_) => {
                callback.on_success(None);
            }
            Err(error) => {
                callback.on_error(Some(error));
            }
        }
    });
}

pub fn link(existing_path: &str, new_path: &str, callback: Arc<AsyncClosure<(), Error>>) {
    let callback = Arc::clone(&callback);
    let existing_path = existing_path.to_string();
    let new_path = new_path.to_string();
    runtime().spawn(async move {
        match super::sync::link(&existing_path, &new_path) {
            Ok(_) => {
                callback.on_success(None);
            }
            Err(error) => {
                callback.on_error(Some(error));
            }
        }
    });
}

pub fn lstat(path: &str, callback: Arc<AsyncClosure<FileStat, Error>>) {
    let callback = Arc::clone(&callback);
    let path = path.to_string();
    runtime().spawn(async move {
        match super::sync::lstat(&path) {
            Ok(meta) => {
                callback.on_success(Some(handle_meta(&meta)));
            }
            Err(error) => {
                callback.on_error(Some(error));
            }
        }
    });
}

pub fn mkdir(path: &str, mode: c_uint, recursive: bool, callback: Arc<AsyncClosure<(), Error>>) {
    let path = path.to_string();
    let callback = Arc::clone(&callback);
    runtime().spawn(async move {
        match super::sync::mkdir(&path, mode, recursive) {
            Ok(_) => {
                callback.on_success(None);
            }
            Err(error) => {
                callback.on_error(Some(error));
            }
        }
    });
}

pub fn mkdtemp(prefix: &str, callback: Arc<AsyncClosure<PathBuf, Error>>) {
    let prefix = prefix.to_string();
    let callback = Arc::clone(&callback);
    runtime().spawn(async move {
        match super::sync::make_temp(None, Some(&prefix), None, false) {
            Ok(buf) => {
                callback.on_success(Some(buf));
            }
            Err(error) => {
                callback.on_error(Some(error));
            }
        }
    });
}

pub fn open(path: &str, flags: c_int, mode: c_int, callback: Arc<AsyncClosure<c_int, Error>>) {
    let path = path.to_string();
    let callback = Arc::clone(&callback);
    runtime().spawn(async move {
        match open_path_with_str(&path, flags, mode) {
            Ok(fd) => {
                callback.on_success(Some(fd));
            }
            Err(error) => {
                callback.on_error(Some(error));
            }
        }
    });
}

pub fn opendir(path: &str, callback: Arc<AsyncClosure<FileDir, Error>>) {
    let path = path.to_string();
    let callback = Arc::clone(&callback);
    runtime().spawn(async move {
        match super::sync::opendir(&path) {
            Ok(fd) => {
                callback.on_success(Some(fd));
            }
            Err(error) => {
                callback.on_error(Some(error));
            }
        }
    });
}

pub fn read(
    fd: c_int,
    buffer: ByteBufMut,
    offset: usize,
    length: usize,
    position: isize,
    callback: Arc<AsyncClosure<usize, Error>>,
) {
    let callback = Arc::clone(&callback);
    runtime().spawn(async move {
        match super::sync::read(fd, buffer.as_mut_slice(), offset, length, position) {
            Ok(read) => {
                callback.on_success(Some(read));
            }
            Err(error) => {
                callback.on_error(Some(error));
            }
        }
    });
}

pub fn readdir_with_file_types(
    path: &str,
    _encoding: &str,
    callback: Box<dyn Fn(Option<Vec<FileDirent>>, Option<std::io::Error>) + Send>,
) {
    let path = path.to_string();
    let _encoding = _encoding.to_string();
    runtime().spawn(async move {
        match super::sync::readdir_with_file_types(&path, &_encoding) {
            Ok(read) => callback(Some(read), None),
            Err(error) => callback(None, Some(error)),
        }
    });
}

pub fn readdir_with_file(
    path: &str,
    _encoding: &str,
    callback: Box<dyn Fn(Option<Vec<OsString>>, Option<std::io::Error>) + Send>,
) {
    let path = path.to_string();
    let _encoding = _encoding.to_string();
    runtime().spawn(async move {
        match super::sync::readdir_with_file(&path, &_encoding) {
            Ok(read) => callback(Some(read), None),
            Err(error) => callback(None, Some(error)),
        }
    });
}

pub fn read_file(path: &str, flags: c_int, callback: Arc<AsyncClosure<ByteBufMut, Error>>) {
    let path = path.to_string();
    let callback = Arc::clone(&callback);
    runtime().spawn(async move {
        match super::sync::read_file(&path, flags) {
            Ok(read) => {
                callback.on_success(Some(ByteBufMut::from(read)));
            }
            Err(error) => {
                callback.on_error(Some(error));
            }
        }
    });
}

pub fn read_file_with_fd(fd: c_int, flags: c_int, callback: Arc<AsyncClosure<ByteBufMut, Error>>) {
    let callback = Arc::clone(&callback);
    runtime().spawn(async move {
        match super::sync::read_file_with_fd(fd, flags) {
            Ok(read) => {
                callback.on_success(Some(ByteBufMut::from(read)));
            }
            Err(error) => {
                callback.on_error(Some(error));
            }
        }
    });
}

pub fn read_link(path: &str, encoding: &str, callback: Arc<AsyncClosure<PathBuf, Error>>) {
    let path = path.to_string();
    let encoding = encoding.to_string();
    let callback = Arc::clone(&callback);
    runtime().spawn(async move {
        match super::sync::read_link(&path, &encoding) {
            Ok(read) => {
                callback.on_success(Some(read));
            }
            Err(error) => {
                callback.on_error(Some(error));
            }
        }
    });
}

pub fn readv(
    fd: c_int,
    buffers: Vec<ByteBufMut>,
    position: c_long,
    callback: Arc<AsyncClosure<usize, Error>>,
) {
    let callback = Arc::clone(&callback);
    runtime().spawn(async move {
        let mut buffers = buffers;
        match super::sync::readv(fd, buffers.as_mut_slice(), position) {
            Ok(read) => {
                callback.on_success(Some(read));
            }
            Err(error) => {
                callback.on_error(Some(error));
            }
        }
    });
}

pub fn readv_raw(
    fd: c_int,
    buffer: *const *mut ByteBufMut,
    buffer_len: usize,
    position: c_long,
    callback: Arc<AsyncClosure<usize, Error>>,
) {
    let callback = Arc::clone(&callback);
    // transmute to send pointer
    let buffer = buffer as c_longlong;
    runtime().spawn(async move {
        let buffer = buffer as *const *mut ByteBufMut;
        match super::sync::readv_raw(fd, buffer, buffer_len, position) {
            Ok(wrote) => {
                callback.on_success(Some(wrote));
            }
            Err(error) => {
                callback.on_error(Some(error));
            }
        }
    });
}

pub fn real_path(path: &str, callback: Arc<AsyncClosure<PathBuf, Error>>) {
    let path = path.to_string();
    let callback = Arc::clone(&callback);
    runtime().spawn(async move {
        match super::sync::real_path(&path) {
            Ok(buf) => {
                callback.on_success(Some(buf));
            }
            Err(error) => {
                callback.on_error(Some(error));
            }
        }
    });
}

pub fn rename(old_path: &str, new_path: &str, callback: Arc<AsyncClosure<(), Error>>) {
    let path = old_path.to_string();
    let new_path = new_path.to_string();
    let callback = Arc::clone(&callback);
    runtime().spawn(async move {
        match super::sync::rename(&path, &new_path) {
            Ok(_) => {
                callback.on_success(None);
            }
            Err(error) => {
                callback.on_error(Some(error));
            }
        }
    });
}

pub fn rmdir(
    path: &str,
    max_retries: c_int,
    recursive: bool,
    retry_delay: c_ulonglong,
    callback: Arc<AsyncClosure<(), Error>>,
) {
    let callback = Arc::clone(&callback);
    let path = path.to_string();
    runtime().spawn(async move {
        match super::sync::rmdir(&path, max_retries, recursive, retry_delay) {
            Ok(_) => {
                callback.on_success(None);
            }
            Err(error) => {
                callback.on_error(Some(error));
            }
        }
    });
}

pub fn rm(
    path: &str,
    max_retries: c_int,
    recursive: bool,
    retry_delay: c_ulonglong,
    callback: Arc<AsyncClosure<(), Error>>,
) {
    let path = path.to_string();
    let callback = Arc::clone(&callback);
    runtime().spawn(async move {
        match super::sync::rm(&path, max_retries, recursive, retry_delay) {
            Ok(_) => {
                callback.on_success(None);
            }
            Err(error) => {
                callback.on_error(Some(error));
            }
        }
    });
}

pub fn stat(path: &str, throw_if_no_entry: bool, callback: Arc<AsyncClosure<FileStat, Error>>) {
    let path = path.to_string();
    let callback = Arc::clone(&callback);
    runtime().spawn(async move {
        match super::sync::stat(&path) {
            Ok(meta) => {
                callback.on_success(Some(handle_meta(&meta)));
            }
            Err(error) => {
                let mut res = None;
                if throw_if_no_entry && error.kind() == std::io::ErrorKind::NotFound {
                    res = Some(error);
                } else {
                    res = None;
                }
                callback.on_error(res);
            }
        }
    });
}

pub fn symlink(target: &str, path: &str, type_: &str, callback: Arc<AsyncClosure<(), Error>>) {
    let target = target.to_string();
    let path = path.to_string();
    let type_ = type_.to_string();
    let callback = Arc::clone(&callback);
    runtime().spawn(async move {
        match super::sync::symlink(&target, &path, &type_) {
            Ok(_) => {
                callback.on_success(None);
            }
            Err(error) => {
                callback.on_error(Some(error));
            }
        }
    });
}

pub fn truncate(path: &str, len: c_ulonglong, callback: Arc<AsyncClosure<(), Error>>) {
    let path = path.to_string();
    let callback = Arc::clone(&callback);
    runtime().spawn(async move {
        match super::sync::truncate(&path, len) {
            Ok(_) => {
                callback.on_success(None);
            }
            Err(error) => {
                callback.on_error(Some(error));
            }
        }
    });
}

pub fn unlink(path: &str, callback: Arc<AsyncClosure<(), Error>>) {
    let path = path.to_string();
    let callback = Arc::clone(&callback);
    runtime().spawn(async move {
        match super::sync::unlink(&path) {
            Ok(_) => {
                callback.on_success(None);
            }
            Err(error) => {
                callback.on_error(Some(error));
            }
        }
    });
}

pub fn unwatch_file(filename: &str, callback: Option<Arc<AsyncClosure<FileWatchEvent, Error>>>) {
    let filename = filename.to_string();
    let map = Arc::clone(file_watcher_map());
    let callback = callback.map(|callback| Arc::clone(&callback));
    runtime().spawn(async move {
        let mut lock = map.lock();
        match callback {
            None => {
                if let Some(item) = lock.get_mut(&filename) {
                    if !item.persistent {
                        item.is_alive.store(false, Ordering::SeqCst);
                    }
                }
            }
            Some(callback) => {
                if let Some(item) = lock.get_mut(&filename) {
                    item.callbacks.retain(|cb| !Arc::ptr_eq(&callback, cb))
                }
            }
        }
    });
}

pub fn utimes(path: &str, atime: c_long, mtime: c_long, callback: Arc<AsyncClosure<(), Error>>) {
    let path = path.to_string();
    let callback = Arc::clone(&callback);
    runtime().spawn(async move {
        match super::sync::utimes(&path, atime, mtime) {
            Ok(_) => {
                callback.on_success(None);
            }
            Err(error) => {
                callback.on_error(Some(error));
            }
        }
    });
}

pub fn file_watcher_unref(filename: &str, callback: Arc<AsyncClosure<FileWatchEvent, Error>>) {
    let filename = filename.to_string();
    let map = Arc::clone(file_watcher_map());
    runtime().spawn(async move {
        let mut lock = map.lock();
        if let Some(item) = lock.get_mut(&filename) {
            item.callbacks.retain(|f| !Arc::ptr_eq(f, &callback));
        }
    });
}

pub fn file_watcher_ref(filename: &str, callback: Arc<AsyncClosure<FileWatchEvent, Error>>) {
    let filename = filename.to_string();
    let map = Arc::clone(file_watcher_map());
    runtime().spawn(async move {
        let mut lock = map.lock();
        if let Some(item) = lock.get_mut(&filename) {
            let pos = item
                .callbacks
                .iter()
                .position(|f| Arc::ptr_eq(f, &callback));
            if pos.is_none() {
                item.callbacks.push(callback);
            }
        }
    });
}

pub fn watch(
    filename: &str,
    persistent: bool,
    recursive: bool,
    encoding: &str,
    callback: Arc<AsyncClosure<WatchEvent, Error>>,
) {
    use notify::{watcher, DebouncedEvent, RecursiveMode, Watcher};
    use std::sync::mpsc::channel;
    use std::time::Duration;
    let filename = filename.to_string();
    let map = Arc::clone(watcher_map());
    let callback = Arc::clone(&callback);
    runtime().spawn(async move {
        let recursive = if recursive {
            RecursiveMode::Recursive
        } else {
            RecursiveMode::NonRecursive
        };
        let (tx, rx) = channel();
        {
            let mut map = map.lock();

            let has_key = map.contains_key(&filename);
            if has_key {
                if let Some(item) = map.get_mut(&filename) {
                    item.callbacks.push(callback)
                }
                return;
            }
            let watcher = watcher(tx, Duration::from_millis(0));

            if let Err(error) = watcher {
                callback.on_error(Some(std::io::Error::new(
                    ErrorKind::Other,
                    error.to_string(),
                )));
                return;
            }

            let mut watcher = watcher.unwrap();

            if let Err(error) = watcher.watch(&filename, recursive) {
                callback.on_error(Some(std::io::Error::new(
                    ErrorKind::Other,
                    error.to_string(),
                )));
                return;
            }

            let item = WatcherItem {
                watcher,
                callbacks: vec![callback],
                is_alive: AtomicBool::new(true),
                persistent,
            };

            map.insert(filename.clone(), item);
        }

        loop {
            let mut map = map.lock();
            match rx.recv() {
                Ok(event) => {
                    if let Some(item) = map.get(&filename) {
                        if !item.is_alive.load(Ordering::SeqCst) {
                            map.remove(&filename);
                            break;
                        }
                        let mut event_err = None;
                        let mut event_type = "";
                        let mut event_file_name = std::path::PathBuf::new();
                        match event {
                            DebouncedEvent::NoticeWrite(path) => {
                                event_type = "change";
                                event_file_name = path;
                            }
                            DebouncedEvent::NoticeRemove(path) => {
                                event_type = "change";
                                event_file_name = path;
                            }
                            DebouncedEvent::Create(path) => {
                                event_type = "rename";
                                event_file_name = path;
                            }
                            DebouncedEvent::Write(path) => {
                                event_type = "change";
                                event_file_name = path;
                            }
                            DebouncedEvent::Chmod(path) => {
                                event_type = "change";
                                event_file_name = path;
                            }
                            DebouncedEvent::Remove(path) => {
                                event_type = "rename";
                                event_file_name = path;
                            }
                            DebouncedEvent::Rename(_source_path, dest_path) => {
                                event_type = "rename";
                                event_file_name = dest_path;
                            }
                            DebouncedEvent::Error(error, _) => {
                                event_err = Some(error);
                            }
                            _ => {}
                        }
                        for callback in item.callbacks.iter() {
                            match event_err.as_ref() {
                                None => callback.on_success(Some(WatchEvent::new(
                                    event_file_name.to_string_lossy().as_ref(),
                                    event_type,
                                ))),
                                Some(error) => {
                                    callback.on_error(Some(std::io::Error::new(
                                        ErrorKind::Other,
                                        error.to_string(),
                                    )));
                                }
                            }
                        }
                    }
                }
                Err(error) => {
                    if let Some(item) = map.get(&filename) {
                        if !item.is_alive.load(Ordering::SeqCst) {
                            map.remove(&filename);
                            break;
                        }
                        for callback in item.callbacks.iter() {
                            callback.on_error(Some(std::io::Error::new(
                                ErrorKind::Other,
                                error.to_string(),
                            )));
                        }
                    }
                    break;
                }
            }
        }
    });
}

pub fn watcher_unref(filename: &str, callback: Arc<AsyncClosure<WatchEvent, Error>>) {
    let filename = filename.to_string();
    let map = Arc::clone(watcher_map());
    runtime().spawn(async move {
        let mut lock = map.lock();
        if let Some(item) = lock.get_mut(&filename) {
            item.callbacks.retain(|f| !Arc::ptr_eq(f, &callback));
        }
    });
}

pub fn watcher_ref(filename: &str, callback: Arc<AsyncClosure<WatchEvent, Error>>) {
    let filename = filename.to_string();
    let map = Arc::clone(watcher_map());
    runtime().spawn(async move {
        let mut lock = map.lock();
        if let Some(item) = lock.get_mut(&filename) {
            let pos = item
                .callbacks
                .iter()
                .position(|f| Arc::ptr_eq(f, &callback));
            if pos.is_none() {
                item.callbacks.push(callback);
            }
        }
    });
}

pub fn watcher_close(
    filename: &str,
    callback: Arc<AsyncClosure<WatchEvent, Error>>,
    on_close: Arc<AsyncClosure<(), Error>>,
) {
    // same as unref for now until sure about the desired behaviour
    let filename = filename.to_string();
    let map = Arc::clone(watcher_map());
    runtime().spawn(async move {
        let mut lock = map.lock();
        if let Some(item) = lock.get_mut(&filename) {
            item.callbacks.retain(|f| !Arc::ptr_eq(f, &callback));
        }
        on_close.on_success(None);
    });
}

pub fn watch_file(
    filename: &str,
    bigint: bool,
    persistent: bool,
    interval: c_ulong,
    callback: Arc<AsyncClosure<FileWatchEvent, Error>>,
) {
    use notify::{PollWatcher, RecursiveMode, Watcher};

    use std::sync::mpsc::channel;

    let filename = filename.to_string();
    let callback = Arc::clone(&callback);
    let map = Arc::clone(file_watcher_map());
    runtime().spawn(async move {
        let (tx, rx) = channel();
        {
            let mut map = map.lock();

            let has_key = map.contains_key(&filename);
            if has_key {
                if let Some(item) = map.get_mut(&filename) {
                    item.callbacks.push(callback)
                }
                return;
            }
            let watcher = PollWatcher::with_delay_ms(tx, interval as u32);

            if let Err(error) = watcher {
                callback.on_error(Some(std::io::Error::new(
                    ErrorKind::Other,
                    error.to_string(),
                )));
                return;
            }

            let mut watcher = watcher.unwrap();

            if let Err(error) = watcher.watch(&filename, RecursiveMode::NonRecursive) {
                callback.on_error(Some(std::io::Error::new(
                    ErrorKind::Other,
                    error.to_string(),
                )));
                return;
            }

            let item = FileWatcherItem {
                watcher,
                callbacks: vec![callback],
                is_alive: AtomicBool::new(true),
                persistent,
            };

            map.insert(filename.clone(), item);
        }

        let mut previous_stat = FileStat::default();
        loop {
            let mut map = map.lock();
            match rx.recv() {
                Ok(event) => {
                    if let Some(item) = map.get(&filename) {
                        if !item.is_alive.load(Ordering::SeqCst) {
                            map.remove(&filename);
                            break;
                        }
                        let mut event_err = None;
                        let mut event_file_name = std::path::PathBuf::new();

                        match event.op {
                            Ok(op) => {
                                if op == notify::op::Op::CHMOD
                                    || op == notify::op::Op::CREATE
                                    || op == notify::op::Op::REMOVE
                                    || op == notify::op::Op::RENAME
                                    || op == notify::op::Op::WRITE
                                {
                                    event_file_name = event.path.unwrap_or_default()
                                }
                            }
                            Err(error) => {
                                event_err = Some(error);
                            }
                        }

                        let mut current_stat = FileStat::default();
                        if event_err.is_none() {
                            current_stat =
                                super::sync::stat(event_file_name.to_string_lossy().as_ref())
                                    .map_or_else(|_| FileStat::default(), |v| handle_meta(&v));
                        }

                        if item.callbacks.is_empty() && !item.persistent {
                            map.remove(&filename);
                            break;
                        }

                        for callback in item.callbacks.iter() {
                            match event_err.as_ref() {
                                None => callback.on_success(Some(FileWatchEvent::new(
                                    current_stat,
                                    previous_stat,
                                ))),
                                Some(error) => {
                                    callback.on_error(Some(std::io::Error::new(
                                        ErrorKind::Other,
                                        error.to_string(),
                                    )));
                                }
                            }
                        }

                        if event_err.is_none() {
                            previous_stat = current_stat;
                        }
                    }
                }
                Err(error) => {
                    if let Some(item) = map.get(&filename) {
                        if !item.is_alive.load(Ordering::SeqCst) {
                            map.remove(&filename);
                            break;
                        }

                        for callback in item.callbacks.iter() {
                            callback.on_error(Some(std::io::Error::new(
                                ErrorKind::Other,
                                error.to_string(),
                            )));
                        }
                    }
                    break;
                }
            }
        }
    });
}

pub fn write(
    fd: c_int,
    buffer: ByteBuf,
    offset: usize,
    length: usize,
    position: isize,
    callback: Arc<AsyncClosure<usize, Error>>,
) {
    let callback = Arc::clone(&callback);
    runtime().spawn(async move {
        match super::sync::write(fd, buffer.as_slice(), offset, length, position) {
            Ok(wrote) => {
                callback.on_success(Some(wrote));
            }
            Err(error) => {
                callback.on_error(Some(error));
            }
        }
    });
}

pub fn write_string(
    fd: c_int,
    string: &str,
    encoding: &str,
    position: isize,
    callback: Arc<AsyncClosure<usize, Error>>,
) {
    let callback = Arc::clone(&callback);
    let string = string.to_string();
    let encoding = encoding.to_string();
    runtime().spawn(async move {
        match super::sync::write_string(fd, &string, &encoding, position) {
            Ok(wrote) => unsafe {
                callback.on_success(Some(wrote));
            },
            Err(error) => {
                callback.on_error(Some(error));
            }
        }
    });
}

pub fn write_file_with_str(
    fd: c_int,
    data: &str,
    encoding: &str,
    callback: Arc<AsyncClosure<(), Error>>,
) {
    let data = data.to_string();
    let encoding = encoding.to_string();
    let callback = Arc::clone(&callback);
    runtime().spawn(async move {
        match super::sync::write_file_with_str(fd, &data, &encoding) {
            Ok(_) => {
                callback.on_success(None);
            }
            Err(error) => {
                callback.on_error(Some(error));
            }
        }
    });
}

pub fn write_file_with_bytes(fd: c_int, data: ByteBuf, callback: Arc<AsyncClosure<(), Error>>) {
    let callback = Arc::clone(&callback);
    runtime().spawn(async move {
        match super::sync::write_file_with_bytes(fd, data.as_slice()) {
            Ok(_) => {
                callback.on_success(None);
            }
            Err(error) => {
                callback.on_error(Some(error));
            }
        }
    });
}

pub fn write_file_with_str_from_path(
    path: &str,
    data: &str,
    encoding: &str,
    mode: c_int,
    flag: c_int,
    callback: Arc<AsyncClosure<(), Error>>,
) {
    let path = path.to_string();
    let encoding = encoding.to_string();
    let data = data.to_string();
    let callback = Arc::clone(&callback);
    runtime().spawn(async move {
        match super::sync::write_file_with_str_from_path(&path, &data, &encoding, mode, flag) {
            Ok(_) => {
                callback.on_success(None);
            }
            Err(error) => {
                callback.on_error(Some(error));
            }
        }
    });
}

pub fn write_file_with_bytes_from_path(
    path: &str,
    data: ByteBuf,
    encoding: &str,
    mode: c_int,
    flag: c_int,
    callback: Arc<AsyncClosure<(), Error>>,
) {
    let path = path.to_string();
    let encoding = encoding.to_string();
    let callback = Arc::clone(&callback);
    runtime().spawn(async move {
        match super::sync::write_file_with_bytes_from_path(
            &path,
            data.as_slice(),
            &encoding,
            mode,
            flag,
        ) {
            Ok(_) => {
                callback.on_success(None);
            }
            Err(error) => {
                callback.on_error(Some(error));
            }
        }
    });
}

pub fn writev(
    fd: c_int,
    buffers: Vec<ByteBuf>,
    position: c_long,
    callback: Arc<AsyncClosure<usize, Error>>,
) {
    let callback = Arc::clone(&callback);
    runtime().spawn(async move {
        match super::sync::writev(fd, buffers, position) {
            Ok(wrote) => {
                callback.on_success(Some(wrote));
            }
            Err(error) => {
                callback.on_error(Some(error));
            }
        }
    });
}

pub fn writev_raw(
    fd: c_int,
    buffer: *const *const ByteBuf,
    buffer_len: usize,
    position: c_long,
    callback: Arc<AsyncClosure<usize, Error>>,
) {
    // transmute to send pointer
    let buffer = buffer as i64;
    let callback = Arc::clone(&callback);
    runtime().spawn(async move {
        let buffer = unsafe { buffer as *const *const ByteBuf };

        match super::sync::writev_raw(fd, buffer, buffer_len, position) {
            Ok(wrote) => {
                callback.on_success(Some(wrote));
            }
            Err(error) => {
                callback.on_error(Some(error));
            }
        }
    });
}
