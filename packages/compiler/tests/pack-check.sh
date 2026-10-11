#!/usr/bin/env bash
# Packs the compiler as npm publishes it, installs the tarball into a fresh copy of tests/app, and builds that app
# from the installed package alone: what a published @nativescript/compiler builds, with the kits it ships.
#   pack-check.sh <android|ios> <built core, e.g. dist/packages/core> [work dir]
# Android: the release APK, minified, on the generated kit. iOS: the simulator .app.
set -euo pipefail
here=$(cd "$(dirname "$0")" && pwd)
compiler=$(cd "$here/.." && pwd)
repo=$(cd "$compiler/../.." && pwd)
platform=${1:?android or ios}
core=$(cd "${2:?the built core (dist/packages/core)}" && pwd)
work=${3:-$(mktemp -d)}
mkdir -p "$work"

for m in kit-apple/Sources/NativeScriptKit/Core/manifest.json kit-android/generated/manifest.json; do
  [[ -f "$compiler/$m" ]] || { echo "$m is missing: generate the kits first (nx run compiler:kit and compiler:kit-android)"; exit 1; }
done
(cd "$compiler" && npm pack --pack-destination "$work" --silent >/dev/null)
tgz=$(ls -t "$work"/nativescript-compiler-*.tgz | head -1)
echo "packed $(basename "$tgz"): $(du -h "$tgz" | cut -f1)"
listing=$(tar -tzf "$tgz")
for f in kit-android/generated/manifest.json kit-apple/Sources/NativeScriptKit/Core/manifest.json dist/cli.js LICENSE; do
  grep -qx "package/$f" <<< "$listing" || { echo "the tarball has no $f"; exit 1; }
done

app="$work/app"
rm -rf "$app"
mkdir -p "$app"
(cd "$here/app" && tar -cf - --exclude node_modules --exclude platforms --exclude hooks .) | (cd "$app" && tar -xf -)
cp -R "$repo/tools/assets/App_Resources" "$app/App_Resources"
(cd "$app" && npm ci --no-audit --no-fund --loglevel=error && npm install --no-save --no-audit --no-fund --loglevel=error "$tgz")
rm -rf "$app/node_modules/@nativescript/core"
cp -R "$core" "$app/node_modules/@nativescript/core"

installed="$app/node_modules/@nativescript/compiler"
[[ -d "$installed/kit-android/generated" ]] || { echo "the installed package has no generated Android kit"; exit 1; }
if [[ "$platform" == android ]]; then
  node "$installed/bin/ns-native.js" "$app" --platform android --out "$app/platforms/compiled/android" --name KitPackCheck --bundle org.nativescript.kitpackcheck --build
  apk="$app/platforms/compiled/android/build/outputs/apk/release/KitPackCheck-release.apk"
  [[ -f "$apk" ]] || { echo "no APK at $apk"; exit 1; }
  grep -q '^generatedKit=true' "$app/platforms/compiled/android/gradle.properties" || { echo "the build did not use the generated kit"; exit 1; }
  echo "built $apk ($(du -h "$apk" | cut -f1)) on the generated kit"
else
  node "$installed/bin/ns-native.js" "$app" --out "$app/platforms/compiled/ios" --name KitPackCheck --bundle org.nativescript.kitpackcheck
  cd "$app/platforms/compiled/ios"
  xcodebuild -project KitPackCheck.xcodeproj -scheme KitPackCheck -configuration Release -destination 'generic/platform=iOS Simulator' -derivedDataPath "$work/dd" -quiet build
  echo "built $(find "$work/dd/Build/Products" -maxdepth 2 -name 'KitPackCheck.app' | head -1)"
fi
