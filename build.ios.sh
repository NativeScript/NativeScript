#!/bin/sh

echo "Set exit on simple errors"
set -e

echo "Use dumb gradle terminal"
export TERM=dumb

echo "Clean dist"
rm -rf dist
mkdir dist
mkdir dist/package
mkdir dist/package/platforms

echo "Build ios"
mkdir dist/package/platforms/ios
cd ios
./build.sh
cd ..
cp -r ios/TNSWidgets/build/TNSWidgets.framework dist/package/platforms/ios/TNSWidgets.framework

echo "Copy NPM artefacts"
cp LICENSE dist/package/LICENSE
cp LICENSE.md dist/package/LICENSE.md
cp README.md dist/package/README.md
cp package.json dist/package/package.json
if [ "$1" ]
then
  echo "Suffix package.json's version with tag: $1"
  sed -i.bak 's/\(\"version\"\:[[:space:]]*\"[^\"]*\)\"/\1-'$1'"/g' ./dist/package/package.json
fi

echo "NPM pack"
cd dist/package
PACKAGE="$(npm pack)"
cd ../..
mv dist/package/$PACKAGE dist/$PACKAGE
echo "Output: dist/$PACKAGE"

