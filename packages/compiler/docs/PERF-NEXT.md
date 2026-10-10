# Launch performance: where the next gains are

Measured on an iPhone 16 Pro (iOS 26.6.2) with recipes-vue, `--compiled` release, after commit c2866fe74:

| | `--compiled` | JS release |
|---|---|---|
| first frame (device.py, median of 5) | 191 ms | 190 ms |
| memory footprint | 18.9 MB | 47.3 MB |
| CPU to settled | 0.457 s | 0.497 s |
| .ipa | 2.35 MB | 14 MB |

An empty UIKit app on the same phone takes about 95 ms from `main` to `didFinishLaunching`. Most of that is UIKit loading
accessibility bundles, and every app on the phone pays it. The compiled app's own work is the rest:

- module initializers: 21 ms;
- the root render: 5 ms;
- loading the views and applying CSS: ~22 ms;
- layout: ~13 ms;
- window and navigation setup: ~10 ms, mostly UIKit.

About 25 ms of the app's own work is the plumbing that gives translated code JavaScript semantics:

- `jsGet`/`jsSet`/`callMethod`/`jsHasKey` on string keys;
- JSObject property lookups;
- expando and prototype descriptor lookups.

No single item there costs more than ~3 ms, so further gains need one of two structural changes.

## 1. Typed member access in core's hot paths (compiler)

Core's property system reads and writes view members by name, even where TypeScript knows the member and its type:

- the descriptor closures that `Property`, `CssProperty` and `InheritedCssProperty` define on prototypes;
- `CssState.setPropertyValues`;
- `ViewBase.eachChild` and the `onLoaded` recursion.

Each of these accesses goes through `jsGet`/`jsSet`/`callMethod`, the class's `subscript(jsKey:)` chain, and expando and
prototype lookups. Translating statically known members to direct Swift member access, and symbol-keyed members to
direct calls of the class's `__symbol_N` methods, would remove most of that plumbing. The estimate is 15–20 ms of launch.

## 2. Lazy module statics (compiler)

A module's top-level bindings could become lazily initialized Swift statics, keeping side-effecting statements in order:

- only bindings whose initializers are provably pure: literals, object and array literals of pure values, functions and classes;
- with diff cases for module evaluation order.

The initializers left are dominated by modules with side effects that the first frame needs anyway:

- application (`NSBundle.main` is first touched there);
- style-properties (CSS property registration);
- utils/constants (first `UIDevice` access);
- known-colors.

So laziness saves about 3–4 ms on recipes-vue.

## Size, parked

Dropping the XML builder, the binding expression parser, easysax and the shared-transition helper from apps that never
reach them would save about 380 KB of the arm64 executable. It needs the `Builder` references in view-common,
frame-common and list-view to become indirect, so that the closed world in `cli.ts` can leave those files out. Their
initializers cost under 0.1 ms each, so launch would not change.

## Measuring

`tools/device.py` in the swiftui-live native-release folder measures first frame, footprint, CPU and sizes against the
JS build.

For a breakdown, add a main-thread sampler to the generated `__Entry.swift` (suspend the main thread every 0.5 ms and
walk its frame pointers) and symbolicate offline:

- app frames with the archive's dSYM;
- system frames with Xcode's iOS DeviceSupport symbols.

Simulator timings are too noisy, and conformance lookups cost far more on the simulator, which has no dyld shared-cache
tables. Use the simulator only for counts and for interleaved A/B runs.
