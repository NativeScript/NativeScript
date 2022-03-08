use std::collections::HashMap;
use std::ffi::c_void;


use jni::objects::{GlobalRef, JValue};
use jni::sys::{jint};

use jni::JavaVM;
use once_cell::sync::OnceCell;

use crate::common::{
    FILE_COPY_OPTIONS_COPYFILE_EXCL, FILE_COPY_OPTIONS_COPYFILE_FICLONE,
    FILE_COPY_OPTIONS_COPYFILE_FICLONE_FORCE,
};

pub mod fs;
pub mod prelude;

pub(crate) const FS_CONSTANTS_CLASS: &str = "org/nativescript/widgets/filesystem/Constants";
pub(crate) const FILE_SYSTEM_CLASS: &str = "org/nativescript/widgets/filesystem/FileSystem";
pub(crate) const FILE_DIRENT_CLASS: &str = "org/nativescript/widgets/filesystem/FileDirent";
pub(crate) const FILE_DIR_CLASS: &str = "org/nativescript/widgets/filesystem/FileDir";
pub(crate) const FILE_STAT_CLASS: &str = "org/nativescript/widgets/filesystem/FileStat";
pub(crate) const FILE_HANDLE_CLASS: &str = "org/nativescript/widgets/filesystem/FileHandle";
pub(crate) const FILE_WATCHER_CLASS: &str = "org/nativescript/widgets/filesystem/FileWatcher";
pub(crate) const FILE_WATCHER_EVENT_CLASS: &str =
    "org/nativescript/widgets/filesystem/FileWatcher$Event";
pub(crate) const FILE_FS_WATCH_CLASS: &str = "org/nativescript/widgets/filesystem/FsWatcher";
pub(crate) const FILE_FS_WATCH_EVENT_CLASS: &str =
    "org/nativescript/widgets/filesystem/FsWatcher$Event";

pub(crate) const STRING_CLASS: &str = "java/lang/String";
pub(crate) const BOOLEAN_CLASS: &str = "java/lang/Boolean";
pub(crate) const INTEGER_CLASS: &str = "java/lang/Integer";
pub(crate) const LONG_CLASS: &str = "java/lang/Long";
pub(crate) const FLOAT_CLASS: &str = "java/lang/Float";
pub(crate) const DOUBLE_CLASS: &str = "java/lang/Double";
pub(crate) const OBJECT_CLASS: &str = "java/lang/Object";

pub static JVM: OnceCell<JavaVM> = OnceCell::new();

pub static JVM_CLASS_CACHE: OnceCell<parking_lot::RwLock<HashMap<&'static str, GlobalRef>>> =
    OnceCell::new();

