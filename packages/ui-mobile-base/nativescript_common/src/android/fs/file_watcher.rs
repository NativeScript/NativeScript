use std::collections::HashMap;
use std::sync::Arc;

use jni::objects::{JClass, JObject, JString};
use jni::sys::{jboolean, jlong, jobject, JNI_TRUE};
use jni::JNIEnv;
use once_cell::sync::OnceCell;
use parking_lot::Mutex;


use crate::android::fs::file_stat::build_stat_op;
use crate::android::prelude::*;
use crate::android::{FILE_WATCHER_CLASS, FILE_WATCHER_EVENT_CLASS, JVM};
use crate::common::fs;
use crate::common::fs::a_sync::{AsyncClosure, FileWatchEvent};

use super::a_sync::AsyncCallback;

type FileWatcherCallbackMap = Arc<Mutex<HashMap<Arc<AsyncCallback>, FileWatcherCallback>>>;

pub struct FileWatcherCallback {
    callback: Arc<AsyncCallback>,
    inner: Arc<AsyncClosure<FileWatchEvent, std::io::Error>>,
}

fn file_watcher_callback_map() -> &'static FileWatcherCallbackMap {
    static INSTANCE: OnceCell<FileWatcherCallbackMap> = OnceCell::new();
    INSTANCE.get_or_init(|| Arc::new(Mutex::new(HashMap::new())))
}

fn build_watch_file<'a>(env: &JNIEnv<'a>, file_name: &str, callback: jlong) -> JObject<'a> {
    let clazz = find_class(FILE_WATCHER_CLASS).unwrap();
    let object = env.new_object(clazz, "()V", &[]).unwrap();
    let _ = env.set_field(
        object,
        "fileName",
        "Ljava/lang/String",
        env.new_string(file_name).unwrap().into(),
    );
    let _ = env.set_field(object, "callback", "J", callback.into());
    object
}
fn build_file_watch_event<'a>(env: &JNIEnv<'a>, event: FileWatchEvent) -> JObject<'a> {
    let clazz = find_class(FILE_WATCHER_EVENT_CLASS).unwrap();
    let object = env
        .new_object(clazz, "()V", &[])
        .unwrap();
    let current = build_stat_op(env, event.current);
    let previous = build_stat_op(env, event.previous);
    let _ = env.set_field(
        object,
        "previous",
        "Lorg/nativescript/widgets/filesystem/FileStat",
        previous.into(),
    );
    let _ = env.set_field(
        object,
        "current",
        "Lorg/nativescript/widgets/filesystem/FileStat",
        current.into(),
    );
    object
}

#[no_mangle]
pub extern "system" fn Java_org_nativescript_widgets_filesystem_FileSystem_nativeWatchFile(
    env: JNIEnv,
    _: JClass,
    path: JString,
    bigint: jboolean,
    persistent: jboolean,
    interval: jlong,
    callback: jlong,
) -> jobject {
    let cb = callback;
    let callback = unsafe { callback as *const AsyncCallback };
    let callback = AsyncCallback::clone_from_ptr(callback);
    let on_success = Arc::clone(&callback);
    let item = FileWatcherCallback {
        callback: Arc::clone(&callback),
        inner: Arc::new(AsyncClosure {
            callback: Box::new(move |event, error| {
                let jvm = JVM.get().unwrap();
                let env = jvm.attach_current_thread().unwrap();
                if error.is_some() {
                    on_success.on_error(jni::objects::JValue::Object(
                        error_to_jstring(error.unwrap()).as_obj(),
                    ))
                } else {
                    on_success.on_success(build_file_watch_event(&env, event.unwrap()).into())
                }
            }),
        }),
    };
    // call on another thread ?
    let mut map = file_watcher_callback_map().lock();
    let inner = Arc::clone(&item.inner);
    let _ = map.insert(callback, item);

    let path = get_str(path, "");
    fs::a_sync::watch_file(
        path.as_ref(),
        bigint == JNI_TRUE,
        persistent == JNI_TRUE,
        interval.try_into().unwrap(),
        inner,
    );

    build_watch_file(&env, path.as_ref(), cb).into_inner()
}

#[no_mangle]
pub extern "system" fn Java_org_nativescript_widgets_filesystem_FileWatcher_nativeUnref(
    _: JNIEnv,
    _: JClass,
    filename: JString,
    callback: jlong,
) {
    let callback = unsafe { callback as *const AsyncCallback };
    let callback = AsyncCallback::clone_from_ptr(callback);
    let mut map = file_watcher_callback_map().lock();
    let item = map
        .get(&callback)
        .map(|i| (Arc::clone(&i.callback), Arc::clone(&i.inner)));
    if let Some(item) = item {
        fs::a_sync::file_watcher_unref(get_str(filename, "").as_ref(), item.1);
        map.remove(&item.0);
    }
}

#[no_mangle]
pub extern "system" fn Java_org_nativescript_widgets_filesystem_FileWatchEvent_nativeUnref(
    _: JNIEnv,
    _: JClass,
    filename: JString,
    callback: jlong,
) {
    let callback = unsafe { callback as *const AsyncCallback };
    let callback = AsyncCallback::clone_from_ptr(callback);
    let on_success = Arc::clone(&callback);

    let mut map = file_watcher_callback_map().lock();

    if map.contains_key(&callback) {
        return;
    }

    let inner = Arc::new(AsyncClosure {
        callback: Box::new(move |event: Option<FileWatchEvent>, error| {
            let jvm = JVM.get().unwrap();
            let env = jvm.attach_current_thread().unwrap();
            if error.is_some() {
                on_success.on_error(jni::objects::JValue::Object(
                    error_to_jstring(error.unwrap()).as_obj(),
                ))
            } else {
                on_success.on_success(build_file_watch_event(&env, event.unwrap()).into())
            }
        }),
    });
    let item = FileWatcherCallback {
        callback: Arc::clone(&callback),
        inner: Arc::clone(&inner),
    };

    map.insert(Arc::clone(&callback), item);

    fs::a_sync::file_watcher_ref(get_str(filename, "").as_ref(), inner);
}
