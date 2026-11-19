# @nativescript/vite: thin-only design

**Goal.** One dev mode. The device runs Vite's client-environment output, and a port of Vite's browser client handles updates. NativeScript adds only what a browser has and a NativeScript app lacks: a module loader over HTTP, no DOM, and no `location.reload`.

**Principle.** Use Vite's own semantics wherever a browser would. Frameworks decide HMR through their own Vite plugins (Analog, plugin-vue, vite-plugin-solid, …), not through NS server strategies. NS code exists only where there is no browser equivalent, and its contract is Vite's public client events.

**Globals.** Device code inside one world shares state through ESM imports: every served module has one URL and therefore one instance, and `bundle.mjs` evaluates once. State that crosses `bundle.mjs` ↔ served (or string-generated) device code lives on one object, `globalThis[Symbol.for('nativescript.dev')]` (`hmr/shared/runtime/dev-globals.ts`, see "Dev globals"). Libraries such as `@nativescript/angular` use standard `import.meta.hot`. What remains outside the dev object:
- keys core owns: `__NS_DEV_PLACEHOLDER_ROOT_VIEW__`/`__NS_DEV_PLACEHOLDER_ROOT_EARLY__` (read by core `application.ios.ts`) and `__NS_LAST_XML_ERROR__` (written by core `ui/builder`);
- `__NS_HMR_OVERLAY_POSITION__`, an app-facing override;
- `__NS_DEV_TELEMETRY__`/`__NS_TELEMETRY__` (manual opt-in diagnostics) and the optional `__NS_HMR_IMPORT__` hook.

The before → after table is in FINDINGS.md round 14.

The inventory behind this is the subagent map in `$CLAUDE_JOB_DIR/tmp/nsvite-map/inventory.tsv` (227 files, 51k LOC). The summary is in FINDINGS.md.

## Architecture (as built after phase 4a)

### Serving: plain Vite URLs
- **The device fetches `<origin><vite-url>`, exactly as a browser would.** Vite's own middleware answers every module request: transform, `?t=`/`?import` handling, `?direct` CSS, ETag/304, `/@fs`, `/@id`, `/node_modules/.vite/deps`. There is no NS module route and no URL prefix. Static specifiers stay as Vite's import analysis writes them, root-relative, and the runtime resolves them against the importer's HTTP URL.
- **`/@vite/client` is our device client.** `nsViteClientPlugin` (`enforce: 'pre'`, client environment only) resolves `/@vite/client`, and the alias Vite installs for it, to `hmr/client/thin-vite-client.ts`. The device URL stays `/@vite/client`; the module's graph URL is `/@vite/client.js`, because Vite appends the resolved file's extension.
- **One device-request middleware runs ahead of all others** (`hmr/server/device-requests.ts`, placed with `useFirst`, i.e. before Vite's own middlewares and before `enforce: 'pre'` plugins' ones). It:
  - strips the runtime's transport-only `__ns_dev_nonce` from `req.url` and `originalUrl`, so it never reaches Vite's graph or any route;
  - records a module response as served once it finishes (2xx JavaScript, or a 304 that isn't a stylesheet), under its client-graph URL, for the boot-race catch-up (see "Failures");
  - rewrites dynamic imports in JavaScript responses (next bullet);
  - waits, on the first request, until the `@nativescript/core` directory is resolved and added to `fs.allow`.
- **Dynamic `import('/…')` is made absolute at response time — an interim.** The iOS runtime resolves a dynamic `import()` with a non-`http(s)` specifier on the filesystem and strips its query (`ModuleInternalCallbacks.mm`, `ImportModuleDynamicallyCallback`), so `import('/src/app/home/home.component.ts')` from a lazy route fails. `absolute-dynamic-imports.ts` prefixes the origin to every root-relative string-literal dynamic import in a 2xx JavaScript body (`es-module-lexer`), query untouched; static imports are left alone.
  - **Why at response time, not in a `post` transform:** Vite's soft invalidation (`vite:import-analysis` → `transformRequest` reuse with re-stamped imports) rewrites `?t=` only on specifiers equal to the imported module's root-relative URL. A transform-time absolute URL would keep a stale `?t=` after an edit further down the chain, and the device would re-import the old instance. Rewriting the response leaves Vite's cached transform and its re-stamping intact. The ETag stays Vite's: for one origin the rewrite is a pure function of the body.
  - Non-literal dynamic imports go through Vite's `__vite__injectQuery`, which our client's `injectQuery` serves: it prefixes the origin to a root-relative result.
  - Goes away once the iOS (and Android, to check) runtimes keep the URL `ResolveSpecifierToPath` already computes against an HTTP referrer, with its query (REVIEW-DECISIONS, phase 3b).
- **NS endpoints live under `/__ns_dev__/`:** `session`, `client` (the bootstrap) and `import-map.json`. No `/ns/*` route remains. These are not module responses, so they are never recorded as served.
- **`server.fs.allow`:** Vite's middleware enforces it, as `transformRequest`'s load fallback does. `baseConfig` keeps `searchForWorkspaceRoot(projectRoot)` first, because setting `fs.allow` replaces Vite's default, then adds the workspace roots of linked dependency checkouts. The HMR plugin adds the `@nativescript/vite` package directory in `configResolved` and the `@nativescript/core` directory once the client resolver can resolve it, each as given and as a real path (`allowServedDirs`). Vite reads the list on every check, so late entries count. Files the device requests directly (bootstrap modules, `bundle.mjs` externals, import-map targets) are checked before any import analysis could mark them safe.
- **Import map** (`/__ns_dev__/import-map.json`, `buildImportMap` in `import-map-route.ts`): each bare specifier → origin + the Vite URL of the file Vite's client resolver picks (`viteUrlForFile`, so one file has one URL), with the resolver's query kept, so a target equals the URL import analysis writes for the same specifier. Exact keys only, no prefix entries.
  - **Why it is small.** Import analysis rewrites every bare specifier in served code, `bundle.mjs` externals and the bootstrap's imports are absolute URLs, and the runtime's native `require` never reads the map (it resolves on disk only). The map serves only bare specifiers the device resolves itself at runtime: an app's `import(expr)` that evaluates to a package name. No such site exists in the toolbox or the Angular fixture.
  - **Keys** (`collectImportMapSpecifiers`, `import-map.ts`): `@nativescript/core`; the package names in the app's `package.json` `dependencies` (no devDependencies, no subpaths, minus the omit list, `@nativescript/vite` and the platform runtimes); the strategy's `importMapSpecifiers()` (Vue, Solid); the `node:` builtins. A key that doesn't resolve gets no entry. A target must be a regular file: a resolved directory (an alias to a CSS-only package such as `nativescript-theme-core`) gets no entry. Each target file is added to Vite's internal `config.safeModulePaths`, the set Vite's own import analysis fills, so a target outside `fs.allow` (an aliased out-of-tree checkout, a global pnpm store) is served without widening `fs.allow` on a LAN-bound server. `safeModulePaths` is not public API; if Vite renames it, the registration silently does nothing and such targets get 403.
- **Host check:** Vite's `allowedHosts` rejects unknown `Host` headers. Loopback and IP literals pass by default; `allowDeviceHost` adds the `NS_HMR_HOST` hostname, when it is one, to the resolved config before the server is created.
- **Core registration footer:** a serve-only, client-environment `transform` (`nsCoreRegistrationPlugin`, `core-registration.ts`) appends to every `@nativescript/core` script file a self-import by its own Vite URL plus the registration in the dev globals' `coreModules`. Import analysis then stamps the self-import with the module's own `?t=`, so the registered instance is the one the device evaluated. A timestamped (HMR) instance replaces the registered one; otherwise the first claimant keeps its key.
- **Base:** only `base: '/'` is supported on device. The device URLs, the import map and `bundle.mjs` externals are origin + Vite URL with no base.
- **One origin source:** `getServerOrigin(server)` for the session, the client bootstrap, the import map, `bundle.mjs` core URLs and the dynamic-import rewrite. The `Host` header is never used.

### Dependencies: served as their own files
- **No NativeScript pre-bundling.** Every dependency file is a plain Vite URL answered by Vite's middleware, like app code. There is no deps bundle, no `vendor.mjs` and no vendor registry on device.
- **Vite's dep optimizer is off in dev by default, for every flavor** (`configuration/base.ts`: `optimizeDeps: { noDiscovery: true, entries: [], include: [] }`). With no `include`, Vite creates no dep optimizer at all, so no URL carries `?v=` and nothing re-optimizes mid-session (which would be an app restart).
  - `nsOptimizeDepsPolicyPlugin` (`helpers/optimize-deps.ts`), the first plugin of the base config, captures `optimizeDeps.include` from the flavor config merged with the app's `vite.config` in a `config` hook ordered before every other, and forces `noDiscovery`, `entries: []` and that list in `configResolved`. Includes added by other plugins (Analog adds Angular's) are dropped.
  - **Why not Vite's discovery** (measured, FINDINGS round 16): with core installed as a real `node_modules` directory, Vite's resolver stamps `?v=<browserHash>` on every resolved `node_modules` `.js` once an optimizer exists. `bundle.mjs` and the client bootstrap name core's files without it, so the device evaluated 215 core files twice. The optimizer also pre-bundled nothing there, since everything else is imported from inside `node_modules`.
