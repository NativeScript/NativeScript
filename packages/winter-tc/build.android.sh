#!/bin/sh

echo "Set exit on simple errors"
set -e

echo "Use dumb gradle terminal"
export TERM=dumb

rm -rf dist/package/platforms/android || true
mkdir -p dist/package/platforms/android

echo "Build android"
cd android
./gradlew --quiet assembleRelease
cd ..
cp android/winter_tc/build/outputs/aar/winter_tc-release.aar dist/package/platforms/android/winter_tc-release.aar

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