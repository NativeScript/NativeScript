#!/bin/sh

echo "Set exit on simple errors"
set -e

BUILD_DIR=$(PWD)/NSCWinterTC/build
rm -rf $BUILD_DIR

echo "Build for iphonesimulator"
xcodebuild \
    -project NSCWinterTC/NSCWinterTC.xcodeproj \
    -scheme NSCWinterTC \
    -configuration Release \
    -destination "generic/platform=iOS Simulator" \
    clean build \
    BUILD_DIR=$BUILD_DIR \
    SKIP_INSTALL=NO \
    BUILD_LIBRARY_FOR_DISTRIBUTION=YES \
    -quiet

echo "Build for iphoneos"
xcodebuild \
    -project NSCWinterTC/NSCWinterTC.xcodeproj \
    -scheme NSCWinterTC \
    -sdk iphoneos \
    -configuration Release \
    -destination "generic/platform=iOS" \
    clean build \
    BUILD_DIR=$BUILD_DIR \
    CODE_SIGN_IDENTITY="" \
    CODE_SIGNING_REQUIRED=NO \
    SKIP_INSTALL=NO \
    BUILD_LIBRARY_FOR_DISTRIBUTION=YES \
    -quiet

echo "Build for Mac Catalyst"
xcodebuild \
    -project NSCWinterTC/NSCWinterTC.xcodeproj \
    -scheme NSCWinterTC \
    -configuration Release \
    -destination "generic/platform=macOS,variant=Mac Catalyst" \
    clean build \
    BUILD_DIR=$BUILD_DIR \
    CODE_SIGN_IDENTITY="" \
    CODE_SIGNING_REQUIRED=NO \
    SKIP_INSTALL=NO \
    BUILD_LIBRARY_FOR_DISTRIBUTION=YES \
    -quiet

# Only available with Xcode >= 15.2
echo "Build for visionOS Simulator"
xcodebuild \
    -project NSCWinterTC/NSCWinterTC.xcodeproj \
    -scheme NSCWinterTC \
    -configuration Release \
    -destination "generic/platform=visionOS Simulator" \
    clean build \
    BUILD_DIR=$BUILD_DIR \
    SKIP_INSTALL=NO \
    BUILD_LIBRARY_FOR_DISTRIBUTION=YES \
    -quiet

echo "Build for visionOS"
xcodebuild \
    -project NSCWinterTC/NSCWinterTC.xcodeproj \
    -scheme NSCWinterTC \
    -configuration Release \
    -destination "generic/platform=visionOS" \
    clean build \
    BUILD_DIR=$BUILD_DIR \
    SKIP_INSTALL=NO \
    BUILD_LIBRARY_FOR_DISTRIBUTION=YES \
    -quiet

echo "Creating XCFramework"
BASE=$BUILD_DIR/Release
xcodebuild \
    -create-xcframework \
    -framework     $BASE-iphoneos/NSCWinterTC.framework \
    -debug-symbols $BASE-iphoneos/NSCWinterTC.framework.dSYM \
    -framework     $BASE-iphonesimulator/NSCWinterTC.framework \
    -debug-symbols $BASE-iphonesimulator/NSCWinterTC.framework.dSYM \
    -framework     $BASE-maccatalyst/NSCWinterTC.framework \
    -debug-symbols $BASE-maccatalyst/NSCWinterTC.framework.dSYM \
    -framework     $BASE-xrsimulator/NSCWinterTC.framework \
    -debug-symbols $BASE-xrsimulator/NSCWinterTC.framework.dSYM \
    -framework     $BASE-xros/NSCWinterTC.framework \
    -debug-symbols $BASE-xros/NSCWinterTC.framework.dSYM \
    -output        $BUILD_DIR/NSCWinterTC.xcframework
