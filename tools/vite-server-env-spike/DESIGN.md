# @nativescript/vite: thin-only design

**Goal.** One dev mode. The device runs Vite's client-environment output, and a port of Vite's browser client handles updates. NativeScript adds only what a browser has and a NativeScript app lacks: a module loader over HTTP, no DOM, and no `location.reload`.

**Principle.** Use Vite's own semantics wherever a browser would. Frameworks decide HMR through their own Vite plugins (Analog, plugin-vue, vite-plugin-solid, …), not through NS server strategies. NS code exists only where there is no browser equivalent, and its contract is Vite's public client events.

**No new globals.** Device code inside `@nativescript/vite` shares state through ESM imports: in thin mode every module has one URL and therefore one instance. Libraries such as `@nativescript/angular` use standard `import.meta.hot`. The globals that remain are listed in FINDINGS.md round 11 and will move to a single `Symbol.for('nativescript.dev')`-keyed object later.

The inventory behind this is the subagent map in `$CLAUDE_JOB_DIR/tmp/nsvite-map/inventory.tsv` (227 files, 51k LOC). The summary is in FINDINGS.md.

## Architecture (as built after phase 2)

### Serving: `/ns/v<vite-url>`
- Every device module is `environments.client.transformRequest(<vite-url>)`. Root-relative specifiers are rewritten to `<origin>/ns/v…`. Core files carry a `__NS_CORE_MODULES__` registration footer, and `/@vite/client` is `hmr/client/thin-vite-client.ts`.
- `thin-route.ts` normalizes the URL the way Vite's transform middleware does before calling `transformRequest`:
  - it drops `t` and `import` (Vite's own `removeTimestampQuery`/`removeImportQuery` regexes), so a `?t=` request returns the same module code and one file has one graph node;
  - it drops the runtime's transport-only `__ns_dev_nonce`.
- CSS requested as a stylesheet (`Accept: text/css` or `?direct`) is handed to Vite's own middleware with the plain Vite URL. Vite adds `direct` and answers `text/css`.
- **One origin source:** `getServerOrigin(server)` for the session, the client bootstrap, the import map, `bundle.mjs` core URLs and the thin route. The `Host` header is never used.
- Still to do (phase 3): no vendor bundle in dev. Drop `vendor.mjs`, the deps bundle and `vendor-bootstrap`. Import-map keys come from resolving the app's dependencies through the client plugin container. Android SBG keeps only its build-time stub.

### Module identity: Vite's `?t=` stamps
- The loader keeps every query param of `/ns/v` URLs, `t` and `import` included, exactly as a browser does.
  - `getCanonicalization` sends empty `stripParams`/`forPathPrefixes`; the runtime only strips under a listed prefix.
  - `preserveQueryFor` (`/@ng/component`) is still sent.
- A re-imported module therefore has a fresh URL. There are no server-computed eviction sets and no hot-key canonicalization.
- The cost is the browser's: replaced instances stay in memory until a full reload.

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
- **The NS custom events** (`hmr/shared/protocol.ts`) are `ns:restart`/`ns:restart-required` (see "Soft reload vs app restart") and `ns:css-updates` (data `{ updates, reason? }`). Each `ns:css-updates` item carries the generated stylesheet text in `css`, so the device fetches nothing. It is sent with `server.ws.send(event, data)`:
  - when the global `app.css`, a CSS partial it imports, or a Tailwind/PostCSS content file changes the generated stylesheet;
  - with `reason: 'connect-sync'` to a client on `vite:client:connect` when the CSS changed since `bundle.mjs` was built.
  - For `app.css` itself the hook returns `[]`, so Vite doesn't also full-reload.
- Gone: `/ns-hmr`, the `server.ws.send` relay, socket roles, the module-graph mirror and its full/delta messages, `ns:hmr-pending`, `ns:angular-update`, the Vue SFC registry and the TS module registry.

### Device client: a port of `vite/dist/client/client.mjs`
Modules in `hmr/client/`:
- `hmr-client.ts`: a pure port of `HMRContext`/`HMRClient`/`Queue`.
- `hot-state.ts`: the singleton `hmrClient` plus `createHotContext`, which `thin-vite-client` re-exports.
- `vite-transport.ts`: the WebSocket transport, ping and `waitForSuccessfulPing`.
- `full-reload.ts`.
- `index.ts`: `start()`, `handleMessage` and overlay driving.

Behavior:
- **Bootstrap.** `/__ns_dev__/client` waits for `__NS_HMR_BOOT_COMPLETE__`, then calls `start({ wsUrl, wsProtocol, entryUrl, origin, keepUrlPrefixes })`. The server bakes all of these in, so nothing travels through globals. Contexts exist from boot; the socket attaches at `start()`.
- **Queue.** A serialized message queue, with awaited listeners (`notifyListeners` = `Promise.allSettled`).
- **`update`.**
  1. `vite:beforeUpdate`.
  2. Each `js-update` runs through `queueUpdate(fetchUpdate)` exactly as Vite does:
     - a no-op without a hot entry;
     - otherwise await dispose(data), then `import(origin + '/ns/v' + path + '?' + (explicitImportRequired ? 'import&' : '') + 't=' + ts + (query ? '&' + query : ''))`;
     - accept callbacks get the deps-positional array;
     - a failure inside a circular import → full reload.
  3. `css-update` runs listeners only. Stylesheet owners such as the Angular renderer react on `vite:beforeUpdate`.
  4. `vite:afterUpdate`.
- **`full-reload`** (the device's `location.reload()`), debounced 20 ms and run through the queue:
  1. `vite:beforeFullReload`;
  2. dispose (with `data`) every app-owned module;
  3. sweep tracked workers;
  4. drop those modules' contexts: accept callbacks, `on` listeners and dispose/prune callbacks;
  5. `invalidateModules` for every loaded app-owned URL;
  6. re-import `entryUrl`.
  - App-owned means a `/ns/v` URL on the session origin whose Vite URL contains no `/node_modules/`, doesn't start with `/@vite/` or the dev client's and core's package prefixes. `Application.run` is patched (`root-placeholder.ts`) to `resetRootView` on re-entry.
  - `.html`-path and `ifFallback` reloads are skipped, since the device has no HTML page.
- **`hot.data` survives a full reload.** This deliberately diverges from the browser, which wipes everything on reload.
  - The data object stays keyed by the module's exact Vite URL. A module re-evaluated under the same URL reads back what its previous instance's `dispose(data)` wrote. Only `prune` deletes it.
  - Why: on device, Angular class edits always full-reload, and this lets app code carry state with the standard `dispose(data)`/`hot.data` pattern.
  - Modules that are not evicted (`node_modules`, the dev client) keep their contexts and listeners. So `@nativescript/angular`'s `import.meta.hot.on(...)` survives every reload.
- **`prune`.** `vite:beforePrune`, then dispose → prune → delete data.
- **`error`.** `vite:error`, then the NS overlay's `failed` stage.
- **`custom`.** Listeners. `ns:css-updates` has an internal listener that applies each item's `css` under its tag (`css-handler.ts`).
- **The dev client does its I/O without the app's globals.** It uses no `fetch` or XHR, which Zone.js patches and which failed under it. Modules come through `import()` (the runtime's loader), stylesheets through the socket.
  - What remains is the app's `WebSocket` polyfill, the only socket there is.
  - `setTimeout`/`setInterval` remain for the reload debounce, the ping and the reconnect backoff. Zone.js patches them too, but they work under it.
- **Hot contexts are keyed by the exact Vite URL** given to `createHotContext(ownerPath)`.
  - `hot.send` → `{type:'custom', event, data}`.
  - `hot.invalidate` → `vite:invalidate {path, message, firstInvalidatedBy}` to the server; Vite propagates it.
- **Disconnect.** `vite:ws:disconnect` → wait for a `vite-ping` socket to open → reconnect with the same `wsUrl`. Nothing else happens.
  - This deliberately deviates from Vite's browser client, which reloads the page once the server is back.
  - The device's modules stay valid while the server is unchanged. A server that restarted asks for an app restart itself when the device reconnects.
- **After a failed full reload** (the entry re-import threw), the next `update` triggers another full reload instead of applying. The app modules were evicted and their contexts dropped, so nothing could accept it. This is the device's form of Vite's `clearOverlayOrReloadOnFirstUpdate`.
- **Overlay.** The NS overlay is driven from these events: beforeUpdate/afterUpdate, the full-reload stages and errors.
- There is no registry-level `on`/`off` and no `__NS_HOT_REGISTRY__`. App-lifetime owners use `import.meta.hot` in their own (never evicted) module.

### Soft reload vs app restart
- **Soft reload** (`full-reload`): in-process, as above. It re-evaluates app-owned modules only: the shared rule `isAppOwnedViteUrl` in `hmr/shared/app-owned.ts`. The non-evictable prefixes come from one server function, `resolveNonEvictableViteUrlPrefixes` (`@nativescript/core`'s and `@nativescript/vite`'s package directories), which the bootstrap passes to the device as `keepUrlPrefixes`.
- **App restart**: a new process, for changes a soft reload can't apply. iOS can't relaunch itself, so the NativeScript CLI performs it. The dev server asks for it with one function, `requestAppRestart(reason)` (`hmr/server/app-restart.ts`):
  - Requests within 250 ms collapse into one, with deduplicated reasons joined by `; `.
  - **With an IPC channel** (`process.send`), it sends the CLI `{ type: 'nativescript:restart', reason }`.
  - **Without one**, which is today's CLI (`vite serve` spawned with `stdio: 'inherit'`), it logs `[NativeScript] restart the app to apply: <reason>` and sends devices the custom event `ns:restart-required { reason }`.
  - Either way the app is not soft-reloaded. The device shows a persistent "Restart required" overlay and applies nothing further.
- **Triggers:**
  - **Non-evictable code changed.** A client-environment `pre` `hotUpdate` handles an edit to a file the device loaded as JS (`modules` has a `js` node) whose Vite URL is not app-owned:
    - anything under `node_modules`, including `/@fs/…/node_modules`;
    - a linked core or `@nativescript/vite` under `/@fs/…`.

    It returns `[]`, so Vite sends nothing (no `?t=` second instance next to the live one), and requests a restart. Vite never watches `node_modules`, so in practice this fires for workspace-linked sources under `/@fs/` (toolbox's `packages/core`), or with a user `server.watch.ignored` negation.
  - **Boot bundle changed.** In the `vite build --watch` process (IPC already exists), `helpers/ns-cli-plugins.ts` now sends the existing `emittedFiles` message (`isHMR: false`, `buildType: 'incremental'`) after an HMR rebuild only when `bundle.mjs`'s content hash changed. The CLI already copies those files and restarts the app through livesync. `bundle.mjs` is byte-stable across identical builds (`boot-bundle-hash.mjs`).
  - **`import.meta.hot.decline()`.** Vite 8.3.8 ignores it on both sides, so this is NativeScript's mapping. The device sends `ns:restart { reason }` instead of soft-reloading in two cases:
    - a `full-reload` arrives while any loaded app module's current evaluation has declined;
    - a `js-update` arrives whose boundary or updated module declined.
  - **A soft reload that fails during teardown.** A `vite:beforeFullReload` listener or a dispose callback throws or rejects, so the app is half torn down: the device sends `ns:restart`. An entry re-import that throws (a syntax error) stays recoverable: the `failed` overlay shows, and the next update reloads again.
  - **Vite restarted itself** (`server.restart()`, a config edit). Module state of `@nativescript/vite` survives the in-process restart while plugin instances don't, so a module-level counter detects a second `configureServer`. The first device connection afterwards requests one restart.
    - The pinned `webSocketToken` (see Transport) keeps the device's original `wsUrl` valid, so it simply reconnects.
  - **Not a trigger: `@NativeClass`.** A re-evaluated class gets a new runtime class, and new uses pick it up.
- **Device → server:** `ns:restart { reason }` arrives through `server.ws.on('ns:restart')` and becomes `requestAppRestart(reason)`.
  - On the device, `requestRestart(reason)` lives on the runtime and runs once.
  - It is held while the socket is down and sent on reconnect.
  - From then on, the device drops `update`, `full-reload`, `prune` and `ns:css-updates`; custom events still reach listeners.

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
No NS server strategies for updates. Each framework's Vite plugin produces stock payloads, and the device client applies them. `FrameworkServerStrategy` only feeds the import map (`importMapSpecifiers`, `volatilePatterns`, `preserveQueryPaths`).

**Angular** follows Angular CLI's rules. Analog runs in default mode with `liveReload: true`; in the probe, compilation-API mode compiled components without Angular's HMR initializer and full-reloaded even `.html`/`.css` (FINDINGS round 11). An NS plugin in `configuration/angular.ts` (`hmr/frameworks/angular/server/hmr-payload-rules*.ts`) rewrites Analog's payloads:
- `.html` and `styleUrl` edits update in place, through `angular:component-update` and `css-update`.
- **`.ts` class edits → full reload.**
  - A `pre` `hotUpdate` hook compares each component `.ts` save with the previous source, with the `@Component` `template`/`templateUrl`/`styles`/`styleUrl`/`styleUrls` initializers blanked out.
  - Any other difference marks the class stale.
  - A `server.ws.send` wrapper turns `angular:component-update` for a stale class into `full-reload`. Any page full-reload clears the stale set.
  - The decision is state, not per save, because Analog buffers its component update and flushes it after the hot-update hooks settle.
  - A template/styles-only `.ts` change stays in place.
- **Root component → full reload.** `page-router-outlet` can't survive `ɵɵreplaceMetadata`.
- **`angular:invalidate` → full reload**, as Angular CLI does; Analog lacks it.
- **`/@ng/component` boot gate.** Every compiled component fetches `/@ng/component?c=<id>&t=<now>` when its module evaluates. Analog answers with a real `_UpdateMetadata` payload whenever that module was invalidated at any point in the server's lifetime.
  - So after a full reload, every component's metadata is replaced at boot. For the root, that tears down `page-router-outlet` and leaves a blank screen.
  - The rules plugin records the latest `angular:component-update` timestamp it sent per id. A middleware ahead of Analog's and the thin route lets through only a fetch echoing that exact `(c, t)`. Anything else gets `export default undefined;`, so `m.default && ɵɵreplaceMetadata(...)` does nothing.
  - The root never gets through, because its updates go out as `full-reload`.
- **`@nativescript/angular`** uses the literal `import.meta.hot`, which Vite injects into served `node_modules` files too:
  - `vite:beforeFullReload` → off launch/exit handlers, `disposeLastModules`, `disposePlatform`, `ɵresetCompiledComponents` (clears the component-id map behind NG0912). It is registered once per process; the state lives in the library's module scope, since library modules are never evicted.
  - The re-evaluated entry bootstraps again (`Application.hasLaunched()`).
  - The renderer listens for `vite:beforeUpdate` for external styles.
  - `NATIVESCRIPT_STYLE_BASE_URL` defaults to the origin of the library's own `import.meta.url` when that is http(s), behind `if (import.meta.hot)`. Webpack compiles that branch to `if (false) {}`, without errors or warnings, and no `file://` path leaks.

**Other flavors:**
- **Vue:** plugin-vue's `js-update` → `__VUE_HMR_RUNTIME__` (needs nativescript-vue 3 checked).
- **Solid, React, plain TS:** stock `full-reload` unless the framework's own refresh plugin is enabled.
- **Global `app.css`:** still `ns:css-updates` until phase 3. Target: a real Vite module imported by the entry, so `js-update` → `updateStyle` covers it, replacing `virtual:ns-app-css`, `ns:css-updates`, `app-css-state` and connect-sync.

## Phases
1. **Thin is the only mode; delete what thin never reaches.** Done (FINDINGS round 10).
2. **Transport, client port and `?t` identity.** Done in code (FINDINGS round 11); device check pending: Angular `.html`/`.css`/`.ts`/root edits on one pid.
3. **Vendor bundle out; new import-map key source; `app.css` as a module.** Measure duplicates before and after.
4. **Flavors.** TS, Solid and React fixtures (full reload); Vue (plugin-vue `js-update`); `./solid-bootstrap`'s remount on full reload.
5. **Android.**

## Open
- **`hot.data` across full reloads.** A module that only expects `data` to be filled when it is accepted could restore invalid state after a full reload. An opt-in or opt-out may be needed later.
- **Globals.** Consolidate what remains into one `Symbol.for('nativescript.dev')`-keyed typed object (inventory in FINDINGS round 11).
- **Workers:** `workerHmrUrlPlugin` is `/ns/m`-only, so workers need a thin equivalent.
- **Monorepo Angular ids.** Analog builds `angular:component-update` ids relative to `process.cwd()`, while the NS config comment assumes `workspaceRoot`. The NS rules resolve both, but in-place updates in an Nx workspace are unverified.
- **Edits while disconnected are not applied.** A disconnect only reconnects, so if backgrounding the app drops the socket, edits made in the meantime don't reach the device. Vite does not replay them. Check on device whether that matters.
- **Edits inside never-evicted packages served outside `node_modules`** (a workspace-linked core under `/@fs/`): Vite stamps `?t=` on the importer chain, and the device would load those URLs as second instances, which splits core. Not handled.
- **Analog clears its `classNames` on any non-component `.ts` edit**, so the next template edit of each component becomes a full reload until that component's `.ts` is recompiled.
- **A declined module between the edited file and its boundary** is neither `path` nor `acceptedPath` of the `js-update`, so the device can't see it. That needs detection on the server.
- **Restart-required overlay tone:** it uses the existing `warn` tone, which the native iOS and Android overlays draw as the neutral connection panel. A distinct colour needs a new tone in both native renderers.
- **`?v=` volatile patterns** now re-fetch optimized deps on every import, because `v` is part of the module key. Revisit with phase 3.
