use crate::common::fs::file_stat::FileStat;

pub fn handle_meta(metadata: &std::fs::Metadata) -> FileStat {
    use std::os::unix::prelude::*;

    let mut stat = FileStat {
        dev: metadata.dev() as i64,
        ino: metadata.ino() as i64,
        mode: metadata.mode() as i32,
        nlink: metadata.nlink() as i64,
        uid: metadata.uid() as i32,
        gid: metadata.gid() as i32,
        rdev: metadata.rdev() as i64,
        size: metadata.size() as i64,
        blksize: metadata.blksize() as i64,
        blocks: metadata.blocks() as i64,
        atimeMs: (metadata.atime_nsec() / 1000000) as f64,
        mtimeMs: (metadata.mtime_nsec() / 1000000) as f64,
        ctimeMs: (metadata.ctime_nsec() / 1000000) as f64,
        ..Default::default()
    };

    if let Ok(time) = metadata.created() {
        if let Ok(duration) = time.duration_since(std::time::SystemTime::UNIX_EPOCH) {
            stat.birthtimeMs = duration.as_millis() as f64;
            stat.birthtime = duration.as_secs() as f64;
        }
    }

    stat.atime = metadata.atime() as f64;
    stat.mtime = metadata.mtime() as f64;
    stat.ctime = metadata.ctime() as f64;

    let ft = metadata.file_type();
    stat.isBlockDevice = ft.is_block_device();
    stat.isCharacterDevice = ft.is_char_device();
    stat.isDirectory = ft.is_dir();
    stat.isFIFO = ft.is_fifo();
    stat.isFile = ft.is_file();
    stat.isSocket = ft.is_socket();
    stat.isSymbolicLink = ft.is_symlink();
    stat
}
