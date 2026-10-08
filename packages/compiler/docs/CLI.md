# Native release builds from the NativeScript CLI

Develop as usual with `ns run ios` / `ns debug` (JavaScript runtime, HMR).
For the release, one switch compiles the app to native code with no
JavaScript runtime, through the CLI's normal build, run and deploy flow.

Names: the flag is `--compiled`, the package `@nativescript/compiler`, the
output `platforms/compiled/<platform>`, because the output is compiled from
the app's source. The config key is `release.compiled`.

## Use it

```sh
npm install --save-dev @nativescript/compiler

ns build ios --compiled                 # simulator .app (--compiled implies --release)
ns build ios --compiled --for-device    # device archive and .ipa (sign with --team-id or --provision)
ns run ios --compiled                   # build, install, launch on a simulator or device
ns build android --compiled --key-store-path release.keystore --key-store-password … \
  --key-store-alias … --key-store-alias-password …    # signed APK; add --aab for a bundle
ns run android --compiled --key-store-path …            # build, install, launch
```

Or make it the default for every release build in `nativescript.config.ts`:

```ts
export default {
  id: 'org.example.app',
  release: {
    compiled: true,                     // release builds are compiled
    pluginSources: { 'some-plugin': '../some-plugin' },  // the compiler's options sit beside it
  },
  android: { release: { compiled: false } },   // per-platform override
} as NativeScriptConfig;
```

`release` is also the compiler's options object: `pluginReplacements`,
`pluginSources` and `allowUnimplementedProperties`. A platform's `release`
merges over the top-level one, and object options merge by key.

A property core declares that the kit does not apply stops the native build with the view, property and file:line; `release: { allowUnimplementedProperties: true }` in the config builds anyway, with warnings.

`ns run ios`, `ns debug` and every debug build stay on the JavaScript
runtime. `--no-compiled` builds one release on the JavaScript runtime despite
the config. The flag wins over the config, and the platform key wins over
the top-level key.

## How it works

The CLI integrates the compiler the way it integrates `@nativescript/webpack`:
a devDependency resolved from the project's `node_modules`, run with the
CLI's own Node. Everything is in `lib/services/compiled-release-service.ts`;
the controllers call it at two points.

| Step | JavaScript release | Native release |
| --- | --- | --- |
| Options | `--release` | `--compiled` sets `release`; `PrepareData.compiled` carries the flag; `CompiledReleaseService.isCompiledRelease` resolves flag, config and platform |
| Prepare (`PrepareController.prepareCore`) | add `platforms/<platform>`, webpack, native prepare | `before-prepare` hooks, then `node <package bin> <project> --platform <p> --out platforms/compiled/<p> --name <projectName> --bundle <app id>`; no webpack, no runtime platform project |
| Build (`BuildController.build`) | `platformProjectService.buildProject` | iOS: `xcodegen generate`, then `xcodebuild build` for the simulator or `xcodebuild archive` + `-exportArchive` for a device. Android: the package's `kit-android/gradlew -p platforms/compiled/android :assembleRelease` or `:bundleRelease` |
| Signing | `--provision`, `--team-id`, `--key-store-*` | iOS `--team-id`: automatic signing (`DEVELOPMENT_TEAM`, `-allowProvisioningUpdates`). iOS `--provision`: the archive stays unsigned and the export signs it with the profile (an ExportOptions.plist naming the profile, team and method). Neither: an unsigned archive and an unsigned `.ipa`, with a warning. Android: `-Pandroid.injected.signing.*` from the `--key-store-*` options, as Android Studio signs |
| Install, launch | `getLatestAppPackagePath` → install | the build returns the package path; `ns run --release` and `ns deploy` pass it to `DeviceInstallAppService` and `startApplication` unchanged |

Outputs stay under `platforms/compiled/<platform>`, so `platforms/ios` and
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
`npm pack` as `file:vendor/nativescript-compiler-0.1.0.tgz`.

