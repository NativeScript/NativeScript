use std::path::PathBuf;
use std::sync::Arc;

use jni::objects::{JByteBuffer, JClass, JObject, JString, JValue, ReleaseMode};
use jni::sys::{jboolean, jbyteArray, jint, jlong, jobjectArray, JNI_TRUE};
use jni::JNIEnv;
use libc::{c_int, c_uint, c_ushort};

use crate::android::prelude::*;
use crate::android::{FILE_SYSTEM_CLASS, JVM};
use crate::common::fs;
pub use crate::common::fs::a_sync::FileWatchEvent;
pub use crate::common::fs::a_sync::WatchEvent;
use crate::common::fs::a_sync::{runtime, AsyncClosure};
use crate::common::fs::file_dir::FileDir;
use crate::common::fs::file_stat::FileStat;
use crate::common::{ByteBuf, ByteBufMut};

use super::file_dir::build_dir;
use super::file_dirent::{build_dirents, build_dirents_paths};

#[derive(Hash)]
pub(crate) struct AsyncCallbackInner {
    inner: isize,
}

impl AsyncCallbackInner {
    pub(crate) fn inner(&self) -> jni::objects::GlobalRef {
        unsafe { (&*(self.inner as *mut jni::objects::GlobalRef)).clone() }
    }
}

impl Drop for AsyncCallbackInner {
    fn drop(&mut self) {
        let _ = unsafe { Box::from_raw(self.inner as *mut jni::objects::GlobalRef) };
    }
}

#[derive(Hash)]
pub struct AsyncCallback {
    pub(crate) inner: AsyncCallbackInner,
}

impl AsyncCallback {
    pub fn new(callback: jni::objects::GlobalRef) -> Self {
        Self {
            inner: AsyncCallbackInner {
                inner: Box::into_raw(Box::new(callback)) as _,
            },
        }
    }

    pub fn on_success(&self, result: JValue) {
        if let Some(jvm) = JVM.get() {
            let env = jvm.attach_current_thread().unwrap();
            let _ = env.call_method(
                self.inner.inner().as_obj(),
                "onSuccess",
                "(Ljava/lang/Object;)V",
                &[result],
            );
        }
    }

    pub fn on_error(&self, result: JValue) {
        if let Some(jvm) = JVM.get() {
            let env = jvm.attach_current_thread().unwrap();
            let _ = env.call_method(
                self.inner.inner().as_obj(),
                "onError",
                "(Ljava/lang/Object;)V",
                &[result],
            );
        }
    }

    pub fn clone_from_ptr(ptr: *const AsyncCallback) -> Arc<AsyncCallback> {
        unsafe {
            Arc::increment_strong_count(ptr);
        }
        unsafe { Arc::from_raw(ptr) }
    }

    pub fn into_arc(self) -> Arc<AsyncCallback> {
        Arc::new(self)
    }
}

impl PartialEq for AsyncCallback {
    fn eq(&self, other: &Self) -> bool {
        self.inner
            .inner()
            .as_obj()
            .eq(&other.inner.inner().as_obj())
    }
}

impl Eq for AsyncCallback {}

#[no_mangle]
pub extern "system" fn Java_org_nativescript_widgets_filesystem_FileSystem_disposeByteBufMut(
    _env: JNIEnv,
    _: JClass,
    buf: jlong,
) {
    let buf: *mut ByteBufMut = buf as _;
    if !buf.is_null() {
        let _ = unsafe { Box::from_raw(buf) };
    }
}

#[no_mangle]
pub extern "system" fn Java_org_nativescript_widgets_filesystem_FileSystem_nativeAccess(
    _: JNIEnv,
    _: JClass,
    path: JString,
    mode: jint,
    callback: jlong,
) {
    let callback = callback as *const AsyncCallback;
    let on_success = AsyncCallback::clone_from_ptr(callback);
    let callback = AsyncClosure::<(), std::io::Error>::new(Box::new(move |_, error| {
        if let Some(error) = error {
            on_success.on_error(jni::objects::JValue::Object(
                error_to_jstring(error).as_obj(),
            ))
        } else {
            on_success.on_success(jni::objects::JObject::null().into())
        }
    }))
    .into_arc();
    fs::a_sync::access(get_str(path, "").as_ref(), mode, callback);
}

#[no_mangle]
pub extern "system" fn Java_org_nativescript_widgets_filesystem_FileSystem_nativeAppendFileWithBytes(
    env: JNIEnv,
    _: JClass,
    fd: jint,
    bytes: jbyteArray,
    callback: jlong,
) {
    nativeAppendFileWithBytes(env, fd, bytes, callback);
}

pub(crate) fn nativeAppendFileWithBytes(env: JNIEnv, fd: jint, bytes: jbyteArray, callback: jlong) {
    let callback = callback as *const AsyncCallback;
    let callback = AsyncCallback::clone_from_ptr(callback);
    let bytes = env.new_global_ref(bytes).unwrap();
    runtime().spawn(async move {
        let jvm = JVM.get().unwrap();
        let env = jvm.attach_current_thread().unwrap();
        let data = env
            .get_primitive_array_critical(bytes.as_obj().into_inner(), ReleaseMode::NoCopyBack)
            .unwrap();
        let bytes = unsafe {
            std::slice::from_raw_parts_mut(
                data.as_ptr() as *mut u8,
                data.size().unwrap_or_default() as usize,
            )
        };
        match fs::sync::append_file_with_bytes(fd, bytes) {
            Ok(_) => {
                // force drop of array to enable jni usage
                drop(data);
                callback.on_success(jni::objects::JValue::Object(jni::objects::JObject::null()))
            }
            Err(error) => {
                // force drop of array to enable jni usage
                drop(data);
                callback.on_error(jni::objects::JValue::Object(
                    error_to_jstring(error).as_obj(),
                ))
            }
        }
    });
}

#[no_mangle]
pub extern "system" fn Java_org_nativescript_widgets_filesystem_FileSystem_nativeAppendFileWithString(
    _: JNIEnv,
    _: JClass,
    fd: jint,
    data: JString,
    callback: jlong,
) {
    nativeAppendFileWithString(fd, data, callback);
}

pub(crate) fn nativeAppendFileWithString(fd: jint, data: JString, callback: jlong) {
    let callback = callback as *const AsyncCallback;
    let on_success = AsyncCallback::clone_from_ptr(callback);
    let callback = AsyncClosure::<(), std::io::Error>::new(Box::new(move |_, error| {
        if let Some(error) = error {
            on_success.on_error(jni::objects::JValue::Object(
                error_to_jstring(error).as_obj(),
            ))
        } else {
            on_success.on_success(jni::objects::JObject::null().into())
        }
    }))
    .into_arc();
    let data = get_str(data, "");
    fs::a_sync::append_file_with_str(fd, &data, callback);
}

#[no_mangle]
pub extern "system" fn Java_org_nativescript_widgets_filesystem_FileSystem_nativeAppendFileWithPathBytes(
    env: JNIEnv,
    _: JClass,
    path: JString,
    bytes: jbyteArray,
    mode: jint,
    flags: jint,
    callback: jlong,
) {
    let callback = callback as *const AsyncCallback;
    let callback = AsyncCallback::clone_from_ptr(callback);
    let bytes = env.new_global_ref(bytes).unwrap();
    let path = env.new_global_ref(path).unwrap();
    runtime().spawn(async move {
        let jvm = JVM.get().unwrap();
        let env = jvm.attach_current_thread().unwrap();
        let data = env
            .get_primitive_array_critical(bytes.as_obj().into_inner(), ReleaseMode::NoCopyBack)
            .unwrap();
        let data = unsafe {
            std::slice::from_raw_parts_mut(
                data.as_ptr() as *mut u8,
                data.size().unwrap_or_default() as usize,
            )
        };
        match fs::sync::append_file_with_path_bytes(
            get_str(JString::from(path.as_obj()), "").as_ref(),
            data,
            mode,
            flags,
        ) {
            Ok(_) => {
                // force drop of array to enable jni usage
                drop(data);
                callback.on_success(jni::objects::JValue::Object(jni::objects::JObject::null()))
            }
            Err(error) => {
                // force drop of array to enable jni usage
                drop(data);
                callback.on_error(jni::objects::JValue::Object(
                    error_to_jstring(error).as_obj(),
                ))
            }
        }
    });
}

