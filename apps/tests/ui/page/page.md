---
nav-title: "Page How-To"
title: "Page"
description: "Examples for using Page"
---
# Page
Using a page requires the Page module.
<snippet id='article-require-module'/>
### Attaching event handler for the Page loaded event to set bindingContext.
``` XML
<Page loaded="pageLoaded">
  {%raw%}<Label text="{{ name }}" />{%endraw%}
</Page>
```
<snippet id='article-set-bindingcontext'/>
### Creating and navigating to the created page.
<snippet id='artivle-create-navigate-to-page'/>
### Navigating backward is as simple as calling a single method.
<snippet id='article-navigating-backward'/>
### Pass data to the new page.
<snippet id='article-pass-data'/>
