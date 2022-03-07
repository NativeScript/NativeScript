use std::ffi::c_void;
use std::os::raw::c_long;
use std::ptr::NonNull;

use libc::{c_char, c_int, c_longlong, c_uchar, c_uint, c_ushort, size_t, ssize_t};

use crate::common::fs::a_sync::AsyncClosure;
use crate::common::fs::file_handle::FileHandle;
use crate::common::fs::file_stat::FileStat;
use crate::common::fs::sync::open_handle_with_path;
use crate::common::{ByteBuf, ByteBufMut};
use crate::ios::fs::a_sync::AsyncCallback;
use crate::ios::prelude::*;
use crate::ios::throw_error;

#[no_mangle]
pub extern "C" fn native_file_handle_open_sync(
    path: *const c_char,
    flags: c_int,
    mode: c_int,
) -> *mut FileHandle {
    match open_handle_with_path(path, flags, mode) {
        Ok(handle) => Box::into_raw(Box::new(handle)),
        Err(error) => {
            throw_error(&error.to_string());
            std::ptr::null_mut()
        }
    }
}

#[no_mangle]
pub extern "C" fn native_file_handle_open(
    path: *const c_char,
    flags: c_int,
    mode: c_int,
    callback: *const AsyncCallback,
) {
    let on_success = AsyncCallback::clone_from_ptr(callback);
    let callback =
        AsyncClosure::<FileHandle, std::io::Error>::new(Box::new(move |success, error| {
            if error.is_some() {
                on_success.on_error(to_error(error.unwrap().to_string()))
            } else {
                on_success.on_success(NonNull::new(
                    Box::into_raw(Box::new(success.unwrap())) as *mut c_void
                ))
            }
        }))
        .into_arc();

    crate::common::fs::file_handle::FileHandle::new_async(
        get_str(path, "").as_ref(),
        flags,
        mode,
        callback,
    )
}

#[no_mangle]
pub extern "C" fn native_file_handle_append_file_with_bytes(
    handle: *mut FileHandle,
    data: *const c_uchar,
    len: size_t,
    callback: *const AsyncCallback,
) {
    if !handle.is_null() {
        let handle = unsafe { &mut *handle };
        let buf = ByteBuf::new(data, len);

        let on_success = AsyncCallback::clone_from_ptr(callback);
        let callback = AsyncClosure::<(), std::io::Error>::new(Box::new(move |_, error| {
            if let Some(error) = error {
                on_success.on_error(to_error(error.to_string()))
            } else {
                on_success.on_success(None)
            }
        }))
        .into_arc();

        handle.append_file_with_bytes(buf, callback)
    }
}

#[no_mangle]
pub extern "C" fn native_file_handle_append_file_with_string(
    handle: *mut FileHandle,
    data: *const c_char,
    callback: *const AsyncCallback,
) {
    if !handle.is_null() && !data.is_null() {
        let handle = unsafe { &mut *handle };
        let on_success = AsyncCallback::clone_from_ptr(callback);
        let callback = AsyncClosure::<(), std::io::Error>::new(Box::new(move |_, error| {
            if let Some(error) = error {
                on_success.on_error(to_error(error.to_string()))
            } else {
                on_success.on_success(None)
            }
        }))
        .into_arc();
        handle.append_file_with_str(get_str(data, "").as_ref(), callback)
    }
}

#[no_mangle]
pub extern "C" fn native_file_handle_chmod(
    handle: *mut FileHandle,
    mode: c_ushort,
    callback: *const AsyncCallback,
) {
    if !handle.is_null() {
        let handle = unsafe { &mut *handle };
        let on_success = AsyncCallback::clone_from_ptr(callback);
        let callback = AsyncClosure::<(), std::io::Error>::new(Box::new(move |_, error| {
            if let Some(error) = error {
                on_success.on_error(to_error(error.to_string()))
            } else {
                on_success.on_success(None)
            }
        }))
        .into_arc();

        handle.chmod(mode, callback);
    }
}

#[no_mangle]
pub extern "C" fn native_file_handle_chown(
    handle: *mut FileHandle,
    uid: c_uint,
    gid: c_uint,
    callback: *const AsyncCallback,
) {
    if !handle.is_null() {
        let handle = unsafe { &mut *handle };
        let on_success = AsyncCallback::clone_from_ptr(callback);
        let callback = AsyncClosure::<(), std::io::Error>::new(Box::new(move |_, error| {
            if let Some(error) = error {
                on_success.on_error(to_error(error.to_string()))
            } else {
                on_success.on_success(None)
            }
        }))
        .into_arc();
        handle.chown(uid, gid, callback);
    }
}

#[no_mangle]
pub extern "C" fn native_file_handle_close(
    handle: *mut FileHandle,
    callback: *const AsyncCallback,
) {
    if !handle.is_null() {
        let handle = unsafe { Box::from_raw(handle) };
        let on_success = AsyncCallback::clone_from_ptr(callback);
        let callback = AsyncClosure::<(), std::io::Error>::new(Box::new(move |_, error| {
            if let Some(error) = error {
                on_success.on_error(to_error(error.to_string()))
            } else {
                on_success.on_success(None)
            }
        }))
        .into_arc();
        handle.close(callback);
    }
}

