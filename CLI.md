# Native release builds from the NativeScript CLI

Develop as usual with `ns run ios` / `ns debug` (JavaScript runtime, HMR).
For the release, one switch compiles the app to native code with no
JavaScript runtime, through the CLI's normal build, run and deploy flow.

## Use it

```sh
npm install --save-dev @nativescript/native-release

ns build ios --native                 # simulator .app (--native implies --release)
ns build ios --native --for-device    # device archive and .ipa (sign with --team-id or --provision)
ns run ios --native                   # build, install, launch on a simulator or device
ns build android --native --key-store-path release.keystore --key-store-password … \
  --key-store-alias … --key-store-alias-password …    # signed APK; add --aab for a bundle
ns run android --native --key-store-path …            # build, install, launch
```

Or make it the default for every release build in `nativescript.config.ts`:

```ts
export default {
  id: 'org.example.app',
  nativeRelease: true,                  // release builds are native
  android: { nativeRelease: false },    // per-platform override
} as NativeScriptConfig;
```

`ns run ios`, `ns debug` and every debug build stay on the JavaScript
runtime. `--no-native` builds one release on the JavaScript runtime despite
the config. The flag wins over the config, and the platform key wins over
the top-level key.

## How it works

The CLI integrates the compiler the way it integrates `@nativescript/webpack`:
a devDependency resolved from the project's `node_modules`, run with the
CLI's own Node. Everything is in `lib/services/native-release-service.ts`;
the controllers call it at two points.

| Step | JavaScript release | Native release |
| --- | --- | --- |
| Options | `--release` | `--native` sets `release`; `PrepareData.native` carries the flag; `NativeReleaseService.isNativeRelease` resolves flag, config and platform |
| Prepare (`PrepareController.prepareCore`) | add `platforms/<platform>`, webpack, native prepare | `before-prepare` hooks, then `node <package bin> <project> --platform <p> --out platforms/native/<p> --name <projectName> --bundle <app id>`; no webpack, no runtime platform project |
| Build (`BuildController.build`) | `platformProjectService.buildProject` | iOS: `xcodegen generate`, then `xcodebuild build` for the simulator or `xcodebuild archive` + `-exportArchive` for a device. Android: the package's `kit-android/gradlew -p platforms/native/android :assembleRelease` or `:bundleRelease` |
| Signing | `--provision`, `--team-id`, `--key-store-*` | iOS `--team-id`: automatic signing (`DEVELOPMENT_TEAM`, `-allowProvisioningUpdates`). iOS `--provision`: the archive stays unsigned and the export signs it with the profile (an ExportOptions.plist naming the profile, team and method). Neither: an unsigned archive and an unsigned `.ipa`, with a warning. Android: `-Pandroid.injected.signing.*` from the `--key-store-*` options, as Android Studio signs |
| Install, launch | `getLatestAppPackagePath` → install | the build returns the package path; `ns run --release` and `ns deploy` pass it to `DeviceInstallAppService` and `startApplication` unchanged |

Outputs stay under `platforms/native/<platform>`, so `platforms/ios` and
`platforms/android` are never half-created: a later `ns run ios` still adds
the runtime platform as before. The app id is the project's
(`nativescript.config` `id`), so the native release replaces the JavaScript
build on a device, and `ns run` launches it by that id.

The compiler package is `native-release/package.json`: `bin/ns-native.js`
checks for Node 23.6+ and imports `compiler/src/cli.ts`. Node refuses to
strip TypeScript types under `node_modules`, so the entry registers a load
hook (`module.registerHooks` + `module.stripTypeScriptTypes`) for the
compiler's own files. `files` ships `bin/`, `compiler/src/`,
`kit/Package.swift`, `kit/Sources/` and `kit-android/` (sources and the
Gradle wrapper): 80 files, 261 kB packed.

## Proof (recipes-vue copy, CLI from `feat/native-release`)

The test app was a copy of `recipes-vue` with the package installed from
`npm pack` as `file:vendor/nativescript-native-release-0.1.0.tgz`.

- `ns run ios --release --native` on simulator 0283B87E: compiled, built,
  installed and launched; the Recipes home screen matches the
  NativeScript build. The installed bundle has three files (Info.plist,
  executable, PkgInfo), 3.8 MB on the simulator.
- `ns build ios --release --native --for-device`: an unsigned archive and
  an unsigned `.ipa` (436 kB; the app in the archive is 1.2 MB). With
  `--provision <profile>` the archive succeeds and the export reaches
  signing; the machine had no valid profile for a matching certificate, so
  it stopped at "No signing certificate … / profile expired".
- `ns run android --release --native` with a keytool keystore on an
  emulator (Pixel 6a, API 35): installed, launched, Recipes home screen.
  APK 800 kB, signed with the given key (apksigner). `--aab`: 1.3 MB
  bundle, signed with the same key.