- **CommonJS dependencies** go through Vite's standard escape hatch: list them in `optimizeDeps.include`. The React flavor lists `react` and `react-reconciler`. The pre-bundles use NativeScript's builtin-module stubs, the platform resolver and the NativeClass transform.
  - **Version guard** (`hmr/server/version-query-guard.ts`): once an optimizer exists, a client-environment `enforce: 'pre'` resolver drops `v` from resolutions under the `@nativescript/core` and `@nativescript/vite` package directories, so served code, the import map, `bundle.mjs` externals and the bootstrap name one URL per file.
  - `NS_OPTIMIZE_DEPS_EXCLUDE`: `@nativescript/core`, `@nativescript/vite`, `@valor/nativescript-websockets` (one instance, shared with `bundle.mjs` and the dev client), plus `module`/`node:module`/`set-value` (aliased to local shims the optimizer doesn't apply).
- **CommonJS `require` on device** is the `bundle.mjs` shim (`helpers/main-entry.ts`), the final `globalThis.require`: `ns:`/`node:` → the runtime's require; Node builtins → `{}`; under HMR, `@nativescript/core[/sub]` → `nsDev().coreModules` (only modules already evaluated); anything else → the runtime's require, which resolves on disk only. A served dependency can't `require()` another npm package over HTTP; a pre-bundle inlines its own CommonJS requires.
- **Device-side core lookups** (`core-aliases-early`, `root-placeholder`, `dev-overlay-shared`) go through that `require`; the served `/@vite/client` (`thin-vite-client.ts`, `restyle.ts`) and the TS/JS reboot module import `@nativescript/core` as ESM.
- **Android SBG:** nothing vendor-related is emitted at build time. The static binding generator walks every `.js`/`.mjs` under `assets/app` (`Main.java` `traverseDirectory`) and needs no file by name; the old `ns-vendor.mjs` stub was emitted only in HMR builds and was a no-op for it.

### Defines
- `config.define` is the single source: `getGlobalDefines` (`helpers/global-defines.ts`) plus the app's own entries.
- **Build.** Vite substitutes it in `bundle.mjs`, bare identifiers and member chains (`global.isIOS`, `process.env.NODE_ENV`) alike. Bundled device code reads defines as bare identifiers (`__ANDROID__`, not `g.__ANDROID__`), so substitution covers them.
- **Dev.** Vite's client environment does no define substitution in served modules. The first import of `bundle.mjs` is `<origin>/@vite/env`, Vite's own module. It assigns every define on `globalThis`, user defines and dotted keys included, before the externalized core graph evaluates.
  - It must stay an external import placed first: a bundled module's body runs after the externalized core.
  - It is the only installer, so building `bundle.mjs` with HMR active fails when no device-reachable origin resolves (`helpers/main-entry.ts`).
- **Worker realms** have no `bundle.mjs`; Vite's `/@vite/env` reaches them through the worker entry (see "Workers").
- The kept defines are the contract shared with `@nativescript/webpack` or read by core and app code (list in FINDINGS round 14). `__NS_HMR_PROGRESS_OVERLAY_ENABLED__` is read only by bundled overlay code (`overlay-flag.ts`).

### Dev globals: `Symbol.for('nativescript.dev')`
- `hmr/shared/runtime/dev-globals.ts` holds the `NativeScriptDevGlobals` type, the accessor `nsDev()`, and `NS_DEV_EXPR`, the same lookup as a JS expression for code generated as strings (the `bundle.mjs` require shim, the core footer, worker constructors, the `/__ns_dev__/client` bootstrap).
- The module is stateless and dependency-free. `bundle.mjs` and the served graph each evaluate their own copy, and both resolve the same object.
- Only state crossing `bundle.mjs` ↔ served or string-generated device code goes here. State inside one world is module state.
- Members:
  - `bootComplete`: set by `bundle.mjs` once the first app root is up. The `/__ns_dev__/client` bootstrap waits for it.
  - `knownApplications`: the `Application` instances the boot placeholder saw. Only the placeholder (`root-placeholder.ts`, in `bundle.mjs`) reads it.
  - `overlay`: the dev overlay installed by `bundle.mjs`, driven by the served HMR client (`overlay-driver.ts`).
  - `httpOrigin`: the dev server origin the session booted from. Generated worker code resolves worker URLs against it.
  - `coreModules`: served `@nativescript/core` modules by require key, registered by each one's footer. Read by the `bundle.mjs` require shim.
  - `cjsShape`: ESM namespace → plain object for CommonJS callers. Installed by `bundle.mjs`, used by the core footer and the require shim.

### Module identity: Vite's `?t=` stamps
- The loader keeps every query param of a module URL, `t` and `import` included, exactly as a browser does. The module key is the device URL, i.e. origin + Vite URL.
  - `getCanonicalization` sends only `preserveQueryFor` (`/@ng/component`) plus the strategy's volatile patterns; with no `forPathPrefixes`, the runtime strips nothing.
  - Only `__ns_dev_nonce` is transport-only; the device-request middleware strips it before Vite sees the request.
- A re-imported module therefore has a fresh URL. There are no server-computed eviction sets and no hot-key canonicalization.
- The cost is the browser's: replaced instances stay in memory until the app restarts.

### Transport: Vite's HMR WebSocket
- The device joins Vite's own HMR socket. Vite accepts the upgrade when two conditions hold:
  - the path is `base + server.ws.path` (`server.hmr.path` `/vite-hmr` is mapped onto it) and the subprotocol is `vite-hmr`;
  - either no `Origin` header is sent or the URL carries `?token=<webSocketToken>`. Both device sockets (iOS SocketRocket, the Android bridge) send `Origin`, so the token is always passed.
  - Vite mints a random token for every resolved config, so each `server.restart()` gets a new one. `nsHmrClientVitePlugin` pins the first token of the process onto every resolved config in `configResolved`, the object Vite's upgrade check reads. The `wsUrl` the device booted with therefore stays valid across restarts.
- The session descriptor (`/__ns_dev__/session`) carries:
  - `wsUrl`: `ws(s)://<origin host>[:ws port]<base + ws.path>?token=…`;
  - `wsProtocol: 'vite-hmr'`.
- `connected`, `update`, `full-reload`, `prune`, `error`, `custom`, `ping` and `vite:invalidate` work natively. Plugins' `server.ws.on` handlers receive device events.
- The device socket is `@valor/nativescript-websockets`. It supports subprotocols on iOS (`initWithURLRequestProtocols`) and Android (`Sec-WebSocket-Protocol`).
- **The NS custom events** (`hmr/shared/protocol.ts`) are `ns:restart`/`ns:restart-required` (see "Soft reboot vs app restart") and `ns:rerun` (see "Soft reboot"). Stylesheets travel as Vite modules (see "Global `app.css`").
- Gone: `/ns-hmr`, the `server.ws.send` relay, socket roles, the module-graph mirror and its full/delta messages, `ns:hmr-pending`, `ns:angular-update`, `ns:css-updates` and its connect-sync, the Vue SFC registry and the TS module registry.

### Device client: a port of `vite/dist/client/client.mjs`
Modules in `hmr/client/`:
- `hmr-client.ts`: a port of `HMRContext`/`HMRClient`/`Queue`, plus decline tracking, `notifyListenersSettled` and the owner-targeted `notifyOwnerListeners`.
- `hot-state.ts`: the singleton `hmrClient`, `createHotContext`, and the entry boundary's `registerEntryBoundary`. `thin-vite-client` re-exports the public ones from `/@vite/client`.
- `vite-transport.ts`: the WebSocket transport, ping and `waitForSuccessfulPing`.
- `index.ts`: `start()`, `handleMessage`, the reboot and restart sequences, and overlay driving.
- `thin-vite-client.ts`: `/@vite/client` itself: `updateStyle`/`removeStyle`, `injectQuery` and the re-exports.
- `restyle.ts`: `scheduleRestyle()` (see "Global `app.css`").

Shared with the server:
- `hmr/shared/protocol.ts`: event names and payload types.
- `hmr/shared/update-modules.ts`: `createUpdateModules`, the `isRerun`/`isChanged`/`modules` payload lookups.

Behavior:
- **Bootstrap.** `/__ns_dev__/client` waits for the dev globals' `bootComplete`, then calls `start({ wsUrl, wsProtocol, entryUrl, origin, root })`. The server bakes all of these in, so nothing travels through globals. `root` is Vite's project root, so error locations are root-relative from the first payload on. Contexts exist from boot; the socket attaches at `start()`. The boot overlay's stage while the session bootstrap loads it is `loading-client`.
- **Queue.** A serialized message queue, with awaited listeners (`notifyListeners` = `Promise.allSettled`).
- **`update`.**
  1. `vite:beforeUpdate`.
  2. If a `js-update` has the app entry as its boundary: `nativescript:beforeReboot` (see "Soft reboot").
  3. `nativescript:beforeRerun`, targeted to the re-running modules (see "Soft reboot").
  4. Each `js-update` runs through `queueUpdate(fetchUpdate)` exactly as Vite does:
     - a no-op without a hot entry;
     - otherwise await `dispose(data)` of the accepted module only, then `import(origin + path + '?' + (explicitImportRequired ? 'import&' : '') + 't=' + ts + (query ? '&' + query : ''))`;
     - accept callbacks get the deps-positional array;
     - a failure inside a circular import → app restart.
  5. `css-update` runs listeners only. Stylesheet owners such as the Angular renderer react on `vite:beforeUpdate`.
  6. For an entry update: await the framework's settle signal, then `nativescript:afterReboot`.
  7. `vite:afterUpdate`.
- **`full-reload` is an app restart:**
  - `vite:beforeFullReload` (best effort), then `nativescript:beforeRestart` (awaited, best effort), then `ns:restart { reason }` to the server.
  - `.html`-path and `ifFallback` reloads are skipped, since the device has no HTML page.
  - Nothing is evicted in-process.
- **`hot.data`** has Vite's semantics: it survives a hot update of the same module, and a restart wipes it.
- **`prune`.** `vite:beforePrune`, then dispose → prune → delete data.
- **`error`.** `vite:error`, then the NS overlay's `failed` stage: the root-relative location, the message and Vite's code frame. Nothing in the app changes (see "Failures").
- **`custom`.** Listeners. Internal listeners also handle:
  - `ns:rerun`, keeping the module sets for the next `update`;
  - `ns:restart-required`.
- **The dev client does its I/O without the app's globals.** It uses no `fetch` or XHR, which Zone.js patches and which failed under it. Modules, stylesheets included, come through `import()` (the runtime's loader).
  - What remains is the app's `WebSocket` polyfill, the only socket there is.
  - `setTimeout`/`setInterval` remain for the ping, the reconnect backoff and the settle/`beforeRestart` timeouts. Zone.js patches them too, but they work under it.
