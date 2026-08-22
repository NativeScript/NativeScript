---
title: Framework flavors — shipping HMR for your own framework
description: How a JS framework ships NativeScript Vite HMR support as its own package with registerFrameworkFlavor, a server strategy and a device-side client strategy.
---

# Framework flavors

`@nativescript/vite` has built-in flavors for Angular, Vue, React, Solid, TypeScript and JavaScript. A **flavor** is what turns a saved file into a change on the device: a config helper that declares it, a server strategy that runs in the Vite process, and a client strategy the device evaluates next to the shared HMR client.

Flavors are not limited to the built-ins. A framework — or a renderer, a router, anything that holds live objects between saves — can register a flavor from its own package, under its own npm scope, with no change to `@nativescript/vite`. This page is how. The worked example throughout is [`@nativescript-community/vite-octane`](https://github.com/nativescript-community/octane/tree/main/packages/vite-octane), the Octane flavor: a community package built entirely on this API.

[[toc]]

## What a flavor provides

```ts
import { registerFrameworkFlavor } from '@nativescript/vite/framework';

registerFrameworkFlavor({
  flavor: 'octane',                           // the name, everywhere
  server: octaneServerStrategy,               // runs in the dev server
  client: '@nativescript-community/vite-octane/client', // fetched and evaluated by the device
});
```

| Part | Runs where | Responsibility |
| --- | --- | --- |
| **Config helper** | Vite process | Registers the flavor, wraps `baseConfig({ mode, flavor })`, adds the framework's Vite plugin(s). |
| **Server strategy** | Vite process | Owns `handleHotUpdate` for the flavor's files: update the module graph, purge transform caches, broadcast the delta. |
| **Client strategy** | Device | Decides what a freshly re-imported module *means* for the live app: fire accept callbacks, propagate to importers, reload the graph. |

The shared pieces stay shared. `@nativescript/vite` serves the app over HTTP ESM, speaks the WebSocket protocol, evicts and re-imports modules through `ns:module`, drives the on-device overlay, and tracks workers. A strategy never re-implements those.

## Package layout

```
@my-framework/nativescript-vite/
├─ package.json        exports ".", "./client"; declares nativescript.vite
├─ src/index.ts        config helper + registerFrameworkFlavor   (Node)
├─ src/server/strategy.ts                                         (Node)
└─ src/client/strategy.ts                                         (device)
```

Two rules shape the layout:

- **The server half and the client half are different programs.** The server entry may import anything Node can load. The client entry is served to the device raw, so it must be plain ESM with explicit `.js` extensions on relative imports, and it must reach the shared client only through `@nativescript/vite/hmr/client/framework.js`. Keep the two in separate files; the config entry must not import the client file.
- **Declare the flavor in `package.json`** so `nativescript-vite init` and flavor detection recognise the package:

```json
{
  "name": "@nativescript-community/vite-octane",
  "exports": {
    ".": { "import": "./dist/index.js", "types": "./dist/index.d.ts" },
    "./client": { "import": "./dist/client/strategy.js", "types": "./dist/client/strategy.d.ts" }
  },
  "nativescript": {
    "vite": {
      "flavor": "octane",
      "config": { "import": "octaneConfig", "from": "@nativescript-community/vite-octane" }
    }
  },
  "peerDependencies": { "@nativescript/vite": ">=8.0.0", "vite": "^8.0.0" }
}
```

With that in place, `npx nativescript-vite init` in an app that depends on the package generates:

```ts
import { defineConfig } from 'vite';
import { octaneConfig } from '@nativescript-community/vite-octane';

export default defineConfig(({ mode }) => octaneConfig({ mode }));
```

## 1. The config helper

```ts
// src/index.ts
import { mergeConfig, type UserConfig } from 'vite';
import { baseConfig, getTypeCheckPlugins, registerFrameworkFlavor, type TypeCheckControlOptions } from '@nativescript/vite/framework';
import { octane, type OctanePluginOptions } from '@octanejs/vite-plugin';
import { octaneServerStrategy } from './server/strategy.js';

registerFrameworkFlavor({ flavor: 'octane', server: octaneServerStrategy, client: '@nativescript-community/vite-octane/client' });

export interface OctaneConfigOptions extends TypeCheckControlOptions {
  octane?: OctanePluginOptions;
}

export const octaneConfig = ({ mode }: { mode: string }, options: OctaneConfigOptions = {}): UserConfig =>
  mergeConfig(baseConfig({ mode, flavor: 'octane' }), {
    plugins: [...getTypeCheckPlugins('typescript', options.typeCheck), ...octane(options.octane)],
  });
```

Register at module scope, before `baseConfig` can run. `baseConfig` installs the HMR plugins for the declared flavor and looks the server strategy up by name; it also seeds the device bundle with the client module's path (`__NS_CLIENT_STRATEGY_URL__`) so the on-device loader can fetch it without knowing your package.

`getTypeCheckPlugins` takes the *kind* of type-check, not the flavor name: `'typescript'` for a `.ts`/`.tsx` project, `'vue'` for `vue-tsc`.

## 2. The server strategy

Most frameworks need nothing new on the server. `typescriptServerStrategy` is the generic device-module pipeline — it serves app files over `/ns/m`, primes the module graph, and emits deltas. Spread it, rename the flavor, and write the one thing that differs: the hot-update tail.

```ts
// src/server/strategy.ts
import * as path from 'node:path';
import { purgeTransformCachesForHotUpdate, runHotUpdatePrologue, typescriptServerStrategy, type FrameworkServerStrategy } from '@nativescript/vite/framework';

const SCRIPT_FILE_RE = /\.(?:[mc]?[jt]sx?)$/i;

export const octaneServerStrategy: FrameworkServerStrategy = {
  ...typescriptServerStrategy,
  flavor: 'octane',
  deferDeltaBroadcast: true,
  async handleHotUpdate(ctx, deps) {
    const state = await runHotUpdatePrologue(ctx, deps);
    if (!state) return;
    const { root, metrics, emitSummary } = state;
    const { moduleGraph, verbose, sharedTransformRequest } = deps;
    const { file, server } = ctx;
    if (!SCRIPT_FILE_RE.test(file)) return emitSummary();
    metrics.tAfterFramework = Date.now();

    const rel = '/' + path.posix.normalize(path.relative(root, file)).split(path.sep).join('/');
    const id = moduleGraph.normalizeGraphId(rel);
    if (!moduleGraph.get(id)) moduleGraph.upsert(rel, `/* hmr ${Date.now()} */`, [], { emitDeltaOnInsert: true });

    // The device applies an edit by re-fetching the module. Purge BEFORE the
    // delta goes out, or the re-fetch is served from the previous save.
    purgeTransformCachesForHotUpdate({ file, server, sharedTransformRequest, verbose, label: 'octane' });
    const fresh = await sharedTransformRequest(rel, 30000);
    if (fresh?.code) {
      const mod = server.moduleGraph.getModuleById(file);
      const deps = mod ? Array.from(mod.importedModules).map((m) => (m.id || '').replace(/\?.*$/, '')).filter(Boolean) : moduleGraph.get(id)?.deps ?? [];
      moduleGraph.upsert(id, fresh.code, deps as string[], { broadcastDelta: false });
    }
    const gm = moduleGraph.get(id);
    if (gm) moduleGraph.emitDelta([gm], []);
    emitSummary();
  },
};
```

`deferDeltaBroadcast: true` is the contract that makes the purge-then-broadcast order hold: the shared prologue records the change but leaves the broadcast to you. Read the module's dependency edges *after* the re-transform — import analysis runs inside it — so a newly added import reaches the client graph on the save that introduced it.

Other optional members of `FrameworkServerStrategy` cover the less common needs: `transformNodeModule` (patch a vendor module before it is served), `rewriteServedModule`, `registerRoutes` (framework-owned dev endpoints), `importMapEntries`, `volatilePatterns`, `handleClientCustomEvent` (a `hot.send` from the device). The interface is documented inline in `hmr/server/framework-strategy.ts`.

## 3. The client strategy

This is where a framework's HMR semantics live. The shared queue does, for every delta: evict the changed modules from the runtime registry → re-import each one → call the strategy. Your strategy answers: what now?

```ts
// src/client/strategy.ts — served to the device as-is
import type { FrameworkClientStrategy } from '@nativescript/vite/hmr/client/framework.js';
import { getNsHotRegistry, graph, setUpdateStage } from '@nativescript/vite/hmr/client/framework.js';

export const octaneClientStrategy: FrameworkClientStrategy = {
  flavor: 'octane',
  drivesQueueOverlayStages: true,
  install() {},
  beforeBatchEvict(drained) { /* snapshot accept callbacks, run dispose */ },
  afterModuleReimport(id, namespace) { /* fire accept with the fresh namespace */ },
  async refreshAfterBatch(drained, ctx) { /* propagate what nothing accepted; finish the overlay */ },
};
export default octaneClientStrategy;
```

Export it as `default`, `clientStrategy`, or `<flavor>ClientStrategy`.

### Hooks, in the order they run

| Hook | When | Typical use |
| --- | --- | --- |
| `install()` | once, when the client resolves the strategy | dev shims, event listeners |
| `shouldQueueReimport(id)` | per changed id, before anything is fetched | return `false` for a module that must not evaluate in this realm (a worker script, a type-only module) or that nothing can accept |
| `applyUnqueuedChanges(ids)` | once, for the ids declined above | fire dependency acceptors; request a graph reload |
| `beforeBatchEvict(drained)` | once, before eviction | the last moment the outgoing module instances are reachable: read their `hot.accept` callbacks, drain `hot.dispose` |
| `afterModuleReimport(id, namespace)` | per re-imported module | invoke the captured accept callbacks with the fresh namespace |
| `refreshAfterBatch(drained, ctx)` | once, after the drain | walk the reverse graph for modules nothing accepted; `ctx.setUpdateOverlayStage('complete', …)` |
| `handleGraphResync(changedIds)` | a full graph with drifted hashes (dev-server restart) | return `true` after requesting one ordered reload instead of the piecemeal default |
| `handleHotUpdateMessage(msg, ctx)` | any protocol message the shared dispatcher did not consume | framework-specific messages a server strategy broadcasts |

`ctx.graph` (and the `graph` export) is the live mirror of the server's module graph: `Map<id, { deps, hash }>`. It is what makes "who imports the changed module" answerable on the device.

### The hot registry

`getNsHotRegistry()` is the process-wide `import.meta.hot` implementation — every served app module gets a context from it, keyed by canonical id (`/src/app`, extensionless). The members a strategy uses:

| Member | Purpose |
| --- | --- |
| `getAcceptCallbacks(key)` | the self-accept callbacks registered by the key's **current** evaluation (a copy); non-empty = self-accepting boundary |
| `getDepAcceptors(depKey)` / `acceptsDep(owner, dep)` | the dependency form — `hot.accept('./worker', cb)` — resolved relative to the owner; lets an update reach a module that never imported the changed file |
| `runDispose(keys)` / `runPrune(keys)` | drain `hot.dispose` / `hot.prune` |
| `hasDeclined(keys)` | any `hot.decline()` |
| `createHotContext(id).data` | persists across re-evaluations of the same key |
| `dispatchHotEvent(event, payload)` / `createHotContext(id).on(event, cb)` | custom events; the shared client emits `vite:beforeFullReload`, `ns:full-reload-complete`, `ns:full-reload-failed` |
| `requestFullReload(reason)` | the in-process graph reload: drains dispose, evicts every app-owned module (never `@nativescript/core` or vendor), re-imports the entry |

One subtlety worth knowing before you write `afterModuleReimport`: the registry holds the callbacks of the **latest** evaluation (Vite's semantics). If your framework's accept callback closes over a module-local binding — as Octane's does — the callback that can reach the live instances is the **first** evaluation's, and you must keep firing that one. If it consults a global registry keyed by component id (Vue, React Refresh, solid-refresh), the latest is equivalent. The Octane strategy's `anchors` map is the reference for the former.

### The runtime

`readNsRuntimeDevHostApi()` returns the `ns:module` builtin: `getLoadedModuleUrls()` is the authoritative answer to "has this realm evaluated that module" (worker scripts and type-only files have not), and `invalidateModules(urls)` is the eviction primitive the shared `invalidateModulesByUrls` wraps. Both are `{}`-safe off-device, so strategies unit-test under Node.

### What the device must be able to load

The client module is served at `/ns/m/node_modules/<package>/<file>` — the registry resolves your `client` specifier from the app root and expresses it relative to the package, so a linked workspace package works the same as an installed one. The package is classified as dev tooling, like `@nativescript/vite`: served per-module, never vendor-bundled, never wrapped as a plugin. That is why relative imports inside it (`./boundary-propagation.js`) and its imports of the shared surface resolve to the same canonical URLs the running client uses — and why importing any other client-internal path is unsupported.

## 4. Testing a strategy without a device

Keep the decision logic pure. Octane's reverse-graph walk is a function `(changedIds, graph, { acceptsSelf, acceptsDep }) → { boundaries, evict, dead }` with a dozen cases that run in milliseconds. The strategy itself is testable against the real hot registry:

```ts
import { getNsHotRegistry } from '@nativescript/vite/hmr/client/framework.js';
import { octaneClientStrategy } from './strategy.js';

const hot = getNsHotRegistry().createHotContext('/src/app.tsx');
hot.accept(gen1);
octaneClientStrategy.beforeBatchEvict!(['/src/app.tsx']);
getNsHotRegistry().createHotContext('/src/app.tsx').accept(gen2);   // the fresh evaluation
octaneClientStrategy.afterModuleReimport!('/src/app.tsx', { App: 'v2' });
expect(gen1).toHaveBeenCalledWith({ App: 'v2' });
```

On a device, five saves cover the matrix: a component, a plain dependency, a worker script, a registry-style module that accepts itself, and the entry.

## Checklist

- [ ] `registerFrameworkFlavor` runs before `baseConfig({ flavor })`.
- [ ] Server strategy spreads `typescriptServerStrategy`, sets `flavor` and `deferDeltaBroadcast: true`, purges before it broadcasts.
- [ ] Client module: plain ESM, `.js` extensions, imports only from `@nativescript/vite/hmr/client/framework.js`, exports `default`.
- [ ] `package.json` exports `./client` and declares `nativescript.vite.flavor` (+ `config` for `init`).
- [ ] `shouldQueueReimport` declines modules the main realm never loaded.
- [ ] Every path ends the overlay: `setUpdateStage('complete', …)`.
- [ ] A failed re-import leaves the app on the previous revision and the next good save applies in place.

## Reference

- `@nativescript/vite/framework` — `registerFrameworkFlavor`, `getFrameworkFlavor`, `baseConfig`, `getTypeCheckPlugins`, `typescriptServerStrategy`, `runHotUpdatePrologue`, `purgeTransformCachesForHotUpdate`, and the strategy types.
- `@nativescript/vite/hmr/client/framework.js` — `getNsHotRegistry`, `graph`, `getGraphVersion`, `normalizeSpec`, `requestModuleFromServer`, `invalidateModulesByUrls`, `buildEvictionUrls`, `resolveHmrHttpOrigin`, `safeDynImport`, `getCore`, `ENV_VERBOSE`, `setUpdateStage`, `getOverlayApi`, `performResetRoot`, `getGlobalScope`, `readNsRuntimeDevHostApi`.
- Worked example: [`@nativescript-community/vite-octane`](https://github.com/nativescript-community/octane/tree/main/packages/vite-octane).
