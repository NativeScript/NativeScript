# Spike: `consumer: 'server'` Vite environment as the device module source

`compare.mjs` boots toolbox's real `typescriptConfig` (iOS, `--env.hmr`). It adds one environment:

```ts
nativescript: { consumer: 'server', dev: { moduleRunnerTransform: false } }
```

For each module it captures three outputs:

1. `client`: Vite's browser environment, the input `/ns/m` works from today;
2. `server`: the new environment;
3. `nsm`: what `/ns/m` actually serves to the device.

Outputs land in `out/`. The run used Vite 8.0.2.

## Round 1 results

| Module class | `client` | `server` | `/ns/m` |
|---|---|---|---|
| Plain app TS (`main.ts`, `main-page.ts`, …) | clean ESM, `/@fs`/`/src` URLs | **identical to client** | +30 lines of prelude; URLs remapped |
| Core internals (`ui/frame/index.ios.ts`) | clean, `/@fs` + `/@id/__x00__@oxc-project+runtime/...` helpers | **identical to client** | URLs → absolute LAN origin; keeps `.ts` extension |
| Uses `import.meta.hot` | **injects `/@vite/client` + `__vite__createHotContext`** | no injection; `import.meta.hot` left for our registry | strips Vite's, injects own `createHotContext` |
| `import './x.css'` (CSS module) | DOM `updateStyle` module wired to `/@vite/client` | **`export {}` (content dropped)** | `export default "<css>"` + `__NS_REGISTER_CSS__` |
| npm dep (`@nativescript/imagepicker`) | `/node_modules/.../index.ios.js` | **bare `@nativescript/imagepicker` (externalized)** | inline sync `__nsVendorRegistry.get(...)` / `__nsVendorRequire(...)` expression per import site |
| Dynamic `import()` | Vite-resolved | identical to client | every call routed via generated `__ns_import` wrapper that special-cases a bare `'@'` spec |

## What this means

1. **The server environment does remove all of Vite's browser-only injection.** That injection is `/@vite/client` and `createHotContext`, verified both in source (`node.js:27648`, `!ssr`) and in output.
2. **For most app and core modules there was nothing to remove in the first place.** Under HMR, `optimizeDeps` is disabled (`configuration/base.ts:270`), so there is no `.vite/deps?v=` noise. Client output for plain TS is already clean.
3. **So the ~70 passes are mostly not "undoing Vite".** For plain modules, what `/ns/m` adds is:
   - **URL remap.** Required, but `/ns/m` is inconsistent: app modules drop the extension and core modules keep it. That is the identity-split hazard seen live.
   - **`import.meta.hot` registry hookup.** Required, one line.
   - **~20 per-module `const __IOS__ = globalThis.__IOS__…` define shims.** Redundant: Vite's `define` already substituted them (`if (__APPLE__)` is `if (true)` in the server output).
   - **A `process.env` shim, platform seeds, a `require`-URL guard IIFE and a boot counter, repeated in every module.** This is one-time global setup that belongs in the bootstrap.
   - **A full Babel regenerate.** It reformats the code, which is why source maps need realigning.
4. **CSS is not free under a server environment.** Vite drops CSS content outside the client. A tiny environment plugin is needed: rewrite `.css` imports to `?inline`, which does export the string under SSR, then register the text. That replaces `/ns/m`'s hand-rolled CSS route.
5. **Bare npm specifiers stay bare** under the server environment. One import-map entry per vendor package, pointing at a shim that re-exports from the vendor registry, would replace the per-import-site inline registry expression.
   - Open question: CJS named-export interop for vendor packages. `cjs-named-exports.ts` exists for this.

## Revised hypothesis

The server environment is a **small** win on its own: it handles the `import.meta.hot` and CSS classes cleanly. The large win is that it lets the serving layer become a **thin, AST-free post-step**:

- Map Vite URLs to device URLs with one consistent id function.
- Prepend a one-line `import.meta.hot` hookup.
- Leave bare specifiers to the runtime import map.
- Move global shims into the bootstrap.

Most `/ns/m` passes can go because they are redundant or misplaced, not because the server environment removes their input.

## Round 2: framework plugins (`compare-frameworks.mjs`, `fixtures/`)

Vite sets `ssr: true` in plugin hooks for every server-consumer environment.

