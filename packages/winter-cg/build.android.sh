#!/bin/sh

echo "Set exit on simple errors"
set -e

echo "Use dumb gradle terminal"
export TERM=dumb
SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )

OUTDIR=$SCRIPT_DIR/../../dist/packages/winter-cg

rm -rf $OUTDIR/platforms/android || true
mkdir -p $OUTDIR/platforms/android

echo "Build android"
cd android
./gradlew --quiet assembleRelease
cd ..
cp android/winter_cg/build/outputs/aar/winter_cg-release.aar $OUTDIR/platforms/android/winter_cg-release.aar

if [ "$1" ]
then
  echo "Suffix package.json's version with tag: $1"
  sed -i.bak 's/\(\"version\"\:[[:space:]]*\"[^\"]*\)\"/\1-'$1'"/g' ./$OUTDIR/package.json
fi

if [ "$SKIP_PACK" ]
then
  echo "SKIP pack" 
else
  echo "Copy NPM artefacts"
  cp .npmignore LICENSE README.md package.json $OUTDIR
  echo "NPM pack"
  cd $OUTDIR
  cd ..
  PACKAGE="$(npm pack $OUTDIR)"
  echo "Output: dist/$PACKAGE"
fi