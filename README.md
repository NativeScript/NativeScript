# Native release builds

Develop a NativeScript app the way web developers do, with Vue (`<script
setup>` or the Options API), Angular (standalone with signals, or NgModules
with zone.js), Svelte 4 or 5, React, Solid or Octane on `@nativescript/core`,
and ship the release as
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
| Device archive, NativeScript → native | 44.8 → 1.3 MB | 45.6 → 1.3 MB | 44.8 → 1.3 MB | 44.9 → 1.3 MB | 44.6 → 1.3 MB | 44.6 → 1.3 MB |

\* The Angular app depends on `@nativescript/tailwind`, whose PostCSS pass
(autoloaded by `@nativescript/webpack`) drops declarations outside its
supported list, `tint-color`, `vertical-alignment` and
`horizontal-alignment` among them: its NativeScript build ships CSS without
them, so its symbol images are not tinted and its rows sit
differently from the other five apps'. Both native builds style the app with
that same CSS, the CSS its NativeScript build ships (see CSS below).

The same app in three more styles, each against its own NativeScript Release
build on the same simulator, with the same taps, then the search field
focused (both apps still running):

| | Svelte 5 (runes) | Vue (Options API) | Angular (NgModule, zone.js) |
| --- | --- | --- | --- |
| App | `recipes-svelte5` | `recipes-vue-options` | `recipes-angular-ngmodule` |
| Pixels that differ, both screens | 0 | 0 | 0* |
| Pixels that differ after the same taps | 0 | 0 | 0* |
| Update order screen (`gallery-<style>`), 4 shots | 0 | 0 | 0 |
| Android | compiles, Gradle release build | compiles, Gradle release build | compiles, Gradle release build |

\* With the Angular app's Tailwind-filtered CSS, as above. Android pixels
were not compared (no emulator of this run's own). The figures are in
`results/styles.json`.

- **Svelte 5** (`compiler/src/svelte5.ts`), parsed by the app's own
  `svelte/compiler`: `$state` is a ref (deep, `Object.is`, as a `$state`
  proxy is), `$derived`/`$derived.by` getters, `$props()` destructured with
  its type, `$effect` an effect that runs after the template effects a
  write invalidates, snippets rendered in place with their parameters bound
  to the expressions `{@render}` passes, event attributes (`ontap`), keyed
  `{#each}`, and a `.svelte.ts` module's `$state`/`$derived` class fields
  as Svelte compiles them (a ref behind an accessor pair). The integration
  is `@nativescript-community/svelte-native` 5.0.0-alpha.0, the only one for
  Svelte 5; it needs the custom-renderer build of Svelte (PR 18042), and
  only that PR's build `20bd0cf` (5.55.2) still has the `render()` it calls,
  so the app pins it. Two things the app works around, both upstream: Svelte
  5's renderer sets `checked` as an HTML boolean attribute (`''`, or removed
  as `null`), which core's Switch rejects (`booleanConverter` throws) and
  which stops the page's updates, so the app binds `ios:checked` and
  `android:checked` (svelte-native's platform prefixes) and the release
  build stops at a plain `checked={…}`; and `@nativescript/webpack` compiles
  `.svelte.ts` runes only with a `svelte-loader` rule the app adds.
- **Vue's Options API** (`vue.ts`): `props` (typed by `PropType<T>`,
  `String`, `Number`, `Boolean`), `emits` (an array, or validators that type
  the payload), `data()` as refs that `this.x` reads by value, `computed`
  getters, `methods`, `watch` (with `immediate`) run before their
  component's bindings as Vue's pre-flush jobs are, `this.$emit` and
  `this.$navigateTo`, and `defineComponent({ setup(props, { emit }) { …;
  return { … } } })`, whose statements are read as `<script setup>`'s.
