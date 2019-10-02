Development Workflow
====================

## Project Structure

The repository contains several packages and apps:
 - `nativescript-core` - The core NativeScript TypeScript modules used to develop NativeScript apps. Produces `@nativescript/core` npm package
 - `tns-core-modules-package` - Base for generating the `tns-core-modules` package (compatibility package for projects that still improt code from `tns-core-modules`).
 - `tns-core-modules-widgets` - The native widgets (Java and Objective-C) used by the core NativeScript modules. Produces `tns-core-modules-widgets` npm package
 - `tns-platform-declarations` - TypeScript definitions for Android and iOS native APIs. Produces `tns-platform-declarations` npm package
 - `tests` - Unit tests app for the `@nativescript/core`. These test are executed as nativescript application on mobile device or emulator.
 - `unit-test` - Node unit tests. These test validate parts of the framework that do not require the nativescript runtime and so can be executed in node environment 
 - `e2e` - applications and *e2e* tests
 - `e2e/ui-tests-app` - UI app used for manual testing and automation
 - `apps` - legacy apps for testing
 - `build` - scripts used for building and infrastructure
 - `dist` - construction site for packing npm modules 

Working with the repo is organized with npm scripts,
go and read through the `scripts` section in the [package.json](./package.json).

Managing dependencies:
 - `tns-core-modules-widgets` depends on:
    - no deps
 - `@nativescript/core` depends on:
    - `tns-core-modules-widgets`
    - (devDep)`tns-platform-declarations`
 - `tns-core-modules` depends on:
    - `@nativescript/core`
    - (devDep)`tns-platform-declarations`

## Initial Setup

Clone (or fork/clone) the repo and run setup script:

``` bash
git clone https://github.com/NativeScript/NativeScript.git
cd NativeScript 
npm run setup-dev-full
```

## Running Unit Tests Application
After the [initial setup](#initial-setup) you can run the tests with:

``` bash
cd tests
tns run android | ios
```
You can do changes in the test app and `nativescript-core` and rely on HMR to re-run tests.

## Running the `e2e` Test Apps

There are couple of application used for development and testing.
The `ui-test-app` is the more frequently used for development and validation. It is an ordinary NativeScript app that logs the test results on the go.

After the [initial setup](#initial-setup) run the e2e apps with:

``` bash
cd e2e/<app-name>

# Run the Android app
tns platform add android@next
tns run android

# Run the iOS app
tns platform add ios@next
tns run ios
```

>Note: NOTE: do not commit changes in the runtime versions to `e2e/<app-name>/package.json`


## Building `tns-core-modules-widgets`
You can the following npm script to build and link the `tns-core-modules-widgets` package.
``` bash
npm run setup-widgets
```

This script will build the `tns-core-modules-widgets` package and link it inside the `nativescript-core` so it will be used for running the tests and e2e apps.

>Note: NOTE: do not commit changes in the `tns-core-modules-widgets` dependency in the `nativescript-core/package.json`

## Running Node Unit Tests
Run node unit tests with:
```
npm run unit-test
```
or run tests in watch mode:

```
npm run unit-test-watch
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
