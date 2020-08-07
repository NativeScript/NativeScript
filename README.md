<img src="https://raw.githubusercontent.com/nstudio/nativescript/master/tools/graphics/nativescript-v8-logo-cropped.png?token=AADPTY7GXDQOQZXOMXRAWIC6YGI4A" width="100" />

# NativeScript

TypeScript driven development for native platform api's.

# Develop

```
npm run setup
```

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

```
npx apps:playground:ios
npm run apps:playground:android


npm run packages:core:build
npm run packages:core:test




// livesync develop changes
nx run core-e2e-playground:ios
nx run core-e2e-playground:android

// clean and reset
nx run core-e2e-playground:clean

// unit tests
nx run core:unit
nx run core:unit.watch

// build/prepare for npm (output: 'dist/packages/core')
nx run core:build.npm
```

There are additional targets you can test changes against:

```
// variety of manual ui testing
nx run core-e2e-ui:ios
nx run core-e2e-ui:android
nx run core-e2e-ui:clean

// used in CI automated tests but you can run these manually as well to check if you caused any regressions
nx run core-e2e-automated:ios
nx run core-e2e-automated:android
nx run core-e2e-automated:clean


```

#### Compatibility package for old style tns-core-modules

```
nx run tns-core-modules-compat:build
```

## @nativescript/ui-mobile-base

Base native classes for ui components. 
Included with @nativescript/core right now as direct dependency but also published separately for others to build on top of if desired.

If you would like to make changes to source just build when ready to test your changes (you can then clean any testing target to try your changes)
```
nx run ui-mobile-base:build
```

## @nativescript/webpack

```
// To try any webpack changes, just build and then clean targets to try
nx run webpack:build

// unit tests
nx run webpack:test
```
