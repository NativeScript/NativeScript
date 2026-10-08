# The kit from core: one source of truth

The goal: NativeScriptKit, the native code a native release links instead of a
JavaScript runtime, is generated from `@nativescript/core`'s own TypeScript,
compiled by the same compiler that compiles apps and plugins. The kit then
follows core release by release and handles every case core handles, out of
the box.

## Why

Today the kit is a hand port: about 18,700 lines of Swift and 14,400 of
Kotlin (the Android side sits on core's own `org.nativescript.widgets` AAR).
It matches core pixel for pixel wherever it was ported and checked, and it
drifts everywhere else.

- **What drift looks like.** openjs-app's Search tab sets
  `role: 'search'`. Core's iOS TabView builds a `UISearchTab` for it, which
  iOS 26 shows apart from the glass tab bar. The kit's TabView had no `role`
  and silently made an ordinary tab. Nothing failed; the app just looked
  different.
- **What a hand port can miss.** Every property core gains, every iOS
  version branch (`SDK_VERSION >= 18`), every Android API-level branch,
  every fix in a point release. Core 9.1 also ships views the kit doesn't
  have yet (`split-view`, `repeater`, `proxy-view-container`).
- **What it costs.** Every core release needs the matching kit change, by
  hand, forever. It is the second implementation of core that
  `WORKING-GROUP.md` lists as a top risk.

Compiling core removes the second implementation instead of maintaining it.

## Why it is possible now

Core's platform layer is TypeScript that calls native APIs: `*.ios.ts` against
UIKit, `*.android.ts` against the Android SDK, `*-common.ts` shared. That is
exactly what the compiler already compiles for plugins:

| Core needs | The compiler has |
| --- | --- |
| UIKit/Foundation calls by NativeScript's names (`UISearchTab.alloc().initWithTitleImage…`) | Tables from the SDK's symbol graphs mapping them to Swift (`compiler/src/natives/`) |
| Android SDK calls, Java subclasses, interfaces from object literals | Signatures from class files; `@NativeClass`/`.extend` |
| `@NativeClass` delegates and data sources with `ObjCProtocols` | Swift classes conforming to the protocols (`native-calls.ts`) |
| The property system: `Property`, `CssProperty`, `InheritedCssProperty`, `[prop.setNative]` | The name-based property registry plugins already register into |
| Classes, inheritance, generics, getters, decorators, closures, Map/Set, WeakRef | The translator, checked byte for byte against Node by the differential tests |
| `isIOS`/`isAndroid`, `__IOS__`, `SDK_VERSION` branches | Platform folding, plus version checks that become `#available` |
| Fetching the exact source of a package version | The plugin source fetcher, verified against the published JS |

Plugins such as ui-drawer and input-accessory, which subclass core views,
override lifecycle methods and register properties, already compile this
way. Core is the same kind of code, just larger.

## Plan

1. **Fetch core's TypeScript at the app's version.** Core is published without
   `gitHead`, so take the source from the NativeScript repo's release tag
   (`packages/core`). Verify it against the published JS, as for plugins.
2. **Keep a small hand-written base.** Some parts are the compiler's own
   runtime, not core:
   - the JS-semantics runtime (`Runtime/`: arrays, promises, microtasks,
     RegExp, Date, JSON)
   - signals, regions and effect ordering
   - the app entry
   - anything core does through the JavaScript runtime itself (module
     loading, `global`, the V8 bridge)

   These stay as they are, and core compiles against them.
3. **Replace the hand port module by module, smallest first:**
   - core's `utils`, `color`, `application-settings`
   - then `ui/core` (`View`, `ViewBase`, properties, styling)
   - then layouts, then each view

   For each module:
   - compile core's TypeScript for it into the kit
   - delete the hand port
   - prove it with the gallery, Recipes and ns-octane apps at 0 px against
     their NativeScript builds

   Core's own unit tests (`apps/automated` in the NativeScript repo) run
   against the compiled kit too.
4. **Hot paths.** Measure layout and CSS matching after each swap
   (`tools/launch.py`, `tools/device.py`). Where compiled TypeScript is
   measurably slower than the hand port, fix it in the translator, not with
   a hand-written override, so the fix carries to every app and plugin.
5. **Track core automatically.** CI builds the kit from each core release and
   release candidate and runs the pixel and unit suites. A core change
   reaches native releases the day core ships it, with no port.

## Until then: catch drift at compile time

While parts of the kit are still hand ported, the compiler checks every
property an app sets on a core view: in templates, in options objects such
as `*tabItem`, in CSS and in imperative code. Each one must be implemented by
the kit as core declares it in its `.d.ts`. A property the kit lacks stops
the build with the view, the property and the file and line, unless the app
opts out. The same comparison, run over core's whole `.d.ts`, is a published
coverage report: which core APIs the kit implements, per module.

## Expected hard parts

- **Dynamic patterns inside core:**
  - `Object.defineProperty` on prototypes
  - mixins (`applyMixins`)
  - `Observable`'s string-keyed events
  - module-level registries

  Each needs either a translator feature, checked by new differential tests,
  or a small, documented change in core, which also benefits core.
- **Core code that assumes a JavaScript runtime:** `global`, `require`,
  `__non_webpack_require__`, the iOS runtime's `interop` pointers, and the
  Android runtime's `__native`. Each gets a kit counterpart or a compile-time
  diagnostic.
- **Size.** Compiled core is larger than a hand port that skipped what no app
  used. Reachability from the app's entry, as for plugins, plus the size
  settings the kit already builds with, should keep it near today's
  1.1–2.5 MB.

## Where it stands (2026-10-07)

The kit's `Core/` is generated from core 9.1.3 as merged with main
(`45b3b99`, iOS 27 TabView fixes included): 214 files, one per core module,
plus `__Exports.swift` (the functions core's index exports, as an app imports
them) and `__Objects.swift`.

| Proof | Result |
| --- | --- |
| recipes-vue against its NativeScript Release build on the same core | 0 px: home, detail, the detail after interacting, home after going back; still running with the search field focused |
| gallery-vue, 41 screens and their scripted steps | every screen runs its steps without crashing (`tools/smoke.py`) |
| Differential tests, Swift | 43 of 43 match Node, `41-core-semantics` added |
| Core's own unit tests (Vitest) | 530 pass, 1 skipped |
| recipes-vue archive | 6,556 KB (hand-ported kit: 1,264 KB; NativeScript: 45,904 KB) |

### What generating the kit taught

Almost every failure was the translator reading JavaScript more strictly
than JavaScript does. Core is written without `strictNullChecks`, so its
types promise values that are often undefined. The fixes that mattered:

- **Undefined stays undefined.** An array read untyped (`cache[key]`), an
  optional member (`entry.backstackVisible`), `a || b` of two missing objects,
  a registered property never set: each was read as the type's zero (an empty
  array, `false`, a fresh object). Zeros make wrong code run quietly: a cache
  miss became a hit, navigation replaced pages, every view's native setters
  were skipped. Held as undefined, the same code either works or stops where
  JavaScript would throw.
