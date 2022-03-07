use std::ffi::OsString;
use std::sync::Arc;

use jni::objects::{JClass, JObject, JValue};
use jni::sys::{jboolean, jlong, jobjectArray, JNI_FALSE};
use jni::{sys::jobject, JNIEnv};

use crate::android::prelude::*;
use crate::android::{FILE_DIRENT_CLASS, OBJECT_CLASS, STRING_CLASS};
use crate::common::fs::file_dirent::FileDirent;

use super::a_sync::AsyncCallback;

pub(crate) fn build_dirent<'a>(env: &JNIEnv<'a>, dirent: FileDirent) -> JObject<'a> {
    let clazz = find_class(FILE_DIRENT_CLASS).unwrap();
    let dirent = Box::into_raw(Box::new(dirent));
    env.new_object(clazz, "(J)V", &[(dirent as i64).into()])
        .unwrap()
}

pub(crate) fn build_dirents(env: &JNIEnv, dirent: Vec<FileDirent>) -> jobjectArray {
    let mut dirent = dirent;
    let object_clazz = find_class(OBJECT_CLASS).unwrap();
    let clazz = find_class(FILE_DIRENT_CLASS).unwrap();
    let mut object_array = env
        .new_object_array(
            dirent.len().try_into().unwrap(),
            object_clazz,
            JObject::null(),
        )
        .unwrap();

    for (i, dirent) in dirent.iter_mut().enumerate() {
        let dirent = FileDirent(Arc::clone(&dirent.0));
        let dirent = Box::into_raw(Box::new(dirent));
        let res = env
            .new_object(clazz, "(J)V", &[(dirent as i64).into()])
            .unwrap();
        let _ = env.set_object_array_element(object_array, i.try_into().unwrap(), res);
    }

    object_array
}

pub(crate) fn build_dirents_paths(env: &JNIEnv, dirent: Vec<OsString>) -> jobjectArray {
    let mut dirent = dirent;
    let clazz = find_class(OBJECT_CLASS).unwrap();
    let mut object_array = env
        .new_object_array(dirent.len().try_into().unwrap(), clazz, JObject::null())
        .unwrap();

    for (i, dirent) in dirent.iter_mut().enumerate() {
        let dirent = env.new_string(dirent.to_string_lossy()).unwrap();
        let _ = env.set_object_array_element(object_array, i.try_into().unwrap(), dirent);
    }

    object_array
}

#[no_mangle]
pub extern "system" fn Java_org_nativescript_widgets_filesystem_FileDirent_nativeDispose(
    _: JNIEnv,
    _: JClass,
    file_dirent: jlong,
) {
    let dirent: *mut FileDirent = file_dirent as _;
    if !dirent.is_null() {
        let _ = unsafe { Box::from_raw(dirent) };
    }
}

#[no_mangle]
pub extern "system" fn Java_org_nativescript_widgets_filesystem_FileDirent_nativeName(
    env: JNIEnv,
    _: JClass,
    file_dirent: jlong,
) -> jobject {
    let dirent: *mut FileDirent = file_dirent as _;
    if !dirent.is_null() {
        let dirent = unsafe { &*dirent };
        return env.new_string(dirent.name()).unwrap().into_inner();
    }
    JObject::null().into_inner()
}

#[no_mangle]
pub extern "system" fn Java_org_nativescript_widgets_filesystem_FileDirent_nativeIsBlockDevice(
    _: JNIEnv,
    _: JClass,
    file_dirent: jlong,
) -> jboolean {
    let dirent: *mut FileDirent = file_dirent as _;
    if !dirent.is_null() {
        let dirent = unsafe { &*dirent };
        return dirent.is_block_device().into();
    }
    JNI_FALSE
}

#[no_mangle]
pub extern "system" fn Java_org_nativescript_widgets_filesystem_FileDirent_nativeIsCharacterDevice(
    _: JNIEnv,
    _: JClass,
    file_dirent: jlong,
) -> jboolean {
    let dirent: *mut FileDirent = file_dirent as _;
    if !dirent.is_null() {
        let dirent = unsafe { &*dirent };
        return dirent.is_character_device().into();
    }
    JNI_FALSE
}

#[no_mangle]
pub extern "system" fn Java_org_nativescript_widgets_filesystem_FileDirent_nativeIsDirectory(
    _: JNIEnv,
    _: JClass,
    file_dirent: jlong,
) -> jboolean {
    let dirent: *mut FileDirent = file_dirent as _;
    if !dirent.is_null() {
        let dirent = unsafe { &*dirent };
        return dirent.is_directory().into();
    }
    JNI_FALSE
}

#[no_mangle]
pub extern "system" fn Java_org_nativescript_widgets_filesystem_FileDirent_nativeIsFifo(
    _: JNIEnv,
    _: JClass,
    file_dirent: jlong,
) -> jboolean {
    let dirent: *mut FileDirent = file_dirent as _;
    if !dirent.is_null() {
        let dirent = unsafe { &*dirent };
        return dirent.is_fifo().into();
    }
    JNI_FALSE
}

#[no_mangle]
pub extern "system" fn Java_org_nativescript_widgets_filesystem_FileDirent_nativeIsFile(
    _: JNIEnv,
    _: JClass,
    file_dirent: jlong,
) -> jboolean {
    let dirent: *mut FileDirent = file_dirent as _;
    if !dirent.is_null() {
        let dirent = unsafe { &*dirent };
        return dirent.is_file().into();
    }
    JNI_FALSE
}

#[no_mangle]
pub extern "system" fn Java_org_nativescript_widgets_filesystem_FileDirent_nativeIsSocket(
    _: JNIEnv,
    _: JClass,
    file_dirent: jlong,
) -> jboolean {
    let dirent: *mut FileDirent = file_dirent as _;
    if !dirent.is_null() {
        let dirent = unsafe { &*dirent };
        return dirent.is_socket().into();
    }
    JNI_FALSE
}

#[no_mangle]
pub extern "system" fn Java_org_nativescript_widgets_filesystem_FileDirent_nativeIsSymbolicLink(
    _: JNIEnv,
    _: JClass,
    file_dirent: jlong,
) -> jboolean {
    let dirent: *mut FileDirent = file_dirent as _;
    if !dirent.is_null() {
        let dirent = unsafe { &*dirent };
        return dirent.is_symbolic_link().into();
    }
    JNI_FALSE
}
