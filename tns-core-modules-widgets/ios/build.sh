#!/bin/sh

echo "Set exit on simple errors"
set -e

OUTPUT_DIR="$PWD/TNSWidgets/build"
rm -rf $OUTPUT_DIR"

echo "Build for iphonesimulator"
xcodebuild -project TNSWidgets/TNSWidgets.xcodeproj -scheme TNSWidgets -sdk iphonesimulator -configuration Release clean build BUILD_DIR="$OUTPUT_DIR" -quiet

echo "Build for iphoneos"
xcodebuild -project TNSWidgets/TNSWidgets.xcodeproj -scheme TNSWidgets -sdk iphoneos -configuration Release clean build BUILD_DIR="$OUTPUT_DIR" CODE_SIGN_IDENTITY="" CODE_SIGNING_REQUIRED=NO -quiet

echo "Build for uikitformac"
xcodebuild -project TNSWidgets/TNSWidgets.xcodeproj -scheme TNSWidgets -destination 'variant=Mac Catalyst,arch=x86_64' -configuration Release clean build BUILD_DIR="$OUTPUT_DIR" CODE_SIGN_IDENTITY="" CODE_SIGNING_REQUIRED=NO -quiet

function buildFatFramework_iOS() {
    set -e
    FRAMEWORK_NAME=$1
    RELATIVE_DIR=$2
    SRC_IPHONEOS=TNSWidgets/build/Release-iphoneos/$RELATIVE_DIR/$FRAMEWORK_NAME.framework
    SRC_SIMULATOR=TNSWidgets/build/Release-iphonesimulator/$RELATIVE_DIR/$FRAMEWORK_NAME.framework
    DEST=TNSWidgets/build/$FRAMEWORK_NAME.framework
    echo; echo "Build fat iOS framework at $DEST"
    rm -rf $DEST
    mkdir $DEST

    cp -r `find $SRC_IPHONEOS -depth 1 | grep -v 'PrivateHeaders'` $DEST/

    lipo -create $SRC_IPHONEOS/$FRAMEWORK_NAME $SRC_SIMULATOR/$FRAMEWORK_NAME -o $DEST/$FRAMEWORK_NAME
    file $DEST/$FRAMEWORK_NAME

    if [ -d $SRC_IPHONEOS.dSYM ]; then
        echo "Build fat dSYM at $DEST.dSYM"
        cp -r $SRC_IPHONEOS.dSYM TNSWidgets/build
        rm "$DEST.dSYM/Contents/Resources/DWARF/$FRAMEWORK_NAME"
        lipo -create -output "$DEST.dSYM/Contents/Resources/DWARF/$FRAMEWORK_NAME" \
            "$SRC_SIMULATOR.dSYM/Contents/Resources/DWARF/$FRAMEWORK_NAME" \
            "$SRC_IPHONEOS.dSYM/Contents/Resources/DWARF/$FRAMEWORK_NAME"
        file $DEST.dSYM/Contents/Resources/DWARF/$FRAMEWORK_NAME

        echo "Archiving dSYM at $DEST.dSYM.zip"
        (cd TNSWidgets/build && zip -qr $FRAMEWORK_NAME.framework.dSYM.zip $FRAMEWORK_NAME.framework.dSYM)

        echo "Removing $DEST.dSYM"
        rm -rf $DEST.dSYM
    else
        echo "info: $SRC_IPHONEOS.dSYM doesn't exist. Skipping dSYM archive."
    fi
}

function buildXCFramework() {
    set -e
    FRAMEWORK_NAME=$1
    RELATIVE_DIR=$2

    SRC_IPHONEOS=TNSWidgets/build/Release-iphoneos/$RELATIVE_DIR/$FRAMEWORK_NAME.framework
    SRC_SIMULATOR=TNSWidgets/build/Release-iphonesimulator/$RELATIVE_DIR/$FRAMEWORK_NAME.framework
    SRC_MACOS=TNSWidgets/build/Release-uikitformac/$RELATIVE_DIR/$FRAMEWORK_NAME.framework
    OUTPUT_DIR=TNSWidgets/build
    XCFRAMEWORK_PATH=$OUTPUT_DIR/$FRAMEWORK_NAME.xcframework
    IOS_DSYM=$OUTPUT_DIR/$FRAMEWORK_NAME.ios.framework.dSYM
    MACOS_DSYM=$OUTPUT_DIR/$FRAMEWORK_NAME.macos.framework.dSYM

    echo; echo "Building macOS/iOS xcframework at $XCFRAMEWORK_PATH"
    xcodebuild -create-xcframework -framework "$SRC_IPHONEOS" -framework "$SRC_SIMULATOR" -framework "$SRC_MACOS" -output "$XCFRAMEWORK_PATH"
    if [ -d $SRC_IPHONEOS.dSYM ]; then
        echo; echo "Building iOS dSYM at $IOS_DSYM"

        cp -r $SRC_IPHONEOS.dSYM $IOS_DSYM
        rm "$IOS_DSYM/Contents/Resources/DWARF/$FRAMEWORK_NAME"
        lipo -create -output "$IOS_DSYM/Contents/Resources/DWARF/$FRAMEWORK_NAME" \
            "$SRC_SIMULATOR.dSYM/Contents/Resources/DWARF/$FRAMEWORK_NAME" \
            "$SRC_IPHONEOS.dSYM/Contents/Resources/DWARF/$FRAMEWORK_NAME"
        file $IOS_DSYM/Contents/Resources/DWARF/$FRAMEWORK_NAME

        echo "Archiving dSYM at $FRAMEWORK_NAME.ios.framework.dSYM"
        (cd $OUTPUT_DIR && zip -qr $FRAMEWORK_NAME.ios.framework.dSYM.zip $FRAMEWORK_NAME.ios.framework.dSYM)


        echo; echo "Copying macOS dSYM at $MACOS_DSYM"
        cp -r $SRC_MACOS.dSYM $MACOS_DSYM

        echo "Archiving dSYM at $FRAMEWORK_NAME.macox.framework.dSYM"
        (cd $OUTPUT_DIR && zip -qr $FRAMEWORK_NAME.macos.framework.dSYM.zip $FRAMEWORK_NAME.macos.framework.dSYM)
    else
        echo "info: $SRC_IPHONEOS.dSYM doesn't exist. Skipping dSYM archives."
    fi
}

buildXCFramework TNSWidgets .

