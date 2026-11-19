# @nativescript/vite: thin-only design

**Goal.** One dev mode. The device runs Vite's client-environment output, and a port of Vite's browser client handles updates. NativeScript adds only what a browser has and a NativeScript app lacks: a module loader over HTTP, no DOM, and no `location.reload`.

**Principle.** Use Vite's own semantics wherever a browser would. Frameworks decide HMR through their own Vite plugins (Analog, plugin-vue, vite-plugin-solid, …), not through NS server strategies. NS code exists only where there is no browser equivalent, and its contract is Vite's public client events.

**Globals.** Device code inside one world shares state through ESM imports: every served module has one URL and therefore one instance, and `bundle.mjs` evaluates once. State that crosses `bundle.mjs` ↔ served (or string-generated) device code lives on one object, `globalThis[Symbol.for('nativescript.dev')]` (`hmr/shared/runtime/dev-globals.ts`, see "Dev globals"). Libraries such as `@nativescript/angular` use standard `import.meta.hot`. What remains outside the dev object:
- the vendor family (`__nsVendorRegistry`, `__nsRequire`, `__NS_DEPS_MODULES__`, …), until phase 3c removes the vendor bundle;
- keys core owns: `__NS_DEV_PLACEHOLDER_ROOT_VIEW__`/`__NS_DEV_PLACEHOLDER_ROOT_EARLY__` (read by core `application.ios.ts`) and `__NS_LAST_XML_ERROR__` (written by core `ui/builder`);
- `__NS_HMR_OVERLAY_POSITION__`, an app-facing override;
- `__NS_DEV_TELEMETRY__`/`__NS_TELEMETRY__` (manual opt-in diagnostics), the optional `__NS_HMR_IMPORT__` hook, and `__NS_HMR_WORKERS__` until worker HMR (see "Open").

The before → after table is in FINDINGS.md round 14.

The inventory behind this is the subagent map in `$CLAUDE_JOB_DIR/tmp/nsvite-map/inventory.tsv` (227 files, 51k LOC). The summary is in FINDINGS.md.

## Architecture (as built after phase 3a)

