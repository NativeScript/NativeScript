use std::ffi::{c_char, CString};

use bytes::BytesMut;

#[derive(Clone)]
enum U8BufferInner {
    BytesMut(BytesMut),
    Vec(Vec<u8>),
}

#[derive(Clone)]
pub struct U8Buffer(U8BufferInner);

impl U8Buffer {
    pub fn new_with_vec(value: Vec<u8>) -> Self {
        Self(U8BufferInner::Vec(value))
    }

    pub fn get_buffer(&self) -> &[u8] {
        match &self.0 {
            U8BufferInner::BytesMut(value) => value,
            U8BufferInner::Vec(value) => value.as_slice(),
        }
    }

    pub fn get_buffer_mut(&mut self) -> &mut [u8] {
        match &mut self.0 {
            U8BufferInner::BytesMut(value) => value,
            U8BufferInner::Vec(value) => value.as_mut_slice(),
        }
    }

    pub fn length(&self) -> usize {
        match &self.0 {
            U8BufferInner::BytesMut(value) => value.len(),
            U8BufferInner::Vec(value) => value.len(),
        }
    }
}

impl Default for U8Buffer {
    fn default() -> Self {
        Self(U8BufferInner::BytesMut(BytesMut::default()))
    }
}

impl From<Vec<u8>> for U8Buffer {
    fn from(value: Vec<u8>) -> Self {
        U8Buffer(U8BufferInner::Vec(value))
    }
}

impl From<BytesMut> for U8Buffer {
    fn from(value: BytesMut) -> Self {
        U8Buffer(U8BufferInner::BytesMut(value))
    }
}

pub struct U16Buffer(Vec<u16>);

impl U16Buffer {
    pub fn new_with_vec(value: Vec<u16>) -> Self {
        Self(value)
    }

    pub fn get_buffer(&self) -> &[u16] {
        self.0.as_slice()
    }

    pub fn get_buffer_mut(&mut self) -> &mut [u16] {
        self.0.as_mut_slice()
    }

    pub fn length(&self) -> usize {
        self.0.len()
    }
}

impl Default for U16Buffer {
    fn default() -> Self {
        Self(Vec::new())
    }
}

impl From<Vec<u16>> for U16Buffer {
    fn from(value: Vec<u16>) -> Self {
        Self::new_with_vec(value)
    }
}

pub struct F32Buffer(Vec<f32>);

impl F32Buffer {
    pub fn new_with_vec(value: Vec<f32>) -> Self {
        Self(value)
    }

    pub fn get_buffer(&self) -> &[f32] {
        self.0.as_slice()
    }

    pub fn get_buffer_mut(&mut self) -> &mut [f32] {
        self.0.as_mut_slice()
    }

    pub fn length(&self) -> usize {
        self.0.len()
    }
}

impl Default for F32Buffer {
    fn default() -> Self {
        Self(Vec::new())
    }
}

impl From<Vec<f32>> for F32Buffer {
    fn from(value: Vec<f32>) -> Self {
        Self(value)
    }
}

pub struct I32Buffer(Vec<i32>);

impl I32Buffer {
    pub fn new_with_vec(value: Vec<i32>) -> Self {
        Self(value)
    }
    pub fn get_buffer(&self) -> &[i32] {
        self.0.as_slice()
    }

    pub fn get_buffer_mut(&mut self) -> &mut [i32] {
        self.0.as_mut_slice()
    }

    pub fn length(&self) -> usize {
        self.0.len()
    }
}

impl Default for I32Buffer {
    fn default() -> Self {
        Self(Vec::new())
    }
}

impl From<Vec<i32>> for I32Buffer {
    fn from(value: Vec<i32>) -> Self {
        Self(value)
    }
}

pub struct U32Buffer(Vec<u32>);

impl U32Buffer {
    pub fn new_with_vec(value: Vec<u32>) -> Self {
        Self(value)
    }

    pub fn get_buffer(&self) -> &[u32] {
        self.0.as_slice()
    }