- `ns run ios --release --compiled` on simulator 0283B87E: compiled, built,
  installed and launched; the Recipes home screen matches the
  NativeScript build. The installed bundle is the executable, Info.plist,
  the asset catalog with the app icon, the launch storyboard and PkgInfo:
  4.4 MB on the simulator (as the current compiler builds it).
- `ns build ios --release --compiled --for-device`: an unsigned archive and
  an unsigned `.ipa` (562 kB; the app in the archive is 1.3 MB, as the
  current compiler's `--build --device` makes them). With
  `--provision <profile>` the archive succeeds and the export reaches
  signing; the machine had no valid profile for a matching certificate, so
  it stopped at "No signing certificate … / profile expired".
- `ns run android --release --compiled` with a keytool keystore on an
  emulator (Pixel 6a, API 35): installed, launched, Recipes home screen.
  APK 0.9 MB (915 kB as the current compiler builds it), signed with the
  given key (apksigner). `--aab`: 1.6 MB bundle, signed with the same key
  (jarsigner).
- `ns run ios` without `--compiled`: the platform is added, webpack runs,
  Xcode builds the debug app (90 MB with the runtime), it installs and
  syncs as before.
- `release: { compiled: true }` in the config: `ns build ios --release` builds
  native; `ns prepare ios --release --no-compiled` and `ns prepare ios` run
  webpack.
- Without the package: "A compiled release build needs
  @nativescript/compiler in the project. Install it with
  'npm install --save-dev @nativescript/compiler', or build on the
  JavaScript runtime with --no-compiled." (If the package is listed in
  package.json but missing from node_modules, the CLI's dependency check
  installs it first.)
- Unit tests: `test/services/compiled-release-service.ts` (config and flag
  resolution, compiler invocation, missing package, Android signing and
  `--aab`, iOS simulator, unsigned and `--provision` builds), the `--compiled`
  option in `test/options.ts`, the native prepare in
  `test/controllers/prepare-controller.ts`. The full suite passes (1911
  tests).

## App_Resources

The compiler's generated projects carry them as the CLI carries them into
`platforms/` (`compiler/src/app-resources.ts`; README, The generated
projects), so the CLI has nothing to add.

