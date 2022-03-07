use jni::objects::{JByteBuffer, JClass, JObject, JString};
use jni::sys::{jbyteArray, jint, jlong, jobjectArray};
use jni::JNIEnv;
use libc::c_int;

use crate::android::fs::a_sync::AsyncCallback;
use crate::android::prelude::*;
use crate::android::FILE_HANDLE_CLASS;
use crate::android::JVM;
use crate::common::fs;
use crate::common::fs::a_sync::AsyncClosure;
use crate::common::fs::file_handle::FileHandle;
use crate::common::fs::file_stat::FileStat;

fn build_file_handle<'a>(env: &'a JNIEnv, handle: FileHandle) -> JObject<'a> {
    let clazz = find_class(FILE_HANDLE_CLASS).unwrap();
    let object = env.new_object(clazz, "()V", &[]).unwrap();
    let ptr = Box::into_raw(Box::new(handle));
    let _ = env.set_field(object, "nativeFileHandle", "J", (ptr as i64).into());
    object
}

#[no_mangle]
pub extern "system" fn Java_org_nativescript_widgets_filesystem_FileHandle_nativeOpenSync(
    env: JNIEnv,
    _: JClass,
    fd: jint,
) -> jlong {
    match fs::sync::open_handle_with_fd(fd) {
        Ok(handle) => (Box::into_raw(Box::new(handle)) as i64).into(),
        Err(error) => {
            let _ = env.throw(error.to_string());
            0
        }
    }
}

