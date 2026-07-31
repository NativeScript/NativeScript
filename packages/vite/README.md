<p align="center">
  <a href="https://nativescript.org">
    <img alt="NativeScript" src="https://raw.githubusercontent.com/NativeScript/artwork/main/logo/export/NativeScript_Logo_Dark_Transparent.png" width="100"/>
  </a>
</p>

<h1 align="center">@nativescript/vite</h1>

<p align="center">
  <b>Vite integration for NativeScript apps.</b>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@nativescript/vite"><img src="https://img.shields.io/npm/v/@nativescript/vite.svg" alt="npm version"></a>
  <a href="https://github.com/NativeScript/NativeScript/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="license"></a>
</p>

<p align="center">
  <a href="https://docs.nativescript.org/configuration/vite">Documentation</a> · 
  <a href="https://docs.nativescript.org/setup/">Environment Setup</a> · 
  <a href="https://github.com/NativeScript/NativeScript/blob/main/tools/notes/CONTRIBUTING.md">Contribute</a> · 
  <a href="https://nativescript.org/discord">Community</a>
</p>

---

## Prerequisites

- NativeScript 9 or higher

## Install

```sh
npm i @nativescript/vite -D
```

## Quick start (`init`)

To bootstrap an existing NativeScript app for Vite, run from your app root:

```bash
npx nativescript-vite init
```

This will:

- Generate a `vite.config.ts` using the detected project flavor (Angular, Vue, React, Solid, TypeScript, or JavaScript) and the corresponding helper subpath from `@nativescript/vite`.
- Add the dependency `@valor/nativescript-websockets`.
- Append `.ns-vite-build` to `.gitignore` if it is not already present.

After running `init`, you have two ways to work with Vite:

1. HMR workflow (default — the CLI starts the dev server for you)

```bash
ns debug ios
ns debug android
```

2. Standard dev workflow (non-HMR)

```bash
ns debug ios --no-hmr
ns debug android --no-hmr
```

### Android: automatic `adb reverse`

For Android HMR the CLI automatically runs `adb reverse tcp:5173 tcp:5173`
(using the SDK-resolved adb, scoped to the deploy target, after the device is
ready) so the device reaches the dev server through the ADB tunnel at
`127.0.0.1:5173`. Relevant opt-outs:

- `NS_HMR_NO_ADB_REVERSE=1` — skip the tunnel and use `10.0.2.2`.
- `NS_HMR_PREFER_LAN_HOST=1` — physical device over Wi-Fi; emit the host's LAN IP.
- `NS_HMR_HOST=<host[:port]>` — point the device at an explicit origin (CI / tunnels).

## Custom HMR sessions

A NativeScript Vite HMR session may use custom server and staging settings:

| Environment variable | Purpose | Default |
| --- | --- | --- |
| `NS_HMR_PORT` | Vite server port used by the generated device HTTP and websocket URLs (the CLI reverses and probes this port) | `5173` |
| `NS_VITE_DIST_DIR` | Project-relative staging directory used for Vite output before the NativeScript CLI copies it into the platform app | `.ns-vite-build` |

Leave both unset for the standard single-session workflow.

### Running two platforms at once

The CLI runs **one dev server per port**. To run iOS and Android HMR
simultaneously for the same app, give each its own port and staging dir so the
servers and their platform-specific bundles don't collide:

```bash
# Terminal 1: iOS
NS_HMR_PORT=5173 NS_VITE_DIST_DIR=.ns-vite-build/ios ns debug ios

# Terminal 2: Android
NS_HMR_PORT=5174 NS_VITE_DIST_DIR=.ns-vite-build/android ns debug android
```

The environment settings only need to be visible to the `ns` process — the CLI
propagates them to the dev server it spawns. The inline environment syntax
above is for POSIX shells; use the equivalent assignment on Windows.

### Advanced: running `vite serve` yourself

The dev server is just `vite serve -- --env.<platform> --env.hmr`. You can run
it standalone for diagnostics, but do **not** run it alongside `ns run`/`ns debug`
for the same platform — both would try to bind the same port. CLI-managed is the
supported default.

## Usage

1) Create `vite.config.ts`:

```ts
import { defineConfig, mergeConfig, UserConfig } from 'vite';
import { typescriptConfig } from '@nativescript/vite/typescript';

export default defineConfig(({ mode }): UserConfig => {
	return mergeConfig(typescriptConfig({ mode }), {});
});
```

Framework-specific configs should be imported from their matching subpaths to avoid loading unrelated framework tooling:

```ts
import { angularConfig } from '@nativescript/vite/angular';
import { reactConfig } from '@nativescript/vite/react';
import { solidConfig } from '@nativescript/vite/solid';
import { vueConfig } from '@nativescript/vite/vue';
```

2) Update `nativescript.config.ts`:

```ts
import { NativeScriptConfig } from '@nativescript/core';

export default {
	// add these:
	bundler: 'vite',
	bundlerConfigPath: 'vite.config.ts',
} as NativeScriptConfig;
```

3) Enjoy Vite.

## Explore More

Check out the [NativeScript Vite documentation](https://docs.nativescript.org/configuration/vite) for more configuration options and features.
