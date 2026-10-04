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
| Pixels that differ, both screens | 0 | 0* | 0 | 0 | 0 | 0 |
| Pixels that differ after the same taps | 0 | 0* | 0 | 0 | 0 | 0 |
| Device archive, NativeScript → native | 44.8 → 1.1 MB | 45.6 → 1.1 MB | 44.8 → 1.1 MB | 44.9 → 1.1 MB | 44.6 → 1.1 MB | 44.6 → 1.1 MB |

\* The Angular app depends on `@nativescript/tailwind`, whose PostCSS pass
(autoloaded by `@nativescript/webpack`) drops declarations outside its
supported list, `tint-color`, `vertical-alignment` and
`horizontal-alignment` among them: its NativeScript build ships CSS without
them, so its symbol images are not tinted and its rows sit
differently from the other five apps'. Both native builds style the app with
that same CSS, the CSS its NativeScript build ships (see CSS below).

The device archive is the unsigned arm64 app as `xcodebuild archive` makes
it (`tools/sizes.py`, `results/sizes.json`). The generated project builds
NativeScriptKit as a static library target with the app's settings: `-Osize`,
full LTO, and virtual function and witness method elimination over symbols
internalized at the link, which let the linker drop the kit code and vtable
entries an app never reaches; as a Swift package built with Xcode's default
Release settings it made 1.6 MB archives. Swift's hermetic seal would drop
more (1.0 MB), but its conditional runtime records leave classes out of the
Objective-C class list that the app does create, and UIKit aborts in
`+[NSBundle bundleForClass:]` when such a view becomes first responder (a
tap in a TextField). A kit file that imports a framework beyond UIKit
(`WebView.swift`, WebKit) is compiled only for an app that uses its types: a
linked framework is loaded at launch with everything it links.

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

The gallery apps, against their NativeScript Release builds on the same
simulator: gallery-vue's 40 screens (layouts, ListView, TextView, gestures,
transforms, animations, spans, pickers, CSS selectors and variables,
borders, backgrounds, modals, TabView, Tailwind v4, the update order, and
core's imperative API: `view.animate()`, `Animation`, TouchManager,
RootLayout's `open`/`close`, `Frame.navigate` and `showModal` from script)
are 0 pixels apart in all 182 shots; the ListView and Update order screens
of the other five are 0 pixels apart in all of their shots
(`tools/gallery.py`).

