use std::borrow::Cow;
use std::ffi::{CStr, CString};
use std::os::raw::c_char;

use encoding_rs::UTF_8;

use crate::buffers::U8Buffer;

#[derive(Clone)]
pub struct TextEncoder {
    inner: &'static encoding_rs::Encoding,
}

impl TextEncoder {
    pub fn new(encoding: Option<&str>) -> Self {
        let encoding = encoding.unwrap_or("utf-8");
        let encoder = encoding_rs::Encoding::for_label(encoding.as_bytes())
            .unwrap_or(UTF_8.output_encoding());
        Self { inner: encoder }
    }

    pub fn encode(&self, text: &str) -> Vec<u8> {
        let result = self.inner.encode(text);
        Vec::from(result.0)
    }

    pub fn encode_to_cow<'a>(&mut self, text: &'a str) -> Cow<'a, [u8]> {
        let result = self.inner.encode(text);
        result.0
    }

    pub fn encoding(&self) -> &str {
        self.inner.name()
    }
}

#[no_mangle]
pub extern "C" fn nativescript_core_text_encoder_create(encoding: *const c_char) -> *mut TextEncoder {
    if encoding.is_null() {
        return std::ptr::null_mut();
    }
    let encoding = unsafe { CStr::from_ptr(encoding) };
    let encoding = encoding.to_string_lossy();

    Box::into_raw(Box::new(TextEncoder::new(Some(encoding.as_ref()))))
}

#[no_mangle]
pub extern "C" fn nativescript_core_text_encoder_encode(
    encoder: *const TextEncoder,
    text: *const c_char,
) -> *mut U8Buffer {
    if encoder.is_null() || text.is_null() {
        return std::ptr::null_mut();
    }
    let encoder = unsafe { &*encoder };
    let text = unsafe { CStr::from_ptr(text) };
    let text = text.to_string_lossy();
    let encoded = encoder.encode(text.as_ref());
    Box::into_raw(Box::new(U8Buffer::from(encoded)))
}

#[no_mangle]
pub extern "C" fn nativescript_core_text_encoder_get_encoding(
    encoder: *const TextEncoder,
) -> *const c_char {
    if encoder.is_null() {
        return std::ptr::null();
    }
    let encoder = unsafe { &*encoder };
    CString::new(encoder.encoding().to_string().to_lowercase())
        .unwrap()
        .into_raw()
}

#[no_mangle]
pub extern "C" fn nativescript_core_text_encoder_destroy(value: *mut TextEncoder) {
    if value.is_null() {
        return;
    }
    let _ = unsafe { Box::from_raw(value) };
}
