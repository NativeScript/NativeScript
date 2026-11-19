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

## Round 10: thin-only, phase 1 (delete what thin never reaches)

DESIGN.md sets the target. Thin is now the only dev mode: `NS_VITE_THIN` is gone.

**Deleted: 88 files, about 17.8k lines** (41 source files, 47 specs):
- the `/ns/m` pipeline: routes, rewriting, device transforms and AST helpers;
- `/ns/core` (bridge and core bundle), `/ns/rt`, `/ns/entry`/`startEntry`, `/ns/node`, `/ns/txn`, and the vendor unifier;
- the shared transform cache;
- the Vue `/ns/sfc` and `/ns/asm` routes;
- the Angular register-only entry rewrite, the `/@ng/component` boot gate, and the component-update ledger.

The strategy interface lost every member only `/ns/m` called. Kept for phase 3: the deps bundle and vendor manifest, plus `constants`, `package-classifier` and `ns-core-cjs-shape`, which those still import.

**Checks:**
- vitest: 1,449 passing.
- The build succeeds. `tsc` has no errors in `packages/vite`; the 261 under `../core` are pre-existing.
- A server-side crawl of toolbox matches the pre-change import map and runtime config, with 0 failures.
- **iOS simulator (Angular 22, same pid):** boot ✅, template edit in place ✅, CSS edit ×2 ✅.

