# Working on @nativescript/compiler

User documentation is at [Compiled releases](https://docs.nativescript.org/guide/publishing/compiled); this page is for
changing the compiler and its kits.

## Folders

| Folder | What it is |
| --- | --- |
| `src/` | The compiler: framework front ends, the TypeScript-to-Swift and TypeScript-to-Kotlin translators, plugin handling, project generation |
| `kit-apple/` | NativeScriptKit for Apple platforms, a Swift package every compiled iOS app links: the JavaScript-semantics runtime, signals, the bridges, and `Sources/NativeScriptKit/Core/`, which is `@nativescript/core` compiled to Swift |
| `kit-android/` | NativeScriptKit for Android, a Gradle library every compiled Android app links: the Kotlin runtime and bridges, and `generated/`, which is `@nativescript/core` compiled to Kotlin |
| `bin/` | `ns-native` (what the CLI runs), `ns-native-retrace` (an Android release's stack trace in source lines) and `ns-compiled-verify` (a compiled release compared screen by screen with its JavaScript release on a simulator) |
| `tests/` | The differential tests (`diff/`: each case runs under Node and as compiled Swift and Kotlin, and the output must match), the release checks, test262 and the kit build and launch checks |
| `docs/` | `REFERENCE.md` (how the compiler works and what it supports), `CLI.md` (the CLI integration), `KIT-FROM-CORE.md` (generating the kits from core) |

## The kits are generated from core

`kit-apple/Sources/NativeScriptKit/Core` and `kit-android/generated` are never committed. `tools/native-kit` runs this
package's compiler over this repository's `packages/core` (with `packages/types-ios` and `types-android`) to write them,
each with a `manifest.json` naming the core version it came from:

```bash
npx nx run compiler:kit           # builds core, then generates the iOS kit's Core
npx nx run compiler:kit-android   # the Android kit's generated/
```

A build stops when the app's installed `@nativescript/core` is not the manifest's version, so a published
`@nativescript/compiler` carries both kits from one core release, at that release's version, with a peer dependency on
exactly that core. Every core release tag (`{version}-core`) publishes it (`.github/workflows/npm_release_compiler.yml`).

## Develop

Node.js 23.6 or newer (a checkout runs its TypeScript sources directly; the package runs `dist/`, compiled at pack
time), Xcode for iOS, and a JDK with `kotlinc` (`$KOTLINC`, on `PATH`, or the one Gradle cached) for the Kotlin tests.

```bash
npx nx run compiler:deps     # the compiler's and the tests' dependencies
npx nx run compiler:kit      # generate the kits from core (and compiler:kit-android)
npx nx run compiler:test     # differential tests; add -- --swift or -- --kotlin for one platform
npx nx run compiler:pack     # the npm tarball, both kits included, in dist/packages
```

Compile an app with this checkout:

```bash
node packages/compiler/src/cli.ts <app folder> --out <folder>     # then xcodegen generate and xcodebuild, or Gradle
```

Real apps, compared pixel by pixel against their NativeScript release builds, live outside this repository in
NativeScript/swiftui-live (`native-release/`), which runs this package from a checkout (`NS_COMPILER`).
