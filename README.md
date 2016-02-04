# NativeScript [![Build Status](https://travis-ci.org/NativeScript/NativeScript.svg)](https://travis-ci.org/NativeScript/NativeScript)

[NativeScript](http://www.nativescript.org) is a framework for building native iOS and Android apps using JavaScript and CSS. NativeScript renders UIs with the native platform’s rendering engine—no [WebViews](http://developer.telerik.com/featured/what-is-a-webview/)—resulting in native-like performance and UX.

NativeScript provides a best-of-both-worlds development experience. Our cross-platform JavaScript modules give you the convenience of writing iOS and Android apps from a single JavaScript codebase, while our runtimes give you the power of accessing native APIs, SDKs, and frameworks when you need them—all without needing to open Xcode or Android Studio. NativeScript was created and is supported by [Telerik](http://www.telerik.com/).

* [Getting Started and Installation](#getting-started-and-installation)
* [Quick Links](#quick-links)
* [Repositories](#repositories)
* [Contributing](#contributing)
* [Angular 2](#angular-2)
* [Why NativeScript?](#why-nativescript)

## Getting Started and Installation

Our [Getting Started Guide](http://docs.nativescript.org/start/getting-started) is a hands-on tutorial that walks you through installing NativeScript and building a real iOS and Android application.

## Quick Links

- [NativeScript’s home page](http://nativescript.org)
- [@NativeScript on Twitter](http://twitter.com/NativeScript) 
- [NativeScript’s Blog](http://nativescript.org/blog)
- [NativeScript’s Community Forum](https://groups.google.com/forum/#!forum/nativescript)
- [NativeScript on Stack Overflow](http://stackoverflow.com/questions/tagged/nativescript)

## Repositories

The NativeScript framework is made up a number of components, all of which are open source and on GitHub. Here are the major ones:

- [The current repo](//github.com/NativeScript/NativeScript/) contains the code of the [NativeScript cross-platform modules](http://docs.nativescript.org/core-concepts/modules), which abstract iOS and Android APIs into JavaScript APIs—e.g. `camera.takePicture()`. The modules are written in TypeScript.
- The [iOS Runtime repo](//github.com/NativeScript/ios-runtime/) contains the code that hosts the iOS app, and allows the JavaScript code of your application to be executed on an iOS device. The iOS runtime is written in a fun mix of C++, Objective-C, and more.
- The [Android Runtime repo](//github.com/NativeScript/android-runtime) contains the code that hosts the Android app, and allows that JavaScript code of your application to be executed on an Android device. The Android runtime is written an even more fun mix of C++ and Java.
- The [NativeScript CLI repo](//github.com/NativeScript/nativescript-cli) contains the command-line interface for creating an application using the NativeScript framework. The CLI is written in TypeScript.
- The [NativeScript Docs repo](//github.com/NativeScript/docs) contain the NativeScript framework documentation which is available on <http://docs.nativescript.org/>. The docs are written in Markdown.

In addition to the code that makes up the NativeScript framework itself, we also provide a number of [open-source sample apps](https://www.nativescript.org/app-samples-with-code) that you can reference while building your NativeScript application.

## Contributing

We love PRs, and accept them for all of our repositories—even docs! Please follow our [contribution guide](https://www.nativescript.org/contribute) if you want to become part of the project.

## Angular 2

We are [working together with the Google Angular JS team](http://angularjs.blogspot.com/2015/12/building-mobile-apps-with-angular-2-and.html) to make Angular 2.0 work on top of NativeScript. To check our progress please see the following links:

- [NativeScript Angular 2.0 plugin](https://www.npmjs.com/package/nativescript-angular) - This plugin is the only thing you need to install in order to enable Angular 2.0 in NativeScript.
- [TodoMVC sample](//github.com/NativeScript/sample-ng-todomvc) - The classic TodoMVC sample implemented with NativeScript and Angular 2.0.

## Why NativeScript?

The NativeScript framework enables you to use a complete stack of cross-platform APIs to write your application code or, if you need to, you can [directly access all platform-specific native APIs](http://docs.nativescript.org/core-concepts/accessing-native-apis-with-javascript) using JavaScript only. That’s right—you can access all native APIs, not only the ones we thought would be useful!

We did not want to create yet another ecosystem around a native cross-platform framework. We wanted to integrate and play well with all existing JavaScript and native iOS/Android ecosystems. That is why we also support [using existing JavaScript libraries](https://github.com/NativeScript/NativeScript/wiki/supported-npm-modules), as well as existing native Objective-C and Java libraries. We want to stress that you *don't need to know Objective-C, Swift, or Java* in order to reuse these libraries—their entire APIs are available in JavaScript with no changes.
  
Because of the features listed above you get some important functionality right out of the box. The first is that applications built using the NativeScript framework support the same accessibility models as native apps. This is important for anyone creating apps that need to meet certain accessibility standards before going live. This is also very useful when you start implementing functional or unit tests for your app. Several existing cross-platform tools like [Appium](http://www.appium.io) already work directly with the NativeScript framework and provide accessibility automation.
  
The second major feature you get out of the box is 0-day support for new native platforms. Because the NativeScript framework  exposes unmodified native APIs and UI components, you can use the latest native APIs and new UI components when Apple, Google or Microsoft updates their mobile platforms.
  
So let’s summarize what the NativeScript framework enables you as of today:

 - Build 100% native cross-platform apps, with a declarative UI, and the ability to implement platform-specific UIs.
 - Share 100% of your code, or use platform-specific APIs, depending on the app you’re building.
 - Code in standards-based ECMAScript 5 JavaScript, or use our [built-in Babel or TypeScript transpilers](http://docs.nativescript.org/core-concepts/transpilers)
 - [Use standards-based CSS syntax for styling](http://docs.nativescript.org/ui/styling).
 - Use [rich data binding](http://docs.nativescript.org/core-concepts/bindings) and existing UI patterns to easily build complex user interfaces.
 - [Reuse any native library](http://docs.nativescript.org/plugins/plugins) available in Objective-C or Java.
 - Reuse any JavaScript library that is not browser-dependent.
 - Reuse the QA tools for accessibility automation to write tests.
 - Use the latest native platform features to create an amazing native user experience.
 - Code in any IDE of your choice to implement your applications’ code using the [NativeScript framework's CLI](http://npmjs.org/nativescript).
 - Use [Telerik Platform](http://platform.telerik.com) and and the full Visual Studio integration to get a rich development experience. Paid support is also available.
   
We hope this gives you a good idea about what you can expect from the NativeScript framework.

![](https://ga-beacon.appspot.com/UA-111455-24/nativescript/nativescript?pixel) 