Launch, footprint and CPU are in `results/launch.json` (five interleaved
cold launches per app; `tools/launch.py`). The native builds reach their
settled first screen inside iOS's launch animation; the NativeScript builds
take 45–53 MB of footprint against 17–18 MB, and about twice the CPU to get
there (0.85–0.92 s against 0.47 s; 2.1 s for Svelte). ns-octane: 2.1 s to
its settled first screen against 0.8 s, 51 MB against 20 MB, 2.0 s of CPU
against 0.78 s. Most of the native build's CPU is the system's: on the
simulator, loading UIKit and what its text input and SF Symbols pull in
(746 images for ns-octane, 1,236 for its NativeScript build); the app's own
code takes a few milliseconds. `launch.py` turns the simulator's
accessibility off first: with it on, each app also loads the accessibility
bundles, which cost ns-octane's native build 2.3 s of CPU and 29 MB of
footprint and its NativeScript build 1.3 s and 4 MB, and hid the difference.

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
  `kit/Sources/NativeScriptKit/CoreAPI.swift`. Core's imperative UI API
  works from script as core runs it: `view.animate()`, `createAnimation()`
  and `new Animation(definitions, sequential).play()`/`cancel()` (definitions
  read as script objects, the promise settled as core's iOS animations
  settle it: fulfilled when the property animations finish, rejected with
  `Animation is already playing.`, never settled once cancelled),
  `TouchManager.enableGlobalTapAnimations`/`animations` and a view's
  `touchAnimation`/`ignoreTouchAnimation`, RootLayout's
  `open`/`close`/`closeAll`/`topmost` with its shade cover and
  `getRootLayout()`, `Frame.topmost().navigate({ create })`, and
  `view.showModal(view, options)`/`closeModal(result)`.
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
- **Direct Android calls.** `new android.content.Intent(android.content.Intent.ACTION_SEND)`,
  `paint.setStrokeWidth(4)`, `android.view.View.VISIBLE`: typed by
  `@nativescript/types-android`, with signatures read from the class files
  (android.jar, core's widgets AAR, androidx AARs; `compiler/src/natives/classfiles.ts`).
  Overloads resolve by argument types, numbers convert to the int, float or
  long Java takes and back, JS arrays to Java arrays, interfaces implement
  from object literals (`new android.view.View.OnClickListener({ onClick… })`),
  and `@NativeClass()` classes extending Java classes override with Java's
  signatures (`compiler/src/native-calls-android.ts`). `Utils.android`,
  `Utils.layout` and `Application.android` are in kit-android's `CoreAPI.kt`,
  and `x.android.ts`/`x.ios.ts` resolve as `./x` for their platform.

## Plugins

A plugin is compiled from its TypeScript source with the app, as one
program, and its iOS code is linked as the plugin ships it. ns-octane (a copy
of `NathanWalker/ns-octane` with `@nativescript-community/ui-drawer`,
`@nativescript-community/gesturehandler`, `@nstudio/nativescript-menu`,
`@nativescript/input-accessory`, `@nstudio/nstreamdown` and
`@nativescript/haptics`) builds this way: ten screens through the drawer,
a chat, a streamed reply, a context menu and the settings sheet match its
NativeScript Release build pixel for pixel, in a 1.9 MB app against 46.7 MB
(`results/ns-octane.json`).

- **Source.** `compiler/src/plugins/source.ts` finds the commit a published
  version was built from (the `gitHead` npm recorded, else the version's tag,
  else the commit that set the version), clones it once into
  `~/.cache/ns-native/plugins/<package>@<version>`, maps each published
  JavaScript file to its TypeScript through the package's source maps, and
  checks the source by transpiling it and comparing the result with the
  published JavaScript (formatting, emit helpers and the `@NativeClass`
  lowering aside). A package whose source cannot be found or does not match
  stops the build. `nativeReleaseOptions.pluginSources` in
  `nativescript.config.ts` names another repository or a local folder.
- **Patches.** `patches/native-release/<package>+<version>.patch` in the app
  applies to the plugin's source, as patch-package's patches apply to its
  JavaScript; ns-octane's input-accessory patch is ported this way.
- **Core patches.** The NativeScript build runs `@nativescript/core` as the
  app's patch-package patch leaves it (`patches/@nativescript+core+<version>.patch`),
  so the native build does too: `compiler/src/core-patches.ts` turns each hunk
  it recognizes into one of the kit's `CorePatches` switches (ns-octane's:
  opaque box-shadow colors, insertion below the native view at an index,
  clamped scroll offsets, gradient stops positioned as CSS positions them),
  and a hunk that changes iOS behavior in any other way stops the build.
  Android builds do not read the patch yet.
- **Reachability** (`compiler/src/reach.ts`): only the modules and members
  the app reaches are translated, with the platform's constants folded, so
  Android branches and `install(true)`'s override of core's gesture
  recognition drop out; imports keep their evaluation order.
- **Core extension** (`compiler/src/patterns.ts`, `properties.ts`):
  `new Property({...})`/`CssProperty` registered on any class (core's
  `View` included) are properties by name, with `[prop.setNative]` replayed
  when a view sets up; `applyMixins(View, [Extended])` becomes an extension
  of the kit class and hooks into every view's native setup; a property a
  plugin adds to a native object (`nativeView.nsView`) is kept with it. Any
  other change to core's prototypes stops the build with the file and line.
- **Untyped code.** Plugins are written for JavaScript's semantics without
  `strictNullChecks`: their object parameters are implicitly unwrapped
  optionals, objects held untyped (`node = {}; node[key] = …`) are
  extensible `JSObject`s, their methods are reachable by name from untyped
  callers, native enums read untyped as numbers, and `NSDictionary`/`NSArray`
  answer `count`, `allKeys`, `objectAtIndex` and `valueForKey` as the runtime
  marshals them.
- **Native code** (`compiler/src/plugins/native.ts`): `platforms/ios` is
  copied unchanged into `Plugins/` of the generated project. Objective-C and C
  are targets of a local Swift package (the module its `module.modulemap`
  declares, else `NSPlugin_<package>`), Swift is a static library target of
  the project, and an `.xcframework` is a binary target. Each module gets a
  symbol table as the SDK's frameworks do, so
  `GestureHandlerManager.alloc().init()` resolves to its Swift spelling, and
  the package's typings resolve to the module whose classes they declare.
  Plugin Swift is compiled with the app's settings, dead code elimination
  included.
- **Octane's driver**: `registerElement` tags resolve to their classes at
  compile time, `hostSlot` children set the slot property, `ref`s,
  `onLoaded`, `renderNativeScriptApp`, `setWindowContentResolver` and
  `useSyncExternalStore` compile; a function given to a plugin view's
  property (`translationFunction={fn}`) is a script function to it.

