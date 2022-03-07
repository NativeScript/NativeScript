use std::borrow::Cow;
use std::cmp::min;
use std::ffi::{CStr, CString, OsString};
use std::fs::{File, OpenOptions, Permissions};
use std::io::{IoSlice, IoSliceMut, Read, Seek, SeekFrom, Write};
use std::os::raw::c_ulonglong;
use std::os::unix::io::{AsRawFd, FromRawFd, RawFd};
use std::os::unix::prelude::IntoRawFd;
use std::os::unix::prelude::*;
use std::path::Path;
use std::sync::atomic::{AtomicI32, Ordering};
use std::time::Duration;
use std::{fs, io};

use backoff::Error;
use backoff::ExponentialBackoff;
use faccess::PathExt;
use libc::{c_char, c_int, c_long, c_uint, c_ushort};
use rand::{thread_rng, Rng};

use crate::common::fs::file_dir::FileDir;
use crate::common::fs::file_dirent::FileDirent;
use crate::common::fs::file_handle::FileHandle;
use crate::common::{
    ByteBuf, ByteBufMut, FILE_ACCESS_OPTIONS_F_OK, FILE_ACCESS_OPTIONS_R_OK,
    FILE_ACCESS_OPTIONS_W_OK, FILE_ACCESS_OPTIONS_X_OK, FILE_OPEN_OPTIONS_O_APPEND,
    FILE_OPEN_OPTIONS_O_CREAT, FILE_OPEN_OPTIONS_O_EXCL, FILE_OPEN_OPTIONS_O_RDONLY,
    FILE_OPEN_OPTIONS_O_TRUNC, FILE_OPEN_OPTIONS_O_WRONLY,
};

fn file_from_path_str(path: &str, flags: c_int, mode: c_int) -> std::io::Result<File> {
    let mut options = OpenOptions::new();

    if (flags & FILE_OPEN_OPTIONS_O_CREAT) == FILE_OPEN_OPTIONS_O_CREAT {
        options.create(true);
    }

    if (flags & FILE_OPEN_OPTIONS_O_RDONLY) == FILE_OPEN_OPTIONS_O_RDONLY {
        options.read(true);
    }

    if (flags & FILE_OPEN_OPTIONS_O_WRONLY) == FILE_OPEN_OPTIONS_O_WRONLY {
        options.write(true);
    }

    if (flags & FILE_OPEN_OPTIONS_O_APPEND) == FILE_OPEN_OPTIONS_O_APPEND {
        options.append(true);
    }

    if (flags & FILE_OPEN_OPTIONS_O_TRUNC) == FILE_OPEN_OPTIONS_O_TRUNC {
        options.truncate(true);
    }

    if (flags & FILE_OPEN_OPTIONS_O_EXCL) == FILE_OPEN_OPTIONS_O_EXCL {
        options.create_new(true);
    }

    if mode != 0 {
        options.mode(mode as u32);
    }
    options.open(path)
}

fn file_from_path(path: *const c_char, flags: c_int, mode: c_int) -> std::io::Result<File> {
    let path = unsafe { CStr::from_ptr(path) };
    file_from_path_str(path.to_string_lossy().as_ref(), flags, mode)
}

pub fn open_path_with_str(path: &str, flags: c_int, mode: c_int) -> std::io::Result<RawFd> {
    let file = file_from_path_str(path, flags, mode)?;
    Ok(file.into_raw_fd())
}

pub fn open_path(path: *const c_char, flags: c_int, mode: c_int) -> std::io::Result<RawFd> {
    let file = file_from_path(path, flags, mode).map(|f| f.into_raw_fd())?;

    Ok(file.into_raw_fd())
}

pub fn open_handle_with_fd(fd: i32) -> std::io::Result<FileHandle> {
    if fd == -1 {
        return Err(std::io::Error::new(
            std::io::ErrorKind::Other,
            "Bad file descriptor",
        ));
    }
    let file = unsafe { File::from_raw_fd(fd) };
    Ok(FileHandle::new(file))
}

pub fn open_handle_with_path_str(
    path: &str,
    flags: c_int,
    mode: c_int,
) -> std::io::Result<FileHandle> {
    file_from_path_str(path, flags, mode).map(|v| FileHandle::new(v))
}

