use std::collections::HashMap;
use std::ffi::{c_void, CString};
use std::ptr::NonNull;
use std::sync::Arc;

use libc::{c_char, c_ulong};
use once_cell::sync::OnceCell;
use parking_lot::Mutex;

use crate::common::fs;
use crate::common::fs::a_sync::{AsyncClosure, FileWatchEvent};
use crate::ios::fs::a_sync::AsyncCallback;
use crate::ios::prelude::*;

type FileWatcherCallbackMap = Arc<Mutex<HashMap<Arc<AsyncCallback>, FileWatcherCallback>>>;

pub struct FileWatcherCallback {
    callback: Arc<AsyncCallback>,
    inner: Arc<AsyncClosure<FileWatchEvent, std::io::Error>>,
}

fn file_watcher_callback_map() -> &'static FileWatcherCallbackMap {
    static INSTANCE: OnceCell<FileWatcherCallbackMap> = OnceCell::new();
    INSTANCE.get_or_init(|| Arc::new(Mutex::new(HashMap::new())))
}

#[no_mangle]
pub extern "C" fn native_fs_watch_file(
    path: *const c_char,
    bigint: bool,
    persistent: bool,
    interval: c_ulong,
    callback: *const AsyncCallback,
) {
    let callback = AsyncCallback::clone_from_ptr(callback);
    let cb = Arc::clone(&callback);
    let item = FileWatcherCallback {
        callback: Arc::clone(&callback),
        inner: Arc::new(AsyncClosure {
            callback: Box::new(move |event, error| {
                if error.is_some() {
                    (cb.on_error)(NonNull::new(
                        CString::new(error.unwrap().to_string()).unwrap().into_raw() as *mut c_void,
                    ))
                } else {
                    (cb.on_success)(NonNull::new(
                        Box::into_raw(Box::new(event.unwrap())) as *mut c_void
                    ))
                }
            }),
        }),
    };
    // call on another thread ?

    let inner = Arc::clone(&item.inner);
    let mut map = file_watcher_callback_map().lock();
    let _ = map.insert(callback, item);

    fs::a_sync::watch_file(
        get_str(path, "").as_ref(),
        bigint,
        persistent,
        interval,
        inner,
    )
}

#[no_mangle]
pub extern "C" fn native_fs_unwatch_file(path: *const c_char, callback: *const AsyncCallback) {
    let callback = if callback.is_null() {
        None
    } else {
        let callback = AsyncCallback::clone_from_ptr(callback);
        file_watcher_callback_map()
            .lock()
            .get(&callback)
            .map(|c| Arc::clone(&c.inner))
    };

    fs::a_sync::unwatch_file(get_str(path, "").as_ref(), callback)
}

#[no_mangle]
pub extern "C" fn native_fs_file_watcher_ref(
    filename: *const c_char,
    callback: *const AsyncCallback,
) {
    let callback = AsyncCallback::clone_from_ptr(callback);
    let mut map = file_watcher_callback_map().lock();
    match map.get(&callback) {
        Some(item) => {
            let callback = Arc::clone(&item.inner);
            fs::a_sync::file_watcher_ref(get_str(filename, "").as_ref(), callback);
        }
        None => {
            let cb = Arc::clone(&callback);
            let item = FileWatcherCallback {
                callback: Arc::clone(&callback),
                inner: Arc::new(AsyncClosure {
                    callback: Box::new(move |event, error| {
                        if error.is_some() {
                            (cb.on_error)(NonNull::new(
                                CString::new(error.unwrap().to_string()).unwrap().into_raw()
                                    as *mut c_void,
                            ))
                        } else {
                            (cb.on_success)(NonNull::new(
                                Box::into_raw(Box::new(error.unwrap())) as *mut c_void
                            ))
                        }
                    }),
                }),
            };
            let ref_callback = Arc::clone(&item.inner);
            // call on another thread ?
            let _ = map.insert(callback, item);

            fs::a_sync::file_watcher_ref(get_str(filename, "").as_ref(), ref_callback);
        }
    }
}

#[no_mangle]
pub extern "C" fn native_fs_file_watcher_unref(
    filename: *const c_char,
    callback: *const AsyncCallback,
) {
    let callback = AsyncCallback::clone_from_ptr(callback);
    let mut map = file_watcher_callback_map().lock();
    if let Some(item) = map
        .get(&callback)
        .map(|item| (Arc::clone(&item.callback), Arc::clone(&item.inner)))
    {
        map.remove(&item.0);
        fs::a_sync::file_watcher_unref(get_str(filename, "").as_ref(), item.1);
    }
}

#[no_mangle]
pub extern "C" fn native_fs_dispose_file_watch_event(event: *mut FileWatchEvent) {
    if !event.is_null() {
        let _ = unsafe { Box::from_raw(event) };
    }
}
