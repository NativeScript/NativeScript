# test262 conformance

Measures how much of JavaScript's semantics the compiled output keeps. A curated subset of
[tc39/test262](https://github.com/tc39/test262) goes through the same path an app's modules take: type check,
translation, and then the Swift runtime (as a macOS executable) and the Kotlin runtime (on the host JVM). No device
or simulator is needed.

## Running

```sh
cd packages/compiler
node tests/test262/run.ts                      # both backends
node tests/test262/run.ts --swift              # or --kotlin
node tests/test262/run.ts --only built-ins/Math --only self/   # tests whose path contains any of these
node tests/test262/run.ts --list               # what tests.txt selects and why tests are skipped, without running
node tests/test262/run.ts --report             # the summary table of the last run's results
node tests/test262/run.ts --update-baseline    # rewrite baseline.json from this run
```

| Variable | Default | |
|---|---|---|
| `NS_TEST262_CACHE` | `~/.cache/ns-test262` | test262's tarball at the pinned commit, and the directories `tests.txt` names, extracted from it |
| `NS_TEST262_BUILD` | `<tmp>/ns-test262` | batches, `results-<backend>.json`, `summary.md`, `solo.txt` |
| `NS_TEST262_MIN_FREE_GB` | `8` | the run stops before a batch if less disk space than this is free |
| `NS_TEST262_TIMES` | unset | print each batch's translate, compile and run times |

`--batch <n>` (default 250) sets the number of tests per native build. `--jobs <n>` sets how many test processes run at once. `--keep` keeps the batch directories.

A full run takes about 20 minutes per backend on a 16-core Mac. A batch's outputs stay under 100 MB and
are deleted once its results are recorded.

**CI.** The run fails only on a regression: a test that is not listed in `baseline.json` and does not pass. When a test
in the baseline starts passing, the run reports it and still succeeds. `--update-baseline` then removes it. A run
with `--only` updates only the entries for the tests it ran.

## What runs

`tests.txt` lists the selection by area. test262 is pinned to one commit (`COMMIT` in `run.ts`) and is never vendored.
The covered areas are String, template literals, Array, Number, Math, JSON, Object (keys, entries, values, assign,
fromEntries, object literals and spread), Map, Set, Promise, Date basics, RegExp basics (with String's
match/matchAll/search), destructuring, classes (with private members and static blocks), getters and setters,
closures and scope, optional chaining and nullish coalescing (with logical assignment), typeof and equality, and
exceptions. `self/` holds the harness's own checks. They must pass on a backend for that backend's numbers to mean
anything.

Not selected: tests that reflect over the built-ins' own function objects (`length.js`, `name.js`, `prop-desc.js`,
`not-a-constructor.js`), Annex B, and features apps don't use yet (the Set methods, the RegExp `v` flag, property
escapes and modifiers).

Every selected test ends with one status:

