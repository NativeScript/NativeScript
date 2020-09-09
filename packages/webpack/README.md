# NativeScript Webpack

This repository contains the code for the @nativescript/webpack plugin which helps in webpacking [NativeScript](https://www.nativescript.org/) apps.

JavaScript code and general asset bundling have been a member of the web developer toolbox for a long time. Tools like Webpack have been providing support for an enjoyable development experience that lets you assemble client-side code from various module sources and formats and then package it together. Most importantly, they allow for page load time optimizations that reduce or parallelize the number of requests a browser makes to the server.

Why bundle scripts in a mobile app though? 

- Fewer filesystem operations on app startup
- Smaller code size
- Tree-shaking
- Preprocessing and interoperability hooks. Webpack provides a way to resolve modules and expressions differently according to its configuration. It also contains a lot of plugins and loaders that let you embed different content in your application or use code written in different programming languages

For more details, see the [NativeScript docs for building with webpack](http://docs.nativescript.org/angular/best-practices/bundling-with-webpack.html).

<!-- TOC depthFrom:2 -->

- [Ingredients](#ingredients)
- [Usage](#usage)
- [Contribute](#contribute)
- [Get Help](#get-help)

<!-- /TOC -->

## Ingredients

* webpack config templates.
* helper functions that place files at the correct locations before packaging apps.
* loaders and plugins for vanilla NativeScript and Angular apps.

## Usage

```sh
$ npm install --save-dev @nativescript/webpack

$ tns run android
or
$ tns run ios
```

## Contribute
We love PRs! Check out the [contributing guidelines](CONTRIBUTING.md) and [instructions for local setup](https://github.com/NativeScript/nativescript-dev-webpack/blob/master/CONTRIBUTING.md#setup). If you want to contribute, but you are not sure where to start - look for [issues labeled `help wanted`](https://github.com/NativeScript/nativescript-dev-webpack/issues?q=is%3Aopen+is%3Aissue+label%3A%22help+wanted%22).

## Get Help 
Please, use [github issues](https://github.com/NativeScript/nativescript-dev-webpack/issues) strictly for [reporting bugs](CONTRIBUTING.md#reporting-bugs) or [requesting features](CONTRIBUTING.md#requesting-features). For general questions and support, check out [Stack Overflow](https://stackoverflow.com/questions/tagged/nativescript) or ask our experts in [NativeScript community Slack channel](http://developer.telerik.com/wp-login.php?action=slack-invitation).
  
![](https://ga-beacon.appspot.com/UA-111455-24/nativescript/nativescript-dev-webpack?pixel) 


