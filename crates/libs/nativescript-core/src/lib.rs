use std::ffi::{CStr, CString};
use std::os::raw::c_char;

use base64::Engine;

use crate::buffers::U8Buffer;
use crate::ccow::{CCow, CCowInner};

pub mod url;
pub mod ccow;
pub mod text_decoder;
pub mod text_encoder;
pub mod buffers;


#[no_mangle]
pub extern "C" fn nativescript_core_atob(value: *const c_char) -> *mut U8Buffer {
    if value.is_null() {
        return std::ptr::null_mut();
    }
    let value = unsafe { CStr::from_ptr(value) };
    let value = value.to_string_lossy();
    match base64::engine::general_purpose::STANDARD.decode(value.as_bytes()) {
        Ok(value) => Box::into_raw(Box::new(U8Buffer::new_with_vec(value))),
        Err(_) => std::ptr::null_mut(),
    }
}

#[no_mangle]
pub extern "C" fn nativescript_core_atob_ccow(value: *const CCow) -> *mut U8Buffer {
    if value.is_null() {
        return std::ptr::null_mut();
    }
    let value = unsafe { &*value };
    let ret = match &value.0 {
        CCowInner::String(value) => {
            base64::engine::general_purpose::STANDARD.decode(value.as_bytes())
        }
        CCowInner::Bytes(value) => {
            base64::engine::general_purpose::STANDARD.decode(value)
        }
    };

    match ret {
        Ok(value) => Box::into_raw(Box::new(U8Buffer::new_with_vec(value))),
        Err(_) => std::ptr::null_mut(),
    }
}


#[no_mangle]
pub extern "C" fn nativescript_core_btoa(value: *const c_char) -> *mut CCow {
    if value.is_null() {
        return std::ptr::null_mut();
    }
    let value = unsafe { CStr::from_ptr(value) };

    let value = value.to_string_lossy();

    Box::into_raw(
        Box::new(CCow::from(base64::engine::general_purpose::STANDARD.encode(value.as_bytes())))
    )
}

#[no_mangle]
pub extern "C" fn nativescript_core_btoa_ccow(value: *const CCow) -> *mut CCow {
    if value.is_null() {
        return std::ptr::null_mut();
    }
    let value = unsafe { &*value };

    Box::into_raw(
        Box::new(CCow::from(base64::engine::general_purpose::STANDARD.encode(value)))
    )
}


#[no_mangle]
pub extern "C" fn nativescript_core_string_destroy(value: *mut c_char) {
    if value.is_null() {
        return;
    }
    let _ = unsafe { CString::from_raw(value) };
}