#[no_mangle]
pub extern "system" fn Java_org_nativescript_widgets_filesystem_FileSystem_nativeAppendFileWithPathString(
    _: JNIEnv,
    _: JClass,
    path: JString,
    data: JString,
    mode: jint,
    flags: jint,
    callback: jlong,
) {
    let callback = callback as *const AsyncCallback;
    let path = get_str(path, "");
    let data = get_str(data, "");
    let on_success = AsyncCallback::clone_from_ptr(callback);
    let callback = AsyncClosure::<(), std::io::Error>::new(Box::new(move |_, error| {
        if let Some(error) = error {
            on_success.on_error(jni::objects::JValue::Object(
                error_to_jstring(error).as_obj(),
            ))
        } else {
            on_success.on_success(jni::objects::JObject::null().into())
        }
    }))
    .into_arc();
    fs::a_sync::append_file_with_path_str(path.as_ref(), data.as_ref(), mode, flags, callback);
}

#[no_mangle]
pub extern "system" fn Java_org_nativescript_widgets_filesystem_FileSystem_nativeChmod(
    _: JNIEnv,
    _: JClass,
    path: JString,
    mode: jint,
    callback: jlong,
) {
    let callback = callback as *const AsyncCallback;
    let path = get_str(path, "");
    let on_success = AsyncCallback::clone_from_ptr(callback);
    let callback = AsyncClosure::<(), std::io::Error>::new(Box::new(move |_, error| {
        if let Some(error) = error {
            on_success.on_error(jni::objects::JValue::Object(
                error_to_jstring(error).as_obj(),
            ))
        } else {
            on_success.on_success(jni::objects::JObject::null().into())
        }
    }))
    .into_arc();
    fs::a_sync::chmod(path.as_ref(), mode as u32, callback);
}

#[no_mangle]
pub extern "system" fn Java_org_nativescript_widgets_filesystem_FileSystem_nativeChown(
    _: JNIEnv,
    _: JClass,
    path: JString,
    uid: jint,
    gid: jint,
    callback: jlong,
) {
    let callback = callback as *const AsyncCallback;
    let path = get_str(path, "");
    let on_success = AsyncCallback::clone_from_ptr(callback);
    let callback = AsyncClosure::<(), std::io::Error>::new(Box::new(move |_, error| {
        if let Some(error) = error {
            on_success.on_error(jni::objects::JValue::Object(
                error_to_jstring(error).as_obj(),
            ))
        } else {
            on_success.on_success(jni::objects::JObject::null().into())
        }
    }))
    .into_arc();
    fs::a_sync::chown(path.as_ref(), uid as u32, gid as u32, callback);
}

#[no_mangle]
pub extern "system" fn Java_org_nativescript_widgets_filesystem_FileSystem_nativeClose(
    _: JNIEnv,
    _: JClass,
    fd: jint,
    callback: jlong,
) {
    let callback = callback as *const AsyncCallback;
    let on_success = AsyncCallback::clone_from_ptr(callback);
    let callback = AsyncClosure::<(), std::io::Error>::new(Box::new(move |_, error| {
        if let Some(error) = error {
            on_success.on_error(jni::objects::JValue::Object(
                error_to_jstring(error).as_obj(),
            ))
        } else {
            on_success.on_success(jni::objects::JObject::null().into())
        }
    }))
    .into_arc();
    fs::a_sync::close(fd, callback);
}

#[no_mangle]
pub extern "system" fn Java_org_nativescript_widgets_filesystem_FileSystem_nativeCopyFile(
    _: JNIEnv,
    _: JClass,
    src: JString,
    dest: JString,
    flags: jint,
    callback: jlong,
) {
    let callback = callback as *const AsyncCallback;
    let src = get_str(src, "");
    let dest = get_str(dest, "");
    let on_success = AsyncCallback::clone_from_ptr(callback);
    let callback = AsyncClosure::<(), std::io::Error>::new(Box::new(move |_, error| {
        if let Some(error) = error {
            on_success.on_error(jni::objects::JValue::Object(
                error_to_jstring(error).as_obj(),
            ))
        } else {
            on_success.on_success(jni::objects::JObject::null().into())
        }
    }))
    .into_arc();
    fs::a_sync::copy_file(&src, &dest, flags as u32, callback);
}

#[no_mangle]
pub extern "system" fn Java_org_nativescript_widgets_filesystem_FileSystem_nativeCopy(
    _: JNIEnv,
    _: JClass,
    src: JString,
    dest: JString,
    _flags: jint,
    callback: jlong,
) {
    let _callback = callback as *const AsyncCallback;
    let _src = get_str(src, "");
    let _dest = get_str(dest, "");
    todo!()
}

#[no_mangle]
pub extern "system" fn Java_org_nativescript_widgets_filesystem_FileSystem_nativeExists(
    _: JNIEnv,
    _: JClass,
    src: JString,
    callback: jlong,
) {
    let callback = callback as *const AsyncCallback;
    let on_success = AsyncCallback::clone_from_ptr(callback);
    let callback = AsyncClosure::<bool, std::io::Error>::new(Box::new(move |success, error| {
        if error.is_some() {
            on_success.on_error(jni::objects::JValue::Object(
                error_to_jstring(error.unwrap()).as_obj(),
            ))
        } else {
            let vm = JVM.get().unwrap();
            let env = vm.attach_current_thread().unwrap();
            on_success.on_success(to_boolean(&env, success.unwrap()).into())
        }
    }))
    .into_arc();

    let src = get_str(src, "");

    fs::a_sync::exists(&src, callback);
}

#[no_mangle]
pub extern "system" fn Java_org_nativescript_widgets_filesystem_FileSystem_nativeFchmod(
    _: JNIEnv,
    _: JClass,
    fd: jint,
    mode: jint,
    callback: jlong,
) {
    let callback = callback as *const AsyncCallback;
    let on_success = AsyncCallback::clone_from_ptr(callback);
    let callback = AsyncClosure::<(), std::io::Error>::new(Box::new(move |_, error| {
        if let Some(error) = error {
            on_success.on_error(jni::objects::JValue::Object(
                error_to_jstring(error).as_obj(),
            ))
        } else {
            on_success.on_success(jni::objects::JObject::null().into())
        }
    }))
    .into_arc();
    fs::a_sync::fchmod(fd, mode as c_ushort, callback);
}

#[no_mangle]
pub extern "system" fn Java_org_nativescript_widgets_filesystem_FileSystem_nativeFchown(
    _: JNIEnv,
    _: JClass,
    fd: jint,
    uid: jint,
    gid: jint,
    callback: jlong,
) {
    let callback = callback as *const AsyncCallback;
    let on_success = AsyncCallback::clone_from_ptr(callback);
    let callback = AsyncClosure::<(), std::io::Error>::new(Box::new(move |_, error| {
        if let Some(error) = error {
            on_success.on_error(jni::objects::JValue::Object(
                error_to_jstring(error).as_obj(),
            ))
        } else {
            on_success.on_success(jni::objects::JObject::null().into())
        }
    }))
    .into_arc();
    fs::a_sync::fchown(fd, uid as c_uint, gid as c_uint, callback);
}

