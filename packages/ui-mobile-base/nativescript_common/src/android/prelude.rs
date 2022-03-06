use std::ffi::{c_void, CString};
use std::ptr::NonNull;

use jni::JNIEnv;
use jni::objects::{GlobalRef, JClass, JObject, JString};
use jni::sys::{jboolean, jobject};
use libc::{c_char, c_double, c_float, c_int};
use log::log;

use crate::android::{BOOLEAN_CLASS, DOUBLE_CLASS, FLOAT_CLASS, INTEGER_CLASS, JVM, JVM_CLASS_CACHE, LONG_CLASS};

pub fn find_class(name: &str) -> Option<JClass> {
    JVM_CLASS_CACHE.get().map_or(None, |c| c.read().get(name).map(|c| JClass::from(c.as_obj().into_inner())))
}

pub fn to_boolean<'a>(env: &JNIEnv<'a>, value: bool) -> JObject<'a> {
    let integer = find_class(BOOLEAN_CLASS).unwrap();
    env.new_object(integer, "(Z)V", &[
        value.into()
    ]).unwrap()
}

pub fn to_integer<'a>(env: &JNIEnv<'a>, value: c_int) -> JObject<'a> {
    let integer = find_class(INTEGER_CLASS).unwrap();
    env.new_object(integer, "(I)V", &[
        value.into()
    ]).unwrap()
}

pub fn to_long<'a>(env: &JNIEnv<'a>, value: c_int) -> JObject<'a> {
    let integer = find_class(LONG_CLASS).unwrap();
    env.new_object(integer, "(J)V", &[
        value.into()
    ]).unwrap()
}

pub fn to_float<'a>(env: &JNIEnv<'a>, value: c_float) -> JObject<'a> {
    let integer = find_class(FLOAT_CLASS).unwrap();
    env.new_object(integer, "(F)V", &[
        value.into()
    ]).unwrap()
}

pub fn to_double<'a>(env: &JNIEnv<'a>, value: c_double) -> JObject<'a> {
    let integer = find_class(DOUBLE_CLASS).unwrap();
    env.new_object(integer, "(D)V", &[
        value.into()
    ]).unwrap()
}

pub fn error_to_jstring(val: std::io::Error) -> GlobalRef {
    // should always be value since it's created after the library loads
    let vm = JVM.get().unwrap();
    let env = vm.attach_current_thread().unwrap();
    //
    env.new_global_ref(
        env.new_string(
            val.to_string()
        ).unwrap()
    ).unwrap()
}

pub fn get_str(string: JString, default: &str) -> String {
    let vm = JVM.get().unwrap();
    let env = vm.attach_current_thread().unwrap();
    env.get_string(string).map_or(default.to_string(), |v| {
        v.to_string_lossy().to_string()
    })
}

pub fn to_jboolean(value: bool) -> jboolean {
    if value {
        1
    } else {
        0
    }
}