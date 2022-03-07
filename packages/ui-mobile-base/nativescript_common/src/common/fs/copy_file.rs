use std::io;
use std::path::Path;

use libc::c_uint;

#[cfg(any(target_os = "android"))]
pub fn copy_file(from: &Path, to: &Path, mode: c_uint) -> io::Result<()> {
    use crate::common::{FILE_COPY_OPTIONS_COPYFILE_EXCL, FILE_COPY_OPTIONS_COPYFILE_FICLONE};
    use std::fs;
    use std::os::unix::io::AsRawFd;

    macro_rules! IOCTL_FICLONE {
        () => {
            0x40049409
        };
    }

    let src = fs::File::open(&from)?;
    let mut options = fs::OpenOptions::new();
    options.write(true);

    if (mode & FILE_COPY_OPTIONS_COPYFILE_EXCL) == FILE_COPY_OPTIONS_COPYFILE_EXCL {
        options.create_new(true);
    }

    let dest = options.open(&to)?;

    let ret = unsafe {
        // http://man7.org/linux/man-pages/man2/ioctl_ficlonerange.2.html
        libc::ioctl(dest.as_raw_fd(), IOCTL_FICLONE!(), src.as_raw_fd())
    };

    if ret == -1 {
        if (mode & FILE_COPY_OPTIONS_COPYFILE_FICLONE) == FILE_COPY_OPTIONS_COPYFILE_FICLONE {
            fs::copy(from, to).map(|_| ())
        } else {
            let err = io::Error::last_os_error();
            // remove the empty file that was created.
            let _ = fs::remove_file(to);
            Err(err)
        }
    } else {
        Ok(())
    }
}

#[cfg(any(target_os = "macos", target_os = "ios"))]
pub fn copy_file(from: &Path, to: &Path, flags: c_uint) -> io::Result<()> {
    use crate::common::FILE_COPY_OPTIONS_COPYFILE_FICLONE_FORCE;
    use crate::common::{FILE_COPY_OPTIONS_COPYFILE_EXCL, FILE_COPY_OPTIONS_COPYFILE_FICLONE};
    use std::ffi::c_void;
    use std::ffi::CString;
    use std::os::unix::ffi::OsStrExt;
    fn cstr(path: &Path) -> io::Result<CString> {
        Ok(CString::new(path.as_os_str().as_bytes())?)
    }

    const COPYFILE_EXCL: libc::c_int = 1 << 17;
    const COPYFILE_CLONE: libc::c_int = 1 << 24;
    const COPYFILE_CLONE_FORCE: libc::c_int = 1 << 25;

    let mut mode = 0;

    if (flags & FILE_COPY_OPTIONS_COPYFILE_EXCL) == FILE_COPY_OPTIONS_COPYFILE_EXCL {
        mode |= COPYFILE_EXCL;
    }

    if (flags & FILE_COPY_OPTIONS_COPYFILE_FICLONE) == FILE_COPY_OPTIONS_COPYFILE_FICLONE {
        mode |= COPYFILE_CLONE;
    }

    if (flags & FILE_COPY_OPTIONS_COPYFILE_FICLONE_FORCE)
        == FILE_COPY_OPTIONS_COPYFILE_FICLONE_FORCE
    {
        mode |= COPYFILE_CLONE_FORCE;
    }

    extern "C" {
        // http://www.manpagez.com/man/2/clonefileat/
        // https://github.com/apple/darwin-xnu/blob/0a798f6738bc1db01281fc08ae024145e84df927/bsd/sys/clonefile.h
        // TODO We need weak linkage here (OSX > 10.12, iOS > 10.0), otherwise compilation will fail on older versions
        fn copyfile(
            src: *const libc::c_char,
            dest: *const libc::c_char,
            state: *const c_void,
            flags: libc::c_int,
        ) -> libc::c_int;
    }

    let src = cstr(from)?;
    let dest = cstr(to)?;

    let ret = unsafe { copyfile(src.as_ptr(), dest.as_ptr(), std::ptr::null(), mode) };

    if ret == -1 {
        Err(io::Error::last_os_error())
    } else {
        Ok(())
    }
}