| Status | Meaning |
|---|---|
| pass | Ran natively as test262 expects: no uncaught error, `$DONE` called with nothing for async tests, the expected error for runtime-negative tests. |
| fail | The compiler accepted the test, but swiftc or kotlinc rejected the output, or the program threw, crashed, timed out or never finished. |
| refused: type check | The build's type check rejects the test, with the lenient checks an app whose tsconfig is not strict gets. Untyped test262 code often passes arguments TypeScript won't accept (`'abc'.indexOf()`, `{}` used as a function). A typed app can't contain this code. |
| refused: translator | The compiler reports the construct as not supported in a release build. |
| out-of-scope | Something the compiler refuses by design: `eval`, `new Function`, `Proxy`, `Reflect`, `with`, `SharedArrayBuffer`/`Atomics`, `FinalizationRegistry`, computed `import()`/`require()`. Or something that never applies to compiled code: sloppy-mode-only tests (`noStrict`, `raw`), early errors (TypeScript's parser rejects them first), `$262` host hooks and realms, module fixtures. Detected from test262's `features` metadata and from the test's code with comments stripped. |
| unported | Needs a harness include that isn't ported (`resizableArrayBufferUtils.js`, `testTypedArray.js`, `nativeErrors.js`, …). |
| invalid | The adapted test fails under Node. That means the adaptation is wrong, not the compiler, so the test is not counted. |

Pass rate is pass / (pass + fail + refused). Compiled pass rate is pass / (pass + fail): of the tests the compiler
accepted, the share that behaved as JavaScript does.

## How a test is adapted

The compiler takes TypeScript only; it resolves `.ts` files and type-checks them first. test262 is untyped JavaScript,
so each test is changed mechanically. No test is edited by hand.

1. The test becomes a module, `t<n>.ts`, of a batch directory whose `tsconfig.json` is not strict. The build then
   checks it the way it checks a non-strict app, and translates it as the CLI translates such an app
   (`appStrictness`). As a module, the test runs in strict mode, which every test not marked `noStrict` is written
   for.
2. One import per harness name the test uses goes in front of the source, on its first line, so test262's line
   numbers stay the same.
3. Each call `assert(…)` becomes `assert.ok(…)`. test262's `assert` is a function with properties assigned to it.
   The TypeScript form of that, a function merged with a namespace, doesn't compile for Swift, so `assert` here
   is a namespace.
4. `assert.throws(TypeError, …)` and `assert.throwsAsync` get the name of a built-in error constructor (`'TypeError'`)
   instead of the constructor itself. The harness then checks with `instanceof` against that constructor and
   none of its subclasses, which is what test262's `thrown.constructor === expected` decides. Passing an error
   constructor as a value does not compile for Swift, and leaving it would fail every `assert.throws` test for
   that one reason. Other constructors (a test's own classes, `URIError`, `EvalError`) are passed as they are.

The edits find calls with TypeScript's parser, not with regular expressions. Every adapted test also runs under Node,
built the way the bundler builds it. A test that fails there is marked invalid and not counted.

The harness includes are typed ports in `harness/`. Where they differ from test262's:

- `sta.js`: `Test262Error` is a class with a `name` field.
- `assert.js`: `assert` is a namespace (see 3), and `compareIterator` and `throwsAsync` are part of it. When
  `String(value)` throws, `formatSimpleValue` returns `[object <typeof>]`.
- `propertyHelper.js`: `verifyProperty` and the deprecated `verify*` checks call `hasOwnProperty` and
  `propertyIsEnumerable` on the object rather than through primordials captured with `.call`, which doesn't translate.
  `verifyCallableProperty` and `verifyAccessorProperty` are not ported.
- `asyncHelpers.js`: `asyncTest` doesn't check that `$DONE` is a global, because every async test imports it.
  `throwsAsync` settles through `Promise.resolve(result).then` instead of `result.then` with captured resolvers.
- `doneprintHandle.js` prints with `console.log`. `promiseHelper.js`, `tcoHelper.js`, `dateConstants.js`,
  `assertRelativeDateMs.js` and `decimalToHexString.js` are typed but otherwise unchanged.

## Batching and isolation

The tests are compiled in batches of 250, so each backend needs about 35 native builds rather than one per test.
Within a batch, each failure is kept to the test that caused it:

- The type check runs over the whole batch. Each diagnostic is attributed to its test, those tests are marked
  refused, and the check runs again without them.
- Each module is translated separately. A module the translator refuses affects only its own test.
- A compiler error in a test's own file fails that test, and the batch compiles again without it. Swift reports
  errors at the test's own `.ts` lines through `#sourceLocation`. Errors in shared code are found by halving the batch.
- If the error is a top-level name that another module of the batch also declares (`conflicting declarations`,
  `invalid redeclaration`, `ambiguous use of`), the test is compiled again by itself, the way its own app would
  build it. These tests are listed in `solo.txt`.
- The batch builds one executable (or one set of classes). Its entry point runs the one test named by its argument,
  and each test runs in its own process with a 15-second timeout. A test that crashes or hangs affects only its own
  result.

## Results

test262 `d53ebc8b19`, compiler at `feat/native-kit` `4a26d6b97` (2026-10-14). Swift on macOS, Kotlin on the host JVM.

| Area | Backend | Tests | pass | fail | refused: type check | refused: translator | out-of-scope | unported | invalid | Pass rate | Compiled pass rate |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Harness | swift | 5 | 4 | 1 | 0 | 0 | 0 | 0 | 0 | 80% | 80% |
| Harness | kotlin | 5 | 5 | 0 | 0 | 0 | 0 | 0 | 0 | 100% | 100% |
| String | swift | 916 | 152 | 278 | 190 | 276 | 19 | 0 | 1 | 17% | 35% |
| String | kotlin | 916 | 226 | 211 | 190 | 269 | 19 | 0 | 1 | 25% | 52% |
| Template literals | swift | 84 | 22 | 19 | 16 | 0 | 25 | 0 | 2 | 39% | 54% |
| Template literals | kotlin | 84 | 19 | 21 | 16 | 1 | 25 | 0 | 2 | 33% | 48% |
| Array | swift | 2687 | 191 | 435 | 555 | 1327 | 86 | 78 | 15 | 8% | 31% |
| Array | kotlin | 2687 | 168 | 494 | 555 | 1291 | 86 | 78 | 15 | 7% | 25% |
| Number | swift | 294 | 143 | 38 | 21 | 90 | 2 | 0 | 0 | 49% | 79% |
| Number | kotlin | 294 | 150 | 34 | 21 | 87 | 2 | 0 | 0 | 51% | 82% |
| Math | swift | 169 | 124 | 27 | 0 | 11 | 0 | 1 | 6 | 77% | 82% |
| Math | kotlin | 169 | 131 | 20 | 0 | 11 | 0 | 1 | 6 | 81% | 87% |
| JSON | swift | 136 | 65 | 24 | 17 | 7 | 22 | 0 | 1 | 58% | 73% |
| JSON | kotlin | 136 | 68 | 21 | 17 | 7 | 22 | 0 | 1 | 60% | 76% |
| Object | swift | 537 | 249 | 92 | 66 | 53 | 76 | 0 | 1 | 54% | 73% |
| Object | kotlin | 537 | 189 | 123 | 66 | 82 | 76 | 0 | 1 | 41% | 61% |
| Map | swift | 165 | 28 | 8 | 55 | 68 | 4 | 1 | 1 | 18% | 78% |
| Map | kotlin | 165 | 28 | 9 | 55 | 67 | 4 | 1 | 1 | 18% | 76% |
| Set | swift | 162 | 38 | 22 | 4 | 94 | 3 | 0 | 1 | 24% | 63% |
| Set | kotlin | 162 | 50 | 10 | 4 | 94 | 3 | 0 | 1 | 32% | 83% |
| Promise | swift | 675 | 39 | 164 | 194 | 159 | 59 | 0 | 60 | 7% | 19% |
| Promise | kotlin | 675 | 106 | 84 | 194 | 172 | 59 | 0 | 60 | 19% | 56% |
| Date | swift | 327 | 116 | 82 | 35 | 85 | 6 | 0 | 3 | 36% | 59% |
| Date | kotlin | 327 | 128 | 67 | 35 | 88 | 6 | 0 | 3 | 40% | 66% |
| RegExp | swift | 830 | 163 | 157 | 354 | 135 | 16 | 2 | 3 | 20% | 51% |
| RegExp | kotlin | 830 | 176 | 142 | 354 | 137 | 16 | 2 | 3 | 22% | 55% |
| Destructuring | swift | 651 | 42 | 140 | 247 | 55 | 165 | 0 | 2 | 9% | 23% |
| Destructuring | kotlin | 651 | 63 | 117 | 247 | 57 | 165 | 0 | 2 | 13% | 35% |
| Classes | swift | 666 | 27 | 148 | 235 | 108 | 140 | 2 | 6 | 5% | 15% |
| Classes | kotlin | 666 | 34 | 155 | 235 | 94 | 140 | 2 | 6 | 7% | 18% |
| Getters and setters | swift | 64 | 2 | 43 | 6 | 3 | 10 | 0 | 0 | 4% | 4% |
| Getters and setters | kotlin | 64 | 1 | 45 | 6 | 2 | 10 | 0 | 0 | 2% | 2% |
| Closures and scope | swift | 366 | 28 | 76 | 66 | 9 | 177 | 0 | 10 | 16% | 27% |
| Closures and scope | kotlin | 366 | 45 | 61 | 66 | 7 | 177 | 0 | 10 | 25% | 42% |
| Optional chaining and nullish | swift | 140 | 16 | 15 | 75 | 2 | 30 | 0 | 2 | 15% | 52% |
| Optional chaining and nullish | kotlin | 140 | 22 | 8 | 75 | 3 | 30 | 0 | 2 | 20% | 73% |
| typeof and equality | swift | 161 | 9 | 22 | 108 | 4 | 16 | 0 | 2 | 6% | 29% |
| typeof and equality | kotlin | 161 | 21 | 10 | 108 | 4 | 16 | 0 | 2 | 15% | 68% |
| Exceptions | swift | 295 | 48 | 95 | 42 | 15 | 66 | 18 | 11 | 24% | 34% |
| Exceptions | kotlin | 295 | 55 | 93 | 42 | 10 | 66 | 18 | 11 | 28% | 37% |
| **Total** | swift | 9330 | 1506 | 1886 | 2286 | 2501 | 922 | 102 | 127 | 18% | 44% |
| **Total** | kotlin | 9330 | 1685 | 1725 | 2286 | 2483 | 922 | 102 | 127 | 21% | 49% |

What stands out:

- **Most refusals happen before translation.** A quarter of the selection (2286 tests) fails the type check, and the
  same tests fail it on both backends. This is untyped test262 code that a typed app can't contain. The exception
  is `TS2550`: the build's `lib` is ES2022, so typed apps also can't use `findLast`, `findLastIndex`, `toSorted`,
  `toReversed`, `toSpliced`, `with`, `Object.groupBy`/`Map.groupBy` or `Promise.withResolvers`.
- **The largest translator refusal is a method called on another receiver.** That means `X.prototype.m.call(…)` and
  `X.prototype` used as a value: about 1250 tests on Swift and 1060 on Kotlin, plus around 500 more that read
  `String/Array/Number/Date/Map/Set.prototype`. test262's built-in tests depend heavily on this.
- **Of what compiles, a little under half behaves as JavaScript does** (44% Swift, 49% Kotlin). Math, Number, JSON,
  Map and Set do best. Classes, destructuring, getters and setters, and Promise on Swift do worst.
- **On Swift, almost every async test is masked by one bug.** A `then` callback that returns nothing resolves
  to `()` rather than `undefined`, and `()` is truthy, so `.then($DONE, $DONE)` reports a failure
  (`self/async-done.js`; diff case 227).

`baseline.json` records every failing or refused test with its reason, for routing fixes. `results-<backend>.json`
in the build directory has the same information for every test.