## CSS

The CSS a native build compiles in is the CSS the app's NativeScript build
ships. `compiler/src/css-worker.ts` runs in a process of its own, started as
the NativeScript CLI starts the bundler (the project as cwd, the CLI's env
flags and `NATIVESCRIPT_BUNDLER_ENV`), and puts each stylesheet through the
app's own pipeline: for a webpack app, the app's `webpack.config.js` is
resolved and the stylesheet's loaders, matched by webpack's rule compiler,
run through `css2json-loader` (`postcss-loader` with the app's PostCSS
options and config, `@nativescript/tailwind` when it autoloads); for a vite
app, its vite config is resolved for a production build and app.css takes
`@nativescript/vite`'s steps (the platform `@import` rewrite, Vite's
`preprocessCSS`, rework-css's parse). The result is the rework-css AST core
reads, in the order core adds the sheets (app.css, then stylesheets modules
import); the kit gets the rulesets, `@media` and `@keyframes` core keeps
from it (`compiler/src/css.ts`).

`node tools/css_exact.ts <app> <NativeScript .app>` compares that AST with
every stylesheet AST in the NativeScript build's bundle, as data and as CSS
text with whitespace normalized. For the six Recipes apps, the six gallery
apps, native-calls-vue and ns-octane (Tailwind v4 over `@nativescript/vite`)
the compiler's CSS is identical to the bundle's.

Tailwind v4 output works as NativeScript runs it: theme variables on
`.ns-root, .ns-modal`, `calc(var(--spacing) * n)`, `*` variables set to
`initial`, `color-mix()` evaluated as core's `@csstools/css-color-parser`
does (`kit/Sources/NativeScriptKit/ColorMix.swift`; `node
tests/color-mix/run.ts` checks 3,000 random expressions against it), and
`.ns-dark` overrides. gallery-vue's Tailwind screen takes its utilities from
`app/tailwind.css` through the chain `@nativescript/tailwind` autoloads
(`postcss.config.js`), so app.css keeps the `@media` rules other screens
test.

## Binding order

Each binding is an effect, and the effects a write invalidates re-run in the
order the app's framework commits its bindings (`EffectOrder` in
`kit/Sources/NativeScriptKit/Signals.swift`, emitted by
`compiler/src/codegen.ts`). The order shows when one value drives both a
label's class and a span's color: the label's color, set after the span's,
covers it. Each gallery app's Update order screen binds both.

| Framework | Order, from its source |
| --- | --- |
| Vue 3.5 | Post-order: `patchElement` patches a block's dynamic children before the element's props, and a block's dynamic children are collected post-order (`normalizeChildren` renders the slot before `createBaseVNode` pushes the parent); `mountElement` mounts children, then props, then inserts. Components re-render after the component that created them (`queueJob` sorted by uid), a child with changed props inline. Flushed on a microtask. |
| Angular 22 | Pre-order: a template's update block runs in slot order (`ɵɵclassMap`, `ɵɵproperty` after `ɵɵadvance`); `refreshView` then refreshes embedded views (`@if`, `@for`) and child components after the view's own bindings. Elements are appended as they are created (`elementLikeStartShared`), before any binding. Zoneless, a tick after a write. |
| Svelte 4 | Post-order: the compiler's `ElementWrapper` renders children before `add_attributes`, so `p()` sets descendants first; child components update after their parent (`flush` walks `dirty_components`). `m()` inserts a block top-down after `c()` made it. Flushed on a microtask. |
| React 18 | Post-order: `commitMutationEffects` traverses a host's children before `commitUpdate` on it; `completeWork` appends children before `finalizeInitialChildren`. Each `setState` commits synchronously in react-nativescript's legacy root. |
| Solid 2 | Pre-order within a template, whose one effect applies its props after the template's views, components and control flow exist; across templates by owner depth, then creation (`@solidjs/signals`' heap). Flushed on a microtask. |
| Octane 0.8 | Pre-order over the whole tree (`walkDraft` collects creates and updates), synchronously at the end of an event. |

## Differential tests

`node tests/diff/run.ts` runs every case in `tests/diff/cases/` under Node,
translated to Swift as a macOS program linking the kit's runtime, and
translated to Kotlin on the JVM with kit-android's runtime, and compares
their output byte for byte (17 of 17 match for each): values and formatting, arrays, classes, closures,
errors, promise ordering, async control flow, collections, JSON, modules,
types, regular expressions and dates, interfaces, idioms.

