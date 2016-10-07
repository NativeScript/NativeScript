Development Workflow
====================

The repository contains several packages and apps:
 - `tns-platform-declarations` - Android and iOS native APIs supported in JavaScript
 - `tns-core-modules` - Core ui, io and sensor modules
 - `apps` - UI app used for manual testing and automation
 - `tests` - Unit tests for the `tns-core-modules`

Working with the repo is organized with npm scripts,
go and read through the `scripts` section in the [package.json](./package.json).

Managing dependencies:
 - `tns-core-modules` depends on:
    - `tns-platform-declarations`
 - `apps` depends on:
    - `tns-platform-declarations`
    - `tns-core-modules`
 - `tests` depends on:
    - `tns-platform-declarations`
    - `tns-core-modules`

> NOTE: `tns-core-modules` depends on `tns-core-modules-widgets`,
this dependency contains native code and is rarely modified so for now it remains outside this repo.

## Manage Dependencies
Get devDependencies by:
```bash
npm install
```

Setting up the environment for work we use [`npm link`](https://docs.npmjs.com/cli/link).
The dependencies in the repo are `npm link`-ed (~synlinked) using the following script:
```bash
npm run setup
```

## TypeScript
The following commands are commonly used to compile the `tns-core-modules`:
```bash
# Full tsc with type checking ~22.2s.
tsc -p tns-core-modules

# Fast tsc ~11.2s.
tsc -p tns-core-modules --skipLibCheck

# Fast watcher, ~4s. on save
tsc -p tns-core-modules --skipLibCheck -w
```

Compiling the modules, tests and apps has also npm scripts:
```
npm run dev-tsc-tns-core-modules
npm run dev-tsc-tests
npm run dev-tsc-apps
```

The modules have `typescript` as devDependency so you should also be able to use locally installed TypeScript compiler from node_modules:
```
./node_modules/.bin/tsc -p tns-core-modules
```

You can compile the typescript files in the `tns-core-modules`, `tns-platform-declarations`, `apps` and `tests` at once at the root of the repo:
```
npm run tsc
```

## Tests
The test app is an ordinary NativeScript app that logs the test results as it go.
To run the test app:
```
# Once after npm install
npm run setup

# After changes in the modules
tsc -p tns-core-modules
# After changes in the tests
tsc -p tests

tns run ios --path tests
tns run android --path tests
```

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
The terminal will point the address you can open in your web browsed.
