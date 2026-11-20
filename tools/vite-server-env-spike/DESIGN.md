# @nativescript/vite: thin-only design

**Goal.** One dev mode. The device runs Vite's client-environment output, and a port of Vite's browser client handles updates. NativeScript adds only what a browser has and a NativeScript app lacks: a module loader over HTTP, no DOM, and no `location.reload`.

**Principle.** Use Vite's own semantics wherever a browser would. Frameworks decide HMR through their own Vite plugins (Analog, plugin-vue, vite-plugin-solid, …), not through NS server strategies. NS code exists only where there is no browser equivalent, and its contract is Vite's public client events.

**Globals.** Device code shares state through ESM imports: under HMR all device code but an Android custom `Application` chunk is served by Vite, and every served module has one URL and therefore one instance. The one NS global is `globalThis[Symbol.for('nativescript.dev')]` (`hmr/shared/runtime/dev-globals.ts`, see "Dev globals"), which code generated as strings can reach. Libraries such as `@nativescript/angular` use standard `import.meta.hot`. What remains outside the dev object:
- keys core owns: `__NS_DEV_PLACEHOLDER_ROOT_VIEW__`/`__NS_DEV_PLACEHOLDER_ROOT_EARLY__` (read by core `application.ios.ts`) and `__NS_LAST_XML_ERROR__` (written by core `ui/builder`);
- compile-time defines, which are not runtime globals: `__NS_ENV_VERBOSE__`, `__NS_HMR_PROGRESS_OVERLAY_ENABLED__` and `__NS_WEBPACK__` (`false`, shared with webpack).

The live overlay always renders at its fixed position (`HMR_OVERLAY_POSITION`, the top toast chip); nothing configures it.

The before → after table is in FINDINGS.md round 14.

The inventory behind this is the subagent map in `$CLAUDE_JOB_DIR/tmp/nsvite-map/inventory.tsv` (227 files, 51k LOC). The summary is in FINDINGS.md.

## Architecture (as built after phase 5a)

