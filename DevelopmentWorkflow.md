Development Workflow
====================

## Project Structure

The repository contains several packages and apps:
 - `tns-core-modules` - The core NativeScript TypeScript modules used to develop NativeScript apps.
 - `apps` - UI app used for manual testing and automation.
 - `e2e` - applications and *e2e* tests.
 - `tests` - Unit tests app for the `tns-core-modules`.
 - `tns-platform-declarations` - TypeScript definitions for Android and iOS native APIs.

Working with the repo is organized with npm scripts,
go and read through the `scripts` section in the [package.json](./package.json).

Managing dependencies:
 - `tns-core-modules` depends on:
    - `tns-platform-declarations`
 - `apps` depends on:
    - `tns-platform-declarations`
    - `tns-core-modules`
 - `e2e` depends on:
    - `tns-core-modules`
 - `tests` depends on:
    - `tns-platform-declarations`
    - `tns-core-modules`

> NOTE: `tns-core-modules` depends on `tns-core-modules-widgets`,
this dependency contains native code and is rarely modified so for now it remains outside this repo.

## Initial Setup

Clone (or fork/clone) the repo:

```bash
git clone https://github.com/NativeScript/NativeScript.git
```

Install devDependencies:

```bash
npm install
```

Run `setup` script. This will [`npm link`](https://docs.npmjs.com/cli/link) the `tns-core-modules` and `tns-core-modules-declarations` dependencies inside the `tests` and `apps` projects.

```bash
npm run setup
```

## TypeScript

The following commands are commonly used to compile the `tns-core-modules`:
```bash
# Full tsc with type checking ~22.2s.
tsc

# Fast tsc ~11.2s.
tsc --skipLibCheck

# Fast watcher, ~4s. on save
tsc --skipLibCheck -w
```

The modules have `typescript` as a devDependency so you should also be able to use the locally installed TypeScript compiler from node_modules:

```bash
./node_modules/.bin/tsc
```

You can compile the TypeScript files in the `tns-core-modules`, `tns-platform-declarations`, `apps` and `tests` at once at the root of the repo:

```bash
npm run tsc
```

## Running Unit Tests

The test app is an ordinary NativeScript app that logs the test results as it go.
After the [initial setup](#initial-setup) you can run the tests with:

```bash
# Make sure TypeScript is transpiled
tsc

# Run the tests app
tns run ios --path tests
tns run android --path tests
```

## Running the Test App

The test app is an ordinary NativeScript app that logs the test results as it go.
After the [initial setup](#initial-setup) you can run the tests with:

```
# Make sure TypeScript is transpiled
tsc

# Run the app
tns run ios --path apps
tns run android --path apps
```

## Running Another App

The [initial setup](#initial-setup) will `npm-link` the `tns-core-modules` globally. You can use it in any local project:

```bash
# Run once: Link tns-core-modules in your project
npm link tns-core-modules

# Run the app
tns run ios
tns run android
```

> Note: You still have to rebuild the TypeScript if you have made changes in the code of the core-modules.


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
