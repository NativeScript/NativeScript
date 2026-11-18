# @nativescript/vite: thin-only design

**Goal.** One dev mode. The device runs Vite's client-environment output, and a port of Vite's browser client handles updates. NativeScript adds only what a browser has and a NativeScript app lacks: a module loader over HTTP, no DOM, and no `location.reload`.

**Principle.** Use Vite's own semantics wherever a browser would. Frameworks decide HMR through their own Vite plugins (Analog, plugin-vue, vite-plugin-solid, …), not through NS server strategies. NS code exists only where there is no browser equivalent, and its contract is Vite's public client events.

The inventory behind this is the subagent map in `$CLAUDE_JOB_DIR/tmp/nsvite-map/inventory.tsv` (227 files, 51k LOC). The summary is in FINDINGS.md.

## Architecture

### Serving: `/ns/v<vite-url>` (exists)
- Every device module is `environments.client.transformRequest(<vite-url>)`. Root-relative specifiers are rewritten to `<origin>/ns/v…`. Core files carry a `__NS_CORE_MODULES__` registration footer, and `/@vite/client` is `thin-vite-client`.
- Normalise requests the way Vite's transform middleware does before calling `transformRequest`: remove `t` and `import`, and map `Accept: text/css` to `?direct`. Otherwise one file gets several graph nodes.
- **One origin source** (`getServerOrigin`) for the session, client bootstrap, import map, `bundle.mjs` core URLs and the thin route. Today the `Host` header, `getServerOrigin`, `NS_HMR_HOST` and `server.host` can each produce a different value.
- No vendor bundle in dev: drop `vendor.mjs`, the deps bundle and `vendor-bootstrap`, which today are imported unconditionally and possibly load a second copy of `@angular/*`. Import-map keys come from resolving the app's dependencies through the client plugin container, not from the vendor manifest. Android SBG keeps only its build-time stub.

### Module identity: Vite's `?t=` stamps
- Under `/ns/v`, `t` becomes part of the module key: the loader's canonicalization stops stripping it for that prefix. A fresh module then has a fresh URL, exactly like the browser. No server-computed eviction sets, and no hot-key canonicalization.
- The cost is the browser's: replaced instances stay in memory until a full reload.
- A full reload means: evict every app-owned URL (`getLoadedModuleUrls` minus core, vendor and the dev client) and re-import the entry. That mechanism already exists (`jsFullReload`).

### Transport: Vite's HMR protocol
- **Preferred:** the device joins Vite's own HMR WebSocket (`hmr.path`, `vite-hmr` subprotocol). `connected`, `update`, `full-reload`, `prune`, `error`, `custom` and `vite:invalidate` then work natively, and plugin `server.ws.on` handlers receive device events. NS extras become custom events (`ns:*`). To verify: Vite only checks the token when an `Origin` header is present; does the device socket send one?
- **Fallback:** `/ns-hmr` relays the full payload set unchanged and forwards device custom events into `environments.client.hot`.

### Device client: a port of `vite/dist/client/client.mjs`
- A serialized message queue, with awaited listeners (`vite:beforeUpdate`/`afterUpdate`/`beforeFullReload`/`beforePrune`/`error`/`ws:*`).
- **`js-update`:** no-op when the module has no hot entry → await dispose(data) → `import('/ns/v' + acceptedPath + '?t=' + ts)` → accept callbacks with the deps-positional array. A failure inside a circular import → full reload.
- **`css-update`:** stylesheet owners on `vite:beforeUpdate`. That is the Angular renderer today; `updateStyle` covers CSS modules.
- **`full-reload`:** `vite:beforeFullReload`, then the in-process graph reset.
- **`prune`**, **`error`** (NS overlay), and **`hot.invalidate()` → `vite:invalidate`** to the server.
- Hot contexts are keyed by the exact Vite URL (`createHotContext(ownerPath)`).
- The registry keeps `on`/`off` for app-lifetime owners. The NS overlay is driven by these events instead of `ns:hmr-pending`.

### Frameworks
No NS server strategies for updates. Each framework's Vite plugin produces stock payloads; the device client applies them.
- **Angular** (Angular CLI parity):
  - `.html` and `styleUrl` edits update in place: `angular:component-update` and `css-update`. This already works.
  - `.ts` edits → full reload. Analog's component-update for a `.ts` save replaces metadata only and never applies class-body changes, so the server turns it into a full reload.
  - A root-component metadata update also → full reload, because `page-router-outlet` can't survive `ɵɵreplaceMetadata`.
  - `@nativescript/angular` disposes its platform on `vite:beforeFullReload` and bootstraps again when the entry re-evaluates (`Application.hasLaunched()`).
  - State save/restore later: a DI provider contract in `@nativescript/angular` that the reworked router implements, fed by a data bag that `@nativescript/vite` keeps across a full reload. Not `feat/vite-hmr`.
- **Vue:** plugin-vue's `js-update` → `__VUE_HMR_RUNTIME__` (needs nativescript-vue 3 checked).
- **Solid, React, plain TS:** stock `full-reload` unless the framework's own refresh plugin is enabled.
- **Global `app.css`:** a real Vite module imported by the entry, so `js-update` → `updateStyle` covers it. This replaces `virtual:ns-app-css`, `ns:css-updates`, `app-css-state` and connect-sync.

## Phases
1. **Thin is the only mode; delete what thin never reaches.** Delete the `/ns/m` pipeline, `/ns/core`, `/ns/rt`, `/ns/entry`, `/ns/node`, the vendor unifier, the shared transform cache, the device rewriting and helpers, and the Angular register-only rewrite and boot gate. No behavior change in thin. Check: unit tests, plus Angular fixture boot and template/CSS HMR on the iOS simulator.
2. **Transport, client port and `?t` identity.**
   - Angular `.ts`/root → full reload, with the `@nativescript/angular` dispose hook.
   - Delete `ns:angular-update` and the reboot, `ns:hmr-delta`/`update-pipeline`, the module graph and the prologue's delta step.
   - Check: Angular `.html`/`.css`/`.ts`/root edits on one pid.
3. **Vendor bundle out; new import-map key source.** Measure duplicates before and after.
4. **Flavors.** TS, Solid and React fixtures (full reload); Vue (plugin-vue `js-update`). Delete the flavor strategies, `root-reset` and `hooks` (`__NS_HMR_ON_UPDATE__`).
5. **Android.**

## Open (needs a decision)
- **Public API.** `./framework` (`runHotUpdatePrologue`, `NsHotUpdateContext`, the strategy types), `./hmr/client/framework`, `__NS_HMR_ON_UPDATE__` and `./solid-bootstrap`'s HMR remount all disappear in phases 2–4. Third-party flavors would then plug in as Vite plugins instead.
- **Angular `.ts` → full reload** versus keeping Analog's metadata-only update for component `.ts` saves.
- **Workers:** `workerHmrUrlPlugin` is `/ns/m`-only, so workers need a thin equivalent.
