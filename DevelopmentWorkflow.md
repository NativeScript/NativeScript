Development Workflow
====================

## Project Structure

The repository contains several packages and apps:
 - `tns-core-modules` - The core NativeScript TypeScript modules used to develop NativeScript apps
 - `tns-core-modules-widgets` - The native widgets (Java and Objective-C) used by the core NativeScript modules
 - `e2e/ui-tests-app` - UI app used for manual testing and automation
 - `e2e` - applications and *e2e* tests
 - `tests` - Unit tests app for the `tns-core-modules`
 - `tns-platform-declarations` - TypeScript definitions for Android and iOS native APIs

Working with the repo is organized with npm scripts,
go and read through the `scripts` section in the [package.json](./package.json).

Managing dependencies:
 - `tns-core-modules` depends on:
    - `tns-platform-declarations`
 - `e2e/ui-tests-app` depends on:
    - `tns-platform-declarations`
    - `tns-core-modules`
 - `e2e` depends on:
    - `tns-core-modules`
 - `tests` depends on:
    - `tns-platform-declarations`
    - `tns-core-modules`

> NOTE: `tns-core-modules` depends on `tns-core-modules-widgets`,

## Initial Setup

Clone (or fork/clone) the repo:

``` bash
git clone https://github.com/NativeScript/NativeScript.git
```

Install dependencies:

``` bash
npm install
```

## Running Unit Tests

``` bash
cd tests
tns run android | ios
```

## Running the UI Test App

The UI test app is an ordinary NativeScript app that logs the test results on the go.
After the [initial setup](#initial-setup) you can run the tests with:

``` bash
cd e2e/ui-tests-app

# Run the Android app
tns platform add android@next # NOTE: do not commit this change to package.json
tns run android

# Run the iOS app
tns platform add ios@next # NOTE: do not commit this change to package.json
tns run ios

```

## Running Another App

1. Open the app, where you will use the module from the repository in the console.
2. Add the `tns-core-modules` in the application via:
```bash
npm install --save <path to tns-core-modules>
# Example: npm install --save ../NativeScript/tns-core-modules
```
3. Run the app
```bash
tns run ios
tns run android
```

---
**NOTE**

Linking `tns-core-modules` in Angular app does not work at the moment. Check [#7905](https://github.com/NativeScript/NativeScript/issues/7905) for more details on the issue.

---

## Platform declarations
To update the platform declarations (the ios.d.ts-es) you can run:

```
npm install
npm run dev-declarations
```

This script will update the iOS declarations. Android tools are not integrated yet.
The declarations are generated from the test app and will include the native code from tns-core-modules-widgets.

# Documentation API reference

The following will build the API reference pages in `bin/dist/apiref`:

```
npm run typedoc
```

If you want to improve on the documentation you can also build and start up dev web server:

```
npm run dev-typedoc
```

The terminal will point the address you can open in your web browser.
