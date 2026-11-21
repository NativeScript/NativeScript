---
title: Framework flavors — shipping HMR for your own framework
description: How a JS framework ships NativeScript Vite support as its own package with registerFrameworkFlavor, baseConfig and the framework's own Vite plugin.
---

# Framework flavors

`@nativescript/vite` has built-in flavors for Angular, Vue, React, Solid, TypeScript and JavaScript. Any other framework can register a flavor from its own package, under its own npm scope, with no change to `@nativescript/vite`. This page is how. The worked example is [`@nativescript-community/vite-octane`](https://github.com/nativescript-community/octane/tree/main/packages/vite-octane), the Octane flavor.

[[toc]]

## How HMR works

Dev mode speaks Vite's own HMR protocol. The device joins Vite's HMR WebSocket and runs a port of Vite's browser client. Every app module gets the standard `import.meta.hot` from `/@vite/client`. Updates are stock Vite payloads (`update` with `js-update`/`css-update`, `full-reload`, `prune`, custom events), produced by the framework's own Vite plugin.

A full reload re-evaluates every app-owned module in place (never `@nativescript/core` or other `node_modules` packages) and re-imports the entry. `hot.data` survives it.

So a flavor brings no HMR code of its own. Its framework's Vite plugin must emit stock Vite HMR payloads and use `import.meta.hot` in the code it generates, the same as it does for the web.

## What a flavor provides

| Part | Responsibility |
| --- | --- |
| **Config helper** | Calls `registerFrameworkFlavor`, wraps `baseConfig({ mode, flavor })`, adds the framework's Vite plugin. |
| **`server`** (optional) | Device loader configuration: import-map specifiers, volatile URL patterns, query-identity paths. |

## Package layout

```
@my-framework/nativescript-vite/
├─ package.json        declares nativescript.vite
└─ src/index.ts        config helper + registerFrameworkFlavor
```

Declare the flavor in `package.json` so `nativescript-vite init` and flavor detection recognise the package:

```json
{
  "name": "@nativescript-community/vite-octane",
  "exports": {
    ".": { "import": "./dist/index.js", "types": "./dist/index.d.ts" }
  },
  "nativescript": {
    "vite": {
      "flavor": "octane",
      "config": { "import": "octaneConfig", "from": "@nativescript-community/vite-octane" }
    }
  }
}
```

Detection reads `nativescript.vite` from each of the app's dependencies, in the app's `node_modules` (or the monorepo root's), and the first one that declares a flavor wins. It is consulted after the built-in framework dependencies (`@nativescript/angular`, `nativescript-vue`, …) and before the TypeScript/JavaScript fallback. `config` is optional; with it, `npx nativescript-vite init` generates a `vite.config.mts` that calls the helper:

```ts
import { defineConfig } from 'vite';
import { octaneConfig } from '@nativescript-community/vite-octane';

export default defineConfig(({ mode }) => octaneConfig({ mode }));
```

## The config helper

```ts
// src/index.ts
import { mergeConfig, type UserConfig } from 'vite';
import { baseConfig, getTypeCheckPlugins, registerFrameworkFlavor, type TypeCheckControlOptions } from '@nativescript/vite/framework';
import { frameworkVitePlugin } from 'my-framework/vite-plugin'; // the framework's own Vite plugin

registerFrameworkFlavor({ flavor: 'octane' });

export interface OctaneConfigOptions extends TypeCheckControlOptions {}

export const octaneConfig = ({ mode }: { mode: string }, options: OctaneConfigOptions = {}): UserConfig =>
  mergeConfig(baseConfig({ mode, flavor: 'octane' }), {
    plugins: [...getTypeCheckPlugins('typescript', options.typeCheck), frameworkVitePlugin()],
  });
```

Register at module scope, before `baseConfig` runs. The flavor name must not be a built-in one. Registering the same name again replaces the definition.

`getTypeCheckPlugins` takes the *kind* of type-check, not the flavor name: `'typescript'` for a `.ts`/`.tsx` project, `'vue'` for `vue-tsc`.

When a TypeScript project imports `.tsrx` files and has `@tsrx/typescript-plugin` installed, the build-time checker delegates to `tsrx-tsc` so TSRX files are transformed for type checking. It runs `tsrx-tsc` against a generated tsconfig under `node_modules/.ns-vite/` that extends the project's tsconfig, lists only the files selected for the current NativeScript platform, and declares `tsrx.platform` for that platform (`ios` for visionOS) so platform guards compile the way the build does. Without the plugin installed, `.tsrx` imports surface as unresolved modules in the regular check, with a hint to install it.

## Device loader configuration (`server`)

Most flavors need none. Vite rewrites every bare import in the code it serves, so the device import map only matters for bare specifiers the device resolves itself at runtime, such as `import(name)` with a computed package name. It holds `@nativescript/core`, the package name of each of the app's `dependencies`, and `node:` builtins. When the framework needs more, pass a `FrameworkServerStrategy` whose `flavor` matches:

```ts
registerFrameworkFlavor({
  flavor: 'octane',
  server: {
    flavor: 'octane',
    importMapSpecifiers: () => ['my-framework'],
  },
});
```

| Member | Purpose | Built-in example |
| --- | --- | --- |
| `importMapSpecifiers()` | Bare specifiers the device import map must carry beyond the app's `dependencies`. | Vue: `['nativescript-vue', 'vue']`; Solid: `['solid-js']` |
| `volatilePatterns()` | URL substrings the runtime drops from its registry before every dynamic import of a matching URL, so each import re-fetches. | Angular: `['/@ng/component']` |
| `preserveQueryPaths()` | Path substrings whose query string is the module identity, so it is never collapsed. | Angular: `['/@ng/component']` |

## Checklist

- [ ] `registerFrameworkFlavor` runs at module scope, before `baseConfig({ flavor })`.
- [ ] The config helper adds the framework's own Vite plugin, and that plugin emits stock Vite HMR payloads and uses `import.meta.hot`.
- [ ] `package.json` declares `nativescript.vite.flavor` (+ `config` for `init`).
- [ ] `server`, if set, has the same `flavor` and only the members the framework needs.
- [ ] On a device: a component edit applies in place, and an edit nothing accepts triggers a full reload.

## Reference

- `@nativescript/vite/framework` — `registerFrameworkFlavor`, `getFrameworkFlavor`, `isBuiltInFlavor`, `baseConfig`, `getTypeCheckPlugins`; types `FrameworkFlavorDefinition`, `FrameworkServerStrategy`, `TypeCheckControlOptions`, `TypeCheckSetting`, `TypeCheckFlavor`.
- `FrameworkFlavorDefinition` = `{ flavor; server?: FrameworkServerStrategy }`, documented in `hmr/framework-flavors.ts`.
- `FrameworkServerStrategy` = `{ flavor; importMapSpecifiers?(); volatilePatterns?(); preserveQueryPaths?() }`, documented in `hmr/server/framework-strategy.ts`.
- Worked example: [`@nativescript-community/vite-octane`](https://github.com/nativescript-community/octane/tree/main/packages/vite-octane).
