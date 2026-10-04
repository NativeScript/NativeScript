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
does the native build.

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

## Run it

```sh
cd native-release/compiler && npm install
node src/cli.ts ../recipes-vue --out ../build/RecipesVue --build    # Swift in ~60 ms, then xcodebuild
python3 tools/compare.py <udid> org.nativescript.recipes.vue org.nativescript.recipesvue.native <out dir>
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
| `kit/Sources/NativeScriptKit/` | The views, layout, CSS and navigation ported from `@nativescript/core`; `Signals.swift`, `Regions.swift`, `JS.swift`, `Router.swift` |
| `tools/` | `compare.py`, `interact.py`, `launch.py`, and `demo/` for the video |

## Limits

- **The subset.** What the six Recipes apps use compiles: the elements in
  `compiler/src/elements.ts`, their properties and events, CSS type and
  class selectors, and the TypeScript the translator knows (`swift.ts`). Anything else
  stops the build with the file, line and construct.
- **iOS only.** The same kit for Android (Views plus the same layout port in
  Kotlin) is the next step.
- **Plugins** and direct native API calls from JavaScript (`UIView.new()`,
  `android.widget…`) have no translation yet.
- **ListView**, gestures other than tap, animations and FlexboxLayout are
  not ported yet.
