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

# Windows widgets — requires PowerShell and the Windows SDK (Windows host only).
# Skipped automatically on macOS/Linux CI; run build.windows.ps1 directly on Windows.
if command -v powershell.exe >/dev/null 2>&1; then
  echo "Build Windows widgets"
  powershell.exe -ExecutionPolicy Bypass -File ./build.windows.ps1 "$1"
else
  echo "Skipping Windows build (powershell.exe not available)"
fi

echo "Copy NPM artifacts"
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

