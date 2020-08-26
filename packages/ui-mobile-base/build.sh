#!/bin/sh

echo "Set exit on simple errors"
set -e


echo "Use dumb gradle terminal"
export TERM=dumb

echo "Clean dist"
rm -rf dist

export SKIP_PACK=true
./build.android.sh
./build.ios.sh

echo "Copy NPM artefacts"
cp .npmignore README.md package.json dist/package
cp ../../LICENSE dist/package


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

