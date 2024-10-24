#!/bin/sh

echo "Set exit on simple errors"
set -e

echo "Use dumb terminal"
export TERM=dumb
SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )

OUTDIR=$SCRIPT_DIR/../../dist/packages/ui-mobile-base

rm -rf $OUTDIR/platforms/ios || true
mkdir -p $OUTDIR/platforms/ios

echo "Build iOS"

cd ios
./build.sh
cd ..
echo "Copy ios/TNSWidgets/build/*.xcframework $OUTDIR/platforms/ios"

cp -R ios/TNSWidgets/build/TNSWidgets.xcframework $OUTDIR/platforms/ios

# cp ios/TNSWidgets/build/*.framework.dSYM.zip $OUTDIR/platforms/ios

if [ "$1" ]
then
  echo "Suffix package.json's version with tag: $1"
  sed -i.bak 's/\(\"version\"\:[[:space:]]*\"[^\"]*\)\"/\1-'$1'"/g' $OUTDIR/package.json
fi

if [ "$SKIP_PACK" ]
then
  echo "SKIP pack" 
else
  echo "Copy NPM artifacts"
  cp .npmignore LICENSE README.md package.json $OUTDIR
  echo "NPM pack"
  cd $OUTDIR
  cd ..
  PACKAGE="$(npm pack $OUTDIR)"
  echo "Output: dist/$PACKAGE"
fi