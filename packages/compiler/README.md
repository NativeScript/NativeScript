# @nativescript/compiler

Compiles a NativeScript app (Angular, Vue, React, Svelte, Solid or Octane on `@nativescript/core`) to Swift for iOS and
Kotlin for Android, with no JavaScript runtime in the release. The NativeScript CLI runs it for
`ns build ios --compiled` and `ns build android --compiled`; app developers never call it directly.

User documentation: [Compiled releases](https://docs.nativescript.org/guide/publishing/compiled).

## What is in this package

| Folder | What it is |
| --- | --- |
| `src/` | The compiler: framework front ends, the TypeScript-to-Swift and TypeScript-to-Kotlin translators, plugin handling, project generation |
| `kit-apple/` | NativeScriptKit for Apple platforms, a Swift package every compiled iOS app links: the JavaScript-semantics runtime, signals, the bridges, and `Core/`, which is `@nativescript/core` compiled to Swift |
| `kit-android/` | NativeScriptKit for Android, a Gradle project (core's platform layer ported to Kotlin; generation from core comes next) |
| `bin/` | `ns-native` (what the CLI runs) and `ns-native-retrace` (Android stack traces in source lines) |
| `tests/` | The differential tests: each case runs under Node and as compiled Swift and Kotlin, and the output must match |
| `docs/` | `REFERENCE.md` (how the compiler works and what it supports), `CLI.md` (the CLI integration), `KIT-FROM-CORE.md` (generating the kit from core) |

## The kit is generated from core

`kit-apple/Sources/NativeScriptKit/Core` is never committed. It is generated from this repository's `packages/core`
and `packages/types-ios` by `tools/native-kit`, which runs this package's compiler over core's TypeScript:

```bash
npx nx run compiler:kit      # builds core, then generates the kit's Core
```

A published `@nativescript/compiler` carries the kit generated from one core release, and has that release's
version: every core release tag (`{version}-core`) publishes it (`.github/workflows/npm_release_compiler.yml`).

## Develop

Node.js 23.6 or newer (the compiler runs its TypeScript sources directly), Xcode for iOS.

```bash
npx nx run compiler:deps     # the compiler's and the tests' dependencies
npx nx run compiler:kit      # generate the kit from core
npx nx run compiler:test     # differential tests; add -- --swift or -- --kotlin for one platform
npx nx run compiler:pack     # the npm tarball, kit included, in dist/packages
```

Compile an app with this checkout:

```bash
node packages/compiler/src/cli.ts <app folder> --out <folder>     # then xcodegen generate and xcodebuild, or Gradle
```

Real apps, compared pixel by pixel against their NativeScript Release builds, live outside this repository in
NativeScript/swiftui-live (`native-release/`), which runs this package from a checkout (`NS_COMPILER`).