#[no_mangle]
pub extern "C" fn native_file_handle_data_sync(
    handle: *mut FileHandle,
    callback: *const AsyncCallback,
) {
    if !handle.is_null() {
        let handle = unsafe { &mut *handle };
        let on_success = AsyncCallback::clone_from_ptr(callback);
        let callback = AsyncClosure::<(), std::io::Error>::new(Box::new(move |_, error| {
            if let Some(error) = error {
                on_success.on_error(to_error(error.to_string()))
            } else {
                on_success.on_success(None)
            }
        }))
        .into_arc();
        handle.datasync(callback);
    }
}

#[no_mangle]
pub extern "C" fn native_file_handle_get_fd(handle: *mut FileHandle) -> c_int {
    unsafe {
        if !handle.is_null() {
            let handle = &*handle;
            return handle.fd();
        }
    }
    -1
}

#[no_mangle]
pub extern "C" fn native_file_handle_read(
    handle: *mut FileHandle,
    buffer: *mut c_uchar,
    buffer_len: size_t,
    offset: c_long,
    length: c_long,
    position: c_long,
    callback: *const AsyncCallback,
) {
    if !handle.is_null() {
        let handle = unsafe { &mut *handle };

        let on_success = AsyncCallback::clone_from_ptr(callback);
        let callback =
            AsyncClosure::<usize, std::io::Error>::new(Box::new(move |success, error| {
                if error.is_some() {
                    on_success.on_error(to_error(error.unwrap().to_string()))
                } else {
                    on_success.on_success(NonNull::new(success.unwrap() as *mut c_void))
                }
            }))
            .into_arc();

        let buf = ByteBufMut::new(buffer, buffer_len);
        handle.read(
            buf,
            offset as usize,
            length as usize,
            position as isize,
            callback,
        );
    }
}

#[no_mangle]
pub extern "C" fn native_file_handle_read_file(
    handle: *mut FileHandle,
    encoding: *const c_char,
    callback: *const AsyncCallback,
) {
    if !handle.is_null() {
        let on_success = AsyncCallback::clone_from_ptr(callback);
        let callback =
            AsyncClosure::<ByteBufMut, std::io::Error>::new(Box::new(move |success, error| {
                if error.is_some() {
                    on_success.on_error(to_error(error.unwrap().to_string()))
                } else {
                    on_success.on_success(NonNull::new(
                        Box::into_raw(Box::new(success.unwrap())) as *mut c_void
                    ))
                }
            }))
            .into_arc();

        let handle = unsafe { &mut *handle };
        handle.readFile(get_str(encoding, "").as_ref(), callback);
    }
}

#[no_mangle]
pub extern "C" fn native_file_handle_readv(
    handle: *mut FileHandle,
    buffer: *const *mut ByteBufMut,
    buffer_len: size_t,
    position: c_long,
    callback: *const AsyncCallback,
) {
    if !handle.is_null() {
        let on_success = AsyncCallback::clone_from_ptr(callback);
        let callback =
            AsyncClosure::<usize, std::io::Error>::new(Box::new(move |success, error| {
                if error.is_some() {
                    on_success.on_error(to_error(error.unwrap().to_string()))
                } else {
                    on_success.on_success(NonNull::new(success.unwrap() as *mut c_void))
                }
            }))
            .into_arc();

        let handle = unsafe { &*handle };
        crate::common::fs::a_sync::readv_raw(handle.fd(), buffer, buffer_len, position, callback);
    }
}

#[no_mangle]
pub extern "C" fn native_file_handle_stat(handle: *mut FileHandle, callback: *const AsyncCallback) {
    if !handle.is_null() {
        let on_success = AsyncCallback::clone_from_ptr(callback);
        let callback =
            AsyncClosure::<FileStat, std::io::Error>::new(Box::new(move |success, error| {
                if error.is_some() {
                    on_success.on_error(to_error(error.unwrap().to_string()))
                } else {
                    on_success.on_success(NonNull::new(
                        Box::into_raw(Box::new(success.unwrap())) as *mut c_void
                    ))
                }
            }))
            .into_arc();
        let handle = unsafe { &mut *handle };
        handle.stat(callback)
    }
}

#[no_mangle]
pub extern "C" fn native_file_handle_sync(handle: *mut FileHandle, callback: *const AsyncCallback) {
    if !handle.is_null() {
        let handle = unsafe { &mut *handle };
        let on_success = AsyncCallback::clone_from_ptr(callback);
        let callback = AsyncClosure::<(), std::io::Error>::new(Box::new(move |_, error| {
            if let Some(error) = error {
                on_success.on_error(to_error(error.to_string()))
            } else {
                on_success.on_success(None)
            }
        }))
        .into_arc();

        handle.sync(callback);
    }
}

