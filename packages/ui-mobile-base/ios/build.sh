#!/bin/sh

echo "Set exit on simple errors"
set -e

BUILD_DIR=$(PWD)/TNSWidgets/build
rm -rf $BUILD_DIR

# Make the build reproducible:
# - ZERO_AR_DATE zeroes timestamps embedded by ar/libtool so archives are byte-stable.
# - -ffile-prefix-map rewrites the absolute build path baked into the binary/DWARF to ".",
#   so the artifacts don't depend on who/where they were built.
export ZERO_AR_DATE=1
CUSTOM_OTHER_CFLAGS="\$(inherited) -ffile-prefix-map=$(PWD)=."

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
    OTHER_CFLAGS="$CUSTOM_OTHER_CFLAGS" \
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
    OTHER_CFLAGS="$CUSTOM_OTHER_CFLAGS" \
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
    OTHER_CFLAGS="$CUSTOM_OTHER_CFLAGS" \
    -quiet

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
    OTHER_CFLAGS="$CUSTOM_OTHER_CFLAGS" \
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
    OTHER_CFLAGS="$CUSTOM_OTHER_CFLAGS" \
    -quiet

echo "Creating XCFramework"
BASE=$BUILD_DIR/Release
xcodebuild \
    -create-xcframework \
    -framework     $BASE-iphoneos/TNSWidgets.framework \
    -debug-symbols $BASE-iphoneos/TNSWidgets.framework.dSYM \
    -framework     $BASE-iphonesimulator/TNSWidgets.framework \
    -debug-symbols $BASE-iphonesimulator/TNSWidgets.framework.dSYM \
    -framework     $BASE-maccatalyst/TNSWidgets.framework \
    -debug-symbols $BASE-maccatalyst/TNSWidgets.framework.dSYM \
    -framework     $BASE-xrsimulator/TNSWidgets.framework \
    -debug-symbols $BASE-xrsimulator/TNSWidgets.framework.dSYM \
    -framework     $BASE-xros/TNSWidgets.framework \
    -debug-symbols $BASE-xros/TNSWidgets.framework.dSYM \
    -output        $BUILD_DIR/TNSWidgets.xcframework

XCFRAMEWORK=$BUILD_DIR/TNSWidgets.xcframework

echo "Remapping absolute paths in dSYM Relocations files"
# The dSYM Relocations .yml files embed the absolute binary-path, which is
# machine/user specific. Rewrite the build directory prefix back to "." so the
# generated dSYMs are identical regardless of where they were built.
find "$XCFRAMEWORK" -path "*/dSYMs/*/Relocations/*.yml" -type f | while read -r yml_file; do
    sed -i '' "s|$(PWD)|.|g" "$yml_file"
done

echo "Normalizing XCFramework Info.plist (stable platform order)"
# xcodebuild orders AvailableLibraries non-deterministically. Re-sort the
# library entries by LibraryIdentifier so the plist is stable across builds.
node "$(dirname "$0")/normalize-xcframework-plist.mjs" "$XCFRAMEWORK/Info.plist"
