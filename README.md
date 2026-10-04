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

`native-calls-vue` is a Vue app that calls UIKit directly from TypeScript
(SF Symbols with a symbol configuration, fonts, colors and layer shadows on
the views' `ios`, a `UIView` subclass written in TypeScript whose `drawRect`
strokes a `UIBezierPath`, an image drawn with `UIGraphicsImageRenderer`),
uses `@nativescript/core`'s
`ApplicationSettings`, `Screen` and `Color`, and runs async work over timers
(a class with a Map and a Set, `Promise.all`, a custom error caught across
awaits, JSON round trips) whose log is a Vue ref pushed to in place. Against
its NativeScript Release build: 0 pixels differ at launch and after each of
two runs of the tasks (`tools/native_calls.py`).

Launch, footprint and CPU are in `results/launch.json` (five interleaved
cold launches per app; `tools/launch.py`). The native builds reach their
settled first screen inside iOS's launch animation; the NativeScript builds
take 44–53 MB of footprint against 17 MB, and about twice the CPU to get
there (four times for Svelte).

## What compiles

The app is type-checked as one program against the real ES2022 library,
`@nativescript/core`'s own declarations and `@nativescript/types-ios`, so
everything a NativeScript app can write type-checks the same way it does
under `ns run`. What the translator does not handle stops the build with the
file, line and construct.

- **JavaScript's semantics.** Numbers are doubles and print as JavaScript
  prints them; arrays, maps, sets, records and objects are references
  (`JSArray`, `JSMap`, `JSSet`, `JSRecord`, classes) with JavaScript's
  iteration order; `any` is `Any?` read through `jsGet`/`jsSet`; `===`,
  `==`, `typeof`, truthiness, `+`, `%` and the bitwise operators are
  JavaScript's. `JSON`, `RegExp` (over NSRegularExpression), `Date`,
  `Math`, string methods in UTF-16 units and `console.log`'s formatting are in
  `kit/Sources/NativeScriptKit/Runtime/`.
- **Exceptions.** `throw` throws a `JSException` carrying the value; a
  function is Swift `throws` only if it throws or calls something that does
  (worked out across the call graph, `compiler/src/throws.ts`). What escapes
  an event handler or a binding is reported, as the frameworks report it.
- **Promises and async functions.** `JSPromise` follows ECMA-262 job for job
  (a microtask queue drained after every event and on the main run loop);
  async functions compile to continuation closures (`compiler/src/async.ts`):
  the body runs synchronously to its first `await`, loops that await are
  trampolined, `try`/`catch`/`finally` and `switch` work across awaits. The
  order of every `then`, `await` and timer matches Node's.
- **Classes and modules.** Fields initialize in JavaScript's order around
  `super()`, accessors, statics, abstract methods, interfaces that classes
  implement (Swift protocols), `instanceof`, `toString` overrides, closures
  with per-iteration loop bindings. A module's top-level statements run in
  import order from the entry point.
- **Reactivity.** Vue's `ref` is deeply reactive (an array or object it holds
  notifies its readers when mutated in place); Angular, React, Solid and
  Svelte signals notify only when written, comparing objects by identity
  (Svelte: objects always notify), as each framework does.
- **@nativescript/core.** Core classes are NativeScriptKit's classes of the
  same name; members are checked against the kit's sources
  (`compiler/src/core.ts`, `kit-index.ts`). View properties are applied by
  name (`label.text = …`), `view.ios`/`nativeView` is typed as the view's
  native class (`UILabel`, `UIImageView`…), `loaded` fires as in core, and
  `ApplicationSettings`, `Device`, `Screen` and `Color` are in
  `kit/Sources/NativeScriptKit/CoreAPI.swift`.