**Known degraded until phases 2–4:** Vue/Solid/TS/React updates (the client still re-imports `/ns/m`/`/ns/sfc` URLs, which now 404), worker HMR URLs (`/ns/m`), and Angular `.ts` edits (the reboot needs hooks released `@nativescript/angular` doesn't have).

## Round 11: phase 2 — Vite's HMR protocol on the device

**Step 1: which Analog mode.** `payload-probe.mjs` (it replaces `hmr-probe.mjs`):
- It boots the fixture's dev server in-process and warms Vite's graph by crawling `/ns/v` from the session entry.
- It emulates the device renderer: after an `angular:component-update` it fetches `/@ng/component` and its external styles with `Accept: text/css`.
- It logs every payload twice: as handed to `server.ws.send` (raw), and as received on Vite's HMR socket with `vite-hmr` + token (wire).
- `--compilation-api` swaps in Analog with `experimental.useAngularCompilationAPI: true`.
- Output: `out/payload-probe-*.json`.

Wire payloads with phase 1's NS strategy plugin removed:

| Edit | Analog default mode (`liveReload: true`) | Compilation-API mode |
|---|---|---|
| (a) `home.component.html` text | `angular:component-update` + `update[js-update …html]` | `full-reload` |
| (b) `home.component.css` color, 1st and 2nd | `update[css-update /<hash>.css?direct&ngcomp=…]` + `update[js-update …css]`; component-update until the device fetched its external style (round 9) | `full-reload` |
| (c) class body `signal(0)`→`signal(10)` | `angular:component-update` + `js-update …ts`: **wrong**, class changes never apply | `full-reload` |
| (d) inline `styles` / `template` in a component `.ts` | `angular:component-update` + `js-update …ts` | `full-reload` |
| (e) non-component `.ts` (`app.routes.ts`) | `full-reload` | `full-reload` |
| (f) root `app.component.html` (run alone) | `angular:component-update` (AppComponent): **wrong for NS** | `full-reload` |

- In the combined run (f) also showed `full-reload`, but only because Analog clears its `classNames` on a non-component `.ts` edit (e).
- Compilation-API mode was re-run after making the probe re-crawl the entry after every `full-reload`, as a device re-imports it, and with the `.html` edit applied twice. Every edit was still a `full-reload`. The served `home.component.ts` contains no `angular:component-update` listener: Analog 2.9.7 in this mode, with the NS options, compiles components without Angular's HMR initializer.
- **Decision:** keep Analog's default mode and add NS rules in the Angular config (DESIGN.md).

**Analog buffers its own sends.** Analog 2.9.7 wraps `server.ws.send` (`hot-update-batch.js`): it buffers `angular:component-update`/`update` and flushes them in a `setTimeout(0)` after the hot-update promises settle. So an NS decision made in `hotUpdate` must not be dropped by a later `post` hook. The NS rule keeps a "stale class" set, cleared by any page full reload.

**Final payloads** (rules in place, fresh build synced into the fixture):

| Edit | Wire |
|---|---|
| (a) `.html` | `angular:component-update` + `update[js-update …html]` |
| (b) `.css` ×2 | `update[css-update /<hash>.css?direct&ngcomp=…]` + `update[js-update …css]` |
| (c) class body | **`full-reload`** (triggeredBy `home.component.ts`) + `update[js-update …ts]` (no-op on device: Angular components don't `hot.accept`) |
| (d) inline styles / template | `angular:component-update` + `js-update …ts` |
| (e) non-component `.ts` | `full-reload` |
| (f) root `.html` (alone) | **`full-reload`** (triggeredBy `app.component.ts`) + `js-update …html` |

The probe connects with the session's `wsUrl` (`ws://<lan-ip>:<port>/vite-hmr?token=…`, `wsProtocol: 'vite-hmr'`): Vite accepted the upgrade.

**Device check (iOS simulator).**
- Working: template edits in place with state kept, CSS ×2 in place, and class edits ×2, each one full reload on the same pid with no NG0912 and no stacked launch handlers.
- **Bug:** a root `.html` edit full-reloads, Angular re-bootstraps, and then the screen is blank.

The cause is the Phase-1 deletion of the `/@ng/component` boot gate:
- Each component's `_HmrLoad(Date.now())` boot fetch gets Analog's real payload, because `lastInvalidationTimestamp` lives for the server's lifetime.
- `ɵɵreplaceMetadata` on the root then removes `page-router-outlet`.

`payload-probe.mjs` now emulates those boot fetches after every reload:
- **Before the fix** (`--only a,f`): `AppComponent` 1388 b and `HomeComponent` 3380 b, both real update payloads.
- **After the fix**: 26 b each (`export default undefined;`). Live updates still get the real payload: (a) 3378 b, (d) 1524 b.

The gate is a per-id ledger of the latest sent `angular:component-update`, plus a middleware ahead of Analog and the thin route (DESIGN.md).

**Verified off device:**
- Vite 8.3.8's import analysis injects `import.meta.hot = createHotContext("/node_modules/…")` into a served `node_modules` file when it is used and `optimizeDeps` is disabled.
- Webpack 5.99.7 compiles `import.meta.hot` in a library to `undefined` (`if (import.meta.hot)` → `if (false) {}`), with no errors and no warnings. `new URL('/', import.meta.url)` becomes an asset import, and `new URL(import.meta.url)` leaks a `file://` build path unless it sits behind `if (import.meta.hot)`.
- `ɵresetCompiledComponents` (Angular 22) clears `GENERATED_COMP_IDS`, the map behind NG0912.

**Globals inventory** (`packages/vite`; native runtimes read none of them; B = `bundle.mjs`, V = `/ns/v`, N = node):

*Crossing the B ↔ V boundary:*
- `__NS_HMR_BOOT_COMPLETE__` (B writes, `boot-complete.ts`; read by the `/__ns_dev__/client` bootstrap and `entry-runtime`)
- `__NS_HMR_APP_CSS__` and `__NS_HMR_APP_CSS_AST__` (main-entry → entry-runtime)
- `__NS_DEV_KNOWN_APPLICATIONS__` (root-placeholder → entry-runtime)
- `__NS_HMR_DEV_OVERLAY__` (dev-overlay → `overlay-driver`)
- `__NS_HTTP_ORIGIN__` (session-bootstrap → generated worker code)
- `__NS_CORE_MODULES__` (thin-route core footer → main-entry require shim, vendor-device-shim)
- `__NS_CJS_SHAPE__` and `__NS_CJS_SHAPE_CACHE__` (both sides)
- `__nsVendorRegistry`, `__nsRequire` and `__nsVendorRequire` (vendor-bootstrap → root-placeholder, core-aliases-early, vendor-resolve; phase 3)
- `__NS_HMR_WORKERS__` (B installs, V sweeps on full reload)
- `__NS_ENV_VERBOSE__` and the seeded defines `__DEV__`, `__ANDROID__`, `__IOS__`, `__VISIONOS__`, `__APPLE__` and others (seeded in B, read by raw-served core and `@nativescript/angular` for `__APPLE__`)
- `__NS_DEV_PLACEHOLDER_ROOT_VIEW__` and `__NS_DEV_PLACEHOLDER_ROOT_EARLY__` (root-placeholder → core `application.ios.ts:724`)

*B-only:*
- `__NS_DEV_BOOT_*` (5), `__NS_DEV_ORIGINAL_APP_RUN__`, `__NS_DEV_PATCHED_*` (3), `__NS_DEV_PLACEHOLDER_{APPLICATION,LAUNCH_HANDLER,RESTORE_TIMER}__`, `__NS_DEV_RESTORE_PLACEHOLDER__`
- `__NS_HMR_DEV_OVERLAY_STATE__`, `__NS_HMR_OVERLAY_POSITION__`, `__NS_HMR_ANDROID_SAFE_INSETS__`, `__NS_HMR_PROGRESS_OVERLAY_ENABLED__`
- `__NS_HMR_BOOT_LAST_PROGRESS__`, `__NS_IMPORT_MAP_CONFIGURED__`, `__NS_PLACEHOLDER_DIAG_LAST_FINALIZE__`, `__NS_TELEMETRY__`
- seams with no writer: `__NS_DEV_TELEMETRY__`, `__NS_HMR_IMPORT__`

*V-only:*
- `__NS_HMR_APPLY_CSS__`, `__NS_HMR_HTTP_APP_CSS_APPLIED__`, `__NS_DEPS_MODULES__`, `__NS_DOCUMENTS_PATH__`
- `__nsBaseRequire`, `__nsVendorHash`

*Node:* `__NS_VENDOR_MANIFEST__` (write-only), `__NS_BRIDGE_NONCANON__` (`websocket-core-bridge.ts`, a diagnostic).

*Read only from core:* `__NS_LAST_XML_ERROR__`.

*Dead:* `__NS_ENTRY_TRACE__`, `__NS_HMR_BOOT_LAST_PROGRESS_AT__`, `__NS_HMR_BOOT_LAST_YIELD_AT__`.

*Read with no writer left:*
- `__NS_HMR_BOOT_MODULE_COUNT__` and `__NS_HMR_BOOT_LAST_MODULE__` (the boot heartbeat's count is always 0)
- `__NS_RECORD_MODULE_PROVENANCE__`
- `__NS_ANGULAR_APP_REF__` and `__reboot_ng_modules__` (root-placeholder diagnostics)

*Write-only:*
- `__NS_APP_ROOT_DIR__`, `__NS_APP_ROOT_VIRTUAL__`, `__NS_TARGET_FLAVOR__`, `__NS_WEBPACK__`, `__TEST__`, `__CI__`
- `__NS_ENTRY_ERROR__`, `__NS_BOOT_TRACE__`, `__NS_HMR_BOOT_IMPORT_STARTED_AT__`, `__NS_ORIG_{GET_REGISTERED_MODULES,MODULE_EXISTS,LOAD_MODULE}__`
- `__nsVendorAliases`, `__nsResolveVendor`, `__nsRequireIsShim`, `__nsVendorManifest`

*Deleted in phase 2:* `__NS_HOT_REGISTRY__`, `__NS_DEV_ENTRY_URL__`, `__NS_DEV_ORIGIN__`, `__NS_HMR_WS_URL__`, `__NS_DEV_SESSION__`, `__NS_DEV_INSTALL_LAUNCH_BRIDGE__`, `__NS_REGISTER_CSS__`, `__NS_PENDING_CSS__`, `__NS_CLIENT_STRATEGY_URL__`, `__NS_CLIENT_STRATEGY_READY__`/`RESOLVE`, `__NS_HMR_ON_UPDATE__`, `__NS_HMR_REGISTER_COMPONENT__`, the `__NS_HMR_BROWSER_RUNTIME_*` flags, `__NS_HMR_IMPORT_NONCE__`, `__NS_DEV_RESET_IN_PROGRESS__`.

*`@nativescript/angular`:*
- It reads `__APPLE__` (define) and the runtime's `__drainMicrotaskQueue`, and keeps `__ngRegisteredViews` as an internal guard.
- It writes the webpack-only `__reboot_ng_modules__` family and `__onLiveSyncCore` only under `import.meta['webpackHot']`.
- It no longer reads `__NS_HOT_REGISTRY__` or `__NS_DEV_ORIGIN__`.

## Round 12: phase 2c, soft reboot through the app-entry HMR boundary

The design is in DESIGN.md ("Soft reboot", "Soft reboot vs app restart", "Angular"). It replaces the round-11 in-process evict-everything reload: a Vite `full-reload` is now an app restart, and `hot.data` is back to Vite's semantics.

**How Analog's in-place marking reaches the graph.** In the prototype, with `accept()` injected into the entry and the NS rules off:
- a class edit still produced `angular:component-update` plus a `js-update` of the component itself;
- `home.component.ts` was `isSelfAccepting=false` after the crawl;
- in a `post` client `hotUpdate`, the very `EnvironmentModuleNode` came back with an own `isSelfAccepting: true`, so Analog's `markModuleSelfAccepting` takes effect on the graph node and stops propagation at the component.

Restoring the pre-hook value in a `post` client `hotUpdate` makes Vite propagate to the entry. The first attempt, handing Vite other node objects from `handleHotUpdate`, failed with `removeTimestampQuery(undefined)`.

**Which modules re-run.**
- Vite stamps `lastHMRTimestamp` on the edited module's whole importer chain even when a closer boundary accepts the edit. For a template edit it stamped `main`, `app.routes` and `home.component.ts` although nothing re-evaluates.
- So `rerun` is each `js-update`'s `acceptedPath` plus the imports reachable from it that carry the update's timestamp, which is exactly what `import(acceptedPath?t=)` re-evaluates.
- Spec'd on a real Vite server (`entry-boundary.spec.ts`) over the tree main → one → child1, main → child2, child1 → child2, main → three → four:
  - child1 edited → {main, one, child1};
  - child2 edited with child1 self-accepting → boundaries child1 and main, re-running {child2, child1, one, main};
  - child1 edited while self-accepting → {child1} only, though Vite stamped `one` and `main`.

**`ns:rerun`, not a field on the update.** Analog's `hot-update-batch` buffers `update` payloads and flushes them as new objects (merging saves), so the module sets travel as a custom event right before each `update` with a `js-update`. They are matched by timestamp. The edited files are keyed by the save's timestamp, because Analog's own `css-update` payload for the same save comes first.

**Final payloads** (`payload-probe.mjs`, both builds synced into the fixture; `?t=` crawl and boot-fetch emulation after each reboot):

| Edit | Wire | `ns:rerun` (`changed` → `rerun`) |
|---|---|---|
| (a) `.html` ×2 | `angular:component-update` + `js-update …html` | html → {html} |
| (b) `.css` ×2 | `css-update /<hash>.css?direct…` + `js-update …css` | css → {css} |
| (c) class body | **`js-update /src/main.ts`**; Analog's component update dropped | home.component.ts → {main, app.routes, home.component.ts} |
| (d) inline styles / template | `angular:component-update` + `js-update …component.ts` | → {the component} |
| (e) `app.routes.ts` | `js-update /src/main.ts` | → {main, app.routes} |
| (s) service class body | `js-update /src/main.ts` | probe.service.ts → {main, app.routes, probe.service} |
| (f) root `.html` | `js-update /src/main.ts` | app.component.html → {main, app.component.ts} |
| (g) global `app.css` | `ns:css-updates` with the CSS text | — |
| (i) `angular:invalidate` | `full-reload` (restart) | — |
| (r1) edit in `node_modules/@nativescript/core` | `ns:restart-required` + IPC `nativescript:restart` | — |
| (r2) `server.restart()` | reconnect with the original `wsUrl`, `connected`, then `ns:restart-required` + IPC | — |
| (r3) device `ns:restart` | `ns:restart-required` + IPC | — |

After each reboot, the boot fetches of `AppComponent` and `HomeComponent` metadata still get the 26-byte no-op from the `/@ng/component` gate.

**Device client.**
- An entry update runs `vite:beforeUpdate` → `nativescript:beforeReboot` → the targeted `nativescript:beforeRerun` → entry `dispose` (`prepareHmrReboot`) → `import(main.ts?t=)` → `whenHmrRebootSettled` (≤ 15 s) → `nativescript:afterReboot` → `vite:afterUpdate`.
- Payloads are built on the device with `createUpdateModules` (`isRerun`, `isChanged`, `modules`).
- Types: `@nativescript/vite/client` augments Vite's `CustomEventMap`; a type-level spec has a negative control.

**`@nativescript/angular`.**
- `prepareHmrReboot` and `whenHmrRebootSettled` (bootstrap, then `ApplicationRef.whenStable()` capped at 5 s, then participant restore; never rejects).
- `NATIVESCRIPT_HMR_PARTICIPANTS` and `requestNativeScriptAppRestart`.
- The `vite:beforeFullReload` listener is gone.
- The webpack harness shows 0 errors and 0 warnings, with `import.meta.hot` folded to `undefined`/`if (false) {}`.
- Jest covers the snapshot helpers. The reboot state machine is only compiled, not run.

**Not verified on a device:** everything above.

## Round 13: phase 2d, errors without restarting

The design is in DESIGN.md ("Failures"): a compile check gates every update, a reboot that fails at evaluation stays recoverable, every `failed` overlay offers "Restart app", and a device that connects having missed updates gets one catch-up reboot.

**Analog doesn't throw for a broken template.** With type checking disabled, a template that doesn't parse (`count(`) compiles to the plain `@Component` decorator with no `ɵcmp`, so the transform succeeds and the device would only fail when it evaluates the component. The Angular `verifyTransform` catches that output and recovers the message with the app's own `@angular/compiler` `parseTemplate`.

**Analog's batched flush uses object form.** In the first probe run of (e2a), `angular:component-update` reached the wire 3 ms before the `error`: Analog flushes its buffered notifications as `{ type: 'custom', event }` objects, which the gate only recognized as strings. The gate now holds both forms.

**Wire payloads** (`payload-probe.mjs --only e`, default Analog mode, packages rebuilt from both worktrees; each new edit has automatic expectations: **12/12 ok**, also 12/12 in the full run, where the e-edits run after (a)–(i) and before the restart edits (r1)–(r3), which end a device session):

| Edit                                                           | Wire                                                                                                                                                                          |
| -------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| (e1a) syntax error in `home.component.ts`                      | only `error`: `home.component.ts:15:33: ')' expected` (Analog/esbuild). The raw `angular:component-update` and entry `update` are suppressed                                  |
| (e1b) fix it                                                   | `ns:rerun` (rerun {main, app.routes, home.component.ts}) + entry `js-update`                                                                                                  |
| (e2a) template compile error in `home.component.html`          | only `error`: "Angular could not compile the component in home.component.ts: Parser Error: Unexpected end of expression…". The in-place `angular:component-update` is dropped |
| (e2b) fix it                                                   | `angular:component-update` + `ns:rerun` (rerun `[]`) + the template `js-update`: applied in place                                                                             |
| (e3a) service throws at evaluation                             | the transform is fine, so `ns:rerun` (rerun includes `probe.service.ts`) + entry `js-update`; the device side is covered by specs                                             |
| (e3b) fix it                                                   | entry reboot                                                                                                                                                                  |
| (e4a) reconnect, no edits                                      | `connected` only, no catch-up                                                                                                                                                 |
| (e4b) template edit while connected                            | delivered (reboots via `main.ts`; see below)                                                                                                                                  |
| (e4c) `.css` edit                                              | in place                                                                                                                                                                      |
| (e4d) reconnect after delivered edits                          | no catch-up                                                                                                                                                                   |
| (e4e) template edit while the socket is closed, then reconnect | exactly one catch-up, +3 ms after `connected`: `ns:rerun` (changed {main, app.routes, home.component.ts}, rerun includes home.component.ts) + entry `js-update`               |
| (e4f) reconnect after the catch-up                             | nothing                                                                                                                                                                       |

- (e2b)'s `rerun` is `[]`, not round 12's {html}: `rerun` comes from served stamps and leaves out templates, which are never device modules.
- (e4b) reboots only because (e3)'s non-component `.ts` edits made Analog clear its `classNames` (round 11, (f)). Run alone, it applies in place.
- The catch-up's `changed` is every module Vite stamped since it was served, importers included, not only the edited file.

**Latency of the compile check** (the update reaching `server.ws.send` → the first gated payload on the wire, warm graph): 1–6 ms across (e) and (e1)–(e4): e1a 6 ms, e1b 5, e2a 3, e2b 3, e3a 2, e3b 3, css 1. In the full run every edit (a)–(f) also gates in 1–6 ms, except the first edit after boot, (a), at 47 ms (cold). Save → wire stays at ~165–385 ms, dominated by Vite's watcher and Analog's compile. The check mostly re-reads transforms Analog already produced and Vite caches; the work moves forward rather than adds, since the device would fetch those modules anyway.

**Specs.**

- `update-gate.spec.ts`: (e1) sends only `error`, and the fix re-runs everything since; `changed` accumulates over failed saves; gated events in string and object form; no `error` to an empty channel; catch-up reboot; restart without an entry boundary; a normal boot gets no catch-up.
- `client/index.spec.ts`: an `error` payload only shows the overlay; a failed reboot import shows the overlay, keeps the process and the next update retries; eviction limited to stack URLs inside `rerun`; a retry failing again outside the chain restarts; a throwing or rejecting teardown (`dispose`, a `beforeReboot` listener) restarts; a settled provider that rejects or resolves `{ error }` is a failed boot.
- `@nativescript/angular`: `prepareHmrReboot` is a no-op on the retry; snapshots from the last good app survive a failed attempt and the second teardown, and restore when the retry succeeds; `whenHmrRebootSettled()` resolves `{ error }` and never rejects.

**Checked:** the probe's wire payloads and the specs above. **Not verified on a device.**

**Open questions.**

- Per-device tracking: served modules and delivered saves are per server, so with two devices, one booting while the other is connected can miss an update.
- A teardown that throws during a retry, when the app is already torn down, restarts. Should it be tolerated?
- A bootstrap failure never escalates to a restart; it keeps retrying.
- The catch-up's `changed` lists every module stamped since it was served, importers included, not only the edited files.

## Round 14: phase 3a, defines and globals

The design is in DESIGN.md ("Globals", "Defines", "Dev globals").

**Defines.** `config.define` (`getGlobalDefines`) is the single source. The deleted seed (`virtual:ns-defines-seed`, `getRuntimeSeedValues`, `getRuntimeDefineValues`, `buildGlobalSeedStatements`, and the rule that seed and `define` must agree) was redundant. Its values were a subset of `define` plus bare `isIOS`/`isAndroid`, which nothing read. As a bundled module it evaluated after the externalized core graph, so served core already took its values from `/@vite/env`. `/@vite/env`, the first import of `bundle.mjs`, is now the only installer, and building `bundle.mjs` with HMR active fails when no device-reachable origin resolves.
- **Kept**, shared contract with `@nativescript/webpack` or read by core and app code: `__DEV__`, `__ANDROID__`, `__IOS__`, `__VISIONOS__`, `__APPLE__`, `__COMMONJS__`, `__NS_WEBPACK__`, `__NS_ENV_VERBOSE__`, `__UI_USE_XML_PARSER__`, `__UI_USE_EXTERNAL_RENDERER__`, `__CSS_PARSER__`, `global.isIOS`/`global.isAndroid`, `process.env.NODE_ENV`, `__non_webpack_require__`.
- **Kept**, no reader in this repo but generic app-facing names: `__TEST__`, `__CI__`.
- **Kept**, read only by bundled overlay code and therefore substituted: `__NS_HMR_PROGRESS_OVERLAY_ENABLED__`. Its `globalThis` fallback is deleted.
- **Deleted**, no reader in vite, core, webpack5 or `@nativescript/angular`: `__NS_TARGET_FLAVOR__`, `__NS_APP_ROOT_DIR__`, `__NS_APP_ROOT_VIRTUAL__`; and the seed-only bare `isIOS`/`isAndroid`.
- Bundled member reads `g.__ANDROID__` (`core-aliases-early.ts`, `root-placeholder.ts`) are bare identifiers now, so substitution covers them.
- Unchanged: user `define`s, and the deps bundle's esbuild `define` (`setUserDefineEntries`/`getUserDefineEntries`).

**The dev object.** `globalThis[Symbol.for('nativescript.dev')]`, typed `NativeScriptDevGlobals` (`hmr/shared/runtime/dev-globals.ts`).
- Accessor `nsDev()`, stateless and dependency-free, so the bundled and served copies resolve the same object. `NS_DEV_EXPR` is the same lookup for code generated as strings.
- Members: `bootComplete`, `appCss`, `appCssAst`, `knownApplications`, `overlay`, `httpOrigin`, `coreModules`, `cjsShape`.
- Rule: state inside one world is module state shared by ESM import (each served module has one URL, `bundle.mjs` evaluates once). Only state crossing worlds goes on the dev object.

**Globals, before → after** (round-11 inventory; B = `bundle.mjs`, V = `/ns/v`, N = node):

| Global | Before (writer → readers, world) | After | Action |
|---|---|---|---|
| `__NS_HMR_BOOT_COMPLETE__` | `boot-complete` → `/__ns_dev__/client` bootstrap, `entry-runtime` (B → V) | `bootComplete` | dev object |
| `__NS_HMR_APP_CSS__`, `__NS_HMR_APP_CSS_AST__` | `main-entry` → `entry-runtime` (B → V) | `appCss`, `appCssAst` | dev object |
| `__NS_DEV_KNOWN_APPLICATIONS__` | `root-placeholder` → `entry-runtime` (B → V) | `knownApplications` | dev object |
| `__NS_HMR_DEV_OVERLAY__` | `dev-overlay` → `overlay-driver` (B → V) | `overlay` | dev object |
| `__NS_HTTP_ORIGIN__` | `session-bootstrap` → generated worker code (B → V) | `httpOrigin` | dev object |
| `__NS_CORE_MODULES__` | thin-route core footer → `main-entry` require shim, `vendor-device-shim` (V → B, V) | `coreModules` | dev object |
| `__NS_CJS_SHAPE__` | `main-entry` → core footer, `vendor-device-shim` (B → V) | `cjsShape` | dev object |
| `__NS_CJS_SHAPE_CACHE__` | `main-entry` (B) | a local of the generated entry | module state |
| `__NS_IMPORT_MAP_CONFIGURED__` | `session-bootstrap` (B) | `session-bootstrap.ts` | module state |
| `__NS_HMR_BOOT_LAST_PROGRESS__` | `boot-progress` (B) | `boot-progress.ts` | module state |
| `__NS_HMR_DEV_OVERLAY_STATE__` | `dev-overlay-shared` (B) | `dev-overlay-shared.ts` | module state |
| `__NS_HMR_ANDROID_SAFE_INSETS__` | `dev-overlay-tree` (B) | `dev-overlay-tree.ts` | module state |
| `__NS_HMR_WORKER_TRACKING_INSTALLED__` (not in round 11) | `worker-tracking` (B) | a `WeakSet` of scopes in `worker-tracking.ts` | module state |
| `__NS_DEV_RESTORE_PLACEHOLDER__`, `__NS_DEV_PATCHED_RESET_ROOT__` | `root-placeholder` → `core-aliases-early`, `session-bootstrap` (B) | new `placeholder-hooks.ts`, dependency-free because `core-aliases-early` is in release bundles too | module state |
| `__NS_DEV_PATCHED_ANDROID_INIT__` | `core-aliases-early` (B) | `core-aliases-early.ts` | module state |
| `__NS_DEV_ORIGINAL_APP_RUN__`, `__NS_DEV_PLACEHOLDER_{APPLICATION,LAUNCH_HANDLER,RESTORE_TIMER}__`, `__NS_DEV_PATCHED_RESET_ROOT_VIEW__`, `__NS_PLACEHOLDER_DIAG_LAST_FINALIZE__` | `root-placeholder` (B) | `root-placeholder.ts` | module state |
| `__NS_DEV_BOOT_*` (5) | `root-placeholder`, `dev-overlay-tree` (B) | accessors in `dev-overlay-tree.ts` | module state |
| `__NS_HMR_APPLY_CSS__` | `entry-runtime` → `css-handler` (V) | new `app-css-applier.ts`; both import it relatively, so one URL | module state |
| `__NS_HMR_HTTP_APP_CSS_APPLIED__` | `entry-runtime` (V) | a local of `entry-runtime.ts` | module state |
| `__NS_ENTRY_TRACE__` | dead | — | delete |
| `__NS_ENTRY_ERROR__` | `main-entry`, write-only | `console.error` kept | delete |
| `__NS_BOOT_TRACE__` | `boot-timeline` `publishBootTrace`, write-only | the verbose timeline log kept | delete |
| `__NS_HMR_BOOT_LAST_PROGRESS_AT__`, `__NS_HMR_BOOT_LAST_YIELD_AT__` | dead | — | delete |
| `__NS_HMR_BOOT_IMPORT_STARTED_AT__` | write-only | — | delete |
| `__NS_HMR_BOOT_MODULE_COUNT__`, `__NS_HMR_BOOT_LAST_MODULE__` | read by the boot heartbeat, no writer | the count axis and `formatBootImportDetail` deleted too; progress is elapsed time only | delete |
| `__NS_ORIG_{GET_REGISTERED_MODULES,MODULE_EXISTS,LOAD_MODULE}__`, `globalThis.__nsOrigRequire` | `main-entry`, write-only | `__nsOrigRequire` stays a local `var` of the generated require shim | delete |
| `__NS_ANGULAR_APP_REF__`, the `__reboot_ng_modules__` read | `root-placeholder` diagnostics, no writer under Vite | — | delete |
| `__NS_BRIDGE_NONCANON__` | `websocket-core-bridge` diagnostic (N) | — | delete |
| `__NS_ENV_VERBOSE__` on the Node side | `helpers/logging.ts` fallback (N) | the device define is kept | delete |
| seeded defines (`__DEV__`, `__ANDROID__`, …) | `virtual:ns-defines-seed` (B) → served core, `@nativescript/angular` | `/@vite/env` | see Defines |
| `__nsVendorRegistry`, `__nsRequire`, `__nsVendorRequire`, `__nsBaseRequire`, `__nsVendorHash`, `__nsVendorManifest`, `__nsVendorAliases`, `__nsResolveVendor`, `__nsRequireIsShim`, `__NS_DEPS_MODULES__`, `__NS_DOCUMENTS_PATH__`, `__NS_VENDOR_MANIFEST__`, `__NS_RECORD_MODULE_PROVENANCE__` | vendor bootstrap and deps bundle (B, V, N) | unchanged | kept until phase 3c |
| `__NS_DEV_PLACEHOLDER_ROOT_VIEW__`, `__NS_DEV_PLACEHOLDER_ROOT_EARLY__` | `root-placeholder` → core `application.ios.ts` (B → V) | unchanged | kept, core-owned |
| `__NS_LAST_XML_ERROR__` | core `ui/builder` → `root-placeholder` (V → B) | unchanged | kept, core-owned |
| `__NS_HMR_OVERLAY_POSITION__` | app → `dev-overlay` (B) | unchanged | kept, app-facing override |
| `__NS_DEV_TELEMETRY__`, `__NS_TELEMETRY__` | manual opt-in → `core-aliases-early` (B) | unchanged | kept, opt-in diagnostics |
| `__NS_HMR_IMPORT__` | no writer → `session-bootstrap` (B) | unchanged | kept, optional hook |
| `__NS_HMR_WORKERS__` | `worker-tracking` (B); the sweeper has no caller | unchanged | kept; dev-object candidate with worker HMR |

Also deleted: `hmr/server/ns-core-cjs-shape.ts`. Only `hasExistingDefaultExport` was live; it moved into `deps-bundle.ts`.

**Checked:**
- vitest 1196/1196. The suite dropped from 1250 because the specs of deleted code went with it.
- `tsc -p tsconfig.lib.json`: 261 errors, all under `../core`, the same as before.
- `payload-probe.mjs`, full run: 12/12 ok. The wire payloads are identical to the pre-change run, apart from timestamps.
- `thin-crawl.mjs` (Angular): 669 modules, up from 667. The two new ones are `dev-globals.js` and `app-css-applier.js`, each under one URL. 0 failures, 0 duplicates, 505 import-map entries.
- `/ns/v/@vite/env`: 18 keys, 21 before, minus the three deleted defines. User defines, including dotted `process.env.*` keys, reach it.
- `bundle.mjs` (HMR): it has no seed and its first import is `/@vite/env`. Defines are substituted, with no bare `__DEV__`/`__APPLE__`/`__ANDROID__`/`__IOS__` left. The hash is stable across two builds. A release bundle contains no `nativescript.dev` and no `/@vite/env`.

**Not verified on a device.**

**Open questions.**

- `package.json` still exports `./hmr/shared/runtime/dev-overlay` and `./hmr/shared/runtime/boot-complete`. An external importer gets a second module instance with empty module state.
- `websocket-core-bridge.ts` still holds `/ns/core` bridge code; `deps-bundle.ts` imports some of its helpers.
- `getGlobalDefines`'s `flavor` parameter is unused.
- The deps-bundle disk cache key hashes the defines, not the generated shim text.

## Round 15: phase 3b, plain Vite URLs

The design is in DESIGN.md ("Serving: plain Vite URLs", "Module identity", "Failures" → boot race).

**What changed.**
- **Device URLs:** the device fetches `<origin><vite-url>`, and Vite's own middleware answers every module request.
  - Gone: the `/ns/v` prefix, the thin route (`hmr/server/thin/`) and every `/ns/*` route.
  - NS endpoints are under `/__ns_dev__/`: `session`, `client`, `import-map.json`, `vendor.mjs`, `vendor-manifest.json`, `deps-bundle.mjs`.
- **`/@vite/client`** is our device client, through `nsViteClientPlugin`, a `pre` `resolveId`. Its graph URL is `/@vite/client.js`.
- **One middleware ahead of all others** (`device-requests.ts`, `useFirst`):
  - strips `__ns_dev_nonce`;
  - records served modules for the catch-up;
  - absolutizes literal dynamic `import('/…')` in JavaScript responses (`absolute-dynamic-imports.ts`). This is the interim for the iOS runtime's filesystem resolution of non-HTTP dynamic specifiers, and it runs at response time so Vite's soft-invalidation `?t=` re-stamping keeps working.
- **Core registration footer:** a serve-only, client-environment `transform` (`core-registration.ts`).
- **`fs.allow`:** keeps `searchForWorkspaceRoot` first and adds the core and `@nativescript/vite` package directories.
- **`allowedHosts`:** gets the `NS_HMR_HOST` hostname.
- **Import map** (`buildImportMap`):
  - targets must be regular files;
  - every target is registered in Vite's `safeModulePaths`;
  - the deps bundle's bare `@nativescript/core[/*]` imports get exact keys.
  The last three items fixed failures that pre-date this phase (below).
- **Canonicalization:** down to `preserveQueryFor: ['/@ng/component']` plus volatile patterns.
- **Deleted:**
  - `websocket-module-specifiers.ts` and `websocket-core-bridge.ts` (the live helpers moved to `deps-bundle-specifiers.ts`);
  - `boot-recording.ts`;
  - `cjs-named-exports.ts`;
  - the empty-body guard. By the code at runtime `main`, the runtime accepts empty bodies; this is unverified on a device.
- **Boot race:**
  - **Restart-time race:** a `pre` `hotUpdate` rule links an edited `templateUrl`/`styleUrl` to its component (`hmr-payload-rules{,-plugin}.ts`).
  - **Catch-up rule:** a served module is missed only when something compiled into it was edited after it was served and not delivered (`update-gate.ts`). Vite's re-stamping of importers no longer counts.
- **The client's `injectQuery`** prefixes the origin to root-relative results.
- **Spike tools:**
  - `thin-crawl.mjs` was rewritten on top of `device-resolve.mjs`, which resolves imports the way the iOS runtime does: static root-relative specifiers by URL; dynamic ones must be absolute.
  - Probe case r8 is new: the helper of a lazy route edited, and the lazy import must be re-stamped.
  - Deleted: `crawl.mjs`, `dupes.mjs`, `fetch-nsm.mjs` and `compare.mjs`, which drove `/ns/*`. Rounds 1–5 above refer to them; they are in git history.

**Crawl failures found while verifying.** All three pre-date 3b.
1. **Toolbox, 403 on an import-map target outside `fs.allow`** (`@valor/nativescript-websockets`). Vite serves a file outside `fs.allow` only once its own import analysis has resolved it (`config.safeModulePaths`). Import-map targets are resolved for the device, not by import analysis, so they were never registered. Here the trigger was this nested worktree, whose `node_modules` links dangle into the main checkout. Real layouts that hit it: an aliased out-of-tree checkout, or a global pnpm store. Fix: register each target file in `safeModulePaths`.
2. **Both apps, 404 on `nativescript-theme-core`.** `base.ts` aliases it to its package directory, it is CSS-only, and `existsSync` accepted the directory. Fix: only regular files become map targets.
3. **Toolbox, bare `@nativescript/core/http` in `deps-bundle.mjs` with no map entry** (from `@nativescript/imagepicker`). The bundle keeps core imports bare for the map, but the map has had no core subpath keys since `ed72bef83` dropped the `/ns/core/` prefix. Fix: `depsBundleCoreSpecifiers` lexes the bundle's bare core imports, from cached or fresh code, and the route adds them as exact keys.

**Checked** (final build, synced into the fixture; every run sequential):
- **vitest:** 1039/1039 in 92 files. The suite dropped from 1196 because the specs of deleted code went with it.
- **`tsc -p tsconfig.lib.json`:** 261 errors, all under `../core`, the same as before. `tsconfig.spec.json` has 3 errors in `packages/vite`, on lines unchanged from HEAD.
- **Prettier:** clean on every changed file.
- **`thin-crawl.mjs`, Angular** (`apps/ng`): PASS, 0 failures, 0 duplicates, 0 `/ns/` URLs.
  - **Modules:** 669, the same as round 14. 1478 with every import-map target.
  - **Import map:** 504 entries, one fewer than before because `nativescript-theme-core` is gone.
  - **Device requests by prefix:** `/node_modules` 660, `/src` 4, `/__ns_dev__` 3, `/@vite` 1, `/@id` 1.
  - **All requests by prefix:** `/node_modules` 1442, `/@id` 27, `/src` 4, `/__ns_dev__` 3, `/@vite` 1, `/@fs` 1.
  - **Also:** 0 empty 200 bodies, 0 bare specifiers missing from the map, 0 non-absolute dynamic imports, and 4 non-literal dynamic imports (listed, not followed).
  - **Nonce:** a `?__ns_dev_nonce` request returns the same body and adds no graph node.
- **`thin-crawl.mjs`, TypeScript** (`apps/toolbox`): PASS, 0 failures, 0 duplicates, 0 `/ns/` URLs.
  - **Modules:** 281; 296 with every import-map target.
  - **Import map:** 11 entries, `@nativescript/core/http` included.
  - **Device requests by prefix:** `/@fs` 264, `/node_modules/.vite` 9, `/__ns_dev__` 3, `/@id` 3, `/src` 1, `/@vite` 1.
  - **All requests by prefix:** `/@fs` 270, `/node_modules/.vite` 16, `/__ns_dev__` 3, `/@id` 3, `/node_modules` 2, `/src` 1, `/@vite` 1.
- **`payload-probe.mjs`, full run:** 17/17 ok, and the device could load every import.
  - **Boot race:** r4 0 catch-ups, r5 0, r6 1, r7 0, all fresh. r6 is the only case where the device had already loaded the stale component.
  - **r8:** `app.routes.ts`'s lazy import of `home.component.ts` carries the new `?t=`.
- **`payload-probe.mjs --only r4,r5,r6,r7,r8 --fresh-plugins`:** 5/5 ok, with the same catch-up counts.
- **`boot-bundle-hash.mjs`** (Angular): the `bundle.mjs` hash is stable across two builds.
  - The core URLs baked into `bundle.mjs` were not crawled (`thin-crawl --bundle`), so a mismatch with Vite's graph URLs, which would mean a second core, is unchecked.
- **Static scan:** no `/ns/(v|m|core|import-map|deps|vendor)` in `packages/vite` sources or `dist/packages/vite`. The only hits are CHANGELOG history.

**Not verified on a device.** Device checklist:
- boot Angular through the lazy home route, which exercises the dynamic-import rewrite;
- an empty module body;
- template and style edits in place;
- class edits that reboot;
- the boot race after touching `vite.config.mts`;
- the toolbox with imagepicker, i.e. `core/http` through the map;
- one `@nativescript/core` instance: `bundle.mjs` externals and served core share URLs;
- a physical device on `NS_HMR_HOST`.

**Open questions.**
- **Runtime fix** for dynamic `import()` of root-relative specifiers, on iOS and on Android (unchecked). After it ships, the response-time rewrite can go.
- **`safeModulePaths`** is Vite-internal.
- **Deps-bundle dynamic-import externals** outside `fs.allow` are not registered.
- **The fallback vendor module** imports every manifest key bare.
- **imagepicker in toolbox:** its root maps to a served file, its subpaths map to `.vite/deps`, and it is also inside the deps bundle.
- **Base:** only `base: '/'` works on device.
All of the deps-bundle and vendor items go in phase 3c.

## Round 16: phase 3c, dependencies without NativeScript pre-bundling

**What changed.**
- **Deleted:** the esbuild deps bundle (`/__ns_dev__/deps-bundle.mjs`), `/__ns_dev__/vendor.mjs` and `vendor-manifest.json`, `vendor-bootstrap`/`vendor-resolve`, `hmr/shared/vendor/*`, `platform-polyfills`, `nativeclass-esbuild-plugin`, `package-classifier`, `dev-routes`, `vendorManifestPlugin` (with its HMR-build `ns-vendor.mjs`/`ns-vendor-manifest.json`), Solid's JSX-package discovery exclude, and the `__nsVendor*`/`__nsRequire`/`__NS_DEPS_MODULES__`/`__NS_VENDOR_MANIFEST__` globals. 28 files, 6,937 lines.
- **Consumers** (`core-aliases-early`, `root-placeholder`, `dev-overlay-shared`) reach core through the `bundle.mjs` require shim, which is now the final `globalThis.require`. The HMR client's CSS handler imports `@nativescript/core` as ESM.
- **Dependencies:** Vite's dep optimizer is off in dev for every flavor unless the app lists `optimizeDeps.include` (see DESIGN "Dependencies"). React lists `react` and `react-reconciler`. Once an optimizer exists, a version guard keeps core and `@nativescript/vite` URLs free of `?v=`.
- **Import map:** 504 → 14 entries (Angular). Keys are `@nativescript/core`, the app's `dependencies`, strategy specifiers and node builtins. `?v=`/`&v=` are no longer volatile patterns.

**`thin-crawl.mjs` additions.** It now detects duplicate instances:
- a file inlined in a bundle and also served;
- a file inlined in two bundles;
- one file under two URL strings (`x.js` vs `x.js?v=`), checked against the URLs baked into `--bundle`.

It also reports CommonJS served raw, `\p{` regexes (no ICU on device), optimizer stability, import map vs import analysis for every key, and runtime `require` callers. Its new flags are `--seed`, `--vite-config` and `--allow-dup-instances`. It warns when `--bundle` is missing.

**Angular fixture** (`apps/ng`, `--bundle`; HEAD = `883c6451b`'s build, verified identical):

| | HEAD | after |
|---|---|---|
| requests / KiB, device | 687 / 21,644 | 683 / 21,499 |
| requests / KiB, with every map target | 1,491 / 162,388 | 692 / 27,773 |
| `/__ns_dev__` (device) | 4 (123 KiB) | 2 (3 KiB) |
| import-map entries | 504 | 14 |
| duplicate instances | 6 (deps bundle ∩ served: 5 `@valor/nativescript-websockets` files, `zone.js`) | 0 |
| same file under two URLs | 0 | 0 |
| CommonJS served raw / `\p{` (map targets only) | 339 / 13 | 0 / 0 |

The deps bundle inlined 6 files from 2 packages (`zone.js`, websockets), none of them CommonJS or NativeClass.

**Toolbox** (`apps/toolbox`, linked core):

| | HEAD | after |
|---|---|---|
| requests, device (with `--bundle`) | 290 | 425 |
| duplicate instances | 4: imagepicker `index.ios.js`/`common.js` and perms `index.ios.js`/`index.common.js`. Each was in the deps bundle (evaluated at boot through `vendor.mjs`), in `.vite/deps`, and served raw once the image page loads | 0 |
| optimizer | on (discovery) | none |

The toolbox's 135 extra requests are css-tree, `@csstools` and source-map-js served file by file, where Vite's discovery used to pre-bundle them. The 290 is the discovery arm on the 3c tree with `--bundle`; HEAD's own crawl (281) ran without `--bundle`.

**(a) plain files vs (b) Vite's optimizer**, measured with a temporary switch on every flavor:

| | requests | duplicates |
|---|---|---|
| toolbox, (b) on | 290 | 0 |
| toolbox, (a) off | 425 | 0 |
| toolbox with core installed as a real `node_modules` directory, (b) | 638 | **215 core files twice** |
| same, (a) | 423 | 0 |

- **Why (b) fails with an installed core.** With an optimizer present, Vite's resolver stamps `?v=<browserHash>` on every resolved `node_modules` `.js`. `bundle.mjs` and the bootstrap use version-less core URLs, so core evaluated twice. (b) also pre-bundled nothing in that layout. Baking `?v=` into `bundle.mjs` can't work, because the hash changes on re-optimization.
- **Inferred for HEAD too, not measured there.** TypeScript, JavaScript and Vue apps that install core from npm ran (b) at HEAD, and the `?v=` stamp is Vite's own; the toolbox's linked core hid it.
- **(b) again, with the version guard** (`out/phase3c-b/`):

  | layout | (a) | (b) + guard |
  |---|---|---|
  | toolbox (linked core) | 425 | 290 |
  | installed core | 423 | 423 (nothing optimized) |
  | ng | 683 | 443 warm; 445 cold, plus 1 `full-reload` |

  - Core is single in every run.
  - **ng's cold first boot re-optimizes and restarts the app.** The scanner has no entries, so `@angular/*` and `@nativescript/angular` are discovered from the first `main.ts` request. Vite logs "optimized dependencies changed. reloading" and sends `full-reload`. Two device requests get `504`, 11 import-map entries change mid-session, and `@nativescript_angular.js` loads under two `?v=` values.
  - **A duplicate instance remains:** `tslib.es6.mjs` is inlined into rxjs's pre-bundle chunk and also served raw for core. The crawler's bundle check couldn't see it; seven Vite pre-bundles have no source map. A sourcemap overlap script found it.
  - The stock crawler starts requesting during the first optimizer run, which hides late discovery; a delayed copy (`thin-crawl-delay.mjs`) exposes it.
- **Decision: (a).** By the agreed order (duplicates, then CommonJS correctness, then requests), (b) loses on the first criterion even with the guard: tslib is doubled, and a cold boot restarts the app. (a) has zero duplicates by construction, no mid-session re-optimization and no drifting exclude list. It costs requests where discovery pre-bundles well (ng 683 vs 443, toolbox 425 vs 290) and nothing with an installed core.
- **CommonJS goes through `optimizeDeps.include`.** Checked with an installed core plus `include: ['tslib']`: an optimizer exists, 0 of 253 core URLs carry `?v=`, and duplicates are 0.
- **A CommonJS package requiring core, pre-bundled** (`cjs-core-probe`, installed core):
  - `require('@nativescript/core/color')` stays a runtime `__require`. Vite's CommonJS-external facade hoists only an exact excluded name, not a subpath. It reaches the `bundle.mjs` shim, which answers from `coreModules`. `color` and `http` are evaluated at boot and registered; on a miss the shim returns `{}`.
  - `require('@valor/nativescript-websockets')` (excluded, exact name) is hoisted to an ESM import at the import-map URL: one instance.
  - The package's own `require('tslib')` was inlined, so tslib loaded twice (pre-bundle and raw for core). That is the shared-dependency hazard of any include.

**Runtime facts behind it** (ns-v8ios-runtime `204ac2bd`):
- **Native `require`:** `ModuleInternal::RequireCallback` resolves bare names on disk only (`tns_modules`) and throws for http URLs. It never reads the import map.
- **`IsVolatileUrl`:** before every dynamic `import()` of a matching URL, it evicts the module from the registry, which creates a new instance.

**Android SBG.** `Main.java` walks every `.js`/`.mjs` under `assets/app` and `js_parser.js` never follows imports, so the HMR-only `ns-vendor.mjs` stub (`import '@nativescript/core/ui/frame/activity.android'`) gave it nothing. In both HEAD and after Android HMR builds, the activity is reachable only as a dynamic import of its served URL; no `activity.android*.mjs` chunk is emitted.

**Builds** (apps/ng, scratch outDirs):
- **Release:** iOS and Android file lists and `bundle.mjs` are byte-identical. Only Rollup's `vendor.mjs` chunk shrinks, by 505 bytes: the `core-aliases-early` vendor-registry lookup and the dead `getVendorRequire` helper are gone.
- **HMR:** `ns-vendor.mjs` and `ns-vendor-manifest.json` are gone. `bundle.mjs` is about 3.8 KB smaller, with only the vendor-registry code removed.

**Checked** (the final build synced into the fixture; every run sequential):
- vitest 878/878 in 85 files.
- `tsc -p tsconfig.lib.json`: 261 errors, all under `../core`. `tsconfig.spec.json`: 0 in `packages/vite`; the 3 pre-existing errors are fixed.
- nx build and prettier pass.
- The Angular and toolbox crawls pass with `--bundle`, with 0 duplicate instances.
- payload-probe, full run: 17/17. `--only r4,r5,r6,r7,r8 --fresh-plugins`: 5/5. Catch-ups r4 0, r5 0, r6 1, r7 0.
- `boot-bundle-hash.mjs`: stable.

**Not checked:**
- anything on a device;
- Vue, Solid and React (no fixture);
- a NativeClass dependency in a pre-bundle.

**Device checklist:**
1. **Angular fixture, iOS simulator:** boot through the lazy home route, one edit of each kind (template, style, class), and the restart-after-`vite.config` boot race. Check the device log for a missing `vendor.mjs`, `__nsVendorRegistry` or `require` errors.
2. **One `@nativescript/core`:** in the Angular app, `Application` seen by app code must be `===` the one `bundle.mjs` booted, e.g. log `globalThis.Application === (await import('@nativescript/core')).Application`.
3. **App CSS edits** (`ns:css-updates`): the CSS handler now imports `addTaggedAdditionalCSS`/`removeTaggedAdditionalCSS` from core as ESM.
4. **A plugin that uses CommonJS `require('@nativescript/core/…')`**, e.g. `@nativescript-community/gesturehandler` (`require('@nativescript/core/ui/core/view').View`), or any CJS plugin:
   - as installed (served raw): expect it to load, with core answered by the shim;
   - if it is pure CommonJS (no ESM syntax): it must fail without `optimizeDeps.include: ['<plugin>']`, and work with it, with core still single (check 2).
5. **Toolbox on the iOS simulator:** boot, then the image-handling page (imagepicker + perms, now served raw and version-less), the websockets demo, and a TS edit (an app restart until phase 4).
6. **Physical device on `NS_HMR_HOST`:** boot only.
7. **Optional: a React app,** to check that `react`/`react-reconciler` load through the pre-bundle and that `react-jsx-runtime`'s named imports resolve.

## Round 17: phase 4a, TS/JS soft reboot, `app.css` as a Vite module, workers

DESIGN.md (as built after phase 4a) has the model: "Soft reboot", "Global `app.css`: a Vite CSS module", "Workers" and "Frameworks" → "TypeScript and JavaScript".

**What changed.**
- **TS/JS entry boundary.** The typescript and javascript strategies name `@nativescript/vite/hmr/frameworks/core/client/reboot.js`.
  - Its dispose closes modals and arms a one-shot `Application.run` → `resetRootView` redirect, at dispose time, because the boot placeholder restores the original `run`.
  - Its settle resolves once the new root view is loaded, or with `{ error }`.
  - `restorePageAfterHmrReboot()` is an opt-in re-navigation to the previous page.
- **The bundler context is served in dev.** The entry imports `virtual:ns-bundler-context`, and the HMR `bundle.mjs` no longer bundles it, so XML, code-behind and util edits reach the entry boundary. The context unregisters its names before registering again. Release is unchanged.
- **`app.css` is a CSS module of the entry, in every flavor.**
  - `updateStyle`/`removeStyle` restyle the root and modals, batched per microtask.
  - The dev bundler context leaves out the global stylesheet, so core's launch-time `loadAppCss` no longer applies an untagged raw copy.
  - An NS hot-update hook undoes Analog's swap of an edited `.css` for its importer (the entry).
  - Deleted: `ns:css-updates`, connect-sync, `virtual:ns-app-css` in the HMR bundle, `app-css-state`, `app-css-refresh`, `css-updates.ts`, `css-handler.ts`, `css-update-overlay.ts`, `app-css-applier.ts`, `entry-runtime.ts` (and its package export), and `appCss`/`appCssAst`.
- **Workers.**
  - The dev rewrite keeps Vite's `?worker_file&type=module` on the dev origin, so Vite prepends `import "/@vite/env"`: the worker realm gets the defines.
  - The constructing module owns its workers and terminates them on `nativescript:beforeRerun` and `hot.prune`.
  - A worker-graph edit is a `full-reload` (app restart).
  - Deleted: `worker-tracking.ts` and `__NS_HMR_WORKERS__`.
  - Toolbox demo: `__spike__/spike.worker.ts`, `worker-helper.ts` and `worker-spawner.ts`, plus a "worker-spike" button.
- **`ns:rerun` uses device URLs** for virtual modules (`/@id/__x00__…`, `deviceUrlForGraphUrl`). `isRerun` didn't match the served context before.
- **Boot stages:** `loading-entry-runtime` → `loading-client`; `installing-css` removed.
- **Size:** 52 files against HEAD, +889/−2184 in tracked files (15 deleted, −1421, including docs and probe scripts), plus 1060 lines in new files (specs: 807).

**`payload-probe.mjs` additions.**
- **Flags and device emulation:** `--flavor` (default `angular`). The device emulation replies `ns:restart` to `full-reload`, re-boots TS after a restart request, and imports `acceptedPath?t=` after an in-place TS update.
- **New expectation facts:** `fullReload`, `restart`, `cssUpdatesEvent`, `selfUpdate`, `servedIncludes`, `restartBootFailures`, `inPlaceHas`.
- **Run:** `node --preserve-symlinks tools/vite-server-env-spike/payload-probe.mjs --flavor typescript --app ../../apps/toolbox`.

**`thin-crawl.mjs`:** a `?worker_file` seed roots its own realm. A file loaded under one URL per realm (the worker's `/@fs/…/vite/dist/client/env.mjs` next to the main realm's `/@vite/env`) is reported on a "cross-realm" line and doesn't fail. Seeding the `/@fs` `env.mjs` into the main realm still fails.

**Probe, TypeScript (toolbox): 17/17.**
| case | edit | result |
|---|---|---|
| x1 | `main-page.xml` | reboot; `rerun` = entry, `/@id/__x00__virtual:ns-bundler-context`, `/src/main-page.xml?raw` |
| x2, x3 | `main-page.ts`, `main-view-model.ts` | reboot, edited file in `rerun` |
| c1, c2, c3b | `app.css`, `_app-platform.ios.css`, fix | in place: `js-update /src/app.css`, `rerun ["/src/app.css"]`, new rule in the re-import |
| c3a | `app.css` syntax error | `error` (`[postcss] Unclosed block`), nothing applied |
| e1a, e1b | code-behind syntax error, fix | `error` (`vite:oxc`), then reboot |
| p1a, p1b, p1c | page added, next save, page removed | nothing; the next reboot registers it; `full-reload` → restart, clean re-boot |
| w1 | `worker-spawner.ts` | reboot, spawner in `rerun` |
| w2, w3 | `spike.worker.ts`, `worker-helper.ts` | `full-reload` → restart, clean re-boot |
| r5, r6 | `app.css` saved before / after it was fetched at boot | served fresh / catch-up reboot (`rerun [main.ts, app.css]`) |

**Probe, Angular: 18/18.**
- Cases without expectations are identical to round 16 after normalization, so component `styleUrl` edits (b1/b2) still update in place.
- `g` (`src/app.css`) is a `js-update /src/app.css` in place, and the connect-time `ns:css-updates` resyncs are gone.

**Content-driven CSS** (`--content-css`). A stand-in PostCSS plugin on `src/app.css` emits a `dir-dependency` on the templates (`src/**/*.html`; TS: `src/**/*.{xml,html}`) and appends one rule per `class="…"` found.
- **Before the hook's dependency branch:**
  - ng `ca` (loaded `home.component.html`) and `cb` (an unused `.html`) already passed with Analog 2.9.7: its `.html` handling leaves a JS module among the edit's modules.
  - TS `cx` (`.xml`) passed: a reboot that re-fetches the new `app.css`.
  - TS `cy` (`.html`) failed: `full-reload` (Vite's `isClientHtmlChange`), i.e. an app restart.
- **After** (the hook appends the stylesheet's module when the edited file is its dependency): ng 2/2 and TS 2/2. `cy` is `js-update /src/app.css` with the new rule in the served body.
- The default ng run stays 18/18, and TS 17/17.
- `--compilation-api` fails its compile check on `.html` edits with or without the flag. That predates this round.

**Runtime `Accept` header:** `application/javascript, text/javascript, */*;q=0.1`, on iOS (`HttpLoader.mm:677`) and Android (`HttpLoader.cpp:720`). Vite rewrites a CSS request to `?direct` only for `text/css`, so the runtime gets the JS module.

**F1 (minor).** After a removed page, a save made while the app was not restarted (no IPC parent) gets an `error` (`ENOENT …probe-added-page.xml`).
- The cause: the update gate checks the stale context edges before the context re-transforms.
- With a restart in between, the save is clean.
- On a device the client ignores updates while a restart is required, but still shows the `error` overlay.

**Builds** (the baseline harness at HEAD vs after):
- **Release, ng:** all files byte-identical.
- **Release, toolbox:**
  - `bundle.mjs` grows by 414 bytes and `assets/spike.worker-*.js` (179 B) is new: the toolbox's own demo.
  - The `app.css` AST passed to the tagged-CSS call is identical (sha256 `8e60ab21…`), and the release context still registers `/src/app.css?raw`.
  - HEAD toolbox sources built with the new package give all files byte-identical to baseline.
- **HMR `bundle.mjs`:**
  - toolbox 574,488 → 140,111 bytes (−76%): no app.css rules, no context, no page code;
  - ng 1,047,271 → 1,044,535 (the `app.css` rules are gone).

**Crawls** (`--bundle` with the fresh HMR bundle, `NS_HMR_PORT=5173`, the origin it bakes):
| | round 16 | after |
|---|---|---|
| ng requests | 683 | 680 (−5 removed client modules, +`restyle.js`, +`/src/app.css`) |
| toolbox requests | 425 | 541 (+114 `/src`: 55 page XML, about 59 code-behinds and their imports, `app.css`; +1 `/@id` context; +5 `/node_modules`: `reboot.js` and 4 imagepicker/perms files; −4 `/@fs` client) |

Both pass with 0 failures, 0 duplicates and 0 duplicate instances. The toolbox crawl seeds the worker entry and finds 1 cross-realm group (`env.mjs`).

**Checked** (the final build synced into the fixture; every run sequential):
- vitest 869/869 in 82 files.
- `tsc -p tsconfig.lib.json`: 261 errors, all under `../core`.
- nx build passes, and prettier is clean on 46 changed files.
- The probes and crawls above.
- The release comparison above.

**Not checked:**
- anything on a device;
- Vue, Solid and React;
- the JavaScript flavor (no fixture);
- real Tailwind (a stand-in PostCSS plugin only);
- Android.

**Device checklist** (iOS simulator):
1. **Toolbox cold boot.** App styling is right before and after the placeholder: theme, `color-mix`, `.ios` partial rules, `ListView` row heights. There are no `app.css` warnings, and no styling rule appears twice.
2. **Toolbox `app.css` edit** (change `.btn-view-demo` `border-radius`): it applies in place, with no reboot overlay. Delete a rule: it disappears. Open a modal (dialogs page) and edit again: the modal restyles too.
3. **Toolbox `main-page.xml` edit** (button text): a soft reboot on the root page, with no app restart and no modal left behind. Then a `main-page.ts` edit and a `main-view-model.ts` edit.
4. **Navigate to a page, then edit its `.xml`.** The app lands on the root page; this is expected. With the opt-in `restorePageAfterHmrReboot` snippet in `main.ts`, it returns to that page.
5. **Broken XML** (unclosed tag in `main-page.xml`): an overlay error and a still-usable app; the fix reboots cleanly. A TS syntax error shows the compile-check overlay and changes nothing.
6. **Worker:** tap "worker-spike". The log shows `[worker-spike] reply {"square":49,"platform":"apple","dev":true,"core":true}`.
   - Edit `worker-spawner.ts`, reboot, tap again: one reply, from a fresh worker.
   - Edit `spike.worker.ts`: a restart is requested.
7. **Angular fixture:** a `src/app.css` edit applies in place (no reboot), component `styleUrl` and template edits still update in place, and cold-boot global styling is right.

## Round 18: phase 4b, Vue, Solid, React

DESIGN.md has the model: "Frameworks" → "Vue" and the "HMR by flavor" table.

### Vue

**Fixture** (`apps/vue`, from `@nativescript/template-blank-vue-ts` 9.1.2).
- The stock entry `createApp(Home).start()`, under `appPath: 'app'` (`main: app/app.ts`), plus `import './setup'`, an entry-only module.
- `Home.vue` is the root (`<Frame><Page>`, a `<style module>`). `Counter.vue` is a child, with a `ref` counter, a `<style scoped>` and a `<style module>`, and it imports `utils/format.ts`. `app.css` has two rules.
- nativescript-vue 3.1.3; @vue/* 3.5.45, one copy; plugin-vue 6.0.11; plugin-vue-jsx 5.1.6; vue-tsc 3.3.14; typescript 6.0.3.
- `overrides` pins nativescript-vue's `@nativescript/core` peer to the local tarball. Without it npm fails with ERESOLVE, because the prerelease `9.1.5-next.1` doesn't satisfy `>=8.9.0`.
- Tailwind and `@nativescript/types` are dropped. vue-tsc is clean.

**What changed.**
- **Vue entry boundary.** The vue strategy names `@nativescript/vite/hmr/frameworks/vue/client/reboot.js`.
  - Its dispose remembers the app of the current root view (`getRootView()[ELEMENT_REF].parentNode.__vue_app__`) and runs the core module's dispose.
  - Its settle runs the core settle, then unmounts the remembered app once the root view belongs to another one.
  - `nativescript-vue` is typed through a 3-line ambient declaration, because the workspace doesn't install it.
- **Deleted:** the `ns-vue-named-imports-interop` plugin in `configuration/vue.ts` (−130 lines).
  - It was `apply: 'build'` and active only with HMR, and the HMR `bundle.mjs` contains no app code and no nativescript-vue, so it transformed nothing. Release never added it.
  - Deleted with it: its babel/`getCliFlags` imports, the `@babel/generator`, `@babel/parser`, `@babel/traverse` and `@babel/types` dependencies (it was their only user in `packages/vite`), and a stale `// Vue HMR plugins` comment in `base.ts`.
  - The root lockfile's `packages/vite` entry is extraneous and stale (`1.0.6-rc.7`), so it needs nothing.
- **Kept:**
  - the `vue` → `nativescript-vue` alias, now with a constraint comment;
  - `dedupe`;
  - the `set-value` shim (nativescript-vue's `dom/index.js` imports it);
  - the strategy's `importMapSpecifiers` (see Open).
- **Size:** +20/−140 in tracked `packages/vite` files, plus 171 lines in new files (specs: 112). Probe and crawl scripts: +65/−7. Fixture: 10 files, 139 lines.

**What the device is served** (from installed sources):
- The resolve conditions give `@vue/runtime-core/dist/runtime-core.esm-bundler.js` in dev and release alike. nativescript-vue imports and re-exports it rather than bundling a copy.
- Vite's `vite:client-inject` substitutes `process.env.NODE_ENV` in every served module (`vite/dist/node/chunks/node.js:17204`), so the dev branch registers `__VUE_HMR_RUNTIME__`. The crawl asserts it on the served text.
- `nativescript-vue` `app.start()`:
  - `setRootApp`;
  - `mount(createAppRoot())`;
  - `Application.run({ create })`;
  - `keepPlaceOnRootReload` in dev, which wraps Vue's `appContext.reload`.
- **`createAppRoot`** (`dist/index.js:24-43`) wraps an NSVRoot:
  - its `removeChild` only sets `shouldResetRoot`;
  - its `appendChild` calls `resetRoot` (`Application.resetRootView`) when that flag is set.
  - A root `reload` (unmount then mount) therefore replaces the root view.
  - `app.unmount()` alone (`render(null)` → `unmount(root, …, doRemove = true)`; element children with `doRemove = false`) calls `nodeOps.remove` on the root element only. That is `NSVRoot.removeChild`, i.e. bookkeeping, and the native views are untouched.
- **Vite's CSS modules** are not self-accepting (`modulesCode || "import.meta.hot.accept()"`, `node.js:30053`).

**`payload-probe.mjs` additions.**
- **Vue case table** (`--flavor vue --app apps/vue`).
- **New facts:**
  - `fileChangedFirst`: plugin-vue's `custom file-changed` reaches the wire before `ns:rerun` and before the `update`.
  - `inPlaceLacks`.
  - `selfUpdateLike`.
- **The crawl follows the app directory of the entry** (`/app/`, not only `/src/`). The worker seed is toolbox-only.
- **In-place re-imports now match the device client:**
  - the URL is `path?[import&]t=…&<query>` (the probe used to append `?t=` after an existing query);
  - the imports of the re-imported module are crawled, so an SFC's style modules count as served.

**Probe, Vue: 13/13.**
| case | edit | result |
|---|---|---|
| t1 | `Counter.vue` template | `file-changed`, `ns:rerun [Counter.vue]`, `js-update Counter.vue`; re-import exports `_rerender_only` (rerender) |
| t2 | `Home.vue` template | same, on `Home.vue` |
| s1, s2 | `Counter.vue` / `Home.vue` `<script setup>` | `js-update` of the SFC, no `_rerender_only` (reload) |
| y1 | `Counter.vue` `<style scoped>` | `js-update Counter.vue?vue&type=style&index=0&scoped=…&lang.css`, in place, new color in the re-import |
| m1, m2 | `<style module>` in `Counter.vue` / `Home.vue` | `js-update` of the SFC (reload); `rerun` = SFC + its `.module.css` |
| u1 | `utils/format.ts` (imported by `Counter.vue`) | `js-update Counter.vue`, `rerun [Counter.vue, format.ts]`: a component reload, **not a reboot** |
| x1 | `setup.ts` (entry-only) | reboot: `js-update /app/app.ts`, `rerun [app.ts, Home.vue, setup.ts]` |
| a1 | `app.ts` | reboot, `rerun [app.ts]` |
| g1 | `app.css` | `js-update /app/app.css` in place |
| e1a, e1b | `<script setup>` syntax error, fix | `error` (`[vue/compiler-sfc] Unexpected token`), nothing applied; the fix gives `js-update Counter.vue` |

- `file-changed` leads on every SFC edit (t1-m2, e1b).
- `x1`'s `rerun` includes `Home.vue`: the earlier Counter edits re-stamped `Home.vue` as an importer above the boundary (Vite's soft invalidation), so the re-imported entry loads a new `Home.vue` instance too. That is correct.
- Before this round there was no entry boundary, so `x1` and `a1` were `full-reload`, i.e. an app restart.

**Crawl, Vue** (`--bundle` with a fresh HMR bundle baked for `http://localhost:5173`, `NS_HMR_PREFER_LAN_HOST=0 NS_HMR_PORT=5173`): PASS.
- 457 device requests (`/node_modules` 442, `/app` 9, `/@vite` 2, `/@id` 2, `/__ns_dev__` 2), and 463 with every import-map target.
- 0 failures, 0 duplicates, 0 duplicate instances, 0 CommonJS served raw.
- One `runtime-core.esm-bundler.js` URL, whose `__VUE_HMR_RUNTIME__` guard is `if (!!("development" !== "production"))`. The reboot module is loaded.

**Builds:**
- **Release:** `bundle.mjs` 3,925 B + `vendor.mjs` 1,231,138 B, no errors. It contains no reboot module and no `__VUE_HMR_RUNTIME__`.
- **HMR `bundle.mjs`:** 138,913 B. It contains no app code and no nativescript-vue.
- **Type errors in the HMR build** (one in a `.ts`, one in a `.vue`): vue-tsc prints both, then `[ns-vite] vue-tsc reported type errors; continuing build …`, and `bundle.mjs` is emitted. Uses the type-check default of `warn` from the parallel fix.

**Regression** (the final dist synced into ng; toolbox links `dist/`):
- payload-probe ng 18/18, TS (toolbox) 17/17.
- **ng crawl:** 680 device requests, PASS (0 failures, 0 duplicates, 0 duplicate instances).
- **toolbox crawl:** 541 device requests, PASS.
  - It shows 2 cross-realm groups: the same `env.mjs` pair, once under the duplicate-modules check and once under the same-file check.

**Checked** (every run sequential):
- vitest 896/896 in 84 files.
- `tsc -p tsconfig.lib.json`: 261 errors, all under `../core`.
- nx build passes, and prettier is clean on the changed files.

**Not checked:**
- anything on a device;
- Android;
- `@vue/devtools`;
- `$navigateTo` / `$showModal` pages across a soft reboot;
- JSX/TSX SFCs.

**Open:**
- A new app that mounted but whose root reset failed stays mounted, unreachable, until a restart.
- **Release CSS modules:** `font-size: 20` came out as `20px`, and `#333333` as `#333`. In NativeScript `px` means device pixels. This is a note only.
- `css-tree` reaches `mdn-data` JSON through `createRequire` at runtime (5 calls, as in the toolbox).

**Device checklist** (iOS simulator):
1. **Run:** `cd tools/vite-server-env-spike/apps/vue && npx ns run ios`. Use the fixture's local CLI, which starts `vite serve` and the HMR `vite build --watch`. Add `--device <simulator id>` to choose a simulator.
   - Boot shows "Blank {N}-Vue app", a "Tapped 0 times" label and a "Tap" button with the module style; `ActionBar` is blue.
   - The log has `[spike-vue] setup v1`.
2. **Child template:** tap 3 times, then edit `Counter.vue`'s `<Label … :text="label + '!'">`. It updates in place and the count stays 3.
3. **Root template:** edit `Home.vue`'s `<Label text="Home" />`. In place, and the count is kept.
4. **Child script:** `ref(0)` → `ref(5)`. Counter remounts at 5; Home is untouched.
5. **Root script:** edit the `message` string. The root view is replaced and the count resets. There is no restart and no reboot overlay.
6. **`<style scoped>` color in Counter:** it restyles in place and the count is kept. The `[data-v-…]` selector must match.
7. **`<style module>` in Counter:** Counter reloads with the new class. In Home: the root reloads.
8. **`utils/format.ts`:** Counter reloads (count resets), with no soft reboot.
9. **`setup.ts` or `app.ts`:** a soft reboot.
   - The log shows `setup v2`, and the app is rebuilt on the root page.
   - A later `Home.vue` script edit replaces the root once, with no flash back to an old tree. That shows the old app was unmounted.
   - Then a child template edit still works.
10. **`app.css` rule:** in place, and deleting it removes it.
11. **Syntax error in `Counter.vue` `<script setup>`:** the overlay error, and the app keeps working. The fix reloads Counter.
12. **Broken entry** (`throw` in `setup.ts`): the overlay error and the old app still usable (it isn't unmounted). The fix reboots cleanly.

### Queued fixes
- **The `bundle.mjs` require shim throws on a miss under HMR** (DESIGN "Dependencies"). The generator moved to `helpers/require-shim.ts` (`createRequireShimCode({ hmrActive })`) so it can be specced in a `vm` sandbox (`require-shim.spec.ts`, 14 cases). The release shim string is byte-identical (2201 bytes) to HEAD's. Device-bundled `require(` callers (`core-aliases-early`, `root-placeholder` incl. `require('dominative')`, `dev-overlay-shared`, `browser-runtime-contract`, `ui-registration`) all sit in their own `try`; in `resolveModule` a miss now continues to `__nativeRequire` instead of returning `{}` early, with the same aliasing result. Core's `System.import` now rejects on a miss. css-tree's `createRequire` goes through the `module` polyfill, not the shim.
- **The dev type check defaults to `warn` under HMR** (DESIGN "Failures"). Precedence: `typeCheck` option → `NS_VITE_TYPECHECK` → `--env.typecheck` → HMR dev `warn` → tsconfig `noEmitOnError`. Detected in `configResolved` (`mode === 'development'` and the CLI `hmr` flag), so `getTypeCheckPlugins` keeps its signature. 7 specs. Checked on the Vue fixture: an HMR build with a type error in a `.ts` and a `.vue` printed both, logged `continuing build`, and emitted `bundle.mjs`. The toolbox (in-process TypeScript check, its 2 known TS2352 errors in `nested-tab-frame-shared.ts`, no `NS_VITE_TYPECHECK`): an HMR build prints both, logs `TypeScript found 2 errors; continuing build …`, and emits `bundle.mjs` (142,584 B).

### Solid

Not changed in this round (scope: fixes to the redesign and Angular/Vue/TS only). Investigated with a throwaway fixture from `template-blank-solid-ts` 9.1.2 (solid-js 2.0.3, `@solidjs/universal` 2.0.3, `@nativescript-community/solid-js` 2.0.1, dominative 0.1.3; solid-navigation dropped), since removed.
- **Compiler mismatch.** `vite-plugin-solid` 2.11.17 → `babel-preset-solid` 1.9.19 → `effect(p => setProp(el, 'text', v, p))`. Run in node against `@solidjs/universal` 2.0.3 with a fake node tree: `node._effectFn is not a function` (`@solidjs/signals/dist/dev.js:1654`), then `REACTIVITY_HALTED`. The `@solidjs/babel-plugin` 2.0.2 shape renders, updates and disposes. The release `bundle.mjs` (exit 0) carries the broken shape. npm also needs `overrides` (vite-plugin-solid peers `solid-js ^1.7.2`).
- **`@solidjs/vite-plugin` 3.0.1** (2026-11-17): peers `solid-js ^2`; `hot` was removed (passing it throws), refresh is on by default (`refresh: false` disables it); per module `$$registry()` + `$$component(...)` + `import.meta.hot.accept(); $$refresh('vite', import.meta.hot, registry)`; runtime `solid-js/dist/refresh.dev.js` uses `hot.data`, `hot.accept(cb)` and `hot.invalidate()`; the only browser API is a `window.location.reload` fallback for a missing `invalidate`. In `export const Route = make({ component: App }); export function App() {}` the wrapped `App` is hoisted above `Route` (the TDZ case). `solid-refresh` 0.6.3 peers Solid 1; `@next` excludes 2.0.3. The `@nativescript-community/solid-js` README points at `@solidjs/vite-plugin`. Risks noted: it wraps `hot.send` and drops `update`/`full-reload` within 200 ms of an `error`; a failed component import invalidates (→ entry).
- **Ownership boundary** (node-verified): `create()` run inside our own `createRoot`, then disposing that root, runs the render's `onCleanup` and stops its effects; the nodes stay, so `document.body` must be cleared too.
- **Second dominative instance:** in the HMR `bundle.mjs`, `root-placeholder.ts:596`'s `require('dominative')` is inlined (`init_dominative(), __toCommonJS(dominative_exports)`); in the ng fixture it stays `__require("dominative")`. DESIGN's "reached only through the runtime's on-disk `require`" is therefore wrong for apps that depend on dominative.
- Served graph: dominative, undom-ng, the renderer and solid-js 2 are all ESM; nothing needs `optimizeDeps.include`. The `solid.ts` Solid 1 subpath aliases (`solid-js/web|universal|store`) name files Solid 2 doesn't ship; `solid-runtime.ts`'s comment about missing `development` conditions is stale for serve (vite-plugin-solid adds `solid`/`development`).
- `startSolidApp` (`solid-bootstrap`): no users in the repo or the three templates; its remount and nav-redirect branches are unreachable since `6e6fe1e96`.

### React

Not changed in this round. Investigated with a throwaway fixture of the stock `template-blank-react` 9.1.1 shape (react-nativescript 5.0.0, React 18.3.1, react-reconciler 0.29.2 via `overrides`), since removed. Details of the four react-nativescript failures are in DESIGN "Frameworks → React". Extra evidence:
- release build of the stock shape: 428 modules, rolldown `CANNOT_CALL_NAMESPACE` at `HostConfig.js:375`; in Node, `typeof __toESM(fn)` from the emitted `rolldown-runtime-*.mjs` is `object`;
- the template's tsconfig `include` glob (`./src/**/*.tsx?`) matches no file, so its type check checks nothing; with a real include the stock entry fails `TS2304: Cannot find name 'global'` against core 9.1.5;
- the template's `Object.defineProperty(global, '__DEV__', { value: false })` is harmless with `/@vite/env` (plain assignment, writable).
- Includes (static reading): `react` and `react-reconciler` pre-bundle in one optimizer run; the reconciler's `require('react')` shares react's chunk; `scheduler` is inlined into the reconciler. Not crawled.
- `@nativescript-community/react` 19.0.0: `startReactApp` → `Application.run({ create: () => { mount(root); return doc; } })` (`src/renderer.js`); `dispose` stays in that closure; `reconciler` is exported, FiberRoots are not. Its tarball carries a nested `nativescript-community-react-0.1.0.tgz`.

## Round 19: phase 5a, a served boot module, Vite's dep optimizer, no global `require`

**What changed.** Five stages; stage 1 is committed (`d1509a553`), stages 2–5 are uncommitted. DESIGN "Serving", "Import map", "Dependencies", "Require" and "Dev globals" describe the result.
- **Stage 1, boot through a served module.** Under HMR, `bundle.mjs` imports `<origin>/@vite/env` and the served `virtual:ns-dev-boot`, which holds the boot imports as bare specifiers; the client bootstrap is the served `virtual:ns-dev-client`. Vite's import analysis writes every core URL, `?v=` included. `bundle.mjs` drops from about 1 MB to under 1 KB.
  - **Deleted:** the `bundle.mjs` require shim (release too: Rollup converts CommonJS at build time), the core registration footer with the `coreModules`/`cjsShape` globals, `version-query-guard.ts`, the `/__ns_dev__/client` route, and the dominative two-phase boot (it falls back to `resetRootView`, as release does).
  - `ns:` builtins stay bare in served responses (`device-imports.ts`); `ns:module` is loaded through a dynamic import (`runtime-host.ts`); the dev overlay imports core as ESM.
- **Stage 2, Vite's dep optimizer with discovery** (`helpers/dev-optimize-deps.ts`). Scanned `entries`, an `include` rule, a computed `exclude`, a hand-written Rolldown plugin for `require()` of excluded packages, the import map's `wouldDiscover` guard, and the serve-time Angular linker skipping optimized files. `nsOptimizeDepsPolicyPlugin` is deleted.
- **Stage 3, no global `require`.** A per-module `require` for served code (`hmr/server/module-require.ts`, `runtime/module-require.ts`), the `__non_webpack_require__` handling, and the opt-in `NS_VITE_STRICT_REQUIRE` shadow (`runtime/strict-global-require.ts`). Vue fixture: a CommonJS package `local/ns-cjs-probe` (requires `@nativescript/core/color`), installed from a packed tarball by `refresh-fixture-packages.sh`, and `app/require-probe.ts`.
- **Stage 4:** crawls, probes and release builds (below).
- **Stage 5, edits to a pre-bundled dependency** (`hmr/server/prebundle-watch.ts`): a dev server restart with a new optimizer session, then one app restart.
- **Stage 6, gaps, then everything re-measured on the final tree.** `entries` also scan the entry file of every linked or platform-main package in `dependencies`. The probe checks the `@nativescript/angular` pre-bundle instead of its raw file, fails on a dependency registered during warm-up, and runs the static `require` check on every module body it fetches (`require-scan.mjs`, shared with `thin-crawl`).

**This reverses round 16's decision (a).** Vite's optimizer (b) lost there on two counts:
- the device evaluated an installed core twice, because `bundle.mjs` named version-less core URLs while Vite stamped `?v=`;
- a cold Angular boot re-optimized and restarted the app.

Stage 1 removes the first: Vite writes every URL the device loads, so there is no version-less copy. The scanned entries and the include rule remove the second (experiments below).

**Requests** (cold crawls, `--bundle`; stage 1 `out/phase5a-stage1/crawl-*.summary.txt`, after `out/phase5a-after/crawl-*.summary.txt`):

| | ng | vue | toolbox |
|---|---|---|---|
| device requests / KiB, stage 1 | 707 / 27,501 | 481 / 13,596 | 566 / 13,666 |
| device requests / KiB, after | 332 / 17,880 | 327 / 9,050 | 430 / 9,518 |
| pre-bundled deps (pre-bundle files incl. chunks) | 24 (34) | 13 (16) | 11 (12) |
| source files inlined into pre-bundles | 398 | 172 | 147 |
| import-map entries, stage 1 → after | 14 → 14 | 5 → 6 (`ns-cjs-probe`) | 4 → 4 |
| Vite | 8.3.8 (nested copy) | 8.3.8 | 8.0.2 |

- Every after crawl passes: 0 duplicates, 0 files under two URLs, 0 duplicate instances, 0 non-2xx, 0 deps registered by requests beyond the scan, 0 full reloads, a stable `browserHash` (ng `f56c1593`, vue `11a62675`, toolbox `af2ee7f4`), `requireCheck` 0, and global-object `require` calls: fail 0, known-uncalled 1 (see "Core's `System.import`").
- ng: raw `/node_modules` requests 695 → 292; 28 requests (12,533 KiB) go to `/node_modules/.vite`. Vite 8.3.8 pre-bundles inline their source map, which is most of those KiB: ng on 8.0.2 (`out/phase5a-stage2/final-ng-vite802/`, stage 2 build) is 332 requests / 9,157 KiB, 3,809 KiB of it pre-bundles, and passes.
- toolbox: `include` is empty (its app dependencies are core, platform-main or CSS-only). 10 deps come from scanning core's files: `tslib`, `source-map-js`, `emoji-regex`, four `@csstools/*`, `css-what`, `acorn`, `css-tree`. The 11th, `@nativescript-community/perms`, comes from scanning `@nativescript/imagepicker`'s platform entry (stage 6; before, its two files were served raw: 431 / 9,561). Raw `/@fs` (linked core) requests 404 → 258.
- vue: the 13 are `nativescript-vue`, `vue`, `ns-cjs-probe`, and core's deps as above.
- css-tree's `createRequire` JSON reads (`mdn-data`, `patch.json`, `package.json`) appear in every crawl, before and after. They go through the `module` shim, not a global `require`.

**Cold and warm optimizer** (ng):
- Cold (`node_modules/.vite` cleared): the scan finds all 24 deps before the first request, and requests register none. Cold runs: stage 4 `bd5b50dd` and `crawl-ng-cold2.summary.txt` (`2df672c7`), identical otherwise; stage 6 `crawl-ng.summary.txt` (`f56c1593`), same numbers.
- Warm (stage 4, `crawl-ng-warm.summary.txt`): optimized 24 → 24, nothing discovered, no re-optimization, hash `738635eb`.
- The cold `browserHash` differs on every cold start and from the one persisted in `_metadata.json`: Vite seeds the session hash with a timestamp. It is stable within a session. So the first warm restart after a cold start serves new `?v=` URLs, which is harmless because a server restart means an app restart.
- A late discovery still re-optimizes. The stage-5 Angular probes discovered `@angular/animations/browser` in their warm phase, and the dev server requested a restart for the `full-reload`. The probe caused it (stage 6): its `@nativescript/angular` check fetched the raw `fesm2022/nativescript-angular.mjs`, which the device never loads (the package is pre-bundled, and an alias sends deep `fesm2022` imports to the pre-bundle). That file imports `@angular/animations/browser`. Vite's `vite:pre-alias` registers an aliased bare id that resolves into `node_modules` (here the animations stub inside `@nativescript/vite`) for any importer, `node_modules` ones included (8.3.8 `node.js` ~25871). `thin-crawl --seed` of that file reproduces it (registered beyond the scan: 1), while `thin-crawl`, which loads every pre-bundle the device loads, registers none. The probe now fetches the pre-bundle and has 0 registrations.

**Experiments behind `entries` and `include`** (`out/phase5a-stage2/`):
- **exp-a** (ng; entries = `main`, the boot module's app files and the bundler context; include = the boot module's bare imports plus `tslib`): 467 requests / 20,271 KiB. The import-map request at startup registered 7 deps the scan missed (`@angular/animations`, `common`, `forms`, `platform-browser`, `platform-browser-dynamic`, `router`, `zone.js`). They made the first commit, so the hash held, but the crawl flags them. → the `wouldDiscover` guard: the map skips a key whose resolve would register a new dep.
- **exp-a2** (guard added, platform-main packages excluded):
  - ng: requests discovered `@angular/common` and `@angular/router`, imported by `src/app/home/home.component.ts`'s compiled output. The Angular compiler adds template-dependency imports the scanner never sees. Vite re-optimized: `browserHash` `b99c5e88` → `203249c6`, 1 `full-reload`, 2 × 504 (stale `?v=` for `@angular_router.js` and `rxjs.js`), 224 files under two URLs, 689 requests. → `include` gets the import map's package keys.
  - vue: the scan found `nativescript-vue` (and `tslib`); stable.
  - toolbox (linked core): requests discovered core's deps (`@csstools/*` × 4, `emoji-regex`, `css-what`, `acorn`, `css-tree`, `source-map-js`). A linked core lies outside `node_modules`, so its imports are discoverable. A rerun, no reload. An installed core's imports come from a `node_modules` importer and are served raw instead. → `entries` get the files behind the boot module's and the dev client's excluded imports.
- **exp-b** (both rules): ng 332 / 17,913, vue 323 / 9,037 (before `ns-cjs-probe`), toolbox 431 / 9,561; nothing registered beyond the scan.
- **exp-d-no-shared:** an explicit `tslib` include changed no optimized set on any app, so it is gone. `tslib` comes from scanning core's files.
- Risk of the rule: a declared dependency that Rolldown can't bundle fails the cold start, even if the app never imports it.

**`require()` inside pre-bundles** (scratch fixture `/tmp/p5a/facade-test`, script `/tmp/p5a/facade-run.mjs`; a CommonJS dep requiring `@nativescript/core`, `@nativescript/core/ui/core/view` and a file with a default export; core excluded):
- Vite alone (8.0.2 and 8.3.8): the exact name goes through `vite:cjs-external-facade` (`{ ...m }`); both subpaths compile to Rolldown's `__require("…")`, which falls back to the global `require`.
- `vite.esmExternalRequirePlugin` (exported by both versions; a Rolldown built-in): all three become `import * as m`. The shape differs: 8.0.2 `{ ...m }`, 8.3.8 the `module.exports` convention.
- **A built-in plugin from another Vite/Rolldown copy is silently ignored**: `__require` comes back on both cross pairings. The CLI resolves Vite from the project, and `@nativescript/vite` may import a nested copy; the ng fixture does (its `@nativescript/vite` carries Vite 8.3.8, while Analog resolves the root's 8.0.2).
- → `optimizeDepsEsmRequirePlugin`, hand-written. On 8.0.2 and 8.3.8: no `__require`, and served pre-bundle imports carry the same `?v=` as the app resolver's ids. Its vitest spec runs a real optimizer on 8.0.2.
- Deps scans: 0 `__require(` and 0 free `require` in every pre-bundle (`out/phase5a-stage2/deps-scan-*.txt`, `out/phase5a-stage3/deps-scan-*.txt`).

**Aliases and `exclude`** (scratch `/tmp/p5a/alias-run.mjs`, both Vite versions):
- Not excluded, the optimizer applies `resolve.alias` and inlines the shim into the pre-bundle. Excluded, the bare import stays and resolves to the one served shim. The older claim that the optimizer doesn't apply aliases was wrong. So `module`, `node:module` and `set-value` stay excluded.
- Two excluded-package files are still inlined, each once: ng's `@nativescript/vite/shims/angular-animations-stub.js` (the `@angular/animations` alias target, so it *is* that pre-bundle's entry) and core's nested `emoji-regex` copy.
- `@valor/nativescript-websockets` left the hard-coded list for the platform-main rule. In exp-a it was pre-bundled but never used: `nativescript-package-resolver` (`enforce: 'pre'`) resolved it to its raw platform file.

**Angular pre-bundling.** Analog 2.9.7 adds a Rolldown plugin to `optimizeDeps` that runs Angular's `JavaScriptTransformer` (linker, `jit: true`) on every `.[cm]?js` optimizer input. Pre-bundles carry `ɵɵdefine*` and no `ɵɵngDeclare*` call; `ngDeclare` appears only in the 8 definitions inside `@angular/core`. `@angular/compiler` is one instance. The serve-time linker re-linked the optimized core chunk (seen with `VITE_DEBUG_LOGS`), so it now skips optimized dep files. Stage 1's serve-time linker linked in AOT mode; JIT-mode linking (`linkerJitMode: true`) has not run on a device.

**Require transform and interop.**
- Import analysis rewrites an import of a `needsInterop` pre-bundle to `interopHelper(m, isNodeMode)`, `interopHelper = (m, n) => n || !m.__esModule ? { ...m, default: m } : m`. `isNodeMode` is `isFilePathESM(importer)` unless `legacy.inconsistentCjsInterop`. `needsInterop` comes from the dep's metadata, else `optimizeDeps.needsInterop` or `!exportsData.hasModuleSyntax`. Same in 8.0.2 and 8.3.8. The transform mirrors this per dependency.
- Served code: a `.ts` importer gets `interopHelper(…, 0)` and kind `interop`; an `.mjs` importer gets flag 1 and kind `default` (checked with a temporary file).
- Vue crawl: one URL for core's `color` module; `ns-cjs-probe` is the 13th dep; the runtime `require` list shows `@nativescript/core/color` and `ns-cjs-probe`.
- `out/phase5a-stage3/exp-scan-require/`: with `ns-cjs-probe` removed from `dependencies` (so not in `include`), the scan still finds it through the app's `require()`: 13 optimized, nothing registered, PASS.
- `/@vite/env` (toolbox, 8.0.2) has no `__non_webpack_require__`.
- The crawl's static check flags unbound `require`, `__non_webpack_require__` and `typeof require`, and `globalThis`/`global`/`self.require(` calls; bound and injected ones pass (negative control `/tmp/p5a/scan-negative.mjs`; against the shared `require-scan.mjs`, `/tmp/p5a/stage6/scan-negative.mjs`). 0 in every after crawl. The probe runs the same check on every JavaScript body it fetches, update modules included (stage 6).
- **The transform on Vite 8.0.2** (stage 6, toolbox): a temporary `export const __nsRequireProbe = require('@nativescript/core/color');` at the end of `src/main.ts`. Served, `main.ts` gets `import { createModuleRequire as __nsCreateModuleRequire } from "/node_modules/@nativescript/vite/runtime/module-require.js?v=…"; import * as __nsRequireDep0 from "/@fs/…/packages/core/color/index.ios.ts"; const require = __nsCreateModuleRequire("src/main.ts", {"@nativescript/core/color": [__nsRequireDep0, "esm"]});`, and the crawl passes with 0 free `require`. File restored; the toolbox crawl above ran after.
- Nx gotcha: a literal `require('toString')` in a spec made Nx's dependency scan add a `toString` dependency; the task runner then crashed (`dependency.push is not a function`) and silently skipped the build.

**Strict `require` evidence** (runtimes read-only):
- iOS: `ns-module.js`'s `createRequire` calls the native `binding.createRequire` and never reads `globalThis.require`. `ModuleInternal.mm` reads it in `RunModule` for a CommonJS entry (throws when it isn't a function) and in `RunScript` (an `IsFunction` check), so the shadow must be a function that throws only when called. The main entry is `.mjs` and takes the ES branch. `JsV8InspectorClient.mm:1297-1313` prefers `inspector_modules.mjs` and falls back to `.js` through `require` (would fail, caught).
- Android: `ModuleInternal.cpp:591-605` sends every non-`.mjs`, non-http path through `globalThis.require`. Callers: `JsV8InspectorClient.cpp:1235` loads `inspector_modules` by bare name on debugger connect (fails, caught and logged); `Runtime.java:961` `createJSInstance` runs `@JavaScriptImplementation` classes' files, which fail if the binding generator emits `.js` (unverified).
- Workers have their own isolate and their own global `require`, and get no shadow.
- `out/phase5a-stage3/exp-strict/` (ng cold, `NS_VITE_STRICT_REQUIRE=1`): the shadow is the boot module's first import, under one URL; 333 / 17,881, hash stable, PASS.
- Hence default off. Proposal: on for iOS after a device run with the flag.

**`__non_webpack_require__`.** As a define, `/@vite/env` turned it into a global holding the native `require` at env time. Dev now drops the define (`nsModuleRequirePlugin`'s `config` hook), and the transform maps free references to the module's `require`. The optimizer defines it as `require` (`getOptimizeDepsDefine`); its spec runs a real optimizer: a literal excluded specifier becomes `import * as`, a literal relative one is bundled, a non-literal one stays `__require(name)`. Builds keep `globalThis.require`, so release hashes don't move.

**Core's `System.import`.** `packages/core/globals/index.ts:200` calls `global.require(path)`; nothing calls `System.import`. The crawl matches that one site (a member call inside the `import` property of an object assigned to `<x>.System`, in core's `globals/index`) and reports it as known-uncalled. Other `global.require(` calls still fail.

**Served packages' third-party imports** (stage 6).
- The scanner doesn't follow an import of an excluded package, so before stage 6 only the files behind the boot module's and the dev client's excluded imports were scanned. Vite then decides by the importer's path (8.3.8 `node.js` 29421–29480 `tryNodeResolve`; 8.0.2 `finalizeBareSpecifier`): an importer under `node_modules` gets the dep served raw with `?v=`, no discovery; an importer outside `node_modules` registers it at request time.
- Repro (vue fixture, scratch `/tmp/p5a/stage6/gap-fixture.sh`, fixture restored by checksum): a linked package (realpath in `/tmp`) importing an undeclared CommonJS package, and a platform-main package (`main: "index"`, `index.ios.js`) importing another; both declared, both imported by `app.ts`. Stage-5 build: `cjs served raw 2` (`/node_modules/ns-gap-cjs-{a,b}/index.js?v=…`), FAIL; with `preserveSymlinks` the linked importer is under `node_modules` too, so nothing is discovered. With the rule: both pre-bundled by the scan (15 optimized), raw CommonJS 0, PASS, 331 requests.
- **One unresolvable bare import in a scanned file turns pre-bundling off.** With `import 'ns-gap-missing'` added to the platform entry: `(!) Failed to run dependency scan. Skipping dependency pre-bundling.`, 3 optimized (the `include`s), 464 requests. `discoverProjectDependencies` throws on any missing import (8.3.8 ~28546), and its caller logs and skips (~35907). That holds for every scanned file, so scanning declared but unused packages widens the exposure (DESIGN "Open").
- Toolbox: `@nativescript/imagepicker` (platform-main, in `dependencies`) imports `@nativescript-community/perms`, whose `main: "./index"` the package resolvers don't treat as platform-main, so Vite resolves it. It used to be served raw (2 files); now it is the 11th pre-bundle. The `dependencies`-only restriction keeps build tooling out of the scan; no fixture exercises it (the toolbox's only linked `devDependency`, `@nativescript/vite`, is skipped as an `NS_OPTIMIZE_DEPS_EXCLUDE` name).
- `dev-optimize-deps.spec.ts`: `resolvePackageEntryFile` cases, the entries rule (a linked `devDependency` is excluded but not scanned), and a real optimizer (8.0.2) in which the scan finds both CommonJS deps and the served linked and platform files import `/node_modules/.vite/deps/<dep>.js?v=`. With the rule disabled, both tests fail.

**`@nativescript/angular` hot context** (stage 6): the on-disk pre-bundle keeps 4 literal `import.meta.hot` (the fesm has 8), and the served pre-bundle starts with `import { createHotContext as __vite__createHotContext } from "/@vite/client";import.meta.hot = __vite__createHotContext("/node_modules/.vite/deps/@nativescript_angular.js?v=…")`. Import analysis does not skip optimized dep files. Printed by every Angular probe run.

**Edits to a pre-bundled dependency** (stage 5).
- Vite facts (8.3.8 `vue/node_modules/vite`, 8.0.2 at the repo root):
  - `fileHash = hash(metadata.hash + file + JSON.stringify(chunk.imports))`, no content. A content-only edit reruns with `needsReload = false`, and the commit carries the old `browserHash` forward (8.3.8 `node.js` ~35976–35985; 8.0.2 ~23179).
  - `runOptimizeDeps` sets `browserHash = getOptimizedBrowserHash(metadata.hash, deps)` with no timestamp (8.3.8 ~28581; 8.0.2 ~31274), so even a forced reload repeats the same hash on a second edit.
  - `metadata.hash` covers the lockfile and the config. Only a new optimizer session, seeded with a timestamp, gives a new `browserHash`, hence `server.restart(true)`. On 8.3.8 a `restart` called mid-restart is queued; on 8.0.2 it returns the in-flight promise and drops the force flag.
  - `resolveChokidarOptions` ignores `**/node_modules/**`. `server.watcher.add(<node_modules file>)` plus a real append gave 0 events on both versions (scratch `/tmp/p5a/stage5/watch-test.mjs`). Hence the plugin's own `fs.watch`.
- Map cost (ng deps dir): 27 maps, 6.5 MiB, read and parsed in 13 ms; 400 sources, realpath filter 9 ms; 45 watched directories.
- Probes (scratch `/tmp/p5a/stage5/`, `all-probes4.log` and `probe-f-*.txt`; not copied into `out/`):
  - vue c1–c4, ng c1/c4 (8.3.8, also with fresh plugin instances), ng c1/c4 on 8.0.2: the server restarts about 200–300 ms after the edit, one IPC restart goes out with the file as the reason, the `browserHash` is new, the edit is served, 0 failed imports, and no pre-edit hash remains among the boot's dep URLs.
  - c2/c3 (the old app reconnects at 0 s / 1.5 s): it gets `ns:restart-required` before the IPC. c1 (no socket): the IPC goes out about 2.5 s after the restart. c4 (a burst): 2–3 server restarts, 1 IPC, the final content served.
  - `--no-ipc` c3: 0 IPC; the old app received `ns:restart-required` after its 1.5 s late reconnect.
  - ng c4 on 8.0.2, second run: 2 IPCs. The last write's event arrived after the loop had requested the app restart, so a third server restart and a second app restart followed; the content was right. A residual race.
  - toolbox b4 (an edit of linked core): `ns:restart-required` plus IPC, no server restart.
- An edit to an installed (not linked) core under `node_modules` is not seen: Vite's watcher ignores `node_modules`, and core isn't pre-bundled. Stage-4 probe r1 covers it only with a synthetic watcher event. This predates phase 5a.

**Probes** (`out/phase5a-after/`, re-run in stage 6 on the final build): Angular full 18/18 (`probe-angular-full.txt`), toolbox 17/17 (`probe-toolbox-full.txt`), Vue 13/13 (`probe-vue-full.txt`), Angular `--only r4,r5,r6,r7,r8 --fresh-plugins` 5/5 (`probe-angular-r4-r8-fresh.txt`), toolbox r5/r6 2/2 (`probe-toolbox-r5-r6.txt`). `--fresh-plugins` is Angular-only (`probe-toolbox-fresh-attempt.txt` is that crash, stage 4), and Vue has no r-cases.
- Every run: warm-up discovery PASS (0 registered beyond the scan, `browserHash` unchanged), 0 imports the device could not load, and the static `require` check PASS: 0 free `require`/`__require`/`__non_webpack_require__`, 0 global-object calls, 0 parse errors. JavaScript bodies scanned (with `?t=`; with require-like tokens): Angular full 153 (92; 1), toolbox full 1,759 (59; 0), Vue full 53 (39; 6), Angular r4–r8 66 (16; 1), toolbox r5/r6 702 (4; 0). The probe fetches app modules, update modules and pre-bundles, not core, so the known-uncalled `System.import` site doesn't show.
- Negative control (scratch copy fetching the raw `fesm2022` file before the verdict, `--only a`): warm-up discovery FAIL, `@angular/animations/browser` registered, `browserHash` `1c126859` → `4b01b332`.

**Builds** (stage 6, `out/phase5a-after/release-*.sha256.txt`).
- Release: iOS and Android for ng and the toolbox are byte-identical to stage 1 (`out/phase5a-stage1/release-*.sha256.txt`).
- Dev (non-HMR) builds differ in `bundle.mjs` and its map (ng, toolbox) and `vendor.mjs` and its map (toolbox). Against a scratch build whose hashes equal stage 1's (`/tmp/p5a/rel-final`), the only differences are the `sourceMappingURL` line (absolute output path) and the maps' relative `sources`, which resolve to the same absolute files (scratch `/tmp/p5a/stage6/dev-compare.mjs`).
- The HMR `bundle.mjs` the ng crawl used is byte-identical between stage 1 and after (`out/phase5a-*/bundle-ng/bundle.mjs`).

**Checked:**
- vitest 928 tests in 89 files.
- `tsc -p tsconfig.lib.json`: 261 errors, all under `../core`.
- nx build and prettier pass.
- The crawls, probes and release comparisons above, every run sequential, on the final build.

**Not checked:**
- anything on a device;
- Android since stage 1, including app components with an installed core (DESIGN "Open");
- Solid and React (no fixtures);
- a NativeClass dependency inside a pre-bundle;
- that the `@nativescript/angular` hooks run through the pre-bundle's hot context on a device (the server side is checked above).

**Device checklist:**
1. **Angular fixture, iOS simulator, cold** (`node_modules/.vite` cleared): boot through the lazy home route; a template, a style and a class edit. The JIT-linked Angular pre-bundles must behave as the AOT-linked served files did.
2. **Warm restart:** stop and restart the dev server. The app restarts once and boots, and Vite logs no re-optimization.
3. **Vue fixture:** the log shows `[ns-require-probe] cjs=true esm-require=true`, i.e. core's `Color` is one class through the pre-bundled CommonJS package, a served `require` and an import.
4. **`NS_VITE_STRICT_REQUIRE=1` on iOS:** boot and one edit per kind, with no `require` error. Then decide the iOS default.
5. **Pre-bundled dependency edit:** append to a file of an installed, pre-bundled package (e.g. `nativescript-vue`'s dist). Expect a dev server restart, one app restart and the edit visible.
6. **Android:** an app with a custom `Activity` and core installed from npm. Check that core is single.

**Open** (also in DESIGN "Open"):
- **Android app components** import core at URLs without `?v=`, while an installed core is served with `?v=`: possibly two cores. Unmeasured.
- **Installed core edits** under `node_modules` go unnoticed (predates 5a).
- **Strict `require` default:** off; on for iOS after a device run?
- **Core's `System.import`:** use `import(path)` or remove it (a core change).
- **Angular JIT-mode linking** of pre-bundles, and the `@nativescript/angular` hot context, on a device.
- **Declared dependencies Rolldown can't bundle** fail the cold start through `include`.
- **An unresolvable bare import in any scanned file** turns pre-bundling off for the session; the stage-6 rule scans every linked or platform-main package in `dependencies`, imported or not.
- **Served packages the entries miss:** a subpath of a linked or platform-main package that its entry doesn't reach, and an undeclared platform-main package that a pre-resolver serves raw.
- **A non-literal `require` inside a pre-bundle** still compiles to `__require` and reaches the global `require`.
- **`@JavaScriptImplementation` on Android:** the extension the binding generator emits decides whether strict mode breaks it. Unverified.
- **Pre-bundle edit bursts on Vite 8.0.2:** a second app restart when the last event lands after the request; and 8.0.2's `server.restart` called mid-restart returns the in-flight promise and drops the force flag.
- **Deep imports of an included package** next to its pre-bundle: unmeasured.

## Round 20: phase 5c, boot dev like release (spike, `NS_VITE_BOOT_LIKE_RELEASE=1`)

**Question.** Can dev boot like release: `bundle.mjs` awaits the session and the app entry, there is no placeholder root, and the entry's own `Application.run` launches the app? The constraint: everything before `UIApplicationMain` must fit in the iOS launch budget (about 20 s on a device).

**iOS runtime** (ns-v8ios-runtime @ 7a94e204, the source of `@nativescript/ios` 9.1.2-next.2026-11-18, read-only):
- **`UIApplicationMain` from JS is always deferred.** `MetadataBuilder.mm:1353-1378` matches the C function by name, queues the call with `Tasks::Register`, and returns `undefined` to JS. This is unconditional: it applies from a microtask, inside a pump, and after boot. So `run` returns on iOS too; in the logs `entry evaluated` follows `Application.run called`.
- **The real call happens in `-[NativeScript runMainApplication]`** (`NativeScript.mm:128-210`):
  1. `RunMainScript`, then one `Tasks::Drain`.
  2. While the entry promise is pending (or module-graph work is in flight), a loop of `CFRunLoopRunInMode(default, 0.01)` followed by `Tasks::Drain`. Draining comes before polling, so `UIApplicationMain` takes over in the slice after `run`, even while `bundle.mjs` is still pending.
  3. A deadline of 120 s, after which the boot fails fatally.
  4. An entry that settles without `run` makes the process exit.
  5. An entry that rejects before the drain is fatal: the runtime logs and throws, which terminates the app, even when `run` was already queued.
- **No microtask starvation.** The real `UIApplicationMain` runs from the Tasks lambda, with no JS frames and no checkpoint on the stack. The microtask policy is V8's default `kAuto` (the runtime never sets one).
- **Fetching is concurrent.** `HttpLoader.mm:816-834` uses one ephemeral `NSURLSession`, `HTTPMaximumConnectionsPerHost = 16`, completions off the main queue. `ModuleInternalCallbacks.mm:1466-1667` walks the graph breadth-first and enqueues a module's imports when its body arrives. Debug request timeout is 30 s with one retry after 0.12 s (`HttpLoader.mm:365`, `912-934`).
- **The local entry's settle window** (`ModuleInternal.mm:51-58`, about 1 s) runs nestable V8 tasks (module fetches) but not the run loop. `fetch` completes on the run loop, so a `fetch` in `bundle.mjs`'s evaluation waits out that second.

**Spike** (uncommitted):
- `helpers/boot-like-release.ts` holds the flag.
- `helpers/main-entry.ts`: the dev boot module skips `installRootPlaceholder` and ends with `await startBrowserRuntimeSession(…, { bootLikeRelease: true })`. `bundle.mjs` imports the boot module statically, so it awaits it.
- `session-bootstrap.ts` under the flag:
  - loads the session and the loader config as modules: `/__ns_dev__/session.mjs` and `/__ns_dev__/import-map.mjs`, both in parallel, from new routes in `vite-plugin.ts` and `import-map-route.ts`;
  - before the entry import, installs a launch-event listener that marks boot complete on the next tick, and a one-shot `run` observer;
  - on a boot failure, never throws. It records `nsDev().bootFailed` and, if `run` was not called yet, launches the boot card in its error stage (`boot-error-root.ts`) through `Application.run`.
- `hmr/client/index.ts`: after a failed boot, the next update requests an app restart.
- The dev client drops the launch-notification bridge under the flag: app code now registers before launch.
- Measurement only: `spike-request-timing.ts` (`NS_VITE_SPIKE_REQUEST_LOG`, `NS_VITE_SPIKE_REQUEST_DELAY_MS`, middleware ahead of Vite's) and `NS_VITE_SPIKE_WARMUP=1` (`warmupRequest` of the boot module, the dev client and the entry at server start).

**The session fetch.** The first spike fetched the session as before, and `session` took 1,187 ms (server log: the request was answered at +0.2 s; the device received it about 1 s later). Loaded as a module it takes 12–22 ms. The placeholder path's `session` fetch takes about 490 ms, and the cause is not established. Its `bundle.mjs` settles at once, so the fetch completes only after `UIApplicationMain` and the placeholder launch have taken the main run loop; that is likely, but untested.

**Per-phase stamps** (ms from launch: first request, boot module evaluated, session ready, entry import start, entry evaluated, `run`, launch):
- vue hot: 830, 1227, 1256, 1259, 1296, 1296, 1619;
- vue cold: 820, 1482, 1513, 1517, 1585, 1585, 1904;
- ng hot: 803, 1237, 1258, 1261, 1316, 1316, 1616;
- ng cold: 820, 1579, 1607, 1612, 1752, 1751, 2049;
- ng hot +100 ms: 803, 3354, 3489, 3595, 4080, 4080, 4385.

The boot module graph (core) dominates. The timestamps print unconditionally under the flag, a departure from keeping instrumentation behind verbose: Angular printed none of the verbose device lines with `--env.verbose` (not investigated).

**Measurements** (iOS simulator `558CB0B8`, LAN address of this Mac, Vite 8.0.2 for ng and 8.3.8 for vue). Times are from launch:
- Relaunches are timed from host `simctl launch`. On a relaunch, the first request arrives at +0.79–0.83 s.
- First boots after a server start are timed from the first request minus 0.82 s.
- `run` is `Application.run called`; `launch` is the app's launch event (`didFinishLaunching`). `run` → launch is about 0.30 s of UIKit startup.
- "hot" is a relaunch against a server that has already transformed the graph. "cold" clears `node_modules/.vite` and `.ns-vite-build` and is the first boot after the server starts.

| flag on | vue run / launch | ng run / launch |
|---|---|---|
| hot (2 runs) | 1.29 / 1.61, 1.29 / 1.60 | 1.32 / 1.62, 1.33 / 1.63 |
| cold | 1.59 / 1.90 | 1.75 / 2.05 |
| cold + warmup | 1.31 / 1.61 | 1.36 / 1.65, 1.37 / 1.66 |
| hot, +30 ms per request (2 runs) | 1.96 / 2.26, 1.95 / 2.25 | 2.01 / 2.30, 2.01 / 2.30 |
| hot, +100 ms per request (2 runs) | 4.08 / 4.39, 4.01 / 4.32 | 4.08 / 4.39, 4.08 / 4.37 |
| requests / KiB | 328 / 8,994 | 335 / 9,096 |
| max in flight (30 and 100 ms runs) | 16 | 16 |

- **Serial or concurrent: concurrent.** Serial fetching would add requests × delay: about 10 s at 30 ms and 33 s at 100 ms. Measured: vue +0.66 s / +2.75 s, i.e. 22 / 27.5 sequential round trips; ng +0.68 s / +2.76 s, i.e. 23 / 27.6. That is graph depth combined with the 16-connection cap (335 / 16 ≈ 21 waves).
- **Placeholder path for reference** (flag off, ng hot): last boot response at +1.90 s (session +1.48 s). At +30 ms: +2.76 s, so +0.86 s, the same concurrency.
- **Warmup:** cold minus warmup is −0.28 s (vue) and −0.39 s (ng). The warmup settles in 104–188 ms; Vite's pre-transform of static imports then finishes before the CLI has installed and launched the app.

**Real device (extrapolation, not measured).** The simulator does not enforce the launch watchdog, and localhost is a lower bound. Boot ≈ launch (about 1–2 s) + device compile and evaluate (perhaps 2–3× the simulator's 0.5 s) + max(depth, requests / 16) × RTT (about 28 × RTT) + bytes / bandwidth + server transforms (+0.3–0.4 s cold).
- Wi-Fi RTT 5–50 ms → 0.15–1.4 s.
- 9 MB (ng on 8.0.2) or 17.9 MB (ng on 8.3.8, inline pre-bundle maps) at 30–100 Mbit/s → 0.7–4.8 s.
- Worst case about 8–10 s for these fixtures, inside the budget.
- **What the flag moves before launch.** With the placeholder, only the boot module graph (about 300 of 335 requests, mostly core) loads before `UIApplicationMain`. The session, import map, dev client and entry graph load after launch, outside the watchdog. With the flag the entry graph, including its cold server transforms (Analog's first compile, for instance), loads before launch too.
  - In these fixtures the entry graph is small: about 30 requests, 55 ms hot, 140 ms cold (ng), and about 5 round trips at +100 ms.
  - In a real app it is the term that grows, and its server-side part has no bound.
- A stalled request costs 30 s + 0.12 s + 30 s. The placeholder does not help when the server is unreachable or a boot-graph request stalls, because `bundle.mjs` statically imports `/@vite/env` and the boot module over HTTP in both modes. It does help when an entry-graph request or transform stalls.
- **A lever for that term:** hold the app launch until the server's warmup crawl is idle (`environment.waitForRequestsIdle()`, present in 8.0.2 and 8.3.8), so cold transforms are spent before the process exists. On ng cold, the warmup's `warmupRequest`s settle in 199 ms and the crawl goes idle at 250 ms (static imports only; the lazy home route is not crawled).

**Checks on the simulator** (flag on; fixture files restored after each run):
- **Cold boot:** vue and ng boot.
- **Vue:**
  - template edit (`Counter.vue`): applied;
  - soft reboot (`app/setup.ts`): `setup v2` logged, root replaced;
  - syntax error: "HMR update failed" overlay with the compiler message; the fix applies in place.
- **Angular:**
  - template edit: applied;
  - class edit in `home.component.ts`: soft reboot through `main.ts`;
  - syntax error: overlay; the fix reboots.
- **The soft reboot needs nothing from the placeholder:** `frameworks/core/client/reboot.ts` arms its own `run` → `resetRootView` redirect at dispose time.
- **Boot error before `run`:**
  - vue, a `throw` in `app/app.ts`: the error card shows `spike boot throw`, and the HMR client connects.
  - ng, a syntax error in `src/main.ts`: the card shows `HTTP import failed … (status=500)`, and on connect the HMR overlay shows Vite's compile error above it.
  - In both cases the fix triggers `app restart required: the app failed to boot (…)`, the CLI restarts the app, and it boots.
  - The card's copy still reads "Retrying after a boot failure" (placeholder wording).
- **Server stopped:** the same in both modes. `bundle.mjs` fails to instantiate (`HTTP import failed: …/@vite/env (network error)`), the runtime reports "Fatal: the main module failed to run", and the app exits. The runtime also logs "module graph walk missed …/@vite/env — falling back to a blocking synchronous fetch. This should not happen; please report it."

- **Flag off, final build** (Vue): placeholder boot as before (`real app root committed`, `[ns-boot] ok total=545ms`), launch bridge installed, `setup.ts` soft reboot applied.
- A failure after `run` (the app still launches) sets no `bootFailed`, so later updates apply normally.

**Not checked:** Android (the code depends on neither `run` returning nor launching first), a physical device, toolbox (TS flavor), a throw in the entry after `run`.

**Deletable if adopted** (not deleted):
- `root-placeholder.ts` (709 lines: patched `run`, `resetRootView` wraps, finalize polling, `knownApplications`, the `__NS_DEV_PLACEHOLDER_*` globals) and `placeholder-hooks.ts`;
- `launch-bridge.ts`;
- the boot heartbeat and `boot-progress.ts`;
- the fetch-based `/__ns_dev__/session` and `import-map.json` routes;
- `setDevBootComplete`'s native call (older runtimes only);
- the Android `resetRootView` deferral in `runtime/core-aliases-early.ts` (verify on Android);
- the stale comment in `reboot.ts` about the placeholder restoring `run`.

`root-placeholder-view.ts` and the overlay's boot refs stay only if the boot error card does.

**Trade-off of deleting the placeholder:** nothing is on screen until `run`, so a slow boot on a device shows only the launch screen.

**Runtime:** no change needed, and nothing beyond thin mode's existing minimum: the boot handoff loop is in c5e9886e (#383, first tag v9.0.4-next.2026-08-19). Tested only on 9.1.2-next.2026-11-18. The 30 s debug fetch budget is in builds from 2026-11-15 on (43e5c3a5). Citations opened directly: `MetadataBuilder.mm:1353-1378`, `NativeScript.mm:126-210`, `ModuleInternal.mm:48-58`, `HttpLoader.mm:362-368` and `824-830`. The microtask policy, the graph walk and the retry come from a subagent's read.

## Round 21: phase 5c, boot like release (implementation)

**What changed** (uncommitted; DESIGN "Boot like release"). The spike's path is the only path: there is no flag and no placeholder root.
- **`bundle.mjs`** is the bundled `runtime/dev-boot-loader.ts`, about 8 KB with no static HTTP import:
  1. `import(origin + '/@vite/env')`, with a 6 s reachability timeout;
  2. `await import(<boot module>)`;
  3. if either fails, or the boot module exports a `bootFailure`, it launches the fallback screen.
- **The boot module** ends with `export const bootFailure = await startBrowserRuntimeSession({ sessionUrl, importMapUrl }, verbose)`.
- **`session-bootstrap.ts`**:
  - loads `session.mjs` and `import-map.mjs` as modules, in parallel;
  - imports the dev client, then the entry;
  - marks boot complete on the tick after the launch event;
  - never rejects. It resolves the failure only if `Application.started` is still false, and then cancels the boot-complete listener.
- **Fallback screen** (raw UIKit through the runtime, so no served code is involved):
  - **dev server unreachable:** a text screen plus an alert; it polls `GET /__ns_dev__/restart` every 2 s, and the first answer asks the CLI to restart the app;
  - **boot failure:** the device error and stack, plus the server's recent transform error (`GET /__ns_dev__/boot-failed`). The server restarts the app on the next file change and drops the stale `full-reload` that Vite keeps for the next socket connection;
  - the window sits at `UIWindowLevelNormal + 1`, above core's own launch window.
- **Server**:
  - `hmr/server/dev-boot-routes.ts`: the `restart`, `boot-failed` and `warm` routes, the transform-error capture, and the boot-graph warm-up (`warmupRequest` of `\0virtual:ns-dev-boot`, the dev client and the entry, then `waitForRequestsIdle`);
  - `hmr/server/dev-routes.ts`: the path constants;
  - the session and import map are served only as modules; the dev client no longer installs the launch-notification bridge.
- **The launch hold:** `helpers/ns-cli-plugins.ts` delays the HMR build's first CLI notification until `GET /__ns_dev__/warm` answers, with a 30 s cap. In the logs: the server warmed up in 368–596 ms, and the build waited 5–454 ms.
  - It reaches the dev server at `server.host` when that names one interface, otherwise on loopback, and over https when `server.https` is set (certificate not checked).
  - The CLI's `useHttps` flag doesn't reach the build's resolved config. With it set and `server.https` unset, the hold would wait the full 30 s; not tested.
  - The fallback's `NSURLSession` calls also assume a certificate the device trusts.
- **Angular printed no verbose device lines** because of `helpers/logging.ts`. `resolveVerboseFlag` caches its first result, and `angular.ts` called it with no CLI flags before `baseConfig` did, so `--env.verbose` was lost. It now defaults to `getCliFlags()`. Angular prints `[ns-entry] …` lines again.
- **The verbose boot stamps** are `[ns-entry] session start | session ready | importing entry | entry evaluated | launch event t=<ms>`.
- **Spike measurement code moved to the fixtures:**
  - `tools/vite-server-env-spike/request-timing-plugin.mjs` (`NS_SPIKE_REQUEST_LOG`, `NS_SPIKE_REQUEST_DELAY_MS`; it also logs the remote address) is wired into both fixtures' `vite.config.mts`;
  - `thin-crawl.mjs` and `payload-probe.mjs` read the module-form session and import map.
- **Core:** `application.ios.ts` `run()` loses its placeholder branch (36 lines). That branch was dead without the `__NS_DEV_PLACEHOLDER_*` globals. The fixtures still run the core tarball, which is unaffected.
- **Deleted** (`git rm`):
  - `root-placeholder.ts` (709 lines) and its spec (215);
  - `root-placeholder-view.ts` (326);
  - `placeholder-hooks.ts` (31);
  - `launch-bridge.ts` (89);
  - `boot-progress.ts` (57) and its spec (81);
  - `boot-placeholder-ui.ts` (128) and its spec (109);
  - `boot-complete.ts` (27);
  - the overlay's boot mode (`dev-overlay*.ts`, about −500 lines);
  - the Android `resetRootView` deferral in `core-aliases-early.ts` (85);
  - `setDevBootComplete`, `knownApplications`, and the `__NS_DEV_PLACEHOLDER_*` declarations.
  - Net, in this phase's files: +392 / −3,198 lines, plus 339 new lines in the loader and routes and 4 new specs.
- **Specs:** vitest 896/896 in 88 files (one spec file was rewritten, four are new). `tsc`: 261 errors, all under `../core`.

**Simulator checks** (final build, Vue and Angular):
- **Cold boot** (`.vite` cleared): both apps boot.
- **Template edit:** applied in place.
- **Soft reboot:** works (Vue `setup.ts`; Angular class edit through `main.ts`).
- **Syntax error + fix:** the overlay appears and the fix applies.
- **Boot error before `run`:** the fallback card shows. Cases: Vue, a `throw` in `app/app.ts`; Angular, a syntax error in `src/main.ts`. Angular's card also shows Analog's message (`main.ts:7:28: Property assignment expected.`). The fix triggers one restart.
  - Two earlier builds restarted twice. The first time, core's launch event started the HMR client, which then got a `full-reload`. The second time, Vite replayed its buffered `full-reload` to the restarted app. Both are fixed: the boot-complete cancel, and dropping that payload.
- **Server stopped, then relaunch:** "Dev server unreachable" shows (screen plus alert). After `ns run` starts, the log has `Restarting the app on ios: the dev server is reachable again`. The CLI also restarts the app itself after its build, so this scenario boots twice.
- **Vue relaunch timings, launch → `entry evaluated` / launch event:** 1.50 / 1.80 s and 1.28 / 1.59 s; requests 322 / 8,893 KiB. That matches the spike (Round 20). The table there still describes this boot.

**Pre-bundling an installed core** (`NS_VITE_PREBUNDLE_CORE=1`, off by default; `helpers/optimize-deps.ts` `getNsOptimizeDepsExclude`, `helpers/dev-optimize-deps.ts`; outputs in `out/phase5c-prebundle-core/`):

| cold crawl, `--bundle` | ng off | ng on | vue off | vue on |
|---|---|---|---|---|
| device requests | 324 | 81 | 319 | 74 |
| device KiB (inline maps included) | 17,711 | 18,915 | 8,881 | 10,091 |
| raw core requests | 254 | 0 | 252 | 0 |
| pre-bundled deps / js files | 24 / 34 | 24 / 46 | 13 / 16 | 12 / 23 |
| core files inlined | 0 | 240 | 0 | 238 |
| duplicates / two URLs / duplicate instances / beyond scan / reloads | 0 | 0 | 0 | 0 |

- **Core stays one instance:** it is never served raw. The 14 core files missing from the maps hold only re-exports (Rolldown emits nothing for them). The import map points `@nativescript/core` at the pre-bundle.
- **Bytes rise 7–14%:** the pre-bundles carry inline source maps and code the boot never evaluates. Requests fall about 75%. Cold optimize time is unchanged (crawls 5–7 s).
- **Fixes it needed:**
  - core's names in `NS_OPTIMIZE_DEPS_EXCLUDE` are no longer re-added through the "platform-main" rule;
  - `@nativescript/core/xhr` (imported by `virtual:ns-xhr-polyfill`) and `@nativescript/core/file-system` (imported by the injected `runtime/module-require.js`) are added to `include`. The scanner never reads either importer, and otherwise each was registered at the first request.
  - That list is hand-written for these two fixtures; another core subpath that only unscanned code imports would re-optimize the dev server.
- **Linked core:** a linked or workspace-source core stays excluded, so its edits keep reaching the graph.
- **Simulator** (final build, flag on, cold):
  - ng: 86 requests / 5,928 KiB, Vite 8.0.2. A relaunch reaches `entry evaluated` at 1.21 s and launch at 1.52 s, against about 1.32 / 1.62 s with the flag off. The template edit, class edit (soft reboot) and syntax error + fix all work.
  - vue: 78 requests / 10,103 KiB. `[ns-require-probe] cjs=true esm-require=true` (one `Color` class) and the `setup.ts` soft reboot both work.
- **Not checked:** the payload probes with the flag on; Android, whose app components import core without `?v=`, so two cores are likely there; an edit to an installed pre-bundled core (that goes to `nsPreBundleWatchPlugin`).

**iPhone (iPhone 11 Pro, iOS 26.0.1): blocked, nothing measured.**
- **The CLI doesn't see the phone.** `ns device ios` lists only simulators: the phone is paired over the network only, not USB-connected.
- **The app was built and installed by hand instead:**
  - `ns build ios --for-device --team-id U56623MFCT` set up signing;
  - the HMR `bundle.mjs` was copied into `platforms/ios/vue/app`;
  - then `xcodebuild` and `devicectl device install app` (script `$CLAUDE_JOB_DIR/tmp/p5c/device-hmr-install.sh`).
- **The phone never reaches the dev server.** `devicectl device process launch --console` with `OS_ACTIVITY_DT_MODE=enable` streams the console. Every request fails with `NSURLErrorDomain -1009`, `_NSURLErrorNWPathKey=unsatisfied (Local network prohibited)`, with the server down and with it up on `192.168.1.100:5173`; the server saw no request from the phone.
  - The cause is iOS's Local Network permission for the new bundle id, not yet granted on the phone.
  - Network access alone unblocks the measurements: the hand-install path works without the CLI. USB is needed only for the restart checks (the CLI restarts only the device it deployed to).
- **Signed with team `U56623MFCT`** (Blackout Lighting Console Inc.), with `-allowProvisioningUpdates`; I took the team id from q2-blackout's `build.xcconfig`. That may have registered an App ID and a development profile for `org.nativescript.spike.vue` on that account.
  - Leftovers: `org.nativescript.spike.vue` is installed on the iPhone, and `tools/vite-server-env-spike/apps/vue/platforms/ios` holds the device build (not tracked).
- **The fallback did run on the device:** `CONSOLE ERROR: [ns-entry] the dev server at http://192.168.1.100:5173 is unreachable …`, then the 2 s `restart` polls. So the unreachable path works on hardware; its UI was not seen (no screenshot tool for devices here).
- **To unblock:** connect the iPhone by USB (so `ns run ios --device 00008030-000408D42692802E` deploys, streams logs and restarts it), and allow Local Network for the spike apps on the phone.

**Slow-boot path** (design only; not built, pending iPhone numbers):
1. If the boot module hasn't resolved after a budget of about 12 s, the loader launches early: it calls `UIApplicationMain` with core's delegate, puts a placeholder window up, and keeps importing.
2. When the entry later calls `Application.run`, core's iOS `run` sees `nativeApp` and takes `runAsEmbeddedApp`. Instead it must set the root on the existing window, then refire what UIKit already delivered: the launch event, `UIApplicationDidFinishLaunchingNotification` observers, and `didBecomeActive`.
3. That needs a small hook in core (a "launched by the dev loader" branch in `run`). It replaces both the patched-`run` → `resetRootView` path and the launch bridge.

**USB transport for module requests** (idea, not built):
- The CLI already forwards the inspector socket over usbmux: the device listens and the host connects ("debugger has opened inspector socket on port 18183").
- usbmux connects host → device only. So for module fetches, the runtime would listen on a device-local port, the CLI would hold a connection to it, and requests would flow device → host over that connection (peertalk-style), served by the dev server.
- On the runtime side, `HttpLoader` gets an alternative transport for `http://<origin>` URLs.
- On the CLI side, a usbmux proxy (ios-device-lib's port connection) to the dev server.
- It needs USB anyway, and the CLI already requires USB to deploy to a device. iOS 17+ CoreDevice tunnels are host-initiated as well; whether an app can reach the host through one is unverified.

**Not checked:**
- the iPhone;
- Android, including the deleted `resetRootView` deferral and the fallback screen, which is iOS-only (Android rethrows);
- the toolbox (TS flavor);
- visionOS / embedded hosts (`NS_SWIFTUI_BOOT`), where the old placeholder skipped `run` when a host `UIApplication` already existed. The fallback calls `UIApplicationMain`, which would assert there.

## Next

1. A device route: `/ns/e/*` → `environments.nativescript.transformRequest(unwrap(url))` → `thinPostStep`.
2. Session `entryUrl` → `/ns/e/src/main.ts`.
3. Import map, from `configureLoader`: core and its 9 deps → the existing core/deps bundles; `@nativescript/core` externalized in the `nativescript` environment.
4. Run toolbox on an iOS simulator. Check boot, `Frame` navigation and that a TS edit re-imports.
5. Angular/Analog in a workspace that has `@angular/core`.
