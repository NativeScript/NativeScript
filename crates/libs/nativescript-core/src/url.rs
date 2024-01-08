use std::ffi::{c_char, CStr, CString};

use ada_url::Url;

use crate::ccow::CCow;

pub struct URL(Url);

#[no_mangle]
pub extern "C" fn nativescript_core_url_can_parse(value: *const c_char, base: *const c_char) -> bool {
    let value_null = value.is_null();
    let base_null = base.is_null();
    if value_null && base_null {
        return false;
    }

    if value_null {
        let base = unsafe { CStr::from_ptr(base) };
        let base = base.to_string_lossy();

        return Url::can_parse("", Some(base.as_ref()));
    }

    let value = unsafe { CStr::from_ptr(value) };
    let value = value.to_string_lossy();

    if base_null {
        return Url::can_parse(value.as_ref(), None);
    }

    let base = unsafe { CStr::from_ptr(base) };
    let base = base.to_string_lossy();

    Url::can_parse(value.as_ref(), Some(base.as_ref()))
}

#[no_mangle]
pub extern "C" fn nativescript_core_url_create(value: *const c_char, base: *const c_char) -> *mut URL {
    let value = unsafe { CStr::from_ptr(value) };
    let value = value.to_string_lossy();

    let url = if base.is_null() {
        Url::parse(value, None)
    } else {
        let base = unsafe { CStr::from_ptr(base) };
        let base = base.to_string_lossy();
        Url::parse(value, Some(base.as_ref()))
    };

    // todo return error
    match url {
        Ok(url) => Box::into_raw(Box::new(URL(url))),
        Err(_) => std::ptr::null_mut(),
    }
}

#[no_mangle]
pub extern "C" fn nativescript_core_url_destroy(url: *mut URL) {
    if !url.is_null() {
        let _ = unsafe { Box::from_raw(url) };
    }
}

#[no_mangle]
pub extern "C" fn nativescript_core_url_to_string(url: *mut URL) -> *mut CCow {
    if url.is_null() {
        return std::ptr::null_mut();
    }

    let url = unsafe { &mut *url };
    let url = &mut url.0;

    Box::into_raw(Box::new(CCow::from(url.to_string())))
}

#[no_mangle]
pub extern "C" fn nativescript_core_url_hash(url: *mut URL) -> *const c_char {
    if url.is_null() {
        return std::ptr::null();
    }

    let url = unsafe { &mut *url };
    let url = &mut url.0;

    CString::new(url.hash()).unwrap().into_raw()
}

#[no_mangle]
pub extern "C" fn nativescript_core_url_set_hash(url: *mut URL, hash: *const c_char) {
    if url.is_null() {
        return;
    }

    let url = unsafe { &mut *url };
    let url = &mut url.0;

    if hash.is_null() {
        url.set_hash(None);
    } else {
        let hash = unsafe { CStr::from_ptr(hash) };
        let hash = hash.to_string_lossy();

        url.set_hash(Some(hash.as_ref()));
    }
}

#[no_mangle]
pub extern "C" fn nativescript_core_url_host(url: *mut URL) -> *const c_char {
    if url.is_null() {
        return std::ptr::null();
    }

    let url = unsafe { &mut *url };
    let url = &mut url.0;

    CString::new(url.host()).unwrap().into_raw()
}

#[no_mangle]
pub extern "C" fn nativescript_core_url_set_host(url: *mut URL, host: *const c_char) {
    if url.is_null() {
        return;
    }

    let url = unsafe { &mut *url };
    let url = &mut url.0;

    if host.is_null() {
        let _ = url.set_host(None);
    } else {
        let host = unsafe { CStr::from_ptr(host) };
        let host = host.to_string_lossy();

        let _ = url.set_host(Some(host.as_ref()));
    }
}

#[no_mangle]
pub extern "C" fn nativescript_core_url_host_name(url: *mut URL) -> *const c_char {
    if url.is_null() {
        return std::ptr::null();
    }

    let url = unsafe { &mut *url };
    let url = &mut url.0;

    CString::new(url.hostname()).unwrap().into_raw()
}

#[no_mangle]
pub extern "C" fn nativescript_core_url_set_host_name(url: *mut URL, hostname: *const c_char) {
    if url.is_null() {
        return;
    }

    let url = unsafe { &mut *url };
    let url = &mut url.0;

    if hostname.is_null() {
        let _ = url.set_hostname(None);
    } else {
        let hostname = unsafe { CStr::from_ptr(hostname) };
        let hostname = hostname.to_string_lossy();

        let _ = url.set_hostname(Some(hostname.as_ref()));
    }
}

#[no_mangle]
pub extern "C" fn nativescript_core_url_href(url: *mut URL) -> *const c_char {
    if url.is_null() {
        return std::ptr::null();
    }

    let url = unsafe { &mut *url };
    let url = &mut url.0;

    CString::new(url.href()).unwrap().into_raw()
}

#[no_mangle]
pub extern "C" fn nativescript_core_url_set_href(url: *mut URL, href: *const c_char) {
    if url.is_null() {
        return;
    }

    let url = unsafe { &mut *url };
    let url = &mut url.0;

    if !href.is_null() {
        let href = unsafe { CStr::from_ptr(href) };
        let href = href.to_string_lossy();

        let _ = url.set_href(href.as_ref());
    }
}