- **Angular with NgModules and zone.js** (`angular.ts`): `@Input()` (with or
  without a default) and `@Output() … = new EventEmitter<T>()` read as
  `input()` and `output()`, constructor parameter properties as `inject()`,
  `ngOnInit`, `*ngIf` (with `else` and `as`), `*ngFor` (with `trackBy`,
  `index`, `even`, `odd`), `<ng-container>`, plain fields and getters, and
  the `async` pipe; the NgModules themselves only declare. With zone.js
  (`provideZoneChangeDetection`), every binding is a check (`Check` in
  `kit/Sources/NativeScriptKit/ChangeDetection.swift`): after each task (an
  event handler, a timer callback) and the promise jobs it queued, the kit
  re-reads every live binding in the order `ApplicationRef.tick()` refreshes
  views and applies those whose value is no longer `Object.is` the last one
  applied, so state in plain fields, services and mutated arrays shows as
  Angular shows it; `*ngFor` rows are kept by identity or `trackBy`. Angular
  22 checks components OnPush unless they say otherwise; a zone app compiles
  only `ChangeDetectionStrategy.Default` (`Eager`) components so far.
- **RxJS**: `BehaviorSubject`, `Subject`, `Observable`, `asObservable`,
  `pipe(map(…))`, `subscribe` and the `async` pipe are the kit's
  `Rx`-prefixed classes (`Rx.swift`, `Rx.kt`; core has an `Observable` of its own), with RxJS 7's synchronous
  semantics: a BehaviorSubject replays its value to a new subscriber,
  `next` reaches the subscribers of the moment in order, `map` counts its
  index per subscription. RxJS is not compiled from its source: reaching
  `Subscription.unsubscribe` brings in `createErrorClass` (function
  constructors with prototypes assigned), and `Symbol.observable` interop,
  which the translator stops at by design. Any other RxJS import stops the
  build at type-checking.

The device archive is the unsigned arm64 app as `xcodebuild archive` makes
it (`tools/sizes.py`, `results/sizes.json`), with the app's `App_Resources`
(the asset catalog with its icons and launch images is 112 kB of it). The generated project builds
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
simulator: gallery-vue's 41 screens (layouts, ListView, TextView, gestures,
transforms, animations, spans, pickers, CSS selectors and variables,
borders, backgrounds, modals, TabView, Tailwind v4, the update order,
batching, and core's imperative API: `view.animate()`, `Animation`,
TouchManager, RootLayout's `open`/`close`, `Frame.navigate` and `showModal`
from script) are 0 pixels apart in all 174 shots; the ListView, Update order
and Batching screens of the other five are 0 pixels apart in all of their shots
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

### On a device

Recipes (Vue) and ns-octane on an iPhone 16 Pro (iOS 26.6.2), both builds
signed for development and installed, five interleaved cold launches each
(`tools/device.py`, `results/device-ios.json`; medians):

| | Recipes NS → native | ns-octane NS → native |
| --- | --- | --- |
| First frame, from SpringBoard's bootstrap | 227 → 129 ms | 241 → 156 ms |
| Settled screen | 732 → 742 ms | 740 → 731 ms |
| Footprint after launch | 45.1 → 15.6 MB | 61.7 → 18.2 MB |
| CPU, launch to 7 s | 0.50 → 0.41 s | 0.53 → 0.44 s |
| `.ipa` | 14.0 → 0.45 MB | 14.4 → 0.96 MB |
| Installed | 45.9 → 1.1 MB | 46.9 → 2.2 MB |
| Pixels that differ, launch screen | 0 | 0 |

Both builds' screens are settled when iOS's 0.7 s launch zoom ends, so the
settled times are the zoom's. The first frame and the times come from
SpringBoard's log on the device's clock, footprint and CPU from sysmontap
over DVT, sizes from the phone's installation service. Screens behind a tap
need `--taps-by-hand`: nothing outside an app can tap a phone without an
XCUITest runner, an app ID of its own.

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
  JavaScript's (`**`, ToInt32 on doubles, the comma operator, `typeof` on a
  name only declared). `JSON`, `RegExp` (over NSRegularExpression), `Date`,
  `Math`, string methods in UTF-16 units and `console.log`'s formatting are in
  `kit/Sources/NativeScriptKit/Runtime/`. Reading a member of undefined or
  null throws a TypeError a `catch` takes, where the types let the read
  through (`items[i].name` past the end, `x!.name`, an untyped value). Labeled
  blocks, a `default` clause before cases, tagged templates and `String.raw`,
  and `BigInt` (`JSBigInt`) are JavaScript's.
- **Objects.** Getters and setters in object literals (`this` is the object),
  computed keys, `Object.defineProperty` with property attributes,
  `getOwnPropertyNames`/`getOwnPropertyDescriptor`, `freeze`/`seal`/
  `preventExtensions` (writes to a frozen object throw in strict code),
  `fromEntries`, `is`. An object literal held untyped is a `JSObject`, which
  takes any key; its methods see it as `this`.