#[no_mangle]
pub extern "system" fn Java_org_nativescript_widgets_filesystem_FileSystem_nativeFdatasync(
    _: JNIEnv,
    _: JClass,
    fd: jint,
    callback: jlong,
) {
    let callback = callback as *const AsyncCallback;
    let on_success = AsyncCallback::clone_from_ptr(callback);
    let callback = AsyncClosure::<(), std::io::Error>::new(Box::new(move |_, error| {
        if let Some(error) = error {
            on_success.on_error(jni::objects::JValue::Object(
                error_to_jstring(error).as_obj(),
            ))
        } else {
            on_success.on_success(jni::objects::JObject::null().into())
        }
    }))
    .into_arc();
    fs::a_sync::fdatasync(fd, callback);
}

#[no_mangle]
pub extern "system" fn Java_org_nativescript_widgets_filesystem_FileSystem_nativeFstat(
    _: JNIEnv,
    _: JClass,
    fd: jint,
    callback: jlong,
) {
    let callback = callback as *const AsyncCallback;
    let on_success = AsyncCallback::clone_from_ptr(callback);
    let callback =
        AsyncClosure::<FileStat, std::io::Error>::new(Box::new(move |success, error| {
            if error.is_some() {
                on_success.on_error(jni::objects::JValue::Object(
                    error_to_jstring(error.unwrap()).as_obj(),
                ))
            } else {
                let vm = JVM.get().unwrap();
                let env = vm.attach_current_thread().unwrap();
                let stat = super::file_stat::build_stat(&env, success.unwrap());
                on_success.on_success(stat.into())
            }
        }))
        .into_arc();
    fs::a_sync::fstat(fd, callback);
}

#[no_mangle]
pub extern "system" fn Java_org_nativescript_widgets_filesystem_FileSystem_nativeFsync(
    _: JNIEnv,
    _: JClass,
    fd: jint,
    callback: jlong,
) {
    let callback = callback as *const AsyncCallback;
    let on_success = AsyncCallback::clone_from_ptr(callback);
    let callback = AsyncClosure::<(), std::io::Error>::new(Box::new(move |_, error| {
        if let Some(error) = error {
            on_success.on_error(jni::objects::JValue::Object(
                error_to_jstring(error).as_obj(),
            ))
        } else {
            on_success.on_success(jni::objects::JObject::null().into())
        }
    }))
    .into_arc();
    fs::a_sync::fsync(fd, callback);
}

#[no_mangle]
pub extern "system" fn Java_org_nativescript_widgets_filesystem_FileSystem_nativeFtruncate(
    _: JNIEnv,
    _: JClass,
    fd: jint,
    len: jlong,
    callback: jlong,
) {
    let callback = callback as *const AsyncCallback;
    let on_success = AsyncCallback::clone_from_ptr(callback);
    let callback = AsyncClosure::<(), std::io::Error>::new(Box::new(move |_, error| {
        if let Some(error) = error {
            on_success.on_error(jni::objects::JValue::Object(
                error_to_jstring(error).as_obj(),
            ))
        } else {
            on_success.on_success(jni::objects::JObject::null().into())
        }
    }))
    .into_arc();
    fs::a_sync::ftruncate(fd, len.try_into().unwrap(), callback);
}

#[no_mangle]
pub extern "system" fn Java_org_nativescript_widgets_filesystem_FileSystem_nativeFutimes(
    _: JNIEnv,
    _: JClass,
    fd: jint,
    atime: jlong,
    mtime: jlong,
    callback: jlong,
) {
    let callback = callback as *const AsyncCallback;
    let on_success = AsyncCallback::clone_from_ptr(callback);
    let callback = AsyncClosure::<(), std::io::Error>::new(Box::new(move |_, error| {
        if let Some(error) = error {
            on_success.on_error(jni::objects::JValue::Object(
                error_to_jstring(error).as_obj(),
            ))
        } else {
            on_success.on_success(jni::objects::JObject::null().into())
        }
    }))
    .into_arc();

    fs::a_sync::futimes(
        fd,
        atime.try_into().unwrap(),
        mtime.try_into().unwrap(),
        callback,
    );
}

#[no_mangle]
pub extern "system" fn Java_org_nativescript_widgets_filesystem_FileSystem_nativeLchmod(
    _: JNIEnv,
    _: JClass,
    path: JString,
    mode: jint,
    callback: jlong,
) {
    let callback = callback as *const AsyncCallback;
    let on_success = AsyncCallback::clone_from_ptr(callback);
    let callback = AsyncClosure::<(), std::io::Error>::new(Box::new(move |_, error| {
        if let Some(error) = error {
            on_success.on_error(jni::objects::JValue::Object(
                error_to_jstring(error).as_obj(),
            ))
        } else {
            on_success.on_success(jni::objects::JObject::null().into())
        }
    }))
    .into_arc();
    let path = get_str(path, "");
    fs::a_sync::lchmod(&path, mode as c_ushort, callback);
}

#[no_mangle]
pub extern "system" fn Java_org_nativescript_widgets_filesystem_FileSystem_nativeLchown(
    _: JNIEnv,
    _: JClass,
    path: JString,
    uid: jint,
    gid: jint,
    callback: jlong,
) {
    let callback = callback as *const AsyncCallback;
    let on_success = AsyncCallback::clone_from_ptr(callback);
    let callback = AsyncClosure::<(), std::io::Error>::new(Box::new(move |_, error| {
        if let Some(error) = error {
            on_success.on_error(jni::objects::JValue::Object(
                error_to_jstring(error).as_obj(),
            ))
        } else {
            on_success.on_success(jni::objects::JObject::null().into())
        }
    }))
    .into_arc();
    let path = get_str(path, "");
    fs::a_sync::lchown(&path, uid as c_uint, gid as c_uint, callback);
}

#[no_mangle]
pub extern "system" fn Java_org_nativescript_widgets_filesystem_FileSystem_nativeLutimes(
    _: JNIEnv,
    _: JClass,
    path: JString,
    atime: jlong,
    mtime: jlong,
    callback: jlong,
) {
    let callback = callback as *const AsyncCallback;
    let on_success = AsyncCallback::clone_from_ptr(callback);
    let callback = AsyncClosure::<(), std::io::Error>::new(Box::new(move |_, error| {
        if let Some(error) = error {
            on_success.on_error(jni::objects::JValue::Object(
                error_to_jstring(error).as_obj(),
            ))
        } else {
            on_success.on_success(jni::objects::JObject::null().into())
        }
    }))
    .into_arc();
    let path = get_str(path, "");

    fs::a_sync::lutimes(
        &path,
        atime.try_into().unwrap(),
        mtime.try_into().unwrap(),
        callback,
    );
}

#[no_mangle]
pub extern "system" fn Java_org_nativescript_widgets_filesystem_FileSystem_nativeLink(
    _: JNIEnv,
    _: JClass,
    existing_path: JString,
    new_path: JString,
    callback: jlong,
) {
    let callback = callback as *const AsyncCallback;
    let on_success = AsyncCallback::clone_from_ptr(callback);
    let callback = AsyncClosure::<(), std::io::Error>::new(Box::new(move |_, error| {
        if let Some(error) = error {
            on_success.on_error(jni::objects::JValue::Object(
                error_to_jstring(error).as_obj(),
            ))
        } else {
            on_success.on_success(jni::objects::JObject::null().into())
        }
    }))
    .into_arc();
    let existing_path = get_str(existing_path, "");
    let new_path = get_str(new_path, "");
    fs::a_sync::link(&existing_path, &new_path, callback);
}

