#!/usr/bin/env bash
set -e -o pipefail

IOS_RUNTIME_VERSION=$1
METADATA_GENERATOR_PATH=$2

if [ -z "$1" ]
then
    printf "Usage:\n"
    printf "./typings-gen.sh <tns-ios-npm-version> [<objc-metadata-generator-binary>]\n"
    printf "\n\nExample:\n"
    printf "./typings-gen.sh rc ~/work/ios-runtime/cmake-build/metadataGenerator/bin/objc-metadata-generator\n\n"
    exit -1
fi

if [ -n "$METADATA_GENERATOR_PATH" -a ! -f "$METADATA_GENERATOR_PATH" ]
then
    echo "error: Specified metadata generator binary \"$METADATA_GENERATOR_PATH\" does not exist!"
    exit -2
fi

echo "Creating typings project with @nativescript/ios@$IOS_RUNTIME_VERSION..."
rm -rf ios-typings-prj
ns create --template @nativescript/template-blank@latest ios-typings-prj
ns platform add ios@$IOS_RUNTIME_VERSION --path ios-typings-prj/

# For iOS 26
echo "FRAMEWORK_SEARCH_PATHS = \$(inherited) \$(SDKDIR)/System/Library/SubFrameworks" >> ios-typings-prj/App_Resources/iOS/build.xcconfig


if [ -n "$METADATA_GENERATOR_PATH" ]
then
    echo "Replacing metadata generator binary with: $METADATA_GENERATOR_PATH"
    rm ios-typings-prj/platforms/ios/internal/metadata-generator/bin/objc-metadata-generator
    cp $METADATA_GENERATOR_PATH ios-typings-prj/platforms/ios/internal/metadata-generator/bin/objc-metadata-generator

fi

echo "Building project and generating typings..."
TNS_TYPESCRIPT_DECLARATIONS_PATH=$(pwd)/ios-typings-prj/typings ns build ios --debug --path ios-typings-prj/

echo "Deleting old ios typings (ios/objc-x86_64)..."
rm -f packages/types-ios/src/lib/ios/objc-x86_64/*

# echo "Deleting Material Components typings..."
# rm ios-typings-prj/typings/x86_64/objc\!MaterialComponents.d.ts
# Remove methods attached to other modules via extensions (UIKit, QuartzCore)
# perl -pi -e 's/.*\s(mdc_|MDCFontTextStyle|MDCAnimationTimingFunction).*\s*//g' ios-typings-prj/typings/x86_64/*.d.ts

echo "Moving generated typings to ios/objc-x86_64..."
mv ios-typings-prj/typings/x86_64/* packages/types-ios/src/lib/ios/objc-x86_64/

echo "Emitting (ios/ios.d.ts)..."

pushd packages/types-ios/src/lib/ios

rm ios.d.ts
echo '/// <reference path="runtime.d.ts" />' > ios.d.ts

for i in `ls objc-x86_64/*.d.ts`; do
echo "/// <reference path=\"$i\" />" >> ios.d.ts
done

popd
