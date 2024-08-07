#!/bin/sh

echo "Set exit on simple errors"
set -e


echo "Use dumb gradle terminal"
export TERM=dumb
SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )

OUTDIR=$SCRIPT_DIR/../../dist/packages/winter-cg

echo "Clean dist"
rm -rf $OUTDIR

export SKIP_PACK=true
./build.android.sh
./build.ios.sh

echo "Copy NPM artifacts"
cp .npmignore README.md package.json $OUTDIR
cp ../../LICENSE $OUTDIR


if [ "$1" ]
then
  echo "Suffix package.json's version with tag: $1"
  sed -i.bak 's/\(\"version\"\:[[:space:]]*\"[^\"]*\)\"/\1-'$1'"/g' ./dist/package/package.json
fi

echo "NPM pack"
cd $OUTDIR/..
PACKAGE="$(npm pack $OUTDIR)"
echo "Output: dist/$PACKAGE"