| Resource | Native build |
| --- | --- |
| Android `res/` (launcher icons, launch screen theme, splash, styles, colors) | a resource directory of the Gradle project; `java/` and `assets/` are source directories |
| Android `AndroidManifest.xml` (permissions, activities, meta-data, queries) | the app's manifest, `__PACKAGE__` substituted, the runtime's activity as `MainActivity`, its application class and error activity left out; plugins' manifests merged by Gradle |
| Android `app.gradle`, `before-plugins.gradle` (versionCode, versionName, SDK levels, dependencies) | applied as the runtime's `build.gradle` applies them |
| iOS `Assets.xcassets` (app icon, launch images), `LaunchScreen.storyboard`, `PrivacyInfo.xcprivacy`, other files and folders | resources of the app target |
| iOS `Info.plist` (usage descriptions, display name, orientations, URL schemes, version and build number) | merged as the CLI merges it: plugins', then the app's, then `CFBundleIdentifier` |
| iOS `app.entitlements` | plugins' and the app's, merged; `CODE_SIGN_ENTITLEMENTS` unless `build.xcconfig` sets it |
| iOS `build.xcconfig` | the app's, then plugins' (merged as the CLI merges them), as the app target's configuration file; a deployment target below the kit's iOS 17 is raised to it |
| Fonts in `<app>/fonts` | in the bundle (iOS) or assets at `app/fonts` (Android), registered or loaded as core does |
| `App_Resources/iOS/src` (native source the app's TypeScript calls) | Swift and Metal compiled into the app target, with a symbol table for the TypeScript that calls it; Swift that needs the JavaScript runtime's code is left out with a message (ns-octane's `OctaneLogo.swift` and its shader) |
| `App_Resources/iOS/extensions/<name>` (widgets, Live Activities) | an app extension target per folder, `<app id>.<name>`, with `extension.json`'s frameworks and settings, embedded in the app |
| `App_Resources/iOS/Podfile`, plugins' `platforms/ios/Podfile` | one `Podfile` merged as the CLI merges it; the compile runs `xcodegen` and `pod install` and writes `ns-native-project.json` naming the workspace to build |
| `ios.SPMPackages` (the app's and plugins' `nativescript.config.ts`) | packages of the project, linked by the app and the extensions their `targets` name |

## Still needed for production

- **Core's `NativeScriptConfig` type** (`packages/core/config/config.interface.ts`)
  needs the `release` key the CLI and the compiler read:

  ```ts
  /**
   * Release builds compiled to native code by `@nativescript/compiler`, and the compiler's options.
   */
  export interface IConfigRelease {
  	/**
  	 * Release builds compile the app to native code instead of bundling it for the JavaScript runtime.
  	 * `--compiled` / `--no-compiled` override it per command.
  	 */
  	compiled?: boolean;
  	/** Packages the compiled build replaces with a module of the app's, as `'package': 'path'`. */
  	pluginReplacements?: Record<string, string>;
  	/** Checkouts of plugins' TypeScript source, as `'package': 'path'`, used instead of fetching the published revision. */
  	pluginSources?: Record<string, string>;
  	/** Build despite properties core declares that the compiled build does not apply, with a warning for each. */
  	allowUnimplementedProperties?: boolean;
  }

  // IConfigPlatform (so IConfigIOS and IConfigAndroid):
  	/** Merged over the top-level `release` for this platform; object options merge by key. */
  	release?: IConfigRelease;

  // NativeScriptConfig:
  	/** Release builds compiled to native code, and the compiler's options. */
  	release?: IConfigRelease;
  ```

- **Publish the compiler package** as `@nativescript/compiler`, with
  versioning tied to the kit, and CI that packs it and builds an app from
  the tarball for both platforms.
- **A precompiled JavaScript build** of `compiler/src` (tsc or esbuild to
  `dist/`), so it runs on the Node versions the CLI supports (Node 20+)
  without the type-stripping hook. Today the entry needs Node 23.6+ and an
  API that Node still marks experimental.
- **xcodegen** is a required tool for iOS (the CLI says how to install it).
  Writing the `.xcodeproj` directly, or a Swift package with an app target,
  would remove it.
- **Device signing:** `--team-id` (automatic signing) produces a signed
  archive and `.ipa` with a real team; `--provision` (manual) still needs a
  run with a manually managed profile.
- **`ns publish ios`** builds with `buildForAppStore`; the native build
  archives and exports with the CLI's distribution export options, but
  it has not been run. `ns publish android` has no native counterpart to
  check.
- **`ns debug --compiled`** should be refused with a message (the native app
  has no inspector); it is not handled specially.
- **Hooks**: `before-prepare`/`after-prepare` run; `before-buildIOS` and
  `before-buildAndroid` do not, because the platform services' build is not
  called. Hooks that assume `platforms/<platform>` or the webpack bundle
  (many plugins' hooks) do not apply. The compiler could run its own hook
  points, or the service could fire `buildIOS`/`buildAndroid` hooks with
  the native project root.
- **Workspaces**: with CocoaPods the compile generates the Xcode project
  and runs `pod install` itself, and writes
  `platforms/compiled/ios/ns-native-project.json` (`{"workspace":
  "<name>.xcworkspace"}`). When that file is there, `buildIOS` must not run
  `xcodegen` (it would drop the pods' integration) and must give xcodebuild
  `-workspace <workspace>` instead of `-project <name>.xcodeproj`, for the
  simulator build and the archive alike.
- **Plugins**: on iOS a plugin compiles from its TypeScript source and its
  `platforms/ios` code is linked unchanged (README, Plugins); Gradle
  dependencies, resource bundles and plugin hooks are not carried yet,
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