- **`this` is the receiver.** A function declaration that reads `this`
  (`function get() { return this[key]; }`, stored as an accessor) takes it
  from its caller, as any JavaScript function does.
- **What script hands native code is marshalled as the runtime marshals it.**
  Plain objects become dictionaries, script functions become blocks and
  native blocks become script functions, a `Date` becomes an `NSDate`, a
  number becomes a native enum.
- **Properties reach their accessors.** Every property class
  (`CssAnimationProperty` included) puts its accessor on the prototype, and a
  setter that only forwards (`set color(v) { this.style.color = v }`) passes
  on what script gave it, unconverted.
- **The JS runtime's own behaviour has to exist:** microtasks drain after
  every batch of UIKit work, promises have `then`/`catch`/`finally` by name,
  and native properties forwarded by UIKit (`UITextView`'s input traits) are
  reached as a message send reaches them.

### Tools that made it tractable

`tools/kit-from-core/README.md` describes them: the regenerate-build-run
loop, the probe (the view tree with each view's CSS cascade), native stacks
for uncaught errors, the XCUITest UI driver that replaced idb, and
`smoke.py` with `--lldb`. Two of them exist because a check passed without
checking anything: idb's taps had stopped landing on Xcode 27, and both apps
compared equal on a screen neither left. The comparisons now fail when an
interaction leaves the screen unchanged.

### Next

1. **Gallery-vue at 0 px** against its Release build, screen by screen
   (`tools/gallery.py`), the TabView screen with `role: 'search'` included.
2. **A closed world for core.** The archive grew fivefold because every core
   module is compiled into every app, and module initializers and dynamic
   dispatch tables keep it all alive; every file importing WebKit and Photos
   also loads both at launch. Compiling only the core modules an app reaches,
   as `reach.ts` already does for plugins, addresses size and launch together.
3. **Core's `apps/automated` suite** compiled as an app and run on the kit.
4. **Android:** the Kotlin toolchain for the differential tests (Gradle's
   cached `kotlinc` is gone), then the kit generated for Android.