#[no_mangle]
pub extern "system" fn Java_org_nativescript_widgets_filesystem_FileSystem_nativeLstat(
    _: JNIEnv,
    _: JClass,
    path: JString,
    callback: jlong,
) {
    let callback = callback as *const AsyncCallback;
    let on_success = AsyncCallback::clone_from_ptr(callback);
    let callback =
        AsyncClosure::<FileStat, std::io::Error>::new(Box::new(move |success, error| {
            if error.is_some() {
                on_success.on_error(jni::objects::JValue::Object(
                    error_to_jstring(error.unwrap()).as_obj(),
                ))
            } else {
                let vm = JVM.get().unwrap();
                let env = vm.attach_current_thread().unwrap();
                let stat = super::file_stat::build_stat(&env, success.unwrap());
                on_success.on_success(stat.into())
            }
        }))
        .into_arc();
    let path = get_str(path, "");
    fs::a_sync::lstat(&path, callback);
}

#[no_mangle]
pub extern "system" fn Java_org_nativescript_widgets_filesystem_FileSystem_nativeMkdir(
    _: JNIEnv,
    _: JClass,
    path: JString,
    mode: c_int,
    recursive: jboolean,
    callback: jlong,
) {
    let callback = callback as *const AsyncCallback;
    let on_success = AsyncCallback::clone_from_ptr(callback);
    let callback = AsyncClosure::<(), std::io::Error>::new(Box::new(move |_, error| {
        if let Some(error) = error {
            on_success.on_error(jni::objects::JValue::Object(
                error_to_jstring(error).as_obj(),
            ))
        } else {
            on_success.on_success(jni::objects::JObject::null().into())
        }
    }))
    .into_arc();
    let path = get_str(path, "");
    fs::a_sync::mkdir(&path, mode as u32, recursive == JNI_TRUE, callback);
}

#[no_mangle]
pub extern "system" fn Java_org_nativescript_widgets_filesystem_FileSystem_nativeMkdtemp(
    _: JNIEnv,
    _: JClass,
    prefix: JString,
    callback: jlong,
) {
    let callback = callback as *const AsyncCallback;
    let on_success = AsyncCallback::clone_from_ptr(callback);
    let callback = AsyncClosure::<PathBuf, std::io::Error>::new(Box::new(move |success, error| {
        if error.is_some() {
            on_success.on_error(jni::objects::JValue::Object(
                error_to_jstring(error.unwrap()).as_obj(),
            ))
        } else {
            let res = success.unwrap();
            let res = res.to_string_lossy();
            let jvm = JVM.get().unwrap();
            let env = jvm.attach_current_thread().unwrap();
            let res = env.new_string(res.as_ref()).unwrap();
            on_success.on_success(res.into())
        }
    }))
    .into_arc();
    let prefix = get_str(prefix, "");
    fs::a_sync::mkdtemp(&prefix, callback);
}

#[no_mangle]
pub extern "system" fn Java_org_nativescript_widgets_filesystem_FileSystem_nativeOpen(
    _: JNIEnv,
    _: JClass,
    path: JString,
    flags: jint,
    mode: jint,
    callback: jlong,
) {
    let callback = callback as *const AsyncCallback;
    let on_success = AsyncCallback::clone_from_ptr(callback);
    let callback = AsyncClosure::<c_int, std::io::Error>::new(Box::new(move |success, error| {
        if error.is_some() {
            on_success.on_error(jni::objects::JValue::Object(
                error_to_jstring(error.unwrap()).as_obj(),
            ))
        } else {
            let jvm = JVM.get().unwrap();
            let env = jvm.attach_current_thread().unwrap();
            on_success.on_success(to_integer(&env, success.unwrap().into()).into())
        }
    }))
    .into_arc();
    let path = get_str(path, "");
    fs::a_sync::open(&path, flags, mode, callback);
}

#[no_mangle]
pub extern "system" fn Java_org_nativescript_widgets_filesystem_FileSystem_nativeOpenDir(
    _: JNIEnv,
    _: JClass,
    path: JString,
    callback: jlong,
) {
    let callback = callback as *const AsyncCallback;
    let on_success = AsyncCallback::clone_from_ptr(callback);
    let callback = AsyncClosure::<FileDir, std::io::Error>::new(Box::new(move |success, error| {
        if error.is_some() {
            on_success.on_error(jni::objects::JValue::Object(
                error_to_jstring(error.unwrap()).as_obj(),
            ))
        } else {
            let jvm = JVM.get().unwrap();
            let env = jvm.attach_current_thread().unwrap();
            on_success.on_success(build_dir(&env, success.unwrap()).into())
        }
    }))
    .into_arc();
    let path = get_str(path, "");
    fs::a_sync::opendir(&path, callback);
}

#[no_mangle]
pub extern "system" fn Java_org_nativescript_widgets_filesystem_FileSystem_nativeRead(
    env: JNIEnv,
    _: JClass,
    fd: jint,
    buffer: JByteBuffer,
    offset: jlong,
    length: jlong,
    position: jlong,
    callback: jlong,
) {
    nativeRead(env, fd, buffer, offset, length, position, callback);
}

pub(crate) fn nativeRead(
    env: JNIEnv,
    fd: jint,
    buffer: JByteBuffer,
    offset: jlong,
    length: jlong,
    position: jlong,
    callback: jlong,
) {
    let callback = callback as *const AsyncCallback;
    let callback = AsyncCallback::clone_from_ptr(callback);
    let bytes = env.new_global_ref(buffer).unwrap();
    runtime().spawn(async move {
        let jvm = JVM.get().unwrap();
        let env = jvm.attach_current_thread().unwrap();
        let data = JByteBuffer::from(bytes.as_obj().into_inner());
        let bytes = env.get_direct_buffer_address(data).unwrap();
        match fs::sync::read(
            fd,
            bytes,
            offset.try_into().unwrap(),
            length.try_into().unwrap(),
            position.try_into().unwrap(),
        ) {
            Ok(read) => callback.on_success(to_long(&env, read.try_into().unwrap()).into()),
            Err(error) => callback.on_error(jni::objects::JValue::Object(
                error_to_jstring(error).as_obj(),
            )),
        }
    });
}

#[no_mangle]
pub extern "system" fn Java_org_nativescript_widgets_filesystem_FileSystem_nativeReadWithBytes(
    env: JNIEnv,
    _: JClass,
    fd: jint,
    buffer: jbyteArray,
    offset: jlong,
    length: jlong,
    position: jlong,
    callback: jlong,
) {
    nativeReadWithBytes(env, fd, buffer, offset, length, position, callback);
}

pub(crate) fn nativeReadWithBytes(
    env: JNIEnv,
    fd: jint,
    buffer: jbyteArray,
    offset: jlong,
    length: jlong,
    position: jlong,
    callback: jlong,
) {
    let callback = callback as *const AsyncCallback;
    let callback = AsyncCallback::clone_from_ptr(callback);
    let bytes = env.new_global_ref(buffer).unwrap();
    runtime().spawn(async move {
        let jvm = JVM.get().unwrap();
        let env = jvm.attach_current_thread().unwrap();
        let data = env
            .get_primitive_array_critical(bytes.as_obj().into_inner(), ReleaseMode::NoCopyBack)
            .unwrap();
        let bytes = unsafe {
            std::slice::from_raw_parts_mut(
                data.as_ptr() as *mut u8,
                data.size().unwrap_or_default() as usize,
            )
        };
        match fs::sync::read(
            fd,
            bytes,
            offset.try_into().unwrap(),
            length.try_into().unwrap(),
            position.try_into().unwrap(),
        ) {
            Ok(read) => {
                // force drop of array to enable jni usage
                drop(data);
                callback.on_success(to_long(&env, read.try_into().unwrap()).into())
            }
            Err(error) => {
                // force drop of array to enable jni usage
                drop(data);
                callback.on_error(jni::objects::JValue::Object(
                    error_to_jstring(error).as_obj(),
                ))
            }
        }
    });
}