### Serving: plain Vite URLs
- **Boot.** Under HMR, `bundle.mjs` is the dev boot loader (`runtime/dev-boot-loader.ts`), with no static HTTP import. The HMR build bundles it; in single-process dev `vite serve` writes it (see "Single-process dev"). It dynamically imports `<origin>/@vite/env` (see "Defines"), then the dev boot module `virtual:ns-dev-boot` (`helpers/main-entry.ts`, device URL `/@id/__x00__virtual:ns-dev-boot`), and awaits it (top-level await). On Android it also imports the app components (see "Dependencies"). See "Boot like release" for the sequence and the fallback screen.
  - The boot module holds the boot sequence as bare specifiers: the XHR polyfill, core's `globals`, `application` and `bundle-entry-points`, the core aliases, the flavor's extras (Angular's compiler facade, `virtual:ns-ui-registration` for TS/JS), the app's polyfills, `@valor/nativescript-websockets`, the session bootstrap and core's `inspector_modules`. It ends with `export const bootFailure = await startBrowserRuntimeSession(…)`. Vite serves it, so import analysis writes every URL it imports, `?v=` included, exactly as for the app graph.
  - **Why served, not bundled:** `bundle.mjs` runs before the session bootstrap's `configureLoader` installs the import map, so it can name only absolute URLs, and the `?v=` hash changes on every cold start.
  - The dev client bootstrap is the served `virtual:ns-dev-client` (`createNsDevClientModuleCode` in `hmr/server/vite-plugin.ts`, device URL `/@id/__x00__virtual:ns-dev-client`), with the start options baked in.
- **The device fetches `<origin><vite-url>`, exactly as a browser would.** Vite's own middleware answers every module request: transform, `?t=`/`?import` handling, `?direct` CSS, ETag/304, `/@fs`, `/@id`, `/node_modules/.vite/deps`. There is no NS module route and no URL prefix. Static specifiers stay as Vite's import analysis writes them, root-relative, and the runtime resolves them against the importer's HTTP URL.
- **`/@vite/client` is our device client.** `nsViteClientPlugin` (`enforce: 'pre'`, client environment only) resolves `/@vite/client`, and the alias Vite installs for it, to `hmr/client/thin-vite-client.ts`. The device URL stays `/@vite/client`; the module's graph URL is `/@vite/client.js`, because Vite appends the resolved file's extension.
- **One device-request middleware runs ahead of all others** (`hmr/server/device-requests.ts`, placed with `useFirst`, i.e. before Vite's own middlewares and before `enforce: 'pre'` plugins' ones). It:
  - strips the runtime's transport-only `__ns_dev_nonce` from `req.url` and `originalUrl`, so it never reaches Vite's graph or any route;
  - records a module response as served once it finishes (2xx JavaScript, or a 304 that isn't a stylesheet), under its client-graph URL, for the boot-race catch-up (see "Failures");
  - rewrites the imports of JavaScript responses for the device runtime (next two bullets, `hmr/server/device-imports.ts`);
  - waits, on the first request, until the `@nativescript/core` directory is resolved and added to `fs.allow`.
- **Runtime builtins stay bare.** Import analysis serves `import … from 'ns:module'` as `/@id/ns:module`; the response rewrite turns it back into the builtin specifier, which the runtime resolves itself.
- **Dynamic `import('/…')` is made absolute at response time — an interim.** The iOS runtime resolves a dynamic `import()` with a non-`http(s)` specifier on the filesystem and strips its query (`ModuleInternalCallbacks.mm`, `ImportModuleDynamicallyCallback`), so `import('/src/app/home/home.component.ts')` from a lazy route fails. The rewrite prefixes the origin to every root-relative string-literal dynamic import in a 2xx JavaScript body (`es-module-lexer`), query untouched; other static imports are left alone.
  - **Why at response time, not in a `post` transform:** Vite's soft invalidation (`vite:import-analysis` → `transformRequest` reuse with re-stamped imports) rewrites `?t=` only on specifiers equal to the imported module's root-relative URL. A transform-time absolute URL would keep a stale `?t=` after an edit further down the chain, and the device would re-import the old instance. Rewriting the response leaves Vite's cached transform and its re-stamping intact. The ETag stays Vite's: for one origin the rewrite is a pure function of the body.
  - Non-literal dynamic imports go through Vite's `__vite__injectQuery`, which our client's `injectQuery` serves: it prefixes the origin to a root-relative result.
  - Goes away once the iOS (and Android, to check) runtimes keep the URL `ResolveSpecifierToPath` already computes against an HTTP referrer, with its query (REVIEW-DECISIONS, phase 3b).
- **NS endpoints live under `/__ns_dev__/`** (`hmr/server/dev-routes.ts`): `session.mjs` and `import-map.mjs` (served as modules, `export default {…}`, so the device loads them through the module loader during boot), and `restart`, `boot-failed`, `warm` (see "Boot like release"). They are never recorded as served.
  - **The action routes** (`restart`, `boot-failed`) answer 403 without `?token=<webSocketToken>` (timing-safe compare; skipped under `legacy.skipWebSocketTokenCheck`), and warn once per route. The token is Vite's own, one per `vite serve` process: `pinWebSocketToken` keeps the first config's token for every config the process resolves (`server.restart()` keeps it) and publishes it to `<os tmpdir>/nativescript-vite/<sha1(root:port)>/dev-ws-token` (the CLI runs one server per platform, on its own port) (`helpers/dev-ws-token.ts`; mode 0600, written through a rename, rewritten only when it changes). The file sits outside the project, so the dev server never serves it (`/@fs/…` answers 403). In single-process dev the server bakes its own token into the `bundle.mjs` it writes and publishes no file. Otherwise the HMR build bakes it into `bundle.mjs`'s loader options: under the CLI it reads the file only once the dev server accepts connections (`waitForDevServerListening`, 30 s cap), because the server publishes before it listens and the file may still hold the previous session's token until then; without the CLI it reads what is there. The loader can't learn it from the server: it polls `restart` while the server is down.
    - **Sessions:** each `ns run` gets a new token and a new `bundle.mjs`, which the CLI installs before it launches the app. A fallback process left from an earlier session polls with the old token and gets 403 until the CLI's launch replaces it; without the CLI, nothing replaces it (relaunching it boots fine: the socket token comes from `session.mjs`). A build that outlives its dev server (both started by hand) keeps the old token until it restarts: registering the token file with `addWatchFile` from the HMR entry's `load` gave no rebuild when the file changed (observed on Vite 8.3.8; cause not isolated).
  - Read-only routes (`session.mjs`, `import-map.mjs`, `warm`) take no token. `session.mjs` carries the token in `wsUrl` and answers with `Access-Control-Allow-Origin: *`, and the server runs with `cors: true`, so a page in the developer's browser can read the token; the token stops blind requests, not a page that reads it first.
- **`server.fs.allow`:** Vite's middleware enforces it, as `transformRequest`'s load fallback does. `baseConfig` keeps `searchForWorkspaceRoot(projectRoot)` first, because setting `fs.allow` replaces Vite's default, then adds the workspace roots of linked dependency checkouts. The HMR plugin adds the `@nativescript/vite` package directory in `configResolved` and the `@nativescript/core` directory once the client resolver can resolve it, each as given and as a real path (`allowServedDirs`). Vite reads the list on every check, so late entries count. Files the device requests without an importer Vite analyzed (import-map targets, the Android app components' core URLs) are checked before any import analysis could mark them safe.
- **Host check:** Vite's `allowedHosts` rejects unknown `Host` headers. Loopback and IP literals pass by default; `allowDeviceHost` adds the `NS_HMR_HOST` hostname, when it is one, to the resolved config before the server is created.
- **Base:** only `base: '/'` is supported on device. The device URLs, the import map and `bundle.mjs`'s two URLs are origin + Vite URL with no base.
- **One origin source:** `getServerOrigin(server)` for the session, the client bootstrap, the import map and the dynamic-import rewrite. `bundle.mjs` bakes the origin `resolveDeviceReachableOrigin` computes from the same server config. The `Host` header is never used.

### Boot like release
- **The app entry's own `Application.run` launches the app**, as in release; there is no placeholder root. The iOS runtime defers every JS call to `UIApplicationMain` (`MetadataBuilder.mm:1353`) and enters it from its boot loop (`NativeScript.mm:148-185`) in the run-loop slice after `run`, even while `bundle.mjs`'s top-level await is pending. So on iOS `run` returns; on Android it returns too. Nothing depends on either.
- **Sequence** (`bundle.mjs` → boot module → `session-bootstrap.ts`): import `/@vite/env` (6 s reachability timeout) → the boot module's graph → `session.mjs` and `import-map.mjs` in parallel → `configureLoader` → the dev client (`virtual:ns-dev-client`) → a launch-event listener → the app entry. Boot completes (`nsDev().bootComplete`) on the tick after the launch event; the dev client then starts the HMR client.
  - Everything up to the entry's `run` runs before `UIApplicationMain`, inside the iOS launch watchdog (about 20 s on a device).
  - Session and loader config are modules, not `fetch`: the local main module's ~1 s settle window (`ModuleInternal.mm:51-58`) services module fetches but not the run loop `fetch` completes on.
- **Never reject the main module:** a rejection before `UIApplicationMain` starts is fatal on iOS, even after `run` was queued. `startBrowserRuntimeSession` resolves `{ message, stack }` when the boot failed before the entry called `run` (`Application.started`), else `undefined`.
- **Fallback screen** (`runtime/dev-boot-loader.ts`, part of `bundle.mjs`, no served code): when the dev server doesn't answer `/@vite/env`, or the boot failed before `run`, the loader launches the app itself with one screen (raw UIKit through the runtime: a `UIApplicationDelegate`/`UIWindowSceneDelegate` pair, a `UITextView`), then:
  - **unreachable:** an alert too, and every 2 s `GET /__ns_dev__/restart?reason=…&age=<ms since the loader started>&token=…` (`NSURLSession`); the first 2xx answer means the server asked the CLI to restart the app. The server answers 409 instead, and the loader keeps polling, when the CLI spawned it, this is the process's first server start, and `age` exceeds the time since the server started listening: that process was launched while the server was down, and the CLI's own launch after its first build replaces it (`cliLaunchesAppAfterServerStart`). A process the CLI launched (one that met the Local Network prompt, say) is younger than the server, so it gets the restart. With the per-session token, a process from an earlier session already stops at the token check (403); the age rule decides only for current-token requests and under `legacy.skipWebSocketTokenCheck`, where it is again what prevents the double boot;
  - **boot failure:** the error and stack, plus the server's recent transform error from `GET /__ns_dev__/boot-failed?token=…&reason=…` (HTTP: the HMR socket only opens after launch, and a failed boot never launches); the server then restarts the app on the next file change, and drops the `full-reload` Vite keeps for the next socket connection.
  - Its window sits at `UIWindowLevelNormal + 1`: after a boot failure, core (already loaded) still answers the launch with its own window.
- **Android fallback** (same file, raw Android SDK through the runtime): `bundle.mjs` runs inside `Application.onCreate`, which the runtime holds until it settles, so the loader resolves instead of rethrowing (a rejection there is fatal, and the runtime's `ErrorReportActivity` can't start from the background on API 35: `BAL_BLOCK`, black screen).
  - **Probe first:** a TCP connect to the dev server's port, at most 2 s, on the main thread (`StrictMode` network permitted for the call). The runtime also holds `Application.onCreate` while any module fetch is in flight, abandoned or not, so a `/@vite/env` import to an unroutable host held it past the startup timeout (ANR "failed to complete startup") although the loader had given up after 6 s. On failure no fetch starts. Measured on the emulator: unroutable host → screen in 2.7 s; refused (server down behind `adb reverse`) → 0.8 s.
  - **Screen:** the loader extends `AppCompatActivity` under the manifest's launcher activity name (`getLaunchIntentForPackage`, which may be a served app component) and as `com.tns.NativeScriptActivity`, each with an `onCreate` that shows a `TextView` in a `ScrollView`, and registers `ActivityLifecycleCallbacks` that show the same view in any resumed activity. When the boot failed after the dev boot module registered the real class, the name is taken (first `extend` wins) and that activity launches; core's installs no content without a main entry and doesn't throw, and the callback puts the screen over it. The native app comes from `NativeScriptApplication.getInstance()`, or `ActivityThread.currentApplication()` by reflection under a custom `Application`.
  - **Requests:** no HTTP client answers on the main thread without core, so the restart poll and `boot-failed` go through the runtime's module loader: `?module=1` makes those routes answer `export default {…, status}` with HTTP 200, and a counter query keeps each answer out of the module registry. The restart poll probes the port first (500 ms), so an unroutable host doesn't pile up fetches.
- **Warm-up:** at listen the server transforms the boot module, the dev client and the entry, and waits for Vite's crawl to be idle (`environment.waitForRequestsIdle()`). The HMR build's first CLI notification waits for `GET /__ns_dev__/warm` (30 s cap, `helpers/ns-cli-plugins.ts`); in single-process dev the server sends it itself once the same warm-up is idle (same cap). Either way the CLI launches the app against a warm server.

### Single-process dev: `vite serve` writes the dev output (iOS, visionOS)
- **What.** Under HMR on iOS and visionOS, `vite serve` alone produces what `vite build --watch` writes into the CLI's staging directory (`build.outDir`, `.ns-vite-build/<platform>`), and the CLI runs no build process (`hmr/server/dev-output.ts`, started from `nsHmrClientVitePlugin`'s `configureServer`):
  - `bundle.mjs`: the compiled dev boot loader as shipped in the package (`runtime/dev-boot-loader.js`, which imports nothing, so no bundling happens at dev time) behind the timer prelude, plus one `await bootFromDevServer({ origin, bootUrl, token, verbose })` (`composeDevBootBundle`, `helpers/dev-boot-bundle.ts`). Origin from `getServerOrigin(server)`, token the pinned `webSocketToken`. No source map.
  - `package.json` (`nsConfigToJson()`, as the build emits it), and copies of the app's `assets/` and `fonts/` (dot-named entries skipped).
