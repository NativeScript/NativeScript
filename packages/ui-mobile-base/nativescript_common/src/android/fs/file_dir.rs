use jni::objects::{JClass, JObject};
use jni::sys::jlong;
use jni::{sys::jobject, JNIEnv};

use crate::android::prelude::*;
use crate::android::FILE_DIR_CLASS;
use crate::android::JVM;
use crate::common::fs::file_dir::FileDir;

use super::a_sync::AsyncCallback;
use super::file_dirent::build_dirent;

pub(crate) fn build_dir<'a>(env: &JNIEnv<'a>, dir: FileDir) -> JObject<'a> {
    let clazz = find_class(FILE_DIR_CLASS).unwrap();
    let dir = Box::into_raw(Box::new(dir));
    env.new_object(clazz, "(J)V", &[(dir as i64).into()])
        .unwrap()
}

#[no_mangle]
pub extern "system" fn Java_org_nativescript_widgets_filesystem_FileDir_nativeCloseSync(
    env: JNIEnv,
    _: JClass,
    file_dir: jlong,
) {
    let dir: *mut FileDir = file_dir as _;
    if !dir.is_null() {
        let mut dir = unsafe { Box::from_raw(dir) };
        let result = dir.close();
        if let Err(error) = result {
            let _ = env.throw(error.to_string());
        }
    }
}

#[no_mangle]
pub extern "system" fn Java_org_nativescript_widgets_filesystem_FileDir_nativeClose(
    _: JNIEnv,
    _: JClass,
    file_dir: jlong,
    callback: jlong,
) {
    let callback = unsafe { callback as *const AsyncCallback };
    let on_success = AsyncCallback::clone_from_ptr(callback);
    let dir: *mut FileDir = file_dir as _;
    if !dir.is_null() {
        let mut dir = unsafe { Box::from_raw(dir) };
        dir.close_async(Box::new(move |error| {
            if let Some(error) = error {
                on_success.on_error(jni::objects::JValue::Object(
                    error_to_jstring(error).as_obj(),
                ))
            } else {
                on_success.on_success(jni::objects::JObject::null().into())
            }
        }));
    }
}

#[no_mangle]
pub extern "system" fn Java_org_nativescript_widgets_filesystem_FileDir_nativePath(
    env: JNIEnv,
    _: JClass,
    file_dir: jlong,
) -> jobject {
    let dir: *mut FileDir = file_dir as _;
    if !dir.is_null() {
        let mut dir = unsafe { Box::from_raw(dir) };
        return env.new_string(dir.path()).unwrap().into_inner();
    }
    JObject::null().into_inner()
}

#[no_mangle]
pub extern "system" fn Java_org_nativescript_widgets_filesystem_FileDir_nativeDispose(
    _env: JNIEnv,
    _: JClass,
    file_dir: jlong,
) {
    let dir: *mut FileDir = file_dir as _;
    if !dir.is_null() {
        let _ = unsafe { Box::from_raw(dir) };
    }
}

#[no_mangle]
pub extern "system" fn Java_org_nativescript_widgets_filesystem_FileDir_nativeReadSync(
    env: JNIEnv,
    _: JClass,
    file_dir: jlong,
) -> jobject {
    let dir: *mut FileDir = file_dir as _;
    if !dir.is_null() {
        let mut dir = unsafe { Box::from_raw(dir) };
        match dir.read() {
            Ok(dirent) => {
                return build_dirent(&env, dirent).into_inner();
            }
            Err(error) => {
                let _ = env.throw(error.to_string());
            }
        }
    }
    return JObject::null().into_inner();
}

#[no_mangle]
pub extern "system" fn Java_org_nativescript_widgets_filesystem_FileDir_nativeRead(
    _: JNIEnv,
    _: JClass,
    file_dir: jlong,
    callback: jlong,
) {
    let callback = unsafe { callback as *const AsyncCallback };
    let on_success = AsyncCallback::clone_from_ptr(callback);
    let dir: *mut FileDir = file_dir as _;
    if !dir.is_null() {
        let mut dir = unsafe { Box::from_raw(dir) };
        dir.read_async(Box::new(move |dirent, error| {
            if error.is_some() {
                on_success.on_error(jni::objects::JValue::Object(
                    error_to_jstring(error.unwrap()).as_obj(),
                ))
            } else {
                let jvm = JVM.get().unwrap();
                let env = jvm.attach_current_thread().unwrap();
                on_success.on_success(build_dirent(&env, dirent.unwrap()).into())
            }
        }));
    }
}