- **Hot contexts are keyed by the exact Vite URL** given to `createHotContext(ownerPath)`.
  - `hot.send` → `{type:'custom', event, data}`.
  - `hot.invalidate` → `vite:invalidate {path, message, firstInvalidatedBy}` to the server; Vite propagates it.
- **Disconnect.** `vite:ws:disconnect` → wait for a `vite-ping` socket to open → reconnect with the same `wsUrl`. The client does nothing else.
  - This deliberately deviates from Vite's browser client, which reloads the page once the server is back.
  - The device's modules stay valid while the server is unchanged. On the reconnect the server sends one catch-up reboot if the device missed updates (see "Failures"). A server that restarted asks for an app restart itself.
- **Overlay.** Driven from these events: the update, reboot and restart stages and errors. Every `failed` stage carries a "Restart app" action (see "Failures").
- There is no registry-level `on`/`off` and no `__NS_HOT_REGISTRY__`. App-lifetime owners use `import.meta.hot` in their own module.

### Soft reboot: an HMR update with the app entry as its boundary
- **Injection.** For a flavor whose `FrameworkServerStrategy.entryBoundary` names a teardown (Angular: `@nativescript/angular`'s `prepareHmrReboot`/`whenHmrRebootSettled`; TypeScript and JavaScript: the same pair from `@nativescript/vite/hmr/frameworks/core/client/reboot.js`, see "Frameworks"), `hmr/server/entry-boundary.ts` prepends this to the app entry. It runs after the framework's compile and before Vite's import analysis:
  ```js
  import { registerEntryBoundary } from '/@vite/client';
  import * as framework from '<module>';
  if (import.meta.hot) {
    import.meta.hot.accept();
    import.meta.hot.dispose(() => framework.prepareHmrReboot?.());
    registerEntryBoundary(() => framework.whenHmrRebootSettled?.());
  }
  ```
- **What Vite does with it.**
  - The entry is self-accepting, so an edit anywhere below it propagates to `js-update { path: entry, acceptedPath: entry }`, unless a closer boundary accepts it first.
  - Vite stamps `?t=` on the changed module's importer chain, so the device's `import(entry?t=)` re-evaluates exactly that chain. Unchanged modules are cache hits and keep their instances.
  - Same idea as webpack's `module.hot.accept()` in `main`.
- **Without an entry boundary**, which is the case for Solid, React and Vue today, an edit with no closer boundary reaches a dead end. Vite sends `full-reload`, which is an app restart.
- **Which modules re-run.** `ns:rerun { timestamp, changed, rerun, root }` precedes every `update` with a `js-update`.
  - `rerun` is each `acceptedPath` plus the imports reachable from it whose current `?t=` stamp the device has never been served (`ServedModules`, see "Failures"): exactly what the device's import re-evaluates. Templates are graph nodes but never device modules, so an in-place template update has an empty `rerun`.
  - Going by served stamps rather than the update's own timestamp covers every edit since the last update that went out, including those of saves whose update failed its check.
  - Vite also stamps the importers above a boundary that stops early, such as a template accepted in place; those stay out because the walk starts at the `acceptedPath`.
  - A custom event carries it because Vite rebuilds its `update` payloads and Analog buffers them.
  - `changed` and `rerun` hold the URLs the device imports: a graph URL that isn't a path, such as a virtual module's, goes out as `/@id/__x00__…` (`deviceUrlForGraphUrl` in `hmr/server/vite-url.ts`), so `isRerun` matches it on the device.
- **Events.** All are dispatched client-side through `hot.on` and awaited. `dispose` keeps Vite's semantics: it fires only for each accepted module.
  - `nativescript:beforeReboot` (entry updates only): `{ entry, changed, rerun, modules, isRerun(id), isChanged(id) }`.
  - `nativescript:beforeRerun` (every update with `js-update`s): `{ timestamp, changed, rerun, modules, isRerun, isChanged }`.
    - It is dispatched **only** to the listeners registered by the hot contexts of modules in `rerun`, keyed by owner path. It is never broadcast.
    - It fires once per module per payload, even with several boundaries, and before any boundary's `dispose`.
    - Vite disposes only the boundary, so this is how an intermediate module's old instance releases what it holds, e.g. `import.meta.hot?.on('nativescript:beforeRerun', () => off())` for root listeners.
  - `nativescript:afterReboot`: the `beforeReboot` payload plus `error` when the entry import failed or the settle signal reported a failed boot (it rejected or resolved `{ error }`). It fires after the framework's settle signal (Angular: bootstrap plus `ApplicationRef.whenStable()`, capped at 5 s, and participant restore; TS/JS: the new root view loaded), waited for up to 15 s. It is skipped right away when the entry import failed.
  - `nativescript:beforeRestart` `{ reason }`: before the device asks for, or is told about, an app restart.
  - **Order:** `vite:beforeUpdate` → `nativescript:beforeReboot` → `nativescript:beforeRerun` → entry `dispose` (framework teardown) → `import(entry?t=)` → framework bootstrap and restore → `nativescript:afterReboot` → `vite:afterUpdate`.
- **Payload lookups.** `isRerun(id)`, `isChanged(id)` and `modules` (`'changed'` for an edited file, `'rerun'` for one re-evaluated only because of the chain) accept a module's own `import.meta.url` (`<origin>/src/x.ts?t=…`), its Vite URL or owner path, or its absolute file path.
  - They strip the origin, `t` and `import`, and keep identity queries (`hmr/shared/update-modules.ts`). Typical:
    ```ts
    import.meta.hot?.on('nativescript:beforeReboot', (e) => { if (e.isRerun(import.meta.url)) cleanup(); });
    ```
  - Types ship as `@nativescript/vite/client`, which augments Vite's `CustomEventMap`; add it to `compilerOptions.types`.
- **Failures:** see "Failures" below.
- **Workers** are terminated when the module instance that constructed them re-runs (see "Workers").

### Soft reboot vs app restart
- **Soft reboot**: the entry-boundary HMR update above. It re-evaluates app modules only.
- **App restart**: a new process, for everything a hot update can't apply, including every Vite `full-reload`. iOS can't relaunch itself, so the NativeScript CLI performs it. The dev server asks for it with one function, `requestAppRestart(reason)` (`hmr/server/app-restart.ts`):
  - Requests within 250 ms collapse into one, with deduplicated reasons joined by `; `.
  - **With an IPC channel** (`process.send`), it sends the CLI `{ type: 'nativescript:restart', reason }`.
  - **Without one**, which is today's CLI (`vite serve` spawned with `stdio: 'inherit'`), it logs `[NativeScript] restart the app to apply: <reason>` and sends devices the custom event `ns:restart-required { reason }`.
  - Devices are always sent `ns:restart-required` too, so they run `nativescript:beforeRestart`, show a persistent "Restart required" overlay and apply nothing further.
- **Triggers:**
  - **Vite `full-reload`**: no HMR boundary reached (a flavor without an entry boundary, or a worker edit, see "Workers"), a removed TS/JS page, `angular:invalidate`, or anything else Vite reloads for.
  - **Code that evaluates once per process changed.** A client-environment `pre` `hotUpdate` handles an edit to a file the device loaded as JS (`modules` has a `js` node) whose Vite URL is not app-owned (`isAppOwnedViteUrl` in `hmr/server/app-restart.ts`; the prefixes come from `resolveNonEvictableViteUrlPrefixes`, the `@nativescript/core` and `@nativescript/vite` package directories):
    - anything under `node_modules`, including `/@fs/…/node_modules`;
    - a linked core or `@nativescript/vite` under `/@fs/…`.

    It returns `[]`, so Vite sends nothing (no `?t=` second instance next to the live one), and requests a restart. Vite never watches `node_modules`, so in practice this fires for workspace-linked sources under `/@fs/` (toolbox's `packages/core`), or with a user `server.watch.ignored` negation.
  - **Boot bundle changed.** In the `vite build --watch` process (IPC already exists), `helpers/ns-cli-plugins.ts` now sends the existing `emittedFiles` message (`isHMR: false`, `buildType: 'incremental'`) after an HMR rebuild only when `bundle.mjs`'s content hash changed. The CLI already copies those files and restarts the app through livesync. `bundle.mjs` is byte-stable across identical builds (`boot-bundle-hash.mjs`).
  - **`import.meta.hot.decline()`.** Vite 8.3.8 ignores it on both sides, so this is NativeScript's mapping: a `js-update` whose boundary or updated module declined makes the device send `ns:restart { reason }`.
  - **A soft reboot that can't recover** (see "Failures"): its teardown throws (the entry `dispose` or a `nativescript:beforeReboot` listener), or a retry fails again outside the re-run modules. The device sends `ns:restart`.
  - **"Restart app" on the overlay's `failed` stage**: the device sends `ns:restart`.
  - **A missed update without an entry boundary**: the catch-up on connect (see "Failures") requests a restart.
  - **A participant asks for it.** `@nativescript/angular`'s `requestNativeScriptAppRestart(reason)` sends `ns:restart` through its own `import.meta.hot`.
  - **Vite restarted itself** (`server.restart()`, a config edit). Module state of `@nativescript/vite` survives the in-process restart while plugin instances don't, so a module-level counter detects a second `configureServer`. The first device connection afterwards requests one restart.
    - The pinned `webSocketToken` (see Transport) keeps the device's original `wsUrl` valid, so it simply reconnects.
  - **Not a trigger: `@NativeClass`.** A re-evaluated class gets a new runtime class, and new uses pick it up.
- **Device → server:** `ns:restart { reason }` arrives through `server.ws.on('ns:restart')` and becomes `requestAppRestart(reason)`.
  - On the device, `requestRestart(reason)` lives on the runtime and runs once, after `nativescript:beforeRestart`.
  - It is held while the socket is down and sent on reconnect.
  - From then on, the device drops `update`, `full-reload` and `prune`; custom events still reach listeners.

### Failures
A broken save shows an error on the device and leaves the running app as it is. The next good save applies everything since the last update that went out. A restart is the fallback only where the app can't be trusted any more.

- **Compile check (the update gate, `hmr/server/update-gate.ts`).** `nsRerunPlugin` wraps `server.ws.send`. Every payload to the device passes through a queue, so payloads leave in the order they were sent.
  - An `update` with a `js-update` is checked first. The checked set is the re-run set plus, for an accepted template, the component modules that import it (an in-place template update re-runs nothing on the device, yet a broken template must not apply).
  - Each checked module goes through `environments.client.transformRequest` with its graph URL (`transformIdForViteUrl` for `/@id/` URLs), then through the flavor's `verifyTransform`. The results stay in Vite's transform cache for the device's fetches.
  - **Angular's `verifyTransform`** (`hmr/frameworks/angular/server/compile-check.ts`) rejects output that lacks `ɵcmp`/`ɵɵdefineComponent` for a source with `@Component`. Analog with type checking disabled doesn't throw for a broken template: it emits the uncompiled decorator. The message is recovered by parsing the template with the app's own `@angular/compiler` (`parseTemplate`).
  - **On failure** the device gets Vite's standard `error` payload, `{ type: 'error', err: { message, stack, id, frame, loc, plugin } }`, instead of `ns:rerun` + `update`. Nothing is disposed.
  - **On success** `ns:rerun` goes out right before the `update`.
- **Gated events.** A flavor's in-place events (`FrameworkServerStrategy.gatedEvents`; Angular: `angular:component-update`) are held until the update of the same save passes, and dropped when it fails. Held events whose save produces no update are released after 200 ms. Analog batches its notifications and flushes them in object form (`{ type: 'custom', event }`), so both the string and the object form are recognized.
- **The next good save.** `rerun` comes from what the device has loaded (served `?t=` stamps), so it covers every module changed since the last update that went out. `changed` accumulates the edits of failed saves too.
- **No `error` to an empty channel.** Vite would buffer it and replay it, possibly stale, on the next connection. The catch-up checks again instead.
- **Evaluation errors after dispose.** The entry import throws, because a module in the chain throws at evaluation:
  - the overlay shows the error with the stack's device URLs shortened to Vite URLs, `afterReboot` reports `error`, and the process stays alive;
  - stack URLs inside the update's `rerun` are evicted from the runtime's module records (`invalidateModules`). A module outside `rerun` is live, and evicting it would make a second instance;
  - the next update retries, and its fresh `?t=` URLs bypass the failed records;
  - **escalation:** the first failure never restarts. A second consecutive failure restarts when the stack's device URLs lie outside `rerun`; when the culprit can't be placed (no device URLs in the stack, or no module set), the same message twice in a row stands in for "outside".
- **Retry teardown.** The retry runs the entry `dispose` and `nativescript:beforeReboot` again. Which disposer runs depends on how far the failed attempt got: when a dependency threw, the old app's; when the entry body or the bootstrap failed, the new entry's. Either way it is the framework's `prepareHmrReboot`, which must be a no-op on an app that is already torn down or half built.
- **Teardown failure.** The entry `dispose` or a `nativescript:beforeReboot` listener throws or rejects on a live app: the listeners that did run have already released their part, so the device requests an app restart.
- **Bootstrap failure.** A settle signal that rejects or resolves `{ error }` counts as a failed boot: the overlay shows it, and the next update retries. It doesn't count toward the escalation rule.
- **"Restart app".** Every `failed` overlay stage carries this action; a tap sends `ns:restart`. iOS draws it in the overlay's own `UIWindow`, a subclass that, in toast mode, passes touches outside the button through to the app; Android uses a native `Button`; the in-tree fallback a core `Button`.
- **Boot race and catch-up.**
  - The device-request middleware records, per client-graph URL, when it was served and under which `?t=` stamps (`ServedModules` in `hmr/server/served-modules.ts`). The served time is when the request arrived, so an edit that lands while Vite transforms the module counts as after the fetch. There is one record per dev server, shared by all devices.
  - Every client `hotUpdate` (order `post`, after the framework hooks) records, per graph URL in `ctx.modules`, the timestamp of the last save that edited it (`getModuleEdits`). These are the modules whose own code changed, not the importers Vite re-stamps on the way to a boundary.
  - A save whose update reached a connected client, as an update or an `error`, is "delivered".
  - On `vite:client:connect`: the device opens its HMR socket only after `bootComplete`, so the connect is the boot-complete signal, and it covers reconnects too.
  - **Missed modules** (`findMissedModules`): a served module is missed when something compiled into it was edited, by a save that wasn't delivered, after the module was served. "Compiled into it" is the module itself plus, transitively, the non-script modules it imports that the device never fetched (a component's template and stylesheets). A script module the device hasn't fetched yet will be served fresh, so it doesn't count, and neither does an importer Vite only re-stamped.
  - Any missed module triggers exactly one catch-up:
    - with an entry boundary, a synthetic entry `js-update` preceded by `ns:rerun` (`rerun` from served stamps; compile-checked first, `error` instead if the check fails);
    - without one, `requestAppRestart`.
  - A normal boot has no edit newer than its fetches, so it gets no catch-up.
  - **Limitation:** tracking is per server, not per device connection. HTTP module fetches can't be attributed to a WebSocket connection, and simulators share `localhost`. With two devices, one booting while the other is connected can miss an update.

### Global `app.css`: a Vite CSS module
- **Import.** `nsAppCssModulePlugins()` (`hmr/server/app-css-module.ts`), serve only, every flavor, prepends `import "<Vite URL of app.css, else styles.css>";` to the served client entry, without a newline, so it adds no line of its own (the entry boundary's prepended block does add lines). Vite serves the stylesheet as CSS-as-JS: `updateStyle(<absolute file id>, css)`, self-accepting, `hot.prune(removeStyle)`.
  - An edit of it, of an `@import`ed partial or of a PostCSS dependency (Tailwind content) is a `js-update` with `path` and `acceptedPath` both the stylesheet's URL, applied in place.
  - The update gate's compile check covers it, as part of `rerun`.
  - Platform `@import`s go through `createPlatformCssPlugin`'s transform; the theme goes through aliases.
- **The hot-update hook.** A second plugin's client `hotUpdate` handles two cases:
  - **Analog** swaps an edited `.css` for its importers, here the entry, so the edit would reboot the app with a stale stylesheet. The hook puts the stylesheet's own modules back.
  - **A content dependency** (a file one of whose graph nodes the stylesheet imports, e.g. a Tailwind content file): the hook appends the stylesheet's module to the edit's modules. Without a JS module among them, Vite answers an `.html` edit with `full-reload` (`isClientHtmlChange`), which would restart the app instead of updating the stylesheet. The file-only carrier stays: Vite shares one asset node per file across every stylesheet that depends on it.

  Its hook is `order: 'post'`, and the plugin is not `enforce: 'post'` and is listed ahead of `nsRerunPlugin` (`hmr/server/index.ts`), so it runs before the update gate's `post` hook.
- **Restyle.** `updateStyle`/`removeStyle` (`hmr/client/thin-vite-client.ts`) swap the tagged CSS and call `scheduleRestyle()` (`hmr/client/restyle.ts`): one microtask-batched `restyleRootAndModals(Application.getRootView())`. Core's tagged-CSS calls only invalidate the selector tables. This applies to every Vite CSS module, Vue SFC styles included.
- **Cold boot.** The stylesheet evaluates as one of the entry's imports, before the entry body, i.e. before `Application.run` and the first real root view. Dev applies the raw text, which core parses with css-tree; release applies the rework AST (see "Open").
- **Core's launch-time `loadAppCss`** applies an untagged raw copy of `./app.css` from the bundler context in TS/JS apps. Under HMR (`mode === 'development'` and `--env.hmr`) the context leaves the global stylesheet out (`excludeGlobalStylesheet`), so the tagged module is the only copy: core finds neither a module nor a file and silently applies nothing. Release keeps it.
- **Release** is unchanged: `virtual:ns-app-css` in `bundle.mjs` applies the rework AST under the `app.css` tag before any view is created.
- **A CSS edit missed during boot** is caught up like any other module (`findMissedModules`, see "Failures"): a reboot with an entry boundary, a restart without.

### Workers
- **Dev rewrite.** `workerHmrUrlPlugin` (`helpers/workers.ts`, serve only, `enforce: 'post'`) rewrites Vite's dev `new Worker(new URL("/src/x?worker_file&type=classic", '' + import.meta.url)[, opts])` to `new Worker(<httpOrigin> + "/src/x?worker_file&type=module"[, opts])`.
  - It always asks for `type=module`: NativeScript evaluates an HTTP worker entry as ESM, and for `type=module` Vite prepends `import "/@vite/env"` to the worker entry. The worker realm has no `bundle.mjs`, so that import is what installs the defines before served core evaluates there.
  - The URL is a string, not an import, so the worker entry has no importer in Vite's graph.
- **Ownership.** A worker belongs to the module instance whose code constructed it. A helper injected into that module terminates its workers on `nativescript:beforeRerun` (which reaches every re-run module, accepted boundaries included) and on `hot.prune`.
  - It leaves `hot.dispose` alone: a module has one dispose slot, and the entry's is the framework teardown. A module's own `hot.prune` replaces the helper's.
  - **Trade-off:** a worker spawned through a module that isn't re-run survives a reboot, even when its re-run caller spawns another.
- **Worker edits.** An edit to the worker entry, to a worker-only import, or to a util shared with main-realm code dead-ends at the worker entry. Vite sends `full-reload`, i.e. an app restart: the main-realm HMR client can't update a worker isolate.
- **Toolbox demo:** `apps/toolbox/src/__spike__/spike.worker.ts`, `worker-helper.ts` and `worker-spawner.ts`, behind the "worker-spike" button in `main-page.xml`.

### CLI contract for app restarts (to implement in nativescript-cli)
1. Spawn `vite serve` with an IPC channel: `stdio: ['inherit', 'inherit', 'inherit', 'ipc']`, or `fork`. Keep stdout/stderr inherited, so logs stream as today.
2. Handle `message` events from that child. `{ type: 'nativescript:restart', reason: string }` means: restart the app process on the device(s) of that platform, with the same install and no rebuild. That is `restartApplication` for the platform's live devices.
   - Log `reason` once at info level.
   - Ignore unknown message types.
   - One message stands for any number of collapsed requests.
3. After the restart the app boots from its bundled `bundle.mjs`, fetches a fresh session from the same dev server, and reconnects. The CLI needs to do nothing else.
4. `vite build --watch` (unchanged channel): under HMR, an incremental `emittedFiles` message (`isHMR: false`) now also arrives when `bundle.mjs` changed. The existing handler, which copies the files and then emits `BUNDLER_COMPILATION_COMPLETE`, already restarts the app.
5. Without IPC the dev server degrades to a terminal line and an on-device notice, so an older CLI keeps working.

### Frameworks
No NS server strategies for updates. Each framework's Vite plugin produces stock payloads, and the device client applies them. `FrameworkServerStrategy` feeds the import map (`importMapSpecifiers`, `volatilePatterns`, `preserveQueryPaths`), names the entry boundary (`entryBoundary`) and plugs into the update gate (`verifyTransform`, `gatedEvents`; see "Failures").

**Angular.** Analog runs in default mode with `liveReload: true`. In the probe, compilation-API mode compiled components without Angular's HMR initializer and full-reloaded even `.html`/`.css` (FINDINGS round 11). An NS plugin in `configuration/angular.ts` (`hmr/frameworks/angular/server/hmr-payload-rules*.ts`) adjusts Analog's payloads:
- **Template and style edits stay in place**: `.html` and `styleUrl` edits through `angular:component-update` and `css-update`, and a `.ts` save that only changes `template`/`templateUrl`/`styles`/`styleUrl`/`styleUrls`.
- **Class edits reboot.**
  - A `pre` `hotUpdate` hook compares each component `.ts` save with the previous source, with those `@Component` initializers blanked out. Any other difference marks the class stale.
  - The `server.ws.send` wrapper drops the stale class's `angular:component-update`.
  - A `post` `hotUpdate` hook restores the graph nodes' `isSelfAccepting` that Analog set to `true` (it marks the edited component's modules, on the nodes themselves, which stops Vite's propagation at the component). Vite then propagates to the entry boundary.
  - The stale set clears when an entry update or a page `full-reload` goes out. It is state, not per save, because Analog buffers its component update and flushes it after the hooks settle.
- **Root component edits reboot** the same way: `page-router-outlet` can't survive `ɵɵreplaceMetadata`.
- **`angular:invalidate` → `full-reload`**, i.e. an app restart, as Angular CLI full-reloads; Analog lacks it.
- **`/@ng/component` boot gate.** Every compiled component fetches `/@ng/component?c=<id>&t=<now>` when its module evaluates. Analog answers with a real `_UpdateMetadata` payload whenever that module was invalidated at any point in the server's lifetime.
  - Without the gate, a re-evaluated component would replace its own metadata at boot, which for the root tears down `page-router-outlet` and leaves a blank screen.
  - The rules plugin records the latest `angular:component-update` timestamp it sent per id. A middleware ahead of Analog's (`enforce: 'pre'`) lets through only a fetch echoing that exact `(c, t)`; anything else gets `export default undefined;`.
- **`@nativescript/angular`** (literal `import.meta.hot`, which Vite injects into served `node_modules` files too; no globals):
  - `prepareHmrReboot()`, called from the entry's `dispose`:
    1. saves HMR participants from the root injector;
    2. detaches the launch/exit handlers;
    3. `disposeLastModules`/`disposePlatform`;
    4. `ɵresetCompiledComponents` (clears the component-id map behind NG0912).

    It is idempotent: a second call, on a retry after a failed reboot, is a no-op. It is also a no-op under webpack or release.
  - The re-evaluated entry calls `runNativeScriptAngularApp`, which bootstraps right away (`Application.hasLaunched()`, reason `hotreload`). Once bootstrap and `ApplicationRef.whenStable()` (capped at 5 s) settle, participants restore in the new injector, and `whenHmrRebootSettled()` resolves.
    - It resolves `HmrRebootResult = void | { error }`, `{ error }` when the bootstrap failed. It never rejects, so it leaves no unhandled rejection when nobody awaits it.
    - Participants' state belongs to the last good app: it survives a failed attempt and the retry's second teardown, and is restored when a retry succeeds.
  - **Participant contract:** a multi-provider `NATIVESCRIPT_HMR_PARTICIPANTS` of `{ key; version?; save(): unknown; restore(state): void | Promise<void> }`. Snapshots live in the library's module scope, which is never re-evaluated. Version mismatches and failures are logged and skipped. No participants ship yet (router, dialog and NgRx come later).
  - The renderer listens for `vite:beforeUpdate` for external styles.
  - `NATIVESCRIPT_STYLE_BASE_URL` defaults to the origin of the library's own `import.meta.url` when that is http(s), behind `if (import.meta.hot)`. Webpack compiles that branch to `if (false) {}`, without errors or warnings, and no `file://` path leaks.

**TypeScript and JavaScript.** Both strategies' `entryBoundary` is `@nativescript/vite/hmr/frameworks/core/client/reboot.js` (package export `./hmr/frameworks/core/client/reboot[.js]`, source `hmr/frameworks/core/client/reboot.ts`) with `prepareHmrReboot`/`whenHmrRebootSettled`. The entry calls `Application.run(entry)` on every evaluation; the reboot module turns that call into a root reset.
- **`prepareHmrReboot()`**, called from the entry's `dispose`:
  - closes modals through the root view's `_closeAllModalViewsInternal()` (internal; the same call core's livesync makes);
  - remembers the topmost page's `moduleName`;
  - arms a one-shot redirect: the re-evaluated entry's `Application.run(entry)` becomes a synchronous `Application.resetRootView(entry)`. It is armed at dispose time because the boot placeholder restores the original `run` once boot completes. The original `run` is never called after launch: iOS would present the new root as a modal, and Android throws "Application is already started".

  It is idempotent: a retry calls it again, possibly on an app whose new root never mounted, and the page to restore stays the last good app's.
- **`whenHmrRebootSettled()`** resolves once the new root view is loaded. It resolves `{ error }` when `resetRootView` threw (e.g. an XML parse error in the root or default page), the root didn't change, or `run()` had no entry. It resolves at once, disarming the redirect, when the entry never called `run`. It never rejects.
- **`restorePageAfterHmrReboot()`**, opt-in. A reboot lands on the root module's default page. Called from an `afterReboot` listener in the app entry, it re-navigates the topmost frame to the page that was current (`clearHistory`, no animation, no navigation context or back stack). Only pages navigated to by `moduleName` restore. It returns whether it navigated.
  ```ts
  import { restorePageAfterHmrReboot } from '@nativescript/vite/hmr/frameworks/core/client/reboot.js';
  import.meta.hot?.on('nativescript:afterReboot', (event) => {
    if (!event.error) restorePageAfterHmrReboot();
  });
  ```
- **The bundler context is served.** Under HMR the served entry imports `virtual:ns-bundler-context` through a flavor-owned serve transform (`createEntryBundlerContextImportPlugin`, `helpers/bundler-context.ts`), prepended without a newline. The context holds each `.xml?raw` and stylesheet `?raw`, plus the code-behind paired with an XML (TS) or every `.js` but the entry (JS).
  - The HMR `bundle.mjs` doesn't bundle the context; its `virtual:ns-ui-registration` keeps core's UI nicknames and View guards. Release is unchanged.
  - The served entry's imports come in this order: the context, the entry boundary, the global stylesheet, then the entry's own source.
  - Every page XML, code-behind and whatever they import therefore sits below the entry, and an edit to one propagates through the context to the entry boundary.
  - On re-evaluation the context unregisters every name it registers before registering again (`createContextUnregisterCode`): core's `registerBundlerModules` keeps an existing `.xml`, `.css` or plain `.js` name, whose loader closes over the old context.
  - An added page registers with the next edit that reboots. A removed page is a `full-reload`, i.e. an app restart.
  - Page stylesheets are `?raw` context imports, so editing one reboots rather than restyling in place.
- **The old page's handlers.** A root reset fires no `navigatingFrom`/`navigatedFrom`. `unloaded` fires: synchronously on Android, and on iOS when UIKit's `viewDidDisappear` runs.

**Other flavors:**
- **Vue:** plugin-vue's `js-update` → `__VUE_HMR_RUNTIME__` (needs nativescript-vue 3 checked). No entry boundary.
- **Solid, React:** no entry boundary yet, so an edit without a closer boundary restarts the app. They get an entry boundary later (remount via `resetRootView`).

## Phases
1. **Thin is the only mode; delete what thin never reaches.** Done (FINDINGS round 10).
2. **Transport, client port and `?t` identity.** Done (FINDINGS round 11). 2b: app restarts (FINDINGS round 11). 2c: the entry-boundary soft reboot, the event bus and the Angular reboot API (FINDINGS round 12). 2d: errors without restarting, i.e. the compile check, recoverable reboot failures, the overlay's restart action and the boot catch-up (FINDINGS round 13).
3. **Defines and globals; `/ns/v`; vendor bundle.** 3a: defines and globals, done (FINDINGS round 14). 3b: plain Vite URLs, `/ns/v` and every `/ns/*` route gone, done (FINDINGS round 15). 3c: deps bundle and vendor layer out, dep optimizer off by default, minimal import map, done (FINDINGS round 16).
4. **Flavors.** 4a: the TS/JS soft reboot, `app.css` as a Vite module and workers, done. Remaining: an entry boundary for Solid and React (remount via `resetRootView`); Vue (plugin-vue `js-update`).
5. **Android.**

## Open
- **A static side-effect gate:** restart when a re-run module has top-level side effects that nothing disposes. Deferred.
- **Angular participants:** router stack replay, dialogs, NgRx (`provideNgrxHmr`).
- **Workers:**
  - whether iOS keeps the query on the worker entry URL;
  - a worker entry that uses `import.meta.hot` imports `/@vite/client` (and core) before `/@vite/env`;
  - nested workers have no `httpOrigin`;
  - the worker realm has no `bundle.mjs` require shim.
- **`app.css` parses differently in dev and release.** Dev applies the raw text through css-tree, release the rework AST, and the two can render differently (e.g. `.text-sm { line-height: 20 }` gains extra line spacing under css-tree).
- **Tailwind:** a new file matching a content glob isn't picked up until the stylesheet re-transforms (plain Vite behaves the same). Content edits are covered by a stand-in PostCSS plugin in the probe (`--content-css`), not by a real Tailwind fixture.
- **`__NS_HTTP_ORIGIN__` was readable by app code.** It is now the dev object's `httpOrigin`; code outside `@nativescript/vite` that read the global gets `undefined`.
- **Monorepo Angular ids.** Analog builds `angular:component-update` ids relative to `process.cwd()`, while the NS config comment assumes `workspaceRoot`. The NS rules resolve both, but in-place updates in an Nx workspace are unverified.
- **Per-device catch-up.** Served modules and delivered saves are tracked per dev server, not per device connection, so with two devices, one booting while the other is connected can miss an update (see "Failures").
- **Failure escalation.** A teardown that throws during a retry, when the app is already torn down, restarts; tolerating it may be better. A bootstrap failure never escalates to a restart.
- **Analog clears its `classNames` on any non-component `.ts` edit**, so the next template edit of each component reboots the app instead of updating in place, until that component's `.ts` is recompiled.
- **A declined module between the edited file and its boundary** is neither `path` nor `acceptedPath` of the `js-update`, so the device can't see it. That needs detection on the server.
- **Restart-required overlay tone:** it uses the existing `warn` tone, which the native iOS and Android overlays draw as the neutral connection panel. A distinct colour needs a new tone in both native renderers.
- **Volatile patterns** are only the strategy's (Angular `/@ng/component`). The runtime evicts a volatile URL before every dynamic `import()`, so a `?v=` pattern made each dynamic import of an optimized dep a new instance.
- **`?v=` beyond core with an include list.** Once an app lists `optimizeDeps.include`, raw `node_modules` files other than core and `@nativescript/vite` carry `?v=`. That is consistent as long as every importer resolves them through Vite's resolver; a file some importers reach through an NS resolver (no `?v=`) would load twice. Stripping `v` from every resolution outside `.vite/deps` would close it.
- **Includes from a dependency's `nativescript.vite.mjs`** are dropped by the optimizer policy, because `externalConfigsPlugin`'s `config` hook runs after the capture.
- **Deep imports of an included package** (`pkg/lib/x.js`) next to its pre-bundle load the file twice: inlined and served raw.
- **Vue, Solid and React are uncrawled** under the new dependency policy; Vue moved from discovery to none, React from the vendor bundle to `include`.
- **`dominative`** (Solid/React DOM boot in `root-placeholder.ts`) is reached only through the runtime's on-disk `require`, so its two-phase boot never runs under HMR.