#[no_mangle]
pub extern "system" fn Java_org_nativescript_widgets_filesystem_FileSystem_nativeReaddirWithFileTypes(
    _: JNIEnv,
    _: JClass,
    path: JString,
    _encoding: JString,
    callback: jlong,
) {
    let callback = callback as *const AsyncCallback;
    let on_success = AsyncCallback::clone_from_ptr(callback);
    let path = get_str(path, "");
    fs::a_sync::readdir_with_file_types(
        &path,
        "",
        Box::new(move |success, error| {
            if error.is_some() {
                on_success.on_error(jni::objects::JValue::Object(
                    error_to_jstring(error.unwrap()).as_obj(),
                ))
            } else {
                let jvm = JVM.get().unwrap();
                let env = jvm.attach_current_thread().unwrap();
                on_success.on_success(build_dirents(&env, success.unwrap()).into())
            }
        }),
    );
}

#[no_mangle]
pub extern "system" fn Java_org_nativescript_widgets_filesystem_FileSystem_nativeReaddirWithFile(
    _: JNIEnv,
    _: JClass,
    path: JString,
    _encoding: JString,
    callback: jlong,
) {
    let callback = callback as *const AsyncCallback;
    let on_success = AsyncCallback::clone_from_ptr(callback);
    let path = get_str(path, "");
    fs::a_sync::readdir_with_file(
        &path,
        "",
        Box::new(move |success, error| {
            if error.is_some() {
                on_success.on_error(jni::objects::JValue::Object(
                    error_to_jstring(error.unwrap()).as_obj(),
                ))
            } else {
                let jvm = JVM.get().unwrap();
                let env = jvm.attach_current_thread().unwrap();
                on_success.on_success(build_dirents_paths(&env, success.unwrap()).into())
            }
        }),
    );
}

#[no_mangle]
pub extern "system" fn Java_org_nativescript_widgets_filesystem_FileSystem_nativeReadFile(
    _: JNIEnv,
    _: JClass,
    path: JString,
    flags: jint,
    callback: jlong,
) {
    read_file(path, flags, false, callback);
}

#[no_mangle]
pub extern "system" fn Java_org_nativescript_widgets_filesystem_FileSystem_nativeReadFileBytes(
    _: JNIEnv,
    _: JClass,
    path: JString,
    flags: jint,
    callback: jlong,
) {
    read_file(path, flags, true, callback);
}

fn read_file(path: JString, flags: jint, to_bytes: bool, callback: jlong) {
    let callback = callback as *const AsyncCallback;
    let on_success = AsyncCallback::clone_from_ptr(callback);
    let callback =
        AsyncClosure::<ByteBufMut, std::io::Error>::new(Box::new(move |success, error| {
            if error.is_some() {
                on_success.on_error(jni::objects::JValue::Object(
                    error_to_jstring(error.unwrap()).as_obj(),
                ))
            } else {
                let jvm = JVM.get().unwrap();
                let env = jvm.attach_current_thread().unwrap();
                if to_bytes {
                    let buf = success.unwrap();
                    let res = env.byte_array_from_slice(buf.as_mut_slice()).unwrap();
                    on_success.on_success(res.into())
                } else {
                    let buf = success.unwrap();
                    let db = env.new_direct_byte_buffer(buf.as_mut_slice()).unwrap();
                    let buf = Box::into_raw(Box::new(buf));
                    let clazz = find_class(FILE_SYSTEM_CLASS).unwrap();
                    let db: JValue = db.into();
                    env.call_static_method(
                        clazz,
                        "watchItem",
                        "(JLjava/nio/ByteBuffer;)V",
                        &[(buf as i64).into(), db],
                    )
                    .unwrap();
                    on_success.on_success(db)
                }
            }
        }))
        .into_arc();
    let path = get_str(path, "");
    fs::a_sync::read_file(&path, flags, callback);
}

#[no_mangle]
pub extern "system" fn Java_org_nativescript_widgets_filesystem_FileSystem_nativeReadFileWithFd(
    _: JNIEnv,
    _: JClass,
    fd: jint,
    flags: jint,
    callback: jlong,
) {
    read_file_with_fd(fd, flags, false, callback);
}

#[no_mangle]
pub extern "system" fn Java_org_nativescript_widgets_filesystem_FileSystem_nativeReadFileBytesWithFd(
    _: JNIEnv,
    _: JClass,
    fd: jint,
    flags: jint,
    callback: jlong,
) {
    read_file_with_fd(fd, flags, true, callback);
}

fn read_file_with_fd(fd: jint, flags: jint, to_bytes: bool, callback: jlong) {
    let callback = callback as *const AsyncCallback;
    let on_success = AsyncCallback::clone_from_ptr(callback);
    let callback =
        AsyncClosure::<ByteBufMut, std::io::Error>::new(Box::new(move |success, error| {
            if error.is_some() {
                on_success.on_error(jni::objects::JValue::Object(
                    error_to_jstring(error.unwrap()).as_obj(),
                ))
            } else {
                let jvm = JVM.get().unwrap();
                let env = jvm.attach_current_thread().unwrap();
                if to_bytes {
                    let buf = success.unwrap();
                    let res = env.byte_array_from_slice(buf.as_mut_slice()).unwrap();
                    on_success.on_success(res.into())
                } else {
                    let buf = success.unwrap();
                    let db = env.new_direct_byte_buffer(buf.as_mut_slice()).unwrap();
                    let buf = Box::into_raw(Box::new(buf));
                    let clazz = find_class(FILE_SYSTEM_CLASS).unwrap();
                    let db: JValue = db.into();
                    let _ = env.call_static_method(
                        clazz,
                        "watchItem",
                        "(JLjava/nio/ByteBuffer)V",
                        &[(buf as i64).into(), db],
                    );
                    on_success.on_success(db)
                }
            }
        }))
        .into_arc();
    fs::a_sync::read_file_with_fd(fd, flags, callback);
}

#[no_mangle]
pub extern "system" fn Java_org_nativescript_widgets_filesystem_FileSystem_nativeReadLink(
    _: JNIEnv,
    _: JClass,
    path: JString,
    encoding: JString,
    callback: jlong,
) {
    let callback = callback as *const AsyncCallback;
    let on_success = AsyncCallback::clone_from_ptr(callback);
    let callback = AsyncClosure::<PathBuf, std::io::Error>::new(Box::new(move |success, error| {
        if error.is_some() {
            on_success.on_error(jni::objects::JValue::Object(
                error_to_jstring(error.unwrap()).as_obj(),
            ))
        } else {
            let res = success.unwrap();
            let res = res.to_string_lossy();
            let jvm = JVM.get().unwrap();
            let env = jvm.attach_current_thread().unwrap();
            let res = env.new_string(res.as_ref()).unwrap();
            on_success.on_success(res.into())
        }
    }))
    .into_arc();
    let path = get_str(path, "");
    let encoding = get_str(encoding, "");
    fs::a_sync::read_link(&path, &encoding, callback);
}

#[no_mangle]
pub extern "system" fn Java_org_nativescript_widgets_filesystem_FileSystem_nativeReadv(
    env: JNIEnv,
    _: JClass,
    fd: jint,
    buffers: jobjectArray,
    position: jlong,
    callback: jlong,
) {
    nativeReadv(env, fd, buffers, position, callback);
}

