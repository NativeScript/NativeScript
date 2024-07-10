#!/bin/sh

echo "Set exit on simple errors"
set -e

BUILD_DIR=$(PWD)/NSCWinterCG/build
rm -rf $BUILD_DIR

echo "Build for iphonesimulator"
xcodebuild \
    -project NSCWinterCG/NSCWinterCG.xcodeproj \
    -scheme NSCWinterCG \
    -configuration Release \
    -destination "generic/platform=iOS Simulator" \
    clean build \
    BUILD_DIR=$BUILD_DIR \
    SKIP_INSTALL=NO \
    BUILD_LIBRARY_FOR_DISTRIBUTION=YES \
    -quiet

echo "Build for iphoneos"
xcodebuild \
    -project NSCWinterCG/NSCWinterCG.xcodeproj \
    -scheme NSCWinterCG \
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
    -project NSCWinterCG/NSCWinterCG.xcodeproj \
    -scheme NSCWinterCG \
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
    -project NSCWinterCG/NSCWinterCG.xcodeproj \
    -scheme NSCWinterCG \
    -configuration Release \
    -destination "generic/platform=visionOS Simulator" \
    clean build \
    BUILD_DIR=$BUILD_DIR \
    SKIP_INSTALL=NO \
    BUILD_LIBRARY_FOR_DISTRIBUTION=YES \
    -quiet

echo "Build for visionOS"
xcodebuild \
    -project NSCWinterCG/NSCWinterCG.xcodeproj \
    -scheme NSCWinterCG \
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
    -framework     $BASE-iphoneos/NSCWinterCG.framework \
    -debug-symbols $BASE-iphoneos/NSCWinterCG.framework.dSYM \
    -framework     $BASE-iphonesimulator/NSCWinterCG.framework \
    -debug-symbols $BASE-iphonesimulator/NSCWinterCG.framework.dSYM \
    -framework     $BASE-maccatalyst/NSCWinterCG.framework \
    -debug-symbols $BASE-maccatalyst/NSCWinterCG.framework.dSYM \
    -framework     $BASE-xrsimulator/NSCWinterCG.framework \
    -debug-symbols $BASE-xrsimulator/NSCWinterCG.framework.dSYM \
    -framework     $BASE-xros/NSCWinterCG.framework \
    -debug-symbols $BASE-xros/NSCWinterCG.framework.dSYM \
    -output        $BUILD_DIR/NSCWinterCG.xcframework
