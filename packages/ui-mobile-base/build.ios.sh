#!/bin/sh

echo "Set exit on simple errors"
set -e

echo "Use dumb terminal"
export TERM=dumb

rm -rf dist/package/platforms/ios || true
mkdir -p dist/package/platforms/ios

# Opt-in fast path: only when SKIP_NATIVE_IF_UNCHANGED is set do we reuse the
# committed artifact instead of building. Running this script normally always builds.
if [ -n "$SKIP_NATIVE_IF_UNCHANGED" ] && node tools/native-state.mjs is-current ios
then
  echo "iOS native sources unchanged since last build — reusing committed artifact"
  cp -R ../core/platforms/ios/TNSWidgets.xcframework dist/package/platforms/ios
else
  echo "Build iOS"

  cd ios
  ./build.sh
  cd ..
  echo "Copy ios/TNSWidgets/build/*.xcframework dist/package/platforms/ios"

  cp -R ios/TNSWidgets/build/TNSWidgets.xcframework dist/package/platforms/ios
fi

# cp ios/TNSWidgets/build/*.framework.dSYM.zip dist/package/platforms/ios

if [ "$1" ]
then
  echo "Suffix package.json's version with tag: $1"
  sed -i.bak 's/\(\"version\"\:[[:space:]]*\"[^\"]*\)\"/\1-'$1'"/g' ./dist/package/package.json
fi

if [ "$SKIP_PACK" ]
then
  echo "SKIP pack" 
else
  echo "Copy NPM artifacts"
  cp .npmignore LICENSE README.md package.json dist/package
  echo "NPM pack"
  cd dist/package
  PACKAGE="$(npm pack)"
  cd ../..
  mv dist/package/$PACKAGE dist/$PACKAGE
  echo "Output: dist/$PACKAGE"
fi