#[allow(non_snake_case)]
#[repr(C)]
#[derive(Debug, Clone, Copy)]
pub struct FileStat {
    pub dev: i64,
    pub ino: i64,
    pub mode: i32,
    pub nlink: i64,
    pub uid: i32,
    pub gid: i32,
    pub rdev: i64,
    pub size: i64,
    pub blksize: i64,
    pub blocks: i64,
    pub atimeMs: f64,
    pub mtimeMs: f64,
    pub ctimeMs: f64,
    pub birthtimeMs: f64,
    pub birthtime: f64,
    pub atime: f64,
    pub mtime: f64,
    pub ctime: f64,
    pub isBlockDevice: bool,
    pub isCharacterDevice: bool,
    pub isDirectory: bool,
    pub isFIFO: bool,
    pub isFile: bool,
    pub isSocket: bool,
    pub isSymbolicLink: bool,
}

impl Default for FileStat {
    fn default() -> Self {
        Self {
            dev: 0,
            ino: 0,
            mode: 0,
            nlink: 0,
            uid: 0,
            gid: 0,
            rdev: 0,
            size: 0,
            blksize: 0,
            blocks: 0,
            atimeMs: 0.0,
            mtimeMs: 0.0,
            ctimeMs: 0.0,
            birthtimeMs: 0.0,
            birthtime: 0.0,
            atime: 0.0,
            mtime: 0.0,
            ctime: 0.0,
            isBlockDevice: false,
            isCharacterDevice: false,
            isDirectory: false,
            isFIFO: false,
            isFile: false,
            isSocket: false,
            isSymbolicLink: false,
        }
    }
}

#[no_mangle]
pub extern "C" fn native_dispose_file_stat(stat: *mut FileStat) {
    if !stat.is_null() {
        let _ = unsafe { Box::from_raw(stat) };
    }
}
