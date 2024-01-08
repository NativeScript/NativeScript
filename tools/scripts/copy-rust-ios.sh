#! /bin/bash
LIB_NAME="nativescriptcore"
FRAMEWORK="NativeScriptCore"

cp -r ./crates/libs/nativescript-core/include packages/core/platforms/ios/src/cpp
cp -r target/$FRAMEWORK.xcframework packages/core/platforms/ios
rm -rf target/$FRAMEWORK.xcframework
rm target/simulator_fat/lib$LIB_NAME.dylib