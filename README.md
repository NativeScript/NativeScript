# NativeScript [![Build Status](https://travis-ci.org/NativeScript/NativeScript.svg?branch=master)](https://travis-ci.org/NativeScript/NativeScript)

![NativeScript logo](https://i.imgur.com/YmNIMqS.png)

[NativeScript](http://www.nativescript.org) is a framework for building native iOS and Android apps using JavaScript and CSS. NativeScript renders UIs with the native platform’s rendering engine, no [WebViews](http://developer.telerik.com/featured/what-is-a-webview/), resulting in native-like performance and UX.

NativeScript provides a best-of-both-worlds development experience. Our cross-platform JavaScript modules give you the convenience of writing iOS and Android apps from a single JavaScript codebase, while our runtimes give you the power of accessing native APIs, SDKs, and frameworks when you need all of them without having to open Xcode or Android Studio. NativeScript was created and is supported by [Telerik](http://www.telerik.com/).

Check out the links below to get started:

* [CTO’s guide to NativeScript](#for-ctos)
* [Getting Started and Installation](#getting-started-and-installation)
* [Quick Links](#quick-links)
* [Repositories](#repositories)
* [Contributing](#contributing)
* [Angular](#angular)

> **IMPORTANT**: NativeScript is an inclusive community, and we expect all NativeScript community members, users, and contributors to treat each other respectfully. As such, all users of this repository must adhere to the [NativeScript community code of conduct](https://github.com/NativeScript/codeofconduct).

## For CTOs

Making the right technology choices is the key to success. Our [CTO’s guide to NativeScript](https://www.nativescript.org/ctos-guide) helps you understand why NativeScript is the right choice for your next mobile project.

## Getting Started and Installation

Our Getting Started Guides are hands-on tutorials that walk you through installing NativeScript and building a real iOS and Android application.

* [Get started with JavaScript](http://docs.nativescript.org/tutorial/chapter-0)
* [Get started with TypeScript and Angular](http://docs.nativescript.org/angular/tutorial/ng-chapter-0)

## NativeScript architecture diagram

Below is a common NativeScript architecture diagram. In more detail, read the [How NativeScript Works article](https://docs.nativescript.org/start/how-it-works).

![Architecture diagram](https://raw.githubusercontent.com/NativeScript/docs/master/docs/img/ns-common.png)

## Quick Links

- [NativeScript home page](https://nativescript.org)
- [NativeScript code samples](https://docs.nativescript.org/angular/code-samples/overview)
- [Install NativeScript demo mobile app](https://www.nativescript.org/nativescript-example-application)
- [NativeScript playground](https://play.nativescript.org)
- [NativeScript and Angular](https://docs.nativescript.org/angular/tutorial/ng-chapter-0)
- [@NativeScript on Twitter](http://twitter.com/NativeScript)
- [NativeScript community Slack channel](http://developer.telerik.com/wp-login.php?action=slack-invitation)
- [NativeScript community forum](https://discourse.nativescript.org/)
- [NativeScript on Stack Overflow](http://stackoverflow.com/questions/tagged/nativescript)
- [NativeScript documentation](https://docs.nativescript.org/)
- [NativeScript marketplace](https://market.nativescript.org/)
- [NativeScript roadmap](https://www.nativescript.org/roadmap)

## Repositories

The NativeScript framework consists of a number of components, all of which are open source and on GitHub. Here are the major ones:

- **[Cross-platform modules](//github.com/NativeScript/NativeScript/)**
    [![npm](https://img.shields.io/npm/dm/tns-core-modules.svg)](https://www.npmjs.com/package/tns-core-modules) 
    - This repo contains the [NativeScript cross-platform modules](http://docs.nativescript.org/core-concepts/modules), which abstract iOS and Android APIs into JavaScript APIs—e.g. `camera.takePicture()`. The modules are written in TypeScript.
- **[iOS runtime](//github.com/NativeScript/ios-runtime/)**
    [![npm](https://img.shields.io/npm/dm/tns-ios.svg)](https://www.npmjs.com/package/tns-ios) 
    - This repo contains the NativeScript iOS runtime—the code that hosts NativeScript iOS apps, and allows JavaScript code to be executed on iOS devices. The iOS runtime is written in a fun mix of C++, Objective-C, and more.
- **[Android runtime](//github.com/NativeScript/android-runtime)**
    [![npm](https://img.shields.io/npm/dm/tns-android.svg)](https://www.npmjs.com/package/tns-android) 
    - This repo contains the NativeScript Android—the code that hosts NativeScript Android apps, and allows JavaScript code to be executed on Android devices. The Android runtime is written in a fun mix of C++ and Java.
- **[CLI](//github.com/NativeScript/nativescript-cli)**
    [![npm](https://img.shields.io/npm/dm/nativescript.svg)](https://www.npmjs.com/package/nativescript) 
    - This repo contains the NativeScript command-line interface, which lets you create, build, and run apps using the NativeScript framework. The CLI is written in TypeScript.
- **[Docs](//github.com/NativeScript/docs)**
    - This repo contains the NativeScript framework documentation, which is available at <http://docs.nativescript.org/>. The docs are written in Markdown.

In addition to the code that makes up the NativeScript framework itself, we also provide a number of [open-source sample apps](https://www.nativescript.org/app-samples-with-code) that you can reference while building your NativeScript application.

## Contributing

We love PRs, and accept them for all of our repositories — even docs! Please follow our [contribution guide](https://github.com/NativeScript/NativeScript/blob/master/CONTRIBUTING.md) if you want to become part of the project.

## Angular

We [worked together with the Google Angular team](https://angularjs.blogspot.com/2015/12/building-mobile-apps-with-angular-2-and.html) to make Angular 2+ work on top of NativeScript. To use Angular with NativeScript please follow the [getting started](http://docs.nativescript.org/angular/tutorial/ng-chapter-0) article.

## Get Help

Please, use [github issues](https://github.com/NativeScript/NativeScript/issues) strictly for [reporting a bugs](https://github.com/NativeScript/NativeScript/blob/master/CONTRIBUTING.md#bugs) or [requesting features](https://github.com/NativeScript/NativeScript/blob/master/CONTRIBUTING.md#features). For general NativeScript questions and support, check out [Stack Overflow](https://stackoverflow.com/questions/tagged/nativescript) or ask our experts in [NativeScript community Slack channel](https://www.nativescript.org/slack-invitation-form).

![](https://ga-beacon.appspot.com/UA-111455-24/nativescript/nativescript?pixel) 