- **Direct iOS calls.** `UIImage.systemImageNamed('star')`,
  `view.layer.cornerRadius = 8`, `UIViewContentMode.Center`,
  `CGSizeMake(0, 4)`: each NativeScript name resolves to its Swift spelling
  through a table generated from the SDK's symbol graphs
  (`compiler/src/natives/symbols.ts`, cached per framework under
  `compiler/.cache/`), with numbers converted to the CGFloat, Int or enum the
  Swift API takes and blocks given Swift's parameter types
  (`compiler/src/native-calls.ts`). Classes extending Objective-C classes
  (`@NativeClass() class Delegate extends NSObject implements
  UITextFieldDelegate`) get the Swift signatures of the methods they
  override or implement; `ObjCExposedMethods` are `@objc` for target-action.
  `node compiler/src/natives/symbols.ts verify UIKit` reports how much of a
  framework's d.ts the table maps: for UIKit 722 of 727 classes, 99.1% of
  instance members, 92.5% of class members, 368 of 371 initializers; what
  is left is mostly API Swift does not import (variadic methods, NSZone).

## Differential tests

`node tests/diff/run.ts` runs every case in `tests/diff/cases/` under Node and,
translated to Swift, as a macOS program linking the kit's runtime, and
compares their output: values and formatting, arrays, classes, closures,
errors, promise ordering, async control flow, collections, JSON, modules,
types, regular expressions and dates, interfaces, idioms.

## Run it

```sh
cd native-release/compiler && npm install
node src/cli.ts ../recipes-vue --out ../build/RecipesVue --build    # Swift in under a second, then xcodebuild
python3 tools/compare.py <udid> org.nativescript.recipes.vue org.nativescript.recipesvue.native <out dir>
node ../tests/diff/run.ts                                           # the differential tests against Node
```

Each `recipes-*` folder is an ordinary NativeScript project: `ns run ios`
develops it with live reload as usual.

## What is where

| Path | What it is |
| --- | --- |
| `compiler/src/vue.ts`, `angular.ts`, `svelte.ts`, `react.ts`, `solid.ts`, `octane.ts` | Front ends: a component as a virtual class (state as signals, derived values as getters, one method per template expression) and a template tree |
| `compiler/src/program.ts` | The app and its virtual classes as one TypeScript program, with the frameworks' APIs as type shims |
| `compiler/src/swift.ts` | TypeScript to Swift, typed by the checker, with JavaScript's semantics where Swift's differ |
| `compiler/src/async.ts`, `throws.ts`, `modules.ts` | Async functions as continuations; which functions throw; module evaluation order |
| `compiler/src/core.ts`, `kit-index.ts` | `@nativescript/core`'s API through the kit, checked against the kit's sources |
| `compiler/src/natives/symbols.ts`, `native-calls.ts` | NativeScript's names for iOS APIs to Swift, from the SDK's symbol graphs; their translation |
| `compiler/src/platform.ts` | `isIOS`/`isAndroid`/`__IOS__`/`__ANDROID__` folded for the target before type-checking |
| `compiler/src/codegen.ts` | A template as `render()`: views made once, one effect per binding, keyed regions for `if`/`for` |
| `kit/Sources/NativeScriptKit/` | The views, layout, CSS and navigation ported from `@nativescript/core`; `Signals.swift`, `Regions.swift`, `JS.swift`, `Router.swift`, `CoreAPI.swift` |
| `kit/Sources/NativeScriptKit/Runtime/` | JavaScript's values, arrays, maps, sets, errors, promises and microtasks, timers, JSON, RegExp, Date and console formatting (Foundation only) |
| `tests/diff/` | Differential tests: each case under Node and as a native program |
| `tools/` | `compare.py`, `interact.py`, `launch.py`, and `demo/` for the video |

## Limits

- **The subset.** The elements in `compiler/src/elements.ts`, their
  properties and events, CSS type and class selectors, the TypeScript above,
  the core APIs the kit has, and iOS APIs available on iOS 17. Anything else
  stops the build with the file, line and construct. Not yet: generators,
  `Symbol`, `WeakMap`, getters on object literals, `toLocale*String`, and
  constructors in classes that extend Objective-C classes (NativeScript
  creates those with `new()`).
- **Where Swift differs, by design.** Reading past the end of an array traps
  (TypeScript types it as the element); closures have no identity; JSON
  cannot hold lone surrogates.
- **iOS only.** The same kit for Android (Views plus the same layout port in
  Kotlin) is the next step.
- **Plugins** are not compiled yet; their native code will get its tables
  from its own module the same way the SDK's do.
- **ListView**, gestures other than tap, animations and FlexboxLayout are
  not ported yet.