pub fn open_handle_with_path(
    path: *const c_char,
    flags: c_int,
    mode: i32,
) -> std::io::Result<FileHandle> {
    file_from_path(path, flags, mode).map(|v| FileHandle::new(v))
}

pub fn access(path: &str, access: c_int) -> std::io::Result<()> {
    let path = Path::new(path);
    let mut mode = faccess::AccessMode::empty();
    if (access & FILE_ACCESS_OPTIONS_F_OK) == FILE_ACCESS_OPTIONS_F_OK {
        mode |= faccess::AccessMode::EXISTS;
    }

    if (access & FILE_ACCESS_OPTIONS_W_OK) == FILE_ACCESS_OPTIONS_W_OK {
        mode |= faccess::AccessMode::WRITE;
    }

    if (access & FILE_ACCESS_OPTIONS_R_OK) == FILE_ACCESS_OPTIONS_R_OK {
        mode |= faccess::AccessMode::READ;
    }

    if (access & FILE_ACCESS_OPTIONS_X_OK) == FILE_ACCESS_OPTIONS_X_OK {
        mode |= faccess::AccessMode::EXECUTE;
    }

    path.access(mode)
}

pub fn append_file_with_str(fd: c_int, data: &str) -> std::io::Result<()> {
    let mut file = unsafe { File::from_raw_fd(fd) };
    let _ = file.write(data.as_bytes())?;
    let _ = file.into_raw_fd();
    Ok(())
}

pub fn append_file_with_bytes(fd: c_int, data: &[u8]) -> std::io::Result<()> {
    let mut file = unsafe { File::from_raw_fd(fd) };
    let _ = file.write(data)?;
    let _ = file.into_raw_fd();
    Ok(())
}

pub fn append_file_with_path_str(
    path: &str,
    data: &str,
    mode: c_int,
    flags: c_int,
) -> std::io::Result<()> {
    let fd = open(path, flags, mode)?;
    let mut file = unsafe { File::from_raw_fd(fd) };
    let ret = file.write(data.as_bytes()).map(|_| ());
    let _ = file.into_raw_fd();
    ret
}

pub fn append_file_with_path_bytes(
    path: &str,
    data: &[u8],
    mode: c_int,
    flags: c_int,
) -> std::io::Result<()> {
    let fd = open(path, flags, mode)?;
    let mut file = unsafe { File::from_raw_fd(fd) };
    let ret = file.write(data).map(|_| ());
    let _ = file.into_raw_fd();
    ret
}

pub fn chmod(path: &str, mode: c_uint) -> std::io::Result<()> {
    fs::set_permissions(path, Permissions::from_mode(mode))
}

pub fn chown(path: &str, uid: c_uint, gid: c_uint) -> std::io::Result<()> {
    std::os::unix::fs::chown(path, Some(uid), Some(gid))
}

pub fn close_fd(fd: c_int) {
    unsafe {
        File::from_raw_fd(fd);
    }
}

pub fn copy_file(src: &str, dest: &str, flags: c_uint) -> std::io::Result<()> {
    crate::common::fs::copy_file::copy_file(Path::new(src), Path::new(dest), flags)
}

pub fn cp(_src: &str, _dest: &str) {
    todo!()
    // let src = Path::new(src);
    // let dest = Path::new(dest);
    // for entry in fs::read_dir(src)? {
    //     let entry = entry?;
    // }
}

pub fn create_read_stream(_path: &str) {
    todo!()
}

pub fn create_write_stream(_path: &str) {
    todo!()
}

pub fn exists(path: &str) -> bool {
    std::path::Path::new(path).exists()
}

pub fn fchmod(fd: c_int, mode: c_ushort) -> io::Result<()> {
    let ret = unsafe { libc::fchmod(fd, mode.into()) };
    if ret == -1 {
        let last_error = std::io::Error::last_os_error();
        return Err(last_error);
    }
    Ok(())
}

pub fn fchown(fd: c_int, uid: c_uint, gid: c_uint) -> io::Result<()> {
    let ret = unsafe { libc::fchown(fd, uid, gid) };
    if ret == -1 {
        let last_error = std::io::Error::last_os_error();
        return Err(last_error);
    }
    Ok(())
}

pub fn fdatasync(fd: c_int) -> std::io::Result<()> {
    let file = unsafe { File::from_raw_fd(fd) };
    let ret = file.sync_data();
    let _ = file.into_raw_fd();
    ret
}