- **When.** Once the server listens and its boot graph warm-up is idle (30 s cap). The first sync of the process makes the directory match (rewrites changed files, deletes everything else when the directory lies inside the project, as Vite's `emptyOutDir` decides) and sends the CLI the build's `initial` message with every file. If that first write fails, the process exits, so the CLI's run fails instead of waiting.
- **Then.** Vite's watcher keeps the copies current: `add`/`change` copy the file (unchanged content is skipped), `unlink` deletes it. Each 100 ms burst becomes one `incremental` message: `emittedFiles` for files present, `removedFiles` for deleted ones. A `server.restart()` re-syncs and sends only what changed: the "initial sent" flag is module state.
- **Static copy.** `vite-plugin-static-copy` keeps its build half; its serve half is dropped, because it answers a copied file's change with `full-reload`, i.e. a second app restart after the CLI's.
- **Negotiation.** Both sides must agree, so every package/CLI combination keeps working:
  - The package declares `"nativescriptCli": { "singleProcessDev": ["ios", "visionos"] }` in its `package.json` (equal to `SINGLE_PROCESS_DEV_PLATFORMS`, a spec checks). The CLI reads it from the installed package without loading Vite.
  - The CLI then spawns only `vite serve`, with `NS_VITE_SINGLE_PROCESS=1`, and takes the build messages from it. `NS_VITE_SINGLE_PROCESS=0` in the CLI's environment keeps two processes.
  - The server writes only when that variable is `1` and the platform is listed (`isSingleProcessDev`); otherwise the HMR build, the token file and the warm route serve the two-process session as before.
- **CLI side** (nativescript-cli `feat/vite-single-process`): the serve child counts as the platform's bundler process; it is stopped once; an exit before the first message fails the run. A `removedFiles` entry is deleted from the native app folder; a message with only removals syncs nothing.
- **Removed files stay on the device** until the app is reinstalled: live sync passes `filesToRemove: []` (run-controller), so it never deletes on the device.
- **Android** keeps the HMR build for now (not in `singleProcessDev`). Only a custom `Application` still needs a build output on disk (the **Android** bullets below); the server could write that chunk and `bundle.mjs` the way it does on iOS.

### Import map: bare specifiers the device resolves at runtime
- `/__ns_dev__/import-map.mjs` (`buildImportMap` in `import-map-route.ts`): each bare specifier → origin + the Vite URL of the file Vite's client resolver picks (`viteUrlForFile`, so one file has one URL), with the resolver's query kept, so a target equals the URL import analysis writes for the same specifier, `?v=` included. An included package's target is its pre-bundle. Exact keys only, no prefix entries.
- **Why it is small.** Import analysis rewrites every bare specifier in served code, `bundle.mjs` names absolute URLs only, and the runtime's native `require` never reads the map (it resolves on disk only). The map serves only bare specifiers the device resolves itself at runtime: an app's `import(expr)` that evaluates to a package name. No such site exists in the fixtures.
- **Keys** (`collectImportMapSpecifiers`, `import-map.ts`): `@nativescript/core`; the package names in the app's `package.json` `dependencies` (no devDependencies, no subpaths, minus the omit list, `@nativescript/vite` and the platform runtimes); the strategy's `importMapSpecifiers()` (Vue, Solid); the `node:` builtins. Fixtures: Angular 14 entries, Vue 6, toolbox 4.
  - A key that doesn't resolve gets no entry.
  - A target must be a regular file: a resolved directory (an alias to a CSS-only package such as `nativescript-theme-core`) gets no entry.
- **The map can't start discovery** (`wouldDiscover`). Resolving a key Vite's optimizer doesn't know would register it as a new dependency, and a discovery after the first optimizer run re-optimizes. A key is skipped when the optimizer discovers, the key isn't excluded, optimized, discovered or a chunk, and a side-effect-free `scan` resolve lands in `node_modules`. Every package key is in `include` or excluded (see "Dependencies"), so today this skips nothing; it guards against `package.json` edits mid-session.
- **Targets outside `fs.allow`.** Each target file is added to Vite's internal `config.safeModulePaths`, the set Vite's own import analysis fills, so a target outside `fs.allow` (an aliased out-of-tree checkout, a global pnpm store) is served without widening `fs.allow` on a LAN-bound server. `safeModulePaths` is not public API; if Vite renames it, the registration silently does nothing and such targets get 403.

### Dependencies: Vite's dep optimizer
- **Vite pre-bundles third-party dependencies in dev, with discovery on** (`getDevOptimizeDeps` in `helpers/dev-optimize-deps.ts`, wired in `configuration/base.ts`). An installed `@nativescript/core` is pre-bundled too (see `exclude`). Everything else, `@nativescript/vite` and a linked core included, is served as its own files. There is no NativeScript deps bundle or vendor registry.
  - One URL per file holds because Vite writes every URL the device loads: import analysis for served code and the boot module, the same resolver for the import map. An excluded `node_modules` package carries `?v=<browserHash>` like any other.
  - The platform resolver passes the platform file it picks through `this.resolve` when an optimizer exists (`helpers/resolver.ts`), so the file gets the same `?v=` however it is reached.
- **`entries`:** the app entry (package `main`), the app files the boot module imports, the bundler context's code files (TS/JS), and the files behind the boot module's and the dev client's imports of excluded packages (our runtime files; core's `globals/index`, `application`, `bundle-entry-points` and index when core is excluded). All of these are reached only through virtual modules, which the scanner doesn't read.
  - Plus the entry file (`resolvePackageEntryFile`: the platform `main` variant, else the root `exports` target, `module`, `main`, `index`) of every linked or platform-main package in `dependencies` or the boot imports. Not `devDependencies`: they hold build tooling, whose entries are Node code the device never loads, and the CLI builds the native side of `dependencies` only. No fixture has a linked or platform-main `devDependency` besides `@nativescript/vite`. Not core or `@nativescript/vite`, which the boot imports cover.
  - The scanner doesn't follow an import of an excluded package. Scanning these files is how the third-party deps of served packages (core's `tslib`, `css-tree`, `@csstools/*`, `acorn`, ...; the toolbox's `@nativescript/imagepicker` → `@nativescript-community/perms`) are pre-bundled once for every importer, served or pre-bundled, with an installed core and a linked one alike. Unscanned, such a dep is served unbundled when its importer's path is under `node_modules` (installed, or linked under `preserveSymlinks`), so a CommonJS one fails to load; it is discovered at request time when the importer lies outside `node_modules` (a linked core), which re-optimizes; and a package that a served package and a pre-bundle both import loads twice.
  - Cost: a bare import that doesn't resolve in any scanned file fails the whole scan, and Vite then pre-bundles only `include` (FINDINGS round 19, stage 6).
