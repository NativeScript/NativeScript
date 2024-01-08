#!/bin/bash

cbindgen --config crates/libs/nativescript-core/cbindgen.toml  crates/libs/nativescript-core/src/lib.rs -l c > crates/libs/nativescript-core/include/nativescript_core.h
cbindgen --config crates/libs/nativescript-core/cbindgen.toml  crates/libs/nativescript-core/src/lib.rs -l c > packages/core/platforms/ios/src/cpp/include/nativescript_core.h
cbindgen --config crates/libs/nativescript-core/cbindgen.toml  crates/libs/nativescript-core/src/lib.rs -l c > packages/ui-mobile-base/android/widgets/src/main/cpp/include/nativescript_core.h