pub fn fstat(fd: c_int) -> std::io::Result<std::fs::Metadata> {
    let file = unsafe { File::from_raw_fd(fd) };
    let metadata = file.metadata();
    let _ = file.into_raw_fd();
    metadata
}

pub fn fsync(fd: c_int) -> std::io::Result<()> {
    let file = unsafe { File::from_raw_fd(fd) };
    let ret = file.sync_all();
    let _ = file.into_raw_fd();
    ret
}

pub fn ftruncate(fd: c_int, len: c_long) -> std::io::Result<()> {
    let ret = unsafe { libc::ftruncate(fd, len) };
    if ret == -1 {
        let last_error = std::io::Error::last_os_error();
        return Err(last_error);
    }
    Ok(())
}

#[cfg(any(target_os = "android"))]
pub fn futimes(fd: c_int, atime: c_long, mtime: c_long) -> std::io::Result<()> {
    let times = [
        libc::timespec {
            tv_sec: atime,
            tv_nsec: 0,
        },
        libc::timespec {
            tv_sec: mtime,
            tv_nsec: 0,
        },
    ];

    let ret = unsafe { libc::futimens(fd, times.as_ptr()) };

    if ret == -1 {
        let last_error = std::io::Error::last_os_error();
        return Err(last_error);
    }
    Ok(())
}

#[cfg(any(target_os = "macos", target_os = "ios"))]
pub fn futimes(fd: c_int, atime: c_long, mtime: c_long) -> std::io::Result<()> {
    let times = [
        libc::timeval {
            tv_sec: atime,
            tv_usec: 0,
        },
        libc::timeval {
            tv_sec: mtime,
            tv_usec: 0,
        },
    ];

    let ret = unsafe { libc::futimes(fd, times.as_ptr()) };

    if ret == -1 {
        let last_error = std::io::Error::last_os_error();
        return Err(last_error);
    }
    Ok(())
}

#[cfg(any(target_os = "android"))]
pub fn lchmod(path: &str, mode: c_ushort) -> std::io::Result<()> {
    let mut options = OpenOptions::new();
    options.write(true);
    let mut file = options.open(path)?;
    let mut permissions = std::fs::Permissions::from_mode(mode.into());
    file.set_permissions(permissions)
}

#[cfg(any(target_os = "macos", target_os = "ios"))]
pub fn lchmod(path: &str, mode: c_ushort) -> std::io::Result<()> {
    mod internal {
        extern "C" {
            pub fn lchmod(__file: *const libc::c_char, __mode: libc::mode_t) -> libc::c_int;
        }
    }
    let path = CString::new(path)?;
    let ret = unsafe { internal::lchmod(path.as_ptr(), mode.into()) };

    if ret == -1 {
        let last_error = std::io::Error::last_os_error();
        return Err(last_error);
    }
    Ok(())
}

pub fn lchown(path: &str, uid: c_uint, gid: c_uint) -> std::io::Result<()> {
    let path = CString::new(path).unwrap();
    let ret = unsafe { libc::lchown(path.as_ptr(), uid, gid) };

    if ret == -1 {
        let last_error = std::io::Error::last_os_error();
        return Err(last_error);
    }
    Ok(())
}

#[cfg(any(target_os = "android"))]
pub fn lutimes(path: &str, atime: c_long, mtime: c_long) -> std::io::Result<()> {
    let file = File::open(path)?;
    let times = [
        libc::timespec {
            tv_sec: atime,
            tv_nsec: 0,
        },
        libc::timespec {
            tv_sec: mtime,
            tv_nsec: 0,
        },
    ];
    let ret = unsafe { libc::futimens(file.as_raw_fd(), times.as_ptr()) };

    if ret == -1 {
        let last_error = std::io::Error::last_os_error();
        return Err(last_error);
    }
    Ok(())
}

#[cfg(any(target_os = "macos", target_os = "ios"))]
pub fn lutimes(path: &str, atime: c_long, mtime: c_long) -> std::io::Result<()> {
    let file = File::open(path)?;
    let times = [
        libc::timeval {
            tv_sec: atime,
            tv_usec: 0,
        },
        libc::timeval {
            tv_sec: mtime,
            tv_usec: 0,
        },
    ];
    let ret = unsafe { libc::futimes(file.as_raw_fd(), times.as_ptr()) };

    if ret == -1 {
        let last_error = std::io::Error::last_os_error();
        return Err(last_error);
    }
    Ok(())
}