## Android

`--platform android` writes Kotlin from the same type-checked program and a
Gradle project that links `kit-android`: the same signals and regions, a
Kotlin runtime with JavaScript's semantics (`kit-android/.../runtime/`, the
counterpart of the Swift one: arrays, maps and sets, promises and microtasks
on the main looper, async functions through the same continuation lowering,
JSON, RegExp with its own engine, Date, console formatting as V8 and Node do
them), and `@nativescript/core`'s Android view layer ported to Kotlin over
core's own `org.nativescript.widgets` AAR, so layout is core's Java code:
properties applied at load in core's order, the CSS engine (selectors,
`@media`, `var()`, `calc()`, `@keyframes`, root classes with live light/dark),
borders, gradients, box shadows, clip paths and `color-mix()`, every
layout, ListView, TextView, gestures with core's event data, animations,
modals, TabView, the pickers and the other controls gallery-vue shows, core's
imperative API (`view.animate()`, `Animation`, TouchManager, RootLayout's
`open`/`close`, `Frame.navigate` and `showModal` from script), and each
framework's update order (`EffectOrder` in `Signals.kt`, the same keys
`codegen-kotlin.ts` emits as `codegen.ts`). Every comparison is
against that framework's own NativeScript Android Release build, on a
Pixel 9 emulator (API 36), below the status bar.

| | Vue | Angular | Svelte | React | Solid | Octane |
| --- | --- | --- | --- | --- | --- | --- |
| Pixels that differ, both screens | 0 | 0 | 0 | 0 | 0 | 0 |
| Pixels that differ after the same taps | 0 | 0 | 0 | 0 | 0 | 0 |
| Release APK, NativeScript → native | 104.1 → 0.9 MB | 104.3 → 0.9 MB | 104.1 → 0.9 MB | 104.1 → 0.9 MB | 104.0 → 0.9 MB | 104.0 → 0.9 MB |

The NativeScript APKs carry `libNativeScript.so` (V8) for four ABIs,
100 MB of the 104; the native APKs have no native libraries
(`results/sizes-android.json`, `results/pixels-android.json`).

The gallery apps, against their NativeScript Release builds on the same
emulator (`tools/gallery-android.py`, `gallery-android.json` in each app):
gallery-vue's 40 screens in 171 shots, 169 of them 0 pixels apart; the
other two are the pan shots (see Limits). The ListView and Update order
screens of the other five are 0 pixels apart in all of their shots.

`native-calls-vue` on Android calls the platform from TypeScript: a
`GradientDrawable` and elevation on the card, a tinted system drawable, a
`View` subclass written in TypeScript whose `onDraw` strokes a `Path`, a
badge drawn on a `Canvas`, the title's size and typeface, and a share sheet
from `Intent.createChooser`. Against its NativeScript Release build: 0
pixels differ at launch, after two runs of the tasks, with the chooser open
and after closing it; with the chooser open, the system's share targets
can differ by a few icon pixels from one opening to the next.

Two framework behaviors the Android build reproduces: the Angular app's CSS
is the filtered CSS its build ships (see above), and React screens sit in
the FlexboxLayout `react-nativescript-navigation` puts around each screen's
content. NativeScript Android loads `sys://` images as file paths, so they
show nothing in either build.

## Run it

