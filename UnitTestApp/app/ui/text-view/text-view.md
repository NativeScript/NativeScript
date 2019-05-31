---
nav-title: "TextView How-To"
title: "text-view"
environment: nativescript
description: "Examples for using TextView"
previous_url: /ApiReference/ui/text-view/HOW-TO
---
# TextView
Using a TextView requires the text-view module.
{%snippet require-textmodules%}
### Binding two TextViews text property to observable view-model property.
```XML
<Page loaded="pageLoaded">
    <StackLayout orientation="vertical">
        {%raw%}<TextView text="{{ someProperty }}" />
        <TextView text="{{ someProperty }}" />{%endraw%}
    </StackLayout>
</Page>
```
{%snippet observable-declare%}
### Creating a TextView
{%snippet text-view-create%}
### Setting the text of a TextView
{%snippet set-text-value%}
### Binding text property directly to model
{%snippet binding-text-property-textview%}
### Setting the hint of a TextView
{%snippet set-textview-hint%}
### Binding hint property directly to model
{%snippet binding-hint-property-textview%}
### Setting the editable property of a TextView
{%snippet setting-editable-property%}
### Binding editable property directly to model
{%snippet binding-editable-property%}