- **`include`:** the boot module's bare imports plus the import map's package keys (the app's `dependencies` with a JavaScript entry, and the flavor's specifiers), never an excluded one. Plugin-added includes (Analog's `rxjs`, `rxjs/operators`) and the app's own stay; the React flavor lists `react` and `react-reconciler`.
  - **Why the map keys:** compilers add imports that no source file has. The Angular compiler adds template-dependency imports (`@angular/common`, `@angular/router`) to served components; the scanner never sees them, and discovering them at request time re-optimized (FINDINGS round 19).
  - Cost: a declared dependency that Rolldown can't bundle fails the cold start, even if the app never imports it.
- **`exclude`:**
  - `@nativescript/core`, `@nativescript/vite` (`NS_OPTIMIZE_DEPS_EXCLUDE`): one instance, shared by the boot module, the dev client and every pre-bundle. An installed core (realpath under `node_modules`) is pre-bundled instead (`getNsOptimizeDepsExclude`; a device boot is then about 80 requests instead of about 320); `NS_VITE_PREBUNDLE_CORE=0` serves it as files. A linked or source core stays excluded, so its edits reach the graph. The import map points `@nativescript/core` at the pre-bundle, and `core/xhr` and `core/file-system` are in `include` because only unscanned code (`virtual:ns-xhr-polyfill`, the injected `module-require.js`) imports them; another such subpath would re-optimize the server;
  - `module`, `node:module`, `set-value` (same list): aliased to shims in this package. The optimizer applies `resolve.alias`, so it would inline a copy of the shim into each pre-bundle;
  - every linked dependency (realpath outside `node_modules`, `getLinkedDependencyNames`): with `preserveSymlinks` its files sit under `node_modules`, so Vite would pre-bundle it, or inline it into another pre-bundle, instead of serving its watched source;
  - every platform-main package (`getPlatformMainPackageNames`), such as `@valor/nativescript-websockets`: our `enforce: 'pre'` package resolvers rewrite its root import to a platform file, bypassing Vite's resolution, so its pre-bundle would never be used.
- **Pre-bundle build options** (`optimizeDeps.rolldownOptions`): the platform conditions and extensions; `define` from `getOptimizeDepsDefine` (`global`, `process.env.NODE_ENV`, `__non_webpack_require__` → `require`); plugins `optimizeDepsEsmRequirePlugin`, NativeScript's builtin-module stubs, the platform resolver and the NativeClass transform.
- **`require()` of an excluded package inside a pre-bundle** (`optimizeDepsEsmRequirePlugin`, `helpers/optimize-deps.ts`) compiles to `import * as m from '<spec>'`, for the package name and its subpaths. `require()` returns what Node's `require()` of an ES module returns: the `'module.exports'` export when there is one, else the exports, flagged `__esModule` when one of them is `default`. Import analysis then points the import at the served module. Otherwise Rolldown emits `__require(…)`, which needs a global `require`; Vite's `cjs-external` facade covers exact names only.
  - Hand-written because Rolldown's built-in `esmExternalRequirePlugin` is silently ignored by another Rolldown copy, and the Vite running the dev server need not be the one this package imports.
- **Angular.** Analog's optimizer plugin runs Angular's linker on every optimizer input (`linkerJitMode: true`), so pre-bundles carry no `ɵɵngDeclare*` and `@angular/compiler` is one instance. Served `fesm*.mjs` files that skip the optimizer (a `file:`-linked `@nativescript/angular`) are linked by Analog's own dev-server plugin (`analogjs-router-optimization`, which re-reads the file from disk), and builds by Analog's build optimizer plugin (files under `fesm20xx`). NativeScript runs no linker of its own. Partials outside those paths load through the JIT compiler in dev (checked on the simulator with a linked package holding `ɵɵngDeclare*` in a plain `index.mjs`); in builds, `angularUnlinkedPartialsGuardPlugin` (`configuration/angular/unlinked-partials-guard.ts`) fails the build naming each bundled module that still holds `ɵɵngDeclare` (`@angular/core`/`@angular/compiler` excepted: they only define those functions). No other Angular output transform runs: no chunk relinking, no decorator or worker-URL rewriting, and no CommonJS shims (Rolldown converts CommonJS in builds; dev pre-bundles it). Analog's compilation API stays off in every mode: in `vite build` it leaves app components as raw decorators.
- **Cold and warm starts.** `entries` and `include` aim for a cold scan that finds every dependency before the first request; in the fixtures it does, so the `browserHash` is stable for the session. A dependency discovered later (an import no scanned file has and no `include` names) re-optimizes; if that changes the hash, Vite sends `full-reload`, i.e. an app restart. Vite seeds a cold session's hash with a timestamp, so it differs on every cold start and from the one persisted in `_metadata.json`. A warm restart reuses the cache without re-optimizing. Either way a server restart means an app restart.
- **Edits under `node_modules`** are not watched by default, as in webpack and web Vite: Vite's watcher ignores `**/node_modules/**` (plus `.git`, `test-results` and the optimizer's `cacheDir`). Watching them is standard Vite config, and the NativeScript plugins only react to what the watcher reports:
  - **Turning it on:** `server.watch.ignored` negations in the app's `vite.config`: `'!**/node_modules/<pkg>/**'` per package, plus `'!**/node_modules'` and, for a scoped package, `'!**/node_modules/@scope'`. A negation wins over every ignore glob, in any order (chokidar's `anymatch`). The two directory negations un-ignore those directories only, so their other entries stay ignored. Chokidar doesn't descend into an ignored directory, so without them only macOS FSEvents, which filters event paths instead of walking, reports anything (measured on Vite 8.3.8 with `useFsEvents: false` and with polling). `--env.watchNodeModules` (webpack's flag, where it empties `snapshot.managedPaths`) is sugar: `baseConfig` appends these globs for the `dependencies` of the app's `package.json` (`getNodeModulesWatchGlobs`, `helpers/hmr-scope.ts`). Direct dependencies only, so a transitive package bundled into a pre-bundle stays unwatched unless the user negates it too.
    - Never `'!**/node_modules/**'`: it also overrides the `cacheDir` ignore, and every optimizer write becomes a watcher event.
    - A negation also overrides the other ignores inside that package (its `platforms/`, its nested `node_modules`).
    - A package behind a symlink (a linked checkout, a pnpm install) reports through its symlink path, which chokidar follows. Under `preserveSymlinks` that is the module graph's path too. With FSEvents a pnpm install also reports its real path under `node_modules/.pnpm`, which matches nothing.
  - **A served package** (excluded from the optimizer: platform-main, linked, `module` shims): Vite finds its module in the client graph and propagates the update like an app file's, to the nearest accepting module or, with none in the library, the entry boundary (a soft reboot). Restart exceptions are in "Soft reboot vs app restart": core and `@nativescript/vite`, and an update that climbs into a pre-bundle or core.
  - **A pre-bundled package** (`nsPreBundleWatchPlugin`, `hmr/server/prebundle-watch.ts`, serve only, always registered): its files are not in the module graph, so Vite reports the edit to `hotUpdate` with no modules and does nothing. The plugin's client-environment `pre` `hotUpdate` claims a file that is an input of a current pre-bundle and returns `[]`, ahead of `nsAppRestartPlugin`:
    - Inputs, read once per optimizer metadata object (Vite replaces it on every commit): the files every pre-bundle's source map lists (fallback: the dep's `src`), plus any code file (`.[cm]?[jt]sx?`, `.json`) of a package those files belong to. Rolldown can fold a module away entirely (a re-exported constant), leaving no trace in the map.
    - An app file in the graph skips the maps.
    - Vite's watcher walks the root and the graph's files only. On the first serve of an optimized file per metadata object, the plugin `watcher.add`s the bundled packages that lie outside the root (a hoisted workspace `node_modules`); `server.watch.ignored` still filters them, so this is inert without a negation.
  - An edit (any event type; chokidar reports some edits as `create`; debounced 100 ms; an event whose file predates the last restart is ignored) runs `server.restart(true)`: a new optimizer session, so a new `browserHash` and new URLs. A rerun within the session doesn't work: `fileHash` ignores content, so a content edit keeps the old hash, and a rerun's hash has no timestamp, so a second edit repeats the first one's.
  - Restarts are serialized, and an edit during one loops again. Then the plugin waits up to 2.5 s for a device connection (the old app reconnecting; the client pings every second) and requests one app restart. `restartServerBeforeAppRestart` (`app-restart.ts`) turns off the new server's first-connection trigger when IPC exists, so the app restarts once.
  - The restart state is module-level, so it survives `server.restart()`. Each server has its own watcher: an edit that lands between the old watcher closing and the new one's initial scan can be missed.