pub fn link(existing_path: &str, new_path: &str) -> std::io::Result<()> {
    fs::hard_link(existing_path, new_path)
}

pub fn lstat(path: &str) -> std::io::Result<std::fs::Metadata> {
    fs::metadata(path)
}

pub fn mkdir(path: &str, mode: c_uint, recursive: bool) -> std::io::Result<()> {
    let path = Path::new(&path);

    let mut builder = std::fs::DirBuilder::new();
    builder.recursive(recursive);
    #[cfg(unix)]
    {
        use std::os::unix::fs::DirBuilderExt;
        builder.mode(mode);
    }
    builder.create(&path)
}

// https://github.com/denoland/deno/blob/5e845442fade02cd12d13e74222b26e217c5971d/runtime/ops/fs.rs#L1649
pub(crate) fn make_temp(
    dir: Option<&Path>,
    prefix: Option<&str>,
    suffix: Option<&str>,
    is_dir: bool,
) -> std::io::Result<std::path::PathBuf> {
    let prefix_ = prefix.unwrap_or("");
    let suffix_ = suffix.unwrap_or("");
    let mut buf: std::path::PathBuf = match dir {
        Some(p) => p.to_path_buf(),
        None => std::env::temp_dir(),
    }
    .join("_");
    let mut rng = thread_rng();
    loop {
        let unique = rng.gen::<u32>();
        buf.set_file_name(format!("{}{:08x}{}", prefix_, unique, suffix_));
        let r = if is_dir {
            #[allow(unused_mut)]
            let mut builder = std::fs::DirBuilder::new();
            #[cfg(unix)]
            {
                use std::os::unix::fs::DirBuilderExt;
                builder.mode(0o700);
            }
            builder.create(buf.as_path())
        } else {
            let mut open_options = std::fs::OpenOptions::new();
            open_options.write(true).create_new(true);
            #[cfg(unix)]
            {
                open_options.mode(0o600);
            }
            open_options.open(buf.as_path())?;
            Ok(())
        };
        match r {
            Err(ref e) if e.kind() == std::io::ErrorKind::AlreadyExists => continue,
            Ok(_) => return Ok(buf),
            Err(e) => return Err(e),
        }
    }
}

pub fn mkdtemp<'a>(prefix: &str) -> std::io::Result<Cow<'a, str>> {
    let path = make_temp(None, Some(prefix), None, true)?;
    let os_str = path.into_os_string().to_string_lossy().to_string();
    Ok(Cow::from(os_str))
}

pub fn open(path: &str, flags: c_int, mode: c_int) -> std::io::Result<RawFd> {
    open_path_with_str(path, flags, mode)
}

pub fn opendir(path: &str) -> std::io::Result<FileDir> {
    let path = CString::new(path)?;
    let dir = unsafe { libc::opendir(path.as_ptr()) };
    if dir.is_null() {
        let last_error = std::io::Error::last_os_error();
        return Err(last_error);
    }
    Ok(FileDir::new(path.into_raw(), dir))
}

pub fn read(
    fd: c_int,
    buffer: &mut [u8],
    offset: usize,
    length: usize,
    position: isize,
) -> std::io::Result<usize> {
    let mut file = unsafe { File::from_raw_fd(fd) };

    if position != -1 {
        match file.seek(SeekFrom::Start(position as u64)) {
            Ok(_) => {}
            Err(error) => return std::io::Result::Err(error),
        }
    }

    let new_position = file.stream_position().unwrap_or_default();
    let buffer_len = buffer.len();
    let tmp_buf = &mut buffer[offset..];
    let result = if length < buffer_len {
        let buf = &mut tmp_buf[..length];
        file.read(buf)
    } else {
        file.read(tmp_buf)
    };

    match result {
        Ok(read) => {
            if read == 0 {
                return Ok(min(new_position as usize, read));
            }
            Ok(read)
        }
        Err(error) => Err(error),
    }
}

pub fn readdir_with_file_types(path: &str, _encoding: &str) -> std::io::Result<Vec<FileDirent>> {
    let read = fs::read_dir(path)?;
    let mut buf = Vec::new();
    for entry in read {
        let dir = entry?;
        buf.push(FileDirent::new_regular(dir))
    }
    Ok(buf)
}