pub(crate) fn nativeReadv(
    env: JNIEnv,
    fd: jint,
    buffers: jobjectArray,
    position: jlong,
    callback: jlong,
) {
    let callback = callback as *const AsyncCallback;
    let on_success = AsyncCallback::clone_from_ptr(callback);
    let buffers = env.new_global_ref(buffers).unwrap();
    runtime().spawn(async move {
        let jvm = JVM.get().unwrap();
        let env = jvm.attach_current_thread().unwrap();
        let array = buffers.as_obj().into_inner();
        let size = env.get_array_length(array).unwrap_or_default();
        let mut buf = Vec::<ByteBufMut>::with_capacity(size.try_into().unwrap());
        for i in 0..size {
            let bytebuf = JByteBuffer::from(env.get_object_array_element(array, i).unwrap());
            let address = env.get_direct_buffer_address(bytebuf).unwrap();
            buf.push(ByteBufMut::new(address.as_mut_ptr(), address.len()))
        }
        match fs::sync::readv(fd, buf.as_mut_slice(), position.try_into().unwrap()) {
            Ok(read) => {
                on_success.on_success(to_long(&env, read.try_into().unwrap()).into());
            }
            Err(error) => on_success.on_error(jni::objects::JValue::Object(
                error_to_jstring(error).as_obj(),
            )),
        }
    });
}

#[no_mangle]
pub extern "system" fn Java_org_nativescript_widgets_filesystem_FileSystem_nativeRealPath(
    _: JNIEnv,
    _: JClass,
    path: JString,
    callback: jlong,
) {
    let callback = callback as *const AsyncCallback;
    let on_success = AsyncCallback::clone_from_ptr(callback);
    let callback = AsyncClosure::<PathBuf, std::io::Error>::new(Box::new(move |success, error| {
        if error.is_some() {
            on_success.on_error(jni::objects::JValue::Object(
                error_to_jstring(error.unwrap()).as_obj(),
            ))
        } else {
            let res = success.unwrap();
            let res = res.to_string_lossy();
            let jvm = JVM.get().unwrap();
            let env = jvm.attach_current_thread().unwrap();
            let res = env.new_string(res.as_ref()).unwrap();
            on_success.on_success(res.into())
        }
    }))
    .into_arc();
    let path = get_str(path, "");
    fs::a_sync::real_path(&path, callback);
}

#[no_mangle]
pub extern "system" fn Java_org_nativescript_widgets_filesystem_FileSystem_nativeRename(
    _: JNIEnv,
    _: JClass,
    old_path: JString,
    new_path: JString,
    callback: jlong,
) {
    let callback = callback as *const AsyncCallback;
    let on_success = AsyncCallback::clone_from_ptr(callback);
    let callback = AsyncClosure::<(), std::io::Error>::new(Box::new(move |_, error| {
        if let Some(error) = error {
            on_success.on_error(jni::objects::JValue::Object(
                error_to_jstring(error).as_obj(),
            ))
        } else {
            on_success.on_success(jni::objects::JObject::null().into())
        }
    }))
    .into_arc();
    let old_path = get_str(old_path, "");
    let new_path = get_str(new_path, "");
    fs::a_sync::rename(&old_path, &new_path, callback);
}

#[no_mangle]
pub extern "system" fn Java_org_nativescript_widgets_filesystem_FileSystem_nativeRmdir(
    _: JNIEnv,
    _: JClass,
    path: JString,
    max_retries: jint,
    recursive: jboolean,
    retry_delay: jlong,
    callback: jlong,
) {
    let callback = callback as *const AsyncCallback;
    let on_success = AsyncCallback::clone_from_ptr(callback);
    let callback = AsyncClosure::<(), std::io::Error>::new(Box::new(move |_, error| {
        if let Some(error) = error {
            on_success.on_error(jni::objects::JValue::Object(
                error_to_jstring(error).as_obj(),
            ))
        } else {
            on_success.on_success(jni::objects::JObject::null().into())
        }
    }))
    .into_arc();
    let path = get_str(path, "");
    fs::a_sync::rmdir(
        &path,
        max_retries,
        recursive == JNI_TRUE,
        retry_delay.try_into().unwrap(),
        callback,
    );
}

#[no_mangle]
pub extern "system" fn Java_org_nativescript_widgets_filesystem_FileSystem_nativeRm(
    _: JNIEnv,
    _: JClass,
    path: JString,
    max_retries: jint,
    recursive: jboolean,
    retry_delay: jlong,
    callback: jlong,
) {
    let callback = callback as *const AsyncCallback;
    let on_success = AsyncCallback::clone_from_ptr(callback);
    let callback = AsyncClosure::<(), std::io::Error>::new(Box::new(move |_, error| {
        if let Some(error) = error {
            on_success.on_error(jni::objects::JValue::Object(
                error_to_jstring(error).as_obj(),
            ))
        } else {
            on_success.on_success(jni::objects::JObject::null().into())
        }
    }))
    .into_arc();
    let path = get_str(path, "");
    fs::a_sync::rm(
        &path,
        max_retries,
        recursive == JNI_TRUE,
        retry_delay.try_into().unwrap(),
        callback,
    );
}

#[no_mangle]
pub extern "system" fn Java_org_nativescript_widgets_filesystem_FileSystem_nativeStat(
    _: JNIEnv,
    _: JClass,
    path: JString,
    throw_if_no_entry: jboolean,
    callback: jlong,
) {
    let callback = callback as *const AsyncCallback;
    let on_success = AsyncCallback::clone_from_ptr(callback);
    let callback =
        AsyncClosure::<FileStat, std::io::Error>::new(Box::new(move |success, error| {
            if error.is_some() {
                on_success.on_error(jni::objects::JValue::Object(
                    error_to_jstring(error.unwrap()).as_obj(),
                ))
            } else {
                let vm = JVM.get().unwrap();
                let env = vm.attach_current_thread().unwrap();
                let stat = super::file_stat::build_stat(&env, success.unwrap());
                on_success.on_success(stat.into())
            }
        }))
        .into_arc();
    let path = get_str(path, "");
    fs::a_sync::stat(&path, throw_if_no_entry == JNI_TRUE, callback);
}

#[no_mangle]
pub extern "system" fn Java_org_nativescript_widgets_filesystem_FileSystem_nativeSymlink(
    _: JNIEnv,
    _: JClass,
    target: JString,
    path: JString,
    type_: JString,
    callback: jlong,
) {
    let callback = callback as *const AsyncCallback;
    let on_success = AsyncCallback::clone_from_ptr(callback);
    let callback = AsyncClosure::<(), std::io::Error>::new(Box::new(move |_, error| {
        if let Some(error) = error {
            on_success.on_error(jni::objects::JValue::Object(
                error_to_jstring(error).as_obj(),
            ))
        } else {
            on_success.on_success(jni::objects::JObject::null().into())
        }
    }))
    .into_arc();
    let target = get_str(target, "");
    let path = get_str(path, "");
    let type_ = get_str(type_, "");
    fs::a_sync::symlink(&target, &path, &type_, callback);
}

#[no_mangle]
pub extern "system" fn Java_org_nativescript_widgets_filesystem_FileSystem_nativeTruncate(
    _: JNIEnv,
    _: JClass,
    path: JString,
    len: jlong,
    callback: jlong,
) {
    let callback = callback as *const AsyncCallback;
    let on_success = AsyncCallback::clone_from_ptr(callback);
    let callback = AsyncClosure::<(), std::io::Error>::new(Box::new(move |_, error| {
        if let Some(error) = error {
            on_success.on_error(jni::objects::JValue::Object(
                error_to_jstring(error).as_obj(),
            ))
        } else {
            on_success.on_success(jni::objects::JObject::null().into())
        }
    }))
    .into_arc();
    let path = get_str(path, "");
    fs::a_sync::truncate(&path, len.try_into().unwrap(), callback);
}

