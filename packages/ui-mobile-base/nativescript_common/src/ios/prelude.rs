use std::ffi::{c_void, CStr, CString};
use std::ptr::NonNull;

use crate::common::fs::file_stat::FileStat;
use crate::common::fs::prelude::*;
use crate::ios::throw_error;

pub fn to_error(string: String) -> Option<NonNull<c_void>> {
    NonNull::new(CString::new(string).unwrap().into_raw() as *mut c_void)
}

pub fn get_str(string: *const libc::c_char, default: &str) -> std::borrow::Cow<'_, str> {
    if !string.is_null() {
        return unsafe { CStr::from_ptr(string).to_string_lossy() };
    }
    default.into()
}

pub fn handle_meta_into_box(metadata: &std::fs::Metadata) -> *mut FileStat {
    Box::into_raw(Box::new(handle_meta(metadata)))
}

pub fn handle_stat_into_box(stat: std::io::Result<std::fs::Metadata>) -> *mut FileStat {
    match stat {
        Ok(metadata) => handle_meta_into_box(&metadata),
        Err(error) => {
            throw_error(&error.to_string());
            std::ptr::null_mut()
        }
    }
}