#[no_mangle]
pub extern "system" fn JNI_OnLoad(vm: JavaVM, _reserved: *const c_void) -> jint {
    android_logger::init_once(android_logger::Config::default().with_min_level(log::Level::Debug));

    if let Ok(env) = vm.get_env() {
        let clazz = env.find_class(FS_CONSTANTS_CLASS).unwrap();

        JVM_CLASS_CACHE.get_or_init(|| {
            let mut map = HashMap::new();
            map.insert(FS_CONSTANTS_CLASS, env.new_global_ref(clazz).unwrap());
            map.insert(
                FILE_SYSTEM_CLASS,
                env.new_global_ref(env.find_class(FILE_SYSTEM_CLASS).unwrap())
                    .unwrap(),
            );
            map.insert(
                FILE_DIRENT_CLASS,
                env.new_global_ref(env.find_class(FILE_DIRENT_CLASS).unwrap())
                    .unwrap(),
            );
            map.insert(
                FILE_DIR_CLASS,
                env.new_global_ref(env.find_class(FILE_DIR_CLASS).unwrap())
                    .unwrap(),
            );
            map.insert(
                FILE_STAT_CLASS,
                env.new_global_ref(env.find_class(FILE_STAT_CLASS).unwrap())
                    .unwrap(),
            );
            map.insert(
                FILE_HANDLE_CLASS,
                env.new_global_ref(env.find_class(FILE_HANDLE_CLASS).unwrap())
                    .unwrap(),
            );
            map.insert(
                FILE_WATCHER_CLASS,
                env.new_global_ref(env.find_class(FILE_WATCHER_CLASS).unwrap())
                    .unwrap(),
            );
            map.insert(
                FILE_WATCHER_EVENT_CLASS,
                env.new_global_ref(env.find_class(FILE_WATCHER_EVENT_CLASS).unwrap())
                    .unwrap(),
            );
            map.insert(
                FILE_FS_WATCH_CLASS,
                env.new_global_ref(env.find_class(FILE_FS_WATCH_CLASS).unwrap())
                    .unwrap(),
            );
            map.insert(
                FILE_FS_WATCH_EVENT_CLASS,
                env.new_global_ref(env.find_class(FILE_FS_WATCH_EVENT_CLASS).unwrap())
                    .unwrap(),
            );
            map.insert(
                STRING_CLASS,
                env.new_global_ref(env.find_class(STRING_CLASS).unwrap())
                    .unwrap(),
            );
            map.insert(
                BOOLEAN_CLASS,
                env.new_global_ref(env.find_class(BOOLEAN_CLASS).unwrap())
                    .unwrap(),
            );
            map.insert(
                INTEGER_CLASS,
                env.new_global_ref(env.find_class(INTEGER_CLASS).unwrap())
                    .unwrap(),
            );
            map.insert(
                LONG_CLASS,
                env.new_global_ref(env.find_class(LONG_CLASS).unwrap())
                    .unwrap(),
            );
            map.insert(
                FLOAT_CLASS,
                env.new_global_ref(env.find_class(FLOAT_CLASS).unwrap())
                    .unwrap(),
            );
            map.insert(
                DOUBLE_CLASS,
                env.new_global_ref(env.find_class(DOUBLE_CLASS).unwrap())
                    .unwrap(),
            );
            map.insert(
                OBJECT_CLASS,
                env.new_global_ref(env.find_class(OBJECT_CLASS).unwrap())
                    .unwrap(),
            );
            parking_lot::RwLock::new(map)
        });

        let _ = env.set_static_field(
            clazz,
            env.get_static_field_id(FS_CONSTANTS_CLASS, "O_RDONLY", "I")
                .unwrap(),
            libc::O_RDONLY.into(),
        );
        let _ = env.set_static_field(
            clazz,
            env.get_static_field_id(FS_CONSTANTS_CLASS, "O_WRONLY", "I")
                .unwrap(),
            libc::O_WRONLY.into(),
        );
        let _ = env.set_static_field(
            clazz,
            env.get_static_field_id(FS_CONSTANTS_CLASS, "O_RDWR", "I")
                .unwrap(),
            libc::O_RDWR.into(),
        );
        let _ = env.set_static_field(
            clazz,
            env.get_static_field_id(FS_CONSTANTS_CLASS, "O_CREAT", "I")
                .unwrap(),
            libc::O_CREAT.into(),
        );
        let _ = env.set_static_field(
            clazz,
            env.get_static_field_id(FS_CONSTANTS_CLASS, "O_EXCL", "I")
                .unwrap(),
            libc::O_EXCL.into(),
        );
        let _ = env.set_static_field(
            clazz,
            env.get_static_field_id(FS_CONSTANTS_CLASS, "O_NOCTTY", "I")
                .unwrap(),
            libc::O_NOCTTY.into(),
        );
        let _ = env.set_static_field(
            clazz,
            env.get_static_field_id(FS_CONSTANTS_CLASS, "O_TRUNC", "I")
                .unwrap(),
            libc::O_TRUNC.into(),
        );
        let _ = env.set_static_field(
            clazz,
            env.get_static_field_id(FS_CONSTANTS_CLASS, "O_APPEND", "I")
                .unwrap(),
            libc::O_APPEND.into(),
        );
        let _ = env.set_static_field(
            clazz,
            env.get_static_field_id(FS_CONSTANTS_CLASS, "O_DIRECTORY", "I")
                .unwrap(),
            libc::O_DIRECTORY.into(),
        );

        #[cfg(any(target_os = "android"))]
        let _ = env.set_static_field(
            clazz,
            env.get_static_field_id(FS_CONSTANTS_CLASS, "O_NOATIME", "I")
                .unwrap(),
            JValue::Int(libc::MS_NOATIME as jint),
        );

        let _ = env.set_static_field(
            clazz,
            env.get_static_field_id(FS_CONSTANTS_CLASS, "O_NOFOLLOW", "I")
                .unwrap(),
            JValue::Int(libc::O_NOFOLLOW),
        );
        let _ = env.set_static_field(
            clazz,
            env.get_static_field_id(FS_CONSTANTS_CLASS, "O_SYNC", "I")
                .unwrap(),
            JValue::Int(libc::O_SYNC),
        );
        let _ = env.set_static_field(
            clazz,
            env.get_static_field_id(FS_CONSTANTS_CLASS, "O_DSYNC", "I")
                .unwrap(),
            JValue::Int(libc::O_DSYNC),
        );
        let _ = env.set_static_field(
            clazz,
            env.get_static_field_id(FS_CONSTANTS_CLASS, "O_SYMLINK", "I")
                .unwrap(),
            JValue::Int(-1),
        );
        let _ = env.set_static_field(
            clazz,
            env.get_static_field_id(FS_CONSTANTS_CLASS, "O_DIRECT", "I")
                .unwrap(),
            JValue::Int(0x4000),
        );
        let _ = env.set_static_field(
            clazz,
            env.get_static_field_id(FS_CONSTANTS_CLASS, "O_NONBLOCK", "I")
                .unwrap(),
            JValue::Int(libc::O_NONBLOCK),
        );

        let _ = env.set_static_field(
            clazz,
            env.get_static_field_id(FS_CONSTANTS_CLASS, "F_OK", "I")
                .unwrap(),
            JValue::Int(libc::F_OK),
        );
        let _ = env.set_static_field(
            clazz,
            env.get_static_field_id(FS_CONSTANTS_CLASS, "R_OK", "I")
                .unwrap(),
            JValue::Int(libc::R_OK),
        );
        let _ = env.set_static_field(
            clazz,
            env.get_static_field_id(FS_CONSTANTS_CLASS, "W_OK", "I")
                .unwrap(),
            JValue::Int(libc::W_OK),
        );
        let _ = env.set_static_field(
            clazz,
            env.get_static_field_id(FS_CONSTANTS_CLASS, "X_OK", "I")
                .unwrap(),
            JValue::Int(libc::X_OK),
        );

        let _ = env.set_static_field(
            clazz,
            env.get_static_field_id(FS_CONSTANTS_CLASS, "COPYFILE_EXCL", "I")
                .unwrap(),
            JValue::Int(FILE_COPY_OPTIONS_COPYFILE_EXCL as jint),
        );
        let _ = env.set_static_field(
            clazz,
            env.get_static_field_id(FS_CONSTANTS_CLASS, "COPYFILE_FICLONE", "I")
                .unwrap(),
            JValue::Int(FILE_COPY_OPTIONS_COPYFILE_FICLONE as jint),
        );
        let _ = env.set_static_field(
            clazz,
            env.get_static_field_id(FS_CONSTANTS_CLASS, "COPYFILE_FICLONE_FORCE", "I")
                .unwrap(),
            JValue::Int(FILE_COPY_OPTIONS_COPYFILE_FICLONE_FORCE as jint),
        );

        let _ = env.set_static_field(
            clazz,
            env.get_static_field_id(FS_CONSTANTS_CLASS, "S_IFMT", "I")
                .unwrap(),
            JValue::Int(libc::S_IFMT as jint),
        );
        let _ = env.set_static_field(
            clazz,
            env.get_static_field_id(FS_CONSTANTS_CLASS, "S_IFREG", "I")
                .unwrap(),
            JValue::Int(libc::S_IFREG as jint),
        );
        let _ = env.set_static_field(
            clazz,
            env.get_static_field_id(FS_CONSTANTS_CLASS, "S_IFDIR", "I")
                .unwrap(),
            JValue::Int(libc::S_IFDIR as jint),
        );
        let _ = env.set_static_field(
            clazz,
            env.get_static_field_id(FS_CONSTANTS_CLASS, "S_IFCHR", "I")
                .unwrap(),
            JValue::Int(libc::S_IFCHR as jint),
        );
        let _ = env.set_static_field(
            clazz,
            env.get_static_field_id(FS_CONSTANTS_CLASS, "S_IFBLK", "I")
                .unwrap(),
            JValue::Int(libc::S_IFBLK as jint),
        );
        let _ = env.set_static_field(
            clazz,
            env.get_static_field_id(FS_CONSTANTS_CLASS, "S_IFIFO", "I")
                .unwrap(),
            JValue::Int(libc::S_IFIFO as jint),
        );
        let _ = env.set_static_field(
            clazz,
            env.get_static_field_id(FS_CONSTANTS_CLASS, "S_IFLNK", "I")
                .unwrap(),
            JValue::Int(libc::S_IFLNK as jint),
        );
        let _ = env.set_static_field(
            clazz,
            env.get_static_field_id(FS_CONSTANTS_CLASS, "S_IFSOCK", "I")
                .unwrap(),
            JValue::Int(libc::S_IFSOCK as jint),
        );

        let _ = env.set_static_field(
            clazz,
            env.get_static_field_id(FS_CONSTANTS_CLASS, "S_IRWXU", "I")
                .unwrap(),
            JValue::Int(libc::S_IRWXU as jint),
        );
        let _ = env.set_static_field(
            clazz,
            env.get_static_field_id(FS_CONSTANTS_CLASS, "S_IRUSR", "I")
                .unwrap(),
            JValue::Int(libc::S_IRUSR as jint),
        );
        let _ = env.set_static_field(
            clazz,
            env.get_static_field_id(FS_CONSTANTS_CLASS, "S_IWUSR", "I")
                .unwrap(),
            JValue::Int(libc::S_IWUSR as jint),
        );
        let _ = env.set_static_field(
            clazz,
            env.get_static_field_id(FS_CONSTANTS_CLASS, "S_IXUSR", "I")
                .unwrap(),
            JValue::Int(libc::S_IXUSR as jint),
        );
        let _ = env.set_static_field(
            clazz,
            env.get_static_field_id(FS_CONSTANTS_CLASS, "S_IRWXG", "I")
                .unwrap(),
            JValue::Int(libc::S_IRWXG as jint),
        );
        let _ = env.set_static_field(
            clazz,
            env.get_static_field_id(FS_CONSTANTS_CLASS, "S_IRGRP", "I")
                .unwrap(),
            JValue::Int(libc::S_IRGRP as jint),
        );
        let _ = env.set_static_field(
            clazz,
            env.get_static_field_id(FS_CONSTANTS_CLASS, "S_IWGRP", "I")
                .unwrap(),
            JValue::Int(libc::S_IWGRP as jint),
        );
        let _ = env.set_static_field(
            clazz,
            env.get_static_field_id(FS_CONSTANTS_CLASS, "S_IXGRP", "I")
                .unwrap(),
            JValue::Int(libc::S_IXGRP as jint),
        );
        let _ = env.set_static_field(
            clazz,
            env.get_static_field_id(FS_CONSTANTS_CLASS, "S_IRWXO", "I")
                .unwrap(),
            JValue::Int(libc::S_IRWXO as jint),
        );
        let _ = env.set_static_field(
            clazz,
            env.get_static_field_id(FS_CONSTANTS_CLASS, "S_IROTH", "I")
                .unwrap(),
            JValue::Int(libc::S_IROTH as jint),
        );
        let _ = env.set_static_field(
            clazz,
            env.get_static_field_id(FS_CONSTANTS_CLASS, "S_IWOTH", "I")
                .unwrap(),
            JValue::Int(libc::S_IWOTH as jint),
        );
        let _ = env.set_static_field(
            clazz,
            env.get_static_field_id(FS_CONSTANTS_CLASS, "S_IXOTH", "I")
                .unwrap(),
            JValue::Int(libc::S_IXOTH as jint),
        );
    }

    JVM.get_or_init(|| vm);

    jni::sys::JNI_VERSION_1_6
}

