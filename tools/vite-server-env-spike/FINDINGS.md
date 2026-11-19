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

## Next

1. A device route: `/ns/e/*` → `environments.nativescript.transformRequest(unwrap(url))` → `thinPostStep`.
2. Session `entryUrl` → `/ns/e/src/main.ts`.
3. Import map, from `configureLoader`: core and its 9 deps → the existing core/deps bundles; `@nativescript/core` externalized in the `nativescript` environment.
4. Run toolbox on an iOS simulator. Check boot, `Frame` navigation and that a TS edit re-imports.
5. Angular/Analog in a workspace that has `@angular/core`.
