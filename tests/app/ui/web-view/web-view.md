---
nav-title: "WebView How-To"
title: "web-view"
environment: nativescript
description: "Examples for using WebView"
previous_url: /ApiReference/ui/web-view/HOW-TO
---
# WebView
Using a WebView requires the web-view module.
{%snippet webview-require%}
### Declaring a WebView.
{%snippet declare-webview-xml%}
### Creating a WebView
{%snippet declare-webview%}
### Using WebView with remote URL
{%snippet webview-url%}
### Using WebView with local file
{%snippet webview-localfile%}
### Using WebView with raw HTML
{%snippet webview-string%}
### Using WebView with gestures
```XML
<Page xmlns="http://schemas.nativescript.org/tns.xsd" navigatingTo="navigatingTo" class="page">
    <Page.actionBar>
        <ActionBar title="My App" icon="" class="action-bar">
        </ActionBar>
    </Page.actionBar>

    <GridLayout>
        <WebView loaded="webviewloaded"  touch="webviewtouch" pan="webviewpan" src="<!DOCTYPE html><html><body><h1>My First Heading</h1><p>My first paragraph.</p></body></html>" />
    </GridLayout>
</Page>
```

```TypeScript
import { EventData } from 'data/observable';
import { Page } from 'ui/page';
import { HelloWorldModel } from './main-view-model';
import { WebView } from "ui/web-view";
import { isAndroid } from "platform"


export function navigatingTo(args: EventData) {

    let page = <Page>args.object;

    page.bindingContext = new HelloWorldModel();
}

export function webviewtouch(args){
    console.log("touch event");
}

export function webviewpan(args){
    console.log("pan gesture");
}

export function webviewloaded(args){
    var webview:WebView = <WebView>args.object;
    if(isAndroid){
        webview.android.getSettings().setDisplayZoomControls(false);
    }
}
```

```JavaScript
var main_view_model_1 = require("./main-view-model");
var platform_1 = require("platform");
function navigatingTo(args) {
    var page = args.object;
    page.bindingContext = new main_view_model_1.HelloWorldModel();
}
exports.navigatingTo = navigatingTo;
function webviewtouch(args) {
    console.log("touch event");
}
exports.webviewtouch = webviewtouch;
function webviewpan(args) {
    console.log("pan gesture");
}
exports.webviewpan = webviewpan;
function webviewloaded(args) {
    var webview = args.object;
    if (platform_1.isAndroid) {
        webview.android.getSettings().setDisplayZoomControls(false);
    }
}
exports.webviewloaded = webviewloaded;
```
>Note: to be able to use gestures in `WebView` component on Android, we should first disabled the zoom control. To do that we could access the `android` property and with the help of  `setDisplayZoomControls` to set this controll to `false`.