pub fn readdir_with_file(path: &str, _encoding: &str) -> std::io::Result<Vec<OsString>> {
    let mut result = Vec::new();
    for dir in fs::read_dir(path)? {
        let dir = dir?;
        result.push(dir.file_name())
    }
    Ok(result)
}

pub fn read_file(path: &str, flags: c_int) -> std::io::Result<Vec<u8>> {
    let mut file = file_from_path_str(path, flags, 0)?;
    let mut buf = Vec::new();
    file.read_to_end(&mut buf)?;
    Ok(buf)
}

pub fn read_file_with_fd(fd: c_int, _flags: i32) -> std::io::Result<Vec<u8>> {
    let mut file = unsafe { std::fs::File::from_raw_fd(fd) };
    let mut buf = Vec::new();
    file.read_to_end(&mut buf)?;
    Ok(buf)
}

pub fn read_link(path: &str, _encoding: &str) -> std::io::Result<std::path::PathBuf> {
    fs::read_link(path)
}

pub fn readv(fd: c_int, buffers: &mut [ByteBufMut], position: c_long) -> std::io::Result<usize> {
    let mut file = unsafe { File::from_raw_fd(fd) };

    if position != -1 {
        match file.seek(SeekFrom::Start(position as u64)) {
            Ok(_) => {}
            Err(error) => return std::io::Result::Err(error),
        }
    }

    let mut buffers: Vec<IoSliceMut> = buffers
        .iter()
        .map(|b| IoSliceMut::new(unsafe { std::slice::from_raw_parts_mut(b.data, b.len) }))
        .collect();

    file.read_vectored(buffers.as_mut_slice())
}

pub fn readv_raw(
    fd: c_int,
    buffer: *const *mut ByteBufMut,
    buffer_len: usize,
    position: c_long,
) -> std::io::Result<usize> {
    let buf = unsafe { std::slice::from_raw_parts(buffer, buffer_len) };

    let mut slice_buf = Vec::with_capacity(buffer_len);
    unsafe {
        for item in buf.iter() {
            let item = &*(*item);
            slice_buf.push(ByteBufMut::new(item.data, item.len))
        }
    }

    readv(fd, slice_buf.as_mut_slice(), position)
}

pub fn real_path(path: &str) -> std::io::Result<std::path::PathBuf> {
    std::fs::canonicalize(path)
}

pub fn rename(old_path: &str, new_path: &str) -> std::io::Result<()> {
    fs::rename(Path::new(old_path), Path::new(new_path))
}

pub fn rmdir(
    path: &str,
    max_retries: c_int,
    recursive: bool,
    retry_delay: c_ulonglong,
) -> std::io::Result<()> {
    if !recursive {
        fs::remove_dir(path)
    } else {
        let mut max_retries_count = AtomicI32::new(max_retries);
        let op = || {
            fs::remove_dir_all(path).map(|_| ()).map_err(|e| {
                if max_retries != 0 {
                    let current = max_retries_count.load(Ordering::SeqCst);
                    if current == 0 {
                        return backoff::Error::permanent(e);
                    }
                    *max_retries_count.get_mut() = current - 1;
                }

                match e.kind() {
                    std::io::ErrorKind::ResourceBusy
                    | std::io::ErrorKind::FilesystemLoop
                    | std::io::ErrorKind::DirectoryNotEmpty => Error::Transient {
                        err: e,
                        retry_after: Some(Duration::from_millis(retry_delay)),
                    },
                    _ => {
                        let val = e.to_string().to_lowercase();
                        if val.contains("too many open files") {
                            Error::Transient {
                                err: e,
                                retry_after: Some(Duration::from_millis(retry_delay)),
                            }
                        } else {
                            Error::Permanent(e)
                        }
                    }
                }
            })
        };
        let bf = ExponentialBackoff::default();
        backoff::retry(bf, op).map_err(|e| match e {
            Error::Permanent(ref err) => std::io::Error::new(err.kind(), err.to_string()),
            Error::Transient { ref err, .. } => std::io::Error::new(err.kind(), err.to_string()),
        })
    }
}

