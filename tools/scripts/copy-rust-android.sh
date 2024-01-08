#! /bin/bash
COPY_DIR="packages/ui-mobile-base/android/widgets/src/main/jniLibs"
NAME="nativescriptcore"
LIB_NAME="lib$NAME"

rm -rf $COPY_DIR

mkdir -p $COPY_DIR
mkdir -p $COPY_DIR/x86
mkdir -p $COPY_DIR/x86_64
mkdir -p $COPY_DIR/arm64-v8a
mkdir -p $COPY_DIR/armeabi-v7a

cp ./target/i686-linux-android/release/$LIB_NAME.so $COPY_DIR/x86/$LIB_NAME.so
cp ./target/x86_64-linux-android/release/$LIB_NAME.so $COPY_DIR/x86_64/$LIB_NAME.so
cp ./target/aarch64-linux-android/release/$LIB_NAME.so $COPY_DIR/arm64-v8a/$LIB_NAME.so
cp ./target/armv7-linux-androideabi/release/$LIB_NAME.so $COPY_DIR/armeabi-v7a/$LIB_NAME.so

mkdir -p packages/ui-mobile-base/android/widgets/src/main/cpp/$NAME
cp -r ./crates/libs/nativescript-core/include packages/ui-mobile-base/android/widgets/src/main/cpp/$NAME

echo "Dynamic libraries copied!"