- `ns run ios` without `--native`: the platform is added, webpack runs,
  Xcode builds the debug app (90 MB with the runtime), it installs and
  syncs as before.
- `nativeRelease: true` in the config: `ns build ios --release` builds
  native; `ns prepare ios --release --no-native` and `ns prepare ios` run
  webpack.
- Without the package: "A native release build needs the
  @nativescript/native-release compiler in the project. Install it with
  'npm install --save-dev @nativescript/native-release', or build on the
  JavaScript runtime with --no-native." (If the package is listed in
  package.json but missing from node_modules, the CLI's dependency check
  installs it first.)
- Unit tests: `test/services/native-release-service.ts` (config and flag
  resolution, compiler invocation, missing package, Android signing and
  `--aab`, iOS simulator, unsigned and `--provision` builds), the `--native`
  option in `test/options.ts`, the native prepare in
  `test/controllers/prepare-controller.ts`. The full suite passes (1911
  tests).

## App_Resources

| Resource | Native build |
| --- | --- |
| Android `res/` (launcher icons, launch screen theme, styles, colors) | carried: the Gradle project uses `App_Resources/Android/src/main/res` as a resource directory |
| Android `AndroidManifest.xml` (permissions, activities, meta-data, queries) | **gap**: the compiler writes its own manifest |
| Android `app.gradle` (versionCode, versionName, minSdk, dependencies) | **gap**: versionCode 1 and versionName 1.0.0 are fixed, which a store upload rejects after the first |
| iOS `Assets.xcassets` (app icon) | **gap**: the app has no icon on the home screen |
| iOS `LaunchScreen.storyboard` | **gap**: a generated blank launch screen |
| iOS `Info.plist` keys (usage descriptions, display name, orientations, URL schemes, version) | **gap**: `GENERATE_INFOPLIST_FILE` with a few fixed keys; the display name is the project name |
| iOS entitlements, `build.xcconfig` | **gap** |

All of these belong in the compiler's generated project (`project.yml`:
the asset catalog and storyboard as resources, `INFOPLIST_FILE` pointing at
a merged plist, `CODE_SIGN_ENTITLEMENTS`; the Gradle project: manifest merge
and `app.gradle` values), not in the CLI.

## Still needed for production

- **Publish the compiler package** as `@nativescript/native-release`, with
  versioning tied to the kit, and CI that packs it and builds an app from
  the tarball for both platforms.
- **A precompiled JavaScript build** of `compiler/src` (tsc or esbuild to
  `dist/`), so it runs on the Node versions the CLI supports (Node 20+)
  without the type-stripping hook. Today the entry needs Node 23.6+ and an
  API that Node still marks experimental.
- **xcodegen** is a required tool for iOS (the CLI says how to install it).
  Writing the `.xcodeproj` directly, or a Swift package with an app target,
  would remove it.
- **Device signing** was proven up to the export step only. `--team-id`
  (automatic signing) was not run, because it registers the app id on the
  developer account. Both paths need a run against a real team.
- **`ns publish ios`** builds with `buildForAppStore`; the native build
  archives and exports with the CLI's distribution export options, but
  it has not been run. `ns publish android` has no native counterpart to
  check.
- **`ns debug --native`** should be refused with a message (the native app
  has no inspector); it is not handled specially.
- **Hooks**: `before-prepare`/`after-prepare` run; `before-buildIOS` and
  `before-buildAndroid` do not, because the platform services' build is not
  called. Hooks that assume `platforms/<platform>` or the webpack bundle
  (many plugins' hooks) do not apply. The compiler could run its own hook
  points, or the service could fire `buildIOS`/`buildAndroid` hooks with
  the native project root.
- **Plugins**: on iOS a plugin compiles from its TypeScript source and its
  `platforms/ios` code is linked unchanged (README, Plugins); CocoaPods and
  Gradle dependencies, resource bundles and plugin hooks are not carried yet,
  and stop the build with the file that needs them. The plugin sources are
  cloned into `~/.cache/ns-native/plugins`: the CLI should prefetch them with
  `npm install` and report a missing source before building.
- **Simulator reinstall**: `simctl install` over an app with the same id
  merges bundles, so a native install after a JavaScript one keeps the
  JavaScript build's stale files (icons, `app/`, frameworks) in the bundle.
  `--clean` (which uninstalls first) or a fresh simulator avoids it; the
  service could uninstall when the installed bundle is a JavaScript build.
- **Incremental builds**: prepare always rewrites the generated sources and
  `shouldBuild` is always true; xcodebuild and Gradle keep the rebuild to
  about 2 s, but the compile step could skip unchanged output.
- **Build noise**: the kit's deprecation warnings make `xcodebuild -quiet`
  print "error: the following command failed with exit code 0" though the
  build succeeds.
- **Windows**: `kit-android` has no `gradlew.bat`.