#[no_mangle]
pub extern "C" fn nativescript_core_url_origin(url: *mut URL) -> *const c_char {
    if url.is_null() {
        return std::ptr::null();
    }

    let url = unsafe { &mut *url };
    let url = &mut url.0;

    CString::new(url.origin()).unwrap().into_raw()
}

#[no_mangle]
pub extern "C" fn nativescript_core_url_password(url: *mut URL) -> *const c_char {
    if url.is_null() {
        return std::ptr::null();
    }

    let url = unsafe { &mut *url };
    let url = &mut url.0;

    CString::new(url.password()).unwrap().into_raw()
}

#[no_mangle]
pub extern "C" fn nativescript_core_url_set_password(url: *mut URL, password: *const c_char) {
    if url.is_null() {
        return;
    }

    let url = unsafe { &mut *url };
    let url = &mut url.0;

    if password.is_null() {
        let _ = url.set_password(None);
    } else {
        let password = unsafe { CStr::from_ptr(password) };
        let password = password.to_string_lossy();

        let _ = url.set_password(Some(password.as_ref()));
    }
}

#[no_mangle]
pub extern "C" fn nativescript_core_url_pathname(url: *mut URL) -> *const c_char {
    if url.is_null() {
        return std::ptr::null();
    }

    let url = unsafe { &mut *url };
    let url = &mut url.0;

    CString::new(url.pathname()).unwrap().into_raw()
}

#[no_mangle]
pub extern "C" fn nativescript_core_url_set_pathname(url: *mut URL, pathname: *const c_char) {
    if url.is_null() {
        return;
    }

    let url = unsafe { &mut *url };
    let url = &mut url.0;

    if pathname.is_null() {
        let _ = url.set_pathname(None);
    } else {
        let pathname = unsafe { CStr::from_ptr(pathname) };
        let pathname = pathname.to_string_lossy();

        let _ = url.set_pathname(Some(pathname.as_ref()));
    }
}

#[no_mangle]
pub extern "C" fn nativescript_core_url_port(url: *mut URL) -> *const c_char {
    if url.is_null() {
        return std::ptr::null();
    }

    let url = unsafe { &mut *url };
    let url = &mut url.0;

    CString::new(url.port()).unwrap().into_raw()
}

#[no_mangle]
pub extern "C" fn nativescript_core_url_set_port(url: *mut URL, port: *const c_char) {
    if url.is_null() {
        return;
    }

    let url = unsafe { &mut *url };
    let url = &mut url.0;

    if port.is_null() {
        let _ = url.set_port(None);
    } else {
        let port = unsafe { CStr::from_ptr(port) };
        let port = port.to_string_lossy();

        let _ = url.set_port(Some(port.as_ref()));
    }
}

#[no_mangle]
pub extern "C" fn nativescript_core_url_protocol(url: *mut URL) -> *const c_char {
    if url.is_null() {
        return std::ptr::null();
    }

    let url = unsafe { &mut *url };
    let url = &mut url.0;

    CString::new(url.protocol()).unwrap().into_raw()
}

#[no_mangle]
pub extern "C" fn nativescript_core_url_set_protocol(url: *mut URL, protocol: *const c_char) {
    if url.is_null() {
        return;
    }

    let url = unsafe { &mut *url };
    let url = &mut url.0;

    if !protocol.is_null() {
        let protocol = unsafe { CStr::from_ptr(protocol) };
        let protocol = protocol.to_string_lossy();

        let _ = url.set_protocol(protocol.as_ref());
    }
}

#[no_mangle]
pub extern "C" fn nativescript_core_url_search(url: *mut URL) -> *const c_char {
    if url.is_null() {
        return std::ptr::null();
    }

    let url = unsafe { &mut *url };
    let url = &mut url.0;

    CString::new(url.search()).unwrap().into_raw()
}

#[no_mangle]
pub extern "C" fn nativescript_core_url_set_search(url: *mut URL, search: *const c_char) {
    if url.is_null() {
        return;
    }

    let url = unsafe { &mut *url };
    let url = &mut url.0;

    if search.is_null() {
        let _ = url.set_search(None);
    } else {
        let search = unsafe { CStr::from_ptr(search) };
        let search = search.to_string_lossy();

        let _ = url.set_search(Some(search.as_ref()));
    }
}

#[no_mangle]
pub extern "C" fn nativescript_core_url_username(url: *mut URL) -> *const c_char {
    if url.is_null() {
        return std::ptr::null();
    }

    let url = unsafe { &mut *url };
    let url = &mut url.0;

    CString::new(url.username()).unwrap().into_raw()
}

#[no_mangle]
pub extern "C" fn nativescript_core_url_set_username(url: *mut URL, username: *const c_char) {
    if url.is_null() {
        return;
    }

    let url = unsafe { &mut *url };
    let url = &mut url.0;

    if username.is_null() {
        let _ = url.set_username(None);
    } else {
        let username = unsafe { CStr::from_ptr(username) };
        let username = username.to_string_lossy();

        let _ = url.set_username(Some(username.as_ref()));
    }
}