#[no_mangle]
pub extern "system" fn Java_org_nativescript_widgets_filesystem_FileSystem_nativeUnlink(
    _: JNIEnv,
    _: JClass,
    path: JString,
    callback: jlong,
) {
    let callback = callback as *const AsyncCallback;
    let on_success = AsyncCallback::clone_from_ptr(callback);
    let callback = AsyncClosure::<(), std::io::Error>::new(Box::new(move |_, error| {
        if let Some(error) = error {
            on_success.on_error(jni::objects::JValue::Object(
                error_to_jstring(error).as_obj(),
            ))
        } else {
            on_success.on_success(jni::objects::JObject::null().into())
        }
    }))
    .into_arc();
    let path = get_str(path, "");
    fs::a_sync::unlink(&path, callback);
}

#[no_mangle]
pub extern "system" fn Java_org_nativescript_widgets_filesystem_FileSystem_nativeUtimes(
    _: JNIEnv,
    _: JClass,
    path: JString,
    atime: jlong,
    mtime: jlong,
    callback: jlong,
) {
    let callback = callback as *const AsyncCallback;
    let on_success = AsyncCallback::clone_from_ptr(callback);
    let callback = AsyncClosure::<(), std::io::Error>::new(Box::new(move |_, error| {
        if let Some(error) = error {
            on_success.on_error(jni::objects::JValue::Object(
                error_to_jstring(error).as_obj(),
            ))
        } else {
            on_success.on_success(jni::objects::JObject::null().into())
        }
    }))
    .into_arc();
    let path = get_str(path, "");
    fs::a_sync::utimes(
        &path,
        atime.try_into().unwrap(),
        mtime.try_into().unwrap(),
        callback,
    );
}

#[no_mangle]
pub extern "system" fn Java_org_nativescript_widgets_filesystem_FileSystem_nativeWrite(
    env: JNIEnv,
    _: JClass,
    fd: jint,
    buffer: JByteBuffer,
    offset: jlong,
    length: jlong,
    position: jlong,
    callback: jlong,
) {
    nativeWrite(env, fd, buffer, offset, length, position, callback);
}

pub(crate) fn nativeWrite(
    env: JNIEnv,
    fd: jint,
    buffer: JByteBuffer,
    offset: jlong,
    length: jlong,
    position: jlong,
    callback: jlong,
) {
    let callback = callback as *const AsyncCallback;
    let callback = AsyncCallback::clone_from_ptr(callback);
    let buffer = env.new_global_ref(buffer).unwrap();
    runtime().spawn(async move {
        let jvm = JVM.get().unwrap();
        let env = jvm.attach_current_thread().unwrap();
        let bytes = env
            .get_direct_buffer_address(JByteBuffer::from(buffer.as_obj()))
            .unwrap();
        match fs::sync::write(
            fd,
            bytes,
            offset.try_into().unwrap(),
            length.try_into().unwrap(),
            position.try_into().unwrap(),
        ) {
            Ok(wrote) => callback.on_success(to_long(&env, wrote.try_into().unwrap()).into()),
            Err(error) => callback.on_error(jni::objects::JValue::Object(
                error_to_jstring(error).as_obj(),
            )),
        }
    });
}

#[no_mangle]
pub extern "system" fn Java_org_nativescript_widgets_filesystem_FileSystem_nativeWriteBytes(
    env: JNIEnv,
    _: JClass,
    fd: jint,
    buffer: jbyteArray,
    offset: jlong,
    length: jlong,
    position: jlong,
    callback: jlong,
) {
    nativeWriteBytes(env, fd, buffer, offset, length, position, callback);
}

pub(crate) fn nativeWriteBytes(
    env: JNIEnv,
    fd: jint,
    buffer: jbyteArray,
    offset: jlong,
    length: jlong,
    position: jlong,
    callback: jlong,
) {
    let callback = callback as *const AsyncCallback;
    let callback = AsyncCallback::clone_from_ptr(callback);
    let bytes = env.new_global_ref(buffer).unwrap();
    runtime().spawn(async move {
        let jvm = JVM.get().unwrap();
        let env = jvm.attach_current_thread().unwrap();
        let data = env
            .get_primitive_array_critical(bytes.as_obj().into_inner(), ReleaseMode::NoCopyBack)
            .unwrap();
        let bytes = unsafe {
            std::slice::from_raw_parts_mut(
                data.as_ptr() as *mut u8,
                data.size().unwrap_or_default() as usize,
            )
        };
        match fs::sync::write(
            fd,
            bytes,
            offset.try_into().unwrap(),
            length.try_into().unwrap(),
            position.try_into().unwrap(),
        ) {
            Ok(wrote) => {
                // force drop of array to enable jni usage
                drop(data);
                callback.on_success(to_long(&env, wrote.try_into().unwrap()).into())
            }
            Err(error) => {
                // force drop of array to enable jni usage
                drop(data);
                callback.on_error(jni::objects::JValue::Object(
                    error_to_jstring(error).as_obj(),
                ))
            }
        }
    });
}

#[no_mangle]
pub extern "system" fn Java_org_nativescript_widgets_filesystem_FileSystem_nativeWriteString(
    _: JNIEnv,
    _: JClass,
    fd: jint,
    string: JString,
    encoding: JString,
    position: jlong,
    callback: jlong,
) {
    let callback = callback as *const AsyncCallback;
    let string = get_str(string, "");
    let encoding = get_str(encoding, "");

    let on_success = AsyncCallback::clone_from_ptr(callback);
    let callback = AsyncClosure::<usize, std::io::Error>::new(Box::new(move |success, error| {
        if error.is_some() {
            on_success.on_error(jni::objects::JValue::Object(
                error_to_jstring(error.unwrap()).as_obj(),
            ))
        } else {
            on_success.on_success((success.unwrap() as jlong).into())
        }
    }))
    .into_arc();
    fs::a_sync::write_string(
        fd,
        &string,
        &encoding,
        position.try_into().unwrap(),
        callback,
    );
}

#[no_mangle]
pub extern "system" fn Java_org_nativescript_widgets_filesystem_FileSystem_nativeWriteFileWithString(
    _: JNIEnv,
    _: JClass,
    fd: jint,
    data: JString,
    encoding: JString,
    callback: jlong,
) {
    let callback = callback as *const AsyncCallback;
    let data = get_str(data, "");
    let encoding = get_str(encoding, "");

    let on_success = AsyncCallback::clone_from_ptr(callback);
    let callback = AsyncClosure::<(), std::io::Error>::new(Box::new(move |_, error| {
        if error.is_some() {
            on_success.on_error(jni::objects::JValue::Object(
                error_to_jstring(error.unwrap()).as_obj(),
            ))
        } else {
            on_success.on_success(JObject::null().into())
        }
    }))
    .into_arc();
    fs::a_sync::write_file_with_str(fd, &data, &encoding, callback);
}

#[no_mangle]
pub extern "system" fn Java_org_nativescript_widgets_filesystem_FileSystem_nativeWriteFileWithBytes(
    env: JNIEnv,
    _: JClass,
    fd: jint,
    data: jbyteArray,
    callback: jlong,
) {
    nativeWriteFileWithBytes(env, fd, data, callback);
}

