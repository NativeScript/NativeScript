# Native release builds

Develop a NativeScript app the way web developers do, with Vue, Angular,
Svelte, React, Solid or Octane on `@nativescript/core`, and ship the release as
native code: no JavaScript runtime in the app, the same views, the same
layout, the same pixels.

`ns-native` reads the app's source, puts each component through its
framework's own parser, type-checks the whole app as one TypeScript program
and writes Swift. `NativeScriptKit` is what that Swift links instead of a
JavaScript runtime: `@nativescript/core`'s iOS views, measure/layout, CSS
subset and navigation, ported to Swift, plus the signals every binding
updates through.

```
recipes-vue/app/**/*.vue ─┐
recipes-angular/src/app ──┤  front end per framework       one TypeScript program,
recipes-svelte/app ───────┼─▶ (its own parser) ─▶ virtual ─▶ typed by the checker ─▶ Swift ─▶ xcodebuild
recipes-react/src ────────┤   classes + a template tree                              │
recipes-solid/src ────────┤                                              NativeScriptKit (UIKit)
recipes-octane/src ───────┘
```

## Results

The same Recipes app (search, lists, a child component, navigation, a
switch, a segmented bar, a slider, a store, plain CSS) written in each
framework. Every comparison is against that framework's own NativeScript
Release build, on one iPhone 17 Pro simulator, below the status bar.

| | Vue | Angular | Svelte | React | Solid | Octane |
| --- | --- | --- | --- | --- | --- | --- |
| Pixels that differ, both screens | 0 | icons only* | 0 | 0 | 0 | 0 |
| Pixels that differ after the same taps | 0 | icons only* | 0 | 0 | 0 | 0 |
| Device archive, NativeScript → native | 44.8 → 0.5 MB | 45.6 → 0.5 MB | 44.8 → 0.5 MB | 44.9 → 0.5 MB | 44.6 → 0.5 MB | 44.6 → 0.5 MB |

\* NativeScript Angular does not apply the CSS `tint-color` to the
symbol images; NativeScript Vue, Svelte, React, Solid and Octane do, and so
does the native build. The cause is the Angular app's build, not Angular:
it depends on `@nativescript/tailwind`, whose PostCSS pass (autoloaded by
`@nativescript/webpack`) drops declarations outside its supported list,
`tint-color`, `vertical-alignment` and `horizontal-alignment` among them.
The Android build applies the same pass (`compiler/src/tailwind.ts`).

The Octane app needs two fixes on the NativeScript side, both described in
`results/upstream-octane.md`. Its driver cannot host `<segmentedbaritem>`, so
`recipes-octane/patches/` adds that (patch-package, on `npm install`). Octane
also drops the space before an expression in JSX text, so the app sets those
labels through ``text={`…`}``.

Launch, footprint and CPU are in `results/launch.json` (five interleaved
cold launches per app; `tools/launch.py`). The native builds reach their
settled first screen inside iOS's launch animation; the NativeScript builds
take 44–53 MB of footprint against 17 MB, and about twice the CPU to get
there (four times for Svelte).

## Android

`--platform android` writes Kotlin from the same type-checked program and a
Gradle project that links `kit-android`: the same signals and regions, and
`@nativescript/core`'s Android view layer (properties, CSS, backgrounds,
fonts, Frame with fragments, ActionBar as a Toolbar) ported to Kotlin over
core's own `org.nativescript.widgets` AAR, so layout is core's Java code.
Every comparison is against that framework's own NativeScript Android
Release build, on a Pixel 9 emulator (API 36), below the status bar.

| | Vue | Angular | Svelte | React | Solid | Octane |
| --- | --- | --- | --- | --- | --- | --- |
| Pixels that differ, both screens | 0 | 0 | 0 | 0 | 0 | 0 |
| Pixels that differ after the same taps | 0 | 0 | 0 | 0 | 0 | 0 |
| Release APK, NativeScript → native | 104.1 → 0.8 MB | 104.3 → 0.8 MB | 104.1 → 0.8 MB | 104.1 → 0.8 MB | 104.0 → 0.8 MB | 104.0 → 0.8 MB |

The NativeScript APKs carry `libNativeScript.so` (V8) for four ABIs,
100 MB of the 104; the native APKs have no native libraries
(`results/sizes-android.json`, `results/pixels-android.json`).

Two framework behaviors the Android build reproduces: the Angular app's CSS
is the filtered CSS its build ships (see above), and React screens sit in
the FlexboxLayout `react-nativescript-navigation` puts around each screen's
content. NativeScript Android loads `sys://` images as file paths, so they
show nothing in either build.

## Run it

```sh
cd native-release/compiler && npm install
node src/cli.ts ../recipes-vue --out ../build/RecipesVue --build    # Swift in ~60 ms, then xcodebuild
python3 tools/compare.py <udid> org.nativescript.recipes.vue org.nativescript.recipesvue.native <out dir>
```

```sh
node src/cli.ts ../recipes-vue --platform android --out ../build/android-vue --build    # Kotlin, then Gradle
python3 tools/compare-android.py emulator-5554 org.nativescript.recipes.vue/com.tns.NativeScriptActivity \
  org.nativescript.recipesvue.native/org.nativescript.recipesvue.MainActivity <out dir>
```

Each `recipes-*` folder is an ordinary NativeScript project: `ns run ios`
develops it with live reload as usual.

## What is where

| Path | What it is |
| --- | --- |
| `compiler/src/vue.ts`, `angular.ts`, `svelte.ts`, `react.ts`, `solid.ts`, `octane.ts` | Front ends: a component as a virtual class (state as signals, derived values as getters, one method per template expression) and a template tree |
| `compiler/src/program.ts` | The app and its virtual classes as one TypeScript program, with the frameworks' APIs as type shims |
| `compiler/src/swift.ts` | TypeScript to Swift, typed by the checker, with JavaScript's semantics where Swift's differ |
| `compiler/src/codegen.ts` | A template as `render()`: views made once, one effect per binding, keyed regions for `if`/`for` |
| `compiler/src/kotlin.ts`, `codegen-kotlin.ts`, `android.ts` | The Android target: TypeScript to Kotlin, `render()` in Kotlin, the Gradle project |
| `kit-android/` | NativeScriptKit for Android: core's Android views and styling in Kotlin on the widgets AAR; `Signals.kt`, `Regions.kt`, `JS.kt`, `Router.kt` |
| `kit/Sources/NativeScriptKit/` | The views, layout, CSS and navigation ported from `@nativescript/core`; `Signals.swift`, `Regions.swift`, `JS.swift`, `Router.swift` |
| `tools/` | `compare.py`, `interact.py`, `launch.py`, and `demo/` for the video; `compare-android.py`, `interact-android.py`, `sizes-android.py` |

## Limits

- **The subset.** What the six Recipes apps use compiles: the elements in
  `compiler/src/elements.ts`, their properties and events, CSS type and
  class selectors, and the TypeScript the translator knows (`swift.ts`). Anything else
  stops the build with the file, line and construct.
- **Plugins** and direct native API calls from JavaScript (`UIView.new()`,
  `android.widget…`) have no translation yet.
- **ListView**, gestures other than tap and animations are not ported yet;
  FlexboxLayout is ported on Android only.
