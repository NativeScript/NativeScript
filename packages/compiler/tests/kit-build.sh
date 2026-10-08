#!/usr/bin/env bash
# Builds tests/app with every file of the generated kit (--whole-kit), against the core the kit was generated from.
#   kit-build.sh <built core, e.g. dist/packages/core> [out]
set -euo pipefail
here=$(cd "$(dirname "$0")" && pwd)
core=$(cd "${1:?the built core (dist/packages/core)}" && pwd)
out=${2:-$here/app/platforms/native}
(cd "$here/app" && npm ci --no-audit --no-fund)
rm -rf "$here/app/node_modules/@nativescript/core"
cp -R "$core" "$here/app/node_modules/@nativescript/core"
node "$here/../src/cli.ts" "$here/app" --out "$out" --name KitBuildCheck --whole-kit
cd "$out"
xcodegen generate --quiet
build() { xcodebuild -project KitBuildCheck.xcodeproj -scheme KitBuildCheck -configuration Release -destination 'generic/platform=iOS Simulator' -derivedDataPath "$out/dd" -quiet build; }
# A fresh project copies TNSWidgets.xcframework while the build starts, and can read its headers mid-copy; a second build finds them in place.
build || { echo "the first build failed: building again"; build; }
