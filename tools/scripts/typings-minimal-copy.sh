#!/usr/bin/env bash
set -e -o pipefail

echo "Deleting old ios typings (ios/objc-x86_64)..."
rm packages/types-minimal/src/lib/ios/objc-x86_64/*

echo "Copying minimal typings to ios/objc-x86_64..."
array=( objc!ARKit.d.ts objc!AVFAudio.d.ts objc!AudioToolbox.d.ts objc!AVFoundation.d.ts objc!CoreGraphics.d.ts objc!CoreMIDI.d.ts objc!CoreMotion.d.ts objc!Foundation.d.ts objc!ObjectiveC.d.ts objc!PDFKit.d.ts objc!Speech.d.ts objc!UIKit.d.ts objc!Vision.d.ts objc!WebKit.d.ts )
for i in "${array[@]}"
do
	echo "Including: $i"
    cp -R packages/types-ios/src/lib/ios/objc-x86_64/$i packages/types-minimal/src/lib/ios/objc-x86_64/$i
done


pushd packages/types-minimal/src/lib/ios

rm ios.d.ts
echo '/// <reference path="runtime.d.ts" />' > ios.d.ts

for i in `ls objc-x86_64/*.d.ts`; do
echo "/// <reference path=\"$i\" />" >> ios.d.ts
done

popd

echo "Deleting old android typings..."
rm packages/types-minimal/src/lib/android/api/*

echo "Copying minimal typings to android/api..."
array=( android-declarations.d.ts android-platform-32.d.ts androidx-32.d.ts )
for i in "${array[@]}"
do
	echo "Including: $i"
    cp -R packages/types-android/src/lib/android/$i packages/types-minimal/src/lib/android/api/$i
done