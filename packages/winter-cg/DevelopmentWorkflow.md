# Development Workflow

<!-- TOC depthFrom:2 -->

- [Prerequisites](#prerequisites)
- [How to Build the Package](#how-to-build-the-package)
- [How to Build Android](#how-to-build-android)
- [How to Build iOS](#how-to-build-ios)
- [How to Use in an Application](#how-to-use-in-an-application)

<!-- /TOC -->

## Prerequisites

Install your native toolchain and NativeScript as described in the docs: https://docs.nativescript.org/setup/quick-setup. In order to open the native Android and iOS project, you need Android Studio and Xcode respectively.

## How to Build the Package

On macOS you can execute:

```shell
$ ./build.sh
```

This script builds both Android and iOS, assembles the package at `./dist/package` and packs it as `./dist/tns-core-modules-widgets-*.tgz`.

## How to Build Android

On Unix-like operating systems you can execute:

```shell
$ ./build.android.sh
```
This script builds only the Android project, assembles the package at `./dist/package` and packs it as `./dist/tns-core-modules-widgets-*.tgz`. The output file is available at `./android/widgets/build/outputs/aar/widgets-release.aar`.

**NOTE:** To run bash script on Windows you can install [GIT SCM](https://git-for-windows.github.io/) and use Git Bash.

## How to Build iOS

On macOS you can execute:

```shell
$ ./build.ios.sh
```
This script builds only the Xcode project, assembles the package at `./dist/package` and packs it as `./dist/tns-core-modules-widgets-*.tgz`. The output native iOS framework is available at `./ios/TNSWidgets/build/TNSWidgets.framework`.

## How to Use in an Application

You could link the `tns-core-modules-widgets` plugin package to your application through the steps listed below.

In the `./dist/package` folder execute:

```
npm link
```

In your application project folder execute:

```
npm link tns-core-modules-widgets
```

Build the plugin with the above-mentioned commands after each change you would like to test.
