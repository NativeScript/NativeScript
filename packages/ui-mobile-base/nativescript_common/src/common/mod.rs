use std::ffi::CString;
use std::os::raw::c_char;

use libc::size_t;

pub use constants::*;

pub(crate) mod constants;
pub mod fs;

#[repr(transparent)]
#[derive(Copy, Clone, Default)]
pub struct ByteBufInner {
    needs_to_clean: bool,
}

#[repr(C)]
pub struct ByteBufMut {
    pub data: *mut u8,
    pub len: size_t,
    inner: ByteBufInner,
}

impl ByteBufMut {
    pub fn new(data: *mut u8, length: size_t) -> Self {
        Self {
            data,
            len: length,
            inner: ByteBufInner {
                needs_to_clean: false,
            },
        }
    }

    pub fn as_slice<'a>(&self) -> &'a [u8] {
        unsafe { std::slice::from_raw_parts(self.data, self.len) }
    }

    pub fn as_mut_slice<'a>(&self) -> &'a mut [u8] {
        unsafe { std::slice::from_raw_parts_mut(self.data, self.len) }
    }
}

impl From<Vec<u8>> for ByteBufMut {
    fn from(vec: Vec<u8>) -> Self {
        let len = vec.len();
        let mut slice = vec.into_boxed_slice();
        let data = slice.as_mut_ptr();
        let _ = Box::into_raw(slice);
        Self {
            data,
            len,
            inner: ByteBufInner {
                needs_to_clean: true,
            },
        }
    }
}

impl Drop for ByteBufMut {
    fn drop(&mut self) {
        if !self.inner.needs_to_clean {
            return;
        }
        if !self.data.is_null() && self.len != 0 {
            unsafe {
                let _ =
                    Box::from_raw(std::slice::from_raw_parts_mut(self.data, self.len)).into_vec();
            }
        }
    }
}

unsafe impl Send for ByteBufMut {}

#[repr(C)]
pub struct ByteBuf {
    pub data: *const u8,
    pub len: size_t,
    inner: ByteBufInner,
}

impl ByteBuf {
    pub fn new(data: *const u8, length: size_t) -> Self {
        Self {
            data,
            len: length,
            inner: Default::default(),
        }
    }

    pub fn as_slice<'a>(&self) -> &'a [u8] {
        unsafe { std::slice::from_raw_parts(self.data, self.len) }
    }
}

impl From<Vec<u8>> for ByteBuf {
    fn from(vec: Vec<u8>) -> Self {
        let len = vec.len();
        let mut slice = vec.into_boxed_slice();
        let data = slice.as_mut_ptr() as *const u8;
        let _ = Box::into_raw(slice);
        Self {
            data,
            len,
            inner: ByteBufInner {
                needs_to_clean: true,
            },
        }
    }
}

impl Drop for ByteBuf {
    fn drop(&mut self) {
        if !self.inner.needs_to_clean {
            return;
        }
        if !self.data.is_null() && self.len != 0 {
            unsafe {
                let _ = Box::from_raw(std::slice::from_raw_parts_mut(
                    self.data as *mut u8,
                    self.len,
                ));
            }
        }
    }
}

unsafe impl Send for ByteBuf {}

#[repr(C)]
pub struct BufOfStrings {
    pub data: *mut *mut c_char,
    pub len: size_t,
}

impl From<Vec<*mut c_char>> for BufOfStrings {
    fn from(vec: Vec<*mut c_char>) -> Self {
        let len = vec.len();
        let mut slice = vec.into_boxed_slice();
        let data = slice.as_mut_ptr();
        let _ = Box::into_raw(slice);
        Self { data, len }
    }
}

impl Drop for BufOfStrings {
    fn drop(&mut self) {
        if !self.data.is_null() && self.len != 0 {
            unsafe {
                let vec = Vec::from_raw_parts(self.data, self.len, self.len);
                for ptr in vec {
                    let _ = CString::from_raw(ptr);
                }
            }
        }
    }
}