| Plugin | Plain in `nativescript` environment | With fix | Fix |
|---|---|---|---|
| `@vitejs/plugin-vue` 6.0.5 | **SSR codegen** (`_sfc_ssrRender`, `_push`, imports `vue/server-renderer`); unusable | Same as client output except no `/@vite/client` injection and `vue` left **bare**; `__VUE_HMR_RUNTIME__` + `import.meta.hot.accept` kept | `withClientCodegen()`: wrap the plugin's `resolveId`/`load`/`transform` to pass `ssr:false` in the `nativescript` environment only; Vite's own import analysis still treats it as server, so externals stay |
| `vite-plugin-solid` 2.11.11 (`ssr:false`, `generate:'universal'`) | Universal codegen kept; solid-refresh dropped (NS ships `hot:false` anyway) | not needed | none |
| Vue style block / any `.css` | content dropped (raw CSS or empty) | `export default "<scoped css>"` | `ns-spike:css-inline` resolver: add `inline` **before** a trailing `lang.*` param (Vite only treats an id as CSS when `.css`/`lang.css` ends it), else append `?inline` |
| Analog (Angular) | **not tested**: `@angular/core` not installed in the workspace | | |

What this means for Vue: plugin-vue's untouched output is what `/ns/sfc` + `/ns/asm` reconstruct today. Those routes take about 2k lines, re-read `.vue` from disk, re-run `parse`/`compileTemplate`, and regex-strip and re-add HMR calls. A bare `vue` specifier plus one import-map entry gives a single runtime, which is the reason `/ns/rt` exists.

## Gaps found so far

- **CSS registration.** An inlined CSS module only exports its string, so a post-transform must hand it to NS core: one appended call, or a registration import.
- **Bare specifiers.** Vendor packages (`@nativescript/imagepicker`, `vue`, …) need import-map entries. They would point at tiny shims re-exporting from the vendor registry, or at the deps bundle. Still open: CJS named-export interop.
- **URL mapping.** `/@fs/<abs>` and `/src/...` must become device-reachable URLs through one id function. Keep extensions; `/ns/m` is inconsistent today.

## Round 3: whole-graph crawl through a thin post-step (`crawl.mjs`)

The crawl walks breadth-first from `/src/main.ts` in `environments.nativescript` and applies `thinPostStep`, the entire device transform:

- es-module-lexer offsets, no AST and no regex over code;
- root-relative specifier → `/ns/e<vite-url>`, keeping extension and query;
- bare specifiers left alone;
- a one-line `import.meta.hot` hookup, only if used;
- an inlined-CSS registration call.

Virtual modules (`/@id/__x00__…`) are unwrapped to `\0…` for `transformRequest`.

| | thin (server env) | `/ns/m` today |
|---|---|---|
| Modules served (toolbox iOS, `--env.hmr`) | **247, 0 errors** | 247, 0 errors |
| Total bytes | **2.00 MB** | 2.88 MB |
| Babel parses per module | **0** | 6–8 |
| `/@vite/client`, `createHotContext`, `.vite/deps`, `?t=`, `__vite_ssr_`, `vue/server-renderer`, `__vite__updateStyle` | **0 files** | n/a (stripped by passes) |
| `nsvite:nsconfig-json` virtual | served as a normal module | `/@id/` import deleted by a generic strip, then regex-inlined back |
| Bare specifiers needing import-map entries | **9**: core's npm deps (`tslib`, `css-tree`, `acorn`, `emoji-regex`, `css-what`, `@csstools/{css-calc,css-color-parser,css-parser-algorithms,css-tokenizer}`) | handled by vendor/deps-bundle rewriting at each import site |

Timing was about 5 s cold for the whole graph, with the comparison fetches included.

## The hard part of the device step

On the server, the graph is clean. On the device, **core identity** decides whether it works. In thin mode, core is reached as `/ns/e/@fs/<abs>/packages/core/...`, one URL per file, the same as any other module. But today's bootstrap still loads core from `/ns/core` / `core-bundle.mjs` before the app entry. That bootstrap is `main-entry.ts` → `session-bootstrap` → the `vite-plugin.ts` bootstrap string. Two URLs for core means two realms, which is the duplicate-native-class bug.

