# Android SDK snapshot

What was installed in `$ANDROID_HOME` (`~/Library/Android/sdk`) on 2026-08-27, taken
before the platform jars for API 21-37 were added to generate the Android typings.

Reinstall any one of these with:

```sh
"$ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager" "<package>"
```

## Platforms

These were present with their complete contents (`data/`, `skins/`, `templates/`,
sources and stubs). Platforms added afterwards to generate typings hold only
`android.jar`; reinstalling one restores it in full.

| Package | Version | Description |
| --- | --- | --- |
| `platforms;android-28` | 6 | Android SDK Platform 28 |
| `platforms;android-31` | 1 | Android SDK Platform 31 |
| `platforms;android-34` | 3 | Android SDK Platform 34 |
| `platforms;android-35` | 2 | Android SDK Platform 35 |
| `platforms;android-36` | 2 | Android SDK Platform 36 |

## Everything else

### Build tools

| Package | Version | Description |
| --- | --- | --- |
| `build-tools;27.0.3` | 27.0.3 | Android SDK Build-Tools 27.0.3 |
| `build-tools;28.0.2` | 28.0.2 | Android SDK Build-Tools 28.0.2 |
| `build-tools;28.0.3` | 28.0.3 | Android SDK Build-Tools 28.0.3 |
| `build-tools;29.0.2` | 29.0.2 | Android SDK Build-Tools 29.0.2 |
| `build-tools;29.0.3` | 29.0.3 | Android SDK Build-Tools 29.0.3 |
| `build-tools;30.0.1` | 30.0.1 | Android SDK Build-Tools 30.0.1 |
| `build-tools;30.0.2` | 30.0.2 | Android SDK Build-Tools 30.0.2 |
| `build-tools;30.0.3` | 30.0.3 | Android SDK Build-Tools 30.0.3 |
| `build-tools;31.0.0` | 31.0.0 | Android SDK Build-Tools 31 |
| `build-tools;32.0.0` | 32.0.0 | Android SDK Build-Tools 32 |
| `build-tools;32.1.0-rc1` | 32.1.0 rc1 | Android SDK Build-Tools 32.1-rc1 |
| `build-tools;33.0.0` | 33.0.0 | Android SDK Build-Tools 33 |
| `build-tools;33.0.0-rc1` | 33.0.0 rc1 | Android SDK Build-Tools 33-rc1 |
| `build-tools;33.0.1` | 33.0.1 | Android SDK Build-Tools 33.0.1 |
| `build-tools;34.0.0` | 34.0.0 | Android SDK Build-Tools 34 |
| `build-tools;35.0.0` | 35.0.0 | Android SDK Build-Tools 35 |
| `build-tools;35.0.1` | 35.0.1 | Android SDK Build-Tools 35.0.1 |
| `build-tools;36.0.0` | 36.0.0 | Android SDK Build-Tools 36 |

### Platform tools

| Package | Version | Description |
| --- | --- | --- |
| `platform-tools` | 37.0.0 | Android SDK Platform-Tools |

### Command-line tools

| Package | Version | Description |
| --- | --- | --- |
| `cmdline-tools;latest` | 19.0 | Android SDK Command-line Tools (latest) |

### NDK

| Package | Version | Description |
| --- | --- | --- |
| `ndk;23.2.8568313` | 23.2.8568313 | NDK (Side by side) 23.2.8568313 |
| `ndk;26.1.10909125` | 26.1.10909125 | NDK (Side by side) 26.1.10909125 |
| `ndk;27.3.13750724` | 27.3.13750724 | NDK (Side by side) 27.3.13750724 |
| `ndk;29.0.14206865` | 29.0.14206865 | NDK (Side by side) 29.0.14206865 |

### CMake

| Package | Version | Description |
| --- | --- | --- |
| `cmake;3.10.2.4988404` | 3.10.2 | CMake 3.10.2.4988404 |
| `cmake;3.18.1` | 3.18.1 | CMake 3.18.1 |
| `cmake;3.22.1` | 3.22.1 | CMake 3.22.1 |
| `cmake;3.31.6` | 3.31.6 | CMake 3.31.6 |

### System images

