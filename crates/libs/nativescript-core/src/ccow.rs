use std::borrow::Cow;

#[derive(Clone, Debug)]
pub(crate) enum CCowInner {
    String(Cow<'static, str>),
    Bytes(Cow<'static, [u8]>),
}

#[derive(Clone, Debug)]
pub struct CCow(pub(crate) CCowInner);

impl AsRef<[u8]> for CCow {
    fn as_ref(&self) -> &[u8] {
        match &self.0 {
            CCowInner::String(value) => value.as_bytes(),
            CCowInner::Bytes(value) => value.as_ref()
        }
    }
}

impl From<String> for CCow {
    fn from(value: String) -> Self {
        Self(CCowInner::String(Cow::from(value)))
    }
}

impl From<&'static [u8]> for CCow {
    fn from(value: &'static [u8]) -> Self {
        Self(CCowInner::Bytes(Cow::from(value)))
    }
}

impl From<Cow<'static, str>> for CCow {
    fn from(value: Cow<'static, str>) -> Self {
        Self(CCowInner::String(value))
    }
}

#[no_mangle]
pub extern "C" fn nativescript_core_ccow_destroy(cow: *mut CCow) {
    if cow.is_null() {
        return;
    }
    let _ = unsafe { Box::from_raw(cow) };
}

#[no_mangle]
pub extern "C" fn nativescript_core_ccow_get_bytes(cow: *const CCow) -> *const u8 {
    if cow.is_null() {
        return std::ptr::null();
    }
    let cow = unsafe { &*cow };
    match &cow.0 {
        CCowInner::String(value) => value.as_ptr(),
        CCowInner::Bytes(value) => value.as_ptr()
    }
}

#[no_mangle]
pub extern "C" fn nativescript_core_ccow_get_length(cow: *const CCow) -> usize {
    if cow.is_null() {
        return 0;
    }
    let cow = unsafe { &*cow };
    match &cow.0 {
        CCowInner::String(value) => value.len(),
        CCowInner::Bytes(value) => value.len()
    }
}