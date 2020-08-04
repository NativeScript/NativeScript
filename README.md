<img src="https://raw.githubusercontent.com/nstudio/nativescript/master/tools/graphics/nativescript-v8-logo-cropped.png?token=AADPTY7GXDQOQZXOMXRAWIC6YGI4A" width="100" />

# NativeScript

TypeScript driven development for native platform api's.

# Develop

```bash
# setup workspace for development
$ npm run setup
# list all available commands to run
$ npm start
```

Browse commands with descriptions of all available workspace scripts.

# Packages

* [@nativescript/angular]()
  * [How to contribute]()
* [@nativescript/core]()
  * [How to contribute]()
* [@nativescript/types]()
  * Types for both iOS/Android below wrapped up as a convenience. *Most commonly used.*
* [@nativescript/types-ios]()
  * Types for iOS
* [@nativescript/types-android]()
  * Types for Android
* [@nativescript/ui-mobile-base]()
  * Base level native ui classes 
  * [How to contribute]()
* [@nativescript/webpack]()
  * [How to contribute]()

## @nativescript/core

```bash
# livesync develop changes
$ npm start apps.playground.ios
$ npm start apps.playground.android
#
# unit tests
$ npm start packages.core.test
$ npm start packages.core.test.watch
#
# build for npm (output: 'dist/packages/core')
$ npm start packages.core.build
```

There are additional targets you can test changes against:

```bash
# variety of manual ui testing
$ npm start apps.ui.ios
$ npm start apps.ui.android
$ npm start apps.ui.clean
#
# used in CI automated tests but you can run these manually as well to check if you caused any regressions
$ npm start apps.automated.ios
$ npm start apps.automated.android
$ npm start apps.automated.clean
```

#### Compatibility package for old style tns-core-modules

Old imports from `tns-core-modules/*`

```bash
$ npm start packages.core-compat.build
```

## @nativescript/ui-mobile-base

Base native classes for ui components. 
Included with @nativescript/core right now as direct dependency but also published separately for others to build on top of if desired.

If you would like to make changes to source just build when ready to test your changes (you can then clean any testing target to try your changes)

```bash
$ npm start packages.ui-mobile-base.build
```

## @nativescript/webpack

```bash
# To try any webpack changes, just build and then clean targets to try
$ npm start packages.webpack.build
#
# unit tests
$ npm start packages.webpack.test
```
