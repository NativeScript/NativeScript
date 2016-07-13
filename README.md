[![Build Status](https://travis-ci.org/NativeScript/tns-core-modules-widgets.svg?branch=master)](https://travis-ci.org/NativeScript/tns-core-modules-widgets)

# Widgets
Contains the source code of the `tns-core-modules-widgets` library.
This library contains native code (Java and Objective-C) used by the NativeScript core modules `tns-core-modules`.

## How to Build
On Mac in the root folder run:
```
./build.sh
```
This will run Android and iOS build and pack `dist/tns-core-modules-widgets-*.tgz`.

## How to Build Android
In the `android` folder run:
```
gradle build
```
This will output `android/build/widgets-release.aar`.

## How to Build iOS
On Mac in the `ios` folder under mac run:
```
./build.sh
```
This will output `ios/build/TNSWidgets.framework`.