#[no_mangle]
pub extern "system" fn Java_org_nativescript_widgets_filesystem_FileHandle_nativeOpen(
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
        if let Some(error) = error {
            on_success.on_error(jni::objects::JValue::Object(
                error_to_jstring(error).as_obj(),
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
pub extern "system" fn Java_org_nativescript_widgets_filesystem_FileHandle_nativeAppendFileWithBytes(
    env: JNIEnv,
    _: JClass,
    handle: jlong,
    bytes: jbyteArray,
    callback: jlong,
) {
    let handle = handle as *mut FileHandle;
    let handle = unsafe { &mut *handle };

    super::a_sync::nativeAppendFileWithBytes(env, handle.fd(), bytes, callback);
}

#[no_mangle]
pub extern "system" fn Java_org_nativescript_widgets_filesystem_FileHandle_nativeAppendFileWithString(
    _: JNIEnv,
    _: JClass,
    handle: jlong,
    data: JString,
    callback: jlong,
) {
    let handle = handle as *mut FileHandle;
    let handle = unsafe { &mut *handle };

    super::a_sync::nativeAppendFileWithString(handle.fd(), data, callback);
}

#[no_mangle]
pub extern "system" fn Java_org_nativescript_widgets_filesystem_FileHandle_nativeChmod(
    _: JNIEnv,
    _: JClass,
    handle: jlong,
    mode: jint,
    callback: jlong,
) {
    let handle = handle as *mut FileHandle;
    let handle = unsafe { &mut *handle };

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
    handle.chmod(mode.try_into().unwrap(), callback);
}

#[no_mangle]
pub extern "system" fn Java_org_nativescript_widgets_filesystem_FileHandle_nativeChown(
    _: JNIEnv,
    _: JClass,
    handle: jlong,
    uid: jint,
    gid: jint,
    callback: jlong,
) {
    let handle = handle as *mut FileHandle;
    let handle = unsafe { &mut *handle };
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
    handle.chown(uid as u32, gid as u32, callback);
}

#[no_mangle]
pub extern "system" fn Java_org_nativescript_widgets_filesystem_FileHandle_nativeClose(
    _: JNIEnv,
    _: JClass,
    handle: jlong,
    callback: jlong,
) {
    let handle = unsafe { *Box::from_raw(handle as *mut FileHandle) };
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
    handle.close(callback);
}

#[no_mangle]
pub extern "system" fn Java_org_nativescript_widgets_filesystem_FileSystem_nativeDatasync(
    _: JNIEnv,
    _: JClass,
    handle: jint,
    callback: jlong,
) {
    let handle = handle as *mut FileHandle;
    let handle = unsafe { &mut *handle };

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
    handle.datasync(callback);
}

#[no_mangle]
pub extern "system" fn Java_org_nativescript_widgets_filesystem_FileHandle_nativeGetFd(
    _: JNIEnv,
    _: JClass,
    handle: jint,
) -> jint {
    let handle = handle as *mut FileHandle;
    let handle = unsafe { &mut *handle };
    handle.fd()
}

#[no_mangle]
pub extern "system" fn Java_org_nativescript_widgets_filesystem_FileHandle_nativeRead(
    env: JNIEnv,
    _: JClass,
    handle: jlong,
    buffer: JByteBuffer,
    offset: jlong,
    length: jlong,
    position: jlong,
    callback: jlong,
) {
    let handle = handle as *mut FileHandle;
    let handle = unsafe { &mut *handle };
    super::a_sync::nativeRead(env, handle.fd(), buffer, offset, length, position, callback);
}

#[no_mangle]
pub extern "system" fn Java_org_nativescript_widgets_filesystem_FileHandle_nativeReadWithBytes(
    env: JNIEnv,
    _: JClass,
    handle: jlong,
    buffer: jbyteArray,
    offset: jlong,
    length: jlong,
    position: jlong,
    callback: jlong,
) {
    let handle = handle as *mut FileHandle;
    let handle = unsafe { &mut *handle };
    super::a_sync::nativeReadWithBytes(
        env,
        handle.fd(),
        buffer,
        offset,
        length,
        position,
        callback,
    );
}

#[no_mangle]
pub extern "system" fn Java_org_nativescript_widgets_filesystem_FileHandle_nativeReadv(
    env: JNIEnv,
    _: JClass,
    handle: jlong,
    buffers: jobjectArray,
    position: jlong,
    callback: jlong,
) {
    let handle = handle as *mut FileHandle;
    let handle = unsafe { &mut *handle };

    super::a_sync::nativeReadv(env, handle.fd(), buffers, position, callback);
}

#[no_mangle]
pub extern "system" fn Java_org_nativescript_widgets_filesystem_FileHandle_nativeStat(
    _: JNIEnv,
    _: JClass,
    handle: jlong,
    callback: jlong,
) {
    let handle = handle as *mut FileHandle;
    let handle = unsafe { &mut *handle };

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

    handle.stat(callback);
}

#[no_mangle]
pub extern "system" fn Java_org_nativescript_widgets_filesystem_FileSystem_nativeSync(
    _: JNIEnv,
    _: JClass,
    handle: jlong,
    callback: jlong,
) {
    let handle = handle as *mut FileHandle;
    let handle = unsafe { &mut *handle };

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
    handle.sync(callback);
}

#[no_mangle]
pub extern "system" fn Java_org_nativescript_widgets_filesystem_FileHandle_nativeTruncate(
    _: JNIEnv,
    _: JClass,
    handle: jlong,
    len: jlong,
    callback: jlong,
) {
    let handle = handle as *mut FileHandle;
    let handle = unsafe { &mut *handle };

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
    handle.truncate(len.try_into().unwrap(), callback);
}

#[no_mangle]
pub extern "system" fn Java_org_nativescript_widgets_filesystem_FileHandle_nativeUtimes(
    _: JNIEnv,
    _: JClass,
    handle: jlong,
    atime: jlong,
    mtime: jlong,
    callback: jlong,
) {
    let handle = handle as *mut FileHandle;
    let handle = unsafe { &mut *handle };

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

    handle.utimes(
        atime.try_into().unwrap(),
        mtime.try_into().unwrap(),
        callback,
    );
}

#[no_mangle]
pub extern "system" fn Java_org_nativescript_widgets_filesystem_FileHandle_nativeWrite(
    env: JNIEnv,
    _: JClass,
    handle: jlong,
    buffer: JByteBuffer,
    offset: jlong,
    length: jlong,
    position: jlong,
    callback: jlong,
) {
    let handle = handle as *mut FileHandle;
    let handle = unsafe { &mut *handle };

    super::a_sync::nativeWrite(env, handle.fd(), buffer, offset, length, position, callback);
}

#[no_mangle]
pub extern "system" fn Java_org_nativescript_widgets_filesystem_FileHandle_nativeWriteBytes(
    env: JNIEnv,
    _: JClass,
    handle: jlong,
    buffer: jbyteArray,
    offset: jlong,
    length: jlong,
    position: jlong,
    callback: jlong,
) {
    let handle = handle as *mut FileHandle;
    let handle = unsafe { &mut *handle };

    super::a_sync::nativeWriteBytes(env, handle.fd(), buffer, offset, length, position, callback);
}

#[no_mangle]
pub extern "system" fn Java_org_nativescript_widgets_filesystem_FileHandle_nativeWriteString(
    _: JNIEnv,
    _: JClass,
    handle: jlong,
    string: JString,
    encoding: JString,
    position: jlong,
    callback: jlong,
) {
    let handle = handle as *mut FileHandle;
    let handle = unsafe { &mut *handle };

    let callback = callback as *const AsyncCallback;
    let string = get_str(string, "");
    let encoding = get_str(encoding, "");

    let on_success = AsyncCallback::clone_from_ptr(callback);
    let callback = AsyncClosure::<usize, std::io::Error>::new(Box::new(move |success, error| {
        if let Some(error) = error {
            on_success.on_error(jni::objects::JValue::Object(
                error_to_jstring(error).as_obj(),
            ))
        } else {
            on_success.on_success((success.unwrap() as jlong).into())
        }
    }))
    .into_arc();
    handle.write_string(&string, &encoding, position.try_into().unwrap(), callback);
}

#[no_mangle]
pub extern "system" fn Java_org_nativescript_widgets_filesystem_FileHandle_nativeWriteFileWithString(
    _: JNIEnv,
    _: JClass,
    handle: jint,
    data: JString,
    encoding: JString,
    callback: jlong,
) {
    let handle = handle as *mut FileHandle;
    let handle = unsafe { &mut *handle };

    let callback = callback as *const AsyncCallback;
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
    handle.write_file_with_str(&data, &encoding, callback);
}

#[no_mangle]
pub extern "system" fn Java_org_nativescript_widgets_filesystem_FileHandle_nativeWriteFileWithBytes(
    env: JNIEnv,
    _: JClass,
    handle: jlong,
    data: jbyteArray,
    callback: jlong,
) {
    let handle = handle as *mut FileHandle;
    let handle = unsafe { &mut *handle };

    super::a_sync::nativeWriteFileWithBytes(env, handle.fd(), data, callback);
}

#[no_mangle]
pub extern "system" fn Java_org_nativescript_widgets_filesystem_FileHandle_nativeWriteFileWithBuffer(
    env: JNIEnv,
    _: JClass,
    handle: jlong,
    data: JByteBuffer,
    callback: jlong,
) {
    let handle = handle as *mut FileHandle;
    let handle = unsafe { &mut *handle };

    super::a_sync::nativeWriteFileWithBuffer(env, handle.fd(), data, callback);
}

#[no_mangle]
pub extern "system" fn Java_org_nativescript_widgets_filesystem_FileHandle_nativeWritev(
    env: JNIEnv,
    _: JClass,
    handle: jlong,
    buffers: jobjectArray,
    position: jlong,
    callback: jlong,
) {
    let handle = handle as *mut FileHandle;
    let handle = unsafe { &mut *handle };

    super::a_sync::nativeWritev(env, handle.fd(), buffers, position, callback);
}
