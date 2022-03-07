use std::ffi::CString;

use libc::c_char;

use crate::common::fs::file_dirent::FileDirent;

#[no_mangle]
pub extern "C" fn native_fs_file_dirent_clone(dirent: *mut FileDirent) -> *mut FileDirent {
    let dirent = unsafe { &*dirent };
    Box::into_raw(Box::new(dirent.clone()))
}

#[no_mangle]
pub extern "C" fn native_fs_file_dirent_is_block_device(dirent: *mut FileDirent) -> bool {
    let dirent = unsafe { &mut *dirent };
    dirent.is_block_device()
}

#[no_mangle]
pub extern "C" fn native_fs_file_dirent_is_character_device(dirent: *mut FileDirent) -> bool {
    let dirent = unsafe { &mut *dirent };
    dirent.is_character_device()
}

#[no_mangle]
pub extern "C" fn native_fs_file_dirent_is_directory(dirent: *mut FileDirent) -> bool {
    let dirent = unsafe { &mut *dirent };
    dirent.is_directory()
}

#[no_mangle]
pub extern "C" fn native_fs_file_dirent_is_fifo(dirent: *mut FileDirent) -> bool {
    let dirent = unsafe { &mut *dirent };
    dirent.is_fifo()
}

#[no_mangle]
pub extern "C" fn native_fs_file_dirent_is_file(dirent: *mut FileDirent) -> bool {
    let dirent = unsafe { &mut *dirent };
    dirent.is_file()
}

#[no_mangle]
pub extern "C" fn native_fs_file_dirent_is_socket(dirent: *mut FileDirent) -> bool {
    let dirent = unsafe { &mut *dirent };
    dirent.is_socket()
}

#[no_mangle]
pub extern "C" fn native_fs_file_dirent_is_symbolic_link(dirent: *mut FileDirent) -> bool {
    let dirent = unsafe { &mut *dirent };
    dirent.is_symbolic_link()
}

#[no_mangle]
pub extern "C" fn native_fs_file_dirent_name(dirent: *mut FileDirent) -> *mut c_char {
    let dirent = unsafe { &mut *dirent };
    CString::new(dirent.name().as_ref()).unwrap().into_raw()
}
