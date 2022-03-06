use std::ptr::NonNull;

use jni::objects::{JObject, JValue};
use jni::sys::jobject;
use jni::JNIEnv;
use libc::stat;

use crate::android::prelude::*;
use crate::android::FILE_STAT_CLASS;
use crate::common::fs::file_stat::FileStat;

pub fn build_stat<'a>(env: &JNIEnv<'a>, stat: FileStat) -> JObject<'a> {
    let clazz = find_class(FILE_STAT_CLASS).unwrap();
    let object = env.new_object(clazz, "()V", &[]).unwrap();
    let _ = env.set_field(object, "dev", "J", stat.dev.into());
    let _ = env.set_field(object, "ino", "J", stat.ino.into());
    let _ = env.set_field(object, "mode", "I", stat.mode.into());
    let _ = env.set_field(object, "nlink", "J", stat.nlink.into());

    let _ = env.set_field(object, "uid", "I", stat.mode.into());
    let _ = env.set_field(object, "gid", "I", stat.gid.into());

    let _ = env.set_field(object, "rdev", "J", stat.rdev.into());
    let _ = env.set_field(object, "size", "J", stat.size.into());
    let _ = env.set_field(object, "blksize", "J", stat.blksize.into());
    let _ = env.set_field(object, "blocks", "J", stat.blocks.into());

    let _ = env.set_field(object, "atimeMs", "D", stat.atimeMs.into());
    let _ = env.set_field(object, "mtimeMs", "D", stat.mtimeMs.into());
    let _ = env.set_field(object, "ctimeMs", "D", stat.ctimeMs.into());
    let _ = env.set_field(object, "birthtimeMs", "D", stat.birthtimeMs.into());

    let _ = env.set_field(object, "birthtime", "D", stat.birthtime.into());
    let _ = env.set_field(object, "atime", "D", stat.atime.into());
    let _ = env.set_field(object, "mtime", "D", stat.mtime.into());
    let _ = env.set_field(object, "ctime", "D", stat.ctime.into());

    let _ = env.set_field(
        object,
        "isBlockDevice",
        "Z",
        to_jboolean(stat.isBlockDevice).into(),
    );
    let _ = env.set_field(
        object,
        "isCharacterDevice",
        "Z",
        to_jboolean(stat.isCharacterDevice).into(),
    );
    let _ = env.set_field(
        object,
        "isDirectory",
        "Z",
        to_jboolean(stat.isDirectory).into(),
    );
    let _ = env.set_field(object, "isFIFO", "Z", to_jboolean(stat.isFIFO).into());
    let _ = env.set_field(object, "isFile", "Z", to_jboolean(stat.isFile).into());
    let _ = env.set_field(object, "isSocket", "Z", to_jboolean(stat.isSocket).into());
    let _ = env.set_field(
        object,
        "isSymbolicLink",
        "Z",
        to_jboolean(stat.isSymbolicLink).into(),
    );
    object
}

pub fn build_stat_op<'a>(env: &JNIEnv<'a>, stat: Option<NonNull<FileStat>>) -> JObject<'a> {
    stat.map(|s| unsafe { *Box::from_raw(s.as_ptr()) })
        .map_or(JObject::null(), |stat| build_stat(env, stat))
}