pub fn rm(
    path: &str,
    max_retries: c_int,
    recursive: bool,
    retry_delay: c_ulonglong,
) -> std::io::Result<()> {
    if !recursive {
        fs::remove_file(path)
    } else {
        let mut max_retries_count = AtomicI32::new(max_retries);
        let op = || {
            fs::remove_file(path).map_err(|e| {
                if max_retries != 0 {
                    let current = max_retries_count.load(Ordering::SeqCst);
                    if current == 0 {
                        return backoff::Error::permanent(e);
                    }
                    *max_retries_count.get_mut() = current - 1;
                }

                match e.kind() {
                    std::io::ErrorKind::ResourceBusy
                    | std::io::ErrorKind::FilesystemLoop
                    | std::io::ErrorKind::DirectoryNotEmpty => Error::Transient {
                        err: e,
                        retry_after: Some(Duration::from_millis(retry_delay)),
                    },
                    _ => {
                        let val = e.to_string().to_lowercase();
                        if val.contains("too many open files") {
                            Error::Transient {
                                err: e,
                                retry_after: Some(Duration::from_millis(retry_delay)),
                            }
                        } else {
                            Error::Permanent(e)
                        }
                    }
                }
            })
        };
        let bf = ExponentialBackoff::default();
        backoff::retry(bf, op).map_err(|e| match e {
            Error::Permanent(ref err) => std::io::Error::new(err.kind(), err.to_string()),
            Error::Transient { ref err, .. } => std::io::Error::new(err.kind(), err.to_string()),
        })
    }
}

pub fn stat(path: &str) -> std::io::Result<std::fs::Metadata> {
    fs::metadata(path)
}

pub fn symlink(target: &str, path: &str, _type_: &str) -> std::io::Result<()> {
    std::os::unix::fs::symlink(target, path)
}

pub fn truncate(path: &str, len: c_ulonglong) -> std::io::Result<()> {
    OpenOptions::new()
        .truncate(true)
        .write(true)
        .open(path)?
        .set_len(len)
}

pub fn unlink(path: &str) -> std::io::Result<()> {
    fs::remove_file(path)
}

// pub fn unwatchFile(filename){}

pub fn utimes(path: &str, atime: c_long, mtime: c_long) -> std::io::Result<()> {
    let path = CString::new(path)?;
    let times = [
        libc::timeval {
            tv_sec: atime,
            tv_usec: 0,
        },
        libc::timeval {
            tv_sec: mtime,
            tv_usec: 0,
        },
    ];
    let ret = unsafe { libc::utimes(path.as_ptr(), times.as_ptr()) };

    if ret == -1 {
        let last_error = std::io::Error::last_os_error();
        return Err(last_error);
    }
    Ok(())
}

// pub fn watch(){}

// pub fn watchFile(){}

pub fn write(
    fd: c_int,
    buffer: &[u8],
    offset: usize,
    length: usize,
    position: isize,
) -> std::io::Result<usize> {
    let mut file = unsafe { File::from_raw_fd(fd) };
    let new_position = file.stream_position().unwrap_or_default();
    let buffer_len = buffer.len();
    let result = if length < buffer_len {
        let tmp_buf = &buffer[offset..];
        let buf = &tmp_buf[..length];
        if position == -1 {
            file.write(buf)
        } else {
            file.write_at(buffer, position as u64)
        }
    } else if position == -1 {
        file.write(buffer)
    } else {
        file.write_at(buffer, position as u64)
    };

    let ret = match result {
        Ok(wrote) => {
            if wrote == 0 {
                return Ok(std::cmp::min(new_position as usize, wrote));
            }
            std::io::Result::Ok(wrote)
        }
        Err(error) => std::io::Result::Err(error),
    };

    let _ = file.into_raw_fd();

    ret
}

pub fn write_string(
    fd: c_int,
    string: &str,
    _encoding: &str,
    position: isize,
) -> std::io::Result<usize> {
    let mut file = unsafe { File::from_raw_fd(fd) };
    let new_position = file.stream_position().unwrap_or_default();
    let buffer = string.as_bytes();
    let result = if position == -1 {
        file.write(buffer)
    } else {
        file.write_at(buffer, position as u64)
    };

    let ret = match result {
        Ok(wrote) => {
            if wrote == 0 {
                return Ok(std::cmp::min(new_position as usize, wrote));
            }
            std::io::Result::Ok(wrote)
        }
        Err(error) => std::io::Result::Err(error),
    };

    let _ = file.into_raw_fd();

    ret
}

