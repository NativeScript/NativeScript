use std::borrow::Cow;
use std::ffi::{c_char, CStr, CString};

use encoding_rs::UTF_8;

use crate::buffers::U8Buffer;
use crate::ccow::CCow;

#[derive(Clone)]
pub struct TextDecoder {
    inner: &'static encoding_rs::Encoding,
}

impl TextDecoder {
    pub fn new(decoding: Option<&str>) -> Self {
        let decoding = decoding.unwrap_or("utf-8");
        let decoder = encoding_rs::Encoding::for_label(decoding.as_bytes())
            .unwrap_or(UTF_8.output_encoding());
        Self { inner: decoder }
    }

    pub fn decode_to_string(&self, data: &[u8]) -> String {
        let (res, _) = self.inner.decode_with_bom_removal(data);

        match CStr::from_bytes_with_nul(res.as_bytes()) {
            Ok(res) => res.to_string_lossy().to_string(),
            Err(_) => res.chars().filter(|&c| c != '\0').collect(),
        }
    }

    pub fn decode(&self, data: *const u8, len: usize) -> CString {
        let txt = unsafe { std::slice::from_raw_parts(data, len) };
        let (res, _) = self.inner.decode_with_bom_removal(txt);

        match CStr::from_bytes_with_nul(res.as_bytes()) {
            Ok(res) => CString::from(res),
            Err(_) => {
                //  let value: String =  res.chars().filter(|&c| c != '\0').collect();

                let utf8_src = res.as_bytes();
                let nul_range_end = utf8_src
                    .iter()
                    .position(|&c| c == b'\0')
                    .unwrap_or(utf8_src.len()); // default to length if no `\0` present*/
                let data = &utf8_src[..nul_range_end];

                unsafe { CString::from_vec_unchecked(data.to_vec()) }
            }
        }
    }

    pub fn decode_as_cow(&self, data: *const u8, len: usize) -> Cow<'static, str> {
        let txt = unsafe { std::slice::from_raw_parts(data, len) };
        let (res, _) = self.inner.decode_with_bom_removal(txt);
        res
    }

    pub fn decode_c_string(&self, data: *const c_char) -> CString {
        let txt = unsafe { CStr::from_ptr(data) };
        let txt = txt.to_bytes();
        let (res, _) = self.inner.decode_with_bom_removal(txt);

        match CStr::from_bytes_with_nul(res.as_bytes()) {
            Ok(res) => CString::from(res),
            Err(_) => {
                let value: String = res.chars().filter(|&c| c != '\0').collect();
                CString::new(value).unwrap()
            }
        }
    }

    pub fn decode_as_bytes(&self, data: *const u8, len: usize) -> Vec<u8> {
        let txt = unsafe { std::slice::from_raw_parts(data, len) };

        let (res, _) = self.inner.decode_with_bom_removal(txt);

        res.as_bytes().to_vec()
    }

    pub(crate) fn decode_to_bytes(&self, txt: &str) -> Vec<u8> {
        let (res, _) = self.inner.decode_with_bom_removal(txt.as_bytes());

        res.as_bytes().to_vec()
    }

    pub fn encoding(&self) -> &str {
        self.inner.name()
    }
}


#[no_mangle]
pub extern "C" fn nativescript_core_text_decoder_create(decoding: *const c_char) -> *mut TextDecoder {
    if decoding.is_null() {
        return std::ptr::null_mut();
    }
    let decoding = unsafe { CStr::from_ptr(decoding) };
    let decoding = decoding.to_string_lossy();
    Box::into_raw(Box::new(
        TextDecoder::new(Some(decoding.as_ref()))
    ))
}

#[no_mangle]
pub extern "C" fn nativescript_core_text_decoder_decode(
    decoder: *const TextDecoder,
    data: *const u8,
    size: usize,
) -> *const c_char {
    if decoder.is_null() || data.is_null() {
        return std::ptr::null();
    }

    let decoder = unsafe { &*decoder };


    decoder.decode(data, size).into_raw()
}


#[no_mangle]
pub extern "C" fn nativescript_core_text_decoder_decode_as_cow(
    decoder: *const TextDecoder,
    data: *const u8,
    size: usize,
) -> *mut CCow {
    if decoder.is_null() || data.is_null() {
        return std::ptr::null_mut();
    }
    let decoder = unsafe { &*decoder };

    let bytes = decoder.decode_as_cow(data, size);

    Box::into_raw(Box::new(CCow::from(bytes)))
}

#[no_mangle]
pub extern "C" fn nativescript_core_text_decoder_decode_as_bytes(
    decoder: *const TextDecoder,
    data: *const u8,
    size: usize,
) -> *mut U8Buffer {
    if decoder.is_null() || data.is_null() {
        return std::ptr::null_mut();
    }
    let decoder = unsafe { &*decoder };

    let bytes = decoder.decode_as_bytes(data, size);

    Box::into_raw(Box::new(U8Buffer::new_with_vec(bytes)))
}

#[no_mangle]
pub extern "C" fn nativescript_core_text_decoder_destroy(value: *mut TextDecoder) {
    if value.is_null() {
        return;
    }
    let _ = unsafe { Box::from_raw(value) };
}


#[no_mangle]
pub extern "C" fn nativescript_core_text_decoder_get_encoding(
    decoder: *const TextDecoder,
) -> *const c_char {
    if decoder.is_null() { return std::ptr::null(); }
    let decoder = unsafe { &*decoder };
    CString::new(decoder.encoding().to_string().to_lowercase())
        .unwrap()
        .into_raw()
}