#!/bin/sh

echo "Set exit on simple errors"
set -e

echo "Build for iphonesimulator"
xcodebuild -project TNSWidgets/TNSWidgets.xcodeproj -sdk iphonesimulator -target TNSWidgets -configuration Release clean build CONFIGURATION_BUILD_DIR=build/Release-iphonesimulator -quiet

echo "Build for iphoneos"
xcodebuild -project TNSWidgets/TNSWidgets.xcodeproj -sdk iphoneos -target TNSWidgets -configuration Release clean build CONFIGURATION_BUILD_DIR=build/Release-iphoneos CODE_SIGN_IDENTITY="" CODE_SIGNING_REQUIRED=NO -quiet

echo "Build fat framework at TNSWidgets/build/TNSWidgets.framework"
rm -rf TNSWidgets/build/TNSWidgets.framework
mkdir TNSWidgets/build/TNSWidgets.framework

cp -r TNSWidgets/build/Release-iphoneos/TNSWidgets.framework/Headers TNSWidgets/build/TNSWidgets.framework/Headers
cp -r TNSWidgets/build/Release-iphoneos/TNSWidgets.framework/Modules TNSWidgets/build/TNSWidgets.framework/Modules
cp -r TNSWidgets/build/Release-iphoneos/TNSWidgets.framework/Info.plist TNSWidgets/build/TNSWidgets.framework/Info.plist

lipo -create TNSWidgets/build/Release-iphoneos/TNSWidgets.framework/TNSWidgets TNSWidgets/build/Release-iphonesimulator/TNSWidgets.framework/TNSWidgets -o TNSWidgets/build/TNSWidgets.framework/TNSWidgets
file TNSWidgets/build/TNSWidgets.framework/TNSWidgets

echo "Build fat dSYM at TNSWidgets/build/TNSWidgets.framework.dSYM"
cp -r TNSWidgets/build/Release-iphoneos/TNSWidgets.framework.dSYM TNSWidgets/build
rm "TNSWidgets/build/TNSWidgets.framework.dSYM/Contents/Resources/DWARF/TNSWidgets"
lipo -create -output "TNSWidgets/build/TNSWidgets.framework.dSYM/Contents/Resources/DWARF/TNSWidgets" \
    "TNSWidgets/build/Release-iphonesimulator/TNSWidgets.framework.dSYM/Contents/Resources/DWARF/TNSWidgets" \
    "TNSWidgets/build/Release-iphoneos/TNSWidgets.framework.dSYM/Contents/Resources/DWARF/TNSWidgets"
file TNSWidgets/build/TNSWidgets.framework.dSYM/Contents/Resources/DWARF/TNSWidgets

echo "Archiving dSYM at TNSWidgets/build/TNSWidgets.framework.dSYM.zip"
(cd TNSWidgets/build && zip -qr TNSWidgets.framework.dSYM.zip TNSWidgets.framework.dSYM)

echo "Removing TNSWidgets/build/TNSWidgets.framework.dSYM"
rm -rf TNSWidgets/build/TNSWidgets.framework.dSYM