| Package | Version | Description |
| --- | --- | --- |
| `system-images;android-33;google_apis;arm64-v8a` | 17 | Google APIs ARM 64 v8a System Image |
| `system-images;android-35;google_apis_playstore;arm64-v8a` | 9 | Google Play ARM 64 v8a System Image |
| `system-images;android-36.1;google_apis;arm64-v8a` | 4 | Google APIs ARM 64 v8a System Image |
| `system-images;android-36.1;google_apis_playstore;arm64-v8a` | 3 | Google Play ARM 64 v8a System Image |

### Emulator

| Package | Version | Description |
| --- | --- | --- |
| `emulator` | 36.6.11 | Android Emulator |

### Extras

| Package | Version | Description |
| --- | --- | --- |
| `extras;google;google_play_services` | 49 | Google Play services |

### Skia parser

| Package | Version | Description |
| --- | --- | --- |
| `skiaparser;1` | 6 | Layout Inspector image server for API 29-30 |
| `skiaparser;2` | 3 | Layout Inspector image server for API S |
| `skiaparser;3` | 8 | Layout Inspector image server for API 31-36 |

### Patcher

| Package | Version | Description |
| --- | --- | --- |
| `patcher;v4` | 1 | SDK Patch Applier v4 |


## Platforms present after typings generation

API 21-37 were installed to merge the Android typings. Everything except
`android.jar`, `package.xml` and `source.properties` was deleted from each newly
installed platform, which keeps them around 25 MB instead of ~130 MB. Reinstall any
of them with the command at the top to get the full platform back.

| Platform | Size | Contents |
| --- | --- | --- |
| `android-21` | 25M | android.jar only |
| `android-22` | 25M | android.jar only |
| `android-23` | 23M | android.jar only |
| `android-24` | 33M | android.jar only |
| `android-25` | 33M | android.jar only |
| `android-26` | 25M | android.jar only |
| `android-27` | 28M | android.jar only |
| `android-28` | 166M | full (pre-existing) |
| `android-29` | 20M | android.jar only |
| `android-30` | 21M | android.jar only |
| `android-31` | 117M | full (pre-existing) |
| `android-32` | 26M | android.jar only |
| `android-33` | 26M | android.jar only |
| `android-34` | 126M | full (pre-existing) |
| `android-35` | 130M | full (pre-existing) |
| `android-36` | 134M | full (pre-existing) |
| `android-36.1` | 27M | android.jar only |
| `android-37.0` | 41M | android.jar only |
| `android-37.1` | 47M | android.jar + data/api-versions.xml |

`android-37.1` also keeps `data/api-versions.xml`, the file that records the API level every
class and member appeared in. It is the only platform data file kept, and only for the newest
platform, because the dts-generator reads it to annotate merged typings.

There is no stable `platforms;android-37.2`; it exists only as `android-37.2-beta1`
through `-beta3`, so 37.1 is the newest stable platform and the one the typings
are generated from.

## Restore the whole snapshot

```sh
"$ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager" \
  "build-tools;27.0.3" \
  "build-tools;28.0.2" \
  "build-tools;28.0.3" \
  "build-tools;29.0.2" \
  "build-tools;29.0.3" \
  "build-tools;30.0.1" \
  "build-tools;30.0.2" \
  "build-tools;30.0.3" \
  "build-tools;31.0.0" \
  "build-tools;32.0.0" \
  "build-tools;32.1.0-rc1" \
  "build-tools;33.0.0" \
  "build-tools;33.0.0-rc1" \
  "build-tools;33.0.1" \
  "build-tools;34.0.0" \
  "build-tools;35.0.0" \
  "build-tools;35.0.1" \
  "build-tools;36.0.0" \
  "cmake;3.10.2.4988404" \
  "cmake;3.18.1" \
  "cmake;3.22.1" \
  "cmake;3.31.6" \
  "cmdline-tools;latest" \
  "emulator" \
  "extras;google;google_play_services" \
  "ndk;23.2.8568313" \
  "ndk;26.1.10909125" \
  "ndk;27.3.13750724" \
  "ndk;29.0.14206865" \
  "patcher;v4" \
  "platform-tools" \
  "platforms;android-28" \
  "platforms;android-31" \
  "platforms;android-34" \
  "platforms;android-35" \
  "platforms;android-36" \
  "skiaparser;1" \
  "skiaparser;2" \
  "skiaparser;3" \
  "system-images;android-33;google_apis;arm64-v8a" \
  "system-images;android-35;google_apis_playstore;arm64-v8a" \
  "system-images;android-36.1;google_apis;arm64-v8a" \
  "system-images;android-36.1;google_apis_playstore;arm64-v8a"
```

