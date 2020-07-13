#!/bin/sh

echo "Set exit on simple errors"
set -e

echo "Build for iphonesimulator"
xcodebuild -project TNSWidgets/TNSWidgets.xcodeproj -scheme TNSWidgets -sdk iphonesimulator -configuration Release clean build BUILD_DIR=$(PWD)/TNSWidgets/build -quiet

echo "Build for iphoneos"
xcodebuild -project TNSWidgets/TNSWidgets.xcodeproj -scheme TNSWidgets -sdk iphoneos -configuration Release clean build BUILD_DIR=$(PWD)/TNSWidgets/build CODE_SIGN_IDENTITY="" CODE_SIGNING_REQUIRED=NO -quiet

function buildFatFramework() {
    FRAMEWORK_NAME=$1
    RELATIVE_DIR=$2
    SRC_IPHONEOS=TNSWidgets/build/Release-iphoneos/$RELATIVE_DIR/$FRAMEWORK_NAME.framework
    SRC_SIMULATOR=TNSWidgets/build/Release-iphonesimulator/$RELATIVE_DIR/$FRAMEWORK_NAME.framework
    DEST=TNSWidgets/build/$FRAMEWORK_NAME.framework
    echo; echo "Build fat framework at $DEST"
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

buildFatFramework TNSWidgets .