#[no_mangle]
pub extern "C" fn native_file_handle_truncate(
    handle: *mut FileHandle,
    len: c_long,
    callback: *const AsyncCallback,
) {
    if !handle.is_null() {
        let handle = unsafe { &mut *handle };
        let on_success = AsyncCallback::clone_from_ptr(callback);
        let callback = AsyncClosure::<(), std::io::Error>::new(Box::new(move |_, error| {
            if let Some(error) = error {
                on_success.on_error(to_error(error.to_string()))
            } else {
                on_success.on_success(None)
            }
        }))
        .into_arc();
        handle.truncate(len, callback);
    }
}

#[no_mangle]
pub extern "C" fn native_file_handle_utimes(
    handle: *mut FileHandle,
    atime: c_longlong,
    mtime: c_longlong,
    callback: *const AsyncCallback,
) {
    if !handle.is_null() {
        let handle = unsafe { &mut *handle };

        let on_success = AsyncCallback::clone_from_ptr(callback);
        let callback = AsyncClosure::<(), std::io::Error>::new(Box::new(move |_, error| {
            if let Some(error) = error {
                on_success.on_error(to_error(error.to_string()))
            } else {
                on_success.on_success(None)
            }
        }))
        .into_arc();

        handle.utimes(atime, mtime, callback);
    }
}

#[no_mangle]
pub extern "C" fn native_file_handle_write(
    handle: *mut FileHandle,
    data: *const u8,
    data_len: size_t,
    offset: size_t,
    length: size_t,
    position: ssize_t,
    callback: *const AsyncCallback,
) {
    if !handle.is_null() && !data.is_null() {
        let handle = unsafe { &mut *handle };
        let buf = ByteBuf::new(data, data_len);

        let on_success = AsyncCallback::clone_from_ptr(callback);
        let callback =
            AsyncClosure::<usize, std::io::Error>::new(Box::new(move |success, error| {
                if error.is_some() {
                    on_success.on_error(to_error(error.unwrap().to_string()))
                } else {
                    on_success.on_success(NonNull::new(success.unwrap() as *mut c_void))
                }
            }))
            .into_arc();

        handle.write(buf, offset, length, position, callback);
    }
}

#[no_mangle]
pub extern "C" fn native_file_handle_write_string(
    handle: *mut FileHandle,
    data: *const c_char,
    encoding: *const c_char,
    position: ssize_t,
    callback: *const AsyncCallback,
) {
    if !handle.is_null() && !data.is_null() {
        let handle = unsafe { &mut *handle };

        let on_success = AsyncCallback::clone_from_ptr(callback);
        let callback =
            AsyncClosure::<usize, std::io::Error>::new(Box::new(move |success, error| {
                if let Some(error) = error {
                    on_success.on_error(to_error(error.to_string()))
                } else {
                    on_success.on_success(NonNull::new(success.unwrap() as *mut c_void))
                }
            }))
            .into_arc();

        handle.write_string(
            get_str(data, "").as_ref(),
            get_str(encoding, "").as_ref(),
            position,
            callback,
        );
    }
}

#[no_mangle]
pub extern "C" fn native_file_handle_write_file_with_string(
    handle: *mut FileHandle,
    data: *const c_char,
    encoding: *const c_char,
    callback: *const AsyncCallback,
) {
    if !handle.is_null() && !data.is_null() {
        let handle = unsafe { &mut *handle };
        let data = get_str(data, "");
        let encoding = get_str(encoding, "");

        let on_success = AsyncCallback::clone_from_ptr(callback);
        let callback = AsyncClosure::<(), std::io::Error>::new(Box::new(move |_, error| {
            if let Some(error) = error {
                on_success.on_error(to_error(error.to_string()))
            } else {
                on_success.on_success(None)
            }
        }))
        .into_arc();

        handle.write_file_with_str(data.as_ref(), encoding.as_ref(), callback);
    }
}

#[no_mangle]
pub extern "C" fn native_file_handle_write_file_with_bytes(
    handle: *mut FileHandle,
    data: *const u8,
    data_len: size_t,
    callback: *const AsyncCallback,
) {
    if !handle.is_null() && !data.is_null() {
        let handle = unsafe { &mut *handle };
        let buf = ByteBuf::new(data, data_len);

        let on_success = AsyncCallback::clone_from_ptr(callback);
        let callback = AsyncClosure::<(), std::io::Error>::new(Box::new(move |_, error| {
            if let Some(error) = error {
                on_success.on_error(to_error(error.to_string()))
            } else {
                on_success.on_success(None)
            }
        }))
        .into_arc();

        handle.write_file_with_bytes(buf, callback)
    }
}

#[no_mangle]
pub extern "C" fn native_file_handle_writev(
    handle: *mut FileHandle,
    buffer: *const *const ByteBuf,
    buffer_len: size_t,
    position: c_long,
    callback: *const AsyncCallback,
) {
    let handle = unsafe { &mut *handle };
    super::a_sync::writev(handle.fd(), buffer, buffer_len, position, callback);
}

#[no_mangle]
pub extern "C" fn native_file_handle_dispose(handle: *mut FileHandle) {
    if !handle.is_null() {
        unsafe {
            Box::from_raw(handle);
        }
    }
}