### Serving: `/ns/v<vite-url>`
- Every device module is `environments.client.transformRequest(<vite-url>)`. Root-relative specifiers are rewritten to `<origin>/ns/v…`. Core files carry a footer that registers them in the dev globals' `coreModules`, and `/@vite/client` is `hmr/client/thin-vite-client.ts`.
- `thin-route.ts` normalizes the URL the way Vite's transform middleware does before calling `transformRequest`:
  - it drops `t` and `import` (Vite's own `removeTimestampQuery`/`removeImportQuery` regexes), so a `?t=` request returns the same module code and one file has one graph node;
  - it drops the runtime's transport-only `__ns_dev_nonce`.
- CSS requested as a stylesheet (`Accept: text/css` or `?direct`) is handed to Vite's own middleware with the plain Vite URL. Vite adds `direct` and answers `text/css`.
- **One origin source:** `getServerOrigin(server)` for the session, the client bootstrap, the import map, `bundle.mjs` core URLs and the thin route. The `Host` header is never used.
- Still to do (phase 3c): no vendor bundle in dev. Drop `vendor.mjs`, the deps bundle and `vendor-bootstrap`. Import-map keys come from resolving the app's dependencies through the client plugin container. Android SBG keeps only its build-time stub.

### Defines
- `config.define` is the single source: `getGlobalDefines` (`helpers/global-defines.ts`) plus the app's own entries.
- **Build.** Vite substitutes it in `bundle.mjs`, bare identifiers and member chains (`global.isIOS`, `process.env.NODE_ENV`) alike. Bundled device code reads defines as bare identifiers (`__ANDROID__`, not `g.__ANDROID__`), so substitution covers them.
- **Dev.** Vite's client environment does no define substitution in served modules. The first import of `bundle.mjs` is `<origin>/ns/v/@vite/env`, Vite's own module. It assigns every define on `globalThis`, user defines and dotted keys included, before the externalized core graph evaluates.
  - It must stay an external import placed first: a bundled module's body runs after the externalized core.
  - It is the only installer, so building `bundle.mjs` with HMR active fails when no device-reachable origin resolves (`helpers/main-entry.ts`).
- **esbuild builds.** The deps bundle (`hmr/server/deps-bundle.ts`) passes `getGlobalDefines`, `module.hot: undefined` and the app's bare `__FOO__` defines (captured in `configResolved` by `setUserDefineEntries`) as esbuild `define`. The vendor manifest build (`hmr/shared/vendor/manifest.ts`) passes `getGlobalDefines` without user defines.
- The kept defines are the contract shared with `@nativescript/webpack` or read by core and app code (list in FINDINGS round 14). `__NS_HMR_PROGRESS_OVERLAY_ENABLED__` is read only by bundled overlay code (`overlay-flag.ts`).

### Dev globals: `Symbol.for('nativescript.dev')`
- `hmr/shared/runtime/dev-globals.ts` holds the `NativeScriptDevGlobals` type, the accessor `nsDev()`, and `NS_DEV_EXPR`, the same lookup as a JS expression for code generated as strings (the `bundle.mjs` require shim, the core footer, worker constructors, the `/__ns_dev__/client` bootstrap).
- The module is stateless and dependency-free. `bundle.mjs` and the served graph each evaluate their own copy, and both resolve the same object.
- Only state crossing `bundle.mjs` ↔ served or string-generated device code goes here. State inside one world is module state.
- Members:
  - `bootComplete`: set by `bundle.mjs` once the first app root is up. The `/__ns_dev__/client` bootstrap waits for it.
  - `appCss`, `appCssAst`: the global `app.css` text baked into `bundle.mjs` and its AST, applied by the served `entry-runtime`.
  - `knownApplications`: the `Application` instances the boot placeholder saw. `entry-runtime` restyles their root views.
  - `overlay`: the dev overlay installed by `bundle.mjs`, driven by the served HMR client (`overlay-driver.ts`).
  - `httpOrigin`: the dev server origin the session booted from. Generated worker code resolves worker URLs against it.
  - `coreModules`: served `@nativescript/core` modules by require key, registered by each one's footer. Read by the `bundle.mjs` require shim and the deps bundle.
  - `cjsShape`: ESM namespace → plain object for CommonJS callers. Installed by `bundle.mjs`, used by the core footer and the deps bundle.

### Module identity: Vite's `?t=` stamps
- The loader keeps every query param of `/ns/v` URLs, `t` and `import` included, exactly as a browser does.
  - `getCanonicalization` sends empty `stripParams`/`forPathPrefixes`; the runtime only strips under a listed prefix.
  - `preserveQueryFor` (`/@ng/component`) is still sent.
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
- **The NS custom events** (`hmr/shared/protocol.ts`) are `ns:restart`/`ns:restart-required` (see "Soft reboot vs app restart"), `ns:rerun` (see "Soft reboot") and `ns:css-updates` (data `{ updates, reason? }`). Each `ns:css-updates` item carries the generated stylesheet text in `css`, so the device fetches nothing. It is sent with `server.ws.send(event, data)`:
  - when the global `app.css`, a CSS partial it imports, or a Tailwind/PostCSS content file changes the generated stylesheet;
  - with `reason: 'connect-sync'` to a client on `vite:client:connect` when the CSS changed since `bundle.mjs` was built.
  - For `app.css` itself the hook returns `[]`, so Vite doesn't also full-reload.
- Gone: `/ns-hmr`, the `server.ws.send` relay, socket roles, the module-graph mirror and its full/delta messages, `ns:hmr-pending`, `ns:angular-update`, the Vue SFC registry and the TS module registry.

### Device client: a port of `vite/dist/client/client.mjs`
Modules in `hmr/client/`:
- `hmr-client.ts`: a port of `HMRContext`/`HMRClient`/`Queue`, plus decline tracking, `notifyListenersSettled` and the owner-targeted `notifyOwnerListeners`.
- `hot-state.ts`: the singleton `hmrClient`, `createHotContext`, and the entry boundary's `registerEntryBoundary`. `thin-vite-client` re-exports the public ones from `/@vite/client`.
- `vite-transport.ts`: the WebSocket transport, ping and `waitForSuccessfulPing`.
- `index.ts`: `start()`, `handleMessage`, the reboot and restart sequences, and overlay driving.

Shared with the server:
- `hmr/shared/protocol.ts`: event names and payload types.
- `hmr/shared/update-modules.ts`: `createUpdateModules`, the `isRerun`/`isChanged`/`modules` payload lookups.

Behavior:
- **Bootstrap.** `/__ns_dev__/client` waits for the dev globals' `bootComplete`, then calls `start({ wsUrl, wsProtocol, entryUrl, origin, root })`. The server bakes all of these in, so nothing travels through globals. `root` is Vite's project root, so error locations are root-relative from the first payload on. Contexts exist from boot; the socket attaches at `start()`.
- **Queue.** A serialized message queue, with awaited listeners (`notifyListeners` = `Promise.allSettled`).
- **`update`.**
  1. `vite:beforeUpdate`.
  2. If a `js-update` has the app entry as its boundary: `nativescript:beforeReboot` (see "Soft reboot").
  3. `nativescript:beforeRerun`, targeted to the re-running modules (see "Soft reboot").
  4. Each `js-update` runs through `queueUpdate(fetchUpdate)` exactly as Vite does:
     - a no-op without a hot entry;
     - otherwise await `dispose(data)` of the accepted module only, then `import(origin + '/ns/v' + path + '?' + (explicitImportRequired ? 'import&' : '') + 't=' + ts + (query ? '&' + query : ''))`;
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
  - `ns:css-updates`, applying each item's `css` under its tag (`css-handler.ts`);
  - `ns:rerun`, keeping the module sets for the next `update`;
  - `ns:restart-required`.
- **The dev client does its I/O without the app's globals.** It uses no `fetch` or XHR, which Zone.js patches and which failed under it. Modules come through `import()` (the runtime's loader), stylesheets through the socket.
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
- **Injection.** For a flavor whose `FrameworkServerStrategy.entryBoundary` names a teardown (Angular: `@nativescript/angular`'s `prepareHmrReboot`/`whenHmrRebootSettled`), `hmr/server/entry-boundary.ts` prepends this to the app entry. It runs after the framework's compile and before Vite's import analysis:
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
- **Without an entry boundary**, which is the case for TS, Solid, React and Vue today, an edit with no closer boundary reaches a dead end. Vite sends `full-reload`, which is an app restart.
- **Which modules re-run.** `ns:rerun { timestamp, changed, rerun, root }` precedes every `update` with a `js-update`.
  - `rerun` is each `acceptedPath` plus the imports reachable from it whose current `?t=` stamp the device has never been served (`ServedModules`, see "Failures"): exactly what the device's import re-evaluates. Templates are graph nodes but never device modules, so an in-place template update has an empty `rerun`.
  - Going by served stamps rather than the update's own timestamp covers every edit since the last update that went out, including those of saves whose update failed its check.
  - Vite also stamps the importers above a boundary that stops early, such as a template accepted in place; those stay out because the walk starts at the `acceptedPath`.
  - A custom event carries it because Vite rebuilds its `update` payloads and Analog buffers them.
- **Events.** All are dispatched client-side through `hot.on` and awaited. `dispose` keeps Vite's semantics: it fires only for each accepted module.
  - `nativescript:beforeReboot` (entry updates only): `{ entry, changed, rerun, modules, isRerun(id), isChanged(id) }`.
  - `nativescript:beforeRerun` (every update with `js-update`s): `{ timestamp, changed, rerun, modules, isRerun, isChanged }`.
    - It is dispatched **only** to the listeners registered by the hot contexts of modules in `rerun`, keyed by owner path. It is never broadcast.
    - It fires once per module per payload, even with several boundaries, and before any boundary's `dispose`.
    - Vite disposes only the boundary, so this is how an intermediate module's old instance releases what it holds, e.g. `import.meta.hot?.on('nativescript:beforeRerun', () => off())` for root listeners.
  - `nativescript:afterReboot`: the `beforeReboot` payload plus `error` when the entry import failed or the settle signal reported a failed boot (it rejected or resolved `{ error }`). It fires after the framework's settle signal (Angular: bootstrap plus `ApplicationRef.whenStable()`, capped at 5 s, and participant restore), waited for up to 15 s. It is skipped right away when the entry import failed.
  - `nativescript:beforeRestart` `{ reason }`: before the device asks for, or is told about, an app restart.
  - **Order:** `vite:beforeUpdate` → `nativescript:beforeReboot` → `nativescript:beforeRerun` → entry `dispose` (framework teardown) → `import(entry?t=)` → framework bootstrap and restore → `nativescript:afterReboot` → `vite:afterUpdate`.
- **Payload lookups.** `isRerun(id)`, `isChanged(id)` and `modules` (`'changed'` for an edited file, `'rerun'` for one re-evaluated only because of the chain) accept a module's own `import.meta.url` (`<origin>/ns/v/src/x.ts?t=…`), its Vite URL or owner path, or its absolute file path.
  - They strip the origin, `/ns/v`, `t` and `import`, and keep identity queries (`hmr/shared/update-modules.ts`). Typical:
    ```ts
    import.meta.hot?.on('nativescript:beforeReboot', (e) => { if (e.isRerun(import.meta.url)) cleanup(); });
    ```
  - Types ship as `@nativescript/vite/client`, which augments Vite's `CustomEventMap`; add it to `compilerOptions.types`.
- **Failures:** see "Failures" below.
- **Workers** spawned by an old app instance are not swept: the tracked set doesn't know its owners, and a module outside `rerun` keeps its workers. The framework's teardown has to terminate its own.

### Soft reboot vs app restart
- **Soft reboot**: the entry-boundary HMR update above. It re-evaluates app modules only.
- **App restart**: a new process, for everything a hot update can't apply, including every Vite `full-reload`. iOS can't relaunch itself, so the NativeScript CLI performs it. The dev server asks for it with one function, `requestAppRestart(reason)` (`hmr/server/app-restart.ts`):
  - Requests within 250 ms collapse into one, with deduplicated reasons joined by `; `.
  - **With an IPC channel** (`process.send`), it sends the CLI `{ type: 'nativescript:restart', reason }`.
  - **Without one**, which is today's CLI (`vite serve` spawned with `stdio: 'inherit'`), it logs `[NativeScript] restart the app to apply: <reason>` and sends devices the custom event `ns:restart-required { reason }`.
  - Devices are always sent `ns:restart-required` too, so they run `nativescript:beforeRestart`, show a persistent "Restart required" overlay and apply nothing further.
- **Triggers:**
  - **Vite `full-reload`**: no HMR boundary reached (a flavor without an entry boundary), `angular:invalidate`, or anything else Vite reloads for.
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
  - From then on, the device drops `update`, `full-reload`, `prune` and `ns:css-updates`; custom events still reach listeners.

### Failures
A broken save shows an error on the device and leaves the running app as it is. The next good save applies everything since the last update that went out. A restart is the fallback only where the app can't be trusted any more.

- **Compile check (the update gate, `hmr/server/update-gate.ts`).** `nsRerunPlugin` wraps `server.ws.send`. Every payload to the device passes through a queue, so payloads leave in the order they were sent.
  - An `update` with a `js-update` is checked first. The checked set is the re-run set plus, for an accepted template, the component modules that import it (an in-place template update re-runs nothing on the device, yet a broken template must not apply).
  - Each checked module goes through `environments.client.transformRequest` with the thin route's normalized URL, then through the flavor's `verifyTransform`. The results stay in Vite's transform cache for the device's fetches.
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
  - The thin route records, per module URL, when it was served and under which `?t=` stamps (`ServedModules` in `hmr/server/served-modules.ts`). There is one per dev server, shared by all devices.
  - A save whose update reached a connected client, as an update or an `error`, is "delivered".
  - On `vite:client:connect`: the device opens its HMR socket only after `bootComplete`, so the connect is the boot-complete signal, and it covers reconnects too. A served module whose `lastHMRTimestamp` is newer than when it was served, from a save that wasn't delivered, triggers exactly one catch-up:
    - with an entry boundary, a synthetic entry `js-update` preceded by `ns:rerun` (`rerun` from served stamps; compile-checked first, `error` instead if the check fails);
    - without one, `requestAppRestart`.
  - A normal boot has no stamp newer than its fetches, so it gets no catch-up.
  - **Limitation:** tracking is per server, not per device connection. HTTP module fetches can't be attributed to a WebSocket connection, and simulators share `localhost`. With two devices, one booting while the other is connected can miss an update.

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
  - The rules plugin records the latest `angular:component-update` timestamp it sent per id. A middleware ahead of Analog's and the thin route lets through only a fetch echoing that exact `(c, t)`; anything else gets `export default undefined;`.
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

**Other flavors:**
- **Vue:** plugin-vue's `js-update` → `__VUE_HMR_RUNTIME__` (needs nativescript-vue 3 checked).
- **Solid, React, plain TS:** no entry boundary yet, so an edit without a closer boundary restarts the app. They get the same entry boundary later (remount via `resetRootView`).
- **Global `app.css`:** still `ns:css-updates` until phase 4. Target: a real Vite module imported by the entry, so `js-update` → `updateStyle` covers it, replacing `virtual:ns-app-css`, `ns:css-updates`, `app-css-state` and connect-sync.

## Phases
1. **Thin is the only mode; delete what thin never reaches.** Done (FINDINGS round 10).
2. **Transport, client port and `?t` identity.** Done (FINDINGS round 11). 2b: app restarts (FINDINGS round 11). 2c: the entry-boundary soft reboot, the event bus and the Angular reboot API (FINDINGS round 12). 2d: errors without restarting, i.e. the compile check, recoverable reboot failures, the overlay's restart action and the boot catch-up (FINDINGS round 13).
3. **Defines and globals; `/ns/v`; vendor bundle.** 3a: defines and globals, done (FINDINGS round 14). 3b: drop `/ns/v`. 3c: vendor bundle out; new import-map key source. Measure duplicates before and after.
4. **Flavors.** An entry boundary for TS, Solid and React (remount via `resetRootView`); Vue (plugin-vue `js-update`); `app.css` as a Vite module; worker HMR.
5. **Android.**

## Open
- **A static side-effect gate:** restart when a re-run module has top-level side effects that nothing disposes. Deferred.
- **Angular participants:** router stack replay, dialogs, NgRx (`provideNgrxHmr`).
- **Worker ownership:** workers spawned by a rebooted app instance leak unless the framework terminates them.
- **Workers:** `workerHmrUrlPlugin` is `/ns/m`-only, so workers need a thin equivalent. `__NS_HMR_WORKERS__` (`worker-tracking.ts`; its sweeper has no caller) moves to the dev object with worker HMR.
- **`__NS_HTTP_ORIGIN__` was readable by app code.** It is now the dev object's `httpOrigin`; code outside `@nativescript/vite` that read the global gets `undefined`.
- **Monorepo Angular ids.** Analog builds `angular:component-update` ids relative to `process.cwd()`, while the NS config comment assumes `workspaceRoot`. The NS rules resolve both, but in-place updates in an Nx workspace are unverified.
- **Per-device catch-up.** Served modules and delivered saves are tracked per dev server, not per device connection, so with two devices, one booting while the other is connected can miss an update (see "Failures").
- **Failure escalation.** A teardown that throws during a retry, when the app is already torn down, restarts; tolerating it may be better. A bootstrap failure never escalates to a restart.
- **Analog clears its `classNames` on any non-component `.ts` edit**, so the next template edit of each component reboots the app instead of updating in place, until that component's `.ts` is recompiled.
- **A declined module between the edited file and its boundary** is neither `path` nor `acceptedPath` of the `js-update`, so the device can't see it. That needs detection on the server.
- **Restart-required overlay tone:** it uses the existing `warn` tone, which the native iOS and Android overlays draw as the neutral connection panel. A distinct colour needs a new tone in both native renderers.
- **`?v=` volatile patterns** now re-fetch optimized deps on every import, because `v` is part of the module key. Revisit with phase 3c.
