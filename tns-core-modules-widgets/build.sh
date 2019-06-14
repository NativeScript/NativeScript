#!/bin/sh

echo "Set exit on simple errors"
set -e

for i in "$@"
do
case $i in
    --package_version=*)
    PACKAGE_VERSION="${i#*=}"
    shift # past argument=value
    ;;
    # --skip-pack=*)
    # SKIP_PACK="true"
    # shift # past argument=value
    # ;;
esac
done

echo "PACKAGE_VERSION  = ${PACKAGE_VERSION}"
echo "PUBLISH = ${PUBLISH}"

echo "Use dumb gradle terminal"
export TERM=dumb

echo "Clean dist"
rm -rf dist

export SKIP_PACK=true
./build.android.sh
./build.ios.sh

echo "Copy NPM artefacts"
if [ "$PACKAGE_VERSION" ]
then
  echo "Suffix package.json's version with tag: $PACKAGE_VERSION"
  sed -i.bak 's/\(\"version\"\:[[:space:]]*\"[^\"]*\)\"/\1-'$PACKAGE_VERSION'"/g' ./dist/package/package.json
fi

echo "Copy NPM artefacts"
cp .npmignore LICENSE README.md package.json dist/package
echo "NPM pack"
cd dist/package
PACKAGE="$(npm pack)"
cd ../..
mv dist/package/$PACKAGE dist/$PACKAGE
echo "Output: dist/$PACKAGE"