- **Android:**
  - **The launcher activity and app components are served.** Under HMR the dev boot module imports, ahead of the app entry, every app component (`NS_APP_COMPONENTS`/`appComponentsPlugin`) except a custom `Application`, then core's `ui/frame/activity.android`. No binding generator stub is involved:
    - a named `extend('a.b.C', …)` / `@JavaProxy('a.b.C')` generates exactly that class at runtime and the main-thread runtime injects its dex into the app's `PathClassLoader` (`DexFactory.resolveClass`, `isNamedProxy`, `injectDexIntoClassLoader`; runtime 9.1.0+), so Android's `loadClass` finds it;
    - the runtime holds `Application.onCreate` until `bundle.mjs` settles, top-level await included (`HoldBootBackstop`, `Runtime.cpp`), so the classes exist before Android instantiates the launcher activity;
    - a runtime-generated class carries no `@JavaScriptImplementation` (the proxy generator never writes it), so `Runtime.createJSInstance` evaluates no file on disk: the served module's implementation is the one used.
    - An edit to a served app component is a `full-reload`, i.e. an app restart (a class can't be re-extended in place).
  - Verified on the emulator: core's activity (vue, ng), and a custom `@NativeClass` `@JavaProxy` activity named in the manifest (vue), each with one core in the request log.
  - **Custom `Application`** (a component whose source extends `android.app.Application` or `MultiDexApplication`, `isApplicationComponent`): Android instantiates it before any JavaScript runs, so the HMR build still emits it as an `.mjs` chunk for the binding generator, and the runtime evaluates that file from disk first. That chunk can't share the served core: if it imports core, it should bundle its own copy (not built; only a core-free `Application` was, on vue). Verified there: boot, boot-error fallback and server-down fallback with a custom launcher activity.
  - **SBG:** the static binding generator walks every `.js`/`.mjs` under `assets/app` (`Main.java` `traverseDirectory`) and needs no file by name.

### Require: per module, never global
Served code doesn't reach the runtime's global `require`.
- **A module-scoped `require`** (`nsModuleRequirePlugin`, `hmr/server/module-require.ts`; serve only, client environment, `enforce: 'post'`, i.e. after the framework compilers and before import analysis). A served module with a free reference to `require` or `__non_webpack_require__` gets a prelude on its first line, so no line moves. Free means no enclosing scope binds it (`parseAst` plus a scope walk adapted from Vite's `ssrTransform`), so modules with their own `require` and wrapper parameters are left alone.
  ```js
  import { createModuleRequire as __nsCreateModuleRequire } from "@nativescript/vite/runtime/module-require.js";import * as __nsRequireDep0 from "./data.json";const require = __nsCreateModuleRequire("src/a.ts",{"./data.json":[__nsRequireDep0,"default"]});
  ```
  - A string-literal specifier that resolves when the module is served is hoisted as `import * as` of the same specifier: import analysis writes its URL, so the module has one instance, and `require` returns it synchronously.
  - **Shape** (`runtime/module-require.ts`): JSON → its default. A CommonJS pre-bundle → what import analysis gives the same import (`interopHelper(m, isNodeMode)`, from the dep's `needsInterop` and the importer's module type). An ES module → a getter-based CommonJS view, cached per namespace, with the same conventions as the pre-bundle facade; getters keep live bindings, so a `require` inside an import cycle reads no uninitialized export.
  - `ns:`/`node:` builtins, absolute paths and `file:` URLs → the runtime's `createRequire` (a static `import { createRequire } from 'ns:module'`) with base `knownFolders.currentApp().path + '/'`. The runtime's `createRequire` refuses `http(s)` bases.
  - Anything else (non-literal, or unresolvable at serve time) throws when called, naming the module and the specifier. `require.resolve`, `require.context` and `require.cache` throw "not supported in dev".
- **Pre-bundles** inline their own CommonJS `require`s and import excluded packages through `optimizeDepsEsmRequirePlugin` (see "Dependencies"). A non-literal `require` inside a pre-bundle still compiles to Rolldown's `__require`, which falls back to the global `require`.
- **`__non_webpack_require__`.** Dev drops the define (`nsModuleRequirePlugin`'s `config` hook), so `/@vite/env` doesn't install the global `require` under that name. The transform maps free references to the module's `require`, and the optimizer defines it as `require`. Builds keep `globalThis.require` (`getGlobalDefines`).
- **Strict mode**, on by default under HMR on every platform; `NS_VITE_STRICT_REQUIRE=0` (or `false`/`off`/`no`) opts out (`isStrictGlobalRequireEnabled`, `helpers/main-entry.ts`). The boot module's first import (`runtime/strict-global-require.ts`) shadows `globalThis.require`. It stays a function and reads keep working: core reads `global.require` at boot (`global.moduleResolvers`), and the native runtime checks that it is a function before running a script.
  - **Runtime calls pass through.** The shadow keeps the `require` installed before it ran and hands it absolute filesystem paths (`/…`, not `//`) and `file:` URLs, with the caller's receiver and arguments. The runtimes look `globalThis.require` up at call time and call it with such a path for a non-ESM, non-http script: iOS's CommonJS branch of `RunModule` (`ModuleInternal.mm`, e.g. its inspector's `tns_modules/inspector_modules.js`), Android's `ModuleInternal::Load` (`ModuleInternal.cpp:604-612`). Everything else (bare names, relative paths, `http(s):`, `ns:`/`node:`) throws, naming the specifier and pointing to `import` or `createRequire` from `ns:module`. Without a runtime `require`, absolute paths throw too.
  - Workers have their own isolate and get no shadow.
  - **Android, unverified on a device.** Its inspector loads `RunModule("inspector_modules")` (`JsV8InspectorClient.cpp`), a bare name, through `globalThis.require` when a debugger connects, so the shadow throws there and `Load` raises a native exception out of inspector init. iOS's inspector passes an absolute path.
- **Core's one call:** the `System.import` shim in core's `globals/index.ts` calls `global.require(path)`. Nothing calls `System.import`; the crawl reports it as known-uncalled.
- The dev overlay, `/@vite/client` (`thin-vite-client.ts`, `restyle.ts`) and the reboot modules import `@nativescript/core` as ESM. `ns:module` is loaded through a dynamic `import()` (`runtime-host.ts`), so a runtime without the builtin degrades instead of failing to link.

### Defines
- `config.define` is the single source: `getGlobalDefines` (`helpers/global-defines.ts`) plus the app's own entries.
- **Build.** Vite substitutes it in `bundle.mjs`, bare identifiers and member chains (`global.isIOS`, `process.env.NODE_ENV`) alike. Bundled device code reads defines as bare identifiers (`__ANDROID__`, not `g.__ANDROID__`), so substitution covers them.
- **Dev.** Vite's client environment does no define substitution in served modules. The first import of `bundle.mjs` is `<origin>/@vite/env`, Vite's own module. It assigns every define on `globalThis`, user defines and dotted keys included, before the boot module's graph evaluates.
  - It is the only installer, so building `bundle.mjs` with HMR active fails when no device-reachable origin resolves (`helpers/main-entry.ts`).
  - `__non_webpack_require__` is the one define dev drops (see "Require").
- **Worker realms** have no `bundle.mjs`; Vite's `/@vite/env` reaches them through the worker entry (see "Workers").
- The kept defines are the contract shared with `@nativescript/webpack` or read by core and app code (list in FINDINGS round 14). `__NS_HMR_PROGRESS_OVERLAY_ENABLED__` is read only by the overlay gate (`overlay-flag.ts`).

### Dev globals: `Symbol.for('nativescript.dev')`
- `hmr/shared/runtime/dev-globals.ts` holds the `NativeScriptDevGlobals` type, the accessor `nsDev()`, and `NS_DEV_EXPR`, the same lookup as a JS expression for code generated as strings (worker constructors).
- The module is stateless and dependency-free: every copy resolves the same object through `Symbol.for`.
- Members:
  - `bootComplete`: set on the tick after the app's launch event. The dev client bootstrap waits for it.
  - `overlay`: the dev overlay installed at boot, driven by the HMR client (`overlay-driver.ts`).
  - `httpOrigin`: the dev server origin the session booted from. Generated worker code resolves worker URLs against it.

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
- The session descriptor (`/__ns_dev__/session.mjs`) carries:
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
- **Bootstrap.** The served `virtual:ns-dev-client` waits for the dev globals' `bootComplete`, then calls `start({ wsUrl, wsProtocol, entryUrl, origin, root })`. The server bakes all of these in, so nothing travels through globals. `root` is Vite's project root, so error locations are root-relative from the first payload on. Contexts exist from boot; the socket attaches at `start()`. The boot overlay's stage while the session bootstrap loads it is `loading-client`.
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
- **Injection.** For a flavor whose `FrameworkServerStrategy.entryBoundary` names a teardown (Angular: `@nativescript/angular`'s `prepareHmrReboot`/`whenHmrRebootSettled`; TypeScript and JavaScript: the same pair from `@nativescript/vite/hmr/frameworks/core/client/reboot.js`; Vue: from `@nativescript/vite/hmr/frameworks/vue/client/reboot.js`; see "Frameworks"), `hmr/server/entry-boundary.ts` prepends this to the app entry. It runs after the framework's compile and before Vite's import analysis:
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
- **Without an entry boundary**, which is the case for Solid and React today, an edit with no closer boundary reaches a dead end. Vite sends `full-reload`, which is an app restart.
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
  - `nativescript:afterReboot`: the `beforeReboot` payload plus `error` when the entry import failed or the settle signal reported a failed boot (it rejected or resolved `{ error }`). It fires after the framework's settle signal (Angular: bootstrap plus `ApplicationRef.whenStable()`, capped at 5 s, and participant restore; TS/JS: the new root view loaded; Vue: the same, then the replaced app unmounted), waited for up to 15 s. It is skipped right away when the entry import failed.
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
  - **Code that evaluates once per process changed.** A client-environment `pre` `hotUpdate` (`needsAppRestartForEdit` in `hmr/server/app-restart.ts`) handles an edit (`update` or `create`, which chokidar reports for some edits) to a file the device loaded as JS (`modules` has a `js` node) when:
    - its Vite URL is once-per-process (`isOncePerProcessViteUrl`): under the `@nativescript/core` or `@nativescript/vite` prefixes from `resolveNonEvictableViteUrlPrefixes` (an installed core under `/node_modules/…`, a linked one under `/@fs/…`), any `/node_modules/@nativescript/{core,vite}/` path (another copy, or the other side of a symlink), or `/@vite/…`;
    - or the file is a served package's (a URL under `/node_modules/`) and Vite's propagation would re-evaluate a once-per-process module or a pre-bundle (`updateReachesOncePerProcessModule`: up the importers, stopping at a self-accepting module or an importer that accepts the dep). That happens when a pre-bundled package imports the excluded one: the pre-bundle gets a `?t=` stamp and would load a second time (measured on Vite 8.3.8).

    Any other `node_modules` file propagates like app code (see "Dependencies"). App files never take the walk: neither core nor a pre-bundle imports one. The hook returns `[]`, so Vite sends nothing (no `?t=` second instance next to the live one), and requests a restart. Vite ignores `node_modules` by default, so without a user `server.watch.ignored` negation (or `--env.watchNodeModules`) this fires only for workspace-linked sources under `/@fs/` (toolbox's `packages/core`).
  - **A pre-bundled dependency's source changed** (once the user's watch config reports `node_modules` edits): the dev server restarts with a new optimizer session, then requests one app restart (see "Dependencies").
  - **Boot bundle changed.** In the `vite build --watch` process (IPC already exists), `helpers/ns-cli-plugins.ts` sends the existing `emittedFiles` message (`isHMR: false`, `buildType: 'incremental'`) after an HMR rebuild only when `bundle.mjs`'s content hash changed. The CLI already copies those files and restarts the app through livesync. `bundle.mjs` is byte-stable across identical builds (`boot-bundle-hash.mjs`). In single-process dev the server rewrites `bundle.mjs` only when its content changes and then sends the same message (see "Single-process dev").
  - **`import.meta.hot.decline()`.** Vite 8.3.8 ignores it on both sides, so this is NativeScript's mapping: a `js-update` whose boundary or updated module declined makes the device send `ns:restart { reason }`.
  - **A soft reboot that can't recover** (see "Failures"): its teardown throws (the entry `dispose` or a `nativescript:beforeReboot` listener), or a retry fails again outside the re-run modules. The device sends `ns:restart`.
  - **"Restart app" on the overlay's `failed` stage**: the device sends `ns:restart`.
  - **A missed update without an entry boundary**: the catch-up on connect (see "Failures") requests a restart.
  - **A participant asks for it.** `@nativescript/angular`'s `requestNativeScriptAppRestart(reason)` sends `ns:restart` through its own `import.meta.hot`.
  - **Vite restarted itself** (`server.restart()`, a config edit). Module state of `@nativescript/vite` survives the in-process restart while plugin instances don't, so a module-level counter detects a second `configureServer`. The first device connection afterwards requests one restart.
    - Not when NativeScript restarted the server itself before requesting an app restart (`restartServerBeforeAppRestart`) and IPC exists: the CLI's restart already covers it. Without IPC the trigger stays on, so a device that reconnects late is still told.
    - The pinned `webSocketToken` (see Transport) keeps the device's original `wsUrl` valid, so it simply reconnects.
  - **Not a trigger: `@NativeClass`.** A re-evaluated class gets a new runtime class, and new uses pick it up.
- **Device → server:** `ns:restart { reason }` arrives through `server.ws.on('ns:restart')` and becomes `requestAppRestart(reason)`.
  - On the device, `requestRestart(reason)` lives on the runtime and runs once, after `nativescript:beforeRestart`.
  - It is held while the socket is down and sent on reconnect.
  - From then on, the device drops `update`, `full-reload` and `prune`; custom events still reach listeners.

### Failures
A broken save shows an error on the device and leaves the running app as it is. **Type errors don't fail an HMR build:** with HMR active the type check (`helpers/typescript-check.ts`: TypeScript, `vue-tsc`, `tsrx-tsc`) defaults to `warn`, prints the same diagnostics and lets `vite build --watch` emit `bundle.mjs`, as vite-plugin-checker does. Other builds, release included, keep the tsconfig `noEmitOnError` default. The `typeCheck` option, `NS_VITE_TYPECHECK` and `--env.typecheck` override both. The next good save applies everything since the last update that went out. A restart is the fallback only where the app can't be trusted any more.

- **Compile check (the update gate, `hmr/server/update-gate.ts`).** `nsRerunPlugin` wraps `server.ws.send`. Every payload to the device passes through a queue, so payloads leave in the order they were sent.
  - An `update` with a `js-update` is checked first. The checked set is the re-run set plus, for an accepted template, the component modules that import it (an in-place template update re-runs nothing on the device, yet a broken template must not apply).
  - Each checked module goes through `environments.client.transformRequest` with its graph URL (`transformIdForViteUrl` for `/@id/` URLs), then through the flavor's `verifyTransform`. The results stay in Vite's transform cache for the device's fetches.
  - **Angular's `verifyTransform`** (`hmr/frameworks/angular/server/compile-check.ts`) rejects output that lacks `ɵcmp`/`ɵɵdefineComponent` for a source with `@Component`. Analog with type checking disabled doesn't throw for a broken template: it emits the uncompiled decorator. The message is recovered by parsing the template with the app's own `@angular/compiler` (`parseTemplate`).
  - **On failure** the device gets Vite's standard `error` payload, `{ type: 'error', err: { message, stack, id, frame, loc, plugin } }`, instead of `ns:rerun` + `update`. Nothing is disposed.
  - **On success** `ns:rerun` goes out right before the `update`.
- **Gated events.** A flavor's in-place events (`FrameworkServerStrategy.gatedEvents`; Angular: `angular:component-update`) are held until the update of the same save passes, and dropped when it fails. Held events whose save produces no update are released after 200 ms. Analog batches its notifications and flushes them in object form (`{ type: 'custom', event }`), so both the string and the object form are recognized.
- **The next good save.** The first update that passes after a withheld one is replaced by an entry reboot (the catch-up's `js-update` of the entry), or an app restart without an entry boundary. The passing update's own boundaries may not cover the withheld edits: a util edited while its SFC was broken would otherwise never reach a component that re-renders in place. The modules the withheld and passing saves edited are re-stamped first (`invalidateModule` with HMR), so an in-place template edit's component is re-imported too. `rerun` comes from what the device has loaded (served `?t=` stamps); `changed` lists every edit since the last update that went out. A save whose error Vite sends itself (plugin-vue failing to parse an SFC in `handleHotUpdate`) withholds nothing, so its fix stays in place.
  - **Stylesheet-only exception** (`restylesWithheld`). When every withheld save edited only stylesheet files, and the passing update re-sends each of them whole (a self-accepting stylesheet module such as `app.css` or an Angular component stylesheet, a `css-update`, or a partial `@import`ed only into such sheets: one shared with a sheet that is not re-sent would stay stale there), the passing update goes out as is and restyles in place. A Vue `<style>` block is part of an SFC file, and an Angular template is not a stylesheet, so both still reboot. There is no general "the same file was fixed" exception: plugin-vue and Analog diff the fix against the broken version, not against what the device runs, so their in-place update could skip a withheld script change. A withheld save the gate has no file record of (more than 32 saves ago) reboots.
  - A deleted file is reached through its importers' old graph edges until they re-transform: it is checked after them, and only while one still imports it.
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
  - **Angular:** the worker entry is outside the Angular program, and Analog turns off Vite's TypeScript transform in this mode, so `tsFallbackTransformPlugin` (`configuration/angular/ts-fallback-transform.ts`, serve only, `enforce: 'post'`) strips its types with `transformWithOxc`. In builds, Analog (2.7.1+, analogjs/analog#2488) leaves the worker URL as written, so Vite's worker plugin emits the worker chunk.
- **Ownership.** A worker belongs to the module instance whose code constructed it. A helper injected into that module terminates its workers on `nativescript:beforeRerun` (which reaches every re-run module, accepted boundaries included) and on `hot.prune`.
  - It leaves `hot.dispose` alone: a module has one dispose slot, and the entry's is the framework teardown. A module's own `hot.prune` replaces the helper's.
  - **Trade-off:** a worker spawned through a module that isn't re-run survives a reboot, even when its re-run caller spawns another.
- **Worker edits.** An edit to the worker entry, to a worker-only import, or to a util shared with main-realm code dead-ends at the worker entry. Vite sends `full-reload`, i.e. an app restart: the main-realm HMR client can't update a worker isolate.

### CLI contract for app restarts (to implement in nativescript-cli)
1. Spawn `vite serve` with an IPC channel: `stdio: ['inherit', 'inherit', 'inherit', 'ipc']`, or `fork`. Keep stdout/stderr inherited, so logs stream as today.
2. Handle `message` events from that child. `{ type: 'nativescript:restart', reason: string }` means: restart the app process on the device(s) of that platform, with the same install and no rebuild. That is `restartApplication` for the platform's live devices.
   - Log `reason` once at info level.
   - Ignore unknown message types.
   - One message stands for any number of collapsed requests.
3. After the restart the app boots from its bundled `bundle.mjs`, fetches a fresh session from the same dev server, and reconnects. The CLI needs to do nothing else.
4. Single-process dev (see "Single-process dev"): the same channel carries the build messages too.
5. `vite build --watch` (unchanged channel): under HMR, an incremental `emittedFiles` message (`isHMR: false`) now also arrives when `bundle.mjs` changed. The existing handler, which copies the files and then emits `BUNDLER_COMPILATION_COMPLETE`, already restarts the app.
6. Without IPC the dev server degrades to a terminal line and an on-device notice, so an older CLI keeps working.

### Frameworks
No NS server strategies for updates. Each framework's Vite plugin produces stock payloads, and the device client applies them. `FrameworkServerStrategy` feeds the import map and `optimizeDeps.include` (`importMapSpecifiers`), the loader's canonicalization (`volatilePatterns`, `preserveQueryPaths`), names the entry boundary (`entryBoundary`) and plugs into the update gate (`verifyTransform`, `gatedEvents`; see "Failures").

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
- **`@nativescript/angular`** (literal `import.meta.hot`, no globals). It is pre-bundled in dev. The pre-bundle keeps the literal, and import analysis prepends `__vite__createHotContext` to the served pre-bundle as to any module using `import.meta.hot` (FINDINGS round 19, stage 6):
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
  - arms a one-shot redirect: the re-evaluated entry's `Application.run(entry)` becomes a synchronous `Application.resetRootView(entry)`. It is armed at dispose time only, so the entry's first `Application.run` is the real launch. The original `run` is never called after launch: iOS would present the new root as a modal, and Android throws "Application is already started".

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
  - The dev boot module doesn't import the context; its `virtual:ns-ui-registration` keeps core's UI nicknames and View guards. Release is unchanged.
  - The served entry's imports come in this order: the context, the entry boundary, the global stylesheet, then the entry's own source.
  - Every page XML, code-behind and whatever they import therefore sits below the entry, and an edit to one propagates through the context to the entry boundary.
  - On re-evaluation the context unregisters every name it registers before registering again (`createContextUnregisterCode`): core's `registerBundlerModules` keeps an existing `.xml`, `.css` or plain `.js` name, whose loader closes over the old context.
  - An added page registers with the next edit that reboots. A removed page is a `full-reload`, i.e. an app restart.
  - Page stylesheets are `?raw` context imports, so editing one reboots rather than restyling in place.
- **The old page's handlers.** A root reset fires no `navigatingFrom`/`navigatedFrom`. `unloaded` fires: synchronously on Android, and on iOS when UIKit's `viewDidDisappear` runs.

**Vue** (nativescript-vue 3.1, plugin-vue 6). Component HMR is plugin-vue's, unchanged; the strategy adds the entry boundary `@nativescript/vite/hmr/frameworks/vue/client/reboot.js` (package export `./hmr/frameworks/vue/client/reboot[.js]`, source `hmr/frameworks/vue/client/reboot.ts`).
- **One runtime.** `vue` is aliased to `nativescript-vue`, which imports and re-exports `@vue/runtime-core`. Compiled SFCs import from `vue`, so SFCs, the renderer and `__VUE_HMR_RUNTIME__` share one runtime-core; the real `vue` package (runtime-dom) is never loaded. In dev, runtime-core sits in a chunk shared by the `vue` and `nativescript-vue` pre-bundles. The resolve conditions pick `runtime-core.esm-bundler.js` in dev and release alike.
- **Dev build of the runtime.** The optimizer defines `process.env.NODE_ENV` as `development` (`getOptimizeDepsDefine`), so the pre-bundled runtime-core keeps its dev branch (Rolldown folds the guard away) and registers `__VUE_HMR_RUNTIME__` on `globalThis`. nativescript-vue's bare `__DEV__`/`__TEST__` come from `/@vite/env`.
- **Component updates.** Every SFC's main module is self-accepting. plugin-vue sends `custom file-changed` before the update (the update gate's queue keeps that order), which sets `__VUE_HMR_RUNTIME__.CHANGED_FILE`; the re-imported SFC exports `_rerender_only` when only its template changed.
  - template edit: `js-update` of the SFC → `rerender`, state kept;
  - script edit: `js-update` of the SFC → `reload`: a child remounts in its parent; the root runs `appContext.reload`, which nativescript-vue turns into a root remount and `Application.resetRootView` (all state lost; while away from the root page it only re-renders the template and warns);
  - `<style scoped>`: a self-accepting CSS module (`X.vue?vue&type=style&index=N&scoped=…&lang.css`), restyled in place through `updateStyle`;
  - `<style module>`: Vite's CSS modules don't self-accept, so the edit propagates to the SFC → `reload`;
  - a util imported by an SFC stops at that SFC, Vite's first self-accepting importer: a component reload, not a soft reboot.
- **Entry boundary.** An edit that reaches the entry (the entry itself, or a module only the entry imports) soft-reboots. `createApp(Root).start()` calls `Application.run({ create })` on every evaluation.
  - `prepareHmrReboot()` remembers the app of the current root view, `Application.getRootView()[ELEMENT_REF].parentNode.__vue_app__` (the NSVRoot `app.start()` mounts into, tagged by Vue's `mount`), then runs the core module's `prepareHmrReboot` (close modals, arm the `run` → `resetRootView` redirect). Idempotent.
  - `whenHmrRebootSettled()` awaits the core settle, then unmounts the remembered app once the root view belongs to another one. It resolves `{ error }` when the root wasn't replaced or the unmount threw, and never rejects.
  - **Why unmount, and why after.** Until unmounted, the old app's instances stay in Vue's HMR records: a later `reload` of the root re-renders the replaced tree, whose `createAppRoot` resets the root view to it. Unmount only detaches the root element from its NSVRoot (Vue removes just the top element; `NSVRoot.removeChild` is bookkeeping, and `createAppRoot` resets the root only on the `appendChild` that follows a remove), so the order doesn't touch the screen. Unmounting after the new root is up keeps the old app running through a failed reboot.
  - Gap: a new app that mounted but whose root reset failed is unreachable and stays mounted until a restart.
  - The module reads nativescript-vue internals that are not public API (`__vue_app__`, `parentNode`). An upstream `prepareHmrReboot`/`whenHmrRebootSettled` in nativescript-vue, as `@nativescript/angular` has, would replace it (REVIEW-DECISIONS).
- **Release** is unchanged: the boundary is serve-only.

**Solid.** Unchanged in 4b: no entry boundary, so every edit but `app.css` is an app restart. Known problems, deferred (FINDINGS round 18):
- **The compiler is Solid 1's.** `vite-plugin-solid` 2.11.17 compiles with `babel-preset-solid` 1.9.19, which emits the one-argument `effect(fn)`. Solid 2's universal renderer (`@solidjs/universal` 2.x, used by `@nativescript-community/solid-js` 2 and the official `template-blank-solid-ts` 9.1.2) expects `effect(compute, apply)` and halts reactivity on the first reactive prop (`node._effectFn is not a function`). Release builds exit 0 with that shape.
- **The Solid 2 path is `@solidjs/vite-plugin` 3** (peers `solid-js ^2`, `vite ^8 || ^9`, `@solidjs/web ^2`). Its component HMR is `solid-js/refresh`: standard `import.meta.hot` (`accept`, `data`, `invalidate`), no DOM, and the TDZ problem that kept `hot: false` is fixed there (wrapped components are hoisted).
- **Entry boundary idea:** the stock entry discards `render`'s disposer and returns dominative's `document` singleton, so the core reboot module doesn't fit (`resetRootView` with the same view pops the live Frame; the settle reports "did not replace the root view"). A boundary can own the root through Solid's public ownership API instead: run the first `entry.create()` inside a `createRoot`, dispose that root and clear `document.body` on dispose, and re-run `create()` without `resetRootView` when it returns the current root.
**React.** The supported renderer is `@nativescript-community/react` (React 19, `react-reconciler` ^0.32, dominative). Unchanged in 4b: no entry boundary, so every edit but `app.css` is an app restart; `optimizeDeps.include` keeps `react` and `react-reconciler`.
- **An entry boundary needs the renderer's own hooks** (as `@nativescript/angular` exports them). `startReactApp` keeps its root and disposer in a closure and returns dominative's `document` singleton, so nothing outside the renderer can tear the app down. Proposed upstream API:
  - a module-scope registry of rendered roots (`render()` records `{ root, container, dispose }`; the module isn't re-evaluated on a reboot);
  - `prepareHmrReboot()`: unmount every recorded root (`updateContainerSync(null, …)` + `flushSyncWork()`, so effect cleanups run), clear `document.body`, close modals, and arm a one-shot flag. Idempotent; a no-op outside Vite dev;
  - a re-entrant `startReactApp`: with the flag armed it mounts into the same `document.body` and skips `Application.run`/`resetRootView`;
  - `whenHmrRebootSettled(): Promise<void | { error }>`: resolves once the new tree committed, `{ error }` when the mount threw or the entry never called `startReactApp`; never rejects.
  - The flavor then declares `entryBoundary: { module: '@nativescript-community/react', dispose: 'prepareHmrReboot', settled: 'whenHmrRebootSettled' }`.
- **Fast Refresh** (`@vitejs/plugin-react` 6.3.0) has a no-HTML preamble (`@vitejs/plugin-react/preamble`), but the refresh runtime assigns `window.*` when it evaluates, and the iOS main realm has no `window` (dominative's `globalRegister` defines one once it evaluates). Not used.
- **`react-nativescript` is unsupported on Vite.** It is what `@nativescript/template-blank-react` 9.1.1 still uses (with webpack). Four independent reasons:
  1. install fails with ERESOLVE: it depends on `react-reconciler ^0.29` and peers `@nativescript/core ^8.3.5`; `@nativescript/vite` peers `react-reconciler ^0.32` (observed);
  2. the release build succeeds but evaluation throws: `import * as ReactReconciler from 'react-reconciler'; ReactReconciler(hostConfig)` (`dist/client/HostConfig.js:375`, rolldown `CANNOT_CALL_NAMESPACE`) calls a `__toESM` namespace object (the warning and the non-callable helper observed; the device crash inferred);
  3. under HMR it never remounted on a soft reboot: `start()` returns early when `Application.hasLaunched() || getRootView()` (inferred from code);
  4. it can't be served as its own files: a top-level `require('../package.json')` and a CommonJS `react-reconciler/constants` imported as ESM named exports (inferred from code).
- Flavor detection (`helpers/flavor.ts`, and webpack's) recognizes only `react-nativescript`. `reactConfig` declares its flavor to `baseConfig`, so a Vite React app is unaffected; detection matters only for tooling that guesses the flavor from `package.json`.

**HMR by flavor** (what a save does on the device):
| flavor | component edit | style edit | script/logic edit | util edit | entry edit | `app.css` |
|---|---|---|---|---|---|---|
| Angular | template/style-only `.html`/`.ts`: in place (`angular:component-update`) | `styleUrl`: in place (`css-update`) | component class: soft reboot; root component: soft reboot | soft reboot | soft reboot | in place |
| TS/JS | page XML: soft reboot | page stylesheet (`?raw` context import): soft reboot | code-behind: soft reboot | soft reboot | soft reboot | in place |
| Vue | template: `rerender`, state kept | `<style scoped>`: in place; `<style module>`: component `reload` | child: component `reload`; root: root remount (`resetRootView`) | imported by an SFC: that component's `reload`; only by the entry: soft reboot | soft reboot | in place |
| Solid | no entry boundary: every edit but `app.css` restarts (unchanged; see "Solid"/"React" above) | | | | | in place |
| React | no entry boundary: every edit but `app.css` restarts (unchanged; see "Solid"/"React" above) | | | | | in place |

## Phases
1. **Thin is the only mode; delete what thin never reaches.** Done (FINDINGS round 10).
2. **Transport, client port and `?t` identity.** Done (FINDINGS round 11). 2b: app restarts (FINDINGS round 11). 2c: the entry-boundary soft reboot, the event bus and the Angular reboot API (FINDINGS round 12). 2d: errors without restarting, i.e. the compile check, recoverable reboot failures, the overlay's restart action and the boot catch-up (FINDINGS round 13).
3. **Defines and globals; `/ns/v`; vendor bundle.** 3a: defines and globals, done (FINDINGS round 14). 3b: plain Vite URLs, `/ns/v` and every `/ns/*` route gone, done (FINDINGS round 15). 3c: deps bundle and vendor layer out, dep optimizer off by default, minimal import map, done (FINDINGS round 16).
4. **Flavors.** 4a: the TS/JS soft reboot, `app.css` as a Vite module and workers, done. 4b: Vue, plugin-vue component HMR checked and an entry boundary, done (FINDINGS round 18). Solid and React: unchanged, findings recorded as notes ("Frameworks" → "Solid", "React"; FINDINGS round 18).
5. **Android.** 5a: optimizeDeps, i.e. the served boot module, Vite's dep optimizer with discovery, no global `require` and pre-bundle edits, done (FINDINGS round 19).

## Open
- **A static side-effect gate:** restart when a re-run module has top-level side effects that nothing disposes. Deferred.
- **Angular participants:** router stack replay, dialogs, NgRx (`provideNgrxHmr`).
- **Workers:**
  - whether iOS keeps the query on the worker entry URL;
  - a worker entry that uses `import.meta.hot` imports `/@vite/client` (and core) before `/@vite/env`;
  - nested workers have no `httpOrigin`.
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
- **Deep imports of an included package** (`pkg/lib/x.js`) next to its pre-bundle may load the file twice, inlined and served raw. No fixture has one; unmeasured.
- **Served packages the entries miss:** a subpath import of a linked or platform-main package that its entry doesn't reach, and an undeclared (transitive) platform-main package served raw because a pre-resolver resolves it. Their third-party imports stay unscanned.
- **A scanned file with an unresolvable bare import** turns pre-bundling off for the session. Scanning every linked or platform-main package in `dependencies`, imported or not, widens that exposure.
- **Solid and React are uncrawled** with the dep optimizer (no fixtures; 4b left both flavors unchanged).
- **An Android custom `Application` that imports core** is expected to bundle its own core into its on-disk chunk (a second instance, evaluated before `bundle.mjs`), unverified.
- **Installed core edits.** Vite's watcher ignores `node_modules`, so an edit to an installed core goes unnoticed unless the app's watch config un-ignores it; then `nsPreBundleWatchPlugin` re-optimizes (core is pre-bundled). Linked core works.
- **A pre-bundle edit burst on Vite 8.0.2** can restart the app twice: the last write's event can arrive after the loop has requested the app restart, which runs a third server restart and a second app restart (the content served is right).
- **Angular pre-bundles are linked in JIT mode** (Analog's `linkerJitMode: true`). Unverified on a device.
- **Strict `require` is off by default** (see "Require"). It could default on for iOS after a device run with the flag.
- **Core's `System.import` shim** still calls `global.require(path)`. It could use `import(path)` or go away; that is a core change.
- **Vue import-map keys.** The strategy's `importMapSpecifiers()` adds `nativescript-vue` (already a key through the app's `dependencies`) and `vue`. As map entries, only a runtime `import(expr)` evaluating to one of them would use them, and none exists; they also put `vue` in `include`. Kept for now.
- **Vue component state across a soft reboot** is not kept: the app is recreated. Only plugin-vue's template `rerender` keeps state.
