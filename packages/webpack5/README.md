<p align="center">
  <a href="https://nativescript.org">
    <img alt="NativeScript" src="https://raw.githubusercontent.com/NativeScript/artwork/main/logo/export/NativeScript_Logo_Dark_Transparent.png" width="100"/>
  </a>
</p>

<h1 align="center">@nativescript/webpack</h1>

<p align="center">
  <b>Webpack configuration for NativeScript apps.</b>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@nativescript/webpack"><img src="https://img.shields.io/npm/v/@nativescript/webpack.svg" alt="npm version"></a>
  <a href="https://github.com/NativeScript/NativeScript/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="license"></a>
  <a href="https://www.npmjs.com/package/@nativescript/webpack"><img src="https://img.shields.io/npm/dm/@nativescript/webpack.svg" alt="downloads"></a>
</p>

<p align="center">
  <a href="https://docs.nativescript.org/configuration/webpack">Documentation</a> · 
  <a href="https://docs.nativescript.org/setup/">Environment Setup</a> · 
  <a href="https://github.com/NativeScript/NativeScript/blob/main/tools/notes/CONTRIBUTING.md">Contribute</a> · 
  <a href="https://nativescript.org/discord">Community</a>
</p>

---

All NativeScript applications are bundled using webpack. This package provides the required configuration to build NativeScript apps with flexibility to customize as needed.

## 📦 Installation

```bash
npm install @nativescript/webpack --save-dev
```

## 🚀 Quick Start

All new projects come with a base `webpack.config.js` that's pre-configured:

```js
const webpack = require('@nativescript/webpack')

module.exports = (env) => {
  webpack.init(env)

  // Learn how to customize:
  // https://docs.nativescript.org/webpack

  return webpack.resolveConfig()
}
```

## ✨ Features

- **Auto-discovery**: Automatically detects your project type (TypeScript, Angular, Vue, React, Svelte)
- **Hot Module Replacement**: HMR enabled by default for faster development
- **DotEnv Support**: Built-in support for `.env` files to manage environment variables
- **Bundle Analysis**: Generate bundle reports with `--env.report`
- **Production Optimization**: Minification with Terser in production mode

## 🔧 Global Variables

Useful globally available variables in your app:

| Variable | Description |
|----------|-------------|
| `__DEV__` | `true` when building in development mode |
| `global.isAndroid` / `__ANDROID__` | `true` when platform is Android |
| `global.isIOS` / `__IOS__` | `true` when platform is iOS |
| `global.isVisionOS` / `__VISIONOS__` | `true` when platform is visionOS |
| `global.__APPLE__` | `true` when platform is iOS or visionOS |

## 📚 API

### Core Methods

| Method | Description |
|--------|-------------|
| `webpack.init(env)` | Initialize the internal env object (required) |
| `webpack.chainWebpack(chainFn)` | Add chain functions to modify config |
| `webpack.mergeWebpack(obj)` | Merge objects into the final config |
| `webpack.resolveConfig()` | Resolve the final webpack configuration |

### Runtime builtin modules (`ns:` / `node:`)

The NativeScript runtimes provide builtin modules under the `ns:` scheme (`ns:util`, `ns:module`, `ns:worker_threads`, …) and resolve them themselves. `NativeScriptBuiltinModulesPlugin` leaves every `ns:` import as-is in the bundle, including modules added in future runtime versions.

Customize it with webpack-chain. For example, to also use the runtime's `node:` shims (only list the ones your runtime version ships; other `node:` imports fail the build):

```js
const { NormalModuleReplacementPlugin } = require('webpack');

webpack.chainWebpack((config) => {
	config.plugin('NativeScriptBuiltinModulesPlugin').tap(() => [
		{ include: [/^ns:/, 'node:worker_threads'] },
	]);

	// libraries often import the bare name
	config
		.plugin('ForwardWorkerThreads')
		.use(NormalModuleReplacementPlugin, [/^worker_threads$/, 'node:worker_threads']);
});
```

To polyfill a builtin instead (e.g. for a runtime that doesn't ship it), redirect it with a replacement plugin. The builtin check runs after replacement plugins, so the polyfill gets bundled:

```js
webpack.chainWebpack((config) => {
	config
		.plugin('PolyfillNsUrl')
		.use(NormalModuleReplacementPlugin, [/^ns:url$/, require.resolve('./polyfills/ns-url.js')]);
});
```

`resolve.alias` doesn't apply here: webpack treats `ns:util` as a URL scheme and skips resolution.

## 🎛️ CLI Flags

| Flag | Description |
|------|-------------|
| `--no-hmr` | Disable Hot Module Replacement |
| `--env.production` | Enable production mode with minification |
| `--env.report` | Generate bundle analysis report |
| `--env.verbose` | Print verbose logs and internal config |
| `--env.e2e` | Enable E2E mode (enables `testID` property) |

## 📖 Documentation

For complete documentation including configuration examples, visit the [webpack configuration guide](https://docs.nativescript.org/configuration/webpack).

## 📄 License

[MIT licensed](https://github.com/NativeScript/NativeScript/blob/main/LICENSE).