```sh
cd native-release/compiler && npm install
node src/cli.ts ../recipes-vue --out ../build/RecipesVue --build    # Swift in under a second, then xcodebuild
python3 tools/compare.py <udid> org.nativescript.recipes.vue org.nativescript.recipesvue.native <out dir>
node ../tests/diff/run.ts                                           # the differential tests against Node
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
| `compiler/src/program.ts` | The app and its virtual classes as one TypeScript program, typed by the ES2022 library, core's declarations and the platform's native typings, with the frameworks' APIs as type shims |
| `compiler/src/swift.ts` | TypeScript to Swift, typed by the checker, with JavaScript's semantics where Swift's differ |
| `compiler/src/async.ts`, `throws.ts`, `modules.ts` | Async functions as continuations; which functions throw; module evaluation order |
| `compiler/src/core.ts`, `kit-index.ts` | `@nativescript/core`'s API through the kit, checked against the kit's sources |
| `compiler/src/natives/symbols.ts`, `native-calls.ts` | NativeScript's names for iOS APIs to Swift, from the SDK's symbol graphs; their translation |
| `compiler/src/platform.ts` | `isIOS`/`isAndroid`/`__IOS__`/`__ANDROID__` folded for the target before type-checking |
| `compiler/src/plugins/` | Plugins: their source found, checked and patched (`source.ts`), their iOS code as targets and symbol tables (`native.ts`) |
| `compiler/src/core-patches.ts` | An app's patch of `@nativescript/core` as the kit's `CorePatches` switches |
| `compiler/src/reach.ts`, `patterns.ts`, `properties.ts` | What of a plugin the app reaches; the patterns by which plugins extend core; properties registered by name |
| `compiler/src/codegen.ts` | A template as `render()`: views made once, one effect per binding, keyed regions for `if`/`for` |
| `compiler/src/kotlin.ts`, `kotlin-modules.ts`, `codegen-kotlin.ts`, `android.ts` | The Android target: TypeScript to Kotlin, `render()` in Kotlin, the Gradle project |
| `compiler/src/core-kotlin.ts`, `native-calls-android.ts`, `natives/classfiles.ts` | `@nativescript/core`'s API through kit-android; direct Android calls, typed from the class files |
| `compiler/src/css.ts`, `css-worker.ts` | The CSS the app's NativeScript build ships, through its own bundler's pipeline, for both targets |
| `kit/Sources/NativeScriptKit/` | The views, layout, CSS and navigation ported from `@nativescript/core`; `Signals.swift`, `Regions.swift`, `JS.swift`, `Router.swift`, `CoreAPI.swift` |
| `kit/Sources/NativeScriptKit/Runtime/` | JavaScript's values, arrays, maps, sets, errors, promises and microtasks, timers, JSON, RegExp, Date and console formatting (Foundation only) |
| `kit-android/` | NativeScriptKit for Android: core's Android views, styling, CSS engine, gestures, animations and modals in Kotlin on the widgets AAR; `Signals.kt`, `Regions.kt`, `JS.kt`, `Router.kt`, `CoreAPI.kt` |
| `kit-android/.../runtime/` | JavaScript's values, arrays, maps, sets, errors, promises and microtasks, timers, JSON, RegExp, Date and console formatting in Kotlin |
| `gallery-vue/`, `gallery-<framework>/` | Gallery apps: a screen per feature (gallery-vue) or the ListView screen (the other five), each shot compared with its NativeScript Release build by `tools/gallery.py` (`gallery.json`) and `tools/gallery-android.py` (`gallery-android.json`) |
| `native-calls-vue/` | A Vue app calling UIKit, and on Android the Android SDK, directly; compared by `tools/native_calls.py` and `tools/gallery-android.py` |
| `tests/diff/` | Differential tests: each case under Node and as a native program |
| `tests/color-mix/` | The kit's `color-mix()` against core's color parser |
| `tools/` | `compare.py`, `interact.py`, `gallery.py`, `native_calls.py`, `launch.py`, `css_exact.ts`, `sizes.py`, and `demo/` for the video; `compare-android.py`, `interact-android.py`, `gallery-android.py`, `sizes-android.py` |

## Limits

- **The subset.** The elements in `compiler/src/elements.ts`, their
  properties and events, the CSS NativeScript supports (combinators,
  attribute and pseudo-class selectors, `@media`, `@keyframes`, `var()`,
  `calc()`), the TypeScript above, the core APIs the kit has, and iOS APIs
  available on iOS 17. Anything else stops the build with the file, line and
  construct. Not yet: generators, `Symbol`, `WeakMap`, getters on object
  literals, `toLocale*String`, and constructors in classes that extend
  Objective-C classes (NativeScript creates those with `new()`). Bindings
  re-run in each framework's order but as each write happens, not batched
  on the framework's microtask or tick.
- **Where Swift differs, by design.** Closures have no identity; JSON
  cannot hold lone surrogates.
- **Android:** `Base.extend({…})`, Java varargs and `Array.create` are not
  translated; a Java array a method fills in is a copy. Core's pan starts
  from a recycled MotionEvent, whatever event it holds by then, so a pan's
  deltas vary from run to run in the NativeScript build itself.
- **Plugins** compile from their source (see Plugins above). Not yet:
  CocoaPods and Gradle dependencies, `.framework`s and static libraries
  (an `.xcframework` is fine), resource bundles, Info.plist merges and
  entitlements, plugin hooks, and changes to core's prototypes other than
  the recognized patterns. Plugins are compiled for iOS only: an Android
  build of an app that imports one stops at that import.
- **Not ported yet:** `background-image: url()`, `direction: rtl`, inset box
  shadows, Span `verticalAlignment`, `font://` icons, and DatePicker dates given
  as Date values.