pub(crate) fn nativeWriteFileWithBytes(env: JNIEnv, fd: jint, data: jbyteArray, callback: jlong) {
    let callback = callback as *const AsyncCallback;
    let callback = AsyncCallback::clone_from_ptr(callback);
    let data = env.new_global_ref(data).unwrap();
    runtime().spawn(async move {
        let jvm = JVM.get().unwrap();
        let env = jvm.attach_current_thread().unwrap();
        let data = env
            .get_primitive_array_critical(data.as_obj().into_inner(), ReleaseMode::NoCopyBack)
            .unwrap();
        let bytes = unsafe {
            std::slice::from_raw_parts_mut(
                data.as_ptr() as *mut u8,
                data.size().unwrap_or_default() as usize,
            )
        };
        match fs::sync::write_file_with_bytes(fd, bytes) {
            Ok(_) => {
                // force drop of array to enable jni usage
                drop(data);
                callback.on_success(jni::objects::JValue::Object(jni::objects::JObject::null()))
            }
            Err(error) => {
                // force drop of array to enable jni usage
                drop(data);
                callback.on_error(jni::objects::JValue::Object(
                    error_to_jstring(error).as_obj(),
                ))
            }
        }
    });
}

#[no_mangle]
pub extern "system" fn Java_org_nativescript_widgets_filesystem_FileSystem_nativeWriteFileWithBuffer(
    env: JNIEnv,
    _: JClass,
    fd: jint,
    data: JByteBuffer,
    callback: jlong,
) {
    nativeWriteFileWithBuffer(env, fd, data, callback);
}

pub(crate) fn nativeWriteFileWithBuffer(env: JNIEnv, fd: jint, data: JByteBuffer, callback: jlong) {
    let callback = callback as *const AsyncCallback;
    let callback = AsyncCallback::clone_from_ptr(callback);
    let data = env.new_global_ref(data).unwrap();
    runtime().spawn(async move {
        let jvm = JVM.get().unwrap();
        let env = jvm.attach_current_thread().unwrap();
        let bytes = env
            .get_direct_buffer_address(JByteBuffer::from(data.as_obj()))
            .unwrap();
        match fs::sync::write_file_with_bytes(fd, bytes) {
            Ok(_) => {
                callback.on_success(jni::objects::JValue::Object(jni::objects::JObject::null()))
            }
            Err(error) => callback.on_error(jni::objects::JValue::Object(
                error_to_jstring(error).as_obj(),
            )),
        }
    });
}

#[no_mangle]
pub extern "system" fn Java_org_nativescript_widgets_filesystem_FileSystem_nativeWriteFileWithStringFromPath(
    _: JNIEnv,
    _: JClass,
    path: JString,
    data: JString,
    encoding: JString,
    mode: c_int,
    flag: c_int,
    callback: jlong,
) {
    let callback = callback as *const AsyncCallback;
    let path = get_str(path, "");
    let data = get_str(data, "");
    let encoding = get_str(encoding, "");

    let on_success = AsyncCallback::clone_from_ptr(callback);
    let callback = AsyncClosure::<(), std::io::Error>::new(Box::new(move |_, error| {
        if let Some(error) = error {
            on_success.on_error(jni::objects::JValue::Object(
                error_to_jstring(error).as_obj(),
            ))
        } else {
            on_success.on_success(JObject::null().into())
        }
    }))
    .into_arc();
    fs::a_sync::write_file_with_str_from_path(&path, &data, &encoding, mode, flag, callback);
}

#[no_mangle]
pub extern "system" fn Java_org_nativescript_widgets_filesystem_FileSystem_nativeWriteFileWithBytesFromPath(
    env: JNIEnv,
    _: JClass,
    path: JString,
    data: jbyteArray,
    encoding: JString,
    mode: c_int,
    flag: c_int,
    callback: jlong,
) {
    let callback = callback as *const AsyncCallback;
    let callback = AsyncCallback::clone_from_ptr(callback);
    let path = get_str(path, "");
    let encoding = get_str(encoding, "");
    let data = env.new_global_ref(data).unwrap();
    runtime().spawn(async move {
        let jvm = JVM.get().unwrap();
        let env = jvm.attach_current_thread().unwrap();
        let data = env
            .get_primitive_array_critical(data.as_obj().into_inner(), ReleaseMode::NoCopyBack)
            .unwrap();
        let bytes = unsafe {
            std::slice::from_raw_parts_mut(
                data.as_ptr() as *mut u8,
                data.size().unwrap_or_default() as usize,
            )
        };
        match fs::sync::write_file_with_bytes_from_path(&path, bytes, &encoding, mode, flag) {
            Ok(_) => {
                // force drop of array to enable jni usage
                drop(data);
                callback.on_success(JObject::null().into())
            }
            Err(error) => {
                // force drop of array to enable jni usage
                drop(data);
                callback.on_error(jni::objects::JValue::Object(
                    error_to_jstring(error).as_obj(),
                ))
            }
        }
    });
}

#[no_mangle]
pub extern "system" fn Java_org_nativescript_widgets_filesystem_FileSystem_nativeWriteFileWithBufferFromPath(
    env: JNIEnv,
    _: JClass,
    path: JString,
    data: JByteBuffer,
    encoding: JString,
    mode: c_int,
    flag: c_int,
    callback: jlong,
) {
    let callback = callback as *const AsyncCallback;
    let callback = AsyncCallback::clone_from_ptr(callback);
    let path = get_str(path, "");
    let encoding = get_str(encoding, "");
    let data = env.new_global_ref(data).unwrap();
    runtime().spawn(async move {
        let jvm = JVM.get().unwrap();
        let env = jvm.attach_current_thread().unwrap();
        let bytes = env
            .get_direct_buffer_address(JByteBuffer::from(data.as_obj()))
            .unwrap();
        match fs::sync::write_file_with_bytes_from_path(&path, bytes, &encoding, mode, flag) {
            Ok(_) => callback.on_success(JObject::null().into()),
            Err(error) => callback.on_error(jni::objects::JValue::Object(
                error_to_jstring(error).as_obj(),
            )),
        }
    });
}

#[no_mangle]
pub extern "system" fn Java_org_nativescript_widgets_filesystem_FileSystem_nativeWritev(
    env: JNIEnv,
    _: JClass,
    fd: jint,
    buffers: jobjectArray,
    position: jlong,
    callback: jlong,
) {
    nativeWritev(env, fd, buffers, position, callback);
}

pub(crate) fn nativeWritev(
    env: JNIEnv,
    fd: jint,
    buffers: jobjectArray,
    position: jlong,
    callback: jlong,
) {
    let callback = callback as *const AsyncCallback;
    let on_success = AsyncCallback::clone_from_ptr(callback);
    let buffers = env.new_global_ref(buffers).unwrap();
    runtime().spawn(async move {
        let jvm = JVM.get().unwrap();
        let env = jvm.attach_current_thread().unwrap();
        let array = buffers.as_obj().into_inner();
        let size = env.get_array_length(array).unwrap_or_default();
        let mut buf = Vec::<ByteBuf>::with_capacity(size.try_into().unwrap());
        for i in 0..size {
            let bytebuf = JByteBuffer::from(env.get_object_array_element(array, i).unwrap());
            let address = env.get_direct_buffer_address(bytebuf).unwrap();
            buf.push(ByteBuf::new(address.as_ptr(), address.len()))
        }
        match fs::sync::writev(fd, buf, position.try_into().unwrap()) {
            Ok(wrote) => {
                on_success.on_success(to_long(&env, wrote.try_into().unwrap()).into());
            }
            Err(error) => on_success.on_error(jni::objects::JValue::Object(
                error_to_jstring(error).as_obj(),
            )),
        }
    });
}
