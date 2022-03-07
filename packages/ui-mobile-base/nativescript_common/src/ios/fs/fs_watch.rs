use std::collections::HashMap;
use std::ffi::{c_void, CString};
use std::ptr::NonNull;
use std::sync::Arc;

use libc::c_char;
use once_cell::sync::OnceCell;
use parking_lot::Mutex;

use crate::common::fs;
use crate::common::fs::a_sync::{AsyncClosure, WatchEvent};
use crate::ios::fs::a_sync::AsyncCallback;
use crate::ios::prelude::*;

type WatcherCallbackMap = Arc<Mutex<HashMap<Arc<AsyncCallback>, FsWatchCallback>>>;

pub struct FsWatchCallback {
    callback: Arc<AsyncCallback>,
    inner: Arc<AsyncClosure<WatchEvent, std::io::Error>>,
}

fn watcher_callback_map() -> &'static WatcherCallbackMap {
    static INSTANCE: OnceCell<WatcherCallbackMap> = OnceCell::new();
    INSTANCE.get_or_init(|| Arc::new(Mutex::new(HashMap::new())))
}

#[no_mangle]
pub extern "C" fn native_fs_watch(
    path: *const c_char,
    persistent: bool,
    recursive: bool,
    encoding: *const c_char,
    callback: *const AsyncCallback,
) {
    let on_success = AsyncCallback::clone_from_ptr(callback);
    let cb = Arc::clone(&on_success);
    let callback =
        AsyncClosure::<WatchEvent, std::io::Error>::new(Box::new(move |success, error| {
            if error.is_some() {
                on_success.on_error(to_error(error.unwrap().to_string()))
            } else {
                on_success.on_success(NonNull::new(
                    Box::into_raw(Box::new(success.unwrap())) as *mut c_void
                ))
            }
        }))
        .into_arc();

    let item = FsWatchCallback {
        callback: Arc::clone(&cb),
        inner: Arc::clone(&callback),
    };

    let mut map = watcher_callback_map().lock();
    let _ = map.insert(cb, item);

    fs::a_sync::watch(
        get_str(path, "").as_ref(),
        persistent,
        recursive,
        get_str(encoding, "").as_ref(),
        callback,
    )
}

#[no_mangle]
pub extern "C" fn native_fs_watcher_unref(filename: *const c_char, callback: *const AsyncCallback) {
    let on_success = AsyncCallback::clone_from_ptr(callback);
    let mut map = watcher_callback_map().lock();
    if let Some(item) = map
        .get(&on_success)
        .map(|item| (Arc::clone(&item.callback), Arc::clone(&item.inner)))
    {
        map.remove(&item.0);
        fs::a_sync::watcher_unref(get_str(filename, "").as_ref(), item.1);
    }
}

#[no_mangle]
pub extern "C" fn native_fs_watcher_ref(filename: *const c_char, callback: *const AsyncCallback) {
    let callback = AsyncCallback::clone_from_ptr(callback);
    let mut map = watcher_callback_map().lock();
    match map.get(&callback) {
        Some(item) => {
            let callback = Arc::clone(&item.inner);
            fs::a_sync::watcher_ref(get_str(filename, "").as_ref(), callback);
        }
        None => {
            let cb = Arc::clone(&callback);
            let item = FsWatchCallback {
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
                                Box::into_raw(Box::new(event.unwrap())) as *mut c_void
                            ))
                        }
                    }),
                }),
            };
            let ref_callback = Arc::clone(&item.inner);
            // call on another thread ?
            let _ = map.insert(callback, item);

            fs::a_sync::watcher_ref(get_str(filename, "").as_ref(), ref_callback);
        }
    }
}

#[no_mangle]
pub extern "C" fn native_fs_watcher_close(
    filename: *const c_char,
    callback: *const AsyncCallback,
    on_close: *const AsyncCallback,
) {
    let callback = AsyncCallback::clone_from_ptr(callback);
    let on_close = AsyncCallback::clone_from_ptr(on_close);
    let map = watcher_callback_map().lock();
    let cb = map
        .get(&callback)
        .map(|c| (Arc::clone(&c.callback), Arc::clone(&c.inner)));
    {
        // drop lock
        drop(map);
    }
    if let Some(callback) = cb {
        fs::a_sync::watcher_close(
            get_str(filename, "").as_ref(),
            callback.1,
            AsyncClosure::new(Box::new(move |_, error: Option<std::io::Error>| {
                if let Some(error) = error {
                    (on_close.on_error)(to_error(error.to_string()));
                }
                let mut map = watcher_callback_map().lock();
                let _ = map.remove(&callback.0);
            }))
            .into_arc(),
        );
    }
}

#[no_mangle]
pub extern "C" fn native_fs_dispose_watch_event(event: *mut WatchEvent) {
    if !event.is_null() {
        let _ = unsafe { Box::from_raw(event) };
    }
}
