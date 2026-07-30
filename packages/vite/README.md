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

- Generate a `vite.config.ts` using the detected project flavor (Angular, Vue, React, Solid, TypeScript, or JavaScript) and the corresponding helper from `@nativescript/vite`.
- Add (or update) the following npm scripts in your app `package.json`:
	- `dev:ios`
	- `dev:android`
	- `dev:server:ios`
	- `dev:server:android`
	- `ios`
	- `android`
- Add the devDependencies `concurrently` and `wait-on`.
- Add the dependency `@valor/nativescript-websockets`.
- Append `.ns-vite-build` to `.gitignore` if it is not already present.

After running `init`, you now have two ways to work with Vite:

1. HMR workflow

```bash
npm run dev:ios
```

2. Standard dev workflow (non-HMR)

```bash
ns debug ios --no-hmr
ns debug android --no-hmr
```

## Usage

1) Create `vite.config.ts`:

```ts
import { defineConfig, mergeConfig, UserConfig } from 'vite';
import { typescriptConfig } from '@nativescript/vite';

export default defineConfig(({ mode }): UserConfig => {
	return mergeConfig(typescriptConfig({ mode }), {});
});
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
