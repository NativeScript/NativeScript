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
