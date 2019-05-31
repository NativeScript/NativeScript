---
nav-title: "Page How-To"
title: "page"
environment: nativescript
description: "Examples for using Page"
previous_url: /ApiReference/ui/page/HOW-TO
---
# Page
Using a page requires the Page module.
{%snippet article-require-page-module%}
### Attaching event handler for the Page loaded event to set bindingContext.
``` XML
<Page loaded="pageLoaded">
  {%raw%}<Label text="{{ name }}" />{%endraw%}
</Page>
```
{%snippet article-set-bindingcontext%}
### Creating and navigating to the created page.
{%snippet article-create-navigate-to-page%}
### Navigating backward is as simple as calling a single method.
{%snippet article-navigating-backward%}
### Pass data to the new page.
{%snippet article-pass-data%}
