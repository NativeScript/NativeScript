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
        <WebView loaded="webViewLoaded"  touch="webViewTouch" pan="webViewPan" src="<!DOCTYPE html><html><body><h1>My First Heading</h1><p>My first paragraph.</p></body></html>" />
    </GridLayout>
</Page>
```

{%snippet web-view-loaded%}

>Note: to be able to use gestures in `WebView` component on Android, we should first disabled the zoom control. To do that we could access the `android` property and with the help of  `setDisplayZoomControls` to set this controll to `false`.
