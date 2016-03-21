# NativeScript [![Build Status](https://travis-ci.org/NativeScript/NativeScript.svg)](https://travis-ci.org/NativeScript/NativeScript)

![NativeScript logo](http://i.imgur.com/YmNIMqS.png)

[NativeScript](http://www.nativescript.org) is a framework for building native iOS and Android apps using JavaScript and CSS. NativeScript renders UIs with the native platform’s rendering engine, no [WebViews](http://developer.telerik.com/featured/what-is-a-webview/), resulting in native-like performance and UX.

NativeScript provides a best-of-both-worlds development experience. Our cross-platform JavaScript modules give you the convenience of writing iOS and Android apps from a single JavaScript codebase, while our runtimes give you the power of accessing native APIs, SDKs, and frameworks when you need them—all without needing to open Xcode or Android Studio. NativeScript was created and is supported by [Telerik](http://www.telerik.com/).

You can read more about [why NativeScript may be a good fit for your next project](https://github.com/NativeScript/NativeScript/wiki/Why-NativeScript%3F), or check out the links below to get started.

* [Getting Started and Installation](#getting-started-and-installation)
* [Quick Links](#quick-links)
* [Repositories](#repositories)
* [Contributing](#contributing)
* [Angular 2](#angular-2)

## Getting Started and Installation

Our [Getting Started Guide](http://docs.nativescript.org/start/getting-started) is a hands-on tutorial that walks you through installing NativeScript and building a real iOS and Android application.

## Quick Links

- [NativeScript home page](http://nativescript.org)
- [@NativeScript on Twitter](http://twitter.com/NativeScript)
- [NativeScript community Slack channel](http://developer.telerik.com/wp-login.php?action=slack-invitation)
- [NativeScript on Stack Overflow](http://stackoverflow.com/questions/tagged/nativescript)
- [NativeScript documentation](http://docs.nativescript.org/)
- [NativeScript blog](http://www.nativescript.org/blog)

## Repositories

The NativeScript framework consists of a number of components, all of which are open source and on GitHub. Here are the major ones:

- **[Cross-platform modules](//github.com/NativeScript/NativeScript/)**
    - This repo contains the [NativeScript cross-platform modules](http://docs.nativescript.org/core-concepts/modules), which abstract iOS and Android APIs into JavaScript APIs—e.g. `camera.takePicture()`. The modules are written in TypeScript.
- **[iOS runtime](//github.com/NativeScript/ios-runtime/)**
    - This repo contains the NativeScript iOS runtime—the code that hosts NativeScript iOS apps, and allows JavaScript code to be executed on iOS devices. The iOS runtime is written in a fun mix of C++, Objective-C, and more.
- **[Android runtime](//github.com/NativeScript/android-runtime)**
    - This repo contains the NativeScript Android—the code that hosts NativeScript Android apps, and allows JavaScript code to be executed on Android devices. The Android runtime is written in a fun mix of C++ and Java.
- **[CLI](//github.com/NativeScript/nativescript-cli)**
    - This repo contains the NativeScript command-line interface, which lets you create, build, and run apps using the NativeScript framework. The CLI is written in TypeScript.
- **[Docs](//github.com/NativeScript/docs)**
    - This repo contains the NativeScript framework documentation, which is available at <http://docs.nativescript.org/>. The docs are written in Markdown.

In addition to the code that makes up the NativeScript framework itself, we also provide a number of [open-source sample apps](https://www.nativescript.org/app-samples-with-code) that you can reference while building your NativeScript application.

## Contributing

We love PRs, and accept them for all of our repositories—even docs! Please follow our [contribution guide](https://www.nativescript.org/contribute) if you want to become part of the project.

## Angular 2

We are [working together with the Google Angular JS team](http://angularjs.blogspot.com/2015/12/building-mobile-apps-with-angular-2-and.html) to make Angular 2.0 work on top of NativeScript. To follow our progress, check out the following links:

- [NativeScript Angular 2.0 plugin](https://www.npmjs.com/package/nativescript-angular) - This plugin is the only thing you need to install in order to enable Angular 2.0 in NativeScript.
- [TodoMVC sample](//github.com/NativeScript/sample-ng-todomvc) - The classic TodoMVC sample implemented with NativeScript and Angular 2.0.

![](https://ga-beacon.appspot.com/UA-111455-24/nativescript/nativescript?pixel) 
