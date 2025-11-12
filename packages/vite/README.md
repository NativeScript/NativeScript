# @nativescript/vite

Vite bundler integration for NativeScript apps. Provides a minimal setup for fast dev and build.

## Prerequisites

- NativeScript 9 or higher

## Install

```sh
npm i @nativescript/vite -D
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
