#![feature(unix_chown)]
#![feature(io_error_more)]
extern crate core;
#[cfg(any(target_os = "ios", target_os = "macos"))]
#[macro_use]
extern crate objc;

pub mod common;

#[cfg(target_os = "android")]
#[allow(non_snake_case)]
pub mod android;

#[cfg(any(target_os = "ios", target_os = "macos"))]
pub mod ios;