/*


#[no_mangle]
pub extern "system" fn Java_org_nativescript_widgets_FileSystem_00024FileHandle_nativeClose(
    _env: JNIEnv,
    _: JClass,
    fh: jlong,
) {
    let handle: *mut FileHandle = fh as _;
    if !handle.is_null() {
        let mut handle = unsafe { Box::from_raw(handle) };
        handle.close();
    }
}

#[no_mangle]
pub extern "system" fn Java_org_nativescript_widgets_FileSystem_00024FileHandle_nativeAppend(
    env: JNIEnv,
    _: JClass,
    ofh: jlong,
    ifh: jlong,
) {
    let input_handle: *mut FileHandle = ifh as _;
    let output_handle: *mut FileHandle = ofh as _;
    if !input_handle.is_null() && !output_handle.is_null() {
        let mut input = unsafe { &mut *input_handle };
        let mut output = unsafe { &mut *output_handle };
        let result = output.append(input);
        if let Err(error) = result {
            env.throw(error.to_string());
        }
    }
}

#[no_mangle]
pub extern "system" fn Java_org_nativescript_widgets_FileSystem_00024FileHandle_nativeAppendBytes(
    env: JNIEnv,
    _: JClass,
    fh: jlong,
    data: jbyteArray,
) {
    let handle: *mut FileHandle = fh as _;
    if !handle.is_null() {
        let mut handle = unsafe { &mut *handle };
        if let Ok(array) = env.get_primitive_array_critical(data, ReleaseMode::NoCopyBack) {
            let size = array.size().unwrap_or_default() as usize;
            let buf = unsafe { std::slice::from_raw_parts_mut(array.as_ptr() as *mut u8, size) };
            let result = handle.append_bytes(buf);
            if let Err(error) = result {
                env.throw(error.to_string());
            }
        }
    }
}

#[no_mangle]
pub extern "system" fn Java_org_nativescript_widgets_FileSystem_00024FileHandle_nativeAppendBuffer(
    env: JNIEnv,
    _: JClass,
    fh: jlong,
    data: JByteBuffer,
) {
    let handle: *mut FileHandle = fh as _;
    if !handle.is_null() {
        let mut handle = unsafe { &mut *handle };
        if let Ok(buf) = env.get_direct_buffer_address(data) {
            let result = handle.append_bytes(buf);
            if let Err(error) = result {
                env.throw(error.to_string());
            }
        }
    }
}

#[no_mangle]
pub extern "system" fn Java_org_nativescript_widgets_FileSystem_00024FileHandle_nativeAppendString(
    env: JNIEnv,
    _: JClass,
    fh: jlong,
    data: JString,
) {
    let handle: *mut FileHandle = fh as _;
    if !handle.is_null() {
        let mut handle = unsafe { &mut *handle };
        if let Ok(string) = env.get_string(data) {
            let result = handle.append_str(string.to_string_lossy().as_ref());

            if let Err(error) = result {
                env.throw(error.to_string());
            }
        }
    }
}

#[no_mangle]
pub extern "system" fn Java_org_nativescript_widgets_FileSystem_00024FileHandle_nativeRead(
    env: JNIEnv,
    _: JClass,
    fh: jlong,
    buffer: jbyteArray,
    offset: jlong,
    length: jlong,
    position: jlong,
) -> jlong {
    let handle: *mut FileHandle = fh as _;
    if !handle.is_null() {
        let mut handle = unsafe { &mut *handle };
        if let Ok(array) = env.get_primitive_array_critical(buffer, ReleaseMode::CopyBack) {
            let size = array.size().unwrap_or_default() as usize;
            let buf = unsafe { std::slice::from_raw_parts_mut(array.as_ptr() as *mut u8, size) };
            return match handle.read(buf, offset as usize, length as usize, position as isize) {
                Ok(read) => read as i64,
                Err(error) => {
                    env.throw(error.to_string());
                    0
                }
            };
        }
    }
    return 0;
}

#[no_mangle]
pub extern "system" fn Java_org_nativescript_widgets_FileSystem_00024FileHandle_nativeReadBuffer(
    env: JNIEnv,
    _: JClass,
    fh: jlong,
    buffer: JByteBuffer,
    offset: jlong,
    length: jlong,
    position: jlong,
) -> jlong {
    let handle: *mut FileHandle = fh as _;
    if !handle.is_null() {
        let mut handle = unsafe { &mut *handle };
        if let Ok(buf) = env.get_direct_buffer_address(buffer) {
            return match handle.read(buf, offset as usize, length as usize, position as isize) {
                Ok(read) => read as i64,
                Err(error) => {
                    env.throw(error.to_string());
                    0
                }
            };
        }
    }
    return 0;
}

#[no_mangle]
pub extern "system" fn Java_org_nativescript_widgets_FileSystem_00024FileHandle_nativeStat(
    env: JNIEnv,
    _: JClass,
    fh: jlong,
) -> jobject {
    let json_class = env.find_class(JSON_CLASS).unwrap();
    let json = env.new_object(json_class, SIG_OBJECT_CTOR, &[]).unwrap();
    let handle: *mut FileHandle = fh as _;
    if !handle.is_null() {
        let handle = unsafe { &mut *handle };
        match handle.stat() {
            Ok(metadata) => {
                put_long(env, json, "dev", metadata.dev() as i64);
                put_long(env, json, "ino", metadata.ino() as i64);
                put_int(env, json, "mode", metadata.mode() as i32);
                put_long(env, json, "nlink", metadata.nlink() as i64);

                put_int(env, json, "uid", metadata.uid() as i32);
                put_int(env, json, "gid", metadata.gid() as i32);
                put_long(env, json, "rdev", metadata.rdev() as i64);
                put_long(env, json, "size", metadata.len() as i64);

                put_long(env, json, "blksize", metadata.blksize() as i64);

                put_long(env, json, "blocks", metadata.blocks() as i64);

                put_double(
                    env,
                    json,
                    "atimeMs",
                    (metadata.atime_nsec() / 1000000) as f64,
                );

                put_double(
                    env,
                    json,
                    "mtimeMs",
                    (metadata.mtime_nsec() / 1000000) as f64,
                );

                put_double(
                    env,
                    json,
                    "ctimeMs",
                    (metadata.ctime_nsec() / 1000000) as f64,
                );

                match metadata.created() {
                    Ok(time) => match time.duration_since(std::time::SystemTime::UNIX_EPOCH) {
                        Ok(duration) => {
                            put_double(env, json, "birthtimeMs", duration.as_millis() as f64);
                            put_double(env, json, "birthtime", duration.as_secs() as f64);
                        }
                        _ => {}
                    },
                    _ => {}
                }

                put_double(env, json, "atime", (metadata.atime()) as f64);

                put_double(env, json, "mtime", (metadata.mtime()) as f64);

                put_double(env, json, "ctime", (metadata.ctime()) as f64);
            }
            Err(_) => {}
        }
    }
    return json.into_inner();
}

fn put_string(env: JNIEnv, json: JObject, key: &str, value: &str) {
    let mut args = [JObject::null().into(); 2];
    args[0] = env.new_string(key).unwrap().into();
    args[1] = env.new_string(value).unwrap().into();

    env.call_method(
        json,
        "put",
        "(Ljava/lang/String;Ljava/lang/String)Lorg/json/JSONObject;",
        args.as_slice(),
    );
}

fn put_int(env: JNIEnv, json: JObject, key: &str, value: i32) {
    let mut args = [JObject::null().into(); 2];
    args[0] = env.new_string(key).unwrap().into();
    args[1] = JValue::Int(value);

    env.call_method(
        json,
        "put",
        "(Ljava/lang/String;I)Lorg/json/JSONObject;",
        args.as_slice(),
    );
}

fn put_long(env: JNIEnv, json: JObject, key: &str, value: i64) {
    let mut args = [JObject::null().into(); 2];
    args[0] = env.new_string(key).unwrap().into();
    args[1] = JValue::Long(value);

    env.call_method(
        json,
        "put",
        "(Ljava/lang/String;J)Lorg/json/JSONObject;",
        args.as_slice(),
    );
}

fn put_double(env: JNIEnv, json: JObject, key: &str, value: f64) {
    let mut args = [JObject::null().into(); 2];
    args[0] = env.new_string(key).unwrap().into();
    args[1] = JValue::Double(value);

    env.call_method(
        json,
        "put",
        "(Ljava/lang/String;D)Lorg/json/JSONObject;",
        args.as_slice(),
    );
}

#[no_mangle]
pub extern "system" fn Java_org_nativescript_widgets_FileSystem_00024FileHandle_nativeDataSync(
    env: JNIEnv,
    _: JClass,
    fh: jlong,
) {
    let handle: *mut FileHandle = fh as _;
    if !handle.is_null() {
        let handle = unsafe { &mut *handle };
        let result = handle.datasync();

        if let Err(error) = result {
            env.throw(error.to_string());
        }
    }
}

#[no_mangle]
pub extern "system" fn Java_org_nativescript_widgets_FileSystem_00024FileHandle_nativeSync(
    env: JNIEnv,
    _: JClass,
    fh: jlong,
) {
    let handle: *mut FileHandle = fh as _;
    if !handle.is_null() {
        let handle = unsafe { &mut *handle };
        let result = handle.sync();

        if let Err(error) = result {
            env.throw(error.to_string());
        }
    }
}

#[no_mangle]
pub extern "system" fn Java_org_nativescript_widgets_FileSystem_00024FileHandle_nativeDispose(
    _: JNIEnv,
    _: JClass,
    fh: jlong,
) {
    let handle: *mut FileHandle = fh as _;
    if !handle.is_null() {
        unsafe {
            Box::from_raw(handle);
        }
    }
}

#[no_mangle]
pub extern "system" fn Java_org_nativescript_widgets_FileSystem_00024FileHandle_nativeFutimes(
    env: JNIEnv,
    _: JClass,
    fh: jlong,
    atime: jlong,
    mtime: jlong,
) {
    let handle: *mut FileHandle = fh as _;
    if !handle.is_null() {
        let handle = unsafe { &mut *handle };
        let result = handle.futimes(atime, mtime);

        if let Err(error) = result {
            env.throw(error.to_string());
        }
    }
}

#[no_mangle]
pub extern "system" fn Java_org_nativescript_widgets_FileSystem_00024FileHandle_nativeCopyFile(
    env: JNIEnv,
    _: JClass,
    src: JString,
    dest: JString,
) {
    let result = FileHandle::copy_file(
        get_string_opt(env, src, "").as_ref(),
        get_string_opt(env, dest, "").as_ref(),
    );

    if let Err(error) = result {
        env.throw(error.to_string());
    }
}

fn get_string_opt<'a>(env: JNIEnv<'a>, string: JString<'a>, opt: &'a str) -> String {
    if let Ok(string) = env.get_string(string) {
        string.to_string_lossy().into()
    } else {
        opt.into()
    }
}

#[no_mangle]
pub extern "system" fn Java_org_nativescript_widgets_FileSystem_00024FileHandle_nativeWrite(
    env: JNIEnv,
    _: JClass,
    ofh: jlong,
    ifh: jlong,
) {
    let input_handle: *mut FileHandle = ifh as _;
    let output_handle: *mut FileHandle = ofh as _;
    if !input_handle.is_null() && !output_handle.is_null() {
        let mut input = unsafe { &mut *input_handle };
        let mut output = unsafe { &mut *output_handle };
        let result = output.write(input);
        if let Err(error) = result {
            env.throw(error.to_string());
        }
    }
}

#[no_mangle]
pub extern "system" fn Java_org_nativescript_widgets_FileSystem_00024FileHandle_nativeWriteBytes(
    env: JNIEnv,
    _: JClass,
    fh: jlong,
    data: jbyteArray,
) {
    let handle: *mut FileHandle = fh as _;
    if !handle.is_null() {
        let mut handle = unsafe { &mut *handle };
        if let Ok(array) = env.get_primitive_array_critical(data, ReleaseMode::NoCopyBack) {
            let size = array.size().unwrap_or_default() as usize;
            let buf = unsafe { std::slice::from_raw_parts_mut(array.as_ptr() as *mut u8, size) };
            let result = handle.write_bytes(buf);
            if let Err(error) = result {
                env.throw(error.to_string());
            }
        }
    }
}

#[no_mangle]
pub extern "system" fn Java_org_nativescript_widgets_FileSystem_00024FileHandle_nativeWriteBuffer(
    env: JNIEnv,
    _: JClass,
    fh: jlong,
    data: JByteBuffer,
) {
    let handle: *mut FileHandle = fh as _;
    if !handle.is_null() {
        let mut handle = unsafe { &mut *handle };
        if let Ok(buf) = env.get_direct_buffer_address(data) {
            let result = handle.write_bytes(buf);
            if let Err(error) = result {
                env.throw(error.to_string());
            }
        }
    }
}

#[no_mangle]
pub extern "system" fn Java_org_nativescript_widgets_FileSystem_00024FileHandle_nativeWriteString(
    env: JNIEnv,
    _: JClass,
    fh: jlong,
    data: JString,
) {
    let handle: *mut FileHandle = fh as _;
    if !handle.is_null() {
        let mut handle = unsafe { &mut *handle };
        if let Ok(string) = env.get_string(data) {
            let result = handle.write_str(string.to_string_lossy().as_ref());

            if let Err(error) = result {
                env.throw(error.to_string());
            }
        }
    }
}

#[no_mangle]
pub extern "system" fn Java_org_nativescript_widgets_FileSystem_00024FileHandle_nativeUnlink(
    env: JNIEnv,
    _: JClass,
    path: JString,
) {
    if let Ok(string) = env.get_string(path) {
        let result = FileHandle::unlink(string.to_string_lossy().as_ref());

        if let Err(error) = result {
            env.throw(error.to_string());
        }
    }
}
*/
