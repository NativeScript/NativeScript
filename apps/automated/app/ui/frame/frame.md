---
nav-title: "frame How-To"
title: "frame"
environment: nativescript
description: "Examples for using frame"
previous_url: /ApiReference/ui/frame/HOW-TO
---
# Frame
To perform navigation, you will need a reference to the topmost frame of the application.
{%snippet frame-require%}

### Navigating to a Module
{%snippet frame-navigating%}

### Navigating with a Factory Function
{%snippet frame-factory-func%}

### Navigating with NavigationEntry
{%snippet frame-naventry%}

### Navigating Back
{%snippet frame-back%}

### Back Navigation with BackstackEntry
Using the `BackstackEntry` allows us to navigate back to a specific page.

```XML
<Page xmlns="http://schemas.nativescript.org/tns.xsd" navigatingTo="navigatingTo" class="page">

    <Page.actionBar>
        <ActionBar title="Page 5" icon="" class="action-bar">
        </ActionBar>
    </Page.actionBar>

    <StackLayout class="p-20">
        <Label text="Page 5" class="h1 text-center"/>
        <Button text="back to the first page" tap="onTap" class="btn btn-primary btn-active"/>
    </StackLayout>
</Page>
```
```TypeScript
import {BackstackEntry, Frame} from "ui/frame"

export function backNavigation(args){
    const backstackEntryFirstPage = args.object.page.frame.backStack[0];
    const frame = args.object.page.frame;
    frame.goBack(backstackEntryFirstPage);
}
```
With the help of the Frame we access the page's BackstackEntry by providing the the sequence number - `backStack[<page number>]`. In the example above we will navigate back to the initial page and to do that we need to take the first BackstackEntry as follow: `Frame.topmost().backStack[0]`

> NB: We start counting the pages from 0. If we need to take the entry for the first page we need to take the it while using the 0 index, for the second 1 index, etc.