- **Symbols and weak collections.** `Symbol()` is `JSSymbol`, unique, with
  its `description`, `Symbol.for`/`keyFor`, as a property key (left out of
  `Object.keys` and JSON, printed after the other keys) and a member name.
  `Symbol.iterator`, `asyncIterator`, `toPrimitive` (the hint each conversion
  passes) and `toStringTag` work on classes. `WeakMap`, `WeakSet` and `WeakRef`
  hold their keys weakly, by identity.
- **Iteration.** Generators and async generators compile to continuations
  as async functions do (`compiler/src/async.ts`): the body suspends at each
  `yield`, `next(v)`, `return(v)` and `throw(e)` resume it through its catch
  and finally blocks, `yield*` delegates, and async generators queue requests
  and settle them tick for tick as ECMA-262 says. `for…of`, spread and
  destructuring step a generator or a class's `[Symbol.iterator]` through the
  iterator protocol, closing it when a loop leaves early; `for await` takes
  async iterables and sync ones whose values it awaits
  (`kit/Sources/NativeScriptKit/Runtime/Iterators.swift`).
- **Locale formatting.** `toLocaleString`, `toLocaleDateString`,
  `toLocaleTimeString`, `Intl.NumberFormat` and `Intl.DateTimeFormat`
  (`Runtime/Intl.swift`, `Intl.kt`): for en-US, from CLDR's en data as ICU
  applies it, so every platform prints what Node prints (rounding half away
  from zero on the shortest decimal, grouping, percent, currency, compact,
  scientific, sign display; date and time styles, component options, 12- and
  24-hour clocks, time zones and their names). Another locale goes to the
  platform's ICU: Foundation's `NumberFormatter`/`DateFormatter` on iOS,
  `java.text` on Android (ICU-backed there), with the same options; its
  output is the platform's CLDR version's, which can differ from Node's.
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
NativeScript Release build pixel for pixel, in a 2.5 MB app against 46.7 MB, its
three Font Awesome fonts 0.4 MB of it (`results/ns-octane.json`,
`results/sizes.json`).

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
| Vue 3.5 | Post-order: `patchElement` patches a block's dynamic children before the element's props, and a block's dynamic children are collected post-order (`normalizeChildren` renders the slot before `createBaseVNode` pushes the parent); `mountElement` mounts children, then props, then inserts. Components re-render after the component that created them (`queueJob` sorted by uid), a child with changed props inline. |
| Angular 22 | Pre-order: a template's update block runs in slot order (`ɵɵclassMap`, `ɵɵproperty` after `ɵɵadvance`); `refreshView` then refreshes embedded views (`@if`, `@for`) and child components after the view's own bindings. Elements are appended as they are created (`elementLikeStartShared`), before any binding. |
| Svelte 4 | Post-order: the compiler's `ElementWrapper` renders children before `add_attributes`, so `p()` sets descendants first; child components update after their parent (`flush` walks `dirty_components`). `m()` inserts a block top-down after `c()` made it. |
| React 18 | Post-order: `commitMutationEffects` traverses a host's children before `commitUpdate` on it; `completeWork` appends children before `finalizeInitialChildren`. |
| Solid 2 | Pre-order within a template, whose one effect applies its props after the template's views, components and control flow exist; across templates by owner depth, then creation (`@solidjs/signals`' heap). |
| Octane 0.8 | Pre-order over the whole tree (`walkDraft` collects creates and updates). |
| Svelte 5 | Creation order, nested: a template's static attributes are set as `from_tree` makes its views; its `{#if}`/`{#each}` blocks and child components render next, then one `template_effect` sets its dynamic attributes in template order, then `$.event` adds its listeners. Updates walk the effect tree depth-first (`#traverse_effect_tree`), so a block's and a child component's effects run before the template effect of the component that holds them; `$effect`s run after every template effect. |
| Vue Options API | As Vue 3.5 above: the same renderer and scheduler; a `watch` is a pre-flush job, before its component's re-render. |
| Angular 22 with zone.js | As Angular above, re-read on every check: after each task `ApplicationRef.tick()` refreshes every Eager view, applying only bindings whose value changed (`bindingUpdated`). |

