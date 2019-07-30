#!/bin/sh

echo "Set exit on simple errors"
set -e

echo "Use dumb terminal"
export TERM=dumb

rm -rf dist/package/platforms/ios || true
mkdir -p dist/package/platforms/ios

echo "Build iOS"

cd ios
./build.sh
cd ..
echo "Copy ios/TNSWidgets/build/*.framework dist/package/platforms/ios"

cp -R ios/TNSWidgets/build/TNSWidgets.framework dist/package/platforms/ios

cp ios/TNSWidgets/build/*.framework.dSYM.zip dist/package/platforms/ios

if [ "$1" ]
then
  echo "Suffix package.json's version with tag: $1"
  sed -i.bak 's/\(\"version\"\:[[:space:]]*\"[^\"]*\)\"/\1-'$1'"/g' ./dist/package/package.json
fi

if [ "$SKIP_PACK" ]
then
  echo "SKIP pack" 
else
  echo "Copy NPM artefacts"
  cp .npmignore LICENSE README.md package.json dist/package
  echo "NPM pack"
  cd dist/package
  PACKAGE="$(npm pack)"
  cd ../..
  mv dist/package/$PACKAGE dist/$PACKAGE
  echo "Output: dist/$PACKAGE"
fi