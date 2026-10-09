#!/usr/bin/env bash
# Launches the app kit-build.sh built on a simulator of an iOS version, and fails where it crashes within the wait:
# the generated kit gates newer API by availability, which only an older iOS runs.
#   launch-check.sh <out of kit-build.sh> <iOS major, e.g. 26, or "latest"> [seconds]
set -euo pipefail
out=${1:?the out folder kit-build.sh built into}
major=${2:?an iOS major version or latest}
wait=${3:-20}
app=$(find "$out/dd/Build/Products" -maxdepth 2 -name 'KitBuildCheck.app' | head -1)
[[ -n "$app" ]] || { echo "no KitBuildCheck.app under $out/dd"; exit 1; }
bundle=$(/usr/libexec/PlistBuddy -c 'Print :CFBundleIdentifier' "$app/Info.plist")
# The newest runtime of that major, and an iPhone it runs on.
read -r runtime devicetype < <(xcrun simctl list runtimes -j | node -e '
  const major = process.argv[1];
  const all = JSON.parse(require("fs").readFileSync(0, "utf8")).runtimes.filter((r) => r.platform === "iOS" && r.isAvailable);
  const pick = major === "latest" ? all : all.filter((r) => r.version.split(".")[0] === major);
  const r = pick.sort((a, b) => a.version.localeCompare(b.version, undefined, { numeric: true })).pop();
  const phone = r && r.supportedDeviceTypes.filter((d) => d.productFamily === "iPhone").pop();
  if (!r || !phone) process.exit(1);
  console.log(r.identifier, phone.identifier);' "$major") || { echo "no iOS $major simulator runtime installed"; exit 1; }
device=$(xcrun simctl create "kit-launch-$major" "$devicetype" "$runtime")
trap 'xcrun simctl shutdown "$device" >/dev/null 2>&1 || true; xcrun simctl delete "$device" >/dev/null 2>&1 || true' EXIT
xcrun simctl boot "$device"
xcrun simctl bootstatus "$device" -b >/dev/null
xcrun simctl install "$device" "$app"
log=$(mktemp)
SIMCTL_CHILD_NS_KIT_ERRORS=1 xcrun simctl launch --console-pty "$device" "$bundle" > "$log" 2>&1 &
launcher=$!
sleep "$wait"
alive=$(xcrun simctl spawn "$device" launchctl list | grep -c "UIKitApplication:$bundle" || true)
kill "$launcher" >/dev/null 2>&1 || true
echo "--- the app's output on iOS $major ($runtime)"
cat "$log"
[[ "$alive" -gt 0 ]] || { echo "the app is not running after ${wait}s on iOS $major: it crashed"; exit 1; }
echo "running after ${wait}s on iOS $major"