So the device experiment must make the bootstrap import core through the same `/ns/e` URLs, or load the whole thin graph from one entry. The alternative is to map `@nativescript/core` in the import map to the core bundle and externalize core in the `nativescript` environment, so app modules import the bare specifier. That second option is closer to production (bundle.mjs) and faster to boot. It's the one to try first.

## Round 4: Angular (`apps/ng`, from `@nativescript/template-blank-ng`)

**Fixture setup:**

- Angular 21.2.3 and `@nativescript/angular` 21.2.0. This matches the workspace's Analog compiler (`@angular/compiler-cli` 21.2.3), resolved through the symlinked vite dist.
- Core comes from `dist/packages/core` (built JS, like the published package).
- The iOS runtime is `9.1.2-next.2026-11-18-44312118018`.

**Server environment (crawl):**

- 4 app modules, 0 errors. All packages (`@angular/*`, `@nativescript/angular`) stay bare.
- Analog needs **no wrapper**: it never branches on `ssr`. The output is AOT (`ɵɵdefineComponent`, template instructions, no `templateUrl`). Angular HMR (`ɵɵreplaceMetadata` + `import.meta.hot.on('angular:component-update')`) is intact.
- Output is 13 KB vs 33 KB from `/ns/m`.

**Bugs in the current pipeline, found along the way:**

1. **Component `styleUrl` styles are probably dropped under HMR.** Static analysis only; not yet seen on device.
   - Analog 2.1.3 forces `externalRuntimeStyles = true` whenever `liveReload` is on in watch mode (`angular-vite-plugin.js:549-551, 615-617`). The NS config's `externalRuntimeStyles: false` (`configuration/angular.ts:432`) has no effect.
   - Output therefore uses `ɵɵExternalStylesFeature(["<hash>.css"])`, in both `/ns/m` and the server environment.
   - Nothing in `@nativescript/angular` 21.2.0 or `@nativescript/vite` handles external styles.
