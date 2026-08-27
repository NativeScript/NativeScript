#!/usr/bin/env bash
set -e -o pipefail

API_LEVEL=$1
ANDROID_RUNTIME_VERSION=${2:-latest}
SDK_PLATFORM=${3:-android-$API_LEVEL}

if [ -z "$API_LEVEL" ]
then
    printf "Usage:\n"
    printf "./typings-gen-android.sh <api-level> [<tns-android-npm-version>] [<sdk-platform-dir>]\n"
    printf "\n\nExample:\n"
    printf "./typings-gen-android.sh 37 9.1.0-rc.2 android-37.1\n\n"
    exit -1
fi

SDK_ROOT=${ANDROID_HOME:-${ANDROID_SDK_ROOT:-$HOME/Library/Android/sdk}}
ANDROID_JAR="$SDK_ROOT/platforms/$SDK_PLATFORM/android.jar"

if [ ! -f "$ANDROID_JAR" ]
then
    echo "error: \"$ANDROID_JAR\" does not exist. Install it with: sdkmanager \"platforms;$SDK_PLATFORM\""
    exit -2
fi

WORK_DIR=$(mktemp -d)
trap 'rm -rf "$WORK_DIR"' EXIT

echo "Extracting dts-generator from @nativescript/android@$ANDROID_RUNTIME_VERSION..."
(cd "$WORK_DIR" && npm pack @nativescript/android@$ANDROID_RUNTIME_VERSION --silent > /dev/null && tar -xzf *.tgz package/framework/build-tools/dts-generator.jar)

echo "Generating typings from $SDK_PLATFORM..."
java -jar "$WORK_DIR/package/framework/build-tools/dts-generator.jar" --input "$ANDROID_JAR" --output "$WORK_DIR/out"

echo "Emitting (android/android-platform-$API_LEVEL.d.ts)..."
node tools/scripts/typings-to-literal-types.mjs "$WORK_DIR/out/android.d.ts" "packages/types-android/src/lib/android/android-platform-$API_LEVEL.d.ts"

echo "Emitting (android-$API_LEVEL.d.ts)..."
printf '/// <reference path="./android/android-platform-%s.d.ts" />\n/// <reference path="./android/androidx-32.d.ts" />\n/// <reference path="./android/common.d.ts" />' "$API_LEVEL" > "packages/types-android/src/lib/android-$API_LEVEL.d.ts"
