[![NativeScript](./tools/graphics/cover.png)](https://nativescript.org)

<p>

  [![Automated Android Tests Passing](https://github.com/NativeScript/NativeScript/actions/workflows/apps_automated_android.yml/badge.svg)](https://github.com/NativeScript/NativeScript/actions/workflows/apps_automated_android.yml)
  [![Automated iOS Tests Passing](https://github.com/NativeScript/NativeScript/actions/workflows/apps_automated_ios.yml/badge.svg)](https://github.com/NativeScript/NativeScript/actions/workflows/apps_automated_ios.yml)
  [![License](https://img.shields.io/badge/License-MIT-blue.svg)](https://github.com/NativeScript/NativeScript/blob/main/LICENSE)
  [![NPM Version](https://badge.fury.io/js/%40nativescript%2Fcore.svg)](https://www.npmjs.com/@nativescript/core)
  [![Discord](https://badgen.net/badge/icon/discord?icon=discord&label)](https://nativescript.org/discord)
  [![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2FNativeScript%2FNativeScript.svg?type=shield)](https://app.fossa.com/projects/git%2Bgithub.com%2FNativeScript%2FNativeScript?ref=badge_shield)
  [![website](https://img.shields.io/badge/website-nativescript.org-purple.svg)](https://nativescript.org)
  [![https://good-labs.github.io/greater-good-affirmation/assets/images/badge.svg](https://good-labs.github.io/greater-good-affirmation/assets/images/badge.svg)](https://good-labs.github.io/greater-good-affirmation)
  [![support](https://img.shields.io/badge/sponsor-Open%20Collective-blue.svg)](https://opencollective.com/NativeScript)

</p>

[NativeScript](http://www.nativescript.org) empowers you to access native APIs from JavaScript directly. Currently iOS, Android, and visionOS runtimes are provided for rich mobile development across a variety of diverse use cases.


[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2FNativeScript%2FNativeScript.svg?type=large)](https://app.fossa.com/projects/git%2Bgithub.com%2FNativeScript%2FNativeScript?ref=badge_large)

## Quick Start

To get started with NativeScript, follow these steps:

1.  **Install the NativeScript CLI globally:**
    ```bash
    npm install -g nativescript
    ```

2.  **Create a new project:**
    ```bash
    ns create my-app
    ```

3.  **Navigate into your project directory:**
    ```bash
    cd my-app
    ```

4.  **Run your app on an emulator or device:**
    ```bash
    ns run android
    ```
    or
    ```bash
    ns run ios
    ```

## Contribute
## Troubleshooting Common CLI Issues

If you encounter errors when using the NativeScript CLI, try the following solutions:

- **Environment Setup Issues:**  
  Ensure Node.js (v14.x or later) and the NativeScript CLI are installed properly.  
  Run `ns doctor` to diagnose environment problems.

- **Emulator Connection Errors:**  
  Verify that your Android or iOS emulator is running and accessible.  
  Restart the emulator or device if needed.

- **Plugin Installation Failures:**  
  Check internet connectivity and retry `npm install`.  
  Clear npm cache if problems persist: `npm cache clean --force`.

Feel free to open issues if you need more assistance.


1. [Setup your local development environment](https://docs.nativescript.org/setup/)

2. Clone to contribute:

```bash
$ git clone https://github.com/NativeScript/NativeScript.git
$ cd NativeScript

# setup workspace for development
$ npm run setup

# list all available commands to run
$ npm start
```

We love you and your pull requests 🤗. Please follow our [contributing guide](https://github.com/NativeScript/NativeScript/blob/main/tools/notes/CONTRIBUTING.md) and see [our code of governance](https://github.com/NativeScript/management/blob/master/nativescript-governance.md) to become as involved as you want to be.
NativeScript empowers you to access native APIs from JavaScript directly, enabling rich mobile application development across iOS, Android, and visionOS platforms.

## @nativescript/*

- [@nativescript/core](https://github.com/NativeScript/NativeScript/tree/main/packages/core)
  Singular primitives offering an easy-to-use API surface for diverse iOS/visionOS/Android APIs implemented with NativeScript.
- [@nativescript/types](https://github.com/NativeScript/NativeScript/tree/main/packages/types)
  Types for both iOS/Android below wrapped up as a convenience. *Most commonly used.*
- [@nativescript/types-ios](https://github.com/NativeScript/NativeScript/tree/main/packages/types-ios)
  Types for iOS.
- [@nativescript/types-android](https://github.com/NativeScript/NativeScript/tree/main/packages/types-android)
  Types for Android.
- [@nativescript/types-minimal](https://github.com/NativeScript/NativeScript/tree/main/packages/types-minimal)
  A very minimal set of types for only the latest Android and iOS sdks. Most commonly used to optimize Web-based IDE's which auto load all type declarations from node_modules.
- [@nativescript/ui-mobile-base](https://github.com/NativeScript/NativeScript/tree/main/packages/ui-mobile-base)
  UI mobile base native classes used by core.
- [@nativescript/webpack](https://github.com/NativeScript/NativeScript/tree/main/packages/webpack5)
  Webpack build utilities and configs used by NativeScript apps.

## Quick Links

- [NativeScript Home](https://nativescript.org)
- [NativeScript Tutorials](https://docs.nativescript.org/tutorials/)
- [NativeScript documentation](https://docs.nativescript.org/)
- JavaScript starter: https://nativescript.new/javascript
- TypeScript starter: https://nativescript.new/typescript
- Angular starter: https://nativescript.new/angular
- React starter: https://nativescript.new/react
- Solid starter: https://nativescript.new/solid
- Svelte starter: https://nativescript.new/svelte
- Vue starter: https://nativescript.new/vue
- Vue 3 starter: https://nativescript.new/vue3
- [NativeScript on Twitter](http://twitter.com/NativeScript)
- [NativeScript on Discord](https://nativescript.org/discord)
- [NativeScript on Stack Overflow](http://stackoverflow.com/questions/tagged/nativescript)

## Other source repos

Outside the source centralized in this repo, NativeScript consists of a few other source repos. Here are the major ones:

- [iOS and visionOS Runtime](https://github.com/NativeScript/ios)
	Empowers JavaScript code to be executed on iOS and visionOS devices written in a mix of C++, Objective-C, and Swift.
- [Android Runtime](https://github.com/NativeScript/android)
	Empowers JavaScript code to be executed on Android devices written in a mix of C++, Java and Kotlin.
- [CLI](https://github.com/NativeScript/nativescript-cli)
	Command-line interface empowering you to create, build, and run apps using NativeScript.
- [Docs](https://github.com/NativeScript/docs)
	Documentation available at <http://docs.nativescript.org/> written in Markdown.
- [Plugins](https://github.com/NativeScript/plugins)
  Various TSC managed plugins. Also a good reference is the [plugin marketplace](https://market.nativescript.org/) with several additional plugins.
- [Firebase](https://github.com/NativeScript/firebase)
  Modular Firebase 🔥 implementation for supported platforms.
- [ML Kit](https://github.com/NativeScript/mlkit)
  Google's [ML Kit SDKs for supported platforms](https://developers.google.com/ml-kit).
- [Payments](https://github.com/NativeScript/payments)
  In-App Purchase, Subscriptions, Google Pay and Apple Pay.
- [Artwork](https://github.com/NativeScript/artwork)
  Want to use our logo or colors? Feel free to use any of our ready-to-use media material.




The NativeScript project consists of multiple repositories focused on different platforms and functionalities:

    iOS and visionOS Runtime: JavaScript execution on iOS and visionOS devices (C++, Objective-C, Swift)

    Android Runtime: JavaScript execution on Android devices (C++, Java, Kotlin)

    CLI: Command-line interface to create, build, and run NativeScript apps

    Docs: Documentation in Markdown

    Plugins: Official plugins and plugin marketplace

    Firebase: Modular Firebase implementation

    ML Kit: Google’s ML Kit SDKs support

    Payments: In-app purchase and payment integration

    Artwork: Media assets like logos and branding material
## Copyright notice

Copyright [OpenJS Foundation](https://openjsf.org) and `NativeScript` contributors. All rights reserved. The [OpenJS Foundation](https://openjsf.org) has registered trademarks and uses trad>

[The OpenJS Foundation](https://openjsf.org/) | [Terms of Use](https://terms-of-use.openjsf.org/) | [Privacy Policy](https://privacy-policy.openjsf.org/) | [OpenJS Foundation Bylaws](https:>

<p align="center" style="color:#e25555; font-weight:bold;">
  Made with ❤️ by NativeScript Contributors
<p>