    pub fn get_buffer_mut(&mut self) -> &mut [u32] {
        self.0.as_mut_slice()
    }

    pub fn length(&self) -> usize {
        self.0.len()
    }
}

impl Default for U32Buffer {
    fn default() -> Self {
        Self::new_with_vec(Vec::new())
    }
}

impl From<Vec<u32>> for U32Buffer {
    fn from(value: Vec<u32>) -> Self {
        Self::new_with_vec(value)
    }
}

pub struct StringBuffer(Vec<String>);

impl From<Vec<String>> for StringBuffer {
    fn from(value: Vec<String>) -> Self {
        Self(value)
    }
}

impl StringBuffer {
    pub fn get_buffer(&self) -> &[String] {
        self.0.as_slice()
    }

    pub fn length(&self) -> usize {
        self.0.len()
    }
}

pub struct StringRefBuffer<'a>(&'a [&'a str]);

impl<'a> StringRefBuffer<'a> {
    pub fn get_buffer(&self) -> &[&str] {
        self.0
    }

    pub fn length(&self) -> usize {
        self.0.len()
    }
}

#[no_mangle]
pub extern "C" fn nativescript_core_u8_buffer_get_bytes(buffer: *const U8Buffer) -> *const u8 {
    if buffer.is_null() {
        return std::ptr::null();
    }
    let buffer = unsafe { &*buffer };
    buffer.get_buffer().as_ptr()
}

#[no_mangle]
pub extern "C" fn nativescript_core_u8_buffer_get_bytes_mut(buffer: *mut U8Buffer) -> *mut u8 {
    if buffer.is_null() {
        return std::ptr::null_mut();
    }
    let buffer = unsafe { &mut *buffer };
    buffer.get_buffer_mut().as_mut_ptr()
}

#[no_mangle]
pub extern "C" fn nativescript_core_u8_buffer_destroy(buffer: *mut U8Buffer) {
    if buffer.is_null() {
        return;
    }
    unsafe {
        let _ = Box::from_raw(buffer);
    }
}

#[no_mangle]
pub extern "C" fn nativescript_core_u8_buffer_get_length(buffer: *const U8Buffer) -> usize {
    if buffer.is_null() {
        return 0;
    }
    let buffer = unsafe { &*buffer };
    buffer.length()
}

#[no_mangle]
pub extern "C" fn nativescript_core_u16_buffer_get_bytes(buffer: *const U16Buffer) -> *const u16 {
    if buffer.is_null() {
        return std::ptr::null();
    }
    let buffer = unsafe { &*buffer };
    buffer.get_buffer().as_ptr()
}

#[no_mangle]
pub extern "C" fn nativescript_core_u16_buffer_get_bytes_mut(buffer: *mut U16Buffer) -> *mut u16 {
    if buffer.is_null() {
        return std::ptr::null_mut();
    }
    let buffer = unsafe { &mut *buffer };
    buffer.get_buffer_mut().as_mut_ptr()
}

#[no_mangle]
pub extern "C" fn nativescript_core_u16_buffer_destroy(buffer: *mut U16Buffer) {
    if buffer.is_null() {
        return;
    }
    unsafe {
        let _ = Box::from_raw(buffer);
    }
}

#[no_mangle]
pub extern "C" fn nativescript_core_u16_buffer_get_length(buffer: *const U16Buffer) -> usize {
    if buffer.is_null() {
        return 0;
    }
    let buffer = unsafe { &*buffer };
    buffer.length()
}

#[no_mangle]
pub extern "C" fn nativescript_core_u32_buffer_get_bytes(buffer: *const U32Buffer) -> *const u32 {
    if buffer.is_null() {
        return std::ptr::null();
    }
    let buffer = unsafe { &*buffer };
    buffer.get_buffer().as_ptr()
}

#[no_mangle]
pub extern "C" fn nativescript_core_u32_buffer_get_bytes_mut(buffer: *mut U32Buffer) -> *mut u32 {
    if buffer.is_null() {
        return std::ptr::null_mut();
    }
    let buffer = unsafe { &mut *buffer };
    buffer.get_buffer_mut().as_mut_ptr()
}

#[no_mangle]
pub extern "C" fn nativescript_core_u32_buffer_destroy(buffer: *mut U32Buffer) {
    if buffer.is_null() {
        return;
    }
    unsafe {
        let _ = Box::from_raw(buffer);
    }
}

#[no_mangle]
pub extern "C" fn nativescript_core_u32_buffer_get_length(buffer: *const U32Buffer) -> usize {
    if buffer.is_null() {
        return 0;
    }
    let buffer = unsafe { &*buffer };
    buffer.length()
}

#[no_mangle]
pub extern "C" fn nativescript_core_i32_buffer_get_bytes(buffer: *const I32Buffer) -> *const i32 {
    if buffer.is_null() {
        return std::ptr::null();
    }
    let buffer = unsafe { &*buffer };
    buffer.get_buffer().as_ptr()
}

#[no_mangle]
pub extern "C" fn nativescript_core_i32_buffer_get_bytes_mut(buffer: *mut I32Buffer) -> *mut i32 {
    if buffer.is_null() {
        return std::ptr::null_mut();
    }
    let buffer = unsafe { &mut *buffer };
    buffer.get_buffer_mut().as_mut_ptr()
}

#[no_mangle]
pub extern "C" fn nativescript_core_i32_buffer_destroy(buffer: *mut I32Buffer) {
    if buffer.is_null() {
        return;
    }
    unsafe {
        let _ = Box::from_raw(buffer);
    }
}


#[no_mangle]
pub extern "C" fn nativescript_core_i32_buffer_get_length(buffer: *const I32Buffer) -> usize {
    if buffer.is_null() {
        return 0;
    }
    let buffer = unsafe { &*buffer };
    buffer.length()
}

#[no_mangle]
pub extern "C" fn nativescript_core_f32_buffer_get_bytes(buffer: *const F32Buffer) -> *const f32 {
    if buffer.is_null() {
        return std::ptr::null();
    }
    let buffer = unsafe { &*buffer };
    buffer.get_buffer().as_ptr()
}

#[no_mangle]
pub extern "C" fn nativescript_core_f32_buffer_get_bytes_mut(buffer: *mut F32Buffer) -> *mut f32 {
    if buffer.is_null() {
        return std::ptr::null_mut();
    }
    let buffer = unsafe { &mut *buffer };
    buffer.get_buffer_mut().as_mut_ptr()
}

#[no_mangle]
pub extern "C" fn nativescript_core_f32_buffer_destroy(buffer: *mut F32Buffer) {
    if buffer.is_null() {
        return;
    }
    unsafe {
        let _ = Box::from_raw(buffer);
    }
}

#[no_mangle]
pub extern "C" fn nativescript_core_f32_buffer_get_length(buffer: *const F32Buffer) -> usize {
    if buffer.is_null() {
        return 0;
    }
    let buffer = unsafe { &*buffer };
    buffer.length()
}

#[no_mangle]
pub extern "C" fn nativescript_core_string_buffer_get_length(buffer: *const StringBuffer) -> usize {
    if buffer.is_null() {
        return 0;
    }
    let buffer = unsafe { &*buffer };
    buffer.length()
}

#[no_mangle]
pub extern "C" fn nativescript_core_string_buffer_get_value_at(
    buffer: *const StringBuffer,
    index: usize,
) -> *mut c_char {
    if buffer.is_null() {
        return std::ptr::null_mut();
    }
    let buffer = unsafe { &*buffer };
    match buffer.0.get(index) {
        None => std::ptr::null_mut(),
        Some(value) => CString::new(value.to_string()).unwrap().into_raw(),
    }
}

#[no_mangle]
pub extern "C" fn nativescript_core_string_buffer_destroy(buffer: *mut StringBuffer) {
    if buffer.is_null() {
        return;
    }
    unsafe {
        let _ = Box::from_raw(buffer);
    }
}