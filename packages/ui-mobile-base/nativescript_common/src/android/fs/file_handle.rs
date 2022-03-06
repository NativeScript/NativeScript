// use jni::JNIEnv;
// use jni::objects::{JClass, JObject};
//
// use crate::android::FILE_HANDLE_CLASS;
// use crate::android::fs::a_sync::AsyncCallback;
// use crate::android::JVM;
// use crate::android::prelude::*;
// use crate::common::fs;
// use crate::common::fs::a_sync::runtime;
// use crate::common::fs::file_handle::FileHandle;
//
// fn build_file_handle<'a>(env: &'a JNIEnv, handle: FileHandle) -> JObject<'a> {
//     let clazz = find_class(FILE_HANDLE_CLASS).unwrap();
//     let object = env.new_object(clazz, "()V", &[]).unwrap();
//     let ptr = Box::into_raw(Box::new(handle));
//     let _ = env.set_field(object, "nativeFileHandle", "J", (ptr as i64).into());
//     object
// }
//
// #[no_mangle]
// pub extern "system" fn Java_org_nativescript_widgets_filesystem_FileHandle_nativeInit(
//     env: JNIEnv,
//     _: JClass,
//     fd: jint,
// ) -> jlong {
//     match fs::sync::open_handle_with_fd(fd) {
//         Ok(handle) => {
//             Box::into_raw(Box::new(handle)) as i64;
//         }
//         Err(error) => {
//             env.throw(error.to_string());
//             0
//         }
//     }
// }
//
// #[no_mangle]
// pub extern "system" fn Java_org_nativescript_widgets_filesystem_FileHandle_nativeOpen(
//     _: JNIEnv,
//     _: JClass,
//     path: JString,
//     flags: jint,
//     mode: jint,
//     callback: jlong,
// ) {
//     let callback = unsafe { callback as *const AsyncCallback };
//     let on_success = AsyncCallback::clone_from_ptr(callback);
//     let callback = AsyncClosure::<c_int, std::io::Error>::new(Box::new(move |success, error| {
//         if error.is_some() {
//             on_success.on_error(jni::objects::JValue::Object(
//                 error_to_jstring(error.unwrap()).as_obj(),
//             ))
//         } else {
//             let jvm = JVM.get().unwrap();
//             let env = jvm.attach_current_thread().unwrap();
//             on_success.on_success(to_integer(&env, success.unwrap().into()).into())
//         }
//     }))
//     .into_arc();
//     let path = get_str(path, "");
//     fs::a_sync::open(&path, flags, mode, callback);
//
//     runtime().spawn(async move {
//         let jvm = JVM.get().unwrap();
//         let env = jvm.attach_current_thread().unwrap();
//         match fs::sync::open_handle_with_path_str(&path, flags, mode) {
//             Ok(handle) => {
//                 on_success.on_success(
//                     build_file_handle(&env, handle).into()
//                 );
//             }
//             Err(error) => on_success.on_error(jni::objects::JValue::Object(
//                 error_to_jstring(error).as_obj(),
//             )),
//         }
//     });
// }
