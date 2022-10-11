<p>
  <a href="http://www.nativescript.org">
    <img alt="NativeScript" src="https://raw.githubusercontent.com/NativeScript/artwork/main/logo/export/NativeScript_Logo_Wide_White_Blue_Rounded_Blue.png" height="50"/>
  </a>
</p>

<p>

  [![Automated Tests Passing](https://github.com/NativeScript/NativeScript/actions/workflows/apps_automated.yml/badge.svg)](https://github.com/NativeScript/NativeScript/actions/workflows/apps_automated.yml)
  [![License](https://img.shields.io/badge/License-MIT-blue.svg)](https://github.com/NativeScript/NativeScript/blob/master/LICENSE)
  [![NPM Version](https://badge.fury.io/js/%40nativescript%2Fcore.svg)](https://www.npmjs.com/@nativescript/core)
  [![Discord](https://badgen.net/badge/icon/discord?icon=discord&label)](https://nativescript.org/discord)

</p>

[NativeScript](http://www.nativescript.org) empowers you to access native APIs from JavaScript directly. Currently iOS and Android runtimes are provided for rich mobile development across a variety of diverse use cases. 

## Contribute

1. [Setup your local development environment](https://docs.nativescript.org/environment-setup.html)

2. Clone to contribute:

```bash
$ git clone https://github.com/NativeScript/NativeScript.git
$ cd NativeScript

# setup workspace for development
$ npm run setup

# list all available commands to run
$ npm start
```

We love you and your pull requests 🤗. Please follow our [contributing guide](https://github.com/NativeScript/NativeScript/blob/master/tools/notes/CONTRIBUTING.md) and see [our code of governance](https://github.com/NativeScript/management/blob/master/nativescript-governance.md) to become as involved as you want to be.

## @nativescript/*

* [@nativescript/core](https://github.com/NativeScript/NativeScript/tree/master/packages/core)
  * Core iOS/Android for NativeScript
* [@nativescript/types](https://www.npmjs.com/package/@nativescript/types)
  * Types for both iOS/Android below wrapped up as a convenience. *Most commonly used.*
* [@nativescript/types-ios](https://github.com/NativeScript/NativeScript/tree/master/packages/types-ios)
  * Types for iOS
* [@nativescript/types-android](https://github.com/NativeScript/NativeScript/tree/master/packages/types-android)
  * Types for Android
* [@nativescript/types-minimal](https://github.com/NativeScript/NativeScript/tree/master/packages/types-minimal)
  * A very minimal set of types for only the latest Android and iOS sdks. Most commonly used to optimize Web-based IDE's which auto load all type declarations from node_modules.
* [@nativescript/ui-mobile-base](https://github.com/NativeScript/NativeScript/tree/master/packages/ui-mobile-base)
  * UI mobile base native classes used by core
* [@nativescript/webpack](https://github.com/NativeScript/NativeScript/tree/master/packages/webpack)
  * Webpack build utilities and configs used by NativeScript apps

## Quick Links

- [NativeScript Home](https://nativescript.org)
- [NativeScript Tutorials](https://docs.nativescript.org/tutorial/)
- [NativeScript documentation](https://docs.nativescript.org/)
- JavaScript starter: https://nativescript.new/javascript
- TypeScript starter: https://nativescript.new/typescript
- Angular starter: https://nativescript.new/angular
- Vue starter: https://nativescript.new/vue
- Svelte starter: https://nativescript.new/svelte
- React starter: https://nativescript.new/react
- [NativeScript on Twitter](http://twitter.com/NativeScript)
- [NativeScript on Discord](https://nativescript.org/discord)
- [NativeScript on Stack Overflow](http://stackoverflow.com/questions/tagged/nativescript)

## Other source repos

Outside the source centralized in this repo, NativeScript consists of a few other source repos. Here are the major ones:

- **[iOS Runtime](https://github.com/NativeScript/ns-v8ios-runtime)**
	- This repo contains the NativeScript iOS Runtime — the code that hosts NativeScript iOS apps, and allows JavaScript code to be executed on iOS devices. The iOS runtime is written in a mix of C++, Objective-C, and more.
- **[Android Runtime](https://github.com/NativeScript/android-runtime)**
	- This repo contains the NativeScript Android Runtime — the code that hosts NativeScript Android apps, and allows JavaScript code to be executed on Android devices. The Android runtime is written in a mix of C++ and Java.
- **[CLI](//github.com/NativeScript/nativescript-cli)**
	- This repo contains the NativeScript command-line interface, which lets you create, build, and run apps using NativeScript. The CLI is written in TypeScript.
- **[Docs](//github.com/NativeScript/docs-new)**
	- This repo contains NativeScript documentation, which is available at <http://docs.nativescript.org/>. The docs are written in Markdown.
- **[Official Plugins](https://github.com/NativeScript/plugins)
  - This repo contains a [plugin workspace](https://docs.nativescript.org/plugins/plugin-workspace-guide.html) the TSC (Technical Steering Committee) maintains offering several often useful plugins.

<h3 align="center">Made with ❤️</h3>
