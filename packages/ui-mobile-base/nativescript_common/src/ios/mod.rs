use std::ffi::CString;

use libc::c_char;
use objc::{class, msg_send, sel};
use objc::runtime::Object;

use crate::common::{ByteBuf, ByteBufMut};
use crate::common::fs::file_dir::FileDir;
use crate::common::fs::file_dirent::FileDirent;

pub mod fs;
mod prelude;

const UTF8_ENCODING: usize = 4;

pub(crate) fn throw_error(error: &str) {
    unsafe {
        let nil: *mut Object = ::std::ptr::null_mut();
        let exec_cls = class!(NSException);
        let alloc_sel = sel!(alloc);
        let string: *mut Object = msg_send![class!(NSString), alloc_sel];
        let bytes = error.as_ptr() as *const libc::c_void;
        let reason: *mut Object = msg_send![string,
            initWithBytes: bytes
            length: error.len()
            encoding: UTF8_ENCODING
        ];

        let exception: *mut Object = msg_send![exec_cls,exceptionWithName:class!(NSGenericException) reason:reason userInfo:nil];

        let _: *mut Object = msg_send![exception, raise];
    }
}

#[no_mangle]
pub extern "C" fn native_dispose_string(path: *mut c_char) {
    if !path.is_null() {
        unsafe {
            let _ = CString::from_raw(path);
        }
    }
}

#[no_mangle]
pub extern "C" fn native_dispose_file_dir(dir: *mut FileDir) {
    if !dir.is_null() {
        unsafe {
            let _ = Box::from_raw(dir);
        }
    }
}

#[no_mangle]
pub extern "C" fn native_dispose_file_dirent(dirent: *mut FileDirent) {
    if !dirent.is_null() {
        unsafe {
            let _ = Box::from_raw(dirent);
        }
    }
}

#[no_mangle]
pub extern "C" fn native_dispose_byte_buf(buf: *mut ByteBuf) {
    if !buf.is_null() {
        unsafe {
            let _ = Box::from_raw(buf);
        }
    }
}

#[no_mangle]
pub extern "C" fn native_dispose_byte_buf_mut(buf: *mut ByteBufMut) {
    if !buf.is_null() {
        unsafe {
            let _ = Box::from_raw(buf);
        }
    }
}
