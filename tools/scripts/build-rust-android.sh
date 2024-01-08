#!/bin/bash

TARGET="$1"

if [ "$TARGET" = "" ]; then
    echo "missing argument TARGET"
    echo "Usage: $0 TARGET"
    exit 1
fi

NDK_TARGET=$TARGET

# if [ "$TARGET" = "arm-linux-androideabi" ]; then
#     NDK_TARGET="armv7a-linux-androideabi"
# fi

API_VERSION="21"
NDK_VERSION="23.1.7779620"
NDK_HOST="darwin-x86_64"

# needed so we can overwrite it in the CI
if [ -z "$NDK" ]; then
  NDK="$ANDROID_HOME/ndk/$NDK_VERSION"
fi

TOOLS="$NDK/toolchains/llvm/prebuilt/$NDK_HOST"

AR=$TOOLS/bin/llvm-ar \
CXX=$TOOLS/bin/${NDK_TARGET}${API_VERSION}-clang++ \
RANLIB=$TOOLS/bin/llvm-ranlib \
CXXFLAGS="--target=$NDK_TARGET" \
cargo +nightly build -Z build-std='std,panic_abort'  -Z build-std-features=panic_immediate_abort --target $TARGET --release $EXTRA_ARGS -p nativescript-core