pub fn write_file_with_str(fd: c_int, data: &str, _encoding: &str) -> std::io::Result<()> {
    let mut file = unsafe { File::from_raw_fd(fd) };
    let ret = file.write(data.as_bytes());
    let _ = file.into_raw_fd();
    ret.map(|_| ())
}

pub fn write_file_with_bytes(fd: c_int, data: &[u8]) -> std::io::Result<()> {
    let mut file = unsafe { File::from_raw_fd(fd) };
    let ret = file.write(data);
    let _ = file.into_raw_fd();
    ret.map(|_| ())
}

pub fn write_file_with_str_from_path(
    path: &str,
    data: &str,
    _encoding: &str,
    mode: c_int,
    flag: c_int,
) -> std::io::Result<()> {
    let mut options = OpenOptions::new();
    if (flag & FILE_OPEN_OPTIONS_O_CREAT) == FILE_OPEN_OPTIONS_O_CREAT {
        options.create(true);
    }

    if (flag & FILE_OPEN_OPTIONS_O_RDONLY) == FILE_OPEN_OPTIONS_O_RDONLY {
        options.read(true);
    }

    if (flag & FILE_OPEN_OPTIONS_O_WRONLY) == FILE_OPEN_OPTIONS_O_WRONLY {
        options.write(true);
    }

    if (flag & FILE_OPEN_OPTIONS_O_APPEND) == FILE_OPEN_OPTIONS_O_APPEND {
        options.append(true);
    }

    if (flag & FILE_OPEN_OPTIONS_O_TRUNC) == FILE_OPEN_OPTIONS_O_TRUNC {
        options.truncate(true);
    }

    if (flag & FILE_OPEN_OPTIONS_O_EXCL) == FILE_OPEN_OPTIONS_O_EXCL {
        options.create_new(true);
    }

    if mode != 0 {
        options.mode(mode as u32);
    }

    let mut file = options.open(path)?;
    file.write(data.as_bytes()).map(|_| ())
}

pub fn write_file_with_bytes_from_path(
    path: &str,
    data: &[u8],
    _encoding: &str,
    mode: c_int,
    flag: c_int,
) -> std::io::Result<()> {
    let mut options = OpenOptions::new();
    if (flag & FILE_OPEN_OPTIONS_O_CREAT) == FILE_OPEN_OPTIONS_O_CREAT {
        options.create(true);
    }

    if (flag & FILE_OPEN_OPTIONS_O_RDONLY) == FILE_OPEN_OPTIONS_O_RDONLY {
        options.read(true);
    }

    if (flag & FILE_OPEN_OPTIONS_O_WRONLY) == FILE_OPEN_OPTIONS_O_WRONLY {
        options.write(true);
    }

    if (flag & FILE_OPEN_OPTIONS_O_APPEND) == FILE_OPEN_OPTIONS_O_APPEND {
        options.append(true);
    }

    if (flag & FILE_OPEN_OPTIONS_O_TRUNC) == FILE_OPEN_OPTIONS_O_TRUNC {
        options.truncate(true);
    }

    if (flag & FILE_OPEN_OPTIONS_O_EXCL) == FILE_OPEN_OPTIONS_O_EXCL {
        options.create_new(true);
    }

    if mode != 0 {
        options.mode(mode as u32);
    }
    let mut file = options.open(path)?;

    file.write(data).map(|_| ())
}

pub fn writev(fd: c_int, mut buffers: Vec<ByteBuf>, position: c_long) -> std::io::Result<usize> {
    let mut file = unsafe { File::from_raw_fd(fd) };

    if position != -1 {
        match file.seek(SeekFrom::Start(position as u64)) {
            Ok(_) => {}
            Err(error) => return std::io::Result::Err(error),
        }
    }

    let buffers: Vec<IoSlice> = buffers
        .iter_mut()
        .map(|b| IoSlice::new(b.as_slice()))
        .collect();

    file.write_vectored(buffers.as_slice())
}

pub fn writev_raw(
    fd: c_int,
    buffer: *const *const ByteBuf,
    buffer_len: usize,
    position: c_long,
) -> std::io::Result<usize> {
    let buf = unsafe { std::slice::from_raw_parts(buffer, buffer_len) };
    let mut slice_buf = Vec::with_capacity(buffer_len);
    unsafe {
        for item in buf.iter() {
            let item = &*(*item);
            slice_buf.push(ByteBuf::new(item.data, item.len))
        }
    }

    writev(fd, slice_buf, position)
}
