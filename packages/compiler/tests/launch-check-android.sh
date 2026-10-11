#!/usr/bin/env bash
# Installs a compiled release APK on a running emulator or device ($ANDROID_SERIAL), launches it, and fails when it
# is not running after the wait or logcat shows a crash or a class the build left out.
#   launch-check-android.sh <apk> <application id> [seconds]
set -euo pipefail
apk=${1:?the APK}
id=${2:?the application id}
wait=${3:-30}
adb wait-for-device
adb install -r -t "$apk" >/dev/null
adb shell pm clear "$id" >/dev/null
adb logcat -c
adb shell am start -W -n "$id/com.tns.NativeScriptActivity" >/dev/null
sleep "$wait"
log=$(mktemp)
adb logcat -d > "$log"
pid=$(adb shell pidof "$id" | tr -d '\r' || true)
echo "--- logcat (errors)"
grep -E " E |FATAL|AndroidRuntime" "$log" | grep -E "$id|AndroidRuntime|NSNative" | head -40 || true
if grep -qE "FATAL EXCEPTION|not precompiled" "$log"; then echo "the app crashed or loaded a class the build left out"; exit 1; fi
[[ -n "$pid" ]] || { echo "the app is not running after ${wait}s"; exit 1; }
echo "running after ${wait}s (pid $pid)"
