# @nativescript/compiler (alpha)

Compiles a NativeScript app and `@nativescript/core` to Swift (iOS) and Kotlin (Android) for release builds, with no
JavaScript runtime in the shipped app. The NativeScript CLI runs it; you don't call it directly.

## Install

```bash
npm install -g nativescript@alpha

# in your project
npm install @nativescript/core@alpha
npm install --save-dev @nativescript/compiler@alpha
```

The CLI, `@nativescript/core` and `@nativescript/compiler` must be the same version: the build stops if your core is
not the one this compiler was made from. You need Node.js 20+, Xcode 26+ for iOS, and JDK 17+ with the Android SDK
for Android.

## Use

```bash
ns run ios --compiled                                # build, install and launch on a simulator
ns build ios --compiled --for-device --team-id <id>  # signed archive and .ipa
ns run android --compiled --key-store-path <file> --key-store-password <pw> \
  --key-store-alias <alias> --key-store-alias-password <pw>
```

`--compiled` implies `--release`, and an Android release must be signed, so Android needs all four `--key-store-*`
options. To compile every release, set `release: { compiled: true }` in `nativescript.config.ts`. The generated
projects are in `platforms/compiled/ios` and `platforms/compiled/android`; the build prints where the `.app`, `.ipa`,
`.apk` or `.aab` is.

Plain TypeScript with XML, Angular, Vue and Svelte apps are compared screen by screen against their JavaScript
releases. React, Solid and Octane compile through the same pipeline but are not in those comparisons yet.

## When something fails

- `ns compiled report ios` (or `android`) turns a failed build or a runtime error into a NativeScript issue; it shows
  you the report and asks before sending anything.
- `--no-compiled` builds that release on the JavaScript runtime, so you can still ship.

## Links

- [Getting started](https://docs.nativescript.org/guide/publishing/compiled-getting-started)
- [What works](https://docs.nativescript.org/guide/publishing/compiled-differences): frameworks, plugins,
  [JavaScript coverage](https://docs.nativescript.org/guide/publishing/compiled-differences#javascript-coverage) and
  known differences
- [Issues](https://github.com/NativeScript/NativeScript/issues?q=label%3Acompiled)

## License

Apache-2.0. Working on the compiler itself: [docs/CONTRIBUTING.md](https://github.com/NativeScript/NativeScript/blob/main/packages/compiler/docs/CONTRIBUTING.md).
