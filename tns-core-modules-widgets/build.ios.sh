#!/bin/sh

echo "Set exit on simple errors"
set -e

# for i in "$@"
# do
# case $i in
#     --package_version=*)
#     PACKAGE_VERSION="${i#*=}"
#     shift # past argument=value
#     ;;
#     --skip-pack=*)
#     SKIP_PACK="true"
#     shift # past argument=value
#     ;;
# esac
# done
# echo "PACKAGE_VERSION  = ${PACKAGE_VERSION}"
# echo "PUBLISH = ${PUBLISH}"

echo "Use dumb terminal"
export TERM=dumb

rm -rf mkdir dist/package/platforms/ios || true
mkdir -p dist
mkdir -p dist/package
mkdir -p dist/package/platforms
mkdir dist/package/platforms/ios

echo "Build iOS"

cd ios
./build.sh
cd ..
echo "Copy ios/TNSWidgets/build/*.framework dist/package/platforms/ios"

cp -R ios/TNSWidgets/build/*.framework dist/package/platforms/ios
cp ios/TNSWidgets/build/*.framework.dSYM.zip dist/package/platforms/ios

if [ "$PACKAGE_VERSION" ]
then
  echo "Suffix package.json's version with tag: $PACKAGE_VERSION"
  sed -i.bak 's/\(\"version\"\:[[:space:]]*\"[^\"]*\)\"/\1-'$PACKAGE_VERSION'"/g' ./dist/package/package.json
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