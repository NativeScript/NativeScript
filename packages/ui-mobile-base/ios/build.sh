#!/bin/sh

echo "Set exit on simple errors"
set -e

BUILD_DIR=$(PWD)/TNSWidgets/build
rm -rf $BUILD_DIR
arch=$(uname -m)

echo "Build for iphonesimulator"
xcodebuild \
    -project TNSWidgets/TNSWidgets.xcodeproj \
    -scheme TNSWidgets \
    -configuration Release \
    -destination "generic/platform=iOS Simulator" \
    clean build \
    BUILD_DIR=$BUILD_DIR \
    SKIP_INSTALL=NO \
    BUILD_LIBRARY_FOR_DISTRIBUTION=YES \
    -quiet

echo "Build for iphoneos"
xcodebuild \
    -project TNSWidgets/TNSWidgets.xcodeproj \
    -scheme TNSWidgets \
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
    -project TNSWidgets/TNSWidgets.xcodeproj \
    -scheme TNSWidgets \
    -configuration Release \
    -destination "generic/platform=macOS,variant=Mac Catalyst" \
    clean build \
    BUILD_DIR=$BUILD_DIR \
    CODE_SIGN_IDENTITY="" \
    CODE_SIGNING_REQUIRED=NO \
    SKIP_INSTALL=NO \
    BUILD_LIBRARY_FOR_DISTRIBUTION=YES \
    -quiet

if [ "$arch" = "arm64" ]; then
    # Only available with Xcode >= 15.2
    echo "Build for visionOS Simulator"
    xcodebuild \
        -project TNSWidgets/TNSWidgets.xcodeproj \
        -scheme TNSWidgets \
        -configuration Release \
        -destination "generic/platform=visionOS Simulator" \
        clean build \
        BUILD_DIR=$BUILD_DIR \
        SKIP_INSTALL=NO \
        BUILD_LIBRARY_FOR_DISTRIBUTION=YES \
        -quiet

    echo "Build for visionOS"
    xcodebuild \
        -project TNSWidgets/TNSWidgets.xcodeproj \
        -scheme TNSWidgets \
        -configuration Release \
        -destination "generic/platform=visionOS" \
        clean build \
        BUILD_DIR=$BUILD_DIR \
        SKIP_INSTALL=NO \
        BUILD_LIBRARY_FOR_DISTRIBUTION=YES \
        -quiet
fi

echo "Creating XCFramework"
BASE=$BUILD_DIR/Release

extra_frameworks=""

# Check hardware arch (works even if running under Rosetta)
if [ "$arch" = "arm64" ]; then
  extra_frameworks="\
    -framework     $BASE-xrsimulator/TNSWidgets.framework \
    -debug-symbols $BASE-xrsimulator/TNSWidgets.framework.dSYM \
    -framework     $BASE-xros/TNSWidgets.framework \
    -debug-symbols $BASE-xros/TNSWidgets.framework.dSYM"
fi
xcodebuild -create-xcframework \
    -framework     $BASE-iphoneos/TNSWidgets.framework \
    -debug-symbols $BASE-iphoneos/TNSWidgets.framework.dSYM \
    -framework     $BASE-iphonesimulator/TNSWidgets.framework \
    -debug-symbols $BASE-iphonesimulator/TNSWidgets.framework.dSYM \
    -framework     $BASE-maccatalyst/TNSWidgets.framework \
    -debug-symbols $BASE-maccatalyst/TNSWidgets.framework.dSYM \
    $extra_frameworks \
    -output        $BUILD_DIR/TNSWidgets.xcframework
