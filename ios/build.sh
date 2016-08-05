#!/bin/sh

echo "Set exit on simple errors"
set -e

echo "Build for iphonesimulator"
xcodebuild -project TNSWidgets/TNSWidgets.xcodeproj -sdk iphonesimulator -target TNSWidgets -configuration Release clean build CONFIGURATION_BUILD_DIR=build/Release-iphonesimulator

echo "Build for iphoneos"
xcodebuild -project TNSWidgets/TNSWidgets.xcodeproj -sdk iphoneos -target TNSWidgets -configuration Release clean build CONFIGURATION_BUILD_DIR=build/Release-iphoneos CODE_SIGN_IDENTITY="" CODE_SIGNING_REQUIRED=NO

echo "Build fat framework at TNSWidgets/build/TNSWidgets.framework"
rm -rf TNSWidgets/build/TNSWidgets.framework
mkdir TNSWidgets/build/TNSWidgets.framework

cp -r TNSWidgets/build/Release-iphoneos/TNSWidgets.framework/Headers TNSWidgets/build/TNSWidgets.framework/Headers
cp -r TNSWidgets/build/Release-iphoneos/TNSWidgets.framework/Modules TNSWidgets/build/TNSWidgets.framework/Modules
cp -r TNSWidgets/build/Release-iphoneos/TNSWidgets.framework/Info.plist TNSWidgets/build/TNSWidgets.framework/Info.plist

lipo -create TNSWidgets/build/Release-iphoneos/TNSWidgets.framework/TNSWidgets TNSWidgets/build/Release-iphonesimulator/TNSWidgets.framework/TNSWidgets -o TNSWidgets/build/TNSWidgets.framework/TNSWidgets
file TNSWidgets/build/TNSWidgets.framework/TNSWidgets
