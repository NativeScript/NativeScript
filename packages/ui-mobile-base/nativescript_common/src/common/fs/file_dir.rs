use std::borrow::Cow;
use std::ffi::{c_void, CStr, CString};
use std::os::raw::c_char;

use crate::common::fs::file_dirent::FileDirent;

// wrap in arc<mutex> ??

#[allow(non_snake_case)]
#[repr(C)]
pub struct FileDir {
    path: *mut c_char,
    dir: *mut libc::c_void,
}

unsafe impl Send for FileDir {}

impl Drop for FileDir {
    fn drop(&mut self) {
        unsafe {
            let _ = CString::from_raw(self.path);
        }
    }
}

impl FileDir {
    pub(crate) fn new(path: *mut c_char, dir: *mut libc::DIR) -> FileDir {
        Self { path, dir: dir as *mut c_void }
    }

    pub fn close(&self) -> std::io::Result<()> {
        let ret = unsafe { libc::closedir(self.dir as _) };

        if ret == -1 {
            let last_error = std::io::Error::last_os_error();
            return Err(last_error);
        }
        Ok(())
    }

    pub fn close_async(&self, callback: Box<dyn Fn(Option<std::io::Error>) + Send>) {
        // todo
        // this instance should live until resolved probably wrap in arc to be safe
        let path = self.path as i64;
        let dir = self.dir as i64;
        super::a_sync::runtime().spawn(async move {
            let tmp_file_dir = FileDir::new(
                path as _,
                dir as _,
            );
            match tmp_file_dir.close() {
                Ok(_) => {
                    (callback)(None);
                }
                Err(error) => {
                    (callback)(Some(error))
                }
            }
        });
    }

    pub fn path(&self) -> Cow<str> {
        unsafe { CStr::from_ptr(self.path).to_string_lossy() }
    }

    pub fn read(&self) -> std::io::Result<FileDirent> {
        let ret = unsafe { libc::readdir(self.dir as _) };

        if ret.is_null() {
            let last_error = std::io::Error::last_os_error();
            return Err(last_error);
        }

        Ok(FileDirent::new_raw(ret))
    }

    pub fn read_async(&self, callback: Box<dyn Fn(Option<FileDirent>, Option<std::io::Error>) + Send>) {
        let path = self.path as i64;
        let dir = self.dir as i64;
        super::a_sync::runtime().spawn(async move {
            let tmp_file_dir = FileDir::new(
                path as _,
                dir as _,
            );
            match tmp_file_dir.read() {
                Ok(dir) => {
                    (callback)(Some(dir), None);
                }
                Err(error) => {
                    (callback)(None, Some(error));
                }
            }
        });
    }
}
