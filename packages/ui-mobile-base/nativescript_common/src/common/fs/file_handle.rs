use std::fs::File;
use std::os::unix::prelude::*;
use std::sync::Arc;

use libc::{c_int, c_long, c_uint, c_ushort};

use crate::common::fs::a_sync::{runtime, AsyncClosure};
use crate::common::fs::file_stat::FileStat;
use crate::common::fs::sync::open_handle_with_path_str;
use crate::common::{ByteBuf, ByteBufMut};

pub struct FileHandle {
    pub(crate) file: File,
}

#[allow(non_snake_case)]
impl FileHandle {
    pub fn new(file: File) -> Self {
        Self { file }
    }

    pub fn new_async(
        path: &str,
        flags: c_int,
        mode: c_int,
        callback: Arc<AsyncClosure<FileHandle, std::io::Error>>,
    ) {
        let path = path.to_string();
        runtime().spawn_blocking(
            move || match open_handle_with_path_str(&path, flags, mode) {
                Ok(handle) => {
                    callback.on_success(Some(handle));
                }
                Err(error) => {
                    callback.on_error(Some(error));
                }
            },
        );
    }

    pub fn append_file_with_str(
        &mut self,
        data: &str,
        callback: Arc<AsyncClosure<(), std::io::Error>>,
    ) {
        let fd = self.fd();
        crate::common::fs::a_sync::append_file_with_str(fd, data, callback);
    }

    pub fn append_file_with_bytes(
        &mut self,
        data: ByteBuf,
        callback: Arc<AsyncClosure<(), std::io::Error>>,
    ) {
        let fd = self.fd();
        crate::common::fs::a_sync::append_file_with_bytes(fd, data, callback);
    }

    pub fn chmod(&self, mode: c_ushort, callback: Arc<AsyncClosure<(), std::io::Error>>) {
        let fd = self.fd();
        crate::common::fs::a_sync::fchmod(fd, mode, callback);
    }

    pub fn chown(&self, uid: c_uint, gid: c_uint, callback: Arc<AsyncClosure<(), std::io::Error>>) {
        let fd = self.fd();
        crate::common::fs::a_sync::fchown(fd, uid, gid, callback);
    }

    pub fn close(self, callback: Arc<AsyncClosure<(), std::io::Error>>) {
        {
            // drop the instance before to close
            let _ = self;
        }
        callback.on_success(None);
    }

    // TODO
    // pub fn createReadStream(){}

    // TODO
    // pub fn createWriteStream(){}

    pub fn datasync(&self, callback: Arc<AsyncClosure<(), std::io::Error>>) {
        let fd = self.fd();
        crate::common::fs::a_sync::fdatasync(fd, callback);
    }

    pub fn fd(&self) -> RawFd {
        self.file.as_raw_fd()
    }

    pub fn read(
        &mut self,
        buffer: ByteBufMut,
        offset: usize,
        length: usize,
        position: isize,
        callback: Arc<AsyncClosure<usize, std::io::Error>>,
    ) {
        let fd = self.fd();
        crate::common::fs::a_sync::read(fd, buffer, offset, length, position, callback);
    }
    pub fn readFile(
        &mut self,
        _encoding: &str,
        callback: Arc<AsyncClosure<ByteBufMut, std::io::Error>>,
    ) {
        let fd = self.fd();
        crate::common::fs::a_sync::read_file_with_fd(fd, 0, callback);
    }

    pub fn readv(
        &mut self,
        buffers: Vec<ByteBufMut>,
        position: c_long,
        callback: Arc<AsyncClosure<usize, std::io::Error>>,
    ) {
        let fd = self.fd();
        crate::common::fs::a_sync::readv(fd, buffers, position, callback);
    }

    pub fn stat(&self, callback: Arc<AsyncClosure<FileStat, std::io::Error>>) {
        let fd = self.fd();
        crate::common::fs::a_sync::fstat(fd, callback);
    }

    pub fn sync(&self, callback: Arc<AsyncClosure<(), std::io::Error>>) {
        let fd = self.fd();
        crate::common::fs::a_sync::fsync(fd, callback);
    }

    pub fn truncate(&mut self, len: c_long, callback: Arc<AsyncClosure<(), std::io::Error>>) {
        let fd = self.fd();
        crate::common::fs::a_sync::ftruncate(fd, len, callback);
    }

    pub fn utimes(
        &mut self,
        atime: c_long,
        mtime: c_long,
        callback: Arc<AsyncClosure<(), std::io::Error>>,
    ) {
        let fd = self.fd();
        crate::common::fs::a_sync::futimes(fd, atime, mtime, callback);
    }

    pub fn write(
        &mut self,
        buffer: ByteBuf,
        offset: usize,
        length: usize,
        position: isize,
        callback: Arc<AsyncClosure<usize, std::io::Error>>,
    ) {
        let fd = self.fd();
        crate::common::fs::a_sync::write(fd, buffer, offset, length, position, callback);
    }

    pub fn write_string(
        &mut self,
        data: &str,
        encoding: &str,
        position: isize,
        callback: Arc<AsyncClosure<usize, std::io::Error>>,
    ) {
        let fd = self.fd();
        crate::common::fs::a_sync::write_string(fd, data, encoding, position, callback);
    }

    pub fn write_file_with_str(
        &mut self,
        data: &str,
        encoding: &str,
        callback: Arc<AsyncClosure<(), std::io::Error>>,
    ) {
        let fd = self.fd();
        crate::common::fs::a_sync::write_file_with_str(fd, data, encoding, callback);
    }

    pub fn write_file_with_bytes(
        &mut self,
        data: ByteBuf,
        callback: Arc<AsyncClosure<(), std::io::Error>>,
    ) {
        let fd = self.fd();
        crate::common::fs::a_sync::write_file_with_bytes(fd, data, callback);
    }

    pub fn writev(
        &mut self,
        buffers: Vec<ByteBuf>,
        position: c_long,
        callback: Arc<AsyncClosure<usize, std::io::Error>>,
    ) {
        let fd = self.fd();
        crate::common::fs::a_sync::writev(fd, buffers, position, callback);
    }
}