The effects re-run when the framework updates (`Reactivity.schedule`, set at
launch for the app's framework): the writes of a handler cause one update,
after the last of them, so a value the handler passes through never reaches a
view. Before the update a handler reads what the framework gives it. A
property change announces `<name>Change` on its view, as core's properties do.
Each gallery app's Batching screen writes one value three times in a tap and
shows, from the native label, every change of its text, what the handler read
right after the writes and what it read after the framework's `nextTick()`,
`tick()`, a microtask or a timer.

| Framework | When it updates, from its source | Read in a handler before that |
| --- | --- | --- |
| Vue 3.5 | In a microtask the first write queues (`queueFlush`: `resolvedPromise.then(flushJobs)`); `nextTick()` returns that promise | The new value; `computed` is pulled, so fresh |
| Angular 22 | In a task: zoneless `ChangeDetectionSchedulerImpl.notify` races `setTimeout` against `requestAnimationFrame` (`scheduleCallbackWithRafRace`) and on NativeScript the timer comes first; every template listener schedules one (`markViewDirty`); in the microtask checkpoint after an update, a microtask (`switchToMicrotaskScheduler`) | The new value; `computed` is fresh |
| Svelte 4 | In a microtask (`schedule_update`: `resolved_promise.then(flush)`); `tick()` schedules one and returns the settled promise | The new value; a `$:` declaration is recomputed by the update (`$$.update()`), so the old one |
| React 18 | At once: react-nativescript renders a `LegacyRoot` and listens with `view.on`, outside `batchedUpdates`, so each `setState` commits (`scheduleUpdateOnFiber`, `flushSyncCallbacksOnlyInLegacyMode`) | The state of the render that made the handler, until it returns |
| Solid 2 | In a microtask (`schedule`: `queueMicrotask(flush)`) | The last flushed value, outside a computation (`read`); a memo's too |
| Octane 0.8 | When the handler returns: the driver runs each listener in a discrete `eventScope`, which flushes as it ends; a write outside an event, in a microtask (`queueScheduledWork`) | The state of the render that made the handler |
| Svelte 5 | In a microtask (`schedule_effect` queues the root effects' flush with `queue_micro_task`) | The new value; `$derived` is pulled, so fresh |
| Vue Options API | As Vue 3.5 | As Vue 3.5 |
| Angular 22 with zone.js | After each task: the zone's `onMicrotaskEmpty` runs `ApplicationRef.tick()` once a handler, timer or promise job and the microtasks it queued are done; the bindings are checks re-read then | The new value |

## Differential tests

`node tests/diff/run.ts` runs every case in `tests/diff/cases/` under Node,
translated to Swift as a macOS program linking the kit's runtime, and
translated to Kotlin on the JVM with kit-android's runtime, and compares
their output byte for byte (26 of 26 match for each): values and formatting, arrays, classes, closures,
errors, promise ordering, async control flow, collections, JSON, modules,
types, regular expressions and dates, interfaces, idioms, operators and
statements at their edges, symbols and weak collections, the object model,
generators and iterators, async iteration, TypeErrors from undefined reads,
locale formatting (two cases), BigInt.

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

## The generated projects

The Xcode project (xcodegen's `project.yml`) and the Gradle project carry the
app's `App_Resources` and settings as the NativeScript CLI carries them into
`platforms/ios` and `platforms/android` (`compiler/src/app-resources.ts`).

- **iOS.** `Info.plist` is merged by the CLI's rules (`plist.ts`): each
  production plugin's `platforms/ios/Info.plist`, then the app's, then
  `CFBundleIdentifier` from the build setting; Xcode adds its build keys as it
  does for the NativeScript build, and the version and build number are the
  app's `Info.plist`'s. `app.entitlements` (the plugins', then the app's) is
  `CODE_SIGN_ENTITLEMENTS` unless `build.xcconfig` sets it. `build.xcconfig`,
  the app's first and each plugin's after it (a key already set wins unless
  it inherits), is the app target's configuration file. The rest of
  `App_Resources/iOS` (`Assets.xcassets` with the app icon and launch images,
  `LaunchScreen.storyboard`, `PrivacyInfo.xcprivacy`, `.lproj`s and folders)
  are resources of the app, and the app folder's `fonts` are copied into the
  bundle and registered before the first font is resolved, as core registers
  them. Against the NativeScript builds' `Info.plist` (`plutil -p`),
  ns-octane's and the Recipes apps' differ only in the bundle id the
  comparisons give the native build and, for the Recipes apps, in
  `MinimumOSVersion`: their `build.xcconfig` asks for iOS 16, the kit needs
  17, and the build says so as it raises it.
- **Android.** `App_Resources/Android/src/main/AndroidManifest.xml` is the
  app's manifest, with the CLI's `__PACKAGE__` substitution, the runtime's
  `NativeScriptActivity` as the app's `MainActivity`, and the runtime's
  application class and error activity left out; the production plugins'
  manifests go through Gradle's manifest merger with it.
  `before-plugins.gradle` and `app.gradle` are applied as the runtime's
  `build.gradle` applies them, so `versionCode`, `versionName`, the SDK levels
  and the rest of `defaultConfig` are the app's. `res/`, `java/` and `assets/`
  are source directories, and the app folder's `fonts` are assets at
  `app/fonts`, where the kit loads a font family from as core does. Against
  the NativeScript APK (`apkanalyzer manifest print`, `aapt2 dump badging`),
  recipes-vue's manifest differs in the package, the runtime's application
  class, error activity and native libraries, and `READ_PHONE_STATE`, which
  the manifest merger implies for the resource library the CLI builds from
  core's `platforms/android` without a target SDK.
- **Source lines.** Every translated statement carries the line it was
  written on. In Swift it is a `#sourceLocation(file:line:)` directive, so
  crash reports, `fatalError`, Instruments and Xcode's debugger show the
  `.ts`, `.vue`, `.tsx` or `.svelte` file and line. Kotlin has no such
  directive: the build writes `source-lines.json` beside the Gradle project,
  and `node compiler/src/retrace.ts <project> <trace>` maps a stack trace with
  it, after R8's retrace has undone the release build's renaming with its
  `mapping.txt`. A component's virtual class is matched to its source file
  (`compiler/src/source-lines.ts`): script code by the identifiers and
  literals it shares with the line it came from, a template binding by its
  expression. Errors that JavaScript code can catch (on Android, a member of
  `undefined` read) are reported with their JVM frames as `error.stack`.
  `--no-source-lines` leaves the lines out.
- **Device builds.** `--build --device` archives for any iOS device
  (`xcodebuild archive`, the size settings below) and writes the `.ipa`:
  unsigned without signing arguments, or signed manually with
  `--provision <profile>` (a `.mobileprovision`, or the UUID or name of an
  installed one; the export method follows the profile), or signed
  automatically for a team with `--team-id <team>`, which lets Xcode create
  profiles and register the app id on that team, as `ns build --for-device`
  does (`--export-method`, `debugging` by default). On Android, `--build` writes the release APK and, with `--aab` or
  `--device`, the bundle, signed with `--key-store-path`,
  `--key-store-password`, `--key-store-alias` and `--key-store-alias-password`
  when they are given and with the debug key otherwise.

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
adb logcat -d -s System.err AndroidRuntime | node src/retrace.ts ../build/android-vue    # a stack trace in source lines
```

```sh
node src/cli.ts ../recipes-vue --out ../build/RecipesVue --build --device [--provision <profile>]    # archive and .ipa
node src/cli.ts ../recipes-vue --platform android --out ../build/android-vue --build --aab \
  --key-store-path release.keystore --key-store-password … --key-store-alias … --key-store-alias-password …
```

Each `recipes-*` folder is an ordinary NativeScript project: `ns run ios`
develops it with live reload as usual.

## What is where

| Path | What it is |
| --- | --- |
| `compiler/src/vue.ts`, `angular.ts`, `svelte.ts`, `svelte5.ts`, `react.ts`, `solid.ts`, `octane.ts` | Front ends: a component as a virtual class (state as signals, derived values as getters, one method per template expression) and a template tree |
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
| `compiler/src/app-resources.ts`, `plist.ts`, `ios-signing.ts` | `App_Resources` and project settings in the generated projects (Info.plist, entitlements, xcconfig, resources, fonts; the manifest, `app.gradle`); device archives and their signing |
| `compiler/src/source-lines.ts`, `retrace.ts` | Each statement's source line: Swift `#sourceLocation`, Kotlin's line table and the retrace tool |
| `compiler/src/css.ts`, `css-worker.ts` | The CSS the app's NativeScript build ships, through its own bundler's pipeline, for both targets |
| `kit/Sources/NativeScriptKit/` | The views, layout, CSS and navigation ported from `@nativescript/core`; `Signals.swift`, `Regions.swift`, `JS.swift`, `Router.swift`, `CoreAPI.swift` |
| `kit/Sources/NativeScriptKit/ChangeDetection.swift`, `Rx.swift` | zone.js change detection (`Zone`, `Check`), Vue's `Watch`, Svelte's `$effect` order; the RxJS subset |
| `kit/Sources/NativeScriptKit/Runtime/` | JavaScript's values, arrays, maps, sets, errors, promises and microtasks, timers, JSON, RegExp, Date and console formatting (Foundation only) |
| `kit-android/` | NativeScriptKit for Android: core's Android views, styling, CSS engine, gestures, animations and modals in Kotlin on the widgets AAR; `Signals.kt`, `Regions.kt`, `JS.kt`, `Router.kt`, `CoreAPI.kt` |
| `kit-android/.../runtime/` | JavaScript's values, arrays, maps, sets, errors, promises and microtasks, timers, JSON, RegExp, Date and console formatting in Kotlin |
| `gallery-vue/`, `gallery-<framework>/` | Gallery apps: a screen per feature (gallery-vue), the ListView, Update order and Batching screens (the other five), or the Update order screen (`gallery-svelte5`, `gallery-vue-options`, `gallery-angular-ngmodule`), each shot compared with its NativeScript Release build by `tools/gallery.py` (`gallery.json`) and `tools/gallery-android.py` (`gallery-android.json`) |
| `native-calls-vue/` | A Vue app calling UIKit, and on Android the Android SDK, directly; compared by `tools/native_calls.py` and `tools/gallery-android.py` |
| `tests/diff/` | Differential tests: each case under Node and as a native program |
| `tests/color-mix/` | The kit's `color-mix()` against core's color parser |
| `tools/` | `compare.py`, `interact.py`, `gallery.py`, `native_calls.py`, `launch.py`, `css_exact.ts`, `sizes.py`, `device.py` (a physical iPhone), and `demo/` for the video; `compare-android.py`, `interact-android.py`, `gallery-android.py`, `sizes-android.py` |

## Limits

- **The subset.** The elements in `compiler/src/elements.ts`, their
  properties and events, the CSS NativeScript supports (combinators,
  attribute and pseudo-class selectors, `@media`, `@keyframes`, `var()`,
  `calc()`), the TypeScript above, the core APIs the kit has, and iOS APIs
  available on iOS 17. Anything else stops the build with the file, line and
  construct. Not yet: constructors in classes that extend Objective-C
  classes (NativeScript creates those with `new()`), `nextTick(fn)` with a
  callback, `FinalizationRegistry`, other `Intl` constructors, and members
  named by a symbol other than a program's own and the four well-known ones.
  `Math.pow` with a fractional exponent can be an ulp off on Android, whose
  `pow` is not correctly rounded; integer exponents are exact. A BigInt
  added to a number through `any` is NaN rather than a TypeError, and an
  error `return()` throws while a loop closes its iterator is dropped. React and Octane handlers read the state
  of their render until they return; after an `await` their closures still
  hold it, where the native build reads the committed state.
- **Where Swift differs, by design.** Closures have no identity; JSON
  cannot hold lone surrogates.
- **Android:** `Base.extend({…})`, Java varargs and `Array.create` are not
  translated; a Java array a method fills in is a copy. Core's pan starts
  from a recycled MotionEvent, whatever event it holds by then, so a pan's
  deltas vary from run to run in the NativeScript build itself.
- **Plugins** compile from their source (see Plugins above). Not yet:
  CocoaPods and Gradle dependencies, `.framework`s and static libraries
  (an `.xcframework` is fine), resource bundles, plugin hooks, and changes to core's prototypes other than
  the recognized patterns. Plugins are compiled for iOS only: an Android
  build of an app that imports one stops at that import.
- **Not ported yet:** `background-image: url()`, `direction: rtl`, inset box
  shadows, Span `verticalAlignment`, `font://` icons, and DatePicker dates given
  as Date values.