2. **Angular with core as TS source:** Analog compiles every `.ts` id and empties files outside its program. `/ns/m` survives through `tsFallbackTransformPlugin`, but `/ns/core/<sub>` returns 500 `core-transform-failed` and the real error is swallowed. This only affects monorepo or linked-source setups.
3. **iOS boot crash (seen on device): the HMR overlay colors core `Label`s with a `Color` from a different copy of core.**
   - `asColor()` (`hmr/shared/runtime/dev-overlay-shared.ts:180`) resolves `Color` via `__nsVendorRegistry` / globals.
   - Core's `text-base/index.ios.ts:201` does `value instanceof Color ? value.ios : value`, so the foreign instance passes through as a plain JS object.
   - The result is `NSInvalidArgumentException: -[DictionaryAdapter CGColor]: unrecognized selector`, crashing in `-[TNSLabel drawTextInRect:]`.
   - Confirmed by patching the built `asColor` (and the placeholder's `makeColor`) to return the raw string: no more crash. These are **spike patches in `dist/`**, marked `// SPIKE`; they are not in the source.
4. **After that, Angular never replaces the boot placeholder.** There is no error; the placeholder times out at 20 s.
   - The device log shows `[ns-dev] launch-notification bridge installed` **twice**, which suggests two `Application` instances, one per copy of core.
   - Hypothesis: `runNativeScriptAngularApp` waits on a launch event its copy of core never receives. Not yet proven; it needs JS evaluation on the device.

**Toolchain notes:**

- Global CLI 9.0.6 only runs `vite build --watch`, so `vite serve -- --env.ios --env.hmr` had to be started by hand. The README's "CLI starts the dev server" needs CLI ≥ 9.1.2.
- Toolbox's pinned runtime, 9.1.0-alpha.6, lacks `ns:module` (`configureLoader is unavailable`).
- Changing the runtime or the core package needs `platforms/` deleted. Otherwise you get stale framework references and "Multiple commands produce …/NSCWinterTC.framework".

Items 3 and 4 are the realm split that the thin, server-environment design would eliminate: one URL, one copy of core. They also block measuring the current pipeline on Angular at all.

## Round 5: one URL per file in the current (client-environment) pipeline

**Where duplicate core comes from.** It isn't a different version; one file gets several URLs.

- The device keys modules by URL. Before the fixes, `color/index.ios.js` defined a `Color` class at three URLs:
  - `/ns/core/color`: the bridge serves the body at its own URL;
  - `/ns/m/@fs/<abs>/…/color/index.ios.js`: core-internal imports;
  - `/ns/m/dist/packages/core/color/index.ios.js`: the workspace-relative spelling from `rewriteFsAbsoluteToNsM`.
- Plain Vite gives both importers the same `/@fs/<core>/color/index.ios.js`.
- `bundle.mjs` contains no core; it imports `/ns/core/<sub>`. The dev `vendor.mjs` imports bare `@nativescript/core`, and the import map resolves that to `/ns/core`.

**Duplicate detector, `dupes.mjs`.** It walks the device graph from `bundle.mjs`, the session entry and the HMR client, resolving bare specifiers through the live import map, and reports files reachable under more than one URL. Its results:

| Step | Files with more than one URL | Modules fetched |
|---|---|---|
| Baseline (`@next` CLI-managed dev server) | 116: **113 rxjs** (`…/Observable` vs `…/Observable.js`) + 3 `@csstools` | 793 |
| Delete the `/ns/m` "raw explicit JS fastpath" (`tryReadRawExplicitJavaScriptModule`) | **3** | 679 |

**Root cause of the rxjs split.** For any request ending in `.js`, the fastpath read the file raw from disk, skipping Vite. Its relative specifiers were never resolved, so `rewriteImports` joined them without an extension, while Vite-served importers used `.js`. The bisect (`fetch-nsm.mjs` + stage dumps) showed the raw specifier already present in `/ns/m`'s input, while a direct `server.transformRequest` of the same id was fully resolved.

**Remaining 3 (`@csstools/*`):**

- Hoisted packages outside both roots were left as raw Vite `/@fs/` URLs.
- Fixing that fallback (`/@fs/` → `/ns/m/@fs/<abs>`, `rewrite-imports.ts`) doesn't catch these: the packages are **minified**, `…}from"/@fs/…"`, and `rewriteImports`' line-anchored regexes don't match them.
- A lexer-offset rewrite (like `thinPostStep`) would.

**Device result:** with rxjs deduplicated, **the Angular fixture still doesn't boot**. The main thread idles in the run loop and JS logs nothing after the launch bridge. Identity was not the only blocker. The next step is JS-level inspection.

**Unit tests:** with both source changes, 1960/1960 pass under `vitest` directly.

- Under `nx`, the full suite showed 5 `typescript-optional` failures in this worktree only.
- Later, `framework-isolation` and `typescript-optional` hit 5 s timeouts while load average was 113 from an unrelated job. They pass with `--testTimeout=60000`.

**Server mode, re-evaluated (the user's question):** drop it.

- Vite only calls the legacy `handleHotUpdate` for the `client`/`ssr` environments (`node.js:26535-26570`).
- plugin-vue (4 uses) and Analog (1 use) implement only that hook, so their HMR server logic would not run for a custom environment.
- A server consumer also changes app-visible behavior versus `vite build`:
  - `import.meta.env.SSR` becomes true (`:22765`);
  - server resolve conditions and main fields apply (`:33908`);
  - plugins receive `ssr: true`;
  - CSS content is dropped.

## Round 6: client-environment thin mode on the device (`NS_VITE_THIN=1`)

**Implementation** (worktree source, behind the flag):

- `hmr/server/thin/thin-mode.ts`: the one URL rule, `<origin>/ns/v<vite-url>`; the Vite URL is root-relative inside the root and `/@fs/<id>` outside it.
- `hmr/server/thin/thin-route.ts`: the `/ns/v` route. It runs Vite's **client-environment** `transformRequest` and rewrites specifiers by es-module-lexer offsets. Three additions:
  - a core `require()` registration footer;
  - fall-through to the middleware chain for non-module endpoints (Analog's `@ng/component`);
  - an empty-body → `export {}` guard (the iOS loader rejects empty modules).
- `hmr/client/thin-vite-client.ts`: the `/@vite/client` shim (`createHotContext`, `updateStyle`/`removeStyle` → core tagged CSS, `injectQuery`).
- Boot wiring:
  - `bundle.mjs` core URLs (`ns-core-external-urls`);
  - **`/@vite/env` as `bundle.mjs`'s first, external import** (Vite never substitutes `define` in the dev client environment; `vite:define` returns early for `consumer === 'client'`);
  - the session `entryUrl`, the bootstrap's own imports, and a resolver-built import map with no prefix entries.

**Bugs found and fixed while bringing it up:**

1. `__DEV__ is not defined`: fixed by loading `/@vite/env` first, as above.
2. Two cores through **realpath vs symlink**. The CLI runs Vite with `node --preserve-symlinks`, so Vite's alias resolves core to `<app>/node_modules/@nativescript/core`. Any `realpathSync` in URL minting creates a second URL. Rule: **use the resolver's id verbatim**, and run harnesses with `--preserve-symlinks`.
3. Fixture artifact: a `file:` link to `dist/packages/core` doesn't install core's dependencies. Under preserved symlinks, `emoji-regex` resolved to the CLI's v8 CommonJS copy. The fixture now installs core from a packed tarball (`apps/ng/.local/nativescript-core.tgz`).
4. Analog's `@ng/component` endpoint is addressed relative to the component module's URL (`/ns/v/src/app/@ng/component?c=…`). The thin route now falls through to the middleware chain for anything Vite can't transform.
5. **Angular never bootstrapped (pre-existing; affects `/ns/m` too).**
   - The HMR placeholder consumes `launchEvent` at bundle time.
   - `@nativescript/angular` (21.2.0 and 22.0.2) then waits for `launchEvent` forever: its "already launched → `bootstrapRoot`" path is gated on `import.meta['webpackHot']` (`application.ts:460-490`).
   - Proven with a launch-event replay in `launch-bridge.ts`. **The real fix belongs in `@nativescript/angular`**: bootstrap when `Application.hasLaunched()` under any bundler.

**Device result (iOS 26.3 simulator, `@nativescript/ios` 9.1.2-next, CLI 9.1.3-next):**

| | |
|---|---|
| Boot | ✅ Angular renders (`Home` action bar, `Taps: 0`, button); `real app root committed` |
| Requests | 100% under `/ns/v` except session, bootstrap, import map and vendor/deps bundle; one core copy (0 duplicates) |
| Template HMR | ✅ **in place** via Analog + `ɵɵreplaceMetadata`: `angular:component-update — skipping reboot path` → label text changed without a reboot |
| Component `styleUrl` | ❌ dropped (button not red): `ɵɵExternalStylesFeature` is unsupported by `@nativescript/angular` |

**What belongs in `@nativescript/angular`, to get web-like HMR:**

1. `runNativeScriptAngularApp`: if `Application.hasLaunched()`, call `bootstrapRoot` directly, under any bundler. Expose the reboot hooks when `import.meta.hot` exists too, not only `webpackHot`.
2. Support Angular's **external runtime styles**: load `getExternalStyles()` URLs and apply them as component-scoped CSS. That fixes `styleUrl` under Vite dev and gives style HMR the way the web gets it.
3. Root/`page-router-outlet` survival across `ɵɵreplaceMetadata` (the review's root-component special case), so root templates can hot-swap too.
4. Class (`.ts`) edits: Angular on the web does a full reload. On NativeScript the equivalent is an Angular re-bootstrap, not an app restart. Keep that.

## Round 7: Angular 22 + `@nativescript/angular` fixes (web-style HMR)

The `@nativescript/angular` worktree is `~/projects/angular/.claude/worktrees/bootstrap-after-launch`, branch `fix/bootstrap-after-launch`, based on `origin/main` (22.0.2); it is uncommitted. Two changes:

1. **`application.ts`**: `runNativeScriptAngularApp` calls `bootstrapRoot` when `Application.hasLaunched()`, under any bundler. The HMR hooks (`__reboot_ng_modules__` …) are installed under `import.meta.hot` as well as `webpackHot`.
   - ✅ On device, Angular 22 boots with **no** vite-side workaround; the launch-event replay was removed from `@nativescript/vite`.
2. **`nativescript-renderer.ts`**: `componentReplaced(id)` on the renderer factory, the hook Angular's HMR calls (`hmr.ts` `clearRendererCache`), mirroring the web's `DomRendererFactory2`.
   - `EmulatedRenderer` styles now get a per-component tag (`<rootModuleId>:<componentId>`) so one component's CSS can be swapped.
   - The factory gains `ngOnDestroy`, which removes those tags, and `@Injectable()` for `NG2007`.
   - The package has **no unit tests** ("No tests found"), so verification is on the device only.

**Fixture setup:** Angular 22.0.8, Analog 2.9.7, `@angular/compiler-cli`/`@angular/build` 22.0.8, TypeScript 6.0.3. There is an existing NativeScript PR for TypeScript 6, so TS 6 issues are out of scope here.

- `@nativescript/vite`, core and `@nativescript/angular` are installed from **packed tarballs** via `refresh-fixture-packages.sh`.
- Why tarballs: Vite's config loader resolves a `file:`-linked package to its realpath outside `node_modules`, **bundles it as source**, and its dependencies then resolve from `dist/`. That picks up the workspace's Analog 2.1.3 and compiler 21, and the 21 linker fails on Angular 22 (`Unsupported enum value … ɵɵFactoryTarget.Service`).

**Results on device (thin mode):**

| Edit | Result |
|---|---|
| Boot | ✅ Angular 22 renders; component `styleUrl` styles **apply**. Analog 2.9.7 honours `externalRuntimeStyles: false`, so the dropped-styles bug was Analog 2.1.3 behaviour. |
| Template (`.html`) | ✅ in-place via `ɵɵreplaceMetadata`, no reboot (round 6) |
| Component CSS | ⚠️ in-place update arrives and the old CSS is removed (`componentReplaced` works), but **no new styles are applied**. Analog's HMR recompile emits `ɵɵExternalStylesFeature([...hash.css])` even though the boot compile inlined the styles, and `@nativescript/angular` can't load external runtime styles. |

**What's needed for web-like CSS HMR:**

- `@nativescript/angular`'s renderer must support **external runtime styles**, as `DomRenderer` does: read `type.getExternalStyles?.(componentId)`, fetch each URL and apply the text under the component's tag.
- Dev should then use external styles consistently at boot too (flip the NS config's `externalRuntimeStyles` to `true` under HMR), as the Angular CLI does on the web.
- Open design question: how the renderer resolves the relative style URL to the dev server (web uses `document.baseURI`).

## Round 8: Angular external runtime styles (web-style CSS HMR)

**Contract chosen: an injection token with a dev default.**

- `@nativescript/angular` adds `NATIVESCRIPT_STYLE_BASE_URL` (`tokens.ts`). Its default is `globalThis.__NS_DEV_ORIGIN__`, which `@nativescript/vite`'s session bootstrap now sets to the dev server origin.
- `EmulatedRenderer` reads `type.getExternalStyles?.(componentId)`, resolves each URL against that base, and fetches it with **`Accept: text/css`**. Without that header Vite answers a `.css` URL with its CSS-as-JS module, as it would for a JS import rather than a `<link>`.
- It applies the text under the per-component tag, ignores the result if the component was replaced meanwhile, and calls `getRootView()._onCssStateChange()` to restyle existing views.
- `@nativescript/vite` config is unchanged. Analog 2.9.7 inlines styles on the first compile and emits external runtime styles only on HMR recompiles (`shouldEnableExternalRuntimeStyles`). The NS config's `externalRuntimeStyles: false` is a no-op on stock Analog, as its own comment says.

**Device (iOS 26.3 simulator, thin mode, Angular 22):**

| | |
|---|---|
| Boot styles | ✅ inline, applied |
| 1st CSS edit after boot | ✅ **in place**: orange → purple, same pid, no reboot |
| 2nd+ CSS edit | ❌ stalls at overlay "Preparing update (5%)" (fixed in round 9) |
| Template edit | ✅ in place (round 6) |

`hmr-probe.mjs` gets `custom:angular:component-update` for every edit, but only because it never fetches the stylesheet. Round 9 has the real cause.

**Fixture tooling:**

- `refresh-fixture-packages.sh [--skip-build] [vite] [core] [angular]` repacks the named packages, regenerates the lockfile (`file:` tarball deps are cached by integrity otherwise) and deletes `platforms/`. Any core reinstall breaks the native project with "Multiple commands produce …".
- `config-load.mjs` reproduces a transform through Vite's real config loader.
- `hmr-probe.mjs` records server→client HMR messages per edit.

## Round 9: repeated CSS edits — Vite's `css-update`, owned by the renderer

**Cause (found through the inspector, `ns debug ios` + `cdp-console.mjs --expr-file`):** wrapping `__NS_HOT_REGISTRY__.dispatchHotEvent` and the overlay API showed that the device received `ns:hmr-pending` for edits 2+ and nothing else.

- Once the renderer fetches an external style (`<hash>.css?ngcomp=…&e=0` with `Accept: text/css`), Vite records a `?direct` CSS module.
- From then on, Analog's `handleHotUpdate` (`angular-vite-plugin.js:351-390`) takes its `isDirect` branch. It sends a **stock Vite `{type:'update', updates:[{type:'css-update', path}]}`** instead of `angular:component-update`, expecting Vite's browser client to swap the `<link>`.
- The `/ns-hmr` bridge relayed only `type:'custom'` payloads, so the update was dropped.
- This is not thin-mode specific. The legacy pipeline has the same gap.

**Fix (web parity: a pure stylesheet swap, no view recreation):**

- **`@nativescript/vite` server.** `toDeviceRelayPayload` (`hmr/server/device-relay-payload.ts`, spec'd) relays custom events, plus the `css-update` entries of stock `update` payloads. `js-update` stays owned by `ns:hmr-delta`/`ns:angular-update`.
- **`@nativescript/vite` client.** `protocol-dispatch.ts` handles `type:'update'` the way Vite's client does: it fires `vite:beforeUpdate` then `vite:afterUpdate` on the hot registry, then completes the overlay.
- **`@nativescript/angular`.**
  - `NativeScriptRendererFactory` takes a hot context from `__NS_HOT_REGISTRY__.createHotContext('@nativescript/angular/renderer')`. It is absent outside dev, so this is a no-op in release and webpack builds. On `vite:beforeUpdate`, the factory asks each `EmulatedRenderer` whether it loads that path.
  - The renderer compares resolved pathnames, because `getExternalStyles` returns bare `<hash>.css?ngcomp=…` names. On a match it refetches with `t=<timestamp>` and rebuilds its own tag (inline plus external), then calls `_onCssStateChange()`.
  - It can't use `import.meta.hot`: `/ns/m` gives node_modules no hot context, and Vite only detects the dot form.

**Device (iOS 26.3 simulator, thin mode, Angular 22), same pid throughout:**

| | |
|---|---|
| CSS edits ×4 in a row (green → blue → orange → purple) | ✅ each applied in place |
| Tap ×3, then CSS edit | ✅ "Hot taps: 3" kept, button restyled |
| Template edit after CSS edits, then CSS edit | ✅ template swapped with state kept, then restyled (new renderer after `componentReplaced` picks up the update) |

Renderers subscribe through registry-level `__NS_HOT_REGISTRY__.on/off`. That is the device counterpart of Vite's client events, for app-lifetime owners, and is never pruned by a module re-evaluation. A per-module `createHotContext` doesn't fit here.

**Open:**

- **`vite:beforeUpdate` timing.** Listeners are fire-and-forget, so the overlay reports "Updated" before the refetch lands. Vite's client awaits listener promises. The registry could do the same if the overlay timing matters.
- **`.ts` edits break thin mode (reboot path).** Editing `app.component.ts` and others in a thin session reboots Angular, and the reboot fails with `No known component for element ProxyViewContainer`. Its stack loads `/ns/m/node_modules/@nativescript/angular/…`: the reboot re-imports through the legacy `/ns/m` route instead of `/ns/v`, so it creates a second `@nativescript/angular` instance with an empty element registry. `ViewEncapsulation.None` components also don't load external styles yet; only `EmulatedRenderer` does.

## Next

1. A device route: `/ns/e/*` → `environments.nativescript.transformRequest(unwrap(url))` → `thinPostStep`.
2. Session `entryUrl` → `/ns/e/src/main.ts`.
3. Import map, from `configureLoader`: core and its 9 deps → the existing core/deps bundles; `@nativescript/core` externalized in the `nativescript` environment.
4. Run toolbox on an iOS simulator. Check boot, `Frame` navigation and that a TS edit re-imports.
5. Angular/Analog in a workspace that has `@angular/core`.
