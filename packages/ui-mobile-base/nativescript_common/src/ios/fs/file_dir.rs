use std::ptr::NonNull;

use libc::c_void;

use crate::common::fs::file_dir::FileDir;
use crate::common::fs::file_dirent::FileDirent;
use crate::ios::fs::a_sync::AsyncCallback;
use crate::ios::prelude::to_error;
use crate::ios::throw_error;

#[no_mangle]
pub extern "C" fn native_fs_file_dir_readdir_sync(dir: *mut FileDir) -> *mut FileDirent {
    let dir = unsafe { &mut *dir };
    match dir.read() {
        Ok(dir) => Box::into_raw(Box::new(dir)),
        Err(error) => {
            throw_error(&error.to_string());
            std::ptr::null_mut()
        }
    }
}

#[no_mangle]
pub extern "C" fn native_fs_file_dir_readdir(dir: *mut FileDir, callback: *const AsyncCallback) {
    let dir = unsafe { &mut *dir };
    let callback = AsyncCallback::clone_from_ptr(callback);
    dir.read_async(Box::new(move |dir, error| {
        if let Some(dir) = dir {
            callback.on_success(NonNull::new(Box::into_raw(Box::new(dir)) as *mut c_void));
        }
        if let Some(error) = error {
            callback.on_error(to_error(error.to_string()))
        }
    }));
}

#[no_mangle]
pub extern "C" fn native_fs_file_dir_close_sync(dir: *mut FileDir) {
    let dir = unsafe { &mut *dir };

    let result = dir.close();

    if let Err(error) = result {
        throw_error(&error.to_string());
    }
}

#[no_mangle]
pub extern "C" fn native_fs_file_dir_close(dir: *mut FileDir, callback: *const AsyncCallback) {
    let dir = unsafe { &mut *dir };
    let callback = AsyncCallback::clone_from_ptr(callback);
    dir.close_async(Box::new(move |error| match error {
        None => {
            callback.on_success(None);
        }
        Some(error) => callback.on_error(to_error(error.to_string())),
    }));
}
