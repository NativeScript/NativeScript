# @nativescript/vite

Vite bundler integration for NativeScript apps. Provides a minimal setup for fast dev and build.

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
